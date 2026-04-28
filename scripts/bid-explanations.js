function bidExplanationSystemForResult(result = null) {
  const systemId = result?.system || "fiveCardHigh";
  if (systemId === "fiveCardHigh") return globalThis.FiveCardHighBidExplanationsNl || null;
  return null;
}

function currentBidExplanationSystem() {
  return globalThis.FiveCardHighBidExplanationsNl || null;
}

function explainBid(call, index) {
  if (call.bidResult && bidResultMatchesCall(call.bidResult, call.bid)) {
    return explainBidChoiceResult(call.bidResult);
  }
  if (call.recommendedBidResult && !bidResultMatchesCall(call.recommendedBidResult, call.bid)) {
    return explainBidDeviation(call, index);
  }
  return explainBidFallback(call, index);
}

function explainBidDeviation(call, index) {
  const recommended = call.recommendedBidResult;
  const actor = call.seat === "South" ? "Je bod" : `${seatName(call.seat)}s bod`;
  return `${actor} wijkt af van de biedheuristiek. De heuristiek stelde ${formatCall(recommended.bid)} voor: ${explainBidChoiceResult(recommended)} Gekozen bod: ${explainBidFallback(call, index)}`;
}

function explainBidFallback(call, index) {
  if (isPass(call.bid)) return t("bidExplanationPass");
  if (isDouble(call.bid)) return t("bidExplanationDouble");
  if (isRedouble(call.bid)) return t("bidExplanationRedouble");
  const context = auctionContextAt(index);
  const detail = bidMeaning(call.bid, context);
  return t(detail.key, { detail: detail.text });
}

function bidResultMatchesCall(result, call) {
  return sameCall(result?.bid, call);
}

function explainBidChoiceResult(result) {
  const system = bidExplanationSystemForResult(result);
  if (system?.explainBidChoiceResult) return system.explainBidChoiceResult(result);
  return t("bidExplanationContinuation", { detail: result?.reason || "Geen bieduitleg beschikbaar voor dit biedsysteem." });
}

function bidMeaning(bid, context) {
  const system = currentBidExplanationSystem();
  if (system?.bidMeaning) return system.bidMeaning(bid, context);
  return { key: "bidExplanationContinuation", text: bid?.strain === "NT" ? "natuurlijk sans-atout vervolg." : `natuurlijk vervolg in ${suitName(bid?.strain)}.` };
}

function recommendedBidReason(resultOrBid, seat) {
  if (resultOrBid?.bid && resultOrBid.ruleId) return explainBidChoiceResult(resultOrBid);
  const bid = resultOrBid;
  if (isPass(bid)) return t("bidExplanationPass");
  if (isDouble(bid)) return t("bidExplanationDouble");
  if (isRedouble(bid)) return t("bidExplanationRedouble");
  const detail = bidMeaning(bid, auctionContextForCall(seat));
  return t(detail.key, { detail: detail.text });
}

function auctionContextForCall(seat) {
  const previous = state.auction;
  return auctionContextFromPreviousCalls(previous, seat);
}

function auctionContextAt(index) {
  const call = state.auction[index];
  const previous = state.auction.slice(0, index);
  return auctionContextFromPreviousCalls(previous, call.seat);
}

function auctionContextFromPreviousCalls(previous, seat) {
  const partnershipCalls = previous.filter((prior) => teamOf(prior.seat) === teamOf(seat) && isContractBid(prior.bid));
  const opponentCalls = previous.filter((prior) => teamOf(prior.seat) !== teamOf(seat) && isContractBid(prior.bid));
  return {
    partnershipCalls,
    opponentCalls,
    openingBid: partnershipCalls[0]?.bid || null,
    lastPartnerBid: [...previous].reverse().find((prior) => prior.seat === partnerOf(seat) && isContractBid(prior.bid))?.bid || null
  };
}

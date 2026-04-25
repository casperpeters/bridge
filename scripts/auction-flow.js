function continueAuction() {
  if (state.phase !== "bidding") return;
  const seat = seatAt(state.turnIndex);
  renderAll();
  if (auctionComplete()) {
    finishAuction();
    return;
  }
  if (seat === "South") {
    setStatus("yourCall");
    return;
  }
  window.setTimeout(() => {
    const bidResult = chooseBidResult(seat);
    makeBid(seat, bidResult.bid, bidResult);
  }, 560);
}

function makeBid(seat, bid, bidResult = null) {
  if (state.phase !== "bidding" || seat !== seatAt(state.turnIndex)) return;
  const typedBid = normalizeBid(bid);
  if (!typedBid) return;
  if (isContractBid(typedBid) && !isBidHigher(typedBid, highestBid())) return;
  if (isDouble(typedBid) && !canDouble(seat)) return;
  if (isRedouble(typedBid) && !canRedouble(seat)) return;
  const call = {
    seat,
    bid: typedBid,
    stop: seat === "South" && state.pendingStop,
    alert: seat === "South" && state.pendingAlert
  };
  if (bidResult && sameCall(bidResult.bid, typedBid)) call.bidResult = bidResult;
  state.auction.push(call);
  state.pendingStop = false;
  state.pendingAlert = false;
  state.turnIndex = (state.turnIndex + 1) % 4;
  renderAll();
  continueAuction();
}

function chooseBid(seat) {
  return chooseBidResult(seat).bid;
}

function chooseBidResult(seat) {
  return bridgeRules.chooseFiveCardHighBidResult({
    hand: state.hands[seat],
    auction: state.auction,
    seat,
    vulnerability: state.vulnerability
  });
}

function chooseRecommendedBid(seat) {
  return chooseRecommendedBidResult(seat).bid;
}

function chooseRecommendedBidResult(seat) {
  return chooseBidResult(seat);
}

function canDouble(seat) {
  const contractCall = highestBidCall();
  if (!contractCall || teamOf(contractCall.seat) === teamOf(seat)) return false;
  const contract = highestBid();
  return Boolean(contract && !contract.doubled && !contract.redoubled);
}

function canRedouble(seat) {
  const contractCall = highestBidCall();
  if (!contractCall || teamOf(contractCall.seat) !== teamOf(seat)) return false;
  const contract = highestBid();
  return Boolean(contract?.doubled && !contract.redoubled);
}

function bidEquals(bid, level, strain) {
  return isContractBid(bid) && bid.level === level && bid.strain === strain;
}

function auctionComplete() {
  return bridgeRules.auctionComplete(state.auction);
}

function finishAuction() {
  const bid = highestBid();
  if (!bid) {
    finishPassedOutHand();
    return;
  }
  state.contract = bid;
  state.declarer = findDeclarer(bid);
  state.dummy = partnerOf(state.declarer);
  state.leader = leftOf(state.declarer);
  state.turnIndex = seats.indexOf(state.leader);
  state.phase = "playing";
  renderAll();
  setStatus("lead", { leader: state.leader, declarer: state.declarer, dummy: state.dummy });
  continuePlay();
}

function finishPassedOutHand() {
  state.phase = "complete";
  state.contract = null;
  state.declarer = null;
  state.dummy = null;
  state.leader = null;
  state.finalScore = calculateBridgeScore({
    contract: null
  });
  state.finalScore.scoreText = `${t("northSouth")} 0 ${separatorDot} ${t("eastWest")} 0`;
  state.finalScore.made = 0;
  state.finalScore.defenders = 0;
  setStatus("fourPasses");
  renderAll();
}

function autoCompleteAuction() {
  let callCount = 0;
  while (state.phase === "bidding" && !auctionComplete() && callCount < 80) {
    const seat = seatAt(state.turnIndex);
    const bidResult = legalAutoBidResult(seat);
    state.auction.push({
      seat,
      bid: normalizeBid(bidResult.bid),
      bidResult,
      stop: false,
      alert: false
    });
    state.turnIndex = (state.turnIndex + 1) % 4;
    callCount += 1;
  }
  if (state.phase !== "bidding" || !auctionComplete()) return;

  const bid = highestBid();
  if (!bid) {
    finishPassedOutHand();
    return;
  }
  state.contract = bid;
  state.declarer = findDeclarer(bid);
  state.dummy = partnerOf(state.declarer);
  state.leader = leftOf(state.declarer);
  state.turnIndex = seats.indexOf(state.leader);
  state.phase = "playing";
  setStatus("lead", { leader: state.leader, declarer: state.declarer, dummy: state.dummy });
}

function legalAutoBid(seat) {
  return legalAutoBidResult(seat).bid;
}

function legalAutoBidResult(seat) {
  const result = chooseBidResult(seat);
  const bid = result.bid;
  if (!bid) return { bid: bridgeRules.Pass(), ruleId: "fiveCardHigh.pass.noAction" };
  if (isContractBid(bid) && isBidHigher(bid, highestBid())) return result;
  if (isDouble(bid) && canDouble(seat)) return result;
  if (isRedouble(bid) && canRedouble(seat)) return result;
  if (isPass(bid)) return result;
  return { ...result, bid: bridgeRules.Pass(), ruleId: "fiveCardHigh.legalize.pass" };
}

function findDeclarer(contract) {
  return bridgeRules.findDeclarer(state.auction, contract);
}

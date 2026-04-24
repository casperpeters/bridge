function renderAuction() {
  els.auctionLog.innerHTML = "";
  renderBidExplanations();
  const headers = ["North", "East", "South", "West"];
  headers.forEach((seat) => {
    const cell = document.createElement("div");
    cell.className = "auction-cell";
    cell.innerHTML = `<strong>${seat.slice(0, 1)}</strong>`;
    els.auctionLog.appendChild(cell);
  });
  const offset = state.dealerIndex;
  for (let i = 0; i < offset; i++) {
    els.auctionLog.appendChild(emptyAuctionCell());
  }
  state.auction.forEach((call) => {
    const cell = document.createElement("div");
    cell.className = "auction-cell";
    cell.appendChild(auctionCallContent(call));
    els.auctionLog.appendChild(cell);
  });
}

function auctionCallContent(call) {
  const wrapper = document.createElement("span");
  wrapper.className = "auction-call";
  if (call.stop) wrapper.appendChild(auctionBadge(t("stop"), "stop"));
  const textEl = document.createElement("span");
  textEl.textContent = formatCall(call.bid);
  wrapper.appendChild(textEl);
  if (call.alert) wrapper.appendChild(auctionBadge(t("alert"), "alert"));
  return wrapper;
}

function auctionBadge(label, kind) {
  const badge = document.createElement("span");
  badge.className = `auction-badge ${kind}`;
  badge.textContent = label;
  return badge;
}

function emptyAuctionCell() {
  const cell = document.createElement("div");
  cell.className = "auction-cell";
  cell.textContent = separatorDot;
  return cell;
}

function renderBidExplanations() {
  els.bidExplanations.hidden = !state.developerMode || !state.auction.length;
  els.bidExplanations.innerHTML = "";
  if (els.bidExplanations.hidden) return;

  state.auction.forEach((call, index) => {
    const item = document.createElement("div");
    item.className = "bid-explanation";
    const callText = formatCall(call.bid);
    item.innerHTML = `<strong>${seatName(call.seat)} ${callText}</strong><br>${explainBid(call, index)}`;
    els.bidExplanations.appendChild(item);
  });
}

function explainBid(call, index) {
  if (isPass(call.bid)) return withBidExplanationSource(t("bidExplanationPass"));
  if (isDouble(call.bid)) return withBidExplanationSource(t("bidExplanationDouble"));
  if (isRedouble(call.bid)) return withBidExplanationSource(t("bidExplanationRedouble"));
  const context = auctionContextAt(index);
  const detail = bidMeaning(call.bid, context);
  return withBidExplanationSource(t(detail.key, { detail: detail.text }));
}

function withBidExplanationSource(explanation) {
  return `${explanation} ${t("bidExplanationSource")}`;
}

function auctionContextAt(index) {
  const call = state.auction[index];
  const previous = state.auction.slice(0, index);
  const partnershipCalls = previous.filter((prior) => teamOf(prior.seat) === teamOf(call.seat) && isContractBid(prior.bid));
  const opponentCalls = previous.filter((prior) => teamOf(prior.seat) !== teamOf(call.seat) && isContractBid(prior.bid));
  return {
    partnershipCalls,
    opponentCalls,
    openingBid: partnershipCalls[0]?.bid || null,
    lastPartnerBid: [...previous].reverse().find((prior) => prior.seat === partnerOf(call.seat) && isContractBid(prior.bid))?.bid || null
  };
}

function bidMeaning(bid, context) {
  if (!context.partnershipCalls.length && !context.opponentCalls.length) {
    return { key: "bidExplanationOpening", text: openingBidMeaning(bid) };
  }
  if (context.opponentCalls.length && !context.partnershipCalls.length) {
    return { key: "bidExplanationCompetitive", text: competitiveBidMeaning(bid) };
  }
  const artificial = artificialBidMeaning(bid, context);
  if (artificial) return { key: "bidExplanationArtificial", text: artificial };
  if (context.partnershipCalls.length === 1) {
    return { key: "bidExplanationResponse", text: responseBidMeaning(bid, context.lastPartnerBid || context.openingBid) };
  }
  return { key: "bidExplanationContinuation", text: continuationBidMeaning(bid) };
}

function openingBidMeaning(bid) {
  if (bid.level === 1 && bid.strain === "NT") return "Vijfkaart Hoog: 15-17 punten, SA-verdeling.";
  if (bid.level === 2 && bid.strain === "NT") return "Vijfkaart Hoog: 20-22 punten, SA-verdeling.";
  if (bid.level === 2 && bid.strain === "C") return "Vijfkaart Hoog: sterke kunstmatige opening, 20+ met een kleur of 23+ met SA-verdeling.";
  if (bid.level === 2 && ["D", "H", "S"].includes(bid.strain)) return `zwakke twee in ${suitName(bid.strain)}, ongeveer 5-10 HCP en een zeskaart.`;
  if (bid.level === 3 && bid.strain !== "NT") return `preemptieve opening in ${suitName(bid.strain)}, meestal een lange kleur en beperkte kracht.`;
  if (bid.level === 1 && (bid.strain === "H" || bid.strain === "S")) return `vijfkaart ${suitName(bid.strain)} met openingskracht.`;
  if (bid.level === 1 && bid.strain === "D") return "Vijfkaart Hoog: 12-19 punten met een vierkaart of langer ruiten.";
  if (bid.level === 1 && bid.strain === "C") return "Vijfkaart Hoog: 12-19 punten, kan vanaf een tweekaart klaveren.";
  return "natuurlijk openingsbod.";
}

function artificialBidMeaning(bid, context) {
  const opening = context.openingBid;
  if (!opening) return null;
  if (bidEquals(opening, 1, "NT")) {
    if (bidEquals(bid, 2, "C")) return "Stayman, vraagt de openaar naar een vierkaart hoog.";
    if (bidEquals(bid, 2, "D")) return "Jacoby-transfer, vraagt de openaar harten te bieden.";
    if (bidEquals(bid, 2, "H")) return "Jacoby-transfer, vraagt de openaar schoppen te bieden.";
  }
  if (bidEquals(opening, 2, "NT")) {
    if (bidEquals(bid, 3, "C")) return "Stayman, vraagt de openaar naar een vierkaart hoog.";
    if (bidEquals(bid, 3, "D")) return "transfer, vraagt de openaar harten te bieden.";
    if (bidEquals(bid, 3, "H")) return "transfer, vraagt de openaar schoppen te bieden.";
  }
  if (bidEquals(opening, 2, "C") && bidEquals(bid, 2, "D")) return "afwachtend antwoord op sterke 2K.";
  return null;
}

function responseBidMeaning(bid, partnerBid) {
  if (!partnerBid) return continuationBidMeaning(bid);
  if (partnerBid.strain !== "NT" && bid.strain === partnerBid.strain) return `steun voor partners ${suitName(partnerBid.strain)}.`;
  if (bid.strain === "NT") return "gebalanceerd antwoord, zonder duidelijke fit of nieuwe kleur.";
  return `natuurlijk antwoord in ${suitName(bid.strain)}.`;
}

function continuationBidMeaning(bid) {
  if (bid.strain === "NT") return "natuurlijk sans-atout vervolg.";
  return `natuurlijk vervolg in ${suitName(bid.strain)}.`;
}

function competitiveBidMeaning(bid) {
  if (bid.strain === "NT") return "natuurlijk sans-atout volgbod, met dekking en extra waarden.";
  return `natuurlijk volgbod in ${suitName(bid.strain)}.`;
}

function renderBidControls() {
  els.bidControls.innerHTML = "";
  els.bidControls.classList.toggle("active-bid-box", state.phase === "bidding" && seatAt(state.turnIndex) === "South");
  if (state.phase !== "bidding" || seatAt(state.turnIndex) !== "South") {
    els.bidControls.setAttribute("aria-hidden", "true");
    return;
  }
  els.bidControls.removeAttribute("aria-hidden");
  const recommendedBid = state.guidanceMode ? chooseRecommendedBid("South") : null;

  for (let level = 1; level <= 7; level++) {
    for (const strain of biddingBoxStrains) {
      const bid = { level, strain };
      const button = biddingButton(formatBid(bid), "bid");
      button.classList.add(`strain-${strain.toLowerCase()}`);
      button.disabled = !isBidHigher(bid, highestBid());
      if (sameCall(recommendedBid, bid)) button.classList.add("recommended-action");
      button.addEventListener("click", () => makeBid("South", bid));
      els.bidControls.appendChild(button);
    }
  }

  const stop = biddingButton(t("stop"), "stop");
  stop.setAttribute("aria-label", t("stopAria"));
  stop.classList.toggle("active-action", state.pendingStop);
  stop.addEventListener("click", () => {
    state.pendingStop = !state.pendingStop;
    renderBidControls();
  });

  const double = biddingButton(t("double"), "double");
  double.disabled = !canDouble("South");
  if (sameCall(recommendedBid, "Double")) double.classList.add("recommended-action");
  double.addEventListener("click", () => makeBid("South", "Double"));

  const redouble = biddingButton(t("redouble"), "redouble");
  redouble.disabled = !canRedouble("South");
  if (sameCall(recommendedBid, "Redouble")) redouble.classList.add("recommended-action");
  redouble.addEventListener("click", () => makeBid("South", "Redouble"));

  const alert = biddingButton(t("alert"), "alert");
  alert.setAttribute("aria-label", t("alertAria"));
  alert.classList.toggle("active-action", state.pendingAlert);
  alert.addEventListener("click", () => {
    state.pendingAlert = !state.pendingAlert;
    renderBidControls();
  });

  const pass = biddingButton(t("pass"), "pass");
  if (sameCall(recommendedBid, "Pass")) pass.classList.add("recommended-action");
  pass.addEventListener("click", () => makeBid("South", "Pass"));

  els.bidControls.append(stop, double, redouble, alert, pass);
}

function biddingButton(label, className) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = label;
  return button;
}

function renderAuction() {
  els.auctionLog.innerHTML = "";
  renderSeatAuctionCalls();
  renderBidExplanations();
  const headers = ["North", "East", "South", "West"];
  headers.forEach((seat) => {
    const cell = document.createElement("div");
    cell.className = "auction-cell";
    cell.classList.toggle("auction-active-seat", isAuctionReady() && seatAt(state.turnIndex) === seat);
    const label = document.createElement("strong");
    label.textContent = seatName(seat).slice(0, 1);
    cell.appendChild(label);
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

function renderSeatAuctionCalls() {
  if (!seatAuctionEls) return;
  seats.forEach((seat) => {
    const container = seatAuctionEls[seat];
    if (!container) return;
    container.innerHTML = "";
    const calls = state.auction.filter((call) => call.seat === seat);
    container.classList.toggle("auction-active-seat", isAuctionReady() && seatAt(state.turnIndex) === seat);
    container.classList.toggle("empty-seat-auction", !calls.length);
    if (!calls.length) {
      const placeholder = document.createElement("span");
      placeholder.className = "seat-auction-placeholder";
      placeholder.textContent = separatorDot;
      container.appendChild(placeholder);
      return;
    }
    calls.forEach((call) => container.appendChild(auctionCallContent(call)));
  });
}

function auctionCallContent(call) {
  const wrapper = document.createElement("span");
  wrapper.className = "auction-call";
  if (call.stop) wrapper.appendChild(auctionBadge(t("stop"), "stop"));
  const textEl = document.createElement("span");
  textEl.className = `auction-call-token ${auctionCallStyleClasses(call.bid)}`;
  if (isContractBid(call.bid)) {
    appendBidContent(textEl, call.bid, "auction-strain-symbol");
  } else {
    textEl.textContent = formatCall(call.bid);
  }
  wrapper.appendChild(textEl);
  if (call.alert) wrapper.appendChild(auctionBadge(t("alert"), "alert"));
  return wrapper;
}

function auctionCallStyleClasses(bid) {
  if (isContractBid(bid)) return `bid strain-${bid.strain.toLowerCase()}`;
  if (isPass(bid)) return "pass";
  if (isRedouble(bid)) return "redouble";
  if (isDouble(bid)) return "double";
  return "";
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
  els.bidExplanations.hidden = state.phase !== "bidding" || !state.developerMode || !state.auction.length;
  els.bidExplanations.innerHTML = "";
  if (els.bidExplanations.hidden) return;

  const heading = document.createElement("h3");
  heading.className = "review-section-title";
  heading.textContent = t("bidExplanations");
  els.bidExplanations.appendChild(heading);

  state.auction.forEach((call, index) => {
    const item = document.createElement("div");
    item.className = "bid-explanation";
    const callText = formatCall(call.bid);
    const title = document.createElement("strong");
    title.textContent = `${seatName(call.seat)} ${callText}`;
    item.append(title, document.createElement("br"), BridgeGlossary.linkifyText(explainBid(call, index)));
    els.bidExplanations.appendChild(item);
  });
}

function renderBidControls() {
  els.bidControls.innerHTML = "";
  const auctionReady = isAuctionReady();
  const isSouthTurn = auctionReady && seatAt(state.turnIndex) === "South";
  const showWaitingBidBox = auctionReady;
  const showBidControls = isSouthTurn || showWaitingBidBox;
  els.bidControls.classList.toggle("active-bid-box", isSouthTurn);
  els.bidControls.classList.toggle("waiting-bid-box", showWaitingBidBox && !isSouthTurn);
  els.auctionPanel?.classList.toggle("active-action-panel", isSouthTurn);
  if (els.bidControlsTitle) {
    els.bidControlsTitle.hidden = true;
    els.bidControlsTitle.textContent = "";
  }
  els.bidControls.setAttribute("aria-label", t("bidBox"));
  if (!showBidControls) {
    els.bidControls.setAttribute("aria-hidden", "true");
    return;
  }
  els.bidControls.removeAttribute("aria-hidden");
  els.bidControls.setAttribute("aria-disabled", String(!isSouthTurn));
  const southBidResult = isSouthTurn ? chooseRecommendedBidResult("South") : null;
  const recommendedBid = state.guidanceMode && isSouthTurn ? southBidResult?.bid || null : null;

  for (let level = 1; level <= 7; level++) {
    for (const strain of biddingBoxStrains) {
      const bid = bridgeRules.Bid(level, strain);
      const button = biddingButton("", "bid");
      appendBidContent(button, bid, "bid-symbol");
      button.classList.add(`strain-${strain.toLowerCase()}`);
      button.disabled = !isSouthTurn || !isBidHigher(bid, highestBid());
      if (sameCall(recommendedBid, bid)) button.classList.add("recommended-action");
      button.addEventListener("click", () => makeBid("South", bid, southBidResult));
      els.bidControls.appendChild(button);
    }
  }

  const double = biddingButton(t("double"), "double");
  double.disabled = !isSouthTurn || !canDouble("South");
  const doubleBid = bridgeRules.Double();
  if (sameCall(recommendedBid, doubleBid)) double.classList.add("recommended-action");
  double.addEventListener("click", () => makeBid("South", doubleBid, southBidResult));

  const pass = biddingButton(t("pass"), "pass");
  pass.disabled = !isSouthTurn;
  const passBid = bridgeRules.Pass();
  if (sameCall(recommendedBid, passBid)) pass.classList.add("recommended-action");
  pass.addEventListener("click", () => makeBid("South", passBid, southBidResult));

  const redouble = biddingButton(t("redouble"), "redouble");
  redouble.disabled = !isSouthTurn || !canRedouble("South");
  const redoubleBid = bridgeRules.Redouble();
  if (sameCall(recommendedBid, redoubleBid)) redouble.classList.add("recommended-action");
  redouble.addEventListener("click", () => makeBid("South", redoubleBid, southBidResult));

  const primaryActions = document.createElement("div");
  primaryActions.className = "bid-primary-actions";
  primaryActions.append(double, pass, redouble);

  const advancedActions = document.createElement("div");
  advancedActions.className = "bid-advanced-actions";
  advancedActions.hidden = !state.showAdvancedBidControls;

  const stop = biddingButton(t("stop"), "stop");
  stop.setAttribute("aria-label", t("stopAria"));
  stop.disabled = !isSouthTurn;
  stop.classList.toggle("active-action", state.pendingStop);
  stop.addEventListener("click", () => {
    state.pendingStop = !state.pendingStop;
    renderBidControls();
  });

  const alert = biddingButton(t("alert"), "alert");
  alert.setAttribute("aria-label", t("alertAria"));
  alert.disabled = !isSouthTurn;
  alert.classList.toggle("active-action", state.pendingAlert);
  alert.addEventListener("click", () => {
    state.pendingAlert = !state.pendingAlert;
    renderBidControls();
  });
  advancedActions.append(stop, alert);

  const advancedToggle = biddingButton(state.showAdvancedBidControls ? "\u2303" : "\u2304", "bid-advanced-toggle");
  advancedToggle.setAttribute("aria-expanded", String(state.showAdvancedBidControls));
  advancedToggle.setAttribute("aria-label", state.showAdvancedBidControls ? t("advancedBidControlsClose") : t("advancedBidControlsOpen"));
  advancedToggle.title = advancedToggle.getAttribute("aria-label");
  advancedToggle.disabled = !isSouthTurn;
  advancedToggle.addEventListener("click", () => {
    state.showAdvancedBidControls = !state.showAdvancedBidControls;
    saveSettings();
    renderBidControls();
  });

  els.bidControls.append(primaryActions, advancedActions, advancedToggle);
}

function biddingButton(label, className) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = label;
  return button;
}

function isAuctionReady() {
  return state.phase === "bidding" && !state.animateDeal;
}

function appendBidContent(parent, bid, symbolClassName) {
  parent.append(document.createTextNode(String(bid.level)));
  const symbol = document.createElement("span");
  symbol.className = symbolClassName;
  symbol.textContent = suitSymbols[bid.strain];
  parent.appendChild(symbol);
  if (bid.redoubled) {
    parent.append(document.createTextNode(" xx"));
  } else if (bid.doubled) {
    parent.append(document.createTextNode(" x"));
  }
}

function renderAuction() {
  els.auctionLog.innerHTML = "";
  renderBidExplanations();
  const headers = ["North", "East", "South", "West"];
  headers.forEach((seat) => {
    const cell = document.createElement("div");
    cell.className = "auction-cell";
    cell.classList.toggle("auction-active-seat", state.phase === "bidding" && seatAt(state.turnIndex) === seat);
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
  els.bidExplanations.hidden = !state.developerMode || !state.auction.length;
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
  const isSouthTurn = state.phase === "bidding" && seatAt(state.turnIndex) === "South";
  els.bidControls.classList.toggle("active-bid-box", isSouthTurn);
  if (els.bidControlsTitle) els.bidControlsTitle.hidden = !isSouthTurn;
  if (!isSouthTurn) {
    els.bidControls.setAttribute("aria-hidden", "true");
    return;
  }
  els.bidControls.removeAttribute("aria-hidden");
  const southBidResult = chooseRecommendedBidResult("South");
  const recommendedBid = state.guidanceMode ? southBidResult?.bid || null : null;

  for (let level = 1; level <= 7; level++) {
    for (const strain of biddingBoxStrains) {
      const bid = bridgeRules.Bid(level, strain);
      const button = biddingButton("", "bid");
      appendBidContent(button, bid, "bid-symbol");
      button.classList.add(`strain-${strain.toLowerCase()}`);
      button.disabled = !isBidHigher(bid, highestBid());
      if (sameCall(recommendedBid, bid)) button.classList.add("recommended-action");
      button.addEventListener("click", () => makeBid("South", bid, southBidResult));
      els.bidControls.appendChild(button);
    }
  }

  const double = biddingButton(t("double"), "double");
  double.disabled = !canDouble("South");
  const doubleBid = bridgeRules.Double();
  if (sameCall(recommendedBid, doubleBid)) double.classList.add("recommended-action");
  double.addEventListener("click", () => makeBid("South", doubleBid, southBidResult));

  const pass = biddingButton(t("pass"), "pass");
  const passBid = bridgeRules.Pass();
  if (sameCall(recommendedBid, passBid)) pass.classList.add("recommended-action");
  pass.addEventListener("click", () => makeBid("South", passBid, southBidResult));

  const redouble = biddingButton(t("redouble"), "redouble");
  redouble.disabled = !canRedouble("South");
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
  stop.classList.toggle("active-action", state.pendingStop);
  stop.addEventListener("click", () => {
    state.pendingStop = !state.pendingStop;
    renderBidControls();
  });

  const alert = biddingButton(t("alert"), "alert");
  alert.setAttribute("aria-label", t("alertAria"));
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

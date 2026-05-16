(function registerBridgeAuctionRenderer(root) {
  "use strict";

  const modules = root.BridgeAppModules = root.BridgeAppModules || {};

  modules.registerAuctionRenderer = function registerAuctionRenderer(runtime) {
    const { actions, constants, dom, els, helpers, render, rules, state } = runtime;
    const { biddingBoxStrains, seats, separatorDot, suitSymbols } = constants;
    const { seatAuctionEls } = dom;
    const bridgeRules = rules;
    const {
      formatCall,
      highestBid,
      isBidHigher,
      isContractBid,
      isDouble,
      isPass,
      isRedouble,
      sameCall,
      seatAt,
      seatName,
      t
    } = helpers;
    const canDouble = (...args) => actions.canDouble(...args);
    const canRedouble = (...args) => actions.canRedouble(...args);
    const chooseRecommendedBidResult = (...args) => actions.chooseRecommendedBidResult(...args);
    const explainBid = (...args) => actions.explainBid(...args);
    const makeBid = (...args) => actions.makeBid(...args);
    const saveSettings = (...args) => actions.saveSettings(...args);
    const scrollBidExplanationIntoView = (...args) => actions.scrollBidExplanationIntoView(...args);

function renderAuction() {
  els.auctionLog.innerHTML = "";
  renderSeatAuctionCalls();
  renderBidExplanations();
  els.auctionLog.appendChild(auctionHistoryTable());
}

function auctionHistoryTable() {
  const wrapper = document.createElement("div");
  wrapper.className = "review-trick-table-wrap";

  const table = document.createElement("table");
  table.className = "review-trick-table auction-history-table";
  table.setAttribute("aria-label", t("auction"));

  const headers = seats;
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  headers.forEach((seat) => {
    const header = document.createElement("th");
    header.scope = "col";
    header.textContent = seatName(seat);
    headerRow.appendChild(header);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  const offset = state.dealerIndex;
  const cellCount = Math.max(4, offset + state.auction.length + (isAuctionReady() ? 1 : 0));
  const rowCount = Math.ceil(cellCount / 4);
  const callByPosition = new Map();
  state.auction.forEach((call, index) => {
    callByPosition.set(offset + callByPosition.size, { call, index });
  });

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const row = document.createElement("tr");
    for (let seatIndex = 0; seatIndex < headers.length; seatIndex++) {
      const position = rowIndex * 4 + seatIndex;
      const seat = headers[seatIndex];
      const entry = callByPosition.get(position);
      row.appendChild(auctionHistoryCell(entry, position, position < offset, seat));
    }
    tbody.appendChild(row);
  }

  table.appendChild(tbody);
  wrapper.appendChild(table);
  return wrapper;
}

function auctionHistoryCell(entry, position, isDealerOffset, seat) {
  const cell = document.createElement("td");
  cell.className = "auction-history-cell";
  const nextCallPosition = state.dealerIndex + state.auction.length;
  cell.classList.toggle("auction-active-seat", isAuctionReady() && seatAt(state.turnIndex) === seat && position === nextCallPosition);
  if (entry) {
    cell.appendChild(auctionCallContent(entry.call, entry.index));
  } else {
    cell.textContent = isDealerOffset ? separatorDot : "-";
  }
  return cell;
}

function renderSeatAuctionCalls() {
  if (!seatAuctionEls) return;
  seats.forEach((seat) => {
    const container = seatAuctionEls[seat];
    if (!container) return;
    container.innerHTML = "";
    const calls = state.auction.filter((call) => call.seat === seat);
    const isActiveSeat = isAuctionReady() && seatAt(state.turnIndex) === seat;
    container.classList.toggle("auction-active-seat", isActiveSeat);
    container.classList.toggle("empty-seat-auction", !calls.length);
    if (!calls.length && !isActiveSeat) {
      const placeholder = document.createElement("span");
      placeholder.className = "seat-auction-placeholder";
      placeholder.textContent = separatorDot;
      container.appendChild(placeholder);
      return;
    }
    calls.forEach((call) => container.appendChild(auctionCallContent(call)));
    if (isActiveSeat) container.appendChild(nextAuctionCallPlaceholder(seat));
  });
}

function nextAuctionCallPlaceholder(seat) {
  const placeholder = document.createElement("span");
  placeholder.className = "seat-auction-next-call";
  placeholder.setAttribute("aria-label", `${seatName(seat)} is aan de beurt`);
  return placeholder;
}

function auctionCallContent(call, index = null) {
  const wrapper = document.createElement("span");
  wrapper.className = "auction-call";
  if (Number.isInteger(index)) {
    wrapper.dataset.bidIndex = String(index);
    wrapper.setAttribute("role", "button");
    wrapper.tabIndex = 0;
    wrapper.setAttribute("aria-label", `Ga naar bieduitleg voor bod ${index + 1}: ${seatName(call.seat)} ${formatCall(call.bid)}`);
    wrapper.addEventListener("click", () => scrollBidExplanationIntoView(index));
    wrapper.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      scrollBidExplanationIntoView(index);
    });
  }
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

function renderBidExplanations() {
  const canShowBidExplanations = ["bidding", "contract-reveal", "playing", "complete"].includes(state.phase);
  els.bidExplanations.hidden = !canShowBidExplanations || !state.developerMode || !state.auction.length;
  els.bidExplanations.innerHTML = "";
  if (els.bidExplanations.hidden) return;

  const heading = document.createElement("h3");
  heading.className = "review-section-title";
  heading.textContent = t("bidExplanations");
  els.bidExplanations.appendChild(heading);

  [...state.auction].reverse().forEach((call, reversedIndex) => {
    const index = state.auction.length - 1 - reversedIndex;
    const item = document.createElement("div");
    item.className = "bid-explanation";
    item.dataset.bidExplanationIndex = String(index);
    const callText = formatCall(call.bid);
    const bidIndex = index + 1;
    const title = document.createElement("strong");
    title.className = "bid-explanation-title";
    const indexBadge = document.createElement("span");
    indexBadge.className = "bid-explanation-index";
    indexBadge.textContent = String(bidIndex);
    indexBadge.setAttribute("aria-label", `Bod ${bidIndex}`);
    const callLabel = document.createElement("span");
    callLabel.textContent = `${seatName(call.seat)} ${callText}`;
    title.append(indexBadge, document.createTextNode(" "), callLabel);
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
  els.bidControls.classList.toggle("bid-box-expanded", state.showAdvancedBidControls);
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
  const recommendedBid = state.guidanceMode && isSouthTurn && !actions.interactiveExerciseSuppressesGuidance?.("bid")
    ? southBidResult?.bid || null
    : null;

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
  render.renderInteractiveExerciseBidQuestion?.();
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

    Object.assign(render, {
      appendBidContent,
      renderAuction,
      renderBidControls
    });
  };
})(typeof globalThis !== "undefined" ? globalThis : this);

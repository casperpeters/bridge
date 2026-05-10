(function registerBridgeAuctionFlow(root) {
  "use strict";

  const modules = root.BridgeAppModules = root.BridgeAppModules || {};

  modules.registerAuctionFlow = function registerAuctionFlow(runtime) {
    const { actions, constants, helpers, render, rules, state, timers, transitions } = runtime;
    const { seats, separatorDot } = constants;
    const bridgeRules = rules;
    const BridgeStateTransitions = transitions;
    const {
      calculateBridgeScore,
      formatBid,
      highestBid,
      highestBidCall,
      isBidHigher,
      isContractBid,
      isDouble,
      isPass,
      isRedouble,
      normalizeBid,
      sameCall,
      seatAt,
      t,
      teamOf
    } = helpers;
    const enterContractReveal = (...args) => actions.enterContractReveal(...args);
    const prepareContractFromAuction = (...args) => actions.prepareContractFromAuction(...args);
    const renderAll = (...args) => render.renderAll(...args);
    const setStatus = (...args) => actions.setStatus(...args);

function continueAuction() {
  if (state.phase !== "bidding") return;
  if (state.animateDeal) return;
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
  const scheduledFlowGeneration = timers.flowGeneration;
  window.setTimeout(() => {
    if (scheduledFlowGeneration !== timers.flowGeneration) return;
    const bidResult = chooseBidResult(seat);
    makeBid(seat, bidResult.bid, bidResult);
  }, 560);
}

function makeBid(seat, bid, bidResult = null) {
  if (state.phase !== "bidding" || seat !== seatAt(state.turnIndex)) return;
  if (state.animateDeal) return;
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
  if (bidResult && !sameCall(bidResult.bid, typedBid)) call.recommendedBidResult = bidResult;
  Object.assign(state, BridgeStateTransitions.applyBidTransition(state, { ...call, seatCount: seats.length }));
  renderAll();
  continueAuction();
}

function chooseBid(seat) {
  return chooseBidResult(seat).bid;
}

function chooseBidResult(seat) {
  return bridgeRules.chooseBid({
    systemId: state.biddingSystemId,
    hand: state.hands[seat],
    auction: state.auction,
    seat,
    vulnerability: state.vulnerability,
    agreements: state.biddingAgreements
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
  prepareContractFromAuction(bid);
  enterContractReveal();
}

function finishPassedOutHand() {
  const finalScore = calculateBridgeScore({ contract: null });
  finalScore.scoreText = `${t("northSouth")} 0 ${separatorDot} ${t("eastWest")} 0`;
  finalScore.made = 0;
  finalScore.defenders = 0;
  Object.assign(state, BridgeStateTransitions.finishPassedOutAuctionTransition(state, { finalScore }));
  setStatus("fourPasses");
  renderAll();
}

function autoCompleteAuction({ revealContract = false } = {}) {
  let callCount = 0;
  while (state.phase === "bidding" && !auctionComplete() && callCount < 80) {
    const seat = seatAt(state.turnIndex);
    const bidResult = legalAutoBidResult(seat);
    Object.assign(state, BridgeStateTransitions.applyBidTransition(state, {
      seat,
      bid: normalizeBid(bidResult.bid),
      bidResult,
      stop: false,
      alert: false,
      seatCount: seats.length
    }));
    callCount += 1;
  }
  if (state.phase !== "bidding" || !auctionComplete()) return;

  const bid = highestBid();
  if (!bid) {
    finishPassedOutHand();
    return;
  }
  prepareContractFromAuction(bid);
  if (revealContract) {
    enterContractReveal();
    return;
  }
  state.phase = "playing";
  setStatus("lead", { leader: state.leader, declarer: state.declarer, dummy: state.dummy });
}

function legalAutoBid(seat) {
  return legalAutoBidResult(seat).bid;
}

function legalAutoBidResult(seat) {
  const result = chooseBidResult(seat);
  const bid = result.bid;
  const systemId = result.system || state.biddingSystemId;
  if (!bid) return { bid: bridgeRules.Pass(), ruleId: `${systemId}.pass.noAction`, system: systemId };
  if (isContractBid(bid) && isBidHigher(bid, highestBid())) return result;
  if (isDouble(bid) && canDouble(seat)) return result;
  if (isRedouble(bid) && canRedouble(seat)) return result;
  if (isPass(bid)) return result;
  return { ...result, bid: bridgeRules.Pass(), ruleId: `${systemId}.legalize.pass`, system: systemId };
}

function findDeclarer(contract) {
  return bridgeRules.findDeclarer(state.auction, contract);
}

    Object.assign(actions, {
      auctionComplete,
      autoCompleteAuction,
      bidEquals,
      canDouble,
      canRedouble,
      chooseBid,
      chooseBidResult,
      chooseRecommendedBid,
      chooseRecommendedBidResult,
      continueAuction,
      findDeclarer,
      finishAuction,
      finishPassedOutHand,
      legalAutoBid,
      legalAutoBidResult,
      makeBid
    });
  };
})(typeof globalThis !== "undefined" ? globalThis : this);

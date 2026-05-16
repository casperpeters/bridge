(function initBridgeRulesBiddingFiveCardHighCompetitive(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const deps = isCommonJs
    ? {
        core: require("../../../core.js"),
        auction: require("../../../auction.js"),
        context: require("../../common/context.js"),
        valuation: require("../../common/valuation.js"),
        result: require("../../common/result.js"),
        conventions: require("./conventions.js"),
        rebids: require("./rebids.js"),
        continuation: require("./continuation.js"),
        takeoutDouble: require("./competitive/takeout-double/index.js"),
        preemptDefense: require("./competitive/preempt-defense/index.js"),
        overcalls: require("./competitive/overcalls/index.js"),
        advancer: require("./competitive/advancer/index.js")
      }
    : root.BridgeRulesParts || {};
  const api = factory(
    deps.core,
    deps.auction,
    deps.context || deps.biddingFiveCardHighContext,
    deps.valuation || deps.biddingFiveCardHighValuation,
    deps.result || deps.biddingCommonResult,
    deps.conventions || deps.biddingFiveCardHighConventions,
    deps.rebids || deps.biddingFiveCardHighRebids,
    deps.continuation || deps.biddingFiveCardHighContinuation,
    deps.takeoutDouble || deps.biddingFiveCardHighCompetitiveTakeoutDouble,
    deps.preemptDefense || deps.biddingFiveCardHighCompetitivePreemptDefense,
    deps.overcalls || deps.biddingFiveCardHighCompetitiveOvercalls,
    deps.advancer || deps.biddingFiveCardHighCompetitiveAdvancer
  );
  if (isCommonJs) module.exports = api;
  root.BridgeRulesParts = root.BridgeRulesParts || {};
  root.BridgeRulesParts.biddingFiveCardHighCompetitive = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesBiddingFiveCardHighCompetitive(core, auction, contextHelpers, valuationHelpers, resultHelpers, conventionHelpers, rebidRules, continuationRules, takeoutDoubleRules, preemptDefenseRules, overcallRules, advancerRules) {
  "use strict";

  const {
    biddingSystems,
    handShape,
    isTeamVulnerable,
    partnerOf,
    teamOf
  } = core;
  const {
    Pass,
    Redouble,
    bidEquals,
    gameLevel,
    isPass,
    isDouble,
    isRedouble,
    isContractBid,
    highestBidCall,
    highestBid,
    canRedoubleFromAuction,
    partnershipContractCalls,
    lastPartnerContractCall
  } = auction;
  const { ruleOf20OpeningContext } = valuationHelpers;
  const { bidChoiceResult } = resultHelpers;
  const { countAces, supportLengthForOpening } = conventionHelpers;
  const { isSingleRaiseInviteFiveCardHigh } = rebidRules;
  const {
    fiveCardHighAuctionPhases,
    auctionContextForFiveCardHigh
  } = contextHelpers;
  const { chooseConstructiveContinuationResult } = continuationRules;
  const {
    chooseTakeoutDoubleInitialAction,
    chooseTakeoutDoubleAction,
    describeTakeoutDoubleAction
  } = takeoutDoubleRules;
  const {
    choosePreemptDefenseAction,
    describePreemptDefenseAction,
    isWeakTwoOpponentOpening,
    isPreemptOpponentOpening
  } = preemptDefenseRules;
  const {
    chooseOvercallAction,
    describeOvercallAction
  } = overcallRules;
  const {
    chooseAdvancerAction,
    describeAdvancerAction
  } = advancerRules;

  function fiveCardHighBidChoiceResult(bid, ruleName, confidence, reason, extra = {}) {
    return bidChoiceResult(biddingSystems.fiveCardHigh, bid, ruleName, confidence, reason, extra);
  }

  function chooseFallbackBid(steps, fallback = Pass()) {
    for (const step of steps) {
      const candidate = step();
      if (candidate) return candidate;
    }
    return fallback;
  }

  function partnershipNonPassCalls(auction, seat) {
    return auction.filter((call) =>
      teamOf(call.seat) === teamOf(seat) &&
      (isContractBid(call.bid) || isDouble(call.bid) || isRedouble(call.bid))
    );
  }

  function chooseCompetitiveFiveCardHighBid(hand, auction, seat, vulnerability = "none") {
    const state = competitiveBiddingState(hand, auction, seat, vulnerability);
    const continuationResult = chooseInterferenceAwareContinuationResult(state);
    if (continuationResult) return continuationResult.bid;
    return chooseCompetitiveBidTargetFromState(state);
  }

  function chooseCompetitiveBidResult({ hand = [], auction = [], seat, vulnerability = "none", context } = {}) {
    const state = competitiveBiddingState(hand, auction, seat, vulnerability, context);
    const continuationResult = chooseInterferenceAwareContinuationResult(state);
    if (continuationResult) return continuationResult;
    const chosenBid = chooseCompetitiveBidTargetFromState(state);
    const base = competitiveBidResultBase(state);

    if (isRedouble(chosenBid)) {
      return describeRedoubleBidChoice(chosenBid, state.shape, auction, seat, base);
    }
    if (isDouble(chosenBid)) {
      return describeDoubleBidChoice(chosenBid, state.shape, hand, auction, seat, base);
    }
    const takeoutDoubleResult = describeTakeoutDoubleAction?.({
      chosenBid,
      shape: state.shape,
      hand,
      auction,
      seat,
      vulnerability,
      base
    });
    if (takeoutDoubleResult) return takeoutDoubleResult;
    if (isPass(chosenBid)) {
      return describeCompetitivePassBidChoice(state.shape, auction, seat, vulnerability, base);
    }
    if (!isContractBid(chosenBid)) {
      return fiveCardHighBidChoiceResult(chosenBid, "pass.unknownCall", "basic", "The bidding engine did not recognize a contract action.", base);
    }
    return describeCompetitiveFiveCardHighBidChoice(chosenBid, state.shape, hand, auction, seat, vulnerability, base);
  }

  function chooseCompetitiveBidTargetFromState(state) {
    return chooseFallbackBid([
      () => chooseRedoubleAfterPartnerOpeningDouble(state),
      () => chooseTakeoutDoubleAction(state),
      () => !state.partnershipNonPassCalls.length ? chooseInitialCompetitiveAction(state) : null,
      () => chooseAdvancerAction(state),
      () => chooseTakeoutDoubleInitialAction(state)
    ]);
  }

  function competitiveBidResultBase({ hand, shape, vulnerability, seat }) {
    return {
      hcp: shape.hcp,
      points: shape.points,
      aceCount: countAces(hand),
      balanced: shape.balanced,
      counts: { ...shape.counts },
      vulnerability,
      vulnerable: seat ? isTeamVulnerable(teamOf(seat), vulnerability) : false,
      ...ruleOf20OpeningContext(shape, hand)
    };
  }

  function competitiveBiddingState(hand, auction, seat, vulnerability, context) {
    return {
      hand,
      auction,
      seat,
      vulnerability,
      context: context || auctionContextForFiveCardHigh(auction, seat),
      shape: handShape(hand),
      partnershipCalls: partnershipContractCalls(auction, seat),
      partnershipNonPassCalls: partnershipNonPassCalls(auction, seat),
      lastBid: highestBid(auction),
      lastCall: auction[auction.length - 1] || null,
      highestBidCall: highestBidCall(auction)
    };
  }

  function chooseInitialCompetitiveAction(state) {
    const lastBid = state.lastBid;
    if (!lastBid || !isContractBid(lastBid)) return Pass();
    if (isWeakTwoOpponentOpening(lastBid) || isPreemptOpponentOpening(lastBid)) {
      return choosePreemptDefenseAction(state) || Pass();
    }
    return chooseFallbackBid([
      () => chooseOvercallAction({ ...state, stage: "beforeTakeout" }),
      () => chooseTakeoutDoubleInitialAction(state),
      () => chooseOvercallAction({ ...state, stage: "afterTakeout" })
    ]);
  }

  function chooseRedoubleAfterPartnerOpeningDouble({ shape, partnershipCalls, auction, seat }) {
    const context = partnerOpeningDoubleContext(auction, seat, partnershipCalls);
    return context && shape.hcp >= 10 && !hasOpeningFit(shape, context.partnerBid) ? Redouble() : null;
  }

  function chooseInterferenceAwareContinuationResult(state) {
    const continuation = interferenceAwareContinuationContext(state.context);
    if (!continuation) return null;
    return chooseConstructiveContinuationResult({
      hand: state.hand,
      auction: state.auction,
      seat: state.seat,
      vulnerability: state.vulnerability,
      context: constructiveContinuationContextForInterference(state.context, continuation),
      baseExtras: interferenceContinuationBase(state.context)
    });
  }

  function interferenceAwareContinuationContext(context) {
    if (!context?.interfered || !context.ourSideOwnsCurrentContract || context.partnershipCalls.length < 2) return null;
    const openingCall = context.openingCall;
    const responseCall = context.responseCall;
    const openerRebidCall = context.openerRebidCall;
    if (!openingCall?.bid || !responseCall?.bid) return null;

    if (openingCall.seat === context.seat && isDirectRaiseOfOpening(openingCall.bid, responseCall.bid)) {
      return { kind: "openerAfterRaise", phase: fiveCardHighAuctionPhases.openerRebid };
    }
    if (
      openingCall.seat === partnerOf(context.seat) &&
      openerRebidCall?.bid &&
      isSingleRaiseInviteFiveCardHigh(responseCall.bid, openerRebidCall.bid)
    ) {
      return { kind: "responderAfterSingleRaiseInvite", phase: fiveCardHighAuctionPhases.responderRebid };
    }
    return null;
  }

  function constructiveContinuationContextForInterference(context, continuation) {
    return {
      ...context,
      phase: continuation.phase,
      uncontested: true
    };
  }

  function isDirectRaiseOfOpening(openingBid, responseBid) {
    return (
      openingBid?.level === 1 &&
      openingBid.strain &&
      openingBid.strain !== "NT" &&
      responseBid?.strain === openingBid.strain &&
      responseBid.level > openingBid.level &&
      responseBid.level < gameLevel(openingBid.strain)
    );
  }

  function interferenceContinuationBase(context) {
    return {
      interfered: true,
      interferenceKind: context.interferenceKind,
      interferenceCallCount: context.opponentNonPassCalls?.length || 0
    };
  }

  function partnerOpeningDoubleContext(auction, seat, partnershipCalls = partnershipContractCalls(auction, seat)) {
    if (!seat || !canRedoubleFromAuction(auction, seat)) return null;
    const lastCall = auction[auction.length - 1] || null;
    if (!lastCall || !isDouble(lastCall) || teamOf(lastCall.seat) === teamOf(seat)) return null;
    if (partnershipCalls.length !== 1) return null;

    const partnerCall = partnershipCalls[0];
    if (partnerCall.seat !== partnerOf(seat) || !isNaturalOneLevelSuitOpening(partnerCall.bid)) return null;

    const firstContractCall = auction.find((call) => isContractBid(call.bid)) || null;
    if (firstContractCall !== partnerCall) return null;
    if (highestBidCall(auction) !== partnerCall) return null;

    return {
      partnerCall,
      partnerBid: partnerCall.bid,
      doubleCall: lastCall
    };
  }

  function isNaturalOneLevelSuitOpening(candidate) {
    return candidate?.level === 1 && candidate.strain && candidate.strain !== "NT";
  }

  function openingSupportThreshold(partnerBid) {
    return partnerBid?.strain && partnerBid.strain !== "NT" ? supportLengthForOpening(partnerBid.strain) : Infinity;
  }

  function hasOpeningFit(shape, partnerBid) {
    return partnerBid?.strain && partnerBid.strain !== "NT" &&
      (shape.counts[partnerBid.strain] || 0) >= openingSupportThreshold(partnerBid);
  }

  function describeDoubleBidChoice(chosenBid, shape, hand, auction, seat, base) {
    const preemptDefenseResult = describePreemptDefenseAction({ chosenBid, shape, hand, auction, seat, base });
    if (preemptDefenseResult) return preemptDefenseResult;
    return describeTakeoutDoubleAction({ chosenBid, shape, hand, auction, seat, base });
  }

  function describeRedoubleBidChoice(chosenBid, shape, auction, seat, base) {
    const context = partnerOpeningDoubleContext(auction, seat);
    if (!context) {
      return fiveCardHighBidChoiceResult(chosenBid, "competitive.redouble", "basic", "Redouble with extra values after the opponents doubled partner's side.", base);
    }

    const partnerSuit = context.partnerBid.strain;
    const support = shape.counts[partnerSuit] || 0;
    const supportThreshold = openingSupportThreshold(context.partnerBid);
    return fiveCardHighBidChoiceResult(chosenBid, "competitive.redoubleAfterPartnerOpeningDouble", "basic", "Redouble after partner's opening was doubled with 10+ points, no fit, and possible penalty interest.", {
      ...base,
      category: "competitive",
      minimumHcp: 10,
      partnerSuit,
      support,
      supportThreshold,
      noFit: support < supportThreshold,
      penaltyInterest: true
    });
  }

  function describeCompetitiveFiveCardHighBidChoice(chosenBid, shape, hand, auction, seat, vulnerability, base) {
    const partnershipNonPassActions = partnershipNonPassCalls(auction, seat);
    if (!partnershipNonPassActions.length) {
      const preemptDefenseResult = describePreemptDefenseAction({ chosenBid, shape, hand, auction, seat, base });
      if (preemptDefenseResult) return preemptDefenseResult;

      const overcallResult = describeOvercallAction({ chosenBid, shape, hand, auction, seat, vulnerability, base });
      if (overcallResult) return overcallResult;
    }

    const advancerResult = describeAdvancerAction({ chosenBid, shape, hand, auction, seat, vulnerability, base });
    if (advancerResult) return advancerResult;

    return describeGenericCompetitiveChoice(chosenBid, shape, auction, seat, vulnerability, base);
  }

  function describeCompetitivePassBidChoice(shape, auction, seat, vulnerability, base) {
    return fiveCardHighBidChoiceResult(Pass(), "pass.competitiveNoAction", "basic", "Pass because there is no responsible overcall, raise, notrump action, or double in the current competitive auction.", {
      ...base,
      category: "competitive",
      vulnerable: seat ? isTeamVulnerable(teamOf(seat), vulnerability) : false
    });
  }

  function describeGenericCompetitiveChoice(chosenBid, shape, auction, seat, vulnerability, base) {
    const lastBid = highestBid(auction);
    const lastPartnerCall = lastPartnerContractCall(auction, seat);
    const vulnerable = seat ? isTeamVulnerable(teamOf(seat), vulnerability) : false;
    const extra = {
      ...base,
      category: "competitive",
      suit: chosenBid.strain,
      length: shape.counts[chosenBid.strain] || 0,
      opponentSuit: lastBid?.strain || null,
      partnerSuit: lastPartnerCall?.bid?.strain || null,
      vulnerable
    };
    if (chosenBid.strain === "NT") {
      return fiveCardHighBidChoiceResult(chosenBid, "competitive.notrump", "basic", "Bid notrump competitively with balanced strength and a stopper.", extra);
    }
    return fiveCardHighBidChoiceResult(chosenBid, "competitive.newSuit", "basic", "Compete naturally in a new suit.", extra);
  }

  // Compatibility exports: new competitive bidding tests should prefer chooseCompetitiveBidResult.
  return {
    chooseCompetitiveBidResult,
    chooseCompetitiveFiveCardHighBid,
    chooseInterferenceAwareContinuationResult,
    describeRedoubleBidChoice,
    describeDoubleBidChoice,
    describeCompetitiveFiveCardHighBidChoice,
    describeTakeoutDoubleAction
  };
});

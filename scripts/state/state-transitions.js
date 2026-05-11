(function initBridgeStateTransitions(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const transitions = factory();
  if (isCommonJs) module.exports = transitions;
  root.BridgeStateTransitions = transitions;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeStateTransitions() {
  "use strict";

  function startPreparedHandTransition({ dealerIndex, vulnerability, hands, originalHands, practice = null }) {
    return {
      dealerIndex,
      vulnerability,
      hands,
      originalHands,
      practice,
      phase: "bidding",
      turnIndex: dealerIndex,
      auction: [],
      contract: null,
      declarer: null,
      dummy: null,
      leader: null,
      currentTrick: [],
      awaitingTrickAdvance: false,
      trickAdvanceArmed: false,
      trickClearAnimating: false,
      pendingTrickWinner: null,
      tricks: { NS: 0, EW: 0 },
      trickHistory: [],
      reviewTrickCursor: null,
      reviewCursor: null,
      playExplanations: [],
      playPlan: null,
      playPlanKey: null,
      animateDeal: true,
      finalScore: null,
      scoreOverviewDismissed: false,
      feedbackStatus: null,
      illegalActionFeedback: null,
      lessonActionFeedback: null,
      pendingStop: false,
      pendingAlert: false
    };
  }

  function applyBidTransition(state, { seat, bid, stop = false, alert = false, bidResult = null, recommendedBidResult = null, seatCount = 4 }) {
    const call = { seat, bid, stop, alert };
    if (bidResult) call.bidResult = bidResult;
    if (recommendedBidResult) call.recommendedBidResult = recommendedBidResult;
    return {
      auction: [...state.auction, call],
      pendingStop: false,
      pendingAlert: false,
      turnIndex: (state.turnIndex + 1) % seatCount
    };
  }

  function finishAuctionTransition(state, { contract, declarer, dummy, leader, seats }) {
    return {
      contract,
      declarer,
      dummy,
      leader,
      turnIndex: seats.indexOf(leader),
      currentTrick: [],
      awaitingTrickAdvance: false,
      trickAdvanceArmed: false,
      trickClearAnimating: false,
      pendingTrickWinner: null
    };
  }

  function finishPassedOutAuctionTransition(state, { finalScore }) {
    return {
      phase: "complete",
      scoreOverviewDismissed: false,
      reviewTrickCursor: null,
      reviewCursor: null,
      contract: null,
      declarer: null,
      dummy: null,
      leader: null,
      finalScore
    };
  }

  function applyCardPlayTransition(state, { seat, card, cardId = card?.id, ruleResult = null, explanation = "" }) {
    const playedCardId = cardId || card?.id;
    const playExplanation = explanation
      ? [{
          trick: state.trickHistory.length + 1,
          seat,
          card,
          ruleId: ruleResult?.ruleId || null,
          confidence: ruleResult?.confidence || null,
          recommendedCard: ruleResult?.card || null,
          text: explanation
        }]
      : [];

    return {
      hands: {
        ...state.hands,
        [seat]: state.hands[seat].filter((item) => item.id !== playedCardId)
      },
      currentTrick: [...state.currentTrick, { seat, card, ruleId: ruleResult?.ruleId || null }],
      playExplanations: [...state.playExplanations, ...playExplanation],
      illegalActionFeedback: null,
      lessonActionFeedback: null
    };
  }

  function advanceCompletedTrickTransition(state, { winner, winningTeam, seats }) {
    return {
      awaitingTrickAdvance: false,
      trickAdvanceArmed: false,
      trickClearAnimating: false,
      pendingTrickWinner: null,
      tricks: {
        ...state.tricks,
        [winningTeam]: state.tricks[winningTeam] + 1
      },
      trickHistory: [
        ...state.trickHistory,
        {
          winner,
          cards: [...state.currentTrick],
          number: state.trickHistory.length + 1
        }
      ],
      currentTrick: [],
      turnIndex: seats.indexOf(winner)
    };
  }

  function hasContractContext(state) {
    return Boolean(state.contract && state.declarer && state.dummy && state.leader);
  }

  function enterContractRevealTransition(state) {
    if (!hasContractContext(state)) return null;
    return {
      phase: "contract-reveal"
    };
  }

  function startPlayFromContractRevealTransition(state) {
    if (state.phase !== "contract-reveal" || !hasContractContext(state)) return null;
    return {
      phase: "playing"
    };
  }

  function acknowledgeLessonBoardStepTransition(state, step) {
    if (!step || step.gate === "none") return state.lessonBoardAcknowledged || [];
    const acknowledged = state.lessonBoardAcknowledged || [];
    if (acknowledged.includes(step.id)) return acknowledged;
    return [...acknowledged, step.id];
  }

  function finishHandTransition(state, { finalScore }) {
    return {
      phase: "complete",
      scoreOverviewDismissed: false,
      reviewTrickCursor: null,
      reviewCursor: null,
      finalScore
    };
  }

  return {
    startPreparedHandTransition,
    applyBidTransition,
    finishAuctionTransition,
    finishPassedOutAuctionTransition,
    applyCardPlayTransition,
    advanceCompletedTrickTransition,
    enterContractRevealTransition,
    startPlayFromContractRevealTransition,
    acknowledgeLessonBoardStepTransition,
    finishHandTransition
  };
});

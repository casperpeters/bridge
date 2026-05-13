(function initBridgeRulesCardPlayPlanFollowingCommon(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const deps = isCommonJs
    ? {
        core: require("../../core.js"),
        playMechanics: require("../../play-mechanics.js"),
        playPlan: require("../../play-plan.js"),
        cardPlayCommon: require("../common.js")
      }
    : {
        core: root.BridgeRulesParts?.core,
        playMechanics: root.BridgeRulesParts?.playMechanics,
        playPlan: root.BridgeRulesParts?.playPlan,
        cardPlayCommon: root.BridgeRulesParts?.cardPlayCommon
      };
  const api = factory(deps.core, deps.playMechanics, deps.playPlan, deps.cardPlayCommon);
  if (isCommonJs) module.exports = api;
  root.BridgeRulesParts = root.BridgeRulesParts || {};
  root.BridgeRulesParts.cardPlayPlanFollowingCommon = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesCardPlayPlanFollowingCommon(core, playMechanics, playPlan, cardPlayCommon) {
  "use strict";

  if (!core) throw new Error("BridgeRules card-play plan-following cardPlayPlanFollowingCommon missing core dependency");
  if (!playMechanics) throw new Error("BridgeRules card-play plan-following cardPlayPlanFollowingCommon missing play-mechanics dependency");
  if (!playPlan) throw new Error("BridgeRules card-play plan-following cardPlayPlanFollowingCommon missing play-plan dependency");
  if (!cardPlayCommon) throw new Error("BridgeRules card-play plan-following cardPlayPlanFollowingCommon missing common dependency");

  const {
    suits,
    rankOrder,
    compareLowCards,
    lowestCard,
    highestCard,
    teamOf,
    partnerOf
  } = core;
  const { beats, currentWinningPlay } = playMechanics;
  const {
    cardsInSuit,
    hasRank,
    lowestSmallCardBelow,
    playedCardsFrom,
    visibleTopWinnerRanks,
    finesseCandidate,
    longSuitRuffEntryCandidates
  } = playPlan;
  const { cardPlayResult } = cardPlayCommon;

  function describePlayPlanFallback({ priority, hand, currentTrick, seat, legal }) {
      if (!priority) return null;
      const fallback = {
        priority,
        reason: "notPlayableNow",
        seat
      };
      if (currentTrick.length) {
        const leadSuit = currentTrick[0].card.suit;
        fallback.leadSuit = leadSuit;
        if (cardsInSuit(hand, leadSuit).length && priority.suit && priority.suit !== leadSuit) {
          fallback.reason = "followSuit";
          return fallback;
        }
        if (priority.leadSeat && priority.leadSeat !== seat) {
          fallback.reason = "needsOtherHand";
          fallback.waitingForSeat = priority.leadSeat;
          return fallback;
        }
        if (priority.targetSeat && priority.targetSeat !== seat && priority.kind !== "discardLoserOnWinner") {
          fallback.reason = "needsOtherHand";
          fallback.waitingForSeat = priority.targetSeat;
          return fallback;
        }
        fallback.reason = "finishCurrentTrick";
        return fallback;
      }

      if (priority.leadSeat && priority.leadSeat !== seat) {
        fallback.reason = "needsOtherHand";
        fallback.waitingForSeat = priority.leadSeat;
        return fallback;
      }
      if (priority.firstSeat && priority.firstSeat !== seat) {
        fallback.reason = "needsOtherHand";
        fallback.waitingForSeat = priority.firstSeat;
        return fallback;
      }
      if (priority.longSeat && priority.longSeat !== seat && priority.shortSeat !== seat) {
        fallback.reason = "needsOtherHand";
        fallback.waitingForSeat = priority.longSeat;
        return fallback;
      }
      if (priority.suit && !cardsInSuit(legal, priority.suit).length) {
        fallback.reason = "noPlanSuitCard";
        return fallback;
      }
      return fallback;
    }



  function withPlayPlanFallback(result, decision) {
      if (!result || result.planPriority || !decision?.fallback) return result;
      return {
        ...result,
        planFallback: decision.fallback
      };
    }



  function planFallbackOnly(fallback) {
      if (!fallback) return null;
      return {
        planFallbackOnly: true,
        fallback
      };
    }



  function legalPlanCard(card, legal) {
        if (!card) return null;
        return legal.find((item) => item.id === card.id) || null;
      }

  function choosePlanEndgameRunoutPlay({ priority, seat, legal }) {
      const step = priority?.sequence?.[0];
      if (!step || step.seat !== seat) return null;
      const card = legalPlanCard(legal.find((item) => item.id === step.cardId), legal);
      if (!card) return null;
      return cardPlayResult(
        card,
        "playPlan.endgameRunout",
        priority.confidence || "basic",
        "Follow the visible play plan by starting the endgame runout sequence.",
        {
          planPriority: priority,
          contractType: priority.contractType,
          trump: priority.trump,
          sequence: priority.sequence,
          remainingTricks: priority.remainingTricks,
          suit: step.suit,
          rank: step.rank,
          leadSuit: step.leadSuit || null,
          targetSeat: step.targetSeat || null,
          winnerSeat: step.winnerSeat || null,
          nextStep: priority.sequence?.[1] || null,
          action: step.action
        }
      );
    }



  return {
    describePlayPlanFallback,
    withPlayPlanFallback,
    planFallbackOnly,
    legalPlanCard,
    choosePlanEndgameRunoutPlay
  };
});

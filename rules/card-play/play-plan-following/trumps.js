(function initBridgeRulesCardPlayPlanFollowingTrumps(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const deps = isCommonJs
    ? {
        core: require("../../core.js"),
        playMechanics: require("../../play-mechanics.js"),
        playPlan: require("../../play-plan.js"),
        cardPlayCommon: require("../common.js"), followingCommon: require("./common.js")
      }
    : {
        core: root.BridgeRulesParts?.core,
        playMechanics: root.BridgeRulesParts?.playMechanics,
        playPlan: root.BridgeRulesParts?.playPlan,
        cardPlayCommon: root.BridgeRulesParts?.cardPlayCommon, followingCommon: root.BridgeRulesParts?.cardPlayPlanFollowingCommon
      };
  const api = factory(deps.core, deps.playMechanics, deps.playPlan, deps.cardPlayCommon, deps.followingCommon);
  if (isCommonJs) module.exports = api;
  root.BridgeRulesParts = root.BridgeRulesParts || {};
  root.BridgeRulesParts.cardPlayPlanFollowingTrumps = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesCardPlayPlanFollowingTrumps(core, playMechanics, playPlan, cardPlayCommon, followingCommon) {
  "use strict";

  if (!core) throw new Error("BridgeRules card-play plan-following cardPlayPlanFollowingTrumps missing core dependency");
  if (!playMechanics) throw new Error("BridgeRules card-play plan-following cardPlayPlanFollowingTrumps missing play-mechanics dependency");
  if (!playPlan) throw new Error("BridgeRules card-play plan-following cardPlayPlanFollowingTrumps missing play-plan dependency");
  if (!cardPlayCommon) throw new Error("BridgeRules card-play plan-following cardPlayPlanFollowingTrumps missing common dependency");

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
  const { legalPlanCard } = followingCommon || {};

  function choosePlanDrawTrumpsPlay({ priority, contract, legal, seat }) {
      const trump = contract?.strain === "NT" ? null : contract?.strain;
      if (!trump || priority.suit !== trump) return null;
      if (priority.roundLimit && (priority.playedTrumpRounds || 0) >= priority.roundLimit) return null;

      const trumpCards = cardsInSuit(legal, trump);
      if (priority.preserveSeat === seat && trumpCards.length <= (priority.preserveTrumpCount || 0)) return null;
      const card = legalPlanCard(highestCard(trumpCards), legal);
      if (!card) return null;

      return cardPlayResult(
        card,
        "playPlan.drawTrumps",
        priority.confidence || "basic",
        "Follow the visible play plan by drawing trumps.",
        {
          planPriority: priority,
          suit: trump,
          trumpLength: priority.trumpLength,
          missingHonors: priority.missingHonors,
          timing: priority.timing,
          delayReason: priority.delayReason || null,
          delaySuit: priority.delaySuit || null,
          roundLimit: priority.roundLimit ?? null,
          playedTrumpRounds: priority.playedTrumpRounds || 0,
          preserveSeat: priority.preserveSeat || null,
          preserveTrumpCount: priority.preserveTrumpCount || 0,
          trumpControl: priority.trumpControl || null,
          action: "drawTrumps"
        }
      );
    }



  function choosePlanTrumpEntryForRepeatedFinessePlay({ priority, seat, legal }) {
      if (seat !== priority.fromSeat) return null;
      const trumpCards = cardsInSuit(legal, priority.trump);
      const card = priority.entryLeadRank
        ? trumpCards.find((item) => item.rank === priority.entryLeadRank)
        : lowestCard(trumpCards);
      if (!card) return null;

      return cardPlayResult(
        card,
        "playPlan.useTrumpEntriesForRepeatedFinesse",
        priority.confidence || "basic",
        "Follow the visible play plan by using a trump entry before repeating the finesse.",
        {
          planPriority: priority,
          trump: priority.trump,
          entrySeat: priority.entrySeat,
          entryRank: priority.entryRank,
          entryLeadRank: priority.entryLeadRank,
          fromSeat: priority.fromSeat,
          finesseSuit: priority.finesseSuit,
          finesseRank: priority.finesseRank,
          repeatFinesseRank: priority.repeatFinesseRank,
          missingHonor: priority.missingHonor,
          action: "leadTrumpEntryToFinesseHand"
        }
      );
    }



  function choosePlanTrumpEntryForRepeatedFinesseInTrickPlay({ priority, currentTrick, seat, legal, winning }) {
      if (!currentTrick.length || currentTrick[0].card.suit !== priority.trump) return null;
      if (seat !== priority.entrySeat) return null;

      const trumpCards = cardsInSuit(legal, priority.trump);
      const card = trumpCards.find((item) => item.rank === priority.entryRank);
      if (!card) return null;
      if (winning && teamOf(winning.seat) !== teamOf(seat) && !beats(card, winning.card, priority.trump, priority.trump)) return null;

      return cardPlayResult(
        card,
        "playPlan.useTrumpEntriesForRepeatedFinesse",
        priority.confidence || "basic",
        "Follow the visible play plan by taking the trump entry needed to repeat the finesse.",
        {
          planPriority: priority,
          trump: priority.trump,
          entrySeat: priority.entrySeat,
          entryRank: priority.entryRank,
          entryLeadRank: priority.entryLeadRank,
          fromSeat: priority.fromSeat,
          finesseSuit: priority.finesseSuit,
          finesseRank: priority.finesseRank,
          repeatFinesseRank: priority.repeatFinesseRank,
          missingHonor: priority.missingHonor,
          action: "takeTrumpEntryForFinesse"
        }
      );
    }



  function choosePlanDrawTrumpsInTrickPlay({ priority, contract, currentTrick, seat, legal, winning }) {
      const trump = contract?.strain === "NT" ? null : contract?.strain;
      if (!trump || priority.suit !== trump || !currentTrick.length || currentTrick[0].card.suit !== trump) return null;
      if (priority.roundLimit && (priority.playedTrumpRounds || 0) >= priority.roundLimit) return null;

      const trumpCards = cardsInSuit(legal, trump);
      if (!trumpCards.length) return null;
      if (priority.preserveSeat === seat && trumpCards.length <= (priority.preserveTrumpCount || 0)) return null;
      if (winning && teamOf(winning.seat) === teamOf(seat)) return null;

      const winningTrumps = winning
        ? trumpCards.filter((card) => beats(card, winning.card, trump, trump)).sort(compareLowCards)
        : [];
      const card = winningTrumps[0] || lowestCard(trumpCards);
      if (!card) return null;

      return cardPlayResult(
        card,
        "playPlan.drawTrumps",
        priority.confidence || "basic",
        "Follow the visible play plan by continuing the trump-drawing round.",
        {
          planPriority: priority,
          suit: trump,
          trumpLength: priority.trumpLength,
          missingHonors: priority.missingHonors,
          timing: priority.timing,
          delayReason: priority.delayReason || null,
          delaySuit: priority.delaySuit || null,
          roundLimit: priority.roundLimit ?? null,
          playedTrumpRounds: priority.playedTrumpRounds || 0,
          preserveSeat: priority.preserveSeat || null,
          preserveTrumpCount: priority.preserveTrumpCount || 0,
          trumpControl: priority.trumpControl || null,
          action: "continueDrawTrumps"
        }
      );
    }



  return {
    choosePlanDrawTrumpsPlay,
    choosePlanTrumpEntryForRepeatedFinessePlay,
    choosePlanTrumpEntryForRepeatedFinesseInTrickPlay,
    choosePlanDrawTrumpsInTrickPlay
  };
});

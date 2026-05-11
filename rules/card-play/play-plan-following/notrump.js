(function initBridgeRulesCardPlayPlanFollowingNotrump(root, factory) {
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
  root.BridgeRulesParts.cardPlayPlanFollowingNotrump = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesCardPlayPlanFollowingNotrump(core, playMechanics, playPlan, cardPlayCommon, followingCommon) {
  "use strict";

  if (!core) throw new Error("BridgeRules card-play plan-following cardPlayPlanFollowingNotrump missing core dependency");
  if (!playMechanics) throw new Error("BridgeRules card-play plan-following cardPlayPlanFollowingNotrump missing play-mechanics dependency");
  if (!playPlan) throw new Error("BridgeRules card-play plan-following cardPlayPlanFollowingNotrump missing play-plan dependency");
  if (!cardPlayCommon) throw new Error("BridgeRules card-play plan-following cardPlayPlanFollowingNotrump missing common dependency");

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
  const { legalPlanCard, planFallbackOnly } = followingCommon || {};

  function choosePlanHoldUpPlay({ playPlan, hand, currentTrick, seat, trump, legal, winning }) {
      if (trump || !playPlan?.priorities?.length || currentTrick.length < 1 || !winning) return null;
      const leadSuit = currentTrick[0].card.suit;
      const priority = playPlan.priorities.find((item) => item.kind === "holdUpStopper" && item.suit === leadSuit);
      if (!priority) return null;

      const suitedLegal = cardsInSuit(legal, leadSuit);
      const duckCards = suitedLegal
        .filter((card) => card.rank !== priority.stopperRank && !beats(card, winning.card, leadSuit, trump))
        .sort(compareLowCards);
      const card = duckCards[0];
      if (!card) return null;

      return cardPlayResult(
        card,
        "playPlan.holdUpStopper",
        priority.confidence || "basic",
        "Follow the visible play plan by ducking with a low card to hold up the ace stopper.",
        {
          planPriority: priority,
          suit: priority.suit,
          leadSeat: priority.leadSeat,
          stopperSeat: priority.stopperSeat,
          stopperRank: priority.stopperRank,
          duckRank: card.rank,
          holdUpTarget: priority.holdUpTarget || 0,
          holdUpsTaken: priority.holdUpsTaken || 0,
          holdUpsRemaining: priority.holdUpsRemaining || 0,
          dangerousSeat: priority.dangerousSeat || null,
          safeSeat: priority.safeSeat || null,
          action: "holdUpStopper"
        }
      );
    }



  function choosePlanPreserveWorkSuitEntryPlay({ playPlan, hand, partnerHand, currentTrick, seat, trump, legal, winning }) {
      if (trump || !playPlan?.priorities?.length || !partnerHand?.length || currentTrick.length < 1 || !winning) return null;
      const leadSuit = currentTrick[0].card.suit;
      const priority = playPlan.priorities.find((item) => {
        return (
          item.kind === "developLongSuit" &&
          item.preserveEntry &&
          item.sourceSeat === seat &&
          item.entrySuit === leadSuit &&
          item.entryRank
        );
      });
      if (!priority) return null;

      const entryCard = legalPlanCard(cardsInSuit(legal, leadSuit).find((card) => card.rank === priority.entryRank), legal);
      if (!entryCard) return null;

      const partnerCanWin = cardsInSuit(partnerHand, leadSuit).some((card) => beats(card, winning.card, leadSuit, trump));
      if (!partnerCanWin) return null;

      const duckCards = cardsInSuit(legal, leadSuit)
        .filter((card) => card.id !== entryCard.id && !beats(card, winning.card, leadSuit, trump))
        .sort(compareLowCards);
      const card = duckCards[0];
      if (!card) return null;

      return cardPlayResult(
        card,
        "playPlan.preserveWorkSuitEntry",
        priority.confidence || "basic",
        "Follow the visible play plan by saving the entry to the long notrump work suit.",
        {
          planPriority: priority,
          suit: priority.suit,
          sourceSeat: priority.sourceSeat,
          entrySuit: priority.entrySuit,
          entryRank: priority.entryRank,
          action: "preserveWorkSuitEntry"
        }
      );
    }



  function choosePlanDevelopmentPlay({ priority, hand, partnerHand, seat, legal }) {
      const suitCards = cardsInSuit(hand, priority.suit);
      if (!suitCards.length) return null;

      const sourceIsCurrentHand = priority.sourceSeat === seat;
      const giveUpEarly = priority.timing === "giveUpEarly";
      const card = giveUpEarly
        ? legalPlanCard(lowestCard(suitCards), legal)
        : sourceIsCurrentHand
          ? legalPlanCard(suitCards.find((item) => priority.sequence?.startsWith(item.rank)) || highestCard(suitCards), legal)
          : legalPlanCard(lowestCard(suitCards), legal);
      if (!card) return null;

      return cardPlayResult(
        card,
        "playPlan.developLongSuit",
        priority.confidence || "uncertain",
        "Follow the visible play plan by developing the long notrump suit.",
        {
          planPriority: priority,
          suit: priority.suit,
          suitLength: priority.suitLength,
          sourceSeat: priority.sourceSeat,
          sourceLength: priority.sourceLength,
          sequence: priority.sequence,
          missingStopper: priority.missingStopper,
          action: giveUpEarly ? "giveUpWorkSuitEarly" : sourceIsCurrentHand ? "forceMissingHighCard" : "leadTowardLongSuit",
          targetSeat: sourceIsCurrentHand ? seat : partnerOf(seat),
          targetLength: sourceIsCurrentHand ? suitCards.length : cardsInSuit(partnerHand, priority.suit).length,
          timing: priority.timing || null,
          sameSuitEntryCount: priority.sameSuitEntryCount || 0
        }
      );
    }



  function choosePlanDevelopmentInTrickPlay({ priority, hand, partnerHand, currentTrick, seat, legal }) {
      if (!currentTrick.length || currentTrick[0].card.suit !== priority.suit) return null;
      if (priority.sourceSeat !== seat) return null;

      const suitCards = cardsInSuit(hand, priority.suit);
      const preferred = priority.sequence
        ? suitCards.find((item) => priority.sequence.startsWith(item.rank))
        : null;
      const card = legalPlanCard(preferred || highestCard(suitCards), legal);
      if (!card) return null;

      return cardPlayResult(
        card,
        "playPlan.developLongSuit",
        priority.confidence || "uncertain",
        "Follow the visible play plan by playing from the long notrump suit after it is led.",
        {
          planPriority: priority,
          suit: priority.suit,
          suitLength: priority.suitLength,
          sourceSeat: priority.sourceSeat,
          sourceLength: priority.sourceLength,
          sequence: priority.sequence,
          missingStopper: priority.missingStopper,
          action: "continueWorkSuit",
          targetSeat: seat,
          targetLength: suitCards.length,
          timing: priority.timing || null,
          sameSuitEntryCount: priority.sameSuitEntryCount || 0
        }
      );
    }



  function choosePlanFinessePlay({ priority, hand, partnerHand, trickHistory, seat, legal }) {
      const partnerSeat = partnerOf(seat);
      if (priority.leadSeat && priority.leadSeat !== seat) return null;
      if (priority.targetSeat && priority.targetSeat !== partnerSeat) return null;

      const currentSuitCards = cardsInSuit(hand, priority.suit);
      const partnerSuitCards = cardsInSuit(partnerHand, priority.suit);
      const candidate = finesseCandidate({
        suit: priority.suit,
        partnerHand,
        currentSuitCards,
        partnerSuitCards,
        playedSuitCards: cardsInSuit(playedCardsFrom(trickHistory, []), priority.suit),
        partnerSeat
      });
      if (!candidate) return null;

      const expectedKind = candidate.ruleId === "doubleFinesseTowardHonor" ? "doubleFinesse" : "finesse";
      if (priority.kind !== "safeHandFinesse" && expectedKind !== priority.kind) return null;
      const preferredLead = priority.leadRank
        ? cardsInSuit(hand, priority.suit).find((item) => item.rank === priority.leadRank)
        : null;
      const card = legalPlanCard(preferredLead || candidate.card, legal);
      if (!card) return null;

      return cardPlayResult(
        card,
        priority.kind === "safeHandFinesse" ? "playPlan.safeHandFinesse" : `playPlan.${candidate.ruleId}`,
        priority.confidence || "uncertain",
        priority.reason || candidate.reason,
        {
          planPriority: priority,
          suit: candidate.suit,
          targetSeat: candidate.targetSeat,
          targetLength: candidate.targetLength,
          finesseRank: candidate.finesseRank,
          missingHonor: candidate.missingHonor,
          missingHonors: candidate.missingHonors,
          guardRanks: candidate.guardRanks,
          entryType: candidate.entryType,
          entrySuit: candidate.entrySuit,
          entryRank: candidate.entryRank,
          safeSeat: priority.safeSeat || null,
          dangerousSeat: priority.dangerousSeat || null,
          attackedSuit: priority.attackedSuit || null,
          action: candidate.action
        }
      );
    }



  function choosePlanFinesseInTrickPlay({ priority, currentTrick, seat, trump, legal, winning }) {
      if (!currentTrick.length || currentTrick[0].card.suit !== priority.suit) return null;
      if (priority.targetSeat !== seat) return null;

      const suitedLegal = cardsInSuit(legal, priority.suit);
      const finesseCard = legalPlanCard(suitedLegal.find((item) => item.rank === priority.finesseRank), legal);
      if (!finesseCard) return null;
      const blockedFallback = blockedInTrickFinesseFallback({ priority, currentTrick, seat, trump, winning, finesseCard });
      if (blockedFallback) return blockedFallback;

      const ruleId = priority.kind === "doubleFinesse"
        ? "playPlan.doubleFinesseTowardHonor"
        : priority.kind === "safeHandFinesse"
          ? "playPlan.safeHandFinesse"
          : "playPlan.finesseTowardHonor";
      return cardPlayResult(
        finesseCard,
        ruleId,
        priority.confidence || "uncertain",
        "Follow the visible play plan by completing the finesse in the target hand.",
        {
          planPriority: priority,
          suit: priority.suit,
          targetSeat: priority.targetSeat,
          targetLength: suitedLegal.length,
          finesseRank: priority.finesseRank,
          missingHonor: priority.missingHonor,
          missingHonors: priority.missingHonors,
          guardRanks: priority.guardRanks,
          entryType: priority.entryType,
          entrySuit: priority.entrySuit,
          entryRank: priority.entryRank,
          safeSeat: priority.safeSeat || null,
          dangerousSeat: priority.dangerousSeat || null,
          attackedSuit: priority.attackedSuit || null,
          action: "completeFinesse"
        }
      );
    }



  function choosePlanDirectionalFinessePlay({ priority, hand, partnerHand, seat, legal }) {
      if (seat !== priority.leadSeat || priority.targetSeat !== partnerOf(seat)) return null;
      const leadSuitCards = cardsInSuit(hand, priority.suit);
      const card = legalPlanCard(lowestSmallCardBelow(leadSuitCards, priority.finesseRank), legal);
      if (!card) return null;

      const ruleId = priority.kind === "repeatFinesse" ? "playPlan.repeatFinesse" : "playPlan.twoWayFinesse";
      const reason = priority.kind === "repeatFinesse"
        ? "Follow the visible play plan by repeating a finesse that already worked once."
        : "Follow the visible play plan by taking the chosen direction of a two-way finesse.";
      return cardPlayResult(
        card,
        ruleId,
        priority.confidence || "uncertain",
        reason,
        {
          planPriority: priority,
          suit: priority.suit,
          leadSeat: priority.leadSeat,
          targetSeat: priority.targetSeat,
          targetLength: cardsInSuit(partnerHand, priority.suit).length,
          finesseRank: priority.finesseRank,
          missingHonor: priority.missingHonor,
          previousFinesseRank: priority.previousFinesseRank || null,
          entryType: priority.entryType || null,
          entrySuit: priority.entrySuit || null,
          entryRank: priority.entryRank || null,
          action: priority.kind
        }
      );
    }



  function choosePlanDirectionalFinesseInTrickPlay({ priority, currentTrick, seat, trump, legal, winning }) {
      if (!currentTrick.length || currentTrick[0].card.suit !== priority.suit) return null;
      if (priority.targetSeat !== seat) return null;

      const suitedLegal = cardsInSuit(legal, priority.suit);
      const finesseCard = legalPlanCard(suitedLegal.find((item) => item.rank === priority.finesseRank), legal);
      if (!finesseCard) return null;
      const blockedFallback = blockedInTrickFinesseFallback({ priority, currentTrick, seat, trump, winning, finesseCard });
      if (blockedFallback) return blockedFallback;

      const ruleId = priority.kind === "repeatFinesse" ? "playPlan.repeatFinesse" : "playPlan.twoWayFinesse";
      const reason = priority.kind === "repeatFinesse"
        ? "Follow the visible play plan by completing the repeated finesse in the target hand."
        : "Follow the visible play plan by completing the chosen two-way finesse.";
      return cardPlayResult(
        finesseCard,
        ruleId,
        priority.confidence || "uncertain",
        reason,
        {
          planPriority: priority,
          suit: priority.suit,
          leadSeat: priority.leadSeat,
          targetSeat: priority.targetSeat,
          targetLength: suitedLegal.length,
          finesseRank: priority.finesseRank,
          missingHonor: priority.missingHonor,
          previousFinesseRank: priority.previousFinesseRank || null,
          entryType: priority.entryType || null,
          entrySuit: priority.entrySuit || null,
          entryRank: priority.entryRank || null,
          action: "completeDirectionalFinesse"
        }
      );
    }



  function blockedInTrickFinesseFallback({ priority, currentTrick, seat, trump, winning, finesseCard }) {
      if (!winning) return null;
      const leadSuit = currentTrick[0]?.card?.suit || priority.suit;
      const sameSideWinning = teamOf(winning.seat) === teamOf(seat);
      const finesseBeatsWinner = beats(finesseCard, winning.card, leadSuit, trump);
      if (!sameSideWinning && finesseBeatsWinner) return null;

      return planFallbackOnly({
        priority,
        reason: sameSideWinning ? "finesseCardUnnecessary" : "finesseCardNotWinning",
        seat,
        leadSuit,
        finesseCard,
        finesseRank: priority.finesseRank,
        winningSeat: winning.seat,
        winningCard: winning.card
      });
    }



  return {
    choosePlanHoldUpPlay,
    choosePlanPreserveWorkSuitEntryPlay,
    choosePlanDevelopmentPlay,
    choosePlanDevelopmentInTrickPlay,
    choosePlanFinessePlay,
    choosePlanFinesseInTrickPlay,
    choosePlanDirectionalFinessePlay,
    choosePlanDirectionalFinesseInTrickPlay
  };
});

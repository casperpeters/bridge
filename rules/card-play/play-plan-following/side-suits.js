(function initBridgeRulesCardPlayPlanFollowingSideSuits(root, factory) {
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
  root.BridgeRulesParts.cardPlayPlanFollowingSideSuits = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesCardPlayPlanFollowingSideSuits(core, playMechanics, playPlan, cardPlayCommon, followingCommon) {
  "use strict";

  if (!core) throw new Error("BridgeRules card-play plan-following cardPlayPlanFollowingSideSuits missing core dependency");
  if (!playMechanics) throw new Error("BridgeRules card-play plan-following cardPlayPlanFollowingSideSuits missing play-mechanics dependency");
  if (!playPlan) throw new Error("BridgeRules card-play plan-following cardPlayPlanFollowingSideSuits missing play-plan dependency");
  if (!cardPlayCommon) throw new Error("BridgeRules card-play plan-following cardPlayPlanFollowingSideSuits missing common dependency");

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

  function choosePlanEstablishSideSuitForDiscardPlay({ priority, seat, legal }) {
      if (seat !== priority.leadSeat) return null;
      const suitedLegal = cardsInSuit(legal, priority.suit);
      const card = priority.leadRank
        ? suitedLegal.find((item) => item.rank === priority.leadRank)
        : highestCard(suitedLegal);
      if (!card) return null;

      return cardPlayResult(
        card,
        "playPlan.establishSideSuitForDiscard",
        priority.confidence || "basic",
        "Follow the visible play plan by working out a high card before drawing trumps, so a loser can be discarded later.",
        {
          planPriority: priority,
          suit: priority.suit,
          discardSuit: priority.discardSuit,
          leadSeat: priority.leadSeat,
          sourceSeat: priority.sourceSeat,
          discardSeat: priority.discardSeat,
          leadRank: priority.leadRank,
          missingStopper: priority.missingStopper,
          futureWinnerRanks: priority.futureWinnerRanks,
          entrySuit: priority.entrySuit,
          entryRank: priority.entryRank,
          action: "forceHighCardForDiscard"
        }
      );
    }



  function choosePlanEstablishSideSuitForDiscardInTrickPlay({ priority, currentTrick, seat, trump, legal, winning }) {
      if (!currentTrick.length || currentTrick[0].card.suit !== priority.suit) return null;
      if (seat !== priority.sourceSeat) return null;

      const suitedLegal = cardsInSuit(legal, priority.suit);
      if (!suitedLegal.length) return null;

      const missingStopperPlayed = currentTrick.some((play) => {
        return play.card?.suit === priority.suit && play.card.rank === priority.missingStopper;
      });
      const winnerCards = (priority.futureWinnerRanks || [])
        .map((rank) => suitedLegal.find((card) => card.rank === rank))
        .filter(Boolean);
      const card = missingStopperPlayed
        ? lowestCard(suitedLegal)
        : winnerCards.find((candidate) => !winning || teamOf(winning.seat) === teamOf(seat) || beats(candidate, winning.card, priority.suit, trump))
          || highestCard(suitedLegal);
      if (!card) return null;

      return cardPlayResult(
        card,
        "playPlan.establishSideSuitForDiscard",
        priority.confidence || "basic",
        "Follow the visible play plan by playing a high card to force out the missing stopper for a later discard.",
        {
          planPriority: priority,
          suit: priority.suit,
          discardSuit: priority.discardSuit,
          leadSeat: priority.leadSeat,
          sourceSeat: priority.sourceSeat,
          discardSeat: priority.discardSeat,
          leadRank: priority.leadRank,
          missingStopper: priority.missingStopper,
          futureWinnerRanks: priority.futureWinnerRanks,
          entrySuit: priority.entrySuit,
          entryRank: priority.entryRank,
          action: missingStopperPlayed ? "preserveDevelopedWinners" : "forceMissingHighCard"
        }
      );
    }



  function choosePlanDevelopSideSuitBeforeTrumpEntryPlay({ priority, seat, legal }) {
      if (seat !== priority.leadSeat) return null;
      const suitedLegal = cardsInSuit(legal, priority.suit);
      const card = priority.leadRank
        ? suitedLegal.find((item) => item.rank === priority.leadRank)
        : highestCard(suitedLegal);
      if (!card) return null;

      return cardPlayResult(
        card,
        "playPlan.developSideSuitBeforeTrumpEntry",
        priority.confidence || "basic",
        "Follow the visible play plan by developing the work suit before spending the only trump entry.",
        {
          planPriority: priority,
          suit: priority.suit,
          leadSeat: priority.leadSeat,
          sourceSeat: priority.sourceSeat,
          leadRank: priority.leadRank,
          missingStopper: priority.missingStopper,
          futureWinnerRanks: priority.futureWinnerRanks,
          discardSuits: priority.discardSuits,
          discardCapacity: priority.discardCapacity,
          entrySuit: priority.entrySuit,
          entryRank: priority.entryRank,
          entrySeat: priority.entrySeat,
          action: "forceWorkSuitStopperBeforeTrumpEntry"
        }
      );
    }



  function choosePlanDevelopSideSuitBeforeTrumpEntryInTrickPlay({ priority, currentTrick, seat, trump, legal, winning }) {
      if (!currentTrick.length || currentTrick[0].card.suit !== priority.suit) return null;
      if (seat !== priority.sourceSeat) return null;

      const suitedLegal = cardsInSuit(legal, priority.suit);
      if (!suitedLegal.length) return null;

      const missingStopperPlayed = currentTrick.some((play) => {
        return play.card?.suit === priority.suit && play.card.rank === priority.missingStopper;
      });
      const preserving = missingStopperPlayed || (winning && teamOf(winning.seat) === teamOf(seat));
      const winnerCards = (priority.futureWinnerRanks || [])
        .map((rank) => suitedLegal.find((card) => card.rank === rank))
        .filter(Boolean);
      const card = preserving
        ? lowestCard(suitedLegal)
        : winnerCards.find((candidate) => !winning || beats(candidate, winning.card, priority.suit, trump))
          || lowestCard(suitedLegal);
      if (!card) return null;

      return cardPlayResult(
        card,
        "playPlan.developSideSuitBeforeTrumpEntry",
        priority.confidence || "basic",
        "Follow the visible play plan by preserving the developed work-suit winners before the trump entry is used.",
        {
          planPriority: priority,
          suit: priority.suit,
          leadSeat: priority.leadSeat,
          sourceSeat: priority.sourceSeat,
          leadRank: priority.leadRank,
          missingStopper: priority.missingStopper,
          futureWinnerRanks: priority.futureWinnerRanks,
          discardSuits: priority.discardSuits,
          discardCapacity: priority.discardCapacity,
          entrySuit: priority.entrySuit,
          entryRank: priority.entryRank,
          entrySeat: priority.entrySeat,
          action: preserving ? "preserveWorkSuitWinners" : "continueWorkSuitBeforeTrumpEntry"
        }
      );
    }



  function choosePlanDiscardLoserOnWinnerPlay({ priority, hand, partnerHand, seat, legal }) {
      const suitedLegal = priority.suit ? cardsInSuit(legal, priority.suit) : legal;
      let card = null;
      let action = "cashWinnerForDiscard";

      if (priority.firstSeat === seat) {
        card = priority.cashRanks?.length
          ? priority.cashRanks.map((rank) => suitedLegal.find((item) => item.rank === rank)).find(Boolean)
          : highestCard(suitedLegal);
      } else if (priority.firstSeat === partnerOf(seat) && cardsInSuit(partnerHand, priority.suit).length) {
        card = shortSideCashRankCard(priority, suitedLegal) || lowestCard(suitedLegal);
        action = card && priority.cashRanks?.some((rank) => rank === card.rank)
          ? "unblockShortHonorForDiscard"
          : "leadTowardWinnerForDiscard";
      }
      if (!card) return null;

      return cardPlayResult(
        card,
        "playPlan.discardLoserOnWinner",
        priority.confidence || "basic",
        "Follow the visible play plan by using a side-suit winner before drawing trumps, so a loser can be discarded.",
        {
          planPriority: priority,
          suit: priority.suit || card.suit,
          cashRanks: priority.cashRanks,
          attackedSuit: priority.attackedSuit,
          discardSeat: priority.discardSeat,
          discardCapacity: priority.discardCapacity,
          firstSeat: priority.firstSeat,
          timing: priority.timing,
          action
        }
      );
    }



  function shortSideCashRankCard(priority, suitedLegal) {
      return (priority.cashRanks || [])
        .map((rank) => suitedLegal.find((card) => card.rank === rank))
        .find(Boolean) || null;
    }



  function choosePlanDiscardLoserOnWinnerInTrickPlay({ priority, hand, currentTrick, seat, trump, legal, winning }) {
      if (!currentTrick.length) return null;
      const leadSuit = currentTrick[0].card.suit;
      if (priority.suit && leadSuit !== priority.suit) return null;

      if (priority.firstSeat === seat) {
        const suitedLegal = cardsInSuit(legal, leadSuit);
        const preferred = priority.cashRanks?.length
          ? priority.cashRanks.map((rank) => suitedLegal.find((item) => item.rank === rank)).find(Boolean)
          : highestCard(suitedLegal);
        const card = legalPlanCard(preferred, legal);
        if (!card) return null;
        if (winning && teamOf(winning.seat) !== teamOf(seat) && !beats(card, winning.card, leadSuit, trump)) return null;
        return cardPlayResult(
          card,
          "playPlan.discardLoserOnWinner",
          priority.confidence || "basic",
          "Follow the visible play plan by cashing the high card that will provide a discard.",
          {
            planPriority: priority,
            suit: priority.suit || leadSuit,
            cashRanks: priority.cashRanks,
            attackedSuit: priority.attackedSuit,
            discardSeat: priority.discardSeat,
            discardCapacity: priority.discardCapacity,
            firstSeat: priority.firstSeat,
            timing: priority.timing,
            action: "cashWinnerForDiscard"
          }
        );
      }

      if (priority.discardSeat !== seat) return null;
      if (cardsInSuit(hand, leadSuit).length) return null;
      if (!winning || teamOf(winning.seat) !== teamOf(seat)) return null;

      const loserCards = priority.attackedSuit ? cardsInSuit(legal, priority.attackedSuit) : [];
      const card = lowestCard(loserCards) || lowestCard(legal);
      if (!card) return null;

      return cardPlayResult(
        card,
        "playPlan.discardLoserOnWinner",
        priority.confidence || "basic",
        "Follow the visible play plan by discarding a loser while partner's side-suit winner is cashing.",
        {
          planPriority: priority,
          suit: priority.suit || leadSuit,
          cashRanks: priority.cashRanks,
          attackedSuit: priority.attackedSuit,
          discardSeat: priority.discardSeat,
          discardCapacity: priority.discardCapacity,
          firstSeat: priority.firstSeat,
          timing: priority.timing,
          action: "discardLoserOnWinner"
        }
      );
    }



  function choosePlanCashWinnerPlay({ priority, hand, seat, legal }) {
      if (priority.firstSeat && priority.firstSeat !== seat) return null;
      if (priority.kind === "cashSureWinners" && (!priority.suit || !priority.cashRanks?.length)) return null;
      const suitedLegal = priority.suit ? cardsInSuit(legal, priority.suit) : legal;
      const card = priority.cashRanks?.length
        ? priority.cashRanks.map((rank) => suitedLegal.find((item) => item.rank === rank)).find(Boolean)
        : highestCard(suitedLegal);
      if (!card) return null;

      return cardPlayResult(
        card,
        priority.kind === "cashWinners" ? "playPlan.cashWinners" : "playPlan.cashSureWinners",
        priority.confidence || "basic",
        "Follow the visible play plan by cashing a sure winner.",
        {
          planPriority: priority,
          suit: priority.suit || card.suit,
          cashRanks: priority.cashRanks,
          timing: priority.timing,
          action: priority.timing === "unblockBeforeEntry" ? "unblockSuit" : "cashSureWinner"
        }
      );
    }



  function choosePlanCashWinnerInTrickPlay({ priority, currentTrick, seat, trump, legal, winning }) {
      if (!currentTrick.length || (priority.firstSeat && priority.firstSeat !== seat)) return null;
      if (priority.kind === "cashSureWinners" && (!priority.suit || !priority.cashRanks?.length)) return null;
      const leadSuit = currentTrick[0].card.suit;
      if (priority.suit && priority.suit !== leadSuit) return null;

      const suitedLegal = cardsInSuit(legal, leadSuit);
      const preferred = priority.cashRanks?.length
        ? priority.cashRanks.map((rank) => suitedLegal.find((item) => item.rank === rank)).find(Boolean)
        : highestCard(suitedLegal);
      const card = legalPlanCard(preferred, legal);
      if (!card) return null;
      if (winning && teamOf(winning.seat) === teamOf(seat)) return null;
      if (winning && teamOf(winning.seat) !== teamOf(seat) && !beats(card, winning.card, leadSuit, trump)) return null;

      return cardPlayResult(
        card,
        priority.kind === "cashWinners" ? "playPlan.cashWinners" : "playPlan.cashSureWinners",
        priority.confidence || "basic",
        "Follow the visible play plan by taking the planned winner in the current trick.",
        {
          planPriority: priority,
          suit: priority.suit || card.suit,
          cashRanks: priority.cashRanks,
          timing: priority.timing,
          action: priority.timing === "unblockBeforeEntry" ? "unblockSuit" : "cashSureWinner"
        }
      );
    }




  return {
    choosePlanEstablishSideSuitForDiscardPlay,
    choosePlanEstablishSideSuitForDiscardInTrickPlay,
    choosePlanDevelopSideSuitBeforeTrumpEntryPlay,
    choosePlanDevelopSideSuitBeforeTrumpEntryInTrickPlay,
    choosePlanDiscardLoserOnWinnerPlay,
    shortSideCashRankCard,
    choosePlanDiscardLoserOnWinnerInTrickPlay,
    choosePlanCashWinnerPlay,
    choosePlanCashWinnerInTrickPlay
  };
});

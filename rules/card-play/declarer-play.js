(function initBridgeRulesCardPlayDeclarer(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const deps = isCommonJs
    ? {
        core: require("../core.js"),
        playMechanics: require("../play-mechanics.js"),
        playPlan: require("../play-plan.js"),
        cardPlayCommon: require("./common.js")
      }
    : root.BridgeRulesParts || {};
  const api = factory(deps.core, deps.playMechanics, deps.playPlan, deps.cardPlayCommon);
  if (isCommonJs) module.exports = api;
  root.BridgeRulesParts = root.BridgeRulesParts || {};
  root.BridgeRulesParts.cardPlayDeclarer = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesCardPlayDeclarer(core, playMechanics, playPlan, cardPlayCommon) {
  "use strict";

  const {
    suits,
    compareLowCards,
    lowestCard,
    teamOf,
    partnerOf
  } = core;
  const { beats } = playMechanics;
  const {
    cardsInSuit,
    playedCardsFrom,
    longSuitDevelopmentCandidate,
    finesseCandidate
  } = playPlan;
  const { cardPlayResult } = cardPlayCommon;

  function chooseDeclarerFinessePlay({
      hand,
      partnerHand,
      currentTrick,
      trickHistory,
      seat,
      declarer,
      dummy,
      contract
    }) {
      if (currentTrick.length || contract?.strain !== "NT") return null;
      if (!partnerHand?.length || !declarer || !dummy) return null;
      if (seat !== declarer && seat !== dummy) return null;

      const partnerSeat = partnerOf(seat);
      const playedCards = playedCardsFrom(trickHistory, currentTrick);
      const candidates = [];

      for (const suit of suits) {
        const currentSuitCards = cardsInSuit(hand, suit);
        const partnerSuitCards = cardsInSuit(partnerHand, suit);
        const playedSuitCards = cardsInSuit(playedCards, suit);
        const candidate = finesseCandidate({
          suit,
          partnerHand,
          currentSuitCards,
          partnerSuitCards,
          playedSuitCards,
          partnerSeat
        });
        if (candidate) candidates.push(candidate);
      }

      const best = candidates.sort((a, b) => b.score - a.score)[0];
      if (!best) return null;

      return cardPlayResult(
        best.card,
        best.ruleId,
        "uncertain",
        best.reason,
        {
          suit: best.suit,
          targetSeat: best.targetSeat,
          targetLength: best.targetLength,
          finesseRank: best.finesseRank,
          missingHonor: best.missingHonor,
          missingHonors: best.missingHonors,
          guardRanks: best.guardRanks,
          entryType: best.entryType,
          entrySuit: best.entrySuit,
          entryRank: best.entryRank,
          action: best.action
        }
      );
    }

  function chooseDeclarerDevelopmentPlay({
      hand,
      partnerHand,
      currentTrick,
      trickHistory,
      seat,
      declarer,
      dummy,
      contract
    }) {
      if (currentTrick.length || contract?.strain !== "NT") return null;
      if (!partnerHand?.length || !declarer || !dummy) return null;
      if (seat !== declarer && seat !== dummy) return null;

      const partnerSeat = partnerOf(seat);
      const playedCards = playedCardsFrom(trickHistory, currentTrick);
      const candidates = [];

      for (const suit of suits) {
        const currentSuitCards = cardsInSuit(hand, suit);
        if (!currentSuitCards.length) continue;

        const partnerSuitCards = cardsInSuit(partnerHand, suit);
        const playedSuitCards = cardsInSuit(playedCards, suit);
        const currentCandidate = longSuitDevelopmentCandidate({
          suit,
          source: "current",
          sourceCards: currentSuitCards,
          currentSuitCards,
          partnerSuitCards,
          playedSuitCards,
          seat,
          partnerSeat
        });
        const partnerCandidate = longSuitDevelopmentCandidate({
          suit,
          source: "partner",
          sourceCards: partnerSuitCards,
          currentSuitCards,
          partnerSuitCards,
          playedSuitCards,
          seat,
          partnerSeat
        });

        if (currentCandidate) candidates.push(currentCandidate);
        if (partnerCandidate) candidates.push(partnerCandidate);
      }

      const best = candidates.sort((a, b) => b.score - a.score)[0];
      if (!best) return null;

      return cardPlayResult(
        best.card,
        "developLongSuit",
        "uncertain",
        "Develop a long notrump suit by forcing out a missing high card.",
        {
          suit: best.suit,
          suitLength: best.suitLength,
          sourceSeat: best.sourceSeat,
          sourceLength: best.sourceLength,
          sequence: best.sequence,
          missingStopper: best.missingStopper,
          action: best.action
        }
      );
    }

  function chooseAvoidLongHandRuff({ hand, partnerHand, legal, currentTrick, seat, declarer, dummy, trump, winning }) {
      if (!trump || !currentTrick.length || !partnerHand?.length || !declarer || !dummy || !winning) return null;
      if (seat !== declarer && seat !== dummy) return null;

      const leadSuit = currentTrick[0].card.suit;
      if (leadSuit === trump || cardsInSuit(hand, leadSuit).length) return null;

      const trumpCards = cardsInSuit(legal, trump);
      const discardCards = legal.filter((card) => card.suit !== trump);
      if (!trumpCards.length || !discardCards.length) return null;

      const ownTrumpLength = cardsInSuit(hand, trump).length;
      const partnerTrumpLength = cardsInSuit(partnerHand, trump).length;
      if (ownTrumpLength <= partnerTrumpLength) return null;

      const winningTrumps = trumpCards.filter((card) => beats(card, winning.card, leadSuit, trump));
      if (!winningTrumps.length) return null;
      if (teamOf(winning.seat) !== teamOf(seat)) return null;

      const card = lowestCard(discardCards);
      if (!card) return null;

      return cardPlayResult(
        card,
        "avoidLongHandRuff",
        "basic",
        "Avoid ruffing unnecessarily with the long trump hand; that usually does not create an extra trump trick and can reduce control.",
        {
          leadSuit,
          trump,
          longSeat: seat,
          ownTrumpLength,
          partnerTrumpLength,
          action: "discardInsteadOfLongHandRuff"
        }
      );
    }


  return {
    chooseDeclarerFinessePlay,
    chooseDeclarerDevelopmentPlay,
    chooseAvoidLongHandRuff
  };
});

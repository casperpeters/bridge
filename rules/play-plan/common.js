(function initBridgeRulesPlayPlanCommon(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const deps = isCommonJs ? { core: require("../core.js") } : root.BridgeRulesParts || {};
  const api = factory(deps.core);
  if (isCommonJs) module.exports = api;
  root.BridgeRulesPlayPlanParts = root.BridgeRulesPlayPlanParts || {};
  root.BridgeRulesPlayPlanParts.common = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesPlayPlanCommon(core) {
  "use strict";

  if (!core) throw new Error("BridgeRules play-plan common missing core dependency");

  const {
    rankOrder,
    descendingRanks,
    hcpValue,
    compareCards,
    lowestCard,
    highestCard
  } = core;

  const developmentRanks = ["A", "K", "Q", "J", "T"];
  const finessePatterns = [
    {
      missingHonors: ["K"],
      finesseRank: "Q",
      guardRanks: ["A"],
      ruleId: "finesseTowardHonor",
      action: "leadTowardFinesse",
      reason: "Speel laag naar een beschermde honneur om een sans-atoutsnit te proberen.",
      score: 90
    },
    {
      missingHonors: ["Q"],
      finesseRank: "J",
      guardRanks: ["A", "K"],
      ruleId: "finesseTowardHonor",
      action: "leadTowardFinesse",
      reason: "Speel laag naar een beschermde honneur om een sans-atoutsnit te proberen.",
      score: 80
    },
    {
      missingHonors: ["A", "Q"],
      finesseRank: "J",
      guardRanks: ["K"],
      minLeadCards: 2,
      ruleId: "doubleFinesseTowardHonor",
      action: "leadTowardDoubleFinesse",
      reason: "Speel laag naar de boer voor de eerste ronde van een dubbele sans-atoutsnit.",
      score: 70
    },
    {
      missingHonors: ["K", "Q"],
      finesseRank: "T",
      guardRanks: ["A", "J"],
      minLeadCards: 2,
      ruleId: "doubleFinesseTowardHonor",
      action: "leadTowardDoubleFinesse",
      reason: "Speel laag naar de tien voor de eerste ronde van een dubbele sans-atoutsnit.",
      score: 68
    },
    {
      missingHonors: ["A", "J"],
      finesseRank: "T",
      guardRanks: ["K", "Q"],
      minLeadCards: 2,
      ruleId: "doubleFinesseTowardHonor",
      action: "leadTowardDoubleFinesse",
      reason: "Speel laag naar de tien voor de eerste ronde van een dubbele sans-atoutsnit.",
      score: 66
    },
    {
      missingHonors: ["A", "K"],
      finesseRank: "T",
      guardRanks: ["Q", "J"],
      minLeadCards: 2,
      ruleId: "doubleFinesseTowardHonor",
      action: "leadTowardDoubleFinesse",
      reason: "Speel laag naar de tien voor de eerste ronde van een dubbele sans-atoutsnit.",
      score: 64
    }
  ];
  const repeatFinessePatterns = [
    {
      missingHonor: "K",
      firstFinesseRank: "Q",
      finesseRank: "J",
      guardRanks: ["A"],
      score: 88
    },
    {
      missingHonor: "Q",
      firstFinesseRank: "J",
      finesseRank: "T",
      guardRanks: ["A", "K"],
      score: 78
    }
  ];

  function visibleTopWinnerRanks(combinedCards, playedSuitCards = []) {
        const visibleRanks = new Set(combinedCards.map((card) => card.rank));
        const playedRanks = new Set(playedSuitCards.map((card) => card.rank));
        const winners = [];
        for (const rank of [...rankOrder].reverse()) {
          if (visibleRanks.has(rank)) {
            winners.push(rank);
          } else if (!playedRanks.has(rank)) {
            break;
          }
        }
        return winners;
      }

  function seatForSuitRank(rank, declarerSuitCards, dummySuitCards, declarer, dummy) {
        if (declarerSuitCards.some((card) => card.rank === rank)) return declarer;
        if (dummySuitCards.some((card) => card.rank === rank)) return dummy;
        return null;
      }

  function blockedSuitInfo({
      declarerHand,
      dummyHand,
      declarerSuitCards,
      dummySuitCards,
      declarer,
      dummy,
      suit,
      winnerRanks
    }) {
      if (winnerRanks.length < 2 || !declarer || !dummy) return null;
      const sides = [
        { seat: declarer, hand: declarerHand, suitCards: declarerSuitCards },
        { seat: dummy, hand: dummyHand, suitCards: dummySuitCards }
      ].sort((a, b) => b.suitCards.length - a.suitCards.length);
      const longSide = sides[0];
      const shortSide = sides[1];
      if (longSide.suitCards.length < 3 || !shortSide.suitCards.length) return null;

      const cashFirstRanks = [];
      for (const rank of winnerRanks) {
        if (seatForSuitRank(rank, declarerSuitCards, dummySuitCards, declarer, dummy) !== shortSide.seat) break;
        cashFirstRanks.push(rank);
      }
      if (!cashFirstRanks.length || cashFirstRanks.length < shortSide.suitCards.length) return null;

      const strandedRanks = winnerRanks
        .slice(cashFirstRanks.length)
        .filter((rank) => seatForSuitRank(rank, declarerSuitCards, dummySuitCards, declarer, dummy) === longSide.seat);
      if (!strandedRanks.length) return null;

      return {
        blockedSeat: shortSide.seat,
        longSeat: longSide.seat,
        cashFirstRanks,
        strandedRanks,
        entryCard: clearOutsideEntryCard(longSide.hand, suit)
      };
    }

  function clearOutsideEntryCard(hand, excludedSuit) {
        return [...hand]
          .filter((card) => card.suit !== excludedSuit && card.rank === "A")
          .sort(compareCards)[0] || null;
      }

  function entryPlanForHand(hand, excludedSuit) {
        const entryCard = clearOutsideEntryCard(hand, excludedSuit);
        if (!entryCard) {
          return {
            entryType: "none",
            entrySuit: null,
            entryRank: null,
            entryTiming: "noClearEntry",
            entryCount: 0
          };
        }
        return {
          entryType: "outsideAce",
          entrySuit: entryCard.suit,
          entryRank: entryCard.rank,
          entryTiming: "outsideEntry",
          entryCount: clearOutsideEntries(hand, excludedSuit)
        };
      }

  function clearOutsideEntries(hand, excludedSuit) {
        return hand.filter((card) => card.suit !== excludedSuit && card.rank === "A").length;
      }

  function cardsInSuit(cards, suit) {
        return (cards || []).filter((card) => card.suit === suit);
      }

  function hasRank(cards, rank) {
        return cards.some((card) => card.rank === rank);
      }

  function lowestSmallCardBelow(cards, rank) {
        const rankIndex = rankOrder.indexOf(rank);
        return lowestCard(cards.filter((card) => !hcpValue[card.rank] && rankOrder.indexOf(card.rank) < rankIndex));
      }

  function sideAceEntry(cards, excludedSuit) {
        return cards.find((card) => card.suit !== excludedSuit && card.rank === "A") || null;
      }

  function sameSuitFinesseEntry(pattern, currentSuitCards, partnerSuitCards, leadCard) {
        const remainingLeadCards = currentSuitCards.filter((card) => card.id !== leadCard.id);
        if (!remainingLeadCards.length) return null;
        const entryCard = pattern.guardRanks
          .map((rank) => partnerSuitCards.find((card) => card.rank === rank))
          .find(Boolean);
        if (!entryCard) return null;
        return {
          entryType: "sameSuit",
          entrySuit: entryCard.suit,
          entryRank: entryCard.rank
        };
      }

  function targetHandEntryPlan({ pattern, currentSuitCards, partnerHand, partnerSuitCards, leadCard, suit }) {
      const outsideAce = sideAceEntry(partnerHand, suit);
      if (outsideAce) {
        return {
          entryType: "sideAce",
          entrySuit: outsideAce.suit,
          entryRank: outsideAce.rank
        };
      }
      return sameSuitFinesseEntry(pattern, currentSuitCards, partnerSuitCards, leadCard);
    }

  function playedCardsFrom(trickHistory = [], currentTrick = []) {
        return [
          ...trickHistory.flatMap((trick) => trick.cards || []).map((play) => play.card),
          ...currentTrick.map((play) => play.card)
        ].filter(Boolean);
      }

  function topTouchingHonorRun(cards) {
        const ranks = new Set(cards.map((card) => card.rank));
        for (let i = 0; i < developmentRanks.length - 1; i++) {
          if (!ranks.has(developmentRanks[i])) continue;
          const run = [];
          for (let j = i; j < developmentRanks.length; j++) {
            if (!ranks.has(developmentRanks[j])) break;
            run.push(developmentRanks[j]);
          }
          if (run.length >= 2) return { ranks: run, topIndex: i };
        }
        return null;
      }

  function missingHigherRanks(run, combinedCards, playedSuitCards) {
        const combinedRanks = new Set(combinedCards.map((card) => card.rank));
        const playedRanks = new Set(playedSuitCards.map((card) => card.rank));
        return developmentRanks
          .slice(0, run.topIndex)
          .filter((rank) => !combinedRanks.has(rank) && !playedRanks.has(rank));
      }

  function longSuitDevelopmentCandidate({
      suit,
      source,
      sourceCards,
      sourceHand,
      currentSuitCards,
      partnerSuitCards,
      playedSuitCards,
      seat,
      partnerSeat
    }) {
      if (sourceCards.length < 4) return null;
      const combinedCards = [...currentSuitCards, ...partnerSuitCards];
      if (combinedCards.length < 6) return null;

      const run = topTouchingHonorRun(sourceCards);
      if (!run) return null;

      const missingHigher = missingHigherRanks(run, combinedCards, playedSuitCards);
      if (missingHigher.length !== 1) return null;

      const sourceIsCurrentHand = source === "current";
      const card = sourceIsCurrentHand
        ? sourceCards.find((item) => item.rank === run.ranks[0])
        : lowestCard(currentSuitCards);
      if (!card) return null;

      return {
        card,
        suit,
        suitLength: combinedCards.length,
        sourceSeat: sourceIsCurrentHand ? seat : partnerSeat,
        sourceLength: sourceCards.length,
        sequence: run.ranks.join(""),
        missingStopper: missingHigher[0],
        action: sourceIsCurrentHand ? "forceMissingHighCard" : "leadTowardLongSuit",
        score: combinedCards.length * 4 + sourceCards.length * 3 + run.ranks.length * 8 + (sourceIsCurrentHand ? 3 : 0)
      };
    }

  function forceOutAceCandidate({
      suit,
      source,
      sourceCards,
      sourceHand,
      currentSuitCards,
      partnerSuitCards,
      playedSuitCards,
      seat,
      partnerSeat
    }) {
      if (sourceCards.length < 2) return null;
      const combinedCards = [...currentSuitCards, ...partnerSuitCards];
      if (combinedCards.length < 3) return null;

      const run = topTouchingHonorRun(sourceCards);
      if (!run) return null;

      const missingHigher = missingHigherRanks(run, combinedCards, playedSuitCards);
      if (missingHigher.length < 1 || missingHigher.length > 2) return null;
      if (sourceCards.length >= 4 && combinedCards.length >= 6 && missingHigher.length === 1) return null;

      const promotedTricks = Math.max(0, run.ranks.length - missingHigher.length);
      if (promotedTricks < 1) return null;

      const sourceIsCurrentHand = source === "current";
      const sourceSeat = sourceIsCurrentHand ? seat : partnerSeat;
      const partnerHasSameSuitLink = (sourceIsCurrentHand ? partnerSuitCards : currentSuitCards).length > 0;
      const outsideEntryPlan = sourceHand ? entryPlanForHand(sourceHand, suit) : null;
      const hasOutsideEntry = Boolean(outsideEntryPlan?.entryCount);
      if (!hasOutsideEntry && !partnerHasSameSuitLink) return null;

      const card = sourceIsCurrentHand
        ? sourceCards.find((item) => item.rank === run.ranks[0])
        : lowestCard(currentSuitCards);
      if (!card) return null;

      return {
        card,
        suit,
        sourceSeat,
        sourceLength: sourceCards.length,
        suitLength: combinedCards.length,
        sequence: run.ranks.join(""),
        forceRank: run.ranks[0],
        missingStopper: missingHigher[0],
        missingStoppers: missingHigher,
        futureWinnerRanks: run.ranks.slice(missingHigher.length),
        promotedTricks,
        lossesNeeded: missingHigher.length,
        entryType: hasOutsideEntry ? outsideEntryPlan.entryType : "sameSuitSupport",
        entrySuit: hasOutsideEntry ? outsideEntryPlan.entrySuit : suit,
        entryRank: hasOutsideEntry ? outsideEntryPlan.entryRank : run.ranks[run.ranks.length - 1],
        entryTiming: hasOutsideEntry ? outsideEntryPlan.entryTiming : "sameSuitSupport",
        entryCount: (outsideEntryPlan?.entryCount || 0) + (partnerHasSameSuitLink ? 1 : 0),
        action: sourceIsCurrentHand ? "forceMissingHighCard" : "leadTowardForceOutAce",
        score: promotedTricks * 28 + run.ranks.length * 6 + combinedCards.length * 2 + (hasOutsideEntry || partnerHasSameSuitLink ? 6 : -20) - missingHigher.length * 10
      };
    }

  function finesseCandidate({
      suit,
      partnerHand,
      currentSuitCards,
      partnerSuitCards,
      playedSuitCards,
      partnerSeat
    }) {
      if (!currentSuitCards.length || partnerSuitCards.length < 2) return null;

      const combinedCards = [...currentSuitCards, ...partnerSuitCards];
      for (const pattern of finessePatterns) {
        const missingHonors = pattern.missingHonors || [];
        if (pattern.minLeadCards && currentSuitCards.length < pattern.minLeadCards) continue;
        const leadCard = lowestSmallCardBelow(currentSuitCards, pattern.finesseRank);
        if (!leadCard) continue;
        if (!hasRank(partnerSuitCards, pattern.finesseRank)) continue;
        if (missingHonors.some((rank) => hasRank(combinedCards, rank) || hasRank(playedSuitCards, rank))) continue;
        if (!pattern.guardRanks.every((rank) => hasRank(partnerSuitCards, rank))) continue;
        const entryPlan = targetHandEntryPlan({
          pattern,
          currentSuitCards,
          partnerHand,
          partnerSuitCards,
          leadCard,
          suit
        });
        if (!entryPlan) continue;

        return {
          card: leadCard,
          suit,
          ruleId: pattern.ruleId,
          targetSeat: partnerSeat,
          targetLength: partnerSuitCards.length,
          finesseRank: pattern.finesseRank,
          missingHonor: missingHonors[0],
          missingHonors,
          guardRanks: pattern.guardRanks,
          entryType: entryPlan.entryType,
          entrySuit: entryPlan.entrySuit,
          entryRank: entryPlan.entryRank,
          action: pattern.action,
          reason: pattern.reason,
          score: pattern.score + partnerSuitCards.length + combinedCards.length + (entryPlan.entryType === "sideAce" ? 4 : 0)
        };
      }
      return null;
    }

  function repeatFinesseCandidate({
      suit,
      trickHistory,
      playedSuitCards,
      leadSeat,
      targetSeat,
      leadSuitCards,
      targetSuitCards,
      targetHand
    }) {
      const combinedCards = [...leadSuitCards, ...targetSuitCards];
      for (const pattern of repeatFinessePatterns) {
        if (hasRank(combinedCards, pattern.missingHonor) || hasRank(playedSuitCards, pattern.missingHonor)) continue;
        if (!hasRank(targetSuitCards, pattern.finesseRank)) continue;
        if (!pattern.guardRanks.every((rank) => hasRank(targetSuitCards, rank))) continue;
        const leadCard = lowestSmallCardBelow(leadSuitCards, pattern.finesseRank);
        if (!leadCard) continue;
        if (!previousSuccessfulFinesse({ trickHistory, suit, leadSeat, targetSeat, pattern })) continue;

        const entryPlan = targetHandEntryPlan({
          pattern,
          currentSuitCards: leadSuitCards,
          partnerHand: targetHand,
          partnerSuitCards: targetSuitCards,
          leadCard,
          suit
        });

        return {
          kind: "repeatFinesse",
          confidence: "uncertain",
          suit,
          leadSeat,
          targetSeat,
          finesseRank: pattern.finesseRank,
          missingHonor: pattern.missingHonor,
          previousFinesseRank: pattern.firstFinesseRank,
          entryType: entryPlan?.entryType || null,
          entrySuit: entryPlan?.entrySuit || null,
          entryRank: entryPlan?.entryRank || null,
          score: pattern.score + targetSuitCards.length + leadSuitCards.length
        };
      }
      return null;
    }

  function previousSuccessfulFinesse({ trickHistory, suit, leadSeat, targetSeat, pattern }) {
      return trickHistory.some((trick) => {
        if (trick.winner !== targetSeat) return false;
        const targetPlay = (trick.cards || []).find((play) => {
          return play.seat === targetSeat && play.card.suit === suit && play.card.rank === pattern.firstFinesseRank;
        });
        const leadPlay = (trick.cards || []).find((play) => {
          return (
            play.seat === leadSeat &&
            play.card.suit === suit &&
            rankOrder.indexOf(play.card.rank) < rankOrder.indexOf(pattern.firstFinesseRank)
          );
        });
        return Boolean(targetPlay && leadPlay);
      });
    }

  return {
    developmentRanks,
    finessePatterns,
    repeatFinessePatterns,
    visibleTopWinnerRanks,
    seatForSuitRank,
    blockedSuitInfo,
    clearOutsideEntryCard,
    entryPlanForHand,
    clearOutsideEntries,
    cardsInSuit,
    hasRank,
    lowestSmallCardBelow,
    sideAceEntry,
    sameSuitFinesseEntry,
    targetHandEntryPlan,
    playedCardsFrom,
    topTouchingHonorRun,
    missingHigherRanks,
    longSuitDevelopmentCandidate,
    forceOutAceCandidate,
    finesseCandidate,
    repeatFinesseCandidate,
    previousSuccessfulFinesse
  };
});

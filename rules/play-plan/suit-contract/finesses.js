(function initBridgeRulesPlayPlanSuitContractFinesses(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const deps = isCommonJs
    ? { core: require("../../core.js"), common: require("../common.js"), trumps: require("./trumps.js") }
    : { core: root.BridgeRulesParts?.core, common: root.BridgeRulesPlayPlanParts?.common, trumps: root.BridgeRulesPlayPlanParts?.suitContractTrumps };
  const api = factory(deps.core, deps.common, deps.trumps);
  if (isCommonJs) module.exports = api;
  root.BridgeRulesPlayPlanParts = root.BridgeRulesPlayPlanParts || {};
  root.BridgeRulesPlayPlanParts.suitContractFinesses = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesPlayPlanSuitContractFinesses(core, common, trumps) {
  "use strict";

  if (!core) throw new Error("BridgeRules play-plan suit-contract suitContractFinesses missing core dependency");
  if (!common) throw new Error("BridgeRules play-plan suit-contract suitContractFinesses missing common dependency");

  const {
    seats,
    suits,
    rankOrder,
    descendingRanks,
    hcpValue,
    compareCards,
    lowestCard,
    highestCard,
    teamOf,
    partnerOf
  } = core;
  const {
    visibleTopWinnerRanks,
    seatForSuitRank,
    blockedSuitInfo,
    cardsInSuit,
    hasRank,
    playedCardsFrom,
    finesseCandidate,
    repeatFinesseCandidate
  } = common;

  const { trumpEntryCandidateForSeat } = trumps || {};

  function suitContractFinessePriorities({ declarerHand, dummyHand, trump, declarer, dummy, playedCards = [], losers }) {
        const candidates = [];
        for (const suit of suits) {
          if (suit === trump || !losers?.bySuit?.[suit]) continue;
          const loserDetail = losers.detailsBySuit?.[suit];
          const missingTopHonors = loserDetail?.missingTopHonors || [];
          if (!missingTopHonors.length) continue;

          const declarerSuitCards = cardsInSuit(declarerHand, suit);
          const dummySuitCards = cardsInSuit(dummyHand, suit);
          const playedSuitCards = cardsInSuit(playedCards, suit);
          [
            {
              currentSuitCards: declarerSuitCards,
              partnerSuitCards: dummySuitCards,
              partnerHand: dummyHand,
              leadSeat: declarer,
              targetSeat: dummy
            },
            {
              currentSuitCards: dummySuitCards,
              partnerSuitCards: declarerSuitCards,
              partnerHand: declarerHand,
              leadSeat: dummy,
              targetSeat: declarer
            }
          ].forEach((direction) => {
            const candidate = finesseCandidate({
              suit,
              partnerHand: direction.partnerHand,
              currentSuitCards: direction.currentSuitCards,
              partnerSuitCards: direction.partnerSuitCards,
              playedSuitCards,
              partnerSeat: direction.targetSeat
            });
            if (!candidate) return;
            if (!candidate.missingHonors?.some((rank) => missingTopHonors.includes(rank))) return;

            candidates.push({
              kind: candidate.ruleId === "doubleFinesseTowardHonor" ? "doubleFinesse" : "finesse",
              confidence: "uncertain",
              suit,
              leadSeat: direction.leadSeat,
              targetSeat: candidate.targetSeat,
              finesseRank: candidate.finesseRank,
              missingHonor: candidate.missingHonor,
              missingHonors: candidate.missingHonors,
              guardRanks: candidate.guardRanks,
              entryType: candidate.entryType,
              entrySuit: candidate.entrySuit,
              entryRank: candidate.entryRank,
              baseSeat: losers.baseSeat || null,
              supportSeat: losers.supportSeat || null,
              loserCount: losers.bySuit[suit],
              reason: "Speel laag naar een beschermde honneur om een zijkleurverliezer in een kleurcontract weg te werken.",
              score: 48 + (losers.bySuit[suit] || 0) * 12 + candidate.score / 10
            });
          });
        }
        return candidates.sort((a, b) => b.score - a.score);
      }



  function suitTrumpEntryFinessePriorities({
      declarerHand,
      dummyHand,
      trump,
      declarer,
      dummy,
      trickHistory = [],
      currentTrick = [],
      playedCards = [],
      losers,
      finessePriorities = []
    }) {
        if (!trump || !losers || losers.total <= losers.allowed) return [];
        const sides = [
          { seat: declarer, hand: declarerHand },
          { seat: dummy, hand: dummyHand }
        ];
        const candidates = [];

        finessePriorities
          .filter((priority) => priority.kind === "finesse" && priority.missingHonor === "K" && priority.finesseRank === "Q")
          .forEach((priority) => {
            const targetSide = sides.find((side) => side.seat === priority.targetSeat);
            const leadSide = sides.find((side) => side.seat === priority.leadSeat);
            if (!targetSide || !leadSide) return;
            const targetSuitCards = cardsInSuit(targetSide.hand, priority.suit);
            const leadSuitCards = cardsInSuit(leadSide.hand, priority.suit);
            if (!hasRank(targetSuitCards, "A") || !hasRank(targetSuitCards, "Q") || !hasRank(targetSuitCards, "J")) return;
            if (leadSuitCards.filter((card) => rankOrder.indexOf(card.rank) < rankOrder.indexOf("Q")).length < 2) return;

            const entry = trumpEntryCandidateForSeat({
              declarerHand,
              dummyHand,
              trump,
              playedCards,
              entrySeat: priority.leadSeat,
              fromSeat: priority.targetSeat,
              declarer,
              dummy
            });
            if (!entry) return;

            candidates.push({
              entry: {
                kind: "useTrumpEntriesForRepeatedFinesse",
                confidence: "basic",
                trump,
                entrySeat: priority.leadSeat,
                fromSeat: priority.targetSeat,
                entryRank: entry.entryRank,
                entryLeadRank: entry.leadRank,
                finesseSuit: priority.suit,
                finesseRank: priority.finesseRank,
                repeatFinesseRank: "J",
                missingHonor: "K",
                timing: "beforeRepeatedFinesse",
                score: 118 + entry.remainingEntries * 12
              },
              followup: null,
              score: 118 + entry.remainingEntries * 12
            });
          });

        for (const suit of suits) {
          if (suit === trump || !losers.bySuit?.[suit]) continue;
          [
            { leadSeat: declarer, targetSeat: dummy, leadHand: declarerHand, targetHand: dummyHand },
            { leadSeat: dummy, targetSeat: declarer, leadHand: dummyHand, targetHand: declarerHand }
          ].forEach((direction) => {
            const repeat = repeatFinesseCandidate({
              suit,
              trickHistory,
              playedSuitCards: cardsInSuit(playedCards, suit),
              leadSeat: direction.leadSeat,
              targetSeat: direction.targetSeat,
              leadSuitCards: cardsInSuit(direction.leadHand, suit),
              targetSuitCards: cardsInSuit(direction.targetHand, suit),
              targetHand: direction.targetHand
            });
            if (!repeat || repeat.missingHonor !== "K" || repeat.finesseRank !== "J") return;
            const entry = trumpEntryCandidateForSeat({
              declarerHand,
              dummyHand,
              trump,
              playedCards,
              entrySeat: repeat.leadSeat,
              fromSeat: repeat.targetSeat,
              declarer,
              dummy
            });
            if (!entry) return;

            candidates.push({
              entry: {
                kind: "useTrumpEntriesForRepeatedFinesse",
                confidence: "basic",
                trump,
                entrySeat: repeat.leadSeat,
                fromSeat: repeat.targetSeat,
                entryRank: entry.entryRank,
                entryLeadRank: entry.leadRank,
                finesseSuit: repeat.suit,
                finesseRank: repeat.finesseRank,
                repeatFinesseRank: repeat.finesseRank,
                missingHonor: repeat.missingHonor,
                timing: "beforeRepeatedFinesse",
                score: 132 + entry.remainingEntries * 12
              },
              followup: repeat,
              score: 132 + entry.remainingEntries * 12
            });
          });
        }

        const best = candidates.sort((a, b) => b.score - a.score)[0];
        return best ? [best.entry, best.followup].filter(Boolean) : [];
      }



  return {
    suitContractFinessePriorities,
    suitTrumpEntryFinessePriorities
  };
});

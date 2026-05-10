(function initBridgeRulesPlayPlanSuitContractBase(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const deps = isCommonJs
    ? { core: require("../../core.js"), common: require("../common.js") }
    : { core: root.BridgeRulesParts?.core, common: root.BridgeRulesPlayPlanParts?.common };
  const api = factory(deps.core, deps.common);
  if (isCommonJs) module.exports = api;
  root.BridgeRulesPlayPlanParts = root.BridgeRulesPlayPlanParts || {};
  root.BridgeRulesPlayPlanParts.suitContractBase = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesPlayPlanSuitContractBase(core, common) {
  "use strict";

  if (!core) throw new Error("BridgeRules play-plan suit-contract suitContractBase missing core dependency");
  if (!common) throw new Error("BridgeRules play-plan suit-contract suitContractBase missing common dependency");

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

  function suitContractBaseHand({ declarerHand = [], dummyHand = [], trump, declarer = null, dummy = null }) {
        const declarerTrumpLength = cardsInSuit(declarerHand, trump).length;
        const dummyTrumpLength = cardsInSuit(dummyHand, trump).length;
        const dummyIsBase = dummyTrumpLength > declarerTrumpLength;
        return {
          baseSeat: dummyIsBase ? dummy : declarer,
          supportSeat: dummyIsBase ? declarer : dummy,
          baseHand: dummyIsBase ? dummyHand : declarerHand,
          supportHand: dummyIsBase ? declarerHand : dummyHand,
          baseTrumpLength: Math.max(declarerTrumpLength, dummyTrumpLength),
          supportTrumpLength: Math.min(declarerTrumpLength, dummyTrumpLength)
        };
      }



  function countSuitContractLosers(baseHand, supportHand, trump, neededTricks, { baseSeat = null, supportSeat = null } = {}) {
        const bySuit = {};
        const rawBySuit = {};
        const detailsBySuit = {};
        const supportTrumpLength = cardsInSuit(supportHand, trump).length;
        for (const suit of suits) {
          const detail = suitLoserEstimate(
            cardsInSuit(baseHand, suit),
            cardsInSuit(supportHand, suit),
            {
              isTrump: suit === trump,
              supportTrumpLength,
              baseSeat,
              supportSeat
            }
          );
          detailsBySuit[suit] = detail;
          bySuit[suit] = detail.losers;
          rawBySuit[suit] = detail.rawLosers;
        }
        return {
          total: Object.values(bySuit).reduce((total, count) => total + count, 0),
          bySuit,
          rawBySuit,
          detailsBySuit,
          baseSeat,
          supportSeat,
          allowed: 13 - neededTricks
        };
      }



  function suitLoserEstimate(baseSuitCards, supportSuitCards, { isTrump, supportTrumpLength, baseSeat = null, supportSeat = null }) {
      if (!baseSuitCards.length) {
        return {
          losers: 0,
          rawLosers: 0,
          topLosers: [],
          missingTopHonors: [],
          coverCards: [],
          ruffReduction: 0,
          trumpLengthCredit: 0,
          baseSeat,
          supportSeat,
          baseLength: 0,
          supportLength: supportSuitCards.length,
          declarerLength: 0,
          dummyLength: supportSuitCards.length,
          combinedLength: supportSuitCards.length
        };
      }
      const checks = ["A", "K", "Q"].slice(0, Math.min(3, baseSuitCards.length));
      const baseRanks = new Set(baseSuitCards.map((card) => card.rank));
      const supportRanks = new Set(supportSuitCards.map((card) => card.rank));
      const visibleRanks = new Set([...baseRanks, ...supportRanks]);
      const missingTopHonors = checks.filter((rank) => !visibleRanks.has(rank));
      const coverCards = checks.filter((rank) => !baseRanks.has(rank) && supportRanks.has(rank));
      const rawLosers = missingTopHonors.length;
      const combinedLength = baseSuitCards.length + supportSuitCards.length;
      const trumpLengthCredit = isTrump && combinedLength >= 9 && rawLosers > 0 ? 1 : 0;
      const ruffReduction = !isTrump && supportSuitCards.length <= 1 && supportTrumpLength >= 2
        ? Math.min(rawLosers, Math.max(0, baseSuitCards.length - supportSuitCards.length), 1)
        : 0;
      return {
        losers: Math.max(0, rawLosers - trumpLengthCredit - ruffReduction),
        rawLosers,
        topLosers: missingTopHonors,
        missingTopHonors,
        coverCards,
        ruffReduction,
        trumpLengthCredit,
        baseSeat,
        supportSeat,
        baseLength: baseSuitCards.length,
        supportLength: supportSuitCards.length,
        declarerLength: baseSuitCards.length,
        dummyLength: supportSuitCards.length,
        combinedLength
      };
    }



  return {
    suitContractBaseHand,
    countSuitContractLosers,
    suitLoserEstimate
  };
});

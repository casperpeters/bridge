(function initBridgeRulesPlayPlanSuitContract(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const deps = isCommonJs
    ? {
        core: require("../core.js"),
        common: require("./common.js"),
        base: require("./suit-contract/base.js"),
        trumps: require("./suit-contract/trumps.js"),
        sideSuits: require("./suit-contract/side-suits.js"),
        ruffs: require("./suit-contract/ruffs.js"),
        finesses: require("./suit-contract/finesses.js")
      }
    : {
        core: root.BridgeRulesParts?.core,
        common: root.BridgeRulesPlayPlanParts?.common,
        base: root.BridgeRulesPlayPlanParts?.suitContractBase,
        trumps: root.BridgeRulesPlayPlanParts?.suitContractTrumps,
        sideSuits: root.BridgeRulesPlayPlanParts?.suitContractSideSuits,
        ruffs: root.BridgeRulesPlayPlanParts?.suitContractRuffs,
        finesses: root.BridgeRulesPlayPlanParts?.suitContractFinesses
      };
  const api = factory(deps.core, deps.common, deps.base, deps.trumps, deps.sideSuits, deps.ruffs, deps.finesses);
  if (isCommonJs) module.exports = api;
  root.BridgeRulesPlayPlanParts = root.BridgeRulesPlayPlanParts || {};
  root.BridgeRulesPlayPlanParts.suitContract = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesPlayPlanSuitContract(core, common, base, trumps, sideSuits, ruffs, finesses) {
  "use strict";

  if (!core) throw new Error("BridgeRules play-plan suit-contract missing core dependency");
  if (!common) throw new Error("BridgeRules play-plan suit-contract missing common dependency");
  if (!base || !trumps || !sideSuits || !ruffs || !finesses) throw new Error("BridgeRules play-plan suit-contract missing domain dependency");

  const { playedCardsFrom } = common;
  const suitContractParts = {
    ...base,
    ...ruffs,
    ...finesses,
    ...sideSuits,
    ...trumps
  };
  const {
    suitContractBaseHand,
    countSuitContractLosers,
    suitLoserEstimate,
    shortSuitRuffPriorities,
    longSuitRuffDevelopmentPriorities,
    suitCrossRuffPriorities,
    suitLateCrossRuffPriorities,
    lateCrossRuffCashFirst,
    uniqueCardIds,
    compareLateCrossRuffLines,
    orderedUniqueLines,
    crossRuffPairScore,
    longSuitRuffEntryCandidates,
    longSuitRuffEntryCandidate,
    suitContractFinessePriorities,
    suitTrumpEntryFinessePriorities,
    suitWorkSuitBeforeTrumpEntryPriorities,
    nonTrumpEntryCandidate,
    realDiscardSuitsForSeat,
    suitDevelopDiscardPriorities,
    sideSuitFinesseDiscardCandidate,
    sideSuitDiscardDevelopmentCandidate,
    sideSuitDiscardLeadContext,
    sideSuitHonorLeadContext,
    sideSuitDiscardEntryCandidate,
    suitUrgentDiscardPriorities,
    urgentAttackedSuit,
    suitSideWinnerDetails,
    suitWinnerCardDetail,
    longerSuitSeat,
    suitCashPriorities,
    trumpEntryCandidateForSeat,
    suitContractTimingPlan,
    suitTrumpControl,
    playedTrumpRoundsFrom,
    trumpDelayPlan,
    drawTrumpPriority
  } = suitContractParts;

  function createSuitPlayPlan({ declarerHand, dummyHand, contract, declarer, dummy, trickHistory = [], currentTrick = [] }) {
      const neededTricks = contract.level + 6;
      const trump = contract.strain;
      const playedCards = playedCardsFrom(trickHistory, currentTrick);
      const base = suitContractBaseHand({ declarerHand, dummyHand, trump, declarer, dummy });
      const losers = countSuitContractLosers(base.baseHand, base.supportHand, trump, neededTricks, {
        baseSeat: base.baseSeat,
        supportSeat: base.supportSeat
      });
      const priorities = [];
      const ruffPriorities = shortSuitRuffPriorities(
        base.baseHand,
        base.supportHand,
        trump,
        base.baseSeat,
        base.supportSeat,
        losers.detailsBySuit
      );
      const longRuffPriorities = longSuitRuffDevelopmentPriorities(declarerHand, dummyHand, trump, declarer, dummy, playedCards);
      const directRuffPriorities = ruffPriorities.filter((priority) => {
        return !longRuffPriorities.some((longPriority) => longPriority.suit === priority.suit && longPriority.shortSeat === priority.shortSeat);
      });
      const cashPriorities = suitCashPriorities(declarerHand, dummyHand, trump, declarer, dummy, playedCards);
      const finessePriorities = suitContractFinessePriorities({
        declarerHand,
        dummyHand,
        trump,
        declarer,
        dummy,
        playedCards,
        losers
      });
      const trumpEntryFinessePriorities = suitTrumpEntryFinessePriorities({
        declarerHand,
        dummyHand,
        trump,
        declarer,
        dummy,
        trickHistory,
        currentTrick,
        playedCards,
        losers,
        finessePriorities
      });
      const urgentDiscardPriorities = suitUrgentDiscardPriorities({
        declarerHand,
        dummyHand,
        trump,
        declarer,
        dummy,
        currentTrick,
        trickHistory,
        losers,
        cashPriorities
      });
      const developDiscardPriorities = suitDevelopDiscardPriorities({
        declarerHand,
        dummyHand,
        trump,
        declarer,
        dummy,
        currentTrick,
        playedCards,
        losers
      });
      const workSuitTrumpEntryPriorities = suitWorkSuitBeforeTrumpEntryPriorities({
        declarerHand,
        dummyHand,
        trump,
        declarer,
        dummy,
        playedCards,
        losers
      });
      const crossRuffPriorities = suitCrossRuffPriorities({
        declarerHand,
        dummyHand,
        trump,
        declarer,
        dummy,
        playedCards
      });
      const lateCrossRuffPriorities = suitLateCrossRuffPriorities({
        declarerHand,
        dummyHand,
        trump,
        declarer,
        dummy,
        playedCards,
        currentTrick
      });
      const timingPlan = suitContractTimingPlan({
        declarerHand,
        dummyHand,
        trump,
        declarer,
        dummy,
        trickHistory,
        currentTrick,
        ruffPriorities: [...longRuffPriorities, ...directRuffPriorities],
        cashPriorities,
        urgentDiscardPriorities,
        developDiscardPriorities,
        trumpEntryFinessePriorities,
        workSuitTrumpEntryPriorities,
        lateCrossRuffPriorities,
        crossRuffPriorities
      });
      const trumpPriority = drawTrumpPriority(declarerHand, dummyHand, trump, timingPlan);
      const trumpTiming = trumpPriority?.timing || timingPlan?.timing || null;

      if (trumpTiming === "afterUrgentDiscard") {
        priorities.push(...urgentDiscardPriorities.slice(0, 1));
        if (trumpPriority) priorities.push(trumpPriority);
        priorities.push(...finessePriorities.slice(0, 1));
        priorities.push(...cashPriorities.filter((priority) => priority.timing !== "urgentBeforeTrumps").slice(0, 1));
      } else if (trumpTiming === "early") {
        if (trumpPriority) priorities.push(trumpPriority);
        priorities.push(...finessePriorities.slice(0, 1));
        priorities.push(...cashPriorities.slice(0, 1));
      } else if (trumpTiming === "limitedBeforeRuff") {
        if (trumpPriority) priorities.push(trumpPriority);
        priorities.push(...longRuffPriorities.slice(0, 1));
        priorities.push(...directRuffPriorities.slice(0, 2));
        priorities.push(...finessePriorities.slice(0, 1));
        priorities.push(...cashPriorities.slice(0, 1));
      } else if (trumpTiming === "afterUnblock") {
        priorities.push(...cashPriorities.filter((priority) => priority.timing === "unblockBeforeEntry").slice(0, 1));
        priorities.push(...longRuffPriorities.slice(0, 1));
        priorities.push(...directRuffPriorities.slice(0, 2));
        if (trumpPriority) priorities.push(trumpPriority);
        priorities.push(...finessePriorities.slice(0, 1));
        priorities.push(...cashPriorities.filter((priority) => priority.timing !== "unblockBeforeEntry").slice(0, 1));
      } else if (trumpTiming === "afterDevelopedDiscard") {
        priorities.push(...developDiscardPriorities.slice(0, 1));
        if (trumpPriority) priorities.push(trumpPriority);
        priorities.push(...finessePriorities.slice(0, 1));
        priorities.push(...cashPriorities.slice(0, 1));
      } else if (trumpTiming === "afterTrumpEntryFinesse") {
        priorities.push(...trumpEntryFinessePriorities.slice(0, 2));
        priorities.push(...finessePriorities.slice(0, 1));
        if (trumpPriority) priorities.push(trumpPriority);
      } else if (trumpTiming === "afterWorkSuitBeforeTrumpEntry") {
        priorities.push(...workSuitTrumpEntryPriorities.slice(0, 1));
        if (trumpPriority) priorities.push(trumpPriority);
        priorities.push(...cashPriorities.slice(0, 1));
      } else if (trumpTiming === "afterLateCrossRuff") {
        priorities.push(...lateCrossRuffPriorities.slice(0, 1));
        if (trumpPriority) priorities.push(trumpPriority);
        priorities.push(...cashPriorities.slice(0, 1));
      } else if (trumpTiming === "afterCrossRuff") {
        priorities.push(...crossRuffPriorities.slice(0, 1));
        if (trumpPriority) priorities.push(trumpPriority);
        priorities.push(...cashPriorities.slice(0, 1));
      } else {
        priorities.push(...longRuffPriorities.slice(0, 1));
        priorities.push(...directRuffPriorities.slice(0, 2));
        if (trumpPriority) priorities.push(trumpPriority);
        priorities.push(...finessePriorities.slice(0, 1));
        priorities.push(...cashPriorities.slice(0, 1));
      }
      const warnings = [];
      if (losers.total > losers.allowed) {
        warnings.push({
          kind: "tooManyLosers",
          losers: losers.total,
          allowed: losers.allowed
        });
      }
      cashPriorities
        .filter((priority) => priority.timing === "blockedNoEntry")
        .forEach((priority) => {
          warnings.push({
            kind: "blockedSuit",
            suit: priority.suit,
            blockedSeat: priority.firstSeat,
            longSeat: priority.targetSeat,
            cashFirstRanks: priority.cashRanks,
            strandedRanks: priority.strandedRanks
          });
        });

      return {
        type: "suit",
        confidence: warnings.length ? "uncertain" : "basic",
        neededTricks,
        sureWinners: null,
        losers,
        needToDevelop: 0,
        timingPlan,
        baseSeat: base.baseSeat,
        supportSeat: base.supportSeat,
        priorities: priorities.slice(0, 3),
        warnings,
        declarer,
        dummy
      };
    }



  return {
    createSuitPlayPlan,
    ...suitContractParts
  };
});

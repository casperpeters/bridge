(function initBridgeRulesPlayPlan(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const deps = isCommonJs
    ? {
        core: require("./core.js"),
        playMechanics: require("./play-mechanics.js"),
        common: require("./play-plan/common.js"),
        endgameRunout: require("./play-plan/endgame-runout.js"),
        notrump: require("./play-plan/notrump.js"),
        suitContract: require("./play-plan/suit-contract.js")
      }
    : {
        core: root.BridgeRulesParts?.core,
        playMechanics: root.BridgeRulesParts?.playMechanics,
        common: root.BridgeRulesPlayPlanParts?.common,
        endgameRunout: root.BridgeRulesPlayPlanParts?.endgameRunout,
        notrump: root.BridgeRulesPlayPlanParts?.notrump,
        suitContract: root.BridgeRulesPlayPlanParts?.suitContract
      };
  const api = factory(deps.core, deps.playMechanics, deps.common, deps.endgameRunout, deps.notrump, deps.suitContract);
  if (isCommonJs) module.exports = api;
  root.BridgeRulesParts = root.BridgeRulesParts || {};
  root.BridgeRulesParts.playPlan = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesPlayPlan(core, playMechanics, common, endgameRunout, notrump, suitContract) {
  "use strict";

  if (!core) throw new Error("BridgeRules play-plan missing core dependency");
  if (!common) throw new Error("BridgeRules play-plan missing common dependency");
  if (!endgameRunout) throw new Error("BridgeRules play-plan missing endgame-runout dependency");
  if (!notrump) throw new Error("BridgeRules play-plan missing notrump dependency");
  if (!suitContract) throw new Error("BridgeRules play-plan missing suit-contract dependency");

  const { createNotrumpPlayPlan } = notrump;
  const { createSuitPlayPlan } = suitContract;

  function createPlayPlan({
      declarerHand = [],
      dummyHand = [],
      contract = null,
      declarer = null,
      dummy = null,
      trickHistory = [],
      currentTrick = []
    } = {}) {
      if (!contract || !declarer || !dummy || !declarerHand.length || !dummyHand.length) return null;
      if (contract.strain === "NT") {
        return createNotrumpPlayPlan({ declarerHand, dummyHand, contract, declarer, dummy, trickHistory, currentTrick });
      }
      return createSuitPlayPlan({ declarerHand, dummyHand, contract, declarer, dummy, trickHistory, currentTrick });
    }

  const exportsByName = {
    createPlayPlan,
    ...notrump,
    ...suitContract,
    ...endgameRunout,
    ...common
  };
  const publicNames = [
    "createPlayPlan",
    "createNotrumpPlayPlan",
    "countSureWinners",
    "notrumpSuitWinnerDetail",
    "visibleTopWinnerRanks",
    "seatForSuitRank",
    "blockedSuitInfo",
    "clearOutsideEntryCard",
    "entryPlanForHand",
    "notrumpCashPriorities",
    "notrumpHoldUpPriorities",
    "notrumpDevelopmentPriorities",
    "notrumpForceOutAcePriorities",
    "notrumpPossibleBreakDevelopmentPriorities",
    "notrumpRepeatFinessePriorities",
    "repeatFinesseCandidate",
    "previousSuccessfulFinesse",
    "notrumpTwoWayFinessePriorities",
    "twoWayFinesseCandidate",
    "twoWayFinesseDirection",
    "notrumpFinessePriorities",
    "uniquePlanPriorities",
    "notrumpPlanWarnings",
    "clearOutsideEntries",
    "createSuitPlayPlan",
    "suitContractBaseHand",
    "countSuitContractLosers",
    "suitLoserEstimate",
    "shortSuitRuffPriorities",
    "longSuitRuffDevelopmentPriorities",
    "suitCrossRuffPriorities",
    "suitLateCrossRuffPriorities",
    "crossRuffPairScore",
    "longSuitRuffEntryCandidates",
    "longSuitRuffEntryCandidate",
    "suitContractFinessePriorities",
    "suitTrumpEntryFinessePriorities",
    "trumpEntryCandidateForSeat",
    "suitWorkSuitBeforeTrumpEntryPriorities",
    "nonTrumpEntryCandidate",
    "realDiscardSuitsForSeat",
    "suitDevelopDiscardPriorities",
    "sideSuitFinesseDiscardCandidate",
    "sideSuitDiscardDevelopmentCandidate",
    "sideSuitDiscardLeadContext",
    "sideSuitHonorLeadContext",
    "sideSuitDiscardEntryCandidate",
    "suitContractTimingPlan",
    "suitTrumpControl",
    "playedTrumpRoundsFrom",
    "suitCashPriorities",
    "suitUrgentDiscardPriorities",
    "urgentAttackedSuit",
    "trumpDelayPlan",
    "drawTrumpPriority",
    "cardsInSuit",
    "hasRank",
    "lowestSmallCardBelow",
    "sideAceEntry",
    "sameSuitFinesseEntry",
    "targetHandEntryPlan",
    "playedCardsFrom",
    "endgameRunoutPriority",
    "topTouchingHonorRun",
    "missingHigherRanks",
    "longSuitDevelopmentCandidate",
    "forceOutAceCandidate",
    "finesseCandidate"
  ];
  return Object.fromEntries(publicNames.map((name) => [name, exportsByName[name]]));
});

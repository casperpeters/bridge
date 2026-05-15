(function initBridgeRulesCardPlayPlanFollowing(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const deps = isCommonJs
    ? {
        core: require("../core.js"),
        playMechanics: require("../play-mechanics.js"),
        playPlan: require("../play-plan.js"),
        cardPlayCommon: require("./common.js"),
        followingCommon: require("./play-plan-following/common.js"),
        notrump: require("./play-plan-following/notrump.js"),
        ruffs: require("./play-plan-following/ruffs.js"),
        trumps: require("./play-plan-following/trumps.js"),
        sideSuits: require("./play-plan-following/side-suits.js")
      }
    : {
        core: root.BridgeRulesParts?.core,
        playMechanics: root.BridgeRulesParts?.playMechanics,
        playPlan: root.BridgeRulesParts?.playPlan,
        cardPlayCommon: root.BridgeRulesParts?.cardPlayCommon,
        followingCommon: root.BridgeRulesParts?.cardPlayPlanFollowingCommon,
        notrump: root.BridgeRulesParts?.cardPlayPlanFollowingNotrump,
        ruffs: root.BridgeRulesParts?.cardPlayPlanFollowingRuffs,
        trumps: root.BridgeRulesParts?.cardPlayPlanFollowingTrumps,
        sideSuits: root.BridgeRulesParts?.cardPlayPlanFollowingSideSuits
      };
  const api = factory(deps.core, deps.playMechanics, deps.playPlan, deps.cardPlayCommon, deps.followingCommon, deps.notrump, deps.ruffs, deps.trumps, deps.sideSuits);
  if (isCommonJs) module.exports = api;
  root.BridgeRulesParts = root.BridgeRulesParts || {};
  root.BridgeRulesParts.cardPlayPlanFollowing = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesCardPlayPlanFollowing(core, playMechanics, playPlan, cardPlayCommon, followingCommon, notrump, ruffs, trumps, sideSuits) {
  "use strict";

  if (!core) throw new Error("BridgeRules card-play plan-following missing core dependency");
  if (!playMechanics) throw new Error("BridgeRules card-play plan-following missing play-mechanics dependency");
  if (!playPlan) throw new Error("BridgeRules card-play plan-following missing play-plan dependency");
  if (!cardPlayCommon) throw new Error("BridgeRules card-play plan-following missing common dependency");
  if (!followingCommon || !notrump || !ruffs || !trumps || !sideSuits) throw new Error("BridgeRules card-play plan-following missing domain dependency");

  const { currentWinningPlay } = playMechanics;
  const planFollowingParts = {
    ...followingCommon,
    ...notrump,
    ...ruffs,
    ...trumps,
    ...sideSuits
  };
  const {
    describePlayPlanFallback,
    withPlayPlanFallback,
    legalPlanCard,
    choosePlanEndgameRunoutPlay,
    choosePlanHoldUpPlay,
    choosePlanPreserveWorkSuitEntryPlay,
    choosePlanDevelopmentPlay,
    choosePlanDevelopmentInTrickPlay,
    choosePlanForceOutAcePlay,
    choosePlanForceOutAceInTrickPlay,
    choosePlanFinessePlay,
    choosePlanFinesseInTrickPlay,
    choosePlanDirectionalFinessePlay,
    choosePlanDirectionalFinesseInTrickPlay,
    choosePlanLongSuitRuffDevelopmentPlay,
    choosePlanRuffInTrickPlay,
    choosePlanRuffPlay,
    choosePlanPrepareShortRuffPlay,
    choosePlanRuffEntryPlay,
    ruffEntryCandidates,
    ruffEntryCandidate,
    choosePlanCrossRuffPlay,
    choosePlanCrossRuffInTrickPlay,
    choosePlanLateCrossRuffPlay,
    choosePlanLateCrossRuffInTrickPlay,
    isPartnerWinnerSafeForCrossRuff,
    shouldRuffForLateCrossRuff,
    unseenHigherCardsInSuit,
    choosePlanDrawTrumpsPlay,
    choosePlanTrumpEntryForRepeatedFinessePlay,
    choosePlanTrumpEntryForRepeatedFinesseInTrickPlay,
    choosePlanDrawTrumpsInTrickPlay,
    choosePlanEstablishSideSuitForDiscardPlay,
    choosePlanEstablishSideSuitForDiscardInTrickPlay,
    choosePlanDevelopSideSuitBeforeTrumpEntryPlay,
    choosePlanDevelopSideSuitBeforeTrumpEntryInTrickPlay,
    choosePlanDiscardLoserOnWinnerPlay,
    shortSideCashRankCard,
    choosePlanDiscardLoserOnWinnerInTrickPlay,
    choosePlanCashWinnerPlay,
    choosePlanCashWinnerInTrickPlay
  } = planFollowingParts;

  function chooseCardFromPlayPlan({
      hand,
      partnerHand,
      currentTrick,
      trickHistory,
      seat,
      declarer,
      dummy,
      contract,
      trump,
      playPlan,
      legal
    }) {
      const decision = choosePlayPlanAction({
        hand,
        partnerHand,
        currentTrick,
        trickHistory,
        seat,
        declarer,
        dummy,
        contract,
        trump,
        playPlan,
        legal,
        winning: currentTrick.length ? currentWinningPlay(currentTrick, trump) : null
      });
      return decision.result;
    }



  function choosePlayPlanAction({
      hand,
      partnerHand,
      currentTrick,
      trickHistory,
      seat,
      declarer,
      dummy,
      contract,
      trump,
      playPlan,
      legal,
      winning = null
    }) {
      if (!playPlan?.priorities?.length) return { result: null, fallback: null };
      if (!partnerHand?.length || !declarer || !dummy) return { result: null, fallback: null };
      if (seat !== declarer && seat !== dummy) return { result: null, fallback: null };

      let explicitFallback = null;
      for (const priority of playPlan.priorities) {
        const result = chooseCardForPlanPriority({
          priority,
          hand,
          partnerHand,
          currentTrick,
          trickHistory,
          seat,
          contract,
          trump,
          legal,
          winning
        });
        if (result?.planFallbackOnly) {
          explicitFallback = explicitFallback || result.fallback;
          continue;
        }
        if (result) return { result, fallback: null };
      }

      return {
        result: null,
        fallback: explicitFallback || describePlayPlanFallback({
          priority: playPlan.priorities[0],
          hand,
          currentTrick,
          seat,
          legal
        })
      };
    }



  function chooseCardForPlanPriority({
      priority,
      hand,
      partnerHand,
      currentTrick = [],
      trickHistory,
      seat,
      contract,
      trump,
      legal,
      winning = null
    }) {
      if (currentTrick.length) {
        return chooseCardForPlanPriorityInTrick({
          priority,
          hand,
          partnerHand,
          currentTrick,
          trickHistory,
          seat,
          contract,
          trump,
          legal,
          winning
        });
      }
      if (priority.kind === "endgameRunout") {
        return choosePlanEndgameRunoutPlay({ priority, seat, legal });
      }
      if (priority.kind === "developLongSuit") {
        return choosePlanDevelopmentPlay({ priority, hand, partnerHand, seat, legal });
      }
      if (priority.kind === "forceOutAce") {
        return choosePlanForceOutAcePlay({ priority, hand, partnerHand, seat, legal });
      }
      if (priority.kind === "finesse" || priority.kind === "doubleFinesse" || priority.kind === "safeHandFinesse") {
        return choosePlanFinessePlay({ priority, hand, partnerHand, trickHistory, seat, legal });
      }
      if (priority.kind === "repeatFinesse" || priority.kind === "twoWayFinesse") {
        return choosePlanDirectionalFinessePlay({ priority, hand, partnerHand, seat, legal });
      }
      if (priority.kind === "ruffShortSuit") {
        return choosePlanRuffPlay({ priority, hand, partnerHand, trickHistory, seat, trump, legal });
      }
      if (priority.kind === "establishLongSuitByRuffing") {
        return choosePlanLongSuitRuffDevelopmentPlay({ priority, hand, partnerHand, trickHistory, seat, trump, legal });
      }
      if (priority.kind === "crossRuff") {
        return choosePlanCrossRuffPlay({ priority, hand, partnerHand, trickHistory, seat, trump, legal });
      }
      if (priority.kind === "lateCrossRuff") {
        return choosePlanLateCrossRuffPlay({ priority, hand, partnerHand, seat, trump, legal });
      }
      if (priority.kind === "useTrumpEntriesForRepeatedFinesse") {
        return choosePlanTrumpEntryForRepeatedFinessePlay({ priority, seat, legal });
      }
      if (priority.kind === "establishSideSuitForDiscard") {
        return choosePlanEstablishSideSuitForDiscardPlay({ priority, seat, legal });
      }
      if (priority.kind === "developSideSuitBeforeTrumpEntry") {
        return choosePlanDevelopSideSuitBeforeTrumpEntryPlay({ priority, seat, legal });
      }
      if (priority.kind === "drawTrumps") {
        return choosePlanDrawTrumpsPlay({ priority, contract, legal, seat });
      }
      if (priority.kind === "discardLoserOnWinner") {
        return choosePlanDiscardLoserOnWinnerPlay({ priority, hand, partnerHand, seat, legal });
      }
      if (priority.kind === "cashWinners" || priority.kind === "cashSureWinners") {
        return choosePlanCashWinnerPlay({ priority, hand, seat, legal });
      }
      return null;
    }



  function chooseCardForPlanPriorityInTrick({
      priority,
      hand,
      partnerHand,
      currentTrick,
      trickHistory,
      seat,
      contract,
      trump,
      legal,
      winning
    }) {
      if (priority.kind === "holdUpStopper") {
        return choosePlanHoldUpPlay({ playPlan: { priorities: [priority] }, hand, currentTrick, seat, trump, legal, winning });
      }
      if (priority.kind === "endgameRunout") {
        return choosePlanEndgameRunoutPlay({ priority, seat, legal });
      }
      if (priority.kind === "developLongSuit") {
        const preserveEntry = choosePlanPreserveWorkSuitEntryPlay({
          playPlan: { priorities: [priority] },
          hand,
          partnerHand,
          currentTrick,
          seat,
          trump,
          legal,
          winning
        });
        if (preserveEntry) return preserveEntry;
        return choosePlanDevelopmentInTrickPlay({ priority, hand, partnerHand, currentTrick, seat, legal });
      }
      if (priority.kind === "forceOutAce") {
        return choosePlanForceOutAceInTrickPlay({ priority, hand, partnerHand, currentTrick, seat, legal });
      }
      if (priority.kind === "finesse" || priority.kind === "doubleFinesse" || priority.kind === "safeHandFinesse") {
        return choosePlanFinesseInTrickPlay({ priority, currentTrick, seat, trump, legal, winning });
      }
      if (priority.kind === "repeatFinesse" || priority.kind === "twoWayFinesse") {
        return choosePlanDirectionalFinesseInTrickPlay({ priority, currentTrick, seat, trump, legal, winning });
      }
      if (priority.kind === "ruffShortSuit" || priority.kind === "establishLongSuitByRuffing") {
        return choosePlanRuffInTrickPlay({ playPlan: { priorities: [priority] }, hand, currentTrick, seat, trump, legal, winning });
      }
      if (priority.kind === "crossRuff") {
        return choosePlanCrossRuffInTrickPlay({ priority, hand, partnerHand, currentTrick, trickHistory, seat, trump, legal, winning });
      }
      if (priority.kind === "lateCrossRuff") {
        return choosePlanLateCrossRuffInTrickPlay({ priority, hand, partnerHand, currentTrick, trickHistory, seat, trump, legal, winning });
      }
      if (priority.kind === "useTrumpEntriesForRepeatedFinesse") {
        return choosePlanTrumpEntryForRepeatedFinesseInTrickPlay({ priority, currentTrick, seat, legal, winning });
      }
      if (priority.kind === "establishSideSuitForDiscard") {
        return choosePlanEstablishSideSuitForDiscardInTrickPlay({ priority, currentTrick, seat, trump, legal, winning });
      }
      if (priority.kind === "developSideSuitBeforeTrumpEntry") {
        return choosePlanDevelopSideSuitBeforeTrumpEntryInTrickPlay({ priority, currentTrick, seat, trump, legal, winning });
      }
      if (priority.kind === "discardLoserOnWinner") {
        return choosePlanDiscardLoserOnWinnerInTrickPlay({ priority, hand, currentTrick, seat, trump, legal, winning });
      }
      if (priority.kind === "drawTrumps") {
        return choosePlanDrawTrumpsInTrickPlay({ priority, contract, currentTrick, seat, legal, winning });
      }
      if (priority.kind === "cashWinners" || priority.kind === "cashSureWinners") {
        return choosePlanCashWinnerInTrickPlay({ priority, currentTrick, seat, trump, legal, winning });
      }
      return null;
    }



  return {
    chooseCardFromPlayPlan,
    choosePlayPlanAction,
    chooseCardForPlanPriority,
    chooseCardForPlanPriorityInTrick,
    ...planFollowingParts
  };
});

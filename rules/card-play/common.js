(function initBridgeRulesCardPlayCommon(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const deps = isCommonJs
    ? {
        core: require("../core.js"),
        playMechanics: require("../play-mechanics.js"),
        playPlan: require("../play-plan.js")
      }
    : root.BridgeRulesParts || {};
  const api = factory(deps.core, deps.playMechanics, deps.playPlan);
  if (isCommonJs) module.exports = api;
  root.BridgeRulesParts = root.BridgeRulesParts || {};
  root.BridgeRulesParts.cardPlayCommon = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesCardPlayCommon(core, playMechanics, playPlan) {
  "use strict";

  const { teamOf } = core;
  const { legalCards, currentWinningPlay } = playMechanics;
  const { playedCardsFrom } = playPlan;

  function cardPlayResult(card, ruleName, confidence, reason, extra = {}) {
    return {
      card,
      ruleId: ruleName,
      confidence,
      reason,
      ...extra
    };
  }

  function createCardPlayContext({ hand, currentTrick, trickHistory, seat, declarer, trump }) {
    const legal = legalCards(hand, currentTrick);
    const leadSuit = currentTrick[0]?.card?.suit || null;
    const winning = currentTrick.length ? currentWinningPlay(currentTrick, trump) : null;
    return {
      legal,
      playedCards: playedCardsFrom(trickHistory, currentTrick),
      leadSuit,
      winning,
      partnerWinning: Boolean(winning && seat && teamOf(winning.seat) === teamOf(seat)),
      isOpeningLead: currentTrick.length === 0 && trickHistory.length === 0,
      isDefender: Boolean(seat && declarer && teamOf(seat) !== teamOf(declarer)),
      isDeclarerSide: Boolean(seat && declarer && teamOf(seat) === teamOf(declarer))
    };
  }

  return {
    cardPlayResult,
    createCardPlayContext
  };
});

(function initBridgeRulesPlayMechanics(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const deps = isCommonJs ? { core: require("./core.js") } : root.BridgeRulesParts || {};
  const api = factory(deps.core);
  if (isCommonJs) module.exports = api;
  root.BridgeRulesParts = root.BridgeRulesParts || {};
  root.BridgeRulesParts.playMechanics = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesPlayMechanics(core) {
  "use strict";

  const { rankOrder } = core;

  function legalCards(hand, currentTrick) {
        if (!currentTrick.length) return hand;
        const leadSuit = currentTrick[0].card.suit;
        const followSuit = hand.filter((card) => card.suit === leadSuit);
        return followSuit.length ? followSuit : hand;
      }

  function beats(card, best, leadSuit, trump) {
        if (trump && card.suit === trump && best.suit !== trump) return true;
        if (trump && best.suit === trump && card.suit !== trump) return false;
        if (card.suit !== best.suit) return false;
        if (card.suit !== leadSuit && (!trump || card.suit !== trump)) return false;
        return rankOrder.indexOf(card.rank) > rankOrder.indexOf(best.rank);
      }

  function currentWinningPlay(currentTrick, trump) {
        if (!currentTrick.length) return null;
        const leadSuit = currentTrick[0].card.suit;
        return currentTrick.reduce((best, play) => beats(play.card, best.card, leadSuit, trump) ? play : best);
      }

  return {
    legalCards,
    beats,
    currentWinningPlay
  };
});

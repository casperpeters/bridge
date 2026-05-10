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

  const { suits, teamOf } = core;
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

  function visibleSuitStatus({ suit, hand = [], dummyHand = [], trickHistory = [], currentTrick = [], trump = null }) {
    hand = hand || [];
    dummyHand = dummyHand || [];
    trickHistory = trickHistory || [];
    currentTrick = currentTrick || [];
    const playedCards = playedCardsFrom(trickHistory, currentTrick);
    const playedCount = playedCards.filter((card) => card.suit === suit).length;
    const ownCount = hand.filter((card) => card.suit === suit).length;
    const dummyCount = dummyHand.filter((card) => card.suit === suit).length;
    const unknownCountInSuit = Math.max(0, 13 - playedCount - ownCount - dummyCount);
    const exhaustedForHiddenHands = unknownCountInSuit === 0;
    const declarerCanRuffSuit = Boolean(
      trump &&
      suit !== trump &&
      exhaustedForHiddenHands &&
      (dummyHand.some((card) => card.suit === trump) || unknownCountInSuitFor({ suit: trump, hand, dummyHand, playedCards }) > 0)
    );

    return {
      suit,
      playedCount,
      ownCount,
      dummyCount,
      unknownCountInSuit,
      exhaustedForHiddenHands,
      declarerCanRuffSuit
    };
  }

  function visibleSuitStatuses({ hand = [], dummyHand = [], trickHistory = [], currentTrick = [], trump = null }) {
    hand = hand || [];
    dummyHand = dummyHand || [];
    trickHistory = trickHistory || [];
    currentTrick = currentTrick || [];
    return suits.map((suit) => visibleSuitStatus({ suit, hand, dummyHand, trickHistory, currentTrick, trump }));
  }

  function unknownCountInSuitFor({ suit, hand = [], dummyHand = [], playedCards = [] }) {
    hand = hand || [];
    dummyHand = dummyHand || [];
    playedCards = playedCards || [];
    return Math.max(
      0,
      13 -
        playedCards.filter((card) => card.suit === suit).length -
        hand.filter((card) => card.suit === suit).length -
        dummyHand.filter((card) => card.suit === suit).length
    );
  }

  return {
    cardPlayResult,
    createCardPlayContext,
    visibleSuitStatus,
    visibleSuitStatuses
  };
});

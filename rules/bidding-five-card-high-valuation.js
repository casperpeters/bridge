(function initBridgeRulesBiddingFiveCardHighValuation(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const deps = isCommonJs ? { core: require("./core.js") } : root.BridgeRulesParts || {};
  const api = factory(deps.core);
  if (isCommonJs) module.exports = api;
  root.BridgeRulesParts = root.BridgeRulesParts || {};
  root.BridgeRulesParts.biddingFiveCardHighValuation = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesBiddingFiveCardHighValuation(core) {
  "use strict";

  const { bidStrains, hcpValue, fitPoints, suits } = core;

  function fitValuationContext(hand, shape, fitSuit, partnerMinTrumpLength) {
    const support = fitSuit && fitSuit !== "NT" ? shape.counts[fitSuit] || 0 : 0;
    return {
      valuation: "fitPoints",
      fitPoints: fitPoints(hand, fitSuit, partnerMinTrumpLength),
      fitSuit,
      support,
      partnerMinTrumpLength
    };
  }

  function hasConservativeFit(shape, fitSuit, partnerMinTrumpLength) {
    return Boolean(fitSuit && fitSuit !== "NT" && (shape.counts[fitSuit] || 0) + partnerMinTrumpLength >= 8);
  }

  function fitStrength(hand, shape, fitSuit, partnerMinTrumpLength) {
    return hasConservativeFit(shape, fitSuit, partnerMinTrumpLength)
      ? fitPoints(hand, fitSuit, partnerMinTrumpLength)
      : shape.hcp;
  }

  function optionalFitValuationContext(hand, shape, fitSuit, partnerMinTrumpLength) {
    return hasConservativeFit(shape, fitSuit, partnerMinTrumpLength)
      ? fitValuationContext(hand, shape, fitSuit, partnerMinTrumpLength)
      : {};
  }

  function suitQuality(hand, suit) {
    return hand.filter((card) => card.suit === suit && hcpValue[card.rank]).length;
  }

  function ruleOf20OpeningContext(shape, hand) {
    const longSuits = twoLongestSuitsForRuleOf20(shape, hand);
    const longSuitLength = longSuits.reduce((sum, suit) => sum + (shape.counts[suit] || 0), 0);
    const longSuitHcp = longSuits.reduce((sum, suit) => sum + hcpInSuit(hand, suit), 0);
    const score = shape.hcp + longSuitLength;
    return {
      ruleOf20Score: score,
      ruleOf20LongSuits: longSuits,
      ruleOf20LongSuitHcp: longSuitHcp,
      ruleOf20Eligible: shape.hcp < 12 && score >= 20 && longSuitHcp > shape.hcp / 2
    };
  }

  function twoLongestSuitsForRuleOf20(shape, hand) {
    return [...suits]
      .sort((a, b) => {
        const lengthDiff = (shape.counts[b] || 0) - (shape.counts[a] || 0);
        if (lengthDiff) return lengthDiff;
        const hcpDiff = hcpInSuit(hand, b) - hcpInSuit(hand, a);
        if (hcpDiff) return hcpDiff;
        return bidStrains.indexOf(b) - bidStrains.indexOf(a);
      })
      .slice(0, 2);
  }

  function hcpInSuit(hand, suit) {
    return hand.reduce((sum, card) => sum + (card.suit === suit ? hcpValue[card.rank] || 0 : 0), 0);
  }

  function hasStopper(hand, suit) {
    const cards = hand.filter((card) => card.suit === suit);
    const ranks = new Set(cards.map((card) => card.rank));
    return ranks.has("A") || (ranks.has("K") && cards.length >= 2) || (ranks.has("Q") && cards.length >= 3) || (ranks.has("J") && cards.length >= 4);
  }

  return {
    fitValuationContext,
    hasConservativeFit,
    fitStrength,
    optionalFitValuationContext,
    suitQuality,
    ruleOf20OpeningContext,
    twoLongestSuitsForRuleOf20,
    hcpInSuit,
    hasStopper
  };
});

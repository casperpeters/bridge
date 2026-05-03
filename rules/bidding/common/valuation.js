(function initBridgeRulesBiddingFiveCardHighValuation(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const deps = isCommonJs ? { core: require("../../core.js") } : root.BridgeRulesParts || {};
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

  function topHonorQuality(hand, suit) {
    return hand.filter((card) => card.suit === suit && (card.rank === "A" || card.rank === "K" || card.rank === "Q")).length;
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

  function strongTwoClubsPlayingTricksContext(shape, hand) {
    const candidates = [...suits]
      .filter((suit) => (shape.counts[suit] || 0) >= 6)
      .map((suit) => ({
        suit,
        length: shape.counts[suit] || 0,
        longSuitPlayingTricks: playingTricksInLongSuit(hand, suit),
        playingTricks: playingTricksInLongSuit(hand, suit) + outsideAces(hand, suit),
        suitHcp: hcpInSuit(hand, suit)
      }))
      .sort((a, b) => {
        const playingDiff = b.playingTricks - a.playingTricks;
        if (playingDiff) return playingDiff;
        const lengthDiff = b.length - a.length;
        if (lengthDiff) return lengthDiff;
        const hcpDiff = b.suitHcp - a.suitHcp;
        if (hcpDiff) return hcpDiff;
        return bidStrains.indexOf(b.suit) - bidStrains.indexOf(a.suit);
      });
    const best = candidates[0] || null;
    return {
      playingTricks: best?.playingTricks || 0,
      longSuitPlayingTricks: best?.longSuitPlayingTricks || 0,
      outsideAces: best ? outsideAces(hand, best.suit) : 0,
      longSuit: best?.suit || null,
      longSuitLength: best?.length || 0,
      playingTricksEligible: Boolean(best && best.playingTricks >= 8)
    };
  }

  function playingTricksInLongSuit(hand, suit) {
    const cards = hand.filter((card) => card.suit === suit);
    const length = cards.length;
    if (!length) return 0;
    const ranks = new Set(cards.map((card) => card.rank));
    let missingTopHonors = 0;
    if (!ranks.has("A")) missingTopHonors += 1;
    if (!ranks.has("K")) missingTopHonors += 1;
    if (!ranks.has("Q")) missingTopHonors += 1;
    return Math.max(0, length - missingTopHonors);
  }

  function outsideAces(hand, longSuit) {
    return hand.filter((card) => card.suit !== longSuit && card.rank === "A").length;
  }

  function ownPlayingTricks(hand) {
    return suits.reduce((sum, suit) => sum + ownPlayingTricksInSuit(hand, suit), 0);
  }

  function ownPlayingTricksInSuit(hand, suit) {
    const cards = hand.filter((card) => card.suit === suit);
    const ranks = new Set(cards.map((card) => card.rank));
    if (ranks.has("A")) {
      let tricks = 1;
      if (ranks.has("K")) {
        tricks += 1;
        if (ranks.has("Q")) {
          tricks += 1;
          if (ranks.has("J")) tricks += 1;
        }
      }
      return Math.min(tricks, cards.length);
    }
    if (ranks.has("K") && ranks.has("Q")) {
      let tricks = 1;
      if (ranks.has("J")) tricks += 1;
      return Math.min(tricks, cards.length);
    }
    if (ranks.has("Q") && ranks.has("J") && ranks.has("T")) return 1;
    return 0;
  }

  function weakTwoResponsePlayingTricks(hand, partnerSuit, options = {}) {
    const countSideKings = Boolean(options.countSideKings);
    const hasFit = Boolean(options.hasFit);
    const sideTricks = suits
      .filter((suit) => suit !== partnerSuit)
      .reduce((sum, suit) => sum + weakTwoResponseSideTricksInSuit(hand, suit, { countSideKings }), 0);
    return sideTricks + weakTwoResponsePartnerSuitTricks(hand, partnerSuit, { hasFit });
  }

  function weakTwoResponseSideTricksInSuit(hand, suit, { countSideKings = true } = {}) {
    const cards = hand.filter((card) => card.suit === suit);
    const length = cards.length;
    if (!length) return 0;
    const ranks = new Set(cards.map((card) => card.rank));

    if (ranks.has("A") && ranks.has("K") && ranks.has("Q")) return length;
    if (ranks.has("A") && ranks.has("K")) return 2;
    if (ranks.has("A") && ranks.has("Q")) return 1.5;
    if (ranks.has("A")) return 1;
    if (ranks.has("K") && ranks.has("Q")) return ranks.has("J") ? 1.5 : 1;
    if (countSideKings && ranks.has("K") && length >= 3) return 0.5;
    if (ranks.has("Q") && ranks.has("J") && ranks.has("T")) return 1;
    return 0;
  }

  function weakTwoResponsePartnerSuitTricks(hand, partnerSuit, { hasFit = false } = {}) {
    if (!hasFit || partnerSuit === "D") return 0;
    const ranks = new Set(hand.filter((card) => card.suit === partnerSuit).map((card) => card.rank));
    if (ranks.has("A") || ranks.has("K") || ranks.has("Q")) return 1;
    if (ranks.has("J")) return 0.5;
    return 0;
  }

  return {
    fitValuationContext,
    hasConservativeFit,
    fitStrength,
    optionalFitValuationContext,
    suitQuality,
    topHonorQuality,
    ruleOf20OpeningContext,
    twoLongestSuitsForRuleOf20,
    hcpInSuit,
    hasStopper,
    strongTwoClubsPlayingTricksContext,
    playingTricksInLongSuit,
    ownPlayingTricks,
    ownPlayingTricksInSuit,
    weakTwoResponsePlayingTricks
  };
});

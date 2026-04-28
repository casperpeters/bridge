(function initBridgeRulesBiddingFiveCardHighConventions(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const deps = isCommonJs
    ? {
        core: require("../../../core.js"),
        auction: require("../../../auction.js"),
        valuation: require("../../common/valuation.js")
      }
    : root.BridgeRulesParts || {};
  const api = factory(deps.core, deps.auction, deps.valuation || deps.biddingFiveCardHighValuation);
  if (isCommonJs) module.exports = api;
  root.BridgeRulesParts = root.BridgeRulesParts || {};
  root.BridgeRulesParts.biddingFiveCardHighConventions = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesBiddingFiveCardHighConventions(core, auction, valuationHelpers) {
  "use strict";

  const { suits, bidStrains, handShape } = core;
  const {
    Pass,
    bid,
    bidEquals,
    gameLevel,
    cheapestLevelForStrain,
    nextAvailableBid,
    isBidHigher
  } = auction;
  const { fitStrength } = valuationHelpers;

  function notrumpTransferSuit(partnerBid, chosenBid) {
        if (bidEquals(partnerBid, 1, "NT")) {
          if (bidEquals(chosenBid, 2, "D")) return "H";
          if (bidEquals(chosenBid, 2, "H")) return "S";
        }
        if (bidEquals(partnerBid, 2, "NT")) {
          if (bidEquals(chosenBid, 3, "D")) return "H";
          if (bidEquals(chosenBid, 3, "H")) return "S";
        }
        return null;
      }

  function chooseFiveCardHighNaturalContinuation(hand, partnerBid, lastBid) {
        const shape = handShape(hand);
        if (partnerBid?.strain && partnerBid.strain !== "NT" && shape.counts[partnerBid.strain] >= supportLengthForOpening(partnerBid.strain)) {
          const strength = fitStrength(hand, shape, partnerBid.strain, minimumOpeningLength(partnerBid.strain));
          if (strength >= 12) return bid(gameLevel(partnerBid.strain), partnerBid.strain);
          if (strength >= 10) return bid(3, partnerBid.strain);
          if (strength >= 6) return bid(2, partnerBid.strain);
        }
        if (shape.balanced && shape.hcp >= 12) return nextAvailableBid(bid(3, "NT"), lastBid);
        const suit = chooseSuitByLengthThenRank(suits.filter((candidate) => candidate !== partnerBid?.strain), shape, 5, true);
        if (suit && shape.hcp >= 10) return nextAvailableBid(bid(cheapestLevelForStrain(suit, lastBid), suit), lastBid);
        return Pass();
      }

  function chooseResponseSuit(candidates, shape, minimumLength) {
        return chooseSuitByLengthThenRank(candidates, shape, minimumLength, false);
      }

  function chooseSuitByLengthThenRank(candidates, shape, minimumLength, preferHighEqualLength, predicate = () => true) {
        return candidates
          .filter((suit) => shape.counts[suit] >= minimumLength && predicate(suit))
          .sort((a, b) => {
            const lengthDiff = shape.counts[b] - shape.counts[a];
            if (lengthDiff) return lengthDiff;
            const useHighTie = preferHighEqualLength || shape.counts[a] >= 5;
            return useHighTie ? bidStrains.indexOf(b) - bidStrains.indexOf(a) : bidStrains.indexOf(a) - bidStrains.indexOf(b);
          })[0] || null;
      }

  function chooseMajorByLength(shape, minimumLength) {
        if (shape.counts.S >= minimumLength && shape.counts.S >= shape.counts.H) return "S";
        if (shape.counts.H >= minimumLength) return "H";
        return null;
      }

  function hasFourCardMajor(shape) {
        return shape.counts.H >= 4 || shape.counts.S >= 4;
      }

  function isOneSuitOpeningFiveCardHigh(candidate) {
        return candidate?.level === 1 && candidate.strain !== "NT";
      }

  function isOneMinorOpeningFiveCardHigh(candidate) {
        return candidate?.level === 1 && (candidate.strain === "C" || candidate.strain === "D");
      }

  function isWeakTwoOpeningFiveCardHigh(candidate) {
        return candidate?.level === 2 && ["D", "H", "S"].includes(candidate.strain);
      }

  function supportLengthForOpening(strain) {
        if (strain === "H" || strain === "S") return 3;
        if (strain === "D") return 4;
        return 5;
      }

  function minimumOpeningLength(strain) {
        if (strain === "H" || strain === "S") return 5;
        if (strain === "D") return 4;
        return 2;
      }

  function minimumPreferenceLengthFiveCardHigh(strain) {
        return strain === "H" || strain === "S" ? 2 : 3;
      }

  function canBidAtOrBelow(candidate, lastBid, maximumLevel) {
        return candidate.level <= maximumLevel && isBidHigher(candidate, lastBid);
      }

  function chooseOpenerSecondSuit(shape, openedStrain, responderStrain = null, predicate = () => true) {
        const candidates = suits.filter((suit) => suit !== openedStrain && suit !== responderStrain && shape.counts[suit] >= 4);
        return chooseSuitByLengthThenRank(candidates, shape, 4, false, predicate);
      }

  function bestSuitByLength(shape) {
        return chooseSuitByLengthThenRank(["S", "H", "D", "C"], shape, 1, true);
      }


  return {
    notrumpTransferSuit,
    chooseFiveCardHighNaturalContinuation,
    chooseResponseSuit,
    chooseSuitByLengthThenRank,
    chooseMajorByLength,
    hasFourCardMajor,
    isOneSuitOpeningFiveCardHigh,
    isOneMinorOpeningFiveCardHigh,
    isWeakTwoOpeningFiveCardHigh,
    supportLengthForOpening,
    minimumOpeningLength,
    minimumPreferenceLengthFiveCardHigh,
    canBidAtOrBelow,
    chooseOpenerSecondSuit,
    bestSuitByLength
  };
});

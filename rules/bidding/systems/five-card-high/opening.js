(function initBridgeRulesBiddingFiveCardHighOpening(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const deps = isCommonJs
    ? {
        core: require("../../../core.js"),
        auction: require("../../../auction.js"),
        valuation: require("../../common/valuation.js"),
        result: require("../../common/result.js"),
        conventions: require("./conventions.js")
      }
    : root.BridgeRulesParts || {};
  const api = factory(
    deps.core,
    deps.auction,
    deps.valuation || deps.biddingFiveCardHighValuation,
    deps.result || deps.biddingCommonResult,
    deps.conventions || deps.biddingFiveCardHighConventions
  );
  if (isCommonJs) module.exports = api;
  root.BridgeRulesParts = root.BridgeRulesParts || {};
  root.BridgeRulesParts.biddingFiveCardHighOpening = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesBiddingFiveCardHighOpening(core, auction, valuationHelpers, resultHelpers, conventionHelpers) {
  "use strict";

  const { biddingSystems, handShape, teamOf, isTeamVulnerable } = core;
  const { Pass, bid, bidEquals } = auction;
  const { hcpInSuit, ruleOf20OpeningContext, suitQuality, strongTwoClubsPlayingTricksContext } = valuationHelpers;
  const { bidChoiceResult } = resultHelpers;
  const { chooseSuitByLengthThenRank } = conventionHelpers;

  function fiveCardHighBidChoiceResult(bid, ruleName, confidence, reason, extra = {}) {
    return bidChoiceResult(biddingSystems.fiveCardHigh, bid, ruleName, confidence, reason, extra);
  }

  function chooseFiveCardHighOpening(hand, options = {}) {
        const shape = handShape(hand);
        const vulnerable = openingVulnerability(options);

        if (shape.balanced) {
          if (shape.hcp >= 23) return bid(2, "C");
          if (shape.hcp >= 20 && shape.hcp <= 22) return bid(2, "NT");
          if (shape.hcp >= 15 && shape.hcp <= 17) return bid(1, "NT");
        }

        const strongTwoClubsTricks = strongTwoClubsPlayingTricksContext(shape, hand);
        if (shape.hcp >= 20 || strongTwoClubsTricks.playingTricksEligible) return bid(2, "C");

        const weakTwo = chooseFiveCardHighWeakTwo(shape, hand, { vulnerable });
        if (weakTwo) return weakTwo;

        const preempt = chooseFiveCardHighPreempt(shape, hand, { vulnerable });
        if (preempt) return preempt;

        const ruleOf20 = ruleOf20OpeningContext(shape, hand);
        if ((shape.hcp < 12 && !ruleOf20.ruleOf20Eligible) || shape.hcp > 19) return Pass();

        const major = chooseFiveCardHighOpeningMajor(shape);
        if (major) return bid(1, major);
        return bid(1, chooseFiveCardHighOpeningMinor(shape));
      }

  function chooseFiveCardHighOpeningMajor(shape) {
        const counts = shape.counts;
        const longestMajor = Math.max(counts.H, counts.S);
        const longestMinor = Math.max(counts.C, counts.D);
        if (longestMajor < 5 || longestMinor > longestMajor) return null;
        if (counts.S >= 5 && counts.S >= counts.H) return "S";
        if (counts.H >= 5) return "H";
        return null;
      }

  function chooseFiveCardHighOpeningMinor(shape) {
        const counts = shape.counts;
        if (counts.C >= 5 && counts.D >= 5) return "D";
        if (counts.D > counts.C && counts.D >= 4) return "D";
        if (counts.C > counts.D && counts.C >= 4) return "C";
        if (counts.C === 4 && counts.D === 4) return "C";
        if (counts.D >= 4) return "D";
        return "C";
      }

  function chooseFiveCardHighWeakTwo(shape, hand, options = {}) {
        const uglyEleven = shape.hcp === 11 && !ruleOf20OpeningContext(shape, hand).ruleOf20Eligible;
        if (shape.hcp < 6 || (shape.hcp > 10 && !uglyEleven)) return null;
        const vulnerable = Boolean(options.vulnerable);
        const suit = chooseSuitByLengthThenRank(["S", "H", "D"], shape, 6, true, (candidate) => {
          if (shape.counts[candidate] === 6 && suitQuality(hand, candidate) >= 2) return true;
          return vulnerable && isExceptionalSixPointPreemptSuit(shape, hand, candidate);
        });
        return suit ? bid(2, suit) : null;
      }

  function chooseFiveCardHighPreempt(shape, hand, options = {}) {
        if (shape.hcp < 6 || shape.hcp > 10) return null;
        const vulnerable = Boolean(options.vulnerable);
        const suit = chooseSuitByLengthThenRank(["S", "H", "D", "C"], shape, 7, true, (candidate) => isPreemptSuit(shape, hand, candidate, { vulnerable }));
        if (!suit) return null;
        return bid(shape.counts[suit] >= 8 ? 4 : 3, suit);
      }

  function isPreemptSuit(shape, hand, suit, { vulnerable = false } = {}) {
        const length = shape.counts[suit] || 0;
        if (length < 7 || suitQuality(hand, suit) < 2) return false;
        if (shape.hcp >= 7 && shape.hcp <= 10) return true;
        return !vulnerable && isExceptionalSixPointPreemptSuit(shape, hand, suit);
      }

  function isExceptionalSixPointPreemptSuit(shape, hand, suit) {
        const length = shape.counts[suit] || 0;
        if (shape.hcp !== 6 || length < 7 || hcpInSuit(hand, suit) !== 6) return false;
        const ranks = new Set(hand.filter((card) => card.suit === suit).map((card) => card.rank));
        return ranks.has("K") && ranks.has("Q") && ranks.has("J") && ranks.has("T") && !ranks.has("A");
      }

  function openingVulnerability(options = {}) {
        if (typeof options.vulnerable === "boolean") return options.vulnerable;
        if (!options.seat) return false;
        return isTeamVulnerable(teamOf(options.seat), options.vulnerability || "none");
      }


  function describeOpeningBidChoice(chosenBid, shape, hand, base) {
        const ruleOf20 = ruleOf20OpeningContext(shape, hand);
        const strongTwoClubsTricks = strongTwoClubsPlayingTricksContext(shape, hand);
        const extra = {
          ...base,
          ...ruleOf20,
          ...strongTwoClubsTricks,
          category: "opening",
          suit: chosenBid.strain,
          length: shape.counts[chosenBid.strain] || 0,
          exceptionalSixPointPreempt: chosenBid.strain && chosenBid.strain !== "NT"
            ? isExceptionalSixPointPreemptSuit(shape, hand, chosenBid.strain)
            : false
        };
        if (bidEquals(chosenBid, 1, "NT")) {
          return fiveCardHighBidChoiceResult(chosenBid, "opening.oneNotrump", "basic", "Open 1NT with 15-17 HCP and a balanced hand.", extra);
        }
        if (bidEquals(chosenBid, 2, "NT")) {
          return fiveCardHighBidChoiceResult(chosenBid, "opening.twoNotrump", "basic", "Open 2NT with 20-22 HCP and a balanced hand.", extra);
        }
        if (bidEquals(chosenBid, 2, "C")) {
          return fiveCardHighBidChoiceResult(chosenBid, "opening.strongTwoClubs", "basic", "Open a strong artificial 2C with a very strong hand or a long suit with at least eight playing tricks.", extra);
        }
        if (chosenBid.level === 2 && ["D", "H", "S"].includes(chosenBid.strain)) {
          return fiveCardHighBidChoiceResult(chosenBid, "opening.weakTwo", "basic", "Open a weak two with 6-10 HCP, or an ugly 11 HCP hand, and a good six-card suit.", extra);
        }
        if (chosenBid.level >= 3 && chosenBid.strain !== "NT") {
          return fiveCardHighBidChoiceResult(chosenBid, "opening.preempt", "basic", "Preempt with a long suit and limited strength.", extra);
        }
        if (shape.hcp < 12 && ruleOf20.ruleOf20Eligible) {
          const suffix = chosenBid.strain === "H" || chosenBid.strain === "S" ? "OneMajor" : "OneMinor";
          return fiveCardHighBidChoiceResult(chosenBid, `opening.ruleOf20${suffix}`, "basic", "Open with fewer than 12 HCP because the Rule of 20 is met and most values are in the two long suits.", extra);
        }
        if (chosenBid.level === 1 && (chosenBid.strain === "H" || chosenBid.strain === "S")) {
          return fiveCardHighBidChoiceResult(chosenBid, "opening.oneMajor", "basic", "Open the longest available five-card major with opening strength.", extra);
        }
        if (chosenBid.level === 1 && (chosenBid.strain === "C" || chosenBid.strain === "D")) {
          return fiveCardHighBidChoiceResult(chosenBid, "opening.oneMinor", "basic", "Open the preferred minor because there is no five-card major or notrump opening.", extra);
        }
        return fiveCardHighBidChoiceResult(chosenBid, "opening.natural", "basic", "Open naturally in the selected strain.", extra);
      }


  return {
    chooseFiveCardHighOpening,
    chooseFiveCardHighOpeningMajor,
    chooseFiveCardHighOpeningMinor,
    chooseFiveCardHighWeakTwo,
    chooseFiveCardHighPreempt,
    isPreemptSuit,
    isExceptionalSixPointPreemptSuit,
    describeOpeningBidChoice
  };
});

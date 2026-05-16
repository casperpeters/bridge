(function initBridgeRulesBiddingFiveCardHighCompetitivePreemptDefense(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const deps = isCommonJs
    ? {
        core: require("../../../../../core.js"),
        auction: require("../../../../../auction.js"),
        valuation: require("../../../../common/valuation.js"),
        result: require("../../../../common/result.js"),
        conventions: require("../../conventions.js")
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
  root.BridgeRulesParts.biddingFiveCardHighCompetitivePreemptDefense = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesBiddingFiveCardHighCompetitivePreemptDefense(core, auction, valuationHelpers, resultHelpers, conventionHelpers) {
  "use strict";

  const {
    suits,
    biddingSystems,
    handShape,
    teamOf
  } = core;
  const {
    Pass,
    Double,
    isPass,
    isDouble,
    isRedouble,
    isContractBid,
    highestBid,
    bid,
    cheapestLevelForStrain
  } = auction;
  const { suitQuality, hasStopper } = valuationHelpers;
  const { bidChoiceResult } = resultHelpers;
  const { chooseSuitByLengthThenRank } = conventionHelpers;

  function fiveCardHighBidChoiceResult(bid, ruleName, confidence, reason, extra = {}) {
    return bidChoiceResult(biddingSystems.fiveCardHigh, bid, ruleName, confidence, reason, extra);
  }

  function chooseFallbackBid(steps, fallback = Pass()) {
    for (const step of steps) {
      const candidate = step();
      if (candidate) return candidate;
    }
    return fallback;
  }

  function partnershipNonPassCalls(auction, seat) {
    return auction.filter((call) =>
      teamOf(call.seat) === teamOf(seat) &&
      (isContractBid(call.bid) || isDouble(call.bid) || isRedouble(call.bid))
    );
  }

  function choosePreemptDefenseAction({ hand = [], shape = handShape(hand), auction = [], opponentBid = highestBid(auction) } = {}) {
    if (!opponentBid || !isContractBid(opponentBid)) return null;
    if (isWeakTwoOpponentOpening(opponentBid)) return chooseWeakTwoDefenseFiveCardHigh(shape, hand, opponentBid);
    if (isPreemptOpponentOpening(opponentBid)) return choosePreemptDefenseFiveCardHigh(shape, hand, opponentBid);
    return null;
  }

  function describePreemptDefenseAction({ chosenBid, shape, hand = [], auction = [], seat, base = {} } = {}) {
    if (!chosenBid || isPass(chosenBid)) return null;
    const lastBid = highestBid(auction);
    const initialDefense = partnershipNonPassCalls(auction, seat).length === 0;
    if (!initialDefense) return null;

    if (isDouble(chosenBid)) {
      if (shouldMakeWeakTwoDefenseDouble(shape, hand, lastBid)) {
        return fiveCardHighBidChoiceResult(chosenBid, "competitive.weakTwoDefenseDouble", "basic", "Defend against their weak two with a takeout double, or with a strong hand and a very good own suit.", {
          ...base,
          category: "competitive",
          opponentSuit: lastBid?.strain || null,
          takeoutShape: hasWeakTwoDefenseTakeoutShape(shape, lastBid),
          strongOwnSuit: weakTwoDefenseStrongOwnSuit(shape, hand, lastBid),
          minimumHcp: hasWeakTwoDefenseStrongOwnSuit(shape, hand, lastBid) ? 16 : 12
        });
      }
      if (shouldMakePreemptDefenseDouble(shape, hand, lastBid)) {
        return fiveCardHighBidChoiceResult(chosenBid, "competitive.preemptDefenseDouble", "basic", "Defend against their preempt with a takeout double, or with a strong hand and a very good own suit.", {
          ...base,
          category: "competitive",
          opponentSuit: lastBid?.strain || null,
          takeoutShape: hasPreemptDefenseTakeoutShape(shape, lastBid),
          strongOwnSuit: preemptDefenseStrongOwnSuit(shape, hand, lastBid),
          minimumHcp: hasPreemptDefenseStrongOwnSuit(shape, hand, lastBid) ? 19 : 13
        });
      }
      return null;
    }

    const extra = {
      ...base,
      category: "competitive",
      suit: chosenBid.strain,
      length: shape.counts[chosenBid.strain] || 0,
      opponentSuit: lastBid?.strain || null,
      partnerSuit: null
    };

    if (isWeakTwoOpponentOpening(lastBid)) {
      if (chosenBid.strain === "NT") {
        const game = chosenBid.level >= 3;
        return fiveCardHighBidChoiceResult(chosenBid, game ? "competitive.weakTwoDefenseNotrumpGame" : "competitive.weakTwoDefenseNotrumpInvite", "basic", "Defend against their weak two with notrump, balanced strength, and a stopper in their suit.", {
          ...extra,
          minimumHcp: game ? 19 : 15,
          maximumHcp: game ? undefined : 18,
          stopperSuit: lastBid.strain
        });
      }
      return fiveCardHighBidChoiceResult(chosenBid, "competitive.weakTwoDefenseSuitOvercall", "basic", "Defend against their weak two with a reasonable five-card suit and 12-15 points.", {
        ...extra,
        minimumHcp: 12,
        maximumHcp: 15
      });
    }

    if (isPreemptOpponentOpening(lastBid)) {
      if (chosenBid.strain === "NT") {
        return fiveCardHighBidChoiceResult(chosenBid, "competitive.preemptDefenseNotrumpGame", "basic", "Defend against their preempt with 3NT, balanced strength, and stoppers.", {
          ...extra,
          minimumHcp: 19,
          stopperSuit: lastBid.strain
        });
      }
      return fiveCardHighBidChoiceResult(chosenBid, "competitive.preemptDefenseSuitOvercall", "basic", "Defend against their preempt with a five-card suit, two honors, and 13-18 points.", {
        ...extra,
        minimumHcp: 13,
        maximumHcp: 18
      });
    }

    return null;
  }

  function chooseWeakTwoDefenseFiveCardHigh(shape, hand, opponentBid) {
    if (!isWeakTwoOpponentOpening(opponentBid)) return null;
    return chooseFallbackBid([
      () => chooseWeakTwoDefenseNotrump(shape, hand, opponentBid),
      () => chooseWeakTwoDefenseSuitOvercall(shape, hand, opponentBid),
      () => shouldMakeWeakTwoDefenseDouble(shape, hand, opponentBid) ? Double() : null
    ], null);
  }

  function isWeakTwoOpponentOpening(candidate) {
    return candidate?.level === 2 && ["D", "H", "S"].includes(candidate.strain);
  }

  function chooseWeakTwoDefenseNotrump(shape, hand, opponentBid) {
    if (!shape.balanced || opponentBid.strain === "NT" || !hasStopper(hand, opponentBid.strain)) return null;
    if (shape.hcp >= 19) return bid(3, "NT");
    if (shape.hcp >= 15 && shape.hcp <= 18) return bid(2, "NT");
    return null;
  }

  function chooseWeakTwoDefenseSuitOvercall(shape, hand, opponentBid) {
    if (shape.hcp < 12 || shape.hcp > 15) return null;
    const overcallSuit = chooseSuitByLengthThenRank(
      suits.filter((suit) => suit !== opponentBid.strain),
      shape,
      5,
      true,
      (candidate) => suitQuality(hand, candidate) >= 2
    );
    return overcallSuit ? bid(cheapestLevelForStrain(overcallSuit, opponentBid), overcallSuit) : null;
  }

  function shouldMakeWeakTwoDefenseDouble(shape, hand, opponentBid) {
    if (!isWeakTwoOpponentOpening(opponentBid)) return false;
    return hasWeakTwoDefenseTakeoutShape(shape, opponentBid) || hasWeakTwoDefenseStrongOwnSuit(shape, hand, opponentBid);
  }

  function hasWeakTwoDefenseTakeoutShape(shape, opponentBid) {
    if (shape.hcp < 12 || (shape.counts[opponentBid.strain] || 0) > 2) return false;
    return suits
      .filter((suit) => suit !== opponentBid.strain)
      .every((suit) => (shape.counts[suit] || 0) >= (suit === "H" || suit === "S" ? 4 : 3));
  }

  function weakTwoDefenseStrongOwnSuit(shape, hand, opponentBid) {
    return chooseSuitByLengthThenRank(
      suits.filter((suit) => suit !== opponentBid.strain),
      shape,
      6,
      true,
      (candidate) => suitQuality(hand, candidate) >= 2
    );
  }

  function hasWeakTwoDefenseStrongOwnSuit(shape, hand, opponentBid) {
    return shape.hcp >= 16 && Boolean(weakTwoDefenseStrongOwnSuit(shape, hand, opponentBid));
  }

  function choosePreemptDefenseFiveCardHigh(shape, hand, opponentBid) {
    if (!isPreemptOpponentOpening(opponentBid)) return null;
    return chooseFallbackBid([
      () => choosePreemptDefenseNotrump(shape, hand, opponentBid),
      () => choosePreemptDefenseSuitOvercall(shape, hand, opponentBid),
      () => shouldMakePreemptDefenseDouble(shape, hand, opponentBid) ? Double() : null
    ], null);
  }

  function isPreemptOpponentOpening(candidate) {
    return candidate?.level >= 3 && candidate.strain && candidate.strain !== "NT";
  }

  function choosePreemptDefenseNotrump(shape, hand, opponentBid) {
    if (opponentBid.level !== 3 || !shape.balanced || shape.hcp < 19) return null;
    if (!hasStopper(hand, opponentBid.strain)) return null;
    if (!suits.every((suit) => hasStopper(hand, suit))) return null;
    return bid(3, "NT");
  }

  function choosePreemptDefenseSuitOvercall(shape, hand, opponentBid) {
    if (opponentBid.level !== 3 || shape.hcp < 13 || shape.hcp > 18) return null;
    const overcallSuit = chooseSuitByLengthThenRank(
      suits.filter((suit) => suit !== opponentBid.strain),
      shape,
      5,
      true,
      (candidate) => suitQuality(hand, candidate) >= 2 && cheapestLevelForStrain(candidate, opponentBid) === 3
    );
    return overcallSuit ? bid(3, overcallSuit) : null;
  }

  function shouldMakePreemptDefenseDouble(shape, hand, opponentBid) {
    if (!isPreemptOpponentOpening(opponentBid)) return false;
    return hasPreemptDefenseTakeoutShape(shape, opponentBid) || hasPreemptDefenseStrongOwnSuit(shape, hand, opponentBid);
  }

  function hasPreemptDefenseTakeoutShape(shape, opponentBid) {
    if (shape.hcp < 13 || (shape.counts[opponentBid.strain] || 0) > 2) return false;
    return suits
      .filter((suit) => suit !== opponentBid.strain)
      .every((suit) => (shape.counts[suit] || 0) >= (suit === "H" || suit === "S" ? 4 : 3));
  }

  function preemptDefenseStrongOwnSuit(shape, hand, opponentBid) {
    return chooseSuitByLengthThenRank(
      suits.filter((suit) => suit !== opponentBid.strain),
      shape,
      6,
      true,
      (candidate) => suitQuality(hand, candidate) >= 2
    );
  }

  function hasPreemptDefenseStrongOwnSuit(shape, hand, opponentBid) {
    return shape.hcp >= 19 && Boolean(preemptDefenseStrongOwnSuit(shape, hand, opponentBid));
  }

  return {
    choosePreemptDefenseAction,
    describePreemptDefenseAction,
    chooseWeakTwoDefenseFiveCardHigh,
    isWeakTwoOpponentOpening,
    chooseWeakTwoDefenseNotrump,
    chooseWeakTwoDefenseSuitOvercall,
    shouldMakeWeakTwoDefenseDouble,
    hasWeakTwoDefenseTakeoutShape,
    weakTwoDefenseStrongOwnSuit,
    hasWeakTwoDefenseStrongOwnSuit,
    choosePreemptDefenseFiveCardHigh,
    isPreemptOpponentOpening,
    choosePreemptDefenseNotrump,
    choosePreemptDefenseSuitOvercall,
    shouldMakePreemptDefenseDouble,
    hasPreemptDefenseTakeoutShape,
    preemptDefenseStrongOwnSuit,
    hasPreemptDefenseStrongOwnSuit
  };
});

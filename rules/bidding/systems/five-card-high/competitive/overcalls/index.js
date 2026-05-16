(function initBridgeRulesBiddingFiveCardHighCompetitiveOvercalls(root, factory) {
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
  root.BridgeRulesParts.biddingFiveCardHighCompetitiveOvercalls = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesBiddingFiveCardHighCompetitiveOvercalls(core, auction, valuationHelpers, resultHelpers, conventionHelpers) {
  "use strict";

  const {
    suits,
    biddingSystems,
    handShape,
    teamOf,
    isTeamVulnerable
  } = core;
  const {
    bid,
    isPass,
    isContractBid,
    highestBid,
    cheapestLevelForStrain
  } = auction;
  const { suitQuality, topHonorQuality, hasStopper } = valuationHelpers;
  const { bidChoiceResult } = resultHelpers;
  const { chooseSuitByLengthThenRank } = conventionHelpers;

  function fiveCardHighBidChoiceResult(bid, ruleName, confidence, reason, extra = {}) {
    return bidChoiceResult(biddingSystems.fiveCardHigh, bid, ruleName, confidence, reason, extra);
  }

  function chooseFallbackBid(steps, fallback = null) {
    for (const step of steps) {
      const candidate = step();
      if (candidate) return candidate;
    }
    return fallback;
  }

  function chooseOvercallAction({ hand = [], shape, auction = [], seat, vulnerability = "none", stage = "all" } = {}) {
    const handShapeValue = shape || handShape(hand);
    const lastBid = highestBid(auction);
    if (!lastBid || !isContractBid(lastBid)) return null;
    if (isWeakTwoOpponentOpening(lastBid) || isPreemptOpponentOpening(lastBid)) return null;

    const vulnerable = seat ? isTeamVulnerable(teamOf(seat), vulnerability) : false;
    if (stage === "beforeTakeout") {
      return chooseFallbackBid([
        () => chooseProtectiveOneMajorOverMinor(handShapeValue, hand, auction, seat),
        () => chooseOneNotrumpOvercall(handShapeValue, hand, lastBid),
        () => chooseWeakJumpOvercall(handShapeValue, hand, lastBid)
      ]);
    }
    if (stage === "afterTakeout") {
      return chooseFallbackBid([
        () => chooseStrongOneMajorOvercall(handShapeValue, hand, lastBid),
        () => chooseSimpleSuitOvercall(handShapeValue, hand, lastBid, vulnerable)
      ]);
    }
    return chooseFallbackBid([
      () => chooseProtectiveOneMajorOverMinor(handShapeValue, hand, auction, seat),
      () => chooseOneNotrumpOvercall(handShapeValue, hand, lastBid),
      () => chooseWeakJumpOvercall(handShapeValue, hand, lastBid),
      () => chooseStrongOneMajorOvercall(handShapeValue, hand, lastBid),
      () => chooseSimpleSuitOvercall(handShapeValue, hand, lastBid, vulnerable)
    ]);
  }

  function chooseProtectiveOneMajorOverMinor(shape, hand, auction, seat) {
    const context = protectiveOneMinorContext(auction, seat);
    if (!context || shape.hcp < 8) return null;
    const protectiveMajor = chooseSuitByLengthThenRank(
      ["S", "H"],
      shape,
      5,
      true,
      (candidate) => suitQuality(hand, candidate) >= 2
    );
    return protectiveMajor ? bid(1, protectiveMajor) : null;
  }

  function protectiveOneMinorContext(auction, seat) {
    if (!seat || auction.length < 3) return null;
    const lastTwoCalls = auction.slice(-2);
    if (!lastTwoCalls.every((call) => isPass(call.bid))) return null;
    const contractCalls = auction.filter((call) => isContractBid(call.bid));
    if (contractCalls.length !== 1) return null;
    const openingCall = contractCalls[0];
    if (teamOf(openingCall.seat) === teamOf(seat)) return null;
    const openingBid = openingCall.bid;
    if (openingBid.level !== 1 || !["C", "D"].includes(openingBid.strain)) return null;
    const callsAfterOpening = auction.slice(auction.indexOf(openingCall) + 1);
    if (callsAfterOpening.length !== 2 || !callsAfterOpening.every((call) => isPass(call.bid))) return null;
    return { openingCall, openingBid };
  }

  function isWeakTwoOpponentOpening(candidate) {
    return candidate?.level === 2 && ["D", "H", "S"].includes(candidate.strain);
  }

  function isPreemptOpponentOpening(candidate) {
    return candidate?.level >= 3 && candidate.strain && candidate.strain !== "NT";
  }

  function chooseOneNotrumpOvercall(shape, hand, opponentBid) {
    return shape.balanced &&
      shape.hcp >= 15 &&
      shape.hcp <= 17 &&
      opponentBid.strain !== "NT" &&
      hasStopper(hand, opponentBid.strain)
      ? bid(cheapestLevelForStrain("NT", opponentBid), "NT")
      : null;
  }

  function chooseWeakJumpOvercall(shape, hand, opponentBid) {
    const jumpSuit = chooseSuitByLengthThenRank(
      suits.filter((suit) => suit !== opponentBid.strain),
      shape,
      6,
      true,
      (candidate) => suitQuality(hand, candidate) >= 2
    );
    if (!jumpSuit || shape.hcp < 6 || shape.hcp > 11) return null;
    const baseLevel = cheapestLevelForStrain(jumpSuit, opponentBid);
    return bid(Math.min(baseLevel + 1, 4), jumpSuit);
  }

  function chooseStrongOneMajorOvercall(shape, hand, opponentBid) {
    if (shape.hcp < 17 || shape.hcp > 19) return null;
    const overcallSuit = chooseSuitByLengthThenRank(
      ["S", "H"].filter((suit) => suit !== opponentBid.strain),
      shape,
      5,
      true,
      (candidate) => suitQuality(hand, candidate) >= 2 && cheapestLevelForStrain(candidate, opponentBid) === 1
    );
    return overcallSuit ? bid(1, overcallSuit) : null;
  }

  function chooseSimpleSuitOvercall(shape, hand, opponentBid, vulnerable) {
    const overcallSuit = chooseSuitByLengthThenRank(
      suits.filter((suit) => suit !== opponentBid.strain),
      shape,
      5,
      true,
      (candidate) => suitQuality(hand, candidate) >= 2
    );
    if (!overcallSuit) return null;
    const overcallLevel = cheapestLevelForStrain(overcallSuit, opponentBid);
    const minimumHcp = simpleSuitOvercallMinimumHcp(shape, hand, overcallSuit, overcallLevel, vulnerable);
    return shape.hcp >= minimumHcp && shape.hcp <= 16 ? bid(overcallLevel, overcallSuit) : null;
  }

  function simpleSuitOvercallNormalMinimumHcp(overcallLevel, vulnerable) {
    return overcallLevel >= 2
      ? vulnerable ? 12 : 10
      : vulnerable ? 10 : 8;
  }

  function hasExceptionalVulnerableOneLevelOvercallSuit(shape, hand, suit, overcallLevel, vulnerable) {
    return Boolean(
      vulnerable &&
      overcallLevel === 1 &&
      shape.hcp === 9 &&
      (shape.counts[suit] || 0) >= 5 &&
      topHonorQuality(hand, suit) >= 3
    );
  }

  function simpleSuitOvercallMinimumHcp(shape, hand, suit, overcallLevel, vulnerable) {
    const normalMinimum = simpleSuitOvercallNormalMinimumHcp(overcallLevel, vulnerable);
    return hasExceptionalVulnerableOneLevelOvercallSuit(shape, hand, suit, overcallLevel, vulnerable)
      ? 9
      : normalMinimum;
  }

  function describeOvercallAction({ chosenBid, shape, hand = [], auction = [], seat, vulnerability = "none", base = {} } = {}) {
    if (!chosenBid || !isContractBid(chosenBid)) return null;

    const handShapeValue = shape || handShape(hand);
    const lastBid = highestBid(auction);
    if (!lastBid || !isContractBid(lastBid)) return null;
    if (isWeakTwoOpponentOpening(lastBid) || isPreemptOpponentOpening(lastBid)) return null;

    const vulnerable = seat ? isTeamVulnerable(teamOf(seat), vulnerability) : false;
    const extra = {
      ...base,
      category: "competitive",
      suit: chosenBid.strain,
      length: handShapeValue.counts[chosenBid.strain] || 0,
      opponentSuit: lastBid?.strain || null,
      partnerSuit: null,
      vulnerable
    };

    const protectiveContext = protectiveOneMinorContext(auction, seat);
    if (
      protectiveContext &&
      chosenBid.level === 1 &&
      (chosenBid.strain === "H" || chosenBid.strain === "S")
    ) {
      return fiveCardHighBidChoiceResult(chosenBid, "competitive.protectiveOneMajor", "basic", "Balance in the pass-out seat after their one-minor opening with a good five-card major and 8+ points.", {
        ...extra,
        opponentSuit: protectiveContext.openingBid.strain,
        minimumHcp: 8,
        suitQuality: suitQuality(hand, chosenBid.strain),
        protective: true
      });
    }
    if (chosenBid.strain === "NT") {
      return fiveCardHighBidChoiceResult(chosenBid, "competitive.oneNotrumpOvercall", "basic", "Overcall in notrump with 15-17 points, balanced shape, and a stopper.", extra);
    }
    const jumpLevel = lastBid ? cheapestLevelForStrain(chosenBid.strain, lastBid) + 1 : chosenBid.level;
    if (chosenBid.level >= jumpLevel && handShapeValue.hcp <= 11) {
      return fiveCardHighBidChoiceResult(chosenBid, "competitive.jumpOvercall", "basic", "Jump overcall with a good six-card suit and limited strength.", extra);
    }
    if (
      chosenBid.level === 1 &&
      (chosenBid.strain === "H" || chosenBid.strain === "S") &&
      handShapeValue.hcp >= 17 &&
      handShapeValue.hcp <= 19
    ) {
      return fiveCardHighBidChoiceResult(chosenBid, "competitive.strongOneMajorOvercall", "basic", "Make a natural one-level major overcall with 17-19 points when 1NT and a takeout double do not describe the hand.", {
        ...extra,
        minimumHcp: 17,
        maximumHcp: 19,
        suitQuality: suitQuality(hand, chosenBid.strain)
      });
    }
    const normalMinimumHcp = simpleSuitOvercallNormalMinimumHcp(chosenBid.level, vulnerable);
    const minimumHcp = simpleSuitOvercallMinimumHcp(handShapeValue, hand, chosenBid.strain, chosenBid.level, vulnerable);
    const exceptionalSuitQuality = minimumHcp < normalMinimumHcp;
    return fiveCardHighBidChoiceResult(chosenBid, "competitive.simpleOvercall", "basic", exceptionalSuitQuality
      ? "Make a natural vulnerable one-level overcall on 9 points only with exceptional top-honor suit quality."
      : `Make a natural overcall with a good five-card suit and ${minimumHcp}+ points.`, {
      ...extra,
      minimumHcp,
      normalMinimumHcp,
      exceptionalSuitQuality,
      suitQuality: suitQuality(hand, chosenBid.strain),
      topHonorQuality: topHonorQuality(hand, chosenBid.strain)
    });
  }

  return {
    chooseOvercallAction,
    describeOvercallAction
  };
});

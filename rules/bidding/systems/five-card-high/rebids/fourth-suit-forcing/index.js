(function initBridgeRulesBiddingFiveCardHighFourthSuitForcingRebids(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const deps = isCommonJs
    ? {
        core: require("../../../../../core.js"),
        auction: require("../../../../../auction.js"),
        context: require("../../../../common/context.js"),
        valuation: require("../../../../common/valuation.js"),
        result: require("../../../../common/result.js"),
        conventions: require("../../conventions.js")
      }
    : root.BridgeRulesParts || {};
  const api = factory(
    deps.core,
    deps.auction,
    deps.context || deps.biddingFiveCardHighContext,
    deps.valuation || deps.biddingFiveCardHighValuation,
    deps.result || deps.biddingCommonResult,
    deps.conventions || deps.biddingFiveCardHighConventions
  );
  if (isCommonJs) module.exports = api;
  root.BridgeRulesParts = root.BridgeRulesParts || {};
  root.BridgeRulesParts.biddingFiveCardHighFourthSuitForcingRebids = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesBiddingFiveCardHighFourthSuitForcingRebids(core, auction, contextHelpers, valuationHelpers, resultHelpers, conventionHelpers) {
  "use strict";

  const { biddingSystems } = core;
  const { Pass, bid, bidEquals, gameLevel, cheapestLevelForStrain, nextAvailableBid } = auction;
  const { fourthSuitForAuction, isFourthSuitForcingBid } = contextHelpers;
  const { hasStopper } = valuationHelpers;
  const { bidChoiceResult } = resultHelpers;
  const { isOneSuitOpeningFiveCardHigh, supportLengthForOpening } = conventionHelpers;

  function fiveCardHighBidChoiceResult(bid, ruleName, confidence, reason, extra = {}) {
    return bidChoiceResult(biddingSystems.fiveCardHigh, bid, ruleName, confidence, reason, extra);
  }

  function chooseFourthSuitForcingResponderRebidTarget({ shape, openingBid, responseBid, openerRebid } = {}) {
    if (!isFourthSuitForcingResponderAuction(openingBid, responseBid, openerRebid)) return null;
    if (shape.hcp < 12) return null;
    if ((responseBid.strain === "H" || responseBid.strain === "S") && shape.counts[responseBid.strain] >= 6) return null;
    if ((openerRebid.strain === "H" || openerRebid.strain === "S") && shape.counts[openerRebid.strain] >= 4) return null;
    if (shape.balanced) return null;

    const fourthSuit = fourthSuitForAuction(openingBid, responseBid, openerRebid);
    if (!fourthSuit) return null;
    return bid(cheapestLevelForStrain(fourthSuit, openerRebid), fourthSuit);
  }

  function chooseFourthSuitForcingOpenerThirdBidTarget({ shape, hand, openingBid, responseBid, openerRebid, responderRebid } = {}) {
    if (!isFourthSuitForcingBid(openingBid, responseBid, openerRebid, responderRebid)) return null;
    return rebidOpenerAfterFourthSuitFiveCardHigh(shape, hand, openingBid, responseBid, openerRebid, responderRebid);
  }

  function chooseFourthSuitForcingResponderAfterOpenerThirdBidTarget({ shape, openingBid, responseBid, openerRebid, responderRebid, openerThirdBid } = {}) {
    if (!isFourthSuitForcingBid(openingBid, responseBid, openerRebid, responderRebid) || !openerThirdBid) return null;
    if (openerThirdBid.strain === responseBid.strain && (responseBid.strain === "H" || responseBid.strain === "S")) return bid(gameLevel(responseBid.strain), responseBid.strain);
    if (openerThirdBid.strain === "NT") return openerThirdBid.level >= gameLevel("NT") ? Pass() : bid(gameLevel("NT"), "NT");
    if ((openerThirdBid.strain === "H" || openerThirdBid.strain === "S") && shape.counts[openerThirdBid.strain] >= 4) return bid(gameLevel(openerThirdBid.strain), openerThirdBid.strain);
    if ((openerThirdBid.strain === "C" || openerThirdBid.strain === "D") && shape.counts[openerThirdBid.strain] >= 4) return bid(gameLevel(openerThirdBid.strain), openerThirdBid.strain);
    if (responseBid.strain !== "NT" && shape.counts[responseBid.strain] >= 6 && (responseBid.strain === "H" || responseBid.strain === "S")) return bid(gameLevel(responseBid.strain), responseBid.strain);
    if (openerThirdBid.strain === openingBid.strain && shape.counts[openingBid.strain] >= supportLengthForOpening(openingBid.strain)) return bid(gameLevel(openingBid.strain), openingBid.strain);
    return bid(3, "NT");
  }

  function rebidOpenerAfterFourthSuitFiveCardHigh(shape, hand, openingBid, responseBid, openerRebid, responderRebid) {
    if (responseBid.strain !== "NT" && shape.counts[responseBid.strain] >= 3) return bid(cheapestLevelForStrain(responseBid.strain, responderRebid), responseBid.strain);
    if (hasStopper(hand, responderRebid.strain)) return bid(cheapestLevelForStrain("NT", responderRebid), "NT");
    if (shape.counts[openingBid.strain] >= 6) return bid(cheapestLevelForStrain(openingBid.strain, responderRebid), openingBid.strain);
    if (shape.counts[openerRebid.strain] >= 5) return bid(cheapestLevelForStrain(openerRebid.strain, responderRebid), openerRebid.strain);
    return nextAvailableBid(bid(cheapestLevelForStrain("NT", responderRebid), "NT"), responderRebid);
  }

  function describeFourthSuitForcingResponderRebidChoice(chosenBid, shape, openingBid, responseBid, openerRebid, base) {
    const fourthSuit = fourthSuitForAuction(openingBid, responseBid, openerRebid);
    if (!fourthSuit || !bidEquals(chosenBid, cheapestLevelForStrain(fourthSuit, openerRebid), fourthSuit)) return null;
    return fiveCardHighBidChoiceResult(chosenBid, "continuation.responderFourthSuitForcing", "basic", "Use fourth-suit forcing with game-going values when no natural game is clear.", {
      ...fourthSuitBaseExtra(chosenBid, shape, openingBid, responseBid, openerRebid, base),
      convention: "fourthSuitForcing",
      forcing: true,
      gameForcing: true,
      artificial: true,
      alert: true,
      fourthSuit,
      range: "12+"
    });
  }

  function describeFourthSuitForcingOpenerThirdBidChoice(chosenBid, shape, hand, openingBid, responseBid, openerRebid, responderRebid, base) {
    const fourthSuit = fourthSuitForAuction(openingBid, responseBid, openerRebid);
    if (!fourthSuit || !bidEquals(responderRebid, cheapestLevelForStrain(fourthSuit, openerRebid), fourthSuit)) return null;

    const extra = {
      ...fourthSuitBaseExtra(chosenBid, shape, openingBid, responseBid, openerRebid, base),
      fourthSuit
    };
    if (chosenBid.strain === responseBid.strain && shape.counts[responseBid.strain] >= 3) {
      return fiveCardHighBidChoiceResult(chosenBid, "continuation.openerAfterFourthSuitSupport", "basic", "Answer fourth-suit forcing by showing three-card support for responder's first suit.", {
        ...extra,
        convention: "fourthSuitForcing",
        forcing: true,
        gameForcing: true,
        artificial: false,
        support: shape.counts[responseBid.strain] || 0
      });
    }
    if (chosenBid.strain === "NT") {
      return fiveCardHighBidChoiceResult(chosenBid, "continuation.openerAfterFourthSuitNotrump", "basic", "Answer fourth-suit forcing by bidding notrump with a stopper in the fourth suit.", {
        ...extra,
        convention: "fourthSuitForcing",
        forcing: true,
        gameForcing: true,
        stopperSuit: fourthSuit,
        hasStopper: hasStopper(hand, fourthSuit)
      });
    }
    if (chosenBid.strain === openingBid.strain) return fiveCardHighBidChoiceResult(chosenBid, "continuation.openerAfterFourthSuitRebidOwnSuit", "basic", "Answer fourth-suit forcing by rebidding opener's first suit with extra length.", fourthSuitForcingExtra(extra));
    if (chosenBid.strain === openerRebid.strain) return fiveCardHighBidChoiceResult(chosenBid, "continuation.openerAfterFourthSuitRebidSecondSuit", "basic", "Answer fourth-suit forcing by rebidding opener's second suit.", fourthSuitForcingExtra(extra));
    return null;
  }

  function describeFourthSuitForcingResponderAfterOpenerThirdBidChoice(chosenBid, shape, openingBid, responseBid, openerRebid, responderRebid, openerThirdBid, base) {
    if (!isFourthSuitForcingBid(openingBid, responseBid, openerRebid, responderRebid) || !openerThirdBid) return null;
    const fourthSuit = fourthSuitForAuction(openingBid, responseBid, openerRebid);
    return fiveCardHighBidChoiceResult(chosenBid, "continuation.responderAfterFourthSuitChooseGame", "basic", "Choose the best game after fourth-suit forcing has collected opener's extra description.", {
      ...base,
      category: "continuation",
      convention: "fourthSuitForcing",
      forcing: true,
      gameForcing: true,
      suit: chosenBid.strain,
      length: chosenBid.strain === "NT" ? 0 : shape.counts[chosenBid.strain] || 0,
      openingSuit: openingBid?.strain || null,
      responseSuit: responseBid?.strain || null,
      openerRebidSuit: openerRebid?.strain || null,
      fourthSuit
    });
  }

  function isFourthSuitForcingResponderAuction(openingBid, responseBid, openerRebid) {
    return (
      isOneSuitOpeningFiveCardHigh(openingBid) &&
      openerRebid &&
      openerRebid.strain !== "NT" &&
      openerRebid.strain !== openingBid?.strain &&
      openerRebid.strain !== responseBid?.strain
    );
  }

  function fourthSuitBaseExtra(chosenBid, shape, openingBid, responseBid, openerRebid, base) {
    return {
      ...base,
      category: "continuation",
      suit: chosenBid.strain,
      length: shape.counts[chosenBid.strain] || 0,
      openingSuit: openingBid?.strain || null,
      responseSuit: responseBid?.strain || null,
      openerRebidSuit: openerRebid?.strain || null,
      partnerSuit: openerRebid?.strain || null,
      support: openerRebid?.strain && openerRebid.strain !== "NT" ? shape.counts[openerRebid.strain] : 0
    };
  }

  function fourthSuitForcingExtra(extra) {
    return {
      ...extra,
      convention: "fourthSuitForcing",
      forcing: true,
      gameForcing: true
    };
  }

  const fourthSuitForcingRebidFamily = {
    id: "rebids.fourthSuitForcing",
    order: 31,
    chooseResponderRebidTarget: chooseFourthSuitForcingResponderRebidTarget,
    chooseOpenerThirdBidTarget: chooseFourthSuitForcingOpenerThirdBidTarget,
    chooseResponderAfterOpenerThirdBidTarget: chooseFourthSuitForcingResponderAfterOpenerThirdBidTarget,
    describeResponderRebidChoice: describeFourthSuitForcingResponderRebidChoice,
    describeOpenerThirdBidChoice: describeFourthSuitForcingOpenerThirdBidChoice,
    describeResponderAfterOpenerThirdBidChoice: describeFourthSuitForcingResponderAfterOpenerThirdBidChoice
  };

  return {
    fourthSuitForcingRebidFamily,
    chooseFourthSuitForcingResponderRebidTarget: fourthSuitForcingRebidFamily.chooseResponderRebidTarget,
    chooseFourthSuitForcingOpenerThirdBidTarget: fourthSuitForcingRebidFamily.chooseOpenerThirdBidTarget,
    chooseFourthSuitForcingResponderAfterOpenerThirdBidTarget: fourthSuitForcingRebidFamily.chooseResponderAfterOpenerThirdBidTarget,
    rebidOpenerAfterFourthSuitFiveCardHigh,
    describeFourthSuitForcingResponderRebidChoice: fourthSuitForcingRebidFamily.describeResponderRebidChoice,
    describeFourthSuitForcingOpenerThirdBidChoice: fourthSuitForcingRebidFamily.describeOpenerThirdBidChoice,
    describeFourthSuitForcingResponderAfterOpenerThirdBidChoice: fourthSuitForcingRebidFamily.describeResponderAfterOpenerThirdBidChoice
  };
});

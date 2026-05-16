(function initBridgeRulesBiddingFiveCardHighNaturalOpenerRebids(root, factory) {
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
  root.BridgeRulesParts.biddingFiveCardHighNaturalOpenerRebids = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesBiddingFiveCardHighNaturalOpenerRebids(core, auction, valuationHelpers, resultHelpers, conventionHelpers) {
  "use strict";

  const { bidStrains, biddingSystems } = core;
  const { Pass, bid, bidEquals, gameLevel, cheapestLevelForStrain } = auction;
  const { fitStrength, fitValuationContext, optionalFitValuationContext } = valuationHelpers;
  const { bidChoiceResult } = resultHelpers;
  const {
    chooseOpenerSecondSuit,
    chooseSuitByLengthThenRank,
    isOneSuitOpeningFiveCardHigh,
    supportLengthForOpening
  } = conventionHelpers;

  function fiveCardHighBidChoiceResult(bid, ruleName, confidence, reason, extra = {}) {
    return bidChoiceResult(biddingSystems.fiveCardHigh, bid, ruleName, confidence, reason, extra);
  }

  function chooseNaturalOpenerRebidTarget({ shape, hand, openingBid, responseBid } = {}) {
    if (!isOneSuitOpeningFiveCardHigh(openingBid)) return null;
    return rebidAfterOneSuitOpeningFiveCardHigh(shape, hand, openingBid, responseBid);
  }

  function rebidAfterOneSuitOpeningFiveCardHigh(shape, hand, openingBid, responseBid) {
    if (responseBid.strain === openingBid.strain) return openerRebidAfterRaiseFiveCardHigh(shape, hand, openingBid, responseBid);
    if (responseBid.strain === "NT") return openerRebidAfterNotrumpFiveCardHigh(shape, openingBid, responseBid);
    return openerRebidAfterNewSuitFiveCardHigh(shape, openingBid, responseBid);
  }

  function openerRebidAfterMinorNotrumpFiveCardHigh(shape, openingBid, responseBid) {
    const longMinor = shape.counts[openingBid.strain] >= 6;
    const extremeMinor = shape.counts[openingBid.strain] >= 7;

    if (responseBid.level === 1) {
      if (shape.balanced) {
        if (shape.hcp >= 18) return bid(3, "NT");
        if (shape.hcp >= 15) return bid(2, "NT");
        return Pass();
      }
      if (longMinor) {
        if (shape.hcp >= 18) return bid(gameLevel(openingBid.strain), openingBid.strain);
        if (shape.hcp >= 15) return bid(3, openingBid.strain);
        return bid(2, openingBid.strain);
      }
      return Pass();
    }

    if (responseBid.level === 2) {
      if (shape.balanced) return shape.hcp >= 14 ? bid(3, "NT") : Pass();
      if (longMinor) return shape.hcp >= 14 ? bid(gameLevel(openingBid.strain), openingBid.strain) : bid(3, openingBid.strain);
      return shape.hcp >= 14 ? bid(3, "NT") : Pass();
    }

    if (responseBid.level === 3) {
      if (!shape.balanced && extremeMinor) return bid(gameLevel(openingBid.strain), openingBid.strain);
      return Pass();
    }

    return Pass();
  }

  function openerRebidAfterRaiseFiveCardHigh(shape, hand, openingBid, responseBid) {
    if (responseBid.level >= gameLevel(openingBid.strain)) return Pass();
    if (isMinorRaiseFiveCardHigh(openingBid, responseBid)) return openerRebidAfterMinorRaiseFiveCardHigh(shape, hand, openingBid, responseBid);
    if (responseBid.level === 3) return fitStrength(hand, shape, openingBid.strain, supportLengthForOpening(openingBid.strain)) >= 14 ? bid(gameLevel(openingBid.strain), openingBid.strain) : Pass();
    if (isMajorSingleRaiseFiveCardHigh(openingBid, responseBid)) {
      const strength = fitStrength(hand, shape, openingBid.strain, supportLengthForOpening(openingBid.strain));
      if (strength >= 18) return bid(gameLevel(openingBid.strain), openingBid.strain);
      if (strength >= 16) return bid(3, openingBid.strain);
      return Pass();
    }
    return Pass();
  }

  function openerRebidAfterMinorRaiseFiveCardHigh(shape, hand, openingBid, responseBid) {
    const strength = fitStrength(hand, shape, openingBid.strain, supportLengthForOpening(openingBid.strain));
    if (responseBid.level === 2) {
      if (strength >= 18) return shape.balanced ? bid(3, "NT") : bid(gameLevel(openingBid.strain), openingBid.strain);
      if (strength >= 15) return bid(3, openingBid.strain);
      return Pass();
    }
    if (responseBid.level === 3) {
      if (strength >= 14) return shape.balanced ? bid(3, "NT") : bid(gameLevel(openingBid.strain), openingBid.strain);
      return Pass();
    }
    if (responseBid.level === 4) return bid(gameLevel(openingBid.strain), openingBid.strain);
    return Pass();
  }

  function isMajorSingleRaiseFiveCardHigh(openingBid, responseBid) {
    return (
      openingBid?.level === 1 &&
      (openingBid.strain === "H" || openingBid.strain === "S") &&
      responseBid?.level === 2 &&
      responseBid.strain === openingBid.strain
    );
  }

  function isMinorRaiseFiveCardHigh(openingBid, responseBid) {
    return (
      openingBid?.level === 1 &&
      (openingBid.strain === "C" || openingBid.strain === "D") &&
      responseBid?.strain === openingBid.strain &&
      responseBid.level >= 2 &&
      responseBid.level <= 4
    );
  }

  function openerRebidAfterNotrumpFiveCardHigh(shape, openingBid, responseBid) {
    if (isMinorOpeningNotrumpResponseFiveCardHigh(openingBid, responseBid)) {
      return openerRebidAfterMinorNotrumpFiveCardHigh(shape, openingBid, responseBid);
    }
    const context = majorOpeningNotrumpResponseContext(shape, openingBid, responseBid);
    if (!context) return openerRebidAfterNotrumpFallbackFiveCardHigh(shape, openingBid);

    if (responseBid.level === 1) {
      if (context.handType === "twoSuiter") return shape.hcp >= 18 ? bid(3, context.secondSuit) : bid(2, context.secondSuit);
      if (context.handType === "longMajor") {
        if (shape.hcp >= 18) return bid(gameLevel(openingBid.strain), openingBid.strain);
        if (shape.hcp >= 16) return bid(3, openingBid.strain);
        if (shape.hcp >= 12) return bid(2, openingBid.strain);
      }
      if (context.handType === "balanced" && shape.hcp >= 18) return bid(3, "NT");
      return Pass();
    }

    if (responseBid.level === 2) {
      if (context.handType === "twoSuiter") {
        if (shape.hcp >= 14) return openingBid.strain === "S" && context.secondSuit === "H" ? bid(4, "H") : bid(3, "NT");
        if (shape.hcp >= 12) return bid(3, context.secondSuit);
      }
      if (context.handType === "longMajor") return shape.hcp >= 14 ? bid(gameLevel(openingBid.strain), openingBid.strain) : bid(3, openingBid.strain);
      if (context.handType === "balanced" && shape.hcp >= 14) return bid(3, "NT");
      return Pass();
    }

    return Pass();
  }

  function openerRebidAfterNotrumpFallbackFiveCardHigh(shape, openingBid) {
    if (shape.counts[openingBid.strain] >= 6) return bid(openingBid.level + 1, openingBid.strain);
    if (shape.balanced && shape.hcp >= 18) return bid(2, "NT");
    if (shape.balanced && shape.hcp >= 15) return bid(1, "NT");
    const secondSuit = chooseOpenerSecondSuit(shape, openingBid.strain);
    if (secondSuit) return bid(cheapestLevelForStrain(secondSuit, openingBid), secondSuit);
    return Pass();
  }

  function majorOpeningNotrumpResponseContext(shape, openingBid, responseBid) {
    if (!isMajorOpeningNotrumpResponseFiveCardHigh(openingBid, responseBid)) return null;
    const secondSuit = chooseLowerSecondSuitFiveCardHigh(shape, openingBid.strain);
    if (secondSuit) return { handType: "twoSuiter", notrumpResponseLevel: responseBid.level, secondSuit };
    if (shape.counts[openingBid.strain] >= 6) return { handType: "longMajor", notrumpResponseLevel: responseBid.level };
    if (shape.balanced) return { handType: "balanced", notrumpResponseLevel: responseBid.level };
    return { handType: "other", notrumpResponseLevel: responseBid.level };
  }

  function isMajorOpeningNotrumpResponseFiveCardHigh(openingBid, responseBid) {
    return (
      openingBid?.level === 1 &&
      (openingBid.strain === "H" || openingBid.strain === "S") &&
      responseBid?.strain === "NT" &&
      (responseBid.level === 1 || responseBid.level === 2)
    );
  }

  function minorOpeningNotrumpResponseContext(shape, openingBid, responseBid) {
    if (!isMinorOpeningNotrumpResponseFiveCardHigh(openingBid, responseBid)) return null;
    return {
      handType: shape.balanced ? "balanced" : shape.counts[openingBid.strain] >= 6 ? "longMinor" : "other",
      notrumpResponseLevel: responseBid.level,
      noMajorFit: true
    };
  }

  function isMinorOpeningNotrumpResponseFiveCardHigh(openingBid, responseBid) {
    return (
      openingBid?.level === 1 &&
      (openingBid.strain === "C" || openingBid.strain === "D") &&
      responseBid?.strain === "NT" &&
      responseBid.level >= 1 &&
      responseBid.level <= 3
    );
  }

  function isMinorOpeningOneLevelNewSuitFiveCardHigh(openingBid, responseBid) {
    return (
      openingBid?.level === 1 &&
      (openingBid.strain === "C" || openingBid.strain === "D") &&
      responseBid?.level === 1 &&
      responseBid.strain !== "NT" &&
      responseBid.strain !== openingBid.strain
    );
  }

  function isOneDiamondTwoClubsResponseFiveCardHigh(openingBid, responseBid) {
    return bidEquals(openingBid, 1, "D") && bidEquals(responseBid, 2, "C");
  }

  function isReverseRebidFiveCardHigh(openingBid, rebid) {
    return (
      openingBid?.level === 1 &&
      rebid?.level >= 2 &&
      rebid.strain !== "NT" &&
      rebid.strain !== openingBid.strain &&
      bidStrains.indexOf(rebid.strain) > bidStrains.indexOf(openingBid.strain)
    );
  }

  function hasMinorReverseStrengthFiveCardHigh(shape, openingBid) {
    const openingLength = openingBid?.strain ? shape.counts[openingBid.strain] || 0 : 0;
    return shape.hcp >= 16 || (shape.hcp >= 15 && shape.points >= 17 && openingLength >= 5);
  }

  function openerAfterMinorOneLevelNewSuitRuleName(chosenBid, openingBid, responseBid, shape = null) {
    const responseIsMajor = responseBid.strain === "H" || responseBid.strain === "S";
    if (responseIsMajor && chosenBid.strain === responseBid.strain) {
      if (chosenBid.level === 2) return "continuation.openerMinorNewSuitMajorFitMinimum";
      if (chosenBid.level === 3) return "continuation.openerMinorNewSuitMajorFitInvite";
      if (chosenBid.level === gameLevel(responseBid.strain)) return "continuation.openerMinorNewSuitMajorFitGame";
    }
    if (chosenBid.strain === "NT") {
      if (chosenBid.level === 1) return "continuation.openerMinorNewSuitNotrumpMinimum";
      if (chosenBid.level === 2) return "continuation.openerMinorNewSuitNotrumpInvite";
    }
    if (chosenBid.strain === openingBid.strain) {
      if (shape && chosenBid.level === 2 && (shape.counts[openingBid.strain] || 0) === 5) {
        return "continuation.openerMinorNewSuitFallbackOwnMinor";
      }
      if (chosenBid.level === 2) return "continuation.openerMinorNewSuitLongMinorMinimum";
      if (chosenBid.level === 3) return "continuation.openerMinorNewSuitLongMinorInvite";
      if (chosenBid.level === gameLevel(openingBid.strain)) return "continuation.openerMinorNewSuitLongMinorGame";
    }
    if (isReverseRebidFiveCardHigh(openingBid, chosenBid)) return "continuation.openerMinorNewSuitReverse";
    return "continuation.openerMinorNewSuitSecondSuit";
  }

  function openerAfterOneDiamondTwoClubsRuleName(chosenBid) {
    if (bidEquals(chosenBid, 2, "NT")) return "continuation.openerOneDiamondTwoClubsNotrumpInvite";
    if (bidEquals(chosenBid, 3, "NT")) return "continuation.openerOneDiamondTwoClubsNotrumpGame";
    if (bidEquals(chosenBid, 2, "D")) return "continuation.openerOneDiamondTwoClubsLongDiamondMinimum";
    if (bidEquals(chosenBid, 3, "D")) return "continuation.openerOneDiamondTwoClubsLongDiamondInvite";
    if (bidEquals(chosenBid, 3, "C")) return "continuation.openerOneDiamondTwoClubsClubFit";
    return null;
  }

  function openerAfterMinorNotrumpResponseRuleName(chosenBid, openingBid, responseBid) {
    const prefix = responseBid.level === 1 ? "openerMinorAfterOneNt" : responseBid.level === 2 ? "openerMinorAfterTwoNt" : "openerMinorAfterThreeNt";
    if (chosenBid.strain === "NT") {
      if (responseBid.level === 1 && chosenBid.level === 2) return `continuation.${prefix}Invite`;
      if (chosenBid.level === 3) return `continuation.${prefix}Game`;
    }
    if (chosenBid.strain === openingBid.strain) {
      if (responseBid.level === 1 && chosenBid.level === 2) return `continuation.${prefix}LongMinorMinimum`;
      if (chosenBid.level === 3) return `continuation.${prefix}LongMinorInvite`;
      if (chosenBid.level === gameLevel(openingBid.strain)) return `continuation.${prefix}LongMinorGame`;
    }
    return null;
  }

  function chooseLowerSecondSuitFiveCardHigh(shape, openingStrain) {
    const candidates = openingStrain === "H" ? ["C", "D"] : openingStrain === "S" ? ["C", "D", "H"] : [];
    return chooseSuitByLengthThenRank(candidates, shape, 4, false);
  }

  function openerAfterNotrumpResponseRuleName(chosenBid, openingBid, responseBid, context) {
    const prefix = responseBid.level === 1 ? "openerAfterOneNt" : "openerAfterTwoNt";
    if (context.handType === "balanced" && bidEquals(chosenBid, 3, "NT")) return `continuation.${prefix}BalancedGame`;
    if (context.handType === "longMajor" && chosenBid.strain === openingBid.strain) {
      if (responseBid.level === 1) {
        if (chosenBid.level === 2) return `continuation.${prefix}LongMajorMinimum`;
        if (chosenBid.level === 3) return `continuation.${prefix}LongMajorInvite`;
        if (chosenBid.level === 4) return `continuation.${prefix}LongMajorGame`;
      }
      if (responseBid.level === 2) {
        if (chosenBid.level === 3) return `continuation.${prefix}LongMajorMinimum`;
        if (chosenBid.level === 4) return `continuation.${prefix}LongMajorGame`;
      }
    }
    if (context.handType === "twoSuiter") {
      if (responseBid.level === 1 && chosenBid.strain === context.secondSuit) {
        if (chosenBid.level === 2) return `continuation.${prefix}TwoSuiterLow`;
        if (chosenBid.level === 3) return `continuation.${prefix}TwoSuiterHigh`;
      }
      if (responseBid.level === 2) {
        if (chosenBid.strain === context.secondSuit && chosenBid.level === 3) return `continuation.${prefix}TwoSuiterLow`;
        if (bidEquals(chosenBid, 4, "H")) return `continuation.${prefix}TwoMajorsGame`;
        if (bidEquals(chosenBid, 3, "NT")) return `continuation.${prefix}TwoSuiterGameNotrump`;
      }
    }
    return null;
  }

  function openerRebidAfterNewSuitFiveCardHigh(shape, openingBid, responseBid) {
    if (isOneDiamondTwoClubsResponseFiveCardHigh(openingBid, responseBid)) {
      return openerRebidAfterOneDiamondTwoClubsFiveCardHigh(shape);
    }
    if (isMinorOpeningOneLevelNewSuitFiveCardHigh(openingBid, responseBid)) {
      return openerRebidAfterMinorOneLevelNewSuitFiveCardHigh(shape, openingBid, responseBid);
    }
    if (responseBid.strain !== "NT" && shape.counts[responseBid.strain] >= 4) {
      return bid(cheapestLevelForStrain(responseBid.strain, responseBid), responseBid.strain);
    }
    if (shape.balanced) return bid(cheapestLevelForStrain("NT", responseBid), "NT");
    if (shape.counts[openingBid.strain] >= 6) return bid(cheapestLevelForStrain(openingBid.strain, responseBid), openingBid.strain);
    const secondSuit = chooseOpenerSecondSuit(shape, openingBid.strain, responseBid.strain);
    if (secondSuit) return bid(cheapestLevelForStrain(secondSuit, responseBid), secondSuit);
    return Pass();
  }

  function openerRebidAfterMinorOneLevelNewSuitFiveCardHigh(shape, openingBid, responseBid) {
    const responseIsMajor = responseBid.strain === "H" || responseBid.strain === "S";
    if (responseIsMajor && shape.counts[responseBid.strain] >= 4) {
      if (shape.hcp >= 18) return bid(gameLevel(responseBid.strain), responseBid.strain);
      if (shape.hcp >= 15) return bid(3, responseBid.strain);
      return bid(2, responseBid.strain);
    }
    if (shape.balanced) return bid(shape.hcp >= 15 ? 2 : 1, "NT");
    if (shape.counts[openingBid.strain] >= 6) {
      if (shape.hcp >= 18) return bid(gameLevel(openingBid.strain), openingBid.strain);
      if (shape.hcp >= 15) return bid(3, openingBid.strain);
      return bid(2, openingBid.strain);
    }
    const secondSuit = chooseOpenerSecondSuit(shape, openingBid.strain, responseBid.strain, (suit) => {
      const nextBid = bid(cheapestLevelForStrain(suit, responseBid), suit);
      return !isReverseRebidFiveCardHigh(openingBid, nextBid) || hasMinorReverseStrengthFiveCardHigh(shape, openingBid);
    });
    if (secondSuit) return bid(cheapestLevelForStrain(secondSuit, responseBid), secondSuit);
    if (shape.counts[openingBid.strain] >= 5) return bid(cheapestLevelForStrain(openingBid.strain, responseBid), openingBid.strain);
    return bid(cheapestLevelForStrain("NT", responseBid), "NT");
  }

  function openerRebidAfterOneDiamondTwoClubsFiveCardHigh(shape) {
    if (shape.counts.C >= 4 && shape.hcp <= 14) return bid(3, "C");
    if (shape.counts.D >= 6) return bid(shape.hcp >= 15 ? 3 : 2, "D");
    return bid(shape.hcp >= 15 ? 3 : 2, "NT");
  }

  function describeNaturalOpenerRebidChoice(chosenBid, shape, hand, openingBid, responseBid, base) {
    if (!isOneSuitOpeningFiveCardHigh(openingBid)) return null;
    let extra = {
      ...base,
      category: "continuation",
      suit: chosenBid.strain,
      length: shape.counts[chosenBid.strain] || 0,
      openingSuit: openingBid?.strain || null,
      responseSuit: responseBid?.strain || null
    };
    const notrumpResponseContext = majorOpeningNotrumpResponseContext(shape, openingBid, responseBid);
    if (notrumpResponseContext) extra = { ...extra, ...notrumpResponseContext };
    const minorNotrumpResponseContext = minorOpeningNotrumpResponseContext(shape, openingBid, responseBid);
    if (minorNotrumpResponseContext) extra = { ...extra, ...minorNotrumpResponseContext };

    if (isMinorRaiseFiveCardHigh(openingBid, responseBid) && chosenBid.strain === "NT") {
      return fiveCardHighBidChoiceResult(chosenBid, "continuation.openerMinorRaiseNotrumpGame", "basic", "Bid 3NT with balanced game-going strength after partner's minor raise.", extra);
    }
    if (minorNotrumpResponseContext) {
      const ruleName = openerAfterMinorNotrumpResponseRuleName(chosenBid, openingBid, responseBid);
      if (ruleName) {
        return fiveCardHighBidChoiceResult(chosenBid, ruleName, "basic", "Rebid after partner's notrump response to a minor opening; partner has not found a major-suit fit.", extra);
      }
    }
    if (isMinorOpeningOneLevelNewSuitFiveCardHigh(openingBid, responseBid)) {
      const ruleName = openerAfterMinorOneLevelNewSuitRuleName(chosenBid, openingBid, responseBid, shape);
      if (ruleName) {
        return fiveCardHighBidChoiceResult(chosenBid, ruleName, "basic", "Rebid after partner's one-level new suit response to a minor opening, using fit, strength, and reverse rules.", extra);
      }
    }
    if (isOneDiamondTwoClubsResponseFiveCardHigh(openingBid, responseBid)) {
      const ruleName = openerAfterOneDiamondTwoClubsRuleName(chosenBid);
      if (ruleName) {
        return fiveCardHighBidChoiceResult(chosenBid, ruleName, "basic", "Rebid after partner's 2C response to 1D; partner has 10+ points, clubs, and no four-card major.", extra);
      }
    }
    if (responseBid?.strain !== "NT" && chosenBid.strain === responseBid?.strain) {
      if (isMajorSingleRaiseFiveCardHigh(openingBid, responseBid)) {
        const acceptedGame = chosenBid.level === gameLevel(openingBid.strain);
        return fiveCardHighBidChoiceResult(
          chosenBid,
          acceptedGame ? "continuation.openerMajorRaiseGame" : "continuation.openerMajorRaiseInvite",
          "basic",
          acceptedGame
            ? "Bid game after partner's single major raise with enough fit points."
            : "Invite after partner's single major raise with invitational fit points.",
          {
            ...extra,
            ...fitValuationContext(hand, shape, openingBid.strain, supportLengthForOpening(openingBid.strain))
          }
        );
      }
      if (isMinorRaiseFiveCardHigh(openingBid, responseBid)) {
        const ruleName = chosenBid.strain === "NT"
          ? "continuation.openerMinorRaiseNotrumpGame"
          : chosenBid.level === gameLevel(openingBid.strain)
            ? "continuation.openerMinorRaiseGame"
            : "continuation.openerMinorRaiseInvite";
        const reason = chosenBid.strain === "NT"
          ? "Bid 3NT with balanced game-going strength after partner's minor raise."
          : chosenBid.level === gameLevel(openingBid.strain)
            ? "Bid the minor-suit game after partner's minor raise with enough strength."
            : "Invite after partner's single minor raise with extra values.";
        return fiveCardHighBidChoiceResult(chosenBid, ruleName, "basic", reason, {
          ...extra,
          ...optionalFitValuationContext(hand, shape, openingBid.strain, supportLengthForOpening(openingBid.strain))
        });
      }
      return fiveCardHighBidChoiceResult(chosenBid, "continuation.raisePartner", "basic", "Raise responder's suit with support.", extra);
    }
    if (notrumpResponseContext) {
      const ruleName = openerAfterNotrumpResponseRuleName(chosenBid, openingBid, responseBid, notrumpResponseContext);
      if (ruleName) {
        return fiveCardHighBidChoiceResult(chosenBid, ruleName, "basic", "Rebid after partner's notrump response according to opener's hand type and range.", extra);
      }
    }
    if (chosenBid.strain === "NT") {
      return fiveCardHighBidChoiceResult(chosenBid, "continuation.notrumpRebid", "basic", "Rebid notrump with balanced extra values.", extra);
    }
    if (chosenBid.strain === openingBid?.strain) {
      return fiveCardHighBidChoiceResult(chosenBid, "continuation.rebidOwnSuit", "basic", "Rebid opener's own long suit.", extra);
    }
    return fiveCardHighBidChoiceResult(chosenBid, "continuation.newSuit", "basic", "Show a second suit as opener's rebid.", extra);
  }

  const naturalOpenerRebidFamily = {
    id: "rebids.naturalOpener",
    order: 33,
    chooseOpenerRebidTarget: chooseNaturalOpenerRebidTarget,
    describeOpenerRebidChoice: describeNaturalOpenerRebidChoice
  };

  return {
    naturalOpenerRebidFamily,
    chooseNaturalOpenerRebidTarget: naturalOpenerRebidFamily.chooseOpenerRebidTarget,
    describeNaturalOpenerRebidChoice: naturalOpenerRebidFamily.describeOpenerRebidChoice,
    rebidAfterOneSuitOpeningFiveCardHigh,
    openerRebidAfterMinorNotrumpFiveCardHigh,
    openerRebidAfterRaiseFiveCardHigh,
    openerRebidAfterMinorRaiseFiveCardHigh,
    isMajorSingleRaiseFiveCardHigh,
    isMinorRaiseFiveCardHigh,
    openerRebidAfterNotrumpFiveCardHigh,
    openerRebidAfterNotrumpFallbackFiveCardHigh,
    majorOpeningNotrumpResponseContext,
    isMajorOpeningNotrumpResponseFiveCardHigh,
    minorOpeningNotrumpResponseContext,
    isMinorOpeningNotrumpResponseFiveCardHigh,
    isMinorOpeningOneLevelNewSuitFiveCardHigh,
    isOneDiamondTwoClubsResponseFiveCardHigh,
    isReverseRebidFiveCardHigh,
    hasMinorReverseStrengthFiveCardHigh,
    openerAfterMinorOneLevelNewSuitRuleName,
    openerAfterOneDiamondTwoClubsRuleName,
    openerAfterMinorNotrumpResponseRuleName,
    chooseLowerSecondSuitFiveCardHigh,
    openerAfterNotrumpResponseRuleName,
    openerRebidAfterNewSuitFiveCardHigh,
    openerRebidAfterMinorOneLevelNewSuitFiveCardHigh,
    openerRebidAfterOneDiamondTwoClubsFiveCardHigh
  };
});

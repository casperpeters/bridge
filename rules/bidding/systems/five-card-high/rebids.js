(function initBridgeRulesBiddingFiveCardHighRebids(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const deps = isCommonJs
    ? {
        core: require("../../../core.js"),
        auction: require("../../../auction.js"),
        context: require("../../common/context.js"),
        valuation: require("../../common/valuation.js"),
        result: require("../../common/result.js"),
        conventions: require("./conventions.js")
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
  root.BridgeRulesParts.biddingFiveCardHighRebids = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesBiddingFiveCardHighRebids(core, auction, contextHelpers, valuationHelpers, resultHelpers, conventionHelpers) {
  "use strict";

  const { suits, bidStrains, biddingSystems, handShape } = core;
  const {
    Pass,
    bid,
    bidEquals,
    gameLevel,
    cheapestLevelForStrain,
    nextAvailableBid,
    isBidHigher
  } = auction;
  const { fourthSuitForAuction, isFourthSuitForcingBid } = contextHelpers;
  const { fitStrength, fitValuationContext, optionalFitValuationContext, hasStopper, strongTwoClubsPlayingTricksContext } = valuationHelpers;
  const { bidChoiceResult } = resultHelpers;
  const {
    notrumpTransferSuit,
    agreedTrumpAfterAcceptedNotrumpTransfer,
    bestSuitByLength,
    blackwoodResponseBidForAceCount,
    blackwoodShownAceCount,
    canBidAtOrBelow,
    chooseBlackwoodFollowup,
    chooseFiveCardHighNaturalContinuation,
    chooseMajorByLength,
    chooseOpenerSecondSuit,
    chooseSuitByLengthThenRank,
    countAces,
    isBlackwoodAsk,
    isOneSuitOpeningFiveCardHigh,
    isOneMinorOpeningFiveCardHigh,
    minimumOpeningLength,
    minimumPreferenceLengthFiveCardHigh,
    shouldUseBlackwoodAfterAcceptedTransfer,
    supportLengthForOpening
  } = conventionHelpers;

  function fiveCardHighBidChoiceResult(bid, ruleName, confidence, reason, extra = {}) {
    return bidChoiceResult(biddingSystems.fiveCardHigh, bid, ruleName, confidence, reason, extra);
  }

  function chooseFiveCardHighOpenerRebid(hand, openingBid, responseBid) {
        const shape = handShape(hand);
        if (bidEquals(openingBid, 1, "NT")) return rebidAfterOneNotrumpResponseFiveCardHigh(shape, responseBid);
        if (bidEquals(openingBid, 2, "NT")) return rebidAfterTwoNotrumpResponseFiveCardHigh(shape, responseBid);
        if (bidEquals(openingBid, 2, "C")) {
          return isStrongTwoClubsPositiveResponse(responseBid)
            ? rebidAfterStrongTwoClubsPositiveResponseFiveCardHigh(shape, hand, responseBid)
            : rebidAfterStrongTwoClubsFiveCardHigh(shape, hand);
        }
        if (isOneSuitOpeningFiveCardHigh(openingBid)) return rebidAfterOneSuitOpeningFiveCardHigh(shape, hand, openingBid, responseBid);
        return Pass();
      }

  function rebidAfterOneNotrumpResponseFiveCardHigh(shape, responseBid) {
        if (bidEquals(responseBid, 2, "C")) {
          if (shape.counts.H >= 4) return bid(2, "H");
          if (shape.counts.S >= 4) return bid(2, "S");
          return bid(2, "D");
        }
        if (bidEquals(responseBid, 2, "D")) return bid(2, "H");
        if (bidEquals(responseBid, 2, "H")) return bid(2, "S");
        if (bidEquals(responseBid, 2, "NT")) return shape.hcp >= 16 ? bid(3, "NT") : Pass();
        return Pass();
      }

  function rebidAfterTwoNotrumpResponseFiveCardHigh(shape, responseBid) {
        if (bidEquals(responseBid, 3, "C")) {
          if (shape.counts.H >= 4) return bid(3, "H");
          if (shape.counts.S >= 4) return bid(3, "S");
          return bid(3, "D");
        }
        if (bidEquals(responseBid, 3, "D")) return bid(3, "H");
        if (bidEquals(responseBid, 3, "H")) return bid(3, "S");
        return Pass();
      }

  function rebidAfterStrongTwoClubsFiveCardHigh(shape, hand) {
        if (shape.balanced) {
          if (shape.hcp >= 25) return bid(3, "NT");
          if (shape.hcp >= 23) return bid(2, "NT");
        }
        const jumpMajor = chooseStrongTwoClubsJumpRebidMajor(shape, hand);
        if (jumpMajor) return bid(3, jumpMajor);
        const suit = chooseSuitByLengthThenRank(["S", "H", "D", "C"], shape, 5, true) || bestSuitByLength(shape);
        return bid(suit === "C" || suit === "D" ? 3 : 2, suit);
      }

  function rebidAfterStrongTwoClubsPositiveResponseFiveCardHigh(shape, hand, responseBid) {
        if ((responseBid.strain === "H" || responseBid.strain === "S") && shape.counts[responseBid.strain] >= 3) {
          return bid(gameLevel(responseBid.strain), responseBid.strain);
        }
        if (shape.balanced) {
          if (shape.hcp >= 25) return bid(3, "NT");
          if (shape.hcp >= 23) return isBidHigher(bid(2, "NT"), responseBid) ? bid(2, "NT") : bid(3, "NT");
        }
        const suit = chooseSuitByLengthThenRank(["S", "H", "D", "C"], shape, 5, true) || bestSuitByLength(shape);
        const level = cheapestLevelForStrain(suit, responseBid);
        return level <= 7 ? bid(level, suit) : bid(3, "NT");
      }

  function chooseStrongTwoClubsJumpRebidMajor(shape, hand) {
        const major = chooseSuitByLengthThenRank(["S", "H"], shape, 6, true);
        if (!major) return null;
        const playingTricksContext = strongTwoClubsPlayingTricksContext(shape, hand);
        if (shape.hcp >= 24 || playingTricksContext.playingTricks >= 9) return major;
        return null;
      }

  function isStrongTwoClubsPositiveResponse(responseBid) {
        return bidEquals(responseBid, 2, "H") || bidEquals(responseBid, 2, "S") || bidEquals(responseBid, 3, "C") || bidEquals(responseBid, 3, "D");
      }

  function isStrongTwoClubsTwoNotrumpRebid(openingBid, responseBid, openerRebid) {
        return bidEquals(openingBid, 2, "C") && isStrongTwoClubsPositiveResponse(responseBid) && bidEquals(openerRebid, 2, "NT");
      }

  function respondAfterStrongTwoClubsTwoNotrumpRebidFiveCardHigh(shape) {
        const transferMajor = chooseMajorByLength(shape, 5);
        if (transferMajor === "H") return bid(3, "D");
        if (transferMajor === "S") return bid(3, "H");
        if ((shape.counts.H >= 4 || shape.counts.S >= 4) && shape.hcp >= 4) return bid(3, "C");
        if (shape.hcp >= 4) return bid(3, "NT");
        return Pass();
      }

  function isStrongTwoClubsTwoNotrumpStayman(responseBid) {
        return bidEquals(responseBid, 3, "C");
      }

  function strongTwoClubsTwoNotrumpTransferSuit(responseBid) {
        return notrumpTransferSuit(bid(2, "NT"), responseBid);
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

  function notrumpOpeningMinimumHcp(openingBid) {
        if (bidEquals(openingBid, 2, "NT")) return 20;
        if (bidEquals(openingBid, 1, "NT")) return 15;
        return 0;
      }

  function chooseFiveCardHighResponderRebid(hand, openingBid, responseBid, openerRebid) {
        const shape = handShape(hand);
        if (bidEquals(openingBid, 1, "NT")) return rebidResponderAfterOneNotrumpFiveCardHigh(shape, responseBid, openerRebid, openingBid);
        if (bidEquals(openingBid, 2, "NT")) return rebidResponderAfterTwoNotrumpFiveCardHigh(shape, responseBid, openerRebid, openingBid);
        if (isStrongTwoClubsTwoNotrumpRebid(openingBid, responseBid, openerRebid)) return respondAfterStrongTwoClubsTwoNotrumpRebidFiveCardHigh(shape);
        if (isSingleRaiseInviteFiveCardHigh(responseBid, openerRebid)) return rebidResponderAfterSingleRaiseInviteFiveCardHigh(shape, openerRebid);
        if (isOneMinorOpeningFiveCardHigh(openingBid) && bidEquals(openerRebid, 1, "NT")) {
          const strongSecondMajor = rebidResponderAfterMinorOpeningOneNotrumpFiveCardHigh(shape, responseBid);
          if (strongSecondMajor) return strongSecondMajor;
        }
        if (isOneSuitOpeningFiveCardHigh(openingBid)) {
          const secondBid = rebidResponderAfterOneSuitOpeningFiveCardHigh(shape, openingBid, responseBid, openerRebid);
          if (secondBid) return secondBid;
          return chooseFiveCardHighNaturalContinuation(hand, openerRebid, openerRebid);
        }
        return Pass();
      }

  function rebidResponderAfterOneSuitOpeningFiveCardHigh(shape, openingBid, responseBid, openerRebid) {
        if (!openerRebid || openerRebid.strain === "NT") return rebidResponderAfterOpenerNotrumpRebidFiveCardHigh(shape, openingBid, responseBid, openerRebid);
        if (openerRebid.strain === openingBid.strain) return rebidResponderAfterOpenerRepeatsSuitFiveCardHigh(shape, openingBid, responseBid, openerRebid);
        if (openerRebid.strain === responseBid.strain) return rebidResponderAfterOpenerRaisesResponderFiveCardHigh(shape, responseBid, openerRebid);
        return rebidResponderAfterOpenerNewSuitFiveCardHigh(shape, openingBid, responseBid, openerRebid);
      }

  function rebidResponderAfterOpenerNotrumpRebidFiveCardHigh(shape, openingBid, responseBid, openerRebid) {
        if (!openerRebid || openerRebid.strain !== "NT") return null;
        if (isOneMinorOpeningFiveCardHigh(openingBid) && bidEquals(responseBid, 1, "S") && bidEquals(openerRebid, 1, "NT") && shape.counts.S >= 5 && shape.counts.H >= 4) {
          return bid(2, "H");
        }
        if (shape.hcp >= 12) {
          if ((responseBid.strain === "H" || responseBid.strain === "S") && shape.counts[responseBid.strain] >= 5) return bid(gameLevel(responseBid.strain), responseBid.strain);
          return bid(3, "NT");
        }
        if (shape.hcp >= 10) return bid(2, "NT");
        if (shape.counts[responseBid.strain] >= 6) return bid(2, responseBid.strain);
        return Pass();
      }

  function rebidResponderAfterOpenerRepeatsSuitFiveCardHigh(shape, openingBid, responseBid, openerRebid) {
        if (shape.hcp >= 12) {
          if ((openingBid.strain === "H" || openingBid.strain === "S") && shape.counts[openingBid.strain] >= 3) return bid(gameLevel(openingBid.strain), openingBid.strain);
          if ((responseBid.strain === "H" || responseBid.strain === "S") && shape.counts[responseBid.strain] >= 6) return bid(gameLevel(responseBid.strain), responseBid.strain);
          return bid(3, "NT");
        }
        if (shape.hcp >= 10) return bid(2, "NT");
        if (shape.counts[openingBid.strain] >= supportLengthForOpening(openingBid.strain)) return bid(cheapestLevelForStrain(openingBid.strain, openerRebid), openingBid.strain);
        if (shape.counts[responseBid.strain] >= 6) return bid(cheapestLevelForStrain(responseBid.strain, openerRebid), responseBid.strain);
        return Pass();
      }

  function rebidResponderAfterOpenerRaisesResponderFiveCardHigh(shape, responseBid, openerRebid) {
        if (shape.hcp >= 12) return bid(gameLevel(responseBid.strain), responseBid.strain);
        if (shape.hcp >= 10) return bid(Math.min(3, gameLevel(responseBid.strain)), responseBid.strain);
        return Pass();
      }

  function rebidResponderAfterOpenerNewSuitFiveCardHigh(shape, openingBid, responseBid, openerRebid) {
        const fourthSuit = fourthSuitForAuction(openingBid, responseBid, openerRebid);
        if (shape.hcp >= 12) {
          if ((responseBid.strain === "H" || responseBid.strain === "S") && shape.counts[responseBid.strain] >= 6) return bid(gameLevel(responseBid.strain), responseBid.strain);
          if ((openerRebid.strain === "H" || openerRebid.strain === "S") && shape.counts[openerRebid.strain] >= 4) return bid(gameLevel(openerRebid.strain), openerRebid.strain);
          if (shape.balanced) return bid(3, "NT");
          if (fourthSuit) return bid(cheapestLevelForStrain(fourthSuit, openerRebid), fourthSuit);
          return bid(3, "NT");
        }
        if (shape.hcp >= 10) {
          if (canBidAtOrBelow(bid(2, "NT"), openerRebid, 2)) return bid(2, "NT");
          if (shape.counts[openerRebid.strain] >= 4) return bid(cheapestLevelForStrain(openerRebid.strain, openerRebid), openerRebid.strain);
          if (shape.counts[responseBid.strain] >= 6) return bid(cheapestLevelForStrain(responseBid.strain, openerRebid), responseBid.strain);
          return bid(cheapestLevelForStrain(openingBid.strain, openerRebid), openingBid.strain);
        }
        if (canBidAtOrBelow(bid(1, "NT"), openerRebid, 1) && shape.balanced) return bid(1, "NT");
        if (shape.counts[openingBid.strain] >= minimumPreferenceLengthFiveCardHigh(openingBid.strain)) {
          return bid(cheapestLevelForStrain(openingBid.strain, openerRebid), openingBid.strain);
        }
        if (shape.counts[responseBid.strain] >= 6) return bid(cheapestLevelForStrain(responseBid.strain, openerRebid), responseBid.strain);
        if (shape.counts[openerRebid.strain] >= 4) return bid(cheapestLevelForStrain(openerRebid.strain, openerRebid), openerRebid.strain);
        return Pass();
      }

  function rebidResponderAfterMinorOpeningOneNotrumpFiveCardHigh(shape, responseBid) {
        if (bidEquals(responseBid, 1, "H") && shape.counts.H >= 5 && shape.counts.S >= 4 && shape.hcp >= 13) {
          return bid(3, "S");
        }
        return null;
      }

  function isSingleRaiseInviteFiveCardHigh(responseBid, openerRebid) {
        return (
          responseBid?.level === 2 &&
          (responseBid.strain === "H" || responseBid.strain === "S") &&
          openerRebid?.level === 3 &&
          openerRebid.strain === responseBid.strain
        );
      }

  function rebidResponderAfterSingleRaiseInviteFiveCardHigh(shape, openerRebid) {
        return shape.hcp >= 8 ? bid(gameLevel(openerRebid.strain), openerRebid.strain) : Pass();
      }

  function rebidResponderAfterOneNotrumpFiveCardHigh(shape, responseBid, openerRebid, openingBid = bid(1, "NT")) {
        if (bidEquals(responseBid, 2, "C")) {
          const foundFit = (openerRebid.strain === "H" || openerRebid.strain === "S") && shape.counts[openerRebid.strain] >= 4;
          if (foundFit) {
            if (shape.hcp >= 10) return bid(4, openerRebid.strain);
            if (shape.hcp >= 8) return bid(3, openerRebid.strain);
          }
          if (shape.hcp >= 10) return bid(3, "NT");
          if (shape.hcp >= 8) return bid(2, "NT");
          return Pass();
        }

        const transferSuit = bidEquals(responseBid, 2, "D") ? "H" : bidEquals(responseBid, 2, "H") ? "S" : null;
        if (transferSuit) {
          const otherMajor = transferSuit === "H" ? "S" : "H";
          const transferLength = shape.counts[transferSuit] || 0;
          const otherMajorLength = shape.counts[otherMajor] || 0;
          if (shape.hcp < 8) return Pass();
          if (transferSuit === "H" && transferLength === 5 && otherMajorLength >= 4) return bid(2, "S");
          if (transferSuit === "S" && transferLength === 5 && otherMajorLength >= 5 && shape.hcp >= 10) return bid(4, "H");
          if (transferSuit === "S" && transferLength === 5 && otherMajorLength >= 4) {
            if (shape.hcp >= 10) return bid(3, "H");
            return bid(2, "NT");
          }
          if (shouldUseBlackwoodAfterAcceptedTransfer(shape, openingBid, transferSuit)) return bid(4, "NT");
          if (shape.counts[transferSuit] >= 6) {
            if (shape.hcp >= 10) return bid(4, transferSuit);
            return bid(3, transferSuit);
          }
          if (shape.hcp >= 10) return bid(3, "NT");
          return bid(2, "NT");
        }
        return Pass();
      }

  function rebidResponderAfterTwoNotrumpFiveCardHigh(shape, responseBid, openerRebid, openingBid = bid(2, "NT")) {
        if (bidEquals(responseBid, 3, "C")) {
          if ((openerRebid.strain === "H" || openerRebid.strain === "S") && shape.counts[openerRebid.strain] >= 4) return bid(4, openerRebid.strain);
          return bid(3, "NT");
        }
        const transferSuit = bidEquals(responseBid, 3, "D") ? "H" : bidEquals(responseBid, 3, "H") ? "S" : null;
        if (transferSuit && shouldUseBlackwoodAfterAcceptedTransfer(shape, openingBid, transferSuit)) return bid(4, "NT");
        if (transferSuit && shape.counts[transferSuit] >= 6) return bid(4, transferSuit);
        if (transferSuit && shape.hcp >= 4) return bid(3, "NT");
        return Pass();
      }

  function chooseFiveCardHighOpenerThirdBid(hand, partnershipCalls) {
        const shape = handShape(hand);
        const openingBid = partnershipCalls[0].bid;
        const responseBid = partnershipCalls[1].bid;
        const openerRebid = partnershipCalls[2]?.bid;
        const responderRebid = partnershipCalls[3]?.bid;
        const openerThirdBid = partnershipCalls[4]?.bid;
        if (!responderRebid) return Pass();

        const blackwoodTrump = agreedTrumpAfterAcceptedNotrumpTransfer(openingBid, responseBid, openerRebid);
        if (!openerThirdBid && blackwoodTrump && isBlackwoodAsk(responderRebid)) {
          return blackwoodResponseBidForAceCount(countAces(hand)) || Pass();
        }

        if (isFourthSuitForcingBid(openingBid, responseBid, openerRebid, responderRebid)) {
          return rebidOpenerAfterFourthSuitFiveCardHigh(shape, hand, openingBid, responseBid, openerRebid, responderRebid);
        }

        if (isStrongTwoClubsTwoNotrumpRebid(openingBid, responseBid, openerRebid)) {
          return rebidAfterTwoNotrumpResponseFiveCardHigh(shape, responderRebid);
        }

        if (!bidEquals(openingBid, 1, "NT")) return Pass();

        if (bidEquals(responseBid, 2, "C")) {
          if (bidEquals(responderRebid, 2, "NT")) {
            if ((openerRebid?.strain === "H" || openerRebid?.strain === "S") && shape.hcp >= 16 && shape.counts[openerRebid.strain] >= 5) {
              return bid(3, openerRebid.strain);
            }
            if (openerRebid?.strain === "H" && shape.counts.S >= 4) return shape.hcp >= 16 ? bid(4, "S") : bid(3, "S");
            return shape.hcp >= 16 ? bid(3, "NT") : Pass();
          }
          if (bidEquals(responderRebid, 3, "NT")) {
            if (openerRebid?.strain === "H" && shape.counts.S >= 4) return bid(4, "S");
            return Pass();
          }
          if ((responderRebid.strain === "H" || responderRebid.strain === "S") && responderRebid.level === 3) {
            return shape.hcp >= 16 ? bid(4, responderRebid.strain) : Pass();
          }
        }

        const transferSuit = bidEquals(responseBid, 2, "D") ? "H" : bidEquals(responseBid, 2, "H") ? "S" : null;
        if (!transferSuit) return Pass();
        const hasThreeCardSupport = shape.counts[transferSuit] >= 3;
        if (transferSuit === "H" && bidEquals(responderRebid, 2, "S")) {
          if (shape.counts.S >= 4) return shape.hcp >= 16 ? bid(4, "S") : Pass();
          if (hasThreeCardSupport) return shape.hcp >= 16 ? bid(4, "H") : bid(3, "H");
          return shape.hcp >= 16 ? bid(3, "NT") : bid(2, "NT");
        }
        if (transferSuit === "S" && bidEquals(responderRebid, 3, "H")) {
          if (shape.counts.H >= 4) return bid(4, "H");
          if (hasThreeCardSupport) return bid(4, "S");
          return bid(3, "NT");
        }
        if (transferSuit === "S" && bidEquals(responderRebid, 4, "H")) {
          return shape.counts.H >= 3 ? Pass() : bid(4, "S");
        }
        if (bidEquals(responderRebid, 2, "NT")) {
          if (shape.hcp <= 15) return hasThreeCardSupport ? bid(3, transferSuit) : Pass();
          return hasThreeCardSupport ? bid(4, transferSuit) : bid(3, "NT");
        }
        if (bidEquals(responderRebid, 3, "NT") && hasThreeCardSupport) return bid(4, transferSuit);
        if (bidEquals(responderRebid, 3, transferSuit)) return shape.hcp >= 16 ? bid(4, transferSuit) : Pass();
        return Pass();
      }

  function rebidOpenerAfterFourthSuitFiveCardHigh(shape, hand, openingBid, responseBid, openerRebid, responderRebid) {
        if (responseBid.strain !== "NT" && shape.counts[responseBid.strain] >= 3) {
          return bid(cheapestLevelForStrain(responseBid.strain, responderRebid), responseBid.strain);
        }
        if (hasStopper(hand, responderRebid.strain)) return bid(cheapestLevelForStrain("NT", responderRebid), "NT");
        if (shape.counts[openingBid.strain] >= 6) return bid(cheapestLevelForStrain(openingBid.strain, responderRebid), openingBid.strain);
        if (shape.counts[openerRebid.strain] >= 5) return bid(cheapestLevelForStrain(openerRebid.strain, responderRebid), openerRebid.strain);
        return nextAvailableBid(bid(cheapestLevelForStrain("NT", responderRebid), "NT"), responderRebid);
      }

  function chooseFiveCardHighResponderAfterFourthSuit(hand, partnershipCalls) {
        const shape = handShape(hand);
        const openingBid = partnershipCalls[0]?.bid;
        const responseBid = partnershipCalls[1]?.bid;
        const openerRebid = partnershipCalls[2]?.bid;
        const responderRebid = partnershipCalls[3]?.bid;
        const openerThirdBid = partnershipCalls[4]?.bid;
        const blackwoodTrump = agreedTrumpAfterAcceptedNotrumpTransfer(openingBid, responseBid, openerRebid);
        if (blackwoodTrump && isBlackwoodAsk(responderRebid) && openerThirdBid) {
          return chooseBlackwoodFollowup({
            trumpSuit: blackwoodTrump,
            askerAceCount: countAces(hand),
            partnerAceCount: blackwoodShownAceCount(openerThirdBid, partnershipCalls[4]?.bidResult),
            partnershipMinimumHcp: shape.hcp + notrumpOpeningMinimumHcp(openingBid)
          }) || Pass();
        }
        if (isStrongTwoClubsTwoNotrumpRebid(openingBid, responseBid, openerRebid) && openerThirdBid) {
          return rebidResponderAfterTwoNotrumpFiveCardHigh(shape, responderRebid, openerThirdBid);
        }
        if (!isFourthSuitForcingBid(openingBid, responseBid, openerRebid, responderRebid) || !openerThirdBid) return Pass();
        if (openerThirdBid.strain === responseBid.strain && (responseBid.strain === "H" || responseBid.strain === "S")) return bid(gameLevel(responseBid.strain), responseBid.strain);
        if (openerThirdBid.strain === "NT") return openerThirdBid.level >= gameLevel("NT") ? Pass() : bid(gameLevel("NT"), "NT");
        if ((openerThirdBid.strain === "H" || openerThirdBid.strain === "S") && shape.counts[openerThirdBid.strain] >= 4) return bid(gameLevel(openerThirdBid.strain), openerThirdBid.strain);
        if ((openerThirdBid.strain === "C" || openerThirdBid.strain === "D") && shape.counts[openerThirdBid.strain] >= 4) {
          return bid(gameLevel(openerThirdBid.strain), openerThirdBid.strain);
        }
        if (responseBid.strain !== "NT" && shape.counts[responseBid.strain] >= 6 && (responseBid.strain === "H" || responseBid.strain === "S")) {
          return bid(gameLevel(responseBid.strain), responseBid.strain);
        }
        if (openerThirdBid.strain === openingBid.strain && shape.counts[openingBid.strain] >= supportLengthForOpening(openingBid.strain)) {
          return bid(gameLevel(openingBid.strain), openingBid.strain);
        }
        return bid(3, "NT");
      }


  function describeOpenerRebidChoice(chosenBid, shape, hand, openingBid, responseBid, base) {
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
        if (bidEquals(openingBid, 2, "C") && isStrongTwoClubsPositiveResponse(responseBid)) {
          const playingTricksContext = strongTwoClubsPlayingTricksContext(shape, hand);
          extra = {
            ...extra,
            ...playingTricksContext,
            support: responseBid?.strain && responseBid.strain !== "NT" ? shape.counts[responseBid.strain] || 0 : 0
          };
          if (
            (responseBid.strain === "H" || responseBid.strain === "S") &&
            chosenBid.strain === responseBid.strain &&
            chosenBid.level === gameLevel(responseBid.strain) &&
            shape.counts[responseBid.strain] >= 3
          ) {
            return fiveCardHighBidChoiceResult(
              chosenBid,
              "continuation.strongTwoClubsPositiveMajorSupport",
              "basic",
              "Raise partner's positive major response with three-card support after the strong 2C opening.",
              extra
            );
          }
          if (chosenBid.strain === "NT") {
            return fiveCardHighBidChoiceResult(
              chosenBid,
              chosenBid.level === 2 ? "continuation.strongTwoClubsPositiveNotrumpRebid" : "continuation.strongTwoClubsPositiveNotrumpGame",
              "basic",
              "Rebid notrump after partner's positive response to the strong 2C opening.",
              extra
            );
          }
          return fiveCardHighBidChoiceResult(
            chosenBid,
            "continuation.strongTwoClubsPositiveSuitRebid",
            "basic",
            "Show opener's own long suit after partner's positive response to the strong 2C opening.",
            extra
          );
        }
        if (bidEquals(openingBid, 2, "C") && bidEquals(responseBid, 2, "D")) {
          const playingTricksContext = strongTwoClubsPlayingTricksContext(shape, hand);
          extra = { ...extra, ...playingTricksContext };
          if (
            chosenBid.level === 3 &&
            (chosenBid.strain === "H" || chosenBid.strain === "S") &&
            shape.counts[chosenBid.strain] >= 6 &&
            (shape.hcp >= 24 || playingTricksContext.playingTricks >= 9)
          ) {
            return fiveCardHighBidChoiceResult(
              chosenBid,
              "continuation.strongTwoClubsJumpRebid",
              "basic",
              "Jump rebid after the 2D waiting response to show an extra-strong hand with a long major.",
              extra
            );
          }
          return fiveCardHighBidChoiceResult(
            chosenBid,
            chosenBid.strain === "NT" ? "continuation.strongTwoClubsNotrumpRebid" : "continuation.strongTwoClubsSuitRebid",
            "basic",
            "Rebid after partner's 2D waiting response to the strong 2C opening.",
            extra
          );
        }

        if (isMinorRaiseFiveCardHigh(openingBid, responseBid) && chosenBid.strain === "NT") {
          return fiveCardHighBidChoiceResult(
            chosenBid,
            "continuation.openerMinorRaiseNotrumpGame",
            "basic",
            "Bid 3NT with balanced game-going strength after partner's minor raise.",
            extra
          );
        }
        if (minorNotrumpResponseContext) {
          const ruleName = openerAfterMinorNotrumpResponseRuleName(chosenBid, openingBid, responseBid);
          if (ruleName) {
            return fiveCardHighBidChoiceResult(
              chosenBid,
              ruleName,
              "basic",
              "Rebid after partner's notrump response to a minor opening; partner has not found a major-suit fit.",
              extra
            );
          }
        }
        if ((bidEquals(openingBid, 1, "NT") || bidEquals(openingBid, 2, "NT")) && responseBid?.strain === "C") {
          return fiveCardHighBidChoiceResult(chosenBid, "continuation.staymanAnswer", "basic", "Answer Stayman by showing a four-card major or denying one.", extra);
        }
        const transferSuit = notrumpTransferSuit(openingBid, responseBid);
        if (transferSuit && chosenBid.strain === transferSuit) {
          return fiveCardHighBidChoiceResult(chosenBid, "continuation.acceptTransfer", "basic", "Accept partner's transfer by bidding the requested major.", {
            ...extra,
            transferSuit
          });
        }
        if (isMinorOpeningOneLevelNewSuitFiveCardHigh(openingBid, responseBid)) {
          const ruleName = openerAfterMinorOneLevelNewSuitRuleName(chosenBid, openingBid, responseBid, shape);
          if (ruleName) {
            return fiveCardHighBidChoiceResult(
              chosenBid,
              ruleName,
              "basic",
              "Rebid after partner's one-level new suit response to a minor opening, using fit, strength, and reverse rules.",
              extra
            );
          }
        }
        if (isOneDiamondTwoClubsResponseFiveCardHigh(openingBid, responseBid)) {
          const ruleName = openerAfterOneDiamondTwoClubsRuleName(chosenBid, openingBid, responseBid);
          if (ruleName) {
            return fiveCardHighBidChoiceResult(
              chosenBid,
              ruleName,
              "basic",
              "Rebid after partner's 2C response to 1D; partner has 10+ points, clubs, and no four-card major.",
              extra
            );
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

  function describeResponderRebidChoice(chosenBid, shape, openingBid, responseBid, openerRebid, base) {
        const extra = {
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
        if (isStrongTwoClubsTwoNotrumpRebid(openingBid, responseBid, openerRebid)) {
          const transferSuitAfterTwoNotrump = strongTwoClubsTwoNotrumpTransferSuit(chosenBid);
          if (bidEquals(chosenBid, 3, "C")) {
            return fiveCardHighBidChoiceResult(chosenBid, "continuation.strongTwoClubsTwoNotrumpStayman", "basic", "Use Stayman after opener's 2NT rebid in a strong 2C auction.", {
              ...extra,
              convention: "stayman",
              openingLevel: 2,
              range: "4+"
            });
          }
          if (transferSuitAfterTwoNotrump) {
            return fiveCardHighBidChoiceResult(chosenBid, `continuation.strongTwoClubsTwoNotrumpTransferTo${transferSuitAfterTwoNotrump}`, "basic", "Use a Jacoby transfer after opener's 2NT rebid in a strong 2C auction.", {
              ...extra,
              convention: "jacobyTransfer",
              openingLevel: 2,
              transferSuit: transferSuitAfterTwoNotrump,
              length: shape.counts[transferSuitAfterTwoNotrump] || 0
            });
          }
          if (bidEquals(chosenBid, 3, "NT")) {
            return fiveCardHighBidChoiceResult(chosenBid, "continuation.strongTwoClubsTwoNotrumpGame", "basic", "Choose 3NT after opener's 2NT rebid with enough values and no major-suit convention.", {
              ...extra,
              openingLevel: 2,
              range: "4+"
            });
          }
        }
        const transferSuit = (bidEquals(openingBid, 1, "NT") || bidEquals(openingBid, 2, "NT")) ? notrumpTransferSuit(openingBid, responseBid) : null;
        if (transferSuit) {
          const isOneNotrumpTransfer = bidEquals(openingBid, 1, "NT");
          const isTwoNotrumpTransfer = bidEquals(openingBid, 2, "NT");
          const otherMajor = transferSuit === "H" ? "S" : "H";
          const transferLength = shape.counts[transferSuit] || 0;
          const otherMajorLength = shape.counts[otherMajor] || 0;
          const transferExtra = {
            ...extra,
            convention: "jacobyTransfer",
            openingLevel: openingBid.level,
            transferSuit,
            suit: chosenBid.strain,
            length: transferLength,
            otherMajor,
            otherMajorLength
          };
          if (isBlackwoodAsk(chosenBid)) {
            return fiveCardHighBidChoiceResult(
              chosenBid,
              "continuation.blackwoodAsk",
              "basic",
              "Ask for aces with four notrump after a major-suit transfer has established a trump suit.",
              {
                ...transferExtra,
                artificial: true,
                forcing: true,
                trumpSuit: transferSuit,
                aceCount: base.aceCount,
                partnershipMinimumHcp: shape.hcp + notrumpOpeningMinimumHcp(openingBid)
              }
            );
          }
          if (isOneNotrumpTransfer && transferSuit === "H" && chosenBid.strain === "S" && transferLength === 5 && otherMajorLength >= 4) {
            return fiveCardHighBidChoiceResult(
              chosenBid,
              "continuation.responderAfterTransferFiveHeartsFourSpades",
              "basic",
              "Show four spades after transferring to hearts with at least invitational values.",
              {
                ...transferExtra,
                range: "8+"
              }
            );
          }
          if (isOneNotrumpTransfer && transferSuit === "S" && chosenBid.strain === "H" && transferLength === 5 && otherMajorLength >= 5) {
            return fiveCardHighBidChoiceResult(
              chosenBid,
              "continuation.responderAfterTransferTwoFiveMajorsGame",
              "basic",
              "Jump to four hearts with two five-card majors after transferring to spades.",
              {
                ...transferExtra,
                range: "10+"
              }
            );
          }
          if (isOneNotrumpTransfer && transferSuit === "S" && chosenBid.strain === "H" && transferLength === 5 && otherMajorLength >= 4) {
            return fiveCardHighBidChoiceResult(
              chosenBid,
              "continuation.responderAfterTransferFiveSpadesFourHeartsGame",
              "basic",
              "Show four hearts at the three-level after transferring to spades; this is game-forcing.",
              {
                ...transferExtra,
                range: "10+",
                gameForcing: true
              }
            );
          }
          if (isOneNotrumpTransfer && transferSuit === "S" && chosenBid.strain === "NT" && transferLength === 5 && otherMajorLength >= 4) {
            return fiveCardHighBidChoiceResult(
              chosenBid,
              "continuation.responderAfterTransferFiveSpadesFourHeartsInvite",
              "basic",
              "Invite with two notrump because showing hearts would require the three-level.",
              {
                ...transferExtra,
                range: "8-9"
              }
            );
          }
          if (chosenBid.strain === transferSuit && shape.counts[transferSuit] >= 6) {
            return fiveCardHighBidChoiceResult(
              chosenBid,
              chosenBid.level === gameLevel(transferSuit) ? "continuation.responderAfterTransferSixCardGame" : "continuation.responderAfterTransferSixCardInvite",
              "basic",
              "Rebid the transferred major with a six-card suit or longer after partner accepted the transfer.",
              {
                ...transferExtra,
                range: isTwoNotrumpTransfer ? "4+" : chosenBid.level === gameLevel(transferSuit) ? "10+" : "8-9"
              }
            );
          }
          if (chosenBid.strain === "NT") {
            return fiveCardHighBidChoiceResult(
              chosenBid,
              chosenBid.level === 3 ? "continuation.responderAfterTransferNotrumpGame" : "continuation.responderAfterTransferNotrumpInvite",
              "basic",
              "Rebid notrump with only a five-card transferred major and invitational or game-going strength.",
              {
                ...transferExtra,
                range: isTwoNotrumpTransfer ? "4+" : chosenBid.level === 3 ? "10+" : "8-9"
              }
            );
          }
        }
        if (bidEquals(openingBid, 1, "NT") && bidEquals(responseBid, 2, "C")) {
          const foundFit = (openerRebid?.strain === "H" || openerRebid?.strain === "S") && shape.counts[openerRebid.strain] >= 4;
          if (foundFit && chosenBid.strain === openerRebid.strain) {
            return fiveCardHighBidChoiceResult(
              chosenBid,
              chosenBid.level === gameLevel(openerRebid.strain) ? "continuation.responderAfterStaymanFitGame" : "continuation.responderAfterStaymanFitInvite",
              "basic",
              "Choose the major after Stayman found a fit.",
              {
                ...extra,
                convention: "stayman",
                fitSuit: openerRebid.strain,
                support: shape.counts[openerRebid.strain] || 0,
                range: chosenBid.level === gameLevel(openerRebid.strain) ? "10+" : "8-9"
              }
            );
          }
          if (chosenBid.strain === "NT") {
            return fiveCardHighBidChoiceResult(
              chosenBid,
              chosenBid.level === 3 ? "continuation.responderAfterStaymanNoFitGame" : "continuation.responderAfterStaymanNoFitInvite",
              "basic",
              "Return to notrump after Stayman did not find responder's major-suit fit.",
              {
                ...extra,
                convention: "stayman",
                deniedFitSuit: openerRebid?.strain || null,
                range: chosenBid.level === 3 ? "10+" : "8-9"
              }
            );
          }
        }
        const fourthSuit = fourthSuitForAuction(openingBid, responseBid, openerRebid);
        if (fourthSuit && bidEquals(chosenBid, cheapestLevelForStrain(fourthSuit, openerRebid), fourthSuit)) {
          return fiveCardHighBidChoiceResult(chosenBid, "continuation.responderFourthSuitForcing", "basic", "Use fourth-suit forcing with game-going values when no natural game is clear.", {
            ...extra,
            convention: "fourthSuitForcing",
            forcing: true,
            gameForcing: true,
            artificial: true,
            alert: true,
            fourthSuit,
            range: "12+"
          });
        }
        if (chosenBid.strain === openingBid?.strain && openerRebid?.strain !== openingBid?.strain) {
          return fiveCardHighBidChoiceResult(chosenBid, "continuation.responderPreference", "basic", "Give preference to opener's first suit with a minimum response after opener showed a second suit.", {
            ...extra,
            preferenceSuit: openingBid.strain,
            range: shape.hcp <= 9 ? "6-9" : "10+"
          });
        }
        if (bidEquals(chosenBid, 1, "NT")) {
          return fiveCardHighBidChoiceResult(chosenBid, "continuation.responderOneNotrumpMinimum", "basic", "Keep the auction low with 6-9 HCP while the auction is still at the one-level.", {
            ...extra,
            range: "6-9"
          });
        }
        if (bidEquals(chosenBid, 2, "NT")) {
          return fiveCardHighBidChoiceResult(chosenBid, "continuation.responderTwoNotrumpInvite", "basic", "Invite with 10-11 HCP after opener has described a limited hand.", {
            ...extra,
            range: "10-11"
          });
        }
        if (openerRebid?.strain !== "NT" && chosenBid.strain === openerRebid?.strain && shape.counts[openerRebid.strain] >= 4) {
          return fiveCardHighBidChoiceResult(chosenBid, "continuation.responderRaiseOpenerSecondSuit", "basic", "Raise opener's second suit with a fit.", extra);
        }
        if (chosenBid.strain === responseBid?.strain && shape.counts[responseBid.strain] >= 6) {
          return fiveCardHighBidChoiceResult(chosenBid, "continuation.responderRebidOwnSixCard", "basic", "Rebid responder's own six-card suit.", extra);
        }
        if (
          isSingleRaiseInviteFiveCardHigh(responseBid, openerRebid) &&
          chosenBid.strain === openerRebid.strain &&
          chosenBid.level === gameLevel(openerRebid.strain)
        ) {
          return fiveCardHighBidChoiceResult(chosenBid, "continuation.acceptMajorInvite", "basic", "Accept partner's invitational raise with the upper range for the single raise.", extra);
        }
        if (bidEquals(responseBid, 1, "H") && bidEquals(openerRebid, 1, "NT") && bidEquals(chosenBid, 3, "S")) {
          return fiveCardHighBidChoiceResult(chosenBid, "continuation.responderStrongSecondMajor", "basic", "Show a strong 5-4 major hand after opener's 1NT rebid.", extra);
        }
        if (openerRebid?.strain !== "NT" && chosenBid.strain === openerRebid?.strain) {
          return fiveCardHighBidChoiceResult(chosenBid, "continuation.raisePartner", "basic", "Raise opener's shown suit with a fit.", extra);
        }
        if (chosenBid.strain === "NT") {
          return fiveCardHighBidChoiceResult(chosenBid, "continuation.notrumpRebid", "basic", "Place the contract in notrump with balanced values.", extra);
        }
        return fiveCardHighBidChoiceResult(chosenBid, "continuation.newSuit", "basic", "Continue naturally with the best available suit.", extra);
      }

  function describeOpenerThirdBidChoice(chosenBid, shape, hand, partnershipCalls, base) {
        const openingBid = partnershipCalls[0]?.bid;
        const responseBid = partnershipCalls[1]?.bid;
        const openerRebid = partnershipCalls[2]?.bid;
        const responderRebid = partnershipCalls[3]?.bid;
        const fourthSuit = fourthSuitForAuction(openingBid, responseBid, openerRebid);
        const blackwoodTrump = agreedTrumpAfterAcceptedNotrumpTransfer(openingBid, responseBid, openerRebid);
        const extra = {
          ...base,
          category: "continuation",
          suit: chosenBid.strain,
          length: shape.counts[chosenBid.strain] || 0,
          openingSuit: openingBid?.strain || null,
          responseSuit: responseBid?.strain || null,
          openerRebidSuit: openerRebid?.strain || null,
          fourthSuit
        };
        if (blackwoodTrump && isBlackwoodAsk(responderRebid) && chosenBid.level === 5) {
          return fiveCardHighBidChoiceResult(chosenBid, "continuation.blackwoodResponse", "basic", "Answer partner's four-notrump ace ask.", {
            ...extra,
            convention: "blackwood",
            artificial: true,
            forcing: true,
            trumpSuit: blackwoodTrump,
            aceCount: base.aceCount
          });
        }
        if (isStrongTwoClubsTwoNotrumpRebid(openingBid, responseBid, openerRebid)) {
          if (isStrongTwoClubsTwoNotrumpStayman(responderRebid)) {
            return fiveCardHighBidChoiceResult(chosenBid, "continuation.strongTwoClubsTwoNotrumpStaymanAnswer", "basic", "Answer Stayman after the strong 2C auction continued with opener's 2NT rebid.", {
              ...extra,
              convention: "stayman",
              openingLevel: 2
            });
          }
          const transferSuitAfterTwoNotrump = strongTwoClubsTwoNotrumpTransferSuit(responderRebid);
          if (transferSuitAfterTwoNotrump && chosenBid.strain === transferSuitAfterTwoNotrump) {
            return fiveCardHighBidChoiceResult(chosenBid, "continuation.strongTwoClubsTwoNotrumpAcceptTransfer", "basic", "Accept the Jacoby transfer after the strong 2C auction continued with opener's 2NT rebid.", {
              ...extra,
              convention: "jacobyTransfer",
              openingLevel: 2,
              transferSuit: transferSuitAfterTwoNotrump
            });
          }
        }
        const transferSuit = bidEquals(openingBid, 1, "NT") ? notrumpTransferSuit(openingBid, responseBid) : null;
        if (transferSuit) {
          const transferExtra = {
            ...extra,
            convention: "jacobyTransfer",
            transferSuit,
            responderSecondSuit: responderRebid?.strain || null,
            support: chosenBid.strain && chosenBid.strain !== "NT" ? shape.counts[chosenBid.strain] || 0 : 0
          };
          if (transferSuit === "H" && bidEquals(responderRebid, 2, "S")) {
            return fiveCardHighBidChoiceResult(
              chosenBid,
              chosenBid.strain === "NT" ? "continuation.openerAfterTransferFiveHeartsFourSpadesNotrump" : "continuation.openerAfterTransferFiveHeartsFourSpadesChooseMajor",
              "basic",
              "Choose a strain after responder showed five hearts and four spades after a transfer.",
              {
                ...transferExtra,
                gameBid: chosenBid.level >= 4,
                maximum: shape.hcp >= 16
              }
            );
          }
          if (transferSuit === "S" && bidEquals(responderRebid, 3, "H")) {
            return fiveCardHighBidChoiceResult(
              chosenBid,
              "continuation.openerAfterTransferFiveSpadesFourHeartsChooseGame",
              "basic",
              "Choose a game after responder showed five spades and four hearts; the three-heart bid is forcing to game.",
              {
                ...transferExtra,
                gameForcing: true,
                supportSpades: shape.counts.S || 0,
                supportHearts: shape.counts.H || 0
              }
            );
          }
          if (transferSuit === "S" && bidEquals(responderRebid, 4, "H")) {
            return fiveCardHighBidChoiceResult(
              chosenBid,
              "continuation.openerAfterTransferTwoFiveMajorsChooseSpades",
              "basic",
              "Correct to spades after responder showed two five-card majors and opener prefers spades.",
              {
                ...transferExtra,
                supportSpades: shape.counts.S || 0,
                supportHearts: shape.counts.H || 0
              }
            );
          }
          if (bidEquals(responderRebid, 2, "NT")) {
            const ruleName = chosenBid.strain === transferSuit
              ? chosenBid.level === gameLevel(transferSuit)
                ? "continuation.openerAfterTransferInviteMaximumSupportGame"
                : "continuation.openerAfterTransferInviteMinimumSupport"
              : "continuation.openerAfterTransferInviteMaximumNotrump";
            return fiveCardHighBidChoiceResult(
              chosenBid,
              ruleName,
              "basic",
              "Choose after responder's invitational notrump rebid following a Jacoby transfer.",
              {
                ...transferExtra,
                support: shape.counts[transferSuit] || 0,
                maximum: shape.hcp >= 16,
                range: shape.hcp >= 16 ? "16-17" : "15"
              }
            );
          }
        }
        if (bidEquals(openingBid, 1, "NT") && bidEquals(responseBid, 2, "C")) {
          if (openerRebid?.strain === "H" && (bidEquals(responderRebid, 2, "NT") || bidEquals(responderRebid, 3, "NT"))) {
            const hasSpadeFit = shape.counts.S >= 4;
            const staymanExtra = {
              ...extra,
              convention: "stayman",
              responderDeniedSuit: "H",
              possibleFitSuit: "S",
              support: hasSpadeFit ? shape.counts.S : 0,
              maximum: shape.hcp >= 16,
              gameForcing: bidEquals(responderRebid, 3, "NT")
            };
            if (bidEquals(responderRebid, 2, "NT") && chosenBid.strain === openerRebid.strain && shape.counts[openerRebid.strain] >= 5) {
              return fiveCardHighBidChoiceResult(
                chosenBid,
                "continuation.openerAfterStaymanInviteFiveCardMajor",
                "basic",
                "Show a five-card major after opening 1NT and accepting responder's Stayman invite.",
                {
                  ...staymanExtra,
                  fiveCardMajor: openerRebid.strain,
                  length: shape.counts[openerRebid.strain] || 0
                }
              );
            }
            if (chosenBid.strain === "S") {
              return fiveCardHighBidChoiceResult(
                chosenBid,
                chosenBid.level === 4 ? "continuation.openerAfterStaymanNoHeartFitSpadeGame" : "continuation.openerAfterStaymanNoHeartFitSpadeInvite",
                "basic",
                "Choose spades after responder denied a heart fit but may still have four spades.",
                staymanExtra
              );
            }
            if (chosenBid.strain === "NT") {
              return fiveCardHighBidChoiceResult(
                chosenBid,
                chosenBid.level === 3 ? "continuation.openerAfterStaymanNoHeartFitNotrumpGame" : "continuation.openerAfterStaymanNoHeartFitNotrumpInvite",
                "basic",
                "Choose notrump after responder denied a heart fit and opener has no spade fit.",
                staymanExtra
              );
            }
          }
          if (openerRebid?.strain === "S" && bidEquals(responderRebid, 2, "NT")) {
            const staymanExtra = {
              ...extra,
              convention: "stayman",
              responderDeniedSuit: "S",
              maximum: shape.hcp >= 16
            };
            if (chosenBid.strain === openerRebid.strain && shape.counts[openerRebid.strain] >= 5) {
              return fiveCardHighBidChoiceResult(
                chosenBid,
                "continuation.openerAfterStaymanInviteFiveCardMajor",
                "basic",
                "Show a five-card major after opening 1NT and accepting responder's Stayman invite.",
                {
                  ...staymanExtra,
                  fiveCardMajor: openerRebid.strain,
                  length: shape.counts[openerRebid.strain] || 0,
                  support: shape.counts[openerRebid.strain] || 0
                }
              );
            }
            if (chosenBid.strain === "NT") {
              return fiveCardHighBidChoiceResult(
                chosenBid,
                chosenBid.level === 3 ? "continuation.openerAfterStaymanNoFitNotrumpGame" : "continuation.openerAfterStaymanNoFitNotrumpInvite",
                "basic",
                "Choose notrump after responder invited and did not fit opener's shown major.",
                staymanExtra
              );
            }
          }
        }
        if (fourthSuit && bidEquals(responderRebid, cheapestLevelForStrain(fourthSuit, openerRebid), fourthSuit)) {
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
          if (chosenBid.strain === openingBid.strain) {
            return fiveCardHighBidChoiceResult(chosenBid, "continuation.openerAfterFourthSuitRebidOwnSuit", "basic", "Answer fourth-suit forcing by rebidding opener's first suit with extra length.", {
              ...extra,
              convention: "fourthSuitForcing",
              forcing: true,
              gameForcing: true
            });
          }
          if (chosenBid.strain === openerRebid.strain) {
            return fiveCardHighBidChoiceResult(chosenBid, "continuation.openerAfterFourthSuitRebidSecondSuit", "basic", "Answer fourth-suit forcing by rebidding opener's second suit.", {
              ...extra,
              convention: "fourthSuitForcing",
              forcing: true,
              gameForcing: true
            });
          }
        }
        return describeNaturalContinuationChoice(chosenBid, shape, hand, partnershipCalls[partnershipCalls.length - 1]?.bid, base);
      }

  function describeResponderAfterFourthSuitChoice(chosenBid, shape, partnershipCalls, base) {
        const openingBid = partnershipCalls[0]?.bid;
        const responseBid = partnershipCalls[1]?.bid;
        const openerRebid = partnershipCalls[2]?.bid;
        const responderRebid = partnershipCalls[3]?.bid;
        const openerThirdBid = partnershipCalls[4]?.bid;
        const blackwoodTrump = agreedTrumpAfterAcceptedNotrumpTransfer(openingBid, responseBid, openerRebid);
        if (blackwoodTrump && isBlackwoodAsk(responderRebid) && openerThirdBid) {
          const partnerAceCount = blackwoodShownAceCount(openerThirdBid, partnershipCalls[4]?.bidResult);
          const askerAceCount = base.aceCount;
          const missingAces = Number.isInteger(partnerAceCount) ? 4 - askerAceCount - partnerAceCount : null;
          const ruleName = chosenBid.level === 7
            ? "continuation.blackwoodGrandSlam"
            : chosenBid.level === 6
              ? "continuation.blackwoodSmallSlam"
              : "continuation.blackwoodSignoff";
          return fiveCardHighBidChoiceResult(chosenBid, ruleName, "basic", "Choose the final contract after partner answers the four-notrump ace ask.", {
            ...base,
            category: "continuation",
            convention: "blackwood",
            trumpSuit: blackwoodTrump,
            suit: chosenBid.strain,
            aceCount: askerAceCount,
            partnerAceCount,
            missingAces,
            partnershipMinimumHcp: shape.hcp + notrumpOpeningMinimumHcp(openingBid)
          });
        }
        if (isStrongTwoClubsTwoNotrumpRebid(openingBid, responseBid, openerRebid) && openerThirdBid) {
          return describeResponderRebidChoice(chosenBid, shape, bid(2, "NT"), responderRebid, openerThirdBid, {
            ...base,
            strongTwoClubsAuction: true
          });
        }
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

  function describeNaturalContinuationChoice(chosenBid, shape, hand, partnerBid, base) {
        const support = partnerBid?.strain && partnerBid.strain !== "NT" ? shape.counts[partnerBid.strain] : 0;
        const extra = {
          ...base,
          category: "continuation",
          suit: chosenBid.strain,
          length: shape.counts[chosenBid.strain] || 0,
          partnerSuit: partnerBid?.strain || null,
          support
        };
        if (partnerBid?.strain !== "NT" && chosenBid.strain === partnerBid?.strain) {
          return fiveCardHighBidChoiceResult(chosenBid, "continuation.raisePartner", "basic", "Support partner's suit in the ongoing auction.", {
            ...extra,
            ...optionalFitValuationContext(hand, shape, partnerBid.strain, minimumOpeningLength(partnerBid.strain))
          });
        }
        if (chosenBid.strain === "NT") {
          return fiveCardHighBidChoiceResult(chosenBid, "continuation.notrumpRebid", "basic", "Continue in notrump with balanced strength.", extra);
        }
        return fiveCardHighBidChoiceResult(chosenBid, "continuation.newSuit", "basic", "Continue naturally in the best available suit.", extra);
      }


  return {
    chooseFiveCardHighOpenerRebid,
    chooseFiveCardHighResponderRebid,
    chooseFiveCardHighOpenerThirdBid,
    chooseFiveCardHighResponderAfterFourthSuit,
    rebidAfterOneNotrumpResponseFiveCardHigh,
    rebidAfterTwoNotrumpResponseFiveCardHigh,
    rebidAfterStrongTwoClubsFiveCardHigh,
    rebidAfterStrongTwoClubsPositiveResponseFiveCardHigh,
    isStrongTwoClubsPositiveResponse,
    isStrongTwoClubsTwoNotrumpRebid,
    respondAfterStrongTwoClubsTwoNotrumpRebidFiveCardHigh,
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
    openerAfterMinorOneLevelNewSuitRuleName,
    openerAfterOneDiamondTwoClubsRuleName,
    openerAfterMinorNotrumpResponseRuleName,
    chooseLowerSecondSuitFiveCardHigh,
    openerAfterNotrumpResponseRuleName,
    openerRebidAfterNewSuitFiveCardHigh,
    openerRebidAfterMinorOneLevelNewSuitFiveCardHigh,
    openerRebidAfterOneDiamondTwoClubsFiveCardHigh,
    rebidResponderAfterOneSuitOpeningFiveCardHigh,
    rebidResponderAfterOpenerNotrumpRebidFiveCardHigh,
    rebidResponderAfterOpenerRepeatsSuitFiveCardHigh,
    rebidResponderAfterOpenerRaisesResponderFiveCardHigh,
    rebidResponderAfterOpenerNewSuitFiveCardHigh,
    rebidResponderAfterMinorOpeningOneNotrumpFiveCardHigh,
    isSingleRaiseInviteFiveCardHigh,
    rebidResponderAfterSingleRaiseInviteFiveCardHigh,
    rebidResponderAfterOneNotrumpFiveCardHigh,
    rebidResponderAfterTwoNotrumpFiveCardHigh,
    rebidOpenerAfterFourthSuitFiveCardHigh,
    describeOpenerRebidChoice,
    describeResponderRebidChoice,
    describeOpenerThirdBidChoice,
    describeResponderAfterFourthSuitChoice,
    describeNaturalContinuationChoice
  };
});

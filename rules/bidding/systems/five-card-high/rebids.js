(function initBridgeRulesBiddingFiveCardHighRebids(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const deps = isCommonJs
    ? {
        core: require("../../../core.js"),
        auction: require("../../../auction.js"),
        context: require("../../common/context.js"),
        valuation: require("../../common/valuation.js"),
        result: require("../../common/result.js"),
        conventions: require("./conventions.js"),
        notrumpSystems: require("./rebids/notrump-systems/index.js"),
        blackwood: require("./rebids/blackwood/index.js"),
        strongTwoClubs: require("./rebids/strong-two-clubs/index.js"),
        fourthSuitForcing: require("./rebids/fourth-suit-forcing/index.js"),
        naturalOpener: require("./rebids/natural-opener/index.js")
      }
    : root.BridgeRulesParts || {};
  const api = factory(
    deps.core,
    deps.auction,
    deps.context || deps.biddingFiveCardHighContext,
    deps.valuation || deps.biddingFiveCardHighValuation,
    deps.result || deps.biddingCommonResult,
    deps.conventions || deps.biddingFiveCardHighConventions,
    deps.notrumpSystems || deps.biddingFiveCardHighNotrumpSystemRebids,
    deps.blackwood || deps.biddingFiveCardHighBlackwoodRebids,
    deps.strongTwoClubs || deps.biddingFiveCardHighStrongTwoClubsRebids,
    deps.fourthSuitForcing || deps.biddingFiveCardHighFourthSuitForcingRebids,
    deps.naturalOpener || deps.biddingFiveCardHighNaturalOpenerRebids
  );
  if (isCommonJs) module.exports = api;
  root.BridgeRulesParts = root.BridgeRulesParts || {};
  root.BridgeRulesParts.biddingFiveCardHighRebids = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesBiddingFiveCardHighRebids(core, auction, contextHelpers, valuationHelpers, resultHelpers, conventionHelpers, notrumpSystemRules, blackwoodRules, strongTwoClubsRules, fourthSuitForcingRules, naturalOpenerRules) {
  "use strict";

  const { suits, bidStrains, biddingSystems, handShape } = core;
  const {
    Pass,
    bid,
    bidEquals,
    gameLevel,
    cheapestLevelForStrain
  } = auction;
  const { fitStrength, fitValuationContext, optionalFitValuationContext } = valuationHelpers;
  const { bidChoiceResult } = resultHelpers;
  const {
    canBidAtOrBelow,
    chooseFiveCardHighNaturalContinuation,
    chooseOpenerSecondSuit,
    chooseSuitByLengthThenRank,
    isOneSuitOpeningFiveCardHigh,
    isOneMinorOpeningFiveCardHigh,
    minimumOpeningLength,
    minimumPreferenceLengthFiveCardHigh,
    supportLengthForOpening
  } = conventionHelpers;
  const {
    chooseNotrumpSystemsOpenerRebidTarget,
    chooseNotrumpSystemsResponderRebidTarget,
    chooseNotrumpSystemsOpenerThirdBidTarget,
    rebidAfterOneNotrumpResponseFiveCardHigh: rebidAfterOneNotrumpResponseFromSystem,
    rebidAfterTwoNotrumpResponseFiveCardHigh: rebidAfterTwoNotrumpResponseFromSystem,
    rebidResponderAfterOneNotrumpFiveCardHigh: rebidResponderAfterOneNotrumpFromSystem,
    rebidResponderAfterTwoNotrumpFiveCardHigh: rebidResponderAfterTwoNotrumpFromSystem,
    describeNotrumpSystemsOpenerRebidChoice,
    describeNotrumpSystemsResponderRebidChoice,
    describeNotrumpSystemsOpenerThirdBidChoice,
    notrumpOpeningMinimumHcp: notrumpOpeningMinimumHcpFromSystem
  } = notrumpSystemRules;
  const blackwoodRebidFamily = blackwoodRules.blackwoodRebidFamily || {
    chooseResponderRebidTarget: blackwoodRules.chooseBlackwoodResponderRebidTarget,
    chooseOpenerThirdBidTarget: blackwoodRules.chooseBlackwoodOpenerThirdBidTarget,
    chooseResponderAfterOpenerThirdBidTarget: blackwoodRules.chooseBlackwoodResponderAfterOpenerThirdBidTarget,
    describeResponderRebidChoice: blackwoodRules.describeBlackwoodResponderRebidChoice,
    describeOpenerThirdBidChoice: blackwoodRules.describeBlackwoodOpenerThirdBidChoice,
    describeResponderAfterOpenerThirdBidChoice: blackwoodRules.describeBlackwoodResponderAfterOpenerThirdBidChoice
  };
  const {
    chooseResponderRebidTarget: chooseBlackwoodResponderRebidTarget,
    chooseOpenerThirdBidTarget: chooseBlackwoodOpenerThirdBidTarget,
    chooseResponderAfterOpenerThirdBidTarget: chooseBlackwoodResponderAfterOpenerThirdBidTarget,
    describeResponderRebidChoice: describeBlackwoodResponderRebidChoice,
    describeOpenerThirdBidChoice: describeBlackwoodOpenerThirdBidChoice,
    describeResponderAfterOpenerThirdBidChoice: describeBlackwoodResponderAfterOpenerThirdBidChoice
  } = blackwoodRebidFamily;
  const strongTwoClubsRebidFamily = strongTwoClubsRules.strongTwoClubsRebidFamily || {
    chooseOpenerRebidTarget: strongTwoClubsRules.chooseStrongTwoClubsOpenerRebidTarget,
    chooseResponderRebidTarget: strongTwoClubsRules.chooseStrongTwoClubsResponderRebidTarget,
    chooseOpenerThirdBidTarget: strongTwoClubsRules.chooseStrongTwoClubsOpenerThirdBidTarget,
    chooseResponderAfterOpenerThirdBidTarget: strongTwoClubsRules.chooseStrongTwoClubsResponderAfterOpenerThirdBidTarget,
    describeOpenerRebidChoice: strongTwoClubsRules.describeStrongTwoClubsOpenerRebidChoice,
    describeResponderRebidChoice: strongTwoClubsRules.describeStrongTwoClubsResponderRebidChoice,
    describeOpenerThirdBidChoice: strongTwoClubsRules.describeStrongTwoClubsOpenerThirdBidChoice
  };
  const {
    chooseOpenerRebidTarget: chooseStrongTwoClubsOpenerRebidTarget,
    chooseResponderRebidTarget: chooseStrongTwoClubsResponderRebidTarget,
    chooseOpenerThirdBidTarget: chooseStrongTwoClubsOpenerThirdBidTarget,
    chooseResponderAfterOpenerThirdBidTarget: chooseStrongTwoClubsResponderAfterOpenerThirdBidTarget,
    describeOpenerRebidChoice: describeStrongTwoClubsOpenerRebidChoice,
    describeResponderRebidChoice: describeStrongTwoClubsResponderRebidChoice,
    describeOpenerThirdBidChoice: describeStrongTwoClubsOpenerThirdBidChoice
  } = strongTwoClubsRebidFamily;
  const fourthSuitForcingRebidFamily = fourthSuitForcingRules.fourthSuitForcingRebidFamily || {
    chooseResponderRebidTarget: fourthSuitForcingRules.chooseFourthSuitForcingResponderRebidTarget,
    chooseOpenerThirdBidTarget: fourthSuitForcingRules.chooseFourthSuitForcingOpenerThirdBidTarget,
    chooseResponderAfterOpenerThirdBidTarget: fourthSuitForcingRules.chooseFourthSuitForcingResponderAfterOpenerThirdBidTarget,
    describeResponderRebidChoice: fourthSuitForcingRules.describeFourthSuitForcingResponderRebidChoice,
    describeOpenerThirdBidChoice: fourthSuitForcingRules.describeFourthSuitForcingOpenerThirdBidChoice,
    describeResponderAfterOpenerThirdBidChoice: fourthSuitForcingRules.describeFourthSuitForcingResponderAfterOpenerThirdBidChoice
  };
  const {
    chooseResponderRebidTarget: chooseFourthSuitForcingResponderRebidTarget,
    chooseOpenerThirdBidTarget: chooseFourthSuitForcingOpenerThirdBidTarget,
    chooseResponderAfterOpenerThirdBidTarget: chooseFourthSuitForcingResponderAfterOpenerThirdBidTarget,
    describeResponderRebidChoice: describeFourthSuitForcingResponderRebidChoice,
    describeOpenerThirdBidChoice: describeFourthSuitForcingOpenerThirdBidChoice,
    describeResponderAfterOpenerThirdBidChoice: describeFourthSuitForcingResponderAfterOpenerThirdBidChoice
  } = fourthSuitForcingRebidFamily;
  const naturalOpenerRebidFamily = naturalOpenerRules.naturalOpenerRebidFamily || {
    chooseOpenerRebidTarget: naturalOpenerRules.chooseNaturalOpenerRebidTarget,
    describeOpenerRebidChoice: naturalOpenerRules.describeNaturalOpenerRebidChoice
  };
  const {
    chooseOpenerRebidTarget: chooseNaturalOpenerRebidTarget,
    describeOpenerRebidChoice: describeNaturalOpenerRebidChoice
  } = naturalOpenerRebidFamily;

  function fiveCardHighBidChoiceResult(bid, ruleName, confidence, reason, extra = {}) {
    return bidChoiceResult(biddingSystems.fiveCardHigh, bid, ruleName, confidence, reason, extra);
  }

  function chooseFiveCardHighOpenerRebid(hand, openingBid, responseBid) {
        const shape = handShape(hand);
        const notrumpSystemTarget = chooseNotrumpSystemsOpenerRebidTarget({ shape, openingBid, responseBid });
        if (notrumpSystemTarget) return notrumpSystemTarget;
        const strongTwoClubsTarget = chooseStrongTwoClubsOpenerRebidTarget({ shape, hand, openingBid, responseBid });
        if (strongTwoClubsTarget) return strongTwoClubsTarget;
        const naturalOpenerTarget = chooseNaturalOpenerRebidTarget({ shape, hand, openingBid, responseBid });
        if (naturalOpenerTarget) return naturalOpenerTarget;
        return Pass();
      }

  function rebidAfterOneNotrumpResponseFiveCardHigh(shape, responseBid) {
        return rebidAfterOneNotrumpResponseFromSystem(shape, responseBid);
      }

  function rebidAfterTwoNotrumpResponseFiveCardHigh(shape, responseBid) {
        return rebidAfterTwoNotrumpResponseFromSystem(shape, responseBid);
      }

  function rebidAfterOneSuitOpeningFiveCardHigh(shape, hand, openingBid, responseBid) {
        return naturalOpenerRules.rebidAfterOneSuitOpeningFiveCardHigh(shape, hand, openingBid, responseBid);
      }

  function openerRebidAfterMinorNotrumpFiveCardHigh(shape, openingBid, responseBid) {
        return naturalOpenerRules.openerRebidAfterMinorNotrumpFiveCardHigh(shape, openingBid, responseBid);
      }

  function openerRebidAfterRaiseFiveCardHigh(shape, hand, openingBid, responseBid) {
        return naturalOpenerRules.openerRebidAfterRaiseFiveCardHigh(shape, hand, openingBid, responseBid);
      }

  function openerRebidAfterMinorRaiseFiveCardHigh(shape, hand, openingBid, responseBid) {
        return naturalOpenerRules.openerRebidAfterMinorRaiseFiveCardHigh(shape, hand, openingBid, responseBid);
      }

  function isMajorSingleRaiseFiveCardHigh(openingBid, responseBid) {
        return naturalOpenerRules.isMajorSingleRaiseFiveCardHigh(openingBid, responseBid);
      }

  function isMinorRaiseFiveCardHigh(openingBid, responseBid) {
        return naturalOpenerRules.isMinorRaiseFiveCardHigh(openingBid, responseBid);
      }

  function openerRebidAfterNotrumpFiveCardHigh(shape, openingBid, responseBid) {
        return naturalOpenerRules.openerRebidAfterNotrumpFiveCardHigh(shape, openingBid, responseBid);
      }

  function openerRebidAfterNotrumpFallbackFiveCardHigh(shape, openingBid) {
        return naturalOpenerRules.openerRebidAfterNotrumpFallbackFiveCardHigh(shape, openingBid);
      }

  function majorOpeningNotrumpResponseContext(shape, openingBid, responseBid) {
        return naturalOpenerRules.majorOpeningNotrumpResponseContext(shape, openingBid, responseBid);
      }

  function isMajorOpeningNotrumpResponseFiveCardHigh(openingBid, responseBid) {
        return naturalOpenerRules.isMajorOpeningNotrumpResponseFiveCardHigh(openingBid, responseBid);
      }

  function minorOpeningNotrumpResponseContext(shape, openingBid, responseBid) {
        return naturalOpenerRules.minorOpeningNotrumpResponseContext(shape, openingBid, responseBid);
      }

  function isMinorOpeningNotrumpResponseFiveCardHigh(openingBid, responseBid) {
        return naturalOpenerRules.isMinorOpeningNotrumpResponseFiveCardHigh(openingBid, responseBid);
      }

  function isMinorOpeningOneLevelNewSuitFiveCardHigh(openingBid, responseBid) {
        return naturalOpenerRules.isMinorOpeningOneLevelNewSuitFiveCardHigh(openingBid, responseBid);
      }

  function isOneDiamondTwoClubsResponseFiveCardHigh(openingBid, responseBid) {
        return naturalOpenerRules.isOneDiamondTwoClubsResponseFiveCardHigh(openingBid, responseBid);
      }

  function isReverseRebidFiveCardHigh(openingBid, rebid) {
        return naturalOpenerRules.isReverseRebidFiveCardHigh(openingBid, rebid);
      }

  function hasMinorReverseStrengthFiveCardHigh(shape, openingBid) {
        return naturalOpenerRules.hasMinorReverseStrengthFiveCardHigh(shape, openingBid);
      }

  function openerAfterMinorOneLevelNewSuitRuleName(chosenBid, openingBid, responseBid, shape = null) {
        return naturalOpenerRules.openerAfterMinorOneLevelNewSuitRuleName(chosenBid, openingBid, responseBid, shape);
      }

  function openerAfterOneDiamondTwoClubsRuleName(chosenBid) {
        return naturalOpenerRules.openerAfterOneDiamondTwoClubsRuleName(chosenBid);
      }

  function openerAfterMinorNotrumpResponseRuleName(chosenBid, openingBid, responseBid) {
        return naturalOpenerRules.openerAfterMinorNotrumpResponseRuleName(chosenBid, openingBid, responseBid);
      }

  function chooseLowerSecondSuitFiveCardHigh(shape, openingStrain) {
        return naturalOpenerRules.chooseLowerSecondSuitFiveCardHigh(shape, openingStrain);
      }

  function openerAfterNotrumpResponseRuleName(chosenBid, openingBid, responseBid, context) {
        return naturalOpenerRules.openerAfterNotrumpResponseRuleName(chosenBid, openingBid, responseBid, context);
      }

  function openerRebidAfterNewSuitFiveCardHigh(shape, openingBid, responseBid) {
        return naturalOpenerRules.openerRebidAfterNewSuitFiveCardHigh(shape, openingBid, responseBid);
      }

  function openerRebidAfterMinorOneLevelNewSuitFiveCardHigh(shape, openingBid, responseBid) {
        return naturalOpenerRules.openerRebidAfterMinorOneLevelNewSuitFiveCardHigh(shape, openingBid, responseBid);
      }

  function openerRebidAfterOneDiamondTwoClubsFiveCardHigh(shape) {
        return naturalOpenerRules.openerRebidAfterOneDiamondTwoClubsFiveCardHigh(shape);
      }

  function notrumpOpeningMinimumHcp(openingBid) {
        return notrumpOpeningMinimumHcpFromSystem(openingBid);
      }

  function chooseFiveCardHighResponderRebid(hand, openingBid, responseBid, openerRebid) {
        const shape = handShape(hand);
        const notrumpSystemTarget = chooseNotrumpSystemsResponderRebidTarget({ shape, openingBid, responseBid, openerRebid });
        if (notrumpSystemTarget) return notrumpSystemTarget;
        const strongTwoClubsTarget = chooseStrongTwoClubsResponderRebidTarget({ shape, openingBid, responseBid, openerRebid });
        if (strongTwoClubsTarget) return strongTwoClubsTarget;
        const blackwoodTarget = chooseBlackwoodResponderRebidTarget({ shape, hand, openingBid, responseBid, openerRebid });
        if (blackwoodTarget) return blackwoodTarget;
        if (isSingleRaiseInviteFiveCardHigh(responseBid, openerRebid)) return rebidResponderAfterSingleRaiseInviteFiveCardHigh(shape, openerRebid);
        if (isOneMinorOpeningFiveCardHigh(openingBid) && bidEquals(openerRebid, 1, "NT")) {
          const strongSecondMajor = rebidResponderAfterMinorOpeningOneNotrumpFiveCardHigh(shape, responseBid);
          if (strongSecondMajor) return strongSecondMajor;
        }
        const fourthSuitForcingTarget = chooseFourthSuitForcingResponderRebidTarget({ shape, openingBid, responseBid, openerRebid });
        if (fourthSuitForcingTarget) return fourthSuitForcingTarget;
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
        if (isNaturalStrongTwoNotrumpRebidFiveCardHigh(openingBid, responseBid, openerRebid) && shape.balanced && shape.hcp >= 8) {
          return bid(3, "NT");
        }
        if (shape.hcp >= 12) {
          if ((responseBid.strain === "H" || responseBid.strain === "S") && shape.counts[responseBid.strain] >= 5) return bid(gameLevel(responseBid.strain), responseBid.strain);
          return bid(3, "NT");
        }
        if (shape.hcp >= 10) return bid(2, "NT");
        if (shape.counts[responseBid.strain] >= 6) return bid(2, responseBid.strain);
        return Pass();
      }

  function isNaturalStrongTwoNotrumpRebidFiveCardHigh(openingBid, responseBid, openerRebid) {
        return (
          isOneSuitOpeningFiveCardHigh(openingBid) &&
          responseBid?.level === 1 &&
          openerRebid?.level === 2 &&
          openerRebid.strain === "NT"
        );
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
        if (shape.hcp >= 12) {
          if ((responseBid.strain === "H" || responseBid.strain === "S") && shape.counts[responseBid.strain] >= 6) return bid(gameLevel(responseBid.strain), responseBid.strain);
          if ((openerRebid.strain === "H" || openerRebid.strain === "S") && shape.counts[openerRebid.strain] >= 4) return bid(gameLevel(openerRebid.strain), openerRebid.strain);
          if (shape.balanced) return bid(3, "NT");
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

  function isSingleMajorRaiseGameFiveCardHigh(openingBid, responseBid, openerRebid) {
        return blackwoodRules.isSingleMajorRaiseGameFiveCardHigh(openingBid, responseBid, openerRebid);
      }

  function rebidResponderAfterSingleMajorRaiseGameFiveCardHigh(shape, hand, openingBid, responseBid, openerRebid) {
        return blackwoodRules.rebidResponderAfterSingleMajorRaiseGameFiveCardHigh(shape, hand, openingBid, responseBid, openerRebid);
      }

  function shouldResponderAskBlackwoodAfterSingleMajorRaiseGame(shape, hand, openingBid, responseBid, openerRebid) {
        return blackwoodRules.shouldResponderAskBlackwoodAfterSingleMajorRaiseGame(shape, hand, openingBid, responseBid, openerRebid);
      }

  function rebidResponderAfterOneNotrumpFiveCardHigh(shape, responseBid, openerRebid, openingBid = bid(1, "NT")) {
        return rebidResponderAfterOneNotrumpFromSystem(shape, responseBid, openerRebid, openingBid);
      }

  function rebidResponderAfterTwoNotrumpFiveCardHigh(shape, responseBid, openerRebid, openingBid = bid(2, "NT")) {
        return rebidResponderAfterTwoNotrumpFromSystem(shape, responseBid, openerRebid, openingBid);
      }

  function chooseFiveCardHighOpenerThirdBid(hand, partnershipCalls) {
        const shape = handShape(hand);
        const openingBid = partnershipCalls[0].bid;
        const responseBid = partnershipCalls[1].bid;
        const openerRebid = partnershipCalls[2]?.bid;
        const responderRebid = partnershipCalls[3]?.bid;
        const openerThirdBid = partnershipCalls[4]?.bid;
        if (!responderRebid) return Pass();

        const blackwoodTarget = chooseBlackwoodOpenerThirdBidTarget({ hand, openingBid, responseBid, openerRebid, responderRebid, openerThirdBid });
        if (blackwoodTarget) return blackwoodTarget;

        const fourthSuitForcingTarget = chooseFourthSuitForcingOpenerThirdBidTarget({ shape, hand, openingBid, responseBid, openerRebid, responderRebid });
        if (fourthSuitForcingTarget) return fourthSuitForcingTarget;

        const strongTwoClubsTarget = chooseStrongTwoClubsOpenerThirdBidTarget({ shape, openingBid, responseBid, openerRebid, responderRebid });
        if (strongTwoClubsTarget) return strongTwoClubsTarget;

        return chooseNotrumpSystemsOpenerThirdBidTarget({ shape, openingBid, responseBid, openerRebid, responderRebid }) || Pass();
      }

  function rebidOpenerAfterFourthSuitFiveCardHigh(shape, hand, openingBid, responseBid, openerRebid, responderRebid) {
        return fourthSuitForcingRules.rebidOpenerAfterFourthSuitFiveCardHigh(shape, hand, openingBid, responseBid, openerRebid, responderRebid);
      }

  function chooseFiveCardHighResponderAfterFourthSuit(hand, partnershipCalls) {
        const shape = handShape(hand);
        const openingBid = partnershipCalls[0]?.bid;
        const responseBid = partnershipCalls[1]?.bid;
        const openerRebid = partnershipCalls[2]?.bid;
        const responderRebid = partnershipCalls[3]?.bid;
        const openerThirdBid = partnershipCalls[4]?.bid;
        const blackwoodTarget = chooseBlackwoodResponderAfterOpenerThirdBidTarget({
          shape,
          hand,
          openingBid,
          responseBid,
          openerRebid,
          responderRebid,
          openerThirdBid,
          openerThirdBidResult: partnershipCalls[4]?.bidResult
        });
        if (blackwoodTarget) return blackwoodTarget;
        const strongTwoClubsTarget = chooseStrongTwoClubsResponderAfterOpenerThirdBidTarget({ shape, openingBid, responseBid, openerRebid, responderRebid, openerThirdBid });
        if (strongTwoClubsTarget) return strongTwoClubsTarget;
        return chooseFourthSuitForcingResponderAfterOpenerThirdBidTarget({ shape, openingBid, responseBid, openerRebid, responderRebid, openerThirdBid }) || Pass();
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
        const strongTwoClubsResult = describeStrongTwoClubsOpenerRebidChoice(chosenBid, shape, hand, openingBid, responseBid, base);
        if (strongTwoClubsResult) return strongTwoClubsResult;
        const notrumpSystemResult = describeNotrumpSystemsOpenerRebidChoice(chosenBid, shape, openingBid, responseBid, base);
        if (notrumpSystemResult) return notrumpSystemResult;
        const naturalOpenerResult = describeNaturalOpenerRebidChoice(chosenBid, shape, hand, openingBid, responseBid, base);
        if (naturalOpenerResult) return naturalOpenerResult;

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
        const strongTwoClubsResult = describeStrongTwoClubsResponderRebidChoice(chosenBid, shape, openingBid, responseBid, openerRebid, base);
        if (strongTwoClubsResult) return strongTwoClubsResult;
        const blackwoodResult = describeBlackwoodResponderRebidChoice(chosenBid, shape, openingBid, responseBid, openerRebid, base);
        if (blackwoodResult) return blackwoodResult;
        const notrumpSystemResult = describeNotrumpSystemsResponderRebidChoice(chosenBid, shape, openingBid, responseBid, openerRebid, base);
        if (notrumpSystemResult) return notrumpSystemResult;
        const fourthSuitForcingResult = describeFourthSuitForcingResponderRebidChoice(chosenBid, shape, openingBid, responseBid, openerRebid, base);
        if (fourthSuitForcingResult) return fourthSuitForcingResult;
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
        if (isNaturalStrongTwoNotrumpRebidFiveCardHigh(openingBid, responseBid, openerRebid) && bidEquals(chosenBid, 3, "NT")) {
          return fiveCardHighBidChoiceResult(chosenBid, "continuation.responderAfterTwoNotrumpRebidGame", "basic", "Bid 3NT because opener's natural 2NT rebid shows a strong balanced hand.", {
            ...extra,
            openerRange: "18-19",
            range: "8+"
          });
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
        const extra = {
          ...base,
          category: "continuation",
          suit: chosenBid.strain,
          length: shape.counts[chosenBid.strain] || 0,
          openingSuit: openingBid?.strain || null,
          responseSuit: responseBid?.strain || null,
          openerRebidSuit: openerRebid?.strain || null,
          fourthSuit: null
        };
        const blackwoodResult = describeBlackwoodOpenerThirdBidChoice(chosenBid, shape, openingBid, responseBid, openerRebid, responderRebid, base);
        if (blackwoodResult) return blackwoodResult;
        const strongTwoClubsResult = describeStrongTwoClubsOpenerThirdBidChoice(chosenBid, shape, openingBid, responseBid, openerRebid, responderRebid, base);
        if (strongTwoClubsResult) return strongTwoClubsResult;
        const notrumpSystemResult = describeNotrumpSystemsOpenerThirdBidChoice(chosenBid, shape, openingBid, responseBid, openerRebid, responderRebid, base);
        if (notrumpSystemResult) return notrumpSystemResult;
        const fourthSuitForcingResult = describeFourthSuitForcingOpenerThirdBidChoice(chosenBid, shape, hand, openingBid, responseBid, openerRebid, responderRebid, base);
        if (fourthSuitForcingResult) return fourthSuitForcingResult;
        return describeNaturalContinuationChoice(chosenBid, shape, hand, partnershipCalls[partnershipCalls.length - 1]?.bid, base);
      }

  function describeResponderAfterFourthSuitChoice(chosenBid, shape, partnershipCalls, base) {
        const openingBid = partnershipCalls[0]?.bid;
        const responseBid = partnershipCalls[1]?.bid;
        const openerRebid = partnershipCalls[2]?.bid;
        const responderRebid = partnershipCalls[3]?.bid;
        const openerThirdBid = partnershipCalls[4]?.bid;
        const blackwoodResult = describeBlackwoodResponderAfterOpenerThirdBidChoice(chosenBid, shape, partnershipCalls, base);
        if (blackwoodResult) return blackwoodResult;
        if (chooseStrongTwoClubsResponderAfterOpenerThirdBidTarget({ shape, openingBid, responseBid, openerRebid, responderRebid, openerThirdBid })) {
          return describeResponderRebidChoice(chosenBid, shape, bid(2, "NT"), responderRebid, openerThirdBid, {
            ...base,
            strongTwoClubsAuction: true
          });
        }
        return describeFourthSuitForcingResponderAfterOpenerThirdBidChoice(chosenBid, shape, openingBid, responseBid, openerRebid, responderRebid, openerThirdBid, base);
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
    isSingleMajorRaiseGameFiveCardHigh,
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

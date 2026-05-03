(function initBridgeRulesBiddingFiveCardHighResponses(root, factory) {
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
  root.BridgeRulesParts.biddingFiveCardHighResponses = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesBiddingFiveCardHighResponses(core, auction, valuationHelpers, resultHelpers, conventionHelpers) {
  "use strict";

  const { suits, biddingSystems, handShape } = core;
  const { Pass, bid, bidEquals, gameLevel, cheapestLevelForStrain } = auction;
  const { fitStrength, fitValuationContext, optionalFitValuationContext, suitQuality, topHonorQuality, hcpInSuit, hasStopper, weakTwoResponsePlayingTricks } = valuationHelpers;
  const { bidChoiceResult } = resultHelpers;
  const {
    notrumpTransferSuit,
    chooseMajorByLength,
    chooseDirectNotrumpSlamResponse,
    chooseResponseSuit,
    chooseSuitByLengthThenRank,
    hasFourCardMajor,
    isWeakTwoOpeningFiveCardHigh,
    minimumOpeningLength,
    supportLengthForOpening
  } = conventionHelpers;

  function fiveCardHighBidChoiceResult(bid, ruleName, confidence, reason, extra = {}) {
    return bidChoiceResult(biddingSystems.fiveCardHigh, bid, ruleName, confidence, reason, extra);
  }

  function chooseFiveCardHighResponse(hand, partnerBid) {
        const shape = handShape(hand);
        if (bidEquals(partnerBid, 1, "NT")) return respondToOneNotrumpFiveCardHigh(shape);
        if (bidEquals(partnerBid, 2, "NT")) return respondToTwoNotrumpFiveCardHigh(shape);
        if (bidEquals(partnerBid, 2, "C")) return respondToStrongTwoClubsFiveCardHigh(shape, hand);
        if (isWeakTwoOpeningFiveCardHigh(partnerBid)) return respondToWeakTwoFiveCardHigh(shape, hand, partnerBid);
        if (partnerBid.level >= 3 && partnerBid.strain !== "NT") return respondToPreemptFiveCardHigh(shape, hand, partnerBid);
        if (bidEquals(partnerBid, 1, "C")) return respondToOneClubFiveCardHigh(shape, hand);
        if (bidEquals(partnerBid, 1, "D")) return respondToOneDiamondFiveCardHigh(shape, hand);
        if (bidEquals(partnerBid, 1, "H")) return respondToOneMajorFiveCardHigh(shape, hand, "H");
        if (bidEquals(partnerBid, 1, "S")) return respondToOneMajorFiveCardHigh(shape, hand, "S");
        return Pass();
      }

  function respondToOneNotrumpFiveCardHigh(shape) {
        const transferMajor = chooseMajorByLength(shape, 5);
        if (transferMajor === "H") return bid(2, "D");
        if (transferMajor === "S") return bid(2, "H");
        if (hasFourCardMajor(shape) && shape.hcp >= 8) return bid(2, "C");
        const slam = chooseDirectNotrumpSlamResponse(shape, 15);
        if (slam) return slam;
        if (shape.hcp >= 10) return bid(3, "NT");
        if (shape.hcp >= 8) return bid(2, "NT");
        return Pass();
      }

  function respondToTwoNotrumpFiveCardHigh(shape) {
        const transferMajor = chooseMajorByLength(shape, 5);
        if (transferMajor === "H") return bid(3, "D");
        if (transferMajor === "S") return bid(3, "H");
        if (hasFourCardMajor(shape) && shape.hcp >= 4) return bid(3, "C");
        const slam = chooseDirectNotrumpSlamResponse(shape, 20);
        if (slam) return slam;
        if (shape.hcp >= 4) return bid(3, "NT");
        return Pass();
      }

  function respondToStrongTwoClubsFiveCardHigh(shape, hand) {
        if (shape.hcp <= 7) return bid(2, "D");
        const suit = chooseSuitByLengthThenRank(["S", "H", "D", "C"], shape, 5, true, (candidate) => topHonorQuality(hand, candidate) >= 2);
        if (suit === "H" || suit === "S") return bid(2, suit);
        if (suit === "C" || suit === "D") return bid(3, suit);
        return bid(2, "NT");
      }

  function respondToWeakTwoFiveCardHigh(shape, hand, partnerBid) {
        const context = weakTwoResponseContext(shape, hand, partnerBid);

        if (partnerBid.strain === "D" && context.usableFit) {
          if (context.ownPlayingTricks >= 3) return bid(3, "NT");
          if (context.ownPlayingTricks >= 2) return bid(2, "NT");
          return Pass();
        }

        if ((partnerBid.strain === "H" || partnerBid.strain === "S") && context.usableFit) {
          if (context.ownPlayingTricks >= 4) return bid(4, partnerBid.strain);
          if (context.ownPlayingTricks >= 3) return bid(3, partnerBid.strain);
          return Pass();
        }

        if (context.allSuitsStopped) {
          if (context.ownPlayingTricks >= 4 || (context.ownPlayingTricks >= 3 && shape.hcp >= 14)) return bid(3, "NT");
          if (context.ownPlayingTricks >= 3) return bid(2, "NT");
        }

        return Pass();
      }

  function weakTwoResponseContext(shape, hand, partnerBid) {
        const support = shape.counts[partnerBid.strain] || 0;
        const fit = support >= 2;
        const partnerSuitHonor = partnerBid.strain && partnerBid.strain !== "NT" ? hcpInSuit(hand, partnerBid.strain) > 0 : false;
        const usableFit = partnerBid.strain === "D" ? fit && partnerSuitHonor : fit;
        const missingStoppers = suits.filter((suit) => suit !== partnerBid.strain && !hasStopper(hand, suit));
        return {
          ownPlayingTricks: weakTwoResponsePlayingTricks(hand, partnerBid.strain, {
            hasFit: usableFit,
            countSideKings: usableFit
          }),
          support,
          fit,
          usableFit,
          partnerSuitHonor,
          partnerSuitTreatedAsStopped: true,
          allSuitsStopped: missingStoppers.length === 0,
          missingStoppers
        };
      }

  function respondToPreemptFiveCardHigh(shape, hand, partnerBid) {
        if (shape.counts[partnerBid.strain] >= 3 && fitStrength(hand, shape, partnerBid.strain, partnerBid.level >= 4 ? 8 : 7) >= 12) return bid(gameLevel(partnerBid.strain), partnerBid.strain);
        if (shape.balanced && shape.hcp >= 16) return bid(3, "NT");
        return Pass();
      }

  function respondToOneClubFiveCardHigh(shape, hand) {
        if (shape.hcp < 6) return Pass();
        const newSuit = chooseResponseSuit(["D", "H", "S"], shape, 4);
        if (newSuit) return bid(1, newSuit);
        if (shape.counts.C >= 5) {
          const strength = fitStrength(hand, shape, "C", minimumOpeningLength("C"));
          if (strength <= 9) return bid(2, "C");
          if (strength <= 11) return bid(3, "C");
          return shape.balanced ? bid(3, "NT") : bid(4, "C");
        }
        if (shape.hcp <= 9) return bid(1, "NT");
        if (shape.hcp <= 11) return bid(2, "NT");
        return bid(3, "NT");
      }

  function respondToOneDiamondFiveCardHigh(shape, hand) {
        if (shape.hcp < 6) return Pass();
        const major = chooseResponseSuit(["H", "S"], shape, 4);
        if (major) return bid(1, major);
        const clubs = shape.counts.C >= 5 && shape.hcp >= 10 ? "C" : null;
        if (clubs) return bid(2, "C");
        if (shape.counts.D >= 4) {
          const strength = fitStrength(hand, shape, "D", minimumOpeningLength("D"));
          if (strength <= 9) return bid(2, "D");
          if (strength <= 11) return bid(3, "D");
          return shape.balanced ? bid(3, "NT") : bid(4, "D");
        }
        if (shape.hcp <= 9) return bid(1, "NT");
        if (shape.hcp <= 11) return bid(2, "NT");
        return bid(3, "NT");
      }

  function respondToOneMajorFiveCardHigh(shape, hand, openingMajor) {
        if (shape.hcp < 6) return Pass();

        const support = shape.counts[openingMajor] >= 3;
        if (support) {
          const strength = fitStrength(hand, shape, openingMajor, minimumOpeningLength(openingMajor));
          if (strength >= 12) return bid(4, openingMajor);
          if (strength >= 10) return bid(3, openingMajor);
          return bid(2, openingMajor);
        }

        if (openingMajor === "H" && shape.counts.S >= 4) return bid(1, "S");

        const sideSuits = suits.filter((suit) => suit !== openingMajor);
        const twoLevelSuit = chooseSuitByLengthThenRank(sideSuits, shape, 4, false);
        if (twoLevelSuit && shape.hcp >= 10) return bid(cheapestLevelForStrain(twoLevelSuit, bid(1, openingMajor)), twoLevelSuit);

        if (shape.hcp <= 9) return bid(1, "NT");
        if (shape.hcp <= 11) return bid(2, "NT");
        return bid(3, "NT");
      }


  function describeResponseBidChoice(chosenBid, shape, hand, partnerBid, base) {
        const support = partnerBid?.strain && partnerBid.strain !== "NT" ? shape.counts[partnerBid.strain] : 0;
        const extra = {
          ...base,
          category: "response",
          suit: chosenBid.strain,
          length: shape.counts[chosenBid.strain] || 0,
          partnerSuit: partnerBid?.strain || null,
          support
        };
        const fitExtra = partnerBid?.strain && partnerBid.strain !== "NT" && support >= supportLengthForOpening(partnerBid.strain)
          ? optionalFitValuationContext(hand, shape, partnerBid.strain, minimumOpeningLength(partnerBid.strain))
          : {};

        if (bidEquals(partnerBid, 1, "NT") || bidEquals(partnerBid, 2, "NT")) {
          if (chosenBid.strain === "C" && chosenBid.level === partnerBid.level + 1) {
            return fiveCardHighBidChoiceResult(chosenBid, "response.stayman", "basic", "Use Stayman to ask opener for a four-card major.", extra);
          }
          const transferSuit = notrumpTransferSuit(partnerBid, chosenBid);
          if (transferSuit) {
            return fiveCardHighBidChoiceResult(chosenBid, `response.transferTo${transferSuit}`, "basic", "Use a transfer to show a five-card major.", {
              ...extra,
              transferSuit,
              length: shape.counts[transferSuit] || 0
            });
          }
          if (chosenBid.strain === "NT") {
            const invite = chosenBid.level === partnerBid.level + 1 && chosenBid.level < 3;
            const openerMinimumHcp = partnerBid.level === 2 ? 20 : 15;
            const openerMaximumHcp = partnerBid.level === 2 ? 22 : 17;
            const slamExtra = {
              ...extra,
              openingLevel: partnerBid.level,
              openerMinimumHcp,
              openerMaximumHcp,
              partnershipMinimumHcp: shape.hcp + openerMinimumHcp,
              slamTargetHcp: chosenBid.level === 7 ? 37 : chosenBid.level === 6 ? 33 : null
            };
            if (chosenBid.level === 7) {
              return fiveCardHighBidChoiceResult(chosenBid, "response.notrumpGrandSlam", "basic", "Bid a direct notrump grand slam when the partnership is guaranteed enough combined HCP and no major-suit convention is needed.", slamExtra);
            }
            if (chosenBid.level === 6) {
              return fiveCardHighBidChoiceResult(chosenBid, "response.notrumpSmallSlam", "basic", "Bid a direct notrump small slam when the partnership is guaranteed enough combined HCP and no major-suit convention is needed.", slamExtra);
            }
            return fiveCardHighBidChoiceResult(chosenBid, invite ? "response.notrumpInvite" : "response.notrumpGame", "basic", "Invite or bid game in notrump with balanced values.", slamExtra);
          }
        }

        if (bidEquals(partnerBid, 2, "C")) {
          if (bidEquals(chosenBid, 2, "D")) {
            return fiveCardHighBidChoiceResult(chosenBid, "response.strongTwoClubsWaiting", "basic", "Make the waiting response to partner's strong 2C opening.", extra);
          }
          return fiveCardHighBidChoiceResult(chosenBid, "response.strongTwoClubsPositive", "basic", "Show a positive response to partner's strong 2C opening with a five-card suit and at least two top honors.", {
            ...extra,
            topHonors: chosenBid.strain && chosenBid.strain !== "NT" ? topHonorQuality(hand, chosenBid.strain) : 0
          });
        }

        if (isWeakTwoOpeningFiveCardHigh(partnerBid)) {
          const weakTwoExtra = {
            ...extra,
            ...weakTwoResponseContext(shape, hand, partnerBid)
          };
          if (chosenBid.strain === partnerBid.strain) {
            return fiveCardHighBidChoiceResult(
              chosenBid,
              chosenBid.level === gameLevel(partnerBid.strain) ? "response.weakTwoMajorGameRaise" : "response.weakTwoMajorInviteRaise",
              "basic",
              "Raise partner's weak two major with fit and enough own playing tricks.",
              weakTwoExtra
            );
          }
          if (chosenBid.strain === "NT") {
            const ruleName = weakTwoExtra.usableFit && partnerBid.strain === "D"
              ? (chosenBid.level === 3 ? "response.weakTwoDiamondNotrumpGame" : "response.weakTwoDiamondNotrumpInvite")
              : (chosenBid.level === 3 ? "response.weakTwoNoFitNotrumpGame" : "response.weakTwoNoFitNotrumpInvite");
            return fiveCardHighBidChoiceResult(chosenBid, ruleName, "basic", "Choose notrump opposite partner's weak two with enough own playing tricks and the required communication or stoppers.", weakTwoExtra);
          }
        }

        if (partnerBid?.level >= 3 && partnerBid.strain !== "NT") {
          if (chosenBid.strain === partnerBid.strain) {
            return fiveCardHighBidChoiceResult(chosenBid, "response.raisePreempt", "basic", "Raise partner's long suit with support and enough strength.", {
              ...extra,
              ...fitValuationContext(hand, shape, partnerBid.strain, partnerBid.level === 2 ? 6 : partnerBid.level >= 4 ? 8 : 7)
            });
          }
          if (chosenBid.strain === "NT") {
            return fiveCardHighBidChoiceResult(chosenBid, "response.notrumpOverPreempt", "basic", "Choose notrump with extra balanced strength opposite partner's preempt.", extra);
          }
          return fiveCardHighBidChoiceResult(chosenBid, "response.newSuitOverPreempt", "basic", "Show a strong new suit opposite partner's preempt.", extra);
        }

        if (partnerBid?.strain !== "NT" && chosenBid.strain === partnerBid?.strain) {
          return fiveCardHighBidChoiceResult(chosenBid, "response.raise", "basic", "Raise partner's suit with enough support.", {
            ...extra,
            ...fitExtra
          });
        }
        if (chosenBid.strain === "NT") {
          return fiveCardHighBidChoiceResult(chosenBid, "response.notrump", "basic", "Answer in notrump with balanced values and no better fit or new suit.", extra);
        }
        return fiveCardHighBidChoiceResult(chosenBid, "response.newSuit", "basic", "Bid the cheapest suitable new suit with responding values.", extra);
      }



  return {
    chooseFiveCardHighResponse,
    respondToOneNotrumpFiveCardHigh,
    respondToTwoNotrumpFiveCardHigh,
    respondToStrongTwoClubsFiveCardHigh,
    respondToWeakTwoFiveCardHigh,
    weakTwoResponseContext,
    respondToPreemptFiveCardHigh,
    respondToOneClubFiveCardHigh,
    respondToOneDiamondFiveCardHigh,
    respondToOneMajorFiveCardHigh,
    describeResponseBidChoice
  };
});

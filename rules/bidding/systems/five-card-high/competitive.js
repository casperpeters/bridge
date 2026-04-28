(function initBridgeRulesBiddingFiveCardHighCompetitive(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const deps = isCommonJs
    ? {
        core: require("../../../core.js"),
        auction: require("../../../auction.js"),
        valuation: require("../../common/valuation.js"),
        result: require("../../common/result.js"),
        conventions: require("./conventions.js"),
        responses: require("./responses.js")
      }
    : root.BridgeRulesParts || {};
  const api = factory(
    deps.core,
    deps.auction,
    deps.valuation || deps.biddingFiveCardHighValuation,
    deps.result || deps.biddingCommonResult,
    deps.conventions || deps.biddingFiveCardHighConventions,
    deps.responses || deps.biddingFiveCardHighResponses
  );
  if (isCommonJs) module.exports = api;
  root.BridgeRulesParts = root.BridgeRulesParts || {};
  root.BridgeRulesParts.biddingFiveCardHighCompetitive = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesBiddingFiveCardHighCompetitive(core, auction, valuationHelpers, resultHelpers, conventionHelpers, responseHelpers) {
  "use strict";

  const {
    suits,
    biddingSystems,
    handShape,
    teamOf,
    partnerOf,
    isTeamVulnerable
  } = core;
  const {
    Pass,
    Double,
    Redouble,
    isPass,
    isDouble,
    isContractBid,
    highestBidCall,
    highestBid,
    bid,
    bidEquals,
    gameLevel,
    cheapestLevelForStrain,
    canDoubleFromAuction,
    canRedoubleFromAuction,
    partnershipContractCalls,
    lastPartnerContractCall
  } = auction;
  const { fitStrength, fitValuationContext, optionalFitValuationContext, suitQuality, hasStopper } = valuationHelpers;
  const { bidChoiceResult } = resultHelpers;
  const {
    notrumpTransferSuit,
    chooseSuitByLengthThenRank,
    minimumOpeningLength,
    supportLengthForOpening
  } = conventionHelpers;
  const { respondToOneNotrumpFiveCardHigh, respondToTwoNotrumpFiveCardHigh } = responseHelpers;

  function fiveCardHighBidChoiceResult(bid, ruleName, confidence, reason, extra = {}) {
    return bidChoiceResult(biddingSystems.fiveCardHigh, bid, ruleName, confidence, reason, extra);
  }

  function chooseCompetitiveFiveCardHighBid(hand, auction, seat, vulnerability = "none") {
        const shape = handShape(hand);
        const partnershipCalls = partnershipContractCalls(auction, seat);
        const lastBid = highestBid(auction);

        if (canRedoubleFromAuction(auction, seat)) {
          const partnerBid = partnershipCalls[0]?.bid || null;
          const fit = partnerBid && partnerBid.strain !== "NT" && shape.counts[partnerBid.strain] >= supportLengthForOpening(partnerBid.strain);
          if (!fit && shape.hcp >= 10) return Redouble();
        }

        if (!partnershipCalls.length) return chooseOvercallFiveCardHigh(hand, auction, seat);

        const lastPartnerCall = lastPartnerContractCall(auction, seat);
        const lastCall = auction[auction.length - 1] || null;
        if (lastPartnerCall && partnershipCalls.length === 1) {
          if (didPartnerMakeOvercall(auction, seat, lastPartnerCall)) {
            const advancerAction = respondToPartnerOvercallFiveCardHigh(shape, hand, lastPartnerCall.bid, auction, seat, vulnerability);
            if (!isPass(advancerAction)) return advancerAction;
          }
          if (isDouble(lastCall)) return respondAfterPartnerOpenedAndOpponentDoubledFiveCardHigh(shape, hand, lastPartnerCall.bid);
          if (lastBid && highestBidCall(auction)?.seat !== seat && teamOf(highestBidCall(auction).seat) !== teamOf(seat)) {
            return respondAfterOvercallFiveCardHigh(shape, hand, lastPartnerCall.bid, lastBid, auction, seat);
          }
        }

        if (canDoubleFromAuction(auction, seat) && shouldMakeInformationDoubleFiveCardHigh(shape, lastBid)) return Double();
        return Pass();
      }

  function didPartnerMakeOvercall(auction, seat, partnerCall = lastPartnerContractCall(auction, seat)) {
        if (!partnerCall || partnerCall.seat !== partnerOf(seat) || !isContractBid(partnerCall.bid)) return false;
        return Boolean(opponentContractBeforePartnerOvercall(auction, seat, partnerCall));
      }

  function opponentContractBeforePartnerOvercall(auction, seat, partnerCall = lastPartnerContractCall(auction, seat)) {
        if (!partnerCall) return null;
        const partnerCallIndex = auction.indexOf(partnerCall);
        if (partnerCallIndex < 0) return null;
        return [...auction.slice(0, partnerCallIndex)]
          .reverse()
          .find((call) => teamOf(call.seat) !== teamOf(seat) && isContractBid(call.bid)) || null;
      }

  function chooseOvercallFiveCardHigh(hand, auction, seat) {
        const shape = handShape(hand);
        const lastBid = highestBid(auction);
        if (!lastBid || !isContractBid(lastBid)) return Pass();

        if (shape.balanced && shape.hcp >= 15 && shape.hcp <= 17 && lastBid.strain !== "NT" && hasStopper(hand, lastBid.strain)) {
          return bid(cheapestLevelForStrain("NT", lastBid), "NT");
        }

        const jumpSuit = chooseSuitByLengthThenRank(suits.filter((suit) => suit !== lastBid.strain), shape, 6, true, (candidate) => suitQuality(hand, candidate) >= 2);
        if (jumpSuit && shape.hcp >= 6 && shape.hcp <= 10) {
          const baseLevel = cheapestLevelForStrain(jumpSuit, lastBid);
          return bid(Math.min(baseLevel + 1, 4), jumpSuit);
        }

        const overcallSuit = chooseSuitByLengthThenRank(suits.filter((suit) => suit !== lastBid.strain), shape, 5, true, (candidate) => suitQuality(hand, candidate) >= 2);
        if (overcallSuit) {
          const overcallLevel = cheapestLevelForStrain(overcallSuit, lastBid);
          const minimumHcp = overcallLevel >= 2 ? 10 : 8;
          if (shape.hcp >= minimumHcp && shape.hcp <= 16) return bid(overcallLevel, overcallSuit);
        }

        if (canDoubleFromAuction(auction, seat) && shouldMakeInformationDoubleFiveCardHigh(shape, lastBid)) return Double();
        return Pass();
      }

  function respondAfterPartnerOpenedAndOpponentDoubledFiveCardHigh(shape, hand, partnerBid) {
        const support = partnerBid.strain !== "NT" && shape.counts[partnerBid.strain] >= supportLengthForOpening(partnerBid.strain);
        const strength = partnerBid.strain !== "NT" ? fitStrength(hand, shape, partnerBid.strain, minimumOpeningLength(partnerBid.strain)) : shape.hcp;
        if (support && strength >= 10) return bid(2, "NT");
        if (support && strength >= 6) return bid(Math.min(partnerBid.level + 1, gameLevel(partnerBid.strain)), partnerBid.strain);
        if (shape.hcp >= 10) return Redouble();
        const newSuit = chooseSuitByLengthThenRank(suits.filter((suit) => suit !== partnerBid.strain), shape, 5, true);
        if (newSuit && shape.hcp >= 6) return bid(cheapestLevelForStrain(newSuit, partnerBid), newSuit);
        return Pass();
      }

  function respondToPartnerOvercallFiveCardHigh(shape, hand, partnerBid, auction, seat, vulnerability = "none") {
        if (!partnerBid) return Pass();
        if (partnerBid.strain === "NT") return respondToPartnerNotrumpOvercallFiveCardHigh(shape, partnerBid);
        const opponentCall = opponentContractBeforePartnerOvercall(auction, seat);
        const opponentBid = opponentCall?.bid || null;
        const support = shape.counts[partnerBid.strain] >= supportLengthForOpening(partnerBid.strain);
        const vulnerable = isTeamVulnerable(teamOf(seat), vulnerability);
        const minimumHcp = vulnerable ? 8 : 7;
        const strength = fitStrength(hand, shape, partnerBid.strain, 5);
        if (support && strength >= minimumHcp) {
          const supportLevel = cheapestLevelForStrain(partnerBid.strain, highestBid(auction));
          if (supportLevel > gameLevel(partnerBid.strain)) return Pass();
          if (strength >= 16) return bid(gameLevel(partnerBid.strain), partnerBid.strain);
          if (supportLevel >= gameLevel(partnerBid.strain)) return Pass();
          if (strength >= 10) return bid(Math.max(supportLevel, 3), partnerBid.strain);
          return bid(supportLevel, partnerBid.strain);
        }

        if (
          opponentBid?.strain &&
          opponentBid.strain !== "NT" &&
          shape.hcp >= 13 &&
          shape.balanced &&
          hasStopper(hand, opponentBid.strain)
        ) {
          return bid(3, "NT");
        }

        const newSuit = chooseSuitByLengthThenRank(
          suits.filter((suit) => suit !== partnerBid.strain && suit !== opponentBid?.strain),
          shape,
          5,
          true,
          (candidate) => suitQuality(hand, candidate) >= 2
        );
        if (newSuit && shape.hcp >= 13) return bid(cheapestLevelForStrain(newSuit, highestBid(auction)), newSuit);
        return Pass();
      }

  function respondToPartnerNotrumpOvercallFiveCardHigh(shape, partnerBid) {
        if (bidEquals(partnerBid, 1, "NT")) return respondToOneNotrumpFiveCardHigh(shape);
        if (bidEquals(partnerBid, 2, "NT")) return respondToTwoNotrumpFiveCardHigh(shape);
        return Pass();
      }

  function respondAfterOvercallFiveCardHigh(shape, hand, partnerBid, opponentBid, auction, seat) {
        const support = partnerBid.strain !== "NT" && shape.counts[partnerBid.strain] >= supportLengthForOpening(partnerBid.strain);
        if (support) {
          const strength = fitStrength(hand, shape, partnerBid.strain, minimumOpeningLength(partnerBid.strain));
          if (strength >= 12) return bid(gameLevel(partnerBid.strain), partnerBid.strain);
          if (strength >= 10) return bid(3, partnerBid.strain);
          if (strength >= 6) return bid(2, partnerBid.strain);
        }
        if (canDoubleFromAuction(auction, seat) && shouldMakeNegativeDoubleFiveCardHigh(shape, partnerBid, opponentBid)) {
          return Double();
        }
        if (shouldMakeNegativeDoubleFiveCardHigh(shape, partnerBid, opponentBid)) return Double();

        const newSuit = chooseSuitByLengthThenRank(suits.filter((suit) => suit !== partnerBid.strain && suit !== opponentBid.strain), shape, 5, true);
        if (newSuit) {
          const level = cheapestLevelForStrain(newSuit, opponentBid);
          if (level === 1 && shape.hcp >= 6) return bid(level, newSuit);
          if (level === 2 && shape.hcp >= 10) return bid(level, newSuit);
        }

        if (opponentBid.strain !== "NT" && hasStopper(hand, opponentBid.strain)) {
          const ntLevel = cheapestLevelForStrain("NT", opponentBid);
          if (shape.hcp >= 12 && shape.balanced) return bid(3, "NT");
          if (shape.hcp >= 10 && shape.balanced && ntLevel <= 2) return bid(ntLevel, "NT");
          if (shape.hcp >= 6 && shape.balanced && ntLevel === 1) return bid(1, "NT");
        }
        return Pass();
      }

  function shouldMakeInformationDoubleFiveCardHigh(shape, opponentBid) {
        if (!opponentBid || opponentBid.strain === "NT" || opponentBid.level > 2) return false;
        if (shape.hcp < 13 || shape.counts[opponentBid.strain] > 2) return false;
        const tolerance = suits
          .filter((suit) => suit !== opponentBid.strain)
          .filter((suit) => shape.counts[suit] >= (suit === "H" || suit === "S" ? 4 : 3))
          .length;
        return tolerance >= 2;
      }

  function shouldMakeNegativeDoubleFiveCardHigh(shape, partnerBid, opponentBid) {
        if (!partnerBid || !opponentBid || opponentBid.strain === "NT" || opponentBid.level > 2 || shape.hcp < 6) return false;
        return ["H", "S"].some((suit) => suit !== partnerBid.strain && suit !== opponentBid.strain && shape.counts[suit] >= 4);
      }


  function describeDoubleBidChoice(chosenBid, shape, auction, seat, base) {
        const lastBid = highestBid(auction);
        const lastPartnerCall = lastPartnerContractCall(auction, seat);
        if (lastPartnerCall && shouldMakeNegativeDoubleFiveCardHigh(shape, lastPartnerCall.bid, lastBid)) {
          return fiveCardHighBidChoiceResult(chosenBid, "competitive.negativeDouble", "basic", "Negative double with values and an unbid four-card major after interference.", base);
        }
        return fiveCardHighBidChoiceResult(chosenBid, "competitive.takeoutDouble", "basic", "Takeout double with opening strength, shortness in their suit, and tolerance for the unbid suits.", base);
      }

  function describeCompetitiveFiveCardHighBidChoice(chosenBid, shape, hand, auction, seat, vulnerability, base) {
        const partnershipCalls = partnershipContractCalls(auction, seat);
        const lastBid = highestBid(auction);
        const lastPartnerCall = lastPartnerContractCall(auction, seat);
        const partnerOvercall = didPartnerMakeOvercall(auction, seat, lastPartnerCall);
        const opponentOpeningCall = partnerOvercall ? opponentContractBeforePartnerOvercall(auction, seat, lastPartnerCall) : null;
        const vulnerable = isTeamVulnerable(teamOf(seat), vulnerability);
        const extra = {
          ...base,
          category: "competitive",
          suit: chosenBid.strain,
          length: shape.counts[chosenBid.strain] || 0,
          opponentSuit: opponentOpeningCall?.bid?.strain || lastBid?.strain || null,
          partnerSuit: lastPartnerCall?.bid?.strain || null,
          vulnerable
        };

        if (!partnershipCalls.length) {
          if (chosenBid.strain === "NT") {
            return fiveCardHighBidChoiceResult(chosenBid, "competitive.oneNotrumpOvercall", "basic", "Overcall in notrump with 15-17 HCP, balanced shape, and a stopper.", extra);
          }
          const jumpLevel = lastBid ? cheapestLevelForStrain(chosenBid.strain, lastBid) + 1 : chosenBid.level;
          if (chosenBid.level >= jumpLevel && shape.hcp <= 10) {
            return fiveCardHighBidChoiceResult(chosenBid, "competitive.jumpOvercall", "basic", "Jump overcall with a good six-card suit and limited strength.", extra);
          }
          const minimumHcp = chosenBid.level >= 2 ? 10 : 8;
          return fiveCardHighBidChoiceResult(chosenBid, "competitive.simpleOvercall", "basic", `Make a natural overcall with a good five-card suit and ${minimumHcp}+ HCP.`, {
            ...extra,
            minimumHcp
          });
        }

        if (partnerOvercall && lastPartnerCall?.bid?.strain === "NT") {
          const notrumpExtra = {
            ...extra,
            partnerNotrumpLevel: lastPartnerCall.bid.level
          };
          if (chosenBid.strain === "C" && chosenBid.level === lastPartnerCall.bid.level + 1) {
            return fiveCardHighBidChoiceResult(chosenBid, "competitive.notrumpOvercallStayman", "basic", "Use Stayman after partner's notrump overcall to look for a four-card major fit.", notrumpExtra);
          }
          const transferSuit = notrumpTransferSuit(lastPartnerCall.bid, chosenBid);
          if (transferSuit) {
            return fiveCardHighBidChoiceResult(chosenBid, `competitive.notrumpOvercallTransferTo${transferSuit}`, "basic", "Use a transfer after partner's notrump overcall to show a five-card major.", {
              ...notrumpExtra,
              transferSuit,
              length: shape.counts[transferSuit] || 0
            });
          }
          if (chosenBid.strain === "NT") {
            const invite = chosenBid.level === lastPartnerCall.bid.level + 1 && chosenBid.level < 3;
            return fiveCardHighBidChoiceResult(chosenBid, invite ? "competitive.notrumpOvercallInvite" : "competitive.notrumpOvercallGame", "basic", "Invite or bid game after partner's notrump overcall with balanced values.", notrumpExtra);
          }
        }

        if (
          lastPartnerCall?.bid?.strain !== "NT" &&
          chosenBid.strain === lastPartnerCall?.bid?.strain &&
          partnerOvercall
        ) {
          const minimumHcp = vulnerable ? 8 : 7;
          return fiveCardHighBidChoiceResult(chosenBid, "competitive.raisePartnerOvercall", "basic", `Raise partner's overcall with a fit and ${minimumHcp}+ fit points${vulnerable ? " when vulnerable" : " when not vulnerable"}.`, {
            ...extra,
            support: shape.counts[lastPartnerCall.bid.strain] || 0,
            minimumHcp,
            ...fitValuationContext(hand, shape, lastPartnerCall.bid.strain, 5)
          });
        }
        if (partnerOvercall && chosenBid.strain === "NT") {
          return fiveCardHighBidChoiceResult(chosenBid, "competitive.notrumpAfterPartnerOvercall", "basic", "Bid 3NT after partner's two-level overcall with enough combined strength and a stopper in their suit.", {
            ...extra,
            minimumHcp: 13,
            stopperSuit: opponentOpeningCall?.bid?.strain || null
          });
        }
        if (partnerOvercall && chosenBid.strain !== lastPartnerCall?.bid?.strain) {
          return fiveCardHighBidChoiceResult(chosenBid, "competitive.newSuitAfterPartnerOvercall", "basic", "Bid a new suit after partner's two-level overcall with a good five-card suit and game interest.", {
            ...extra,
            minimumHcp: 13
          });
        }
        if (lastPartnerCall?.bid?.strain !== "NT" && chosenBid.strain === lastPartnerCall?.bid?.strain) {
          return fiveCardHighBidChoiceResult(chosenBid, "competitive.raisePartner", "basic", "Compete by raising partner's suit with support.", {
            ...extra,
            ...optionalFitValuationContext(hand, shape, lastPartnerCall.bid.strain, minimumOpeningLength(lastPartnerCall.bid.strain))
          });
        }
        if (chosenBid.strain === "NT") {
          return fiveCardHighBidChoiceResult(chosenBid, "competitive.notrump", "basic", "Bid notrump competitively with balanced strength and a stopper.", extra);
        }
        return fiveCardHighBidChoiceResult(chosenBid, "competitive.newSuit", "basic", "Compete naturally in a new suit.", extra);
      }


  return {
    chooseCompetitiveFiveCardHighBid,
    didPartnerMakeOvercall,
    opponentContractBeforePartnerOvercall,
    chooseOvercallFiveCardHigh,
    respondAfterPartnerOpenedAndOpponentDoubledFiveCardHigh,
    respondToPartnerOvercallFiveCardHigh,
    respondToPartnerNotrumpOvercallFiveCardHigh,
    respondAfterOvercallFiveCardHigh,
    shouldMakeInformationDoubleFiveCardHigh,
    shouldMakeNegativeDoubleFiveCardHigh,
    describeDoubleBidChoice,
    describeCompetitiveFiveCardHighBidChoice
  };
});

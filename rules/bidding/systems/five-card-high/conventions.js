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

  const { suits, bidStrains, handShape, teamOf } = core;
  const {
    Pass,
    bid,
    bidEquals,
    gameLevel,
    cheapestLevelForStrain,
    nextAvailableBid,
    isBidHigher,
    isContractBid
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

  function chooseDirectNotrumpSlamResponse(shape, openerMinimumHcp) {
        if (!shape.balanced || hasFourCardMajor(shape)) return null;
        const partnershipMinimumHcp = shape.hcp + openerMinimumHcp;
        if (partnershipMinimumHcp >= 37) return bid(7, "NT");
        if (partnershipMinimumHcp >= 33) return bid(6, "NT");
        return null;
      }

  function countAces(hand = []) {
        return hand.filter((card) => card?.rank === "A").length;
      }

  function isBlackwoodAsk(candidate) {
        return bidEquals(candidate, 4, "NT");
      }

  function blackwoodResponseBidForAceCount(aceCount) {
        if (!Number.isInteger(aceCount) || aceCount < 0 || aceCount > 4) return null;
        return bid(5, ["C", "D", "H", "S"][aceCount === 4 ? 0 : aceCount]);
      }

  function blackwoodShownAceCount(responseBid, bidResult = null) {
        if (Number.isInteger(bidResult?.aceCount)) return bidResult.aceCount;
        if (bidEquals(responseBid, 5, "D")) return 1;
        if (bidEquals(responseBid, 5, "H")) return 2;
        if (bidEquals(responseBid, 5, "S")) return 3;
        return null;
      }

  function agreedTrumpAfterAcceptedNotrumpTransfer(openingBid, responseBid, openerRebid) {
        const transferSuit = notrumpTransferSuit(openingBid, responseBid);
        if (!transferSuit || !bidEquals(openerRebid, openingBid.level + 1, transferSuit)) return null;
        return transferSuit;
      }

  function auctionAgreementFromAuction(auction = [], seat = null) {
        const partnershipCalls = seat
          ? partnershipContractCallsWithIndexes(auction, seat)
          : inferLastPartnershipContractCalls(auction);
        return auctionAgreementFromPartnershipCalls(partnershipCalls);
      }

  function auctionAgreementFromPartnershipCalls(partnershipCalls = []) {
        return agreementFromAcceptedTransferCalls(partnershipCalls)
          || agreementFromStaymanFitCalls(partnershipCalls)
          || agreementFromOpenerRaiseCalls(partnershipCalls)
          || agreementFromSameSuitCalls(partnershipCalls)
          || null;
      }

  function agreedTrumpFromAuction(auction = [], seat = null) {
        return auctionAgreementFromAuction(auction, seat);
      }

  function agreedTrumpFromPartnershipCalls(partnershipCalls = []) {
        return auctionAgreementFromPartnershipCalls(partnershipCalls);
      }

  function agreementResult(trumpSuit, source, call, extra = {}) {
        if (!trumpSuit || trumpSuit === "NT") return null;
        return {
          trumpSuit,
          source,
          confidence: "explicit",
          bySeat: call?.seat || null,
          afterCallIndex: Number.isInteger(call?.callIndex) ? call.callIndex : null,
          ...extra
        };
      }

  function partnershipContractCallsWithIndexes(auction = [], seat) {
        return auction
          .map((call, callIndex) => ({ ...call, callIndex }))
          .filter((call) => isContractBid(call.bid) && teamOf(call.seat) === teamOf(seat));
      }

  function inferLastPartnershipContractCalls(auction = []) {
        const contractCalls = auction
          .map((call, callIndex) => ({ ...call, callIndex }))
          .filter((call) => isContractBid(call.bid));
        const lastContractCall = contractCalls[contractCalls.length - 1] || null;
        if (!lastContractCall) return [];
        return contractCalls.filter((call) => teamOf(call.seat) === teamOf(lastContractCall.seat));
      }

  function agreementFromAcceptedTransferCalls(partnershipCalls = []) {
        for (let index = 0; index + 2 < partnershipCalls.length; index++) {
          const openingBid = partnershipCalls[index]?.bid;
          const responseBid = partnershipCalls[index + 1]?.bid;
          const openerRebid = partnershipCalls[index + 2]?.bid;
          const trumpSuit = agreedTrumpAfterAcceptedNotrumpTransfer(openingBid, responseBid, openerRebid);
          if (trumpSuit) return agreementResult(trumpSuit, "acceptedTransfer", partnershipCalls[index + 2], {
            openingCallIndex: partnershipCalls[index]?.callIndex ?? null,
            responseCallIndex: partnershipCalls[index + 1]?.callIndex ?? null
          });
        }
        return null;
      }

  function agreementFromStaymanFitCalls(partnershipCalls = []) {
        for (let index = 0; index + 3 < partnershipCalls.length; index++) {
          const opening = partnershipCalls[index];
          const stayman = partnershipCalls[index + 1];
          const openerMajor = partnershipCalls[index + 2];
          const responderRaise = partnershipCalls[index + 3];
          const major = openerMajor?.bid?.strain;
          const staymanLevel = opening?.bid?.level === 2 ? 3 : 2;
          if (
            (bidEquals(opening?.bid, 1, "NT") || bidEquals(opening?.bid, 2, "NT")) &&
            bidEquals(stayman?.bid, staymanLevel, "C") &&
            (major === "H" || major === "S") &&
            responderRaise?.seat !== openerMajor?.seat &&
            responderRaise?.bid?.strain === major
          ) {
            return agreementResult(major, "staymanFit", responderRaise, {
              openingCallIndex: opening?.callIndex ?? null,
              responseCallIndex: stayman?.callIndex ?? null
            });
          }
        }
        return null;
      }

  function agreementFromOpenerRaiseCalls(partnershipCalls = []) {
        for (let index = 0; index + 2 < partnershipCalls.length; index++) {
          const opening = partnershipCalls[index];
          const response = partnershipCalls[index + 1];
          const openerRebid = partnershipCalls[index + 2];
          const responseSuit = response?.bid?.strain;
          if (
            opening?.seat === openerRebid?.seat &&
            response?.seat !== opening?.seat &&
            (responseSuit === "H" || responseSuit === "S") &&
            openerRebid?.bid?.strain === responseSuit
          ) {
            return agreementResult(responseSuit, "openerRaisesResponderMajor", openerRebid, {
              openingCallIndex: opening?.callIndex ?? null,
              responseCallIndex: response?.callIndex ?? null
            });
          }
        }
        return null;
      }

  function agreementFromSameSuitCalls(partnershipCalls = []) {
        let agreement = null;
        for (let index = 0; index < partnershipCalls.length; index++) {
          const call = partnershipCalls[index];
          const strain = call?.bid?.strain;
          if (!strain || strain === "NT") continue;
          const earlierPartnerCall = partnershipCalls
            .slice(0, index)
            .find((candidate) => candidate.seat !== call.seat && candidate.bid?.strain === strain);
          if (!earlierPartnerCall) continue;
          const source = sameSuitAgreementSource(earlierPartnerCall.bid, call.bid, strain);
          if (source) agreement = agreementResult(strain, source, call, {
            firstSuitCallIndex: earlierPartnerCall.callIndex ?? null
          });
        }
        return agreement;
      }

  function sameSuitAgreementSource(firstBid, laterBid, strain) {
        if (strain === "H" || strain === "S") {
          if (firstBid?.level >= 2) return "preemptRaise";
          return "majorRaise";
        }
        if (firstBid?.level >= 2) return "preemptRaise";
        if (laterBid?.level >= 3) return "minorRaise";
        return null;
      }

  function shouldUseBlackwoodAfterAcceptedTransfer(shape, openingBid, trumpSuit) {
        if (!trumpSuit || shape.counts[trumpSuit] < 5) return false;
        if (bidEquals(openingBid, 2, "NT")) return shape.hcp >= 12;
        if (bidEquals(openingBid, 1, "NT")) return shape.hcp + 17 >= 33;
        return false;
      }

  function chooseBlackwoodFollowup({ trumpSuit, askerAceCount, partnerAceCount, partnershipMinimumHcp }) {
        if (!trumpSuit) return null;
        if (!Number.isInteger(partnerAceCount)) return bid(5, trumpSuit);
        const missingAces = 4 - askerAceCount - partnerAceCount;
        if (missingAces >= 2) return bid(5, trumpSuit);
        if (missingAces <= 0 && partnershipMinimumHcp >= 37) return bid(7, trumpSuit);
        return bid(6, trumpSuit);
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
    chooseDirectNotrumpSlamResponse,
    countAces,
    isBlackwoodAsk,
    blackwoodResponseBidForAceCount,
    blackwoodShownAceCount,
    agreedTrumpAfterAcceptedNotrumpTransfer,
    auctionAgreementFromAuction,
    auctionAgreementFromPartnershipCalls,
    agreedTrumpFromAuction,
    agreedTrumpFromPartnershipCalls,
    shouldUseBlackwoodAfterAcceptedTransfer,
    chooseBlackwoodFollowup,
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

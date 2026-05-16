(function initBridgeRulesBiddingFiveCardHigh(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const deps = isCommonJs
    ? {
        core: require("../../../core.js"),
        auction: require("../../../auction.js"),
        context: require("../../common/context.js"),
        valuation: require("../../common/valuation.js"),
        legality: require("../../common/legality.js"),
        result: require("../../common/result.js"),
        conventions: require("./conventions.js"),
        opening: require("./opening.js"),
        responses: require("./responses.js"),
        rebids: require("./rebids.js"),
        continuation: require("./continuation.js"),
        competitive: require("./competitive.js")
      }
    : root.BridgeRulesParts || {};
  const api = factory(
    deps.core,
    deps.auction,
    deps.context || deps.biddingFiveCardHighContext,
    deps.valuation || deps.biddingFiveCardHighValuation,
    deps.legality || deps.biddingCommonLegality,
    deps.result || deps.biddingCommonResult,
    deps.conventions || deps.biddingFiveCardHighConventions,
    deps.opening || deps.biddingFiveCardHighOpening,
    deps.responses || deps.biddingFiveCardHighResponses,
    deps.rebids || deps.biddingFiveCardHighRebids,
    deps.continuation || deps.biddingFiveCardHighContinuation,
    deps.competitive || deps.biddingFiveCardHighCompetitive
  );
  if (isCommonJs) module.exports = api;
  root.BridgeRulesParts = root.BridgeRulesParts || {};
  root.BridgeRulesParts.biddingFiveCardHigh = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesBiddingFiveCardHigh(core, auction, contextHelpers, valuationHelpers, legalityHelpers, resultHelpers, conventionHelpers, openingRules, responseRules, rebidRules, continuationRules, competitiveRules) {
  "use strict";

  const {
    biddingSystems,
    handShape,
    teamOf,
    partnerOf,
    isTeamVulnerable
  } = core;
  const {
    Pass,
    normalizeBid,
    sameCall,
    isPass,
    isDouble,
    isRedouble,
    isContractBid,
    highestBid,
    lastPartnerContractCall
  } = auction;
  const {
    fiveCardHighAuctionPhases,
    auctionContextForFiveCardHigh
  } = contextHelpers;
  const {
    ruleOf20OpeningContext
  } = valuationHelpers;
  const { legalizeBidTarget } = legalityHelpers;
  const { bidChoiceResult } = resultHelpers;
  const {
    chooseFiveCardHighNaturalContinuation,
    countAces,
    isBlackwoodAsk,
    blackwoodResponseBidForAceCount,
    auctionAgreementFromAuction,
    agreedTrumpFromAuction,
    isWeakTwoOpeningFiveCardHigh
  } = conventionHelpers;
  const auctionAgreementFromAuctionForFiveCardHigh = auctionAgreementFromAuction || agreedTrumpFromAuction;
  const {
    chooseFiveCardHighOpening,
    describeOpeningBidChoice
  } = openingRules;
  const {
    chooseFiveCardHighResponse,
    weakTwoResponseContext,
    preemptResponseContext,
    describeResponseBidChoice
  } = responseRules;
  const {
    chooseFiveCardHighOpenerRebid,
    chooseFiveCardHighResponderRebid,
    describeNaturalContinuationChoice
  } = rebidRules;
  const {
    chooseCompetitiveBidResult,
    chooseCompetitiveFiveCardHighBid,
    describeRedoubleBidChoice,
    describeDoubleBidChoice,
    describeCompetitiveFiveCardHighBidChoice,
    describeTakeoutDoubleAction
  } = competitiveRules;
  const {
    chooseConstructiveContinuationResult,
    chooseConstructiveContinuationBidTarget,
    describeConstructiveContinuationBidChoice,
    describeConstructiveContinuationPassChoice
  } = continuationRules;

  function chooseFiveCardHighBid(options = {}) {
      return chooseFiveCardHighBidResult(options).bid;
    }

  function chooseFiveCardHighBidResult(options = {}) {
      const auction = options.auction || [];
      const seat = options.seat;
      const context = options.context || auctionContextForFiveCardHigh(auction, seat);
      const competitiveResult = chooseCompetitiveBidResultForContext({ ...options, auction, seat, context });
      if (competitiveResult) return legalizeBidResult({ ...options, auction, seat, context }, competitiveResult);
      const continuationResult = context.uncontested
        ? chooseConstructiveContinuationResult({ ...options, auction, seat, context })
        : null;
      if (continuationResult) return legalizeBidResult({ ...options, auction, seat, context }, continuationResult);
      const target = chooseFiveCardHighBidTarget({ ...options, auction, seat, context });
      const chosenBid = legalizeBidTarget(target, highestBid(auction), seat, auction);
      return describeFiveCardHighBidChoice({ ...options, auction, seat, context, target, bid: chosenBid });
    }

  function chooseCompetitiveBidResultForContext({ hand = [], auction = [], seat, vulnerability = "none", context } = {}) {
      if (!seat || context?.uncontested) return null;
      if (agreementForPartnerBlackwoodAsk(auction, seat)) return null;
      return chooseCompetitiveBidResult({ hand, auction, seat, vulnerability, context });
    }

  function legalizeBidResult(options, bidResult) {
      const { auction = [], seat, context } = options;
      const chosenBid = legalizeBidTarget(bidResult.bid, highestBid(auction), seat, auction);
      if (sameCall(chosenBid, bidResult.bid)) return bidResult;
      return describeFiveCardHighBidChoice({
        ...options,
        auction,
        seat,
        context,
        target: bidResult.bid,
        bid: chosenBid
      });
    }

  function fiveCardHighBidChoiceResult(bid, ruleName, confidence, reason, extra = {}) {
      return bidChoiceResult(biddingSystems.fiveCardHigh, bid, ruleName, confidence, reason, extra);
    }

  function describeFiveCardHighBidChoice({ hand = [], auction = [], seat, vulnerability = "none", target, bid: chosenBid, context } = {}) {
      const shape = handShape(hand);
      const bidContext = context || auctionContextForFiveCardHigh(auction, seat);
      const base = {
        hcp: shape.hcp,
        points: shape.points,
        aceCount: countAces(hand),
        balanced: shape.balanced,
        counts: { ...shape.counts },
        vulnerability,
        vulnerable: seat ? isTeamVulnerable(teamOf(seat), vulnerability) : false,
        ...ruleOf20OpeningContext(shape, hand)
      };

      if (!seat) {
        return fiveCardHighBidChoiceResult(chosenBid, "pass.noSeat", "basic", "No seat was available for the bidding engine.", base);
      }
      if (!sameCall(chosenBid, target)) {
        return fiveCardHighBidChoiceResult(chosenBid, "legalize.pass", "basic", "The preferred target was not legal in the current auction, so the engine passes.", {
          ...base,
          targetBid: target
        });
      }
      const blackwoodAgreement = agreementForPartnerBlackwoodAsk(auction, seat);
      if (blackwoodAgreement && chosenBid.level === 5) {
        return fiveCardHighBidChoiceResult(chosenBid, "continuation.blackwoodResponse", "basic", "Answer partner's four-notrump ace ask.", {
          ...base,
          category: "continuation",
          convention: "blackwood",
          trumpSuit: blackwoodAgreement.trumpSuit,
          agreementSource: blackwoodAgreement.source,
          agreementConfidence: blackwoodAgreement.confidence,
          suit: chosenBid.strain,
          aceCount: base.aceCount
        });
      }
      if (isRedouble(chosenBid)) {
        return describeRedoubleBidChoice(chosenBid, shape, auction, seat, base);
      }
      if (isDouble(chosenBid)) {
        return describeDoubleBidChoice(chosenBid, shape, hand, auction, seat, base);
      }
      const takeoutDoubleResult = describeTakeoutDoubleAction?.({ chosenBid, shape, hand, auction, seat, vulnerability, base });
      if (takeoutDoubleResult) return takeoutDoubleResult;
      if (isPass(chosenBid)) {
        return describePassBidChoice(shape, hand, auction, seat, base, bidContext);
      }
      if (!isContractBid(chosenBid)) {
        return fiveCardHighBidChoiceResult(chosenBid, "pass.unknownCall", "basic", "The bidding engine did not recognize a contract action.", base);
      }
      if (bidContext.uncontested) {
        return describeUncontestedFiveCardHighBidChoice(chosenBid, shape, hand, auction, seat, base, bidContext);
      }
      return describeCompetitiveFiveCardHighBidChoice(chosenBid, shape, hand, auction, seat, vulnerability, base);
    }


  function describePassBidChoice(shape, hand, auction, seat, base, context = auctionContextForFiveCardHigh(auction, seat)) {
        if (!context.uncontested) {
          return fiveCardHighBidChoiceResult(Pass(), "pass.competitiveNoAction", "basic", "Pass because there is no responsible overcall, raise, notrump action, or double in the current competitive auction.", {
            ...base,
            category: "competitive"
          });
        }

        const partnershipCalls = context.partnershipCalls;
        if (!partnershipCalls.length) {
          return fiveCardHighBidChoiceResult(Pass(), "pass.openingNoAction", "basic", "Pass because the hand lacks normal opening strength and has no suitable weak two or preempt.", {
            ...base,
            category: "opening"
          });
        }

        const lastPartnerCall = context.lastPartnerCall;
        if (partnershipCalls.length === 1) {
          if (isWeakTwoOpeningFiveCardHigh(lastPartnerCall?.bid)) {
            return fiveCardHighBidChoiceResult(Pass(), "pass.responseWeakTwoNoAction", "basic", "Pass opposite partner's weak two because there is no fit action or safe notrump action.", {
              ...base,
              category: "response",
              partnerSuit: lastPartnerCall.bid.strain,
              ...weakTwoResponseContext(shape, hand, lastPartnerCall.bid)
            });
          }
          if (lastPartnerCall?.bid?.level >= 3 && lastPartnerCall.bid.strain !== "NT") {
            return fiveCardHighBidChoiceResult(Pass(), "pass.responsePreemptNoAction", "basic", "Pass opposite partner's preempt because there are not enough own playing tricks, stoppers, support, or communication for game.", {
              ...base,
              category: "response",
              partnerSuit: lastPartnerCall.bid.strain,
              ...preemptResponseContext(shape, hand, lastPartnerCall.bid)
            });
          }
          return fiveCardHighBidChoiceResult(Pass(), "pass.responseNoAction", "basic", "Pass because there are not enough values or no suitable action opposite partner's opening.", {
            ...base,
            category: "response",
            partnerSuit: lastPartnerCall?.bid?.strain || partnershipCalls[0]?.bid?.strain || null,
            support: lastPartnerCall?.bid?.strain && lastPartnerCall.bid.strain !== "NT" ? shape.counts[lastPartnerCall.bid.strain] : 0
          });
        }

        return describeConstructiveContinuationPassChoice(shape, hand, auction, seat, base, context);
      }

  function describeUncontestedFiveCardHighBidChoice(chosenBid, shape, hand, auction, seat, base, context = auctionContextForFiveCardHigh(auction, seat)) {
        const partnershipCalls = context.partnershipCalls;
        const openingCall = context.openingCall;
        const lastPartnerCall = context.lastPartnerCall;

        switch (context.phase) {
          case fiveCardHighAuctionPhases.opening:
            return describeOpeningBidChoice(chosenBid, shape, hand, base);
          case fiveCardHighAuctionPhases.noPartnerBid:
            return fiveCardHighBidChoiceResult(chosenBid, "pass.noPartnerBid", "basic", "No partner bid was available to answer.", base);
          case fiveCardHighAuctionPhases.response:
            return describeResponseBidChoice(chosenBid, shape, hand, openingCall.bid, base);
          case fiveCardHighAuctionPhases.openerRebid:
          case fiveCardHighAuctionPhases.responderRebid:
          case fiveCardHighAuctionPhases.openerThird:
          case fiveCardHighAuctionPhases.responderAfterFourthSuit:
          case fiveCardHighAuctionPhases.naturalContinuation:
            return describeConstructiveContinuationBidChoice({ hand, auction, seat, target: chosenBid, bid: chosenBid, context, baseExtras: base });
          default:
            return describeNaturalContinuationChoice(chosenBid, shape, hand, lastPartnerCall?.bid, base);
        }
      }





  function chooseFiveCardHighBidTarget({ hand = [], auction = [], seat, vulnerability = "none", context } = {}) {
      if (!seat) return Pass();
      const blackwoodAgreement = agreementForPartnerBlackwoodAsk(auction, seat);
      if (blackwoodAgreement) return blackwoodResponseBidForAceCount(countAces(hand));
      const bidContext = context || auctionContextForFiveCardHigh(auction, seat);
      const target = bidContext.uncontested
        ? chooseUncontestedFiveCardHighBid(hand, auction, seat, bidContext, vulnerability)
        : chooseCompetitiveFiveCardHighBid(hand, auction, seat, vulnerability);
      return normalizeBid(target) || Pass();
    }

  function agreementForPartnerBlackwoodAsk(auction = [], seat) {
      const lastPartnerCall = lastPartnerContractCall(auction, seat);
      if (!isBlackwoodAsk(lastPartnerCall?.bid)) return null;
      return auctionAgreementFromAuctionForFiveCardHigh(auction, seat);
    }

  function agreedTrumpForPartnerBlackwoodAsk(auction = [], seat) {
      return agreementForPartnerBlackwoodAsk(auction, seat)?.trumpSuit || null;
    }

  function chooseUncontestedFiveCardHighBid(hand, auction, seat, context = auctionContextForFiveCardHigh(auction, seat), vulnerability = "none") {
        const partnershipCalls = context.partnershipCalls;
        const openingCall = context.openingCall;
        const lastPartnerCall = context.lastPartnerCall;

        switch (context.phase) {
          case fiveCardHighAuctionPhases.opening:
            return chooseFiveCardHighOpening(hand, { seat, vulnerability });
          case fiveCardHighAuctionPhases.response:
            return chooseFiveCardHighResponse(hand, openingCall.bid);
          case fiveCardHighAuctionPhases.openerRebid:
          case fiveCardHighAuctionPhases.responderRebid:
          case fiveCardHighAuctionPhases.openerThird:
          case fiveCardHighAuctionPhases.responderAfterFourthSuit:
          case fiveCardHighAuctionPhases.naturalContinuation:
            return chooseConstructiveContinuationBidTarget({ hand, auction, seat, context });
          case fiveCardHighAuctionPhases.noPartnerBid:
            return Pass();
          default:
            return chooseFiveCardHighNaturalContinuation(hand, lastPartnerCall?.bid, context.lastBid);
        }
      }

  return {
    chooseFiveCardHighBid,
    chooseFiveCardHighBidResult,
    chooseFiveCardHighBidTarget,
    chooseFiveCardHighOpening,
    chooseFiveCardHighResponse,
    chooseFiveCardHighOpenerRebid,
    chooseFiveCardHighResponderRebid
  };
});

(function initBridgeRulesBiddingFiveCardHighContinuation(root, factory) {
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
        rebids: require("./rebids.js")
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
    deps.rebids || deps.biddingFiveCardHighRebids
  );
  if (isCommonJs) module.exports = api;
  root.BridgeRulesParts = root.BridgeRulesParts || {};
  root.BridgeRulesParts.biddingFiveCardHighContinuation = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesBiddingFiveCardHighContinuation(core, auction, contextHelpers, valuationHelpers, legalityHelpers, resultHelpers, conventionHelpers, rebidRules) {
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
    bidEquals,
    gameLevel,
    highestBid,
    normalizeBid,
    sameCall,
    isPass,
    isContractBid
  } = auction;
  const {
    fiveCardHighAuctionPhases,
    auctionContextForFiveCardHigh,
    isFourthSuitForcingBid
  } = contextHelpers;
  const {
    optionalFitValuationContext,
    ruleOf20OpeningContext
  } = valuationHelpers;
  const { legalizeBidTarget } = legalityHelpers;
  const { bidChoiceResult } = resultHelpers;
  const {
    notrumpTransferSuit,
    chooseFiveCardHighNaturalContinuation,
    countAces,
    supportLengthForOpening
  } = conventionHelpers;
  const {
    chooseFiveCardHighOpenerRebid,
    chooseFiveCardHighResponderRebid,
    chooseFiveCardHighOpenerThirdBid,
    chooseFiveCardHighResponderAfterFourthSuit,
    describeOpenerRebidChoice,
    describeResponderRebidChoice,
    describeOpenerThirdBidChoice,
    describeResponderAfterFourthSuitChoice,
    describeNaturalContinuationChoice,
    minorOpeningNotrumpResponseContext,
    majorOpeningNotrumpResponseContext,
    isMajorSingleRaiseFiveCardHigh,
    isMinorRaiseFiveCardHigh,
    isSingleRaiseInviteFiveCardHigh
  } = rebidRules;

  function chooseConstructiveContinuationResult(options = {}) {
    const auctionCalls = options.auction || [];
    const seat = options.seat;
    const context = options.context || auctionContextForFiveCardHigh(auctionCalls, seat);
    const target = chooseConstructiveContinuationBidTarget({ ...options, auction: auctionCalls, seat, context });
    if (!target) return null;

    const chosenBid = legalizeBidTarget(target, highestBid(auctionCalls), seat, auctionCalls);
    return describeConstructiveContinuationBidChoice({
      ...options,
      auction: auctionCalls,
      seat,
      context,
      target,
      bid: chosenBid
    });
  }

  function chooseConstructiveContinuationBidTarget({ hand = [], auction = [], seat, context } = {}) {
    if (!seat) return null;
    const bidContext = context || auctionContextForFiveCardHigh(auction, seat);
    const partnershipCalls = bidContext.partnershipCalls || [];
    const openingCall = bidContext.openingCall;
    const lastPartnerCall = bidContext.lastPartnerCall;

    switch (bidContext.phase) {
      case fiveCardHighAuctionPhases.openerRebid:
        return chooseFiveCardHighOpenerRebid(hand, openingCall?.bid, lastPartnerCall?.bid);
      case fiveCardHighAuctionPhases.responderRebid:
        return chooseFiveCardHighResponderRebid(hand, openingCall?.bid, bidContext.responseCall?.bid, lastPartnerCall?.bid);
      case fiveCardHighAuctionPhases.openerThird:
        return chooseFiveCardHighOpenerThirdBid(hand, partnershipCalls);
      case fiveCardHighAuctionPhases.responderAfterFourthSuit:
        return chooseFiveCardHighResponderAfterFourthSuit(hand, partnershipCalls);
      case fiveCardHighAuctionPhases.naturalContinuation:
        return chooseFiveCardHighNaturalContinuation(hand, lastPartnerCall?.bid, bidContext.lastBid);
      default:
        return null;
    }
  }

  function describeConstructiveContinuationBidChoice({ hand = [], auction = [], seat, vulnerability = "none", target, bid: chosenBid, context, baseExtras = {} } = {}) {
    const bidContext = context || auctionContextForFiveCardHigh(auction, seat);
    const shape = handShape(hand);
    const base = continuationBidBase({ hand, shape, seat, vulnerability, baseExtras });
    const normalizedTarget = normalizeBid(target) || Pass();

    if (!sameCall(chosenBid, normalizedTarget)) {
      return fiveCardHighBidChoiceResult(chosenBid, "legalize.pass", "basic", "The preferred target was not legal in the current auction, so the engine passes.", {
        ...base,
        targetBid: normalizedTarget
      });
    }
    if (isPass(chosenBid)) {
      return describeConstructiveContinuationPassChoice(shape, hand, auction, seat, base, bidContext);
    }
    if (!isContractBid(chosenBid)) {
      return fiveCardHighBidChoiceResult(chosenBid, "pass.unknownCall", "basic", "The bidding engine did not recognize a contract action.", base);
    }
    return describeConstructiveContinuationContractChoice(chosenBid, shape, hand, seat, base, bidContext);
  }

  function describeConstructiveContinuationContractChoice(chosenBid, shape, hand, seat, base, context) {
    const partnershipCalls = context.partnershipCalls || [];
    const openingCall = context.openingCall;
    const lastPartnerCall = context.lastPartnerCall;

    switch (context.phase) {
      case fiveCardHighAuctionPhases.openerRebid:
        return describeOpenerRebidChoice(chosenBid, shape, hand, openingCall?.bid, lastPartnerCall?.bid, base);
      case fiveCardHighAuctionPhases.responderRebid:
        return describeResponderRebidChoice(chosenBid, shape, openingCall?.bid, context.responseCall?.bid, lastPartnerCall?.bid, base);
      case fiveCardHighAuctionPhases.openerThird:
        return describeOpenerThirdBidChoice(chosenBid, shape, hand, partnershipCalls, base);
      case fiveCardHighAuctionPhases.responderAfterFourthSuit:
        return describeResponderAfterFourthSuitChoice(chosenBid, shape, partnershipCalls, base);
      default:
        return describeNaturalContinuationChoice(chosenBid, shape, hand, lastPartnerCall?.bid, base);
    }
  }

  function describeConstructiveContinuationPassChoice(shape, hand, auction, seat, base, context = auctionContextForFiveCardHigh(auction, seat)) {
    const partnershipCalls = context.partnershipCalls || [];
    const lastPartnerCall = context.lastPartnerCall;
    const openingCall = partnershipCalls[0];
    const responseCall = partnershipCalls[1];
    const openerRebidCall = partnershipCalls[2];
    const responderRebidCall = partnershipCalls[3];
    const openerThirdCall = partnershipCalls[4];

    const minorNotrumpContext = minorOpeningNotrumpResponseContext(shape, openingCall?.bid, responseCall?.bid);
    if (openingCall?.seat === seat && minorNotrumpContext) {
      const suffix = responseCall.bid.level === 1 ? "OneNtMinimum" : responseCall.bid.level === 2 ? "TwoNtMinimum" : "ThreeNtPass";
      return fiveCardHighBidChoiceResult(Pass(), `pass.openerMinorAfter${suffix}`, "basic", "Pass after partner's notrump response to a minor opening because opener has no reason to move on.", {
        ...base,
        ...minorNotrumpContext,
        category: "continuation",
        suit: openingCall.bid.strain,
        length: shape.counts[openingCall.bid.strain] || 0
      });
    }

    const notrumpResponseContext = majorOpeningNotrumpResponseContext(shape, openingCall?.bid, responseCall?.bid);
    if (openingCall?.seat === seat && notrumpResponseContext) {
      const prefix = responseCall.bid.level === 1 ? "OneNt" : "TwoNt";
      const suffix = notrumpResponseContext.handType === "balanced" ? "BalancedMinimum" : "NoAction";
      return fiveCardHighBidChoiceResult(Pass(), `pass.openerAfter${prefix}${suffix}`, "basic", "Pass after partner's notrump response according to opener's hand type and range.", {
        ...base,
        ...notrumpResponseContext,
        category: "continuation",
        suit: openingCall.bid.strain,
        length: shape.counts[openingCall.bid.strain] || 0
      });
    }

    if (openingCall?.seat === seat && isMajorSingleRaiseFiveCardHigh(openingCall.bid, responseCall?.bid)) {
      return fiveCardHighBidChoiceResult(Pass(), "pass.openerMajorRaiseMinimum", "basic", "Pass after partner's single major raise with 12-15 fit points.", {
        ...base,
        category: "continuation",
        suit: openingCall.bid.strain,
        length: shape.counts[openingCall.bid.strain] || 0,
        ...optionalFitValuationContext(hand, shape, openingCall.bid.strain, supportLengthForOpening(openingCall.bid.strain))
      });
    }
    if (openingCall?.seat === seat && isMinorRaiseFiveCardHigh(openingCall.bid, responseCall?.bid)) {
      return fiveCardHighBidChoiceResult(Pass(), "pass.openerMinorRaiseMinimum", "basic", "Pass after partner's minor raise with a minimum opening hand.", {
        ...base,
        category: "continuation",
        suit: openingCall.bid.strain,
        length: shape.counts[openingCall.bid.strain] || 0,
        ...optionalFitValuationContext(hand, shape, openingCall.bid.strain, supportLengthForOpening(openingCall.bid.strain))
      });
    }

    if (
      openingCall?.seat === partnerOf(seat) &&
      isFourthSuitForcingBid(openingCall?.bid, responseCall?.bid, openerRebidCall?.bid, responderRebidCall?.bid) &&
      bidEquals(openerThirdCall?.bid, 3, "NT")
    ) {
      return fiveCardHighBidChoiceResult(Pass(), "pass.responderAfterFourthSuitAcceptNotrumpGame", "basic", "Pass because opener has answered fourth-suit forcing with the notrump game.", {
        ...base,
        category: "continuation",
        convention: "fourthSuitForcing",
        gameForcing: true,
        artificial: false,
        fourthSuit: responderRebidCall.bid.strain
      });
    }
    if (
      openingCall?.seat === partnerOf(seat) &&
      isMajorSingleRaiseFiveCardHigh(openingCall?.bid, responseCall?.bid) &&
      openerRebidCall?.bid?.strain === openingCall.bid.strain &&
      openerRebidCall.bid.level === gameLevel(openingCall.bid.strain)
    ) {
      return fiveCardHighBidChoiceResult(Pass(), "pass.responderAfterMajorRaiseGame", "basic", "Pass after partner bid game over the single major raise unless responder has a clear Blackwood hand.", {
        ...base,
        category: "continuation",
        partnerSuit: openerRebidCall.bid.strain,
        trumpSuit: openerRebidCall.bid.strain,
        support: shape.counts[openerRebidCall.bid.strain] || 0,
        aceCount: base.aceCount,
        partnershipMinimumHcp: shape.hcp + 18,
        slamTargetHcp: 33
      });
    }
    if (
      openingCall?.seat === partnerOf(seat) &&
      isSingleRaiseInviteFiveCardHigh(responseCall?.bid, openerRebidCall?.bid)
    ) {
      return fiveCardHighBidChoiceResult(Pass(), "pass.declineMajorInvite", "basic", "Pass after partner's invitational raise with the lower range for the single raise.", {
        ...base,
        category: "continuation",
        partnerSuit: openerRebidCall.bid.strain,
        support: shape.counts[openerRebidCall.bid.strain] || 0
      });
    }

    const openerTransferSuit = openingCall?.seat === seat && bidEquals(openingCall?.bid, 1, "NT")
      ? notrumpTransferSuit(openingCall.bid, responseCall?.bid)
      : null;
    if (openerTransferSuit && bidEquals(responderRebidCall?.bid, 2, "S") && openerTransferSuit === "H" && shape.counts.S >= 4) {
      return fiveCardHighBidChoiceResult(Pass(), "pass.openerAfterTransferFiveHeartsFourSpadesMinimum", "basic", "Pass with a minimum after responder showed five hearts and four spades.", {
        ...base,
        category: "continuation",
        convention: "jacobyTransfer",
        transferSuit: openerTransferSuit,
        responderSecondSuit: "S",
        support: shape.counts.S || 0,
        range: "15"
      });
    }
    if (openerTransferSuit && bidEquals(responderRebidCall?.bid, 4, "H") && openerTransferSuit === "S" && shape.counts.H >= 3) {
      return fiveCardHighBidChoiceResult(Pass(), "pass.openerAfterTransferTwoFiveMajorsChooseHearts", "basic", "Pass because responder showed two five-card majors and opener prefers hearts.", {
        ...base,
        category: "continuation",
        convention: "jacobyTransfer",
        transferSuit: openerTransferSuit,
        responderSecondSuit: "H",
        support: shape.counts.H || 0
      });
    }
    if (openerTransferSuit && bidEquals(responderRebidCall?.bid, 2, "NT")) {
      return fiveCardHighBidChoiceResult(Pass(), "pass.openerAfterTransferInviteMinimumNoSupport", "basic", "Pass because responder invited after the transfer and opener has a minimum without three-card support.", {
        ...base,
        category: "continuation",
        convention: "jacobyTransfer",
        transferSuit: openerTransferSuit,
        support: shape.counts[openerTransferSuit] || 0,
        range: "15"
      });
    }
    if (openingCall?.seat === seat && bidEquals(openingCall?.bid, 1, "NT") && bidEquals(responseCall?.bid, 2, "C")) {
      const openerRebidBid = openerRebidCall?.bid;
      if (openerRebidBid?.strain === "H" && (bidEquals(responderRebidCall?.bid, 2, "NT") || bidEquals(responderRebidCall?.bid, 3, "NT"))) {
        return fiveCardHighBidChoiceResult(Pass(), "pass.openerAfterStaymanNoHeartFitMinimumNotrump", "basic", "Pass with a minimum after responder denied a heart fit and opener has no spade fit.", {
          ...base,
          category: "continuation",
          convention: "stayman",
          responderDeniedSuit: "H",
          possibleFitSuit: "S",
          support: shape.counts.S || 0,
          range: "15"
        });
      }
    }

    const transferSuit = openingCall?.seat === partnerOf(seat) && (bidEquals(openingCall?.bid, 1, "NT") || bidEquals(openingCall?.bid, 2, "NT"))
      ? notrumpTransferSuit(openingCall.bid, responseCall?.bid)
      : null;
    if (transferSuit) {
      return fiveCardHighBidChoiceResult(Pass(), "pass.responderAfterTransferMinimum", "basic", "Pass after partner accepted the transfer because responder has a minimum hand.", {
        ...base,
        category: "continuation",
        convention: "jacobyTransfer",
        openingLevel: openingCall.bid.level,
        transferSuit,
        suit: transferSuit,
        length: shape.counts[transferSuit] || 0,
        range: openingCall.bid.level === 2 ? "0-3" : "0-7"
      });
    }

    return fiveCardHighBidChoiceResult(Pass(), "pass.continuationNoAction", "basic", "Pass because there is no useful continuation in the current Five-card Major heuristic.", {
      ...base,
      category: "continuation",
      partnerSuit: lastPartnerCall?.bid?.strain || null,
      support: lastPartnerCall?.bid?.strain && lastPartnerCall.bid.strain !== "NT" ? shape.counts[lastPartnerCall.bid.strain] : 0
    });
  }

  function continuationBidBase({ hand, shape, seat, vulnerability, baseExtras }) {
    return {
      hcp: shape.hcp,
      points: shape.points,
      aceCount: countAces(hand),
      balanced: shape.balanced,
      counts: { ...shape.counts },
      vulnerability,
      vulnerable: seat ? isTeamVulnerable(teamOf(seat), vulnerability) : false,
      ...ruleOf20OpeningContext(shape, hand),
      ...baseExtras
    };
  }

  function fiveCardHighBidChoiceResult(bid, ruleName, confidence, reason, extra = {}) {
    return bidChoiceResult(biddingSystems.fiveCardHigh, bid, ruleName, confidence, reason, extra);
  }

  return {
    chooseConstructiveContinuationResult,
    chooseConstructiveContinuationBidTarget,
    describeConstructiveContinuationBidChoice,
    describeConstructiveContinuationPassChoice
  };
});

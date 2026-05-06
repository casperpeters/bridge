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
    deps.competitive || deps.biddingFiveCardHighCompetitive
  );
  if (isCommonJs) module.exports = api;
  root.BridgeRulesParts = root.BridgeRulesParts || {};
  root.BridgeRulesParts.biddingFiveCardHigh = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesBiddingFiveCardHigh(core, auction, contextHelpers, valuationHelpers, legalityHelpers, resultHelpers, conventionHelpers, openingRules, responseRules, rebidRules, competitiveRules) {
  "use strict";

  const {
    suits,
    bidStrains,
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
    normalizeBid,
    sameCall,
    isPass,
    isDouble,
    isRedouble,
    isContractBid,
    highestBidCall,
    highestBid,
    isBidHigher,
    bid,
    bidEquals,
    gameLevel,
    cheapestLevelForStrain,
    nextAvailableBid,
    canDoubleFromAuction,
    canRedoubleFromAuction,
    partnershipContractCalls,
    lastPartnerContractCall
  } = auction;
  const {
    fiveCardHighAuctionPhases,
    auctionContextForFiveCardHigh,
    fourthSuitForAuction,
    isFourthSuitForcingBid
  } = contextHelpers;
  const {
    fitValuationContext,
    fitStrength,
    optionalFitValuationContext,
    suitQuality,
    ruleOf20OpeningContext,
    twoLongestSuitsForRuleOf20,
    hcpInSuit,
    hasStopper
  } = valuationHelpers;
  const { legalizeBidTarget } = legalityHelpers;
  const { bidChoiceResult } = resultHelpers;
  const {
    notrumpTransferSuit,
    chooseFiveCardHighNaturalContinuation,
    chooseResponseSuit,
    chooseSuitByLengthThenRank,
    chooseMajorByLength,
    hasFourCardMajor,
    countAces,
    isBlackwoodAsk,
    blackwoodResponseBidForAceCount,
    blackwoodShownAceCount,
    agreedTrumpAfterAcceptedNotrumpTransfer,
    auctionAgreementFromAuction,
    agreedTrumpFromAuction,
    shouldUseBlackwoodAfterAcceptedTransfer,
    chooseBlackwoodFollowup,
    isOneSuitOpeningFiveCardHigh,
    isOneMinorOpeningFiveCardHigh,
    isWeakTwoOpeningFiveCardHigh,
    supportLengthForOpening,
    minimumOpeningLength,
    chooseOpenerSecondSuit,
    bestSuitByLength
  } = conventionHelpers;
  const auctionAgreementFromAuctionForFiveCardHigh = auctionAgreementFromAuction || agreedTrumpFromAuction;
  const {
    chooseFiveCardHighOpening,
    chooseFiveCardHighOpeningMajor,
    chooseFiveCardHighOpeningMinor,
    chooseFiveCardHighWeakTwo,
    chooseFiveCardHighPreempt,
    describeOpeningBidChoice
  } = openingRules;
  const {
    chooseFiveCardHighResponse,
    respondToOneNotrumpFiveCardHigh,
    respondToTwoNotrumpFiveCardHigh,
    respondToStrongTwoClubsFiveCardHigh,
    respondToWeakTwoFiveCardHigh,
    weakTwoResponseContext,
    respondToPreemptFiveCardHigh,
    preemptResponseContext,
    respondToOneClubFiveCardHigh,
    respondToOneDiamondFiveCardHigh,
    respondToOneMajorFiveCardHigh,
    describeResponseBidChoice
  } = responseRules;
  const {
    chooseFiveCardHighOpenerRebid,
    chooseFiveCardHighResponderRebid,
    chooseFiveCardHighOpenerThirdBid,
    chooseFiveCardHighResponderAfterFourthSuit,
    rebidAfterOneNotrumpResponseFiveCardHigh,
    rebidAfterTwoNotrumpResponseFiveCardHigh,
    rebidAfterStrongTwoClubsFiveCardHigh,
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
    openerAfterMinorOneLevelNewSuitRuleName,
    openerAfterOneDiamondTwoClubsRuleName,
    openerAfterMinorNotrumpResponseRuleName,
    chooseLowerSecondSuitFiveCardHigh,
    openerAfterNotrumpResponseRuleName,
    openerRebidAfterNewSuitFiveCardHigh,
    isSingleRaiseInviteFiveCardHigh,
    rebidResponderAfterSingleRaiseInviteFiveCardHigh,
    rebidResponderAfterOneNotrumpFiveCardHigh,
    rebidResponderAfterTwoNotrumpFiveCardHigh,
    describeOpenerRebidChoice,
    describeResponderRebidChoice,
    describeOpenerThirdBidChoice,
    describeResponderAfterFourthSuitChoice,
    describeNaturalContinuationChoice
  } = rebidRules;
  const {
    chooseCompetitiveFiveCardHighBid,
    chooseOvercallFiveCardHigh,
    describeRedoubleBidChoice,
    describeDoubleBidChoice,
    describeCompetitiveFiveCardHighBidChoice,
    describeTakeoutDoubleRebidChoice,
    respondAfterPartnerOpenedAndOpponentDoubledFiveCardHigh,
    respondAfterOvercallFiveCardHigh,
    shouldMakeInformationDoubleFiveCardHigh,
    shouldMakeNegativeDoubleFiveCardHigh,
    didPartnerMakeOvercall,
    opponentContractBeforePartnerOvercall
  } = competitiveRules;

  function chooseFiveCardHighBid(options = {}) {
      return chooseFiveCardHighBidResult(options).bid;
    }

  function chooseFiveCardHighBidResult(options = {}) {
      const auction = options.auction || [];
      const seat = options.seat;
      const context = options.context || auctionContextForFiveCardHigh(auction, seat);
      const target = chooseFiveCardHighBidTarget({ ...options, auction, seat, context });
      const chosenBid = legalizeBidTarget(target, highestBid(auction), seat, auction);
      return describeFiveCardHighBidChoice({ ...options, auction, seat, context, target, bid: chosenBid });
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
      const takeoutDoubleRebidResult = describeTakeoutDoubleRebidChoice?.(chosenBid, shape, hand, auction, seat, base);
      if (takeoutDoubleRebidResult) return takeoutDoubleRebidResult;
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

        const openingCall = partnershipCalls[0];
        const responseCall = partnershipCalls[1];
        const minorNotrumpResponseContext = minorOpeningNotrumpResponseContext(shape, openingCall?.bid, responseCall?.bid);
        if (openingCall?.seat === seat && minorNotrumpResponseContext) {
          const suffix = responseCall.bid.level === 1 ? "OneNtMinimum" : responseCall.bid.level === 2 ? "TwoNtMinimum" : "ThreeNtPass";
          return fiveCardHighBidChoiceResult(Pass(), `pass.openerMinorAfter${suffix}`, "basic", "Pass after partner's notrump response to a minor opening because opener has no reason to move on.", {
            ...base,
            ...minorNotrumpResponseContext,
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

        if (
          openingCall?.seat === seat &&
          isMajorSingleRaiseFiveCardHigh(openingCall.bid, responseCall?.bid)
        ) {
          return fiveCardHighBidChoiceResult(Pass(), "pass.openerMajorRaiseMinimum", "basic", "Pass after partner's single major raise with 12-15 fit points.", {
            ...base,
            category: "continuation",
            suit: openingCall.bid.strain,
            length: shape.counts[openingCall.bid.strain] || 0,
            ...optionalFitValuationContext(hand, shape, openingCall.bid.strain, supportLengthForOpening(openingCall.bid.strain))
          });
        }
        if (
          openingCall?.seat === seat &&
          isMinorRaiseFiveCardHigh(openingCall.bid, responseCall?.bid)
        ) {
          return fiveCardHighBidChoiceResult(Pass(), "pass.openerMinorRaiseMinimum", "basic", "Pass after partner's minor raise with a minimum opening hand.", {
            ...base,
            category: "continuation",
            suit: openingCall.bid.strain,
            length: shape.counts[openingCall.bid.strain] || 0,
            ...optionalFitValuationContext(hand, shape, openingCall.bid.strain, supportLengthForOpening(openingCall.bid.strain))
          });
        }

        const openerRebidCall = partnershipCalls[2];
        const responderRebidCall = partnershipCalls[3];
        const openerThirdCall = partnershipCalls[4];
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
            return describeOpenerRebidChoice(chosenBid, shape, hand, openingCall.bid, lastPartnerCall.bid, base);
          case fiveCardHighAuctionPhases.responderRebid:
            return describeResponderRebidChoice(chosenBid, shape, openingCall.bid, context.responseCall.bid, lastPartnerCall.bid, base);
          case fiveCardHighAuctionPhases.openerThird:
            return describeOpenerThirdBidChoice(chosenBid, shape, hand, partnershipCalls, base);
          case fiveCardHighAuctionPhases.responderAfterFourthSuit:
            return describeResponderAfterFourthSuitChoice(chosenBid, shape, partnershipCalls, base);
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
            return chooseFiveCardHighOpenerRebid(hand, openingCall.bid, lastPartnerCall.bid);
          case fiveCardHighAuctionPhases.responderRebid:
            return chooseFiveCardHighResponderRebid(hand, openingCall.bid, context.responseCall.bid, lastPartnerCall.bid);
          case fiveCardHighAuctionPhases.openerThird:
            return chooseFiveCardHighOpenerThirdBid(hand, partnershipCalls);
          case fiveCardHighAuctionPhases.responderAfterFourthSuit:
            return chooseFiveCardHighResponderAfterFourthSuit(hand, partnershipCalls);
          case fiveCardHighAuctionPhases.noPartnerBid:
            return Pass();
          default:
            return chooseFiveCardHighNaturalContinuation(hand, lastPartnerCall?.bid, context.lastBid);
        }
      }






  const internal = {
    bidChoiceResult,
    fiveCardHighBidChoiceResult,
    describeFiveCardHighBidChoice,
    describeDoubleBidChoice,
    describePassBidChoice,
    describeUncontestedFiveCardHighBidChoice,
    describeOpeningBidChoice,
    describeResponseBidChoice,
    notrumpTransferSuit,
    describeOpenerRebidChoice,
    describeResponderRebidChoice,
    describeNaturalContinuationChoice,
    describeCompetitiveFiveCardHighBidChoice,
    chooseUncontestedFiveCardHighBid,
    chooseFiveCardHighOpeningMajor,
    chooseFiveCardHighOpeningMinor,
    chooseFiveCardHighWeakTwo,
    chooseFiveCardHighPreempt,
    respondToOneNotrumpFiveCardHigh,
    respondToTwoNotrumpFiveCardHigh,
    respondToStrongTwoClubsFiveCardHigh,
    respondToWeakTwoFiveCardHigh,
    preemptResponseContext,
    respondToPreemptFiveCardHigh,
    respondToOneClubFiveCardHigh,
    respondToOneDiamondFiveCardHigh,
    respondToOneMajorFiveCardHigh,
    rebidAfterOneNotrumpResponseFiveCardHigh,
    rebidAfterTwoNotrumpResponseFiveCardHigh,
    rebidAfterStrongTwoClubsFiveCardHigh,
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
    openerAfterMinorNotrumpResponseRuleName,
    chooseLowerSecondSuitFiveCardHigh,
    openerAfterNotrumpResponseRuleName,
    openerRebidAfterNewSuitFiveCardHigh,
    isSingleRaiseInviteFiveCardHigh,
    rebidResponderAfterSingleRaiseInviteFiveCardHigh,
    rebidResponderAfterOneNotrumpFiveCardHigh,
    rebidResponderAfterTwoNotrumpFiveCardHigh,
    chooseFiveCardHighOpenerThirdBid,
    chooseFiveCardHighResponderAfterFourthSuit,
    chooseCompetitiveFiveCardHighBid,
    chooseOvercallFiveCardHigh,
    respondAfterPartnerOpenedAndOpponentDoubledFiveCardHigh,
    respondAfterOvercallFiveCardHigh,
    shouldMakeInformationDoubleFiveCardHigh,
    shouldMakeNegativeDoubleFiveCardHigh,
    chooseFiveCardHighNaturalContinuation,
    chooseResponseSuit,
    chooseSuitByLengthThenRank,
    chooseMajorByLength,
    hasFourCardMajor,
    countAces,
    isBlackwoodAsk,
    blackwoodResponseBidForAceCount,
    blackwoodShownAceCount,
    agreedTrumpAfterAcceptedNotrumpTransfer,
    auctionAgreementFromAuction,
    agreedTrumpFromAuction,
    shouldUseBlackwoodAfterAcceptedTransfer,
    chooseBlackwoodFollowup,
    isOneSuitOpeningFiveCardHigh,
    isOneMinorOpeningFiveCardHigh,
    isWeakTwoOpeningFiveCardHigh,
    supportLengthForOpening,
    minimumOpeningLength,
    chooseOpenerSecondSuit,
    bestSuitByLength,
    auctionContextForFiveCardHigh,
    fiveCardHighAuctionPhases,
    fourthSuitForAuction,
    isFourthSuitForcingBid,
    suitQuality,
    ruleOf20OpeningContext,
    twoLongestSuitsForRuleOf20,
    hcpInSuit,
    hasStopper
  };

  return {
    chooseFiveCardHighBid,
    chooseFiveCardHighBidResult,
    chooseFiveCardHighBidTarget,
    chooseFiveCardHighOpening,
    chooseFiveCardHighResponse,
    chooseFiveCardHighOpenerRebid,
    chooseFiveCardHighResponderRebid,
    _internal: internal
  };
});

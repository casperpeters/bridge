(function initBridgeRulesBiddingFiveCardHigh(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const deps = isCommonJs
    ? {
        core: require("./core.js"),
        auction: require("./auction.js"),
        context: require("./bidding-five-card-high-context.js"),
        valuation: require("./bidding-five-card-high-valuation.js")
      }
    : root.BridgeRulesParts || {};
  const api = factory(deps.core, deps.auction, deps.context || deps.biddingFiveCardHighContext, deps.valuation || deps.biddingFiveCardHighValuation);
  if (isCommonJs) module.exports = api;
  root.BridgeRulesParts = root.BridgeRulesParts || {};
  root.BridgeRulesParts.biddingFiveCardHigh = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesBiddingFiveCardHigh(core, auction, contextHelpers, valuationHelpers) {
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
    legalizeFiveCardHighBidTarget,
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

  function chooseFiveCardHighBid(options = {}) {
      return chooseFiveCardHighBidResult(options).bid;
    }

  function chooseFiveCardHighBidResult(options = {}) {
      const auction = options.auction || [];
      const seat = options.seat;
      const context = options.context || auctionContextForFiveCardHigh(auction, seat);
      const target = chooseFiveCardHighBidTarget({ ...options, auction, seat, context });
      const chosenBid = legalizeFiveCardHighBidTarget(target, highestBid(auction), seat, auction);
      return describeFiveCardHighBidChoice({ ...options, auction, seat, context, target, bid: chosenBid });
    }

  function bidChoiceResult(system, bid, ruleName, confidence, reason, extra = {}) {
      const systemId = typeof system === "string" ? system : system?.id;
      return {
        bid,
        ruleId: `${systemId}.${ruleName}`,
        confidence,
        reason,
        system: systemId,
        ...extra
      };
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
        balanced: shape.balanced,
        counts: { ...shape.counts },
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
      if (isRedouble(chosenBid)) {
        return fiveCardHighBidChoiceResult(chosenBid, "competitive.redouble", "basic", "Redouble with extra values after the opponents doubled partner's side.", base);
      }
      if (isDouble(chosenBid)) {
        return describeDoubleBidChoice(chosenBid, shape, auction, seat, base);
      }
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

  function describeDoubleBidChoice(chosenBid, shape, auction, seat, base) {
        const lastBid = highestBid(auction);
        const lastPartnerCall = lastPartnerContractCall(auction, seat);
        if (lastPartnerCall && shouldMakeNegativeDoubleFiveCardHigh(shape, lastPartnerCall.bid, lastBid)) {
          return fiveCardHighBidChoiceResult(chosenBid, "competitive.negativeDouble", "basic", "Negative double with values and an unbid four-card major after interference.", base);
        }
        return fiveCardHighBidChoiceResult(chosenBid, "competitive.takeoutDouble", "basic", "Takeout double with opening strength, shortness in their suit, and tolerance for the unbid suits.", base);
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

  function describeOpeningBidChoice(chosenBid, shape, hand, base) {
        const ruleOf20 = ruleOf20OpeningContext(shape, hand);
        const extra = { ...base, ...ruleOf20, category: "opening", suit: chosenBid.strain, length: shape.counts[chosenBid.strain] || 0 };
        if (bidEquals(chosenBid, 1, "NT")) {
          return fiveCardHighBidChoiceResult(chosenBid, "opening.oneNotrump", "basic", "Open 1NT with 15-17 HCP and a balanced hand.", extra);
        }
        if (bidEquals(chosenBid, 2, "NT")) {
          return fiveCardHighBidChoiceResult(chosenBid, "opening.twoNotrump", "basic", "Open 2NT with 20-22 HCP and a balanced hand.", extra);
        }
        if (bidEquals(chosenBid, 2, "C")) {
          return fiveCardHighBidChoiceResult(chosenBid, "opening.strongTwoClubs", "basic", "Open a strong artificial 2C with a very strong hand.", extra);
        }
        if (chosenBid.level === 2 && ["D", "H", "S"].includes(chosenBid.strain)) {
          return fiveCardHighBidChoiceResult(chosenBid, "opening.weakTwo", "basic", "Open a weak two with 6-10 HCP and a good six-card suit.", extra);
        }
        if (chosenBid.level >= 3 && chosenBid.strain !== "NT") {
          return fiveCardHighBidChoiceResult(chosenBid, "opening.preempt", "basic", "Preempt with a long suit and limited strength.", extra);
        }
        if (shape.hcp < 12 && ruleOf20.ruleOf20Eligible) {
          const suffix = chosenBid.strain === "H" || chosenBid.strain === "S" ? "OneMajor" : "OneMinor";
          return fiveCardHighBidChoiceResult(chosenBid, `opening.ruleOf20${suffix}`, "basic", "Open with fewer than 12 HCP because the Rule of 20 is met and most values are in the two long suits.", extra);
        }
        if (chosenBid.level === 1 && (chosenBid.strain === "H" || chosenBid.strain === "S")) {
          return fiveCardHighBidChoiceResult(chosenBid, "opening.oneMajor", "basic", "Open the longest available five-card major with opening strength.", extra);
        }
        if (chosenBid.level === 1 && (chosenBid.strain === "C" || chosenBid.strain === "D")) {
          return fiveCardHighBidChoiceResult(chosenBid, "opening.oneMinor", "basic", "Open the preferred minor because there is no five-card major or notrump opening.", extra);
        }
        return fiveCardHighBidChoiceResult(chosenBid, "opening.natural", "basic", "Open naturally in the selected strain.", extra);
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
            return fiveCardHighBidChoiceResult(chosenBid, invite ? "response.notrumpInvite" : "response.notrumpGame", "basic", "Invite or bid game in notrump with balanced values.", extra);
          }
        }

        if (bidEquals(partnerBid, 2, "C")) {
          if (bidEquals(chosenBid, 2, "D")) {
            return fiveCardHighBidChoiceResult(chosenBid, "response.strongTwoClubsWaiting", "basic", "Make the waiting response to partner's strong 2C opening.", extra);
          }
          return fiveCardHighBidChoiceResult(chosenBid, "response.strongTwoClubsPositive", "basic", "Show a positive response to partner's strong 2C opening.", extra);
        }

        if (isWeakTwoOpeningFiveCardHigh(partnerBid) || (partnerBid?.level >= 3 && partnerBid.strain !== "NT")) {
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
          const ruleName = openerAfterMinorOneLevelNewSuitRuleName(chosenBid, openingBid, responseBid);
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

  function chooseFiveCardHighBidTarget({ hand = [], auction = [], seat, vulnerability = "none", context } = {}) {
      if (!seat) return Pass();
      const bidContext = context || auctionContextForFiveCardHigh(auction, seat);
      const target = bidContext.uncontested
        ? chooseUncontestedFiveCardHighBid(hand, auction, seat, bidContext)
        : chooseCompetitiveFiveCardHighBid(hand, auction, seat, vulnerability);
      return normalizeBid(target) || Pass();
    }

  function chooseUncontestedFiveCardHighBid(hand, auction, seat, context = auctionContextForFiveCardHigh(auction, seat)) {
        const partnershipCalls = context.partnershipCalls;
        const openingCall = context.openingCall;
        const lastPartnerCall = context.lastPartnerCall;

        switch (context.phase) {
          case fiveCardHighAuctionPhases.opening:
            return chooseFiveCardHighOpening(hand);
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

  function chooseFiveCardHighOpening(hand) {
        const shape = handShape(hand);

        if (shape.balanced) {
          if (shape.hcp >= 23) return bid(2, "C");
          if (shape.hcp >= 20 && shape.hcp <= 22) return bid(2, "NT");
          if (shape.hcp >= 15 && shape.hcp <= 17) return bid(1, "NT");
        }

        if (shape.hcp >= 20 || shape.points >= 20) return bid(2, "C");

        const weakTwo = chooseFiveCardHighWeakTwo(shape, hand);
        if (weakTwo) return weakTwo;

        const preempt = chooseFiveCardHighPreempt(shape, hand);
        if (preempt) return preempt;

        const ruleOf20 = ruleOf20OpeningContext(shape, hand);
        if ((shape.hcp < 12 && !ruleOf20.ruleOf20Eligible) || shape.hcp > 19) return Pass();

        const major = chooseFiveCardHighOpeningMajor(shape);
        if (major) return bid(1, major);
        return bid(1, chooseFiveCardHighOpeningMinor(shape));
      }

  function chooseFiveCardHighOpeningMajor(shape) {
        const counts = shape.counts;
        const longestMajor = Math.max(counts.H, counts.S);
        const longestMinor = Math.max(counts.C, counts.D);
        if (longestMajor < 5 || longestMinor > longestMajor) return null;
        if (counts.S >= 5 && counts.S >= counts.H) return "S";
        if (counts.H >= 5) return "H";
        return null;
      }

  function chooseFiveCardHighOpeningMinor(shape) {
        const counts = shape.counts;
        if (counts.C >= 5 && counts.D >= 5) return "D";
        if (counts.D > counts.C && counts.D >= 4) return "D";
        if (counts.C > counts.D && counts.C >= 4) return "C";
        if (counts.C === 4 && counts.D === 4) return "C";
        if (counts.D >= 4) return "D";
        return "C";
      }

  function chooseFiveCardHighWeakTwo(shape, hand) {
        if (shape.hcp < 6 || shape.hcp > 10) return null;
        const suit = chooseSuitByLengthThenRank(["S", "H", "D"], shape, 6, true, (candidate) => shape.counts[candidate] === 6 && suitQuality(hand, candidate) >= 2);
        return suit ? bid(2, suit) : null;
      }

  function chooseFiveCardHighPreempt(shape, hand) {
        if (shape.hcp < 6 || shape.hcp > 10) return null;
        const suit = chooseSuitByLengthThenRank(["S", "H", "D", "C"], shape, 7, true, (candidate) => shape.counts[candidate] >= 7 && suitQuality(hand, candidate) >= 2);
        if (!suit) return null;
        return bid(shape.counts[suit] >= 8 ? 4 : 3, suit);
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
        if (shape.hcp >= 10) return bid(3, "NT");
        if (shape.hcp >= 8) return bid(2, "NT");
        return Pass();
      }

  function respondToTwoNotrumpFiveCardHigh(shape) {
        const transferMajor = chooseMajorByLength(shape, 5);
        if (transferMajor === "H") return bid(3, "D");
        if (transferMajor === "S") return bid(3, "H");
        if (hasFourCardMajor(shape) && shape.hcp >= 1) return bid(3, "C");
        if (shape.hcp >= 4) return bid(3, "NT");
        return Pass();
      }

  function respondToStrongTwoClubsFiveCardHigh(shape, hand) {
        if (shape.hcp <= 7) return bid(2, "D");
        const suit = chooseSuitByLengthThenRank(["S", "H", "D", "C"], shape, 5, true, (candidate) => suitQuality(hand, candidate) >= 2);
        if (suit === "H" || suit === "S") return bid(2, suit);
        if (suit === "C" || suit === "D") return bid(3, suit);
        return bid(2, "NT");
      }

  function respondToWeakTwoFiveCardHigh(shape, hand, partnerBid) {
        const support = shape.counts[partnerBid.strain];
        const supportStrength = fitStrength(hand, shape, partnerBid.strain, 6);
        if (supportStrength >= 15) {
          if (support >= 3) return bid(gameLevel(partnerBid.strain), partnerBid.strain);
          if (shape.balanced) return bid(2, "NT");
        }
        const newSuit = chooseSuitByLengthThenRank(suits.filter((suit) => suit !== partnerBid.strain), shape, 5, true, (candidate) => suitQuality(hand, candidate) >= 2);
        if (newSuit && shape.hcp >= 10) return bid(cheapestLevelForStrain(newSuit, partnerBid), newSuit);
        if (support >= 3 && supportStrength >= 10) return bid(partnerBid.level + 1, partnerBid.strain);
        return Pass();
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

  function chooseFiveCardHighOpenerRebid(hand, openingBid, responseBid) {
        const shape = handShape(hand);
        if (bidEquals(openingBid, 1, "NT")) return rebidAfterOneNotrumpResponseFiveCardHigh(shape, responseBid);
        if (bidEquals(openingBid, 2, "NT")) return rebidAfterTwoNotrumpResponseFiveCardHigh(shape, responseBid);
        if (bidEquals(openingBid, 2, "C")) return rebidAfterStrongTwoClubsFiveCardHigh(shape, hand);
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
        const suit = chooseSuitByLengthThenRank(["S", "H", "D", "C"], shape, 5, true) || bestSuitByLength(shape);
        return bid(suit === "C" || suit === "D" ? 3 : 2, suit);
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

  function openerAfterMinorOneLevelNewSuitRuleName(chosenBid, openingBid, responseBid) {
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
          return !isReverseRebidFiveCardHigh(openingBid, nextBid) || shape.hcp >= 16;
        });
        if (secondSuit) return bid(cheapestLevelForStrain(secondSuit, responseBid), secondSuit);
        return bid(cheapestLevelForStrain("NT", responseBid), "NT");
      }

  function openerRebidAfterOneDiamondTwoClubsFiveCardHigh(shape) {
        if (shape.counts.C >= 4 && shape.hcp <= 14) return bid(3, "C");
        if (shape.counts.D >= 6) return bid(shape.hcp >= 15 ? 3 : 2, "D");
        return bid(shape.hcp >= 15 ? 3 : 2, "NT");
      }

  function chooseFiveCardHighResponderRebid(hand, openingBid, responseBid, openerRebid) {
        const shape = handShape(hand);
        if (bidEquals(openingBid, 1, "NT")) return rebidResponderAfterOneNotrumpFiveCardHigh(shape, responseBid, openerRebid);
        if (bidEquals(openingBid, 2, "NT")) return rebidResponderAfterTwoNotrumpFiveCardHigh(shape, responseBid, openerRebid);
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

  function rebidResponderAfterOneNotrumpFiveCardHigh(shape, responseBid, openerRebid) {
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
          if (shape.counts[transferSuit] >= 6) {
            if (shape.hcp >= 10) return bid(4, transferSuit);
            if (shape.hcp >= 8) return bid(3, transferSuit);
            return Pass();
          }
          if (shape.hcp >= 10) return bid(3, "NT");
          if (shape.hcp >= 8) {
            if (transferSuit === "H" && shape.counts.S >= 4) return bid(2, "S");
            if (transferSuit === "S" && shape.counts.H >= 4) return bid(3, "H");
            return bid(2, "NT");
          }
          return Pass();
        }
        return Pass();
      }

  function rebidResponderAfterTwoNotrumpFiveCardHigh(shape, responseBid, openerRebid) {
        if (bidEquals(responseBid, 3, "C")) {
          if ((openerRebid.strain === "H" || openerRebid.strain === "S") && shape.counts[openerRebid.strain] >= 4) return bid(4, openerRebid.strain);
          return bid(3, "NT");
        }
        const transferSuit = bidEquals(responseBid, 3, "D") ? "H" : bidEquals(responseBid, 3, "H") ? "S" : null;
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
        if (!responderRebid) return Pass();

        if (isFourthSuitForcingBid(openingBid, responseBid, openerRebid, responderRebid)) {
          return rebidOpenerAfterFourthSuitFiveCardHigh(shape, hand, openingBid, responseBid, openerRebid, responderRebid);
        }

        if (!bidEquals(openingBid, 1, "NT")) return Pass();

        if (bidEquals(responseBid, 2, "C")) {
          if (bidEquals(responderRebid, 2, "NT")) return shape.hcp >= 16 ? bid(3, "NT") : Pass();
          if ((responderRebid.strain === "H" || responderRebid.strain === "S") && responderRebid.level === 3) {
            return shape.hcp >= 16 ? bid(4, responderRebid.strain) : Pass();
          }
        }

        const transferSuit = bidEquals(responseBid, 2, "D") ? "H" : bidEquals(responseBid, 2, "H") ? "S" : null;
        if (!transferSuit) return Pass();
        const hasThreeCardSupport = shape.counts[transferSuit] >= 3;
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

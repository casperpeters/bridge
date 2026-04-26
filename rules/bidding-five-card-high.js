(function initBridgeRulesBiddingFiveCardHigh(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const deps = isCommonJs
    ? { core: require("./core.js"), auction: require("./auction.js") }
    : root.BridgeRulesParts || {};
  const api = factory(deps.core, deps.auction);
  if (isCommonJs) module.exports = api;
  root.BridgeRulesParts = root.BridgeRulesParts || {};
  root.BridgeRulesParts.biddingFiveCardHigh = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesBiddingFiveCardHigh(core, auction) {
  "use strict";

  const {
    suits,
    bidStrains,
    biddingSystems,
    rankOrder,
    hcpValue,
    countSuits,
    hcp,
    handShape,
    teamOf,
    partnerOf,
    isTeamVulnerable
  } = core;
  const {
    callTypes,
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
    lastPartnerContractCall,
    isUncontestedAuctionForSeat
  } = auction;

  function chooseFiveCardHighBid(options = {}) {
      return chooseFiveCardHighBidResult(options).bid;
    }

  function chooseFiveCardHighBidResult(options = {}) {
      const auction = options.auction || [];
      const seat = options.seat;
      const target = chooseFiveCardHighBidTarget(options);
      const chosenBid = legalizeFiveCardHighBidTarget(target, highestBid(auction), seat, auction);
      return describeFiveCardHighBidChoice({ ...options, auction, seat, target, bid: chosenBid });
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

  function describeFiveCardHighBidChoice({ hand = [], auction = [], seat, vulnerability = "none", target, bid: chosenBid } = {}) {
      const shape = handShape(hand);
      const base = {
        hcp: shape.hcp,
        points: shape.points,
        balanced: shape.balanced,
        counts: { ...shape.counts }
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
        return describePassBidChoice(shape, auction, seat, base);
      }
      if (!isContractBid(chosenBid)) {
        return fiveCardHighBidChoiceResult(chosenBid, "pass.unknownCall", "basic", "The bidding engine did not recognize a contract action.", base);
      }
      if (isUncontestedAuctionForSeat(auction, seat)) {
        return describeUncontestedFiveCardHighBidChoice(chosenBid, shape, hand, auction, seat, base);
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

  function describePassBidChoice(shape, auction, seat, base) {
        if (!isUncontestedAuctionForSeat(auction, seat)) {
          return fiveCardHighBidChoiceResult(Pass(), "pass.competitiveNoAction", "basic", "Pass because there is no responsible overcall, raise, notrump action, or double in the current competitive auction.", {
            ...base,
            category: "competitive"
          });
        }

        const partnershipCalls = partnershipContractCalls(auction, seat);
        if (!partnershipCalls.length) {
          return fiveCardHighBidChoiceResult(Pass(), "pass.openingNoAction", "basic", "Pass because the hand lacks normal opening strength and has no suitable weak two or preempt.", {
            ...base,
            category: "opening"
          });
        }

        const lastPartnerCall = lastPartnerContractCall(auction, seat);
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
          return fiveCardHighBidChoiceResult(Pass(), "pass.openerMajorRaiseMinimum", "basic", "Pass after partner's single major raise with 12-15 total points.", {
            ...base,
            category: "continuation",
            suit: openingCall.bid.strain,
            length: shape.counts[openingCall.bid.strain] || 0
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
            length: shape.counts[openingCall.bid.strain] || 0
          });
        }

        const openerRebidCall = partnershipCalls[2];
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

  function describeUncontestedFiveCardHighBidChoice(chosenBid, shape, hand, auction, seat, base) {
        const partnershipCalls = partnershipContractCalls(auction, seat);
        if (!partnershipCalls.length) return describeOpeningBidChoice(chosenBid, shape, hand, base);

        const openingCall = partnershipCalls[0];
        const lastPartnerCall = lastPartnerContractCall(auction, seat);
        if (!lastPartnerCall) {
          return fiveCardHighBidChoiceResult(chosenBid, "pass.noPartnerBid", "basic", "No partner bid was available to answer.", base);
        }
        if (partnershipCalls.length === 1) {
          return describeResponseBidChoice(chosenBid, shape, hand, openingCall.bid, base);
        }
        if (partnershipCalls.length === 2 && openingCall.seat === seat) {
          return describeOpenerRebidChoice(chosenBid, shape, openingCall.bid, lastPartnerCall.bid, base);
        }
        if (partnershipCalls.length === 3 && openingCall.seat === partnerOf(seat)) {
          return describeResponderRebidChoice(chosenBid, shape, partnershipCalls[1].bid, lastPartnerCall.bid, base);
        }
        return describeNaturalContinuationChoice(chosenBid, shape, lastPartnerCall.bid, base);
      }

  function describeOpeningBidChoice(chosenBid, shape, hand, base) {
        const extra = { ...base, category: "opening", suit: chosenBid.strain, length: shape.counts[chosenBid.strain] || 0 };
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
            return fiveCardHighBidChoiceResult(chosenBid, "response.raisePreempt", "basic", "Raise partner's long suit with support and enough strength.", extra);
          }
          if (chosenBid.strain === "NT") {
            return fiveCardHighBidChoiceResult(chosenBid, "response.notrumpOverPreempt", "basic", "Choose notrump with extra balanced strength opposite partner's preempt.", extra);
          }
          return fiveCardHighBidChoiceResult(chosenBid, "response.newSuitOverPreempt", "basic", "Show a strong new suit opposite partner's preempt.", extra);
        }

        if (partnerBid?.strain !== "NT" && chosenBid.strain === partnerBid?.strain) {
          return fiveCardHighBidChoiceResult(chosenBid, "response.raise", "basic", "Raise partner's suit with enough support.", extra);
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

  function describeOpenerRebidChoice(chosenBid, shape, openingBid, responseBid, base) {
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
                ? "Bid game after partner's single major raise with 18-19 total points."
                : "Invite after partner's single major raise with 16-17 total points.",
              extra
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
            return fiveCardHighBidChoiceResult(chosenBid, ruleName, "basic", reason, extra);
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

  function describeResponderRebidChoice(chosenBid, shape, responseBid, openerRebid, base) {
        const extra = {
          ...base,
          category: "continuation",
          suit: chosenBid.strain,
          length: shape.counts[chosenBid.strain] || 0,
          responseSuit: responseBid?.strain || null,
          openerRebidSuit: openerRebid?.strain || null,
          partnerSuit: openerRebid?.strain || null,
          support: openerRebid?.strain && openerRebid.strain !== "NT" ? shape.counts[openerRebid.strain] : 0
        };
        if (
          isSingleRaiseInviteFiveCardHigh(responseBid, openerRebid) &&
          chosenBid.strain === openerRebid.strain &&
          chosenBid.level === gameLevel(openerRebid.strain)
        ) {
          return fiveCardHighBidChoiceResult(chosenBid, "continuation.acceptMajorInvite", "basic", "Accept partner's invitational raise with the upper range for the single raise.", extra);
        }
        if (openerRebid?.strain !== "NT" && chosenBid.strain === openerRebid?.strain) {
          return fiveCardHighBidChoiceResult(chosenBid, "continuation.raisePartner", "basic", "Raise opener's shown suit with a fit.", extra);
        }
        if (chosenBid.strain === "NT") {
          return fiveCardHighBidChoiceResult(chosenBid, "continuation.notrumpRebid", "basic", "Place the contract in notrump with balanced values.", extra);
        }
        return fiveCardHighBidChoiceResult(chosenBid, "continuation.newSuit", "basic", "Continue naturally with the best available suit.", extra);
      }

  function describeNaturalContinuationChoice(chosenBid, shape, partnerBid, base) {
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
          return fiveCardHighBidChoiceResult(chosenBid, "continuation.raisePartner", "basic", "Support partner's suit in the ongoing auction.", extra);
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

        if (
          lastPartnerCall?.bid?.strain !== "NT" &&
          chosenBid.strain === lastPartnerCall?.bid?.strain &&
          partnerOvercall
        ) {
          const minimumHcp = vulnerable ? 8 : 7;
          return fiveCardHighBidChoiceResult(chosenBid, "competitive.raisePartnerOvercall", "basic", `Raise partner's overcall with a fit and ${minimumHcp}+ HCP${vulnerable ? " when vulnerable" : " when not vulnerable"}.`, {
            ...extra,
            support: shape.counts[lastPartnerCall.bid.strain] || 0,
            minimumHcp
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
          return fiveCardHighBidChoiceResult(chosenBid, "competitive.raisePartner", "basic", "Compete by raising partner's suit with support.", extra);
        }
        if (chosenBid.strain === "NT") {
          return fiveCardHighBidChoiceResult(chosenBid, "competitive.notrump", "basic", "Bid notrump competitively with balanced strength and a stopper.", extra);
        }
        return fiveCardHighBidChoiceResult(chosenBid, "competitive.newSuit", "basic", "Compete naturally in a new suit.", extra);
      }

  function chooseFiveCardHighBidTarget({ hand = [], auction = [], seat, vulnerability = "none" } = {}) {
      if (!seat) return Pass();
      const target = isUncontestedAuctionForSeat(auction, seat)
        ? chooseUncontestedFiveCardHighBid(hand, auction, seat)
        : chooseCompetitiveFiveCardHighBid(hand, auction, seat, vulnerability);
      return normalizeBid(target) || Pass();
    }

  function chooseUncontestedFiveCardHighBid(hand, auction, seat) {
        const partnershipCalls = partnershipContractCalls(auction, seat);
        if (!partnershipCalls.length) return chooseFiveCardHighOpening(hand);

        const lastPartnerCall = lastPartnerContractCall(auction, seat);
        if (!lastPartnerCall) return Pass();

        const openingCall = partnershipCalls[0];
        if (partnershipCalls.length === 1) return chooseFiveCardHighResponse(hand, openingCall.bid);
        if (partnershipCalls.length === 2 && openingCall.seat === seat) {
          return chooseFiveCardHighOpenerRebid(hand, openingCall.bid, lastPartnerCall.bid);
        }
        if (partnershipCalls.length === 3 && openingCall.seat === partnerOf(seat)) {
          return chooseFiveCardHighResponderRebid(hand, openingCall.bid, partnershipCalls[1].bid, lastPartnerCall.bid);
        }
        if (partnershipCalls.length >= 4 && openingCall.seat === seat) {
          return chooseFiveCardHighOpenerThirdBid(hand, partnershipCalls);
        }

        return chooseFiveCardHighNaturalContinuation(hand, lastPartnerCall.bid, highestBid(auction));
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

        if (shape.hcp < 12 || shape.hcp > 19) return Pass();

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
        if (partnerBid.level >= 3 && partnerBid.strain !== "NT") return respondToPreemptFiveCardHigh(shape, partnerBid);
        if (bidEquals(partnerBid, 1, "C")) return respondToOneClubFiveCardHigh(shape);
        if (bidEquals(partnerBid, 1, "D")) return respondToOneDiamondFiveCardHigh(shape);
        if (bidEquals(partnerBid, 1, "H")) return respondToOneMajorFiveCardHigh(shape, "H");
        if (bidEquals(partnerBid, 1, "S")) return respondToOneMajorFiveCardHigh(shape, "S");
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
        if (shape.hcp >= 15) {
          if (support >= 3) return bid(gameLevel(partnerBid.strain), partnerBid.strain);
          if (shape.balanced) return bid(2, "NT");
        }
        const newSuit = chooseSuitByLengthThenRank(suits.filter((suit) => suit !== partnerBid.strain), shape, 5, true, (candidate) => suitQuality(hand, candidate) >= 2);
        if (newSuit && shape.hcp >= 10) return bid(cheapestLevelForStrain(newSuit, partnerBid), newSuit);
        if (support >= 3 && shape.hcp >= 10) return bid(partnerBid.level + 1, partnerBid.strain);
        return Pass();
      }

  function respondToPreemptFiveCardHigh(shape, partnerBid) {
        if (shape.counts[partnerBid.strain] >= 3 && shape.hcp >= 12) return bid(gameLevel(partnerBid.strain), partnerBid.strain);
        if (shape.balanced && shape.hcp >= 16) return bid(3, "NT");
        return Pass();
      }

  function respondToOneClubFiveCardHigh(shape) {
        if (shape.hcp < 6) return Pass();
        const newSuit = chooseResponseSuit(["D", "H", "S"], shape, 4);
        if (newSuit) return bid(1, newSuit);
        if (shape.counts.C >= 5) {
          if (shape.hcp <= 9) return bid(2, "C");
          if (shape.hcp <= 11) return bid(3, "C");
          return shape.balanced ? bid(3, "NT") : bid(4, "C");
        }
        if (shape.hcp <= 9) return bid(1, "NT");
        if (shape.hcp <= 11) return bid(2, "NT");
        return bid(3, "NT");
      }

  function respondToOneDiamondFiveCardHigh(shape) {
        if (shape.hcp < 6) return Pass();
        const major = chooseResponseSuit(["H", "S"], shape, 4);
        if (major) return bid(1, major);
        const clubs = shape.counts.C >= 5 && shape.hcp >= 10 ? "C" : null;
        if (clubs) return bid(2, "C");
        if (shape.counts.D >= 4) {
          if (shape.hcp <= 9) return bid(2, "D");
          if (shape.hcp <= 11) return bid(3, "D");
          return shape.balanced ? bid(3, "NT") : bid(4, "D");
        }
        if (shape.hcp <= 9) return bid(1, "NT");
        if (shape.hcp <= 11) return bid(2, "NT");
        return bid(3, "NT");
      }

  function respondToOneMajorFiveCardHigh(shape, openingMajor) {
        if (shape.hcp < 6) return Pass();

        const support = shape.counts[openingMajor] >= 3;
        if (support) {
          if (shape.hcp >= 12) return bid(4, openingMajor);
          if (shape.hcp >= 10) return bid(3, openingMajor);
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
        if (isOneSuitOpeningFiveCardHigh(openingBid)) return rebidAfterOneSuitOpeningFiveCardHigh(shape, openingBid, responseBid);
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

  function rebidAfterOneSuitOpeningFiveCardHigh(shape, openingBid, responseBid) {
        if (responseBid.strain === openingBid.strain) return openerRebidAfterRaiseFiveCardHigh(shape, openingBid, responseBid);
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

  function openerRebidAfterRaiseFiveCardHigh(shape, openingBid, responseBid) {
        if (responseBid.level >= gameLevel(openingBid.strain)) return Pass();
        if (isMinorRaiseFiveCardHigh(openingBid, responseBid)) return openerRebidAfterMinorRaiseFiveCardHigh(shape, openingBid, responseBid);
        if (responseBid.level === 3) return shape.hcp >= 14 ? bid(gameLevel(openingBid.strain), openingBid.strain) : Pass();
        if (isMajorSingleRaiseFiveCardHigh(openingBid, responseBid)) {
          if (shape.points >= 18) return bid(gameLevel(openingBid.strain), openingBid.strain);
          if (shape.points >= 16) return bid(3, openingBid.strain);
          return Pass();
        }
        return Pass();
      }

  function openerRebidAfterMinorRaiseFiveCardHigh(shape, openingBid, responseBid) {
        if (responseBid.level === 2) {
          if (shape.hcp >= 18) return shape.balanced ? bid(3, "NT") : bid(gameLevel(openingBid.strain), openingBid.strain);
          if (shape.hcp >= 15) return bid(3, openingBid.strain);
          return Pass();
        }
        if (responseBid.level === 3) {
          if (shape.hcp >= 14) return shape.balanced ? bid(3, "NT") : bid(gameLevel(openingBid.strain), openingBid.strain);
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
        if (isOneSuitOpeningFiveCardHigh(openingBid)) return chooseFiveCardHighNaturalContinuation(hand, openerRebid, openerRebid);
        return Pass();
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
        const responderRebid = partnershipCalls[3]?.bid;
        if (!responderRebid || !bidEquals(openingBid, 1, "NT")) return Pass();

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
          if (isDouble(lastCall)) return respondAfterPartnerOpenedAndOpponentDoubledFiveCardHigh(shape, lastPartnerCall.bid);
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

  function respondAfterPartnerOpenedAndOpponentDoubledFiveCardHigh(shape, partnerBid) {
        const support = partnerBid.strain !== "NT" && shape.counts[partnerBid.strain] >= supportLengthForOpening(partnerBid.strain);
        if (support && shape.hcp >= 10) return bid(2, "NT");
        if (support && shape.hcp >= 6) return bid(Math.min(partnerBid.level + 1, gameLevel(partnerBid.strain)), partnerBid.strain);
        if (shape.hcp >= 10) return Redouble();
        const newSuit = chooseSuitByLengthThenRank(suits.filter((suit) => suit !== partnerBid.strain), shape, 5, true);
        if (newSuit && shape.hcp >= 6) return bid(cheapestLevelForStrain(newSuit, partnerBid), newSuit);
        return Pass();
      }

  function respondToPartnerOvercallFiveCardHigh(shape, hand, partnerBid, auction, seat, vulnerability = "none") {
        if (!partnerBid || partnerBid.strain === "NT") return Pass();
        const opponentCall = opponentContractBeforePartnerOvercall(auction, seat);
        const opponentBid = opponentCall?.bid || null;
        const support = shape.counts[partnerBid.strain] >= supportLengthForOpening(partnerBid.strain);
        const vulnerable = isTeamVulnerable(teamOf(seat), vulnerability);
        const minimumHcp = vulnerable ? 8 : 7;
        if (support && shape.hcp >= minimumHcp) {
          const supportLevel = cheapestLevelForStrain(partnerBid.strain, highestBid(auction));
          if (supportLevel > gameLevel(partnerBid.strain)) return Pass();
          if (shape.hcp >= 16) return bid(gameLevel(partnerBid.strain), partnerBid.strain);
          if (supportLevel >= gameLevel(partnerBid.strain)) return Pass();
          if (shape.hcp >= 10) return bid(Math.max(supportLevel, 3), partnerBid.strain);
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

  function respondAfterOvercallFiveCardHigh(shape, hand, partnerBid, opponentBid, auction, seat) {
        const support = partnerBid.strain !== "NT" && shape.counts[partnerBid.strain] >= supportLengthForOpening(partnerBid.strain);
        if (support) {
          if (shape.hcp >= 12) return bid(gameLevel(partnerBid.strain), partnerBid.strain);
          if (shape.hcp >= 10) return bid(3, partnerBid.strain);
          if (shape.hcp >= 6) return bid(2, partnerBid.strain);
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
          if (shape.hcp >= 12) return bid(gameLevel(partnerBid.strain), partnerBid.strain);
          if (shape.hcp >= 10) return bid(3, partnerBid.strain);
          if (shape.hcp >= 6) return bid(2, partnerBid.strain);
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

  function isWeakTwoOpeningFiveCardHigh(candidate) {
        return candidate?.level === 2 && ["D", "H", "S"].includes(candidate.strain);
      }

  function supportLengthForOpening(strain) {
        if (strain === "H" || strain === "S") return 3;
        if (strain === "D") return 4;
        return 5;
      }

  function chooseOpenerSecondSuit(shape, openedStrain, responderStrain = null, predicate = () => true) {
        const candidates = suits.filter((suit) => suit !== openedStrain && suit !== responderStrain && shape.counts[suit] >= 4);
        return chooseSuitByLengthThenRank(candidates, shape, 4, false, predicate);
      }

  function bestSuitByLength(shape) {
        return chooseSuitByLengthThenRank(["S", "H", "D", "C"], shape, 1, true);
      }

  function suitQuality(hand, suit) {
        return hand.filter((card) => card.suit === suit && hcpValue[card.rank]).length;
      }

  function hasStopper(hand, suit) {
        const cards = hand.filter((card) => card.suit === suit);
        const ranks = new Set(cards.map((card) => card.rank));
        return ranks.has("A") || (ranks.has("K") && cards.length >= 2) || (ranks.has("Q") && cards.length >= 3) || (ranks.has("J") && cards.length >= 4);
      }

  return {
    chooseFiveCardHighBid,
    chooseFiveCardHighBidResult,
    chooseFiveCardHighBidTarget,
    chooseFiveCardHighOpening,
    chooseFiveCardHighResponse,
    chooseFiveCardHighOpenerRebid,
    chooseFiveCardHighResponderRebid,
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
    isWeakTwoOpeningFiveCardHigh,
    supportLengthForOpening,
    chooseOpenerSecondSuit,
    bestSuitByLength,
    suitQuality,
    hasStopper
  };
});

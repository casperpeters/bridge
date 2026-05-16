(function initBridgeRulesBiddingFiveCardHighCompetitiveTakeoutDouble(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const deps = isCommonJs
    ? {
        core: require("../../../../../core.js"),
        auction: require("../../../../../auction.js"),
        valuation: require("../../../../common/valuation.js"),
        result: require("../../../../common/result.js")
      }
    : root.BridgeRulesParts || {};
  const api = factory(
    deps.core,
    deps.auction,
    deps.valuation || deps.biddingFiveCardHighValuation,
    deps.result || deps.biddingCommonResult
  );
  if (isCommonJs) module.exports = api;
  root.BridgeRulesParts = root.BridgeRulesParts || {};
  root.BridgeRulesParts.biddingFiveCardHighCompetitiveTakeoutDouble = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesBiddingFiveCardHighCompetitiveTakeoutDouble(core, auction, valuationHelpers, resultHelpers) {
  "use strict";

  const {
    suits,
    biddingSystems,
    isTeamVulnerable,
    partnerOf,
    teamOf
  } = core;
  const {
    Pass,
    Double,
    isPass,
    isDouble,
    isContractBid,
    highestBid,
    canDoubleFromAuction,
    bid,
    gameLevel,
    cheapestLevelForStrain,
    isBidHigher,
    partnershipContractCalls
  } = auction;
  const { hasStopper } = valuationHelpers;
  const { bidChoiceResult } = resultHelpers;

  const highToLowSuits = ["S", "H", "D", "C"];

  function fiveCardHighBidChoiceResult(bid, ruleName, confidence, reason, extra = {}) {
    return bidChoiceResult(biddingSystems.fiveCardHigh, bid, ruleName, confidence, reason, extra);
  }

  function chooseFallbackBid(steps, fallback = Pass()) {
    for (const step of steps) {
      const candidate = step();
      if (candidate) return candidate;
    }
    return fallback;
  }

  function chooseTakeoutDoubleInitialAction({ shape, auction = [], seat, lastBid = highestBid(auction) } = {}) {
    return canDoubleFromAuction(auction, seat) && shouldMakeInformationDoubleFiveCardHigh(shape, lastBid)
      ? Double()
      : null;
  }

  function describeTakeoutDoubleInitialAction({ chosenBid, base = {} } = {}) {
    if (!isDouble(chosenBid)) return null;
    return fiveCardHighBidChoiceResult(chosenBid, "competitive.takeoutDouble", "basic", "Takeout double with 12+ points, shortness in their suit, and support for the unbid suits; with 16+ points one unbid suit may be only three cards.", base);
  }

  function chooseTakeoutDoubleAction({ hand = [], shape, auction = [], seat, partnershipCalls = partnershipContractCalls(auction, seat) } = {}) {
    const responseContext = partnerTakeoutDoubleResponseContext(auction, seat, partnershipCalls);
    if (responseContext) return respondToPartnerTakeoutDoubleFiveCardHigh(shape, hand, responseContext);

    const rebidContext = partnerTakeoutDoubleRebidContext(auction, seat, partnershipCalls);
    if (rebidContext) return rebidAfterPartnerTakeoutDoubleResponseFiveCardHigh(shape, hand, rebidContext);

    return null;
  }

  function describeTakeoutDoubleAction({ chosenBid, shape, hand = [], auction = [], seat, vulnerability = "none", base = {} } = {}) {
    if (isDouble(chosenBid)) {
      return describeTakeoutDoubleInitialAction({ chosenBid, base });
    }

    const partnershipCalls = partnershipContractCalls(auction, seat);
    const responseContext = partnerTakeoutDoubleResponseContext(auction, seat, partnershipCalls);
    if (responseContext) {
      if (isPass(chosenBid)) return null;
      return describeTakeoutDoubleResponseChoice(chosenBid, shape, responseContext, {
        ...base,
        category: "competitive",
        suit: chosenBid?.strain || null,
        length: chosenBid?.strain ? shape.counts[chosenBid.strain] || 0 : 0,
        opponentSuit: responseContext.currentOpponentBid?.strain || responseContext.doubledBid?.strain || null,
        partnerSuit: null,
        vulnerable: seat ? isTeamVulnerable(teamOf(seat), vulnerability) : false
      });
    }

    return describeTakeoutDoubleRebidChoice(chosenBid, shape, hand, auction, seat, base);
  }

  function shouldMakeInformationDoubleFiveCardHigh(shape, opponentBid) {
    if (!shape || !shape.counts || !opponentBid || opponentBid.strain === "NT" || opponentBid.level > 2) return false;
    if (shape.hcp < 12 || shape.counts[opponentBid.strain] > 2) return false;
    const unbidSuits = suits.filter((suit) => suit !== opponentBid.strain);
    const missingSupport = unbidSuits
      .filter((suit) => shape.counts[suit] < (suit === "H" || suit === "S" ? 4 : 3));
    if (!missingSupport.length) return true;
    return shape.hcp >= 16 &&
      missingSupport.length === 1 &&
      shape.counts[missingSupport[0]] >= 3;
  }

  function partnerTakeoutDoubleResponseContext(auction, seat, partnershipCalls = partnershipContractCalls(auction, seat)) {
    if (!seat || partnershipCalls.length) return null;
    const partnerAction = [...auction].reverse().find((call) => call.seat === partnerOf(seat)) || null;
    if (!partnerAction || !isDouble(partnerAction)) return null;
    const doubleIndex = auction.indexOf(partnerAction);
    if (doubleIndex < 0) return null;
    const doubledOpponentCall = [...auction.slice(0, doubleIndex)]
      .reverse()
      .find((call) => teamOf(call.seat) !== teamOf(seat) && isContractBid(call.bid)) || null;
    const doubledBid = doubledOpponentCall?.bid || null;
    if (!doubledBid || doubledBid.strain === "NT" || doubledBid.level > 2) return null;
    const rhoBidAfterDouble = auction
      .slice(doubleIndex + 1)
      .find((call) => teamOf(call.seat) !== teamOf(seat) && isContractBid(call.bid)) || null;
    const opponentSuits = new Set(
      [doubledBid, rhoBidAfterDouble?.bid]
        .filter((candidate) => candidate?.strain && candidate.strain !== "NT")
        .map((candidate) => candidate.strain)
    );
    return {
      partnerDoubleCall: partnerAction,
      doubledOpponentCall,
      doubledBid,
      rhoBidAfterDouble,
      currentOpponentBid: rhoBidAfterDouble?.bid || doubledBid,
      opponentSuits
    };
  }

  function partnerTakeoutDoubleRebidContext(auction, seat, partnershipCalls = partnershipContractCalls(auction, seat)) {
    if (!seat || partnershipCalls.length !== 1) return null;
    const doubleCall = [...auction].reverse().find((call) => call.seat === seat && isDouble(call)) || null;
    if (!doubleCall) return null;
    const doubleIndex = auction.indexOf(doubleCall);
    if (doubleIndex < 0) return null;
    const doubledOpponentCall = [...auction.slice(0, doubleIndex)]
      .reverse()
      .find((call) => teamOf(call.seat) !== teamOf(seat) && isContractBid(call.bid)) || null;
    const doubledBid = doubledOpponentCall?.bid || null;
    if (!doubledBid || doubledBid.strain === "NT" || doubledBid.level > 2) return null;

    const partnerResponseCall = auction
      .slice(doubleIndex + 1)
      .find((call) => call.seat === partnerOf(seat) && isContractBid(call.bid)) || null;
    if (!partnerResponseCall || partnershipCalls[0] !== partnerResponseCall) return null;
    const responseIndex = auction.indexOf(partnerResponseCall);
    const opponentContractAfterResponse = auction
      .slice(responseIndex + 1)
      .find((call) => teamOf(call.seat) !== teamOf(seat) && isContractBid(call.bid)) || null;
    if (opponentContractAfterResponse) return null;

    return {
      doubleCall,
      doubledOpponentCall,
      doubledBid,
      partnerResponseCall,
      partnerResponse: partnerResponseCall.bid
    };
  }

  function rebidAfterPartnerTakeoutDoubleResponseFiveCardHigh(shape, hand, context) {
    const responseBid = context.partnerResponse;
    if (!responseBid) return Pass();
    const currentBid = highestBid([context.doubledOpponentCall, context.partnerResponseCall].filter(Boolean));
    return chooseFallbackBid([
      () => isTakeoutDoubleDirectGameResponse(responseBid) ? Pass() : null,
      () => responseBid.strain === "NT" ? chooseTakeoutDoubleRebidAfterNotrumpResponse(shape, currentBid) : null,
      () => chooseTakeoutDoubleRebidAfterJumpResponse(responseBid, context.doubledBid, currentBid),
      () => shape.hcp > 16 ? chooseTakeoutDoubleRebidWithExtras(shape, hand, context, currentBid) : Pass()
    ]);
  }

  function chooseTakeoutDoubleRebidAfterNotrumpResponse(shape, currentBid) {
    if (shape.hcp >= 20 && canBidContract(3, "NT", currentBid)) return bid(3, "NT");
    if (shape.hcp >= 17 && canBidContract(2, "NT", currentBid)) return bid(2, "NT");
    return Pass();
  }

  function chooseTakeoutDoubleRebidAfterJumpResponse(responseBid, doubledBid, currentBid) {
    if (!isTakeoutDoubleJumpResponse(responseBid, doubledBid)) return null;
    const gameBid = bid(gameLevel(responseBid.strain), responseBid.strain);
    return isBidHigher(gameBid, currentBid) ? gameBid : Pass();
  }

  function chooseTakeoutDoubleRebidWithExtras(shape, hand, context, currentBid) {
    const responseBid = context.partnerResponse;
    const fit = hasTakeoutDoubleResponseFit(shape, responseBid.strain);
    if (shape.hcp >= 20) {
      return chooseFallbackBid([
        () => fit ? bid(gameLevel(responseBid.strain), responseBid.strain) : null,
        () => chooseTakeoutDoubleRebidNotrumpGame(shape, hand, context, currentBid),
        () => {
          const gameSuit = chooseTakeoutDoubleRebidSuit(shape, context, currentBid, "game");
          return gameSuit ? bid(gameLevel(gameSuit), gameSuit) : null;
        }
      ]);
    }

    return chooseFallbackBid([
      () => chooseTakeoutDoubleInviteRaise(responseBid, fit, currentBid),
      () => chooseTakeoutDoubleRebidNotrumpInvite(shape, hand, context, currentBid),
      () => {
        const inviteSuit = chooseTakeoutDoubleRebidSuit(shape, context, currentBid, "invite");
        return inviteSuit ? bid(cheapestLevelForStrain(inviteSuit, currentBid), inviteSuit) : null;
      }
    ]);
  }

  function chooseTakeoutDoubleInviteRaise(responseBid, fit, currentBid) {
    if (!fit) return null;
    const inviteLevel = Math.min(gameLevel(responseBid.strain), responseBid.level + 2);
    const inviteBid = bid(inviteLevel, responseBid.strain);
    return isBidHigher(inviteBid, currentBid) ? inviteBid : null;
  }

  function chooseTakeoutDoubleRebidNotrumpGame(shape, hand, context, currentBid) {
    return shape.balanced &&
      context.doubledBid.strain !== "NT" &&
      canBidContract(3, "NT", currentBid) &&
      hasStopper(hand, context.doubledBid.strain)
      ? bid(3, "NT")
      : null;
  }

  function chooseTakeoutDoubleRebidNotrumpInvite(shape, hand, context, currentBid) {
    return shape.balanced &&
      context.doubledBid.strain !== "NT" &&
      canBidContract(2, "NT", currentBid) &&
      hasStopper(hand, context.doubledBid.strain)
      ? bid(2, "NT")
      : null;
  }

  function isTakeoutDoubleDirectGameResponse(responseBid) {
    if (!responseBid || !isContractBid(responseBid)) return false;
    return responseBid.level >= gameLevel(responseBid.strain);
  }

  function isTakeoutDoubleJumpResponse(responseBid, doubledBid) {
    if (!responseBid || !doubledBid || responseBid.strain === "NT") return false;
    return responseBid.level >= cheapestLevelForStrain(responseBid.strain, doubledBid) + 1 &&
      responseBid.level < gameLevel(responseBid.strain);
  }

  function hasTakeoutDoubleResponseFit(shape, responseStrain) {
    if (responseStrain === "H" || responseStrain === "S") return shape.counts[responseStrain] >= 4;
    if (responseStrain === "D") return shape.counts.D >= 4;
    if (responseStrain === "C") return shape.counts.C >= 5;
    return false;
  }

  function chooseTakeoutDoubleRebidSuit(shape, context, currentBid, mode) {
    const minimumLength = mode === "game" ? 5 : 4;
    const candidates = highToLowSuits
      .filter((suit) => suit !== context.doubledBid.strain && suit !== context.partnerResponse.strain)
      .filter((suit) => (shape.counts[suit] || 0) >= minimumLength)
      .filter((suit) => mode === "game"
        ? canBidContract(gameLevel(suit), suit, currentBid)
        : canBidContract(cheapestLevelForStrain(suit, currentBid), suit, currentBid));
    if (!candidates.length) return null;
    return candidates.sort((left, right) => {
      const lengthDiff = (shape.counts[right] || 0) - (shape.counts[left] || 0);
      if (lengthDiff) return lengthDiff;
      return highToLowSuits.indexOf(left) - highToLowSuits.indexOf(right);
    })[0];
  }

  function respondToPartnerTakeoutDoubleFiveCardHigh(shape, hand, context) {
    const currentBid = highestBid([context.doubledOpponentCall, context.rhoBidAfterDouble].filter(Boolean));
    const forced = !context.rhoBidAfterDouble;
    return forced
      ? respondToForcedPartnerTakeoutDoubleFiveCardHigh(shape, hand, context, currentBid)
      : respondToVoluntaryPartnerTakeoutDoubleFiveCardHigh(shape, hand, context, currentBid);
  }

  function respondToVoluntaryPartnerTakeoutDoubleFiveCardHigh(shape, hand, context, currentBid) {
    return chooseFallbackBid([
      () => {
        const voluntarySuit = chooseTakeoutDoubleResponseSuit(shape, context, 4, "highest", (candidate) => {
          const level = cheapestLevelForStrain(candidate, currentBid);
          if (level === 1) return shape.hcp >= 6;
          if (level === 2) return shape.hcp >= 10;
          return false;
        });
        return voluntarySuit ? bid(cheapestLevelForStrain(voluntarySuit, currentBid), voluntarySuit) : null;
      },
      () => chooseTakeoutDoubleResponseNotrump(shape, hand, context, currentBid),
      () => Pass()
    ]);
  }

  function respondToForcedPartnerTakeoutDoubleFiveCardHigh(shape, hand, context, currentBid) {
    return chooseFallbackBid([
      () => shape.hcp >= 12 ? chooseTakeoutDoubleGameResponse(shape, hand, context, currentBid) : null,
      () => {
        const forcedFourCardSuit = chooseTakeoutDoubleResponseSuit(shape, context, 4, "highest");
        return !forcedFourCardSuit ? chooseTakeoutDoubleResponseNotrump(shape, hand, context, currentBid) : null;
      },
      () => {
        if (shape.hcp < 9 || shape.hcp > 11) return null;
        const jumpSuit = chooseTakeoutDoubleResponseSuit(shape, context, 1, "longest");
        if (!jumpSuit) return null;
        const baseLevel = cheapestLevelForStrain(jumpSuit, currentBid);
        return baseLevel <= 6 ? bid(baseLevel + 1, jumpSuit) : null;
      },
      () => {
        const forcedSuit = chooseTakeoutDoubleResponseSuit(shape, context, 4, "highest") ||
          chooseTakeoutDoubleResponseSuit(shape, context, 3, "highest") ||
          chooseTakeoutDoubleResponseSuit(shape, context, 0, "highest");
        return forcedSuit ? bid(cheapestLevelForStrain(forcedSuit, currentBid), forcedSuit) : null;
      }
    ]);
  }

  function chooseTakeoutDoubleResponseNotrump(shape, hand, context, currentBid) {
    const currentOpponentBid = context.currentOpponentBid;
    return shape.hcp >= 6 &&
      shape.hcp <= 9 &&
      shape.balanced &&
      currentOpponentBid?.strain &&
      currentOpponentBid.strain !== "NT" &&
      canBidContract(1, "NT", currentBid) &&
      hasStopper(hand, currentOpponentBid.strain)
      ? bid(1, "NT")
      : null;
  }

  function chooseTakeoutDoubleGameResponse(shape, hand, context, currentBid) {
    return chooseFallbackBid([
      () => {
        const gameMajor = highToLowSuits
          .filter((suit) => suit === "S" || suit === "H")
          .find((suit) => !context.opponentSuits.has(suit) && shape.counts[suit] >= 4 && canBidContract(gameLevel(suit), suit, currentBid));
        return gameMajor ? bid(gameLevel(gameMajor), gameMajor) : null;
      },
      () => shape.balanced &&
        context.currentOpponentBid?.strain &&
        context.currentOpponentBid.strain !== "NT" &&
        canBidContract(3, "NT", currentBid) &&
        hasStopper(hand, context.currentOpponentBid.strain)
        ? bid(3, "NT")
        : null,
      () => {
        const gameSuit = chooseTakeoutDoubleResponseSuit(shape, context, 1, "longest", (candidate) => {
          return canBidContract(gameLevel(candidate), candidate, currentBid);
        });
        return gameSuit ? bid(gameLevel(gameSuit), gameSuit) : null;
      }
    ]);
  }

  function chooseTakeoutDoubleResponseSuit(shape, context, minimumLength, mode, predicate = () => true) {
    const candidates = highToLowSuits
      .filter((suit) => !context.opponentSuits.has(suit))
      .filter((suit) => (shape.counts[suit] || 0) >= minimumLength)
      .filter(predicate);
    if (!candidates.length) return null;
    if (mode === "longest") {
      return candidates.sort((left, right) => {
        const lengthDiff = (shape.counts[right] || 0) - (shape.counts[left] || 0);
        if (lengthDiff) return lengthDiff;
        return highToLowSuits.indexOf(left) - highToLowSuits.indexOf(right);
      })[0];
    }
    return candidates[0];
  }

  function canBidContract(level, strain, currentBid) {
    return level <= 7 && isBidHigher(bid(level, strain), currentBid);
  }

  function describeTakeoutDoubleResponseChoice(chosenBid, shape, context, base) {
    const forced = !context.rhoBidAfterDouble;
    const extra = {
      ...base,
      opponentSuit: context.currentOpponentBid?.strain || context.doubledBid?.strain || null,
      doubledSuit: context.doubledBid?.strain || null,
      rhoBidAfterDouble: Boolean(context.rhoBidAfterDouble),
      forced,
      length: chosenBid.strain && chosenBid.strain !== "NT" ? shape.counts[chosenBid.strain] || 0 : 0
    };

    if (forced && shape.hcp >= 12) {
      return fiveCardHighBidChoiceResult(chosenBid, "competitive.takeoutDoubleGame", "basic", "With opening strength opposite partner's takeout double, make sure the partnership reaches game.", {
        ...extra,
        minimumHcp: 12,
        targetGameLevel: chosenBid.strain === "NT" ? 3 : gameLevel(chosenBid.strain),
        stopperSuit: chosenBid.strain === "NT" ? context.currentOpponentBid?.strain || context.doubledBid?.strain || null : undefined
      });
    }

    if (chosenBid.strain === "NT") {
      return fiveCardHighBidChoiceResult(chosenBid, "competitive.takeoutDoubleOneNotrump", "basic", "Bid 1NT after partner's takeout double with 6-9 points, balanced shape, and a stopper in their suit.", {
        ...extra,
        minimumHcp: 6,
        stopperSuit: context.currentOpponentBid?.strain || context.doubledBid?.strain || null
      });
    }

    if (!forced) {
      return fiveCardHighBidChoiceResult(chosenBid, "competitive.takeoutDoubleVoluntarySuit", "basic", "After right-hand opponent bids, the obligation is gone; bid a new unbid suit voluntarily with enough points and at least a four-card suit.", {
        ...extra,
        minimumHcp: chosenBid.level >= 2 ? 10 : 6
      });
    }

    const cheapestLevel = cheapestLevelForStrain(chosenBid.strain, context.doubledBid);
    if (shape.hcp >= 9 && shape.hcp <= 11 && chosenBid.level >= cheapestLevel + 1) {
      return fiveCardHighBidChoiceResult(chosenBid, "competitive.takeoutDoubleJumpSuit", "basic", "Jump in the longest unbid suit with 9-11 points after partner's takeout double.", {
        ...extra,
        minimumHcp: 9
      });
    }

    return fiveCardHighBidChoiceResult(chosenBid, "competitive.takeoutDoubleForcedSuit", "basic", "Forced response to partner's takeout double: choose the highest unbid suit first with a weak hand.", {
      ...extra,
      minimumHcp: 0
    });
  }

  function describeTakeoutDoubleRebidChoice(chosenBid, shape, hand, auction, seat, base) {
    const context = partnerTakeoutDoubleRebidContext(auction, seat);
    if (!context) return null;
    const responseBid = context.partnerResponse;
    const support = responseBid?.strain && responseBid.strain !== "NT" ? shape.counts[responseBid.strain] || 0 : 0;
    const fit = responseBid?.strain && responseBid.strain !== "NT"
      ? hasTakeoutDoubleResponseFit(shape, responseBid.strain)
      : false;
    const extra = {
      ...base,
      category: "competitive",
      takeoutDoubleRebid: true,
      partnerResponse: responseBid,
      responseSuit: responseBid?.strain || null,
      opponentSuit: context.doubledBid?.strain || null,
      suit: chosenBid.strain,
      length: chosenBid.strain && chosenBid.strain !== "NT" ? shape.counts[chosenBid.strain] || 0 : 0,
      fit,
      support
    };

    if (isPass(chosenBid)) {
      if (isTakeoutDoubleDirectGameResponse(responseBid)) {
        return fiveCardHighBidChoiceResult(chosenBid, "competitive.takeoutDoubleRebidPassGame", "basic", "Pass after partner bid game in response to the takeout double.", {
          ...extra,
          targetGameLevel: responseBid.strain === "NT" ? 3 : gameLevel(responseBid.strain)
        });
      }
      return fiveCardHighBidChoiceResult(chosenBid, "competitive.takeoutDoubleRebidPassMinimum", "basic", "Pass after partner's response to the takeout double with a minimum rebid range.", {
        ...extra,
        maximumHcp: 16
      });
    }

    if (responseBid?.strain === "NT" && chosenBid.strain === "NT") {
      const game = chosenBid.level >= 3;
      return fiveCardHighBidChoiceResult(chosenBid, game ? "competitive.takeoutDoubleRebidGameNotrump" : "competitive.takeoutDoubleRebidInviteNotrump", "basic", "Rebid notrump after partner's 1NT response to the takeout double according to strength.", {
        ...extra,
        minimumHcp: game ? 20 : 17,
        maximumHcp: game ? undefined : 19,
        stopperSuit: context.doubledBid?.strain || null,
        targetGameLevel: game ? 3 : undefined
      });
    }

    if (isTakeoutDoubleJumpResponse(responseBid, context.doubledBid) && chosenBid.strain === responseBid.strain) {
      return fiveCardHighBidChoiceResult(chosenBid, "competitive.takeoutDoubleRebidAfterJumpGame", "basic", "Accept partner's jump response after the takeout double by bidding game.", {
        ...extra,
        targetGameLevel: gameLevel(chosenBid.strain)
      });
    }

    if (chosenBid.strain === responseBid?.strain) {
      const game = chosenBid.level >= gameLevel(chosenBid.strain);
      return fiveCardHighBidChoiceResult(chosenBid, game ? "competitive.takeoutDoubleRebidGameRaise" : "competitive.takeoutDoubleRebidInviteRaise", "basic", "Raise partner's response to the takeout double with fit and extra strength.", {
        ...extra,
        minimumHcp: game ? 20 : 17,
        maximumHcp: game ? undefined : 19,
        targetGameLevel: game ? gameLevel(chosenBid.strain) : undefined
      });
    }

    if (chosenBid.strain === "NT") {
      const game = chosenBid.level >= 3;
      return fiveCardHighBidChoiceResult(chosenBid, game ? "competitive.takeoutDoubleRebidGameNotrump" : "competitive.takeoutDoubleRebidInviteNotrump", "basic", "Rebid notrump after partner's response to the takeout double with balanced extra strength and a stopper.", {
        ...extra,
        minimumHcp: game ? 20 : 17,
        maximumHcp: game ? undefined : 19,
        stopperSuit: context.doubledBid?.strain || null,
        targetGameLevel: game ? 3 : undefined
      });
    }

    return fiveCardHighBidChoiceResult(chosenBid, "competitive.takeoutDoubleRebidNatural", "basic", "Show a natural long suit after partner's response to the takeout double.", {
      ...extra,
      minimumHcp: shape.hcp >= 20 ? 20 : 17,
      maximumHcp: shape.hcp >= 20 ? undefined : 19
    });
  }

  return {
    chooseTakeoutDoubleInitialAction,
    chooseTakeoutDoubleAction,
    describeTakeoutDoubleInitialAction,
    describeTakeoutDoubleAction,
    shouldMakeInformationDoubleFiveCardHigh
  };
});

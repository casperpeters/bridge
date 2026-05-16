(function initBridgeRulesBiddingFiveCardHighCompetitiveAdvancer(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const deps = isCommonJs
    ? {
        core: require("../../../../../core.js"),
        auction: require("../../../../../auction.js"),
        valuation: require("../../../../common/valuation.js"),
        result: require("../../../../common/result.js"),
        conventions: require("../../conventions.js"),
        responses: require("../../responses.js")
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
  root.BridgeRulesParts.biddingFiveCardHighCompetitiveAdvancer = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesBiddingFiveCardHighCompetitiveAdvancer(core, auction, valuationHelpers, resultHelpers, conventionHelpers, responseHelpers) {
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
    isPass,
    isDouble,
    isContractBid,
    highestBidCall,
    highestBid,
    bid,
    bidEquals,
    gameLevel,
    cheapestLevelForStrain,
    isBidHigher,
    partnershipContractCalls,
    lastPartnerContractCall
  } = auction;
  const { fitStrength, fitValuationContext, optionalFitValuationContext, suitQuality, hasStopper } = valuationHelpers;
  const { bidChoiceResult } = resultHelpers;
  const {
    notrumpTransferSuit,
    chooseSuitByLengthThenRank,
    minimumOpeningLength,
    supportLengthForOpening,
    isOneMinorOpeningFiveCardHigh
  } = conventionHelpers;
  const { respondToOneNotrumpFiveCardHigh, respondToTwoNotrumpFiveCardHigh } = responseHelpers;

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

  function nonPassBid(candidate) {
    return candidate && !isPass(candidate) ? candidate : null;
  }

  function chooseAdvancerAction(state = {}) {
    const {
      hand = [],
      auction: currentAuction = [],
      seat,
      vulnerability = "none",
      shape = handShape(hand),
      partnershipCalls = partnershipContractCalls(currentAuction, seat),
      lastBid = highestBid(currentAuction),
      lastCall = currentAuction[currentAuction.length - 1] || null,
      highestBidCall: currentHighestBidCall = highestBidCall(currentAuction)
    } = state;
    const lastPartnerCall = lastPartnerContractCall(currentAuction, seat);
    if (!lastPartnerCall || partnershipCalls.length !== 1) return null;

    const partnerMadeOvercall = didPartnerMakeOvercall(currentAuction, seat, lastPartnerCall);
    if (partnerMadeOvercall) {
      const advancerAction = respondToPartnerOvercallFiveCardHigh(shape, hand, lastPartnerCall.bid, currentAuction, seat, vulnerability);
      const nonPassAction = nonPassBid(advancerAction);
      if (nonPassAction) return nonPassAction;
    }

    if (isDouble(lastCall)) return respondAfterPartnerOpenedAndOpponentDoubledFiveCardHigh(shape, hand, lastPartnerCall.bid);
    if (lastBid && currentHighestBidCall?.seat !== seat && teamOf(currentHighestBidCall.seat) !== teamOf(seat)) {
      return respondAfterOvercallFiveCardHigh(shape, hand, lastPartnerCall.bid, lastBid, currentAuction, seat, {
        partnerMadeOvercall
      });
    }
    return null;
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

  function respondAfterPartnerOpenedAndOpponentDoubledFiveCardHigh(shape, hand, partnerBid) {
    const support = partnerBid.strain !== "NT" && shape.counts[partnerBid.strain] >= supportLengthForOpening(partnerBid.strain);
    const strength = partnerBid.strain !== "NT" ? fitStrength(hand, shape, partnerBid.strain, minimumOpeningLength(partnerBid.strain)) : shape.hcp;
    if (support && strength >= 10) return bid(2, "NT");
    if (support && strength >= 6) return bid(Math.min(partnerBid.level + 1, gameLevel(partnerBid.strain)), partnerBid.strain);
    const newSuit = chooseSuitByLengthThenRank(suits.filter((suit) => suit !== partnerBid.strain), shape, 5, true);
    if (newSuit && shape.hcp >= 6) return bid(cheapestLevelForStrain(newSuit, partnerBid), newSuit);
    return Pass();
  }

  function respondToPartnerOvercallFiveCardHigh(shape, hand, partnerBid, auction, seat, vulnerability = "none") {
    if (!partnerBid) return Pass();
    if (partnerBid.strain === "NT") return respondToPartnerNotrumpOvercallFiveCardHigh(shape, partnerBid);
    const opponentCall = opponentContractBeforePartnerOvercall(auction, seat);
    const opponentBid = opponentCall?.bid || null;
    const partnerTrumpLength = partnerOvercallMinTrumpLength(partnerBid, opponentBid);
    const vulnerable = isTeamVulnerable(teamOf(seat), vulnerability);
    return chooseFallbackBid([
      () => chooseRaiseAfterPartnerOvercall(shape, hand, partnerBid, auction, vulnerable, partnerTrumpLength),
      () => chooseNotrumpAfterPartnerOvercall(shape, hand, partnerBid, opponentBid, highestBid(auction)),
      () => chooseNewSuitAfterPartnerOvercall(shape, hand, partnerBid, opponentBid, highestBid(auction))
    ]);
  }

  function chooseRaiseAfterPartnerOvercall(shape, hand, partnerBid, auction, vulnerable, partnerTrumpLength) {
    const support = partnerTrumpLength >= 6
      ? shape.counts[partnerBid.strain] + partnerTrumpLength >= 8
      : shape.counts[partnerBid.strain] >= supportLengthForOpening(partnerBid.strain);
    const minimumHcp = vulnerable ? 8 : 7;
    const strength = fitStrength(hand, shape, partnerBid.strain, partnerTrumpLength);
    if (!support || strength < minimumHcp) return null;

    const supportLevel = cheapestLevelForStrain(partnerBid.strain, highestBid(auction));
    const gameMinimum = partnerTrumpLength >= 6 && !vulnerable ? 15 : 16;
    if (supportLevel > gameLevel(partnerBid.strain)) return Pass();
    if (strength >= gameMinimum) return bid(gameLevel(partnerBid.strain), partnerBid.strain);
    if (supportLevel >= gameLevel(partnerBid.strain)) return Pass();
    if (strength >= 10) return bid(Math.max(supportLevel, 3), partnerBid.strain);
    return bid(supportLevel, partnerBid.strain);
  }

  function chooseNotrumpAfterPartnerOvercall(shape, hand, partnerBid, opponentBid, currentBid) {
    if (!opponentBid?.strain || opponentBid.strain === "NT" || !shape.balanced || !hasStopper(hand, opponentBid.strain)) return null;
    if (shape.hcp >= 13) return bid(3, "NT");
    const notrumpLevel = cheapestLevelForStrain("NT", currentBid);
    const minimumNotrumpHcp = partnerBid.level >= 2 ? 12 : 10;
    return notrumpLevel <= 2 && shape.hcp >= minimumNotrumpHcp ? bid(notrumpLevel, "NT") : null;
  }

  function chooseNewSuitAfterPartnerOvercall(shape, hand, partnerBid, opponentBid, currentBid) {
    const newSuit = chooseSuitByLengthThenRank(
      suits.filter((suit) => suit !== partnerBid.strain && suit !== opponentBid?.strain),
      shape,
      5,
      true,
      (candidate) => suitQuality(hand, candidate) >= 2
    );
    const minimumNewSuitHcp = partnerBid.level >= 2 ? 12 : 10;
    return newSuit && shape.hcp >= minimumNewSuitHcp ? bid(cheapestLevelForStrain(newSuit, currentBid), newSuit) : null;
  }

  function partnerOvercallMinTrumpLength(partnerBid, opponentBid) {
    if (!partnerBid || partnerBid.strain === "NT") return 0;
    if (opponentBid && partnerBid.level >= cheapestLevelForStrain(partnerBid.strain, opponentBid) + 1) return 6;
    return 5;
  }

  function respondToPartnerNotrumpOvercallFiveCardHigh(shape, partnerBid) {
    if (bidEquals(partnerBid, 1, "NT")) return respondToOneNotrumpFiveCardHigh(shape);
    if (bidEquals(partnerBid, 2, "NT")) return respondToTwoNotrumpFiveCardHigh(shape);
    return Pass();
  }

  function respondAfterOvercallFiveCardHigh(shape, hand, partnerBid, opponentBid, auction, seat, options = {}) {
    const newSuit = chooseCompetitiveResponseNewSuit(shape, hand, partnerBid, opponentBid, options);
    return chooseFallbackBid([
      () => chooseRaiseAfterPartnerOpenedAndOpponentOvercalled(shape, hand, partnerBid, opponentBid),
      () => chooseOnlyUnbidOneLevelMajor(shape, partnerBid, opponentBid),
      () => options.partnerMadeOvercall ? chooseNewSuitAfterPartnerOvercallInterference(shape, newSuit, opponentBid) : null,
      () => chooseNewSuitAfterOpponentOvercall(shape, newSuit, opponentBid),
      () => chooseNotrumpAfterOpponentOvercall(shape, hand, opponentBid)
    ]);
  }

  function chooseRaiseAfterPartnerOpenedAndOpponentOvercalled(shape, hand, partnerBid, opponentBid) {
    const support = partnerBid.strain !== "NT" && shape.counts[partnerBid.strain] >= supportLengthForOpening(partnerBid.strain);
    if (!support) return null;
    const strength = fitStrength(hand, shape, partnerBid.strain, minimumOpeningLength(partnerBid.strain));
    const supportLevel = cheapestLevelForStrain(partnerBid.strain, opponentBid);
    if (supportLevel > gameLevel(partnerBid.strain)) return Pass();
    if (strength >= 12) {
      return chooseMinorFitNotrumpGameAfterOpponentOvercall(shape, hand, partnerBid, opponentBid) ||
        bid(gameLevel(partnerBid.strain), partnerBid.strain);
    }
    if (strength >= 10 && supportLevel <= 3) return bid(Math.max(supportLevel, 3), partnerBid.strain);
    if (strength >= 6 && supportLevel <= 2) return bid(supportLevel, partnerBid.strain);
    return null;
  }

  function minorFitNotrumpGameAfterOpponentOvercallContext(shape, hand, partnerBid, opponentBid) {
    if (!isOneMinorOpeningFiveCardHigh(partnerBid)) return null;
    if (!opponentBid?.strain || opponentBid.strain === "NT") return null;
    if (!shape.balanced || shape.hcp < 12) return null;
    if (!hasStopper(hand, opponentBid.strain)) return null;
    if (!canBidContract(3, "NT", opponentBid)) return null;

    const support = shape.counts[partnerBid.strain] || 0;
    const supportThreshold = supportLengthForOpening(partnerBid.strain);
    if (support < supportThreshold) return null;

    const partnerMinTrumpLength = minimumOpeningLength(partnerBid.strain);
    const fitStrengthValue = fitStrength(hand, shape, partnerBid.strain, partnerMinTrumpLength);
    if (fitStrengthValue < 12) return null;

    return {
      partnerSuit: partnerBid.strain,
      support,
      supportThreshold,
      partnerMinTrumpLength,
      minorFitStrength: fitStrengthValue,
      minimumHcp: 12,
      stopperSuit: opponentBid.strain,
      minorGameAlternative: bid(gameLevel(partnerBid.strain), partnerBid.strain)
    };
  }

  function canBidContract(level, strain, currentBid) {
    return level <= 7 && isBidHigher(bid(level, strain), currentBid);
  }

  function chooseMinorFitNotrumpGameAfterOpponentOvercall(shape, hand, partnerBid, opponentBid) {
    return minorFitNotrumpGameAfterOpponentOvercallContext(shape, hand, partnerBid, opponentBid)
      ? bid(3, "NT")
      : null;
  }

  function chooseOnlyUnbidOneLevelMajor(shape, partnerBid, opponentBid) {
    const unbidMajors = ["H", "S"].filter((suit) => suit !== partnerBid.strain && suit !== opponentBid.strain);
    if (unbidMajors.length !== 1) return null;
    const naturalMajor = unbidMajors[0];
    const level = cheapestLevelForStrain(naturalMajor, opponentBid);
    return level === 1 && shape.counts[naturalMajor] >= 4 && shape.hcp >= 8 ? bid(level, naturalMajor) : null;
  }

  function chooseCompetitiveResponseNewSuit(shape, hand, partnerBid, opponentBid, options = {}) {
    return chooseSuitByLengthThenRank(
      suits.filter((suit) => suit !== partnerBid.strain && suit !== opponentBid.strain),
      shape,
      5,
      true,
      options.partnerMadeOvercall ? (candidate) => suitQuality(hand, candidate) >= 2 : () => true
    );
  }

  function chooseNewSuitAfterPartnerOvercallInterference(shape, newSuit, opponentBid) {
    if (!newSuit) return null;
    const level = cheapestLevelForStrain(newSuit, opponentBid);
    if (level === 1 && shape.hcp >= 8) return bid(level, newSuit);
    if (level === 2 && shape.hcp >= 12) return bid(level, newSuit);
    return null;
  }

  function chooseNewSuitAfterOpponentOvercall(shape, newSuit, opponentBid) {
    if (!newSuit) return null;
    const level = cheapestLevelForStrain(newSuit, opponentBid);
    if (level === 1 && shape.hcp >= 6) return bid(level, newSuit);
    if (level === 2 && shape.hcp >= 10) return bid(level, newSuit);
    return null;
  }

  function chooseNotrumpAfterOpponentOvercall(shape, hand, opponentBid) {
    if (opponentBid.strain === "NT" || !shape.balanced || !hasStopper(hand, opponentBid.strain)) return null;
    const ntLevel = cheapestLevelForStrain("NT", opponentBid);
    if (shape.hcp >= 12) return bid(3, "NT");
    if (shape.hcp >= 10 && ntLevel <= 2) return bid(ntLevel, "NT");
    if (shape.hcp >= 6 && ntLevel === 1) return bid(1, "NT");
    return null;
  }

  function describeAdvancerAction({ chosenBid, shape, hand = [], auction = [], seat, vulnerability = "none", base = {} } = {}) {
    if (!chosenBid || isPass(chosenBid)) return null;

    const lastBid = highestBid(auction);
    const lastPartnerCall = lastPartnerContractCall(auction, seat);
    const partnerOvercall = didPartnerMakeOvercall(auction, seat, lastPartnerCall);
    const opponentOpeningCall = partnerOvercall ? opponentContractBeforePartnerOvercall(auction, seat, lastPartnerCall) : null;
    const vulnerable = seat ? isTeamVulnerable(teamOf(seat), vulnerability) : false;
    const extra = {
      ...base,
      category: "competitive",
      suit: chosenBid.strain,
      length: shape.counts[chosenBid.strain] || 0,
      opponentSuit: opponentOpeningCall?.bid?.strain || lastBid?.strain || null,
      partnerSuit: lastPartnerCall?.bid?.strain || null,
      vulnerable
    };

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

    const minorFitNotrumpContext = !partnerOvercall && bidEquals(chosenBid, 3, "NT")
      ? minorFitNotrumpGameAfterOpponentOvercallContext(shape, hand, lastPartnerCall?.bid, lastBid)
      : null;
    if (minorFitNotrumpContext) {
      return fiveCardHighBidChoiceResult(chosenBid, "competitive.minorFitNotrumpGameAfterOvercall", "basic", "Prefer 3NT to a minor-suit game with balanced game values, a minor fit, and a stopper in the opponent's suit.", {
        ...extra,
        ...minorFitNotrumpContext
      });
    }

    if (
      lastPartnerCall?.bid?.strain !== "NT" &&
      chosenBid.strain === lastPartnerCall?.bid?.strain &&
      partnerOvercall
    ) {
      const minimumHcp = vulnerable ? 8 : 7;
      const partnerMinTrumpLength = partnerOvercallMinTrumpLength(lastPartnerCall.bid, opponentOpeningCall?.bid || null);
      const gameMinimum = partnerMinTrumpLength >= 6 && !vulnerable ? 15 : 16;
      return fiveCardHighBidChoiceResult(chosenBid, "competitive.raisePartnerOvercall", "basic", `Raise partner's overcall with a fit and ${minimumHcp}+ fit points${vulnerable ? " when vulnerable" : " when not vulnerable"}.`, {
        ...extra,
        support: shape.counts[lastPartnerCall.bid.strain] || 0,
        minimumHcp,
        gameMinimum,
        ...fitValuationContext(
          hand,
          shape,
          lastPartnerCall.bid.strain,
          partnerMinTrumpLength
        )
      });
    }
    if (partnerOvercall && chosenBid.strain === "NT") {
      const minimumHcp = chosenBid.level >= 3 ? 13 : lastPartnerCall?.bid?.level >= 2 ? 12 : 10;
      return fiveCardHighBidChoiceResult(chosenBid, "competitive.notrumpAfterPartnerOvercall", "basic", "Bid notrump after partner's overcall with enough strength and a stopper in their suit.", {
        ...extra,
        minimumHcp,
        stopperSuit: opponentOpeningCall?.bid?.strain || null
      });
    }
    if (partnerOvercall && chosenBid.strain !== lastPartnerCall?.bid?.strain) {
      const currentOpponentCall = highestBidCall(auction);
      const opponentBidAfterPartnerOvercall = currentOpponentCall &&
        teamOf(currentOpponentCall.seat) !== teamOf(seat) &&
        currentOpponentCall !== opponentOpeningCall;
      const minimumHcp = opponentBidAfterPartnerOvercall && chosenBid.level === 1
        ? 8
        : lastPartnerCall?.bid?.level >= 2 ? 12 : 10;
      return fiveCardHighBidChoiceResult(chosenBid, "competitive.newSuitAfterPartnerOvercall", "basic", "Bid a new suit after partner's overcall with a good five-card suit and enough strength.", {
        ...extra,
        minimumHcp
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
    chooseAdvancerAction,
    describeAdvancerAction,
    didPartnerMakeOvercall,
    opponentContractBeforePartnerOvercall,
    respondAfterPartnerOpenedAndOpponentDoubledFiveCardHigh,
    respondToPartnerOvercallFiveCardHigh,
    chooseRaiseAfterPartnerOvercall,
    chooseNotrumpAfterPartnerOvercall,
    chooseNewSuitAfterPartnerOvercall,
    partnerOvercallMinTrumpLength,
    respondToPartnerNotrumpOvercallFiveCardHigh,
    respondAfterOvercallFiveCardHigh,
    chooseRaiseAfterPartnerOpenedAndOpponentOvercalled,
    minorFitNotrumpGameAfterOpponentOvercallContext,
    chooseMinorFitNotrumpGameAfterOpponentOvercall,
    chooseOnlyUnbidOneLevelMajor,
    chooseCompetitiveResponseNewSuit,
    chooseNewSuitAfterPartnerOvercallInterference,
    chooseNewSuitAfterOpponentOvercall,
    chooseNotrumpAfterOpponentOvercall
  };
});

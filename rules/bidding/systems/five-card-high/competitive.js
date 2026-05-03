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
    isBidHigher,
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

  const highToLowSuits = ["S", "H", "D", "C"];

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

  function chooseCompetitiveFiveCardHighBid(hand, auction, seat, vulnerability = "none") {
        const state = competitiveBiddingState(hand, auction, seat, vulnerability);
        return chooseFallbackBid([
          () => chooseRedoubleAfterPartnerOpeningDouble(state),
          () => {
            const context = partnerTakeoutDoubleResponseContext(auction, seat, state.partnershipCalls);
            return context ? respondToPartnerTakeoutDoubleFiveCardHigh(state.shape, hand, context) : null;
          },
          () => !state.partnershipCalls.length ? chooseOvercallFiveCardHigh(hand, auction, seat, vulnerability) : null,
          () => {
            const context = partnerTakeoutDoubleRebidContext(auction, seat, state.partnershipCalls);
            return context ? rebidAfterPartnerTakeoutDoubleResponseFiveCardHigh(state.shape, hand, context) : null;
          },
          () => choosePartnerActionAfterInterference(state),
          () => canDoubleFromAuction(auction, seat) && shouldMakeInformationDoubleFiveCardHigh(state.shape, state.lastBid) ? Double() : null
        ]);
      }

  function competitiveBiddingState(hand, auction, seat, vulnerability) {
        return {
          hand,
          auction,
          seat,
          vulnerability,
          shape: handShape(hand),
          partnershipCalls: partnershipContractCalls(auction, seat),
          lastBid: highestBid(auction),
          lastCall: auction[auction.length - 1] || null,
          highestBidCall: highestBidCall(auction)
        };
      }

  function chooseRedoubleAfterPartnerOpeningDouble({ shape, partnershipCalls, auction, seat }) {
        const context = partnerOpeningDoubleContext(auction, seat, partnershipCalls);
        return context && shape.hcp >= 10 && !hasOpeningFit(shape, context.partnerBid) ? Redouble() : null;
      }

  function partnerOpeningDoubleContext(auction, seat, partnershipCalls = partnershipContractCalls(auction, seat)) {
        if (!seat || !canRedoubleFromAuction(auction, seat)) return null;
        const lastCall = auction[auction.length - 1] || null;
        if (!lastCall || !isDouble(lastCall) || teamOf(lastCall.seat) === teamOf(seat)) return null;
        if (partnershipCalls.length !== 1) return null;

        const partnerCall = partnershipCalls[0];
        if (partnerCall.seat !== partnerOf(seat) || !isNaturalOneLevelSuitOpening(partnerCall.bid)) return null;

        const firstContractCall = auction.find((call) => isContractBid(call.bid)) || null;
        if (firstContractCall !== partnerCall) return null;
        if (highestBidCall(auction) !== partnerCall) return null;

        return {
          partnerCall,
          partnerBid: partnerCall.bid,
          doubleCall: lastCall
        };
      }

  function isNaturalOneLevelSuitOpening(candidate) {
        return candidate?.level === 1 && candidate.strain && candidate.strain !== "NT";
      }

  function openingSupportThreshold(partnerBid) {
        return partnerBid?.strain && partnerBid.strain !== "NT" ? supportLengthForOpening(partnerBid.strain) : Infinity;
      }

  function hasOpeningFit(shape, partnerBid) {
        return partnerBid?.strain && partnerBid.strain !== "NT" &&
          (shape.counts[partnerBid.strain] || 0) >= openingSupportThreshold(partnerBid);
      }

  function choosePartnerActionAfterInterference(state) {
        const { shape, hand, auction, seat, vulnerability, partnershipCalls, lastBid, lastCall } = state;
        const lastPartnerCall = lastPartnerContractCall(auction, seat);
        if (!lastPartnerCall || partnershipCalls.length !== 1) return null;

        const partnerMadeOvercall = didPartnerMakeOvercall(auction, seat, lastPartnerCall);
        if (partnerMadeOvercall) {
          const advancerAction = respondToPartnerOvercallFiveCardHigh(shape, hand, lastPartnerCall.bid, auction, seat, vulnerability);
          const nonPassAction = nonPassBid(advancerAction);
          if (nonPassAction) return nonPassAction;
        }

        if (isDouble(lastCall)) return respondAfterPartnerOpenedAndOpponentDoubledFiveCardHigh(shape, hand, lastPartnerCall.bid);
        if (lastBid && state.highestBidCall?.seat !== seat && teamOf(state.highestBidCall.seat) !== teamOf(seat)) {
          return respondAfterOvercallFiveCardHigh(shape, hand, lastPartnerCall.bid, lastBid, auction, seat, {
            partnerMadeOvercall
          });
        }
        return null;
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

  function chooseOvercallFiveCardHigh(hand, auction, seat, vulnerability = "none") {
        const shape = handShape(hand);
        const lastBid = highestBid(auction);
        if (!lastBid || !isContractBid(lastBid)) return Pass();
        const vulnerable = isTeamVulnerable(teamOf(seat), vulnerability);
        if (isWeakTwoOpponentOpening(lastBid)) return chooseWeakTwoDefenseFiveCardHigh(shape, hand, lastBid) || Pass();
        if (isPreemptOpponentOpening(lastBid)) return choosePreemptDefenseFiveCardHigh(shape, hand, lastBid) || Pass();

        return chooseFallbackBid([
          () => chooseOneNotrumpOvercall(shape, hand, lastBid),
          () => chooseWeakJumpOvercall(shape, hand, lastBid),
          () => canDoubleFromAuction(auction, seat) && shouldMakeInformationDoubleFiveCardHigh(shape, lastBid) ? Double() : null,
          () => chooseSimpleSuitOvercall(shape, hand, lastBid, vulnerable)
        ]);
      }

  function chooseWeakTwoDefenseFiveCardHigh(shape, hand, opponentBid) {
        if (!isWeakTwoOpponentOpening(opponentBid)) return null;
        return chooseFallbackBid([
          () => chooseWeakTwoDefenseNotrump(shape, hand, opponentBid),
          () => chooseWeakTwoDefenseSuitOvercall(shape, hand, opponentBid),
          () => shouldMakeWeakTwoDefenseDouble(shape, hand, opponentBid) ? Double() : null
        ], null);
      }

  function isWeakTwoOpponentOpening(candidate) {
        return candidate?.level === 2 && ["D", "H", "S"].includes(candidate.strain);
      }

  function chooseWeakTwoDefenseNotrump(shape, hand, opponentBid) {
        if (!shape.balanced || opponentBid.strain === "NT" || !hasStopper(hand, opponentBid.strain)) return null;
        if (shape.hcp >= 19) return bid(3, "NT");
        if (shape.hcp >= 15 && shape.hcp <= 18) return bid(2, "NT");
        return null;
      }

  function chooseWeakTwoDefenseSuitOvercall(shape, hand, opponentBid) {
        if (shape.hcp < 12 || shape.hcp > 15) return null;
        const overcallSuit = chooseSuitByLengthThenRank(
          suits.filter((suit) => suit !== opponentBid.strain),
          shape,
          5,
          true,
          (candidate) => suitQuality(hand, candidate) >= 2
        );
        return overcallSuit ? bid(cheapestLevelForStrain(overcallSuit, opponentBid), overcallSuit) : null;
      }

  function shouldMakeWeakTwoDefenseDouble(shape, hand, opponentBid) {
        if (!isWeakTwoOpponentOpening(opponentBid)) return false;
        return hasWeakTwoDefenseTakeoutShape(shape, opponentBid) || hasWeakTwoDefenseStrongOwnSuit(shape, hand, opponentBid);
      }

  function hasWeakTwoDefenseTakeoutShape(shape, opponentBid) {
        if (shape.hcp < 12 || (shape.counts[opponentBid.strain] || 0) > 2) return false;
        return suits
          .filter((suit) => suit !== opponentBid.strain)
          .every((suit) => (shape.counts[suit] || 0) >= (suit === "H" || suit === "S" ? 4 : 3));
      }

  function weakTwoDefenseStrongOwnSuit(shape, hand, opponentBid) {
        return chooseSuitByLengthThenRank(
          suits.filter((suit) => suit !== opponentBid.strain),
          shape,
          6,
          true,
          (candidate) => suitQuality(hand, candidate) >= 2
        );
      }

  function hasWeakTwoDefenseStrongOwnSuit(shape, hand, opponentBid) {
        return shape.hcp >= 16 && Boolean(weakTwoDefenseStrongOwnSuit(shape, hand, opponentBid));
      }

  function choosePreemptDefenseFiveCardHigh(shape, hand, opponentBid) {
        if (!isPreemptOpponentOpening(opponentBid)) return null;
        return chooseFallbackBid([
          () => choosePreemptDefenseNotrump(shape, hand, opponentBid),
          () => choosePreemptDefenseSuitOvercall(shape, hand, opponentBid),
          () => shouldMakePreemptDefenseDouble(shape, hand, opponentBid) ? Double() : null
        ], null);
      }

  function isPreemptOpponentOpening(candidate) {
        return candidate?.level >= 3 && candidate.strain && candidate.strain !== "NT";
      }

  function choosePreemptDefenseNotrump(shape, hand, opponentBid) {
        if (opponentBid.level !== 3 || !shape.balanced || shape.hcp < 19) return null;
        if (!hasStopper(hand, opponentBid.strain)) return null;
        if (!suits.every((suit) => hasStopper(hand, suit))) return null;
        return bid(3, "NT");
      }

  function choosePreemptDefenseSuitOvercall(shape, hand, opponentBid) {
        if (opponentBid.level !== 3 || shape.hcp < 13 || shape.hcp > 18) return null;
        const overcallSuit = chooseSuitByLengthThenRank(
          suits.filter((suit) => suit !== opponentBid.strain),
          shape,
          5,
          true,
          (candidate) => suitQuality(hand, candidate) >= 2 && cheapestLevelForStrain(candidate, opponentBid) === 3
        );
        return overcallSuit ? bid(3, overcallSuit) : null;
      }

  function shouldMakePreemptDefenseDouble(shape, hand, opponentBid) {
        if (!isPreemptOpponentOpening(opponentBid)) return false;
        return hasPreemptDefenseTakeoutShape(shape, opponentBid) || hasPreemptDefenseStrongOwnSuit(shape, hand, opponentBid);
      }

  function hasPreemptDefenseTakeoutShape(shape, opponentBid) {
        if (shape.hcp < 13 || (shape.counts[opponentBid.strain] || 0) > 2) return false;
        return suits
          .filter((suit) => suit !== opponentBid.strain)
          .every((suit) => (shape.counts[suit] || 0) >= (suit === "H" || suit === "S" ? 4 : 3));
      }

  function preemptDefenseStrongOwnSuit(shape, hand, opponentBid) {
        return chooseSuitByLengthThenRank(
          suits.filter((suit) => suit !== opponentBid.strain),
          shape,
          6,
          true,
          (candidate) => suitQuality(hand, candidate) >= 2
        );
      }

  function hasPreemptDefenseStrongOwnSuit(shape, hand, opponentBid) {
        return shape.hcp >= 19 && Boolean(preemptDefenseStrongOwnSuit(shape, hand, opponentBid));
      }

  function chooseOneNotrumpOvercall(shape, hand, opponentBid) {
        return shape.balanced &&
          shape.hcp >= 15 &&
          shape.hcp <= 17 &&
          opponentBid.strain !== "NT" &&
          hasStopper(hand, opponentBid.strain)
          ? bid(cheapestLevelForStrain("NT", opponentBid), "NT")
          : null;
      }

  function chooseWeakJumpOvercall(shape, hand, opponentBid) {
        const jumpSuit = chooseSuitByLengthThenRank(
          suits.filter((suit) => suit !== opponentBid.strain),
          shape,
          6,
          true,
          (candidate) => suitQuality(hand, candidate) >= 2
        );
        if (!jumpSuit || shape.hcp < 6 || shape.hcp > 11) return null;
        const baseLevel = cheapestLevelForStrain(jumpSuit, opponentBid);
        return bid(Math.min(baseLevel + 1, 4), jumpSuit);
      }

  function chooseSimpleSuitOvercall(shape, hand, opponentBid, vulnerable) {
        const overcallSuit = chooseSuitByLengthThenRank(
          suits.filter((suit) => suit !== opponentBid.strain),
          shape,
          5,
          true,
          (candidate) => suitQuality(hand, candidate) >= 2
        );
        if (!overcallSuit) return null;
        const overcallLevel = cheapestLevelForStrain(overcallSuit, opponentBid);
        const minimumHcp = overcallLevel >= 2
          ? vulnerable ? 12 : 10
          : vulnerable ? 10 : 8;
        return shape.hcp >= minimumHcp && shape.hcp <= 16 ? bid(overcallLevel, overcallSuit) : null;
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
          () => shouldMakeNegativeDoubleFiveCardHigh(shape, partnerBid, opponentBid) ? Double() : null,
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
        if (strength >= 12) return bid(gameLevel(partnerBid.strain), partnerBid.strain);
        if (strength >= 10 && supportLevel <= 3) return bid(Math.max(supportLevel, 3), partnerBid.strain);
        if (strength >= 6 && supportLevel <= 2) return bid(supportLevel, partnerBid.strain);
        return null;
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

  function shouldMakeInformationDoubleFiveCardHigh(shape, opponentBid) {
        if (!opponentBid || opponentBid.strain === "NT" || opponentBid.level > 2) return false;
        if (shape.hcp < 12 || shape.counts[opponentBid.strain] > 2) return false;
        const unbidSuits = suits
          .filter((suit) => suit !== opponentBid.strain)
        const missingSupport = unbidSuits
          .filter((suit) => shape.counts[suit] < (suit === "H" || suit === "S" ? 4 : 3));
        if (!missingSupport.length) return true;
        return shape.hcp >= 16 &&
          missingSupport.length === 1 &&
          shape.counts[missingSupport[0]] >= 3;
      }

  function shouldMakeNegativeDoubleFiveCardHigh(shape, partnerBid, opponentBid) {
        if (!partnerBid || !opponentBid || opponentBid.strain === "NT" || opponentBid.level > 2 || shape.hcp < 6) return false;
        return ["H", "S"].some((suit) => suit !== partnerBid.strain && suit !== opponentBid.strain && shape.counts[suit] >= 4);
      }


  function describeDoubleBidChoice(chosenBid, shape, hand, auction, seat, base) {
        const lastBid = highestBid(auction);
        const lastPartnerCall = lastPartnerContractCall(auction, seat);
        if (lastPartnerCall && shouldMakeNegativeDoubleFiveCardHigh(shape, lastPartnerCall.bid, lastBid)) {
          return fiveCardHighBidChoiceResult(chosenBid, "competitive.negativeDouble", "basic", "Negative double with values and an unbid four-card major after interference.", base);
        }
        if (shouldMakeWeakTwoDefenseDouble(shape, hand, lastBid)) {
          return fiveCardHighBidChoiceResult(chosenBid, "competitive.weakTwoDefenseDouble", "basic", "Defend against their weak two with a takeout double, or with a strong hand and a very good own suit.", {
            ...base,
            category: "competitive",
            opponentSuit: lastBid?.strain || null,
            takeoutShape: hasWeakTwoDefenseTakeoutShape(shape, lastBid),
            strongOwnSuit: weakTwoDefenseStrongOwnSuit(shape, hand, lastBid),
            minimumHcp: hasWeakTwoDefenseStrongOwnSuit(shape, hand, lastBid) ? 16 : 12
          });
        }
        if (shouldMakePreemptDefenseDouble(shape, hand, lastBid)) {
          return fiveCardHighBidChoiceResult(chosenBid, "competitive.preemptDefenseDouble", "basic", "Defend against their preempt with a takeout double, or with a strong hand and a very good own suit.", {
            ...base,
            category: "competitive",
            opponentSuit: lastBid?.strain || null,
            takeoutShape: hasPreemptDefenseTakeoutShape(shape, lastBid),
            strongOwnSuit: preemptDefenseStrongOwnSuit(shape, hand, lastBid),
            minimumHcp: hasPreemptDefenseStrongOwnSuit(shape, hand, lastBid) ? 19 : 13
          });
        }
        return fiveCardHighBidChoiceResult(chosenBid, "competitive.takeoutDouble", "basic", "Takeout double with 12+ HCP, shortness in their suit, and support for the unbid suits; with 16+ HCP one unbid suit may be only three cards.", base);
      }

  function describeRedoubleBidChoice(chosenBid, shape, auction, seat, base) {
        const context = partnerOpeningDoubleContext(auction, seat);
        if (!context) {
          return fiveCardHighBidChoiceResult(chosenBid, "competitive.redouble", "basic", "Redouble with extra values after the opponents doubled partner's side.", base);
        }

        const partnerSuit = context.partnerBid.strain;
        const support = shape.counts[partnerSuit] || 0;
        const supportThreshold = openingSupportThreshold(context.partnerBid);
        return fiveCardHighBidChoiceResult(chosenBid, "competitive.redoubleAfterPartnerOpeningDouble", "basic", "Redouble after partner's opening was doubled with 10+ HCP, no fit, and possible penalty interest.", {
          ...base,
          category: "competitive",
          minimumHcp: 10,
          partnerSuit,
          support,
          supportThreshold,
          noFit: support < supportThreshold,
          penaltyInterest: true
        });
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

        const takeoutResponseContext = partnerTakeoutDoubleResponseContext(auction, seat, partnershipCalls);
        if (takeoutResponseContext) {
          return describeTakeoutDoubleResponseChoice(chosenBid, shape, takeoutResponseContext, extra);
        }

        if (!partnershipCalls.length) {
          if (isWeakTwoOpponentOpening(lastBid)) {
            if (chosenBid.strain === "NT") {
              const game = chosenBid.level >= 3;
              return fiveCardHighBidChoiceResult(chosenBid, game ? "competitive.weakTwoDefenseNotrumpGame" : "competitive.weakTwoDefenseNotrumpInvite", "basic", "Defend against their weak two with notrump, balanced strength, and a stopper in their suit.", {
                ...extra,
                minimumHcp: game ? 19 : 15,
                maximumHcp: game ? undefined : 18,
                stopperSuit: lastBid.strain
              });
            }
            return fiveCardHighBidChoiceResult(chosenBid, "competitive.weakTwoDefenseSuitOvercall", "basic", "Defend against their weak two with a reasonable five-card suit and 12-15 HCP.", {
              ...extra,
              minimumHcp: 12,
              maximumHcp: 15
            });
          }
          if (isPreemptOpponentOpening(lastBid)) {
            if (chosenBid.strain === "NT") {
              return fiveCardHighBidChoiceResult(chosenBid, "competitive.preemptDefenseNotrumpGame", "basic", "Defend against their preempt with 3NT, balanced strength, and stoppers.", {
                ...extra,
                minimumHcp: 19,
                stopperSuit: lastBid.strain
              });
            }
            return fiveCardHighBidChoiceResult(chosenBid, "competitive.preemptDefenseSuitOvercall", "basic", "Defend against their preempt with a five-card suit, two honors, and 13-18 HCP.", {
              ...extra,
              minimumHcp: 13,
              maximumHcp: 18
            });
          }
          if (chosenBid.strain === "NT") {
            return fiveCardHighBidChoiceResult(chosenBid, "competitive.oneNotrumpOvercall", "basic", "Overcall in notrump with 15-17 HCP, balanced shape, and a stopper.", extra);
          }
          const jumpLevel = lastBid ? cheapestLevelForStrain(chosenBid.strain, lastBid) + 1 : chosenBid.level;
          if (chosenBid.level >= jumpLevel && shape.hcp <= 11) {
            return fiveCardHighBidChoiceResult(chosenBid, "competitive.jumpOvercall", "basic", "Jump overcall with a good six-card suit and limited strength.", extra);
          }
          const minimumHcp = chosenBid.level >= 2
            ? vulnerable ? 12 : 10
            : vulnerable ? 10 : 8;
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
          return fiveCardHighBidChoiceResult(chosenBid, "competitive.takeoutDoubleOneNotrump", "basic", "Bid 1NT after partner's takeout double with 6-9 HCP, balanced shape, and a stopper in their suit.", {
            ...extra,
            minimumHcp: 6,
            stopperSuit: context.currentOpponentBid?.strain || context.doubledBid?.strain || null
          });
        }

        if (!forced) {
          return fiveCardHighBidChoiceResult(chosenBid, "competitive.takeoutDoubleVoluntarySuit", "basic", "After right-hand opponent bids, the obligation is gone; bid a new unbid suit voluntarily with enough HCP and at least a four-card suit.", {
            ...extra,
            minimumHcp: chosenBid.level >= 2 ? 10 : 6
          });
        }

        const cheapestLevel = cheapestLevelForStrain(chosenBid.strain, context.doubledBid);
        if (shape.hcp >= 9 && shape.hcp <= 11 && chosenBid.level >= cheapestLevel + 1) {
          return fiveCardHighBidChoiceResult(chosenBid, "competitive.takeoutDoubleJumpSuit", "basic", "Jump in the longest unbid suit with 9-11 HCP after partner's takeout double.", {
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
    describeRedoubleBidChoice,
    describeDoubleBidChoice,
    describeCompetitiveFiveCardHighBidChoice,
    describeTakeoutDoubleRebidChoice
  };
});

(function initBridgeRulesPlayPlanSuitContractTrumps(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const deps = isCommonJs
    ? { core: require("../../core.js"), common: require("../common.js") }
    : { core: root.BridgeRulesParts?.core, common: root.BridgeRulesPlayPlanParts?.common };
  const api = factory(deps.core, deps.common);
  if (isCommonJs) module.exports = api;
  root.BridgeRulesPlayPlanParts = root.BridgeRulesPlayPlanParts || {};
  root.BridgeRulesPlayPlanParts.suitContractTrumps = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesPlayPlanSuitContractTrumps(core, common) {
  "use strict";

  if (!core) throw new Error("BridgeRules play-plan suit-contract suitContractTrumps missing core dependency");
  if (!common) throw new Error("BridgeRules play-plan suit-contract suitContractTrumps missing common dependency");

  const {
    seats,
    suits,
    rankOrder,
    descendingRanks,
    hcpValue,
    compareCards,
    lowestCard,
    highestCard,
    teamOf,
    partnerOf
  } = core;
  const {
    visibleTopWinnerRanks,
    seatForSuitRank,
    blockedSuitInfo,
    cardsInSuit,
    hasRank,
    playedCardsFrom,
    finesseCandidate,
    repeatFinesseCandidate
  } = common;

  function trumpEntryCandidateForSeat({
      declarerHand,
      dummyHand,
      trump,
      playedCards = [],
      entrySeat,
      fromSeat,
      declarer,
      dummy
    }) {
        const entryHand = entrySeat === declarer ? declarerHand : entrySeat === dummy ? dummyHand : [];
        const fromHand = fromSeat === declarer ? declarerHand : fromSeat === dummy ? dummyHand : [];
        const entryTrumps = cardsInSuit(entryHand, trump);
        const fromTrumps = cardsInSuit(fromHand, trump);
        if (!entryTrumps.length || !fromTrumps.length) return null;

        const winnerRanks = visibleTopWinnerRanks([...entryTrumps, ...fromTrumps], cardsInSuit(playedCards, trump));
        const entryWinnerRanks = winnerRanks.filter((rank) => hasRank(entryTrumps, rank));
        if (!entryWinnerRanks.length) return null;
        const leadCard = lowestCard(fromTrumps);
        if (!leadCard) return null;

        return {
          entryRank: entryWinnerRanks[0],
          leadRank: leadCard.rank,
          leadCard,
          remainingEntries: entryWinnerRanks.length
        };
      }



  function suitContractTimingPlan({
      declarerHand,
      dummyHand,
      trump,
      declarer,
      dummy,
      trickHistory = [],
      currentTrick = [],
      ruffPriorities = [],
      cashPriorities = [],
      urgentDiscardPriorities = [],
      developDiscardPriorities = [],
      trumpEntryFinessePriorities = [],
      workSuitTrumpEntryPriorities = [],
      lateCrossRuffPriorities = [],
      crossRuffPriorities = []
    }) {
        const trumpControl = suitTrumpControl({
          declarerHand,
          dummyHand,
          trump,
          declarer,
          dummy,
          trickHistory,
          currentTrick
        });
        const urgentDiscard = urgentDiscardPriorities[0] || null;
        if (urgentDiscard) {
          return {
            timing: "afterUrgentDiscard",
            delayReason: "discardLoserOnWinner",
            delaySuit: urgentDiscard.suit,
            attackedSuit: urgentDiscard.attackedSuit,
            trumpControl,
            roundLimit: null,
            preserveSeat: null,
            preserveTrumpCount: 0
          };
        }
        const unblock = cashPriorities.find((priority) => priority.timing === "unblockBeforeEntry");
        if (unblock) {
          return {
            timing: "afterUnblock",
            delayReason: "blockedSideSuit",
            delaySuit: unblock.suit,
            trumpControl,
            roundLimit: null,
            preserveSeat: null,
            preserveTrumpCount: 0
          };
        }
        const developDiscard = developDiscardPriorities[0] || null;
        if (developDiscard) {
          return {
            timing: "afterDevelopedDiscard",
            delayReason: "establishSideSuitForDiscard",
            delaySuit: developDiscard.suit,
            discardSuit: developDiscard.discardSuit,
            trumpControl,
            roundLimit: null,
            preserveSeat: null,
            preserveTrumpCount: 0
          };
        }
        const trumpEntryFinesse = trumpEntryFinessePriorities[0] || null;
        if (trumpEntryFinesse) {
          return {
            timing: "afterTrumpEntryFinesse",
            delayReason: "useTrumpEntriesForRepeatedFinesse",
            delaySuit: trumpEntryFinesse.finesseSuit,
            trumpControl,
            roundLimit: null,
            preserveSeat: null,
            preserveTrumpCount: 0
          };
        }
        const workSuitTrumpEntry = workSuitTrumpEntryPriorities[0] || null;
        if (workSuitTrumpEntry) {
          return {
            timing: "afterWorkSuitBeforeTrumpEntry",
            delayReason: "developSideSuitBeforeTrumpEntry",
            delaySuit: workSuitTrumpEntry.suit,
            trumpControl,
            roundLimit: null,
            preserveSeat: null,
            preserveTrumpCount: 0
          };
        }
        const lateCrossRuff = lateCrossRuffPriorities[0] || null;
        if (lateCrossRuff) {
          return {
            timing: "afterLateCrossRuff",
            delayReason: "lateCrossRuff",
            delaySuit: lateCrossRuff.currentSuit || lateCrossRuff.nextSuit || lateCrossRuff.suit || null,
            trumpControl,
            defendersRemainingTrumps: lateCrossRuff.defendersRemainingTrumps,
            roundLimit: null,
            preserveSeat: null,
            preserveTrumpCount: 0
          };
        }
        const crossRuff = crossRuffPriorities[0] || null;
        if (crossRuff) {
          return {
            timing: "afterCrossRuff",
            delayReason: "crossRuff",
            delaySuit: crossRuff.suit,
            trumpControl,
            roundLimit: null,
            preserveSeat: null,
            preserveTrumpCount: 0
          };
        }

        const firstRuff = ruffPriorities[0] || null;
        if (firstRuff) {
          const preserveTrumpCount = Math.max(1, firstRuff.maxUsefulRuffs || firstRuff.estimatedRuffsNeeded || 1);
          const base = {
            delayReason: firstRuff.kind === "establishLongSuitByRuffing" ? "longSuitRuffDevelopment" : "shortSuitRuff",
            delaySuit: firstRuff.suit,
            trumpControl,
            preserveSeat: firstRuff.shortSeat,
            preserveTrumpCount
          };
          if (trumpControl.missingHonors.length && trumpControl.playedTrumpRounds < 1) {
            return {
              ...base,
              timing: "limitedBeforeRuff",
              roundLimit: 1
            };
          }
          return {
            ...base,
            timing: firstRuff.kind === "establishLongSuitByRuffing" ? "afterLongSuitRuff" : "afterRuff",
            roundLimit: null
          };
        }

        return {
          timing: "early",
          delayReason: "stableTrumpControl",
          delaySuit: null,
          trumpControl,
          roundLimit: null,
          preserveSeat: null,
          preserveTrumpCount: 0
        };
      }



  function suitTrumpControl({ declarerHand = [], dummyHand = [], trump, declarer = null, dummy = null, trickHistory = [], currentTrick = [] }) {
        const declarerTrumpCards = cardsInSuit(declarerHand, trump);
        const dummyTrumpCards = cardsInSuit(dummyHand, trump);
        const playedTrumpCards = cardsInSuit(playedCardsFrom(trickHistory, currentTrick), trump);
        const visibleRanks = new Set([...declarerTrumpCards, ...dummyTrumpCards, ...playedTrumpCards].map((card) => card.rank));
        const missingHonors = ["A", "K", "Q"].filter((rank) => !visibleRanks.has(rank));
        return {
          trump,
          declarer,
          dummy,
          declarerTrumpLength: declarerTrumpCards.length,
          dummyTrumpLength: dummyTrumpCards.length,
          trumpLength: declarerTrumpCards.length + dummyTrumpCards.length,
          playedTrumpCards: playedTrumpCards.length,
          playedTrumpRounds: playedTrumpRoundsFrom(trickHistory, currentTrick, trump),
          missingHonors
        };
      }



  function playedTrumpRoundsFrom(trickHistory = [], currentTrick = [], trump) {
        const completedRounds = trickHistory.filter((trick) => trick.cards?.[0]?.card?.suit === trump).length;
        const currentRound = currentTrick[0]?.card?.suit === trump ? 1 : 0;
        return completedRounds + currentRound;
      }




  function trumpDelayPlan(ruffPriorities, cashPriorities) {
        if (ruffPriorities.length) {
          const first = ruffPriorities[0];
          return {
            timing: "afterRuff",
            reason: first.kind === "establishLongSuitByRuffing" ? "longSuitRuffDevelopment" : "shortSuitRuff",
            suit: first.suit
          };
        }
        const unblock = cashPriorities.find((priority) => priority.timing === "unblockBeforeEntry");
        if (unblock) {
          return {
            timing: "afterUnblock",
            reason: "blockedSideSuit",
            suit: unblock.suit
          };
        }
        return {
          timing: "early",
          reason: "stableTrumpControl"
        };
      }



  function drawTrumpPriority(declarerHand, dummyHand, trump, timingPlan) {
        const trumpLength = cardsInSuit(declarerHand, trump).length + cardsInSuit(dummyHand, trump).length;
        if (trumpLength < 7) return null;
        const trumpControl = timingPlan?.trumpControl || suitTrumpControl({ declarerHand, dummyHand, trump });
        const missingHonors = trumpControl.missingHonors || [];
        const timing = timingPlan?.timing || "early";
        return {
          kind: "drawTrumps",
          confidence: missingHonors.length >= 2 ? "uncertain" : "basic",
          suit: trump,
          trumpLength: trumpControl.trumpLength || trumpLength,
          missingHonors,
          timing,
          delayReason: timingPlan?.delayReason || "stableTrumpControl",
          delaySuit: timingPlan?.delaySuit || null,
          roundLimit: timingPlan?.roundLimit ?? null,
          playedTrumpRounds: trumpControl.playedTrumpRounds || 0,
          preserveSeat: timingPlan?.preserveSeat || null,
          preserveTrumpCount: timingPlan?.preserveTrumpCount || 0,
          trumpControl,
          score: (timing === "early" ? 30 : timing === "limitedBeforeRuff" ? 40 : 12) + trumpLength - missingHonors.length * 3
        };
      }



  return {
    trumpEntryCandidateForSeat,
    suitContractTimingPlan,
    suitTrumpControl,
    playedTrumpRoundsFrom,
    trumpDelayPlan,
    drawTrumpPriority
  };
});

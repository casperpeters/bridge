(function initBridgeRulesPlayPlan(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const deps = isCommonJs
    ? { core: require("./core.js"), playMechanics: require("./play-mechanics.js") }
    : root.BridgeRulesParts || {};
  const api = factory(deps.core, deps.playMechanics);
  if (isCommonJs) module.exports = api;
  root.BridgeRulesParts = root.BridgeRulesParts || {};
  root.BridgeRulesParts.playPlan = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesPlayPlan(core, playMechanics) {
  "use strict";

  const {
    suits,
    rankOrder,
    descendingRanks,
    hcpValue,
    compareCards,
    lowestCard,
    highestCard,
    partnerOf
  } = core;

  const developmentRanks = ["A", "K", "Q", "J", "T"];
  const finessePatterns = [
    {
      missingHonors: ["K"],
      finesseRank: "Q",
      guardRanks: ["A"],
      ruleId: "finesseTowardHonor",
      action: "leadTowardFinesse",
      reason: "Lead low toward a protected honor to try a notrump finesse.",
      score: 90
    },
    {
      missingHonors: ["Q"],
      finesseRank: "J",
      guardRanks: ["A", "K"],
      ruleId: "finesseTowardHonor",
      action: "leadTowardFinesse",
      reason: "Lead low toward a protected honor to try a notrump finesse.",
      score: 80
    },
    {
      missingHonors: ["A", "Q"],
      finesseRank: "J",
      guardRanks: ["K"],
      minLeadCards: 2,
      ruleId: "doubleFinesseTowardHonor",
      action: "leadTowardDoubleFinesse",
      reason: "Lead low toward the jack to try the first round of a notrump double finesse.",
      score: 70
    },
    {
      missingHonors: ["K", "Q"],
      finesseRank: "T",
      guardRanks: ["A", "J"],
      minLeadCards: 2,
      ruleId: "doubleFinesseTowardHonor",
      action: "leadTowardDoubleFinesse",
      reason: "Lead low toward the ten to try the first round of a notrump double finesse.",
      score: 68
    },
    {
      missingHonors: ["A", "J"],
      finesseRank: "T",
      guardRanks: ["K", "Q"],
      minLeadCards: 2,
      ruleId: "doubleFinesseTowardHonor",
      action: "leadTowardDoubleFinesse",
      reason: "Lead low toward the ten to try the first round of a notrump double finesse.",
      score: 66
    },
    {
      missingHonors: ["A", "K"],
      finesseRank: "T",
      guardRanks: ["Q", "J"],
      minLeadCards: 2,
      ruleId: "doubleFinesseTowardHonor",
      action: "leadTowardDoubleFinesse",
      reason: "Lead low toward the ten to try the first round of a notrump double finesse.",
      score: 64
    }
  ];

  function createPlayPlan({
      declarerHand = [],
      dummyHand = [],
      contract = null,
      declarer = null,
      dummy = null,
      trickHistory = []
    } = {}) {
      if (!contract || !declarer || !dummy || !declarerHand.length || !dummyHand.length) return null;
      if (contract.strain === "NT") {
        return createNotrumpPlayPlan({ declarerHand, dummyHand, contract, declarer, dummy, trickHistory });
      }
      return createSuitPlayPlan({ declarerHand, dummyHand, contract, declarer, dummy });
    }

  function createNotrumpPlayPlan({ declarerHand, dummyHand, contract, declarer, dummy, trickHistory }) {
      const playedCards = playedCardsFrom(trickHistory, []);
      const neededTricks = contract.level + 6;
      const sureWinners = countSureWinners(declarerHand, dummyHand, playedCards, declarer, dummy);
      const developmentPriorities = notrumpDevelopmentPriorities({ declarerHand, dummyHand, declarer, dummy, playedCards });
      const finessePriorities = notrumpFinessePriorities({ declarerHand, dummyHand, declarer, dummy, playedCards });
      const cashPriorities = notrumpCashPriorities(sureWinners, neededTricks);
      const priorities = [
        ...cashPriorities,
        ...developmentPriorities,
        ...finessePriorities
      ].sort((a, b) => b.score - a.score);
      const selectedPriorities = uniquePlanPriorities(priorities).slice(0, 3);
      const warnings = notrumpPlanWarnings(selectedPriorities, { declarerHand, dummyHand, declarer, dummy, sureWinners });

      if (!selectedPriorities.length && sureWinners.total >= neededTricks) {
        selectedPriorities.push({
          kind: "cashSureWinners",
          confidence: "basic",
          score: 1
        });
      }

      return {
        type: "notrump",
        confidence: selectedPriorities.some((priority) => priority.confidence === "uncertain") || warnings.length ? "uncertain" : "basic",
        neededTricks,
        sureWinners,
        losers: null,
        needToDevelop: Math.max(0, neededTricks - sureWinners.total),
        priorities: selectedPriorities,
        warnings,
        declarer,
        dummy
      };
    }

  function countSureWinners(declarerHand, dummyHand, playedCards, declarer, dummy) {
        const bySuit = {};
        const detailsBySuit = {};
        for (const suit of suits) {
          const detail = notrumpSuitWinnerDetail({
            declarerHand,
            dummyHand,
            playedCards,
            declarer,
            dummy,
            suit
          });
          detailsBySuit[suit] = detail;
          bySuit[suit] = detail.cashableWinners;
        }
        return {
          total: Object.values(bySuit).reduce((total, count) => total + count, 0),
          bySuit,
          detailsBySuit
        };
      }

  function notrumpSuitWinnerDetail({ declarerHand, dummyHand, playedCards, declarer, dummy, suit }) {
      const declarerSuitCards = cardsInSuit(declarerHand, suit);
      const dummySuitCards = cardsInSuit(dummyHand, suit);
      const playedSuitCards = cardsInSuit(playedCards, suit);
      const combinedCards = [...declarerSuitCards, ...dummySuitCards];
      const winnerRanks = visibleTopWinnerRanks(combinedCards, playedSuitCards);
      const blockage = blockedSuitInfo({
        declarerHand,
        dummyHand,
        declarerSuitCards,
        dummySuitCards,
        declarer,
        dummy,
        suit,
        winnerRanks
      });
      const cashableRanks = blockage && !blockage.entryCard ? blockage.cashFirstRanks : winnerRanks;

      return {
        suit,
        winners: winnerRanks.length,
        cashableWinners: cashableRanks.length,
        winnerRanks,
        cashableRanks,
        blocked: Boolean(blockage),
        blockedSeat: blockage?.blockedSeat || null,
        longSeat: blockage?.longSeat || null,
        cashFirstRanks: blockage?.cashFirstRanks || [],
        strandedRanks: blockage?.strandedRanks || [],
        entryCard: blockage?.entryCard || null,
        entryTiming: blockage ? (blockage.entryCard ? "unblockBeforeEntry" : "blockedNoEntry") : "free"
      };
    }

  function visibleTopWinnerRanks(combinedCards, playedSuitCards = []) {
        const visibleRanks = new Set(combinedCards.map((card) => card.rank));
        const playedRanks = new Set(playedSuitCards.map((card) => card.rank));
        const winners = [];
        for (const rank of [...rankOrder].reverse()) {
          if (visibleRanks.has(rank)) {
            winners.push(rank);
          } else if (!playedRanks.has(rank)) {
            break;
          }
        }
        return winners;
      }

  function seatForSuitRank(rank, declarerSuitCards, dummySuitCards, declarer, dummy) {
        if (declarerSuitCards.some((card) => card.rank === rank)) return declarer;
        if (dummySuitCards.some((card) => card.rank === rank)) return dummy;
        return null;
      }

  function blockedSuitInfo({
      declarerHand,
      dummyHand,
      declarerSuitCards,
      dummySuitCards,
      declarer,
      dummy,
      suit,
      winnerRanks
    }) {
      if (winnerRanks.length < 2 || !declarer || !dummy) return null;
      const sides = [
        { seat: declarer, hand: declarerHand, suitCards: declarerSuitCards },
        { seat: dummy, hand: dummyHand, suitCards: dummySuitCards }
      ].sort((a, b) => b.suitCards.length - a.suitCards.length);
      const longSide = sides[0];
      const shortSide = sides[1];
      if (longSide.suitCards.length < 3 || !shortSide.suitCards.length) return null;

      const cashFirstRanks = [];
      for (const rank of winnerRanks) {
        if (seatForSuitRank(rank, declarerSuitCards, dummySuitCards, declarer, dummy) !== shortSide.seat) break;
        cashFirstRanks.push(rank);
      }
      if (!cashFirstRanks.length || cashFirstRanks.length < shortSide.suitCards.length) return null;

      const strandedRanks = winnerRanks
        .slice(cashFirstRanks.length)
        .filter((rank) => seatForSuitRank(rank, declarerSuitCards, dummySuitCards, declarer, dummy) === longSide.seat);
      if (!strandedRanks.length) return null;

      return {
        blockedSeat: shortSide.seat,
        longSeat: longSide.seat,
        cashFirstRanks,
        strandedRanks,
        entryCard: clearOutsideEntryCard(longSide.hand, suit)
      };
    }

  function clearOutsideEntryCard(hand, excludedSuit) {
        return [...hand]
          .filter((card) => card.suit !== excludedSuit && card.rank === "A")
          .sort(compareCards)[0] || null;
      }

  function entryPlanForHand(hand, excludedSuit) {
        const entryCard = clearOutsideEntryCard(hand, excludedSuit);
        if (!entryCard) {
          return {
            entryType: "none",
            entrySuit: null,
            entryRank: null,
            entryTiming: "noClearEntry",
            entryCount: 0
          };
        }
        return {
          entryType: "outsideAce",
          entrySuit: entryCard.suit,
          entryRank: entryCard.rank,
          entryTiming: "outsideEntry",
          entryCount: clearOutsideEntries(hand, excludedSuit)
        };
      }

  function notrumpCashPriorities(sureWinners, neededTricks) {
        const enoughToCash = sureWinners.total >= neededTricks;
        return suits
          .map((suit) => sureWinners.detailsBySuit[suit])
          .filter((detail) => detail?.cashableWinners > 0)
          .filter((detail) => enoughToCash || (detail.blocked && detail.entryCard))
          .map((detail) => {
            const unblockFirst = detail.blocked && detail.entryCard;
            return {
              kind: "cashWinners",
              confidence: unblockFirst || enoughToCash ? "basic" : "uncertain",
              suit: detail.suit,
              winnerCount: detail.winners,
              cashableWinners: detail.cashableWinners,
              cashRanks: unblockFirst ? detail.cashFirstRanks : detail.cashableRanks,
              blocked: detail.blocked,
              firstSeat: unblockFirst ? detail.blockedSeat : null,
              targetSeat: unblockFirst ? detail.longSeat : null,
              entrySuit: detail.entryCard?.suit || null,
              entryRank: detail.entryCard?.rank || null,
              timing: unblockFirst ? "unblockBeforeEntry" : "cashNow",
              score: (unblockFirst ? 120 : 20) + detail.cashableWinners * 4
            };
          });
      }

  function notrumpDevelopmentPriorities({ declarerHand, dummyHand, declarer, dummy, playedCards }) {
      const candidates = [];
      for (const suit of suits) {
        const declarerSuitCards = cardsInSuit(declarerHand, suit);
        const dummySuitCards = cardsInSuit(dummyHand, suit);
        const playedSuitCards = cardsInSuit(playedCards, suit);
        const combinedCards = [...declarerSuitCards, ...dummySuitCards];
        if (combinedCards.length < 6) continue;

        [
          { seat: declarer, cards: declarerSuitCards, hand: declarerHand },
          { seat: dummy, cards: dummySuitCards, hand: dummyHand }
        ].forEach((source) => {
          if (source.cards.length < 4) return;
          const run = topTouchingHonorRun(source.cards);
          if (!run) return;
          const missingHigher = missingHigherRanks(run, combinedCards, playedSuitCards);
          if (missingHigher.length !== 1) return;
          const entryPlan = entryPlanForHand(source.hand, suit);
          candidates.push({
            kind: "developLongSuit",
            confidence: "uncertain",
            suit,
            suitLength: combinedCards.length,
            sourceSeat: source.seat,
            sourceLength: source.cards.length,
            sequence: run.ranks.join(""),
            missingStopper: missingHigher[0],
            entryType: entryPlan.entryType,
            entrySuit: entryPlan.entrySuit,
            entryRank: entryPlan.entryRank,
            entryTiming: entryPlan.entryTiming,
            entryCount: entryPlan.entryCount,
            score: combinedCards.length * 4 + source.cards.length * 3 + run.ranks.length * 8 + (entryPlan.entryCount ? 8 : -8)
          });
        });
      }
      return candidates;
    }

  function notrumpFinessePriorities({ declarerHand, dummyHand, declarer, dummy, playedCards }) {
      const candidates = [];
      for (const suit of suits) {
        const declarerSuitCards = cardsInSuit(declarerHand, suit);
        const dummySuitCards = cardsInSuit(dummyHand, suit);
        const playedSuitCards = cardsInSuit(playedCards, suit);
        [
          {
            currentSuitCards: declarerSuitCards,
            partnerSuitCards: dummySuitCards,
            partnerHand: dummyHand,
            targetSeat: dummy
          },
          {
            currentSuitCards: dummySuitCards,
            partnerSuitCards: declarerSuitCards,
            partnerHand: declarerHand,
            targetSeat: declarer
          }
        ].forEach((direction) => {
          const candidate = finesseCandidate({
            suit,
            partnerHand: direction.partnerHand,
            currentSuitCards: direction.currentSuitCards,
            partnerSuitCards: direction.partnerSuitCards,
            playedSuitCards,
            partnerSeat: direction.targetSeat
          });
          if (!candidate) return;
          candidates.push({
            kind: candidate.ruleId === "doubleFinesseTowardHonor" ? "doubleFinesse" : "finesse",
            confidence: "uncertain",
            suit,
            targetSeat: candidate.targetSeat,
            finesseRank: candidate.finesseRank,
            missingHonor: candidate.missingHonor,
            missingHonors: candidate.missingHonors,
            score: candidate.score - 20
          });
        });
      }
      return candidates;
    }

  function uniquePlanPriorities(priorities) {
        const seen = new Set();
        return priorities.filter((priority) => {
          const key = `${priority.kind}:${priority.suit || ""}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      }

  function notrumpPlanWarnings(priorities, { declarerHand, dummyHand, declarer, dummy, sureWinners }) {
      const warnings = [];
      priorities
        .filter((priority) => priority.kind === "developLongSuit")
        .forEach((priority) => {
          if (priority.entryTiming !== "noClearEntry") return;
          warnings.push({
            kind: "entryRisk",
            suit: priority.suit,
            sourceSeat: priority.sourceSeat === declarer ? declarer : dummy
          });
        });
      for (const suit of suits) {
        const detail = sureWinners?.detailsBySuit?.[suit];
        if (!detail?.blocked || detail.entryCard) continue;
        warnings.push({
          kind: "blockedSuit",
          suit,
          blockedSeat: detail.blockedSeat,
          longSeat: detail.longSeat,
          cashFirstRanks: detail.cashFirstRanks,
          strandedRanks: detail.strandedRanks
        });
      }
      return warnings;
    }

  function clearOutsideEntries(hand, excludedSuit) {
        return hand.filter((card) => card.suit !== excludedSuit && card.rank === "A").length;
      }

  function createSuitPlayPlan({ declarerHand, dummyHand, contract, declarer, dummy }) {
      const neededTricks = contract.level + 6;
      const trump = contract.strain;
      const losers = countSuitContractLosers(declarerHand, dummyHand, trump, neededTricks);
      const priorities = [];
      const ruffPriorities = shortSuitRuffPriorities(declarerHand, dummyHand, trump, dummy, losers.detailsBySuit);
      const cashPriorities = suitCashPriorities(declarerHand, dummyHand, trump, declarer, dummy);
      const trumpPriority = drawTrumpPriority(declarerHand, dummyHand, trump, trumpDelayPlan(ruffPriorities, cashPriorities));

      if (trumpPriority?.timing === "early") {
        if (trumpPriority) priorities.push(trumpPriority);
        priorities.push(...cashPriorities.slice(0, 2));
      } else {
        priorities.push(...ruffPriorities.slice(0, 2));
        priorities.push(...cashPriorities.filter((priority) => priority.timing === "unblockBeforeEntry").slice(0, 1));
        if (trumpPriority) priorities.push(trumpPriority);
        priorities.push(...cashPriorities.filter((priority) => priority.timing !== "unblockBeforeEntry").slice(0, 1));
      }
      if (!priorities.length) {
        priorities.push({
          kind: "cashSureWinners",
          confidence: "basic",
          score: 1
        });
      }

      const warnings = [];
      if (losers.total > losers.allowed) {
        warnings.push({
          kind: "tooManyLosers",
          losers: losers.total,
          allowed: losers.allowed
        });
      }
      cashPriorities
        .filter((priority) => priority.timing === "blockedNoEntry")
        .forEach((priority) => {
          warnings.push({
            kind: "blockedSuit",
            suit: priority.suit,
            blockedSeat: priority.firstSeat,
            longSeat: priority.targetSeat,
            cashFirstRanks: priority.cashRanks,
            strandedRanks: priority.strandedRanks
          });
        });

      return {
        type: "suit",
        confidence: warnings.length ? "uncertain" : "basic",
        neededTricks,
        sureWinners: null,
        losers,
        needToDevelop: 0,
        priorities: priorities.slice(0, 3),
        warnings,
        declarer,
        dummy
      };
    }

  function countSuitContractLosers(declarerHand, dummyHand, trump, neededTricks) {
        const bySuit = {};
        const rawBySuit = {};
        const detailsBySuit = {};
        const dummyTrumpLength = cardsInSuit(dummyHand, trump).length;
        for (const suit of suits) {
          const detail = suitLoserEstimate(
            cardsInSuit(declarerHand, suit),
            cardsInSuit(dummyHand, suit),
            {
              isTrump: suit === trump,
              dummyTrumpLength
            }
          );
          detailsBySuit[suit] = detail;
          bySuit[suit] = detail.losers;
          rawBySuit[suit] = detail.rawLosers;
        }
        return {
          total: Object.values(bySuit).reduce((total, count) => total + count, 0),
          bySuit,
          rawBySuit,
          detailsBySuit,
          allowed: 13 - neededTricks
        };
      }

  function suitLoserEstimate(declarerSuitCards, dummySuitCards, { isTrump, dummyTrumpLength }) {
      if (!declarerSuitCards.length) {
        return {
          losers: 0,
          rawLosers: 0,
          topLosers: [],
          missingTopHonors: [],
          coverCards: [],
          ruffReduction: 0,
          trumpLengthCredit: 0,
          declarerLength: 0,
          dummyLength: dummySuitCards.length,
          combinedLength: dummySuitCards.length
        };
      }
      const checks = ["A", "K", "Q"].slice(0, Math.min(3, declarerSuitCards.length));
      const declarerRanks = new Set(declarerSuitCards.map((card) => card.rank));
      const dummyRanks = new Set(dummySuitCards.map((card) => card.rank));
      const visibleRanks = new Set([...declarerRanks, ...dummyRanks]);
      const missingTopHonors = checks.filter((rank) => !visibleRanks.has(rank));
      const coverCards = checks.filter((rank) => !declarerRanks.has(rank) && dummyRanks.has(rank));
      const rawLosers = missingTopHonors.length;
      const combinedLength = declarerSuitCards.length + dummySuitCards.length;
      const trumpLengthCredit = isTrump && combinedLength >= 9 && rawLosers > 0 ? 1 : 0;
      const ruffReduction = !isTrump && dummySuitCards.length <= 1 && dummyTrumpLength >= 2
        ? Math.min(rawLosers, Math.max(0, declarerSuitCards.length - dummySuitCards.length), 1)
        : 0;
      return {
        losers: Math.max(0, rawLosers - trumpLengthCredit - ruffReduction),
        rawLosers,
        topLosers: missingTopHonors,
        missingTopHonors,
        coverCards,
        ruffReduction,
        trumpLengthCredit,
        declarerLength: declarerSuitCards.length,
        dummyLength: dummySuitCards.length,
        combinedLength
      };
    }

  function shortSuitRuffPriorities(declarerHand, dummyHand, trump, dummy, detailsBySuit) {
        const dummyTrumps = cardsInSuit(dummyHand, trump);
        if (dummyTrumps.length < 2) return [];
        return suits
          .filter((suit) => suit !== trump)
          .map((suit) => ({
            kind: "ruffShortSuit",
            confidence: "basic",
            suit,
            shortSeat: dummy,
            shortLength: cardsInSuit(dummyHand, suit).length,
            declarerLength: cardsInSuit(declarerHand, suit).length,
            losers: detailsBySuit[suit]?.rawLosers || 0,
            ruffReduction: detailsBySuit[suit]?.ruffReduction || 0,
            score: (detailsBySuit[suit]?.rawLosers || 0) * 20 - cardsInSuit(dummyHand, suit).length * 3
          }))
          .filter((priority) => priority.shortLength <= 1 && priority.declarerLength >= 2 && priority.losers > 0)
          .sort((a, b) => b.score - a.score);
      }

  function suitCashPriorities(declarerHand, dummyHand, trump, declarer, dummy) {
        return suits
          .filter((suit) => suit !== trump)
          .map((suit) => {
            const declarerSuitCards = cardsInSuit(declarerHand, suit);
            const dummySuitCards = cardsInSuit(dummyHand, suit);
            const winnerRanks = visibleTopWinnerRanks([...declarerSuitCards, ...dummySuitCards], []);
            if (!winnerRanks.length) return null;
            const blockage = blockedSuitInfo({
              declarerHand,
              dummyHand,
              declarerSuitCards,
              dummySuitCards,
              declarer,
              dummy,
              suit,
              winnerRanks
            });
            const hasBlockage = Boolean(blockage);
            const unblockFirst = Boolean(blockage?.entryCard);
            const cashRanks = hasBlockage && !unblockFirst ? blockage.cashFirstRanks : unblockFirst ? blockage.cashFirstRanks : winnerRanks;
            return {
              kind: "cashWinners",
              confidence: hasBlockage && !unblockFirst ? "uncertain" : "basic",
              suit,
              winnerCount: winnerRanks.length,
              cashableWinners: cashRanks.length,
              cashRanks,
              blocked: hasBlockage,
              firstSeat: hasBlockage ? blockage.blockedSeat : null,
              targetSeat: hasBlockage ? blockage.longSeat : null,
              entrySuit: blockage?.entryCard?.suit || null,
              entryRank: blockage?.entryCard?.rank || null,
              strandedRanks: hasBlockage ? blockage.strandedRanks : [],
              timing: unblockFirst ? "unblockBeforeEntry" : hasBlockage ? "blockedNoEntry" : "afterTrumps",
              score: (unblockFirst ? 70 : hasBlockage ? 2 : 6) + cashRanks.length * 3
            };
          })
          .filter(Boolean)
          .sort((a, b) => b.score - a.score);
      }

  function trumpDelayPlan(ruffPriorities, cashPriorities) {
        if (ruffPriorities.length) {
          return {
            timing: "afterRuff",
            reason: "shortSuitRuff",
            suit: ruffPriorities[0].suit
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

  function drawTrumpPriority(declarerHand, dummyHand, trump, delayPlan) {
        const trumpLength = cardsInSuit(declarerHand, trump).length + cardsInSuit(dummyHand, trump).length;
        if (trumpLength < 7) return null;
        const combinedRanks = new Set([...cardsInSuit(declarerHand, trump), ...cardsInSuit(dummyHand, trump)].map((card) => card.rank));
        const missingHonors = ["A", "K", "Q"].filter((rank) => !combinedRanks.has(rank));
        return {
          kind: "drawTrumps",
          confidence: missingHonors.length >= 2 ? "uncertain" : "basic",
          suit: trump,
          trumpLength,
          missingHonors,
          timing: delayPlan?.timing || "early",
          delayReason: delayPlan?.reason || "stableTrumpControl",
          delaySuit: delayPlan?.suit || null,
          score: (delayPlan?.timing === "early" ? 30 : 12) + trumpLength - missingHonors.length * 3
        };
      }

  function cardsInSuit(cards, suit) {
        return (cards || []).filter((card) => card.suit === suit);
      }

  function hasRank(cards, rank) {
        return cards.some((card) => card.rank === rank);
      }

  function lowestSmallCardBelow(cards, rank) {
        const rankIndex = rankOrder.indexOf(rank);
        return lowestCard(cards.filter((card) => !hcpValue[card.rank] && rankOrder.indexOf(card.rank) < rankIndex));
      }

  function sideAceEntry(cards, excludedSuit) {
        return cards.find((card) => card.suit !== excludedSuit && card.rank === "A") || null;
      }

  function sameSuitFinesseEntry(pattern, currentSuitCards, partnerSuitCards, leadCard) {
        const remainingLeadCards = currentSuitCards.filter((card) => card.id !== leadCard.id);
        if (!remainingLeadCards.length) return null;
        const entryCard = pattern.guardRanks
          .map((rank) => partnerSuitCards.find((card) => card.rank === rank))
          .find(Boolean);
        if (!entryCard) return null;
        return {
          entryType: "sameSuit",
          entrySuit: entryCard.suit,
          entryRank: entryCard.rank
        };
      }

  function targetHandEntryPlan({ pattern, currentSuitCards, partnerHand, partnerSuitCards, leadCard, suit }) {
      const outsideAce = sideAceEntry(partnerHand, suit);
      if (outsideAce) {
        return {
          entryType: "sideAce",
          entrySuit: outsideAce.suit,
          entryRank: outsideAce.rank
        };
      }
      return sameSuitFinesseEntry(pattern, currentSuitCards, partnerSuitCards, leadCard);
    }

  function playedCardsFrom(trickHistory = [], currentTrick = []) {
        return [
          ...trickHistory.flatMap((trick) => trick.cards || []).map((play) => play.card),
          ...currentTrick.map((play) => play.card)
        ].filter(Boolean);
      }

  function topTouchingHonorRun(cards) {
        const ranks = new Set(cards.map((card) => card.rank));
        for (let i = 0; i < developmentRanks.length - 1; i++) {
          if (!ranks.has(developmentRanks[i])) continue;
          const run = [];
          for (let j = i; j < developmentRanks.length; j++) {
            if (!ranks.has(developmentRanks[j])) break;
            run.push(developmentRanks[j]);
          }
          if (run.length >= 2) return { ranks: run, topIndex: i };
        }
        return null;
      }

  function missingHigherRanks(run, combinedCards, playedSuitCards) {
        const combinedRanks = new Set(combinedCards.map((card) => card.rank));
        const playedRanks = new Set(playedSuitCards.map((card) => card.rank));
        return developmentRanks
          .slice(0, run.topIndex)
          .filter((rank) => !combinedRanks.has(rank) && !playedRanks.has(rank));
      }

  function longSuitDevelopmentCandidate({
      suit,
      source,
      sourceCards,
      currentSuitCards,
      partnerSuitCards,
      playedSuitCards,
      seat,
      partnerSeat
    }) {
      if (sourceCards.length < 4) return null;
      const combinedCards = [...currentSuitCards, ...partnerSuitCards];
      if (combinedCards.length < 6) return null;

      const run = topTouchingHonorRun(sourceCards);
      if (!run) return null;

      const missingHigher = missingHigherRanks(run, combinedCards, playedSuitCards);
      if (missingHigher.length !== 1) return null;

      const sourceIsCurrentHand = source === "current";
      const card = sourceIsCurrentHand
        ? sourceCards.find((item) => item.rank === run.ranks[0])
        : lowestCard(currentSuitCards);
      if (!card) return null;

      return {
        card,
        suit,
        suitLength: combinedCards.length,
        sourceSeat: sourceIsCurrentHand ? seat : partnerSeat,
        sourceLength: sourceCards.length,
        sequence: run.ranks.join(""),
        missingStopper: missingHigher[0],
        action: sourceIsCurrentHand ? "forceMissingHighCard" : "leadTowardLongSuit",
        score: combinedCards.length * 4 + sourceCards.length * 3 + run.ranks.length * 8 + (sourceIsCurrentHand ? 3 : 0)
      };
    }

  function finesseCandidate({
      suit,
      partnerHand,
      currentSuitCards,
      partnerSuitCards,
      playedSuitCards,
      partnerSeat
    }) {
      if (!currentSuitCards.length || partnerSuitCards.length < 2) return null;

      const combinedCards = [...currentSuitCards, ...partnerSuitCards];
      for (const pattern of finessePatterns) {
        const missingHonors = pattern.missingHonors || [];
        if (pattern.minLeadCards && currentSuitCards.length < pattern.minLeadCards) continue;
        const leadCard = lowestSmallCardBelow(currentSuitCards, pattern.finesseRank);
        if (!leadCard) continue;
        if (!hasRank(partnerSuitCards, pattern.finesseRank)) continue;
        if (missingHonors.some((rank) => hasRank(combinedCards, rank) || hasRank(playedSuitCards, rank))) continue;
        if (!pattern.guardRanks.every((rank) => hasRank(partnerSuitCards, rank))) continue;
        const entryPlan = targetHandEntryPlan({
          pattern,
          currentSuitCards,
          partnerHand,
          partnerSuitCards,
          leadCard,
          suit
        });
        if (!entryPlan) continue;

        return {
          card: leadCard,
          suit,
          ruleId: pattern.ruleId,
          targetSeat: partnerSeat,
          targetLength: partnerSuitCards.length,
          finesseRank: pattern.finesseRank,
          missingHonor: missingHonors[0],
          missingHonors,
          guardRanks: pattern.guardRanks,
          entryType: entryPlan.entryType,
          entrySuit: entryPlan.entrySuit,
          entryRank: entryPlan.entryRank,
          action: pattern.action,
          reason: pattern.reason,
          score: pattern.score + partnerSuitCards.length + combinedCards.length + (entryPlan.entryType === "sideAce" ? 4 : 0)
        };
      }
      return null;
    }

  return {
    createPlayPlan,
    createNotrumpPlayPlan,
    countSureWinners,
    notrumpSuitWinnerDetail,
    visibleTopWinnerRanks,
    seatForSuitRank,
    blockedSuitInfo,
    clearOutsideEntryCard,
    entryPlanForHand,
    notrumpCashPriorities,
    notrumpDevelopmentPriorities,
    notrumpFinessePriorities,
    uniquePlanPriorities,
    notrumpPlanWarnings,
    clearOutsideEntries,
    createSuitPlayPlan,
    countSuitContractLosers,
    suitLoserEstimate,
    shortSuitRuffPriorities,
    suitCashPriorities,
    trumpDelayPlan,
    drawTrumpPriority,
    cardsInSuit,
    hasRank,
    lowestSmallCardBelow,
    sideAceEntry,
    sameSuitFinesseEntry,
    targetHandEntryPlan,
    playedCardsFrom,
    topTouchingHonorRun,
    missingHigherRanks,
    longSuitDevelopmentCandidate,
    finesseCandidate
  };
});

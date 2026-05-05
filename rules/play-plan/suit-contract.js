(function initBridgeRulesPlayPlanSuitContract(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const deps = isCommonJs
    ? { core: require("../core.js"), common: require("./common.js") }
    : { core: root.BridgeRulesParts?.core, common: root.BridgeRulesPlayPlanParts?.common };
  const api = factory(deps.core, deps.common);
  if (isCommonJs) module.exports = api;
  root.BridgeRulesPlayPlanParts = root.BridgeRulesPlayPlanParts || {};
  root.BridgeRulesPlayPlanParts.suitContract = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesPlayPlanSuitContract(core, common) {
  "use strict";

  if (!core) throw new Error("BridgeRules play-plan suit-contract missing core dependency");
  if (!common) throw new Error("BridgeRules play-plan suit-contract missing common dependency");

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

  function createSuitPlayPlan({ declarerHand, dummyHand, contract, declarer, dummy, trickHistory = [], currentTrick = [] }) {
      const neededTricks = contract.level + 6;
      const trump = contract.strain;
      const playedCards = playedCardsFrom(trickHistory, currentTrick);
      const base = suitContractBaseHand({ declarerHand, dummyHand, trump, declarer, dummy });
      const losers = countSuitContractLosers(base.baseHand, base.supportHand, trump, neededTricks, {
        baseSeat: base.baseSeat,
        supportSeat: base.supportSeat
      });
      const priorities = [];
      const ruffPriorities = shortSuitRuffPriorities(
        base.baseHand,
        base.supportHand,
        trump,
        base.baseSeat,
        base.supportSeat,
        losers.detailsBySuit
      );
      const longRuffPriorities = longSuitRuffDevelopmentPriorities(declarerHand, dummyHand, trump, declarer, dummy, playedCards);
      const directRuffPriorities = ruffPriorities.filter((priority) => {
        return !longRuffPriorities.some((longPriority) => longPriority.suit === priority.suit && longPriority.shortSeat === priority.shortSeat);
      });
      const cashPriorities = suitCashPriorities(declarerHand, dummyHand, trump, declarer, dummy, playedCards);
      const finessePriorities = suitContractFinessePriorities({
        declarerHand,
        dummyHand,
        trump,
        declarer,
        dummy,
        playedCards,
        losers
      });
      const trumpEntryFinessePriorities = suitTrumpEntryFinessePriorities({
        declarerHand,
        dummyHand,
        trump,
        declarer,
        dummy,
        trickHistory,
        currentTrick,
        playedCards,
        losers,
        finessePriorities
      });
      const urgentDiscardPriorities = suitUrgentDiscardPriorities({
        declarerHand,
        dummyHand,
        trump,
        declarer,
        dummy,
        currentTrick,
        trickHistory,
        losers,
        cashPriorities
      });
      const developDiscardPriorities = suitDevelopDiscardPriorities({
        declarerHand,
        dummyHand,
        trump,
        declarer,
        dummy,
        currentTrick,
        playedCards,
        losers
      });
      const workSuitTrumpEntryPriorities = suitWorkSuitBeforeTrumpEntryPriorities({
        declarerHand,
        dummyHand,
        trump,
        declarer,
        dummy,
        playedCards,
        losers
      });
      const crossRuffPriorities = suitCrossRuffPriorities({
        declarerHand,
        dummyHand,
        trump,
        declarer,
        dummy,
        playedCards
      });
      const timingPlan = suitContractTimingPlan({
        declarerHand,
        dummyHand,
        trump,
        declarer,
        dummy,
        trickHistory,
        currentTrick,
        ruffPriorities: [...longRuffPriorities, ...directRuffPriorities],
        cashPriorities,
        urgentDiscardPriorities,
        developDiscardPriorities,
        trumpEntryFinessePriorities,
        workSuitTrumpEntryPriorities,
        crossRuffPriorities
      });
      const trumpPriority = drawTrumpPriority(declarerHand, dummyHand, trump, timingPlan);
      const trumpTiming = trumpPriority?.timing || timingPlan?.timing || null;

      if (trumpTiming === "afterUrgentDiscard") {
        priorities.push(...urgentDiscardPriorities.slice(0, 1));
        if (trumpPriority) priorities.push(trumpPriority);
        priorities.push(...finessePriorities.slice(0, 1));
        priorities.push(...cashPriorities.filter((priority) => priority.timing !== "urgentBeforeTrumps").slice(0, 1));
      } else if (trumpTiming === "early") {
        if (trumpPriority) priorities.push(trumpPriority);
        priorities.push(...finessePriorities.slice(0, 1));
        priorities.push(...cashPriorities.slice(0, 1));
      } else if (trumpTiming === "limitedBeforeRuff") {
        if (trumpPriority) priorities.push(trumpPriority);
        priorities.push(...longRuffPriorities.slice(0, 1));
        priorities.push(...directRuffPriorities.slice(0, 2));
        priorities.push(...finessePriorities.slice(0, 1));
        priorities.push(...cashPriorities.slice(0, 1));
      } else if (trumpTiming === "afterUnblock") {
        priorities.push(...cashPriorities.filter((priority) => priority.timing === "unblockBeforeEntry").slice(0, 1));
        priorities.push(...longRuffPriorities.slice(0, 1));
        priorities.push(...directRuffPriorities.slice(0, 2));
        if (trumpPriority) priorities.push(trumpPriority);
        priorities.push(...finessePriorities.slice(0, 1));
        priorities.push(...cashPriorities.filter((priority) => priority.timing !== "unblockBeforeEntry").slice(0, 1));
      } else if (trumpTiming === "afterDevelopedDiscard") {
        priorities.push(...developDiscardPriorities.slice(0, 1));
        if (trumpPriority) priorities.push(trumpPriority);
        priorities.push(...finessePriorities.slice(0, 1));
        priorities.push(...cashPriorities.slice(0, 1));
      } else if (trumpTiming === "afterTrumpEntryFinesse") {
        priorities.push(...trumpEntryFinessePriorities.slice(0, 2));
        priorities.push(...finessePriorities.slice(0, 1));
        if (trumpPriority) priorities.push(trumpPriority);
      } else if (trumpTiming === "afterWorkSuitBeforeTrumpEntry") {
        priorities.push(...workSuitTrumpEntryPriorities.slice(0, 1));
        if (trumpPriority) priorities.push(trumpPriority);
        priorities.push(...cashPriorities.slice(0, 1));
      } else if (trumpTiming === "afterCrossRuff") {
        priorities.push(...crossRuffPriorities.slice(0, 1));
        if (trumpPriority) priorities.push(trumpPriority);
        priorities.push(...cashPriorities.slice(0, 1));
      } else {
        priorities.push(...longRuffPriorities.slice(0, 1));
        priorities.push(...directRuffPriorities.slice(0, 2));
        if (trumpPriority) priorities.push(trumpPriority);
        priorities.push(...finessePriorities.slice(0, 1));
        priorities.push(...cashPriorities.slice(0, 1));
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
        timingPlan,
        baseSeat: base.baseSeat,
        supportSeat: base.supportSeat,
        priorities: priorities.slice(0, 3),
        warnings,
        declarer,
        dummy
      };
    }

  function suitContractBaseHand({ declarerHand = [], dummyHand = [], trump, declarer = null, dummy = null }) {
        const declarerTrumpLength = cardsInSuit(declarerHand, trump).length;
        const dummyTrumpLength = cardsInSuit(dummyHand, trump).length;
        const dummyIsBase = dummyTrumpLength > declarerTrumpLength;
        return {
          baseSeat: dummyIsBase ? dummy : declarer,
          supportSeat: dummyIsBase ? declarer : dummy,
          baseHand: dummyIsBase ? dummyHand : declarerHand,
          supportHand: dummyIsBase ? declarerHand : dummyHand,
          baseTrumpLength: Math.max(declarerTrumpLength, dummyTrumpLength),
          supportTrumpLength: Math.min(declarerTrumpLength, dummyTrumpLength)
        };
      }

  function countSuitContractLosers(baseHand, supportHand, trump, neededTricks, { baseSeat = null, supportSeat = null } = {}) {
        const bySuit = {};
        const rawBySuit = {};
        const detailsBySuit = {};
        const supportTrumpLength = cardsInSuit(supportHand, trump).length;
        for (const suit of suits) {
          const detail = suitLoserEstimate(
            cardsInSuit(baseHand, suit),
            cardsInSuit(supportHand, suit),
            {
              isTrump: suit === trump,
              supportTrumpLength,
              baseSeat,
              supportSeat
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
          baseSeat,
          supportSeat,
          allowed: 13 - neededTricks
        };
      }

  function suitLoserEstimate(baseSuitCards, supportSuitCards, { isTrump, supportTrumpLength, baseSeat = null, supportSeat = null }) {
      if (!baseSuitCards.length) {
        return {
          losers: 0,
          rawLosers: 0,
          topLosers: [],
          missingTopHonors: [],
          coverCards: [],
          ruffReduction: 0,
          trumpLengthCredit: 0,
          baseSeat,
          supportSeat,
          baseLength: 0,
          supportLength: supportSuitCards.length,
          declarerLength: 0,
          dummyLength: supportSuitCards.length,
          combinedLength: supportSuitCards.length
        };
      }
      const checks = ["A", "K", "Q"].slice(0, Math.min(3, baseSuitCards.length));
      const baseRanks = new Set(baseSuitCards.map((card) => card.rank));
      const supportRanks = new Set(supportSuitCards.map((card) => card.rank));
      const visibleRanks = new Set([...baseRanks, ...supportRanks]);
      const missingTopHonors = checks.filter((rank) => !visibleRanks.has(rank));
      const coverCards = checks.filter((rank) => !baseRanks.has(rank) && supportRanks.has(rank));
      const rawLosers = missingTopHonors.length;
      const combinedLength = baseSuitCards.length + supportSuitCards.length;
      const trumpLengthCredit = isTrump && combinedLength >= 9 && rawLosers > 0 ? 1 : 0;
      const ruffReduction = !isTrump && supportSuitCards.length <= 1 && supportTrumpLength >= 2
        ? Math.min(rawLosers, Math.max(0, baseSuitCards.length - supportSuitCards.length), 1)
        : 0;
      return {
        losers: Math.max(0, rawLosers - trumpLengthCredit - ruffReduction),
        rawLosers,
        topLosers: missingTopHonors,
        missingTopHonors,
        coverCards,
        ruffReduction,
        trumpLengthCredit,
        baseSeat,
        supportSeat,
        baseLength: baseSuitCards.length,
        supportLength: supportSuitCards.length,
        declarerLength: baseSuitCards.length,
        dummyLength: supportSuitCards.length,
        combinedLength
      };
    }

  function shortSuitRuffPriorities(baseHand, supportHand, trump, baseSeat, supportSeat, detailsBySuit) {
        const supportTrumps = cardsInSuit(supportHand, trump);
        const baseTrumps = cardsInSuit(baseHand, trump);
        if (supportTrumps.length < 1 || supportTrumps.length >= baseTrumps.length) return [];
        return suits
          .filter((suit) => suit !== trump)
          .map((suit) => {
            const shortLength = cardsInSuit(supportHand, suit).length;
            const baseLength = cardsInSuit(baseHand, suit).length;
            const losers = detailsBySuit[suit]?.rawLosers || 0;
            const preparationNeeded = shortLength;
            return {
              kind: "ruffShortSuit",
              confidence: "basic",
              suit,
              baseSeat,
              supportSeat,
              longSeat: baseSeat,
              shortSeat: supportSeat,
              shortLength,
              baseLength,
              declarerLength: baseLength,
              preparationNeeded,
              extraTrickValue: true,
              timing: preparationNeeded ? "prepareBeforeRuff" : "ruffNow",
              shortTrumpLength: supportTrumps.length,
              longTrumpLength: baseTrumps.length,
              preserveTrumpCount: 1,
              losers,
              ruffReduction: detailsBySuit[suit]?.ruffReduction || 0,
              score: losers * 20 + (preparationNeeded ? 30 : 45) - shortLength * 4 + Math.max(0, baseLength - shortLength) * 3
            };
          })
          .filter((priority) => {
            if (priority.losers <= 0 || priority.shortLength > 2 || priority.baseLength <= priority.shortLength) return false;
            return priority.shortTrumpLength > priority.preparationNeeded;
          })
          .sort((a, b) => b.score - a.score);
      }

  function longSuitRuffDevelopmentPriorities(declarerHand, dummyHand, trump, declarer, dummy, playedCards = []) {
        const sides = [
          { seat: declarer, hand: declarerHand },
          { seat: dummy, hand: dummyHand }
        ];
        return suits
          .filter((suit) => suit !== trump)
          .flatMap((suit) => {
            const playedSuitCards = cardsInSuit(playedCards, suit);
            return sides.map((longSide) => {
              const shortSide = sides.find((side) => side.seat !== longSide.seat);
              const longSuitCards = cardsInSuit(longSide.hand, suit);
              const shortSuitCards = cardsInSuit(shortSide.hand, suit);
              const shortTrumps = cardsInSuit(shortSide.hand, trump);
              const longTrumps = cardsInSuit(longSide.hand, trump);
              if (longSuitCards.length < 5 || shortSuitCards.length > 1 || shortTrumps.length < 2) return null;
              if (shortTrumps.length >= longTrumps.length) return null;
              if (!longSuitCards.some((card) => hcpValue[card.rank] || card.rank === "T")) return null;

              const opponentsRemaining = Math.max(0, 13 - longSuitCards.length - shortSuitCards.length - playedSuitCards.length);
              const estimatedOpponentsLongest = Math.ceil(opponentsRemaining / 2);
              const estimatedRuffsNeeded = Math.max(1, estimatedOpponentsLongest - shortSuitCards.length);
              if (estimatedRuffsNeeded > shortTrumps.length) return null;

              const entries = longSuitRuffEntryCandidates({
                shortHand: shortSide.hand,
                longHand: longSide.hand,
                playedCards,
                trump,
                ruffSuit: suit
              });
              const entry = entries[0] || null;
              if (!entry) return null;
              const entryCount = entries.length;
              const availableRuffs = shortTrumps.length;
              const maxUsefulRuffs = Math.min(estimatedRuffsNeeded, availableRuffs, entryCount + 1);
              if (maxUsefulRuffs < estimatedRuffsNeeded) return null;
              if (availableRuffs - estimatedRuffsNeeded < 1) return null;

              return {
                kind: "establishLongSuitByRuffing",
                confidence: "basic",
                suit,
                longSeat: longSide.seat,
                shortSeat: shortSide.seat,
                longLength: longSuitCards.length,
                shortLength: shortSuitCards.length,
                shortTrumpLength: shortTrumps.length,
                estimatedRuffsNeeded,
                entryCount,
                availableRuffs,
                maxUsefulRuffs,
                entrySuit: entry.suit,
                entryRank: entry.entryRank,
                timing: "beforeDrawTrumps",
                score: 55 + longSuitCards.length * 5 + shortTrumps.length * 4 - estimatedRuffsNeeded * 3
              };
            });
          })
          .filter(Boolean)
          .sort((a, b) => b.score - a.score);
      }

  function suitCrossRuffPriorities({ declarerHand, dummyHand, trump, declarer, dummy, playedCards = [] }) {
        if (!trump) return [];
        const declarerTrumps = cardsInSuit(declarerHand, trump);
        const dummyTrumps = cardsInSuit(dummyHand, trump);
        const trumpLength = declarerTrumps.length + dummyTrumps.length;
        if (trumpLength < 8 || declarerTrumps.length < 3 || dummyTrumps.length < 3) return [];

        const trumpWinners = visibleTopWinnerRanks([...declarerTrumps, ...dummyTrumps], cardsInSuit(playedCards, trump));
        const hasHighTrumpControl = ["A", "K", "Q"].every((rank) => trumpWinners.includes(rank));
        if (!hasHighTrumpControl) return [];

        const sides = [
          { seat: declarer, hand: declarerHand, trumps: declarerTrumps },
          { seat: dummy, hand: dummyHand, trumps: dummyTrumps }
        ];
        const shortSuits = suits
          .filter((suit) => suit !== trump)
          .map((suit) => {
            const first = sides[0];
            const second = sides[1];
            const firstCards = cardsInSuit(first.hand, suit);
            const secondCards = cardsInSuit(second.hand, suit);
            const firstShort = firstCards.length <= 1 && secondCards.length >= 3;
            const secondShort = secondCards.length <= 1 && firstCards.length >= 3;
            if (!firstShort && !secondShort) return null;
            const shortSide = firstShort ? first : second;
            const longSide = firstShort ? second : first;
            const shortCards = firstShort ? firstCards : secondCards;
            const longCards = firstShort ? secondCards : firstCards;
            const longWinnerRanks = visibleTopWinnerRanks([...longCards, ...shortCards], cardsInSuit(playedCards, suit))
              .filter((rank) => hasRank(longCards, rank));
            if (!longWinnerRanks.length) return null;
            const remainingShortCards = shortCards.filter((card) => !cardsInSuit(playedCards, suit).some((played) => played.id === card.id));
            return {
              suit,
              longSeat: longSide.seat,
              shortSeat: shortSide.seat,
              longLength: longCards.length,
              shortLength: shortCards.length,
              remainingShortLength: remainingShortCards.length,
              shortTrumpLength: shortSide.trumps.length,
              longWinnerRanks,
              ruffCount: Math.min(shortSide.trumps.length, Math.max(1, longCards.length - shortCards.length))
            };
          })
          .filter(Boolean);

        const crossPairs = [];
        for (const first of shortSuits) {
          for (const second of shortSuits) {
            if (first.suit === second.suit) continue;
            if (first.shortSeat === second.shortSeat) continue;
            crossPairs.push([first, second]);
          }
        }
        const pair = crossPairs
          .sort((a, b) => crossRuffPairScore(b, trumpLength, trumpWinners) - crossRuffPairScore(a, trumpLength, trumpWinners))[0];
        if (!pair) return [];

        const cashFirst = pair
          .flatMap((item) => item.longWinnerRanks.map((rank) => ({
            suit: item.suit,
            rank,
            seat: item.longSeat,
            beforeRuffSeat: item.shortSeat
          })))
          .filter((item) => {
            const alreadyPlayed = cardsInSuit(playedCards, item.suit).some((card) => card.rank === item.rank);
            return !alreadyPlayed && ["A", "K"].includes(item.rank);
          });

        return [{
          kind: "crossRuff",
          confidence: "basic",
          suit: pair[0].suit,
          trump,
          trumpLength,
          trumpWinnerRanks: trumpWinners,
          crossSuits: pair,
          cashFirst,
          timing: "beforeDrawTrumps",
          score: 135 + trumpWinners.length * 8 + pair.reduce((total, item) => total + item.ruffCount * 12 + item.longLength, 0)
        }];
      }

  function crossRuffPairScore(pair, trumpLength, trumpWinners) {
        return trumpLength * 4 + trumpWinners.length * 8 + pair.reduce((total, item) => {
          return total + item.ruffCount * 12 + item.longLength * 2 + item.longWinnerRanks.length * 4 - item.shortLength * 3;
        }, 0);
      }

  function longSuitRuffEntryCandidates({ shortHand, longHand, playedCards, trump, ruffSuit }) {
        return suits
          .filter((suit) => suit !== trump && suit !== ruffSuit)
          .map((suit) => longSuitRuffEntryCandidate({ suit, shortHand, longHand, playedCards }))
          .filter(Boolean)
          .sort((a, b) => b.score - a.score);
      }

  function longSuitRuffEntryCandidate({ suit, shortHand, longHand, playedCards }) {
        const leadCards = cardsInSuit(shortHand, suit);
        const longSuitCards = cardsInSuit(longHand, suit);
        if (!leadCards.length || !longSuitCards.length) return null;

        const winnerRanks = visibleTopWinnerRanks([...leadCards, ...longSuitCards], cardsInSuit(playedCards, suit));
        const longWinnerRanks = winnerRanks.filter((rank) => hasRank(longSuitCards, rank));
        if (!longWinnerRanks.length) return null;

        const entryRank = longWinnerRanks[0];
        const lowerLeadCards = leadCards.filter((card) => rankOrder.indexOf(card.rank) < rankOrder.indexOf(entryRank));
        const card = lowestCard(lowerLeadCards);
        if (!card) return null;

        return {
          card,
          suit,
          entryRank,
          score: longWinnerRanks.length * 20 + winnerRanks.length * 8 + leadCards.length + longSuitCards.length
        };
      }

  function suitContractFinessePriorities({ declarerHand, dummyHand, trump, declarer, dummy, playedCards = [], losers }) {
        const candidates = [];
        for (const suit of suits) {
          if (suit === trump || !losers?.bySuit?.[suit]) continue;
          const loserDetail = losers.detailsBySuit?.[suit];
          const missingTopHonors = loserDetail?.missingTopHonors || [];
          if (!missingTopHonors.length) continue;

          const declarerSuitCards = cardsInSuit(declarerHand, suit);
          const dummySuitCards = cardsInSuit(dummyHand, suit);
          const playedSuitCards = cardsInSuit(playedCards, suit);
          [
            {
              currentSuitCards: declarerSuitCards,
              partnerSuitCards: dummySuitCards,
              partnerHand: dummyHand,
              leadSeat: declarer,
              targetSeat: dummy
            },
            {
              currentSuitCards: dummySuitCards,
              partnerSuitCards: declarerSuitCards,
              partnerHand: declarerHand,
              leadSeat: dummy,
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
            if (!candidate.missingHonors?.some((rank) => missingTopHonors.includes(rank))) return;

            candidates.push({
              kind: candidate.ruleId === "doubleFinesseTowardHonor" ? "doubleFinesse" : "finesse",
              confidence: "uncertain",
              suit,
              leadSeat: direction.leadSeat,
              targetSeat: candidate.targetSeat,
              finesseRank: candidate.finesseRank,
              missingHonor: candidate.missingHonor,
              missingHonors: candidate.missingHonors,
              guardRanks: candidate.guardRanks,
              entryType: candidate.entryType,
              entrySuit: candidate.entrySuit,
              entryRank: candidate.entryRank,
              baseSeat: losers.baseSeat || null,
              supportSeat: losers.supportSeat || null,
              loserCount: losers.bySuit[suit],
              reason: "Speel laag naar een beschermde honneur om een zijkleurverliezer in een kleurcontract weg te werken.",
              score: 48 + (losers.bySuit[suit] || 0) * 12 + candidate.score / 10
            });
          });
        }
        return candidates.sort((a, b) => b.score - a.score);
      }

  function suitTrumpEntryFinessePriorities({
      declarerHand,
      dummyHand,
      trump,
      declarer,
      dummy,
      trickHistory = [],
      currentTrick = [],
      playedCards = [],
      losers,
      finessePriorities = []
    }) {
        if (!trump || !losers || losers.total <= losers.allowed) return [];
        const sides = [
          { seat: declarer, hand: declarerHand },
          { seat: dummy, hand: dummyHand }
        ];
        const candidates = [];

        finessePriorities
          .filter((priority) => priority.kind === "finesse" && priority.missingHonor === "K" && priority.finesseRank === "Q")
          .forEach((priority) => {
            const targetSide = sides.find((side) => side.seat === priority.targetSeat);
            const leadSide = sides.find((side) => side.seat === priority.leadSeat);
            if (!targetSide || !leadSide) return;
            const targetSuitCards = cardsInSuit(targetSide.hand, priority.suit);
            const leadSuitCards = cardsInSuit(leadSide.hand, priority.suit);
            if (!hasRank(targetSuitCards, "A") || !hasRank(targetSuitCards, "Q") || !hasRank(targetSuitCards, "J")) return;
            if (leadSuitCards.filter((card) => rankOrder.indexOf(card.rank) < rankOrder.indexOf("Q")).length < 2) return;

            const entry = trumpEntryCandidateForSeat({
              declarerHand,
              dummyHand,
              trump,
              playedCards,
              entrySeat: priority.leadSeat,
              fromSeat: priority.targetSeat,
              declarer,
              dummy
            });
            if (!entry) return;

            candidates.push({
              entry: {
                kind: "useTrumpEntriesForRepeatedFinesse",
                confidence: "basic",
                trump,
                entrySeat: priority.leadSeat,
                fromSeat: priority.targetSeat,
                entryRank: entry.entryRank,
                entryLeadRank: entry.leadRank,
                finesseSuit: priority.suit,
                finesseRank: priority.finesseRank,
                repeatFinesseRank: "J",
                missingHonor: "K",
                timing: "beforeRepeatedFinesse",
                score: 118 + entry.remainingEntries * 12
              },
              followup: null,
              score: 118 + entry.remainingEntries * 12
            });
          });

        for (const suit of suits) {
          if (suit === trump || !losers.bySuit?.[suit]) continue;
          [
            { leadSeat: declarer, targetSeat: dummy, leadHand: declarerHand, targetHand: dummyHand },
            { leadSeat: dummy, targetSeat: declarer, leadHand: dummyHand, targetHand: declarerHand }
          ].forEach((direction) => {
            const repeat = repeatFinesseCandidate({
              suit,
              trickHistory,
              playedSuitCards: cardsInSuit(playedCards, suit),
              leadSeat: direction.leadSeat,
              targetSeat: direction.targetSeat,
              leadSuitCards: cardsInSuit(direction.leadHand, suit),
              targetSuitCards: cardsInSuit(direction.targetHand, suit),
              targetHand: direction.targetHand
            });
            if (!repeat || repeat.missingHonor !== "K" || repeat.finesseRank !== "J") return;
            const entry = trumpEntryCandidateForSeat({
              declarerHand,
              dummyHand,
              trump,
              playedCards,
              entrySeat: repeat.leadSeat,
              fromSeat: repeat.targetSeat,
              declarer,
              dummy
            });
            if (!entry) return;

            candidates.push({
              entry: {
                kind: "useTrumpEntriesForRepeatedFinesse",
                confidence: "basic",
                trump,
                entrySeat: repeat.leadSeat,
                fromSeat: repeat.targetSeat,
                entryRank: entry.entryRank,
                entryLeadRank: entry.leadRank,
                finesseSuit: repeat.suit,
                finesseRank: repeat.finesseRank,
                repeatFinesseRank: repeat.finesseRank,
                missingHonor: repeat.missingHonor,
                timing: "beforeRepeatedFinesse",
                score: 132 + entry.remainingEntries * 12
              },
              followup: repeat,
              score: 132 + entry.remainingEntries * 12
            });
          });
        }

        const best = candidates.sort((a, b) => b.score - a.score)[0];
        return best ? [best.entry, best.followup].filter(Boolean) : [];
      }

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

  function suitWorkSuitBeforeTrumpEntryPriorities({
      declarerHand,
      dummyHand,
      trump,
      declarer,
      dummy,
      playedCards = [],
      losers
    }) {
        if (!trump || !losers || losers.total <= losers.allowed) return [];
        const sides = [
          { seat: declarer, hand: declarerHand },
          { seat: dummy, hand: dummyHand }
        ];
        const candidates = [];

        for (const suit of suits) {
          if (suit === trump) continue;
          const playedSuitCards = cardsInSuit(playedCards, suit);
          for (const sourceSide of sides) {
            const leadSide = sides.find((side) => side.seat !== sourceSide.seat);
            const sourceSuitCards = cardsInSuit(sourceSide.hand, suit);
            const leadSuitCards = cardsInSuit(leadSide.hand, suit);
            if (sourceSuitCards.length < 4 || leadSuitCards.length < 2) continue;
            if (hasRank([...sourceSuitCards, ...leadSuitCards], "A") || hasRank(playedSuitCards, "A")) continue;
            if (!hasRank(leadSuitCards, "K")) continue;
            if (!hasRank(sourceSuitCards, "Q") || !hasRank(sourceSuitCards, "J")) continue;

            const entry = trumpEntryCandidateForSeat({
              declarerHand,
              dummyHand,
              trump,
              playedCards,
              entrySeat: sourceSide.seat,
              fromSeat: leadSide.seat,
              declarer,
              dummy
            });
            if (!entry) continue;
            if (nonTrumpEntryCandidate(sourceSide.hand, leadSide.hand, playedCards, suit, trump)) continue;

            const futureWinnerRanks = ["Q", "J", "T"].filter((rank) => hasRank(sourceSuitCards, rank));
            const discardCapacity = Math.max(0, futureWinnerRanks.length - Math.max(0, leadSuitCards.length - 1));
            const discardSuits = realDiscardSuitsForSeat({ hand: leadSide.hand, trump, workSuit: suit, playedCards, losers });
            if (!discardSuits.length || discardCapacity < 1) continue;

            candidates.push({
              kind: "developSideSuitBeforeTrumpEntry",
              confidence: "basic",
              suit,
              leadSeat: leadSide.seat,
              sourceSeat: sourceSide.seat,
              leadRank: "K",
              missingStopper: "A",
              futureWinnerRanks,
              discardSuits,
              discardCapacity: Math.min(discardCapacity, discardSuits.reduce((total, discardSuit) => total + (losers.bySuit[discardSuit] || 0), 0)),
              entrySuit: trump,
              entryRank: entry.entryRank,
              entrySeat: sourceSide.seat,
              timing: "beforeTrumpEntry",
              score: 110 + discardCapacity * 16 + futureWinnerRanks.length * 8 + sourceSuitCards.length
            });
          }
        }

        return candidates.sort((a, b) => b.score - a.score);
      }

  function nonTrumpEntryCandidate(targetHand, partnerHand, playedCards = [], excludedSuit, trump) {
        return suits
          .filter((suit) => suit !== excludedSuit && suit !== trump)
          .some((suit) => {
            const targetSuitCards = cardsInSuit(targetHand, suit);
            const partnerSuitCards = cardsInSuit(partnerHand, suit);
            const winnerRanks = visibleTopWinnerRanks([...targetSuitCards, ...partnerSuitCards], cardsInSuit(playedCards, suit));
            return winnerRanks.some((rank) => hasRank(targetSuitCards, rank));
          });
      }

  function realDiscardSuitsForSeat({ hand, trump, workSuit, playedCards = [], losers }) {
        return suits.filter((suit) => {
          if (suit === trump || suit === workSuit || !losers.bySuit?.[suit]) return false;
          if (!cardsInSuit(hand, suit).length) return false;
          const missing = losers.detailsBySuit?.[suit]?.missingTopHonors || [];
          return missing.some((rank) => !hasRank(cardsInSuit(playedCards, suit), rank));
        });
      }

  function suitDevelopDiscardPriorities({
      declarerHand,
      dummyHand,
      trump,
      declarer,
      dummy,
      currentTrick = [],
      playedCards = [],
      losers
    }) {
        const candidates = [];
        for (const discardSuit of suits) {
          if (discardSuit === trump || !losers?.bySuit?.[discardSuit]) continue;
          const discardDetail = losers.detailsBySuit?.[discardSuit];
          if (discardDetail?.ruffReduction) continue;

          for (const suit of suits) {
            if (suit === trump || suit === discardSuit) continue;
            const candidate = sideSuitDiscardDevelopmentCandidate({
              suit,
              discardSuit,
              trump,
              declarerHand,
              dummyHand,
              declarer,
              dummy,
              currentTrick,
              playedCards,
              loserCount: losers.bySuit[discardSuit]
            });
            if (candidate) candidates.push(candidate);
            const finesseCandidate = sideSuitFinesseDiscardCandidate({
              suit,
              discardSuit,
              trump,
              declarerHand,
              dummyHand,
              declarer,
              dummy,
              currentTrick,
              playedCards,
              loserCount: losers.bySuit[discardSuit]
            });
            if (finesseCandidate) candidates.push(finesseCandidate);
          }
        }
        return candidates.sort((a, b) => b.score - a.score);
      }

  function sideSuitFinesseDiscardCandidate({
      suit,
      discardSuit,
      trump,
      declarerHand,
      dummyHand,
      declarer,
      dummy,
      currentTrick = [],
      playedCards = [],
      loserCount = 0
    }) {
        const playedSuitCards = cardsInSuit(playedCards, suit);
        if (hasRank(playedSuitCards, "K")) return null;

        const sides = [
          { seat: declarer, hand: declarerHand, suitCards: cardsInSuit(declarerHand, suit) },
          { seat: dummy, hand: dummyHand, suitCards: cardsInSuit(dummyHand, suit) }
        ];

        const candidates = sides.map((leadSide) => {
          const sourceSide = sides.find((side) => side.seat !== leadSide.seat);
          if (!hasRank(leadSide.suitCards, "Q") || leadSide.suitCards.length < 2) return null;
          if (!hasRank(sourceSide.suitCards, "A") || !hasRank(sourceSide.suitCards, "J")) return null;
          if (hasRank([...leadSide.suitCards, ...sourceSide.suitCards], "K")) return null;

          const leadContext = sideSuitHonorLeadContext({ suit, leadSide, leadRank: "Q", currentTrick });
          if (!leadContext) return null;

          const futureWinnerRanks = ["A", "J", "T"].filter((rank) => hasRank(sourceSide.suitCards, rank));
          const discardCapacity = Math.max(0, futureWinnerRanks.length - leadContext.remainingLeadSuitLength);
          const discardCount = Math.min(discardCapacity, loserCount);
          if (discardCount < 1 || !cardsInSuit(leadSide.hand, discardSuit).length) return null;

          return {
            kind: "establishSideSuitForDiscard",
            confidence: "uncertain",
            suit,
            discardSuit,
            leadSeat: leadSide.seat,
            sourceSeat: sourceSide.seat,
            discardSeat: leadSide.seat,
            leadRank: "Q",
            leadCard: leadContext.card,
            missingStopper: "K",
            futureWinnerRanks,
            discardCapacity,
            discardCount,
            entrySuit: suit,
            entryRank: "A",
            entryType: "sameSuitAce",
            finesseRank: "Q",
            timing: "beforeDrawTrumps",
            score: 126 + discardCount * 20 + futureWinnerRanks.length * 8 + sourceSide.suitCards.length
          };
        }).filter(Boolean);

        return candidates.sort((a, b) => b.score - a.score)[0] || null;
      }

  function sideSuitDiscardDevelopmentCandidate({
      suit,
      discardSuit,
      trump,
      declarerHand,
      dummyHand,
      declarer,
      dummy,
      currentTrick = [],
      playedCards = [],
      loserCount = 0
    }) {
        const playedSuitCards = cardsInSuit(playedCards, suit);
        const declarerSuitCards = cardsInSuit(declarerHand, suit);
        const dummySuitCards = cardsInSuit(dummyHand, suit);
        const combinedCards = [...declarerSuitCards, ...dummySuitCards];
        if (hasRank(combinedCards, "A") || hasRank(playedSuitCards, "A")) return null;

        const sides = [
          { seat: declarer, hand: declarerHand, suitCards: declarerSuitCards },
          { seat: dummy, hand: dummyHand, suitCards: dummySuitCards }
        ];

        const candidates = sides.map((sourceSide) => {
          if (!hasRank(sourceSide.suitCards, "K") || !hasRank(sourceSide.suitCards, "Q")) return null;
          const leadSide = sides.find((side) => side.seat !== sourceSide.seat);
          const leadContext = sideSuitDiscardLeadContext({ suit, leadSide, currentTrick });
          if (!leadContext) return null;
          if (sourceSide.suitCards.length <= leadContext.remainingLeadSuitLength) return null;

          const futureWinnerRanks = ["K", "Q"].filter((rank) => hasRank(sourceSide.suitCards, rank));
          const discardCapacity = Math.max(0, futureWinnerRanks.length - leadContext.remainingLeadSuitLength);
          const discardCount = Math.min(discardCapacity, loserCount);
          if (discardCount < 1 || !cardsInSuit(leadSide.hand, discardSuit).length) return null;

          const entry = sideSuitDiscardEntryCandidate({
            targetSide: sourceSide,
            leadSide,
            playedCards,
            excludedSuit: suit,
            trump,
            discardSuit
          });
          if (!entry) return null;

          return {
            kind: "establishSideSuitForDiscard",
            confidence: "basic",
            suit,
            discardSuit,
            leadSeat: leadSide.seat,
            sourceSeat: sourceSide.seat,
            discardSeat: leadSide.seat,
            leadRank: leadContext.rank,
            leadCard: leadContext.card,
            missingStopper: "A",
            futureWinnerRanks,
            discardCapacity,
            discardCount,
            entrySuit: entry.suit,
            entryRank: entry.entryRank,
            entryType: "visibleWinner",
            timing: "beforeDrawTrumps",
            score: 102 + discardCount * 20 + futureWinnerRanks.length * 8 + sourceSide.suitCards.length * 2 + (entry.suit === discardSuit ? 6 : 0)
          };
        }).filter(Boolean);

        return candidates.sort((a, b) => b.score - a.score)[0] || null;
      }

  function sideSuitDiscardLeadContext({ suit, leadSide, currentTrick = [] }) {
        const leadSuitCards = cardsInSuit(leadSide.hand, suit);
        if (currentTrick.length) {
          const lead = currentTrick[0];
          if (lead?.seat !== leadSide.seat || lead.card?.suit !== suit || lead.card.rank !== "J") return null;
          return {
            card: lead.card,
            rank: "J",
            remainingLeadSuitLength: leadSuitCards.length,
            inProgress: true
          };
        }

        const leadCard = leadSuitCards.find((card) => card.rank === "J");
        if (!leadCard) return null;
        return {
          card: leadCard,
          rank: "J",
          remainingLeadSuitLength: Math.max(0, leadSuitCards.length - 1),
          inProgress: false
        };
      }

  function sideSuitHonorLeadContext({ suit, leadSide, leadRank, currentTrick = [] }) {
        const leadSuitCards = cardsInSuit(leadSide.hand, suit);
        if (currentTrick.length) {
          const lead = currentTrick[0];
          if (lead?.seat !== leadSide.seat || lead.card?.suit !== suit || lead.card.rank !== leadRank) return null;
          return {
            card: lead.card,
            rank: leadRank,
            remainingLeadSuitLength: leadSuitCards.length,
            inProgress: true
          };
        }

        const leadCard = leadSuitCards.find((card) => card.rank === leadRank);
        if (!leadCard) return null;
        return {
          card: leadCard,
          rank: leadRank,
          remainingLeadSuitLength: Math.max(0, leadSuitCards.length - 1),
          inProgress: false
        };
      }

  function sideSuitDiscardEntryCandidate({ targetSide, leadSide, playedCards = [], excludedSuit, trump, discardSuit }) {
        return suits
          .filter((suit) => suit !== excludedSuit && suit !== trump)
          .map((suit) => {
            const targetSuitCards = cardsInSuit(targetSide.hand, suit);
            const leadSuitCards = cardsInSuit(leadSide.hand, suit);
            if (!targetSuitCards.length || !leadSuitCards.length) return null;
            if (suit === discardSuit && leadSuitCards.length < 2) return null;

            const winnerRanks = visibleTopWinnerRanks(
              [...targetSuitCards, ...leadSuitCards],
              cardsInSuit(playedCards, suit)
            );
            const targetWinnerRanks = winnerRanks.filter((rank) => hasRank(targetSuitCards, rank));
            if (!targetWinnerRanks.length) return null;

            return {
              suit,
              entryRank: targetWinnerRanks[0],
              winnerCount: targetWinnerRanks.length,
              score: (suit === discardSuit ? 30 : 10) + targetWinnerRanks.length * 8 + targetSuitCards.length
            };
          })
          .filter(Boolean)
          .sort((a, b) => b.score - a.score)[0] || null;
      }

  function suitUrgentDiscardPriorities({
      declarerHand,
      dummyHand,
      trump,
      declarer,
      dummy,
      currentTrick = [],
      trickHistory = [],
      losers,
      cashPriorities = []
    }) {
        const attackedSuit = urgentAttackedSuit({ currentTrick, trickHistory, declarer, dummy, trump });
        if (!attackedSuit || !losers?.bySuit?.[attackedSuit]) return [];

        const sides = {
          [declarer]: declarerHand,
          [dummy]: dummyHand
        };
        return cashPriorities
          .filter((priority) => priority.suit && priority.suit !== trump && priority.suit !== attackedSuit)
          .map((priority) => {
            const declarerSuitLength = cardsInSuit(declarerHand, priority.suit).length;
            const dummySuitLength = cardsInSuit(dummyHand, priority.suit).length;
            const discardSeat = declarerSuitLength <= dummySuitLength ? declarer : dummy;
            const discardCapacity = Math.max(0, (priority.cashRanks || []).length - Math.min(declarerSuitLength, dummySuitLength));
            if (discardCapacity < 1 || !cardsInSuit(sides[discardSeat], attackedSuit).length) return null;

            const firstRank = priority.cashRanks?.[0];
            const firstSeat = firstRank
              ? seatForSuitRank(firstRank, cardsInSuit(declarerHand, priority.suit), cardsInSuit(dummyHand, priority.suit), declarer, dummy)
              : priority.firstSeat;
            if (!firstSeat) return null;

            return {
              ...priority,
              kind: "discardLoserOnWinner",
              confidence: priority.confidence || "basic",
              attackedSuit,
              discardSeat,
              discardCapacity,
              firstSeat,
              timing: "urgentBeforeTrumps",
              score: 95 + discardCapacity * 8 + (priority.cashRanks || []).length * 3
            };
          })
          .filter(Boolean)
          .sort((a, b) => b.score - a.score);
      }

  function urgentAttackedSuit({ currentTrick = [], trickHistory = [], declarer, dummy, trump }) {
        const declarerTeam = teamOf(declarer);
        const currentLead = currentTrick[0];
        if (currentLead && currentLead.card.suit !== trump && teamOf(currentLead.seat) !== declarerTeam) {
          return currentLead.card.suit;
        }

        const recentOpponentLead = [...trickHistory].reverse().find((trick) => {
          const lead = trick.cards?.[0];
          return lead && lead.card.suit !== trump && teamOf(lead.seat) !== declarerTeam;
        });
        return recentOpponentLead?.cards?.[0]?.card?.suit || null;
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

  function suitCashPriorities(declarerHand, dummyHand, trump, declarer, dummy, playedCards = []) {
        return suits
          .filter((suit) => suit !== trump)
          .map((suit) => {
            const declarerSuitCards = cardsInSuit(declarerHand, suit);
            const dummySuitCards = cardsInSuit(dummyHand, suit);
            const winnerRanks = visibleTopWinnerRanks([...declarerSuitCards, ...dummySuitCards], cardsInSuit(playedCards, suit));
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
    createSuitPlayPlan,
    suitContractBaseHand,
    countSuitContractLosers,
    suitLoserEstimate,
    shortSuitRuffPriorities,
    longSuitRuffDevelopmentPriorities,
    suitCrossRuffPriorities,
    crossRuffPairScore,
    longSuitRuffEntryCandidates,
    longSuitRuffEntryCandidate,
    suitContractFinessePriorities,
    suitTrumpEntryFinessePriorities,
    trumpEntryCandidateForSeat,
    suitWorkSuitBeforeTrumpEntryPriorities,
    nonTrumpEntryCandidate,
    realDiscardSuitsForSeat,
    suitDevelopDiscardPriorities,
    sideSuitFinesseDiscardCandidate,
    sideSuitDiscardDevelopmentCandidate,
    sideSuitDiscardLeadContext,
    sideSuitHonorLeadContext,
    sideSuitDiscardEntryCandidate,
    suitUrgentDiscardPriorities,
    urgentAttackedSuit,
    suitContractTimingPlan,
    suitTrumpControl,
    playedTrumpRoundsFrom,
    suitCashPriorities,
    trumpDelayPlan,
    drawTrumpPriority
  };
});

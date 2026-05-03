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
  const repeatFinessePatterns = [
    {
      missingHonor: "K",
      firstFinesseRank: "Q",
      finesseRank: "J",
      guardRanks: ["A"],
      score: 88
    },
    {
      missingHonor: "Q",
      firstFinesseRank: "J",
      finesseRank: "T",
      guardRanks: ["A", "K"],
      score: 78
    }
  ];

  function createPlayPlan({
      declarerHand = [],
      dummyHand = [],
      contract = null,
      declarer = null,
      dummy = null,
      trickHistory = [],
      currentTrick = []
    } = {}) {
      if (!contract || !declarer || !dummy || !declarerHand.length || !dummyHand.length) return null;
      if (contract.strain === "NT") {
        return createNotrumpPlayPlan({ declarerHand, dummyHand, contract, declarer, dummy, trickHistory, currentTrick });
      }
      return createSuitPlayPlan({ declarerHand, dummyHand, contract, declarer, dummy, trickHistory, currentTrick });
    }

  function createNotrumpPlayPlan({ declarerHand, dummyHand, contract, declarer, dummy, trickHistory, currentTrick = [] }) {
      const playedCards = playedCardsFrom(trickHistory, currentTrick);
      const neededTricks = contract.level + 6;
      const sureWinners = countSureWinners(declarerHand, dummyHand, playedCards, declarer, dummy);
      const needToDevelop = Math.max(0, neededTricks - sureWinners.total);
      const holdUpPriorities = notrumpHoldUpPriorities({ declarerHand, dummyHand, declarer, trickHistory, currentTrick, neededTricks, sureWinners });
      const developmentPriorities = notrumpDevelopmentPriorities({ declarerHand, dummyHand, declarer, dummy, playedCards });
      const tempoWorkPriorities = notrumpTempoWorkSuitPriorities({
        declarerHand,
        dummyHand,
        declarer,
        dummy,
        playedCards,
        currentTrick,
        sureWinners,
        needToDevelop
      });
      const optionalFinessePenalty = needToDevelop && (developmentPriorities.length || tempoWorkPriorities.length) ? 40 : 0;
      const repeatFinessePriorities = notrumpRepeatFinessePriorities({ declarerHand, dummyHand, declarer, dummy, trickHistory, playedCards })
        .map((priority) => ({
          ...priority,
          score: priority.score - optionalFinessePenalty
        }));
      const twoWayFinessePriorities = notrumpTwoWayFinessePriorities({ declarerHand, dummyHand, declarer, dummy, playedCards })
        .map((priority) => ({
          ...priority,
          score: priority.score - optionalFinessePenalty
        }));
      const blockedFinesseSuits = new Set([...repeatFinessePriorities, ...twoWayFinessePriorities].map((priority) => priority.suit));
      const safeHandContext = notrumpSafeHandContext({ declarer, trickHistory, currentTrick });
      const finessePriorities = notrumpFinessePriorities({ declarerHand, dummyHand, declarer, dummy, playedCards, safeHandContext })
        .filter((priority) => !blockedFinesseSuits.has(priority.suit))
        .map((priority) => ({
          ...priority,
          score: priority.score - optionalFinessePenalty
        }));
      const cashPriorities = notrumpCashPriorities(sureWinners, neededTricks);
      const priorities = [
        ...cashPriorities,
        ...holdUpPriorities,
        ...developmentPriorities,
        ...tempoWorkPriorities,
        ...repeatFinessePriorities,
        ...twoWayFinessePriorities,
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
        needToDevelop,
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

  function notrumpTempoWorkSuitPriorities({
      declarerHand,
      dummyHand,
      declarer,
      dummy,
      playedCards,
      currentTrick = [],
      sureWinners,
      needToDevelop
    }) {
      if (!needToDevelop) return [];
      const tempo = notrumpTempoContext({ declarer, currentTrick, sureWinners });
      const candidates = [];
      for (const suit of suits) {
        if (tempo.attackedSuit) {
          const tempoCandidate = notrumpTempoWorkSuitCandidate({
            suit,
            declarerHand,
            dummyHand,
            declarer,
            dummy,
            playedCards,
            sureWinners,
            needToDevelop,
            tempo
          });
          if (tempoCandidate) candidates.push(tempoCandidate);
        }
        const communicationCandidate = notrumpEarlyGiveUpWorkSuitCandidate({
          suit,
          declarerHand,
          dummyHand,
          declarer,
          dummy,
          playedCards,
          sureWinners,
          needToDevelop
        });
        if (communicationCandidate) candidates.push(communicationCandidate);
      }
      return candidates;
    }

  function notrumpTempoWorkSuitCandidate({
      suit,
      declarerHand,
      dummyHand,
      declarer,
      dummy,
      playedCards,
      sureWinners,
      needToDevelop,
      tempo
    }) {
      const declarerSuitCards = cardsInSuit(declarerHand, suit);
      const dummySuitCards = cardsInSuit(dummyHand, suit);
      const playedSuitCards = cardsInSuit(playedCards, suit);
      const combinedCards = [...declarerSuitCards, ...dummySuitCards];
      if (combinedCards.length < 5) return null;

      const run = tempoDevelopmentRun(combinedCards, playedSuitCards);
      if (!run || run.lossesNeeded < 1 || run.lossesNeeded > 2) return null;

      const currentWinners = sureWinners?.bySuit?.[suit] || 0;
      const extraTricks = Math.min(run.ranks.length, Math.max(0, combinedCards.length - run.lossesNeeded - 3));
      if (extraTricks <= 0 || currentWinners + extraTricks <= currentWinners) return null;

      const sourceSeat = seatForSuitRank(run.ranks[0], declarerSuitCards, dummySuitCards, declarer, dummy);
      const sourceHand = sourceSeat === declarer ? declarerHand : dummyHand;
      const sourceCards = sourceSeat === declarer ? declarerSuitCards : dummySuitCards;
      if (!sourceSeat || !sourceCards.length) return null;

      const entryPlan = entryPlanForHand(sourceHand, suit);
      const tempoSafe = run.lossesNeeded <= tempo.defenderEntriesAllowed;
      const enoughExtraTricks = extraTricks >= needToDevelop;
      const preserveEntry = Boolean(entryPlan.entryCount === 1 && entryPlan.entrySuit);
      const communicationRisk = preserveEntry ? "high" : entryPlan.entryCount ? "low" : "medium";
      const score =
        extraTricks * 34 +
        combinedCards.length * 3 +
        run.ranks.length * 5 -
        run.lossesNeeded * 14 +
        (enoughExtraTricks ? 18 : 0) +
        (entryPlan.entryCount ? 6 : -6) +
        (tempoSafe ? 40 : -90);

      return {
        kind: "developLongSuit",
        confidence: tempoSafe ? "basic" : "uncertain",
        suit,
        suitLength: combinedCards.length,
        sourceSeat,
        sourceLength: sourceCards.length,
        sequence: run.ranks.join(""),
        missingStopper: run.missingHigher[0],
        missingStoppers: run.missingHigher,
        lossesNeeded: run.lossesNeeded,
        extraTricks,
        tempoSafe,
        attackedSuit: tempo.attackedSuit,
        defenderEntriesAllowed: tempo.defenderEntriesAllowed,
        preserveEntry,
        communicationRisk,
        entryType: entryPlan.entryType,
        entrySuit: entryPlan.entrySuit,
        entryRank: entryPlan.entryRank,
        entryTiming: entryPlan.entryTiming,
        entryCount: entryPlan.entryCount,
        score
      };
    }

  function notrumpEarlyGiveUpWorkSuitCandidate({
      suit,
      declarerHand,
      dummyHand,
      declarer,
      dummy,
      playedCards,
      sureWinners,
      needToDevelop
    }) {
      const declarerSuitCards = cardsInSuit(declarerHand, suit);
      const dummySuitCards = cardsInSuit(dummyHand, suit);
      const combinedCards = [...declarerSuitCards, ...dummySuitCards];
      if (combinedCards.length < 7) return null;

      const sides = [
        { seat: declarer, hand: declarerHand, suitCards: declarerSuitCards },
        { seat: dummy, hand: dummyHand, suitCards: dummySuitCards }
      ].sort((a, b) => b.suitCards.length - a.suitCards.length);
      const longSide = sides[0];
      const shortSide = sides[1];
      if (longSide.suitCards.length < 5 || shortSide.suitCards.length < 2) return null;

      const playedSuitCards = cardsInSuit(playedCards, suit);
      const winnerRanks = visibleTopWinnerRanks(combinedCards, playedSuitCards);
      const sameSuitEntryRanks = winnerRanks.filter((rank) => hasRank(longSide.suitCards, rank));
      if (sameSuitEntryRanks.length < 2) return null;

      const currentWinners = sureWinners?.bySuit?.[suit] || 0;
      if (currentWinners < 2) return null;

      const extraTricks = Math.max(0, Math.min(longSide.suitCards.length - 3, combinedCards.length - currentWinners - 4));
      if (extraTricks <= 0) return null;

      const outsideEntryPlan = entryPlanForHand(longSide.hand, suit);
      const score =
        extraTricks * 30 +
        combinedCards.length * 3 +
        sameSuitEntryRanks.length * 12 +
        (extraTricks >= Math.min(2, needToDevelop) ? 18 : 0) +
        (outsideEntryPlan.entryCount ? 8 : 0);

      return {
        kind: "developLongSuit",
        confidence: "uncertain",
        suit,
        suitLength: combinedCards.length,
        sourceSeat: longSide.seat,
        sourceLength: longSide.suitCards.length,
        sequence: sameSuitEntryRanks.join(""),
        missingStopper: null,
        missingStoppers: [],
        lossesNeeded: 1,
        extraTricks,
        tempoSafe: true,
        timing: "giveUpEarly",
        sameSuitEntryCount: sameSuitEntryRanks.length,
        sameSuitEntryRanks,
        preserveEntry: true,
        communicationRisk: outsideEntryPlan.entryCount ? "low" : "medium",
        entryType: outsideEntryPlan.entryType,
        entrySuit: outsideEntryPlan.entrySuit,
        entryRank: outsideEntryPlan.entryRank,
        entryTiming: outsideEntryPlan.entryTiming,
        entryCount: outsideEntryPlan.entryCount,
        score
      };
    }

  function tempoDevelopmentRun(combinedCards, playedSuitCards = []) {
      const combinedRanks = new Set(combinedCards.map((card) => card.rank));
      const playedRanks = new Set(playedSuitCards.map((card) => card.rank));
      const candidates = [];
      for (let i = 0; i < developmentRanks.length - 1; i++) {
        const startRank = developmentRanks[i];
        if (!combinedRanks.has(startRank)) continue;

        const ranks = [];
        for (let j = i; j < developmentRanks.length; j++) {
          const rank = developmentRanks[j];
          if (!combinedRanks.has(rank)) break;
          ranks.push(rank);
        }
        if (ranks.length < 2) continue;

        const missingHigher = developmentRanks
          .slice(0, i)
          .filter((rank) => !combinedRanks.has(rank) && !playedRanks.has(rank));
        if (!missingHigher.length) continue;
        candidates.push({
          ranks,
          missingHigher,
          lossesNeeded: missingHigher.length,
          score: ranks.length * 10 - missingHigher.length * 8 - i
        });
      }
      return candidates.sort((a, b) => b.score - a.score)[0] || null;
    }

  function notrumpTempoContext({ declarer, currentTrick = [], sureWinners }) {
      const lead = currentTrick[0];
      if (!lead?.card || !lead.seat || teamOf(lead.seat) === teamOf(declarer)) {
        return {
          attackedSuit: null,
          defenderEntriesAllowed: Number.POSITIVE_INFINITY
        };
      }

      const attackedSuit = lead.card.suit;
      const stopperCount = sureWinners?.bySuit?.[attackedSuit] || 0;
      const leadConsumesStopper = stopperCount > 0 ? 1 : 0;
      return {
        attackedSuit,
        stopperCount,
        defenderEntriesAllowed: Math.max(0, stopperCount - leadConsumesStopper)
      };
    }

  function notrumpFinessePriorities({ declarerHand, dummyHand, declarer, dummy, playedCards, safeHandContext = null }) {
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
          const losingSeat = nextSeat(direction.targetSeat);
          const safeHandFinesse = safeHandContext?.safeSeat && losingSeat === safeHandContext.safeSeat;
          candidates.push({
            kind: safeHandFinesse ? "safeHandFinesse" : candidate.ruleId === "doubleFinesseTowardHonor" ? "doubleFinesse" : "finesse",
            confidence: "uncertain",
            suit,
            leadSeat: direction.leadSeat,
            targetSeat: candidate.targetSeat,
            finesseRank: candidate.finesseRank,
            leadRank: safeHandFinesse ? safeHandLeadRank(direction.currentSuitCards, candidate.finesseRank, candidate.card) : null,
            missingHonor: candidate.missingHonor,
            missingHonors: candidate.missingHonors,
            losingSeat,
            safeSeat: safeHandFinesse ? safeHandContext.safeSeat : null,
            dangerousSeat: safeHandFinesse ? safeHandContext.dangerousSeat : null,
            attackedSuit: safeHandFinesse ? safeHandContext.attackedSuit : null,
            score: candidate.score - 20 + (safeHandFinesse ? 100 : 0)
          });
        });
      }
      return candidates;
    }

  function notrumpHoldUpPriorities({ declarerHand, dummyHand, declarer, trickHistory = [], currentTrick = [], neededTricks, sureWinners }) {
      if (!currentTrick.length || sureWinners.total >= neededTricks) return [];
      const lead = currentTrick[0];
      if (!lead?.card || !lead.seat || teamOf(lead.seat) === teamOf(declarer)) return [];

      const suit = lead.card.suit;
      const declarerSuitCards = cardsInSuit(declarerHand, suit);
      const dummySuitCards = cardsInSuit(dummyHand, suit);
      const combinedCards = [...declarerSuitCards, ...dummySuitCards];
      if (!hasRank(combinedCards, "A")) return [];

      const previousDeclarerSideCards = trickHistory
        .flatMap((trick) => trick.cards || [])
        .filter((play) => play.card?.suit === suit && teamOf(play.seat) === teamOf(declarer))
        .length;
      const originalCombinedLength = combinedCards.length + previousDeclarerSideCards;
      const holdUpTarget = Math.max(0, Math.min(combinedCards.filter((card) => card.rank !== "A").length, 7 - originalCombinedLength));
      const holdUpsTaken = notrumpHoldUpsTaken({ trickHistory, suit, declarer });
      const holdUpsRemaining = Math.max(0, holdUpTarget - holdUpsTaken);
      if (!holdUpsRemaining) return [];

      const playedSuitCards = cardsInSuit(currentTrick.map((play) => play.card), suit);
      const visibleWinners = visibleTopWinnerRanks(combinedCards, playedSuitCards);
      if (visibleWinners.length !== 1 || visibleWinners[0] !== "A") return [];

      const highestPlayedRankIndex = Math.max(...playedSuitCards.map((card) => rankOrder.indexOf(card.rank)));
      const duckCard = lowestCard(combinedCards.filter((card) => {
        return card.rank !== "A" && rankOrder.indexOf(card.rank) < highestPlayedRankIndex;
      }));
      if (!duckCard) return [];

      const stopperSeat = seatForSuitRank("A", declarerSuitCards, dummySuitCards, declarer, partnerOf(declarer));
      return [{
        kind: "holdUpStopper",
        confidence: "basic",
        suit,
        leadSeat: lead.seat,
        stopperSeat,
        stopperRank: "A",
        duckRank: duckCard.rank,
        duckSeat: declarerSuitCards.some((card) => card.id === duckCard.id) ? declarer : partnerOf(declarer),
        holdUpTarget,
        holdUpsTaken,
        holdUpsRemaining,
        dangerousSeat: lead.seat,
        safeSeat: partnerOf(lead.seat),
        needToDevelop: Math.max(0, neededTricks - sureWinners.total),
        score: 112
      }];
    }

  function notrumpHoldUpsTaken({ trickHistory = [], suit, declarer }) {
      return trickHistory.filter((trick) => {
        const cards = trick.cards || [];
        const leadPlay = cards[0];
        return (
          leadPlay?.card?.suit === suit &&
          teamOf(leadPlay.seat) !== teamOf(declarer) &&
          teamOf(trick.winner) !== teamOf(declarer)
        );
      }).length;
    }

  function notrumpSafeHandContext({ declarer, trickHistory = [], currentTrick = [] }) {
      const firstAttack = [...trickHistory, currentTrick.length ? { cards: currentTrick } : null]
        .filter(Boolean)
        .map((trick) => (trick.cards || [])[0])
        .find((play) => play?.card && teamOf(play.seat) !== teamOf(declarer));
      if (!firstAttack) return null;

      const attackedSuit = firstAttack.card.suit;
      const attackTricks = trickHistory.filter((trick) => (trick.cards || [])[0]?.card?.suit === attackedSuit);
      const firstDeclarerWinIndex = attackTricks.findIndex((trick) => teamOf(trick.winner) === teamOf(declarer));
      if (firstDeclarerWinIndex < 0) return null;

      const heldUpRounds = attackTricks
        .slice(0, firstDeclarerWinIndex)
        .filter((trick) => teamOf(trick.winner) !== teamOf(declarer))
        .length;
      if (heldUpRounds < 2) return null;

      return {
        attackedSuit,
        dangerousSeat: firstAttack.seat,
        safeSeat: partnerOf(firstAttack.seat),
        heldUpRounds
      };
    }

  function nextSeat(seat) {
      const index = seats.indexOf(seat);
      if (index < 0) return null;
      return seats[(index + 1) % seats.length];
    }

  function safeHandLeadRank(cards, finesseRank, fallbackCard) {
      const below = cards.filter((card) => rankOrder.indexOf(card.rank) < rankOrder.indexOf(finesseRank));
      return highestCard(below)?.rank || fallbackCard?.rank || null;
    }

  function notrumpRepeatFinessePriorities({ declarerHand, dummyHand, declarer, dummy, trickHistory = [], playedCards = [] }) {
      const candidates = [];
      for (const suit of suits) {
        const declarerSuitCards = cardsInSuit(declarerHand, suit);
        const dummySuitCards = cardsInSuit(dummyHand, suit);
        const playedSuitCards = cardsInSuit(playedCards, suit);
        [
          {
            leadSeat: declarer,
            targetSeat: dummy,
            leadSuitCards: declarerSuitCards,
            targetSuitCards: dummySuitCards,
            targetHand: dummyHand
          },
          {
            leadSeat: dummy,
            targetSeat: declarer,
            leadSuitCards: dummySuitCards,
            targetSuitCards: declarerSuitCards,
            targetHand: declarerHand
          }
        ].forEach((direction) => {
          const candidate = repeatFinesseCandidate({
            suit,
            trickHistory,
            playedSuitCards,
            ...direction
          });
          if (candidate) candidates.push(candidate);
        });
      }
      return candidates.sort((a, b) => b.score - a.score);
    }

  function repeatFinesseCandidate({
      suit,
      trickHistory,
      playedSuitCards,
      leadSeat,
      targetSeat,
      leadSuitCards,
      targetSuitCards,
      targetHand
    }) {
      const combinedCards = [...leadSuitCards, ...targetSuitCards];
      for (const pattern of repeatFinessePatterns) {
        if (hasRank(combinedCards, pattern.missingHonor) || hasRank(playedSuitCards, pattern.missingHonor)) continue;
        if (!hasRank(targetSuitCards, pattern.finesseRank)) continue;
        if (!pattern.guardRanks.every((rank) => hasRank(targetSuitCards, rank))) continue;
        const leadCard = lowestSmallCardBelow(leadSuitCards, pattern.finesseRank);
        if (!leadCard) continue;
        if (!previousSuccessfulFinesse({ trickHistory, suit, leadSeat, targetSeat, pattern })) continue;

        const entryPlan = targetHandEntryPlan({
          pattern,
          currentSuitCards: leadSuitCards,
          partnerHand: targetHand,
          partnerSuitCards: targetSuitCards,
          leadCard,
          suit
        });

        return {
          kind: "repeatFinesse",
          confidence: "uncertain",
          suit,
          leadSeat,
          targetSeat,
          finesseRank: pattern.finesseRank,
          missingHonor: pattern.missingHonor,
          previousFinesseRank: pattern.firstFinesseRank,
          entryType: entryPlan?.entryType || null,
          entrySuit: entryPlan?.entrySuit || null,
          entryRank: entryPlan?.entryRank || null,
          score: pattern.score + targetSuitCards.length + leadSuitCards.length
        };
      }
      return null;
    }

  function previousSuccessfulFinesse({ trickHistory, suit, leadSeat, targetSeat, pattern }) {
      return trickHistory.some((trick) => {
        if (trick.winner !== targetSeat) return false;
        const targetPlay = (trick.cards || []).find((play) => {
          return play.seat === targetSeat && play.card.suit === suit && play.card.rank === pattern.firstFinesseRank;
        });
        const leadPlay = (trick.cards || []).find((play) => {
          return (
            play.seat === leadSeat &&
            play.card.suit === suit &&
            rankOrder.indexOf(play.card.rank) < rankOrder.indexOf(pattern.firstFinesseRank)
          );
        });
        return Boolean(targetPlay && leadPlay);
      });
    }

  function notrumpTwoWayFinessePriorities({ declarerHand, dummyHand, declarer, dummy, playedCards = [] }) {
      const candidates = [];
      for (const suit of suits) {
        const declarerSuitCards = cardsInSuit(declarerHand, suit);
        const dummySuitCards = cardsInSuit(dummyHand, suit);
        const candidate = twoWayFinesseCandidate({
          suit,
          declarer,
          dummy,
          declarerHand,
          dummyHand,
          declarerSuitCards,
          dummySuitCards,
          playedSuitCards: cardsInSuit(playedCards, suit)
        });
        if (candidate) candidates.push(candidate);
      }
      return candidates.sort((a, b) => b.score - a.score);
    }

  function twoWayFinesseCandidate({
      suit,
      declarer,
      dummy,
      declarerHand,
      dummyHand,
      declarerSuitCards,
      dummySuitCards,
      playedSuitCards
    }) {
      const combinedCards = [...declarerSuitCards, ...dummySuitCards];
      if (hasRank(combinedCards, "Q") || hasRank(playedSuitCards, "Q")) return null;

      const sides = [
        { seat: declarer, hand: declarerHand, suitCards: declarerSuitCards },
        { seat: dummy, hand: dummyHand, suitCards: dummySuitCards }
      ];
      const ajSide = sides.find((side) => hasRank(side.suitCards, "A") && hasRank(side.suitCards, "J"));
      const ktSide = sides.find((side) => hasRank(side.suitCards, "K") && hasRank(side.suitCards, "T"));
      if (!ajSide || !ktSide || ajSide.seat === ktSide.seat) return null;

      const directions = [
        twoWayFinesseDirection({ suit, targetSide: ajSide, leadSide: ktSide, finesseRank: "J", declarer }),
        twoWayFinesseDirection({ suit, targetSide: ktSide, leadSide: ajSide, finesseRank: "T", declarer })
      ].filter(Boolean);
      if (!directions.length) return null;

      return directions.sort((a, b) => {
        const entryDiff = b.entryCount - a.entryCount;
        if (entryDiff) return entryDiff;
        const lengthDiff = b.targetLength - a.targetLength;
        if (lengthDiff) return lengthDiff;
        if (a.targetSeat === declarer && b.targetSeat !== declarer) return -1;
        if (b.targetSeat === declarer && a.targetSeat !== declarer) return 1;
        return 0;
      })[0];
    }

  function twoWayFinesseDirection({ suit, targetSide, leadSide, finesseRank, declarer }) {
      const leadCard = lowestSmallCardBelow(leadSide.suitCards, finesseRank);
      if (!leadCard) return null;
      const entryCard = clearOutsideEntryCard(targetSide.hand, suit);
      const entryCount = clearOutsideEntries(targetSide.hand, suit);
      return {
        kind: "twoWayFinesse",
        confidence: "uncertain",
        suit,
        leadSeat: leadSide.seat,
        targetSeat: targetSide.seat,
        targetLength: targetSide.suitCards.length,
        leadLength: leadSide.suitCards.length,
        finesseRank,
        missingHonor: "Q",
        entryType: entryCard ? "outsideAce" : "none",
        entrySuit: entryCard?.suit || null,
        entryRank: entryCard?.rank || null,
        entryCount,
        score: 74 + entryCount * 8 + targetSide.suitCards.length * 2 + (targetSide.seat === declarer ? 1 : 0)
      };
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

  function createSuitPlayPlan({ declarerHand, dummyHand, contract, declarer, dummy, trickHistory = [], currentTrick = [] }) {
      const neededTricks = contract.level + 6;
      const trump = contract.strain;
      const playedCards = playedCardsFrom(trickHistory, currentTrick);
      const losers = countSuitContractLosers(declarerHand, dummyHand, trump, neededTricks);
      const priorities = [];
      const ruffPriorities = shortSuitRuffPriorities(declarerHand, dummyHand, trump, dummy, losers.detailsBySuit);
      const longRuffPriorities = longSuitRuffDevelopmentPriorities(declarerHand, dummyHand, trump, declarer, dummy, playedCards);
      const directRuffPriorities = ruffPriorities.filter((priority) => {
        return !longRuffPriorities.some((longPriority) => longPriority.suit === priority.suit && longPriority.shortSeat === priority.shortSeat);
      });
      const cashPriorities = suitCashPriorities(declarerHand, dummyHand, trump, declarer, dummy, playedCards);
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
        urgentDiscardPriorities
      });
      const trumpPriority = drawTrumpPriority(declarerHand, dummyHand, trump, timingPlan);

      if (trumpPriority?.timing === "afterUrgentDiscard") {
        priorities.push(...urgentDiscardPriorities.slice(0, 1));
        if (trumpPriority) priorities.push(trumpPriority);
        priorities.push(...cashPriorities.filter((priority) => priority.timing !== "urgentBeforeTrumps").slice(0, 1));
      } else if (trumpPriority?.timing === "early") {
        if (trumpPriority) priorities.push(trumpPriority);
        priorities.push(...cashPriorities.slice(0, 2));
      } else if (trumpPriority?.timing === "limitedBeforeRuff") {
        if (trumpPriority) priorities.push(trumpPriority);
        priorities.push(...longRuffPriorities.slice(0, 1));
        priorities.push(...directRuffPriorities.slice(0, 2));
        priorities.push(...cashPriorities.slice(0, 1));
      } else if (trumpPriority?.timing === "afterUnblock") {
        priorities.push(...cashPriorities.filter((priority) => priority.timing === "unblockBeforeEntry").slice(0, 1));
        priorities.push(...longRuffPriorities.slice(0, 1));
        priorities.push(...directRuffPriorities.slice(0, 2));
        if (trumpPriority) priorities.push(trumpPriority);
        priorities.push(...cashPriorities.filter((priority) => priority.timing !== "unblockBeforeEntry").slice(0, 1));
      } else {
        priorities.push(...longRuffPriorities.slice(0, 1));
        priorities.push(...directRuffPriorities.slice(0, 2));
        if (trumpPriority) priorities.push(trumpPriority);
        priorities.push(...cashPriorities.slice(0, 1));
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
        timingPlan,
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
        const declarerTrumps = cardsInSuit(declarerHand, trump);
        if (dummyTrumps.length < 1 || dummyTrumps.length >= declarerTrumps.length) return [];
        return suits
          .filter((suit) => suit !== trump)
          .map((suit) => ({
            kind: "ruffShortSuit",
            confidence: "basic",
            suit,
            shortSeat: dummy,
            shortLength: cardsInSuit(dummyHand, suit).length,
            declarerLength: cardsInSuit(declarerHand, suit).length,
            shortTrumpLength: dummyTrumps.length,
            longTrumpLength: declarerTrumps.length,
            losers: detailsBySuit[suit]?.rawLosers || 0,
            ruffReduction: detailsBySuit[suit]?.ruffReduction || 0,
            score: (detailsBySuit[suit]?.rawLosers || 0) * 20 - cardsInSuit(dummyHand, suit).length * 3
          }))
          .filter((priority) => priority.shortLength <= 1 && priority.declarerLength >= 2 && priority.losers > 0)
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
      urgentDiscardPriorities = []
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
    notrumpHoldUpPriorities,
    notrumpDevelopmentPriorities,
    notrumpRepeatFinessePriorities,
    repeatFinesseCandidate,
    previousSuccessfulFinesse,
    notrumpTwoWayFinessePriorities,
    twoWayFinesseCandidate,
    twoWayFinesseDirection,
    notrumpFinessePriorities,
    uniquePlanPriorities,
    notrumpPlanWarnings,
    clearOutsideEntries,
    createSuitPlayPlan,
    countSuitContractLosers,
    suitLoserEstimate,
    shortSuitRuffPriorities,
    longSuitRuffDevelopmentPriorities,
    longSuitRuffEntryCandidates,
    longSuitRuffEntryCandidate,
    suitContractTimingPlan,
    suitTrumpControl,
    playedTrumpRoundsFrom,
    suitCashPriorities,
    suitUrgentDiscardPriorities,
    urgentAttackedSuit,
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

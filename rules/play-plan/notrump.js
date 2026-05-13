(function initBridgeRulesPlayPlanNotrump(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const deps = isCommonJs
    ? { core: require("../core.js"), common: require("./common.js"), endgameRunout: require("./endgame-runout.js") }
    : { core: root.BridgeRulesParts?.core, common: root.BridgeRulesPlayPlanParts?.common, endgameRunout: root.BridgeRulesPlayPlanParts?.endgameRunout };
  const api = factory(deps.core, deps.common, deps.endgameRunout);
  if (isCommonJs) module.exports = api;
  root.BridgeRulesPlayPlanParts = root.BridgeRulesPlayPlanParts || {};
  root.BridgeRulesPlayPlanParts.notrump = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesPlayPlanNotrump(core, common, endgameRunout) {
  "use strict";

  if (!core) throw new Error("BridgeRules play-plan notrump missing core dependency");
  if (!common) throw new Error("BridgeRules play-plan notrump missing common dependency");
  if (!endgameRunout) throw new Error("BridgeRules play-plan notrump missing endgame-runout dependency");

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
    developmentRanks,
    visibleTopWinnerRanks,
    seatForSuitRank,
    blockedSuitInfo,
    clearOutsideEntryCard,
    entryPlanForHand,
    clearOutsideEntries,
    cardsInSuit,
    hasRank,
    lowestSmallCardBelow,
    playedCardsFrom,
    topTouchingHonorRun,
    missingHigherRanks,
    finesseCandidate,
    repeatFinesseCandidate
  } = common;
  const { endgameRunoutPriority } = endgameRunout;

  function createNotrumpPlayPlan({ declarerHand, dummyHand, contract, declarer, dummy, trickHistory, currentTrick = [] }) {
      const playedCards = playedCardsFrom(trickHistory, currentTrick);
      const neededTricks = contract.level + 6;
      const sureWinners = countSureWinners(declarerHand, dummyHand, playedCards, declarer, dummy);
      const needToDevelop = Math.max(0, neededTricks - sureWinners.total);
      const endgameRunout = endgameRunoutPriority({ declarerHand, dummyHand, contract, declarer, dummy, trickHistory, currentTrick });
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
      const selectedPriorities = endgameRunout
        ? [endgameRunout, ...uniquePlanPriorities(priorities).slice(0, 2)]
        : uniquePlanPriorities(priorities).slice(0, 3);
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

  return {
    createNotrumpPlayPlan,
    countSureWinners,
    notrumpSuitWinnerDetail,
    notrumpCashPriorities,
    notrumpDevelopmentPriorities,
    notrumpTempoWorkSuitPriorities,
    notrumpTempoWorkSuitCandidate,
    notrumpEarlyGiveUpWorkSuitCandidate,
    tempoDevelopmentRun,
    notrumpTempoContext,
    notrumpFinessePriorities,
    notrumpHoldUpPriorities,
    notrumpHoldUpsTaken,
    notrumpSafeHandContext,
    nextSeat,
    safeHandLeadRank,
    notrumpRepeatFinessePriorities,
    notrumpTwoWayFinessePriorities,
    twoWayFinesseCandidate,
    twoWayFinesseDirection,
    uniquePlanPriorities,
    notrumpPlanWarnings
  };
});

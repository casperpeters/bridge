(function initBridgeRulesCardPlay(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const deps = isCommonJs
    ? {
        core: require("./core.js"),
        playMechanics: require("./play-mechanics.js"),
        playPlan: require("./play-plan.js"),
        cardPlayLeads: require("./card-play/opening-leads.js")
      }
    : root.BridgeRulesParts || {};
  const api = factory(deps.core, deps.playMechanics, deps.playPlan, deps.cardPlayLeads);
  if (isCommonJs) module.exports = api;
  root.BridgeRulesParts = root.BridgeRulesParts || {};
  root.BridgeRulesParts.cardPlay = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesCardPlay(core, playMechanics, playPlan, cardPlayLeads) {
  "use strict";

  const {
    suits,
    rankOrder,
    descendingRanks,
    leadHonorRanks,
    hcpValue,
    compareLowCards,
    lowestCard,
    highestCard,
    longestSuitForLead,
    isLeadHonorRank,
    isLowLeadCard,
    teamOf,
    partnerOf
  } = core;
  const { legalCards, beats, currentWinningPlay } = playMechanics;
  const {
    cardsInSuit,
    hasRank,
    lowestSmallCardBelow,
    sideAceEntry,
    sameSuitFinesseEntry,
    targetHandEntryPlan,
    playedCardsFrom,
    visibleTopWinnerRanks,
    longSuitDevelopmentCandidate,
    finesseCandidate,
    longSuitRuffEntryCandidates
  } = playPlan;

  function chooseDeclarerFinessePlay({
      hand,
      partnerHand,
      currentTrick,
      trickHistory,
      seat,
      declarer,
      dummy,
      contract
    }) {
      if (currentTrick.length || contract?.strain !== "NT") return null;
      if (!partnerHand?.length || !declarer || !dummy) return null;
      if (seat !== declarer && seat !== dummy) return null;

      const partnerSeat = partnerOf(seat);
      const playedCards = playedCardsFrom(trickHistory, currentTrick);
      const candidates = [];

      for (const suit of suits) {
        const currentSuitCards = cardsInSuit(hand, suit);
        const partnerSuitCards = cardsInSuit(partnerHand, suit);
        const playedSuitCards = cardsInSuit(playedCards, suit);
        const candidate = finesseCandidate({
          suit,
          partnerHand,
          currentSuitCards,
          partnerSuitCards,
          playedSuitCards,
          partnerSeat
        });
        if (candidate) candidates.push(candidate);
      }

      const best = candidates.sort((a, b) => b.score - a.score)[0];
      if (!best) return null;

      return cardPlayResult(
        best.card,
        best.ruleId,
        "uncertain",
        best.reason,
        {
          suit: best.suit,
          targetSeat: best.targetSeat,
          targetLength: best.targetLength,
          finesseRank: best.finesseRank,
          missingHonor: best.missingHonor,
          missingHonors: best.missingHonors,
          guardRanks: best.guardRanks,
          entryType: best.entryType,
          entrySuit: best.entrySuit,
          entryRank: best.entryRank,
          action: best.action
        }
      );
    }

  function chooseDeclarerDevelopmentPlay({
      hand,
      partnerHand,
      currentTrick,
      trickHistory,
      seat,
      declarer,
      dummy,
      contract
    }) {
      if (currentTrick.length || contract?.strain !== "NT") return null;
      if (!partnerHand?.length || !declarer || !dummy) return null;
      if (seat !== declarer && seat !== dummy) return null;

      const partnerSeat = partnerOf(seat);
      const playedCards = playedCardsFrom(trickHistory, currentTrick);
      const candidates = [];

      for (const suit of suits) {
        const currentSuitCards = cardsInSuit(hand, suit);
        if (!currentSuitCards.length) continue;

        const partnerSuitCards = cardsInSuit(partnerHand, suit);
        const playedSuitCards = cardsInSuit(playedCards, suit);
        const currentCandidate = longSuitDevelopmentCandidate({
          suit,
          source: "current",
          sourceCards: currentSuitCards,
          currentSuitCards,
          partnerSuitCards,
          playedSuitCards,
          seat,
          partnerSeat
        });
        const partnerCandidate = longSuitDevelopmentCandidate({
          suit,
          source: "partner",
          sourceCards: partnerSuitCards,
          currentSuitCards,
          partnerSuitCards,
          playedSuitCards,
          seat,
          partnerSeat
        });

        if (currentCandidate) candidates.push(currentCandidate);
        if (partnerCandidate) candidates.push(partnerCandidate);
      }

      const best = candidates.sort((a, b) => b.score - a.score)[0];
      if (!best) return null;

      return cardPlayResult(
        best.card,
        "developLongSuit",
        "uncertain",
        "Develop a long notrump suit by forcing out a missing high card.",
        {
          suit: best.suit,
          suitLength: best.suitLength,
          sourceSeat: best.sourceSeat,
          sourceLength: best.sourceLength,
          sequence: best.sequence,
          missingStopper: best.missingStopper,
          action: best.action
        }
      );
    }

  function chooseCardFromPlayPlan({
      hand,
      partnerHand,
      currentTrick,
      trickHistory,
      seat,
      declarer,
      dummy,
      contract,
      trump,
      playPlan,
      legal
    }) {
      const decision = choosePlayPlanAction({
        hand,
        partnerHand,
        currentTrick,
        trickHistory,
        seat,
        declarer,
        dummy,
        contract,
        trump,
        playPlan,
        legal,
        winning: currentTrick.length ? currentWinningPlay(currentTrick, trump) : null
      });
      return decision.result;
    }

  function choosePlayPlanAction({
      hand,
      partnerHand,
      currentTrick,
      trickHistory,
      seat,
      declarer,
      dummy,
      contract,
      trump,
      playPlan,
      legal,
      winning = null
    }) {
      if (!playPlan?.priorities?.length) return { result: null, fallback: null };
      if (!partnerHand?.length || !declarer || !dummy) return { result: null, fallback: null };
      if (seat !== declarer && seat !== dummy) return { result: null, fallback: null };

      for (const priority of playPlan.priorities) {
        const result = chooseCardForPlanPriority({
          priority,
          hand,
          partnerHand,
          currentTrick,
          trickHistory,
          seat,
          contract,
          trump,
          legal,
          winning
        });
        if (result) return { result, fallback: null };
      }

      return {
        result: null,
        fallback: describePlayPlanFallback({
          priority: playPlan.priorities[0],
          hand,
          currentTrick,
          seat,
          legal
        })
      };
    }

  function chooseCardForPlanPriority({
      priority,
      hand,
      partnerHand,
      currentTrick = [],
      trickHistory,
      seat,
      contract,
      trump,
      legal,
      winning = null
    }) {
      if (currentTrick.length) {
        return chooseCardForPlanPriorityInTrick({
          priority,
          hand,
          partnerHand,
          currentTrick,
          trickHistory,
          seat,
          contract,
          trump,
          legal,
          winning
        });
      }
      if (priority.kind === "developLongSuit") {
        return choosePlanDevelopmentPlay({ priority, hand, partnerHand, seat, legal });
      }
      if (priority.kind === "finesse" || priority.kind === "doubleFinesse" || priority.kind === "safeHandFinesse") {
        return choosePlanFinessePlay({ priority, hand, partnerHand, trickHistory, seat, legal });
      }
      if (priority.kind === "repeatFinesse" || priority.kind === "twoWayFinesse") {
        return choosePlanDirectionalFinessePlay({ priority, hand, partnerHand, seat, legal });
      }
      if (priority.kind === "ruffShortSuit") {
        return choosePlanRuffPlay({ priority, hand, partnerHand, trickHistory, seat, trump, legal });
      }
      if (priority.kind === "establishLongSuitByRuffing") {
        return choosePlanLongSuitRuffDevelopmentPlay({ priority, hand, partnerHand, trickHistory, seat, trump, legal });
      }
      if (priority.kind === "drawTrumps") {
        return choosePlanDrawTrumpsPlay({ priority, contract, legal, seat });
      }
      if (priority.kind === "discardLoserOnWinner") {
        return choosePlanDiscardLoserOnWinnerPlay({ priority, hand, partnerHand, seat, legal });
      }
      if (priority.kind === "cashWinners" || priority.kind === "cashSureWinners") {
        return choosePlanCashWinnerPlay({ priority, hand, seat, legal });
      }
      return null;
    }

  function chooseCardForPlanPriorityInTrick({
      priority,
      hand,
      partnerHand,
      currentTrick,
      trickHistory,
      seat,
      contract,
      trump,
      legal,
      winning
    }) {
      if (priority.kind === "holdUpStopper") {
        return choosePlanHoldUpPlay({ playPlan: { priorities: [priority] }, hand, currentTrick, seat, trump, legal, winning });
      }
      if (priority.kind === "developLongSuit") {
        const preserveEntry = choosePlanPreserveWorkSuitEntryPlay({
          playPlan: { priorities: [priority] },
          hand,
          partnerHand,
          currentTrick,
          seat,
          trump,
          legal,
          winning
        });
        if (preserveEntry) return preserveEntry;
        return choosePlanDevelopmentInTrickPlay({ priority, hand, partnerHand, currentTrick, seat, legal });
      }
      if (priority.kind === "finesse" || priority.kind === "doubleFinesse" || priority.kind === "safeHandFinesse") {
        return choosePlanFinesseInTrickPlay({ priority, currentTrick, seat, trump, legal, winning });
      }
      if (priority.kind === "repeatFinesse" || priority.kind === "twoWayFinesse") {
        return choosePlanDirectionalFinesseInTrickPlay({ priority, currentTrick, seat, trump, legal, winning });
      }
      if (priority.kind === "ruffShortSuit" || priority.kind === "establishLongSuitByRuffing") {
        return choosePlanRuffInTrickPlay({ playPlan: { priorities: [priority] }, hand, currentTrick, seat, trump, legal, winning });
      }
      if (priority.kind === "discardLoserOnWinner") {
        return choosePlanDiscardLoserOnWinnerInTrickPlay({ priority, hand, currentTrick, seat, trump, legal, winning });
      }
      if (priority.kind === "drawTrumps") {
        return choosePlanDrawTrumpsInTrickPlay({ priority, contract, currentTrick, seat, legal, winning });
      }
      if (priority.kind === "cashWinners" || priority.kind === "cashSureWinners") {
        return choosePlanCashWinnerInTrickPlay({ priority, currentTrick, seat, trump, legal, winning });
      }
      return null;
    }

  function describePlayPlanFallback({ priority, hand, currentTrick, seat, legal }) {
      if (!priority) return null;
      const fallback = {
        priority,
        reason: "notPlayableNow",
        seat
      };
      if (currentTrick.length) {
        const leadSuit = currentTrick[0].card.suit;
        fallback.leadSuit = leadSuit;
        if (cardsInSuit(hand, leadSuit).length && priority.suit && priority.suit !== leadSuit) {
          fallback.reason = "followSuit";
          return fallback;
        }
        if (priority.leadSeat && priority.leadSeat !== seat) {
          fallback.reason = "needsOtherHand";
          fallback.waitingForSeat = priority.leadSeat;
          return fallback;
        }
        if (priority.targetSeat && priority.targetSeat !== seat && priority.kind !== "discardLoserOnWinner") {
          fallback.reason = "needsOtherHand";
          fallback.waitingForSeat = priority.targetSeat;
          return fallback;
        }
        fallback.reason = "finishCurrentTrick";
        return fallback;
      }

      if (priority.leadSeat && priority.leadSeat !== seat) {
        fallback.reason = "needsOtherHand";
        fallback.waitingForSeat = priority.leadSeat;
        return fallback;
      }
      if (priority.firstSeat && priority.firstSeat !== seat) {
        fallback.reason = "needsOtherHand";
        fallback.waitingForSeat = priority.firstSeat;
        return fallback;
      }
      if (priority.longSeat && priority.longSeat !== seat && priority.shortSeat !== seat) {
        fallback.reason = "needsOtherHand";
        fallback.waitingForSeat = priority.longSeat;
        return fallback;
      }
      if (priority.suit && !cardsInSuit(legal, priority.suit).length) {
        fallback.reason = "noPlanSuitCard";
        return fallback;
      }
      return fallback;
    }

  function withPlayPlanFallback(result, decision) {
      if (!result || result.planPriority || !decision?.fallback) return result;
      return {
        ...result,
        planFallback: decision.fallback
      };
    }

  function choosePlanHoldUpPlay({ playPlan, hand, currentTrick, seat, trump, legal, winning }) {
      if (trump || !playPlan?.priorities?.length || currentTrick.length < 1 || !winning) return null;
      const leadSuit = currentTrick[0].card.suit;
      const priority = playPlan.priorities.find((item) => item.kind === "holdUpStopper" && item.suit === leadSuit);
      if (!priority) return null;

      const suitedLegal = cardsInSuit(legal, leadSuit);
      const duckCards = suitedLegal
        .filter((card) => card.rank !== priority.stopperRank && !beats(card, winning.card, leadSuit, trump))
        .sort(compareLowCards);
      const card = duckCards[0];
      if (!card) return null;

      return cardPlayResult(
        card,
        "playPlan.holdUpStopper",
        priority.confidence || "basic",
        "Follow the visible play plan by ducking with a low card to hold up the ace stopper.",
        {
          planPriority: priority,
          suit: priority.suit,
          leadSeat: priority.leadSeat,
          stopperSeat: priority.stopperSeat,
          stopperRank: priority.stopperRank,
          duckRank: card.rank,
          holdUpTarget: priority.holdUpTarget || 0,
          holdUpsTaken: priority.holdUpsTaken || 0,
          holdUpsRemaining: priority.holdUpsRemaining || 0,
          dangerousSeat: priority.dangerousSeat || null,
          safeSeat: priority.safeSeat || null,
          action: "holdUpStopper"
        }
      );
    }

  function choosePlanPreserveWorkSuitEntryPlay({ playPlan, hand, partnerHand, currentTrick, seat, trump, legal, winning }) {
      if (trump || !playPlan?.priorities?.length || !partnerHand?.length || currentTrick.length < 1 || !winning) return null;
      const leadSuit = currentTrick[0].card.suit;
      const priority = playPlan.priorities.find((item) => {
        return (
          item.kind === "developLongSuit" &&
          item.preserveEntry &&
          item.sourceSeat === seat &&
          item.entrySuit === leadSuit &&
          item.entryRank
        );
      });
      if (!priority) return null;

      const entryCard = legalPlanCard(cardsInSuit(legal, leadSuit).find((card) => card.rank === priority.entryRank), legal);
      if (!entryCard) return null;

      const partnerCanWin = cardsInSuit(partnerHand, leadSuit).some((card) => beats(card, winning.card, leadSuit, trump));
      if (!partnerCanWin) return null;

      const duckCards = cardsInSuit(legal, leadSuit)
        .filter((card) => card.id !== entryCard.id && !beats(card, winning.card, leadSuit, trump))
        .sort(compareLowCards);
      const card = duckCards[0];
      if (!card) return null;

      return cardPlayResult(
        card,
        "playPlan.preserveWorkSuitEntry",
        priority.confidence || "basic",
        "Follow the visible play plan by saving the entry to the long notrump work suit.",
        {
          planPriority: priority,
          suit: priority.suit,
          sourceSeat: priority.sourceSeat,
          entrySuit: priority.entrySuit,
          entryRank: priority.entryRank,
          action: "preserveWorkSuitEntry"
        }
      );
    }

  function choosePlanLongSuitRuffDevelopmentPlay({ priority, hand, partnerHand, trickHistory, seat, trump, legal }) {
      if (!trump) return null;
      if (seat === priority.longSeat) {
        const card = legalPlanCard(lowestCard(cardsInSuit(hand, priority.suit)), legal);
        if (!card) return null;
        return cardPlayResult(
          card,
          "playPlan.establishLongSuitByRuffing",
          priority.confidence || "basic",
          "Follow the visible play plan by playing the long side suit before drawing trumps.",
          {
            planPriority: priority,
            suit: priority.suit,
            longSeat: priority.longSeat,
            shortSeat: priority.shortSeat,
            longLength: priority.longLength,
            shortLength: priority.shortLength,
            estimatedRuffsNeeded: priority.estimatedRuffsNeeded,
            action: "leadLongSuitForRuff"
          }
        );
      }

      if (seat !== priority.shortSeat) return null;
      const entries = longSuitRuffEntryCandidates({
        shortHand: hand,
        longHand: partnerHand,
        playedCards: playedCardsFrom(trickHistory, []),
        trump,
        ruffSuit: priority.suit
      });
      const candidate = entries.find((entry) => legalPlanCard(entry.card, legal));
      if (!candidate) return null;

      return cardPlayResult(
        candidate.card,
        "playPlan.enterLongSuitHand",
        priority.confidence || "basic",
        "Follow the visible play plan by returning to the hand with the long side suit.",
        {
          planPriority: priority,
          suit: priority.suit,
          longSeat: priority.longSeat,
          shortSeat: priority.shortSeat,
          entrySuit: candidate.suit,
          entryRank: candidate.entryRank,
          targetSeat: priority.longSeat,
          action: "leadEntryToLongSuitHand"
        }
      );
    }

  function choosePlanRuffInTrickPlay({ playPlan, hand, currentTrick, seat, trump, legal, winning }) {
      if (!trump || !playPlan?.priorities?.length || currentTrick.length < 1) return null;
      const leadSuit = currentTrick[0].card.suit;
      const priority = playPlan.priorities.find((item) => {
        return (
          (item.kind === "ruffShortSuit" || item.kind === "establishLongSuitByRuffing") &&
          item.suit === leadSuit &&
          item.shortSeat === seat
        );
      });
      if (!priority || cardsInSuit(hand, leadSuit).length) return null;

      const trumpCards = cardsInSuit(legal, trump);
      if (!trumpCards.length) return null;
      if (winning && teamOf(winning.seat) === teamOf(seat)) return null;

      const winningTrumps = winning
        ? trumpCards.filter((card) => beats(card, winning.card, leadSuit, trump)).sort(compareLowCards)
        : trumpCards;
      const card = winningTrumps[0] || lowestCard(trumpCards);
      return cardPlayResult(
        card,
        priority.kind === "establishLongSuitByRuffing" ? "playPlan.ruffOutLongSuit" : "playPlan.ruffShortSuit",
        priority.confidence || "basic",
        "Follow the visible play plan by ruffing the planned side suit.",
        {
          planPriority: priority,
          suit: priority.suit,
          shortSeat: priority.shortSeat,
          longSeat: priority.longSeat || partnerOf(seat),
          trump,
          action: priority.kind === "establishLongSuitByRuffing" ? "ruffOutLongSuit" : "ruffShortSuit"
        }
      );
    }

  function legalPlanCard(card, legal) {
        if (!card) return null;
        return legal.find((item) => item.id === card.id) || null;
      }

  function choosePlanDevelopmentPlay({ priority, hand, partnerHand, seat, legal }) {
      const suitCards = cardsInSuit(hand, priority.suit);
      if (!suitCards.length) return null;

      const sourceIsCurrentHand = priority.sourceSeat === seat;
      const giveUpEarly = priority.timing === "giveUpEarly";
      const card = giveUpEarly
        ? legalPlanCard(lowestCard(suitCards), legal)
        : sourceIsCurrentHand
          ? legalPlanCard(suitCards.find((item) => priority.sequence?.startsWith(item.rank)) || highestCard(suitCards), legal)
          : legalPlanCard(lowestCard(suitCards), legal);
      if (!card) return null;

      return cardPlayResult(
        card,
        "playPlan.developLongSuit",
        priority.confidence || "uncertain",
        "Follow the visible play plan by developing the long notrump suit.",
        {
          planPriority: priority,
          suit: priority.suit,
          suitLength: priority.suitLength,
          sourceSeat: priority.sourceSeat,
          sourceLength: priority.sourceLength,
          sequence: priority.sequence,
          missingStopper: priority.missingStopper,
          action: giveUpEarly ? "giveUpWorkSuitEarly" : sourceIsCurrentHand ? "forceMissingHighCard" : "leadTowardLongSuit",
          targetSeat: sourceIsCurrentHand ? seat : partnerOf(seat),
          targetLength: sourceIsCurrentHand ? suitCards.length : cardsInSuit(partnerHand, priority.suit).length,
          timing: priority.timing || null,
          sameSuitEntryCount: priority.sameSuitEntryCount || 0
        }
      );
    }

  function choosePlanDevelopmentInTrickPlay({ priority, hand, partnerHand, currentTrick, seat, legal }) {
      if (!currentTrick.length || currentTrick[0].card.suit !== priority.suit) return null;
      if (priority.sourceSeat !== seat) return null;

      const suitCards = cardsInSuit(hand, priority.suit);
      const preferred = priority.sequence
        ? suitCards.find((item) => priority.sequence.startsWith(item.rank))
        : null;
      const card = legalPlanCard(preferred || highestCard(suitCards), legal);
      if (!card) return null;

      return cardPlayResult(
        card,
        "playPlan.developLongSuit",
        priority.confidence || "uncertain",
        "Follow the visible play plan by playing from the long notrump suit after it is led.",
        {
          planPriority: priority,
          suit: priority.suit,
          suitLength: priority.suitLength,
          sourceSeat: priority.sourceSeat,
          sourceLength: priority.sourceLength,
          sequence: priority.sequence,
          missingStopper: priority.missingStopper,
          action: "continueWorkSuit",
          targetSeat: seat,
          targetLength: suitCards.length,
          timing: priority.timing || null,
          sameSuitEntryCount: priority.sameSuitEntryCount || 0
        }
      );
    }

  function choosePlanFinessePlay({ priority, hand, partnerHand, trickHistory, seat, legal }) {
      const partnerSeat = partnerOf(seat);
      if (priority.leadSeat && priority.leadSeat !== seat) return null;
      if (priority.targetSeat && priority.targetSeat !== partnerSeat) return null;

      const currentSuitCards = cardsInSuit(hand, priority.suit);
      const partnerSuitCards = cardsInSuit(partnerHand, priority.suit);
      const candidate = finesseCandidate({
        suit: priority.suit,
        partnerHand,
        currentSuitCards,
        partnerSuitCards,
        playedSuitCards: cardsInSuit(playedCardsFrom(trickHistory, []), priority.suit),
        partnerSeat
      });
      if (!candidate) return null;

      const expectedKind = candidate.ruleId === "doubleFinesseTowardHonor" ? "doubleFinesse" : "finesse";
      if (priority.kind !== "safeHandFinesse" && expectedKind !== priority.kind) return null;
      const preferredLead = priority.leadRank
        ? cardsInSuit(hand, priority.suit).find((item) => item.rank === priority.leadRank)
        : null;
      const card = legalPlanCard(preferredLead || candidate.card, legal);
      if (!card) return null;

      return cardPlayResult(
        card,
        priority.kind === "safeHandFinesse" ? "playPlan.safeHandFinesse" : `playPlan.${candidate.ruleId}`,
        priority.confidence || "uncertain",
        priority.reason || candidate.reason,
        {
          planPriority: priority,
          suit: candidate.suit,
          targetSeat: candidate.targetSeat,
          targetLength: candidate.targetLength,
          finesseRank: candidate.finesseRank,
          missingHonor: candidate.missingHonor,
          missingHonors: candidate.missingHonors,
          guardRanks: candidate.guardRanks,
          entryType: candidate.entryType,
          entrySuit: candidate.entrySuit,
          entryRank: candidate.entryRank,
          safeSeat: priority.safeSeat || null,
          dangerousSeat: priority.dangerousSeat || null,
          attackedSuit: priority.attackedSuit || null,
          action: candidate.action
        }
      );
    }

  function choosePlanFinesseInTrickPlay({ priority, currentTrick, seat, trump, legal, winning }) {
      if (!currentTrick.length || currentTrick[0].card.suit !== priority.suit) return null;
      if (priority.targetSeat !== seat) return null;

      const suitedLegal = cardsInSuit(legal, priority.suit);
      const finesseCard = legalPlanCard(suitedLegal.find((item) => item.rank === priority.finesseRank), legal);
      if (!finesseCard) return null;
      if (winning && teamOf(winning.seat) !== teamOf(seat) && !beats(finesseCard, winning.card, priority.suit, trump)) return null;

      const ruleId = priority.kind === "doubleFinesse"
        ? "playPlan.doubleFinesseTowardHonor"
        : priority.kind === "safeHandFinesse"
          ? "playPlan.safeHandFinesse"
          : "playPlan.finesseTowardHonor";
      return cardPlayResult(
        finesseCard,
        ruleId,
        priority.confidence || "uncertain",
        "Follow the visible play plan by completing the finesse in the target hand.",
        {
          planPriority: priority,
          suit: priority.suit,
          targetSeat: priority.targetSeat,
          targetLength: suitedLegal.length,
          finesseRank: priority.finesseRank,
          missingHonor: priority.missingHonor,
          missingHonors: priority.missingHonors,
          guardRanks: priority.guardRanks,
          entryType: priority.entryType,
          entrySuit: priority.entrySuit,
          entryRank: priority.entryRank,
          safeSeat: priority.safeSeat || null,
          dangerousSeat: priority.dangerousSeat || null,
          attackedSuit: priority.attackedSuit || null,
          action: "completeFinesse"
        }
      );
    }

  function choosePlanDirectionalFinessePlay({ priority, hand, partnerHand, seat, legal }) {
      if (seat !== priority.leadSeat || priority.targetSeat !== partnerOf(seat)) return null;
      const leadSuitCards = cardsInSuit(hand, priority.suit);
      const card = legalPlanCard(lowestSmallCardBelow(leadSuitCards, priority.finesseRank), legal);
      if (!card) return null;

      const ruleId = priority.kind === "repeatFinesse" ? "playPlan.repeatFinesse" : "playPlan.twoWayFinesse";
      const reason = priority.kind === "repeatFinesse"
        ? "Follow the visible play plan by repeating a finesse that already worked once."
        : "Follow the visible play plan by taking the chosen direction of a two-way finesse.";
      return cardPlayResult(
        card,
        ruleId,
        priority.confidence || "uncertain",
        reason,
        {
          planPriority: priority,
          suit: priority.suit,
          leadSeat: priority.leadSeat,
          targetSeat: priority.targetSeat,
          targetLength: cardsInSuit(partnerHand, priority.suit).length,
          finesseRank: priority.finesseRank,
          missingHonor: priority.missingHonor,
          previousFinesseRank: priority.previousFinesseRank || null,
          entryType: priority.entryType || null,
          entrySuit: priority.entrySuit || null,
          entryRank: priority.entryRank || null,
          action: priority.kind
        }
      );
    }

  function choosePlanDirectionalFinesseInTrickPlay({ priority, currentTrick, seat, trump, legal, winning }) {
      if (!currentTrick.length || currentTrick[0].card.suit !== priority.suit) return null;
      if (priority.targetSeat !== seat) return null;

      const suitedLegal = cardsInSuit(legal, priority.suit);
      const finesseCard = legalPlanCard(suitedLegal.find((item) => item.rank === priority.finesseRank), legal);
      if (!finesseCard) return null;
      if (winning && teamOf(winning.seat) !== teamOf(seat) && !beats(finesseCard, winning.card, priority.suit, trump)) return null;

      const ruleId = priority.kind === "repeatFinesse" ? "playPlan.repeatFinesse" : "playPlan.twoWayFinesse";
      const reason = priority.kind === "repeatFinesse"
        ? "Follow the visible play plan by completing the repeated finesse in the target hand."
        : "Follow the visible play plan by completing the chosen two-way finesse.";
      return cardPlayResult(
        finesseCard,
        ruleId,
        priority.confidence || "uncertain",
        reason,
        {
          planPriority: priority,
          suit: priority.suit,
          leadSeat: priority.leadSeat,
          targetSeat: priority.targetSeat,
          targetLength: suitedLegal.length,
          finesseRank: priority.finesseRank,
          missingHonor: priority.missingHonor,
          previousFinesseRank: priority.previousFinesseRank || null,
          entryType: priority.entryType || null,
          entrySuit: priority.entrySuit || null,
          entryRank: priority.entryRank || null,
          action: "completeDirectionalFinesse"
        }
      );
    }

  function choosePlanRuffPlay({ priority, hand, partnerHand, trickHistory, seat, trump, legal }) {
      if (!trump) return null;
      if (priority.shortSeat === seat) {
        return choosePlanRuffEntryPlay({ priority, hand, partnerHand, trickHistory, seat, trump, legal });
      }
      if (priority.timing === "prepareBeforeRuff" && priority.longSeat === seat) {
        return choosePlanPrepareShortRuffPlay({ priority, hand, partnerHand, trickHistory, seat, legal });
      }
      if (cardsInSuit(partnerHand, priority.suit).length !== 0) return null;
      if (!cardsInSuit(partnerHand, trump).length) return null;
      const card = legalPlanCard(lowestCard(cardsInSuit(hand, priority.suit)), legal);
      if (!card) return null;

      return cardPlayResult(
        card,
        "playPlan.ruffShortSuit",
        priority.confidence || "basic",
        "Follow the visible play plan by leading a side suit that dummy can ruff.",
        {
          planPriority: priority,
          suit: priority.suit,
          shortSeat: priority.shortSeat,
          trump,
          action: "leadToShortHandRuff"
        }
      );
    }

  function choosePlanPrepareShortRuffPlay({ priority, hand, partnerHand, trickHistory, seat, legal }) {
      const suitCards = cardsInSuit(hand, priority.suit);
      const partnerSuitCards = cardsInSuit(partnerHand, priority.suit);
      if (!suitCards.length || !partnerSuitCards.length) return null;

      const playedSuitCards = cardsInSuit(playedCardsFrom(trickHistory, []), priority.suit);
      const winnerRanks = visibleTopWinnerRanks([...suitCards, ...partnerSuitCards], playedSuitCards);
      const winnerCard = winnerRanks
        .map((rank) => suitCards.find((card) => card.rank === rank))
        .find(Boolean);
      const card = legalPlanCard(winnerCard || lowestCard(suitCards), legal);
      if (!card) return null;

      return cardPlayResult(
        card,
        "playPlan.prepareShortSuitRuff",
        priority.confidence || "basic",
        "Follow the visible play plan by playing the side suit first, so the short trump hand can ruff a later round.",
        {
          planPriority: priority,
          suit: priority.suit,
          longSeat: seat,
          shortSeat: priority.shortSeat,
          preparationNeeded: priority.preparationNeeded || partnerSuitCards.length,
          shortLength: partnerSuitCards.length,
          extraTrickValue: true,
          action: winnerCard ? "cashWinnerBeforeShortRuff" : "loseSideSuitBeforeShortRuff"
        }
      );
    }

  function choosePlanRuffEntryPlay({ priority, hand, partnerHand, trickHistory, seat, trump, legal }) {
      if (cardsInSuit(hand, priority.suit).length) return null;
      if (!cardsInSuit(partnerHand, priority.suit).length) return null;

      const candidate = ruffEntryCandidates({
        hand,
        partnerHand,
        playedCards: playedCardsFrom(trickHistory, []),
        trump,
        ruffSuit: priority.suit,
        legal
      })
        .sort((a, b) => b.score - a.score)[0];
      if (!candidate) return null;

      return cardPlayResult(
        candidate.card,
        "playPlan.enterLongTrumpHand",
        priority.confidence || "basic",
        "Follow the visible play plan by leading an entry to the hand that can lead the ruffing suit.",
        {
          planPriority: priority,
          suit: priority.suit,
          shortSeat: priority.shortSeat,
          trump,
          entrySuit: candidate.suit,
          entryRank: candidate.entryRank,
          targetSeat: partnerOf(seat),
          action: "leadEntryToLongTrumpHand"
        }
      );
    }

  function ruffEntryCandidates({ hand, partnerHand, playedCards, trump, ruffSuit, legal }) {
      return suits
        .filter((suit) => suit !== trump && suit !== ruffSuit)
        .map((suit) => ruffEntryCandidate({ suit, hand, partnerHand, playedCards, legal }))
        .filter(Boolean);
    }

  function ruffEntryCandidate({ suit, hand, partnerHand, playedCards, legal }) {
      const leadCards = cardsInSuit(legal, suit);
      const partnerSuitCards = cardsInSuit(partnerHand, suit);
      if (!leadCards.length || !partnerSuitCards.length) return null;

      const winnerRanks = visibleTopWinnerRanks([...cardsInSuit(hand, suit), ...partnerSuitCards], cardsInSuit(playedCards, suit));
      const partnerWinnerRanks = winnerRanks.filter((rank) => hasRank(partnerSuitCards, rank));
      if (!partnerWinnerRanks.length) return null;

      const entryRank = partnerWinnerRanks[0];
      const lowerLeadCards = leadCards.filter((card) => rankOrder.indexOf(card.rank) < rankOrder.indexOf(entryRank));
      const card = lowestCard(lowerLeadCards);
      if (!card) return null;

      return {
        card,
        suit,
        entryRank,
        score: partnerWinnerRanks.length * 20 + winnerRanks.length * 8 + leadCards.length + partnerSuitCards.length
      };
    }

  function choosePlanDrawTrumpsPlay({ priority, contract, legal, seat }) {
      const trump = contract?.strain === "NT" ? null : contract?.strain;
      if (!trump || priority.suit !== trump) return null;
      if (priority.roundLimit && (priority.playedTrumpRounds || 0) >= priority.roundLimit) return null;

      const trumpCards = cardsInSuit(legal, trump);
      if (priority.preserveSeat === seat && trumpCards.length <= (priority.preserveTrumpCount || 0)) return null;
      const card = legalPlanCard(highestCard(trumpCards), legal);
      if (!card) return null;

      return cardPlayResult(
        card,
        "playPlan.drawTrumps",
        priority.confidence || "basic",
        "Follow the visible play plan by drawing trumps.",
        {
          planPriority: priority,
          suit: trump,
          trumpLength: priority.trumpLength,
          missingHonors: priority.missingHonors,
          timing: priority.timing,
          delayReason: priority.delayReason || null,
          delaySuit: priority.delaySuit || null,
          roundLimit: priority.roundLimit ?? null,
          playedTrumpRounds: priority.playedTrumpRounds || 0,
          preserveSeat: priority.preserveSeat || null,
          preserveTrumpCount: priority.preserveTrumpCount || 0,
          trumpControl: priority.trumpControl || null,
          action: "drawTrumps"
        }
      );
    }

  function choosePlanDiscardLoserOnWinnerPlay({ priority, hand, partnerHand, seat, legal }) {
      const suitedLegal = priority.suit ? cardsInSuit(legal, priority.suit) : legal;
      let card = null;
      let action = "cashWinnerForDiscard";

      if (priority.firstSeat === seat) {
        card = priority.cashRanks?.length
          ? priority.cashRanks.map((rank) => suitedLegal.find((item) => item.rank === rank)).find(Boolean)
          : highestCard(suitedLegal);
      } else if (priority.firstSeat === partnerOf(seat) && cardsInSuit(partnerHand, priority.suit).length) {
        card = lowestCard(suitedLegal);
        action = "leadTowardWinnerForDiscard";
      }
      if (!card) return null;

      return cardPlayResult(
        card,
        "playPlan.discardLoserOnWinner",
        priority.confidence || "basic",
        "Follow the visible play plan by using a side-suit winner before drawing trumps, so a loser can be discarded.",
        {
          planPriority: priority,
          suit: priority.suit || card.suit,
          cashRanks: priority.cashRanks,
          attackedSuit: priority.attackedSuit,
          discardSeat: priority.discardSeat,
          discardCapacity: priority.discardCapacity,
          firstSeat: priority.firstSeat,
          timing: priority.timing,
          action
        }
      );
    }

  function choosePlanDiscardLoserOnWinnerInTrickPlay({ priority, hand, currentTrick, seat, trump, legal, winning }) {
      if (!currentTrick.length || priority.discardSeat !== seat) return null;
      const leadSuit = currentTrick[0].card.suit;
      if (priority.suit && leadSuit !== priority.suit) return null;
      if (cardsInSuit(hand, leadSuit).length) return null;
      if (!winning || teamOf(winning.seat) !== teamOf(seat)) return null;

      const loserCards = priority.attackedSuit ? cardsInSuit(legal, priority.attackedSuit) : [];
      const card = lowestCard(loserCards) || lowestCard(legal);
      if (!card) return null;

      return cardPlayResult(
        card,
        "playPlan.discardLoserOnWinner",
        priority.confidence || "basic",
        "Follow the visible play plan by discarding a loser while partner's side-suit winner is cashing.",
        {
          planPriority: priority,
          suit: priority.suit || leadSuit,
          cashRanks: priority.cashRanks,
          attackedSuit: priority.attackedSuit,
          discardSeat: priority.discardSeat,
          discardCapacity: priority.discardCapacity,
          firstSeat: priority.firstSeat,
          timing: priority.timing,
          action: "discardLoserOnWinner"
        }
      );
    }

  function choosePlanDrawTrumpsInTrickPlay({ priority, contract, currentTrick, seat, legal, winning }) {
      const trump = contract?.strain === "NT" ? null : contract?.strain;
      if (!trump || priority.suit !== trump || !currentTrick.length || currentTrick[0].card.suit !== trump) return null;
      if (priority.roundLimit && (priority.playedTrumpRounds || 0) >= priority.roundLimit) return null;

      const trumpCards = cardsInSuit(legal, trump);
      if (!trumpCards.length) return null;
      if (priority.preserveSeat === seat && trumpCards.length <= (priority.preserveTrumpCount || 0)) return null;
      if (winning && teamOf(winning.seat) === teamOf(seat)) return null;

      const winningTrumps = winning
        ? trumpCards.filter((card) => beats(card, winning.card, trump, trump)).sort(compareLowCards)
        : [];
      const card = winningTrumps[0] || lowestCard(trumpCards);
      if (!card) return null;

      return cardPlayResult(
        card,
        "playPlan.drawTrumps",
        priority.confidence || "basic",
        "Follow the visible play plan by continuing the trump-drawing round.",
        {
          planPriority: priority,
          suit: trump,
          trumpLength: priority.trumpLength,
          missingHonors: priority.missingHonors,
          timing: priority.timing,
          delayReason: priority.delayReason || null,
          delaySuit: priority.delaySuit || null,
          roundLimit: priority.roundLimit ?? null,
          playedTrumpRounds: priority.playedTrumpRounds || 0,
          preserveSeat: priority.preserveSeat || null,
          preserveTrumpCount: priority.preserveTrumpCount || 0,
          trumpControl: priority.trumpControl || null,
          action: "continueDrawTrumps"
        }
      );
    }

  function choosePlanCashWinnerPlay({ priority, hand, seat, legal }) {
      if (priority.firstSeat && priority.firstSeat !== seat) return null;
      if (priority.kind === "cashSureWinners" && (!priority.suit || !priority.cashRanks?.length)) return null;
      const suitedLegal = priority.suit ? cardsInSuit(legal, priority.suit) : legal;
      const card = priority.cashRanks?.length
        ? priority.cashRanks.map((rank) => suitedLegal.find((item) => item.rank === rank)).find(Boolean)
        : highestCard(suitedLegal);
      if (!card) return null;

      return cardPlayResult(
        card,
        priority.kind === "cashWinners" ? "playPlan.cashWinners" : "playPlan.cashSureWinners",
        priority.confidence || "basic",
        "Follow the visible play plan by cashing a sure winner.",
        {
          planPriority: priority,
          suit: priority.suit || card.suit,
          cashRanks: priority.cashRanks,
          timing: priority.timing,
          action: priority.timing === "unblockBeforeEntry" ? "unblockSuit" : "cashSureWinner"
        }
      );
    }

  function choosePlanCashWinnerInTrickPlay({ priority, currentTrick, seat, trump, legal, winning }) {
      if (!currentTrick.length || (priority.firstSeat && priority.firstSeat !== seat)) return null;
      if (priority.kind === "cashSureWinners" && (!priority.suit || !priority.cashRanks?.length)) return null;
      const leadSuit = currentTrick[0].card.suit;
      if (priority.suit && priority.suit !== leadSuit) return null;

      const suitedLegal = cardsInSuit(legal, leadSuit);
      const preferred = priority.cashRanks?.length
        ? priority.cashRanks.map((rank) => suitedLegal.find((item) => item.rank === rank)).find(Boolean)
        : highestCard(suitedLegal);
      const card = legalPlanCard(preferred, legal);
      if (!card) return null;
      if (winning && teamOf(winning.seat) === teamOf(seat)) return null;
      if (winning && teamOf(winning.seat) !== teamOf(seat) && !beats(card, winning.card, leadSuit, trump)) return null;

      return cardPlayResult(
        card,
        priority.kind === "cashWinners" ? "playPlan.cashWinners" : "playPlan.cashSureWinners",
        priority.confidence || "basic",
        "Follow the visible play plan by taking the planned winner in the current trick.",
        {
          planPriority: priority,
          suit: priority.suit || card.suit,
          cashRanks: priority.cashRanks,
          timing: priority.timing,
          action: priority.timing === "unblockBeforeEntry" ? "unblockSuit" : "cashSureWinner"
        }
      );
    }

  function cardPlayResult(card, ruleName, confidence, reason, extra = {}) {
      return {
        card,
        ruleId: ruleName,
        confidence,
        reason,
        ...extra
      };
    }

  const {
    cardFromRank,
    isPictureRank,
    consecutiveRanksFrom,
    touchingLeadSequence,
    touchingHonorSequence,
    aceKingLeadPattern,
    brokenLeadSequence,
    internalLeadSequence,
    notrumpLeadPattern,
    highCardRanks,
    hasUnsupportedAce,
    leadAgreement,
    openingLeadAgreementForSuit,
    ruleIdSuffix,
    artificialSuitBidForLead,
    shownSuitForLead,
    bidSuitsForLead,
    shownSuitCallsForLead,
    uniqueSuits,
    longestAvailableSuitForLead,
    notrumpSuitLeadScore,
    bestNotrumpLeadSuitByQuality,
    weakUnbidNotrumpLeadOptions,
    dummySecondSuitsForLead,
    notrumpLeadSuitForAuction,
    chooseNotrumpLeadCardPlay,
    sideSuitGroups,
    suitGroupOrder,
    fourthBestCard,
    unsupportedAceUnderleadRisk,
    safeSuitContractLengthLeadGroups,
    unsafeSuitContractLengthLeadGroups,
    chooseSuitContractLeadCardPlay,
    canUseDefensiveLeadAgreement,
    isDefensivePlaySeat,
    chooseLeadCardPlay,
    openingLeadPlay
  } = cardPlayLeads;

  function chooseReturnPartnerLeadSuit({ legal, trickHistory, seat, declarer }) {
      if (!isDefensivePlaySeat(seat, declarer) || !trickHistory.length) return null;

      const openingLead = openingLeadPlay(trickHistory);
      if (!openingLead || openingLead.seat !== partnerOf(seat)) return null;

      const leadSuit = openingLead.card.suit;
      const suitedLegal = cardsInSuit(legal, leadSuit);
      if (!suitedLegal.length) return null;

      const returnChoice = choosePartnerLeadSuitReturnCard(suitedLegal);
      return cardPlayResult(
        returnChoice.card,
        "returnPartnerLeadSuit",
        "basic",
        "Return partner's opening lead suit when it is still available and no stronger plan applies.",
        {
          suit: leadSuit,
          leadCard: openingLead.card,
          leadRank: openingLead.card.rank,
          partnerSeat: openingLead.seat,
          returnType: returnChoice.type,
          sequence: returnChoice.sequence,
          action: "returnPartnerLeadSuit"
        }
      );
    }

  function choosePartnerLeadSuitReturnCard(suitedLegal) {
      const lowCards = suitedLegal.filter(isLowLeadCard);
      if (lowCards.length) return { card: lowestCard(lowCards), type: "lowCard" };

      const sequence = touchingHonorSequence(suitedLegal, 2);
      if (sequence?.card) {
        return { card: sequence.card, type: "honorSequence", sequence: sequence.ranks.join("") };
      }

      return { card: lowestCard(suitedLegal), type: "onlyHonors" };
    }

  function dummyRuffThreat(dummyHand, trump) {
      if (!trump || !dummyHand?.length) return null;
      const dummyTrumps = cardsInSuit(dummyHand, trump);
      if (dummyTrumps.length < 2) return null;

      return suits
        .filter((suit) => suit !== trump)
        .map((suit) => ({ suit, length: cardsInSuit(dummyHand, suit).length }))
        .filter((threat) => threat.length <= 1)
        .sort((a, b) => a.length - b.length || suits.indexOf(a.suit) - suits.indexOf(b.suit))[0] || null;
    }

  function chooseTrumpSwitchAgainstDummyRuff({ legal, dummyHand, trump, seat, declarer }) {
      if (!isDefensivePlaySeat(seat, declarer) || !trump || !dummyHand?.length) return null;
      const trumpCards = cardsInSuit(legal, trump);
      if (!trumpCards.length) return null;

      const threat = dummyRuffThreat(dummyHand, trump);
      if (!threat) return null;

      return cardPlayResult(
        lowestCard(trumpCards),
        "trumpSwitchAgainstDummyRuff",
        "basic",
        "Switch to trump when dummy visibly has ruffing value in a short side suit and no stronger defensive return applies.",
        {
          action: "drawDummyTrumps",
          trump,
          dummyShortSuit: threat.suit,
          dummyShortLength: threat.length,
          dummyTrumpLength: cardsInSuit(dummyHand, trump).length
        }
      );
    }

  function createCardPlayContext({ hand, currentTrick, trickHistory, seat, declarer, trump }) {
      const legal = legalCards(hand, currentTrick);
      const leadSuit = currentTrick[0]?.card?.suit || null;
      const winning = currentTrick.length ? currentWinningPlay(currentTrick, trump) : null;
      return {
        legal,
        playedCards: playedCardsFrom(trickHistory, currentTrick),
        leadSuit,
        winning,
        partnerWinning: Boolean(winning && seat && teamOf(winning.seat) === teamOf(seat)),
        isOpeningLead: currentTrick.length === 0 && trickHistory.length === 0,
        isDefender: isDefensivePlaySeat(seat, declarer),
        isDeclarerSide: Boolean(seat && declarer && teamOf(seat) === teamOf(declarer))
      };
    }

  function isLowPromisesHonorLead(play) {
        if (!play?.card) return false;
        if (play.ruleId) return play.ruleId === "notrumpLowPromisesHonor";
        return isLowLeadCard(play.card);
      }

  function isOpeningHonorSequenceLead(play) {
      if (!play?.card || !isLeadHonorRank(play.card.rank)) return false;
      return [
        "notrumpAceKingLead",
        "notrumpSequenceLead",
        "notrumpBrokenSequenceLead",
        "notrumpInternalSequenceLead",
        "suitContractSequenceLead",
        "suitContractInternalSequenceLead"
      ].includes(play.ruleId);
    }

  function attitudeSignalSupport({ hand, suitedHand, leadSuit, trump }) {
      if (suitedHand.length === 3 && suitedHand.some((card) => card.rank === "Q")) return "honor";
      if (trump && leadSuit !== trump && suitedHand.length === 2 && cardsInSuit(hand, trump).length) return "ruffValue";
      return null;
    }

  function chooseOpeningLeadAttitudeSignal({ hand, legal, currentTrick, trickHistory, seat, declarer, trump }) {
      if (trickHistory.length || currentTrick.length !== 2) return null;
      if (!isDefensivePlaySeat(seat, declarer)) return null;

      const leadPlay = currentTrick[0];
      if (leadPlay.seat !== partnerOf(seat) || !isOpeningHonorSequenceLead(leadPlay)) return null;

      const leadSuit = leadPlay.card.suit;
      const suitedLegal = cardsInSuit(legal, leadSuit);
      if (suitedLegal.length <= 1) return null;

      const suitedHand = cardsInSuit(hand, leadSuit);
      const highSignalCard = highestCard(suitedLegal.filter(isLowLeadCard)) || highestCard(suitedLegal);
      const supportReason = attitudeSignalSupport({ hand, suitedHand, leadSuit, trump });
      const signal = supportReason ? "encourage" : "discourage";
      const card = signal === "encourage" ? highSignalCard : lowestCard(suitedLegal);

      return cardPlayResult(
        card,
        "openingLeadAttitudeSignal",
        "basic",
        "Signal attitude after partner's opening honor lead from a sequence or broken sequence.",
        {
          signal,
          leadSuit,
          leadCard: leadPlay.card,
          partnerSeat: leadPlay.seat,
          supportReason,
          action: signal === "encourage" ? "encouragePartnerLeadSuit" : "discouragePartnerLeadSuit"
        }
      );
    }

  function chooseThirdHandHighOverLowLead({ legal, currentTrick, seat, declarer, contract, trump, winning, playedCards = [] }) {
      if (contract?.strain !== "NT" || trump || !seat || currentTrick.length !== 2) return null;
      if (!isDefensivePlaySeat(seat, declarer)) return null;
      const leadPlay = currentTrick[0];
      if (leadPlay.seat !== partnerOf(seat) || !isLowPromisesHonorLead(leadPlay)) return null;

      const leadSuit = leadPlay.card.suit;
      const suitedLegal = cardsInSuit(legal, leadSuit);
      if (!suitedLegal.length) return null;

      const canBeat = suitedLegal
        .filter((card) => beats(card, winning.card, leadSuit, trump))
        .sort(compareLowCards);
      const canBeatHonors = canBeat.filter((card) => isLeadHonorRank(card.rank));
      const card = canBeatHonors[0] || canBeat[0] || highestCard(suitedLegal);
      const higherPlayed = playedHigherCardsInSuit({ playedCards, suit: leadSuit, rank: card.rank });

      return cardPlayResult(
        card,
        "thirdHandHighOverLowLead",
        "basic",
        "Partner led low to promise a high card in notrump, so third hand plays the cheapest useful high card.",
        {
          leadSuit,
          leadCard: leadPlay.card,
          winningSeat: winning?.seat || null,
          higherPlayed,
          usedPlayedCardInfo: higherPlayed.length > 0,
          action: "thirdHandHigh"
        }
      );
    }

  function chooseThirdHandUnblockHonor({ legal, currentTrick, trickHistory, seat, declarer, contract, trump, winning }) {
      if (contract?.strain !== "NT" || trump || trickHistory.length || currentTrick.length !== 2) return null;
      if (!isDefensivePlaySeat(seat, declarer)) return null;

      const leadPlay = currentTrick[0];
      if (leadPlay.seat !== partnerOf(seat) || !isOpeningHonorSequenceLead(leadPlay)) return null;
      if (winning?.seat !== leadPlay.seat) return null;

      const leadSuit = leadPlay.card.suit;
      const suitedLegal = cardsInSuit(legal, leadSuit);
      if (suitedLegal.length !== 2) return null;

      const lowCards = suitedLegal.filter((card) => !isLeadHonorRank(card.rank));
      if (lowCards.length !== 1) return null;

      const unblockCards = suitedLegal
        .filter((card) => isLeadHonorRank(card.rank) && beats(card, leadPlay.card, leadSuit, trump))
        .sort(compareLowCards);
      if (unblockCards.length !== 1) return null;

      const card = unblockCards[0];
      return cardPlayResult(
        card,
        "thirdHandUnblockHonor",
        "basic",
        "Third hand unblocks a higher honor from a doubleton after partner's notrump honor lead, so partner's long suit does not get blocked.",
        {
          leadSuit,
          leadCard: leadPlay.card,
          unblockRank: card.rank,
          partnerSeat: leadPlay.seat,
          action: "unblockDefense"
        }
      );
    }

  function playedHigherCardsInSuit({ playedCards = [], suit, rank }) {
      return cardsInSuit(playedCards, suit)
        .filter((card) => rankOrder.indexOf(card.rank) > rankOrder.indexOf(rank))
        .map((card) => card.rank);
    }

  function cheapestHigherHonor(cards, rank) {
        return cards
          .filter((card) => isLeadHonorRank(card.rank) && rankOrder.indexOf(card.rank) > rankOrder.indexOf(rank))
          .sort(compareLowCards)[0] || null;
      }

  function honorCoverTarget({ dummyHand, leadSuit, leadRank, playedCards = [] }) {
        const lowerHonor = rankBelow(leadRank);
        if (!lowerHonor) return null;
        const lowerHonorAlreadyPlayed = cardsInSuit(playedCards, leadSuit).some((card) => card.rank === lowerHonor);
        if (lowerHonorAlreadyPlayed) return null;

        if (dummyHand?.length && cardsInSuit(dummyHand, leadSuit).some((card) => card.rank === lowerHonor)) {
          return {
            type: "dummyThreat",
            promotedRank: lowerHonor,
            promotionSeat: null,
            reason: "dummy shows the touching lower honor, so covering can limit it"
          };
        }

        return null;
      }

  function rankBelow(rank) {
        const index = rankOrder.indexOf(rank);
        return index > 0 ? rankOrder[index - 1] : null;
      }

  function chooseSecondHandDefensivePlay({ legal, currentTrick, seat, declarer, dummyHand, trump, playedCards = [] }) {
      if (currentTrick.length !== 1 || !isDefensivePlaySeat(seat, declarer)) return null;

      const leadCard = currentTrick[0].card;
      const leadSuit = leadCard.suit;
      const suitedLegal = cardsInSuit(legal, leadSuit);
      if (!suitedLegal.length) return null;

      if (isLeadHonorRank(leadCard.rank)) {
        const coverCard = cheapestHigherHonor(suitedLegal, leadCard.rank);
        const coverTarget = honorCoverTarget({
          dummyHand,
          leadSuit,
          leadRank: leadCard.rank,
          playedCards
        });
        if (coverCard) {
          return cardPlayResult(
            coverCard,
            "secondHandCoverHonor",
            "basic",
            "Second hand covers a led honor with the cheapest higher honor; the ten counts as an honor.",
            {
              leadSuit,
              coveredRank: leadCard.rank,
              promotedRank: coverTarget?.promotedRank || rankBelow(leadCard.rank),
              promotionSeat: coverTarget?.promotionSeat || null,
              coverReason: coverTarget?.type || "honorOnHonor",
              action: "coverHonor"
            }
          );
        }
      }

      const sequence = touchingHonorSequence(suitedLegal, 2);
      if (sequence?.card && beats(sequence.card, leadCard, leadSuit, trump)) {
        return cardPlayResult(
          sequence.card,
          "secondHandSequenceHigh",
          "basic",
          "Second hand plays the top of a touching honor sequence when it can take over the led card.",
          {
            leadSuit,
            sequence: sequence.ranks.join(""),
            action: "secondHandSequence"
          }
        );
      }

      return cardPlayResult(
        lowestCard(suitedLegal),
        "secondHandLow",
        "basic",
        "Second hand plays low when following suit.",
        {
          leadSuit,
          action: "secondHandLow"
        }
      );
    }

  function chooseThirdHandDefensivePlay({ legal, currentTrick, seat, declarer, trump, winning, playedCards = [] }) {
      if (currentTrick.length !== 2 || !isDefensivePlaySeat(seat, declarer)) return null;
      const leadPlay = currentTrick[0];
      if (leadPlay.seat !== partnerOf(seat)) return null;

      const leadSuit = leadPlay.card.suit;
      const suitedLegal = cardsInSuit(legal, leadSuit);
      if (!suitedLegal.length) return null;

      const canBeat = suitedLegal
        .filter((card) => beats(card, winning.card, leadSuit, trump))
        .sort(compareLowCards);
      if (!canBeat.length) return null;

      const card = canBeat[0];
      const higherPlayed = playedHigherCardsInSuit({ playedCards, suit: leadSuit, rank: card.rank });
      return cardPlayResult(
        card,
        "thirdHandHighCheapest",
        "basic",
        "Third hand plays the cheapest card that can win the trick, preserving higher cards when visible play says they are not needed.",
        {
          leadSuit,
          winningSeat: winning.seat,
          higherPlayed,
          usedPlayedCardInfo: higherPlayed.length > 0,
          action: "thirdHandHigh"
        }
      );
    }

  function chooseCardPlay({
      hand = [],
      partnerHand = null,
      dummyHand = null,
      currentTrick = [],
      trickHistory = [],
      seat,
      declarer = null,
      dummy = null,
      contract = null,
      trump = null,
      playPlan = null,
      auction = []
    } = {}) {
      const context = createCardPlayContext({ hand, currentTrick, trickHistory, seat, declarer, trump });
      const { legal } = context;
      if (!legal.length) return null;

      const planDecision = choosePlayPlanAction({
        hand,
        partnerHand,
        currentTrick,
        trickHistory,
        seat,
        declarer,
        dummy,
        contract,
        trump,
        playPlan,
        legal,
        winning: context.winning
      });
      if (planDecision.result) return planDecision.result;

      if (!currentTrick.length) {
        const finesse = chooseDeclarerFinessePlay({
          hand,
          partnerHand,
          currentTrick,
          trickHistory,
          seat,
          declarer,
          dummy,
          contract
        });
        if (finesse) return withPlayPlanFallback(finesse, planDecision);
        const development = chooseDeclarerDevelopmentPlay({
          hand,
          partnerHand,
          currentTrick,
          trickHistory,
          seat,
          declarer,
          dummy,
          contract
        });
        if (development) return withPlayPlanFallback(development, planDecision);

        const returnPartnerLeadSuit = chooseReturnPartnerLeadSuit({
          legal,
          trickHistory,
          seat,
          declarer
        });
        if (returnPartnerLeadSuit) return withPlayPlanFallback(returnPartnerLeadSuit, planDecision);

        if (!context.isOpeningLead) {
          const trumpSwitchAgainstDummyRuff = chooseTrumpSwitchAgainstDummyRuff({
            legal,
            dummyHand,
            trump,
            seat,
            declarer
          });
          if (trumpSwitchAgainstDummyRuff) return withPlayPlanFallback(trumpSwitchAgainstDummyRuff, planDecision);
        }

        return withPlayPlanFallback(
          chooseLeadCardPlay(hand, legal, { contract, seat, declarer, isOpeningLead: context.isOpeningLead, auction }),
          planDecision
        );
      }

      const { leadSuit, winning, partnerWinning, playedCards } = context;

      const thirdHandHigh = chooseThirdHandHighOverLowLead({
        legal,
        currentTrick,
        seat,
        declarer,
        contract,
        trump,
        winning,
        playedCards
      });
      if (thirdHandHigh) return withPlayPlanFallback(thirdHandHigh, planDecision);

      const thirdHandUnblock = chooseThirdHandUnblockHonor({
        legal,
        currentTrick,
        trickHistory,
        seat,
        declarer,
        contract,
        trump,
        winning
      });
      if (thirdHandUnblock) return withPlayPlanFallback(thirdHandUnblock, planDecision);

      const openingLeadAttitudeSignal = chooseOpeningLeadAttitudeSignal({
        hand,
        legal,
        currentTrick,
        trickHistory,
        seat,
        declarer,
        trump
      });
      if (openingLeadAttitudeSignal) return withPlayPlanFallback(openingLeadAttitudeSignal, planDecision);

      if (partnerWinning) {
        const harmlessCards = legal.filter((card) => !beats(card, winning.card, leadSuit, trump));
        return withPlayPlanFallback(
          cardPlayResult(
            lowestCard(harmlessCards.length ? harmlessCards : legal),
            "partnerWinningLow",
            "basic",
            "Partner is currently winning the trick, so play the lowest harmless legal card.",
            { winningSeat: winning.seat }
          ),
          planDecision
        );
      }

      const plannedPreserveEntry = choosePlanPreserveWorkSuitEntryPlay({
        playPlan,
        hand,
        partnerHand,
        currentTrick,
        seat,
        trump,
        legal,
        winning
      });
      if (plannedPreserveEntry) return plannedPreserveEntry;

      const plannedHoldUp = choosePlanHoldUpPlay({
        playPlan,
        hand,
        currentTrick,
        seat,
        trump,
        legal,
        winning
      });
      if (plannedHoldUp) return plannedHoldUp;

      const plannedRuff = choosePlanRuffInTrickPlay({
        playPlan,
        hand,
        currentTrick,
        seat,
        trump,
        legal,
        winning
      });
      if (plannedRuff) return plannedRuff;

      const secondHandDefense = chooseSecondHandDefensivePlay({
        legal,
        currentTrick,
        seat,
        declarer,
        dummyHand,
        trump,
        playedCards
      });
      if (secondHandDefense) return withPlayPlanFallback(secondHandDefense, planDecision);

      const thirdHandDefense = chooseThirdHandDefensivePlay({
        legal,
        currentTrick,
        seat,
        declarer,
        trump,
        winning,
        playedCards
      });
      if (thirdHandDefense) return withPlayPlanFallback(thirdHandDefense, planDecision);

      const avoidLongHandRuff = chooseAvoidLongHandRuff({
        hand,
        partnerHand,
        legal,
        currentTrick,
        seat,
        declarer,
        dummy,
        trump,
        winning
      });
      if (avoidLongHandRuff) return withPlayPlanFallback(avoidLongHandRuff, planDecision);

      const canBeat = legal
        .filter((card) => beats(card, winning.card, leadSuit, trump))
        .sort(compareLowCards);

      if (canBeat.length) {
        return withPlayPlanFallback(
          cardPlayResult(
            canBeat[0],
            "cheapestWinner",
            "basic",
            "Play the cheapest card that is currently winning the trick.",
            { winningSeat: winning.seat }
          ),
          planDecision
        );
      }

      if (hand.some((card) => card.suit === leadSuit)) {
        return withPlayPlanFallback(
          cardPlayResult(
            lowestCard(legal),
            "lowestFollow",
            "basic",
            "Follow suit with the lowest legal card because this hand cannot win the trick.",
            { leadSuit, winningSeat: winning.seat }
          ),
          planDecision
        );
      }

      return withPlayPlanFallback(
        cardPlayResult(
          lowestCard(legal),
          "lowestDiscard",
          "basic",
          "Discard the lowest legal card because this hand cannot follow suit or win the trick.",
          { leadSuit, winningSeat: winning.seat }
        ),
        planDecision
      );
    }

  function chooseAvoidLongHandRuff({ hand, partnerHand, legal, currentTrick, seat, declarer, dummy, trump, winning }) {
      if (!trump || !currentTrick.length || !partnerHand?.length || !declarer || !dummy || !winning) return null;
      if (seat !== declarer && seat !== dummy) return null;

      const leadSuit = currentTrick[0].card.suit;
      if (leadSuit === trump || cardsInSuit(hand, leadSuit).length) return null;

      const trumpCards = cardsInSuit(legal, trump);
      const discardCards = legal.filter((card) => card.suit !== trump);
      if (!trumpCards.length || !discardCards.length) return null;

      const ownTrumpLength = cardsInSuit(hand, trump).length;
      const partnerTrumpLength = cardsInSuit(partnerHand, trump).length;
      if (ownTrumpLength <= partnerTrumpLength) return null;

      const winningTrumps = trumpCards.filter((card) => beats(card, winning.card, leadSuit, trump));
      if (!winningTrumps.length) return null;

      const card = lowestCard(discardCards);
      if (!card) return null;

      return cardPlayResult(
        card,
        "avoidLongHandRuff",
        "basic",
        "Avoid ruffing unnecessarily with the long trump hand; that usually does not create an extra trump trick and can reduce control.",
        {
          leadSuit,
          trump,
          longSeat: seat,
          ownTrumpLength,
          partnerTrumpLength,
          action: "discardInsteadOfLongHandRuff"
        }
      );
    }

  return {
    chooseDeclarerFinessePlay,
    chooseDeclarerDevelopmentPlay,
    chooseCardFromPlayPlan,
    chooseCardForPlanPriority,
    legalPlanCard,
    choosePlanDevelopmentPlay,
    choosePlanFinessePlay,
    choosePlanHoldUpPlay,
    choosePlanPreserveWorkSuitEntryPlay,
    choosePlanDirectionalFinessePlay,
    choosePlanRuffPlay,
    choosePlanRuffEntryPlay,
    choosePlanLongSuitRuffDevelopmentPlay,
    choosePlanRuffInTrickPlay,
    ruffEntryCandidates,
    ruffEntryCandidate,
    choosePlanDrawTrumpsPlay,
    choosePlanCashWinnerPlay,
    cardPlayResult,
    cardFromRank,
    touchingHonorSequence,
    notrumpLeadPattern,
    highCardRanks,
    chooseNotrumpLeadCardPlay,
    sideSuitGroups,
    suitGroupOrder,
    fourthBestCard,
    chooseSuitContractLeadCardPlay,
    canUseDefensiveLeadAgreement,
    isDefensivePlaySeat,
    chooseLeadCardPlay,
    openingLeadPlay,
    chooseReturnPartnerLeadSuit,
    dummyRuffThreat,
    chooseTrumpSwitchAgainstDummyRuff,
    createCardPlayContext,
    isLowPromisesHonorLead,
    chooseThirdHandHighOverLowLead,
    chooseThirdHandUnblockHonor,
    cheapestHigherHonor,
    honorCoverTarget,
    chooseSecondHandDefensivePlay,
    chooseThirdHandDefensivePlay,
    chooseCardPlay
  };
});

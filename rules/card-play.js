(function initBridgeRulesCardPlay(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const deps = isCommonJs
    ? {
        core: require("./core.js"),
        playMechanics: require("./play-mechanics.js"),
        playPlan: require("./play-plan.js")
      }
    : root.BridgeRulesParts || {};
  const api = factory(deps.core, deps.playMechanics, deps.playPlan);
  if (isCommonJs) module.exports = api;
  root.BridgeRulesParts = root.BridgeRulesParts || {};
  root.BridgeRulesParts.cardPlay = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesCardPlay(core, playMechanics, playPlan) {
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
    finesseCandidate
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
      if (currentTrick.length || !playPlan?.priorities?.length) return null;
      if (!partnerHand?.length || !declarer || !dummy) return null;
      if (seat !== declarer && seat !== dummy) return null;

      for (const priority of playPlan.priorities) {
        const result = chooseCardForPlanPriority({
          priority,
          hand,
          partnerHand,
          trickHistory,
          seat,
          contract,
          trump,
          legal
        });
        if (result) return result;
      }

      return null;
    }

  function chooseCardForPlanPriority({
      priority,
      hand,
      partnerHand,
      trickHistory,
      seat,
      contract,
      trump,
      legal
    }) {
      if (priority.kind === "developLongSuit") {
        return choosePlanDevelopmentPlay({ priority, hand, partnerHand, seat, legal });
      }
      if (priority.kind === "finesse" || priority.kind === "doubleFinesse") {
        return choosePlanFinessePlay({ priority, hand, partnerHand, trickHistory, seat, legal });
      }
      if (priority.kind === "ruffShortSuit") {
        return choosePlanRuffPlay({ priority, hand, partnerHand, trickHistory, seat, trump, legal });
      }
      if (priority.kind === "drawTrumps") {
        return choosePlanDrawTrumpsPlay({ priority, contract, legal });
      }
      if (priority.kind === "cashWinners" || priority.kind === "cashSureWinners") {
        return choosePlanCashWinnerPlay({ priority, hand, seat, legal });
      }
      return null;
    }

  function legalPlanCard(card, legal) {
        if (!card) return null;
        return legal.find((item) => item.id === card.id) || null;
      }

  function choosePlanDevelopmentPlay({ priority, hand, partnerHand, seat, legal }) {
      const suitCards = cardsInSuit(hand, priority.suit);
      if (!suitCards.length) return null;

      const sourceIsCurrentHand = priority.sourceSeat === seat;
      const card = sourceIsCurrentHand
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
          action: sourceIsCurrentHand ? "forceMissingHighCard" : "leadTowardLongSuit",
          targetSeat: sourceIsCurrentHand ? seat : partnerOf(seat),
          targetLength: sourceIsCurrentHand ? suitCards.length : cardsInSuit(partnerHand, priority.suit).length
        }
      );
    }

  function choosePlanFinessePlay({ priority, hand, partnerHand, trickHistory, seat, legal }) {
      const partnerSeat = partnerOf(seat);
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
      if (expectedKind !== priority.kind) return null;
      const card = legalPlanCard(candidate.card, legal);
      if (!card) return null;

      return cardPlayResult(
        card,
        `playPlan.${candidate.ruleId}`,
        priority.confidence || "uncertain",
        candidate.reason,
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
          action: candidate.action
        }
      );
    }

  function choosePlanRuffPlay({ priority, hand, partnerHand, trickHistory, seat, trump, legal }) {
      if (!trump) return null;
      if (priority.shortSeat === seat) {
        return choosePlanRuffEntryPlay({ priority, hand, partnerHand, trickHistory, seat, trump, legal });
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

  function choosePlanDrawTrumpsPlay({ priority, contract, legal }) {
      const trump = contract?.strain === "NT" ? null : contract?.strain;
      if (!trump || priority.suit !== trump) return null;
      const card = legalPlanCard(highestCard(cardsInSuit(legal, trump)), legal);
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
          action: "drawTrumps"
        }
      );
    }

  function choosePlanCashWinnerPlay({ priority, hand, seat, legal }) {
      if (priority.firstSeat && priority.firstSeat !== seat) return null;
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

  function cardPlayResult(card, ruleName, confidence, reason, extra = {}) {
      return {
        card,
        ruleId: ruleName,
        confidence,
        reason,
        ...extra
      };
    }

  function cardFromRank(cards, rank) {
        return cards.find((card) => card.rank === rank) || null;
      }

  function touchingHonorSequence(cards, minimumLength = 2) {
        const ranks = new Set(cards.map((card) => card.rank));
        for (let i = 0; i < leadHonorRanks.length; i++) {
          const topRank = leadHonorRanks[i];
          if (!ranks.has(topRank)) continue;

          const run = [];
          for (let j = i; j < leadHonorRanks.length; j++) {
            if (!ranks.has(leadHonorRanks[j])) break;
            run.push(leadHonorRanks[j]);
          }
          if (run.length >= minimumLength) {
            return {
              ranks: run,
              topRank,
              card: cardFromRank(cards, topRank)
            };
          }
        }
        return null;
      }

  function notrumpLeadPattern(cards) {
        const ranks = new Set(cards.map((card) => card.rank));
        const candidates = [];

        for (let i = 0; i < descendingRanks.length; i++) {
          const topRank = descendingRanks[i];
          if (!isLeadHonorRank(topRank) || !ranks.has(topRank)) continue;

          const run = [];
          for (let j = i; j < descendingRanks.length; j++) {
            if (!ranks.has(descendingRanks[j])) break;
            run.push(descendingRanks[j]);
          }
          if (run.length >= 3) {
            candidates.push({ type: "sequence", ranks: run, topRank, score: 300 - i });
          }

          const nextRank = descendingRanks[i + 1];
          const gapRank = descendingRanks[i + 2];
          const fourthRank = descendingRanks[i + 3];
          if (nextRank && fourthRank && ranks.has(nextRank) && !ranks.has(gapRank) && ranks.has(fourthRank)) {
            candidates.push({
              type: "brokenSequence",
              ranks: [topRank, nextRank, fourthRank],
              topRank,
              missingRank: gapRank,
              score: 200 - i
            });
          }
          if (gapRank && fourthRank && !ranks.has(nextRank) && ranks.has(gapRank) && ranks.has(fourthRank)) {
            candidates.push({
              type: "brokenSequence",
              ranks: [topRank, gapRank, fourthRank],
              topRank,
              missingRank: nextRank,
              score: 200 - i
            });
          }
        }

        const best = candidates.sort((a, b) => {
          const topDiff = rankOrder.indexOf(b.topRank) - rankOrder.indexOf(a.topRank);
          if (topDiff) return topDiff;
          return b.score - a.score;
        })[0];
        if (!best) return null;

        return {
          ...best,
          card: cardFromRank(cards, best.topRank)
        };
      }

  function highCardRanks(cards) {
        return descendingRanks.filter((rank) => hcpValue[rank] && cards.some((card) => card.rank === rank));
      }

  function chooseNotrumpLeadCardPlay(hand, legal) {
        const longestSuit = longestSuitForLead(hand);
        const longestSuitCards = legal.filter((card) => card.suit === longestSuit);
        if (!longestSuitCards.length) return null;

        const pattern = notrumpLeadPattern(longestSuitCards);
        if (pattern?.card) {
          return cardPlayResult(
            pattern.card,
            pattern.type === "brokenSequence" ? "notrumpBrokenSequenceLead" : "notrumpSequenceLead",
            "basic",
            "Lead the highest card from a notrump sequence or broken sequence.",
            {
              suit: longestSuit,
              suitLength: longestSuitCards.length,
              sequence: pattern.ranks.join(""),
              missingRank: pattern.missingRank || null,
              action: pattern.type
            }
          );
        }

        const honors = highCardRanks(longestSuitCards);
        if (honors.length) {
          const smallCard = lowestCard(longestSuitCards.filter(isLowLeadCard));
          if (smallCard) {
            return cardPlayResult(
              smallCard,
              "notrumpLowPromisesHonor",
              "basic",
              "Lead low from the longest notrump suit to promise at least one high card.",
              {
                suit: longestSuit,
                suitLength: longestSuitCards.length,
                honorRanks: honors,
                action: "lowPromisesHonor"
              }
            );
          }
        }

        const highMiddleCard = highestCard(longestSuitCards);
        if (!highMiddleCard) return null;

        return cardPlayResult(
          highMiddleCard,
          "notrumpHighMiddleDeniesHonor",
          "basic",
          "Lead the highest card from the longest notrump suit to deny an honor.",
          {
            suit: longestSuit,
            suitLength: longestSuitCards.length,
            action: "highMiddleDeniesHonor"
          }
        );
      }

  function sideSuitGroups(legal, trump) {
        return suits
          .filter((suit) => suit !== trump)
          .map((suit) => ({ suit, cards: cardsInSuit(legal, suit) }))
          .filter((group) => group.cards.length);
      }

  function suitGroupOrder(a, b) {
        const lengthDiff = b.cards.length - a.cards.length;
        if (lengthDiff) return lengthDiff;
        return suits.indexOf(a.suit) - suits.indexOf(b.suit);
      }

  function fourthBestCard(cards) {
        return [...cards].sort((a, b) => rankOrder.indexOf(b.rank) - rankOrder.indexOf(a.rank))[3] || null;
      }

  function chooseSuitContractLeadCardPlay(legal, trump) {
        const sideSuits = sideSuitGroups(legal, trump);
        if (!sideSuits.length) return null;

        const sequence = sideSuits
          .map((group) => ({ ...group, pattern: touchingHonorSequence(group.cards, 2) }))
          .filter((group) => group.pattern?.card)
          .sort((a, b) => {
            const rankDiff = rankOrder.indexOf(b.pattern.topRank) - rankOrder.indexOf(a.pattern.topRank);
            if (rankDiff) return rankDiff;
            const sequenceDiff = b.pattern.ranks.length - a.pattern.ranks.length;
            if (sequenceDiff) return sequenceDiff;
            return suits.indexOf(a.suit) - suits.indexOf(b.suit);
          })[0];
        if (sequence) {
          return cardPlayResult(
            sequence.pattern.card,
            "suitContractSequenceLead",
            "basic",
            "Lead the highest card from a touching honor sequence against a suit contract.",
            {
              suit: sequence.suit,
              suitLength: sequence.cards.length,
              sequence: sequence.pattern.ranks.join(""),
              action: "sequence"
            }
          );
        }

        const singleton = sideSuits.find((group) => group.cards.length === 1);
        if (singleton) {
          return cardPlayResult(
            singleton.cards[0],
            "suitContractSingletonLead",
            "basic",
            "Lead a singleton side suit against a suit contract.",
            {
              suit: singleton.suit,
              suitLength: singleton.cards.length,
              action: "singleton"
            }
          );
        }

        const doubleton = sideSuits.find((group) => group.cards.length === 2);
        if (doubleton) {
          return cardPlayResult(
            highestCard(doubleton.cards),
            "suitContractDoubletonLead",
            "basic",
            "Lead the highest card from a doubleton side suit against a suit contract.",
            {
              suit: doubleton.suit,
              suitLength: doubleton.cards.length,
              action: "doubleton"
            }
          );
        }

        const longSuit = sideSuits
          .filter((group) => group.cards.length >= 4)
          .sort(suitGroupOrder)[0];
        if (longSuit) {
          return cardPlayResult(
            fourthBestCard(longSuit.cards),
            "suitContractFourthBestLead",
            "basic",
            "Lead fourth best from length against a suit contract.",
            {
              suit: longSuit.suit,
              suitLength: longSuit.cards.length,
              action: "fourthBest"
            }
          );
        }

        const threeSmall = sideSuits.find((group) => group.cards.length === 3 && group.cards.every(isLowLeadCard));
        if (threeSmall) {
          return cardPlayResult(
            lowestCard(threeSmall.cards),
            "suitContractLowFromThreeSmall",
            "basic",
            "Lead low from three small cards against a suit contract.",
            {
              suit: threeSmall.suit,
              suitLength: threeSmall.cards.length,
              action: "lowFromThreeSmall"
            }
          );
        }

        return null;
      }

  function canUseDefensiveLeadAgreement(seat, declarer) {
        return !seat || !declarer || teamOf(seat) !== teamOf(declarer);
      }

  function isDefensivePlaySeat(seat, declarer) {
        return Boolean(seat && declarer && teamOf(seat) !== teamOf(declarer));
      }

  function chooseLeadCardPlay(hand, legal, { contract = null, seat = null, declarer = null, isOpeningLead = true } = {}) {
      if (isOpeningLead && contract?.strain === "NT" && canUseDefensiveLeadAgreement(seat, declarer)) {
        const notrumpLead = chooseNotrumpLeadCardPlay(hand, legal);
        if (notrumpLead) return notrumpLead;
      }
      if (isOpeningLead && contract?.strain && contract.strain !== "NT" && canUseDefensiveLeadAgreement(seat, declarer)) {
        const suitContractLead = chooseSuitContractLeadCardPlay(legal, contract.strain);
        if (suitContractLead) return suitContractLead;
      }

      const longestSuit = longestSuitForLead(hand);
      const longestSuitCards = legal.filter((card) => card.suit === longestSuit);
      if (longestSuitCards.length) {
        return cardPlayResult(
          highestCard(longestSuitCards),
          "longestSuitLead",
          "uncertain",
          "Lead the highest card from the longest available suit.",
          { suit: longestSuit, suitLength: longestSuitCards.length }
        );
      }

      return cardPlayResult(
        lowestCard(legal),
        "lowestLead",
        "basic",
        "Lead the lowest legal card.",
        {}
      );
    }

  function openingLeadPlay(trickHistory = []) {
        return trickHistory[0]?.cards?.[0] || null;
      }

  function chooseReturnPartnerLeadSuit({ legal, trickHistory, seat, declarer }) {
      if (!isDefensivePlaySeat(seat, declarer) || !trickHistory.length) return null;

      const openingLead = openingLeadPlay(trickHistory);
      if (!openingLead || openingLead.seat !== partnerOf(seat)) return null;

      const leadSuit = openingLead.card.suit;
      const suitedLegal = cardsInSuit(legal, leadSuit);
      if (!suitedLegal.length) return null;

      const lowCards = suitedLegal.filter(isLowLeadCard);
      const card = lowestCard(lowCards.length ? lowCards : suitedLegal);
      return cardPlayResult(
        card,
        "returnPartnerLeadSuit",
        "basic",
        "Return partner's opening lead suit when it is still available.",
        {
          suit: leadSuit,
          leadCard: openingLead.card,
          partnerSeat: openingLead.seat,
          action: "returnPartnerLeadSuit"
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

  function chooseThirdHandHighOverLowLead({ legal, currentTrick, seat, declarer, contract, trump, winning }) {
      if (contract?.strain !== "NT" || trump || !seat || currentTrick.length !== 2) return null;
      if (!isDefensivePlaySeat(seat, declarer)) return null;
      const leadPlay = currentTrick[0];
      if (leadPlay.seat !== partnerOf(seat) || !isLowPromisesHonorLead(leadPlay)) return null;

      const leadSuit = leadPlay.card.suit;
      const suitedLegal = cardsInSuit(legal, leadSuit);
      if (!suitedLegal.length) return null;

      return cardPlayResult(
        highestCard(suitedLegal),
        "thirdHandHighOverLowLead",
        "basic",
        "Partner led low to promise a high card in notrump, so third hand plays high.",
        {
          leadSuit,
          leadCard: leadPlay.card,
          winningSeat: winning?.seat || null,
          action: "thirdHandHigh"
        }
      );
    }

  function cheapestHigherHonor(cards, rank) {
        return cards
          .filter((card) => isLeadHonorRank(card.rank) && rankOrder.indexOf(card.rank) > rankOrder.indexOf(rank))
          .sort(compareLowCards)[0] || null;
      }

  function dummySupportsHonorCover(dummyHand, leadSuit, leadRank) {
        if (!dummyHand?.length) return true;
        const lowerHonor = leadHonorRanks[leadHonorRanks.indexOf(leadRank) + 1];
        return Boolean(lowerHonor && cardsInSuit(dummyHand, leadSuit).some((card) => card.rank === lowerHonor));
      }

  function chooseSecondHandDefensivePlay({ legal, currentTrick, seat, declarer, dummyHand, trump }) {
      if (currentTrick.length !== 1 || !isDefensivePlaySeat(seat, declarer)) return null;

      const leadCard = currentTrick[0].card;
      const leadSuit = leadCard.suit;
      const suitedLegal = cardsInSuit(legal, leadSuit);
      if (!suitedLegal.length) return null;

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

      if (isLeadHonorRank(leadCard.rank)) {
        const coverCard = cheapestHigherHonor(suitedLegal, leadCard.rank);
        if (coverCard && dummySupportsHonorCover(dummyHand, leadSuit, leadCard.rank)) {
          return cardPlayResult(
            coverCard,
            "secondHandCoverHonor",
            "basic",
            "Second hand covers an honor when dummy shows a lower touching honor that can be limited.",
            {
              leadSuit,
              coveredRank: leadCard.rank,
              action: "coverHonor"
            }
          );
        }
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

  function chooseThirdHandDefensivePlay({ legal, currentTrick, seat, declarer, trump, winning }) {
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

      return cardPlayResult(
        canBeat[0],
        "thirdHandHighCheapest",
        "basic",
        "Third hand plays the cheapest card that can win the trick.",
        {
          leadSuit,
          winningSeat: winning.seat,
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
      playPlan = null
    } = {}) {
      const context = createCardPlayContext({ hand, currentTrick, trickHistory, seat, declarer, trump });
      const { legal } = context;
      if (!legal.length) return null;

      if (!currentTrick.length) {
        const planned = chooseCardFromPlayPlan({
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
        });
        if (planned) return planned;
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
        if (finesse) return finesse;
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
        if (development) return development;

        const returnPartnerLeadSuit = chooseReturnPartnerLeadSuit({
          legal,
          trickHistory,
          seat,
          declarer
        });
        if (returnPartnerLeadSuit) return returnPartnerLeadSuit;

        return chooseLeadCardPlay(hand, legal, { contract, seat, declarer, isOpeningLead: context.isOpeningLead });
      }

      const { leadSuit, winning, partnerWinning } = context;

      const thirdHandHigh = chooseThirdHandHighOverLowLead({
        legal,
        currentTrick,
        seat,
        declarer,
        contract,
        trump,
        winning
      });
      if (thirdHandHigh) return thirdHandHigh;

      if (partnerWinning) {
        const harmlessCards = legal.filter((card) => !beats(card, winning.card, leadSuit, trump));
        return cardPlayResult(
          lowestCard(harmlessCards.length ? harmlessCards : legal),
          "partnerWinningLow",
          "basic",
          "Partner is currently winning the trick, so play the lowest harmless legal card.",
          { winningSeat: winning.seat }
        );
      }

      const secondHandDefense = chooseSecondHandDefensivePlay({
        legal,
        currentTrick,
        seat,
        declarer,
        dummyHand,
        trump
      });
      if (secondHandDefense) return secondHandDefense;

      const thirdHandDefense = chooseThirdHandDefensivePlay({
        legal,
        currentTrick,
        seat,
        declarer,
        trump,
        winning
      });
      if (thirdHandDefense) return thirdHandDefense;

      const canBeat = legal
        .filter((card) => beats(card, winning.card, leadSuit, trump))
        .sort(compareLowCards);

      if (canBeat.length) {
        return cardPlayResult(
          canBeat[0],
          "cheapestWinner",
          "basic",
          "Play the cheapest card that is currently winning the trick.",
          { winningSeat: winning.seat }
        );
      }

      if (hand.some((card) => card.suit === leadSuit)) {
        return cardPlayResult(
          lowestCard(legal),
          "lowestFollow",
          "basic",
          "Follow suit with the lowest legal card because this hand cannot win the trick.",
          { leadSuit, winningSeat: winning.seat }
        );
      }

      return cardPlayResult(
        lowestCard(legal),
        "lowestDiscard",
        "basic",
        "Discard the lowest legal card because this hand cannot follow suit or win the trick.",
        { leadSuit, winningSeat: winning.seat }
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
    choosePlanRuffPlay,
    choosePlanRuffEntryPlay,
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
    createCardPlayContext,
    isLowPromisesHonorLead,
    chooseThirdHandHighOverLowLead,
    cheapestHigherHonor,
    dummySupportsHonorCover,
    chooseSecondHandDefensivePlay,
    chooseThirdHandDefensivePlay,
    chooseCardPlay
  };
});

(function initBridgeRulesPlayPlanEndgameRunout(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const deps = isCommonJs
    ? { core: require("../core.js"), common: require("./common.js") }
    : { core: root.BridgeRulesParts?.core, common: root.BridgeRulesPlayPlanParts?.common };
  const api = factory(deps.core, deps.common);
  if (isCommonJs) module.exports = api;
  root.BridgeRulesPlayPlanParts = root.BridgeRulesPlayPlanParts || {};
  root.BridgeRulesPlayPlanParts.endgameRunout = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesPlayPlanEndgameRunout(core, common) {
  "use strict";

  if (!core) throw new Error("BridgeRules play-plan endgame-runout missing core dependency");
  if (!common) throw new Error("BridgeRules play-plan endgame-runout missing common dependency");

  const {
    seats,
    suits,
    rankOrder,
    compareLowCards,
    lowestCard,
    teamOf,
    partnerOf
  } = core;
  const {
    visibleTopWinnerRanks,
    cardsInSuit,
    playedCardsFrom
  } = common;

  function endgameRunoutPriority({
      declarerHand = [],
      dummyHand = [],
      contract = null,
      declarer = null,
      dummy = null,
      trickHistory = [],
      currentTrick = []
    } = {}) {
      if (!contract || !declarer || !dummy || !declarerHand.length || !dummyHand.length) return null;
      const remainingTricks = Math.max(declarerHand.length, dummyHand.length);
      if (remainingTricks < 2 || remainingTricks > 7) return null;

      const trump = contract.strain === "NT" ? null : contract.strain;
      const sideHands = {
        [declarer]: declarerHand.map((card) => ({ ...card })),
        [dummy]: dummyHand.map((card) => ({ ...card }))
      };
      const playedCards = playedCardsFrom(trickHistory, currentTrick).map((card) => ({ ...card }));
      const sequence = [];
      let leader = trickHistory[trickHistory.length - 1]?.winner || declarer;
      let tricksToPlan = remainingTricks;
      let defenderTrumps = trump ? defendersRemainingInSuit(sideHands, playedCards, trump) : 0;

      if (currentTrick.length) {
        const nextSeat = seatAfterCurrentTrick(currentTrick);
        if (nextSeat !== declarer && nextSeat !== dummy) return null;
        const currentWinner = currentWinningPlay(currentTrick, trump);
        const leadSuit = currentTrick[0].card.suit;
        const legal = legalCardsForTrick(sideHands[nextSeat], currentTrick);
        if (currentTrick.length < 3 && currentWinner && teamOf(currentWinner.seat) === teamOf(nextSeat) && currentWinner.seat !== nextSeat) {
          const preserve = preservingRunoutDiscard({
            sideHands,
            playedCards,
            currentTrick,
            currentWinner,
            nextSeat,
            legal,
            trump,
            remainingTricks,
            defenderTrumps
          });
          if (!preserve) return null;
          sequence.push(preserve.step, ...preserve.runout.sequence);
          return endgameRunoutPriorityResult({ sequence, remainingTricks, trump });
        }

        if (currentTrick.length !== 3) return null;
        const card = lowestCard(
          legal
            .filter((candidate) => beats(candidate, currentWinner.card, leadSuit, trump))
            .sort(compareLowCards)
        );
        if (!card) return null;
        removeCard(sideHands[nextSeat], card);
        playedCards.push(card);
        if (trump && card.suit === trump && leadSuit === trump && defenderTrumps > 0) defenderTrumps -= 1;
        sequence.push({
          action: trump && card.suit === trump && leadSuit !== trump ? "ruffCurrentTrick" : "winCurrentTrick",
          seat: nextSeat,
          cardId: card.id,
          suit: card.suit,
          rank: card.rank,
          leadSuit,
          winnerSeat: nextSeat
        });
        leader = nextSeat;
        tricksToPlan -= 1;
      } else if (leader !== declarer && leader !== dummy) {
        return null;
      }

      const runout = simulateVisibleRunout({
        sideHands,
        playedCards,
        trump,
        leader,
        tricksToPlan,
        defenderTrumps
      });
      if (!runout) {
        const sacrificeRunout = sacrificeForLateCrossRuffPriority({
          sideHands,
          playedCards,
          trump,
          leader,
          remainingTricks,
          defenderTrumps
        });
        if (sacrificeRunout) return sacrificeRunout;
        return null;
      }
      sequence.push(...runout.sequence);
      if (sequence.length < remainingTricks) return null;

      return endgameRunoutPriorityResult({ sequence, remainingTricks, trump });
    }

  function endgameRunoutPriorityResult({ sequence, remainingTricks, trump }) {
      return {
        kind: "endgameRunout",
        confidence: "basic",
        contractType: trump ? "suit" : "notrump",
        trump,
        sequence,
        remainingTricks,
        firstSeat: sequence[0].seat,
        suit: sequence[0].suit,
        cashRanks: sequence.filter((step) => step.action === "cashWinner").map((step) => step.rank),
        action: sequence[0].action,
        score: 500 + remainingTricks * 10
      };
    }

  function sacrificeForLateCrossRuffPriority({ sideHands, playedCards, trump, leader, remainingTricks, defenderTrumps }) {
      if (!trump || defenderTrumps !== 0 || remainingTricks < 3 || remainingTricks > 5) return null;
      const partner = partnerOf(leader);
      const leaderHand = sideHands[leader] || [];
      const partnerHand = sideHands[partner] || [];
      const leaderTrumps = cardsInSuit(leaderHand, trump);
      const partnerTrumps = cardsInSuit(partnerHand, trump);
      const securedTricks = remainingTricks - 1;
      if (leaderTrumps.length + partnerTrumps.length < securedTricks) return null;

      const candidates = [];
      for (const sacrificeSuit of suits) {
        if (sacrificeSuit === trump) continue;
        const leaderCards = cardsInSuit(leaderHand, sacrificeSuit);
        const partnerCards = cardsInSuit(partnerHand, sacrificeSuit);
        if (leaderCards.length !== 1 || partnerCards.length < 2) continue;
        if (defendersRemainingInSuit(sideHands, playedCards, sacrificeSuit) <= 0) continue;

        const winnerRanks = visibleTopWinnerRanks(combinedSuitCards(sideHands, sacrificeSuit), cardsInSuit(playedCards, sacrificeSuit));
        const sacrificeCard = leaderCards[0];
        if (winnerRanks.includes(sacrificeCard.rank)) continue;

        for (const crossSuit of suits) {
          if (crossSuit === trump || crossSuit === sacrificeSuit) continue;
          const crossCards = cardsInSuit(leaderHand, crossSuit);
          if (!crossCards.length || cardsInSuit(partnerHand, crossSuit).length) continue;
          if (crossCards.length < partnerTrumps.length) continue;
          if (partnerCards.length - 1 < leaderTrumps.length) continue;
          candidates.push({
            sacrificeCard,
            sacrificeSuit,
            crossSuit,
            partner,
            leaderTrumps: leaderTrumps.length,
            partnerTrumps: partnerTrumps.length,
            score: (leaderTrumps.length + partnerTrumps.length) * 20 + crossCards.length * 5 + partnerCards.length * 5
          });
        }
      }

      const best = candidates
        .sort((a, b) => b.score - a.score || compareLowCards(a.sacrificeCard, b.sacrificeCard))[0];
      if (!best) return null;

      const step = {
        action: "giveUpForLateCrossRuff",
        seat: leader,
        cardId: best.sacrificeCard.id,
        suit: best.sacrificeSuit,
        rank: best.sacrificeCard.rank,
        leadSuit: best.sacrificeSuit,
        winnerSeat: null,
        targetSeat: best.partner,
        shortSeat: leader,
        crossSuits: [best.sacrificeSuit, best.crossSuit]
      };

      return {
        kind: "endgameRunout",
        confidence: "uncertain",
        contractType: "suit",
        trump,
        sequence: [step],
        remainingTricks: securedTricks,
        firstSeat: leader,
        suit: best.sacrificeSuit,
        cashRanks: [],
        action: step.action,
        targetSeat: best.partner,
        shortSeat: leader,
        crossSuits: [best.sacrificeSuit, best.crossSuit],
        securedTricks,
        score: 450 + securedTricks * 10
      };
    }

  function preservingRunoutDiscard({
      sideHands,
      playedCards,
      currentTrick,
      currentWinner,
      nextSeat,
      legal,
      trump,
      remainingTricks,
      defenderTrumps
    }) {
      if (!isCurrentWinnerVisiblySafe({ sideHands, playedCards, currentTrick, currentWinner, trump })) return null;
      const leadSuit = currentTrick[0].card.suit;
      const candidates = [...legal]
        .filter((candidate) => !beats(candidate, currentWinner.card, leadSuit, trump))
        .sort((a, b) => preserveDiscardScore(a, sideHands, playedCards, trump, nextSeat) - preserveDiscardScore(b, sideHands, playedCards, trump, nextSeat) || compareLowCards(a, b));

      for (const candidate of candidates) {
        const clonedHands = cloneSideHands(sideHands);
        const clonedPlayed = playedCards.map((card) => ({ ...card }));
        const card = removeCard(clonedHands[nextSeat], candidate);
        clonedPlayed.push(card);
        const runout = simulateVisibleRunout({
          sideHands: clonedHands,
          playedCards: clonedPlayed,
          trump,
          leader: currentWinner.seat,
          tricksToPlan: remainingTricks - 1,
          defenderTrumps
        });
        if (!runout || runout.sequence.length < remainingTricks - 1) continue;
        return {
          step: {
            action: "preserveRunoutWinner",
            seat: nextSeat,
            cardId: card.id,
            suit: card.suit,
            rank: card.rank,
            leadSuit,
            winnerSeat: currentWinner.seat
          },
          runout
        };
      }

      return null;
    }

  function preserveDiscardScore(card, sideHands, playedCards, trump, seat) {
      let score = 0;
      const hand = sideHands[seat] || [];
      const suitWinners = visibleTopWinnerRanks(combinedSuitCards(sideHands, card.suit), cardsInSuit(playedCards, card.suit));
      if (suitWinners.includes(card.rank)) score += 100;
      const heldWinners = suitWinners.filter((rank) => hand.some((item) => item.suit === card.suit && item.rank === rank));
      if (heldWinners.length) score += 25;
      if (trump && card.suit === trump) score += 10;
      return score;
    }

  function simulateVisibleRunout({ sideHands, playedCards, trump, leader, tricksToPlan, defenderTrumps }) {
      return searchVisibleRunout({
        sideHands,
        playedCards,
        trump,
        leader,
        tricksToPlan,
        defenderTrumps,
        sequence: []
      });
    }

  function searchVisibleRunout({ sideHands, playedCards, trump, leader, tricksToPlan, defenderTrumps, sequence }) {
      if (tricksToPlan <= 0) return { sequence };
      const candidates = visibleRunoutCandidates({ sideHands, playedCards, trump, leader, defenderTrumps });
      for (const candidate of candidates) {
        const next = applyRunoutCandidate({ sideHands, playedCards, trump, defenderTrumps, candidate });
        if (!next) continue;
        const runout = searchVisibleRunout({
          sideHands: next.sideHands,
          playedCards: next.playedCards,
          trump,
          leader: next.leader,
          tricksToPlan: tricksToPlan - 1,
          defenderTrumps: next.defenderTrumps,
          sequence: [...sequence, next.step]
        });
        if (runout) return runout;
      }
      return null;
    }

  function visibleRunoutCandidates({ sideHands, playedCards, trump, leader, defenderTrumps }) {
      const partner = partnerOf(leader);
      return [
        ...visibleDirectWinnerCandidates({ sideHands, playedCards, trump, seat: leader, defenderTrumps })
          .map((card) => ({ kind: "direct", seat: leader, partner, card })),
        ...visibleEntryToPartnerWinnerCandidates({ sideHands, playedCards, trump, leader, partner, defenderTrumps })
          .map((entry) => ({ kind: "entry", leader, partner, ...entry }))
      ];
    }

  function applyRunoutCandidate({ sideHands, playedCards, trump, defenderTrumps, candidate }) {
      const clonedHands = cloneSideHands(sideHands);
      const clonedPlayed = playedCards.map((card) => ({ ...card }));
      let nextLeader = candidate.seat || candidate.leader;
      let nextDefenderTrumps = defenderTrumps;
      let step = null;

      if (candidate.kind === "direct") {
        const card = removeCard(clonedHands[candidate.seat], candidate.card);
        let companion = null;
        if (
          trump &&
          card.suit !== trump &&
          defenderTrumps === 0 &&
          !cardsInSuit(clonedHands[candidate.partner], card.suit).length &&
          cardsInSuit(clonedHands[candidate.partner], trump).length
        ) {
          companion = removeCard(clonedHands[candidate.partner], lowestCard(cardsInSuit(clonedHands[candidate.partner], trump)));
          nextLeader = candidate.partner;
        } else {
          companion = removeCompanionCard(clonedHands[candidate.partner], card.suit);
        }
        clonedPlayed.push(card);
        if (companion) clonedPlayed.push(companion);
        if (trump && card.suit === trump && nextDefenderTrumps > 0) nextDefenderTrumps -= 1;
        step = {
          action: nextLeader === candidate.partner ? "leadForPartnerRuff" : "cashWinner",
          seat: candidate.seat,
          cardId: card.id,
          suit: card.suit,
          rank: card.rank,
          winnerSeat: nextLeader
        };
      } else {
        const leadCard = removeCard(clonedHands[candidate.leader], candidate.leadCard);
        const winnerCard = removeCard(clonedHands[candidate.partner], candidate.winnerCard);
        clonedPlayed.push(leadCard, winnerCard);
        nextLeader = candidate.partner;
        step = {
          action: "leadEntry",
          seat: candidate.leader,
          cardId: leadCard.id,
          suit: leadCard.suit,
          rank: leadCard.rank,
          targetSeat: candidate.partner,
          targetRank: winnerCard.rank,
          winnerSeat: candidate.partner
        };
      }

      return {
        sideHands: clonedHands,
        playedCards: clonedPlayed,
        leader: nextLeader,
        defenderTrumps: nextDefenderTrumps,
        step
      };
    }

  function visibleDirectWinnerCandidates({ sideHands, playedCards, trump, seat, defenderTrumps }) {
      const hand = sideHands[seat] || [];
      const candidates = [];
      if (trump) {
        const trumpCards = cardsInSuit(hand, trump).sort((a, b) => rankOrder.indexOf(b.rank) - rankOrder.indexOf(a.rank));
        if (trumpCards.length && canDrawDefenderTrumps(sideHands, playedCards, trump, defenderTrumps)) candidates.push(...trumpCards);
      }
      if (!trump || defenderTrumps === 0) {
        candidates.push(...visibleSideWinnersForSeat({ sideHands, playedCards, trump, seat }));
      }
      if (trump) {
        const topTrumpRanks = visibleTopWinnerRanks(combinedSuitCards(sideHands, trump), cardsInSuit(playedCards, trump));
        const topTrumps = topTrumpRanks.map((rank) => cardsInSuit(hand, trump).find((card) => card.rank === rank)).filter(Boolean);
        candidates.push(...topTrumps);
      }
      return uniqueCards(candidates);
    }

  function visibleEntryToPartnerWinnerCandidates({ sideHands, playedCards, trump, leader, partner, defenderTrumps }) {
      if (trump && defenderTrumps > 0) return [];
      const leaderHand = sideHands[leader] || [];
      const partnerHand = sideHands[partner] || [];
      const candidates = [];
      for (const suit of suits) {
        if (suit === trump) continue;
        const leaderCards = cardsInSuit(leaderHand, suit);
        if (!leaderCards.length) continue;
        const winnerRanks = visibleTopWinnerRanks(combinedSuitCards(sideHands, suit), cardsInSuit(playedCards, suit));
        const winnerCard = winnerRanks.map((rank) => partnerHand.find((card) => card.suit === suit && card.rank === rank)).find(Boolean);
        if (!winnerCard) continue;
        const lowerLead = leaderCards
          .filter((card) => rankOrder.indexOf(card.rank) < rankOrder.indexOf(winnerCard.rank))
          .sort(compareLowCards)[0];
        if (lowerLead) candidates.push({ leadCard: lowerLead, winnerCard });
      }
      return candidates;
    }

  function visibleSideWinnersForSeat({ sideHands, playedCards, trump, seat }) {
      const hand = sideHands[seat] || [];
      const winners = [];
      for (const suit of suits) {
        if (suit === trump) continue;
        const winnerRanks = visibleTopWinnerRanks(combinedSuitCards(sideHands, suit), cardsInSuit(playedCards, suit));
        winners.push(...winnerRanks.map((rank) => hand.find((card) => card.suit === suit && card.rank === rank)).filter(Boolean));
      }
      return winners;
    }

  function uniqueCards(cards) {
      const seen = new Set();
      return cards.filter((card) => {
        if (!card || seen.has(card.id)) return false;
        seen.add(card.id);
        return true;
      });
    }

  function canDrawDefenderTrumps(sideHands, playedCards, trump, defenderTrumps) {
      if (!trump || defenderTrumps <= 0) return true;
      return visibleTopWinnerRanks(combinedSuitCards(sideHands, trump), cardsInSuit(playedCards, trump)).length >= defenderTrumps;
    }

  function isCurrentWinnerVisiblySafe({ sideHands, playedCards, currentTrick, currentWinner, trump }) {
      if (!currentWinner) return false;
      if (currentTrick.length >= 3) return true;
      const leadSuit = currentTrick[0].card.suit;
      const winnerSuit = currentWinner.card.suit;
      if (trump && winnerSuit !== trump && winnerSuit === leadSuit) return false;
      const suit = winnerSuit;
      const winnerRanks = visibleTopWinnerRanks(
        [...combinedSuitCards(sideHands, suit), currentWinner.card],
        cardsInSuit(playedCards, suit)
      );
      return winnerRanks.includes(currentWinner.card.rank);
    }

  function defendersRemainingInSuit(sideHands, playedCards, suit) {
      return Math.max(0, 13 - cardsInSuit(playedCards, suit).length - combinedSuitCards(sideHands, suit).length);
    }

  function combinedSuitCards(sideHands, suit) {
      return Object.values(sideHands).flatMap((hand) => cardsInSuit(hand, suit));
    }

  function cloneSideHands(sideHands) {
      return Object.fromEntries(Object.entries(sideHands).map(([seat, hand]) => [
        seat,
        hand.map((card) => ({ ...card }))
      ]));
    }

  function seatAfterCurrentTrick(currentTrick) {
      const firstIndex = seats.indexOf(currentTrick[0].seat);
      return seats[(firstIndex + currentTrick.length) % seats.length];
    }

  function legalCardsForTrick(hand, currentTrick) {
      if (!currentTrick.length) return hand;
      const leadSuit = currentTrick[0].card.suit;
      const followSuit = cardsInSuit(hand, leadSuit);
      return followSuit.length ? followSuit : hand;
    }

  function beats(card, best, leadSuit, trump) {
      if (trump && card.suit === trump && best.suit !== trump) return true;
      if (trump && best.suit === trump && card.suit !== trump) return false;
      if (card.suit !== best.suit) return false;
      if (card.suit !== leadSuit && (!trump || card.suit !== trump)) return false;
      return rankOrder.indexOf(card.rank) > rankOrder.indexOf(best.rank);
    }

  function currentWinningPlay(currentTrick, trump) {
      if (!currentTrick.length) return null;
      const leadSuit = currentTrick[0].card.suit;
      return currentTrick.reduce((best, play) => beats(play.card, best.card, leadSuit, trump) ? play : best);
    }

  function removeCard(hand, card) {
      const index = hand.findIndex((item) => item.id === card.id);
      if (index >= 0) hand.splice(index, 1);
      return card;
    }

  function removeCompanionCard(hand, leadSuit) {
      const followSuit = cardsInSuit(hand, leadSuit);
      const card = lowestCard(followSuit.length ? followSuit : hand);
      if (!card) return null;
      removeCard(hand, card);
      return card;
    }

  return {
    endgameRunoutPriority
  };
});

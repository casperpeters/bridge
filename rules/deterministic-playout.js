(function initBridgeRulesDeterministicPlayout(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const deps = isCommonJs ? { core: require("./core.js") } : root.BridgeRulesParts || {};
  const api = factory(deps.core);
  if (isCommonJs) module.exports = api;
  root.BridgeRulesParts = root.BridgeRulesParts || {};
  root.BridgeRulesParts.deterministicPlayout = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesDeterministicPlayout(core) {
  "use strict";

  if (!core) throw new Error("BridgeRules deterministic playout missing core dependency");

  const {
    seats,
    suits,
    rankOrder,
    compareLowCards,
    teamOf,
    partnerOf
  } = core;

  const MAX_VISIBLE_UITSPELEN_TRICKS = 7;
  const DEFAULT_SEARCH_NODE_BUDGET = 12000;

  function analyzeVisibleNotrumpUitspelen(options = {}) {
      if (!options.contract || !options.currentTurn || !options.hands) return unavailable("missingContext");
      if (options.contract.strain !== "NT") return unavailable("notNotrump");
      return analyzeVisibleUitspelen(options);
    }

  function analyzeVisibleUitspelen({
      hands = {},
      visibleSeats = [],
      observerSeat = "South",
      contract = null,
      declarer = null,
      currentTurn = null,
      currentTrick = [],
      trickHistory = [],
      nodeBudget = DEFAULT_SEARCH_NODE_BUDGET
    } = {}) {
      if (!contract || !currentTurn || !hands) return unavailable("missingContext");
      const trump = contract.strain === "NT" ? null : contract.strain;
      if (trump && !suits.includes(trump)) return unavailable("unsupportedContractStrain");
      if (currentTrick.length) return unavailable("currentTrickInProgress");

      const visibleSet = visibleProofSeatSet({ visibleSeats, hands, observerSeat, declarer });
      if (!visibleSet.size) return unavailable("noVisibleSeats");
      if (!visibleSet.has(currentTurn)) return unavailable("currentTurnHidden");

      const remainingTricks = hands[currentTurn]?.length || 0;
      if (remainingTricks <= 0) return unavailable("noRemainingCards");
      if (remainingTricks > MAX_VISIBLE_UITSPELEN_TRICKS) return unavailable("analysisBudget");

      const visibleHands = Object.fromEntries([...visibleSet].map((seat) => [
        seat,
        cloneCards(hands[seat] || [])
      ]));
      const playedCards = playedCardsFrom(trickHistory, currentTrick);
      const proof = createProofContext({
        hands,
        visibleSet,
        playedCards,
        trickHistory
      });

      const searchBudget = createSearchBudget(nodeBudget);
      const runout = searchVisibleNotrumpRunout({
        visibleHands,
        playedCards,
        proof,
        trump,
        leader: currentTurn,
        tricksToPlan: remainingTricks,
        sequence: [],
        searchBudget
      });
      if (!runout || runout.reason) {
        return unavailableWithSearchBudget(runout?.reason || "noVisibleTopWinnerRunout", searchBudget);
      }
      if (runout.sequence.length !== remainingTricks) return unavailable("noVisibleTopWinnerRunout");

      const tricksByTeam = runout.sequence.reduce((counts, step) => {
        counts[teamOf(step.winnerSeat)] += 1;
        return counts;
      }, { NS: 0, EW: 0 });

      return {
        available: true,
        ruleId: trump
          ? "deterministicUitspelen.visibleSuitTopWinnersNoRuff"
          : "deterministicUitspelen.visibleNotrumpTopWinners",
        reason: trump ? "visibleSuitTopWinnersNoRuff" : "visibleNotrumpTopWinners",
        remainingTricks,
        trump,
        winningSeats: runout.sequence.map((step) => step.winnerSeat),
        tricksByTeam,
        sequence: runout.sequence
      };
    }

  function searchVisibleNotrumpRunout({ visibleHands, playedCards, proof, trump, leader, tricksToPlan, sequence, searchBudget }) {
      if (!consumeSearchNode(searchBudget)) return { reason: "searchNodeBudgetExhausted" };
      if (tricksToPlan <= 0) return { sequence };

      const branchResult = legalVisibleNotrumpTrickBranches({ visibleHands, playedCards, proof, trump, leader, searchBudget });
      if (branchResult.reason) return { reason: branchResult.reason };
      if (!branchResult.branches.length) return { reason: "noVisibleTopWinnerRunout" };
      const successful = [];
      const failureReasons = [];
      for (const next of branchResult.branches) {
        if (searchBudget.exhausted) {
          failureReasons.push("searchNodeBudgetExhausted");
          break;
        }
        const runout = searchVisibleNotrumpRunout({
          visibleHands: next.visibleHands,
          playedCards: next.playedCards,
          proof: next.proof,
          trump,
          leader: next.winnerSeat,
          tricksToPlan: tricksToPlan - 1,
          sequence: [...sequence, next.step],
          searchBudget
        });
        if (runout?.sequence) successful.push(runout);
        else if (runout?.reason) failureReasons.push(runout.reason);
      }

      if (failureReasons.length) return { reason: preferredFailureReason(failureReasons) || "noVisibleTopWinnerRunout" };
      if (!successful.length) return { reason: "noVisibleTopWinnerRunout" };
      if (!sameWinnerSeatSequence(successful)) return { reason: "ambiguousWinnerSeat" };
      return successful[0];
    }

  function legalVisibleNotrumpTrickBranches({ visibleHands, playedCards, proof, trump, leader, searchBudget }) {
      const order = trickOrder(leader);
      const branches = [];
      const failureReasons = [];

      function walk(index, nextHands, nextPlayed, trickProof, nextProof, visiblePlays, leadSuit) {
        if (!consumeSearchNode(searchBudget)) {
          failureReasons.push("searchNodeBudgetExhausted");
          return;
        }
        if (index >= order.length) {
          const completed = proveCompletedVisibleNotrumpTrick({
            visibleHands: nextHands,
            playedCards: nextPlayed,
            trickProof,
            nextProof,
            trump,
            leader,
            visiblePlays,
            leadSuit
          });
          if (completed?.branch) branches.push(completed.branch);
          else failureReasons.push(completed?.reason || "noVisibleTopWinnerRunout");
          return;
        }

        const seat = order[index];
        const hand = nextHands[seat];
        if (!hand) {
          const hiddenBranches = hiddenProofBranchesForPlay({ trickProof, nextProof, seat, leadSuit });
          if (!hiddenBranches.length) {
            failureReasons.push("noVisibleTopWinnerRunout");
            return;
          }
        for (const branch of hiddenBranches) {
            if (searchBudget.exhausted) break;
            walk(
              index + 1,
              cloneHands(nextHands),
              cloneCards(nextPlayed),
              branch.trickProof,
              branch.nextProof,
              visiblePlays,
              leadSuit
            );
          }
          return;
        }

        const legalCards = legalVisibleCardsForTrick(hand, leadSuit).sort(compareLowCards);
        if (!legalCards.length) {
          failureReasons.push("noVisibleTopWinnerRunout");
          return;
        }

        for (const choice of legalCards) {
          if (searchBudget.exhausted) break;
          const branchHands = cloneHands(nextHands);
          const branchPlayed = cloneCards(nextPlayed);
          const branchTrickProof = cloneProofContext(trickProof);
          const branchProof = cloneProofContext(nextProof);
          const card = removeCard(branchHands[seat], choice);
          if (!card) {
            failureReasons.push("noVisibleTopWinnerRunout");
            continue;
          }
          branchPlayed.push({ ...card });
          branchTrickProof.playedCardIds.add(card.id);
          branchTrickProof.visibleCardIds.delete(card.id);
          branchProof.playedCardIds.add(card.id);
          branchProof.visibleCardIds.delete(card.id);
          walk(
            index + 1,
            branchHands,
            branchPlayed,
            branchTrickProof,
            branchProof,
            [...visiblePlays, { seat, card }],
            leadSuit || card.suit
          );
        }
      }

      walk(0, cloneHands(visibleHands), cloneCards(playedCards), cloneProofContext(proof), cloneProofContext(proof), [], null);

      return {
        branches,
        reason: preferredFailureReason(failureReasons) || (branches.length ? null : "noVisibleTopWinnerRunout")
      };
    }

  function hiddenProofBranchesForPlay({ trickProof, nextProof, seat, leadSuit }) {
      const remaining = nextProof.hiddenRemainingCounts.get(seat) || 0;
      if (remaining <= 0) {
        return [{ trickProof: cloneProofContext(trickProof), nextProof: cloneProofContext(nextProof) }];
      }

      if (!leadSuit) {
        const branchProof = cloneProofContext(nextProof);
        decrementHiddenRemaining(branchProof, seat);
        return [{ trickProof: cloneProofContext(trickProof), nextProof: branchProof }];
      }

      const canFollow = hiddenSeatCanHoldSuit(nextProof, seat, leadSuit);
      const mustFollow = hiddenSeatMustHoldSuit(nextProof, seat, leadSuit);
      const canBeVoid = remaining <= hiddenRemainingNonSuitCapacity(nextProof, seat, leadSuit);
      const branches = [];

      if (canFollow) {
        const followProof = cloneProofContext(nextProof);
        markHiddenSuitPlayed(followProof, seat, leadSuit);
        decrementHiddenRemaining(followProof, seat);
        branches.push({
          trickProof: cloneProofContext(trickProof),
          nextProof: followProof
        });
      }

      if (!mustFollow && canBeVoid) {
        const voidTrickProof = cloneProofContext(trickProof);
        const voidNextProof = cloneProofContext(nextProof);
        markHiddenVoid(voidTrickProof, seat, leadSuit);
        markHiddenVoid(voidNextProof, seat, leadSuit);
        decrementHiddenRemaining(voidNextProof, seat);
        branches.push({
          trickProof: voidTrickProof,
          nextProof: voidNextProof
        });
      }

      return branches;
    }

  function proveCompletedVisibleNotrumpTrick({ visibleHands, playedCards, trickProof, nextProof, trump, leader, visiblePlays, leadSuit }) {
      const leadCard = visiblePlays.find((play) => play.seat === leader)?.card || null;
      if (!leadCard || !visiblePlays.length) return { reason: "noVisibleTopWinnerRunout" };

      const winningPlay = visibleWinningPlay(visiblePlays, leadSuit, trump);
      if (!winningPlay) return { reason: "noVisibleTopWinnerRunout" };

      if (trump && leadSuit !== trump && winningPlay.card.suit === trump) {
        if (hiddenTrumpRuffPossible(trickProof, leadSuit, trump, winningPlay.card.rank)) {
          return { reason: "hiddenTrumpRuff" };
        }
      } else {
        if (hiddenHigherCardPossible(trickProof, leadSuit, winningPlay.card.rank)) {
          return { reason: "hiddenHigherCard" };
        }
        if (hiddenTrumpRuffPossible(trickProof, leadSuit, trump)) {
          return { reason: "hiddenTrumpRuff" };
        }
      }

      const action = winningPlay.card.suit === trump && leadSuit !== trump
        ? "visibleRuff"
        : (winningPlay.seat === leader ? "direct" : "leadToVisibleWinner");
      return {
        branch: {
          visibleHands,
          playedCards,
          proof: nextProof,
          winnerSeat: winningPlay.seat,
          step: {
            action,
            leader,
            winnerSeat: winningPlay.seat,
            leadSuit,
            trump,
            leadCardId: leadCard.id,
            winningCardId: winningPlay.card.id,
            visiblePlays: visiblePlays.map((play) => ({ seat: play.seat, cardId: play.card.id }))
          }
        }
      };
    }

  function visibleTopWinnerCardsForSeat(visibleHands, playedCards, proof, seat) {
      const hand = visibleHands[seat] || [];
      const winners = [];
      let blockedByHiddenHigher = false;
      for (const suit of suits) {
        const result = visibleTopWinnerRanks(
          Object.values(visibleHands).flatMap((cards) => cardsInSuit(cards, suit)),
          cardsInSuit(playedCards, suit),
          proof,
          suit
        );
        const ranks = result.ranks;
        blockedByHiddenHigher = blockedByHiddenHigher || result.blockedByHiddenHigher;
        winners.push(...ranks.map((rank) => hand.find((card) => card.suit === suit && card.rank === rank)).filter(Boolean));
      }
      return { cards: winners, blockedByHiddenHigher };
    }

  function visibleTopWinnerRanks(visibleSuitCards, playedSuitCards = [], proof, suit) {
      const visibleRanks = new Set(visibleSuitCards.map((card) => card.rank));
      const playedRanks = new Set(playedSuitCards.map((card) => card.rank));
      const winners = [];
      for (const rank of [...rankOrder].reverse()) {
        if (visibleRanks.has(rank)) {
          winners.push(rank);
        } else if (!playedRanks.has(rank)) {
          if (rankImpossibleForHiddenSeats(proof, suit, rank)) continue;
          return { ranks: winners, blockedByHiddenHigher: true, blockingRank: rank };
        }
      }
      return { ranks: winners, blockedByHiddenHigher: false };
    }

  function legalVisibleCardsForTrick(hand, leadSuit) {
      if (!leadSuit) return [...hand];
      const followSuit = cardsInSuit(hand, leadSuit);
      return followSuit.length ? followSuit : [...hand];
    }

  function visibleWinningPlay(plays, leadSuit, trump) {
      return (plays || []).reduce((best, play) => {
        if (!best) return play;
        return visiblePlayBeats(play.card, best.card, leadSuit, trump) ? play : best;
      }, null);
    }

  function visiblePlayBeats(card, best, leadSuit, trump) {
      if (trump && card.suit === trump && best.suit !== trump) return true;
      if (trump && best.suit === trump && card.suit !== trump) return false;
      if (card.suit !== best.suit) return false;
      if (card.suit !== leadSuit && (!trump || card.suit !== trump)) return false;
      return rankOrder.indexOf(card.rank) > rankOrder.indexOf(best.rank);
    }

  function hiddenHigherCardPossible(proof, suit, rank) {
      const rankIndex = rankOrder.indexOf(rank);
      return rankOrder
        .slice(rankIndex + 1)
        .some((higherRank) => !rankImpossibleForHiddenSeats(proof, suit, higherRank));
    }

  function hiddenHigherCardPossibleForSeat(proof, seat, suit, rank) {
      const rankIndex = rankOrder.indexOf(rank);
      return rankOrder
        .slice(rankIndex + 1)
        .some((higherRank) => hiddenSeatCanHoldCard(proof, seat, suit, higherRank));
    }

  function hiddenTrumpRuffPossible(proof, leadSuit, trump, overTrumpRank = null) {
      if (!proof || !trump || leadSuit === trump) return false;
      for (const seat of proof.hiddenSeats) {
        if (!proof.hiddenVoids.get(seat)?.has(leadSuit)) continue;
        if (overTrumpRank) {
          if (hiddenHigherCardPossibleForSeat(proof, seat, trump, overTrumpRank)) return true;
        } else if (hiddenSeatCanHoldSuit(proof, seat, trump)) {
          return true;
        }
      }
      return false;
    }

  function visibleProofSeatSet({ visibleSeats, hands, observerSeat, declarer }) {
      const requested = new Set(visibleSeats.filter((seat) => seats.includes(seat) && Array.isArray(hands[seat])));
      if (!declarer || !seats.includes(observerSeat)) return requested;

      const dummy = partnerOf(declarer);
      const allowed = new Set([observerSeat]);
      if (teamOf(observerSeat) === teamOf(declarer)) {
        allowed.add(partnerOf(observerSeat));
      } else {
        allowed.add(dummy);
      }
      return new Set([...requested].filter((seat) => allowed.has(seat)));
    }

  function createProofContext({ hands, visibleSet, playedCards, trickHistory }) {
      const visibleCardIds = new Set(
        [...visibleSet].flatMap((seat) => (hands[seat] || []).map((card) => card.id))
      );
      const playedCardIds = new Set((playedCards || []).map((card) => card.id));
      const hiddenSeats = new Set(seats.filter((seat) => !visibleSet.has(seat)));
      const hiddenVoids = inferHiddenVoids(trickHistory, hiddenSeats);
      const hiddenRemainingCounts = new Map(
        [...hiddenSeats].map((seat) => [seat, (hands[seat] || []).length])
      );
      const hiddenSuitPlayedCounts = new Map(
        [...hiddenSeats].map((seat) => [seat, new Map(suits.map((suit) => [suit, 0]))])
      );

      return {
        visibleCardIds,
        playedCardIds,
        hiddenSeats,
        hiddenVoids,
        hiddenRemainingCounts,
        hiddenSuitPlayedCounts
      };
    }

  function inferHiddenVoids(trickHistory = [], hiddenSeats = new Set()) {
      const voids = new Map([...hiddenSeats].map((seat) => [seat, new Set()]));
      for (const trick of trickHistory || []) {
        const plays = trick.cards || [];
        const leadSuit = plays[0]?.card?.suit;
        if (!leadSuit) continue;
        for (const play of plays) {
          if (!hiddenSeats.has(play.seat) || !play.card || play.card.suit === leadSuit) continue;
          voids.get(play.seat)?.add(leadSuit);
        }
      }
      return voids;
    }

  function rankImpossibleForHiddenSeats(proof, suit, rank) {
      if (!proof) return false;
      const cardId = `${rank}${suit}`;
      if (proof.visibleCardIds.has(cardId) || proof.playedCardIds.has(cardId)) return true;
      for (const seat of proof.hiddenSeats) {
        if (hiddenSeatCanHoldCard(proof, seat, suit, rank)) return false;
      }
      return true;
    }

  function hiddenSeatCanHoldCard(proof, seat, suit, rank) {
      if (!proof.hiddenSeats.has(seat)) return false;
      if ((proof.hiddenRemainingCounts.get(seat) || 0) <= 0) return false;
      if (proof.hiddenVoids.get(seat)?.has(suit)) return false;
      const cardId = `${rank}${suit}`;
      if (proof.visibleCardIds.has(cardId) || proof.playedCardIds.has(cardId)) return false;
      return hiddenRemainingSuitCapacity(proof, seat, suit) > 0;
    }

  function hiddenSeatCanHoldSuit(proof, seat, suit) {
      return (proof.hiddenRemainingCounts.get(seat) || 0) > 0
        && hiddenRemainingSuitCapacity(proof, seat, suit) > 0;
    }

  function hiddenSeatMustHoldSuit(proof, seat, suit) {
      const remaining = proof.hiddenRemainingCounts.get(seat) || 0;
      if (remaining <= 0 || !hiddenSeatCanHoldSuit(proof, seat, suit)) return false;
      return remaining > hiddenRemainingNonSuitCapacity(proof, seat, suit);
    }

  function hiddenRemainingSuitCapacity(proof, seat, suit) {
      if (!proof.hiddenSeats.has(seat) || proof.hiddenVoids.get(seat)?.has(suit)) return 0;
      const unseenSuitCards = rankOrder.filter((rank) => {
        const cardId = `${rank}${suit}`;
        return !proof.visibleCardIds.has(cardId) && !proof.playedCardIds.has(cardId);
      }).length;
      const alreadyPlayedInSearch = proof.hiddenSuitPlayedCounts.get(seat)?.get(suit) || 0;
      return Math.max(0, unseenSuitCards - alreadyPlayedInSearch);
    }

  function hiddenRemainingNonSuitCapacity(proof, seat, excludedSuit) {
      return suits
        .filter((suit) => suit !== excludedSuit)
        .reduce((sum, suit) => sum + hiddenRemainingSuitCapacity(proof, seat, suit), 0);
    }

  function cloneProofContext(proof) {
      return {
        visibleCardIds: new Set(proof.visibleCardIds),
        playedCardIds: new Set(proof.playedCardIds),
        hiddenSeats: new Set(proof.hiddenSeats),
        hiddenVoids: new Map([...proof.hiddenVoids].map(([seat, voids]) => [seat, new Set(voids)])),
        hiddenRemainingCounts: new Map(proof.hiddenRemainingCounts),
        hiddenSuitPlayedCounts: new Map([...proof.hiddenSuitPlayedCounts].map(([seat, counts]) => [
          seat,
          new Map(counts)
        ]))
      };
    }

  function decrementHiddenRemaining(proof, seat) {
      if (!proof.hiddenSeats.has(seat)) return;
      proof.hiddenRemainingCounts.set(seat, Math.max(0, (proof.hiddenRemainingCounts.get(seat) || 0) - 1));
    }

  function markHiddenSuitPlayed(proof, seat, suit) {
      if (!proof.hiddenSeats.has(seat)) return;
      const counts = proof.hiddenSuitPlayedCounts.get(seat);
      if (!counts) return;
      counts.set(suit, (counts.get(suit) || 0) + 1);
    }

  function markHiddenVoid(proof, seat, suit) {
      if (!proof.hiddenSeats.has(seat)) return;
      if (!proof.hiddenVoids.has(seat)) proof.hiddenVoids.set(seat, new Set());
      proof.hiddenVoids.get(seat).add(suit);
    }

  function preferredFailureReason(reasons) {
      if (reasons.includes("searchNodeBudgetExhausted")) return "searchNodeBudgetExhausted";
      if (reasons.includes("ambiguousWinnerSeat")) return "ambiguousWinnerSeat";
      if (reasons.includes("hiddenTrumpRuff")) return "hiddenTrumpRuff";
      if (reasons.includes("hiddenHigherCard")) return "hiddenHigherCard";
      return reasons[0] || null;
    }

  function sameWinnerSeatSequence(runouts) {
      const first = runouts[0]?.sequence?.map((step) => step.winnerSeat).join("|");
      return runouts.every((runout) => runout.sequence.map((step) => step.winnerSeat).join("|") === first);
    }

  function trickOrder(leader) {
      const start = seats.indexOf(leader);
      return seats.map((_, index) => seats[(start + index) % seats.length]);
    }

  function playedCardsFrom(trickHistory = [], currentTrick = []) {
      return [
        ...trickHistory.flatMap((trick) => trick.cards || []).map((play) => play.card),
        ...currentTrick.map((play) => play.card)
      ].filter(Boolean).map((card) => ({ ...card }));
    }

  function cardsInSuit(cards, suit) {
      return (cards || []).filter((card) => card.suit === suit);
    }

  function cloneHands(hands) {
      return Object.fromEntries(Object.entries(hands).map(([seat, hand]) => [seat, cloneCards(hand)]));
    }

  function cloneCards(cards) {
      return (cards || []).map((card) => ({ ...card }));
    }

  function removeCard(hand, card) {
      const index = hand.findIndex((item) => item.id === card.id);
      if (index < 0) return null;
      return hand.splice(index, 1)[0];
    }

  function createSearchBudget(nodeBudget) {
      const limit = Number.isFinite(nodeBudget)
        ? Math.max(0, Math.floor(nodeBudget))
        : DEFAULT_SEARCH_NODE_BUDGET;
      return {
        limit,
        used: 0,
        exhausted: false
      };
    }

  function consumeSearchNode(searchBudget) {
      if (!searchBudget) return true;
      if (searchBudget.used >= searchBudget.limit) {
        searchBudget.exhausted = true;
        return false;
      }
      searchBudget.used += 1;
      return true;
    }

  function unavailableWithSearchBudget(reason, searchBudget) {
      if (reason !== "searchNodeBudgetExhausted") return unavailable(reason);
      return unavailable(reason, {
        nodeBudget: {
          limit: searchBudget.limit,
          used: searchBudget.used
        }
      });
    }

  function unavailable(reason, details = {}) {
      return {
        available: false,
        reason,
        ...details
      };
    }

  return {
    analyzeVisibleUitspelen,
    analyzeVisibleNotrumpUitspelen
  };
});

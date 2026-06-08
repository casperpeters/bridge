(function initBridgeRulesMiniEndPositionSolver(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const deps = isCommonJs
    ? {
        core: require("./core.js"),
        playMechanics: require("./play-mechanics.js")
      }
    : root.BridgeRulesParts || {};
  const api = factory(deps.core, deps.playMechanics);
  if (isCommonJs) module.exports = api;
  root.BridgeRulesParts = root.BridgeRulesParts || {};
  root.BridgeRulesParts.miniEndPositionSolver = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesMiniEndPositionSolver(core, playMechanics) {
  "use strict";

  if (!core) throw new Error("BridgeRules mini-end-position solver missing core dependency");
  if (!playMechanics) throw new Error("BridgeRules mini-end-position solver missing play-mechanics dependency");

  const { compareCards, rankOrder, seats, suits, teamOf } = core;
  const { currentWinningPlay, legalCards } = playMechanics;
  const maxCardsPerSeat = 7;

  function analyzeMiniEndPosition({
    hands = {},
    trump = null,
    leader = "South",
    playerSeat = "South"
  } = {}) {
    if (playerSeat !== "South") throw new Error("Mini end-position exercises currently require South as player");
    const normalized = normalizeMiniHands(hands);
    const normalizedTrump = normalizeTrump(trump);
    if (!seats.includes(leader)) throw new Error(`Invalid mini end-position leader: ${leader}`);
    if (!normalized[leader]?.length) throw new Error("Mini end-position leader has no cards");

    const startCards = legalCards(normalized[playerSeat], []).sort(compareCards);
    const results = startCards.map((card) => solveAfterForcedCard(normalized, leader, playerSeat, card, normalizedTrump));
    const maxSouthTricks = Math.max(...results.map((result) => result.southTricks));
    const optimalCardIds = results
      .filter((result) => result.southTricks === maxSouthTricks)
      .map((result) => result.cardId);

    return {
      maxSouthTricks,
      optimalCardIds,
      results,
      line: results.find((result) => result.cardId === optimalCardIds[0])?.line || []
    };
  }

  function solveAfterForcedCard(hands, leader, playerSeat, card, trump) {
    if (leader !== playerSeat) throw new Error("Mini end-position first decision must be South's turn");
    const solver = createSolver({ trump, playerSeat });
    const nextHands = cloneHands(hands);
    const forced = removeCard(nextHands[playerSeat], card.id);
    const state = solver.solveTrick({
      hands: nextHands,
      order: trickOrder(leader),
      index: 1,
      currentTrick: [{ seat: playerSeat, card: forced }]
    });
    return {
      cardId: card.id,
      southTricks: state.score,
      line: state.line
    };
  }

  function createSolver({ trump, playerSeat }) {
    const cache = new Map();

    function solveState(hands, leader) {
      const remaining = hands[leader]?.length || 0;
      if (remaining <= 0) return { score: 0, line: [] };
      const key = stateKey(hands, leader);
      if (cache.has(key)) return cloneSolved(cache.get(key));
      const solved = solveTrick({
        hands,
        order: trickOrder(leader),
        index: 0,
        currentTrick: []
      });
      cache.set(key, cloneSolved(solved));
      return solved;
    }

    function solveTrick({ hands, order, index, currentTrick }) {
      if (index >= order.length) {
        const winner = currentWinningPlay(currentTrick, trump)?.seat;
        if (!winner) throw new Error("Mini end-position trick has no winner");
        const next = solveState(hands, winner);
        const trick = {
          leader: order[0],
          winner,
          cards: currentTrick.map((play) => ({ seat: play.seat, cardId: play.card.id }))
        };
        return {
          score: (winner === playerSeat ? 1 : 0) + next.score,
          line: [trick, ...next.line]
        };
      }

      const seat = order[index];
      const choices = legalCards(hands[seat] || [], currentTrick).sort(compareCards);
      if (!choices.length) throw new Error(`Mini end-position ${seat} has no legal cards`);
      const maximizing = teamOf(seat) === teamOf(playerSeat);
      let best = null;
      for (const choice of choices) {
        const nextHands = cloneHands(hands);
        const card = removeCard(nextHands[seat], choice.id);
        const candidate = solveTrick({
          hands: nextHands,
          order,
          index: index + 1,
          currentTrick: [...currentTrick, { seat, card }]
        });
        if (!best || (maximizing ? candidate.score > best.score : candidate.score < best.score)) {
          best = candidate;
        }
      }
      return best;
    }

    return {
      solveTrick
    };
  }

  function normalizeMiniHands(hands) {
    const normalized = {};
    const seen = new Set();
    let length = null;
    for (const seat of seats) {
      const cards = normalizeCardList(hands[seat] || []);
      if (length === null) length = cards.length;
      if (cards.length !== length) throw new Error("Mini end-position hands must have equal lengths");
      if (cards.length < 1 || cards.length > maxCardsPerSeat) {
        throw new Error(`Mini end-position hands must contain 1-${maxCardsPerSeat} cards per seat`);
      }
      normalized[seat] = cards.sort(compareCards);
      for (const card of normalized[seat]) {
        if (seen.has(card.id)) throw new Error(`Mini end-position contains duplicate card ${card.id}`);
        seen.add(card.id);
      }
    }
    return normalized;
  }

  function normalizeCardList(cards) {
    if (!Array.isArray(cards)) throw new Error("Mini end-position hand must be an array");
    return cards.map(cardFromRef);
  }

  function cardFromRef(ref) {
    const id = typeof ref === "string" ? normalizeCardId(ref) : normalizeCardId(ref?.id);
    return {
      id,
      rank: id.slice(0, -1),
      suit: id.slice(-1)
    };
  }

  function normalizeCardId(value) {
    const id = String(value || "").trim().toUpperCase().replace(/^10/, "T");
    if (!/^(?:[2-9TJQKA])(?:C|D|H|S)$/.test(id)) throw new Error(`Invalid mini end-position card: ${value}`);
    return id;
  }

  function normalizeTrump(value) {
    if (value === null) return null;
    const trump = String(value || "").trim().toUpperCase();
    if (trump === "NT" || trump === "SA" || trump === "NONE") return null;
    if (!suits.includes(trump)) throw new Error(`Invalid mini end-position trump: ${value}`);
    return trump;
  }

  function solveMiniEndPosition(options = {}) {
    const source = options.situation || options;
    const analyzed = analyzeMiniEndPosition({
      hands: source.hands,
      trump: source.trump,
      leader: source.nextToPlay || source.currentTurn || source.leader || "South",
      playerSeat: "South"
    });
    const maximum = analyzed.maxSouthTricks;
    const optimalStartCards = analyzed.optimalCardIds.slice();
    const results = analyzed.results.map((result) => {
      const tricks = normalizeSolvedTricks(result.line);
      return {
        card: cardFromRef(result.cardId),
        cardId: result.cardId,
        southTricks: result.southTricks,
        optimal: result.southTricks === maximum,
        line: flattenTrickLine(tricks),
        tricks
      };
    });
    const resultsByStartCard = Object.fromEntries(results.map((result) => [result.cardId, result]));
    const requestedCardId = normalizeOptionalCardId(options.chosenStartCardId || options.startCardId);
    const chosenStartCardId = requestedCardId && resultsByStartCard[requestedCardId]
      ? requestedCardId
      : optimalStartCards[0];
    const chosenResult = resultsByStartCard[chosenStartCardId];

    return {
      maximum,
      optimalStartCards,
      results,
      resultsByStartCard,
      chosenStartCardId,
      chosenIsOptimal: Boolean(chosenResult?.optimal),
      line: chosenResult?.line || [],
      tricks: chosenResult?.tricks || [],
      trump: normalizeTrump(source.trump),
      maxSouthTricks: maximum,
      optimalCardIds: optimalStartCards
    };
  }

  function normalizeSolvedTricks(line = []) {
    return line.map((trick) => {
      const plays = (trick.cards || []).map((play) => ({
        seat: play.seat,
        cardId: normalizeCardId(play.cardId)
      }));
      return {
        leader: trick.leader,
        leadSuit: cardFromRef(plays[0]?.cardId).suit,
        winnerSeat: trick.winner,
        southWins: trick.winner === "South",
        plays
      };
    });
  }

  function flattenTrickLine(tricks = []) {
    return tricks.flatMap((trick) => trick.plays.map((play) => ({ ...play })));
  }

  function normalizeOptionalCardId(value) {
    if (value === null || value === undefined || value === "") return null;
    return normalizeCardId(value);
  }

  function trickOrder(leader) {
    const start = seats.indexOf(leader);
    return seats.map((_, index) => seats[(start + index) % seats.length]);
  }

  function cloneHands(hands) {
    return Object.fromEntries(seats.map((seat) => [seat, (hands[seat] || []).map((card) => ({ ...card }))]));
  }

  function removeCard(hand, cardId) {
    const index = hand.findIndex((card) => card.id === cardId);
    if (index < 0) throw new Error(`Mini end-position missing card ${cardId}`);
    return hand.splice(index, 1)[0];
  }

  function stateKey(hands, leader) {
    return [
      leader,
      ...seats.map((seat) => `${seat}:${(hands[seat] || []).map((card) => card.id).sort().join(",")}`)
    ].join("|");
  }

  function cloneSolved(solved) {
    return {
      score: solved.score,
      line: solved.line.map((trick) => ({
        ...trick,
        cards: trick.cards.map((play) => ({ ...play }))
      }))
    };
  }

  return {
    analyzeMiniEndPosition,
    solveMiniEndPosition,
    normalizeMiniHands
  };
});

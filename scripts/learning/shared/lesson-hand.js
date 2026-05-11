(function initBridgeLessonHand(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.BridgeLessonHand = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeLessonHand() {
  "use strict";

  const suits = Object.freeze(["S", "H", "D", "C"]);
  const suitSymbols = Object.freeze({ S: "\u2660", H: "\u2665", D: "\u2666", C: "\u2663" });
  const suitNames = Object.freeze({ S: "schoppen", H: "harten", D: "ruiten", C: "klaveren" });
  const rankOrder = Object.freeze(["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"]);
  const descendingRanks = Object.freeze([...rankOrder].reverse());
  const rankLabel = Object.freeze({ T: "10", J: "J", Q: "Q", K: "K", A: "A" });
  const hcpValue = Object.freeze({ A: 4, K: 3, Q: 2, J: 1 });
  const balancedPatterns = new Set(["4-3-3-3", "4-4-3-2", "5-3-3-2"]);

  function parseHand(text) {
    return sortCards(String(text || "").trim().split(/\s+/).filter(Boolean).map(parseCard));
  }

  function parseCard(token) {
    const text = String(token || "").trim();
    const suit = text.slice(-1).toUpperCase();
    const rank = normalizeRank(text.slice(0, -1));
    return { rank, suit, id: `${rank}${suit}` };
  }

  function normalizeCard(card) {
    if (!card) return { rank: "", suit: "", id: "" };
    if (card.rank && card.suit) {
      const rank = normalizeRank(card.rank);
      const suit = String(card.suit || "").toUpperCase();
      return { ...card, rank, suit, id: card.id || `${rank}${suit}` };
    }
    if (card.id) return parseCard(card.id);
    return parseCard(card);
  }

  function normalizeRank(rank) {
    const value = String(rank || "").trim().toUpperCase();
    return value === "10" ? "T" : value;
  }

  function rankText(rank) {
    const normalized = normalizeRank(rank);
    return rankLabel[normalized] || normalized;
  }

  function suitSymbol(suit) {
    const normalized = String(suit || "").toUpperCase();
    return suitSymbols[normalized] || normalized;
  }

  function suitName(suit) {
    const normalized = String(suit || "").toUpperCase();
    return suitNames[normalized] || normalized;
  }

  function cardText(card, options = {}) {
    const normalized = normalizeCard(card);
    const label = rankText(normalized.rank);
    return options.includeSuit === false ? label : `${label}${suitSymbol(normalized.suit)}`;
  }

  function isRedSuit(suit) {
    const normalized = String(suit || "").toUpperCase();
    return normalized === "H" || normalized === "D";
  }

  function sortCards(cards) {
    return [...(cards || [])].sort((a, b) => {
      const left = normalizeCard(a);
      const right = normalizeCard(b);
      const suitDiff = suits.indexOf(left.suit) - suits.indexOf(right.suit);
      if (suitDiff) return suitDiff;
      return descendingRanks.indexOf(left.rank) - descendingRanks.indexOf(right.rank);
    });
  }

  function createDeck(options = {}) {
    const deck = [];
    const deckSuits = options.suits || suits;
    const deckRanks = options.ranks || rankOrder;
    deckSuits.forEach((suit) => {
      deckRanks.forEach((rank) => {
        const normalizedRank = normalizeRank(rank);
        const normalizedSuit = String(suit || "").toUpperCase();
        deck.push({ rank: normalizedRank, suit: normalizedSuit, id: `${normalizedRank}${normalizedSuit}` });
      });
    });
    return deck;
  }

  function shuffledDeck(random = Math.random, options = {}) {
    const deck = createDeck(options);
    for (let index = deck.length - 1; index > 0; index -= 1) {
      const next = typeof random === "function" ? random() : Math.random();
      const swapIndex = Math.floor(next * (index + 1));
      [deck[index], deck[swapIndex]] = [deck[swapIndex], deck[index]];
    }
    return deck;
  }

  function hcp(cards) {
    return (cards || []).reduce((sum, card) => sum + (hcpValue[normalizeCard(card).rank] || 0), 0);
  }

  function countSuits(cards) {
    return suits.reduce((counts, suit) => {
      counts[suit] = (cards || []).filter((card) => normalizeCard(card).suit === suit).length;
      return counts;
    }, {});
  }

  function distributionPattern(cards) {
    return Object.values(countSuits(cards)).sort((a, b) => b - a).join("-");
  }

  function isBalanced(cards) {
    return balancedPatterns.has(distributionPattern(cards));
  }

  function longestSuits(cards) {
    const counts = countSuits(cards);
    const max = Math.max(...Object.values(counts));
    return suits.filter((suit) => counts[suit] === max);
  }

  function longestSuitText(cards, options = {}) {
    const counts = countSuits(cards);
    const separator = options.separator || " en ";
    return longestSuits(cards)
      .map((suit) => options.includeCounts ? `${suitName(suit)} (${counts[suit]})` : suitName(suit))
      .join(separator);
  }

  function suitLengthsText(cards) {
    const counts = countSuits(cards);
    return suits.map((suit) => `${suitSymbol(suit)} ${counts[suit]}`).join(", ");
  }

  function shortSuits(cards) {
    const counts = countSuits(cards);
    return suits
      .filter((suit) => counts[suit] <= 2)
      .map((suit) => {
        const length = counts[suit];
        const label = length === 0 ? "renonce" : length === 1 ? "singleton" : "doubleton";
        return `${label} ${suitName(suit)}`;
      });
  }

  function ruleOf20Score(cards) {
    const points = hcp(cards);
    const longest = Object.values(countSuits(cards)).sort((a, b) => b - a).slice(0, 2);
    return points + longest[0] + longest[1];
  }

  return {
    cardText,
    countSuits,
    createDeck,
    descendingRanks,
    distributionPattern,
    hcp,
    hcpValue,
    isBalanced,
    isRedSuit,
    longestSuitText,
    longestSuits,
    normalizeCard,
    normalizeRank,
    parseCard,
    parseHand,
    rankLabel,
    rankOrder,
    rankText,
    ruleOf20Score,
    shortSuits,
    shuffledDeck,
    sortCards,
    suitLengthsText,
    suitName,
    suitNames,
    suitSymbol,
    suitSymbols,
    suits
  };
});

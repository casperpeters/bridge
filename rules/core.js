(function initBridgeRulesCore(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.BridgeRulesParts = root.BridgeRulesParts || {};
  root.BridgeRulesParts.core = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesCore() {
  "use strict";

  const seats = ["North", "East", "South", "West"];
  const suits = ["C", "D", "H", "S"];
  const handSuitOrder = ["S", "H", "C", "D"];
  const bidStrains = ["C", "D", "H", "S", "NT"];
  const rankOrder = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"];
  const descendingRanks = [...rankOrder].reverse();
  const leadHonorRanks = ["A", "K", "Q", "J", "T"];
  const hcpValue = { A: 4, K: 3, Q: 2, J: 1 };
  const biddingSystems = {
    fiveCardHigh: {
      id: "fiveCardHigh",
      name: "Vijfkaart Hoog",
      conventionDefaults: {
        stayman: true,
        transfers: true,
        weakTwoOpenings: true
      }
    }
  };
  const vulnerabilityCycle = [
    "none", "NS", "EW", "both",
    "NS", "EW", "both", "none",
    "EW", "both", "none", "NS",
    "both", "none", "NS", "EW"
  ];

  function positiveIndex(number, length) {
        return ((number % length) + length) % length;
      }

  function vulnerabilityForDeal(dealNumber) {
        return vulnerabilityCycle[positiveIndex(dealNumber - 1, vulnerabilityCycle.length)];
      }

  function dealerIndexForDeal(dealNumber) {
        return positiveIndex(dealNumber - 1, seats.length);
      }

  function teamOf(seat) {
        return seat === "North" || seat === "South" ? "NS" : "EW";
      }

  function isTeamVulnerable(team, vulnerability) {
        return vulnerability === "both" || vulnerability === team;
      }

  function compareCards(a, b) {
        const suitDiff = handSuitOrder.indexOf(a.suit) - handSuitOrder.indexOf(b.suit);
        if (suitDiff) return suitDiff;
        return rankOrder.indexOf(b.rank) - rankOrder.indexOf(a.rank);
      }

  function createDeck() {
        const deck = [];
        for (const suit of suits) {
          for (const rank of rankOrder) {
            deck.push({ suit, rank, id: `${rank}${suit}` });
          }
        }
        return deck;
      }

  function hashSeed(seed) {
        const text = String(seed);
        let hash = 2166136261;
        for (let i = 0; i < text.length; i++) {
          hash ^= text.charCodeAt(i);
          hash = Math.imul(hash, 16777619);
        }
        return hash >>> 0;
      }

  function randomFromSeed(seed) {
        let value = hashSeed(seed) || 1;
        return function seededRandom() {
          value += 0x6D2B79F5;
          let next = value;
          next = Math.imul(next ^ (next >>> 15), next | 1);
          next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
          return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
        };
      }

  function dealHands(random = Math.random) {
        const deck = createDeck();
        for (let i = deck.length - 1; i > 0; i--) {
          const j = Math.floor(random() * (i + 1));
          [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        const hands = { North: [], East: [], South: [], West: [] };
        deck.forEach((card, index) => hands[seats[index % seats.length]].push(card));
        for (const seat of seats) hands[seat].sort(compareCards);
        return hands;
      }

  function compareLowCards(a, b) {
        const rankDiff = rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank);
        if (rankDiff) return rankDiff;
        return suits.indexOf(a.suit) - suits.indexOf(b.suit);
      }

  function lowestCard(cards) {
        return [...cards].sort(compareLowCards)[0] || null;
      }

  function highestCard(cards) {
        return [...cards].sort((a, b) => -compareLowCards(a, b))[0] || null;
      }

  function countSuits(hand) {
        return suits.reduce((counts, suit) => {
          counts[suit] = hand.filter((card) => card.suit === suit).length;
          return counts;
        }, {});
      }

  function longestSuitForLead(hand) {
        const suitCounts = countSuits(hand);
        return suits.reduce((best, suit) => suitCounts[suit] > suitCounts[best] ? suit : best, "C");
      }

  function isLeadHonorRank(rank) {
        return leadHonorRanks.includes(rank);
      }

  function isLowLeadCard(card) {
        return Boolean(card && !isLeadHonorRank(card.rank));
      }

  function partnerOf(seat) {
        return seat === "North" ? "South" : seat === "South" ? "North" : seat === "East" ? "West" : "East";
      }

  function hcp(hand) {
        return hand.reduce((sum, card) => sum + (hcpValue[card.rank] || 0), 0);
      }

  function distributionPointsFromCounts(counts) {
        return Object.values(counts).reduce((sum, count) => sum + (count === 0 ? 3 : count === 1 ? 2 : count === 2 ? 1 : 0), 0);
      }

  function fitPoints(hand, trumpSuit, partnerMinTrumpLength = 0) {
        if (!trumpSuit || trumpSuit === "NT") return hcp(hand);

        const counts = countSuits(hand);
        const highCardPoints = hcp(hand);
        const ownTrumpLength = counts[trumpSuit] || 0;
        const combinedTrumpLength = ownTrumpLength + Math.max(0, partnerMinTrumpLength || 0);
        const hasSideShortness = suits.some((suit) => suit !== trumpSuit && counts[suit] <= 1);
        let total = highCardPoints;

        if (combinedTrumpLength >= 9) total += 1;
        if (combinedTrumpLength >= 10 && hasSideShortness) total += 1;
        if (combinedTrumpLength > 10) total += combinedTrumpLength - 10;

        for (const suit of suits) {
          if (suit === trumpSuit) continue;
          const suitCards = hand.filter((card) => card.suit === suit);
          const length = suitCards.length;
          const ranks = suitCards.map((card) => card.rank);
          if (length === 0) total += 3;
          if (length === 1) {
            if (ranks[0] === "J") total += 1;
            else if (ranks[0] !== "K" && ranks[0] !== "Q") total += 2;
          }
          if (length === 2) {
            const hasQueen = ranks.includes("Q");
            const hasJack = ranks.includes("J");
            const hasAceOrKing = ranks.includes("A") || ranks.includes("K");
            if (!((hasQueen || hasJack) && !hasAceOrKing)) total += 1;
          }
        }

        return total;
      }

  function isBalancedCounts(counts) {
        const pattern = Object.values(counts).sort((a, b) => b - a).join("-");
        return pattern === "4-3-3-3" || pattern === "4-4-3-2" || pattern === "5-3-3-2";
      }

  function handShape(hand) {
        const counts = countSuits(hand);
        const highCardPoints = hcp(hand);
        return {
          counts,
          hcp: highCardPoints,
          points: highCardPoints + distributionPointsFromCounts(counts),
          balanced: isBalancedCounts(counts)
        };
      }

  return {
    seats,
    suits,
    handSuitOrder,
    bidStrains,
    rankOrder,
    descendingRanks,
    leadHonorRanks,
    hcpValue,
    biddingSystems,
    vulnerabilityCycle,
    positiveIndex,
    vulnerabilityForDeal,
    dealerIndexForDeal,
    teamOf,
    isTeamVulnerable,
    compareCards,
    createDeck,
    hashSeed,
    randomFromSeed,
    dealHands,
    compareLowCards,
    lowestCard,
    highestCard,
    countSuits,
    longestSuitForLead,
    isLeadHonorRank,
    isLowLeadCard,
    partnerOf,
    hcp,
    distributionPointsFromCounts,
    fitPoints,
    isBalancedCounts,
    handShape
  };
});

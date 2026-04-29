(function initPracticeHands(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const bridgeRules = isCommonJs ? require("../bridge-rules.js") : root.BridgeRules;
  const collections = isCommonJs
    ? {
        fiveCardHighOpenings: require("./five-card-high-openings.js"),
        notrumpResponses: require("./notrump-responses.js"),
        basicPlayPlan: require("./play-plan-basic.js"),
        basicDefense: require("./defense-basic.js"),
        basicScoring: require("./scoring-basic.js")
      }
    : root.PracticeHandCollections || {};
  const api = factory(bridgeRules, collections);
  if (isCommonJs) module.exports = api;
  root.PracticeHands = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createPracticeHands(bridgeRules, collections) {
  "use strict";

  const seats = ["North", "East", "South", "West"];
  const seatAliases = {
    N: "North",
    NORTH: "North",
    NOORD: "North",
    E: "East",
    EAST: "East",
    OOST: "East",
    S: "South",
    SOUTH: "South",
    ZUID: "South",
    W: "West",
    WEST: "West"
  };
  const vulnerabilities = new Set(["none", "NS", "EW", "both"]);
  const rankOrder = bridgeRules?.rankOrder || ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"];
  const suits = bridgeRules?.suits || ["C", "D", "H", "S"];
  const deckIds = new Set((bridgeRules?.createDeck?.() || []).map((card) => card.id));

  const collectionOrder = [
    "fiveCardHighOpenings",
    "notrumpResponses",
    "basicPlayPlan",
    "basicDefense",
    "basicScoring"
  ];
  const allPracticeHands = collectionOrder.flatMap((name) => collections[name] || []);
  const beginnerHands = allPracticeHands.filter((scenario) => scenario.level === "beginner");
  const handsById = new Map();

  for (const scenario of allPracticeHands) {
    if (!scenario?.id) throw new Error("Practice hand is missing an id");
    if (handsById.has(scenario.id)) throw new Error(`Duplicate practice hand id: ${scenario.id}`);
    handsById.set(scenario.id, scenario);
  }

  validatePracticeHands();

  function findPracticeHand(id) {
    return handsById.get(String(id || "").trim()) || null;
  }

  function preparePracticeHand(scenarioOrId) {
    const scenario = typeof scenarioOrId === "string" ? findPracticeHand(scenarioOrId) : scenarioOrId;
    if (!scenario) throw new Error(`Unknown practice hand: ${scenarioOrId}`);

    const prepared = cloneScenario(scenario);
    prepared.dealer = normalizeSeat(prepared.dealer);
    if (!vulnerabilities.has(prepared.vulnerability)) {
      throw new Error(`Practice hand ${prepared.id} has invalid vulnerability: ${prepared.vulnerability}`);
    }
    prepared.hands = normalizeHands(prepared.id, prepared.hands);
    return prepared;
  }

  function normalizeHands(scenarioId, hands) {
    const seen = new Set();
    const normalized = {};

    for (const seat of seats) {
      const ids = hands?.[seat];
      if (!Array.isArray(ids) || ids.length !== 13) {
        throw new Error(`Practice hand ${scenarioId} must contain 13 cards for ${seat}`);
      }
      normalized[seat] = ids.map((id) => {
        const card = cardFromId(id);
        if (seen.has(card.id)) throw new Error(`Practice hand ${scenarioId} contains duplicate card ${card.id}`);
        seen.add(card.id);
        return card;
      }).sort(compareCards);
    }

    if (seen.size !== 52) throw new Error(`Practice hand ${scenarioId} must contain exactly 52 unique cards`);
    return normalized;
  }

  function cardFromId(id) {
    const normalized = normalizeCardId(id);
    return {
      id: normalized,
      rank: normalized.slice(0, -1),
      suit: normalized.slice(-1)
    };
  }

  function normalizeCardId(id) {
    const normalized = String(id || "").trim().toUpperCase().replace(/^10/, "T");
    const rank = normalized.slice(0, -1);
    const suit = normalized.slice(-1);
    const validByParts = rankOrder.includes(rank) && suits.includes(suit);
    const validByDeck = deckIds.size === 0 || deckIds.has(normalized);
    if (!validByParts || !validByDeck) throw new Error(`Invalid card id: ${id}`);
    return normalized;
  }

  function normalizeSeat(seat) {
    const normalized = seatAliases[String(seat || "").trim().toUpperCase()];
    if (!normalized) throw new Error(`Invalid seat: ${seat}`);
    return normalized;
  }

  function callFromText(text) {
    const call = normalizeCallText(text);
    if (call === "PASS") return bridgeRules.Pass();
    if (call === "DOUBLE") return bridgeRules.Double();
    if (call === "REDOUBLE") return bridgeRules.Redouble();

    const match = call.match(/^([1-7])(C|D|H|S|NT)$/);
    if (!match) throw new Error(`Invalid call: ${text}`);
    return bridgeRules.Bid(Number(match[1]), match[2]);
  }

  function contractFromText(text) {
    const call = callFromText(text);
    if (!bridgeRules.isContractBid(call)) throw new Error(`Practice contract must be a bid: ${text}`);
    return call;
  }

  function normalizeCallText(text) {
    const call = String(text || "").trim().toUpperCase().replace(/\s+/g, "");
    if (call === "P" || call === "PAS") return "PASS";
    if (call === "X" || call === "DBL") return "DOUBLE";
    if (call === "XX" || call === "RDBL") return "REDOUBLE";
    return call.replace("SA", "NT");
  }

  function validatePracticeHands() {
    allPracticeHands.forEach(preparePracticeHand);
    return allPracticeHands.length;
  }

  function cloneScenario(scenario) {
    return JSON.parse(JSON.stringify(scenario));
  }

  function compareCards(a, b) {
    return bridgeRules?.compareCards ? bridgeRules.compareCards(a, b) : 0;
  }

  return {
    allPracticeHands,
    beginnerHands,
    collections,
    findPracticeHand,
    preparePracticeHand,
    validatePracticeHands,
    cardFromId,
    normalizeCardId,
    normalizeSeat,
    callFromText,
    contractFromText
  };
});

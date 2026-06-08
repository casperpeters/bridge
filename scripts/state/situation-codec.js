(function initBridgeSituationCodec(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const api = factory();
  if (isCommonJs) module.exports = api;
  root.BridgeSituationCodec = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeSituationCodec() {
  "use strict";

  const situationSeedPrefixes = ["situatieseed:", "situatie:", "situation:"];
  const supportedVersions = new Set([1, 2]);
  const maxSeedLength = 5000;
  const seats = ["North", "East", "South", "West"];
  const seatCodes = ["N", "E", "S", "W"];
  const suits = ["C", "D", "H", "S"];
  const rankOrder = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"];
  const validSeats = new Set(["N", "NORTH", "NOORD", "E", "EAST", "OOST", "S", "SOUTH", "ZUID", "W", "WEST"]);
  const validVulnerabilities = new Set(["none", "NS", "EW", "both"]);
  const validPhases = new Set(["idle", "bidding", "contract-reveal", "playing", "complete"]);
  const validMiniPhases = new Set(["contract-reveal", "playing", "complete"]);
  const validCallPattern = /^(?:P|PASS|PAS|X|DOUBLE|DBL|XX|REDOUBLE|RDBL|[1-7](?:C|D|H|S|NT|SA))$/;
  const validContractPattern = /^[1-7](?:C|D|H|S|NT|SA)(?:XX|X)?$/;
  const validCardPattern = /^(?:10|[2-9TJQKA])(?:C|D|H|S)$/;

  function normalizeSeed(seed) {
    return String(seed || "").trim().slice(0, maxSeedLength);
  }

  function isSituationSeed(seed) {
    return Boolean(situationSeedPrefix(seed));
  }

  function encodeSituationPayload(payload) {
    validateSituationPayload(payload);
    return `${situationSeedPrefixes[0]}${base64UrlEncode(JSON.stringify(payload))}`;
  }

  function parseSituationSeed(seed) {
    const normalized = normalizeSeed(seed);
    const prefix = situationSeedPrefix(normalized);
    if (!prefix) return null;
    const payloadText = base64UrlDecode(normalized.slice(prefix.length));
    const payload = JSON.parse(payloadText);
    validateSituationPayload(payload);
    return payload;
  }

  function validateSituationPayload(payload) {
    assertPlainObject(payload, "Situation seed payload must be an object");
    if (!supportedVersions.has(payload.v)) throw new Error("Unsupported situation seed version");
    if (payload.v === 1 && (payload.s === null || payload.s === undefined || String(payload.s) === "")) {
      throw new Error("Situation seed is missing the base seed");
    }
    if (payload.v === 2) validateEmbeddedMiniPayload(payload);
    if (Object.prototype.hasOwnProperty.call(payload, "b") && payload.b !== null && payload.b !== undefined) {
      const board = Number(payload.b);
      if (!Number.isInteger(board) || board < 1) throw new Error("Situation board must be a positive integer");
    }
    validateOptionalSeat(payload.d, "dealer");
    validateOptionalSeat(payload.t, "turn");
    if (payload.u !== undefined && payload.u !== null && payload.u !== "" && !validVulnerabilities.has(payload.u)) {
      throw new Error("Situation vulnerability is invalid");
    }
    if (payload.p !== undefined && payload.p !== null && payload.p !== "" && !validPhases.has(payload.p)) {
      throw new Error("Situation phase is invalid");
    }
    if (payload.x !== undefined && payload.x !== null && payload.x !== "") {
      const contractText = String(payload.x).trim().toUpperCase();
      if (!validContractPattern.test(contractText)) throw new Error("Situation contract is invalid");
    }
    validateOptionalSeat(payload.r, "declarer");
    validateOptionalSeat(payload.m, "dummy");
    validateOptionalSeat(payload.l, "leader");
    if (payload.e !== undefined && payload.e !== null && typeof payload.e !== "string") {
      throw new Error("Situation lesson must be a string");
    }
    validateArrayField(payload.a, "auction", validateSituationCall);
    validateArrayField(payload.k, "tricks", validateSituationTrick);
    validateArrayField(payload.c, "current", validateSituationPlay);
    if (payload.w !== undefined && ![0, 1, true, false].includes(payload.w)) {
      throw new Error("Situation awaiting flag is invalid");
    }
    return payload;
  }

  function validateEmbeddedMiniPayload(payload) {
    if (!Object.prototype.hasOwnProperty.call(payload, "h")) throw new Error("Situation mini hands are missing");
    const hands = parseMiniHands(payload.h, { requireAllSeats: true });
    validateEqualMiniHandLengths(hands);
    if (!Object.prototype.hasOwnProperty.call(payload, "g")) throw new Error("Situation trump is missing");
    normalizeSituationTrump(payload.g);
    if (payload.p !== undefined && payload.p !== null && payload.p !== "" && !validMiniPhases.has(payload.p)) {
      throw new Error("Situation phase is invalid for embedded mini hands");
    }
    const declarer = seatCodeFromAny(payload.r);
    if (!declarer) throw new Error("Situation declarer is missing for embedded mini hands");
    const dummy = seatCodeFromAny(payload.m) || partnerCode(declarer);
    if (dummy !== partnerCode(declarer)) throw new Error("Situation dummy must be declarer's partner");
    if (dummy === "S") throw new Error("South cannot be dummy in a mini situation");
    if (!seatCodeFromAny(payload.l)) throw new Error("Situation leader is missing for embedded mini hands");
  }

  function miniHandsFromPayload(payload) {
    validateSituationPayload(payload);
    return expandMiniHands(parseMiniHands(payload.h, { requireAllSeats: true }));
  }

  function preparedMiniSituationFromPayload(payload) {
    validateSituationPayload(payload);
    const declarer = seatNameFromCode(seatCodeFromAny(payload.r));
    const dummy = seatNameFromCode(seatCodeFromAny(payload.m) || partnerCode(seatCodeFromAny(payload.r)));
    const leader = seatNameFromCode(seatCodeFromAny(payload.l));
    const turn = seatNameFromCode(seatCodeFromAny(payload.t) || seatCodeFromAny(payload.l));
    const phase = payload.p || "playing";
    const trump = normalizeSituationTrump(payload.g);
    return {
      board: positiveBoardNumber(payload.b, 1),
      dealer: seatNameFromCode(seatCodeFromAny(payload.d)) || "North",
      vulnerability: normalizeSituationVulnerability(payload.u) || "none",
      phase,
      hands: miniHandsFromPayload(payload),
      trump,
      contractText: payload.x ? String(payload.x).trim().toUpperCase() : technicalContractFromTrump(trump),
      declarer,
      dummy,
      leader,
      turn,
      lessonId: payload.e || null
    };
  }

  function completeMiniSituationHands(situation, options = {}) {
    assertPlainObject(situation, "Mini situation must be an object");
    const sourceHands = parseMiniHands(situation.hands || situation.h || {}, { requireAllSeats: false });
    const declarer = seatCodeFromAny(situation.declarer || situation.r);
    const dummy = seatCodeFromAny(situation.dummy || situation.m) || (declarer ? partnerCode(declarer) : "");
    if (!dummy) throw new Error("Mini situation dummy is missing");
    if (dummy === "S") throw new Error("South cannot be dummy in a mini situation");
    const targetLength = miniTargetLength(sourceHands, dummy);
    const fillSeatCodes = (options.fillSeats || seatCodes.filter((code) => code !== "S" && code !== dummy))
      .map(seatCodeFromAny)
      .filter(Boolean);
    const primary = fillMiniHands(sourceHands, {
      fillSeatCodes,
      targetLength,
      trump: normalizeOptionalSituationTrump(situation.trump ?? situation.g),
      variant: 0
    });

    validateNeutralCompletionStability(situation, primary, {
      ...options,
      dummy,
      fillSeatCodes,
      targetLength
    });

    return expandMiniHands(primary);
  }

  function compactHandsFromCards(hands) {
    assertPlainObject(hands, "Mini hands must be an object");
    const compact = {};
    seatCodes.forEach((code, index) => {
      const seat = seats[index];
      compact[code] = compactCardsFromIds((hands[seat] || hands[code] || []).map(cardIdFromValue));
    });
    return compact;
  }

  function technicalContractFromTrump(trump) {
    const normalized = normalizeSituationTrump(trump);
    return normalized ? `1${normalized}` : "1NT";
  }

  function situationSeedPrefix(seed) {
    const normalized = String(seed || "").trim().toLowerCase();
    return situationSeedPrefixes.find((prefix) => normalized.startsWith(prefix)) || "";
  }

  function validateArrayField(value, name, itemValidator) {
    if (value === undefined) return;
    if (!Array.isArray(value)) throw new Error(`Situation ${name} must be an array`);
    value.forEach((item, index) => itemValidator(item, `${name}[${index}]`));
  }

  function validateSituationCall(call, path) {
    if (!Array.isArray(call)) throw new Error(`Situation call ${path} must be an array`);
    if (call.length < 2 || call.length > 4) throw new Error(`Situation call ${path} must contain two to four values`);
    validateOptionalSeat(call[0], `${path}[0]`);
    const callText = String(call[1] || "").trim().toUpperCase();
    if (!validCallPattern.test(callText)) throw new Error(`Situation call ${path}[1] is invalid`);
    validateOptionalFlag(call[2], `${path}[2]`);
    validateOptionalFlag(call[3], `${path}[3]`);
  }

  function validateSituationTrick(trick, path) {
    if (!Array.isArray(trick)) throw new Error(`Situation trick ${path} must be an array`);
    if (trick.length !== 4) throw new Error(`Situation trick ${path} must contain four plays`);
    trick.forEach((play, index) => validateSituationPlay(play, `${path}[${index}]`));
  }

  function validateSituationPlay(play, path) {
    if (!Array.isArray(play)) throw new Error(`Situation play ${path} must be an array`);
    if (play.length !== 2) throw new Error(`Situation play ${path} must contain two values`);
    validateOptionalSeat(play[0], `${path}[0]`);
    const cardText = String(play[1] || "").trim().toUpperCase();
    if (!validCardPattern.test(cardText)) throw new Error(`Situation play ${path}[1] is invalid`);
  }

  function validateOptionalSeat(value, path) {
    if (value === undefined || value === null || value === "") return;
    if (!validSeats.has(String(value).trim().toUpperCase())) throw new Error(`Situation seat ${path} is invalid`);
  }

  function validateOptionalFlag(value, path) {
    if (value === undefined) return;
    if (![0, 1, true, false].includes(value)) throw new Error(`Situation flag ${path} is invalid`);
  }

  function assertPlainObject(value, message) {
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(message);
  }

  function parseMiniHands(value, { requireAllSeats = false } = {}) {
    const parsed = Object.fromEntries(seatCodes.map((code) => [code, []]));
    const present = new Set();
    if (Array.isArray(value)) {
      if (value.length !== 4) throw new Error("Situation mini hands array must contain N, E, S and W");
      value.forEach((hand, index) => assignMiniHand(parsed, present, seatCodes[index], hand, `hands[${index}]`));
    } else if (value && typeof value === "object") {
      Object.entries(value).forEach(([seat, hand]) => {
        const code = seatCodeFromAny(seat);
        if (!code) throw new Error(`Situation mini hand seat ${seat} is invalid`);
        assignMiniHand(parsed, present, code, hand, `hands.${seat}`);
      });
    } else {
      throw new Error("Situation mini hands must be an object or array");
    }

    if (requireAllSeats) {
      const missing = seatCodes.filter((code) => !present.has(code));
      if (missing.length) throw new Error("Situation mini hands must contain N, E, S and W");
    }
    validateNoDuplicateMiniCards(parsed);
    return parsed;
  }

  function assignMiniHand(parsed, present, code, hand, path) {
    if (present.has(code)) throw new Error(`Situation mini hand ${code} is duplicated`);
    present.add(code);
    parsed[code] = parseMiniCardIds(hand, path);
  }

  function parseMiniCardIds(value, path) {
    if (value === undefined || value === null || value === "") return [];
    if (Array.isArray(value)) return value.map((card, index) => cardIdFromValue(card, `${path}[${index}]`));
    if (typeof value === "string") return parseCompactCardString(value, path);
    throw new Error(`Situation mini hand ${path} must be a string or array`);
  }

  function parseCompactCardString(value, path) {
    const text = String(value || "").trim().toUpperCase();
    if (!text) return [];
    const tokens = text.split(/[\s,.;|/-]+/).filter(Boolean);
    if (tokens.length > 1) return tokens.map((token, index) => normalizeCompactCardId(token, `${path}[${index}]`));

    const ids = [];
    let index = 0;
    while (index < text.length) {
      let rank = text[index];
      if (text.slice(index, index + 2) === "10") {
        rank = "T";
        index += 2;
      } else {
        index += 1;
      }
      const suit = text[index];
      index += 1;
      ids.push(normalizeCompactCardId(`${rank || ""}${suit || ""}`, path));
    }
    return ids;
  }

  function validateNoDuplicateMiniCards(hands) {
    const seen = new Map();
    seatCodes.forEach((code) => {
      (hands[code] || []).forEach((cardId) => {
        if (seen.has(cardId)) throw new Error(`Situation mini card ${cardId} is duplicated`);
        seen.set(cardId, code);
      });
    });
  }

  function validateEqualMiniHandLengths(hands) {
    const lengths = seatCodes.map((code) => (hands[code] || []).length);
    const [length] = lengths;
    if (length < 1 || length > 7) throw new Error("Situation mini hands must contain one to seven cards per player");
    if (lengths.some((item) => item !== length)) throw new Error("Situation mini hands must have equal lengths");
  }

  function miniTargetLength(hands, dummy) {
    const southLength = (hands.S || []).length;
    const dummyLength = (hands[dummy] || []).length;
    if (!southLength) throw new Error("Mini situation needs South cards");
    if (!dummyLength) throw new Error("Mini situation needs dummy cards");
    if (southLength !== dummyLength) throw new Error("Mini situation South and dummy hands must have equal lengths");
    if (southLength < 1 || southLength > 7) throw new Error("Mini situation hands must contain one to seven cards");
    seatCodes.forEach((code) => {
      if ((hands[code] || []).length > southLength) throw new Error("Mini situation explicit hand is longer than South and dummy");
    });
    return southLength;
  }

  function fillMiniHands(sourceHands, { fillSeatCodes, targetLength, trump, variant = 0 }) {
    const hands = cloneCodedMiniHands(sourceHands);
    const deck = neutralCandidateIds(hands, trump, variant);
    fillSeatCodes.forEach((code) => {
      while ((hands[code] || []).length < targetLength) {
        const next = deck.shift();
        if (!next) throw new Error("Mini situation has too few neutral cards available");
        hands[code].push(next);
      }
    });
    validateEqualMiniHandLengths(hands);
    return hands;
  }

  function neutralCandidateIds(hands, trump, variant) {
    const used = new Set(seatCodes.flatMap((code) => hands[code] || []));
    const candidates = suits.flatMap((suit) => rankOrder.map((rank) => `${rank}${suit}`))
      .filter((id) => !used.has(id))
      .sort((left, right) => neutralCardScore(left, trump) - neutralCardScore(right, trump) || cardSortScore(left) - cardSortScore(right));
    if (!variant || candidates.length < 2) return candidates;
    const rotation = Math.min(variant, candidates.length - 1);
    return candidates.slice(rotation).concat(candidates.slice(0, rotation));
  }

  function neutralCardScore(cardId, trump) {
    const card = cardFromId(cardId);
    const rankIndex = rankOrder.indexOf(card.rank);
    const honorPenalty = rankIndex >= rankOrder.indexOf("T") ? 30 : 0;
    const trumpPenalty = trump && card.suit === trump ? 50 : 0;
    return trumpPenalty + honorPenalty + rankIndex;
  }

  function cardSortScore(cardId) {
    const card = cardFromId(cardId);
    return suits.indexOf(card.suit) * rankOrder.length + rankOrder.indexOf(card.rank);
  }

  function validateNeutralCompletionStability(situation, primary, options) {
    if (!options.requireStable && typeof options.evaluate !== "function") return;
    if (typeof options.evaluate !== "function") throw new Error("Neutral completion stability requires a solver");

    const sourceHands = parseMiniHands(situation.hands || situation.h || {}, { requireAllSeats: false });
    const primarySignature = solverSignature(options.evaluate(miniSolverInput(situation, primary, options.dummy)));
    const primaryCompact = JSON.stringify(primary);
    for (let variant = 1; variant <= 2; variant += 1) {
      const probe = fillMiniHands(sourceHands, {
        fillSeatCodes: options.fillSeatCodes,
        targetLength: options.targetLength,
        trump: normalizeOptionalSituationTrump(situation.trump ?? situation.g),
        variant
      });
      if (JSON.stringify(probe) === primaryCompact) continue;
      const probeSignature = solverSignature(options.evaluate(miniSolverInput(situation, probe, options.dummy)));
      if (probeSignature !== primarySignature) throw new Error("Neutral completion is not stable");
    }
  }

  function miniSolverInput(situation, hands, dummy) {
    const declarer = seatCodeFromAny(situation.declarer || situation.r);
    const leader = seatCodeFromAny(situation.leader || situation.l);
    const turn = seatCodeFromAny(situation.turn || situation.t || leader);
    return {
      ...situation,
      hands: expandMiniHands(hands),
      trump: normalizeOptionalSituationTrump(situation.trump ?? situation.g),
      declarer: declarer ? seatNameFromCode(declarer) : null,
      dummy: dummy ? seatNameFromCode(dummy) : null,
      leader: leader ? seatNameFromCode(leader) : null,
      turn: turn ? seatNameFromCode(turn) : null
    };
  }

  function solverSignature(result) {
    if (!result || typeof result !== "object") return JSON.stringify(result);
    const known = {};
    [
      "maxSouthTricks",
      "southTricks",
      "tricks",
      "optimalLeadCards",
      "optimalStartCards",
      "startCards"
    ].forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(result, key)) known[key] = Array.isArray(result[key]) ? [...result[key]].sort() : result[key];
    });
    return stableStringify(Object.keys(known).length ? known : result);
  }

  function stableStringify(value) {
    if (!value || typeof value !== "object") return JSON.stringify(value);
    if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
  }

  function cloneCodedMiniHands(hands) {
    return Object.fromEntries(seatCodes.map((code) => [code, [...(hands[code] || [])]]));
  }

  function expandMiniHands(hands) {
    return Object.fromEntries(seatCodes.map((code, index) => [seats[index], (hands[code] || []).map(cardFromId)]));
  }

  function compactCardsFromIds(ids) {
    return ids.map((id, index) => normalizeCompactCardId(id, `cards[${index}]`)).join("");
  }

  function cardIdFromValue(value, path = "card") {
    return normalizeCompactCardId(value && typeof value === "object" ? value.id : value, path);
  }

  function cardFromId(id) {
    const normalized = normalizeCompactCardId(id);
    return { id: normalized, rank: normalized.slice(0, -1), suit: normalized.slice(-1) };
  }

  function normalizeCompactCardId(value, path = "card") {
    const text = String(value || "").trim().toUpperCase().replace(/^10/, "T");
    if (!/^[2-9TJQKA][CDHS]$/.test(text)) throw new Error(`Situation mini ${path} is invalid`);
    return text;
  }

  function normalizeSituationTrump(value) {
    if (value === undefined) throw new Error("Situation trump is missing");
    if (value === null) return null;
    const text = String(value).trim().toUpperCase();
    if (!text) throw new Error("Situation trump is invalid");
    if (text === "NT" || text === "SA") return null;
    if (suits.includes(text)) return text;
    throw new Error("Situation trump is invalid");
  }

  function normalizeOptionalSituationTrump(value) {
    if (value === undefined || value === null || value === "") return null;
    return normalizeSituationTrump(value);
  }

  function normalizeSituationVulnerability(value) {
    return validVulnerabilities.has(value) ? value : null;
  }

  function positiveBoardNumber(board, fallback) {
    const number = Number(board);
    return Number.isInteger(number) && number > 0 ? number : fallback;
  }

  function seatCodeFromAny(value) {
    const normalized = String(value || "").trim().toUpperCase();
    return {
      N: "N",
      NORTH: "N",
      NOORD: "N",
      E: "E",
      EAST: "E",
      OOST: "E",
      S: "S",
      SOUTH: "S",
      ZUID: "S",
      W: "W",
      WEST: "W"
    }[normalized] || "";
  }

  function seatNameFromCode(code) {
    return {
      N: "North",
      E: "East",
      S: "South",
      W: "West"
    }[code] || null;
  }

  function partnerCode(code) {
    return { N: "S", S: "N", E: "W", W: "E" }[code] || "";
  }

  function base64UrlEncode(text) {
    if (hasBuffer()) {
      return Buffer.from(String(text), "utf8").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
    }
    return btoa(utf8BinaryEncode(String(text))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  function base64UrlDecode(payload) {
    const normalized = String(payload || "").trim();
    if (!/^[A-Za-z0-9_-]*$/.test(normalized) || normalized.length % 4 === 1) {
      throw new Error("Invalid situation seed payload encoding");
    }
    const base64 = normalized.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    if (hasBuffer()) return Buffer.from(padded, "base64").toString("utf8");
    return utf8BinaryDecode(atob(padded));
  }

  function hasBuffer() {
    return typeof Buffer !== "undefined" && typeof Buffer.from === "function";
  }

  function utf8BinaryEncode(text) {
    if (typeof TextEncoder === "function") {
      const bytes = new TextEncoder().encode(text);
      return Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
    }
    return unescape(encodeURIComponent(text));
  }

  function utf8BinaryDecode(binary) {
    if (typeof TextDecoder === "function") {
      const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
      return new TextDecoder().decode(bytes);
    }
    return decodeURIComponent(escape(binary));
  }

  return {
    situationSeedPrefixes,
    normalizeSeed,
    isSituationSeed,
    encodeSituationPayload,
    parseSituationSeed,
    validateSituationPayload,
    miniHandsFromPayload,
    preparedMiniSituationFromPayload,
    completeMiniSituationHands,
    compactHandsFromCards,
    technicalContractFromTrump
  };
});

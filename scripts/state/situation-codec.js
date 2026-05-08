(function initBridgeSituationCodec(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const api = factory();
  if (isCommonJs) module.exports = api;
  root.BridgeSituationCodec = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeSituationCodec() {
  "use strict";

  const situationSeedPrefixes = ["situatieseed:", "situatie:", "situation:"];
  const supportedVersion = 1;
  const maxSeedLength = 5000;
  const validSeats = new Set(["N", "NORTH", "NOORD", "E", "EAST", "OOST", "S", "SOUTH", "ZUID", "W", "WEST"]);
  const validVulnerabilities = new Set(["none", "NS", "EW", "both"]);
  const validPhases = new Set(["idle", "bidding", "playing", "complete"]);
  const validCallPattern = /^(?:P|PASS|PAS|X|DOUBLE|DBL|XX|REDOUBLE|RDBL|[1-7](?:C|D|H|S|NT|SA))$/;
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
    if (payload.v !== supportedVersion) throw new Error("Unsupported situation seed version");
    if (payload.seed === null || payload.seed === undefined || String(payload.seed) === "") {
      throw new Error("Situation seed is missing the base seed");
    }
    if (Object.prototype.hasOwnProperty.call(payload, "board") && payload.board !== null && payload.board !== undefined) {
      const board = Number(payload.board);
      if (!Number.isInteger(board) || board < 1) throw new Error("Situation board must be a positive integer");
    }
    validateOptionalSeat(payload.dealer, "dealer");
    validateOptionalSeat(payload.turn, "turn");
    if (payload.vul !== undefined && payload.vul !== null && payload.vul !== "" && !validVulnerabilities.has(payload.vul)) {
      throw new Error("Situation vulnerability is invalid");
    }
    if (payload.phase !== undefined && payload.phase !== null && payload.phase !== "" && !validPhases.has(payload.phase)) {
      throw new Error("Situation phase is invalid");
    }
    validateArrayField(payload.auction, "auction", validateSituationCall);
    validateArrayField(payload.tricks, "tricks", validateSituationTrick);
    validateArrayField(payload.current, "current", validateSituationPlay);
    if (payload.awaiting !== undefined && ![0, 1, true, false].includes(payload.awaiting)) {
      throw new Error("Situation awaiting flag is invalid");
    }
    return payload;
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
    assertPlainObject(call, `Situation call ${path} must be an object`);
    validateOptionalSeat(call.s, `${path}.s`);
    const callText = String(call.b || "").trim().toUpperCase();
    if (!validCallPattern.test(callText)) throw new Error(`Situation call ${path}.b is invalid`);
    validateOptionalFlag(call.o, `${path}.o`);
    validateOptionalFlag(call.a, `${path}.a`);
  }

  function validateSituationTrick(trick, path) {
    if (!Array.isArray(trick)) throw new Error(`Situation trick ${path} must be an array`);
    if (trick.length !== 4) throw new Error(`Situation trick ${path} must contain four plays`);
    trick.forEach((play, index) => validateSituationPlay(play, `${path}[${index}]`));
  }

  function validateSituationPlay(play, path) {
    assertPlainObject(play, `Situation play ${path} must be an object`);
    validateOptionalSeat(play.s, `${path}.s`);
    const cardText = String(play.c || "").trim().toUpperCase();
    if (!validCardPattern.test(cardText)) throw new Error(`Situation play ${path}.c is invalid`);
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
    validateSituationPayload
  };
});

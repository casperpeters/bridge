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
    if (payload.v !== supportedVersion) throw new Error("Unsupported situation seed version");
    if (payload.s === null || payload.s === undefined || String(payload.s) === "") {
      throw new Error("Situation seed is missing the base seed");
    }
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

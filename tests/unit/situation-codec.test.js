const { assert, test } = require("./harness.js");
const codec = require("../../scripts/state/situation-codec.js");

test("situation codec recognizes and normalizes situation seeds", () => {
  assert.equal(codec.normalizeSeed("  repeat-me  "), "repeat-me");
  assert.equal(codec.isSituationSeed("situatieseed:abc"), true);
  assert.equal(codec.isSituationSeed("situatie:abc"), true);
  assert.equal(codec.isSituationSeed("situation:abc"), true);
  assert.equal(codec.isSituationSeed("plain-hand-seed"), false);
  assert.equal(codec.normalizeSeed(` ${"x".repeat(5100)} `).length, 5000);
});

test("situation codec round-trips a compact payload with UTF-8 seed text", () => {
  const payload = {
    v: 1,
    s: "oefenhand-schoppen-\u00e4",
    b: 7,
    d: "S",
    u: "both",
    p: "playing",
    e: "les-01-wat-is-bridge",
    x: "4S",
    r: "S",
    m: "N",
    l: "W",
    t: "N",
    a: [
      ["S", "1S", 1],
      ["W", "X"],
      ["N", "XX", 0, 1],
      ["E", "P"],
      ["S", "P"],
      ["W", "P"]
    ],
    k: [[
      ["W", "2H"],
      ["N", "AH"],
      ["E", "3H"],
      ["S", "10H"]
    ]],
    c: [
      ["N", "AS"],
      ["E", "KS"]
    ],
    w: 0
  };

  const seed = codec.encodeSituationPayload(payload);
  assert.match(seed, /^situatieseed:/);
  assert.deepEqual(decodePayload(seed), payload);
  assert.deepEqual(codec.parseSituationSeed(seed), payload);
});

test("situation codec round-trips v2 embedded mini-hand payloads", () => {
  const payload = {
    v: 2,
    b: 3,
    h: {
      N: "ASQS",
      E: "2C3C",
      S: "AHKH",
      W: "4D5D"
    },
    g: null,
    p: "playing",
    r: "S",
    m: "N",
    l: "W",
    t: "S"
  };

  const seed = codec.encodeSituationPayload(payload);

  assert.match(seed, /^situatieseed:/);
  assert.deepEqual(decodePayload(seed), payload);
  assert.deepEqual(codec.parseSituationSeed(seed), payload);

  const prepared = codec.preparedMiniSituationFromPayload(payload);
  assert.equal(prepared.board, 3);
  assert.equal(prepared.dealer, "North");
  assert.equal(prepared.vulnerability, "none");
  assert.equal(prepared.phase, "playing");
  assert.equal(prepared.contractText, "1NT");
  assert.equal(prepared.declarer, "South");
  assert.equal(prepared.dummy, "North");
  assert.equal(prepared.leader, "West");
  assert.equal(prepared.turn, "South");
  assert.deepEqual(handIds(prepared.hands), {
    North: ["AS", "QS"],
    East: ["2C", "3C"],
    South: ["AH", "KH"],
    West: ["4D", "5D"]
  });
  assert.equal(codec.preparedMiniSituationFromPayload({ ...payload, g: "S" }).contractText, "1S");
});

test("situation codec accepts the compact feedback seed format", () => {
  const seed = "situatieseed:eyJ2IjoxLCJzIjoiMzlicTJmNWY4aDZjIiwiYiI6MSwiZCI6Ik4iLCJ1Ijoibm9uZSIsInAiOiJiaWRkaW5nIiwidCI6IlMiLCJhIjpbWyJOIiwiMUQiXSxbIkUiLCIyUyJdXSwiayI6W10sImMiOltdLCJ3IjowfQ";

  assert.deepEqual(codec.parseSituationSeed(seed), {
    v: 1,
    s: "39bq2f5f8h6c",
    b: 1,
    d: "N",
    u: "none",
    p: "bidding",
    t: "S",
    a: [["N", "1D"], ["E", "2S"]],
    k: [],
    c: [],
    w: 0
  });
});

test("situation codec validates compact payload shape before restore code runs", () => {
  const valid = {
    v: 1,
    s: "valid",
    b: 1,
    d: "N",
    u: "none",
    p: "bidding",
    t: "N",
    a: [],
    k: [],
    c: [],
    w: 0
  };

  assert.equal(codec.validateSituationPayload(valid), valid);
  assert.equal(codec.validateSituationPayload({ ...valid, p: "contract-reveal", x: "4S", r: "S", m: "N", l: "W" }).p, "contract-reveal");
  assert.throws(() => codec.validateSituationPayload({ ...valid, v: 3 }), /Unsupported situation seed version/);
  assert.throws(() => codec.validateSituationPayload({ ...valid, s: "" }), /missing the base seed/);
  assert.throws(() => codec.validateSituationPayload({ ...valid, b: 0 }), /positive integer/);
  assert.throws(() => codec.validateSituationPayload({ ...valid, d: "Z" }), /seat dealer/);
  assert.throws(() => codec.validateSituationPayload({ ...valid, u: "all" }), /vulnerability/);
  assert.throws(() => codec.validateSituationPayload({ ...valid, p: "review" }), /phase/);
  assert.throws(() => codec.validateSituationPayload({ ...valid, x: "8S" }), /contract/);
  assert.throws(() => codec.validateSituationPayload({ ...valid, r: "Z" }), /declarer/);
  assert.throws(() => codec.validateSituationPayload({ ...valid, a: [["N", "8S"]] }), /auction\[0\]\[1\]/);
  assert.throws(() => codec.validateSituationPayload({ ...valid, k: [[["N", "AS"]]] }), /must contain four plays/);
  assert.throws(() => codec.validateSituationPayload({ ...valid, c: [["N", "1S"]] }), /current\[0\]\[1\]/);
  assert.throws(() => codec.validateSituationPayload({ ...valid, w: 2 }), /awaiting/);
});

test("situation codec validates v2 mini-hand shape before table restore", () => {
  const valid = {
    v: 2,
    h: { N: "AS", E: "2C", S: "AH", W: "4D" },
    g: "H",
    p: "playing",
    r: "S",
    m: "N",
    l: "W"
  };

  assert.equal(codec.validateSituationPayload(valid), valid);
  assert.throws(() => codec.validateSituationPayload({ ...valid, h: { N: "AS", E: "2C", S: "AH" } }), /N, E, S and W/);
  assert.throws(() => codec.validateSituationPayload({ ...valid, h: { N: "AS", E: "AS", S: "AH", W: "4D" } }), /duplicated/);
  assert.throws(() => codec.validateSituationPayload({ ...valid, h: { N: "ASQS", E: "2C", S: "AH", W: "4D" } }), /equal lengths/);
  assert.throws(() => codec.validateSituationPayload({ ...valid, g: "Z" }), /trump/);
  assert.throws(() => codec.validateSituationPayload({ ...valid, p: "bidding" }), /embedded mini/);
  assert.throws(() => codec.validateSituationPayload({ ...valid, r: "N", m: "S" }), /South cannot be dummy/);
});

test("situation codec fills neutral mini hands and validates solver stability", () => {
  const situation = {
    trump: null,
    declarer: "E",
    dummy: "W",
    leader: "S",
    hands: {
      South: "AS KS",
      West: "2H 3H"
    }
  };
  const calls = [];
  const completed = codec.completeMiniSituationHands(situation, {
    requireStable: true,
    evaluate(input) {
      calls.push(input);
      return { maxSouthTricks: 1, optimalLeadCards: ["AS"] };
    }
  });

  assert.deepEqual(handIds(completed), {
    North: ["2C", "2D"],
    East: ["2S", "3C"],
    South: ["AS", "KS"],
    West: ["2H", "3H"]
  });
  assert.ok(calls.length >= 2);
  assert.equal(calls[0].dummy, "West");
  assert.equal(calls[0].declarer, "East");
  assert.equal(calls[0].leader, "South");

  assert.throws(() => codec.completeMiniSituationHands(situation, {
    requireStable: true,
    evaluate(input) {
      return {
        maxSouthTricks: input.hands.North[0].id === "2C" ? 1 : 2,
        optimalLeadCards: ["AS"]
      };
    }
  }), /not stable/);
});

test("situation codec rejects malformed encoded seeds", () => {
  assert.equal(codec.parseSituationSeed("not-a-situation-seed"), null);
  assert.throws(() => codec.parseSituationSeed("situatieseed:!"), /payload encoding/);
  assert.throws(() => codec.parseSituationSeed("situatieseed:abcde"), /payload encoding/);
  assert.throws(() => codec.parseSituationSeed(codec.encodeSituationPayload({
    v: 1,
    s: "valid",
    a: [["N", "pass please"]]
  })), /auction\[0\]\[1\]/);
});

function decodePayload(seed) {
  const payload = seed.slice(seed.indexOf(":") + 1).replace(/-/g, "+").replace(/_/g, "/");
  const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
  return JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
}

function handIds(hands) {
  return Object.fromEntries(Object.entries(hands).map(([seat, cards]) => [seat, cards.map((card) => card.id)]));
}

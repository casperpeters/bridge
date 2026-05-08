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

test("situation codec round-trips a valid payload with UTF-8 seed text", () => {
  const payload = {
    v: 1,
    seed: "oefenhand-schoppen-\u00e4",
    board: 7,
    dealer: "S",
    vul: "both",
    phase: "playing",
    lesson: "les-01-wat-is-bridge",
    contract: "4S",
    declarer: "S",
    dummy: "N",
    leader: "W",
    turn: "N",
    auction: [
      { s: "S", b: "1S", o: 1 },
      { s: "W", b: "X" },
      { s: "N", b: "XX", a: true },
      { s: "E", b: "P" },
      { s: "S", b: "P" },
      { s: "W", b: "P" }
    ],
    tricks: [[
      { s: "W", c: "2H" },
      { s: "N", c: "AH" },
      { s: "E", c: "3H" },
      { s: "S", c: "10H" }
    ]],
    current: [
      { s: "N", c: "AS" },
      { s: "E", c: "KS" }
    ],
    awaiting: 0
  };

  const seed = codec.encodeSituationPayload(payload);
  assert.match(seed, /^situatieseed:/);
  assert.deepEqual(codec.parseSituationSeed(seed), payload);
});

test("situation codec validates payload shape before restore code runs", () => {
  const valid = {
    v: 1,
    seed: "valid",
    board: 1,
    dealer: "N",
    vul: "none",
    phase: "bidding",
    turn: "N",
    auction: [],
    tricks: [],
    current: [],
    awaiting: 0
  };

  assert.equal(codec.validateSituationPayload(valid), valid);
  assert.throws(() => codec.validateSituationPayload({ ...valid, v: 2 }), /Unsupported situation seed version/);
  assert.throws(() => codec.validateSituationPayload({ ...valid, seed: "" }), /missing the base seed/);
  assert.throws(() => codec.validateSituationPayload({ ...valid, board: 0 }), /positive integer/);
  assert.throws(() => codec.validateSituationPayload({ ...valid, dealer: "Z" }), /seat dealer/);
  assert.throws(() => codec.validateSituationPayload({ ...valid, vul: "all" }), /vulnerability/);
  assert.throws(() => codec.validateSituationPayload({ ...valid, phase: "review" }), /phase/);
  assert.throws(() => codec.validateSituationPayload({ ...valid, contract: "8S" }), /contract/);
  assert.throws(() => codec.validateSituationPayload({ ...valid, declarer: "Z" }), /declarer/);
  assert.throws(() => codec.validateSituationPayload({ ...valid, auction: [{ s: "N", b: "8S" }] }), /auction\[0\]\.b/);
  assert.throws(() => codec.validateSituationPayload({ ...valid, tricks: [[{ s: "N", c: "AS" }]] }), /must contain four plays/);
  assert.throws(() => codec.validateSituationPayload({ ...valid, current: [{ s: "N", c: "1S" }] }), /current\[0\]\.c/);
  assert.throws(() => codec.validateSituationPayload({ ...valid, awaiting: 2 }), /awaiting/);
});

test("situation codec rejects malformed encoded seeds", () => {
  assert.equal(codec.parseSituationSeed("not-a-situation-seed"), null);
  assert.throws(() => codec.parseSituationSeed("situatieseed:!"), /payload encoding/);
  assert.throws(() => codec.parseSituationSeed("situatieseed:abcde"), /payload encoding/);
  assert.throws(() => codec.parseSituationSeed(codec.encodeSituationPayload({
    v: 1,
    seed: "valid",
    auction: [{ s: "N", b: "pass please" }]
  })), /auction\[0\]\.b/);
});

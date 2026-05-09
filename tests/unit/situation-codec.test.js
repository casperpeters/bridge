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
  assert.throws(() => codec.validateSituationPayload({ ...valid, v: 2 }), /Unsupported situation seed version/);
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

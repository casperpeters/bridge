const assert = require("node:assert/strict");
const rules = require("../../bridge-rules.js");

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

function card(id) {
  const rank = id.slice(0, -1);
  const suit = id.slice(-1);
  return { id, rank, suit };
}

function hand(...ids) {
  return ids.map(card);
}

function bid(level, strain) {
  return rules.Bid(level, strain);
}

function pass() {
  return rules.Pass();
}

function double() {
  return rules.Double();
}

function redouble() {
  return rules.Redouble();
}

function chooseFiveCardHigh(ids, auction = [], seat = "South") {
  return rules.chooseFiveCardHighBid({
    hand: hand(...ids),
    auction,
    seat,
    vulnerability: "none"
  });
}

function chooseFiveCardHighResult(ids, auction = [], seat = "South") {
  return rules.chooseFiveCardHighBidResult({
    hand: hand(...ids),
    auction,
    seat,
    vulnerability: "none"
  });
}

function run() {
  let failed = 0;

  for (const { name, fn } of tests) {
    try {
      fn();
      console.log(`PASS ${name}`);
    } catch (error) {
      failed += 1;
      console.error(`FAIL ${name}`);
      console.error(error);
    }
  }

  if (failed) {
    console.error(`${failed} test${failed === 1 ? "" : "s"} failed`);
    process.exit(1);
  }

  console.log(`${tests.length} tests passed`);
}

module.exports = {
  assert,
  rules,
  test,
  run,
  card,
  hand,
  bid,
  pass,
  double,
  redouble,
  chooseFiveCardHigh,
  chooseFiveCardHighResult
};

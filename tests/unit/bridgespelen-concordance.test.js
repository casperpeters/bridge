const {
  assert,
  rules,
  test,
  hand,
  bid,
  pass,
  double,
  redouble
} = require("./harness.js");
const { createBridgespelenFiveCardHighClaims } = require("../reference/bridgespelen-five-card-high.js");

const passingVerdicts = new Set([
  "match",
  "intentionalExtension",
  "siteSimplification"
]);
const deferredVerdicts = new Set([
  "unsupportedYet",
  "ambiguous"
]);
const knownVerdicts = new Set([
  ...passingVerdicts,
  ...deferredVerdicts,
  "codeBug"
]);

const claims = createBridgespelenFiveCardHighClaims({ bid, pass, double, redouble });

test("Bridgespelen Vijfkaart Hoog reference claims are well formed", () => {
  const seen = new Set();
  for (const claim of claims) {
    assert.ok(claim.id, "claim needs an id");
    assert.equal(seen.has(claim.id), false, `duplicate claim id: ${claim.id}`);
    seen.add(claim.id);
    assert.ok(claim.domain, `${claim.id} needs a domain`);
    assert.ok(claim.source?.url, `${claim.id} needs a source URL`);
    assert.ok(claim.source?.topic, `${claim.id} needs a source topic`);
    assert.ok(claim.claim, `${claim.id} needs a short claim summary`);
    assert.ok(knownVerdicts.has(claim.verdict), `${claim.id} has unknown verdict ${claim.verdict}`);
    if (claim.verdict !== "match") {
      assert.ok(claim.rationale, `${claim.id} needs a rationale for non-match verdict ${claim.verdict}`);
    }
    if (passingVerdicts.has(claim.verdict)) {
      assert.ok(Array.isArray(claim.hand), `${claim.id} needs a hand fixture`);
      assert.equal(claim.hand.length, 13, `${claim.id} hand must contain 13 cards`);
      assert.ok(claim.expectedEngineBid, `${claim.id} needs expectedEngineBid`);
      assert.ok(claim.expectedRuleId, `${claim.id} needs expectedRuleId`);
    }
  }
});

test("Bridgespelen Vijfkaart Hoog active reference claims match the current engine judgement", () => {
  for (const claim of claims) {
    if (claim.verdict === "codeBug") {
      assert.fail(`${claim.id} is marked as a code bug: ${claim.rationale}`);
    }
    if (deferredVerdicts.has(claim.verdict)) continue;

    if (claim.verdict === "match") {
      assert.ok(claim.expectedSourceBid, `${claim.id} needs expectedSourceBid for a match verdict`);
      assert.ok(
        rules.sameCall(claim.expectedSourceBid, claim.expectedEngineBid),
        `${claim.id} is marked match but source and engine expectations differ`
      );
    }

    const result = rules.chooseFiveCardHighBidResult({
      hand: hand(...claim.hand),
      auction: claim.auction || [],
      seat: claim.seat || "South",
      vulnerability: claim.vulnerability || "none"
    });

    assert.deepEqual(result.bid, claim.expectedEngineBid, `${claim.id}: ${claim.claim}`);
    assert.equal(result.ruleId, claim.expectedRuleId, `${claim.id}: expected ruleId`);
    assert.equal(typeof result.reason, "string", `${claim.id}: bid result should keep a reason`);
    assert.ok(result.reason.length > 0, `${claim.id}: bid result reason should not be empty`);

    for (const [key, expected] of Object.entries(claim.expect || {})) {
      assert.deepEqual(result[key], expected, `${claim.id}: expected ${key}`);
    }
  }
});

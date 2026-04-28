const { assert, rules, test } = require("./harness.js");
const practiceHands = require("../../practice-hands/index.js");

function callText(call) {
  if (rules.isPass(call)) return "PASS";
  if (rules.isDouble(call)) return "DOUBLE";
  if (rules.isRedouble(call)) return "REDOUBLE";
  return `${call.level}${call.strain}`;
}

test("practice hand catalog contains ten valid beginner deals", () => {
  assert.equal(practiceHands.beginnerHands.length, 10);
  assert.equal(practiceHands.validatePracticeHands(), 10);

  const ids = new Set();
  for (const scenario of practiceHands.beginnerHands) {
    const prepared = practiceHands.preparePracticeHand(scenario.id);
    ids.add(prepared.id);
    assert.equal(prepared.systemId, "fiveCardHigh");
    assert.ok(prepared.testGoal);

    const allCards = Object.values(prepared.hands).flat();
    assert.equal(allCards.length, 52);
    assert.equal(new Set(allCards.map((card) => card.id)).size, 52);
    for (const seat of rules.seats) assert.equal(prepared.hands[seat].length, 13);
  }

  assert.equal(ids.size, 10);
});

test("practice hand expected auction prefixes match the current five-card-high rules", () => {
  const auctionScenarios = practiceHands.beginnerHands.filter((scenario) => scenario.expectedAuction?.length);

  for (const scenario of auctionScenarios) {
    const prepared = practiceHands.preparePracticeHand(scenario.id);
    const auction = [];

    for (const expected of prepared.expectedAuction) {
      const result = rules.chooseBid({
        systemId: prepared.systemId,
        hand: prepared.hands[expected.seat],
        auction,
        seat: expected.seat,
        vulnerability: prepared.vulnerability,
        agreements: rules.biddingSystems[prepared.systemId].conventionDefaults
      });

      assert.equal(callText(result.bid), callText(practiceHands.callFromText(expected.bid)), `${prepared.id} ${expected.seat}`);
      if (expected.ruleId) assert.equal(result.ruleId, expected.ruleId, prepared.id);

      auction.push({
        seat: expected.seat,
        bid: practiceHands.callFromText(expected.bid),
        bidResult: result
      });
    }
  }
});

test("practice hand play-plan targets expose their expected priority", () => {
  const planScenarios = practiceHands.beginnerHands.filter((scenario) => scenario.expectedPlayPlan);

  for (const scenario of planScenarios) {
    const prepared = practiceHands.preparePracticeHand(scenario.id);
    const contract = practiceHands.contractFromText(prepared.expectedContract.contract);
    const declarer = prepared.expectedContract.declarer;
    const dummy = rules.partnerOf(declarer);
    const plan = rules.createPlayPlan({
      declarerHand: prepared.hands[declarer],
      dummyHand: prepared.hands[dummy],
      contract,
      declarer,
      dummy
    });
    const expected = prepared.expectedPlayPlan;
    const priority = plan.priorities.find((item) => item.kind === expected.priorityKind && (!expected.suit || item.suit === expected.suit));

    assert.ok(priority, `${prepared.id} expected ${expected.priorityKind}`);
    if (expected.missingStopper) assert.equal(priority.missingStopper, expected.missingStopper);
  }
});

test("practice hand scoring target documents the vulnerable game bonus", () => {
  const scenario = practiceHands.preparePracticeHand("game-bonus-vulnerable-001");
  const contract = practiceHands.contractFromText(scenario.expectedContract.contract);
  const score = rules.calculateBridgeScore({
    contract,
    declarer: scenario.expectedContract.declarer,
    tricksMade: scenario.expectedScore.tricksMade,
    vulnerability: scenario.vulnerability
  });

  assert.equal(score.declarerTeam, scenario.expectedScore.declarerTeam);
  assert.equal(score.score, scenario.expectedScore.score);
  assert.equal(score.contractPoints, scenario.expectedScore.contractPoints);
  assert.equal(score.gameBonus, scenario.expectedScore.gameBonus);
});

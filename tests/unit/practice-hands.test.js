const { assert, rules, test } = require("./harness.js");
const practiceHands = require("../../practice-hands/index.js");

function callText(call) {
  if (rules.isPass(call)) return "PASS";
  if (rules.isDouble(call)) return "DOUBLE";
  if (rules.isRedouble(call)) return "REDOUBLE";
  return `${call.level}${call.strain}`;
}

test("practice hand catalog contains twenty-seven valid beginner deals", () => {
  assert.equal(practiceHands.beginnerHands.length, 27);
  assert.equal(practiceHands.validatePracticeHands(), 27);

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

  assert.equal(ids.size, 27);
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
    const expected = prepared.expectedPlayPlan;
    const plan = rules.createPlayPlan({
      declarerHand: prepared.hands[declarer],
      dummyHand: prepared.hands[dummy],
      contract,
      declarer,
      dummy,
      currentTrick: playsFromSpecs(expected.currentTrick)
    });

    assertPlanPriority(plan, expected, prepared.id);
    for (const related of expected.also || []) assertPlanPriority(plan, related, prepared.id);
    if (expected.firstPriorityKind) assert.equal(plan.priorities[0]?.kind, expected.firstPriorityKind, prepared.id);
  }
});

test("practice hand defensive card-play targets expose their expected rule", () => {
  const cardPlayScenarios = practiceHands.beginnerHands.filter((scenario) => scenario.expectedCardPlay);

  for (const scenario of cardPlayScenarios) {
    const prepared = practiceHands.preparePracticeHand(scenario.id);
    const expected = prepared.expectedCardPlay;
    const contract = practiceHands.contractFromText(prepared.expectedContract.contract);
    const declarer = prepared.expectedContract.declarer;
    const dummy = rules.partnerOf(declarer);
    const result = rules.chooseCardPlay({
      hand: expected.hand ? expected.hand.map(practiceHands.cardFromId) : prepared.hands[expected.seat],
      dummyHand: prepared.hands[dummy],
      currentTrick: playsFromSpecs(expected.currentTrick),
      trickHistory: tricksFromSpecs(expected.trickHistory),
      seat: expected.seat,
      declarer,
      dummy,
      contract,
      trump: expected.trump || (contract.strain === "NT" ? null : contract.strain)
    });

    assert.equal(result.ruleId, expected.ruleId, prepared.id);
    assert.equal(result.card.id, expected.card, prepared.id);
    [
      "suit",
      "trump",
      "honorSafety",
      "leadSuit",
      "unblockRank",
      "partnerSeat",
      "dummyShortSuit",
      "dummyShortLength",
      "dummyTrumpLength"
    ].forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(expected, key)) {
        assert.equal(result[key], expected[key], `${prepared.id} ${key}`);
      }
    });
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

function playsFromSpecs(specs = []) {
  return specs.map((spec) => ({
    seat: spec.seat,
    card: practiceHands.cardFromId(spec.card),
    ruleId: spec.ruleId || null
  }));
}

function tricksFromSpecs(specs = []) {
  return specs.map((trick) => ({
    ...trick,
    cards: playsFromSpecs(trick.cards)
  }));
}

function assertPlanPriority(plan, expected, scenarioId) {
  const priority = plan.priorities.find((item) => priorityMatches(item, expected));
  assert.ok(priority, `${scenarioId} expected ${expected.priorityKind}`);

  [
    "missingStopper",
    "timing",
    "delayReason",
    "entrySuit",
    "entryRank",
    "attackedSuit",
    "discardSeat",
    "firstSeat",
    "longSeat",
    "shortSeat"
  ].forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(expected, key)) {
      assert.equal(priority[key], expected[key], `${scenarioId} ${expected.priorityKind} ${key}`);
    }
  });
}

function priorityMatches(priority, expected) {
  return priority.kind === expected.priorityKind && (!expected.suit || priority.suit === expected.suit);
}

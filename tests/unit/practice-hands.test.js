const { assert, rules, test } = require("./harness.js");
const practiceHands = require("../../practice-hands/index.js");

function callText(call) {
  if (rules.isPass(call)) return "PASS";
  if (rules.isDouble(call)) return "DOUBLE";
  if (rules.isRedouble(call)) return "REDOUBLE";
  return `${call.level}${call.strain}`;
}

test("practice hand catalog contains beginner deals plus regression deals", () => {
  assert.equal(practiceHands.beginnerHands.length, 81);
  assert.equal(practiceHands.validatePracticeHands(), 82);
  assert.ok(practiceHands.findPracticeHand("situation-2s-west-trick-8-001"));

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

  assert.equal(ids.size, 81);
});

test("practice hand catalog metadata exposes all existing technical collections as flat lists", () => {
  const catalogs = practiceHands.getPracticeCatalogs();
  const expectedCatalogs = [
    ["fiveCardHighOpenings", "fiveCardHighOpenings"],
    ["notrumpResponses", "notrumpResponses"],
    ["basicBidding", "basicBidding"],
    ["basicPlayPlan", "basicPlayPlan"],
    ["basicDefense", "basicDefense"],
    ["basicScoring", "basicScoring"],
    ["startMetBridge1", "start-met-bridge-1"]
  ];

  assert.deepEqual(catalogs.map((catalog) => [catalog.key, catalog.id]), expectedCatalogs);
  assert.equal(practiceHands.allCollections().length, catalogs.length);
  assert.equal(practiceHands.findCollection("basicPlayPlan").key, "basicPlayPlan");
  assert.equal(practiceHands.getPracticeCatalog("basicPlayPlan").key, "basicPlayPlan");
  assert.equal(practiceHands.findCollection("start-met-bridge-1").key, "startMetBridge1");

  const listedIds = new Set();
  for (const catalog of catalogs) {
    assert.equal(typeof catalog.title, "string", catalog.key);
    assert.ok(catalog.title.length > 0, catalog.key);
    assert.equal(typeof catalog.description, "string", catalog.key);
    assert.ok(catalog.description.length > 0, catalog.key);
    assert.ok(Array.isArray(catalog.hands), catalog.key);
    assert.strictEqual(catalog.hands, practiceHands.collections[catalog.key], catalog.key);
    assert.equal(Object.prototype.hasOwnProperty.call(catalog, "chapters"), false, catalog.key);

    for (const scenario of catalog.hands) listedIds.add(scenario.id);
  }

  assert.equal(listedIds.size, practiceHands.allPracticeHands.length);
  assert.equal(practiceHands.getPracticeCatalog("missing-catalog"), null);
});

test("Start met Bridge 1 catalog has stable course metadata and complete app-focus coverage", () => {
  const catalog = practiceHands.getPracticeCatalog("start-met-bridge-1");
  const smb1Hands = catalog.hands;
  const lessonNumbers = new Set();
  const coveredAppFocus = new Set();

  assert.equal(catalog.key, "startMetBridge1");
  assert.equal(smb1Hands.length, 25);

  for (const scenario of smb1Hands) {
    assert.match(scenario.id, /^smb1-les\d{2}-[a-z0-9-]+$/, scenario.id);
    assert.equal(scenario.course, "start-met-bridge-1", scenario.id);
    assert.equal(scenario.systemId, "fiveCardHigh", scenario.id);
    assert.equal(scenario.level, "beginner", scenario.id);
    assert.ok(Number.isInteger(scenario.lesson?.number), scenario.id);
    assert.ok(scenario.lesson.number >= 1 && scenario.lesson.number <= 12, scenario.id);
    assert.equal(scenario.lesson.id, `smb1-les${String(scenario.lesson.number).padStart(2, "0")}`, scenario.id);
    assert.ok(scenario.lesson.title, scenario.id);
    assert.ok(scenario.topic, scenario.id);
    assert.ok(scenario.goal, scenario.id);
    assert.ok(Array.isArray(scenario.expectedFocus) && scenario.expectedFocus.length, scenario.id);
    assert.ok(Array.isArray(scenario.expectedActions) && scenario.expectedActions.length, scenario.id);
    assert.ok(Array.isArray(scenario.reviewFocus) && scenario.reviewFocus.length, scenario.id);
    assert.ok(Array.isArray(scenario.appFocus) && scenario.appFocus.length, scenario.id);
    assert.ok(hasEngineObservableExpectation(scenario), scenario.id);
    lessonNumbers.add(scenario.lesson.number);
    scenario.appFocus.forEach((focus) => coveredAppFocus.add(focus));

    if (scenario.sourceHandId) {
      const source = practiceHands.findPracticeHand(scenario.sourceHandId);
      assert.ok(source, `${scenario.id} source ${scenario.sourceHandId}`);
      assert.notEqual(source.id, scenario.id);
    }
  }

  assert.deepEqual([...lessonNumbers].sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  assert.deepEqual([...SMB1_APP_FOCUS_GOALS].sort(), [...coveredAppFocus].sort());
});

test("mini end-position exercises expose only solver-valid SMB1 lesson canaries", () => {
  assert.equal(practiceHands.validateMiniEndPositionExercises(), 1);

  const exercises = practiceHands.getVisibleMiniEndPositionExercises();
  assert.deepEqual(exercises.map((exercise) => exercise.id), ["mini-smb1-les01-schoppen-aas-eerst"]);

  const exercise = exercises[0];
  assert.equal(exercise.lessonId, "smb1-les01");
  assert.equal(exercise.learningGoalId, "smb1-les01-trick-definition-and-winner");
  assert.equal(exercise.mode, "lead-and-predict");
  assert.equal(exercise.exerciseType, "mini-end-position");
  assert.match(exercise.startSeed, /^situatieseed:/);
  assert.equal(exercise.situation.trump, null);
  assert.equal(exercise.situation.declarer, "East");
  assert.equal(exercise.situation.dummy, "West");
  assert.equal(exercise.solution.maxSouthTricks, 1);
  assert.deepEqual(exercise.solution.optimalCardIds, ["AS", "2S"]);
  assert.equal(practiceHands.findVisibleMiniEndPositionExercise(exercise.id).id, exercise.id);
  assert.equal(practiceHands.getVisibleMiniEndPositionExercisesForLearningGoal(exercise.learningGoalId).length, 1);

  assert.equal(practiceHands.isVisibleMiniEndPositionExercise({
    ...exercise,
    id: "bad-mini-missing-card",
    situation: {
      ...exercise.situation,
      hands: {
        ...exercise.situation.hands,
        South: []
      }
    }
  }), false);
  assert.equal(practiceHands.isVisibleMiniEndPositionExercise({
    ...exercise,
    id: "bad-mini-learning-goal",
    learningGoalId: "smb1-les01-missing-goal"
  }), false);
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
      trickHistory: tricksFromSpecs(expected.trickHistory),
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
      "coveredRank",
      "coverReason",
      "dummyShortSuit",
      "dummyShortLength",
      "dummyTrumpLength",
      "leadSelection"
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
    "shortSeat",
    "leadSeat",
    "sourceSeat",
    "discardSuit",
    "leadRank",
    "finesseRank",
    "trump"
  ].forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(expected, key)) {
      assert.equal(priority[key], expected[key], `${scenarioId} ${expected.priorityKind} ${key}`);
    }
  });
}

function priorityMatches(priority, expected) {
  return priority.kind === expected.priorityKind && (!expected.suit || priority.suit === expected.suit);
}

function hasEngineObservableExpectation(scenario) {
  if (scenario.expectedPlayPlan || scenario.expectedCardPlay || scenario.expectedScore) return true;
  return Array.isArray(scenario.expectedAuction) && scenario.expectedAuction.some((expected) => expected.ruleId);
}

const SMB1_APP_FOCUS_GOALS = new Set([
  "cards-seats-suits",
  "contract-trump-dummy",
  "trick-winner",
  "direct-tricks",
  "develop-tricks",
  "simple-finesse",
  "length-tricks",
  "trump-extra-tricks",
  "suit-contract-plan",
  "notrump-plan",
  "opening-lead-notrump",
  "opening-lead-sequence",
  "opening-lead-suit",
  "second-hand-low",
  "honor-on-honor",
  "third-hand-high",
  "defensive-unblock",
  "defense-against-suit",
  "opening-one-notrump",
  "opening-one-major",
  "opening-one-minor",
  "opening-pass",
  "major-response-fit",
  "major-response-no-fit",
  "one-notrump-response",
  "new-suit-after-major",
  "minor-response-major-search",
  "simple-overcall"
]);

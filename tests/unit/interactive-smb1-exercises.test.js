const { assert, rules, test } = require("./harness.js");
const practiceHands = require("../../practice-hands/index.js");
const situationCodec = require("../../scripts/state/situation-codec.js");
const actionValidation = require("../../scripts/learning/table/action-validation.js");

function callText(call) {
  if (rules.isPass(call)) return "PASS";
  if (rules.isDouble(call)) return "X";
  if (rules.isRedouble(call)) return "XX";
  return `${call.level}${call.strain}`;
}

test("interactive SMB1 exercises are visible and reference stable course data", () => {
  const exercises = practiceHands.getVisibleInteractiveSmb1Exercises();

  assert.equal(practiceHands.validateInteractiveSmb1Exercises(), 4);
  assert.deepEqual(exercises.map((exercise) => exercise.id), [
    "smb1-les06-deblokkeren-derde-hand-ks",
    "smb1-les07-openen-1sa-gebalanceerd",
    "smb1-les09-zonder-fit-1sa-antwoord-1nt",
    "smb1-les07-passen-zonder-opening-pass"
  ]);

  for (const exercise of exercises) {
    const lesson = practiceHands.findSmb1Lesson(exercise.lessonId);
    const sourceHand = practiceHands.findPracticeHand(exercise.sourceHandId);
    const payload = situationCodec.parseSituationSeed(exercise.startSeed);

    assert.ok(lesson, exercise.id);
    assert.ok(lesson.learningGoals.some((goal) => goal.id === exercise.learningGoalId), exercise.id);
    assert.ok(sourceHand, exercise.id);
    assert.equal(payload.s, exercise.sourceHandId, exercise.id);
    assert.equal(["bid", "card"].includes(exercise.actionType), true, exercise.id);
    assert.ok(exercise.correctAnswers.length > 0, exercise.id);
    assert.equal(exercise.expectedAction?.type, exercise.actionType, exercise.id);
  }
});

test("interactive SMB1 action validation accepts correct bids and cards and explains retries", () => {
  const answer1Nt = practiceHands.findVisibleInteractiveSmb1Exercise("smb1-les09-zonder-fit-1sa-antwoord-1nt");
  const unblock = practiceHands.findVisibleInteractiveSmb1Exercise("smb1-les06-deblokkeren-derde-hand-ks");

  const correctBid = actionValidation.validateExpectedAction(
    answer1Nt.expectedAction,
    { type: "bid", seat: "South", bid: rules.Bid(1, "NT") },
    answer1Nt.feedback
  );
  assert.equal(correctBid.ok, true);
  assert.match(correctBid.feedback.body, /Zonder schoppenfit/);

  const wrongBid = actionValidation.validateExpectedAction(
    answer1Nt.expectedAction,
    { type: "bid", seat: "South", bid: rules.Pass() },
    answer1Nt.feedback
  );
  assert.equal(wrongBid.ok, false);
  assert.match(wrongBid.feedback.body, /6-9 HCP/);

  const correctCard = actionValidation.validateExpectedAction(
    unblock.expectedAction,
    { type: "card", seat: "South", card: practiceHands.cardFromId("KS") },
    unblock.feedback
  );
  assert.equal(correctCard.ok, true);
  assert.match(correctCard.feedback.body, /heer meteen/);

  const wrongCard = actionValidation.validateExpectedAction(
    unblock.expectedAction,
    { type: "card", seat: "South", card: practiceHands.cardFromId("7S") },
    unblock.feedback
  );
  assert.equal(wrongCard.ok, false);
  assert.match(wrongCard.feedback.body, /vast/);

  assert.equal(actionValidation.expectedBidMatches({ calls: ["1NT", "2C"] }, rules.Bid(2, "C")), true);
  assert.equal(actionValidation.expectedCardMatches({ cardIds: ["KS", "AS"] }, practiceHands.cardFromId("AS")), true);
});

test("interactive SMB1 exercises stay aligned with current engine expectations", () => {
  for (const exercise of practiceHands.getVisibleInteractiveSmb1Exercises()) {
    const scenario = practiceHands.preparePracticeHand(exercise.engineExpectation.scenarioId);
    if (exercise.engineExpectation.kind === "expectedAuction") {
      assertInteractiveAuctionExpectation(exercise, scenario);
    } else if (exercise.engineExpectation.kind === "expectedCardPlay") {
      assertInteractiveCardExpectation(exercise, scenario);
    } else {
      assert.fail(`Unknown engine expectation kind: ${exercise.engineExpectation.kind}`);
    }
  }
});

function assertInteractiveAuctionExpectation(exercise, scenario) {
  const auction = [];
  for (let index = 0; index <= exercise.engineExpectation.index; index += 1) {
    const expected = scenario.expectedAuction[index];
    const result = rules.chooseBid({
      systemId: scenario.systemId,
      hand: scenario.hands[expected.seat],
      auction,
      seat: expected.seat,
      vulnerability: scenario.vulnerability,
      agreements: rules.biddingSystems[scenario.systemId].conventionDefaults
    });

    if (index === exercise.engineExpectation.index) {
      assert.equal(callText(result.bid), exercise.correctAnswers[0], exercise.id);
      assert.equal(result.ruleId, exercise.engineExpectation.ruleId, exercise.id);
    }

    auction.push({
      seat: expected.seat,
      bid: practiceHands.callFromText(expected.bid),
      bidResult: result
    });
  }
}

function assertInteractiveCardExpectation(exercise, scenario) {
  const expected = scenario.expectedCardPlay;
  const contract = practiceHands.contractFromText(scenario.expectedContract.contract);
  const declarer = scenario.expectedContract.declarer;
  const dummy = rules.partnerOf(declarer);
  const result = rules.chooseCardPlay({
    hand: expected.hand ? expected.hand.map(practiceHands.cardFromId) : scenario.hands[expected.seat],
    dummyHand: scenario.hands[dummy],
    currentTrick: playsFromSpecs(expected.currentTrick),
    trickHistory: tricksFromSpecs(expected.trickHistory),
    seat: expected.seat,
    declarer,
    dummy,
    contract,
    trump: expected.trump || (contract.strain === "NT" ? null : contract.strain)
  });

  assert.equal(result.card.id, exercise.correctAnswers[0], exercise.id);
  assert.equal(result.ruleId, exercise.engineExpectation.ruleId, exercise.id);
}

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

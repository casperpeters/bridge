const { assert, test } = require("./harness.js");
const practiceHands = require("../../practice-hands/index.js");
const miniExercises = require("../../practice-hands/mini-end-position-exercises.js");

test("mini end-position canary validates against SMB1 lesson 1", () => {
  assert.equal(practiceHands.validateMiniEndPositionExercises(), 1);

  const exercises = practiceHands.getMiniEndPositionExercises();
  assert.equal(exercises.length, 1);

  const exercise = practiceHands.prepareMiniEndPositionExercise(exercises[0].id);
  assert.equal(exercise.lessonId, "smb1-les01");
  assert.equal(exercise.learningGoalId, "smb1-les01-trick-definition-and-winner");
  assert.equal(exercise.mode, "lead-and-predict");
  assert.equal(exercise.situation.player, "South");
  assert.equal(exercise.situation.declarer, "East");
  assert.equal(exercise.situation.dummy, "West");
  assert.equal(exercise.situation.nextToPlay, "South");
  assert.equal(exercise.situation.trump, null);
  assert.ok(exercise.explanation.correct);
  assert.ok(exercise.explanation.why);
  for (const seat of ["North", "East", "South", "West"]) {
    assert.equal(exercise.situation.hands[seat].length, 2, seat);
  }

  assert.equal(
    practiceHands.getMiniEndPositionExercisesForLearningGoal("smb1-les01-trick-definition-and-winner")[0].id,
    exercise.id
  );
});

test("mini end-position validator accepts South as defender but never dummy", () => {
  const defenderExercise = cloneCanary();
  defenderExercise.id = "south-defender";

  const normalized = miniExercises.normalizeMiniEndPositionExercise(defenderExercise);
  assert.equal(normalized.situation.player, "South");
  assert.equal(normalized.situation.declarer, "East");
  assert.equal(normalized.situation.dummy, "West");

  const invalidDummy = cloneCanary();
  invalidDummy.situation.declarer = "North";
  invalidDummy.situation.dummy = "South";
  assert.throws(
    () => miniExercises.normalizeMiniEndPositionExercise(invalidDummy),
    /cannot use South as dummy/
  );
});

test("mini end-position validator fails on missing references and unsupported mode", () => {
  const missingLesson = cloneCanary();
  missingLesson.lessonId = "smb1-les99";
  assert.throws(
    () => miniExercises.validateMiniEndPositionExercises([missingLesson], { course: practiceHands.getSmb1Course() }),
    /unknown lesson/
  );

  const missingGoal = cloneCanary();
  missingGoal.learningGoalId = "smb1-les01-missing";
  assert.throws(
    () => miniExercises.validateMiniEndPositionExercises([missingGoal], { course: practiceHands.getSmb1Course() }),
    /unknown learning goal/
  );

  const badMode = cloneCanary();
  badMode.mode = "play-and-predict";
  assert.throws(
    () => miniExercises.normalizeMiniEndPositionExercise(badMode),
    /unsupported mode/
  );
});

test("mini end-position validator enforces trump, equal small hands and explanation", () => {
  const missingTrump = cloneCanary();
  delete missingTrump.situation.trump;
  assert.throws(
    () => miniExercises.normalizeMiniEndPositionExercise(missingTrump),
    /situation\.trump/
  );

  const textNotrump = cloneCanary();
  textNotrump.situation.trump = "NT";
  assert.throws(
    () => miniExercises.normalizeMiniEndPositionExercise(textNotrump),
    /invalid trump/
  );

  const unequal = cloneCanary();
  unequal.situation.hands.South = ["AS"];
  assert.throws(
    () => miniExercises.normalizeMiniEndPositionExercise(unequal),
    /equal hand lengths/
  );

  const tooLarge = cloneCanary();
  tooLarge.situation.hands = {
    North: ["AS", "KS", "QS", "JS", "TS", "9S", "8S", "7S"],
    East: ["AH", "KH", "QH", "JH", "TH", "9H", "8H", "7H"],
    South: ["AC", "KC", "QC", "JC", "TC", "9C", "8C", "7C"],
    West: ["AD", "KD", "QD", "JD", "TD", "9D", "8D", "7D"]
  };
  assert.throws(
    () => miniExercises.normalizeMiniEndPositionExercise(tooLarge),
    /1 to 7 cards/
  );

  const missingExplanation = cloneCanary();
  missingExplanation.explanation = { correct: "Goed." };
  assert.throws(
    () => miniExercises.normalizeMiniEndPositionExercise(missingExplanation),
    /explanation\.why/
  );
});

test("mini end-position validator normalizes a seven-card position", () => {
  const sevenCards = cloneCanary();
  sevenCards.id = "seven-card-position";
  sevenCards.situation.trump = "S";
  sevenCards.situation.hands = {
    North: ["AS", "KS", "QS", "JS", "TS", "9S", "8S"],
    East: ["AH", "KH", "QH", "JH", "TH", "9H", "8H"],
    South: ["AC", "KC", "QC", "JC", "TC", "9C", "8C"],
    West: ["AD", "KD", "QD", "JD", "TD", "9D", "8D"]
  };

  const normalized = miniExercises.normalizeMiniEndPositionExercise(sevenCards);
  assert.equal(normalized.situation.trump, "S");
  for (const seat of ["North", "East", "South", "West"]) {
    assert.equal(normalized.situation.hands[seat].length, 7, seat);
  }
});

function cloneCanary() {
  return miniExercises.cloneExercises()[0];
}

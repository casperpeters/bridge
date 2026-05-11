const { assert, test } = require("./harness.js");
const practiceHands = require("../../practice-hands/index.js");
const lessons = require("../../scripts/learning/lessons.js");
const lesson02ValuationData = require("../../scripts/learning/lesson-02-valuation-data.js");
const lesson03OpeningsData = require("../../scripts/learning/lesson-03-openings-data.js");

test("lesson catalog is valid and points at existing practice hands", () => {
  assert.equal(lessons.validateLessons(practiceHands), 12);
  assert.deepEqual(
    lessons.allLessons().map((lesson) => lesson.number),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  );
  assert.equal(lessons.allLessons()[0].id, "les-01-wat-is-bridge");
  assert.equal(lessons.allLessons()[0].chapters.length, 9);
  assert.equal(lessons.allLessons()[0].chapters.find((chapter) => chapter.id === "een-slag").quiz.length, 3);
  assert.ok(lessons.allLessons()[0].chapters.find((chapter) => chapter.id === "speelsoorten"));
  assert.ok(lessons.allLessons()[0].chapters.find((chapter) => chapter.id === "leider-en-dummy"));
  assert.ok(lessons.allLessons()[0].chapters.find((chapter) => chapter.id === "spelverloop"));
  assert.equal(lessons.allLessons()[0].chapters.find((chapter) => chapter.id === "bekennen-moet").handId, "draw-trumps-001");
  assert.equal(lessons.allLessons()[0].learningGoals.length, 5);
  const lessonTwo = lessons.allLessons()[1];
  assert.equal(lessonTwo.title, "Kaarten waarderen");
  assert.equal(lessonTwo.pageHref, "02-card-valuation.html");
  assert.equal(lessonTwo.learningGoals.length, 5);
  assert.deepEqual(lessonTwo.handIds, ["one-nt-opening-001", "opening-pass-001", "one-heart-opening-001"]);
  assert.ok(lessonTwo.chapters.find((chapter) => chapter.id === "hcp-tellen"));
  assert.equal(lessonTwo.chapters.find((chapter) => chapter.id === "een-sa-opening-herkennen").handId, "one-nt-opening-001");
  assert.equal(lessonTwo.chapters.find((chapter) => chapter.id === "een-sa-opening-herkennen").tableTask.type, "bid");
  assert.deepEqual(lessonTwo.chapters.find((chapter) => chapter.id === "een-sa-opening-herkennen").tableTask.expectedAction.calls, ["1NT"]);
  assert.equal(lessonTwo.chapters.find((chapter) => chapter.id === "een-sa-opening-herkennen").boardGuidance[0].target, "bidControls");
  const lessonThree = lessons.allLessons()[2];
  assert.equal(lessonThree.title, "Openen in Vijfkaart-Hoog");
  assert.equal(lessonThree.pageHref, "03-openings.html");
  assert.equal(lessonThree.learningGoals.length, 5);
  assert.equal(lessonThree.handIds.length, 28);
  assert.equal(lessonThree.chapters.length, 6);
  assert.equal(lessonThree.chapters.find((chapter) => chapter.id === "een-sa-gaat-voor").handId, "lesson-03-one-nt-five-heart-001");
  assert.deepEqual(lessonThree.chapters.find((chapter) => chapter.id === "een-sa-gaat-voor").tableTask.expectedAction.calls, ["1NT"]);
  assert.deepEqual(lessonThree.chapters.find((chapter) => chapter.id === "zwakke-twee-bonus").tableTask.expectedAction.calls, ["2H"]);
  assert.equal(lessonThree.chapters.find((chapter) => chapter.id === "regel-van-20-voorzichtig").boardGuidance[0].target, "bidControls");
  assert.deepEqual(
    lessons.allLessons()[0].boardGuidance.map((step) => step.id),
    [
      "contractIntro",
      "openingLeadIntro",
      "dummyReveal",
      "declarerControlsDummy",
      "trickMeaning",
      "followSuit",
      "trumpMeaning",
      "trickWinner",
      "reviewResult"
    ]
  );

  for (const lesson of lessons.allLessons()) {
    assert.ok(lesson.id, "lesson must have an id");
    assert.ok(lesson.title, `${lesson.id} must have a title`);
    assert.ok(lesson.challenge, `${lesson.id} must have a challenge`);
    assert.ok(lesson.focus.length, `${lesson.id} must have focus labels`);
    assert.ok(lesson.handIds.length, `${lesson.id} must have practice hands`);
    lesson.handIds.forEach((handId) => {
      assert.ok(practiceHands.findPracticeHand(handId), `${lesson.id} refers to ${handId}`);
    });
    (lesson.chapters || []).forEach((chapter) => {
      assert.ok(chapter.id, `${lesson.id} chapter must have an id`);
      assert.ok(chapter.title, `${lesson.id} chapter ${chapter.id} must have a title`);
      assert.ok(chapter.summary, `${lesson.id} chapter ${chapter.id} must have a summary`);
      if (chapter.handId) assert.ok(practiceHands.findPracticeHand(chapter.handId), `${lesson.id} chapter ${chapter.id} refers to ${chapter.handId}`);
      if (chapter.tableTask) {
        assert.ok(chapter.tableTask.doneTitle, `${lesson.id} chapter ${chapter.id} table task must have done title`);
        assert.ok(chapter.tableTask.returnLabel, `${lesson.id} chapter ${chapter.id} table task must have return label`);
      }
    });
    (lesson.boardGuidance || []).forEach((step) => {
      assert.ok(step.id, `${lesson.id} board step must have an id`);
      assert.ok(step.title, `${lesson.id} board step ${step.id} must have a title`);
      assert.ok(step.body, `${lesson.id} board step ${step.id} must have body text`);
      assert.ok(step.target, `${lesson.id} board step ${step.id} must have a target`);
      assert.ok(step.gate, `${lesson.id} board step ${step.id} must have a gate`);
    });
  }
});

test("lesson table task completion detects one-bid and one-card situations", () => {
  const bidTask = lessons.findLessonChapter("les-02-punten-en-handtypen", "een-sa-opening-herkennen").tableTask;
  assert.equal(lessons.tableTaskCompleted(bidTask, { phase: "bidding", auction: [] }), false);
  assert.equal(lessons.tableTaskCompleted(bidTask, {
    phase: "bidding",
    auction: [{ seat: "South", bid: { type: "Bid", level: 1, strain: "NT" } }]
  }), true);

  const cardTask = lessons.findLessonChapter("les-01-wat-is-bridge", "bekennen-moet").tableTask;
  assert.equal(lessons.tableTaskCompleted(cardTask, {
    phase: "playing",
    currentTrick: [{ seat: "West", card: { id: "TD" } }],
    trickHistory: []
  }), false);
  assert.equal(lessons.tableTaskCompleted(cardTask, {
    phase: "playing",
    currentTrick: [
      { seat: "West", card: { id: "TD" } },
      { seat: "North", card: { id: "5D" } }
    ],
    trickHistory: []
  }), true);
});

test("lesson expected actions give retry feedback for wrong bids and cards", () => {
  const bidTask = lessons.findLessonChapter("les-02-punten-en-handtypen", "een-sa-opening-herkennen").tableTask;
  assert.equal(lessons.tableTaskActionFeedback(bidTask, {
    type: "bid",
    seat: "South",
    bid: { type: "Bid", level: 1, strain: "NT" }
  }), null);
  assert.match(lessons.tableTaskActionFeedback(bidTask, {
    type: "bid",
    seat: "South",
    bid: { type: "Pass" }
  }).body, /1SA-opening/);

  const cardTask = lessons.findLessonChapter("les-01-wat-is-bridge", "bekennen-moet").tableTask;
  assert.equal(lessons.tableTaskActionFeedback(cardTask, {
    type: "card",
    seat: "North",
    card: { id: "5D", suit: "D" }
  }), null);
  assert.match(lessons.tableTaskActionFeedback(cardTask, {
    type: "card",
    seat: "North",
    card: { id: "QD", suit: "D" }
  }).body, /5 ruiten/);
});

test("lesson 2 valuation page data has valid question, quiz and race hand content", () => {
  const validKinds = new Set(["hcp", "balanced", "longest", "fitValue"]);
  const validSuits = new Set(["S", "H", "D", "C"]);

  for (const question of lesson02ValuationData.allValuationQuestions()) {
    assert.ok(validKinds.has(question.kind), `${question.prompt} must use a known question kind`);
    assert.equal(cardCount(question.hand), 13, `${question.prompt} must contain 13 cards`);
    assert.ok(question.prompt, "valuation question must have a prompt");
    assert.ok(question.good, `${question.prompt} must have positive feedback`);
    assert.ok(question.wrong, `${question.prompt} must have retry feedback`);
    if (question.answerSuit) assert.ok(validSuits.has(question.answerSuit), `${question.prompt} answerSuit must be valid`);
    if (question.answer) assert.ok(["yes", "no"].includes(question.answer), `${question.prompt} answer must be yes/no`);
  }

  for (const question of lesson02ValuationData.allMiniQuizQuestions()) {
    assert.ok(question.question, "mini quiz question must have text");
    assert.ok(question.options.includes(question.answer), `${question.question} must include its answer option`);
    assert.ok(question.feedback, `${question.question} must have feedback`);
  }

  for (const [criterion, hand] of Object.entries(lesson02ValuationData.allFallbackHands())) {
    assert.equal(cardCount(hand), 13, `${criterion} fallback hand must contain 13 cards`);
  }

  for (const hand of lesson02ValuationData.allRaceHandTexts()) {
    assert.equal(cardCount(hand), 13, "race hand must contain 13 cards");
  }
});

function cardCount(handText) {
  return String(handText || "").trim().split(/\s+/).filter(Boolean).length;
}

test("lesson 3 opening page data stays linked to lesson chapters and practice hands", () => {
  const lesson = lessons.findLesson("les-03-eerste-openingen");
  const lessonHandIds = new Set(lesson.handIds);
  const chapterIds = new Set(lesson.chapters.map((chapter) => chapter.id));
  const optionValues = new Set(lesson03OpeningsData.allOpeningOptions().map((option) => option.value));
  const questionIds = new Set();

  assert.deepEqual(lesson03OpeningsData.allCasinoQuestionIds(), lesson03OpeningsData.allCasinoQuestions().map((question) => question.id));

  for (const question of lesson03OpeningsData.allOpeningQuestions()) {
    assert.ok(question.id, "opening question must have an id");
    assert.equal(questionIds.has(question.id), false, `${question.id} must be unique`);
    questionIds.add(question.id);

    assert.ok(question.hand, `${question.id} must have a hand`);
    assert.ok(optionValues.has(question.answer), `${question.id} answer must match an opening option`);
    assert.ok(question.feedback, `${question.id} must have feedback`);

    if (question.handId) {
      assert.ok(lessonHandIds.has(question.handId), `${question.id} hand must be listed on lesson 3`);
      assert.ok(practiceHands.findPracticeHand(question.handId), `${question.id} hand must exist in practice hands`);
    }

    if (question.chapterId) {
      assert.ok(chapterIds.has(question.chapterId), `${question.id} chapter must exist on lesson 3`);
      assert.equal(
        lessons.findLessonChapter(lesson.id, question.chapterId).handId,
        question.handId,
        `${question.id} table chapter must point at the same hand`
      );
    }
  }
});

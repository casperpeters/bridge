const { assert, test } = require("./harness.js");
const practiceHands = require("../../practice-hands/index.js");
const lessons = require("../../scripts/learning/lessons.js");

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
  assert.equal(lessonTwo.pageHref, "lesson-02-card-valuation.html");
  assert.equal(lessonTwo.learningGoals.length, 5);
  assert.deepEqual(lessonTwo.handIds, ["one-nt-opening-001", "opening-pass-001", "one-heart-opening-001"]);
  assert.ok(lessonTwo.chapters.find((chapter) => chapter.id === "hcp-tellen"));
  assert.equal(lessonTwo.chapters.find((chapter) => chapter.id === "een-sa-opening-herkennen").handId, "one-nt-opening-001");
  assert.equal(lessonTwo.chapters.find((chapter) => chapter.id === "een-sa-opening-herkennen").tableTask.type, "bid");
  assert.deepEqual(lessonTwo.chapters.find((chapter) => chapter.id === "een-sa-opening-herkennen").tableTask.expectedAction.calls, ["1NT"]);
  assert.equal(lessonTwo.chapters.find((chapter) => chapter.id === "een-sa-opening-herkennen").boardGuidance[0].target, "bidControls");
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

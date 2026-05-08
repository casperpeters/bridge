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
  assert.equal(lessons.allLessons()[0].chapters.length, 5);
  assert.equal(lessons.allLessons()[0].chapters.find((chapter) => chapter.id === "een-slag").quiz.length, 3);
  assert.equal(lessons.allLessons()[0].chapters.find((chapter) => chapter.id === "bekennen-moet").handId, "draw-trumps-001");

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
    });
  }
});

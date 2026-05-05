const { assert, test } = require("./harness.js");
const practiceHands = require("../../practice-hands/index.js");
const lessons = require("../../scripts/lessons.js");

test("lesson catalog is valid and points at existing practice hands", () => {
  assert.equal(lessons.validateLessons(practiceHands), 12);
  assert.deepEqual(
    lessons.allLessons().map((lesson) => lesson.number),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  );
  assert.equal(lessons.allLessons()[0].id, "les-01-wat-is-bridge");
  assert.equal(lessons.allLessons()[0].miniQuiz.length, 3);

  for (const lesson of lessons.allLessons()) {
    assert.ok(lesson.id, "lesson must have an id");
    assert.ok(lesson.title, `${lesson.id} must have a title`);
    assert.ok(lesson.challenge, `${lesson.id} must have a challenge`);
    assert.ok(lesson.focus.length, `${lesson.id} must have focus labels`);
    assert.ok(lesson.handIds.length, `${lesson.id} must have practice hands`);
    lesson.handIds.forEach((handId) => {
      assert.ok(practiceHands.findPracticeHand(handId), `${lesson.id} refers to ${handId}`);
    });
  }
});

const { assert, test } = require("./harness.js");
const smb1Course = require("../../practice-hands/smb1-course.js");
const practiceHands = require("../../practice-hands/index.js");

test("SMB1 course data contains exactly 12 stable lessons and learning goals", () => {
  const summary = smb1Course.validateCourse();
  const course = smb1Course.cloneCourse();

  assert.equal(course.id, "start-met-bridge-1");
  assert.equal(course.title, "Start met Bridge 1");
  assert.equal(summary.lessonCount, 12);
  assert.equal(summary.learningGoalCount, 95);
  assert.deepEqual(course.lessons.map((lesson) => lesson.number), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  assert.deepEqual(course.lessons.map((lesson) => lesson.id), [
    "smb1-les01",
    "smb1-les02",
    "smb1-les03",
    "smb1-les04",
    "smb1-les05",
    "smb1-les06",
    "smb1-les07",
    "smb1-les08",
    "smb1-les09",
    "smb1-les10",
    "smb1-les11",
    "smb1-les12"
  ]);
  assert.deepEqual(course.lessons.map((lesson) => lesson.learningGoals.length), [8, 7, 7, 8, 8, 8, 9, 7, 7, 8, 9, 9]);

  const lessonIds = new Set();
  const goalIds = new Set();
  for (const lesson of course.lessons) {
    assert.ok(lesson.title.trim(), lesson.id);
    assert.equal(lessonIds.has(lesson.id), false, lesson.id);
    lessonIds.add(lesson.id);

    for (const learningGoal of lesson.learningGoals) {
      assert.match(learningGoal.id, /^smb1-les\d{2}-[a-z0-9-]+$/, learningGoal.id);
      assert.ok(learningGoal.text.trim(), learningGoal.id);
      assert.equal(goalIds.has(learningGoal.id), false, learningGoal.id);
      goalIds.add(learningGoal.id);
    }
  }
});

test("PracticeHands exposes SMB1 course data without replacing the technical hand API", () => {
  const course = practiceHands.getSmb1Course();

  assert.equal(course.lessons.length, 12);
  assert.equal(practiceHands.getSmb1Lessons().length, 12);
  assert.equal(practiceHands.findSmb1Lesson("smb1-les04").title, "Speelplan");
  assert.equal(practiceHands.findPracticeHand("smb1-les04-kleurcontract-plan").sourceHandId, "draw-trumps-001");
  assert.equal(practiceHands.validatePracticeHands(), 80);
});

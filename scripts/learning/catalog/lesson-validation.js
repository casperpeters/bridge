(function initBridgeLessonValidation(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const tableTask = isCommonJs ? require("../table/lesson-table-task.js") : root.BridgeLessonTableTask;
  const api = factory(tableTask);
  if (isCommonJs) module.exports = api;
  root.BridgeLessonValidation = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeLessonValidation(tableTask) {
  "use strict";

  const normalizeList = (...args) => tableTask.normalizeList(...args);

  function validateLessons(lessons, practiceApi) {
    const ids = new Set();
    for (const lesson of lessons) {
      if (!lesson.id || ids.has(lesson.id)) throw new Error(`Invalid lesson id: ${lesson.id}`);
      ids.add(lesson.id);
      if (!lesson.title) throw new Error(`Lesson ${lesson.id} is missing a title`);
      if (!lesson.challenge) throw new Error(`Lesson ${lesson.id} is missing a challenge`);
      if (!Array.isArray(lesson.focus) || !lesson.focus.length) throw new Error(`Lesson ${lesson.id} is missing focus labels`);
      if (!Array.isArray(lesson.handIds) || !lesson.handIds.length) throw new Error(`Lesson ${lesson.id} is missing hand ids`);
      for (const handId of lesson.handIds) {
        if (!practiceApi?.findPracticeHand?.(handId)) {
          throw new Error(`Lesson ${lesson.id} refers to unknown practice hand ${handId}`);
        }
      }
      validateLessonChapters(lesson, practiceApi);
      validateBoardGuidance(lesson);
      validateTableTask(lesson.id, "lesson", lesson.tableTask);
      if (lesson.startMode === "play") {
        const scenario = practiceApi?.findPracticeHand?.(lesson.handIds[0]);
        if (!scenario?.expectedContract) throw new Error(`Lesson ${lesson.id} needs an expected contract for play start`);
      }
    }
    return lessons.length;
  }

  function validateLessonChapters(lesson, practiceApi) {
    if (!lesson.chapters) return;
    if (!Array.isArray(lesson.chapters)) throw new Error(`Lesson ${lesson.id} chapters must be an array`);
    const ids = new Set();
    for (const chapter of lesson.chapters) {
      if (!chapter.id || ids.has(chapter.id)) throw new Error(`Lesson ${lesson.id} has an invalid chapter id`);
      ids.add(chapter.id);
      if (!chapter.title) throw new Error(`Lesson ${lesson.id} chapter ${chapter.id} is missing a title`);
      if (!chapter.summary) throw new Error(`Lesson ${lesson.id} chapter ${chapter.id} is missing a summary`);
      if (chapter.handId && !practiceApi?.findPracticeHand?.(chapter.handId)) {
        throw new Error(`Lesson ${lesson.id} chapter ${chapter.id} refers to unknown practice hand ${chapter.handId}`);
      }
      validateTableTask(lesson.id, chapter.id, chapter.tableTask);
      if (chapter.boardGuidance) validateBoardGuidance({ ...lesson, id: `${lesson.id} chapter ${chapter.id}`, boardGuidance: chapter.boardGuidance });
      if (chapter.quiz) validateQuiz(lesson.id, chapter.id, chapter.quiz);
    }
  }

  function validateQuiz(lessonId, chapterId, questions) {
    if (!Array.isArray(questions) || !questions.length) throw new Error(`Lesson ${lessonId} chapter ${chapterId} has an empty quiz`);
    questions.forEach((question, index) => {
      if (!question.question || !question.answer) throw new Error(`Lesson ${lessonId} chapter ${chapterId} quiz ${index + 1} is incomplete`);
      if (!Array.isArray(question.options) || !question.options.includes(question.answer)) {
        throw new Error(`Lesson ${lessonId} chapter ${chapterId} quiz ${index + 1} is missing the answer option`);
      }
    });
  }

  function validateBoardGuidance(lesson) {
    if (!lesson.boardGuidance) return;
    if (!Array.isArray(lesson.boardGuidance)) throw new Error(`Lesson ${lesson.id} boardGuidance must be an array`);
    const ids = new Set();
    const validTargets = new Set(["contract", "openingLead", "dummy", "declarerAndDummy", "trickArea", "legalCards", "trumpCards", "trickWinner", "review", "bidControls", "auctionLog", "lessonPanel"]);
    const validGates = new Set(["releaseAutoPlay", "allowHumanPlay", "allowHumanBid", "advanceTrick", "none"]);
    lesson.boardGuidance.forEach((step, index) => {
      if (!step.id || ids.has(step.id)) throw new Error(`Lesson ${lesson.id} boardGuidance step ${index + 1} has an invalid id`);
      ids.add(step.id);
      if (!step.title || !step.body || !step.badge) throw new Error(`Lesson ${lesson.id} boardGuidance step ${step.id} is incomplete`);
      if (!validTargets.has(step.target)) throw new Error(`Lesson ${lesson.id} boardGuidance step ${step.id} has unknown target ${step.target}`);
      if (!validGates.has(step.gate)) throw new Error(`Lesson ${lesson.id} boardGuidance step ${step.id} has unknown gate ${step.gate}`);
      if (step.gate !== "none" && !step.buttonLabel) throw new Error(`Lesson ${lesson.id} boardGuidance step ${step.id} needs a button label`);
    });
  }

  function validateTableTask(lessonId, ownerId, task) {
    if (!task) return;
    const validTypes = new Set(["bid", "card", "trick", "review", "hand"]);
    const validCompletions = new Set(["southBid", "humanBid", "northSouthCard", "humanCard", "trickWinnerShown", "reviewReached", "handComplete"]);
    if (!validTypes.has(task.type)) throw new Error(`Lesson ${lessonId} ${ownerId} tableTask has unknown type ${task.type}`);
    if (!validCompletions.has(task.completion)) throw new Error(`Lesson ${lessonId} ${ownerId} tableTask has unknown completion ${task.completion}`);
    if (!task.doneTitle || !task.doneBody || !task.returnLabel) throw new Error(`Lesson ${lessonId} ${ownerId} tableTask is incomplete`);
    validateExpectedAction(lessonId, ownerId, task);
  }

  function validateExpectedAction(lessonId, ownerId, task) {
    const expected = task.expectedAction;
    if (!expected) return;
    if (expected.type !== task.type) throw new Error(`Lesson ${lessonId} ${ownerId} expectedAction type must match tableTask type`);
    if (expected.type === "bid" && !normalizeList(expected.calls || expected.call || expected.bid).length) {
      throw new Error(`Lesson ${lessonId} ${ownerId} bid expectedAction needs calls`);
    }
    if (expected.type === "card" && !normalizeList(expected.cardIds || expected.cards || expected.cardId || expected.suits || expected.suit).length) {
      throw new Error(`Lesson ${lessonId} ${ownerId} card expectedAction needs cardIds or suits`);
    }
    if (!expected.retryBody) throw new Error(`Lesson ${lessonId} ${ownerId} expectedAction needs retryBody`);
  }

  return {
    validateBoardGuidance,
    validateExpectedAction,
    validateLessonChapters,
    validateLessons,
    validateQuiz,
    validateTableTask
  };
});

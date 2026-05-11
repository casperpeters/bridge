(function initBridgeLessonCloning(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.BridgeLessonCloning = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeLessonCloning() {
  "use strict";

  function cloneLesson(lesson) {
    return {
      ...lesson,
      focus: [...lesson.focus],
      handIds: [...lesson.handIds],
      chapters: (lesson.chapters || []).map(cloneChapter),
      miniQuiz: lesson.miniQuiz ? cloneQuiz(lesson.miniQuiz) : undefined,
      reviewFeedback: lesson.reviewFeedback ? [...lesson.reviewFeedback] : undefined,
      tableTask: lesson.tableTask ? cloneTableTask(lesson.tableTask) : undefined,
      boardGuidance: lesson.boardGuidance ? lesson.boardGuidance.map(cloneBoardGuidanceStep) : undefined,
      teachingPoints: lesson.teachingPoints ? [...lesson.teachingPoints] : undefined,
      learningGoals: lesson.learningGoals ? [...lesson.learningGoals] : undefined
    };
  }

  function cloneChapter(chapter) {
    return {
      ...chapter,
      blocks: (chapter.blocks || []).map((block) => ({
        ...block,
        items: block.items ? [...block.items] : undefined
      })),
      tableTask: chapter.tableTask ? cloneTableTask(chapter.tableTask) : undefined,
      boardGuidance: chapter.boardGuidance ? chapter.boardGuidance.map(cloneBoardGuidanceStep) : undefined,
      quiz: chapter.quiz ? cloneQuiz(chapter.quiz) : undefined
    };
  }

  function cloneTableTask(task) {
    return {
      ...task,
      expectedAction: task.expectedAction ? cloneExpectedAction(task.expectedAction) : undefined
    };
  }

  function cloneExpectedAction(action) {
    return {
      ...action,
      calls: action.calls ? [...action.calls] : undefined,
      cardIds: action.cardIds ? [...action.cardIds] : undefined,
      cards: action.cards ? [...action.cards] : undefined,
      suits: action.suits ? [...action.suits] : undefined
    };
  }

  function cloneQuiz(questions) {
    return questions.map((question) => ({
      ...question,
      options: [...question.options]
    }));
  }

  function cloneBoardGuidanceStep(step) {
    return { ...step };
  }

  return {
    cloneBoardGuidanceStep,
    cloneChapter,
    cloneExpectedAction,
    cloneLesson,
    cloneQuiz,
    cloneTableTask
  };
});

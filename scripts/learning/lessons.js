(function initBridgeLessons(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const practiceHands = isCommonJs ? require("../../practice-hands/index.js") : root.PracticeHands;
  const catalog = isCommonJs ? require("./catalog/lesson-data.js") : root.BridgeLessonCatalog;
  const cloning = isCommonJs ? require("./catalog/lesson-cloning.js") : root.BridgeLessonCloning;
  const tableTask = isCommonJs ? require("./table/lesson-table-task.js") : root.BridgeLessonTableTask;
  const validation = isCommonJs ? require("./catalog/lesson-validation.js") : root.BridgeLessonValidation;
  const api = factory({ catalog, cloning, practiceHands, tableTask, validation });
  if (isCommonJs) module.exports = api;
  root.BridgeLessons = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeLessons(dependencies) {
  "use strict";

  const {
    catalog,
    cloning,
    practiceHands,
    tableTask,
    validation
  } = dependencies;

  if (!catalog?.lessonDefinitions) throw new Error("lesson-data.js must load before lessons.js");
  if (!cloning?.cloneLesson) throw new Error("lesson-cloning.js must load before lessons.js");
  if (!tableTask?.tableTaskCompleted) throw new Error("lesson-table-task.js must load before lessons.js");
  if (!validation?.validateLessons) throw new Error("lesson-validation.js must load before lessons.js");

  const lessons = catalog.lessonDefinitions;

  function allLessons() {
    return lessons.map(cloning.cloneLesson);
  }

  function findLesson(id) {
    return allLessons().find((lesson) => lesson.id === id) || null;
  }

  function findLessonChapter(lessonId, chapterId) {
    const lesson = findLesson(lessonId);
    if (!lesson || !chapterId) return null;
    return lesson.chapters?.find((chapter) => chapter.id === chapterId) || null;
  }

  function validateLessons(practiceApi = practiceHands) {
    return validation.validateLessons(lessons, practiceApi);
  }

  validateLessons();

  return {
    allLessons,
    findLesson,
    findLessonChapter,
    tableTaskActionFeedback: tableTask.tableTaskActionFeedback,
    tableTaskCompleted: tableTask.tableTaskCompleted,
    validateLessons
  };
});

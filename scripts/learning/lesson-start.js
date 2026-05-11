(function registerBridgeLessonStart(root) {
  "use strict";

  const modules = root.BridgeAppModules = root.BridgeAppModules || {};

  modules.registerLessonStart = function registerLessonStart(runtime) {
    const { actions, constants, helpers, render, state, transitions } = runtime;
    const { seats } = constants;
    const continuePlay = (...args) => actions.continuePlay(...args);
    const leftOf = (...args) => helpers.leftOf(...args);
    const partnerOf = (...args) => helpers.partnerOf(...args);
    const renderAll = (...args) => render.renderAll(...args);
    const setStatus = (...args) => actions.setStatus(...args);
    const startPracticeHand = (...args) => actions.startPracticeHand(...args);

function startLesson(lesson, handId, options = {}) {
  if (!lesson?.id || !handId) return;
  const lessonContext = lessonContextFromOptions(lesson, options);
  enterLessonMode();
  const startAtPlay = lesson.startMode === "play";
  const scenario = startPracticeHand(handId, { lesson, lessonContext, skipFlow: startAtPlay });
  if (!startAtPlay) return scenario;

  const expected = scenario.expectedContract;
  if (!expected) return scenario;
  const contract = globalThis.PracticeHands.contractFromText(expected.contract);
  Object.assign(state, transitions.finishAuctionTransition(state, {
    contract,
    declarer: expected.declarer,
    dummy: partnerOf(expected.declarer),
    leader: leftOf(expected.declarer),
    seats
  }));
  state.phase = "playing";
  renderAll();
  setStatus("lead", { leader: state.leader, declarer: state.declarer, dummy: state.dummy });
  continuePlay();
  return scenario;
}

function startLessonFromUrl() {
  const params = new URLSearchParams(globalThis.location?.search || "");
  const lessonId = params.get("lesson");
  const handId = params.get("hand");
  if (!lessonId || !handId) return false;

  const lesson = globalThis.BridgeLessons?.findLesson?.(lessonId);
  if (!lesson) return false;

  startLesson(lesson, handId, {
    chapterId: params.get("chapter") || null,
    returnHref: safeReturnHref(params.get("return"), lessonId, params.get("chapter"))
  });
  return true;
}

function lessonContextFromOptions(lesson, options = {}) {
  const chapter = options.chapterId ? globalThis.BridgeLessons?.findLessonChapter?.(lesson.id, options.chapterId) : null;
  return {
    chapterId: chapter?.id || options.chapterId || null,
    chapterTitle: chapter?.title || "",
    returnHref: options.returnHref || defaultReturnHref(lesson.id, chapter?.id || options.chapterId || null),
    tableTask: chapter?.tableTask || lesson.tableTask || null,
    boardGuidance: chapter?.boardGuidance || lesson.boardGuidance || []
  };
}

function enterLessonMode() {
  if (!state.lessonModeSettingsSnapshot) {
    state.lessonModeSettingsSnapshot = {
      developerMode: state.developerMode,
      guidanceMode: state.guidanceMode,
      showPlayHistory: state.showPlayHistory
    };
  }
  state.developerMode = false;
  state.guidanceMode = false;
  state.showPlayHistory = false;
  state.lessonTableTaskDone = false;
}

function exitLessonMode() {
  if (state.lessonModeSettingsSnapshot) {
    state.developerMode = Boolean(state.lessonModeSettingsSnapshot.developerMode);
    state.guidanceMode = Boolean(state.lessonModeSettingsSnapshot.guidanceMode);
    state.showPlayHistory = Boolean(state.lessonModeSettingsSnapshot.showPlayHistory);
  }
  state.lessonModeSettingsSnapshot = null;
  state.lessonTableTaskDone = false;
}

function isLessonModeActive() {
  return Boolean(state.practice?.lessonId);
}

function defaultReturnHref(lessonId, chapterId = null) {
  const href = new URL("lessons/index.html", globalThis.location?.href || "http://localhost/");
  href.searchParams.set("lesson", lessonId);
  if (chapterId) href.hash = chapterId;
  return `${href.pathname.replace(/^\/+/, "")}${href.search}${href.hash}`;
}

function safeReturnHref(value, lessonId, chapterId = null) {
  if (!value) return defaultReturnHref(lessonId, chapterId);
  try {
    const href = new URL(value, globalThis.location?.href || "http://localhost/");
    const path = href.pathname.replace(/^\/+/, "");
    if (path !== "lessons/index.html" && !/^lessons\/\d+-.+\.html$/.test(path)) return defaultReturnHref(lessonId, chapterId);
    return `${path}${href.search}${href.hash}`;
  } catch {
    return defaultReturnHref(lessonId, chapterId);
  }
}

    Object.assign(actions, {
      defaultLessonReturnHref: defaultReturnHref,
      enterLessonMode,
      exitLessonMode,
      isLessonModeActive,
      lessonContextFromOptions,
      startLesson,
      startLessonFromUrl
    });
  };
})(typeof globalThis !== "undefined" ? globalThis : this);

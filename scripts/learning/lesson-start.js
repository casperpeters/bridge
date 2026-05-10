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

function startLesson(lesson, handId) {
  if (!lesson?.id || !handId) return;
  const startAtPlay = lesson.startMode === "play";
  const scenario = startPracticeHand(handId, { lesson, skipFlow: startAtPlay });
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
  if (lesson.enableGuidance) state.guidanceMode = true;
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

  startLesson(lesson, handId);
  return true;
}

    Object.assign(actions, {
      startLesson,
      startLessonFromUrl
    });
  };
})(typeof globalThis !== "undefined" ? globalThis : this);

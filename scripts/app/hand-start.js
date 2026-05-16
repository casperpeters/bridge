(function registerBridgeHandStart(root) {
  "use strict";

  const modules = root.BridgeAppModules = root.BridgeAppModules || {};

  modules.registerHandStart = function registerHandStart(runtime) {
    const { actions, helpers, render, state, timers, transitions } = runtime;
    const { seats } = runtime.constants;

    function startHand({ replay = false, seed = null, preserveBoard = false, skipFlow = false } = {}) {
      actions.exitLessonMode?.();
      const reuseCurrentDeal = replay && state.dealSeed && state.dealNumber > 0;
      const loadedSeed = actions.normalizeSeed(seed);
      if (!reuseCurrentDeal) {
        if (!preserveBoard || state.dealNumber === 0) state.dealNumber += 1;
        state.dealSeed = loadedSeed || actions.createDealSeed();
      }
      startPreparedHand({
        dealerIndex: helpers.dealerIndexForDeal(state.dealNumber),
        vulnerability: helpers.vulnerabilityForDeal(state.dealNumber),
        hands: helpers.dealHands(state.dealSeed),
        practice: null,
        clearSeedMessage: !loadedSeed,
        skipFlow
      });
    }

    function startPracticeHand(handId, { preserveBoard = false, skipFlow = false, lesson = null, lessonContext = null } = {}) {
      if (!globalThis.PracticeHands) throw new Error("practice-hands/index.js must load before practice hands can be used");
      if (!lesson) actions.exitLessonMode?.();
      const scenario = globalThis.PracticeHands.preparePracticeHand(handId);
      if (!preserveBoard || state.dealNumber === 0) state.dealNumber += 1;

      state.dealSeed = scenario.id;
      startPreparedHand({
        dealerIndex: seats.indexOf(scenario.dealer),
        vulnerability: scenario.vulnerability,
        hands: scenario.hands,
        practice: practiceStateFromScenario(scenario, lesson, lessonContext),
        skipFlow
      });
      return scenario;
    }

    function startPracticeHandFromUrl() {
      const params = new URLSearchParams(globalThis.location?.search || "");
      const handId = params.get("hand");
      if (!handId || params.get("lesson")) return false;
      if (!globalThis.PracticeHands?.findPracticeHand?.(handId)) return false;
      startPracticeHand(handId);
      return true;
    }

    function startInteractiveExercise(exerciseOrId, { returnHref = "" } = {}) {
      if (!globalThis.PracticeHands?.findVisibleInteractiveSmb1Exercise) {
        throw new Error("practice-hands/index.js must load before interactive exercises can be used");
      }
      const exercise = typeof exerciseOrId === "string"
        ? globalThis.PracticeHands.findVisibleInteractiveSmb1Exercise(exerciseOrId)
        : exerciseOrId;
      if (!exercise?.startSeed) throw new Error(`Unknown interactive SMB1 exercise: ${exerciseOrId}`);

      actions.startSituationSeed(exercise.startSeed);
      state.interactiveExercise = interactiveExerciseState(exercise, { returnHref });
      render.renderAll();
      return exercise;
    }

    function startInteractiveExerciseFromUrl() {
      const params = new URLSearchParams(globalThis.location?.search || "");
      const exerciseId = params.get("exercise");
      if (!exerciseId) return false;
      if (!globalThis.PracticeHands?.findVisibleInteractiveSmb1Exercise?.(exerciseId)) return false;
      startInteractiveExercise(exerciseId, { returnHref: params.get("return") || "" });
      return true;
    }

    function interactiveExerciseState(exercise, { returnHref = "" } = {}) {
      return {
        id: exercise.id,
        title: exercise.title,
        lessonId: exercise.lessonId,
        learningGoalId: exercise.learningGoalId,
        sourceHandId: exercise.sourceHandId,
        startSeed: exercise.startSeed,
        question: exercise.question,
        actionType: exercise.actionType,
        expectedAction: exercise.expectedAction ? { ...exercise.expectedAction } : null,
        correctAnswers: [...(exercise.correctAnswers || [])],
        expectedActionLabel: exercise.expectedActionLabel || "",
        feedbackCopy: exercise.feedback ? JSON.parse(JSON.stringify(exercise.feedback)) : {},
        actionFeedback: null,
        status: "active",
        completed: false,
        returnHref: returnHref || ""
      };
    }

    function startPreparedHand({ dealerIndex, vulnerability, hands, practice = null, clearSeedMessage = false, skipFlow = false }) {
      resetScheduledFlow();
      clearDealAnimationTimer();
      timers.dealAnimationHandsLocked = false;
      Object.assign(state, transitions.startPreparedHandTransition({
        dealerIndex,
        vulnerability,
        hands,
        originalHands: helpers.cloneHands(hands),
        practice
      }));
      state.lessonBoardAcknowledged = [];
      state.lessonTableTaskDone = false;
      state.lessonActionFeedback = null;
      state.interactiveExercise = null;
      if (timers.illegalActionFeedbackTimer) {
        window.clearTimeout(timers.illegalActionFeedbackTimer);
        timers.illegalActionFeedbackTimer = null;
      }
      state.handSuitFocus = null;
      if (clearSeedMessage) state.seedMessage = null;
      render.clearTrickSlots();
      if (skipFlow) {
        state.animateDeal = false;
        timers.dealAnimationHandsLocked = false;
        actions.setStatus("opensAuction", { seat: helpers.seatAt(state.turnIndex) });
        return;
      }
      render.renderAll();
      scheduleDealAnimationEnd();
      actions.setStatus("dealing");
    }

    function resetScheduledFlow() {
      timers.flowGeneration += 1;
    }

    function scheduleDealAnimationEnd() {
      clearDealAnimationTimer();
      const dealAnimationMs = actions.prefersReducedMotion() ? 0 : 1400;
      timers.dealAnimationTimer = window.setTimeout(() => {
        state.animateDeal = false;
        timers.dealAnimationHandsLocked = false;
        timers.dealAnimationHandRenderSnapshot = null;
        timers.dealAnimationTimer = null;
        render.renderHands();
        actions.setStatus("opensAuction", { seat: helpers.seatAt(state.turnIndex) });
        actions.continueAuction();
      }, dealAnimationMs);
    }

    function clearDealAnimationTimer() {
      if (timers.dealAnimationTimer) window.clearTimeout(timers.dealAnimationTimer);
      timers.dealAnimationTimer = null;
      timers.dealAnimationHandsLocked = false;
      timers.dealAnimationHandRenderSnapshot = null;
    }

    function replayHand() {
      if (state.practice?.id) {
        const lesson = state.practice.lessonId ? globalThis.BridgeLessons?.findLesson?.(state.practice.lessonId) || null : null;
        const lessonContext = lesson ? lessonContextFromPractice() : null;
        if (lesson) actions.enterLessonMode?.();
        startPracticeHand(state.practice.id, { preserveBoard: true, lesson, lessonContext });
        return;
      }
      startHand({ replay: true });
    }

    function lessonContextFromPractice() {
      return {
        chapterId: state.practice?.lessonChapterId || null,
        chapterTitle: state.practice?.lessonChapterTitle || "",
        returnHref: state.practice?.lessonReturnHref || "",
        tableTask: state.practice?.lessonTableTask || null,
        boardGuidance: state.practice?.lessonBoardGuidance || []
      };
    }

    function practiceStateFromScenario(scenario, lesson = null, lessonContext = null) {
      const context = lesson ? lessonContext || {} : {};
      return {
        id: scenario.id,
        title: scenario.title,
        level: scenario.level,
        focus: [...(scenario.focus || [])],
        systemId: scenario.systemId,
        expectedAuction: scenario.expectedAuction || [],
        expectedContract: scenario.expectedContract || null,
        expectedPlayPlan: scenario.expectedPlayPlan || null,
        expectedScore: scenario.expectedScore || null,
        teachingPoints: lesson?.teachingPoints ? [...lesson.teachingPoints] : (scenario.teachingPoints || []),
        explanationKeys: scenario.explanationKeys || [],
        testGoal: scenario.testGoal || "",
        lessonId: lesson?.id || null,
        lessonNumber: lesson?.number || null,
        lessonTitle: lesson?.title || "",
        challenge: lesson?.challenge || "",
        lessonStartMode: lesson?.startMode || "",
        lessonFocus: lesson?.focus ? [...lesson.focus] : [],
        lessonIntro: lesson?.intro || "",
        lessonReviewFeedback: lesson?.reviewFeedback ? [...lesson.reviewFeedback] : [],
        lessonChapterId: context.chapterId || null,
        lessonChapterTitle: context.chapterTitle || "",
        lessonReturnHref: context.returnHref || "",
        lessonTableTask: context.tableTask ? { ...context.tableTask } : null,
        lessonBoardGuidance: context.boardGuidance ? context.boardGuidance.map((step) => ({ ...step })) : (lesson?.boardGuidance ? lesson.boardGuidance.map((step) => ({ ...step })) : [])
      };
    }

    Object.assign(actions, {
      clearDealAnimationTimer,
      lessonContextFromPractice,
      practiceStateFromScenario,
      replayHand,
      resetScheduledFlow,
      scheduleDealAnimationEnd,
      startInteractiveExercise,
      startInteractiveExerciseFromUrl,
      startHand,
      startPracticeHand,
      startPracticeHandFromUrl,
      startPreparedHand
    });
  };
})(typeof globalThis !== "undefined" ? globalThis : this);

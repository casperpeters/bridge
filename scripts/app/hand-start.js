(function registerBridgeHandStart(root) {
  "use strict";

  const modules = root.BridgeAppModules = root.BridgeAppModules || {};

  modules.registerHandStart = function registerHandStart(runtime) {
    const { actions, helpers, render, state, timers, transitions } = runtime;
    const { seats } = runtime.constants;

    function startHand({ replay = false, seed = null, preserveBoard = false, skipFlow = false } = {}) {
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

    function startPracticeHand(handId, { preserveBoard = false, skipFlow = false, lesson = null } = {}) {
      if (!globalThis.PracticeHands) throw new Error("practice-hands/index.js must load before practice hands can be used");
      const scenario = globalThis.PracticeHands.preparePracticeHand(handId);
      if (!preserveBoard || state.dealNumber === 0) state.dealNumber += 1;

      state.dealSeed = scenario.id;
      startPreparedHand({
        dealerIndex: seats.indexOf(scenario.dealer),
        vulnerability: scenario.vulnerability,
        hands: scenario.hands,
        practice: practiceStateFromScenario(scenario, lesson),
        skipFlow
      });
      return scenario;
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
        startPracticeHand(state.practice.id, { preserveBoard: true });
        return;
      }
      startHand({ replay: true });
    }

    function practiceStateFromScenario(scenario, lesson = null) {
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
        lessonBoardGuidance: lesson?.boardGuidance ? lesson.boardGuidance.map((step) => ({ ...step })) : []
      };
    }

    Object.assign(actions, {
      clearDealAnimationTimer,
      practiceStateFromScenario,
      replayHand,
      resetScheduledFlow,
      scheduleDealAnimationEnd,
      startHand,
      startPracticeHand,
      startPreparedHand
    });
  };
})(typeof globalThis !== "undefined" ? globalThis : this);

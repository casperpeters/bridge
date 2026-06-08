(function registerBridgePublicApi(root) {
  "use strict";

  const modules = root.BridgeAppModules = root.BridgeAppModules || {};

  modules.registerPublicApi = function registerPublicApi(runtime) {
    const { actions, els, helpers, render, rules, state } = runtime;

    const BridgeApp = {
      state,
      els,
      rules,
      actions: {
        startHand: actions.startHand,
        startPracticeHand: actions.startPracticeHand,
        startInteractiveExercise: actions.startInteractiveExercise,
        startMiniEndPositionExercise: actions.startMiniEndPositionExercise,
        startLesson: actions.startLesson,
        autoCompleteAuction: actions.autoCompleteAuction,
        enterContractReveal: actions.enterContractReveal,
        startPlayFromContractReveal: actions.startPlayFromContractReveal,
        autoCompletePlay: actions.autoCompletePlay,
        currentUitspelenAnalysis: actions.currentUitspelenAnalysis,
        playOutDeterministicEnding: actions.playOutDeterministicEnding,
        continuePlay: actions.continuePlay,
        playCard: actions.playCard,
        makeBid: actions.makeBid,
        replayHand: actions.replayHand,
        jumpToTrickOverview: actions.jumpToTrickOverview,
        createSituationSeed: actions.createSituationSeed
      },
      render: {
        renderAll: render.renderAll,
        renderHands: render.renderHands,
        renderAuction: render.renderAuction,
        renderBidControls: render.renderBidControls,
        renderPlayPlan: render.renderPlayPlan,
        renderHistory: render.renderHistory,
        renderReview: render.renderReview,
        renderScoreTable: render.renderScoreTable,
        renderPlayedCard: render.renderPlayedCard,
        clearTrickSlots: render.clearTrickSlots
      },
      helpers: {
        seatAt: helpers.seatAt,
        seatName: helpers.seatName,
        suitName: helpers.suitName,
        cardText: helpers.cardText,
        legalCards: helpers.legalCards,
        chooseCard: actions.chooseCard,
        autoPlayCard: actions.autoPlayCard,
        chooseCardPlayResult: actions.chooseCardPlayResult,
        chooseRecommendedBidResult: actions.chooseRecommendedBidResult,
        currentRecommendedCard: actions.currentRecommendedCard,
        sameCall: helpers.sameCall
      }
    };

    root.BridgeApp = BridgeApp;
    root.BridgeAppContext = BridgeApp;
    runtime.publicApi = BridgeApp;

    if (new URLSearchParams(root.location?.search || "").has("testHooks")) {
      root.BridgeAppTestHooks = createBridgeAppTestHooks(BridgeApp);
    }

    function createBridgeAppTestHooks(app) {
      const setState = (nextState) => {
        const patch = typeof nextState === "function" ? nextState(state) : nextState;
        if (!patch || typeof patch !== "object") return getState();
        Object.assign(state, patch);
        return getState();
      };

      const setDeveloperMode = (enabled) => {
        state.developerMode = Boolean(enabled);
        render.renderAll();
        return getState();
      };

      const setGuidanceMode = (enabled) => {
        state.guidanceMode = Boolean(enabled);
        render.renderAll();
        return getState();
      };

      return {
        app,
        rules,
        startHand: actions.startHand,
        startPracticeHand: actions.startPracticeHand,
        startInteractiveExercise: actions.startInteractiveExercise,
        startMiniEndPositionExercise: actions.startMiniEndPositionExercise,
        startLesson: actions.startLesson,
        autoCompleteAuction: actions.autoCompleteAuction,
        enterContractReveal: actions.enterContractReveal,
        startPlayFromContractReveal: actions.startPlayFromContractReveal,
        autoCompletePlay: actions.autoCompletePlay,
        currentUitspelenAnalysis: actions.currentUitspelenAnalysis,
        playOutDeterministicEnding: actions.playOutDeterministicEnding,
        renderAll: render.renderAll,
        continuePlay: actions.continuePlay,
        playCard: actions.playCard,
        makeBid: actions.makeBid,
        setState,
        getState,
        makeCard,
        clearTrickSlots: render.clearTrickSlots,
        renderPlayedCard: render.renderPlayedCard,
        setDeveloperMode,
        setGuidanceMode,
        loadSeedFromInput: actions.loadSeedFromInput,
        createSituationSeed: actions.createSituationSeed,
        chooseRecommendedBidResult: actions.chooseRecommendedBidResult,
        chooseCardPlayResult: actions.chooseCardPlayResult,
        chooseCard: actions.chooseCard,
        autoPlayCard: actions.autoPlayCard,
        legalCards: helpers.legalCards,
        seatAt: helpers.seatAt,
        sameCall: helpers.sameCall,
        getEls: () => els
      };
    }

    function getState() {
      return JSON.parse(JSON.stringify(state));
    }

    function makeCard(id) {
      return { id, rank: id.slice(0, -1), suit: id.slice(-1) };
    }
  };
})(typeof globalThis !== "undefined" ? globalThis : this);

(function registerBridgeHandFinishFlow(root) {
  "use strict";

  const modules = root.BridgeAppModules = root.BridgeAppModules || {};

  modules.registerHandFinishFlow = function registerHandFinishFlow(runtime) {
    const { actions, helpers, render, state, transitions } = runtime;

    function finishHand() {
      const finalScore = finalScoreForCurrentContract();
      if (!finalScore) return;
      Object.assign(state, transitions.finishHandTransition(state, { finalScore }));
      const needed = state.contract.level + 6;
      const made = state.finalScore.made;
      const resultKey = made >= needed ? "made" : "down";
      const resultArgs = made >= needed ? { over: made - needed } : { under: needed - made };
      actions.setStatus("contractResult", { contract: helpers.formatBid(state.contract), declarer: state.declarer, resultKey, resultArgs });
      render.renderAll();
    }

    function recomputeFinalScore() {
      const finalScore = finalScoreForCurrentContract();
      if (finalScore) state.finalScore = finalScore;
    }

    function finalScoreForCurrentContract() {
      if (!state.contract || !state.declarer) return null;
      const declaringTeam = helpers.teamOf(state.declarer);
      const defenders = declaringTeam === "NS" ? "EW" : "NS";
      const made = state.tricks[declaringTeam];
      const finalScore = helpers.calculateBridgeScore({
        contract: state.contract,
        declarer: state.declarer,
        tricksMade: made,
        vulnerability: state.vulnerability
      });
      finalScore.made = made;
      finalScore.defenders = state.tricks[defenders];
      return finalScore;
    }

    Object.assign(actions, {
      finalScoreForCurrentContract,
      finishHand,
      recomputeFinalScore
    });
  };
})(typeof globalThis !== "undefined" ? globalThis : this);

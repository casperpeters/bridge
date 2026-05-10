(function registerBridgeBootstrap(root) {
  "use strict";

  const modules = root.BridgeAppModules = root.BridgeAppModules || {};

  modules.registerBootstrap = function registerBootstrap(runtime) {
    const { actions, els, media, render, state } = runtime;

    function initGlobalAppEvents() {
      document.documentElement.lang = "nl";

      els.newHand?.addEventListener("click", actions.startHand);
      els.sameHand?.addEventListener("click", actions.replayHand);
      els.replayNewHand?.addEventListener("click", actions.startHand);
      els.replaySameHand?.addEventListener("click", actions.replayHand);
      els.replayScoreHelp?.addEventListener("click", actions.toggleReplayScoreExplanation);
      els.replayClose?.addEventListener("click", actions.dismissScoreOverview);
      els.replayPanel?.addEventListener("click", (event) => {
        if (event.target === els.replayPanel) actions.dismissScoreOverview(event);
      });
      els.quickReview?.addEventListener("click", actions.jumpToTrickOverview);

      const glossary = typeof BridgeGlossary !== "undefined" ? BridgeGlossary : root.BridgeGlossary;
      glossary?.init?.({
        dialog: els.glossaryDialog,
        openButton: els.openGlossary,
        closeButton: els.closeGlossary,
        searchInput: els.glossarySearch,
        list: els.glossaryList,
        term: els.glossaryTerm,
        definition: els.glossaryDefinition
      });

      els.openLessons?.addEventListener("click", () => actions.closeAppMenu());
      if (els.openLessons && new URLSearchParams(root.location?.search || "").has("testHooks")) {
        els.openLessons.href = "lessons.html?testHooks=1";
      }

      els.openScoreTable?.addEventListener("click", actions.openScoreTableDialog);
      els.closeScoreTable?.addEventListener("click", actions.closeScoreTableDialog);
      els.loadSeed?.addEventListener("click", actions.loadSeedFromInput);
      els.copySeed?.addEventListener("click", actions.copyCurrentSeed);
      els.scoreTableDialog?.addEventListener("click", (event) => {
        if (event.target === els.scoreTableDialog) actions.closeScoreTableDialog();
      });

      els.contractReveal?.addEventListener("click", (event) => {
        event.stopPropagation();
        actions.startPlayFromContractReveal();
      });
      els.tableArea?.addEventListener("click", (event) => {
        if (actions.clearHandSuitFocusFromOutsideClick(event.target)) return;
        if (state.phase === "contract-reveal") {
          if (isControlTarget(event.target)) return;
          actions.startPlayFromContractReveal();
          return;
        }
        if (actions.blockingLessonBoardStep()) return;
        if (state.awaitingTrickAdvance && state.trickAdvanceArmed) actions.advanceCompletedTrick();
      });

      document.addEventListener("keydown", (event) => {
        if ((event.key === "ArrowLeft" || event.key === "ArrowRight") && !isTextEntryTarget(event.target) && actions.moveReviewCursor(event.key === "ArrowRight" ? 1 : -1)) {
          event.preventDefault();
          return;
        }
        if (isControlTarget(event.target)) return;
        if (event.key === "Enter" && state.phase === "contract-reveal") {
          event.preventDefault();
          actions.startPlayFromContractReveal();
          return;
        }
        if (event.key === "Enter" && actions.blockingLessonBoardStep()) {
          event.preventDefault();
          return;
        }
        if (event.key === "Enter" && state.awaitingTrickAdvance && state.trickAdvanceArmed) {
          event.preventDefault();
          actions.advanceCompletedTrick();
        }
      });
    }

    function initResponsiveLayoutListeners() {
      const rerenderResponsiveLayout = () => render.renderAll();
      [media.mobileBiddingLayoutQuery, media.stableSidebarLayoutQuery].filter(Boolean).forEach((query) => {
        if (typeof query.addEventListener === "function") {
          query.addEventListener("change", rerenderResponsiveLayout);
        } else if (typeof query.addListener === "function") {
          query.addListener(rerenderResponsiveLayout);
        }
      });
    }

    function isControlTarget(target) {
      return target?.closest?.("a, button, input, select, textarea, summary, details");
    }

    function isTextEntryTarget(target) {
      return target?.closest?.("input, select, textarea");
    }

    runtime.bootstrap.steps.unshift(() => actions.loadSavedSettings());
    runtime.bootstrap.steps.push(initGlobalAppEvents, initResponsiveLayoutListeners);
    Object.assign(actions, {
      isControlTarget,
      isTextEntryTarget
    });
  };
})(typeof globalThis !== "undefined" ? globalThis : this);

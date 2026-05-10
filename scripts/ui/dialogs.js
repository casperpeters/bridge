(function registerBridgeDialogs(root) {
  "use strict";

  const modules = root.BridgeAppModules = root.BridgeAppModules || {};

  modules.registerDialogs = function registerDialogs(runtime) {
    const { actions, els } = runtime;

    function openScoreTableDialog() {
      if (typeof els.scoreTableDialog.showModal === "function") {
        els.scoreTableDialog.showModal();
      } else {
        els.scoreTableDialog.setAttribute("open", "");
      }
      els.closeScoreTable.focus();
    }

    function closeScoreTableDialog() {
      if (typeof els.scoreTableDialog.close === "function") {
        els.scoreTableDialog.close();
      } else {
        els.scoreTableDialog.removeAttribute("open");
      }
    }

    Object.assign(actions, {
      closeScoreTableDialog,
      openScoreTableDialog
    });
  };
})(typeof globalThis !== "undefined" ? globalThis : this);

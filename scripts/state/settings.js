(function registerBridgeSettings(root) {
  "use strict";

  const modules = root.BridgeAppModules = root.BridgeAppModules || {};
  const settingsStorageKey = "bridge-app-settings";

  modules.registerSettings = function registerSettings(runtime) {
    const { actions, state } = runtime;

    function loadSavedSettings() {
      try {
        const saved = JSON.parse(localStorage.getItem(settingsStorageKey) || "{}");
        if (typeof saved.developerMode === "boolean") state.developerMode = saved.developerMode;
        if (typeof saved.guidanceMode === "boolean") state.guidanceMode = saved.guidanceMode;
        if (typeof saved.showPlayHistory === "boolean") state.showPlayHistory = saved.showPlayHistory;
        if (typeof saved.showAdvancedBidControls === "boolean") state.showAdvancedBidControls = saved.showAdvancedBidControls;
      } catch {
        // Ignore storage errors so the static app remains usable in private or restricted browsers.
      }
    }

    function saveSettings() {
      try {
        localStorage.setItem(settingsStorageKey, JSON.stringify({
          developerMode: state.developerMode,
          guidanceMode: state.guidanceMode,
          showPlayHistory: state.showPlayHistory,
          showAdvancedBidControls: state.showAdvancedBidControls
        }));
      } catch {
        // Settings persistence is a convenience, not required for play.
      }
    }

    Object.assign(actions, { loadSavedSettings, saveSettings });
  };
})(typeof globalThis !== "undefined" ? globalThis : this);

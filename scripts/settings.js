function loadSavedSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(settingsStorageKey) || "{}");
    if (typeof saved.developerMode === "boolean") state.developerMode = saved.developerMode;
    if (typeof saved.guidanceMode === "boolean") state.guidanceMode = saved.guidanceMode;
    if (typeof saved.showPlayHistory === "boolean") state.showPlayHistory = saved.showPlayHistory;
  } catch {
    // Ignore storage errors so the static app remains usable in private or restricted browsers.
  }
}

function saveSettings() {
  try {
    localStorage.setItem(settingsStorageKey, JSON.stringify({
      developerMode: state.developerMode,
      guidanceMode: state.guidanceMode,
      showPlayHistory: state.showPlayHistory
    }));
  } catch {
    // Settings persistence is a convenience, not required for play.
  }
}

(function registerBridgeMenu(root) {
  "use strict";

  const modules = root.BridgeAppModules = root.BridgeAppModules || {};

  modules.registerMenu = function registerMenu(runtime) {
    const { actions, els, helpers, render, state } = runtime;

    function initAppMenu() {
      els.settingsSummary?.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleAppMenu();
      });
      els.appMenu?.querySelector(".menu-actions")?.addEventListener("click", (event) => {
        if (event.target.closest("button, a")) closeAppMenu();
      });
      els.appMenu?.addEventListener("click", (event) => event.stopPropagation());
      document.addEventListener("click", () => closeAppMenu());
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeAppMenu();
      });
    }

    function initSettingsControls() {
      els.developerMode.addEventListener("change", () => {
        state.developerMode = els.developerMode.checked;
        actions.saveSettings();
        render.renderAll();
      });
      els.guidanceMode.addEventListener("change", () => {
        state.guidanceMode = els.guidanceMode.checked;
        actions.saveSettings();
        render.renderAll();
      });
      els.playHistoryMode.addEventListener("change", () => {
        state.showPlayHistory = els.playHistoryMode.checked;
        actions.saveSettings();
        render.renderAll();
      });
    }

    function toggleAppMenu() {
      const isOpen = !els.appMenu?.classList.contains("is-open");
      renderAppMenu(isOpen);
    }

    function closeAppMenu() {
      renderAppMenu(false);
    }

    function renderAppMenu(isOpen) {
      if (!els.appMenu || !els.settingsSummary) return;
      els.appMenu.classList.toggle("is-open", isOpen);
      els.settingsSummary.setAttribute("aria-expanded", String(isOpen));
      const panel = els.appMenu.querySelector(".app-menu-panel");
      if (panel) panel.hidden = !isOpen;
    }

    function applySettingsStaticText() {
      if (!els.settingsSummary) return;
      els.settingsSummary.setAttribute("aria-label", "Menu");
      els.settingsSummary.title = "Menu";
      els.developerModeLabel.textContent = helpers.t("developerMode");
      els.developerMode.checked = state.developerMode;
      els.guidanceModeLabel.textContent = helpers.t("guidanceMode");
      els.guidanceMode.checked = state.guidanceMode;
      els.playHistoryModeLabel.textContent = helpers.t("playHistoryMode");
      els.playHistoryMode.checked = state.showPlayHistory;
      setSettingInfo(els.playHistoryModeDescription, helpers.t("playHistoryModeHelp"));
      setSettingInfo(els.guidanceModeDescription, helpers.t("guidanceModeHelp"));
      setSettingInfo(els.developerModeDescription, helpers.t("developerModeHelp"));
    }

    function setSettingInfo(element, tooltip) {
      if (!element) return;
      element.textContent = "i";
      element.dataset.tooltip = tooltip;
      element.title = tooltip;
      element.setAttribute("aria-label", tooltip);
    }

    runtime.bootstrap.steps.push(initAppMenu, initSettingsControls);
    Object.assign(actions, { closeAppMenu, toggleAppMenu });
    Object.assign(render, { applySettingsStaticText });
  };
})(typeof globalThis !== "undefined" ? globalThis : this);

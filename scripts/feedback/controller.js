(function registerBridgeFeedback(root) {
  "use strict";

  const modules = root.BridgeAppModules = root.BridgeAppModules || {};

  modules.registerFeedback = function registerFeedback(runtime) {
    const { actions, els, helpers, render, state } = runtime;

function initFeedbackDialog() {
  els.openFeedback.addEventListener("click", openFeedbackDialog);
  els.closeFeedback.addEventListener("click", closeFeedbackDialog);
  els.copyFeedback.addEventListener("click", copyFeedbackReport);
  els.mailFeedback.addEventListener("click", submitFeedbackReport);
  els.feedbackType.addEventListener("change", updateFeedbackQuestions);
  els.feedbackDialog.addEventListener("click", (event) => {
    if (event.target === els.feedbackDialog) closeFeedbackDialog();
  });
}

function applyFeedbackStaticText() {
  els.feedbackTitle.textContent = helpers.t("feedbackTitle");
  els.feedbackTypeLabel.textContent = helpers.t("feedbackTypeLabel");
  els.feedbackMessageLabel.textContent = helpers.t("feedbackMessageLabel");
  els.feedbackMessage.placeholder = helpers.t("feedbackMessagePlaceholder");
  els.feedbackDetailLabel.textContent = helpers.t("feedbackDetailLabel");
  els.copyFeedback.textContent = helpers.t("copyFeedback");
  els.mailFeedback.textContent = helpers.t("mailFeedback");
  els.closeFeedback.setAttribute("aria-label", helpers.t("closeFeedback"));
  els.feedbackDescription.textContent = helpers.t("feedbackHelp");
  Object.entries(helpers.t("feedbackTypes")).forEach(([value, label]) => {
    const option = els.feedbackType.querySelector(`[value="${value}"]`);
    if (option) option.textContent = label;
  });
  updateFeedbackQuestions();
}

function openFeedbackDialog() {
  state.feedbackStatus = null;
  actions.closeAppMenu();
  updateFeedbackQuestions();
  renderFeedbackStatus();
  if (typeof els.feedbackDialog.showModal === "function") {
    els.feedbackDialog.showModal();
  } else {
    els.feedbackDialog.setAttribute("open", "");
  }
  els.feedbackMessage.focus();
}

function updateFeedbackQuestions() {
  const prompts = helpers.t("feedbackPrompts") || {};
  const prompt = prompts[els.feedbackType.value] || prompts.confusion || {};
  els.feedbackMessageLabel.textContent = prompt.primaryLabel || helpers.t("feedbackMessageLabel");
  els.feedbackMessage.placeholder = prompt.primaryPlaceholder || helpers.t("feedbackMessagePlaceholder");
  const hasDetailQuestion = Boolean(prompt.secondaryLabel);
  els.feedbackDetailField.hidden = !hasDetailQuestion;
  els.feedbackDetailLabel.textContent = prompt.secondaryLabel || helpers.t("feedbackDetailLabel");
  els.feedbackDetail.placeholder = prompt.secondaryPlaceholder || "";
  if (!hasDetailQuestion) els.feedbackDetail.value = "";
}

function closeFeedbackDialog() {
  if (typeof els.feedbackDialog.close === "function") {
    els.feedbackDialog.close();
  } else {
    els.feedbackDialog.removeAttribute("open");
  }
}

async function copyFeedbackReport() {
  try {
    await actions.copyText(buildFeedbackReport());
    state.feedbackStatus = helpers.t("feedbackCopied");
  } catch {
    state.feedbackStatus = helpers.t("feedbackCopyFailed");
  }
  renderFeedbackStatus();
}

async function submitFeedbackReport(event) {
  event?.preventDefault();
  const endpoint = feedbackSubmitEndpoint();
  if (!endpoint) {
    state.feedbackStatus = helpers.t("feedbackSubmitMissingEndpoint");
    renderFeedbackStatus();
    return;
  }

  setFeedbackSubmitting(true);
  state.feedbackStatus = helpers.t("feedbackSubmitSending");
  renderFeedbackStatus();

  try {
    await sendFeedbackReport(endpoint, buildFeedbackPayload());
    state.feedbackStatus = helpers.t("feedbackSubmitSent");
    resetFeedbackForm();
  } catch {
    state.feedbackStatus = helpers.t("feedbackSubmitFailed");
  } finally {
    setFeedbackSubmitting(false);
  }
  renderFeedbackStatus();
}

function feedbackSubmitEndpoint() {
  return String(globalThis.BridgeFeedbackConfig?.endpoint || "").trim();
}

function setFeedbackSubmitting(isSubmitting) {
  if (!els.mailFeedback) return;
  els.mailFeedback.disabled = isSubmitting;
  els.mailFeedback.textContent = isSubmitting ? helpers.t("feedbackSubmitting") : helpers.t("mailFeedback");
}

function resetFeedbackForm() {
  els.feedbackType.value = "confusion";
  els.feedbackMessage.value = "";
  els.feedbackDetail.value = "";
  updateFeedbackQuestions();
}

async function sendFeedbackReport(endpoint, payload) {
  await fetch(endpoint, {
    method: "POST",
    mode: "no-cors",
    body: JSON.stringify(payload)
  });
}

function buildFeedbackPayload() {
  const feedbackTypes = helpers.t("feedbackTypes");
  const type = els.feedbackType.value;
  const typeLabel = feedbackTypes[type] || type;
  const repeatCode = actions.currentRepeatCode() || "";
  const answers = currentFeedbackAnswers();
  return {
    source: "bridge-app",
    type,
    typeLabel,
    message: answers.message,
    feedbackQuestion: answers.primaryLabel,
    feedbackAnswer: answers.primary,
    feedbackDetailQuestion: answers.secondaryLabel,
    feedbackDetail: answers.secondary,
    report: buildFeedbackReport(),
    repeatCode,
    phase: state.phase,
    phaseLabel: phaseName(state.phase),
    dealNumber: state.dealNumber || "",
    vulnerability: state.vulnerability || "",
    vulnerabilityLabel: helpers.vulnerabilityName(),
    contract: feedbackContractText(),
    declarer: state.declarer || "",
    turnSeat: currentFeedbackTurnSeat(),
    dummyVisible: feedbackDummyVisibility(),
    lessonId: state.practice?.lessonId || "",
    practiceHandId: state.practice?.id || "",
    startMode: currentFeedbackStartMode(),
    pageUrl: globalThis.location?.href || "",
    userAgent: globalThis.navigator?.userAgent || "",
    language: globalThis.navigator?.language || "",
    createdAt: new Date().toISOString()
  };
}

function renderFeedbackStatus() {
  els.feedbackState.textContent = state.feedbackStatus || "";
}

function buildFeedbackReport() {
  const feedbackTypes = helpers.t("feedbackTypes");
  const type = feedbackTypes[els.feedbackType.value] || els.feedbackType.value;
  const answers = currentFeedbackAnswers();
  const answerLines = [
    answers.primaryLabel,
    answers.primary || helpers.t("feedbackNoMessage")
  ];
  if (answers.secondaryLabel) {
    answerLines.push("", answers.secondaryLabel, answers.secondary || helpers.t("feedbackAnswerMissing"));
  }
  return [
    "## Feedback",
    "",
    `Type: ${type}`,
    ...answerLines,
    "",
    `${helpers.t("feedbackSituationSeed")}: ${actions.currentRepeatCode() || helpers.t("none")}`
  ].join("\n").trimEnd();
}

function currentFeedbackAnswers() {
  const prompts = helpers.t("feedbackPrompts") || {};
  const prompt = prompts[els.feedbackType.value] || prompts.confusion || {};
  const primaryLabel = prompt.primaryLabel || helpers.t("feedbackMessageLabel");
  const secondaryLabel = prompt.secondaryLabel || "";
  const primary = els.feedbackMessage.value.trim();
  const secondary = secondaryLabel ? els.feedbackDetail.value.trim() : "";
  const message = secondaryLabel
    ? [
        `${primaryLabel} ${primary || helpers.t("feedbackNoMessage")}`,
        `${secondaryLabel} ${secondary || helpers.t("feedbackAnswerMissing")}`
      ].join("\n")
    : primary;
  return {
    primaryLabel,
    primary,
    secondaryLabel,
    secondary,
    message
  };
}

function feedbackContractText() {
  if (state.finalScore?.passOut) return helpers.t("passedOut");
  if (!state.contract) return "";
  return `${helpers.formatBid(state.contract)} ${helpers.t("by")} ${helpers.seatName(state.declarer)}`;
}

function phaseName(phase) {
  return {
    idle: "Start",
    bidding: "Bieden",
    "contract-reveal": "Contract tonen",
    playing: "Spelen",
    complete: helpers.t("review")
  }[phase] || phase;
}

function currentFeedbackTurnSeat() {
  if (!["bidding", "contract-reveal", "playing"].includes(state.phase)) return "";
  return helpers.seatAt(state.turnIndex);
}

function feedbackDummyVisibility() {
  if (!state.contract || !state.dummy) return "N.v.t.";
  if (state.phase === "complete") return "Ja";
  if (state.phase === "contract-reveal") return "Nee";
  if (state.phase !== "playing") return "N.v.t.";
  return actions.openingLeadHasBeenMade() ? "Ja" : "Nee";
}

function currentFeedbackStartMode() {
  if (state.practice?.lessonStartMode === "play") return "direct-play";
  if (state.practice?.lessonStartMode) return String(state.practice.lessonStartMode);
  if (state.phase === "playing" && state.contract && !state.auction.length) return "direct-play";
  if (state.phase === "bidding" || state.phase === "contract-reveal") return "auction";
  return "";
}

    runtime.bootstrap.steps.push(initFeedbackDialog);
    Object.assign(actions, {
      buildFeedbackPayload,
      buildFeedbackReport,
      closeFeedbackDialog,
      copyFeedbackReport,
      openFeedbackDialog,
      submitFeedbackReport
    });
    Object.assign(render, {
      applyFeedbackStaticText,
      renderFeedbackStatus
    });
  };
})(typeof globalThis !== "undefined" ? globalThis : this);

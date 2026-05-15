(function registerBridgeLessonBoardCoach(root) {
  "use strict";

  const modules = root.BridgeAppModules = root.BridgeAppModules || {};

  modules.registerLessonBoardCoach = function registerLessonBoardCoach(runtime) {
    const { actions, constants, dom, els, helpers, render, state, transitions } = runtime;
    const { separatorDot } = constants;
    const { seatEls, slotEls } = dom;
    const legalCards = (...args) => helpers.legalCards(...args);
    const openingLeadHasBeenMade = (...args) => actions.openingLeadHasBeenMade(...args);
    const isHumanControlledSeat = (...args) => actions.isHumanControlledSeat(...args);
    const seatAt = (...args) => helpers.seatAt(...args);
    const t = (...args) => helpers.t(...args);
    const advanceCompletedTrick = (...args) => actions.advanceCompletedTrick(...args);
    const continueAuction = (...args) => actions.continueAuction(...args);
    const continuePlay = (...args) => actions.continuePlay(...args);
    const renderAll = (...args) => render.renderAll(...args);

function renderLessonBanner() {
  if (!els.lessonBanner) return;
  const done = lessonTableTaskIsDone();
  const step = done ? null : activeLessonBoardStep();
  renderLessonBoardHighlights(step);
  els.lessonBanner.classList.toggle("lesson-coach-card", Boolean(step || done));
  els.lessonBanner.classList.toggle("lesson-done-card", done);
  els.lessonBanner.hidden = !state.practice?.challenge && !step && !done;
  els.lessonBanner.innerHTML = "";
  if (els.lessonBanner.hidden) return;

  const label = document.createElement("strong");
  const lessonPrefix = state.practice.lessonNumber ? `${t("lesson")} ${state.practice.lessonNumber}` : t("lesson");
  label.textContent = state.practice.lessonTitle ? `${lessonPrefix}: ${state.practice.lessonTitle}` : lessonPrefix;

  if (done) {
    appendLessonDoneContent(els.lessonBanner, label.textContent, { compact: true });
    return;
  }

  if (step) {
    const stepIndex = lessonBoardSteps().findIndex((candidate) => candidate.id === step.id);
    const eyebrow = document.createElement("span");
    eyebrow.className = "lesson-coach-eyebrow";
    eyebrow.textContent = `${label.textContent} ${separatorDot} stap ${stepIndex + 1} van ${lessonBoardSteps().length}`;

    const title = document.createElement("strong");
    title.className = "lesson-coach-title";
    title.textContent = step.title;

    const badge = document.createElement("span");
    badge.className = "lesson-coach-badge";
    badge.textContent = step.badge;

    const body = document.createElement("span");
    body.className = "lesson-coach-body";
    body.appendChild(BridgeGlossary.linkifyText(step.body));

    const head = document.createElement("span");
    head.className = "lesson-coach-head";
    head.append(title, badge);

    els.lessonBanner.append(eyebrow, head, body);
    if (step.gate !== "none") {
      appendLessonCoachAction(els.lessonBanner, step);
    }
    return;
  }

  const challenge = document.createElement("span");
  challenge.textContent = state.practice.challenge;
  els.lessonBanner.append(label, challenge);
}

function renderLessonPanel() {
  if (!els.lessonPanel) return;
  const active = isLessonModeActive() && state.phase !== "complete";
  els.lessonPanel.hidden = !active;
  els.lessonPanel.innerHTML = "";
  if (!active) return;

  const done = lessonTableTaskIsDone();
  const step = done ? null : activeLessonBoardStep();
  const steps = lessonBoardSteps();
  const stepIndex = step ? steps.findIndex((candidate) => candidate.id === step.id) : -1;

  const eyebrow = document.createElement("p");
  eyebrow.className = "lesson-panel-eyebrow";
  const lessonLabel = state.practice.lessonNumber ? `Les ${state.practice.lessonNumber}` : "Les";
  const chapter = state.practice.lessonChapterTitle ? ` ${separatorDot} ${state.practice.lessonChapterTitle}` : "";
  eyebrow.textContent = `${lessonLabel}${chapter}`;

  const title = document.createElement("h2");
  title.textContent = state.practice.lessonTitle || "Les aan tafel";

  const progress = document.createElement("div");
  progress.className = "lesson-panel-progress";
  const progressText = done
    ? "Tafelmoment klaar"
    : step && steps.length
      ? `Stap ${stepIndex + 1} van ${steps.length}`
      : "Aan tafel";
  progress.textContent = progressText;

  const mission = document.createElement("p");
  mission.className = "lesson-panel-mission";
  mission.appendChild(BridgeGlossary.linkifyText(state.practice.challenge || state.practice.testGoal || "Oefen deze situatie aan de tafel."));

  els.lessonPanel.append(eyebrow, title, progress, mission);

  if (state.lessonActionFeedback) {
    els.lessonPanel.appendChild(lessonActionFeedbackCard(state.lessonActionFeedback));
  }

  if (done) {
    const card = document.createElement("section");
    card.className = "lesson-panel-card lesson-panel-done";
    appendLessonDoneContent(card, "", { compact: false });
    els.lessonPanel.appendChild(card);
    return;
  }

  if (step) {
    const card = document.createElement("section");
    card.className = "lesson-panel-card";
    const badge = document.createElement("span");
    badge.className = "lesson-coach-badge";
    badge.textContent = step.badge;
    const heading = document.createElement("h3");
    heading.textContent = step.title;
    const body = document.createElement("p");
    body.appendChild(BridgeGlossary.linkifyText(step.body));
    card.append(badge, heading, body);
    if (step.gate !== "none") {
      appendLessonCoachAction(card, step);
    }
    els.lessonPanel.appendChild(card);
    return;
  }

  const idle = document.createElement("section");
  idle.className = "lesson-panel-card";
  const heading = document.createElement("h3");
  heading.textContent = "Kijk naar de tafel";
  const body = document.createElement("p");
  body.textContent = state.practice.lessonIntro || "Speel alleen het gevraagde lesmoment; daarna kun je terug naar de les.";
  idle.append(heading, body);
  els.lessonPanel.appendChild(idle);
}

function lessonActionFeedbackCard(feedback) {
  const card = document.createElement("section");
  card.className = "lesson-panel-card lesson-panel-retry";
  const badge = document.createElement("span");
  badge.className = "lesson-coach-badge";
  badge.textContent = "Probeer opnieuw";
  const heading = document.createElement("h3");
  heading.textContent = feedback.title || "Probeer nog eens";
  const body = document.createElement("p");
  body.appendChild(BridgeGlossary.linkifyText(feedback.body || "Deze keuze past nog niet bij de oefening."));
  card.append(badge, heading, body);
  if (feedback.hint) {
    const hint = document.createElement("p");
    hint.className = "lesson-feedback-hint";
    hint.appendChild(BridgeGlossary.linkifyText(feedback.hint));
    card.appendChild(hint);
  }
  return card;
}

function appendLessonCoachAction(parent, step) {
  const action = document.createElement("button");
  action.type = "button";
  action.className = "lesson-coach-action";
  action.textContent = step.buttonLabel || "Verder";
  action.addEventListener("click", (event) => {
    event.stopPropagation();
    acknowledgeLessonBoardStep(step);
  });
  parent.appendChild(action);
}

function appendLessonDoneContent(parent, prefix, { compact }) {
  const task = lessonTableTask();
  const eyebrow = document.createElement("span");
  eyebrow.className = "lesson-coach-eyebrow";
  eyebrow.textContent = prefix ? `${prefix} ${separatorDot} klaar` : "Klaar";

  const title = document.createElement(compact ? "strong" : "h3");
  title.className = "lesson-coach-title";
  title.textContent = task?.doneTitle || "Tafelmoment klaar";

  const body = document.createElement(compact ? "span" : "p");
  body.className = "lesson-coach-body";
  body.appendChild(BridgeGlossary.linkifyText(task?.doneBody || "Deze korte situatie is klaar. Ga terug naar de les om verder te leren."));

  const actionsRow = document.createElement("div");
  actionsRow.className = "lesson-done-actions";
  actionsRow.appendChild(returnToLessonLink(task?.returnLabel || "Terug naar les"));
  if (task?.retryLabel) {
    const retry = document.createElement("button");
    retry.type = "button";
    retry.className = "lesson-done-retry";
    retry.textContent = task.retryLabel;
    retry.addEventListener("click", (event) => {
      event.stopPropagation();
      actions.replayHand();
    });
    actionsRow.appendChild(retry);
  }

  parent.append(eyebrow, title, body, actionsRow);
}

function returnToLessonLink(label) {
  const link = document.createElement("a");
  link.className = "lesson-done-return";
  link.href = lessonReturnHref();
  link.textContent = label;
  return link;
}

function lessonReturnHref() {
  return state.practice?.lessonReturnHref || actions.defaultLessonReturnHref?.(state.practice?.lessonId, state.practice?.lessonChapterId) || "lessons/index.html";
}

function isLessonModeActive() {
  return actions.isLessonModeActive?.() || Boolean(state.practice?.lessonId);
}

function lessonTableTask() {
  return state.practice?.lessonTableTask || null;
}

function lessonTableTaskIsDone() {
  if (!isLessonModeActive() || !lessonTableTask()) return false;
  if (state.lessonTableTaskDone) return true;
  if (globalThis.BridgeLessons?.tableTaskCompleted?.(lessonTableTask(), state)) {
    state.lessonTableTaskDone = true;
    return true;
  }
  return false;
}

function maybeCompleteLessonTableTask() {
  const wasDone = Boolean(state.lessonTableTaskDone);
  const done = lessonTableTaskIsDone();
  if (!done) return false;
  if (!wasDone) actions.resetScheduledFlow?.();
  renderAll();
  return true;
}

function validateLessonTableAction(type, action = {}) {
  const task = lessonTableTask();
  if (!isLessonModeActive() || !task?.expectedAction || task.type !== type) {
    clearLessonActionFeedback();
    return true;
  }
  const feedback = globalThis.BridgeLessons?.tableTaskActionFeedback?.(task, { ...action, type });
  if (!feedback) {
    clearLessonActionFeedback();
    return true;
  }
  state.lessonActionFeedback = feedback;
  state.illegalActionFeedback = `${feedback.title || "Probeer opnieuw"}: ${feedback.body || "Deze keuze past nog niet bij de oefening."}`;
  renderAll();
  return false;
}

function clearLessonActionFeedback() {
  if (!state.lessonActionFeedback && !state.illegalActionFeedback) return;
  state.lessonActionFeedback = null;
  state.illegalActionFeedback = null;
}

function lessonBoardSteps() {
  return Array.isArray(state.practice?.lessonBoardGuidance) ? state.practice.lessonBoardGuidance : [];
}

function activeLessonBoardStep() {
  if (lessonTableTaskIsDone()) return null;
  const steps = lessonBoardSteps();
  if (!steps.length) return null;
  return steps.find((step) => lessonBoardStepReady(step) && !lessonBoardStepAcknowledged(step)) || null;
}

function lessonBoardStepAcknowledged(step) {
  if (step.gate === "none") return false;
  return (state.lessonBoardAcknowledged || []).includes(step.id);
}

function lessonBoardStepReady(step) {
  if (step.id === "reviewResult") return state.phase === "complete";
  if (step.gate === "allowHumanBid") return state.phase === "bidding" && seatAt(state.turnIndex) === "South" && !state.animateDeal;
  if (step.target === "auctionLog") return state.auction.length > 0;
  if (step.target === "bidControls") return state.phase === "bidding" && !state.animateDeal;
  if (state.phase !== "playing" || !state.contract || !state.declarer || !state.dummy) return false;
  const openingLeadMade = openingLeadHasBeenMade();
  const humanTurn = isHumanControlledSeat(seatAt(state.turnIndex));
  if (step.id === "contractIntro") return !openingLeadMade;
  if (step.id === "openingLeadIntro") return !openingLeadMade;
  if (step.id === "dummyReveal") return openingLeadMade && state.trickHistory.length === 0;
  if (step.id === "declarerControlsDummy") return openingLeadMade && state.trickHistory.length === 0;
  if (step.id === "trickMeaning") return openingLeadMade && state.trickHistory.length === 0 && state.currentTrick.length > 0;
  if (step.id === "followSuit") return openingLeadMade && humanTurn && !state.awaitingTrickAdvance && state.currentTrick.length > 0;
  if (step.id === "trumpMeaning") return openingLeadMade && humanTurn && !state.awaitingTrickAdvance && state.contract.strain !== "NT";
  if (step.id === "trickWinner") return state.awaitingTrickAdvance && Boolean(state.pendingTrickWinner);
  if (step.gate === "allowHumanPlay") return openingLeadMade && humanTurn && !state.awaitingTrickAdvance;
  if (step.target === "review") return state.phase === "complete";
  return false;
}

function acknowledgeLessonBoardStep(step) {
  if (!step || step.gate === "none") return;
  state.lessonBoardAcknowledged = transitions.acknowledgeLessonBoardStepTransition(state, step);
  renderAll();
  if (step.gate === "advanceTrick") {
    advanceCompletedTrick();
    return;
  }
  if (step.gate === "allowHumanBid") {
    continueAuction();
    return;
  }
  continuePlay();
}

function lessonBoardBlocksHumanBid(seat) {
  if (lessonTableTaskIsDone()) return true;
  const step = activeLessonBoardStep();
  if (!step || step.gate !== "allowHumanBid") return false;
  return seat === "South" && seatAt(state.turnIndex) === seat;
}

function lessonBoardBlocksHumanPlay(seat) {
  if (lessonTableTaskIsDone()) return true;
  const step = activeLessonBoardStep();
  if (!step || step.gate === "none") return false;
  if (state.phase !== "playing" || state.awaitingTrickAdvance) return false;
  return isHumanControlledSeat(seat) && seatAt(state.turnIndex) === seat;
}

function blockingLessonBoardStep() {
  if (lessonTableTaskIsDone()) return true;
  const step = activeLessonBoardStep();
  return Boolean(step && step.gate !== "none");
}

function lessonBoardSuppressesUitspelen() {
  const step = activeLessonBoardStep();
  return Boolean(step?.suppressUitspelen);
}

function renderLessonBoardHighlights(step = activeLessonBoardStep()) {
  clearLessonBoardHighlights();
  if (!step) return;
  els.tableArea?.classList.add("has-lesson-highlight", `lesson-highlight-${step.target}`);

  const targets = lessonBoardHighlightTargets(step);
  targets.forEach((target) => target?.classList?.add("lesson-highlight-target"));
  lessonBoardHighlightCards(step).forEach((card) => card.classList.add("lesson-highlight-card"));
}

function clearLessonBoardHighlights() {
  els.tableArea?.classList.remove(
    "has-lesson-highlight",
    "lesson-highlight-contract",
    "lesson-highlight-openingLead",
    "lesson-highlight-dummy",
    "lesson-highlight-declarerAndDummy",
    "lesson-highlight-trickArea",
    "lesson-highlight-legalCards",
    "lesson-highlight-trumpCards",
    "lesson-highlight-trickWinner",
    "lesson-highlight-review",
    "lesson-highlight-bidControls",
    "lesson-highlight-auctionLog",
    "lesson-highlight-lessonPanel"
  );
  [
    els.contract,
    els.reviewPanel,
    els.trickArea,
    els.bidControls,
    els.auctionLog,
    els.lessonPanel,
    ...Object.values(seatEls),
    ...Object.values(slotEls)
  ].forEach((element) => element?.classList?.remove("lesson-highlight-target"));
  document.querySelectorAll(".lesson-highlight-card").forEach((card) => card.classList.remove("lesson-highlight-card"));
}

function lessonBoardHighlightTargets(step) {
  const activeSeat = state.phase === "playing" ? seatAt(state.turnIndex) : null;
  if (step.target === "contract") return [els.contract];
  if (step.target === "openingLead") return [slotEls.West, seatEls.West];
  if (step.target === "dummy") return [seatEls[state.dummy]];
  if (step.target === "declarerAndDummy") return [seatEls[state.declarer], seatEls[state.dummy]];
  if (step.target === "trickArea") return [els.trickArea];
  if (step.target === "legalCards") return [seatEls[activeSeat]];
  if (step.target === "trumpCards") return [seatEls[state.declarer], seatEls[state.dummy]];
  if (step.target === "trickWinner") return [slotEls[state.pendingTrickWinner]];
  if (step.target === "review") return [els.reviewPanel];
  if (step.target === "bidControls") return [els.bidControls];
  if (step.target === "auctionLog") return [els.auctionLog];
  if (step.target === "lessonPanel") return [els.lessonPanel];
  return [];
}

function lessonBoardHighlightCards(step) {
  if (state.phase !== "playing") return [];
  if (step.target === "legalCards") {
    const seat = seatAt(state.turnIndex);
    return legalCards(seat)
      .map((card) => seatEls[seat]?.querySelector(`[data-card-id="${card.id}"]`))
      .filter(Boolean);
  }
  if (step.target === "trumpCards" && state.contract?.strain !== "NT") {
    return [state.declarer, state.dummy]
      .flatMap((seat) => Array.from(seatEls[seat]?.querySelectorAll(`[data-card-id$="${state.contract.strain}"]`) || []));
  }
  return [];
}

    Object.assign(actions, {
      activeLessonBoardStep,
      acknowledgeLessonBoardStep,
      blockingLessonBoardStep,
      lessonBoardBlocksHumanBid,
      lessonBoardBlocksHumanPlay,
      lessonBoardSuppressesUitspelen,
      lessonBoardHighlightCards,
      lessonBoardHighlightTargets,
      lessonBoardStepAcknowledged,
      lessonBoardStepReady,
      lessonBoardSteps,
      lessonTableTaskIsDone,
      maybeCompleteLessonTableTask,
      validateLessonTableAction
    });
    Object.assign(render, {
      clearLessonBoardHighlights,
      renderLessonBanner,
      renderLessonBoardHighlights,
      renderLessonPanel
    });
  };
})(typeof globalThis !== "undefined" ? globalThis : this);

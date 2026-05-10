(function registerBridgeLessonBoardCoach(root) {
  "use strict";

  const modules = root.BridgeAppModules = root.BridgeAppModules || {};
  const lessonBoardCoachLessonId = "les-01-wat-is-bridge";

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
    const continuePlay = (...args) => actions.continuePlay(...args);
    const renderAll = (...args) => render.renderAll(...args);

function renderLessonBanner() {
  if (!els.lessonBanner) return;
  const step = activeLessonBoardStep();
  renderLessonBoardHighlights(step);
  els.lessonBanner.classList.toggle("lesson-coach-card", Boolean(step));
  els.lessonBanner.hidden = !state.practice?.challenge && !step;
  els.lessonBanner.innerHTML = "";
  if (els.lessonBanner.hidden) return;

  const label = document.createElement("strong");
  const lessonPrefix = state.practice.lessonNumber ? `${t("lesson")} ${state.practice.lessonNumber}` : t("lesson");
  label.textContent = state.practice.lessonTitle ? `${lessonPrefix}: ${state.practice.lessonTitle}` : lessonPrefix;

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
      const action = document.createElement("button");
      action.type = "button";
      action.className = "lesson-coach-action";
      action.textContent = step.buttonLabel || "Verder";
      action.addEventListener("click", (event) => {
        event.stopPropagation();
        acknowledgeLessonBoardStep(step);
      });
      els.lessonBanner.appendChild(action);
    }
    return;
  }

  const challenge = document.createElement("span");
  challenge.textContent = state.practice.challenge;
  els.lessonBanner.append(label, challenge);
}

function lessonBoardSteps() {
  if (state.practice?.lessonId !== lessonBoardCoachLessonId) return [];
  return Array.isArray(state.practice.lessonBoardGuidance) ? state.practice.lessonBoardGuidance : [];
}

function activeLessonBoardStep() {
  const steps = lessonBoardSteps();
  if (!steps.length) return null;
  return steps.find((step) => lessonBoardStepReady(step) && !lessonBoardStepAcknowledged(step)) || null;
}

function lessonBoardStepAcknowledged(step) {
  if (step.gate === "none") return false;
  return state.lessonBoardAcknowledged.includes(step.id);
}

function lessonBoardStepReady(step) {
  if (step.id === "reviewResult") return state.phase === "complete";
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
  continuePlay();
}

function lessonBoardBlocksHumanPlay(seat) {
  const step = activeLessonBoardStep();
  if (!step || step.gate === "none") return false;
  if (state.phase !== "playing" || state.awaitingTrickAdvance) return false;
  return isHumanControlledSeat(seat) && seatAt(state.turnIndex) === seat;
}

function blockingLessonBoardStep() {
  const step = activeLessonBoardStep();
  return Boolean(step && step.gate !== "none");
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
    "lesson-highlight-review"
  );
  [
    els.contract,
    els.reviewPanel,
    els.trickArea,
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
      lessonBoardBlocksHumanPlay,
      lessonBoardHighlightCards,
      lessonBoardHighlightTargets,
      lessonBoardStepAcknowledged,
      lessonBoardStepReady,
      lessonBoardSteps
    });
    Object.assign(render, {
      clearLessonBoardHighlights,
      renderLessonBanner,
      renderLessonBoardHighlights
    });
  };
})(typeof globalThis !== "undefined" ? globalThis : this);

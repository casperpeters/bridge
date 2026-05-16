(function registerBridgeInteractiveExerciseTable(root) {
  "use strict";

  const modules = root.BridgeAppModules = root.BridgeAppModules || {};

  modules.registerInteractiveExerciseTable = function registerInteractiveExerciseTable(runtime) {
    const { actions, els, helpers, render, state } = runtime;
    const validator = root.BridgeLearningActionValidation;
    if (!validator) throw new Error("action-validation.js must load before interactive exercise table");

    function activeInteractiveExercise() {
      return state.interactiveExercise || null;
    }

    function activeInteractiveExerciseQuestion(type = "") {
      const exercise = activeInteractiveExercise();
      if (!exercise || exercise.completed) return null;
      if (type && exercise.actionType !== type) return null;
      return exercise;
    }

    function validateInteractiveExerciseAction(type, action = {}) {
      const exercise = activeInteractiveExerciseQuestion(type);
      if (!exercise) return true;
      const result = validator.validateExpectedAction(exercise.expectedAction, { ...action, type }, exercise.feedbackCopy || {});
      if (!result.applies || result.ok) {
        if (result.ok) markInteractiveExerciseCorrect(result.feedback);
        return true;
      }
      markInteractiveExerciseRetry(result.feedback);
      render.renderAll();
      return false;
    }

    function maybeCompleteInteractiveExerciseAction(type) {
      const exercise = activeInteractiveExercise();
      if (!exercise || exercise.actionType !== type || exercise.status !== "correct" || exercise.completed) return false;
      exercise.completed = true;
      actions.resetScheduledFlow?.();
      render.renderAll();
      return true;
    }

    function markInteractiveExerciseRetry(feedback) {
      const exercise = activeInteractiveExercise();
      if (!exercise) return;
      exercise.status = "retry";
      exercise.completed = false;
      exercise.actionFeedback = {
        kind: "wrong",
        title: feedback?.title || "Probeer nog eens",
        body: feedback?.body || "Deze keuze past nog niet bij de oefening.",
        hint: feedback?.hint || ""
      };
      state.illegalActionFeedback = `${exercise.actionFeedback.title}: ${exercise.actionFeedback.body}`;
    }

    function markInteractiveExerciseCorrect(feedback) {
      const exercise = activeInteractiveExercise();
      if (!exercise) return;
      exercise.status = "correct";
      exercise.completed = false;
      exercise.actionFeedback = {
        kind: "correct",
        title: feedback?.title || "Goed",
        body: feedback?.body || "Deze keuze past bij de oefening.",
        hint: feedback?.hint || ""
      };
      state.illegalActionFeedback = null;
      state.lessonActionFeedback = null;
    }

    function retryInteractiveExercise() {
      const exercise = activeInteractiveExercise();
      if (!exercise?.id) return false;
      actions.startInteractiveExercise(exercise.id, { returnHref: exercise.returnHref || "" });
      return true;
    }

    function nextInteractiveExercise() {
      const current = activeInteractiveExercise();
      const next = nextInteractiveExerciseFor(current);
      if (!next) return false;
      const returnHref = current?.returnHref || defaultExerciseReturnHref(next);
      actions.startInteractiveExercise(next.id, { returnHref });
      updateExerciseUrl(next.id, returnHref);
      return true;
    }

    function nextInteractiveExerciseFor(exercise) {
      if (!exercise?.lessonId || !root.PracticeHands?.getVisibleInteractiveSmb1Exercises) return null;
      const lessonExercises = root.PracticeHands
        .getVisibleInteractiveSmb1Exercises()
        .filter((candidate) => candidate.lessonId === exercise.lessonId);
      const index = lessonExercises.findIndex((candidate) => candidate.id === exercise.id);
      return index >= 0 ? lessonExercises[index + 1] || null : null;
    }

    function defaultExerciseReturnHref(exercise = activeInteractiveExercise()) {
      if (!exercise?.lessonId) return "practice/index.html";
      return `practice/index.html?lesson=${encodeURIComponent(exercise.lessonId)}`;
    }

    function updateExerciseUrl(exerciseId, returnHref = "") {
      if (!root.history?.replaceState || !root.location?.href || !exerciseId) return;
      const url = new URL(root.location.href);
      url.searchParams.set("exercise", exerciseId);
      if (returnHref) url.searchParams.set("return", returnHref);
      root.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    }

    function interactiveExerciseSuppressesGuidance(type = "") {
      return Boolean(activeInteractiveExerciseQuestion(type));
    }

    function renderInteractiveExerciseBidQuestion() {
      const exercise = activeInteractiveExerciseQuestion("bid");
      if (!exercise || !els.bidControls || els.bidControls.getAttribute("aria-hidden") === "true") return;
      els.bidControls.prepend(exerciseQuestionCard(exercise, "bid"));
    }

    function renderInteractiveExerciseTrickQuestion() {
      if (!els.exerciseTrickQuestion) return;
      const exercise = activeInteractiveExerciseQuestion("card");
      els.exerciseTrickQuestion.hidden = !exercise;
      els.exerciseTrickQuestion.innerHTML = "";
      if (!exercise) return;
      els.exerciseTrickQuestion.appendChild(exerciseQuestionCard(exercise, "card"));
    }

    function renderInteractiveExercisePanel() {
      const exercise = activeInteractiveExercise();
      if (!exercise || !els.lessonPanel) return;
      els.lessonPanel.hidden = false;
      els.lessonPanel.innerHTML = "";

      const card = document.createElement("section");
      card.className = "lesson-panel-card interactive-exercise-panel-card";

      const eyebrow = document.createElement("p");
      eyebrow.className = "lesson-panel-eyebrow";
      eyebrow.textContent = "Oefening";

      const title = document.createElement("h2");
      title.textContent = exercise.title || "Oefening";

      const question = document.createElement("p");
      question.className = "lesson-panel-mission";
      question.appendChild(root.BridgeGlossary?.linkifyText?.(exercise.question || "") || document.createTextNode(exercise.question || ""));

      card.append(eyebrow, title, question);

      if (exercise.actionFeedback) {
        const feedback = document.createElement("section");
        feedback.className = `lesson-panel-card ${exercise.actionFeedback.kind === "correct" ? "lesson-panel-done" : "lesson-panel-retry"}`;
        const heading = document.createElement("h3");
        heading.textContent = exercise.actionFeedback.title || (exercise.actionFeedback.kind === "correct" ? "Goed" : "Probeer nog eens");
        const body = document.createElement("p");
        body.appendChild(root.BridgeGlossary?.linkifyText?.(exercise.actionFeedback.body || "") || document.createTextNode(exercise.actionFeedback.body || ""));
        feedback.append(heading, body);
        if (exercise.actionFeedback.hint) {
          const hint = document.createElement("p");
          hint.className = "lesson-feedback-hint";
          hint.appendChild(root.BridgeGlossary?.linkifyText?.(exercise.actionFeedback.hint) || document.createTextNode(exercise.actionFeedback.hint));
          feedback.appendChild(hint);
        }
        card.appendChild(feedback);
      }

      if (exercise.completed) card.appendChild(exerciseActionRow(exercise));
      els.lessonPanel.appendChild(card);
    }

    function exerciseQuestionCard(exercise, type) {
      const card = document.createElement("div");
      card.className = `interactive-exercise-question interactive-exercise-question-${type}`;
      card.dataset.interactiveExerciseQuestion = type;
      const label = document.createElement("strong");
      label.textContent = type === "bid" ? "Biedvraag" : "Kaartvraag";
      const text = document.createElement("span");
      text.textContent = exercise.question || "";
      card.append(label, text);
      return card;
    }

    function exerciseActionRow(exercise) {
      const row = document.createElement("div");
      row.className = "lesson-done-actions interactive-exercise-actions";

      const retry = document.createElement("button");
      retry.type = "button";
      retry.className = "lesson-done-retry";
      retry.textContent = "Opnieuw proberen";
      retry.addEventListener("click", (event) => {
        event.stopPropagation();
        retryInteractiveExercise();
      });
      row.appendChild(retry);

      const next = nextInteractiveExerciseFor(exercise);
      if (next) {
        const nextButton = document.createElement("button");
        nextButton.type = "button";
        nextButton.className = "lesson-done-return";
        nextButton.textContent = "Volgende oefening";
        nextButton.addEventListener("click", (event) => {
          event.stopPropagation();
          nextInteractiveExercise();
        });
        row.appendChild(nextButton);
      } else {
        const back = document.createElement("a");
        back.className = "lesson-done-return";
        back.href = exercise.returnHref || defaultExerciseReturnHref(exercise);
        back.textContent = "Terug naar oefeningen";
        row.appendChild(back);
      }

      return row;
    }

    Object.assign(actions, {
      activeInteractiveExercise,
      activeInteractiveExerciseQuestion,
      defaultExerciseReturnHref,
      interactiveExerciseSuppressesGuidance,
      maybeCompleteInteractiveExerciseAction,
      nextInteractiveExercise,
      nextInteractiveExerciseFor,
      retryInteractiveExercise,
      validateInteractiveExerciseAction
    });
    Object.assign(render, {
      renderInteractiveExerciseBidQuestion,
      renderInteractiveExercisePanel,
      renderInteractiveExerciseTrickQuestion
    });
  };
})(typeof globalThis !== "undefined" ? globalThis : this);

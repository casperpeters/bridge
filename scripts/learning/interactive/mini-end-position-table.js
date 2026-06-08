(function registerBridgeMiniEndPositionExerciseTable(root) {
  "use strict";

  const modules = root.BridgeAppModules = root.BridgeAppModules || {};

  modules.registerMiniEndPositionExerciseTable = function registerMiniEndPositionExerciseTable(runtime) {
    const { actions, constants, els, helpers, render, state, transitions } = runtime;
    const { seats } = constants;
    const BridgeStateTransitions = transitions;
    const previousSuppressesGuidance = actions.interactiveExerciseSuppressesGuidance;
    const previousRenderInteractiveExercisePanel = render.renderInteractiveExercisePanel;
    const previousCurrentUitspelenAnalysis = actions.currentUitspelenAnalysis;
    const previousRenderDeterministicPlayout = render.renderDeterministicPlayout;
    const previousIsHumanControlledSeat = actions.isHumanControlledSeat;
    const previousIsSeatVisible = actions.isSeatVisible;
    const previousPlayCard = actions.playCard;

    function activeMiniEndPositionExercise() {
      return state.miniEndPositionExercise || null;
    }

    function activeMiniEndPositionQuestion() {
      const exercise = activeMiniEndPositionExercise();
      if (!exercise || exercise.completed || exercise.mode !== "lead-and-predict") return null;
      return exercise;
    }

    function miniEndPositionSuppressesGuidance() {
      return Boolean(activeMiniEndPositionQuestion());
    }

    function miniEndPositionSuppressesUitspelen() {
      return miniEndPositionSuppressesGuidance();
    }

    function miniEndPositionSuppressesLiveHistory() {
      return miniEndPositionSuppressesGuidance();
    }

    function miniEndPositionShowsHistory() {
      const exercise = activeMiniEndPositionExercise();
      return Boolean(exercise?.completed && state.phase === "playing" && state.trickHistory.length);
    }

    function miniEndPositionSeatIsVisible(seat) {
      const exercise = activeMiniEndPositionExercise();
      if (!exercise || state.phase !== "playing") return false;
      if (seat === "South") return true;
      if (miniEndPositionHasAllCardsVisible(exercise)) return true;
      return Boolean(state.dummy && seat === state.dummy);
    }

    function miniEndPositionHasAllCardsVisible(exercise) {
      const situation = exercise?.situation || {};
      return Boolean(
        exercise?.allCardsVisible ||
        situation.allCardsVisible ||
        situation.openCards ||
        situation.visibility === "all" ||
        situation.visibility === "open"
      );
    }

    function startMiniEndPositionExercise(exerciseOrId, { returnHref = "" } = {}) {
      if (!root.PracticeHands?.findVisibleMiniEndPositionExercise) {
        throw new Error("practice-hands/index.js must load before mini end-position exercises can be used");
      }
      const exercise = typeof exerciseOrId === "string"
        ? root.PracticeHands.findVisibleMiniEndPositionExercise(exerciseOrId)
        : root.PracticeHands.prepareMiniEndPositionExercise(exerciseOrId);
      if (!exercise?.startSeed) throw new Error(`Unknown mini end-position exercise: ${exerciseOrId}`);

      actions.startSituationSeed(exercise.startSeed);
      state.interactiveExercise = null;
      state.miniEndPositionExercise = miniEndPositionExerciseState(exercise, { returnHref });
      if (state.phase === "playing") {
        state.turnIndex = seats.indexOf("South");
        state.awaitingTrickAdvance = false;
        state.pendingTrickWinner = null;
      }
      render.renderAll();
      return exercise;
    }

    function startMiniEndPositionExerciseFromUrl() {
      const params = new URLSearchParams(root.location?.search || "");
      const exerciseId = params.get("miniExercise") || params.get("miniexercise") || params.get("mini");
      if (!exerciseId) return false;
      if (!root.PracticeHands?.findVisibleMiniEndPositionExercise?.(exerciseId)) return false;
      startMiniEndPositionExercise(exerciseId, { returnHref: params.get("return") || "" });
      return true;
    }

    function miniEndPositionExerciseState(exercise, { returnHref = "" } = {}) {
      return {
        id: exercise.id,
        lessonId: exercise.lessonId,
        learningGoalId: exercise.learningGoalId,
        mode: exercise.mode,
        startSeed: exercise.startSeed,
        situation: JSON.parse(JSON.stringify(exercise.situation)),
        explanation: JSON.parse(JSON.stringify(exercise.explanation)),
        solution: JSON.parse(JSON.stringify(exercise.solution)),
        selectedCardId: "",
        predictedTricks: "",
        feedback: null,
        checked: false,
        completed: false,
        returnHref
      };
    }

    function handleMiniEndPositionCardSelection(seat, card) {
      const exercise = activeMiniEndPositionQuestion();
      if (!exercise) return false;
      if (seat !== "South" || helpers.seatAt(state.turnIndex) !== "South") return false;
      exercise.selectedCardId = card.id;
      exercise.feedback = null;
      state.illegalActionFeedback = null;
      state.handSuitFocus = null;
      render.renderAll();
      return true;
    }

    function miniEndPositionCardIsSelected(seat, card) {
      const exercise = activeMiniEndPositionExercise();
      return Boolean(exercise && seat === "South" && card?.id && exercise.selectedCardId === card.id);
    }

    function updateMiniEndPositionPrediction(value) {
      const exercise = activeMiniEndPositionExercise();
      if (!exercise || exercise.completed) return false;
      exercise.predictedTricks = String(value || "").replace(/[^\d]/g, "").slice(0, 2);
      render.renderMiniEndPositionExercisePanel?.();
      return true;
    }

    function checkMiniEndPositionAnswer() {
      const exercise = activeMiniEndPositionExercise();
      if (!exercise || exercise.completed) return false;
      const selectedCardId = exercise.selectedCardId || "";
      const predictionText = String(exercise.predictedTricks ?? "").trim();
      const predicted = Number(predictionText);
      const resultList = exercise.solution?.results || exercise.solution?.leadResults || exercise.solution?.startCardResults || [];
      const selectedResult = resultList.find((result) => result.cardId === selectedCardId) || null;
      if (!selectedCardId) {
        setMiniFeedback("retry", "Kies eerst een kaart", "Selecteer de kaart waarmee Zuid begint.");
        return false;
      }
      if (!predictionText || !Number.isInteger(predicted)) {
        setMiniFeedback("retry", "Vul het aantal slagen in", "Voorspel hoeveel slagen Zuid persoonlijk maakt.");
        return false;
      }

      exercise.checked = true;
      const optimalCards = exercise.solution?.optimalCardIds || exercise.solution?.optimalLeadCardIds || exercise.solution?.optimalStartCards || [];
      const maxSouthTricks = exercise.solution?.maxSouthTricks ?? exercise.solution?.maximum;
      const optimal = optimalCards.includes(selectedCardId);
      const predictedOptimal = predicted === maxSouthTricks;
      const predictedChosen = selectedResult && predicted === selectedResult.southTricks;
      if (!optimal || !predictedOptimal) {
        if (optimal) {
          setMiniFeedback("partial", "Startkaart klopt", `Je startkaart is goed. Tel opnieuw hoeveel slagen Zuid maximaal kan maken.`);
          return false;
        }
        if (predictedOptimal) {
          setMiniFeedback("partial", "Voorspelling klopt", "Je aantal Zuid-slagen klopt voor de beste lijn, maar er is een betere startkaart.");
          return false;
        }
        if (predictedChosen) {
          setMiniFeedback("partial", "Gedeeltelijk goed", "Je voorspelling klopt voor deze kaart, maar Zuid kan meer halen.");
          return false;
        }
        setMiniFeedback("retry", "Nog niet", "Deze combinatie van startkaart en voorspelling klopt nog niet.");
        return false;
      }

      setMiniFeedback("correct", "Goed", exercise.explanation.correct);
      playMiniEndPositionSolution(selectedResult);
      exercise.completed = true;
      render.renderAll();
      return true;
    }

    function setMiniFeedback(kind, title, body) {
      const exercise = activeMiniEndPositionExercise();
      if (!exercise) return;
      exercise.feedback = { kind, title, body };
      render.renderAll();
    }

    function playMiniEndPositionSolution(result) {
      const line = result?.line?.length ? result.line : result?.sequence || [];
      if (!line.length) return;
      const selected = activeMiniEndPositionExercise()?.selectedCardId;
      for (const trick of line) {
        const plays = Array.isArray(trick) ? trick : trick.cards || trick.plays || [];
        for (const play of plays) {
          if (state.phase !== "playing" || state.awaitingTrickAdvance) return;
          if (helpers.seatAt(state.turnIndex) !== play.seat) return;
          const card = state.hands[play.seat]?.find((item) => item.id === play.cardId);
          if (!card) return;
          applyMiniCard(play.seat, card);
        }
        if (state.currentTrick.length === 4) advanceMiniTrick(trick.winner || trick.winnerSeat);
      }
      if (selected) activeMiniEndPositionExercise().selectedCardId = selected;
    }

    function applyMiniCard(seat, card) {
      Object.assign(state, BridgeStateTransitions.applyCardPlayTransition(state, { seat, card, cardId: card.id }));
      if (state.currentTrick.length < 4) state.turnIndex = (state.turnIndex + 1) % seats.length;
    }

    function advanceMiniTrick(expectedWinner) {
      const winner = helpers.currentWinningPlay()?.seat;
      if (!winner || (expectedWinner && winner !== expectedWinner)) {
        throw new Error(`Mini end-position solver line mismatch: expected ${expectedWinner || "a winner"}, got ${winner || "none"}`);
      }
      Object.assign(state, BridgeStateTransitions.advanceCompletedTrickTransition(state, {
        winner,
        winningTeam: helpers.teamOf(winner),
        seats
      }));
      render.clearTrickSlots();
    }

    function renderMiniEndPositionExercisePanel() {
      const exercise = activeMiniEndPositionExercise();
      if (!exercise || !els.lessonPanel) return;
      els.lessonPanel.hidden = false;
      els.lessonPanel.innerHTML = "";

      const card = document.createElement("section");
      card.className = "lesson-panel-card interactive-exercise-panel-card mini-end-position-panel-card";
      card.dataset.miniEndPositionExercise = exercise.id;

      const eyebrow = document.createElement("p");
      eyebrow.className = "lesson-panel-eyebrow";
      eyebrow.textContent = "Kaartcombinatie";

      const title = document.createElement("h2");
      title.textContent = exercise.title || "Kies je startkaart";

      const question = document.createElement("p");
      question.className = "lesson-panel-mission";
      question.textContent = exercise.question || "Selecteer een kaart van Zuid en voorspel hoeveel slagen Zuid maakt.";

      card.append(eyebrow, title, question);
      const notes = [];
      if (exercise.situation?.trump) notes.push(`${helpers.suitName(exercise.situation.trump)} is troef.`);
      else if (Object.prototype.hasOwnProperty.call(exercise.situation || {}, "trump")) notes.push("Sans-atout.");
      if (state.dummy) notes.push(`Dummy: ${helpers.seatName(state.dummy)}.`);
      if (miniEndPositionHasAllCardsVisible(exercise)) notes.push("Alle resterende kaarten liggen open.");
      if (notes.length) {
        const note = document.createElement("p");
        note.className = "mini-end-position-note";
        note.textContent = notes.join(" ");
        card.appendChild(note);
      }

      card.appendChild(answerControls(exercise));

      els.lessonPanel.appendChild(card);
      if (exercise.feedback) els.lessonPanel.appendChild(feedbackPanel(exercise));
      if (exercise.completed) els.lessonPanel.appendChild(doneExplanation(exercise));
    }

    function answerControls(exercise) {
      const row = document.createElement("div");
      row.className = "mini-end-position-answer";

      const selected = document.createElement("p");
      selected.className = "lesson-feedback-hint";
      selected.textContent = exercise.selectedCardId
        ? `Gekozen kaart: ${helpers.cardText(cardFromId(exercise.selectedCardId))}`
        : "Nog geen kaart gekozen.";

      const label = document.createElement("label");
      label.className = "mini-end-position-trick-label";
      label.textContent = "Slagen voor Zuid";
      const input = document.createElement("input");
      input.type = "number";
      input.min = "0";
      input.max = String(exercise.situation?.hands?.South?.length || 7);
      input.value = exercise.predictedTricks || "";
      input.disabled = Boolean(exercise.completed);
      input.dataset.miniEndPositionPrediction = "";
      input.dataset.miniEndPositionTricks = "true";
      input.addEventListener("input", () => updateMiniEndPositionPrediction(input.value));
      label.appendChild(input);

      const check = document.createElement("button");
      check.type = "button";
      check.className = "lesson-done-return mini-end-position-check";
      check.textContent = "Controleer";
      check.disabled = Boolean(exercise.completed);
      check.addEventListener("click", (event) => {
        event.stopPropagation();
        checkMiniEndPositionAnswer();
      });

      row.append(selected, label, check);
      return row;
    }

    function feedbackPanel(exercise) {
      const feedback = document.createElement("section");
      feedback.className = `lesson-panel-card ${exercise.feedback.kind === "correct" ? "lesson-panel-done" : "lesson-panel-retry"}`;
      const heading = document.createElement("h3");
      heading.textContent = exercise.feedback.title;
      const body = document.createElement("p");
      body.textContent = exercise.feedback.body;
      feedback.append(heading, body);
      return feedback;
    }

    function doneExplanation(exercise) {
      const section = document.createElement("section");
      section.className = "lesson-panel-card lesson-panel-done";
      const heading = document.createElement("h3");
      heading.textContent = "Uitleg";
      const correct = document.createElement("p");
      correct.textContent = exercise.explanation.correct;
      const why = document.createElement("p");
      why.textContent = exercise.explanation.why;
      section.append(heading, correct, why);
      if (exercise.explanation.commonMistake) {
        const mistake = document.createElement("p");
        mistake.className = "lesson-feedback-hint";
        mistake.textContent = exercise.explanation.commonMistake;
        section.appendChild(mistake);
      }
      return section;
    }

    function cardFromId(id) {
      return { id, rank: id.slice(0, -1), suit: id.slice(-1) };
    }

    actions.interactiveExerciseSuppressesGuidance = function interactiveExerciseSuppressesGuidanceWithMini(type = "") {
      return Boolean(previousSuppressesGuidance?.(type) || miniEndPositionSuppressesGuidance());
    };

    actions.currentUitspelenAnalysis = function currentUitspelenAnalysisWithMiniEndPosition() {
      if (miniEndPositionSuppressesUitspelen()) return { available: false, reason: "miniEndPositionExercise" };
      return previousCurrentUitspelenAnalysis?.() || { available: false, reason: "notAvailable" };
    };

    render.renderDeterministicPlayout = function renderDeterministicPlayoutWithMiniEndPosition() {
      if (miniEndPositionSuppressesUitspelen()) {
        if (els.uitspelenAction) els.uitspelenAction.hidden = true;
        if (els.uitspelenUnavailable) {
          els.uitspelenUnavailable.textContent = "";
          els.uitspelenUnavailable.hidden = true;
        }
        return;
      }
      previousRenderDeterministicPlayout?.();
    };

    actions.isHumanControlledSeat = function isHumanControlledSeatWithMiniEndPosition(seat) {
      if (activeMiniEndPositionQuestion()) return seat === "South";
      return previousIsHumanControlledSeat?.(seat) || false;
    };

    actions.isSeatVisible = function isSeatVisibleWithMiniEndPosition(seat) {
      if (miniEndPositionSeatIsVisible(seat)) return true;
      return previousIsSeatVisible?.(seat) || false;
    };

    actions.playCard = function playCardWithMiniEndPosition(seat, cardId) {
      const exercise = activeMiniEndPositionQuestion();
      if (exercise) {
        const card = state.hands[seat]?.find((item) => item.id === cardId);
        if (card && handleMiniEndPositionCardSelection(seat, card)) return;
        if (seat === "South") return;
      }
      previousPlayCard?.(seat, cardId);
    };

    render.renderInteractiveExercisePanel = function renderInteractiveExercisePanelWithMiniEndPosition() {
      previousRenderInteractiveExercisePanel?.();
      if (!state.interactiveExercise) renderMiniEndPositionExercisePanel();
    };

    Object.assign(actions, {
      activeMiniEndPositionExercise,
      activeMiniEndPositionQuestion,
      checkMiniEndPositionAnswer,
      handleMiniEndPositionCardSelection,
      miniEndPositionCardIsSelected,
      miniEndPositionSeatIsVisible,
      miniEndPositionShowsHistory,
      miniEndPositionSuppressesGuidance,
      miniEndPositionSuppressesLiveHistory,
      miniEndPositionSuppressesUitspelen,
      selectMiniEndPositionLeadCard: handleMiniEndPositionCardSelection,
      startMiniEndPositionExercise,
      startMiniEndPositionExerciseFromUrl,
      updateMiniEndPositionPrediction
    });
    Object.assign(render, {
      renderMiniEndPositionExercisePanel
    });
  };
})(typeof globalThis !== "undefined" ? globalThis : this);

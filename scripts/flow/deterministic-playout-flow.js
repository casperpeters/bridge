(function registerBridgeDeterministicPlayoutFlow(root) {
  "use strict";

  const modules = root.BridgeAppModules = root.BridgeAppModules || {};

  modules.registerDeterministicPlayoutFlow = function registerDeterministicPlayoutFlow(runtime) {
    const { actions, constants, els, helpers, render, rules, state, timers } = runtime;
    const { rankOrder, seats } = constants;

    let pendingAnalysis = null;
    let uitspelenDialogOpen = false;

    function currentUitspelenAnalysis() {
      if (state.phase !== "playing") {
        clearStoredProof();
        return { available: false, reason: "notPlaying" };
      }

      const storedAnalysis = analysisFromStoredProof();
      if (storedAnalysis?.stale) clearStoredProof();

      if (state.awaitingTrickAdvance || state.currentTrick.length) {
        return { available: false, reason: "notAtTrickStart" };
      }
      if (actions.lessonBoardSuppressesUitspelen?.()) {
        return { available: false, reason: "lessonBoardStepSuppressesUitspelen" };
      }
      if (actions.miniEndPositionSuppressesUitspelen?.()) {
        return { available: false, reason: "miniEndPositionExerciseSuppressesUitspelen" };
      }
      if (storedAnalysis?.available) return storedAnalysis;

      const currentTurn = helpers.seatAt(state.turnIndex);
      const visibleSeats = seats.filter((seat) => actions.isSeatVisible?.(seat));
      const analyzeUitspelen = rules.analyzeVisibleUitspelen || rules.analyzeVisibleNotrumpUitspelen;
      const analysis = analyzeUitspelen({
        hands: state.hands,
        visibleSeats,
        contract: state.contract,
        declarer: state.declarer,
        currentTurn,
        currentTrick: state.currentTrick,
        trickHistory: state.trickHistory,
        nodeBudget: state.deterministicPlayoutSearchNodeBudget ?? undefined
      });
      if (!analysis.available) return analysis;
      storeProof(analysis);
      return {
        ...analysis,
        proofSource: "fresh"
      };
    }

    function renderDeterministicPlayout() {
      if (!els.uitspelenAction || !els.uitspelenButton) return;
      const analysis = currentUitspelenAnalysis();
      els.uitspelenAction.hidden = !analysis.available;
      els.uitspelenButton.textContent = "Uitspelen";
      els.uitspelenButton.setAttribute("aria-label", "Uitspelen");
      renderUnavailableReason(analysis);
    }

    function openUitspelenDialog(event) {
      event?.stopPropagation();
      const analysis = currentUitspelenAnalysis();
      if (!analysis.available) return;
      pendingAnalysis = analysis;
      uitspelenDialogOpen = true;
      timers.flowGeneration += 1;
      renderUitspelenDialog(analysis);
      if (typeof els.uitspelenDialog.showModal === "function") {
        els.uitspelenDialog.showModal();
      } else {
        els.uitspelenDialog.setAttribute("open", "");
      }
    }

    function closeUitspelenDialog(event) {
      event?.stopPropagation();
      pendingAnalysis = null;
      uitspelenDialogOpen = false;
      if (typeof els.uitspelenDialog.close === "function") {
        els.uitspelenDialog.close();
      } else {
        els.uitspelenDialog.removeAttribute("open");
      }
    }

    function handleUitspelenCancel(event) {
      event?.preventDefault();
      closeUitspelenDialog(event);
    }

    function cleanupUitspelenDialog() {
      pendingAnalysis = null;
      uitspelenDialogOpen = false;
    }

    function isUitspelenDialogOpen() {
      return uitspelenDialogOpen || Boolean(els.uitspelenDialog?.open);
    }

    function confirmUitspelen(event) {
      event?.stopPropagation();
      const analysis = currentUitspelenAnalysis();
      const planned = analysis.available ? analysis : pendingAnalysis;
      closeUitspelenDialog(event);
      if (!planned?.available) return;
      playOutDeterministicEnding(planned);
    }

    function renderUitspelenDialog(analysis) {
      const remaining = analysis.remainingTricks;
      const ns = analysis.tricksByTeam.NS;
      const ew = analysis.tricksByTeam.EW;
      els.uitspelenTitle.textContent = "Uitspelen?";
      els.uitspelenSummary.textContent = `De rest ligt vast: ${remaining} ${trickWord(remaining)}. Noord/Zuid ${ns} ${trickWord(ns)} - Oost/West ${ew} ${trickWord(ew)}.`;
      els.uitspelenClose.setAttribute("aria-label", "Sluiten");
      els.uitspelenCancel.textContent = "Annuleren";
      els.uitspelenConfirm.textContent = "Uitspelen";
    }

    function playOutDeterministicEnding(analysis) {
      for (const step of analysis.sequence) {
        if (state.phase !== "playing" || state.awaitingTrickAdvance || state.currentTrick.length) return;
        if (helpers.seatAt(state.turnIndex) !== step.leader) return;
        const beforeTrickCount = state.trickHistory.length;
        if (!playPlannedTrick(step)) return;
        const completed = state.trickHistory[state.trickHistory.length - 1] || null;
        if (state.trickHistory.length !== beforeTrickCount + 1 || !completed) return;
        if (completed.winner !== step.winnerSeat) {
          throw new Error(`Uitspelen proof mismatch: expected ${step.winnerSeat} to win trick ${completed.number || state.trickHistory.length}, got ${completed.winner || "unknown"}`);
        }
      }
      if (state.phase === "playing" && !state.currentTrick.length && allHandsEmpty()) {
        actions.finishHand();
      }
      render.renderAll();
    }

    function playPlannedTrick(step) {
      const start = seats.indexOf(step.leader);
      for (let offset = 0; offset < seats.length; offset += 1) {
        const seat = seats[(start + offset) % seats.length];
        const card = plannedCardForSeat(step, seat) || lowestLegalCard(seat);
        if (!actions.autoPlayCard(seat, card)) return false;
      }
      return true;
    }

    function plannedCardForSeat(step, seat) {
      if (seat === step.leader) return cardById(seat, step.leadCardId);
      if (seat === step.winnerSeat) return cardById(seat, step.winningCardId);
      return null;
    }

    function lowestLegalCard(seat) {
      return [...helpers.legalCards(seat)].sort((a, b) => {
        const rankDiff = rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank);
        if (rankDiff) return rankDiff;
        return a.suit.localeCompare(b.suit);
      })[0] || null;
    }

    function cardById(seat, cardId) {
      return state.hands[seat]?.find((card) => card.id === cardId) || null;
    }

    function allHandsEmpty() {
      return seats.every((seat) => (state.hands[seat] || []).length === 0);
    }

    function storeProof(analysis) {
      state.deterministicPlayoutProof = {
        contract: compactContract(state.contract),
        declarer: state.declarer,
        dummy: state.dummy,
        startTurn: helpers.seatAt(state.turnIndex),
        startTrickHistoryLength: state.trickHistory.length,
        startTrickHistoryKey: state.trickHistory.map(trickKey),
        remainingTricks: analysis.remainingTricks,
        ruleId: analysis.ruleId,
        reason: analysis.reason,
        trump: analysis.trump || null,
        sequence: cloneSequence(analysis.sequence)
      };
    }

    function analysisFromStoredProof() {
      const proof = state.deterministicPlayoutProof;
      if (!proof) return null;
      if (!storedProofContextMatches(proof)) return { stale: true };
      const prefixLength = state.trickHistory.length - proof.startTrickHistoryLength;
      if (prefixLength < 0 || prefixLength > proof.sequence.length) return { stale: true };
      for (let index = 0; index < proof.startTrickHistoryKey.length; index += 1) {
        if (trickKey(state.trickHistory[index]) !== proof.startTrickHistoryKey[index]) return { stale: true };
      }
      for (let index = 0; index < prefixLength; index += 1) {
        if (!trickMatchesProofStep(state.trickHistory[proof.startTrickHistoryLength + index], proof.sequence[index])) {
          return { stale: true };
        }
      }

      const remainingSequence = proof.sequence.slice(prefixLength);
      if (!remainingSequence.length) return { stale: true };
      const nextLeader = remainingSequence[0].leader;
      if (helpers.seatAt(state.turnIndex) !== nextLeader) return { stale: true };

      return {
        available: true,
        ruleId: proof.ruleId,
        reason: proof.reason,
        trump: proof.trump,
        remainingTricks: remainingSequence.length,
        winningSeats: remainingSequence.map((step) => step.winnerSeat),
        tricksByTeam: tricksByTeamForSequence(remainingSequence),
        sequence: cloneSequence(remainingSequence),
        proofSource: "stored"
      };
    }

    function storedProofContextMatches(proof) {
      return sameContract(proof.contract, compactContract(state.contract))
        && proof.declarer === state.declarer
        && proof.dummy === state.dummy;
    }

    function trickMatchesProofStep(trick, step) {
      if (!trick || !step) return false;
      if (trick.winner !== step.winnerSeat) return false;
      const cards = trick.cards || [];
      const leaderPlay = cards[0] || null;
      if (leaderPlay?.seat !== step.leader) return false;
      if (step.leadCardId && leaderPlay.card?.id !== step.leadCardId) return false;
      const winningPlay = cards.find((play) => play.seat === step.winnerSeat);
      if (step.winningCardId && winningPlay?.card?.id !== step.winningCardId) return false;
      return (step.visiblePlays || []).every((expected) => {
        const actual = cards.find((play) => play.seat === expected.seat);
        return actual?.card?.id === expected.cardId;
      });
    }

    function tricksByTeamForSequence(sequence) {
      return sequence.reduce((counts, step) => {
        counts[helpers.teamOf(step.winnerSeat)] += 1;
        return counts;
      }, { NS: 0, EW: 0 });
    }

    function compactContract(contract) {
      if (!contract) return null;
      return {
        level: contract.level,
        strain: contract.strain,
        doubled: Boolean(contract.doubled),
        redoubled: Boolean(contract.redoubled)
      };
    }

    function sameContract(a, b) {
      if (!a || !b) return a === b;
      return a.level === b.level
        && a.strain === b.strain
        && Boolean(a.doubled) === Boolean(b.doubled)
        && Boolean(a.redoubled) === Boolean(b.redoubled);
    }

    function cloneSequence(sequence = []) {
      return sequence.map((step) => ({
        ...step,
        visiblePlays: (step.visiblePlays || []).map((play) => ({ ...play }))
      }));
    }

    function trickKey(trick) {
      if (!trick) return "";
      return [
        trick.number || "",
        trick.winner || "",
        ...(trick.cards || []).map((play) => `${play.seat}:${play.card?.id || ""}`)
      ].join("|");
    }

    function clearStoredProof() {
      state.deterministicPlayoutProof = null;
    }

    function trickWord(count) {
      return count === 1 ? "slag" : "slagen";
    }

    function renderUnavailableReason(analysis) {
      if (!els.uitspelenUnavailable) return;
      const showDeveloperReason = state.developerMode && state.phase === "playing";
      const text = !analysis.available && showDeveloperReason
        ? unavailableReasonText(analysis)
        : "";
      els.uitspelenUnavailable.textContent = text;
      els.uitspelenUnavailable.hidden = !text;
    }

    function unavailableReasonText(analysis) {
      const reason = unavailableReasonLabel(analysis.reason);
      if (!reason) return "";
      const budget = analysis.nodeBudget
        ? ` (${analysis.nodeBudget.used}/${analysis.nodeBudget.limit} nodes)`
        : "";
      return `Uitspelen: ${reason}${budget}`;
    }

    function unavailableReasonLabel(reason) {
      const labels = {
        analysisBudget: "zoekruimte te groot",
        ambiguousWinnerSeat: "winnaarvolgorde niet vast",
        currentTrickInProgress: "slag bezig",
        currentTurnHidden: "verborgen hand aan zet",
        hiddenHigherCard: "verborgen hogere kaart mogelijk",
        hiddenTrumpRuff: "verborgen introever mogelijk",
        lessonBoardStepSuppressesUitspelen: "lesstap blokkeert",
        missingContext: "context ontbreekt",
        noRemainingCards: "geen kaarten over",
        noVisibleSeats: "geen zichtbare hand",
        noVisibleTopWinnerRunout: "geen vaste winnaarreeks",
        notAtTrickStart: "niet aan slagstart",
        notNotrump: "geen sans-atout",
        notPlaying: "niet in speelfase",
        searchNodeBudgetExhausted: "zoekbudget op",
        unsupportedContractStrain: "contractsoort niet ondersteund"
      };
      return labels[reason] || reason || "";
    }

    els.uitspelenButton?.addEventListener("click", openUitspelenDialog);
    els.uitspelenClose?.addEventListener("click", closeUitspelenDialog);
    els.uitspelenCancel?.addEventListener("click", closeUitspelenDialog);
    els.uitspelenConfirm?.addEventListener("click", confirmUitspelen);
    els.uitspelenDialog?.addEventListener("cancel", handleUitspelenCancel);
    els.uitspelenDialog?.addEventListener("close", cleanupUitspelenDialog);
    els.uitspelenDialog?.addEventListener("click", (event) => {
      if (event.target === els.uitspelenDialog) closeUitspelenDialog(event);
    });

    Object.assign(actions, {
      confirmUitspelen,
      currentUitspelenAnalysis,
      isUitspelenDialogOpen,
      openUitspelenDialog,
      playOutDeterministicEnding
    });
    Object.assign(render, {
      renderDeterministicPlayout
    });
  };
})(typeof globalThis !== "undefined" ? globalThis : this);

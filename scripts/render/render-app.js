(function registerBridgeAppRenderer(root) {
  "use strict";

  const modules = root.BridgeAppModules = root.BridgeAppModules || {};

  modules.registerAppRenderer = function registerAppRenderer(runtime) {
    const { actions, constants, dom, els, helpers, media, render, reviewPlayback, state, timers } = runtime;
    const { roleSeparator, seats, separatorDot, suitSymbols } = constants;
    const { seatEls, slotEls } = dom;

    function jumpToTrickOverview() {
      for (let attempt = 0; attempt < 12; attempt += 1) {
        actions.startHand({ skipFlow: true });
        actions.autoCompleteAuction();
        if (state.phase !== "playing") continue;
        actions.autoCompletePlay();
        break;
      }
      renderAll();
      window.setTimeout(scrollReviewToTricks, 0);
    }

    function scrollReviewToTricks() {
      if (!els.reviewTricks || els.reviewPanel.hidden) return;
      els.reviewPanel.scrollTop = Math.max(0, els.reviewTricks.offsetTop - els.reviewPanel.offsetTop);
    }

    function scrollBidExplanationIntoView(index) {
      if (!state.developerMode || els.bidExplanations.hidden) return false;
      const target = els.bidExplanations.querySelector(`[data-bid-explanation-index="${index}"]`);
      if (!target) return false;
      target.scrollIntoView({ block: "nearest" });
      return true;
    }

    function selectReviewTrickNumber(trickNumber) {
      if (state.phase !== "complete" || !state.trickHistory.length) return false;
      const index = state.trickHistory.findIndex((trick) => trick.number === trickNumber);
      if (index < 0) return false;
      return activateReviewCursor({ trickIndex: index, playIndex: 0 });
    }

    function selectReviewPlayExplanation(trickNumber, seat, card) {
      if (!state.developerMode || !state.trickHistory.length) return false;
      const index = state.trickHistory.findIndex((trick) => trick.number === trickNumber);
      if (index < 0) return false;
      const cardId = typeof card === "string" ? card : card?.id;
      const playIndex = state.trickHistory[index].cards.findIndex((play) => play.seat === seat && play.card?.id === cardId);
      if (playIndex < 0) return false;
      const key = actions.playExplanationKey(trickNumber, seat, card);
      if (state.phase === "complete") activateReviewCursor({ trickIndex: index, playIndex }, { scroll: false });
      window.setTimeout(() => scrollReviewPlayExplanationIntoView(key), 0);
      return true;
    }

    function scrollReviewTrickExplanationIntoView(trickNumber) {
      const panel = state.phase === "complete" ? els.reviewPanel : els.historyPanel;
      if (!panel || panel.hidden) return;
      const target = panel.querySelector(`[data-play-explanation-trick="${trickNumber}"]`);
      target?.scrollIntoView({ block: "nearest" });
    }

    function scrollReviewPlayExplanationIntoView(key) {
      const panel = state.phase === "complete" ? els.reviewPanel : els.historyPanel;
      if (!panel || panel.hidden) return;
      const target = Array.from(panel.querySelectorAll(".play-explanation[data-play-explanation-key]"))
        .find((element) => element.dataset.playExplanationKey === key);
      target?.scrollIntoView({ block: "nearest" });
    }

    function moveReviewTrickCursor(delta) {
      if (state.phase !== "complete" || !state.trickHistory.length || els.reviewPanel.hidden) return false;
      const nextCursor = reviewPlayback.moveReviewCursor(state.trickHistory, state.reviewCursor, delta);
      if (!nextCursor) return false;
      activateReviewCursor(nextCursor);
      return true;
    }

    function activateReviewCursor(cursor, { scroll = true } = {}) {
      const previousPlayback = currentReviewPlayback();
      const previousPlayKeys = new Set((previousPlayback?.currentTrick || []).map((play) => reviewPlaybackPlayKey(previousPlayback.trickNumber, play)));
      const nextCursor = reviewPlayback.normalizeCursor(state.trickHistory, cursor);
      if (!nextCursor) return false;
      state.reviewCursor = nextCursor;
      state.reviewTrickCursor = nextCursor.trickIndex;
      state.scoreOverviewDismissed = true;
      const nextPlayback = currentReviewPlayback();
      const selectedKey = nextPlayback?.selectedPlay ? reviewPlaybackPlayKey(nextPlayback.trickNumber, nextPlayback.selectedPlay) : null;
      state.reviewPlaybackAnimationKey = selectedKey && !previousPlayKeys.has(selectedKey) ? selectedKey : null;
      renderAll();
      if (scroll) window.setTimeout(scrollSelectedReviewTrickIntoView, 0);
      return true;
    }

    function ensureReviewTrickCursor() {
      const cursor = reviewPlayback.normalizeCursor(state.trickHistory, state.reviewCursor);
      if (!cursor) {
        state.reviewTrickCursor = null;
        return null;
      }
      state.reviewCursor = cursor;
      state.reviewTrickCursor = cursor.trickIndex;
      return state.trickHistory[cursor.trickIndex]?.number || null;
    }

    function reviewPlayIsSelected(trickNumber, seat, card) {
      const cursor = reviewPlayback.normalizeCursor(state.trickHistory, state.reviewCursor);
      if (!cursor) return false;
      const trick = state.trickHistory[cursor.trickIndex];
      const selectedPlay = trick?.cards?.[cursor.playIndex];
      return trick?.number === trickNumber && selectedPlay?.seat === seat && selectedPlay.card?.id === card?.id;
    }

    function currentReviewPlayback() {
      if (state.phase !== "complete") return null;
      return reviewPlayback.deriveReviewPlayback({
        originalHands: state.originalHands,
        trickHistory: state.trickHistory,
        cursor: state.reviewCursor,
        seats
      });
    }

    function scrollSelectedReviewTrickIntoView() {
      if (!els.reviewPanel || els.reviewPanel.hidden) return;
      const selectedRow = els.reviewPanel.querySelector(".review-trick-row.is-review-selected");
      selectedRow?.scrollIntoView({ block: "nearest" });
    }

    function renderAll() {
      applyStaticText();
      renderResponsiveLayoutState();
      render.renderScoreTable();
      renderTurnFocus();
      if (!shouldSkipHandRenderForDealAnimation()) render.renderHands();
      renderReviewPlaybackTrickSlots();
      renderTrickSlotFocus();
      render.renderInteractiveExerciseTrickQuestion?.();
      render.renderAuction();
      render.renderBidControls();
      render.renderPlayPlan();
      render.renderHistory();
      render.renderLessonPanel?.();
      render.renderInteractiveExercisePanel?.();
      render.renderPlayExplanations();
      render.renderReview();
      renderContract();
      renderGuidance();
      render.renderDeterministicPlayout?.();
      render.renderLessonBanner();
      render.renderContractReveal();
      render.renderFeedbackStatus();
      renderIllegalActionFeedback();
      renderReplayPanel();
      els.dealerBadge.textContent = `${helpers.t("board")} ${state.dealNumber} ${separatorDot} ${helpers.t("dealer")}: ${helpers.seatName(helpers.seatAt(state.dealerIndex))}`;
      els.trickCount.textContent = `${state.tricks.NS + state.tricks.EW} ${helpers.t("tricks")}`;
      renderScoreline();
      renderHint();
      renderTrickAdvanceHint();
      render.renderSeedControls();
      renderStatus();
    }

    function renderResponsiveLayoutState() {
      const isBidding = state.phase === "bidding";
      const isContractReveal = state.phase === "contract-reveal";
      const useTableBiddingLayout = isBidding;
      const useMobileBiddingLayout = Boolean(useTableBiddingLayout && media.mobileBiddingLayoutQuery?.matches);
      const useStableSidebarLayout = Boolean(media.stableSidebarLayoutQuery?.matches);
      els.appShell?.classList.toggle("is-bidding", isBidding);
      els.appShell?.classList.toggle("is-playing", state.phase === "playing");
      els.appShell?.classList.toggle("is-contract-reveal", isContractReveal);
      els.appShell?.classList.toggle("is-table-bidding", useTableBiddingLayout);
      els.appShell?.classList.toggle("is-mobile-bidding", useMobileBiddingLayout);
      els.appShell?.classList.toggle("has-stable-sidebars", useStableSidebarLayout);

      if (!els.auctionPanel || !els.sidePanel || !els.mobileBiddingSlot) return;

      if (useTableBiddingLayout) {
        if (els.bidControls.parentElement !== els.mobileBiddingSlot) {
          els.mobileBiddingSlot.appendChild(els.bidControls);
        }
        els.mobileBiddingSlot.setAttribute("aria-hidden", "false");
        return;
      }

      if (els.bidControls.parentElement === els.mobileBiddingSlot) {
        els.bidControlsTitle.insertAdjacentElement("afterend", els.bidControls);
      }
      els.mobileBiddingSlot.setAttribute("aria-hidden", "true");
    }

    function isMobileLayout() {
      return Boolean(media.mobileLayoutQuery?.matches);
    }

    function usesStableSidebarLayout() {
      return Boolean(media.stableSidebarLayoutQuery?.matches);
    }

    function focusHandSuit(seat, suit) {
      if (!isMobileLayout() || !seat || !suit) return false;
      state.handSuitFocus = { seat, suit };
      render.renderHands();
      return true;
    }

    function clearHandSuitFocus() {
      if (!state.handSuitFocus) return false;
      state.handSuitFocus = null;
      render.renderHands();
      return true;
    }

    function clearHandSuitFocusFromOutsideClick(target) {
      if (!state.handSuitFocus || !isMobileLayout()) return false;
      const focusedHand = seatEls[state.handSuitFocus.seat];
      if (focusedHand?.contains(target)) return false;
      clearHandSuitFocus();
      return false;
    }

    function shouldSkipHandRenderForDealAnimation() {
      if (!state.animateDeal || !timers.dealAnimationHandsLocked || !timers.dealAnimationHandRenderSnapshot) return false;
      const current = dealAnimationHandRenderState();
      const snapshot = timers.dealAnimationHandRenderSnapshot;
      return (
        current.phase === snapshot.phase &&
        current.hands === snapshot.hands &&
        current.developerMode === snapshot.developerMode &&
        current.guidanceMode === snapshot.guidanceMode &&
        current.declarer === snapshot.declarer &&
        current.dummy === snapshot.dummy &&
        current.turnIndex === snapshot.turnIndex &&
        current.awaitingTrickAdvance === snapshot.awaitingTrickAdvance &&
        current.currentTrickLength === snapshot.currentTrickLength &&
        current.trickHistoryLength === snapshot.trickHistoryLength
      );
    }

    function lockDealAnimationHands() {
      if (!state.animateDeal) return;
      timers.dealAnimationHandsLocked = true;
      timers.dealAnimationHandRenderSnapshot = dealAnimationHandRenderState();
    }

    function dealAnimationHandRenderState() {
      const playing = state.phase === "playing";
      return {
        phase: state.phase,
        hands: state.phase === "complete" ? state.originalHands : state.hands,
        developerMode: state.developerMode,
        guidanceMode: state.guidanceMode,
        declarer: state.declarer,
        dummy: state.dummy,
        turnIndex: playing ? state.turnIndex : null,
        awaitingTrickAdvance: playing ? state.awaitingTrickAdvance : false,
        currentTrickLength: playing ? state.currentTrick.length : 0,
        trickHistoryLength: playing ? state.trickHistory.length : 0
      };
    }

    function prefersReducedMotion() {
      return Boolean(globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
    }

    function renderReplayPanel() {
      const complete = state.phase === "complete" && state.finalScore && (state.contract || state.finalScore.passOut) && !state.scoreOverviewDismissed;
      els.replayPanel.hidden = !complete;
      if (!complete) return;

      els.replayContract.textContent = replayContractText();
      els.replayResult.textContent = replayResultText();
      els.replayPanel.dataset.strainSymbol = replayPanelSymbol();
      const playerScore = playerScoreValue();
      els.replayScore.textContent = replayScoreText(playerScore);
      els.replayScore.parentElement?.classList.toggle("is-positive", playerScore > 0);
      els.replayScore.parentElement?.classList.toggle("is-negative", playerScore < 0);
      els.replayScore.parentElement?.classList.toggle("is-neutral", playerScore === 0);
      els.replayScoreExplanation.textContent = replayScoreExplanationText(playerScore);
    }

    function renderTurnFocus() {
      const focusClasses = seats.map((seat) => `turn-focus-${seat.toLowerCase()}`);
      els.tableArea.classList.remove(...focusClasses);
      if (state.phase === "bidding" && helpers.seatAt(state.turnIndex) === "South") {
        els.tableArea.classList.add("turn-focus-south");
        return;
      }
      if (state.phase !== "playing" || state.awaitingTrickAdvance) return;
      els.tableArea.classList.add(`turn-focus-${helpers.seatAt(state.turnIndex).toLowerCase()}`);
    }

    function renderTrickSlotFocus() {
      Object.values(slotEls).forEach((slot) => {
        slot.classList.remove("active-trick-slot", "pending-trick-winner");
      });
      const playback = currentReviewPlayback();
      if (playback) {
        if (playback.winner) {
          slotEls[playback.winner]?.classList.add("pending-trick-winner");
          return;
        }
        if (playback.activeSeat) slotEls[playback.activeSeat]?.classList.add("active-trick-slot");
        return;
      }
      if (state.phase === "playing" && state.awaitingTrickAdvance && state.pendingTrickWinner) {
        slotEls[state.pendingTrickWinner]?.classList.add("pending-trick-winner");
        return;
      }
      if (state.phase !== "playing" || state.awaitingTrickAdvance) return;
      slotEls[helpers.seatAt(state.turnIndex)]?.classList.add("active-trick-slot");
    }

    function renderReviewPlaybackTrickSlots() {
      if (state.phase !== "complete") return;
      render.clearTrickSlots();
      const playback = currentReviewPlayback();
      if (!playback) {
        state.reviewPlaybackAnimationKey = null;
        return;
      }
      const animationKey = state.reviewPlaybackAnimationKey;
      playback.currentTrick.forEach((play) => {
        const playKey = reviewPlaybackPlayKey(playback.trickNumber, play);
        render.renderPlayedCard(play.seat, play.card, {
          animate: playKey === animationKey,
          reviewPlayback: true,
          settled: playKey !== animationKey
        });
      });
      state.reviewPlaybackAnimationKey = null;
    }

    function reviewPlaybackPlayKey(trickNumber, play) {
      return `${trickNumber}:${play?.seat || ""}:${play?.card?.id || ""}`;
    }

    function applyStaticText() {
      document.title = helpers.t("title");
      els.title.textContent = helpers.t("title");
      els.heading.textContent = helpers.t("heading");
      if (els.playMode) els.playMode.textContent = helpers.t("playMode");
      render.applySettingsStaticText();
      els.openFeedback.textContent = helpers.t("openFeedback");
      els.openLessons.textContent = helpers.t("openLessons");
      els.openGlossary.textContent = helpers.t("openGlossary");
      els.openScoreTable.textContent = helpers.t("openScoreTable");
      els.newHand.textContent = helpers.t("newHand");
      els.sameHand.textContent = helpers.t("sameHand");
      els.replayTitle.textContent = helpers.t("replayTitle");
      els.replayNewHand.textContent = helpers.t("newHand");
      els.replaySameHand.textContent = helpers.t("sameHand");
      els.quickReview.textContent = helpers.t("quickReview");
      els.developerOnlyElements.forEach((element) => {
        element.hidden = !state.developerMode;
      });
      els.seedLabel.textContent = helpers.t("seed");
      els.loadSeed.textContent = helpers.t("loadSeed");
      els.copySeed.textContent = helpers.t("copySeed");
      renderSeatLabel(els.northLabel, "North", helpers.t("partner"));
      renderSeatLabel(els.eastLabel, "East");
      renderSeatLabel(els.southLabel, "South", helpers.t("you"));
      renderSeatLabel(els.westLabel, "West");
      els.biddingTitle.textContent = helpers.t("bidding");
      els.historyTitle.textContent = helpers.t("history");
      els.reviewTitle.textContent = helpers.t("review");
      render.applyFeedbackStaticText();
      els.closeScoreTable.setAttribute("aria-label", helpers.t("closeScoreTable"));
      els.closeGlossary.setAttribute("aria-label", helpers.t("closeGlossary"));
      els.glossaryTitle.textContent = helpers.t("glossaryTitle");
      els.hintButton.setAttribute("aria-label", helpers.t("hint"));
    }

    function renderGuidance() {
      els.guidancePanel.hidden = true;
      els.guidancePanel.innerHTML = "";
      if (!state.guidanceMode || state.awaitingTrickAdvance) return;
      if (actions.blockingLessonBoardStep()) return;
      if (actions.interactiveExerciseSuppressesGuidance?.()) return;

      const guidance = currentGuidance();
      if (!guidance) return;

      const title = document.createElement("strong");
      title.textContent = `${guidance.label}: ${guidance.action}`;
      const reason = document.createElement("span");
      reason.appendChild(BridgeGlossary.linkifyText(guidance.reason));
      els.guidancePanel.append(title, reason);
      els.guidancePanel.hidden = false;
    }

    function renderSeatLabel(label, seat, role = "") {
      if (!label) return;
      let name = label.querySelector(".seat-label-name");
      if (!name || name.parentElement !== label) {
        name = document.createElement("span");
        name.className = "seat-label-name";
        label.replaceChildren(name);
      }

      const nextName = helpers.seatName(seat);
      if (name.textContent !== nextName) name.textContent = nextName;
      name.classList.toggle("is-vulnerable-team", helpers.isSeatVulnerable(seat));

      const roleText = role ? ` ${roleSeparator} ${role}` : "";
      const roleNode = Array.from(label.childNodes).find((node) => node.nodeType === Node.TEXT_NODE);
      Array.from(label.childNodes).forEach((node) => {
        if (node !== name && node !== roleNode) node.remove();
      });

      if (!roleText) {
        roleNode?.remove();
        return;
      }

      if (roleNode) {
        if (roleNode.textContent !== roleText) roleNode.textContent = roleText;
        if (roleNode.previousSibling !== name) name.after(roleNode);
        return;
      }

      name.after(document.createTextNode(roleText));
    }

    function currentGuidance() {
      if (state.phase === "bidding" && !state.animateDeal && helpers.seatAt(state.turnIndex) === "South") return biddingGuidance();
      if (state.phase === "playing" && actions.isHumanControlledSeat(helpers.seatAt(state.turnIndex))) return cardGuidance();
      return null;
    }

    function biddingGuidance() {
      const result = actions.chooseRecommendedBidResult("South");
      return {
        label: helpers.t("recommendedBid"),
        action: helpers.formatCall(result.bid),
        reason: actions.recommendedBidReason(result, "South")
      };
    }

    function cardGuidance() {
      const seat = helpers.seatAt(state.turnIndex);
      const result = actions.chooseCardPlayResult(seat);
      if (!result?.card) return null;
      return {
        label: helpers.t("recommendedCard"),
        action: helpers.cardText(result.card),
        reason: `${actions.explainCardPlayResult(result)}${actions.playPlanReferenceText(result)}`
      };
    }

    function formatCall(call) {
      if (helpers.isPass(call)) return helpers.t("pass");
      if (helpers.isDouble(call)) return helpers.t("double");
      if (helpers.isRedouble(call)) return helpers.t("redouble");
      return helpers.formatBid(call);
    }

    function renderHint() {
      els.hintButton.dataset.hint = currentHint();
    }

    function renderIllegalActionFeedback() {
      if (!els.tableFeedback) return;
      els.tableFeedback.hidden = !state.illegalActionFeedback;
      els.tableFeedback.textContent = state.illegalActionFeedback || "";
    }

    function renderTrickAdvanceHint() {
      els.trickAdvanceHint.hidden = !state.awaitingTrickAdvance;
      if (!state.awaitingTrickAdvance) {
        els.trickAdvanceHint.textContent = "";
        return;
      }
      els.trickAdvanceHint.textContent = "Klik ergens of druk op Enter voor de volgende slag.";
    }

    function currentHint() {
      if (state.phase === "idle") return "Deel een nieuwe hand om te starten.";
      if (state.phase === "bidding") return biddingHint();
      if (state.phase === "contract-reveal") return "Het contract is bekend. Klik op de tafel of druk op Enter om het spel te starten.";
      if (state.phase === "playing") return playingHint();
      if (state.phase === "complete") {
        return state.developerMode
          ? "Bekijk het scoreoverzicht. In Developermodus zie je ook bied- en speeluitleg."
          : "Bekijk het scoreoverzicht om het biedverloop en de slagen terug te zien. Zet Developermodus aan voor extra uitleg.";
      }
      return "Zet Developermodus aan om meer uitleg over biedingen en speelkeuzes te zien.";
    }

    function biddingHint() {
      if (state.animateDeal) return "Wacht tot de kaarten gedeeld zijn; daarna begint het bieden.";
      if (helpers.seatAt(state.turnIndex) === "South") {
        if (helpers.highestBid()) return "Je mag alleen hoger bieden dan het huidige hoogste bod. Pas betekent dat je nu geen bod doet.";
        return "Open alleen met genoeg kracht of een duidelijke verdeling. 1SA toont meestal een gebalanceerde hand.";
      }
      if (helpers.highestBid()?.strain === "NT") return "Na 1SA zoek je eerst een hoge-kleurfit: 2K Stayman met een vierkaart hoog, 2R/2H transfer met een vijfkaart hoog.";
      return "Als partner jouw kleur steunt, hebben jullie waarschijnlijk een fit.";
    }

    function playingHint() {
      const seat = helpers.seatAt(state.turnIndex);
      if (!actions.openingLeadHasBeenMade()) return "Dummy wordt pas zichtbaar na de uitkomst.";
      if (actions.isHumanControlledSeat(seat)) {
        if (state.currentTrick.length) {
          const leadSuit = state.currentTrick[0].card.suit;
          const canFollow = state.hands[seat].some((card) => card.suit === leadSuit);
          if (canFollow) return `Je moet ${helpers.suitName(leadSuit)} bekennen als je kunt.`;
          return "Je kunt niet bekennen; je mag afgooien of troeven.";
        }
        if (seat === state.declarer || seat === state.dummy) return "Als leider maak je eerst een plan: tel verliezers of vaste slagen voordat je speelt.";
        return "Als partner de slag al wint, is laag spelen vaak verstandig.";
      }
      if (state.currentTrick.length) return "De hoogste kaart in de gevraagde kleur wint, tenzij iemand troeft.";
      if (state.contract.strain !== "NT") return "Troef wint van elke andere kleur.";
      return "In sans-atout wint de hoogste kaart in de gevraagde kleur.";
    }

    function renderContract() {
      els.contract.classList.remove("has-contract-value");
      els.contract.innerHTML = "";
      if (state.finalScore?.passOut) {
        els.contract.textContent = helpers.t("passedOut");
        return;
      }
      if (!state.contract) {
        els.contract.textContent = state.phase === "bidding" ? helpers.t("auctionInProgress") : helpers.t("dealToStart");
        return;
      }
      els.contract.classList.add("has-contract-value");

      const primary = document.createElement("span");
      primary.className = "contract-primary";

      const bid = document.createElement("strong");
      bid.className = `contract-bid strain-${String(state.contract.strain || "").toLowerCase()}`;
      bid.setAttribute("aria-label", helpers.formatBid(state.contract));
      render.appendBidContent(bid, state.contract, "contract-strain-symbol");

      const declarer = document.createElement("span");
      declarer.className = "contract-declarer";
      declarer.textContent = `${helpers.t("by")} ${helpers.seatName(state.declarer)}`;

      primary.append(bid, declarer);
      els.contract.appendChild(primary);
    }

    function renderScoreline() {
      els.scoreline.innerHTML = "";

      const tricks = document.createElement("span");
      tricks.className = "scoreline-tricks";
      tricks.textContent = `Slagen: NZ ${state.tricks.NS} - OW ${state.tricks.EW}`;

      const vulnerability = document.createElement("span");
      vulnerability.className = "scoreline-vulnerability";
      vulnerability.textContent = `${helpers.t("vulnerability")}: ${helpers.vulnerabilityName()}`;

      els.scoreline.append(tricks, vulnerability);
    }

    function replayContractText() {
      if (state.finalScore?.passOut) return helpers.t("passedOut");
      if (!state.contract) return helpers.t("none");
      return `${helpers.formatBid(state.contract)} ${helpers.t("by")} ${helpers.seatName(state.declarer)}`;
    }

    function replayPanelSymbol() {
      if (!state.contract?.strain) return "B";
      return suitSymbols[state.contract.strain] || state.contract.strain;
    }

    function replayResultText() {
      if (state.finalScore?.passOut) return helpers.t("passOutResult");
      if (!state.finalScore || !state.contract) return helpers.t("none");
      const made = state.finalScore.made ?? state.finalScore.tricksMade;
      const needed = state.finalScore.needed ?? state.contract.level + 6;
      const suffix = made < needed ? ` (${needed - made} down)` : "";
      return `${made} ${made === 1 ? "slag" : "slagen"} gemaakt${suffix}`;
    }

    function replayScoreText(score = playerScoreValue()) {
      if (!Number.isFinite(score)) return helpers.t("none");
      if (!score) return "0 NZ";
      return `${score > 0 ? "+" : "-"}${Math.abs(score)} NZ`;
    }

    function playerScoreValue() {
      const score = state.finalScore;
      if (!score || score.passOut) return 0;
      return score.declarerTeam === "NS" ? score.score : -score.score;
    }

    function replayScoreExplanationText(playerScore = playerScoreValue()) {
      const score = state.finalScore;
      if (!score) return "";
      if (score.passOut || !state.contract) return "Waarom deze score? Rondpas: er is geen contract en Noord/Zuid scoort 0.";

      const contractText = helpers.formatBid(state.contract);
      const made = score.made ?? score.tricksMade;
      const needed = score.needed ?? state.contract.level + 6;
      const result = made >= needed
        ? `${made - needed ? `${made - needed} overslag${made - needed === 1 ? "" : "en"}` : "precies gemaakt"}`
        : `${needed - made} down`;
      const declaringTeam = score.declarerTeam === "NS" ? helpers.t("northSouth") : helpers.t("eastWest");

      if (score.contractMade) {
        return `Waarom deze score? ${contractText} vraagt ${needed} slagen. ${declaringTeam} haalde ${made}: ${result}. Contractpunten ${score.contractScore}, extra slagen ${score.overtrickScore} en bonus ${score.bonusScore} geven ${replayScoreText(playerScore)}.`;
      }

      return `Waarom deze score? ${contractText} vraagt ${needed} slagen. ${declaringTeam} haalde ${made}: ${result}. De downscore is ${score.undertrickPenalty} punten, dus dit is ${replayScoreText(playerScore)}.`;
    }

    function toggleReplayScoreExplanation(event) {
      event?.stopPropagation();
      if (!els.replayScoreExplanation || els.replayPanel.hidden) return;
      const open = els.replayScoreExplanation.hidden;
      els.replayScoreExplanation.hidden = !open;
      els.replayScoreHelp?.setAttribute("aria-expanded", String(open));
    }

    function dismissScoreOverview(event) {
      event?.stopPropagation();
      state.scoreOverviewDismissed = true;
      els.replayPanel.hidden = true;
    }

    function setStatus(key, args = {}) {
      state.status = { key, args };
      renderStatus();
    }

    function renderStatus() {
      els.status.textContent = helpers.t(state.status.key, helpers.localizeArgs(state.status.args));
      renderDummyNotice();
    }

    function renderDummyNotice() {
      els.dummyNotice.hidden = true;
      els.dummyNotice.textContent = "";
    }

    Object.assign(actions, {
      clearHandSuitFocus,
      clearHandSuitFocusFromOutsideClick,
      currentReviewPlayback,
      dismissScoreOverview,
      ensureReviewTrickCursor,
      focusHandSuit,
      isMobileLayout,
      jumpToTrickOverview,
      lockDealAnimationHands,
      moveReviewCursor: moveReviewTrickCursor,
      moveReviewTrickCursor,
      prefersReducedMotion,
      renderIllegalActionFeedback,
      renderTrickAdvanceHint,
      reviewPlayIsSelected,
      scrollBidExplanationIntoView,
      selectReviewPlayExplanation,
      selectReviewTrickNumber,
      setStatus,
      toggleReplayScoreExplanation,
      usesStableSidebarLayout
    });
    Object.assign(helpers, { formatCall, playerScoreValue, replayScoreText });
    Object.assign(render, {
      applyStaticText,
      renderAll,
      renderContract,
      renderDummyNotice,
      renderGuidance,
      renderIllegalActionFeedback,
      renderReplayPanel,
      renderResponsiveLayoutState,
      renderStatus,
      renderTrickAdvanceHint,
      renderTrickSlotFocus,
      renderTurnFocus
    });
  };
})(typeof globalThis !== "undefined" ? globalThis : this);

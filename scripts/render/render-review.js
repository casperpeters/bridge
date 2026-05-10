function renderHistory() {
  syncHistoryPanelState();
  els.history.innerHTML = "";
  if (!state.showPlayHistory) return;
  if (!shouldShowLiveHistory()) {
    const inactive = document.createElement("div");
    inactive.className = "history-item";
    inactive.textContent = t("historyEmpty");
    els.history.appendChild(inactive);
    return;
  }
  if (!state.trickHistory.length) {
    const empty = document.createElement("div");
    empty.className = "history-item";
    empty.textContent = t("historyEmpty");
    els.history.appendChild(empty);
    return;
  }
  els.history.appendChild(reviewTricksTable());
}

function renderPlayExplanations() {
  els.playExplanations.hidden = !state.showPlayHistory || !state.developerMode || !state.playExplanations.length || state.phase === "complete";
  els.playExplanations.innerHTML = "";
  if (els.playExplanations.hidden) return;
  els.playExplanations.appendChild(reviewSectionTitle(t("playExplanations")));
  [...state.playExplanations].reverse().forEach((explanation) => {
    els.playExplanations.appendChild(playExplanationEl(explanation));
  });
}

function playExplanationEl(explanation) {
  const item = document.createElement("div");
  item.className = "play-explanation";
  const title = document.createElement("strong");
  title.textContent = `${t("trick")} ${explanation.trick}: ${seatName(explanation.seat)} ${cardText(explanation.card)}`;
  item.append(title, document.createElement("br"), BridgeGlossary.linkifyText(explanation.text));
  return item;
}

function renderReview() {
  const complete = state.phase === "complete" && state.finalScore && (state.contract || state.finalScore.passOut);
  syncHistoryPanelState(complete);
  els.reviewPanel.hidden = !complete;
  if (!complete) return;

  const passOut = Boolean(state.finalScore.passOut);
  const openingPlay = state.trickHistory[0]?.cards[0] || null;
  const contractText = passOut ? t("passedOut") : `${formatBid(state.contract)} ${t("by")} ${seatName(state.declarer)}`;
  const resultText = passOut ? t("passOutResult") : t(state.status.args.resultKey, state.status.args.resultArgs || {});

  els.reviewResult.textContent = resultText;
  els.reviewSummary.innerHTML = "";
  els.reviewSummary.appendChild(reviewSectionTitle("Samenvatting"));
  [
    [t("finalContract"), contractText],
    [t("declarer"), passOut ? t("none") : seatName(state.declarer)],
    [t("dummy"), passOut ? t("none") : seatName(state.dummy)],
    [t("result"), resultText],
    [t("bridgeScore"), state.finalScore.scoreText],
    [t("vulnerability"), vulnerabilityName()],
    [t("openingLead"), openingPlay ? `${seatName(openingPlay.seat)} ${cardText(openingPlay.card)}` : t("none")]
  ].forEach(([label, value]) => els.reviewSummary.appendChild(reviewRow(label, value)));
  appendScoreExplanation(passOut, resultText);
  appendLessonFeedback(passOut, resultText);
  appendLessonPoints();
  els.reviewSummary.appendChild(reviewRow(t("board"), state.dealNumber));
  if (state.developerMode) {
    els.reviewSummary.appendChild(reviewRow(t("seed"), currentRepeatCode() || t("none")));
  }
  renderFeedbackStatus();
  if (state.playPlan) {
    els.reviewSummary.appendChild(reviewSectionTitle(t("playPlan")));
    els.reviewSummary.appendChild(reviewRow(t("playPlanGoal"), playPlanGoalText(state.playPlan)));
    playPlanMetricTexts(state.playPlan).forEach((metric) => {
      els.reviewSummary.appendChild(reviewRow(t("playPlan"), metric));
    });
    if (state.playPlan.priorities?.length) {
      els.reviewSummary.appendChild(playPlanList(t("playPlanPriorities"), state.playPlan.priorities.map(playPlanPriorityText)));
    }
    if (state.playPlan.warnings?.length) {
      els.reviewSummary.appendChild(playPlanList(t("playPlanWarnings"), state.playPlan.warnings.map(playPlanWarningText), "warning"));
    }
  }

  els.reviewTricks.innerHTML = "";
  els.reviewTricks.appendChild(reviewSectionTitle(t("trickOverview")));
  const selectedTrickNumber = ensureReviewTrickCursor();
  if (state.developerMode && state.trickHistory.length) {
    const hint = document.createElement("p");
    hint.className = "review-trick-keyboard-help";
    hint.textContent = t("reviewTrickKeyboardHelp");
    els.reviewTricks.appendChild(hint);
  }
  els.reviewTricks.appendChild(reviewTricksTable());
  if (state.developerMode && state.playExplanations.length) {
    els.reviewTricks.appendChild(reviewSectionTitle(t("playExplanations")));
    state.playExplanations.forEach((explanation) => {
      const explanationEl = playExplanationEl(explanation);
      if (explanation.trick === selectedTrickNumber) explanationEl.classList.add("is-review-selected");
      els.reviewTricks.appendChild(explanationEl);
    });
  }
}

function syncHistoryPanelState(complete = state.phase === "complete") {
  const hasVisiblePlayPlan = !els.playPlan.hidden;
  const visible = !complete && (shouldShowLiveHistory() || shouldReserveHistorySlot() || hasVisiblePlayPlan);
  els.historyPanel.hidden = !visible;
  els.historyPanel.classList.toggle("is-inactive", visible && !shouldShowLiveHistory());
  els.historyPanel.classList.toggle("is-empty-reserved", visible && !state.showPlayHistory && !hasVisiblePlayPlan);
}

function shouldShowLiveHistory() {
  return state.phase === "playing" && state.showPlayHistory;
}

function shouldReserveHistorySlot() {
  return typeof usesStableSidebarLayout === "function" && usesStableSidebarLayout() && state.phase !== "complete";
}

function appendLessonPoints() {
  if (!state.practice?.teachingPoints?.length) return;
  els.reviewSummary.appendChild(reviewSectionTitle(t("lessonPoints")));
  const list = document.createElement("ul");
  list.className = "lesson-points-list";
  state.practice.teachingPoints.forEach((point) => {
    const item = document.createElement("li");
    item.appendChild(BridgeGlossary.linkifyText(point));
    list.appendChild(item);
  });
  els.reviewSummary.appendChild(list);
}

function appendLessonFeedback(passOut, resultText) {
  if (!state.practice?.lessonId) return;
  const feedbackItems = lessonFeedbackItems(passOut, resultText);
  const bidItems = lessonAuctionFeedbackItems();
  if (!feedbackItems.length && !bidItems.length) return;

  els.reviewSummary.appendChild(reviewSectionTitle(t("lessonFeedback")));
  const panel = document.createElement("div");
  panel.className = "lesson-feedback-panel";

  if (feedbackItems.length) {
    const list = document.createElement("ul");
    list.className = "lesson-feedback-list";
    feedbackItems.forEach((text) => list.appendChild(lessonFeedbackItem(text)));
    panel.appendChild(list);
  }

  if (bidItems.length) {
    const title = document.createElement("strong");
    title.className = "lesson-feedback-subtitle";
    title.textContent = t("lessonBidFeedback");
    const list = document.createElement("ul");
    list.className = "lesson-feedback-list";
    bidItems.forEach((text) => list.appendChild(lessonFeedbackItem(text)));
    panel.append(title, list);
  }

  els.reviewSummary.appendChild(panel);
}

function lessonFeedbackItems(passOut, resultText) {
  const items = [];
  if (state.practice.lessonId === "les-01-wat-is-bridge") {
    const openingPlay = state.trickHistory[0]?.cards[0] || null;
    if (openingPlay) {
      items.push(`${seatName(openingPlay.seat)} kwam uit met ${cardText(openingPlay.card)}. Daarna verscheen ${seatName(state.dummy)} als dummy.`);
    }
    if (!passOut && state.contract) {
      items.push(`${seatName(state.declarer)} was leider in ${formatBid(state.contract)}. De leider speelt de eigen hand en dummy samen.`);
    }
    items.push(`Er zijn ${state.trickHistory.length} slagen gespeeld: Noord/Zuid won ${state.tricks.NS}, Oost/West won ${state.tricks.EW}.`);
    items.push(`Resultaat van dit bord: ${resultText}. Dat is nu vooral een meetlint; de les ging om het herkennen van het tafelritme.`);
  }
  return [...items, ...(state.practice.lessonReviewFeedback || [])];
}

function lessonAuctionFeedbackItems() {
  if (!state.practice?.lessonId || !state.auction.length) return [];
  return state.auction
    .map((call, index) => ({ call, index }))
    .filter(({ call }) => call.bidResult || isContractBid(call.bid))
    .slice(0, 4)
    .map(({ call, index }) => `${seatName(call.seat)} ${formatCall(call.bid)}: ${cleanLessonExplanation(explainBid(call, index))}`);
}

function lessonFeedbackItem(text) {
  const item = document.createElement("li");
  item.appendChild(BridgeGlossary.linkifyText(text));
  return item;
}

function cleanLessonExplanation(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .replace(/\s*zekerheid: [^.]+\.?/i, "")
    .trim();
}

function appendScoreExplanation(passOut, resultText) {
  els.reviewSummary.appendChild(reviewSectionTitle(t("scoreExplanation")));
  const rows = passOut ? passOutScoreExplanationRows() : contractScoreExplanationRows(resultText);
  rows.forEach(([label, value]) => els.reviewSummary.appendChild(reviewRow(label, value, "score-explanation-row")));
}

function passOutScoreExplanationRows() {
  return [
    [t("scoreContractGoal"), t("scorePassOutGoal")],
    [t("scoreTricksMade"), t("scorePassOutTricks")],
    [t("scoreFinal"), state.finalScore.scoreText]
  ];
}

function contractScoreExplanationRows(resultText) {
  const score = state.finalScore;
  const rows = [
    [t("scoreContractGoal"), contractGoalText(score)],
    [t("scoreTricksMade"), `${teamName(score.declarerTeam)} haalde ${score.tricksMade} ${trickWord(score.tricksMade)}: ${resultText}.`],
    [t("scoreVulnerabilityEffect"), vulnerabilityScoreText(score)]
  ];

  if (score.contractMade) {
    rows.push(
      [t("scoreContractPoints"), contractPointsText(score)],
      [t("scoreOvertricks"), overtricksText(score)],
      [t("scoreBonus"), bonusText(score)],
      [t("scoreFinal"), `${score.scoreText}: ${score.contractScore} contractpunten + ${score.overtrickScore} punten voor extra slagen + ${score.bonusScore} bonuspunten.`]
    );
    return rows;
  }

  rows.push(
    [t("scoreUndertricks"), `${score.undertricks} ${trickWord(score.undertricks)} te weinig geeft ${score.undertrickPenalty} strafpunten.`],
    [t("scoreFinal"), `${score.scoreText}: het leidersteam krijgt -${score.undertrickPenalty}; de tegenspelers scoren positief.`]
  );
  return rows;
}

function contractGoalText(score) {
  return `${formatBid(state.contract)} vraagt ${score.needed} ${trickWord(score.needed)}: altijd 6 basisslagen plus ${state.contract.level} voor het geboden niveau.`;
}

function vulnerabilityScoreText(score) {
  const team = teamName(score.declarerTeam);
  return score.vulnerable
    ? `${team} was kwetsbaar; manche-, slem- en downpunten zijn daardoor hoger.`
    : `${team} was niet kwetsbaar; bonussen en straffen blijven lager.`;
}

function contractPointsText(score) {
  const base = contractBaseText(state.contract);
  if (score.multiplier === 1) return `${base} = ${score.contractScore} punten.`;
  return `${base} = ${score.contractPoints}, ${multiplierText(score.multiplier)} x${score.multiplier}: ${score.contractScore} punten.`;
}

function contractBaseText(contract) {
  if (contract.strain === "C" || contract.strain === "D") return `${contract.level} x 20 voor ${suitName(contract.strain)}`;
  if (contract.strain === "H" || contract.strain === "S") return `${contract.level} x 30 voor ${suitName(contract.strain)}`;
  if (contract.level === 1) return "40 voor de eerste slag boven de basis in sans-atout";
  return `40 voor de eerste slag boven de basis in sans-atout + ${contract.level - 1} x 30`;
}

function multiplierText(multiplier) {
  return multiplier === 4 ? "geredoubleerd" : multiplier === 2 ? "gedoubleerd" : "ongedoubleerd";
}

function overtricksText(score) {
  if (!score.overtricks) return "Geen extra slagen boven het contract.";
  return `${score.overtricks} ${trickWord(score.overtricks)} meer dan nodig = ${score.overtrickScore} punten.`;
}

function bonusText(score) {
  const parts = [];
  if (score.partscoreBonus) parts.push(`klein-contractbonus +${score.partscoreBonus}`);
  if (score.gameBonus) parts.push(`manchebonus +${score.gameBonus}`);
  if (score.slamBonus) parts.push(`slembonus +${score.slamBonus}`);
  if (score.insultBonus) parts.push(`doublet/redoublet-bonus +${score.insultBonus}`);
  return parts.length ? `${parts.join(", ")} = ${score.bonusScore} punten.` : "Geen bonuspunten.";
}

function teamName(team) {
  return team === "NS" ? t("northSouth") : team === "EW" ? t("eastWest") : t("none");
}

function trickWord(count) {
  return count === 1 ? "slag" : "slagen";
}

function reviewSectionTitle(label) {
  const title = document.createElement("h3");
  title.className = "review-section-title";
  title.textContent = label;
  return title;
}

function reviewRow(label, value, className = "") {
  const row = document.createElement("div");
  row.className = "review-row";
  if (className) row.classList.add(className);
  const labelEl = document.createElement("strong");
  const valueEl = document.createElement("span");
  labelEl.textContent = label;
  valueEl.appendChild(BridgeGlossary.linkifyText(String(value)));
  row.append(labelEl, valueEl);
  return row;
}

function reviewTricksTable() {
  const wrapper = document.createElement("div");
  wrapper.className = "review-trick-table-wrap review-trick-overview";

  const table = document.createElement("table");
  table.className = "review-trick-table";
  table.setAttribute("aria-label", t("trickOverview"));

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  const numberHeader = document.createElement("th");
  numberHeader.scope = "col";
  numberHeader.className = "review-trick-number";
  numberHeader.textContent = t("trick");
  headerRow.appendChild(numberHeader);
  seats.forEach((seat) => {
    const header = document.createElement("th");
    header.scope = "col";
    header.textContent = seatName(seat);
    headerRow.appendChild(header);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  const selectedTrickNumber = state.phase === "complete" ? ensureReviewTrickCursor() : null;
  state.trickHistory.forEach((trick) => {
    const row = document.createElement("tr");
    row.className = "review-trick-row";
    row.dataset.reviewTrick = String(trick.number);
    if (trick.number === selectedTrickNumber) {
      row.classList.add("is-review-selected");
      row.setAttribute("aria-current", "true");
    }
    const numberCell = document.createElement("th");
    numberCell.scope = "row";
    numberCell.className = "review-trick-number";
    numberCell.textContent = trick.number;
    row.appendChild(numberCell);

    const leader = trick.cards[0]?.seat;
    const playsBySeat = new Map(trick.cards.map((play) => [play.seat, play]));
    seats.forEach((seat) => row.appendChild(reviewTrickCell(playsBySeat.get(seat), seat, leader, trick.winner)));
    tbody.appendChild(row);
  });
  table.appendChild(tbody);
  wrapper.appendChild(table);
  wrapper.appendChild(reviewTrickLegend());
  return wrapper;
}

function reviewTrickCell(play, seat, leader, winner) {
  const cell = document.createElement("td");
  cell.className = "review-trick-cell";
  if (seat === leader) cell.classList.add("is-leader");
  if (seat === winner) {
    cell.classList.add("is-winner", teamOf(seat) === "NS" ? "winner-ns" : "winner-ew");
  }

  if (play) {
    const card = document.createElement("span");
    card.className = "review-card-pill";
    if (play.card.suit === "D" || play.card.suit === "H") card.classList.add("red");
    card.textContent = cardText(play.card);
    cell.appendChild(card);
  } else {
    cell.textContent = "-";
  }

  const labelParts = [];
  if (play) labelParts.push(`${seatName(seat)} speelde ${cardText(play.card)}`);
  if (seat === leader) labelParts.push(`${seatName(seat)} kwam uit`);
  if (seat === winner) labelParts.push(`${seatName(seat)} won de slag`);
  cell.setAttribute("aria-label", labelParts.join(". "));
  return cell;
}

function reviewTrickLegend() {
  const legend = document.createElement("div");
  legend.className = "review-trick-legend";
  [
    ["lead", t("trickLegendLead")],
    ["winner-ns", t("trickLegendNSWin")],
    ["winner-ew", t("trickLegendEWWin")]
  ].forEach(([className, label]) => {
    const item = document.createElement("span");
    item.className = "review-trick-legend-item";
    const swatch = document.createElement("span");
    swatch.className = `review-trick-swatch ${className}`;
    swatch.setAttribute("aria-hidden", "true");
    item.append(swatch, document.createTextNode(label));
    legend.appendChild(item);
  });
  return legend;
}

async function copyFeedbackReport() {
  try {
    await copyText(buildFeedbackReport());
    state.feedbackStatus = t("feedbackCopied");
  } catch {
    state.feedbackStatus = t("feedbackCopyFailed");
  }
  renderFeedbackStatus();
}

async function submitFeedbackReport(event) {
  event?.preventDefault();
  const endpoint = feedbackSubmitEndpoint();
  if (!endpoint) {
    state.feedbackStatus = t("feedbackSubmitMissingEndpoint");
    renderFeedbackStatus();
    return;
  }

  setFeedbackSubmitting(true);
  state.feedbackStatus = t("feedbackSubmitSending");
  renderFeedbackStatus();

  try {
    await sendFeedbackReport(endpoint, buildFeedbackPayload());
    state.feedbackStatus = t("feedbackSubmitSent");
  } catch {
    state.feedbackStatus = t("feedbackSubmitFailed");
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
  els.mailFeedback.textContent = isSubmitting ? t("feedbackSubmitting") : t("mailFeedback");
}

async function sendFeedbackReport(endpoint, payload) {
  await fetch(endpoint, {
    method: "POST",
    mode: "no-cors",
    body: JSON.stringify(payload)
  });
}

function buildFeedbackPayload() {
  const feedbackTypes = t("feedbackTypes");
  const type = els.feedbackType.value;
  const typeLabel = feedbackTypes[type] || type;
  const repeatCode = currentRepeatCode() || "";
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
    vulnerabilityLabel: vulnerabilityName(),
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
  const feedbackTypes = t("feedbackTypes");
  const type = feedbackTypes[els.feedbackType.value] || els.feedbackType.value;
  const answers = currentFeedbackAnswers();
  const answerLines = [
    answers.primaryLabel,
    answers.primary || t("feedbackNoMessage")
  ];
  if (answers.secondaryLabel) {
    answerLines.push("", answers.secondaryLabel, answers.secondary || t("feedbackAnswerMissing"));
  }
  return [
    "## Feedback",
    "",
    `Type: ${type}`,
    ...answerLines,
    "",
    `${t("feedbackSituationSeed")}: ${currentRepeatCode() || t("none")}`
  ].join("\n").trimEnd();
}

function currentFeedbackAnswers() {
  const prompts = t("feedbackPrompts") || {};
  const prompt = prompts[els.feedbackType.value] || prompts.confusion || {};
  const primaryLabel = prompt.primaryLabel || t("feedbackMessageLabel");
  const secondaryLabel = prompt.secondaryLabel || "";
  const primary = els.feedbackMessage.value.trim();
  const secondary = secondaryLabel ? els.feedbackDetail.value.trim() : "";
  const message = secondaryLabel
    ? [
        `${primaryLabel} ${primary || t("feedbackNoMessage")}`,
        `${secondaryLabel} ${secondary || t("feedbackAnswerMissing")}`
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
  if (state.finalScore?.passOut) return t("passedOut");
  if (!state.contract) return "";
  return `${formatBid(state.contract)} ${t("by")} ${seatName(state.declarer)}`;
}

function phaseName(phase) {
  return {
    idle: "Start",
    bidding: "Bieden",
    "contract-reveal": "Contract tonen",
    playing: "Spelen",
    complete: t("review")
  }[phase] || phase;
}

function currentFeedbackTurnSeat() {
  if (!["bidding", "contract-reveal", "playing"].includes(state.phase)) return "";
  return seatAt(state.turnIndex);
}

function feedbackDummyVisibility() {
  if (!state.contract || !state.dummy) return "N.v.t.";
  if (state.phase === "complete") return "Ja";
  if (state.phase === "contract-reveal") return "Nee";
  if (state.phase !== "playing") return "N.v.t.";
  return openingLeadHasBeenMade() ? "Ja" : "Nee";
}

function currentFeedbackStartMode() {
  if (state.practice?.lessonStartMode === "play") return "direct-play";
  if (state.practice?.lessonStartMode) return String(state.practice.lessonStartMode);
  if (state.phase === "playing" && state.contract && !state.auction.length) return "direct-play";
  if (state.phase === "bidding" || state.phase === "contract-reveal") return "auction";
  return "";
}

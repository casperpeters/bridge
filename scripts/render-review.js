function renderHistory() {
  els.history.innerHTML = "";
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
  els.playExplanations.hidden = !state.developerMode || !state.playExplanations.length || state.phase === "complete";
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
  els.historyPanel.hidden = complete || !state.showPlayHistory;
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
  [
    [t("board"), state.dealNumber],
    [t("seed"), state.dealSeed || t("none")]
  ].forEach(([label, value]) => els.reviewSummary.appendChild(reviewRow(label, value)));
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
  wrapper.className = "review-trick-table-wrap";

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

function formatHand(hand) {
  return handSuitOrder
    .map((suit) => `${suitSymbols[suit]} ${formatSuitHolding(hand, suit)}`)
    .join("  ");
}

function formatSuitHolding(hand, suit) {
  const cards = hand
    .filter((card) => card.suit === suit)
    .sort((a, b) => rankOrder.indexOf(b.rank) - rankOrder.indexOf(a.rank))
    .map((card) => rankLabel[card.rank] || card.rank);
  return cards.length ? cards.join("") : "-";
}

const feedbackMailRecipient = "casper.peters@gmail.com";
const mailtoUrlLengthLimit = 1800;

async function copyFeedbackReport() {
  try {
    await copyText(buildFeedbackReport());
    state.feedbackStatus = t("feedbackCopied");
  } catch {
    state.feedbackStatus = t("feedbackCopyFailed");
  }
  renderFeedbackStatus();
}

function mailFeedbackReport(event) {
  event?.preventDefault();
  try {
    const url = buildFeedbackMailtoUrl();
    openFeedbackMailClient(url);
    state.feedbackStatus = t("feedbackMailOpening");
  } catch {
    state.feedbackStatus = t("feedbackMailFailed");
  }
  renderFeedbackStatus();
}

function refreshFeedbackMailLink() {
  if (!els.mailFeedback) return;
  els.mailFeedback.dataset.mailto = buildFeedbackMailtoUrl();
}

function buildFeedbackMailtoUrl() {
  const subject = `Bridgetafel feedback - bord ${state.dealNumber || "-"} - ${phaseName(state.phase)}`;
  const fullReport = buildFeedbackReport();
  const fullUrl = mailtoUrl(subject, fullReport);
  if (fullUrl.length <= mailtoUrlLengthLimit) return fullUrl;
  return mailtoUrl(subject, buildCompactFeedbackReport());
}

function mailtoUrl(subject, body) {
  return `mailto:${feedbackMailRecipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function openFeedbackMailClient(url) {
  const link = document.createElement("a");
  link.href = url;
  link.style.display = "none";
  document.body.append(link);
  link.click();
  link.remove();
}

function renderFeedbackStatus() {
  els.feedbackState.textContent = state.feedbackStatus || "";
}

function buildFeedbackReport() {
  const feedbackTypes = t("feedbackTypes");
  const type = feedbackTypes[els.feedbackType.value] || els.feedbackType.value;
  const message = els.feedbackMessage.value.trim() || t("feedbackNoMessage");
  const lines = [
    "## Feedback",
    "",
    `Type: ${type}`,
    "Bericht:",
    message,
    ""
  ];

  if (els.feedbackIncludeContext.checked) {
    lines.push(...feedbackContextLines());
  }

  return lines.join("\n").trimEnd();
}

function buildCompactFeedbackReport() {
  const feedbackTypes = t("feedbackTypes");
  const type = feedbackTypes[els.feedbackType.value] || els.feedbackType.value;
  const message = els.feedbackMessage.value.trim() || t("feedbackNoMessage");
  return [
    "## Feedback",
    "",
    `Type: ${type}`,
    "Bericht:",
    message,
    "",
    "## Handcontext",
    "",
    `Seed: ${state.dealSeed || t("none")}`,
    `${t("feedbackSituationSeed")}: ${createSituationSeed() || t("none")}`,
    `${t("board")}: ${state.dealNumber || t("none")}`,
    ...feedbackPracticeContextLines(),
    `${t("dealer")}: ${seatName(seatAt(state.dealerIndex))}`,
    `${t("vulnerability")}: ${vulnerabilityName()}`,
    `${t("feedbackPhase")}: ${phaseName(state.phase)}`,
    `${t("feedbackCurrentTurn")}: ${state.phase === "complete" ? t("none") : seatName(seatAt(state.turnIndex))}`,
    `${t("finalContract")}: ${feedbackContractText()}`,
    `${t("result")}: ${feedbackResultText()}`,
    `${t("bridgeScore")}: ${state.finalScore?.scoreText || t("none")}`,
    `${t("auction")}: ${feedbackAuctionInline()}`,
    `${t("trickOverview")}: ${feedbackTrickSummary()}`,
    "",
    t("feedbackMailContextTooLong")
  ].join("\n").trimEnd();
}

function feedbackContextLines() {
  const lines = [
    "## Handcontext",
    "",
    `Seed: ${state.dealSeed || t("none")}`,
    `${t("feedbackSituationSeed")}: ${createSituationSeed() || t("none")}`,
    `${t("board")}: ${state.dealNumber || t("none")}`,
    ...feedbackPracticeContextLines(),
    `${t("dealer")}: ${seatName(seatAt(state.dealerIndex))}`,
    `${t("vulnerability")}: ${vulnerabilityName()}`,
    `${t("feedbackPhase")}: ${phaseName(state.phase)}`,
    `${t("feedbackCurrentTurn")}: ${state.phase === "complete" ? t("none") : seatName(seatAt(state.turnIndex))}`,
    `${t("finalContract")}: ${feedbackContractText()}`,
    `${t("declarer")}: ${state.declarer ? seatName(state.declarer) : t("none")}`,
    `${t("dummy")}: ${state.dummy ? seatName(state.dummy) : t("none")}`,
    `${t("result")}: ${feedbackResultText()}`,
    `${t("bridgeScore")}: ${state.finalScore?.scoreText || t("none")}`,
    "",
    `## ${t("auction")}`,
    "",
    ...feedbackAuctionLines(),
    "",
    `## ${t("trickOverview")}`,
    "",
    ...feedbackTrickLines(),
    "",
    `## ${t("feedbackCurrentTrick")}`,
    "",
    feedbackCurrentTrickLine(),
    "",
    `## ${t("feedbackOriginalHands")}`,
    "",
    ...feedbackHandLines(),
    "",
    `## ${t("feedbackSettings")}`,
    "",
    `AI-suggesties: ${onOff(state.guidanceMode)}`,
    `Developermodus: ${onOff(state.developerMode)}`,
    `Speelgeschiedenis: ${onOff(state.showPlayHistory)}`,
    `Browser: ${navigator.userAgent || t("none")}`
  ];

  if (state.playPlan) {
    lines.push("", `## ${t("playPlan")}`, "", ...feedbackPlayPlanLines());
  }

  return lines;
}

function feedbackPracticeContextLines() {
  if (!state.practice) return [];
  const lines = [`Oefenhand: ${state.practice.title} (${state.practice.id})`];
  if (state.practice.testGoal) lines.push(`Testdoel: ${state.practice.testGoal}`);
  return lines;
}

function feedbackContractText() {
  if (state.finalScore?.passOut) return t("passedOut");
  if (state.contract && state.declarer) return `${formatBid(state.contract)} ${t("by")} ${seatName(state.declarer)}`;
  if (state.contract) return formatBid(state.contract);
  return t("none");
}

function feedbackResultText() {
  if (state.finalScore?.passOut) return t("passOutResult");
  if (!state.finalScore || !state.contract) return t("none");
  const needed = state.contract.level + 6;
  return state.finalScore.made >= needed
    ? t("made", { over: state.finalScore.made - needed })
    : t("down", { under: needed - state.finalScore.made });
}

function feedbackAuctionLines() {
  if (!state.auction.length) return [`- ${t("none")}`];
  return state.auction.map((call) => {
    const markers = [];
    if (call.stop) markers.push(t("stop"));
    if (call.alert) markers.push(t("alert"));
    const markerText = markers.length ? ` (${markers.join(", ")})` : "";
    return `- ${seatName(call.seat)}: ${formatCall(call.bid)}${markerText}`;
  });
}

function feedbackTrickLines() {
  if (!state.trickHistory.length) return [`- ${t("none")}`];
  return state.trickHistory.map((trick) => {
    const cards = trick.cards.map((play) => `${seatName(play.seat)} ${cardText(play.card)}`).join(", ");
    return `- ${t("trick")} ${trick.number}: ${cards}. ${t("feedbackWinner")}: ${seatName(trick.winner)}.`;
  });
}

function feedbackCurrentTrickLine() {
  if (!state.currentTrick.length) return `- ${t("none")}`;
  return `- ${state.currentTrick.map((play) => `${seatName(play.seat)} ${cardText(play.card)}`).join(", ")}`;
}

function feedbackAuctionInline() {
  if (!state.auction.length) return t("none");
  return state.auction.map((call) => `${seatName(call.seat)} ${formatCall(call.bid)}`).join(" | ");
}

function feedbackTrickSummary() {
  if (!state.trickHistory.length) return t("none");
  return state.trickHistory.map((trick) => `${trick.number}:${seatName(trick.winner)}`).join(", ");
}

function feedbackHandLines() {
  return seats.map((seat) => `- ${seatName(seat)}: ${formatHand(state.originalHands[seat] || [])}`);
}

function feedbackPlayPlanLines() {
  const lines = [`${t("playPlanGoal")}: ${playPlanGoalText(state.playPlan)}`];
  playPlanMetricTexts(state.playPlan).forEach((metric) => lines.push(`- ${metric}`));
  (state.playPlan.priorities || []).forEach((priority) => lines.push(`- ${playPlanPriorityText(priority)}`));
  (state.playPlan.warnings || []).forEach((warning) => lines.push(`- Let op: ${playPlanWarningText(warning)}`));
  return lines;
}

function phaseName(phase) {
  return {
    idle: "Start",
    bidding: "Bieden",
    playing: "Spelen",
    complete: t("review")
  }[phase] || phase;
}

function onOff(value) {
  return value ? "aan" : "uit";
}

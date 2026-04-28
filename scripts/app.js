const seats = ["North", "East", "South", "West"];
const handSuitOrder = ["S", "H", "C", "D"];
const biddingBoxStrains = ["NT", "S", "H", "D", "C"];
const suitSymbols = { C: "\u2663", D: "\u2666", H: "\u2665", S: "\u2660", NT: "NT" };
const separatorDot = "\u00b7";
const roleSeparator = "\u2022";
const rankOrder = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"];
const rankLabel = { T: "10", J: "J", Q: "Q", K: "K", A: "A" };
const settingsStorageKey = "bridge-app-settings";
const bridgeRules = globalThis.BridgeRules;
if (!bridgeRules) throw new Error("bridge-rules.js must load before app.js");
const seatEls = {
  North: document.querySelector("#north-hand"),
  East: document.querySelector("#east-hand"),
  South: document.querySelector("#south-hand"),
  West: document.querySelector("#west-hand")
};
const slotEls = {
  North: document.querySelector(".trick-north"),
  East: document.querySelector(".trick-east"),
  South: document.querySelector(".trick-south"),
  West: document.querySelector(".trick-west")
};

const state = {
  hands: {},
  phase: "idle",
  dealerIndex: 0,
  turnIndex: 0,
  auction: [],
  contract: null,
  declarer: null,
  dummy: null,
  leader: null,
  currentTrick: [],
  awaitingTrickAdvance: false,
  trickAdvanceArmed: false,
  pendingTrickWinner: null,
  tricks: { NS: 0, EW: 0 },
  trickHistory: [],
  playExplanations: [],
  playPlan: null,
  playPlanKey: null,
  originalHands: {},
  dealNumber: 0,
  vulnerability: "none",
  animateDeal: false,
  developerMode: false,
  guidanceMode: false,
  showPlayHistory: false,
  showAdvancedBidControls: false,
  pendingStop: false,
  pendingAlert: false,
  status: { key: "chooseAndDeal", args: {} },
  finalScore: null,
  dealSeed: null,
  seedMessage: null,
  feedbackStatus: null,
  illegalActionFeedback: null
};

let illegalActionFeedbackTimer = null;

const els = {
  title: document.querySelector("#app-title"),
  heading: document.querySelector("#app-heading"),
  playMode: document.querySelector("#play-mode"),
  appMenu: document.querySelector(".app-menu"),
  settingsSummary: document.querySelector("#settings-summary"),
  developerOnlyMenuSections: document.querySelectorAll("[data-developer-only]"),
  developerMode: document.querySelector("#developer-mode"),
  developerModeLabel: document.querySelector("#developer-mode-label"),
  developerModeDescription: document.querySelector("#developer-mode-description"),
  guidanceMode: document.querySelector("#guidance-mode"),
  guidanceModeLabel: document.querySelector("#guidance-mode-label"),
  guidanceModeDescription: document.querySelector("#guidance-mode-description"),
  playHistoryMode: document.querySelector("#play-history-mode"),
  playHistoryModeLabel: document.querySelector("#play-history-mode-label"),
  playHistoryModeDescription: document.querySelector("#play-history-mode-description"),
  hintButton: document.querySelector("#hint-button"),
  openFeedback: document.querySelector("#open-feedback"),
  openGlossary: document.querySelector("#open-glossary"),
  glossaryDialog: document.querySelector("#glossary-dialog"),
  closeGlossary: document.querySelector("#close-glossary"),
  glossaryTitle: document.querySelector("#glossary-title"),
  glossarySearch: document.querySelector("#glossary-search"),
  glossaryList: document.querySelector("#glossary-list"),
  glossaryTerm: document.querySelector("#glossary-term"),
  glossaryDefinition: document.querySelector("#glossary-definition"),
  openScoreTable: document.querySelector("#open-score-table"),
  scoreTableDialog: document.querySelector("#score-table-dialog"),
  closeScoreTable: document.querySelector("#close-score-table"),
  newHand: document.querySelector("#new-hand"),
  sameHand: document.querySelector("#same-hand"),
  quickReview: document.querySelector("#quick-review"),
  seedLabel: document.querySelector("#seed-label"),
  seedInput: document.querySelector("#seed-input"),
  loadSeed: document.querySelector("#load-seed"),
  copySeed: document.querySelector("#copy-seed"),
  seedDescription: document.querySelector("#seed-description"),
  tableArea: document.querySelector(".table-area"),
  northLabel: document.querySelector("#north-label"),
  eastLabel: document.querySelector("#east-label"),
  southLabel: document.querySelector("#south-label"),
  westLabel: document.querySelector("#west-label"),
  biddingTitle: document.querySelector("#bidding-title"),
  historyPanel: document.querySelector("#history-panel"),
  historyTitle: document.querySelector("#history-title"),
  reviewPanel: document.querySelector("#review-panel"),
  reviewTitle: document.querySelector("#review-title"),
  reviewResult: document.querySelector("#review-result"),
  reviewSummary: document.querySelector("#review-summary"),
  reviewTricks: document.querySelector("#review-tricks"),
  feedbackDialog: document.querySelector("#feedback-dialog"),
  feedbackTitle: document.querySelector("#feedback-title"),
  feedbackState: document.querySelector("#feedback-state"),
  feedbackTypeLabel: document.querySelector("#feedback-type-label"),
  feedbackType: document.querySelector("#feedback-type"),
  feedbackMessageLabel: document.querySelector("#feedback-message-label"),
  feedbackMessage: document.querySelector("#feedback-message"),
  feedbackIncludeContext: document.querySelector("#feedback-include-context"),
  feedbackContextLabel: document.querySelector("#feedback-context-label"),
  copyFeedback: document.querySelector("#copy-feedback"),
  mailFeedback: document.querySelector("#mail-feedback"),
  closeFeedback: document.querySelector("#close-feedback"),
  feedbackDescription: document.querySelector("#feedback-description"),
  bidControls: document.querySelector("#bid-controls"),
  bidExplanations: document.querySelector("#bid-explanations"),
  playPlan: document.querySelector("#play-plan-panel"),
  playExplanations: document.querySelector("#play-explanations"),
  auctionLog: document.querySelector("#auction-log"),
  dealerBadge: document.querySelector("#dealer-badge"),
  contract: document.querySelector("#contract"),
  status: document.querySelector("#status"),
  guidancePanel: document.querySelector("#guidance-panel"),
  dummyNotice: document.querySelector("#dummy-notice"),
  tableFeedback: document.querySelector("#table-feedback"),
  trickAdvanceHint: document.querySelector("#trick-advance-hint"),
  scoreline: document.querySelector("#scoreline"),
  history: document.querySelector("#history"),
  trickCount: document.querySelector("#trick-count")
};

loadSavedSettings();

els.newHand.addEventListener("click", startHand);
els.sameHand.addEventListener("click", replayHand);
els.quickReview.addEventListener("click", jumpToTrickOverview);
BridgeGlossary.init({
  dialog: els.glossaryDialog,
  openButton: els.openGlossary,
  closeButton: els.closeGlossary,
  searchInput: els.glossarySearch,
  list: els.glossaryList,
  term: els.glossaryTerm,
  definition: els.glossaryDefinition
});
els.openScoreTable.addEventListener("click", openScoreTableDialog);
els.closeScoreTable.addEventListener("click", closeScoreTableDialog);
els.loadSeed.addEventListener("click", loadSeedFromInput);
els.copySeed.addEventListener("click", copyCurrentSeed);
els.openFeedback.addEventListener("click", openFeedbackDialog);
els.closeFeedback.addEventListener("click", closeFeedbackDialog);
els.copyFeedback.addEventListener("click", copyFeedbackReport);
els.mailFeedback.addEventListener("click", mailFeedbackReport);
els.feedbackType.addEventListener("change", refreshFeedbackMailLink);
els.feedbackMessage.addEventListener("input", refreshFeedbackMailLink);
els.feedbackIncludeContext.addEventListener("change", refreshFeedbackMailLink);
els.feedbackDialog.addEventListener("click", (event) => {
  if (event.target === els.feedbackDialog) closeFeedbackDialog();
});
els.appMenu?.querySelector(".menu-actions")?.addEventListener("click", (event) => {
  if (event.target.closest("button")) els.appMenu.removeAttribute("open");
});
els.scoreTableDialog.addEventListener("click", (event) => {
  if (event.target === els.scoreTableDialog) closeScoreTableDialog();
});
document.documentElement.lang = "nl";
els.developerMode.addEventListener("change", () => {
  state.developerMode = els.developerMode.checked;
  saveSettings();
  renderAll();
});
els.guidanceMode.addEventListener("change", () => {
  state.guidanceMode = els.guidanceMode.checked;
  saveSettings();
  renderAll();
});
els.playHistoryMode.addEventListener("change", () => {
  state.showPlayHistory = els.playHistoryMode.checked;
  saveSettings();
  renderAll();
});
els.tableArea.addEventListener("click", () => {
  if (state.awaitingTrickAdvance && state.trickAdvanceArmed) advanceCompletedTrick();
});
document.addEventListener("keydown", (event) => {
  if (isControlTarget(event.target)) return;
  if (event.key === "Enter" && state.awaitingTrickAdvance && state.trickAdvanceArmed) {
    event.preventDefault();
    advanceCompletedTrick();
  }
});

function isControlTarget(target) {
  return target?.closest?.("a, button, input, select, textarea, summary, details");
}

function startHand({ replay = false, seed = null, preserveBoard = false, skipFlow = false } = {}) {
  const reuseCurrentDeal = replay && state.dealSeed && state.dealNumber > 0;
  const loadedSeed = normalizeSeed(seed);
  if (!reuseCurrentDeal) {
    if (!preserveBoard || state.dealNumber === 0) state.dealNumber += 1;
    state.dealSeed = loadedSeed || createDealSeed();
  }
  state.dealerIndex = dealerIndexForDeal(state.dealNumber);
  state.vulnerability = vulnerabilityForDeal(state.dealNumber);
  state.hands = dealHands(state.dealSeed);
  state.originalHands = cloneHands(state.hands);
  state.phase = "bidding";
  state.turnIndex = state.dealerIndex;
  state.auction = [];
  state.contract = null;
  state.declarer = null;
  state.dummy = null;
  state.leader = null;
  state.currentTrick = [];
  state.awaitingTrickAdvance = false;
  state.trickAdvanceArmed = false;
  state.pendingTrickWinner = null;
  state.tricks = { NS: 0, EW: 0 };
  state.trickHistory = [];
  state.playExplanations = [];
  state.playPlan = null;
  state.playPlanKey = null;
  state.animateDeal = true;
  state.finalScore = null;
  state.feedbackStatus = null;
  state.illegalActionFeedback = null;
  if (illegalActionFeedbackTimer) {
    window.clearTimeout(illegalActionFeedbackTimer);
    illegalActionFeedbackTimer = null;
  }
  state.pendingStop = false;
  state.pendingAlert = false;
  if (!loadedSeed) state.seedMessage = null;
  clearTrickSlots();
  if (skipFlow) {
    state.animateDeal = false;
    setStatus("opensAuction", { seat: seatAt(state.turnIndex) });
    return;
  }
  renderAll();
  state.animateDeal = false;
  setStatus("opensAuction", { seat: seatAt(state.turnIndex) });
  continueAuction();
}

function replayHand() {
  startHand({ replay: true });
}

function jumpToTrickOverview() {
  for (let attempt = 0; attempt < 12; attempt++) {
    startHand({ skipFlow: true });
    autoCompleteAuction();
    if (state.phase !== "playing") continue;
    autoCompletePlay();
    break;
  }
  renderAll();
  window.setTimeout(scrollReviewToTricks, 0);
}

function scrollReviewToTricks() {
  if (!els.reviewTricks || els.reviewPanel.hidden) return;
  els.reviewPanel.scrollTop = Math.max(0, els.reviewTricks.offsetTop - els.reviewPanel.offsetTop);
}

function dealHands(seed = state.dealSeed) {
  return bridgeRules.dealHands(bridgeRules.randomFromSeed(seed));
}

function cloneHands(hands) {
  return Object.fromEntries(seats.map((seat) => [seat, hands[seat].map((card) => ({ ...card }))]));
}

function vulnerabilityForDeal(dealNumber) {
  return bridgeRules.vulnerabilityForDeal(dealNumber);
}

function dealerIndexForDeal(dealNumber) {
  return bridgeRules.dealerIndexForDeal(dealNumber);
}

function vulnerabilityName(vulnerability = state.vulnerability) {
  return {
    none: t("vulnerabilityNone"),
    NS: t("vulnerabilityNS"),
    EW: t("vulnerabilityEW"),
    both: t("vulnerabilityBoth")
  }[vulnerability];
}

function isTeamVulnerable(team, vulnerability = state.vulnerability) {
  return bridgeRules.isTeamVulnerable(team, vulnerability);
}

function compareCards(a, b) {
  return bridgeRules.compareCards(a, b);
}

function renderAll() {
  applyStaticText();
  renderTurnFocus();
  renderTrickSlotFocus();
  renderHands();
  renderAuction();
  renderBidControls();
  renderPlayPlan();
  renderHistory();
  renderPlayExplanations();
  renderReview();
  renderContract();
  renderGuidance();
  renderFeedbackStatus();
  renderIllegalActionFeedback();
  els.dealerBadge.textContent = `${t("board")} ${state.dealNumber} ${separatorDot} ${t("dealer")}: ${seatName(seatAt(state.dealerIndex))}`;
  els.trickCount.textContent = `${state.tricks.NS + state.tricks.EW} ${t("tricks")}`;
  els.scoreline.textContent = state.finalScore
    ? `${t("bridgeScore")} ${state.finalScore.scoreText} ${separatorDot} ${t("vulnerability")}: ${vulnerabilityName()}`
    : `${t("northSouth")} ${state.tricks.NS} ${separatorDot} ${t("eastWest")} ${state.tricks.EW} ${separatorDot} ${t("vulnerability")}: ${vulnerabilityName()}`;
  renderHint();
  renderTrickAdvanceHint();
  renderSeedControls();
  renderStatus();
}

function renderTurnFocus() {
  const focusClasses = seats.map((seat) => `turn-focus-${seat.toLowerCase()}`);
  els.tableArea.classList.remove(...focusClasses);
  if (state.phase !== "playing" || state.awaitingTrickAdvance) return;
  els.tableArea.classList.add(`turn-focus-${seatAt(state.turnIndex).toLowerCase()}`);
}

function renderTrickSlotFocus() {
  Object.values(slotEls).forEach((slot) => {
    slot.classList.remove("active-trick-slot", "pending-trick-winner");
  });
  if (state.phase === "playing" && state.awaitingTrickAdvance && state.pendingTrickWinner) {
    slotEls[state.pendingTrickWinner]?.classList.add("pending-trick-winner");
    return;
  }
  if (state.phase !== "playing" || state.awaitingTrickAdvance) return;
  slotEls[seatAt(state.turnIndex)]?.classList.add("active-trick-slot");
}

function applyStaticText() {
  document.title = t("title");
  els.title.textContent = t("title");
  els.heading.textContent = t("heading");
  if (els.playMode) els.playMode.textContent = t("playMode");
  els.settingsSummary.setAttribute("aria-label", "Menu");
  els.settingsSummary.title = "Menu";
  els.openFeedback.textContent = t("openFeedback");
  els.openGlossary.textContent = t("openGlossary");
  els.openScoreTable.textContent = t("openScoreTable");
  els.developerModeLabel.textContent = t("developerMode");
  els.developerMode.checked = state.developerMode;
  els.developerModeDescription.textContent = t("developerModeHelp");
  els.guidanceModeLabel.textContent = t("guidanceMode");
  els.guidanceMode.checked = state.guidanceMode;
  els.guidanceModeDescription.textContent = t("guidanceModeHelp");
  els.playHistoryModeLabel.textContent = t("playHistoryMode");
  els.playHistoryMode.checked = state.showPlayHistory;
  els.playHistoryModeDescription.textContent = t("playHistoryModeHelp");
  els.newHand.textContent = t("newHand");
  els.sameHand.textContent = t("sameHand");
  els.quickReview.textContent = t("quickReview");
  els.developerOnlyMenuSections.forEach((section) => {
    section.hidden = !state.developerMode;
  });
  els.seedLabel.textContent = t("seed");
  els.loadSeed.textContent = t("loadSeed");
  els.copySeed.textContent = t("copySeed");
  els.northLabel.textContent = `${seatName("North")} ${roleSeparator} ${t("partner")}`;
  els.eastLabel.textContent = seatName("East");
  els.southLabel.textContent = `${seatName("South")} ${roleSeparator} ${t("you")}`;
  els.westLabel.textContent = seatName("West");
  els.biddingTitle.textContent = t("bidding");
  els.historyTitle.textContent = t("history");
  els.reviewTitle.textContent = t("review");
  els.feedbackTitle.textContent = t("feedbackTitle");
  els.feedbackTypeLabel.textContent = t("feedbackTypeLabel");
  els.feedbackMessageLabel.textContent = t("feedbackMessageLabel");
  els.feedbackMessage.placeholder = t("feedbackMessagePlaceholder");
  els.feedbackContextLabel.textContent = t("feedbackContextLabel");
  els.copyFeedback.textContent = t("copyFeedback");
  els.mailFeedback.textContent = t("mailFeedback");
  els.closeFeedback.setAttribute("aria-label", t("closeFeedback"));
  els.feedbackDescription.textContent = t("feedbackHelp");
  els.closeScoreTable.setAttribute("aria-label", t("closeScoreTable"));
  els.closeGlossary.setAttribute("aria-label", t("closeGlossary"));
  els.glossaryTitle.textContent = t("glossaryTitle");
  Object.entries(t("feedbackTypes")).forEach(([value, label]) => {
    const option = els.feedbackType.querySelector(`[value="${value}"]`);
    if (option) option.textContent = label;
  });
  els.hintButton.setAttribute("aria-label", t("hint"));
}

function openScoreTableDialog() {
  if (typeof els.scoreTableDialog.showModal === "function") {
    els.scoreTableDialog.showModal();
  } else {
    els.scoreTableDialog.setAttribute("open", "");
  }
  els.closeScoreTable.focus();
}

function closeScoreTableDialog() {
  if (typeof els.scoreTableDialog.close === "function") {
    els.scoreTableDialog.close();
  } else {
    els.scoreTableDialog.removeAttribute("open");
  }
}

function openFeedbackDialog() {
  state.feedbackStatus = null;
  refreshFeedbackMailLink();
  renderFeedbackStatus();
  if (typeof els.feedbackDialog.showModal === "function") {
    els.feedbackDialog.showModal();
  } else {
    els.feedbackDialog.setAttribute("open", "");
  }
  els.feedbackMessage.focus();
}

function closeFeedbackDialog() {
  if (typeof els.feedbackDialog.close === "function") {
    els.feedbackDialog.close();
  } else {
    els.feedbackDialog.removeAttribute("open");
  }
}

function renderGuidance() {
  els.guidancePanel.hidden = true;
  els.guidancePanel.innerHTML = "";
  if (!state.guidanceMode || state.awaitingTrickAdvance) return;

  const guidance = currentGuidance();
  if (!guidance) return;

  const title = document.createElement("strong");
  title.textContent = `${guidance.label}: ${guidance.action}`;
  const reason = document.createElement("span");
  reason.appendChild(BridgeGlossary.linkifyText(guidance.reason));
  els.guidancePanel.append(title, reason);
  els.guidancePanel.hidden = false;
}

function currentGuidance() {
  if (state.phase === "bidding" && seatAt(state.turnIndex) === "South") return biddingGuidance();
  if (state.phase === "playing" && isHumanControlledSeat(seatAt(state.turnIndex))) return cardGuidance();
  return null;
}

function biddingGuidance() {
  const result = chooseRecommendedBidResult("South");
  return {
    label: t("recommendedBid"),
    action: formatCall(result.bid),
    reason: recommendedBidReason(result, "South")
  };
}

function recommendedBidReason(resultOrBid, seat) {
  if (resultOrBid?.bid && resultOrBid.ruleId) return explainBidChoiceResult(resultOrBid);
  const bid = resultOrBid;
  if (isPass(bid)) return t("bidExplanationPass");
  if (isDouble(bid)) return t("bidExplanationDouble");
  if (isRedouble(bid)) return t("bidExplanationRedouble");
  const detail = bidMeaning(bid, auctionContextForCall(seat));
  return t(detail.key, { detail: detail.text });
}

function auctionContextForCall(seat) {
  const previous = state.auction;
  const partnershipCalls = previous.filter((prior) => teamOf(prior.seat) === teamOf(seat) && isContractBid(prior.bid));
  const opponentCalls = previous.filter((prior) => teamOf(prior.seat) !== teamOf(seat) && isContractBid(prior.bid));
  return {
    partnershipCalls,
    opponentCalls,
    openingBid: partnershipCalls[0]?.bid || null,
    lastPartnerBid: [...previous].reverse().find((prior) => prior.seat === partnerOf(seat) && isContractBid(prior.bid))?.bid || null
  };
}

function cardGuidance() {
  const seat = seatAt(state.turnIndex);
  const result = chooseCardPlayResult(seat);
  if (!result?.card) return null;
  return {
    label: t("recommendedCard"),
    action: cardText(result.card),
    reason: `${explainCardPlayResult(result)}${playPlanReferenceText(result)}`
  };
}

function formatCall(call) {
  if (isPass(call)) return t("pass");
  if (isDouble(call)) return t("double");
  if (isRedouble(call)) return t("redouble");
  return formatBid(call);
}

function sameCall(left, right) {
  return bridgeRules.sameCall(left, right);
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
  const winner = state.pendingTrickWinner;
  const number = state.trickHistory.length + 1;
  const winnerText = winner ? `${seatName(winner)} wint slag ${number}. ` : "";
  els.trickAdvanceHint.textContent = `${winnerText}Klik ergens of druk op Enter voor de volgende slag.`;
}

function currentHint() {
  if (state.phase === "idle") return "Deel een nieuwe hand om te starten.";
  if (state.phase === "bidding") return biddingHint();
  if (state.phase === "playing") return playingHint();
  if (state.phase === "complete") {
    return state.developerMode
      ? "Bekijk het handoverzicht. In Developermodus zie je ook bied- en speeluitleg."
      : "Bekijk het handoverzicht om het biedverloop en de slagen terug te zien. Zet Developermodus aan voor extra uitleg.";
  }
  return "Zet Developermodus aan om meer uitleg over biedingen en speelkeuzes te zien.";
}

function biddingHint() {
  if (seatAt(state.turnIndex) === "South") {
    if (highestBid()) return "Je mag alleen hoger bieden dan het huidige hoogste bod. Pas betekent dat je nu geen bod doet.";
    return "Open alleen met genoeg kracht of een duidelijke verdeling. 1SA toont meestal een gebalanceerde hand.";
  }
  if (highestBid()?.strain === "NT") return "Na 1SA is 2K Stayman en zijn 2R/2H Jacoby-transfers in deze Vijfkaart-Hoog-basis.";
  return "Als partner jouw kleur steunt, hebben jullie waarschijnlijk een fit.";
}

function playingHint() {
  const seat = seatAt(state.turnIndex);
  if (!openingLeadHasBeenMade()) return "Dummy wordt pas zichtbaar na de uitkomst.";
  if (isHumanControlledSeat(seat)) {
    if (state.currentTrick.length) {
      const leadSuit = state.currentTrick[0].card.suit;
      const canFollow = state.hands[seat].some((card) => card.suit === leadSuit);
      if (canFollow) return `Je moet ${suitName(leadSuit)} bekennen als je kunt.`;
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
  if (state.finalScore?.passOut) {
    els.contract.textContent = t("passedOut");
    return;
  }
  if (!state.contract) {
    els.contract.textContent = state.phase === "bidding" ? t("auctionInProgress") : t("dealToStart");
    return;
  }
  els.contract.textContent = `${formatBid(state.contract)} ${t("by")} ${seatName(state.declarer)}`;
}

function finishHand() {
  state.phase = "complete";
  recomputeFinalScore();
  const needed = state.contract.level + 6;
  const made = state.finalScore.made;
  const resultKey = made >= needed ? "made" : "down";
  const resultArgs = made >= needed ? { over: made - needed } : { under: needed - made };
  setStatus("contractResult", { contract: formatBid(state.contract), declarer: state.declarer, resultKey, resultArgs });
  renderAll();
}

function recomputeFinalScore() {
  if (!state.contract || !state.declarer) return;
  const declaringTeam = teamOf(state.declarer);
  const defenders = declaringTeam === "NS" ? "EW" : "NS";
  const made = state.tricks[declaringTeam];
  state.finalScore = calculateBridgeScore({
    contract: state.contract,
    declarer: state.declarer,
    tricksMade: made,
    vulnerability: state.vulnerability,
  });
  state.finalScore.made = made;
  state.finalScore.defenders = state.tricks[defenders];
}

function calculateBridgeScore({ contract, declarer, tricksMade, vulnerability }) {
  return bridgeRules.calculateBridgeScore({ contract, declarer, tricksMade, vulnerability });
}

function contractTrickPoints(contract) {
  return bridgeRules.contractTrickPoints(contract);
}

function overtrickPoints(contract, overtricks, vulnerable, multiplier) {
  return bridgeRules.overtrickPoints(contract, overtricks, vulnerable, multiplier);
}

function downScore(undertricks, vulnerable, multiplier) {
  return bridgeRules.downScore(undertricks, vulnerable, multiplier);
}

function legalCards(seat) {
  return bridgeRules.legalCards(state.hands[seat], state.currentTrick);
}

function isLegalCard(seat, card) {
  return legalCards(seat).some((legal) => legal.id === card.id);
}

function currentWinningPlay() {
  const trump = state.contract.strain === "NT" ? null : state.contract.strain;
  return bridgeRules.currentWinningPlay(state.currentTrick, trump);
}

function beats(card, best, leadSuit, trump) {
  return bridgeRules.beats(card, best, leadSuit, trump);
}

function highestBidCall() {
  return bridgeRules.highestBidCall(state.auction);
}

function highestBid() {
  return bridgeRules.highestBid(state.auction);
}

function isBidHigher(bid, current) {
  return bridgeRules.isBidHigher(bid, current);
}

function isPass(bid) {
  return bridgeRules.isPass(bid);
}

function isDouble(bid) {
  return bridgeRules.isDouble(bid);
}

function isRedouble(bid) {
  return bridgeRules.isRedouble(bid);
}

function isContractBid(bid) {
  return bridgeRules.isContractBid(bid);
}

function normalizeBid(bid) {
  return bridgeRules.normalizeBid(bid);
}

function formatBid(bid) {
  const base = `${bid.level}${suitSymbols[bid.strain]}`;
  if (bid.redoubled) return `${base} xx`;
  if (bid.doubled) return `${base} x`;
  return base;
}

function cardText(card) {
  return `${rankLabel[card.rank] || card.rank}${suitSymbols[card.suit]}`;
}

function seatAt(index) {
  return seats[index % 4];
}

function teamOf(seat) {
  return bridgeRules.teamOf(seat);
}

function partnerOf(seat) {
  return seat === "North" ? "South" : seat === "South" ? "North" : seat === "East" ? "West" : "East";
}

function leftOf(seat) {
  return seats[(seats.indexOf(seat) + 1) % 4];
}

function setStatus(key, args = {}) {
  state.status = { key, args };
  renderStatus();
}

function renderStatus() {
  els.status.textContent = t(state.status.key, localizeArgs(state.status.args));
  renderDummyNotice();
}

function renderDummyNotice() {
  els.dummyNotice.hidden = true;
  els.dummyNotice.textContent = "";
  if (
    state.phase !== "playing" ||
    !state.declarer ||
    !state.dummy ||
    !openingLeadHasBeenMade() ||
    state.trickHistory.length > 0
  ) {
    return;
  }
  const key = teamOf(state.declarer) === "NS" ? "dummyNoticeDeclaring" : "dummyNoticeDefending";
  els.dummyNotice.textContent = t(key, {
    declarer: seatName(state.declarer),
    dummy: seatName(state.dummy)
  });
  els.dummyNotice.hidden = false;
}

function localizeArgs(args) {
  const localized = { ...args };
  ["seat", "leader", "declarer", "dummy"].forEach((key) => {
    if (localized[key]) localized[key] = seatName(localized[key]);
  });
  if (localized.resultKey) {
    localized.result = t(localized.resultKey, localized.resultArgs || {});
  }
  return localized;
}

function t(key, args = {}) {
  const template = text[key] || key;
  return Object.entries(args).reduce((text, [name, value]) => text.replaceAll(`{${name}}`, value), template);
}

function seatName(seat) {
  return text.seats[seat] || seat;
}

function suitName(suit) {
  return text.suits[suit] || suit;
}

startHand();

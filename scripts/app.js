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
const stateTransitions = globalThis.BridgeStateTransitions;
if (!stateTransitions) throw new Error("state-transitions.js must load before app.js");
const defaultBiddingSystem = bridgeRules.biddingSystems.fiveCardHigh;
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
const seatAuctionEls = {
  North: document.querySelector("#north-auction-calls"),
  East: document.querySelector("#east-auction-calls"),
  South: document.querySelector("#south-auction-calls"),
  West: document.querySelector("#west-auction-calls")
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
  reviewTrickCursor: null,
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
  biddingSystemId: defaultBiddingSystem.id,
  biddingAgreements: { ...defaultBiddingSystem.conventionDefaults },
  pendingStop: false,
  pendingAlert: false,
  status: { key: "chooseAndDeal", args: {} },
  finalScore: null,
  dealSeed: null,
  seedMessage: null,
  practice: null,
  feedbackStatus: null,
  illegalActionFeedback: null,
  handSuitFocus: null,
  lessonBoardAcknowledged: []
};

let illegalActionFeedbackTimer = null;
let flowGeneration = 0;
let dealAnimationTimer = null;
let dealAnimationHandsLocked = false;
let dealAnimationHandRenderSnapshot = null;

const els = {
  appShell: document.querySelector(".app-shell"),
  title: document.querySelector("#app-title"),
  heading: document.querySelector("#app-heading"),
  playMode: document.querySelector("#play-mode"),
  appMenu: document.querySelector(".app-menu"),
  settingsSummary: document.querySelector("#settings-summary"),
  developerOnlyElements: document.querySelectorAll("[data-developer-only]"),
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
  openLessons: document.querySelector("#open-lessons"),
  lessonsDialog: document.querySelector("#lessons-dialog"),
  closeLessons: document.querySelector("#close-lessons"),
  lessonsEyebrow: document.querySelector("#lessons-eyebrow"),
  lessonsTitle: document.querySelector("#lessons-title"),
  lessonsIntro: document.querySelector("#lessons-intro"),
  lessonsList: document.querySelector("#lessons-list"),
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
  replayPanel: document.querySelector("#replay-panel"),
  replayTitle: document.querySelector("#replay-title"),
  replayNewHand: document.querySelector("#replay-new-hand"),
  replaySameHand: document.querySelector("#replay-same-hand"),
  quickReview: document.querySelector("#quick-review"),
  seedLabel: document.querySelector("#seed-label"),
  seedInput: document.querySelector("#seed-input"),
  loadSeed: document.querySelector("#load-seed"),
  copySeed: document.querySelector("#copy-seed"),
  seedDescription: document.querySelector("#seed-description"),
  tableArea: document.querySelector(".table-area"),
  contractReveal: document.querySelector("#contract-reveal"),
  contractRevealBid: document.querySelector("#contract-reveal-bid"),
  contractRevealMeta: document.querySelector("#contract-reveal-meta"),
  contractRevealLead: document.querySelector("#contract-reveal-lead"),
  sidePanel: document.querySelector(".side-panel"),
  auctionPanel: document.querySelector(".auction-panel"),
  mobileBiddingSlot: document.querySelector("#mobile-bidding-slot"),
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
  feedbackDetailField: document.querySelector("#feedback-detail-field"),
  feedbackDetailLabel: document.querySelector("#feedback-detail-label"),
  feedbackDetail: document.querySelector("#feedback-detail"),
  copyFeedback: document.querySelector("#copy-feedback"),
  mailFeedback: document.querySelector("#mail-feedback"),
  closeFeedback: document.querySelector("#close-feedback"),
  feedbackDescription: document.querySelector("#feedback-description"),
  bidControlsTitle: document.querySelector("#bid-controls-title"),
  bidControls: document.querySelector("#bid-controls"),
  bidExplanations: document.querySelector("#bid-explanations"),
  playPlan: document.querySelector("#play-plan-panel"),
  playExplanations: document.querySelector("#play-explanations"),
  auctionLog: document.querySelector("#auction-log"),
  dealerBadge: document.querySelector("#dealer-badge"),
  contract: document.querySelector("#contract"),
  trickArea: document.querySelector("#trick-area"),
  status: document.querySelector("#status"),
  guidancePanel: document.querySelector("#guidance-panel"),
  dummyNotice: document.querySelector("#dummy-notice"),
  lessonBanner: document.querySelector("#lesson-banner"),
  tableFeedback: document.querySelector("#table-feedback"),
  trickAdvanceHint: document.querySelector("#trick-advance-hint"),
  scoreline: document.querySelector("#scoreline"),
  history: document.querySelector("#history"),
  trickCount: document.querySelector("#trick-count")
};

const mobileLayoutQuery = globalThis.matchMedia?.("(max-width: 760px)") || null;
const mobileBiddingLayoutQuery = mobileLayoutQuery;
const stableSidebarLayoutQuery = globalThis.matchMedia?.("(min-width: 1180px)") || null;

loadSavedSettings();

els.newHand.addEventListener("click", startHand);
els.sameHand.addEventListener("click", replayHand);
els.replayNewHand.addEventListener("click", startHand);
els.replaySameHand.addEventListener("click", replayHand);
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
els.openLessons?.addEventListener("click", () => {
  closeAppMenu();
});
if (els.openLessons && new URLSearchParams(globalThis.location?.search || "").has("testHooks")) {
  els.openLessons.href = "lessons.html?testHooks=1";
}
els.openScoreTable.addEventListener("click", openScoreTableDialog);
els.closeScoreTable.addEventListener("click", closeScoreTableDialog);
els.loadSeed.addEventListener("click", loadSeedFromInput);
els.copySeed.addEventListener("click", copyCurrentSeed);
els.openFeedback.addEventListener("click", openFeedbackDialog);
els.closeFeedback.addEventListener("click", closeFeedbackDialog);
els.copyFeedback.addEventListener("click", copyFeedbackReport);
els.mailFeedback.addEventListener("click", submitFeedbackReport);
els.feedbackType.addEventListener("change", updateFeedbackQuestions);
els.feedbackDialog.addEventListener("click", (event) => {
  if (event.target === els.feedbackDialog) closeFeedbackDialog();
});
els.settingsSummary?.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleAppMenu();
});
els.appMenu?.querySelector(".menu-actions")?.addEventListener("click", (event) => {
  if (event.target.closest("button, a")) closeAppMenu();
});
els.appMenu?.addEventListener("click", (event) => event.stopPropagation());
els.scoreTableDialog.addEventListener("click", (event) => {
  if (event.target === els.scoreTableDialog) closeScoreTableDialog();
});
document.addEventListener("click", () => closeAppMenu());
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
els.contractReveal?.addEventListener("click", (event) => {
  event.stopPropagation();
  startPlayFromContractReveal();
});
els.tableArea.addEventListener("click", (event) => {
  if (clearHandSuitFocusFromOutsideClick(event.target)) return;
  if (state.phase === "contract-reveal") {
    if (isControlTarget(event.target)) return;
    startPlayFromContractReveal();
    return;
  }
  if (blockingLessonBoardStep()) return;
  if (state.awaitingTrickAdvance && state.trickAdvanceArmed) advanceCompletedTrick();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeAppMenu();
  if (isControlTarget(event.target)) return;
  if (event.key === "Enter" && state.phase === "contract-reveal") {
    event.preventDefault();
    startPlayFromContractReveal();
    return;
  }
  if ((event.key === "ArrowLeft" || event.key === "ArrowRight") && moveReviewTrickCursor(event.key === "ArrowRight" ? 1 : -1)) {
    event.preventDefault();
    return;
  }
  if (event.key === "Enter" && blockingLessonBoardStep()) {
    event.preventDefault();
    return;
  }
  if (event.key === "Enter" && state.awaitingTrickAdvance && state.trickAdvanceArmed) {
    event.preventDefault();
    advanceCompletedTrick();
  }
});

const rerenderResponsiveLayout = () => renderAll();
[mobileBiddingLayoutQuery, stableSidebarLayoutQuery].filter(Boolean).forEach((query) => {
  if (typeof query.addEventListener === "function") {
    query.addEventListener("change", rerenderResponsiveLayout);
  } else if (typeof query.addListener === "function") {
    query.addListener(rerenderResponsiveLayout);
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
  startPreparedHand({
    dealerIndex: dealerIndexForDeal(state.dealNumber),
    vulnerability: vulnerabilityForDeal(state.dealNumber),
    hands: dealHands(state.dealSeed),
    practice: null,
    clearSeedMessage: !loadedSeed,
    skipFlow
  });
}

function startPracticeHand(handId, { preserveBoard = false, skipFlow = false, lesson = null } = {}) {
  if (!globalThis.PracticeHands) throw new Error("practice-hands/index.js must load before practice hands can be used");
  const scenario = globalThis.PracticeHands.preparePracticeHand(handId);
  if (!preserveBoard || state.dealNumber === 0) state.dealNumber += 1;

  state.dealSeed = scenario.id;
  startPreparedHand({
    dealerIndex: seats.indexOf(scenario.dealer),
    vulnerability: scenario.vulnerability,
    hands: scenario.hands,
    practice: practiceStateFromScenario(scenario, lesson),
    skipFlow
  });
  return scenario;
}

function startLesson(lesson, handId) {
  if (!lesson?.id || !handId) return;
  const startAtPlay = lesson.startMode === "play";
  const scenario = startPracticeHand(handId, { lesson, skipFlow: startAtPlay });
  if (!startAtPlay) return scenario;

  const expected = scenario.expectedContract;
  if (!expected) return scenario;
  const contract = globalThis.PracticeHands.contractFromText(expected.contract);
  state.phase = "playing";
  state.contract = contract;
  state.declarer = expected.declarer;
  state.dummy = partnerOf(state.declarer);
  state.leader = leftOf(state.declarer);
  state.turnIndex = seats.indexOf(state.leader);
  if (lesson.enableGuidance) state.guidanceMode = true;
  renderAll();
  setStatus("lead", { leader: state.leader, declarer: state.declarer, dummy: state.dummy });
  continuePlay();
  return scenario;
}

function startLessonFromUrl() {
  const params = new URLSearchParams(globalThis.location?.search || "");
  const lessonId = params.get("lesson");
  const handId = params.get("hand");
  if (!lessonId || !handId) return false;

  const lesson = globalThis.BridgeLessons?.findLesson?.(lessonId);
  if (!lesson) return false;

  startLesson(lesson, handId);
  return true;
}

function startPreparedHand({ dealerIndex, vulnerability, hands, practice = null, clearSeedMessage = false, skipFlow = false }) {
  resetScheduledFlow();
  clearDealAnimationTimer();
  dealAnimationHandsLocked = false;
  Object.assign(state, stateTransitions.startPreparedHandTransition({
    dealerIndex,
    vulnerability,
    hands,
    originalHands: cloneHands(hands),
    practice
  }));
  state.lessonBoardAcknowledged = [];
  if (illegalActionFeedbackTimer) {
    window.clearTimeout(illegalActionFeedbackTimer);
    illegalActionFeedbackTimer = null;
  }
  state.handSuitFocus = null;
  if (clearSeedMessage) state.seedMessage = null;
  clearTrickSlots();
  if (skipFlow) {
    state.animateDeal = false;
    dealAnimationHandsLocked = false;
    setStatus("opensAuction", { seat: seatAt(state.turnIndex) });
    return;
  }
  renderAll();
  scheduleDealAnimationEnd();
  setStatus("dealing");
}

function resetScheduledFlow() {
  flowGeneration += 1;
}

function scheduleDealAnimationEnd() {
  clearDealAnimationTimer();
  const dealAnimationMs = prefersReducedMotion() ? 0 : 1400;
  dealAnimationTimer = window.setTimeout(() => {
    state.animateDeal = false;
    dealAnimationHandsLocked = false;
    dealAnimationHandRenderSnapshot = null;
    dealAnimationTimer = null;
    renderHands();
    setStatus("opensAuction", { seat: seatAt(state.turnIndex) });
    continueAuction();
  }, dealAnimationMs);
}

function clearDealAnimationTimer() {
  if (dealAnimationTimer) window.clearTimeout(dealAnimationTimer);
  dealAnimationTimer = null;
  dealAnimationHandsLocked = false;
  dealAnimationHandRenderSnapshot = null;
}

function replayHand() {
  if (state.practice?.id) {
    startPracticeHand(state.practice.id, { preserveBoard: true });
    return;
  }
  startHand({ replay: true });
}

function practiceStateFromScenario(scenario, lesson = null) {
  return {
    id: scenario.id,
    title: scenario.title,
    level: scenario.level,
    focus: [...(scenario.focus || [])],
    systemId: scenario.systemId,
    expectedAuction: scenario.expectedAuction || [],
    expectedContract: scenario.expectedContract || null,
    expectedPlayPlan: scenario.expectedPlayPlan || null,
    expectedScore: scenario.expectedScore || null,
    teachingPoints: lesson?.teachingPoints ? [...lesson.teachingPoints] : (scenario.teachingPoints || []),
    explanationKeys: scenario.explanationKeys || [],
    testGoal: scenario.testGoal || "",
    lessonId: lesson?.id || null,
    lessonNumber: lesson?.number || null,
    lessonTitle: lesson?.title || "",
    challenge: lesson?.challenge || "",
    lessonStartMode: lesson?.startMode || "",
    lessonFocus: lesson?.focus ? [...lesson.focus] : [],
    lessonIntro: lesson?.intro || "",
    lessonReviewFeedback: lesson?.reviewFeedback ? [...lesson.reviewFeedback] : [],
    lessonBoardGuidance: lesson?.boardGuidance ? lesson.boardGuidance.map((step) => ({ ...step })) : []
  };
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

function moveReviewTrickCursor(delta) {
  if (!state.developerMode || state.phase !== "complete" || !state.trickHistory.length || els.reviewPanel.hidden) return false;
  const maxIndex = state.trickHistory.length - 1;
  const current = Number.isInteger(state.reviewTrickCursor) ? state.reviewTrickCursor : (delta > 0 ? -1 : state.trickHistory.length);
  state.reviewTrickCursor = Math.max(0, Math.min(maxIndex, current + delta));
  renderAll();
  window.setTimeout(scrollSelectedReviewTrickIntoView, 0);
  return true;
}

function ensureReviewTrickCursor() {
  if (!state.developerMode || state.phase !== "complete" || !state.trickHistory.length) {
    state.reviewTrickCursor = null;
    return null;
  }
  const maxIndex = state.trickHistory.length - 1;
  if (!Number.isInteger(state.reviewTrickCursor)) state.reviewTrickCursor = 0;
  state.reviewTrickCursor = Math.max(0, Math.min(maxIndex, state.reviewTrickCursor));
  return state.trickHistory[state.reviewTrickCursor]?.number || null;
}

function scrollSelectedReviewTrickIntoView() {
  if (!els.reviewPanel || els.reviewPanel.hidden) return;
  const selectedRow = els.reviewPanel.querySelector(".review-trick-row.is-review-selected");
  selectedRow?.scrollIntoView({ block: "nearest" });
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

function isSeatVulnerable(seat, vulnerability = state.vulnerability) {
  return isTeamVulnerable(bridgeRules.teamOf(seat), vulnerability);
}

function compareCards(a, b) {
  return bridgeRules.compareCards(a, b);
}

function renderAll() {
  applyStaticText();
  renderResponsiveLayoutState();
  renderScoreTable();
  renderTurnFocus();
  renderTrickSlotFocus();
  if (!shouldSkipHandRenderForDealAnimation()) renderHands();
  renderAuction();
  renderBidControls();
  renderPlayPlan();
  renderHistory();
  renderPlayExplanations();
  renderReview();
  renderContract();
  renderGuidance();
  renderLessonBanner();
  renderContractReveal();
  renderFeedbackStatus();
  renderIllegalActionFeedback();
  renderReplayPanel();
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

function renderResponsiveLayoutState() {
  const isBidding = state.phase === "bidding";
  const isContractReveal = state.phase === "contract-reveal";
  const auctionReady = isBidding && !state.animateDeal;
  const useTableBiddingLayout = isBidding;
  const useMobileBiddingLayout = Boolean(useTableBiddingLayout && mobileBiddingLayoutQuery?.matches);
  const useStableSidebarLayout = Boolean(stableSidebarLayoutQuery?.matches);
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
  return Boolean(mobileLayoutQuery?.matches);
}

function usesStableSidebarLayout() {
  return Boolean(stableSidebarLayoutQuery?.matches);
}

function focusHandSuit(seat, suit) {
  if (!isMobileLayout() || !seat || !suit) return false;
  state.handSuitFocus = { seat, suit };
  renderHands();
  return true;
}

function clearHandSuitFocus() {
  if (!state.handSuitFocus) return false;
  state.handSuitFocus = null;
  renderHands();
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
  if (!state.animateDeal || !dealAnimationHandsLocked || !dealAnimationHandRenderSnapshot) return false;
  const current = dealAnimationHandRenderState();
  return (
    current.phase === dealAnimationHandRenderSnapshot.phase &&
    current.hands === dealAnimationHandRenderSnapshot.hands &&
    current.developerMode === dealAnimationHandRenderSnapshot.developerMode &&
    current.guidanceMode === dealAnimationHandRenderSnapshot.guidanceMode &&
    current.declarer === dealAnimationHandRenderSnapshot.declarer &&
    current.dummy === dealAnimationHandRenderSnapshot.dummy &&
    current.turnIndex === dealAnimationHandRenderSnapshot.turnIndex &&
    current.awaitingTrickAdvance === dealAnimationHandRenderSnapshot.awaitingTrickAdvance &&
    current.currentTrickLength === dealAnimationHandRenderSnapshot.currentTrickLength &&
    current.trickHistoryLength === dealAnimationHandRenderSnapshot.trickHistoryLength
  );
}

function lockDealAnimationHands() {
  if (!state.animateDeal) return;
  dealAnimationHandsLocked = true;
  dealAnimationHandRenderSnapshot = dealAnimationHandRenderState();
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

function toggleAppMenu() {
  const isOpen = !els.appMenu?.classList.contains("is-open");
  renderAppMenu(isOpen);
}

function closeAppMenu() {
  renderAppMenu(false);
}

function renderAppMenu(isOpen) {
  if (!els.appMenu || !els.settingsSummary) return;
  els.appMenu.classList.toggle("is-open", isOpen);
  els.settingsSummary.setAttribute("aria-expanded", String(isOpen));
  const panel = els.appMenu.querySelector(".app-menu-panel");
  if (panel) panel.hidden = !isOpen;
}

function renderReplayPanel() {
  els.replayPanel.hidden = state.phase !== "complete";
}

function renderTurnFocus() {
  const focusClasses = seats.map((seat) => `turn-focus-${seat.toLowerCase()}`);
  els.tableArea.classList.remove(...focusClasses);
  if (state.phase === "bidding" && seatAt(state.turnIndex) === "South") {
    els.tableArea.classList.add("turn-focus-south");
    return;
  }
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
  els.openLessons.textContent = t("openLessons");
  els.lessonsEyebrow.textContent = t("lessonsEyebrow");
  els.lessonsTitle.textContent = t("lessonsTitle");
  els.lessonsIntro.textContent = t("lessonsIntro");
  els.closeLessons.setAttribute("aria-label", t("closeLessons"));
  els.openGlossary.textContent = t("openGlossary");
  els.openScoreTable.textContent = t("openScoreTable");
  els.developerModeLabel.textContent = t("developerMode");
  els.developerMode.checked = state.developerMode;
  els.guidanceModeLabel.textContent = t("guidanceMode");
  els.guidanceMode.checked = state.guidanceMode;
  els.playHistoryModeLabel.textContent = t("playHistoryMode");
  els.playHistoryMode.checked = state.showPlayHistory;
  setSettingInfo(els.playHistoryModeDescription, t("playHistoryModeHelp"));
  setSettingInfo(els.guidanceModeDescription, t("guidanceModeHelp"));
  setSettingInfo(els.developerModeDescription, t("developerModeHelp"));
  els.newHand.textContent = t("newHand");
  els.sameHand.textContent = t("sameHand");
  els.replayTitle.textContent = t("replayTitle");
  els.replayNewHand.textContent = t("newHand");
  els.replaySameHand.textContent = t("sameHand");
  els.quickReview.textContent = t("quickReview");
  els.developerOnlyElements.forEach((element) => {
    element.hidden = !state.developerMode;
  });
  els.seedLabel.textContent = t("seed");
  els.loadSeed.textContent = t("loadSeed");
  els.copySeed.textContent = t("copySeed");
  renderSeatLabel(els.northLabel, "North", t("partner"));
  renderSeatLabel(els.eastLabel, "East");
  renderSeatLabel(els.southLabel, "South", t("you"));
  renderSeatLabel(els.westLabel, "West");
  els.biddingTitle.textContent = t("bidding");
  els.historyTitle.textContent = t("history");
  els.reviewTitle.textContent = t("review");
  els.feedbackTitle.textContent = t("feedbackTitle");
  els.feedbackTypeLabel.textContent = t("feedbackTypeLabel");
  els.feedbackMessageLabel.textContent = t("feedbackMessageLabel");
  els.feedbackMessage.placeholder = t("feedbackMessagePlaceholder");
  els.feedbackDetailLabel.textContent = t("feedbackDetailLabel");
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
  updateFeedbackQuestions();
  els.hintButton.setAttribute("aria-label", t("hint"));
}

function setSettingInfo(element, tooltip) {
  if (!element) return;
  element.textContent = "i";
  element.dataset.tooltip = tooltip;
  element.title = tooltip;
  element.setAttribute("aria-label", tooltip);
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
  closeAppMenu();
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
  const prompts = t("feedbackPrompts") || {};
  const prompt = prompts[els.feedbackType.value] || prompts.confusion || {};
  els.feedbackMessageLabel.textContent = prompt.primaryLabel || t("feedbackMessageLabel");
  els.feedbackMessage.placeholder = prompt.primaryPlaceholder || t("feedbackMessagePlaceholder");
  const hasDetailQuestion = Boolean(prompt.secondaryLabel);
  els.feedbackDetailField.hidden = !hasDetailQuestion;
  els.feedbackDetailLabel.textContent = prompt.secondaryLabel || t("feedbackDetailLabel");
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

function renderGuidance() {
  els.guidancePanel.hidden = true;
  els.guidancePanel.innerHTML = "";
  if (!state.guidanceMode || state.awaitingTrickAdvance) return;
  if (blockingLessonBoardStep()) return;

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

  const nextName = seatName(seat);
  if (name.textContent !== nextName) name.textContent = nextName;
  name.classList.toggle("is-vulnerable-team", isSeatVulnerable(seat));

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
  if (state.phase === "bidding" && !state.animateDeal && seatAt(state.turnIndex) === "South") return biddingGuidance();
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
  if (state.phase === "contract-reveal") return "Het contract is bekend. Klik op de tafel of druk op Enter om het spel te starten.";
  if (state.phase === "playing") return playingHint();
  if (state.phase === "complete") {
    return state.developerMode
      ? "Bekijk het handoverzicht. In Developermodus zie je ook bied- en speeluitleg."
      : "Bekijk het handoverzicht om het biedverloop en de slagen terug te zien. Zet Developermodus aan voor extra uitleg.";
  }
  return "Zet Developermodus aan om meer uitleg over biedingen en speelkeuzes te zien.";
}

function biddingHint() {
  if (state.animateDeal) return "Wacht tot de kaarten gedeeld zijn; daarna begint het bieden.";
  if (seatAt(state.turnIndex) === "South") {
    if (highestBid()) return "Je mag alleen hoger bieden dan het huidige hoogste bod. Pas betekent dat je nu geen bod doet.";
    return "Open alleen met genoeg kracht of een duidelijke verdeling. 1SA toont meestal een gebalanceerde hand.";
  }
  if (highestBid()?.strain === "NT") return "Na 1SA zoek je eerst een hoge-kleurfit: 2K Stayman met een vierkaart hoog, 2R/2H transfer met een vijfkaart hoog.";
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

const BridgeApp = {
  state,
  els,
  rules: bridgeRules,
  actions: {
    startHand,
    startPracticeHand,
    startLesson,
    autoCompleteAuction,
    enterContractReveal,
    startPlayFromContractReveal,
    autoCompletePlay,
    continuePlay,
    playCard,
    makeBid,
    replayHand,
    jumpToTrickOverview,
    createSituationSeed
  },
  render: {
    renderAll,
    renderHands,
    renderAuction,
    renderBidControls,
    renderPlayPlan,
    renderHistory,
    renderReview,
    renderScoreTable,
    renderPlayedCard,
    clearTrickSlots
  },
  helpers: {
    seatAt,
    seatName,
    suitName,
    cardText,
    legalCards,
    chooseCard,
    autoPlayCard,
    chooseCardPlayResult,
    chooseRecommendedBidResult,
    currentRecommendedCard,
    sameCall
  }
};

globalThis.BridgeApp = BridgeApp;
globalThis.BridgeAppContext = BridgeApp;

if (new URLSearchParams(globalThis.location?.search || "").has("testHooks")) {
  globalThis.BridgeAppTestHooks = createBridgeAppTestHooks();
}

function createBridgeAppTestHooks() {
  const setState = (nextState) => {
    const patch = typeof nextState === "function" ? nextState(state) : nextState;
    if (!patch || typeof patch !== "object") return getState();
    Object.assign(state, patch);
    return getState();
  };

  const setDeveloperMode = (enabled) => {
    state.developerMode = Boolean(enabled);
    renderAll();
    return getState();
  };

  const setGuidanceMode = (enabled) => {
    state.guidanceMode = Boolean(enabled);
    renderAll();
    return getState();
  };

  return {
    app: BridgeApp,
    rules: bridgeRules,
    startHand,
    startPracticeHand,
    startLesson,
    autoCompleteAuction,
    enterContractReveal,
    startPlayFromContractReveal,
    autoCompletePlay,
    renderAll,
    continuePlay,
    playCard,
    makeBid,
    setState,
    getState,
    makeCard,
    clearTrickSlots,
    renderPlayedCard,
    setDeveloperMode,
    setGuidanceMode,
    loadSeedFromInput,
    createSituationSeed,
    chooseRecommendedBidResult,
    chooseCardPlayResult,
    chooseCard,
    autoPlayCard,
    legalCards,
    seatAt,
    sameCall,
    getEls: () => els
  };
}

function getState() {
  return JSON.parse(JSON.stringify(state));
}

function makeCard(id) {
  return { id, rank: id.slice(0, -1), suit: id.slice(-1) };
}

if (!startLessonFromUrl()) startHand();

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
const text = {
  title: "Bridgetafel",
  heading: "Speel Vijfkaart Hoog met een AI-partner",
  settings: "Instellingen",
  playMode: "Je speelt Noord en Zuid wanneer Noord/Zuid leider zijn; anders verdedig je als Zuid.",
  scoreMode: {
    duplicate: "Duplicate: gewone bridgescore met kwetsbaarheid en contractbonussen.",
    matchpoints: "Actiever bieden: gewone bridgescore, maar de AI opent en volgt iets lichter om agressiever bieden te oefenen.",
    casual: "Oefenen: rekent zonder kwetsbaarheid zodat de focus op leren blijft."
  },
  developerModeHelp: "Toont alle kaarten open, plus extra bied- en speeluitleg voor analyse en testen.",
  guidanceModeHelp: "Toont eenvoudige AI-suggesties met korte redenen. Dit is heuristische hulp, geen perfecte bridgeles.",
  playHistoryModeHelp: "Toont het live overzicht van gespeelde slagen tijdens het spel.",
  scoringMode: "Score",
  scoringDuplicate: "Duplicate",
  scoringMatchpoints: "Actiever bieden",
  scoringCasual: "Oefenen",
  vulnerability: "Kwetsbaarheid",
  vulnerabilityNone: "Niemand",
  vulnerabilityNS: "Noord/Zuid",
  vulnerabilityEW: "Oost/West",
  vulnerabilityBoth: "Allen",
  bridgeScore: "Bridgescore",
  scoreFor: "Score voor",
  developerMode: "Developermodus",
  guidanceMode: "AI-suggesties",
  playHistoryMode: "Speelgeschiedenis",
  bidExplanations: "Bieduitleg",
  newHand: "Nieuwe hand",
  sameHand: "Zelfde hand",
  quickReview: "Test slagenoverzicht",
  seed: "Handseed",
  loadSeed: "Laad seed",
  copySeed: "Kopieer seed",
  seedHelp: "Kopieer deze seed of plak een andere seed om dezelfde kaartverdeling op dit bord te laden.",
  seedCopied: "Seed gekopieerd.",
  seedLoaded: "Seed geladen.",
  seedRequired: "Vul eerst een seed in.",
  seedCopyFailed: "Kopieren lukte niet; selecteer de seed handmatig.",
  recommendedBid: "AI-suggestie bod",
  recommendedCard: "AI-suggestie kaart",
  bidding: "Bieden",
  history: "Speelgeschiedenis",
  review: "Handoverzicht",
  openingLead: "Uitkomst",
  finalContract: "Contract",
  passedOut: "Rondpas",
  declarer: "Leider",
  dummy: "Dummy",
  result: "Resultaat",
  auction: "Biedverloop",
  hands: "Handen",
  trickOverview: "Slagenoverzicht",
  trickLegendLead: "Uit",
  trickLegendNSWin: "Noord/Zuid wint",
  trickLegendEWWin: "Oost/West wint",
  none: "Geen",
  board: "Bord",
  dealer: "Deler",
  tricks: "slagen",
  trick: "Slag",
  partner: "Partner",
  you: "Jij",
  by: "door",
  pass: "Pas",
  double: "Doublet",
  redouble: "Redoublet",
  stop: "Stop",
  alert: "Alert",
  stopAria: "Stopkaart voor je volgende bieding",
  alertAria: "Alertkaart bij je volgende bieding",
  bidExplanationPass: "Geen duidelijke systeemactie of te weinig waarden om te bieden.",
  bidExplanationDouble: "Doublet: voorlopig vooral een informatiedoublet of strafdoublet in duidelijke situaties.",
  bidExplanationRedouble: "Redoublet: toont extra vertrouwen nadat de tegenpartij heeft gedoubleerd.",
  bidExplanationOpening: "Opening: {detail}.",
  bidExplanationResponse: "Antwoord op partner: {detail}.",
  bidExplanationCompetitive: "Competitieve actie: {detail}.",
  bidExplanationContinuation: "Vervolg: {detail}.",
  bidExplanationArtificial: "Kunstmatige afspraak: {detail}.",
  playExplanations: "Speeluitleg",
  hint: "Hint",
  auctionInProgress: "Bieden bezig",
  dealToStart: "Deel een hand om te starten",
  chooseAndDeal: "Deel een nieuwe hand om te starten.",
  historyEmpty: "Slagen verschijnen hier tijdens het spel.",
  opensAuction: "{seat} opent het bieden.",
  yourCall: "Jij bent aan de beurt om te bieden.",
  fourPasses: "Vier passen. Score 0 op dit bord.",
  lead: "{leader} komt uit. Leider: {declarer}. Dummy: {dummy}.",
  yourPlay: "Jij bent aan de beurt. Bekennen als dat kan.",
  played: "{seat} speelde {card}.",
  winsTrick: "{seat} wint slag {number}.",
  contractResult: "{contract} door {declarer}: {result}.",
  passOutResult: "Rondpas: score 0",
  made: "gemaakt +{over}",
  down: "{under} down",
  declarers: "Leidersteam",
  defenders: "tegenspelers",
  northSouth: "Noord/Zuid",
  eastWest: "Oost/West",
  seats: { North: "Noord", East: "Oost", South: "Zuid", West: "West" },
  suits: { C: "klaveren", D: "ruiten", H: "harten", S: "schoppen", NT: "sans-atout" }
};
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
  originalHands: {},
  dealNumber: 0,
  vulnerability: "none",
  animateDeal: false,
  scoringMode: "duplicate",
  developerMode: false,
  guidanceMode: false,
  showPlayHistory: false,
  pendingStop: false,
  pendingAlert: false,
  status: { key: "chooseAndDeal", args: {} },
  finalScore: null,
  dealSeed: null,
  seedMessage: null
};

const els = {
  title: document.querySelector("#app-title"),
  heading: document.querySelector("#app-heading"),
  playMode: document.querySelector("#play-mode"),
  settingsSummary: document.querySelector("#settings-summary"),
  scoringModeLabel: document.querySelector("#scoring-mode-label"),
  scoringMode: document.querySelector("#scoring-mode"),
  scoringModeDescription: document.querySelector("#scoring-mode-description"),
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
  bidControls: document.querySelector("#bid-controls"),
  bidExplanations: document.querySelector("#bid-explanations"),
  playExplanations: document.querySelector("#play-explanations"),
  auctionLog: document.querySelector("#auction-log"),
  dealerBadge: document.querySelector("#dealer-badge"),
  contract: document.querySelector("#contract"),
  status: document.querySelector("#status"),
  guidancePanel: document.querySelector("#guidance-panel"),
  trickAdvanceHint: document.querySelector("#trick-advance-hint"),
  scoreline: document.querySelector("#scoreline"),
  history: document.querySelector("#history"),
  trickCount: document.querySelector("#trick-count")
};

loadSavedSettings();

els.newHand.addEventListener("click", startHand);
els.sameHand.addEventListener("click", replayHand);
els.quickReview.addEventListener("click", jumpToTrickOverview);
els.loadSeed.addEventListener("click", loadSeedFromInput);
els.copySeed.addEventListener("click", copyCurrentSeed);
document.documentElement.lang = "nl";
els.scoringMode.addEventListener("change", () => {
  state.scoringMode = els.scoringMode.value;
  saveSettings();
  recomputeFinalScore();
  renderAll();
});
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
  return target?.closest?.("button, input, select, textarea, summary, details");
}

function loadSavedSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(settingsStorageKey) || "{}");
    if (["duplicate", "matchpoints", "casual"].includes(saved.scoringMode)) state.scoringMode = saved.scoringMode;
    if (typeof saved.developerMode === "boolean") state.developerMode = saved.developerMode;
    if (typeof saved.guidanceMode === "boolean") state.guidanceMode = saved.guidanceMode;
    if (typeof saved.showPlayHistory === "boolean") state.showPlayHistory = saved.showPlayHistory;
  } catch {
    // Ignore storage errors so the static app remains usable in private or restricted browsers.
  }
}

function saveSettings() {
  try {
    localStorage.setItem(settingsStorageKey, JSON.stringify({
      scoringMode: state.scoringMode,
      developerMode: state.developerMode,
      guidanceMode: state.guidanceMode,
      showPlayHistory: state.showPlayHistory
    }));
  } catch {
    // Settings persistence is a convenience, not required for play.
  }
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
  state.animateDeal = true;
  state.finalScore = null;
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

function loadSeedFromInput() {
  const seed = normalizeSeed(els.seedInput.value);
  if (!seed) {
    state.seedMessage = t("seedRequired");
    renderSeedControls();
    return;
  }
  state.seedMessage = t("seedLoaded");
  startHand({ seed, preserveBoard: true });
}

async function copyCurrentSeed() {
  if (!state.dealSeed) return;
  try {
    await copyText(state.dealSeed);
    state.seedMessage = t("seedCopied");
  } catch {
    state.seedMessage = t("seedCopyFailed");
  }
  renderSeedControls();
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  els.seedInput.focus();
  els.seedInput.select();
  if (!document.execCommand("copy")) throw new Error("Copy command failed");
}

function normalizeSeed(seed) {
  return String(seed || "").trim().slice(0, 80);
}

function createDealSeed() {
  if (globalThis.crypto?.getRandomValues) {
    const values = new Uint32Array(2);
    globalThis.crypto.getRandomValues(values);
    return `${values[0].toString(36)}${values[1].toString(36)}`;
  }
  return `${Date.now().toString(36)}${Math.floor(Math.random() * 0xFFFFFFFF).toString(36)}`;
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

function scoreModeName() {
  return {
    duplicate: t("scoringDuplicate"),
    matchpoints: t("scoringMatchpoints"),
    casual: t("scoringCasual")
  }[state.scoringMode];
}

function compareCards(a, b) {
  return bridgeRules.compareCards(a, b);
}

function renderAll() {
  applyStaticText();
  renderHands();
  renderAuction();
  renderBidControls();
  renderHistory();
  renderPlayExplanations();
  renderReview();
  renderContract();
  renderGuidance();
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

function applyStaticText() {
  document.title = t("title");
  els.title.textContent = t("title");
  els.heading.textContent = t("heading");
  els.playMode.textContent = t("playMode");
  els.settingsSummary.setAttribute("aria-label", t("settings"));
  els.settingsSummary.title = t("settings");
  els.scoringModeLabel.textContent = t("scoringMode");
  els.scoringMode.querySelector('[value="duplicate"]').textContent = t("scoringDuplicate");
  els.scoringMode.querySelector('[value="matchpoints"]').textContent = t("scoringMatchpoints");
  els.scoringMode.querySelector('[value="casual"]').textContent = t("scoringCasual");
  els.scoringMode.value = state.scoringMode;
  els.scoringMode.title = t("scoreMode")[state.scoringMode];
  els.scoringMode.querySelector('[value="duplicate"]').title = t("scoreMode").duplicate;
  els.scoringMode.querySelector('[value="matchpoints"]').title = t("scoreMode").matchpoints;
  els.scoringMode.querySelector('[value="casual"]').title = t("scoreMode").casual;
  els.scoringModeDescription.textContent = t("scoreMode")[state.scoringMode];
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
  els.hintButton.setAttribute("aria-label", t("hint"));
}

function renderSeedControls() {
  if (document.activeElement !== els.seedInput) els.seedInput.value = state.dealSeed || "";
  els.copySeed.disabled = !state.dealSeed;
  els.seedDescription.textContent = state.seedMessage || t("seedHelp");
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
  reason.textContent = guidance.reason;
  els.guidancePanel.append(title, reason);
  els.guidancePanel.hidden = false;
}

function currentGuidance() {
  if (state.phase === "bidding" && seatAt(state.turnIndex) === "South") return biddingGuidance();
  if (state.phase === "playing" && isHumanControlledSeat(seatAt(state.turnIndex))) return cardGuidance();
  return null;
}

function biddingGuidance() {
  const bid = chooseRecommendedBid("South");
  return {
    label: t("recommendedBid"),
    action: formatCall(bid),
    reason: recommendedBidReason(bid, "South")
  };
}

function recommendedBidReason(bid, seat) {
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
    reason: explainCardPlayResult(result)
  };
}

function formatCall(call) {
  if (isPass(call)) return t("pass");
  if (isDouble(call)) return t("double");
  if (isRedouble(call)) return t("redouble");
  return formatBid(call);
}

function sameCall(left, right) {
  if (typeof left === "string" || typeof right === "string") return left === right;
  return left?.level === right?.level && left?.strain === right?.strain;
}

function renderHint() {
  els.hintButton.dataset.hint = currentHint();
}

function renderTrickAdvanceHint() {
  els.trickAdvanceHint.hidden = !state.awaitingTrickAdvance;
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

function renderHands() {
  const recommended = state.guidanceMode ? currentRecommendedCard() : null;
  for (const seat of seats) {
    seatEls[seat].innerHTML = "";
    seatEls[seat].classList.toggle("playable", isHumanControlledSeat(seat) && state.phase === "playing");
    const complete = state.phase === "complete";
    const visible = state.developerMode || complete || isSeatVisible(seat);
    const sourceHand = complete ? state.originalHands[seat] : state.hands[seat];
    const cards = sortedHandCards(sourceHand || []);
    if (visible) {
      renderVisibleHandCards(seat, cards, recommended);
    } else {
      cards.forEach((card, index) => {
        seatEls[seat].appendChild(createHandCardEl(seat, card, false, index, recommended));
      });
    }
  }
}

function renderVisibleHandCards(seat, cards, recommended) {
  let animationIndex = 0;
  let hasPreviousSuitSlot = false;
  for (const suit of handSuitOrder) {
    const suitCards = cards.filter((card) => card.suit === suit);
    if (!suitCards.length) {
      seatEls[seat].appendChild(createEmptySuitEl(suit));
      hasPreviousSuitSlot = true;
      continue;
    }

    suitCards.forEach((card, suitIndex) => {
      const cardEl = createHandCardEl(seat, card, true, animationIndex, recommended);
      if (hasPreviousSuitSlot && suitIndex === 0) cardEl.classList.add("suit-start");
      seatEls[seat].appendChild(cardEl);
      animationIndex += 1;
    });
    hasPreviousSuitSlot = true;
  }
}

function createHandCardEl(seat, card, visible, index, recommended) {
  const cardEl = createCardEl(card, visible);
  if (state.animateDeal) {
    cardEl.style.animationDelay = `${index * 26}ms`;
  } else {
    cardEl.classList.add("no-hand-animation");
  }
  if (recommended?.seat === seat && recommended.card.id === card.id) cardEl.classList.add("recommended-card");
  if (visible && isHumanControlledSeat(seat) && state.phase === "playing" && !state.awaitingTrickAdvance) {
    const legal = isLegalCard(seat, card);
    cardEl.classList.add(legal ? "legal" : "illegal");
    if (legal && seatAt(state.turnIndex) === seat) {
      cardEl.tabIndex = 0;
      cardEl.addEventListener("click", () => playCard(seat, card.id));
      cardEl.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") playCard(seat, card.id);
      });
    }
  }
  return cardEl;
}

function createEmptySuitEl(suit) {
  const emptyEl = document.createElement("span");
  emptyEl.className = "suit-empty";
  if (suit === "D" || suit === "H") emptyEl.classList.add("red");
  emptyEl.textContent = suitSymbols[suit];
  emptyEl.setAttribute("aria-label", `geen ${suitName(suit)}`);
  return emptyEl;
}

function sortedHandCards(hand) {
  return [...hand].sort(compareHandCards);
}

function compareHandCards(a, b) {
  const suitDiff = handSuitOrder.indexOf(a.suit) - handSuitOrder.indexOf(b.suit);
  if (suitDiff) return suitDiff;
  return rankOrder.indexOf(b.rank) - rankOrder.indexOf(a.rank);
}

function createCardEl(card, visible = true) {
  const cardEl = document.createElement("div");
  cardEl.className = "card";
  if (!visible) {
    cardEl.classList.add("back");
    return cardEl;
  }
  if (card.suit === "D" || card.suit === "H") cardEl.classList.add("red");
  const label = rankLabel[card.rank] || card.rank;
  cardEl.innerHTML = `
    <div class="rank">${label}${suitSymbols[card.suit]}</div>
    <div class="suit-big">${suitSymbols[card.suit]}</div>
    <div class="mini">${label}${suitSymbols[card.suit]}</div>
  `;
  cardEl.setAttribute("aria-label", `${label} ${suitName(card.suit)}`);
  return cardEl;
}

function renderAuction() {
  els.auctionLog.innerHTML = "";
  renderBidExplanations();
  const headers = ["North", "East", "South", "West"];
  headers.forEach((seat) => {
    const cell = document.createElement("div");
    cell.className = "auction-cell";
    cell.innerHTML = `<strong>${seat.slice(0, 1)}</strong>`;
    els.auctionLog.appendChild(cell);
  });
  const offset = state.dealerIndex;
  for (let i = 0; i < offset; i++) {
    els.auctionLog.appendChild(emptyAuctionCell());
  }
  state.auction.forEach((call) => {
    const cell = document.createElement("div");
    cell.className = "auction-cell";
    cell.appendChild(auctionCallContent(call));
    els.auctionLog.appendChild(cell);
  });
}

function auctionCallContent(call) {
  const wrapper = document.createElement("span");
  wrapper.className = "auction-call";
  if (call.stop) wrapper.appendChild(auctionBadge(t("stop"), "stop"));
  const textEl = document.createElement("span");
  textEl.textContent = formatCall(call.bid);
  wrapper.appendChild(textEl);
  if (call.alert) wrapper.appendChild(auctionBadge(t("alert"), "alert"));
  return wrapper;
}

function auctionBadge(label, kind) {
  const badge = document.createElement("span");
  badge.className = `auction-badge ${kind}`;
  badge.textContent = label;
  return badge;
}

function emptyAuctionCell() {
  const cell = document.createElement("div");
  cell.className = "auction-cell";
  cell.textContent = separatorDot;
  return cell;
}

function renderBidExplanations() {
  els.bidExplanations.hidden = !state.developerMode || !state.auction.length;
  els.bidExplanations.innerHTML = "";
  if (els.bidExplanations.hidden) return;

  state.auction.forEach((call, index) => {
    const item = document.createElement("div");
    item.className = "bid-explanation";
    const callText = formatCall(call.bid);
    item.innerHTML = `<strong>${seatName(call.seat)} ${callText}</strong><br>${explainBid(call, index)}`;
    els.bidExplanations.appendChild(item);
  });
}

function explainBid(call, index) {
  if (isPass(call.bid)) return t("bidExplanationPass");
  if (isDouble(call.bid)) return t("bidExplanationDouble");
  if (isRedouble(call.bid)) return t("bidExplanationRedouble");
  const context = auctionContextAt(index);
  const detail = bidMeaning(call.bid, context);
  return t(detail.key, { detail: detail.text });
}

function auctionContextAt(index) {
  const call = state.auction[index];
  const previous = state.auction.slice(0, index);
  const partnershipCalls = previous.filter((prior) => teamOf(prior.seat) === teamOf(call.seat) && isContractBid(prior.bid));
  const opponentCalls = previous.filter((prior) => teamOf(prior.seat) !== teamOf(call.seat) && isContractBid(prior.bid));
  return {
    partnershipCalls,
    opponentCalls,
    openingBid: partnershipCalls[0]?.bid || null,
    lastPartnerBid: [...previous].reverse().find((prior) => prior.seat === partnerOf(call.seat) && isContractBid(prior.bid))?.bid || null
  };
}

function bidMeaning(bid, context) {
  if (!context.partnershipCalls.length && !context.opponentCalls.length) {
    return { key: "bidExplanationOpening", text: openingBidMeaning(bid) };
  }
  if (context.opponentCalls.length && !context.partnershipCalls.length) {
    return { key: "bidExplanationCompetitive", text: competitiveBidMeaning(bid) };
  }
  const artificial = artificialBidMeaning(bid, context);
  if (artificial) return { key: "bidExplanationArtificial", text: artificial };
  if (context.partnershipCalls.length === 1) {
    return { key: "bidExplanationResponse", text: responseBidMeaning(bid, context.lastPartnerBid || context.openingBid) };
  }
  return { key: "bidExplanationContinuation", text: continuationBidMeaning(bid) };
}

function openingBidMeaning(bid) {
  if (bid.level === 1 && bid.strain === "NT") return "Vijfkaart Hoog: 15-17 punten, SA-verdeling.";
  if (bid.level === 2 && bid.strain === "NT") return "Vijfkaart Hoog: 20-22 punten, SA-verdeling.";
  if (bid.level === 2 && bid.strain === "C") return "Vijfkaart Hoog: sterke kunstmatige opening, 20+ met een kleur of 23+ met SA-verdeling.";
  if (bid.level === 2 && ["D", "H", "S"].includes(bid.strain)) return `zwakke twee in ${suitName(bid.strain)}, ongeveer 5-10 HCP en een zeskaart.`;
  if (bid.level === 3 && bid.strain !== "NT") return `preemptieve opening in ${suitName(bid.strain)}, meestal een lange kleur en beperkte kracht.`;
  if (bid.level === 1 && (bid.strain === "H" || bid.strain === "S")) return `vijfkaart ${suitName(bid.strain)} met openingskracht.`;
  if (bid.level === 1 && bid.strain === "D") return "Vijfkaart Hoog: 12-19 punten met een vierkaart of langer ruiten.";
  if (bid.level === 1 && bid.strain === "C") return "Vijfkaart Hoog: 12-19 punten, kan vanaf een tweekaart klaveren.";
  return "natuurlijk openingsbod.";
}

function artificialBidMeaning(bid, context) {
  const opening = context.openingBid;
  if (!opening) return null;
  if (bidEquals(opening, 1, "NT")) {
    if (bidEquals(bid, 2, "C")) return "Stayman, vraagt de openaar naar een vierkaart hoog.";
    if (bidEquals(bid, 2, "D")) return "Jacoby-transfer, vraagt de openaar harten te bieden.";
    if (bidEquals(bid, 2, "H")) return "Jacoby-transfer, vraagt de openaar schoppen te bieden.";
  }
  if (bidEquals(opening, 2, "NT")) {
    if (bidEquals(bid, 3, "C")) return "Stayman, vraagt de openaar naar een vierkaart hoog.";
    if (bidEquals(bid, 3, "D")) return "transfer, vraagt de openaar harten te bieden.";
    if (bidEquals(bid, 3, "H")) return "transfer, vraagt de openaar schoppen te bieden.";
  }
  if (bidEquals(opening, 2, "C") && bidEquals(bid, 2, "D")) return "afwachtend antwoord op sterke 2K.";
  return null;
}

function responseBidMeaning(bid, partnerBid) {
  if (!partnerBid) return continuationBidMeaning(bid);
  if (partnerBid.strain !== "NT" && bid.strain === partnerBid.strain) return `steun voor partners ${suitName(partnerBid.strain)}.`;
  if (bid.strain === "NT") return "gebalanceerd antwoord, zonder duidelijke fit of nieuwe kleur.";
  return `natuurlijk antwoord in ${suitName(bid.strain)}.`;
}

function continuationBidMeaning(bid) {
  if (bid.strain === "NT") return "natuurlijk sans-atout vervolg.";
  return `natuurlijk vervolg in ${suitName(bid.strain)}.`;
}

function competitiveBidMeaning(bid) {
  if (bid.strain === "NT") return "natuurlijk sans-atout volgbod, met dekking en extra waarden.";
  return `natuurlijk volgbod in ${suitName(bid.strain)}.`;
}

function renderBidControls() {
  els.bidControls.innerHTML = "";
  if (state.phase !== "bidding" || seatAt(state.turnIndex) !== "South") {
    els.bidControls.setAttribute("aria-hidden", "true");
    return;
  }
  els.bidControls.removeAttribute("aria-hidden");
  const recommendedBid = state.guidanceMode ? chooseRecommendedBid("South") : null;

  for (let level = 1; level <= 7; level++) {
    for (const strain of biddingBoxStrains) {
      const bid = { level, strain };
      const button = biddingButton(formatBid(bid), "bid");
      button.classList.add(`strain-${strain.toLowerCase()}`);
      button.disabled = !isBidHigher(bid, highestBid());
      if (sameCall(recommendedBid, bid)) button.classList.add("recommended-action");
      button.addEventListener("click", () => makeBid("South", bid));
      els.bidControls.appendChild(button);
    }
  }

  const stop = biddingButton(t("stop"), "stop");
  stop.setAttribute("aria-label", t("stopAria"));
  stop.classList.toggle("active-action", state.pendingStop);
  stop.addEventListener("click", () => {
    state.pendingStop = !state.pendingStop;
    renderBidControls();
  });

  const double = biddingButton(t("double"), "double");
  double.disabled = !canDouble("South");
  if (sameCall(recommendedBid, "Double")) double.classList.add("recommended-action");
  double.addEventListener("click", () => makeBid("South", "Double"));

  const redouble = biddingButton(t("redouble"), "redouble");
  redouble.disabled = !canRedouble("South");
  if (sameCall(recommendedBid, "Redouble")) redouble.classList.add("recommended-action");
  redouble.addEventListener("click", () => makeBid("South", "Redouble"));

  const alert = biddingButton(t("alert"), "alert");
  alert.setAttribute("aria-label", t("alertAria"));
  alert.classList.toggle("active-action", state.pendingAlert);
  alert.addEventListener("click", () => {
    state.pendingAlert = !state.pendingAlert;
    renderBidControls();
  });

  const pass = biddingButton(t("pass"), "pass");
  if (sameCall(recommendedBid, "Pass")) pass.classList.add("recommended-action");
  pass.addEventListener("click", () => makeBid("South", "Pass"));

  els.bidControls.append(stop, double, redouble, alert, pass);
}

function biddingButton(label, className) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = label;
  return button;
}

function continueAuction() {
  if (state.phase !== "bidding") return;
  const seat = seatAt(state.turnIndex);
  renderAll();
  if (auctionComplete()) {
    finishAuction();
    return;
  }
  if (seat === "South") {
    setStatus("yourCall");
    return;
  }
  window.setTimeout(() => {
    makeBid(seat, chooseBid(seat));
  }, 560);
}

function makeBid(seat, bid) {
  if (state.phase !== "bidding" || seat !== seatAt(state.turnIndex)) return;
  if (isContractBid(bid) && !isBidHigher(bid, highestBid())) return;
  if (bid === "Double" && !canDouble(seat)) return;
  if (bid === "Redouble" && !canRedouble(seat)) return;
  state.auction.push({
    seat,
    bid,
    stop: seat === "South" && state.pendingStop,
    alert: seat === "South" && state.pendingAlert
  });
  state.pendingStop = false;
  state.pendingAlert = false;
  state.turnIndex = (state.turnIndex + 1) % 4;
  renderAll();
  continueAuction();
}

function chooseBid(seat) {
  return bridgeRules.chooseFiveCardHighBid({
    hand: state.hands[seat],
    auction: state.auction,
    seat,
    vulnerability: state.vulnerability,
    scoringMode: state.scoringMode
  });
}

function chooseRecommendedBid(seat) {
  return chooseBid(seat);
}

function canDouble(seat) {
  const contractCall = highestBidCall();
  if (!contractCall || teamOf(contractCall.seat) === teamOf(seat)) return false;
  const contract = highestBid();
  return Boolean(contract && !contract.doubled && !contract.redoubled);
}

function canRedouble(seat) {
  const contractCall = highestBidCall();
  if (!contractCall || teamOf(contractCall.seat) !== teamOf(seat)) return false;
  const contract = highestBid();
  return Boolean(contract?.doubled && !contract.redoubled);
}

function bidEquals(bid, level, strain) {
  return isContractBid(bid) && bid.level === level && bid.strain === strain;
}

function auctionComplete() {
  return bridgeRules.auctionComplete(state.auction);
}

function finishAuction() {
  const bid = highestBid();
  if (!bid) {
    finishPassedOutHand();
    return;
  }
  state.contract = bid;
  state.declarer = findDeclarer(bid);
  state.dummy = partnerOf(state.declarer);
  state.leader = leftOf(state.declarer);
  state.turnIndex = seats.indexOf(state.leader);
  state.phase = "playing";
  renderAll();
  setStatus("lead", { leader: state.leader, declarer: state.declarer, dummy: state.dummy });
  continuePlay();
}

function finishPassedOutHand() {
  state.phase = "complete";
  state.contract = null;
  state.declarer = null;
  state.dummy = null;
  state.leader = null;
  state.finalScore = calculateBridgeScore({
    contract: null,
    scoringMode: state.scoringMode
  });
  state.finalScore.scoreText = `${t("northSouth")} 0 ${separatorDot} ${t("eastWest")} 0`;
  state.finalScore.made = 0;
  state.finalScore.defenders = 0;
  setStatus("fourPasses");
  renderAll();
}

function autoCompleteAuction() {
  let callCount = 0;
  while (state.phase === "bidding" && !auctionComplete() && callCount < 80) {
    const seat = seatAt(state.turnIndex);
    state.auction.push({
      seat,
      bid: legalAutoBid(seat),
      stop: false,
      alert: false
    });
    state.turnIndex = (state.turnIndex + 1) % 4;
    callCount += 1;
  }
  if (state.phase !== "bidding" || !auctionComplete()) return;

  const bid = highestBid();
  if (!bid) {
    finishPassedOutHand();
    return;
  }
  state.contract = bid;
  state.declarer = findDeclarer(bid);
  state.dummy = partnerOf(state.declarer);
  state.leader = leftOf(state.declarer);
  state.turnIndex = seats.indexOf(state.leader);
  state.phase = "playing";
  setStatus("lead", { leader: state.leader, declarer: state.declarer, dummy: state.dummy });
}

function legalAutoBid(seat) {
  const bid = chooseBid(seat);
  if (!bid) return "Pass";
  if (isContractBid(bid)) return isBidHigher(bid, highestBid()) ? bid : "Pass";
  if (bid === "Double") return canDouble(seat) ? bid : "Pass";
  if (bid === "Redouble") return canRedouble(seat) ? bid : "Pass";
  return "Pass";
}

function findDeclarer(contract) {
  return bridgeRules.findDeclarer(state.auction, contract);
}

function autoCompletePlay() {
  let playCount = 0;
  while (state.phase === "playing" && playCount < 60) {
    if (state.hands.South.length === 0 && state.currentTrick.length === 0) {
      finishHand();
      return;
    }
    const seat = seatAt(state.turnIndex);
    const card = chooseCard(seat);
    if (!autoPlayCard(seat, card)) return;
    playCount += 1;
  }
}

function autoPlayCard(seat, card) {
  if (state.phase !== "playing" || seat !== seatAt(state.turnIndex)) return false;
  if (!card || !isLegalCard(seat, card)) return false;

  const ruleResult = chooseCardPlayResult(seat);
  const explanation = explainCardPlay(seat, card, ruleResult);
  state.hands[seat] = state.hands[seat].filter((item) => item.id !== card.id);
  state.currentTrick.push({ seat, card });
  if (explanation) {
    state.playExplanations.push({
      trick: state.trickHistory.length + 1,
      seat,
      card,
      ruleId: ruleResult?.ruleId || null,
      confidence: ruleResult?.confidence || null,
      recommendedCard: ruleResult?.card || null,
      text: explanation
    });
  }

  if (state.currentTrick.length === 4) {
    const winner = currentWinningPlay()?.seat;
    if (!winner) return false;
    state.awaitingTrickAdvance = false;
    state.trickAdvanceArmed = false;
    state.pendingTrickWinner = null;
    state.tricks[teamOf(winner)] += 1;
    state.trickHistory.push({
      winner,
      cards: [...state.currentTrick],
      number: state.trickHistory.length + 1
    });
    state.currentTrick = [];
    clearTrickSlots();
    state.turnIndex = seats.indexOf(winner);
    setStatus("winsTrick", { seat: winner, number: state.trickHistory.length });
    return true;
  }

  state.turnIndex = (state.turnIndex + 1) % 4;
  return true;
}

function continuePlay() {
  if (state.phase !== "playing") return;
  if (state.awaitingTrickAdvance) return;
  if (state.hands.South.length === 0 && state.currentTrick.length === 0) {
    finishHand();
    return;
  }
  const seat = seatAt(state.turnIndex);
  renderAll();
  if (isHumanControlledSeat(seat)) {
    setStatus("yourPlay");
    return;
  }
  window.setTimeout(() => {
    const card = chooseCard(seat);
    if (!card) return;
    playCard(seat, card.id);
  }, seat === state.dummy ? 480 : 680);
}

function chooseCard(seat) {
  return chooseCardPlayResult(seat)?.card || legalCards(seat)[0] || null;
}

function chooseCardPlayResult(seat) {
  if (!state.contract || !state.hands[seat]) return null;
  const declarerSide = state.declarer && teamOf(seat) === teamOf(state.declarer);
  return bridgeRules.chooseCardPlay({
    hand: state.hands[seat],
    partnerHand: declarerSide ? state.hands[partnerOf(seat)] : null,
    currentTrick: state.currentTrick,
    trickHistory: state.trickHistory,
    seat,
    declarer: state.declarer,
    dummy: state.dummy,
    contract: state.contract,
    trump: state.contract.strain === "NT" ? null : state.contract.strain
  });
}

function currentRecommendedCard() {
  if (state.phase !== "playing" || state.awaitingTrickAdvance) return null;
  const seat = seatAt(state.turnIndex);
  if (!isHumanControlledSeat(seat)) return null;
  const result = chooseCardPlayResult(seat);
  return result?.card ? { seat, card: result.card, result } : null;
}

function isHumanControlledSeat(seat) {
  if (state.phase !== "playing") return seat === "South";
  if (teamOf(state.declarer) === "NS") return teamOf(seat) === "NS";
  return seat === "South";
}

function isSeatVisible(seat) {
  if (seat === "South") return true;
  if (state.phase !== "playing") return false;
  if (seat === state.dummy) return openingLeadHasBeenMade();
  return isHumanControlledSeat(seat);
}

function openingLeadHasBeenMade() {
  return state.currentTrick.length > 0 || state.trickHistory.length > 0;
}

function explainCardPlay(seat, card, result = chooseCardPlayResult(seat)) {
  if (!result?.card) return "";
  const humanChoice = isHumanControlledSeat(seat);
  const base = humanChoice ? "Gekozen kaart" : "AI-kaart";
  const ruleText = `${explainCardPlayResult(result)} Regel: ${result.ruleId}; zekerheid: ${confidenceName(result.confidence)}.`;

  if (result.card.id === card.id) return `${base}: ${ruleText}`;
  return `${base}: ${seatName(seat)} speelde ${cardText(card)}. De regel stelde ${cardText(result.card)} voor: ${ruleText}`;
}

function explainCardPlayResult(result) {
  const ruleName = result.ruleId.split(".").pop();
  if (ruleName === "longestSuitLead") {
    return `Speel de hoogste kaart uit de langste kleur (${suitName(result.suit)}, ${result.suitLength} kaarten).`;
  }
  if (ruleName === "finesseTowardHonor") {
    const finesse = rankLabel[result.finesseRank] || result.finesseRank;
    const missing = rankLabel[result.missingHonor] || result.missingHonor;
    return `Speel laag naar de ${finesse} in ${suitName(result.suit)} om op de ontbrekende ${missing} te snijden${finesseEntryText(result)}.`;
  }
  if (ruleName === "doubleFinesseTowardHonor") {
    const finesse = rankLabel[result.finesseRank] || result.finesseRank;
    const missing = (result.missingHonors || [result.missingHonor])
      .filter(Boolean)
      .map((rank) => rankLabel[rank] || rank)
      .join(" en ");
    return `Speel laag naar de ${finesse} in ${suitName(result.suit)} voor een dubbele snit tegen ${missing}${finesseEntryText(result)}.`;
  }
  if (ruleName === "developLongSuit") {
    const missing = rankLabel[result.missingStopper] || result.missingStopper;
    if (result.action === "leadTowardLongSuit") {
      return `Speel naar partners lange ${suitName(result.suit)} om de ontbrekende ${missing} eruit te werken en latere slagen te ontwikkelen.`;
    }
    return `Ontwikkel de lange ${suitName(result.suit)} door de ontbrekende ${missing} eruit te werken.`;
  }
  if (ruleName === "lowestLead") return "Speel eenvoudig voor met de laagste legale kaart.";
  if (ruleName === "partnerWinningLow") return "Partner ligt voorlopig voor in de slag, dus speel laag en spaar hogere kaarten.";
  if (ruleName === "cheapestWinner") return "Win de slag voorlopig met de goedkoopste winnende kaart.";
  if (ruleName === "lowestFollow") return "Bekennen is verplicht; omdat winnen niet kan, speel je de laagste kaart in de gevraagde kleur.";
  if (ruleName === "lowestDiscard") return "Bekennen kan niet en winnen lukt niet, dus gooi de laagste legale kaart af.";
  return result.reason || "Speel de kaart die deze heuristiek kiest.";
}

function finesseEntryText(result) {
  const entryRank = rankLabel[result.entryRank] || result.entryRank;
  if (!entryRank) return "";
  if (result.entryType === "sideAce") return `; de honneurhand heeft nog een entree via ${entryRank}${suitSymbols[result.entrySuit] || ""}`;
  if (result.entryType === "sameSuit") return `; dezelfde kleur geeft nog een entree via de ${entryRank}`;
  return "";
}

function confidenceName(confidence) {
  return {
    basic: "basis",
    uncertain: "onzeker",
    advanced: "gevorderd"
  }[confidence] || confidence || "onbekend";
}

function playCard(seat, cardId) {
  if (state.phase !== "playing" || seat !== seatAt(state.turnIndex)) return;
  if (state.awaitingTrickAdvance) return;
  const card = state.hands[seat].find((item) => item.id === cardId);
  if (!card || !isLegalCard(seat, card)) return;
  const ruleResult = chooseCardPlayResult(seat);
  const explanation = explainCardPlay(seat, card, ruleResult);
  state.hands[seat] = state.hands[seat].filter((item) => item.id !== cardId);
  state.currentTrick.push({ seat, card });
  if (explanation) {
    state.playExplanations.push({
      trick: state.trickHistory.length + 1,
      seat,
      card,
      ruleId: ruleResult?.ruleId || null,
      confidence: ruleResult?.confidence || null,
      recommendedCard: ruleResult?.card || null,
      text: explanation
    });
  }
  renderHands();
  renderPlayedCard(seat, card);
  setStatus("played", { seat, card: cardText(card) });
  if (state.currentTrick.length === 4) {
    pauseCompletedTrick();
  } else {
    state.turnIndex = (state.turnIndex + 1) % 4;
    continuePlay();
  }
}

function renderPlayedCard(seat, card) {
  slotEls[seat].innerHTML = "";
  const cardEl = createCardEl(card, true);
  cardEl.classList.add("played");
  slotEls[seat].appendChild(cardEl);
}

function pauseCompletedTrick() {
  const winner = currentWinningPlay();
  state.pendingTrickWinner = winner.seat;
  state.awaitingTrickAdvance = true;
  state.trickAdvanceArmed = false;
  setStatus("winsTrick", { seat: winner.seat, number: state.trickHistory.length + 1 });
  renderTrickAdvanceHint();
  window.setTimeout(() => {
    state.trickAdvanceArmed = true;
  }, 0);
}

function advanceCompletedTrick() {
  if (!state.awaitingTrickAdvance || !state.currentTrick.length) return;
  const winner = state.pendingTrickWinner || currentWinningPlay().seat;
  state.awaitingTrickAdvance = false;
  state.trickAdvanceArmed = false;
  state.pendingTrickWinner = null;
  const team = teamOf(winner);
  state.tricks[team] += 1;
  state.trickHistory.push({
    winner,
    cards: [...state.currentTrick],
    number: state.trickHistory.length + 1
  });
  state.currentTrick = [];
  clearTrickSlots();
  state.turnIndex = seats.indexOf(winner);
  setStatus("winsTrick", { seat: winner, number: state.trickHistory.length });
  renderAll();
  continuePlay();
}

function clearTrickSlots() {
  Object.values(slotEls).forEach((slot) => {
    slot.innerHTML = "";
  });
}

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
  item.innerHTML = `<strong>${t("trick")} ${explanation.trick}: ${seatName(explanation.seat)} ${cardText(explanation.card)}</strong><br>${explanation.text}`;
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
    [t("board"), state.dealNumber],
    [t("seed"), state.dealSeed || t("none")],
    [t("declarer"), passOut ? t("none") : seatName(state.declarer)],
    [t("dummy"), passOut ? t("none") : seatName(state.dummy)],
    [t("vulnerability"), vulnerabilityName()],
    [t("scoringMode"), scoreModeName()],
    [t("openingLead"), openingPlay ? `${seatName(openingPlay.seat)} ${cardText(openingPlay.card)}` : t("none")],
    [t("result"), resultText],
    [t("bridgeScore"), state.finalScore.scoreText]
  ].forEach(([label, value]) => els.reviewSummary.appendChild(reviewRow(label, value)));

  els.reviewTricks.innerHTML = "";
  els.reviewTricks.appendChild(reviewSectionTitle(t("trickOverview")));
  els.reviewTricks.appendChild(reviewTricksTable());
  if (state.developerMode && state.playExplanations.length) {
    els.reviewTricks.appendChild(reviewSectionTitle(t("playExplanations")));
    state.playExplanations.forEach((explanation) => {
      els.reviewTricks.appendChild(reviewRow(`${t("trick")} ${explanation.trick}: ${seatName(explanation.seat)} ${cardText(explanation.card)}`, explanation.text));
    });
  }
}

function reviewSectionTitle(label) {
  const title = document.createElement("h3");
  title.className = "review-section-title";
  title.textContent = label;
  return title;
}

function reviewRow(label, value) {
  const row = document.createElement("div");
  row.className = "review-row";
  const labelEl = document.createElement("strong");
  const valueEl = document.createElement("span");
  labelEl.textContent = label;
  valueEl.textContent = value;
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
  state.trickHistory.forEach((trick) => {
    const row = document.createElement("tr");
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
    scoringMode: state.scoringMode
  });
  state.finalScore.made = made;
  state.finalScore.defenders = state.tricks[defenders];
}

function calculateBridgeScore({ contract, declarer, tricksMade, vulnerability, scoringMode }) {
  return bridgeRules.calculateBridgeScore({ contract, declarer, tricksMade, vulnerability, scoringMode });
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

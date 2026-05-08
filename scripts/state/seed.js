const situationCodec = globalThis.BridgeSituationCodec;
if (!situationCodec) throw new Error("situation-codec.js must load before seed.js");
const normalizeSeed = situationCodec.normalizeSeed;
const isSituationSeed = situationCodec.isSituationSeed;

function loadSeedFromInput() {
  const seed = normalizeSeed(els.seedInput.value);
  if (!seed) {
    state.seedMessage = t("seedRequired");
    renderSeedControls();
    return;
  }
  if (isSituationSeed(seed)) {
    const previousState = cloneStateForSeedRestore();
    try {
      startSituationSeed(seed);
    } catch {
      restoreStateFromSeedSnapshot(previousState);
      state.seedMessage = t("situationSeedInvalid");
      renderRestoredSituation();
    }
    return;
  }
  state.seedMessage = t("seedLoaded");
  if (globalThis.PracticeHands?.findPracticeHand(seed)) {
    startPracticeHand(seed, { preserveBoard: true });
    return;
  }
  startHand({ seed, preserveBoard: true });
}

async function copyCurrentSeed() {
  const repeatCode = currentRepeatCode();
  if (!repeatCode) return;
  try {
    await copyText(repeatCode);
    state.seedMessage = t("seedCopied");
  } catch {
    state.seedMessage = t("seedCopyFailed");
  }
  renderSeedControls();
}

function currentRepeatCode() {
  try {
    return createSituationSeed() || "";
  } catch {
    return "";
  }
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.inset = "0 auto auto 0";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    if (!document.execCommand("copy")) throw new Error("Copy command failed");
  } finally {
    textarea.remove();
  }
}

function cloneStateForSeedRestore() {
  return JSON.parse(JSON.stringify(state));
}

function restoreStateFromSeedSnapshot(snapshot) {
  Object.keys(state).forEach((key) => {
    if (!Object.prototype.hasOwnProperty.call(snapshot, key)) delete state[key];
  });
  Object.assign(state, snapshot);
}

function createSituationSeed() {
  if (!state.dealSeed) return "";
  const payload = {
    v: 1,
    seed: state.dealSeed,
    board: state.dealNumber,
    dealer: seatCode(seatAt(state.dealerIndex)),
    vul: state.vulnerability,
    phase: state.phase,
    turn: seatCode(seatAt(state.turnIndex)),
    auction: state.auction.map(encodeSituationCall),
    tricks: state.trickHistory.map((trick) => trick.cards.map(encodeSituationPlay)),
    current: state.currentTrick.map(encodeSituationPlay),
    awaiting: state.awaitingTrickAdvance ? 1 : 0
  };
  return situationCodec.encodeSituationPayload(payload);
}

function startSituationSeed(seed) {
  const situation = parseSituationSeed(seed);
  if (!situation?.seed) throw new Error("Situation seed is missing the base seed");

  state.dealNumber = positiveBoardNumber(situation.board);
  state.dealSeed = String(situation.seed);
  const dealer = seatFromCode(situation.dealer) || seatAt(dealerIndexForDeal(state.dealNumber));
  const vulnerability = normalizeVulnerability(situation.vul) || vulnerabilityForDeal(state.dealNumber);
  const scenario = globalThis.PracticeHands?.findPracticeHand(state.dealSeed)
    ? globalThis.PracticeHands.preparePracticeHand(state.dealSeed)
    : null;
  const hands = scenario ? scenario.hands : dealHands(state.dealSeed);
  const practice = scenario ? practiceStateFromScenario(scenario) : null;

  startPreparedHand({
    dealerIndex: seats.indexOf(dealer),
    vulnerability,
    hands,
    practice,
    skipFlow: true
  });
  state.animateDeal = false;
  state.seedMessage = t("situationSeedLoaded");

  restoreSituationAuction(situation.auction || []);
  restoreSituationPlay(situation);
  setSituationStatus(situation.phase);
  renderRestoredSituation();
}

function parseSituationSeed(seed) {
  return situationCodec.parseSituationSeed(seed);
}

function restoreSituationAuction(auction) {
  state.auction = [];
  for (const encodedCall of auction) {
    const seat = seatFromCode(encodedCall.s) || seatAt(state.turnIndex);
    if (seat !== seatAt(state.turnIndex)) throw new Error("Situation auction is out of order");
    const bid = bidFromSituationText(encodedCall.b);
    const bidResult = chooseBidResult(seat);
    const call = {
      seat,
      bid,
      stop: Boolean(encodedCall.o),
      alert: Boolean(encodedCall.a)
    };
    if (bidResult && sameCall(bidResult.bid, bid)) call.bidResult = bidResult;
    if (bidResult && !sameCall(bidResult.bid, bid)) call.recommendedBidResult = bidResult;
    state.auction.push(call);
    state.turnIndex = (state.turnIndex + 1) % seats.length;
  }

  if (!auctionComplete()) {
    state.phase = "bidding";
    return;
  }

  const bid = highestBid();
  if (!bid) {
    state.phase = "complete";
    state.contract = null;
    state.declarer = null;
    state.dummy = null;
    state.leader = null;
    state.finalScore = calculateBridgeScore({ contract: null });
    state.finalScore.scoreText = `${t("northSouth")} 0 ${separatorDot} ${t("eastWest")} 0`;
    state.finalScore.made = 0;
    state.finalScore.defenders = 0;
    return;
  }

  state.contract = bid;
  state.declarer = findDeclarer(bid);
  state.dummy = partnerOf(state.declarer);
  state.leader = leftOf(state.declarer);
  state.turnIndex = seats.indexOf(state.leader);
  state.phase = "playing";
}

function restoreSituationPlay(situation) {
  if (state.phase !== "playing") {
    if (situation.phase === "complete" && !state.contract) setStatus("fourPasses");
    return;
  }

  (situation.tricks || []).forEach((trick) => {
    trick.forEach((play) => restoreSituationPlayCard(play));
    completeRestoredTrick();
  });

  (situation.current || []).forEach((play) => restoreSituationPlayCard(play));

  if (state.currentTrick.length === 4) {
    const winner = currentWinningPlay()?.seat;
    if (!winner) throw new Error("Situation current trick has no winner");
    if (situation.awaiting) {
      state.awaitingTrickAdvance = true;
      state.trickAdvanceArmed = true;
      state.pendingTrickWinner = winner;
    } else {
      completeRestoredTrick();
    }
  }

  if (situation.phase === "complete") {
    finishRestoredHand();
  }
}

function restoreSituationPlayCard(encodedPlay) {
  const seat = seatFromCode(encodedPlay.s) || seatAt(state.turnIndex);
  if (seat !== seatAt(state.turnIndex)) throw new Error("Situation play is out of order");
  const card = state.hands[seat]?.find((item) => item.id === normalizeCardId(encodedPlay.c));
  if (!card || !isLegalCard(seat, card)) throw new Error("Situation card is not playable");
  const ruleResult = chooseCardPlayResult(seat);
  const explanation = explainCardPlay(seat, card, ruleResult);
  Object.assign(state, BridgeStateTransitions.applyCardPlayTransition(state, { seat, card, ruleResult, explanation }));
  ensurePlayPlan();
  if (state.currentTrick.length < 4) state.turnIndex = (state.turnIndex + 1) % seats.length;
}

function completeRestoredTrick() {
  if (state.currentTrick.length !== 4) throw new Error("Situation trick is incomplete");
  const winner = currentWinningPlay()?.seat;
  if (!winner) throw new Error("Situation trick has no winner");
  Object.assign(state, BridgeStateTransitions.advanceCompletedTrickTransition(state, {
    winner,
    winningTeam: teamOf(winner),
    seats
  }));
  ensurePlayPlan();
}

function finishRestoredHand() {
  state.phase = "complete";
  if (!state.contract) return;
  recomputeFinalScore();
  const needed = state.contract.level + 6;
  const made = state.finalScore.made;
  const resultKey = made >= needed ? "made" : "down";
  const resultArgs = made >= needed ? { over: made - needed } : { under: needed - made };
  state.status = { key: "contractResult", args: { contract: formatBid(state.contract), declarer: state.declarer, resultKey, resultArgs } };
}

function setSituationStatus(sourcePhase) {
  if (state.awaitingTrickAdvance && state.pendingTrickWinner) {
    setStatus("winsTrick", { seat: state.pendingTrickWinner, number: state.trickHistory.length + 1 });
    return;
  }
  if (state.phase === "complete") {
    if (!state.contract) {
      setStatus("fourPasses");
      return;
    }
    if (state.status.key === "contractResult") return;
    finishRestoredHand();
    return;
  }
  if (state.phase === "playing") {
    if (!openingLeadHasBeenMade()) {
      setStatus("lead", { leader: state.leader, declarer: state.declarer, dummy: state.dummy });
      return;
    }
    if (isHumanControlledSeat(seatAt(state.turnIndex))) {
      setStatus("yourPlay");
      return;
    }
    setStatus("situationTurn", { seat: seatAt(state.turnIndex) });
    return;
  }
  if (sourcePhase === "bidding" && seatAt(state.turnIndex) === "South") {
    setStatus("yourCall");
    return;
  }
  setStatus("situationTurn", { seat: seatAt(state.turnIndex) });
}

function renderRestoredSituation() {
  renderAll();
  clearTrickSlots();
  state.currentTrick.forEach((play) => renderPlayedCard(play.seat, play.card));
  renderTrickSlotFocus();
  renderTrickAdvanceHint();
}

function encodeSituationCall(call) {
  const encoded = {
    s: seatCode(call.seat),
    b: bidToSituationText(call.bid)
  };
  if (call.stop) encoded.o = 1;
  if (call.alert) encoded.a = 1;
  return encoded;
}

function encodeSituationPlay(play) {
  return {
    s: seatCode(play.seat),
    c: play.card.id
  };
}

function bidToSituationText(bid) {
  if (isPass(bid)) return "P";
  if (isDouble(bid)) return "X";
  if (isRedouble(bid)) return "XX";
  if (isContractBid(bid)) return `${bid.level}${bid.strain}`;
  return "";
}

function bidFromSituationText(text) {
  const call = String(text || "").trim().toUpperCase();
  if (call === "P" || call === "PASS" || call === "PAS") return bridgeRules.Pass();
  if (call === "X" || call === "DOUBLE" || call === "DBL") return bridgeRules.Double();
  if (call === "XX" || call === "REDOUBLE" || call === "RDBL") return bridgeRules.Redouble();
  const match = call.match(/^([1-7])(C|D|H|S|NT|SA)$/);
  if (!match) throw new Error("Invalid situation call");
  return bridgeRules.Bid(Number(match[1]), match[2] === "SA" ? "NT" : match[2]);
}

function normalizeCardId(id) {
  const normalized = String(id || "").trim().toUpperCase().replace(/^10/, "T");
  if (!/^(?:[2-9TJQKA])(?:C|D|H|S)$/.test(normalized)) throw new Error("Invalid situation card");
  return normalized;
}

function seatCode(seat) {
  return { North: "N", East: "E", South: "S", West: "W" }[seat] || "";
}

function seatFromCode(code) {
  return {
    N: "North",
    NORTH: "North",
    NOORD: "North",
    E: "East",
    EAST: "East",
    OOST: "East",
    S: "South",
    SOUTH: "South",
    ZUID: "South",
    W: "West",
    WEST: "West"
  }[String(code || "").trim().toUpperCase()] || null;
}

function positiveBoardNumber(board) {
  const number = Number(board);
  return Number.isInteger(number) && number > 0 ? number : Math.max(1, state.dealNumber || 1);
}

function normalizeVulnerability(vulnerability) {
  return ["none", "NS", "EW", "both"].includes(vulnerability) ? vulnerability : null;
}

function createDealSeed() {
  if (globalThis.crypto?.getRandomValues) {
    const values = new Uint32Array(2);
    globalThis.crypto.getRandomValues(values);
    return `${values[0].toString(36)}${values[1].toString(36)}`;
  }
  return `${Date.now().toString(36)}${Math.floor(Math.random() * 0xFFFFFFFF).toString(36)}`;
}

function renderSeedControls() {
  const repeatCode = currentRepeatCode();
  if (document.activeElement !== els.seedInput) els.seedInput.value = repeatCode;
  els.copySeed.disabled = !repeatCode;
  els.seedDescription.textContent = state.seedMessage || t("seedHelp");
}

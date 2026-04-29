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
  state.currentTrick.push({ seat, card, ruleId: ruleResult?.ruleId || null });
  ensurePlayPlan();
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
    ensurePlayPlan();
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
    if (!openingLeadHasBeenMade()) {
      setStatus("yourOpeningLead");
      return;
    }
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
  const dummyVisible = openingLeadHasBeenMade();
  const playPlan = declarerSide && dummyVisible ? ensurePlayPlan() : null;
  return bridgeRules.chooseCardPlay({
    hand: state.hands[seat],
    partnerHand: declarerSide && dummyVisible ? state.hands[partnerOf(seat)] : null,
    dummyHand: dummyVisible && state.dummy ? state.hands[state.dummy] : null,
    currentTrick: state.currentTrick,
    trickHistory: state.trickHistory,
    seat,
    declarer: state.declarer,
    dummy: state.dummy,
    contract: state.contract,
    trump: state.contract.strain === "NT" ? null : state.contract.strain,
    playPlan
  });
}

function currentRecommendedCard() {
  if (state.phase !== "playing" || state.awaitingTrickAdvance || state.currentTrick.length >= 4) return null;
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
  const ruleText = `${explainCardPlayResult(result)}${playPlanReferenceText(result)} Regel: ${result.ruleId}; zekerheid: ${confidenceName(result.confidence)}.`;

  if (result.card.id === card.id) return `${base}: ${ruleText}`;
  const actor = humanChoice ? "Je kaart" : `${seatName(seat)}s kaart`;
  return `${base}: ${actor} wijkt af van de speelheuristiek. ${seatName(seat)} speelde ${cardText(card)}. De heuristiek stelde ${cardText(result.card)} voor: ${ruleText}`;
}

function explainCardPlayResult(result) {
  const ruleName = result.ruleId.split(".").pop();
  if (ruleName === "drawTrumps") {
    if (result.timing === "limitedBeforeRuff") {
      return `Trek nu maximaal ${result.roundLimit} ronde troef, maar bewaar troef bij ${seatName(result.preserveSeat)} voor de geplande introever.`;
    }
    const timing = result.timing === "afterRuff"
      ? "na de geplande introever"
      : result.timing === "afterLongSuitRuff"
        ? "nadat de lange zijkleur is vrijgetroefd"
        : result.timing === "afterUnblock"
          ? "na het deblokkeren"
          : result.timing === "afterUrgentDiscard"
            ? "nadat eerst een verliezer op een hoge bijkleur is weggegooid"
            : "nu";
    return `Trek ${suitName(result.suit)} ${timing} door een hoge troef voor te spelen.`;
  }
  if (ruleName === "discardLoserOnWinner") {
    const ranks = result.cashRanks?.map((rank) => rankLabel[rank] || rank).join(", ");
    return `Speel eerst de hoge ${suitName(result.suit)}${ranks ? ` (${ranks})` : ""}, zodat er een verliezer in ${suitName(result.attackedSuit)} weg kan voordat je troef trekt.`;
  }
  if (ruleName === "ruffShortSuit") {
    return `Speel ${suitName(result.suit)} zodat ${seatName(result.shortSeat)} kan introeven.`;
  }
  if (ruleName === "enterLongTrumpHand") {
    const rank = rankLabel[result.entryRank] || result.entryRank;
    return `Speel laag ${suitName(result.entrySuit)} naar de ${rank} van ${seatName(result.targetSeat)} zodat die daarna ${suitName(result.suit)} kan naspelen voor de introever.`;
  }
  if (ruleName === "establishLongSuitByRuffing") {
    return `Speel de lange ${suitName(result.suit)} van ${seatName(result.longSeat)} door voordat je alle troeven trekt; er blijven troeven nodig om die kleur vrij te troeven.`;
  }
  if (ruleName === "enterLongSuitHand") {
    const rank = rankLabel[result.entryRank] || result.entryRank;
    return `Speel laag ${suitName(result.entrySuit)} naar de ${rank} van ${seatName(result.targetSeat)} om de lange ${suitName(result.suit)} verder vrij te troeven.`;
  }
  if (ruleName === "ruffOutLongSuit") {
    return `Troef ${suitName(result.suit)} in ${seatName(result.shortSeat)} om de lange kleur van ${seatName(result.longSeat)} vrij te spelen.`;
  }
  if (ruleName === "cashSureWinners") return "Speel een hoge zekere slag uit voordat je een nieuwe kleur openbreekt.";
  if (ruleName === "longestSuitLead") {
    return `Speel de hoogste kaart uit de langste kleur (${suitName(result.suit)}, ${result.suitLength} kaarten).`;
  }
  if (ruleName === "notrumpSequenceLead") {
    return `Kom tegen sans-atout met de hoogste kaart uit de serie in ${suitName(result.suit)}.`;
  }
  if (ruleName === "notrumpBrokenSequenceLead") {
    const missing = rankLabel[result.missingRank] || result.missingRank;
    return `Kom tegen sans-atout met de hoogste kaart uit de gebroken serie in ${suitName(result.suit)}${missing ? `; de ${missing} ontbreekt` : ""}.`;
  }
  if (ruleName === "notrumpLowPromisesHonor") {
    return `Kom tegen sans-atout laag uit je langste kleur: kleintje belooft plaatje.`;
  }
  if (ruleName === "notrumpHighMiddleDeniesHonor") {
    return `Kom tegen sans-atout met de hoogste middenkaart uit je langste kleur: die ontkent een plaatje.`;
  }
  if (ruleName === "suitContractSequenceLead") {
    return `Kom tegen een kleurcontract met de hoogste kaart uit de honneurserie in ${suitName(result.suit)}.`;
  }
  if (ruleName === "suitContractSingletonLead") {
    return `Kom tegen een kleurcontract met je singleton in ${suitName(result.suit)}.`;
  }
  if (ruleName === "suitContractDoubletonLead") {
    return `Kom tegen een kleurcontract met de hoogste kaart van je doubleton in ${suitName(result.suit)}.`;
  }
  if (ruleName === "suitContractFourthBestLead") {
    return `Kom tegen een kleurcontract met de vierde kaart van boven uit je lengte in ${suitName(result.suit)}.`;
  }
  if (ruleName === "suitContractLowFromThreeSmall") {
    return `Kom tegen een kleurcontract laag uit drie kleintjes in ${suitName(result.suit)}.`;
  }
  if (ruleName === "thirdHandHighOverLowLead") {
    const preserve = result.higherPlayed?.length ? "; hogere kaarten zijn al zichtbaar gevallen, dus een goedkopere honneur is genoeg" : " en bewaart hogere kaarten als dat kan";
    return `Partner kwam laag uit tegen sans-atout: derde hand probeert de slag in ${suitName(result.leadSuit)} goedkoop te winnen${preserve}.`;
  }
  if (ruleName === "secondHandLow") {
    return `Tweede hand speelt laag in ${suitName(result.leadSuit)}: geen honneur onnodig opofferen als partner nog kan helpen of de dekking niets oplevert.`;
  }
  if (ruleName === "secondHandSequenceHigh") {
    return `Tweede hand speelt hoog uit de honneurserie in ${suitName(result.leadSuit)}.`;
  }
  if (ruleName === "secondHandCoverHonor") {
    const covered = rankLabel[result.coveredRank] || result.coveredRank;
    const promoted = rankLabel[result.promotedRank] || result.promotedRank;
    return `Tweede hand dekt de ${covered} met een honneur omdat dummy de aansluitende ${promoted} toont.`;
  }
  if (ruleName === "thirdHandHighCheapest") {
    const visible = result.higherPlayed?.length ? " De al gespeelde hoge kaarten maken een goedkopere winnaar veilig genoeg." : "";
    return `Derde hand speelt hoog, maar met de goedkoopste kaart die de slag voorlopig kan winnen.${visible}`;
  }
  if (ruleName === "returnPartnerLeadSuit") {
    const lead = result.leadCard ? `${rankLabel[result.leadCard.rank] || result.leadCard.rank}${suitSymbols[result.leadCard.suit] || ""}` : suitName(result.suit);
    const sequence = result.returnType === "honorSequence" && result.sequence ? ` met de hoogste kaart van je serie (${result.sequence})` : "";
    return `Partner kwam in de eerste slag uit met ${lead}. Speel die kleur (${suitName(result.suit)}) terug${sequence}, zolang er geen sterker plan is.`;
  }
  if (ruleName === "holdUpStopper") {
    const stopper = rankLabel[result.stopperRank] || result.stopperRank;
    return `Houd de ${stopper} in ${suitName(result.suit)} nog vast en speel laag, zodat de tegenspelers hun kleur minder makkelijk kunnen vrijspelen.`;
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
  if (ruleName === "repeatFinesse") {
    const finesse = rankLabel[result.finesseRank] || result.finesseRank;
    const missing = rankLabel[result.missingHonor] || result.missingHonor;
    return `Herhaal de snit: speel laag naar de ${finesse} in ${suitName(result.suit)} zolang de ${missing} nog niet is gevallen${finesseEntryText(result)}.`;
  }
  if (ruleName === "twoWayFinesse") {
    const finesse = rankLabel[result.finesseRank] || result.finesseRank;
    const missing = rankLabel[result.missingHonor] || result.missingHonor;
    return `Speel de tweerichtingssnit in ${suitName(result.suit)} richting ${seatName(result.targetSeat)} naar de ${finesse}; de ${missing} ontbreekt nog${finesseEntryText(result)}.`;
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

function showIllegalCardFeedback(seat, card) {
  state.illegalActionFeedback = illegalCardFeedbackText(seat, card);
  renderIllegalActionFeedback();
  if (illegalActionFeedbackTimer) window.clearTimeout(illegalActionFeedbackTimer);
  illegalActionFeedbackTimer = window.setTimeout(() => {
    state.illegalActionFeedback = null;
    renderIllegalActionFeedback();
    illegalActionFeedbackTimer = null;
  }, 2200);
}

function illegalCardFeedbackText(seat, card) {
  if (state.awaitingTrickAdvance) return t("illegalCardWaitTrick");
  const turnSeat = seatAt(state.turnIndex);
  if (seat !== turnSeat) return t("illegalCardWrongTurn", { seat: seatName(seat), turn: seatName(turnSeat) });
  if (state.currentTrick.length && card) {
    const leadSuit = state.currentTrick[0].card.suit;
    const canFollow = state.hands[seat]?.some((heldCard) => heldCard.suit === leadSuit);
    if (canFollow && card.suit !== leadSuit) return t("illegalCardFollowSuit", { suit: suitName(leadSuit) });
  }
  return t("illegalCardGeneric");
}

function playCard(seat, cardId) {
  if (state.phase !== "playing" || seat !== seatAt(state.turnIndex)) return;
  if (state.awaitingTrickAdvance) {
    showIllegalCardFeedback(seat, null);
    return;
  }
  const card = state.hands[seat].find((item) => item.id === cardId);
  if (!card || !isLegalCard(seat, card)) {
    showIllegalCardFeedback(seat, card);
    return;
  }
  state.illegalActionFeedback = null;
  renderIllegalActionFeedback();
  const ruleResult = chooseCardPlayResult(seat);
  const explanation = explainCardPlay(seat, card, ruleResult);
  state.hands[seat] = state.hands[seat].filter((item) => item.id !== cardId);
  state.currentTrick.push({ seat, card, ruleId: ruleResult?.ruleId || null });
  ensurePlayPlan();
  renderPlayPlan();
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
  renderTrickSlotFocus();
  renderGuidance();
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

(function registerBridgePlayFlow(root) {
  "use strict";

  const modules = root.BridgeAppModules = root.BridgeAppModules || {};

  modules.registerPlayFlow = function registerPlayFlow(runtime) {
    const { actions, constants, dom, els, helpers, render, rules, state, timers, transitions } = runtime;
    const { rankLabel, seats, suitSymbols } = constants;
    const { slotEls } = dom;
    const bridgeRules = rules;
    const BridgeStateTransitions = transitions;
    const {
      cardText,
      currentWinningPlay,
      isLegalCard,
      legalCards,
      partnerOf,
      seatAt,
      seatName,
      suitName,
      t,
      teamOf
    } = helpers;
    const blockingLessonBoardStep = (...args) => actions.blockingLessonBoardStep(...args);
    const ensurePlayPlan = (...args) => actions.ensurePlayPlan(...args);
    const finishHand = (...args) => actions.finishHand(...args);
    const lessonBoardBlocksHumanPlay = (...args) => actions.lessonBoardBlocksHumanPlay(...args);
    const maybeCompleteInteractiveExerciseAction = (...args) => actions.maybeCompleteInteractiveExerciseAction?.(...args);
    const maybeCompleteLessonTableTask = (...args) => actions.maybeCompleteLessonTableTask?.(...args);
    const playPlanReferenceText = (...args) => actions.playPlanReferenceText(...args);
    const renderGuidance = (...args) => render.renderGuidance(...args);
    const renderHands = (...args) => render.renderHands(...args);
    const renderIllegalActionFeedback = (...args) => render.renderIllegalActionFeedback(...args);
    const renderLessonBanner = (...args) => render.renderLessonBanner(...args);
    const renderPlayPlan = (...args) => render.renderPlayPlan(...args);
    const renderTrickAdvanceHint = (...args) => render.renderTrickAdvanceHint(...args);
    const renderTrickSlotFocus = (...args) => render.renderTrickSlotFocus(...args);
    const renderAll = (...args) => render.renderAll(...args);
    const setStatus = (...args) => actions.setStatus(...args);

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
  Object.assign(state, BridgeStateTransitions.applyCardPlayTransition(state, { seat, card, ruleResult, explanation }));
  ensurePlayPlan();

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
  if (actions.isUitspelenDialogOpen?.()) return;
  if (actions.maybeCompleteLessonTableTask?.()) return;
  if (state.hands.South.length === 0 && state.currentTrick.length === 0) {
    finishHand();
    return;
  }
  const seat = seatAt(state.turnIndex);
  renderAll();
  if (blockingLessonBoardStep()) return;
  if (isHumanControlledSeat(seat)) {
    if (!openingLeadHasBeenMade()) {
      setStatus("yourOpeningLead");
      return;
    }
    setStatus("yourPlay");
    return;
  }
  const scheduledFlowGeneration = timers.flowGeneration;
  window.setTimeout(() => {
    if (scheduledFlowGeneration !== timers.flowGeneration) return;
    if (actions.isUitspelenDialogOpen?.()) return;
    const card = chooseCard(seat);
    if (!card) return;
    playCard(seat, card.id);
  }, firstResponseAfterOpeningLead() ? 900 : seat === state.dummy ? 480 : 680);
}

function firstResponseAfterOpeningLead() {
  return state.trickHistory.length === 0 && state.currentTrick.length === 1;
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
    playPlan,
    auction: state.auction
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
  const mini = actions.activeMiniEndPositionExercise?.();
  if (mini?.situation?.visibility === "all") return true;
  if (seat === "South") return true;
  if (mini && seat === state.dummy) return true;
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

function notrumpLeadSelectionText(result) {
  if (result.leadSelection === "partnerSuit") return "partners kleur";
  if (result.leadSelection === "partnerSuitAvoidSingleton") return "een betere ontwikkelkleur";
  if (result.leadSelection === "throughDummySecondSuit") return "door dummy's tweede kleur heen";
  if (result.leadSelection === "qualityUnbidSuit") return "beste serie in een ongeboden kleur";
  if (result.leadSelection === "qualitySuit") return "beste seriekleur";
  if (result.leadSelection === "longestUnbidSuit") return "langste ongeboden kleur";
  if (result.leadSelection === "majorTieBreak") return "hoge kleur bij gelijke opties";
  if (result.leadSelection === "shortSuitNoEntry") return "korte kleur omdat je geen duidelijke rentree hebt";
  if (result.leadSelection === "slamActiveLead") return "actieve slemuitkomst";
  return "langste kleur";
}

function notrumpLeadSelectionReasonText(result) {
  if (result.staymanInferredSuits?.length) {
    const suits = result.staymanInferredSuits.map(suitName).join(", ");
    return ` De Stayman-reeks wijst op ${suits} bij dummy; daarom zoekt de uitkomst liever een andere kleur.`;
  }
  if (result.leadSelection === "partnerSuitAvoidSingleton") {
    return ` Partners kleur ${suitName(result.avoidedPartnerSingleton)} is hier maar een singleton, dus ontwikkelt ${suitName(result.suit)} beter.`;
  }
  if (result.leadSelection === "majorTieBreak") {
    return " Bij gelijkwaardige kleuren krijgt een hoge kleur de voorkeur.";
  }
  if (result.leadSelection === "shortSuitNoEntry") {
    return " Zonder duidelijke rentree is een korte ongeboden kleur praktischer dan een zwakke lengte.";
  }
  if (result.leadSelection === "slamActiveLead") {
    return " Tegen slem is actief een honneur of serie aanvallen vaak nuttiger dan rustig lengteslagen ontwikkelen.";
  }
  return "";
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
          : result.timing === "afterLateCrossRuff"
            ? "nadat de late cross ruff is uitgevoerd"
          : result.timing === "afterUrgentDiscard"
            ? "nadat eerst een verliezer op een hoge bijkleur is weggegooid"
            : "nu";
    return `Trek ${suitName(result.suit)} ${timing} door een hoge troef voor te spelen.`;
  }
  if (ruleName === "endgameRunout") {
    const runoutNext = endgameRunoutNextText(result);
    if (result.action === "preserveRunoutWinner") {
      return `Partner wint deze slag al; gooi geen kaart weg die nodig is voor de zichtbare eindspelreeks${runoutNext}.`;
    }
    if (result.action === "ruffCurrentTrick") {
      return `Troef nu in met ${cardText(result.card)} om de slag te winnen en de zichtbare eindspelreeks vast te houden${runoutNext}.`;
    }
    if (result.action === "leadForPartnerRuff") {
      const ruffSeat = result.winnerSeat || result.targetSeat;
      const ruffTarget = ruffSeat ? seatName(ruffSeat) : "partner";
      return `Speel ${cardText(result.card)} voor zodat ${ruffTarget} kan introeven${runoutNext}.`;
    }
    if (result.action === "giveUpForLateCrossRuff") {
      return `Speel ${cardText(result.card)} nu uit; als deze slag naar de verdediging gaat, blijven er genoeg troeven over voor de late crossruff.`;
    }
    if (result.action === "winCurrentTrick") {
      return `Win deze slag nu met ${cardText(result.card)}; daarna liggen er genoeg zichtbare winnaars om de eindspelreeks door te spelen${runoutNext}.`;
    }
    if (result.action === "leadEntry") {
      return `Speel ${cardText(result.card)} naar ${seatName(result.targetSeat)} om de zichtbare eindspelreeks voort te zetten${runoutNext}.`;
    }
    if (result.action === "cashWinner") {
      return `Incasseer ${cardText(result.card)} als volgende zichtbare winnaar${runoutNext}.`;
    }
    if (result.contractType === "notrump") {
      return `Incasseer de zichtbare sans-atoutwinnaars in de juiste volgorde${runoutNext}.`;
    }
    return `Incasseer de zichtbare winnaars in de juiste volgorde om het eindspel uit te spelen${runoutNext}.`;
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
  if (ruleName === "skipRuffPartnerWinning") {
    return `Partner wint ${suitName(result.suit)} al, dus troef nu niet in en bewaar de troef voor de geplande introever.`;
  }
  if (ruleName === "crossRuff") {
    if (result.action === "cashWinnerBeforeCrossRuff") {
      return "Incasseer eerst deze hoge zijkleurkaart voordat je de crossruff voortzet.";
    }
    if (result.action === "leadCrossRuff") {
      return `Speel ${suitName(result.suit)} naar de renonce van ${seatName(result.shortSeat)} voor de crossruff.`;
    }
    if (result.action === "skipCrossRuffPartnerWinning") {
      return `Partner wint ${suitName(result.suit)} al veilig, dus troef nu niet en bewaar de troef voor de volgende crossruff.`;
    }
    if (result.action === "winSideSuitForCrossRuff") {
      return `Win eerst ${suitName(result.suit)} zodat de crossruff daarna onder controle blijft.`;
    }
    return `Troef ${suitName(result.suit)} laag in ${seatName(result.shortSeat)} voor de crossruff.`;
  }
  if (ruleName === "lateCrossRuff") {
    if (result.action === "cashWinnerBeforeLateCrossRuff") {
      return "Incasseer deze zekere slag voor de late crossruff.";
    }
    if (result.action === "leadLateCrossRuff") {
      return `Speel ${suitName(result.suit)} naar partners renonce: de tegenpartij heeft geen troef meer, dus partner kan laag troeven.`;
    }
    return `Troef laag in ${suitName(result.suit)} om de slag zeker te maken; de tegenpartij heeft geen troef meer.`;
  }
  if ((ruleName === "cashSureWinners" || ruleName === "cashWinners") && result.action === "preserveWinnerUnderPartnerWinner") {
    const winner = result.winningSeat ? seatName(result.winningSeat) : "Partner";
    return `${winner} wint deze slag al; speel laag en bewaar de geplande hoge kaart.`;
  }
  if (ruleName === "cashSureWinners") return "Speel een hoge zekere slag uit voordat je een nieuwe kleur openbreekt.";
  if (ruleName === "cashWinners") return "Incasseer de geplande zekere slag uit het speelplan.";
  if (ruleName === "preserveWorkSuitEntry") {
    const rank = rankLabel[result.entryRank] || result.entryRank;
    return `Bewaar de entree ${rank ? `${rank} ` : ""}${suitName(result.entrySuit)} voor de lange ${suitName(result.suit)}.`;
  }
  if (ruleName === "prepareShortSuitRuff") {
    return `Speel eerst ${suitName(result.suit)} voor om de geplande introever aan de korte troefkant voor te bereiden.`;
  }
  if (ruleName === "avoidLongHandRuff") {
    return "Troef niet onnodig in met de lange troefhand; gooi liever af om troefcontrole te houden.";
  }
  if (ruleName === "longestSuitLead") {
    return `Speel de hoogste kaart uit de langste kleur (${suitName(result.suit)}, ${result.suitLength} kaarten).`;
  }
  if (ruleName === "notrumpSequenceLead") {
    const suitText = notrumpLeadSelectionText(result);
    return `Kom tegen sans-atout met de hoogste kaart uit de serie in je ${suitText}: ${suitName(result.suit)}.${notrumpLeadSelectionReasonText(result)}`;
  }
  if (ruleName === "notrumpAceKingLead") {
    const suitText = notrumpLeadSelectionText(result);
    return `Kom tegen sans-atout met het aas uit AH in je ${suitText}: ${suitName(result.suit)}.${notrumpLeadSelectionReasonText(result)}`;
  }
  if (ruleName === "notrumpBrokenSequenceLead") {
    const missing = rankLabel[result.missingRank] || result.missingRank;
    const suitText = notrumpLeadSelectionText(result);
    return `Kom tegen sans-atout met de hoogste kaart uit de gebroken serie in je ${suitText}: ${suitName(result.suit)}${missing ? `; de ${missing} ontbreekt` : ""}.${notrumpLeadSelectionReasonText(result)}`;
  }
  if (ruleName === "notrumpInternalSequenceLead") {
    const sequence = result.sequence ? ` (${result.sequence})` : "";
    const suitText = notrumpLeadSelectionText(result);
    return `Kom tegen sans-atout met de hoogste kaart van je interne serie${sequence} in je ${suitText}: ${suitName(result.suit)}.${notrumpLeadSelectionReasonText(result)}`;
  }
  if (ruleName === "notrumpDoubletonLead") {
    const suitText = notrumpLeadSelectionText(result);
    return `Kom tegen sans-atout met de hoogste kaart van je doubleton in je ${suitText}: ${suitName(result.suit)}.${notrumpLeadSelectionReasonText(result)}`;
  }
  if (ruleName === "notrumpLowPromisesHonor") {
    const suitText = notrumpLeadSelectionText(result);
    return `Kom tegen sans-atout laag uit je ${suitText}: kleintje belooft plaatje.${notrumpLeadSelectionReasonText(result)}`;
  }
  if (ruleName === "notrumpTopOfNothingLead" || ruleName === "notrumpHighMiddleDeniesHonor") {
    const suitText = notrumpLeadSelectionText(result);
    return `Kom tegen sans-atout met top of nothing uit je ${suitText}: de hoogste kaart ontkent een plaatje.${notrumpLeadSelectionReasonText(result)}`;
  }
  if (ruleName === "suitContractSequenceLead") {
    return `Kom tegen een kleurcontract met de hoogste kaart uit de honneurserie in ${suitName(result.suit)}.`;
  }
  if (ruleName === "suitContractInternalSequenceLead") {
    const sequence = result.sequence ? ` (${result.sequence})` : "";
    return `Kom tegen een kleurcontract met de hoogste kaart van je interne serie${sequence} in ${suitName(result.suit)}.`;
  }
  if (ruleName === "suitContractSingletonLead") {
    return `Kom tegen een kleurcontract met je singleton in ${suitName(result.suit)}.`;
  }
  if (ruleName === "suitContractDoubletonLead") {
    return `Kom tegen een kleurcontract met de hoogste kaart van je doubleton in ${suitName(result.suit)}.`;
  }
  if (ruleName === "suitContractUnsupportedAceLead") {
    return `Kom tegen een kleurcontract niet klein onder een losse aas uit; als deze kleur toch aan de beurt is, speel dan de aas in ${suitName(result.suit)}.`;
  }
  if (ruleName === "suitContractLowPromisesHonor") {
    return `Kom tegen een kleurcontract laag uit ${suitName(result.suit)}: kleintje belooft plaatje.`;
  }
  if (ruleName === "suitContractTopOfNothingLead") {
    if (result.honorSafety === "avoidedUnsupportedAceUnderlead") {
      return `Kom tegen een kleurcontract met top of nothing in ${suitName(result.suit)}: veiliger dan klein onder de losse aas in ${suitName(result.avoidedSuit)}.`;
    }
    return `Kom tegen een kleurcontract met top of nothing in ${suitName(result.suit)}: de hoogste kaart ontkent een plaatje.`;
  }
  if (ruleName === "suitContractFourthBestLead") {
    if (result.honorSafety === "fallbackUnsupportedHonorUnderlead") {
      const honor = rankLabel[result.unsupportedHonor] || result.unsupportedHonor;
      return `Kom tegen een kleurcontract met de vierde kaart van boven uit je lengte in ${suitName(result.suit)}; er is geen veiligere zijkleur, dus dit speelt wel onder een losse ${honor}.`;
    }
    return `Kom tegen een kleurcontract met de vierde kaart van boven uit je lengte in ${suitName(result.suit)}.`;
  }
  if (ruleName === "suitContractLowFromThreeSmall") {
    if (result.honorSafety === "avoidedUnsupportedHonorUnderlead") {
      const honor = rankLabel[result.avoidedHonor] || result.avoidedHonor;
      return `Kom tegen een kleurcontract laag uit drie kleintjes in ${suitName(result.suit)}: veiliger dan onder een losse ${honor} in ${suitName(result.avoidedSuit)} uitkomen.`;
    }
    return `Kom tegen een kleurcontract laag uit drie kleintjes in ${suitName(result.suit)}.`;
  }
  if (ruleName === "thirdHandHighOverLowLead") {
    const preserve = result.higherPlayed?.length ? "; hogere kaarten zijn al zichtbaar gevallen, dus een goedkopere honneur is genoeg" : " en bewaart hogere kaarten als dat kan";
    return `Partner kwam laag uit tegen sans-atout: derde hand probeert de slag in ${suitName(result.leadSuit)} goedkoop te winnen${preserve}.`;
  }
  if (ruleName === "openingLeadAttitudeSignal") {
    const attitude = result.signal === "encourage"
      ? "Speel hoog om aan te moedigen"
      : "Speel laag om af te signaleren";
    return `Partner kwam met een plaatje uit een serie. ${attitude} in ${suitName(result.leadSuit)}.`;
  }
  if (ruleName === "thirdHandUnblockHonor") {
    const rank = rankLabel[result.unblockRank] || result.unblockRank;
    return `Derde hand deblokkeert de ${rank} in ${suitName(result.leadSuit)}: de hoge kaart zit kort, zodat partners lange kleur later kan doorlopen.`;
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
    if (result.coverReason === "dummyThreat" && promoted) {
      return `Tweede hand dekt de ${covered} met de goedkoopste hogere honneur omdat dummy de aansluitende ${promoted} toont.`;
    }
    const tenText = result.coveredRank === "T" ? "; ook de 10 telt hier als honneur" : "";
    return `Tweede hand dekt de ${covered} met de goedkoopste hogere honneur${tenText}.`;
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
  if (ruleName === "safeDefensiveWinner") {
    const avoided = result.avoidedSuits?.map(suitName).join(", ");
    return `Speel partners kleur nu niet terug${avoided ? ` (${avoided})` : ""}: die kleur is zichtbaar leeg bij de andere handen en kan worden getroefd. Incasseer daarom eerst een veilige winnaar.`;
  }
  if (ruleName === "visibleDefensiveWinner") {
    return `Incasseer de zichtbare vrije kaart in ${suitName(result.suit)} voordat je een nieuwe kleur opent.`;
  }
  if (ruleName === "visibleNotrumpWinner") {
    return `Incasseer de zichtbare sans-atoutwinnaar in ${suitName(result.suit)} voordat je een verliezende kleur opent.`;
  }
  if (ruleName === "trumpSwitchAgainstDummyRuff") {
    const shortText = result.dummyShortLength === 0 ? "renonce" : "kort";
    return `Speel troef: dummy is ${shortText} in ${suitName(result.dummyShortSuit)} en heeft nog ${result.dummyTrumpLength} troeven. Zo beperk je dummy's introevers.`;
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
    if (result.action === "testSuitBreak") {
      return `Test de ${suitName(result.suit)} op een ${result.breakNeeded || "gunstig"} zitsel; als de kleur rondgaat, kan een kleine kaart later een slag worden.`;
    }
    const missing = rankLabel[result.missingStopper] || result.missingStopper;
    if (result.action === "leadTowardLongSuit") {
      return `Speel naar partners lange ${suitName(result.suit)} om de ontbrekende ${missing} eruit te werken en latere slagen te ontwikkelen.`;
    }
    return `Ontwikkel de lange ${suitName(result.suit)} door de ontbrekende ${missing} eruit te werken.`;
  }
  if (ruleName === "forceOutAce") {
    const force = rankLabel[result.forceRank] || result.forceRank;
    const missing = (result.missingStoppers || [result.missingStopper])
      .filter(Boolean)
      .map((rank) => rankLabel[rank] || rank)
      .join(" en ");
    if (result.action === "leadTowardForceOutAce") {
      return `Speel naar partners honneurserie in ${suitName(result.suit)} om ${missing || "een hogere honneur"} eruit te werken; dit kan een extra slag ontwikkelen.`;
    }
    return `Speel de ${force} in ${suitName(result.suit)} om ${missing || "een hogere honneur"} eruit te werken; dit kan een extra slag ontwikkelen.`;
  }
  if (ruleName === "lowestLead") return "Speel eenvoudig voor met de laagste legale kaart.";
  if (ruleName === "partnerWinningLow") return "Partner ligt voorlopig voor in de slag, dus speel laag en spaar hogere kaarten.";
  if (ruleName === "protectPartnerWinnerFromDummy") return "Dummy komt nog en kan partners huidige winnaar overnemen; speel de goedkoopste kaart die voor dummy blijft.";
  if (ruleName === "positionAwareWinner") return "Er komt nog een tegenstander na je; speel hoog genoeg om de slag niet alleen voorlopig te winnen.";
  if (ruleName === "cheapestWinner") return "Win de slag voorlopig met de goedkoopste winnende kaart.";
  if (ruleName === "lowestFollow") return "Bekennen is verplicht; omdat winnen niet kan, speel je de laagste kaart in de gevraagde kleur.";
  if (ruleName === "lowestDiscard") return "Bekennen kan niet en winnen lukt niet, dus gooi de laagste legale kaart af.";
  return "Speel de kaart die deze heuristiek kiest.";
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
  if (timers.illegalActionFeedbackTimer) window.clearTimeout(timers.illegalActionFeedbackTimer);
  timers.illegalActionFeedbackTimer = window.setTimeout(() => {
    state.illegalActionFeedback = null;
    renderIllegalActionFeedback();
    timers.illegalActionFeedbackTimer = null;
  }, 2200);
}

function endgameRunoutNextText(result) {
  const step = result?.nextStep;
  if (!step?.rank || !step?.suit) return "";
  if (step.action === "leadForPartnerRuff") {
    const ruffSeat = step.winnerSeat || step.targetSeat;
    const ruffTarget = ruffSeat ? seatName(ruffSeat) : "partner";
    return `; daarna ${rankLabel[step.rank] || step.rank}${suitSymbols[step.suit]} zodat ${ruffTarget} kan introeven`;
  }
  return `; daarna ${rankLabel[step.rank] || step.rank}${suitSymbols[step.suit]}`;
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
  if (lessonBoardBlocksHumanPlay(seat)) return;
  if (state.awaitingTrickAdvance) {
    showIllegalCardFeedback(seat, null);
    return;
  }
  const card = state.hands[seat].find((item) => item.id === cardId);
  if (!card || !isLegalCard(seat, card)) {
    showIllegalCardFeedback(seat, card);
    return;
  }
  if (actions.handleMiniEndPositionCardSelection?.(seat, card)) return;
  if (!actions.validateInteractiveExerciseAction?.("card", { seat, card })) return;
  if (!actions.validateLessonTableAction?.("card", { seat, card })) return;
  state.illegalActionFeedback = null;
  state.lessonActionFeedback = null;
  state.handSuitFocus = null;
  renderIllegalActionFeedback();
  render.renderLessonPanel?.();
  const animationSource = render.captureCardPlayAnimationSource(seat, cardId);
  const ruleResult = chooseCardPlayResult(seat);
  const explanation = explainCardPlay(seat, card, ruleResult);
  Object.assign(state, BridgeStateTransitions.applyCardPlayTransition(state, { seat, card, cardId, ruleResult, explanation }));
  ensurePlayPlan();
  renderPlayPlan();
  renderHands();
  renderPlayedCard(seat, card, { animationSource });
  setStatus("played", { seat, card: cardText(card) });
  if (maybeCompleteInteractiveExerciseAction("card")) return;
  if (maybeCompleteLessonTableTask("card")) return;
  if (state.currentTrick.length === 4) {
    pauseCompletedTrick();
  } else {
    state.turnIndex = (state.turnIndex + 1) % 4;
    continuePlay();
  }
}

function renderPlayedCard(seat, card, options = {}) {
  slotEls[seat].innerHTML = "";
  const cardEl = render.createCardEl(card, true);
  cardEl.classList.add("played");
  cardEl.dataset.seat = seat;
  if (card?.id) cardEl.dataset.cardId = card.id;
  if (options.reviewPlayback) cardEl.classList.add("review-playback-card");
  if (options.settled || options.animate === false) cardEl.classList.add("played-card-settled");
  slotEls[seat].appendChild(cardEl);
  if (options.animate !== false && !options.settled) {
    render.animateCardPlayToSlot({
      source: options.animationSource,
      targetEl: cardEl,
      card
    });
  }
}

function pauseCompletedTrick() {
  const winner = currentWinningPlay();
  state.pendingTrickWinner = winner.seat;
  state.awaitingTrickAdvance = true;
  state.trickAdvanceArmed = false;
  setStatus("winsTrick", { seat: winner.seat, number: state.trickHistory.length + 1 });
  renderTrickSlotFocus();
  renderGuidance();
  renderLessonBanner();
  renderTrickAdvanceHint();
  const scheduledFlowGeneration = timers.flowGeneration;
  window.setTimeout(() => {
    if (scheduledFlowGeneration !== timers.flowGeneration) return;
    state.trickAdvanceArmed = true;
  }, 0);
}

function advanceCompletedTrick() {
  if (!state.awaitingTrickAdvance || !state.currentTrick.length) return;
  if (state.trickClearAnimating) return;
  const winner = state.pendingTrickWinner || currentWinningPlay().seat;
  const finishAdvance = () => {
    state.trickClearAnimating = false;
    Object.assign(state, BridgeStateTransitions.advanceCompletedTrickTransition(state, {
      winner,
      winningTeam: teamOf(winner),
      seats
    }));
    clearTrickSlots();
    setStatus("winsTrick", { seat: winner, number: state.trickHistory.length });
    renderAll();
    continuePlay();
  };

  state.trickClearAnimating = true;
  state.trickAdvanceArmed = false;
  const animated = render.animateCompletedTrickToWinner({
    trickArea: els.trickArea,
    slotEls,
    winner,
    onComplete: finishAdvance
  });
  if (!animated) finishAdvance();
}

function clearTrickSlots() {
  Object.values(slotEls).forEach((slot) => {
    slot.innerHTML = "";
  });
}

    Object.assign(actions, {
      advanceCompletedTrick,
      autoCompletePlay,
      autoPlayCard,
      chooseCard,
      chooseCardPlayResult,
      confidenceName,
      continuePlay,
      currentRecommendedCard,
      explainCardPlay,
      explainCardPlayResult,
      illegalCardFeedbackText,
      isHumanControlledSeat,
      isSeatVisible,
      openingLeadHasBeenMade,
      playCard,
      pauseCompletedTrick,
      showIllegalCardFeedback
    });
    Object.assign(render, {
      clearTrickSlots,
      renderPlayedCard
    });
  };
})(typeof globalThis !== "undefined" ? globalThis : this);

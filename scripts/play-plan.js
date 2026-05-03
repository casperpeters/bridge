function renderPlayPlan() {
  els.playPlan.hidden = true;
  els.playPlan.innerHTML = "";
  if (!state.developerMode) return;

  const plan = currentPlayPlan();
  if (!plan) return;

  const title = document.createElement("h3");
  title.className = "play-plan-title";
  title.textContent = t("playPlan");

  const goal = document.createElement("p");
  goal.className = "play-plan-goal";
  goal.appendChild(BridgeGlossary.linkifyText(playPlanGoalText(plan)));

  const metrics = document.createElement("div");
  metrics.className = "play-plan-metrics";
  playPlanMetricTexts(plan).forEach((metric) => {
    const item = document.createElement("span");
    item.className = "play-plan-metric";
    item.appendChild(BridgeGlossary.linkifyText(metric));
    metrics.appendChild(item);
  });

  els.playPlan.append(title, goal, metrics);
  if (plan.priorities?.length) {
    els.playPlan.appendChild(playPlanList(t("playPlanPriorities"), plan.priorities.map(playPlanPriorityText)));
  }
  if (plan.warnings?.length) {
    els.playPlan.appendChild(playPlanList(t("playPlanWarnings"), plan.warnings.map(playPlanWarningText), "warning"));
  }
  els.playPlan.hidden = false;
}

function currentPlayPlan() {
  if (state.phase !== "playing") return null;
  return ensurePlayPlan();
}

function ensurePlayPlan() {
  if (!canCreatePlayPlan()) return state.playPlan || null;
  const key = playPlanStateKey();
  if (state.playPlan && state.playPlanKey === key) return state.playPlan;
  state.playPlan = bridgeRules.createPlayPlan({
    declarerHand: state.hands[state.declarer],
    dummyHand: state.hands[state.dummy],
    contract: state.contract,
    declarer: state.declarer,
    dummy: state.dummy,
    trickHistory: state.trickHistory,
    currentTrick: state.currentTrick
  });
  state.playPlanKey = key;
  return state.playPlan;
}

function playPlanStateKey() {
  return [
    state.contract ? formatBid(state.contract) : "no-contract",
    state.declarer || "no-declarer",
    state.dummy || "no-dummy",
    handKey(state.hands[state.declarer]),
    handKey(state.hands[state.dummy]),
    trickHistoryKey(),
    currentTrickKey()
  ].join("|");
}

function handKey(hand = []) {
  return hand.map((card) => card.id).join(",");
}

function trickHistoryKey() {
  return state.trickHistory
    .map((trick) => `${trick.number}:${trick.winner}:${(trick.cards || []).map(playKey).join(",")}`)
    .join(";");
}

function currentTrickKey() {
  return state.currentTrick.map(playKey).join(",");
}

function playKey(play) {
  return `${play.seat}-${play.card.id}`;
}

function canCreatePlayPlan() {
  return Boolean(
    state.contract &&
    state.declarer &&
    state.dummy &&
    state.hands[state.declarer]?.length &&
    state.hands[state.dummy]?.length &&
    teamOf(state.declarer) === "NS" &&
    openingLeadHasBeenMade()
  );
}

function playPlanGoalText(plan) {
  const target = `${formatBid(state.contract)} ${t("by")} ${seatName(state.declarer)}`;
  if (plan.type === "notrump") {
    return `${t("playPlanGoal")}: ${plan.neededTricks} slagen maken in ${target}.`;
  }
  return `${t("playPlanGoal")}: houd het op maximaal ${plan.losers.allowed} verliezers in ${target}.`;
}

function playPlanMetricTexts(plan) {
  if (plan.type === "notrump") {
    const develop = plan.needToDevelop ? `nog ${plan.needToDevelop} ontwikkelen` : "genoeg vaste slagen";
    return [`${t("sureWinners")}: ${plan.sureWinners.total}`, develop];
  }
  const base = plan.losers?.baseSeat ? `telhand: ${seatName(plan.losers.baseSeat)}` : null;
  return [`${t("loserCount")}: ${plan.losers.total}`, `ruimte: ${plan.losers.allowed}`, base].filter(Boolean);
}

function playPlanList(label, items, className = "") {
  const section = document.createElement("div");
  section.className = `play-plan-list ${className}`.trim();
  const heading = document.createElement("strong");
  heading.textContent = label;
  const list = document.createElement("ul");
  items.filter(Boolean).forEach((textItem) => {
    const item = document.createElement("li");
    item.appendChild(BridgeGlossary.linkifyText(textItem));
    list.appendChild(item);
  });
  section.append(heading, list);
  return section;
}

function playPlanPriorityText(priority) {
  if (priority.kind === "holdUpStopper") {
    const stopper = rankLabel[priority.stopperRank] || priority.stopperRank;
    return `Houd de ${stopper} in ${suitName(priority.suit)} nog vast; speel laag zolang dat kan, omdat er nog ${priority.needToDevelop} slag${priority.needToDevelop === 1 ? "" : "en"} ontwikkeld moet${priority.needToDevelop === 1 ? "" : "en"} worden.`;
  }
  if (priority.kind === "developLongSuit") {
    if (priority.timing === "giveUpEarly") {
      const entries = priority.sameSuitEntryCount
        ? ` Er blijven ${priority.sameSuitEntryCount} entree${priority.sameSuitEntryCount === 1 ? "" : "s"} in de kleur zelf.`
        : "";
      return `Geef in ${suitName(priority.suit)} vroeg een slag af om de communicatie met ${seatName(priority.sourceSeat)} te bewaren.${entries}`;
    }
    const missing = rankLabel[priority.missingStopper] || priority.missingStopper;
    const entry = priority.entryTiming === "outsideEntry"
      ? ` Entree via ${rankLabel[priority.entryRank] || priority.entryRank} ${suitName(priority.entrySuit)}.`
      : " Geen duidelijke latere entree.";
    const preserve = priority.preserveEntry
      ? ` Bewaar die entree voor de vrije ${suitName(priority.suit)}.`
      : "";
    const tempo = typeof priority.lossesNeeded === "number"
      ? ` Tempo: ${priority.lossesNeeded} keer van slag voor ongeveer ${priority.extraTricks} extra slag${priority.extraTricks === 1 ? "" : "en"}; ${priority.tempoSafe ? "dat past bij de huidige uitkomst" : "dat lijkt te traag bij de huidige uitkomst"}.`
      : "";
    return `Ontwikkel ${suitName(priority.suit)} (${priority.suitLength} kaarten samen); werk de ${missing} eruit.${entry}${preserve}${tempo}`;
  }
  if (priority.kind === "finesse") {
    const rank = rankLabel[priority.finesseRank] || priority.finesseRank;
    return `Overweeg een snit naar de ${rank} in ${suitName(priority.suit)} als de timing klopt.`;
  }
  if (priority.kind === "safeHandFinesse") {
    const rank = rankLabel[priority.finesseRank] || priority.finesseRank;
    return `Neem de snit in ${suitName(priority.suit)} naar de ${rank}; als die verliest, komt de veilige hand ${seatName(priority.safeSeat)} aan slag.`;
  }
  if (priority.kind === "doubleFinesse") {
    const rank = rankLabel[priority.finesseRank] || priority.finesseRank;
    return `Overweeg een dubbele snit naar de ${rank} in ${suitName(priority.suit)}; dit blijft onzeker.`;
  }
  if (priority.kind === "repeatFinesse") {
    const rank = rankLabel[priority.finesseRank] || priority.finesseRank;
    const missing = rankLabel[priority.missingHonor] || priority.missingHonor;
    return `Herhaal de snit in ${suitName(priority.suit)} naar de ${rank}; de ${missing} is nog niet gevallen.`;
  }
  if (priority.kind === "twoWayFinesse") {
    const rank = rankLabel[priority.finesseRank] || priority.finesseRank;
    return `Neem de tweerichtingssnit in ${suitName(priority.suit)} richting ${seatName(priority.targetSeat)} naar de ${rank}; deze richting past nu het best bij entrees en lengte.`;
  }
  if (priority.kind === "ruffShortSuit") {
    if (priority.timing === "prepareBeforeRuff") {
      return `Bereid een introever in ${suitName(priority.suit)} voor: speel eerst ${priority.preparationNeeded} ronde${priority.preparationNeeded === 1 ? "" : "s"} uit ${seatName(priority.longSeat)}, bewaar minstens ${priority.preserveTrumpCount || 1} troef bij ${seatName(priority.shortSeat)}, en troef daarna aan de korte kant voor een extra slag.`;
    }
    return `Gebruik de korte ${suitName(priority.suit)} van ${seatName(priority.shortSeat)} om verliezers te troeven; als die hand aan slag is, zoek eerst een entree naar de andere hand.`;
  }
  if (priority.kind === "establishLongSuitByRuffing") {
    const entry = priority.entrySuit
      ? ` Bewaar de entree via ${rankLabel[priority.entryRank] || priority.entryRank} ${suitName(priority.entrySuit)} naar ${seatName(priority.longSeat)}.`
      : "";
    const entries = typeof priority.entryCount === "number" ? ` Er zijn ${priority.entryCount} duidelijke entree${priority.entryCount === 1 ? "" : "s"}.` : "";
    return `Ontwikkel de lange ${suitName(priority.suit)} van ${seatName(priority.longSeat)} door die kleur te spelen en in ${seatName(priority.shortSeat)} te troeven; verwacht ongeveer ${priority.maxUsefulRuffs || priority.estimatedRuffsNeeded} introever${(priority.maxUsefulRuffs || priority.estimatedRuffsNeeded) === 1 ? "" : "s"}.${entry}${entries}`;
  }
  if (priority.kind === "drawTrumps") {
    const missing = priority.missingHonors?.length
      ? ` Ontbrekend hoog: ${priority.missingHonors.map((rank) => rankLabel[rank] || rank).join(", ")}.`
      : "";
    if (priority.timing === "limitedBeforeRuff") {
      return `Trek eerst maximaal ${priority.roundLimit} ronde troef en bewaar minstens ${priority.preserveTrumpCount} troef${priority.preserveTrumpCount === 1 ? "" : "en"} bij ${seatName(priority.preserveSeat)} voor de introever; jullie hebben ${priority.trumpLength} troeven samen.${missing}`;
    }
    const timing = priority.timing === "afterRuff"
      ? "nadat de directe introever is genomen"
      : priority.timing === "afterLongSuitRuff"
        ? "nadat de lange zijkleur is vrijgetroefd"
        : priority.timing === "afterUnblock"
          ? `nadat ${suitName(priority.delaySuit)} is gedeblokkeerd`
          : priority.timing === "afterUrgentDiscard"
            ? `nadat eerst een verliezer op ${suitName(priority.delaySuit)} is weggegooid`
            : "vroeg";
    return `Trek ${suitName(priority.suit)} ${timing}; jullie hebben ${priority.trumpLength} troeven samen.${missing}`;
  }
  if (priority.kind === "discardLoserOnWinner") {
    const ranks = priority.cashRanks?.map((rank) => rankLabel[rank] || rank).join(", ");
    return `Speel eerst de hoge ${suitName(priority.suit)}${ranks ? ` (${ranks})` : ""} om een verliezer in ${suitName(priority.attackedSuit)} weg te gooien; wacht daarom nog even met troeftrekken.`;
  }
  if (priority.kind === "cashWinners") {
    const ranks = priority.cashRanks?.map((rank) => rankLabel[rank] || rank).join(", ");
    if (priority.timing === "unblockBeforeEntry") {
      return `Incasseer eerst ${ranks} ${suitName(priority.suit)} om de kleur niet te blokkeren; entree via ${rankLabel[priority.entryRank] || priority.entryRank} ${suitName(priority.entrySuit)}.`;
    }
    if (priority.timing === "blockedNoEntry") {
      return `Incasseer alleen de vrije ${ranks} in ${suitName(priority.suit)}; de rest vraagt een entree die nu niet duidelijk is.`;
    }
    return `Incasseer de zekere slagen in ${suitName(priority.suit)}${ranks ? ` (${ranks})` : ""}.`;
  }
  if (priority.kind === "cashSureWinners") return "Speel eerst je zekere slagen rustig af.";
  return "Volg de beste beschikbare basislijn.";
}

function playPlanWarningText(warning) {
  if (warning.kind === "entryRisk") {
    return `${seatName(warning.sourceSeat)} heeft weinig duidelijke entrees naar de lange ${suitName(warning.suit)}; wees zuinig met entreekaarten.`;
  }
  if (warning.kind === "tooManyLosers") {
    return `Je telt ${warning.losers} verliezers, terwijl dit contract ongeveer ${warning.allowed} verliezers kan hebben.`;
  }
  if (warning.kind === "blockedSuit") {
    const ranks = warning.strandedRanks?.map((rank) => rankLabel[rank] || rank).join(", ");
    return `${suitName(warning.suit)} is geblokkeerd: ${seatName(warning.longSeat)} heeft ${ranks}, maar geen duidelijke entree.`;
  }
  return "Dit plan is heuristisch; controleer de timing voordat je speelt.";
}

function playPlanReferenceText(result) {
  if (!result?.ruleId) return "";
  if (result.planPriority) return ` Dit volgt het speelplan: ${playPlanPriorityText(result.planPriority)}`;
  if (result.planFallback) return ` Speelplan wacht: ${playPlanFallbackText(result.planFallback)}`;
  return "";
}

function playPlanFallbackText(fallback) {
  const priority = fallback.priority;
  const priorityText = playPlanPriorityBriefText(priority);
  if (fallback.reason === "followSuit") {
    return `je moet eerst ${suitName(fallback.leadSuit)} bekennen; ${priorityText} is nu niet legaal.`;
  }
  if (fallback.reason === "needsOtherHand") {
    const seat = fallback.waitingForSeat ? seatName(fallback.waitingForSeat) : "de andere hand";
    return `${priorityText} vraagt eerst ${seat} aan slag.`;
  }
  if (fallback.reason === "noPlanSuitCard") {
    return `${priorityText} kan niet vanuit deze hand.`;
  }
  if (fallback.reason === "finishCurrentTrick") {
    return `maak deze slag eerst af; ${priorityText} kan pas op een passende slag.`;
  }
  return `${priorityText} is nu niet direct speelbaar.`;
}

function playPlanPriorityBriefText(priority) {
  if (!priority) return "de zichtbare planregel";
  if (priority.kind === "holdUpStopper") return `ophouden in ${suitName(priority.suit)}`;
  if (priority.kind === "developLongSuit") return `ontwikkel ${suitName(priority.suit)}`;
  if (priority.kind === "finesse" || priority.kind === "safeHandFinesse") return `de snit in ${suitName(priority.suit)}`;
  if (priority.kind === "doubleFinesse") return `de dubbele snit in ${suitName(priority.suit)}`;
  if (priority.kind === "repeatFinesse") return `de herhaalde snit in ${suitName(priority.suit)}`;
  if (priority.kind === "twoWayFinesse") return `de tweerichtingssnit in ${suitName(priority.suit)}`;
  if (priority.kind === "ruffShortSuit") return `de introever in ${suitName(priority.suit)}`;
  if (priority.kind === "establishLongSuitByRuffing") return `de lange ${suitName(priority.suit)} vrijtroeven`;
  if (priority.kind === "drawTrumps") return `troef trekken`;
  if (priority.kind === "discardLoserOnWinner") return `een verliezer weggooien op ${suitName(priority.suit)}`;
  if (priority.kind === "cashWinners" || priority.kind === "cashSureWinners") return `zekere slagen incasseren`;
  return "de zichtbare planregel";
}

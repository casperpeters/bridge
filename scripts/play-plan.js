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
  return [`${t("loserCount")}: ${plan.losers.total}`, `ruimte: ${plan.losers.allowed}`];
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
    const missing = rankLabel[priority.missingStopper] || priority.missingStopper;
    const entry = priority.entryTiming === "outsideEntry"
      ? ` Entree via ${rankLabel[priority.entryRank] || priority.entryRank} ${suitName(priority.entrySuit)}.`
      : " Geen duidelijke latere entree.";
    return `Ontwikkel ${suitName(priority.suit)} (${priority.suitLength} kaarten samen); werk de ${missing} eruit.${entry}`;
  }
  if (priority.kind === "finesse") {
    const rank = rankLabel[priority.finesseRank] || priority.finesseRank;
    return `Overweeg een snit naar de ${rank} in ${suitName(priority.suit)} als de timing klopt.`;
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
  const plan = state.playPlan;
  if (!plan || !result?.ruleId) return "";
  if (result.planPriority) return ` Dit volgt het speelplan: ${playPlanPriorityText(result.planPriority)}`;
  const ruleName = result.ruleId.split(".").pop();
  const matchingPriority = plan.priorities?.find((priority) => {
    if (priority.suit && result.suit && priority.suit !== result.suit) return false;
    if (ruleName === "developLongSuit") return priority.kind === "developLongSuit";
    if (ruleName === "finesseTowardHonor") return priority.kind === "finesse";
    if (ruleName === "doubleFinesseTowardHonor") return priority.kind === "doubleFinesse";
    if (ruleName === "holdUpStopper") return priority.kind === "holdUpStopper";
    if (ruleName === "repeatFinesse") return priority.kind === "repeatFinesse";
    if (ruleName === "twoWayFinesse") return priority.kind === "twoWayFinesse";
    if (ruleName === "drawTrumps") return priority.kind === "drawTrumps";
    if (ruleName === "discardLoserOnWinner") return priority.kind === "discardLoserOnWinner";
    if (ruleName === "ruffShortSuit") return priority.kind === "ruffShortSuit";
    if (ruleName === "enterLongTrumpHand") return priority.kind === "ruffShortSuit";
    if (ruleName === "establishLongSuitByRuffing") return priority.kind === "establishLongSuitByRuffing";
    if (ruleName === "enterLongSuitHand") return priority.kind === "establishLongSuitByRuffing";
    if (ruleName === "ruffOutLongSuit") return priority.kind === "establishLongSuitByRuffing";
    if (ruleName === "cashWinners") return priority.kind === "cashWinners";
    if (ruleName === "cashSureWinners") return priority.kind === "cashSureWinners";
    return false;
  });
  if (!matchingPriority) return "";
  return ` Dit volgt het speelplan: ${playPlanPriorityText(matchingPriority)}`;
}

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
    const title = document.createElement("strong");
    title.textContent = `${seatName(call.seat)} ${callText}`;
    item.append(title, document.createElement("br"), BridgeGlossary.linkifyText(explainBid(call, index)));
    els.bidExplanations.appendChild(item);
  });
}

function explainBid(call, index) {
  if (call.bidResult && bidResultMatchesCall(call.bidResult, call.bid)) {
    return explainBidChoiceResult(call.bidResult);
  }
  if (isPass(call.bid)) return t("bidExplanationPass");
  if (isDouble(call.bid)) return t("bidExplanationDouble");
  if (isRedouble(call.bid)) return t("bidExplanationRedouble");
  const context = auctionContextAt(index);
  const detail = bidMeaning(call.bid, context);
  return t(detail.key, { detail: detail.text });
}

function bidResultMatchesCall(result, call) {
  return sameCall(result?.bid, call);
}

function explainBidChoiceResult(result) {
  const ruleName = bidRuleName(result);
  if (isPass(result.bid)) return explainPassChoiceResult(ruleName, result);
  if (isDouble(result.bid)) {
    const detail = ruleName === "competitive.negativeDouble"
      ? "negatief doublet: toont waarden en minstens een vierkaart in een ongeboden hoge kleur"
      : "informatiedoublet: openingskracht, kort in hun kleur en steun voor de ongeboden kleuren";
    return t("bidExplanationCompetitive", { detail: `${detail}. ${ruleReferenceText(ruleName)}` });
  }
  if (isRedouble(result.bid)) {
    return t("bidExplanationCompetitive", { detail: `redoublet met extra waarden nadat de tegenpartij partner heeft gedoubleerd. ${ruleReferenceText(ruleName)}` });
  }

  const detail = bidChoiceDetail(ruleName, result);
  return t(bidChoiceExplanationKey(ruleName), { detail });
}

function bidRuleName(result) {
  const systemPrefix = result?.system ? `${result.system}.` : "";
  const ruleId = result?.ruleId || "";
  return systemPrefix && ruleId.startsWith(systemPrefix) ? ruleId.slice(systemPrefix.length) : ruleId.replace(/^fiveCardHigh\./, "");
}

function explainPassChoiceResult(ruleName, result = null) {
  if (ruleName === "legalize.pass") return `Het doelbod uit de regel was niet legaal in dit biedverloop; daarom wordt veilig gepast. ${ruleReferenceText(ruleName)}`;
  const facts = handFactsText({ ruleName, result, valueMode: isOpenerAfterNotrumpRule(ruleName) ? "hcp" : "full" });
  const factSuffix = facts ? `. ${facts}` : "";
  const detail = {
    "pass.openingNoAction": `geen opening: te weinig openingskracht en geen geschikte zwakke twee of preempt${factSuffix}`,
    "pass.responseNoAction": `geen antwoord: te weinig waarden of geen passende actie tegenover partner${factSuffix}`,
    "pass.openerMajorRaiseMinimum": `geen manchepoging na partners enkele hoge-kleursteun: met 12-15 totaalpunten past openaar${factSuffix}`,
    "pass.openerMinorRaiseMinimum": `geen manchepoging na partners lage-kleursteun: openaar heeft een minimum en past${factSuffix}`,
    "pass.openerMinorAfterOneNtMinimum": `pas na partners 1SA op 1K/1R: partner heeft geen hoge-kleurfit gevonden en openaar heeft een minimum zonder lange lage kleur${factSuffix}`,
    "pass.openerMinorAfterTwoNtMinimum": `pas na partners 2SA op 1K/1R: partner heeft geen hoge-kleurfit gevonden; openaar heeft onvoldoende overwaarde om de manche te bieden${factSuffix}`,
    "pass.openerMinorAfterThreeNtPass": `pas na partners 3SA op 1K/1R: partner heeft geen hoge-kleurfit gevonden en 3SA is meestal het eindcontract${factSuffix}`,
    "pass.openerAfterOneNtBalancedMinimum": `herbieding na partners 1SA: SA-verdeling met 12-14 HCP, dus pas${factSuffix}`,
    "pass.openerAfterOneNtNoAction": `herbieding na partners 1SA: geen passende foto-regel voor dit handtype of deze HCP-range${factSuffix}`,
    "pass.openerAfterTwoNtBalancedMinimum": `herbieding na partners 2SA: SA-verdeling met 12-13 HCP, dus pas${factSuffix}`,
    "pass.openerAfterTwoNtNoAction": `herbieding na partners 2SA: geen passende foto-regel voor dit handtype of deze HCP-range${factSuffix}`,
    "pass.declineMajorInvite": `invite afgeslagen: na de enkele steun heeft responder de lage range; met 6-7 HCP past hij${factSuffix}`,
    "pass.continuationNoAction": `geen vervolg: geen zinvol herbod binnen de huidige afspraken${factSuffix}`,
    "pass.competitiveNoAction": `geen competitieve actie: geen verantwoord volgbod, steunbod, SA-bod of doublet${factSuffix}`,
    "pass.noSeat": `geen speler beschikbaar voor de biedengine${factSuffix}`,
    "pass.unknownCall": `de biedengine herkende geen contractactie${factSuffix}`,
    "pass.noAction": `geen duidelijke systeemactie of te weinig waarden om te bieden${factSuffix}`
  }[ruleName] || `${t("bidExplanationPass")}${factSuffix}`;
  return `${detail}.`;
}

function bidChoiceExplanationKey(ruleName) {
  const normalized = ruleName.toLowerCase();
  if (ruleName.startsWith("opening.")) return "bidExplanationOpening";
  if (normalized.includes("stayman") || normalized.includes("transfer") || normalized.includes("strongtwoclubs")) return "bidExplanationArtificial";
  if (ruleName.startsWith("response.")) return "bidExplanationResponse";
  if (ruleName.startsWith("competitive.")) return "bidExplanationCompetitive";
  return "bidExplanationContinuation";
}

function bidChoiceDetail(ruleName, result) {
  switch (ruleName) {
    case "opening.oneNotrump":
      return `Vijfkaart Hoog: open 1SA met 15-17 HCP en een gebalanceerde hand. ${handFactsText({ ruleName, result })}`;
    case "opening.twoNotrump":
      return `Vijfkaart Hoog: open 2SA met 20-22 HCP en een gebalanceerde hand. ${handFactsText({ ruleName, result })}`;
    case "opening.strongTwoClubs":
      return `sterke kunstmatige 2K: ${strongTwoClubsReason(result)}. ${handFactsText({ ruleName, result })}`;
    case "opening.weakTwo":
      return `zwakke twee in ${suitName(result.suit)}: 6-10 HCP met een goede exacte 6-kaart. ${handFactsText({ ruleName, result })}`;
    case "opening.preempt":
      return `preemptieve opening in ${suitName(result.suit)}: 6-10 HCP met een goede ${result.length >= 8 ? "8+-kaart op vierniveau" : "7+-kaart op drieniveau"}. ${handFactsText({ ruleName, result })}`;
    case "opening.oneMajor":
      return `vijfkaart ${suitName(result.suit)} met openingskracht; er is geen langere lage kleur en geen passend SA-bod. ${handFactsText({ ruleName, result })}`;
    case "opening.oneMinor":
      return `gekozen lage kleur met openingskracht; geen passend SA-bod of vijfkaart hoog volgens de openingsregel. ${openingMinorReason(result)} ${handFactsText({ ruleName, result })}`;
    case "response.stayman":
      return `Stayman: vraagt de openaar naar een vierkaart hoog. ${handFactsText({ ruleName, result })}`;
    case "response.transferToH":
      return `Jacoby-transfer naar harten: toont minstens een vijfkaart harten. ${handFactsText({ ruleName, result, suit: "H" })}`;
    case "response.transferToS":
      return `Jacoby-transfer naar schoppen: toont minstens een vijfkaart schoppen. ${handFactsText({ ruleName, result, suit: "S" })}`;
    case "response.notrumpInvite":
      return `inviterend SA-antwoord met gebalanceerde waarden en geen betere fit. ${handFactsText({ ruleName, result })}`;
    case "response.notrumpGame":
      return `SA-manche met genoeg waarden en geen betere fit. ${handFactsText({ ruleName, result })}`;
    case "response.strongTwoClubsWaiting":
      return `afwachtend antwoord op sterke 2K. ${handFactsText({ ruleName, result })}`;
    case "response.strongTwoClubsPositive":
      return `positief antwoord op sterke 2K; toont een speelbare kleur of extra waarden. ${handFactsText({ ruleName, result })}`;
    case "response.raisePreempt":
      return `steun voor partners preempt. ${handFactsText({ ruleName, result })}`;
    case "response.notrumpOverPreempt":
      return `SA-antwoord met extra gebalanceerde kracht tegenover partners preempt. ${handFactsText({ ruleName, result })}`;
    case "response.newSuitOverPreempt":
      return `nieuwe kleur tegenover partners preempt, met eigen kleurkwaliteit. ${handFactsText({ ruleName, result })}`;
    case "response.raise":
      return `steun voor partners ${suitName(result.partnerSuit)}. ${handFactsText({ ruleName, result })}`;
    case "response.notrump":
      return `gebalanceerd antwoord zonder betere fit of nieuwe kleur. ${handFactsText({ ruleName, result })}`;
    case "response.newSuit":
      return responseNewSuitDetail(ruleName, result);
    case "continuation.staymanAnswer":
      return `antwoord op Stayman: vierkaart hoog tonen of ontkennen. ${handFactsText({ ruleName, result })}`;
    case "continuation.acceptTransfer":
      return `accepteert partners transfer naar ${suitName(result.transferSuit || result.suit)}. ${handFactsText({ ruleName, result, suit: result.transferSuit || result.suit })}`;
    case "continuation.openerAfterOneNtBalancedGame":
      return openerAfterNotrumpDetail(ruleName, result, "1SA", "SA-verdeling", "18-19 HCP", "3SA");
    case "continuation.openerAfterOneNtLongMajorMinimum":
      return openerAfterNotrumpDetail(ruleName, result, "1SA", "een lange hoge kleur", "12-15 HCP", `2${result.openingSuit}`);
    case "continuation.openerAfterOneNtLongMajorInvite":
      return openerAfterNotrumpDetail(ruleName, result, "1SA", "een lange hoge kleur", "16-17 HCP", `3${result.openingSuit}`);
    case "continuation.openerAfterOneNtLongMajorGame":
      return openerAfterNotrumpDetail(ruleName, result, "1SA", "een lange hoge kleur", "18-19 HCP", `4${result.openingSuit}`);
    case "continuation.openerAfterOneNtTwoSuiterLow":
      return openerAfterNotrumpDetail(ruleName, result, "1SA", `tweekleurenspel met tweede lagere kleur ${suitName(result.secondSuit)}`, "12-17 HCP", `2${result.secondSuit}`);
    case "continuation.openerAfterOneNtTwoSuiterHigh":
      return openerAfterNotrumpDetail(ruleName, result, "1SA", `tweekleurenspel met tweede lagere kleur ${suitName(result.secondSuit)}`, "18-19 HCP", `3${result.secondSuit}`);
    case "continuation.openerAfterTwoNtBalancedGame":
      return openerAfterNotrumpDetail(ruleName, result, "2SA", "SA-verdeling", "14+ HCP", "3SA");
    case "continuation.openerAfterTwoNtLongMajorMinimum":
      return openerAfterNotrumpDetail(ruleName, result, "2SA", "een lange hoge kleur", "12-13 HCP", `3${result.openingSuit}`);
    case "continuation.openerAfterTwoNtLongMajorGame":
      return openerAfterNotrumpDetail(ruleName, result, "2SA", "een lange hoge kleur", "14+ HCP", `4${result.openingSuit}`);
    case "continuation.openerAfterTwoNtTwoSuiterLow":
      return openerAfterNotrumpDetail(ruleName, result, "2SA", `tweekleurenspel met tweede lagere kleur ${suitName(result.secondSuit)}`, "12-13 HCP", `3${result.secondSuit}`);
    case "continuation.openerAfterTwoNtTwoMajorsGame":
      return openerAfterNotrumpDetail(ruleName, result, "2SA", "tweekleurenspel schoppen en harten", "14+ HCP", "4H");
    case "continuation.openerAfterTwoNtTwoSuiterGameNotrump":
      return openerAfterNotrumpDetail(ruleName, result, "2SA", `tweekleurenspel met tweede lagere kleur ${suitName(result.secondSuit)}`, "14+ HCP", "3SA");
    case "continuation.openerMinorAfterOneNtInvite":
      return `invite na partners 1SA op 1K/1R: partner heeft geen hoge-kleurfit gevonden; met 15-17 HCP en een SA-verdeling biedt openaar 2SA. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
    case "continuation.openerMinorAfterOneNtGame":
      return `3SA na partners 1SA op 1K/1R: partner heeft geen hoge-kleurfit gevonden; met 18-19 HCP en een SA-verdeling biedt openaar de manche. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
    case "continuation.openerMinorAfterOneNtLongMinorMinimum":
      return `lange lage kleur na partners 1SA: partner heeft geen hoge-kleurfit gevonden; met een ongebalanceerde zeskaart herbiedt openaar 2${result.openingSuit}. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
    case "continuation.openerMinorAfterOneNtLongMinorInvite":
      return `invite met lange lage kleur na partners 1SA: partner heeft geen hoge-kleurfit gevonden; met extra waarden en een zeskaart biedt openaar 3${result.openingSuit}. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
    case "continuation.openerMinorAfterOneNtLongMinorGame":
      return `lage-kleurmanche na partners 1SA: partner heeft geen hoge-kleurfit gevonden; openaar heeft een sterke ongebalanceerde lange lage kleur. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
    case "continuation.openerMinorAfterTwoNtGame":
      return `3SA na partners 2SA op 1K/1R: partner heeft geen hoge-kleurfit gevonden; openaar accepteert de invite met voldoende kracht. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
    case "continuation.openerMinorAfterTwoNtLongMinorInvite":
      return `lange lage kleur na partners 2SA: partner heeft geen hoge-kleurfit gevonden; openaar corrigeert naar 3${result.openingSuit} met een ongebalanceerde zeskaart. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
    case "continuation.openerMinorAfterTwoNtLongMinorGame":
      return `lage-kleurmanche na partners 2SA: partner heeft geen hoge-kleurfit gevonden; openaar heeft genoeg kracht en een lange lage kleur. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
    case "continuation.openerMinorAfterThreeNtLongMinorGame":
      return `uit 3SA naar de lage-kleurmanche: alleen met een zeer lange ongebalanceerde lage kleur; partner heeft met 3SA geen hoge-kleurfit gevonden. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
    case "continuation.openerMinorNewSuitMajorFitMinimum":
      return `fit na partners nieuwe hoge kleur: openaar heeft vierkaart steun en een minimum, dus hij steunt op 2-niveau. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
    case "continuation.openerMinorNewSuitMajorFitInvite":
      return `invite na partners nieuwe hoge kleur: openaar heeft vierkaart steun en extra waarden, dus hij steunt op 3-niveau. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
    case "continuation.openerMinorNewSuitMajorFitGame":
      return `manche na partners nieuwe hoge kleur: openaar heeft vierkaart steun en genoeg kracht voor de manche. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
    case "continuation.openerMinorNewSuitNotrumpMinimum":
      return `SA-herbieding na partners nieuwe kleur: er is geen hoge-kleurfit gevonden; met een gebalanceerde minimumhand biedt openaar 1SA. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
    case "continuation.openerMinorNewSuitNotrumpInvite":
      return `sterke SA-herbieding na partners nieuwe kleur: er is geen hoge-kleurfit gevonden; met gebalanceerde overwaarde biedt openaar 2SA. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
    case "continuation.openerMinorNewSuitLongMinorMinimum":
      return `herbiedt de eigen lage kleur: geen hoge-kleurfit en openaar heeft een zeskaart in de openingskleur. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
    case "continuation.openerMinorNewSuitLongMinorInvite":
      return `invite met lange lage kleur: geen hoge-kleurfit; openaar heeft een zeskaart in de openingskleur en extra waarden. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
    case "continuation.openerMinorNewSuitLongMinorGame":
      return `lage-kleurmanche met lange openingskleur: geen hoge-kleurfit; openaar heeft een sterke ongebalanceerde hand. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
    case "continuation.openerMinorNewSuitReverse":
      return `reverse: openaar toont een tweede kleur op hoger niveau; dit gebeurt alleen met extra kracht. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
    case "continuation.openerMinorNewSuitSecondSuit":
      return `tweede kleur van openaar: geen hoge-kleurfit, geen passende SA-herbieding en geen lange openingskleur; openaar toont natuurlijk een tweede vierkaart. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
    case "continuation.openerOneDiamondTwoClubsNotrumpInvite":
      return `2SA na 1R-2K: partner heeft met 2K minstens 10 punten, klaveren en geen vierkaart hoog getoond; zonder hoge-kleurfit is 2SA de natuurlijke invite. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
    case "continuation.openerOneDiamondTwoClubsNotrumpGame":
      return `3SA na 1R-2K: partner heeft met 2K geen vierkaart hoog getoond; zonder hoge-kleurfit en met genoeg kracht kies je de SA-manche. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
    case "continuation.openerOneDiamondTwoClubsLongDiamondMinimum":
      return `je herbiedt 2R na 1R-2K en belooft daarmee een zeskaart ruiten; je bent niet sterk, dus je blijft zo laag mogelijk. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
    case "continuation.openerOneDiamondTwoClubsLongDiamondInvite":
      return `je biedt 3R na 1R-2K: met extra waarden en een zeskaart ruiten laat je partner kiezen tussen 3SA en 5R. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
    case "continuation.openerOneDiamondTwoClubsClubFit":
      return `met klaverenfit na 1R-2K verhoog je partner een niveau naar 3K; partner mag passen of, indien hij sterker is, een manche bieden. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
    case "continuation.openerMajorRaiseInvite":
      return `invite na partners enkele hoge-kleursteun: met 16-17 totaalpunten biedt openaar 3${result.suit}. ${handFactsText({ ruleName, result })}`;
    case "continuation.openerMajorRaiseGame":
      return `manche na partners enkele hoge-kleursteun: met 18-19 totaalpunten biedt openaar 4${result.suit}. ${handFactsText({ ruleName, result })}`;
    case "continuation.openerMinorRaiseInvite":
      return `invite na partners lage-kleursteun: met extra waarden, maar nog geen zekere manche, biedt openaar 3${result.suit}. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
    case "continuation.openerMinorRaiseNotrumpGame":
      return `3SA na partners lage-kleursteun: openaar heeft een gebalanceerde hand en genoeg gezamenlijke kracht voor de manche. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
    case "continuation.openerMinorRaiseGame":
      return `manche na partners lage-kleursteun: openaar heeft genoeg kracht en kiest de lage-kleurmanche. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
    case "continuation.raisePartner":
      return `gevonden fit: steun voor partners kleur. ${handFactsText({ ruleName, result })}`;
    case "continuation.acceptMajorInvite":
      return `invite aangenomen: na de enkele steun heeft responder de hoge range; met 8+ HCP biedt hij de manche. ${handFactsText({ ruleName, result })}`;
    case "continuation.notrumpRebid":
      return `SA-herbieding met een SA-verdeling. ${handFactsText({ ruleName, result })}`;
    case "continuation.rebidOwnSuit":
      return `herbiedt de eigen ${suitName(result.suit)} met een zeskaart. ${handFactsText({ ruleName, result })}`;
    case "continuation.newSuit":
      return `toont een tweede kleur in ${suitName(result.suit)} met een tweekleurenspel. ${handFactsText({ ruleName, result })}`;
    case "competitive.oneNotrumpOvercall":
      return `SA-volgbod met 15-17 HCP, gebalanceerde hand en stop in hun kleur. ${handFactsText({ ruleName, result })}`;
    case "competitive.jumpOvercall":
      return `sprongvolgbod met beperkte kracht en een goede zeskaart. ${handFactsText({ ruleName, result })}`;
    case "competitive.simpleOvercall":
      return `natuurlijk volgbod met een goede vijfkaart of langer in ${suitName(result.suit)} en ${result.minimumHcp || (result.bid?.level >= 2 ? 10 : 8)}+ HCP. ${handFactsText({ ruleName, result })}`;
    case "competitive.raisePartnerOvercall":
      return `steun voor partners volgbod met fit in ${suitName(result.partnerSuit)} en ${result.minimumHcp || (result.vulnerable ? 8 : 7)}+ HCP${result.vulnerable ? " kwetsbaar" : " niet-kwetsbaar"}. ${handFactsText({ ruleName, result })}`;
    case "competitive.notrumpAfterPartnerOvercall":
      return `3SA na partners volgbod: genoeg gezamenlijke kracht en stop in ${suitName(result.stopperSuit || result.opponentSuit)}. ${handFactsText({ ruleName, result })}`;
    case "competitive.newSuitAfterPartnerOvercall":
      return `nieuwe kleur na partners volgbod: eigen vijfkaart of langer in ${suitName(result.suit)} en manche-interesse; partner heeft op tweehoogte minstens 10 HCP getoond. ${handFactsText({ ruleName, result })}`;
    case "competitive.raisePartner":
      return `verhoging van partners kleur. ${handFactsText({ ruleName, result })}`;
    case "competitive.notrump":
      return `competitief SA-bod met gebalanceerde waarden en dekking. ${handFactsText({ ruleName, result })}`;
    case "competitive.newSuit":
      return `competitieve nieuwe kleur in ${suitName(result.suit)} met speelbare lengte. ${handFactsText({ ruleName, result })}`;
    default:
      return `${result.reason || "Natuurlijke actie volgens de huidige Vijfkaart-Hoog-afspraken."} ${handFactsText({ ruleName, result })}`;
  }
}

function strongTwoClubsReason(result) {
  if (result.balanced && result.hcp >= 23) return "23+ HCP met een gebalanceerde hand";
  if (result.hcp >= 20 && result.points !== result.hcp) return "20+ HCP of totaalpunten met een sterke hand";
  return "20+ HCP of totaalpunten met een sterke hand";
}

function openingMinorReason(result) {
  const clubs = result.counts?.C || 0;
  const diamonds = result.counts?.D || 0;
  if (clubs >= 5 && diamonds >= 5) return "Bij 5-5 laag kiest de regel ruiten.";
  if (diamonds > clubs && diamonds >= 4) return "Ruiten is de langere lage kleur.";
  if (clubs > diamonds && clubs >= 4) return "Klaveren is de langere lage kleur.";
  if (clubs === 4 && diamonds === 4) return "Bij 4-4 laag kiest de regel klaveren.";
  if (diamonds >= 4) return "Ruiten heeft minstens vier kaarten.";
  return "Klaveren is de vangnetopening.";
}

function openerAfterNotrumpDetail(ruleName, result, responseText, handType, rangeText, actionText) {
  return `herbieding na partners ${responseText}: ${handType}; met ${rangeText} kiest openaar ${actionText}. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
}

function responseNewSuitDetail(ruleName, result) {
  if (result?.partnerSuit === "H" || result?.partnerSuit === "S") {
    const level = result.bid?.level || 0;
    const range = level === 1 ? "6+ HCP" : "10+ HCP";
    const levelText = level === 1 ? "eenhoogte" : "tweehoogte";
    return `nieuwe kleur op ${levelText}: natuurlijk antwoord in ${suitName(result.suit)} met ${range} en een 4+-kaart. ${handFactsText({ ruleName, result })}`;
  }
  return `natuurlijk antwoord in ${suitName(result.suit)} met voldoende waarden. ${handFactsText({ ruleName, result })}`;
}

function isOpenerAfterNotrumpRule(ruleName) {
  return /openerAfter(One|Two)Nt/.test(ruleName || "");
}

function handFactsText({ ruleName, result, suit = result?.suit, valueMode = "full" } = {}) {
  const parts = [];
  const values = valueText(result, valueMode);
  if (values) parts.push(values);
  const shape = shapeText(result);
  if (shape) parts.push(shape);
  const length = suitLengthText(result, suit);
  if (length && suit && suit !== "NT") parts.push(length);
  const support = supportText(result);
  if (support) parts.push(support);
  parts.push(ruleReferenceText(ruleName));
  return parts.join("; ");
}

function valueText(result, mode = "full") {
  if (!Number.isInteger(result?.hcp)) return "";
  if (mode === "hcp") return `${result.hcp} HCP`;
  if (Number.isInteger(result.points) && result.points !== result.hcp) return `${result.hcp} HCP / ${result.points} totaalpunten`;
  return `${result.hcp} HCP`;
}

function shapeText(result) {
  if (!result?.counts) return "";
  const shape = ["S", "H", "D", "C"].map((suit) => result.counts[suit] || 0).sort((a, b) => b - a).join("-");
  return `${shape} verdeling, ${result.balanced ? "gebalanceerd" : "niet gebalanceerd"}`;
}

function suitLengthText(result, suit = result.suit) {
  const length = result?.counts?.[suit] || result?.length;
  if (!length || !suit || suit === "NT") return "";
  return `${length}-kaart ${suitName(suit)}`;
}

function supportText(result) {
  if (!result?.support || !result.partnerSuit) return "";
  return `${result.support}-kaart ${suitName(result.partnerSuit)}`;
}

function ruleReferenceText(ruleName) {
  return `Regel: ${ruleName || "onbekend"}`;
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
  if (bid.level === 2 && ["D", "H", "S"].includes(bid.strain)) return `zwakke twee in ${suitName(bid.strain)}, ongeveer 6-10 HCP en een zeskaart.`;
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
  els.bidControls.classList.toggle("active-bid-box", state.phase === "bidding" && seatAt(state.turnIndex) === "South");
  if (state.phase !== "bidding" || seatAt(state.turnIndex) !== "South") {
    els.bidControls.setAttribute("aria-hidden", "true");
    return;
  }
  els.bidControls.removeAttribute("aria-hidden");
  const recommendedBidResult = state.guidanceMode ? chooseRecommendedBidResult("South") : null;
  const recommendedBid = recommendedBidResult?.bid || null;

  for (let level = 1; level <= 7; level++) {
    for (const strain of biddingBoxStrains) {
      const bid = bridgeRules.Bid(level, strain);
      const button = biddingButton(formatBid(bid), "bid");
      button.classList.add(`strain-${strain.toLowerCase()}`);
      button.disabled = !isBidHigher(bid, highestBid());
      if (sameCall(recommendedBid, bid)) button.classList.add("recommended-action");
      button.addEventListener("click", () => makeBid("South", bid, recommendedBidResultForCall(recommendedBidResult, bid)));
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
  const doubleBid = bridgeRules.Double();
  if (sameCall(recommendedBid, doubleBid)) double.classList.add("recommended-action");
  double.addEventListener("click", () => makeBid("South", doubleBid, recommendedBidResultForCall(recommendedBidResult, doubleBid)));

  const redouble = biddingButton(t("redouble"), "redouble");
  redouble.disabled = !canRedouble("South");
  const redoubleBid = bridgeRules.Redouble();
  if (sameCall(recommendedBid, redoubleBid)) redouble.classList.add("recommended-action");
  redouble.addEventListener("click", () => makeBid("South", redoubleBid, recommendedBidResultForCall(recommendedBidResult, redoubleBid)));

  const alert = biddingButton(t("alert"), "alert");
  alert.setAttribute("aria-label", t("alertAria"));
  alert.classList.toggle("active-action", state.pendingAlert);
  alert.addEventListener("click", () => {
    state.pendingAlert = !state.pendingAlert;
    renderBidControls();
  });

  const pass = biddingButton(t("pass"), "pass");
  const passBid = bridgeRules.Pass();
  if (sameCall(recommendedBid, passBid)) pass.classList.add("recommended-action");
  pass.addEventListener("click", () => makeBid("South", passBid, recommendedBidResultForCall(recommendedBidResult, passBid)));

  els.bidControls.append(stop, double, redouble, alert, pass);
}

function recommendedBidResultForCall(result, bid) {
  return bidResultMatchesCall(result, bid) ? result : null;
}

function biddingButton(label, className) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = label;
  return button;
}

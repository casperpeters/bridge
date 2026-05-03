(function initFiveCardHighBidExplanationsNl(root) {
  "use strict";

  function explainBidChoiceResult(result) {
    const ruleName = bidRuleName(result);
    if (isPass(result.bid)) return explainPassChoiceResult(ruleName, result);
    if (isDouble(result.bid)) {
      const detail = ruleName === "competitive.negativeDouble"
        ? "negatief doublet: toont waarden en minstens een vierkaart in een ongeboden hoge kleur"
        : "informatiedoublet: 12+ HCP, hoogstens een doubleton in hun kleur en steun voor alle ongeboden kleuren; met 16+ HCP mag een ongeboden kleur slechts een driekaart zijn";
      return t("bidExplanationCompetitive", { detail: `${detail}. ${ruleReferenceText(ruleName)}` });
    }
    if (isRedouble(result.bid)) {
      if (ruleName === "competitive.redoubleAfterPartnerOpeningDouble") {
        const suitText = result.partnerSuit ? ` in ${suitName(result.partnerSuit)}` : "";
        const supportText = Number.isInteger(result.support) && Number.isInteger(result.supportThreshold)
          ? `; je hebt ${result.support} kaart(en) mee waar ${result.supportThreshold} nodig is voor fit`
          : "";
        return t("bidExplanationCompetitive", { detail: `redoublet nadat partner${suitText} opende en de tegenpartij doubleerde: 10+ HCP en geen fit${supportText}. Je toont waarschijnlijk puntenmeerderheid; mogelijk kunnen jullie de tegenpartij later gedoubleerd voor straf down spelen. Partner moet geen steun in zijn kleur verwachten. ${ruleReferenceText(ruleName)}` });
      }
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
    const responderAfterTransferMinimum = result?.openingLevel === 2
      ? `na de Jacoby-transfer na 2SA heeft partner de gevraagde hoge kleur geboden. Met 0-3 HCP en meestal precies een vijfkaart laat antwoorder 3${result.transferSuit || result.suit || " hoog"} spelen; met 4+ HCP zou hij 3SA bieden, en met een zeskaart of langer 4${result.transferSuit || result.suit || " hoog"}${factSuffix}`
      : `na de Jacoby-transfer heeft partner de gevraagde hoge kleur geboden; met een minimum laat antwoorder het contract daar spelen${factSuffix}`;
    const detail = {
      "pass.openingNoAction": `geen opening: te weinig openingskracht en geen geschikte zwakke twee of preempt${factSuffix}`,
      "pass.responseNoAction": `geen antwoord: te weinig waarden of geen passende actie tegenover partner${factSuffix}`,
      "pass.responseWeakTwoNoAction": `pas na partners zwakke twee: onvoldoende eigen speelslagen voor de afgesproken actie, geen bruikbare fit/communicatie, of niet in alle kleuren dekking${weakTwoFactsText(result)}${factSuffix}`,
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
      "pass.openerAfterTransferFiveHeartsFourSpadesMinimum": `na de Jacoby-transfer heeft antwoorder vijf harten en vier schoppen getoond; met een minimum en schoppenfit mag openaar 2S laten spelen${factSuffix}`,
      "pass.openerAfterTransferTwoFiveMajorsChooseHearts": `antwoorder toont twee hoge vijfkaarten; openaar kiest harten door op 4H te passen${factSuffix}`,
      "pass.openerAfterTransferInviteMinimumNoSupport": `na Jacoby-transfer biedt antwoorder 2SA: precies een vijfkaart in de hoge kleur en 8-9 punten. Openaar heeft een minimum en geen driekaart steun, dus hij past${factSuffix}`,
      "pass.openerAfterStaymanNoHeartFitMinimumNotrump": `na Stayman biedt antwoorder SA en ontkent daarmee hartenfit. Openaar heeft een minimum en geen vierkaart schoppen om nog te tonen, dus hij past${factSuffix}`,
      "pass.responderAfterTransferMinimum": responderAfterTransferMinimum,
      "pass.responderAfterFourthSuitAcceptNotrumpGame": `na vierde-kleur-forcing accepteert antwoorder 3SA als eindcontract${factSuffix}`,
      "pass.continuationNoAction": `geen vervolg: geen zinvol herbod binnen de huidige afspraken${factSuffix}`,
      "pass.competitiveNoAction": `geen competitieve actie: geen verantwoord volgbod, steunbod, SA-bod of doublet${factSuffix}`,
      "competitive.takeoutDoubleRebidPassMinimum": `herbieding na partners antwoord op jouw informatiedoublet: met 12-16 HCP accepteer je partners antwoord en pas je${factSuffix}`,
      "competitive.takeoutDoubleRebidPassGame": `partner heeft na jouw informatiedoublet al de manche geboden; in deze versie onderzoek je geen slem en pas je${factSuffix}`,
      "pass.noSeat": `geen speler beschikbaar voor de biedengine${factSuffix}`,
      "pass.unknownCall": `de biedengine herkende geen contractactie${factSuffix}`,
      "pass.noAction": `geen duidelijke systeemactie of te weinig waarden om te bieden${factSuffix}`
    }[ruleName] || `${t("bidExplanationPass")}${factSuffix}`;
    return `${detail}.`;
  }
  
  function bidChoiceExplanationKey(ruleName) {
    const normalized = ruleName.toLowerCase();
    if (ruleName.startsWith("opening.")) return "bidExplanationOpening";
    if (normalized.includes("stayman") || normalized.includes("transfer") || normalized.includes("strongtwoclubs") || normalized.includes("fourthsuit") || normalized.includes("blackwood")) return "bidExplanationArtificial";
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
        return `zwakke twee in ${suitName(result.suit)}: 6-10 HCP, of een lelijke 11-punter die de Regel van 20 niet haalt, met een goede exacte 6-kaart. ${handFactsText({ ruleName, result })}`;
      case "opening.preempt":
        return `preemptieve opening in ${suitName(result.suit)}: 6-10 HCP met een goede ${result.length >= 8 ? "8+-kaart op vierniveau" : "7+-kaart op drieniveau"}. ${handFactsText({ ruleName, result })}`;
      case "opening.ruleOf20OneMajor":
        return `Regel van 20: open de langste kleur; met twee vijfkaarten kies je de hoogste. Deze opening toont minstens een vijfkaart ${suitName(result.suit)}. ${ruleOf20FactsText(result)} ${handFactsText({ ruleName, result })}`;
      case "opening.ruleOf20OneMinor":
        return `Regel van 20: open de gekozen lage kleur; je opent de langste kleur, met twee vijfkaarten de hoogste en met meerdere vierkaarten de laagste. ${ruleOf20FactsText(result)} ${openingMinorReason(result)} ${handFactsText({ ruleName, result })}`;
      case "opening.oneMajor":
        return `12-19 punten met minstens een vijfkaart ${suitName(result.suit)}; open de langste kleur en kies met twee vijfkaarten de hoogste. Er is geen langere lage kleur en geen passend SA-bod. ${handFactsText({ ruleName, result })}`;
      case "opening.oneMinor":
        return `12-19 punten in een kleur op eenhoogte: 1R belooft minstens een vierkaart, 1K kan vanaf een tweekaart. Je opent de langste kleur; met twee vijfkaarten de hoogste en met meerdere vierkaarten de laagste. ${openingMinorReason(result)} ${handFactsText({ ruleName, result })}`;
      case "response.stayman":
        return `Stayman na ${notrumpOpeningText(result)}: met genoeg kracht en een vierkaart hoog zoek je eerst naar een 4-4 fit in harten of schoppen. Zo'n hoge-kleurfit speelt vaak beter dan SA. ${handFactsText({ ruleName, result })}`;
      case "response.transferToH":
        return `Jacoby-transfer naar harten na ${notrumpOpeningText(result)}: met een vijfkaart harten of langer laat je partner harten bieden. Daarmee zoek je een 5-3 fit of een veilige hoge-kleurmanche en blijft de sterke SA-hand leider. ${handFactsText({ ruleName, result, suit: "H" })}`;
      case "response.transferToS":
        return `Jacoby-transfer naar schoppen na ${notrumpOpeningText(result)}: met een vijfkaart schoppen of langer laat je partner schoppen bieden. Daarmee zoek je een 5-3 fit of een veilige hoge-kleurmanche en blijft de sterke SA-hand leider. ${handFactsText({ ruleName, result, suit: "S" })}`;
      case "response.notrumpInvite":
        return `inviterend SA-antwoord: geen vijfkaart hoog voor transfer en geen vierkaart hoog voor Stayman, dus SA is de praktische speelsoort. ${handFactsText({ ruleName, result })}`;
      case "response.notrumpGame":
        return `3SA met manchekracht: geen vijfkaart hoog voor transfer en geen vierkaart hoog voor Stayman. Zonder hoge-kleurfit is 3SA meestal praktischer dan 5K/5R, omdat 3SA maar 9 slagen vraagt. ${handFactsText({ ruleName, result })}`;
      case "response.notrumpSmallSlam":
        return `${notrumpSlamOpeningText(result)} en antwoorder heeft genoeg evenwichtige kracht om samen minstens 33 HCP te garanderen. Zonder vierkaart hoog voor Stayman en zonder vijfkaart hoog voor transfer kiest de regel direct 6SA als eenvoudige kleinslemroute. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "response.notrumpGrandSlam":
        return `${notrumpSlamOpeningText(result)} en antwoorder heeft genoeg evenwichtige kracht om samen minstens 37 HCP te garanderen. Zonder vierkaart hoog voor Stayman en zonder vijfkaart hoog voor transfer kiest de regel direct 7SA als eenvoudige grootslemroute. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "response.strongTwoClubsWaiting":
        return `afwachtend antwoord op sterke 2K. ${handFactsText({ ruleName, result })}`;
      case "response.strongTwoClubsPositive":
        return `positief antwoord op sterke 2K: toont minstens 8 HCP en een vijfkaart met minstens twee tophonneurs uit Aas, Heer en Vrouw${Number.isInteger(result.topHonors) ? `; hier ${result.topHonors}` : ""}. ${handFactsText({ ruleName, result })}`;
      case "response.weakTwoDiamondNotrumpInvite":
        return `2SA na partners zwakke 2R: er is ruitenfit met een ruitenplaatje en genoeg eigen speelslagen om te inviteren${weakTwoFactsText(result)}. ${handFactsText({ ruleName, result })}`;
      case "response.weakTwoDiamondNotrumpGame":
        return `3SA na partners zwakke 2R: er is ruitenfit met een ruitenplaatje en genoeg eigen speelslagen voor de manche${weakTwoFactsText(result)}. ${handFactsText({ ruleName, result })}`;
      case "response.weakTwoMajorInviteRaise":
        return `uitnodigende steun na partners zwakke twee in een hoge kleur: met fit en ongeveer 3 eigen speelslagen ga je naar driehoogte${weakTwoFactsText(result)}. ${handFactsText({ ruleName, result })}`;
      case "response.weakTwoMajorGameRaise":
        return `manchesteun na partners zwakke twee in een hoge kleur: met fit en ongeveer 4+ eigen speelslagen bied je de manche${weakTwoFactsText(result)}. ${handFactsText({ ruleName, result })}`;
      case "response.weakTwoNoFitNotrumpInvite":
        return `2SA zonder bruikbare fit na partners zwakke twee: alleen met voldoende eigen speelslagen en dekking in alle kleuren${weakTwoFactsText(result)}. ${handFactsText({ ruleName, result })}`;
      case "response.weakTwoNoFitNotrumpGame":
        return `3SA zonder bruikbare fit na partners zwakke twee: alleen met voldoende eigen speelslagen en dekking in alle kleuren${weakTwoFactsText(result)}. ${handFactsText({ ruleName, result })}`;
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
        return `antwoord op Stayman: openaar toont een vierkaart hoog als die er is; anders ontkent hij die. Responder kan daarna de hoge-kleurfit spelen of terug naar SA. ${handFactsText({ ruleName, result })}`;
      case "continuation.responderAfterStaymanFitInvite":
        return `tweede bijbod na Stayman: de hoge-kleurfit is gevonden. Met 8-9 punten biedt antwoorder 3${result.fitSuit || result.suit}; dat is een invite, partner biedt de manche alleen met maximum. ${handFactsText({ ruleName, result, suit: result.fitSuit || result.suit, valueMode: "hcp" })}`;
      case "continuation.responderAfterStaymanFitGame":
        return `tweede bijbod na Stayman: de hoge-kleurfit is gevonden en antwoorder heeft manchekracht. Daarom biedt hij direct 4${result.fitSuit || result.suit}. ${handFactsText({ ruleName, result, suit: result.fitSuit || result.suit, valueMode: "hcp" })}`;
      case "continuation.responderAfterStaymanNoFitInvite":
        return `tweede bijbod na Stayman: openaar heeft niet de hoge kleur getoond waarin antwoorder een vierkaart heeft. Met 8-9 punten biedt antwoorder 2SA als invite; openaar beslist verder. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.responderAfterStaymanNoFitGame":
        return `tweede bijbod na Stayman: er is geen hoge-kleurfit gevonden, maar antwoorder heeft manchekracht. Daarom kiest hij 3SA. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.acceptTransfer":
        return `openaar accepteert partners transfer naar ${suitName(result.transferSuit || result.suit)}; responder heeft minstens een vijfkaart. Na 1SA kan responder nog passen, inviteren of de manche bieden. Na 2SA is de hand al sterk genoeg dat responder met 4+ HCP meestal de manche kiest. ${handFactsText({ ruleName, result, suit: result.transferSuit || result.suit })}`;
      case "continuation.responderAfterTransferFiveHeartsFourSpades":
        return `tweede bijbod na Jacoby-transfer: antwoorder heeft precies vijf harten en minstens vier schoppen. Vanaf 8 punten biedt hij 2S om ook de schoppen te tonen; met minder punten past hij op 2H. ${handFactsText({ ruleName, result, suit: "H", valueMode: "hcp" })}`;
      case "continuation.responderAfterTransferFiveSpadesFourHeartsInvite":
        return `tweede bijbod na Jacoby-transfer: antwoorder heeft vijf schoppen en vier harten, maar slechts inviterende kracht. Hij biedt 2SA; 3H zou al op drieniveau zijn en belooft manchekracht. ${handFactsText({ ruleName, result, suit: "S", valueMode: "hcp" })}`;
      case "continuation.responderAfterTransferFiveSpadesFourHeartsGame":
        return `tweede bijbod na Jacoby-transfer: antwoorder heeft vijf schoppen en vier harten. Omdat 3H op drieniveau komt, is dit mancheforcing; openaar mag hier niet op passen. ${handFactsText({ ruleName, result, suit: "S", valueMode: "hcp" })}`;
      case "continuation.responderAfterTransferTwoFiveMajorsGame":
        return `tweede bijbod na Jacoby-transfer: met twee hoge vijfkaarten en manchekracht draagt antwoorder eerst schoppen over en springt daarna naar 4H. Openaar kiest tussen harten en schoppen. ${handFactsText({ ruleName, result, suit: "S", valueMode: "hcp" })}`;
      case "continuation.responderAfterTransferSixCardInvite":
        return `tweede bijbod na Jacoby-transfer: met een zeskaart of langer in ${suitName(result.transferSuit || result.suit)} en inviterende kracht biedt antwoorder 3${result.transferSuit || result.suit}. Partner mag passen of met maximum naar de manche. ${handFactsText({ ruleName, result, suit: result.transferSuit || result.suit, valueMode: "hcp" })}`;
      case "continuation.responderAfterTransferSixCardGame":
        return `${transferRebidIntro(result)}: met een zeskaart of langer in ${suitName(result.transferSuit || result.suit)} kiest antwoorder de hoge-kleurmanche. Na 2SA is 4+ HCP al genoeg om de manche te willen spelen; met zes troeven is 4${result.transferSuit || result.suit} praktischer dan 3SA. ${handFactsText({ ruleName, result, suit: result.transferSuit || result.suit, valueMode: "hcp" })}`;
      case "continuation.responderAfterTransferNotrumpInvite":
        return `tweede bijbod na Jacoby-transfer: met meestal precies een vijfkaart ${suitName(result.transferSuit || result.suit)} en inviterende kracht biedt antwoorder 2SA. Openaar kiest daarna SA of de hoge kleur met steun. ${handFactsText({ ruleName, result, suit: result.transferSuit || result.suit, valueMode: "hcp" })}`;
      case "continuation.responderAfterTransferNotrumpGame":
        return `${transferRebidIntro(result)}: met meestal precies een vijfkaart ${suitName(result.transferSuit || result.suit)} kiest antwoorder SA als manche. Na 2SA betekent dit doorgaans: genoeg voor de manche, maar geen zeskaart om zelf 4${result.transferSuit || result.suit} te spelen; openaar mag met driekaart steun nog naar 4${result.transferSuit || result.suit} corrigeren. ${handFactsText({ ruleName, result, suit: result.transferSuit || result.suit, valueMode: "hcp" })}`;
      case "continuation.blackwoodAsk":
        return `4SA azenvragen: na de geaccepteerde transfer is ${suitName(result.trumpSuit || result.transferSuit || result.suit)} de afgesproken troefkleur. 4SA is kunstmatig en forcing; partner antwoordt 5K met 0 of 4 azen, 5R met 1 aas, 5H met 2 azen en 5S met 3 azen. ${handFactsText({ ruleName, result, suit: result.trumpSuit || result.transferSuit || result.suit, valueMode: "hcp" })}`;
      case "continuation.blackwoodResponse":
        return `antwoord op 4SA azenvragen: ${formatBlackwoodResponse(result)}. Partner mag hierop niet passen; de azenvrager kiest daarna afzwaaien, kleinslem of soms grootslem. ${handFactsText({ ruleName, result, suit: result.trumpSuit || result.suit, valueMode: "hcp" })}`;
      case "continuation.blackwoodSignoff":
        return `afzwaaien na azenvragen: ${blackwoodMissingAcesText(result)} Daarom stopt de regel in 5${result.trumpSuit || result.suit}. ${handFactsText({ ruleName, result, suit: result.trumpSuit || result.suit, valueMode: "hcp" })}`;
      case "continuation.blackwoodSmallSlam":
        return `kleinslem na azenvragen: er ontbreken niet twee azen, dus de regel biedt 6${result.trumpSuit || result.suit}. ${handFactsText({ ruleName, result, suit: result.trumpSuit || result.suit, valueMode: "hcp" })}`;
      case "continuation.blackwoodGrandSlam":
        return `grootslem na azenvragen: alle azen zijn bekend aanwezig en de gezamenlijke ondergrens is minstens 37 HCP. Daarom biedt de regel 7${result.trumpSuit || result.suit}. ${handFactsText({ ruleName, result, suit: result.trumpSuit || result.suit, valueMode: "hcp" })}`;
      case "continuation.openerAfterTransferFiveHeartsFourSpadesChooseMajor":
        return `vervolg na Jacoby-transfer: antwoorder toonde vijf harten en vier schoppen. Openaar kiest een hoge kleur; met maximum kan dat direct de manche zijn. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.openerAfterTransferFiveHeartsFourSpadesNotrump":
        return `vervolg na Jacoby-transfer: antwoorder toonde vijf harten en vier schoppen, maar openaar vindt geen hoge-kleurfit en kiest SA. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.openerAfterTransferFiveSpadesFourHeartsChooseGame":
        return `vervolg na 3H na Jacoby-transfer: 3H belooft vijf schoppen, vier harten en manchekracht. Openaar mag niet passen en kiest 3SA, 4H of 4S. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.openerAfterTransferTwoFiveMajorsChooseSpades":
        return `antwoorder toonde twee hoge vijfkaarten met 4H; openaar corrigeert naar 4S omdat schoppen de betere fit is. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.openerAfterTransferInviteMinimumSupport":
        return `vervolg na 2SA na Jacoby-transfer: antwoorder toont precies een vijfkaart ${suitName(result.transferSuit || result.suit)} en 8-9 punten. Openaar heeft een minimum, maar wel driekaart steun, dus corrigeert hij naar 3${result.transferSuit || result.suit}. ${handFactsText({ ruleName, result, suit: result.transferSuit || result.suit, valueMode: "hcp" })}`;
      case "continuation.openerAfterTransferInviteMaximumSupportGame":
        return `vervolg na 2SA na Jacoby-transfer: antwoorder inviteert met precies een vijfkaart ${suitName(result.transferSuit || result.suit)}. Openaar heeft maximum en driekaart steun, dus hij neemt de invite aan in 4${result.transferSuit || result.suit}. ${handFactsText({ ruleName, result, suit: result.transferSuit || result.suit, valueMode: "hcp" })}`;
      case "continuation.openerAfterTransferInviteMaximumNotrump":
        return `vervolg na 2SA na Jacoby-transfer: antwoorder inviteert, maar openaar heeft geen driekaart steun. Met maximum neemt openaar de invite aan in 3SA. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.openerAfterStaymanNoHeartFitSpadeInvite":
        return `tweede herbieding na Stayman zonder hartenfit: antwoorder biedt 2SA met 8-9 punten. Openaar heeft een minimum, maar wel een vierkaart schoppen; daarom corrigeert hij naar 3S. ${handFactsText({ ruleName, result, suit: "S", valueMode: "hcp" })}`;
      case "continuation.openerAfterStaymanNoHeartFitSpadeGame":
        return `tweede herbieding na Stayman zonder hartenfit: antwoorder biedt SA, maar openaar heeft een vierkaart schoppen. Met maximum of tegenover 3SA kiest openaar de schoppenmanche: 4S. ${handFactsText({ ruleName, result, suit: "S", valueMode: "hcp" })}`;
      case "continuation.openerAfterStaymanNoHeartFitNotrumpGame":
        return `tweede herbieding na Stayman zonder hartenfit: antwoorder biedt 2SA en openaar heeft maximum, maar geen vierkaart schoppenfit. Daarom neemt openaar de invite aan met 3SA. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.openerAfterStaymanNoHeartFitNotrumpInvite":
        return `tweede herbieding na Stayman zonder hartenfit: openaar vindt geen schoppenfit en houdt het in SA. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.openerAfterStaymanInviteFiveCardMajor":
        return `speciale Stayman-situatie: openaar heeft 1SA geopend met een vijfkaart ${suitName(result.fiveCardMajor || result.suit)}. Antwoorder biedt 2SA met 8-9 punten en geen fit in die hoge kleur; met maximum toont openaar zijn vijfkaart op drieniveau als alternatief voor 3SA. ${handFactsText({ ruleName, result, suit: result.fiveCardMajor || result.suit, valueMode: "hcp" })}`;
      case "continuation.openerAfterStaymanNoFitNotrumpGame":
        return `vervolg na Stayman en 2SA: antwoorder inviteert, maar openaar heeft geen vijfkaart in de getoonde hoge kleur om op drieniveau te tonen. Met maximum kiest openaar 3SA. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.openerAfterStaymanNoFitNotrumpInvite":
        return `vervolg na Stayman en 2SA: openaar heeft geen extra reden om uit SA weg te gaan. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
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
      case "continuation.strongTwoClubsJumpRebid":
        return `sprongherbieding na 2K-2R: openaar toont een extra sterke hand met een zeskaart of langer in ${suitName(result.suit)}. Dit is sterker dan de gewone herbieding 2${result.suit}; in deze code gebeurt dit vanaf 24+ HCP of minstens 9 speelslagen. ${handFactsText({ ruleName, result, suit: result.suit, valueMode: "hcp" })}`;
      case "continuation.strongTwoClubsNotrumpRebid":
        return `SA-herbieding na 2K-2R: openaar beschrijft een zeer sterke gebalanceerde hand; 2SA toont ongeveer 23-24 HCP en 3SA 25+ HCP. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.strongTwoClubsSuitRebid":
        return `kleurherbieding na 2K-2R: openaar toont zijn beste lange kleur. Een hoge kleur op tweeniveau is de gewone herbieding; een lage kleur komt door biedruimte op drieniveau. ${handFactsText({ ruleName, result, suit: result.suit, valueMode: "hcp" })}`;
      case "continuation.strongTwoClubsPositiveMajorSupport":
        return `steun na positief antwoord op sterke 2K: partner heeft een goede vijfkaart ${suitName(result.responseSuit || result.suit)} getoond. Met minstens drie kaarten steun kiest openaar direct de hoge-kleurmanche. ${handFactsText({ ruleName, result, suit: result.suit, valueMode: "hcp" })}`;
      case "continuation.strongTwoClubsPositiveNotrumpRebid":
        return `2SA na positief antwoord op sterke 2K: openaar toont een sterk evenwichtig spel met ongeveer 23-24 HCP. Daarna mag partner verder bieden alsof tegenover een 2SA-opening: Stayman en Jacoby-transfer blijven dus beschikbaar. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.strongTwoClubsPositiveNotrumpGame":
        return `3SA na positief antwoord op sterke 2K: openaar toont een zeer sterk evenwichtig spel. Dit kan 25+ HCP zijn, of 23-24 HCP wanneer 2SA door het positieve antwoord op drieniveau niet meer legaal is. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.strongTwoClubsPositiveSuitRebid":
        return `kleurherbieding na positief antwoord op sterke 2K: zonder directe hoge-kleursteun en zonder passend SA-bod laat openaar zijn eigen lange kleur horen. ${handFactsText({ ruleName, result, suit: result.suit, valueMode: "hcp" })}`;
      case "continuation.strongTwoClubsTwoNotrumpStayman":
        return `Stayman na 2K en openaars 2SA-herbieding: partner behandelt 2SA nu als sterke SA-hand en vraagt met 3K naar een vierkaart hoog. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.strongTwoClubsTwoNotrumpTransferToH":
      case "continuation.strongTwoClubsTwoNotrumpTransferToS":
        return `Jacoby-transfer na 2K en openaars 2SA-herbieding: partner behandelt 2SA nu als sterke SA-hand en toont met de transfer een vijfkaart ${suitName(result.transferSuit || result.suit)} of langer. ${handFactsText({ ruleName, result, suit: result.transferSuit || result.suit, valueMode: "hcp" })}`;
      case "continuation.strongTwoClubsTwoNotrumpGame":
        return `3SA na 2K en openaars 2SA-herbieding: zonder Stayman- of transferreden kiest partner de SA-manche tegenover de sterke evenwichtige hand. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.strongTwoClubsTwoNotrumpStaymanAnswer":
        return `antwoord op Stayman na 2K en 2SA: openaar beantwoordt 3K hetzelfde als na een gewone 2SA-opening, dus hij toont een vierkaart hoog of ontkent die met 3R. ${handFactsText({ ruleName, result })}`;
      case "continuation.strongTwoClubsTwoNotrumpAcceptTransfer":
        return `transfer geaccepteerd na 2K en 2SA: openaar biedt de gevraagde hoge kleur, net als na een gewone 2SA-opening. ${handFactsText({ ruleName, result, suit: result.transferSuit || result.suit })}`;
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
      case "continuation.responderPreference":
        return `tweede bijbod met minimum: antwoorder houdt het laag en geeft preferentie voor openaars eerste kleur. ${handFactsText({ ruleName, result })}`;
      case "continuation.responderOneNotrumpMinimum":
        return `tweede bijbod met 6-9 HCP: zolang het nog op eenniveau kan, houdt antwoorder het laag met 1SA. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.responderTwoNotrumpInvite":
        return `tweede bijbod met 10-11 HCP: 2SA is inviterend en belooft geen minimum. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.responderRaiseOpenerSecondSuit":
        return `tweede bijbod: antwoorder steunt openaars tweede kleur met fit. ${handFactsText({ ruleName, result })}`;
      case "continuation.responderRebidOwnSixCard":
        return `tweede bijbod: antwoorder herbiedt de eigen kleur met een zeskaart. ${handFactsText({ ruleName, result })}`;
      case "continuation.responderFourthSuitForcing":
        return `vierde-kleur-forcing: kunstmatig mancheforcing vraagbod; antwoorder heeft genoeg kracht maar nog geen duidelijk eindcontract. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.openerAfterFourthSuitSupport":
        return `antwoord op vierde-kleur-forcing: openaar toont driekaart steun voor antwoorders eerste kleur. ${handFactsText({ ruleName, result })}`;
      case "continuation.openerAfterFourthSuitNotrump":
        return `antwoord op vierde-kleur-forcing: openaar biedt SA met stop in ${suitName(result.stopperSuit || result.fourthSuit)}. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.openerAfterFourthSuitRebidOwnSuit":
        return `antwoord op vierde-kleur-forcing: openaar herbiedt de openingskleur met extra lengte. ${handFactsText({ ruleName, result })}`;
      case "continuation.openerAfterFourthSuitRebidSecondSuit":
        return `antwoord op vierde-kleur-forcing: openaar herbiedt zijn tweede kleur en beschrijft daarmee extra lengte of geen beter SA-/steunbod. ${handFactsText({ ruleName, result })}`;
      case "continuation.responderAfterFourthSuitChooseGame":
        return `na vierde-kleur-forcing kiest antwoorder de beste manche op basis van openaars extra omschrijving. ${handFactsText({ ruleName, result })}`;
      case "continuation.notrumpRebid":
        return `SA-herbieding met een SA-verdeling. ${handFactsText({ ruleName, result })}`;
      case "continuation.rebidOwnSuit":
        return `herbiedt de eigen ${suitName(result.suit)} met een zeskaart. ${handFactsText({ ruleName, result })}`;
      case "continuation.newSuit":
        return `toont een tweede kleur in ${suitName(result.suit)} met een tweekleurenspel. ${handFactsText({ ruleName, result })}`;
      case "competitive.oneNotrumpOvercall":
        return `SA-volgbod met 15-17 HCP, gebalanceerde hand en stop in hun kleur. ${handFactsText({ ruleName, result })}`;
      case "competitive.notrumpOvercallStayman":
        return `Stayman na partners SA-volgbod: vraagt naar een vierkaart hoog; met deze kracht mag de manche worden onderzocht. ${handFactsText({ ruleName, result })}`;
      case "competitive.notrumpOvercallTransferToH":
      case "competitive.notrumpOvercallTransferToS":
        return `transfer na partners SA-volgbod: toont een vijfkaart ${suitName(result.transferSuit)} of langer en laat partner de hoge kleur bieden. ${handFactsText({ ruleName, result })}`;
      case "competitive.notrumpOvercallInvite":
        return `invite na partners SA-volgbod: gebalanceerde hand met inviterende kracht. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "competitive.notrumpOvercallGame":
        return `3SA na partners SA-volgbod: genoeg gezamenlijke kracht voor de manche en geen vierkaart hoog om eerst via Stayman te zoeken. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "competitive.jumpOvercall":
        return `sprongvolgbod met beperkte kracht en een goede zeskaart. ${handFactsText({ ruleName, result })}`;
      case "competitive.simpleOvercall":
        return `natuurlijk volgbod met een goede vijfkaart of langer in ${suitName(result.suit)} en ${result.minimumHcp || (result.bid?.level >= 2 ? 10 : 8)}+ HCP. ${handFactsText({ ruleName, result })}`;
      case "competitive.takeoutDoubleForcedSuit":
        return `biedplicht na partners informatiedoublet: de rechtertegenstander heeft geen bod gedaan, dus je kiest met een zwakke hand de hoogste nog niet door de tegenpartij geboden kleur. ${handFactsText({ ruleName, result })}`;
      case "competitive.takeoutDoubleOneNotrump":
        return `1SA na partners informatiedoublet: 6-9 HCP, SA-verdeling en dekking in ${suitName(result.stopperSuit || result.opponentSuit)}; dit gebeurt alleen zonder betere biedbare vierkaart. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "competitive.takeoutDoubleJumpSuit":
        return `sprongantwoord na partners informatiedoublet: met 9-11 HCP spring je in de langste nog niet door de tegenpartij geboden kleur; bij gelijke lengte kies je de hoogste. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "competitive.takeoutDoubleGame":
        return `manche na partners informatiedoublet: vanaf 12 HCP ga je uit van opening tegenover opening en zorg je dat de partij de manche bereikt. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "competitive.takeoutDoubleVoluntarySuit":
        return `vrijwillig bod na partners informatiedoublet: de tegenpartij heeft na het doublet geboden, dus de biedplicht vervalt; met voldoende HCP bied je een nog niet geboden vierkaart. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "competitive.takeoutDoubleRebidInviteRaise":
        return `invite na partners antwoord op jouw informatiedoublet: met 17-19 HCP en fit steun je partners kleur met een sprong. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "competitive.takeoutDoubleRebidInviteNotrump":
        return `2SA na partners antwoord op jouw informatiedoublet: 17-19 HCP, gebalanceerde hand en dekking in ${suitName(result.stopperSuit || result.opponentSuit)}. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "competitive.takeoutDoubleRebidGameRaise":
        return `manche na partners antwoord op jouw informatiedoublet: met 20+ HCP en fit verhoog je naar de kleurmanche. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "competitive.takeoutDoubleRebidGameNotrump":
        return `3SA na partners antwoord op jouw informatiedoublet: 20+ HCP, gebalanceerde hand en dekking in ${suitName(result.stopperSuit || result.opponentSuit)}. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "competitive.takeoutDoubleRebidAfterJumpGame":
        return `manche na partners sprongantwoord op jouw informatiedoublet: het sprongantwoord is inviterend, dus de doubleerder biedt de manche. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "competitive.takeoutDoubleRebidNatural":
        return `natuurlijke herbieding na partners antwoord op jouw informatiedoublet: met extra kracht toon je een lange speelbare kleur. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "competitive.raisePartnerOvercall":
        if (result.partnerMinTrumpLength >= 6) {
          return `steun voor partners zwakke sprongvolgbod: partner belooft een zeskaart ${suitName(result.partnerSuit)}, dus ${result.support || 0} kaart(en) steun kan al fit zijn; kwetsbaarheid stuurt de manchegrens (${result.gameMinimum || 16}+ fitpunten). ${handFactsText({ ruleName, result })}`;
        }
        return `steun voor partners volgbod met fit in ${suitName(result.partnerSuit)} en ${result.minimumHcp || (result.vulnerable ? 8 : 7)}+ fitpunten${result.vulnerable ? " kwetsbaar" : " niet-kwetsbaar"}. ${handFactsText({ ruleName, result })}`;
      case "competitive.notrumpAfterPartnerOvercall":
        return `${result.bid?.level || ""}SA na partners volgbod: ${result.minimumHcp || 10}+ HCP, gebalanceerde hand en stop in ${suitName(result.stopperSuit || result.opponentSuit)}. ${handFactsText({ ruleName, result })}`;
      case "competitive.newSuitAfterPartnerOvercall":
        return `nieuwe kleur na partners volgbod: eigen goede vijfkaart of langer in ${suitName(result.suit)} en ${result.minimumHcp || 10}+ HCP. ${handFactsText({ ruleName, result })}`;
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
    if (result.playingTricksEligible) return `${result.playingTricks} speelslagen met een lange ${suitName(result.longSuit)}kleur`;
    if (result.hcp >= 20 && result.points !== result.hcp) return "20+ HCP of totaalpunten met een sterke hand";
    return "20+ HCP of totaalpunten met een sterke hand";
  }

  function notrumpOpeningText(result) {
    return result?.openingLevel === 2 || result?.bid?.level === 3 ? "partners 2SA-opening" : "partners 1SA-opening";
  }

  function notrumpSlamOpeningText(result) {
    const openingText = result?.openingLevel === 2 ? "Partner opent 2SA" : "Partner opent 1SA";
    const rangeText = Number.isInteger(result?.openerMinimumHcp) && Number.isInteger(result?.openerMaximumHcp)
      ? ` en toont ${result.openerMinimumHcp}-${result.openerMaximumHcp} HCP`
      : "";
    const minimumText = Number.isInteger(result?.partnershipMinimumHcp)
      ? `; de gezamenlijke ondergrens is ${result.partnershipMinimumHcp} HCP`
      : "";
    return `${openingText}${rangeText}${minimumText}`;
  }

  function transferRebidIntro(result) {
    return result?.openingLevel === 2
      ? "tweede bijbod na Jacoby-transfer over 2SA"
      : "tweede bijbod na Jacoby-transfer";
  }

  function formatBlackwoodResponse(result) {
    if (Number.isInteger(result?.aceCount)) {
      if (result.aceCount === 0 || result.aceCount === 4) return `5K toont ${result.aceCount} azen`;
      return `${bidLabelNl(5, result.suit)} toont ${result.aceCount} ${result.aceCount === 1 ? "aas" : "azen"}`;
    }
    if (result?.bid?.strain === "C") return "5K toont 0 of 4 azen";
    if (result?.bid?.strain === "D") return "5R toont 1 aas";
    if (result?.bid?.strain === "H") return "5H toont 2 azen";
    if (result?.bid?.strain === "S") return "5S toont 3 azen";
    return "partner toont het aantal azen volgens de 5K/5R/5H/5S-tabel";
  }

  function bidLabelNl(level, strain) {
    return `${level}${{ C: "K", D: "R", H: "H", S: "S", NT: "SA" }[strain] || strain || ""}`;
  }

  function blackwoodMissingAcesText(result) {
    if (result?.missingAces === 2) return "Samen missen we twee azen.";
    if (Number.isInteger(result?.missingAces) && result.missingAces > 2) return `Samen missen we ${result.missingAces} azen.`;
    return "Het antwoord is niet eenduidig genoeg om veilig slem te bieden.";
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
  
  function ruleOf20FactsText(result) {
    const longSuits = (result.ruleOf20LongSuits || []).map(suitName).join(" en ");
    if (!longSuits || !Number.isInteger(result.ruleOf20Score)) return "";
    return `Telling: ${result.hcp} HCP + lengte ${longSuits} = ${result.ruleOf20Score}; daarin zitten ${result.ruleOf20LongSuitHcp} HCP.`;
  }

  function weakTwoFactsText(result) {
    const parts = [];
    if (Number.isFinite(result?.ownPlayingTricks)) parts.push(`${result.ownPlayingTricks} eigen speelslag${result.ownPlayingTricks === 1 ? "" : "en"}`);
    if (Number.isInteger(result?.support) && result.partnerSuit) parts.push(`${result.support} kaart(en) mee in ${suitName(result.partnerSuit)}`);
    if (result?.partnerSuit === "D") parts.push(result.partnerSuitHonor ? "met ruitenplaatje" : "zonder ruitenplaatje");
    if (result?.partnerSuitTreatedAsStopped && result?.partnerSuit) parts.push(`partners ${suitName(result.partnerSuit)}kleur telt als dekking/bron`);
    if (Array.isArray(result?.missingStoppers)) {
      parts.push(result.missingStoppers.length ? `geen dekking in ${result.missingStoppers.map(suitName).join(", ")}` : "dekking in alle kleuren");
    }
    return parts.length ? ` (${parts.join("; ")})` : "";
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
    if (result.valuation === "fitPoints" && Number.isInteger(result.fitPoints)) return `${result.hcp} HCP / ${result.fitPoints} fitpunten`;
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
    if (bid.level === 2 && ["D", "H", "S"].includes(bid.strain)) return `zwakke twee in ${suitName(bid.strain)}, meestal 6-10 HCP of een lelijke 11-punter, en een zeskaart.`;
    if (bid.level === 3 && bid.strain !== "NT") return `preemptieve opening in ${suitName(bid.strain)}, meestal een lange kleur en beperkte kracht.`;
    if (bid.level === 1 && (bid.strain === "H" || bid.strain === "S")) return `Vijfkaart Hoog: 12-19 punten met minstens een vijfkaart ${suitName(bid.strain)}; open de langste kleur en met twee vijfkaarten de hoogste.`;
    if (bid.level === 1 && bid.strain === "D") return "Vijfkaart Hoog: 12-19 punten met minstens een vierkaart ruiten; open de langste kleur en met meerdere vierkaarten de laagste.";
    if (bid.level === 1 && bid.strain === "C") return "Vijfkaart Hoog: 12-19 punten, kan vanaf een tweekaart klaveren; 1K is de laagste vierkaart of vangnetopening.";
    return "natuurlijk openingsbod.";
  }
  
  function artificialBidMeaning(bid, context) {
    const opening = context.openingBid;
    if (!opening) return null;
    const partnershipCalls = context.partnershipCalls || [];
    const responseBid = partnershipCalls[1]?.bid || null;
    const openerRebid = partnershipCalls[2]?.bid || null;
    const responderRebid = partnershipCalls[3]?.bid || null;
    const openerThirdBid = partnershipCalls[4]?.bid || null;
    const blackwoodTrump = acceptedTransferTrumpForMeaning(opening, responseBid, openerRebid);
    if (blackwoodTrump && bidEquals(bid, 4, "NT")) {
      return `4SA azenvragen: kunstmatig en forcing met ${suitName(blackwoodTrump)} als afgesproken troefkleur.`;
    }
    if (blackwoodTrump && bidEquals(responderRebid, 4, "NT") && bid.level === 5) {
      if (bid.strain === "C") return "antwoord op 4SA azenvragen: 5K toont 0 of 4 azen.";
      if (bid.strain === "D") return "antwoord op 4SA azenvragen: 5R toont 1 aas.";
      if (bid.strain === "H") return "antwoord op 4SA azenvragen: 5H toont 2 azen.";
      if (bid.strain === "S") return "antwoord op 4SA azenvragen: 5S toont 3 azen.";
    }
    if (blackwoodTrump && bidEquals(responderRebid, 4, "NT") && openerThirdBid && bid.strain === blackwoodTrump) {
      return `eindcontract na azenvragen in ${suitName(blackwoodTrump)}.`;
    }
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
    const strains = [opening?.strain, responseBid?.strain, openerRebid?.strain];
    const fourthSuit = strains.every((strain) => strain && strain !== "NT") && new Set(strains).size === 3
      ? ["C", "D", "H", "S"].find((suit) => !strains.includes(suit))
      : null;
    if (fourthSuit && bidEquals(bid, cheapestLevelForStrainForMeaning(fourthSuit, openerRebid), fourthSuit)) {
      return `vierde-kleur-forcing: kunstmatig mancheforcing vraagbod in ${suitName(fourthSuit)}; vraagt openaar zijn hand verder te beschrijven.`;
    }
    return null;
  }

  function acceptedTransferTrumpForMeaning(opening, responseBid, openerRebid) {
    if (bidEquals(opening, 1, "NT")) {
      if (bidEquals(responseBid, 2, "D") && bidEquals(openerRebid, 2, "H")) return "H";
      if (bidEquals(responseBid, 2, "H") && bidEquals(openerRebid, 2, "S")) return "S";
    }
    if (bidEquals(opening, 2, "NT")) {
      if (bidEquals(responseBid, 3, "D") && bidEquals(openerRebid, 3, "H")) return "H";
      if (bidEquals(responseBid, 3, "H") && bidEquals(openerRebid, 3, "S")) return "S";
    }
    return null;
  }
  
  function cheapestLevelForStrainForMeaning(strain, current) {
    const order = ["C", "D", "H", "S", "NT"];
    if (!current) return 1;
    return order.indexOf(strain) > order.indexOf(current.strain) ? current.level : current.level + 1;
  }
  
  function responseBidMeaning(bid, partnerBid) {
    if (!partnerBid) return continuationBidMeaning(bid);
    if (partnerBid.level === 2 && ["D", "H", "S"].includes(partnerBid.strain)) {
      if (bid.strain === partnerBid.strain) return `steun voor partners zwakke twee in ${suitName(partnerBid.strain)}.`;
      if (bid.strain === "NT") return "SA-antwoord na partners zwakke twee: vraagt genoeg eigen slagen, dekking en/of communicatie.";
    }
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

  root.FiveCardHighBidExplanationsNl = {
    explainBidChoiceResult,
    bidMeaning,
    bidRuleName,
    ruleReferenceText
  };
})(typeof globalThis !== "undefined" ? globalThis : this);

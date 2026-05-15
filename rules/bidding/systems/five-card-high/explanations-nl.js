(function initFiveCardHighBidExplanationsNl(root) {
  "use strict";

  const bridgeRules = root.BridgeRules || loadCommonJsBridgeRules();
  const commonJsFamilyDescriptors = loadCommonJsFamilyDescriptors();

  function isPass(bid) {
    return bridgeRules?.isPass ? bridgeRules.isPass(bid) : root.isPass(bid);
  }

  function isDouble(bid) {
    return bridgeRules?.isDouble ? bridgeRules.isDouble(bid) : root.isDouble(bid);
  }

  function isRedouble(bid) {
    return bridgeRules?.isRedouble ? bridgeRules.isRedouble(bid) : root.isRedouble(bid);
  }

  function bidEquals(bid, level, strain) {
    return bridgeRules?.isContractBid ? bridgeRules.isContractBid(bid) && bid.level === level && bid.strain === strain : root.bidEquals(bid, level, strain);
  }

  function suitName(suit) {
    return root.BridgeTextNl?.suits?.[suit] || root.suitName?.(suit) || suit;
  }

  function t(key, args = {}) {
    if (typeof root.t === "function") return root.t(key, args);
    const template = root.BridgeTextNl?.[key];
    if (!template) return args.detail || key;
    return Object.entries(args).reduce((message, [name, value]) => message.replaceAll(`{${name}}`, value), template);
  }

  function explainBidChoiceResult(result) {
    const ruleName = bidRuleName(result);
    if (isPass(result.bid)) return explainPassChoiceResult(ruleName, result);
    if (isDouble(result.bid)) {
      const detail = "informatiedoublet: 12+ HCP, hoogstens een doubleton in hun kleur en steun voor alle ongeboden kleuren; met 16+ HCP mag een ongeboden kleur slechts een driekaart zijn";
      return t("bidExplanationCompetitive", { detail: `${detail}. ${ruleReferenceText(ruleName)}` });
    }
    if (isRedouble(result.bid)) {
      const detail = familyBidChoiceDetail(ruleName, result)
        || `redoublet met extra waarden nadat de tegenpartij partner heeft gedoubleerd. ${ruleReferenceText(ruleName)}`;
      return t("bidExplanationCompetitive", { detail });
    }
  
    const detail = appendInterferenceContinuationText(bidChoiceDetail(ruleName, result), result);
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
    const familyDetail = familyPassChoiceDetail(ruleName, result, { facts, factSuffix, responderAfterTransferMinimum });
    if (familyDetail) {
      const interferenceText = interferenceContinuationText(result);
      return `${familyDetail}.${interferenceText ? ` ${interferenceText}` : ""}`;
    }
    const detail = {
      "pass.openingNoAction": `geen opening: te weinig openingskracht en geen geschikte zwakke twee of preempt${factSuffix}`,
      "pass.continuationNoAction": `geen vervolg: geen zinvol herbod binnen de huidige afspraken${factSuffix}`,
      "pass.noPartnerBid": `geen partnerbod beschikbaar om op te antwoorden${factSuffix}`,
      "pass.noSeat": `geen speler beschikbaar voor de biedengine${factSuffix}`,
      "pass.unknownCall": `de biedengine herkende geen contractactie${factSuffix}`,
      "pass.noAction": `geen duidelijke systeemactie of te weinig waarden om te bieden${factSuffix}`
    }[ruleName] || `${t("bidExplanationPass")}${factSuffix}`;
    const interferenceText = interferenceContinuationText(result);
    return `${detail}.${interferenceText ? ` ${interferenceText}` : ""}`;
  }

  function appendInterferenceContinuationText(detail, result) {
    const interferenceText = interferenceContinuationText(result);
    return interferenceText ? `${detail} ${interferenceText}` : detail;
  }

  function interferenceContinuationText(result) {
    return result?.interfered ? "De verstoring verandert deze herkenbare fitafspraak niet." : "";
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
    const familyDetail = familyBidChoiceDetail(ruleName, result);
    if (familyDetail) return familyDetail;
    return `${result.reason || "Natuurlijke actie volgens de huidige Vijfkaart-Hoog-afspraken."} ${handFactsText({ ruleName, result })}`;
  }

  function familyBidChoiceDetail(ruleName, result) {
    const helpers = familyExplanationHelpers();
    for (const descriptor of familyExplanationDescriptors()) {
      const detail = descriptor.explainBidChoice?.(ruleName, result, helpers);
      if (detail) return detail;
    }
    return null;
  }

  function familyPassChoiceDetail(ruleName, result, passHelpers = {}) {
    const helpers = familyExplanationHelpers(passHelpers);
    for (const descriptor of familyExplanationDescriptors()) {
      const detail = descriptor.explainPassChoice?.(ruleName, result, helpers);
      if (detail) return detail;
    }
    return null;
  }

  function familyExplanationDescriptors() {
    const registry = root.BridgeBidExplanationParts?.fiveCardHigh?.nl || {};
    const descriptorsById = new Map();
    for (const descriptor of commonJsFamilyDescriptors) {
      if (descriptor?.id) descriptorsById.set(descriptor.id, descriptor);
    }
    for (const descriptor of Object.values(registry)) {
      if (descriptor?.id) descriptorsById.set(descriptor.id, descriptor);
    }
    return [...descriptorsById.values()].sort((left, right) => (left.order || 0) - (right.order || 0));
  }

  function loadCommonJsFamilyDescriptors() {
    if (typeof module !== "object" || !module.exports || typeof require !== "function") return [];
    return [
      require("./opening/explanations-nl.js"),
      require("./responses/notrump/explanations-nl.js"),
      require("./responses/strong-two-clubs/explanations-nl.js"),
      require("./responses/preempts/explanations-nl.js"),
      require("./responses/natural/explanations-nl.js"),
      require("./rebids/notrump-systems/explanations-nl.js"),
      require("./rebids/strong-two-clubs/explanations-nl.js"),
      require("./rebids/blackwood/explanations-nl.js"),
      require("./rebids/fourth-suit-forcing/explanations-nl.js"),
      require("./rebids/opener-rebids/explanations-nl.js"),
      require("./rebids/responder-rebids/explanations-nl.js"),
      require("./competitive/takeout-double/explanations-nl.js"),
      require("./competitive/overcalls/explanations-nl.js"),
      require("./competitive/notrump-overcall-responses/explanations-nl.js"),
      require("./competitive/preempt-defense/explanations-nl.js"),
      require("./competitive/advancer/explanations-nl.js"),
      require("./competitive/general/explanations-nl.js")
    ];
  }

  function loadCommonJsBridgeRules() {
    if (typeof module !== "object" || !module.exports || typeof require !== "function") return null;
    return require("../../../auction.js");
  }

  function familyExplanationHelpers(extra = {}) {
    return {
      suitName,
      t,
      handFactsText,
      weakTwoFactsText,
      notrumpOpeningText,
      notrumpSlamOpeningText,
      transferRebidIntro,
      formatBlackwoodResponse,
      bidLabelNl,
      blackwoodMissingAcesText,
      openingMinorReason,
      ruleOf20FactsText,
      openerAfterNotrumpDetail,
      responseNewSuitDetail,
      responseRaiseDetail,
      valueSummaryText,
      ruleReferenceText,
      strongTwoClubsReason,
      ...extra
    };
  }

  function strongTwoClubsReason(result) {
    if (result.balanced && result.hcp >= 23) return "23+ HCP met een gebalanceerde hand";
    if (result.playingTricksEligible) return `${result.playingTricks} speelslagen met een lange ${suitName(result.longSuit)}kleur`;
    return "20+ HCP met een sterke hand";
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
    if (result?.partnerSuit && result.partnerSuit !== "NT") {
      const level = result.bid?.level || 0;
      const range = level === 1 ? "6+ HCP" : "10+ HCP";
      const levelText = level === 1 ? "eenhoogte" : "tweehoogte";
      return `nieuwe kleur op ${levelText}: natuurlijk antwoord in ${suitName(result.suit)} met ${range} en een 4+-kaart. ${handFactsText({ ruleName, result })}`;
    }
    return `natuurlijk antwoord in ${suitName(result.suit)} met voldoende waarden. ${handFactsText({ ruleName, result })}`;
  }

  function responseRaiseDetail(ruleName, result) {
    if (result?.partnerSuit === "H" || result?.partnerSuit === "S") {
      const suit = suitName(result.partnerSuit);
      const fitText = result.knownFit && Number.isInteger(result.combinedTrumpLength)
        ? `partner belooft minstens een ${result.partnerMinTrumpLength}-kaart, dus met jouw ${result.support}-kaart is er samen minstens een ${result.combinedTrumpLength}-kaart fit`
        : `je hebt ${result.support || 0} kaart(en) steun`;
      const thresholdText = result.raiseLabel === "game"
        ? "Bij steun voor een 1H/1S-opening is de grove ladder: 2 hoog met 6-9 fitpunten, 3 hoog met 10-11 fitpunten, en direct 4 hoog met 12+ fitpunten."
        : "Bij steun voor een 1H/1S-opening bepaalt de fitpuntentelling of je laag blijft, inviteert of de manche biedt.";
      const chosenText = responseRaiseChosenText(result);
      const passedHandText = result.hcp < 12 && result.raiseLabel === "game"
        ? "Dat de hand eerder geen opening was, is niet tegenstrijdig: tegenover partners opening mag de bekende fit worden meegeteld."
        : "";
      return `steun voor partners ${suit}: ${fitText}. ${thresholdText} ${chosenText}${passedHandText ? ` ${passedHandText}` : ""} ${handFactsText({ ruleName, result, suit: null })}`;
    }
    if (result?.partnerSuit === "C" || result?.partnerSuit === "D") {
      const suit = suitName(result.partnerSuit);
      return `steun voor partners ${suit}: na een lage-kleuropening zoekt de regel eerst naar een hoge kleur; als die er niet is, toont steun de fit en kracht. ${responseRaiseChosenText(result)} ${handFactsText({ ruleName, result, suit: null })}`;
    }
    return `steun voor partners ${suitName(result.partnerSuit)}. ${handFactsText({ ruleName, result, suit: null })}`;
  }

  function responseRaiseChosenText(result) {
    const bidText = result?.bid ? bidLabelNl(result.bid.level, result.bid.strain) : "dit bod";
    if (result.raiseLabel === "game" && Number.isInteger(result.raiseMinimum)) {
      return `Deze hand haalt met ${valueSummaryText(result)} de manchegrens, daarom ${bidText}.`;
    }
    if (result.raiseLabel === "invite" && Number.isInteger(result.raiseMinimum) && Number.isInteger(result.raiseMaximum)) {
      return `Deze hand valt met ${valueSummaryText(result)} in de inviterende range ${result.raiseMinimum}-${result.raiseMaximum}, daarom ${bidText}.`;
    }
    if (result.raiseLabel === "single" && Number.isInteger(result.raiseMinimum) && Number.isInteger(result.raiseMaximum)) {
      return `Deze hand valt met ${valueSummaryText(result)} in de steunrange ${result.raiseMinimum}-${result.raiseMaximum}, daarom ${bidText}.`;
    }
    if (result.raiseLabel === "strongMinorSupport" && Number.isInteger(result.raiseMinimum)) {
      return `Deze hand heeft ${valueSummaryText(result)} en is niet geschikt om simpel SA te kiezen, daarom ${bidText}.`;
    }
    return `De hand past bij ${bidText}.`;
  }

  function valueSummaryText(result) {
    if (result?.valuation === "fitPoints" && Number.isInteger(result.fitPoints)) return `${result.fitPoints} fitpunten`;
    if (Number.isInteger(result?.points) && result.points !== result.hcp) return `${result.points} totaalpunten`;
    if (Number.isInteger(result?.hcp)) return `${result.hcp} HCP`;
    return "genoeg waarden";
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
    if (Number.isInteger(result.partnerMinTrumpLength)) {
      return `${result.support}-kaart ${suitName(result.partnerSuit)} tegenover partners bekende ${result.partnerMinTrumpLength}+-kaart`;
    }
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
    if (bid.level === 2 && ["D", "H", "S"].includes(bid.strain)) return `zwakke twee in ${suitName(bid.strain)}, meestal 6-10 HCP of een lelijke 11-punter, en een goede zeskaart.`;
    if ((bid.level === 3 || bid.level === 4) && bid.strain !== "NT") return `preemptieve opening in ${suitName(bid.strain)}, meestal een lange kleur en beperkte kracht.`;
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
    const blackwoodTrump = agreedTrumpForMeaning(partnershipCalls) || acceptedTransferTrumpForMeaning(opening, responseBid, openerRebid);
    if (blackwoodTrump && bidEquals(bid, 4, "NT")) {
      return `4SA azenvragen: kunstmatig en forcing met ${suitName(blackwoodTrump)} als afgesproken troefkleur.`;
    }
    const blackwoodAskIndex = partnershipCalls.findIndex((call) => bidEquals(call?.bid, 4, "NT"));
    const blackwoodAsk = blackwoodAskIndex >= 0 ? partnershipCalls[blackwoodAskIndex]?.bid : responderRebid;
    if (blackwoodTrump && bidEquals(blackwoodAsk, 4, "NT") && bid.level === 5) {
      if (bid.strain === "C") return "antwoord op 4SA azenvragen: 5K toont 0 of 4 azen.";
      if (bid.strain === "D") return "antwoord op 4SA azenvragen: 5R toont 1 aas.";
      if (bid.strain === "H") return "antwoord op 4SA azenvragen: 5H toont 2 azen.";
      if (bid.strain === "S") return "antwoord op 4SA azenvragen: 5S toont 3 azen.";
    }
    if (blackwoodTrump && bidEquals(blackwoodAsk, 4, "NT") && openerThirdBid && bid.strain === blackwoodTrump) {
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

  function agreedTrumpForMeaning(partnershipCalls = []) {
    const auctionAgreement = root.BridgeRulesParts?.biddingFiveCardHighConventions?.auctionAgreementFromPartnershipCalls?.(partnershipCalls);
    if (auctionAgreement?.trumpSuit) return auctionAgreement.trumpSuit;

    const transferTrump = acceptedTransferTrumpForMeaning(
      partnershipCalls[0]?.bid,
      partnershipCalls[1]?.bid,
      partnershipCalls[2]?.bid
    );
    if (transferTrump) return transferTrump;

    let agreedMajor = null;
    for (let index = 0; index < partnershipCalls.length; index++) {
      const call = partnershipCalls[index];
      const strain = call?.bid?.strain;
      if (strain !== "H" && strain !== "S") continue;
      const earlierPartnerCall = partnershipCalls
        .slice(0, index)
        .find((candidate) => candidate.seat !== call.seat && candidate.bid?.strain === strain);
      if (earlierPartnerCall) agreedMajor = strain;
    }
    return agreedMajor;
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
  if (typeof module === "object" && module.exports) module.exports = root.FiveCardHighBidExplanationsNl;
})(typeof globalThis !== "undefined" ? globalThis : this);

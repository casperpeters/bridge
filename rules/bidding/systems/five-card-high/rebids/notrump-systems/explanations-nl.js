(function initfiveCardHighRebidsNotrumpSystemsExplanationsNl(root, factory) {
  const descriptor = factory();
  if (typeof module === "object" && module.exports) module.exports = descriptor;
  root.BridgeBidExplanationParts = root.BridgeBidExplanationParts || {};
  root.BridgeBidExplanationParts.fiveCardHigh = root.BridgeBidExplanationParts.fiveCardHigh || {};
  root.BridgeBidExplanationParts.fiveCardHigh.nl = root.BridgeBidExplanationParts.fiveCardHigh.nl || {};
  root.BridgeBidExplanationParts.fiveCardHigh.nl[descriptor.id] = descriptor;
})(typeof globalThis !== "undefined" ? globalThis : this, function createfiveCardHighRebidsNotrumpSystemsExplanationsNl() {
  "use strict";

  function explainNotrumpSystemRebidChoice(ruleName, result, helpers = {}) {
    const { suitName, handFactsText, weakTwoFactsText, notrumpOpeningText, notrumpSlamOpeningText, transferRebidIntro, formatBlackwoodResponse, bidLabelNl, blackwoodMissingAcesText, openingMinorReason, ruleOf20FactsText, openerAfterNotrumpDetail, responseNewSuitDetail, responseRaiseDetail, valueSummaryText, ruleReferenceText, strongTwoClubsReason, t } = helpers;
    switch (ruleName) {
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
      default:
        return null;
    }
  }

  function explainPassChoice(ruleName, result, helpers = {}) {
    const { suitName, handFactsText, weakTwoFactsText, notrumpOpeningText, notrumpSlamOpeningText, transferRebidIntro, formatBlackwoodResponse, bidLabelNl, blackwoodMissingAcesText, openingMinorReason, ruleOf20FactsText, openerAfterNotrumpDetail, responseNewSuitDetail, responseRaiseDetail, valueSummaryText, ruleReferenceText, strongTwoClubsReason, t, facts, factSuffix, responderAfterTransferMinimum } = helpers;
    switch (ruleName) {
      case "pass.openerAfterTransferFiveHeartsFourSpadesMinimum":
        return `na de Jacoby-transfer heeft antwoorder vijf harten en vier schoppen getoond; met een minimum en schoppenfit mag openaar 2S laten spelen${factSuffix}`;
      case "pass.openerAfterTransferTwoFiveMajorsChooseHearts":
        return `antwoorder toont twee hoge vijfkaarten; openaar kiest harten door op 4H te passen${factSuffix}`;
      case "pass.openerAfterTransferInviteMinimumNoSupport":
        return `na Jacoby-transfer biedt antwoorder 2SA: precies een vijfkaart in de hoge kleur en 8-9 punten. Openaar heeft een minimum en geen driekaart steun, dus hij past${factSuffix}`;
      case "pass.openerAfterStaymanNoHeartFitMinimumNotrump":
        return `na Stayman biedt antwoorder SA en ontkent daarmee hartenfit. Openaar heeft een minimum en geen vierkaart schoppen om nog te tonen, dus hij past${factSuffix}`;
      case "pass.responderAfterTransferMinimum":
        return responderAfterTransferMinimum;
      default:
        return null;
    }
  }

  return {
    id: "rebids.notrumpSystems",
    order: 30,
    explainBidChoice: explainNotrumpSystemRebidChoice,
    explainPassChoice
  };
});

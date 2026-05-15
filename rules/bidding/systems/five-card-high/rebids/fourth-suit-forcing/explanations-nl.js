(function initfiveCardHighRebidsFourthSuitForcingExplanationsNl(root, factory) {
  const descriptor = factory();
  if (typeof module === "object" && module.exports) module.exports = descriptor;
  root.BridgeBidExplanationParts = root.BridgeBidExplanationParts || {};
  root.BridgeBidExplanationParts.fiveCardHigh = root.BridgeBidExplanationParts.fiveCardHigh || {};
  root.BridgeBidExplanationParts.fiveCardHigh.nl = root.BridgeBidExplanationParts.fiveCardHigh.nl || {};
  root.BridgeBidExplanationParts.fiveCardHigh.nl[descriptor.id] = descriptor;
})(typeof globalThis !== "undefined" ? globalThis : this, function createfiveCardHighRebidsFourthSuitForcingExplanationsNl() {
  "use strict";

  function explainFourthSuitForcingChoice(ruleName, result, helpers = {}) {
    const { suitName, handFactsText, weakTwoFactsText, notrumpOpeningText, notrumpSlamOpeningText, transferRebidIntro, formatBlackwoodResponse, bidLabelNl, blackwoodMissingAcesText, openingMinorReason, ruleOf20FactsText, openerAfterNotrumpDetail, responseNewSuitDetail, responseRaiseDetail, valueSummaryText, ruleReferenceText, strongTwoClubsReason, t } = helpers;
    switch (ruleName) {
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
      default:
        return null;
    }
  }

  function explainPassChoice(ruleName, result, helpers = {}) {
    const { suitName, handFactsText, weakTwoFactsText, notrumpOpeningText, notrumpSlamOpeningText, transferRebidIntro, formatBlackwoodResponse, bidLabelNl, blackwoodMissingAcesText, openingMinorReason, ruleOf20FactsText, openerAfterNotrumpDetail, responseNewSuitDetail, responseRaiseDetail, valueSummaryText, ruleReferenceText, strongTwoClubsReason, t, facts, factSuffix, responderAfterTransferMinimum } = helpers;
    switch (ruleName) {
      case "pass.responderAfterFourthSuitAcceptNotrumpGame":
        return `na vierde-kleur-forcing accepteert antwoorder 3SA als eindcontract${factSuffix}`;
      default:
        return null;
    }
  }

  return {
    id: "rebids.fourthSuitForcing",
    order: 32,
    explainBidChoice: explainFourthSuitForcingChoice,
    explainPassChoice
  };
});

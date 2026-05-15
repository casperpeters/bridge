(function initfiveCardHighResponsesNaturalExplanationsNl(root, factory) {
  const descriptor = factory();
  if (typeof module === "object" && module.exports) module.exports = descriptor;
  root.BridgeBidExplanationParts = root.BridgeBidExplanationParts || {};
  root.BridgeBidExplanationParts.fiveCardHigh = root.BridgeBidExplanationParts.fiveCardHigh || {};
  root.BridgeBidExplanationParts.fiveCardHigh.nl = root.BridgeBidExplanationParts.fiveCardHigh.nl || {};
  root.BridgeBidExplanationParts.fiveCardHigh.nl[descriptor.id] = descriptor;
})(typeof globalThis !== "undefined" ? globalThis : this, function createfiveCardHighResponsesNaturalExplanationsNl() {
  "use strict";

  function explainNaturalResponseChoice(ruleName, result, helpers = {}) {
    const { suitName, handFactsText, weakTwoFactsText, notrumpOpeningText, notrumpSlamOpeningText, transferRebidIntro, formatBlackwoodResponse, bidLabelNl, blackwoodMissingAcesText, openingMinorReason, ruleOf20FactsText, openerAfterNotrumpDetail, responseNewSuitDetail, responseRaiseDetail, valueSummaryText, ruleReferenceText, strongTwoClubsReason, t } = helpers;
    switch (ruleName) {
      case "response.raise":
        return responseRaiseDetail(ruleName, result);
      case "response.notrump":
        return `gebalanceerd antwoord zonder betere fit of nieuwe kleur. ${handFactsText({ ruleName, result })}`;
      case "response.newSuit":
        return responseNewSuitDetail(ruleName, result);
      default:
        return null;
    }
  }

  function explainPassChoice(ruleName, result, helpers = {}) {
    const { suitName, handFactsText, weakTwoFactsText, notrumpOpeningText, notrumpSlamOpeningText, transferRebidIntro, formatBlackwoodResponse, bidLabelNl, blackwoodMissingAcesText, openingMinorReason, ruleOf20FactsText, openerAfterNotrumpDetail, responseNewSuitDetail, responseRaiseDetail, valueSummaryText, ruleReferenceText, strongTwoClubsReason, t, facts, factSuffix, responderAfterTransferMinimum } = helpers;
    switch (ruleName) {
      case "pass.responseNoAction":
        return `geen antwoord: te weinig waarden of geen passende actie tegenover partner${factSuffix}`;
      default:
        return null;
    }
  }

  return {
    id: "responses.natural",
    order: 23,
    explainBidChoice: explainNaturalResponseChoice,
    explainPassChoice
  };
});

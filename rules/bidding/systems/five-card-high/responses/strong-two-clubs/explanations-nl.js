(function initfiveCardHighResponsesStrongTwoClubsExplanationsNl(root, factory) {
  const descriptor = factory();
  if (typeof module === "object" && module.exports) module.exports = descriptor;
  root.BridgeBidExplanationParts = root.BridgeBidExplanationParts || {};
  root.BridgeBidExplanationParts.fiveCardHigh = root.BridgeBidExplanationParts.fiveCardHigh || {};
  root.BridgeBidExplanationParts.fiveCardHigh.nl = root.BridgeBidExplanationParts.fiveCardHigh.nl || {};
  root.BridgeBidExplanationParts.fiveCardHigh.nl[descriptor.id] = descriptor;
})(typeof globalThis !== "undefined" ? globalThis : this, function createfiveCardHighResponsesStrongTwoClubsExplanationsNl() {
  "use strict";

  function explainStrongTwoClubsResponseChoice(ruleName, result, helpers = {}) {
    const { suitName, handFactsText, weakTwoFactsText, notrumpOpeningText, notrumpSlamOpeningText, transferRebidIntro, formatBlackwoodResponse, bidLabelNl, blackwoodMissingAcesText, openingMinorReason, ruleOf20FactsText, openerAfterNotrumpDetail, responseNewSuitDetail, responseRaiseDetail, valueSummaryText, ruleReferenceText, strongTwoClubsReason, t } = helpers;
    switch (ruleName) {
      case "response.strongTwoClubsWaiting":
        return `afwachtend antwoord op sterke 2K. ${handFactsText({ ruleName, result })}`;
      case "response.strongTwoClubsPositive":
        return `positief antwoord op sterke 2K: toont minstens 8 HCP en een vijfkaart met minstens twee tophonneurs uit Aas, Heer en Vrouw${Number.isInteger(result.topHonors) ? `; hier ${result.topHonors}` : ""}. ${handFactsText({ ruleName, result })}`;
      default:
        return null;
    }
  }

  function explainPassChoice(ruleName, result, helpers = {}) {
    const { suitName, handFactsText, weakTwoFactsText, notrumpOpeningText, notrumpSlamOpeningText, transferRebidIntro, formatBlackwoodResponse, bidLabelNl, blackwoodMissingAcesText, openingMinorReason, ruleOf20FactsText, openerAfterNotrumpDetail, responseNewSuitDetail, responseRaiseDetail, valueSummaryText, ruleReferenceText, strongTwoClubsReason, t, facts, factSuffix, responderAfterTransferMinimum } = helpers;
    return null;
  }

  return {
    id: "responses.strongTwoClubs",
    order: 21,
    explainBidChoice: explainStrongTwoClubsResponseChoice,
    explainPassChoice
  };
});

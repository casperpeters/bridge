(function initfiveCardHighCompetitiveNotrumpOvercallResponsesExplanationsNl(root, factory) {
  const descriptor = factory();
  if (typeof module === "object" && module.exports) module.exports = descriptor;
  root.BridgeBidExplanationParts = root.BridgeBidExplanationParts || {};
  root.BridgeBidExplanationParts.fiveCardHigh = root.BridgeBidExplanationParts.fiveCardHigh || {};
  root.BridgeBidExplanationParts.fiveCardHigh.nl = root.BridgeBidExplanationParts.fiveCardHigh.nl || {};
  root.BridgeBidExplanationParts.fiveCardHigh.nl[descriptor.id] = descriptor;
})(typeof globalThis !== "undefined" ? globalThis : this, function createfiveCardHighCompetitiveNotrumpOvercallResponsesExplanationsNl() {
  "use strict";

  function explainNotrumpOvercallResponseChoice(ruleName, result, helpers = {}) {
    const { suitName, handFactsText, weakTwoFactsText, notrumpOpeningText, notrumpSlamOpeningText, transferRebidIntro, formatBlackwoodResponse, bidLabelNl, blackwoodMissingAcesText, openingMinorReason, ruleOf20FactsText, openerAfterNotrumpDetail, responseNewSuitDetail, responseRaiseDetail, valueSummaryText, ruleReferenceText, strongTwoClubsReason, t } = helpers;
    switch (ruleName) {
      case "competitive.notrumpOvercallStayman":
        return `Stayman na partners SA-volgbod: vraagt naar een vierkaart hoog; met deze kracht mag de manche worden onderzocht. ${handFactsText({ ruleName, result })}`;
      case "competitive.notrumpOvercallTransferToH":
      case "competitive.notrumpOvercallTransferToS":
        return `transfer na partners SA-volgbod: toont een vijfkaart ${suitName(result.transferSuit)} of langer en laat partner de hoge kleur bieden. ${handFactsText({ ruleName, result })}`;
      case "competitive.notrumpOvercallInvite":
        return `invite na partners SA-volgbod: gebalanceerde hand met inviterende kracht. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "competitive.notrumpOvercallGame":
        return `3SA na partners SA-volgbod: genoeg gezamenlijke kracht voor de manche en geen vierkaart hoog om eerst via Stayman te zoeken. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      default:
        return null;
    }
  }

  function explainPassChoice(ruleName, result, helpers = {}) {
    const { suitName, handFactsText, weakTwoFactsText, notrumpOpeningText, notrumpSlamOpeningText, transferRebidIntro, formatBlackwoodResponse, bidLabelNl, blackwoodMissingAcesText, openingMinorReason, ruleOf20FactsText, openerAfterNotrumpDetail, responseNewSuitDetail, responseRaiseDetail, valueSummaryText, ruleReferenceText, strongTwoClubsReason, t, facts, factSuffix, responderAfterTransferMinimum } = helpers;
    return null;
  }

  return {
    id: "competitive.notrumpOvercallResponses",
    order: 41,
    explainBidChoice: explainNotrumpOvercallResponseChoice,
    explainPassChoice
  };
});

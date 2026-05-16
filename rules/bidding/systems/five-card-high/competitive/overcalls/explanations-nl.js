(function initfiveCardHighCompetitiveOvercallsExplanationsNl(root, factory) {
  const descriptor = factory();
  if (typeof module === "object" && module.exports) module.exports = descriptor;
  root.BridgeBidExplanationParts = root.BridgeBidExplanationParts || {};
  root.BridgeBidExplanationParts.fiveCardHigh = root.BridgeBidExplanationParts.fiveCardHigh || {};
  root.BridgeBidExplanationParts.fiveCardHigh.nl = root.BridgeBidExplanationParts.fiveCardHigh.nl || {};
  root.BridgeBidExplanationParts.fiveCardHigh.nl[descriptor.id] = descriptor;
})(typeof globalThis !== "undefined" ? globalThis : this, function createfiveCardHighCompetitiveOvercallsExplanationsNl() {
  "use strict";

  function explainOvercallChoice(ruleName, result, helpers = {}) {
    const { suitName, handFactsText, weakTwoFactsText, notrumpOpeningText, notrumpSlamOpeningText, transferRebidIntro, formatBlackwoodResponse, bidLabelNl, blackwoodMissingAcesText, openingMinorReason, ruleOf20FactsText, openerAfterNotrumpDetail, responseNewSuitDetail, responseRaiseDetail, valueSummaryText, ruleReferenceText, strongTwoClubsReason, t } = helpers;
    switch (ruleName) {
      case "competitive.oneNotrumpOvercall":
        return `SA-volgbod met 15-17 punten, gebalanceerde hand en stop in hun kleur. ${handFactsText({ ruleName, result })}`;
      case "competitive.jumpOvercall":
        return `sprongvolgbod met beperkte kracht en een goede zeskaart. ${handFactsText({ ruleName, result })}`;
      case "competitive.protectiveOneMajor":
        return `beschermend bod in de uitpas: na twee passen op hun lage-kleuropening komt de app nog in de bieding met een goede vijfkaart ${suitName(result.suit)} en 8+ punten. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "competitive.strongOneMajorOvercall":
        return `sterk natuurlijk volgbod in een hoge kleur: 17-19 punten met een goede vijfkaart ${suitName(result.suit)}. De app gebruikt dit alleen als 1SA en een informatiedoublet de hand niet goed beschrijven. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "competitive.simpleOvercall":
        if (result.exceptionalSuitQuality) {
          return `kwetsbaar volgbod op eenhoogte met 9 punten: alleen toegestaan door de uitzonderlijk sterke vijfkaart ${suitName(result.suit)} met drie tophonneurs. Normaal blijft de grens ${result.normalMinimumHcp || 10}+ punten kwetsbaar. ${handFactsText({ ruleName, result })}`;
        }
        return `natuurlijk volgbod met een goede vijfkaart of langer in ${suitName(result.suit)} en ${result.minimumHcp || (result.bid?.level >= 2 ? 10 : 8)}+ punten. ${handFactsText({ ruleName, result })}`;
      default:
        return null;
    }
  }

  function explainPassChoice(ruleName, result, helpers = {}) {
    const { suitName, handFactsText, weakTwoFactsText, notrumpOpeningText, notrumpSlamOpeningText, transferRebidIntro, formatBlackwoodResponse, bidLabelNl, blackwoodMissingAcesText, openingMinorReason, ruleOf20FactsText, openerAfterNotrumpDetail, responseNewSuitDetail, responseRaiseDetail, valueSummaryText, ruleReferenceText, strongTwoClubsReason, t, facts, factSuffix, responderAfterTransferMinimum } = helpers;
    return null;
  }

  return {
    id: "competitive.overcalls",
    order: 40,
    explainBidChoice: explainOvercallChoice,
    explainPassChoice
  };
});

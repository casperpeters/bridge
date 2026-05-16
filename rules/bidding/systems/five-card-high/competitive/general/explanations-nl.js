(function initfiveCardHighCompetitiveGeneralExplanationsNl(root, factory) {
  const descriptor = factory();
  if (typeof module === "object" && module.exports) module.exports = descriptor;
  root.BridgeBidExplanationParts = root.BridgeBidExplanationParts || {};
  root.BridgeBidExplanationParts.fiveCardHigh = root.BridgeBidExplanationParts.fiveCardHigh || {};
  root.BridgeBidExplanationParts.fiveCardHigh.nl = root.BridgeBidExplanationParts.fiveCardHigh.nl || {};
  root.BridgeBidExplanationParts.fiveCardHigh.nl[descriptor.id] = descriptor;
})(typeof globalThis !== "undefined" ? globalThis : this, function createfiveCardHighCompetitiveGeneralExplanationsNl() {
  "use strict";

  function explainGeneralCompetitiveChoice(ruleName, result, helpers = {}) {
    const { suitName, handFactsText, weakTwoFactsText, notrumpOpeningText, notrumpSlamOpeningText, transferRebidIntro, formatBlackwoodResponse, bidLabelNl, blackwoodMissingAcesText, openingMinorReason, ruleOf20FactsText, openerAfterNotrumpDetail, responseNewSuitDetail, responseRaiseDetail, valueSummaryText, ruleReferenceText, strongTwoClubsReason, t } = helpers;
    switch (ruleName) {
      case "competitive.redoubleAfterPartnerOpeningDouble": {
        const suitText = result.partnerSuit ? ` in ${suitName(result.partnerSuit)}` : "";
        const supportText = Number.isInteger(result.support) && Number.isInteger(result.supportThreshold)
          ? `; je hebt ${result.support} kaart(en) mee waar ${result.supportThreshold} nodig is voor fit`
          : "";
        return `redoublet nadat partner${suitText} opende en de tegenpartij doubleerde: 10+ punten en geen fit${supportText}. Je toont waarschijnlijk puntenmeerderheid; mogelijk kunnen jullie de tegenpartij later gedoubleerd voor straf down spelen. Partner moet geen steun in zijn kleur verwachten. ${ruleReferenceText(ruleName)}`;
      }
      case "competitive.raisePartner":
        return `verhoging van partners kleur. ${handFactsText({ ruleName, result })}`;
      case "competitive.notrump":
        return `competitief SA-bod met gebalanceerde waarden en dekking. ${handFactsText({ ruleName, result })}`;
      case "competitive.newSuit":
        return `competitieve nieuwe kleur in ${suitName(result.suit)} met speelbare lengte. ${handFactsText({ ruleName, result })}`;

      default:
        return null;
    }
  }

  function explainPassChoice(ruleName, result, helpers = {}) {
    const { suitName, handFactsText, weakTwoFactsText, notrumpOpeningText, notrumpSlamOpeningText, transferRebidIntro, formatBlackwoodResponse, bidLabelNl, blackwoodMissingAcesText, openingMinorReason, ruleOf20FactsText, openerAfterNotrumpDetail, responseNewSuitDetail, responseRaiseDetail, valueSummaryText, ruleReferenceText, strongTwoClubsReason, t, facts, factSuffix, responderAfterTransferMinimum } = helpers;
    switch (ruleName) {
      case "pass.competitiveNoAction":
        return `geen competitieve actie: geen verantwoord volgbod, steunbod, SA-bod of doublet${factSuffix}`;
      default:
        return null;
    }
  }

  return {
    id: "competitive.general",
    order: 45,
    explainBidChoice: explainGeneralCompetitiveChoice,
    explainPassChoice
  };
});

(function initfiveCardHighCompetitiveAdvancerExplanationsNl(root, factory) {
  const descriptor = factory();
  if (typeof module === "object" && module.exports) module.exports = descriptor;
  root.BridgeBidExplanationParts = root.BridgeBidExplanationParts || {};
  root.BridgeBidExplanationParts.fiveCardHigh = root.BridgeBidExplanationParts.fiveCardHigh || {};
  root.BridgeBidExplanationParts.fiveCardHigh.nl = root.BridgeBidExplanationParts.fiveCardHigh.nl || {};
  root.BridgeBidExplanationParts.fiveCardHigh.nl[descriptor.id] = descriptor;
})(typeof globalThis !== "undefined" ? globalThis : this, function createfiveCardHighCompetitiveAdvancerExplanationsNl() {
  "use strict";

  function explainAdvancerChoice(ruleName, result, helpers = {}) {
    const { suitName, handFactsText, weakTwoFactsText, notrumpOpeningText, notrumpSlamOpeningText, transferRebidIntro, formatBlackwoodResponse, bidLabelNl, blackwoodMissingAcesText, openingMinorReason, ruleOf20FactsText, openerAfterNotrumpDetail, responseNewSuitDetail, responseRaiseDetail, valueSummaryText, ruleReferenceText, strongTwoClubsReason, t } = helpers;
    switch (ruleName) {
      case "competitive.raisePartnerOvercall":
        if (result.partnerMinTrumpLength >= 6) {
          return `steun voor partners zwakke sprongvolgbod: partner belooft een zeskaart ${suitName(result.partnerSuit)}, dus ${result.support || 0} kaart(en) steun kan al fit zijn; kwetsbaarheid stuurt de manchegrens (${result.gameMinimum || 16}+ fitpunten). ${handFactsText({ ruleName, result })}`;
        }
        return `steun voor partners volgbod met fit in ${suitName(result.partnerSuit)} en ${result.minimumHcp || (result.vulnerable ? 8 : 7)}+ fitpunten${result.vulnerable ? " kwetsbaar" : " niet-kwetsbaar"}. ${handFactsText({ ruleName, result })}`;
      case "competitive.notrumpAfterPartnerOvercall":
        return `${result.bid?.level || ""}SA na partners volgbod: ${result.minimumHcp || 10}+ punten, gebalanceerde hand en stop in ${suitName(result.stopperSuit || result.opponentSuit)}. ${handFactsText({ ruleName, result })}`;
      case "competitive.newSuitAfterPartnerOvercall":
        return `nieuwe kleur na partners volgbod: eigen goede vijfkaart of langer in ${suitName(result.suit)} en ${result.minimumHcp || 10}+ punten. ${handFactsText({ ruleName, result })}`;
      case "competitive.minorFitNotrumpGameAfterOvercall":
        return `3SA boven lage-kleurmanche: met gebalanceerde manchewaarden, fit in partners ${suitName(result.partnerSuit)} en stop in ${suitName(result.stopperSuit || result.opponentSuit)} is 3SA meestal praktischer dan 5 ${suitName(result.partnerSuit)}. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      default:
        return null;
    }
  }

  function explainPassChoice(ruleName, result, helpers = {}) {
    const { suitName, handFactsText, weakTwoFactsText, notrumpOpeningText, notrumpSlamOpeningText, transferRebidIntro, formatBlackwoodResponse, bidLabelNl, blackwoodMissingAcesText, openingMinorReason, ruleOf20FactsText, openerAfterNotrumpDetail, responseNewSuitDetail, responseRaiseDetail, valueSummaryText, ruleReferenceText, strongTwoClubsReason, t, facts, factSuffix, responderAfterTransferMinimum } = helpers;
    return null;
  }

  return {
    id: "competitive.advancer",
    order: 44,
    explainBidChoice: explainAdvancerChoice,
    explainPassChoice
  };
});

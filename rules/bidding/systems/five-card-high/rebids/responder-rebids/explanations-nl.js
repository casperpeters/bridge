(function initfiveCardHighRebidsResponderRebidsExplanationsNl(root, factory) {
  const descriptor = factory();
  if (typeof module === "object" && module.exports) module.exports = descriptor;
  root.BridgeBidExplanationParts = root.BridgeBidExplanationParts || {};
  root.BridgeBidExplanationParts.fiveCardHigh = root.BridgeBidExplanationParts.fiveCardHigh || {};
  root.BridgeBidExplanationParts.fiveCardHigh.nl = root.BridgeBidExplanationParts.fiveCardHigh.nl || {};
  root.BridgeBidExplanationParts.fiveCardHigh.nl[descriptor.id] = descriptor;
})(typeof globalThis !== "undefined" ? globalThis : this, function createfiveCardHighRebidsResponderRebidsExplanationsNl() {
  "use strict";

  function explainResponderRebidChoice(ruleName, result, helpers = {}) {
    const { suitName, handFactsText, weakTwoFactsText, notrumpOpeningText, notrumpSlamOpeningText, transferRebidIntro, formatBlackwoodResponse, bidLabelNl, blackwoodMissingAcesText, openingMinorReason, ruleOf20FactsText, openerAfterNotrumpDetail, responseNewSuitDetail, responseRaiseDetail, valueSummaryText, ruleReferenceText, strongTwoClubsReason, t } = helpers;
    switch (ruleName) {
      case "continuation.raisePartner":
        return `gevonden fit: steun voor partners kleur. ${handFactsText({ ruleName, result })}`;
      case "continuation.acceptMajorInvite":
        return `invite aangenomen: na de enkele steun heeft responder de hoge range; met 8+ punten biedt hij de manche. ${handFactsText({ ruleName, result })}`;
      case "continuation.responderPreference":
        return `tweede bijbod met minimum: antwoorder houdt het laag en geeft preferentie voor openaars eerste kleur. ${handFactsText({ ruleName, result })}`;
      case "continuation.responderOneNotrumpMinimum":
        return `tweede bijbod met 6-9 punten: zolang het nog op eenniveau kan, houdt antwoorder het laag met 1SA. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.responderTwoNotrumpInvite":
        return `tweede bijbod met 10-11 punten: 2SA is inviterend en belooft geen minimum. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.responderAfterTwoNotrumpRebidGame":
        return `na openaars natuurlijke 2SA-herbieding: openaar toont ongeveer 18-19 punten met een SA-verdeling. Met 8+ punten en geen hoge-kleurfit kiest antwoorder 3SA. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.responderStrongSecondMajor":
        return `sterk tweede bijbod in de andere hoge kleur: antwoorder toont een 5-4 hoog spel en genoeg kracht om verder naar de beste manche te zoeken. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.responderRaiseOpenerSecondSuit":
        return `tweede bijbod: antwoorder steunt openaars tweede kleur met fit. ${handFactsText({ ruleName, result })}`;
      case "continuation.responderRebidOwnSixCard":
        return `tweede bijbod: antwoorder herbiedt de eigen kleur met een zeskaart. ${handFactsText({ ruleName, result })}`;
      case "continuation.notrumpRebid":
        return `SA-herbieding met een SA-verdeling. ${handFactsText({ ruleName, result })}`;
      case "continuation.newSuit":
        return `toont een tweede kleur in ${suitName(result.suit)} met een tweekleurenspel. ${handFactsText({ ruleName, result })}`;
      default:
        return null;
    }
  }

  function explainPassChoice(ruleName, result, helpers = {}) {
    const { suitName, handFactsText, weakTwoFactsText, notrumpOpeningText, notrumpSlamOpeningText, transferRebidIntro, formatBlackwoodResponse, bidLabelNl, blackwoodMissingAcesText, openingMinorReason, ruleOf20FactsText, openerAfterNotrumpDetail, responseNewSuitDetail, responseRaiseDetail, valueSummaryText, ruleReferenceText, strongTwoClubsReason, t, facts, factSuffix, responderAfterTransferMinimum } = helpers;
    switch (ruleName) {
      case "pass.responderAfterMajorRaiseGame":
        return `pas na 1 hoog - 2 hoog - 4 hoog: partner heeft de manche geboden na jouw gewone steun. Zonder duidelijke slemzone en genoeg azen blijft 4 hoog het eindcontract${factSuffix}`;
      case "pass.declineMajorInvite":
        return `invite afgeslagen: na de enkele steun heeft responder de lage range; met 6-7 punten past hij${factSuffix}`;
      default:
        return null;
    }
  }

  return {
    id: "rebids.responderRebids",
    order: 34,
    explainBidChoice: explainResponderRebidChoice,
    explainPassChoice
  };
});

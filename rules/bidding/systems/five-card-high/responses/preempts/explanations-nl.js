(function initfiveCardHighResponsesPreemptsExplanationsNl(root, factory) {
  const descriptor = factory();
  if (typeof module === "object" && module.exports) module.exports = descriptor;
  root.BridgeBidExplanationParts = root.BridgeBidExplanationParts || {};
  root.BridgeBidExplanationParts.fiveCardHigh = root.BridgeBidExplanationParts.fiveCardHigh || {};
  root.BridgeBidExplanationParts.fiveCardHigh.nl = root.BridgeBidExplanationParts.fiveCardHigh.nl || {};
  root.BridgeBidExplanationParts.fiveCardHigh.nl[descriptor.id] = descriptor;
})(typeof globalThis !== "undefined" ? globalThis : this, function createfiveCardHighResponsesPreemptsExplanationsNl() {
  "use strict";

  function explainPreemptResponseChoice(ruleName, result, helpers = {}) {
    const { suitName, handFactsText, weakTwoFactsText, notrumpOpeningText, notrumpSlamOpeningText, transferRebidIntro, formatBlackwoodResponse, bidLabelNl, blackwoodMissingAcesText, openingMinorReason, ruleOf20FactsText, openerAfterNotrumpDetail, responseNewSuitDetail, responseRaiseDetail, valueSummaryText, ruleReferenceText, strongTwoClubsReason, t } = helpers;
    switch (ruleName) {
      case "response.weakTwoDiamondNotrumpInvite":
        return `2SA na partners zwakke 2R: er is ruitenfit met een ruitenplaatje en genoeg eigen speelslagen om te inviteren${weakTwoFactsText(result)}. ${handFactsText({ ruleName, result })}`;
      case "response.weakTwoDiamondNotrumpGame":
        return `3SA na partners zwakke 2R: er is ruitenfit met een ruitenplaatje en genoeg eigen speelslagen voor de manche${weakTwoFactsText(result)}. ${handFactsText({ ruleName, result })}`;
      case "response.weakTwoMajorInviteRaise":
        return `uitnodigende steun na partners zwakke twee in een hoge kleur: met fit en ongeveer 3 eigen speelslagen ga je naar driehoogte${weakTwoFactsText(result)}. ${handFactsText({ ruleName, result })}`;
      case "response.weakTwoMajorGameRaise":
        return `manchesteun na partners zwakke twee in een hoge kleur: met fit en ongeveer 4+ eigen speelslagen bied je de manche${weakTwoFactsText(result)}. ${handFactsText({ ruleName, result })}`;
      case "response.weakTwoNoFitNotrumpInvite":
        return `2SA zonder bruikbare fit na partners zwakke twee: alleen met voldoende eigen speelslagen en dekking in alle kleuren${weakTwoFactsText(result)}. ${handFactsText({ ruleName, result })}`;
      case "response.weakTwoNoFitNotrumpGame":
        return `3SA zonder bruikbare fit na partners zwakke twee: alleen met voldoende eigen speelslagen en dekking in alle kleuren${weakTwoFactsText(result)}. ${handFactsText({ ruleName, result })}`;
      case "response.raisePreempt":
        if (result.partnerSuit === "C" || result.partnerSuit === "D") {
          return `steun voor partners lage-kleurpreempt: met fit, extreme verdeling en genoeg eigen speelslagen kies je de lage-kleurmanche${weakTwoFactsText(result)}. ${handFactsText({ ruleName, result })}`;
        }
        return `steun voor partners hoge-kleurpreempt: met fit en minstens drie eigen speelslagen verhoog je naar de manche${weakTwoFactsText(result)}. ${handFactsText({ ruleName, result })}`;
      case "response.notrumpOverPreempt":
        return `3SA tegenover partners preempt: genoeg eigen speelslagen, dekking in de zijkleuren en communicatie met partners lange kleur${weakTwoFactsText(result)}. ${handFactsText({ ruleName, result })}`;
      case "response.newSuitOverPreempt":
        return `nieuwe kleur tegenover partners preempt, met eigen kleurkwaliteit. ${handFactsText({ ruleName, result })}`;
      default:
        return null;
    }
  }

  function explainPassChoice(ruleName, result, helpers = {}) {
    const { suitName, handFactsText, weakTwoFactsText, notrumpOpeningText, notrumpSlamOpeningText, transferRebidIntro, formatBlackwoodResponse, bidLabelNl, blackwoodMissingAcesText, openingMinorReason, ruleOf20FactsText, openerAfterNotrumpDetail, responseNewSuitDetail, responseRaiseDetail, valueSummaryText, ruleReferenceText, strongTwoClubsReason, t, facts, factSuffix, responderAfterTransferMinimum } = helpers;
    switch (ruleName) {
      case "pass.responseWeakTwoNoAction":
        return `pas na partners zwakke twee: onvoldoende eigen speelslagen voor de afgesproken actie, geen bruikbare fit/communicatie, of niet in alle kleuren dekking${weakTwoFactsText(result)}${factSuffix}`;
      case "pass.responsePreemptNoAction":
        return `pas na partners preempt: onvoldoende eigen speelslagen voor de manche, geen bruikbare aansluiting/communicatie, of niet in alle kleuren dekking${weakTwoFactsText(result)}${factSuffix}`;
      default:
        return null;
    }
  }

  return {
    id: "responses.preempts",
    order: 22,
    explainBidChoice: explainPreemptResponseChoice,
    explainPassChoice
  };
});

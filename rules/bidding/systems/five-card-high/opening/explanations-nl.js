(function initfiveCardHighOpeningExplanationsNl(root, factory) {
  const descriptor = factory();
  if (typeof module === "object" && module.exports) module.exports = descriptor;
  root.BridgeBidExplanationParts = root.BridgeBidExplanationParts || {};
  root.BridgeBidExplanationParts.fiveCardHigh = root.BridgeBidExplanationParts.fiveCardHigh || {};
  root.BridgeBidExplanationParts.fiveCardHigh.nl = root.BridgeBidExplanationParts.fiveCardHigh.nl || {};
  root.BridgeBidExplanationParts.fiveCardHigh.nl[descriptor.id] = descriptor;
})(typeof globalThis !== "undefined" ? globalThis : this, function createfiveCardHighOpeningExplanationsNl() {
  "use strict";

  function explainOpeningBidChoice(ruleName, result, helpers = {}) {
    const { suitName, handFactsText, weakTwoFactsText, notrumpOpeningText, notrumpSlamOpeningText, transferRebidIntro, formatBlackwoodResponse, bidLabelNl, blackwoodMissingAcesText, openingMinorReason, ruleOf20FactsText, openerAfterNotrumpDetail, responseNewSuitDetail, responseRaiseDetail, valueSummaryText, ruleReferenceText, strongTwoClubsReason, t } = helpers;
    switch (ruleName) {
      case "opening.oneNotrump":
        return `Vijfkaart Hoog: open 1SA met 15-17 HCP en een gebalanceerde hand. ${handFactsText({ ruleName, result })}`;
      case "opening.twoNotrump":
        return `Vijfkaart Hoog: open 2SA met 20-22 HCP en een gebalanceerde hand. ${handFactsText({ ruleName, result })}`;
      case "opening.strongTwoClubs":
        return `sterke kunstmatige 2K: ${strongTwoClubsReason(result)}. ${handFactsText({ ruleName, result })}`;
      case "opening.weakTwo":
        if (result.exceptionalSixPointPreempt && result.vulnerable) {
          return `kwetsbare zwakke twee in ${suitName(result.suit)}: de bijzondere 6-punts hand met een sterke 7+-kaart wordt lager geopend dan een preempt op driehoogte. ${handFactsText({ ruleName, result })}`;
        }
        return `zwakke twee in ${suitName(result.suit)}: 6-10 HCP, of een lelijke 11-punter die de Regel van 20 niet haalt, met een goede exacte 6-kaart. ${handFactsText({ ruleName, result })}`;
      case "opening.preempt":
        if (result.exceptionalSixPointPreempt) {
          return `preemptieve opening in ${suitName(result.suit)}: dit is de uitzonderlijke 6-punts hand, niet kwetsbaar, met een ${result.length >= 8 ? "8+-kaart voor vierhoogte" : "7-kaart voor driehoogte"} waarin alleen de aas ontbreekt. ${handFactsText({ ruleName, result })}`;
        }
        return `preemptieve opening in ${suitName(result.suit)}: 7-10 HCP met een goede ${result.length >= 8 ? "8+-kaart op vierniveau" : "7+-kaart op drieniveau"} en minstens twee honneurs in de kleur. ${handFactsText({ ruleName, result })}`;
      case "opening.ruleOf20OneMajor":
        return `Regel van 20: open de langste kleur; met twee vijfkaarten kies je de hoogste. Deze opening toont minstens een vijfkaart ${suitName(result.suit)}. ${ruleOf20FactsText(result)} ${handFactsText({ ruleName, result })}`;
      case "opening.ruleOf20OneMinor":
        return `Regel van 20: open de gekozen lage kleur; je opent de langste kleur, met twee vijfkaarten de hoogste en met meerdere vierkaarten de laagste. ${ruleOf20FactsText(result)} ${openingMinorReason(result)} ${handFactsText({ ruleName, result })}`;
      case "opening.oneMajor":
        return `12-19 punten met minstens een vijfkaart ${suitName(result.suit)}; open de langste kleur en kies met twee vijfkaarten de hoogste. Er is geen langere lage kleur en geen passend SA-bod. ${handFactsText({ ruleName, result })}`;
      case "opening.oneMinor":
        return `12-19 punten in een kleur op eenhoogte: 1R belooft minstens een vierkaart, 1K kan vanaf een tweekaart. Je opent de langste kleur; met twee vijfkaarten de hoogste en met meerdere vierkaarten de laagste. ${openingMinorReason(result)} ${handFactsText({ ruleName, result })}`;
      default:
        return null;
    }
  }

  function explainPassChoice(ruleName, result, helpers = {}) {
    const { suitName, handFactsText, weakTwoFactsText, notrumpOpeningText, notrumpSlamOpeningText, transferRebidIntro, formatBlackwoodResponse, bidLabelNl, blackwoodMissingAcesText, openingMinorReason, ruleOf20FactsText, openerAfterNotrumpDetail, responseNewSuitDetail, responseRaiseDetail, valueSummaryText, ruleReferenceText, strongTwoClubsReason, t, facts, factSuffix, responderAfterTransferMinimum } = helpers;
    return null;
  }

  return {
    id: "opening",
    order: 10,
    explainBidChoice: explainOpeningBidChoice,
    explainPassChoice
  };
});

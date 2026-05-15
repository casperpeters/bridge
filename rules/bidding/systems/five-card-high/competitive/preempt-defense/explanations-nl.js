(function initfiveCardHighCompetitivePreemptDefenseExplanationsNl(root, factory) {
  const descriptor = factory();
  if (typeof module === "object" && module.exports) module.exports = descriptor;
  root.BridgeBidExplanationParts = root.BridgeBidExplanationParts || {};
  root.BridgeBidExplanationParts.fiveCardHigh = root.BridgeBidExplanationParts.fiveCardHigh || {};
  root.BridgeBidExplanationParts.fiveCardHigh.nl = root.BridgeBidExplanationParts.fiveCardHigh.nl || {};
  root.BridgeBidExplanationParts.fiveCardHigh.nl[descriptor.id] = descriptor;
})(typeof globalThis !== "undefined" ? globalThis : this, function createfiveCardHighCompetitivePreemptDefenseExplanationsNl() {
  "use strict";

  function explainPreemptDefenseChoice(ruleName, result, helpers = {}) {
    const { suitName, handFactsText, weakTwoFactsText, notrumpOpeningText, notrumpSlamOpeningText, transferRebidIntro, formatBlackwoodResponse, bidLabelNl, blackwoodMissingAcesText, openingMinorReason, ruleOf20FactsText, openerAfterNotrumpDetail, responseNewSuitDetail, responseRaiseDetail, valueSummaryText, ruleReferenceText, strongTwoClubsReason, t } = helpers;
    switch (ruleName) {
      case "competitive.weakTwoDefenseSuitOvercall":
        return `volgbod na een zwakke twee van de tegenpartij: een redelijke vijfkaart of langer en 12-15 HCP. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "competitive.weakTwoDefenseDouble":
        if (result.strongOwnSuit) {
          return `informatiedoublet na een zwakke twee: 16+ HCP en een zeer goede eigen ${suitName(result.strongOwnSuit)}kleur; na partners antwoord kun je die kleur bieden. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
        }
        return `informatiedoublet na een zwakke twee: 12+ HCP, kort in ${suitName(result.opponentSuit)}, en aansluiting in de overige kleuren. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "competitive.weakTwoDefenseNotrumpInvite":
        return `2SA-volgbod na een zwakke twee: 15-18 HCP, evenwichtige verdeling en dekking in ${suitName(result.stopperSuit || result.opponentSuit)}. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "competitive.weakTwoDefenseNotrumpGame":
        return `3SA-volgbod na een zwakke twee: 19+ HCP, evenwichtige verdeling en dekking in ${suitName(result.stopperSuit || result.opponentSuit)}. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "competitive.preemptDefenseSuitOvercall":
        return `volgbod na een preemptieve opening: op driehoogte met een redelijke vijfkaart of langer, minstens twee honneurs en 13-18 HCP. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "competitive.preemptDefenseDouble":
        if (result.strongOwnSuit) {
          return `informatiedoublet na een preemptieve opening: 19+ HCP en een zeer goede eigen ${suitName(result.strongOwnSuit)}kleur; na partners antwoord kun je die kleur bieden. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
        }
        return `informatiedoublet na een preemptieve opening: 13+ HCP, kort in ${suitName(result.opponentSuit)}, en aansluiting in de overige kleuren. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "competitive.preemptDefenseNotrumpGame":
        return `3SA-volgbod na een preemptieve opening: 19+ HCP, evenwichtige verdeling, dekking in ${suitName(result.stopperSuit || result.opponentSuit)} en redelijke dekking in alle kleuren. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      default:
        return null;
    }
  }

  function explainPassChoice(ruleName, result, helpers = {}) {
    const { suitName, handFactsText, weakTwoFactsText, notrumpOpeningText, notrumpSlamOpeningText, transferRebidIntro, formatBlackwoodResponse, bidLabelNl, blackwoodMissingAcesText, openingMinorReason, ruleOf20FactsText, openerAfterNotrumpDetail, responseNewSuitDetail, responseRaiseDetail, valueSummaryText, ruleReferenceText, strongTwoClubsReason, t, facts, factSuffix, responderAfterTransferMinimum } = helpers;
    return null;
  }

  return {
    id: "competitive.preemptDefense",
    order: 42,
    explainBidChoice: explainPreemptDefenseChoice,
    explainPassChoice
  };
});

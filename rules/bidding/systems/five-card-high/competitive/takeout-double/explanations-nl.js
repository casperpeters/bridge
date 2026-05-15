(function initfiveCardHighCompetitiveTakeoutDoubleExplanationsNl(root, factory) {
  const descriptor = factory();
  if (typeof module === "object" && module.exports) module.exports = descriptor;
  root.BridgeBidExplanationParts = root.BridgeBidExplanationParts || {};
  root.BridgeBidExplanationParts.fiveCardHigh = root.BridgeBidExplanationParts.fiveCardHigh || {};
  root.BridgeBidExplanationParts.fiveCardHigh.nl = root.BridgeBidExplanationParts.fiveCardHigh.nl || {};
  root.BridgeBidExplanationParts.fiveCardHigh.nl[descriptor.id] = descriptor;
})(typeof globalThis !== "undefined" ? globalThis : this, function createfiveCardHighCompetitiveTakeoutDoubleExplanationsNl() {
  "use strict";

  function explainTakeoutDoubleChoice(ruleName, result, helpers = {}) {
    const { suitName, handFactsText, weakTwoFactsText, notrumpOpeningText, notrumpSlamOpeningText, transferRebidIntro, formatBlackwoodResponse, bidLabelNl, blackwoodMissingAcesText, openingMinorReason, ruleOf20FactsText, openerAfterNotrumpDetail, responseNewSuitDetail, responseRaiseDetail, valueSummaryText, ruleReferenceText, strongTwoClubsReason, t } = helpers;
    switch (ruleName) {
      case "competitive.takeoutDouble":
        return `informatiedoublet: 12+ HCP, kort in ${suitName(result.opponentSuit)}, en steun voor de ongeboden kleuren; met 16+ HCP mag een ongeboden kleur soms een driekaart zijn. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "competitive.takeoutDoubleForcedSuit":
        return `biedplicht na partners informatiedoublet: de rechtertegenstander heeft geen bod gedaan, dus je kiest met een zwakke hand de hoogste nog niet door de tegenpartij geboden kleur. ${handFactsText({ ruleName, result })}`;
      case "competitive.takeoutDoubleOneNotrump":
        return `1SA na partners informatiedoublet: 6-9 HCP, SA-verdeling en dekking in ${suitName(result.stopperSuit || result.opponentSuit)}; dit gebeurt alleen zonder betere biedbare vierkaart. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "competitive.takeoutDoubleJumpSuit":
        return `sprongantwoord na partners informatiedoublet: met 9-11 HCP spring je in de langste nog niet door de tegenpartij geboden kleur; bij gelijke lengte kies je de hoogste. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "competitive.takeoutDoubleGame":
        return `manche na partners informatiedoublet: vanaf 12 HCP ga je uit van opening tegenover opening en zorg je dat de partij de manche bereikt. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "competitive.takeoutDoubleVoluntarySuit":
        return `vrijwillig bod na partners informatiedoublet: de tegenpartij heeft na het doublet geboden, dus de biedplicht vervalt; met voldoende HCP bied je een nog niet geboden vierkaart. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "competitive.takeoutDoubleRebidInviteRaise":
        return `invite na partners antwoord op jouw informatiedoublet: met 17-19 HCP en fit steun je partners kleur met een sprong. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "competitive.takeoutDoubleRebidInviteNotrump":
        return `2SA na partners antwoord op jouw informatiedoublet: 17-19 HCP, gebalanceerde hand en dekking in ${suitName(result.stopperSuit || result.opponentSuit)}. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "competitive.takeoutDoubleRebidGameRaise":
        return `manche na partners antwoord op jouw informatiedoublet: met 20+ HCP en fit verhoog je naar de kleurmanche. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "competitive.takeoutDoubleRebidGameNotrump":
        return `3SA na partners antwoord op jouw informatiedoublet: 20+ HCP, gebalanceerde hand en dekking in ${suitName(result.stopperSuit || result.opponentSuit)}. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "competitive.takeoutDoubleRebidAfterJumpGame":
        return `manche na partners sprongantwoord op jouw informatiedoublet: het sprongantwoord is inviterend, dus de doubleerder biedt de manche. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "competitive.takeoutDoubleRebidNatural":
        return `natuurlijke herbieding na partners antwoord op jouw informatiedoublet: met extra kracht toon je een lange speelbare kleur. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      default:
        return null;
    }
  }

  function explainPassChoice(ruleName, result, helpers = {}) {
    const { suitName, handFactsText, weakTwoFactsText, notrumpOpeningText, notrumpSlamOpeningText, transferRebidIntro, formatBlackwoodResponse, bidLabelNl, blackwoodMissingAcesText, openingMinorReason, ruleOf20FactsText, openerAfterNotrumpDetail, responseNewSuitDetail, responseRaiseDetail, valueSummaryText, ruleReferenceText, strongTwoClubsReason, t, facts, factSuffix, responderAfterTransferMinimum } = helpers;
    switch (ruleName) {
      case "competitive.takeoutDoubleRebidPassMinimum":
        return `herbieding na partners antwoord op jouw informatiedoublet: met 12-16 HCP accepteer je partners antwoord en pas je${factSuffix}`;
      case "competitive.takeoutDoubleRebidPassGame":
        return `partner heeft na jouw informatiedoublet al de manche geboden; in deze versie onderzoek je geen slem en pas je${factSuffix}`;
      default:
        return null;
    }
  }

  return {
    id: "competitive.takeoutDouble",
    order: 43,
    explainBidChoice: explainTakeoutDoubleChoice,
    explainPassChoice
  };
});

(function initfiveCardHighResponsesNotrumpExplanationsNl(root, factory) {
  const descriptor = factory();
  if (typeof module === "object" && module.exports) module.exports = descriptor;
  root.BridgeBidExplanationParts = root.BridgeBidExplanationParts || {};
  root.BridgeBidExplanationParts.fiveCardHigh = root.BridgeBidExplanationParts.fiveCardHigh || {};
  root.BridgeBidExplanationParts.fiveCardHigh.nl = root.BridgeBidExplanationParts.fiveCardHigh.nl || {};
  root.BridgeBidExplanationParts.fiveCardHigh.nl[descriptor.id] = descriptor;
})(typeof globalThis !== "undefined" ? globalThis : this, function createfiveCardHighResponsesNotrumpExplanationsNl() {
  "use strict";

  function explainNotrumpResponseChoice(ruleName, result, helpers = {}) {
    const { suitName, handFactsText, weakTwoFactsText, notrumpOpeningText, notrumpSlamOpeningText, transferRebidIntro, formatBlackwoodResponse, bidLabelNl, blackwoodMissingAcesText, openingMinorReason, ruleOf20FactsText, openerAfterNotrumpDetail, responseNewSuitDetail, responseRaiseDetail, valueSummaryText, ruleReferenceText, strongTwoClubsReason, t } = helpers;
    switch (ruleName) {
      case "response.stayman":
        return `Stayman na ${notrumpOpeningText(result)}: met genoeg kracht en een vierkaart hoog zoek je eerst naar een 4-4 fit in harten of schoppen. Zo'n hoge-kleurfit speelt vaak beter dan SA. ${handFactsText({ ruleName, result })}`;
      case "response.transferToH":
        return `Jacoby-transfer naar harten na ${notrumpOpeningText(result)}: met een vijfkaart harten of langer laat je partner harten bieden. Daarmee zoek je een 5-3 fit of een veilige hoge-kleurmanche en blijft de sterke SA-hand leider. ${handFactsText({ ruleName, result, suit: "H" })}`;
      case "response.transferToS":
        return `Jacoby-transfer naar schoppen na ${notrumpOpeningText(result)}: met een vijfkaart schoppen of langer laat je partner schoppen bieden. Daarmee zoek je een 5-3 fit of een veilige hoge-kleurmanche en blijft de sterke SA-hand leider. ${handFactsText({ ruleName, result, suit: "S" })}`;
      case "response.notrumpInvite":
        return `inviterend SA-antwoord: geen vijfkaart hoog voor transfer en geen vierkaart hoog voor Stayman, dus SA is de praktische speelsoort. ${handFactsText({ ruleName, result })}`;
      case "response.notrumpGame":
        return `3SA met manchekracht: geen vijfkaart hoog voor transfer en geen vierkaart hoog voor Stayman. Zonder hoge-kleurfit is 3SA meestal praktischer dan 5K/5R, omdat 3SA maar 9 slagen vraagt. ${handFactsText({ ruleName, result })}`;
      case "response.notrumpSmallSlam":
        return `${notrumpSlamOpeningText(result)} en antwoorder heeft genoeg evenwichtige kracht om samen minstens 33 punten te garanderen. Zonder vierkaart hoog voor Stayman en zonder vijfkaart hoog voor transfer kiest de regel direct 6SA als eenvoudige kleinslemroute. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "response.notrumpGrandSlam":
        return `${notrumpSlamOpeningText(result)} en antwoorder heeft genoeg evenwichtige kracht om samen minstens 37 punten te garanderen. Zonder vierkaart hoog voor Stayman en zonder vijfkaart hoog voor transfer kiest de regel direct 7SA als eenvoudige grootslemroute. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      default:
        return null;
    }
  }

  function explainPassChoice(ruleName, result, helpers = {}) {
    const { suitName, handFactsText, weakTwoFactsText, notrumpOpeningText, notrumpSlamOpeningText, transferRebidIntro, formatBlackwoodResponse, bidLabelNl, blackwoodMissingAcesText, openingMinorReason, ruleOf20FactsText, openerAfterNotrumpDetail, responseNewSuitDetail, responseRaiseDetail, valueSummaryText, ruleReferenceText, strongTwoClubsReason, t, facts, factSuffix, responderAfterTransferMinimum } = helpers;
    return null;
  }

  return {
    id: "responses.notrump",
    order: 20,
    explainBidChoice: explainNotrumpResponseChoice,
    explainPassChoice
  };
});

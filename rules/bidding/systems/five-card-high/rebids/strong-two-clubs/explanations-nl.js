(function initFiveCardHighStrongTwoClubsRebidExplanationsNl(root, factory) {
  const descriptor = factory();
  if (typeof module === "object" && module.exports) module.exports = descriptor;
  root.BridgeBidExplanationParts = root.BridgeBidExplanationParts || {};
  root.BridgeBidExplanationParts.fiveCardHigh = root.BridgeBidExplanationParts.fiveCardHigh || {};
  root.BridgeBidExplanationParts.fiveCardHigh.nl = root.BridgeBidExplanationParts.fiveCardHigh.nl || {};
  root.BridgeBidExplanationParts.fiveCardHigh.nl[descriptor.id] = descriptor;
})(typeof globalThis !== "undefined" ? globalThis : this, function createFiveCardHighStrongTwoClubsRebidExplanationsNl() {
  "use strict";

  function explainStrongTwoClubsRebidChoice(ruleName, result, helpers = {}) {
    const suitName = helpers.suitName || ((suit) => suit);
    const handFactsText = helpers.handFactsText || (() => "");

    switch (ruleName) {
      case "continuation.strongTwoClubsJumpRebid":
        return `sprongherbieding na 2K-2R: openaar toont een extra sterke hand met een zeskaart of langer in ${suitName(result.suit)}. Dit is sterker dan de gewone herbieding 2${result.suit}; in deze code gebeurt dit vanaf 24+ punten of minstens 9 speelslagen. ${handFactsText({ ruleName, result, suit: result.suit, valueMode: "hcp" })}`;
      case "continuation.strongTwoClubsNotrumpRebid":
        return `SA-herbieding na 2K-2R: openaar beschrijft een zeer sterke gebalanceerde hand; 2SA toont ongeveer 23-24 punten en 3SA 25+ punten. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.strongTwoClubsSuitRebid":
        return `kleurherbieding na 2K-2R: openaar toont zijn beste lange kleur. Een hoge kleur op tweeniveau is de gewone herbieding; een lage kleur komt door biedruimte op drieniveau. ${handFactsText({ ruleName, result, suit: result.suit, valueMode: "hcp" })}`;
      case "continuation.strongTwoClubsPositiveMajorSupport":
        return `steun na positief antwoord op sterke 2K: partner heeft een goede vijfkaart ${suitName(result.responseSuit || result.suit)} getoond. Met minstens drie kaarten steun kiest openaar direct de hoge-kleurmanche. ${handFactsText({ ruleName, result, suit: result.suit, valueMode: "hcp" })}`;
      case "continuation.strongTwoClubsPositiveNotrumpRebid":
        return `2SA na positief antwoord op sterke 2K: openaar toont een sterk evenwichtig spel met ongeveer 23-24 punten. Daarna mag partner verder bieden alsof tegenover een 2SA-opening: Stayman en Jacoby-transfer blijven dus beschikbaar. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.strongTwoClubsPositiveNotrumpGame":
        return `3SA na positief antwoord op sterke 2K: openaar toont een zeer sterk evenwichtig spel. Dit kan 25+ punten zijn, of 23-24 punten wanneer 2SA door het positieve antwoord op drieniveau niet meer legaal is. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.strongTwoClubsPositiveSuitRebid":
        return `kleurherbieding na positief antwoord op sterke 2K: zonder directe hoge-kleursteun en zonder passend SA-bod laat openaar zijn eigen lange kleur horen. ${handFactsText({ ruleName, result, suit: result.suit, valueMode: "hcp" })}`;
      case "continuation.strongTwoClubsTwoNotrumpStayman":
        return `Stayman na 2K en openaars 2SA-herbieding: partner behandelt 2SA nu als sterke SA-hand en vraagt met 3K naar een vierkaart hoog. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.strongTwoClubsTwoNotrumpTransferToH":
      case "continuation.strongTwoClubsTwoNotrumpTransferToS":
        return `Jacoby-transfer na 2K en openaars 2SA-herbieding: partner behandelt 2SA nu als sterke SA-hand en toont met de transfer een vijfkaart ${suitName(result.transferSuit || result.suit)} of langer. ${handFactsText({ ruleName, result, suit: result.transferSuit || result.suit, valueMode: "hcp" })}`;
      case "continuation.strongTwoClubsTwoNotrumpGame":
        return `3SA na 2K en openaars 2SA-herbieding: zonder Stayman- of transferreden kiest partner de SA-manche tegenover de sterke evenwichtige hand. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.strongTwoClubsTwoNotrumpStaymanAnswer":
        return `antwoord op Stayman na 2K en 2SA: openaar beantwoordt 3K hetzelfde als na een gewone 2SA-opening, dus hij toont een vierkaart hoog of ontkent die met 3R. ${handFactsText({ ruleName, result })}`;
      case "continuation.strongTwoClubsTwoNotrumpAcceptTransfer":
        return `transfer geaccepteerd na 2K en 2SA: openaar biedt de gevraagde hoge kleur, net als na een gewone 2SA-opening. ${handFactsText({ ruleName, result, suit: result.transferSuit || result.suit })}`;
      default:
        return null;
    }
  }

  function explainPassChoice() {
    return null;
  }

  return {
    id: "rebids.strongTwoClubs",
    order: 29,
    explainBidChoice: explainStrongTwoClubsRebidChoice,
    explainPassChoice
  };
});

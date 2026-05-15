(function initfiveCardHighRebidsBlackwoodExplanationsNl(root, factory) {
  const descriptor = factory();
  if (typeof module === "object" && module.exports) module.exports = descriptor;
  root.BridgeBidExplanationParts = root.BridgeBidExplanationParts || {};
  root.BridgeBidExplanationParts.fiveCardHigh = root.BridgeBidExplanationParts.fiveCardHigh || {};
  root.BridgeBidExplanationParts.fiveCardHigh.nl = root.BridgeBidExplanationParts.fiveCardHigh.nl || {};
  root.BridgeBidExplanationParts.fiveCardHigh.nl[descriptor.id] = descriptor;
})(typeof globalThis !== "undefined" ? globalThis : this, function createfiveCardHighRebidsBlackwoodExplanationsNl() {
  "use strict";

  function explainBlackwoodRebidChoice(ruleName, result, helpers = {}) {
    const { suitName, handFactsText, weakTwoFactsText, notrumpOpeningText, notrumpSlamOpeningText, transferRebidIntro, formatBlackwoodResponse, bidLabelNl, blackwoodMissingAcesText, openingMinorReason, ruleOf20FactsText, openerAfterNotrumpDetail, responseNewSuitDetail, responseRaiseDetail, valueSummaryText, ruleReferenceText, strongTwoClubsReason, t } = helpers;
    switch (ruleName) {
      case "continuation.blackwoodAsk":
        return `4SA azenvragen: ${suitName(result.trumpSuit || result.transferSuit || result.suit)} is de afgesproken troefkleur. 4SA is kunstmatig en forcing; partner antwoordt 5K met 0 of 4 azen, 5R met 1 aas, 5H met 2 azen en 5S met 3 azen. ${handFactsText({ ruleName, result, suit: result.trumpSuit || result.transferSuit || result.suit, valueMode: "hcp" })}`;
      case "continuation.blackwoodResponse":
        return `antwoord op 4SA azenvragen: ${formatBlackwoodResponse(result)}. Partner mag hierop niet passen; de azenvrager kiest daarna afzwaaien, kleinslem of soms grootslem. ${handFactsText({ ruleName, result, suit: result.trumpSuit || result.suit, valueMode: "hcp" })}`;
      case "continuation.blackwoodSignoff":
        return `afzwaaien na azenvragen: ${blackwoodMissingAcesText(result)} Daarom stopt de regel in 5${result.trumpSuit || result.suit}. ${handFactsText({ ruleName, result, suit: result.trumpSuit || result.suit, valueMode: "hcp" })}`;
      case "continuation.blackwoodSmallSlam":
        return `kleinslem na azenvragen: er ontbreken niet twee azen, dus de regel biedt 6${result.trumpSuit || result.suit}. ${handFactsText({ ruleName, result, suit: result.trumpSuit || result.suit, valueMode: "hcp" })}`;
      case "continuation.blackwoodGrandSlam":
        return `grootslem na azenvragen: alle azen zijn bekend aanwezig en de gezamenlijke ondergrens is minstens 37 HCP. Daarom biedt de regel 7${result.trumpSuit || result.suit}. ${handFactsText({ ruleName, result, suit: result.trumpSuit || result.suit, valueMode: "hcp" })}`;
      default:
        return null;
    }
  }

  function explainPassChoice(ruleName, result, helpers = {}) {
    const { suitName, handFactsText, weakTwoFactsText, notrumpOpeningText, notrumpSlamOpeningText, transferRebidIntro, formatBlackwoodResponse, bidLabelNl, blackwoodMissingAcesText, openingMinorReason, ruleOf20FactsText, openerAfterNotrumpDetail, responseNewSuitDetail, responseRaiseDetail, valueSummaryText, ruleReferenceText, strongTwoClubsReason, t, facts, factSuffix, responderAfterTransferMinimum } = helpers;
    return null;
  }

  return {
    id: "rebids.blackwood",
    order: 31,
    explainBidChoice: explainBlackwoodRebidChoice,
    explainPassChoice
  };
});

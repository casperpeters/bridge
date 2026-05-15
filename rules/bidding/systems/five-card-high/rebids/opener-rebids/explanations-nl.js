(function initfiveCardHighRebidsOpenerRebidsExplanationsNl(root, factory) {
  const descriptor = factory();
  if (typeof module === "object" && module.exports) module.exports = descriptor;
  root.BridgeBidExplanationParts = root.BridgeBidExplanationParts || {};
  root.BridgeBidExplanationParts.fiveCardHigh = root.BridgeBidExplanationParts.fiveCardHigh || {};
  root.BridgeBidExplanationParts.fiveCardHigh.nl = root.BridgeBidExplanationParts.fiveCardHigh.nl || {};
  root.BridgeBidExplanationParts.fiveCardHigh.nl[descriptor.id] = descriptor;
})(typeof globalThis !== "undefined" ? globalThis : this, function createfiveCardHighRebidsOpenerRebidsExplanationsNl() {
  "use strict";

  function explainOpenerRebidChoice(ruleName, result, helpers = {}) {
    const { suitName, handFactsText, weakTwoFactsText, notrumpOpeningText, notrumpSlamOpeningText, transferRebidIntro, formatBlackwoodResponse, bidLabelNl, blackwoodMissingAcesText, openingMinorReason, ruleOf20FactsText, openerAfterNotrumpDetail, responseNewSuitDetail, responseRaiseDetail, valueSummaryText, ruleReferenceText, strongTwoClubsReason, t } = helpers;
    switch (ruleName) {
      case "continuation.openerAfterOneNtBalancedGame":
        return openerAfterNotrumpDetail(ruleName, result, "1SA", "SA-verdeling", "18-19 HCP", "3SA");
      case "continuation.openerAfterOneNtLongMajorMinimum":
        return openerAfterNotrumpDetail(ruleName, result, "1SA", "een lange hoge kleur", "12-15 HCP", `2${result.openingSuit}`);
      case "continuation.openerAfterOneNtLongMajorInvite":
        return openerAfterNotrumpDetail(ruleName, result, "1SA", "een lange hoge kleur", "16-17 HCP", `3${result.openingSuit}`);
      case "continuation.openerAfterOneNtLongMajorGame":
        return openerAfterNotrumpDetail(ruleName, result, "1SA", "een lange hoge kleur", "18-19 HCP", `4${result.openingSuit}`);
      case "continuation.openerAfterOneNtTwoSuiterLow":
        return openerAfterNotrumpDetail(ruleName, result, "1SA", `tweekleurenspel met tweede lagere kleur ${suitName(result.secondSuit)}`, "12-17 HCP", `2${result.secondSuit}`);
      case "continuation.openerAfterOneNtTwoSuiterHigh":
        return openerAfterNotrumpDetail(ruleName, result, "1SA", `tweekleurenspel met tweede lagere kleur ${suitName(result.secondSuit)}`, "18-19 HCP", `3${result.secondSuit}`);
      case "continuation.openerAfterTwoNtBalancedGame":
        return openerAfterNotrumpDetail(ruleName, result, "2SA", "SA-verdeling", "14+ HCP", "3SA");
      case "continuation.openerAfterTwoNtLongMajorMinimum":
        return openerAfterNotrumpDetail(ruleName, result, "2SA", "een lange hoge kleur", "12-13 HCP", `3${result.openingSuit}`);
      case "continuation.openerAfterTwoNtLongMajorGame":
        return openerAfterNotrumpDetail(ruleName, result, "2SA", "een lange hoge kleur", "14+ HCP", `4${result.openingSuit}`);
      case "continuation.openerAfterTwoNtTwoSuiterLow":
        return openerAfterNotrumpDetail(ruleName, result, "2SA", `tweekleurenspel met tweede lagere kleur ${suitName(result.secondSuit)}`, "12-13 HCP", `3${result.secondSuit}`);
      case "continuation.openerAfterTwoNtTwoMajorsGame":
        return openerAfterNotrumpDetail(ruleName, result, "2SA", "tweekleurenspel schoppen en harten", "14+ HCP", "4H");
      case "continuation.openerAfterTwoNtTwoSuiterGameNotrump":
        return openerAfterNotrumpDetail(ruleName, result, "2SA", `tweekleurenspel met tweede lagere kleur ${suitName(result.secondSuit)}`, "14+ HCP", "3SA");
      case "continuation.openerMinorAfterOneNtInvite":
        return `invite na partners 1SA op 1K/1R: partner heeft geen hoge-kleurfit gevonden; met 15-17 HCP en een SA-verdeling biedt openaar 2SA. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.openerMinorAfterOneNtGame":
        return `3SA na partners 1SA op 1K/1R: partner heeft geen hoge-kleurfit gevonden; met 18-19 HCP en een SA-verdeling biedt openaar de manche. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.openerMinorAfterOneNtLongMinorMinimum":
        return `lange lage kleur na partners 1SA: partner heeft geen hoge-kleurfit gevonden; met een ongebalanceerde zeskaart herbiedt openaar 2${result.openingSuit}. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.openerMinorAfterOneNtLongMinorInvite":
        return `invite met lange lage kleur na partners 1SA: partner heeft geen hoge-kleurfit gevonden; met extra waarden en een zeskaart biedt openaar 3${result.openingSuit}. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.openerMinorAfterOneNtLongMinorGame":
        return `lage-kleurmanche na partners 1SA: partner heeft geen hoge-kleurfit gevonden; openaar heeft een sterke ongebalanceerde lange lage kleur. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.openerMinorAfterTwoNtGame":
        return `3SA na partners 2SA op 1K/1R: partner heeft geen hoge-kleurfit gevonden; openaar accepteert de invite met voldoende kracht. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.openerMinorAfterTwoNtLongMinorInvite":
        return `lange lage kleur na partners 2SA: partner heeft geen hoge-kleurfit gevonden; openaar corrigeert naar 3${result.openingSuit} met een ongebalanceerde zeskaart. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.openerMinorAfterTwoNtLongMinorGame":
        return `lage-kleurmanche na partners 2SA: partner heeft geen hoge-kleurfit gevonden; openaar heeft genoeg kracht en een lange lage kleur. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.openerMinorAfterThreeNtLongMinorGame":
        return `uit 3SA naar de lage-kleurmanche: alleen met een zeer lange ongebalanceerde lage kleur; partner heeft met 3SA geen hoge-kleurfit gevonden. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.openerMinorNewSuitMajorFitMinimum":
        return `fit na partners nieuwe hoge kleur: openaar heeft vierkaart steun en een minimum, dus hij steunt op 2-niveau. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.openerMinorNewSuitMajorFitInvite":
        return `invite na partners nieuwe hoge kleur: openaar heeft vierkaart steun en extra waarden, dus hij steunt op 3-niveau. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.openerMinorNewSuitMajorFitGame":
        return `manche na partners nieuwe hoge kleur: openaar heeft vierkaart steun en genoeg kracht voor de manche. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.openerMinorNewSuitNotrumpMinimum":
        return `SA-herbieding na partners nieuwe kleur: er is geen hoge-kleurfit gevonden; met een gebalanceerde minimumhand biedt openaar 1SA. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.openerMinorNewSuitNotrumpInvite":
        return `sterke SA-herbieding na partners nieuwe kleur: er is geen hoge-kleurfit gevonden; met gebalanceerde overwaarde biedt openaar 2SA. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.openerMinorNewSuitLongMinorMinimum":
        return `herbiedt de eigen lage kleur: geen hoge-kleurfit en openaar heeft een zeskaart in de openingskleur. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.openerMinorNewSuitLongMinorInvite":
        return `invite met lange lage kleur: geen hoge-kleurfit; openaar heeft een zeskaart in de openingskleur en extra waarden. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.openerMinorNewSuitLongMinorGame":
        return `lage-kleurmanche met lange openingskleur: geen hoge-kleurfit; openaar heeft een sterke ongebalanceerde hand. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.openerMinorNewSuitFallbackOwnMinor":
        return `terug naar de openingskleur: openaar is niet gebalanceerd, heeft geen veilige tweede kleur en toont liever de echte vijfkaart lage kleur dan een misleidende SA-herbieding. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.openerMinorNewSuitReverse":
        return `reverse: openaar toont een tweede kleur op hoger niveau; dit gebeurt alleen met extra kracht. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.openerMinorNewSuitSecondSuit":
        return `tweede kleur van openaar: geen hoge-kleurfit, geen passende SA-herbieding en geen lange openingskleur; openaar toont natuurlijk een tweede vierkaart. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.openerOneDiamondTwoClubsNotrumpInvite":
        return `2SA na 1R-2K: partner heeft met 2K minstens 10 punten, klaveren en geen vierkaart hoog getoond; zonder hoge-kleurfit is 2SA de natuurlijke invite. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.openerOneDiamondTwoClubsNotrumpGame":
        return `3SA na 1R-2K: partner heeft met 2K geen vierkaart hoog getoond; zonder hoge-kleurfit en met genoeg kracht kies je de SA-manche. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.openerOneDiamondTwoClubsLongDiamondMinimum":
        return `je herbiedt 2R na 1R-2K en belooft daarmee een zeskaart ruiten; je bent niet sterk, dus je blijft zo laag mogelijk. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.openerOneDiamondTwoClubsLongDiamondInvite":
        return `je biedt 3R na 1R-2K: met extra waarden en een zeskaart ruiten laat je partner kiezen tussen 3SA en 5R. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.openerOneDiamondTwoClubsClubFit":
        return `met klaverenfit na 1R-2K verhoog je partner een niveau naar 3K; partner mag passen of, indien hij sterker is, een manche bieden. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.openerMajorRaiseInvite":
        return `invite na partners enkele hoge-kleursteun: met 16-17 totaalpunten biedt openaar 3${result.suit}. ${handFactsText({ ruleName, result })}`;
      case "continuation.openerMajorRaiseGame":
        return `manche na partners enkele hoge-kleursteun: met 18-19 totaalpunten biedt openaar 4${result.suit}. ${handFactsText({ ruleName, result })}`;
      case "continuation.openerMinorRaiseInvite":
        return `invite na partners lage-kleursteun: met extra waarden, maar nog geen zekere manche, biedt openaar 3${result.suit}. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.openerMinorRaiseNotrumpGame":
        return `3SA na partners lage-kleursteun: openaar heeft een gebalanceerde hand en genoeg gezamenlijke kracht voor de manche. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.openerMinorRaiseGame":
        return `manche na partners lage-kleursteun: openaar heeft genoeg kracht en kiest de lage-kleurmanche. ${handFactsText({ ruleName, result, valueMode: "hcp" })}`;
      case "continuation.rebidOwnSuit":
        return `herbiedt de eigen ${suitName(result.suit)} met een zeskaart. ${handFactsText({ ruleName, result })}`;
      default:
        return null;
    }
  }

  function explainPassChoice(ruleName, result, helpers = {}) {
    const { suitName, handFactsText, weakTwoFactsText, notrumpOpeningText, notrumpSlamOpeningText, transferRebidIntro, formatBlackwoodResponse, bidLabelNl, blackwoodMissingAcesText, openingMinorReason, ruleOf20FactsText, openerAfterNotrumpDetail, responseNewSuitDetail, responseRaiseDetail, valueSummaryText, ruleReferenceText, strongTwoClubsReason, t, facts, factSuffix, responderAfterTransferMinimum } = helpers;
    switch (ruleName) {
      case "pass.openerMajorRaiseMinimum":
        return `geen manchepoging na partners enkele hoge-kleursteun: met 12-15 totaalpunten past openaar${factSuffix}`;
      case "pass.openerMinorRaiseMinimum":
        return `geen manchepoging na partners lage-kleursteun: openaar heeft een minimum en past${factSuffix}`;
      case "pass.openerMinorAfterOneNtMinimum":
        return `pas na partners 1SA op 1K/1R: partner heeft geen hoge-kleurfit gevonden en openaar heeft een minimum zonder lange lage kleur${factSuffix}`;
      case "pass.openerMinorAfterTwoNtMinimum":
        return `pas na partners 2SA op 1K/1R: partner heeft geen hoge-kleurfit gevonden; openaar heeft onvoldoende overwaarde om de manche te bieden${factSuffix}`;
      case "pass.openerMinorAfterThreeNtPass":
        return `pas na partners 3SA op 1K/1R: partner heeft geen hoge-kleurfit gevonden en 3SA is meestal het eindcontract${factSuffix}`;
      case "pass.openerAfterOneNtBalancedMinimum":
        return `herbieding na partners 1SA: SA-verdeling met 12-14 HCP, dus pas${factSuffix}`;
      case "pass.openerAfterOneNtNoAction":
        return `herbieding na partners 1SA: geen passende foto-regel voor dit handtype of deze HCP-range${factSuffix}`;
      case "pass.openerAfterTwoNtBalancedMinimum":
        return `herbieding na partners 2SA: SA-verdeling met 12-13 HCP, dus pas${factSuffix}`;
      case "pass.openerAfterTwoNtNoAction":
        return `herbieding na partners 2SA: geen passende foto-regel voor dit handtype of deze HCP-range${factSuffix}`;
      default:
        return null;
    }
  }

  return {
    id: "rebids.openerRebids",
    order: 33,
    explainBidChoice: explainOpenerRebidChoice,
    explainPassChoice
  };
});

const { assert, bid, pass, redouble, test } = require("./harness.js");
const { loadDutchBidExplanationsForTest } = require("./bid-explanation-test-helper.js");

const explanations = loadDutchBidExplanationsForTest();

function bidResult(ruleName, overrides = {}) {
  return {
    system: "fiveCardHigh",
    ruleId: `fiveCardHigh.${ruleName}`,
    bid: bid(1, "S"),
    hcp: 12,
    points: 12,
    counts: { S: 5, H: 3, D: 3, C: 2 },
    balanced: false,
    suit: "S",
    length: 5,
    ...overrides
  };
}

function passResult(ruleName, overrides = {}) {
  return bidResult(ruleName, {
    bid: pass(),
    ...overrides
  });
}

function assertFamilyCopy(ruleName, expectedText, overrides = {}) {
  const explanation = explanations.explainBidChoiceResult(bidResult(ruleName, overrides));
  assert.match(explanation, expectedText, `${ruleName} should use family-near Dutch copy`);
  assert.doesNotMatch(explanation, /Natuurlijke actie volgens de huidige Vijfkaart-Hoog-afspraken/);
}

function assertFamilyPassCopy(ruleName, expectedText, overrides = {}) {
  const explanation = explanations.explainBidChoiceResult(passResult(ruleName, overrides));
  assert.match(explanation, expectedText, `${ruleName} should use family-near Dutch pass copy`);
  assert.doesNotMatch(explanation, /geen duidelijke systeemactie/);
}

test("Dutch bid explanations load family-near copy before the facade fallback", () => {
  assertFamilyCopy("opening.oneMajor", /12-19 punten/);
  assertFamilyCopy("response.transferToH", /Jacoby-transfer naar harten/, { bid: bid(2, "D"), suit: "H", transferSuit: "H" });
  assertFamilyCopy("response.strongTwoClubsWaiting", /afwachtend antwoord/, { bid: bid(2, "D") });
  assertFamilyCopy("response.weakTwoMajorGameRaise", /manchesteun/, { partnerSuit: "H", support: 2, ownPlayingTricks: 4 });
  assertFamilyCopy("response.raise", /steun voor partners/, {
    bid: bid(4, "H"),
    partnerSuit: "H",
    support: 3,
    partnerMinTrumpLength: 5,
    combinedTrumpLength: 8,
    knownFit: true,
    valuation: "fitPoints",
    fitPoints: 12,
    raiseLabel: "game",
    raiseMinimum: 12,
    hcp: 11
  });
  assertFamilyCopy("continuation.responderAfterStaymanFitGame", /tweede bijbod na Stayman/, {
    bid: bid(4, "H"),
    fitSuit: "H",
    suit: "H"
  });
  assertFamilyCopy("continuation.strongTwoClubsJumpRebid", /sprongherbieding na 2K-2R/, {
    bid: bid(3, "S"),
    hcp: 24,
    suit: "S"
  });
  assertFamilyCopy("continuation.blackwoodAsk", /4SA azenvragen/, {
    bid: bid(4, "NT"),
    trumpSuit: "S",
    suit: "S"
  });
  assertFamilyCopy("continuation.responderFourthSuitForcing", /vierde-kleur-forcing/, { bid: bid(2, "D") });
  assertFamilyCopy("continuation.openerMinorNewSuitReverse", /reverse/, {
    bid: bid(2, "H"),
    hcp: 17,
    suit: "H",
    secondSuit: "H"
  });
  assertFamilyCopy("continuation.responderPreference", /preferentie/, {
    bid: bid(2, "H"),
    partnerSuit: "H",
    openerSecondSuit: "C",
    suit: "H"
  });
  assertFamilyCopy("competitive.simpleOvercall", /volgbod/, {
    bid: bid(1, "S"),
    suit: "S",
    opponentSuit: "D"
  });
  assertFamilyCopy("competitive.notrumpOvercallStayman", /Stayman/, { bid: bid(2, "C") });
  assertFamilyCopy("competitive.weakTwoDefenseDouble", /informatiedoublet/, {
    bid: { double: true },
    opponentSuit: "H"
  });
  assertFamilyCopy("competitive.takeoutDoubleForcedSuit", /biedplicht/, {
    bid: bid(1, "S"),
    opponentSuit: "D"
  });
  assertFamilyCopy("competitive.raisePartnerOvercall", /partners volgbod/, {
    bid: bid(2, "S"),
    partnerSuit: "S",
    support: 3
  });
  assertFamilyCopy("competitive.notrump", /competitief SA-bod/, { bid: bid(1, "NT"), balanced: true });
  assertFamilyCopy("competitive.redoubleAfterPartnerOpeningDouble", /redoublet nadat partner/, {
    bid: redouble(),
    partnerSuit: "H",
    support: 2,
    supportThreshold: 3
  });

  assertFamilyPassCopy("pass.responseNoAction", /geen antwoord/);
  assertFamilyPassCopy("pass.responseWeakTwoNoAction", /partners zwakke twee/);
  assertFamilyPassCopy("pass.competitiveNoAction", /geen competitieve actie/);
});

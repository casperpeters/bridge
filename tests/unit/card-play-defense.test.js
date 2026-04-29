const {
  assert,
  rules,
  test,
  card,
  hand,
  bid,
  pass,
  double,
  redouble,
  chooseFiveCardHigh,
  chooseFiveCardHighResult
} = require("./harness.js");

test("chooseCardPlay plays third hand high after partner's low-promises-honor notrump lead", () => {
  const result = rules.chooseCardPlay({
    hand: hand("QH", "8H", "3H", "AC"),
    currentTrick: [
      { seat: "North", card: card("2H"), ruleId: "notrumpLowPromisesHonor" },
      { seat: "East", card: card("4H") }
    ],
    seat: "South",
    declarer: "East",
    contract: { level: 3, strain: "NT" },
    trump: null
  });

  assert.equal(result.card.id, "QH");
  assert.equal(result.ruleId, "thirdHandHighOverLowLead");
  assert.equal(result.leadSuit, "H");
});

test("chooseCardPlay keeps low-promises-honor as a defensive notrump agreement", () => {
  const lead = rules.chooseCardPlay({
    hand: hand("AC", "8C", "5C", "2C", "KH", "3D", "2S"),
    currentTrick: [],
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract: { level: 3, strain: "NT" },
    trump: null
  });

  assert.equal(lead.card.id, "AC");
  assert.equal(lead.ruleId, "longestSuitLead");

  const thirdHand = rules.chooseCardPlay({
    hand: hand("QH", "8H", "3H", "AC"),
    currentTrick: [
      { seat: "South", card: card("2H"), ruleId: "notrumpLowPromisesHonor" },
      { seat: "West", card: card("4H") }
    ],
    seat: "North",
    declarer: "South",
    dummy: "North",
    contract: { level: 3, strain: "NT" },
    trump: null
  });

  assert.equal(thirdHand.card.id, "8H");
  assert.equal(thirdHand.ruleId, "cheapestWinner");
});

test("chooseCardPlay preserves the ace when third hand has a cheaper winner over partner's low lead", () => {
  const result = rules.chooseCardPlay({
    hand: hand("AH", "QH", "3H", "AC"),
    currentTrick: [
      { seat: "North", card: card("2H"), ruleId: "notrumpLowPromisesHonor" },
      { seat: "East", card: card("9H") }
    ],
    seat: "South",
    declarer: "East",
    dummy: "West",
    contract: { level: 3, strain: "NT" },
    trump: null
  });

  assert.equal(result.card.id, "QH");
  assert.equal(result.ruleId, "thirdHandHighOverLowLead");
});

test("chooseCardPlay records played higher cards when third hand can conserve honors", () => {
  const result = rules.chooseCardPlay({
    hand: hand("AH", "JH", "3H", "AC"),
    currentTrick: [
      { seat: "North", card: card("2H"), ruleId: "notrumpLowPromisesHonor" },
      { seat: "East", card: card("9H") }
    ],
    trickHistory: [{
      number: 1,
      winner: "East",
      cards: [
        { seat: "East", card: card("KH") },
        { seat: "South", card: card("4H") },
        { seat: "West", card: card("5H") },
        { seat: "North", card: card("QH") }
      ]
    }],
    seat: "South",
    declarer: "East",
    dummy: "West",
    contract: { level: 3, strain: "NT" },
    trump: null
  });

  assert.equal(result.card.id, "JH");
  assert.equal(result.ruleId, "thirdHandHighOverLowLead");
  assert.deepEqual(result.higherPlayed, ["K", "Q"]);
  assert.equal(result.usedPlayedCardInfo, true);
});

test("chooseCardPlay returns partner's opening lead suit when a defender wins the lead later", () => {
  const result = rules.chooseCardPlay({
    hand: hand("8H", "AC", "2S"),
    currentTrick: [],
    trickHistory: [{
      number: 1,
      winner: "South",
      cards: [
        { seat: "North", card: card("4H"), ruleId: "notrumpLowPromisesHonor" },
        { seat: "East", card: card("AH") },
        { seat: "South", card: card("QH") },
        { seat: "West", card: card("3H") }
      ]
    }],
    seat: "South",
    declarer: "East",
    dummy: "West",
    contract: { level: 3, strain: "NT" },
    trump: null
  });

  assert.equal(result.card.id, "8H");
  assert.equal(result.ruleId, "returnPartnerLeadSuit");
  assert.equal(result.suit, "H");
  assert.equal(result.partnerSeat, "North");
  assert.equal(result.returnType, "lowCard");
  assert.equal(result.leadRank, "4");
});

test("chooseCardPlay returns partner's opening lead suit in suit contracts too", () => {
  const result = rules.chooseCardPlay({
    hand: hand("9H", "7H", "AC", "2S"),
    currentTrick: [],
    trickHistory: [{
      number: 1,
      winner: "South",
      cards: [
        { seat: "North", card: card("4H") },
        { seat: "East", card: card("AH") },
        { seat: "South", card: card("QH") },
        { seat: "West", card: card("3H") }
      ]
    }],
    seat: "South",
    declarer: "East",
    dummy: "West",
    contract: { level: 4, strain: "S" },
    trump: "S"
  });

  assert.equal(result.card.id, "7H");
  assert.equal(result.ruleId, "returnPartnerLeadSuit");
  assert.equal(result.suit, "H");
});

test("chooseCardPlay returns the top of an honor sequence in partner's lead suit", () => {
  const result = rules.chooseCardPlay({
    hand: hand("KH", "QH", "AC", "2S"),
    currentTrick: [],
    trickHistory: [{
      number: 1,
      winner: "South",
      cards: [
        { seat: "North", card: card("4H") },
        { seat: "East", card: card("AH") },
        { seat: "South", card: card("JH") },
        { seat: "West", card: card("3H") }
      ]
    }],
    seat: "South",
    declarer: "East",
    dummy: "West",
    contract: { level: 3, strain: "NT" },
    trump: null
  });

  assert.equal(result.card.id, "KH");
  assert.equal(result.ruleId, "returnPartnerLeadSuit");
  assert.equal(result.returnType, "honorSequence");
  assert.equal(result.sequence, "KQ");
});

test("chooseCardPlay does not return partner's opening lead suit for the declarer side", () => {
  const result = rules.chooseCardPlay({
    hand: hand("8H", "AC", "2S"),
    currentTrick: [],
    trickHistory: [{
      number: 1,
      winner: "South",
      cards: [
        { seat: "North", card: card("4H"), ruleId: "notrumpLowPromisesHonor" },
        { seat: "East", card: card("AH") },
        { seat: "South", card: card("QH") },
        { seat: "West", card: card("3H") }
      ]
    }],
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract: { level: 3, strain: "NT" },
    trump: null
  });

  assert.notEqual(result.ruleId, "returnPartnerLeadSuit");
  assert.equal(result.card.id, "AC");
});

test("chooseCardPlay switches to a low trump when visible dummy has ruffing value", () => {
  const result = rules.chooseCardPlay({
    hand: hand("3S", "9H", "7H", "2C"),
    currentTrick: [],
    trickHistory: [{
      number: 1,
      winner: "South",
      cards: [
        { seat: "North", card: card("2D") },
        { seat: "East", card: card("AD") },
        { seat: "South", card: card("3D") },
        { seat: "West", card: card("4D") }
      ]
    }],
    seat: "South",
    declarer: "East",
    dummy: "West",
    dummyHand: hand("AS", "KS", "QS", "8C", "7C", "6C"),
    contract: { level: 4, strain: "S" },
    trump: "S"
  });

  assert.equal(result.card.id, "3S");
  assert.equal(result.ruleId, "trumpSwitchAgainstDummyRuff");
  assert.equal(result.dummyShortSuit, "D");
  assert.equal(result.dummyShortLength, 0);
  assert.equal(result.dummyTrumpLength, 3);
});

test("chooseCardPlay switches to trump when visible dummy has a singleton side suit", () => {
  const result = rules.chooseCardPlay({
    hand: hand("4S", "2S", "9H", "7H", "2C"),
    currentTrick: [],
    trickHistory: [{
      number: 1,
      winner: "South",
      cards: [
        { seat: "North", card: card("2D") },
        { seat: "East", card: card("AD") },
        { seat: "South", card: card("3D") },
        { seat: "West", card: card("4D") }
      ]
    }],
    seat: "South",
    declarer: "East",
    dummy: "West",
    dummyHand: hand("AS", "KS", "QS", "8H", "7H", "6H", "5H", "9C", "8C", "2D"),
    contract: { level: 4, strain: "S" },
    trump: "S"
  });

  assert.equal(result.card.id, "2S");
  assert.equal(result.ruleId, "trumpSwitchAgainstDummyRuff");
  assert.equal(result.dummyShortSuit, "D");
  assert.equal(result.dummyShortLength, 1);
});

test("chooseCardPlay returns partner's suit before considering a dummy-ruff trump switch", () => {
  const result = rules.chooseCardPlay({
    hand: hand("3S", "9H", "7H", "2C"),
    currentTrick: [],
    trickHistory: [{
      number: 1,
      winner: "South",
      cards: [
        { seat: "North", card: card("4H") },
        { seat: "East", card: card("AH") },
        { seat: "South", card: card("QH") },
        { seat: "West", card: card("3H") }
      ]
    }],
    seat: "South",
    declarer: "East",
    dummy: "West",
    dummyHand: hand("AS", "KS", "QS", "8C", "7C", "6C"),
    contract: { level: 4, strain: "S" },
    trump: "S"
  });

  assert.equal(result.card.id, "7H");
  assert.equal(result.ruleId, "returnPartnerLeadSuit");
});

test("chooseCardPlay does not switch to trump without visible dummy ruffing value", () => {
  const result = rules.chooseCardPlay({
    hand: hand("3S", "9H", "7H", "2C"),
    currentTrick: [],
    trickHistory: [{
      number: 1,
      winner: "South",
      cards: [
        { seat: "North", card: card("2D") },
        { seat: "East", card: card("AD") },
        { seat: "South", card: card("3D") },
        { seat: "West", card: card("4D") }
      ]
    }],
    seat: "South",
    declarer: "East",
    dummy: "West",
    contract: { level: 4, strain: "S" },
    trump: "S"
  });

  assert.notEqual(result.ruleId, "trumpSwitchAgainstDummyRuff");
});

test("chooseCardPlay does not switch to trump in notrump or when dummy has too few trumps", () => {
  const notrump = rules.chooseCardPlay({
    hand: hand("3S", "9H", "7H", "2C"),
    currentTrick: [],
    trickHistory: [{ number: 1, winner: "South", cards: [{ seat: "North", card: card("2D") }] }],
    seat: "South",
    declarer: "East",
    dummy: "West",
    dummyHand: hand("AS", "KS", "8C", "7C", "6C"),
    contract: { level: 3, strain: "NT" },
    trump: null
  });
  const tooFewTrumps = rules.chooseCardPlay({
    hand: hand("3S", "9H", "7H", "2C"),
    currentTrick: [],
    trickHistory: [{ number: 1, winner: "South", cards: [{ seat: "North", card: card("2D") }] }],
    seat: "South",
    declarer: "East",
    dummy: "West",
    dummyHand: hand("AS", "8C", "7C", "6C"),
    contract: { level: 4, strain: "S" },
    trump: "S"
  });

  assert.notEqual(notrump.ruleId, "trumpSwitchAgainstDummyRuff");
  assert.notEqual(tooFewTrumps.ruleId, "trumpSwitchAgainstDummyRuff");
});

test("chooseCardPlay makes a defender second hand play low even when a cheap winner is available", () => {
  const result = rules.chooseCardPlay({
    hand: hand("9H", "2H", "AS"),
    currentTrick: [{ seat: "East", card: card("7H") }],
    seat: "South",
    declarer: "East",
    dummy: "West",
    dummyHand: hand("4H", "3H", "2C"),
    contract: { level: 4, strain: "S" },
    trump: "S"
  });

  assert.equal(result.card.id, "2H");
  assert.equal(result.ruleId, "secondHandLow");
});

test("chooseCardPlay makes a defender second hand play high from a touching honor sequence", () => {
  const result = rules.chooseCardPlay({
    hand: hand("KH", "QH", "2H", "AS"),
    currentTrick: [{ seat: "East", card: card("9H") }],
    seat: "South",
    declarer: "East",
    dummy: "West",
    dummyHand: hand("4H", "3H", "2C"),
    contract: { level: 4, strain: "S" },
    trump: "S"
  });

  assert.equal(result.card.id, "KH");
  assert.equal(result.ruleId, "secondHandSequenceHigh");
  assert.equal(result.sequence, "KQ");
});

test("chooseCardPlay makes a defender second hand cover an honor when dummy has a touching lower honor", () => {
  const result = rules.chooseCardPlay({
    hand: hand("KH", "2H", "AS"),
    currentTrick: [{ seat: "East", card: card("QH") }],
    seat: "South",
    declarer: "East",
    dummy: "West",
    dummyHand: hand("JH", "4H", "2C"),
    contract: { level: 4, strain: "S" },
    trump: "S"
  });

  assert.equal(result.card.id, "KH");
  assert.equal(result.ruleId, "secondHandCoverHonor");
  assert.equal(result.coveredRank, "Q");
  assert.equal(result.promotedRank, "J");
  assert.equal(result.coverReason, "dummyThreat");
});

test("chooseCardPlay does not use hidden partner honors to justify covering", () => {
  const result = rules.chooseCardPlay({
    hand: hand("KH", "2H", "AS"),
    partnerHand: hand("JH", "7H", "3C"),
    currentTrick: [{ seat: "East", card: card("QH") }],
    seat: "South",
    declarer: "East",
    dummy: "West",
    dummyHand: hand("8H", "4H", "2C"),
    contract: { level: 4, strain: "S" },
    trump: "S"
  });

  assert.equal(result.card.id, "2H");
  assert.equal(result.ruleId, "secondHandLow");
});

test("chooseCardPlay gives the same defender advice when hidden partnerHand is supplied", () => {
  const publicContext = {
    hand: hand("KH", "2H", "AS"),
    currentTrick: [{ seat: "East", card: card("QH") }],
    seat: "South",
    declarer: "East",
    dummy: "West",
    dummyHand: hand("8H", "4H", "2C"),
    contract: { level: 4, strain: "S" },
    trump: "S"
  };

  const withoutHiddenPartner = rules.chooseCardPlay(publicContext);
  const withHiddenPartner = rules.chooseCardPlay({
    ...publicContext,
    partnerHand: hand("JH", "AH", "3C")
  });

  assert.equal(withHiddenPartner.card.id, withoutHiddenPartner.card.id);
  assert.equal(withHiddenPartner.ruleId, withoutHiddenPartner.ruleId);
});

test("chooseCardPlay does not cover an honor when dummy shows only small cards in the suit", () => {
  const result = rules.chooseCardPlay({
    hand: hand("KH", "2H", "AS"),
    currentTrick: [{ seat: "East", card: card("QH") }],
    seat: "South",
    declarer: "East",
    dummy: "West",
    dummyHand: hand("8H", "4H", "2C"),
    contract: { level: 4, strain: "S" },
    trump: "S"
  });

  assert.equal(result.card.id, "2H");
  assert.equal(result.ruleId, "secondHandLow");
});

test("chooseCardPlay does not cover an honor when the touching lower honor has already fallen", () => {
  const result = rules.chooseCardPlay({
    hand: hand("KH", "2H", "AS"),
    currentTrick: [{ seat: "East", card: card("QH") }],
    trickHistory: [{
      number: 1,
      winner: "East",
      cards: [
        { seat: "East", card: card("JH") },
        { seat: "South", card: card("3H") },
        { seat: "West", card: card("4H") },
        { seat: "North", card: card("5H") }
      ]
    }],
    seat: "South",
    declarer: "East",
    dummy: "West",
    dummyHand: hand("8H", "4H", "2C"),
    contract: { level: 4, strain: "S" },
    trump: "S"
  });

  assert.equal(result.card.id, "2H");
  assert.equal(result.ruleId, "secondHandLow");
});

test("chooseCardPlay makes a defender third hand play the cheapest winning card", () => {
  const result = rules.chooseCardPlay({
    hand: hand("AH", "QH", "3H", "AC"),
    currentTrick: [
      { seat: "North", card: card("2H") },
      { seat: "East", card: card("9H") }
    ],
    seat: "South",
    declarer: "East",
    dummy: "West",
    contract: { level: 4, strain: "S" },
    trump: "S"
  });

  assert.equal(result.card.id, "QH");
  assert.equal(result.ruleId, "thirdHandHighCheapest");
});

test("chooseCardPlay keeps third hand low when partner is already winning", () => {
  const result = rules.chooseCardPlay({
    hand: hand("KH", "2H", "AS"),
    currentTrick: [
      { seat: "North", card: card("AH") },
      { seat: "East", card: card("4H") }
    ],
    seat: "South",
    declarer: "East",
    dummy: "West",
    contract: { level: 4, strain: "S" },
    trump: "S"
  });

  assert.equal(result.card.id, "2H");
  assert.equal(result.ruleId, "partnerWinningLow");
});

test("chooseCardPlay does not apply second hand low to the declarer side", () => {
  const result = rules.chooseCardPlay({
    hand: hand("9H", "2H", "AS"),
    currentTrick: [{ seat: "East", card: card("7H") }],
    seat: "North",
    declarer: "South",
    dummy: "North",
    dummyHand: hand("9H", "2H", "AS"),
    contract: { level: 4, strain: "S" },
    trump: "S"
  });

  assert.equal(result.card.id, "9H");
  assert.equal(result.ruleId, "cheapestWinner");
});

test("chooseCardPlay plays low when partner is already winning", () => {
  const result = rules.chooseCardPlay({
    hand: [card("KH"), card("2H"), card("2S")],
    currentTrick: [{ seat: "North", card: card("AH") }],
    seat: "South",
    trump: "S"
  });

  assert.equal(result.card.id, "2H");
  assert.equal(result.ruleId, "partnerWinningLow");
});

test("chooseCardPlay avoids overtaking partner with a trump when discarding is possible", () => {
  const result = rules.chooseCardPlay({
    hand: [card("2S"), card("3C")],
    currentTrick: [{ seat: "North", card: card("AH") }],
    seat: "South",
    trump: "S"
  });

  assert.equal(result.card.id, "3C");
  assert.equal(result.ruleId, "partnerWinningLow");
});

test("chooseCardPlay chooses the cheapest current winner", () => {
  const result = rules.chooseCardPlay({
    hand: [card("AH"), card("9H"), card("2H")],
    currentTrick: [{ seat: "West", card: card("7H") }],
    seat: "North",
    trump: null
  });

  assert.equal(result.card.id, "9H");
  assert.equal(result.ruleId, "cheapestWinner");
});

test("chooseCardPlay follows suit low when the hand cannot win", () => {
  const result = rules.chooseCardPlay({
    hand: [card("JH"), card("2H"), card("AS")],
    currentTrick: [{ seat: "West", card: card("QH") }],
    seat: "North",
    trump: null
  });

  assert.equal(result.card.id, "2H");
  assert.equal(result.ruleId, "lowestFollow");
});

test("chooseCardPlay trumps cheaply when void and able to win", () => {
  const result = rules.chooseCardPlay({
    hand: [card("2S"), card("AD")],
    currentTrick: [{ seat: "West", card: card("QH") }],
    seat: "North",
    trump: "S"
  });

  assert.equal(result.card.id, "2S");
  assert.equal(result.ruleId, "cheapestWinner");
});

test("chooseCardPlay discards low when void and unable to win", () => {
  const result = rules.chooseCardPlay({
    hand: [card("2C"), card("3D"), card("AS")],
    currentTrick: [{ seat: "West", card: card("QH") }],
    seat: "North",
    trump: null
  });

  assert.equal(result.card.id, "2C");
  assert.equal(result.ruleId, "lowestDiscard");
});

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

  assert.equal(thirdHand.card.id, "QH");
  assert.equal(thirdHand.ruleId, "positionAwareWinner");
});

test("chooseCardPlay does not finesse cheaply when fourth hand can still overtake row 20", () => {
  const result = rules.chooseCardPlay({
    hand: hand("KH", "8H", "2H", "8C", "7C", "3C"),
    partnerHand: hand("TH", "7H", "5H", "5C", "7D"),
    dummyHand: hand("KH", "8H", "2H", "8C", "7C", "3C"),
    currentTrick: [
      { seat: "North", card: card("3H") },
      { seat: "East", card: card("6H") }
    ],
    trickHistory: [
      {
        number: 1,
        winner: "West",
        cards: [
          { seat: "East", card: card("7S") },
          { seat: "South", card: card("TS") },
          { seat: "West", card: card("AS") },
          { seat: "North", card: card("8S") }
        ]
      }
    ],
    seat: "South",
    declarer: "North",
    dummy: "South",
    contract: { level: 2, strain: "C" },
    trump: "C"
  });

  assert.equal(result.card.id, "KH");
  assert.equal(result.ruleId, "positionAwareWinner");
  assert.equal(result.nextSeat, "West");
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

test("chooseCardPlay matches Start met Bridge third-hand notrump examples", () => {
  const examples = [
    {
      name: "king from K72 over dummy low spade",
      hand: hand("KS", "7S", "2S"),
      dummyHand: hand("9S", "6S", "3S"),
      partnerLead: "4S",
      dummyPlay: "3S",
      expectedCard: "KS"
    },
    {
      name: "jack from AJ2 when dummy queen is visible",
      hand: hand("AS", "JS", "2S"),
      dummyHand: hand("QS", "6S", "3S"),
      partnerLead: "4S",
      dummyPlay: "3S",
      expectedCard: "JS"
    },
    {
      name: "ten from QT82 when dummy jack is visible",
      hand: hand("QH", "TH", "8H", "2H"),
      dummyHand: hand("JH", "6H", "3H"),
      partnerLead: "4H",
      dummyPlay: "3H",
      expectedCard: "TH"
    }
  ];

  examples.forEach((example) => {
    const result = rules.chooseCardPlay({
      hand: example.hand,
      dummyHand: example.dummyHand,
      currentTrick: [
        { seat: "North", card: card(example.partnerLead), ruleId: "notrumpLowPromisesHonor" },
        { seat: "East", card: card(example.dummyPlay) }
      ],
      seat: "South",
      declarer: "West",
      dummy: "East",
      contract: { level: 3, strain: "NT" },
      trump: null
    });

    assert.equal(result.card.id, example.expectedCard, example.name);
    assert.equal(result.ruleId, "thirdHandHighOverLowLead", example.name);
    assert.equal(result.leadSuit, example.partnerLead.slice(-1), example.name);
  });
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

test("chooseCardPlay returns a visible winning honor sequence before a low card in partner's lead suit", () => {
  const result = rules.chooseCardPlay({
    hand: hand("QS", "9S", "9H", "5H", "9C", "8C", "KD", "QD", "5D", "3D"),
    currentTrick: [],
    trickHistory: [{
      number: 1,
      winner: "East",
      cards: [
        { seat: "North", card: card("JD") },
        { seat: "East", card: card("AD") },
        { seat: "South", card: card("2D") },
        { seat: "West", card: card("7D") }
      ]
    }, {
      number: 2,
      winner: "East",
      cards: [
        { seat: "East", card: card("AS") },
        { seat: "South", card: card("2S") },
        { seat: "West", card: card("4S") },
        { seat: "North", card: card("6S") }
      ]
    }, {
      number: 3,
      winner: "South",
      cards: [
        { seat: "East", card: card("JC") },
        { seat: "South", card: card("AC") },
        { seat: "West", card: card("4C") },
        { seat: "North", card: card("3C") }
      ]
    }],
    seat: "South",
    declarer: "West",
    dummy: "East",
    dummyHand: hand("JS", "TS", "5S", "3S", "4H", "3H", "TC", "6C", "2C", "6D"),
    contract: { level: 3, strain: "H" },
    trump: "H"
  });

  assert.equal(result.card.id, "KD");
  assert.equal(result.ruleId, "returnPartnerLeadSuit");
  assert.equal(result.returnType, "honorSequence");
  assert.equal(result.sequence, "KQ");
});

test("chooseCardPlay avoids returning a visibly dead partner suit into declarer's ruff", () => {
  const trickHistory = [
    {
      number: 1,
      winner: "North",
      cards: [
        { seat: "North", card: card("AC") },
        { seat: "East", card: card("5C") },
        { seat: "South", card: card("3C") },
        { seat: "West", card: card("2C") }
      ]
    },
    {
      number: 2,
      winner: "East",
      cards: [
        { seat: "North", card: card("6D") },
        { seat: "East", card: card("QD") },
        { seat: "South", card: card("2D") },
        { seat: "West", card: card("4D") }
      ]
    },
    {
      number: 3,
      winner: "South",
      cards: [
        { seat: "East", card: card("QS") },
        { seat: "South", card: card("7D") },
        { seat: "West", card: card("4S") },
        { seat: "North", card: card("3S") }
      ]
    },
    {
      number: 4,
      winner: "North",
      cards: [
        { seat: "South", card: card("4C") },
        { seat: "West", card: card("8C") },
        { seat: "North", card: card("QC") },
        { seat: "East", card: card("JC") }
      ]
    },
    {
      number: 5,
      winner: "North",
      cards: [
        { seat: "North", card: card("AS") },
        { seat: "East", card: card("2S") },
        { seat: "South", card: card("3H") },
        { seat: "West", card: card("8S") }
      ]
    },
    {
      number: 6,
      winner: "North",
      cards: [
        { seat: "North", card: card("AH") },
        { seat: "East", card: card("2H") },
        { seat: "South", card: card("TH") },
        { seat: "West", card: card("4H") }
      ]
    },
    {
      number: 7,
      winner: "South",
      cards: [
        { seat: "North", card: card("JS") },
        { seat: "East", card: card("5S") },
        { seat: "South", card: card("8D") },
        { seat: "West", card: card("KS") }
      ]
    }
  ];

  const result = rules.chooseCardPlay({
    hand: hand("KH", "KC", "TC", "9C", "7C", "6C"),
    currentTrick: [],
    trickHistory,
    seat: "South",
    declarer: "West",
    dummy: "East",
    dummyHand: hand("TS", "7S", "9H", "7H", "6H", "3D"),
    contract: { level: 2, strain: "D" },
    trump: "D"
  });

  assert.equal(result.card.id, "KH");
  assert.equal(result.ruleId, "safeDefensiveWinner");
  assert.deepEqual(result.avoidedSuits, ["C"]);
  assert.equal(result.avoidedReason, "deadSuitRuffRisk");
});

test("chooseCardPlay can still return a dead partner suit in notrump", () => {
  const result = rules.chooseCardPlay({
    hand: hand("8H", "AC", "2S"),
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
    dummyHand: hand("KH", "JH", "TH", "9H", "7H", "6H", "5H", "2H"),
    contract: { level: 3, strain: "NT" },
    trump: null
  });

  assert.equal(result.card.id, "8H");
  assert.equal(result.ruleId, "returnPartnerLeadSuit");
});

test("chooseCardPlay may lead a dead suit when there is no safe defensive winner", () => {
  const result = rules.chooseCardPlay({
    hand: hand("KC", "TC", "9C", "7C", "6C"),
    currentTrick: [],
    trickHistory: [{
      number: 1,
      winner: "South",
      cards: [
        { seat: "North", card: card("AC") },
        { seat: "East", card: card("5C") },
        { seat: "South", card: card("3C") },
        { seat: "West", card: card("2C") }
      ]
    }, {
      number: 2,
      winner: "South",
      cards: [
        { seat: "South", card: card("4C") },
        { seat: "West", card: card("8C") },
        { seat: "North", card: card("QC") },
        { seat: "East", card: card("JC") }
      ]
    }],
    seat: "South",
    declarer: "West",
    dummy: "East",
    dummyHand: hand("AS", "KS", "QS", "AD", "KD", "QD"),
    contract: { level: 4, strain: "S" },
    trump: "S"
  });

  assert.equal(result.card.suit, "C");
  assert.notEqual(result.ruleId, "returnPartnerLeadSuit");
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

test("chooseCardPlay matches Start met Bridge second-hand honor-on-honor examples", () => {
  const examples = [
    {
      name: "king covers queen with dummy jack visible",
      hand: hand("KC", "7C", "2C"),
      partnerHand: hand("TC", "5C", "4C"),
      dummyHand: hand("AC", "JC", "6C"),
      leadCard: "QC",
      expectedCard: "KC",
      expectedPromotedRank: "J",
      expectedCoverReason: "dummyThreat"
    },
    {
      name: "queen covers jack with dummy ten visible",
      hand: hand("QD", "8D", "4D"),
      partnerHand: hand("AD", "9D", "7D", "5D"),
      dummyHand: hand("KD", "TD", "2D"),
      leadCard: "JD",
      expectedCard: "QD",
      expectedPromotedRank: "T",
      expectedCoverReason: "dummyThreat"
    },
    {
      name: "queen covers ten even when the promotion card is hidden",
      hand: hand("QH", "8H", "5H"),
      partnerHand: hand("KH", "9H", "3H", "2H"),
      dummyHand: hand("TH", "6H", "4H"),
      leadCard: "TH",
      expectedCard: "QH",
      expectedPromotedRank: "9",
      expectedCoverReason: "honorOnHonor"
    }
  ];

  examples.forEach((example) => {
    const result = rules.chooseCardPlay({
      hand: example.hand,
      partnerHand: example.partnerHand,
      dummyHand: example.dummyHand,
      currentTrick: [{ seat: "East", card: card(example.leadCard) }],
      seat: "South",
      declarer: example.leadCard.endsWith("H") ? "West" : "East",
      dummy: example.leadCard.endsWith("H") ? "East" : "West",
      contract: { level: 3, strain: "NT" },
      trump: null
    });

    assert.equal(result.card.id, example.expectedCard, example.name);
    assert.equal(result.ruleId, "secondHandCoverHonor", example.name);
    assert.equal(result.coveredRank, example.leadCard.slice(0, -1), example.name);
    assert.equal(result.promotedRank, example.expectedPromotedRank, example.name);
    assert.equal(result.coverReason, example.expectedCoverReason, example.name);
  });
});

test("chooseCardPlay covers an honor without relying on hidden partner honors", () => {
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

  assert.equal(result.card.id, "KH");
  assert.equal(result.ruleId, "secondHandCoverHonor");
  assert.equal(result.coverReason, "honorOnHonor");
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

test("chooseCardPlay covers an honor even when dummy shows only small cards in the suit", () => {
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

  assert.equal(result.card.id, "KH");
  assert.equal(result.ruleId, "secondHandCoverHonor");
  assert.equal(result.coverReason, "honorOnHonor");
});

test("chooseCardPlay still covers an honor when the touching lower honor has already fallen", () => {
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

  assert.equal(result.card.id, "KH");
  assert.equal(result.ruleId, "secondHandCoverHonor");
  assert.equal(result.coverReason, "honorOnHonor");
});

test("chooseCardPlay covers with the cheapest higher honor before using a sequence", () => {
  const result = rules.chooseCardPlay({
    hand: hand("KH", "QH", "2H", "AS"),
    currentTrick: [{ seat: "East", card: card("JH") }],
    seat: "South",
    declarer: "East",
    dummy: "West",
    dummyHand: hand("8H", "4H", "2C"),
    contract: { level: 4, strain: "S" },
    trump: "S"
  });

  assert.equal(result.card.id, "QH");
  assert.equal(result.ruleId, "secondHandCoverHonor");
  assert.equal(result.coveredRank, "J");
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

test("chooseCardPlay unblocks a doubleton honor after partner's notrump sequence lead", () => {
  const result = rules.chooseCardPlay({
    hand: hand("KS", "7S", "9H", "8H"),
    currentTrick: [
      { seat: "North", card: card("QS"), ruleId: "notrumpSequenceLead" },
      { seat: "East", card: card("2S") }
    ],
    seat: "South",
    declarer: "West",
    dummy: "East",
    contract: { level: 3, strain: "NT" },
    trump: null
  });

  assert.equal(result.card.id, "KS");
  assert.equal(result.ruleId, "thirdHandUnblockHonor");
  assert.equal(result.leadSuit, "S");
  assert.equal(result.leadCard.id, "QS");
  assert.equal(result.unblockRank, "K");
  assert.equal(result.partnerSeat, "North");
  assert.equal(result.action, "unblockDefense");
});

test("chooseCardPlay unblocks comparable short honors after partner's notrump honor lead", () => {
  const examples = [
    {
      name: "ace from A8 over partner's king",
      hand: hand("AH", "8H"),
      leadCard: "KH",
      dummyCard: "2H",
      expectedCard: "AH",
      expectedRank: "A"
    },
    {
      name: "queen from Q5 over partner's jack",
      hand: hand("QC", "5C"),
      leadCard: "JC",
      dummyCard: "2C",
      expectedCard: "QC",
      expectedRank: "Q"
    }
  ];

  examples.forEach((example) => {
    const result = rules.chooseCardPlay({
      hand: example.hand,
      currentTrick: [
        { seat: "North", card: card(example.leadCard), ruleId: "notrumpSequenceLead" },
        { seat: "East", card: card(example.dummyCard) }
      ],
      seat: "South",
      declarer: "West",
      dummy: "East",
      contract: { level: 3, strain: "NT" },
      trump: null
    });

    assert.equal(result.card.id, example.expectedCard, example.name);
    assert.equal(result.ruleId, "thirdHandUnblockHonor", example.name);
    assert.equal(result.unblockRank, example.expectedRank, example.name);
  });
});

test("chooseCardPlay does not unblock when third hand has a longer holding", () => {
  const result = rules.chooseCardPlay({
    hand: hand("KS", "7S", "2S", "9H"),
    currentTrick: [
      { seat: "North", card: card("QS"), ruleId: "notrumpSequenceLead" },
      { seat: "East", card: card("3S") }
    ],
    seat: "South",
    declarer: "West",
    dummy: "East",
    contract: { level: 3, strain: "NT" },
    trump: null
  });

  assert.equal(result.card.id, "2S");
  assert.equal(result.ruleId, "openingLeadAttitudeSignal");
  assert.notEqual(result.ruleId, "thirdHandUnblockHonor");
});

test("chooseCardPlay keeps low-lead third-hand-high separate from unblocking", () => {
  const result = rules.chooseCardPlay({
    hand: hand("KS", "7S", "9H"),
    currentTrick: [
      { seat: "North", card: card("4S"), ruleId: "notrumpLowPromisesHonor" },
      { seat: "East", card: card("2S") }
    ],
    seat: "South",
    declarer: "West",
    dummy: "East",
    contract: { level: 3, strain: "NT" },
    trump: null
  });

  assert.equal(result.card.id, "KS");
  assert.equal(result.ruleId, "thirdHandHighOverLowLead");
});

test("chooseCardPlay does not unblock a doubleton honor in a suit contract", () => {
  const result = rules.chooseCardPlay({
    hand: hand("KS", "7S", "9H"),
    currentTrick: [
      { seat: "North", card: card("QS"), ruleId: "suitContractSequenceLead" },
      { seat: "East", card: card("2S") }
    ],
    seat: "South",
    declarer: "West",
    dummy: "East",
    contract: { level: 4, strain: "H" },
    trump: "H"
  });

  assert.notEqual(result.ruleId, "thirdHandUnblockHonor");
});

test("chooseCardPlay discourages with three low cards after partner's opening sequence lead", () => {
  const result = rules.chooseCardPlay({
    hand: hand("9S", "7S", "4S", "KH", "QH", "7H", "QD", "9D", "5D", "JC", "8C", "4C", "2C"),
    currentTrick: [
      { seat: "North", card: card("QS"), ruleId: "notrumpSequenceLead" },
      { seat: "East", card: card("2S") }
    ],
    seat: "South",
    declarer: "West",
    dummy: "East",
    contract: { level: 3, strain: "NT" },
    trump: null
  });

  assert.equal(result.card.id, "4S");
  assert.equal(result.ruleId, "openingLeadAttitudeSignal");
  assert.equal(result.signal, "discourage");
  assert.equal(result.leadSuit, "S");
  assert.equal(result.partnerSeat, "North");
  assert.equal(result.supportReason, null);
});

test("chooseCardPlay encourages with queen third after partner's ace from a sequence", () => {
  const result = rules.chooseCardPlay({
    hand: hand("QS", "8S", "2S", "8H", "7H", "4H", "AD", "9D", "5D", "JC", "8C", "4C", "2C"),
    currentTrick: [
      { seat: "North", card: card("AS"), ruleId: "suitContractSequenceLead" },
      { seat: "East", card: card("3S") }
    ],
    seat: "South",
    declarer: "West",
    dummy: "East",
    contract: { level: 4, strain: "H" },
    trump: "H"
  });

  assert.equal(result.card.id, "8S");
  assert.equal(result.ruleId, "openingLeadAttitudeSignal");
  assert.equal(result.signal, "encourage");
  assert.equal(result.supportReason, "honor");
});

test("chooseCardPlay encourages with a doubleton and trump after partner's ace from a sequence", () => {
  const result = rules.chooseCardPlay({
    hand: hand("9S", "3S", "QH", "8H", "7H", "AD", "9D", "7D", "5D", "JC", "8C", "4C", "2C"),
    currentTrick: [
      { seat: "North", card: card("AS"), ruleId: "suitContractSequenceLead" },
      { seat: "East", card: card("2S") }
    ],
    seat: "South",
    declarer: "West",
    dummy: "East",
    contract: { level: 4, strain: "H" },
    trump: "H"
  });

  assert.equal(result.card.id, "9S");
  assert.equal(result.ruleId, "openingLeadAttitudeSignal");
  assert.equal(result.signal, "encourage");
  assert.equal(result.supportReason, "ruffValue");
});

test("chooseCardPlay discourages with three low cards after partner's ace from a sequence", () => {
  const result = rules.chooseCardPlay({
    hand: hand("8S", "6S", "3S", "8H", "7H", "4H", "AD", "9D", "7D", "JC", "8C", "4C", "2C"),
    currentTrick: [
      { seat: "North", card: card("AS"), ruleId: "suitContractSequenceLead" },
      { seat: "East", card: card("2S") }
    ],
    seat: "South",
    declarer: "West",
    dummy: "East",
    contract: { level: 4, strain: "H" },
    trump: "H"
  });

  assert.equal(result.card.id, "3S");
  assert.equal(result.ruleId, "openingLeadAttitudeSignal");
  assert.equal(result.signal, "discourage");
  assert.equal(result.supportReason, null);
});

test("chooseCardPlay discourages a doubleton without trump support", () => {
  const result = rules.chooseCardPlay({
    hand: hand("9S", "3S", "AD", "9D", "7D", "5D", "3D", "2D", "JC", "8C", "4C", "3C", "2C"),
    currentTrick: [
      { seat: "North", card: card("AS"), ruleId: "suitContractSequenceLead" },
      { seat: "East", card: card("2S") }
    ],
    seat: "South",
    declarer: "West",
    dummy: "East",
    contract: { level: 4, strain: "H" },
    trump: "H"
  });

  assert.equal(result.card.id, "3S");
  assert.equal(result.ruleId, "openingLeadAttitudeSignal");
  assert.equal(result.signal, "discourage");
  assert.equal(result.supportReason, null);
});

test("chooseCardPlay does not treat a trump doubleton as ruff value", () => {
  const result = rules.chooseCardPlay({
    hand: hand("9H", "3H", "AS", "8S", "2S", "AD", "9D", "7D", "5D", "JC", "8C", "4C", "2C"),
    currentTrick: [
      { seat: "North", card: card("AH"), ruleId: "suitContractSequenceLead" },
      { seat: "East", card: card("2H") }
    ],
    seat: "South",
    declarer: "West",
    dummy: "East",
    contract: { level: 4, strain: "H" },
    trump: "H"
  });

  assert.equal(result.card.id, "3H");
  assert.equal(result.ruleId, "openingLeadAttitudeSignal");
  assert.equal(result.signal, "discourage");
  assert.equal(result.supportReason, null);
});

test("chooseCardPlay does not signal with a singleton in partner's opening lead suit", () => {
  const result = rules.chooseCardPlay({
    hand: hand("QH", "AC", "2S"),
    currentTrick: [
      { seat: "North", card: card("KH"), ruleId: "suitContractSequenceLead" },
      { seat: "East", card: card("4H") }
    ],
    seat: "South",
    declarer: "East",
    dummy: "West",
    contract: { level: 4, strain: "S" },
    trump: "S"
  });

  assert.equal(result.card.id, "QH");
  assert.notEqual(result.ruleId, "openingLeadAttitudeSignal");
});

test("chooseCardPlay does not signal for the declarer side", () => {
  const result = rules.chooseCardPlay({
    hand: hand("AH", "8H", "2H", "AC"),
    currentTrick: [
      { seat: "North", card: card("KH"), ruleId: "suitContractSequenceLead" },
      { seat: "East", card: card("4H") }
    ],
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract: { level: 4, strain: "S" },
    trump: "S"
  });

  assert.notEqual(result.ruleId, "openingLeadAttitudeSignal");
});

test("chooseCardPlay only applies opening-lead attitude signals on the first trick", () => {
  const result = rules.chooseCardPlay({
    hand: hand("AH", "8H", "2H", "AC"),
    currentTrick: [
      { seat: "North", card: card("KH"), ruleId: "suitContractSequenceLead" },
      { seat: "East", card: card("4H") }
    ],
    trickHistory: [{
      number: 1,
      winner: "East",
      cards: [
        { seat: "East", card: card("AS") },
        { seat: "South", card: card("2S") },
        { seat: "West", card: card("3S") },
        { seat: "North", card: card("4S") }
      ]
    }],
    seat: "South",
    declarer: "East",
    dummy: "West",
    contract: { level: 4, strain: "S" },
    trump: "S"
  });

  assert.notEqual(result.ruleId, "openingLeadAttitudeSignal");
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

test("chooseCardPlay protects partner's current winner when visible dummy can still overtake", () => {
  const result = rules.chooseCardPlay({
    hand: hand("QC", "6C", "QS", "8S", "7S", "KH", "TH", "9H", "4H", "2H"),
    currentTrick: [
      { seat: "South", card: card("5C") },
      { seat: "West", card: card("2C") }
    ],
    seat: "North",
    declarer: "West",
    dummy: "East",
    dummyHand: hand("JS", "9S", "6S", "4S", "3S", "AH", "8H", "8C", "JD", "TD"),
    contract: { level: 2, strain: "S" },
    trump: "S"
  });

  assert.equal(result.card.id, "QC");
  assert.equal(result.ruleId, "protectPartnerWinnerFromDummy");
  assert.equal(result.winningSeat, "South");
  assert.equal(result.dummy, "East");
  assert.equal(result.dummyThreatRank, "8");
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

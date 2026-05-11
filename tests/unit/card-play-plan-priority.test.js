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

function reportedLateCrossRuffTricks() {
  return [
    {
      number: 1,
      winner: "North",
      cards: [
        { seat: "North", card: card("AH") },
        { seat: "East", card: card("3H") },
        { seat: "South", card: card("4H") },
        { seat: "West", card: card("QH") }
      ]
    },
    {
      number: 2,
      winner: "East",
      cards: [
        { seat: "North", card: card("6D") },
        { seat: "East", card: card("9D") },
        { seat: "South", card: card("3D") },
        { seat: "West", card: card("7D") }
      ]
    },
    {
      number: 3,
      winner: "East",
      cards: [
        { seat: "East", card: card("JH") },
        { seat: "South", card: card("5H") },
        { seat: "West", card: card("KH") },
        { seat: "North", card: card("2H") }
      ]
    },
    {
      number: 4,
      winner: "West",
      cards: [
        { seat: "West", card: card("AD") },
        { seat: "North", card: card("TD") },
        { seat: "East", card: card("2D") },
        { seat: "South", card: card("2S") }
      ]
    },
    {
      number: 5,
      winner: "South",
      cards: [
        { seat: "West", card: card("JS") },
        { seat: "North", card: card("4S") },
        { seat: "East", card: card("KS") },
        { seat: "South", card: card("AS") }
      ]
    },
    {
      number: 6,
      winner: "East",
      cards: [
        { seat: "South", card: card("6H") },
        { seat: "West", card: card("3S") },
        { seat: "North", card: card("3C") },
        { seat: "East", card: card("7H") }
      ]
    },
    {
      number: 7,
      winner: "South",
      cards: [
        { seat: "East", card: card("9C") },
        { seat: "South", card: card("KC") },
        { seat: "West", card: card("8S") },
        { seat: "North", card: card("4C") }
      ]
    },
    {
      number: 8,
      winner: "South",
      cards: [
        { seat: "South", card: card("9H") },
        { seat: "West", card: card("9S") },
        { seat: "North", card: card("5C") },
        { seat: "East", card: card("TH") }
      ]
    }
  ];
}

function lateCrossRuffTrumpHistory() {
  return [
    {
      number: 1,
      winner: "West",
      cards: [
        { seat: "North", card: card("AD") },
        { seat: "East", card: card("TD") },
        { seat: "South", card: card("9D") },
        { seat: "West", card: card("7D") }
      ]
    },
    {
      number: 2,
      winner: "West",
      cards: [
        { seat: "North", card: card("6D") },
        { seat: "East", card: card("3D") },
        { seat: "South", card: card("2D") },
        { seat: "West", card: card("3H") }
      ]
    }
  ];
}

test("chooseCardPlay follows the play-plan long-suit priority", () => {
  const declarerHand = hand("AS", "KS", "AD", "2C", "2D");
  const dummyHand = hand("KC", "QC", "JC", "4C", "3C", "AH");
  const playPlan = rules.createPlayPlan({
    declarerHand,
    dummyHand,
    contract: { level: 3, strain: "NT" },
    declarer: "South",
    dummy: "North"
  });

  const result = rules.chooseCardPlay({
    hand: declarerHand,
    partnerHand: dummyHand,
    currentTrick: [],
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract: { level: 3, strain: "NT" },
    trump: null,
    playPlan
  });

  assert.equal(result.card.id, "2C");
  assert.equal(result.ruleId, "playPlan.developLongSuit");
  assert.equal(result.planPriority.kind, "developLongSuit");
});

test("chooseCardPlay follows the play-plan finesse priority", () => {
  const declarerHand = hand("2H", "3H", "AD");
  const dummyHand = hand("AH", "QH", "7H", "AC");
  const playPlan = rules.createPlayPlan({
    declarerHand,
    dummyHand,
    contract: { level: 3, strain: "NT" },
    declarer: "South",
    dummy: "North"
  });

  const result = rules.chooseCardPlay({
    hand: declarerHand,
    partnerHand: dummyHand,
    currentTrick: [],
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract: { level: 3, strain: "NT" },
    trump: null,
    playPlan
  });

  assert.equal(result.card.id, "2H");
  assert.equal(result.ruleId, "playPlan.finesseTowardHonor");
  assert.equal(result.planPriority.kind, "finesse");
});

test("chooseCardPlay completes a play-plan finesse in the target hand", () => {
  const declarerHand = hand("2H", "3H", "AD");
  const dummyHand = hand("AH", "QH", "7H", "AC");
  const contract = { level: 3, strain: "NT" };
  const playPlan = rules.createPlayPlan({
    declarerHand,
    dummyHand,
    contract,
    declarer: "South",
    dummy: "North"
  });

  const result = rules.chooseCardPlay({
    hand: dummyHand,
    partnerHand: declarerHand,
    currentTrick: [
      { seat: "South", card: card("2H") },
      { seat: "West", card: card("5H") }
    ],
    seat: "North",
    declarer: "South",
    dummy: "North",
    contract,
    trump: null,
    playPlan
  });

  assert.equal(result.card.id, "QH");
  assert.equal(result.ruleId, "playPlan.finesseTowardHonor");
  assert.equal(result.planPriority.kind, "finesse");
  assert.equal(result.action, "completeFinesse");
});

test("chooseCardPlay explains when the play-plan finesse card cannot win this trick", () => {
  const result = rules.chooseCardPlay({
    hand: hand("QH", "7H", "AC"),
    partnerHand: hand("2H", "3H", "AD"),
    currentTrick: [
      { seat: "South", card: card("2H") },
      { seat: "West", card: card("KH") }
    ],
    seat: "North",
    declarer: "South",
    dummy: "North",
    contract: { level: 3, strain: "NT" },
    trump: null,
    playPlan: {
      priorities: [{
        kind: "finesse",
        confidence: "uncertain",
        suit: "H",
        leadSeat: "South",
        targetSeat: "North",
        finesseRank: "Q",
        missingHonor: "K"
      }]
    }
  });

  assert.equal(result.card.id, "7H");
  assert.equal(result.ruleId, "lowestFollow");
  assert.equal(result.planFallback.reason, "finesseCardNotWinning");
  assert.equal(result.planFallback.finesseCard.id, "QH");
  assert.equal(result.planFallback.winningCard.id, "KH");
  assert.ok(!result.planPriority);
});

test("chooseCardPlay explains when the play-plan finesse card is unnecessary", () => {
  const result = rules.chooseCardPlay({
    hand: hand("QH", "7H", "AC"),
    partnerHand: hand("AH", "2H", "AD"),
    currentTrick: [
      { seat: "South", card: card("AH") },
      { seat: "West", card: card("5H") }
    ],
    seat: "North",
    declarer: "South",
    dummy: "North",
    contract: { level: 3, strain: "NT" },
    trump: null,
    playPlan: {
      priorities: [{
        kind: "finesse",
        confidence: "uncertain",
        suit: "H",
        leadSeat: "South",
        targetSeat: "North",
        finesseRank: "Q",
        missingHonor: "K"
      }]
    }
  });

  assert.equal(result.card.id, "7H");
  assert.equal(result.ruleId, "partnerWinningLow");
  assert.equal(result.planFallback.reason, "finesseCardUnnecessary");
  assert.equal(result.planFallback.finesseCard.id, "QH");
  assert.equal(result.planFallback.winningCard.id, "AH");
  assert.ok(!result.planPriority);
});

test("chooseCardPlay continues a play-plan long-suit development after partner leads the suit", () => {
  const declarerHand = hand("AS", "KS", "AD", "2C", "2D");
  const dummyHand = hand("KC", "QC", "JC", "4C", "3C", "AH");
  const contract = { level: 3, strain: "NT" };
  const playPlan = rules.createPlayPlan({
    declarerHand,
    dummyHand,
    contract,
    declarer: "South",
    dummy: "North"
  });

  const result = rules.chooseCardPlay({
    hand: dummyHand,
    partnerHand: declarerHand,
    currentTrick: [
      { seat: "South", card: card("2C") },
      { seat: "West", card: card("5C") }
    ],
    seat: "North",
    declarer: "South",
    dummy: "North",
    contract,
    trump: null,
    playPlan
  });

  assert.equal(result.card.id, "KC");
  assert.equal(result.ruleId, "playPlan.developLongSuit");
  assert.equal(result.planPriority.kind, "developLongSuit");
  assert.equal(result.action, "continueWorkSuit");
});

test("chooseCardPlay follows the play-plan hold-up before taking the ace", () => {
  const declarerHand = hand("AH", "2H", "AS", "KS", "AD", "2C");
  const dummyHand = hand("4H", "KC", "QC", "JC", "TC", "3C");
  const contract = { level: 3, strain: "NT" };
  const currentTrick = [{ seat: "West", card: card("KH") }];
  const playPlan = rules.createPlayPlan({
    declarerHand,
    dummyHand,
    contract,
    declarer: "South",
    dummy: "North",
    currentTrick
  });

  const result = rules.chooseCardPlay({
    hand: declarerHand,
    partnerHand: dummyHand,
    currentTrick,
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract,
    trump: null,
    playPlan
  });

  assert.equal(result.card.id, "2H");
  assert.equal(result.ruleId, "playPlan.holdUpStopper");
  assert.equal(result.planPriority.kind, "holdUpStopper");
});

test("chooseCardPlay preserves dummy's only entry to a notrump work suit on the opening lead", () => {
  const declarerHand = hand("KS", "3S", "2S", "AH", "JH", "8H", "5H", "6D", "3D", "AC", "KC", "9C", "3C");
  const dummyHand = hand("AS", "7S", "9H", "4H", "2H", "KD", "QD", "JD", "TD", "9D", "TC", "8C", "6C");
  const contract = { level: 3, strain: "NT" };
  const currentTrick = [{ seat: "West", card: card("QS") }];
  const playPlan = rules.createPlayPlan({
    declarerHand,
    dummyHand,
    contract,
    declarer: "South",
    dummy: "North",
    currentTrick
  });

  const result = rules.chooseCardPlay({
    hand: dummyHand,
    partnerHand: declarerHand,
    currentTrick,
    seat: "North",
    declarer: "South",
    dummy: "North",
    contract,
    trump: null,
    playPlan
  });

  assert.equal(result.card.id, "7S");
  assert.equal(result.ruleId, "playPlan.preserveWorkSuitEntry");
  assert.equal(result.planPriority.suit, "D");
  assert.equal(result.entrySuit, "S");
  assert.equal(result.entryRank, "A");
});

test("chooseCardPlay gives up a notrump work suit early before cashing same-suit entries", () => {
  const declarerHand = hand("AS", "KS", "2S", "AH", "6H", "4H", "5D", "3D", "2D", "AC", "JC", "8C");
  const dummyHand = hand("JS", "8S", "7H", "AD", "KD", "8D", "6D", "4D", "9C", "6C", "5C", "4C");
  const contract = { level: 3, strain: "NT" };
  const trickHistory = [{
    number: 1,
    winner: "South",
    cards: [
      { seat: "West", card: card("JH") },
      { seat: "North", card: card("5H") },
      { seat: "East", card: card("2H") },
      { seat: "South", card: card("QH") }
    ]
  }];
  const playPlan = rules.createPlayPlan({
    declarerHand,
    dummyHand,
    contract,
    declarer: "South",
    dummy: "North",
    trickHistory
  });

  const result = rules.chooseCardPlay({
    hand: declarerHand,
    partnerHand: dummyHand,
    currentTrick: [],
    trickHistory,
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract,
    trump: null,
    playPlan
  });

  assert.equal(result.card.id, "2D");
  assert.equal(result.ruleId, "playPlan.developLongSuit");
  assert.equal(result.planPriority.timing, "giveUpEarly");
  assert.equal(result.action, "giveUpWorkSuitEarly");
});

test("chooseCardPlay takes the ace when a hold-up duck is not available", () => {
  const declarerHand = hand("AH", "AS", "KS", "AD", "2C");
  const dummyHand = hand("KC", "QC", "JC", "TC", "3C");
  const contract = { level: 3, strain: "NT" };
  const currentTrick = [{ seat: "West", card: card("KH") }];
  const playPlan = rules.createPlayPlan({
    declarerHand,
    dummyHand,
    contract,
    declarer: "South",
    dummy: "North",
    currentTrick
  });

  const result = rules.chooseCardPlay({
    hand: declarerHand,
    partnerHand: dummyHand,
    currentTrick,
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract,
    trump: null,
    playPlan
  });

  assert.equal(result.card.id, "AH");
  assert.equal(result.ruleId, "cheapestWinner");
});

test("chooseCardPlay holds up twice in notrump and takes the third round", () => {
  const contract = { level: 3, strain: "NT" };
  const firstPlan = rules.createPlayPlan({
    declarerHand: hand("AS", "6S", "5S", "AH", "8H", "3H", "AD", "KD", "8D", "4D", "TC", "8C", "5C"),
    dummyHand: hand("7S", "4S", "KH", "5H", "4H", "QD", "7D", "6D", "5D", "KC", "QC", "JC", "6C"),
    contract,
    declarer: "South",
    dummy: "North",
    currentTrick: [{ seat: "West", card: card("KS") }]
  });
  const firstDuck = rules.chooseCardPlay({
    hand: hand("AS", "6S", "5S", "AH", "8H", "3H", "AD", "KD", "8D", "4D", "TC", "8C", "5C"),
    partnerHand: hand("7S", "4S", "KH", "5H", "4H", "QD", "7D", "6D", "5D", "KC", "QC", "JC", "6C"),
    currentTrick: [{ seat: "West", card: card("KS") }, { seat: "North", card: card("4S") }, { seat: "East", card: card("3S") }],
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract,
    trump: null,
    playPlan: firstPlan
  });
  assert.equal(firstDuck.card.id, "5S");
  assert.equal(firstDuck.ruleId, "playPlan.holdUpStopper");
  assert.equal(firstDuck.holdUpsRemaining, 2);

  const secondHistory = [{
    number: 1,
    winner: "West",
    cards: [
      { seat: "West", card: card("KS") },
      { seat: "North", card: card("4S") },
      { seat: "East", card: card("3S") },
      { seat: "South", card: card("5S") }
    ]
  }];
  const secondPlan = rules.createPlayPlan({
    declarerHand: hand("AS", "6S", "AH", "8H", "3H", "AD", "KD", "8D", "4D", "TC", "8C", "5C"),
    dummyHand: hand("7S", "KH", "5H", "4H", "QD", "7D", "6D", "5D", "KC", "QC", "JC", "6C"),
    contract,
    declarer: "South",
    dummy: "North",
    trickHistory: secondHistory,
    currentTrick: [{ seat: "West", card: card("QS") }]
  });
  const secondDuck = rules.chooseCardPlay({
    hand: hand("AS", "6S", "AH", "8H", "3H", "AD", "KD", "8D", "4D", "TC", "8C", "5C"),
    partnerHand: hand("7S", "KH", "5H", "4H", "QD", "7D", "6D", "5D", "KC", "QC", "JC", "6C"),
    currentTrick: [{ seat: "West", card: card("QS") }, { seat: "North", card: card("7S") }, { seat: "East", card: card("9S") }],
    trickHistory: secondHistory,
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract,
    trump: null,
    playPlan: secondPlan
  });
  assert.equal(secondDuck.card.id, "6S");
  assert.equal(secondDuck.ruleId, "playPlan.holdUpStopper");
  assert.equal(secondDuck.holdUpsRemaining, 1);

  const thirdHistory = [
    ...secondHistory,
    {
      number: 2,
      winner: "West",
      cards: [
        { seat: "West", card: card("QS") },
        { seat: "North", card: card("7S") },
        { seat: "East", card: card("9S") },
        { seat: "South", card: card("6S") }
      ]
    }
  ];
  const thirdPlan = rules.createPlayPlan({
    declarerHand: hand("AS", "AH", "8H", "3H", "AD", "KD", "8D", "4D", "TC", "8C", "5C"),
    dummyHand: hand("KH", "5H", "4H", "QD", "7D", "6D", "5D", "KC", "QC", "JC", "6C"),
    contract,
    declarer: "South",
    dummy: "North",
    trickHistory: thirdHistory,
    currentTrick: [{ seat: "West", card: card("JS") }]
  });
  const takeAce = rules.chooseCardPlay({
    hand: hand("AS", "AH", "8H", "3H", "AD", "KD", "8D", "4D", "TC", "8C", "5C"),
    partnerHand: hand("KH", "5H", "4H", "QD", "7D", "6D", "5D", "KC", "QC", "JC", "6C"),
    currentTrick: [{ seat: "West", card: card("JS") }, { seat: "North", card: card("4H") }, { seat: "East", card: card("TS") }],
    trickHistory: thirdHistory,
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract,
    trump: null,
    playPlan: thirdPlan
  });
  assert.equal(takeAce.card.id, "AS");
  assert.notEqual(takeAce.ruleId, "playPlan.holdUpStopper");
});

test("chooseCardPlay uses a safe-hand finesse after holding up the danger suit", () => {
  const declarerHand = hand("JS", "6S", "AH", "AD", "KD", "8D", "4D", "AC", "JC", "TC", "2C");
  const dummyHand = hand("AS", "QS", "TS", "9S", "QD", "JD", "6D", "5D", "QC", "5C", "4C");
  const contract = { level: 3, strain: "NT" };
  const trickHistory = [
    {
      number: 1,
      winner: "East",
      cards: [
        { seat: "West", card: card("2H") },
        { seat: "North", card: card("5H") },
        { seat: "East", card: card("KH") },
        { seat: "South", card: card("3H") }
      ]
    },
    {
      number: 2,
      winner: "West",
      cards: [
        { seat: "East", card: card("4H") },
        { seat: "South", card: card("8H") },
        { seat: "West", card: card("QH") },
        { seat: "North", card: card("TH") }
      ]
    },
    {
      number: 3,
      winner: "South",
      cards: [
        { seat: "West", card: card("JH") },
        { seat: "North", card: card("6D") },
        { seat: "East", card: card("9H") },
        { seat: "South", card: card("AH") }
      ]
    }
  ];
  const playPlan = rules.createPlayPlan({
    declarerHand,
    dummyHand,
    contract,
    declarer: "South",
    dummy: "North",
    trickHistory
  });

  const result = rules.chooseCardPlay({
    hand: declarerHand,
    partnerHand: dummyHand,
    currentTrick: [],
    trickHistory,
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract,
    trump: null,
    playPlan
  });

  assert.equal(result.card.id, "JS");
  assert.equal(result.ruleId, "playPlan.safeHandFinesse");
  assert.equal(result.safeSeat, "East");
  assert.equal(result.dangerousSeat, "West");
});

test("chooseCardPlay follows a repeat finesse from the play plan", () => {
  const declarerHand = hand("3H", "2H", "AD");
  const dummyHand = hand("AH", "JH", "7H", "AC");
  const contract = { level: 3, strain: "NT" };
  const trickHistory = [{
    number: 1,
    winner: "North",
    cards: [
      { seat: "South", card: card("4H") },
      { seat: "West", card: card("5H") },
      { seat: "North", card: card("QH") },
      { seat: "East", card: card("6H") }
    ]
  }];
  const playPlan = rules.createPlayPlan({
    declarerHand,
    dummyHand,
    contract,
    declarer: "South",
    dummy: "North",
    trickHistory
  });

  const result = rules.chooseCardPlay({
    hand: declarerHand,
    partnerHand: dummyHand,
    currentTrick: [],
    trickHistory,
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract,
    trump: null,
    playPlan
  });

  assert.equal(result.card.id, "2H");
  assert.equal(result.ruleId, "playPlan.repeatFinesse");
  assert.equal(result.planPriority.kind, "repeatFinesse");
  assert.equal(result.finesseRank, "J");
});

test("chooseCardPlay follows a two-way finesse from the play plan", () => {
  const declarerHand = hand("AH", "JH", "2H", "KD");
  const dummyHand = hand("KH", "TH", "3H", "9D");
  const contract = { level: 3, strain: "NT" };
  const playPlan = rules.createPlayPlan({
    declarerHand,
    dummyHand,
    contract,
    declarer: "South",
    dummy: "North"
  });

  const result = rules.chooseCardPlay({
    hand: dummyHand,
    partnerHand: declarerHand,
    currentTrick: [],
    seat: "North",
    declarer: "South",
    dummy: "North",
    contract,
    trump: null,
    playPlan
  });

  assert.equal(result.card.id, "3H");
  assert.equal(result.ruleId, "playPlan.twoWayFinesse");
  assert.equal(result.planPriority.kind, "twoWayFinesse");
  assert.equal(result.targetSeat, "South");
  assert.equal(result.finesseRank, "J");
});

test("chooseCardPlay explains when a directional finesse cannot beat the current winner", () => {
  const result = rules.chooseCardPlay({
    hand: hand("JH", "2H", "KD"),
    partnerHand: hand("KH", "TH", "3H", "9D"),
    currentTrick: [
      { seat: "North", card: card("3H") },
      { seat: "East", card: card("QH") }
    ],
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract: { level: 3, strain: "NT" },
    trump: null,
    playPlan: {
      priorities: [{
        kind: "twoWayFinesse",
        confidence: "uncertain",
        suit: "H",
        leadSeat: "North",
        targetSeat: "South",
        finesseRank: "J",
        missingHonor: "Q"
      }]
    }
  });

  assert.equal(result.card.id, "2H");
  assert.equal(result.ruleId, "lowestFollow");
  assert.equal(result.planFallback.reason, "finesseCardNotWinning");
  assert.equal(result.planFallback.priority.kind, "twoWayFinesse");
  assert.equal(result.planFallback.finesseCard.id, "JH");
  assert.equal(result.planFallback.winningCard.id, "QH");
  assert.ok(!result.planPriority);
});

test("chooseCardPlay follows the play-plan draw-trumps priority", () => {
  const declarerHand = hand("AS", "KS", "QS", "2S", "AH", "KH", "AD", "KD", "AC", "KC");
  const dummyHand = hand("JS", "TS", "9S", "8S", "QH", "JH", "QD", "JD", "QC", "JC");
  const contract = { level: 4, strain: "S" };
  const playPlan = rules.createPlayPlan({
    declarerHand,
    dummyHand,
    contract,
    declarer: "South",
    dummy: "North"
  });

  const result = rules.chooseCardPlay({
    hand: declarerHand,
    partnerHand: dummyHand,
    currentTrick: [],
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract,
    trump: "S",
    playPlan
  });

  assert.equal(result.card.id, "AS");
  assert.equal(result.ruleId, "playPlan.drawTrumps");
  assert.equal(result.planPriority.kind, "drawTrumps");
});

test("chooseCardPlay keeps a trump round tied to the play plan when partner is already winning", () => {
  const result = rules.chooseCardPlay({
    hand: hand("9S", "8S", "AH"),
    partnerHand: hand("AS", "KS", "QS"),
    currentTrick: [
      { seat: "South", card: card("AS") },
      { seat: "West", card: card("2S") }
    ],
    seat: "North",
    declarer: "South",
    dummy: "North",
    contract: { level: 4, strain: "S" },
    trump: "S",
    playPlan: {
      priorities: [{
        kind: "drawTrumps",
        confidence: "basic",
        suit: "S",
        trumpLength: 8,
        timing: "early"
      }]
    }
  });

  assert.equal(result.card.id, "8S");
  assert.equal(result.ruleId, "playPlan.drawTrumps");
  assert.equal(result.planPriority.kind, "drawTrumps");
  assert.equal(result.action, "continueDrawTrumps");
});

test("chooseCardPlay preserves a planned cash winner when partner is already winning", () => {
  const result = rules.chooseCardPlay({
    hand: hand("AH", "8H", "2C"),
    partnerHand: hand("KH", "3H", "AD"),
    currentTrick: [
      { seat: "South", card: card("KH") },
      { seat: "West", card: card("2H") }
    ],
    seat: "North",
    declarer: "South",
    dummy: "North",
    contract: { level: 3, strain: "NT" },
    trump: null,
    playPlan: {
      priorities: [{
        kind: "cashWinners",
        confidence: "basic",
        suit: "H",
        cashRanks: ["A"],
        firstSeat: "North",
        timing: "cashNow"
      }]
    }
  });

  assert.equal(result.card.id, "8H");
  assert.equal(result.ruleId, "playPlan.cashWinners");
  assert.equal(result.planPriority.kind, "cashWinners");
  assert.equal(result.action, "preserveWinnerUnderPartnerWinner");
  assert.equal(result.winningSeat, "South");
});

test("chooseCardPlay follows a suit-contract finesse from the trump-length base hand", () => {
  const declarerHand = hand("AS", "8S", "QH", "TH", "4H", "AD", "QD", "JD", "7D", "KC", "9C", "8C", "5C");
  const dummyHand = hand("KS", "7S", "2S", "AH", "KH", "JH", "9H", "3H", "5D", "4D", "AC", "7C", "4C");
  const contract = { level: 4, strain: "H" };
  const playPlan = rules.createPlayPlan({
    declarerHand,
    dummyHand,
    contract,
    declarer: "South",
    dummy: "North"
  });
  const finesse = playPlan.priorities.find((item) => item.kind === "finesse" && item.suit === "D");

  const result = rules.chooseCardPlay({
    hand: dummyHand,
    partnerHand: declarerHand,
    currentTrick: [],
    seat: "North",
    declarer: "South",
    dummy: "North",
    contract,
    trump: "H",
    playPlan: { priorities: [finesse] }
  });

  assert.equal(result.card.id, "4D");
  assert.equal(result.ruleId, "playPlan.finesseTowardHonor");
  assert.equal(result.planPriority.kind, "finesse");
  assert.equal(result.targetSeat, "South");
  assert.equal(result.finesseRank, "Q");
});

test("chooseCardPlay takes the play-plan dummy ruff before delayed trump drawing", () => {
  const declarerHand = hand("AS", "KS", "QS", "9S", "8S", "JH", "TH", "8H", "3H", "AD", "KD", "AC", "KC");
  const dummyHand = hand("JS", "TS", "7S", "2D", "3D", "4D", "QC", "JC", "TC", "9C");
  const contract = { level: 4, strain: "S" };
  const playPlan = rules.createPlayPlan({
    declarerHand,
    dummyHand,
    contract,
    declarer: "South",
    dummy: "North"
  });

  const result = rules.chooseCardPlay({
    hand: declarerHand,
    partnerHand: dummyHand,
    currentTrick: [],
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract,
    trump: "S",
    playPlan
  });

  assert.equal(result.card.id, "3H");
  assert.equal(result.ruleId, "playPlan.ruffShortSuit");
  assert.equal(result.planPriority.kind, "ruffShortSuit");
});

test("chooseCardPlay keeps a planned ruff visible when partner already wins the trick", () => {
  const result = rules.chooseCardPlay({
    hand: hand("3S", "2C", "5D"),
    partnerHand: hand("AH", "KH", "2H"),
    currentTrick: [
      { seat: "South", card: card("AH") },
      { seat: "West", card: card("4H") }
    ],
    seat: "North",
    declarer: "South",
    dummy: "North",
    contract: { level: 4, strain: "S" },
    trump: "S",
    playPlan: {
      priorities: [{
        kind: "ruffShortSuit",
        confidence: "basic",
        suit: "H",
        shortSeat: "North",
        longSeat: "South",
        timing: "ruffNow"
      }]
    }
  });

  assert.equal(result.card.id, "2C");
  assert.equal(result.ruleId, "playPlan.skipRuffPartnerWinning");
  assert.equal(result.planPriority.kind, "ruffShortSuit");
  assert.equal(result.action, "skipRuffPartnerWinning");
  assert.equal(result.winningSeat, "South");
});

test("chooseCardPlay prepares a short-hand ruff by playing the side suit first", () => {
  const declarerHand = hand("AS", "TS", "9S", "AH", "QH", "JH", "2H", "KD", "5D", "QC", "TC", "3C");
  const dummyHand = hand("8S", "3S", "TH", "7H", "3H", "QD", "7D", "6D", "3D", "AC", "JC", "8C", "2C");
  const contract = { level: 4, strain: "H" };
  const playPlan = rules.createPlayPlan({
    declarerHand,
    dummyHand,
    contract,
    declarer: "South",
    dummy: "North",
    currentTrick: [{ seat: "West", card: card("9H") }]
  });
  const ruff = playPlan.priorities.find((item) => item.kind === "ruffShortSuit" && item.suit === "S");

  const result = rules.chooseCardPlay({
    hand: declarerHand,
    partnerHand: dummyHand,
    currentTrick: [],
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract,
    trump: "H",
    playPlan: { priorities: [ruff] }
  });

  assert.equal(result.card.id, "AS");
  assert.equal(result.ruleId, "playPlan.prepareShortSuitRuff");
  assert.equal(result.planPriority.kind, "ruffShortSuit");
  assert.equal(result.action, "cashWinnerBeforeShortRuff");
  assert.equal(result.extraTrickValue, true);
});

test("chooseCardPlay draws one limited trump round before a planned ruff", () => {
  const declarerHand = hand("KS", "QS", "9S", "8S", "7S", "JH", "TH", "8H", "3H", "AD", "KD", "AC", "KC");
  const dummyHand = hand("JS", "TS", "2D", "3D", "4D", "QC", "JC", "TC", "9C");
  const contract = { level: 4, strain: "S" };
  const playPlan = rules.createPlayPlan({
    declarerHand,
    dummyHand,
    contract,
    declarer: "South",
    dummy: "North"
  });

  const result = rules.chooseCardPlay({
    hand: declarerHand,
    partnerHand: dummyHand,
    currentTrick: [],
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract,
    trump: "S",
    playPlan
  });

  assert.equal(result.card.id, "KS");
  assert.equal(result.ruleId, "playPlan.drawTrumps");
  assert.equal(result.planPriority.timing, "limitedBeforeRuff");
  assert.equal(result.roundLimit, 1);
});

test("chooseCardPlay switches to the ruff plan after the limited trump round", () => {
  const declarerHand = hand("QS", "9S", "8S", "7S", "JH", "TH", "8H", "3H", "AD", "KD", "AC", "KC");
  const dummyHand = hand("TS", "2D", "3D", "4D", "QC", "JC", "TC", "9C");
  const contract = { level: 4, strain: "S" };
  const trickHistory = [{
    number: 1,
    winner: "West",
    cards: [
      { seat: "South", card: card("KS") },
      { seat: "West", card: card("AS") },
      { seat: "North", card: card("JS") },
      { seat: "East", card: card("2S") }
    ]
  }];
  const playPlan = rules.createPlayPlan({
    declarerHand,
    dummyHand,
    contract,
    declarer: "South",
    dummy: "North",
    trickHistory
  });

  const result = rules.chooseCardPlay({
    hand: declarerHand,
    partnerHand: dummyHand,
    currentTrick: [],
    trickHistory,
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract,
    trump: "S",
    playPlan
  });

  assert.equal(result.card.id, "3H");
  assert.equal(result.ruleId, "playPlan.ruffShortSuit");
  assert.equal(result.planPriority.kind, "ruffShortSuit");
});

test("chooseCardPlay preserves the last trump in the planned ruff hand", () => {
  const declarerHand = hand("KS", "QS", "9S", "8S", "7S", "JH", "TH", "8H", "3H", "AD", "KD", "AC", "KC");
  const dummyHand = hand("JS", "2D", "3D", "4D", "QC", "JC", "TC", "9C");
  const contract = { level: 4, strain: "S" };
  const playPlan = rules.createPlayPlan({
    declarerHand,
    dummyHand: hand("JS", "TS", "2D", "3D", "4D", "QC", "JC", "TC", "9C"),
    contract,
    declarer: "South",
    dummy: "North"
  });

  const result = rules.chooseCardPlay({
    hand: dummyHand,
    partnerHand: declarerHand,
    currentTrick: [],
    seat: "North",
    declarer: "South",
    dummy: "North",
    contract,
    trump: "S",
    playPlan
  });

  assert.notEqual(result.ruleId, "playPlan.drawTrumps");
  assert.notEqual(result.card.id, "JS");
});

test("chooseCardPlay falls back when no plan priority can be played", () => {
  const result = rules.chooseCardPlay({
    hand: hand("AH", "7H", "2D"),
    partnerHand: hand("AS", "KS"),
    currentTrick: [],
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract: { level: 4, strain: "S" },
    trump: "S",
    playPlan: {
      priorities: [{
        kind: "drawTrumps",
        confidence: "basic",
        suit: "S",
        trumpLength: 8,
        timing: "early"
      }]
    }
  });

  assert.equal(result.card.id, "AH");
  assert.equal(result.ruleId, "longestSuitLead");
  assert.equal(result.planFallback.reason, "noPlanSuitCard");
  assert.equal(result.planFallback.priority.kind, "drawTrumps");
  assert.ok(!result.planPriority);
});

test("chooseCardPlay explains when following suit blocks the visible play plan", () => {
  const result = rules.chooseCardPlay({
    hand: hand("7H", "2S"),
    partnerHand: hand("AS", "KS"),
    currentTrick: [{ seat: "West", card: card("KH") }],
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract: { level: 4, strain: "S" },
    trump: "S",
    playPlan: {
      priorities: [{
        kind: "drawTrumps",
        confidence: "basic",
        suit: "S",
        trumpLength: 8,
        timing: "early"
      }]
    }
  });

  assert.equal(result.card.id, "7H");
  assert.equal(result.ruleId, "lowestFollow");
  assert.equal(result.planFallback.reason, "followSuit");
  assert.equal(result.planFallback.leadSuit, "H");
});

test("chooseCardPlay explains when a trump round limit blocks drawing more trumps", () => {
  const result = rules.chooseCardPlay({
    hand: hand("AS", "AH", "7H"),
    partnerHand: hand("KS", "QS"),
    currentTrick: [],
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract: { level: 4, strain: "S" },
    trump: "S",
    playPlan: {
      priorities: [{
        kind: "drawTrumps",
        confidence: "basic",
        suit: "S",
        trumpLength: 8,
        timing: "limitedBeforeRuff",
        roundLimit: 1,
        playedTrumpRounds: 1
      }]
    }
  });

  assert.equal(result.planFallback.reason, "roundLimitReached");
  assert.equal(result.planFallback.roundLimit, 1);
  assert.equal(result.planFallback.playedTrumpRounds, 1);
  assert.ok(!result.planFallbackOnly);
});

test("chooseCardPlay explains when a trump must be preserved for a planned ruff", () => {
  const result = rules.chooseCardPlay({
    hand: hand("AS", "AH", "7H"),
    partnerHand: hand("KS", "QS"),
    currentTrick: [],
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract: { level: 4, strain: "S" },
    trump: "S",
    playPlan: {
      priorities: [{
        kind: "drawTrumps",
        confidence: "basic",
        suit: "S",
        trumpLength: 8,
        timing: "limitedBeforeRuff",
        preserveSeat: "South",
        preserveTrumpCount: 1
      }]
    }
  });

  assert.equal(result.planFallback.reason, "preserveTrumpForRuff");
  assert.equal(result.planFallback.preserveSeat, "South");
  assert.equal(result.planFallback.preserveTrumpCount, 1);
  assert.ok(!result.planFallbackOnly);
});

test("chooseCardPlay does not call the spade king a sure winner while the ace is unseen", () => {
  const contract = { level: 2, strain: "H" };
  const trickHistory = [
    {
      number: 1,
      winner: "South",
      cards: [
        { seat: "West", card: card("JS") },
        { seat: "North", card: card("2S") },
        { seat: "East", card: card("4S") },
        { seat: "South", card: card("QS") }
      ]
    },
    {
      number: 2,
      winner: "South",
      cards: [
        { seat: "South", card: card("AH") },
        { seat: "West", card: card("2H") },
        { seat: "North", card: card("5H") },
        { seat: "East", card: card("8H") }
      ]
    },
    {
      number: 3,
      winner: "South",
      cards: [
        { seat: "South", card: card("KH") },
        { seat: "West", card: card("6H") },
        { seat: "North", card: card("7H") },
        { seat: "East", card: card("9H") }
      ]
    },
    {
      number: 4,
      winner: "South",
      cards: [
        { seat: "South", card: card("AC") },
        { seat: "West", card: card("6C") },
        { seat: "North", card: card("5C") },
        { seat: "East", card: card("2C") }
      ]
    },
    {
      number: 5,
      winner: "South",
      cards: [
        { seat: "South", card: card("QH") },
        { seat: "West", card: card("JH") },
        { seat: "North", card: card("2D") },
        { seat: "East", card: card("TH") }
      ]
    }
  ];
  const declarerHand = hand("KS", "3S", "4H", "TD", "8D", "4D", "3D");
  const dummyHand = hand("8S", "7S", "5S", "QC", "9C", "8C", "6D", "5D");
  const playPlan = rules.createPlayPlan({
    declarerHand,
    dummyHand,
    contract,
    declarer: "South",
    dummy: "North",
    trickHistory
  });

  assert.ok(!playPlan.priorities.some((priority) => priority.suit === "S" && (priority.kind === "cashWinners" || priority.kind === "cashSureWinners")));

  const result = rules.chooseCardPlay({
    hand: declarerHand,
    partnerHand: dummyHand,
    currentTrick: [],
    trickHistory,
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract,
    trump: "H",
    playPlan
  });

  assert.notEqual(result.ruleId, "playPlan.cashSureWinners");
  assert.ok(!(result.card.id === "KS" && result.ruleId.startsWith("playPlan.cash")));
});

test("chooseCardPlay can cash the king after the ace has been played", () => {
  const contract = { level: 2, strain: "H" };
  const trickHistory = [{
    number: 1,
    winner: "West",
    cards: [
      { seat: "West", card: card("AS") },
      { seat: "North", card: card("2S") },
      { seat: "East", card: card("4S") },
      { seat: "South", card: card("3S") }
    ]
  }];
  const declarerHand = hand("KS", "7H", "6H", "3D");
  const dummyHand = hand("8S", "5H", "4H", "2D");
  const playPlan = rules.createPlayPlan({
    declarerHand,
    dummyHand,
    contract,
    declarer: "South",
    dummy: "North",
    trickHistory
  });
  const spadeCash = playPlan.priorities.find((priority) => priority.kind === "cashWinners" && priority.suit === "S");

  assert.ok(spadeCash);
  assert.deepEqual(spadeCash.cashRanks, ["K"]);

  const result = rules.chooseCardPlay({
    hand: declarerHand,
    partnerHand: dummyHand,
    currentTrick: [],
    trickHistory,
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract,
    trump: "H",
    playPlan
  });

  assert.equal(result.card.id, "KS");
  assert.equal(result.ruleId, "playPlan.cashWinners");
  assert.deepEqual(result.cashRanks, ["K"]);
});

test("chooseCardPlay follows the play-plan long-suit ruffing priority from the long hand", () => {
  const declarerHand = hand("AS", "KS", "QS", "2S", "KH", "QH", "JH", "TH", "9H", "8H", "AD", "5D", "2C");
  const dummyHand = hand("JS", "TS", "9S", "2H", "2D", "4C", "3C");
  const contract = { level: 4, strain: "S" };
  const playPlan = rules.createPlayPlan({
    declarerHand,
    dummyHand,
    contract,
    declarer: "South",
    dummy: "North"
  });

  const result = rules.chooseCardPlay({
    hand: declarerHand,
    partnerHand: dummyHand,
    currentTrick: [],
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract,
    trump: "S",
    playPlan
  });

  assert.equal(result.card.id, "8H");
  assert.equal(result.ruleId, "playPlan.establishLongSuitByRuffing");
  assert.equal(result.planPriority.kind, "establishLongSuitByRuffing");
});

test("chooseCardPlay enters the long side-suit hand for a long-suit ruffing plan", () => {
  const declarerHand = hand("AS", "KS", "QS", "2S", "KH", "QH", "JH", "TH", "9H", "8H", "AD", "5D", "2C");
  const dummyHand = hand("JS", "TS", "9S", "2H", "2D", "4C", "3C");
  const contract = { level: 4, strain: "S" };
  const playPlan = rules.createPlayPlan({
    declarerHand,
    dummyHand,
    contract,
    declarer: "South",
    dummy: "North"
  });

  const result = rules.chooseCardPlay({
    hand: dummyHand,
    partnerHand: declarerHand,
    currentTrick: [],
    seat: "North",
    declarer: "South",
    dummy: "North",
    contract,
    trump: "S",
    playPlan
  });

  assert.equal(result.card.id, "2D");
  assert.equal(result.ruleId, "playPlan.enterLongSuitHand");
  assert.equal(result.entryRank, "A");
  assert.equal(result.planPriority.kind, "establishLongSuitByRuffing");
});

test("chooseCardPlay explains when a long-suit ruffing plan lacks an entry", () => {
  const result = rules.chooseCardPlay({
    hand: hand("JS", "TS", "9S", "2C"),
    partnerHand: hand("AS", "KS", "QS", "2S", "KH", "QH", "JH", "TH", "9H", "8H"),
    currentTrick: [],
    seat: "North",
    declarer: "South",
    dummy: "North",
    contract: { level: 4, strain: "S" },
    trump: "S",
    playPlan: {
      priorities: [{
        kind: "establishLongSuitByRuffing",
        confidence: "basic",
        suit: "H",
        longSeat: "South",
        shortSeat: "North",
        longLength: 6,
        shortLength: 1,
        estimatedRuffsNeeded: 2
      }]
    }
  });

  assert.equal(result.planFallback.reason, "missingEntry");
  assert.equal(result.planFallback.targetSeat, "South");
  assert.equal(result.planFallback.priority.kind, "establishLongSuitByRuffing");
  assert.ok(!result.planFallbackOnly);
});

test("chooseCardPlay ruffs the long side suit when the short hand is void", () => {
  const declarerHand = hand("AS", "KS", "QS", "2S", "KH", "QH", "JH", "TH", "9H", "8H", "AD", "5D", "2C");
  const dummyHand = hand("JS", "TS", "9S", "2D", "4C", "3C");
  const contract = { level: 4, strain: "S" };
  const playPlan = rules.createPlayPlan({
    declarerHand,
    dummyHand: hand("JS", "TS", "9S", "2H", "2D", "4C", "3C"),
    contract,
    declarer: "South",
    dummy: "North"
  });

  const result = rules.chooseCardPlay({
    hand: dummyHand,
    partnerHand: declarerHand,
    currentTrick: [
      { seat: "South", card: card("8H") },
      { seat: "West", card: card("AH") }
    ],
    seat: "North",
    declarer: "South",
    dummy: "North",
    contract,
    trump: "S",
    playPlan
  });

  assert.equal(result.card.id, "9S");
  assert.equal(result.ruleId, "playPlan.ruffOutLongSuit");
  assert.equal(result.planPriority.kind, "establishLongSuitByRuffing");
});

test("chooseCardPlay enters the long trump hand before repeated dummy ruffs", () => {
  const declarerHand = hand("AS", "KS", "JS", "TS", "2S", "8H", "5H", "4H", "3H", "AD", "JD", "5D", "AC");
  const dummyHand = hand("QS", "8S", "5S", "AH", "KD", "QD", "7D", "6D", "7C", "6C", "5C", "3C", "2C");
  const contract = { level: 7, strain: "S" };
  const playPlan = rules.createPlayPlan({
    declarerHand,
    dummyHand,
    contract,
    declarer: "South",
    dummy: "North"
  });

  const ruff = playPlan.priorities.find((item) => item.kind === "ruffShortSuit");
  const trumps = playPlan.priorities.find((item) => item.kind === "drawTrumps");
  assert.equal(ruff.suit, "H");
  assert.equal(trumps.timing, "afterRuff");

  const openingTrick = {
    number: 1,
    winner: "North",
    cards: [
      { seat: "West", card: card("KH") },
      { seat: "North", card: card("AH") },
      { seat: "East", card: card("2H") },
      { seat: "South", card: card("3H") }
    ]
  };

  const firstEntry = rules.chooseCardPlay({
    hand: hand("QS", "8S", "5S", "KD", "QD", "7D", "6D", "7C", "6C", "5C", "3C", "2C"),
    partnerHand: hand("AS", "KS", "JS", "TS", "2S", "8H", "5H", "4H", "AD", "JD", "5D", "AC"),
    currentTrick: [],
    trickHistory: [openingTrick],
    seat: "North",
    declarer: "South",
    dummy: "North",
    contract,
    trump: "S",
    playPlan
  });

  assert.equal(firstEntry.card.id, "6D");
  assert.equal(firstEntry.ruleId, "playPlan.enterLongTrumpHand");
  assert.equal(firstEntry.entryRank, "A");
  assert.equal(firstEntry.targetSeat, "South");
  assert.equal(firstEntry.planPriority.kind, "ruffShortSuit");

  const firstRuffHistory = [
    openingTrick,
    {
      number: 2,
      winner: "South",
      cards: [
        { seat: "North", card: card("6D") },
        { seat: "East", card: card("2D") },
        { seat: "South", card: card("AD") },
        { seat: "West", card: card("3D") }
      ]
    },
    {
      number: 3,
      winner: "North",
      cards: [
        { seat: "South", card: card("4H") },
        { seat: "West", card: card("6H") },
        { seat: "North", card: card("5S") },
        { seat: "East", card: card("7H") }
      ]
    }
  ];
  const secondEntry = rules.chooseCardPlay({
    hand: hand("QS", "8S", "KD", "QD", "7D", "7C", "6C", "5C", "3C", "2C"),
    partnerHand: hand("AS", "KS", "JS", "TS", "2S", "8H", "5H", "JD", "5D", "AC"),
    currentTrick: [],
    trickHistory: firstRuffHistory,
    seat: "North",
    declarer: "South",
    dummy: "North",
    contract,
    trump: "S",
    playPlan
  });

  assert.equal(secondEntry.card.id, "7D");
  assert.equal(secondEntry.ruleId, "playPlan.enterLongTrumpHand");
  assert.equal(secondEntry.entryRank, "J");

  const secondRuffHistory = [
    ...firstRuffHistory,
    {
      number: 4,
      winner: "South",
      cards: [
        { seat: "North", card: card("7D") },
        { seat: "East", card: card("4D") },
        { seat: "South", card: card("JD") },
        { seat: "West", card: card("8D") }
      ]
    },
    {
      number: 5,
      winner: "North",
      cards: [
        { seat: "South", card: card("5H") },
        { seat: "West", card: card("9H") },
        { seat: "North", card: card("8S") },
        { seat: "East", card: card("TH") }
      ]
    }
  ];
  const thirdEntry = rules.chooseCardPlay({
    hand: hand("QS", "KD", "QD", "7C", "6C", "5C", "3C", "2C"),
    partnerHand: hand("AS", "KS", "JS", "TS", "2S", "8H", "5D", "AC"),
    currentTrick: [],
    trickHistory: secondRuffHistory,
    seat: "North",
    declarer: "South",
    dummy: "North",
    contract,
    trump: "S",
    playPlan
  });

  assert.equal(thirdEntry.card.id, "2C");
  assert.equal(thirdEntry.ruleId, "playPlan.enterLongTrumpHand");
  assert.equal(thirdEntry.entrySuit, "C");
  assert.equal(thirdEntry.entryRank, "A");
});

test("chooseCardPlay follows the urgent side-winner discard plan before drawing trumps", () => {
  const declarerHand = hand("AS", "KS", "QS", "JS", "9S", "2H", "3H", "KD", "QD", "JD", "AC", "6C", "4C");
  const dummyHand = hand("TS", "8S", "AH", "KH", "QH", "4D", "3D", "2D", "7C", "5C", "2C");
  const contract = { level: 4, strain: "S" };
  const playPlan = rules.createPlayPlan({
    declarerHand,
    dummyHand,
    contract,
    declarer: "South",
    dummy: "North",
    currentTrick: [{ seat: "West", card: card("JC") }]
  });

  const result = rules.chooseCardPlay({
    hand: dummyHand,
    partnerHand: declarerHand,
    currentTrick: [],
    seat: "North",
    declarer: "South",
    dummy: "North",
    contract,
    trump: "S",
    playPlan
  });

  assert.equal(result.card.id, "AH");
  assert.equal(result.ruleId, "playPlan.discardLoserOnWinner");
  assert.equal(result.planPriority.kind, "discardLoserOnWinner");
  assert.equal(result.attackedSuit, "C");
  assert.equal(result.action, "cashWinnerForDiscard");
});

test("chooseCardPlay wins the opening lead for a planned cross ruff", () => {
  const declarerHand = hand("KS", "QS", "9S", "7S", "3H", "AD", "5D", "4D", "2D", "9C", "8C", "5C", "3C");
  const dummyHand = hand("AS", "JS", "TS", "8S", "AH", "8H", "6H", "4H", "2H", "3D", "AC", "7C", "6C");
  const contract = { level: 4, strain: "S" };
  const currentTrick = [{ seat: "West", card: card("QH") }];
  const playPlan = rules.createPlayPlan({
    declarerHand,
    dummyHand,
    contract,
    declarer: "South",
    dummy: "North",
    currentTrick
  });

  const result = rules.chooseCardPlay({
    hand: dummyHand,
    partnerHand: declarerHand,
    currentTrick,
    seat: "North",
    declarer: "South",
    dummy: "North",
    contract,
    trump: "S",
    playPlan
  });

  assert.equal(result.card.id, "AH");
  assert.equal(result.ruleId, "playPlan.crossRuff");
  assert.equal(result.planPriority.kind, "crossRuff");
  assert.equal(result.action, "winSideSuitForCrossRuff");
});

test("chooseCardPlay preserves trump when partner safely wins during a planned cross ruff", () => {
  const contract = { level: 4, strain: "S" };
  const currentTrick = [
    { seat: "West", card: card("AH") },
    { seat: "North", card: card("2H") }
  ];
  const playPlan = {
    priorities: [{
      kind: "crossRuff",
      confidence: "basic",
      trump: "S",
      crossSuits: [
        { suit: "H", longSeat: "West", shortSeat: "East" },
        { suit: "D", longSeat: "East", shortSeat: "West" }
      ]
    }]
  };

  const result = rules.chooseCardPlay({
    hand: hand("4S", "2C"),
    partnerHand: hand("KS", "QS", "9S", "7S", "8H", "6H", "4H", "AD", "5D", "4D", "9C"),
    currentTrick,
    seat: "East",
    declarer: "West",
    dummy: "East",
    contract,
    trump: "S",
    playPlan
  });

  assert.equal(result.card.id, "2C");
  assert.equal(result.ruleId, "playPlan.crossRuff");
  assert.equal(result.planPriority.kind, "crossRuff");
  assert.equal(result.action, "skipCrossRuffPartnerWinning");
});

test("chooseCardPlay still ruffs a cross-ruff suit when partner's winner is not safe", () => {
  const contract = { level: 4, strain: "S" };
  const currentTrick = [
    { seat: "West", card: card("QH") },
    { seat: "North", card: card("2H") }
  ];
  const playPlan = {
    priorities: [{
      kind: "crossRuff",
      confidence: "basic",
      trump: "S",
      crossSuits: [
        { suit: "H", longSeat: "West", shortSeat: "East" },
        { suit: "D", longSeat: "East", shortSeat: "West" }
      ]
    }]
  };

  const result = rules.chooseCardPlay({
    hand: hand("4S", "2C"),
    partnerHand: hand("KS", "QS", "9S", "7S", "8H", "6H", "4H", "AD", "5D", "4D", "9C"),
    currentTrick,
    seat: "East",
    declarer: "West",
    dummy: "East",
    contract,
    trump: "S",
    playPlan
  });

  assert.equal(result.card.id, "4S");
  assert.equal(result.ruleId, "playPlan.crossRuff");
  assert.equal(result.planPriority.kind, "crossRuff");
  assert.equal(result.action, "crossRuff");
});

test("chooseCardPlay leads the next side suit for a planned cross ruff", () => {
  const contract = { level: 4, strain: "S" };
  const playPlan = rules.createPlayPlan({
    declarerHand: hand("KS", "QS", "9S", "7S", "3H", "AD", "5D", "4D", "2D", "9C", "8C", "5C", "3C"),
    dummyHand: hand("AS", "JS", "TS", "8S", "AH", "8H", "6H", "4H", "2H", "3D", "AC", "7C", "6C"),
    contract,
    declarer: "South",
    dummy: "North",
    currentTrick: [{ seat: "West", card: card("QH") }]
  });
  const trickHistory = [{
    number: 1,
    winner: "North",
    cards: [
      { seat: "West", card: card("QH") },
      { seat: "North", card: card("AH") },
      { seat: "East", card: card("5H") },
      { seat: "South", card: card("3H") }
    ]
  }];

  const result = rules.chooseCardPlay({
    hand: hand("AS", "JS", "TS", "8S", "8H", "6H", "4H", "2H", "3D", "AC", "7C", "6C"),
    partnerHand: hand("KS", "QS", "9S", "7S", "AD", "5D", "4D", "2D", "9C", "8C", "5C", "3C"),
    currentTrick: [],
    trickHistory,
    seat: "North",
    declarer: "South",
    dummy: "North",
    contract,
    trump: "S",
    playPlan
  });

  assert.equal(result.card.id, "2H");
  assert.equal(result.ruleId, "playPlan.crossRuff");
  assert.equal(result.planPriority.kind, "crossRuff");
  assert.equal(result.action, "leadCrossRuff");
});

test("chooseCardPlay cashes a side ace before continuing a planned cross ruff", () => {
  const contract = { level: 4, strain: "S" };
  const playPlan = rules.createPlayPlan({
    declarerHand: hand("KS", "QS", "9S", "7S", "3H", "AD", "5D", "4D", "2D", "9C", "8C", "5C", "3C"),
    dummyHand: hand("AS", "JS", "TS", "8S", "AH", "8H", "6H", "4H", "2H", "3D", "AC", "7C", "6C"),
    contract,
    declarer: "South",
    dummy: "North",
    currentTrick: [{ seat: "West", card: card("QH") }]
  });
  const trickHistory = [
    {
      number: 1,
      winner: "North",
      cards: [
        { seat: "West", card: card("QH") },
        { seat: "North", card: card("AH") },
        { seat: "East", card: card("5H") },
        { seat: "South", card: card("3H") }
      ]
    },
    {
      number: 2,
      winner: "South",
      cards: [
        { seat: "North", card: card("2H") },
        { seat: "East", card: card("7H") },
        { seat: "South", card: card("7S") },
        { seat: "West", card: card("9H") }
      ]
    }
  ];

  const result = rules.chooseCardPlay({
    hand: hand("KS", "QS", "9S", "AD", "5D", "4D", "2D", "9C", "8C", "5C", "3C"),
    partnerHand: hand("AS", "JS", "TS", "8S", "8H", "6H", "4H", "3D", "AC", "7C", "6C"),
    currentTrick: [],
    trickHistory,
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract,
    trump: "S",
    playPlan
  });

  assert.equal(result.card.id, "AD");
  assert.equal(result.ruleId, "playPlan.crossRuff");
  assert.equal(result.action, "cashWinnerBeforeCrossRuff");
});

test("chooseCardPlay cashes a safe winner before a late cross ruff", () => {
  const contract = { level: 3, strain: "D" };
  const trickHistory = lateCrossRuffTrumpHistory();
  const declarerHand = hand("TS", "AH", "KD", "QD", "JD", "8D");
  const dummyHand = hand("2C", "2H", "5D", "4D");
  const playPlan = rules.createPlayPlan({
    declarerHand,
    dummyHand,
    contract,
    declarer: "West",
    dummy: "East",
    trickHistory
  });

  const result = rules.chooseCardPlay({
    hand: declarerHand,
    partnerHand: dummyHand,
    currentTrick: [],
    trickHistory,
    seat: "West",
    declarer: "West",
    dummy: "East",
    contract,
    trump: "D",
    playPlan
  });

  assert.equal(result.card.id, "AH");
  assert.equal(result.ruleId, "playPlan.lateCrossRuff");
  assert.equal(result.planPriority.kind, "lateCrossRuff");
  assert.equal(result.action, "cashWinnerBeforeLateCrossRuff");
});

test("chooseCardPlay returns to the late cross ruff after cashing first", () => {
  const contract = { level: 3, strain: "D" };
  const trickHistory = [
    ...lateCrossRuffTrumpHistory(),
    {
      number: 3,
      winner: "West",
      cards: [
        { seat: "West", card: card("AH") },
        { seat: "North", card: card("4H") },
        { seat: "East", card: card("2H") },
        { seat: "South", card: card("5H") }
      ]
    }
  ];
  const declarerHand = hand("TS", "KD", "QD", "JD", "8D");
  const dummyHand = hand("2C", "5D", "4D");
  const leadPlan = rules.createPlayPlan({
    declarerHand,
    dummyHand,
    contract,
    declarer: "West",
    dummy: "East",
    trickHistory
  });

  const lead = rules.chooseCardPlay({
    hand: declarerHand,
    partnerHand: dummyHand,
    currentTrick: [],
    trickHistory,
    seat: "West",
    declarer: "West",
    dummy: "East",
    contract,
    trump: "D",
    playPlan: leadPlan
  });

  assert.equal(lead.card.id, "TS");
  assert.equal(lead.ruleId, "playPlan.lateCrossRuff");
  assert.equal(lead.action, "leadLateCrossRuff");

  const currentTrick = [
    { seat: "West", card: card("TS") },
    { seat: "North", card: card("7S") }
  ];
  const ruffPlan = rules.createPlayPlan({
    declarerHand: hand("KD", "QD", "JD", "8D"),
    dummyHand,
    contract,
    declarer: "West",
    dummy: "East",
    trickHistory,
    currentTrick
  });
  const ruff = rules.chooseCardPlay({
    hand: dummyHand,
    partnerHand: hand("KD", "QD", "JD", "8D"),
    currentTrick,
    trickHistory,
    seat: "East",
    declarer: "West",
    dummy: "East",
    contract,
    trump: "D",
    playPlan: ruffPlan
  });

  assert.equal(ruff.card.id, "4D");
  assert.equal(ruff.ruleId, "playPlan.lateCrossRuff");
  assert.equal(ruff.action, "securePartnerWinnerWithTrump");
});

test("chooseCardPlay ruffs low to secure a late cross ruff trick", () => {
  const contract = { level: 3, strain: "D" };
  const trickHistory = reportedLateCrossRuffTricks();
  const currentTrick = [
    { seat: "East", card: card("8C") },
    { seat: "South", card: card("6C") }
  ];
  const declarerHand = hand("TS", "KD", "QD", "JD", "8D");
  const dummyHand = hand("8H", "2C", "5D", "4D");
  const playPlan = rules.createPlayPlan({
    declarerHand,
    dummyHand,
    contract,
    declarer: "West",
    dummy: "East",
    trickHistory,
    currentTrick
  });

  const result = rules.chooseCardPlay({
    hand: declarerHand,
    partnerHand: dummyHand,
    currentTrick,
    trickHistory,
    seat: "West",
    declarer: "West",
    dummy: "East",
    contract,
    trump: "D",
    playPlan
  });

  assert.equal(result.card.id, "8D");
  assert.equal(result.ruleId, "playPlan.lateCrossRuff");
  assert.equal(result.planPriority.kind, "lateCrossRuff");
  assert.equal(result.action, "securePartnerWinnerWithTrump");
});

test("chooseCardPlay leads the reciprocal suit after winning a late cross ruff", () => {
  const contract = { level: 3, strain: "D" };
  const trickHistory = [
    ...reportedLateCrossRuffTricks(),
    {
      number: 9,
      winner: "West",
      cards: [
        { seat: "East", card: card("8C") },
        { seat: "South", card: card("6C") },
        { seat: "West", card: card("8D") },
        { seat: "North", card: card("7C") }
      ]
    }
  ];
  const declarerHand = hand("TS", "KD", "QD", "JD");
  const dummyHand = hand("8H", "2C", "5D", "4D");
  const playPlan = rules.createPlayPlan({
    declarerHand,
    dummyHand,
    contract,
    declarer: "West",
    dummy: "East",
    trickHistory
  });

  const result = rules.chooseCardPlay({
    hand: declarerHand,
    partnerHand: dummyHand,
    currentTrick: [],
    trickHistory,
    seat: "West",
    declarer: "West",
    dummy: "East",
    contract,
    trump: "D",
    playPlan
  });

  assert.equal(result.card.id, "TS");
  assert.equal(result.ruleId, "playPlan.lateCrossRuff");
  assert.equal(result.planPriority.kind, "lateCrossRuff");
  assert.equal(result.action, "leadLateCrossRuff");
});

test("chooseCardPlay ruffs the reciprocal suit in a late cross ruff", () => {
  const contract = { level: 3, strain: "D" };
  const trickHistory = [
    ...reportedLateCrossRuffTricks(),
    {
      number: 9,
      winner: "West",
      cards: [
        { seat: "East", card: card("8C") },
        { seat: "South", card: card("6C") },
        { seat: "West", card: card("8D") },
        { seat: "North", card: card("7C") }
      ]
    }
  ];
  const currentTrick = [
    { seat: "West", card: card("TS") },
    { seat: "North", card: card("7S") }
  ];
  const declarerHand = hand("KD", "QD", "JD");
  const dummyHand = hand("8H", "2C", "5D", "4D");
  const playPlan = rules.createPlayPlan({
    declarerHand,
    dummyHand,
    contract,
    declarer: "West",
    dummy: "East",
    trickHistory,
    currentTrick
  });

  const result = rules.chooseCardPlay({
    hand: dummyHand,
    partnerHand: declarerHand,
    currentTrick,
    trickHistory,
    seat: "East",
    declarer: "West",
    dummy: "East",
    contract,
    trump: "D",
    playPlan
  });

  assert.equal(result.card.id, "4D");
  assert.equal(result.ruleId, "playPlan.lateCrossRuff");
  assert.equal(result.planPriority.kind, "lateCrossRuff");
  assert.equal(result.action, "securePartnerWinnerWithTrump");
});

test("chooseCardPlay does not ruff when partner is last-hand safe in a late cross ruff shape", () => {
  const contract = { level: 3, strain: "D" };
  const trickHistory = [
    {
      number: 1,
      winner: "West",
      cards: [
        { seat: "West", card: card("AD") },
        { seat: "North", card: card("TD") },
        { seat: "East", card: card("2D") },
        { seat: "South", card: card("3D") }
      ]
    },
    {
      number: 2,
      winner: "West",
      cards: [
        { seat: "West", card: card("8D") },
        { seat: "North", card: card("7D") },
        { seat: "East", card: card("9D") },
        { seat: "South", card: card("6D") }
      ]
    }
  ];
  const currentTrick = [
    { seat: "South", card: card("6C") },
    { seat: "West", card: card("AC") },
    { seat: "North", card: card("7C") }
  ];
  const declarerHand = hand("TS", "KD", "QD", "JD");
  const dummyHand = hand("8H", "5D", "4D");
  const playPlan = rules.createPlayPlan({
    declarerHand,
    dummyHand,
    contract,
    declarer: "West",
    dummy: "East",
    trickHistory,
    currentTrick
  });

  const result = rules.chooseCardPlay({
    hand: dummyHand,
    partnerHand: declarerHand,
    currentTrick,
    trickHistory,
    seat: "East",
    declarer: "West",
    dummy: "East",
    contract,
    trump: "D",
    playPlan
  });

  assert.equal(result.card.id, "8H");
  assert.equal(result.ruleId, "partnerWinningLow");
});

test("chooseCardPlay takes the diamond finesse before drawing trumps in the lesson hand", () => {
  const declarerHand = hand("KS", "TS", "9S", "6S", "3S", "AH", "5H", "2H", "QD", "7D", "KC", "QC", "4C");
  const dummyHand = hand("QS", "JS", "7S", "5S", "9H", "4H", "3H", "AD", "JD", "TD", "JC", "7C", "2C");
  const contract = { level: 4, strain: "S" };
  const trickHistory = [{
    number: 1,
    winner: "South",
    cards: [
      { seat: "West", card: card("KH") },
      { seat: "North", card: card("3H") },
      { seat: "East", card: card("6H") },
      { seat: "South", card: card("AH") }
    ]
  }];
  const playPlan = rules.createPlayPlan({
    declarerHand,
    dummyHand,
    contract,
    declarer: "South",
    dummy: "North",
    trickHistory
  });

  const result = rules.chooseCardPlay({
    hand: declarerHand,
    partnerHand: dummyHand,
    currentTrick: [],
    trickHistory,
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract,
    trump: "S",
    playPlan
  });

  assert.equal(result.card.id, "QD");
  assert.equal(result.ruleId, "playPlan.establishSideSuitForDiscard");
  assert.equal(result.planPriority.kind, "establishSideSuitForDiscard");
  assert.equal(result.action, "forceHighCardForDiscard");
});

test("chooseCardPlay matches the lesson example by playing the short-side heart picture first", () => {
  const declarerHand = hand("QS", "JS", "TS", "5S", "4S", "QH", "8H", "AD", "QD", "5D", "6C", "5C");
  const dummyHand = hand("KS", "9S", "8S", "3S", "AH", "KH", "7H", "3H", "JD", "3D", "9C", "8C");
  const contract = { level: 4, strain: "S" };
  const trickHistory = [{
    number: 1,
    winner: "South",
    cards: [
      { seat: "West", card: card("KC") },
      { seat: "North", card: card("2C") },
      { seat: "East", card: card("3C") },
      { seat: "South", card: card("AC") }
    ]
  }];
  const playPlan = rules.createPlayPlan({
    declarerHand,
    dummyHand,
    contract,
    declarer: "South",
    dummy: "North",
    trickHistory
  });

  const result = rules.chooseCardPlay({
    hand: declarerHand,
    partnerHand: dummyHand,
    currentTrick: [],
    trickHistory,
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract,
    trump: "S",
    playPlan
  });

  assert.equal(result.card.id, "QH");
  assert.equal(result.ruleId, "playPlan.discardLoserOnWinner");
  assert.equal(result.planPriority.kind, "discardLoserOnWinner");
  assert.equal(result.action, "unblockShortHonorForDiscard");
});

test("chooseCardPlay matches the lesson example by developing spades before drawing trumps", () => {
  const declarerHand = hand("JS", "2S", "JH", "TH", "9H", "8H", "4H", "5D", "4D", "KC", "QC", "JC");
  const dummyHand = hand("KS", "QS", "5S", "KH", "QH", "7H", "3H", "KD", "6D", "7C", "6C", "5C");
  const contract = { level: 4, strain: "H" };
  const trickHistory = [{
    number: 1,
    winner: "South",
    cards: [
      { seat: "West", card: card("QD") },
      { seat: "North", card: card("3D") },
      { seat: "East", card: card("2D") },
      { seat: "South", card: card("AD") }
    ]
  }];
  const playPlan = rules.createPlayPlan({
    declarerHand,
    dummyHand,
    contract,
    declarer: "South",
    dummy: "North",
    trickHistory
  });

  const result = rules.chooseCardPlay({
    hand: declarerHand,
    partnerHand: dummyHand,
    currentTrick: [],
    trickHistory,
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract,
    trump: "H",
    playPlan
  });

  assert.equal(result.card.id, "JS");
  assert.equal(result.ruleId, "playPlan.establishSideSuitForDiscard");
  assert.equal(result.planPriority.kind, "establishSideSuitForDiscard");
  assert.equal(result.action, "forceHighCardForDiscard");
});

test("chooseCardPlay plays a high spade from dummy to force out the missing ace", () => {
  const result = rules.chooseCardPlay({
    hand: hand("KS", "QS", "5S", "KH", "QH", "7H", "3H", "KD", "6D", "7C", "6C", "5C"),
    partnerHand: hand("2S", "JH", "TH", "9H", "8H", "4H", "5D", "4D", "KC", "QC", "JC"),
    currentTrick: [
      { seat: "South", card: card("JS") },
      { seat: "West", card: card("4S") }
    ],
    trickHistory: [{
      number: 1,
      winner: "South",
      cards: [
        { seat: "West", card: card("QD") },
        { seat: "North", card: card("3D") },
        { seat: "East", card: card("2D") },
        { seat: "South", card: card("AD") }
      ]
    }],
    seat: "North",
    declarer: "South",
    dummy: "North",
    contract: { level: 4, strain: "H" },
    trump: "H",
    playPlan: {
      priorities: [{
        kind: "establishSideSuitForDiscard",
        confidence: "basic",
        suit: "S",
        discardSuit: "D",
        leadSeat: "South",
        sourceSeat: "North",
        discardSeat: "South",
        leadRank: "J",
        missingStopper: "A",
        futureWinnerRanks: ["K", "Q"],
        entrySuit: "D",
        entryRank: "K"
      }]
    }
  });

  assert.equal(result.card.id, "KS");
  assert.equal(result.ruleId, "playPlan.establishSideSuitForDiscard");
  assert.equal(result.action, "forceMissingHighCard");
});

test("chooseCardPlay explains when a side-suit discard plan lacks an entry to the lead hand", () => {
  const result = rules.chooseCardPlay({
    hand: hand("AS", "AH", "7H", "2C"),
    partnerHand: hand("KS", "QS", "5S", "KD", "6D"),
    currentTrick: [],
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract: { level: 4, strain: "H" },
    trump: "H",
    playPlan: {
      priorities: [{
        kind: "establishSideSuitForDiscard",
        confidence: "basic",
        suit: "S",
        discardSuit: "C",
        leadSeat: "North",
        sourceSeat: "South",
        discardSeat: "North",
        leadRank: "K",
        missingStopper: "A",
        futureWinnerRanks: ["Q"],
        entrySuit: "D",
        entryRank: "K"
      }]
    }
  });

  assert.equal(result.planFallback.reason, "missingEntry");
  assert.equal(result.planFallback.targetSeat, "North");
  assert.equal(result.planFallback.entrySuit, "D");
  assert.equal(result.planFallback.entryRank, "K");
  assert.equal(result.planFallback.priority.kind, "establishSideSuitForDiscard");
  assert.ok(!result.planFallbackOnly);
});

test("chooseCardPlay uses a trump entry before a repeated suit-contract finesse", () => {
  const declarerHand = hand("AS", "QS", "JS", "JH", "7H", "5H", "3H", "2H", "AD", "KD", "QD", "JC", "9C");
  const dummyHand = hand("9S", "7S", "4S", "AH", "KH", "8H", "8D", "6D", "3D", "7C", "4C", "3C", "2C");
  const contract = { level: 4, strain: "H" };
  const trickHistory = [{
    number: 1,
    winner: "South",
    cards: [
      { seat: "West", card: card("JD") },
      { seat: "North", card: card("3D") },
      { seat: "East", card: card("2D") },
      { seat: "South", card: card("QD") }
    ]
  }];
  const playPlan = rules.createPlayPlan({
    declarerHand,
    dummyHand,
    contract,
    declarer: "South",
    dummy: "North",
    trickHistory
  });

  const result = rules.chooseCardPlay({
    hand: declarerHand,
    partnerHand: dummyHand,
    currentTrick: [],
    trickHistory,
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract,
    trump: "H",
    playPlan
  });

  assert.equal(result.card.id, "2H");
  assert.equal(result.ruleId, "playPlan.useTrumpEntriesForRepeatedFinesse");
  assert.equal(result.planPriority.kind, "useTrumpEntriesForRepeatedFinesse");
  assert.equal(result.entryRank, "A");
  assert.equal(result.action, "leadTrumpEntryToFinesseHand");
});

test("chooseCardPlay takes the planned trump entry for a repeated finesse", () => {
  const result = rules.chooseCardPlay({
    hand: hand("9S", "7S", "4S", "AH", "KH", "8H", "8D", "6D", "3D", "7C", "4C", "3C", "2C"),
    partnerHand: hand("AS", "QS", "JS", "JH", "7H", "5H", "3H", "AD", "KD", "QD", "JC", "9C"),
    currentTrick: [
      { seat: "South", card: card("2H") },
      { seat: "West", card: card("4H") }
    ],
    seat: "North",
    declarer: "South",
    dummy: "North",
    contract: { level: 4, strain: "H" },
    trump: "H",
    playPlan: {
      priorities: [{
        kind: "useTrumpEntriesForRepeatedFinesse",
        confidence: "basic",
        trump: "H",
        entrySeat: "North",
        entryRank: "A",
        fromSeat: "South",
        finesseSuit: "S",
        finesseRank: "Q",
        repeatFinesseRank: "J",
        missingHonor: "K"
      }]
    }
  });

  assert.equal(result.card.id, "AH");
  assert.equal(result.ruleId, "playPlan.useTrumpEntriesForRepeatedFinesse");
  assert.equal(result.action, "takeTrumpEntryForFinesse");
});

test("chooseCardPlay develops a work suit before using dummy's only trump entry", () => {
  const declarerHand = hand("KS", "QS", "8S", "7S", "2S", "KH", "6H", "AD", "5D", "4D", "KC", "3C");
  const dummyHand = hand("AS", "6S", "5S", "8H", "4H", "7D", "6D", "3D", "QC", "JC", "TC", "8C");
  const contract = { level: 4, strain: "S" };
  const trickHistory = [{
    number: 1,
    winner: "South",
    cards: [
      { seat: "West", card: card("QH") },
      { seat: "North", card: card("2H") },
      { seat: "East", card: card("3H") },
      { seat: "South", card: card("AH") }
    ]
  }];
  const playPlan = rules.createPlayPlan({
    declarerHand,
    dummyHand,
    contract,
    declarer: "South",
    dummy: "North",
    trickHistory
  });

  const result = rules.chooseCardPlay({
    hand: declarerHand,
    partnerHand: dummyHand,
    currentTrick: [],
    trickHistory,
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract,
    trump: "S",
    playPlan
  });

  assert.equal(result.card.id, "KC");
  assert.equal(result.ruleId, "playPlan.developSideSuitBeforeTrumpEntry");
  assert.equal(result.planPriority.kind, "developSideSuitBeforeTrumpEntry");
  assert.equal(result.action, "forceWorkSuitStopperBeforeTrumpEntry");
});

test("chooseCardPlay discards the planned loser while partner's side winner is cashing", () => {
  const result = rules.chooseCardPlay({
    hand: hand("QC", "2D", "AS"),
    partnerHand: hand("AH", "KH"),
    currentTrick: [
      { seat: "North", card: card("AH") },
      { seat: "East", card: card("4H") }
    ],
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract: { level: 4, strain: "S" },
    trump: "S",
    playPlan: {
      priorities: [{
        kind: "discardLoserOnWinner",
        confidence: "basic",
        suit: "H",
        attackedSuit: "C",
        discardSeat: "South",
        firstSeat: "North",
        cashRanks: ["A", "K"],
        timing: "urgentBeforeTrumps"
      }]
    }
  });

  assert.equal(result.card.id, "QC");
  assert.equal(result.ruleId, "playPlan.discardLoserOnWinner");
  assert.equal(result.planPriority.kind, "discardLoserOnWinner");
  assert.equal(result.action, "discardLoserOnWinner");
});

test("chooseCardPlay discards low when partner is already winning instead of overruffing with the long trump hand", () => {
  const result = rules.chooseCardPlay({
    hand: hand("AH", "KH", "QH", "2D"),
    partnerHand: hand("TH", "9H", "3C"),
    currentTrick: [
      { seat: "West", card: card("5C") },
      { seat: "North", card: card("9H") }
    ],
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract: { level: 4, strain: "H" },
    trump: "H"
  });

  assert.equal(result.card.id, "2D");
  assert.equal(result.ruleId, "partnerWinningLow");
});

test("chooseCardPlay ruffs cheaply instead of avoiding the long-hand ruff when the trick would be lost", () => {
  const result = rules.chooseCardPlay({
    hand: hand("AS", "KS", "4S", "6H", "5H", "4H"),
    partnerHand: hand("JS", "8S", "TH", "8C"),
    currentTrick: [
      { seat: "West", card: card("6D") },
      { seat: "North", card: card("7D") }
    ],
    seat: "East",
    declarer: "West",
    dummy: "East",
    contract: { level: 5, strain: "H" },
    trump: "H",
    playPlan: {
      priorities: [{
        kind: "cashWinners",
        confidence: "basic",
        suit: "S",
        winnerCount: 2,
        cashableWinners: 2,
        cashRanks: ["A", "K"],
        timing: "afterTrumps"
      }]
    }
  });

  assert.equal(result.card.id, "4H");
  assert.equal(result.ruleId, "cheapestWinner");
});

test("chooseCardPlay wins the current trick before cashing a planned side winner", () => {
  const result = rules.chooseCardPlay({
    hand: hand("AS", "5H"),
    partnerHand: hand("JS", "TH"),
    currentTrick: [
      { seat: "West", card: card("5D") },
      { seat: "North", card: card("8D") }
    ],
    seat: "East",
    declarer: "West",
    dummy: "East",
    contract: { level: 5, strain: "H" },
    trump: "H",
    playPlan: {
      priorities: [{
        kind: "cashWinners",
        confidence: "basic",
        suit: "S",
        winnerCount: 1,
        cashableWinners: 1,
        cashRanks: ["A"],
        timing: "afterTrumps"
      }]
    }
  });

  assert.equal(result.card.id, "5H");
  assert.equal(result.ruleId, "cheapestWinner");
});

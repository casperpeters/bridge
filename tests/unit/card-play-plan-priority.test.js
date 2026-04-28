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

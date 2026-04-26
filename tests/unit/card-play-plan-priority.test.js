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
  const declarerHand = hand("AS", "KS", "QS", "2S", "JH", "TH", "8H", "3H", "AD", "KD", "AC", "KC");
  const dummyHand = hand("JS", "TS", "9S", "8S", "7S", "2D", "3D", "4D", "QC", "JC", "TC", "9C");
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

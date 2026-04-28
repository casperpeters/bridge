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

test("dealHands creates four complete hands with 52 unique cards", () => {
  const hands = rules.dealHands(() => 0.42);
  const allCards = Object.values(hands).flat();

  assert.deepEqual(Object.keys(hands), rules.seats);
  for (const seat of rules.seats) assert.equal(hands[seat].length, 13);
  assert.equal(allCards.length, 52);
  assert.equal(new Set(allCards.map((item) => item.id)).size, 52);
});

test("dealHands is replayable with a seeded random generator", () => {
  const first = rules.dealHands(rules.randomFromSeed("learning-hand-1"));
  const second = rules.dealHands(rules.randomFromSeed("learning-hand-1"));
  const third = rules.dealHands(rules.randomFromSeed("learning-hand-2"));

  const signature = (hands) => rules.seats.map((seat) => hands[seat].map((item) => item.id).join(",")).join("|");

  assert.equal(signature(first), signature(second));
  assert.notEqual(signature(first), signature(third));
});

test("compareCards sorts hands as spades, hearts, clubs, diamonds", () => {
  const sorted = [card("2D"), card("AS"), card("3C"), card("KH"), card("AC"), card("AD")]
    .sort(rules.compareCards)
    .map((item) => item.id);

  assert.deepEqual(sorted, ["AS", "KH", "AC", "3C", "AD", "2D"]);
});

test("dealer and vulnerability follow the duplicate 16-board cycle", () => {
  const expectedDealers = [
    "North", "East", "South", "West",
    "North", "East", "South", "West",
    "North", "East", "South", "West",
    "North", "East", "South", "West"
  ];
  const expectedVulnerabilities = [
    "none", "NS", "EW", "both",
    "NS", "EW", "both", "none",
    "EW", "both", "none", "NS",
    "both", "none", "NS", "EW"
  ];

  for (let board = 1; board <= 16; board++) {
    assert.equal(rules.seats[rules.dealerIndexForDeal(board)], expectedDealers[board - 1]);
    assert.equal(rules.vulnerabilityForDeal(board), expectedVulnerabilities[board - 1]);
  }
});

test("fitPoints values extra trump length only after a fit", () => {
  assert.equal(rules.fitPoints(hand(
    "2S", "3S", "4S", "5S",
    "2H", "3H", "4H",
    "2D", "3D", "4D",
    "2C", "3C", "4C"
  ), "S", 5), 1);

  assert.equal(rules.fitPoints(hand(
    "2S", "3S", "4S", "5S", "6S",
    "2H", "3H", "4H",
    "2D", "3D", "4D",
    "2C", "3C"
  ), "S", 5), 2);

  assert.equal(rules.fitPoints(hand(
    "2S", "3S", "4S", "5S", "6S",
    "2H",
    "2D", "3D", "4D",
    "2C", "3C", "4C", "5C"
  ), "S", 5), 4);
});

test("fitPoints applies Berry short-suit honor corrections", () => {
  assert.equal(rules.fitPoints(hand(
    "2S", "3S", "4S",
    "2H", "3H", "4H", "5H",
    "2D", "3D",
    "2C", "3C", "4C", "5C"
  ), "S", 5), 1);

  assert.equal(rules.fitPoints(hand(
    "2S", "3S", "4S",
    "2H", "3H", "4H", "5H",
    "QD", "2D",
    "2C", "3C", "4C", "5C"
  ), "S", 5), 2);

  assert.equal(rules.fitPoints(hand(
    "2S", "3S", "4S",
    "2H", "3H", "4H", "5H",
    "QD", "JD",
    "2C", "3C", "4C", "5C"
  ), "S", 5), 3);

  assert.equal(rules.fitPoints(hand(
    "2S", "3S", "4S",
    "2H", "3H", "4H", "5H", "6H",
    "JD",
    "2C", "3C", "4C", "5C"
  ), "S", 5), 2);

  assert.equal(rules.fitPoints(hand(
    "2S", "3S", "4S",
    "2H", "3H", "4H", "5H", "6H",
    "QD",
    "2C", "3C", "4C", "5C"
  ), "S", 5), 2);
});

test("fitPoints counts renounces and ignores shortness in trump", () => {
  assert.equal(rules.fitPoints(hand(
    "2S", "3S", "4S",
    "2H", "3H", "4H", "5H", "6H",
    "2C", "3C", "4C", "5C", "6C"
  ), "S", 5), 3);

  assert.equal(rules.fitPoints(hand(
    "2S",
    "2H", "3H", "4H", "5H",
    "2D", "3D", "4D", "5D",
    "2C", "3C", "4C", "5C"
  ), "S", 7), 0);
});

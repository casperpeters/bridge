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

test("legalCards enforces following suit when possible", () => {
  const hand = [card("AH"), card("2H"), card("AS")];
  const currentTrick = [{ seat: "North", card: card("7H") }];

  assert.deepEqual(rules.legalCards(hand, currentTrick).map((item) => item.id), ["AH", "2H"]);
  assert.deepEqual(rules.legalCards(hand, []).map((item) => item.id), ["AH", "2H", "AS"]);
});

test("currentWinningPlay handles lead suit and trump", () => {
  const trick = [
    { seat: "North", card: card("AH") },
    { seat: "East", card: card("2S") },
    { seat: "South", card: card("KH") }
  ];

  assert.equal(rules.currentWinningPlay(trick, null).seat, "North");
  assert.equal(rules.currentWinningPlay(trick, "S").seat, "East");
});

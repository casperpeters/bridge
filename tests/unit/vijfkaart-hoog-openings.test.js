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

test("Vijfkaart Hoog bid result keeps the chosen bid and opening rule together", () => {
  const options = {
    hand: hand(
      "AS", "KS", "QS", "JS", "2S",
      "AH", "2H", "3H",
      "JD", "2D", "3D",
      "2C", "3C"
    ),
    auction: [],
    seat: "South",
    vulnerability: "none"
  };
  const result = rules.chooseFiveCardHighBidResult(options);

  assert.deepEqual(result.bid, bid(1, "NT"));
  assert.deepEqual(rules.chooseFiveCardHighBid(options), result.bid);
  assert.equal(result.ruleId, "fiveCardHigh.opening.oneNotrump");
  assert.equal(result.system, rules.biddingSystems.fiveCardHigh.id);
  assert.equal(result.hcp, 15);
});

test("Vijfkaart Hoog opens 1C on 4432 with only a doubleton club and no 1NT range", () => {
  assert.deepEqual(chooseFiveCardHigh([
    "AS", "KS", "2S", "3S",
    "QH", "JH", "2H", "3H",
    "KD", "2D", "3D",
    "2C", "3C"
  ]), bid(1, "C"));
});

test("Vijfkaart Hoog opens 1D with four diamonds and no five-card major", () => {
  assert.deepEqual(chooseFiveCardHigh([
    "AS", "KS",
    "QH", "JH", "2H", "3H",
    "KD", "2D", "3D", "4D",
    "2C", "3C", "4C"
  ]), bid(1, "D"));
});

test("Vijfkaart Hoog opens the longest major, not always spades first", () => {
  assert.deepEqual(chooseFiveCardHigh([
    "AS", "2S", "3S", "4S", "5S",
    "AH", "KH", "QH", "2H", "3H", "4H",
    "2C", "3C"
  ]), bid(1, "H"));
});

test("Vijfkaart Hoog opens a longer minor before a five-card major", () => {
  assert.deepEqual(chooseFiveCardHigh([
    "AS", "KS", "QS", "2S", "3S",
    "2H", "3H",
    "AC", "2C", "3C", "4C", "5C", "6C"
  ]), bid(1, "C"));
});

test("Vijfkaart Hoog opens 1NT on 15 HCP with a balanced 5332 five-card major", () => {
  assert.deepEqual(chooseFiveCardHigh([
    "AS", "KS", "QS", "JS", "2S",
    "AH", "2H", "3H",
    "JD", "2D", "3D",
    "2C", "3C"
  ]), bid(1, "NT"));
});

test("Vijfkaart Hoog opens weak twos with 6-10 HCP and a six-card suit", () => {
  assert.deepEqual(chooseFiveCardHigh([
    "2S", "3S", "4S",
    "2H", "3H",
    "KD", "QD", "JD", "2D", "3D", "4D",
    "2C", "3C"
  ]), bid(2, "D"));
});

test("Vijfkaart Hoog bid results expose detailed opening explanation data", () => {
  const oneNotrump = chooseFiveCardHighResult([
    "AS", "KS", "QS", "JS", "2S",
    "AH", "2H", "3H",
    "JD", "2D", "3D",
    "2C", "3C"
  ]);
  assert.equal(oneNotrump.ruleId, "fiveCardHigh.opening.oneNotrump");
  assert.equal(oneNotrump.hcp, 15);
  assert.equal(oneNotrump.balanced, true);

  const twoNotrump = chooseFiveCardHighResult([
    "AS", "KS", "QS", "JS",
    "AH", "KH", "QH",
    "JD", "2D", "3D",
    "QC", "2C", "3C"
  ]);
  assert.equal(twoNotrump.ruleId, "fiveCardHigh.opening.twoNotrump");
  assert.equal(twoNotrump.hcp, 22);
  assert.equal(twoNotrump.balanced, true);

  const strongTwoClubs = chooseFiveCardHighResult([
    "AS", "KS", "QS", "JS", "TS", "9S",
    "AH", "KH",
    "AD", "2D",
    "AC", "2C", "3C"
  ]);
  assert.equal(strongTwoClubs.ruleId, "fiveCardHigh.opening.strongTwoClubs");
  assert.equal(strongTwoClubs.points >= 20, true);

  const weakTwo = chooseFiveCardHighResult([
    "2S", "3S", "4S",
    "2H", "3H",
    "KD", "QD", "JD", "2D", "3D", "4D",
    "2C", "3C"
  ]);
  assert.equal(weakTwo.ruleId, "fiveCardHigh.opening.weakTwo");
  assert.equal(weakTwo.length, 6);
  assert.equal(weakTwo.counts.D, 6);

  const preempt = chooseFiveCardHighResult([
    "AS", "QS", "JS", "2S", "3S", "4S", "5S",
    "2H", "3H",
    "2D", "3D",
    "2C", "3C"
  ]);
  assert.equal(preempt.ruleId, "fiveCardHigh.opening.preempt");
  assert.equal(preempt.length, 7);

  const oneMajor = chooseFiveCardHighResult([
    "AS", "KS", "QS", "2S", "3S",
    "QH", "2H", "3H",
    "KD", "2D", "3D",
    "2C", "3C"
  ]);
  assert.equal(oneMajor.ruleId, "fiveCardHigh.opening.oneMajor");
  assert.equal(oneMajor.counts.S, 5);

  const oneMinor = chooseFiveCardHighResult([
    "AS", "KS",
    "QH", "JH", "2H", "3H",
    "KD", "2D", "3D", "4D",
    "2C", "3C", "4C"
  ]);
  assert.equal(oneMinor.ruleId, "fiveCardHigh.opening.oneMinor");
  assert.equal(oneMinor.counts.D, 4);

  const openingPass = chooseFiveCardHighResult([
    "2S", "3S", "4S",
    "2H", "3H", "4H",
    "2D", "3D", "4D",
    "2C", "3C", "4C", "5C"
  ]);
  assert.equal(openingPass.ruleId, "fiveCardHigh.pass.openingNoAction");
});

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

test("Vijfkaart Hoog opens the highest suit with two five-card suits", () => {
  assert.deepEqual(chooseFiveCardHigh([
    "AS", "KS", "2S", "3S", "4S",
    "2H", "3H",
    "AD", "QD", "2D", "3D", "4D",
    "2C"
  ]), bid(1, "S"));

  assert.deepEqual(chooseFiveCardHigh([
    "2S", "3S",
    "AH", "KH", "2H", "3H", "4H",
    "AD", "QD", "2D", "3D", "4D",
    "2C"
  ]), bid(1, "H"));

  assert.deepEqual(chooseFiveCardHigh([
    "AS", "2S",
    "2H",
    "KD", "QD", "2D", "3D", "4D",
    "QC", "JC", "2C", "3C", "4C"
  ]), bid(1, "D"));
});

test("Vijfkaart Hoog opens a longer minor before a five-card major", () => {
  assert.deepEqual(chooseFiveCardHigh([
    "AS", "KS", "QS", "2S", "3S",
    "2H", "3H",
    "AC", "2C", "3C", "4C", "5C", "6C"
  ]), bid(1, "C"));
});

test("Vijfkaart Hoog opens the lowest suit with multiple four-card suits", () => {
  assert.deepEqual(chooseFiveCardHigh([
    "AS", "QS", "2S", "3S",
    "KH", "2H", "3H", "4H",
    "KD", "QD", "2D", "3D",
    "2C"
  ]), bid(1, "D"));

  assert.deepEqual(chooseFiveCardHigh([
    "AS", "QS", "2S",
    "KH", "2H", "3H",
    "KD", "2D", "3D", "4D",
    "QC", "JC", "2C", "3C"
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

test("Vijfkaart Hoog opens an ugly eleven-count as a weak two", () => {
  const uglyEleven = chooseFiveCardHighResult([
    "KS", "JS", "9S", "8S", "7S", "6S",
    "AH", "QH",
    "7D", "5D", "2D",
    "JC", "4C"
  ]);

  assert.deepEqual(uglyEleven.bid, bid(2, "S"));
  assert.equal(uglyEleven.ruleId, "fiveCardHigh.opening.weakTwo");
  assert.equal(uglyEleven.hcp, 11);
  assert.equal(uglyEleven.length, 6);
  assert.equal(uglyEleven.ruleOf20Eligible, false);

  const prettyEleven = chooseFiveCardHighResult([
    "AS", "KS", "QS", "9S", "8S", "7S",
    "QH", "7H", "6H", "5H",
    "2D",
    "3C", "2C"
  ]);

  assert.deepEqual(prettyEleven.bid, bid(1, "S"));
  assert.equal(prettyEleven.ruleId, "fiveCardHigh.opening.ruleOf20OneMajor");
  assert.equal(prettyEleven.hcp, 11);
  assert.equal(prettyEleven.ruleOf20Eligible, true);
});

test("Vijfkaart Hoog handles Start met Bridge weak two examples", () => {
  const goodSpadeSuit = chooseFiveCardHighResult([
    "AS", "QS", "JS", "5S", "4S", "2S",
    "7H", "4H",
    "5D", "2D",
    "QC", "TC", "6C"
  ]);

  assert.deepEqual(goodSpadeSuit.bid, bid(2, "S"));
  assert.equal(goodSpadeSuit.ruleId, "fiveCardHigh.opening.weakTwo");
  assert.equal(goodSpadeSuit.hcp, 9);
  assert.equal(goodSpadeSuit.length, 6);

  const goodDiamondSuit = chooseFiveCardHighResult([
    "9S", "4S", "2S",
    "AH", "8H", "6H",
    "KD", "JD", "TD", "9D", "5D", "4D",
    "7C"
  ]);

  assert.deepEqual(goodDiamondSuit.bid, bid(2, "D"));
  assert.equal(goodDiamondSuit.ruleId, "fiveCardHigh.opening.weakTwo");
  assert.equal(goodDiamondSuit.hcp, 8);
  assert.equal(goodDiamondSuit.length, 6);

  const poorSpadeSuit = chooseFiveCardHighResult([
    "KS", "8S", "7S", "5S", "4S", "3S",
    "QH", "7H",
    "JD", "TD", "6D",
    "QC", "7C"
  ]);

  assert.deepEqual(poorSpadeSuit.bid, pass());
  assert.equal(poorSpadeSuit.ruleId, "fiveCardHigh.pass.openingNoAction");
  assert.equal(poorSpadeSuit.hcp, 8);
  assert.equal(poorSpadeSuit.counts.S, 6);
});

test("Vijfkaart Hoog opens by the Rule of 20 with fewer than 12 HCP", () => {
  const oneMajor = chooseFiveCardHighResult([
    "AS", "KS", "QS", "2S", "3S",
    "QH", "2H", "3H", "4H",
    "2D", "3D",
    "2C", "3C"
  ]);

  assert.deepEqual(oneMajor.bid, bid(1, "S"));
  assert.equal(oneMajor.ruleId, "fiveCardHigh.opening.ruleOf20OneMajor");
  assert.equal(oneMajor.hcp, 11);
  assert.equal(oneMajor.ruleOf20Score, 20);
  assert.equal(oneMajor.ruleOf20LongSuitHcp, 11);
  assert.deepEqual(oneMajor.ruleOf20LongSuits, ["S", "H"]);

  const oneMinor = chooseFiveCardHighResult([
    "2S", "3S",
    "2H", "3H",
    "QD", "2D", "3D", "4D",
    "AC", "KC", "QC", "2C", "3C"
  ]);

  assert.deepEqual(oneMinor.bid, bid(1, "C"));
  assert.equal(oneMinor.ruleId, "fiveCardHigh.opening.ruleOf20OneMinor");
  assert.equal(oneMinor.ruleOf20Score, 20);
});

test("Vijfkaart Hoog does not use the Rule of 20 when values are outside the long suits", () => {
  const result = chooseFiveCardHighResult([
    "AS", "2S", "3S", "4S", "5S",
    "2H", "3H", "4H", "5H",
    "KD", "QD", "2D",
    "QC"
  ]);

  assert.deepEqual(result.bid, pass());
  assert.equal(result.ruleId, "fiveCardHigh.pass.openingNoAction");
  assert.equal(result.hcp, 11);
  assert.equal(result.ruleOf20Score, 20);
  assert.equal(result.ruleOf20LongSuitHcp, 4);
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

  const strongTwoClubsPlayingTricks = chooseFiveCardHighResult([
    "AS", "KS", "QS", "JS", "TS", "9S", "8S",
    "AH", "2H",
    "2D", "3D",
    "2C", "3C"
  ]);
  assert.equal(strongTwoClubsPlayingTricks.ruleId, "fiveCardHigh.opening.strongTwoClubs");
  assert.equal(strongTwoClubsPlayingTricks.hcp < 20, true);
  assert.equal(strongTwoClubsPlayingTricks.points < 20, true);
  assert.equal(strongTwoClubsPlayingTricks.playingTricksEligible, true);
  assert.equal(strongTwoClubsPlayingTricks.playingTricks, 8);
  assert.equal(strongTwoClubsPlayingTricks.longSuit, "S");
  assert.equal(strongTwoClubsPlayingTricks.longSuitLength, 7);

  const notEnoughPlayingTricks = chooseFiveCardHighResult([
    "AS", "KS", "QS", "JS", "TS", "9S", "8S",
    "2H", "3H",
    "2D", "3D",
    "2C", "3C"
  ]);
  assert.equal(notEnoughPlayingTricks.ruleId, "fiveCardHigh.opening.preempt");
  assert.equal(notEnoughPlayingTricks.playingTricksEligible, false);
  assert.equal(notEnoughPlayingTricks.playingTricks, 7);

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

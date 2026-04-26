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

test("Vijfkaart Hoog bid result identifies artificial transfer choices", () => {
  const auction = [
    { seat: "North", bid: bid(1, "NT") },
    { seat: "East", bid: pass() }
  ];
  const result = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "2S", "3S", "4S",
      "AH", "KH", "QH", "2H", "3H",
      "2D", "3D",
      "2C", "3C", "4C"
    ),
    auction,
    seat: "South",
    vulnerability: "none"
  });

  assert.deepEqual(result.bid, bid(2, "D"));
  assert.equal(result.ruleId, "fiveCardHigh.response.transferToH");
  assert.equal(result.counts.H, 5);
});

test("Vijfkaart Hoog responds to 1C with the lowest of equal four-card suits", () => {
  const auction = [
    { seat: "North", bid: bid(1, "C") },
    { seat: "East", bid: pass() }
  ];

  assert.deepEqual(chooseFiveCardHigh([
    "2S", "3S", "4S",
    "QH", "JH", "2H", "3H",
    "KD", "2D", "3D", "4D",
    "2C", "3C"
  ], auction), bid(1, "D"));
});

test("Vijfkaart Hoog does not raise a 1C opening with only four clubs", () => {
  const auction = [
    { seat: "North", bid: bid(1, "C") },
    { seat: "East", bid: pass() }
  ];

  assert.deepEqual(chooseFiveCardHigh([
    "2S", "3S", "4S",
    "2H", "3H", "4H",
    "QD", "2D", "3D",
    "AC", "2C", "3C", "4C"
  ], auction), bid(1, "NT"));
});

test("Vijfkaart Hoog responds 4C to 1C with strong unbalanced club support and no new one-level suit", () => {
  const auction = [
    { seat: "North", bid: bid(1, "C") },
    { seat: "East", bid: pass() }
  ];

  assert.deepEqual(chooseFiveCardHigh([
    "AS", "2S", "3S",
    "2H", "3H",
    "2D", "3D",
    "AC", "KC", "QC", "2C", "3C", "4C"
  ], auction), bid(4, "C"));
});

test("Vijfkaart Hoog responds 4D to 1D with strong unbalanced diamond support and no new one-level suit", () => {
  const auction = [
    { seat: "North", bid: bid(1, "D") },
    { seat: "East", bid: pass() }
  ];

  assert.deepEqual(chooseFiveCardHigh([
    "AS", "2S",
    "2H", "3H",
    "AD", "KD", "QD", "2D", "3D", "4D",
    "2C", "3C", "4C"
  ], auction), bid(4, "D"));
});

test("Vijfkaart Hoog raises a five-card major with three-card support", () => {
  const auction = [
    { seat: "North", bid: bid(1, "H") },
    { seat: "East", bid: pass() }
  ];

  assert.deepEqual(chooseFiveCardHigh([
    "2S", "3S", "4S",
    "AH", "2H", "3H",
    "QD", "2D", "3D", "4D",
    "2C", "3C", "4C"
  ], auction), bid(2, "H"));
});

test("Vijfkaart Hoog responds to a one-major opening with a new suit from four cards", () => {
  const oneHeart = [
    { seat: "North", bid: bid(1, "H") },
    { seat: "East", bid: pass() }
  ];
  const oneSpade = [
    { seat: "North", bid: bid(1, "S") },
    { seat: "East", bid: pass() }
  ];

  assert.deepEqual(chooseFiveCardHigh([
    "KS", "QS", "3S", "2S",
    "2H", "3H",
    "QD", "2D", "3D",
    "2C", "3C", "4C", "5C"
  ], oneHeart), bid(1, "S"));

  assert.deepEqual(chooseFiveCardHigh([
    "2S", "3S", "4S",
    "2H", "3H",
    "QD", "JD", "2D", "3D",
    "AC", "KC", "2C", "3C"
  ], oneHeart), bid(2, "C"));

  assert.deepEqual(chooseFiveCardHigh([
    "2S", "3S",
    "QH", "JH", "3H", "2H",
    "AD", "KD", "2D", "3D",
    "2C", "3C", "4C"
  ], oneSpade), bid(2, "D"));

  assert.deepEqual(chooseFiveCardHigh([
    "2S", "3S",
    "KH", "QH", "JH", "2H",
    "3H",
    "QD", "2D", "3D",
    "QC", "2C", "3C"
  ], oneSpade), bid(2, "H"));
});

test("Vijfkaart Hoog follows the cheat-sheet priority after a one-major opening", () => {
  const oneHeart = [
    { seat: "North", bid: bid(1, "H") },
    { seat: "East", bid: pass() }
  ];
  const oneSpade = [
    { seat: "North", bid: bid(1, "S") },
    { seat: "East", bid: pass() }
  ];

  assert.deepEqual(chooseFiveCardHigh([
    "2S", "3S", "4S", "5S",
    "AH", "2H", "3H",
    "QD", "2D", "3D",
    "2C", "3C", "4C"
  ], oneHeart), bid(2, "H"));

  assert.deepEqual(chooseFiveCardHigh([
    "2S", "3S",
    "KH", "QH", "2H", "3H",
    "JD", "2D", "3D",
    "2C", "3C", "4C", "5C"
  ], oneSpade), bid(1, "NT"));
});

test("Vijfkaart Hoog bid results expose detailed response and competitive explanation data", () => {
  const oneNotrumpAuction = [
    { seat: "North", bid: bid(1, "NT") },
    { seat: "East", bid: pass() }
  ];
  const stayman = chooseFiveCardHighResult([
    "AS", "KS", "QS", "2S",
    "2H", "3H", "4H",
    "2D", "3D", "4D",
    "2C", "3C", "4C"
  ], oneNotrumpAuction);
  assert.equal(stayman.ruleId, "fiveCardHigh.response.stayman");

  const transfer = chooseFiveCardHighResult([
    "2S", "3S", "4S",
    "AH", "KH", "QH", "2H", "3H",
    "2D", "3D",
    "2C", "3C", "4C"
  ], oneNotrumpAuction);
  assert.equal(transfer.ruleId, "fiveCardHigh.response.transferToH");
  assert.equal(transfer.counts.H, 5);

  const raise = chooseFiveCardHighResult([
    "2S", "3S", "4S",
    "AH", "2H", "3H",
    "QD", "2D", "3D", "4D",
    "2C", "3C", "4C"
  ], [
    { seat: "North", bid: bid(1, "H") },
    { seat: "East", bid: pass() }
  ]);
  assert.equal(raise.ruleId, "fiveCardHigh.response.raise");
  assert.equal(raise.support, 3);

  const notrumpResponse = chooseFiveCardHighResult([
    "2S", "3S", "4S",
    "2H", "3H", "4H",
    "QD", "2D", "3D",
    "AC", "2C", "3C", "4C"
  ], [
    { seat: "North", bid: bid(1, "C") },
    { seat: "East", bid: pass() }
  ]);
  assert.equal(notrumpResponse.ruleId, "fiveCardHigh.response.notrump");

  const openerRebid = chooseFiveCardHighResult([
    "AS", "KS", "QS", "2S", "3S",
    "AH", "KH",
    "QD", "2D", "3D",
    "2C", "3C", "4C"
  ], [
    { seat: "South", bid: bid(1, "S") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(2, "S") },
    { seat: "East", bid: pass() }
  ]);
  assert.equal(openerRebid.ruleId, "fiveCardHigh.continuation.openerMajorRaiseGame");

  const overcall = chooseFiveCardHighResult([
    "AS", "QS", "JS", "2S", "3S",
    "KH", "2H", "3H",
    "2D", "3D",
    "2C", "3C", "4C"
  ], [
    { seat: "East", bid: bid(1, "D") }
  ]);
  assert.equal(overcall.ruleId, "fiveCardHigh.competitive.simpleOvercall");

  const takeout = chooseFiveCardHighResult([
    "AS", "QS", "JS", "2S",
    "KH", "QH", "2H", "3H",
    "2D",
    "AC", "2C", "3C", "4C"
  ], [
    { seat: "East", bid: bid(1, "D") }
  ]);
  assert.equal(takeout.ruleId, "fiveCardHigh.competitive.takeoutDouble");
});

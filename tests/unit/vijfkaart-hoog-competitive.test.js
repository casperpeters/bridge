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

test("Vijfkaart Hoog overcalls naturally at the one-level with a good five-card suit and 8-16 HCP", () => {
  const auction = [
    { seat: "East", bid: bid(1, "D") }
  ];

  assert.deepEqual(chooseFiveCardHigh([
    "AS", "QS", "JS", "2S", "3S",
    "KH", "2H", "3H",
    "2D", "3D",
    "2C", "3C", "4C"
  ], auction), bid(1, "S"));
});

test("Vijfkaart Hoog requires 10+ HCP for a simple two-level overcall", () => {
  const auction = [
    { seat: "East", bid: bid(1, "S") }
  ];

  assert.deepEqual(chooseFiveCardHigh([
    "2S", "3S",
    "AH", "KH", "JH", "2H", "3H",
    "2D", "3D", "4D",
    "JC", "2C", "3C"
  ], auction), pass());

  assert.deepEqual(chooseFiveCardHigh([
    "2S", "3S",
    "AH", "KH", "JH", "2H", "3H",
    "2D", "3D", "4D",
    "QC", "2C", "3C"
  ], auction), bid(2, "H"));

  const result = chooseFiveCardHighResult([
      "2S", "3S",
      "AH", "KH", "JH", "2H", "3H",
      "2D", "3D", "4D",
      "QC", "2C", "3C"
    ], auction);
  assert.equal(result.minimumHcp, 10);
  assert.match(result.reason, /10\+ HCP/);
});

test("Vijfkaart Hoog raises partner's overcall with fit using vulnerability-aware HCP", () => {
  const auction = [
    { seat: "East", bid: bid(1, "D") },
    { seat: "South", bid: bid(1, "S") },
    { seat: "West", bid: pass() }
  ];
  const sevenHcpFit = hand(
    "QS", "JS", "2S",
    "QH", "2H", "3H",
    "QD", "2D", "3D",
    "2C", "3C", "4C", "5C"
  );

  const nonVulnerable = rules.chooseFiveCardHighBidResult({
    hand: sevenHcpFit,
    auction,
    seat: "North",
    vulnerability: "none"
  });
  assert.deepEqual(nonVulnerable.bid, bid(2, "S"));
  assert.equal(nonVulnerable.ruleId, "fiveCardHigh.competitive.raisePartnerOvercall");
  assert.equal(nonVulnerable.minimumHcp, 7);
  assert.equal(nonVulnerable.vulnerable, false);

  const vulnerable = rules.chooseFiveCardHighBidResult({
    hand: sevenHcpFit,
    auction,
    seat: "North",
    vulnerability: "NS"
  });
  assert.deepEqual(vulnerable.bid, pass());
});

test("Vijfkaart Hoog raises partner's overcall from 8 HCP when vulnerable", () => {
  const auction = [
    { seat: "East", bid: bid(1, "D") },
    { seat: "South", bid: bid(1, "S") },
    { seat: "West", bid: pass() }
  ];

  const result = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "QS", "JS", "2S",
      "QH", "2H", "3H",
      "QD", "JD", "3D",
      "2C", "3C", "4C", "5C"
    ),
    auction,
    seat: "North",
    vulnerability: "NS"
  });
  assert.deepEqual(result.bid, bid(2, "S"));
  assert.equal(result.ruleId, "fiveCardHigh.competitive.raisePartnerOvercall");
  assert.equal(result.minimumHcp, 8);
  assert.equal(result.vulnerable, true);
  assert.match(result.reason, /8\+ HCP/);
});

test("Vijfkaart Hoog bids 3NT after partner's two-level overcall with a stopper and game values", () => {
  const auction = [
    { seat: "West", bid: bid(1, "H") },
    { seat: "North", bid: bid(2, "C") },
    { seat: "East", bid: pass() }
  ];

  const result = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "AS", "9S", "4S", "3S",
      "KH", "QH", "TH",
      "KD", "TD", "7D", "3D",
      "KC", "8C"
    ),
    auction,
    seat: "South",
    vulnerability: "none"
  });
  assert.deepEqual(result.bid, bid(3, "NT"));
  assert.equal(result.ruleId, "fiveCardHigh.competitive.notrumpAfterPartnerOvercall");
  assert.equal(result.minimumHcp, 13);
  assert.equal(result.stopperSuit, "H");
});

test("Vijfkaart Hoog bids a new five-card suit after partner's two-level overcall with game interest", () => {
  const auction = [
    { seat: "West", bid: bid(1, "H") },
    { seat: "North", bid: bid(2, "C") },
    { seat: "East", bid: pass() }
  ];

  const result = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "AS", "QS", "JS", "9S", "3S",
      "5H", "2H",
      "KD", "QD", "7D", "3D",
      "JC", "8C"
    ),
    auction,
    seat: "South",
    vulnerability: "none"
  });
  assert.deepEqual(result.bid, bid(2, "S"));
  assert.equal(result.ruleId, "fiveCardHigh.competitive.newSuitAfterPartnerOvercall");
  assert.equal(result.minimumHcp, 13);
  assert.equal(result.length, 5);
});

test("Vijfkaart Hoog does not bid a new four-card suit after partner's two-level overcall", () => {
  const auction = [
    { seat: "West", bid: bid(1, "H") },
    { seat: "North", bid: bid(2, "C") },
    { seat: "East", bid: pass() }
  ];

  const result = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "AS", "QS", "JS", "3S",
      "5H", "2H",
      "KD", "QD", "7D", "3D",
      "JC", "8C", "2C"
    ),
    auction,
    seat: "South",
    vulnerability: "none"
  });
  assert.deepEqual(result.bid, pass());
});

test("Vijfkaart Hoog raises partner's two-level overcall without forcing game on 12-13 HCP", () => {
  const auction = [
    { seat: "West", bid: bid(1, "H") },
    { seat: "North", bid: bid(2, "C") },
    { seat: "East", bid: pass() }
  ];

  const result = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "KS", "QS", "3S",
      "6H", "4H", "2H",
      "QD", "5D",
      "AC", "QC", "8C", "7C", "2C"
    ),
    auction,
    seat: "South",
    vulnerability: "none"
  });
  assert.deepEqual(result.bid, bid(3, "C"));
  assert.equal(result.ruleId, "fiveCardHigh.competitive.raisePartnerOvercall");
  assert.notDeepEqual(result.bid, bid(5, "C"));
});

test("Vijfkaart Hoog raises partner's two-level overcall to game with 16+ HCP and fit", () => {
  const auction = [
    { seat: "West", bid: bid(1, "H") },
    { seat: "North", bid: bid(2, "C") },
    { seat: "East", bid: pass() }
  ];

  const result = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "AS", "KS", "QS",
      "6H", "4H", "2H",
      "KD", "5D",
      "AC", "QC", "8C", "7C", "2C"
    ),
    auction,
    seat: "South",
    vulnerability: "none"
  });
  assert.deepEqual(result.bid, bid(5, "C"));
  assert.equal(result.ruleId, "fiveCardHigh.competitive.raisePartnerOvercall");
});

test("Vijfkaart Hoog jump-overcalls with a good six-card suit and 6-10 HCP", () => {
  const auction = [
    { seat: "East", bid: bid(1, "D") }
  ];

  assert.deepEqual(chooseFiveCardHigh([
    "AS", "QS", "JS", "2S", "3S", "4S",
    "2H", "3H",
    "2D", "3D",
    "2C", "3C", "4C"
  ], auction), bid(2, "S"));
});

test("Vijfkaart Hoog uses a negative double with four-card majors after interference", () => {
  const auction = [
    { seat: "North", bid: bid(1, "C") },
    { seat: "East", bid: bid(1, "D") }
  ];

  assert.deepEqual(chooseFiveCardHigh([
    "QS", "JS", "2S", "3S",
    "KH", "2H", "3H", "4H",
    "2D", "3D",
    "2C", "3C", "4C"
  ], auction), double());
});

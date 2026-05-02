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

test("Vijfkaart Hoog raises simple overcall requirements when vulnerable", () => {
  const oneLevelAuction = [
    { seat: "East", bid: bid(1, "D") }
  ];

  assert.deepEqual(rules.chooseFiveCardHighBidResult({
    hand: hand(
      "AS", "QS", "JS", "2S", "3S",
      "2H", "3H", "4H",
      "2D", "3D",
      "JC", "2C", "3C"
    ),
    auction: oneLevelAuction,
    seat: "South",
    vulnerability: "NS"
  }).bid, pass());

  const vulnerableOneLevel = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "AS", "QS", "JS", "2S", "3S",
      "KH", "2H", "3H",
      "2D", "3D",
      "2C", "3C", "4C"
    ),
    auction: oneLevelAuction,
    seat: "South",
    vulnerability: "NS"
  });
  assert.deepEqual(vulnerableOneLevel.bid, bid(1, "S"));
  assert.equal(vulnerableOneLevel.minimumHcp, 10);
  assert.equal(vulnerableOneLevel.vulnerable, true);

  const twoLevelAuction = [
    { seat: "East", bid: bid(1, "S") }
  ];

  assert.deepEqual(rules.chooseFiveCardHighBidResult({
    hand: hand(
      "2S", "3S",
      "AH", "KH", "JH", "2H", "3H",
      "2D", "3D", "4D",
      "QC", "2C", "3C"
    ),
    auction: twoLevelAuction,
    seat: "South",
    vulnerability: "NS"
  }).bid, pass());

  const vulnerableTwoLevel = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "2S", "3S",
      "AH", "KH", "JH", "2H", "3H",
      "QD", "2D",
      "QC", "2C", "3C", "4C"
    ),
    auction: twoLevelAuction,
    seat: "South",
    vulnerability: "NS"
  });
  assert.deepEqual(vulnerableTwoLevel.bid, bid(2, "H"));
  assert.equal(vulnerableTwoLevel.minimumHcp, 12);
  assert.equal(vulnerableTwoLevel.vulnerable, true);
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
  assert.match(result.reason, /8\+ fit points/);
});

test("Vijfkaart Hoog can raise partner's overcall on fit points", () => {
  const auction = [
    { seat: "East", bid: bid(1, "D") },
    { seat: "South", bid: bid(1, "S") },
    { seat: "West", bid: pass() }
  ];

  const result = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "QS", "2S", "3S",
      "KH", "2H", "3H",
      "2D",
      "2C", "3C", "4C", "5C", "6C", "7C"
    ),
    auction,
    seat: "North",
    vulnerability: "none"
  });

  assert.deepEqual(result.bid, bid(2, "S"));
  assert.equal(result.hcp, 5);
  assert.equal(result.fitPoints, 7);
  assert.equal(result.valuation, "fitPoints");
});

test("Vijfkaart Hoog uses Stayman after partner's 1NT overcall with game values and a four-card major", () => {
  const auction = [
    { seat: "South", bid: bid(1, "C") },
    { seat: "West", bid: bid(1, "NT") },
    { seat: "North", bid: pass() }
  ];

  const result = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "AS", "8S", "4S",
      "KH", "QH", "TH", "7H",
      "8D", "6D", "2D",
      "JC", "6C", "3C"
    ),
    auction,
    seat: "East",
    vulnerability: "both"
  });

  assert.deepEqual(result.bid, bid(2, "C"));
  assert.equal(result.ruleId, "fiveCardHigh.competitive.notrumpOvercallStayman");
  assert.equal(result.hcp, 10);
  assert.equal(result.counts.H, 4);
});

test("Vijfkaart Hoog bids 3NT after partner's 1NT overcall with game values and no four-card major", () => {
  const auction = [
    { seat: "South", bid: bid(1, "C") },
    { seat: "West", bid: bid(1, "NT") },
    { seat: "North", bid: pass() }
  ];

  const result = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "AS", "8S", "4S",
      "KH", "QH", "7H",
      "8D", "6D", "2D",
      "QC", "JC", "6C", "3C"
    ),
    auction,
    seat: "East",
    vulnerability: "both"
  });

  assert.deepEqual(result.bid, bid(3, "NT"));
  assert.equal(result.ruleId, "fiveCardHigh.competitive.notrumpOvercallGame");
  assert.equal(result.hcp, 12);
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

test("Vijfkaart Hoog bids 1NT after partner's one-level overcall with 10+ HCP and a stopper", () => {
  const auction = [
    { seat: "West", bid: bid(1, "D") },
    { seat: "North", bid: bid(1, "S") },
    { seat: "East", bid: pass() }
  ];

  const result = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "7S", "3S",
      "KH", "9H", "7H",
      "KD", "JD", "5D", "2D",
      "KC", "QC", "7C", "4C"
    ),
    auction,
    seat: "South",
    vulnerability: "none"
  });

  assert.deepEqual(result.bid, bid(1, "NT"));
  assert.equal(result.ruleId, "fiveCardHigh.competitive.notrumpAfterPartnerOvercall");
  assert.equal(result.minimumHcp, 10);
  assert.equal(result.stopperSuit, "D");
});

test("Vijfkaart Hoog bids 2NT after partner's two-level overcall with 12 HCP and a stopper", () => {
  const auction = [
    { seat: "West", bid: bid(1, "H") },
    { seat: "North", bid: bid(2, "C") },
    { seat: "East", bid: pass() }
  ];

  const result = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "AS", "9S", "4S",
      "KH", "QH", "TH",
      "KD", "TD", "7D", "3D",
      "8C", "6C", "2C"
    ),
    auction,
    seat: "South",
    vulnerability: "none"
  });

  assert.deepEqual(result.bid, bid(2, "NT"));
  assert.equal(result.ruleId, "fiveCardHigh.competitive.notrumpAfterPartnerOvercall");
  assert.equal(result.minimumHcp, 12);
  assert.equal(result.stopperSuit, "H");
});

test("Vijfkaart Hoog bids a new five-card suit after partner's two-level overcall with 12+ HCP", () => {
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
  assert.equal(result.minimumHcp, 12);
  assert.equal(result.length, 5);
});

test("Vijfkaart Hoog bids a good five-card suit after partner's overcall and right-hand interference", () => {
  const auction = [
    { seat: "West", bid: bid(1, "C") },
    { seat: "North", bid: bid(1, "D") },
    { seat: "East", bid: bid(1, "H") }
  ];

  const result = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "KS", "QS", "JS", "9S", "5S",
      "8H", "4H", "3H",
      "4D",
      "QC", "7C", "6C", "2C"
    ),
    auction,
    seat: "South",
    vulnerability: "none"
  });

  assert.deepEqual(result.bid, bid(1, "S"));
  assert.equal(result.ruleId, "fiveCardHigh.competitive.newSuitAfterPartnerOvercall");
  assert.equal(result.minimumHcp, 8);
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

test("Vijfkaart Hoog jump-overcalls with a good six-card suit and 6-11 HCP", () => {
  const auction = [
    { seat: "East", bid: bid(1, "D") }
  ];

  assert.deepEqual(chooseFiveCardHigh([
    "AS", "QS", "JS", "2S", "3S", "4S",
    "2H", "3H",
    "2D", "3D",
    "2C", "3C", "4C"
  ], auction), bid(2, "S"));

  const upperRange = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "AS", "QS", "JS", "2S", "3S", "4S",
      "KH", "2H",
      "2D", "3D",
      "JC", "3C", "4C"
    ),
    auction,
    seat: "South",
    vulnerability: "none"
  });
  assert.deepEqual(upperRange.bid, bid(2, "S"));
  assert.equal(upperRange.ruleId, "fiveCardHigh.competitive.jumpOvercall");
  assert.equal(upperRange.hcp, 11);
});

test("Vijfkaart Hoog jump-overcalls with the weak jump overcall lesson example", () => {
  const auction = [
    { seat: "West", bid: bid(1, "C") }
  ];

  const result = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "7S",
      "AH", "QH", "JH", "9H", "7H", "3H",
      "JD", "TD", "4D", "3D",
      "5C", "4C"
    ),
    auction,
    seat: "North",
    vulnerability: "none"
  });

  assert.deepEqual(result.bid, bid(2, "H"));
  assert.equal(result.ruleId, "fiveCardHigh.competitive.jumpOvercall");
  assert.equal(result.hcp, 8);
});

test("Vijfkaart Hoog raises partner's weak jump overcall to game with two-card support and strong values", () => {
  const auction = [
    { seat: "West", bid: bid(1, "C") },
    { seat: "North", bid: bid(2, "H") },
    { seat: "East", bid: pass() }
  ];

  const result = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "AS", "QS", "TS", "5S",
      "TH", "4H",
      "KD", "QD", "2D",
      "AC", "TC", "6C", "3C"
    ),
    auction,
    seat: "South",
    vulnerability: "none"
  });

  assert.deepEqual(result.bid, bid(4, "H"));
  assert.equal(result.ruleId, "fiveCardHigh.competitive.raisePartnerOvercall");
  assert.equal(result.support, 2);
  assert.equal(result.partnerMinTrumpLength, 6);
  assert.equal(result.gameMinimum, 15);
  assert.equal(result.vulnerable, false);
});

test("Vijfkaart Hoog invites instead of bidding game with 15 fit points after a vulnerable weak jump overcall", () => {
  const auction = [
    { seat: "West", bid: bid(1, "C") },
    { seat: "North", bid: bid(2, "H") },
    { seat: "East", bid: pass() }
  ];

  const result = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "AS", "QS", "TS", "5S",
      "TH", "4H",
      "KD", "QD", "2D",
      "AC", "TC", "6C", "3C"
    ),
    auction,
    seat: "South",
    vulnerability: "NS"
  });

  assert.deepEqual(result.bid, bid(3, "H"));
  assert.equal(result.ruleId, "fiveCardHigh.competitive.raisePartnerOvercall");
  assert.equal(result.fitPoints, 15);
  assert.equal(result.gameMinimum, 16);
  assert.equal(result.vulnerable, true);
});

test("Vijfkaart Hoog bids game with 16 fit points after a vulnerable weak jump overcall", () => {
  const auction = [
    { seat: "West", bid: bid(1, "C") },
    { seat: "North", bid: bid(2, "H") },
    { seat: "East", bid: pass() }
  ];

  const result = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "AS", "QS", "JS", "5S",
      "TH", "4H",
      "KD", "QD", "2D",
      "AC", "TC", "6C", "3C"
    ),
    auction,
    seat: "South",
    vulnerability: "NS"
  });

  assert.deepEqual(result.bid, bid(4, "H"));
  assert.equal(result.ruleId, "fiveCardHigh.competitive.raisePartnerOvercall");
  assert.equal(result.fitPoints, 16);
  assert.equal(result.gameMinimum, 16);
  assert.equal(result.vulnerable, true);
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

test("Vijfkaart Hoog makes a takeout double with 12+ HCP, shortness, and support for every unbid suit", () => {
  const auction = [
    { seat: "East", bid: bid(1, "D") }
  ];

  const result = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "KS", "QS", "4S", "2S",
      "KH", "8H", "7H", "3H",
      "5D", "2D",
      "AC", "6C", "4C"
    ),
    auction,
    seat: "South",
    vulnerability: "none"
  });

  assert.deepEqual(result.bid, double());
  assert.equal(result.ruleId, "fiveCardHigh.competitive.takeoutDouble");
  assert.equal(result.hcp, 12);
  assert.equal(result.counts.D, 2);
  assert.equal(result.counts.C, 3);
  assert.equal(result.counts.H, 4);
  assert.equal(result.counts.S, 4);
});

test("Vijfkaart Hoog prefers a takeout double over a simple suit overcall when both are available", () => {
  const auction = [
    { seat: "East", bid: bid(1, "S") }
  ];

  const result = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "8S",
      "QH", "8H", "4H", "2H",
      "AD", "7D", "5D",
      "AC", "QC", "JC", "8C", "3C"
    ),
    auction,
    seat: "South",
    vulnerability: "none"
  });

  assert.deepEqual(result.bid, double());
  assert.equal(result.ruleId, "fiveCardHigh.competitive.takeoutDouble");
  assert.equal(result.hcp, 13);
  assert.equal(result.counts.C, 5);
});

test("Vijfkaart Hoog does not make a takeout double without support for every unbid suit", () => {
  const auction = [
    { seat: "East", bid: bid(1, "D") }
  ];

  const result = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "KS", "QS", "4S", "2S",
      "KH", "8H", "7H",
      "5D", "2D",
      "AC", "QC", "6C", "4C"
    ),
    auction,
    seat: "South",
    vulnerability: "none"
  });

  assert.deepEqual(result.bid, pass());
  assert.notEqual(result.ruleId, "fiveCardHigh.competitive.takeoutDouble");
  assert.equal(result.hcp, 14);
  assert.equal(result.counts.H, 3);
});

test("Vijfkaart Hoog makes a takeout double with 16+ HCP when one unbid suit is only three cards", () => {
  const auction = [
    { seat: "East", bid: bid(1, "H") }
  ];

  const result = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "AS", "9S", "4S",
      "JH", "6H",
      "AD", "QD", "8D", "3D",
      "KC", "QC", "5C", "3C"
    ),
    auction,
    seat: "South",
    vulnerability: "none"
  });

  assert.deepEqual(result.bid, double());
  assert.equal(result.ruleId, "fiveCardHigh.competitive.takeoutDouble");
  assert.equal(result.hcp, 16);
  assert.equal(result.counts.S, 3);
});

test("Vijfkaart Hoog still needs 16 HCP for an imperfect takeout double shape", () => {
  const auction = [
    { seat: "East", bid: bid(1, "H") }
  ];

  const result = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "KS", "9S", "4S",
      "JH", "6H",
      "AD", "QD", "8D", "3D",
      "KC", "QC", "5C", "3C"
    ),
    auction,
    seat: "South",
    vulnerability: "none"
  });

  assert.deepEqual(result.bid, pass());
  assert.notEqual(result.ruleId, "fiveCardHigh.competitive.takeoutDouble");
  assert.equal(result.hcp, 15);
  assert.equal(result.counts.S, 3);
});

test("Vijfkaart Hoog answers partner's takeout double with the highest unbid suit on a weak hand", () => {
  const auction = [
    { seat: "West", bid: bid(1, "C") },
    { seat: "North", bid: double() },
    { seat: "East", bid: pass() }
  ];

  const result = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "2S", "3S",
      "2H", "3H", "4H", "5H",
      "2D", "3D", "4D", "5D", "6D",
      "7C", "8C"
    ),
    auction,
    seat: "South",
    vulnerability: "none"
  });

  assert.deepEqual(result.bid, bid(1, "H"));
  assert.equal(result.ruleId, "fiveCardHigh.competitive.takeoutDoubleForcedSuit");
  assert.equal(result.forced, true);
  assert.equal(result.length, 4);
});

test("Vijfkaart Hoog answers partner's takeout double with spades over hearts when both majors are four-card suits", () => {
  const auction = [
    { seat: "West", bid: bid(1, "D") },
    { seat: "North", bid: double() },
    { seat: "East", bid: pass() }
  ];

  const result = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "2S", "3S", "4S", "5S",
      "2H", "3H", "4H", "5H",
      "2D", "3D",
      "2C", "3C", "4C"
    ),
    auction,
    seat: "South",
    vulnerability: "none"
  });

  assert.deepEqual(result.bid, bid(1, "S"));
  assert.equal(result.ruleId, "fiveCardHigh.competitive.takeoutDoubleForcedSuit");
  assert.equal(result.opponentSuit, "D");
});

test("Vijfkaart Hoog still makes a forced answer to partner's takeout double without a four-card unbid suit", () => {
  const auction = [
    { seat: "West", bid: bid(1, "H") },
    { seat: "North", bid: double() },
    { seat: "East", bid: pass() }
  ];

  const result = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "2S", "3S", "4S",
      "2H", "3H", "4H", "5H", "6H",
      "2D", "3D", "4D",
      "2C", "3C"
    ),
    auction,
    seat: "South",
    vulnerability: "none"
  });

  assert.deepEqual(result.bid, bid(1, "S"));
  assert.equal(result.ruleId, "fiveCardHigh.competitive.takeoutDoubleForcedSuit");
  assert.equal(result.length, 3);
});

test("Vijfkaart Hoog jumps in the longest unbid suit with 9-11 HCP after partner's takeout double", () => {
  const auction = [
    { seat: "West", bid: bid(1, "C") },
    { seat: "North", bid: double() },
    { seat: "East", bid: pass() }
  ];

  const result = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "2S", "3S",
      "QH", "JH", "2H",
      "AD", "KD", "2D", "3D", "4D",
      "2C", "3C", "4C"
    ),
    auction,
    seat: "South",
    vulnerability: "none"
  });

  assert.deepEqual(result.bid, bid(2, "D"));
  assert.equal(result.ruleId, "fiveCardHigh.competitive.takeoutDoubleJumpSuit");
  assert.equal(result.minimumHcp, 9);
  assert.equal(result.length, 5);
});

test("Vijfkaart Hoog bids 1NT with 6-9 HCP, balanced shape, stopper, and no four-card unbid suit after partner's takeout double", () => {
  const auction = [
    { seat: "West", bid: bid(1, "D") },
    { seat: "North", bid: double() },
    { seat: "East", bid: pass() }
  ];

  const result = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "QS", "4S", "2S",
      "QH", "3H", "2H",
      "KD", "7D", "5D", "3D",
      "JC", "4C", "2C"
    ),
    auction,
    seat: "South",
    vulnerability: "none"
  });

  assert.deepEqual(result.bid, bid(1, "NT"));
  assert.equal(result.ruleId, "fiveCardHigh.competitive.takeoutDoubleOneNotrump");
  assert.equal(result.minimumHcp, 6);
  assert.equal(result.stopperSuit, "D");
});

test("Vijfkaart Hoog bids game in a major with 12+ HCP after partner's takeout double", () => {
  const auction = [
    { seat: "West", bid: bid(1, "D") },
    { seat: "North", bid: double() },
    { seat: "East", bid: pass() }
  ];

  const result = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "AS", "KS", "2S", "3S",
      "KH", "QH", "2H", "3H",
      "2D", "3D",
      "2C", "3C", "4C"
    ),
    auction,
    seat: "South",
    vulnerability: "none"
  });

  assert.deepEqual(result.bid, bid(4, "S"));
  assert.equal(result.ruleId, "fiveCardHigh.competitive.takeoutDoubleGame");
  assert.equal(result.minimumHcp, 12);
  assert.equal(result.targetGameLevel, 4);
});

test("Vijfkaart Hoog bids 3NT with 12+ HCP, balanced shape, stopper, and no four-card major after partner's takeout double", () => {
  const auction = [
    { seat: "West", bid: bid(1, "D") },
    { seat: "North", bid: double() },
    { seat: "East", bid: pass() }
  ];

  const result = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "AS", "QS", "2S",
      "KH", "3H", "2H",
      "AD", "JD", "7D", "3D",
      "QC", "4C", "2C"
    ),
    auction,
    seat: "South",
    vulnerability: "none"
  });

  assert.deepEqual(result.bid, bid(3, "NT"));
  assert.equal(result.ruleId, "fiveCardHigh.competitive.takeoutDoubleGame");
  assert.equal(result.targetGameLevel, 3);
  assert.equal(result.stopperSuit, "D");
});

test("Vijfkaart Hoog passes after partner's takeout double when right-hand opponent bids and values are below the voluntary threshold", () => {
  const auction = [
    { seat: "West", bid: bid(1, "C") },
    { seat: "North", bid: double() },
    { seat: "East", bid: bid(1, "H") }
  ];

  const result = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "KS", "QS", "5S", "4S", "2S",
      "8H", "7H",
      "2D", "3D", "4D",
      "2C", "3C", "4C"
    ),
    auction,
    seat: "South",
    vulnerability: "none"
  });

  assert.deepEqual(result.bid, pass());
  assert.equal(result.ruleId, "fiveCardHigh.pass.competitiveNoAction");
});

test("Vijfkaart Hoog bids a voluntary one-level suit after partner's takeout double and right-hand interference from 6 HCP", () => {
  const auction = [
    { seat: "West", bid: bid(1, "C") },
    { seat: "North", bid: double() },
    { seat: "East", bid: bid(1, "H") }
  ];

  const result = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "KS", "QS", "JS", "4S", "2S",
      "8H", "7H",
      "2D", "3D", "4D",
      "2C", "3C", "4C"
    ),
    auction,
    seat: "South",
    vulnerability: "none"
  });

  assert.deepEqual(result.bid, bid(1, "S"));
  assert.equal(result.ruleId, "fiveCardHigh.competitive.takeoutDoubleVoluntarySuit");
  assert.equal(result.rhoBidAfterDouble, true);
  assert.equal(result.minimumHcp, 6);
});

test("Vijfkaart Hoog bids a voluntary two-level suit after partner's takeout double and right-hand interference from 10 HCP", () => {
  const auction = [
    { seat: "West", bid: bid(1, "C") },
    { seat: "North", bid: double() },
    { seat: "East", bid: bid(1, "S") }
  ];

  const result = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "8S", "7S",
      "AH", "KH", "QH", "2H",
      "2D", "3D", "4D",
      "JC", "5C", "4C", "3C"
    ),
    auction,
    seat: "South",
    vulnerability: "none"
  });

  assert.deepEqual(result.bid, bid(2, "H"));
  assert.equal(result.ruleId, "fiveCardHigh.competitive.takeoutDoubleVoluntarySuit");
  assert.equal(result.minimumHcp, 10);
  assert.equal(result.length, 4);
});

test("Vijfkaart Hoog keeps a 12 HCP response voluntary after partner's takeout double when right-hand opponent bids", () => {
  const auction = [
    { seat: "West", bid: bid(1, "C") },
    { seat: "North", bid: double() },
    { seat: "East", bid: bid(1, "S") }
  ];

  const result = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "8S", "7S",
      "AH", "KH", "QH", "JH",
      "2D", "3D", "4D",
      "QC", "5C", "4C", "3C"
    ),
    auction,
    seat: "South",
    vulnerability: "none"
  });

  assert.deepEqual(result.bid, bid(2, "H"));
  assert.equal(result.ruleId, "fiveCardHigh.competitive.takeoutDoubleVoluntarySuit");
  assert.equal(result.hcp, 12);
});

test("Vijfkaart Hoog takeout double rebid passes a weak forced suit response with 12-16 HCP", () => {
  const auction = [
    { seat: "West", bid: bid(1, "D") },
    { seat: "North", bid: double() },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(1, "H") },
    { seat: "West", bid: pass() }
  ];

  const result = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "AS", "KS", "4S", "2S",
      "KH", "8H", "7H", "3H",
      "5D", "2D",
      "AC", "6C", "4C"
    ),
    auction,
    seat: "North",
    vulnerability: "none"
  });

  assert.deepEqual(result.bid, pass());
  assert.equal(result.ruleId, "fiveCardHigh.competitive.takeoutDoubleRebidPassMinimum");
  assert.equal(result.maximumHcp, 16);
  assert.equal(result.takeoutDoubleRebid, true);
});

test("Vijfkaart Hoog takeout double rebid invites with a jump raise on 17-19 HCP and fit", () => {
  const auction = [
    { seat: "West", bid: bid(1, "D") },
    { seat: "North", bid: double() },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(1, "H") },
    { seat: "West", bid: pass() }
  ];

  const result = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "AS", "KS", "4S", "2S",
      "AH", "8H", "7H", "3H",
      "5D", "2D",
      "AC", "KC", "4C"
    ),
    auction,
    seat: "North",
    vulnerability: "none"
  });

  assert.deepEqual(result.bid, bid(3, "H"));
  assert.equal(result.ruleId, "fiveCardHigh.competitive.takeoutDoubleRebidInviteRaise");
  assert.equal(result.minimumHcp, 17);
  assert.equal(result.maximumHcp, 19);
  assert.equal(result.fit, true);
  assert.equal(result.support, 4);
});

test("Vijfkaart Hoog takeout double rebid bids game with 20+ HCP and fit", () => {
  const auction = [
    { seat: "West", bid: bid(1, "D") },
    { seat: "North", bid: double() },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(1, "H") },
    { seat: "West", bid: pass() }
  ];

  const result = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "AS", "KS", "4S", "2S",
      "AH", "KH", "7H", "3H",
      "5D", "2D",
      "AC", "KC", "QC"
    ),
    auction,
    seat: "North",
    vulnerability: "none"
  });

  assert.deepEqual(result.bid, bid(4, "H"));
  assert.equal(result.ruleId, "fiveCardHigh.competitive.takeoutDoubleRebidGameRaise");
  assert.equal(result.minimumHcp, 20);
  assert.equal(result.targetGameLevel, 4);
});

test("Vijfkaart Hoog takeout double rebid handles partner's 1NT response by strength", () => {
  const auction = [
    { seat: "West", bid: bid(1, "D") },
    { seat: "North", bid: double() },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(1, "NT") },
    { seat: "West", bid: pass() }
  ];

  const minimum = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "AS", "KS", "4S", "2S",
      "KH", "8H", "7H", "3H",
      "5D", "2D",
      "AC", "6C", "4C"
    ),
    auction,
    seat: "North",
    vulnerability: "none"
  });
  assert.deepEqual(minimum.bid, pass());
  assert.equal(minimum.ruleId, "fiveCardHigh.competitive.takeoutDoubleRebidPassMinimum");

  const invite = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "AS", "KS", "4S", "2S",
      "AH", "8H", "7H", "3H",
      "5D", "2D",
      "AC", "KC", "4C"
    ),
    auction,
    seat: "North",
    vulnerability: "none"
  });
  assert.deepEqual(invite.bid, bid(2, "NT"));
  assert.equal(invite.ruleId, "fiveCardHigh.competitive.takeoutDoubleRebidInviteNotrump");
  assert.equal(invite.minimumHcp, 17);

  const game = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "AS", "KS", "4S", "2S",
      "AH", "KH", "7H", "3H",
      "5D", "2D",
      "AC", "KC", "QC"
    ),
    auction,
    seat: "North",
    vulnerability: "none"
  });
  assert.deepEqual(game.bid, bid(3, "NT"));
  assert.equal(game.ruleId, "fiveCardHigh.competitive.takeoutDoubleRebidGameNotrump");
  assert.equal(game.minimumHcp, 20);
});

test("Vijfkaart Hoog takeout double rebid accepts partner's jump response by bidding game", () => {
  const auction = [
    { seat: "West", bid: bid(1, "C") },
    { seat: "North", bid: double() },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(2, "H") },
    { seat: "West", bid: pass() }
  ];

  const result = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "AS", "KS", "4S", "2S",
      "KH", "8H", "7H", "3H",
      "5D", "2D",
      "AC", "6C", "4C"
    ),
    auction,
    seat: "North",
    vulnerability: "none"
  });

  assert.deepEqual(result.bid, bid(4, "H"));
  assert.equal(result.ruleId, "fiveCardHigh.competitive.takeoutDoubleRebidAfterJumpGame");
  assert.equal(result.targetGameLevel, 4);
});

test("Vijfkaart Hoog takeout double rebid passes partner's direct game response", () => {
  const auction = [
    { seat: "West", bid: bid(1, "D") },
    { seat: "North", bid: double() },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(4, "S") },
    { seat: "West", bid: pass() }
  ];

  const result = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "AS", "KS", "4S", "2S",
      "AH", "KH", "7H", "3H",
      "5D", "2D",
      "AC", "KC", "QC"
    ),
    auction,
    seat: "North",
    vulnerability: "none"
  });

  assert.deepEqual(result.bid, pass());
  assert.equal(result.ruleId, "fiveCardHigh.competitive.takeoutDoubleRebidPassGame");
});

test("Vijfkaart Hoog takeout double rebid uses notrump with balanced extra strength and no fit", () => {
  const auction = [
    { seat: "West", bid: bid(1, "D") },
    { seat: "North", bid: double() },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(1, "H") },
    { seat: "West", bid: pass() }
  ];

  const invite = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "AS", "KS", "4S",
      "AH", "8H", "3H",
      "AD", "5D", "2D",
      "QC", "JC", "4C", "3C"
    ),
    auction,
    seat: "North",
    vulnerability: "none"
  });
  assert.deepEqual(invite.bid, bid(2, "NT"));
  assert.equal(invite.ruleId, "fiveCardHigh.competitive.takeoutDoubleRebidInviteNotrump");
  assert.equal(invite.stopperSuit, "D");

  const game = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "AS", "KS", "4S",
      "AH", "QH", "3H",
      "AD", "5D", "2D",
      "KC", "QC", "JC", "3C"
    ),
    auction,
    seat: "North",
    vulnerability: "none"
  });
  assert.deepEqual(game.bid, bid(3, "NT"));
  assert.equal(game.ruleId, "fiveCardHigh.competitive.takeoutDoubleRebidGameNotrump");
  assert.equal(game.stopperSuit, "D");
});

test("Vijfkaart Hoog allows a minimum six-HCP negative double after 1C over 1H", () => {
  const auction = [
    { seat: "East", bid: pass() },
    { seat: "South", bid: pass() },
    { seat: "West", bid: bid(1, "C") },
    { seat: "North", bid: bid(1, "H") }
  ];

  const result = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "TS", "8S", "7S", "2S",
      "TH", "9H", "3H",
      "KC", "JC", "3C", "2C",
      "QD", "4D"
    ),
    auction,
    seat: "East",
    vulnerability: "EW"
  });

  assert.deepEqual(result.bid, double());
  assert.equal(result.ruleId, "fiveCardHigh.competitive.negativeDouble");
  assert.equal(result.hcp, 6);
  assert.equal(result.counts.S, 4);
});

test("Vijfkaart Hoog redoubles after partner opens and right-hand opponent doubles with 10+ HCP and no fit", () => {
  const auction = [
    { seat: "North", bid: bid(1, "H") },
    { seat: "East", bid: double() }
  ];

  const result = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "AS", "QS", "JS", "7S", "5S",
      "8H", "3H",
      "KD", "7D", "4D",
      "6C", "5C", "2C"
    ),
    auction,
    seat: "South",
    vulnerability: "none"
  });

  assert.deepEqual(result.bid, redouble());
  assert.equal(result.ruleId, "fiveCardHigh.competitive.redoubleAfterPartnerOpeningDouble");
  assert.equal(result.minimumHcp, 10);
  assert.equal(result.partnerSuit, "H");
  assert.equal(result.support, 2);
  assert.equal(result.supportThreshold, 3);
  assert.equal(result.noFit, true);
  assert.equal(result.penaltyInterest, true);
});

test("Vijfkaart Hoog does not redouble after partner opens and opponent doubles with only 9 HCP", () => {
  const auction = [
    { seat: "North", bid: bid(1, "H") },
    { seat: "East", bid: double() }
  ];

  const result = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "AS", "QS", "JS", "7S", "5S",
      "8H", "3H",
      "QD", "7D", "4D",
      "6C", "5C", "2C"
    ),
    auction,
    seat: "South",
    vulnerability: "none"
  });

  assert.deepEqual(result.bid, bid(1, "S"));
  assert.notEqual(result.ruleId, "fiveCardHigh.competitive.redoubleAfterPartnerOpeningDouble");
  assert.equal(result.hcp, 9);
});

test("Vijfkaart Hoog supports partner instead of redoubling after a doubled opening with a fit", () => {
  const auction = [
    { seat: "North", bid: bid(1, "H") },
    { seat: "East", bid: double() }
  ];

  const result = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "AS", "QS", "4S",
      "8H", "3H", "2H",
      "KD", "7D", "4D",
      "JC", "8C", "5C", "2C"
    ),
    auction,
    seat: "South",
    vulnerability: "none"
  });

  assert.deepEqual(result.bid, bid(2, "NT"));
  assert.notEqual(result.ruleId, "fiveCardHigh.competitive.redoubleAfterPartnerOpeningDouble");
  assert.equal(result.hcp, 10);
  assert.equal(result.counts.H, 3);
});

test("Vijfkaart Hoog does not use the opening-redouble rule after partner's overcall is doubled", () => {
  const auction = [
    { seat: "West", bid: bid(1, "D") },
    { seat: "North", bid: bid(1, "H") },
    { seat: "East", bid: double() }
  ];

  const result = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "AS", "QS", "JS", "7S", "5S",
      "8H", "3H",
      "KD", "7D", "4D",
      "6C", "5C", "2C"
    ),
    auction,
    seat: "South",
    vulnerability: "none"
  });

  assert.deepEqual(result.bid, bid(1, "NT"));
  assert.equal(result.ruleId, "fiveCardHigh.competitive.notrumpAfterPartnerOvercall");
  assert.notEqual(result.ruleId, "fiveCardHigh.competitive.redoubleAfterPartnerOpeningDouble");
});

test("Vijfkaart Hoog bids 1NT after partner opens and right-hand opponent overcalls with a stopper", () => {
  const auction = [
    { seat: "North", bid: bid(1, "H") },
    { seat: "East", bid: bid(1, "S") }
  ];

  const result = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "AS", "JS", "TS",
      "8H", "3H",
      "QD", "6D", "4D", "3D",
      "JC", "9C", "8C", "5C"
    ),
    auction,
    seat: "South",
    vulnerability: "none"
  });

  assert.deepEqual(result.bid, bid(1, "NT"));
  assert.equal(result.ruleId, "fiveCardHigh.competitive.notrump");
  assert.equal(result.hcp, 8);
});

test("Vijfkaart Hoog raises partner's major after an overcall with normal support values", () => {
  const auction = [
    { seat: "North", bid: bid(1, "S") },
    { seat: "East", bid: bid(2, "D") }
  ];

  const result = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "JS", "7S", "5S",
      "AH", "JH", "6H", "2H",
      "9D", "8D", "5D", "3D",
      "QC", "TC"
    ),
    auction,
    seat: "South",
    vulnerability: "none"
  });

  assert.deepEqual(result.bid, bid(2, "S"));
  assert.equal(result.ruleId, "fiveCardHigh.competitive.raisePartner");
});

test("Vijfkaart Hoog passes weak support when the overcall pushes the raise to the three-level", () => {
  const auction = [
    { seat: "North", bid: bid(1, "D") },
    { seat: "East", bid: bid(2, "S") }
  ];

  const result = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "3S", "2S",
      "KH", "3H", "2H",
      "QD", "5D", "4D", "3D",
      "8C", "7C", "6C", "5C"
    ),
    auction,
    seat: "South",
    vulnerability: "none"
  });

  assert.deepEqual(result.bid, pass());
  assert.equal(result.ruleId, "fiveCardHigh.pass.competitiveNoAction");
});

test("Vijfkaart Hoog bids game with a strong fit after partner opens and right-hand opponent overcalls", () => {
  const auction = [
    { seat: "North", bid: bid(1, "H") },
    { seat: "East", bid: bid(1, "S") }
  ];

  const result = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "9S", "2S",
      "QH", "8H", "7H", "6H",
      "AD", "6D", "3D",
      "AC", "KC", "5C", "4C"
    ),
    auction,
    seat: "South",
    vulnerability: "none"
  });

  assert.deepEqual(result.bid, bid(4, "H"));
  assert.equal(result.ruleId, "fiveCardHigh.competitive.raisePartner");
});

test("Vijfkaart Hoog bids the only unbid one-level major naturally after an overcall", () => {
  const auction = [
    { seat: "North", bid: bid(1, "C") },
    { seat: "East", bid: bid(1, "H") }
  ];

  const result = rules.chooseFiveCardHighBidResult({
    hand: hand(
      "QS", "JS", "7S", "5S",
      "6H", "2H",
      "KD", "QD", "5D", "3D",
      "QC", "TC", "6C"
    ),
    auction,
    seat: "South",
    vulnerability: "none"
  });

  assert.deepEqual(result.bid, bid(1, "S"));
  assert.equal(result.ruleId, "fiveCardHigh.competitive.newSuit");
  assert.equal(result.length, 4);
});

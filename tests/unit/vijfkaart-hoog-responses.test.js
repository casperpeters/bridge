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

test("Vijfkaart Hoog positive response to strong 2C needs two top honors in the suit", () => {
  const auction = [
    { seat: "North", bid: bid(2, "C") },
    { seat: "East", bid: pass() }
  ];

  const twoTopHonors = chooseFiveCardHighResult([
    "KS", "2S",
    "AH", "QH", "7H", "5H", "3H",
    "2D", "3D",
    "2C", "3C", "4C", "5C"
  ], auction);
  assert.deepEqual(twoTopHonors.bid, bid(2, "H"));
  assert.equal(twoTopHonors.ruleId, "fiveCardHigh.response.strongTwoClubsPositive");
  assert.equal(twoTopHonors.topHonors, 2);

  const onlyOneTopHonor = chooseFiveCardHighResult([
    "AS", "2S",
    "KH", "JH", "7H", "5H", "3H",
    "KD", "2D", "3D",
    "2C", "3C", "4C"
  ], auction);
  assert.deepEqual(onlyOneTopHonor.bid, bid(2, "NT"));
  assert.equal(onlyOneTopHonor.ruleId, "fiveCardHigh.response.strongTwoClubsPositive");
  assert.equal(onlyOneTopHonor.topHonors, 0);
});

test("Vijfkaart Hoog responds to a weak 2D with notrump only with diamond communication and own tricks", () => {
  const auction = [
    { seat: "North", bid: bid(2, "D") },
    { seat: "East", bid: pass() }
  ];

  const game = chooseFiveCardHighResult([
    "AS", "8S", "4S",
    "AH", "7H", "5H",
    "KD", "3D",
    "KC", "QC", "9C", "6C", "2C"
  ], auction);
  assert.deepEqual(game.bid, bid(3, "NT"));
  assert.equal(game.ruleId, "fiveCardHigh.response.weakTwoDiamondNotrumpGame");
  assert.equal(game.ownPlayingTricks, 3);
  assert.equal(game.partnerSuitHonor, true);

  const invite = chooseFiveCardHighResult([
    "AS", "8S", "4S",
    "AH", "7H", "5H",
    "KD", "3D",
    "9C", "8C", "6C", "4C", "2C"
  ], auction);
  assert.deepEqual(invite.bid, bid(2, "NT"));
  assert.equal(invite.ruleId, "fiveCardHigh.response.weakTwoDiamondNotrumpInvite");
  assert.equal(invite.ownPlayingTricks, 2);

  const tooFewTricks = chooseFiveCardHighResult([
    "AS", "8S", "4S",
    "7H", "5H", "3H",
    "KD", "3D",
    "9C", "8C", "6C", "4C", "2C"
  ], auction);
  assert.deepEqual(tooFewTricks.bid, pass());
  assert.equal(tooFewTricks.ruleId, "fiveCardHigh.pass.responseWeakTwoNoAction");
  assert.equal(tooFewTricks.ownPlayingTricks, 1);
});

test("Vijfkaart Hoog raises a weak two major by own playing tricks with fit", () => {
  const auction = [
    { seat: "North", bid: bid(2, "H") },
    { seat: "East", bid: pass() }
  ];

  const invite = chooseFiveCardHighResult([
    "AS", "8S", "4S",
    "7H", "5H",
    "AD", "7D", "5D",
    "AC", "8C", "6C", "4C", "2C"
  ], auction);
  assert.deepEqual(invite.bid, bid(3, "H"));
  assert.equal(invite.ruleId, "fiveCardHigh.response.weakTwoMajorInviteRaise");
  assert.equal(invite.support, 2);
  assert.equal(invite.ownPlayingTricks, 3);

  const game = chooseFiveCardHighResult([
    "AS", "8S", "4S",
    "AH", "5H",
    "AD", "7D", "5D",
    "AC", "8C", "6C", "4C", "2C"
  ], auction);
  assert.deepEqual(game.bid, bid(4, "H"));
  assert.equal(game.ruleId, "fiveCardHigh.response.weakTwoMajorGameRaise");
  assert.equal(game.support, 2);
  assert.equal(game.ownPlayingTricks, 4);
});

test("Vijfkaart Hoog only bids notrump without weak-two fit when every suit is stopped", () => {
  const auction = [
    { seat: "North", bid: bid(2, "S") },
    { seat: "East", bid: pass() }
  ];

  const allStopped = chooseFiveCardHighResult([
    "AS",
    "AH", "7H", "5H",
    "AD", "7D", "5D",
    "AC", "8C", "6C", "4C", "3C", "2C"
  ], auction);
  assert.deepEqual(allStopped.bid, bid(3, "NT"));
  assert.equal(allStopped.ruleId, "fiveCardHigh.response.weakTwoNoFitNotrumpGame");
  assert.equal(allStopped.fit, false);
  assert.equal(allStopped.allSuitsStopped, true);

  const missingClubStopper = chooseFiveCardHighResult([
    "AS",
    "AH", "KH", "5H",
    "AD", "KD", "5D",
    "9C", "8C", "6C", "4C", "3C", "2C"
  ], auction);
  assert.deepEqual(missingClubStopper.bid, pass());
  assert.equal(missingClubStopper.ruleId, "fiveCardHigh.pass.responseWeakTwoNoAction");
  assert.deepEqual(missingClubStopper.missingStoppers, ["C"]);
});

test("Vijfkaart Hoog matches Start met Bridge weak-two response examples", () => {
  const examples = [
    {
      opening: bid(2, "S"),
      ids: [
        "KS", "9S", "4S",
        "AH", "KH", "JH", "5H",
        "AD", "7D", "5D", "3D", "2D",
        "6C"
      ],
      expectedBid: bid(4, "S"),
      expectedRuleId: "fiveCardHigh.response.weakTwoMajorGameRaise",
      expectedPlayingTricks: 4
    },
    {
      opening: bid(2, "D"),
      ids: [
        "AS", "QS", "5S",
        "KH", "9H", "4H",
        "QD", "JD", "3D",
        "AC", "JC", "8C", "7C"
      ],
      expectedBid: bid(3, "NT"),
      expectedRuleId: "fiveCardHigh.response.weakTwoDiamondNotrumpGame",
      expectedPlayingTricks: 3
    },
    {
      opening: bid(2, "H"),
      ids: [
        "AS", "9S", "4S",
        "8H", "5H", "3H",
        "KD", "JD", "3D", "2D",
        "AC", "QC", "6C"
      ],
      expectedBid: bid(3, "H"),
      expectedRuleId: "fiveCardHigh.response.weakTwoMajorInviteRaise",
      expectedPlayingTricks: 3
    },
    {
      opening: bid(2, "H"),
      ids: [
        "AS", "JS", "3S",
        "5H",
        "KD", "9D", "7D", "2D",
        "AC", "QC", "6C", "5C", "4C"
      ],
      expectedBid: pass(),
      expectedRuleId: "fiveCardHigh.pass.responseWeakTwoNoAction",
      expectedPlayingTricks: 2.5
    },
    {
      opening: bid(2, "S"),
      ids: [
        "4S",
        "KH", "JH", "5H",
        "AD", "KD", "QD", "JD", "TD", "7D", "5D",
        "AC", "8C"
      ],
      expectedBid: bid(3, "NT"),
      expectedRuleId: "fiveCardHigh.response.weakTwoNoFitNotrumpGame",
      expectedPlayingTricks: 8
    }
  ];

  examples.forEach(({ opening, ids, expectedBid, expectedRuleId, expectedPlayingTricks }) => {
    const result = chooseFiveCardHighResult(ids, [
      { seat: "North", bid: opening },
      { seat: "East", bid: pass() }
    ]);

    assert.deepEqual(result.bid, expectedBid);
    assert.equal(result.ruleId, expectedRuleId);
    assert.equal(result.ownPlayingTricks, expectedPlayingTricks);
  });
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

test("Vijfkaart Hoog revalues a one-major raise with fit points", () => {
  const auction = [
    { seat: "North", bid: bid(1, "H") },
    { seat: "East", bid: pass() }
  ];

  const upgraded = chooseFiveCardHighResult([
    "QS", "2S", "3S", "4S",
    "AH", "2H", "3H",
    "2D",
    "QC", "2C", "3C", "4C", "5C"
  ], auction);
  assert.deepEqual(upgraded.bid, bid(3, "H"));
  assert.equal(upgraded.fitPoints, 10);
  assert.equal(upgraded.valuation, "fitPoints");

  const shortHonor = chooseFiveCardHighResult([
    "KS", "2S", "3S", "4S",
    "AH", "2H", "3H",
    "QD",
    "QC", "2C", "3C", "4C", "5C"
  ], auction);
  assert.deepEqual(shortHonor.bid, bid(3, "H"));
  assert.equal(shortHonor.fitPoints, 11);
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

test("Vijfkaart Hoog uses Stayman over a 2NT opening from 4 HCP", () => {
  const twoNotrumpAuction = [
    { seat: "North", bid: bid(2, "NT") },
    { seat: "East", bid: pass() }
  ];

  const tooWeakForStayman = chooseFiveCardHighResult([
    "QS", "2S", "3S", "4S",
    "JH", "2H", "3H",
    "2D", "3D", "4D",
    "2C", "3C", "4C"
  ], twoNotrumpAuction);
  assert.deepEqual(tooWeakForStayman.bid, pass());
  assert.equal(tooWeakForStayman.ruleId, "fiveCardHigh.pass.responseNoAction");

  const stayman = chooseFiveCardHighResult([
    "KS", "2S", "3S", "4S",
    "JH", "2H", "3H",
    "2D", "3D", "4D",
    "2C", "3C", "4C"
  ], twoNotrumpAuction);
  assert.deepEqual(stayman.bid, bid(3, "C"));
  assert.equal(stayman.ruleId, "fiveCardHigh.response.stayman");
  assert.equal(stayman.hcp, 4);
});

test("Vijfkaart Hoog bids direct notrump slams after a natural 2NT opening", () => {
  const twoNotrumpAuction = [
    { seat: "North", bid: bid(2, "NT") },
    { seat: "East", bid: pass() }
  ];

  const smallSlam = chooseFiveCardHighResult([
    "QS", "8S", "7S",
    "KH", "QH", "5H",
    "KD", "QD", "6D", "4D", "3D",
    "JC", "2C"
  ], twoNotrumpAuction);
  assert.deepEqual(smallSlam.bid, bid(6, "NT"));
  assert.equal(smallSlam.ruleId, "fiveCardHigh.response.notrumpSmallSlam");
  assert.equal(smallSlam.partnershipMinimumHcp, 33);

  const grandSlam = chooseFiveCardHighResult([
    "AS", "KS", "QS",
    "AH", "KH", "2H",
    "2D", "3D", "4D", "5D",
    "JC", "2C", "3C"
  ], twoNotrumpAuction);
  assert.deepEqual(grandSlam.bid, bid(7, "NT"));
  assert.equal(grandSlam.ruleId, "fiveCardHigh.response.notrumpGrandSlam");
  assert.equal(grandSlam.partnershipMinimumHcp, 37);

  const game = chooseFiveCardHighResult([
    "QS", "2S", "3S",
    "KH", "QH", "2H",
    "KD", "QD", "2D", "3D",
    "2C", "3C", "4C"
  ], twoNotrumpAuction);
  assert.deepEqual(game.bid, bid(3, "NT"));
  assert.equal(game.ruleId, "fiveCardHigh.response.notrumpGame");

  const staymanBeforeSlam = chooseFiveCardHighResult([
    "AS", "KS", "2S", "3S",
    "QH", "2H", "3H",
    "KD", "2D", "3D",
    "JC", "2C", "3C"
  ], twoNotrumpAuction);
  assert.deepEqual(staymanBeforeSlam.bid, bid(3, "C"));
  assert.equal(staymanBeforeSlam.ruleId, "fiveCardHigh.response.stayman");
});

test("Vijfkaart Hoog bids direct notrump slams after a natural 1NT opening", () => {
  const oneNotrumpAuction = [
    { seat: "North", bid: bid(1, "NT") },
    { seat: "East", bid: pass() }
  ];

  const smallSlam = chooseFiveCardHighResult([
    "AS", "KS", "QS",
    "AH", "KH", "2H",
    "JD", "2D", "3D", "4D",
    "JC", "2C", "3C"
  ], oneNotrumpAuction);
  assert.deepEqual(smallSlam.bid, bid(6, "NT"));
  assert.equal(smallSlam.ruleId, "fiveCardHigh.response.notrumpSmallSlam");
  assert.equal(smallSlam.partnershipMinimumHcp, 33);

  const grandSlam = chooseFiveCardHighResult([
    "AS", "KS", "QS",
    "AH", "KH", "QH",
    "KD", "2D", "3D", "4D",
    "JC", "2C", "3C"
  ], oneNotrumpAuction);
  assert.deepEqual(grandSlam.bid, bid(7, "NT"));
  assert.equal(grandSlam.ruleId, "fiveCardHigh.response.notrumpGrandSlam");
  assert.equal(grandSlam.partnershipMinimumHcp, 37);
});

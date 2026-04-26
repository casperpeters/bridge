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

test("Vijfkaart Hoog opener rebids simply after responder's new suit to a major opening", () => {
  const oneSpadeTwoHearts = [
    { seat: "South", bid: bid(1, "S") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(2, "H") },
    { seat: "East", bid: pass() }
  ];
  const oneHeartTwoClubs = [
    { seat: "South", bid: bid(1, "H") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(2, "C") },
    { seat: "East", bid: pass() }
  ];
  const oneHeartTwoDiamonds = [
    { seat: "South", bid: bid(1, "H") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(2, "D") },
    { seat: "East", bid: pass() }
  ];

  const raisesWithFour = chooseFiveCardHighResult([
    "AS", "KS", "QS", "3S", "2S",
    "AH", "5H", "4H", "3H",
    "2D", "3D",
    "2C", "3C"
  ], oneSpadeTwoHearts);
  assert.deepEqual(raisesWithFour.bid, bid(3, "H"));
  assert.equal(raisesWithFour.ruleId, "fiveCardHigh.continuation.raisePartner");

  const doesNotRaiseWithThree = chooseFiveCardHighResult([
    "AS", "KS", "QS", "3S", "2S",
    "4H", "3H", "2H",
    "KD", "QD", "2D",
    "2C", "3C"
  ], oneSpadeTwoHearts);
  assert.deepEqual(doesNotRaiseWithThree.bid, bid(2, "NT"));
  assert.equal(doesNotRaiseWithThree.ruleId, "fiveCardHigh.continuation.notrumpRebid");

  const rebidsOwnSixCard = chooseFiveCardHighResult([
    "2S", "3S",
    "AH", "KH", "QH", "4H", "3H", "2H",
    "2D", "3D",
    "AC", "2C", "3C"
  ], oneHeartTwoDiamonds);
  assert.deepEqual(rebidsOwnSixCard.bid, bid(2, "H"));
  assert.equal(rebidsOwnSixCard.ruleId, "fiveCardHigh.continuation.rebidOwnSuit");

  const showsSecondSuit = chooseFiveCardHighResult([
    "QS", "JS", "3S", "2S",
    "AH", "KH", "QH", "3H", "2H",
    "2D", "3D",
    "2C", "3C"
  ], oneHeartTwoClubs);
  assert.deepEqual(showsSecondSuit.bid, bid(2, "S"));
  assert.equal(showsSecondSuit.ruleId, "fiveCardHigh.continuation.newSuit");
});

test("Vijfkaart Hoog opener rebids after a single major raise by total points", () => {
  const heartSingleRaiseAuction = [
    { seat: "South", bid: bid(1, "H") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(2, "H") },
    { seat: "East", bid: pass() }
  ];

  const minimumHeart = chooseFiveCardHighResult([
    "AS", "2S",
    "AH", "KH", "QH", "2H", "3H",
    "JD", "2D", "3D",
    "2C", "3C", "4C"
  ], heartSingleRaiseAuction);
  assert.deepEqual(minimumHeart.bid, pass());
  assert.equal(minimumHeart.points, 15);
  assert.equal(minimumHeart.ruleId, "fiveCardHigh.pass.openerMajorRaiseMinimum");

  const invitationalHeart = chooseFiveCardHighResult([
    "AS", "2S",
    "AH", "KH", "QH", "2H", "3H",
    "QD", "2D", "3D",
    "2C", "3C", "4C"
  ], heartSingleRaiseAuction);
  assert.deepEqual(invitationalHeart.bid, bid(3, "H"));
  assert.equal(invitationalHeart.points, 16);
  assert.equal(invitationalHeart.ruleId, "fiveCardHigh.continuation.openerMajorRaiseInvite");

  const gameHeart = chooseFiveCardHighResult([
    "AS", "2S",
    "AH", "KH", "QH", "2H", "3H",
    "AD", "2D", "3D",
    "2C", "3C", "4C"
  ], heartSingleRaiseAuction);
  assert.deepEqual(gameHeart.bid, bid(4, "H"));
  assert.equal(gameHeart.points, 18);
  assert.equal(gameHeart.ruleId, "fiveCardHigh.continuation.openerMajorRaiseGame");

  const spadeSingleRaiseAuction = [
    { seat: "South", bid: bid(1, "S") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(2, "S") },
    { seat: "East", bid: pass() }
  ];
  const invitationalSpade = chooseFiveCardHighResult([
    "AS", "KS", "QS", "2S", "3S",
    "AH", "2H",
    "KD", "2D", "3D",
    "2C", "3C", "4C"
  ], spadeSingleRaiseAuction);
  assert.deepEqual(invitationalSpade.bid, bid(3, "S"));
  assert.equal(invitationalSpade.points, 17);
  assert.equal(invitationalSpade.ruleId, "fiveCardHigh.continuation.openerMajorRaiseInvite");

  const gameSpade = chooseFiveCardHighResult([
    "AS", "KS", "QS", "2S", "3S",
    "AH", "2H",
    "AD", "2D", "3D",
    "2C", "3C", "4C"
  ], spadeSingleRaiseAuction);
  assert.deepEqual(gameSpade.bid, bid(4, "S"));
  assert.equal(gameSpade.points, 18);
  assert.equal(gameSpade.ruleId, "fiveCardHigh.continuation.openerMajorRaiseGame");
});

test("Vijfkaart Hoog opener rebids after responder supports a one minor opening", () => {
  const oneClubTwoClubs = [
    { seat: "South", bid: bid(1, "C") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(2, "C") },
    { seat: "East", bid: pass() }
  ];
  const oneDiamondTwoDiamonds = [
    { seat: "South", bid: bid(1, "D") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(2, "D") },
    { seat: "East", bid: pass() }
  ];
  const oneDiamondThreeDiamonds = [
    { seat: "South", bid: bid(1, "D") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(3, "D") },
    { seat: "East", bid: pass() }
  ];
  const oneClubFourClubs = [
    { seat: "South", bid: bid(1, "C") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(4, "C") },
    { seat: "East", bid: pass() }
  ];

  const minimum = chooseFiveCardHighResult([
    "AS", "KS", "2S",
    "QH", "4H", "3H",
    "JD", "3D", "2D",
    "QC", "4C", "3C", "2C"
  ], oneClubTwoClubs);
  assert.deepEqual(minimum.bid, pass());
  assert.equal(minimum.ruleId, "fiveCardHigh.pass.openerMinorRaiseMinimum");

  const invite = chooseFiveCardHighResult([
    "AS", "KS", "QS",
    "AH", "3H", "2H",
    "KD", "4D", "3D", "2D",
    "4C", "3C", "2C"
  ], oneDiamondTwoDiamonds);
  assert.deepEqual(invite.bid, bid(3, "D"));
  assert.equal(invite.ruleId, "fiveCardHigh.continuation.openerMinorRaiseInvite");

  const notrumpGame = chooseFiveCardHighResult([
    "AS", "KS", "QS",
    "AH", "KH", "2H",
    "QD", "3D", "2D",
    "5C", "4C", "3C", "2C"
  ], oneClubTwoClubs);
  assert.deepEqual(notrumpGame.bid, bid(3, "NT"));
  assert.equal(notrumpGame.ruleId, "fiveCardHigh.continuation.openerMinorRaiseNotrumpGame");

  const acceptsThreeLevelInvite = chooseFiveCardHighResult([
    "AS", "KS", "QS",
    "AH", "3H", "2H",
    "JD", "4D", "3D", "2D",
    "4C", "3C", "2C"
  ], oneDiamondThreeDiamonds);
  assert.deepEqual(acceptsThreeLevelInvite.bid, bid(3, "NT"));
  assert.equal(acceptsThreeLevelInvite.ruleId, "fiveCardHigh.continuation.openerMinorRaiseNotrumpGame");

  const fourLevelRaise = chooseFiveCardHighResult([
    "AS", "KS", "2S",
    "QH", "4H",
    "JD", "3D",
    "AC", "QC", "5C", "4C", "3C", "2C"
  ], oneClubFourClubs);
  assert.deepEqual(fourLevelRaise.bid, bid(5, "C"));
  assert.equal(fourLevelRaise.ruleId, "fiveCardHigh.continuation.openerMinorRaiseGame");
});

test("Vijfkaart Hoog opener rebids after responder bids notrump over a one minor opening", () => {
  const oneClubOneNotrump = [
    { seat: "South", bid: bid(1, "C") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(1, "NT") },
    { seat: "East", bid: pass() }
  ];
  const oneDiamondOneNotrump = [
    { seat: "South", bid: bid(1, "D") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(1, "NT") },
    { seat: "East", bid: pass() }
  ];
  const oneClubTwoNotrump = [
    { seat: "South", bid: bid(1, "C") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(2, "NT") },
    { seat: "East", bid: pass() }
  ];
  const oneDiamondTwoNotrump = [
    { seat: "South", bid: bid(1, "D") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(2, "NT") },
    { seat: "East", bid: pass() }
  ];
  const oneClubThreeNotrump = [
    { seat: "South", bid: bid(1, "C") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(3, "NT") },
    { seat: "East", bid: pass() }
  ];

  const balancedMinimum = chooseFiveCardHighResult([
    "AS", "KS", "2S",
    "QH", "JH", "2H",
    "JD", "2D",
    "QC", "5C", "4C", "3C", "2C"
  ], oneClubOneNotrump);
  assert.deepEqual(balancedMinimum.bid, pass());
  assert.equal(balancedMinimum.ruleId, "fiveCardHigh.pass.openerMinorAfterOneNtMinimum");

  const balancedInvite = chooseFiveCardHighResult([
    "AS", "KS", "2S",
    "AH", "3H", "2H",
    "KD", "4D", "3D", "2D",
    "QC", "3C", "2C"
  ], oneDiamondOneNotrump);
  assert.deepEqual(balancedInvite.bid, bid(2, "NT"));
  assert.equal(balancedInvite.ruleId, "fiveCardHigh.continuation.openerMinorAfterOneNtInvite");

  const balancedGame = chooseFiveCardHighResult([
    "AS", "KS", "QS",
    "AH", "KH", "2H",
    "QD", "2D",
    "QC", "5C", "4C", "3C", "2C"
  ], oneClubOneNotrump);
  assert.deepEqual(balancedGame.bid, bid(3, "NT"));
  assert.equal(balancedGame.ruleId, "fiveCardHigh.continuation.openerMinorAfterOneNtGame");

  const longMinorMinimum = chooseFiveCardHighResult([
    "AS", "KS",
    "QH", "2H",
    "KD", "5D", "4D", "3D", "2D", "6D",
    "4C", "3C", "2C"
  ], oneDiamondOneNotrump);
  assert.deepEqual(longMinorMinimum.bid, bid(2, "D"));
  assert.equal(longMinorMinimum.ruleId, "fiveCardHigh.continuation.openerMinorAfterOneNtLongMinorMinimum");

  const longMinorInvite = chooseFiveCardHighResult([
    "AS", "KS",
    "AH", "2H",
    "KD", "5D", "4D", "3D", "2D", "6D",
    "QC", "3C", "2C"
  ], oneDiamondOneNotrump);
  assert.deepEqual(longMinorInvite.bid, bid(3, "D"));
  assert.equal(longMinorInvite.ruleId, "fiveCardHigh.continuation.openerMinorAfterOneNtLongMinorInvite");

  const acceptsTwoNotrump = chooseFiveCardHighResult([
    "AS", "KS", "2S",
    "AH", "QH", "2H",
    "KD", "2D",
    "5C", "4C", "3C", "2C", "6C"
  ], oneClubTwoNotrump);
  assert.deepEqual(acceptsTwoNotrump.bid, bid(3, "NT"));
  assert.equal(acceptsTwoNotrump.ruleId, "fiveCardHigh.continuation.openerMinorAfterTwoNtGame");

  const longMinorAfterTwoNotrump = chooseFiveCardHighResult([
    "AS", "KS",
    "QH", "2H",
    "KD", "5D", "4D", "3D", "2D", "6D",
    "4C", "3C", "2C"
  ], oneDiamondTwoNotrump);
  assert.deepEqual(longMinorAfterTwoNotrump.bid, bid(3, "D"));
  assert.equal(longMinorAfterTwoNotrump.ruleId, "fiveCardHigh.continuation.openerMinorAfterTwoNtLongMinorInvite");

  const normalThreeNotrump = chooseFiveCardHighResult([
    "AS", "KS", "2S",
    "QH", "JH", "2H",
    "JD", "2D",
    "QC", "5C", "4C", "3C", "2C"
  ], oneClubThreeNotrump);
  assert.deepEqual(normalThreeNotrump.bid, pass());
  assert.equal(normalThreeNotrump.ruleId, "fiveCardHigh.pass.openerMinorAfterThreeNtPass");

  const longMinorOverThreeNotrump = chooseFiveCardHighResult([
    "AS", "KS",
    "QH", "2H",
    "JD", "2D",
    "AC", "KC", "7C", "6C", "5C", "4C", "3C"
  ], oneClubThreeNotrump);
  assert.deepEqual(longMinorOverThreeNotrump.bid, bid(5, "C"));
  assert.equal(longMinorOverThreeNotrump.ruleId, "fiveCardHigh.continuation.openerMinorAfterThreeNtLongMinorGame");
});

test("Vijfkaart Hoog opener rebids after a one-level new suit response to a one minor opening", () => {
  const oneClubOneHeart = [
    { seat: "South", bid: bid(1, "C") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(1, "H") },
    { seat: "East", bid: pass() }
  ];
  const oneDiamondOneHeart = [
    { seat: "South", bid: bid(1, "D") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(1, "H") },
    { seat: "East", bid: pass() }
  ];
  const oneDiamondOneSpade = [
    { seat: "South", bid: bid(1, "D") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(1, "S") },
    { seat: "East", bid: pass() }
  ];

  const minimumMajorFit = chooseFiveCardHighResult([
    "AS", "KS", "2S",
    "QH", "JH", "4H", "3H",
    "JD", "2D",
    "QC", "4C", "3C", "2C"
  ], oneClubOneHeart);
  assert.deepEqual(minimumMajorFit.bid, bid(2, "H"));
  assert.equal(minimumMajorFit.ruleId, "fiveCardHigh.continuation.openerMinorNewSuitMajorFitMinimum");

  const invitationalMajorFit = chooseFiveCardHighResult([
    "AS", "KS", "QS", "2S",
    "AH", "3H", "2H",
    "KD", "5D", "4D", "3D", "2D",
    "2C"
  ], oneDiamondOneSpade);
  assert.deepEqual(invitationalMajorFit.bid, bid(3, "S"));
  assert.equal(invitationalMajorFit.ruleId, "fiveCardHigh.continuation.openerMinorNewSuitMajorFitInvite");

  const gameMajorFit = chooseFiveCardHighResult([
    "AS", "KS", "QS",
    "AH", "KH", "4H", "3H",
    "QD", "2D",
    "5C", "4C", "3C", "2C"
  ], oneClubOneHeart);
  assert.deepEqual(gameMajorFit.bid, bid(4, "H"));
  assert.equal(gameMajorFit.ruleId, "fiveCardHigh.continuation.openerMinorNewSuitMajorFitGame");

  const balancedNoFit = chooseFiveCardHighResult([
    "AS", "KS", "2S",
    "QH", "JH", "2H",
    "JD", "4D", "3D", "2D",
    "QC", "3C", "2C"
  ], oneDiamondOneSpade);
  assert.deepEqual(balancedNoFit.bid, bid(1, "NT"));
  assert.equal(balancedNoFit.ruleId, "fiveCardHigh.continuation.openerMinorNewSuitNotrumpMinimum");

  const strongBalancedNoFit = chooseFiveCardHighResult([
    "AS", "KS", "2S",
    "AH", "3H", "2H",
    "KD", "4D", "3D", "2D",
    "QC", "3C", "2C"
  ], oneDiamondOneSpade);
  assert.deepEqual(strongBalancedNoFit.bid, bid(2, "NT"));
  assert.equal(strongBalancedNoFit.ruleId, "fiveCardHigh.continuation.openerMinorNewSuitNotrumpInvite");

  const longMinorMinimum = chooseFiveCardHighResult([
    "AS", "KS",
    "QH", "2H",
    "KD", "6D", "5D", "4D", "3D", "2D",
    "QC", "3C", "2C"
  ], oneDiamondOneSpade);
  assert.deepEqual(longMinorMinimum.bid, bid(2, "D"));
  assert.equal(longMinorMinimum.ruleId, "fiveCardHigh.continuation.openerMinorNewSuitLongMinorMinimum");

  const reverseBlockedWithoutExtras = chooseFiveCardHighResult([
    "AS",
    "QH", "JH", "4H", "3H",
    "KD", "QD", "5D", "4D", "3D",
    "JC", "4C", "3C"
  ], oneDiamondOneSpade);
  assert.deepEqual(reverseBlockedWithoutExtras.bid, bid(1, "NT"));
  assert.equal(reverseBlockedWithoutExtras.ruleId, "fiveCardHigh.continuation.openerMinorNewSuitNotrumpMinimum");

  const reverseWithExtras = chooseFiveCardHighResult([
    "AS",
    "AH", "QH", "JH", "3H",
    "KD", "QD", "5D", "4D", "3D",
    "4C", "3C", "2C"
  ], oneDiamondOneSpade);
  assert.deepEqual(reverseWithExtras.bid, bid(2, "H"));
  assert.equal(reverseWithExtras.ruleId, "fiveCardHigh.continuation.openerMinorNewSuitReverse");

  const simpleSecondSuit = chooseFiveCardHighResult([
    "AS", "KS", "4S", "3S",
    "2H",
    "KD", "QD", "5D", "4D", "3D",
    "QC", "3C", "2C"
  ], oneDiamondOneHeart);
  assert.deepEqual(simpleSecondSuit.bid, bid(1, "S"));
  assert.equal(simpleSecondSuit.ruleId, "fiveCardHigh.continuation.openerMinorNewSuitSecondSuit");
});

test("Vijfkaart Hoog opener rebids after 1D - 2C according to the example hands", () => {
  const oneDiamondTwoClubs = [
    { seat: "South", bid: bid(1, "D") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(2, "C") },
    { seat: "East", bid: pass() }
  ];

  const hand1 = chooseFiveCardHighResult([
    "TS", "9S", "6S",
    "KH", "QH", "8H", "7H",
    "KD", "JD", "9D", "6D",
    "AC", "5C"
  ], oneDiamondTwoClubs);
  assert.deepEqual(hand1.bid, bid(2, "NT"));
  assert.equal(hand1.ruleId, "fiveCardHigh.continuation.openerOneDiamondTwoClubsNotrumpInvite");

  const hand2 = chooseFiveCardHighResult([
    "JS", "7S", "4S",
    "QH", "8H",
    "AD", "KD", "QD", "9D", "8D", "3D",
    "KC", "8C"
  ], oneDiamondTwoClubs);
  assert.deepEqual(hand2.bid, bid(3, "D"));
  assert.equal(hand2.ruleId, "fiveCardHigh.continuation.openerOneDiamondTwoClubsLongDiamondInvite");

  const hand3 = chooseFiveCardHighResult([
    "KS", "JS", "7S",
    "AH", "JH", "9H", "3H",
    "KD", "QD", "JD", "9D", "5D",
    "JC"
  ], oneDiamondTwoClubs);
  assert.deepEqual(hand3.bid, bid(3, "NT"));
  assert.equal(hand3.ruleId, "fiveCardHigh.continuation.openerOneDiamondTwoClubsNotrumpGame");

  const hand4 = chooseFiveCardHighResult([
    "QS", "9S",
    "AH", "7H", "3H",
    "AD", "QD", "7D", "6D", "4D", "2D",
    "9C", "8C"
  ], oneDiamondTwoClubs);
  assert.deepEqual(hand4.bid, bid(2, "D"));
  assert.equal(hand4.ruleId, "fiveCardHigh.continuation.openerOneDiamondTwoClubsLongDiamondMinimum");

  const hand5 = chooseFiveCardHighResult([
    "AS", "QS", "JS", "7S",
    "QH", "8H",
    "AD", "KD", "9D", "5D", "4D",
    "JC", "8C"
  ], oneDiamondTwoClubs);
  assert.deepEqual(hand5.bid, bid(3, "NT"));
  assert.equal(hand5.ruleId, "fiveCardHigh.continuation.openerOneDiamondTwoClubsNotrumpGame");

  const hand6 = chooseFiveCardHighResult([
    "KS", "7S",
    "8H",
    "AD", "TD", "9D", "5D", "4D", "2D",
    "AC", "QC", "7C", "3C"
  ], oneDiamondTwoClubs);
  assert.deepEqual(hand6.bid, bid(3, "C"));
  assert.equal(hand6.ruleId, "fiveCardHigh.continuation.openerOneDiamondTwoClubsClubFit");
});

test("Vijfkaart Hoog opener rebids after a 1NT response to a major opening", () => {
  const oneHeartOneNotrump = [
    { seat: "South", bid: bid(1, "H") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(1, "NT") },
    { seat: "East", bid: pass() }
  ];

  const balancedMinimum = chooseFiveCardHighResult([
    "AH", "KH", "QH", "2H", "3H",
    "AS", "2S", "3S",
    "2D", "3D", "4D",
    "2C", "3C"
  ], oneHeartOneNotrump);
  assert.deepEqual(balancedMinimum.bid, pass());
  assert.equal(balancedMinimum.hcp, 13);
  assert.equal(balancedMinimum.handType, "balanced");
  assert.equal(balancedMinimum.ruleId, "fiveCardHigh.pass.openerAfterOneNtBalancedMinimum");

  const balancedGame = chooseFiveCardHighResult([
    "AH", "KH", "QH", "2H", "3H",
    "AS", "KS", "QS",
    "2D", "3D", "4D",
    "2C", "3C"
  ], oneHeartOneNotrump);
  assert.deepEqual(balancedGame.bid, bid(3, "NT"));
  assert.equal(balancedGame.hcp, 18);
  assert.equal(balancedGame.ruleId, "fiveCardHigh.continuation.openerAfterOneNtBalancedGame");

  const longMajorMinimum = chooseFiveCardHighResult([
    "AH", "KH", "QH", "2H", "3H", "4H",
    "AS", "2S", "3S",
    "2D", "3D",
    "2C", "3C"
  ], oneHeartOneNotrump);
  assert.deepEqual(longMajorMinimum.bid, bid(2, "H"));
  assert.equal(longMajorMinimum.hcp, 13);
  assert.equal(longMajorMinimum.handType, "longMajor");
  assert.equal(longMajorMinimum.ruleId, "fiveCardHigh.continuation.openerAfterOneNtLongMajorMinimum");

  const longMajorInvite = chooseFiveCardHighResult([
    "AH", "KH", "QH", "JH", "2H", "3H",
    "AS", "KS", "2S",
    "2D", "3D",
    "2C", "3C"
  ], oneHeartOneNotrump);
  assert.deepEqual(longMajorInvite.bid, bid(3, "H"));
  assert.equal(longMajorInvite.hcp, 17);
  assert.equal(longMajorInvite.ruleId, "fiveCardHigh.continuation.openerAfterOneNtLongMajorInvite");

  const oneSpadeOneNotrump = [
    { seat: "South", bid: bid(1, "S") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(1, "NT") },
    { seat: "East", bid: pass() }
  ];
  const longMajorGame = chooseFiveCardHighResult([
    "AS", "KS", "QS", "JS", "2S", "3S",
    "AH", "KH", "2H",
    "2D", "3D",
    "JC", "2C"
  ], oneSpadeOneNotrump);
  assert.deepEqual(longMajorGame.bid, bid(4, "S"));
  assert.equal(longMajorGame.hcp, 18);
  assert.equal(longMajorGame.ruleId, "fiveCardHigh.continuation.openerAfterOneNtLongMajorGame");

  const twoSuiterLow = chooseFiveCardHighResult([
    "AH", "KH", "QH", "2H", "3H",
    "2S", "3S",
    "KD", "QD", "2D", "3D",
    "JC", "2C"
  ], oneHeartOneNotrump);
  assert.deepEqual(twoSuiterLow.bid, bid(2, "D"));
  assert.equal(twoSuiterLow.hcp, 15);
  assert.equal(twoSuiterLow.handType, "twoSuiter");
  assert.equal(twoSuiterLow.secondSuit, "D");
  assert.equal(twoSuiterLow.ruleId, "fiveCardHigh.continuation.openerAfterOneNtTwoSuiterLow");

  const twoSuiterHigh = chooseFiveCardHighResult([
    "AS", "KS", "QS", "2S", "3S",
    "AH", "KH", "QH", "2H",
    "2D", "3D",
    "2C", "3C"
  ], oneSpadeOneNotrump);
  assert.deepEqual(twoSuiterHigh.bid, bid(3, "H"));
  assert.equal(twoSuiterHigh.hcp, 18);
  assert.equal(twoSuiterHigh.secondSuit, "H");
  assert.equal(twoSuiterHigh.ruleId, "fiveCardHigh.continuation.openerAfterOneNtTwoSuiterHigh");
});

test("Vijfkaart Hoog opener rebids after a 2NT response to a major opening", () => {
  const oneHeartTwoNotrump = [
    { seat: "South", bid: bid(1, "H") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(2, "NT") },
    { seat: "East", bid: pass() }
  ];

  const balancedMinimum = chooseFiveCardHighResult([
    "AH", "KH", "QH", "2H", "3H",
    "AS", "2S", "3S",
    "2D", "3D", "4D",
    "2C", "3C"
  ], oneHeartTwoNotrump);
  assert.deepEqual(balancedMinimum.bid, pass());
  assert.equal(balancedMinimum.ruleId, "fiveCardHigh.pass.openerAfterTwoNtBalancedMinimum");

  const balancedGame = chooseFiveCardHighResult([
    "AH", "KH", "QH", "2H", "3H",
    "AS", "2S", "3S",
    "2D", "3D", "4D",
    "JC", "2C"
  ], oneHeartTwoNotrump);
  assert.deepEqual(balancedGame.bid, bid(3, "NT"));
  assert.equal(balancedGame.hcp, 14);
  assert.equal(balancedGame.ruleId, "fiveCardHigh.continuation.openerAfterTwoNtBalancedGame");

  const longMajorMinimum = chooseFiveCardHighResult([
    "AH", "KH", "QH", "2H", "3H", "4H",
    "AS", "2S", "3S",
    "2D", "3D",
    "2C", "3C"
  ], oneHeartTwoNotrump);
  assert.deepEqual(longMajorMinimum.bid, bid(3, "H"));
  assert.equal(longMajorMinimum.ruleId, "fiveCardHigh.continuation.openerAfterTwoNtLongMajorMinimum");

  const oneSpadeTwoNotrump = [
    { seat: "South", bid: bid(1, "S") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(2, "NT") },
    { seat: "East", bid: pass() }
  ];
  const longMajorGame = chooseFiveCardHighResult([
    "AS", "KS", "QS", "2S", "3S", "4S",
    "AH", "2H", "3H",
    "2D", "3D",
    "JC", "2C"
  ], oneSpadeTwoNotrump);
  assert.deepEqual(longMajorGame.bid, bid(4, "S"));
  assert.equal(longMajorGame.hcp, 14);
  assert.equal(longMajorGame.ruleId, "fiveCardHigh.continuation.openerAfterTwoNtLongMajorGame");

  const twoSuiterLow = chooseFiveCardHighResult([
    "AH", "KH", "QH", "2H", "3H",
    "2S", "3S",
    "KD", "2D", "3D", "4D",
    "JC", "2C"
  ], oneHeartTwoNotrump);
  assert.deepEqual(twoSuiterLow.bid, bid(3, "D"));
  assert.equal(twoSuiterLow.hcp, 13);
  assert.equal(twoSuiterLow.ruleId, "fiveCardHigh.continuation.openerAfterTwoNtTwoSuiterLow");

  const twoMajorsGame = chooseFiveCardHighResult([
    "AS", "KS", "QS", "2S", "3S",
    "AH", "2H", "3H", "4H",
    "2D", "3D",
    "JC", "2C"
  ], oneSpadeTwoNotrump);
  assert.deepEqual(twoMajorsGame.bid, bid(4, "H"));
  assert.equal(twoMajorsGame.hcp, 14);
  assert.equal(twoMajorsGame.secondSuit, "H");
  assert.equal(twoMajorsGame.ruleId, "fiveCardHigh.continuation.openerAfterTwoNtTwoMajorsGame");

  const lowSecondSuitGame = chooseFiveCardHighResult([
    "AH", "KH", "QH", "2H", "3H",
    "2S", "3S",
    "KD", "QD", "2D", "3D",
    "2C", "3C"
  ], oneHeartTwoNotrump);
  assert.deepEqual(lowSecondSuitGame.bid, bid(3, "NT"));
  assert.equal(lowSecondSuitGame.hcp, 14);
  assert.equal(lowSecondSuitGame.secondSuit, "D");
  assert.equal(lowSecondSuitGame.ruleId, "fiveCardHigh.continuation.openerAfterTwoNtTwoSuiterGameNotrump");
});

test("Vijfkaart Hoog responder accepts or declines a major invite after a single raise", () => {
  const heartInviteAuction = [
    { seat: "North", bid: bid(1, "H") },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(2, "H") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(3, "H") },
    { seat: "East", bid: pass() }
  ];

  const lowerHeartRange = chooseFiveCardHighResult([
    "2S", "3S", "4S",
    "AH", "2H", "3H",
    "QD", "2D", "3D",
    "JC", "2C", "3C", "4C"
  ], heartInviteAuction);
  assert.deepEqual(lowerHeartRange.bid, pass());
  assert.equal(lowerHeartRange.ruleId, "fiveCardHigh.pass.declineMajorInvite");

  const upperHeartRange = chooseFiveCardHighResult([
    "2S", "3S", "4S",
    "AH", "2H", "3H",
    "KD", "2D", "3D",
    "JC", "2C", "3C", "4C"
  ], heartInviteAuction);
  assert.deepEqual(upperHeartRange.bid, bid(4, "H"));
  assert.equal(upperHeartRange.ruleId, "fiveCardHigh.continuation.acceptMajorInvite");

  const spadeInviteAuction = [
    { seat: "North", bid: bid(1, "S") },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(2, "S") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(3, "S") },
    { seat: "East", bid: pass() }
  ];
  const upperSpadeRange = chooseFiveCardHighResult([
    "AS", "2S", "3S",
    "2H", "3H", "4H",
    "KD", "2D", "3D",
    "JC", "2C", "3C", "4C"
  ], spadeInviteAuction);
  assert.deepEqual(upperSpadeRange.bid, bid(4, "S"));
  assert.equal(upperSpadeRange.ruleId, "fiveCardHigh.continuation.acceptMajorInvite");
});

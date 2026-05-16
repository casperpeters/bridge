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
const fiveCardHighInternal = require("../../rules/bidding/systems/five-card-high/index.js")._internal;
const strongTwoClubsRebids = require("../../rules/bidding/systems/five-card-high/rebids/strong-two-clubs/index.js");
const fourthSuitForcingRebids = require("../../rules/bidding/systems/five-card-high/rebids/fourth-suit-forcing/index.js");
const naturalOpenerRebids = require("../../rules/bidding/systems/five-card-high/rebids/natural-opener/index.js");

test("strong two clubs rebid family exposes generic methods and keeps compatibility aliases", () => {
  const family = strongTwoClubsRebids.strongTwoClubsRebidFamily;

  assert.equal(family.id, "rebids.strongTwoClubs");
  assert.equal(family.order, 29);
  assert.equal(family.chooseOpenerRebidTarget, strongTwoClubsRebids.chooseStrongTwoClubsOpenerRebidTarget);
  assert.equal(family.chooseResponderRebidTarget, strongTwoClubsRebids.chooseStrongTwoClubsResponderRebidTarget);
  assert.equal(family.chooseOpenerThirdBidTarget, strongTwoClubsRebids.chooseStrongTwoClubsOpenerThirdBidTarget);
  assert.equal(family.chooseResponderAfterOpenerThirdBidTarget, strongTwoClubsRebids.chooseStrongTwoClubsResponderAfterOpenerThirdBidTarget);
  assert.equal(family.describeOpenerRebidChoice, strongTwoClubsRebids.describeStrongTwoClubsOpenerRebidChoice);
  assert.equal(family.describeResponderRebidChoice, strongTwoClubsRebids.describeStrongTwoClubsResponderRebidChoice);
  assert.equal(family.describeOpenerThirdBidChoice, strongTwoClubsRebids.describeStrongTwoClubsOpenerThirdBidChoice);
});

test("fourth-suit forcing rebid family exposes generic methods and keeps compatibility aliases", () => {
  const family = fourthSuitForcingRebids.fourthSuitForcingRebidFamily;

  assert.equal(family.id, "rebids.fourthSuitForcing");
  assert.equal(family.order, 31);
  assert.equal(family.chooseResponderRebidTarget, fourthSuitForcingRebids.chooseFourthSuitForcingResponderRebidTarget);
  assert.equal(family.chooseOpenerThirdBidTarget, fourthSuitForcingRebids.chooseFourthSuitForcingOpenerThirdBidTarget);
  assert.equal(family.chooseResponderAfterOpenerThirdBidTarget, fourthSuitForcingRebids.chooseFourthSuitForcingResponderAfterOpenerThirdBidTarget);
  assert.equal(family.describeResponderRebidChoice, fourthSuitForcingRebids.describeFourthSuitForcingResponderRebidChoice);
  assert.equal(family.describeOpenerThirdBidChoice, fourthSuitForcingRebids.describeFourthSuitForcingOpenerThirdBidChoice);
  assert.equal(family.describeResponderAfterOpenerThirdBidChoice, fourthSuitForcingRebids.describeFourthSuitForcingResponderAfterOpenerThirdBidChoice);
});

test("natural opener rebid family exposes generic methods and keeps compatibility aliases", () => {
  const family = naturalOpenerRebids.naturalOpenerRebidFamily;

  assert.equal(family.id, "rebids.naturalOpener");
  assert.equal(family.order, 33);
  assert.equal(family.chooseOpenerRebidTarget, naturalOpenerRebids.chooseNaturalOpenerRebidTarget);
  assert.equal(family.describeOpenerRebidChoice, naturalOpenerRebids.describeNaturalOpenerRebidChoice);
  assert.equal(typeof naturalOpenerRebids.rebidAfterOneSuitOpeningFiveCardHigh, "function");
  assert.equal(typeof naturalOpenerRebids.openerRebidAfterRaiseFiveCardHigh, "function");
  assert.equal(typeof naturalOpenerRebids.openerRebidAfterNotrumpFiveCardHigh, "function");
  assert.equal(typeof naturalOpenerRebids.openerRebidAfterNewSuitFiveCardHigh, "function");
});

test("Vijfkaart Hoog responder shows a strong 5-4 major hand after opener rebids 1NT", () => {
  const auction = [
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(1, "C") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(1, "H") },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(1, "NT") },
    { seat: "West", bid: pass() }
  ];

  const result = chooseFiveCardHighResult([
    "AS", "QS", "TS", "7S",
    "AH", "QH", "6H", "4H", "3H",
    "QC", "3C",
    "8D", "3D"
  ], auction, "North");

  assert.deepEqual(result.bid, bid(3, "S"));
  assert.equal(result.ruleId, "fiveCardHigh.continuation.responderStrongSecondMajor");
});

test("Vijfkaart Hoog responder bids 3NT with 8 HCP after opener's natural 2NT rebid", () => {
  const auction = [
    { seat: "West", bid: bid(1, "C") },
    { seat: "North", bid: pass() },
    { seat: "East", bid: bid(1, "H") },
    { seat: "South", bid: pass() },
    { seat: "West", bid: bid(2, "NT") },
    { seat: "North", bid: pass() }
  ];

  const result = chooseFiveCardHighResult([
    "AS", "7S", "6S",
    "QH", "7H", "6H", "5H",
    "QD", "6D", "5D",
    "7C", "6C", "5C"
  ], auction, "East");

  assert.deepEqual(result.bid, bid(3, "NT"));
  assert.equal(result.ruleId, "fiveCardHigh.continuation.responderAfterTwoNotrumpRebidGame");
  assert.equal(result.hcp, 8);
  assert.equal(result.openerRange, "18-19");
  assert.equal(result.range, "8+");
});

test("Vijfkaart Hoog opener rebids after a strong 2C opening and 2D waiting response", () => {
  const strongTwoClubsWaiting = [
    { seat: "South", bid: bid(2, "C") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(2, "D") },
    { seat: "East", bid: pass() }
  ];

  const longSpades = chooseFiveCardHighResult([
    "AS", "KS", "QS", "JS", "6S", "4S", "2S",
    "TH",
    "QD", "9D",
    "KC", "QC", "JC"
  ], strongTwoClubsWaiting);
  assert.deepEqual(longSpades.bid, bid(2, "S"));
  assert.equal(longSpades.ruleId, "fiveCardHigh.continuation.strongTwoClubsSuitRebid");

  const extraLongHearts = chooseFiveCardHighResult([
    "KS", "QS",
    "AH", "KH", "JH", "TH", "5H", "4H",
    "AD", "KD", "QD", "8D",
    "AC"
  ], strongTwoClubsWaiting);
  assert.deepEqual(extraLongHearts.bid, bid(3, "H"));
  assert.equal(extraLongHearts.ruleId, "fiveCardHigh.continuation.strongTwoClubsJumpRebid");

  const balancedTwentyFour = chooseFiveCardHighResult([
    "AS", "QS", "6S",
    "AH", "KH", "JH", "9H",
    "AD", "KD",
    "QC", "JC", "4C", "3C"
  ], strongTwoClubsWaiting);
  assert.deepEqual(balancedTwentyFour.bid, bid(2, "NT"));
  assert.equal(balancedTwentyFour.ruleId, "fiveCardHigh.continuation.strongTwoClubsNotrumpRebid");

  const balancedThirty = chooseFiveCardHighResult([
    "AS", "KS", "QS", "8S",
    "AH", "KH", "7H",
    "AD", "KD",
    "AC", "QC", "JC", "7C"
  ], strongTwoClubsWaiting);
  assert.deepEqual(balancedThirty.bid, bid(3, "NT"));
  assert.equal(balancedThirty.ruleId, "fiveCardHigh.continuation.strongTwoClubsNotrumpRebid");

  const ordinarySixHearts = chooseFiveCardHighResult([
    "AS", "QS",
    "AH", "KH", "JH", "TH", "5H", "4H",
    "QD", "8D",
    "KC", "4C", "3C"
  ], strongTwoClubsWaiting);
  assert.deepEqual(ordinarySixHearts.bid, bid(2, "H"));
  assert.equal(ordinarySixHearts.ruleId, "fiveCardHigh.continuation.strongTwoClubsSuitRebid");
});

test("Vijfkaart Hoog opener rebids after a strong 2C opening and a positive suit response", () => {
  const positiveHearts = [
    { seat: "South", bid: bid(2, "C") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(2, "H") },
    { seat: "East", bid: pass() }
  ];
  const positiveSpades = [
    { seat: "South", bid: bid(2, "C") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(2, "S") },
    { seat: "East", bid: pass() }
  ];
  const positiveClubs = [
    { seat: "South", bid: bid(2, "C") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(3, "C") },
    { seat: "East", bid: pass() }
  ];

  const heartSupport = chooseFiveCardHighResult([
    "AS", "KS", "QS",
    "AH", "KH", "2H",
    "AD", "KD", "QD",
    "AC", "KC", "QC", "2C"
  ], positiveHearts);
  assert.deepEqual(heartSupport.bid, bid(4, "H"));
  assert.equal(heartSupport.ruleId, "fiveCardHigh.continuation.strongTwoClubsPositiveMajorSupport");

  const spadeSupport = chooseFiveCardHighResult([
    "AS", "KS", "2S",
    "AH", "KH", "QH",
    "AD", "KD", "QD",
    "AC", "KC", "QC", "2C"
  ], positiveSpades);
  assert.deepEqual(spadeSupport.bid, bid(4, "S"));
  assert.equal(spadeSupport.ruleId, "fiveCardHigh.continuation.strongTwoClubsPositiveMajorSupport");

  const balancedTwentyFour = chooseFiveCardHighResult([
    "AS", "KS", "QS",
    "KH", "2H",
    "AD", "KD", "QD",
    "QC", "JC", "4C", "3C", "2C"
  ], positiveHearts);
  assert.deepEqual(balancedTwentyFour.bid, bid(2, "NT"));
  assert.equal(balancedTwentyFour.ruleId, "fiveCardHigh.continuation.strongTwoClubsPositiveNotrumpRebid");

  const balancedTwentyFourAfterThreeClubs = chooseFiveCardHighResult([
    "AS", "KS", "QS",
    "KH", "JH", "2H",
    "AD", "KD", "QD",
    "QC", "4C", "3C", "2C"
  ], positiveClubs);
  assert.deepEqual(balancedTwentyFourAfterThreeClubs.bid, bid(3, "NT"));
  assert.equal(balancedTwentyFourAfterThreeClubs.ruleId, "fiveCardHigh.continuation.strongTwoClubsPositiveNotrumpGame");

  const ownLongHearts = chooseFiveCardHighResult([
    "AS", "KS",
    "AH", "KH", "QH", "JH", "5H", "4H",
    "AD", "KD", "QD",
    "AC", "2C"
  ], positiveSpades);
  assert.deepEqual(ownLongHearts.bid, bid(3, "H"));
  assert.equal(ownLongHearts.ruleId, "fiveCardHigh.continuation.strongTwoClubsPositiveSuitRebid");
});

test("Vijfkaart Hoog treats 2NT after a strong 2C positive response like a 2NT opening", () => {
  const strongTwoClubsThenTwoNotrump = [
    { seat: "South", bid: bid(2, "C") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(2, "H") },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(2, "NT") },
    { seat: "West", bid: pass() }
  ];

  const transferToHearts = chooseFiveCardHighResult([
    "7S", "6S",
    "AH", "KH", "QH", "7H", "6H",
    "7D", "6D", "5D",
    "4C", "3C", "2C"
  ], strongTwoClubsThenTwoNotrump, "North");
  assert.deepEqual(transferToHearts.bid, bid(3, "D"));
  assert.equal(transferToHearts.ruleId, "fiveCardHigh.continuation.strongTwoClubsTwoNotrumpTransferToH");

  const stayman = chooseFiveCardHighResult([
    "QS", "JS", "7S", "6S",
    "QH", "7H", "6H",
    "AD", "7D", "6D",
    "4C", "3C", "2C"
  ], strongTwoClubsThenTwoNotrump, "North");
  assert.deepEqual(stayman.bid, bid(3, "C"));
  assert.equal(stayman.ruleId, "fiveCardHigh.continuation.strongTwoClubsTwoNotrumpStayman");

  const acceptTransfer = chooseFiveCardHighResult([
    "AS", "KS", "QS",
    "KH", "2H",
    "AD", "KD", "QD",
    "QC", "JC", "4C", "3C", "2C"
  ], [
    ...strongTwoClubsThenTwoNotrump,
    { seat: "North", bid: bid(3, "D") },
    { seat: "East", bid: pass() }
  ], "South");
  assert.deepEqual(acceptTransfer.bid, bid(3, "H"));
  assert.equal(acceptTransfer.ruleId, "fiveCardHigh.continuation.strongTwoClubsTwoNotrumpAcceptTransfer");

  const answerStayman = chooseFiveCardHighResult([
    "AS", "KS", "QS", "2S",
    "KH", "2H",
    "AD", "KD", "QD",
    "QC", "JC", "4C", "3C"
  ], [
    ...strongTwoClubsThenTwoNotrump,
    { seat: "North", bid: bid(3, "C") },
    { seat: "East", bid: pass() }
  ], "South");
  assert.deepEqual(answerStayman.bid, bid(3, "S"));
  assert.equal(answerStayman.ruleId, "fiveCardHigh.continuation.strongTwoClubsTwoNotrumpStaymanAnswer");

  const responderSecondBid = chooseFiveCardHighResult([
    "7S", "6S",
    "AH", "KH", "QH", "7H", "6H",
    "7D", "6D", "5D",
    "4C", "3C", "2C"
  ], [
    ...strongTwoClubsThenTwoNotrump,
    { seat: "North", bid: bid(3, "D") },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(3, "H") },
    { seat: "West", bid: pass() }
  ], "North");
  assert.deepEqual(responderSecondBid.bid, bid(3, "NT"));
  assert.equal(responderSecondBid.ruleId, "fiveCardHigh.continuation.responderAfterTransferNotrumpGame");
});

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

test("Vijfkaart Hoog responder stops after partner bids game over a single major raise", () => {
  const heartGameAuction = [
    { seat: "North", bid: bid(1, "H") },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(2, "H") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(4, "H") },
    { seat: "East", bid: pass() }
  ];

  const ordinaryHeartSupport = chooseFiveCardHighResult([
    "2S", "3S", "4S",
    "AH", "2H", "3H",
    "QD", "2D", "3D",
    "JC", "2C", "3C", "4C"
  ], heartGameAuction);
  assert.deepEqual(ordinaryHeartSupport.bid, pass());
  assert.equal(ordinaryHeartSupport.ruleId, "fiveCardHigh.pass.responderAfterMajorRaiseGame");
  assert.equal(ordinaryHeartSupport.support, 3);

  const spadeGameAuction = [
    { seat: "North", bid: bid(1, "S") },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(2, "S") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(4, "S") },
    { seat: "East", bid: pass() }
  ];

  const exactSpadeRegression = chooseFiveCardHighResult([
    "AS", "2S", "3S",
    "2H", "3H", "4H",
    "KD", "3D", "4D",
    "2C", "3C", "4C", "5C"
  ], spadeGameAuction, "South");
  assert.deepEqual(exactSpadeRegression.bid, pass());
  assert.equal(exactSpadeRegression.ruleId, "fiveCardHigh.pass.responderAfterMajorRaiseGame");
  assert.equal(exactSpadeRegression.support, 3);
});

test("Vijfkaart Hoog responder only uses Blackwood after 1M-2M-4M with slam values and aces", () => {
  const spadeGameAuction = [
    { seat: "North", bid: bid(1, "S") },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(2, "S") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(4, "S") },
    { seat: "East", bid: pass() }
  ];

  const enoughForBlackwood = chooseFiveCardHighResult([
    "AS", "QS", "2S",
    "AH", "KH", "2H",
    "QD", "2D", "3D",
    "JC", "2C", "3C", "4C"
  ], spadeGameAuction, "South");
  assert.deepEqual(enoughForBlackwood.bid, bid(4, "NT"));
  assert.equal(enoughForBlackwood.ruleId, "fiveCardHigh.continuation.blackwoodAsk");
  assert.equal(enoughForBlackwood.trumpSuit, "S");
  assert.equal(enoughForBlackwood.aceCount, 2);
  assert.equal(enoughForBlackwood.partnershipMinimumHcp, 34);

  const slamValuesWithoutAces = chooseFiveCardHighResult([
    "KS", "QS", "JS",
    "KH", "QH", "JH",
    "KD", "QD", "JD",
    "QC", "JC", "2C", "3C"
  ], spadeGameAuction, "South");
  assert.deepEqual(slamValuesWithoutAces.bid, pass());
  assert.equal(slamValuesWithoutAces.ruleId, "fiveCardHigh.pass.responderAfterMajorRaiseGame");
  assert.equal(slamValuesWithoutAces.aceCount, 0);
});

test("Vijfkaart Hoog opener uses fit points after a single major raise", () => {
  const auction = [
    { seat: "South", bid: bid(1, "H") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(2, "H") },
    { seat: "East", bid: pass() }
  ];

  const shortQueen = chooseFiveCardHighResult([
    "AS", "2S", "3S",
    "AH", "KH", "QH", "2H", "3H",
    "QD", "2D",
    "2C", "3C", "4C"
  ], auction);
  assert.deepEqual(shortQueen.bid, pass());
  assert.equal(shortQueen.points, 16);
  assert.equal(shortQueen.fitPoints, 15);
  assert.equal(shortQueen.valuation, "fitPoints");
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
  assert.deepEqual(reverseBlockedWithoutExtras.bid, bid(2, "D"));
  assert.equal(reverseBlockedWithoutExtras.ruleId, "fiveCardHigh.continuation.openerMinorNewSuitFallbackOwnMinor");

  const reverseWithExtras = chooseFiveCardHighResult([
    "AS",
    "AH", "QH", "JH", "3H",
    "KD", "QD", "5D", "4D", "3D",
    "4C", "3C", "2C"
  ], oneDiamondOneSpade);
  assert.deepEqual(reverseWithExtras.bid, bid(2, "H"));
  assert.equal(reverseWithExtras.ruleId, "fiveCardHigh.continuation.openerMinorNewSuitReverse");

  const fiveFourReverseWithExtraShape = chooseFiveCardHighResult([
    "7S",
    "AH", "KH", "5H", "4H",
    "AD", "QD", "JD",
    "JC", "TC", "8C", "6C", "2C"
  ], [
    { seat: "North", bid: pass() },
    { seat: "East", bid: pass() },
    { seat: "South", bid: pass() },
    { seat: "West", bid: bid(1, "C") },
    { seat: "North", bid: pass() },
    { seat: "East", bid: bid(1, "S") },
    { seat: "South", bid: pass() }
  ], "West");
  assert.deepEqual(fiveFourReverseWithExtraShape.bid, bid(2, "H"));
  assert.equal(fiveFourReverseWithExtraShape.ruleId, "fiveCardHigh.continuation.openerMinorNewSuitReverse");

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

test("Vijfkaart Hoog explains responder rebids after a Jacoby transfer", () => {
  const oneNotrumpOpening = [
    { seat: "North", bid: bid(1, "NT") },
    { seat: "East", bid: pass() }
  ];
  const oneNotrumpHeartTransfer = [
    { seat: "North", bid: bid(1, "NT") },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(2, "D") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(2, "H") },
    { seat: "East", bid: pass() }
  ];
  const oneNotrumpSpadeTransfer = [
    { seat: "North", bid: bid(1, "NT") },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(2, "H") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(2, "S") },
    { seat: "East", bid: pass() }
  ];

  const hand1FiveHeartsFourSpadesMinimum = [
    "JS", "9S", "7S", "3S",
    "KH", "TH", "8H", "6H", "5H",
    "2D",
    "TC", "9C", "8C"
  ];
  assert.deepEqual(chooseFiveCardHighResult(hand1FiveHeartsFourSpadesMinimum, oneNotrumpOpening).bid, bid(2, "D"));
  const example1 = chooseFiveCardHighResult(hand1FiveHeartsFourSpadesMinimum, oneNotrumpHeartTransfer);
  assert.deepEqual(example1.bid, pass());
  assert.equal(example1.ruleId, "fiveCardHigh.pass.responderAfterTransferMinimum");

  const hand2FiveHeartsFourSpadesEnough = [
    "AS", "JS", "9S", "4S",
    "TH", "6H", "5H", "3H", "2H",
    "KD", "7D", "6D",
    "6C"
  ];
  assert.deepEqual(chooseFiveCardHighResult(hand2FiveHeartsFourSpadesEnough, oneNotrumpOpening).bid, bid(2, "D"));
  const example2 = chooseFiveCardHighResult(hand2FiveHeartsFourSpadesEnough, oneNotrumpHeartTransfer);
  assert.deepEqual(example2.bid, bid(2, "S"));
  assert.equal(example2.ruleId, "fiveCardHigh.continuation.responderAfterTransferFiveHeartsFourSpades");

  const hand3FiveSpadesFourHeartsGame = [
    "KS", "JS", "8S", "6S", "5S",
    "AH", "KH", "JH", "8H",
    "KD", "5D", "2D",
    "8C"
  ];
  assert.deepEqual(chooseFiveCardHighResult(hand3FiveSpadesFourHeartsGame, oneNotrumpOpening).bid, bid(2, "H"));
  const example3 = chooseFiveCardHighResult(hand3FiveSpadesFourHeartsGame, oneNotrumpSpadeTransfer);
  assert.deepEqual(example3.bid, bid(3, "H"));
  assert.equal(example3.ruleId, "fiveCardHigh.continuation.responderAfterTransferFiveSpadesFourHeartsGame");

  const hand4FiveSpadesFourHeartsInvite = [
    "QS", "TS", "9S", "7S", "3S",
    "AH", "QH", "8H", "6H",
    "2D",
    "TC", "9C", "8C"
  ];
  assert.deepEqual(chooseFiveCardHighResult(hand4FiveSpadesFourHeartsInvite, oneNotrumpOpening).bid, bid(2, "H"));
  const example4 = chooseFiveCardHighResult(hand4FiveSpadesFourHeartsInvite, oneNotrumpSpadeTransfer);
  assert.deepEqual(example4.bid, bid(2, "NT"));
  assert.equal(example4.ruleId, "fiveCardHigh.continuation.responderAfterTransferFiveSpadesFourHeartsInvite");

  const hand5TwoFiveCardMajorsGame = [
    "KS", "QS", "8S", "7S", "4S",
    "KH", "TH", "8H", "6H", "5H",
    "5D",
    "AC", "3C"
  ];
  assert.deepEqual(chooseFiveCardHighResult(hand5TwoFiveCardMajorsGame, oneNotrumpOpening).bid, bid(2, "H"));
  const example5 = chooseFiveCardHighResult(hand5TwoFiveCardMajorsGame, oneNotrumpSpadeTransfer);
  assert.deepEqual(example5.bid, bid(4, "H"));
  assert.equal(example5.ruleId, "fiveCardHigh.continuation.responderAfterTransferTwoFiveMajorsGame");

  const openerAfterThreeHearts = chooseFiveCardHighResult([
    "AS", "QS", "2S",
    "QH", "2H",
    "AD", "JD", "4D", "3D",
    "KC", "4C", "3C", "2C"
  ], [
    { seat: "North", bid: bid(1, "NT") },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(2, "H") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(2, "S") },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(3, "H") },
    { seat: "West", bid: pass() }
  ], "North");
  assert.deepEqual(openerAfterThreeHearts.bid, bid(4, "S"));
  assert.equal(openerAfterThreeHearts.ruleId, "fiveCardHigh.continuation.openerAfterTransferFiveSpadesFourHeartsChooseGame");

  const minimum = chooseFiveCardHighResult([
    "2S", "3S", "4S",
    "2H", "3H", "4H", "5H", "6H", "7H",
    "2D", "3D",
    "2C", "3C"
  ], oneNotrumpHeartTransfer);
  assert.deepEqual(minimum.bid, pass());
  assert.equal(minimum.ruleId, "fiveCardHigh.pass.responderAfterTransferMinimum");

  const inviteWithSix = chooseFiveCardHighResult([
    "2S", "3S",
    "AH", "QH", "2H", "3H", "4H", "5H",
    "KD", "2D",
    "2C", "3C", "4C"
  ], oneNotrumpHeartTransfer);
  assert.deepEqual(inviteWithSix.bid, bid(3, "H"));
  assert.equal(inviteWithSix.ruleId, "fiveCardHigh.continuation.responderAfterTransferSixCardInvite");

  const gameWithSix = chooseFiveCardHighResult([
    "2S", "3S",
    "AH", "KH", "QH", "2H", "3H", "4H",
    "AD", "2D",
    "2C", "3C", "4C"
  ], oneNotrumpHeartTransfer);
  assert.deepEqual(gameWithSix.bid, bid(4, "H"));
  assert.equal(gameWithSix.ruleId, "fiveCardHigh.continuation.responderAfterTransferSixCardGame");
});

test("Vijfkaart Hoog explains responder rebids after a Jacoby transfer over 2NT", () => {
  const twoNotrumpHeartTransfer = [
    { seat: "North", bid: bid(2, "NT") },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(3, "D") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(3, "H") },
    { seat: "East", bid: pass() }
  ];
  const twoNotrumpSpadeTransfer = [
    { seat: "North", bid: bid(2, "NT") },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(3, "H") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(3, "S") },
    { seat: "East", bid: pass() }
  ];

  const weakFiveHearts = chooseFiveCardHighResult([
    "2S", "3S", "4S",
    "2H", "3H", "4H", "5H", "6H",
    "2D", "3D",
    "2C", "3C", "4C"
  ], twoNotrumpHeartTransfer);
  assert.deepEqual(weakFiveHearts.bid, pass());
  assert.equal(weakFiveHearts.ruleId, "fiveCardHigh.pass.responderAfterTransferMinimum");
  assert.equal(weakFiveHearts.range, "0-3");

  const gameFiveHearts = chooseFiveCardHighResult([
    "AS", "2S", "3S",
    "2H", "3H", "4H", "5H", "6H",
    "2D", "3D",
    "2C", "3C", "4C"
  ], twoNotrumpHeartTransfer);
  assert.deepEqual(gameFiveHearts.bid, bid(3, "NT"));
  assert.equal(gameFiveHearts.ruleId, "fiveCardHigh.continuation.responderAfterTransferNotrumpGame");
  assert.equal(gameFiveHearts.range, "4+");

  const gameSixHearts = chooseFiveCardHighResult([
    "2S", "3S",
    "KH", "JH", "2H", "3H", "4H", "5H",
    "2D", "3D",
    "2C", "3C", "4C"
  ], twoNotrumpHeartTransfer);
  assert.deepEqual(gameSixHearts.bid, bid(4, "H"));
  assert.equal(gameSixHearts.ruleId, "fiveCardHigh.continuation.responderAfterTransferSixCardGame");
  assert.equal(gameSixHearts.range, "4+");

  const fiveSpadesFourHearts = chooseFiveCardHighResult([
    "AS", "2S", "3S", "4S", "5S",
    "2H", "3H", "4H", "5H",
    "2D", "3D",
    "2C", "3C"
  ], twoNotrumpSpadeTransfer);
  assert.deepEqual(fiveSpadesFourHearts.bid, bid(3, "NT"));
  assert.equal(fiveSpadesFourHearts.ruleId, "fiveCardHigh.continuation.responderAfterTransferNotrumpGame");
  assert.equal(fiveSpadesFourHearts.otherMajorLength, 4);
});

test("Vijfkaart Hoog matches lesson examples for Jacoby transfers over 2NT", () => {
  const twoNotrumpOpening = [
    { seat: "North", bid: bid(2, "NT") },
    { seat: "East", bid: pass() }
  ];
  const heartTransferAccepted = [
    { seat: "North", bid: bid(2, "NT") },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(3, "D") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(3, "H") },
    { seat: "East", bid: pass() }
  ];
  const spadeTransferAccepted = [
    { seat: "North", bid: bid(2, "NT") },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(3, "H") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(3, "S") },
    { seat: "East", bid: pass() }
  ];

  const hand1WeakFiveHearts = [
    "8S", "3S",
    "TH", "9H", "6H", "5H", "2H",
    "8D", "7D",
    "JC", "TC", "8C", "2C"
  ];
  const hand1Response = chooseFiveCardHighResult(hand1WeakFiveHearts, twoNotrumpOpening);
  assert.deepEqual(hand1Response.bid, bid(3, "D"));
  assert.equal(hand1Response.ruleId, "fiveCardHigh.response.transferToH");
  assert.equal(hand1Response.length, 5);
  const hand1Rebid = chooseFiveCardHighResult(hand1WeakFiveHearts, heartTransferAccepted);
  assert.deepEqual(hand1Rebid.bid, pass());
  assert.equal(hand1Rebid.ruleId, "fiveCardHigh.pass.responderAfterTransferMinimum");
  assert.equal(hand1Rebid.range, "0-3");

  const hand2SixSpades = [
    "JS", "TS", "8S", "7S", "5S", "4S",
    "KH", "JH", "9H",
    "JD", "9D", "4D",
    "3C"
  ];
  const hand2Response = chooseFiveCardHighResult(hand2SixSpades, twoNotrumpOpening);
  assert.deepEqual(hand2Response.bid, bid(3, "H"));
  assert.equal(hand2Response.ruleId, "fiveCardHigh.response.transferToS");
  assert.equal(hand2Response.length, 6);
  const hand2Rebid = chooseFiveCardHighResult(hand2SixSpades, spadeTransferAccepted);
  assert.deepEqual(hand2Rebid.bid, bid(4, "S"));
  assert.equal(hand2Rebid.ruleId, "fiveCardHigh.continuation.responderAfterTransferSixCardGame");
  assert.equal(hand2Rebid.range, "4+");

  const hand3GameFiveHearts = [
    "9S", "3S",
    "QH", "JH", "6H", "5H", "2H",
    "KD", "9D", "8D", "6D",
    "8C", "2C"
  ];
  const hand3Response = chooseFiveCardHighResult(hand3GameFiveHearts, twoNotrumpOpening);
  assert.deepEqual(hand3Response.bid, bid(3, "D"));
  assert.equal(hand3Response.ruleId, "fiveCardHigh.response.transferToH");
  assert.equal(hand3Response.length, 5);
  const hand3Rebid = chooseFiveCardHighResult(hand3GameFiveHearts, heartTransferAccepted);
  assert.deepEqual(hand3Rebid.bid, bid(3, "NT"));
  assert.equal(hand3Rebid.ruleId, "fiveCardHigh.continuation.responderAfterTransferNotrumpGame");
  assert.equal(hand3Rebid.range, "4+");
});

test("Vijfkaart Hoog Blackwood helpers count aces and map classic responses", () => {
  assert.equal(fiveCardHighInternal.countAces(hand("AS", "AH", "2D", "3D")), 2);
  assert.deepEqual(fiveCardHighInternal.blackwoodResponseBidForAceCount(0), bid(5, "C"));
  assert.deepEqual(fiveCardHighInternal.blackwoodResponseBidForAceCount(4), bid(5, "C"));
  assert.deepEqual(fiveCardHighInternal.blackwoodResponseBidForAceCount(1), bid(5, "D"));
  assert.deepEqual(fiveCardHighInternal.blackwoodResponseBidForAceCount(2), bid(5, "H"));
  assert.deepEqual(fiveCardHighInternal.blackwoodResponseBidForAceCount(3), bid(5, "S"));
  assert.equal(fiveCardHighInternal.agreedTrumpAfterAcceptedNotrumpTransfer(bid(2, "NT"), bid(3, "H"), bid(3, "S")), "S");
  assert.equal(fiveCardHighInternal.agreedTrumpAfterAcceptedNotrumpTransfer(bid(1, "NT"), bid(2, "D"), bid(2, "H")), "H");
});

test("Vijfkaart Hoog detects agreed trump conservatively from the auction", () => {
  const competitiveRaise = fiveCardHighInternal.agreedTrumpFromAuction([
    { seat: "South", bid: bid(1, "S") },
    { seat: "West", bid: bid(3, "D") },
    { seat: "North", bid: bid(4, "S") },
    { seat: "East", bid: pass() }
  ], "South");
  assert.equal(competitiveRaise.trumpSuit, "S");
  assert.equal(competitiveRaise.source, "majorRaise");
  assert.equal(competitiveRaise.confidence, "explicit");
  assert.equal(competitiveRaise.bySeat, "North");

  const acceptedTransfer = fiveCardHighInternal.agreedTrumpFromAuction([
    { seat: "North", bid: bid(1, "NT") },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(2, "D") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(2, "H") }
  ], "South");
  assert.equal(acceptedTransfer.trumpSuit, "H");
  assert.equal(acceptedTransfer.source, "acceptedTransfer");
  assert.equal(acceptedTransfer.bySeat, "North");

  assert.equal(fiveCardHighInternal.agreedTrumpFromAuction([
    { seat: "South", bid: bid(1, "NT") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(4, "NT") }
  ], "South"), null);
});

test("Vijfkaart Hoog auction agreement helper distinguishes conservative fit sources", () => {
  const staymanFit = fiveCardHighInternal.auctionAgreementFromAuction([
    { seat: "South", bid: bid(1, "NT") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(2, "C") },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(2, "S") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(4, "S") }
  ], "South");
  assert.equal(staymanFit.trumpSuit, "S");
  assert.equal(staymanFit.source, "staymanFit");

  const openerRaise = fiveCardHighInternal.auctionAgreementFromAuction([
    { seat: "South", bid: bid(1, "D") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(1, "S") },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(2, "S") }
  ], "North");
  assert.equal(openerRaise.trumpSuit, "S");
  assert.equal(openerRaise.source, "openerRaisesResponderMajor");

  const preemptRaise = fiveCardHighInternal.auctionAgreementFromAuction([
    { seat: "South", bid: bid(2, "H") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(4, "H") }
  ], "South");
  assert.equal(preemptRaise.trumpSuit, "H");
  assert.equal(preemptRaise.source, "preemptRaise");

  const minorRaise = fiveCardHighInternal.auctionAgreementFromAuction([
    { seat: "South", bid: bid(1, "D") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(3, "D") }
  ], "North");
  assert.equal(minorRaise.trumpSuit, "D");
  assert.equal(minorRaise.source, "minorRaise");

  const ambiguousMinorPreference = fiveCardHighInternal.auctionAgreementFromAuction([
    { seat: "South", bid: bid(1, "C") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(1, "D") },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(2, "D") }
  ], "South");
  assert.equal(ambiguousMinorPreference, null);
});

test("Vijfkaart Hoog answers Blackwood only after an agreed trump", () => {
  const competitiveSpadeRaise = [
    { seat: "South", bid: bid(1, "S") },
    { seat: "West", bid: bid(3, "D") },
    { seat: "North", bid: bid(4, "S") },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(4, "NT") },
    { seat: "West", bid: pass() }
  ];

  const answer = chooseFiveCardHighResult([
    "KS", "JS", "TS", "8S", "5S",
    "KH", "8H", "4H",
    "QC",
    "AD", "QD", "9D", "5D"
  ], competitiveSpadeRaise, "North");

  assert.deepEqual(answer.bid, bid(5, "D"));
  assert.equal(answer.ruleId, "fiveCardHigh.continuation.blackwoodResponse");
  assert.equal(answer.trumpSuit, "S");
  assert.equal(answer.aceCount, 1);

  const quantitativeNotrump = [
    { seat: "South", bid: bid(1, "NT") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(4, "NT") },
    { seat: "East", bid: pass() }
  ];
  const notBlackwood = chooseFiveCardHighResult([
    "AS", "QS", "6S",
    "KH", "JH", "9H",
    "AD", "TD", "8D",
    "KC", "9C", "5C", "2C"
  ], quantitativeNotrump, "South");

  assert.notEqual(notBlackwood.ruleId, "fiveCardHigh.continuation.blackwoodResponse");
});

test("Vijfkaart Hoog uses Blackwood after a 2NT transfer lesson hand", () => {
  const north = [
    "KS", "QS", "3S",
    "AH", "QH", "JH",
    "KD", "JD",
    "AC", "TC", "9C", "5C", "4C"
  ];
  const south = [
    "JS", "TS", "9S", "8S", "6S", "4S",
    "KH", "6H",
    "QD", "4D",
    "KC", "QC", "JC"
  ];
  const auction = [];
  const act = (seat, ids) => {
    const result = chooseFiveCardHighResult(ids, auction, seat);
    auction.push({ seat, bid: result.bid, bidResult: result });
    return result;
  };
  const addPass = (seat) => auction.push({ seat, bid: pass() });

  assert.deepEqual(act("North", north).bid, bid(2, "NT"));
  addPass("East");
  assert.deepEqual(act("South", south).bid, bid(3, "H"));
  addPass("West");
  assert.deepEqual(act("North", north).bid, bid(3, "S"));
  addPass("East");
  const ask = act("South", south);
  assert.deepEqual(ask.bid, bid(4, "NT"));
  assert.equal(ask.ruleId, "fiveCardHigh.continuation.blackwoodAsk");
  addPass("West");
  const answer = act("North", north);
  assert.deepEqual(answer.bid, bid(5, "H"));
  assert.equal(answer.ruleId, "fiveCardHigh.continuation.blackwoodResponse");
  assert.equal(answer.aceCount, 2);
  addPass("East");
  const signoff = act("South", south);
  assert.deepEqual(signoff.bid, bid(5, "S"));
  assert.equal(signoff.ruleId, "fiveCardHigh.continuation.blackwoodSignoff");
  assert.equal(signoff.missingAces, 2);
});

test("Vijfkaart Hoog chooses slam level after Blackwood by missing aces and strength", () => {
  const blackwoodWithTwoAcesShown = [
    { seat: "North", bid: bid(2, "NT") },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(3, "H") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(3, "S") },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(4, "NT"), bidResult: { aceCount: 1 } },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(5, "H"), bidResult: { aceCount: 2 } },
    { seat: "East", bid: pass() }
  ];
  const oneAceThirteen = chooseFiveCardHighResult([
    "AS", "JS", "TS", "9S", "8S", "6S",
    "KH", "6H",
    "QD", "4D",
    "QC", "JC", "2C"
  ], blackwoodWithTwoAcesShown);
  assert.deepEqual(oneAceThirteen.bid, bid(6, "S"));
  assert.equal(oneAceThirteen.ruleId, "fiveCardHigh.continuation.blackwoodSmallSlam");
  assert.equal(oneAceThirteen.missingAces, 1);

  const blackwoodWithThreeAcesShown = blackwoodWithTwoAcesShown.map((call) => ({ ...call }));
  blackwoodWithThreeAcesShown[8] = { seat: "North", bid: bid(5, "S"), bidResult: { aceCount: 3 } };
  const oneAceSeventeen = chooseFiveCardHighResult([
    "AS", "KS", "QS", "JS", "TS", "9S",
    "KH", "QH", "JH",
    "JD", "4D",
    "2C", "3C"
  ], blackwoodWithThreeAcesShown);
  assert.deepEqual(oneAceSeventeen.bid, bid(7, "S"));
  assert.equal(oneAceSeventeen.ruleId, "fiveCardHigh.continuation.blackwoodGrandSlam");
  assert.equal(oneAceSeventeen.missingAces, 0);

  const spadeTransferAccepted = [
    { seat: "North", bid: bid(2, "NT") },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(3, "H") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(3, "S") },
    { seat: "East", bid: pass() }
  ];
  const weakSixSpades = chooseFiveCardHighResult([
    "JS", "TS", "8S", "7S", "5S", "4S",
    "KH", "JH", "9H",
    "JD", "9D", "4D",
    "3C"
  ], spadeTransferAccepted);
  assert.deepEqual(weakSixSpades.bid, bid(4, "S"));
  assert.equal(weakSixSpades.ruleId, "fiveCardHigh.continuation.responderAfterTransferSixCardGame");
});

test("Vijfkaart Hoog explains opener choices after a Jacoby transfer invite", () => {
  const heartTransferInvite = [
    { seat: "North", bid: bid(1, "NT") },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(2, "D") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(2, "H") },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(2, "NT") },
    { seat: "West", bid: pass() }
  ];
  const spadeTransferInvite = [
    { seat: "North", bid: bid(1, "NT") },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(2, "H") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(2, "S") },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(2, "NT") },
    { seat: "West", bid: pass() }
  ];

  const hand1MinimumNoHeartSupport = chooseFiveCardHighResult([
    "QS", "JS", "6S", "4S",
    "8H", "3H",
    "AD", "JD", "7D", "3D",
    "AC", "QC", "JC"
  ], heartTransferInvite, "North");
  assert.deepEqual(hand1MinimumNoHeartSupport.bid, pass());
  assert.equal(hand1MinimumNoHeartSupport.ruleId, "fiveCardHigh.pass.openerAfterTransferInviteMinimumNoSupport");

  const hand2MinimumSpadeSupport = chooseFiveCardHighResult([
    "KS", "TS", "4S",
    "AH", "QH", "JH", "3H",
    "QD", "5D", "2D",
    "KC", "7C", "4C"
  ], spadeTransferInvite, "North");
  assert.deepEqual(hand2MinimumSpadeSupport.bid, bid(3, "S"));
  assert.equal(hand2MinimumSpadeSupport.ruleId, "fiveCardHigh.continuation.openerAfterTransferInviteMinimumSupport");

  const hand3MaximumHeartSupport = chooseFiveCardHighResult([
    "AS", "QS", "3S", "4S",
    "6H", "5H", "3H",
    "AD", "KD", "8D", "6D",
    "AC", "8C"
  ], heartTransferInvite, "North");
  assert.deepEqual(hand3MaximumHeartSupport.bid, bid(4, "H"));
  assert.equal(hand3MaximumHeartSupport.ruleId, "fiveCardHigh.continuation.openerAfterTransferInviteMaximumSupportGame");

  const hand4MinimumSpadeSupport = chooseFiveCardHighResult([
    "AS", "JS", "5S",
    "7H", "3H",
    "KD", "QD", "7D", "2D",
    "AC", "JC", "6C", "2C"
  ], spadeTransferInvite, "North");
  assert.deepEqual(hand4MinimumSpadeSupport.bid, bid(3, "S"));
  assert.equal(hand4MinimumSpadeSupport.ruleId, "fiveCardHigh.continuation.openerAfterTransferInviteMinimumSupport");
});

test("Vijfkaart Hoog explains responder rebids after Stayman", () => {
  const oneNotrumpOpening = [
    { seat: "North", bid: bid(1, "NT") },
    { seat: "East", bid: pass() }
  ];
  const staymanHeartAnswer = [
    { seat: "North", bid: bid(1, "NT") },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(2, "C") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(2, "H") },
    { seat: "East", bid: pass() }
  ];

  const hand1FitInvite = [
    "4S", "3S",
    "QH", "JH", "7H", "4H",
    "AD", "JD", "7D", "6D", "3D",
    "TC", "8C"
  ];
  assert.deepEqual(chooseFiveCardHighResult(hand1FitInvite, oneNotrumpOpening).bid, bid(2, "C"));
  const example1 = chooseFiveCardHighResult(hand1FitInvite, staymanHeartAnswer);
  assert.deepEqual(example1.bid, bid(3, "H"));
  assert.equal(example1.ruleId, "fiveCardHigh.continuation.responderAfterStaymanFitInvite");

  const hand2FitGame = [
    "QS", "TS", "6S", "4S",
    "KH", "TH", "8H", "5H",
    "AD", "6D", "5D",
    "KC", "9C"
  ];
  assert.deepEqual(chooseFiveCardHighResult(hand2FitGame, oneNotrumpOpening).bid, bid(2, "C"));
  const example2 = chooseFiveCardHighResult(hand2FitGame, staymanHeartAnswer);
  assert.deepEqual(example2.bid, bid(4, "H"));
  assert.equal(example2.ruleId, "fiveCardHigh.continuation.responderAfterStaymanFitGame");

  const hand3NoFitInvite = [
    "AS", "JS", "7S", "6S",
    "9H", "4H", "3H",
    "JD", "5D", "2D",
    "KC", "8C", "4C"
  ];
  assert.deepEqual(chooseFiveCardHighResult(hand3NoFitInvite, oneNotrumpOpening).bid, bid(2, "C"));
  const example3 = chooseFiveCardHighResult(hand3NoFitInvite, staymanHeartAnswer);
  assert.deepEqual(example3.bid, bid(2, "NT"));
  assert.equal(example3.ruleId, "fiveCardHigh.continuation.responderAfterStaymanNoFitInvite");
});

test("Vijfkaart Hoog explains opener choices after Stayman without a heart fit", () => {
  const staymanNoHeartFitInvite = [
    { seat: "North", bid: bid(1, "NT") },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(2, "C") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(2, "H") },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(2, "NT") },
    { seat: "West", bid: pass() }
  ];
  const staymanNoHeartFitGame = [
    { seat: "North", bid: bid(1, "NT") },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(2, "C") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(2, "H") },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(3, "NT") },
    { seat: "West", bid: pass() }
  ];

  const minimumNoSpades = chooseFiveCardHighResult([
    "2S", "3S",
    "KH", "QH", "7H", "3H",
    "QD", "5D", "2D",
    "KC", "JC", "TC", "4C"
  ], staymanNoHeartFitInvite, "North");
  assert.deepEqual(minimumNoSpades.bid, pass());
  assert.equal(minimumNoSpades.ruleId, "fiveCardHigh.pass.openerAfterStaymanNoHeartFitMinimumNotrump");

  const minimumWithSpades = chooseFiveCardHighResult([
    "AS", "TS", "6S", "4S",
    "AH", "QH", "7H",
    "QD", "5D", "2D",
    "9C", "8C", "7C"
  ], staymanNoHeartFitInvite, "North");
  assert.deepEqual(minimumWithSpades.bid, bid(3, "S"));
  assert.equal(minimumWithSpades.ruleId, "fiveCardHigh.continuation.openerAfterStaymanNoHeartFitSpadeInvite");

  const maximumNoSpades = chooseFiveCardHighResult([
    "AS", "QS", "3S",
    "AH", "QH", "7H", "3H",
    "KD", "QD", "5D",
    "KC", "8C", "4C"
  ], staymanNoHeartFitInvite, "North");
  assert.deepEqual(maximumNoSpades.bid, bid(3, "NT"));
  assert.equal(maximumNoSpades.ruleId, "fiveCardHigh.continuation.openerAfterStaymanNoHeartFitNotrumpGame");

  const maximumWithSpades = chooseFiveCardHighResult([
    "AS", "QS", "6S", "4S",
    "AH", "QH", "7H",
    "KD", "QD", "5D",
    "KC", "8C", "4C"
  ], staymanNoHeartFitInvite, "North");
  assert.deepEqual(maximumWithSpades.bid, bid(4, "S"));
  assert.equal(maximumWithSpades.ruleId, "fiveCardHigh.continuation.openerAfterStaymanNoHeartFitSpadeGame");

  const gameNoSpades = chooseFiveCardHighResult([
    "AS", "QS", "3S",
    "AH", "QH", "7H", "3H",
    "KD", "QD", "5D",
    "KC", "8C", "4C"
  ], staymanNoHeartFitGame, "North");
  assert.deepEqual(gameNoSpades.bid, pass());
  assert.equal(gameNoSpades.ruleId, "fiveCardHigh.pass.openerAfterStaymanNoHeartFitMinimumNotrump");

  const gameWithSpades = chooseFiveCardHighResult([
    "KS", "TS", "6S", "4S",
    "AH", "QH", "JH", "5H",
    "AD", "KD", "3D",
    "9C", "7C"
  ], staymanNoHeartFitGame, "North");
  assert.deepEqual(gameWithSpades.bid, bid(4, "S"));
  assert.equal(gameWithSpades.ruleId, "fiveCardHigh.continuation.openerAfterStaymanNoHeartFitSpadeGame");
});

test("Vijfkaart Hoog shows a five-card major after a Stayman invite with maximum", () => {
  const staymanHeartInvite = [
    { seat: "North", bid: bid(1, "NT") },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(2, "C") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(2, "H") },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(2, "NT") },
    { seat: "West", bid: pass() }
  ];
  const staymanSpadeInvite = [
    { seat: "North", bid: bid(1, "NT") },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(2, "C") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(2, "S") },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(2, "NT") },
    { seat: "West", bid: pass() }
  ];

  const maximumFiveHearts = chooseFiveCardHighResult([
    "AS", "4S",
    "AH", "QH", "JH", "5H", "3H",
    "QD", "JD", "3D",
    "KC", "TC", "8C"
  ], staymanHeartInvite, "North");
  assert.deepEqual(maximumFiveHearts.bid, bid(3, "H"));
  assert.equal(maximumFiveHearts.ruleId, "fiveCardHigh.continuation.openerAfterStaymanInviteFiveCardMajor");

  const maximumFiveSpades = chooseFiveCardHighResult([
    "AS", "KS", "QS", "9S", "7S",
    "AH", "8H", "2H",
    "QD", "JD",
    "TC", "9C", "8C"
  ], staymanSpadeInvite, "North");
  assert.deepEqual(maximumFiveSpades.bid, bid(3, "S"));
  assert.equal(maximumFiveSpades.ruleId, "fiveCardHigh.continuation.openerAfterStaymanInviteFiveCardMajor");

  const minimumFiveHearts = chooseFiveCardHighResult([
    "QS", "4S",
    "AH", "QH", "JH", "5H", "3H",
    "QD", "JD", "3D",
    "KC", "TC", "8C"
  ], staymanHeartInvite, "North");
  assert.deepEqual(minimumFiveHearts.bid, pass());
  assert.equal(minimumFiveHearts.ruleId, "fiveCardHigh.pass.openerAfterStaymanNoHeartFitMinimumNotrump");

  const maximumFourHeartsNoSpades = chooseFiveCardHighResult([
    "AS", "QS", "3S",
    "AH", "QH", "7H", "3H",
    "KD", "QD", "5D",
    "KC", "8C", "4C"
  ], staymanHeartInvite, "North");
  assert.deepEqual(maximumFourHeartsNoSpades.bid, bid(3, "NT"));
  assert.equal(maximumFourHeartsNoSpades.ruleId, "fiveCardHigh.continuation.openerAfterStaymanNoHeartFitNotrumpGame");
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

test("Vijfkaart Hoog responder keeps the second response low with minimum values", () => {
  const oneHeartOneSpadeTwoDiamonds = [
    { seat: "South", bid: bid(1, "H") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(1, "S") },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(2, "D") },
    { seat: "West", bid: pass() }
  ];

  const preference = chooseFiveCardHighResult([
    "AS", "7S", "6S", "5S",
    "4H", "3H",
    "7D", "6D", "5D",
    "KC", "4C", "3C", "2C"
  ], oneHeartOneSpadeTwoDiamonds, "North");
  assert.deepEqual(preference.bid, bid(2, "H"));
  assert.equal(preference.ruleId, "fiveCardHigh.continuation.responderPreference");
  assert.equal(preference.preferenceSuit, "H");
  assert.equal(preference.range, "6-9");

  const oneClubOneDiamondOneHeart = [
    { seat: "South", bid: bid(1, "C") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(1, "D") },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(1, "H") },
    { seat: "West", bid: pass() }
  ];
  const oneNotrumpMinimum = chooseFiveCardHighResult([
    "KS", "7S", "6S",
    "7H", "6H", "5H",
    "QD", "7D", "6D", "5D",
    "4C", "3C", "2C"
  ], oneClubOneDiamondOneHeart, "North");
  assert.deepEqual(oneNotrumpMinimum.bid, bid(1, "NT"));
  assert.equal(oneNotrumpMinimum.ruleId, "fiveCardHigh.continuation.responderOneNotrumpMinimum");
});

test("Vijfkaart Hoog responder uses 2NT as the invitational second response", () => {
  const auction = [
    { seat: "South", bid: bid(1, "H") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(1, "S") },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(2, "D") },
    { seat: "West", bid: pass() }
  ];

  const result = chooseFiveCardHighResult([
    "AS", "7S", "6S", "5S",
    "4H", "3H",
    "QD", "7D", "6D",
    "KC", "QC", "3C", "2C"
  ], auction, "North");

  assert.deepEqual(result.bid, bid(2, "NT"));
  assert.equal(result.ruleId, "fiveCardHigh.continuation.responderTwoNotrumpInvite");
  assert.equal(result.range, "10-11");
});

test("Vijfkaart Hoog keeps the 1D-1S-1NT-2H search for a five-card spade hand", () => {
  const auction = [
    { seat: "South", bid: bid(1, "D") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(1, "S") },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(1, "NT") },
    { seat: "West", bid: pass() }
  ];

  const result = chooseFiveCardHighResult([
    "AS", "QS", "7S", "6S", "5S",
    "KH", "7H", "6H", "5H",
    "7D", "6D",
    "4C", "3C"
  ], auction, "North");

  assert.deepEqual(result.bid, bid(2, "H"));
});

test("Vijfkaart Hoog responder uses fourth-suit forcing with game-going values", () => {
  const auction = [
    { seat: "South", bid: bid(1, "H") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(1, "S") },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(2, "D") },
    { seat: "West", bid: pass() }
  ];

  const result = chooseFiveCardHighResult([
    "AS", "7S", "6S", "5S",
    "4H", "3H",
    "7D", "6D",
    "AC", "KC", "QC", "6C", "5C"
  ], auction, "North");

  assert.deepEqual(result.bid, bid(3, "C"));
  assert.equal(result.ruleId, "fiveCardHigh.continuation.responderFourthSuitForcing");
  assert.equal(result.convention, "fourthSuitForcing");
  assert.equal(result.gameForcing, true);
  assert.equal(result.artificial, true);
  assert.equal(result.alert, true);
  assert.equal(result.fourthSuit, "C");
});

test("Vijfkaart Hoog opener answers fourth-suit forcing by priority", () => {
  const auction = [
    { seat: "South", bid: bid(1, "H") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(1, "S") },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(2, "D") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(3, "C") },
    { seat: "East", bid: pass() }
  ];

  const support = chooseFiveCardHighResult([
    "QS", "7S", "6S",
    "AH", "KH", "QH", "7H", "6H",
    "AD", "7D", "6D", "5D",
    "2C"
  ], auction, "South");
  assert.deepEqual(support.bid, bid(3, "S"));
  assert.equal(support.ruleId, "fiveCardHigh.continuation.openerAfterFourthSuitSupport");

  const notrump = chooseFiveCardHighResult([
    "7S", "6S",
    "AH", "KH", "QH", "7H", "6H",
    "AD", "7D", "6D",
    "AC", "7C", "6C"
  ], auction, "South");
  assert.deepEqual(notrump.bid, bid(3, "NT"));
  assert.equal(notrump.ruleId, "fiveCardHigh.continuation.openerAfterFourthSuitNotrump");
  assert.equal(notrump.stopperSuit, "C");

  const ownSuit = chooseFiveCardHighResult([
    "7S", "6S",
    "AH", "KH", "QH", "7H", "6H", "5H",
    "AD", "7D", "6D", "5D",
    "2C"
  ], auction, "South");
  assert.deepEqual(ownSuit.bid, bid(3, "H"));
  assert.equal(ownSuit.ruleId, "fiveCardHigh.continuation.openerAfterFourthSuitRebidOwnSuit");

  const secondSuit = chooseFiveCardHighResult([
    "7S", "6S",
    "AH", "KH", "QH", "7H", "6H",
    "AD", "7D", "6D", "5D", "4D",
    "2C"
  ], auction, "South");
  assert.deepEqual(secondSuit.bid, bid(3, "D"));
  assert.equal(secondSuit.ruleId, "fiveCardHigh.continuation.openerAfterFourthSuitRebidSecondSuit");
});

test("Vijfkaart Hoog responder chooses game after fourth-suit forcing", () => {
  const baseAuction = [
    { seat: "South", bid: bid(1, "H") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(1, "S") },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(2, "D") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(3, "C") },
    { seat: "East", bid: pass() }
  ];

  const handIds = [
    "AS", "KS", "7S", "6S", "5S",
    "4H", "3H",
    "QD", "7D", "6D", "5D",
    "AC", "2C"
  ];

  const majorGame = chooseFiveCardHighResult(handIds, [
    ...baseAuction,
    { seat: "South", bid: bid(3, "S") },
    { seat: "West", bid: pass() }
  ], "North");
  assert.deepEqual(majorGame.bid, bid(4, "S"));
  assert.equal(majorGame.ruleId, "fiveCardHigh.continuation.responderAfterFourthSuitChooseGame");

  const notrumpGame = chooseFiveCardHighResult(handIds, [
    ...baseAuction,
    { seat: "South", bid: bid(3, "NT") },
    { seat: "West", bid: pass() }
  ], "North");
  assert.deepEqual(notrumpGame.bid, pass());
  assert.equal(notrumpGame.ruleId, "fiveCardHigh.pass.responderAfterFourthSuitAcceptNotrumpGame");

  const belowGameNotrump = chooseFiveCardHighResult(handIds, [
    { seat: "South", bid: bid(1, "C") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(1, "H") },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(1, "S") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(2, "D") },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(2, "NT") },
    { seat: "West", bid: pass() }
  ], "North");
  assert.deepEqual(belowGameNotrump.bid, bid(3, "NT"));
  assert.equal(belowGameNotrump.ruleId, "fiveCardHigh.continuation.responderAfterFourthSuitChooseGame");

  const minorGame = chooseFiveCardHighResult(handIds, [
    ...baseAuction,
    { seat: "South", bid: bid(3, "D") },
    { seat: "West", bid: pass() }
  ], "North");
  assert.deepEqual(minorGame.bid, bid(5, "D"));
  assert.equal(minorGame.ruleId, "fiveCardHigh.continuation.responderAfterFourthSuitChooseGame");
});

const assert = require("node:assert/strict");
const rules = require("../bridge-rules.js");

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

function card(id) {
  const rank = id.slice(0, -1);
  const suit = id.slice(-1);
  return { id, rank, suit };
}

function hand(...ids) {
  return ids.map(card);
}

function bid(level, strain) {
  return rules.Bid(level, strain);
}

function pass() {
  return rules.Pass();
}

function double() {
  return rules.Double();
}

function redouble() {
  return rules.Redouble();
}

function chooseFiveCardHigh(ids, auction = [], seat = "South") {
  return rules.chooseFiveCardHighBid({
    hand: hand(...ids),
    auction,
    seat,
    vulnerability: "none"
  });
}

function chooseFiveCardHighResult(ids, auction = [], seat = "South") {
  return rules.chooseFiveCardHighBidResult({
    hand: hand(...ids),
    auction,
    seat,
    vulnerability: "none"
  });
}

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

test("bridge scoring handles common made contracts and undertricks", () => {
  assert.equal(rules.calculateBridgeScore({
    contract: { level: 4, strain: "S" },
    declarer: "South",
    tricksMade: 10,
    vulnerability: "none"
  }).score, 420);

  assert.equal(rules.calculateBridgeScore({
    contract: { level: 3, strain: "NT" },
    declarer: "North",
    tricksMade: 9,
    vulnerability: "NS"
  }).score, 600);

  assert.equal(rules.calculateBridgeScore({
    contract: { level: 2, strain: "H" },
    declarer: "East",
    tricksMade: 9,
    vulnerability: "none"
  }).score, 140);

  assert.equal(rules.calculateBridgeScore({
    contract: { level: 4, strain: "S" },
    declarer: "South",
    tricksMade: 8,
    vulnerability: "NS"
  }).score, -200);

  assert.equal(rules.calculateBridgeScore({
    contract: { level: 2, strain: "H", doubled: true },
    declarer: "South",
    tricksMade: 8,
    vulnerability: "NS"
  }).score, 670);
});

test("bridge scoring exposes beginner-friendly score breakdowns", () => {
  const game = rules.calculateBridgeScore({
    contract: { level: 4, strain: "S" },
    declarer: "South",
    tricksMade: 10,
    vulnerability: "none"
  });

  assert.equal(game.needed, 10);
  assert.equal(game.tricksMade, 10);
  assert.equal(game.contractMade, true);
  assert.equal(game.contractPoints, 120);
  assert.equal(game.contractScore, 120);
  assert.equal(game.gameBonus, 300);
  assert.equal(game.partscoreBonus, 0);
  assert.equal(game.bonusScore, 300);
  assert.equal(game.overtrickScore, 0);

  const doubled = rules.calculateBridgeScore({
    contract: { level: 2, strain: "H", doubled: true },
    declarer: "South",
    tricksMade: 8,
    vulnerability: "NS"
  });

  assert.equal(doubled.multiplier, 2);
  assert.equal(doubled.contractPoints, 60);
  assert.equal(doubled.contractScore, 120);
  assert.equal(doubled.gameBonus, 500);
  assert.equal(doubled.insultBonus, 50);
  assert.equal(doubled.bonusScore, 550);

  const down = rules.calculateBridgeScore({
    contract: { level: 4, strain: "S" },
    declarer: "South",
    tricksMade: 8,
    vulnerability: "NS"
  });

  assert.equal(down.contractMade, false);
  assert.equal(down.needed, 10);
  assert.equal(down.undertricks, 2);
  assert.equal(down.undertrickPenalty, 200);
  assert.equal(down.score, -200);
});

test("bridge scoring matches NBB Article 77 trick points and game bonuses", () => {
  const score = (contract, tricksMade, vulnerability = "none") => rules.calculateBridgeScore({
    contract,
    declarer: "South",
    tricksMade,
    vulnerability
  }).score;

  assert.equal(score({ level: 1, strain: "C" }, 7), 70);
  assert.equal(score({ level: 1, strain: "D" }, 7), 70);
  assert.equal(score({ level: 1, strain: "H" }, 7), 80);
  assert.equal(score({ level: 1, strain: "S" }, 7), 80);
  assert.equal(score({ level: 1, strain: "NT" }, 7), 90);
  assert.equal(score({ level: 2, strain: "NT" }, 8), 120);
  assert.equal(score({ level: 3, strain: "NT" }, 9), 400);
  assert.equal(score({ level: 5, strain: "C" }, 11), 400);
  assert.equal(score({ level: 5, strain: "C" }, 11, "NS"), 600);
  assert.equal(score({ level: 2, strain: "S", doubled: true }, 8), 470);
});

test("bridge scoring matches NBB Article 77 overtricks and slam bonuses", () => {
  const score = (contract, tricksMade, vulnerability = "none") => rules.calculateBridgeScore({
    contract,
    declarer: "South",
    tricksMade,
    vulnerability
  }).score;

  assert.equal(score({ level: 3, strain: "C" }, 10), 130);
  assert.equal(score({ level: 1, strain: "NT" }, 8), 120);
  assert.equal(score({ level: 2, strain: "S", doubled: true }, 9), 570);
  assert.equal(score({ level: 2, strain: "S", doubled: true }, 9, "NS"), 870);
  assert.equal(score({ level: 2, strain: "D", doubled: true, redoubled: true }, 10, "NS"), 1560);
  assert.equal(score({ level: 6, strain: "NT" }, 12), 990);
  assert.equal(score({ level: 6, strain: "NT" }, 12, "NS"), 1440);
  assert.equal(score({ level: 7, strain: "S" }, 13), 1510);
  assert.equal(score({ level: 7, strain: "S" }, 13, "NS"), 2210);
});

test("bridge scoring matches NBB Article 77 undertrick penalties", () => {
  const expected = [
    { vulnerable: false, multiplier: 1, penalties: [50, 100, 150, 200, 250] },
    { vulnerable: false, multiplier: 2, penalties: [100, 300, 500, 800, 1100] },
    { vulnerable: false, multiplier: 4, penalties: [200, 600, 1000, 1600, 2200] },
    { vulnerable: true, multiplier: 1, penalties: [100, 200, 300, 400, 500] },
    { vulnerable: true, multiplier: 2, penalties: [200, 500, 800, 1100, 1400] },
    { vulnerable: true, multiplier: 4, penalties: [400, 1000, 1600, 2200, 2800] }
  ];

  for (const { vulnerable, multiplier, penalties } of expected) {
    penalties.forEach((penalty, index) => {
      assert.equal(rules.downScore(index + 1, vulnerable, multiplier), penalty);
    });
  }

  assert.equal(rules.calculateBridgeScore({
    contract: { level: 5, strain: "D", doubled: true, redoubled: true },
    declarer: "South",
    tricksMade: 7,
    vulnerability: "none"
  }).score, -1600);
});

test("bridge scoring matches NBB Article 77 four-pass zero score", () => {
  const result = rules.calculateBridgeScore({
    contract: null
  });

  assert.equal(result.score, 0);
  assert.equal(result.scoreText, "NS 0 / EW 0");
  assert.equal(result.passOut, true);
  assert.equal(result.passedOut, true);
});

test("auctionComplete recognizes pass-out and contract auctions", () => {
  assert.equal(rules.auctionComplete([
    { seat: "North", bid: pass() },
    { seat: "East", bid: pass() },
    { seat: "South", bid: pass() }
  ]), false);

  const passedOutAuction = [
    { seat: "North", bid: pass() },
    { seat: "East", bid: pass() },
    { seat: "South", bid: pass() },
    { seat: "West", bid: pass() }
  ];
  assert.equal(rules.auctionComplete(passedOutAuction), true);
  assert.equal(rules.finalContract(passedOutAuction), null);

  assert.equal(rules.auctionComplete([
    { seat: "North", bid: bid(1, "S") },
    { seat: "East", bid: pass() },
    { seat: "South", bid: pass() },
    { seat: "West", bid: pass() }
  ]), true);
});

test("auctionComplete and finalContract handle doubles and redoubles", () => {
  const doubledAuction = [
    { seat: "North", bid: bid(1, "S") },
    { seat: "East", bid: double() },
    { seat: "South", bid: pass() },
    { seat: "West", bid: pass() },
    { seat: "North", bid: pass() }
  ];

  assert.equal(rules.auctionComplete(doubledAuction), true);
  assert.deepEqual(rules.finalContract(doubledAuction), { level: 1, strain: "S", doubled: true, redoubled: false });

  const redoubledAuction = [
    { seat: "North", bid: bid(1, "S") },
    { seat: "East", bid: double() },
    { seat: "South", bid: redouble() },
    { seat: "West", bid: pass() },
    { seat: "North", bid: pass() },
    { seat: "East", bid: pass() }
  ];

  assert.equal(rules.auctionComplete(redoubledAuction), true);
  assert.deepEqual(rules.finalContract(redoubledAuction), { level: 1, strain: "S", doubled: true, redoubled: true });
});

test("typed bid helpers normalize legacy calls without mixing new auction data", () => {
  assert.deepEqual(rules.normalizeBid("Pass"), pass());
  assert.deepEqual(rules.normalizeBid("Double"), double());
  assert.deepEqual(rules.normalizeBid("Redouble"), redouble());
  assert.deepEqual(rules.normalizeBid({ level: 2, strain: "NT" }), bid(2, "NT"));
  assert.equal(rules.sameCall("Double", double()), true);
  assert.equal(rules.sameCall({ level: 2, strain: "NT" }, bid(2, "NT")), true);
});

test("findDeclarer returns the first player from the declaring side to bid the strain", () => {
  const auction = [
    { seat: "North", bid: bid(1, "C") },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(1, "H") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(2, "H") },
    { seat: "East", bid: pass() },
    { seat: "South", bid: pass() },
    { seat: "West", bid: pass() }
  ];

  assert.equal(rules.findDeclarer(auction, { level: 2, strain: "H" }), "South");
});

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

test("Vijfkaart Hoog overcalls naturally with a good five-card suit and 8-16 HCP", () => {
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

test("createPlayPlan returns null until contract and dummy hand are known", () => {
  assert.equal(rules.createPlayPlan({
    declarerHand: hand("AS", "KS"),
    contract: { level: 3, strain: "NT" },
    declarer: "South",
    dummy: "North"
  }), null);

  assert.equal(rules.createPlayPlan({
    declarerHand: hand("AS", "KS"),
    dummyHand: hand("AH", "KH"),
    declarer: "South",
    dummy: "North"
  }), null);
});

test("createPlayPlan counts notrump winners and chooses long-suit development", () => {
  const plan = rules.createPlayPlan({
    declarerHand: hand("AS", "KS", "AD", "2C", "2D"),
    dummyHand: hand("KC", "QC", "JC", "4C", "3C", "AH"),
    contract: { level: 3, strain: "NT" },
    declarer: "South",
    dummy: "North"
  });

  assert.equal(plan.type, "notrump");
  assert.equal(plan.neededTricks, 9);
  assert.equal(plan.sureWinners.total, 4);
  const priority = plan.priorities.find((item) => item.kind === "developLongSuit" && item.suit === "C");
  assert.ok(priority);
  assert.equal(priority.missingStopper, "A");
  assert.equal(priority.entryTiming, "outsideEntry");
  assert.equal(priority.entrySuit, "H");
  assert.equal(priority.entryRank, "A");
  assert.equal(plan.needToDevelop, 5);
});

test("createPlayPlan warns when a notrump long suit has no outside entry", () => {
  const plan = rules.createPlayPlan({
    declarerHand: hand("AS", "AD", "2C"),
    dummyHand: hand("KC", "QC", "JC", "4C", "3C", "7D"),
    contract: { level: 3, strain: "NT" },
    declarer: "South",
    dummy: "North"
  });

  assert.ok(plan.priorities.some((item) => item.kind === "developLongSuit" && item.suit === "C"));
  assert.ok(plan.warnings.some((item) => item.kind === "entryRisk" && item.suit === "C" && item.sourceSeat === "North"));
});

test("createPlayPlan marks blocked notrump winners as stranded without an entry", () => {
  const plan = rules.createPlayPlan({
    declarerHand: hand("AC", "AS", "AD", "2D"),
    dummyHand: hand("KC", "QC", "JC", "TC", "4C", "3C"),
    contract: { level: 3, strain: "NT" },
    declarer: "South",
    dummy: "North"
  });

  assert.equal(plan.sureWinners.bySuit.C, 1);
  assert.equal(plan.sureWinners.detailsBySuit.C.winners, 5);
  assert.equal(plan.sureWinners.detailsBySuit.C.cashableWinners, 1);
  assert.equal(plan.sureWinners.detailsBySuit.C.entryTiming, "blockedNoEntry");
  assert.ok(plan.warnings.some((item) => item.kind === "blockedSuit" && item.suit === "C" && item.longSeat === "North"));
});

test("createPlayPlan orders notrump cashing to unblock a long suit before using its entry", () => {
  const declarerHand = hand("AC", "AS", "AH");
  const dummyHand = hand("KC", "QC", "JC", "2C", "AD");
  const contract = { level: 1, strain: "NT" };
  const playPlan = rules.createPlayPlan({
    declarerHand,
    dummyHand,
    contract,
    declarer: "South",
    dummy: "North"
  });

  const priority = playPlan.priorities[0];
  assert.equal(priority.kind, "cashWinners");
  assert.equal(priority.suit, "C");
  assert.equal(priority.timing, "unblockBeforeEntry");
  assert.deepEqual(priority.cashRanks, ["A"]);
  assert.equal(priority.entrySuit, "D");

  const result = rules.chooseCardPlay({
    hand: declarerHand,
    partnerHand: dummyHand,
    currentTrick: [],
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract,
    trump: null,
    playPlan
  });

  assert.equal(result.card.id, "AC");
  assert.equal(result.ruleId, "playPlan.cashWinners");
  assert.equal(result.action, "unblockSuit");
});

test("createPlayPlan prioritizes drawing trumps in a stable suit contract", () => {
  const plan = rules.createPlayPlan({
    declarerHand: hand("AS", "KS", "QS", "2S", "AH", "KH", "AD", "KD", "AC", "KC"),
    dummyHand: hand("JS", "TS", "9S", "8S", "QH", "JH", "QD", "JD", "QC", "JC"),
    contract: { level: 4, strain: "S" },
    declarer: "South",
    dummy: "North"
  });

  const priority = plan.priorities.find((item) => item.kind === "drawTrumps");
  assert.ok(priority);
  assert.equal(priority.suit, "S");
  assert.equal(priority.timing, "early");
});

test("createPlayPlan finds a dummy ruff before drawing all trumps", () => {
  const plan = rules.createPlayPlan({
    declarerHand: hand("AS", "KS", "QS", "2S", "JH", "TH", "8H", "3H", "AD", "KD", "AC", "KC"),
    dummyHand: hand("JS", "TS", "9S", "8S", "7S", "2D", "3D", "4D", "QC", "JC", "TC", "9C"),
    contract: { level: 4, strain: "S" },
    declarer: "South",
    dummy: "North"
  });

  const ruff = plan.priorities.find((item) => item.kind === "ruffShortSuit");
  const trumps = plan.priorities.find((item) => item.kind === "drawTrumps");
  assert.ok(ruff);
  assert.equal(ruff.suit, "H");
  assert.equal(trumps.timing, "afterRuff");
});

test("createPlayPlan exposes richer loser details for cover cards and ruffs", () => {
  const plan = rules.createPlayPlan({
    declarerHand: hand("AS", "KS", "QS", "2S", "KH", "3H", "2H", "JC", "3C", "2C"),
    dummyHand: hand("JS", "TS", "9S", "8S", "AH", "4H", "AD", "KD"),
    contract: { level: 4, strain: "S" },
    declarer: "South",
    dummy: "North"
  });

  const clubDetails = plan.losers.detailsBySuit.C;
  assert.equal(clubDetails.rawLosers, 3);
  assert.equal(clubDetails.ruffReduction, 1);
  assert.equal(plan.losers.bySuit.C, 2);

  const heartDetails = plan.losers.detailsBySuit.H;
  assert.deepEqual(heartDetails.coverCards, ["A"]);
  assert.deepEqual(heartDetails.missingTopHonors, ["Q"]);
});

test("createPlayPlan delays drawing trumps to unblock a side suit first", () => {
  const declarerHand = hand("AS", "KS", "QS", "2S", "AC", "2H", "3H", "4D");
  const dummyHand = hand("JS", "TS", "9S", "8S", "KC", "QC", "JC", "AD", "4H", "5H");
  const contract = { level: 4, strain: "S" };
  const playPlan = rules.createPlayPlan({
    declarerHand,
    dummyHand,
    contract,
    declarer: "South",
    dummy: "North"
  });

  const cash = playPlan.priorities[0];
  const trumps = playPlan.priorities.find((item) => item.kind === "drawTrumps");
  assert.equal(cash.kind, "cashWinners");
  assert.equal(cash.timing, "unblockBeforeEntry");
  assert.equal(trumps.timing, "afterUnblock");
  assert.equal(trumps.delaySuit, "C");

  const result = rules.chooseCardPlay({
    hand: declarerHand,
    partnerHand: dummyHand,
    currentTrick: [],
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract,
    trump: "S",
    playPlan
  });

  assert.equal(result.card.id, "AC");
  assert.equal(result.ruleId, "playPlan.cashWinners");
});

test("chooseCardPlay follows the play-plan long-suit priority", () => {
  const declarerHand = hand("AS", "KS", "AD", "2C", "2D");
  const dummyHand = hand("KC", "QC", "JC", "4C", "3C", "AH");
  const playPlan = rules.createPlayPlan({
    declarerHand,
    dummyHand,
    contract: { level: 3, strain: "NT" },
    declarer: "South",
    dummy: "North"
  });

  const result = rules.chooseCardPlay({
    hand: declarerHand,
    partnerHand: dummyHand,
    currentTrick: [],
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract: { level: 3, strain: "NT" },
    trump: null,
    playPlan
  });

  assert.equal(result.card.id, "2C");
  assert.equal(result.ruleId, "playPlan.developLongSuit");
  assert.equal(result.planPriority.kind, "developLongSuit");
});

test("chooseCardPlay follows the play-plan finesse priority", () => {
  const declarerHand = hand("2H", "3H", "AD");
  const dummyHand = hand("AH", "QH", "7H", "AC");
  const playPlan = rules.createPlayPlan({
    declarerHand,
    dummyHand,
    contract: { level: 3, strain: "NT" },
    declarer: "South",
    dummy: "North"
  });

  const result = rules.chooseCardPlay({
    hand: declarerHand,
    partnerHand: dummyHand,
    currentTrick: [],
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract: { level: 3, strain: "NT" },
    trump: null,
    playPlan
  });

  assert.equal(result.card.id, "2H");
  assert.equal(result.ruleId, "playPlan.finesseTowardHonor");
  assert.equal(result.planPriority.kind, "finesse");
});

test("chooseCardPlay follows the play-plan draw-trumps priority", () => {
  const declarerHand = hand("AS", "KS", "QS", "2S", "AH", "KH", "AD", "KD", "AC", "KC");
  const dummyHand = hand("JS", "TS", "9S", "8S", "QH", "JH", "QD", "JD", "QC", "JC");
  const contract = { level: 4, strain: "S" };
  const playPlan = rules.createPlayPlan({
    declarerHand,
    dummyHand,
    contract,
    declarer: "South",
    dummy: "North"
  });

  const result = rules.chooseCardPlay({
    hand: declarerHand,
    partnerHand: dummyHand,
    currentTrick: [],
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract,
    trump: "S",
    playPlan
  });

  assert.equal(result.card.id, "AS");
  assert.equal(result.ruleId, "playPlan.drawTrumps");
  assert.equal(result.planPriority.kind, "drawTrumps");
});

test("chooseCardPlay takes the play-plan dummy ruff before delayed trump drawing", () => {
  const declarerHand = hand("AS", "KS", "QS", "2S", "JH", "TH", "8H", "3H", "AD", "KD", "AC", "KC");
  const dummyHand = hand("JS", "TS", "9S", "8S", "7S", "2D", "3D", "4D", "QC", "JC", "TC", "9C");
  const contract = { level: 4, strain: "S" };
  const playPlan = rules.createPlayPlan({
    declarerHand,
    dummyHand,
    contract,
    declarer: "South",
    dummy: "North"
  });

  const result = rules.chooseCardPlay({
    hand: declarerHand,
    partnerHand: dummyHand,
    currentTrick: [],
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract,
    trump: "S",
    playPlan
  });

  assert.equal(result.card.id, "3H");
  assert.equal(result.ruleId, "playPlan.ruffShortSuit");
  assert.equal(result.planPriority.kind, "ruffShortSuit");
});

test("chooseCardPlay enters the long trump hand before repeated dummy ruffs", () => {
  const declarerHand = hand("AS", "KS", "JS", "TS", "2S", "8H", "5H", "4H", "3H", "AD", "JD", "5D", "AC");
  const dummyHand = hand("QS", "8S", "5S", "AH", "KD", "QD", "7D", "6D", "7C", "6C", "5C", "3C", "2C");
  const contract = { level: 7, strain: "S" };
  const playPlan = rules.createPlayPlan({
    declarerHand,
    dummyHand,
    contract,
    declarer: "South",
    dummy: "North"
  });

  const ruff = playPlan.priorities.find((item) => item.kind === "ruffShortSuit");
  const trumps = playPlan.priorities.find((item) => item.kind === "drawTrumps");
  assert.equal(ruff.suit, "H");
  assert.equal(trumps.timing, "afterRuff");

  const openingTrick = {
    number: 1,
    winner: "North",
    cards: [
      { seat: "West", card: card("KH") },
      { seat: "North", card: card("AH") },
      { seat: "East", card: card("2H") },
      { seat: "South", card: card("3H") }
    ]
  };

  const firstEntry = rules.chooseCardPlay({
    hand: hand("QS", "8S", "5S", "KD", "QD", "7D", "6D", "7C", "6C", "5C", "3C", "2C"),
    partnerHand: hand("AS", "KS", "JS", "TS", "2S", "8H", "5H", "4H", "AD", "JD", "5D", "AC"),
    currentTrick: [],
    trickHistory: [openingTrick],
    seat: "North",
    declarer: "South",
    dummy: "North",
    contract,
    trump: "S",
    playPlan
  });

  assert.equal(firstEntry.card.id, "6D");
  assert.equal(firstEntry.ruleId, "playPlan.enterLongTrumpHand");
  assert.equal(firstEntry.entryRank, "A");
  assert.equal(firstEntry.targetSeat, "South");
  assert.equal(firstEntry.planPriority.kind, "ruffShortSuit");

  const firstRuffHistory = [
    openingTrick,
    {
      number: 2,
      winner: "South",
      cards: [
        { seat: "North", card: card("6D") },
        { seat: "East", card: card("2D") },
        { seat: "South", card: card("AD") },
        { seat: "West", card: card("3D") }
      ]
    },
    {
      number: 3,
      winner: "North",
      cards: [
        { seat: "South", card: card("4H") },
        { seat: "West", card: card("6H") },
        { seat: "North", card: card("5S") },
        { seat: "East", card: card("7H") }
      ]
    }
  ];
  const secondEntry = rules.chooseCardPlay({
    hand: hand("QS", "8S", "KD", "QD", "7D", "7C", "6C", "5C", "3C", "2C"),
    partnerHand: hand("AS", "KS", "JS", "TS", "2S", "8H", "5H", "JD", "5D", "AC"),
    currentTrick: [],
    trickHistory: firstRuffHistory,
    seat: "North",
    declarer: "South",
    dummy: "North",
    contract,
    trump: "S",
    playPlan
  });

  assert.equal(secondEntry.card.id, "7D");
  assert.equal(secondEntry.ruleId, "playPlan.enterLongTrumpHand");
  assert.equal(secondEntry.entryRank, "J");

  const secondRuffHistory = [
    ...firstRuffHistory,
    {
      number: 4,
      winner: "South",
      cards: [
        { seat: "North", card: card("7D") },
        { seat: "East", card: card("4D") },
        { seat: "South", card: card("JD") },
        { seat: "West", card: card("8D") }
      ]
    },
    {
      number: 5,
      winner: "North",
      cards: [
        { seat: "South", card: card("5H") },
        { seat: "West", card: card("9H") },
        { seat: "North", card: card("8S") },
        { seat: "East", card: card("TH") }
      ]
    }
  ];
  const thirdEntry = rules.chooseCardPlay({
    hand: hand("QS", "KD", "QD", "7C", "6C", "5C", "3C", "2C"),
    partnerHand: hand("AS", "KS", "JS", "TS", "2S", "8H", "5D", "AC"),
    currentTrick: [],
    trickHistory: secondRuffHistory,
    seat: "North",
    declarer: "South",
    dummy: "North",
    contract,
    trump: "S",
    playPlan
  });

  assert.equal(thirdEntry.card.id, "2C");
  assert.equal(thirdEntry.ruleId, "playPlan.enterLongTrumpHand");
  assert.equal(thirdEntry.entrySuit, "C");
  assert.equal(thirdEntry.entryRank, "A");
});

test("chooseCardPlay uses the strongest named lead heuristic by default", () => {
  const result = rules.chooseCardPlay({
    hand: [card("AC"), card("2S"), card("3C")],
    currentTrick: [],
    seat: "South",
    trump: null
  });

  assert.equal(result.card.id, "AC");
  assert.equal(result.ruleId, "longestSuitLead");
  assert.equal(result.confidence, "uncertain");
  assert.ok(result.reason);
});

test("chooseCardPlay leads the highest card from a notrump sequence", () => {
  const result = rules.chooseCardPlay({
    hand: hand("KC", "QC", "JC", "7C", "2C", "AH", "3D"),
    currentTrick: [],
    seat: "West",
    contract: { level: 3, strain: "NT" },
    trump: null
  });

  assert.equal(result.card.id, "KC");
  assert.equal(result.ruleId, "notrumpSequenceLead");
  assert.equal(result.sequence, "KQJ");
});

test("chooseCardPlay leads the highest card from a notrump broken sequence", () => {
  const result = rules.chooseCardPlay({
    hand: hand("KH", "JH", "TH", "6H", "2H", "AC", "3D"),
    currentTrick: [],
    seat: "West",
    contract: { level: 3, strain: "NT" },
    trump: null
  });

  assert.equal(result.card.id, "KH");
  assert.equal(result.ruleId, "notrumpBrokenSequenceLead");
  assert.equal(result.sequence, "KJT");
  assert.equal(result.missingRank, "Q");
});

test("chooseCardPlay leads low from the longest notrump suit with honors but no sequence", () => {
  const result = rules.chooseCardPlay({
    hand: hand("AC", "8C", "5C", "2C", "KH", "3D", "2S"),
    currentTrick: [],
    seat: "West",
    contract: { level: 3, strain: "NT" },
    trump: null
  });

  assert.equal(result.card.id, "2C");
  assert.equal(result.ruleId, "notrumpLowPromisesHonor");
  assert.deepEqual(result.honorRanks, ["A"]);
});

test("chooseCardPlay leads a high middle card from the longest notrump suit without honors", () => {
  const result = rules.chooseCardPlay({
    hand: hand("9C", "8C", "5C", "2C", "KH", "3D", "2S"),
    currentTrick: [],
    seat: "West",
    contract: { level: 3, strain: "NT" },
    trump: null
  });

  assert.equal(result.card.id, "9C");
  assert.equal(result.ruleId, "notrumpHighMiddleDeniesHonor");
});

test("chooseCardPlay leads the highest card from a suit-contract honor sequence", () => {
  const result = rules.chooseCardPlay({
    hand: hand("KH", "QH", "8H", "2H", "AC", "8D", "4D"),
    currentTrick: [],
    seat: "West",
    declarer: "South",
    contract: { level: 4, strain: "S" },
    trump: "S"
  });

  assert.equal(result.card.id, "KH");
  assert.equal(result.ruleId, "suitContractSequenceLead");
  assert.equal(result.sequence, "KQ");
});

test("chooseCardPlay leads a suit-contract singleton before a doubleton", () => {
  const result = rules.chooseCardPlay({
    hand: hand("2C", "8H", "4H", "9D", "7D", "5D", "2D", "AS"),
    currentTrick: [],
    seat: "West",
    declarer: "South",
    contract: { level: 4, strain: "S" },
    trump: "S"
  });

  assert.equal(result.card.id, "2C");
  assert.equal(result.ruleId, "suitContractSingletonLead");
});

test("chooseCardPlay leads the highest card from a suit-contract doubleton before fourth best", () => {
  const result = rules.chooseCardPlay({
    hand: hand("8C", "4C", "9D", "7D", "5D", "2D", "AS", "KS"),
    currentTrick: [],
    seat: "West",
    declarer: "South",
    contract: { level: 4, strain: "S" },
    trump: "S"
  });

  assert.equal(result.card.id, "8C");
  assert.equal(result.ruleId, "suitContractDoubletonLead");
});

test("chooseCardPlay leads fourth best from length before low from three small", () => {
  const result = rules.chooseCardPlay({
    hand: hand("9D", "7D", "5D", "2D", "8C", "6C", "3C", "AS", "KS"),
    currentTrick: [],
    seat: "West",
    declarer: "South",
    contract: { level: 4, strain: "S" },
    trump: "S"
  });

  assert.equal(result.card.id, "2D");
  assert.equal(result.ruleId, "suitContractFourthBestLead");
});

test("chooseCardPlay leads low from three small before the suit-contract fallback", () => {
  const result = rules.chooseCardPlay({
    hand: hand("8C", "6C", "3C", "AS", "KS", "QS"),
    currentTrick: [],
    seat: "West",
    declarer: "South",
    contract: { level: 4, strain: "S" },
    trump: "S"
  });

  assert.equal(result.card.id, "3C");
  assert.equal(result.ruleId, "suitContractLowFromThreeSmall");
});

test("chooseCardPlay plays third hand high after partner's low-promises-honor notrump lead", () => {
  const result = rules.chooseCardPlay({
    hand: hand("QH", "8H", "3H", "AC"),
    currentTrick: [
      { seat: "North", card: card("2H"), ruleId: "notrumpLowPromisesHonor" },
      { seat: "East", card: card("4H") }
    ],
    seat: "South",
    declarer: "East",
    contract: { level: 3, strain: "NT" },
    trump: null
  });

  assert.equal(result.card.id, "QH");
  assert.equal(result.ruleId, "thirdHandHighOverLowLead");
  assert.equal(result.leadSuit, "H");
});

test("chooseCardPlay keeps low-promises-honor as a defensive notrump agreement", () => {
  const lead = rules.chooseCardPlay({
    hand: hand("AC", "8C", "5C", "2C", "KH", "3D", "2S"),
    currentTrick: [],
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract: { level: 3, strain: "NT" },
    trump: null
  });

  assert.equal(lead.card.id, "AC");
  assert.equal(lead.ruleId, "longestSuitLead");

  const thirdHand = rules.chooseCardPlay({
    hand: hand("QH", "8H", "3H", "AC"),
    currentTrick: [
      { seat: "South", card: card("2H"), ruleId: "notrumpLowPromisesHonor" },
      { seat: "West", card: card("4H") }
    ],
    seat: "North",
    declarer: "South",
    dummy: "North",
    contract: { level: 3, strain: "NT" },
    trump: null
  });

  assert.equal(thirdHand.card.id, "8H");
  assert.equal(thirdHand.ruleId, "cheapestWinner");
});

test("chooseCardPlay makes a defender second hand play low even when a cheap winner is available", () => {
  const result = rules.chooseCardPlay({
    hand: hand("9H", "2H", "AS"),
    currentTrick: [{ seat: "East", card: card("7H") }],
    seat: "South",
    declarer: "East",
    dummy: "West",
    dummyHand: hand("4H", "3H", "2C"),
    contract: { level: 4, strain: "S" },
    trump: "S"
  });

  assert.equal(result.card.id, "2H");
  assert.equal(result.ruleId, "secondHandLow");
});

test("chooseCardPlay makes a defender second hand play high from a touching honor sequence", () => {
  const result = rules.chooseCardPlay({
    hand: hand("KH", "QH", "2H", "AS"),
    currentTrick: [{ seat: "East", card: card("9H") }],
    seat: "South",
    declarer: "East",
    dummy: "West",
    dummyHand: hand("4H", "3H", "2C"),
    contract: { level: 4, strain: "S" },
    trump: "S"
  });

  assert.equal(result.card.id, "KH");
  assert.equal(result.ruleId, "secondHandSequenceHigh");
  assert.equal(result.sequence, "KQ");
});

test("chooseCardPlay makes a defender second hand cover an honor when dummy has a touching lower honor", () => {
  const result = rules.chooseCardPlay({
    hand: hand("KH", "2H", "AS"),
    currentTrick: [{ seat: "East", card: card("QH") }],
    seat: "South",
    declarer: "East",
    dummy: "West",
    dummyHand: hand("JH", "4H", "2C"),
    contract: { level: 4, strain: "S" },
    trump: "S"
  });

  assert.equal(result.card.id, "KH");
  assert.equal(result.ruleId, "secondHandCoverHonor");
  assert.equal(result.coveredRank, "Q");
});

test("chooseCardPlay does not cover an honor when dummy shows only small cards in the suit", () => {
  const result = rules.chooseCardPlay({
    hand: hand("KH", "2H", "AS"),
    currentTrick: [{ seat: "East", card: card("QH") }],
    seat: "South",
    declarer: "East",
    dummy: "West",
    dummyHand: hand("8H", "4H", "2C"),
    contract: { level: 4, strain: "S" },
    trump: "S"
  });

  assert.equal(result.card.id, "2H");
  assert.equal(result.ruleId, "secondHandLow");
});

test("chooseCardPlay makes a defender third hand play the cheapest winning card", () => {
  const result = rules.chooseCardPlay({
    hand: hand("AH", "QH", "3H", "AC"),
    currentTrick: [
      { seat: "North", card: card("2H") },
      { seat: "East", card: card("9H") }
    ],
    seat: "South",
    declarer: "East",
    dummy: "West",
    contract: { level: 4, strain: "S" },
    trump: "S"
  });

  assert.equal(result.card.id, "QH");
  assert.equal(result.ruleId, "thirdHandHighCheapest");
});

test("chooseCardPlay keeps third hand low when partner is already winning", () => {
  const result = rules.chooseCardPlay({
    hand: hand("KH", "2H", "AS"),
    currentTrick: [
      { seat: "North", card: card("AH") },
      { seat: "East", card: card("4H") }
    ],
    seat: "South",
    declarer: "East",
    dummy: "West",
    contract: { level: 4, strain: "S" },
    trump: "S"
  });

  assert.equal(result.card.id, "2H");
  assert.equal(result.ruleId, "partnerWinningLow");
});

test("chooseCardPlay does not apply second hand low to the declarer side", () => {
  const result = rules.chooseCardPlay({
    hand: hand("9H", "2H", "AS"),
    currentTrick: [{ seat: "East", card: card("7H") }],
    seat: "North",
    declarer: "South",
    dummy: "North",
    dummyHand: hand("9H", "2H", "AS"),
    contract: { level: 4, strain: "S" },
    trump: "S"
  });

  assert.equal(result.card.id, "9H");
  assert.equal(result.ruleId, "cheapestWinner");
});

test("chooseCardPlay plays low when partner is already winning", () => {
  const result = rules.chooseCardPlay({
    hand: [card("KH"), card("2H"), card("2S")],
    currentTrick: [{ seat: "North", card: card("AH") }],
    seat: "South",
    trump: "S"
  });

  assert.equal(result.card.id, "2H");
  assert.equal(result.ruleId, "partnerWinningLow");
});

test("chooseCardPlay avoids overtaking partner with a trump when discarding is possible", () => {
  const result = rules.chooseCardPlay({
    hand: [card("2S"), card("3C")],
    currentTrick: [{ seat: "North", card: card("AH") }],
    seat: "South",
    trump: "S"
  });

  assert.equal(result.card.id, "3C");
  assert.equal(result.ruleId, "partnerWinningLow");
});

test("chooseCardPlay chooses the cheapest current winner", () => {
  const result = rules.chooseCardPlay({
    hand: [card("AH"), card("9H"), card("2H")],
    currentTrick: [{ seat: "West", card: card("7H") }],
    seat: "North",
    trump: null
  });

  assert.equal(result.card.id, "9H");
  assert.equal(result.ruleId, "cheapestWinner");
});

test("chooseCardPlay follows suit low when the hand cannot win", () => {
  const result = rules.chooseCardPlay({
    hand: [card("JH"), card("2H"), card("AS")],
    currentTrick: [{ seat: "West", card: card("QH") }],
    seat: "North",
    trump: null
  });

  assert.equal(result.card.id, "2H");
  assert.equal(result.ruleId, "lowestFollow");
});

test("chooseCardPlay trumps cheaply when void and able to win", () => {
  const result = rules.chooseCardPlay({
    hand: [card("2S"), card("AD")],
    currentTrick: [{ seat: "West", card: card("QH") }],
    seat: "North",
    trump: "S"
  });

  assert.equal(result.card.id, "2S");
  assert.equal(result.ruleId, "cheapestWinner");
});

test("chooseCardPlay discards low when void and unable to win", () => {
  const result = rules.chooseCardPlay({
    hand: [card("2C"), card("3D"), card("AS")],
    currentTrick: [{ seat: "West", card: card("QH") }],
    seat: "North",
    trump: null
  });

  assert.equal(result.card.id, "2C");
  assert.equal(result.ruleId, "lowestDiscard");
});

test("chooseCardPlay keeps the strongest longest-suit lead heuristic as a named result", () => {
  const result = rules.chooseCardPlay({
    hand: [card("2C"), card("AC"), card("3H"), card("4H"), card("5H")],
    currentTrick: [],
    seat: "West",
    trump: null
  });

  assert.equal(result.card.id, "5H");
  assert.equal(result.ruleId, "longestSuitLead");
  assert.equal(result.confidence, "uncertain");
});

test("chooseCardPlay develops a long notrump suit from declarer hand", () => {
  const result = rules.chooseCardPlay({
    hand: hand("KC", "QC", "JC", "4C", "2C", "AS"),
    partnerHand: hand("8C", "7C", "3D"),
    currentTrick: [],
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract: { level: 3, strain: "NT" },
    trump: null
  });

  assert.equal(result.card.id, "KC");
  assert.equal(result.ruleId, "developLongSuit");
  assert.equal(result.confidence, "uncertain");
  assert.equal(result.suit, "C");
  assert.equal(result.missingStopper, "A");
});

test("chooseCardPlay leads toward partner's long notrump suit development candidate", () => {
  const result = rules.chooseCardPlay({
    hand: hand("2C", "AD", "2D"),
    partnerHand: hand("KC", "QC", "JC", "4C", "3C"),
    currentTrick: [],
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract: { level: 3, strain: "NT" },
    trump: null
  });

  assert.equal(result.card.id, "2C");
  assert.equal(result.ruleId, "developLongSuit");
  assert.equal(result.sourceSeat, "North");
});

test("chooseCardPlay does not apply long-suit development in trump contracts yet", () => {
  const result = rules.chooseCardPlay({
    hand: hand("KC", "QC", "JC", "4C", "2C", "AS"),
    partnerHand: hand("8C", "7C", "3D"),
    currentTrick: [],
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract: { level: 4, strain: "S" },
    trump: "S"
  });

  assert.equal(result.card.id, "KC");
  assert.equal(result.ruleId, "longestSuitLead");
});

test("chooseCardPlay uses notrump lead rules without declarer-side partner context", () => {
  const result = rules.chooseCardPlay({
    hand: hand("KC", "QC", "JC", "4C", "2C", "AS"),
    currentTrick: [],
    seat: "South",
    contract: { level: 3, strain: "NT" },
    trump: null
  });

  assert.equal(result.card.id, "KC");
  assert.equal(result.ruleId, "notrumpSequenceLead");
});

test("chooseCardPlay leads low toward an AQ notrump finesse", () => {
  const result = rules.chooseCardPlay({
    hand: hand("2H", "3H", "AD"),
    partnerHand: hand("AH", "QH", "7H"),
    currentTrick: [],
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract: { level: 3, strain: "NT" },
    trump: null
  });

  assert.equal(result.card.id, "2H");
  assert.equal(result.ruleId, "finesseTowardHonor");
  assert.equal(result.confidence, "uncertain");
  assert.equal(result.suit, "H");
  assert.equal(result.finesseRank, "Q");
  assert.equal(result.missingHonor, "K");
  assert.equal(result.entryType, "sameSuit");
  assert.equal(result.entryRank, "A");
});

test("chooseCardPlay leads low toward an AKJ notrump finesse against the queen", () => {
  const result = rules.chooseCardPlay({
    hand: hand("2S", "3S", "AC"),
    partnerHand: hand("AS", "KS", "JS"),
    currentTrick: [],
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract: { level: 3, strain: "NT" },
    trump: null
  });

  assert.equal(result.card.id, "2S");
  assert.equal(result.ruleId, "finesseTowardHonor");
  assert.equal(result.finesseRank, "J");
  assert.equal(result.missingHonor, "Q");
  assert.equal(result.entryType, "sameSuit");
  assert.equal(result.entryRank, "A");
});

test("chooseCardPlay leads low toward the jack in the KJ double-finesse example", () => {
  const result = rules.chooseCardPlay({
    hand: hand("2H", "3H", "7H", "AD"),
    partnerHand: hand("KH", "JH", "8H"),
    currentTrick: [],
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract: { level: 3, strain: "NT" },
    trump: null
  });

  assert.equal(result.card.id, "2H");
  assert.equal(result.ruleId, "doubleFinesseTowardHonor");
  assert.equal(result.confidence, "uncertain");
  assert.equal(result.suit, "H");
  assert.equal(result.finesseRank, "J");
  assert.deepEqual(result.missingHonors, ["A", "Q"]);
  assert.equal(result.entryType, "sameSuit");
  assert.equal(result.entryRank, "K");
});

test("chooseCardPlay leads low toward the ten in the AJT double-finesse example", () => {
  const result = rules.chooseCardPlay({
    hand: hand("2D", "3D", "AS"),
    partnerHand: hand("AD", "JD", "TD"),
    currentTrick: [],
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract: { level: 3, strain: "NT" },
    trump: null
  });

  assert.equal(result.card.id, "2D");
  assert.equal(result.ruleId, "doubleFinesseTowardHonor");
  assert.equal(result.finesseRank, "T");
  assert.deepEqual(result.missingHonors, ["K", "Q"]);
  assert.equal(result.entryType, "sameSuit");
  assert.equal(result.entryRank, "A");
});

test("chooseCardPlay leads low toward the ten in the KQT double-finesse example", () => {
  const result = rules.chooseCardPlay({
    hand: hand("2C", "3C", "AS"),
    partnerHand: hand("KC", "QC", "TC"),
    currentTrick: [],
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract: { level: 3, strain: "NT" },
    trump: null
  });

  assert.equal(result.card.id, "2C");
  assert.equal(result.ruleId, "doubleFinesseTowardHonor");
  assert.equal(result.finesseRank, "T");
  assert.deepEqual(result.missingHonors, ["A", "J"]);
  assert.equal(result.entryType, "sameSuit");
  assert.equal(result.entryRank, "K");
});

test("chooseCardPlay leads low toward the ten in the QJT double-finesse example", () => {
  const result = rules.chooseCardPlay({
    hand: hand("2S", "3S", "AC"),
    partnerHand: hand("QS", "JS", "TS"),
    currentTrick: [],
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract: { level: 3, strain: "NT" },
    trump: null
  });

  assert.equal(result.card.id, "2S");
  assert.equal(result.ruleId, "doubleFinesseTowardHonor");
  assert.equal(result.finesseRank, "T");
  assert.deepEqual(result.missingHonors, ["A", "K"]);
  assert.equal(result.entryType, "sameSuit");
  assert.equal(result.entryRank, "Q");
});

test("chooseCardPlay allows a one-card finesse when the honor hand has a side entry", () => {
  const result = rules.chooseCardPlay({
    hand: hand("2H", "AD"),
    partnerHand: hand("AH", "QH", "7H", "AC"),
    currentTrick: [],
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract: { level: 3, strain: "NT" },
    trump: null
  });

  assert.equal(result.card.id, "2H");
  assert.equal(result.ruleId, "finesseTowardHonor");
  assert.equal(result.entryType, "sideAce");
  assert.equal(result.entrySuit, "C");
});

test("chooseCardPlay skips a finesse when the honor hand has no later entry", () => {
  const result = rules.chooseCardPlay({
    hand: hand("2H", "AD"),
    partnerHand: hand("AH", "QH", "7H"),
    currentTrick: [],
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract: { level: 3, strain: "NT" },
    trump: null
  });

  assert.equal(result.card.id, "AD");
  assert.equal(result.ruleId, "longestSuitLead");
});

test("chooseCardPlay does not lead a finesse from the honor side", () => {
  const result = rules.chooseCardPlay({
    hand: hand("AH", "QH", "2D"),
    partnerHand: hand("2H", "3H"),
    currentTrick: [],
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract: { level: 3, strain: "NT" },
    trump: null
  });

  assert.equal(result.card.id, "AH");
  assert.equal(result.ruleId, "longestSuitLead");
});

test("chooseCardPlay does not lead a finesse in trump contracts yet", () => {
  const result = rules.chooseCardPlay({
    hand: hand("2H", "AD"),
    partnerHand: hand("AH", "QH", "7H"),
    currentTrick: [],
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract: { level: 4, strain: "S" },
    trump: "S"
  });

  assert.equal(result.card.id, "AD");
  assert.equal(result.ruleId, "longestSuitLead");
});

let failed = 0;

for (const { name, fn } of tests) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL ${name}`);
    console.error(error);
  }
}

if (failed) {
  console.error(`${failed} test${failed === 1 ? "" : "s"} failed`);
  process.exit(1);
}

console.log(`${tests.length} tests passed`);

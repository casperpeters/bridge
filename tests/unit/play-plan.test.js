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

test("createPlayPlan updates notrump development when the missing stopper is in the current trick", () => {
  const plan = rules.createPlayPlan({
    declarerHand: hand("AS", "KS", "AD", "2C", "2D"),
    dummyHand: hand("KC", "QC", "JC", "4C", "3C", "AH"),
    contract: { level: 3, strain: "NT" },
    declarer: "South",
    dummy: "North",
    currentTrick: [{ seat: "West", card: card("AC") }]
  });

  assert.equal(plan.sureWinners.bySuit.C, 3);
  assert.equal(plan.sureWinners.total, 7);
  assert.ok(!plan.priorities.some((item) => item.kind === "developLongSuit" && item.suit === "C"));
});

test("createPlayPlan updates notrump development after the missing stopper has been played", () => {
  const plan = rules.createPlayPlan({
    declarerHand: hand("AS", "KS", "AD", "2C", "2D"),
    dummyHand: hand("KC", "QC", "JC", "4C", "3C", "AH"),
    contract: { level: 3, strain: "NT" },
    declarer: "South",
    dummy: "North",
    trickHistory: [{
      number: 1,
      winner: "West",
      cards: [
        { seat: "West", card: card("AC") },
        { seat: "North", card: card("3C") },
        { seat: "East", card: card("8C") },
        { seat: "South", card: card("2C") }
      ]
    }]
  });

  assert.equal(plan.sureWinners.bySuit.C, 3);
  assert.ok(!plan.priorities.some((item) => item.kind === "developLongSuit" && item.suit === "C"));
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

test("createPlayPlan adds a notrump hold-up with a lone ace stopper and work to do", () => {
  const plan = rules.createPlayPlan({
    declarerHand: hand("AH", "2H", "AS", "KS", "AD", "2C"),
    dummyHand: hand("4H", "KC", "QC", "JC", "TC", "3C"),
    contract: { level: 3, strain: "NT" },
    declarer: "South",
    dummy: "North",
    currentTrick: [{ seat: "West", card: card("KH") }]
  });

  const priority = plan.priorities.find((item) => item.kind === "holdUpStopper");
  assert.ok(priority);
  assert.equal(priority.suit, "H");
  assert.equal(priority.stopperSeat, "South");
  assert.equal(priority.stopperRank, "A");
  assert.equal(priority.duckRank, "2");
});

test("createPlayPlan skips notrump hold-up when the safe conditions are missing", () => {
  const enoughWinners = rules.createPlayPlan({
    declarerHand: hand("AH", "2H", "AS", "KS", "QS", "JS", "TS", "AD", "KD"),
    dummyHand: hand("4H", "AC", "KC"),
    contract: { level: 3, strain: "NT" },
    declarer: "South",
    dummy: "North",
    currentTrick: [{ seat: "West", card: card("KH") }]
  });
  assert.ok(!enoughWinners.priorities.some((item) => item.kind === "holdUpStopper"));

  const noDuckCard = rules.createPlayPlan({
    declarerHand: hand("AH", "AS", "KS", "AD", "2C"),
    dummyHand: hand("KC", "QC", "JC", "TC", "3C"),
    contract: { level: 3, strain: "NT" },
    declarer: "South",
    dummy: "North",
    currentTrick: [{ seat: "West", card: card("KH") }]
  });
  assert.ok(!noDuckCard.priorities.some((item) => item.kind === "holdUpStopper"));

  const declarerLed = rules.createPlayPlan({
    declarerHand: hand("AH", "2H", "AS", "KS", "AD", "2C"),
    dummyHand: hand("4H", "KC", "QC", "JC", "TC", "3C"),
    contract: { level: 3, strain: "NT" },
    declarer: "South",
    dummy: "North",
    currentTrick: [{ seat: "South", card: card("2H") }]
  });
  assert.ok(!declarerLed.priorities.some((item) => item.kind === "holdUpStopper"));
});

test("createPlayPlan adds a repeat finesse only after the first finesse wins", () => {
  const successfulHistory = [{
    number: 1,
    winner: "North",
    cards: [
      { seat: "South", card: card("4H") },
      { seat: "West", card: card("5H") },
      { seat: "North", card: card("QH") },
      { seat: "East", card: card("6H") }
    ]
  }];
  const plan = rules.createPlayPlan({
    declarerHand: hand("3H", "2H", "AD"),
    dummyHand: hand("AH", "JH", "7H", "AC"),
    contract: { level: 3, strain: "NT" },
    declarer: "South",
    dummy: "North",
    trickHistory: successfulHistory
  });

  const priority = plan.priorities.find((item) => item.kind === "repeatFinesse");
  assert.ok(priority);
  assert.equal(priority.suit, "H");
  assert.equal(priority.leadSeat, "South");
  assert.equal(priority.targetSeat, "North");
  assert.equal(priority.finesseRank, "J");
  assert.equal(priority.missingHonor, "K");

  const lostFirstFinesse = rules.createPlayPlan({
    declarerHand: hand("3H", "2H", "AD"),
    dummyHand: hand("AH", "JH", "7H", "AC"),
    contract: { level: 3, strain: "NT" },
    declarer: "South",
    dummy: "North",
    trickHistory: [{ ...successfulHistory[0], winner: "West" }]
  });
  assert.ok(!lostFirstFinesse.priorities.some((item) => item.kind === "repeatFinesse"));

  const missingHonorPlayed = rules.createPlayPlan({
    declarerHand: hand("3H", "2H", "AD"),
    dummyHand: hand("AH", "JH", "7H", "AC"),
    contract: { level: 3, strain: "NT" },
    declarer: "South",
    dummy: "North",
    trickHistory: [
      successfulHistory[0],
      {
        number: 2,
        winner: "East",
        cards: [
          { seat: "North", card: card("7H") },
          { seat: "East", card: card("KH") }
        ]
      }
    ]
  });
  assert.ok(!missingHonorPlayed.priorities.some((item) => item.kind === "repeatFinesse"));
});

test("createPlayPlan chooses two-way finesse direction by entry, length, then declarer", () => {
  const entryPlan = rules.createPlayPlan({
    declarerHand: hand("AH", "JH", "2H", "KD"),
    dummyHand: hand("KH", "TH", "3H", "AC"),
    contract: { level: 3, strain: "NT" },
    declarer: "South",
    dummy: "North"
  });
  const entryPriority = entryPlan.priorities.find((item) => item.kind === "twoWayFinesse");
  assert.ok(entryPriority);
  assert.equal(entryPriority.targetSeat, "North");
  assert.equal(entryPriority.leadSeat, "South");
  assert.equal(entryPriority.finesseRank, "T");
  assert.equal(entryPriority.entrySuit, "C");

  const tiedPlan = rules.createPlayPlan({
    declarerHand: hand("AH", "JH", "2H", "KD"),
    dummyHand: hand("KH", "TH", "3H", "9D"),
    contract: { level: 3, strain: "NT" },
    declarer: "South",
    dummy: "North"
  });
  const tiedPriority = tiedPlan.priorities.find((item) => item.kind === "twoWayFinesse");
  assert.ok(tiedPriority);
  assert.equal(tiedPriority.targetSeat, "South");
  assert.equal(tiedPriority.leadSeat, "North");
  assert.equal(tiedPriority.finesseRank, "J");
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
  assert.equal(priority.roundLimit, null);
  assert.equal(priority.trumpControl.trumpLength, 8);
});

test("createPlayPlan finds a dummy ruff before drawing all trumps", () => {
  const plan = rules.createPlayPlan({
    declarerHand: hand("AS", "KS", "QS", "9S", "8S", "JH", "TH", "8H", "3H", "AD", "KD", "AC", "KC"),
    dummyHand: hand("JS", "TS", "7S", "2D", "3D", "4D", "QC", "JC", "TC", "9C"),
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

test("createPlayPlan skips a dummy ruff when dummy is not the shorter trump hand", () => {
  const plan = rules.createPlayPlan({
    declarerHand: hand("AS", "KS", "QS", "2S", "JH", "TH", "8H", "3H", "AD", "KD", "AC", "KC"),
    dummyHand: hand("JS", "TS", "9S", "8S", "7S", "2D", "3D", "4D", "QC", "JC", "TC", "9C"),
    contract: { level: 4, strain: "S" },
    declarer: "South",
    dummy: "North"
  });

  assert.ok(!plan.priorities.some((item) => item.kind === "ruffShortSuit"));
  assert.ok(plan.priorities.some((item) => item.kind === "drawTrumps"));
});

test("createPlayPlan limits trump drawing before a planned ruff with vulnerable trump control", () => {
  const plan = rules.createPlayPlan({
    declarerHand: hand("KS", "QS", "9S", "8S", "7S", "JH", "TH", "8H", "3H", "AD", "KD", "AC", "KC"),
    dummyHand: hand("JS", "TS", "2D", "3D", "4D", "QC", "JC", "TC", "9C"),
    contract: { level: 4, strain: "S" },
    declarer: "South",
    dummy: "North"
  });

  const ruff = plan.priorities.find((item) => item.kind === "ruffShortSuit");
  const trumps = plan.priorities.find((item) => item.kind === "drawTrumps");
  assert.ok(ruff);
  assert.equal(trumps.timing, "limitedBeforeRuff");
  assert.equal(trumps.roundLimit, 1);
  assert.equal(trumps.playedTrumpRounds, 0);
  assert.equal(trumps.preserveSeat, "North");
  assert.equal(trumps.preserveTrumpCount, 1);
  assert.deepEqual(trumps.trumpControl.missingHonors, ["A"]);
});

test("createPlayPlan finds a long side suit that can be established by ruffing", () => {
  const plan = rules.createPlayPlan({
    declarerHand: hand("AS", "KS", "QS", "2S", "KH", "QH", "JH", "TH", "9H", "8H", "AD", "5D", "2C"),
    dummyHand: hand("JS", "TS", "9S", "2H", "2D", "4C", "3C"),
    contract: { level: 4, strain: "S" },
    declarer: "South",
    dummy: "North"
  });

  const priority = plan.priorities.find((item) => item.kind === "establishLongSuitByRuffing");
  const trumps = plan.priorities.find((item) => item.kind === "drawTrumps");
  assert.ok(priority);
  assert.equal(priority.suit, "H");
  assert.equal(priority.longSeat, "South");
  assert.equal(priority.shortSeat, "North");
  assert.equal(priority.longLength, 6);
  assert.equal(priority.shortLength, 1);
  assert.equal(priority.estimatedRuffsNeeded, 2);
  assert.equal(priority.entrySuit, "D");
  assert.equal(priority.entryRank, "A");
  assert.equal(priority.entryCount, 1);
  assert.equal(priority.availableRuffs, 3);
  assert.equal(priority.maxUsefulRuffs, 2);
  assert.equal(trumps.timing, "afterLongSuitRuff");
  assert.equal(trumps.delayReason, "longSuitRuffDevelopment");
});

test("createPlayPlan rejects long side-suit ruffing when entries or ruffs are too short", () => {
  const plan = rules.createPlayPlan({
    declarerHand: hand("AS", "KS", "QS", "2S", "KH", "QH", "JH", "TH", "9H", "AD", "5D", "2C"),
    dummyHand: hand("JS", "TS", "9S", "2H", "2D", "4C", "3C"),
    contract: { level: 4, strain: "S" },
    declarer: "South",
    dummy: "North"
  });

  assert.ok(!plan.priorities.some((item) => item.kind === "establishLongSuitByRuffing"));
});

test("createPlayPlan does not use long-suit ruffing development in notrump", () => {
  const plan = rules.createPlayPlan({
    declarerHand: hand("AS", "KS", "QS", "2S", "KH", "QH", "JH", "TH", "9H", "8H", "AD", "5D", "2C"),
    dummyHand: hand("JS", "TS", "9S", "2H", "2D", "4C", "3C"),
    contract: { level: 3, strain: "NT" },
    declarer: "South",
    dummy: "North"
  });

  assert.ok(!plan.priorities.some((item) => item.kind === "establishLongSuitByRuffing"));
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

test("createPlayPlan delays trumps to discard an attacked-suit loser on side winners", () => {
  const plan = rules.createPlayPlan({
    declarerHand: hand("AS", "KS", "QS", "JS", "9S", "2H", "3H", "KD", "QD", "JD", "AC", "6C", "4C"),
    dummyHand: hand("TS", "8S", "AH", "KH", "QH", "4D", "3D", "2D", "7C", "5C", "2C"),
    contract: { level: 4, strain: "S" },
    declarer: "South",
    dummy: "North",
    currentTrick: [{ seat: "West", card: card("JC") }]
  });

  const discard = plan.priorities.find((item) => item.kind === "discardLoserOnWinner");
  const trumps = plan.priorities.find((item) => item.kind === "drawTrumps");
  assert.ok(discard);
  assert.equal(discard.suit, "H");
  assert.equal(discard.attackedSuit, "C");
  assert.equal(discard.discardSeat, "South");
  assert.equal(discard.firstSeat, "North");
  assert.equal(discard.timing, "urgentBeforeTrumps");
  assert.equal(plan.priorities[0].kind, "discardLoserOnWinner");
  assert.equal(trumps.timing, "afterUrgentDiscard");
  assert.equal(trumps.delayReason, "discardLoserOnWinner");
});

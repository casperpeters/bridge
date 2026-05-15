const { assert, rules, test, card, hand } = require("./harness.js");

test("visible notrump uitspelen proves a visible top-winner runout", () => {
  const analysis = rules.analyzeVisibleNotrumpUitspelen({
    hands: {
      North: hand("2C", "3C"),
      East: hand("AH", "AC"),
      South: hand("2H", "2C"),
      West: hand("5D", "6D")
    },
    visibleSeats: ["South", "East"],
    contract: rules.Bid(3, "NT"),
    currentTurn: "South",
    trickHistory: [],
    currentTrick: []
  });

  assert.equal(analysis.available, true);
  assert.equal(analysis.ruleId, "deterministicUitspelen.visibleNotrumpTopWinners");
  assert.equal(analysis.remainingTricks, 2);
  assert.deepEqual(analysis.winningSeats, ["East", "East"]);
  assert.deepEqual(analysis.tricksByTeam, { NS: 0, EW: 2 });
  assert.equal(analysis.sequence[0].winnerSeat, "East");
  assert.equal(analysis.sequence[1].winnerSeat, "East");
});

test("visible notrump uitspelen fails closed when a higher hidden card may exist", () => {
  const analysis = rules.analyzeVisibleNotrumpUitspelen({
    hands: {
      North: hand("2C"),
      East: hand("3D"),
      South: hand("KS"),
      West: hand("4H")
    },
    visibleSeats: ["South"],
    contract: rules.Bid(3, "NT"),
    currentTurn: "South",
    trickHistory: [],
    currentTrick: []
  });

  assert.deepEqual(analysis, {
    available: false,
    reason: "hiddenHigherCard"
  });
});

test("visible notrump uitspelen fails closed when the search node budget is exhausted", () => {
  const analysis = rules.analyzeVisibleNotrumpUitspelen({
    hands: {
      North: hand("2C"),
      East: hand("3D"),
      South: hand("AS"),
      West: hand("4H")
    },
    visibleSeats: ["South"],
    contract: rules.Bid(3, "NT"),
    currentTurn: "South",
    trickHistory: [],
    currentTrick: [],
    nodeBudget: 1
  });

  assert.deepEqual(analysis, {
    available: false,
    reason: "searchNodeBudgetExhausted",
    nodeBudget: {
      limit: 1,
      used: 1
    }
  });
});

test("visible notrump uitspelen accepts a visible winner when higher cards are already played", () => {
  const analysis = rules.analyzeVisibleNotrumpUitspelen({
    hands: {
      North: hand("2C"),
      East: hand("3D"),
      South: hand("KS"),
      West: hand("4H")
    },
    visibleSeats: ["South"],
    contract: rules.Bid(3, "NT"),
    currentTurn: "South",
    trickHistory: [{
      number: 1,
      winner: "East",
      cards: [
        { seat: "East", card: card("AS") },
        { seat: "South", card: card("2S") },
        { seat: "West", card: card("3S") },
        { seat: "North", card: card("4S") }
      ]
    }],
    currentTrick: []
  });

  assert.equal(analysis.available, true);
  assert.deepEqual(analysis.winningSeats, ["South"]);
});

test("visible notrump uitspelen uses observed renonces to exclude hidden follow-suit winners", () => {
  const analysis = rules.analyzeVisibleNotrumpUitspelen({
    hands: {
      North: [],
      East: hand("3H"),
      South: hand("KS"),
      West: []
    },
    visibleSeats: ["South"],
    contract: rules.Bid(3, "NT"),
    currentTurn: "South",
    trickHistory: [{
      number: 1,
      winner: "South",
      cards: [
        { seat: "South", card: card("2S") },
        { seat: "West", card: card("2C") },
        { seat: "North", card: card("3C") },
        { seat: "East", card: card("2H") }
      ]
    }],
    currentTrick: []
  });

  assert.equal(analysis.available, true);
  assert.deepEqual(analysis.winningSeats, ["South"]);
});

test("visible notrump uitspelen fails closed when hidden follow-suit facts are insufficient", () => {
  const analysis = rules.analyzeVisibleNotrumpUitspelen({
    hands: {
      North: [],
      East: hand("3H"),
      South: hand("KS"),
      West: []
    },
    visibleSeats: ["South"],
    contract: rules.Bid(3, "NT"),
    currentTurn: "South",
    trickHistory: [],
    currentTrick: []
  });

  assert.deepEqual(analysis, {
    available: false,
    reason: "hiddenHigherCard"
  });
});

test("visible notrump uitspelen uses public remaining hand sizes without hidden ranks", () => {
  const analysis = rules.analyzeVisibleNotrumpUitspelen({
    hands: {
      North: [],
      East: [],
      South: hand("KS"),
      West: []
    },
    visibleSeats: ["South"],
    contract: rules.Bid(3, "NT"),
    currentTurn: "South",
    trickHistory: [],
    currentTrick: []
  });

  assert.equal(analysis.available, true);
  assert.deepEqual(analysis.winningSeats, ["South"]);
});

test("visible notrump uitspelen fails when proven branches change the exact winner seat", () => {
  const analysis = rules.analyzeVisibleNotrumpUitspelen({
    hands: {
      North: hand("KS", "QS"),
      East: hand("3D", "4D"),
      South: hand("AS", "2S"),
      West: hand("5D", "6D")
    },
    visibleSeats: ["South", "North"],
    contract: rules.Bid(3, "NT"),
    declarer: "South",
    currentTurn: "South",
    trickHistory: [],
    currentTrick: []
  });

  assert.deepEqual(analysis, {
    available: false,
    reason: "ambiguousWinnerSeat"
  });
});

test("visible notrump uitspelen accepts equivalent legal winner choices with the same exact sequence", () => {
  const analysis = rules.analyzeVisibleNotrumpUitspelen({
    hands: {
      North: hand("2S", "3S"),
      East: hand("2C", "3C"),
      South: hand("AS", "KS"),
      West: hand("4D", "5D")
    },
    visibleSeats: ["South", "North"],
    contract: rules.Bid(3, "NT"),
    declarer: "South",
    currentTurn: "South",
    trickHistory: [],
    currentTrick: []
  });

  assert.equal(analysis.available, true);
  assert.deepEqual(analysis.winningSeats, ["South", "South"]);
  assert.deepEqual(analysis.tricksByTeam, { NS: 2, EW: 0 });
});

test("visible notrump uitspelen blocks when an equivalent current winner changes a future exact winner", () => {
  const analysis = rules.analyzeVisibleNotrumpUitspelen({
    hands: {
      North: hand("KS", "JS"),
      East: hand("2C", "3C"),
      South: hand("AS", "QS"),
      West: hand("4D", "5D")
    },
    visibleSeats: ["South", "North"],
    contract: rules.Bid(3, "NT"),
    declarer: "South",
    currentTurn: "South",
    trickHistory: [],
    currentTrick: []
  });

  assert.deepEqual(analysis, {
    available: false,
    reason: "ambiguousWinnerSeat"
  });
});

test("visible notrump uitspelen does not use North as visible proof when South defends", () => {
  const analysis = rules.analyzeVisibleNotrumpUitspelen({
    hands: {
      North: hand("AH"),
      East: hand("3C"),
      South: hand("2H"),
      West: hand("4D")
    },
    visibleSeats: ["South", "North"],
    contract: rules.Bid(3, "NT"),
    declarer: "East",
    currentTurn: "South",
    trickHistory: [],
    currentTrick: []
  });

  assert.deepEqual(analysis, {
    available: false,
    reason: "hiddenHigherCard"
  });
});

test("visible suit uitspelen blocks a side-suit winner while a hidden trump ruff is possible", () => {
  const analysis = rules.analyzeVisibleUitspelen({
    hands: {
      North: hand("2C"),
      East: hand("3D"),
      South: hand("AH"),
      West: hand("4D")
    },
    visibleSeats: ["South", "North"],
    contract: rules.Bid(4, "S"),
    declarer: "South",
    currentTurn: "South",
    trickHistory: [],
    currentTrick: []
  });

  assert.deepEqual(analysis, {
    available: false,
    reason: "hiddenTrumpRuff"
  });
});

test("visible suit uitspelen accepts a side-suit ending when public facts prove no ruff", () => {
  const analysis = rules.analyzeVisibleUitspelen({
    hands: {
      North: hand("2C"),
      East: hand("3D"),
      South: hand("AH"),
      West: hand("4D")
    },
    visibleSeats: ["South", "North"],
    contract: rules.Bid(4, "S"),
    declarer: "South",
    currentTurn: "South",
    trickHistory: [
      {
        number: 1,
        winner: "South",
        cards: [
          { seat: "South", card: card("2H") },
          { seat: "West", card: card("3C") },
          { seat: "North", card: card("3H") },
          { seat: "East", card: card("4H") }
        ]
      },
      {
        number: 2,
        winner: "South",
        cards: rules.rankOrder.map((rank, index) => ({
          seat: rules.seats[index % rules.seats.length],
          card: card(`${rank}S`)
        }))
      }
    ],
    currentTrick: []
  });

  assert.equal(analysis.available, true);
  assert.equal(analysis.ruleId, "deterministicUitspelen.visibleSuitTopWinnersNoRuff");
  assert.equal(analysis.reason, "visibleSuitTopWinnersNoRuff");
  assert.equal(analysis.trump, "S");
  assert.deepEqual(analysis.winningSeats, ["South"]);
  assert.deepEqual(analysis.tricksByTeam, { NS: 1, EW: 0 });
});

test("visible notrump uitspelen is exposed through the public rules facade", () => {
  assert.equal(typeof rules.analyzeVisibleUitspelen, "function");
  assert.equal(typeof rules.analyzeVisibleNotrumpUitspelen, "function");

  const analysis = rules.analyzeVisibleNotrumpUitspelen({
    hands: { South: hand("AS") },
    visibleSeats: ["South"],
    contract: rules.Bid(1, "S"),
    currentTurn: "South"
  });

  assert.equal(analysis.available, false);
  assert.equal(analysis.reason, "notNotrump");
});

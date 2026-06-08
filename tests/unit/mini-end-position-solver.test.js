const { assert, test } = require("./harness.js");
const solver = require("../../rules/mini-end-position-solver.js");

test("mini end-position solver supports one-card notrump positions", () => {
  const result = solver.solveMiniEndPosition({
    trump: null,
    nextToPlay: "South",
    declarer: "South",
    dummy: "North",
    hands: {
      North: ["QS"],
      East: ["JS"],
      South: ["AS"],
      West: ["KS"]
    }
  });

  assert.equal(result.maximum, 1);
  assert.deepEqual(result.optimalStartCards, ["AS"]);
  assert.equal(result.resultsByStartCard.AS.southTricks, 1);
  assert.equal(result.tricks.length, 1);
  assert.equal(result.tricks[0].winnerSeat, "South");
});

test("mini end-position solver accepts multiple optimal South declarer starts", () => {
  const result = solver.solveMiniEndPosition({
    trump: null,
    nextToPlay: "South",
    declarer: "South",
    dummy: "North",
    hands: {
      North: ["QS", "QH"],
      East: ["JS", "JH"],
      South: ["AS", "AH"],
      West: ["KS", "KH"]
    }
  });

  assert.equal(result.maximum, 2);
  assert.deepEqual(new Set(result.optimalStartCards), new Set(["AS", "AH"]));
  assert.equal(result.resultsByStartCard.AS.southTricks, 2);
  assert.equal(result.resultsByStartCard.AH.southTricks, 2);
  assert.equal(result.tricks.filter((trick) => trick.southWins).length, 2);
});

test("mini end-position solver marks non-optimal South defender starts", () => {
  const result = solver.solveMiniEndPosition({
    trump: null,
    nextToPlay: "South",
    declarer: "East",
    dummy: "West",
    chosenStartCardId: "9H",
    hands: {
      North: ["3C", "4C", "5S"],
      East: ["AS", "2D", "9C"],
      South: ["2H", "9H", "3S"],
      West: ["JD", "5H", "6D"]
    }
  });

  assert.equal(result.maximum, 2);
  assert.deepEqual(result.optimalStartCards, ["9H"]);
  assert.equal(result.resultsByStartCard["9H"].southTricks, 2);
  assert.equal(result.resultsByStartCard["3S"].southTricks, 0);
  assert.equal(result.resultsByStartCard["2H"].optimal, false);
  assert.equal(result.chosenStartCardId, "9H");
  assert.equal(result.chosenIsOptimal, true);
  assert.equal(result.line[0].cardId, "9H");
  assert.equal(result.tricks.length, 3);
});

test("mini end-position solver supports trump and returns a concrete optimal line", () => {
  const hands = {
    North: ["3C", "4C", "5S"],
    East: ["AS", "2D", "9C"],
    South: ["2H", "9H", "3S"],
    West: ["JD", "5H", "6D"]
  };
  const notrump = solver.solveMiniEndPosition({
    trump: null,
    nextToPlay: "South",
    hands
  });
  const result = solver.solveMiniEndPosition({
    trump: "S",
    nextToPlay: "South",
    declarer: "East",
    dummy: "West",
    chosenStartCardId: "9H",
    hands
  });

  assert.equal(result.trump, "S");
  assert.equal(notrump.maximum, 2);
  assert.equal(result.maximum, 1);
  assert.deepEqual(new Set(result.optimalStartCards), new Set(["9H", "2H"]));
  assert.equal(result.resultsByStartCard["9H"].southTricks, 1);
  assert.equal(result.resultsByStartCard["2H"].southTricks, 1);
  assert.equal(result.resultsByStartCard["3S"].southTricks, 0);
  assert.equal(result.line[0].cardId, "9H");
  assert.equal(result.tricks.length, 3);
  assert.equal(result.tricks[0].leadSuit, "H");
  assert.equal(result.tricks[0].winnerSeat, "North");
  assert.equal(result.tricks[0].plays[2].cardId, "5S");
});

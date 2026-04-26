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

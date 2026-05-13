const fs = require("node:fs");
const path = require("node:path");
const playPlan = require("../../rules/play-plan.js");
const { assert, test, card, hand } = require("./harness.js");

const repoRoot = path.resolve(__dirname, "..", "..");

function readRepoFile(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

test("endgame runout search lives outside the play-plan common helper module", () => {
  const commonSource = readRepoFile("rules/play-plan/common.js");
  const endgameSource = readRepoFile("rules/play-plan/endgame-runout.js");

  assert.doesNotMatch(commonSource, /function\s+endgameRunoutPriority/);
  assert.doesNotMatch(commonSource, /function\s+searchVisibleRunout/);
  assert.doesNotMatch(commonSource, /function\s+applyRunoutCandidate/);
  assert.match(endgameSource, /function\s+endgameRunoutPriority/);
  assert.match(endgameSource, /function\s+searchVisibleRunout/);
  assert.match(endgameSource, /function\s+applyRunoutCandidate/);
});

test("endgame runout remains available through the play-plan facade", () => {
  assert.equal(typeof playPlan.endgameRunoutPriority, "function");

  const priority = playPlan.endgameRunoutPriority({
    declarerHand: hand("AC"),
    dummyHand: hand("2D", "AH"),
    contract: { level: 3, strain: "D" },
    declarer: "South",
    dummy: "North",
    trickHistory: [
      {
        number: 1,
        winner: "West",
        cards: [
          { seat: "West", card: card("KD") },
          { seat: "North", card: card("QD") },
          { seat: "East", card: card("JD") },
          { seat: "South", card: card("TD") }
        ]
      },
      {
        number: 2,
        winner: "East",
        cards: [
          { seat: "West", card: card("9D") },
          { seat: "North", card: card("8D") },
          { seat: "East", card: card("7D") },
          { seat: "South", card: card("6D") }
        ]
      },
      {
        number: 3,
        winner: "South",
        cards: [
          { seat: "West", card: card("5D") },
          { seat: "North", card: card("4D") },
          { seat: "East", card: card("3D") },
          { seat: "South", card: card("AD") }
        ]
      }
    ]
  });

  assert.equal(priority.kind, "endgameRunout");
  assert.equal(priority.sequence[0].action, "leadForPartnerRuff");
});

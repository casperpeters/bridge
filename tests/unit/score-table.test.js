const { assert, rules, test } = require("./harness.js");

test("score table contract rows are generated from bridge scoring", () => {
  const data = rules.getScoreTableData();
  assert.equal(data.contractRows.length, 7);

  for (const row of data.contractRows) {
    for (const group of row.groups) {
      const strain = group.strains[0];
      const nonVulnerable = rules.calculateBridgeScore({
        contract: { level: row.level, strain },
        declarer: "South",
        tricksMade: row.level + 6,
        vulnerability: "none"
      });
      const vulnerable = rules.calculateBridgeScore({
        contract: { level: row.level, strain },
        declarer: "South",
        tricksMade: row.level + 6,
        vulnerability: "NS"
      });

      assert.deepEqual(group.notVulnerable, {
        contractScore: nonVulnerable.contractScore,
        bonusScore: nonVulnerable.bonusScore,
        total: nonVulnerable.score
      });
      assert.deepEqual(group.vulnerable, {
        contractScore: vulnerable.contractScore,
        bonusScore: vulnerable.bonusScore,
        total: vulnerable.score
      });
    }
  }

  const oneNotrump = data.contractRows[0].groups.find((group) => group.id === "notrump");
  assert.equal(oneNotrump.notVulnerable.total, 90);
  const vulnerableGame = data.contractRows[2].groups.find((group) => group.id === "notrump");
  assert.equal(vulnerableGame.vulnerable.total, 600);
});

test("score table overtrick rows are generated from overtrick scoring", () => {
  const data = rules.getScoreTableData();
  const minor = data.overtrickRows.find((row) => row.id === "minor");
  const majorNotrump = data.overtrickRows.find((row) => row.id === "majorNotrump");

  assert.equal(minor.undoubled, String(rules.overtrickPoints({ level: 1, strain: "C" }, 1, false, 1)));
  assert.equal(majorNotrump.undoubled, String(rules.overtrickPoints({ level: 1, strain: "H" }, 1, false, 1)));
  assert.equal(minor.doubled, "100 / 200");
  assert.equal(minor.redoubled, "200 / 400");
  assert.equal(majorNotrump.doubled, "100 / 200");
  assert.equal(majorNotrump.redoubled, "200 / 400");
});

test("score table undertrick rows are generated from down scoring", () => {
  const data = rules.getScoreTableData();
  const nonVulnerable = data.undertrickRows.find((row) => !row.vulnerable);
  const vulnerable = data.undertrickRows.find((row) => row.vulnerable);

  assert.equal(nonVulnerable.undoubled, String(rules.downScore(1, false, 1)));
  assert.equal(nonVulnerable.doubled, "100, 300, 500, daarna +300");
  assert.equal(nonVulnerable.redoubled, "200, 600, 1000, daarna +600");
  assert.equal(vulnerable.undoubled, String(rules.downScore(1, true, 1)));
  assert.equal(vulnerable.doubled, "200, daarna +300");
  assert.equal(vulnerable.redoubled, "400, daarna +600");
});

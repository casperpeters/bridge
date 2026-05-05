const path = require("node:path");
const fs = require("node:fs");
const { assert, test } = require("./harness.js");

const expectedScripts = [
  "rules/core.js",
  "rules/auction.js",
  "rules/scoring.js",
  "rules/score-table.js",
  "rules/bidding/common/context.js",
  "rules/bidding/common/valuation.js",
  "rules/bidding/common/legality.js",
  "rules/bidding/common/result.js",
  "rules/bidding/systems/five-card-high/conventions.js",
  "rules/bidding/systems/five-card-high/opening.js",
  "rules/bidding/systems/five-card-high/responses.js",
  "rules/bidding/systems/five-card-high/rebids.js",
  "rules/bidding/systems/five-card-high/competitive.js",
  "rules/bidding/systems/five-card-high/index.js",
  "rules/bidding/index.js",
  "rules/play-mechanics.js",
  "rules/play-plan/common.js",
  "rules/play-plan/notrump.js",
  "rules/play-plan/suit-contract.js",
  "rules/play-plan.js",
  "rules/card-play/opening-leads.js",
  "rules/card-play/common.js",
  "rules/card-play/defense.js",
  "rules/card-play.js",
  "bridge-rules.js",
  "practice-hands/five-card-high-openings.js",
  "practice-hands/notrump-responses.js",
  "practice-hands/bidding-basic.js",
  "practice-hands/play-plan-basic.js",
  "practice-hands/defense-basic.js",
  "practice-hands/scoring-basic.js",
  "practice-hands/index.js",
  "scripts/text-nl.js",
  "rules/bidding/systems/five-card-high/explanations-nl.js",
  "scripts/bid-explanations.js",
  "scripts/glossary.js",
  "scripts/lessons.js",
  "scripts/settings.js",
  "scripts/seed.js",
  "scripts/score-table.js",
  "scripts/play-plan.js",
  "scripts/render-hands.js",
  "scripts/render-auction.js",
  "scripts/render-review.js",
  "scripts/state-transitions.js",
  "scripts/auction-flow.js",
  "scripts/play-flow.js",
  "scripts/app.js"
];

test("index.html script order matches the dependency manifest", () => {
  const repoRoot = path.resolve(__dirname, "..", "..");
  const html = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8");
  const actualScripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((match) => match[1]);

  assert.deepEqual(actualScripts, expectedScripts);
  assert.equal(new Set(actualScripts).size, actualScripts.length, "script tags must not be duplicated");

  for (const script of actualScripts) {
    assert.equal(fs.existsSync(path.join(repoRoot, script)), true, `${script} must exist`);
  }
});

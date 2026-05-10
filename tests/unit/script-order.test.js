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
  "rules/card-play/play-plan-following.js",
  "rules/card-play/declarer-play.js",
  "rules/card-play.js",
  "bridge-rules.js",
  "practice-hands/catalog/five-card-high-openings.js",
  "practice-hands/catalog/notrump-responses.js",
  "practice-hands/catalog/bidding-basic.js",
  "practice-hands/catalog/play-plan-basic.js",
  "practice-hands/catalog/defense-basic.js",
  "practice-hands/catalog/scoring-basic.js",
  "practice-hands/index.js",
  "scripts/copy/text-nl.js",
  "scripts/feedback-config.js",
  "rules/bidding/systems/five-card-high/explanations-nl.js",
  "scripts/learning/bid-explanations.js",
  "scripts/learning/glossary.js",
  "scripts/learning/lessons.js",
  "scripts/state/settings.js",
  "scripts/state/situation-codec.js",
  "scripts/state/seed.js",
  "scripts/state/state-transitions.js",
  "scripts/learning/lesson-board-coach.js",
  "scripts/render/score-table.js",
  "scripts/render/play-plan.js",
  "scripts/render/contract-reveal.js",
  "scripts/render/render-hands.js",
  "scripts/render/card-animation.js",
  "scripts/render/render-auction.js",
  "scripts/render/render-review.js",
  "scripts/flow/contract-reveal-flow.js",
  "scripts/flow/auction-flow.js",
  "scripts/flow/play-flow.js",
  "scripts/app.js"
];

const expectedLessonScripts = [
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
  "rules/card-play/play-plan-following.js",
  "rules/card-play/declarer-play.js",
  "rules/card-play.js",
  "bridge-rules.js",
  "practice-hands/catalog/five-card-high-openings.js",
  "practice-hands/catalog/notrump-responses.js",
  "practice-hands/catalog/bidding-basic.js",
  "practice-hands/catalog/play-plan-basic.js",
  "practice-hands/catalog/defense-basic.js",
  "practice-hands/catalog/scoring-basic.js",
  "practice-hands/index.js",
  "scripts/learning/lessons.js",
  "scripts/learning/lesson-page.js"
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

test("lessons.html script order loads lesson data after practice hands", () => {
  const repoRoot = path.resolve(__dirname, "..", "..");
  const html = fs.readFileSync(path.join(repoRoot, "lessons.html"), "utf8");
  const actualScripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((match) => match[1]);

  assert.deepEqual(actualScripts, expectedLessonScripts);
  assert.equal(new Set(actualScripts).size, actualScripts.length, "lesson script tags must not be duplicated");

  for (const script of actualScripts) {
    assert.equal(fs.existsSync(path.join(repoRoot, script)), true, `${script} must exist`);
  }
});

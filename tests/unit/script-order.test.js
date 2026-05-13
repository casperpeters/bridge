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
  "rules/play-plan/endgame-runout.js",
  "rules/play-plan/notrump.js",
  "rules/play-plan/suit-contract/base.js",
  "rules/play-plan/suit-contract/trumps.js",
  "rules/play-plan/suit-contract/side-suits.js",
  "rules/play-plan/suit-contract/ruffs.js",
  "rules/play-plan/suit-contract/finesses.js",
  "rules/play-plan/suit-contract.js",
  "rules/play-plan.js",
  "rules/card-play/opening-leads.js",
  "rules/card-play/common.js",
  "rules/card-play/defense.js",
  "rules/card-play/play-plan-following/common.js",
  "rules/card-play/play-plan-following/notrump.js",
  "rules/card-play/play-plan-following/ruffs.js",
  "rules/card-play/play-plan-following/trumps.js",
  "rules/card-play/play-plan-following/side-suits.js",
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
  "scripts/learning/catalog/lesson-data.js",
  "scripts/learning/catalog/lesson-cloning.js",
  "scripts/learning/table/lesson-table-task.js",
  "scripts/learning/catalog/lesson-validation.js",
  "scripts/learning/lessons.js",
  "scripts/app/runtime.js",
  "scripts/app/helpers.js",
  "scripts/state/settings.js",
  "scripts/ui/menu.js",
  "scripts/ui/dialogs.js",
  "scripts/state/situation-codec.js",
  "scripts/state/seed.js",
  "scripts/state/state-transitions.js",
  "scripts/state/review-playback.js",
  "scripts/learning/lesson-board-coach.js",
  "scripts/learning/lesson-start.js",
  "scripts/feedback/controller.js",
  "scripts/render/score-table.js",
  "scripts/render/play-plan.js",
  "scripts/render/contract-reveal.js",
  "scripts/render/render-hands.js",
  "scripts/render/card-animation.js",
  "scripts/render/render-auction.js",
  "scripts/render/render-review.js",
  "scripts/render/render-app.js",
  "scripts/flow/contract-reveal-flow.js",
  "scripts/flow/auction-flow.js",
  "scripts/flow/hand-finish-flow.js",
  "scripts/flow/play-flow.js",
  "scripts/app/hand-start.js",
  "scripts/app/bootstrap.js",
  "scripts/app/public-api.js",
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
  "rules/play-plan/endgame-runout.js",
  "rules/play-plan/notrump.js",
  "rules/play-plan/suit-contract/base.js",
  "rules/play-plan/suit-contract/trumps.js",
  "rules/play-plan/suit-contract/side-suits.js",
  "rules/play-plan/suit-contract/ruffs.js",
  "rules/play-plan/suit-contract/finesses.js",
  "rules/play-plan/suit-contract.js",
  "rules/play-plan.js",
  "rules/card-play/opening-leads.js",
  "rules/card-play/common.js",
  "rules/card-play/defense.js",
  "rules/card-play/play-plan-following/common.js",
  "rules/card-play/play-plan-following/notrump.js",
  "rules/card-play/play-plan-following/ruffs.js",
  "rules/card-play/play-plan-following/trumps.js",
  "rules/card-play/play-plan-following/side-suits.js",
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
  "scripts/learning/catalog/lesson-data.js",
  "scripts/learning/catalog/lesson-cloning.js",
  "scripts/learning/table/lesson-table-task.js",
  "scripts/learning/catalog/lesson-validation.js",
  "scripts/learning/lessons.js",
  "scripts/learning/shared/lesson-page-helpers.js",
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

test("lessons/index.html script order loads lesson data after practice hands", () => {
  const repoRoot = path.resolve(__dirname, "..", "..");
  const htmlPath = path.join(repoRoot, "lessons", "index.html");
  const html = fs.readFileSync(htmlPath, "utf8");
  const actualScripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((match) => match[1]);

  assert.deepEqual(actualScripts, expectedLessonScripts.map((script) => `../${script}`));
  assert.equal(new Set(actualScripts).size, actualScripts.length, "lesson script tags must not be duplicated");

  for (const script of actualScripts) {
    assert.equal(fs.existsSync(path.resolve(path.dirname(htmlPath), script)), true, `${script} must exist`);
  }
});

test("lesson 1 standalone page loads shared lesson helpers before its controller", () => {
  const repoRoot = path.resolve(__dirname, "..", "..");
  const htmlPath = path.join(repoRoot, "lessons", "01-cards.html");
  const html = fs.readFileSync(htmlPath, "utf8");
  const actualScripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((match) => match[1]);

  assert.deepEqual(actualScripts, [
    "../scripts/learning/lesson-cards.js",
    "../scripts/learning/shared/lesson-hand.js",
    "../scripts/learning/shared/lesson-render.js",
    "../scripts/learning/shared/lesson-page-helpers.js",
    "../scripts/learning/card-basics-page.js"
  ]);

  for (const script of actualScripts) {
    assert.equal(fs.existsSync(path.resolve(path.dirname(htmlPath), script)), true, `${script} must exist`);
  }
});

test("lesson 2 standalone page loads shared helpers and data before its controller", () => {
  const repoRoot = path.resolve(__dirname, "..", "..");
  const htmlPath = path.join(repoRoot, "lessons", "02-card-valuation.html");
  const html = fs.readFileSync(htmlPath, "utf8");
  const actualScripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((match) => match[1]);

  assert.deepEqual(actualScripts, [
    "../scripts/learning/lesson-cards.js",
    "../scripts/learning/shared/lesson-hand.js",
    "../scripts/learning/shared/lesson-render.js",
    "../scripts/learning/shared/lesson-page-helpers.js",
    "../scripts/learning/lesson-02-valuation-data.js",
    "../scripts/learning/hand-valuation-page.js"
  ]);

  for (const script of actualScripts) {
    assert.equal(fs.existsSync(path.resolve(path.dirname(htmlPath), script)), true, `${script} must exist`);
  }
});

test("lesson 3 standalone page loads shared helpers and data before its controller", () => {
  const repoRoot = path.resolve(__dirname, "..", "..");
  const htmlPath = path.join(repoRoot, "lessons", "03-openings.html");
  const html = fs.readFileSync(htmlPath, "utf8");
  const actualScripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((match) => match[1]);

  assert.deepEqual(actualScripts, [
    "../scripts/learning/lesson-cards.js",
    "../scripts/learning/shared/lesson-hand.js",
    "../scripts/learning/shared/lesson-render.js",
    "../scripts/learning/shared/lesson-page-helpers.js",
    "../scripts/learning/lesson-03-openings-data.js",
    "../scripts/learning/openings-page.js"
  ]);

  for (const script of actualScripts) {
    assert.equal(fs.existsSync(path.resolve(path.dirname(htmlPath), script)), true, `${script} must exist`);
  }
});

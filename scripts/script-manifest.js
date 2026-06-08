(function initBridgeScriptManifest(root, factory) {
  const manifest = factory();
  if (typeof module === "object" && module.exports) module.exports = manifest;
  root.BridgeScriptManifest = manifest;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeScriptManifest() {
  "use strict";

  const bridgeRules = [
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
    "rules/bidding/systems/five-card-high/rebids/notrump-systems/index.js",
    "rules/bidding/systems/five-card-high/rebids/blackwood/index.js",
    "rules/bidding/systems/five-card-high/rebids/strong-two-clubs/index.js",
    "rules/bidding/systems/five-card-high/rebids/fourth-suit-forcing/index.js",
    "rules/bidding/systems/five-card-high/rebids/natural-opener/index.js",
    "rules/bidding/systems/five-card-high/rebids.js",
    "rules/bidding/systems/five-card-high/continuation.js",
    "rules/bidding/systems/five-card-high/competitive/takeout-double/index.js",
    "rules/bidding/systems/five-card-high/competitive/preempt-defense/index.js",
    "rules/bidding/systems/five-card-high/competitive/overcalls/index.js",
    "rules/bidding/systems/five-card-high/competitive/advancer/index.js",
    "rules/bidding/systems/five-card-high/competitive.js",
    "rules/bidding/systems/five-card-high/index.js",
    "rules/bidding/index.js",
    "rules/deterministic-playout.js",
    "rules/play-mechanics.js",
    "rules/mini-end-position-solver.js",
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
    "bridge-rules.js"
  ];

  const practiceHands = [
    "practice-hands/smb1-course.js",
    "practice-hands/interactive-smb1-exercises.js",
    "practice-hands/mini-end-position-exercises.js",
    "practice-hands/catalog/five-card-high-openings.js",
    "practice-hands/catalog/notrump-responses.js",
    "practice-hands/catalog/bidding-basic.js",
    "practice-hands/catalog/play-plan-basic.js",
    "practice-hands/catalog/defense-basic.js",
    "practice-hands/catalog/scoring-basic.js",
    "practice-hands/catalog/start-met-bridge-1.js",
    "practice-hands/catalog-model.js",
    "practice-hands/index.js"
  ];

  const tableApp = [
    "scripts/copy/text-nl.js",
    "scripts/feedback-config.js",
    "rules/bidding/systems/five-card-high/opening/explanations-nl.js",
    "rules/bidding/systems/five-card-high/responses/notrump/explanations-nl.js",
    "rules/bidding/systems/five-card-high/responses/strong-two-clubs/explanations-nl.js",
    "rules/bidding/systems/five-card-high/responses/preempts/explanations-nl.js",
    "rules/bidding/systems/five-card-high/responses/natural/explanations-nl.js",
    "rules/bidding/systems/five-card-high/rebids/notrump-systems/explanations-nl.js",
    "rules/bidding/systems/five-card-high/rebids/strong-two-clubs/explanations-nl.js",
    "rules/bidding/systems/five-card-high/rebids/blackwood/explanations-nl.js",
    "rules/bidding/systems/five-card-high/rebids/fourth-suit-forcing/explanations-nl.js",
    "rules/bidding/systems/five-card-high/rebids/opener-rebids/explanations-nl.js",
    "rules/bidding/systems/five-card-high/rebids/responder-rebids/explanations-nl.js",
    "rules/bidding/systems/five-card-high/competitive/takeout-double/explanations-nl.js",
    "rules/bidding/systems/five-card-high/competitive/overcalls/explanations-nl.js",
    "rules/bidding/systems/five-card-high/competitive/notrump-overcall-responses/explanations-nl.js",
    "rules/bidding/systems/five-card-high/competitive/preempt-defense/explanations-nl.js",
    "rules/bidding/systems/five-card-high/competitive/advancer/explanations-nl.js",
    "rules/bidding/systems/five-card-high/competitive/general/explanations-nl.js",
    "rules/bidding/systems/five-card-high/explanations-nl.js",
    "scripts/learning/bid-explanations.js",
    "scripts/learning/glossary.js",
    "scripts/learning/catalog/lesson-data.js",
    "scripts/learning/catalog/lesson-cloning.js",
    "scripts/learning/table/action-validation.js",
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
    "scripts/learning/interactive/exercise-table.js",
    "scripts/learning/interactive/mini-end-position-table.js",
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
    "scripts/flow/deterministic-playout-flow.js",
    "scripts/app/hand-start.js",
    "scripts/app/bootstrap.js",
    "scripts/app/public-api.js",
    "scripts/app.js"
  ];

  const lessonIndex = [
    "scripts/learning/catalog/lesson-data.js",
    "scripts/learning/catalog/lesson-cloning.js",
    "scripts/learning/table/action-validation.js",
    "scripts/learning/table/lesson-table-task.js",
    "scripts/learning/catalog/lesson-validation.js",
    "scripts/learning/lessons.js",
    "scripts/learning/shared/lesson-page-helpers.js",
    "scripts/learning/lesson-page.js"
  ];

  const practiceBrowser = [
    "scripts/practice/browser-page.js"
  ];

  const standaloneLessons = {
    cards: [
      "scripts/learning/lesson-cards.js",
      "scripts/learning/shared/lesson-hand.js",
      "scripts/learning/shared/lesson-render.js",
      "scripts/learning/shared/lesson-page-helpers.js",
      "scripts/learning/card-basics-page.js"
    ],
    cardValuation: [
      "scripts/learning/lesson-cards.js",
      "scripts/learning/shared/lesson-hand.js",
      "scripts/learning/shared/lesson-render.js",
      "scripts/learning/shared/lesson-page-helpers.js",
      "scripts/learning/lesson-02-valuation-data.js",
      "scripts/learning/hand-valuation-page.js"
    ],
    openings: [
      "scripts/learning/lesson-cards.js",
      "scripts/learning/shared/lesson-hand.js",
      "scripts/learning/shared/lesson-render.js",
      "scripts/learning/shared/lesson-page-helpers.js",
      "scripts/learning/lesson-03-openings-data.js",
      "scripts/learning/openings-page.js"
    ]
  };

  function withPrefix(scripts, prefix) {
    return scripts.map((script) => `${prefix}${script}`);
  }

  return {
    bridgeRules,
    practiceHands,
    tableApp,
    lessonIndex,
    practiceBrowser,
    standaloneLessons,
    pages: {
      index: [...bridgeRules, ...practiceHands, ...tableApp],
      lessonIndex: [...bridgeRules, ...practiceHands, ...lessonIndex],
      practiceBrowser: [...bridgeRules, ...practiceHands, ...practiceBrowser],
      standaloneLessons
    },
    withPrefix
  };
});

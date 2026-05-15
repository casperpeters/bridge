(function initBridgeApp(root) {
  "use strict";

  const runtimeFactory = root.BridgeAppRuntime;
  if (!runtimeFactory) throw new Error("scripts/app/runtime.js must load before app.js");

  const runtime = runtimeFactory.create({
    rules: root.BridgeRules,
    transitions: root.BridgeStateTransitions,
    reviewPlayback: root.BridgeReviewPlayback,
    text: root.BridgeTextNl
  });

  const modules = root.BridgeAppModules || {};
  [
    ["registerHelpers", modules.registerHelpers],
    ["registerSettings", modules.registerSettings],
    ["registerMenu", modules.registerMenu],
    ["registerDialogs", modules.registerDialogs],
    ["registerBidExplanations", modules.registerBidExplanations],
    ["registerScoreTable", modules.registerScoreTable],
    ["registerPlayPlanRenderer", modules.registerPlayPlanRenderer],
    ["registerContractRevealRenderer", modules.registerContractRevealRenderer],
    ["registerHandsRenderer", modules.registerHandsRenderer],
    ["registerCardAnimation", modules.registerCardAnimation],
    ["registerAuctionRenderer", modules.registerAuctionRenderer],
    ["registerReviewRenderer", modules.registerReviewRenderer],
    ["registerContractRevealFlow", modules.registerContractRevealFlow],
    ["registerAuctionFlow", modules.registerAuctionFlow],
    ["registerHandFinishFlow", modules.registerHandFinishFlow],
    ["registerPlayFlow", modules.registerPlayFlow],
    ["registerDeterministicPlayoutFlow", modules.registerDeterministicPlayoutFlow],
    ["registerSeed", modules.registerSeed],
    ["registerHandStart", modules.registerHandStart],
    ["registerLessonBoardCoach", modules.registerLessonBoardCoach],
    ["registerLessonStart", modules.registerLessonStart],
    ["registerFeedback", modules.registerFeedback],
    ["registerAppRenderer", modules.registerAppRenderer],
    ["registerBootstrap", modules.registerBootstrap]
  ].forEach(([name, register]) => {
    if (typeof register !== "function") throw new Error(`${name} must load before app.js`);
    register(runtime);
  });

  runtime.bootstrap.init();

  if (typeof modules.registerPublicApi !== "function") {
    throw new Error("registerPublicApi must load before app.js");
  }
  modules.registerPublicApi(runtime);

  if (!runtime.actions.startLessonFromUrl() && !runtime.actions.startPracticeHandFromUrl()) runtime.actions.startHand();
})(typeof globalThis !== "undefined" ? globalThis : this);

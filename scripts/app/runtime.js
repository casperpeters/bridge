(function initBridgeAppRuntime(root) {
  "use strict";

  const modules = root.BridgeAppModules = root.BridgeAppModules || {};

  function create({ rules, transitions, reviewPlayback, text }) {
    if (!rules) throw new Error("bridge-rules.js must load before app.js");
    if (!transitions) throw new Error("state-transitions.js must load before app.js");
    if (!reviewPlayback) throw new Error("review-playback.js must load before app.js");
    if (!text) throw new Error("scripts/copy/text-nl.js must load before app runtime");

    const constants = createConstants(rules);
    const dom = createDomRefs();
    const runtime = {
      actions: {},
      bootstrap: {
        steps: [],
        init() {
          this.steps.forEach((step) => step());
        }
      },
      constants,
      dom,
      els: dom.els,
      helpers: {},
      media: {
        mobileLayoutQuery: root.matchMedia?.("(max-width: 760px)") || null,
        mobileBiddingLayoutQuery: null,
        stableSidebarLayoutQuery: root.matchMedia?.("(min-width: 1180px)") || null
      },
      render: {},
      reviewPlayback,
      rules,
      state: createInitialState(constants.defaultBiddingSystem),
      text,
      timers: {
        illegalActionFeedbackTimer: null,
        flowGeneration: 0,
        dealAnimationTimer: null,
        dealAnimationHandsLocked: false,
        dealAnimationHandRenderSnapshot: null
      },
      transitions
    };
    runtime.media.mobileBiddingLayoutQuery = runtime.media.mobileLayoutQuery;
    return runtime;
  }

  function createConstants(rules) {
    const defaultBiddingSystem = rules.biddingSystems.fiveCardHigh;
    return {
      biddingBoxStrains: ["NT", "S", "H", "D", "C"],
      defaultBiddingSystem,
      handSuitOrder: ["S", "H", "C", "D"],
      rankLabel: { T: "10", J: "J", Q: "Q", K: "K", A: "A" },
      rankOrder: ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"],
      roleSeparator: "\u2022",
      seats: ["North", "East", "South", "West"],
      separatorDot: "\u00b7",
      suitSymbols: { C: "\u2663", D: "\u2666", H: "\u2665", S: "\u2660", NT: "NT" }
    };
  }

  function createInitialState(defaultBiddingSystem) {
    return {
      hands: {},
      phase: "idle",
      dealerIndex: 0,
      turnIndex: 0,
      auction: [],
      contract: null,
      declarer: null,
      dummy: null,
      leader: null,
      currentTrick: [],
      awaitingTrickAdvance: false,
      trickAdvanceArmed: false,
      trickClearAnimating: false,
      pendingTrickWinner: null,
      tricks: { NS: 0, EW: 0 },
      trickHistory: [],
      reviewTrickCursor: null,
      reviewCursor: null,
      playExplanations: [],
      playPlan: null,
      playPlanKey: null,
      originalHands: {},
      dealNumber: 0,
      vulnerability: "none",
      animateDeal: false,
      developerMode: false,
      guidanceMode: false,
      showPlayHistory: false,
      showAdvancedBidControls: false,
      biddingSystemId: defaultBiddingSystem.id,
      biddingAgreements: { ...defaultBiddingSystem.conventionDefaults },
      pendingStop: false,
      pendingAlert: false,
      status: { key: "chooseAndDeal", args: {} },
      finalScore: null,
      scoreOverviewDismissed: false,
      dealSeed: null,
      seedMessage: null,
      practice: null,
      feedbackStatus: null,
      illegalActionFeedback: null,
      lessonActionFeedback: null,
      handSuitFocus: null,
      lessonBoardAcknowledged: [],
      lessonModeSettingsSnapshot: null,
      lessonTableTaskDone: false
    };
  }

  function createDomRefs() {
    const seatEls = {
      North: document.querySelector("#north-hand"),
      East: document.querySelector("#east-hand"),
      South: document.querySelector("#south-hand"),
      West: document.querySelector("#west-hand")
    };
    const slotEls = {
      North: document.querySelector(".trick-north"),
      East: document.querySelector(".trick-east"),
      South: document.querySelector(".trick-south"),
      West: document.querySelector(".trick-west")
    };
    const seatAuctionEls = {
      North: document.querySelector("#north-auction-calls"),
      East: document.querySelector("#east-auction-calls"),
      South: document.querySelector("#south-auction-calls"),
      West: document.querySelector("#west-auction-calls")
    };
    return {
      seatAuctionEls,
      seatEls,
      slotEls,
      els: {
        appShell: document.querySelector(".app-shell"),
        title: document.querySelector("#app-title"),
        heading: document.querySelector("#app-heading"),
        playMode: document.querySelector("#play-mode"),
        appMenu: document.querySelector(".app-menu"),
        settingsSummary: document.querySelector("#settings-summary"),
        developerOnlyElements: document.querySelectorAll("[data-developer-only]"),
        developerMode: document.querySelector("#developer-mode"),
        developerModeLabel: document.querySelector("#developer-mode-label"),
        developerModeDescription: document.querySelector("#developer-mode-description"),
        guidanceMode: document.querySelector("#guidance-mode"),
        guidanceModeLabel: document.querySelector("#guidance-mode-label"),
        guidanceModeDescription: document.querySelector("#guidance-mode-description"),
        playHistoryMode: document.querySelector("#play-history-mode"),
        playHistoryModeLabel: document.querySelector("#play-history-mode-label"),
        playHistoryModeDescription: document.querySelector("#play-history-mode-description"),
        hintButton: document.querySelector("#hint-button"),
        openFeedback: document.querySelector("#open-feedback"),
        openLessons: document.querySelector("#open-lessons"),
        lessonsDialog: document.querySelector("#lessons-dialog"),
        closeLessons: document.querySelector("#close-lessons"),
        lessonsEyebrow: document.querySelector("#lessons-eyebrow"),
        lessonsTitle: document.querySelector("#lessons-title"),
        lessonsIntro: document.querySelector("#lessons-intro"),
        lessonsList: document.querySelector("#lessons-list"),
        openGlossary: document.querySelector("#open-glossary"),
        glossaryDialog: document.querySelector("#glossary-dialog"),
        closeGlossary: document.querySelector("#close-glossary"),
        glossaryTitle: document.querySelector("#glossary-title"),
        glossarySearch: document.querySelector("#glossary-search"),
        glossaryList: document.querySelector("#glossary-list"),
        glossaryTerm: document.querySelector("#glossary-term"),
        glossaryDefinition: document.querySelector("#glossary-definition"),
        openScoreTable: document.querySelector("#open-score-table"),
        scoreTableDialog: document.querySelector("#score-table-dialog"),
        closeScoreTable: document.querySelector("#close-score-table"),
        newHand: document.querySelector("#new-hand"),
        sameHand: document.querySelector("#same-hand"),
        replayPanel: document.querySelector("#replay-panel"),
        replayTitle: document.querySelector("#replay-title"),
        replayContract: document.querySelector("#replay-contract"),
        replayResult: document.querySelector("#replay-result"),
        replayScore: document.querySelector("#replay-score"),
        replayScoreHelp: document.querySelector("#replay-score-help"),
        replayScoreExplanation: document.querySelector("#replay-score-explanation"),
        replayClose: document.querySelector("#replay-close"),
        replayNewHand: document.querySelector("#replay-new-hand"),
        replaySameHand: document.querySelector("#replay-same-hand"),
        quickReview: document.querySelector("#quick-review"),
        seedLabel: document.querySelector("#seed-label"),
        seedInput: document.querySelector("#seed-input"),
        loadSeed: document.querySelector("#load-seed"),
        copySeed: document.querySelector("#copy-seed"),
        seedDescription: document.querySelector("#seed-description"),
        tableArea: document.querySelector(".table-area"),
        contractReveal: document.querySelector("#contract-reveal"),
        contractRevealBid: document.querySelector("#contract-reveal-bid"),
        contractRevealMeta: document.querySelector("#contract-reveal-meta"),
        contractRevealLead: document.querySelector("#contract-reveal-lead"),
        sidePanel: document.querySelector(".side-panel"),
        auctionPanel: document.querySelector(".auction-panel"),
        mobileBiddingSlot: document.querySelector("#mobile-bidding-slot"),
        northLabel: document.querySelector("#north-label"),
        eastLabel: document.querySelector("#east-label"),
        southLabel: document.querySelector("#south-label"),
        westLabel: document.querySelector("#west-label"),
        biddingTitle: document.querySelector("#bidding-title"),
        historyPanel: document.querySelector("#history-panel"),
        lessonPanel: document.querySelector("#lesson-panel"),
        historyTitle: document.querySelector("#history-title"),
        reviewPanel: document.querySelector("#review-panel"),
        reviewTitle: document.querySelector("#review-title"),
        reviewResult: document.querySelector("#review-result"),
        reviewSummary: document.querySelector("#review-summary"),
        reviewTricks: document.querySelector("#review-tricks"),
        feedbackDialog: document.querySelector("#feedback-dialog"),
        feedbackTitle: document.querySelector("#feedback-title"),
        feedbackState: document.querySelector("#feedback-state"),
        feedbackTypeLabel: document.querySelector("#feedback-type-label"),
        feedbackType: document.querySelector("#feedback-type"),
        feedbackMessageLabel: document.querySelector("#feedback-message-label"),
        feedbackMessage: document.querySelector("#feedback-message"),
        feedbackDetailField: document.querySelector("#feedback-detail-field"),
        feedbackDetailLabel: document.querySelector("#feedback-detail-label"),
        feedbackDetail: document.querySelector("#feedback-detail"),
        copyFeedback: document.querySelector("#copy-feedback"),
        mailFeedback: document.querySelector("#mail-feedback"),
        closeFeedback: document.querySelector("#close-feedback"),
        feedbackDescription: document.querySelector("#feedback-description"),
        bidControlsTitle: document.querySelector("#bid-controls-title"),
        bidControls: document.querySelector("#bid-controls"),
        bidExplanations: document.querySelector("#bid-explanations"),
        playPlan: document.querySelector("#play-plan-panel"),
        playExplanations: document.querySelector("#play-explanations"),
        auctionLog: document.querySelector("#auction-log"),
        dealerBadge: document.querySelector("#dealer-badge"),
        contract: document.querySelector("#contract"),
        trickArea: document.querySelector("#trick-area"),
        status: document.querySelector("#status"),
        guidancePanel: document.querySelector("#guidance-panel"),
        dummyNotice: document.querySelector("#dummy-notice"),
        lessonBanner: document.querySelector("#lesson-banner"),
        tableFeedback: document.querySelector("#table-feedback"),
        trickAdvanceHint: document.querySelector("#trick-advance-hint"),
        scoreline: document.querySelector("#scoreline"),
        history: document.querySelector("#history"),
        trickCount: document.querySelector("#trick-count")
      }
    };
  }

  root.BridgeAppRuntime = { create };
  modules._order = modules._order || [];
})(typeof globalThis !== "undefined" ? globalThis : this);

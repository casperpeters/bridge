const { expect, test } = require("@playwright/test");
const {
  openFreshApp,
  prepareNorthSouthDeclarerHand
} = require("./helpers/app-test-utils");

test.setTimeout(30_000);

async function setupVisibleNotrumpUitspelenEnding(page, { lessonStep = null, practiceHand = false } = {}) {
  await page.evaluate(({ lessonStep, practiceHand }) => {
    const app = window.BridgeAppTestHooks;
    const makeCard = (id) => ({ id, rank: id.slice(0, -1), suit: id.slice(-1) });
    const seats = ["North", "East", "South", "West"];
    const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"];
    const suits = ["C", "D", "H", "S"];
    const reserved = new Set(["AS", "2S", "3S", "4S"]);
    const playedIds = suits.flatMap((suit) => ranks.map((rank) => `${rank}${suit}`)).filter((id) => !reserved.has(id));
    const trickHistory = Array.from({ length: 12 }, (_, trickIndex) => ({
      number: trickIndex + 1,
      winner: trickIndex < 8 ? "South" : "West",
      cards: seats.map((seat, offset) => ({
        seat,
        card: makeCard(playedIds[trickIndex * 4 + offset])
      }))
    }));

    if (practiceHand || lessonStep) app.startPracticeHand("draw-trumps-001", { skipFlow: true });
    else app.startHand({ seed: "uitspelen-smoke", skipFlow: true });
    const practice = app.getState().practice;
    const lessonPractice = lessonStep
      ? {
        ...practice,
        lessonId: "test-les-uitspelen-suppressie",
        lessonTitle: "Testles",
        challenge: "Speel het gevraagde lesmoment.",
        lessonBoardGuidance: [lessonStep]
      }
      : practice;
    app.setState({
      phase: "playing",
      contract: app.rules.Bid(3, "NT"),
      declarer: "South",
      dummy: "North",
      leader: "West",
      turnIndex: 2,
      hands: {
        North: [makeCard("2S")],
        East: [makeCard("3S")],
        South: [makeCard("AS")],
        West: [makeCard("4S")]
      },
      currentTrick: [],
      awaitingTrickAdvance: false,
      trickHistory,
      tricks: { NS: 8, EW: 4 },
      playExplanations: [],
      playPlan: null,
      playPlanKey: null,
      finalScore: null,
      scoreOverviewDismissed: false,
      practice: practiceHand || lessonStep ? lessonPractice : practice,
      lessonBoardAcknowledged: []
    });
    app.renderAll();
  }, { lessonStep, practiceHand });
}

async function setupTwoTrickVisibleNotrumpUitspelenEnding(page) {
  await page.evaluate(() => {
    const app = window.BridgeAppTestHooks;
    const makeCard = (id) => ({ id, rank: id.slice(0, -1), suit: id.slice(-1) });
    const seats = ["North", "East", "South", "West"];
    const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"];
    const suits = ["C", "D", "H", "S"];
    const reserved = new Set(["2C", "3C", "2D", "3D", "4H", "5H", "KS", "AS"]);
    const playedIds = suits.flatMap((suit) => ranks.map((rank) => `${rank}${suit}`)).filter((id) => !reserved.has(id));
    const trickHistory = Array.from({ length: 11 }, (_, trickIndex) => ({
      number: trickIndex + 1,
      winner: trickIndex < 5 ? "North" : "East",
      cards: seats.map((seat, offset) => ({
        seat,
        card: makeCard(playedIds[trickIndex * 4 + offset])
      }))
    }));

    app.startHand({ seed: "uitspelen-prefix-smoke", skipFlow: true });
    app.setState({
      phase: "playing",
      contract: app.rules.Bid(3, "NT"),
      declarer: "East",
      dummy: "West",
      leader: "South",
      turnIndex: 3,
      hands: {
        North: [makeCard("2C"), makeCard("3C")],
        East: [makeCard("2D"), makeCard("3D")],
        South: [makeCard("4H"), makeCard("5H")],
        West: [makeCard("KS"), makeCard("AS")]
      },
      currentTrick: [],
      awaitingTrickAdvance: false,
      trickHistory,
      tricks: { NS: 5, EW: 6 },
      playExplanations: [],
      playPlan: null,
      playPlanKey: null,
      deterministicPlayoutProof: null,
      finalScore: null,
      scoreOverviewDismissed: false
    });
    app.renderAll();
  });
}

async function setupHiddenHigherUnavailableUitspelenEnding(page) {
  await page.evaluate(() => {
    const app = window.BridgeAppTestHooks;
    const makeCard = (id) => ({ id, rank: id.slice(0, -1), suit: id.slice(-1) });

    app.startHand({ seed: "uitspelen-unavailable-smoke", skipFlow: true });
    app.setState({
      phase: "playing",
      contract: app.rules.Bid(3, "NT"),
      declarer: "South",
      dummy: "North",
      leader: "West",
      turnIndex: 2,
      hands: {
        North: [makeCard("2C")],
        East: [makeCard("3D")],
        South: [makeCard("KS")],
        West: [makeCard("4H")]
      },
      currentTrick: [],
      awaitingTrickAdvance: false,
      trickHistory: [],
      tricks: { NS: 0, EW: 0 },
      playExplanations: [],
      playPlan: null,
      playPlanKey: null,
      deterministicPlayoutProof: null,
      deterministicPlayoutSearchNodeBudget: null,
      finalScore: null,
      scoreOverviewDismissed: false
    });
    app.renderAll();
  });
}

async function setupVisibleSuitUitspelenEnding(page) {
  await page.evaluate(() => {
    const app = window.BridgeAppTestHooks;
    const makeCard = (id) => ({ id, rank: id.slice(0, -1), suit: id.slice(-1) });

    app.startHand({ seed: "uitspelen-suit-smoke", skipFlow: true });
    app.setState({
      phase: "playing",
      contract: app.rules.Bid(4, "S"),
      declarer: "South",
      dummy: "North",
      leader: "West",
      turnIndex: 2,
      hands: {
        North: [makeCard("2C")],
        East: [makeCard("3D")],
        South: [makeCard("AH")],
        West: [makeCard("4D")]
      },
      currentTrick: [],
      awaitingTrickAdvance: false,
      trickHistory: [
        {
          number: 1,
          winner: "South",
          cards: [
            { seat: "South", card: makeCard("2H") },
            { seat: "West", card: makeCard("3C") },
            { seat: "North", card: makeCard("3H") },
            { seat: "East", card: makeCard("4H") }
          ]
        },
        {
          number: 2,
          winner: "South",
          cards: app.rules.rankOrder.map((rank, index) => ({
            seat: app.rules.seats[index % app.rules.seats.length],
            card: makeCard(`${rank}S`)
          }))
        }
      ],
      tricks: { NS: 2, EW: 0 },
      playExplanations: [],
      playPlan: null,
      playPlanKey: null,
      deterministicPlayoutProof: null,
      deterministicPlayoutSearchNodeBudget: null,
      finalScore: null,
      scoreOverviewDismissed: false
    });
    app.renderAll();
  });
}

async function autoPlayFirstStoredUitspelenStep(page) {
  return page.evaluate(() => {
    const app = window.BridgeAppTestHooks;
    const seats = ["North", "East", "South", "West"];
    const analysis = app.currentUitspelenAnalysis();
    const step = analysis.sequence[0];
    const order = seats.map((_, index) => seats[(seats.indexOf(step.leader) + index) % seats.length]);
    const cardById = (seat, cardId) => app.getState().hands[seat].find((card) => card.id === cardId);
    for (const seat of order) {
      const card = seat === step.leader
        ? cardById(seat, step.leadCardId)
        : seat === step.winnerSeat
          ? cardById(seat, step.winningCardId)
          : app.legalCards(seat)[0];
      if (!app.autoPlayCard(seat, card)) throw new Error(`Could not auto-play ${seat}`);
    }
    app.renderAll();
    const nextAnalysis = app.currentUitspelenAnalysis();
    return {
      historyLength: app.getState().trickHistory.length,
      proofSource: nextAnalysis.proofSource,
      remainingTricks: nextAnalysis.remainingTricks,
      available: nextAnalysis.available
    };
  });
}

async function openLayoutCheckApp(page) {
  await page.goto("/?testHooks=1");
  await expect(page.locator("#app-heading")).toContainText("Vijfkaart Hoog");
}

async function openExercise(page, exerciseId) {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto(`/?testHooks=1&exercise=${encodeURIComponent(exerciseId)}`);
  await expect(page.locator("#app-heading")).toContainText("Vijfkaart Hoog");
  await expect.poll(() =>
    page.evaluate(() => window.BridgeAppTestHooks?.getState().interactiveExercise?.id || null)
  ).toBe(exerciseId);
  return pageErrors;
}

async function clickBidButton(page, label) {
  await page.locator("#bid-controls button").filter({ hasText: new RegExp(`^${label}$`) }).click();
}

async function measureUitspelenPlacement(page) {
  return page.evaluate(() => {
    const rectFor = (selector) => {
      const rect = document.querySelector(selector).getBoundingClientRect();
      return {
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        centerX: rect.left + rect.width / 2
      };
    };
    const rectForAll = (selector) => {
      const rects = [...document.querySelectorAll(selector)].map((element) => element.getBoundingClientRect());
      const bounds = rects.reduce((acc, rect) => ({
        top: Math.min(acc.top, rect.top),
        right: Math.max(acc.right, rect.right),
        bottom: Math.max(acc.bottom, rect.bottom),
        left: Math.min(acc.left, rect.left)
      }), {
        top: Infinity,
        right: -Infinity,
        bottom: -Infinity,
        left: Infinity
      });
      return {
        ...bounds,
        width: bounds.right - bounds.left,
        height: bounds.bottom - bounds.top,
        centerX: bounds.left + (bounds.right - bounds.left) / 2
      };
    };
    const overlaps = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
    const table = rectFor(".table-area");
    const button = rectFor("#uitspelen-button");
    const northLabel = rectFor("#north-label");
    const northCards = rectForAll("#north-hand .card");
    const southCards = rectForAll("#south-hand .card");
    const trickArea = rectFor("#trick-area");

    return {
      table,
      button,
      northLabel,
      northCards,
      southCards,
      trickArea,
      overlaps: {
        northLabel: overlaps(button, northLabel),
        northCards: overlaps(button, northCards),
        southCards: overlaps(button, southCards),
        trickArea: overlaps(button, trickArea)
      }
    };
  });
}

test("loads the table and lets South make an auction call", async ({ page }) => {
  const pageErrors = await openFreshApp(page);

  await page.evaluate(() => {
    const app = window.BridgeAppTestHooks;
    app.startHand({ seed: "smoke-south-bids", skipFlow: true });
    app.setState({ phase: "bidding", turnIndex: 2, auction: [], animateDeal: false });
    app.renderAll();
  });

  await expect(page.locator("#south-hand .card")).toHaveCount(13);
  await expect(page.locator("#north-hand .card.back")).toHaveCount(13);
  await expect(page.locator("#bid-controls")).toHaveClass(/active-bid-box/);
  await expect(page.locator("#bid-controls button.pass")).toBeVisible();

  await page.locator("#bid-controls button.pass").click();
  await expect(page.locator("#auction-log")).toContainText("Pas");
  expect(pageErrors).toEqual([]);
});

test("opens oefenhanden from the menu and shows the SMB1 lesson route", async ({ page }) => {
  const pageErrors = await openFreshApp(page);

  await page.locator("#settings-summary").click();
  await expect(page.locator("#settings-summary")).toHaveAttribute("aria-expanded", "true");
  const practiceMenuLink = page.locator("#open-practice-hands");
  await expect(practiceMenuLink).toHaveText("Oefenhanden");
  await expect(practiceMenuLink).toHaveAttribute("href", "practice/index.html");
  await practiceMenuLink.click();

  await expect(page).toHaveURL(/\/practice\/index\.html$/);
  await expect(page.locator("#practice-title")).toContainText("Start met Bridge 1 oefenen");
  await expect(page.locator("[data-practice-count]")).toHaveText("12 lessen");
  await expect(page.locator("[data-practice-search]")).toHaveCount(0);
  await expect(page.locator("[data-practice-catalog]")).toHaveCount(0);
  await expect(page.locator("[data-practice-lesson]")).toHaveCount(12);
  await expect(page.locator("[data-practice-lesson='smb1-les04']")).toContainText("Speelplan");
  await expect(page.locator("body")).not.toContainText("smb1-les04-kleurcontract-plan");

  await page.goto("/practice/index.html?testHooks=1");
  await page.locator("[data-practice-lesson='smb1-les04']").evaluate((link) => link.click());
  await expect(page).toHaveURL(/lesson=smb1-les04/);
  await expect(page.locator("[data-practice-detail]")).toBeVisible();
  await expect(page.locator("[data-practice-detail-kicker]")).toHaveText("Les 4");
  await expect(page.locator("[data-practice-detail-title]")).toHaveText("Speelplan");
  await expect(page.locator("[data-practice-goals] .practice-goal-item")).toHaveCount(8);
  await expect(page.locator("[data-practice-goals]")).toContainText("In een sans-atoutcontract vaste slagen tellen.");
  await expect(page.locator("[data-practice-goals] .practice-goal-status")).toHaveCount(8);
  await expect(page.locator("[data-practice-goals] .practice-goal-status").first()).toHaveText("Nog geen tafeloefening");

  await page.locator("[data-practice-back]").click();
  await expect(page).toHaveURL(/\/practice\/index\.html\?testHooks=1$/);
  await expect(page.locator("[data-practice-lesson]")).toHaveCount(12);
  expect(pageErrors).toEqual([]);
});

test("starts an interactive SMB1 bidding exercise from the practice route", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/practice/index.html?testHooks=1&lesson=smb1-les09");
  await expect(page.locator("[data-interactive-exercise='smb1-les09-zonder-fit-1sa-antwoord-1nt']")).toBeVisible();
  await page.locator("[data-interactive-exercise='smb1-les09-zonder-fit-1sa-antwoord-1nt'] .practice-start-link").click();

  await expect(page).toHaveURL(/exercise=smb1-les09-zonder-fit-1sa-antwoord-1nt/);
  await expect.poll(() =>
    page.evaluate(() => {
      if (!window.BridgeAppTestHooks) return null;
      const state = window.BridgeAppTestHooks.getState();
      return {
        exercise: state.interactiveExercise?.id,
        phase: state.phase,
        turn: window.BridgeAppTestHooks.seatAt(state.turnIndex),
        auction: state.auction.map((call) => `${call.seat}:${window.BridgeAppTestHooks.rules.isPass(call.bid) ? "PASS" : `${call.bid.level}${call.bid.strain}`}`)
      };
    })
  ).toEqual({
    exercise: "smb1-les09-zonder-fit-1sa-antwoord-1nt",
    phase: "bidding",
    turn: "South",
    auction: ["North:1S", "East:PASS"]
  });
  await expect(page.locator("[data-interactive-exercise-question='bid']")).toContainText("geen fit");
  expect(pageErrors).toEqual([]);
});

test("blocks wrong bidding exercise choices and completes the correct call", async ({ page }) => {
  const pageErrors = await openExercise(page, "smb1-les09-zonder-fit-1sa-antwoord-1nt");

  await page.evaluate(() => window.BridgeAppTestHooks.setGuidanceMode(true));
  await expect(page.locator("#guidance-panel")).toBeHidden();
  await expect(page.locator("#bid-controls .recommended-action")).toHaveCount(0);

  await expect.poll(() => page.evaluate(() => window.BridgeAppTestHooks.getState().auction.length)).toBe(2);
  await page.locator("#bid-controls button.pass").click();
  await expect.poll(() => page.evaluate(() => window.BridgeAppTestHooks.getState().auction.length)).toBe(2);
  await expect(page.locator("#lesson-panel")).toContainText("6-9 HCP");

  await clickBidButton(page, "1NT");
  await expect.poll(() =>
    page.evaluate(() => {
      const state = window.BridgeAppTestHooks.getState();
      const last = state.auction[state.auction.length - 1];
      return {
        completed: state.interactiveExercise.completed,
        lastSeat: last.seat,
        lastCall: `${last.bid.level}${last.bid.strain}`
      };
    })
  ).toEqual({
    completed: true,
    lastSeat: "South",
    lastCall: "1NT"
  });
  await expect(page.locator("#lesson-panel")).toContainText("Goed");

  await page.locator("#lesson-panel button", { hasText: "Opnieuw proberen" }).click();
  await expect.poll(() =>
    page.evaluate(() => {
      const state = window.BridgeAppTestHooks.getState();
      return {
        completed: state.interactiveExercise.completed,
        auctionLength: state.auction.length
      };
    })
  ).toEqual({ completed: false, auctionLength: 2 });
  expect(pageErrors).toEqual([]);
});

test("moves to the next interactive SMB1 exercise within a lesson", async ({ page }) => {
  const pageErrors = await openExercise(page, "smb1-les07-openen-1sa-gebalanceerd");

  await clickBidButton(page, "1NT");
  await expect(page.locator("#lesson-panel")).toContainText("Volgende oefening");
  await page.locator("#lesson-panel button", { hasText: "Volgende oefening" }).click();

  await expect(page).toHaveURL(/exercise=smb1-les07-passen-zonder-opening-pass/);
  await expect.poll(() =>
    page.evaluate(() => {
      const state = window.BridgeAppTestHooks.getState();
      return {
        exercise: state.interactiveExercise?.id,
        seed: state.dealSeed,
        auctionLength: state.auction.length,
        turn: window.BridgeAppTestHooks.seatAt(state.turnIndex)
      };
    })
  ).toEqual({
    exercise: "smb1-les07-passen-zonder-opening-pass",
    seed: "smb1-les07-passen-zonder-opening",
    auctionLength: 0,
    turn: "South"
  });
  await expect(page.locator("[data-interactive-exercise-question='bid']")).toContainText("geen opening");

  await page.locator("#bid-controls button.pass").click();
  await expect.poll(() => page.evaluate(() => window.BridgeAppTestHooks.getState().interactiveExercise.completed)).toBe(true);
  await expect(page.locator("#lesson-panel")).toContainText("Terug naar oefeningen");
  expect(pageErrors).toEqual([]);
});

test("blocks wrong card exercise choices and suppresses card suggestions", async ({ page }) => {
  const pageErrors = await openExercise(page, "smb1-les06-deblokkeren-derde-hand-ks");

  await page.evaluate(() => window.BridgeAppTestHooks.setGuidanceMode(true));
  await expect(page.locator("#guidance-panel")).toBeHidden();
  await expect(page.locator("#exercise-trick-question")).toBeVisible();
  await expect(page.locator("#exercise-trick-question")).toContainText("Welke schoppenkaart");
  await expect(page.locator("#south-hand .recommended-card")).toHaveCount(0);

  await page.evaluate(() => window.BridgeAppTestHooks.playCard("South", "7S"));
  await expect.poll(() => page.evaluate(() => window.BridgeAppTestHooks.getState().currentTrick.length)).toBe(2);
  await expect(page.locator("#lesson-panel")).toContainText("De 7 schoppen");

  await page.evaluate(() => window.BridgeAppTestHooks.playCard("South", "KS"));
  await expect.poll(() =>
    page.evaluate(() => {
      const state = window.BridgeAppTestHooks.getState();
      return {
        completed: state.interactiveExercise.completed,
        trickLength: state.currentTrick.length,
        lastCard: state.currentTrick[state.currentTrick.length - 1]?.card.id
      };
    })
  ).toEqual({
    completed: true,
    trickLength: 3,
    lastCard: "KS"
  });
  await expect(page.locator("#lesson-panel")).toContainText("Goed");
  expect(pageErrors).toEqual([]);
});

test("shows the contract reveal before the opening lead", async ({ page }) => {
  await openFreshApp(page);

  const revealSnapshot = await page.evaluate(() => {
    const app = window.BridgeAppTestHooks;
    app.startHand({ seed: "browser-smoke-0", skipFlow: true });
    app.autoCompleteAuction({ revealContract: true });
    app.renderAll();
    const state = app.getState();
    return {
      phase: state.phase,
      declarer: state.declarer,
      leader: state.leader,
      currentTrickLength: state.currentTrick.length
    };
  });

  expect(revealSnapshot).toEqual({
    phase: "contract-reveal",
    declarer: "South",
    leader: "West",
    currentTrickLength: 0
  });
  await expect(page.locator("#contract-reveal")).toBeVisible();
  await expect(page.locator("#trick-area .card.played")).toHaveCount(0);

  await page.locator("#contract-reveal").click();
  await expect(page.locator("#contract-reveal")).toBeHidden();
  await expect.poll(() => page.evaluate(() => window.BridgeAppTestHooks.getState().phase)).toBe("playing");
  await expect(page.locator("#trick-area .card.played")).toHaveCount(1);
});

test("reveals dummy and shows the play-plan suggestion path", async ({ page }, testInfo) => {
  await openFreshApp(page);
  await prepareNorthSouthDeclarerHand(page);

  await expect(page.locator("#play-plan-panel")).toBeHidden();
  await expect(page.locator("#north-hand .card.back")).toHaveCount(13);

  await page.evaluate(() => window.BridgeAppTestHooks.continuePlay());

  await expect(page.locator("#trick-area .card.played")).toHaveCount(1);
  await expect(page.locator("#north-hand .card:not(.back)")).toHaveCount(13);
  await expect(page.locator("#dummy-notice")).toBeHidden();
  await expect(page.locator("#play-plan-panel")).toBeHidden();

  await page.evaluate(() => {
    const app = window.BridgeAppTestHooks;
    app.setState({ guidanceMode: true });
    app.renderAll();
  });
  await expect(page.locator("#play-plan-panel")).toBeVisible();
  await expect(page.locator("#guidance-panel")).toContainText("AI-suggestie kaart");

  await page.locator("#north-hand .card.legal").first().focus();
  await page.keyboard.press("Enter");
  if (testInfo.project.name === "mobile-chromium") {
    await page.locator("#north-hand .card.legal").first().focus();
    await page.keyboard.press("Enter");
  }
  await expect.poll(() => page.locator("#trick-area .card.played").count()).toBeGreaterThanOrEqual(2);
});

test("can finish a hand and shows review", async ({ page }) => {
  await openFreshApp(page);

  const completed = await page.evaluate(() => {
    const app = window.BridgeAppTestHooks;
    app.startPracticeHand("game-bonus-vulnerable-001", { skipFlow: true });
    app.setState({
      phase: "playing",
      contract: app.rules.Bid(4, "H"),
      declarer: "South",
      dummy: "North",
      leader: "West",
      turnIndex: 3
    });
    app.autoCompletePlay();
    app.renderAll();
    const state = app.getState();
    return {
      phase: state.phase,
      contract: `${state.contract.level}${state.contract.strain}`,
      declarer: state.declarer,
      score: state.finalScore?.score,
      tricksMade: state.finalScore?.made
    };
  });

  expect(completed).toEqual({
    phase: "complete",
    contract: "4H",
    declarer: "South",
    score: -200,
    tricksMade: 8
  });
  await expect(page.locator("#review-panel")).toBeVisible();
  await expect(page.locator("#review-tricks tbody tr")).toHaveCount(13);
  await expect(page.locator("#replay-panel")).toContainText("Scoreoverzicht");
});

test("can confirm Uitspelen for a visible notrump ending", async ({ page }) => {
  await openFreshApp(page);
  await setupVisibleNotrumpUitspelenEnding(page);

  await expect(page.locator("#uitspelen-button")).toBeVisible();
  await page.locator("#uitspelen-button").click();
  await expect(page.locator("#uitspelen-dialog")).toBeVisible();
  await expect(page.locator("#uitspelen-summary")).toContainText("De rest ligt vast: 1 slag");
  await expect(page.locator("#uitspelen-summary")).toContainText("Noord/Zuid 1 slag");
  await expect(page.locator("#uitspelen-summary")).toContainText("Oost/West 0 slagen");
  await expect(page.locator("#uitspelen-dialog")).not.toContainText(/Claimen|Geven/);

  await page.locator("#uitspelen-confirm").click();

  await expect.poll(() => page.evaluate(() => window.BridgeAppTestHooks.getState().phase)).toBe("complete");
  await expect(page.locator("#replay-panel")).toContainText("Scoreoverzicht");
  await expect(page.locator("#review-panel")).toBeVisible();
  await expect(page.locator("#review-tricks tbody tr")).toHaveCount(13);
});

test("shows unavailable Uitspelen reasons only in developer mode", async ({ page }) => {
  await openFreshApp(page);
  await setupHiddenHigherUnavailableUitspelenEnding(page);

  await expect(page.locator("#uitspelen-button")).toBeHidden();
  await expect(page.locator("#uitspelen-unavailable")).toBeHidden();
  await expect
    .poll(() => page.evaluate(() => window.BridgeAppTestHooks.currentUitspelenAnalysis().reason))
    .toBe("hiddenHigherCard");

  await page.evaluate(() => {
    const app = window.BridgeAppTestHooks;
    app.setState({ developerMode: true });
    app.renderAll();
  });

  await expect(page.locator("#uitspelen-unavailable")).toBeVisible();
  await expect(page.locator("#uitspelen-unavailable")).toContainText("verborgen hogere kaart mogelijk");

  const budgetReason = await page.evaluate(() => {
    const app = window.BridgeAppTestHooks;
    app.setState({
      deterministicPlayoutProof: null,
      deterministicPlayoutSearchNodeBudget: 1
    });
    app.renderAll();
    return app.currentUitspelenAnalysis();
  });

  expect(budgetReason.available).toBe(false);
  expect(budgetReason.reason).toBe("searchNodeBudgetExhausted");
  await expect(page.locator("#uitspelen-unavailable")).toContainText("zoekbudget op");
  await expect(page.locator("#uitspelen-unavailable")).toContainText("1/1 nodes");
});

test("shows Uitspelen for a visible suit ending when no hidden trump ruff is possible", async ({ page }) => {
  await openFreshApp(page);
  await setupVisibleSuitUitspelenEnding(page);

  await expect(page.locator("#uitspelen-button")).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => {
      const analysis = window.BridgeAppTestHooks.currentUitspelenAnalysis();
      return {
        available: analysis.available,
        reason: analysis.reason,
        trump: analysis.trump,
        winningSeats: analysis.winningSeats
      };
    }))
    .toEqual({
      available: true,
      reason: "visibleSuitTopWinnersNoRuff",
      trump: "S",
      winningSeats: ["South"]
    });
});

test("shows Uitspelen for an ordinary practice hand when proof succeeds", async ({ page }) => {
  await openFreshApp(page);
  await setupVisibleNotrumpUitspelenEnding(page, { practiceHand: true });

  await expect
    .poll(() => page.evaluate(() => window.BridgeAppTestHooks.getState().practice?.id || null))
    .toBe("draw-trumps-001");
  await expect(page.locator("#uitspelen-button")).toBeVisible();
});

test("keeps Uitspelen available across a matching stored proof prefix", async ({ page }) => {
  await openFreshApp(page);
  await setupTwoTrickVisibleNotrumpUitspelenEnding(page);

  await expect(page.locator("#uitspelen-button")).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => window.BridgeAppTestHooks.currentUitspelenAnalysis().proofSource))
    .toBe("stored");

  const prefix = await autoPlayFirstStoredUitspelenStep(page);

  expect(prefix).toEqual({
    historyLength: 12,
    proofSource: "stored",
    remainingTricks: 1,
    available: true
  });
  await expect(page.locator("#uitspelen-button")).toBeVisible();
});

test("hides Uitspelen and clears stored proof when the state is no longer a proven prefix", async ({ page }) => {
  await openFreshApp(page);
  await setupTwoTrickVisibleNotrumpUitspelenEnding(page);

  await expect(page.locator("#uitspelen-button")).toBeVisible();
  const stale = await page.evaluate(() => {
    const app = window.BridgeAppTestHooks;
    const analysis = app.currentUitspelenAnalysis();
    const state = app.getState();
    const step = analysis.sequence[0];
    const makeCard = (id) => ({ id, rank: id.slice(0, -1), suit: id.slice(-1) });
    const staleTrick = {
      number: state.trickHistory.length + 1,
      winner: "North",
      cards: [
        { seat: step.leader, card: makeCard(step.leadCardId) },
        { seat: "North", card: makeCard("2C") },
        { seat: "East", card: makeCard("2D") },
        { seat: "South", card: makeCard("4H") }
      ]
    };
    app.setState({
      trickHistory: [...state.trickHistory, staleTrick],
      turnIndex: 0,
      tricks: { ...state.tricks, NS: state.tricks.NS + 1 }
    });
    app.renderAll();
    const next = app.currentUitspelenAnalysis();
    return {
      available: next.available,
      reason: next.reason,
      proof: app.getState().deterministicPlayoutProof
    };
  });

  expect(stale).toEqual({
    available: false,
    reason: "currentTurnHidden",
    proof: null
  });
  await expect(page.locator("#uitspelen-button")).toBeHidden();
});

test("hard-fails confirmed Uitspelen when the completed trick winner disagrees with proof", async ({ page }) => {
  await openFreshApp(page);
  await setupTwoTrickVisibleNotrumpUitspelenEnding(page);

  const mismatch = await page.evaluate(() => {
    const app = window.BridgeAppTestHooks;
    const analysis = app.currentUitspelenAnalysis();
    const badAnalysis = {
      ...analysis,
      sequence: analysis.sequence.map((step, index) => index === 0 ? { ...step, winnerSeat: "South" } : step)
    };
    try {
      app.playOutDeterministicEnding(badAnalysis);
      return { message: null };
    } catch (error) {
      return {
        message: error.message,
        historyLength: app.getState().trickHistory.length
      };
    }
  });

  expect(mismatch.message).toContain("Uitspelen proof mismatch");
  expect(mismatch.message).toContain("expected South");
  expect(mismatch.historyLength).toBe(12);
});

test("places Uitspelen bottom-right on desktop without covering play areas", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Desktop-only Uitspelen placement");
  await openLayoutCheckApp(page);
  await setupVisibleNotrumpUitspelenEnding(page);

  await expect(page.locator("#uitspelen-button")).toBeVisible();
  const layout = await measureUitspelenPlacement(page);

  expect(layout.button.right).toBeLessThanOrEqual(layout.table.right - 12);
  expect(layout.button.bottom).toBeLessThanOrEqual(layout.table.bottom - 12);
  expect(layout.button.right).toBeGreaterThan(layout.table.right - 150);
  expect(layout.button.bottom).toBeGreaterThan(layout.table.bottom - 70);
  expect(layout.overlaps).toEqual({
    northLabel: false,
    northCards: false,
    southCards: false,
    trickArea: false
  });
});

test("places Uitspelen below the North label on mobile without covering play areas", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "Mobile-only Uitspelen placement");
  await openLayoutCheckApp(page);
  await setupVisibleNotrumpUitspelenEnding(page);

  await expect(page.locator("#uitspelen-button")).toBeVisible();
  const layout = await measureUitspelenPlacement(page);

  expect(layout.button.top).toBeGreaterThanOrEqual(layout.northLabel.bottom - 1);
  expect(Math.abs(layout.button.centerX - layout.northLabel.centerX)).toBeLessThanOrEqual(8);
  expect(layout.button.bottom).toBeLessThanOrEqual(layout.trickArea.top - 1);
  expect(layout.overlaps).toEqual({
    northLabel: false,
    northCards: false,
    southCards: false,
    trickArea: false
  });
});

test("hides Uitspelen while an active lesson-board step suppresses it", async ({ page }) => {
  await openFreshApp(page);
  await setupVisibleNotrumpUitspelenEnding(page, {
    lessonStep: {
      id: "playExpectedLessonCard",
      title: "Kies de leskaart",
      body: "Deze stap verwacht dat je zelf de bedoelde kaart speelt.",
      badge: "Lesstap",
      target: "legalCards",
      buttonLabel: "Ik kies zelf",
      gate: "allowHumanPlay",
      suppressUitspelen: true
    }
  });

  await expect(page.locator("#lesson-banner")).toContainText("Kies de leskaart");
  await expect(page.locator("#uitspelen-button")).toBeHidden();
});

test("closes Uitspelen with Escape, cancel, or close without changing hand state", async ({ page }, testInfo) => {
  await openFreshApp(page);
  await setupVisibleNotrumpUitspelenEnding(page);

  const stableState = () => page.evaluate(() => window.BridgeAppTestHooks.getState());
  const dialog = page.locator("#uitspelen-dialog");
  const button = page.locator("#uitspelen-button");
  const openDialog = async () => {
    await expect(button).toBeVisible();
    await button.evaluate((element) => element.click());
    await expect(dialog).toBeVisible();
  };

  await expect(button).toBeVisible();

  await openDialog();
  const beforeEscape = await stableState();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  expect(await stableState()).toEqual(beforeEscape);
  await expect(button).toBeVisible();

  await openDialog();
  const beforeCancel = await stableState();
  await page.locator("#uitspelen-cancel").click();
  await expect(dialog).toBeHidden();
  expect(await stableState()).toEqual(beforeCancel);
  await expect(button).toBeVisible();

  await openDialog();
  const beforeClose = await stableState();
  await page.locator("#uitspelen-close").click();
  await expect(dialog).toBeHidden();
  expect(await stableState()).toEqual(beforeClose);
  await expect(button).toBeVisible();

  await page.locator("#south-hand .card.legal").first().focus();
  await page.keyboard.press("Enter");
  if (testInfo.project.name === "mobile-chromium") {
    await page.locator("#south-hand .card.legal").first().focus();
    await page.keyboard.press("Enter");
  }
  await expect.poll(() =>
    page.evaluate(() => window.BridgeAppTestHooks.getState().currentTrick.length)
  ).toBeGreaterThan(0);
});

test("keeps the desktop bidding layout stable", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Desktop-only layout smoke");
  await openFreshApp(page);

  await page.evaluate(() => {
    const app = window.BridgeAppTestHooks;
    app.startHand({ seed: "desktop-smoke-sidebars", skipFlow: true });
    app.setState({
      phase: "bidding",
      animateDeal: false,
      guidanceMode: true,
      showPlayHistory: false,
      turnIndex: 2,
      auction: [
        { seat: "North", bid: app.rules.Bid(1, "H") },
        { seat: "East", bid: app.rules.Pass() }
      ]
    });
    app.renderAll();
  });

  await expect(page.locator(".app-shell")).toHaveClass(/has-stable-sidebars/);
  await expect(page.locator(".app-shell")).toHaveClass(/is-table-bidding/);
  await expect(page.locator(".app-shell")).not.toHaveClass(/is-mobile-bidding/);
  await expect(page.locator("#mobile-bidding-slot > #bid-controls")).toBeVisible();
  await expect(page.locator("#history-panel")).toHaveClass(/is-empty-reserved/);
  await expect(page.locator("#bid-controls")).toHaveClass(/active-bid-box/);
});

test("keeps the mobile bidding box usable", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "Mobile-only layout smoke");
  await openFreshApp(page);

  await page.evaluate(() => {
    const app = window.BridgeAppTestHooks;
    app.startHand({ seed: "mobile-smoke-bidding", skipFlow: true });
    app.setState({
      phase: "bidding",
      animateDeal: false,
      turnIndex: 2,
      auction: [
        { seat: "North", bid: app.rules.Pass() },
        { seat: "East", bid: app.rules.Pass() }
      ]
    });
    app.renderAll();
  });

  await expect(page.locator(".app-shell")).toHaveClass(/is-mobile-bidding/);
  await expect(page.locator("#mobile-bidding-slot > #bid-controls")).toBeVisible();
  await expect(page.locator("#bid-controls")).toHaveClass(/active-bid-box/);
  await expect(page.locator("#bid-controls button.pass")).toBeVisible();
});

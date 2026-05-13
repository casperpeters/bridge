const { expect, test } = require("@playwright/test");
const {
  openFreshApp,
  prepareNorthSouthDeclarerHand
} = require("./helpers/app-test-utils");

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
  await expect(page.locator("#trick-area .card.played")).toHaveCount(2);
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
    score: 620,
    tricksMade: 10
  });
  await expect(page.locator("#review-panel")).toBeVisible();
  await expect(page.locator("#review-tricks tbody tr")).toHaveCount(13);
  await expect(page.locator("#replay-panel")).toContainText("Scoreoverzicht");
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

const { expect, test } = require("@playwright/test");

async function openFreshApp(page) {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator("#app-heading")).toContainText("Vijfkaart Hoog");

  return pageErrors;
}

async function prepareNorthSouthDeclarerHand(page) {
  const stateSnapshot = await page.evaluate(() => {
    startHand({ seed: "browser-smoke-0", skipFlow: true });
    autoCompleteAuction();
    renderAll();
    return {
      contractText: document.querySelector("#contract").textContent,
      statusText: document.querySelector("#status").textContent
    };
  });

  expect(stateSnapshot.contractText).toContain("Zuid");
  expect(stateSnapshot.statusText).toContain("komt uit");
}

test("loads the live table and lets South make an auction call", async ({ page }) => {
  const pageErrors = await openFreshApp(page);

  await expect(page.locator("#south-hand .card")).toHaveCount(13);
  await expect(page.locator("#north-hand .card.back")).toHaveCount(13);
  await expect(page.locator("#status")).toHaveClass(/sr-only/);
  await expect(page.locator("#hint-button")).toBeVisible();
  await expect(page.locator("#bid-controls")).toHaveClass(/active-bid-box/);
  await expect(page.locator(".game-summary #contract")).toContainText("Bieden");
  await expect(page.locator(".game-summary #scoreline")).toContainText("Kwetsbaarheid");
  await expect(page.locator("#bid-controls button.pass")).toBeVisible();

  await page.evaluate(() => {
    state.guidanceMode = true;
    renderAll();
  });
  await expect(page.locator("#guidance-panel")).toContainText("AI-suggestie bod");
  await expect(page.locator("#guidance-panel")).toContainText("Regel:");
  await expect(page.locator("#guidance-panel")).not.toContainText("Dit is heuristisch advies op basis van de huidige Vijfkaart-Hoog-regels.");

  await page.locator("#bid-controls button.pass").click();
  await expect(page.locator("#auction-log")).toContainText("Pas");
  expect(pageErrors).toEqual([]);
});

test("developer bid explanations use rule references without the old source line", async ({ page }) => {
  await openFreshApp(page);

  await page.evaluate(() => {
    state.developerMode = true;
    state.guidanceMode = true;
    renderAll();
  });
  const suggestedAction = await page.locator("#guidance-panel strong").textContent();
  const suggestedBid = suggestedAction.split(": ").pop();

  await page.locator(".bid-controls .recommended-action").click();
  await expect(page.locator("#bid-explanations")).toContainText(suggestedBid);
  await expect(page.locator("#bid-explanations")).toContainText("Regel:");
  await expect(page.locator("#bid-explanations")).not.toContainText("Bron: huidige Vijfkaart-Hoog-heuristiek; nog geen volledige systeemkaart.");
});

test("glossary opens from the toolbar and linked explanation terms", async ({ page }) => {
  await openFreshApp(page);

  await page.locator("#open-glossary").click();
  await expect(page.locator("#glossary-dialog")).toBeVisible();
  await expect(page.locator("#glossary-list")).toContainText("Contract");
  await expect(page.locator("#glossary-list")).toContainText("Deler");
  await expect(page.locator("#glossary-list")).toContainText("Kwetsbaarheid");
  await expect(page.locator("#glossary-list")).toContainText("Kleur bekennen");
  await expect(page.locator("#glossary-list")).toContainText("Slag");
  await expect(page.locator("#glossary-list")).toContainText("Slem");
  await expect(page.locator("#glossary-list")).toContainText("Overslag");
  await expect(page.locator("#glossary-list")).toContainText("Onderslag");
  await page.locator(".glossary-list-button", { hasText: "Leider" }).click();
  await expect(page.locator("#glossary-definition")).toContainText("speelsoort als eerste bood");
  await page.locator(".glossary-list-button", { hasText: "Manche" }).click();
  await expect(page.locator("#glossary-definition")).toContainText("minstens 100 contractpunten");
  await page.locator("#glossary-search").fill("gever");
  await expect(page.locator(".glossary-list-button")).toHaveCount(1);
  await expect(page.locator("#glossary-list")).toContainText("Deler");
  await expect(page.locator("#glossary-term")).toHaveText("Deler");
  await page.locator("#glossary-search").fill("contractpunten");
  await expect(page.locator("#glossary-list")).toContainText("Manche");
  await page.locator("#glossary-search").fill("bestaatniet");
  await expect(page.locator("#glossary-list")).toContainText("Geen begrippen gevonden.");
  await expect(page.locator("#glossary-term")).toHaveText("Geen resultaat");
  await page.locator("#glossary-search").clear();
  await expect(page.locator("#glossary-list")).toContainText("Contract");
  await page.locator("#close-glossary").click();

  await page.evaluate(() => {
    state.developerMode = true;
    state.guidanceMode = true;
    renderAll();
  });
  await page.locator(".bid-controls .recommended-action").click();

  const openingLink = page.locator("#bid-explanations .glossary-link", { hasText: "Opening" }).first();
  await expect(openingLink).toBeVisible();
  await openingLink.click();
  await expect(page.locator("#glossary-dialog")).toBeVisible();
  await expect(page.locator("#glossary-term")).toHaveText("Opening");
  await expect(page.locator("#glossary-definition")).toContainText("eerste bod");
});

test("developer bid explanations describe opener rebids after notrump responses", async ({ page }) => {
  await openFreshApp(page);

  await page.evaluate(() => {
    const makeCard = (id) => ({ id, rank: id.slice(0, -1), suit: id.slice(-1) });
    const southHand = [
      "AS", "KS", "QS", "2S", "3S",
      "AH", "KH", "QH", "2H",
      "2D", "3D",
      "2C", "3C"
    ].map(makeCard);
    state.developerMode = true;
    state.guidanceMode = false;
    state.phase = "bidding";
    state.hands.South = southHand;
    state.auction = [
      { seat: "South", bid: bridgeRules.Bid(1, "S"), bidResult: bridgeRules.chooseFiveCardHighBidResult({ hand: southHand, auction: [], seat: "South", vulnerability: state.vulnerability }) },
      { seat: "West", bid: bridgeRules.Pass() },
      { seat: "North", bid: bridgeRules.Bid(1, "NT") },
      { seat: "East", bid: bridgeRules.Pass() }
    ];
    const bidResult = bridgeRules.chooseFiveCardHighBidResult({
      hand: southHand,
      auction: state.auction,
      seat: "South",
      vulnerability: state.vulnerability
    });
    state.auction.push({ seat: "South", bid: bidResult.bid, bidResult });
    renderAll();
  });

  await expect(page.locator("#bid-explanations")).toContainText("herbieding na partners 1SA");
  await expect(page.locator("#bid-explanations")).toContainText("tweekleurenspel");
  await expect(page.locator("#bid-explanations")).toContainText("18-19 HCP");
  await expect(page.locator("#bid-explanations")).toContainText("Regel: continuation.openerAfterOneNtTwoSuiterHigh");
});

test("keeps dummy and the play plan hidden until after the opening lead", async ({ page }) => {
  await openFreshApp(page);
  await prepareNorthSouthDeclarerHand(page);

  await expect(page.locator("#play-plan-panel")).toBeHidden();
  await expect(page.locator("#dummy-notice")).toBeHidden();
  await expect(page.locator("#north-hand .card.back")).toHaveCount(13);
  await expect(page.locator("#trick-area .card.played")).toHaveCount(0);

  await page.evaluate(() => continuePlay());

  await expect(page.locator("#trick-area .card.played")).toHaveCount(1);
  await expect(page.locator("#north-hand .card:not(.back)")).toHaveCount(13);
  await expect(page.locator(".table-area")).toHaveClass(/turn-focus-north/);
  await expect(page.locator("#dummy-notice")).toContainText("dummy");
  await expect(page.locator("#play-plan-panel")).toBeVisible();

  await page.locator("#north-hand .card.legal").first().focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#trick-area .card.played")).toHaveCount(2);

  await page.evaluate(() => {
    state.guidanceMode = true;
    state.currentTrick = [];
    state.trickHistory = [{ number: 1, winner: state.declarer, cards: [] }];
    state.turnIndex = seats.indexOf(state.declarer);
    state.playPlan = null;
    clearTrickSlots();
    renderAll();
  });
  await expect(page.locator("#guidance-panel")).toBeVisible();
  await expect(page.locator("#guidance-panel")).toContainText("speelplan");
});

test("can finish a hand and copy a feedback report from the review", async ({ page, context, baseURL }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: baseURL });
  await openFreshApp(page);

  await page.locator("#quick-review").click();

  await expect(page.locator("#review-panel")).toBeVisible();
  await expect(page.locator("#review-summary")).toContainText("Contract");
  await expect(page.locator("#review-summary")).toContainText("Score-uitleg");
  await expect(page.locator("#review-summary")).toContainText("Contractdoel");
  await expect(page.locator("#review-summary")).toContainText("Eindscore");
  await expect(page.locator("#review-tricks tbody tr")).toHaveCount(13);

  await page.locator("#open-feedback").click();
  await expect(page.locator("#feedback-dialog")).toBeVisible();
  await page.locator("#feedback-message").fill("Smoke test report");

  await page.locator("#copy-feedback").click();

  await expect(page.locator("#feedback-state")).toContainText("Feedbackrapport");
  const report = await page.evaluate(() => navigator.clipboard.readText());
  expect(report).toContain("Smoke test report");
  expect(report).toContain("## Handcontext");
  expect(report).toContain("## Slagenoverzicht");
});

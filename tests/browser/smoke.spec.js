const { expect, test } = require("@playwright/test");

async function openFreshApp(page) {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/?testHooks=1");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator("#app-heading")).toContainText("Vijfkaart Hoog");

  return pageErrors;
}

async function prepareNorthSouthDeclarerHand(page) {
  const stateSnapshot = await page.evaluate(() => {
    const app = window.BridgeAppTestHooks;
    app.startHand({ seed: "browser-smoke-0", skipFlow: true });
    app.autoCompleteAuction();
    app.renderAll();
    return {
      contractText: document.querySelector("#contract").textContent,
      statusText: document.querySelector("#status").textContent
    };
  });

  expect(stateSnapshot.contractText).toContain("Zuid");
  expect(stateSnapshot.statusText).toContain("komt uit");
}

async function clickMenuButton(page, selector) {
  const menu = page.locator(".app-menu");
  await menu.locator("summary").click();
  await expect(menu).toHaveAttribute("open", "");
  await page.locator(selector).click();
}

test("keeps tester-only menu actions behind developer mode", async ({ page }) => {
  await openFreshApp(page);
  await page.evaluate(() => window.BridgeAppTestHooks.setDeveloperMode(false));

  const menu = page.locator(".app-menu");
  await menu.locator("summary").click();
  await expect(page.locator("#quick-review")).toBeHidden();

  await page.evaluate(() => window.BridgeAppTestHooks.setDeveloperMode(true));
  await expect(page.locator("#quick-review")).toBeVisible();
});

test("keeps Stop and Alert in a persisted expandable bidding bar", async ({ page }) => {
  await openFreshApp(page);

  await expect(page.locator("#bid-controls button.double")).toBeVisible();
  await expect(page.locator("#bid-controls button.pass")).toBeVisible();
  await expect(page.locator("#bid-controls button.redouble")).toBeVisible();
  await expect(page.locator("#bid-controls button.stop")).toBeHidden();
  await expect(page.locator("#bid-controls button.alert")).toBeHidden();

  const toggle = page.locator("#bid-controls button.bid-advanced-toggle");
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#bid-controls button.stop")).toBeVisible();
  await expect(page.locator("#bid-controls button.alert")).toBeVisible();

  await page.reload();
  await expect(page.locator("#app-heading")).toContainText("Vijfkaart Hoog");
  await expect(page.locator("#bid-controls button.bid-advanced-toggle")).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#bid-controls button.stop")).toBeVisible();

  await page.locator("#bid-controls button.stop").click();
  await page.locator("#bid-controls button.pass").click();
  await expect(page.locator("#auction-log")).toContainText("Stop");
  await expect(page.locator("#auction-log")).toContainText("Pas");
});

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

  await page.evaluate(() => window.BridgeAppTestHooks.setGuidanceMode(true));
  await expect(page.locator("#guidance-panel")).toContainText("AI-suggestie bod");
  await expect(page.locator("#guidance-panel")).toContainText("Regel:");
  await expect(page.locator("#guidance-panel")).not.toContainText("Dit is heuristisch advies op basis van de huidige Vijfkaart-Hoog-regels.");

  await page.locator("#bid-controls button.pass").click();
  await expect(page.locator("#auction-log")).toContainText("Pas");
  expect(pageErrors).toEqual([]);
});

test("loads curated practice hands through the repeat-code field", async ({ page }) => {
  await openFreshApp(page);

  const snapshot = await page.evaluate(() => {
    const app = window.BridgeAppTestHooks;
    app.getEls().seedInput.value = "stayman-after-1nt-001";
    app.loadSeedFromInput();
    const state = app.getState();
    return {
      seed: state.dealSeed,
      practiceId: state.practice?.id,
      practiceTitle: state.practice?.title,
      dealer: app.seatAt(state.dealerIndex),
      vulnerability: state.vulnerability,
      southHand: state.hands.South.map((card) => card.id)
    };
  });

  expect(snapshot.seed).toBe("stayman-after-1nt-001");
  expect(snapshot.practiceId).toBe("stayman-after-1nt-001");
  expect(snapshot.practiceTitle).toContain("Stayman");
  expect(snapshot.dealer).toBe("North");
  expect(snapshot.vulnerability).toBe("none");
  expect(snapshot.southHand).toContain("KS");
  await expect(page.locator("#seed-description")).toContainText("Code geladen");
});

test("stores South convention metadata without showing an AI suggestion", async ({ page }) => {
  await openFreshApp(page);

  const snapshot = await page.evaluate(() => {
    const app = window.BridgeAppTestHooks;
    const rules = app.rules;
    const makeCard = app.makeCard;
    const current = app.getState();
    const southHand = [
      "2S", "3S", "4S",
      "AH", "KH", "QH", "2H", "3H",
      "2D", "3D",
      "2C", "3C", "4C"
    ].map(makeCard);
    app.setState({
      phase: "bidding",
      guidanceMode: false,
      turnIndex: 2,
      vulnerability: "none",
      hands: { ...current.hands, South: southHand },
      auction: [
        { seat: "North", bid: rules.Bid(1, "NT") },
        { seat: "East", bid: rules.Pass() }
      ]
    });
    app.renderAll();

    const recommendedCount = document.querySelectorAll("#bid-controls .recommended-action").length;
    const transferButton = [...document.querySelectorAll("#bid-controls button.bid")]
      .find((button) => button.textContent === "2\u2666");
    transferButton.click();

    const call = app.getState().auction.at(-1);
    return {
      recommendedCount,
      bid: `${call.bid.level}${call.bid.strain}`,
      ruleId: call.bidResult?.ruleId || null,
      transferSuit: call.bidResult?.transferSuit || null,
      recommendedRuleId: call.recommendedBidResult?.ruleId || null
    };
  });

  expect(snapshot).toEqual({
    recommendedCount: 0,
    bid: "2D",
    ruleId: "fiveCardHigh.response.transferToH",
    transferSuit: "H",
    recommendedRuleId: null
  });
});

test("developer bid explanations use rule references without the old source line", async ({ page }) => {
  await openFreshApp(page);

  await page.evaluate(() => {
    const app = window.BridgeAppTestHooks;
    app.setState({ developerMode: true, guidanceMode: true });
    app.renderAll();
  });
  const suggestedAction = await page.locator("#guidance-panel strong").textContent();
  const suggestedBid = suggestedAction.split(": ").pop();

  await page.locator(".bid-controls .recommended-action").click();
  await expect(page.locator("#bid-explanations")).toContainText(suggestedBid);
  await expect(page.locator("#bid-explanations")).toContainText("Regel:");
  await expect(page.locator("#bid-explanations")).not.toContainText("Bron: huidige Vijfkaart-Hoog-heuristiek; nog geen volledige systeemkaart.");
});

test("developer bid explanations flag South calls that differ from the heuristic", async ({ page }) => {
  await openFreshApp(page);

  await page.evaluate(() => {
    const app = window.BridgeAppTestHooks;
    app.startHand({ seed: "bid-deviation-smoke", skipFlow: true });
    const rules = app.rules;
    app.setState({
      developerMode: true,
      guidanceMode: true,
      phase: "bidding",
      turnIndex: 2,
      auction: []
    });
    const recommended = app.chooseRecommendedBidResult("South");
    const alternate = app.sameCall(recommended.bid, rules.Pass())
      ? rules.Bid(1, "C")
      : rules.Pass();
    app.makeBid("South", alternate, recommended);
  });

  await expect(page.locator("#bid-explanations")).toContainText("wijkt af van de biedheuristiek");
  await expect(page.locator("#bid-explanations")).toContainText("De heuristiek stelde");
  await expect(page.locator("#bid-explanations")).toContainText("Gekozen bod");
});

test("glossary opens from the toolbar and linked explanation terms", async ({ page }) => {
  await openFreshApp(page);

  await clickMenuButton(page, "#open-glossary");
  await expect(page.locator("#glossary-dialog")).toBeVisible();
  const expectedGlossaryTerms = [
    "Afgooien",
    "Bijkleur",
    "Blokkeren",
    "Contract",
    "Contractpunten",
    "Deler",
    "Doublet",
    "Fitpunten",
    "Forcing",
    "HCP",
    "Herbieding",
    "Incasseren",
    "Invite",
    "Kleur bekennen",
    "Kleurcontract",
    "Kwetsbaarheid",
    "Maximum",
    "Minimum",
    "Onderslag",
    "Openingskracht",
    "Overslag",
    "Redoublet",
    "Slag",
    "Slem",
    "Stopper",
    "Troef trekken",
    "Verliezers",
    "Vierde-kleur-forcing",
    "Vrijspelen"
  ];
  for (const term of expectedGlossaryTerms) {
    await expect(page.locator("#glossary-list")).toContainText(term);
  }
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
  await page.locator("#glossary-search").fill("staymanconventie");
  await expect(page.locator("#glossary-list")).toContainText("Stayman");
  await expect(page.locator("#glossary-term")).toHaveText("Stayman");
  await page.locator("#glossary-search").fill("honneurpunten");
  await expect(page.locator("#glossary-term")).toHaveText("HCP");
  await page.locator("#glossary-search").fill("mancheforcing");
  await expect(page.locator("#glossary-term")).toHaveText("Forcing");
  await page.locator("#glossary-search").fill("maximumhand");
  await expect(page.locator("#glossary-term")).toHaveText("Maximum");
  await page.locator("#glossary-search").fill("minimumhand");
  await expect(page.locator("#glossary-term")).toHaveText("Minimum");
  await page.locator("#glossary-search").fill("dekking");
  await expect(page.locator("#glossary-term")).toHaveText("Stopper");
  await page.locator("#glossary-search").fill("troeftrekken");
  await expect(page.locator("#glossary-term")).toHaveText("Troef trekken");
  await page.locator("#glossary-search").fill("vierde kleur forcing");
  await expect(page.locator("#glossary-term")).toHaveText("Vierde-kleur-forcing");
  await page.locator("#glossary-search").fill("openingskracht");
  await expect(page.locator("#glossary-list")).toContainText("Openingskracht");
  await expect(page.locator("#glossary-definition")).toContainText("sterk genoeg");
  await page.locator("#glossary-search").fill("verliezer");
  await expect(page.locator("#glossary-list")).toContainText("Verliezers");
  await page.locator(".glossary-list-button", { hasText: "Verliezers" }).click();
  await expect(page.locator("#glossary-term")).toHaveText("Verliezers");
  await page.locator("#glossary-search").fill("bestaatniet");
  await expect(page.locator("#glossary-list")).toContainText("Geen begrippen gevonden.");
  await expect(page.locator("#glossary-term")).toHaveText("Geen resultaat");
  await page.locator("#glossary-search").clear();
  await expect(page.locator("#glossary-list")).toContainText("Contract");
  await page.locator("#close-glossary").click();

  await page.evaluate(() => {
    const app = window.BridgeAppTestHooks;
    app.setState({ developerMode: true, guidanceMode: true });
    app.renderAll();
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
    const app = window.BridgeAppTestHooks;
    const rules = app.rules;
    const makeCard = app.makeCard;
    const southHand = [
      "AS", "KS", "QS", "2S", "3S",
      "AH", "KH", "QH", "2H",
      "2D", "3D",
      "2C", "3C"
    ].map(makeCard);
    const current = app.getState();
    const auction = [
      {
        seat: "South",
        bid: rules.Bid(1, "S"),
        bidResult: rules.chooseBid({
          systemId: current.biddingSystemId,
          hand: southHand,
          auction: [],
          seat: "South",
          vulnerability: current.vulnerability,
          agreements: current.biddingAgreements
        })
      },
      { seat: "West", bid: rules.Pass() },
      { seat: "North", bid: rules.Bid(1, "NT") },
      { seat: "East", bid: rules.Pass() }
    ];
    app.setState({
      developerMode: true,
      guidanceMode: false,
      phase: "bidding",
      hands: { ...current.hands, South: southHand },
      auction
    });
    const bidResult = rules.chooseBid({
      systemId: current.biddingSystemId,
      hand: southHand,
      auction,
      seat: "South",
      vulnerability: current.vulnerability,
      agreements: current.biddingAgreements
    });
    app.setState({ auction: [...auction, { seat: "South", bid: bidResult.bid, bidResult }] });
    app.renderAll();
  });

  await expect(page.locator("#bid-explanations")).toContainText("herbieding na partners 1SA");
  await expect(page.locator("#bid-explanations")).toContainText("tweekleurenspel");
  await expect(page.locator("#bid-explanations")).toContainText("18-19 HCP");
  await expect(page.locator("#bid-explanations")).toContainText("Regel: continuation.openerAfterOneNtTwoSuiterHigh");
});

test("developer bid explanations describe fourth-suit forcing as artificial", async ({ page }) => {
  await openFreshApp(page);

  await page.evaluate(() => {
    const app = window.BridgeAppTestHooks;
    const rules = app.rules;
    const makeCard = app.makeCard;
    const northHand = [
      "AS", "7S", "6S", "5S",
      "4H", "3H",
      "7D", "6D",
      "AC", "KC", "QC", "6C", "5C"
    ].map(makeCard);
    const current = app.getState();
    const auction = [
      { seat: "South", bid: rules.Bid(1, "H") },
      { seat: "West", bid: rules.Pass() },
      { seat: "North", bid: rules.Bid(1, "S") },
      { seat: "East", bid: rules.Pass() },
      { seat: "South", bid: rules.Bid(2, "D") },
      { seat: "West", bid: rules.Pass() }
    ];
    app.setState({
      developerMode: true,
      guidanceMode: false,
      phase: "bidding",
      hands: { ...current.hands, North: northHand },
      auction
    });
    const bidResult = rules.chooseBid({
      systemId: current.biddingSystemId,
      hand: northHand,
      auction,
      seat: "North",
      vulnerability: current.vulnerability,
      agreements: current.biddingAgreements
    });
    app.setState({ auction: [...auction, { seat: "North", bid: bidResult.bid, bidResult }] });
    app.renderAll();
  });

  await expect(page.locator("#bid-explanations")).toContainText("vierde-kleur-forcing");
  await expect(page.locator("#bid-explanations")).toContainText("kunstmatig mancheforcing");
  await expect(page.locator("#bid-explanations")).toContainText("Regel: continuation.responderFourthSuitForcing");
});

test("shows compact feedback when a player clicks an illegal card", async ({ page }) => {
  await openFreshApp(page);

  await page.evaluate(() => {
    const app = window.BridgeAppTestHooks;
    const makeCard = app.makeCard;
    const hands = {
      North: [],
      East: [],
      South: [makeCard("AS"), makeCard("2H")],
      West: []
    };
    app.setState({
      phase: "playing",
      turnIndex: 2,
      contract: app.rules.Bid(1, "H"),
      declarer: "North",
      dummy: "South",
      currentTrick: [{ seat: "West", card: makeCard("KH") }],
      awaitingTrickAdvance: false,
      trickAdvanceArmed: false,
      hands,
      originalHands: hands
    });
    app.renderAll();
  });

  await page.locator('#south-hand .card[aria-label="A schoppen"]').click();
  await expect(page.locator("#table-feedback")).toContainText("Bekennen: speel eerst harten.");

  const afterIllegalClick = await page.evaluate(() => {
    const state = window.BridgeAppTestHooks.getState();
    return {
      currentTrickLength: state.currentTrick.length,
      southHandLength: state.hands.South.length
    };
  });
  expect(afterIllegalClick).toEqual({ currentTrickLength: 1, southHandLength: 2 });

  await page.locator('#south-hand .card[aria-label="2 harten"]').click();
  await expect(page.locator("#table-feedback")).toBeHidden();
});

test("shows a separate status for South opening lead", async ({ page }) => {
  await openFreshApp(page);

  await page.evaluate(() => {
    const app = window.BridgeAppTestHooks;
    const makeCard = app.makeCard;
    const hands = {
      North: [makeCard("2S")],
      East: [makeCard("3S")],
      South: [makeCard("4S")],
      West: [makeCard("5S")]
    };
    app.setState({
      phase: "playing",
      turnIndex: 2,
      contract: app.rules.Bid(2, "C"),
      declarer: "East",
      dummy: "West",
      currentTrick: [],
      trickHistory: [],
      awaitingTrickAdvance: false,
      hands,
      originalHands: hands
    });
    app.clearTrickSlots();
    app.continuePlay();
  });

  await expect(page.locator("#status")).toContainText("Jij komt uit. Kies een kaart.");
  await expect(page.locator("#status")).not.toContainText("Bekennen");
});

test("pauses completed tricks without previewing the next AI card suggestion", async ({ page }) => {
  await openFreshApp(page);

  await page.evaluate(() => {
    const app = window.BridgeAppTestHooks;
    const makeCard = app.makeCard;
    const plays = [
      { seat: "North", card: makeCard("2S") },
      { seat: "East", card: makeCard("5S") },
      { seat: "South", card: makeCard("10S") },
      { seat: "West", card: makeCard("AS") }
    ];
    const hands = {
      North: [],
      East: [],
      South: [makeCard("2C"), makeCard("5D")],
      West: []
    };
    app.setState({
      phase: "playing",
      guidanceMode: true,
      turnIndex: 2,
      contract: app.rules.Bid(1, "S"),
      declarer: "East",
      dummy: "West",
      currentTrick: plays,
      awaitingTrickAdvance: true,
      trickAdvanceArmed: true,
      pendingTrickWinner: "West",
      hands,
      originalHands: hands
    });
    app.clearTrickSlots();
    plays.forEach((play) => app.renderPlayedCard(play.seat, play.card));
    app.renderAll();
  });

  await expect(page.locator("#guidance-panel")).toBeHidden();
  await expect(page.locator("#south-hand .recommended-card")).toHaveCount(0);
  await expect(page.locator(".trick-west")).toHaveClass(/pending-trick-winner/);
  await expect(page.locator("#trick-advance-hint")).toContainText("West wint slag 1.");
});

test("keeps dummy hidden until the opening lead and shows the play plan only in developer mode", async ({ page }) => {
  await openFreshApp(page);
  await prepareNorthSouthDeclarerHand(page);

  await expect(page.locator("#play-plan-panel")).toBeHidden();
  await expect(page.locator("#dummy-notice")).toBeHidden();
  await expect(page.locator("#north-hand .card.back")).toHaveCount(13);
  await expect(page.locator("#trick-area .card.played")).toHaveCount(0);

  const preOpeningLeadAdviceContext = await page.evaluate(() => {
    const app = window.BridgeAppTestHooks;
    const originalChooseCardPlay = app.rules.chooseCardPlay;
    let captured = null;
    app.rules.chooseCardPlay = (options) => {
      captured = {
        partnerHand: options.partnerHand,
        dummyHand: options.dummyHand,
        playPlan: options.playPlan
      };
      return originalChooseCardPlay(options);
    };
    try {
      app.chooseCardPlayResult(app.getState().declarer);
    } finally {
      app.rules.chooseCardPlay = originalChooseCardPlay;
    }
    return captured;
  });
  expect(preOpeningLeadAdviceContext).toEqual({ partnerHand: null, dummyHand: null, playPlan: null });

  await page.evaluate(() => window.BridgeAppTestHooks.continuePlay());

  await expect(page.locator("#trick-area .card.played")).toHaveCount(1);
  await expect(page.locator("#north-hand .card:not(.back)")).toHaveCount(13);
  await expect(page.locator(".table-area")).toHaveClass(/turn-focus-north/);
  await expect(page.locator("#dummy-notice")).toContainText("dummy");
  await expect(page.locator("#play-plan-panel")).toBeHidden();

  await page.evaluate(() => window.BridgeAppTestHooks.setDeveloperMode(true));
  await expect(page.locator("#play-plan-panel")).toBeVisible();
  const playPlanBeforeBidExplanations = await page.evaluate(
    () => document.querySelector("#play-plan-panel").nextElementSibling?.id === "bid-explanations"
  );
  expect(playPlanBeforeBidExplanations).toBe(true);

  await page.locator("#north-hand .card.legal").first().focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#trick-area .card.played")).toHaveCount(2);

  await page.evaluate(() => {
    const app = window.BridgeAppTestHooks;
    const state = app.getState();
    app.setState({
      guidanceMode: true,
      currentTrick: [],
      trickHistory: [{ number: 1, winner: state.declarer, cards: [] }],
      turnIndex: ["North", "East", "South", "West"].indexOf(state.declarer),
      playPlan: null
    });
    app.clearTrickSlots();
    app.renderAll();
  });
  await expect(page.locator("#guidance-panel")).toBeVisible();
  await expect(page.locator("#guidance-panel")).toContainText("speelplan");
});

test("developer play explanations flag cards that differ from the heuristic", async ({ page }) => {
  await openFreshApp(page);

  const madeDeviation = await page.evaluate(() => {
    const app = window.BridgeAppTestHooks;
    for (let attempt = 0; attempt < 20; attempt++) {
      app.startHand({ seed: `play-deviation-smoke-${attempt}`, skipFlow: true });
      app.autoCompleteAuction();
      let state = app.getState();
      if (state.phase !== "playing") continue;
      app.setState({ developerMode: true });
      app.autoPlayCard(app.seatAt(state.turnIndex), app.chooseCard(app.seatAt(state.turnIndex)));
      state = app.getState();
      const seat = app.seatAt(state.turnIndex);
      const declarerTeam = seat === "North" || seat === "South" ? "NS" : "EW";
      const humanControlled = state.declarer && (state.declarer === "North" || state.declarer === "South")
        ? declarerTeam === "NS"
        : seat === "South";
      if (!humanControlled) continue;
      const recommended = app.chooseCardPlayResult(seat);
      const alternate = app.legalCards(seat).find((card) => card.id !== recommended?.card?.id);
      if (!alternate) continue;
      app.playCard(seat, alternate.id);
      return true;
    }
    return false;
  });

  expect(madeDeviation).toBe(true);
  await expect(page.locator("#play-explanations")).toContainText("wijkt af van de speelheuristiek");
  await expect(page.locator("#play-explanations")).toContainText("De heuristiek stelde");
});

test("can finish a hand and copy a feedback report from the review", async ({ page, context, baseURL }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: baseURL });
  await openFreshApp(page);

  await page.evaluate(() => window.BridgeAppTestHooks.setDeveloperMode(true));
  await clickMenuButton(page, "#quick-review");

  await expect(page.locator("#review-panel")).toBeVisible();
  await expect(page.locator("#review-summary")).toContainText("Contract");
  await expect(page.locator("#review-summary")).toContainText("Waarom deze score?");
  await expect(page.locator("#review-summary")).toContainText("Nodig voor contract");
  await expect(page.locator("#review-summary")).toContainText("Herhaalcode");
  await expect(page.locator("#review-summary")).not.toContainText("Hand opnieuw spelen");
  await expect(page.locator("#review-summary")).toContainText("Eerste kaart");
  await expect(page.locator("#review-summary")).toContainText("Eindscore");
  await expect(page.locator("#review-summary")).not.toContainText("Handseed");
  await expect(page.locator("#review-summary")).not.toContainText("Contractdoel");
  await expect(page.locator("#review-tricks tbody tr")).toHaveCount(13);
  await expect(page.locator("#review-tricks .play-explanation").first()).toBeVisible();
  await expect(page.locator("#review-tricks .play-explanation").first()).toContainText("Slag");
  await expect
    .poll(() =>
      page.locator("#review-panel").evaluate((panel) => {
        panel.scrollTop = panel.scrollHeight;
        return panel.scrollTop > 0;
      })
    )
    .toBe(true);
  await expect(page.locator("#replay-panel")).toBeVisible();
  await expect(page.locator("#replay-panel")).toContainText("Speel opnieuw");
  await expect(page.locator("#replay-new-hand")).toBeVisible();
  await expect(page.locator("#replay-same-hand")).toBeVisible();

  await expect(page.locator(".setup-controls > #open-feedback")).toBeVisible();
  await page.locator(".setup-controls > #open-feedback").click();
  await expect(page.locator("#feedback-dialog")).toBeVisible();
  await page.locator("#feedback-message").fill("Smoke test report");

  await page.locator("#copy-feedback").click();

  await expect(page.locator("#feedback-state")).toContainText("Feedbackrapport");
  const report = await page.evaluate(() => navigator.clipboard.readText());
  expect(report).toContain("Smoke test report");
  expect(report).toContain("## Handcontext");
  expect(report).toContain("## Slagenoverzicht");

  await page.evaluate(() => {
    window.__feedbackMailUrl = "";
    openFeedbackMailClient = (url) => {
      window.__feedbackMailUrl = url;
    };
  });
  await page.locator("#mail-feedback").click();
  await expect(page.locator("#feedback-state")).toContainText("Mail-app wordt geopend");
  const mailUrl = await page.evaluate(() => window.__feedbackMailUrl);
  expect(mailUrl).toContain("mailto:casper.peters@gmail.com");
  expect(mailUrl).toContain("Smoke%20test%20report");
});

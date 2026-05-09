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
  const settingLabels = await page.locator(".settings-panel .developer-toggle span").allTextContents();
  expect(settingLabels).toEqual(["Speelgeschiedenis", "AI-suggesties", "Developermodus"]);
  await expect(page.locator("#play-history-mode-description")).toHaveText("i");
  await expect(page.locator("#play-history-mode-description")).toHaveAttribute("title", /live overzicht/);
  await expect(page.locator("#guidance-mode-description")).toHaveText("i");
  await expect(page.locator("#guidance-mode-description")).toHaveAttribute("title", /heuristische hulp/);
  await expect(page.locator("#developer-mode-description")).toHaveText("i");
  await expect(page.locator("#developer-mode-description")).toHaveAttribute("title", /analyse en testen/);
  await expect(menu.locator(".app-menu-panel")).not.toContainText("Toont het live overzicht");
  await expect(menu.locator(".app-menu-panel")).not.toContainText("Toont eenvoudige AI-suggesties");
  await expect(menu.locator(".app-menu-panel")).not.toContainText("Toont alle kaarten open");
  await expect(page.locator("#quick-review")).toBeHidden();
  await expect(page.locator(".repeat-code-field")).toBeHidden();

  const repeatCode = await page.evaluate(() => {
    const app = window.BridgeAppTestHooks;
    app.startHand({ seed: "developer-repeat-code", skipFlow: true });
    app.setDeveloperMode(true);
    return app.getEls().seedInput.value;
  });
  await expect(page.locator("#quick-review")).toBeVisible();
  await expect(page.locator(".repeat-code-field")).toBeVisible();
  expect(repeatCode).toMatch(/^situatieseed:/);
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

test("marks vulnerable seats red on the table", async ({ page }) => {
  await openFreshApp(page);

  await page.evaluate(() => {
    window.BridgeAppTestHooks.setState({ vulnerability: "NS" });
    window.BridgeAppTestHooks.renderAll();
  });
  await expect(page.locator("#north-label .seat-label-name")).toHaveClass(/is-vulnerable-team/);
  await expect(page.locator("#south-label .seat-label-name")).toHaveClass(/is-vulnerable-team/);
  await expect(page.locator("#east-label .seat-label-name")).not.toHaveClass(/is-vulnerable-team/);
  await expect(page.locator("#west-label .seat-label-name")).not.toHaveClass(/is-vulnerable-team/);

  await page.evaluate(() => {
    window.BridgeAppTestHooks.setState({ vulnerability: "EW" });
    window.BridgeAppTestHooks.renderAll();
  });
  await expect(page.locator("#north-label .seat-label-name")).not.toHaveClass(/is-vulnerable-team/);
  await expect(page.locator("#south-label .seat-label-name")).not.toHaveClass(/is-vulnerable-team/);
  await expect(page.locator("#east-label .seat-label-name")).toHaveClass(/is-vulnerable-team/);
  await expect(page.locator("#west-label .seat-label-name")).toHaveClass(/is-vulnerable-team/);
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

test("loads a situation seed with auction and played cards", async ({ page }) => {
  await openFreshApp(page);

  const created = await page.evaluate(() => {
    const app = window.BridgeAppTestHooks;
    const rules = app.rules;
    app.startPracticeHand("draw-trumps-001", { skipFlow: true });
    app.setState({
      phase: "playing",
      auction: [
        { seat: "South", bid: rules.Bid(4, "S") },
        { seat: "West", bid: rules.Pass() },
        { seat: "North", bid: rules.Pass() },
        { seat: "East", bid: rules.Pass() }
      ],
      contract: rules.Bid(4, "S"),
      declarer: "South",
      dummy: "North",
      leader: "West",
      turnIndex: 3
    });
    app.clearTrickSlots();
    app.renderAll();
    const lead = app.chooseCard("West");
    app.playCard("West", lead.id);
    const state = app.getState();
    return {
      situationSeed: app.createSituationSeed(),
      leadCard: lead.id,
      auctionLength: state.auction.length
    };
  });

  expect(created.situationSeed).toMatch(/^situatieseed:/);
  expect(created.auctionLength).toBe(4);

  const restored = await page.evaluate((situationSeed) => {
    const app = window.BridgeAppTestHooks;
    app.startHand({ seed: "different-hand", skipFlow: true });
    app.getEls().seedInput.value = situationSeed;
    app.loadSeedFromInput();
    const state = app.getState();
    return {
      seed: state.dealSeed,
      practiceId: state.practice?.id,
      phase: state.phase,
      contract: state.contract ? `${state.contract.level}${state.contract.strain}` : null,
      declarer: state.declarer,
      dummy: state.dummy,
      turn: app.seatAt(state.turnIndex),
      auction: state.auction.map((call) => `${call.seat}:${call.bid.type === "Bid" ? `${call.bid.level}${call.bid.strain}` : call.bid.type}`),
      currentTrick: state.currentTrick.map((play) => `${play.seat}:${play.card.id}`),
      westHandLength: state.hands.West.length
    };
  }, created.situationSeed);

  expect(restored).toEqual({
    seed: "draw-trumps-001",
    practiceId: "draw-trumps-001",
    phase: "playing",
    contract: "4S",
    declarer: "South",
    dummy: "North",
    turn: "North",
    auction: ["South:4S", "West:Pass", "North:Pass", "East:Pass"],
    currentTrick: [`West:${created.leadCard}`],
    westHandLength: 12
  });
  await expect(page.locator("#seed-description")).toContainText("Herhaalcode geladen");
  await expect(page.locator(".trick-west .card.played")).toHaveCount(1);
  await expect(page.locator("#north-hand .card:not(.back)")).toHaveCount(13);
});

test("loads a compact feedback situation seed", async ({ page }) => {
  await openFreshApp(page);

  const restored = await page.evaluate(() => {
    const app = window.BridgeAppTestHooks;
    app.startHand({ seed: "different-hand", skipFlow: true });
    app.getEls().seedInput.value = "situatieseed:eyJ2IjoxLCJzIjoiMzlicTJmNWY4aDZjIiwiYiI6MSwiZCI6Ik4iLCJ1Ijoibm9uZSIsInAiOiJiaWRkaW5nIiwidCI6IlMiLCJhIjpbWyJOIiwiMUQiXSxbIkUiLCIyUyJdXSwiayI6W10sImMiOltdLCJ3IjowfQ";
    app.loadSeedFromInput();
    const state = app.getState();
    return {
      seed: state.dealSeed,
      board: state.dealNumber,
      phase: state.phase,
      turn: app.seatAt(state.turnIndex),
      vulnerability: state.vulnerability,
      auction: state.auction.map((call) => `${call.seat}:${call.bid.type === "Bid" ? `${call.bid.level}${call.bid.strain}` : call.bid.type}`),
      southHandLength: state.hands.South.length
    };
  });

  expect(restored).toEqual({
    seed: "39bq2f5f8h6c",
    board: 1,
    phase: "bidding",
    turn: "South",
    vulnerability: "none",
    auction: ["North:1D", "East:2S"],
    southHandLength: 13
  });
  await expect(page.locator("#seed-description")).toContainText("Herhaalcode geladen");
});

test("restores situation seeds for bidding, pass-out, pre-lead, and doubled auctions", async ({ page }) => {
  await openFreshApp(page);

  const snapshots = await page.evaluate(() => {
    const app = window.BridgeAppTestHooks;
    const rules = app.rules;
    const bidText = (bid) => {
      if (!bid) return null;
      if (bid.type === "Pass") return "P";
      if (bid.type === "Double") return "X";
      if (bid.type === "Redouble") return "XX";
      return `${bid.level}${bid.strain}${bid.redoubled ? "XX" : bid.doubled ? "X" : ""}`;
    };
    const callSnapshot = (call) => ({
      seat: call.seat,
      bid: bidText(call.bid),
      stop: Boolean(call.stop),
      alert: Boolean(call.alert)
    });
    const stateSnapshot = () => {
      const state = app.getState();
      return {
        seed: state.dealSeed,
        board: state.dealNumber,
        dealer: app.seatAt(state.dealerIndex),
        vulnerability: state.vulnerability,
        practiceId: state.practice?.id || null,
        phase: state.phase,
        turn: app.seatAt(state.turnIndex),
        auction: state.auction.map(callSnapshot),
        contract: bidText(state.contract),
        declarer: state.declarer,
        dummy: state.dummy,
        leader: state.leader,
        finalScore: state.finalScore ? {
          passOut: Boolean(state.finalScore.passOut),
          scoreText: state.finalScore.scoreText,
          made: state.finalScore.made,
          defenders: state.finalScore.defenders
        } : null
      };
    };
    const restoreSnapshot = (situationSeed) => {
      app.startHand({ seed: "restore-scratch", skipFlow: true });
      app.getEls().seedInput.value = situationSeed;
      app.loadSeedFromInput();
      return stateSnapshot();
    };
    const passOutAuction = () => {
      const state = app.getState();
      return [0, 1, 2, 3].map((offset) => ({
        seat: app.seatAt(state.dealerIndex + offset),
        bid: rules.Pass()
      }));
    };

    app.startPracticeHand("response-new-suit-after-1h-001", { skipFlow: true });
    app.setState({
      phase: "bidding",
      auction: [
        { seat: "North", bid: rules.Bid(1, "H") },
        { seat: "East", bid: rules.Pass() },
        { seat: "South", bid: rules.Bid(2, "S"), stop: true, alert: true }
      ],
      turnIndex: 3
    });
    const bidding = restoreSnapshot(app.createSituationSeed());

    app.startHand({ seed: "situation-passout", skipFlow: true });
    const dealerIndex = app.getState().dealerIndex;
    app.setState({
      phase: "complete",
      turnIndex: dealerIndex,
      auction: passOutAuction(),
      contract: null,
      declarer: null,
      dummy: null,
      leader: null,
      finalScore: null
    });
    const passOut = restoreSnapshot(app.createSituationSeed());

    app.startPracticeHand("draw-trumps-001", { skipFlow: true });
    app.setState({
      phase: "playing",
      auction: [
        { seat: "South", bid: rules.Bid(1, "H") },
        { seat: "West", bid: rules.Double() },
        { seat: "North", bid: rules.Redouble() },
        { seat: "East", bid: rules.Pass() },
        { seat: "South", bid: rules.Pass() },
        { seat: "West", bid: rules.Pass() }
      ],
      contract: { level: 1, strain: "H", doubled: true, redoubled: true },
      declarer: "South",
      dummy: "North",
      leader: "West",
      turnIndex: 3
    });
    const preLead = restoreSnapshot(app.createSituationSeed());

    return { bidding, passOut, preLead };
  });

  expect(snapshots.bidding.practiceId).toBe("response-new-suit-after-1h-001");
  expect(snapshots.bidding.phase).toBe("bidding");
  expect(snapshots.bidding.turn).toBe("West");
  expect(snapshots.bidding.auction).toEqual([
    { seat: "North", bid: "1H", stop: false, alert: false },
    { seat: "East", bid: "P", stop: false, alert: false },
    { seat: "South", bid: "2S", stop: true, alert: true }
  ]);

  expect(snapshots.passOut.phase).toBe("complete");
  expect(snapshots.passOut.seed).toBe("situation-passout");
  expect(snapshots.passOut.contract).toBe(null);
  expect(snapshots.passOut.finalScore).toMatchObject({
    passOut: true,
    scoreText: "Noord/Zuid 0 · Oost/West 0",
    made: 0,
    defenders: 0
  });

  expect(snapshots.preLead.phase).toBe("playing");
  expect(snapshots.preLead.practiceId).toBe("draw-trumps-001");
  expect(snapshots.preLead.turn).toBe("West");
  expect(snapshots.preLead.contract).toBe("1HXX");
  expect(snapshots.preLead.declarer).toBe("South");
  expect(snapshots.preLead.dummy).toBe("North");
  expect(snapshots.preLead.leader).toBe("West");
  expect(snapshots.preLead.auction.map((call) => call.bid)).toEqual(["1H", "X", "XX", "P", "P", "P"]);
});

test("restores situation seeds for running, paused, and completed play states", async ({ page }) => {
  await openFreshApp(page);

  const snapshots = await page.evaluate(() => {
    const app = window.BridgeAppTestHooks;
    const rules = app.rules;
    const playSnapshot = (play) => `${play.seat}:${play.card.id}`;
    const bidText = (bid) => {
      if (!bid) return null;
      return `${bid.level}${bid.strain}${bid.redoubled ? "XX" : bid.doubled ? "X" : ""}`;
    };
    const stateSnapshot = () => {
      const state = app.getState();
      return {
        seed: state.dealSeed,
        phase: state.phase,
        turn: app.seatAt(state.turnIndex),
        contract: bidText(state.contract),
        currentTrick: state.currentTrick.map(playSnapshot),
        trickHistoryLength: state.trickHistory.length,
        trickWinners: state.trickHistory.map((trick) => trick.winner),
        tricks: state.tricks,
        awaitingTrickAdvance: state.awaitingTrickAdvance,
        trickAdvanceArmed: state.trickAdvanceArmed,
        pendingTrickWinner: state.pendingTrickWinner,
        finalScore: state.finalScore ? {
          scoreText: state.finalScore.scoreText,
          made: state.finalScore.made,
          defenders: state.finalScore.defenders
        } : null,
        statusKey: state.status?.key || null
      };
    };
    const restoreSnapshot = (situationSeed) => {
      app.startHand({ seed: "restore-scratch", skipFlow: true });
      app.getEls().seedInput.value = situationSeed;
      app.loadSeedFromInput();
      return stateSnapshot();
    };
    const startKnownContract = () => {
      app.startPracticeHand("draw-trumps-001", { skipFlow: true });
      app.setState({
        phase: "playing",
        auction: [
          { seat: "South", bid: rules.Bid(4, "S") },
          { seat: "West", bid: rules.Pass() },
          { seat: "North", bid: rules.Pass() },
          { seat: "East", bid: rules.Pass() }
        ],
        contract: rules.Bid(4, "S"),
        declarer: "South",
        dummy: "North",
        leader: "West",
        turnIndex: 3
      });
    };
    const playOneCardWithoutTimers = () => {
      const state = app.getState();
      const seat = app.seatAt(state.turnIndex);
      const card = app.chooseCard(seat) || app.legalCards(seat)[0];
      const patch = window.BridgeStateTransitions.applyCardPlayTransition(state, { seat, card });
      app.setState(patch);
      if (app.getState().currentTrick.length < 4) {
        app.setState({ turnIndex: (state.turnIndex + 1) % 4 });
      }
      return `${seat}:${card.id}`;
    };

    startKnownContract();
    const runningPlays = [playOneCardWithoutTimers(), playOneCardWithoutTimers(), playOneCardWithoutTimers()];
    const running = restoreSnapshot(app.createSituationSeed());

    startKnownContract();
    const pausedPlays = [
      playOneCardWithoutTimers(),
      playOneCardWithoutTimers(),
      playOneCardWithoutTimers(),
      playOneCardWithoutTimers()
    ];
    const winner = rules.currentWinningPlay(app.getState().currentTrick, "S").seat;
    app.setState({
      awaitingTrickAdvance: true,
      trickAdvanceArmed: true,
      pendingTrickWinner: winner
    });
    const paused = restoreSnapshot(app.createSituationSeed());

    startKnownContract();
    app.autoCompletePlay();
    const completedSeed = app.createSituationSeed();
    const completedBefore = stateSnapshot();
    const completed = restoreSnapshot(completedSeed);

    return {
      runningPlays,
      running,
      pausedPlays,
      pausedWinner: winner,
      paused,
      completedBefore,
      completed
    };
  });

  expect(snapshots.running.phase).toBe("playing");
  expect(snapshots.running.currentTrick).toEqual(snapshots.runningPlays);
  expect(snapshots.running.turn).toBe("South");
  expect(snapshots.running.trickHistoryLength).toBe(0);
  expect(snapshots.running.awaitingTrickAdvance).toBe(false);

  expect(snapshots.paused.phase).toBe("playing");
  expect(snapshots.paused.currentTrick).toEqual(snapshots.pausedPlays);
  expect(snapshots.paused.awaitingTrickAdvance).toBe(true);
  expect(snapshots.paused.trickAdvanceArmed).toBe(true);
  expect(snapshots.paused.pendingTrickWinner).toBe(snapshots.pausedWinner);
  expect(snapshots.paused.statusKey).toBe("winsTrick");

  expect(snapshots.completed.phase).toBe("complete");
  expect(snapshots.completed.contract).toBe("4S");
  expect(snapshots.completed.currentTrick).toEqual([]);
  expect(snapshots.completed.trickHistoryLength).toBe(13);
  expect(snapshots.completed.trickWinners).toEqual(snapshots.completedBefore.trickWinners);
  expect(snapshots.completed.tricks).toEqual(snapshots.completedBefore.tricks);
  expect(snapshots.completed.finalScore).toEqual(snapshots.completedBefore.finalScore);
  expect(snapshots.completed.statusKey).toBe("contractResult");
});

test("rejects corrupt and out-of-order situation seeds without replacing the current hand", async ({ page }) => {
  await openFreshApp(page);

  const result = await page.evaluate(() => {
    const app = window.BridgeAppTestHooks;
    const rules = app.rules;
    const loadSeed = (seed) => {
      app.getEls().seedInput.value = seed;
      app.loadSeedFromInput();
      return app.getState();
    };
    const decodeSituationSeed = (seed) => {
      const payload = seed.slice(seed.indexOf(":") + 1).replace(/-/g, "+").replace(/_/g, "/");
      const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
      return JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(padded), (char) => char.charCodeAt(0))));
    };
    const encodeSituationSeed = (payload) => {
      const json = JSON.stringify(payload);
      const binary = Array.from(new TextEncoder().encode(json), (byte) => String.fromCharCode(byte)).join("");
      return `situatieseed:${btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")}`;
    };

    app.startHand({ seed: "valid-before-invalid", skipFlow: true });
    const before = app.getState();

    const corrupt = loadSeed("situatieseed:not-valid-json");
    const corruptSnapshot = {
      seed: corrupt.dealSeed,
      phase: corrupt.phase,
      message: corrupt.seedMessage
    };

    app.startPracticeHand("draw-trumps-001", { skipFlow: true });
    app.setState({
      phase: "bidding",
      auction: [
        { seat: "South", bid: rules.Bid(1, "S") },
        { seat: "West", bid: rules.Pass() }
      ],
      turnIndex: 0
    });
    const payload = decodeSituationSeed(app.createSituationSeed());
    payload.a[1][0] = "N";

    app.startHand({ seed: "valid-before-out-of-order", skipFlow: true });
    const outOfOrderBefore = app.getState();
    const outOfOrder = loadSeed(encodeSituationSeed(payload));

    return {
      beforeSeed: before.dealSeed,
      corrupt: corruptSnapshot,
      outOfOrderBeforeSeed: outOfOrderBefore.dealSeed,
      outOfOrder: {
        seed: outOfOrder.dealSeed,
        phase: outOfOrder.phase,
        message: outOfOrder.seedMessage
      }
    };
  });

  expect(result.corrupt.seed).toBe(result.beforeSeed);
  expect(result.corrupt.phase).toBe("bidding");
  expect(result.corrupt.message).toBe("Deze herhaalcode kon niet worden geladen.");

  expect(result.outOfOrder.seed).toBe(result.outOfOrderBeforeSeed);
  expect(result.outOfOrder.phase).toBe("bidding");
  expect(result.outOfOrder.message).toBe("Deze herhaalcode kon niet worden geladen.");
  await expect(page.locator("#seed-description")).toContainText("Deze herhaalcode kon niet worden geladen.");
});

test("opens lesson picker and starts a quiet challenge", async ({ page }) => {
  await openFreshApp(page);

  await clickMenuButton(page, "#open-lessons");
  await expect(page).toHaveURL(/lessons\.html/);
  await expect(page.locator("#lesson-page-title")).toContainText("Wat is bridge?");
  await expect(page.locator("#lesson-route-panel")).toContainText("Leerroute");
  await expect(page.locator(".lesson-route-button")).toHaveCount(12);
  await expect(page.locator("#lesson-content")).toContainText("Hoofdstukken");
  await expect(page.locator("#lesson-content")).toContainText("De kaarten van de spelers");
  await expect(page.locator("#lesson-content")).toContainText("Bekennen moet");
  await expect(page.locator("#lesson-content")).not.toContainText("Bridge speel je met vier spelers");

  await page.locator(".lesson-chapter", { hasText: "De kaarten van de spelers" }).locator(".lesson-chapter-link").click();
  await expect(page).toHaveURL(/lesson-01-cards\.html\?testHooks=1/);
  await expect(page.locator("#card-lesson-title")).toContainText("Leer eerst de kaarten lezen");
  await expect(page.locator(".suit-tile")).toHaveCount(4);
  await expect(page.locator(".suit-tile", { hasText: "Harten" })).toBeVisible();
  await page.locator("#next-step").click();
  await expect(page.locator(".lesson-slide.is-active")).toContainText("Elke kleur heeft 13 kaarten");
  await expect(page.locator(".compact-ranks .card")).toHaveCount(13);
  await page.locator(".suit-count-card", { hasText: "♥" }).click();
  await expect(page.locator("#suit-count-feedback")).toContainText("hartenkaarten");
  await expect(page.locator(".compact-ranks .card").first()).toHaveAttribute("aria-label", "A harten");
  await page.locator("#next-step").click();
  await page.locator(".choice-card", { hasText: "A" }).click();
  await expect(page.locator("#rank-feedback")).toContainText("De aas is de hoogste kaart");
  await page.locator("#next-step").click();
  await expect(page.locator(".lesson-slide.is-active")).toContainText("speler recht tegenover je");
  await expect(page.locator(".lesson-slide.is-active")).toContainText("Partner");
  await expect(page.locator(".lesson-slide.is-active")).not.toContainText("Noord");
  await expect(page.locator(".lesson-slide.is-active")).not.toContainText("Zuid");
  await page.locator("#deal-demo").click();
  await expect(page.locator(".table-demo")).toHaveClass(/is-dealt/);
  await expect(page.locator(".deal-card")).toHaveCount(52);
  await expect(page.locator('[data-seat-target="North"] .deal-card')).toHaveCount(13);
  await expect(page.locator('[data-seat-target="East"] .deal-card')).toHaveCount(13);
  await expect(page.locator('[data-seat-target="South"] .deal-card')).toHaveCount(13);
  await expect(page.locator('[data-seat-target="West"] .deal-card')).toHaveCount(13);
  await expect(page.locator('[data-seat-count="North"]')).toHaveText("13");
  await expect(page.locator('[data-seat-count="East"]')).toHaveText("13");
  await expect(page.locator('[data-seat-count="South"]')).toHaveText("13");
  await expect(page.locator('[data-seat-count="West"]')).toHaveText("13");
  await expect(page.locator("#deal-status")).toContainText("Iedere speler heeft nu 13 kaarten");
  await page.locator(".card-lesson-back").click();
  await expect(page).toHaveURL(/lessons\.html\?testHooks=1/);

  await page.locator(".lesson-chapter", { hasText: "Bekennen moet" }).locator(".lesson-practice-link").click();
  await expect(page).toHaveURL(/index\.html\?lesson=les-01-wat-is-bridge&hand=draw-trumps-001&testHooks=1/);
  await expect(page.locator("#lesson-banner")).toContainText("Les 1: Wat is bridge?");
  await expect(page.locator("#lesson-banner")).toContainText("dummy");
  await expect(page.locator("#trick-area .card.played")).toHaveCount(1);
  await expect(page.locator("#dummy-notice")).toContainText("dummy");

  const lessonSnapshot = await page.evaluate(() => {
    const state = window.BridgeAppTestHooks.getState();
    const app = window.BridgeAppTestHooks;
    return {
      seed: state.dealSeed,
      practiceId: state.practice?.id,
      lessonId: state.practice?.lessonId,
      lessonStartMode: state.practice?.lessonStartMode,
      challenge: state.practice?.challenge,
      phase: state.phase,
      contract: state.contract ? `${state.contract.level}${state.contract.strain}` : null,
      declarer: state.declarer,
      turn: app.seatAt(state.turnIndex),
      currentTrick: state.currentTrick.map((play) => `${play.seat}:${play.card.id}`)
    };
  });

  expect(lessonSnapshot).toEqual({
    seed: "draw-trumps-001",
    practiceId: "draw-trumps-001",
    lessonId: "les-01-wat-is-bridge",
    lessonStartMode: "play",
    challenge: "Win slagen samen met partner en ontdek wanneer dummy verschijnt.",
    phase: "playing",
    contract: "4S",
    declarer: "South",
    turn: "North",
    currentTrick: ["West:TD"]
  });

  const restoredLessonSnapshot = await page.evaluate(() => {
    const app = window.BridgeAppTestHooks;
    const seed = app.createSituationSeed();
    app.startHand({ seed: "lesson-seed-restore", skipFlow: true });
    app.getEls().seedInput.value = seed;
    app.loadSeedFromInput();
    const state = app.getState();
    return {
      seed: state.dealSeed,
      practiceId: state.practice?.id,
      lessonId: state.practice?.lessonId,
      lessonStartMode: state.practice?.lessonStartMode,
      phase: state.phase,
      contract: state.contract ? `${state.contract.level}${state.contract.strain}` : null,
      declarer: state.declarer,
      dummy: state.dummy,
      leader: state.leader,
      turn: app.seatAt(state.turnIndex),
      currentTrick: state.currentTrick.map((play) => `${play.seat}:${play.card.id}`),
      statusText: document.querySelector("#status").textContent
    };
  });

  expect(restoredLessonSnapshot).toEqual({
    seed: "draw-trumps-001",
    practiceId: "draw-trumps-001",
    lessonId: "les-01-wat-is-bridge",
    lessonStartMode: "play",
    phase: "playing",
    contract: "4S",
    declarer: "South",
    dummy: "North",
    leader: "West",
    turn: "North",
    currentTrick: ["West:TD"],
    statusText: "Jij bent aan de beurt. Bekennen als dat kan."
  });

  await page.evaluate(() => {
    const app = window.BridgeAppTestHooks;
    const lesson = window.BridgeLessons.findLesson("les-01-wat-is-bridge");
    app.startLesson(lesson, lesson.handIds[0]);
    app.autoCompletePlay();
    app.renderAll();
  });

  await expect(page.locator("#review-panel")).toBeVisible();
  await expect(page.locator("#review-summary")).toContainText("Lesfeedback");
  await expect(page.locator("#review-summary")).toContainText("verscheen Noord als dummy");
  await expect(page.locator("#review-summary")).toContainText("Lespunten");
  await expect(page.locator("#review-summary")).toContainText("Een bridgebord bestaat uit 13 slagen");
  await expect(page.locator("#review-summary")).not.toContainText("Herhaalcode");
});

test("submits structured lesson metadata in feedback payload", async ({ page }) => {
  await openFreshApp(page);

  await clickMenuButton(page, "#open-lessons");
  await page.locator(".lesson-chapter", { hasText: "Bekennen moet" }).locator(".lesson-practice-link").click();
  await expect(page).toHaveURL(/index\.html\?lesson=les-01-wat-is-bridge&hand=draw-trumps-001&testHooks=1/);
  await expect(page.locator("#trick-area .card.played")).toHaveCount(1);
  await expect(page.locator("#dummy-notice")).toContainText("dummy");

  await page.evaluate(() => {
    window.__feedbackRequests = [];
    window.BridgeFeedbackConfig.endpoint = "https://script.google.com/macros/s/test/exec";
    window.fetch = async (url, options) => {
      window.__feedbackRequests.push({ url, options });
      return {};
    };
  });

  await page.locator(".setup-controls > #open-feedback").click();
  await expect(page.locator("#feedback-dialog")).toBeVisible();
  await page.locator("#feedback-message").fill("Lescontext payload test");
  await page.locator("#mail-feedback").click();
  await expect(page.locator("#feedback-state")).toContainText("Feedback verstuurd");

  const payload = await page.evaluate(() => JSON.parse(window.__feedbackRequests[0].options.body));
  expect(payload.lessonId).toBe("les-01-wat-is-bridge");
  expect(payload.practiceHandId).toBe("draw-trumps-001");
  expect(payload.startMode).toBe("direct-play");
  expect(payload.declarer).toBe("South");
  expect(payload.turnSeat).toBe("North");
  expect(payload.dummyVisible).toBe("Ja");
});

test("runs curated beginner practice hands through fixed UI checkpoints", async ({ page }) => {
  await openFreshApp(page);

  const biddingSnapshot = await page.evaluate(() => {
    const app = window.BridgeAppTestHooks;
    const bidText = (bid) => {
      if (app.rules.isPass(bid)) return "Pas";
      if (app.rules.isDouble(bid)) return "Doublet";
      if (app.rules.isRedouble(bid)) return "Redoublet";
      return `${bid.level}${bid.strain}`;
    };
    app.startPracticeHand("response-new-suit-after-1h-001", { skipFlow: true });
    app.autoCompleteAuction();
    app.renderAll();
    const state = app.getState();
    return {
      practiceId: state.practice?.id,
      contract: document.querySelector("#contract").textContent,
      firstCalls: state.auction.slice(0, 3).map((call) => ({
        seat: call.seat,
        bid: bidText(call.bid),
        ruleId: call.bidResult?.ruleId || null
      }))
    };
  });

  expect(biddingSnapshot.practiceId).toBe("response-new-suit-after-1h-001");
  expect(biddingSnapshot.contract).toContain("2♥ door Noord");
  expect(biddingSnapshot.firstCalls).toEqual([
    { seat: "North", bid: "1H", ruleId: "fiveCardHigh.opening.oneMajor" },
    { seat: "East", bid: "Pas", ruleId: "fiveCardHigh.pass.competitiveNoAction" },
    { seat: "South", bid: "1S", ruleId: "fiveCardHigh.response.newSuit" }
  ]);
  await expect(page.locator("#auction-log")).toContainText("1♥");
  await expect(page.locator("#auction-log")).toContainText("1♠");

  const playSnapshot = await page.evaluate(() => {
    const app = window.BridgeAppTestHooks;
    const bidText = (bid) => `${bid.level}${bid.strain}`;
    app.startPracticeHand("draw-trumps-001", { skipFlow: true });
    app.setState({
      phase: "playing",
      contract: app.rules.Bid(4, "S"),
      declarer: "South",
      dummy: "North",
      leader: "West",
      turnIndex: 3
    });
    app.setDeveloperMode(true);
    const leader = app.seatAt(app.getState().turnIndex);
    app.autoPlayCard(leader, app.chooseCard(leader));
    app.renderAll();
    const state = app.getState();
    return {
      practiceId: state.practice?.id,
      contract: bidText(state.contract),
      declarer: state.declarer,
      dummy: state.dummy,
      currentTrickLength: state.currentTrick.length,
      playPlanPriority: state.playPlan?.priorities?.[0]?.kind || null,
      playPlanSuit: state.playPlan?.priorities?.[0]?.suit || null
    };
  });

  expect(playSnapshot).toEqual({
    practiceId: "draw-trumps-001",
    contract: "4S",
    declarer: "South",
    dummy: "North",
    currentTrickLength: 1,
    playPlanPriority: "drawTrumps",
    playPlanSuit: "S"
  });
  await expect(page.locator("#north-hand .card:not(.back)")).toHaveCount(13);
  await expect(page.locator("#dummy-notice")).toContainText("dummy");
  await expect(page.locator("#play-plan-panel")).toContainText("Trek schoppen");

  const scoringSnapshot = await page.evaluate(() => {
    const app = window.BridgeAppTestHooks;
    const bidText = (bid) => `${bid.level}${bid.strain}`;
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
      practiceId: state.practice?.id,
      phase: state.phase,
      contract: bidText(state.contract),
      declarer: state.declarer,
      score: state.finalScore?.score,
      gameBonus: state.finalScore?.gameBonus,
      tricksMade: state.finalScore?.made
    };
  });

  expect(scoringSnapshot).toEqual({
    practiceId: "game-bonus-vulnerable-001",
    phase: "complete",
    contract: "4H",
    declarer: "South",
    score: 620,
    gameBonus: 500,
    tricksMade: 10
  });
  await expect(page.locator("#review-summary")).toContainText("Waarom deze score?");
  await expect(page.locator("#review-summary")).toContainText("620");
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
  await page.locator(".glossary-list-button", { hasText: "Openingskracht" }).click();
  await expect(page.locator("#glossary-term")).toHaveText("Openingskracht");
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

test("keeps North's played card readable in the trick area", async ({ page }) => {
  await openFreshApp(page);

  await page.evaluate(() => {
    const app = window.BridgeAppTestHooks;
    const plays = [
      { seat: "West", card: app.makeCard("2H") },
      { seat: "North", card: app.makeCard("AS") },
      { seat: "East", card: app.makeCard("3H") },
      { seat: "South", card: app.makeCard("4H") }
    ];

    app.startPracticeHand("draw-trumps-001", { skipFlow: true });
    app.setState({
      phase: "playing",
      contract: app.rules.Bid(4, "S"),
      declarer: "South",
      dummy: "North",
      leader: "West",
      turnIndex: 2,
      currentTrick: plays,
      awaitingTrickAdvance: true,
      trickAdvanceArmed: true,
      pendingTrickWinner: "North"
    });
    app.clearTrickSlots();
    plays.forEach((play) => app.renderPlayedCard(play.seat, play.card));
    app.renderAll();
  });

  await page.waitForTimeout(420);
  const layout = await page.evaluate(() => {
    const rectFor = (selector) => {
      const rect = document.querySelector(selector).getBoundingClientRect();
      return {
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        left: rect.left,
        width: rect.width,
        height: rect.height
      };
    };
    const area = (rect) => rect.width * rect.height;
    const intersectionRatio = (a, b) => {
      const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
      const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
      return (width * height) / area(a);
    };
    const north = rectFor(".trick-north .card.played");
    const others = [".trick-west .card.played", ".trick-east .card.played", ".trick-south .card.played"].map(rectFor);
    return {
      north,
      trickArea: rectFor("#trick-area"),
      overlapRatios: others.map((other) => intersectionRatio(north, other))
    };
  });

  expect(Math.max(...layout.overlapRatios)).toBeLessThan(0.08);
  expect(layout.north.top).toBeGreaterThanOrEqual(layout.trickArea.top - 1);
  expect(layout.north.bottom).toBeLessThanOrEqual(layout.trickArea.bottom + 1);
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

test("can finish a hand and copy or submit a feedback report from the review", async ({ page, context, baseURL }) => {
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
  await expect(page.locator("#review-tricks")).toContainText("gebruik \u2190 en \u2192");
  await expect(page.locator("#review-tricks tbody tr").first()).toHaveClass(/is-review-selected/);
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#review-tricks tbody tr").nth(1)).toHaveClass(/is-review-selected/);
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator("#review-tricks tbody tr").first()).toHaveClass(/is-review-selected/);
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
  await expect(page.locator("#feedback-include-context")).toHaveCount(0);
  await page.locator("#feedback-message").fill("Smoke test report");

  await page.locator("#copy-feedback").click();

  await expect(page.locator("#feedback-state")).toContainText("Feedbackrapport");
  const report = await page.evaluate(() => navigator.clipboard.readText());
  expect(report).toContain("Smoke test report");
  expect(report).toContain("Herhaalcode: situatieseed:");
  expect(report).not.toContain("## Handcontext");
  expect(report).not.toContain("## Slagenoverzicht");
  expect(report).not.toContain("Browser:");

  await page.evaluate(() => {
    window.BridgeFeedbackConfig.endpoint = "";
  });
  await page.locator("#mail-feedback").click();
  await expect(page.locator("#feedback-state")).toContainText("nog niet ingesteld");

  await page.evaluate(() => {
    window.__feedbackRequests = [];
    window.BridgeFeedbackConfig.endpoint = "https://script.google.com/macros/s/test/exec";
    window.fetch = async (url, options) => {
      window.__feedbackRequests.push({ url, options });
      return {};
    };
  });
  await page.locator("#mail-feedback").click();
  await expect(page.locator("#feedback-state")).toContainText("Feedback verstuurd");
  const requests = await page.evaluate(() => window.__feedbackRequests);
  expect(requests).toHaveLength(1);
  expect(requests[0].url).toContain("https://script.google.com/macros/s/test/exec");
  expect(requests[0].options.method).toBe("POST");
  expect(requests[0].options.mode).toBe("no-cors");
  const payload = JSON.parse(requests[0].options.body);
  expect(payload.message).toBe("Smoke test report");
  expect(payload.repeatCode).toContain("situatieseed:");
  expect(payload.report).toContain("Herhaalcode: situatieseed:");
  expect(payload.declarer).toBeTruthy();
  expect(payload.dummyVisible).toBe("Ja");
  expect(payload.practiceHandId).toBe("");
  expect(payload.lessonId).toBe("");
  expect(payload.userAgent).toBeTruthy();
});

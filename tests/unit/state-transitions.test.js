const { assert, test } = require("./harness.js");
const transitions = require("../../scripts/state/state-transitions.js");

function card(id, suit = "S", rank = "A") {
  return { id, suit, rank };
}

test("startPreparedHandTransition resets volatile game flow state", () => {
  const hands = { North: [card("N1")], East: [], South: [], West: [] };
  const originalHands = { North: [card("N1")], East: [], South: [], West: [] };
  const patch = transitions.startPreparedHandTransition({
    dealerIndex: 2,
    vulnerability: "NS",
    hands,
    originalHands,
    practice: { id: "demo" }
  });

  assert.equal(patch.phase, "bidding");
  assert.equal(patch.turnIndex, 2);
  assert.deepEqual(patch.auction, []);
  assert.deepEqual(patch.currentTrick, []);
  assert.deepEqual(patch.tricks, { NS: 0, EW: 0 });
  assert.equal(patch.practice.id, "demo");
  assert.equal(patch.finalScore, null);
  assert.equal(patch.pendingStop, false);
});

test("applyCardPlayTransition removes the card and records the explanation immutably", () => {
  const played = card("S-A");
  const other = card("S-K", "S", "K");
  const state = {
    hands: { North: [], East: [], South: [played, other], West: [] },
    currentTrick: [],
    trickHistory: [{ number: 1, cards: [], winner: "North" }],
    playExplanations: [],
    illegalActionFeedback: { text: "old" }
  };

  const patch = transitions.applyCardPlayTransition(state, {
    seat: "South",
    card: played,
    ruleResult: { ruleId: "test.rule", confidence: "high", card: played },
    explanation: "Speel de aas."
  });

  assert.deepEqual(patch.hands.South, [other]);
  assert.deepEqual(state.hands.South, [played, other]);
  assert.equal(patch.currentTrick.length, 1);
  assert.equal(patch.currentTrick[0].ruleId, "test.rule");
  assert.equal(patch.playExplanations[0].trick, 2);
  assert.equal(patch.playExplanations[0].text, "Speel de aas.");
  assert.equal(patch.illegalActionFeedback, null);
});

test("advanceCompletedTrickTransition scores the winner and makes them next leader", () => {
  const trickCard = card("H-2", "H", "2");
  const state = {
    awaitingTrickAdvance: true,
    trickAdvanceArmed: true,
    pendingTrickWinner: "West",
    tricks: { NS: 3, EW: 4 },
    trickHistory: [],
    currentTrick: [{ seat: "West", card: trickCard, ruleId: null }],
    turnIndex: 1
  };

  const patch = transitions.advanceCompletedTrickTransition(state, {
    winner: "West",
    winningTeam: "EW",
    seats: ["North", "East", "South", "West"]
  });

  assert.equal(patch.awaitingTrickAdvance, false);
  assert.deepEqual(patch.tricks, { NS: 3, EW: 5 });
  assert.equal(patch.trickHistory[0].winner, "West");
  assert.deepEqual(patch.currentTrick, []);
  assert.equal(patch.turnIndex, 3);
});

test("contract reveal transitions only move when contract context is complete", () => {
  const contractContext = {
    contract: { level: 4, strain: "S" },
    declarer: "South",
    dummy: "North",
    leader: "West"
  };

  assert.equal(transitions.enterContractRevealTransition({ contract: null }), null);
  assert.deepEqual(transitions.enterContractRevealTransition(contractContext), {
    phase: "contract-reveal"
  });
  assert.equal(transitions.startPlayFromContractRevealTransition({ ...contractContext, phase: "playing" }), null);
  assert.deepEqual(transitions.startPlayFromContractRevealTransition({ ...contractContext, phase: "contract-reveal" }), {
    phase: "playing"
  });
});

test("acknowledgeLessonBoardStepTransition records each gated lesson step once", () => {
  const state = { lessonBoardAcknowledged: ["contractIntro"] };
  const next = transitions.acknowledgeLessonBoardStepTransition(state, {
    id: "openingLeadIntro",
    gate: "releaseAutoPlay"
  });

  assert.deepEqual(next, ["contractIntro", "openingLeadIntro"]);
  assert.deepEqual(state.lessonBoardAcknowledged, ["contractIntro"]);
  assert.deepEqual(transitions.acknowledgeLessonBoardStepTransition({ lessonBoardAcknowledged: next }, {
    id: "openingLeadIntro",
    gate: "releaseAutoPlay"
  }), next);
  assert.deepEqual(transitions.acknowledgeLessonBoardStepTransition({ lessonBoardAcknowledged: next }, {
    id: "reviewResult",
    gate: "none"
  }), next);
});

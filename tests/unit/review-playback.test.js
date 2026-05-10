const { assert, test, card } = require("./harness.js");
const playback = require("../../scripts/state/review-playback.js");

function play(seat, id) {
  return { seat, card: card(id) };
}

function sampleReview() {
  return {
    originalHands: {
      North: [card("AS"), card("2C")],
      East: [card("KS"), card("3C")],
      South: [card("QS"), card("4C")],
      West: [card("JS"), card("5C")]
    },
    trickHistory: [
      {
        number: 1,
        winner: "North",
        cards: [play("West", "JS"), play("North", "AS"), play("East", "KS"), play("South", "QS")]
      },
      {
        number: 2,
        winner: "West",
        cards: [play("North", "2C"), play("East", "3C"), play("South", "4C"), play("West", "5C")]
      }
    ]
  };
}

test("review playback removes the first selected card only", () => {
  const review = sampleReview();
  const state = playback.deriveReviewPlayback({
    ...review,
    cursor: { trickIndex: 0, playIndex: 0 }
  });

  assert.deepEqual(state.cursor, { trickIndex: 0, playIndex: 0 });
  assert.equal(state.currentTrick.length, 1);
  assert.equal(state.currentTrick[0].card.id, "JS");
  assert.equal(state.activeSeat, "North");
  assert.equal(state.winner, null);
  assert.deepEqual(state.hands.West.map((item) => item.id), ["5C"]);
  assert.deepEqual(state.hands.North.map((item) => item.id), ["AS", "2C"]);
});

test("review playback shows partial tricks before the winner is known", () => {
  const review = sampleReview();
  const state = playback.deriveReviewPlayback({
    ...review,
    cursor: { trickIndex: 0, playIndex: 2 }
  });

  assert.deepEqual(state.currentTrick.map((item) => `${item.seat}:${item.card.id}`), ["West:JS", "North:AS", "East:KS"]);
  assert.equal(state.activeSeat, "South");
  assert.equal(state.winner, null);
  assert.deepEqual(state.hands.East.map((item) => item.id), ["3C"]);
});

test("review playback marks the winner after the fourth card", () => {
  const review = sampleReview();
  const state = playback.deriveReviewPlayback({
    ...review,
    cursor: { trickIndex: 0, playIndex: 3 }
  });

  assert.equal(state.currentTrick.length, 4);
  assert.equal(state.activeSeat, null);
  assert.equal(state.winner, "North");
  assert.equal(state.completeTrick, true);
});

test("review playback cursor moves across trick boundaries", () => {
  const review = sampleReview();

  assert.deepEqual(playback.moveReviewCursor(review.trickHistory, null, 1), { trickIndex: 0, playIndex: 0 });
  assert.deepEqual(playback.moveReviewCursor(review.trickHistory, null, -1), { trickIndex: 1, playIndex: 3 });
  assert.deepEqual(playback.moveReviewCursor(review.trickHistory, { trickIndex: 0, playIndex: 3 }, 1), { trickIndex: 1, playIndex: 0 });
  assert.deepEqual(playback.moveReviewCursor(review.trickHistory, { trickIndex: 1, playIndex: 0 }, -1), { trickIndex: 0, playIndex: 3 });
  assert.deepEqual(playback.moveReviewCursor(review.trickHistory, { trickIndex: 0, playIndex: 0 }, -1), { trickIndex: 0, playIndex: 0 });
});

test("review playback ignores invalid cursors without mutating source hands", () => {
  const review = sampleReview();
  const before = JSON.stringify(review.originalHands);

  assert.equal(playback.deriveReviewPlayback({ ...review, cursor: null }), null);
  assert.equal(playback.deriveReviewPlayback({ ...review, cursor: { trickIndex: 9, playIndex: 0 } }), null);
  assert.equal(JSON.stringify(review.originalHands), before);
});

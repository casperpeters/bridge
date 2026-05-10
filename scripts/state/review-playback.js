(function initBridgeReviewPlayback(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const playback = factory();
  if (isCommonJs) module.exports = playback;
  root.BridgeReviewPlayback = playback;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeReviewPlayback() {
  "use strict";

  const defaultSeats = ["North", "East", "South", "West"];

  function deriveReviewPlayback({ originalHands = {}, trickHistory = [], cursor = null, seats = defaultSeats } = {}) {
    const normalized = normalizeCursor(trickHistory, cursor);
    if (!normalized) return null;

    const trick = trickHistory[normalized.trickIndex];
    const visiblePlays = trick.cards.slice(0, normalized.playIndex + 1).map(copyPlay);
    const playedCardIds = playedCardIdsThroughCursor(trickHistory, normalized);
    const activeSeat = visiblePlays.length < trick.cards.length
      ? trick.cards[visiblePlays.length]?.seat || nextSeatAfter(visiblePlays.at(-1)?.seat, seats)
      : null;
    const winner = visiblePlays.length >= trick.cards.length ? trick.winner : null;

    return {
      cursor: normalized,
      trickNumber: trick.number,
      playNumber: normalized.playIndex + 1,
      selectedPlay: copyPlay(trick.cards[normalized.playIndex]),
      hands: remainingHands(originalHands, playedCardIds, seats),
      currentTrick: visiblePlays,
      activeSeat,
      winner,
      completeTrick: Boolean(winner)
    };
  }

  function moveReviewCursor(trickHistory = [], cursor = null, delta = 0) {
    const total = totalPlayCount(trickHistory);
    if (!total || !Number.isFinite(delta) || delta === 0) return normalizeCursor(trickHistory, cursor);

    const normalized = normalizeCursor(trickHistory, cursor);
    if (!normalized) return offsetToCursor(trickHistory, delta > 0 ? 0 : total - 1);

    const nextOffset = clamp(cursorToOffset(trickHistory, normalized) + delta, 0, total - 1);
    return offsetToCursor(trickHistory, nextOffset);
  }

  function normalizeCursor(trickHistory = [], cursor = null) {
    if (!cursor || !Number.isInteger(cursor.trickIndex) || !Number.isInteger(cursor.playIndex)) return null;
    if (cursor.trickIndex < 0 || cursor.trickIndex >= trickHistory.length) return null;
    const trick = trickHistory[cursor.trickIndex];
    if (!trick?.cards?.length || cursor.playIndex < 0 || cursor.playIndex >= trick.cards.length) return null;
    return { trickIndex: cursor.trickIndex, playIndex: cursor.playIndex };
  }

  function cursorToOffset(trickHistory, cursor) {
    let offset = 0;
    for (let trickIndex = 0; trickIndex < cursor.trickIndex; trickIndex += 1) {
      offset += trickHistory[trickIndex]?.cards?.length || 0;
    }
    return offset + cursor.playIndex;
  }

  function offsetToCursor(trickHistory, offset) {
    let remaining = offset;
    for (let trickIndex = 0; trickIndex < trickHistory.length; trickIndex += 1) {
      const count = trickHistory[trickIndex]?.cards?.length || 0;
      if (remaining < count) return { trickIndex, playIndex: remaining };
      remaining -= count;
    }
    return null;
  }

  function totalPlayCount(trickHistory = []) {
    return trickHistory.reduce((count, trick) => count + (trick.cards?.length || 0), 0);
  }

  function playedCardIdsThroughCursor(trickHistory, cursor) {
    const ids = new Set();
    for (let trickIndex = 0; trickIndex <= cursor.trickIndex; trickIndex += 1) {
      const trick = trickHistory[trickIndex];
      const playCount = trickIndex === cursor.trickIndex ? cursor.playIndex + 1 : trick.cards.length;
      trick.cards.slice(0, playCount).forEach((play) => {
        if (play.card?.id) ids.add(play.card.id);
      });
    }
    return ids;
  }

  function remainingHands(originalHands, playedCardIds, seats) {
    return Object.fromEntries(seats.map((seat) => [
      seat,
      (originalHands[seat] || [])
        .filter((card) => !playedCardIds.has(card.id))
        .map(copyCard)
    ]));
  }

  function nextSeatAfter(seat, seats) {
    const index = seats.indexOf(seat);
    return index < 0 ? null : seats[(index + 1) % seats.length];
  }

  function copyPlay(play) {
    return play ? { ...play, card: copyCard(play.card) } : null;
  }

  function copyCard(card) {
    return card ? { ...card } : card;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  return {
    deriveReviewPlayback,
    moveReviewCursor,
    normalizeCursor
  };
});

(function initBridgeLessonTableTask(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.BridgeLessonTableTask = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeLessonTableTask() {
  "use strict";

  function tableTaskCompleted(task, context = {}) {
    if (!task) return false;
    const plays = allPlayedCards(context);
    const auction = Array.isArray(context.auction) ? context.auction : [];
    if (task.type === "bid") {
      if (task.completion === "southBid") return auction.some((call) => call.seat === "South");
      if (task.completion === "humanBid") return auction.some((call) => call.seat === "South");
      return auction.length > 0;
    }
    if (task.type === "card") {
      if (task.completion === "northSouthCard" || task.completion === "humanCard") {
        return plays.some((play) => play.seat === "North" || play.seat === "South");
      }
      return plays.length > 0;
    }
    if (task.type === "trick") {
      return Boolean(context.awaitingTrickAdvance || context.pendingTrickWinner || (context.trickHistory || []).length);
    }
    if (task.type === "review" || task.type === "hand") {
      return context.phase === "complete";
    }
    return false;
  }

  function tableTaskActionFeedback(task, action = {}) {
    const expected = task?.expectedAction;
    if (!expected) return null;
    if (expected.type && action.type && expected.type !== action.type) return null;
    if (expected.seat && action.seat && expected.seat !== action.seat) return null;

    const ok = expected.type === "bid"
      ? expectedBidMatches(expected, action.bid)
      : expected.type === "card"
        ? expectedCardMatches(expected, action.card)
        : true;
    if (ok) return null;

    return {
      title: expected.retryTitle || "Probeer nog eens",
      body: expected.retryBody || "Deze keuze is legaal, maar niet de bedoelde actie voor dit lesmoment. Probeer opnieuw.",
      hint: expected.hint || ""
    };
  }

  function expectedBidMatches(expected, bid) {
    const codes = normalizeList(expected.calls || expected.call || expected.bid);
    if (!codes.length) return true;
    const bidCode = callCode(bid);
    return codes.some((code) => normalizeCallCode(code) === bidCode);
  }

  function expectedCardMatches(expected, card) {
    if (!card) return false;
    const cardIds = normalizeList(expected.cardIds || expected.cards || expected.cardId);
    if (cardIds.length && !cardIds.includes(card.id)) return false;
    const suits = normalizeList(expected.suits || expected.suit);
    if (suits.length && !suits.includes(card.suit)) return false;
    return Boolean(cardIds.length || suits.length);
  }

  function normalizeList(value) {
    if (!value) return [];
    return (Array.isArray(value) ? value : [value]).map(String);
  }

  function callCode(bid) {
    if (!bid) return "";
    if (bid.type === "Pass") return "PASS";
    if (bid.type === "Double") return "X";
    if (bid.type === "Redouble") return "XX";
    if (bid.type === "Bid") return normalizeCallCode(`${bid.level}${bid.strain}`);
    return normalizeCallCode(bid.call || bid.code || "");
  }

  function normalizeCallCode(value) {
    return String(value || "")
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "")
      .replace(/SA$/, "NT")
      .replace(/^P$/, "PASS")
      .replace(/^PAS$/, "PASS");
  }

  function allPlayedCards(context) {
    const current = Array.isArray(context.currentTrick) ? context.currentTrick : [];
    const historical = Array.isArray(context.trickHistory)
      ? context.trickHistory.flatMap((trick) => Array.isArray(trick.cards) ? trick.cards : [])
      : [];
    return [...historical, ...current];
  }

  return {
    allPlayedCards,
    callCode,
    expectedBidMatches,
    expectedCardMatches,
    normalizeCallCode,
    normalizeList,
    tableTaskActionFeedback,
    tableTaskCompleted
  };
});

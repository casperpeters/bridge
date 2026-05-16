(function initBridgeLessonTableTask(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const actionValidation = isCommonJs ? require("./action-validation.js") : root.BridgeLearningActionValidation;
  const api = factory(actionValidation);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.BridgeLessonTableTask = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeLessonTableTask(actionValidation) {
  "use strict";

  if (!actionValidation) throw new Error("action-validation.js must load before lesson-table-task.js");

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
    const result = actionValidation.validateExpectedAction(expected, action, {
      wrongTitle: expected.retryTitle,
      wrong: expected.retryBody,
      hint: expected.hint
    });
    return result.applies && !result.ok ? result.feedback : null;
  }

  function expectedBidMatches(expected, bid) {
    return actionValidation.expectedBidMatches(expected, bid);
  }

  function expectedCardMatches(expected, card) {
    return actionValidation.expectedCardMatches(expected, card);
  }

  function normalizeList(value) {
    return actionValidation.normalizeList(value);
  }

  function callCode(bid) {
    return actionValidation.callCode(bid);
  }

  function normalizeCallCode(value) {
    return actionValidation.normalizeCallCode(value);
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

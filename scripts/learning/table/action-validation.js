(function initBridgeLearningActionValidation(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.BridgeLearningActionValidation = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeLearningActionValidation() {
  "use strict";

  function validateExpectedAction(expectedAction, action = {}, feedback = {}) {
    const expected = expectedAction || {};
    if (expected.type && action.type && expected.type !== action.type) return { applies: false, ok: true };
    if (expected.seat && action.seat && expected.seat !== action.seat) return { applies: false, ok: true };

    const ok = expected.type === "bid"
      ? expectedBidMatches(expected, action.bid)
      : expected.type === "card"
        ? expectedCardMatches(expected, action.card)
        : true;
    const choiceKey = choiceKeyForAction(action);
    return {
      applies: true,
      ok,
      choiceKey,
      feedback: ok ? correctFeedback(feedback) : wrongFeedback(feedback, choiceKey)
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
    const cardIds = normalizeList(expected.cardIds || expected.cards || expected.cardId).map(normalizeCardId);
    if (cardIds.length && !cardIds.includes(normalizeCardId(card.id))) return false;
    const suits = normalizeList(expected.suits || expected.suit).map((suit) => suit.toUpperCase());
    if (suits.length && !suits.includes(String(card.suit || "").toUpperCase())) return false;
    return Boolean(cardIds.length || suits.length);
  }

  function choiceKeyForAction(action = {}) {
    if (action.type === "bid" || action.bid) return callCode(action.bid);
    if (action.type === "card" || action.card) return normalizeCardId(action.card?.id || action.cardId);
    return "";
  }

  function wrongFeedback(feedback = {}, choiceKey = "") {
    const choiceFeedback = feedbackByChoice(feedback.wrongByChoice, choiceKey);
    return {
      title: feedback.wrongTitle || "Probeer nog eens",
      body: choiceFeedback || feedback.wrong || feedback.retryBody || "Deze keuze is legaal, maar niet de bedoelde actie voor dit oefenmoment.",
      hint: feedback.hint || ""
    };
  }

  function correctFeedback(feedback = {}) {
    return {
      title: feedback.correctTitle || "Goed",
      body: feedback.correct || feedback.doneBody || "Deze keuze past bij de oefening.",
      hint: feedback.correctHint || ""
    };
  }

  function feedbackByChoice(wrongByChoice, choiceKey) {
    if (!wrongByChoice || !choiceKey) return "";
    const normalizedChoice = normalizeChoiceKey(choiceKey);
    for (const [key, value] of Object.entries(wrongByChoice)) {
      if (normalizeChoiceKey(key) === normalizedChoice) return String(value || "");
    }
    return "";
  }

  function normalizeChoiceKey(value) {
    const text = String(value || "").trim();
    if (/^(?:P|PAS|PASS|X|DBL|DOUBLE|XX|RDBL|REDOUBLE|[1-7](?:C|D|H|S|NT|SA))$/i.test(text)) {
      return normalizeCallCode(text);
    }
    return normalizeCardId(text);
  }

  function normalizeList(value) {
    if (!value) return [];
    return (Array.isArray(value) ? value : [value]).map(String).filter(Boolean);
  }

  function callCode(bid) {
    if (!bid) return "";
    if (bid.type === "Pass") return "PASS";
    if (bid.type === "Double") return "X";
    if (bid.type === "Redouble") return "XX";
    if (bid.type === "Bid") return normalizeCallCode(`${bid.level}${bid.strain}`);
    return normalizeCallCode(bid.call || bid.code || bid);
  }

  function normalizeCallCode(value) {
    const call = String(value || "")
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "")
      .replace(/SA$/, "NT");
    if (call === "P" || call === "PAS") return "PASS";
    if (call === "DBL" || call === "DOUBLE") return "X";
    if (call === "RDBL" || call === "REDOUBLE") return "XX";
    return call;
  }

  function normalizeCardId(value) {
    return String(value || "").trim().toUpperCase().replace(/^10/, "T");
  }

  return {
    callCode,
    choiceKeyForAction,
    correctFeedback,
    expectedBidMatches,
    expectedCardMatches,
    feedbackByChoice,
    normalizeCallCode,
    normalizeList,
    validateExpectedAction,
    wrongFeedback
  };
});

(function initBridgeLessonRender(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const hand = isCommonJs ? require("./lesson-hand.js") : root.BridgeLessonHand;
  const api = factory(hand, root);
  if (isCommonJs) module.exports = api;
  root.BridgeLessonRender = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeLessonRender(hand, root) {
  "use strict";

  if (!hand?.parseHand) throw new Error("lesson-hand.js must load before lesson-render.js");

  function renderHand(target, cards, options = {}) {
    if (!target) return null;
    const doc = target.ownerDocument || root.document;
    const sortedCards = Array.isArray(cards) ? hand.sortCards(cards) : hand.parseHand(cards);
    const counts = hand.countSuits(sortedCards);
    const displaySuits = options.suits || hand.suits;

    clearElement(target);
    displaySuits.forEach((suit) => {
      const row = doc.createElement(options.rowTagName || "div");
      row.className = options.rowClassName || "hand-suit-row";

      const label = doc.createElement(options.labelTagName || "span");
      label.className = options.labelClassName || "hand-suit-label";
      label.textContent = options.labelFormatter
        ? options.labelFormatter(suit, counts[suit] || 0)
        : `${hand.suitSymbol(suit)} ${hand.suitName(suit)} (${counts[suit] || 0})`;

      const cardRow = doc.createElement(options.cardRowTagName || "div");
      cardRow.className = options.cardRowClassName || "hand-cards";
      const suitCards = sortedCards.filter((card) => hand.normalizeCard(card).suit === suit);

      if (!suitCards.length) {
        const empty = doc.createElement(options.emptyTagName || "span");
        empty.className = options.emptyClassName || "empty-suit";
        empty.textContent = options.emptyText || "geen";
        cardRow.appendChild(empty);
      } else {
        suitCards.forEach((card) => {
          cardRow.appendChild(createPlayingCard(card, { ...options.cardOptions, document: doc }));
        });
      }

      row.append(label, cardRow);
      target.appendChild(row);
    });
    return target;
  }

  function createPlayingCard(card, options = {}) {
    const doc = options.document || root.document;
    if (!doc) throw new Error("A document is required to render lesson cards");
    const normalized = hand.normalizeCard(card);
    const tagName = options.tagName || "div";
    const innerTagName = options.innerTagName || (String(tagName).toLowerCase() === "span" ? "span" : "div");
    const element = doc.createElement(tagName);
    element.className = cardClassName(options.className);
    if (hand.isRedSuit(normalized.suit)) element.classList.add("red");

    const rank = doc.createElement(innerTagName);
    rank.className = "playing-card-rank";
    rank.textContent = hand.cardText(normalized, { includeSuit: options.showSuitInRank !== false });

    const suit = doc.createElement(innerTagName);
    suit.className = "playing-card-suit";
    suit.textContent = hand.suitSymbol(normalized.suit);

    const mini = doc.createElement(innerTagName);
    mini.className = "playing-card-mini";
    mini.textContent = hand.cardText(normalized, { includeSuit: options.showSuitInMini !== false });

    element.append(rank, suit, mini);
    element.setAttribute("aria-label", options.ariaLabel || `${hand.rankText(normalized.rank)} ${hand.suitName(normalized.suit)}`);
    return element;
  }

  function renderChips(target, items, options = {}) {
    if (!target) return null;
    const doc = target.ownerDocument || root.document;
    clearElement(target);
    (items || []).forEach((text) => {
      const chip = doc.createElement(options.tagName || "span");
      chip.className = options.className || "fact-chip";
      chip.textContent = text;
      target.appendChild(chip);
    });
    return target;
  }

  function clearElement(target) {
    if (target) target.innerHTML = "";
    return target;
  }

  function cardClassName(className = "playing-card") {
    const value = String(className || "").trim();
    if (!value) return "playing-card";
    return value.split(/\s+/).includes("playing-card") ? value : `playing-card ${value}`;
  }

  return {
    clearElement,
    createPlayingCard,
    renderChips,
    renderHand
  };
});

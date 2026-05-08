(function initCardAnimation(root) {
  "use strict";

  const CARD_PLAY_ANIMATION_MS = 280;

  function captureCardPlayAnimationSource(seat, cardId) {
    if (prefersReducedCardMotion()) return null;
    const handEl = seatEls?.[seat];
    if (!handEl) return null;

    const visibleCardEl = findVisibleHandCard(handEl, cardId);
    const fallbackCardEl = handEl.querySelector(".card");
    const sourceEl = visibleCardEl || fallbackCardEl || handEl;
    const rect = sourceEl.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;

    return {
      rect: rectSnapshot(rect),
      startsFaceDown: !visibleCardEl || sourceEl.classList.contains("back")
    };
  }

  function animateCardPlayToSlot({ source, targetEl, card }) {
    if (!source || !targetEl || prefersReducedCardMotion()) return false;

    const targetRect = targetEl.getBoundingClientRect();
    if (!targetRect.width || !targetRect.height) return false;

    targetEl.classList.add("card-animation-target");
    const flyer = createCardEl(card, !source.startsFaceDown);
    flyer.classList.add("card-play-flyer");
    setFlyerBox(flyer, source.rect);
    document.body.appendChild(flyer);

    const dx = targetRect.left - source.rect.left;
    const dy = targetRect.top - source.rect.top;
    const cleanup = () => {
      flyer.remove();
      targetEl.classList.remove("card-animation-target");
    };

    window.requestAnimationFrame(() => {
      if (source.startsFaceDown) {
        flyer.classList.remove("back");
        renderCardFace(flyer, card);
      }
      flyer.style.width = `${targetRect.width}px`;
      flyer.style.height = `${targetRect.height}px`;
      flyer.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    flyer.addEventListener("transitionend", cleanup, { once: true });
    window.setTimeout(cleanup, CARD_PLAY_ANIMATION_MS + 90);
    return true;
  }

  function findVisibleHandCard(handEl, cardId) {
    if (!cardId) return null;
    const selector = `.card[data-card-id="${escapeCss(String(cardId))}"]`;
    return handEl.querySelector(selector);
  }

  function setFlyerBox(flyer, rect) {
    flyer.style.left = `${rect.left}px`;
    flyer.style.top = `${rect.top}px`;
    flyer.style.width = `${rect.width}px`;
    flyer.style.height = `${rect.height}px`;
  }

  function renderCardFace(cardEl, card) {
    cardEl.classList.remove("back");
    if (card.suit === "D" || card.suit === "H") cardEl.classList.add("red");
    const label = rankLabel[card.rank] || card.rank;
    cardEl.innerHTML = `
      <div class="rank">${label}${suitSymbols[card.suit]}</div>
      <div class="suit-big">${suitSymbols[card.suit]}</div>
      <div class="mini">${label}${suitSymbols[card.suit]}</div>
    `;
    cardEl.setAttribute("aria-label", `${label} ${suitName(card.suit)}`);
  }

  function rectSnapshot(rect) {
    return {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height
    };
  }

  function prefersReducedCardMotion() {
    return Boolean(root.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
  }

  function escapeCss(value) {
    return root.CSS?.escape ? root.CSS.escape(value) : value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  }

  root.captureCardPlayAnimationSource = captureCardPlayAnimationSource;
  root.animateCardPlayToSlot = animateCardPlayToSlot;
})(typeof globalThis !== "undefined" ? globalThis : this);

(function registerBridgeCardAnimation(root) {
  "use strict";

  const modules = root.BridgeAppModules = root.BridgeAppModules || {};
  const CARD_PLAY_ANIMATION_MS = 280;
  const TRICK_CLEAR_ANIMATION_MS = 360;

  modules.registerCardAnimation = function registerCardAnimation(runtime) {
    const { constants, dom, helpers, render } = runtime;
    const { rankLabel, suitSymbols } = constants;
    const { seatEls } = dom;

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

    targetEl.classList.add("card-animation-target", "played-card-settled");
    const initialTargetRect = targetEl.getBoundingClientRect();
    if (!initialTargetRect.width || !initialTargetRect.height) {
      targetEl.classList.remove("card-animation-target", "played-card-settled");
      return false;
    }

    const flyer = render.createCardEl(card, !source.startsFaceDown);
    flyer.classList.add("card-play-flyer");
    setFlyerBox(flyer, source.rect);
    document.body.appendChild(flyer);

    let cleanedUp = false;
    const cleanup = () => {
      if (cleanedUp) return;
      cleanedUp = true;
      targetEl.classList.remove("card-animation-target");
      window.requestAnimationFrame(() => flyer.remove());
    };

    window.requestAnimationFrame(() => {
      const targetRect = targetEl.getBoundingClientRect();
      if (!targetRect.width || !targetRect.height) {
        cleanup();
        return;
      }
      const dx = targetRect.left - source.rect.left;
      const dy = targetRect.top - source.rect.top;
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

  function animateCompletedTrickToWinner({ trickArea, slotEls, winner, onComplete }) {
    if (!trickArea || !slotEls || !winner || prefersReducedCardMotion()) return false;

    const cards = Array.from(trickArea.querySelectorAll(".card.played"));
    const winnerSlot = slotEls[winner];
    if (!cards.length || !winnerSlot) return false;

    const direction = trickClearDirection(trickArea, winnerSlot, winner);
    if (!direction) return false;

    let completed = false;
    let endedCount = 0;
    const finish = () => {
      if (completed) return;
      completed = true;
      cards.forEach((cardEl) => {
        cardEl.classList.remove("trick-card-clearing");
        cardEl.style.removeProperty("--trick-clear-x");
        cardEl.style.removeProperty("--trick-clear-y");
        cardEl.style.removeProperty("--trick-clear-rotate");
        cardEl.style.removeProperty("--trick-clear-delay");
      });
      onComplete?.();
    };

    cards.forEach((cardEl, index) => {
      const spread = (index - (cards.length - 1) / 2) * 11;
      const x = direction.x * direction.distance + direction.perpX * spread;
      const y = direction.y * direction.distance + direction.perpY * spread;
      cardEl.style.setProperty("--trick-clear-x", `${x}px`);
      cardEl.style.setProperty("--trick-clear-y", `${y}px`);
      cardEl.style.setProperty("--trick-clear-rotate", `${direction.rotate + spread * 0.18}deg`);
      cardEl.style.setProperty("--trick-clear-delay", `${index * 18}ms`);
      const onTransitionEnd = (event) => {
        if (event.propertyName !== "transform") return;
        cardEl.removeEventListener("transitionend", onTransitionEnd);
        endedCount += 1;
        if (endedCount >= cards.length) finish();
      };
      cardEl.addEventListener("transitionend", onTransitionEnd);
    });

    window.requestAnimationFrame(() => {
      cards.forEach((cardEl) => cardEl.classList.add("trick-card-clearing"));
    });
    window.setTimeout(finish, TRICK_CLEAR_ANIMATION_MS + cards.length * 18 + 140);
    return true;
  }

  function trickClearDirection(trickArea, winnerSlot, winner) {
    const areaRect = trickArea.getBoundingClientRect();
    const slotRect = winnerSlot.getBoundingClientRect();
    if (!areaRect.width || !areaRect.height || !slotRect.width || !slotRect.height) return fallbackTrickClearDirection(winner, areaRect);

    const areaCenterX = areaRect.left + areaRect.width / 2;
    const areaCenterY = areaRect.top + areaRect.height / 2;
    const slotCenterX = slotRect.left + slotRect.width / 2;
    const slotCenterY = slotRect.top + slotRect.height / 2;
    const rawX = slotCenterX - areaCenterX;
    const rawY = slotCenterY - areaCenterY;
    const length = Math.hypot(rawX, rawY);
    if (!length) return fallbackTrickClearDirection(winner, areaRect);

    const x = rawX / length;
    const y = rawY / length;
    const axisDistance = Math.abs(x) > Math.abs(y) ? areaRect.width / 2 : areaRect.height / 2;
    return {
      x,
      y,
      perpX: -y,
      perpY: x,
      distance: axisDistance + 150,
      rotate: x * 9
    };
  }

  function fallbackTrickClearDirection(winner, areaRect = {}) {
    const distance = Math.max(areaRect.width || 0, areaRect.height || 0, 300) / 2 + 150;
    const directions = {
      North: { x: 0, y: -1, rotate: -3 },
      East: { x: 1, y: 0, rotate: 8 },
      South: { x: 0, y: 1, rotate: 3 },
      West: { x: -1, y: 0, rotate: -8 }
    };
    const direction = directions[winner];
    if (!direction) return null;
    return {
      ...direction,
      perpX: -direction.y,
      perpY: direction.x,
      distance
    };
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
      <div class="playing-card-rank">${label}${suitSymbols[card.suit]}</div>
      <div class="playing-card-suit">${suitSymbols[card.suit]}</div>
      <div class="playing-card-mini">${label}${suitSymbols[card.suit]}</div>
    `;
    cardEl.setAttribute("aria-label", `${label} ${helpers.suitName(card.suit)}`);
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

    Object.assign(render, {
      animateCardPlayToSlot,
      animateCompletedTrickToWinner,
      captureCardPlayAnimationSource
    });
  };
})(typeof globalThis !== "undefined" ? globalThis : this);

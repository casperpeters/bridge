(function registerBridgeHandsRenderer(root) {
  "use strict";

  const modules = root.BridgeAppModules = root.BridgeAppModules || {};

  modules.registerHandsRenderer = function registerHandsRenderer(runtime) {
    const { actions, constants, dom, helpers, render, state } = runtime;
    const { handSuitOrder, rankLabel, rankOrder, seats, suitSymbols } = constants;
    const { seatEls } = dom;

function renderHands() {
  const recommended = state.guidanceMode ? actions.currentRecommendedCard() : null;
  const playback = actions.currentReviewPlayback();
  for (const seat of seats) {
    seatEls[seat].innerHTML = "";
    const activePlayHand = state.phase === "playing" && !state.awaitingTrickAdvance && helpers.seatAt(state.turnIndex) === seat;
    const activeReviewHand = playback?.activeSeat === seat;
    const humanControlled = actions.isHumanControlledSeat(seat) && state.phase === "playing";
    seatEls[seat].classList.toggle("playable", humanControlled);
    seatEls[seat].classList.toggle("active-play-hand", activePlayHand || activeReviewHand);
    seatEls[seat].classList.toggle("inactive-play-hand", (state.phase === "playing" && !activePlayHand) || (Boolean(playback?.activeSeat) && !activeReviewHand));
    const complete = state.phase === "complete";
    const visible = state.developerMode || complete || actions.isSeatVisible(seat);
    const sourceHand = playback ? playback.hands[seat] : complete ? state.originalHands[seat] : state.hands[seat];
    const cards = sortedHandCards(sourceHand || []);
    const suitFocus = visible ? activeHandSuitFocus(seat, cards) : null;
    seatEls[seat].classList.toggle("suit-focus-active", Boolean(suitFocus));
    if (suitFocus) {
      seatEls[seat].dataset.focusSuit = suitFocus;
    } else {
      delete seatEls[seat].dataset.focusSuit;
    }
    if (visible) {
      renderVisibleHandCards(seat, cards, recommended, suitFocus);
    } else {
      cards.forEach((card, index) => {
        seatEls[seat].appendChild(createHandCardEl(seat, card, false, index, recommended));
      });
    }
  }
  actions.lockDealAnimationHands();
}

function renderVisibleHandCards(seat, cards, recommended, suitFocus = null) {
  if (suitFocus) {
    cards
      .filter((card) => card.suit === suitFocus)
      .forEach((card, index) => seatEls[seat].appendChild(createHandCardEl(seat, card, true, index, recommended)));
    return;
  }
  let animationIndex = 0;
  let hasPreviousSuitSlot = false;
  for (const suit of handSuitOrder) {
    const suitCards = cards.filter((card) => card.suit === suit);
    if (!suitCards.length) {
      seatEls[seat].appendChild(createEmptySuitEl(suit));
      hasPreviousSuitSlot = true;
      continue;
    }

    suitCards.forEach((card, suitIndex) => {
      const cardEl = createHandCardEl(seat, card, true, animationIndex, recommended);
      if (hasPreviousSuitSlot && suitIndex === 0) cardEl.classList.add("suit-start");
      seatEls[seat].appendChild(cardEl);
      animationIndex += 1;
    });
    hasPreviousSuitSlot = true;
  }
}

function createHandCardEl(seat, card, visible, index, recommended) {
  const cardEl = createCardEl(card, visible);
  cardEl.dataset.seat = seat;
  if (visible) cardEl.dataset.cardId = card.id;
  if (state.animateDeal) {
    applyDealAnimation(cardEl, seat, index);
  } else {
    cardEl.classList.add("no-hand-animation");
  }
  if (!state.awaitingTrickAdvance && state.currentTrick.length < 4 && recommended?.seat === seat && recommended.card.id === card.id) {
    cardEl.classList.add("recommended-card");
  }
  if (visible && actions.isHumanControlledSeat(seat) && state.phase === "playing" && !state.awaitingTrickAdvance) {
    const legal = helpers.isLegalCard(seat, card);
    const lessonBlocked = actions.lessonBoardBlocksHumanPlay(seat);
    cardEl.classList.add(legal ? "legal" : "illegal");
    cardEl.classList.toggle("lesson-play-blocked", lessonBlocked);
    if (helpers.seatAt(state.turnIndex) === seat) {
      if (!lessonBlocked) cardEl.tabIndex = 0;
      cardEl.addEventListener("click", (event) => {
        event.stopPropagation();
        if (lessonBlocked) return;
        if (shouldFocusSuitBeforePlay(seat, card)) return actions.focusHandSuit(seat, card.suit);
        if (legal) actions.playCard(seat, card.id);
        else actions.showIllegalCardFeedback(seat, card);
      });
      cardEl.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        if (lessonBlocked) return;
        if (shouldFocusSuitBeforePlay(seat, card)) return actions.focusHandSuit(seat, card.suit);
        if (legal) actions.playCard(seat, card.id);
        else actions.showIllegalCardFeedback(seat, card);
      });
    } else {
      cardEl.addEventListener("click", (event) => {
        event.stopPropagation();
        if (shouldFocusSuitBeforePlay(seat, card)) return actions.focusHandSuit(seat, card.suit);
        actions.showIllegalCardFeedback(seat, card);
      });
    }
  }
  return cardEl;
}

function activeHandSuitFocus(seat, cards) {
  if (!actions.isMobileLayout() || state.handSuitFocus?.seat !== seat) return null;
  const suit = state.handSuitFocus.suit;
  return cards.some((card) => card.suit === suit) ? suit : null;
}

function shouldFocusSuitBeforePlay(seat, card) {
  if (!actions.isMobileLayout() || state.phase !== "playing") return false;
  if (state.handSuitFocus?.seat === seat && state.handSuitFocus.suit === card.suit) return false;
  return seat === "South" || seat === "North";
}

function applyDealAnimation(cardEl, seat, index) {
  const seatOffset = Math.max(0, seats.indexOf(seat));
  const dealIndex = index * seats.length + seatOffset;
  const direction = dealAnimationDirection(seat);
  const spread = (index - 6) * 3;

  cardEl.classList.add("deal-card-enter");
  cardEl.style.animationDelay = `${dealIndex * 18}ms`;
  cardEl.style.setProperty("--deal-start-x", `${direction.x + direction.cross * spread}px`);
  cardEl.style.setProperty("--deal-start-y", `${direction.y + direction.main * spread}px`);
  cardEl.style.setProperty("--deal-start-rotate", `${direction.rotate + spread * 0.35}deg`);
  cardEl.addEventListener("animationend", () => {
    cardEl.classList.remove("deal-card-enter");
    cardEl.classList.add("no-hand-animation");
    cardEl.style.animationDelay = "";
    cardEl.style.removeProperty("--deal-start-x");
    cardEl.style.removeProperty("--deal-start-y");
    cardEl.style.removeProperty("--deal-start-rotate");
  }, { once: true });
}

function dealAnimationDirection(seat) {
  if (seat === "North") return { x: 0, y: 210, main: 0, cross: 1, rotate: -5 };
  if (seat === "East") return { x: -240, y: 0, main: 1, cross: 0, rotate: 6 };
  if (seat === "South") return { x: 0, y: -210, main: 0, cross: 1, rotate: 5 };
  return { x: 240, y: 0, main: 1, cross: 0, rotate: -6 };
}

function createEmptySuitEl(suit) {
  const emptyEl = document.createElement("span");
  emptyEl.className = "suit-empty";
  if (suit === "D" || suit === "H") emptyEl.classList.add("red");
  emptyEl.textContent = suitSymbols[suit];
  emptyEl.setAttribute("aria-label", `geen ${helpers.suitName(suit)}`);
  return emptyEl;
}

function sortedHandCards(hand) {
  return [...hand].sort(compareHandCards);
}

function compareHandCards(a, b) {
  const suitDiff = handSuitOrder.indexOf(a.suit) - handSuitOrder.indexOf(b.suit);
  if (suitDiff) return suitDiff;
  return rankOrder.indexOf(b.rank) - rankOrder.indexOf(a.rank);
}

function createCardEl(card, visible = true) {
  const cardEl = document.createElement("div");
  cardEl.className = "card playing-card";
  if (!visible) {
    cardEl.classList.add("back");
    return cardEl;
  }
  if (card.suit === "D" || card.suit === "H") cardEl.classList.add("red");
  const label = rankLabel[card.rank] || card.rank;
  cardEl.innerHTML = `
    <div class="playing-card-rank">${label}${suitSymbols[card.suit]}</div>
    <div class="playing-card-suit">${suitSymbols[card.suit]}</div>
    <div class="playing-card-mini">${label}${suitSymbols[card.suit]}</div>
  `;
  cardEl.setAttribute("aria-label", `${label} ${helpers.suitName(card.suit)}`);
  return cardEl;
}

    Object.assign(render, {
      createCardEl,
      renderHands
    });
  };
})(typeof globalThis !== "undefined" ? globalThis : this);

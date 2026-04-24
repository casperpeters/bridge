function renderHands() {
  const recommended = state.guidanceMode ? currentRecommendedCard() : null;
  for (const seat of seats) {
    seatEls[seat].innerHTML = "";
    seatEls[seat].classList.toggle("playable", isHumanControlledSeat(seat) && state.phase === "playing");
    const complete = state.phase === "complete";
    const visible = state.developerMode || complete || isSeatVisible(seat);
    const sourceHand = complete ? state.originalHands[seat] : state.hands[seat];
    const cards = sortedHandCards(sourceHand || []);
    if (visible) {
      renderVisibleHandCards(seat, cards, recommended);
    } else {
      cards.forEach((card, index) => {
        seatEls[seat].appendChild(createHandCardEl(seat, card, false, index, recommended));
      });
    }
  }
}

function renderVisibleHandCards(seat, cards, recommended) {
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
  if (state.animateDeal) {
    cardEl.style.animationDelay = `${index * 26}ms`;
  } else {
    cardEl.classList.add("no-hand-animation");
  }
  if (recommended?.seat === seat && recommended.card.id === card.id) cardEl.classList.add("recommended-card");
  if (visible && isHumanControlledSeat(seat) && state.phase === "playing" && !state.awaitingTrickAdvance) {
    const legal = isLegalCard(seat, card);
    cardEl.classList.add(legal ? "legal" : "illegal");
    if (legal && seatAt(state.turnIndex) === seat) {
      cardEl.tabIndex = 0;
      cardEl.addEventListener("click", () => playCard(seat, card.id));
      cardEl.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") playCard(seat, card.id);
      });
    }
  }
  return cardEl;
}

function createEmptySuitEl(suit) {
  const emptyEl = document.createElement("span");
  emptyEl.className = "suit-empty";
  if (suit === "D" || suit === "H") emptyEl.classList.add("red");
  emptyEl.textContent = suitSymbols[suit];
  emptyEl.setAttribute("aria-label", `geen ${suitName(suit)}`);
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
  cardEl.className = "card";
  if (!visible) {
    cardEl.classList.add("back");
    return cardEl;
  }
  if (card.suit === "D" || card.suit === "H") cardEl.classList.add("red");
  const label = rankLabel[card.rank] || card.rank;
  cardEl.innerHTML = `
    <div class="rank">${label}${suitSymbols[card.suit]}</div>
    <div class="suit-big">${suitSymbols[card.suit]}</div>
    <div class="mini">${label}${suitSymbols[card.suit]}</div>
  `;
  cardEl.setAttribute("aria-label", `${label} ${suitName(card.suit)}`);
  return cardEl;
}

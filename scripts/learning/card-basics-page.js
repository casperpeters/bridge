(function initCardBasicsPage() {
  "use strict";

  const ranks = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];
  const rankLabel = { T: "10", J: "J", Q: "Q", K: "K", A: "A" };
  const suitSymbols = { C: "\u2663", D: "\u2666", H: "\u2665", S: "\u2660" };
  const suitNames = { C: "klaveren", D: "ruiten", H: "harten", S: "schoppen" };
  const rankFeedback = document.querySelector("#rank-feedback");
  const suitCountFeedback = document.querySelector("#suit-count-feedback");
  const dealButton = document.querySelector("#deal-demo");
  const tableDemo = document.querySelector(".table-demo");
  const dealStatus = document.querySelector("#deal-status");
  const windSeats = [...document.querySelectorAll(".wind-mini-seat")];
  const windQuestion = document.querySelector("#wind-question");
  const windFeedback = document.querySelector("#wind-feedback");
  const params = new URLSearchParams(window.location.search || "");
  const dealSeats = ["North", "East", "South", "West"];
  const windQuestions = [
    { seat: "South", text: "Klik op Zuid: jouw plek aan tafel.", ok: "Precies. Jij speelt vanuit Zuid." },
    { seat: "North", text: "Wie is je partner, recht tegenover jou?", ok: "Ja. Noord is je partner." },
    { seat: "West", text: "Wie zit links van Zuid?", ok: "Klopt. Links van Zuid zit West." },
    { seat: "East", text: "Wie zit rechts van Zuid?", ok: "Goed. Rechts van Zuid zit Oost." }
  ];
  const sampleDeal = buildSampleDeal();
  let dealTimers = [];
  let windStep = 0;

  preserveTestHooksOnLessonLinks();
  renderRanks(".compact-ranks", "S");
  renderRanks(".full-ranks", "H");
  renderWindStep();

  document.querySelectorAll(".suit-count-card").forEach((button) => {
    button.addEventListener("click", () => {
      const suit = button.dataset.suitTarget || "S";
      document.querySelectorAll(".suit-count-card").forEach((candidate) => {
        candidate.setAttribute("aria-pressed", candidate === button ? "true" : "false");
      });
      renderRanks(".compact-ranks", suit);
      const row = document.querySelector(".compact-ranks");
      row?.setAttribute("aria-label", `Dertien rangen in ${suitNames[suit] || "schoppen"}`);
      if (suitCountFeedback) {
        suitCountFeedback.textContent = `Je bekijkt nu de 13 ${suitNames[suit] || "schoppen"}kaarten.`;
      }
    });
  });

  document.querySelectorAll(".choice-card").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".choice-card").forEach((card) => card.classList.remove("is-correct", "is-missed"));
      const correct = button.dataset.answer === "correct";
      button.classList.add(correct ? "is-correct" : "is-missed");
      if (rankFeedback) {
        rankFeedback.textContent = correct ? "Goed gezien. De aas is de hoogste kaart." : "Bijna. In deze kleur is de aas hoger dan vrouw en tien.";
      }
    });
  });

  dealButton?.addEventListener("click", () => {
    runDealDemo();
  });

  windSeats.forEach((button) => {
    button.addEventListener("click", () => chooseWindSeat(button));
  });

  function renderRanks(selector, suit) {
    const row = document.querySelector(selector);
    if (!row) return;
    row.innerHTML = "";
    ranks.forEach((rank, index) => {
      const card = createLessonCard({ rank, suit });
      card.style.animationDelay = `${index * 28}ms`;
      row.appendChild(card);
    });
  }

  function createLessonCard(card) {
    const cardEl = document.createElement("div");
    cardEl.className = "playing-card lesson-rank-card";
    if (card.suit === "D" || card.suit === "H") cardEl.classList.add("red");
    const label = rankLabel[card.rank] || card.rank;
    const symbol = suitSymbols[card.suit] || card.suit;
    cardEl.innerHTML = `
      <div class="playing-card-rank">${label}${symbol}</div>
      <div class="playing-card-suit">${symbol}</div>
      <div class="playing-card-mini">${label}${symbol}</div>
    `;
    cardEl.setAttribute("aria-label", `${label} ${suitNames[card.suit] || card.suit}`);
    return cardEl;
  }

  function preserveTestHooksOnLessonLinks() {
    if (!params.has("testHooks")) return;
    document.querySelectorAll('a[href^="lessons.html"]').forEach((link) => {
      const href = new URL(link.getAttribute("href"), window.location.href);
      href.searchParams.set("testHooks", "1");
      link.href = `${href.pathname.split("/").pop()}${href.search}`;
    });
  }

  function runDealDemo() {
    if (!tableDemo || !dealButton) return;
    dealTimers.forEach((timer) => clearTimeout(timer));
    dealTimers = [];
    tableDemo.classList.remove("is-dealt");
    tableDemo.querySelectorAll(".deal-card").forEach((card) => card.remove());
    tableDemo.querySelectorAll(".seat-stack").forEach((stack) => {
      stack.innerHTML = "";
      stack.dataset.count = "0";
    });
    dealSeats.forEach((seat) => updateSeatCount(seat, 0));
    if (dealStatus) dealStatus.textContent = "Delen gestart: 0 van 52 kaarten.";
    dealButton.disabled = true;

    sampleDeal.forEach((card, index) => {
      const seat = dealSeats[index % dealSeats.length];
      const timer = setTimeout(() => {
        dealOneCard(card, seat, index);
        if (dealStatus) dealStatus.textContent = `Delen: ${index + 1} van 52 kaarten.`;
        if (index === sampleDeal.length - 1) {
          tableDemo.classList.add("is-dealt");
          dealButton.disabled = false;
          if (dealStatus) dealStatus.textContent = "Iedere speler heeft nu 13 kaarten.";
        }
      }, index * 55);
      dealTimers.push(timer);
    });
  }

  function chooseWindSeat(button) {
    const current = windQuestions[windStep];
    if (!current) return;

    const correct = button.dataset.windSeat === current.seat;
    windSeats.forEach((seat) => seat.classList.remove("is-correct", "is-missed"));
    button.classList.add(correct ? "is-correct" : "is-missed");

    if (!correct) {
      if (windFeedback) windFeedback.textContent = `Bijna. Zoek ${windSeatName(current.seat)} op het tafelkompas.`;
      return;
    }

    if (windFeedback) windFeedback.textContent = current.ok;
    windStep += 1;

    if (windStep >= windQuestions.length) {
      if (windQuestion) windQuestion.textContent = "Je tafelkompas staat goed.";
      if (windFeedback) windFeedback.textContent = "Mooi. Zuid-Noord spelen samen; Oost-West zitten links en rechts.";
      windSeats.forEach((seat) => seat.classList.remove("is-target", "is-missed"));
      return;
    }

    renderWindStep();
  }

  function renderWindStep() {
    const current = windQuestions[windStep];
    if (!current) return;
    windSeats.forEach((seat) => seat.classList.remove("is-correct", "is-missed", "is-target"));
    document.querySelector(`[data-wind-seat="${current.seat}"]`)?.classList.add("is-target");
    if (windQuestion) windQuestion.textContent = current.text;
  }

  function windSeatName(seat) {
    return {
      North: "Noord",
      East: "Oost",
      South: "Zuid",
      West: "West"
    }[seat] || seat;
  }

  function dealOneCard(card, seat, index) {
    const seatEl = tableDemo?.querySelector(`[data-seat-target="${seat}"]`);
    const stack = seatEl?.querySelector(".seat-stack");
    if (!stack) return;
    const nextCount = Number(stack.dataset.count || "0") + 1;
    stack.dataset.count = String(nextCount);
    updateSeatCount(seat, nextCount);

    const dealCard = document.createElement("span");
    dealCard.className = "deal-card";
    if (card.suit === "D" || card.suit === "H") dealCard.classList.add("red");
    dealCard.textContent = `${rankLabel[card.rank] || card.rank}${suitSymbols[card.suit] || card.suit}`;
    const stackIndex = nextCount - 1;
    dealCard.style.setProperty("--deal-x", `${(stackIndex - 6) * 7}px`);
    dealCard.style.setProperty("--deal-y", `${(stackIndex % 3) * 3}px`);
    dealCard.style.setProperty("--deal-rot", `${(stackIndex - 6) * 1.5}deg`);
    dealCard.style.animationDelay = `${Math.min(index, 8) * 8}ms`;
    stack.appendChild(dealCard);
  }

  function updateSeatCount(seat, count) {
    const countEl = tableDemo?.querySelector(`[data-seat-count="${seat}"]`);
    if (countEl) countEl.textContent = String(count);
  }

  function buildSampleDeal() {
    const suits = ["S", "H", "D", "C"];
    const deck = [];
    suits.forEach((suit) => {
      ranks.forEach((rank) => deck.push({ rank, suit }));
    });
    return deck;
  }
})();

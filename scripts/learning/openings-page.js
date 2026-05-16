(function initOpeningsLessonPage() {
  "use strict";

  const lessonHand = globalThis.BridgeLessonHand;
  const lessonRender = globalThis.BridgeLessonRender;
  const lessonPageHelpers = globalThis.BridgeLessonPageHelpers;
  if (!lessonHand) throw new Error("scripts/learning/shared/lesson-hand.js must load before openings-page.js");
  if (!lessonRender) throw new Error("scripts/learning/shared/lesson-render.js must load before openings-page.js");
  if (!lessonPageHelpers) throw new Error("scripts/learning/shared/lesson-page-helpers.js must load before openings-page.js");

  const {
    distributionPattern,
    hcp,
    parseHand,
    ruleOf20Score,
    suitSymbols
  } = lessonHand;

  const lessonData = globalThis.BridgeLesson03OpeningsData;
  if (!lessonData) throw new Error("scripts/learning/lesson-03-openings-data.js must load before openings-page.js");

  const openingOptions = lessonData.allOpeningOptions();
  const categoryLabels = lessonData.allCategoryLabels();
  const openingQuestions = lessonData.allOpeningQuestions();
  const casinoQuestions = lessonData.allCasinoQuestions();

  let activeCategory = "all";
  let casinoTimerId = null;
  const casinoState = {
    active: false,
    index: 0,
    score: 0,
    timeLeft: 60,
    answered: false
  };

  preserveTestHooksOnLessonLinks();
  renderTableLinks();
  renderSampleHands();
  renderFilters();
  renderOpeningQuestions();
  initCasino();

  function renderSampleHands() {
    document.querySelectorAll("[data-sample-hand]").forEach((target) => {
      renderOpeningHand(target, parseHand(target.dataset.sampleHand || ""));
    });
  }

  function renderOpeningHand(target, cards) {
    return lessonRender.renderHand(target, cards, {
      cardOptions: {
        className: "opening-card playing-card",
        showSuitInMini: false,
        showSuitInRank: false,
        tagName: "span"
      }
    });
  }

  function renderFilters() {
    const root = document.querySelector("#opening-question-filters");
    if (!root) return;
    root.innerHTML = "";
    Object.keys(categoryLabels).forEach((category) => {
      const button = document.createElement("button");
      button.type = "button";
      const count = category === "all"
        ? openingQuestions.length
        : openingQuestions.filter((question) => question.category === category).length;
      button.textContent = `${categoryLabels[category]} (${count})`;
      button.setAttribute("aria-pressed", String(category === activeCategory));
      button.addEventListener("click", () => {
        activeCategory = category;
        renderFilters();
        renderOpeningQuestions();
      });
      root.appendChild(button);
    });
  }

  function renderOpeningQuestions() {
    const root = document.querySelector("#opening-questions");
    if (!root) return;
    root.innerHTML = "";
    const questions = activeCategory === "all"
      ? openingQuestions
      : openingQuestions.filter((question) => question.category === activeCategory);

    questions.forEach((question, index) => {
      root.appendChild(questionCard(question, index));
    });
  }

  function questionCard(question, index) {
    const cards = parseHand(question.hand);
    const item = document.createElement("article");
    item.className = "opening-question";

    const category = document.createElement("span");
    category.className = "question-category";
    category.textContent = categoryLabels[question.category] || "Opening";

    const heading = document.createElement("p");
    heading.className = "question-heading";
    heading.textContent = `${index + 1}. Wat open je?`;

    const hand = document.createElement("div");
    hand.className = "question-hand";
    renderOpeningHand(hand, cards);

    const facts = document.createElement("div");
    facts.className = "question-facts";
    renderFactChips(facts, cards);

    const options = document.createElement("div");
    options.className = "question-options";

    const feedback = document.createElement("p");
    feedback.className = "question-feedback";
    feedback.setAttribute("aria-live", "polite");
    feedback.textContent = "Kies een openingsactie.";

    openingOptions.forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = option.label;
      button.dataset.value = option.value;
      button.addEventListener("click", () => {
        handleOpeningAnswer({ question, item, button, feedback });
      });
      options.appendChild(button);
    });

    const footer = document.createElement("div");
    footer.className = "question-footer";
    if (question.handId && question.chapterId) footer.appendChild(tableLink(question));

    item.append(category, heading, hand, facts, options, feedback, footer);
    return item;
  }

  function handleOpeningAnswer({ question, item, button, feedback }) {
    const selected = button.dataset.value || "";
    const correct = selected === question.answer;

    item.querySelectorAll(".question-options button").forEach((candidate) => {
      const value = candidate.dataset.value || "";
      candidate.classList.remove("is-correct", "is-missed");
      candidate.setAttribute("aria-pressed", String(candidate === button));
      if (value === question.answer) candidate.classList.add("is-correct");
    });

    if (!correct) button.classList.add("is-missed");
    feedback.textContent = correct ? question.feedback : wrongFeedback(question, selected);
  }

  function wrongFeedback(question, selected) {
    if (question.wrongByChoice?.[selected]) return question.wrongByChoice[selected];
    const answer = openingOptions.find((option) => option.value === question.answer)?.label || question.answer;
    if (question.answer === "WEAK_TWO") return `Bijna. Zoek de zeskaart met beperkte kracht: dit is een zwakke twee${question.expectedBid ? ` (${formatCall(question.expectedBid)})` : ""}.`;
    if (selected === "1NT") return "Niet 1SA, want deze hand past niet bij 15-17 punten met een Evenwichtige verdeling.";
    if (selected === "WEAK_TWO") return "Niet zwakke twee, want deze hand hoort bij een normale opening, een lage kleur of pas.";
    return `Bijna. De beste opening is ${answer}. ${question.feedback}`;
  }

  function tableLink(question) {
    const link = document.createElement("a");
    link.className = "question-table-link";
    link.textContent = "Oefen aan tafel";
    link.dataset.tableLink = "";
    link.dataset.hand = question.handId;
    link.dataset.chapter = question.chapterId;
    link.href = tableHref(question.handId, question.chapterId);
    return link;
  }

  function initCasino() {
    document.querySelector("#casino-start")?.addEventListener("click", startCasino);
    document.querySelector("#casino-next")?.addEventListener("click", nextCasinoHand);
    renderCasinoOptions();
  }

  function startCasino() {
    clearInterval(casinoTimerId);
    casinoState.active = true;
    casinoState.index = 0;
    casinoState.score = 0;
    casinoState.timeLeft = 60;
    casinoState.answered = false;
    const start = document.querySelector("#casino-start");
    if (start) start.textContent = "Opnieuw starten";
    casinoTimerId = setInterval(() => {
      casinoState.timeLeft -= 1;
      updateCasinoStatus();
      if (casinoState.timeLeft <= 0) finishCasino("Tijd voorbij.");
    }, 1000);
    renderCasinoHand();
  }

  function renderCasinoOptions() {
    const root = document.querySelector("#casino-options");
    if (!root) return;
    root.innerHTML = "";
    openingOptions.forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = option.label;
      button.dataset.value = option.value;
      button.disabled = true;
      button.addEventListener("click", () => answerCasino(option.value));
      root.appendChild(button);
    });
  }

  function renderCasinoHand() {
    if (casinoState.index >= casinoQuestions.length) {
      finishCasino("Casino klaar.");
      return;
    }
    casinoState.answered = false;
    const question = casinoQuestions[casinoState.index];
    const handRoot = document.querySelector("#casino-hand");
    const feedback = document.querySelector("#casino-feedback");
    const next = document.querySelector("#casino-next");
    if (handRoot) {
      handRoot.className = "casino-hand";
      renderOpeningHand(handRoot, parseHand(question.hand));
    }
    document.querySelectorAll("#casino-options button").forEach((button) => {
      button.disabled = false;
      button.classList.remove("is-correct", "is-missed");
      button.setAttribute("aria-pressed", "false");
    });
    if (feedback) feedback.textContent = "Kies de opening voor deze hand.";
    if (next) next.disabled = true;
    updateCasinoStatus();
  }

  function answerCasino(selected) {
    if (!casinoState.active || casinoState.answered) return;
    const question = casinoQuestions[casinoState.index];
    const correct = selected === question.answer;
    casinoState.answered = true;
    if (correct) casinoState.score += 1;

    document.querySelectorAll("#casino-options button").forEach((button) => {
      const value = button.dataset.value || "";
      button.disabled = true;
      button.classList.toggle("is-correct", value === question.answer);
      button.classList.toggle("is-missed", value === selected && value !== question.answer);
      button.setAttribute("aria-pressed", String(value === selected));
    });

    const feedback = document.querySelector("#casino-feedback");
    if (feedback) feedback.textContent = correct ? question.feedback : wrongFeedback(question, selected);

    if (casinoState.index === casinoQuestions.length - 1) {
      finishCasino(correct ? "Casino klaar." : "Casino klaar.");
      return;
    }
    const next = document.querySelector("#casino-next");
    if (next) next.disabled = false;
    updateCasinoStatus();
  }

  function nextCasinoHand() {
    if (!casinoState.active || !casinoState.answered) return;
    casinoState.index += 1;
    renderCasinoHand();
  }

  function finishCasino(prefix) {
    clearInterval(casinoTimerId);
    casinoTimerId = null;
    casinoState.active = false;
    casinoState.answered = false;
    if (prefix.startsWith("Casino klaar.")) casinoState.index = casinoQuestions.length;
    document.querySelectorAll("#casino-options button").forEach((button) => {
      button.disabled = true;
    });
    const next = document.querySelector("#casino-next");
    if (next) next.disabled = true;
    const feedback = document.querySelector("#casino-feedback");
    if (feedback) feedback.textContent = `${prefix} Je eindscore is ${casinoState.score} van ${casinoQuestions.length}.`;
    const start = document.querySelector("#casino-start");
    if (start) start.textContent = "Nog een casino";
    updateCasinoStatus();
  }

  function updateCasinoStatus() {
    const progress = document.querySelector("#casino-progress");
    const timer = document.querySelector("#casino-timer");
    const score = document.querySelector("#casino-score");
    const shownIndex = casinoState.active
      ? Math.min(casinoState.index + 1, casinoQuestions.length)
      : Math.min(casinoState.index, casinoQuestions.length);
    if (progress) progress.textContent = `Hand ${shownIndex} van ${casinoQuestions.length}`;
    if (timer) timer.textContent = `${Math.max(0, casinoState.timeLeft)} sec`;
    if (score) score.textContent = `Score ${casinoState.score}`;
  }

  function renderFactChips(root, cards) {
    return lessonRender.renderChips(root, [
      `${hcp(cards)} punten`,
      distributionPattern(cards),
      `langste: ${lessonHand.longestSuitText(cards)}`,
      `Regel van 20: ${ruleOf20Score(cards)}`
    ]);
  }

  function formatCall(call) {
    return String(call || "")
      .replace("1C", `1${suitSymbols.C}`)
      .replace("1D", `1${suitSymbols.D}`)
      .replace("1H", `1${suitSymbols.H}`)
      .replace("1S", `1${suitSymbols.S}`)
      .replace("2D", `2${suitSymbols.D}`)
      .replace("2H", `2${suitSymbols.H}`)
      .replace("2S", `2${suitSymbols.S}`)
      .replace("1NT", "1SA");
  }

  function renderTableLinks() {
    document.querySelectorAll("[data-table-link]").forEach((link) => {
      link.href = tableHref(link.dataset.hand, link.dataset.chapter);
    });
  }

  function tableHref(handId, chapterId) {
    const href = new URL("../index.html", window.location.href);
    href.searchParams.set("lesson", "les-03-eerste-openingen");
    href.searchParams.set("hand", handId || "lesson-03-one-spade-opening-001");
    if (chapterId) href.searchParams.set("chapter", chapterId);
    href.searchParams.set("return", returnHref(chapterId || "tafelmomenten"));
    if (lessonPageHelpers.hasSearchParam("testHooks")) href.searchParams.set("testHooks", "1");
    return `../${lessonPageHelpers.rootRelativeHref(href)}`;
  }

  function returnHref(hash) {
    const href = new URL("03-openings.html", window.location.href);
    if (lessonPageHelpers.hasSearchParam("testHooks")) href.searchParams.set("testHooks", "1");
    href.hash = hash || "tafelmomenten";
    return lessonPageHelpers.rootRelativeHref(href);
  }

  function preserveTestHooksOnLessonLinks() {
    lessonPageHelpers.preserveTestHooksOnLinks("a[href]");
  }
})();

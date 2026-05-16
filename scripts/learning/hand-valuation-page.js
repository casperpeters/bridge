(function initHandValuationPage() {
  "use strict";

  const lessonHand = globalThis.BridgeLessonHand;
  const lessonRender = globalThis.BridgeLessonRender;
  const lessonPageHelpers = globalThis.BridgeLessonPageHelpers;
  if (!lessonHand) throw new Error("scripts/learning/shared/lesson-hand.js must load before hand-valuation-page.js");
  if (!lessonRender) throw new Error("scripts/learning/shared/lesson-render.js must load before hand-valuation-page.js");
  if (!lessonPageHelpers) throw new Error("scripts/learning/shared/lesson-page-helpers.js must load before hand-valuation-page.js");

  const {
    countSuits,
    distributionPattern,
    hcp,
    isBalanced,
    longestSuits,
    parseHand,
    shortSuits,
    suitLengthsText,
    suitNames,
    suits
  } = lessonHand;

  const lessonData = globalThis.BridgeLesson02ValuationData;
  if (!lessonData) throw new Error("scripts/learning/lesson-02-valuation-data.js must load before hand-valuation-page.js");

  const valuationQuestions = lessonData.allValuationQuestions();
  const miniQuiz = lessonData.allMiniQuizQuestions();
  const fallbackHands = lessonData.allFallbackHands();
  const raceHandTexts = lessonData.allRaceHandTexts().map(parseHand);

  let generatorSeed = 2102;
  let raceTimerId = null;
  const raceState = {
    active: false,
    index: 0,
    score: 0,
    timeLeft: 75,
    selectedHcp: null,
    selectedBalanced: null,
    waitingNext: false
  };

  preserveTestHooksOnLessonLinks();
  renderSampleHands();
  initQuickChecks();
  renderValuationQuestions();
  renderMiniQuiz();
  initGenerator();
  initRace();

  function renderSampleHands() {
    document.querySelectorAll("[data-sample-hand]").forEach((target) => {
      renderValuationHand(target, parseHand(target.dataset.sampleHand || ""));
    });
  }

  function renderValuationHand(target, cards) {
    return lessonRender.renderHand(target, cards, {
      cardOptions: { className: "playing-card valuation-card" }
    });
  }

  function initQuickChecks() {
    document.querySelectorAll(".quick-check").forEach((check) => {
      const feedback = check.querySelector(".quick-feedback");
      check.querySelectorAll("button").forEach((button) => {
        button.addEventListener("click", () => {
          check.querySelectorAll("button").forEach((candidate) => {
            candidate.classList.remove("is-correct", "is-missed");
          });
          const correct = button.dataset.correct === "true";
          button.classList.add(correct ? "is-correct" : "is-missed");
          if (feedback) feedback.textContent = button.dataset.feedback || "";
        });
      });
    });
  }

  function renderValuationQuestions() {
    const root = document.querySelector("#valuation-questions");
    if (!root) return;
    root.innerHTML = "";

    valuationQuestions.forEach((question, index) => {
      const cards = parseHand(question.hand);
      const item = document.createElement("article");
      item.className = "valuation-question";

      const heading = document.createElement("p");
      heading.className = "question-heading";
      heading.textContent = `${index + 1}. ${question.prompt}`;

      const hand = document.createElement("div");
      hand.className = "question-hand";
      renderValuationHand(hand, cards);

      const options = document.createElement("div");
      options.className = "question-options";

      const facts = document.createElement("div");
      facts.className = "question-facts";

      const feedback = document.createElement("p");
      feedback.className = "question-feedback";
      feedback.setAttribute("aria-live", "polite");
      feedback.textContent = "Kies je antwoord.";

      questionOptions(question, cards).forEach((option) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = option.label;
        button.dataset.value = option.value;
        button.addEventListener("click", () => {
          handleQuestionAnswer({ question, cards, item, button, facts, feedback });
        });
        options.appendChild(button);
      });

      item.append(heading, hand, options, facts, feedback);
      root.appendChild(item);
    });
  }

  function handleQuestionAnswer({ question, cards, item, button, facts, feedback }) {
    const correctValue = correctQuestionValue(question, cards);
    const selectedValue = button.dataset.value || "";
    const correct = selectedValue === correctValue;

    item.querySelectorAll(".question-options button").forEach((candidate) => {
      candidate.classList.remove("is-correct", "is-missed");
      if ((candidate.dataset.value || "") === correctValue) candidate.classList.add("is-correct");
    });
    if (!correct) button.classList.add("is-missed");

    renderFactChips(facts, cards);
    feedback.textContent = correct ? question.good : question.wrong;
  }

  function questionOptions(question, cards) {
    if (question.kind === "hcp") {
      return hcpOptions(hcp(cards)).map((value) => ({ label: `${value} punten`, value: String(value) }));
    }
    if (question.kind === "balanced") {
      return [
        { label: "Ja, evenwichtig", value: "true" },
        { label: "Nee, onevenwichtig", value: "false" }
      ];
    }
    if (question.kind === "longest") {
      return suits.map((suit) => ({ label: suitNames[suit], value: suit }));
    }
    return [
      { label: "Ja, later meer waard", value: "yes" },
      { label: "Nee, nog niet", value: "no" }
    ];
  }

  function correctQuestionValue(question, cards) {
    if (question.kind === "hcp") return String(hcp(cards));
    if (question.kind === "balanced") return String(isBalanced(cards));
    if (question.kind === "longest") return question.answerSuit || longestSuits(cards)[0] || "";
    return question.answer || "";
  }

  function renderMiniQuiz() {
    const root = document.querySelector("#mini-quiz");
    if (!root) return;
    root.innerHTML = "";

    miniQuiz.forEach((question, index) => {
      const item = document.createElement("article");
      item.className = "quiz-item";

      const prompt = document.createElement("p");
      prompt.textContent = `${index + 1}. ${question.question}`;

      const options = document.createElement("div");
      options.className = "quiz-options";

      const feedback = document.createElement("p");
      feedback.className = "quiz-feedback";
      feedback.setAttribute("aria-live", "polite");
      feedback.textContent = "Kies een antwoord.";

      question.options.forEach((option) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = option;
        button.addEventListener("click", () => {
          item.querySelectorAll(".quiz-options button").forEach((candidate) => {
            candidate.classList.remove("is-correct", "is-missed");
            if (candidate.textContent === question.answer) candidate.classList.add("is-correct");
          });
          const correct = option === question.answer;
          if (!correct) button.classList.add("is-missed");
          feedback.textContent = correct ? question.feedback : `Bijna. Het beste antwoord is: ${question.answer}.`;
        });
        options.appendChild(button);
      });

      item.append(prompt, options, feedback);
      root.appendChild(item);
    });
  }

  function initGenerator() {
    const buttons = [...document.querySelectorAll("[data-criterion]")];
    buttons.forEach((button) => {
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", () => {
        buttons.forEach((candidate) => candidate.setAttribute("aria-pressed", String(candidate === button)));
        renderGeneratedHand(button.dataset.criterion || "exact12");
      });
    });
    buttons[0]?.click();
  }

  function renderGeneratedHand(criterion) {
    const handRoot = document.querySelector("#generated-hand");
    const factsRoot = document.querySelector("#generated-facts");
    if (!handRoot || !factsRoot) return;

    const cards = generateMatchingHand(criterion);
    renderValuationHand(handRoot, cards);

    const facts = generatedFacts(criterion, cards);
    factsRoot.innerHTML = "";
    const intro = document.createElement("p");
    intro.textContent = facts.intro;
    const list = document.createElement("ul");
    facts.items.forEach((text) => {
      const item = document.createElement("li");
      item.textContent = text;
      list.appendChild(item);
    });
    factsRoot.append(intro, list);
  }

  function generateMatchingHand(criterion) {
    const matcher = criterionMatchers()[criterion] || criterionMatchers().exact12;
    for (let attempt = 0; attempt < 5000; attempt += 1) {
      const deck = lessonHand.shuffledDeck(nextRandom);
      const hand = lessonHand.sortCards(deck.slice(0, 13));
      if (matcher(hand)) return hand;
    }
    return parseHand(fallbackHands[criterion] || fallbackHands.exact12);
  }

  function criterionMatchers() {
    return {
      exact12: (cards) => hcp(cards) === 12,
      balanced1517: (cards) => {
        const points = hcp(cards);
        return points >= 15 && points <= 17 && isBalanced(cards);
      },
      fitSingleton: (cards) => {
        const counts = countSuits(cards);
        const points = hcp(cards);
        return points >= 8 && points <= 12 && counts.H >= 3 && ["S", "D", "C"].some((suit) => counts[suit] === 1);
      },
      rule20Intro: (cards) => {
        const points = hcp(cards);
        const longest = Object.values(countSuits(cards)).sort((a, b) => b - a).slice(0, 2);
        return points >= 10 && points <= 11 && points + longest[0] + longest[1] >= 20;
      }
    };
  }

  function generatedFacts(criterion, cards) {
    const counts = countSuits(cards);
    const points = hcp(cards);
    const longest = Object.values(counts).sort((a, b) => b - a).slice(0, 2);
    const short = shortSuits(cards);
    const common = [
      `punten: ${points}.`,
      `Verdeling: ${distributionPattern(cards)} (${suitLengthsText(cards)}).`,
      `Langste kleur: ${longestSuitText(cards)}.`
    ];

    if (criterion === "balanced1517") {
      return {
        intro: "Deze hand past bij de 1SA-denkvraag.",
        items: [...common, "15-17 punten plus een Evenwichtige verdeling maakt 1SA de eerste kandidaat in dit profiel."]
      };
    }
    if (criterion === "fitSingleton") {
      return {
        intro: "Deze hand is gemaakt om herwaarderen na een Fit te zien.",
        items: [...common, `${short.length ? `Korte kleur: ${short.join(", ")}.` : "Geen korte zijkleur gevonden."}`, "Als partner vijf harten toont, worden jouw hartensteun en korte zijkleur waardevoller."]
      };
    }
    if (criterion === "rule20Intro") {
      return {
        intro: "Deze hand kijkt vooruit naar de Regel van 20.",
        items: [...common, `Voorproefje: ${points} punten + ${longest[0]} + ${longest[1]} kaarten in de twee langste kleuren = ${points + longest[0] + longest[1]}.`, "In deze les hoef je de volledige regel nog niet toe te passen; herken vooral dat lange kleuren iets kunnen toevoegen."]
      };
    }
    return {
      intro: "Deze hand is een zuivere punten-oefening.",
      items: [...common, "Exact 12 punten is een eerste signaal van mogelijke Openingskracht."]
    };
  }

  function initRace() {
    const start = document.querySelector("#race-start");
    const submit = document.querySelector("#race-submit");
    start?.addEventListener("click", startRace);
    submit?.addEventListener("click", () => {
      if (!raceState.active) return;
      if (raceState.waitingNext) {
        raceState.index += 1;
        renderRaceHand();
        return;
      }
      submitRaceAnswer();
    });

    document.querySelectorAll("[data-race-balanced]").forEach((button) => {
      button.addEventListener("click", () => {
        if (!raceState.active || raceState.waitingNext) return;
        raceState.selectedBalanced = button.dataset.raceBalanced === "true";
        document.querySelectorAll("[data-race-balanced]").forEach((candidate) => {
          candidate.setAttribute("aria-pressed", String(candidate === button));
        });
        syncRaceSubmit();
      });
    });
  }

  function startRace() {
    clearInterval(raceTimerId);
    raceState.active = true;
    raceState.index = 0;
    raceState.score = 0;
    raceState.timeLeft = 75;
    raceState.waitingNext = false;
    document.querySelector("#race-start").textContent = "Opnieuw starten";
    raceTimerId = setInterval(() => {
      raceState.timeLeft -= 1;
      updateRaceStatus();
      if (raceState.timeLeft <= 0) finishRace("Tijd voorbij.");
    }, 1000);
    renderRaceHand();
  }

  function renderRaceHand() {
    if (raceState.index >= raceHandTexts.length) {
      finishRace("Race klaar.");
      return;
    }

    raceState.selectedHcp = null;
    raceState.selectedBalanced = null;
    raceState.waitingNext = false;

    const cards = raceHandTexts[raceState.index];
    const handRoot = document.querySelector("#race-hand");
    const hcpRoot = document.querySelector("#race-hcp-options");
    const submit = document.querySelector("#race-submit");
    const feedback = document.querySelector("#race-feedback");

    if (handRoot) {
      handRoot.className = "race-hand";
      renderValuationHand(handRoot, cards);
    }

    if (hcpRoot) {
      hcpRoot.innerHTML = "";
      hcpOptions(hcp(cards)).forEach((value) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = String(value);
        button.dataset.raceHcp = String(value);
        button.addEventListener("click", () => {
          if (!raceState.active || raceState.waitingNext) return;
          raceState.selectedHcp = value;
          hcpRoot.querySelectorAll("button").forEach((candidate) => {
            candidate.setAttribute("aria-pressed", String(candidate === button));
          });
          syncRaceSubmit();
        });
        hcpRoot.appendChild(button);
      });
    }

    document.querySelectorAll("[data-race-balanced]").forEach((button) => {
      button.disabled = false;
      button.classList.remove("is-correct", "is-missed");
      button.setAttribute("aria-pressed", "false");
    });

    if (submit) {
      submit.textContent = "Controleer";
      submit.disabled = true;
    }
    if (feedback) feedback.textContent = "Kies punten en verdeling voor deze hand.";
    updateRaceStatus();
  }

  function submitRaceAnswer() {
    const cards = raceHandTexts[raceState.index];
    const correctHcp = hcp(cards);
    const correctBalanced = isBalanced(cards);
    const correct = raceState.selectedHcp === correctHcp && raceState.selectedBalanced === correctBalanced;
    const submit = document.querySelector("#race-submit");
    const feedback = document.querySelector("#race-feedback");

    if (correct) raceState.score += 1;
    raceState.waitingNext = true;

    document.querySelectorAll("[data-race-hcp]").forEach((button) => {
      const value = Number(button.dataset.raceHcp || 0);
      button.disabled = true;
      button.classList.toggle("is-correct", value === correctHcp);
      button.classList.toggle("is-missed", value === raceState.selectedHcp && value !== correctHcp);
    });

    document.querySelectorAll("[data-race-balanced]").forEach((button) => {
      const value = button.dataset.raceBalanced === "true";
      button.disabled = true;
      button.classList.toggle("is-correct", value === correctBalanced);
      button.classList.toggle("is-missed", value === raceState.selectedBalanced && value !== correctBalanced);
    });

    if (raceState.index === raceHandTexts.length - 1) {
      finishRace(`Race klaar. ${raceResultText(correct, correctHcp, correctBalanced)}`);
      return;
    }

    if (feedback) feedback.textContent = raceResultText(correct, correctHcp, correctBalanced);
    if (submit) {
      submit.textContent = "Volgende hand";
      submit.disabled = false;
    }
    updateRaceStatus();
  }

  function raceResultText(correct, correctHcp, correctBalanced) {
    const balanceText = correctBalanced ? "evenwichtig" : "onevenwichtig";
    if (correct) return `Goed. ${correctHcp} punten en ${balanceText}.`;
    return `Bijna. Deze hand heeft ${correctHcp} punten en is ${balanceText}.`;
  }

  function syncRaceSubmit() {
    const submit = document.querySelector("#race-submit");
    if (!submit) return;
    submit.disabled = raceState.selectedHcp === null || raceState.selectedBalanced === null;
  }

  function finishRace(prefix) {
    clearInterval(raceTimerId);
    raceTimerId = null;
    if (prefix.startsWith("Race klaar.")) raceState.index = raceHandTexts.length;
    raceState.active = false;
    raceState.waitingNext = false;
    const submit = document.querySelector("#race-submit");
    const feedback = document.querySelector("#race-feedback");
    if (submit) submit.disabled = true;
    if (feedback) feedback.textContent = `${prefix} Je eindscore is ${raceState.score} van ${raceHandTexts.length}.`;
    document.querySelector("#race-start").textContent = "Nog een race";
    updateRaceStatus();
  }

  function updateRaceStatus() {
    const progress = document.querySelector("#race-progress");
    const timer = document.querySelector("#race-timer");
    const score = document.querySelector("#race-score");
    const shownIndex = raceState.active ? Math.min(raceState.index + 1, raceHandTexts.length) : Math.min(raceState.index, raceHandTexts.length);
    if (progress) progress.textContent = `Hand ${shownIndex} van ${raceHandTexts.length}`;
    if (timer) timer.textContent = `${Math.max(0, raceState.timeLeft)} sec`;
    if (score) score.textContent = `Score ${raceState.score}`;
  }

  function hcpOptions(correct) {
    const values = new Set([correct, Math.max(0, correct - 2), Math.max(0, correct - 1), correct + 1]);
    return [...values].sort((a, b) => a - b);
  }

  function nextRandom() {
    generatorSeed = (Math.imul(generatorSeed, 1664525) + 1013904223) >>> 0;
    return generatorSeed / 4294967296;
  }

  function longestSuitText(cards) {
    return lessonHand.longestSuitText(cards, { includeCounts: true, separator: ", " });
  }

  function renderFactChips(target, cards) {
    return lessonRender.renderChips(target, [
      `${hcp(cards)} punten`,
      distributionPattern(cards),
      isBalanced(cards) ? "evenwichtig" : "onevenwichtig",
      `langste: ${longestSuitText(cards)}`
    ]);
  }

  function preserveTestHooksOnLessonLinks() {
    const params = new URLSearchParams(window.location.search || "");
    document.querySelectorAll('a[href^="index.html"], a[href^="../index.html"]').forEach((link) => {
      const rawHref = link.getAttribute("href") || "";
      const href = new URL(rawHref, window.location.href);
      const tableLink = rawHref.startsWith("../index.html");
      if (tableLink) {
        applyTableLinkContext(href, params);
        link.addEventListener("click", () => {
          const nextHref = new URL(link.getAttribute("href"), window.location.href);
          applyTableLinkContext(nextHref, params);
          link.href = `../${lessonPageHelpers.rootRelativeHref(nextHref)}`;
        });
      }
      if (params.has("testHooks")) href.searchParams.set("testHooks", "1");
      link.href = tableLink ? `../${lessonPageHelpers.rootRelativeHref(href)}` : lessonPageHelpers.relativeHref(href);
    });
  }

  function applyTableLinkContext(href, params) {
    const lessonId = href.searchParams.get("lesson");
    const chapterId = href.searchParams.get("chapter") || chapterForHand(href.searchParams.get("hand"));
    if (chapterId) href.searchParams.set("chapter", chapterId);
    if (lessonId) href.searchParams.set("return", currentLessonReturnHref(params));
    if (params.has("testHooks")) href.searchParams.set("testHooks", "1");
  }

  function currentLessonReturnHref(params) {
    const href = new URL(window.location.href);
    if (params.has("testHooks")) href.searchParams.set("testHooks", "1");
    if (!href.hash) {
      const activeCard = document.querySelector("[data-lesson-card].is-active-lesson-card") || document.querySelector("[data-lesson-card]:not([hidden])");
      if (activeCard?.id) href.hash = activeCard.id;
    }
    return lessonPageHelpers.rootRelativeHref(href);
  }

  function chapterForHand(handId) {
    return {
      "one-nt-opening-001": "een-sa-opening-herkennen",
      "opening-pass-001": "openingskracht-of-pas"
    }[handId] || "";
  }
})();

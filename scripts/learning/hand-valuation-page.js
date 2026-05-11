(function initHandValuationPage() {
  "use strict";

  const suits = ["S", "H", "D", "C"];
  const suitSymbols = { S: "\u2660", H: "\u2665", D: "\u2666", C: "\u2663" };
  const suitNames = { S: "schoppen", H: "harten", D: "ruiten", C: "klaveren" };
  const rankOrder = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"];
  const descendingRanks = [...rankOrder].reverse();
  const rankLabel = { T: "10", J: "J", Q: "Q", K: "K", A: "A" };
  const hcpValue = { A: 4, K: 3, Q: 2, J: 1 };

  const valuationQuestions = [
    {
      kind: "hcp",
      prompt: "Hoeveel HCP heeft deze hand?",
      hand: "AS QS 7S KH 9H 4H QD 8D 3D JC 6C 5C 2C",
      good: "Goed. Aas, Heer, Vrouw, Vrouw en Boer maken samen 12 HCP.",
      wrong: "Tel alleen A, K, Q en J. De kleine kaarten tellen niet mee."
    },
    {
      kind: "hcp",
      prompt: "Hoeveel HCP heeft deze hand? Let op de tienen.",
      hand: "AS TS 8S KH TH 6H QD JD 4D TC 9C 7C 3C",
      good: "Precies. De drie tienen zijn honneurs, maar leveren 0 HCP op.",
      wrong: "De 10 is een Honneur, maar geen HCP. Tel A, K, Q en J."
    },
    {
      kind: "balanced",
      prompt: "Is deze hand evenwichtig?",
      hand: "AS 8S 5S 2S KH 9H 4H QD 6D 3D 8C 7C 5C",
      good: "Ja. De verdeling is 4-3-3-3, dus evenwichtig.",
      wrong: "Kijk naar het patroon: 4-3-3-3 staat op de evenwichtige lijst."
    },
    {
      kind: "balanced",
      prompt: "Is deze hand evenwichtig?",
      hand: "AS KS 9S 7S 6S 4S QH 8H 2H 7D 5D 3D 4C",
      good: "Goed gezien. 6-3-3-1 is onevenwichtig en heeft een singleton.",
      wrong: "Deze hand heeft zes schoppen en een singleton klaveren. Dat is geen SA-verdeling."
    },
    {
      kind: "longest",
      prompt: "Welke kleur is het langst?",
      hand: "KS 8S 4S AH QH 9H 7H 3H JD 6D 2D 8C 5C",
      answerSuit: "H",
      good: "Klopt. Harten heeft vijf kaarten en is de langste kleur.",
      wrong: "Tel per kleur. Harten heeft hier vijf kaarten."
    },
    {
      kind: "longest",
      prompt: "Welke kleur is het langst?",
      hand: "QS 9S 8H 6H 3H AD KD 7D 5D 2D JC TC 4C",
      answerSuit: "D",
      good: "Ja. Ruiten heeft vijf kaarten en is de langste kleur.",
      wrong: "Tel de ruiten nog eens: A, K, 7, 5 en 2."
    },
    {
      kind: "fitValue",
      prompt: "Zou deze hand later meer waard worden met een hartenfit?",
      hand: "AS 8S 6S 4S 2S KH 9H 5H QD 7D 6D 2D 3C",
      answer: "yes",
      good: "Ja. Met drie harten tegenover partners vijf harten is er een Fit, en de singleton klaveren wordt nuttig.",
      wrong: "Partner met vijf harten plus jouw drie harten geeft een Fit. Dan is de singleton klaveren extra interessant."
    },
    {
      kind: "fitValue",
      prompt: "Zou deze hand later meer waard worden met een hartenfit?",
      hand: "AS QS 8S 7H 4H KD JD 6D 9C 8C 7C 5C 2C",
      answer: "no",
      good: "Goed. Met maar twee harten heb je tegenover vijf harten nog geen achtkaartfit.",
      wrong: "Vijf harten bij partner plus twee bij jou is zeven. Dat is nog geen Fit."
    },
    {
      kind: "balanced",
      prompt: "Is deze 5-3-3-2 hand evenwichtig?",
      hand: "AS QS 8S 6S 3S KH 7H 2H JD 8D 4D 9C 5C",
      good: "Ja. 5-3-3-2 is evenwichtig, ook al zit er een vijfkaart in.",
      wrong: "5-3-3-2 hoort bij de drie evenwichtige verdelingen."
    }
  ];

  const miniQuiz = [
    {
      question: "Welke kaarten leveren HCP op?",
      options: ["Aas, Heer, Vrouw en Boer", "Aas tot en met 10", "Alle honneurs evenveel"],
      answer: "Aas, Heer, Vrouw en Boer",
      feedback: "Juist. De 10 is wel een Honneur, maar telt 0 HCP."
    },
    {
      question: "Welke verdeling is evenwichtig?",
      options: ["4-4-3-2", "6-4-2-1", "7-3-2-1"],
      answer: "4-4-3-2",
      feedback: "Klopt. 4-4-3-2 staat samen met 4-3-3-3 en 5-3-3-2 op de lijst."
    },
    {
      question: "Wat is een Fit?",
      options: ["Samen minstens acht kaarten in een kleur", "Zelf precies vijf kaarten in een kleur", "Samen minstens acht HCP"],
      answer: "Samen minstens acht kaarten in een kleur",
      feedback: "Precies. Fit gaat over gezamenlijke lengte in een kleur."
    },
    {
      question: "Wanneer ga je herwaarderen met Fitpunten?",
      options: ["Nadat een Fit waarschijnlijk is", "Voordat je HCP telt", "Alleen bij sans-atout"],
      answer: "Nadat een Fit waarschijnlijk is",
      feedback: "Ja. Eerst HCP, daarna pas Fitpunten wanneer de bieding een Fit laat zien."
    },
    {
      question: "Hoe heet precies een kaart in een kleur?",
      options: ["Singleton", "Doubleton", "Renonce"],
      answer: "Singleton",
      feedback: "Goed. Een doubleton is twee kaarten; een renonce is nul."
    },
    {
      question: "Waarom is een Fit waardevol?",
      options: ["Troef kan controle en aftroevers geven", "Elke kaart wordt automatisch HCP", "Je hoeft geen kleur meer te bekennen"],
      answer: "Troef kan controle en aftroevers geven",
      feedback: "Klopt. Met een troeffit kunnen korte kleuren en extra troeven meer werk doen."
    },
    {
      question: "Wat is de eerste vraag bij Openingskracht?",
      options: ["Heb ik genoeg kracht om te openen?", "Welke kaart vind ik het mooist?", "Kan ik meteen slem bieden?"],
      answer: "Heb ik genoeg kracht om te openen?",
      feedback: "Precies. De eerste waardering is kracht plus verdeling, nog niet het hele eindcontract."
    }
  ];

  const fallbackHands = {
    exact12: "AS QS 7S KH 9H 4H QD 8D 3D JC 6C 5C 2C",
    balanced1517: "AS KS 8S 3S QH 7H 4H KD QD 6D JC 9C 2C",
    fitSingleton: "AS 8S 6S 4S 2S KH 9H 5H QD 7D 6D 2D 3C",
    rule20Intro: "KS QS 9S 7S 5S AH JH 8H 6H 4H 7D 3D 6C"
  };

  const raceHandTexts = [
    "AS QS 7S KH 9H 4H QD 8D 3D JC 6C 5C 2C",
    "AS TS 8S KH TH 6H QD JD 4D TC 9C 7C 3C",
    "AS KS 9S 7S 6S 4S QH 8H 2H 7D 5D 3D 4C",
    "KS 8S 4S AH QH 9H 7H 3H JD 6D 2D 8C 5C",
    "AS QS 8S KH 7H 4H AD 8D 6D 3D JC 9C 2C",
    "KS QS 9S 7S 5S AH JH 8H 6H 4H 7D 3D 6C",
    "AS 8S 6S 4S KH 9H 5H QD 7D 6D 2D 3C 2C",
    "QS 9S 3S 2S AH KH 8H 4H 2H AD TD 7D 5C",
    "AS KS QS 3S 2S 3H 2H 4C 3C AD QD 4D 3D",
    "AS KS 8S 3S QH 7H 4H KD QD 6D JC 9C 2C"
  ].map(parseHand);

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
      renderHand(target, parseHand(target.dataset.sampleHand || ""));
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
      renderHand(hand, cards);

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
      return hcpOptions(hcp(cards)).map((value) => ({ label: `${value} HCP`, value: String(value) }));
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
    renderHand(handRoot, cards);

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
      const deck = shuffledDeck();
      const hand = sortCards(deck.slice(0, 13));
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
      `HCP: ${points}.`,
      `Verdeling: ${distributionPattern(cards)} (${suitLengthsText(cards)}).`,
      `Langste kleur: ${longestSuitText(cards)}.`
    ];

    if (criterion === "balanced1517") {
      return {
        intro: "Deze hand past bij de 1SA-denkvraag.",
        items: [...common, "15-17 HCP plus een Evenwichtige verdeling maakt 1SA de eerste kandidaat in dit profiel."]
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
        items: [...common, `Voorproefje: ${points} HCP + ${longest[0]} + ${longest[1]} kaarten in de twee langste kleuren = ${points + longest[0] + longest[1]}.`, "In deze les hoef je de volledige regel nog niet toe te passen; herken vooral dat lange kleuren iets kunnen toevoegen."]
      };
    }
    return {
      intro: "Deze hand is een zuivere HCP-oefening.",
      items: [...common, "Exact 12 HCP is een eerste signaal van mogelijke Openingskracht."]
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
      renderHand(handRoot, cards);
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
    if (feedback) feedback.textContent = "Kies HCP en verdeling voor deze hand.";
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
    if (correct) return `Goed. ${correctHcp} HCP en ${balanceText}.`;
    return `Bijna. Deze hand heeft ${correctHcp} HCP en is ${balanceText}.`;
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

  function parseHand(text) {
    return sortCards(String(text || "").trim().split(/\s+/).filter(Boolean).map(parseCard));
  }

  function parseCard(token) {
    const suit = token.slice(-1).toUpperCase();
    const rawRank = token.slice(0, -1).toUpperCase();
    const rank = rawRank === "10" ? "T" : rawRank;
    return { rank, suit, id: `${rank}${suit}` };
  }

  function renderHand(target, cards) {
    if (!target) return;
    target.innerHTML = "";
    const counts = countSuits(cards);
    suits.forEach((suit) => {
      const row = document.createElement("div");
      row.className = "hand-suit-row";

      const label = document.createElement("span");
      label.className = "hand-suit-label";
      label.textContent = `${suitSymbols[suit]} ${suitNames[suit]} (${counts[suit]})`;

      const cardRow = document.createElement("div");
      cardRow.className = "hand-cards";
      const suitCards = cards.filter((card) => card.suit === suit);
      if (!suitCards.length) {
        const empty = document.createElement("span");
        empty.className = "empty-suit";
        empty.textContent = "geen";
        cardRow.appendChild(empty);
      } else {
        suitCards.forEach((card) => cardRow.appendChild(cardElement(card)));
      }

      row.append(label, cardRow);
      target.appendChild(row);
    });
  }

  function cardElement(card) {
    const cardEl = document.createElement("div");
    cardEl.className = "playing-card valuation-card";
    if (card.suit === "H" || card.suit === "D") cardEl.classList.add("red");
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

  function sortCards(cards) {
    return [...cards].sort((a, b) => {
      const suitDiff = suits.indexOf(a.suit) - suits.indexOf(b.suit);
      if (suitDiff) return suitDiff;
      return descendingRanks.indexOf(a.rank) - descendingRanks.indexOf(b.rank);
    });
  }

  function createDeck() {
    const deck = [];
    suits.forEach((suit) => {
      rankOrder.forEach((rank) => deck.push({ rank, suit, id: `${rank}${suit}` }));
    });
    return deck;
  }

  function shuffledDeck() {
    const deck = createDeck();
    for (let index = deck.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(nextRandom() * (index + 1));
      [deck[index], deck[swapIndex]] = [deck[swapIndex], deck[index]];
    }
    return deck;
  }

  function nextRandom() {
    generatorSeed = (Math.imul(generatorSeed, 1664525) + 1013904223) >>> 0;
    return generatorSeed / 4294967296;
  }

  function hcp(cards) {
    return cards.reduce((sum, card) => sum + (hcpValue[card.rank] || 0), 0);
  }

  function countSuits(cards) {
    return suits.reduce((counts, suit) => {
      counts[suit] = cards.filter((card) => card.suit === suit).length;
      return counts;
    }, {});
  }

  function distributionPattern(cards) {
    return Object.values(countSuits(cards)).sort((a, b) => b - a).join("-");
  }

  function isBalanced(cards) {
    const pattern = distributionPattern(cards);
    return pattern === "4-3-3-3" || pattern === "4-4-3-2" || pattern === "5-3-3-2";
  }

  function longestSuits(cards) {
    const counts = countSuits(cards);
    const max = Math.max(...Object.values(counts));
    return suits.filter((suit) => counts[suit] === max);
  }

  function longestSuitText(cards) {
    return longestSuits(cards).map((suit) => `${suitNames[suit]} (${countSuits(cards)[suit]})`).join(", ");
  }

  function suitLengthsText(cards) {
    const counts = countSuits(cards);
    return suits.map((suit) => `${suitSymbols[suit]} ${counts[suit]}`).join(", ");
  }

  function shortSuits(cards) {
    const counts = countSuits(cards);
    return suits
      .filter((suit) => counts[suit] <= 2)
      .map((suit) => {
        const length = counts[suit];
        const label = length === 0 ? "renonce" : length === 1 ? "singleton" : "doubleton";
        return `${label} ${suitNames[suit]}`;
      });
  }

  function renderFactChips(target, cards) {
    if (!target) return;
    target.innerHTML = "";
    [
      `${hcp(cards)} HCP`,
      distributionPattern(cards),
      isBalanced(cards) ? "evenwichtig" : "onevenwichtig",
      `langste: ${longestSuitText(cards)}`
    ].forEach((text) => {
      const chip = document.createElement("span");
      chip.className = "fact-chip";
      chip.textContent = text;
      target.appendChild(chip);
    });
  }

  function preserveTestHooksOnLessonLinks() {
    const params = new URLSearchParams(window.location.search || "");
    document.querySelectorAll('a[href^="lessons.html"], a[href^="index.html"]').forEach((link) => {
      const href = new URL(link.getAttribute("href"), window.location.href);
      if (href.pathname.endsWith("index.html")) {
        applyTableLinkContext(href, params);
        link.addEventListener("click", () => {
          const nextHref = new URL(link.getAttribute("href"), window.location.href);
          applyTableLinkContext(nextHref, params);
          link.href = relativeHref(nextHref);
        });
      }
      if (params.has("testHooks")) href.searchParams.set("testHooks", "1");
      link.href = relativeHref(href);
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
    return relativeHref(href);
  }

  function relativeHref(href) {
    return `${href.pathname.split("/").pop()}${href.search}${href.hash}`;
  }

  function chapterForHand(handId) {
    return {
      "one-nt-opening-001": "een-sa-opening-herkennen",
      "opening-pass-001": "openingskracht-of-pas"
    }[handId] || "";
  }
})();

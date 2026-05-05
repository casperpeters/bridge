(function initBridgeLessons(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const practiceHands = isCommonJs ? require("../practice-hands/index.js") : root.PracticeHands;
  const api = factory(practiceHands);
  if (isCommonJs) module.exports = api;
  root.BridgeLessons = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeLessons(practiceHands) {
  "use strict";

  const lessons = [
    {
      id: "les-01-wat-is-bridge",
      number: 1,
      title: "Wat is bridge?",
      challenge: "Win slagen samen met partner en ontdek wanneer dummy verschijnt.",
      focus: ["Spelen", "Slagen", "Dummy"],
      handIds: ["draw-trumps-001"],
      startMode: "play",
      enableGuidance: true,
      intro: "Je hoeft nog niets te bieden. Deze missie start meteen bij het spelen: kijk wie uitkomt, wie dummy is en hoeveel slagen jullie samen pakken.",
      miniQuiz: [
        {
          question: "Wat probeer je in bridge te winnen?",
          answer: "Slagen",
          options: ["Slagen", "Losse punten", "Alle harten"],
          feedback: "Ja. Een slag is een rondje waarin iedere speler precies een kaart speelt."
        },
        {
          question: "Wanneer komt dummy open op tafel?",
          answer: "Na de uitkomst",
          options: ["Voor het bieden", "Na de uitkomst", "Pas na slag 13"],
          feedback: "Precies. Eerst komt links van de leider uit; daarna zie je dummy."
        },
        {
          question: "Wie speelt de kaarten van dummy?",
          answer: "De leider",
          options: ["De leider", "Dummy zelf", "De speler links"],
          feedback: "Klopt. Dummy legt de kaarten open; de leider kiest de kaarten uit beide handen."
        }
      ],
      reviewFeedback: [
        "Je speelde een echt bord vanaf de uitkomst: vier spelers, vier kaarten per slag, dertien slagen totaal.",
        "Let vooral op het moment na de eerste kaart: dan verschijnt dummy en wordt de leider verantwoordelijk voor twee handen.",
        "De score is nu minder belangrijk dan het ritme: volgen van kleur, slagwinnaar zien, volgende slag starten."
      ],
      teachingPoints: [
        "Een bridgebord bestaat uit 13 slagen; in elke slag speelt iedere speler precies een kaart.",
        "Als Noord/Zuid leider zijn, speel jij als Zuid ook de kaarten van dummy.",
        "Als een kleur gevraagd wordt en je hebt die kleur, moet je bekennen."
      ]
    },
    {
      id: "les-02-punten-en-handtypen",
      number: 2,
      title: "Punten en handtypen",
      challenge: "Tel de kracht van Zuid en herken waarom 1SA logisch kan zijn.",
      focus: ["Bieden", "Punten"],
      handIds: ["one-nt-opening-001"]
    },
    {
      id: "les-03-eerste-openingen",
      number: 3,
      title: "Eerste openingen",
      challenge: "Open met een vijfkaart hoog wanneer je genoeg kracht hebt.",
      focus: ["Bieden", "Opening"],
      handIds: ["one-heart-opening-001"]
    },
    {
      id: "les-04-fit-zoeken-na-hoog",
      number: 4,
      title: "Fit zoeken na 1 hoog",
      challenge: "Partner opent 1 schoppen. Ontdek of drie troeven genoeg steun zijn.",
      focus: ["Bieden", "Fit"],
      handIds: ["response-raise-after-1s-001"]
    },
    {
      id: "les-05-zonder-fit",
      number: 5,
      title: "Zonder fit: nieuwe kleur of SA",
      challenge: "Geen fit met partners harten? Toon je schoppen rustig op eenniveau.",
      focus: ["Bieden", "Antwoord"],
      handIds: ["response-new-suit-after-1h-001"]
    },
    {
      id: "les-06-lage-kleuren",
      number: 6,
      title: "Openingen in lage kleuren",
      challenge: "Na een lage-kleur opening kan een vierkaart hoog de volgende aanwijzing zijn.",
      focus: ["Bieden", "Hoge kleur"],
      handIds: ["minor-opening-find-major-001"]
    },
    {
      id: "les-07-contract-en-score",
      number: 7,
      title: "Contractdoelen en score",
      challenge: "Maak 4 harten en zie waarom kwetsbaar precies gemaakt 620 scoort.",
      focus: ["Score", "Manche"],
      handIds: ["game-bonus-vulnerable-001"]
    },
    {
      id: "les-08-leiderplan",
      number: 8,
      title: "Spelen als leider: maak een plan",
      challenge: "Maak het contract rustiger door eerst de troeven onder controle te krijgen.",
      focus: ["Speelplan", "Leider"],
      handIds: ["draw-trumps-001"]
    },
    {
      id: "les-09-dummy-en-tempo",
      number: 9,
      title: "Dummy en tempo",
      challenge: "Gebruik dummy op tijd voordat de kans verdwijnt.",
      focus: ["Speelplan", "Dummy"],
      handIds: ["discard-loser-on-winner-001"]
    },
    {
      id: "les-10-basis-tegenspel",
      number: 10,
      title: "Basis tegenspel",
      challenge: "Help partner door tegen een kleurcontract uit een honneurserie te starten.",
      focus: ["Verdediging", "Uitkomst"],
      handIds: ["lead-sequence-001"]
    },
    {
      id: "les-11-sa-vervolgen",
      number: 11,
      title: "1SA-vervolgen: Stayman en Jacoby",
      challenge: "Vraag naar een hoge kleur of draag je vijfkaart over.",
      focus: ["Bieden", "Conventie"],
      handIds: ["stayman-after-1nt-001"]
    },
    {
      id: "les-12-review-hele-spellen",
      number: 12,
      title: "Reviewles: hele spellen",
      challenge: "Speel een heel bord en gebruik de review om bieden, slagen en score terug te lezen.",
      focus: ["Review", "Hele hand"],
      handIds: ["game-bonus-vulnerable-001"]
    }
  ];

  function allLessons() {
    return lessons.map((lesson) => ({
      ...lesson,
      focus: [...lesson.focus],
      handIds: [...lesson.handIds]
    }));
  }

  function findLesson(id) {
    return allLessons().find((lesson) => lesson.id === id) || null;
  }

  function validateLessons(practiceApi = practiceHands) {
    const ids = new Set();
    for (const lesson of lessons) {
      if (!lesson.id || ids.has(lesson.id)) throw new Error(`Invalid lesson id: ${lesson.id}`);
      ids.add(lesson.id);
      if (!lesson.title) throw new Error(`Lesson ${lesson.id} is missing a title`);
      if (!lesson.challenge) throw new Error(`Lesson ${lesson.id} is missing a challenge`);
      if (!Array.isArray(lesson.focus) || !lesson.focus.length) throw new Error(`Lesson ${lesson.id} is missing focus labels`);
      if (!Array.isArray(lesson.handIds) || !lesson.handIds.length) throw new Error(`Lesson ${lesson.id} is missing hand ids`);
      for (const handId of lesson.handIds) {
        if (!practiceApi?.findPracticeHand?.(handId)) {
          throw new Error(`Lesson ${lesson.id} refers to unknown practice hand ${handId}`);
        }
      }
      if (lesson.startMode === "play") {
        const scenario = practiceApi?.findPracticeHand?.(lesson.handIds[0]);
        if (!scenario?.expectedContract) throw new Error(`Lesson ${lesson.id} needs an expected contract for play start`);
      }
    }
    return lessons.length;
  }

  function init(options) {
    const {
      dialog,
      openButton,
      closeButton,
      list,
      startLesson,
      closeMenu,
      labels = {}
    } = options;

    renderLessonList({ list, startLesson, labels, dialog });

    openButton?.addEventListener("click", () => {
      closeMenu?.();
      openDialog(dialog);
      closeButton?.focus();
    });
    closeButton?.addEventListener("click", () => closeDialog(dialog));
    dialog?.addEventListener("click", (event) => {
      if (event.target === dialog) closeDialog(dialog);
    });
  }

  function renderLessonList({ list, startLesson, labels, dialog }) {
    if (!list) return;
    list.innerHTML = "";
    lessons.forEach((lesson) => {
      const card = document.createElement("article");
      card.className = "lesson-card";
      if (lesson.number === 1) card.classList.add("lesson-card-featured");

      const number = document.createElement("span");
      number.className = "lesson-number";
      number.textContent = String(lesson.number);

      const heading = document.createElement("h3");
      heading.textContent = lesson.title;

      const challenge = document.createElement("p");
      challenge.className = "lesson-challenge";
      challenge.textContent = lesson.challenge;

      const focus = document.createElement("div");
      focus.className = "lesson-focus";
      lesson.focus.forEach((label) => {
        const pill = document.createElement("span");
        pill.className = "lesson-focus-pill";
        pill.textContent = label;
        focus.appendChild(pill);
      });

      const intro = lesson.intro ? document.createElement("p") : null;
      if (intro) {
        intro.className = "lesson-intro";
        intro.textContent = lesson.intro;
      }

      const action = document.createElement("button");
      action.type = "button";
      action.className = "lesson-start";
      action.textContent = labels.start || "Start oefening";
      action.addEventListener("click", () => {
        startLesson?.(findLesson(lesson.id), lesson.handIds[0]);
        closeDialog(dialog);
      });

      card.append(number, heading, challenge, focus);
      if (intro) card.appendChild(intro);
      if (lesson.miniQuiz?.length) card.appendChild(miniQuizEl(lesson.miniQuiz));
      card.appendChild(action);
      list.appendChild(card);
    });
  }

  function miniQuizEl(questions) {
    const wrapper = document.createElement("div");
    wrapper.className = "lesson-mini-quiz";
    questions.forEach((question, index) => {
      const item = document.createElement("div");
      item.className = "lesson-mini-question";

      const prompt = document.createElement("p");
      prompt.textContent = question.question;

      const options = document.createElement("div");
      options.className = "lesson-mini-options";

      const feedback = document.createElement("p");
      feedback.className = "lesson-mini-feedback";
      feedback.setAttribute("aria-live", "polite");

      question.options.forEach((option) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "lesson-mini-option";
        button.textContent = option;
        button.addEventListener("click", () => {
          item.querySelectorAll(".lesson-mini-option").forEach((optionButton) => optionButton.classList.remove("is-correct", "is-missed"));
          const correct = option === question.answer;
          button.classList.add(correct ? "is-correct" : "is-missed");
          feedback.textContent = correct ? question.feedback : `Bijna. Het beste antwoord is: ${question.answer}.`;
        });
        options.appendChild(button);
      });

      item.append(prompt, options, feedback);
      item.dataset.question = String(index + 1);
      wrapper.appendChild(item);
    });
    return wrapper;
  }

  function openDialog(dialog) {
    if (!dialog) return;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  function closeDialog(dialog) {
    if (!dialog) return;
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  }

  validateLessons();

  return {
    allLessons,
    findLesson,
    validateLessons,
    init
  };
});

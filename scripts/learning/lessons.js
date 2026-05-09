(function initBridgeLessons(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const practiceHands = isCommonJs ? require("../../practice-hands/index.js") : root.PracticeHands;
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
      summary: "Je leert hoe een bridgehand is opgebouwd: vier spelers, partners, dertien kaarten per speler, slagen winnen, dummy en de basisregel dat je kleur moet bekennen.",
      focus: ["Spelen", "Slagen", "Dummy"],
      handIds: ["draw-trumps-001"],
      pageHref: "lesson-01-cards.html",
      startMode: "play",
      enableGuidance: true,
      intro: "Je hoeft nog niets te bieden. Deze missie start meteen bij het spelen: kijk wie uitkomt, wie dummy is en hoeveel slagen jullie samen pakken.",
      chapters: [
        {
          id: "kaarten-van-spelers",
          title: "De kaarten van de spelers",
          summary: "Iedere speler krijgt 13 kaarten; samen met je partner probeer je slagen te winnen.",
          pageHref: "lesson-01-cards.html",
          blocks: [
            { type: "paragraph", text: "Bridge speel je met vier spelers. Jij zit Zuid, je partner zit Noord, en Oost/West zijn de tegenstanders." },
            { type: "paragraph", text: "Iedere speler krijgt 13 kaarten. De kaarten blijven eerst verborgen, behalve dummy: die verschijnt pas na de eerste kaart van het spelen." }
          ]
        },
        {
          id: "windrichtingen",
          title: "Noord, Oost, Zuid en West",
          summary: "De tafel gebruikt windrichtingen om partners en beurten duidelijk te houden.",
          blocks: [
            { type: "paragraph", text: "Noord en Zuid vormen samen een paar. Oost en West vormen het andere paar." },
            { type: "list", items: ["Zuid ben jij.", "Noord is je partner.", "Links van Zuid zit West; rechts van Zuid zit Oost."] }
          ]
        },
        {
          id: "bieden-en-spelen",
          title: "Bieden en spelen",
          summary: "Eerst wordt het contract gekozen; daarna probeer je dat contract te maken of te verslaan.",
          blocks: [
            { type: "paragraph", text: "In het bieden zoeken de spelers uit welke speelsoort en hoeveel slagen haalbaar lijken." },
            { type: "paragraph", text: "Na het bieden begint het spelen. De leider probeert het contract te maken; de tegenspelers proberen dat te voorkomen." }
          ]
        },
        {
          id: "een-slag",
          title: "Een slag",
          summary: "Een slag is een rondje waarin iedere speler precies een kaart speelt.",
          blocks: [
            { type: "paragraph", text: "De speler die de slag begint, bepaalt de gevraagde kleur. Daarna spelen de andere spelers met de klok mee een kaart." }
          ],
          quiz: [
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
          ]
        },
        {
          id: "bekennen-moet",
          title: "Bekennen moet",
          summary: "Als de gevraagde kleur in je hand zit, moet je een kaart van die kleur spelen.",
          handId: "draw-trumps-001",
          blocks: [
            { type: "paragraph", text: "Als iemand bijvoorbeeld harten vraagt en jij hebt harten, dan moet je harten spelen. Alleen als je die kleur niet hebt, mag je een andere kleur spelen." },
            { type: "callout", text: "De oefening start meteen in het spelen, zodat je beurten, dummy en kleur bekennen in een echt bord ziet." }
          ]
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
    return lessons.map(cloneLesson);
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
      validateLessonChapters(lesson, practiceApi);
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
      renderLessonList({ list, startLesson, labels, dialog });
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
    list.dataset.view = "overview";
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
      const hasDetail = Boolean(lesson.chapters?.length);
      action.className = hasDetail ? "lesson-view" : "lesson-start";
      action.textContent = hasDetail ? (labels.view || "Bekijk les") : (labels.start || "Start oefening");
      action.addEventListener("click", () => {
        if (hasDetail) {
          renderLessonDetail({ list, startLesson, labels, dialog, lessonId: lesson.id });
          return;
        }
        startLessonFromHand({ lesson, handId: lesson.handIds[0], startLesson, dialog });
      });

      card.append(number, heading, challenge, focus);
      if (intro) card.appendChild(intro);
      card.appendChild(action);
      list.appendChild(card);
    });
  }

  function renderLessonDetail({ list, startLesson, labels, dialog, lessonId }) {
    if (!list) return;
    const lesson = lessons.find((candidate) => candidate.id === lessonId);
    if (!lesson) return renderLessonList({ list, startLesson, labels, dialog });

    list.innerHTML = "";
    list.dataset.view = "detail";

    const detail = document.createElement("article");
    detail.className = "lesson-detail";

    const back = backButton(labels.backToLessons || "Alle lessen", () => {
      renderLessonList({ list, startLesson, labels, dialog });
    });

    const header = document.createElement("div");
    header.className = "lesson-detail-header";

    const number = document.createElement("span");
    number.className = "lesson-number";
    number.textContent = String(lesson.number);

    const heading = document.createElement("h3");
    heading.textContent = lesson.title;

    const challenge = document.createElement("p");
    challenge.className = "lesson-challenge";
    challenge.textContent = lesson.challenge;

    const intro = document.createElement("p");
    intro.className = "lesson-intro";
    intro.textContent = lesson.intro || "Werk de hoofdstukken door en start daarna de oefening.";

    const focus = lessonFocusEl(lesson.focus);
    header.append(number, heading, challenge, intro, focus);

    const chapters = document.createElement("div");
    chapters.className = "lesson-chapter-list";
    (lesson.chapters || []).forEach((chapter, index) => {
      const chapterButton = document.createElement("button");
      chapterButton.type = "button";
      chapterButton.className = "lesson-chapter-card";
      chapterButton.addEventListener("click", () => {
        renderLessonChapter({ list, startLesson, labels, dialog, lessonId: lesson.id, chapterId: chapter.id });
      });

      const chapterNumber = document.createElement("span");
      chapterNumber.className = "lesson-chapter-number";
      chapterNumber.textContent = String(index + 1);

      const text = document.createElement("span");
      text.className = "lesson-chapter-text";

      const title = document.createElement("strong");
      title.textContent = chapter.title;

      const summary = document.createElement("span");
      summary.textContent = chapter.summary || "";

      text.append(title, summary);
      chapterButton.append(chapterNumber, text);
      if (chapter.handId) {
        const practice = document.createElement("span");
        practice.className = "lesson-chapter-practice";
        practice.textContent = "Oefening";
        chapterButton.appendChild(practice);
      }
      chapters.appendChild(chapterButton);
    });

    detail.append(back, header, chapters);
    list.appendChild(detail);
    back.focus();
  }

  function renderLessonChapter({ list, startLesson, labels, dialog, lessonId, chapterId }) {
    if (!list) return;
    const lesson = lessons.find((candidate) => candidate.id === lessonId);
    const chapter = lesson?.chapters?.find((candidate) => candidate.id === chapterId);
    if (!lesson || !chapter) return renderLessonDetail({ list, startLesson, labels, dialog, lessonId });

    list.innerHTML = "";
    list.dataset.view = "chapter";

    const detail = document.createElement("article");
    detail.className = "lesson-detail lesson-chapter-detail";

    const back = backButton(labels.backToLesson || "Terug naar les", () => {
      renderLessonDetail({ list, startLesson, labels, dialog, lessonId: lesson.id });
    });

    const heading = document.createElement("h3");
    heading.textContent = chapter.title;

    const summary = document.createElement("p");
    summary.className = "lesson-challenge";
    summary.textContent = chapter.summary || "";

    detail.append(back, heading, summary);
    (chapter.blocks || []).forEach((block) => detail.appendChild(lessonBlockEl(block)));
    if (chapter.quiz?.length) detail.appendChild(miniQuizEl(chapter.quiz));

    if (chapter.handId) {
      const action = document.createElement("button");
      action.type = "button";
      action.className = "lesson-start";
      action.textContent = labels.startPractice || labels.start || "Start oefening";
      action.addEventListener("click", () => {
        startLessonFromHand({ lesson, handId: chapter.handId, startLesson, dialog });
      });
      detail.appendChild(action);
    }

    list.appendChild(detail);
    back.focus();
  }

  function startLessonFromHand({ lesson, handId, startLesson, dialog }) {
    startLesson?.(findLesson(lesson.id), handId);
    closeDialog(dialog);
  }

  function backButton(label, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "lesson-back";
    button.textContent = label;
    button.addEventListener("click", onClick);
    return button;
  }

  function lessonFocusEl(labels) {
    const focus = document.createElement("div");
    focus.className = "lesson-focus";
    labels.forEach((label) => {
      const pill = document.createElement("span");
      pill.className = "lesson-focus-pill";
      pill.textContent = label;
      focus.appendChild(pill);
    });
    return focus;
  }

  function lessonBlockEl(block) {
    if (block.type === "list") {
      const list = document.createElement("ul");
      list.className = "lesson-chapter-points";
      (block.items || []).forEach((text) => {
        const item = document.createElement("li");
        item.textContent = text;
        list.appendChild(item);
      });
      return list;
    }
    const element = document.createElement(block.type === "callout" ? "aside" : "p");
    element.className = block.type === "callout" ? "lesson-chapter-callout" : "lesson-chapter-paragraph";
    element.textContent = block.text || "";
    return element;
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

  function cloneLesson(lesson) {
    return {
      ...lesson,
      focus: [...lesson.focus],
      handIds: [...lesson.handIds],
      chapters: (lesson.chapters || []).map(cloneChapter),
      miniQuiz: lesson.miniQuiz ? cloneQuiz(lesson.miniQuiz) : undefined,
      reviewFeedback: lesson.reviewFeedback ? [...lesson.reviewFeedback] : undefined,
      teachingPoints: lesson.teachingPoints ? [...lesson.teachingPoints] : undefined
    };
  }

  function cloneChapter(chapter) {
    return {
      ...chapter,
      blocks: (chapter.blocks || []).map((block) => ({
        ...block,
        items: block.items ? [...block.items] : undefined
      })),
      quiz: chapter.quiz ? cloneQuiz(chapter.quiz) : undefined
    };
  }

  function cloneQuiz(questions) {
    return questions.map((question) => ({
      ...question,
      options: [...question.options]
    }));
  }

  function validateLessonChapters(lesson, practiceApi) {
    if (!lesson.chapters) return;
    if (!Array.isArray(lesson.chapters)) throw new Error(`Lesson ${lesson.id} chapters must be an array`);
    const ids = new Set();
    for (const chapter of lesson.chapters) {
      if (!chapter.id || ids.has(chapter.id)) throw new Error(`Lesson ${lesson.id} has an invalid chapter id`);
      ids.add(chapter.id);
      if (!chapter.title) throw new Error(`Lesson ${lesson.id} chapter ${chapter.id} is missing a title`);
      if (!chapter.summary) throw new Error(`Lesson ${lesson.id} chapter ${chapter.id} is missing a summary`);
      if (chapter.handId && !practiceApi?.findPracticeHand?.(chapter.handId)) {
        throw new Error(`Lesson ${lesson.id} chapter ${chapter.id} refers to unknown practice hand ${chapter.handId}`);
      }
      if (chapter.quiz) validateQuiz(lesson.id, chapter.id, chapter.quiz);
    }
  }

  function validateQuiz(lessonId, chapterId, questions) {
    if (!Array.isArray(questions) || !questions.length) throw new Error(`Lesson ${lessonId} chapter ${chapterId} has an empty quiz`);
    questions.forEach((question, index) => {
      if (!question.question || !question.answer) throw new Error(`Lesson ${lessonId} chapter ${chapterId} quiz ${index + 1} is incomplete`);
      if (!Array.isArray(question.options) || !question.options.includes(question.answer)) {
        throw new Error(`Lesson ${lessonId} chapter ${chapterId} quiz ${index + 1} is missing the answer option`);
      }
    });
  }

  validateLessons();

  return {
    allLessons,
    findLesson,
    validateLessons,
    init
  };
});

(function initLessonPage(root) {
  "use strict";

  const lessonApi = root.BridgeLessons;
  if (!lessonApi) throw new Error("scripts/learning/lessons.js must load before lesson-page.js");

  const lessons = lessonApi.allLessons();
  const els = {
    heroKicker: document.querySelector("#lesson-page-kicker"),
    heroTitle: document.querySelector("#lesson-page-title"),
    heroCopy: document.querySelector("#lesson-page-copy"),
    routePanel: document.querySelector("#lesson-route-panel"),
    routeCurrent: document.querySelector("#lesson-route-current"),
    list: document.querySelector("#lesson-list"),
    content: document.querySelector("#lesson-content")
  };

  const params = new URLSearchParams(root.location.search || "");
  let selectedLessonId = params.get("lesson") || lessons[0]?.id || "";
  let userToggledRoute = false;

  setupResponsiveRoute();
  render();

  function render() {
    const selectedLesson = lessonApi.findLesson(selectedLessonId) || lessons[0];
    selectedLessonId = selectedLesson?.id || "";
    renderHero(selectedLesson);
    renderLessonRoute(selectedLesson);
    renderLessonContent(selectedLesson);
  }

  function renderHero(lesson) {
    if (!lesson) return;
    if (els.heroKicker) els.heroKicker.textContent = `Les ${lesson.number} - Vijfkaart Hoog`;
    if (els.heroTitle) els.heroTitle.textContent = lesson.title;
    if (els.heroCopy) els.heroCopy.textContent = lesson.challenge;
    if (els.routeCurrent) els.routeCurrent.textContent = `Les ${lesson.number}`;
  }

  function renderLessonRoute(selectedLesson) {
    if (!els.list) return;
    els.list.innerHTML = "";
    lessons.forEach((lesson) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "lesson-route-button";
      if (lesson.id === selectedLesson?.id) button.setAttribute("aria-current", "true");
      button.addEventListener("click", () => {
        selectedLessonId = lesson.id;
        updateUrlLesson(lesson.id);
        render();
        closeMobileRoute();
        els.content?.scrollIntoView({ block: "start" });
      });

      const number = document.createElement("span");
      number.className = "lesson-route-number";
      number.textContent = String(lesson.number);

      const title = document.createElement("span");
      title.className = "lesson-route-title";
      title.textContent = lesson.title;

      button.append(number, title);
      els.list.appendChild(button);
    });
  }

  function renderLessonContent(lesson) {
    if (!els.content || !lesson) return;
    els.content.innerHTML = "";

    const header = document.createElement("header");
    header.className = "lesson-content-head";

    const eyebrow = document.createElement("p");
    eyebrow.className = "lesson-eyebrow";
    eyebrow.textContent = `Les ${lesson.number}`;

    const title = document.createElement("h2");
    title.textContent = "Hoofdstukken";

    const intro = document.createElement("p");
    intro.className = "lesson-intro";
    intro.textContent = "Kies een onderwerp. De uitleg opent pas wanneer je verder klikt.";

    header.append(eyebrow, title, intro);
    els.content.appendChild(header);

    const chapters = document.createElement("div");
    chapters.className = "lesson-chapters";
    const lessonChapters = lesson.chapters?.length ? lesson.chapters : fallbackChapters(lesson);
    lessonChapters.forEach((chapter, index) => chapters.appendChild(chapterEl(lesson, chapter, index, lessonChapters)));
    els.content.appendChild(chapters);
    els.content.appendChild(lessonFinishEl(lesson, lessonChapters));
  }

  function chapterEl(lesson, chapter, index, chapters) {
    const section = document.createElement("section");
    section.className = "lesson-chapter";
    section.id = chapter.id || `hoofdstuk-${index + 1}`;

    const number = document.createElement("span");
    number.className = "lesson-chapter-number";
    number.textContent = String(index + 1);
    number.setAttribute("aria-label", `Stap ${index + 1} van ${chapters.length}`);

    const body = document.createElement("div");
    body.className = "lesson-chapter-body";

    const title = document.createElement("h3");
    title.textContent = chapter.title;

    const summary = document.createElement("p");
    summary.className = "lesson-chapter-paragraph";
    summary.textContent = chapter.summary || "";

    body.append(title, summary);
    const footer = chapterFooterEl(lesson, chapter, index, chapters);
    if (footer) body.appendChild(footer);

    section.append(number, body);
    return section;
  }

  function chapterFooterEl(lesson, chapter, index, chapters) {
    const footer = document.createElement("div");
    footer.className = "lesson-chapter-actions";

    if (chapter.pageHref) {
      footer.appendChild(chapterPageLink(chapter.pageHref, "Open mini-les"));
    }

    if (chapter.handId) {
      footer.appendChild(practiceLink(lesson, chapter.handId, "Oefenen"));
    }

    return footer.childElementCount ? footer : null;
  }

  function chapterPageLink(pageHref, label) {
    const link = document.createElement("a");
    link.className = "lesson-chapter-link";
    const href = new URL(pageHref, root.location.href);
    if (params.has("testHooks")) href.searchParams.set("testHooks", "1");
    link.href = href.pathname.split("/").pop() + href.search;
    link.textContent = label;
    return link;
  }

  function lessonFinishEl(lesson, chapters) {
    const finish = document.createElement("section");
    finish.className = "lesson-finish";

    const title = document.createElement("h3");
    title.textContent = "Aan tafel oefenen";

    const handId = chapters.find((chapter) => chapter.handId)?.handId || lesson.handIds[0];
    finish.append(title, practiceLink(lesson, handId, "Start oefening"));
    return finish;
  }

  function blockEl(block) {
    if (block.type === "list") {
      const list = document.createElement("ul");
      list.className = "lesson-chapter-list";
      (block.items || []).forEach((text) => {
        const item = document.createElement("li");
        item.textContent = text;
        list.appendChild(item);
      });
      return list;
    }

    const element = document.createElement(block.type === "callout" ? "aside" : "p");
    element.className = block.type === "callout" ? "lesson-callout" : "lesson-chapter-paragraph";
    element.textContent = block.text || "";
    return element;
  }

  function quizEl(questions) {
    const wrapper = document.createElement("div");
    wrapper.className = "lesson-quiz";

    questions.forEach((question) => {
      const item = document.createElement("div");
      item.className = "lesson-quiz-question";

      const prompt = document.createElement("p");
      prompt.textContent = question.question;

      const options = document.createElement("div");
      options.className = "lesson-quiz-options";

      const feedback = document.createElement("p");
      feedback.className = "lesson-quiz-feedback";
      feedback.setAttribute("aria-live", "polite");

      question.options.forEach((option) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "lesson-quiz-option";
        button.textContent = option;
        button.addEventListener("click", () => {
          item.querySelectorAll(".lesson-quiz-option").forEach((optionButton) => optionButton.classList.remove("is-correct", "is-missed"));
          const correct = option === question.answer;
          button.classList.add(correct ? "is-correct" : "is-missed");
          feedback.textContent = correct ? question.feedback : `Bijna. Het beste antwoord is: ${question.answer}.`;
        });
        options.appendChild(button);
      });

      item.append(prompt, options, feedback);
      wrapper.appendChild(item);
    });

    return wrapper;
  }

  function practiceLink(lesson, handId, label = "Start oefening") {
    const link = document.createElement("a");
    link.className = "lesson-practice-link";
    const href = new URL("index.html", root.location.href);
    href.searchParams.set("lesson", lesson.id);
    href.searchParams.set("hand", handId);
    if (params.has("testHooks")) href.searchParams.set("testHooks", "1");
    link.href = href.pathname.split("/").pop() + href.search;
    link.textContent = label;
    return link;
  }

  function focusEl(labels) {
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

  function fallbackChapters(lesson) {
    return [
      {
        id: `${lesson.id}-oefening`,
        title: "Oefenen aan de tafel",
        summary: lesson.challenge,
        handId: lesson.handIds[0],
        blocks: [
          { type: "paragraph", text: "Deze les heeft nu nog een compacte oefening. De hoofdstukken worden later net zo uitgebreid als les 1." }
        ]
      }
    ];
  }

  function updateUrlLesson(lessonId) {
    const next = new URL(root.location.href);
    next.searchParams.set("lesson", lessonId);
    root.history.replaceState(null, "", next);
  }

  function setupResponsiveRoute() {
    if (!els.routePanel || !root.matchMedia) return;
    const query = root.matchMedia("(max-width: 820px)");
    const sync = () => {
      if (query.matches) {
        if (!userToggledRoute) els.routePanel.removeAttribute("open");
      } else {
        els.routePanel.setAttribute("open", "");
      }
    };
    els.routePanel.addEventListener("toggle", () => {
      if (query.matches) userToggledRoute = true;
    });
    query.addEventListener?.("change", () => {
      userToggledRoute = false;
      sync();
    });
    sync();
  }

  function closeMobileRoute() {
    if (!els.routePanel || !root.matchMedia?.("(max-width: 820px)").matches) return;
    userToggledRoute = false;
    els.routePanel.removeAttribute("open");
  }
})(typeof globalThis !== "undefined" ? globalThis : this);

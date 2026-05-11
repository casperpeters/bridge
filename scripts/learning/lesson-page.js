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
    title.textContent = lesson.title;

    header.append(eyebrow, title);
    els.content.appendChild(header);

    els.content.appendChild(lessonGoalsEl(lesson));
    els.content.appendChild(lessonStartEl(lesson));
    scrollHashIntoView();
  }

  function lessonGoalsEl(lesson) {
    const summary = document.createElement("section");
    summary.className = "lesson-summary-panel";

    const title = document.createElement("h3");
    title.textContent = "Leerdoelen";

    const goals = document.createElement("ul");
    goals.className = "lesson-goal-list";
    lessonGoals(lesson).forEach((goal) => {
      const item = document.createElement("li");
      item.textContent = goal;
      goals.appendChild(item);
    });

    summary.append(title, goals);
    return summary;
  }

  function chapterPageLink(pageHref, label) {
    const link = document.createElement("a");
    link.className = "lesson-chapter-link";
    const href = new URL(pageHref, root.location.href);
    if (params.has("testHooks")) href.searchParams.set("testHooks", "1");
    link.href = relativeHref(href);
    link.textContent = label;
    return link;
  }

  function lessonStartEl(lesson) {
    const finish = document.createElement("div");
    finish.className = "lesson-finish";

    if (lesson.pageHref) {
      finish.appendChild(chapterPageLink(lesson.pageHref, "Start les"));
      return finish;
    }

    finish.appendChild(practiceLink(lesson, lesson.handIds[0], "Start oefening"));
    return finish;
  }

  function lessonGoals(lesson) {
    if (lesson.learningGoals?.length) return lesson.learningGoals;
    if (lesson.teachingPoints?.length) return lesson.teachingPoints;
    if (lesson.summary) return [lesson.summary];
    return [lesson.challenge];
  }

  function practiceLink(lesson, handId, label = "Start oefening", chapter = null) {
    const link = document.createElement("a");
    link.className = "lesson-practice-link";
    const href = new URL("../index.html", root.location.href);
    href.searchParams.set("lesson", lesson.id);
    href.searchParams.set("hand", handId);
    if (chapter?.id) href.searchParams.set("chapter", chapter.id);
    href.searchParams.set("return", lessonReturnHref(lesson, chapter));
    if (params.has("testHooks")) href.searchParams.set("testHooks", "1");
    link.href = `../${relativeHref(href)}`;
    link.textContent = label;
    return link;
  }

  function lessonReturnHref(lesson, chapter = null) {
    const href = new URL("index.html", root.location.href);
    href.searchParams.set("lesson", lesson.id);
    if (params.has("testHooks")) href.searchParams.set("testHooks", "1");
    if (chapter?.id) href.hash = chapter.id;
    return rootRelativeHref(href);
  }

  function relativeHref(href) {
    return root.BridgeLessonPageHelpers?.relativeHref?.(href) || `${href.pathname.split("/").pop()}${href.search}${href.hash}`;
  }

  function rootRelativeHref(href) {
    return root.BridgeLessonPageHelpers?.rootRelativeHref?.(href) || `${href.pathname.replace(/^\/+/, "")}${href.search}${href.hash}`;
  }

  function updateUrlLesson(lessonId) {
    const next = new URL(root.location.href);
    next.searchParams.set("lesson", lessonId);
    next.hash = "";
    root.history.replaceState(null, "", next);
  }

  function scrollHashIntoView() {
    const id = decodeURIComponent((root.location.hash || "").replace(/^#/, ""));
    if (!id) return;
    window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ block: "start" });
    }, 0);
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

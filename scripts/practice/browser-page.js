(function initPracticeBrowserPage(root) {
  "use strict";

  const practiceHands = root.PracticeHands;
  if (!practiceHands?.getSmb1Course) throw new Error("PracticeHands SMB1 course data must load before browser-page.js");

  const course = practiceHands.getSmb1Course();
  const exercisesByLearningGoal = groupExercisesByLearningGoal(practiceHands.getVisibleInteractiveSmb1Exercises?.() || []);
  const miniExercises = practiceHands.getVisibleMiniEndPositionExercises?.() || [];
  const miniExercisesByLearningGoal = groupExercisesByLearningGoal(miniExercises);
  const els = {
    title: document.querySelector("#practice-title"),
    intro: document.querySelector("[data-practice-intro]"),
    routeLinks: [...document.querySelectorAll("[data-practice-route-link]")],
    route: document.querySelector("[data-practice-route]"),
    count: document.querySelector("[data-practice-count]"),
    lessons: document.querySelector("[data-practice-lessons]"),
    detail: document.querySelector("[data-practice-detail]"),
    detailKicker: document.querySelector("[data-practice-detail-kicker]"),
    detailTitle: document.querySelector("[data-practice-detail-title]"),
    goals: document.querySelector("[data-practice-goals]"),
    back: document.querySelector("[data-practice-back]")
  };
  const routes = new Set(["smb1", "mini"]);
  let selectedRoute = "smb1";
  let selectedLessonId = "";

  applyRouteParams();
  els.back?.addEventListener("click", () => {
    selectedLessonId = "";
    render();
  });
  els.routeLinks.forEach((link) => link.addEventListener("click", onRouteLinkClick));
  root.addEventListener?.("popstate", () => {
    applyRouteParams();
    render({ updateRoute: false });
  });

  render();

  function render(options = {}) {
    const lesson = findLesson(selectedLessonId);
    renderPageHead();
    renderRouteLinks();
    renderLessonList(Boolean(lesson));
    renderLessonDetail(lesson);
    if (els.count) {
      els.count.textContent = routeCountText(lesson);
    }
    if (options.updateRoute !== false) updateRoute();
  }

  function renderLessonList(isDetailOpen) {
    if (!els.lessons) return;
    els.lessons.hidden = isDetailOpen;
    const lessons = selectedRoute === "mini" ? miniRouteLessons() : course.lessons;
    els.lessons.replaceChildren(...lessons.map(renderLessonCard));
  }

  function renderLessonCard(lesson) {
    const link = document.createElement("a");
    link.className = "practice-lesson-card";
    link.href = routeHref(lesson.id, selectedRoute);
    link.dataset.practiceLesson = lesson.id;
    link.dataset.practiceRouteKind = selectedRoute;

    const number = document.createElement("span");
    number.className = "practice-lesson-number";
    number.textContent = `Les ${lesson.number}`;

    const title = document.createElement("h2");
    title.className = "practice-lesson-title";
    title.textContent = lesson.title;

    const meta = document.createElement("p");
    meta.className = "practice-lesson-meta";
    meta.textContent = selectedRoute === "mini"
      ? miniExerciseCountText(countMiniExercisesForLesson(lesson))
      : `${lesson.learningGoals.length} leerdoelen`;

    link.append(number, title, meta);
    link.addEventListener("click", (event) => {
      event.preventDefault();
      selectedLessonId = lesson.id;
      render();
    });
    return link;
  }

  function renderLessonDetail(lesson) {
    if (!els.detail) return;
    els.detail.hidden = !lesson;
    if (!lesson) {
      els.goals?.replaceChildren();
      return;
    }

    if (els.detailKicker) els.detailKicker.textContent = selectedRoute === "mini" ? `Kaartcombinaties - Les ${lesson.number}` : `Les ${lesson.number}`;
    if (els.detailTitle) els.detailTitle.textContent = lesson.title;
    els.goals?.replaceChildren(...learningGoalsForRoute(lesson).map(renderLearningGoal));
  }

  function renderLearningGoal(learningGoal, index) {
    const item = document.createElement("li");
    item.className = "practice-goal-item";
    item.dataset.learningGoalId = learningGoal.id;

    const number = document.createElement("span");
    number.className = "practice-goal-number";
    number.textContent = String(index + 1);

    const body = document.createElement("div");
    body.className = "practice-goal-body";

    const text = document.createElement("p");
    text.className = "practice-goal-text";
    text.textContent = learningGoal.text;

    const status = document.createElement("span");
    status.className = "practice-goal-status";
    const exercises = exercisesForLearningGoal(learningGoal.id);
    status.textContent = exerciseStatusText(exercises.length);
    status.classList.toggle("is-available", exercises.length > 0);

    body.append(text, status);
    if (exercises.length) body.appendChild(renderExerciseList(exercises));
    item.append(number, body);
    return item;
  }

  function renderExerciseList(exercises) {
    const list = document.createElement("div");
    list.className = "practice-exercise-list";
    exercises.forEach((exercise) => list.appendChild(renderExercise(exercise)));
    return list;
  }

  function renderExercise(exercise) {
    const item = document.createElement("div");
    item.className = "practice-exercise-item";
    if (selectedRoute === "mini") item.dataset.miniExercise = exercise.id;
    else item.dataset.interactiveExercise = exercise.id;

    const meta = document.createElement("span");
    meta.className = "practice-exercise-meta";
    meta.textContent = selectedRoute === "mini" ? "Mini-eindpositie" : actionTypeLabel(exercise.actionType);

    const question = document.createElement("p");
    question.className = "practice-exercise-question";
    question.textContent = exercise.question || "Kies de startkaart en voorspel hoeveel slagen Zuid maakt.";

    const start = document.createElement("a");
    start.className = "practice-start-link";
    start.href = selectedRoute === "mini" ? tableHrefForMiniExercise(exercise) : tableHrefForExercise(exercise);
    start.textContent = "Start oefening";

    item.append(meta, question, start);
    return item;
  }

  function applyRouteParams() {
    try {
      const params = new URL(root.location?.href || "").searchParams;
      selectedRoute = routeFromText(params.get("route"));
      const lesson = findLesson(params.get("lesson") || "");
      selectedLessonId = lesson?.id || "";
    } catch {
      selectedRoute = "smb1";
      selectedLessonId = "";
    }
  }

  function updateRoute() {
    if (!root.history?.replaceState || !root.location?.href) return;
    root.history.replaceState(null, "", routeHref(selectedLessonId, selectedRoute));
  }

  function routeHref(lessonId, route = selectedRoute) {
    const url = new URL(root.location?.href || "http://localhost/practice/index.html");
    const params = url.searchParams;
    ["catalog", "exercise", "focus", "level", "miniexercise", "q", "query"].forEach((key) => params.delete(key));
    if (route === "mini") params.set("route", "mini");
    else params.delete("route");
    if (lessonId) params.set("lesson", lessonId);
    else params.delete("lesson");
    return `${url.pathname.split("/").pop() || "index.html"}${params.toString() ? `?${params.toString()}` : ""}${url.hash}`;
  }

  function tableHrefForExercise(exercise) {
    const params = new URLSearchParams();
    params.set("exercise", exercise.id);
    const currentParams = new URLSearchParams(root.location?.search || "");
    if (currentParams.has("testHooks")) params.set("testHooks", "1");
    params.set("return", exerciseReturnHref());
    return `../index.html?${params.toString()}`;
  }

  function tableHrefForMiniExercise(exercise) {
    const params = new URLSearchParams();
    params.set("miniExercise", exercise.id);
    params.set("miniexercise", exercise.id);
    const currentParams = new URLSearchParams(root.location?.search || "");
    if (currentParams.has("testHooks")) params.set("testHooks", "1");
    params.set("return", exerciseReturnHref());
    return `../index.html?${params.toString()}`;
  }

  function exerciseReturnHref() {
    const url = new URL(root.location?.href || "http://localhost/practice/index.html");
    url.searchParams.delete("exercise");
    url.searchParams.delete("miniexercise");
    ["catalog", "focus", "level", "q", "query"].forEach((key) => url.searchParams.delete(key));
    if (selectedRoute === "mini") url.searchParams.set("route", "mini");
    else url.searchParams.delete("route");
    if (selectedLessonId) url.searchParams.set("lesson", selectedLessonId);
    return `practice/${url.pathname.split("/").pop() || "index.html"}${url.search}${url.hash}`;
  }

  function actionTypeLabel(actionType) {
    if (actionType === "bid") return "Bieden";
    if (actionType === "card") return "Kaart kiezen";
    return "Oefening";
  }

  function renderPageHead() {
    if (els.title) els.title.textContent = selectedRoute === "mini" ? "Kaartcombinaties oefenen" : "Start met Bridge 1 oefenen";
    if (els.intro) {
      els.intro.textContent = selectedRoute === "mini"
        ? "Kies een korte eindpositie per lesdoel."
        : "Kies een les en bekijk per leerdoel of er al een tafeloefening klaarstaat.";
    }
  }

  function renderRouteLinks() {
    els.routeLinks.forEach((link) => {
      const route = routeFromText(link.dataset.practiceRouteLink);
      link.href = routeHref("", route);
      const isActive = route === selectedRoute;
      link.classList.toggle("is-active", isActive);
      link.setAttribute("aria-current", isActive ? "page" : "false");
    });
  }

  function onRouteLinkClick(event) {
    event.preventDefault();
    selectedRoute = routeFromText(event.currentTarget?.dataset.practiceRouteLink);
    selectedLessonId = "";
    render();
  }

  function routeCountText(lesson) {
    if (selectedRoute === "mini") {
      const count = lesson ? countMiniExercisesForLesson(lesson) : miniExercises.length;
      return lesson ? `Les ${lesson.number} - ${miniExerciseCountText(count)}` : miniExerciseCountText(count);
    }
    return lesson
      ? `Les ${lesson.number} van ${course.lessons.length} - ${lesson.learningGoals.length} leerdoelen`
      : `${course.lessons.length} lessen`;
  }

  function learningGoalsForRoute(lesson) {
    if (selectedRoute !== "mini") return lesson.learningGoals;
    return lesson.learningGoals.filter((learningGoal) => (miniExercisesByLearningGoal.get(learningGoal.id) || []).length);
  }

  function exercisesForLearningGoal(learningGoalId) {
    return selectedRoute === "mini"
      ? miniExercisesByLearningGoal.get(learningGoalId) || []
      : exercisesByLearningGoal.get(learningGoalId) || [];
  }

  function exerciseStatusText(count) {
    if (selectedRoute === "mini") return miniExerciseCountText(count);
    return count ? `${count} tafeloefening${count === 1 ? "" : "en"}` : "Nog geen tafeloefening";
  }

  function miniRouteLessons() {
    return course.lessons.filter((lesson) => countMiniExercisesForLesson(lesson) > 0);
  }

  function countMiniExercisesForLesson(lesson) {
    return lesson.learningGoals.reduce((sum, learningGoal) => sum + (miniExercisesByLearningGoal.get(learningGoal.id) || []).length, 0);
  }

  function miniExerciseCountText(count) {
    return `${count} kaartcombinatie${count === 1 ? "" : "s"}`;
  }

  function routeFromText(value) {
    const normalized = textValue(value).toLowerCase();
    return routes.has(normalized) ? normalized : "smb1";
  }

  function groupExercisesByLearningGoal(exercises) {
    const grouped = new Map();
    exercises.forEach((exercise) => {
      const learningGoalId = textValue(exercise.learningGoalId);
      if (!learningGoalId) return;
      const list = grouped.get(learningGoalId) || [];
      list.push(exercise);
      grouped.set(learningGoalId, list);
    });
    return grouped;
  }

  function findLesson(ref) {
    const text = textValue(ref);
    if (!text) return null;
    const number = Number(text);
    return course.lessons.find((lesson) => lesson.id === text || lesson.number === number) || null;
  }

  function textValue(value) {
    if (value === null || value === undefined) return "";
    return String(value).trim();
  }
})(typeof globalThis !== "undefined" ? globalThis : this);

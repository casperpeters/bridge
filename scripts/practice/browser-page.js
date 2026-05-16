(function initPracticeBrowserPage(root) {
  "use strict";

  const practiceHands = root.PracticeHands;
  if (!practiceHands?.getSmb1Course) throw new Error("PracticeHands SMB1 course data must load before browser-page.js");

  const course = practiceHands.getSmb1Course();
  const exercisesByLearningGoal = groupExercisesByLearningGoal(practiceHands.getVisibleInteractiveSmb1Exercises?.() || []);
  const els = {
    route: document.querySelector("[data-practice-route]"),
    count: document.querySelector("[data-practice-count]"),
    lessons: document.querySelector("[data-practice-lessons]"),
    detail: document.querySelector("[data-practice-detail]"),
    detailKicker: document.querySelector("[data-practice-detail-kicker]"),
    detailTitle: document.querySelector("[data-practice-detail-title]"),
    goals: document.querySelector("[data-practice-goals]"),
    back: document.querySelector("[data-practice-back]")
  };
  let selectedLessonId = "";

  applyRouteParams();
  els.back?.addEventListener("click", () => {
    selectedLessonId = "";
    render();
  });
  root.addEventListener?.("popstate", () => {
    applyRouteParams();
    render({ updateRoute: false });
  });

  render();

  function render(options = {}) {
    const lesson = findLesson(selectedLessonId);
    renderLessonList(Boolean(lesson));
    renderLessonDetail(lesson);
    if (els.count) {
      els.count.textContent = lesson
        ? `Les ${lesson.number} van ${course.lessons.length} - ${lesson.learningGoals.length} leerdoelen`
        : `${course.lessons.length} lessen`;
    }
    if (options.updateRoute !== false) updateRoute();
  }

  function renderLessonList(isDetailOpen) {
    if (!els.lessons) return;
    els.lessons.hidden = isDetailOpen;
    els.lessons.replaceChildren(...course.lessons.map(renderLessonCard));
  }

  function renderLessonCard(lesson) {
    const link = document.createElement("a");
    link.className = "practice-lesson-card";
    link.href = routeHref(lesson.id);
    link.dataset.practiceLesson = lesson.id;

    const number = document.createElement("span");
    number.className = "practice-lesson-number";
    number.textContent = `Les ${lesson.number}`;

    const title = document.createElement("h2");
    title.className = "practice-lesson-title";
    title.textContent = lesson.title;

    const meta = document.createElement("p");
    meta.className = "practice-lesson-meta";
    meta.textContent = `${lesson.learningGoals.length} leerdoelen`;

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

    if (els.detailKicker) els.detailKicker.textContent = `Les ${lesson.number}`;
    if (els.detailTitle) els.detailTitle.textContent = lesson.title;
    els.goals?.replaceChildren(...lesson.learningGoals.map(renderLearningGoal));
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
    const exercises = exercisesByLearningGoal.get(learningGoal.id) || [];
    status.textContent = exercises.length ? `${exercises.length} tafeloefening${exercises.length === 1 ? "" : "en"}` : "Nog geen tafeloefening";
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
    item.dataset.interactiveExercise = exercise.id;

    const meta = document.createElement("span");
    meta.className = "practice-exercise-meta";
    meta.textContent = actionTypeLabel(exercise.actionType);

    const question = document.createElement("p");
    question.className = "practice-exercise-question";
    question.textContent = exercise.question;

    const start = document.createElement("a");
    start.className = "practice-start-link";
    start.href = tableHrefForExercise(exercise);
    start.textContent = "Start oefening";

    item.append(meta, question, start);
    return item;
  }

  function applyRouteParams() {
    try {
      const params = new URL(root.location?.href || "").searchParams;
      const lesson = findLesson(params.get("lesson") || "");
      selectedLessonId = lesson?.id || "";
    } catch {
      selectedLessonId = "";
    }
  }

  function updateRoute() {
    if (!root.history?.replaceState || !root.location?.href) return;
    root.history.replaceState(null, "", routeHref(selectedLessonId));
  }

  function routeHref(lessonId) {
    const url = new URL(root.location?.href || "http://localhost/practice/index.html");
    const params = url.searchParams;
    ["catalog", "exercise", "focus", "level", "q", "query"].forEach((key) => params.delete(key));
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

  function exerciseReturnHref() {
    const url = new URL(root.location?.href || "http://localhost/practice/index.html");
    url.searchParams.delete("exercise");
    ["catalog", "focus", "level", "q", "query"].forEach((key) => url.searchParams.delete(key));
    if (selectedLessonId) url.searchParams.set("lesson", selectedLessonId);
    return `practice/${url.pathname.split("/").pop() || "index.html"}${url.search}${url.hash}`;
  }

  function actionTypeLabel(actionType) {
    if (actionType === "bid") return "Bieden";
    if (actionType === "card") return "Kaart kiezen";
    return "Oefening";
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

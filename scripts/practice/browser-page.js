(function initPracticeBrowserPage(root) {
  "use strict";

  const practiceHands = root.PracticeHands;
  if (!practiceHands?.createPracticeBrowserModel) throw new Error("PracticeHands catalog browser model must load before browser-page.js");

  const model = practiceHands.createPracticeBrowserModel();
  const els = {
    search: document.querySelector("[data-practice-search]"),
    catalog: document.querySelector("[data-practice-catalog]"),
    focus: document.querySelector("[data-practice-focus]"),
    level: document.querySelector("[data-practice-level]"),
    lessons: document.querySelector("[data-practice-lessons]"),
    count: document.querySelector("[data-practice-count]"),
    list: document.querySelector("[data-practice-list]"),
    empty: document.querySelector("[data-practice-empty]")
  };
  let selectedLesson = "";

  fillSelect(els.catalog, model.facets.catalogs, "Alle catalogi");
  fillSelect(els.focus, model.facets.focus, "Alle types");
  fillSelect(els.level, model.facets.levels, "Alle niveaus");
  applyRouteParams();

  [els.search, els.catalog, els.focus, els.level].forEach((el) => {
    el?.addEventListener("input", render);
    el?.addEventListener("change", render);
  });
  els.catalog?.addEventListener("change", () => {
    if (!isSmb1Selected()) selectedLesson = "";
  });

  render();

  function render() {
    const results = practiceHands.filterPracticeHands(model.hands, currentFilters());
    els.count.textContent = `${results.length} van ${model.hands.length} oefenhanden`;
    els.empty.hidden = results.length > 0;
    renderLessonOverview();
    els.list.replaceChildren(...results.map(renderCard));
    updateRoute();
  }

  function currentFilters() {
    return {
      query: els.search?.value || "",
      catalog: els.catalog?.value || "",
      focus: els.focus?.value || "",
      level: els.level?.value || "",
      lesson: isSmb1Selected() ? selectedLesson : ""
    };
  }

  function renderCard(hand) {
    const card = document.createElement("article");
    card.className = "practice-card";

    const meta = document.createElement("div");
    meta.className = "practice-card-meta";
    meta.append(
      pill(hand.catalog.title),
      ...(hand.lesson ? [pill(`Les ${hand.lesson.number}`)] : []),
      pill(practiceHands.labelFromToken(hand.level || "zonder niveau"), "practice-pill-muted")
    );

    const title = document.createElement("h2");
    title.textContent = hand.title || hand.id;

    const goal = document.createElement("p");
    goal.className = "practice-card-goal";
    goal.textContent = hand.goal || "Oefen deze vaste bridgesituatie.";

    const tags = document.createElement("div");
    tags.className = "practice-tags";
    hand.tags.slice(0, 5).forEach((tag) => tags.appendChild(pill(practiceHands.labelFromToken(tag), "practice-tag")));

    const footer = document.createElement("div");
    footer.className = "practice-card-footer";

    const id = document.createElement("code");
    id.textContent = hand.sourceHandId ? `${hand.id} | bron: ${hand.sourceHandId}` : hand.id;

    const action = document.createElement("a");
    action.className = "practice-start-link";
    action.href = practiceHandTableHref(hand.id, {
      currentHref: root.location?.href || "",
      tableHref: "../index.html"
    });
    action.textContent = "Start hand";

    footer.append(id, action);
    card.append(meta, title, goal, tags, footer);
    return card;
  }

  function renderLessonOverview() {
    if (!els.lessons) return;
    const lessons = isSmb1Selected() ? model.facets.lessonsByCatalog[practiceHands.smb1CatalogId] || [] : [];
    els.lessons.hidden = lessons.length === 0;
    if (!lessons.length) {
      els.lessons.replaceChildren();
      return;
    }

    const all = lessonLink({
      value: "",
      label: "Alle lessen",
      title: "Start met Bridge 1",
      count: model.hands.filter((hand) => hand.catalog.id === practiceHands.smb1CatalogId).length
    });
    els.lessons.replaceChildren(all, ...lessons.map(lessonLink));
  }

  function lessonLink(lesson) {
    const link = document.createElement("a");
    link.className = lesson.value === selectedLesson ? "practice-lesson-link is-active" : "practice-lesson-link";
    link.href = routeHref({ catalog: practiceHands.smb1CatalogId, lesson: lesson.value });
    link.dataset.practiceLesson = lesson.value;
    link.setAttribute("aria-current", lesson.value === selectedLesson ? "true" : "false");
    link.textContent = lesson.title
      ? `${lesson.label}: ${lesson.title} (${lesson.count})`
      : `${lesson.label} (${lesson.count})`;
    link.addEventListener("click", (event) => {
      event.preventDefault();
      if (els.catalog) els.catalog.value = practiceHands.smb1CatalogId;
      selectedLesson = lesson.value;
      render();
    });
    return link;
  }

  function applyRouteParams() {
    try {
      const params = new URL(root.location?.href || "").searchParams;
      setControlValue(els.search, params.get("q") || params.get("query") || "");
      setControlValue(els.catalog, params.get("catalog") || "");
      setControlValue(els.focus, params.get("focus") || "");
      setControlValue(els.level, params.get("level") || "");
      selectedLesson = params.get("lesson") || "";
      if (selectedLesson && els.catalog && !els.catalog.value) els.catalog.value = practiceHands.smb1CatalogId;
      if (!isSmb1Selected()) selectedLesson = "";
    } catch {
      selectedLesson = "";
    }
  }

  function updateRoute() {
    if (!root.history?.replaceState || !root.location?.href) return;
    const href = routeHref({
      catalog: isSmb1Selected() ? practiceHands.smb1CatalogId : "",
      lesson: isSmb1Selected() ? selectedLesson : "",
      query: "",
      focus: "",
      level: ""
    });
    root.history.replaceState(null, "", href);
  }

  function routeHref(filters) {
    const url = new URL(root.location?.href || "http://localhost/practice/index.html");
    const params = url.searchParams;
    setParam(params, "q", filters.query ?? els.search?.value);
    setParam(params, "catalog", filters.catalog ?? els.catalog?.value);
    setParam(params, "focus", filters.focus ?? els.focus?.value);
    setParam(params, "level", filters.level ?? els.level?.value);
    setParam(params, "lesson", filters.lesson ?? selectedLesson);
    return `${url.pathname.split("/").pop() || "index.html"}${params.toString() ? `?${params.toString()}` : ""}${url.hash}`;
  }

  function setParam(params, key, value) {
    const normalized = String(value || "").trim();
    if (normalized) params.set(key, normalized);
    else params.delete(key);
  }

  function setControlValue(control, value) {
    if (control) control.value = value;
  }

  function isSmb1Selected() {
    return els.catalog?.value === practiceHands.smb1CatalogId || els.catalog?.value === practiceHands.smb1CatalogKey;
  }

  function practiceHandTableHref(handId, options = {}) {
    const id = textValue(handId);
    const tableHref = textValue(options.tableHref) || "../index.html";
    const currentHref = textValue(options.currentHref);
    if (!id) return tableHref;

    if (!currentHref) return `${tableHref}?hand=${encodeURIComponent(id)}`;

    try {
      const current = new URL(currentHref);
      const searchParams = new URLSearchParams();
      searchParams.set("hand", id);
      const returnHref = returnHrefFromPracticeUrl(current);
      if (returnHref) searchParams.set("return", returnHref);
      if (current.searchParams.has("testHooks")) searchParams.set("testHooks", current.searchParams.get("testHooks") || "1");
      return `${tableHref}?${searchParams.toString()}`;
    } catch {
      return `${tableHref}?hand=${encodeURIComponent(id)}`;
    }
  }

  function returnHrefFromPracticeUrl(url) {
    const path = url.pathname.replace(/^\/+/, "");
    if (path !== "practice/index.html") return "";
    return `${path}${url.search}${url.hash}`;
  }

  function textValue(value) {
    if (value === null || value === undefined) return "";
    return String(value).trim();
  }

  function fillSelect(select, options, allLabel) {
    if (!select) return;
    select.replaceChildren(option("", allLabel), ...options.map((item) => option(item.value, `${item.label} (${item.count})`)));
  }

  function option(value, label) {
    const el = document.createElement("option");
    el.value = value;
    el.textContent = label;
    return el;
  }

  function pill(text, className = "practice-pill") {
    const span = document.createElement("span");
    span.className = className;
    span.textContent = text;
    return span;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);

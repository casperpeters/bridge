(function initPracticeCatalogModel(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.PracticeCatalogModel = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createPracticeCatalogModel() {
  "use strict";

  const searchableHandFields = [
    "id",
    "title",
    "goal",
    "testGoal",
    "topic",
    "type",
    "lessonId",
    "lessonTitle",
    "lessonNumber",
    "lessonChapterId",
    "lessonChapterTitle",
    "challenge"
  ];
  const searchableArrayFields = ["focus", "reviewFocus", "lessonFocus", "tags"];
  const smb1CatalogId = "start-met-bridge-1";
  const smb1CatalogKey = "startMetBridge1";

  function createPracticeBrowserModel(catalogs = []) {
    const catalogList = normalizeCatalogs(catalogs);
    const hands = catalogList.flatMap((catalog) => catalog.hands.map((hand) => normalizeHand(hand, catalog)));
    return {
      catalogs: catalogList,
      hands,
      facets: createFacets(hands, catalogList)
    };
  }

  function normalizeCatalogs(catalogs = []) {
    return catalogs
      .filter(Boolean)
      .map((catalog) => ({
        id: textValue(catalog.id || catalog.key),
        key: textValue(catalog.key || catalog.id),
        title: textValue(catalog.title || catalog.id || catalog.key),
        description: textValue(catalog.description),
        topic: textValue(catalog.topic),
        type: textValue(catalog.type),
        hands: Array.isArray(catalog.hands) ? catalog.hands : []
      }))
      .filter((catalog) => catalog.id && catalog.hands.length);
  }

  function normalizeHand(hand, catalog) {
    if (isSmb1Catalog(catalog)) validateSmb1HandForBrowser(hand, catalog);

    const focus = listValues(hand?.focus);
    const reviewFocus = listValues(hand?.reviewFocus);
    const typeValues = uniqueStrings([hand?.type, catalog.type, ...focus]);
    const topicValues = uniqueStrings([hand?.topic, catalog.topic]);
    const title = textValue(hand?.title) || textValue(hand?.id);
    const goal = textValue(hand?.goal) || textValue(hand?.testGoal);
    const item = {
      source: hand,
      id: textValue(hand?.id),
      title,
      goal,
      level: textValue(hand?.level),
      sourceHandId: textValue(hand?.sourceHandId),
      focus,
      reviewFocus,
      tags: uniqueStrings([...focus, ...reviewFocus, ...listValues(hand?.tags)]),
      typeValues,
      topicValues,
      lesson: normalizeLesson(hand),
      catalog: {
        id: catalog.id,
        key: catalog.key,
        title: catalog.title,
        description: catalog.description
      }
    };
    item.searchText = createSearchText(item, hand, catalog);
    return item;
  }

  function filterPracticeHands(hands = [], filters = {}) {
    const query = normalizeSearch(filters.query);
    const catalog = textValue(filters.catalog);
    const focus = textValue(filters.focus);
    const level = textValue(filters.level);
    const lesson = textValue(filters.lesson);
    const terms = query ? query.split(/\s+/).filter(Boolean) : [];

    return hands.filter((hand) => {
      if (catalog && hand.catalog.id !== catalog && hand.catalog.key !== catalog) return false;
      if (lesson && !matchesLesson(hand, lesson)) return false;
      if (level && hand.level !== level) return false;
      if (focus && !matchesFocus(hand, focus)) return false;
      if (terms.length && !terms.every((term) => hand.searchText.includes(term))) return false;
      return true;
    });
  }

  function createFacets(hands = [], catalogs = []) {
    return {
      catalogs: catalogs.map((catalog) => ({
        value: catalog.id,
        label: catalog.title,
        count: hands.filter((hand) => hand.catalog.id === catalog.id).length
      })),
      focus: countedOptions(hands.flatMap((hand) => hand.typeValues)),
      levels: countedOptions(hands.map((hand) => hand.level).filter(Boolean)),
      lessonsByCatalog: createLessonsByCatalog(hands, catalogs)
    };
  }

  function createSearchText(item, hand, catalog) {
    const values = [
      catalog.id,
      catalog.key,
      catalog.title,
      catalog.description,
      catalog.topic,
      catalog.type,
      ...searchableHandFields.map((field) => hand?.[field]),
      hand?.lesson?.id,
      hand?.lesson?.title,
      hand?.lesson?.number,
      ...searchableArrayFields.flatMap((field) => listValues(hand?.[field])),
      ...item.topicValues,
      ...item.typeValues
    ];
    return normalizeSearch(values.join(" "));
  }

  function matchesFocus(hand, focus) {
    return hand.typeValues.includes(focus) || hand.tags.includes(focus) || hand.topicValues.includes(focus);
  }

  function matchesLesson(hand, lesson) {
    if (!hand.lesson) return false;
    return (
      hand.lesson.id === lesson ||
      String(hand.lesson.number || "") === lesson ||
      `lesson-${String(hand.lesson.number || "").padStart(2, "0")}` === lesson
    );
  }

  function normalizeLesson(hand) {
    const lesson = hand?.lesson || {};
    const rawNumber = lesson.number ?? hand?.lessonNumber;
    const number = Number(rawNumber);
    if (!Number.isInteger(number)) return null;
    const id = textValue(lesson.id || hand?.lessonId || `lesson-${String(number).padStart(2, "0")}`);
    const title = textValue(lesson.title || hand?.lessonTitle);
    return { id, number, title };
  }

  function createLessonsByCatalog(hands = [], catalogs = []) {
    const result = {};
    catalogs.filter(isSmb1Catalog).forEach((catalog) => {
      const lessonMap = new Map();
      hands
        .filter((hand) => hand.catalog.id === catalog.id && hand.lesson)
        .forEach((hand) => {
          const existing = lessonMap.get(hand.lesson.id);
          if (existing) {
            existing.count += 1;
          } else {
            lessonMap.set(hand.lesson.id, {
              value: hand.lesson.id,
              number: hand.lesson.number,
              label: `Les ${hand.lesson.number}`,
              title: hand.lesson.title,
              count: 1
            });
          }
        });
      result[catalog.id] = [...lessonMap.values()].sort((a, b) => a.number - b.number);
    });
    return result;
  }

  function validateSmb1HandForBrowser(hand, catalog) {
    const id = textValue(hand?.id);
    const lesson = normalizeLesson(hand);
    if (!id) throw new Error(`SMB1 practice hand in ${catalog.id} is missing an id`);
    if (!lesson) throw new Error(`SMB1 practice hand ${id} is missing lesson metadata`);
    if (lesson.number < 1 || lesson.number > 12) throw new Error(`SMB1 practice hand ${id} has invalid lesson number: ${lesson.number}`);
    if (!lesson.title) throw new Error(`SMB1 practice hand ${id} is missing a lesson title`);
    if (!textValue(hand?.goal)) throw new Error(`SMB1 practice hand ${id} is missing a goal`);
  }

  function isSmb1Catalog(catalog) {
    return catalog?.id === smb1CatalogId || catalog?.key === smb1CatalogKey;
  }

  function countedOptions(values) {
    const counts = new Map();
    values.forEach((value) => {
      const normalized = textValue(value);
      if (!normalized) return;
      counts.set(normalized, (counts.get(normalized) || 0) + 1);
    });
    return [...counts.entries()]
      .sort(([a], [b]) => a.localeCompare(b, "nl"))
      .map(([value, count]) => ({ value, label: labelFromToken(value), count }));
  }

  function listValues(value) {
    if (Array.isArray(value)) return value.map(textValue).filter(Boolean);
    const normalized = textValue(value);
    return normalized ? [normalized] : [];
  }

  function uniqueStrings(values) {
    return [...new Set(values.map(textValue).filter(Boolean))];
  }

  function textValue(value) {
    if (value === null || value === undefined) return "";
    return String(value).trim();
  }

  function normalizeSearch(value) {
    return textValue(value)
      .toLocaleLowerCase("nl")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function labelFromToken(value) {
    return textValue(value)
      .replace(/-/g, " ")
      .replace(/\b\w/g, (letter) => letter.toLocaleUpperCase("nl"));
  }

  return {
    createPracticeBrowserModel,
    filterPracticeHands,
    labelFromToken,
    normalizeCatalogs,
    normalizeSearch,
    smb1CatalogId,
    smb1CatalogKey
  };
});

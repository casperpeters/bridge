const { assert, test } = require("./harness.js");
const practiceHands = require("../../practice-hands/index.js");

test("practice catalog browser model lists all catalog hands as flat results", () => {
  const model = practiceHands.createPracticeBrowserModel();

  assert.equal(model.hands.length, practiceHands.allPracticeHands.length);
  assert.deepEqual(model.catalogs.map((catalog) => catalog.key), practiceHands.getPracticeCatalogs().map((catalog) => catalog.key));
  assert.ok(model.hands.every((hand) => hand.catalog.id && hand.title && hand.id));
});

test("practice catalog search matches ids, titles, goals, catalog text and focus fields", () => {
  const model = practiceHands.createPracticeBrowserModel();

  assertIds(practiceHands.filterPracticeHands(model.hands, { query: "draw-trumps-001" }), ["draw-trumps-001"]);
  assert.ok(practiceHands.filterPracticeHands(model.hands, { query: "troef trekken" }).some((hand) => hand.id === "draw-trumps-001"));
  assert.ok(practiceHands.filterPracticeHands(model.hands, { query: "kwetsbare manchebonus" }).some((hand) => hand.id === "game-bonus-vulnerable-001"));
  assert.ok(practiceHands.filterPracticeHands(model.hands, { query: "SA-vervolgen" }).some((hand) => hand.id === "stayman-after-1nt-001"));
});

test("practice catalog filters compose catalog, focus/type and level", () => {
  const model = practiceHands.createPracticeBrowserModel();
  const results = practiceHands.filterPracticeHands(model.hands, {
    catalog: "basicPlayPlan",
    focus: "notrump",
    level: "beginner"
  });

  assert.ok(results.length > 0);
  assert.ok(results.every((hand) => hand.catalog.key === "basicPlayPlan"));
  assert.ok(results.every((hand) => hand.level === "beginner"));
  assert.ok(results.every((hand) => hand.tags.includes("notrump") || hand.typeValues.includes("notrump")));
});

test("practice catalog exposes SMB1 lessons and filters them together with search", () => {
  const model = practiceHands.createPracticeBrowserModel();
  const lessons = model.facets.lessonsByCatalog["start-met-bridge-1"];

  assert.equal(lessons.length, 12);
  assert.deepEqual(lessons.map((lesson) => lesson.number), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  assert.ok(lessons.every((lesson) => lesson.value === `smb1-les${String(lesson.number).padStart(2, "0")}`));

  const lessonSix = practiceHands.filterPracticeHands(model.hands, {
    catalog: "start-met-bridge-1",
    lesson: "smb1-les06"
  });
  assert.equal(lessonSix.length, lessons.find((lesson) => lesson.number === 6).count);
  assert.ok(lessonSix.length > 1);
  assert.ok(lessonSix.every((hand) => hand.catalog.id === "start-met-bridge-1"));
  assert.ok(lessonSix.every((hand) => hand.lesson.number === 6));

  const honneurResults = practiceHands.filterPracticeHands(model.hands, {
    catalog: "start-met-bridge-1",
    lesson: "smb1-les06",
    query: "honneur"
  });
  assert.ok(honneurResults.some((hand) => hand.id === "smb1-les06-honneur-op-honneur"));
  assert.ok(honneurResults.every((hand) => hand.lesson.number === 6));
});

test("practice catalog keeps ordinary catalogs flat and shows SMB1 source metadata", () => {
  const model = practiceHands.createPracticeBrowserModel();
  const basicPlayPlan = practiceHands.filterPracticeHands(model.hands, { catalog: "basicPlayPlan" });
  const reusedSmb1Hand = practiceHands.filterPracticeHands(model.hands, {
    catalog: "start-met-bridge-1",
    lesson: "smb1-les04",
    query: "kleurcontract-plan"
  })[0];

  assert.equal(model.facets.lessonsByCatalog.basicPlayPlan, undefined);
  assert.ok(basicPlayPlan.length > 0);
  assert.ok(basicPlayPlan.every((hand) => hand.lesson === null));
  assert.equal(reusedSmb1Hand.id, "smb1-les04-kleurcontract-plan");
  assert.equal(reusedSmb1Hand.lesson.number, 4);
  assert.equal(reusedSmb1Hand.sourceHandId, "draw-trumps-001");
});

test("practice catalog is tolerant for ordinary catalogs but strict for SMB1 lesson metadata", () => {
  const ordinary = practiceHands.createPracticeBrowserModel([
    {
      id: "loose-technical",
      key: "looseTechnical",
      title: "Losse technische handen",
      hands: [{ id: "sample-technical", focus: "opening" }]
    }
  ]);

  assertIds(practiceHands.filterPracticeHands(ordinary.hands, { focus: "opening" }), ["sample-technical"]);
  assert.equal(ordinary.hands[0].goal, "");
  assert.equal(ordinary.hands[0].lesson, null);

  assert.throws(
    () => practiceHands.createPracticeBrowserModel([
      {
        id: "start-met-bridge-1",
        key: "startMetBridge1",
        title: "Start met Bridge 1",
        hands: [{ id: "smb1-broken", lesson: { number: 4, title: "Kleurcontract" } }]
      }
    ]),
    /missing a goal/
  );
});

test("practice catalog supports future lesson, topic and review metadata without DOM access", () => {
  const model = practiceHands.createPracticeBrowserModel([
    {
      id: "smb1-preview",
      key: "smb1Preview",
      title: "Start met Bridge 1 preview",
      topic: "bieden",
      type: "course",
      hands: [
        {
          id: "sample-review",
          title: "Voorbeeldhand",
          goal: "Een korte missie",
          level: "beginner",
          focus: ["opening"],
          reviewFocus: ["review-check"],
          lessonTitle: "Les 3 Openingen",
          lessonChapterTitle: "Een hoge kleur openen"
        }
      ]
    }
  ]);

  assertIds(practiceHands.filterPracticeHands(model.hands, { query: "hoge kleur" }), ["sample-review"]);
  assertIds(practiceHands.filterPracticeHands(model.hands, { query: "review-check" }), ["sample-review"]);
  assertIds(practiceHands.filterPracticeHands(model.hands, { focus: "course" }), ["sample-review"]);
  assertIds(practiceHands.filterPracticeHands(model.hands, { focus: "opening", level: "beginner" }), ["sample-review"]);
});

function assertIds(results, expected) {
  assert.deepEqual(results.map((hand) => hand.id), expected);
}

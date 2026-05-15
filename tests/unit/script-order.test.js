const path = require("node:path");
const fs = require("node:fs");
const { assert, test } = require("./harness.js");
const scriptManifest = require("../../scripts/script-manifest.js");

const expectedScripts = scriptManifest.pages.index;
const expectedLessonScripts = scriptManifest.pages.lessonIndex;
const expectedPracticeScripts = scriptManifest.pages.practiceBrowser;

test("index.html script order matches the dependency manifest", () => {
  const repoRoot = path.resolve(__dirname, "..", "..");
  const html = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8");
  const actualScripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((match) => match[1]);

  assert.deepEqual(actualScripts, expectedScripts);
  assert.equal(new Set(actualScripts).size, actualScripts.length, "script tags must not be duplicated");

  for (const script of actualScripts) {
    assert.equal(fs.existsSync(path.join(repoRoot, script)), true, `${script} must exist`);
  }
});

test("lessons/index.html script order loads lesson data after practice hands", () => {
  const repoRoot = path.resolve(__dirname, "..", "..");
  const htmlPath = path.join(repoRoot, "lessons", "index.html");
  const html = fs.readFileSync(htmlPath, "utf8");
  const actualScripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((match) => match[1]);

  assert.deepEqual(actualScripts, scriptManifest.withPrefix(expectedLessonScripts, "../"));
  assert.equal(new Set(actualScripts).size, actualScripts.length, "lesson script tags must not be duplicated");

  for (const script of actualScripts) {
    assert.equal(fs.existsSync(path.resolve(path.dirname(htmlPath), script)), true, `${script} must exist`);
  }
});

test("practice/index.html loads practice browser without app bootstrap", () => {
  const repoRoot = path.resolve(__dirname, "..", "..");
  const htmlPath = path.join(repoRoot, "practice", "index.html");
  const html = fs.readFileSync(htmlPath, "utf8");
  const actualScripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((match) => match[1]);

  assert.deepEqual(actualScripts, scriptManifest.withPrefix(expectedPracticeScripts, "../"));
  assert.equal(actualScripts.includes("../scripts/app.js"), false, "practice page must not bootstrap the game table");
  assert.equal(new Set(actualScripts).size, actualScripts.length, "practice script tags must not be duplicated");

  for (const script of actualScripts) {
    assert.equal(fs.existsSync(path.resolve(path.dirname(htmlPath), script)), true, `${script} must exist`);
  }
});

test("lesson 1 standalone page loads shared lesson helpers before its controller", () => {
  const repoRoot = path.resolve(__dirname, "..", "..");
  const htmlPath = path.join(repoRoot, "lessons", "01-cards.html");
  const html = fs.readFileSync(htmlPath, "utf8");
  const actualScripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((match) => match[1]);

  assert.deepEqual(actualScripts, scriptManifest.withPrefix(scriptManifest.pages.standaloneLessons.cards, "../"));

  for (const script of actualScripts) {
    assert.equal(fs.existsSync(path.resolve(path.dirname(htmlPath), script)), true, `${script} must exist`);
  }
});

test("lesson 2 standalone page loads shared helpers and data before its controller", () => {
  const repoRoot = path.resolve(__dirname, "..", "..");
  const htmlPath = path.join(repoRoot, "lessons", "02-card-valuation.html");
  const html = fs.readFileSync(htmlPath, "utf8");
  const actualScripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((match) => match[1]);

  assert.deepEqual(actualScripts, scriptManifest.withPrefix(scriptManifest.pages.standaloneLessons.cardValuation, "../"));

  for (const script of actualScripts) {
    assert.equal(fs.existsSync(path.resolve(path.dirname(htmlPath), script)), true, `${script} must exist`);
  }
});

test("lesson 3 standalone page loads shared helpers and data before its controller", () => {
  const repoRoot = path.resolve(__dirname, "..", "..");
  const htmlPath = path.join(repoRoot, "lessons", "03-openings.html");
  const html = fs.readFileSync(htmlPath, "utf8");
  const actualScripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((match) => match[1]);

  assert.deepEqual(actualScripts, scriptManifest.withPrefix(scriptManifest.pages.standaloneLessons.openings, "../"));

  for (const script of actualScripts) {
    assert.equal(fs.existsSync(path.resolve(path.dirname(htmlPath), script)), true, `${script} must exist`);
  }
});

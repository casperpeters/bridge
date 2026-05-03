const fs = require("node:fs");
const path = require("node:path");
const { assert, test } = require("./harness.js");

const root = path.resolve(__dirname, "..", "..");

function readRepoFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

test("card-play explanations do not expose raw engine reason fallbacks", () => {
  const playFlow = readRepoFile("scripts/play-flow.js");

  assert.doesNotMatch(playFlow, /return\s+result\.reason/);
});

test("play-plan finesse reasons used by AI card suggestions are Dutch", () => {
  const playPlan = readRepoFile("rules/play-plan.js");

  assert.doesNotMatch(playPlan, /Lead low toward/);
  assert.doesNotMatch(playPlan, /notrump double finesse/);
  assert.doesNotMatch(playPlan, /side-suit loser/);
});

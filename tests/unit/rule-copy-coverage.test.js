const fs = require("node:fs");
const path = require("node:path");
const { assert, test } = require("./harness.js");

const repoRoot = path.resolve(__dirname, "..", "..");

function readRepoFile(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function jsFilesUnder(relativePath) {
  const directory = path.join(repoRoot, relativePath);
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    const relativeFilePath = path.join(relativePath, entry.name);
    if (entry.isDirectory()) return jsFilesUnder(relativeFilePath);
    return entry.isFile() && entry.name.endsWith(".js") ? [fullPath] : [];
  });
}

function containsStringLiteral(source, value) {
  return source.includes(`"${value}"`) || source.includes(`'${value}'`) || source.includes("`" + value + "`");
}

function testedRuleIds() {
  const files = [
    ...jsFilesUnder("tests/unit"),
    ...jsFilesUnder("tests/browser")
  ].filter((file) => path.basename(file) !== path.basename(__filename));
  const ids = new Set();
  const patterns = [
    /(?:ruleId|expectedRuleId|expectedRule)\s*:\s*["']([^"']+)["']/g,
    /assert\.(?:equal|notEqual|deepEqual)\([^;\n]*?\.ruleId\s*,\s*["']([^"']+)["']/g,
    /assert\.(?:equal|notEqual|deepEqual)\([^;\n]*?["']([^"']+)["']\s*,\s*[^;\n]*?\.ruleId/g
  ];

  for (const file of files) {
    const source = fs.readFileSync(file, "utf8");
    for (const pattern of patterns) {
      for (const match of source.matchAll(pattern)) {
        ids.add(match[1]);
      }
    }
  }

  return [...ids].filter(isEngineRuleId).sort();
}

const bidExplanationSource = readRepoFile("rules/bidding/systems/five-card-high/explanations-nl.js");
const playFlowCopySource = readRepoFile("scripts/flow/play-flow.js");
const playPlanCopySource = readRepoFile("scripts/render/play-plan.js");
const cardPlayRuleSource = [
  readRepoFile("rules/card-play.js"),
  ...jsFilesUnder("rules/card-play").map((file) => fs.readFileSync(file, "utf8"))
].join("\n");

function isEngineRuleId(ruleId) {
  if (ruleId.startsWith("fiveCardHigh.")) return true;
  if (ruleId.startsWith("playPlan.")) return true;
  return /^[a-z][A-Za-z0-9]+$/.test(ruleId) && containsStringLiteral(cardPlayRuleSource, ruleId);
}

function bidRuleName(ruleId) {
  return ruleId.replace(/^fiveCardHigh\./, "");
}

function playRuleName(ruleId) {
  return ruleId.replace(/^playPlan\./, "");
}

test("tested Vijfkaart Hoog ruleIds have Dutch explanation copy", () => {
  const missing = testedRuleIds()
    .filter((ruleId) => ruleId.startsWith("fiveCardHigh."))
    .filter((ruleId) => !containsStringLiteral(bidExplanationSource, bidRuleName(ruleId)));

  assert.deepEqual(missing, [], `Missing Dutch bidding copy for:\n${missing.join("\n")}`);
});

test("tested card-play ruleIds have Dutch explanation copy", () => {
  const missing = testedRuleIds()
    .filter((ruleId) => !ruleId.startsWith("fiveCardHigh."))
    .filter((ruleId) => {
      const ruleName = playRuleName(ruleId);
      if (ruleId.startsWith("playPlan.")) {
        return !containsStringLiteral(playFlowCopySource, ruleName) && !containsStringLiteral(playPlanCopySource, ruleName);
      }
      return !containsStringLiteral(playFlowCopySource, ruleName);
    });

  assert.deepEqual(missing, [], `Missing Dutch card-play copy for:\n${missing.join("\n")}`);
});

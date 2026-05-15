const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { rules } = require("./harness.js");
const auctionRules = require("../../rules/auction.js");
const fiveCardHighConventions = require("../../rules/bidding/systems/five-card-high/conventions.js");

const repoRoot = path.resolve(__dirname, "..", "..");
const centralExplanationPath = path.join(repoRoot, "rules/bidding/systems/five-card-high/explanations-nl.js");

function filesUnder(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return filesUnder(fullPath);
    return entry.isFile() ? [fullPath] : [];
  });
}

function dutchBidExplanationScriptPaths() {
  const fiveCardHighRoot = path.join(repoRoot, "rules/bidding/systems/five-card-high");
  const familyPaths = filesUnder(fiveCardHighRoot)
    .filter((file) => path.basename(file) === "explanations-nl.js")
    .filter((file) => path.resolve(file) !== centralExplanationPath)
    .sort();
  return [...familyPaths, centralExplanationPath];
}

function loadDutchBidExplanationsForTest() {
  const context = {
    BridgeRulesParts: {
      biddingFiveCardHighConventions: fiveCardHighConventions
    },
    isPass: rules.isPass,
    isDouble: rules.isDouble,
    isRedouble: rules.isRedouble,
    bidEquals: auctionRules.bidEquals,
    cheapestLevelForStrain: auctionRules.cheapestLevelForStrain,
    suitName: (suit) => ({
      C: "klaveren",
      D: "ruiten",
      H: "harten",
      S: "schoppen",
      NT: "sans-atout"
    }[suit] || suit),
    t: (key, args = {}) => args.detail || key
  };
  context.globalThis = context;
  vm.createContext(context);
  for (const scriptPath of dutchBidExplanationScriptPaths()) {
    const source = fs.readFileSync(scriptPath, "utf8");
    vm.runInContext(source, context, { filename: path.relative(repoRoot, scriptPath) });
  }
  return context.FiveCardHighBidExplanationsNl;
}

module.exports = {
  dutchBidExplanationScriptPaths,
  loadDutchBidExplanationsForTest
};

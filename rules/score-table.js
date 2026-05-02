(function initBridgeRulesScoreTable(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const deps = isCommonJs ? { scoring: require("./scoring.js") } : root.BridgeRulesParts || {};
  const api = factory(deps.scoring);
  if (isCommonJs) module.exports = api;
  root.BridgeRulesParts = root.BridgeRulesParts || {};
  root.BridgeRulesParts.scoreTable = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesScoreTable(scoring) {
  "use strict";

  const { calculateBridgeScore, overtrickPoints, downScore } = scoring;

  const contractGroups = [
    { id: "minor", strains: ["C", "D"], sampleStrain: "C" },
    { id: "major", strains: ["H", "S"], sampleStrain: "H" },
    { id: "notrump", strains: ["NT"], sampleStrain: "NT" }
  ];

  function getScoreTableData() {
    return {
      contractRows: contractScoreRows(),
      overtrickRows: overtrickScoreRows(),
      undertrickRows: undertrickPenaltyRows()
    };
  }

  function contractScoreRows() {
    return Array.from({ length: 7 }, (_, index) => {
      const level = index + 1;
      return {
        level,
        groups: contractGroups.map((group) => ({
          id: group.id,
          strains: [...group.strains],
          notVulnerable: exactContractScore(level, group.sampleStrain, false),
          vulnerable: exactContractScore(level, group.sampleStrain, true)
        }))
      };
    });
  }

  function exactContractScore(level, strain, vulnerable) {
    const result = calculateBridgeScore({
      contract: { level, strain },
      declarer: "South",
      tricksMade: level + 6,
      vulnerability: vulnerable ? "NS" : "none"
    });
    return {
      contractScore: result.contractScore,
      bonusScore: result.bonusScore,
      total: result.score
    };
  }

  function overtrickScoreRows() {
    return [
      { id: "minor", strains: ["C", "D"], sampleStrain: "C" },
      { id: "majorNotrump", strains: ["H", "S", "NT"], sampleStrain: "H" }
    ].map((group) => ({
      id: group.id,
      strains: [...group.strains],
      undoubled: String(overtrickPoints({ level: 1, strain: group.sampleStrain }, 1, false, 1)),
      doubled: overtrickRange(group.sampleStrain, 2),
      redoubled: overtrickRange(group.sampleStrain, 4)
    }));
  }

  function overtrickRange(strain, multiplier) {
    const nonVulnerable = overtrickPoints({ level: 1, strain }, 1, false, multiplier);
    const vulnerable = overtrickPoints({ level: 1, strain }, 1, true, multiplier);
    return `${nonVulnerable} / ${vulnerable}`;
  }

  function undertrickPenaltyRows() {
    return [
      { id: "notVulnerable", vulnerable: false },
      { id: "vulnerable", vulnerable: true }
    ].map((row) => ({
      id: row.id,
      vulnerable: row.vulnerable,
      undoubled: String(downScore(1, row.vulnerable, 1)),
      doubled: undertrickPattern(row.vulnerable, 2),
      redoubled: undertrickPattern(row.vulnerable, 4)
    }));
  }

  function undertrickPattern(vulnerable, multiplier) {
    const first = downScore(1, vulnerable, multiplier);
    const second = downScore(2, vulnerable, multiplier);
    const third = downScore(3, vulnerable, multiplier);
    const laterIncrement = downScore(4, vulnerable, multiplier) - third;
    if (vulnerable) return `${first}, daarna +${laterIncrement}`;
    return `${first}, ${second}, ${third}, daarna +${laterIncrement}`;
  }

  return {
    getScoreTableData
  };
});

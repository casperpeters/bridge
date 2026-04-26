(function initBridgeRulesScoring(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const deps = isCommonJs ? { core: require("./core.js") } : root.BridgeRulesParts || {};
  const api = factory(deps.core);
  if (isCommonJs) module.exports = api;
  root.BridgeRulesParts = root.BridgeRulesParts || {};
  root.BridgeRulesParts.scoring = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesScoring(core) {
  "use strict";

  const { teamOf, isTeamVulnerable } = core;

  function contractTrickPoints(contract) {
        if (contract.strain === "C" || contract.strain === "D") return contract.level * 20;
        if (contract.strain === "H" || contract.strain === "S") return contract.level * 30;
        return 40 + (contract.level - 1) * 30;
      }

  function overtrickPoints(contract, overtricks, vulnerable, multiplier) {
        if (!overtricks) return 0;
        if (multiplier === 1) {
          if (contract.strain === "C" || contract.strain === "D") return overtricks * 20;
          return overtricks * 30;
        }
        return overtricks * (vulnerable ? 100 : 50) * multiplier;
      }

  function downScore(undertricks, vulnerable, multiplier) {
        if (!undertricks) return 0;
        if (multiplier === 1) return undertricks * (vulnerable ? 100 : 50);
        let penalty = 0;
        for (let i = 1; i <= undertricks; i++) {
          if (vulnerable) {
            penalty += i === 1 ? 200 : 300;
          } else {
            penalty += i === 1 ? 100 : i <= 3 ? 200 : 300;
          }
        }
        return penalty * (multiplier === 4 ? 2 : 1);
      }

  function calculatePassOutScore() {
        return {
          declarerTeam: null,
          score: 0,
          scoreText: "NS 0 / EW 0",
          vulnerable: false,
          passOut: true,
          passedOut: true,
          needed: 0,
          tricksMade: 0,
          contractMade: true,
          multiplier: 1,
          contractPoints: 0,
          contractScore: 0,
          overtricks: 0,
          undertricks: 0,
          overtrickScore: 0,
          undertrickPenalty: 0,
          gameBonus: 0,
          partscoreBonus: 0,
          slamBonus: 0,
          insultBonus: 0,
          bonusScore: 0
        };
      }

  function calculateBridgeScore({ contract, declarer, tricksMade, vulnerability }) {
      if (!contract) return calculatePassOutScore();

      const declarerTeam = teamOf(declarer);
      const vulnerable = isTeamVulnerable(declarerTeam, vulnerability);
      const needed = contract.level + 6;
      const made = tricksMade >= needed;
      const multiplier = contract.redoubled ? 4 : contract.doubled ? 2 : 1;
      const undertricks = Math.max(0, needed - tricksMade);
      const overtricks = Math.max(0, tricksMade - needed);

      if (!made) {
        const penalty = downScore(undertricks, vulnerable, multiplier);
        return {
          declarerTeam,
          score: -penalty,
          scoreText: `${declarerTeam} -${penalty}`,
          vulnerable,
          needed,
          tricksMade,
          contractMade: false,
          multiplier,
          contractPoints: contractTrickPoints(contract),
          contractScore: 0,
          overtricks,
          undertricks,
          overtrickScore: 0,
          undertrickPenalty: penalty,
          gameBonus: 0,
          partscoreBonus: 0,
          slamBonus: 0,
          insultBonus: 0,
          bonusScore: 0
        };
      }

      const contractPoints = contractTrickPoints(contract);
      const base = contractPoints * multiplier;
      const gameBonus = base >= 100 ? (vulnerable ? 500 : 300) : 0;
      const partscoreBonus = base >= 100 ? 0 : 50;
      const overtrickScore = overtrickPoints(contract, overtricks, vulnerable, multiplier);
      const slamBonus = contract.level === 6 ? (vulnerable ? 750 : 500) : contract.level === 7 ? (vulnerable ? 1500 : 1000) : 0;
      const insultBonus = contract.redoubled ? 100 : contract.doubled ? 50 : 0;
      const bonusScore = gameBonus + partscoreBonus + slamBonus + insultBonus;
      const score = base + bonusScore + overtrickScore;

      return {
        declarerTeam,
        score,
        scoreText: `${declarerTeam} +${score}`,
        vulnerable,
        needed,
        tricksMade,
        contractMade: true,
        multiplier,
        contractPoints,
        contractScore: base,
        overtricks,
        undertricks,
        overtrickScore,
        undertrickPenalty: 0,
        gameBonus,
        partscoreBonus,
        slamBonus,
        insultBonus,
        bonusScore
      };
    }

  return {
    contractTrickPoints,
    overtrickPoints,
    downScore,
    calculatePassOutScore,
    calculateBridgeScore
  };
});

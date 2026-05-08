(function initBasicScoringPracticeHands(root, factory) {
  const hands = factory();
  if (typeof module === "object" && module.exports) module.exports = hands;
  root.PracticeHandCollections = root.PracticeHandCollections || {};
  root.PracticeHandCollections.basicScoring = hands;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBasicScoringPracticeHands() {
  "use strict";

  return [
    {
      id: "game-bonus-vulnerable-001",
      title: "Kwetsbare manchebonus",
      level: "beginner",
      focus: ["scoring", "vulnerability", "game-bonus"],
      systemId: "fiveCardHigh",
      dealer: "South",
      vulnerability: "NS",
      testGoal: "Een kwetsbaar 4 harten-contract precies gemaakt scoort 620 voor Noord/Zuid.",
      hands: {
        North: ["QS", "8S", "JH", "TH", "9H", "2H", "9C", "8C", "7C", "6C", "5C", "3D", "2D"],
        East: ["AC", "KC", "QC", "JC", "TC", "QD", "JD", "TD", "9D", "8D", "6D", "5D", "4D"],
        South: ["AS", "KS", "7S", "AH", "KH", "QH", "5H", "4H", "4C", "3C", "2C", "AD", "7D"],
        West: ["JS", "TS", "9S", "6S", "5S", "4S", "3S", "2S", "8H", "7H", "6H", "3H", "KD"]
      },
      expectedContract: { contract: "4H", declarer: "South" },
      expectedScore: {
        tricksMade: 10,
        score: 620,
        contractPoints: 120,
        gameBonus: 500,
        declarerTeam: "NS"
      },
      explanationKeys: ["score.gameBonus", "score.vulnerability"],
      teachingPoints: [
        "Vier harten is een manche omdat de contractpunten minstens 100 zijn.",
        "Kwetsbaar levert de manchebonus 500 punten op.",
        "120 contractpunten plus 500 bonuspunten geeft samen 620."
      ]
    }
  ];
});

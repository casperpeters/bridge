(function initNotrumpResponsePracticeHands(root, factory) {
  const hands = factory();
  if (typeof module === "object" && module.exports) module.exports = hands;
  root.PracticeHandCollections = root.PracticeHandCollections || {};
  root.PracticeHandCollections.notrumpResponses = hands;
})(typeof globalThis !== "undefined" ? globalThis : this, function createNotrumpResponsePracticeHands() {
  "use strict";

  return [
    {
      id: "stayman-after-1nt-001",
      title: "Stayman na een 1SA-opening",
      level: "beginner",
      focus: ["bidding", "stayman", "notrump"],
      systemId: "fiveCardHigh",
      dealer: "North",
      vulnerability: "none",
      testGoal: "Noord opent 1SA; Zuid vraagt met 2 klaveren naar een vierkaart hoog.",
      hands: {
        North: ["AS", "QS", "8S", "KH", "7H", "4H", "QC", "JC", "9C", "2C", "AD", "8D", "5D"],
        East: ["TS", "9S", "4S", "JH", "9H", "5H", "TC", "7C", "6C", "TD", "9D", "6D", "4D"],
        South: ["KS", "JS", "7S", "5S", "AH", "QH", "8H", "3H", "8C", "5C", "4C", "QD", "7D"],
        West: ["6S", "3S", "2S", "TH", "6H", "2H", "AC", "KC", "3C", "KD", "JD", "3D", "2D"]
      },
      expectedAuction: [
        { seat: "North", bid: "1NT", ruleId: "fiveCardHigh.opening.oneNotrump" },
        { seat: "East", bid: "PASS", ruleId: "fiveCardHigh.pass.competitiveNoAction" },
        { seat: "South", bid: "2C", meaning: "Stayman", ruleId: "fiveCardHigh.response.stayman" }
      ],
      explanationKeys: ["fiveCardHigh.opening.oneNotrump", "fiveCardHigh.response.stayman"],
      teachingPoints: [
        "Na 1SA kun je met 2 klaveren vragen naar een vierkaart harten of schoppen.",
        "Stayman is nuttig als je zelf een vierkaart hoog hebt.",
        "Het doel is onderzoeken of er een 4-4 fit in een hoge kleur is."
      ]
    },
    {
      id: "transfer-to-hearts-001",
      title: "Jacoby-transfer naar harten",
      level: "beginner",
      focus: ["bidding", "transfer", "notrump", "hearts"],
      systemId: "fiveCardHigh",
      dealer: "North",
      vulnerability: "none",
      testGoal: "Noord opent 1SA; Zuid toont met 2 ruiten een vijfkaart harten.",
      hands: {
        North: ["AS", "QS", "8S", "KH", "7H", "4H", "QC", "JC", "9C", "2C", "AD", "8D", "5D"],
        East: ["TS", "7S", "4S", "TH", "9H", "5H", "TC", "7C", "6C", "TD", "9D", "6D", "4D"],
        South: ["9S", "6S", "3S", "AH", "QH", "JH", "8H", "3H", "8C", "5C", "4C", "QD", "7D"],
        West: ["KS", "JS", "5S", "2S", "6H", "2H", "AC", "KC", "3C", "KD", "JD", "3D", "2D"]
      },
      expectedAuction: [
        { seat: "North", bid: "1NT", ruleId: "fiveCardHigh.opening.oneNotrump" },
        { seat: "East", bid: "PASS", ruleId: "fiveCardHigh.pass.competitiveNoAction" },
        { seat: "South", bid: "2D", meaning: "Transfer naar harten", ruleId: "fiveCardHigh.response.transferToH" }
      ],
      explanationKeys: ["fiveCardHigh.opening.oneNotrump", "fiveCardHigh.response.transferToH"],
      teachingPoints: [
        "Na 1SA toont 2 ruiten in dit profiel harten, niet letterlijk ruiten.",
        "De 1SA-openaar kan daarna harten bieden zodat de sterke hand leider wordt.",
        "Dit scenario bewaart het onderscheid tussen contractkleur en conventionele betekenis."
      ]
    },
    {
      id: "transfer-to-spades-001",
      title: "Jacoby-transfer naar schoppen",
      level: "beginner",
      focus: ["bidding", "transfer", "notrump", "spades"],
      systemId: "fiveCardHigh",
      dealer: "North",
      vulnerability: "none",
      testGoal: "Noord opent 1SA; Zuid toont met 2 harten een vijfkaart schoppen.",
      hands: {
        North: ["KS", "7S", "4S", "AH", "QH", "8H", "QC", "JC", "9C", "2C", "AD", "8D", "5D"],
        East: ["TS", "8S", "5S", "TH", "9H", "6H", "TC", "7C", "6C", "TD", "9D", "4D", "3D"],
        South: ["AS", "QS", "JS", "9S", "3S", "7H", "3H", "8C", "5C", "4C", "QD", "7D", "6D"],
        West: ["6S", "2S", "KH", "JH", "5H", "4H", "2H", "AC", "KC", "3C", "KD", "JD", "2D"]
      },
      expectedAuction: [
        { seat: "North", bid: "1NT", ruleId: "fiveCardHigh.opening.oneNotrump" },
        { seat: "East", bid: "PASS", ruleId: "fiveCardHigh.pass.competitiveNoAction" },
        { seat: "South", bid: "2H", meaning: "Transfer naar schoppen", ruleId: "fiveCardHigh.response.transferToS" }
      ],
      explanationKeys: ["fiveCardHigh.opening.oneNotrump", "fiveCardHigh.response.transferToS"],
      teachingPoints: [
        "Na 1SA toont 2 harten in dit profiel schoppen, niet letterlijk harten.",
        "Transfers zijn oefenhanden waard omdat ze beginners helpen kunstmatige biedingen te herkennen.",
        "De oefenhand legt alleen de situatie vast; de biedregel blijft in rules/."
      ]
    }
  ];
});

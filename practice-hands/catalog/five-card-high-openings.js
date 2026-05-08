(function initFiveCardHighOpeningPracticeHands(root, factory) {
  const hands = factory();
  if (typeof module === "object" && module.exports) module.exports = hands;
  root.PracticeHandCollections = root.PracticeHandCollections || {};
  root.PracticeHandCollections.fiveCardHighOpenings = hands;
})(typeof globalThis !== "undefined" ? globalThis : this, function createFiveCardHighOpeningPracticeHands() {
  "use strict";

  return [
    {
      id: "one-nt-opening-001",
      title: "Opening 1SA",
      level: "beginner",
      focus: ["bidding", "opening", "notrump"],
      systemId: "fiveCardHigh",
      dealer: "South",
      vulnerability: "none",
      testGoal: "Zuid heeft een gebalanceerde 15-punts hand en opent 1SA.",
      hands: {
        North: ["9S", "6S", "4S", "KH", "9H", "5H", "QC", "9C", "7C", "4C", "AD", "9D", "6D"],
        East: ["TS", "8S", "3S", "QH", "JH", "8H", "4H", "AC", "8C", "5C", "KD", "TD", "7D"],
        South: ["AS", "KS", "QS", "JS", "2S", "AH", "3H", "2H", "3C", "2C", "JD", "3D", "2D"],
        West: ["7S", "5S", "TH", "7H", "6H", "KC", "JC", "TC", "6C", "QD", "8D", "5D", "4D"]
      },
      expectedAuction: [
        { seat: "South", bid: "1NT", ruleId: "fiveCardHigh.opening.oneNotrump" }
      ],
      explanationKeys: ["fiveCardHigh.opening.oneNotrump"],
      teachingPoints: [
        "Een 1SA-opening toont in dit profiel een gebalanceerde hand met ongeveer 15-17 HCP.",
        "Ook met een vijfkaart hoog kan de engine 1SA kiezen als de hand verder gebalanceerd is."
      ]
    },
    {
      id: "one-heart-opening-001",
      title: "Opening 1 harten met een vijfkaart",
      level: "beginner",
      focus: ["bidding", "opening", "major"],
      systemId: "fiveCardHigh",
      dealer: "South",
      vulnerability: "none",
      testGoal: "Zuid heeft openingskracht en een vijfkaart harten.",
      hands: {
        North: ["KS", "9S", "5S", "QH", "8H", "2H", "KC", "9C", "7C", "5C", "AD", "8D", "5D"],
        East: ["QS", "TS", "6S", "JH", "9H", "7H", "JC", "8C", "6C", "KD", "TD", "6D", "4D"],
        South: ["AS", "2S", "AH", "KH", "5H", "4H", "3H", "QC", "4C", "3C", "2C", "QD", "3D"],
        West: ["JS", "8S", "7S", "4S", "3S", "TH", "6H", "AC", "TC", "JD", "9D", "7D", "2D"]
      },
      expectedAuction: [
        { seat: "South", bid: "1H", ruleId: "fiveCardHigh.opening.oneMajor" }
      ],
      explanationKeys: ["fiveCardHigh.opening.oneMajor"],
      teachingPoints: [
        "Met openingskracht en een vijfkaart hoog open je in de hoge kleur.",
        "De hand is niet gebalanceerd genoeg om de 1SA-route te kiezen."
      ]
    },
    {
      id: "one-spade-opening-001",
      title: "Opening 1 schoppen met een vijfkaart",
      level: "beginner",
      focus: ["bidding", "opening", "major"],
      systemId: "fiveCardHigh",
      dealer: "South",
      vulnerability: "none",
      testGoal: "Zuid heeft openingskracht en een vijfkaart schoppen.",
      hands: {
        North: ["JS", "8S", "5S", "AH", "9H", "5H", "QC", "9C", "7C", "2C", "KD", "9D", "6D"],
        East: ["TS", "7S", "4S", "KH", "JH", "8H", "4H", "AC", "8C", "6C", "JD", "8D", "5D"],
        South: ["AS", "KS", "QS", "3S", "2S", "3H", "2H", "4C", "3C", "AD", "QD", "4D", "3D"],
        West: ["9S", "6S", "QH", "TH", "7H", "6H", "KC", "JC", "TC", "5C", "TD", "7D", "2D"]
      },
      expectedAuction: [
        { seat: "South", bid: "1S", ruleId: "fiveCardHigh.opening.oneMajor" }
      ],
      explanationKeys: ["fiveCardHigh.opening.oneMajor"],
      teachingPoints: [
        "Een vijfkaart schoppen krijgt voorrang als je genoeg kracht hebt om te openen.",
        "De bieding vertelt partner meteen dat schoppen een mogelijke troefkleur is."
      ]
    },
    {
      id: "opening-pass-001",
      title: "Passen met te weinig punten",
      level: "beginner",
      focus: ["bidding", "opening", "pass"],
      systemId: "fiveCardHigh",
      dealer: "South",
      vulnerability: "none",
      testGoal: "Zuid heeft geen openingskracht en past.",
      hands: {
        North: ["AS", "JS", "8S", "AH", "TH", "7H", "AC", "JC", "8C", "6C", "AD", "JD", "8D"],
        East: ["KS", "TS", "7S", "5S", "KH", "JH", "8H", "5H", "KC", "9C", "KD", "TD", "7D"],
        South: ["4S", "3S", "2S", "4H", "3H", "2H", "5C", "4C", "3C", "2C", "4D", "3D", "2D"],
        West: ["QS", "9S", "6S", "QH", "9H", "6H", "QC", "TC", "7C", "QD", "9D", "6D", "5D"]
      },
      expectedAuction: [
        { seat: "South", bid: "PASS", ruleId: "fiveCardHigh.pass.openingNoAction" }
      ],
      explanationKeys: ["fiveCardHigh.pass.openingNoAction"],
      teachingPoints: [
        "Passen is ook een duidelijke actie: je belooft nu geen openingshand.",
        "De app moet beginners laten zien dat niet elke hand geschikt is om te openen."
      ]
    }
  ];
});

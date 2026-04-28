(function initBasicPlayPlanPracticeHands(root, factory) {
  const hands = factory();
  if (typeof module === "object" && module.exports) module.exports = hands;
  root.PracticeHandCollections = root.PracticeHandCollections || {};
  root.PracticeHandCollections.basicPlayPlan = hands;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBasicPlayPlanPracticeHands() {
  "use strict";

  return [
    {
      id: "draw-trumps-001",
      title: "Troef trekken in een schoppencontract",
      level: "beginner",
      focus: ["play", "play-plan", "trump", "draw-trumps"],
      systemId: "fiveCardHigh",
      dealer: "South",
      vulnerability: "none",
      testGoal: "Bij een stabiel 4 schoppen-contract moet het speelplan eerst troef trekken noemen.",
      hands: {
        North: ["JS", "TS", "9S", "8S", "QH", "JH", "5H", "QC", "JC", "5C", "QD", "JD", "5D"],
        East: ["TC", "9C", "8C", "7C", "4C", "3C", "2C", "9D", "8D", "7D", "4D", "3D", "2D"],
        South: ["AS", "KS", "QS", "2S", "AH", "KH", "7H", "AC", "KC", "6C", "AD", "KD", "6D"],
        West: ["7S", "6S", "5S", "4S", "3S", "TH", "9H", "8H", "6H", "4H", "3H", "2H", "TD"]
      },
      expectedContract: { contract: "4S", declarer: "South" },
      expectedPlayPlan: { priorityKind: "drawTrumps", suit: "S" },
      explanationKeys: ["playPlan.drawTrumps"],
      teachingPoints: [
        "In een kleurcontract kijk je eerst of troef trekken veilig is.",
        "Met genoeg troefcontrole voorkomt troef trekken dat de tegenpartij later aftroeft."
      ]
    },
    {
      id: "notrump-develop-long-suit-001",
      title: "Slagen ontwikkelen in sans-atout",
      level: "beginner",
      focus: ["play", "play-plan", "notrump", "develop-long-suit"],
      systemId: "fiveCardHigh",
      dealer: "South",
      vulnerability: "none",
      testGoal: "Bij 3SA moet het speelplan de lange klaverenkleur van dummy ontwikkelen.",
      hands: {
        North: ["7S", "6S", "5S", "AH", "4H", "3H", "KC", "QC", "JC", "4C", "3C", "7D", "6D"],
        East: ["AC", "TC", "9C", "8C", "7C", "6C", "5C", "KD", "QD", "JD", "TD", "9D", "8D"],
        South: ["AS", "KS", "9S", "8S", "7H", "6H", "2H", "2C", "AD", "5D", "4D", "3D", "2D"],
        West: ["QS", "JS", "TS", "4S", "3S", "2S", "KH", "QH", "JH", "TH", "9H", "8H", "5H"]
      },
      expectedContract: { contract: "3NT", declarer: "South" },
      expectedPlayPlan: { priorityKind: "developLongSuit", suit: "C", missingStopper: "A" },
      explanationKeys: ["playPlan.developLongSuit"],
      teachingPoints: [
        "In sans-atout tel je vaste slagen en zoek ik een kleur die extra slagen kan opleveren.",
        "Hier moeten de klaveren worden vrijgespeeld door de aas eruit te werken.",
        "De dummy heeft een entree, dus de ontwikkelde klaveren zijn later bereikbaar."
      ]
    }
  ];
});

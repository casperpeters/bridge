(function initBasicBiddingPracticeHands(root, factory) {
  const hands = factory();
  if (typeof module === "object" && module.exports) module.exports = hands;
  root.PracticeHandCollections = root.PracticeHandCollections || {};
  root.PracticeHandCollections.basicBidding = hands;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBasicBiddingPracticeHands() {
  "use strict";

  return [
    {
      id: "response-new-suit-after-1h-001",
      title: "Nieuwe kleur na partners 1 harten-opening",
      level: "beginner",
      focus: ["bidding", "response", "new-suit", "major-opening"],
      systemId: "fiveCardHigh",
      dealer: "North",
      vulnerability: "none",
      testGoal: "Na 1 harten van partner moet Zuid met genoeg waarden een vierkaart schoppen op éénniveau kunnen bieden.",
      hands: {
        North: ["AS", "4S", "AH", "QH", "JH", "5H", "4H", "KC", "6C", "KD", "7D", "6D", "4D"],
        East: ["TH", "9H", "8H", "7H", "6H", "TC", "9C", "8C", "7C", "TD", "9D", "8D", "5D"],
        South: ["KS", "QS", "3S", "2S", "3H", "2H", "5C", "4C", "3C", "2C", "QD", "3D", "2D"],
        West: ["JS", "TS", "9S", "8S", "7S", "6S", "5S", "KH", "AC", "QC", "JC", "AD", "JD"]
      },
      expectedAuction: [
        { seat: "North", bid: "1H", ruleId: "fiveCardHigh.opening.oneMajor" },
        { seat: "East", bid: "PASS", ruleId: "fiveCardHigh.pass.competitiveNoAction" },
        { seat: "South", bid: "1S", ruleId: "fiveCardHigh.response.newSuit" }
      ],
      explanationKeys: ["fiveCardHigh.opening.oneMajor", "fiveCardHigh.response.newSuit"],
      teachingPoints: [
        "Na partners hoge-kleur opening mag responder met genoeg waarden een nieuwe vierkaart tonen.",
        "Op éénniveau blijft dit rustig en laat het partner meer informatie zien dan direct sans-atout bieden."
      ]
    },
    {
      id: "simple-overcall-001",
      title: "Eenvoudig volgbod met een goede vijfkaart",
      level: "beginner",
      focus: ["bidding", "competitive", "overcall"],
      systemId: "fiveCardHigh",
      dealer: "East",
      vulnerability: "none",
      testGoal: "Na een 1 ruiten-opening van Oost moet Zuid met 8-16 HCP en een goede vijfkaart schoppen 1 schoppen volgen.",
      hands: {
        North: ["8S", "7S", "6S", "QH", "JH", "TH", "9H", "QC", "JC", "TC", "9C", "8C", "7C"],
        East: ["5S", "4S", "4H", "3H", "AD", "KD", "QD", "JD", "4D", "AC", "KC", "6C", "5C"],
        South: ["AS", "QS", "JS", "3S", "2S", "KH", "5D", "2H", "3D", "2D", "4C", "3C", "2C"],
        West: ["KS", "TS", "9S", "AH", "8H", "7H", "6H", "5H", "TD", "9D", "8D", "7D", "6D"]
      },
      expectedAuction: [
        { seat: "East", bid: "1D", ruleId: "fiveCardHigh.opening.oneMinor" },
        { seat: "South", bid: "1S", ruleId: "fiveCardHigh.competitive.simpleOvercall" }
      ],
      explanationKeys: ["fiveCardHigh.opening.oneMinor", "fiveCardHigh.competitive.simpleOvercall"],
      teachingPoints: [
        "Een simpel volgbod toont een goede eigen kleur en beperkte, maar nuttige kracht.",
        "Deze fixture bewaakt dat competitief bieden natuurlijk en klein blijft."
      ]
    },
    {
      id: "negative-double-001",
      title: "Negative double na tussenbieding",
      level: "beginner",
      focus: ["bidding", "competitive", "negative-double"],
      systemId: "fiveCardHigh",
      dealer: "North",
      vulnerability: "none",
      testGoal: "Na 1 klaveren van partner en 1 ruiten tussenbieding moet Zuid met beide vierkaarten hoog een negative double gebruiken.",
      hands: {
        North: ["AS", "7S", "4S", "AH", "7H", "KC", "QC", "JC", "TC", "5C", "8D", "5D", "4D"],
        East: ["8S", "6S", "5S", "QH", "JH", "AD", "KD", "TD", "9D", "7D", "9C", "8C", "7C"],
        South: ["QS", "JS", "3S", "2S", "KH", "4H", "3H", "2H", "4C", "3C", "2C", "3D", "2D"],
        West: ["KS", "TS", "9S", "TH", "9H", "8H", "6H", "5H", "AC", "6C", "QD", "JD", "6D"]
      },
      expectedAuction: [
        { seat: "North", bid: "1C", ruleId: "fiveCardHigh.opening.oneMinor" },
        { seat: "East", bid: "1D", ruleId: "fiveCardHigh.competitive.simpleOvercall" },
        { seat: "South", bid: "DOUBLE", ruleId: "fiveCardHigh.competitive.negativeDouble" }
      ],
      explanationKeys: ["fiveCardHigh.opening.oneMinor", "fiveCardHigh.competitive.negativeDouble"],
      teachingPoints: [
        "Een doublet na partners opening en een tussenbod is hier niet voor straf, maar toont speelbare hoge kleuren.",
        "Deze hand bewaakt dat beginnersconventies als negative double herkenbaar blijven in de engine."
      ]
    }
  ];
});

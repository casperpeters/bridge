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
    },
    {
      id: "takeout-double-response-forced-001",
      title: "Biedplicht na partners informatiedoublet",
      level: "beginner",
      focus: ["bidding", "competitive", "takeout-double", "response", "forced-response"],
      systemId: "fiveCardHigh",
      dealer: "West",
      vulnerability: "none",
      testGoal: "Na 1 klaveren, informatiedoublet van partner en pas van Oost moet Zuid met een zwakke hand de hoogste ongeboden kleur bieden.",
      hands: {
        North: ["AS", "KS", "QS", "4S", "AH", "KH", "6H", "7H", "AD", "KD", "7D", "2C", "3C"],
        East: ["5S", "6S", "7S", "8S", "8H", "9H", "8D", "9D", "TD", "4C", "5C", "6C", "AC"],
        South: ["2S", "3S", "2H", "3H", "4H", "5H", "2D", "3D", "4D", "5D", "6D", "7C", "8C"],
        West: ["JS", "TS", "9S", "QH", "JH", "TH", "QD", "JD", "KC", "QC", "JC", "TC", "9C"]
      },
      expectedAuction: [
        { seat: "West", bid: "1C", ruleId: "fiveCardHigh.opening.oneMinor" },
        { seat: "North", bid: "DOUBLE", ruleId: "fiveCardHigh.competitive.takeoutDouble" },
        { seat: "East", bid: "PASS", ruleId: "fiveCardHigh.pass.competitiveNoAction" },
        { seat: "South", bid: "1H", ruleId: "fiveCardHigh.competitive.takeoutDoubleForcedSuit" }
      ],
      explanationKeys: ["fiveCardHigh.competitive.takeoutDouble", "fiveCardHigh.competitive.takeoutDoubleForcedSuit"],
      teachingPoints: [
        "Na partners informatiedoublet heeft Zuid biedplicht zolang de rechtertegenstander geen contractbod doet.",
        "Met een zwakke hand kiest Zuid de hoogste ongeboden kleur; hier gaat harten boven de langere ruiten."
      ]
    },
    {
      id: "takeout-double-response-notrump-001",
      title: "1SA na partners informatiedoublet",
      level: "beginner",
      focus: ["bidding", "competitive", "takeout-double", "response", "notrump"],
      systemId: "fiveCardHigh",
      dealer: "West",
      vulnerability: "none",
      testGoal: "Na 1 ruiten, informatiedoublet van partner en pas van Oost moet Zuid met 6-9 HCP, SA-verdeling, dekking en geen ongeboden vierkaart 1SA bieden.",
      hands: {
        North: ["AS", "KS", "3S", "5S", "AH", "KH", "4H", "5H", "AC", "QC", "3C", "2D", "6D"],
        East: ["5C", "6C", "7C", "9C", "4D", "8D", "6H", "7H", "8H", "9H", "6S", "7S", "8S"],
        South: ["QS", "4S", "2S", "QH", "3H", "2H", "KD", "7D", "5D", "3D", "JC", "4C", "2C"],
        West: ["JS", "TS", "9S", "JH", "TH", "AD", "QD", "JD", "TD", "9D", "KC", "TC", "8C"]
      },
      expectedAuction: [
        { seat: "West", bid: "1D", ruleId: "fiveCardHigh.opening.oneMinor" },
        { seat: "North", bid: "DOUBLE", ruleId: "fiveCardHigh.competitive.takeoutDouble" },
        { seat: "East", bid: "PASS", ruleId: "fiveCardHigh.pass.competitiveNoAction" },
        { seat: "South", bid: "1NT", ruleId: "fiveCardHigh.competitive.takeoutDoubleOneNotrump" }
      ],
      explanationKeys: ["fiveCardHigh.competitive.takeoutDoubleOneNotrump"],
      teachingPoints: [
        "1SA na partners informatiedoublet belooft hier 6-9 HCP, een SA-verdeling en dekking in de kleur van de tegenpartij.",
        "De app kiest 1SA pas als Zuid geen betere ongeboden vierkaart kan tonen."
      ]
    },
    {
      id: "takeout-double-response-game-001",
      title: "Manche na partners informatiedoublet",
      level: "beginner",
      focus: ["bidding", "competitive", "takeout-double", "response", "game"],
      systemId: "fiveCardHigh",
      dealer: "West",
      vulnerability: "none",
      testGoal: "Na 1 ruiten, informatiedoublet van partner en pas van Oost moet Zuid met 12+ HCP en een vierkaart schoppen direct de manche bieden.",
      hands: {
        North: ["QS", "JS", "4S", "5S", "AH", "JH", "4H", "5H", "AC", "KC", "5C", "4D", "5D"],
        East: ["6C", "7C", "8C", "9C", "6D", "7D", "8D", "9D", "6H", "7H", "8H", "6S", "7S"],
        South: ["AS", "KS", "2S", "3S", "KH", "QH", "2H", "3H", "2D", "3D", "2C", "3C", "4C"],
        West: ["TS", "9S", "8S", "TH", "9H", "AD", "KD", "QD", "JD", "TD", "QC", "JC", "TC"]
      },
      expectedAuction: [
        { seat: "West", bid: "1D", ruleId: "fiveCardHigh.opening.oneMinor" },
        { seat: "North", bid: "DOUBLE", ruleId: "fiveCardHigh.competitive.takeoutDouble" },
        { seat: "East", bid: "PASS", ruleId: "fiveCardHigh.pass.competitiveNoAction" },
        { seat: "South", bid: "4S", ruleId: "fiveCardHigh.competitive.takeoutDoubleGame" }
      ],
      explanationKeys: ["fiveCardHigh.competitive.takeoutDoubleGame"],
      teachingPoints: [
        "Met opening tegenover partners informatiedoublet moet Zuid ervoor zorgen dat de partij de manche bereikt.",
        "Met een vierkaart schoppen kiest de app hier direct 4 schoppen."
      ]
    },
    {
      id: "takeout-double-response-voluntary-001",
      title: "Biedplicht vervalt na bod rechts",
      level: "beginner",
      focus: ["bidding", "competitive", "takeout-double", "response", "voluntary"],
      systemId: "fiveCardHigh",
      dealer: "West",
      vulnerability: "none",
      testGoal: "Na 1 klaveren, informatiedoublet van partner en 1 harten van Oost moet Zuid vrijwillig 1 schoppen kunnen bieden met 6+ HCP en een vierkaart of langer.",
      hands: {
        North: ["AS", "3S", "5S", "6S", "AH", "KH", "2H", "3H", "AD", "QD", "8D", "5D", "5C"],
        East: ["7S", "8S", "9S", "QH", "JH", "TH", "9H", "6H", "6D", "7D", "KC", "6C", "7C"],
        South: ["KS", "QS", "JS", "4S", "2S", "8H", "7H", "2D", "3D", "4D", "2C", "3C", "4C"],
        West: ["8C", "9C", "TC", "JC", "QC", "AC", "9D", "TD", "JD", "KD", "4H", "5H", "TS"]
      },
      expectedAuction: [
        { seat: "West", bid: "1C", ruleId: "fiveCardHigh.opening.ruleOf20OneMinor" },
        { seat: "North", bid: "DOUBLE", ruleId: "fiveCardHigh.competitive.takeoutDouble" },
        { seat: "East", bid: "1H", ruleId: "fiveCardHigh.competitive.newSuit" },
        { seat: "South", bid: "1S", ruleId: "fiveCardHigh.competitive.takeoutDoubleVoluntarySuit" }
      ],
      explanationKeys: ["fiveCardHigh.competitive.takeoutDoubleVoluntarySuit"],
      teachingPoints: [
        "Zodra de rechtertegenstander na het informatiedoublet een contractbod doet, vervalt de biedplicht.",
        "Zuid biedt hier toch vrijwillig 1 schoppen: genoeg punten en een speelbare ongeboden kleur op eenhoogte."
      ]
    }
  ];
});

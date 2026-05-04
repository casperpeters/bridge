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
      id: "short-trump-ruff-001",
      title: "Eerst een introever in de korte troefhand",
      level: "beginner",
      focus: ["play", "play-plan", "trump", "ruff-short-suit"],
      systemId: "fiveCardHigh",
      dealer: "South",
      vulnerability: "none",
      testGoal: "Bij 4 schoppen moet het speelplan de korte harten van dummy gebruiken voordat alle troeven worden getrokken.",
      hands: {
        North: ["JS", "TS", "7S", "6D", "5D", "4D", "3D", "2D", "8C", "7C", "6C", "5C", "4C"],
        East: ["4H", "5H", "6H", "7H", "9H", "QH", "KH", "AH", "2S", "3S", "4S", "5S", "6S"],
        South: ["AS", "KS", "QS", "9S", "8S", "JH", "TH", "8H", "3H", "AD", "KD", "AC", "KC"],
        West: ["2C", "3C", "9C", "TC", "JC", "QC", "7D", "8D", "9D", "TD", "JD", "QD", "2H"]
      },
      expectedContract: { contract: "4S", declarer: "South" },
      expectedPlayPlan: {
        priorityKind: "ruffShortSuit",
        suit: "H",
        shortSeat: "North",
        also: [
          { priorityKind: "drawTrumps", suit: "S", timing: "afterRuff", delayReason: "shortSuitRuff" }
        ]
      },
      explanationKeys: ["playPlan.ruffShortSuit", "playPlan.drawTrumps"],
      teachingPoints: [
        "De NBB-basislijn blijft: trek troef, tenzij een duidelijke introever eerst nodig is.",
        "Dummy heeft minder troeven en geen harten; die troeven zijn nuttig om hartenverliezers te troeven."
      ]
    },
    {
      id: "long-side-suit-ruff-001",
      title: "Lange bijkleur vrijtroeven",
      level: "beginner",
      focus: ["play", "play-plan", "trump", "long-side-suit", "entries"],
      systemId: "fiveCardHigh",
      dealer: "South",
      vulnerability: "none",
      testGoal: "Bij 4 schoppen moet het speelplan de lange hartenkleur vrijtroeven en de ruitenentree bewaren.",
      hands: {
        North: ["JS", "TS", "9S", "2H", "6D", "4D", "3D", "2D", "8C", "7C", "6C", "4C", "3C"],
        East: ["KD", "3H", "4H", "5H", "6H", "7H", "AH", "3S", "4S", "5S", "6S", "7S", "8S"],
        South: ["AS", "KS", "QS", "2S", "KH", "QH", "JH", "TH", "9H", "8H", "AD", "5D", "2C"],
        West: ["5C", "9C", "TC", "JC", "QC", "KC", "AC", "7D", "8D", "9D", "TD", "JD", "QD"]
      },
      expectedContract: { contract: "4S", declarer: "South" },
      expectedPlayPlan: {
        priorityKind: "establishLongSuitByRuffing",
        suit: "H",
        longSeat: "South",
        shortSeat: "North",
        entrySuit: "D",
        entryRank: "A",
        timing: "beforeDrawTrumps",
        also: [
          { priorityKind: "drawTrumps", suit: "S", timing: "afterLongSuitRuff", delayReason: "longSuitRuffDevelopment" }
        ]
      },
      explanationKeys: ["playPlan.ruffOutLongSuit", "playPlan.drawTrumps"],
      teachingPoints: [
        "Soms levert een lange bijkleur extra slagen op als je eerst de tegenpartij leegtroeft in die kleur.",
        "De entree naar Zuid via ruiten aas moet beschikbaar blijven om de vrijgetroefde harten later te bereiken."
      ]
    },
    {
      id: "discard-loser-on-winner-001",
      title: "Verliezer weggooien voordat troef wordt getrokken",
      level: "beginner",
      focus: ["play", "play-plan", "trump", "discard-loser", "attacked-suit"],
      systemId: "fiveCardHigh",
      dealer: "South",
      vulnerability: "none",
      testGoal: "Bij 4 schoppen moet het speelplan op een klaverenaanval eerst een klaverenverliezer op hoge harten weggooien.",
      hands: {
        North: ["TS", "8S", "AH", "KH", "QH", "8D", "6D", "4D", "3D", "2D", "7C", "5C", "2C"],
        East: ["5H", "6H", "7H", "8H", "9H", "TH", "JH", "2S", "3S", "4S", "5S", "6S", "7S"],
        South: ["AS", "KS", "QS", "JS", "9S", "2H", "3H", "KD", "QD", "JD", "AC", "6C", "4C"],
        West: ["JC", "3C", "8C", "9C", "TC", "QC", "KC", "5D", "7D", "9D", "TD", "AD", "4H"]
      },
      expectedContract: { contract: "4S", declarer: "South" },
      expectedPlayPlan: {
        currentTrick: [{ seat: "West", card: "JC" }],
        priorityKind: "discardLoserOnWinner",
        suit: "H",
        attackedSuit: "C",
        discardSeat: "South",
        firstSeat: "North",
        timing: "urgentBeforeTrumps",
        firstPriorityKind: "discardLoserOnWinner",
        also: [
          { priorityKind: "drawTrumps", suit: "S", timing: "afterUrgentDiscard", delayReason: "discardLoserOnWinner" }
        ]
      },
      explanationKeys: ["playPlan.discardLoserOnWinner", "playPlan.drawTrumps"],
      teachingPoints: [
        "Als de verdediging een stopper aanvalt, kan een directe weggooi belangrijker zijn dan meteen troef trekken.",
        "De hoge harten van dummy geven Zuid tijd om een klaverenverliezer kwijt te raken."
      ]
    },
    {
      id: "cross-ruff-001",
      title: "Cross ruff in een schoppencontract",
      level: "beginner",
      focus: ["play", "play-plan", "trump", "cross-ruff"],
      systemId: "fiveCardHigh",
      dealer: "North",
      vulnerability: "none",
      testGoal: "Bij 4 schoppen moet het speelplan niet meteen troef trekken, maar harten in Zuid en ruiten in Noord troeven.",
      hands: {
        North: ["AS", "JS", "TS", "8S", "AH", "8H", "6H", "4H", "2H", "3D", "AC", "7C", "6C"],
        East: ["4S", "3S", "2S", "KH", "TH", "5H", "9D", "8D", "7D", "6D", "TC", "4C", "2C"],
        South: ["KS", "QS", "9S", "7S", "3H", "AD", "5D", "4D", "2D", "9C", "8C", "5C", "3C"],
        West: ["6S", "5S", "QH", "JH", "9H", "7H", "KD", "QD", "JD", "TD", "KC", "QC", "JC"]
      },
      expectedContract: { contract: "4S", declarer: "South" },
      expectedPlayPlan: {
        currentTrick: [{ seat: "West", card: "QH" }],
        priorityKind: "crossRuff",
        suit: "D",
        firstPriorityKind: "crossRuff",
        also: [
          { priorityKind: "drawTrumps", suit: "S", timing: "afterCrossRuff", delayReason: "crossRuff" }
        ]
      },
      explanationKeys: ["playPlan.crossRuff", "playPlan.drawTrumps"],
      teachingPoints: [
        "Bij een cross ruff trek je niet meteen troef, omdat beide handen troeven nodig hebben.",
        "Cash kwetsbare hoge zijkleurkaarten eerst en troef daarna om-en-om in de korte hand."
      ]
    },
    {
      id: "pre-trump-finesse-discard-001",
      title: "Ruitensnit voordat troef wordt getrokken",
      level: "beginner",
      focus: ["play", "play-plan", "trump", "finesse", "discard-loser"],
      systemId: "fiveCardHigh",
      dealer: "South",
      vulnerability: "none",
      testGoal: "Na de hartenuitkomst moet Zuid direct ruiten vrouw spelen voor een mogelijke hartenafgooi voordat troef wordt getrokken.",
      hands: {
        North: ["QS", "JS", "7S", "5S", "9H", "4H", "3H", "AD", "JD", "TD", "JC", "7C", "2C"],
        East: ["4S", "2S", "8H", "7H", "6H", "5D", "4D", "3D", "2D", "8C", "6C", "5C", "3C"],
        South: ["KS", "TS", "9S", "6S", "3S", "AH", "5H", "2H", "QD", "7D", "KC", "QC", "4C"],
        West: ["AS", "8S", "KH", "QH", "JH", "TH", "KD", "9D", "8D", "6D", "AC", "TC", "9C"]
      },
      expectedContract: { contract: "4S", declarer: "South" },
      expectedPlayPlan: {
        trickHistory: [{
          number: 1,
          winner: "South",
          cards: [
            { seat: "West", card: "KH" },
            { seat: "North", card: "3H" },
            { seat: "East", card: "6H" },
            { seat: "South", card: "AH" }
          ]
        }],
        priorityKind: "establishSideSuitForDiscard",
        suit: "D",
        discardSuit: "H",
        leadSeat: "South",
        sourceSeat: "North",
        leadRank: "Q",
        missingStopper: "K",
        timing: "beforeDrawTrumps",
        firstPriorityKind: "establishSideSuitForDiscard",
        also: [
          { priorityKind: "drawTrumps", suit: "S", timing: "afterDevelopedDiscard", delayReason: "establishSideSuitForDiscard" }
        ]
      },
      explanationKeys: ["playPlan.establishSideSuitForDiscard", "playPlan.drawTrumps"],
      teachingPoints: [
        "Soms moet een kans in een zijkleur meteen genomen worden voordat troef wordt getrokken.",
        "Als de ruitensnit goed zit, kan later een hartenverliezer op de derde ruiten van Noord weg."
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
    },
    {
      id: "notrump-unblock-long-suit-001",
      title: "Deblokkeren voordat je naar dummy gaat",
      level: "beginner",
      focus: ["play", "play-plan", "notrump", "unblock", "entries"],
      systemId: "fiveCardHigh",
      dealer: "South",
      vulnerability: "none",
      testGoal: "Bij 3SA moet Zuid eerst klaveren aas cashen om dummy's lange klaverenkleur niet te blokkeren.",
      hands: {
        North: ["9S", "8S", "4S", "3S", "KC", "QC", "JC", "4C", "3C", "2C", "AD", "7D", "6D"],
        East: ["KS", "QS", "2S", "JH", "TH", "9H", "8H", "7H", "TC", "9C", "5C", "8D", "5D"],
        South: ["AS", "7S", "6S", "5S", "AH", "KH", "QH", "5H", "4H", "AC", "4D", "3D", "2D"],
        West: ["JS", "TS", "6H", "3H", "2H", "9D", "TD", "JD", "QD", "KD", "8C", "7C", "6C"]
      },
      expectedContract: { contract: "3NT", declarer: "South" },
      expectedPlayPlan: {
        priorityKind: "cashWinners",
        suit: "C",
        timing: "unblockBeforeEntry",
        entrySuit: "D",
        entryRank: "A"
      },
      explanationKeys: ["playPlan.cashWinners"],
      teachingPoints: [
        "Als dummy een lange kleur heeft maar Zuid het aas sec/hoog houdt, kan die kleur blokkeren.",
        "Cash eerst klaveren aas en gebruik daarna de ruitenentree om dummy's klaveren te maken."
      ]
    }
  ];
});

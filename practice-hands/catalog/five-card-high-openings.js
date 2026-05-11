(function initFiveCardHighOpeningPracticeHands(root, factory) {
  const hands = factory();
  if (typeof module === "object" && module.exports) module.exports = hands;
  root.PracticeHandCollections = root.PracticeHandCollections || {};
  root.PracticeHandCollections.fiveCardHighOpenings = hands;
})(typeof globalThis !== "undefined" ? globalThis : this, function createFiveCardHighOpeningPracticeHands() {
  "use strict";

  function dealFromSouth(southText) {
    const south = String(southText || "").trim().split(/\s+/).filter(Boolean).map(normalizeCardId);
    const southCards = new Set(south);
    const deck = [];
    ["S", "H", "D", "C"].forEach((suit) => {
      ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"].forEach((rank) => {
        deck.push(`${rank}${suit}`);
      });
    });
    const remaining = deck.filter((card) => !southCards.has(card));
    const hands = { North: [], East: [], South: south, West: [] };
    remaining.forEach((card, index) => {
      hands[["North", "East", "West"][index % 3]].push(card);
    });
    return hands;
  }

  function normalizeCardId(cardId) {
    return String(cardId || "").trim().toUpperCase().replace(/^10/, "T");
  }

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
    },
    {
      id: "lesson-03-one-nt-balanced-001",
      title: "Les 3 - 1SA met 16 HCP",
      level: "beginner",
      focus: ["bidding", "opening", "lesson-03", "notrump"],
      systemId: "fiveCardHigh",
      dealer: "South",
      vulnerability: "none",
      testGoal: "Zuid heeft 16 HCP en een evenwichtige verdeling: open 1SA.",
      hands: dealFromSouth("AS QS 8S 3S KH JH 4H AD TD 6D QC 9C 2C"),
      expectedAuction: [
        { seat: "South", bid: "1NT", ruleId: "fiveCardHigh.opening.oneNotrump" }
      ],
      explanationKeys: ["fiveCardHigh.opening.oneNotrump"],
      teachingPoints: [
        "Wel 1SA, want Zuid heeft 15-17 HCP en een evenwichtige verdeling.",
        "Niet eerst een kleur zoeken: de 1SA-opening is hier preciezer."
      ]
    },
    {
      id: "lesson-03-one-nt-balanced-002",
      title: "Les 3 - 1SA met 17 HCP",
      level: "beginner",
      focus: ["bidding", "opening", "lesson-03", "notrump"],
      systemId: "fiveCardHigh",
      dealer: "South",
      vulnerability: "none",
      testGoal: "Zuid heeft 17 HCP en een evenwichtige verdeling: open 1SA.",
      hands: dealFromSouth("KS JS 5S AH QH 6H KD 8D 3D AC 7C 4C 2C"),
      expectedAuction: [
        { seat: "South", bid: "1NT", ruleId: "fiveCardHigh.opening.oneNotrump" }
      ],
      explanationKeys: ["fiveCardHigh.opening.oneNotrump"],
      teachingPoints: [
        "Wel 1SA, want 17 HCP zit nog in de 15-17 range.",
        "De verdeling is evenwichtig, dus sans-atout past bij de hand."
      ]
    },
    {
      id: "lesson-03-one-nt-five-heart-001",
      title: "Les 3 - 1SA ondanks vijf harten",
      level: "beginner",
      focus: ["bidding", "opening", "lesson-03", "notrump", "major"],
      systemId: "fiveCardHigh",
      dealer: "South",
      vulnerability: "none",
      testGoal: "Zuid heeft 17 HCP, 5-3-3-2 en een vijfkaart harten: de app opent 1SA.",
      hands: dealFromSouth("AS 8S 4S AH KH JH 7H 3H KD 6D 2D QC 5C"),
      expectedAuction: [
        { seat: "South", bid: "1NT", ruleId: "fiveCardHigh.opening.oneNotrump" }
      ],
      explanationKeys: ["fiveCardHigh.opening.oneNotrump"],
      teachingPoints: [
        "Niet 1 harten, want deze 15-17 HCP hand is evenwichtig.",
        "In dit profiel gaat 1SA voor bij 15-17 HCP en een 5-3-3-2 verdeling."
      ]
    },
    {
      id: "lesson-03-one-heart-opening-001",
      title: "Les 3 - 1 harten met vijfkaart",
      level: "beginner",
      focus: ["bidding", "opening", "lesson-03", "major"],
      systemId: "fiveCardHigh",
      dealer: "South",
      vulnerability: "none",
      testGoal: "Zuid heeft openingskracht en een vijfkaart harten: open 1 harten.",
      hands: dealFromSouth("AS 9S KH QH JH 8H 4H AD 7D 3D 9C 6C 2C"),
      expectedAuction: [
        { seat: "South", bid: "1H", ruleId: "fiveCardHigh.opening.oneMajor" }
      ],
      explanationKeys: ["fiveCardHigh.opening.oneMajor"],
      teachingPoints: [
        "Wel 1 harten, want je hebt openingskracht en minimaal vijf harten.",
        "Niet 1SA, want de hand heeft geen 15-17 HCP in de 1SA-range."
      ]
    },
    {
      id: "lesson-03-one-heart-six-card-001",
      title: "Les 3 - 1 harten met zeskaart",
      level: "beginner",
      focus: ["bidding", "opening", "lesson-03", "major", "one-suit"],
      systemId: "fiveCardHigh",
      dealer: "South",
      vulnerability: "none",
      testGoal: "Zuid heeft openingskracht en een zeskaart harten: open 1 harten.",
      hands: dealFromSouth("8S 3S AH QH JH 9H 6H 4H KD 7D 2D QC 5C"),
      expectedAuction: [
        { seat: "South", bid: "1H", ruleId: "fiveCardHigh.opening.oneMajor" }
      ],
      explanationKeys: ["fiveCardHigh.opening.oneMajor"],
      teachingPoints: [
        "Wel 1 harten, want een zeskaart is zeker lang genoeg voor Vijfkaart-Hoog.",
        "Dit is een eenkleurenspel met openingskracht, geen zwakke twee."
      ]
    },
    {
      id: "lesson-03-one-spade-opening-001",
      title: "Les 3 - 1 schoppen met vijfkaart",
      level: "beginner",
      focus: ["bidding", "opening", "lesson-03", "major"],
      systemId: "fiveCardHigh",
      dealer: "South",
      vulnerability: "none",
      testGoal: "Zuid heeft openingskracht en een vijfkaart schoppen: open 1 schoppen.",
      hands: dealFromSouth("AS KS QS 8S 4S AH 7H 5D 3D JC 8C 6C 2C"),
      expectedAuction: [
        { seat: "South", bid: "1S", ruleId: "fiveCardHigh.opening.oneMajor" }
      ],
      explanationKeys: ["fiveCardHigh.opening.oneMajor"],
      teachingPoints: [
        "Wel 1 schoppen, want je hebt openingskracht en een vijfkaart schoppen.",
        "Schoppen is een hoge kleur; een hoge-kleurfit is later vaak waardevol."
      ]
    },
    {
      id: "lesson-03-one-spade-six-card-001",
      title: "Les 3 - 1 schoppen met zeskaart",
      level: "beginner",
      focus: ["bidding", "opening", "lesson-03", "major", "one-suit"],
      systemId: "fiveCardHigh",
      dealer: "South",
      vulnerability: "none",
      testGoal: "Zuid heeft openingskracht en een zeskaart schoppen: open 1 schoppen.",
      hands: dealFromSouth("KS QS JS 9S 7S 3S AH 8H QD 6D 2D 9C 5C"),
      expectedAuction: [
        { seat: "South", bid: "1S", ruleId: "fiveCardHigh.opening.oneMajor" }
      ],
      explanationKeys: ["fiveCardHigh.opening.oneMajor"],
      teachingPoints: [
        "Wel 1 schoppen, want deze zeskaart en 12 HCP geven openingskracht.",
        "Niet zwakke twee, want met normale openingskracht open je op eenniveau."
      ]
    },
    {
      id: "lesson-03-two-five-majors-001",
      title: "Les 3 - twee vijfkaarten hoog",
      level: "beginner",
      focus: ["bidding", "opening", "lesson-03", "major", "two-suit"],
      systemId: "fiveCardHigh",
      dealer: "South",
      vulnerability: "none",
      testGoal: "Zuid heeft twee vijfkaarten hoog en opent de hoogste: 1 schoppen.",
      hands: dealFromSouth("AS QS 9S 5S 2S AH KH 8H 6H 4H 7D 3D 6C"),
      expectedAuction: [
        { seat: "South", bid: "1S", ruleId: "fiveCardHigh.opening.oneMajor" }
      ],
      explanationKeys: ["fiveCardHigh.opening.oneMajor"],
      teachingPoints: [
        "Wel 1 schoppen, want met twee vijfkaarten open je de hoogste kleur.",
        "Dit is een tweekleurenspel: later kun je harten nog tonen."
      ]
    },
    {
      id: "lesson-03-one-club-short-001",
      title: "Les 3 - 1 klaveren als vangnet",
      level: "beginner",
      focus: ["bidding", "opening", "lesson-03", "minor"],
      systemId: "fiveCardHigh",
      dealer: "South",
      vulnerability: "none",
      testGoal: "Zuid heeft geen vijfkaart hoog en geen 1SA-hand: open 1 klaveren als vangnet.",
      hands: dealFromSouth("AS QS 8S 4S KH JH 7H 3H KD 8D 2D 9C 5C"),
      expectedAuction: [
        { seat: "South", bid: "1C", ruleId: "fiveCardHigh.opening.oneMinor" }
      ],
      explanationKeys: ["fiveCardHigh.opening.oneMinor"],
      teachingPoints: [
        "Wel 1 klaveren, want er is geen vijfkaart hoog en geen 1SA-hand.",
        "1 klaveren kan kort zijn: hier is het de vangnetopening."
      ]
    },
    {
      id: "lesson-03-one-club-long-001",
      title: "Les 3 - 1 klaveren met lengte",
      level: "beginner",
      focus: ["bidding", "opening", "lesson-03", "minor"],
      systemId: "fiveCardHigh",
      dealer: "South",
      vulnerability: "none",
      testGoal: "Zuid heeft een lange klaverenkleur en opent 1 klaveren.",
      hands: dealFromSouth("AS 7S 3S KH 9H AD 8D AC QC 9C 7C 4C 2C"),
      expectedAuction: [
        { seat: "South", bid: "1C", ruleId: "fiveCardHigh.opening.oneMinor" }
      ],
      explanationKeys: ["fiveCardHigh.opening.oneMinor"],
      teachingPoints: [
        "Wel 1 klaveren, want klaveren is de langste kleur.",
        "Niet 1SA, want deze hand is niet evenwichtig."
      ]
    },
    {
      id: "lesson-03-one-diamond-four-001",
      title: "Les 3 - 1 ruiten met vierkaart",
      level: "beginner",
      focus: ["bidding", "opening", "lesson-03", "minor"],
      systemId: "fiveCardHigh",
      dealer: "South",
      vulnerability: "none",
      testGoal: "Zuid heeft geen vijfkaart hoog, geen 1SA-hand en vier ruiten: open 1 ruiten.",
      hands: dealFromSouth("AS KS 8S QH 7H 4H AD JD 8D 2D 9C 7C 3C"),
      expectedAuction: [
        { seat: "South", bid: "1D", ruleId: "fiveCardHigh.opening.oneMinor" }
      ],
      explanationKeys: ["fiveCardHigh.opening.oneMinor"],
      teachingPoints: [
        "Wel 1 ruiten, want ruiten is de passende lage kleur.",
        "Niet 1 harten of 1 schoppen, want Vijfkaart-Hoog vraagt minimaal vijf kaarten."
      ]
    },
    {
      id: "lesson-03-one-diamond-long-001",
      title: "Les 3 - 1 ruiten met lange ruiten",
      level: "beginner",
      focus: ["bidding", "opening", "lesson-03", "minor"],
      systemId: "fiveCardHigh",
      dealer: "South",
      vulnerability: "none",
      testGoal: "Zuid heeft een lange ruitenkleur en opent 1 ruiten.",
      hands: dealFromSouth("8S 4S AH 7H AD KD QD 9D 6D 3D QC 8C 2C"),
      expectedAuction: [
        { seat: "South", bid: "1D", ruleId: "fiveCardHigh.opening.oneMinor" }
      ],
      explanationKeys: ["fiveCardHigh.opening.oneMinor"],
      teachingPoints: [
        "Wel 1 ruiten, want ruiten is duidelijk de langste kleur.",
        "Niet 1SA, want deze hand is niet evenwichtig."
      ]
    },
    {
      id: "lesson-03-pass-low-balanced-001",
      title: "Les 3 - passen met 6 HCP",
      level: "beginner",
      focus: ["bidding", "opening", "lesson-03", "pass"],
      systemId: "fiveCardHigh",
      dealer: "South",
      vulnerability: "none",
      testGoal: "Zuid heeft 6 HCP en geen sterke verdeling: pas.",
      hands: dealFromSouth("KS 8S 5S QH 7H 4H JD 9D 6D 8C 5C 3C 2C"),
      expectedAuction: [
        { seat: "South", bid: "PASS", ruleId: "fiveCardHigh.pass.openingNoAction" }
      ],
      explanationKeys: ["fiveCardHigh.pass.openingNoAction"],
      teachingPoints: [
        "Pas, want 6 HCP zonder sterke verdeling is te weinig.",
        "Een opening belooft dat je hand sterk genoeg is om het bieden te beginnen."
      ]
    },
    {
      id: "lesson-03-pass-nine-flat-001",
      title: "Les 3 - passen met 9 HCP",
      level: "beginner",
      focus: ["bidding", "opening", "lesson-03", "pass"],
      systemId: "fiveCardHigh",
      dealer: "South",
      vulnerability: "none",
      testGoal: "Zuid heeft 9 HCP zonder sterke verdeling: pas.",
      hands: dealFromSouth("AS 7S 5S 3S KH 8H 6H 4H QD 7D 2D 9C 5C"),
      expectedAuction: [
        { seat: "South", bid: "PASS", ruleId: "fiveCardHigh.pass.openingNoAction" }
      ],
      explanationKeys: ["fiveCardHigh.pass.openingNoAction"],
      teachingPoints: [
        "Pas, want 9 HCP is nog geen openingskracht.",
        "Niet 1 harten of 1 schoppen, want er is geen vijfkaart hoog."
      ]
    },
    {
      id: "lesson-03-pass-poor-six-spades-001",
      title: "Les 3 - geen zwakke twee met slechte kleur",
      level: "beginner",
      focus: ["bidding", "opening", "lesson-03", "pass", "weak-two"],
      systemId: "fiveCardHigh",
      dealer: "South",
      vulnerability: "none",
      testGoal: "Zuid heeft een zeskaart schoppen, maar de kleur is te zwak voor zwakke twee: pas.",
      hands: dealFromSouth("KS 8S 7S 5S 4S 3S QH 7H JD TD 6D QC 7C"),
      expectedAuction: [
        { seat: "South", bid: "PASS", ruleId: "fiveCardHigh.pass.openingNoAction" }
      ],
      explanationKeys: ["fiveCardHigh.pass.openingNoAction"],
      teachingPoints: [
        "Pas, want deze zeskaart is niet sterk genoeg voor een zwakke twee.",
        "Een zwakke twee vraagt niet alleen lengte, maar ook kleurkwaliteit."
      ]
    },
    {
      id: "lesson-03-pass-rule20-rejected-001",
      title: "Les 3 - Regel van 20 afgewezen",
      level: "beginner",
      focus: ["bidding", "opening", "lesson-03", "pass", "rule-of-20"],
      systemId: "fiveCardHigh",
      dealer: "South",
      vulnerability: "none",
      testGoal: "Zuid haalt de ruwe 20-telling, maar de punten zitten niet genoeg in de lange kleuren: pas.",
      hands: dealFromSouth("AS 2S 3S 4S 5S 2H 3H 4H 5H KD QD 2D QC"),
      expectedAuction: [
        { seat: "South", bid: "PASS", ruleId: "fiveCardHigh.pass.openingNoAction" }
      ],
      explanationKeys: ["fiveCardHigh.pass.openingNoAction"],
      teachingPoints: [
        "Pas, want de Regel van 20 vraagt ook dat je punten bij je lange kleuren passen.",
        "Controleer de Regel van 20 voorzichtig, niet mechanisch."
      ]
    },
    {
      id: "lesson-03-rule20-one-spade-001",
      title: "Les 3 - lichte 1 schoppen via Regel van 20",
      level: "beginner",
      focus: ["bidding", "opening", "lesson-03", "rule-of-20", "major"],
      systemId: "fiveCardHigh",
      dealer: "South",
      vulnerability: "none",
      testGoal: "Zuid heeft 11 HCP en voldoet aan de Regel van 20: open 1 schoppen.",
      hands: dealFromSouth("AS KS QS 2S 3S QH 2H 3H 4H 2D 3D 2C 3C"),
      expectedAuction: [
        { seat: "South", bid: "1S", ruleId: "fiveCardHigh.opening.ruleOf20OneMajor" }
      ],
      explanationKeys: ["fiveCardHigh.opening.ruleOf20OneMajor"],
      teachingPoints: [
        "Wel 1 schoppen, want 11 HCP plus de twee langste kleuren komt op 20.",
        "Dit is een lichte opening; controleer dat de punten in de lange kleuren zitten."
      ]
    },
    {
      id: "lesson-03-rule20-one-heart-001",
      title: "Les 3 - lichte 1 harten via Regel van 20",
      level: "beginner",
      focus: ["bidding", "opening", "lesson-03", "rule-of-20", "major"],
      systemId: "fiveCardHigh",
      dealer: "South",
      vulnerability: "none",
      testGoal: "Zuid heeft 11 HCP en een lange hartenkleur: open 1 harten via de Regel van 20.",
      hands: dealFromSouth("QS 2S 3S AH KH QH 9H 7H 4H 3D 2D 7C 6C"),
      expectedAuction: [
        { seat: "South", bid: "1H", ruleId: "fiveCardHigh.opening.ruleOf20OneMajor" }
      ],
      explanationKeys: ["fiveCardHigh.opening.ruleOf20OneMajor"],
      teachingPoints: [
        "Wel 1 harten, want de Regel van 20 ondersteunt deze lichte opening.",
        "Niet 1SA, want deze hand is niet evenwichtig."
      ]
    },
    {
      id: "lesson-03-rule20-one-club-001",
      title: "Les 3 - lichte 1 klaveren via Regel van 20",
      level: "beginner",
      focus: ["bidding", "opening", "lesson-03", "rule-of-20", "minor"],
      systemId: "fiveCardHigh",
      dealer: "South",
      vulnerability: "none",
      testGoal: "Zuid heeft 11 HCP, klaveren en ruiten lengte, en opent 1 klaveren via de Regel van 20.",
      hands: dealFromSouth("2S 3S 2H 3H QD 2D 3D 4D AC KC QC 2C 3C"),
      expectedAuction: [
        { seat: "South", bid: "1C", ruleId: "fiveCardHigh.opening.ruleOf20OneMinor" }
      ],
      explanationKeys: ["fiveCardHigh.opening.ruleOf20OneMinor"],
      teachingPoints: [
        "Wel 1 klaveren, want de lichte hand voldoet aan de Regel van 20.",
        "Geen vijfkaart hoog, dus de lage kleur wordt de opening."
      ]
    },
    {
      id: "lesson-03-rule20-one-diamond-001",
      title: "Les 3 - lichte 1 ruiten via Regel van 20",
      level: "beginner",
      focus: ["bidding", "opening", "lesson-03", "rule-of-20", "minor"],
      systemId: "fiveCardHigh",
      dealer: "South",
      vulnerability: "none",
      testGoal: "Zuid heeft 11 HCP en een lange ruitenkleur: open 1 ruiten via de Regel van 20.",
      hands: dealFromSouth("QS 7S 2S 2H 3H AD KD QD 9D 7D 5D 4C 2C"),
      expectedAuction: [
        { seat: "South", bid: "1D", ruleId: "fiveCardHigh.opening.ruleOf20OneMinor" }
      ],
      explanationKeys: ["fiveCardHigh.opening.ruleOf20OneMinor"],
      teachingPoints: [
        "Wel 1 ruiten, want deze 11 HCP hand haalt de Regel van 20.",
        "De ruitenkleur is lang genoeg om natuurlijk te openen."
      ]
    },
    {
      id: "lesson-03-weak-two-diamond-001",
      title: "Les 3 bonus - zwakke twee ruiten",
      level: "beginner",
      focus: ["bidding", "opening", "lesson-03", "weak-two"],
      systemId: "fiveCardHigh",
      dealer: "South",
      vulnerability: "none",
      testGoal: "Zuid heeft beperkte kracht en een goede zeskaart ruiten: herken 2 ruiten als zwakke twee.",
      hands: dealFromSouth("9S 4S 2S AH 8H 6H KD JD TD 9D 5D 4D 7C"),
      expectedAuction: [
        { seat: "South", bid: "2D", ruleId: "fiveCardHigh.opening.weakTwo" }
      ],
      explanationKeys: ["fiveCardHigh.opening.weakTwo"],
      teachingPoints: [
        "Bonus: dit is geen opening op eenniveau, maar een zwakke twee.",
        "De hand heeft beperkte kracht en een goede zeskaart ruiten."
      ]
    },
    {
      id: "lesson-03-weak-two-heart-001",
      title: "Les 3 bonus - zwakke twee harten",
      level: "beginner",
      focus: ["bidding", "opening", "lesson-03", "weak-two"],
      systemId: "fiveCardHigh",
      dealer: "South",
      vulnerability: "none",
      testGoal: "Zuid heeft beperkte kracht en een goede zeskaart harten: herken 2 harten als zwakke twee.",
      hands: dealFromSouth("9S 4S 2S KH QH JH 9H 6H 4H 8D 5D 7C 3C"),
      expectedAuction: [
        { seat: "South", bid: "2H", ruleId: "fiveCardHigh.opening.weakTwo" }
      ],
      explanationKeys: ["fiveCardHigh.opening.weakTwo"],
      teachingPoints: [
        "Bonus: een zeskaart harten met beperkte kracht kan 2 harten zijn.",
        "Niet 1 harten, want de hand heeft geen normale openingskracht."
      ]
    },
    {
      id: "lesson-03-weak-two-spade-001",
      title: "Les 3 bonus - zwakke twee schoppen",
      level: "beginner",
      focus: ["bidding", "opening", "lesson-03", "weak-two"],
      systemId: "fiveCardHigh",
      dealer: "South",
      vulnerability: "none",
      testGoal: "Zuid heeft beperkte kracht en een goede zeskaart schoppen: herken 2 schoppen als zwakke twee.",
      hands: dealFromSouth("AS QS JS 5S 4S 2S 7H 4H 5D 2D QC TC 6C"),
      expectedAuction: [
        { seat: "South", bid: "2S", ruleId: "fiveCardHigh.opening.weakTwo" }
      ],
      explanationKeys: ["fiveCardHigh.opening.weakTwo"],
      teachingPoints: [
        "Bonus: wel zwakke twee, want de zeskaart schoppen heeft genoeg kwaliteit.",
        "De hand heeft beperkte kracht en stoort de tegenpartij meteen."
      ]
    },
    {
      id: "lesson-03-weak-two-ugly-eleven-001",
      title: "Les 3 bonus - lelijke 11-punter",
      level: "beginner",
      focus: ["bidding", "opening", "lesson-03", "weak-two", "rule-of-20"],
      systemId: "fiveCardHigh",
      dealer: "South",
      vulnerability: "none",
      testGoal: "Zuid heeft een lelijke 11-punter zonder Regel van 20 en opent zwakke twee schoppen.",
      hands: dealFromSouth("KS JS 9S 8S 7S 6S AH QH 7D 5D 2D JC 4C"),
      expectedAuction: [
        { seat: "South", bid: "2S", ruleId: "fiveCardHigh.opening.weakTwo" }
      ],
      explanationKeys: ["fiveCardHigh.opening.weakTwo"],
      teachingPoints: [
        "Bonus: deze 11 HCP hand opent niet rustig 1 schoppen.",
        "De Regel van 20 wordt afgewezen; de goede zeskaart maakt zwakke twee herkenbaar."
      ]
    }
  ];
});

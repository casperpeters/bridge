(function initBasicDefensePracticeHands(root, factory) {
  const hands = factory();
  if (typeof module === "object" && module.exports) module.exports = hands;
  root.PracticeHandCollections = root.PracticeHandCollections || {};
  root.PracticeHandCollections.basicDefense = hands;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBasicDefensePracticeHands() {
  "use strict";

  return [
    {
      id: "lead-sequence-001",
      title: "Uitkomen met de hoogste van een honneurserie",
      level: "beginner",
      focus: ["defense", "opening-lead", "suit-contract", "honor-sequence"],
      systemId: "fiveCardHigh",
      dealer: "South",
      vulnerability: "none",
      testGoal: "Tegen een kleurcontract moet de verdediging met de hoogste kaart van een honneurserie uitkomen.",
      hands: {
        North: ["JS", "TS", "9S", "8S", "JH", "5H", "2H", "QC", "JC", "5C", "QD", "JD", "5D"],
        East: ["TC", "9C", "8C", "7C", "4C", "3C", "2C", "9D", "8D", "7D", "4D", "3D", "3H"],
        South: ["AS", "KS", "QS", "2S", "AH", "7H", "6H", "AC", "KC", "6C", "AD", "KD", "6D"],
        West: ["7S", "6S", "5S", "4S", "3S", "KH", "QH", "TH", "9H", "8H", "4H", "TD", "2D"]
      },
      expectedContract: { contract: "4S", declarer: "South" },
      expectedCardPlay: {
        seat: "West",
        ruleId: "suitContractSequenceLead",
        card: "KH",
        suit: "H",
        isOpeningLead: true
      },
      explanationKeys: ["cardPlay.suitContractSequenceLead"],
      teachingPoints: [
        "Tegen een kleurcontract is de hoogste kaart van een aangesloten honneurserie een duidelijke, leerbare uitkomst.",
        "Deze uitkomst vertelt partner vaak iets nuttigs zonder onder een losse honneur te starten."
      ]
    },
    {
      id: "lead-singleton-001",
      title: "Singleton-uitkomst tegen een kleurcontract",
      level: "beginner",
      focus: ["defense", "opening-lead", "suit-contract", "singleton"],
      systemId: "fiveCardHigh",
      dealer: "South",
      vulnerability: "none",
      testGoal: "Tegen een kleurcontract mag een singleton-uitkomst voorrang krijgen op gewone lengteleads.",
      hands: {
        North: ["JS", "TS", "9S", "8S", "QH", "JH", "5H", "QC", "JC", "5C", "QD", "JD", "5D"],
        East: ["TC", "9C", "8C", "7C", "4C", "3C", "2C", "9D", "8D", "7D", "4D", "3D", "TD"],
        South: ["AS", "KS", "QS", "2S", "AH", "KH", "7H", "AC", "KC", "6C", "AD", "KD", "6D"],
        West: ["7S", "6S", "5S", "4S", "3S", "TH", "9H", "8H", "6H", "4H", "3H", "2H", "2D"]
      },
      expectedContract: { contract: "4S", declarer: "South" },
      expectedCardPlay: {
        seat: "West",
        ruleId: "suitContractSingletonLead",
        card: "2D",
        suit: "D",
        isOpeningLead: true
      },
      explanationKeys: ["cardPlay.suitContractSingletonLead"],
      teachingPoints: [
        "Een singleton kan tegen een kleurcontract een praktische uitkomst zijn omdat partner later mogelijk een introever kan geven.",
        "Dit blijft een beginnersregel: speel hem alleen als er geen duidelijk sterkere uitkomst is."
      ]
    },
    {
      id: "lead-avoid-unsupported-honor-001",
      title: "Niet onder een losse aas uitkomen als er een veiliger zijkleur is",
      level: "beginner",
      focus: ["defense", "opening-lead", "suit-contract", "honor-safety"],
      systemId: "fiveCardHigh",
      dealer: "South",
      vulnerability: "none",
      testGoal: "Tegen een kleurcontract moet de verdediging een veilige driekaartkleur kiezen boven een lage uitkomst onder een losse aas.",
      hands: {
        North: ["JS", "TS", "9S", "8S", "QH", "5H", "QC", "JC", "9C", "QD", "JD", "5D", "4D"],
        East: ["TH", "9H", "3H", "TC", "8C", "7C", "2C", "9D", "8D", "7D", "6D", "3D", "2D"],
        South: ["AS", "KS", "QS", "2S", "KH", "7H", "6H", "AC", "KC", "6C", "AD", "KD", "TD"],
        West: ["7S", "6S", "5S", "4S", "3S", "AH", "JH", "8H", "4H", "2H", "5C", "4C", "3C"]
      },
      expectedContract: { contract: "4S", declarer: "South" },
      expectedCardPlay: {
        seat: "West",
        ruleId: "suitContractTopOfNothingLead",
        card: "5C",
        suit: "C",
        isOpeningLead: true,
        honorSafety: "avoidedUnsupportedAceUnderlead"
      },
      explanationKeys: ["cardPlay.suitContractTopOfNothingLead"],
      teachingPoints: [
        "Klein onder een losse aas uitkomen tegen een kleurcontract kan duur zijn.",
        "Als je met kleine kaarten uitkomt, is top of nothing de afspraak: de hoogste kaart ontkent een plaatje."
      ]
    },
    {
      id: "defense-trump-switch-001",
      title: "Troef naspelen tegen dummy's introefwaarde",
      level: "beginner",
      focus: ["defense", "card-play", "trump-switch", "dummy-ruff"],
      systemId: "fiveCardHigh",
      dealer: "South",
      vulnerability: "none",
      testGoal: "Na de openingsslag moet de verdediging troef kunnen switchen wanneer dummy zichtbaar introefwaarde heeft.",
      hands: {
        North: ["2D", "KH", "QH", "JH", "TC", "9C", "8C", "7C", "6C", "5C", "4C", "3C", "2C"],
        East: ["AD", "AS", "KS", "QS", "AH", "TH", "9H", "8H", "AC", "KC", "QC", "JC", "TD"],
        South: ["3D", "3S", "9S", "8S", "7S", "6S", "5S", "JD", "9D", "8D", "7D", "6D", "5D"],
        West: ["4D", "JS", "TS", "4S", "2S", "7H", "6H", "5H", "4H", "3H", "2H", "KD", "QD"]
      },
      expectedContract: { contract: "4S", declarer: "East" },
      expectedCardPlay: {
        seat: "South",
        hand: ["3S", "9H", "7H", "2C"],
        ruleId: "trumpSwitchAgainstDummyRuff",
        card: "3S",
        trump: "S",
        dummyShortSuit: "C",
        dummyShortLength: 0,
        dummyTrumpLength: 4,
        trickHistory: [{
          number: 1,
          winner: "South",
          cards: [
            { seat: "North", card: "2D" },
            { seat: "East", card: "AD" },
            { seat: "South", card: "3D" },
            { seat: "West", card: "4D" }
          ]
        }]
      },
      explanationKeys: ["cardPlay.trumpSwitchAgainstDummyRuff"],
      teachingPoints: [
        "Als dummy zichtbaar kort is in een zijkleur en nog troeven heeft, kan troef naspelen introevers beperken.",
        "Deze regel gebruikt alleen zichtbare dummy-informatie; niet de verborgen hand van partner."
      ]
    },
    {
      id: "defense-unblock-honor-001",
      title: "Deblokkeren na partners honneur-uitkomst",
      level: "beginner",
      focus: ["defense", "card-play", "notrump", "unblock"],
      systemId: "fiveCardHigh",
      dealer: "West",
      vulnerability: "none",
      testGoal: "Als partner tegen sans-atout met een honneur uit een serie uitkomt, moet derde hand een korte hogere honneur kunnen deblokkeren.",
      hands: {
        North: ["QS", "JS", "TS", "6S", "3S", "AH", "5H", "9D", "5D", "2D", "TC", "6C", "4C"],
        East: ["9S", "5S", "2S", "TH", "7H", "2H", "AD", "QD", "8D", "4D", "KC", "QC", "9C"],
        South: ["KS", "7S", "9H", "8H", "6H", "3H", "JD", "7D", "3D", "JC", "8C", "5C", "2C"],
        West: ["AS", "8S", "4S", "KH", "QH", "JH", "4H", "KD", "TD", "6D", "AC", "7C", "3C"]
      },
      expectedContract: { contract: "3NT", declarer: "West" },
      expectedCardPlay: {
        seat: "South",
        ruleId: "thirdHandUnblockHonor",
        card: "KS",
        leadSuit: "S",
        unblockRank: "K",
        partnerSeat: "North",
        currentTrick: [
          { seat: "North", card: "QS", ruleId: "notrumpSequenceLead" },
          { seat: "East", card: "2S" }
        ]
      },
      explanationKeys: ["cardPlay.thirdHandUnblockHonor"],
      teachingPoints: [
        "Met een honneur doubleton in partners lange kleur speel je de hoge kaart meteen, anders kan die kleur blokkeren.",
        "Deze regel geldt hier omdat partner tegen sans-atout met een plaatje uit een serie is uitgekomen."
      ]
    },
    {
      id: "notrump-lead-major-tiebreak-001",
      title: "Hoge kleur bij gelijke SA-uitkomsten",
      level: "beginner",
      focus: ["defense", "opening-lead", "notrump", "major-tiebreak"],
      systemId: "fiveCardHigh",
      dealer: "South",
      vulnerability: "none",
      testGoal: "Tegen sans-atout moet de verdediging bij gelijkwaardige lengtekleuren de hoge kleur kiezen.",
      hands: {
        North: ["AS", "KS", "QS", "JS", "TS", "AH", "KH", "QH", "AD", "KD", "QD", "AC", "KC"],
        East: ["9S", "5S", "4S", "3S", "JH", "TH", "8H", "7H", "JD", "TD", "8D", "QC", "JC"],
        South: ["6H", "4H", "3H", "7D", "6D", "5D", "4D", "3D", "TC", "9C", "5C", "4C", "3C"],
        West: ["8S", "7S", "6S", "2S", "9H", "5H", "2H", "9D", "2D", "8C", "7C", "6C", "2C"]
      },
      expectedContract: { contract: "3NT", declarer: "South" },
      expectedCardPlay: {
        seat: "West",
        ruleId: "notrumpTopOfNothingLead",
        card: "8S",
        suit: "S",
        isOpeningLead: true,
        leadSelection: "majorTieBreak"
      },
      explanationKeys: ["cardPlay.notrumpTopOfNothingLead"],
      teachingPoints: [
        "Als twee uitkomstkleuren even lang en even sterk zijn, kies je tegen sans-atout liever een hoge kleur.",
        "De tegenpartij heeft in een SA-contract vaak geen duidelijke hoge-kleurfit gevonden."
      ]
    },
    {
      id: "situation-2s-west-trick-8-001",
      title: "2 schoppen door West, Zuid aan zet in slag 8",
      level: "regression",
      focus: ["defense", "card-play", "situation-seed", "follow-suit"],
      systemId: "fiveCardHigh",
      dealer: "East",
      vulnerability: "NS",
      testGoal: "Reproduceert een speelsituatie uit testerfeedback: 2 schoppen door West, zeven slagen gespeeld, Noord heeft 8S voorgespeeld en Zuid moet zonder schoppen afgooien.",
      hands: {
        North: ["QS", "8S", "7S", "KH", "TH", "9H", "QD", "7D", "5D", "2D", "QC", "6C", "4C"],
        East: ["JS", "9S", "6S", "4S", "3S", "AH", "8H", "JD", "TD", "9D", "4D", "8C", "7C"],
        South: ["AS", "5S", "7H", "6H", "5H", "3H", "8D", "6D", "AC", "JC", "TC", "9C", "5C"],
        West: ["KS", "TS", "2S", "QH", "JH", "4H", "2H", "AD", "KD", "3D", "KC", "3C", "2C"]
      },
      expectedContract: { contract: "2S", declarer: "West" },
      teachingPoints: [
        "Deze hand is bedoeld als reproduceerbare fout- of adviescontrole, niet als zelfstandige beginnersles.",
        "Zuid heeft in slag 8 geen schoppen meer en mag dus vrij afgooien."
      ]
    }
  ];
});

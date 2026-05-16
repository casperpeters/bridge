(function initStartMetBridge1PracticeHands(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const smb1Course = isCommonJs ? require("../smb1-course.js") : root.BridgeSmb1Course;
  const collections = isCommonJs
    ? {
        fiveCardHighOpenings: require("./five-card-high-openings.js"),
        notrumpResponses: require("./notrump-responses.js"),
        basicBidding: require("./bidding-basic.js"),
        basicPlayPlan: require("./play-plan-basic.js"),
        basicDefense: require("./defense-basic.js"),
        basicScoring: require("./scoring-basic.js")
      }
    : root.PracticeHandCollections || {};
  const hands = factory(collections, smb1Course);
  if (isCommonJs) module.exports = hands;
  root.PracticeHandCollections = root.PracticeHandCollections || {};
  root.PracticeHandCollections.startMetBridge1 = hands;
})(typeof globalThis !== "undefined" ? globalThis : this, function createStartMetBridge1PracticeHands(collections, smb1Course) {
  "use strict";

  const course = "start-met-bridge-1";
  if (!smb1Course?.findLesson) throw new Error("practice-hands/smb1-course.js must load before start-met-bridge-1.js");

  const reusedHands = [
    reuse("smb1-les01-troefcontract-herkennen", 1, "draw-trumps-001", {
      topic: "Troef, leider en dummy",
      goal: "Herken dat een kleurcontract om troefcontrole draait.",
      expectedFocus: ["play-plan", "trump", "dummy"],
      expectedActions: ["Bekijk contract 4S", "Maak een eerste speelplan"],
      reviewFocus: ["troefkleur", "leider", "dummy", "eerste speelplan"],
      appFocus: ["cards-seats-suits", "contract-trump-dummy", "trick-winner"]
    }),
    reuse("smb1-les02-slagen-ontwikkelen-sa", 2, "notrump-develop-long-suit-001", {
      topic: "Slagen ontwikkelen",
      goal: "Ontwikkel extra slagen door een lange kleur vrij te spelen.",
      expectedFocus: ["play-plan", "notrump", "develop-long-suit"],
      expectedActions: ["Tel vaste slagen", "Werk een hoge kaart uit de werkkleur"],
      reviewFocus: ["vaste slagen", "ontwikkelslagen", "bereikbaarheid"],
      appFocus: ["direct-tricks", "develop-tricks"]
    }),
    reuse("smb1-les02-eenvoudige-snit", 2, "pre-trump-finesse-discard-001", {
      topic: "Snijden",
      goal: "Herken een eenvoudige snit als ontwikkelkans in het speelplan.",
      expectedFocus: ["play-plan", "finesse", "discard-loser"],
      expectedActions: ["Neem de ruitensnit voordat troef wordt getrokken"],
      reviewFocus: ["snit", "timing", "verliezer weggooien"],
      appFocus: ["simple-finesse"]
    }),
    reuse("smb1-les03-lengteslag-vrijtroeven", 3, "long-side-suit-ruff-001", {
      topic: "Lengteslagen",
      goal: "Gebruik troeven om een lange bijkleur tot extra slagen te ontwikkelen.",
      expectedFocus: ["play-plan", "long-side-suit", "ruff"],
      expectedActions: ["Troef de lange hartenkleur vrij", "Bewaar de entree"],
      reviewFocus: ["lengteslagen", "introevers", "entrees"],
      appFocus: ["length-tricks", "trump-extra-tricks"]
    }),
    reuse("smb1-les03-introever-korte-hand", 3, "short-trump-ruff-001", {
      topic: "Troeven als slagkracht",
      goal: "Zie waarom een introever in de korte troefhand een extra slag kan opleveren.",
      expectedFocus: ["play-plan", "ruff-short-suit", "trump"],
      expectedActions: ["Gebruik dummy's korte kleur voordat alle troeven weg zijn"],
      reviewFocus: ["korte troefhand", "introever", "troeftiming"],
      appFocus: ["trump-extra-tricks"]
    }),
    reuse("smb1-les04-kleurcontract-plan", 4, "draw-trumps-001", {
      topic: "Speelplan in troef",
      goal: "Maak eerst een kleurcontractplan met troef trekken als hoofdactie.",
      expectedFocus: ["play-plan", "suit-contract", "draw-trumps"],
      expectedActions: ["Tel verliezers", "Trek troef wanneer dat veilig is"],
      reviewFocus: ["verliezers", "troeftrekken", "planprioriteit"],
      appFocus: ["suit-contract-plan"]
    }),
    reuse("smb1-les04-sa-plan-deblokkeren", 4, "notrump-unblock-long-suit-001", {
      topic: "Speelplan in sans-atout",
      goal: "Plan in SA rond vaste slagen, werkkleur en entrees.",
      expectedFocus: ["play-plan", "notrump", "entries"],
      expectedActions: ["Deblokkeer klaveren", "Gebruik de entree naar dummy"],
      reviewFocus: ["winnaars", "werkkleur", "entrees"],
      appFocus: ["notrump-plan"]
    }),
    reuse("smb1-les05-sa-uitkomst-hoge-kleur", 5, "notrump-lead-major-tiebreak-001", {
      topic: "Uitkomen tegen SA",
      goal: "Kies bij gelijkwaardige SA-uitkomsten de hoge kleur.",
      expectedFocus: ["defense", "opening-lead", "notrump"],
      expectedActions: ["Kom uit tegen 3SA", "Vergelijk even lange kleuren"],
      reviewFocus: ["SA-uitkomst", "lengte", "hoge-kleurvoorkeur"],
      appFocus: ["opening-lead-notrump"]
    }),
    reuse("smb1-les05-serie-uitkomst", 5, "lead-sequence-001", {
      topic: "Uitkomen van een serie",
      goal: "Kom tegen een kleurcontract uit met de hoogste van een honneurserie.",
      expectedFocus: ["defense", "opening-lead", "honor-sequence"],
      expectedActions: ["Start met de hoogste kaart van de serie"],
      reviewFocus: ["honneurserie", "kleurcontract", "veilige uitkomst"],
      appFocus: ["opening-lead-sequence", "opening-lead-suit"]
    }),
    reuse("smb1-les05-singleton-uitkomst", 5, "lead-singleton-001", {
      topic: "Uitkomen tegen troef",
      goal: "Herken een singleton als mogelijke uitkomst tegen een kleurcontract.",
      expectedFocus: ["defense", "opening-lead", "singleton"],
      expectedActions: ["Kom uit met de singleton"],
      reviewFocus: ["singleton", "introefkans", "troefcontract"],
      appFocus: ["opening-lead-suit"]
    }),
    reuse("smb1-les06-deblokkeren-derde-hand", 6, "defense-unblock-honor-001", {
      topic: "Derde hand en deblokkeren",
      goal: "Deblokkeer een korte honneur na partners SA-serieuitkomst.",
      expectedFocus: ["defense", "card-play", "notrump", "unblock"],
      expectedActions: ["Speel de korte hoge honneur bij"],
      reviewFocus: ["derde hand", "deblokkeren", "partners lange kleur"],
      appFocus: ["third-hand-high", "defensive-unblock"]
    }),
    reuse("smb1-les06-troef-naspelen", 6, "defense-trump-switch-001", {
      topic: "Tegenspelen tegen troef",
      goal: "Speel troef na wanneer dummy zichtbare introefwaarde heeft.",
      expectedFocus: ["defense", "card-play", "trump-switch"],
      expectedActions: ["Switch naar troef"],
      reviewFocus: ["dummykortheid", "introefwaarde", "troef naspelen"],
      appFocus: ["defense-against-suit"]
    }),
    reuse("smb1-les07-openen-1sa", 7, "one-nt-opening-001", {
      topic: "Openingsbod",
      goal: "Open een gebalanceerde 15-17-punter met 1SA.",
      expectedFocus: ["bidding", "opening", "notrump"],
      expectedActions: ["Open 1SA"],
      reviewFocus: ["HCP", "verdeling", "1SA-range"],
      appFocus: ["opening-one-notrump"]
    }),
    reuse("smb1-les07-openen-vijfkaart-hoog", 7, "one-heart-opening-001", {
      topic: "Openingsbod",
      goal: "Open met openingskracht en een vijfkaart hoog in de hoge kleur.",
      expectedFocus: ["bidding", "opening", "major"],
      expectedActions: ["Open 1H"],
      reviewFocus: ["vijfkaart hoog", "openingskracht"],
      appFocus: ["opening-one-major"]
    }),
    reuse("smb1-les07-openen-lage-kleur", 7, "lesson-03-one-diamond-four-001", {
      topic: "Openingsbod",
      goal: "Open een lage kleur wanneer er geen 1SA-hand of vijfkaart hoog is.",
      expectedFocus: ["bidding", "opening", "minor"],
      expectedActions: ["Open 1D"],
      reviewFocus: ["lage-kleuropening", "geen vijfkaart hoog"],
      appFocus: ["opening-one-minor"]
    }),
    reuse("smb1-les07-passen-zonder-opening", 7, "opening-pass-001", {
      topic: "Openingsbod",
      goal: "Pas wanneer de hand geen opening waard is.",
      expectedFocus: ["bidding", "opening", "pass"],
      expectedActions: ["Pas"],
      reviewFocus: ["te weinig kracht", "geen opening"],
      appFocus: ["opening-pass"]
    }),
    reuse("smb1-les08-hoge-kleur-fit-steunen", 8, "response-raise-after-1s-001", {
      topic: "Hoge-kleuropening met fit",
      goal: "Steun partners hoge kleur met driekaart steun en 6-9 punten.",
      expectedFocus: ["bidding", "response", "major-fit"],
      expectedActions: ["Antwoord 2S"],
      reviewFocus: ["5-3 fit", "fitpunten", "rustige verhoging"],
      appFocus: ["major-response-fit"]
    }),
    reuse("smb1-les10-nieuwe-kleur-eenniveau", 10, "response-new-suit-after-1h-001", {
      topic: "Nieuwe kleur na hoge-kleuropening",
      goal: "Bied een nieuwe kleur op eenniveau wanneer dat de beste beschrijving is.",
      expectedFocus: ["bidding", "response", "new-suit"],
      expectedActions: ["Antwoord 1S"],
      reviewFocus: ["nieuwe kleur", "vierkaart", "eenniveau"],
      appFocus: ["new-suit-after-major"]
    }),
    reuse("smb1-les11-lage-kleur-zoek-hoog", 11, "minor-opening-find-major-001", {
      topic: "Lage-kleuropening en verder bieden",
      goal: "Zoek na een lage-kleuropening eerst een hoge-kleurfit.",
      expectedFocus: ["bidding", "response", "minor-opening", "major-search"],
      expectedActions: ["Antwoord 1H"],
      reviewFocus: ["lage-kleuropening", "vierkaart hoog", "fit zoeken"],
      appFocus: ["minor-response-major-search"]
    }),
    reuse("smb1-les12-eenvoudig-volgbod", 12, "simple-overcall-001", {
      topic: "Het volgbod",
      goal: "Doe een eenvoudig volgbod met een goede vijfkaart en genoeg kracht.",
      expectedFocus: ["bidding", "competitive", "overcall"],
      expectedActions: ["Volg 1S"],
      reviewFocus: ["goede vijfkaart", "volgbod", "kwetsbaarheid"],
      appFocus: ["simple-overcall"]
    })
  ];

  const newHands = [
    {
      id: "smb1-les06-tweede-hand-laag",
      title: "SMB1 les 6 - Tweede hand laag",
      level: "beginner",
      course,
      lesson: lessonMeta(6),
      topic: "Tegenspelen",
      goal: "Speel als tweede hand laag wanneer de leider laag in de kleur voorspeelt.",
      expectedFocus: ["defense", "card-play", "second-hand-low"],
      expectedActions: ["Speel 5H"],
      reviewFocus: ["tweede hand laag", "kleur bekennen", "geen honneur verspillen"],
      appFocus: ["second-hand-low"],
      focus: ["smb1", "lesson-06", "defense", "card-play", "second-hand-low"],
      systemId: "fiveCardHigh",
      dealer: "North",
      vulnerability: "none",
      testGoal: "In les 6 moet Oost als tweede hand laag blijven wanneer Noord 4 harten voorspeelt.",
      hands: {
        North: ["AS", "KS", "QS", "JS", "TS", "4H", "AD", "KD", "QD", "AC", "KC", "QC", "JC"],
        East: ["9S", "8S", "7S", "AH", "7H", "5H", "TD", "9D", "8D", "TC", "9C", "8C", "7C"],
        South: ["6S", "5S", "4S", "3S", "2S", "JH", "TH", "9H", "7D", "6D", "6C", "5C", "4C"],
        West: ["KH", "QH", "8H", "6H", "3H", "2H", "JD", "5D", "4D", "3D", "2D", "3C", "2C"]
      },
      expectedContract: { contract: "3NT", declarer: "North" },
      expectedCardPlay: {
        seat: "East",
        ruleId: "secondHandLow",
        card: "5H",
        currentTrick: [{ seat: "North", card: "4H" }]
      },
      explanationKeys: ["cardPlay.secondHandLow"],
      teachingPoints: [
        "Tweede hand speelt meestal laag, ook als er een hoge kaart beschikbaar is.",
        "Zo bewaart Oost de aas zolang Noord nog niet met een honneur dwingt."
      ]
    },
    {
      id: "smb1-les06-honneur-op-honneur",
      title: "SMB1 les 6 - Honneur op honneur",
      level: "beginner",
      course,
      lesson: lessonMeta(6),
      topic: "Tegenspelen",
      goal: "Dek als tweede hand een voorgespeelde honneur met de goedkoopste hogere honneur.",
      expectedFocus: ["defense", "card-play", "cover-honor"],
      expectedActions: ["Speel KH op QH"],
      reviewFocus: ["honneur op honneur", "promotiekans", "zichtbare dummy"],
      appFocus: ["honor-on-honor"],
      focus: ["smb1", "lesson-06", "defense", "card-play", "cover-honor"],
      systemId: "fiveCardHigh",
      dealer: "North",
      vulnerability: "none",
      testGoal: "In les 6 moet Oost als tweede hand harten heer op harten vrouw dekken.",
      hands: {
        North: ["AS", "KS", "QS", "JS", "TS", "QH", "AD", "KD", "QD", "AC", "KC", "QC", "JC"],
        East: ["9S", "8S", "7S", "KH", "7H", "5H", "TD", "9D", "8D", "TC", "9C", "8C", "7C"],
        South: ["6S", "5S", "4S", "3S", "2S", "JH", "TH", "9H", "7D", "6D", "6C", "5C", "4C"],
        West: ["AH", "8H", "6H", "4H", "3H", "2H", "JD", "5D", "4D", "3D", "2D", "3C", "2C"]
      },
      expectedContract: { contract: "3NT", declarer: "North" },
      expectedCardPlay: {
        seat: "East",
        ruleId: "secondHandCoverHonor",
        card: "KH",
        coveredRank: "Q",
        coverReason: "dummyThreat",
        currentTrick: [{ seat: "North", card: "QH" }]
      },
      explanationKeys: ["cardPlay.secondHandCoverHonor"],
      teachingPoints: [
        "Als de leider een honneur speelt, kan dekken een lagere honneur in dummy beperken.",
        "Oost gebruikt de goedkoopste hogere honneur: de heer."
      ]
    },
    {
      id: "smb1-les09-zonder-fit-1sa",
      title: "SMB1 les 9 - Zonder fit naar 1SA",
      level: "beginner",
      course,
      lesson: lessonMeta(9),
      topic: "Hoge-kleuropening zonder fit",
      goal: "Antwoord 1SA met 6-9 HCP, geen driekaart steun en geen beter bod.",
      expectedFocus: ["bidding", "response", "notrump", "no-fit"],
      expectedActions: ["Antwoord 1NT"],
      reviewFocus: ["geen fit", "6-9 HCP", "vuilnisbakkenbod"],
      appFocus: ["major-response-no-fit", "one-notrump-response"],
      focus: ["smb1", "lesson-09", "bidding", "response", "notrump", "no-fit"],
      systemId: "fiveCardHigh",
      dealer: "North",
      vulnerability: "none",
      testGoal: "Na 1 schoppen van Noord moet Zuid zonder fit en zonder beter bod 1SA antwoorden.",
      hands: {
        North: ["AS", "KS", "QS", "7S", "4S", "AH", "6H", "5H", "4H", "KC", "5D", "4D", "3D"],
        East: ["6S", "5S", "3S", "2S", "9H", "8H", "2H", "7D", "6D", "6C", "5C", "3C", "2C"],
        South: ["JS", "8S", "KH", "7H", "3H", "9C", "8C", "7C", "4C", "QD", "9D", "8D", "2D"],
        West: ["TS", "9S", "QH", "JH", "TH", "AD", "KD", "JD", "TD", "AC", "QC", "JC", "TC"]
      },
      expectedAuction: [
        { seat: "North", bid: "1S", ruleId: "fiveCardHigh.opening.oneMajor" },
        { seat: "East", bid: "PASS", ruleId: "fiveCardHigh.pass.competitiveNoAction" },
        { seat: "South", bid: "1NT", ruleId: "fiveCardHigh.response.notrump" }
      ],
      explanationKeys: ["fiveCardHigh.opening.oneMajor", "fiveCardHigh.response.notrump"],
      teachingPoints: [
        "Zuid heeft te weinig schoppensteun voor een verhoging.",
        "Met 6-9 HCP en geen betere nieuwe kleur kiest de engine het 1SA-bijbod."
      ]
    }
  ];

  return [...reusedHands, ...newHands];

  function reuse(id, lessonNumber, sourceHandId, metadata) {
    const source = findSourceHand(sourceHandId);
    if (!source) throw new Error(`Unknown SMB1 source hand: ${sourceHandId}`);
    return {
      ...clone(source),
      id,
      title: `SMB1 les ${String(lessonNumber).padStart(2, "0")} - ${source.title}`,
      level: "beginner",
      course,
      lesson: lessonMeta(lessonNumber),
      sourceHandId,
      focus: ["smb1", `lesson-${String(lessonNumber).padStart(2, "0")}`, ...source.focus],
      ...metadata
    };
  }

  function lessonMeta(number) {
    const courseLesson = smb1Course.findLesson(number);
    if (!courseLesson) throw new Error(`Unknown SMB1 lesson number: ${number}`);
    return {
      number: courseLesson.number,
      id: courseLesson.id,
      title: courseLesson.title
    };
  }

  function findSourceHand(id) {
    for (const hands of Object.values(collections || {})) {
      const found = (hands || []).find((scenario) => scenario.id === id);
      if (found) return found;
    }
    return null;
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }
});

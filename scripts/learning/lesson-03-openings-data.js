(function initLesson03OpeningsData(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.BridgeLesson03OpeningsData = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createLesson03OpeningsData() {
  "use strict";

  const openingOptions = [
    { value: "PASS", label: "Pas" },
    { value: "1C", label: "1\u2663" },
    { value: "1D", label: "1\u2666" },
    { value: "1H", label: "1\u2665" },
    { value: "1S", label: "1\u2660" },
    { value: "1NT", label: "1SA" },
    { value: "WEAK_TWO", label: "Zwakke twee" }
  ];

  const categoryLabels = {
    all: "Alles",
    notrump: "1SA",
    major: "1 hoog",
    minor: "1 laag",
    pass: "Pas",
    rule20: "Regel van 20",
    weakTwo: "Zwakke twee"
  };

  const openingQuestions = [
    {
      id: "q-one-nt-16",
      category: "notrump",
      handId: "lesson-03-one-nt-balanced-001",
      hand: "AS QS 8S 3S KH JH 4H AD TD 6D QC 9C 2C",
      answer: "1NT",
      feedback: "Wel 1SA, want deze hand heeft 16 HCP en een Evenwichtige verdeling.",
      wrongByChoice: {
        "1S": "Niet 1 schoppen, want er is geen vijfkaart schoppen.",
        "1H": "Niet 1 harten, want Vijfkaart-Hoog vraagt minimaal vijf harten."
      }
    },
    {
      id: "q-one-nt-17",
      category: "notrump",
      handId: "lesson-03-one-nt-balanced-002",
      hand: "KS JS 5S AH QH 6H KD 8D 3D AC 7C 4C 2C",
      answer: "1NT",
      feedback: "Wel 1SA, want 17 HCP valt precies in de 15-17 range en de verdeling is evenwichtig."
    },
    {
      id: "q-one-nt-five-heart",
      category: "notrump",
      handId: "lesson-03-one-nt-five-heart-001",
      chapterId: "een-sa-gaat-voor",
      hand: "AS 8S 4S AH KH JH 7H 3H KD 6D 2D QC 5C",
      answer: "1NT",
      feedback: "Niet 1 harten, want deze 15-17 HCP hand is evenwichtig. Wel 1SA.",
      wrongByChoice: {
        "1H": "Niet 1 harten, want 1SA gaat in dit profiel voor met 15-17 HCP en een Evenwichtige verdeling.",
        "1S": "Niet 1 schoppen, want je hebt geen vijfkaart schoppen."
      }
    },
    {
      id: "q-one-heart-five",
      category: "major",
      handId: "lesson-03-one-heart-opening-001",
      hand: "AS 9S KH QH JH 8H 4H AD 7D 3D 9C 6C 2C",
      answer: "1H",
      feedback: "Wel 1 harten, want je hebt Openingskracht en een vijfkaart harten.",
      wrongByChoice: {
        "1NT": "Niet 1SA, want deze hand heeft geen 15-17 HCP in de 1SA-range.",
        "1S": "Niet 1 schoppen, want Vijfkaart-Hoog vraagt minimaal vijf schoppen."
      }
    },
    {
      id: "q-one-heart-six",
      category: "major",
      handId: "lesson-03-one-heart-six-card-001",
      hand: "8S 3S AH QH JH 9H 6H 4H KD 7D 2D QC 5C",
      answer: "1H",
      feedback: "Wel 1 harten, want je hebt normale Openingskracht en een zeskaart harten.",
      wrongByChoice: {
        WEAK_TWO: "Niet zwakke twee, want 12 HCP is normale Openingskracht voor een opening op eenniveau."
      }
    },
    {
      id: "q-one-spade-five",
      category: "major",
      handId: "lesson-03-one-spade-opening-001",
      chapterId: "vijfkaart-hoog-openen",
      hand: "AS KS QS 8S 4S AH 7H 5D 3D JC 8C 6C 2C",
      answer: "1S",
      feedback: "Wel 1 schoppen, want je hebt Openingskracht en een vijfkaart schoppen.",
      wrongByChoice: {
        "1NT": "Niet 1SA, want deze hand is niet evenwichtig.",
        "1H": "Niet 1 harten, want Vijfkaart-Hoog vraagt minimaal vijf harten."
      }
    },
    {
      id: "q-one-spade-six",
      category: "major",
      handId: "lesson-03-one-spade-six-card-001",
      hand: "KS QS JS 9S 7S 3S AH 8H QD 6D 2D 9C 5C",
      answer: "1S",
      feedback: "Wel 1 schoppen, want je hebt 12 HCP en een zeskaart schoppen."
    },
    {
      id: "q-two-five-majors",
      category: "major",
      handId: "lesson-03-two-five-majors-001",
      hand: "AS QS 9S 5S 2S AH KH 8H 6H 4H 7D 3D 6C",
      answer: "1S",
      feedback: "Wel 1 schoppen, want met twee vijfkaarten open je de hoogste kleur. Harten kun je later nog tonen.",
      wrongByChoice: {
        "1H": "Bijna, harten heeft ook vijf kaarten. Met twee vijfkaarten open je in dit profiel de hoogste: 1 schoppen."
      }
    },
    {
      id: "q-one-club-short",
      category: "minor",
      handId: "lesson-03-one-club-short-001",
      chapterId: "lage-kleur-vangnet",
      hand: "AS QS 8S 4S KH JH 7H 3H KD 8D 2D 9C 5C",
      answer: "1C",
      feedback: "Wel 1 klaveren, want er is geen 1SA-hand en geen vijfkaart hoog. 1 klaveren is hier het vangnet.",
      wrongByChoice: {
        "1H": "Niet 1 harten, want Vijfkaart-Hoog vraagt minimaal vijf harten.",
        "1S": "Niet 1 schoppen, want Vijfkaart-Hoog vraagt minimaal vijf schoppen.",
        "1NT": "Niet 1SA, want deze hand heeft geen 15-17 HCP."
      }
    },
    {
      id: "q-one-club-long",
      category: "minor",
      handId: "lesson-03-one-club-long-001",
      hand: "AS 7S 3S KH 9H AD 8D AC QC 9C 7C 4C 2C",
      answer: "1C",
      feedback: "Wel 1 klaveren, want klaveren is je lange lage kleur en de hand is niet evenwichtig.",
      wrongByChoice: {
        "1NT": "Niet 1SA, want deze hand is niet evenwichtig."
      }
    },
    {
      id: "q-one-diamond-four",
      category: "minor",
      handId: "lesson-03-one-diamond-four-001",
      hand: "AS KS 8S QH 7H 4H AD JD 8D 2D 9C 7C 3C",
      answer: "1D",
      feedback: "Wel 1 ruiten, want je hebt geen vijfkaart hoog en ruiten is de passende lage kleur.",
      wrongByChoice: {
        "1H": "Niet 1 harten, want Vijfkaart-Hoog vraagt minimaal vijf harten.",
        "1S": "Niet 1 schoppen, want Vijfkaart-Hoog vraagt minimaal vijf schoppen."
      }
    },
    {
      id: "q-one-diamond-long",
      category: "minor",
      handId: "lesson-03-one-diamond-long-001",
      hand: "8S 4S AH 7H AD KD QD 9D 6D 3D QC 8C 2C",
      answer: "1D",
      feedback: "Wel 1 ruiten, want deze hand is niet evenwichtig en ruiten is duidelijk de langste kleur."
    },
    {
      id: "q-pass-six",
      category: "pass",
      handId: "lesson-03-pass-low-balanced-001",
      chapterId: "passen-zonder-kracht",
      hand: "KS 8S 5S QH 7H 4H JD 9D 6D 8C 5C 3C 2C",
      answer: "PASS",
      feedback: "Pas, want 6 HCP zonder sterke verdeling is te weinig."
    },
    {
      id: "q-pass-eight-flat",
      category: "pass",
      hand: "KS 8S 5S QH 7H 4H JD 9D 6D QC 5C 3C 2C",
      answer: "PASS",
      feedback: "Pas, want 8 HCP zonder sterke verdeling is te weinig."
    },
    {
      id: "q-pass-nine-flat",
      category: "pass",
      handId: "lesson-03-pass-nine-flat-001",
      hand: "AS 7S 5S 3S KH 8H 6H 4H QD 7D 2D 9C 5C",
      answer: "PASS",
      feedback: "Pas, want 9 HCP is nog geen Openingskracht en er is geen sterke verdeling."
    },
    {
      id: "q-pass-poor-six",
      category: "pass",
      handId: "lesson-03-pass-poor-six-spades-001",
      hand: "KS 8S 7S 5S 4S 3S QH 7H JD TD 6D QC 7C",
      answer: "PASS",
      feedback: "Pas, want de zeskaart schoppen heeft niet genoeg kwaliteit voor zwakke twee.",
      wrongByChoice: {
        WEAK_TWO: "Niet zwakke twee, want deze zeskaart is te mager."
      }
    },
    {
      id: "q-pass-rule20-rejected",
      category: "pass",
      handId: "lesson-03-pass-rule20-rejected-001",
      hand: "AS 2S 3S 4S 5S 2H 3H 4H 5H KD QD 2D QC",
      answer: "PASS",
      feedback: "Pas, want de ruwe Regel van 20 is niet genoeg: de punten zitten niet vooral in de lange kleuren."
    },
    {
      id: "q-rule20-spade",
      category: "rule20",
      handId: "lesson-03-rule20-one-spade-001",
      chapterId: "regel-van-20-voorzichtig",
      hand: "AS KS QS 2S 3S QH 2H 3H 4H 2D 3D 2C 3C",
      answer: "1S",
      feedback: "Wel 1 schoppen, want 11 HCP plus de twee langste kleuren komt op 20 en de punten zitten in die kleuren."
    },
    {
      id: "q-rule20-heart",
      category: "rule20",
      handId: "lesson-03-rule20-one-heart-001",
      hand: "QS 2S 3S AH KH QH 9H 7H 4H 3D 2D 7C 6C",
      answer: "1H",
      feedback: "Wel 1 harten, want deze lichte hand haalt de Regel van 20 met een lange hartenkleur."
    },
    {
      id: "q-rule20-club",
      category: "rule20",
      handId: "lesson-03-rule20-one-club-001",
      hand: "2S 3S 2H 3H QD 2D 3D 4D AC KC QC 2C 3C",
      answer: "1C",
      feedback: "Wel 1 klaveren, want deze 11 HCP hand haalt de Regel van 20 en heeft geen vijfkaart hoog."
    },
    {
      id: "q-rule20-diamond",
      category: "rule20",
      handId: "lesson-03-rule20-one-diamond-001",
      hand: "QS 7S 2S 2H 3H AD KD QD 9D 7D 5D 4C 2C",
      answer: "1D",
      feedback: "Wel 1 ruiten, want 11 HCP plus de lange ruitenkleur en volgende lengte halen de Regel van 20."
    },
    {
      id: "q-weak-two-diamond",
      category: "weakTwo",
      handId: "lesson-03-weak-two-diamond-001",
      hand: "9S 4S 2S AH 8H 6H KD JD TD 9D 5D 4D 7C",
      answer: "WEAK_TWO",
      expectedBid: "2D",
      feedback: "Zwakke twee: open 2 ruiten, want je hebt beperkte kracht en een goede zeskaart ruiten."
    },
    {
      id: "q-weak-two-heart",
      category: "weakTwo",
      handId: "lesson-03-weak-two-heart-001",
      chapterId: "zwakke-twee-bonus",
      hand: "9S 4S 2S KH QH JH 9H 6H 4H 8D 5D 7C 3C",
      answer: "WEAK_TWO",
      expectedBid: "2H",
      feedback: "Zwakke twee: open 2 harten, want je hebt een zeskaart harten en beperkte kracht.",
      wrongByChoice: {
        "1H": "Niet 1 harten, want deze hand heeft geen normale Openingskracht."
      }
    },
    {
      id: "q-weak-two-spade",
      category: "weakTwo",
      handId: "lesson-03-weak-two-spade-001",
      hand: "AS QS JS 5S 4S 2S 7H 4H 5D 2D QC TC 6C",
      answer: "WEAK_TWO",
      expectedBid: "2S",
      feedback: "Zwakke twee: open 2 schoppen, want je hebt een goede zeskaart en beperkte kracht."
    },
    {
      id: "q-weak-two-ugly-eleven",
      category: "weakTwo",
      handId: "lesson-03-weak-two-ugly-eleven-001",
      hand: "KS JS 9S 8S 7S 6S AH QH 7D 5D 2D JC 4C",
      answer: "WEAK_TWO",
      expectedBid: "2S",
      feedback: "Zwakke twee: deze lelijke 11-punter haalt de Regel van 20 niet, maar heeft wel een goede zeskaart schoppen."
    }
  ];

  const casinoQuestionIds = [
    "q-one-nt-five-heart",
    "q-one-spade-five",
    "q-one-club-short",
    "q-pass-eight-flat",
    "q-rule20-spade",
    "q-weak-two-heart",
    "q-one-nt-16",
    "q-one-heart-six",
    "q-one-diamond-long",
    "q-pass-rule20-rejected",
    "q-rule20-club",
    "q-weak-two-spade"
  ];

  function allOpeningOptions() {
    return openingOptions.map((option) => ({ ...option }));
  }

  function allCategoryLabels() {
    return { ...categoryLabels };
  }

  function allOpeningQuestions() {
    return openingQuestions.map(cloneQuestion);
  }

  function allCasinoQuestionIds() {
    return [...casinoQuestionIds];
  }

  function allCasinoQuestions() {
    const questionsById = new Map(openingQuestions.map((question) => [question.id, question]));
    return casinoQuestionIds.map((id) => questionsById.get(id)).filter(Boolean).map(cloneQuestion);
  }

  function cloneQuestion(question) {
    return {
      ...question,
      wrongByChoice: question.wrongByChoice ? { ...question.wrongByChoice } : undefined
    };
  }

  return {
    allOpeningOptions,
    allCategoryLabels,
    allOpeningQuestions,
    allCasinoQuestionIds,
    allCasinoQuestions
  };
});

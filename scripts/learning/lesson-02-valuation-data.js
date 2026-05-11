(function initLesson02ValuationData(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.BridgeLesson02ValuationData = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createLesson02ValuationData() {
  "use strict";

  const valuationQuestions = [
    {
      kind: "hcp",
      prompt: "Hoeveel HCP heeft deze hand?",
      hand: "AS QS 7S KH 9H 4H QD 8D 3D JC 6C 5C 2C",
      good: "Goed. Aas, Heer, Vrouw, Vrouw en Boer maken samen 12 HCP.",
      wrong: "Tel alleen A, K, Q en J. De kleine kaarten tellen niet mee."
    },
    {
      kind: "hcp",
      prompt: "Hoeveel HCP heeft deze hand? Let op de tienen.",
      hand: "AS TS 8S KH TH 6H QD JD 4D TC 9C 7C 3C",
      good: "Precies. De drie tienen zijn honneurs, maar leveren 0 HCP op.",
      wrong: "De 10 is een Honneur, maar geen HCP. Tel A, K, Q en J."
    },
    {
      kind: "balanced",
      prompt: "Is deze hand evenwichtig?",
      hand: "AS 8S 5S 2S KH 9H 4H QD 6D 3D 8C 7C 5C",
      good: "Ja. De verdeling is 4-3-3-3, dus evenwichtig.",
      wrong: "Kijk naar het patroon: 4-3-3-3 staat op de evenwichtige lijst."
    },
    {
      kind: "balanced",
      prompt: "Is deze hand evenwichtig?",
      hand: "AS KS 9S 7S 6S 4S QH 8H 2H 7D 5D 3D 4C",
      good: "Goed gezien. 6-3-3-1 is onevenwichtig en heeft een singleton.",
      wrong: "Deze hand heeft zes schoppen en een singleton klaveren. Dat is geen SA-verdeling."
    },
    {
      kind: "longest",
      prompt: "Welke kleur is het langst?",
      hand: "KS 8S 4S AH QH 9H 7H 3H JD 6D 2D 8C 5C",
      answerSuit: "H",
      good: "Klopt. Harten heeft vijf kaarten en is de langste kleur.",
      wrong: "Tel per kleur. Harten heeft hier vijf kaarten."
    },
    {
      kind: "longest",
      prompt: "Welke kleur is het langst?",
      hand: "QS 9S 8H 6H 3H AD KD 7D 5D 2D JC TC 4C",
      answerSuit: "D",
      good: "Ja. Ruiten heeft vijf kaarten en is de langste kleur.",
      wrong: "Tel de ruiten nog eens: A, K, 7, 5 en 2."
    },
    {
      kind: "fitValue",
      prompt: "Zou deze hand later meer waard worden met een hartenfit?",
      hand: "AS 8S 6S 4S 2S KH 9H 5H QD 7D 6D 2D 3C",
      answer: "yes",
      good: "Ja. Met drie harten tegenover partners vijf harten is er een Fit, en de singleton klaveren wordt nuttig.",
      wrong: "Partner met vijf harten plus jouw drie harten geeft een Fit. Dan is de singleton klaveren extra interessant."
    },
    {
      kind: "fitValue",
      prompt: "Zou deze hand later meer waard worden met een hartenfit?",
      hand: "AS QS 8S 7H 4H KD JD 6D 9C 8C 7C 5C 2C",
      answer: "no",
      good: "Goed. Met maar twee harten heb je tegenover vijf harten nog geen achtkaartfit.",
      wrong: "Vijf harten bij partner plus twee bij jou is zeven. Dat is nog geen Fit."
    },
    {
      kind: "balanced",
      prompt: "Is deze 5-3-3-2 hand evenwichtig?",
      hand: "AS QS 8S 6S 3S KH 7H 2H JD 8D 4D 9C 5C",
      good: "Ja. 5-3-3-2 is evenwichtig, ook al zit er een vijfkaart in.",
      wrong: "5-3-3-2 hoort bij de drie evenwichtige verdelingen."
    }
  ];

  const miniQuiz = [
    {
      question: "Welke kaarten leveren HCP op?",
      options: ["Aas, Heer, Vrouw en Boer", "Aas tot en met 10", "Alle honneurs evenveel"],
      answer: "Aas, Heer, Vrouw en Boer",
      feedback: "Juist. De 10 is wel een Honneur, maar telt 0 HCP."
    },
    {
      question: "Welke verdeling is evenwichtig?",
      options: ["4-4-3-2", "6-4-2-1", "7-3-2-1"],
      answer: "4-4-3-2",
      feedback: "Klopt. 4-4-3-2 staat samen met 4-3-3-3 en 5-3-3-2 op de lijst."
    },
    {
      question: "Wat is een Fit?",
      options: ["Samen minstens acht kaarten in een kleur", "Zelf precies vijf kaarten in een kleur", "Samen minstens acht HCP"],
      answer: "Samen minstens acht kaarten in een kleur",
      feedback: "Precies. Fit gaat over gezamenlijke lengte in een kleur."
    },
    {
      question: "Wanneer ga je herwaarderen met Fitpunten?",
      options: ["Nadat een Fit waarschijnlijk is", "Voordat je HCP telt", "Alleen bij sans-atout"],
      answer: "Nadat een Fit waarschijnlijk is",
      feedback: "Ja. Eerst HCP, daarna pas Fitpunten wanneer de bieding een Fit laat zien."
    },
    {
      question: "Hoe heet precies een kaart in een kleur?",
      options: ["Singleton", "Doubleton", "Renonce"],
      answer: "Singleton",
      feedback: "Goed. Een doubleton is twee kaarten; een renonce is nul."
    },
    {
      question: "Waarom is een Fit waardevol?",
      options: ["Troef kan controle en aftroevers geven", "Elke kaart wordt automatisch HCP", "Je hoeft geen kleur meer te bekennen"],
      answer: "Troef kan controle en aftroevers geven",
      feedback: "Klopt. Met een troeffit kunnen korte kleuren en extra troeven meer werk doen."
    },
    {
      question: "Wat is de eerste vraag bij Openingskracht?",
      options: ["Heb ik genoeg kracht om te openen?", "Welke kaart vind ik het mooist?", "Kan ik meteen slem bieden?"],
      answer: "Heb ik genoeg kracht om te openen?",
      feedback: "Precies. De eerste waardering is kracht plus verdeling, nog niet het hele eindcontract."
    }
  ];

  const fallbackHands = {
    exact12: "AS QS 7S KH 9H 4H QD 8D 3D JC 6C 5C 2C",
    balanced1517: "AS KS 8S 3S QH 7H 4H KD QD 6D JC 9C 2C",
    fitSingleton: "AS 8S 6S 4S 2S KH 9H 5H QD 7D 6D 2D 3C",
    rule20Intro: "KS QS 9S 7S 5S AH JH 8H 6H 4H 7D 3D 6C"
  };

  const raceHandTexts = [
    "AS QS 7S KH 9H 4H QD 8D 3D JC 6C 5C 2C",
    "AS TS 8S KH TH 6H QD JD 4D TC 9C 7C 3C",
    "AS KS 9S 7S 6S 4S QH 8H 2H 7D 5D 3D 4C",
    "KS 8S 4S AH QH 9H 7H 3H JD 6D 2D 8C 5C",
    "AS QS 8S KH 7H 4H AD 8D 6D 3D JC 9C 2C",
    "KS QS 9S 7S 5S AH JH 8H 6H 4H 7D 3D 6C",
    "AS 8S 6S 4S KH 9H 5H QD 7D 6D 2D 3C 2C",
    "QS 9S 3S 2S AH KH 8H 4H 2H AD TD 7D 5C",
    "AS KS QS 3S 2S 3H 2H 4C 3C AD QD 4D 3D",
    "AS KS 8S 3S QH 7H 4H KD QD 6D JC 9C 2C"
  ];

  function allValuationQuestions() {
    return valuationQuestions.map((question) => ({ ...question }));
  }

  function allMiniQuizQuestions() {
    return miniQuiz.map((question) => ({
      ...question,
      options: [...question.options]
    }));
  }

  function allFallbackHands() {
    return { ...fallbackHands };
  }

  function allRaceHandTexts() {
    return [...raceHandTexts];
  }

  return {
    allValuationQuestions,
    allMiniQuizQuestions,
    allFallbackHands,
    allRaceHandTexts
  };
});

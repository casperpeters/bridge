(function initBridgeLessons(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const practiceHands = isCommonJs ? require("../../practice-hands/index.js") : root.PracticeHands;
  const api = factory(practiceHands);
  if (isCommonJs) module.exports = api;
  root.BridgeLessons = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeLessons(practiceHands) {
  "use strict";

  const lessons = [
    {
      id: "les-01-wat-is-bridge",
      number: 1,
      title: "Wat is bridge?",
      challenge: "Win slagen samen met partner en ontdek hoe bieden, spelen en dummy bij elkaar horen.",
      summary: "Je leert het doel van bridge, de twee fasen van een hand, slagen winnen, kleur bekennen, troef en sans-atout, leider en dummy.",
      learningGoals: [
        "Je herkent Noord, Oost, Zuid en West en weet wie partners zijn.",
        "Je begrijpt dat een slag uit vier kaarten bestaat.",
        "Je weet dat het contract vertelt hoeveel slagen de leider moet maken.",
        "Je ziet wat troef doet en wat sans-atout betekent.",
        "Je weet wanneer dummy open komt en wie de kaarten van dummy speelt."
      ],
      focus: ["Spelen", "Bieden", "Dummy"],
      handIds: ["draw-trumps-001"],
      pageHref: "lesson-01-cards.html",
      startMode: "play",
      enableGuidance: true,
      intro: "Je hoeft nog niets te bieden. Deze missie start meteen bij het spelen: kijk wie uitkomt, wie dummy is en hoeveel slagen jullie samen pakken.",
      chapters: [
        {
          id: "kaarten-van-spelers",
          title: "De kaarten van de spelers",
          summary: "Iedere speler krijgt 13 kaarten; samen met je partner probeer je slagen te winnen.",
          pageHref: "lesson-01-cards.html",
          blocks: [
            { type: "paragraph", text: "Bridge speel je met vier spelers. Jij zit Zuid, je partner zit Noord, en Oost/West zijn de tegenstanders." },
            { type: "paragraph", text: "Iedere speler krijgt 13 kaarten. De kaarten blijven eerst verborgen, behalve dummy: die verschijnt pas na de eerste kaart van het spelen." }
          ]
        },
        {
          id: "windrichtingen",
          title: "Noord, Oost, Zuid en West",
          summary: "De tafel gebruikt windrichtingen om partners en beurten duidelijk te houden.",
          blocks: [
            { type: "paragraph", text: "Noord en Zuid vormen samen een paar. Oost en West vormen het andere paar." },
            { type: "list", items: ["Zuid ben jij.", "Noord is je partner.", "Links van Zuid zit West; rechts van Zuid zit Oost."] }
          ]
        },
        {
          id: "bieden-en-spelen",
          title: "De twee fasen",
          summary: "Een bridgehand heeft eerst bieden en daarna spelen.",
          blocks: [
            { type: "paragraph", text: "Fase 1 is bieden. De spelers zoeken uit welke speelsoort en hoeveel slagen haalbaar lijken." },
            { type: "paragraph", text: "Fase 2 is spelen. Dan probeer je met de kaarten zoveel slagen te winnen als nodig is." },
            { type: "callout", text: "Het laatste bod wordt het contract: de afspraak over speelsoort en aantal benodigde slagen." }
          ]
        },
        {
          id: "doel-van-bridge",
          title: "Het doel",
          summary: "Je paar probeert het contract te maken of juist te verslaan.",
          blocks: [
            { type: "paragraph", text: "Noord/Zuid spelen samen tegen Oost/West. Een paar probeert genoeg slagen te winnen voor het contract." },
            { type: "paragraph", text: "Ben je leider, dan probeer je het contract te maken. Ben je tegenspeler, dan probeer je te zorgen dat de leider te weinig slagen haalt." }
          ]
        },
        {
          id: "een-slag",
          title: "Een slag",
          summary: "Een slag is een rondje waarin iedere speler precies een kaart speelt.",
          blocks: [
            { type: "paragraph", text: "De speler die de slag begint, bepaalt de gevraagde kleur. Daarna spelen de andere spelers met de klok mee een kaart." },
            { type: "paragraph", text: "Wie de slag wint, begint de volgende slag. Er zijn 13 slagen, omdat iedere speler 13 kaarten heeft." }
          ],
          quiz: [
            {
              question: "Wat probeer je in bridge te winnen?",
              answer: "Slagen",
              options: ["Slagen", "Losse punten", "Alle harten"],
              feedback: "Ja. Een slag is een rondje waarin iedere speler precies een kaart speelt."
            },
            {
              question: "Wanneer komt dummy open op tafel?",
              answer: "Na de uitkomst",
              options: ["Voor het bieden", "Na de uitkomst", "Pas na slag 13"],
              feedback: "Precies. Eerst komt links van de leider uit; daarna zie je dummy."
            },
            {
              question: "Wie speelt de kaarten van dummy?",
              answer: "De leider",
              options: ["De leider", "Dummy zelf", "De speler links"],
              feedback: "Klopt. Dummy legt de kaarten open; de leider kiest de kaarten uit beide handen."
            }
          ]
        },
        {
          id: "speelsoorten",
          title: "Troef en SA",
          summary: "Een contract is met troef of zonder troef: sans-atout, ook NT genoemd.",
          blocks: [
            { type: "paragraph", text: "Bij een troefcontract is een van de vier kleuren troef. Als je geen gevraagde kleur meer hebt, mag je met troef de slag proberen te winnen." },
            { type: "paragraph", text: "Bij SA, sans-atout of NT, is er geen troef. Dan wint gewoon de hoogste kaart van de gevraagde kleur." },
            { type: "callout", text: "SA en NT betekenen hetzelfde: zonder troef." }
          ]
        },
        {
          id: "leider-en-dummy",
          title: "Leider en dummy",
          summary: "Na de uitkomst komt dummy open en speelt de leider twee handen.",
          blocks: [
            { type: "paragraph", text: "De speler die het contract voor zijn paar gaat spelen heet de leider. De partner van de leider heet dummy." },
            { type: "paragraph", text: "Eerst komt de speler links van de leider uit. Daarna legt dummy alle kaarten open op tafel." },
            { type: "paragraph", text: "Dummy kiest zelf geen kaarten. De leider kiest de kaarten uit de eigen hand en uit dummy." }
          ]
        },
        {
          id: "spelverloop",
          title: "Het spelverloop",
          summary: "Na elke slag begint de winnaar de volgende slag, tot alle 13 slagen gespeeld zijn.",
          blocks: [
            { type: "list", items: ["De uitkomer speelt de eerste kaart.", "Dummy komt open.", "Iedere speler speelt een kaart en moet kleur bekennen als dat kan.", "De hoogste kaart van de gevraagde kleur wint, behalve als iemand troeft.", "De winnaar begint de volgende slag.", "Na 13 slagen zie je contract, resultaat en score."] }
          ]
        },
        {
          id: "bekennen-moet",
          title: "Bekennen moet",
          summary: "Als de gevraagde kleur in je hand zit, moet je een kaart van die kleur spelen.",
          handId: "draw-trumps-001",
          tableTask: {
            type: "card",
            completion: "northSouthCard",
            expectedAction: {
              type: "card",
              seat: "North",
              cardIds: ["5D"],
              retryTitle: "Bijna",
              retryBody: "Die kaart bekent wel ruiten, maar deze oefening zoekt de rustige lage ruiten. Probeer 5 ruiten.",
              hint: "Kies 5 ruiten om laag te bekennen."
            },
            doneTitle: "Kaart gekozen",
            doneBody: "Je hebt aan tafel een kaart gespeeld terwijl de gevraagde kleur zichtbaar was. Dat is precies het lesmoment.",
            returnLabel: "Terug naar les",
            retryLabel: "Nog eens proberen"
          },
          blocks: [
            { type: "paragraph", text: "Als iemand bijvoorbeeld harten vraagt en jij hebt harten, dan moet je harten spelen. Alleen als je die kleur niet hebt, mag je een andere kleur spelen." },
            { type: "callout", text: "De oefening start meteen in het spelen, zodat je beurten, dummy en kleur bekennen in een echt bord ziet." }
          ]
        }
      ],
      reviewFeedback: [
        "Je speelde een echt bord vanaf de uitkomst: vier spelers, vier kaarten per slag, dertien slagen totaal.",
        "Let vooral op het moment na de eerste kaart: dan verschijnt dummy en wordt de leider verantwoordelijk voor twee handen.",
        "De score is nu minder belangrijk dan het ritme: volgen van kleur, slagwinnaar zien, volgende slag starten."
      ],
      boardGuidance: [
        {
          id: "contractIntro",
          title: "Je speelt 4 schoppen",
          body: "Het contract is 4 schoppen door Zuid. Schoppen is troef en Noord/Zuid probeert genoeg slagen te maken.",
          badge: "Contract en troef",
          target: "contract",
          buttonLabel: "Start aan tafel",
          gate: "releaseAutoPlay"
        },
        {
          id: "openingLeadIntro",
          title: "Eerst komt West uit",
          body: "West zit links van de leider en speelt straks de eerste kaart. Die eerste kaart heet de uitkomst.",
          badge: "Uitkomst",
          target: "openingLead",
          buttonLabel: "Laat West uitkomen",
          gate: "releaseAutoPlay"
        },
        {
          id: "dummyReveal",
          title: "Dummy komt open",
          body: "Na de uitkomst komt Noord open op tafel. Noord is dummy.",
          badge: "Dummy",
          target: "dummy",
          buttonLabel: "Bekijk dummy",
          gate: "releaseAutoPlay"
        },
        {
          id: "declarerControlsDummy",
          title: "Jij speelt twee handen",
          body: "Zuid is leider. Jij kiest de kaarten uit Zuid en uit dummy Noord.",
          badge: "Leider en dummy",
          target: "declarerAndDummy",
          buttonLabel: "Ik speel beide handen",
          gate: "releaseAutoPlay"
        },
        {
          id: "trickMeaning",
          title: "Vier kaarten maken een slag",
          body: "Iedere speler speelt precies een kaart. Samen vormen die vier kaarten een slag.",
          badge: "Slag",
          target: "trickArea",
          buttonLabel: "Verder",
          gate: "releaseAutoPlay"
        },
        {
          id: "followSuit",
          title: "Bekennen moet",
          body: "Er is een kleur gevraagd. Als je die kleur hebt, moet je een kaart van die kleur spelen.",
          badge: "Bekennen",
          target: "legalCards",
          buttonLabel: "Ik ga bekennen",
          gate: "allowHumanPlay"
        },
        {
          id: "trumpMeaning",
          title: "Schoppen is troef",
          body: "Schoppenkaarten zijn troeven. Troef kan winnen als je de gevraagde kleur niet kunt bekennen.",
          badge: "Troef",
          target: "trumpCards",
          buttonLabel: "Verder spelen",
          gate: "allowHumanPlay"
        },
        {
          id: "trickWinner",
          title: "Wie wint de slag?",
          body: "De gemarkeerde speler won deze slag. De winnaar begint de volgende slag.",
          badge: "Slagwinnaar",
          target: "trickWinner",
          buttonLabel: "Volgende slag",
          gate: "advanceTrick"
        },
        {
          id: "reviewResult",
          title: "Terugkijken",
          body: "In de review zie je contract, leider, dummy, slagen, resultaat en score terug.",
          badge: "Review",
          target: "review",
          gate: "none"
        }
      ],
      teachingPoints: [
        "Een bridgebord bestaat uit 13 slagen; in elke slag speelt iedere speler precies een kaart.",
        "Als Noord/Zuid leider zijn, speel jij als Zuid ook de kaarten van dummy.",
        "Als een kleur gevraagd wordt en je hebt die kleur, moet je bekennen."
      ]
    },
    {
      id: "les-02-punten-en-handtypen",
      number: 2,
      title: "Kaarten waarderen",
      challenge: "Tel HCP, herken verdeling en ontdek wanneer een fit je hand later meer waard maakt.",
      summary: "Je leert HCP tellen, basisverdelingen herkennen, evenwichtige en onevenwichtige handen onderscheiden en begrijpen waarom een fit waardevol is.",
      learningGoals: [
        "Je telt HCP met Aas 4, Heer 3, Vrouw 2 en Boer 1.",
        "Je herkent een evenwichtige verdeling.",
        "Je ziet waarom lengte in een kleur belangrijk is.",
        "Je begrijpt fit als samen minstens acht kaarten in een kleur.",
        "Je maakt een eerste simpele keuze: pas, 1SA of een kleur openen."
      ],
      focus: ["Bieden", "HCP", "Fit"],
      handIds: ["one-nt-opening-001", "opening-pass-001", "one-heart-opening-001"],
      pageHref: "lesson-02-card-valuation.html",
      intro: "Deze les is een handpaspoort voor Zuid: eerst HCP, dan verdeling, langste kleur en pas daarna herwaarderen zodra een fit in beeld komt.",
      chapters: [
        {
          id: "hcp-tellen",
          title: "HCP tellen",
          summary: "Aas telt 4, Heer 3, Vrouw 2, Boer 1; de 10 is wel een honneur maar telt niet mee.",
          pageHref: "lesson-02-card-valuation.html",
          blocks: [
            { type: "paragraph", text: "HCP is de eerste snelle krachtmeter voordat je gaat bieden." },
            { type: "paragraph", text: "De losse lespagina bevat interactieve handen en feedback per antwoord." }
          ]
        },
        {
          id: "verdeling-en-fit",
          title: "Verdeling en fit",
          summary: "Je herkent 4-3-3-3, 4-4-3-2 en 5-3-3-2 als evenwichtig en ziet waarom korte kleuren later tellen.",
          pageHref: "lesson-02-card-valuation.html",
          blocks: [
            { type: "paragraph", text: "Een fit is samen minstens acht kaarten in een kleur." },
            { type: "callout", text: "Tel eerst HCP; herwaardeer pas wanneer een fit waarschijnlijk is." }
          ]
        },
        {
          id: "een-sa-opening-herkennen",
          title: "1SA-hand herkennen",
          summary: "15-17 HCP met een evenwichtige verdeling maakt 1SA de eerste kandidaat.",
          handId: "one-nt-opening-001",
          tableTask: {
            type: "bid",
            completion: "southBid",
            expectedAction: {
              type: "bid",
              seat: "South",
              calls: ["1NT"],
              retryTitle: "Nog niet",
              retryBody: "Deze hand heeft 15 HCP en is evenwichtig. In deze les zoek je daarom de 1SA-opening.",
              hint: "Kies 1SA."
            },
            doneTitle: "Bod gedaan",
            doneBody: "Zuid heeft de hand gewaardeerd en het eerste bod gekozen. Ga terug naar de les om dit handpaspoort naast de uitleg te leggen.",
            returnLabel: "Terug naar les",
            retryLabel: "Nog eens proberen"
          },
          boardGuidance: [
            {
              id: "valueThenBid",
              title: "Waardeer eerst Zuid",
              body: "Tel HCP, kijk of de verdeling evenwichtig is en kies daarna het openingsbod.",
              badge: "Openingskeuze",
              target: "bidControls",
              buttonLabel: "Ik kies mijn bod",
              gate: "allowHumanBid"
            }
          ],
          blocks: [
            { type: "paragraph", text: "Start deze oefenhand en tel voor het eerste bod de HCP van Zuid." }
          ]
        },
        {
          id: "openingskracht-of-pas",
          title: "Openingskracht of pas",
          summary: "Niet elke hand heeft genoeg kracht om te openen; passen kan de juiste actie zijn.",
          handId: "opening-pass-001",
          tableTask: {
            type: "bid",
            completion: "southBid",
            expectedAction: {
              type: "bid",
              seat: "South",
              calls: ["PASS"],
              retryTitle: "Rustiger",
              retryBody: "Zuid heeft te weinig openingskracht. In deze oefening is passen de bedoelde keuze.",
              hint: "Kies Pas."
            },
            doneTitle: "Keuze gemaakt",
            doneBody: "Zuid heeft gekozen of deze hand genoeg openingskracht heeft. Terug in de les kun je de HCP en verdeling nog eens vergelijken.",
            returnLabel: "Terug naar les",
            retryLabel: "Nog eens proberen"
          },
          boardGuidance: [
            {
              id: "openingStrengthChoice",
              title: "Openen of passen?",
              body: "Kijk alleen naar Zuid: heeft deze hand genoeg kracht om te openen, of is passen rustiger?",
              badge: "Openingskracht",
              target: "bidControls",
              buttonLabel: "Ik maak mijn keuze",
              gate: "allowHumanBid"
            }
          ],
          blocks: [
            { type: "paragraph", text: "Vergelijk deze hand met de HCP- en verdelingsvragen uit de les." }
          ]
        }
      ]
    },
    {
      id: "les-03-eerste-openingen",
      number: 3,
      title: "Eerste openingen",
      challenge: "Open met een vijfkaart hoog wanneer je genoeg kracht hebt.",
      focus: ["Bieden", "Opening"],
      handIds: ["one-heart-opening-001"]
    },
    {
      id: "les-04-fit-zoeken-na-hoog",
      number: 4,
      title: "Fit zoeken na 1 hoog",
      challenge: "Partner opent 1 schoppen. Ontdek of drie troeven genoeg steun zijn.",
      focus: ["Bieden", "Fit"],
      handIds: ["response-raise-after-1s-001"]
    },
    {
      id: "les-05-zonder-fit",
      number: 5,
      title: "Zonder fit: nieuwe kleur of SA",
      challenge: "Geen fit met partners harten? Toon je schoppen rustig op eenniveau.",
      focus: ["Bieden", "Antwoord"],
      handIds: ["response-new-suit-after-1h-001"]
    },
    {
      id: "les-06-lage-kleuren",
      number: 6,
      title: "Openingen in lage kleuren",
      challenge: "Na een lage-kleur opening kan een vierkaart hoog de volgende aanwijzing zijn.",
      focus: ["Bieden", "Hoge kleur"],
      handIds: ["minor-opening-find-major-001"]
    },
    {
      id: "les-07-contract-en-score",
      number: 7,
      title: "Contractdoelen en score",
      challenge: "Maak 4 harten en zie waarom kwetsbaar precies gemaakt 620 scoort.",
      focus: ["Score", "Manche"],
      handIds: ["game-bonus-vulnerable-001"]
    },
    {
      id: "les-08-leiderplan",
      number: 8,
      title: "Spelen als leider: maak een plan",
      challenge: "Maak het contract rustiger door eerst de troeven onder controle te krijgen.",
      focus: ["Speelplan", "Leider"],
      handIds: ["draw-trumps-001"]
    },
    {
      id: "les-09-dummy-en-tempo",
      number: 9,
      title: "Dummy en tempo",
      challenge: "Gebruik dummy op tijd voordat de kans verdwijnt.",
      focus: ["Speelplan", "Dummy"],
      handIds: ["discard-loser-on-winner-001"]
    },
    {
      id: "les-10-basis-tegenspel",
      number: 10,
      title: "Basis tegenspel",
      challenge: "Help partner door tegen een kleurcontract uit een honneurserie te starten.",
      focus: ["Verdediging", "Uitkomst"],
      handIds: ["lead-sequence-001"]
    },
    {
      id: "les-11-sa-vervolgen",
      number: 11,
      title: "1SA-vervolgen: Stayman en Jacoby",
      challenge: "Vraag naar een hoge kleur of draag je vijfkaart over.",
      focus: ["Bieden", "Conventie"],
      handIds: ["stayman-after-1nt-001"]
    },
    {
      id: "les-12-review-hele-spellen",
      number: 12,
      title: "Reviewles: hele spellen",
      challenge: "Speel een heel bord en gebruik de review om bieden, slagen en score terug te lezen.",
      focus: ["Review", "Hele hand"],
      handIds: ["game-bonus-vulnerable-001"]
    }
  ];

  function allLessons() {
    return lessons.map(cloneLesson);
  }

  function findLesson(id) {
    return allLessons().find((lesson) => lesson.id === id) || null;
  }

  function findLessonChapter(lessonId, chapterId) {
    const lesson = findLesson(lessonId);
    if (!lesson || !chapterId) return null;
    return lesson.chapters?.find((chapter) => chapter.id === chapterId) || null;
  }

  function tableTaskCompleted(task, context = {}) {
    if (!task) return false;
    const plays = allPlayedCards(context);
    const auction = Array.isArray(context.auction) ? context.auction : [];
    if (task.type === "bid") {
      if (task.completion === "southBid") return auction.some((call) => call.seat === "South");
      if (task.completion === "humanBid") return auction.some((call) => call.seat === "South");
      return auction.length > 0;
    }
    if (task.type === "card") {
      if (task.completion === "northSouthCard" || task.completion === "humanCard") {
        return plays.some((play) => play.seat === "North" || play.seat === "South");
      }
      return plays.length > 0;
    }
    if (task.type === "trick") {
      return Boolean(context.awaitingTrickAdvance || context.pendingTrickWinner || (context.trickHistory || []).length);
    }
    if (task.type === "review" || task.type === "hand") {
      return context.phase === "complete";
    }
    return false;
  }

  function tableTaskActionFeedback(task, action = {}) {
    const expected = task?.expectedAction;
    if (!expected) return null;
    if (expected.type && action.type && expected.type !== action.type) return null;
    if (expected.seat && action.seat && expected.seat !== action.seat) return null;

    const ok = expected.type === "bid"
      ? expectedBidMatches(expected, action.bid)
      : expected.type === "card"
        ? expectedCardMatches(expected, action.card)
        : true;
    if (ok) return null;

    return {
      title: expected.retryTitle || "Probeer nog eens",
      body: expected.retryBody || "Deze keuze is legaal, maar niet de bedoelde actie voor dit lesmoment. Probeer opnieuw.",
      hint: expected.hint || ""
    };
  }

  function expectedBidMatches(expected, bid) {
    const codes = normalizeList(expected.calls || expected.call || expected.bid);
    if (!codes.length) return true;
    const bidCode = callCode(bid);
    return codes.some((code) => normalizeCallCode(code) === bidCode);
  }

  function expectedCardMatches(expected, card) {
    if (!card) return false;
    const cardIds = normalizeList(expected.cardIds || expected.cards || expected.cardId);
    if (cardIds.length && !cardIds.includes(card.id)) return false;
    const suits = normalizeList(expected.suits || expected.suit);
    if (suits.length && !suits.includes(card.suit)) return false;
    return Boolean(cardIds.length || suits.length);
  }

  function normalizeList(value) {
    if (!value) return [];
    return (Array.isArray(value) ? value : [value]).map(String);
  }

  function callCode(bid) {
    if (!bid) return "";
    if (bid.type === "Pass") return "PASS";
    if (bid.type === "Double") return "X";
    if (bid.type === "Redouble") return "XX";
    if (bid.type === "Bid") return normalizeCallCode(`${bid.level}${bid.strain}`);
    return normalizeCallCode(bid.call || bid.code || "");
  }

  function normalizeCallCode(value) {
    return String(value || "")
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "")
      .replace(/SA$/, "NT")
      .replace(/^P$/, "PASS")
      .replace(/^PAS$/, "PASS");
  }

  function allPlayedCards(context) {
    const current = Array.isArray(context.currentTrick) ? context.currentTrick : [];
    const historical = Array.isArray(context.trickHistory)
      ? context.trickHistory.flatMap((trick) => Array.isArray(trick.cards) ? trick.cards : [])
      : [];
    return [...historical, ...current];
  }

  function validateLessons(practiceApi = practiceHands) {
    const ids = new Set();
    for (const lesson of lessons) {
      if (!lesson.id || ids.has(lesson.id)) throw new Error(`Invalid lesson id: ${lesson.id}`);
      ids.add(lesson.id);
      if (!lesson.title) throw new Error(`Lesson ${lesson.id} is missing a title`);
      if (!lesson.challenge) throw new Error(`Lesson ${lesson.id} is missing a challenge`);
      if (!Array.isArray(lesson.focus) || !lesson.focus.length) throw new Error(`Lesson ${lesson.id} is missing focus labels`);
      if (!Array.isArray(lesson.handIds) || !lesson.handIds.length) throw new Error(`Lesson ${lesson.id} is missing hand ids`);
      for (const handId of lesson.handIds) {
        if (!practiceApi?.findPracticeHand?.(handId)) {
          throw new Error(`Lesson ${lesson.id} refers to unknown practice hand ${handId}`);
        }
      }
      validateLessonChapters(lesson, practiceApi);
      validateBoardGuidance(lesson);
      validateTableTask(lesson.id, "lesson", lesson.tableTask);
      if (lesson.startMode === "play") {
        const scenario = practiceApi?.findPracticeHand?.(lesson.handIds[0]);
        if (!scenario?.expectedContract) throw new Error(`Lesson ${lesson.id} needs an expected contract for play start`);
      }
    }
    return lessons.length;
  }

  function init(options) {
    const {
      dialog,
      openButton,
      closeButton,
      list,
      startLesson,
      closeMenu,
      labels = {}
    } = options;

    renderLessonList({ list, startLesson, labels, dialog });

    openButton?.addEventListener("click", () => {
      closeMenu?.();
      renderLessonList({ list, startLesson, labels, dialog });
      openDialog(dialog);
      closeButton?.focus();
    });
    closeButton?.addEventListener("click", () => closeDialog(dialog));
    dialog?.addEventListener("click", (event) => {
      if (event.target === dialog) closeDialog(dialog);
    });
  }

  function renderLessonList({ list, startLesson, labels, dialog }) {
    if (!list) return;
    list.innerHTML = "";
    list.dataset.view = "overview";
    lessons.forEach((lesson) => {
      const card = document.createElement("article");
      card.className = "lesson-card";
      if (lesson.number === 1) card.classList.add("lesson-card-featured");

      const number = document.createElement("span");
      number.className = "lesson-number";
      number.textContent = String(lesson.number);

      const heading = document.createElement("h3");
      heading.textContent = lesson.title;

      const challenge = document.createElement("p");
      challenge.className = "lesson-challenge";
      challenge.textContent = lesson.challenge;

      const focus = document.createElement("div");
      focus.className = "lesson-focus";
      lesson.focus.forEach((label) => {
        const pill = document.createElement("span");
        pill.className = "lesson-focus-pill";
        pill.textContent = label;
        focus.appendChild(pill);
      });

      const intro = lesson.intro ? document.createElement("p") : null;
      if (intro) {
        intro.className = "lesson-intro";
        intro.textContent = lesson.intro;
      }

      const action = document.createElement("button");
      action.type = "button";
      const hasDetail = Boolean(lesson.chapters?.length);
      action.className = hasDetail ? "lesson-view" : "lesson-start";
      action.textContent = hasDetail ? (labels.view || "Bekijk les") : (labels.start || "Start oefening");
      action.addEventListener("click", () => {
        if (hasDetail) {
          renderLessonDetail({ list, startLesson, labels, dialog, lessonId: lesson.id });
          return;
        }
        startLessonFromHand({ lesson, handId: lesson.handIds[0], startLesson, dialog });
      });

      card.append(number, heading, challenge, focus);
      if (intro) card.appendChild(intro);
      card.appendChild(action);
      list.appendChild(card);
    });
  }

  function renderLessonDetail({ list, startLesson, labels, dialog, lessonId }) {
    if (!list) return;
    const lesson = lessons.find((candidate) => candidate.id === lessonId);
    if (!lesson) return renderLessonList({ list, startLesson, labels, dialog });

    list.innerHTML = "";
    list.dataset.view = "detail";

    const detail = document.createElement("article");
    detail.className = "lesson-detail";

    const back = backButton(labels.backToLessons || "Alle lessen", () => {
      renderLessonList({ list, startLesson, labels, dialog });
    });

    const header = document.createElement("div");
    header.className = "lesson-detail-header";

    const number = document.createElement("span");
    number.className = "lesson-number";
    number.textContent = String(lesson.number);

    const heading = document.createElement("h3");
    heading.textContent = lesson.title;

    const challenge = document.createElement("p");
    challenge.className = "lesson-challenge";
    challenge.textContent = lesson.challenge;

    const intro = document.createElement("p");
    intro.className = "lesson-intro";
    intro.textContent = lesson.intro || "Werk de hoofdstukken door en start daarna de oefening.";

    const focus = lessonFocusEl(lesson.focus);
    header.append(number, heading, challenge, intro, focus);

    const chapters = document.createElement("div");
    chapters.className = "lesson-chapter-list";
    (lesson.chapters || []).forEach((chapter, index) => {
      const chapterButton = document.createElement("button");
      chapterButton.type = "button";
      chapterButton.className = "lesson-chapter-card";
      chapterButton.addEventListener("click", () => {
        renderLessonChapter({ list, startLesson, labels, dialog, lessonId: lesson.id, chapterId: chapter.id });
      });

      const chapterNumber = document.createElement("span");
      chapterNumber.className = "lesson-chapter-number";
      chapterNumber.textContent = String(index + 1);

      const text = document.createElement("span");
      text.className = "lesson-chapter-text";

      const title = document.createElement("strong");
      title.textContent = chapter.title;

      const summary = document.createElement("span");
      summary.textContent = chapter.summary || "";

      text.append(title, summary);
      chapterButton.append(chapterNumber, text);
      if (chapter.handId) {
        const practice = document.createElement("span");
        practice.className = "lesson-chapter-practice";
        practice.textContent = "Oefening";
        chapterButton.appendChild(practice);
      }
      chapters.appendChild(chapterButton);
    });

    detail.append(back, header, chapters);
    list.appendChild(detail);
    back.focus();
  }

  function renderLessonChapter({ list, startLesson, labels, dialog, lessonId, chapterId }) {
    if (!list) return;
    const lesson = lessons.find((candidate) => candidate.id === lessonId);
    const chapter = lesson?.chapters?.find((candidate) => candidate.id === chapterId);
    if (!lesson || !chapter) return renderLessonDetail({ list, startLesson, labels, dialog, lessonId });

    list.innerHTML = "";
    list.dataset.view = "chapter";

    const detail = document.createElement("article");
    detail.className = "lesson-detail lesson-chapter-detail";

    const back = backButton(labels.backToLesson || "Terug naar les", () => {
      renderLessonDetail({ list, startLesson, labels, dialog, lessonId: lesson.id });
    });

    const heading = document.createElement("h3");
    heading.textContent = chapter.title;

    const summary = document.createElement("p");
    summary.className = "lesson-challenge";
    summary.textContent = chapter.summary || "";

    detail.append(back, heading, summary);
    (chapter.blocks || []).forEach((block) => detail.appendChild(lessonBlockEl(block)));
    if (chapter.quiz?.length) detail.appendChild(miniQuizEl(chapter.quiz));

    if (chapter.handId) {
      const action = document.createElement("button");
      action.type = "button";
      action.className = "lesson-start";
      action.textContent = labels.startPractice || labels.start || "Start oefening";
      action.addEventListener("click", () => {
        startLessonFromHand({ lesson, handId: chapter.handId, chapter, startLesson, dialog });
      });
      detail.appendChild(action);
    }

    list.appendChild(detail);
    back.focus();
  }

  function startLessonFromHand({ lesson, handId, chapter = null, startLesson, dialog }) {
    startLesson?.(findLesson(lesson.id), handId, { chapterId: chapter?.id || null });
    closeDialog(dialog);
  }

  function backButton(label, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "lesson-back";
    button.textContent = label;
    button.addEventListener("click", onClick);
    return button;
  }

  function lessonFocusEl(labels) {
    const focus = document.createElement("div");
    focus.className = "lesson-focus";
    labels.forEach((label) => {
      const pill = document.createElement("span");
      pill.className = "lesson-focus-pill";
      pill.textContent = label;
      focus.appendChild(pill);
    });
    return focus;
  }

  function lessonBlockEl(block) {
    if (block.type === "list") {
      const list = document.createElement("ul");
      list.className = "lesson-chapter-points";
      (block.items || []).forEach((text) => {
        const item = document.createElement("li");
        item.textContent = text;
        list.appendChild(item);
      });
      return list;
    }
    const element = document.createElement(block.type === "callout" ? "aside" : "p");
    element.className = block.type === "callout" ? "lesson-chapter-callout" : "lesson-chapter-paragraph";
    element.textContent = block.text || "";
    return element;
  }

  function miniQuizEl(questions) {
    const wrapper = document.createElement("div");
    wrapper.className = "lesson-mini-quiz";
    questions.forEach((question, index) => {
      const item = document.createElement("div");
      item.className = "lesson-mini-question";

      const prompt = document.createElement("p");
      prompt.textContent = question.question;

      const options = document.createElement("div");
      options.className = "lesson-mini-options";

      const feedback = document.createElement("p");
      feedback.className = "lesson-mini-feedback";
      feedback.setAttribute("aria-live", "polite");

      question.options.forEach((option) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "lesson-mini-option";
        button.textContent = option;
        button.addEventListener("click", () => {
          item.querySelectorAll(".lesson-mini-option").forEach((optionButton) => optionButton.classList.remove("is-correct", "is-missed"));
          const correct = option === question.answer;
          button.classList.add(correct ? "is-correct" : "is-missed");
          feedback.textContent = correct ? question.feedback : `Bijna. Het beste antwoord is: ${question.answer}.`;
        });
        options.appendChild(button);
      });

      item.append(prompt, options, feedback);
      item.dataset.question = String(index + 1);
      wrapper.appendChild(item);
    });
    return wrapper;
  }

  function openDialog(dialog) {
    if (!dialog) return;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  function closeDialog(dialog) {
    if (!dialog) return;
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  }

  function cloneLesson(lesson) {
    return {
      ...lesson,
      focus: [...lesson.focus],
      handIds: [...lesson.handIds],
      chapters: (lesson.chapters || []).map(cloneChapter),
      miniQuiz: lesson.miniQuiz ? cloneQuiz(lesson.miniQuiz) : undefined,
      reviewFeedback: lesson.reviewFeedback ? [...lesson.reviewFeedback] : undefined,
      tableTask: lesson.tableTask ? cloneTableTask(lesson.tableTask) : undefined,
      boardGuidance: lesson.boardGuidance ? lesson.boardGuidance.map(cloneBoardGuidanceStep) : undefined,
      teachingPoints: lesson.teachingPoints ? [...lesson.teachingPoints] : undefined,
      learningGoals: lesson.learningGoals ? [...lesson.learningGoals] : undefined
    };
  }

  function cloneChapter(chapter) {
    return {
      ...chapter,
      blocks: (chapter.blocks || []).map((block) => ({
        ...block,
        items: block.items ? [...block.items] : undefined
      })),
      tableTask: chapter.tableTask ? cloneTableTask(chapter.tableTask) : undefined,
      boardGuidance: chapter.boardGuidance ? chapter.boardGuidance.map(cloneBoardGuidanceStep) : undefined,
      quiz: chapter.quiz ? cloneQuiz(chapter.quiz) : undefined
    };
  }

  function cloneTableTask(task) {
    return {
      ...task,
      expectedAction: task.expectedAction ? cloneExpectedAction(task.expectedAction) : undefined
    };
  }

  function cloneExpectedAction(action) {
    return {
      ...action,
      calls: action.calls ? [...action.calls] : undefined,
      cardIds: action.cardIds ? [...action.cardIds] : undefined,
      cards: action.cards ? [...action.cards] : undefined,
      suits: action.suits ? [...action.suits] : undefined
    };
  }

  function cloneQuiz(questions) {
    return questions.map((question) => ({
      ...question,
      options: [...question.options]
    }));
  }

  function cloneBoardGuidanceStep(step) {
    return { ...step };
  }

  function validateLessonChapters(lesson, practiceApi) {
    if (!lesson.chapters) return;
    if (!Array.isArray(lesson.chapters)) throw new Error(`Lesson ${lesson.id} chapters must be an array`);
    const ids = new Set();
    for (const chapter of lesson.chapters) {
      if (!chapter.id || ids.has(chapter.id)) throw new Error(`Lesson ${lesson.id} has an invalid chapter id`);
      ids.add(chapter.id);
      if (!chapter.title) throw new Error(`Lesson ${lesson.id} chapter ${chapter.id} is missing a title`);
      if (!chapter.summary) throw new Error(`Lesson ${lesson.id} chapter ${chapter.id} is missing a summary`);
      if (chapter.handId && !practiceApi?.findPracticeHand?.(chapter.handId)) {
        throw new Error(`Lesson ${lesson.id} chapter ${chapter.id} refers to unknown practice hand ${chapter.handId}`);
      }
      validateTableTask(lesson.id, chapter.id, chapter.tableTask);
      if (chapter.boardGuidance) validateBoardGuidance({ ...lesson, id: `${lesson.id} chapter ${chapter.id}`, boardGuidance: chapter.boardGuidance });
      if (chapter.quiz) validateQuiz(lesson.id, chapter.id, chapter.quiz);
    }
  }

  function validateQuiz(lessonId, chapterId, questions) {
    if (!Array.isArray(questions) || !questions.length) throw new Error(`Lesson ${lessonId} chapter ${chapterId} has an empty quiz`);
    questions.forEach((question, index) => {
      if (!question.question || !question.answer) throw new Error(`Lesson ${lessonId} chapter ${chapterId} quiz ${index + 1} is incomplete`);
      if (!Array.isArray(question.options) || !question.options.includes(question.answer)) {
        throw new Error(`Lesson ${lessonId} chapter ${chapterId} quiz ${index + 1} is missing the answer option`);
      }
    });
  }

  function validateBoardGuidance(lesson) {
    if (!lesson.boardGuidance) return;
    if (!Array.isArray(lesson.boardGuidance)) throw new Error(`Lesson ${lesson.id} boardGuidance must be an array`);
    const ids = new Set();
    const validTargets = new Set(["contract", "openingLead", "dummy", "declarerAndDummy", "trickArea", "legalCards", "trumpCards", "trickWinner", "review", "bidControls", "auctionLog", "lessonPanel"]);
    const validGates = new Set(["releaseAutoPlay", "allowHumanPlay", "allowHumanBid", "advanceTrick", "none"]);
    lesson.boardGuidance.forEach((step, index) => {
      if (!step.id || ids.has(step.id)) throw new Error(`Lesson ${lesson.id} boardGuidance step ${index + 1} has an invalid id`);
      ids.add(step.id);
      if (!step.title || !step.body || !step.badge) throw new Error(`Lesson ${lesson.id} boardGuidance step ${step.id} is incomplete`);
      if (!validTargets.has(step.target)) throw new Error(`Lesson ${lesson.id} boardGuidance step ${step.id} has unknown target ${step.target}`);
      if (!validGates.has(step.gate)) throw new Error(`Lesson ${lesson.id} boardGuidance step ${step.id} has unknown gate ${step.gate}`);
      if (step.gate !== "none" && !step.buttonLabel) throw new Error(`Lesson ${lesson.id} boardGuidance step ${step.id} needs a button label`);
    });
  }

  function validateTableTask(lessonId, ownerId, task) {
    if (!task) return;
    const validTypes = new Set(["bid", "card", "trick", "review", "hand"]);
    const validCompletions = new Set(["southBid", "humanBid", "northSouthCard", "humanCard", "trickWinnerShown", "reviewReached", "handComplete"]);
    if (!validTypes.has(task.type)) throw new Error(`Lesson ${lessonId} ${ownerId} tableTask has unknown type ${task.type}`);
    if (!validCompletions.has(task.completion)) throw new Error(`Lesson ${lessonId} ${ownerId} tableTask has unknown completion ${task.completion}`);
    if (!task.doneTitle || !task.doneBody || !task.returnLabel) throw new Error(`Lesson ${lessonId} ${ownerId} tableTask is incomplete`);
    validateExpectedAction(lessonId, ownerId, task);
  }

  function validateExpectedAction(lessonId, ownerId, task) {
    const expected = task.expectedAction;
    if (!expected) return;
    if (expected.type !== task.type) throw new Error(`Lesson ${lessonId} ${ownerId} expectedAction type must match tableTask type`);
    if (expected.type === "bid" && !normalizeList(expected.calls || expected.call || expected.bid).length) {
      throw new Error(`Lesson ${lessonId} ${ownerId} bid expectedAction needs calls`);
    }
    if (expected.type === "card" && !normalizeList(expected.cardIds || expected.cards || expected.cardId || expected.suits || expected.suit).length) {
      throw new Error(`Lesson ${lessonId} ${ownerId} card expectedAction needs cardIds or suits`);
    }
    if (!expected.retryBody) throw new Error(`Lesson ${lessonId} ${ownerId} expectedAction needs retryBody`);
  }

  validateLessons();

  return {
    allLessons,
    findLesson,
    findLessonChapter,
    tableTaskActionFeedback,
    tableTaskCompleted,
    validateLessons,
    init
  };
});

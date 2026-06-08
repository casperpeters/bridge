(function initInteractiveSmb1Exercises(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.BridgeInteractiveSmb1Exercises = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createInteractiveSmb1Exercises() {
  "use strict";

  const supportedActionTypes = ["bid", "card"];
  const supportedActionTypeSet = new Set(supportedActionTypes);

  const exercises = [
    {
      id: "smb1-les02-directe-slagen-hartenboer",
      title: "Directe slagen herkennen",
      lessonId: "smb1-les02",
      learningGoalId: "smb1-les02-direct-tricks",
      order: 10,
      sourceHandId: "smb1-les02-directe-slagen-sa",
      startSeed: "situatieseed:eyJ2IjoxLCJzIjoic21iMS1sZXMwMi1kaXJlY3RlLXNsYWdlbi1zYSIsImIiOjEsImQiOiJTIiwidSI6Im5vbmUiLCJwIjoicGxheWluZyIsInQiOiJTIiwieCI6IjFOVCIsInIiOiJTIiwibSI6Ik4iLCJsIjoiVyIsImEiOltdLCJrIjpbXSwiYyI6W1siVyIsIktIIl0sWyJOIiwiMkgiXSxbIkUiLCI4SCJdXSwidyI6MH0",
      question: "West heeft harten heer voorgespeeld en iedereen heeft bekend. Welke kaart speel je als Zuid?",
      expectedAction: {
        type: "card",
        seat: "South",
        cardIds: ["AH"],
        ruleId: "cheapestWinner"
      },
      expectedActionLabel: "Speel A harten",
      feedback: {
        correct: "Ja. Harten aas is de enige kaart van Zuid die hoger is dan harten heer. Daarmee maak je nu direct een slag.",
        wrong: "Kijk alleen naar de hartenkaarten in deze slag. Wests heer ligt voor; een lagere hartenkaart van Zuid kan die slag niet winnen.",
        wrongByChoice: {
          "4H": "Harten 4 bekent wel kleur, maar wint niet van harten heer.",
          "3H": "Harten 3 bekent wel kleur, maar wint niet van harten heer."
        }
      },
      engineExpectation: {
        kind: "expectedCardPlay",
        scenarioId: "smb1-les02-directe-slagen-sa",
        ruleId: "cheapestWinner",
        cardId: "AH"
      }
    },
    {
      id: "smb1-les02-hoge-kaart-wegspelen-klaveren",
      title: "Klaverenkeuze in dummy",
      lessonId: "smb1-les02",
      learningGoalId: "smb1-les02-drive-out-high-cards",
      order: 20,
      sourceHandId: "smb1-les02-hoge-kaart-wegspelen-sa",
      startSeed: "situatieseed:eyJ2IjoxLCJzIjoic21iMS1sZXMwMi1ob2dlLWthYXJ0LXdlZ3NwZWxlbi1zYSIsImIiOjEsImQiOiJTIiwidSI6Im5vbmUiLCJwIjoicGxheWluZyIsInQiOiJOIiwieCI6IjNOVCIsInIiOiJTIiwibSI6Ik4iLCJsIjoiVyIsImEiOltdLCJrIjpbW1siVyIsIjJIIl0sWyJOIiwiM0giXSxbIkUiLCI5SCJdLFsiUyIsIkFIIl1dXSwiYyI6W1siUyIsIjdDIl0sWyJXIiwiMkMiXV0sInciOjB9",
      question: "Zuid heeft laag klaveren naar dummy gespeeld en West bekende laag. Welke klaverenkaart speel je in dummy?",
      expectedAction: {
        type: "card",
        seat: "North",
        cardIds: ["KC", "QC"],
        ruleId: "playPlan.forceOutAce"
      },
      expectedActionLabel: "Speel een hoge klaverenhonneur",
      feedback: {
        correct: "Ja. Met een hoge klaverenhonneur dwing je de aas eruit of maak je later de overgebleven honneur.",
        wrong: "Een lage klaverenkaart werkt de hoge kaart van de tegenpartij niet weg. Speel een honneur uit de reeks.",
        wrongByChoice: {
          "4C": "Klaveren 4 houdt heer en vrouw vast, maar ontwikkelt nu nog geen slag."
        }
      },
      engineExpectation: {
        kind: "playPlanCard",
        scenarioId: "smb1-les02-hoge-kaart-wegspelen-sa",
        ruleId: "playPlan.forceOutAce",
        cardId: "KC",
        seat: "North"
      }
    },
    {
      id: "smb1-les06-deblokkeren-derde-hand-ks",
      title: "Deblokkeren in de derde hand",
      lessonId: "smb1-les06",
      learningGoalId: "smb1-les06-unblock",
      order: 10,
      sourceHandId: "smb1-les06-deblokkeren-derde-hand",
      startSeed: "situatieseed:eyJ2IjoxLCJzIjoic21iMS1sZXMwNi1kZWJsb2trZXJlbi1kZXJkZS1oYW5kIiwiYiI6MSwiZCI6IlciLCJ1Ijoibm9uZSIsInAiOiJwbGF5aW5nIiwidCI6IlMiLCJ4IjoiM05UIiwiciI6IlciLCJtIjoiRSIsImwiOiJOIiwiYSI6W10sImsiOltdLCJjIjpbWyJOIiwiUVMiXSxbIkUiLCIyUyJdXSwidyI6MH0",
      question: "Partner komt uit met schoppen vrouw. Welke schoppenkaart speel je als Zuid?",
      expectedAction: {
        type: "card",
        seat: "South",
        cardIds: ["KS"],
        ruleId: "thirdHandUnblockHonor"
      },
      expectedActionLabel: "Speel K schoppen",
      feedback: {
        correct: "Ja. Met heer-klein speel je de heer meteen, zodat partners schoppenkleur later niet blokkeert.",
        wrong: "Kijk opnieuw naar partners uitkomst. Met een korte honneur in partners kleur moet je deblokkeren.",
        wrongByChoice: {
          "7S": "De 7 schoppen houdt je heer vast. Daardoor kan partners lange schoppenkleur later vastlopen."
        }
      },
      engineExpectation: {
        kind: "expectedCardPlay",
        scenarioId: "smb1-les06-deblokkeren-derde-hand",
        ruleId: "thirdHandUnblockHonor",
        cardId: "KS"
      }
    },
    {
      id: "smb1-les07-openen-1sa-gebalanceerd",
      title: "Openen met 1SA",
      lessonId: "smb1-les07",
      learningGoalId: "smb1-les07-one-notrump-opening",
      order: 10,
      sourceHandId: "smb1-les07-openen-1sa",
      startSeed: "situatieseed:eyJ2IjoxLCJzIjoic21iMS1sZXMwNy1vcGVuZW4tMXNhIiwiYiI6MSwiZCI6IlMiLCJ1Ijoibm9uZSIsInAiOiJiaWRkaW5nIiwidCI6IlMiLCJhIjpbXSwiayI6W10sImMiOltdLCJ3IjowfQ",
      question: "Je hebt een gebalanceerde 15-17-punter. Wat open je als Zuid?",
      expectedAction: {
        type: "bid",
        seat: "South",
        calls: ["1NT"],
        ruleId: "fiveCardHigh.opening.oneNotrump"
      },
      expectedActionLabel: "Open 1SA",
      feedback: {
        correct: "Ja. Een gebalanceerde 15-17-punter open je in dit systeem met 1SA.",
        wrong: "Tel de honneurpunten en kijk naar de verdeling: deze hand past precies in de 1SA-opening.",
        wrongByChoice: {
          "1S": "Ook met vijf schoppen gaat 1SA hier voor: de hand is gebalanceerd en zit in de 15-17-range.",
          PASS: "Met 15-17 punten heb je duidelijk genoeg kracht om te openen."
        }
      },
      engineExpectation: {
        kind: "expectedAuction",
        scenarioId: "smb1-les07-openen-1sa",
        index: 0,
        ruleId: "fiveCardHigh.opening.oneNotrump"
      }
    },
    {
      id: "smb1-les07-passen-zonder-opening-pass",
      title: "Passen zonder opening",
      lessonId: "smb1-les07",
      learningGoalId: "smb1-les07-pass-without-opening",
      order: 20,
      sourceHandId: "smb1-les07-passen-zonder-opening",
      startSeed: "situatieseed:eyJ2IjoxLCJzIjoic21iMS1sZXMwNy1wYXNzZW4tem9uZGVyLW9wZW5pbmciLCJiIjoxLCJkIjoiUyIsInUiOiJub25lIiwicCI6ImJpZGRpbmciLCJ0IjoiUyIsImEiOltdLCJrIjpbXSwiYyI6W10sInciOjB9",
      question: "Je hand heeft geen opening. Wat doe je als Zuid?",
      expectedAction: {
        type: "bid",
        seat: "South",
        calls: ["PASS"],
        ruleId: "fiveCardHigh.pass.openingNoAction"
      },
      expectedActionLabel: "Pas",
      feedback: {
        correct: "Ja. Zonder openingskracht en zonder bijzondere verdeling begin je rustig met pas.",
        wrong: "Tel de honneurpunten opnieuw. Deze hand is nog geen opening waard.",
        wrongByChoice: {
          "1S": "Voor een 1 schoppen-opening mis je hier openingskracht.",
          "1NT": "1SA vraagt een gebalanceerde 15-17-punter. Deze hand is te zwak."
        }
      },
      engineExpectation: {
        kind: "expectedAuction",
        scenarioId: "smb1-les07-passen-zonder-opening",
        index: 0,
        ruleId: "fiveCardHigh.pass.openingNoAction"
      }
    },
    {
      id: "smb1-les09-zonder-fit-1sa-antwoord-1nt",
      title: "Zonder fit: antwoord 1SA",
      lessonId: "smb1-les09",
      learningGoalId: "smb1-les09-one-notrump-dustbin",
      order: 10,
      sourceHandId: "smb1-les09-zonder-fit-1sa",
      startSeed: "situatieseed:eyJ2IjoxLCJzIjoic21iMS1sZXMwOS16b25kZXItZml0LTFzYSIsImIiOjEsImQiOiJOIiwidSI6Im5vbmUiLCJwIjoiYmlkZGluZyIsInQiOiJTIiwiYSI6W1siTiIsIjFTIl0sWyJFIiwiUCJdXSwiayI6W10sImMiOltdLCJ3IjowfQ",
      question: "Partner opent 1 schoppen en Oost past. Je hebt geen fit. Wat bied je?",
      expectedAction: {
        type: "bid",
        seat: "South",
        calls: ["1NT"],
        ruleId: "fiveCardHigh.response.notrump"
      },
      expectedActionLabel: "Bied 1SA",
      feedback: {
        correct: "Ja. Zonder schoppenfit en zonder beter bod is 1SA het rustige bijbod.",
        wrong: "Kijk opnieuw naar fit en biedbare eigen kleuren. Met 6-9 punten heb je hier nog een bijbod.",
        wrongByChoice: {
          PASS: "Met 6-9 punten pas je hier niet direct: partner mag nog informatie verwachten.",
          "2S": "Voor 2 schoppen heb je steun nodig. Deze hand heeft geen driekaart schoppen."
        }
      },
      engineExpectation: {
        kind: "expectedAuction",
        scenarioId: "smb1-les09-zonder-fit-1sa",
        index: 2,
        ruleId: "fiveCardHigh.response.notrump"
      }
    }
  ];

  function cloneExercises(list = exercises) {
    return JSON.parse(JSON.stringify(list));
  }

  function actionType(exercise) {
    return textValue(exercise?.expectedAction?.type || exercise?.actionType);
  }

  function correctAnswers(exercise) {
    const expected = exercise?.expectedAction || {};
    const values = expected.type === "bid"
      ? listValues(expected.calls || expected.call || expected.bid)
      : expected.type === "card"
        ? listValues(expected.cardIds || expected.cards || expected.cardId)
        : [];
    return values.length ? values : listValues(exercise?.correctAnswers);
  }

  function normalizeExercise(exercise) {
    const normalized = {
      ...exercise,
      actionType: actionType(exercise),
      correctAnswers: correctAnswers(exercise)
    };
    if (exercise?.expectedAction) normalized.expectedAction = { ...exercise.expectedAction };
    if (exercise?.feedback) normalized.feedback = cloneExercises([exercise.feedback])[0];
    return normalized;
  }

  function isVisibleExercise(exercise) {
    const normalized = normalizeExercise(exercise);
    return Boolean(
      textValue(normalized.startSeed) &&
      textValue(normalized.question) &&
      supportedActionTypeSet.has(normalized.actionType) &&
      normalized.correctAnswers.some(textValue)
    );
  }

  function visibleExercises(list = exercises) {
    return cloneExercises(list.filter(isVisibleExercise).map(normalizeExercise)).sort(compareExercises);
  }

  function findExercise(id) {
    const normalized = textValue(id);
    const found = exercises.find((exercise) => exercise.id === normalized);
    return found ? cloneExercises([normalizeExercise(found)])[0] : null;
  }

  function findVisibleExercise(id) {
    const normalized = textValue(id);
    return visibleExercises().find((exercise) => exercise.id === normalized) || null;
  }

  function exercisesForLearningGoal(learningGoalId) {
    const normalized = textValue(learningGoalId);
    return visibleExercises().filter((exercise) => exercise.learningGoalId === normalized);
  }

  function exercisesForLesson(lessonId) {
    const normalized = textValue(lessonId);
    return visibleExercises().filter((exercise) => exercise.lessonId === normalized);
  }

  function compareExercises(a, b) {
    return Number(a.order || 0) - Number(b.order || 0) || a.id.localeCompare(b.id, "nl");
  }

  function listValues(value) {
    if (!value) return [];
    return (Array.isArray(value) ? value : [value]).map(textValue).filter(Boolean);
  }

  function textValue(value) {
    if (value === null || value === undefined) return "";
    return String(value).trim();
  }

  return {
    exercises,
    supportedActionTypes,
    actionType,
    cloneExercises,
    correctAnswers,
    exercisesForLearningGoal,
    exercisesForLesson,
    findExercise,
    findVisibleExercise,
    isVisibleExercise,
    normalizeExercise,
    visibleExercises
  };
});

(function initBridgeMiniEndPositionExercises(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.BridgeMiniEndPositionExercises = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeMiniEndPositionExercises() {
  "use strict";

  const exercises = [
    {
      id: "mini-smb1-les01-schoppen-aas-eerst",
      lessonId: "smb1-les01",
      learningGoalId: "smb1-les01-trick-definition-and-winner",
      order: 10,
      mode: "lead-and-predict",
      question: "Sans-atout. Dummy ligt open. Kies de startkaart en voorspel hoeveel slagen Zuid zelf maakt.",
      situation: {
        player: "South",
        declarer: "East",
        dummy: "West",
        leader: "South",
        nextToPlay: "South",
        trump: null,
        visibility: "dummy",
        hands: {
          South: ["AS", "2S"],
          West: ["KS", "QS"],
          North: ["2H", "3H"],
          East: ["2D", "3D"]
        }
      },
      explanation: {
        correct: "Begin met schoppen aas. Daarmee wint Zuid meteen een slag.",
        why: "In sans-atout wint de hoogste kaart in de gevraagde kleur. Schoppen aas is hoger dan dummy's schoppen heer en vrouw.",
        commonMistake: "Beginnen met schoppen 2 geeft de eerste slag weg; Zuid maakt dan later nog wel het aas, maar niet de eerste slag."
      }
    }
  ];

  const seats = ["North", "East", "South", "West"];
  const supportedModes = ["lead-and-predict"];
  const supportedModeSet = new Set(supportedModes);
  const seatCodes = { North: "N", East: "E", South: "S", West: "W" };
  const seatAliases = {
    N: "North",
    NORTH: "North",
    NOORD: "North",
    E: "East",
    EAST: "East",
    OOST: "East",
    S: "South",
    SOUTH: "South",
    ZUID: "South",
    W: "West",
    WEST: "West"
  };
  const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"];
  const suits = ["C", "D", "H", "S"];
  const suitSet = new Set(suits);
  const deckIds = new Set(createDeckIds());

  function cloneExercises(list = exercises) {
    return list.map((exercise) => JSON.parse(JSON.stringify(exercise)));
  }

  function visibleExercises(list = exercises) {
    return cloneExercises(list)
      .filter((exercise) => isVisibleExercise(exercise))
      .map((exercise) => normalizeMiniEndPositionExercise(exercise))
      .sort(compareExercises);
  }

  function findExercise(id) {
    const normalized = textValue(id);
    const found = exercises.find((exercise) => exercise.id === normalized);
    return found ? normalizeMiniEndPositionExercise(found) : null;
  }

  function findVisibleExercise(id) {
    return visibleExercises().find((exercise) => exercise.id === textValue(id)) || null;
  }

  function isVisibleExercise(exercise) {
    try {
      normalizeMiniEndPositionExercise(exercise);
      return true;
    } catch {
      return false;
    }
  }

  function exercisesForLearningGoal(learningGoalId, list = exercises) {
    const normalized = textValue(learningGoalId);
    return visibleExercises(list)
      .filter((exercise) => exercise.learningGoalId === normalized)
      .sort(compareExercises);
  }

  function validateMiniEndPositionExercises(list = exercises, options = {}) {
    const ids = new Set();
    const lessonLookup = createLessonLookup(options.course);

    for (const exercise of list || []) {
      const normalized = normalizeMiniEndPositionExercise(exercise);
      if (ids.has(normalized.id)) throw new Error(`Duplicate mini end-position exercise id: ${normalized.id}`);
      ids.add(normalized.id);

      if (lessonLookup) {
        const lesson = lessonLookup.get(normalized.lessonId);
        if (!lesson) {
          throw new Error(`Mini end-position exercise ${normalized.id} references unknown lesson ${normalized.lessonId}`);
        }
        const hasLearningGoal = (lesson.learningGoals || []).some((goal) => goal.id === normalized.learningGoalId);
        if (!hasLearningGoal) {
          throw new Error(`Mini end-position exercise ${normalized.id} references unknown learning goal ${normalized.learningGoalId}`);
        }
      }
    }

    return ids.size;
  }

  function normalizeMiniEndPositionExercise(exercise) {
    const id = requiredText(exercise?.id, "Mini end-position exercise is missing an id");
    const lessonId = requiredText(exercise?.lessonId, `Mini end-position exercise ${id} is missing a lessonId`);
    const learningGoalId = requiredText(exercise?.learningGoalId, `Mini end-position exercise ${id} is missing a learningGoalId`);
    const mode = requiredText(exercise?.mode, `Mini end-position exercise ${id} is missing a mode`);
    if (!supportedModeSet.has(mode)) {
      throw new Error(`Mini end-position exercise ${id} has unsupported mode: ${mode}`);
    }

    const normalized = {
      id,
      lessonId,
      learningGoalId,
      order: Number.isFinite(Number(exercise.order)) ? Number(exercise.order) : 0,
      mode,
      exerciseType: "mini-end-position",
      routeLabel: "Mini-eindpositie",
      question: requiredText(exercise?.question, `Mini end-position exercise ${id} is missing a question`),
      situation: normalizeMiniEndPositionSituation(exercise?.situation, id),
      explanation: normalizeExplanation(exercise?.explanation, id)
    };
    normalized.startSeed = createSituationSeed(normalized);
    return normalized;
  }

  function normalizeMiniEndPositionSituation(situation, exerciseId = "mini end-position exercise") {
    if (!situation || typeof situation !== "object") {
      throw new Error(`Mini end-position exercise ${exerciseId} is missing a situation`);
    }
    if (!Object.prototype.hasOwnProperty.call(situation, "trump")) {
      throw new Error(`Mini end-position exercise ${exerciseId} must explicitly set situation.trump`);
    }

    const player = normalizeSeat(situation.player);
    if (player !== "South") {
      throw new Error(`Mini end-position exercise ${exerciseId} must use South as player`);
    }

    const declarer = normalizeSeat(situation.declarer);
    const dummy = normalizeSeat(situation.dummy);
    if (dummy === "South") {
      throw new Error(`Mini end-position exercise ${exerciseId} cannot use South as dummy`);
    }
    if (partnerOf(declarer) !== dummy) {
      throw new Error(`Mini end-position exercise ${exerciseId} has dummy ${dummy} but declarer ${declarer}`);
    }

    const nextToPlay = normalizeSeat(situation.nextToPlay || situation.leader);
    if (nextToPlay !== "South") {
      throw new Error(`Mini end-position exercise ${exerciseId} must start with South to play`);
    }

    return {
      player,
      declarer,
      dummy,
      leader: nextToPlay,
      nextToPlay,
      trump: normalizeTrump(situation.trump, exerciseId),
      visibility: textValue(situation.visibility) || "dummy",
      hands: normalizeHands(situation.hands, exerciseId)
    };
  }

  function normalizeHands(hands, exerciseId) {
    if (!hands || typeof hands !== "object") {
      throw new Error(`Mini end-position exercise ${exerciseId} is missing situation.hands`);
    }

    const seen = new Set();
    const normalized = {};
    let expectedLength = null;

    for (const seat of seats) {
      const cards = hands[seat];
      if (!Array.isArray(cards)) {
        throw new Error(`Mini end-position exercise ${exerciseId} is missing cards for ${seat}`);
      }
      if (cards.length < 1 || cards.length > 7) {
        throw new Error(`Mini end-position exercise ${exerciseId} must contain 1 to 7 cards for ${seat}`);
      }
      if (expectedLength === null) expectedLength = cards.length;
      if (cards.length !== expectedLength) {
        throw new Error(`Mini end-position exercise ${exerciseId} must contain equal hand lengths`);
      }

      normalized[seat] = cards.map((value) => {
        const card = cardFromId(typeof value === "string" ? value : value?.id);
        if (seen.has(card.id)) throw new Error(`Mini end-position exercise ${exerciseId} contains duplicate card ${card.id}`);
        seen.add(card.id);
        return card;
      }).sort(compareCards);
    }

    return normalized;
  }

  function normalizeExplanation(explanation, exerciseId) {
    if (!explanation || typeof explanation !== "object") {
      throw new Error(`Mini end-position exercise ${exerciseId} is missing explanation`);
    }
    const correct = requiredText(explanation.correct, `Mini end-position exercise ${exerciseId} is missing explanation.correct`);
    const why = requiredText(explanation.why, `Mini end-position exercise ${exerciseId} is missing explanation.why`);
    const normalized = { correct, why };
    const commonMistake = textValue(explanation.commonMistake);
    if (commonMistake) normalized.commonMistake = commonMistake;
    return normalized;
  }

  function buildSituationPayload(exercise) {
    const situation = exercise?.situation || {};
    const trump = Object.prototype.hasOwnProperty.call(situation, "trump") ? situation.trump : null;
    return {
      v: 2,
      s: exercise.id,
      b: 1,
      d: seatCodes[situation.leader] || "S",
      u: "none",
      p: "playing",
      g: trump,
      t: seatCodes[situation.leader] || "S",
      x: trump ? `1${trump}` : "1NT",
      r: seatCodes[situation.declarer],
      m: seatCodes[situation.dummy],
      l: seatCodes[situation.leader],
      h: compactHands(situation.hands || {})
    };
  }

  function createSituationSeed(exercise) {
    return `situatieseed:${base64UrlEncode(JSON.stringify(buildSituationPayload(exercise)))}`;
  }

  function compactHands(hands) {
    return Object.fromEntries(seats.map((seat) => [seatCodes[seat], compactCards(hands[seat] || [])]));
  }

  function compactCards(cards) {
    return cards.map((card) => normalizeCardId(typeof card === "string" ? card : card?.id)).join("");
  }

  function normalizeCardId(value) {
    const id = String(value || "").trim().toUpperCase().replace(/^10/, "T");
    if (!deckIds.has(id)) throw new Error(`Invalid mini end-position card: ${value}`);
    return id;
  }

  function cardFromId(value) {
    const id = normalizeCardId(value);
    return {
      id,
      rank: id.slice(0, -1),
      suit: id.slice(-1)
    };
  }

  function normalizeTrump(value, exerciseId) {
    if (value === null) return null;
    const trump = String(value || "").trim().toUpperCase();
    if (!suitSet.has(trump)) throw new Error(`Mini end-position exercise ${exerciseId} has invalid trump: ${value}`);
    return trump;
  }

  function normalizeSeat(value) {
    const normalized = seatAliases[String(value || "").trim().toUpperCase()];
    if (!normalized) throw new Error(`Invalid mini end-position seat: ${value}`);
    return normalized;
  }

  function partnerOf(seat) {
    return seat === "North" ? "South" : seat === "South" ? "North" : seat === "East" ? "West" : "East";
  }

  function compareCards(a, b) {
    const suitDiff = ["S", "H", "C", "D"].indexOf(a.suit) - ["S", "H", "C", "D"].indexOf(b.suit);
    if (suitDiff) return suitDiff;
    return ranks.indexOf(b.rank) - ranks.indexOf(a.rank);
  }

  function createDeckIds() {
    return suits.flatMap((suit) => ranks.map((rank) => `${rank}${suit}`));
  }

  function createLessonLookup(course) {
    const lessons = Array.isArray(course?.lessons)
      ? course.lessons
      : Array.isArray(course)
        ? course
        : null;
    if (!lessons) return null;
    return new Map(lessons.map((lesson) => [lesson.id, lesson]));
  }

  function requiredText(value, message) {
    const text = textValue(value);
    if (!text) throw new Error(message);
    return text;
  }

  function textValue(value) {
    if (value === null || value === undefined) return "";
    return String(value).trim();
  }

  function compareExercises(left, right) {
    return Number(left.order || 0) - Number(right.order || 0) || left.id.localeCompare(right.id, "nl");
  }

  function base64UrlEncode(text) {
    if (typeof Buffer !== "undefined" && typeof Buffer.from === "function") {
      return Buffer.from(String(text), "utf8").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
    }
    return btoa(unescape(encodeURIComponent(String(text)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  return {
    cardFromId,
    cloneExercises,
    createDeckIds,
    createSituationSeed,
    exercises,
    exercisesForLearningGoal,
    findExercise,
    findVisibleExercise,
    isVisibleExercise,
    normalizeCardId,
    normalizeMiniEndPositionExercise,
    normalizeMiniEndPositionSituation,
    normalizeSeat,
    supportedModes,
    validateMiniEndPositionExercises,
    visibleExercises
  };
});

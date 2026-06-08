(function initPracticeHands(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const bridgeRules = isCommonJs ? require("../bridge-rules.js") : root.BridgeRules;
  const smb1Course = isCommonJs ? require("./smb1-course.js") : root.BridgeSmb1Course;
  const interactiveSmb1Exercises = isCommonJs ? require("./interactive-smb1-exercises.js") : root.BridgeInteractiveSmb1Exercises;
  const miniEndPositionExercises = isCommonJs ? require("./mini-end-position-exercises.js") : root.BridgeMiniEndPositionExercises;
  const catalogModel = isCommonJs ? require("./catalog-model.js") : root.PracticeCatalogModel;
  const collections = isCommonJs
    ? {
        fiveCardHighOpenings: require("./catalog/five-card-high-openings.js"),
        notrumpResponses: require("./catalog/notrump-responses.js"),
        basicBidding: require("./catalog/bidding-basic.js"),
        basicPlayPlan: require("./catalog/play-plan-basic.js"),
        basicDefense: require("./catalog/defense-basic.js"),
        basicScoring: require("./catalog/scoring-basic.js"),
        startMetBridge1: require("./catalog/start-met-bridge-1.js")
      }
    : root.PracticeHandCollections || {};
  const api = factory(bridgeRules, collections, catalogModel, smb1Course, interactiveSmb1Exercises, miniEndPositionExercises);
  if (isCommonJs) module.exports = api;
  root.PracticeHands = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createPracticeHands(bridgeRules, collections, catalogModel, smb1Course, interactiveSmb1Exercises, miniEndPositionExercises) {
  "use strict";

  if (!catalogModel) throw new Error("practice-hands/catalog-model.js must load before practice-hands/index.js");
  if (!smb1Course) throw new Error("practice-hands/smb1-course.js must load before practice-hands/index.js");
  if (!interactiveSmb1Exercises) throw new Error("practice-hands/interactive-smb1-exercises.js must load before practice-hands/index.js");
  if (!miniEndPositionExercises) throw new Error("practice-hands/mini-end-position-exercises.js must load before practice-hands/index.js");

  const seats = ["North", "East", "South", "West"];
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
  const vulnerabilities = new Set(["none", "NS", "EW", "both"]);
  const rankOrder = bridgeRules?.rankOrder || ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"];
  const suits = bridgeRules?.suits || ["C", "D", "H", "S"];
  const deckIds = new Set((bridgeRules?.createDeck?.() || []).map((card) => card.id));

  const collectionOrder = [
    "fiveCardHighOpenings",
    "notrumpResponses",
    "basicBidding",
    "basicPlayPlan",
    "basicDefense",
    "basicScoring",
    "startMetBridge1"
  ];
  const collectionMeta = {
    fiveCardHighOpenings: {
      id: "fiveCardHighOpenings",
      title: "Vijfkaart Hoog openingen",
      description: "Openingskeuzes zoals 1SA, vijfkaart hoog, lage kleur en pas."
    },
    notrumpResponses: {
      id: "notrumpResponses",
      title: "SA-vervolgen",
      description: "Stayman, Jacoby-transfers en sterke SA-vervolgen."
    },
    basicBidding: {
      id: "basicBidding",
      title: "Bieden basis",
      description: "Eerste bijboden, fit zoeken en kleine competitieve situaties."
    },
    basicPlayPlan: {
      id: "basicPlayPlan",
      title: "Speelplan basis",
      description: "Troef trekken, lengteslagen, introevers, afgooien en SA-plannen."
    },
    basicDefense: {
      id: "basicDefense",
      title: "Tegenspel basis",
      description: "Uitkomsten, tweede/derde hand en eenvoudige verdedigingskeuzes."
    },
    basicScoring: {
      id: "basicScoring",
      title: "Score basis",
      description: "Contractpunten, kwetsbaarheid en manchebonus."
    },
    startMetBridge1: {
      id: "start-met-bridge-1",
      title: "Start met Bridge 1",
      description: "Cursusgerichte oefenhanden per SMB1-les, met hergebruikte bronhanden waar mogelijk."
    }
  };
  const allPracticeHands = collectionOrder.flatMap((name) => collections[name] || []);
  const beginnerHands = allPracticeHands.filter((scenario) => scenario.level === "beginner");
  const handsById = new Map();

  for (const scenario of allPracticeHands) {
    if (!scenario?.id) throw new Error("Practice hand is missing an id");
    if (handsById.has(scenario.id)) throw new Error(`Duplicate practice hand id: ${scenario.id}`);
    handsById.set(scenario.id, scenario);
  }

  validatePracticeHands();
  validateInteractiveSmb1Exercises();
  validateMiniEndPositionExercises();

  function findPracticeHand(id) {
    return handsById.get(String(id || "").trim()) || null;
  }

  function preparePracticeHand(scenarioOrId) {
    const scenario = typeof scenarioOrId === "string" ? findPracticeHand(scenarioOrId) : scenarioOrId;
    if (!scenario) throw new Error(`Unknown practice hand: ${scenarioOrId}`);

    const prepared = cloneScenario(scenario);
    prepared.dealer = normalizeSeat(prepared.dealer);
    if (!vulnerabilities.has(prepared.vulnerability)) {
      throw new Error(`Practice hand ${prepared.id} has invalid vulnerability: ${prepared.vulnerability}`);
    }
    prepared.hands = normalizeHands(prepared.id, prepared.hands);
    return prepared;
  }

  function normalizeHands(scenarioId, hands) {
    const seen = new Set();
    const normalized = {};

    for (const seat of seats) {
      const ids = hands?.[seat];
      if (!Array.isArray(ids) || ids.length !== 13) {
        throw new Error(`Practice hand ${scenarioId} must contain 13 cards for ${seat}`);
      }
      normalized[seat] = ids.map((id) => {
        const card = cardFromId(id);
        if (seen.has(card.id)) throw new Error(`Practice hand ${scenarioId} contains duplicate card ${card.id}`);
        seen.add(card.id);
        return card;
      }).sort(compareCards);
    }

    if (seen.size !== 52) throw new Error(`Practice hand ${scenarioId} must contain exactly 52 unique cards`);
    return normalized;
  }

  function cardFromId(id) {
    const normalized = normalizeCardId(id);
    return {
      id: normalized,
      rank: normalized.slice(0, -1),
      suit: normalized.slice(-1)
    };
  }

  function normalizeCardId(id) {
    const normalized = String(id || "").trim().toUpperCase().replace(/^10/, "T");
    const rank = normalized.slice(0, -1);
    const suit = normalized.slice(-1);
    const validByParts = rankOrder.includes(rank) && suits.includes(suit);
    const validByDeck = deckIds.size === 0 || deckIds.has(normalized);
    if (!validByParts || !validByDeck) throw new Error(`Invalid card id: ${id}`);
    return normalized;
  }

  function normalizeSeat(seat) {
    const normalized = seatAliases[String(seat || "").trim().toUpperCase()];
    if (!normalized) throw new Error(`Invalid seat: ${seat}`);
    return normalized;
  }

  function callFromText(text) {
    const call = normalizeCallText(text);
    if (call === "PASS") return bridgeRules.Pass();
    if (call === "DOUBLE") return bridgeRules.Double();
    if (call === "REDOUBLE") return bridgeRules.Redouble();

    const match = call.match(/^([1-7])(C|D|H|S|NT)$/);
    if (!match) throw new Error(`Invalid call: ${text}`);
    return bridgeRules.Bid(Number(match[1]), match[2]);
  }

  function contractFromText(text) {
    const call = callFromText(text);
    if (!bridgeRules.isContractBid(call)) throw new Error(`Practice contract must be a bid: ${text}`);
    return call;
  }

  function normalizeCallText(text) {
    const call = String(text || "").trim().toUpperCase().replace(/\s+/g, "");
    if (call === "P" || call === "PAS") return "PASS";
    if (call === "X" || call === "DBL") return "DOUBLE";
    if (call === "XX" || call === "RDBL") return "REDOUBLE";
    return call.replace("SA", "NT");
  }

  function validatePracticeHands() {
    allPracticeHands.forEach(preparePracticeHand);
    return allPracticeHands.length;
  }

  function cloneScenario(scenario) {
    return JSON.parse(JSON.stringify(scenario));
  }

  function allCollections() {
    return collectionOrder
      .filter((name) => (collections[name] || []).length)
      .map((name) => ({
        ...(collectionMeta[name] || { id: name, title: name, description: "" }),
        key: name,
        hands: collections[name] || []
      }));
  }

  function findCollection(key) {
    const normalized = String(key || "").trim();
    return allCollections().find((collection) => collection.key === normalized || collection.id === normalized) || null;
  }

  function getPracticeCatalogs() {
    return allCollections();
  }

  function getPracticeCatalog(key) {
    return findCollection(key);
  }

  function createPracticeBrowserModel(catalogs = getPracticeCatalogs()) {
    return catalogModel.createPracticeBrowserModel(catalogs);
  }

  function filterPracticeHands(hands, filters) {
    return catalogModel.filterPracticeHands(hands, filters);
  }

  function getSmb1Course() {
    return smb1Course.cloneCourse ? smb1Course.cloneCourse() : cloneScenario(smb1Course.course);
  }

  function getSmb1Lessons() {
    return getSmb1Course().lessons;
  }

  function findSmb1Lesson(ref) {
    const found = smb1Course.findLesson ? smb1Course.findLesson(ref) : null;
    return found ? cloneScenario(found) : null;
  }

  function getInteractiveSmb1Exercises() {
    return interactiveSmb1Exercises.cloneExercises();
  }

  function getVisibleInteractiveSmb1Exercises() {
    return interactiveSmb1Exercises.visibleExercises();
  }

  function findInteractiveSmb1Exercise(id) {
    return interactiveSmb1Exercises.findExercise(id);
  }

  function findVisibleInteractiveSmb1Exercise(id) {
    return interactiveSmb1Exercises.findVisibleExercise(id);
  }

  function getInteractiveSmb1ExercisesForLearningGoal(learningGoalId) {
    return interactiveSmb1Exercises.exercisesForLearningGoal(learningGoalId);
  }

  function getMiniEndPositionExercises() {
    return miniEndPositionExercises?.cloneExercises
      ? miniEndPositionExercises.cloneExercises().map(prepareMiniEndPositionExercise)
      : [];
  }

  function getVisibleMiniEndPositionExercises() {
    if (!miniEndPositionExercises?.visibleExercises) return [];
    const visible = [];
    for (const exercise of miniEndPositionExercises.visibleExercises()) {
      try {
        const prepared = prepareMiniEndPositionExercise(exercise);
        if (miniEndPositionExerciseReferencesKnown(prepared) && hasValidMiniEndPositionSolution(prepared.solution)) {
          visible.push(prepared);
        }
      } catch {
        // Invalid mini exercises stay out of the player-facing route; tests call validation explicitly.
      }
    }
    return visible;
  }

  function findMiniEndPositionExercise(id) {
    const found = miniEndPositionExercises?.findExercise ? miniEndPositionExercises.findExercise(id) : null;
    return found ? prepareMiniEndPositionExercise(found) : null;
  }

  function findVisibleMiniEndPositionExercise(id) {
    const normalized = textValue(id);
    return getVisibleMiniEndPositionExercises().find((exercise) => exercise.id === normalized) || null;
  }

  function getMiniEndPositionExercisesForLearningGoal(learningGoalId) {
    return miniEndPositionExercises?.exercisesForLearningGoal
      ? miniEndPositionExercises.exercisesForLearningGoal(learningGoalId)
      : [];
  }

  function getVisibleMiniEndPositionExercisesForLearningGoal(learningGoalId) {
    const normalized = textValue(learningGoalId);
    return getVisibleMiniEndPositionExercises().filter((exercise) => exercise.learningGoalId === normalized);
  }

  function isVisibleMiniEndPositionExercise(exercise) {
    if (!miniEndPositionExercises?.isVisibleExercise || !miniEndPositionExercises.isVisibleExercise(exercise)) return false;
    try {
      const prepared = prepareMiniEndPositionExercise(exercise);
      return miniEndPositionExerciseReferencesKnown(prepared) && hasValidMiniEndPositionSolution(prepared.solution);
    } catch {
      return false;
    }
  }

  function prepareMiniEndPositionExercise(exerciseOrId) {
    if (!miniEndPositionExercises?.normalizeMiniEndPositionExercise) {
      throw new Error("practice-hands/mini-end-position-exercises.js must load before mini end-position exercises can be used");
    }
    const exercise = typeof exerciseOrId === "string" ? miniEndPositionExercises.findExercise(exerciseOrId) : exerciseOrId;
    if (!exercise) throw new Error(`Unknown mini end-position exercise: ${exerciseOrId}`);
    const normalized = miniEndPositionExercises.normalizeMiniEndPositionExercise(exercise);
    const solution = bridgeRules.analyzeMiniEndPosition({
      hands: normalized.situation.hands,
      trump: normalized.situation.trump,
      leader: normalized.situation.leader,
      playerSeat: "South"
    });
    return {
      ...normalized,
      solution
    };
  }

  function validateInteractiveSmb1Exercises() {
    const lessonById = new Map(getSmb1Course().lessons.map((lesson) => [lesson.id, lesson]));
    const ids = new Set();

    for (const exercise of interactiveSmb1Exercises.cloneExercises()) {
      const id = textValue(exercise.id);
      if (!id) throw new Error("Interactive SMB1 exercise is missing an id");
      if (ids.has(id)) throw new Error(`Duplicate interactive SMB1 exercise id: ${id}`);
      ids.add(id);

      const lesson = lessonById.get(textValue(exercise.lessonId));
      if (!lesson) throw new Error(`Interactive SMB1 exercise ${id} references unknown lesson ${exercise.lessonId}`);
      if (!lesson.learningGoals.some((learningGoal) => learningGoal.id === textValue(exercise.learningGoalId))) {
        throw new Error(`Interactive SMB1 exercise ${id} references unknown learning goal ${exercise.learningGoalId}`);
      }
      if (!findPracticeHand(exercise.sourceHandId)) {
        throw new Error(`Interactive SMB1 exercise ${id} references unknown practice hand ${exercise.sourceHandId}`);
      }
      if (!interactiveSmb1Exercises.isVisibleExercise(exercise)) {
        throw new Error(`Interactive SMB1 exercise ${id} is missing visible exercise data`);
      }
    }

    return ids.size;
  }

  function validateMiniEndPositionExercises() {
    if (!miniEndPositionExercises?.validateMiniEndPositionExercises) return 0;
    const count = miniEndPositionExercises.validateMiniEndPositionExercises(miniEndPositionExercises.exercises, {
      course: getSmb1Course()
    });
    miniEndPositionExercises.cloneExercises().forEach(prepareMiniEndPositionExercise);
    return count;
  }

  function miniEndPositionExerciseReferencesKnown(exercise) {
    const lesson = findSmb1Lesson(exercise?.lessonId);
    return Boolean(lesson?.learningGoals?.some((learningGoal) => learningGoal.id === textValue(exercise?.learningGoalId)));
  }

  function hasValidMiniEndPositionSolution(solution) {
    return Boolean(
      Number.isInteger(solution?.maxSouthTricks) &&
      solution.maxSouthTricks >= 0 &&
      Array.isArray(solution.optimalCardIds) &&
      solution.optimalCardIds.length > 0 &&
      Array.isArray(solution.line) &&
      solution.line.length > 0
    );
  }

  function textValue(value) {
    if (value === null || value === undefined) return "";
    return String(value).trim();
  }

  function compareCards(a, b) {
    return bridgeRules?.compareCards ? bridgeRules.compareCards(a, b) : 0;
  }

  return {
    allPracticeHands,
    beginnerHands,
    collectionOrder,
    collectionMeta,
    collections,
    allCollections,
    findCollection,
    getPracticeCatalogs,
    getPracticeCatalog,
    createPracticeBrowserModel,
    filterPracticeHands,
    getSmb1Course,
    getSmb1Lessons,
    findSmb1Lesson,
    getInteractiveSmb1Exercises,
    getVisibleInteractiveSmb1Exercises,
    findInteractiveSmb1Exercise,
    findVisibleInteractiveSmb1Exercise,
    getInteractiveSmb1ExercisesForLearningGoal,
    validateInteractiveSmb1Exercises,
    getMiniEndPositionExercises,
    getVisibleMiniEndPositionExercises,
    findMiniEndPositionExercise,
    findVisibleMiniEndPositionExercise,
    getMiniEndPositionExercisesForLearningGoal,
    getVisibleMiniEndPositionExercisesForLearningGoal,
    isVisibleMiniEndPositionExercise,
    prepareMiniEndPositionExercise,
    validateMiniEndPositionExercises,
    labelFromToken: catalogModel.labelFromToken,
    normalizeSearch: catalogModel.normalizeSearch,
    smb1CatalogId: catalogModel.smb1CatalogId,
    smb1CatalogKey: catalogModel.smb1CatalogKey,
    findPracticeHand,
    preparePracticeHand,
    validatePracticeHands,
    cardFromId,
    normalizeCardId,
    normalizeSeat,
    callFromText,
    contractFromText
  };
});

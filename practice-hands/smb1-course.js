(function initBridgeSmb1Course(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.BridgeSmb1Course = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeSmb1Course() {
  "use strict";

  const course = {
    id: "start-met-bridge-1",
    title: "Start met Bridge 1",
    lessons: [
      lesson(1, "Het bridgespel", [
        goal("cards-suits-ranks-honors", "Kaarten, kleuren, rangen en honneurs herkennen."),
        goal("players-and-directions", "De vier spelers en windrichtingen benoemen."),
        goal("bidding-and-play-phases", "Begrijpen dat bridge uit een biedfase en een speelfase bestaat."),
        goal("trick-definition-and-winner", "Begrijpen wat een slag is en hoe een slag wordt gewonnen."),
        goal("follow-suit", "Kleur bekennen herkennen als basisregel tijdens het spelen."),
        goal("notrump-vs-trump", "Het verschil herkennen tussen sans atout en spelen met troef."),
        goal("declarer-dummy-defenders", "Begrijpen wat leider, dummy en tegenspelers zijn."),
        goal("dummy-reveal", "Herkennen wanneer dummy zichtbaar wordt.")
      ]),
      lesson(2, "Slagen ontwikkelen en snijden", [
        goal("direct-tricks", "Directe slagen herkennen in een kleur."),
        goal("drive-out-high-cards", "Begrijpen dat hoge kaarten van de tegenpartij soms eerst moeten worden weggespeeld."),
        goal("develop-suit", "Slagen ontwikkelen door een kleur vrij te spelen."),
        goal("extra-tricks-later", "Herkennen wanneer een kleur later extra slagen kan opleveren."),
        goal("simple-finesse", "Een eenvoudige snit herkennen."),
        goal("finesse-missing-honor-position", "Begrijpen dat een snit afhankelijk is van de plek van een ontbrekende honneur."),
        goal("time-simple-finesse", "Een eenvoudige snit op het juiste moment toepassen.")
      ]),
      lesson(3, "Lengteslagen", [
        goal("length-tricks", "Lengteslagen herkennen in een lange kleur."),
        goal("low-cards-become-tricks", "Begrijpen dat lage kaarten slagen kunnen worden nadat hogere kaarten verdwenen zijn."),
        goal("develop-long-suit", "Een lange kleur ontwikkelen door de kleur meerdere keren te spelen."),
        goal("compare-simple-chances", "Eenvoudige kansen vergelijken."),
        goal("combine-chances", "Kansen combineren wanneer er meer dan een speelwijze mogelijk is."),
        goal("trumps-add-trick-power", "Begrijpen dat troeven extra slagkracht kunnen geven."),
        goal("ruff-for-extra-trick", "Herkennen wanneer introeven een extra slag kan opleveren.")
      ]),
      lesson(4, "Speelplan", [
        goal("plan-before-play", "Voor het spelen eerst een plan maken."),
        goal("notrump-count-sure-tricks", "In een sans-atoutcontract vaste slagen tellen."),
        goal("notrump-development-chances", "In een sans-atoutcontract ontwikkelkansen herkennen."),
        goal("notrump-entries", "In een sans-atoutcontract letten op entrees."),
        goal("trump-count-losers", "In een troefcontract verliezers tellen."),
        goal("draw-trumps-timing", "In een troefcontract bepalen wanneer troef trekken belangrijk is."),
        goal("ruffing-chances", "Introefmogelijkheden herkennen."),
        goal("order-play-actions", "De volgorde van speelacties afwegen voordat kaarten worden gespeeld.")
      ]),
      lesson(5, "Uitkomen", [
        goal("opening-lead-importance", "Begrijpen waarom de uitkomst belangrijk is voor het tegenspel."),
        goal("safe-lead-vs-notrump", "Tegen sans atout een veilige uitkomst kiezen."),
        goal("recognize-sequence-lead", "Uitkomen van een serie herkennen."),
        goal("lead-top-of-honor-sequence", "De hoogste kaart van een honneurserie kiezen."),
        goal("judge-long-suit-without-sequence", "Een lange kleur zonder serie beoordelen."),
        goal("short-suit-vs-trump", "Tegen troef een korte kleur als uitkomstmogelijkheid herkennen."),
        goal("sequence-or-safe-suit-vs-trump", "Tegen troef een serie of veilige kleur kiezen."),
        goal("notrump-vs-trump-leads", "Het verschil herkennen tussen uitkomen tegen sans atout en tegen troef.")
      ]),
      lesson(6, "Tegenspelen", [
        goal("repeat-opening-leads", "Uitkomstkeuzes uit les 5 herhalen."),
        goal("second-hand-low", "Tweede hand laag toepassen wanneer dat veilig is."),
        goal("cover-honor", "Herkennen wanneer een honneur op honneur gedekt moet worden."),
        goal("third-hand-high", "Derde man doet wat hij kan toepassen."),
        goal("partner-suit-high-card", "Begrijpen wanneer een hoge kaart de kleur van partner kan helpen."),
        goal("unblock", "Deblokkeren herkennen wanneer een hoge kaart partner niet mag blokkeren."),
        goal("defense-notrump-vs-trump", "Het verschil zien tussen tegenspelen tegen sans atout en tegen troef."),
        goal("watch-ruffing-chances", "Tegen troef letten op introefmogelijkheden van leider of dummy.")
      ]),
      lesson(7, "Het openingsbod", [
        goal("bidding-code-and-ladder", "De biedcode en biedladder begrijpen."),
        goal("contract", "Begrijpen wat een contract is."),
        goal("auction-sets-strain-level-declarer", "De biedfase herkennen als fase waarin de speelsoort, hoogte en leider worden bepaald."),
        goal("hcp-valuation", "Kaartwaardering gebruiken met honneurpunten."),
        goal("shape-in-opening", "Verdeling meenemen bij het kiezen van een opening."),
        goal("bidding-shares-information", "Begrijpen waarom bieden informatie uitwisselt met partner."),
        goal("one-level-opening", "Een opening op eenhoogte kiezen volgens de cursusafspraken."),
        goal("one-notrump-opening", "Een 1SA-opening herkennen volgens de cursusafspraken."),
        goal("pass-without-opening", "Passen wanneer de hand geen opening waard is.")
      ]),
      lesson(8, "Hoge-kleuropening met fit", [
        goal("recognize-fit-after-major-opening", "Na een 1H- of 1S-opening een fit herkennen."),
        goal("eight-card-fit", "Begrijpen waarom een achtkaartfit belangrijk is."),
        goal("first-response-with-fit", "Het eerste bijbod met fit kiezen."),
        goal("minimum-vs-stronger-support", "Onderscheid maken tussen minimale steun en sterkere steun."),
        goal("combine-partner-points", "Punten van beide partners samen inschatten."),
        goal("game-possibility", "Herkennen wanneer de manche mogelijk in beeld komt."),
        goal("major-as-trump", "Begrijpen waarom de hoge kleur vaak de gewenste troefkleur is.")
      ]),
      lesson(9, "Hoge-kleuropening zonder fit", [
        goal("no-fit-after-major-opening", "Herkennen wanneer er geen fit is na een hoge-kleuropening."),
        goal("pass-weak-hands-without-bid", "Zwakke handen passen wanneer er geen passend bod is."),
        goal("limited-response", "Een beperkt bijbod kiezen met een zwakke of matige hand."),
        goal("one-notrump-dustbin", "1SA als vuilnisbakkenbod herkennen."),
        goal("one-notrump-not-ideal-notrump", "Begrijpen dat 1SA na een hoge-kleuropening niet altijd een ideale sans-atouthand belooft."),
        goal("new-suit-only-when-allowed", "Een nieuwe kleur alleen bieden wanneer de hand en het biedniveau dat toelaten."),
        goal("opener-rebid-after-one-notrump", "Openaars herbieding na een 1SA-bijbod begrijpen.")
      ]),
      lesson(10, "Nieuwe kleur na hoge-kleuropening", [
        goal("new-suit-one-level", "Een nieuwe kleur op eenhoogte bieden wanneer dat mogelijk is."),
        goal("new-suit-two-level-strength", "Een nieuwe kleur op tweehoogte bieden wanneer de hand sterk genoeg is."),
        goal("new-suit-shows-length-strength", "Begrijpen dat een nieuwe kleur informatie geeft over lengte en kracht."),
        goal("lowest-fitting-call", "Voorkeur geven aan het laagste passende bod."),
        goal("opener-rebid-balanced", "Openaars herbieding begrijpen met een evenwichtige hand."),
        goal("opener-rebid-long-suit", "Openaars herbieding begrijpen met een lange eigen kleur."),
        goal("opener-rebid-two-suiter", "Openaars herbieding begrijpen met een tweekleurenspel."),
        goal("partner-has-not-promised-fit", "Herkennen wanneer partner nog geen fit heeft beloofd.")
      ]),
      lesson(11, "Lage-kleuropening en verder bieden", [
        goal("responses-after-minor-opening", "Antwoorden na een 1C- of 1D-opening."),
        goal("search-major-fit-after-minor", "Na een lage-kleuropening zoeken naar een hoge-kleurfit."),
        goal("bid-new-suit-when-possible", "Een nieuwe kleur bieden wanneer dat kan."),
        goal("alternative-when-no-new-suit", "Een alternatief kiezen wanneer geen nieuwe kleur mogelijk of wenselijk is."),
        goal("support-partners-minor", "Steun voor partners lage kleur herkennen."),
        goal("notrump-response", "Een sans-atoutantwoord herkennen wanneer de hand daarbij past."),
        goal("opener-rebid-after-support", "Openaars herbieding begrijpen na steun van partner."),
        goal("opener-rebid-after-notrump", "Openaars herbieding begrijpen na een sans-atoutantwoord."),
        goal("opener-rebid-after-new-suit", "Openaars herbieding begrijpen na een nieuwe kleur van partner.")
      ]),
      lesson(12, "Het volgbod", [
        goal("reasons-for-overcall", "Redenen voor een volgbod herkennen."),
        goal("overcall-informs-and-disrupts", "Begrijpen dat een volgbod partner informatie geeft en de tegenpartij stoort."),
        goal("vulnerability", "Kwetsbaarheid meenemen bij de beslissing om te volgen."),
        goal("good-suit", "Een goede kleur herkennen voor een eenvoudig volgbod."),
        goal("simple-overcall-strength-length", "Een eenvoudig volgbod kiezen met genoeg kracht en lengte."),
        goal("pass-when-too-risky", "Passen wanneer een volgbod te riskant is."),
        goal("respond-to-partner-overcall", "Reageren wanneer partner een volgbod heeft gedaan."),
        goal("support-partner-overcall", "Steun voor partners volgbod herkennen."),
        goal("less-room-after-interference", "Begrijpen dat bieden na tussenbieden minder ruimte geeft.")
      ])
    ]
  };

  validateCourse(course);

  function lesson(number, title, learningGoals) {
    const padded = String(number).padStart(2, "0");
    return {
      id: `smb1-les${padded}`,
      number,
      title,
      learningGoals: learningGoals.map((item) => ({
        id: `smb1-les${padded}-${item.id}`,
        text: item.text
      }))
    };
  }

  function goal(id, text) {
    return { id, text };
  }

  function cloneCourse() {
    return JSON.parse(JSON.stringify(course));
  }

  function findLesson(ref) {
    const text = textValue(ref);
    const number = Number(text);
    return course.lessons.find((item) => item.id === text || item.number === number) || null;
  }

  function flattenLearningGoals() {
    return course.lessons.flatMap((item) =>
      item.learningGoals.map((learningGoal) => ({
        ...learningGoal,
        lessonId: item.id,
        lessonNumber: item.number,
        lessonTitle: item.title
      }))
    );
  }

  function validateCourse(candidate = course) {
    const lessonIds = new Set();
    const goalIds = new Set();
    if (candidate.id !== "start-met-bridge-1") throw new Error("SMB1 course id must be start-met-bridge-1");
    if (!textValue(candidate.title)) throw new Error("SMB1 course title is required");
    if (!Array.isArray(candidate.lessons) || candidate.lessons.length !== 12) {
      throw new Error("SMB1 course must contain exactly 12 lessons");
    }

    candidate.lessons.forEach((item, index) => {
      const expectedNumber = index + 1;
      if (item.number !== expectedNumber) throw new Error(`SMB1 lesson ${item.id || index} must have number ${expectedNumber}`);
      if (item.id !== `smb1-les${String(expectedNumber).padStart(2, "0")}`) {
        throw new Error(`SMB1 lesson ${expectedNumber} has unstable id ${item.id}`);
      }
      if (lessonIds.has(item.id)) throw new Error(`Duplicate SMB1 lesson id: ${item.id}`);
      if (!textValue(item.title)) throw new Error(`SMB1 lesson ${item.id} is missing a title`);
      if (!Array.isArray(item.learningGoals) || item.learningGoals.length === 0) {
        throw new Error(`SMB1 lesson ${item.id} must contain learning goals`);
      }
      lessonIds.add(item.id);

      item.learningGoals.forEach((learningGoal) => {
        if (!textValue(learningGoal.id)) throw new Error(`SMB1 lesson ${item.id} has a learning goal without id`);
        if (!learningGoal.id.startsWith(`${item.id}-`)) throw new Error(`SMB1 learning goal ${learningGoal.id} must start with ${item.id}`);
        if (goalIds.has(learningGoal.id)) throw new Error(`Duplicate SMB1 learning goal id: ${learningGoal.id}`);
        if (!textValue(learningGoal.text)) throw new Error(`SMB1 learning goal ${learningGoal.id} is missing text`);
        goalIds.add(learningGoal.id);
      });
    });

    return { lessonCount: lessonIds.size, learningGoalCount: goalIds.size };
  }

  function textValue(value) {
    if (value === null || value === undefined) return "";
    return String(value).trim();
  }

  return {
    course,
    lessons: course.lessons,
    cloneCourse,
    findLesson,
    flattenLearningGoals,
    validateCourse
  };
});

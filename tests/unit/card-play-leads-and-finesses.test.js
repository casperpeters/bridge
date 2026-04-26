const {
  assert,
  rules,
  test,
  card,
  hand,
  bid,
  pass,
  double,
  redouble,
  chooseFiveCardHigh,
  chooseFiveCardHighResult
} = require("./harness.js");

test("chooseCardPlay uses the strongest named lead heuristic by default", () => {
  const result = rules.chooseCardPlay({
    hand: [card("AC"), card("2S"), card("3C")],
    currentTrick: [],
    seat: "South",
    trump: null
  });

  assert.equal(result.card.id, "AC");
  assert.equal(result.ruleId, "longestSuitLead");
  assert.equal(result.confidence, "uncertain");
  assert.ok(result.reason);
});

test("chooseCardPlay leads the highest card from a notrump sequence", () => {
  const result = rules.chooseCardPlay({
    hand: hand("KC", "QC", "JC", "7C", "2C", "AH", "3D"),
    currentTrick: [],
    seat: "West",
    contract: { level: 3, strain: "NT" },
    trump: null
  });

  assert.equal(result.card.id, "KC");
  assert.equal(result.ruleId, "notrumpSequenceLead");
  assert.equal(result.sequence, "KQJ");
});

test("chooseCardPlay leads the highest card from a notrump broken sequence", () => {
  const result = rules.chooseCardPlay({
    hand: hand("KH", "JH", "TH", "6H", "2H", "AC", "3D"),
    currentTrick: [],
    seat: "West",
    contract: { level: 3, strain: "NT" },
    trump: null
  });

  assert.equal(result.card.id, "KH");
  assert.equal(result.ruleId, "notrumpBrokenSequenceLead");
  assert.equal(result.sequence, "KJT");
  assert.equal(result.missingRank, "Q");
});

test("chooseCardPlay leads low from the longest notrump suit with honors but no sequence", () => {
  const result = rules.chooseCardPlay({
    hand: hand("AC", "8C", "5C", "2C", "KH", "3D", "2S"),
    currentTrick: [],
    seat: "West",
    contract: { level: 3, strain: "NT" },
    trump: null
  });

  assert.equal(result.card.id, "2C");
  assert.equal(result.ruleId, "notrumpLowPromisesHonor");
  assert.deepEqual(result.honorRanks, ["A"]);
});

test("chooseCardPlay leads a high middle card from the longest notrump suit without honors", () => {
  const result = rules.chooseCardPlay({
    hand: hand("9C", "8C", "5C", "2C", "KH", "3D", "2S"),
    currentTrick: [],
    seat: "West",
    contract: { level: 3, strain: "NT" },
    trump: null
  });

  assert.equal(result.card.id, "9C");
  assert.equal(result.ruleId, "notrumpHighMiddleDeniesHonor");
});

test("chooseCardPlay leads the highest card from a suit-contract honor sequence", () => {
  const result = rules.chooseCardPlay({
    hand: hand("KH", "QH", "8H", "2H", "AC", "8D", "4D"),
    currentTrick: [],
    seat: "West",
    declarer: "South",
    contract: { level: 4, strain: "S" },
    trump: "S"
  });

  assert.equal(result.card.id, "KH");
  assert.equal(result.ruleId, "suitContractSequenceLead");
  assert.equal(result.sequence, "KQ");
});

test("chooseCardPlay leads a suit-contract singleton before a doubleton", () => {
  const result = rules.chooseCardPlay({
    hand: hand("2C", "8H", "4H", "9D", "7D", "5D", "2D", "AS"),
    currentTrick: [],
    seat: "West",
    declarer: "South",
    contract: { level: 4, strain: "S" },
    trump: "S"
  });

  assert.equal(result.card.id, "2C");
  assert.equal(result.ruleId, "suitContractSingletonLead");
});

test("chooseCardPlay leads the highest card from a suit-contract doubleton before fourth best", () => {
  const result = rules.chooseCardPlay({
    hand: hand("8C", "4C", "9D", "7D", "5D", "2D", "AS", "KS"),
    currentTrick: [],
    seat: "West",
    declarer: "South",
    contract: { level: 4, strain: "S" },
    trump: "S"
  });

  assert.equal(result.card.id, "8C");
  assert.equal(result.ruleId, "suitContractDoubletonLead");
});

test("chooseCardPlay leads fourth best from length before low from three small", () => {
  const result = rules.chooseCardPlay({
    hand: hand("9D", "7D", "5D", "2D", "8C", "6C", "3C", "AS", "KS"),
    currentTrick: [],
    seat: "West",
    declarer: "South",
    contract: { level: 4, strain: "S" },
    trump: "S"
  });

  assert.equal(result.card.id, "2D");
  assert.equal(result.ruleId, "suitContractFourthBestLead");
});

test("chooseCardPlay leads low from three small before the suit-contract fallback", () => {
  const result = rules.chooseCardPlay({
    hand: hand("8C", "6C", "3C", "AS", "KS", "QS"),
    currentTrick: [],
    seat: "West",
    declarer: "South",
    contract: { level: 4, strain: "S" },
    trump: "S"
  });

  assert.equal(result.card.id, "3C");
  assert.equal(result.ruleId, "suitContractLowFromThreeSmall");
});

test("chooseCardPlay keeps the strongest longest-suit lead heuristic as a named result", () => {
  const result = rules.chooseCardPlay({
    hand: [card("2C"), card("AC"), card("3H"), card("4H"), card("5H")],
    currentTrick: [],
    seat: "West",
    trump: null
  });

  assert.equal(result.card.id, "5H");
  assert.equal(result.ruleId, "longestSuitLead");
  assert.equal(result.confidence, "uncertain");
});

test("chooseCardPlay develops a long notrump suit from declarer hand", () => {
  const result = rules.chooseCardPlay({
    hand: hand("KC", "QC", "JC", "4C", "2C", "AS"),
    partnerHand: hand("8C", "7C", "3D"),
    currentTrick: [],
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract: { level: 3, strain: "NT" },
    trump: null
  });

  assert.equal(result.card.id, "KC");
  assert.equal(result.ruleId, "developLongSuit");
  assert.equal(result.confidence, "uncertain");
  assert.equal(result.suit, "C");
  assert.equal(result.missingStopper, "A");
});

test("chooseCardPlay leads toward partner's long notrump suit development candidate", () => {
  const result = rules.chooseCardPlay({
    hand: hand("2C", "AD", "2D"),
    partnerHand: hand("KC", "QC", "JC", "4C", "3C"),
    currentTrick: [],
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract: { level: 3, strain: "NT" },
    trump: null
  });

  assert.equal(result.card.id, "2C");
  assert.equal(result.ruleId, "developLongSuit");
  assert.equal(result.sourceSeat, "North");
});

test("chooseCardPlay does not apply long-suit development in trump contracts yet", () => {
  const result = rules.chooseCardPlay({
    hand: hand("KC", "QC", "JC", "4C", "2C", "AS"),
    partnerHand: hand("8C", "7C", "3D"),
    currentTrick: [],
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract: { level: 4, strain: "S" },
    trump: "S"
  });

  assert.equal(result.card.id, "KC");
  assert.equal(result.ruleId, "longestSuitLead");
});

test("chooseCardPlay uses notrump lead rules without declarer-side partner context", () => {
  const result = rules.chooseCardPlay({
    hand: hand("KC", "QC", "JC", "4C", "2C", "AS"),
    currentTrick: [],
    seat: "South",
    contract: { level: 3, strain: "NT" },
    trump: null
  });

  assert.equal(result.card.id, "KC");
  assert.equal(result.ruleId, "notrumpSequenceLead");
});

test("chooseCardPlay leads low toward an AQ notrump finesse", () => {
  const result = rules.chooseCardPlay({
    hand: hand("2H", "3H", "AD"),
    partnerHand: hand("AH", "QH", "7H"),
    currentTrick: [],
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract: { level: 3, strain: "NT" },
    trump: null
  });

  assert.equal(result.card.id, "2H");
  assert.equal(result.ruleId, "finesseTowardHonor");
  assert.equal(result.confidence, "uncertain");
  assert.equal(result.suit, "H");
  assert.equal(result.finesseRank, "Q");
  assert.equal(result.missingHonor, "K");
  assert.equal(result.entryType, "sameSuit");
  assert.equal(result.entryRank, "A");
});

test("chooseCardPlay leads low toward an AKJ notrump finesse against the queen", () => {
  const result = rules.chooseCardPlay({
    hand: hand("2S", "3S", "AC"),
    partnerHand: hand("AS", "KS", "JS"),
    currentTrick: [],
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract: { level: 3, strain: "NT" },
    trump: null
  });

  assert.equal(result.card.id, "2S");
  assert.equal(result.ruleId, "finesseTowardHonor");
  assert.equal(result.finesseRank, "J");
  assert.equal(result.missingHonor, "Q");
  assert.equal(result.entryType, "sameSuit");
  assert.equal(result.entryRank, "A");
});

test("chooseCardPlay leads low toward the jack in the KJ double-finesse example", () => {
  const result = rules.chooseCardPlay({
    hand: hand("2H", "3H", "7H", "AD"),
    partnerHand: hand("KH", "JH", "8H"),
    currentTrick: [],
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract: { level: 3, strain: "NT" },
    trump: null
  });

  assert.equal(result.card.id, "2H");
  assert.equal(result.ruleId, "doubleFinesseTowardHonor");
  assert.equal(result.confidence, "uncertain");
  assert.equal(result.suit, "H");
  assert.equal(result.finesseRank, "J");
  assert.deepEqual(result.missingHonors, ["A", "Q"]);
  assert.equal(result.entryType, "sameSuit");
  assert.equal(result.entryRank, "K");
});

test("chooseCardPlay leads low toward the ten in the AJT double-finesse example", () => {
  const result = rules.chooseCardPlay({
    hand: hand("2D", "3D", "AS"),
    partnerHand: hand("AD", "JD", "TD"),
    currentTrick: [],
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract: { level: 3, strain: "NT" },
    trump: null
  });

  assert.equal(result.card.id, "2D");
  assert.equal(result.ruleId, "doubleFinesseTowardHonor");
  assert.equal(result.finesseRank, "T");
  assert.deepEqual(result.missingHonors, ["K", "Q"]);
  assert.equal(result.entryType, "sameSuit");
  assert.equal(result.entryRank, "A");
});

test("chooseCardPlay leads low toward the ten in the KQT double-finesse example", () => {
  const result = rules.chooseCardPlay({
    hand: hand("2C", "3C", "AS"),
    partnerHand: hand("KC", "QC", "TC"),
    currentTrick: [],
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract: { level: 3, strain: "NT" },
    trump: null
  });

  assert.equal(result.card.id, "2C");
  assert.equal(result.ruleId, "doubleFinesseTowardHonor");
  assert.equal(result.finesseRank, "T");
  assert.deepEqual(result.missingHonors, ["A", "J"]);
  assert.equal(result.entryType, "sameSuit");
  assert.equal(result.entryRank, "K");
});

test("chooseCardPlay leads low toward the ten in the QJT double-finesse example", () => {
  const result = rules.chooseCardPlay({
    hand: hand("2S", "3S", "AC"),
    partnerHand: hand("QS", "JS", "TS"),
    currentTrick: [],
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract: { level: 3, strain: "NT" },
    trump: null
  });

  assert.equal(result.card.id, "2S");
  assert.equal(result.ruleId, "doubleFinesseTowardHonor");
  assert.equal(result.finesseRank, "T");
  assert.deepEqual(result.missingHonors, ["A", "K"]);
  assert.equal(result.entryType, "sameSuit");
  assert.equal(result.entryRank, "Q");
});

test("chooseCardPlay allows a one-card finesse when the honor hand has a side entry", () => {
  const result = rules.chooseCardPlay({
    hand: hand("2H", "AD"),
    partnerHand: hand("AH", "QH", "7H", "AC"),
    currentTrick: [],
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract: { level: 3, strain: "NT" },
    trump: null
  });

  assert.equal(result.card.id, "2H");
  assert.equal(result.ruleId, "finesseTowardHonor");
  assert.equal(result.entryType, "sideAce");
  assert.equal(result.entrySuit, "C");
});

test("chooseCardPlay skips a finesse when the honor hand has no later entry", () => {
  const result = rules.chooseCardPlay({
    hand: hand("2H", "AD"),
    partnerHand: hand("AH", "QH", "7H"),
    currentTrick: [],
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract: { level: 3, strain: "NT" },
    trump: null
  });

  assert.equal(result.card.id, "AD");
  assert.equal(result.ruleId, "longestSuitLead");
});

test("chooseCardPlay does not lead a finesse from the honor side", () => {
  const result = rules.chooseCardPlay({
    hand: hand("AH", "QH", "2D"),
    partnerHand: hand("2H", "3H"),
    currentTrick: [],
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract: { level: 3, strain: "NT" },
    trump: null
  });

  assert.equal(result.card.id, "AH");
  assert.equal(result.ruleId, "longestSuitLead");
});

test("chooseCardPlay does not lead a finesse in trump contracts yet", () => {
  const result = rules.chooseCardPlay({
    hand: hand("2H", "AD"),
    partnerHand: hand("AH", "QH", "7H"),
    currentTrick: [],
    seat: "South",
    declarer: "South",
    dummy: "North",
    contract: { level: 4, strain: "S" },
    trump: "S"
  });

  assert.equal(result.card.id, "AD");
  assert.equal(result.ruleId, "longestSuitLead");
});

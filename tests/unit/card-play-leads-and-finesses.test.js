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
    hand: hand("KH", "QH", "TH", "6H", "2H", "AC", "3D"),
    currentTrick: [],
    seat: "West",
    contract: { level: 3, strain: "NT" },
    trump: null
  });

  assert.equal(result.card.id, "KH");
  assert.equal(result.ruleId, "notrumpBrokenSequenceLead");
  assert.equal(result.sequence, "KQT");
  assert.equal(result.missingRank, "J");
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
  assert.equal(result.ruleId, "notrumpTopOfNothingLead");
});

test("chooseCardPlay leads the longest unbid suit against notrump", () => {
  const result = rules.chooseCardPlay({
    hand: hand("AC", "KC", "QC", "7C", "2C", "KH", "QH", "JH", "2H", "3D"),
    currentTrick: [],
    seat: "West",
    declarer: "South",
    contract: { level: 3, strain: "NT" },
    trump: null,
    auction: [
      { seat: "South", bid: bid(1, "C") },
      { seat: "West", bid: pass() },
      { seat: "North", bid: bid(3, "NT") },
      { seat: "East", bid: pass() },
      { seat: "South", bid: pass() },
      { seat: "West", bid: pass() }
    ]
  });

  assert.equal(result.card.id, "KH");
  assert.equal(result.ruleId, "notrumpSequenceLead");
  assert.equal(result.suit, "H");
  assert.equal(result.leadSelection, "longestUnbidSuit");
  assert.deepEqual(result.bidSuits, ["C"]);
});

test("chooseCardPlay does not treat Stayman as a natural clubs lead warning", () => {
  const stayman = { bid: bid(2, "C"), ruleId: "fiveCardHigh.response.stayman" };
  const staymanAnswer = { bid: bid(2, "D"), ruleId: "fiveCardHigh.continuation.staymanAnswer" };
  const result = rules.chooseCardPlay({
    hand: hand("AC", "KC", "QC", "7C", "2C", "KH", "QH", "JH", "2H", "3D"),
    currentTrick: [],
    seat: "West",
    declarer: "North",
    contract: { level: 3, strain: "NT" },
    trump: null,
    auction: [
      { seat: "North", bid: bid(1, "NT") },
      { seat: "East", bid: pass() },
      { seat: "South", bid: bid(2, "C"), bidResult: stayman },
      { seat: "West", bid: pass() },
      { seat: "North", bid: bid(2, "D"), bidResult: staymanAnswer },
      { seat: "East", bid: pass() },
      { seat: "South", bid: bid(3, "NT") },
      { seat: "West", bid: pass() },
      { seat: "North", bid: pass() },
      { seat: "East", bid: pass() }
    ]
  });

  assert.equal(result.card.id, "AC");
  assert.equal(result.ruleId, "notrumpAceKingLead");
  assert.equal(result.suit, "C");
  assert.deepEqual(result.bidSuits, []);
});

test("chooseCardPlay treats a transfer by shown suit, not by bid strain", () => {
  const transfer = { bid: bid(2, "D"), ruleId: "fiveCardHigh.response.transferToH", transferSuit: "H" };
  const acceptTransfer = { bid: bid(2, "H"), ruleId: "fiveCardHigh.continuation.acceptTransfer", transferSuit: "H" };
  const result = rules.chooseCardPlay({
    hand: hand("AD", "KD", "QD", "7D", "2D", "AC", "KC", "QC", "2C", "3H"),
    currentTrick: [],
    seat: "West",
    declarer: "North",
    contract: { level: 3, strain: "NT" },
    trump: null,
    auction: [
      { seat: "North", bid: bid(1, "NT") },
      { seat: "East", bid: pass() },
      { seat: "South", bid: bid(2, "D"), bidResult: transfer },
      { seat: "West", bid: pass() },
      { seat: "North", bid: bid(2, "H"), bidResult: acceptTransfer },
      { seat: "East", bid: pass() },
      { seat: "South", bid: bid(3, "NT") },
      { seat: "West", bid: pass() },
      { seat: "North", bid: pass() },
      { seat: "East", bid: pass() }
    ]
  });

  assert.equal(result.card.id, "AD");
  assert.equal(result.ruleId, "notrumpAceKingLead");
  assert.equal(result.suit, "D");
  assert.deepEqual(result.bidSuits, ["H"]);
});

test("chooseCardPlay matches the Start met Bridge notrump opening-lead examples", () => {
  const examples = [
    {
      hand: hand("KS", "3S", "QH", "JH", "8H", "5H", "4H", "AD", "7D", "5D", "2D", "5C", "4C"),
      auction: [
        { seat: "East", bid: bid(1, "NT") },
        { seat: "South", bid: pass() },
        { seat: "West", bid: bid(3, "NT") },
        { seat: "North", bid: pass() },
        { seat: "East", bid: pass() },
        { seat: "South", bid: pass() }
      ],
      expectedCard: "4H",
      expectedRule: "notrumpLowPromisesHonor",
      expectedSelection: "longestSuit"
    },
    {
      hand: hand("8S", "3S", "KH", "JH", "7H", "5H", "2H", "QD", "9D", "6D", "5D", "5C", "4C"),
      auction: [
        { seat: "East", bid: bid(1, "H") },
        { seat: "South", bid: pass() },
        { seat: "West", bid: bid(1, "S") },
        { seat: "North", bid: pass() },
        { seat: "East", bid: bid(1, "NT") },
        { seat: "South", bid: pass() },
        { seat: "West", bid: bid(3, "NT") },
        { seat: "North", bid: pass() },
        { seat: "East", bid: pass() },
        { seat: "South", bid: pass() }
      ],
      expectedCard: "5D",
      expectedRule: "notrumpLowPromisesHonor",
      expectedSelection: "longestUnbidSuit"
    },
    {
      hand: hand("KS", "QS", "JS", "TS", "8H", "4H", "9D", "7D", "5D", "4D", "2D", "5C", "4C"),
      auction: [
        { seat: "East", bid: bid(1, "NT") },
        { seat: "South", bid: pass() },
        { seat: "West", bid: bid(3, "NT") },
        { seat: "North", bid: pass() },
        { seat: "East", bid: pass() },
        { seat: "South", bid: pass() }
      ],
      expectedCard: "KS",
      expectedRule: "notrumpSequenceLead",
      expectedSelection: "qualitySuit"
    },
    {
      hand: hand("QS", "8S", "7S", "4S", "KH", "7H", "2H", "JD", "8D", "6D", "4D", "9C", "3C"),
      auction: [
        { seat: "West", bid: bid(1, "C") },
        { seat: "North", bid: bid(1, "H") },
        { seat: "East", bid: bid(1, "NT") },
        { seat: "South", bid: pass() },
        { seat: "West", bid: bid(3, "NT") },
        { seat: "North", bid: pass() },
        { seat: "East", bid: pass() },
        { seat: "South", bid: pass() }
      ],
      expectedCard: "2H",
      expectedRule: "notrumpLowPromisesHonor",
      expectedSelection: "partnerSuit"
    },
    {
      hand: hand("KS", "8S", "7S", "4S", "TH", "7H", "2H", "TD", "8D", "6D", "4D", "9C", "3C"),
      auction: [
        { seat: "West", bid: bid(1, "D") },
        { seat: "North", bid: pass() },
        { seat: "East", bid: bid(1, "S") },
        { seat: "South", bid: pass() },
        { seat: "West", bid: bid(2, "C") },
        { seat: "North", bid: pass() },
        { seat: "East", bid: bid(3, "NT") },
        { seat: "South", bid: pass() },
        { seat: "West", bid: pass() },
        { seat: "North", bid: pass() }
      ],
      expectedCard: "9C",
      expectedRule: "notrumpDoubletonLead",
      expectedSelection: "throughDummySecondSuit"
    }
  ];

  examples.forEach((example) => {
    const result = rules.chooseCardPlay({
      hand: example.hand,
      currentTrick: [],
      seat: "South",
      declarer: "East",
      contract: { level: 3, strain: "NT" },
      trump: null,
      auction: example.auction
    });

    assert.equal(result.card.id, example.expectedCard);
    assert.equal(result.ruleId, example.expectedRule);
    assert.equal(result.leadSelection, example.expectedSelection);
  });
});

test("chooseCardPlay matches the Start met Bridge notrump card-choice examples", () => {
  const examples = [
    {
      hand: hand("KH", "QH", "JH", "7H", "2C"),
      expectedCard: "KH",
      expectedRule: "notrumpSequenceLead",
      expectedSequence: "KQJ"
    },
    {
      hand: hand("KH", "QH", "TH", "3H", "2C"),
      expectedCard: "KH",
      expectedRule: "notrumpBrokenSequenceLead",
      expectedSequence: "KQT",
      expectedMissing: "J"
    },
    {
      hand: hand("QH", "TH", "9H", "2H", "2C"),
      expectedCard: "TH",
      expectedRule: "notrumpInternalSequenceLead",
      expectedSequence: "T9",
      expectedHigher: "Q"
    },
    {
      hand: hand("KH", "JH", "TH", "3H", "2C"),
      expectedCard: "JH",
      expectedRule: "notrumpInternalSequenceLead",
      expectedSequence: "JT",
      expectedHigher: "K"
    },
    {
      hand: hand("AD", "JD", "TD", "6D", "4D", "2C"),
      expectedCard: "JD",
      expectedRule: "notrumpInternalSequenceLead",
      expectedSequence: "JT",
      expectedHigher: "A"
    },
    {
      hand: hand("AH", "KH", "8H", "3H", "2C"),
      expectedCard: "AH",
      expectedRule: "notrumpAceKingLead",
      expectedSequence: "AK"
    },
    {
      hand: hand("JH", "7H", "2C"),
      expectedCard: "JH",
      expectedRule: "notrumpDoubletonLead"
    }
  ];

  examples.forEach((example) => {
    const result = rules.chooseCardPlay({
      hand: example.hand,
      currentTrick: [],
      seat: "West",
      declarer: "South",
      contract: { level: 3, strain: "NT" },
      trump: null
    });

    assert.equal(result.card.id, example.expectedCard);
    assert.equal(result.ruleId, example.expectedRule);
    if (example.expectedSequence) assert.equal(result.sequence, example.expectedSequence);
    if (example.expectedMissing) assert.equal(result.missingRank, example.expectedMissing);
    if (example.expectedHigher) assert.equal(result.higherRank, example.expectedHigher);
  });
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

test("chooseCardPlay chooses a length suit before three small but leads top of nothing", () => {
  const result = rules.chooseCardPlay({
    hand: hand("9D", "7D", "5D", "2D", "8C", "6C", "3C", "AS", "KS"),
    currentTrick: [],
    seat: "West",
    declarer: "South",
    contract: { level: 4, strain: "S" },
    trump: "S"
  });

  assert.equal(result.card.id, "9D");
  assert.equal(result.ruleId, "suitContractTopOfNothingLead");
  assert.equal(result.suit, "D");
});

test("chooseCardPlay leads top of nothing from three small before the suit-contract fallback", () => {
  const result = rules.chooseCardPlay({
    hand: hand("8C", "6C", "3C", "AS", "KS", "QS"),
    currentTrick: [],
    seat: "West",
    declarer: "South",
    contract: { level: 4, strain: "S" },
    trump: "S"
  });

  assert.equal(result.card.id, "8C");
  assert.equal(result.ruleId, "suitContractTopOfNothingLead");
});

test("chooseCardPlay avoids underleading an unsupported ace against a suit contract when three small is available", () => {
  const result = rules.chooseCardPlay({
    hand: hand("AC", "8C", "5C", "2C", "9D", "6D", "3D", "AS"),
    currentTrick: [],
    seat: "West",
    declarer: "South",
    contract: { level: 4, strain: "S" },
    trump: "S"
  });

  assert.equal(result.card.id, "9D");
  assert.equal(result.ruleId, "suitContractTopOfNothingLead");
  assert.equal(result.honorSafety, "avoidedUnsupportedAceUnderlead");
  assert.equal(result.avoidedSuit, "C");
  assert.equal(result.avoidedHonor, "A");
});

test("chooseCardPlay leads low from unsupported king and queen suits instead of treating them like loose aces", () => {
  const kingRisk = rules.chooseCardPlay({
    hand: hand("KH", "8H", "5H", "2H", "9D", "6D", "3D", "AS"),
    currentTrick: [],
    seat: "West",
    declarer: "South",
    contract: { level: 4, strain: "S" },
    trump: "S"
  });
  const queenRisk = rules.chooseCardPlay({
    hand: hand("QH", "8H", "5H", "2H", "9D", "6D", "3D", "AS"),
    currentTrick: [],
    seat: "West",
    declarer: "South",
    contract: { level: 4, strain: "S" },
    trump: "S"
  });

  assert.equal(kingRisk.card.id, "2H");
  assert.equal(kingRisk.ruleId, "suitContractLowPromisesHonor");
  assert.equal(kingRisk.suit, "H");
  assert.equal(queenRisk.card.id, "2H");
  assert.equal(queenRisk.ruleId, "suitContractLowPromisesHonor");
  assert.equal(queenRisk.suit, "H");
});

test("chooseCardPlay still prefers the top of a supported honor sequence against a suit contract", () => {
  const result = rules.chooseCardPlay({
    hand: hand("AH", "KH", "8H", "2H", "9D", "6D", "3D", "AS"),
    currentTrick: [],
    seat: "West",
    declarer: "South",
    contract: { level: 4, strain: "S" },
    trump: "S"
  });

  assert.equal(result.card.id, "AH");
  assert.equal(result.ruleId, "suitContractSequenceLead");
  assert.equal(result.sequence, "AK");
});

test("chooseCardPlay matches the Start met Bridge suit-contract card-choice examples", () => {
  const examples = [
    {
      hand: hand("KH", "QH", "8H", "2H", "AS"),
      expectedCard: "KH",
      expectedRule: "suitContractSequenceLead",
      expectedSequence: "KQ"
    },
    {
      hand: hand("QD", "JD", "8D", "3D", "AS"),
      expectedCard: "QD",
      expectedRule: "suitContractSequenceLead",
      expectedSequence: "QJ"
    },
    {
      hand: hand("KH", "9H", "7H", "5H", "AS"),
      expectedCard: "5H",
      expectedRule: "suitContractLowPromisesHonor"
    },
    {
      hand: hand("QD", "8D", "7D", "3D", "2D", "AS"),
      expectedCard: "2D",
      expectedRule: "suitContractLowPromisesHonor"
    },
    {
      hand: hand("9H", "7H", "5H", "AS"),
      expectedCard: "9H",
      expectedRule: "suitContractTopOfNothingLead"
    },
    {
      hand: hand("8D", "7D", "3D", "2D", "AS"),
      expectedCard: "8D",
      expectedRule: "suitContractTopOfNothingLead"
    },
    {
      hand: hand("AH", "9H", "6H", "5H", "3H", "AS"),
      expectedCard: "AH",
      expectedRule: "suitContractUnsupportedAceLead",
      expectedConfidence: "uncertain"
    },
    {
      hand: hand("AH", "KH", "7H", "AS"),
      expectedCard: "AH",
      expectedRule: "suitContractSequenceLead",
      expectedSequence: "AK"
    }
  ];

  examples.forEach((example) => {
    const result = rules.chooseCardPlay({
      hand: example.hand,
      currentTrick: [],
      seat: "West",
      declarer: "South",
      contract: { level: 4, strain: "S" },
      trump: "S"
    });

    assert.equal(result.card.id, example.expectedCard);
    assert.equal(result.ruleId, example.expectedRule);
    if (example.expectedSequence) assert.equal(result.sequence, example.expectedSequence);
    if (example.expectedConfidence) assert.equal(result.confidence, example.expectedConfidence);
  });
});

test("chooseCardPlay leads a loose ace uncertainly when no safer side suit is available", () => {
  const result = rules.chooseCardPlay({
    hand: hand("AH", "9H", "6H", "5H", "3H", "AS", "KS", "QS"),
    currentTrick: [],
    seat: "West",
    declarer: "South",
    contract: { level: 4, strain: "S" },
    trump: "S"
  });

  assert.equal(result.card.id, "AH");
  assert.equal(result.ruleId, "suitContractUnsupportedAceLead");
  assert.equal(result.confidence, "uncertain");
  assert.equal(result.honorSafety, "fallbackUnsupportedAceLead");
  assert.equal(result.unsupportedHonor, "A");
});

test("chooseCardPlay keeps notrump low-from-honor length leads available", () => {
  const result = rules.chooseCardPlay({
    hand: hand("AC", "8C", "5C", "2C", "9D", "6D", "3D", "AS"),
    currentTrick: [],
    seat: "West",
    declarer: "South",
    contract: { level: 3, strain: "NT" },
    trump: null
  });

  assert.equal(result.card.id, "2C");
  assert.equal(result.ruleId, "notrumpLowPromisesHonor");
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

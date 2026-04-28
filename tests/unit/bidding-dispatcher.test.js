const { assert, hand, rules, test } = require("./harness.js");

test("generic bidding dispatcher uses the selected five-card-high system", () => {
  const result = rules.chooseBid({
    systemId: "fiveCardHigh",
    hand: hand(
      "AS", "KS", "QS", "JS", "2S",
      "AH", "2H", "3H",
      "JD", "2D", "3D",
      "2C", "3C"
    ),
    auction: [],
    seat: "South",
    vulnerability: "none",
    agreements: rules.biddingSystems.fiveCardHigh.conventionDefaults
  });

  assert.deepEqual(result.bid, rules.Bid(1, "NT"));
  assert.equal(result.ruleId, "fiveCardHigh.opening.oneNotrump");
  assert.equal(result.system, "fiveCardHigh");
});

test("generic bidding dispatcher defaults to the current five-card-high profile", () => {
  const result = rules.chooseBid({
    hand: hand(
      "AS", "KS", "QS", "JS", "2S",
      "AH", "2H", "3H",
      "JD", "2D", "3D",
      "2C", "3C"
    ),
    auction: [],
    seat: "South",
    vulnerability: "none"
  });

  assert.equal(result.system, rules.biddingSystems.fiveCardHigh.id);
  assert.equal(result.ruleId, "fiveCardHigh.opening.oneNotrump");
});

test("generic bidding dispatcher rejects unknown systems", () => {
  assert.throws(
    () => rules.chooseBid({ systemId: "unknownSystem" }),
    /Unknown bidding system: unknownSystem/
  );
});

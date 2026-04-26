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

test("auctionComplete recognizes pass-out and contract auctions", () => {
  assert.equal(rules.auctionComplete([
    { seat: "North", bid: pass() },
    { seat: "East", bid: pass() },
    { seat: "South", bid: pass() }
  ]), false);

  const passedOutAuction = [
    { seat: "North", bid: pass() },
    { seat: "East", bid: pass() },
    { seat: "South", bid: pass() },
    { seat: "West", bid: pass() }
  ];
  assert.equal(rules.auctionComplete(passedOutAuction), true);
  assert.equal(rules.finalContract(passedOutAuction), null);

  assert.equal(rules.auctionComplete([
    { seat: "North", bid: bid(1, "S") },
    { seat: "East", bid: pass() },
    { seat: "South", bid: pass() },
    { seat: "West", bid: pass() }
  ]), true);
});

test("auctionComplete and finalContract handle doubles and redoubles", () => {
  const doubledAuction = [
    { seat: "North", bid: bid(1, "S") },
    { seat: "East", bid: double() },
    { seat: "South", bid: pass() },
    { seat: "West", bid: pass() },
    { seat: "North", bid: pass() }
  ];

  assert.equal(rules.auctionComplete(doubledAuction), true);
  assert.deepEqual(rules.finalContract(doubledAuction), { level: 1, strain: "S", doubled: true, redoubled: false });

  const redoubledAuction = [
    { seat: "North", bid: bid(1, "S") },
    { seat: "East", bid: double() },
    { seat: "South", bid: redouble() },
    { seat: "West", bid: pass() },
    { seat: "North", bid: pass() },
    { seat: "East", bid: pass() }
  ];

  assert.equal(rules.auctionComplete(redoubledAuction), true);
  assert.deepEqual(rules.finalContract(redoubledAuction), { level: 1, strain: "S", doubled: true, redoubled: true });
});

test("typed bid helpers normalize legacy calls without mixing new auction data", () => {
  assert.deepEqual(rules.normalizeBid("Pass"), pass());
  assert.deepEqual(rules.normalizeBid("Double"), double());
  assert.deepEqual(rules.normalizeBid("Redouble"), redouble());
  assert.deepEqual(rules.normalizeBid({ level: 2, strain: "NT" }), bid(2, "NT"));
  assert.equal(rules.sameCall("Double", double()), true);
  assert.equal(rules.sameCall({ level: 2, strain: "NT" }, bid(2, "NT")), true);
});

test("findDeclarer returns the first player from the declaring side to bid the strain", () => {
  const auction = [
    { seat: "North", bid: bid(1, "C") },
    { seat: "East", bid: pass() },
    { seat: "South", bid: bid(1, "H") },
    { seat: "West", bid: pass() },
    { seat: "North", bid: bid(2, "H") },
    { seat: "East", bid: pass() },
    { seat: "South", bid: pass() },
    { seat: "West", bid: pass() }
  ];

  assert.equal(rules.findDeclarer(auction, { level: 2, strain: "H" }), "South");
});

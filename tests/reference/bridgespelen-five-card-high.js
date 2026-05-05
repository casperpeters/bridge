const sources = {
  openingOneNotrump: {
    url: "https://www.bridgespelen.nl/vijfkaart-hoog-openen-1sa.html",
    topic: "Openen met 1SA"
  },
  openingMajors: {
    url: "https://www.bridgespelen.nl/vijfkaart-hoog-openen-hoge-kleuren.html",
    topic: "Openen met 1H of 1S"
  },
  openingMinors: {
    url: "https://www.bridgespelen.nl/vijfkaart-hoog-openen-lage-kleuren.html",
    topic: "Openen met 1C of 1D"
  },
  openingStrong: {
    url: "https://www.bridgespelen.nl/vijfkaart-hoog-openen-sterke-klaver-2sa.html",
    topic: "Openen met sterke 2C of 2NT"
  },
  openingPreempt: {
    url: "https://www.bridgespelen.nl/vijfkaart-hoog-preemptief-openen-zwakke-twee.html",
    topic: "Preemptieve openingen"
  },
  oneNotrumpResponse: {
    url: "https://www.bridgespelen.nl/vijfkaart-hoog-bijbod-1sa-jacoby-stayman.html",
    topic: "Bijbod na 1SA"
  },
  oneMajorResponse: {
    url: "https://www.bridgespelen.nl/vijf-kaart-hoog-bijbod-majeurs-van-5.html",
    topic: "Bijbod na 1H of 1S"
  },
  oneMinorResponse: {
    url: "https://www.bridgespelen.nl/bridge-vijf-kaart-hoog-bijbod.html",
    topic: "Bijbod na 1C of 1D"
  },
  jacobyContinuation: {
    url: "https://www.bridgespelen.nl/vijf-kaart-hoog-herbieding-stayman-jacoby.html",
    topic: "Verder bieden na Jacoby"
  },
  staymanContinuation: {
    url: "https://www.bridgespelen.nl/vijf-kaart-hoog-1SA-bijbod-stayman-herbieding.html",
    topic: "Verder bieden na Stayman"
  }
};

function createBridgespelenFiveCardHighClaims({ bid, pass }) {
  const oneNotrumpAuction = [
    { seat: "North", bid: bid(1, "NT") },
    { seat: "East", bid: pass() }
  ];
  const oneClubAuction = [
    { seat: "North", bid: bid(1, "C") },
    { seat: "East", bid: pass() }
  ];
  const oneDiamondAuction = [
    { seat: "North", bid: bid(1, "D") },
    { seat: "East", bid: pass() }
  ];
  const oneHeartAuction = [
    { seat: "North", bid: bid(1, "H") },
    { seat: "East", bid: pass() }
  ];
  const oneSpadeAuction = [
    { seat: "North", bid: bid(1, "S") },
    { seat: "East", bid: pass() }
  ];
  const staymanAuction = [
    ...oneNotrumpAuction,
    { seat: "South", bid: bid(2, "C") },
    { seat: "West", bid: pass() }
  ];
  const heartTransferAuction = [
    ...oneNotrumpAuction,
    { seat: "South", bid: bid(2, "D") },
    { seat: "West", bid: pass() }
  ];
  const spadeTransferAuction = [
    ...oneNotrumpAuction,
    { seat: "South", bid: bid(2, "H") },
    { seat: "West", bid: pass() }
  ];

  return [
    {
      id: "bridgespelen.opening.1nt.5332-five-card-major",
      domain: "opening",
      source: sources.openingOneNotrump,
      claim: "A 15-17 HCP balanced 5332 hand may include a five-card major and opens 1NT.",
      verdict: "match",
      hand: ["AS", "KS", "QS", "JS", "2S", "AH", "2H", "3H", "JD", "2D", "3D", "2C", "3C"],
      expectedSourceBid: bid(1, "NT"),
      expectedEngineBid: bid(1, "NT"),
      expectedRuleId: "fiveCardHigh.opening.oneNotrump",
      expect: { hcp: 15, balanced: true }
    },
    {
      id: "bridgespelen.opening.1s.five-card-major-no-1nt",
      domain: "opening",
      source: sources.openingMajors,
      claim: "Open 1S with 12-19 HCP, no 1NT opening, a five-card spade suit, and no longer minor.",
      verdict: "match",
      hand: ["AS", "KS", "QS", "2S", "3S", "QH", "2H", "3H", "JD", "2D", "3D", "2C", "3C"],
      expectedSourceBid: bid(1, "S"),
      expectedEngineBid: bid(1, "S"),
      expectedRuleId: "fiveCardHigh.opening.oneMajor",
      expect: { hcp: 12, balanced: true }
    },
    {
      id: "bridgespelen.opening.1h.no-five-card-spades",
      domain: "opening",
      source: sources.openingMajors,
      claim: "Open 1H with 12-19 HCP, no 1NT opening, no five-card spade suit, and a five-card heart suit.",
      verdict: "match",
      hand: ["AS", "2S", "AH", "KH", "QH", "2H", "3H", "2D", "3D", "4D", "2C", "3C", "4C"],
      expectedSourceBid: bid(1, "H"),
      expectedEngineBid: bid(1, "H"),
      expectedRuleId: "fiveCardHigh.opening.oneMajor",
      expect: { hcp: 13, balanced: true }
    },
    {
      id: "bridgespelen.opening.1c.longer-minor-before-five-card-major",
      domain: "opening",
      source: sources.openingMinors,
      claim: "Open the longer minor instead of a five-card major when the minor is longer than the major.",
      verdict: "match",
      hand: ["AS", "KS", "QS", "2S", "3S", "2H", "3H", "AC", "2C", "3C", "4C", "5C", "6C"],
      expectedSourceBid: bid(1, "C"),
      expectedEngineBid: bid(1, "C"),
      expectedRuleId: "fiveCardHigh.opening.oneMinor",
      expect: { hcp: 13 }
    },
    {
      id: "bridgespelen.opening.1d.four-diamonds-no-five-card-major",
      domain: "opening",
      source: sources.openingMinors,
      claim: "Open 1D with no 1NT opening, no five-card major, and a four-card diamond suit.",
      verdict: "match",
      hand: ["AS", "KS", "QH", "JH", "2H", "3H", "KD", "2D", "3D", "4D", "2C", "3C", "4C"],
      expectedSourceBid: bid(1, "D"),
      expectedEngineBid: bid(1, "D"),
      expectedRuleId: "fiveCardHigh.opening.oneMinor",
      expect: { hcp: 13 }
    },
    {
      id: "bridgespelen.opening.1c.lowest-of-two-four-card-minors",
      domain: "opening",
      source: sources.openingMinors,
      claim: "With multiple four-card suits in the minors, open the lower minor.",
      verdict: "match",
      hand: ["AS", "QS", "2S", "KH", "2H", "KD", "2D", "3D", "4D", "2C", "3C", "4C", "5C"],
      expectedSourceBid: bid(1, "C"),
      expectedEngineBid: bid(1, "C"),
      expectedRuleId: "fiveCardHigh.opening.oneMinor",
      expect: { hcp: 12 }
    },
    {
      id: "bridgespelen.opening.2nt.20-22-balanced",
      domain: "opening",
      source: sources.openingStrong,
      claim: "Open 2NT with 20-22 HCP and a balanced 4333, 4432, or 5332 hand.",
      verdict: "match",
      hand: ["AS", "KS", "QS", "JS", "AH", "KH", "QH", "JD", "2D", "3D", "QC", "2C", "3C"],
      expectedSourceBid: bid(2, "NT"),
      expectedEngineBid: bid(2, "NT"),
      expectedRuleId: "fiveCardHigh.opening.twoNotrump",
      expect: { hcp: 22, balanced: true }
    },
    {
      id: "bridgespelen.opening.2c.23-plus-balanced",
      domain: "opening",
      source: sources.openingStrong,
      claim: "Open 2C with 23+ HCP and a balanced hand.",
      verdict: "match",
      hand: ["AS", "KS", "QS", "2S", "AH", "KH", "QH", "AD", "KD", "2D", "2C", "3C", "4C"],
      expectedSourceBid: bid(2, "C"),
      expectedEngineBid: bid(2, "C"),
      expectedRuleId: "fiveCardHigh.opening.strongTwoClubs",
      expect: { hcp: 25, balanced: true }
    },
    {
      id: "bridgespelen.opening.2c.20-plus-unbalanced",
      domain: "opening",
      source: sources.openingStrong,
      claim: "Open 2C with 20+ HCP and no notrump shape.",
      verdict: "match",
      hand: ["AS", "KS", "QS", "JS", "TS", "9S", "AH", "KH", "AD", "2D", "2C", "3C", "4C"],
      expectedSourceBid: bid(2, "C"),
      expectedEngineBid: bid(2, "C"),
      expectedRuleId: "fiveCardHigh.opening.strongTwoClubs",
      expect: { hcp: 21, balanced: false }
    },
    {
      id: "bridgespelen.opening.2c.eight-playing-tricks",
      domain: "opening",
      source: sources.openingStrong,
      claim: "Open 2C with fewer than 20 HCP when a long suit has at least eight playing tricks.",
      verdict: "match",
      hand: ["AS", "KS", "QS", "JS", "TS", "9S", "8S", "AH", "2H", "2D", "3D", "2C", "3C"],
      expectedSourceBid: bid(2, "C"),
      expectedEngineBid: bid(2, "C"),
      expectedRuleId: "fiveCardHigh.opening.strongTwoClubs",
      expect: { hcp: 14, balanced: false, playingTricksEligible: true }
    },
    {
      id: "bridgespelen.opening.weak-two.ugly-eleven",
      domain: "opening",
      source: sources.openingPreempt,
      claim: "The site gives weak two openings as 6-10 HCP; the app intentionally keeps an ugly 11-count weak-two rule.",
      verdict: "intentionalExtension",
      rationale: "This preserves the stronger local convention already covered by opening tests.",
      hand: ["KS", "JS", "9S", "8S", "7S", "6S", "AH", "QH", "7D", "5D", "2D", "JC", "4C"],
      expectedEngineBid: bid(2, "S"),
      expectedRuleId: "fiveCardHigh.opening.weakTwo",
      expect: { hcp: 11, ruleOf20Eligible: false }
    },
    {
      id: "bridgespelen.opening.preempt.clubs",
      domain: "opening",
      source: sources.openingPreempt,
      claim: "The site lists 3D/3H/3S and 4D/4H/4S; the app intentionally allows club preempts too.",
      verdict: "intentionalExtension",
      rationale: "Club preempts are a useful natural extension and are already supported by response logic.",
      hand: ["KS", "JS", "6S", "5H", "9D", "7D", "AC", "QC", "7C", "5C", "4C", "3C", "2C"],
      expectedEngineBid: bid(3, "C"),
      expectedRuleId: "fiveCardHigh.opening.preempt",
      expect: { hcp: 10 }
    },
    {
      id: "bridgespelen.opening.preempt.vulnerable-seven-card-six-count-safety",
      domain: "opening",
      source: sources.openingPreempt,
      claim: "The app opens an exceptional vulnerable six-count with a strong seven-card suit at the two level instead of stretching to a three-level preempt.",
      verdict: "intentionalExtension",
      rationale: "This keeps the preemptive idea but chooses the safer level when vulnerable.",
      hand: ["KS", "QS", "JS", "TS", "7S", "5S", "4S", "8H", "6H", "9D", "3D", "8C", "2C"],
      vulnerability: "NS",
      expectedEngineBid: bid(2, "S"),
      expectedRuleId: "fiveCardHigh.opening.weakTwo",
      expect: { hcp: 6, vulnerable: true, exceptionalSixPointPreempt: true }
    },
    {
      id: "bridgespelen.response.1nt.pass-under-eight-no-five-card-major",
      domain: "response",
      source: sources.oneNotrumpResponse,
      claim: "After 1NT, pass with fewer than 8 HCP and no five-card major.",
      verdict: "match",
      auction: oneNotrumpAuction,
      hand: ["KS", "2S", "3S", "QH", "2H", "3H", "2D", "3D", "4D", "5D", "QC", "2C", "3C"],
      expectedSourceBid: pass(),
      expectedEngineBid: pass(),
      expectedRuleId: "fiveCardHigh.pass.responseNoAction",
      expect: { hcp: 7 }
    },
    {
      id: "bridgespelen.response.1nt.invite-no-four-card-major",
      domain: "response",
      source: sources.oneNotrumpResponse,
      claim: "After 1NT, bid 2NT with 8-9 HCP and no four-card or longer major.",
      verdict: "match",
      auction: oneNotrumpAuction,
      hand: ["KS", "2S", "3S", "QH", "2H", "3H", "JD", "2D", "3D", "4D", "QC", "2C", "3C"],
      expectedSourceBid: bid(2, "NT"),
      expectedEngineBid: bid(2, "NT"),
      expectedRuleId: "fiveCardHigh.response.notrumpInvite",
      expect: { hcp: 8 }
    },
    {
      id: "bridgespelen.response.1nt.game-no-four-card-major",
      domain: "response",
      source: sources.oneNotrumpResponse,
      claim: "After 1NT, bid 3NT with 10+ HCP and no four-card or longer major.",
      verdict: "match",
      auction: oneNotrumpAuction,
      hand: ["KS", "2S", "3S", "QH", "2H", "3H", "KD", "2D", "3D", "4D", "QC", "2C", "3C"],
      expectedSourceBid: bid(3, "NT"),
      expectedEngineBid: bid(3, "NT"),
      expectedRuleId: "fiveCardHigh.response.notrumpGame",
      expect: { hcp: 10 }
    },
    {
      id: "bridgespelen.response.1nt.transfer-to-hearts",
      domain: "response",
      source: sources.oneNotrumpResponse,
      claim: "After 1NT, bid 2D as Jacoby transfer with a five-card or longer heart suit.",
      verdict: "match",
      auction: oneNotrumpAuction,
      hand: ["2S", "3S", "4S", "2H", "3H", "4H", "5H", "6H", "2D", "3D", "2C", "3C", "4C"],
      expectedSourceBid: bid(2, "D"),
      expectedEngineBid: bid(2, "D"),
      expectedRuleId: "fiveCardHigh.response.transferToH",
      expect: { hcp: 0, transferSuit: "H" }
    },
    {
      id: "bridgespelen.response.1nt.transfer-to-spades",
      domain: "response",
      source: sources.oneNotrumpResponse,
      claim: "After 1NT, bid 2H as Jacoby transfer with a five-card or longer spade suit.",
      verdict: "match",
      auction: oneNotrumpAuction,
      hand: ["2S", "3S", "4S", "5S", "6S", "2H", "3H", "4H", "2D", "3D", "2C", "3C", "4C"],
      expectedSourceBid: bid(2, "H"),
      expectedEngineBid: bid(2, "H"),
      expectedRuleId: "fiveCardHigh.response.transferToS",
      expect: { hcp: 0, transferSuit: "S" }
    },
    {
      id: "bridgespelen.response.1nt.stayman-four-card-major",
      domain: "response",
      source: sources.oneNotrumpResponse,
      claim: "After 1NT, bid 2C Stayman with 8+ HCP and at least one four-card major.",
      verdict: "match",
      auction: oneNotrumpAuction,
      hand: ["KS", "QS", "2S", "3S", "QH", "2H", "3H", "JD", "2D", "3D", "2C", "3C", "4C"],
      expectedSourceBid: bid(2, "C"),
      expectedEngineBid: bid(2, "C"),
      expectedRuleId: "fiveCardHigh.response.stayman",
      expect: { hcp: 8 }
    },
    {
      id: "bridgespelen.response.1h.raise-pass-with-support-under-six",
      domain: "response",
      source: sources.oneMajorResponse,
      claim: "After a one-major opening, pass with fit and 0-5 HCP.",
      verdict: "match",
      auction: oneHeartAuction,
      hand: ["2S", "3S", "4S", "2H", "3H", "4H", "2D", "3D", "4D", "2C", "3C", "4C", "5C"],
      expectedSourceBid: pass(),
      expectedEngineBid: pass(),
      expectedRuleId: "fiveCardHigh.pass.responseNoAction",
      expect: { hcp: 0 }
    },
    {
      id: "bridgespelen.response.1h.raise-single",
      domain: "response",
      source: sources.oneMajorResponse,
      claim: "After a one-major opening, raise to two with fit and 6-9 points.",
      verdict: "match",
      auction: oneHeartAuction,
      hand: ["2S", "3S", "4S", "AH", "2H", "3H", "QD", "2D", "3D", "4D", "2C", "3C", "4C"],
      expectedSourceBid: bid(2, "H"),
      expectedEngineBid: bid(2, "H"),
      expectedRuleId: "fiveCardHigh.response.raise",
      expect: { hcp: 6, support: 3 }
    },
    {
      id: "bridgespelen.response.1s.raise-single",
      domain: "response",
      source: sources.oneMajorResponse,
      claim: "The same three-card-fit raise structure applies after a 1S opening.",
      verdict: "match",
      auction: oneSpadeAuction,
      hand: ["AH", "2H", "3H", "AS", "2S", "3S", "JD", "2D", "3D", "4D", "2C", "3C", "4C"],
      expectedSourceBid: bid(2, "S"),
      expectedEngineBid: bid(2, "S"),
      expectedRuleId: "fiveCardHigh.response.raise",
      expect: { hcp: 9, support: 3 }
    },
    {
      id: "bridgespelen.response.1h.raise-invite",
      domain: "response",
      source: sources.oneMajorResponse,
      claim: "After a one-major opening, raise to three with fit and 10-11 points.",
      verdict: "match",
      auction: oneHeartAuction,
      hand: ["AS", "QS", "2S", "JH", "2H", "3H", "KD", "2D", "3D", "2C", "3C", "4C", "5C"],
      expectedSourceBid: bid(3, "H"),
      expectedEngineBid: bid(3, "H"),
      expectedRuleId: "fiveCardHigh.response.raise",
      expect: { hcp: 10, support: 3 }
    },
    {
      id: "bridgespelen.response.1h.raise-game",
      domain: "response",
      source: sources.oneMajorResponse,
      claim: "After a one-major opening, raise to game with fit and 12+ points.",
      verdict: "match",
      auction: oneHeartAuction,
      hand: ["AS", "KS", "2S", "QH", "2H", "3H", "KD", "2D", "3D", "2C", "3C", "4C", "5C"],
      expectedSourceBid: bid(4, "H"),
      expectedEngineBid: bid(4, "H"),
      expectedRuleId: "fiveCardHigh.response.raise",
      expect: { hcp: 12, support: 3 }
    },
    {
      id: "bridgespelen.response.1h.no-fit-pass-under-six",
      domain: "response",
      source: sources.oneMajorResponse,
      claim: "Without a fit after a one-major opening, pass with 0-5 HCP.",
      verdict: "match",
      auction: oneHeartAuction,
      hand: ["KS", "2S", "3S", "2H", "3H", "QD", "2D", "3D", "4D", "2C", "3C", "4C", "5C"],
      expectedSourceBid: pass(),
      expectedEngineBid: pass(),
      expectedRuleId: "fiveCardHigh.pass.responseNoAction",
      expect: { hcp: 5 }
    },
    {
      id: "bridgespelen.response.1h.bid-one-spade-with-four",
      domain: "response",
      source: sources.oneMajorResponse,
      claim: "After 1H, always bid 1S with a four-card spade suit and enough values.",
      verdict: "match",
      auction: oneHeartAuction,
      hand: ["KS", "QS", "3S", "2S", "2H", "3H", "QD", "2D", "3D", "2C", "3C", "4C", "5C"],
      expectedSourceBid: bid(1, "S"),
      expectedEngineBid: bid(1, "S"),
      expectedRuleId: "fiveCardHigh.response.newSuit",
      expect: { hcp: 7 }
    },
    {
      id: "bridgespelen.response.1h.new-suit-longest-color",
      domain: "response",
      source: sources.oneMajorResponse,
      claim: "Without a fit, bid the longest available new suit first when strength allows a two-level response.",
      verdict: "match",
      auction: oneHeartAuction,
      hand: ["AS", "2S", "3S", "2H", "3H", "KD", "2D", "3D", "QC", "JC", "TC", "2C", "4C"],
      expectedSourceBid: bid(2, "C"),
      expectedEngineBid: bid(2, "C"),
      expectedRuleId: "fiveCardHigh.response.newSuit",
      expect: { hcp: 10 }
    },
    {
      id: "bridgespelen.response.1h.new-suit-highest-of-two-five-card-suits",
      domain: "response",
      source: sources.oneMajorResponse,
      claim: "Without a fit, bid the highest-ranking suit first with two five-card side suits.",
      verdict: "match",
      auction: oneHeartAuction,
      hand: ["2S", "2H", "3H", "KD", "QD", "JD", "2D", "3D", "AC", "QC", "2C", "3C", "4C"],
      expectedSourceBid: bid(2, "D"),
      expectedEngineBid: bid(2, "D"),
      expectedRuleId: "fiveCardHigh.response.newSuit",
      expect: { hcp: 12 }
    },
    {
      id: "bridgespelen.response.1h.new-suit-lowest-of-four-card-suits",
      domain: "response",
      source: sources.oneMajorResponse,
      claim: "Without a fit, bid the lowest-ranking suit first with multiple four-card side suits.",
      verdict: "match",
      auction: oneHeartAuction,
      hand: ["AS", "2S", "3S", "2H", "3H", "KD", "QD", "2D", "3D", "QC", "JC", "2C", "3C"],
      expectedSourceBid: bid(2, "C"),
      expectedEngineBid: bid(2, "C"),
      expectedRuleId: "fiveCardHigh.response.newSuit",
      expect: { hcp: 12 }
    },
    {
      id: "bridgespelen.response.1s.bid-two-hearts-with-five",
      domain: "response",
      source: sources.oneMajorResponse,
      claim: "After 1S, bid 2H with a five-card heart suit and 10+ HCP when there is no spade fit.",
      verdict: "match",
      auction: oneSpadeAuction,
      hand: ["2S", "3S", "KH", "QH", "JH", "2H", "3H", "QD", "2D", "3D", "QC", "2C", "3C"],
      expectedSourceBid: bid(2, "H"),
      expectedEngineBid: bid(2, "H"),
      expectedRuleId: "fiveCardHigh.response.newSuit",
      expect: { hcp: 10 }
    },
    {
      id: "bridgespelen.response.1h.one-notrump-without-fit-or-biddable-color",
      domain: "response",
      source: sources.oneMajorResponse,
      claim: "After a one-major opening, bid 1NT with 6-9 HCP when there is no fit and no biddable suit.",
      verdict: "match",
      auction: oneHeartAuction,
      hand: ["2S", "3S", "4S", "2H", "3H", "JD", "2D", "3D", "AC", "JC", "2C", "3C", "4C"],
      expectedSourceBid: bid(1, "NT"),
      expectedEngineBid: bid(1, "NT"),
      expectedRuleId: "fiveCardHigh.response.notrump",
      expect: { hcp: 6 }
    },
    {
      id: "bridgespelen.response.1s.one-notrump-without-fit-or-biddable-color",
      domain: "response",
      source: sources.oneMajorResponse,
      claim: "After a one-major opening, bid 1NT with 6-9 HCP when there is no fit and no biddable suit.",
      verdict: "match",
      auction: oneSpadeAuction,
      hand: ["2S", "3S", "AH", "2H", "3H", "KD", "2D", "3D", "4D", "2C", "3C", "4C", "5C"],
      expectedSourceBid: bid(1, "NT"),
      expectedEngineBid: bid(1, "NT"),
      expectedRuleId: "fiveCardHigh.response.notrump",
      expect: { hcp: 7 }
    },
    {
      id: "bridgespelen.response.1h.balanced-invite-with-four-card-minor-overlap",
      domain: "response",
      source: sources.oneMajorResponse,
      claim: "The page's 2NT invite bullet overlaps with its 2C/2D new-suit bullet when responder has 10-11 HCP, balanced shape, and a four-card minor.",
      verdict: "siteSimplification",
      rationale: "The engine resolves the overlap by using the forcing new-suit route, which keeps the auction descriptive and still follows the page's new-suit rule.",
      auction: oneHeartAuction,
      hand: ["AS", "2S", "3S", "2H", "3H", "KD", "2D", "3D", "4D", "QC", "JC", "2C", "3C"],
      expectedEngineBid: bid(2, "C"),
      expectedRuleId: "fiveCardHigh.response.newSuit",
      expect: { hcp: 10, balanced: true }
    },
    {
      id: "bridgespelen.response.1c.major-before-minor-support",
      domain: "response",
      source: sources.oneMinorResponse,
      claim: "After a minor opening, search for a major fit before supporting the minor.",
      verdict: "match",
      auction: oneClubAuction,
      hand: ["2S", "QH", "JH", "2H", "3H", "KD", "2D", "3D", "2C", "3C", "4C", "5C", "6C"],
      expectedSourceBid: bid(1, "H"),
      expectedEngineBid: bid(1, "H"),
      expectedRuleId: "fiveCardHigh.response.newSuit",
      expect: { hcp: 6 }
    },
    {
      id: "bridgespelen.response.1c.no-four-card-club-raise",
      domain: "response",
      source: sources.oneMinorResponse,
      claim: "After 1C, support clubs only from a five-card club suit when no new one-level suit is available.",
      verdict: "match",
      auction: oneClubAuction,
      hand: ["2S", "3S", "4S", "2H", "3H", "4H", "QD", "2D", "3D", "AC", "2C", "3C", "4C"],
      expectedSourceBid: bid(1, "NT"),
      expectedEngineBid: bid(1, "NT"),
      expectedRuleId: "fiveCardHigh.response.notrump",
      expect: { hcp: 6 }
    },
    {
      id: "bridgespelen.response.1d.four-card-diamond-support",
      domain: "response",
      source: sources.oneMinorResponse,
      claim: "After 1D, a four-card diamond suit is enough to support diamonds when no new major is available.",
      verdict: "match",
      auction: oneDiamondAuction,
      hand: ["2S", "3S", "4S", "2H", "3H", "4H", "QD", "JD", "2D", "3D", "KC", "2C", "3C"],
      expectedSourceBid: bid(2, "D"),
      expectedEngineBid: bid(2, "D"),
      expectedRuleId: "fiveCardHigh.response.raise",
      expect: { hcp: 6, support: 4 }
    },
    {
      id: "bridgespelen.response.1d.one-notrump-with-four-clubs-and-six-nine",
      domain: "response",
      source: sources.oneMinorResponse,
      claim: "After 1D, 2C needs 10+ HCP; with 6-9 HCP and clubs but no major, bid 1NT.",
      verdict: "match",
      auction: oneDiamondAuction,
      hand: ["2S", "3S", "4S", "2H", "3H", "4H", "QD", "2D", "3D", "AC", "2C", "3C", "4C"],
      expectedSourceBid: bid(1, "NT"),
      expectedEngineBid: bid(1, "NT"),
      expectedRuleId: "fiveCardHigh.response.notrump",
      expect: { hcp: 6 }
    },
    {
      id: "bridgespelen.continuation.jacoby.accept-heart-transfer",
      domain: "continuation",
      source: sources.jacobyContinuation,
      claim: "After 1NT - 2D, opener is required to bid 2H.",
      verdict: "match",
      auction: heartTransferAuction,
      seat: "North",
      hand: ["AS", "KS", "2S", "QH", "JH", "2H", "KD", "QD", "2D", "3D", "2C", "3C", "4C"],
      expectedSourceBid: bid(2, "H"),
      expectedEngineBid: bid(2, "H"),
      expectedRuleId: "fiveCardHigh.continuation.acceptTransfer",
      expect: { hcp: 15, transferSuit: "H" }
    },
    {
      id: "bridgespelen.continuation.jacoby.accept-spade-transfer",
      domain: "continuation",
      source: sources.jacobyContinuation,
      claim: "After 1NT - 2H, opener is required to bid 2S.",
      verdict: "match",
      auction: spadeTransferAuction,
      seat: "North",
      hand: ["AS", "KS", "2S", "QH", "JH", "2H", "KD", "QD", "2D", "3D", "2C", "3C", "4C"],
      expectedSourceBid: bid(2, "S"),
      expectedEngineBid: bid(2, "S"),
      expectedRuleId: "fiveCardHigh.continuation.acceptTransfer",
      expect: { hcp: 15, transferSuit: "S" }
    },
    {
      id: "bridgespelen.continuation.stayman.no-major",
      domain: "continuation",
      source: sources.staymanContinuation,
      claim: "After Stayman, opener bids 2D with no four- or five-card major.",
      verdict: "match",
      auction: staymanAuction,
      seat: "North",
      hand: ["AS", "KS", "2S", "QH", "JH", "2H", "KD", "QD", "2D", "3D", "2C", "3C", "4C"],
      expectedSourceBid: bid(2, "D"),
      expectedEngineBid: bid(2, "D"),
      expectedRuleId: "fiveCardHigh.continuation.staymanAnswer",
      expect: { hcp: 15 }
    },
    {
      id: "bridgespelen.continuation.stayman.hearts",
      domain: "continuation",
      source: sources.staymanContinuation,
      claim: "After Stayman, opener bids 2H with a four- or five-card heart suit.",
      verdict: "match",
      auction: staymanAuction,
      seat: "North",
      hand: ["AS", "KS", "2S", "AH", "QH", "2H", "3H", "QD", "2D", "3D", "2C", "3C", "4C"],
      expectedSourceBid: bid(2, "H"),
      expectedEngineBid: bid(2, "H"),
      expectedRuleId: "fiveCardHigh.continuation.staymanAnswer",
      expect: { hcp: 15 }
    },
    {
      id: "bridgespelen.continuation.stayman.spades-no-hearts",
      domain: "continuation",
      source: sources.staymanContinuation,
      claim: "After Stayman, opener bids 2S with a four- or five-card spade suit and no four-card heart suit.",
      verdict: "match",
      auction: staymanAuction,
      seat: "North",
      hand: ["AS", "KS", "QS", "2S", "QH", "2H", "3H", "KD", "JD", "3D", "2C", "3C", "4C"],
      expectedSourceBid: bid(2, "S"),
      expectedEngineBid: bid(2, "S"),
      expectedRuleId: "fiveCardHigh.continuation.staymanAnswer",
      expect: { hcp: 15 }
    }
  ];
}

module.exports = {
  createBridgespelenFiveCardHighClaims,
  sources
};

(function initBridgeRules(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const parts = isCommonJs
    ? {
        core: require("./rules/core.js"),
        auction: require("./rules/auction.js"),
        scoring: require("./rules/scoring.js"),
        biddingFiveCardHigh: require("./rules/bidding-five-card-high.js"),
        playMechanics: require("./rules/play-mechanics.js"),
        playPlan: require("./rules/play-plan.js"),
        cardPlay: require("./rules/card-play.js")
      }
    : root.BridgeRulesParts || {};
  const rules = factory(parts);
  if (isCommonJs) module.exports = rules;
  root.BridgeRules = rules;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRules(parts) {
  "use strict";

  const requiredParts = [
    "core",
    "auction",
    "scoring",
    "biddingFiveCardHigh",
    "playMechanics",
    "playPlan",
    "cardPlay"
  ];
  for (const partName of requiredParts) {
    if (!parts[partName]) throw new Error("BridgeRules missing module: " + partName);
  }

  const publicNames = [
    "seats",
    "suits",
    "handSuitOrder",
    "bidStrains",
    "rankOrder",
    "biddingSystems",
    "vulnerabilityForDeal",
    "dealerIndexForDeal",
    "teamOf",
    "partnerOf",
    "isTeamVulnerable",
    "compareCards",
    "createDeck",
    "randomFromSeed",
    "dealHands",
    "countSuits",
    "hcp",
    "handShape",
    "callTypes",
    "Pass",
    "Bid",
    "Double",
    "Redouble",
    "normalizeBid",
    "sameCall",
    "isPass",
    "isDouble",
    "isRedouble",
    "isContractBid",
    "isContractCall",
    "finalContract",
    "highestBidCall",
    "highestBid",
    "isBidHigher",
    "chooseFiveCardHighBid",
    "chooseFiveCardHighBidResult",
    "chooseFiveCardHighBidTarget",
    "chooseFiveCardHighOpening",
    "chooseFiveCardHighResponse",
    "chooseFiveCardHighOpenerRebid",
    "chooseFiveCardHighResponderRebid",
    "canDoubleFromAuction",
    "canRedoubleFromAuction",
    "auctionComplete",
    "findDeclarer",
    "contractTrickPoints",
    "overtrickPoints",
    "downScore",
    "calculatePassOutScore",
    "calculateBridgeScore",
    "legalCards",
    "createPlayPlan",
    "chooseCardPlay",
    "beats",
    "currentWinningPlay"
  ];
  const sources = requiredParts.map((partName) => parts[partName]);
  const rules = {};
  for (const name of publicNames) {
    const source = sources.find((candidate) => Object.prototype.hasOwnProperty.call(candidate, name));
    if (!source) throw new Error("BridgeRules missing public export: " + name);
    rules[name] = source[name];
  }
  return rules;
});

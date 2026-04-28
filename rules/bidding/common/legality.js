(function initBridgeRulesBiddingCommonLegality(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const deps = isCommonJs ? { auction: require("../../auction.js") } : root.BridgeRulesParts || {};
  const api = factory(deps.auction);
  if (isCommonJs) module.exports = api;
  root.BridgeRulesParts = root.BridgeRulesParts || {};
  root.BridgeRulesParts.biddingCommonLegality = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesBiddingCommonLegality(auction) {
  "use strict";

  const { legalizeFiveCardHighBidTarget } = auction;

  function legalizeBidTarget(target, lastBid, seat, auctionCalls) {
    return legalizeFiveCardHighBidTarget(target, lastBid, seat, auctionCalls);
  }

  return {
    legalizeBidTarget,
    legalizeFiveCardHighBidTarget: legalizeBidTarget
  };
});

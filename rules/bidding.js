(function initBridgeRulesBidding(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const deps = isCommonJs
    ? {
        core: require("./core.js"),
        fiveCardHigh: require("./bidding-five-card-high.js")
      }
    : root.BridgeRulesParts || {};
  const api = factory(deps.core, deps.fiveCardHigh || deps.biddingFiveCardHigh);
  if (isCommonJs) module.exports = api;
  root.BridgeRulesParts = root.BridgeRulesParts || {};
  root.BridgeRulesParts.bidding = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesBidding(core, fiveCardHigh) {
  "use strict";

  const { biddingSystems } = core;

  const defaultSystemId = biddingSystems.fiveCardHigh.id;
  const bidSystemProfiles = {
    [defaultSystemId]: biddingSystems.fiveCardHigh
  };
  const bidChoosers = {
    [defaultSystemId]: fiveCardHigh.chooseFiveCardHighBidResult
  };

  function chooseBid(options = {}) {
    const systemId = options.systemId || defaultSystemId;
    const chooseBidForSystem = bidChoosers[systemId];
    if (!chooseBidForSystem) throw new Error(`Unknown bidding system: ${systemId}`);
    return chooseBidForSystem({
      ...options,
      systemId,
      agreements: {
        ...(bidSystemProfiles[systemId]?.conventionDefaults || {}),
        ...(options.agreements || {})
      }
    });
  }

  return {
    chooseBid
  };
});

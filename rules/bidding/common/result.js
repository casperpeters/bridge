(function initBridgeRulesBiddingCommonResult(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const api = factory();
  if (isCommonJs) module.exports = api;
  root.BridgeRulesParts = root.BridgeRulesParts || {};
  root.BridgeRulesParts.biddingCommonResult = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesBiddingCommonResult() {
  "use strict";

  function bidChoiceResult(system, bid, ruleName, confidence, reason, extra = {}) {
    const systemId = typeof system === "string" ? system : system?.id;
    return {
      bid,
      ruleId: `${systemId}.${ruleName}`,
      confidence,
      reason,
      system: systemId,
      ...extra
    };
  }

  return {
    bidChoiceResult
  };
});

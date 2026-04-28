(function initBridgeRulesBiddingFiveCardHighContext(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const deps = isCommonJs ? { core: require("../../core.js"), auction: require("../../auction.js") } : root.BridgeRulesParts || {};
  const api = factory(deps.core, deps.auction);
  if (isCommonJs) module.exports = api;
  root.BridgeRulesParts = root.BridgeRulesParts || {};
  root.BridgeRulesParts.biddingFiveCardHighContext = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesBiddingFiveCardHighContext(core, auction) {
  "use strict";

  const { suits, partnerOf } = core;
  const {
    bidEquals,
    cheapestLevelForStrain,
    highestBid,
    isUncontestedAuctionForSeat,
    lastPartnerContractCall,
    partnershipContractCalls
  } = auction;

  const fiveCardHighAuctionPhases = {
    noSeat: "noSeat",
    competitive: "competitive",
    opening: "opening",
    noPartnerBid: "noPartnerBid",
    response: "response",
    openerRebid: "openerRebid",
    responderRebid: "responderRebid",
    openerThird: "openerThird",
    responderAfterFourthSuit: "responderAfterFourthSuit",
    naturalContinuation: "naturalContinuation"
  };

  function auctionContextForFiveCardHigh(auctionCalls = [], seat) {
    const calls = auctionCalls || [];
    const partnershipCalls = seat ? partnershipContractCalls(calls, seat) : [];
    const openingCall = partnershipCalls[0] || null;
    const responseCall = partnershipCalls[1] || null;
    const openerRebidCall = partnershipCalls[2] || null;
    const responderRebidCall = partnershipCalls[3] || null;
    const openerThirdCall = partnershipCalls[4] || null;
    const lastPartnerCall = seat ? lastPartnerContractCall(calls, seat) : null;
    const uncontested = Boolean(seat && isUncontestedAuctionForSeat(calls, seat));
    const fourthSuit = fourthSuitForAuction(openingCall?.bid, responseCall?.bid, openerRebidCall?.bid);
    const isFourthSuitForcing = isFourthSuitForcingBid(openingCall?.bid, responseCall?.bid, openerRebidCall?.bid, responderRebidCall?.bid);
    const base = {
      auction: calls,
      seat,
      uncontested,
      partnershipCalls,
      openingCall,
      responseCall,
      openerRebidCall,
      responderRebidCall,
      openerThirdCall,
      lastPartnerCall,
      lastBid: highestBid(calls),
      fourthSuit,
      isFourthSuitForcing
    };

    if (!seat) return { ...base, phase: fiveCardHighAuctionPhases.noSeat };
    if (!uncontested) return { ...base, phase: fiveCardHighAuctionPhases.competitive };
    if (!partnershipCalls.length) return { ...base, phase: fiveCardHighAuctionPhases.opening };
    if (!lastPartnerCall) return { ...base, phase: fiveCardHighAuctionPhases.noPartnerBid };
    if (partnershipCalls.length === 1) return { ...base, phase: fiveCardHighAuctionPhases.response };
    if (partnershipCalls.length === 2 && openingCall.seat === seat) return { ...base, phase: fiveCardHighAuctionPhases.openerRebid };
    if (partnershipCalls.length === 3 && openingCall.seat === partnerOf(seat)) return { ...base, phase: fiveCardHighAuctionPhases.responderRebid };
    if (partnershipCalls.length >= 4 && openingCall.seat === seat) return { ...base, phase: fiveCardHighAuctionPhases.openerThird };
    if (partnershipCalls.length >= 5 && openingCall.seat === partnerOf(seat)) return { ...base, phase: fiveCardHighAuctionPhases.responderAfterFourthSuit };
    return { ...base, phase: fiveCardHighAuctionPhases.naturalContinuation };
  }

  function fourthSuitForAuction(openingBid, responseBid, openerRebid) {
    if (!openingBid || !responseBid || !openerRebid) return null;
    const strains = [openingBid.strain, responseBid.strain, openerRebid.strain];
    if (strains.some((strain) => strain === "NT")) return null;
    if (new Set(strains).size !== 3) return null;
    return suits.find((suit) => !strains.includes(suit)) || null;
  }

  function isFourthSuitForcingBid(openingBid, responseBid, openerRebid, responderRebid) {
    const fourthSuit = fourthSuitForAuction(openingBid, responseBid, openerRebid);
    return Boolean(fourthSuit && bidEquals(responderRebid, cheapestLevelForStrain(fourthSuit, openerRebid), fourthSuit));
  }

  return {
    fiveCardHighAuctionPhases,
    auctionContextForFiveCardHigh,
    fourthSuitForAuction,
    isFourthSuitForcingBid
  };
});

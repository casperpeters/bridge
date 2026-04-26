(function initBridgeRulesAuction(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const deps = isCommonJs ? { core: require("./core.js") } : root.BridgeRulesParts || {};
  const api = factory(deps.core);
  if (isCommonJs) module.exports = api;
  root.BridgeRulesParts = root.BridgeRulesParts || {};
  root.BridgeRulesParts.auction = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesAuction(core) {
  "use strict";

  const { bidStrains, teamOf, partnerOf } = core;
  const callTypes = {
    pass: "Pass",
    bid: "Bid",
    double: "Double",
    redouble: "Redouble"
  };

  function Pass() {
        return { type: callTypes.pass };
      }

  function Bid(level, strain) {
        return { type: callTypes.bid, level, strain };
      }

  function Double() {
        return { type: callTypes.double };
      }

  function Redouble() {
        return { type: callTypes.redouble };
      }

  function callBid(callOrBid) {
        if (callOrBid && typeof callOrBid === "object" && Object.prototype.hasOwnProperty.call(callOrBid, "bid")) return callOrBid.bid;
        return callOrBid;
      }

  function callType(callOrBid) {
        const bid = callBid(callOrBid);
        if (typeof bid === "string") return bid;
        if (bid?.type) return bid.type;
        if (isContractBid(bid)) return callTypes.bid;
        return null;
      }

  function normalizeBid(callOrBid) {
        const bid = callBid(callOrBid);
        if (isPass(bid)) return Pass();
        if (isDouble(bid)) return Double();
        if (isRedouble(bid)) return Redouble();
        if (isContractBid(bid)) return Bid(bid.level, bid.strain);
        return null;
      }

  function isPass(callOrBid) {
        return callType(callOrBid) === callTypes.pass;
      }

  function isDouble(callOrBid) {
        return callType(callOrBid) === callTypes.double;
      }

  function isRedouble(callOrBid) {
        return callType(callOrBid) === callTypes.redouble;
      }

  function isContractBid(bid) {
        const candidate = callBid(bid);
        return Boolean(
          candidate &&
          typeof candidate === "object" &&
          (candidate.type === callTypes.bid || !candidate.type) &&
          Number.isInteger(candidate.level) &&
          candidate.strain
        );
      }

  function isContractCall(call) {
        return isContractBid(call?.bid);
      }

  function highestBidCall(auction) {
        return [...auction].reverse().find(isContractCall) || null;
      }

  function finalContract(auction) {
        const contractCall = highestBidCall(auction);
        if (!contractCall) return null;
        const contractIndex = auction.lastIndexOf(contractCall);
        const contract = { level: contractCall.bid.level, strain: contractCall.bid.strain };
        for (const call of auction.slice(contractIndex + 1)) {
          if (isDouble(call)) {
            contract.doubled = true;
            contract.redoubled = false;
          }
          if (isRedouble(call)) {
            contract.doubled = true;
            contract.redoubled = true;
          }
          if (isContractCall(call)) {
            contract.doubled = false;
            contract.redoubled = false;
          }
        }
        return contract;
      }

  function highestBid(auction) {
        return finalContract(auction);
      }

  function isBidHigher(bid, current) {
        if (!current) return true;
        if (bid.level !== current.level) return bid.level > current.level;
        return bidStrains.indexOf(bid.strain) > bidStrains.indexOf(current.strain);
      }

  function auctionComplete(auction) {
        if (auction.length < 4) return false;
        const lastFourPass = auction.slice(-4).every(isPass);
        if (lastFourPass) return true;
        if (!highestBidCall(auction)) return false;
        return auction.slice(-3).every(isPass);
      }

  function findDeclarer(auction, contract) {
        const contractCall = highestBidCall(auction);
        if (!contractCall) return null;
        const declaringTeam = teamOf(contractCall.seat);
        return auction.find((call) => isContractCall(call) && teamOf(call.seat) === declaringTeam && call.bid.strain === contract.strain)?.seat || null;
      }

  function bid(level, strain) {
        return Bid(level, strain);
      }

  function bidEquals(candidate, level, strain) {
        return isContractBid(candidate) && candidate.level === level && candidate.strain === strain;
      }

  function gameLevel(strain) {
        return strain === "C" || strain === "D" ? 5 : strain === "NT" ? 3 : 4;
      }

  function cheapestLevelForStrain(strain, current) {
        if (!current) return 1;
        for (let level = Math.max(1, current.level); level <= 7; level++) {
          if (isBidHigher({ level, strain }, current)) return level;
        }
        return 8;
      }

  function nextAvailableBid(candidate, current) {
        if (!current || isBidHigher(candidate, current)) return candidate;
        for (let level = current.level; level <= 7; level++) {
          for (const strain of bidStrains) {
            const next = bid(level, strain);
            if (isBidHigher(next, current)) return next;
          }
        }
        return null;
      }

  function legalizeFiveCardHighBidTarget(target, lastBid, seat, auction) {
        const call = normalizeBid(target);
        if (!call || isPass(call)) return Pass();
        if (isDouble(call)) return canDoubleFromAuction(auction, seat) ? Double() : Pass();
        if (isRedouble(call)) return canRedoubleFromAuction(auction, seat) ? Redouble() : Pass();
        if (!isContractBid(call)) return Pass();
        if (call.level < 1 || call.level > 7) return Pass();
        return isBidHigher(call, lastBid) ? call : Pass();
      }

  function canDoubleFromAuction(auction, seat) {
        const contractCall = highestBidCall(auction);
        if (!contractCall || teamOf(contractCall.seat) === teamOf(seat)) return false;
        const contract = highestBid(auction);
        return Boolean(contract && !contract.doubled && !contract.redoubled);
      }

  function canRedoubleFromAuction(auction, seat) {
        const contractCall = highestBidCall(auction);
        if (!contractCall || teamOf(contractCall.seat) !== teamOf(seat)) return false;
        const contract = highestBid(auction);
        return Boolean(contract?.doubled && !contract.redoubled);
      }

  function partnershipContractCalls(auction, seat) {
        return auction.filter((call) => teamOf(call.seat) === teamOf(seat) && isContractBid(call.bid));
      }

  function lastPartnerContractCall(auction, seat) {
        return [...auction].reverse().find((call) => call.seat === partnerOf(seat) && isContractBid(call.bid)) || null;
      }

  function isUncontestedAuctionForSeat(auction, seat) {
        return auction.every((call) => teamOf(call.seat) === teamOf(seat) || isPass(call.bid));
      }

  function sameCall(left, right) {
        const leftBid = normalizeBid(left);
        const rightBid = normalizeBid(right);
        if (!leftBid || !rightBid) return leftBid === rightBid;
        if (leftBid.type !== rightBid.type) return false;
        if (leftBid.type !== callTypes.bid) return true;
        return leftBid.level === rightBid.level && leftBid.strain === rightBid.strain;
      }

  return {
    callTypes,
    Pass,
    Bid,
    Double,
    Redouble,
    callBid,
    callType,
    normalizeBid,
    isPass,
    isDouble,
    isRedouble,
    isContractBid,
    isContractCall,
    highestBidCall,
    finalContract,
    highestBid,
    isBidHigher,
    auctionComplete,
    findDeclarer,
    bid,
    bidEquals,
    gameLevel,
    cheapestLevelForStrain,
    nextAvailableBid,
    legalizeFiveCardHighBidTarget,
    canDoubleFromAuction,
    canRedoubleFromAuction,
    partnershipContractCalls,
    lastPartnerContractCall,
    isUncontestedAuctionForSeat,
    sameCall
  };
});

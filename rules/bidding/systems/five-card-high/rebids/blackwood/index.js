(function initBridgeRulesBiddingFiveCardHighBlackwoodRebids(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const deps = isCommonJs
    ? {
        core: require("../../../../../core.js"),
        auction: require("../../../../../auction.js"),
        result: require("../../../../common/result.js"),
        conventions: require("../../conventions.js")
      }
    : root.BridgeRulesParts || {};
  const api = factory(
    deps.core,
    deps.auction,
    deps.result || deps.biddingCommonResult,
    deps.conventions || deps.biddingFiveCardHighConventions
  );
  if (isCommonJs) module.exports = api;
  root.BridgeRulesParts = root.BridgeRulesParts || {};
  root.BridgeRulesParts.biddingFiveCardHighBlackwoodRebids = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesBiddingFiveCardHighBlackwoodRebids(core, auction, resultHelpers, conventionHelpers) {
  "use strict";

  const { biddingSystems } = core;
  const { Pass, bid, bidEquals, gameLevel, lastPartnerContractCall } = auction;
  const { bidChoiceResult } = resultHelpers;
  const {
    agreedTrumpAfterAcceptedNotrumpTransfer,
    agreedTrumpFromAuction,
    auctionAgreementFromAuction,
    blackwoodResponseBidForAceCount,
    blackwoodShownAceCount,
    chooseBlackwoodFollowup,
    countAces,
    isBlackwoodAsk,
    supportLengthForOpening
  } = conventionHelpers;
  const auctionAgreementFromAuctionForFiveCardHigh = auctionAgreementFromAuction || agreedTrumpFromAuction;

  function fiveCardHighBidChoiceResult(bid, ruleName, confidence, reason, extra = {}) {
    return bidChoiceResult(biddingSystems.fiveCardHigh, bid, ruleName, confidence, reason, extra);
  }

  function chooseBlackwoodResponderRebidTarget({ shape, hand, openingBid, responseBid, openerRebid } = {}) {
    if (!isSingleMajorRaiseGameFiveCardHigh(openingBid, responseBid, openerRebid)) return null;
    return rebidResponderAfterSingleMajorRaiseGameFiveCardHigh(shape, hand, openingBid, responseBid, openerRebid);
  }

  function chooseBlackwoodOpenerThirdBidTarget({ hand, openingBid, responseBid, openerRebid, responderRebid, openerThirdBid } = {}) {
    const blackwoodTrump = agreedTrumpAfterAcceptedNotrumpTransfer(openingBid, responseBid, openerRebid);
    if (openerThirdBid || !blackwoodTrump || !isBlackwoodAsk(responderRebid)) return null;
    return blackwoodResponseBidForAceCount(countAces(hand)) || Pass();
  }

  function chooseBlackwoodResponseToPartnerAskTarget({ hand = [], auction = [], seat } = {}) {
    return blackwoodAgreementForPartnerAsk(auction, seat)
      ? blackwoodResponseBidForAceCount(countAces(hand)) || Pass()
      : null;
  }

  function chooseBlackwoodResponderAfterOpenerThirdBidTarget({ shape, hand, openingBid, responseBid, openerRebid, responderRebid, openerThirdBid, openerThirdBidResult } = {}) {
    const blackwoodTrump = agreedTrumpAfterAcceptedNotrumpTransfer(openingBid, responseBid, openerRebid);
    if (!blackwoodTrump || !isBlackwoodAsk(responderRebid) || !openerThirdBid) return null;
    return chooseBlackwoodFollowup({
      trumpSuit: blackwoodTrump,
      askerAceCount: countAces(hand),
      partnerAceCount: blackwoodShownAceCount(openerThirdBid, openerThirdBidResult),
      partnershipMinimumHcp: shape.hcp + notrumpOpeningMinimumHcp(openingBid)
    }) || Pass();
  }

  function isSingleMajorRaiseGameFiveCardHigh(openingBid, responseBid, openerRebid) {
    return (
      isMajorSingleRaiseFiveCardHigh(openingBid, responseBid) &&
      openerRebid?.strain === openingBid.strain &&
      openerRebid.level === gameLevel(openingBid.strain)
    );
  }

  function isMajorSingleRaiseFiveCardHigh(openingBid, responseBid) {
    return (
      openingBid?.level === 1 &&
      (openingBid.strain === "H" || openingBid.strain === "S") &&
      responseBid?.level === 2 &&
      responseBid.strain === openingBid.strain
    );
  }

  function rebidResponderAfterSingleMajorRaiseGameFiveCardHigh(shape, hand, openingBid, responseBid, openerRebid) {
    return shouldResponderAskBlackwoodAfterSingleMajorRaiseGame(shape, hand, openingBid, responseBid, openerRebid)
      ? bid(4, "NT")
      : Pass();
  }

  function shouldResponderAskBlackwoodAfterSingleMajorRaiseGame(shape, hand, openingBid, responseBid, openerRebid) {
    if (!isSingleMajorRaiseGameFiveCardHigh(openingBid, responseBid, openerRebid)) return false;
    const trumpSuit = openerRebid.strain;
    if (shape.counts[trumpSuit] < supportLengthForOpening(trumpSuit)) return false;
    const partnershipMinimumHcp = shape.hcp + 18;
    return partnershipMinimumHcp >= 33 && countAces(hand) >= 2;
  }

  function describeBlackwoodResponderRebidChoice(chosenBid, shape, openingBid, responseBid, openerRebid, base) {
    if (!isSingleMajorRaiseGameFiveCardHigh(openingBid, responseBid, openerRebid) || !isBlackwoodAsk(chosenBid)) return null;
    return fiveCardHighBidChoiceResult(chosenBid, "continuation.blackwoodAsk", "basic", "Ask for aces with four notrump after partner bid game over a single major raise.", {
      ...blackwoodBaseExtra(chosenBid, shape, openingBid, responseBid, openerRebid, base),
      convention: "blackwood",
      artificial: true,
      forcing: true,
      trumpSuit: openerRebid.strain,
      agreementSource: "majorRaise",
      aceCount: base.aceCount,
      partnershipMinimumHcp: shape.hcp + 18,
      slamTargetHcp: 33
    });
  }

  function describeBlackwoodOpenerThirdBidChoice(chosenBid, shape, openingBid, responseBid, openerRebid, responderRebid, base) {
    const blackwoodTrump = agreedTrumpAfterAcceptedNotrumpTransfer(openingBid, responseBid, openerRebid);
    if (!blackwoodTrump || !isBlackwoodAsk(responderRebid) || chosenBid.level !== 5) return null;
    return fiveCardHighBidChoiceResult(chosenBid, "continuation.blackwoodResponse", "basic", "Answer partner's four-notrump ace ask.", {
      ...blackwoodOpenerThirdBidExtra(chosenBid, shape, openingBid, responseBid, openerRebid, base),
      convention: "blackwood",
      artificial: true,
      forcing: true,
      trumpSuit: blackwoodTrump,
      aceCount: base.aceCount
    });
  }

  function describeBlackwoodResponseToPartnerAskChoice(chosenBid, hand, auction, seat, base) {
    const blackwoodAgreement = blackwoodAgreementForPartnerAsk(auction, seat);
    if (!blackwoodAgreement || chosenBid?.level !== 5) return null;
    return fiveCardHighBidChoiceResult(chosenBid, "continuation.blackwoodResponse", "basic", "Answer partner's four-notrump ace ask.", {
      ...base,
      category: "continuation",
      convention: "blackwood",
      trumpSuit: blackwoodAgreement.trumpSuit,
      agreementSource: blackwoodAgreement.source,
      agreementConfidence: blackwoodAgreement.confidence,
      suit: chosenBid.strain,
      aceCount: countAces(hand)
    });
  }

  function describeBlackwoodResponderAfterOpenerThirdBidChoice(chosenBid, shape, partnershipCalls, base) {
    const openingBid = partnershipCalls[0]?.bid;
    const responseBid = partnershipCalls[1]?.bid;
    const openerRebid = partnershipCalls[2]?.bid;
    const responderRebid = partnershipCalls[3]?.bid;
    const openerThirdBid = partnershipCalls[4]?.bid;
    const blackwoodTrump = agreedTrumpAfterAcceptedNotrumpTransfer(openingBid, responseBid, openerRebid);
    if (!blackwoodTrump || !isBlackwoodAsk(responderRebid) || !openerThirdBid) return null;

    const partnerAceCount = blackwoodShownAceCount(openerThirdBid, partnershipCalls[4]?.bidResult);
    const askerAceCount = base.aceCount;
    const missingAces = Number.isInteger(partnerAceCount) ? 4 - askerAceCount - partnerAceCount : null;
    const ruleName = chosenBid.level === 7
      ? "continuation.blackwoodGrandSlam"
      : chosenBid.level === 6
        ? "continuation.blackwoodSmallSlam"
        : "continuation.blackwoodSignoff";
    return fiveCardHighBidChoiceResult(chosenBid, ruleName, "basic", "Choose the final contract after partner answers the four-notrump ace ask.", {
      ...base,
      category: "continuation",
      convention: "blackwood",
      trumpSuit: blackwoodTrump,
      suit: chosenBid.strain,
      aceCount: askerAceCount,
      partnerAceCount,
      missingAces,
      partnershipMinimumHcp: shape.hcp + notrumpOpeningMinimumHcp(openingBid)
    });
  }

  function blackwoodBaseExtra(chosenBid, shape, openingBid, responseBid, openerRebid, base) {
    return {
      ...base,
      category: "continuation",
      suit: chosenBid.strain,
      length: shape.counts[chosenBid.strain] || 0,
      openingSuit: openingBid?.strain || null,
      responseSuit: responseBid?.strain || null,
      openerRebidSuit: openerRebid?.strain || null,
      partnerSuit: openerRebid?.strain || null,
      support: openerRebid?.strain && openerRebid.strain !== "NT" ? shape.counts[openerRebid.strain] : 0
    };
  }

  function blackwoodOpenerThirdBidExtra(chosenBid, shape, openingBid, responseBid, openerRebid, base) {
    return {
      ...base,
      category: "continuation",
      suit: chosenBid.strain,
      length: shape.counts[chosenBid.strain] || 0,
      openingSuit: openingBid?.strain || null,
      responseSuit: responseBid?.strain || null,
      openerRebidSuit: openerRebid?.strain || null,
      fourthSuit: null
    };
  }

  function notrumpOpeningMinimumHcp(openingBid) {
    if (bidEquals(openingBid, 2, "NT")) return 20;
    if (bidEquals(openingBid, 1, "NT")) return 15;
    return 0;
  }

  function blackwoodAgreementForPartnerAsk(auction = [], seat) {
    const lastPartnerCall = lastPartnerContractCall(auction, seat);
    if (!isBlackwoodAsk(lastPartnerCall?.bid)) return null;
    return auctionAgreementFromAuctionForFiveCardHigh(auction, seat);
  }

  const blackwoodRebidFamily = {
    id: "rebids.blackwood",
    order: 31,
    chooseResponderRebidTarget: chooseBlackwoodResponderRebidTarget,
    chooseOpenerThirdBidTarget: chooseBlackwoodOpenerThirdBidTarget,
    chooseResponderAfterOpenerThirdBidTarget: chooseBlackwoodResponderAfterOpenerThirdBidTarget,
    describeResponderRebidChoice: describeBlackwoodResponderRebidChoice,
    describeOpenerThirdBidChoice: describeBlackwoodOpenerThirdBidChoice,
    describeResponderAfterOpenerThirdBidChoice: describeBlackwoodResponderAfterOpenerThirdBidChoice,
    chooseResponseToPartnerAskTarget: chooseBlackwoodResponseToPartnerAskTarget,
    describeResponseToPartnerAskChoice: describeBlackwoodResponseToPartnerAskChoice
  };

  return {
    blackwoodRebidFamily,
    chooseBlackwoodResponderRebidTarget: blackwoodRebidFamily.chooseResponderRebidTarget,
    chooseBlackwoodOpenerThirdBidTarget: blackwoodRebidFamily.chooseOpenerThirdBidTarget,
    chooseBlackwoodResponderAfterOpenerThirdBidTarget: blackwoodRebidFamily.chooseResponderAfterOpenerThirdBidTarget,
    chooseBlackwoodResponseToPartnerAskTarget: blackwoodRebidFamily.chooseResponseToPartnerAskTarget,
    isSingleMajorRaiseGameFiveCardHigh,
    rebidResponderAfterSingleMajorRaiseGameFiveCardHigh,
    shouldResponderAskBlackwoodAfterSingleMajorRaiseGame,
    describeBlackwoodResponderRebidChoice: blackwoodRebidFamily.describeResponderRebidChoice,
    describeBlackwoodOpenerThirdBidChoice: blackwoodRebidFamily.describeOpenerThirdBidChoice,
    describeBlackwoodResponderAfterOpenerThirdBidChoice: blackwoodRebidFamily.describeResponderAfterOpenerThirdBidChoice,
    describeBlackwoodResponseToPartnerAskChoice: blackwoodRebidFamily.describeResponseToPartnerAskChoice,
    notrumpOpeningMinimumHcp
  };
});

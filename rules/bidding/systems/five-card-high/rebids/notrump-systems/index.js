(function initBridgeRulesBiddingFiveCardHighNotrumpSystemRebids(root, factory) {
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
  root.BridgeRulesParts.biddingFiveCardHighNotrumpSystemRebids = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesBiddingFiveCardHighNotrumpSystemRebids(core, auction, resultHelpers, conventionHelpers) {
  "use strict";

  const { biddingSystems } = core;
  const { Pass, bid, bidEquals, gameLevel } = auction;
  const { bidChoiceResult } = resultHelpers;
  const { notrumpTransferSuit, shouldUseBlackwoodAfterAcceptedTransfer } = conventionHelpers;

  function fiveCardHighBidChoiceResult(bid, ruleName, confidence, reason, extra = {}) {
    return bidChoiceResult(biddingSystems.fiveCardHigh, bid, ruleName, confidence, reason, extra);
  }

  function chooseNotrumpSystemsOpenerRebidTarget({ shape, openingBid, responseBid } = {}) {
    if (bidEquals(openingBid, 1, "NT")) return rebidAfterOneNotrumpResponseFiveCardHigh(shape, responseBid);
    if (bidEquals(openingBid, 2, "NT")) return rebidAfterTwoNotrumpResponseFiveCardHigh(shape, responseBid);
    return null;
  }

  function chooseNotrumpSystemsResponderRebidTarget({ shape, openingBid, responseBid, openerRebid } = {}) {
    if (bidEquals(openingBid, 1, "NT")) return rebidResponderAfterOneNotrumpFiveCardHigh(shape, responseBid, openerRebid, openingBid);
    if (bidEquals(openingBid, 2, "NT")) return rebidResponderAfterTwoNotrumpFiveCardHigh(shape, responseBid, openerRebid, openingBid);
    return null;
  }

  function chooseNotrumpSystemsOpenerThirdBidTarget({ shape, openingBid, responseBid, openerRebid, responderRebid } = {}) {
    if (!bidEquals(openingBid, 1, "NT")) return null;

    if (bidEquals(responseBid, 2, "C")) {
      if (bidEquals(responderRebid, 2, "NT")) {
        if ((openerRebid?.strain === "H" || openerRebid?.strain === "S") && shape.hcp >= 16 && shape.counts[openerRebid.strain] >= 5) {
          return bid(3, openerRebid.strain);
        }
        if (openerRebid?.strain === "H" && shape.counts.S >= 4) return shape.hcp >= 16 ? bid(4, "S") : bid(3, "S");
        return shape.hcp >= 16 ? bid(3, "NT") : Pass();
      }
      if (bidEquals(responderRebid, 3, "NT")) {
        if (openerRebid?.strain === "H" && shape.counts.S >= 4) return bid(4, "S");
        return Pass();
      }
      if ((responderRebid.strain === "H" || responderRebid.strain === "S") && responderRebid.level === 3) {
        return shape.hcp >= 16 ? bid(4, responderRebid.strain) : Pass();
      }
    }

    const transferSuit = notrumpTransferSuit(openingBid, responseBid);
    if (!transferSuit) return Pass();
    const hasThreeCardSupport = shape.counts[transferSuit] >= 3;
    if (transferSuit === "H" && bidEquals(responderRebid, 2, "S")) {
      if (shape.counts.S >= 4) return shape.hcp >= 16 ? bid(4, "S") : Pass();
      if (hasThreeCardSupport) return shape.hcp >= 16 ? bid(4, "H") : bid(3, "H");
      return shape.hcp >= 16 ? bid(3, "NT") : bid(2, "NT");
    }
    if (transferSuit === "S" && bidEquals(responderRebid, 3, "H")) {
      if (shape.counts.H >= 4) return bid(4, "H");
      if (hasThreeCardSupport) return bid(4, "S");
      return bid(3, "NT");
    }
    if (transferSuit === "S" && bidEquals(responderRebid, 4, "H")) {
      return shape.counts.H >= 3 ? Pass() : bid(4, "S");
    }
    if (bidEquals(responderRebid, 2, "NT")) {
      if (shape.hcp <= 15) return hasThreeCardSupport ? bid(3, transferSuit) : Pass();
      return hasThreeCardSupport ? bid(4, transferSuit) : bid(3, "NT");
    }
    if (bidEquals(responderRebid, 3, "NT") && hasThreeCardSupport) return bid(4, transferSuit);
    if (bidEquals(responderRebid, 3, transferSuit)) return shape.hcp >= 16 ? bid(4, transferSuit) : Pass();
    return Pass();
  }

  function rebidAfterOneNotrumpResponseFiveCardHigh(shape, responseBid) {
    if (bidEquals(responseBid, 2, "C")) {
      if (shape.counts.H >= 4) return bid(2, "H");
      if (shape.counts.S >= 4) return bid(2, "S");
      return bid(2, "D");
    }
    if (bidEquals(responseBid, 2, "D")) return bid(2, "H");
    if (bidEquals(responseBid, 2, "H")) return bid(2, "S");
    if (bidEquals(responseBid, 2, "NT")) return shape.hcp >= 16 ? bid(3, "NT") : Pass();
    return Pass();
  }

  function rebidAfterTwoNotrumpResponseFiveCardHigh(shape, responseBid) {
    if (bidEquals(responseBid, 3, "C")) {
      if (shape.counts.H >= 4) return bid(3, "H");
      if (shape.counts.S >= 4) return bid(3, "S");
      return bid(3, "D");
    }
    if (bidEquals(responseBid, 3, "D")) return bid(3, "H");
    if (bidEquals(responseBid, 3, "H")) return bid(3, "S");
    return Pass();
  }

  function rebidResponderAfterOneNotrumpFiveCardHigh(shape, responseBid, openerRebid, openingBid = bid(1, "NT")) {
    if (bidEquals(responseBid, 2, "C")) {
      const foundFit = (openerRebid.strain === "H" || openerRebid.strain === "S") && shape.counts[openerRebid.strain] >= 4;
      if (foundFit) {
        if (shape.hcp >= 10) return bid(4, openerRebid.strain);
        if (shape.hcp >= 8) return bid(3, openerRebid.strain);
      }
      if (shape.hcp >= 10) return bid(3, "NT");
      if (shape.hcp >= 8) return bid(2, "NT");
      return Pass();
    }

    const transferSuit = bidEquals(responseBid, 2, "D") ? "H" : bidEquals(responseBid, 2, "H") ? "S" : null;
    if (transferSuit) {
      const otherMajor = transferSuit === "H" ? "S" : "H";
      const transferLength = shape.counts[transferSuit] || 0;
      const otherMajorLength = shape.counts[otherMajor] || 0;
      if (shape.hcp < 8) return Pass();
      if (transferSuit === "H" && transferLength === 5 && otherMajorLength >= 4) return bid(2, "S");
      if (transferSuit === "S" && transferLength === 5 && otherMajorLength >= 5 && shape.hcp >= 10) return bid(4, "H");
      if (transferSuit === "S" && transferLength === 5 && otherMajorLength >= 4) {
        if (shape.hcp >= 10) return bid(3, "H");
        return bid(2, "NT");
      }
      if (shouldUseBlackwoodAfterAcceptedTransfer(shape, openingBid, transferSuit)) return bid(4, "NT");
      if (shape.counts[transferSuit] >= 6) {
        if (shape.hcp >= 10) return bid(4, transferSuit);
        return bid(3, transferSuit);
      }
      if (shape.hcp >= 10) return bid(3, "NT");
      return bid(2, "NT");
    }
    return Pass();
  }

  function rebidResponderAfterTwoNotrumpFiveCardHigh(shape, responseBid, openerRebid, openingBid = bid(2, "NT")) {
    if (bidEquals(responseBid, 3, "C")) {
      if ((openerRebid.strain === "H" || openerRebid.strain === "S") && shape.counts[openerRebid.strain] >= 4) return bid(4, openerRebid.strain);
      return bid(3, "NT");
    }
    const transferSuit = bidEquals(responseBid, 3, "D") ? "H" : bidEquals(responseBid, 3, "H") ? "S" : null;
    if (transferSuit && shouldUseBlackwoodAfterAcceptedTransfer(shape, openingBid, transferSuit)) return bid(4, "NT");
    if (transferSuit && shape.counts[transferSuit] >= 6) return bid(4, transferSuit);
    if (transferSuit && shape.hcp >= 4) return bid(3, "NT");
    return Pass();
  }

  function describeNotrumpSystemsOpenerRebidChoice(chosenBid, shape, openingBid, responseBid, base) {
    if (!bidEquals(openingBid, 1, "NT") && !bidEquals(openingBid, 2, "NT")) return null;
    const extra = notrumpSystemsBaseExtra(chosenBid, shape, openingBid, responseBid, base);
    if (responseBid?.strain === "C") {
      return fiveCardHighBidChoiceResult(chosenBid, "continuation.staymanAnswer", "basic", "Answer Stayman by showing a four-card major or denying one.", extra);
    }
    const transferSuit = notrumpTransferSuit(openingBid, responseBid);
    if (transferSuit && chosenBid.strain === transferSuit) {
      return fiveCardHighBidChoiceResult(chosenBid, "continuation.acceptTransfer", "basic", "Accept partner's transfer by bidding the requested major.", {
        ...extra,
        transferSuit
      });
    }
    return null;
  }

  function describeNotrumpSystemsResponderRebidChoice(chosenBid, shape, openingBid, responseBid, openerRebid, base) {
    if (!bidEquals(openingBid, 1, "NT") && !bidEquals(openingBid, 2, "NT")) return null;
    const extra = notrumpSystemsBaseExtra(chosenBid, shape, openingBid, responseBid, base, { openerRebid });
    const transferSuit = notrumpTransferSuit(openingBid, responseBid);
    if (transferSuit) {
      return describeResponderAfterTransfer(chosenBid, shape, openingBid, openerRebid, transferSuit, extra, base);
    }
    if (bidEquals(openingBid, 1, "NT") && bidEquals(responseBid, 2, "C")) {
      return describeResponderAfterStayman(chosenBid, shape, openerRebid, extra);
    }
    return null;
  }

  function describeResponderAfterTransfer(chosenBid, shape, openingBid, openerRebid, transferSuit, extra, base) {
    const isOneNotrumpTransfer = bidEquals(openingBid, 1, "NT");
    const isTwoNotrumpTransfer = bidEquals(openingBid, 2, "NT");
    const otherMajor = transferSuit === "H" ? "S" : "H";
    const transferLength = shape.counts[transferSuit] || 0;
    const otherMajorLength = shape.counts[otherMajor] || 0;
    const transferExtra = {
      ...extra,
      convention: "jacobyTransfer",
      openingLevel: openingBid.level,
      transferSuit,
      suit: chosenBid.strain,
      length: transferLength,
      otherMajor,
      otherMajorLength
    };
    if (bidEquals(chosenBid, 4, "NT")) {
      return fiveCardHighBidChoiceResult(
        chosenBid,
        "continuation.blackwoodAsk",
        "basic",
        "Ask for aces with four notrump after a major-suit transfer has established a trump suit.",
        {
          ...transferExtra,
          artificial: true,
          forcing: true,
          trumpSuit: transferSuit,
          aceCount: base.aceCount,
          partnershipMinimumHcp: shape.hcp + notrumpOpeningMinimumHcp(openingBid)
        }
      );
    }
    if (isOneNotrumpTransfer && transferSuit === "H" && chosenBid.strain === "S" && transferLength === 5 && otherMajorLength >= 4) {
      return fiveCardHighBidChoiceResult(chosenBid, "continuation.responderAfterTransferFiveHeartsFourSpades", "basic", "Show four spades after transferring to hearts with at least invitational values.", {
        ...transferExtra,
        range: "8+"
      });
    }
    if (isOneNotrumpTransfer && transferSuit === "S" && chosenBid.strain === "H" && transferLength === 5 && otherMajorLength >= 5) {
      return fiveCardHighBidChoiceResult(chosenBid, "continuation.responderAfterTransferTwoFiveMajorsGame", "basic", "Jump to four hearts with two five-card majors after transferring to spades.", {
        ...transferExtra,
        range: "10+"
      });
    }
    if (isOneNotrumpTransfer && transferSuit === "S" && chosenBid.strain === "H" && transferLength === 5 && otherMajorLength >= 4) {
      return fiveCardHighBidChoiceResult(chosenBid, "continuation.responderAfterTransferFiveSpadesFourHeartsGame", "basic", "Show four hearts at the three-level after transferring to spades; this is game-forcing.", {
        ...transferExtra,
        range: "10+",
        gameForcing: true
      });
    }
    if (isOneNotrumpTransfer && transferSuit === "S" && chosenBid.strain === "NT" && transferLength === 5 && otherMajorLength >= 4) {
      return fiveCardHighBidChoiceResult(chosenBid, "continuation.responderAfterTransferFiveSpadesFourHeartsInvite", "basic", "Invite with two notrump because showing hearts would require the three-level.", {
        ...transferExtra,
        range: "8-9"
      });
    }
    if (chosenBid.strain === transferSuit && shape.counts[transferSuit] >= 6) {
      return fiveCardHighBidChoiceResult(
        chosenBid,
        chosenBid.level === gameLevel(transferSuit) ? "continuation.responderAfterTransferSixCardGame" : "continuation.responderAfterTransferSixCardInvite",
        "basic",
        "Rebid the transferred major with a six-card suit or longer after partner accepted the transfer.",
        {
          ...transferExtra,
          range: isTwoNotrumpTransfer ? "4+" : chosenBid.level === gameLevel(transferSuit) ? "10+" : "8-9"
        }
      );
    }
    if (chosenBid.strain === "NT") {
      return fiveCardHighBidChoiceResult(
        chosenBid,
        chosenBid.level === 3 ? "continuation.responderAfterTransferNotrumpGame" : "continuation.responderAfterTransferNotrumpInvite",
        "basic",
        "Rebid notrump with only a five-card transferred major and invitational or game-going strength.",
        {
          ...transferExtra,
          range: isTwoNotrumpTransfer ? "4+" : chosenBid.level === 3 ? "10+" : "8-9"
        }
      );
    }
    return null;
  }

  function describeResponderAfterStayman(chosenBid, shape, openerRebid, extra) {
    const foundFit = (openerRebid?.strain === "H" || openerRebid?.strain === "S") && shape.counts[openerRebid.strain] >= 4;
    if (foundFit && chosenBid.strain === openerRebid.strain) {
      return fiveCardHighBidChoiceResult(
        chosenBid,
        chosenBid.level === gameLevel(openerRebid.strain) ? "continuation.responderAfterStaymanFitGame" : "continuation.responderAfterStaymanFitInvite",
        "basic",
        "Choose the major after Stayman found a fit.",
        {
          ...extra,
          convention: "stayman",
          fitSuit: openerRebid.strain,
          support: shape.counts[openerRebid.strain] || 0,
          range: chosenBid.level === gameLevel(openerRebid.strain) ? "10+" : "8-9"
        }
      );
    }
    if (chosenBid.strain === "NT") {
      return fiveCardHighBidChoiceResult(
        chosenBid,
        chosenBid.level === 3 ? "continuation.responderAfterStaymanNoFitGame" : "continuation.responderAfterStaymanNoFitInvite",
        "basic",
        "Return to notrump after Stayman did not find responder's major-suit fit.",
        {
          ...extra,
          convention: "stayman",
          deniedFitSuit: openerRebid?.strain || null,
          range: chosenBid.level === 3 ? "10+" : "8-9"
        }
      );
    }
    return null;
  }

  function describeNotrumpSystemsOpenerThirdBidChoice(chosenBid, shape, openingBid, responseBid, openerRebid, responderRebid, base) {
    if (!bidEquals(openingBid, 1, "NT")) return null;
    const extra = notrumpSystemsBaseExtra(chosenBid, shape, openingBid, responseBid, base, { openerRebid });
    const transferSuit = notrumpTransferSuit(openingBid, responseBid);
    if (transferSuit) {
      return describeOpenerAfterTransfer(chosenBid, shape, transferSuit, responderRebid, extra);
    }
    if (bidEquals(responseBid, 2, "C")) {
      return describeOpenerAfterStayman(chosenBid, shape, openerRebid, responderRebid, extra);
    }
    return null;
  }

  function describeOpenerAfterTransfer(chosenBid, shape, transferSuit, responderRebid, extra) {
    const transferExtra = {
      ...extra,
      convention: "jacobyTransfer",
      transferSuit,
      responderSecondSuit: responderRebid?.strain || null,
      support: chosenBid.strain && chosenBid.strain !== "NT" ? shape.counts[chosenBid.strain] || 0 : 0
    };
    if (transferSuit === "H" && bidEquals(responderRebid, 2, "S")) {
      return fiveCardHighBidChoiceResult(
        chosenBid,
        chosenBid.strain === "NT" ? "continuation.openerAfterTransferFiveHeartsFourSpadesNotrump" : "continuation.openerAfterTransferFiveHeartsFourSpadesChooseMajor",
        "basic",
        "Choose a strain after responder showed five hearts and four spades after a transfer.",
        {
          ...transferExtra,
          gameBid: chosenBid.level >= 4,
          maximum: shape.hcp >= 16
        }
      );
    }
    if (transferSuit === "S" && bidEquals(responderRebid, 3, "H")) {
      return fiveCardHighBidChoiceResult(chosenBid, "continuation.openerAfterTransferFiveSpadesFourHeartsChooseGame", "basic", "Choose a game after responder showed five spades and four hearts; the three-heart bid is forcing to game.", {
        ...transferExtra,
        gameForcing: true,
        supportSpades: shape.counts.S || 0,
        supportHearts: shape.counts.H || 0
      });
    }
    if (transferSuit === "S" && bidEquals(responderRebid, 4, "H")) {
      return fiveCardHighBidChoiceResult(chosenBid, "continuation.openerAfterTransferTwoFiveMajorsChooseSpades", "basic", "Correct to spades after responder showed two five-card majors and opener prefers spades.", {
        ...transferExtra,
        supportSpades: shape.counts.S || 0,
        supportHearts: shape.counts.H || 0
      });
    }
    if (bidEquals(responderRebid, 2, "NT")) {
      const ruleName = chosenBid.strain === transferSuit
        ? chosenBid.level === gameLevel(transferSuit)
          ? "continuation.openerAfterTransferInviteMaximumSupportGame"
          : "continuation.openerAfterTransferInviteMinimumSupport"
        : "continuation.openerAfterTransferInviteMaximumNotrump";
      return fiveCardHighBidChoiceResult(chosenBid, ruleName, "basic", "Choose after responder's invitational notrump rebid following a Jacoby transfer.", {
        ...transferExtra,
        support: shape.counts[transferSuit] || 0,
        maximum: shape.hcp >= 16,
        range: shape.hcp >= 16 ? "16-17" : "15"
      });
    }
    return null;
  }

  function describeOpenerAfterStayman(chosenBid, shape, openerRebid, responderRebid, extra) {
    if (openerRebid?.strain === "H" && (bidEquals(responderRebid, 2, "NT") || bidEquals(responderRebid, 3, "NT"))) {
      const hasSpadeFit = shape.counts.S >= 4;
      const staymanExtra = {
        ...extra,
        convention: "stayman",
        responderDeniedSuit: "H",
        possibleFitSuit: "S",
        support: hasSpadeFit ? shape.counts.S : 0,
        maximum: shape.hcp >= 16,
        gameForcing: bidEquals(responderRebid, 3, "NT")
      };
      if (bidEquals(responderRebid, 2, "NT") && chosenBid.strain === openerRebid.strain && shape.counts[openerRebid.strain] >= 5) {
        return fiveCardHighBidChoiceResult(chosenBid, "continuation.openerAfterStaymanInviteFiveCardMajor", "basic", "Show a five-card major after opening 1NT and accepting responder's Stayman invite.", {
          ...staymanExtra,
          fiveCardMajor: openerRebid.strain,
          length: shape.counts[openerRebid.strain] || 0
        });
      }
      if (chosenBid.strain === "S") {
        return fiveCardHighBidChoiceResult(chosenBid, chosenBid.level === 4 ? "continuation.openerAfterStaymanNoHeartFitSpadeGame" : "continuation.openerAfterStaymanNoHeartFitSpadeInvite", "basic", "Choose spades after responder denied a heart fit but may still have four spades.", staymanExtra);
      }
      if (chosenBid.strain === "NT") {
        return fiveCardHighBidChoiceResult(chosenBid, chosenBid.level === 3 ? "continuation.openerAfterStaymanNoHeartFitNotrumpGame" : "continuation.openerAfterStaymanNoHeartFitNotrumpInvite", "basic", "Choose notrump after responder denied a heart fit and opener has no spade fit.", staymanExtra);
      }
    }
    if (openerRebid?.strain === "S" && bidEquals(responderRebid, 2, "NT")) {
      const staymanExtra = {
        ...extra,
        convention: "stayman",
        responderDeniedSuit: "S",
        maximum: shape.hcp >= 16
      };
      if (chosenBid.strain === openerRebid.strain && shape.counts[openerRebid.strain] >= 5) {
        return fiveCardHighBidChoiceResult(chosenBid, "continuation.openerAfterStaymanInviteFiveCardMajor", "basic", "Show a five-card major after opening 1NT and accepting responder's Stayman invite.", {
          ...staymanExtra,
          fiveCardMajor: openerRebid.strain,
          length: shape.counts[openerRebid.strain] || 0,
          support: shape.counts[openerRebid.strain] || 0
        });
      }
      if (chosenBid.strain === "NT") {
        return fiveCardHighBidChoiceResult(chosenBid, chosenBid.level === 3 ? "continuation.openerAfterStaymanNoFitNotrumpGame" : "continuation.openerAfterStaymanNoFitNotrumpInvite", "basic", "Choose notrump after responder invited and did not fit opener's shown major.", staymanExtra);
      }
    }
    return null;
  }

  function notrumpSystemsBaseExtra(chosenBid, shape, openingBid, responseBid, base, { openerRebid = null } = {}) {
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

  function notrumpOpeningMinimumHcp(openingBid) {
    if (bidEquals(openingBid, 2, "NT")) return 20;
    if (bidEquals(openingBid, 1, "NT")) return 15;
    return 0;
  }

  return {
    chooseNotrumpSystemsOpenerRebidTarget,
    chooseNotrumpSystemsResponderRebidTarget,
    chooseNotrumpSystemsOpenerThirdBidTarget,
    rebidAfterOneNotrumpResponseFiveCardHigh,
    rebidAfterTwoNotrumpResponseFiveCardHigh,
    rebidResponderAfterOneNotrumpFiveCardHigh,
    rebidResponderAfterTwoNotrumpFiveCardHigh,
    describeNotrumpSystemsOpenerRebidChoice,
    describeNotrumpSystemsResponderRebidChoice,
    describeNotrumpSystemsOpenerThirdBidChoice,
    notrumpOpeningMinimumHcp
  };
});

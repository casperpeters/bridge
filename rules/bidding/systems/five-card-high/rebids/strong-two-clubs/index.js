(function initBridgeRulesBiddingFiveCardHighStrongTwoClubsRebids(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const deps = isCommonJs
    ? {
        core: require("../../../../../core.js"),
        auction: require("../../../../../auction.js"),
        valuation: require("../../../../common/valuation.js"),
        result: require("../../../../common/result.js"),
        conventions: require("../../conventions.js")
      }
    : root.BridgeRulesParts || {};
  const api = factory(
    deps.core,
    deps.auction,
    deps.valuation || deps.biddingFiveCardHighValuation,
    deps.result || deps.biddingCommonResult,
    deps.conventions || deps.biddingFiveCardHighConventions
  );
  if (isCommonJs) module.exports = api;
  root.BridgeRulesParts = root.BridgeRulesParts || {};
  root.BridgeRulesParts.biddingFiveCardHighStrongTwoClubsRebids = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesBiddingFiveCardHighStrongTwoClubsRebids(core, auction, valuationHelpers, resultHelpers, conventionHelpers) {
  "use strict";

  const { biddingSystems } = core;
  const {
    Pass,
    bid,
    bidEquals,
    gameLevel,
    cheapestLevelForStrain,
    isBidHigher
  } = auction;
  const { strongTwoClubsPlayingTricksContext } = valuationHelpers;
  const { bidChoiceResult } = resultHelpers;
  const {
    notrumpTransferSuit,
    bestSuitByLength,
    chooseMajorByLength,
    chooseSuitByLengthThenRank,
    shouldUseBlackwoodAfterAcceptedTransfer
  } = conventionHelpers;

  function fiveCardHighBidChoiceResult(bid, ruleName, confidence, reason, extra = {}) {
    return bidChoiceResult(biddingSystems.fiveCardHigh, bid, ruleName, confidence, reason, extra);
  }

  function rebidAfterStrongTwoClubsFiveCardHigh(shape, hand) {
    if (shape.balanced) {
      if (shape.hcp >= 25) return bid(3, "NT");
      if (shape.hcp >= 23) return bid(2, "NT");
    }
    const jumpMajor = chooseStrongTwoClubsJumpRebidMajor(shape, hand);
    if (jumpMajor) return bid(3, jumpMajor);
    const suit = chooseSuitByLengthThenRank(["S", "H", "D", "C"], shape, 5, true) || bestSuitByLength(shape);
    return bid(suit === "C" || suit === "D" ? 3 : 2, suit);
  }

  function rebidAfterStrongTwoClubsPositiveResponseFiveCardHigh(shape, hand, responseBid) {
    if ((responseBid.strain === "H" || responseBid.strain === "S") && shape.counts[responseBid.strain] >= 3) {
      return bid(gameLevel(responseBid.strain), responseBid.strain);
    }
    if (shape.balanced) {
      if (shape.hcp >= 25) return bid(3, "NT");
      if (shape.hcp >= 23) return isBidHigher(bid(2, "NT"), responseBid) ? bid(2, "NT") : bid(3, "NT");
    }
    const suit = chooseSuitByLengthThenRank(["S", "H", "D", "C"], shape, 5, true) || bestSuitByLength(shape);
    const level = cheapestLevelForStrain(suit, responseBid);
    return level <= 7 ? bid(level, suit) : bid(3, "NT");
  }

  function chooseStrongTwoClubsOpenerRebidTarget({ shape, hand, openingBid, responseBid } = {}) {
    if (!bidEquals(openingBid, 2, "C")) return null;
    return isStrongTwoClubsPositiveResponse(responseBid)
      ? rebidAfterStrongTwoClubsPositiveResponseFiveCardHigh(shape, hand, responseBid)
      : rebidAfterStrongTwoClubsFiveCardHigh(shape, hand);
  }

  function chooseStrongTwoClubsResponderRebidTarget({ shape, openingBid, responseBid, openerRebid } = {}) {
    if (!isStrongTwoClubsTwoNotrumpRebid(openingBid, responseBid, openerRebid)) return null;
    return respondAfterStrongTwoClubsTwoNotrumpRebidFiveCardHigh(shape);
  }

  function chooseStrongTwoClubsOpenerThirdBidTarget({ shape, openingBid, responseBid, openerRebid, responderRebid } = {}) {
    if (!isStrongTwoClubsTwoNotrumpRebid(openingBid, responseBid, openerRebid)) return null;
    return rebidAfterStrongTwoClubsTwoNotrumpResponseFiveCardHigh(shape, responderRebid);
  }

  function chooseStrongTwoClubsResponderAfterOpenerThirdBidTarget({ shape, openingBid, responseBid, openerRebid, responderRebid, openerThirdBid } = {}) {
    if (!openerThirdBid || !isStrongTwoClubsTwoNotrumpRebid(openingBid, responseBid, openerRebid)) return null;
    return rebidResponderAfterStrongTwoClubsTwoNotrumpContinuationFiveCardHigh(shape, responderRebid, openerThirdBid);
  }

  function chooseStrongTwoClubsJumpRebidMajor(shape, hand) {
    const major = chooseSuitByLengthThenRank(["S", "H"], shape, 6, true);
    if (!major) return null;
    const playingTricksContext = strongTwoClubsPlayingTricksContext(shape, hand);
    if (shape.hcp >= 24 || playingTricksContext.playingTricks >= 9) return major;
    return null;
  }

  function isStrongTwoClubsPositiveResponse(responseBid) {
    return bidEquals(responseBid, 2, "H") || bidEquals(responseBid, 2, "S") || bidEquals(responseBid, 3, "C") || bidEquals(responseBid, 3, "D");
  }

  function isStrongTwoClubsTwoNotrumpRebid(openingBid, responseBid, openerRebid) {
    return bidEquals(openingBid, 2, "C") && isStrongTwoClubsPositiveResponse(responseBid) && bidEquals(openerRebid, 2, "NT");
  }

  function respondAfterStrongTwoClubsTwoNotrumpRebidFiveCardHigh(shape) {
    const transferMajor = chooseMajorByLength(shape, 5);
    if (transferMajor === "H") return bid(3, "D");
    if (transferMajor === "S") return bid(3, "H");
    if ((shape.counts.H >= 4 || shape.counts.S >= 4) && shape.hcp >= 4) return bid(3, "C");
    if (shape.hcp >= 4) return bid(3, "NT");
    return Pass();
  }

  function rebidAfterStrongTwoClubsTwoNotrumpResponseFiveCardHigh(shape, responseBid) {
    if (bidEquals(responseBid, 3, "C")) {
      if (shape.counts.H >= 4) return bid(3, "H");
      if (shape.counts.S >= 4) return bid(3, "S");
      return bid(3, "D");
    }
    if (bidEquals(responseBid, 3, "D")) return bid(3, "H");
    if (bidEquals(responseBid, 3, "H")) return bid(3, "S");
    return Pass();
  }

  function rebidResponderAfterStrongTwoClubsTwoNotrumpContinuationFiveCardHigh(shape, responseBid, openerRebid) {
    if (bidEquals(responseBid, 3, "C")) {
      if ((openerRebid.strain === "H" || openerRebid.strain === "S") && shape.counts[openerRebid.strain] >= 4) return bid(4, openerRebid.strain);
      return bid(3, "NT");
    }
    const transferSuit = bidEquals(responseBid, 3, "D") ? "H" : bidEquals(responseBid, 3, "H") ? "S" : null;
    if (transferSuit && shouldUseBlackwoodAfterAcceptedTransfer(shape, bid(2, "NT"), transferSuit)) return bid(4, "NT");
    if (transferSuit && shape.counts[transferSuit] >= 6) return bid(4, transferSuit);
    if (transferSuit && shape.hcp >= 4) return bid(3, "NT");
    return Pass();
  }

  function isStrongTwoClubsTwoNotrumpStayman(responseBid) {
    return bidEquals(responseBid, 3, "C");
  }

  function strongTwoClubsTwoNotrumpTransferSuit(responseBid) {
    return notrumpTransferSuit(bid(2, "NT"), responseBid);
  }

  function describeStrongTwoClubsOpenerRebidChoice(chosenBid, shape, hand, openingBid, responseBid, base) {
    if (!bidEquals(openingBid, 2, "C")) return null;

    let extra = {
      ...base,
      category: "continuation",
      suit: chosenBid.strain,
      length: shape.counts[chosenBid.strain] || 0,
      openingSuit: openingBid?.strain || null,
      responseSuit: responseBid?.strain || null
    };

    if (isStrongTwoClubsPositiveResponse(responseBid)) {
      const playingTricksContext = strongTwoClubsPlayingTricksContext(shape, hand);
      extra = {
        ...extra,
        ...playingTricksContext,
        support: responseBid?.strain && responseBid.strain !== "NT" ? shape.counts[responseBid.strain] || 0 : 0
      };
      if (
        (responseBid.strain === "H" || responseBid.strain === "S") &&
        chosenBid.strain === responseBid.strain &&
        chosenBid.level === gameLevel(responseBid.strain) &&
        shape.counts[responseBid.strain] >= 3
      ) {
        return fiveCardHighBidChoiceResult(
          chosenBid,
          "continuation.strongTwoClubsPositiveMajorSupport",
          "basic",
          "Raise partner's positive major response with three-card support after the strong 2C opening.",
          extra
        );
      }
      if (chosenBid.strain === "NT") {
        return fiveCardHighBidChoiceResult(
          chosenBid,
          chosenBid.level === 2 ? "continuation.strongTwoClubsPositiveNotrumpRebid" : "continuation.strongTwoClubsPositiveNotrumpGame",
          "basic",
          "Rebid notrump after partner's positive response to the strong 2C opening.",
          extra
        );
      }
      return fiveCardHighBidChoiceResult(
        chosenBid,
        "continuation.strongTwoClubsPositiveSuitRebid",
        "basic",
        "Show opener's own long suit after partner's positive response to the strong 2C opening.",
        extra
      );
    }

    if (bidEquals(responseBid, 2, "D")) {
      const playingTricksContext = strongTwoClubsPlayingTricksContext(shape, hand);
      extra = { ...extra, ...playingTricksContext };
      if (
        chosenBid.level === 3 &&
        (chosenBid.strain === "H" || chosenBid.strain === "S") &&
        shape.counts[chosenBid.strain] >= 6 &&
        (shape.hcp >= 24 || playingTricksContext.playingTricks >= 9)
      ) {
        return fiveCardHighBidChoiceResult(
          chosenBid,
          "continuation.strongTwoClubsJumpRebid",
          "basic",
          "Jump rebid after the 2D waiting response to show an extra-strong hand with a long major.",
          extra
        );
      }
      return fiveCardHighBidChoiceResult(
        chosenBid,
        chosenBid.strain === "NT" ? "continuation.strongTwoClubsNotrumpRebid" : "continuation.strongTwoClubsSuitRebid",
        "basic",
        "Rebid after partner's 2D waiting response to the strong 2C opening.",
        extra
      );
    }

    return null;
  }

  function describeStrongTwoClubsResponderRebidChoice(chosenBid, shape, openingBid, responseBid, openerRebid, base) {
    if (!isStrongTwoClubsTwoNotrumpRebid(openingBid, responseBid, openerRebid)) return null;

    const extra = {
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
    const transferSuitAfterTwoNotrump = strongTwoClubsTwoNotrumpTransferSuit(chosenBid);
    if (bidEquals(chosenBid, 3, "C")) {
      return fiveCardHighBidChoiceResult(chosenBid, "continuation.strongTwoClubsTwoNotrumpStayman", "basic", "Use Stayman after opener's 2NT rebid in a strong 2C auction.", {
        ...extra,
        convention: "stayman",
        openingLevel: 2,
        range: "4+"
      });
    }
    if (transferSuitAfterTwoNotrump) {
      return fiveCardHighBidChoiceResult(chosenBid, `continuation.strongTwoClubsTwoNotrumpTransferTo${transferSuitAfterTwoNotrump}`, "basic", "Use a Jacoby transfer after opener's 2NT rebid in a strong 2C auction.", {
        ...extra,
        convention: "jacobyTransfer",
        openingLevel: 2,
        transferSuit: transferSuitAfterTwoNotrump,
        length: shape.counts[transferSuitAfterTwoNotrump] || 0
      });
    }
    if (bidEquals(chosenBid, 3, "NT")) {
      return fiveCardHighBidChoiceResult(chosenBid, "continuation.strongTwoClubsTwoNotrumpGame", "basic", "Choose 3NT after opener's 2NT rebid with enough values and no major-suit convention.", {
        ...extra,
        openingLevel: 2,
        range: "4+"
      });
    }
    return null;
  }

  function describeStrongTwoClubsOpenerThirdBidChoice(chosenBid, shape, openingBid, responseBid, openerRebid, responderRebid, base) {
    if (!isStrongTwoClubsTwoNotrumpRebid(openingBid, responseBid, openerRebid)) return null;

    const extra = {
      ...base,
      category: "continuation",
      suit: chosenBid.strain,
      length: shape.counts[chosenBid.strain] || 0,
      openingSuit: openingBid?.strain || null,
      responseSuit: responseBid?.strain || null,
      openerRebidSuit: openerRebid?.strain || null,
      fourthSuit: null
    };
    if (isStrongTwoClubsTwoNotrumpStayman(responderRebid)) {
      return fiveCardHighBidChoiceResult(chosenBid, "continuation.strongTwoClubsTwoNotrumpStaymanAnswer", "basic", "Answer Stayman after the strong 2C auction continued with opener's 2NT rebid.", {
        ...extra,
        convention: "stayman",
        openingLevel: 2
      });
    }
    const transferSuitAfterTwoNotrump = strongTwoClubsTwoNotrumpTransferSuit(responderRebid);
    if (transferSuitAfterTwoNotrump && chosenBid.strain === transferSuitAfterTwoNotrump) {
      return fiveCardHighBidChoiceResult(chosenBid, "continuation.strongTwoClubsTwoNotrumpAcceptTransfer", "basic", "Accept the Jacoby transfer after the strong 2C auction continued with opener's 2NT rebid.", {
        ...extra,
        convention: "jacobyTransfer",
        openingLevel: 2,
        transferSuit: transferSuitAfterTwoNotrump
      });
    }
    return null;
  }

  return {
    chooseStrongTwoClubsOpenerRebidTarget,
    chooseStrongTwoClubsResponderRebidTarget,
    chooseStrongTwoClubsOpenerThirdBidTarget,
    chooseStrongTwoClubsResponderAfterOpenerThirdBidTarget,
    describeStrongTwoClubsOpenerRebidChoice,
    describeStrongTwoClubsResponderRebidChoice,
    describeStrongTwoClubsOpenerThirdBidChoice
  };
});

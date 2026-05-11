(function initBridgeRulesCardPlayPlanFollowingRuffs(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const deps = isCommonJs
    ? {
        core: require("../../core.js"),
        playMechanics: require("../../play-mechanics.js"),
        playPlan: require("../../play-plan.js"),
        cardPlayCommon: require("../common.js"), followingCommon: require("./common.js")
      }
    : {
        core: root.BridgeRulesParts?.core,
        playMechanics: root.BridgeRulesParts?.playMechanics,
        playPlan: root.BridgeRulesParts?.playPlan,
        cardPlayCommon: root.BridgeRulesParts?.cardPlayCommon, followingCommon: root.BridgeRulesParts?.cardPlayPlanFollowingCommon
      };
  const api = factory(deps.core, deps.playMechanics, deps.playPlan, deps.cardPlayCommon, deps.followingCommon);
  if (isCommonJs) module.exports = api;
  root.BridgeRulesParts = root.BridgeRulesParts || {};
  root.BridgeRulesParts.cardPlayPlanFollowingRuffs = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesCardPlayPlanFollowingRuffs(core, playMechanics, playPlan, cardPlayCommon, followingCommon) {
  "use strict";

  if (!core) throw new Error("BridgeRules card-play plan-following cardPlayPlanFollowingRuffs missing core dependency");
  if (!playMechanics) throw new Error("BridgeRules card-play plan-following cardPlayPlanFollowingRuffs missing play-mechanics dependency");
  if (!playPlan) throw new Error("BridgeRules card-play plan-following cardPlayPlanFollowingRuffs missing play-plan dependency");
  if (!cardPlayCommon) throw new Error("BridgeRules card-play plan-following cardPlayPlanFollowingRuffs missing common dependency");

  const {
    suits,
    rankOrder,
    compareLowCards,
    lowestCard,
    highestCard,
    teamOf,
    partnerOf
  } = core;
  const { beats, currentWinningPlay } = playMechanics;
  const {
    cardsInSuit,
    hasRank,
    lowestSmallCardBelow,
    playedCardsFrom,
    visibleTopWinnerRanks,
    finesseCandidate,
    longSuitRuffEntryCandidates
  } = playPlan;
  const { cardPlayResult } = cardPlayCommon;
  const { legalPlanCard, planFallbackOnly } = followingCommon || {};

  function choosePlanLongSuitRuffDevelopmentPlay({ priority, hand, partnerHand, trickHistory, seat, trump, legal }) {
      if (!trump) return null;
      if (seat === priority.longSeat) {
        const card = legalPlanCard(lowestCard(cardsInSuit(hand, priority.suit)), legal);
        if (!card) return null;
        return cardPlayResult(
          card,
          "playPlan.establishLongSuitByRuffing",
          priority.confidence || "basic",
          "Follow the visible play plan by playing the long side suit before drawing trumps.",
          {
            planPriority: priority,
            suit: priority.suit,
            longSeat: priority.longSeat,
            shortSeat: priority.shortSeat,
            longLength: priority.longLength,
            shortLength: priority.shortLength,
            estimatedRuffsNeeded: priority.estimatedRuffsNeeded,
            action: "leadLongSuitForRuff"
          }
        );
      }

      if (seat !== priority.shortSeat) return null;
      const entries = longSuitRuffEntryCandidates({
        shortHand: hand,
        longHand: partnerHand,
        playedCards: playedCardsFrom(trickHistory, []),
        trump,
        ruffSuit: priority.suit
      });
      const candidate = entries.find((entry) => legalPlanCard(entry.card, legal));
      if (!candidate) {
        return missingEntryFallback({
          priority,
          seat,
          targetSeat: priority.longSeat,
          suit: priority.suit,
          trump
        });
      }

      return cardPlayResult(
        candidate.card,
        "playPlan.enterLongSuitHand",
        priority.confidence || "basic",
        "Follow the visible play plan by returning to the hand with the long side suit.",
        {
          planPriority: priority,
          suit: priority.suit,
          longSeat: priority.longSeat,
          shortSeat: priority.shortSeat,
          entrySuit: candidate.suit,
          entryRank: candidate.entryRank,
          targetSeat: priority.longSeat,
          action: "leadEntryToLongSuitHand"
        }
      );
    }



  function choosePlanRuffInTrickPlay({ playPlan, hand, currentTrick, seat, trump, legal, winning }) {
      if (!trump || !playPlan?.priorities?.length || currentTrick.length < 1) return null;
      const leadSuit = currentTrick[0].card.suit;
      const priority = playPlan.priorities.find((item) => {
        return (
          (item.kind === "ruffShortSuit" || item.kind === "establishLongSuitByRuffing") &&
          item.suit === leadSuit &&
          item.shortSeat === seat
        );
      });
      if (!priority || cardsInSuit(hand, leadSuit).length) return null;

      const trumpCards = cardsInSuit(legal, trump);
      if (!trumpCards.length) return null;
      if (winning && teamOf(winning.seat) === teamOf(seat)) {
        const harmlessCards = legal.filter((card) => !beats(card, winning.card, leadSuit, trump));
        const card = lowestCard(harmlessCards);
        if (!card) return null;
        return cardPlayResult(
          card,
          "playPlan.skipRuffPartnerWinning",
          priority.confidence || "basic",
          "Follow the visible play plan by preserving trump when partner is already winning the planned ruff suit.",
          {
            planPriority: priority,
            suit: priority.suit,
            shortSeat: priority.shortSeat,
            longSeat: priority.longSeat || partnerOf(seat),
            trump,
            winningSeat: winning.seat,
            action: "skipRuffPartnerWinning"
          }
        );
      }

      const winningTrumps = winning
        ? trumpCards.filter((card) => beats(card, winning.card, leadSuit, trump)).sort(compareLowCards)
        : trumpCards;
      const card = winningTrumps[0] || lowestCard(trumpCards);
      return cardPlayResult(
        card,
        priority.kind === "establishLongSuitByRuffing" ? "playPlan.ruffOutLongSuit" : "playPlan.ruffShortSuit",
        priority.confidence || "basic",
        "Follow the visible play plan by ruffing the planned side suit.",
        {
          planPriority: priority,
          suit: priority.suit,
          shortSeat: priority.shortSeat,
          longSeat: priority.longSeat || partnerOf(seat),
          trump,
          action: priority.kind === "establishLongSuitByRuffing" ? "ruffOutLongSuit" : "ruffShortSuit"
        }
      );
    }



  function choosePlanRuffPlay({ priority, hand, partnerHand, trickHistory, seat, trump, legal }) {
      if (!trump) return null;
      if (priority.shortSeat === seat) {
        return choosePlanRuffEntryPlay({ priority, hand, partnerHand, trickHistory, seat, trump, legal });
      }
      if (priority.timing === "prepareBeforeRuff" && priority.longSeat === seat) {
        return choosePlanPrepareShortRuffPlay({ priority, hand, partnerHand, trickHistory, seat, legal });
      }
      if (cardsInSuit(partnerHand, priority.suit).length !== 0) return null;
      if (!cardsInSuit(partnerHand, trump).length) return null;
      const card = legalPlanCard(lowestCard(cardsInSuit(hand, priority.suit)), legal);
      if (!card) return null;

      return cardPlayResult(
        card,
        "playPlan.ruffShortSuit",
        priority.confidence || "basic",
        "Follow the visible play plan by leading a side suit that dummy can ruff.",
        {
          planPriority: priority,
          suit: priority.suit,
          shortSeat: priority.shortSeat,
          trump,
          action: "leadToShortHandRuff"
        }
      );
    }



  function choosePlanPrepareShortRuffPlay({ priority, hand, partnerHand, trickHistory, seat, legal }) {
      const suitCards = cardsInSuit(hand, priority.suit);
      const partnerSuitCards = cardsInSuit(partnerHand, priority.suit);
      if (!suitCards.length || !partnerSuitCards.length) return null;

      const playedSuitCards = cardsInSuit(playedCardsFrom(trickHistory, []), priority.suit);
      const winnerRanks = visibleTopWinnerRanks([...suitCards, ...partnerSuitCards], playedSuitCards);
      const winnerCard = winnerRanks
        .map((rank) => suitCards.find((card) => card.rank === rank))
        .find(Boolean);
      const card = legalPlanCard(winnerCard || lowestCard(suitCards), legal);
      if (!card) return null;

      return cardPlayResult(
        card,
        "playPlan.prepareShortSuitRuff",
        priority.confidence || "basic",
        "Follow the visible play plan by playing the side suit first, so the short trump hand can ruff a later round.",
        {
          planPriority: priority,
          suit: priority.suit,
          longSeat: seat,
          shortSeat: priority.shortSeat,
          preparationNeeded: priority.preparationNeeded || partnerSuitCards.length,
          shortLength: partnerSuitCards.length,
          extraTrickValue: true,
          action: winnerCard ? "cashWinnerBeforeShortRuff" : "loseSideSuitBeforeShortRuff"
        }
      );
    }



  function choosePlanRuffEntryPlay({ priority, hand, partnerHand, trickHistory, seat, trump, legal }) {
      if (cardsInSuit(hand, priority.suit).length) return null;
      if (!cardsInSuit(partnerHand, priority.suit).length) return null;

      const candidate = ruffEntryCandidates({
        hand,
        partnerHand,
        playedCards: playedCardsFrom(trickHistory, []),
        trump,
        ruffSuit: priority.suit,
        legal
      })
        .sort((a, b) => b.score - a.score)[0];
      if (!candidate) {
        return missingEntryFallback({
          priority,
          seat,
          targetSeat: partnerOf(seat),
          suit: priority.suit,
          trump
        });
      }

      return cardPlayResult(
        candidate.card,
        "playPlan.enterLongTrumpHand",
        priority.confidence || "basic",
        "Follow the visible play plan by leading an entry to the hand that can lead the ruffing suit.",
        {
          planPriority: priority,
          suit: priority.suit,
          shortSeat: priority.shortSeat,
          trump,
          entrySuit: candidate.suit,
          entryRank: candidate.entryRank,
          targetSeat: partnerOf(seat),
          action: "leadEntryToLongTrumpHand"
        }
      );
    }



  function ruffEntryCandidates({ hand, partnerHand, playedCards, trump, ruffSuit, legal }) {
      return suits
        .filter((suit) => suit !== trump && suit !== ruffSuit)
        .map((suit) => ruffEntryCandidate({ suit, hand, partnerHand, playedCards, legal }))
        .filter(Boolean);
    }



  function ruffEntryCandidate({ suit, hand, partnerHand, playedCards, legal }) {
      const leadCards = cardsInSuit(legal, suit);
      const partnerSuitCards = cardsInSuit(partnerHand, suit);
      if (!leadCards.length || !partnerSuitCards.length) return null;

      const winnerRanks = visibleTopWinnerRanks([...cardsInSuit(hand, suit), ...partnerSuitCards], cardsInSuit(playedCards, suit));
      const partnerWinnerRanks = winnerRanks.filter((rank) => hasRank(partnerSuitCards, rank));
      if (!partnerWinnerRanks.length) return null;

      const entryRank = partnerWinnerRanks[0];
      const lowerLeadCards = leadCards.filter((card) => rankOrder.indexOf(card.rank) < rankOrder.indexOf(entryRank));
      const card = lowestCard(lowerLeadCards);
      if (!card) return null;

      return {
        card,
        suit,
        entryRank,
        score: partnerWinnerRanks.length * 20 + winnerRanks.length * 8 + leadCards.length + partnerSuitCards.length
      };
    }



  function missingEntryFallback({ priority, seat, targetSeat, suit, trump }) {
      return planFallbackOnly({
        priority,
        reason: "missingEntry",
        seat,
        targetSeat,
        suit,
        trump,
        shortSeat: priority.shortSeat || null,
        longSeat: priority.longSeat || targetSeat || null,
        entrySuit: priority.entrySuit || null,
        entryRank: priority.entryRank || null
      });
    }



  function choosePlanCrossRuffPlay({ priority, hand, partnerHand, trickHistory, seat, trump, legal }) {
      if (!trump || priority.trump !== trump || !partnerHand?.length) return null;
      const playedCards = playedCardsFrom(trickHistory, []);
      const cashCard = (priority.cashFirst || [])
        .filter((item) => item.seat === seat)
        .map((item) => cardsInSuit(hand, item.suit).find((card) => card.rank === item.rank))
        .map((card) => legalPlanCard(card, legal))
        .find(Boolean);
      if (cashCard) {
        const cash = (priority.cashFirst || []).find((item) => item.seat === seat && item.suit === cashCard.suit && item.rank === cashCard.rank);
        return cardPlayResult(
          cashCard,
          "playPlan.crossRuff",
          priority.confidence || "basic",
          "Follow the visible play plan by cashing a side winner before starting the cross ruff.",
          {
            planPriority: priority,
            suit: cashCard.suit,
            trump,
            cashRank: cashCard.rank,
            shortSeat: cash?.beforeRuffSeat || null,
            action: "cashWinnerBeforeCrossRuff"
          }
        );
      }

      const leadPlan = (priority.crossSuits || []).find((item) => {
        if (item.longSeat !== seat) return false;
        if (!cardsInSuit(hand, item.suit).length) return false;
        if (cardsInSuit(partnerHand, item.suit).length > 0) return false;
        return cardsInSuit(partnerHand, trump).length > 0;
      });
      if (!leadPlan) return null;

      const card = legalPlanCard(lowestCard(cardsInSuit(hand, leadPlan.suit)), legal);
      if (!card) return null;
      return cardPlayResult(
        card,
        "playPlan.crossRuff",
        priority.confidence || "basic",
        "Follow the visible play plan by leading a side suit that the other hand can ruff.",
        {
          planPriority: priority,
          suit: leadPlan.suit,
          trump,
          longSeat: leadPlan.longSeat,
          shortSeat: leadPlan.shortSeat,
          action: "leadCrossRuff"
        }
      );
    }



  function choosePlanCrossRuffInTrickPlay({ priority, hand, partnerHand, currentTrick, trickHistory, seat, trump, legal, winning }) {
      if (!trump || priority.trump !== trump || !currentTrick.length) return null;
      const leadSuit = currentTrick[0].card.suit;
      const crossSuit = (priority.crossSuits || []).find((item) => item.suit === leadSuit);
      if (!crossSuit) return null;

      if (seat === crossSuit.shortSeat && !cardsInSuit(hand, leadSuit).length) {
        const trumpCards = cardsInSuit(legal, trump);
        if (!trumpCards.length) return null;
        if (isPartnerWinnerSafeForCrossRuff({ hand, partnerHand, currentTrick, trickHistory, seat, trump, legal, winning })) {
          const harmlessCards = legal.filter((card) => !beats(card, winning.card, leadSuit, trump));
          const card = lowestCard(harmlessCards);
          if (card) {
            return cardPlayResult(
              card,
              "playPlan.crossRuff",
              priority.confidence || "basic",
              "Follow the visible play plan by preserving trump when partner is safely winning the cross-ruff suit.",
              {
                planPriority: priority,
                suit: leadSuit,
                trump,
                longSeat: crossSuit.longSeat,
                shortSeat: crossSuit.shortSeat,
                winningSeat: winning.seat,
                action: "skipCrossRuffPartnerWinning"
              }
            );
          }
        }
        const winningTrumps = winning
          ? trumpCards.filter((card) => beats(card, winning.card, leadSuit, trump)).sort(compareLowCards)
          : trumpCards;
        const card = winningTrumps[0] || lowestCard(trumpCards);
        return cardPlayResult(
          card,
          "playPlan.crossRuff",
          priority.confidence || "basic",
          "Follow the visible play plan by ruffing in the short hand.",
          {
            planPriority: priority,
            suit: leadSuit,
            trump,
            longSeat: crossSuit.longSeat,
            shortSeat: crossSuit.shortSeat,
            action: "crossRuff"
          }
        );
      }

      if (seat !== crossSuit.longSeat) return null;
      const suitedLegal = cardsInSuit(legal, leadSuit);
      if (!suitedLegal.length) return null;
      const cashRanks = (priority.cashFirst || [])
        .filter((item) => item.seat === seat && item.suit === leadSuit)
        .map((item) => item.rank);
      const cashCard = cashRanks.map((rank) => suitedLegal.find((card) => card.rank === rank)).find(Boolean);
      const winners = winning
        ? suitedLegal.filter((card) => beats(card, winning.card, leadSuit, trump)).sort(compareLowCards)
        : [];
      const card = cashCard || winners[0] || lowestCard(suitedLegal);
      if (!card) return null;

      return cardPlayResult(
        card,
        "playPlan.crossRuff",
        priority.confidence || "basic",
        "Follow the visible play plan by winning or preserving the side suit before the cross ruff continues.",
        {
          planPriority: priority,
          suit: leadSuit,
          trump,
          longSeat: crossSuit.longSeat,
          shortSeat: crossSuit.shortSeat,
          action: cashCard || winners[0] ? "winSideSuitForCrossRuff" : "followCrossRuffSuit"
        }
      );
    }




  function choosePlanLateCrossRuffPlay({ priority, hand, partnerHand, seat, trump, legal }) {
      if (!trump || priority.trump !== trump || !partnerHand?.length) return null;
      if (priority.defendersRemainingTrumps !== 0) return null;

      const cashCard = (priority.cashFirst || [])
        .filter((item) => item.seat === seat)
        .map((item) => hand.find((card) => card.id === item.cardId) || cardsInSuit(hand, item.suit).find((card) => card.rank === item.rank))
        .map((card) => legalPlanCard(card, legal))
        .find(Boolean);
      if (cashCard) {
        return cardPlayResult(
          cashCard,
          "playPlan.lateCrossRuff",
          priority.confidence || "basic",
          "Follow the visible play plan by cashing a sure side winner before the late crossruff.",
          {
            planPriority: priority,
            suit: cashCard.suit,
            trump,
            cashRank: cashCard.rank,
            defendersRemainingTrumps: priority.defendersRemainingTrumps,
            action: "cashWinnerBeforeLateCrossRuff"
          }
        );
      }

      const leadPlan = (priority.crossSuits || []).find((item) => {
        if (item.longSeat !== seat) return false;
        if (!cardsInSuit(hand, item.suit).length) return false;
        if (cardsInSuit(partnerHand, item.suit).length > 0) return false;
        return cardsInSuit(partnerHand, trump).length > 0;
      });
      if (!leadPlan) return null;

      const card = legalPlanCard(lowestCard(cardsInSuit(hand, leadPlan.suit)), legal);
      if (!card) return null;
      return cardPlayResult(
        card,
        "playPlan.lateCrossRuff",
        priority.confidence || "basic",
        "Follow the visible play plan by leading a side suit to partner's void now that the defenders have no trumps left.",
        {
          planPriority: priority,
          suit: leadPlan.suit,
          trump,
          longSeat: leadPlan.longSeat,
          shortSeat: leadPlan.shortSeat,
          defendersRemainingTrumps: priority.defendersRemainingTrumps,
          action: "leadLateCrossRuff"
        }
      );
    }



  function choosePlanLateCrossRuffInTrickPlay({ priority, hand, partnerHand, currentTrick, trickHistory, seat, trump, legal, winning }) {
      if (!trump || priority.trump !== trump || priority.defendersRemainingTrumps !== 0 || !currentTrick.length) return null;
      const leadSuit = currentTrick[0].card.suit;
      const crossSuit = (priority.crossSuits || []).find((item) => item.suit === leadSuit);
      if (!crossSuit) return null;

      if (seat === crossSuit.shortSeat && !cardsInSuit(hand, leadSuit).length) {
        const trumpCards = cardsInSuit(legal, trump);
        if (!trumpCards.length) return null;
        if (!shouldRuffForLateCrossRuff({ hand, partnerHand, currentTrick, trickHistory, seat, trump, winning })) return null;
        const winningTrumps = winning
          ? trumpCards.filter((card) => beats(card, winning.card, leadSuit, trump)).sort(compareLowCards)
          : trumpCards;
        const card = winningTrumps[0] || lowestCard(trumpCards);
        if (!card) return null;
        return cardPlayResult(
          card,
          "playPlan.lateCrossRuff",
          priority.confidence || "basic",
          "Follow the visible play plan by ruffing in the short hand after defenders' trumps are gone.",
          {
            planPriority: priority,
            suit: leadSuit,
            trump,
            longSeat: crossSuit.longSeat,
            shortSeat: crossSuit.shortSeat,
            defendersRemainingTrumps: priority.defendersRemainingTrumps,
            action: "securePartnerWinnerWithTrump"
          }
        );
      }

      if (seat !== crossSuit.longSeat) return null;
      const suitedLegal = cardsInSuit(legal, leadSuit);
      if (!suitedLegal.length) return null;
      const cashRanks = (priority.cashFirst || [])
        .filter((item) => item.seat === seat && item.suit === leadSuit)
        .map((item) => item.rank);
      const cashCard = cashRanks.map((rank) => suitedLegal.find((card) => card.rank === rank)).find(Boolean);
      const winners = winning
        ? suitedLegal.filter((card) => beats(card, winning.card, leadSuit, trump)).sort(compareLowCards)
        : [];
      const card = cashCard || winners[0] || lowestCard(suitedLegal);
      if (!card) return null;

      return cardPlayResult(
        card,
        "playPlan.lateCrossRuff",
        priority.confidence || "basic",
        "Follow the visible play plan by keeping the late crossruff suit under control.",
        {
          planPriority: priority,
          suit: leadSuit,
          trump,
          longSeat: crossSuit.longSeat,
          shortSeat: crossSuit.shortSeat,
          defendersRemainingTrumps: priority.defendersRemainingTrumps,
          action: cashCard ? "cashWinnerBeforeLateCrossRuff" : winners[0] ? "winSideSuitForLateCrossRuff" : "followLateCrossRuffSuit"
        }
      );
    }



  function isPartnerWinnerSafeForCrossRuff({ hand, partnerHand, currentTrick, trickHistory, seat, trump, legal, winning }) {
      if (!winning) return false;
      if (teamOf(winning.seat) !== teamOf(seat)) return false;
      if (winning.card.suit === trump) return true;
      if (currentTrick.length >= 3) return true;

      const leadSuit = currentTrick[0].card.suit;
      const visibleCards = [
        ...playedCardsFrom(trickHistory, currentTrick),
        ...hand,
        ...(partnerHand || [])
      ];
      return unseenHigherCardsInSuit(visibleCards, leadSuit, winning.card.rank).length === 0;
    }



  function shouldRuffForLateCrossRuff({ hand, partnerHand, currentTrick, trickHistory, seat, trump, winning }) {
      if (!winning) return true;
      if (teamOf(winning.seat) !== teamOf(seat)) return true;
      if (winning.card.suit === trump) return false;
      if (currentTrick.length >= 3) return false;

      const leadSuit = currentTrick[0].card.suit;
      const visibleCards = [
        ...playedCardsFrom(trickHistory, currentTrick),
        ...hand,
        ...(partnerHand || [])
      ];
      return unseenHigherCardsInSuit(visibleCards, leadSuit, winning.card.rank).length > 0;
    }



  function unseenHigherCardsInSuit(visibleCards, suit, rank) {
      const visibleRanks = new Set(cardsInSuit(visibleCards, suit).map((card) => card.rank));
      return rankOrder
        .slice(rankOrder.indexOf(rank) + 1)
        .filter((candidateRank) => !visibleRanks.has(candidateRank));
    }



  return {
    choosePlanLongSuitRuffDevelopmentPlay,
    choosePlanRuffInTrickPlay,
    choosePlanRuffPlay,
    choosePlanPrepareShortRuffPlay,
    choosePlanRuffEntryPlay,
    ruffEntryCandidates,
    ruffEntryCandidate,
    choosePlanCrossRuffPlay,
    choosePlanCrossRuffInTrickPlay,
    choosePlanLateCrossRuffPlay,
    choosePlanLateCrossRuffInTrickPlay,
    isPartnerWinnerSafeForCrossRuff,
    shouldRuffForLateCrossRuff,
    unseenHigherCardsInSuit
  };
});

(function initBridgeRulesCardPlay(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const deps = isCommonJs
    ? {
        core: require("./core.js"),
        playMechanics: require("./play-mechanics.js"),
        cardPlayLeads: require("./card-play/opening-leads.js"),
        cardPlayCommon: require("./card-play/common.js"),
        cardPlayDefense: require("./card-play/defense.js"),
        cardPlayPlanFollowing: require("./card-play/play-plan-following.js"),
        cardPlayDeclarer: require("./card-play/declarer-play.js")
      }
    : root.BridgeRulesParts || {};
  const api = factory(
    deps.core,
    deps.playMechanics,
    deps.cardPlayLeads,
    deps.cardPlayCommon,
    deps.cardPlayDefense,
    deps.cardPlayPlanFollowing,
    deps.cardPlayDeclarer
  );
  if (isCommonJs) module.exports = api;
  root.BridgeRulesParts = root.BridgeRulesParts || {};
  root.BridgeRulesParts.cardPlay = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesCardPlay(
  core,
  playMechanics,
  cardPlayLeads,
  cardPlayCommon,
  cardPlayDefense,
  cardPlayPlanFollowing,
  cardPlayDeclarer
) {
  "use strict";

  const {
    compareLowCards,
    lowestCard
  } = core;
  const { beats } = playMechanics;
  const { cardPlayResult, createCardPlayContext } = cardPlayCommon;

  const {
    chooseDeclarerFinessePlay,
    chooseDeclarerDevelopmentPlay,
    chooseAvoidLongHandRuff
  } = cardPlayDeclarer;

  const {
    choosePlayPlanAction,
    withPlayPlanFallback,
    choosePlanHoldUpPlay,
    choosePlanPreserveWorkSuitEntryPlay,
    choosePlanRuffInTrickPlay
  } = cardPlayPlanFollowing;

  const { chooseLeadCardPlay } = cardPlayLeads;

  const {
    chooseReturnPartnerLeadSuit,
    chooseTrumpSwitchAgainstDummyRuff,
    chooseOpeningLeadAttitudeSignal,
    chooseThirdHandHighOverLowLead,
    chooseThirdHandUnblockHonor,
    chooseSecondHandDefensivePlay,
    chooseThirdHandDefensivePlay
  } = cardPlayDefense;

  function chooseCardPlay({
      hand = [],
      partnerHand = null,
      dummyHand = null,
      currentTrick = [],
      trickHistory = [],
      seat,
      declarer = null,
      dummy = null,
      contract = null,
      trump = null,
      playPlan = null,
      auction = []
    } = {}) {
      const context = createCardPlayContext({ hand, currentTrick, trickHistory, seat, declarer, trump });
      const { legal } = context;
      if (!legal.length) return null;

      const planDecision = choosePlayPlanAction({
        hand,
        partnerHand,
        currentTrick,
        trickHistory,
        seat,
        declarer,
        dummy,
        contract,
        trump,
        playPlan,
        legal,
        winning: context.winning
      });
      if (planDecision.result) return planDecision.result;

      if (!currentTrick.length) {
        const finesse = chooseDeclarerFinessePlay({
          hand,
          partnerHand,
          currentTrick,
          trickHistory,
          seat,
          declarer,
          dummy,
          contract
        });
        if (finesse) return withPlayPlanFallback(finesse, planDecision);
        const development = chooseDeclarerDevelopmentPlay({
          hand,
          partnerHand,
          currentTrick,
          trickHistory,
          seat,
          declarer,
          dummy,
          contract
        });
        if (development) return withPlayPlanFallback(development, planDecision);

        const returnPartnerLeadSuit = chooseReturnPartnerLeadSuit({
          legal,
          trickHistory,
          seat,
          declarer
        });
        if (returnPartnerLeadSuit) return withPlayPlanFallback(returnPartnerLeadSuit, planDecision);

        if (!context.isOpeningLead) {
          const trumpSwitchAgainstDummyRuff = chooseTrumpSwitchAgainstDummyRuff({
            legal,
            dummyHand,
            trump,
            seat,
            declarer
          });
          if (trumpSwitchAgainstDummyRuff) return withPlayPlanFallback(trumpSwitchAgainstDummyRuff, planDecision);
        }

        return withPlayPlanFallback(
          chooseLeadCardPlay(hand, legal, { contract, seat, declarer, isOpeningLead: context.isOpeningLead, auction }),
          planDecision
        );
      }

      const { leadSuit, winning, partnerWinning, playedCards } = context;

      const thirdHandHigh = chooseThirdHandHighOverLowLead({
        legal,
        currentTrick,
        seat,
        declarer,
        contract,
        trump,
        winning,
        playedCards
      });
      if (thirdHandHigh) return withPlayPlanFallback(thirdHandHigh, planDecision);

      const thirdHandUnblock = chooseThirdHandUnblockHonor({
        legal,
        currentTrick,
        trickHistory,
        seat,
        declarer,
        contract,
        trump,
        winning
      });
      if (thirdHandUnblock) return withPlayPlanFallback(thirdHandUnblock, planDecision);

      const openingLeadAttitudeSignal = chooseOpeningLeadAttitudeSignal({
        hand,
        legal,
        currentTrick,
        trickHistory,
        seat,
        declarer,
        trump
      });
      if (openingLeadAttitudeSignal) return withPlayPlanFallback(openingLeadAttitudeSignal, planDecision);

      if (partnerWinning) {
        const harmlessCards = legal.filter((card) => !beats(card, winning.card, leadSuit, trump));
        return withPlayPlanFallback(
          cardPlayResult(
            lowestCard(harmlessCards.length ? harmlessCards : legal),
            "partnerWinningLow",
            "basic",
            "Partner is currently winning the trick, so play the lowest harmless legal card.",
            { winningSeat: winning.seat }
          ),
          planDecision
        );
      }

      const plannedPreserveEntry = choosePlanPreserveWorkSuitEntryPlay({
        playPlan,
        hand,
        partnerHand,
        currentTrick,
        seat,
        trump,
        legal,
        winning
      });
      if (plannedPreserveEntry) return plannedPreserveEntry;

      const plannedHoldUp = choosePlanHoldUpPlay({
        playPlan,
        hand,
        currentTrick,
        seat,
        trump,
        legal,
        winning
      });
      if (plannedHoldUp) return plannedHoldUp;

      const plannedRuff = choosePlanRuffInTrickPlay({
        playPlan,
        hand,
        currentTrick,
        seat,
        trump,
        legal,
        winning
      });
      if (plannedRuff) return plannedRuff;

      const secondHandDefense = chooseSecondHandDefensivePlay({
        legal,
        currentTrick,
        seat,
        declarer,
        dummyHand,
        trump,
        playedCards
      });
      if (secondHandDefense) return withPlayPlanFallback(secondHandDefense, planDecision);

      const thirdHandDefense = chooseThirdHandDefensivePlay({
        legal,
        currentTrick,
        seat,
        declarer,
        trump,
        winning,
        playedCards
      });
      if (thirdHandDefense) return withPlayPlanFallback(thirdHandDefense, planDecision);

      const avoidLongHandRuff = chooseAvoidLongHandRuff({
        hand,
        partnerHand,
        legal,
        currentTrick,
        seat,
        declarer,
        dummy,
        trump,
        winning
      });
      if (avoidLongHandRuff) return withPlayPlanFallback(avoidLongHandRuff, planDecision);

      const canBeat = legal
        .filter((card) => beats(card, winning.card, leadSuit, trump))
        .sort(compareLowCards);

      if (canBeat.length) {
        return withPlayPlanFallback(
          cardPlayResult(
            canBeat[0],
            "cheapestWinner",
            "basic",
            "Play the cheapest card that is currently winning the trick.",
            { winningSeat: winning.seat }
          ),
          planDecision
        );
      }

      if (hand.some((card) => card.suit === leadSuit)) {
        return withPlayPlanFallback(
          cardPlayResult(
            lowestCard(legal),
            "lowestFollow",
            "basic",
            "Follow suit with the lowest legal card because this hand cannot win the trick.",
            { leadSuit, winningSeat: winning.seat }
          ),
          planDecision
        );
      }

      return withPlayPlanFallback(
        cardPlayResult(
          lowestCard(legal),
          "lowestDiscard",
          "basic",
          "Discard the lowest legal card because this hand cannot follow suit or win the trick.",
          { leadSuit, winningSeat: winning.seat }
        ),
        planDecision
      );
    }


  return {
    ...cardPlayCommon,
    ...cardPlayLeads,
    ...cardPlayDefense,
    ...cardPlayPlanFollowing,
    ...cardPlayDeclarer,
    chooseCardPlay
  };
});

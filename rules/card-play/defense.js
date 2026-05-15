(function initBridgeRulesCardPlayDefense(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const deps = isCommonJs
    ? {
        core: require("../core.js"),
        playMechanics: require("../play-mechanics.js"),
        playPlan: require("../play-plan.js"),
        cardPlayLeads: require("./opening-leads.js"),
        cardPlayCommon: require("./common.js")
      }
    : root.BridgeRulesParts || {};
  const api = factory(deps.core, deps.playMechanics, deps.playPlan, deps.cardPlayLeads, deps.cardPlayCommon);
  if (isCommonJs) module.exports = api;
  root.BridgeRulesParts = root.BridgeRulesParts || {};
  root.BridgeRulesParts.cardPlayDefense = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesCardPlayDefense(core, playMechanics, playPlan, cardPlayLeads, cardPlayCommon) {
  "use strict";

  const {
    suits,
    rankOrder,
    leadHonorRanks,
    compareLowCards,
    lowestCard,
    highestCard,
    isLeadHonorRank,
    isLowLeadCard,
    partnerOf
  } = core;
  const { beats } = playMechanics;
  const { cardsInSuit } = playPlan;
  const {
    touchingHonorSequence,
    openingLeadPlay,
    isDefensivePlaySeat
  } = cardPlayLeads;
  const { cardPlayResult, visibleSuitStatus, visibleSuitStatuses } = cardPlayCommon;

  function chooseReturnPartnerLeadSuit({ legal, dummyHand, trickHistory, seat, declarer, trump }) {
    if (!isDefensivePlaySeat(seat, declarer) || !trickHistory.length) return null;

    const openingLead = openingLeadPlay(trickHistory);
    if (!openingLead || openingLead.seat !== partnerOf(seat)) return null;

    const leadSuit = openingLead.card.suit;
    const suitedLegal = cardsInSuit(legal, leadSuit);
    if (!suitedLegal.length) return null;
    const status = visibleSuitStatus({ suit: leadSuit, hand: legal, dummyHand, trickHistory, trump });
    if (deadSuitRuffRisk(status)) return null;

    const returnChoice = choosePartnerLeadSuitReturnCard(suitedLegal, { dummyHand, trickHistory, trump });
    return cardPlayResult(
      returnChoice.card,
      "returnPartnerLeadSuit",
      "basic",
      "Return partner's opening lead suit when it is still available and no stronger plan applies.",
      {
        suit: leadSuit,
        leadCard: openingLead.card,
        leadRank: openingLead.card.rank,
        partnerSeat: openingLead.seat,
        returnType: returnChoice.type,
        sequence: returnChoice.sequence,
        action: "returnPartnerLeadSuit"
      }
    );
  }

  function choosePartnerLeadSuitReturnCard(suitedLegal, { dummyHand = [], trickHistory = [], trump = null } = {}) {
    const context = { hand: suitedLegal, dummyHand, trickHistory, currentTrick: [], trump };
    const sequence = touchingHonorSequence(suitedLegal, 2);
    if (sequence?.card && isVisibleTopWinner(sequence.card, context)) {
      return { card: sequence.card, type: "honorSequence", sequence: sequence.ranks.join("") };
    }

    const visibleTopWinner = highestCard(
      suitedLegal.filter((card) => isLeadHonorRank(card.rank) && isVisibleTopWinner(card, context))
    );
    if (visibleTopWinner) return { card: visibleTopWinner, type: "topWinner" };

    const lowCards = suitedLegal.filter(isLowLeadCard);
    if (lowCards.length) return { card: lowestCard(lowCards), type: "lowCard" };

    if (sequence?.card) {
      return { card: sequence.card, type: "honorSequence", sequence: sequence.ranks.join("") };
    }

    return { card: lowestCard(suitedLegal), type: "onlyHonors" };
  }

  function deadSuitRuffRisk(status) {
    return Boolean(status?.exhaustedForHiddenHands && status.declarerCanRuffSuit);
  }

  function chooseSafeDefensiveWinner({ legal, dummyHand, trickHistory, currentTrick = [], seat, declarer, trump }) {
    if (!isDefensivePlaySeat(seat, declarer) || !trump || currentTrick.length) return null;

    const statuses = visibleSuitStatuses({ hand: legal, dummyHand, trickHistory, currentTrick, trump });
    const dangerousSuits = statuses.filter(deadSuitRuffRisk).map((status) => status.suit);
    if (!dangerousSuits.length) return null;

    const winners = legal
      .filter((card) => card.suit !== trump && !dangerousSuits.includes(card.suit))
      .filter((card) => isVisibleTopWinner(card, { hand: legal, dummyHand, trickHistory, currentTrick }))
      .sort(compareLowCards);
    const card = winners[0];
    if (!card) return null;

    return cardPlayResult(
      card,
      "safeDefensiveWinner",
      "basic",
      "Avoid a visibly dead side-suit return that declarer can ruff; cash the cheapest visible side-suit winner instead.",
      {
        avoidedSuits: dangerousSuits,
        avoidedReason: "deadSuitRuffRisk",
        suit: card.suit,
        action: "cashSafeDefensiveWinner"
      }
    );
  }

  function isVisibleTopWinner(card, { hand = [], dummyHand = [], trickHistory = [], currentTrick = [] } = {}) {
    if (!card) return false;
    const visibleRanks = new Set(
      [
        ...cardsInSuit(hand, card.suit),
        ...cardsInSuit(dummyHand || [], card.suit),
        ...trickHistory.flatMap((trick) => trick.cards || []).map((play) => play.card).filter(Boolean),
        ...currentTrick.map((play) => play.card).filter(Boolean)
      ]
        .filter((visibleCard) => visibleCard.suit === card.suit)
        .map((visibleCard) => visibleCard.rank)
    );
    const cardRankIndex = rankOrder.indexOf(card.rank);
    return rankOrder.slice(cardRankIndex + 1).every((rank) => visibleRanks.has(rank));
  }

  function dummyRuffThreat(dummyHand, trump) {
    if (!trump || !dummyHand?.length) return null;
    const dummyTrumps = cardsInSuit(dummyHand, trump);
    if (dummyTrumps.length < 2) return null;

    return suits
      .filter((suit) => suit !== trump)
      .map((suit) => ({ suit, length: cardsInSuit(dummyHand, suit).length }))
      .filter((threat) => threat.length <= 1)
      .sort((a, b) => a.length - b.length || suits.indexOf(a.suit) - suits.indexOf(b.suit))[0] || null;
  }

  function chooseTrumpSwitchAgainstDummyRuff({ legal, dummyHand, trump, seat, declarer }) {
    if (!isDefensivePlaySeat(seat, declarer) || !trump || !dummyHand?.length) return null;
    const trumpCards = cardsInSuit(legal, trump);
    if (!trumpCards.length) return null;

    const threat = dummyRuffThreat(dummyHand, trump);
    if (!threat) return null;

    return cardPlayResult(
      lowestCard(trumpCards),
      "trumpSwitchAgainstDummyRuff",
      "basic",
      "Switch to trump when dummy visibly has ruffing value in a short side suit and no stronger defensive return applies.",
      {
        action: "drawDummyTrumps",
        trump,
        dummyShortSuit: threat.suit,
        dummyShortLength: threat.length,
        dummyTrumpLength: cardsInSuit(dummyHand, trump).length
      }
    );
  }

  function isLowPromisesHonorLead(play) {
    if (!play?.card) return false;
    if (play.ruleId) return play.ruleId === "notrumpLowPromisesHonor";
    return isLowLeadCard(play.card);
  }

  function isOpeningHonorSequenceLead(play) {
    if (!play?.card || !isLeadHonorRank(play.card.rank)) return false;
    return [
      "notrumpAceKingLead",
      "notrumpSequenceLead",
      "notrumpBrokenSequenceLead",
      "notrumpInternalSequenceLead",
      "suitContractSequenceLead",
      "suitContractInternalSequenceLead"
    ].includes(play.ruleId);
  }

  function attitudeSignalSupport({ hand, suitedHand, leadSuit, trump }) {
    if (suitedHand.length === 3 && suitedHand.some((card) => card.rank === "Q")) return "honor";
    if (trump && leadSuit !== trump && suitedHand.length === 2 && cardsInSuit(hand, trump).length) return "ruffValue";
    return null;
  }

  function chooseOpeningLeadAttitudeSignal({ hand, legal, currentTrick, trickHistory, seat, declarer, trump }) {
    if (trickHistory.length || currentTrick.length !== 2) return null;
    if (!isDefensivePlaySeat(seat, declarer)) return null;

    const leadPlay = currentTrick[0];
    if (leadPlay.seat !== partnerOf(seat) || !isOpeningHonorSequenceLead(leadPlay)) return null;

    const leadSuit = leadPlay.card.suit;
    const suitedLegal = cardsInSuit(legal, leadSuit);
    if (suitedLegal.length <= 1) return null;

    const suitedHand = cardsInSuit(hand, leadSuit);
    const highSignalCard = highestCard(suitedLegal.filter(isLowLeadCard)) || highestCard(suitedLegal);
    const supportReason = attitudeSignalSupport({ hand, suitedHand, leadSuit, trump });
    const signal = supportReason ? "encourage" : "discourage";
    const card = signal === "encourage" ? highSignalCard : lowestCard(suitedLegal);

    return cardPlayResult(
      card,
      "openingLeadAttitudeSignal",
      "basic",
      "Signal attitude after partner's opening honor lead from a sequence or broken sequence.",
      {
        signal,
        leadSuit,
        leadCard: leadPlay.card,
        partnerSeat: leadPlay.seat,
        supportReason,
        action: signal === "encourage" ? "encouragePartnerLeadSuit" : "discouragePartnerLeadSuit"
      }
    );
  }

  function chooseThirdHandHighOverLowLead({ legal, currentTrick, seat, declarer, contract, trump, winning, playedCards = [] }) {
    if (contract?.strain !== "NT" || trump || !seat || currentTrick.length !== 2) return null;
    if (!isDefensivePlaySeat(seat, declarer)) return null;
    const leadPlay = currentTrick[0];
    if (leadPlay.seat !== partnerOf(seat) || !isLowPromisesHonorLead(leadPlay)) return null;

    const leadSuit = leadPlay.card.suit;
    const suitedLegal = cardsInSuit(legal, leadSuit);
    if (!suitedLegal.length) return null;

    const canBeat = suitedLegal
      .filter((card) => beats(card, winning.card, leadSuit, trump))
      .sort(compareLowCards);
    const canBeatHonors = canBeat.filter((card) => isLeadHonorRank(card.rank));
    const card = canBeatHonors[0] || canBeat[0] || highestCard(suitedLegal);
    const higherPlayed = playedHigherCardsInSuit({ playedCards, suit: leadSuit, rank: card.rank });

    return cardPlayResult(
      card,
      "thirdHandHighOverLowLead",
      "basic",
      "Partner led low to promise a high card in notrump, so third hand plays the cheapest useful high card.",
      {
        leadSuit,
        leadCard: leadPlay.card,
        winningSeat: winning?.seat || null,
        higherPlayed,
        usedPlayedCardInfo: higherPlayed.length > 0,
        action: "thirdHandHigh"
      }
    );
  }

  function chooseThirdHandUnblockHonor({ legal, currentTrick, trickHistory, seat, declarer, contract, trump, winning }) {
    if (contract?.strain !== "NT" || trump || trickHistory.length || currentTrick.length !== 2) return null;
    if (!isDefensivePlaySeat(seat, declarer)) return null;

    const leadPlay = currentTrick[0];
    if (leadPlay.seat !== partnerOf(seat) || !isOpeningHonorSequenceLead(leadPlay)) return null;
    if (winning?.seat !== leadPlay.seat) return null;

    const leadSuit = leadPlay.card.suit;
    const suitedLegal = cardsInSuit(legal, leadSuit);
    if (suitedLegal.length !== 2) return null;

    const lowCards = suitedLegal.filter((card) => !isLeadHonorRank(card.rank));
    if (lowCards.length !== 1) return null;

    const unblockCards = suitedLegal
      .filter((card) => isLeadHonorRank(card.rank) && beats(card, leadPlay.card, leadSuit, trump))
      .sort(compareLowCards);
    if (unblockCards.length !== 1) return null;

    const card = unblockCards[0];
    return cardPlayResult(
      card,
      "thirdHandUnblockHonor",
      "basic",
      "Third hand unblocks a higher honor from a doubleton after partner's notrump honor lead, so partner's long suit does not get blocked.",
      {
        leadSuit,
        leadCard: leadPlay.card,
        unblockRank: card.rank,
        partnerSeat: leadPlay.seat,
        action: "unblockDefense"
      }
    );
  }

  function chooseProtectPartnerWinnerFromDummy({ legal, currentTrick, seat, declarer, dummy, dummyHand, trump, winning }) {
    if (currentTrick.length !== 2 || !isDefensivePlaySeat(seat, declarer)) return null;
    if (!dummy || !dummyHand?.length || currentTrick.some((play) => play.seat === dummy)) return null;
    if (winning?.seat !== partnerOf(seat)) return null;

    const leadSuit = currentTrick[0].card.suit;
    const dummyFollowSuit = cardsInSuit(dummyHand, leadSuit);
    const dummyLegal = dummyFollowSuit.length ? dummyFollowSuit : dummyHand;
    const dummyThreats = dummyLegal
      .filter((card) => beats(card, winning.card, leadSuit, trump))
      .sort(compareLowCards);
    if (!dummyThreats.length) return null;

    const protectCards = legal
      .filter((card) => beats(card, winning.card, leadSuit, trump))
      .filter((card) => !dummyLegal.some((dummyCard) => beats(dummyCard, card, leadSuit, trump)))
      .sort(compareLowCards);
    if (!protectCards.length) return null;

    return cardPlayResult(
      protectCards[0],
      "protectPartnerWinnerFromDummy",
      "basic",
      "Dummy is still to play and can beat partner's current winner, so third hand protects the trick with the cheapest card dummy cannot overtake.",
      {
        leadSuit,
        winningSeat: winning.seat,
        dummy,
        dummyThreatRank: dummyThreats[0].rank,
        action: "protectPartnerWinner"
      }
    );
  }

  function playedHigherCardsInSuit({ playedCards = [], suit, rank }) {
    return cardsInSuit(playedCards, suit)
      .filter((card) => rankOrder.indexOf(card.rank) > rankOrder.indexOf(rank))
      .map((card) => card.rank);
  }

  function cheapestHigherHonor(cards, rank) {
    return cards
      .filter((card) => isLeadHonorRank(card.rank) && rankOrder.indexOf(card.rank) > rankOrder.indexOf(rank))
      .sort(compareLowCards)[0] || null;
  }

  function honorCoverTarget({ dummyHand, leadSuit, leadRank, playedCards = [] }) {
    const lowerHonor = rankBelow(leadRank);
    if (!lowerHonor) return null;
    const lowerHonorAlreadyPlayed = cardsInSuit(playedCards, leadSuit).some((card) => card.rank === lowerHonor);
    if (lowerHonorAlreadyPlayed) return null;

    if (dummyHand?.length && cardsInSuit(dummyHand, leadSuit).some((card) => card.rank === lowerHonor)) {
      return {
        type: "dummyThreat",
        promotedRank: lowerHonor,
        promotionSeat: null,
        reason: "dummy shows the touching lower honor, so covering can limit it"
      };
    }

    return null;
  }

  function rankBelow(rank) {
    const index = rankOrder.indexOf(rank);
    return index > 0 ? rankOrder[index - 1] : null;
  }

  function chooseSecondHandDefensivePlay({ legal, currentTrick, seat, declarer, dummyHand, trump, playedCards = [] }) {
    if (currentTrick.length !== 1 || !isDefensivePlaySeat(seat, declarer)) return null;

    const leadCard = currentTrick[0].card;
    const leadSuit = leadCard.suit;
    const suitedLegal = cardsInSuit(legal, leadSuit);
    if (!suitedLegal.length) return null;

    if (isLeadHonorRank(leadCard.rank)) {
      const coverCard = cheapestHigherHonor(suitedLegal, leadCard.rank);
      const coverTarget = honorCoverTarget({
        dummyHand,
        leadSuit,
        leadRank: leadCard.rank,
        playedCards
      });
      if (coverCard) {
        return cardPlayResult(
          coverCard,
          "secondHandCoverHonor",
          "basic",
          "Second hand covers a led honor with the cheapest higher honor; the ten counts as an honor.",
          {
            leadSuit,
            coveredRank: leadCard.rank,
            promotedRank: coverTarget?.promotedRank || rankBelow(leadCard.rank),
            promotionSeat: coverTarget?.promotionSeat || null,
            coverReason: coverTarget?.type || "honorOnHonor",
            action: "coverHonor"
          }
        );
      }
    }

    const sequence = touchingHonorSequence(suitedLegal, 2);
    if (sequence?.card && beats(sequence.card, leadCard, leadSuit, trump)) {
      return cardPlayResult(
        sequence.card,
        "secondHandSequenceHigh",
        "basic",
        "Second hand plays the top of a touching honor sequence when it can take over the led card.",
        {
          leadSuit,
          sequence: sequence.ranks.join(""),
          action: "secondHandSequence"
        }
      );
    }

    return cardPlayResult(
      lowestCard(suitedLegal),
      "secondHandLow",
      "basic",
      "Second hand plays low when following suit.",
      {
        leadSuit,
        action: "secondHandLow"
      }
    );
  }

  function chooseThirdHandDefensivePlay({ legal, currentTrick, seat, declarer, trump, winning, playedCards = [] }) {
    if (currentTrick.length !== 2 || !isDefensivePlaySeat(seat, declarer)) return null;
    const leadPlay = currentTrick[0];
    if (leadPlay.seat !== partnerOf(seat)) return null;

    const leadSuit = leadPlay.card.suit;
    const suitedLegal = cardsInSuit(legal, leadSuit);
    if (!suitedLegal.length) return null;

    const canBeat = suitedLegal
      .filter((card) => beats(card, winning.card, leadSuit, trump))
      .sort(compareLowCards);
    if (!canBeat.length) return null;

    const card = canBeat[0];
    const higherPlayed = playedHigherCardsInSuit({ playedCards, suit: leadSuit, rank: card.rank });
    return cardPlayResult(
      card,
      "thirdHandHighCheapest",
      "basic",
      "Third hand plays the cheapest card that can win the trick, preserving higher cards when visible play says they are not needed.",
      {
        leadSuit,
        winningSeat: winning.seat,
        higherPlayed,
        usedPlayedCardInfo: higherPlayed.length > 0,
        action: "thirdHandHigh"
      }
    );
  }

  return {
    chooseReturnPartnerLeadSuit,
    choosePartnerLeadSuitReturnCard,
    deadSuitRuffRisk,
    chooseSafeDefensiveWinner,
    isVisibleTopWinner,
    dummyRuffThreat,
    chooseTrumpSwitchAgainstDummyRuff,
    isLowPromisesHonorLead,
    isOpeningHonorSequenceLead,
    attitudeSignalSupport,
    chooseOpeningLeadAttitudeSignal,
    chooseThirdHandHighOverLowLead,
    chooseThirdHandUnblockHonor,
    chooseProtectPartnerWinnerFromDummy,
    playedHigherCardsInSuit,
    cheapestHigherHonor,
    honorCoverTarget,
    chooseSecondHandDefensivePlay,
    chooseThirdHandDefensivePlay
  };
});

(function initBridgeRulesPlayPlanSuitContractSideSuits(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const deps = isCommonJs
    ? { core: require("../../core.js"), common: require("../common.js"), trumps: require("./trumps.js") }
    : { core: root.BridgeRulesParts?.core, common: root.BridgeRulesPlayPlanParts?.common, trumps: root.BridgeRulesPlayPlanParts?.suitContractTrumps };
  const api = factory(deps.core, deps.common, deps.trumps);
  if (isCommonJs) module.exports = api;
  root.BridgeRulesPlayPlanParts = root.BridgeRulesPlayPlanParts || {};
  root.BridgeRulesPlayPlanParts.suitContractSideSuits = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesPlayPlanSuitContractSideSuits(core, common, trumps) {
  "use strict";

  if (!core) throw new Error("BridgeRules play-plan suit-contract suitContractSideSuits missing core dependency");
  if (!common) throw new Error("BridgeRules play-plan suit-contract suitContractSideSuits missing common dependency");

  const {
    seats,
    suits,
    rankOrder,
    descendingRanks,
    hcpValue,
    compareCards,
    lowestCard,
    highestCard,
    teamOf,
    partnerOf
  } = core;
  const {
    visibleTopWinnerRanks,
    seatForSuitRank,
    blockedSuitInfo,
    cardsInSuit,
    hasRank,
    playedCardsFrom,
    finesseCandidate,
    repeatFinesseCandidate
  } = common;

  const { trumpEntryCandidateForSeat } = trumps || {};

  function suitWorkSuitBeforeTrumpEntryPriorities({
      declarerHand,
      dummyHand,
      trump,
      declarer,
      dummy,
      playedCards = [],
      losers
    }) {
        if (!trump || !losers || losers.total <= losers.allowed) return [];
        const sides = [
          { seat: declarer, hand: declarerHand },
          { seat: dummy, hand: dummyHand }
        ];
        const candidates = [];

        for (const suit of suits) {
          if (suit === trump) continue;
          const playedSuitCards = cardsInSuit(playedCards, suit);
          for (const sourceSide of sides) {
            const leadSide = sides.find((side) => side.seat !== sourceSide.seat);
            const sourceSuitCards = cardsInSuit(sourceSide.hand, suit);
            const leadSuitCards = cardsInSuit(leadSide.hand, suit);
            if (sourceSuitCards.length < 4 || leadSuitCards.length < 2) continue;
            if (hasRank([...sourceSuitCards, ...leadSuitCards], "A") || hasRank(playedSuitCards, "A")) continue;
            if (!hasRank(leadSuitCards, "K")) continue;
            if (!hasRank(sourceSuitCards, "Q") || !hasRank(sourceSuitCards, "J")) continue;

            const entry = trumpEntryCandidateForSeat({
              declarerHand,
              dummyHand,
              trump,
              playedCards,
              entrySeat: sourceSide.seat,
              fromSeat: leadSide.seat,
              declarer,
              dummy
            });
            if (!entry) continue;
            if (nonTrumpEntryCandidate(sourceSide.hand, leadSide.hand, playedCards, suit, trump)) continue;

            const futureWinnerRanks = ["Q", "J", "T"].filter((rank) => hasRank(sourceSuitCards, rank));
            const discardCapacity = Math.max(0, futureWinnerRanks.length - Math.max(0, leadSuitCards.length - 1));
            const discardSuits = realDiscardSuitsForSeat({ hand: leadSide.hand, trump, workSuit: suit, playedCards, losers });
            if (!discardSuits.length || discardCapacity < 1) continue;

            candidates.push({
              kind: "developSideSuitBeforeTrumpEntry",
              confidence: "basic",
              suit,
              leadSeat: leadSide.seat,
              sourceSeat: sourceSide.seat,
              leadRank: "K",
              missingStopper: "A",
              futureWinnerRanks,
              discardSuits,
              discardCapacity: Math.min(discardCapacity, discardSuits.reduce((total, discardSuit) => total + (losers.bySuit[discardSuit] || 0), 0)),
              entrySuit: trump,
              entryRank: entry.entryRank,
              entrySeat: sourceSide.seat,
              timing: "beforeTrumpEntry",
              score: 110 + discardCapacity * 16 + futureWinnerRanks.length * 8 + sourceSuitCards.length
            });
          }
        }

        return candidates.sort((a, b) => b.score - a.score);
      }



  function nonTrumpEntryCandidate(targetHand, partnerHand, playedCards = [], excludedSuit, trump) {
        return suits
          .filter((suit) => suit !== excludedSuit && suit !== trump)
          .some((suit) => {
            const targetSuitCards = cardsInSuit(targetHand, suit);
            const partnerSuitCards = cardsInSuit(partnerHand, suit);
            const winnerRanks = visibleTopWinnerRanks([...targetSuitCards, ...partnerSuitCards], cardsInSuit(playedCards, suit));
            return winnerRanks.some((rank) => hasRank(targetSuitCards, rank));
          });
      }



  function realDiscardSuitsForSeat({ hand, trump, workSuit, playedCards = [], losers }) {
        return suits.filter((suit) => {
          if (suit === trump || suit === workSuit || !losers.bySuit?.[suit]) return false;
          if (!cardsInSuit(hand, suit).length) return false;
          const missing = losers.detailsBySuit?.[suit]?.missingTopHonors || [];
          return missing.some((rank) => !hasRank(cardsInSuit(playedCards, suit), rank));
        });
      }



  function suitDevelopDiscardPriorities({
      declarerHand,
      dummyHand,
      trump,
      declarer,
      dummy,
      currentTrick = [],
      playedCards = [],
      losers
    }) {
        const candidates = [];
        for (const discardSuit of suits) {
          if (discardSuit === trump || !losers?.bySuit?.[discardSuit]) continue;
          const discardDetail = losers.detailsBySuit?.[discardSuit];
          if (discardDetail?.ruffReduction) continue;

          for (const suit of suits) {
            if (suit === trump || suit === discardSuit) continue;
            const candidate = sideSuitDiscardDevelopmentCandidate({
              suit,
              discardSuit,
              trump,
              declarerHand,
              dummyHand,
              declarer,
              dummy,
              currentTrick,
              playedCards,
              loserCount: losers.bySuit[discardSuit]
            });
            if (candidate) candidates.push(candidate);
            const finesseCandidate = sideSuitFinesseDiscardCandidate({
              suit,
              discardSuit,
              trump,
              declarerHand,
              dummyHand,
              declarer,
              dummy,
              currentTrick,
              playedCards,
              loserCount: losers.bySuit[discardSuit]
            });
            if (finesseCandidate) candidates.push(finesseCandidate);
          }
        }
        return candidates.sort((a, b) => b.score - a.score);
      }



  function sideSuitFinesseDiscardCandidate({
      suit,
      discardSuit,
      trump,
      declarerHand,
      dummyHand,
      declarer,
      dummy,
      currentTrick = [],
      playedCards = [],
      loserCount = 0
    }) {
        const playedSuitCards = cardsInSuit(playedCards, suit);
        if (hasRank(playedSuitCards, "K")) return null;

        const sides = [
          { seat: declarer, hand: declarerHand, suitCards: cardsInSuit(declarerHand, suit) },
          { seat: dummy, hand: dummyHand, suitCards: cardsInSuit(dummyHand, suit) }
        ];

        const candidates = sides.map((leadSide) => {
          const sourceSide = sides.find((side) => side.seat !== leadSide.seat);
          if (!hasRank(leadSide.suitCards, "Q") || leadSide.suitCards.length < 2) return null;
          if (!hasRank(sourceSide.suitCards, "A") || !hasRank(sourceSide.suitCards, "J")) return null;
          if (hasRank([...leadSide.suitCards, ...sourceSide.suitCards], "K")) return null;

          const leadContext = sideSuitHonorLeadContext({ suit, leadSide, leadRank: "Q", currentTrick });
          if (!leadContext) return null;

          const futureWinnerRanks = ["A", "J", "T"].filter((rank) => hasRank(sourceSide.suitCards, rank));
          const discardCapacity = Math.max(0, futureWinnerRanks.length - leadContext.remainingLeadSuitLength);
          const discardCount = Math.min(discardCapacity, loserCount);
          if (discardCount < 1 || !cardsInSuit(leadSide.hand, discardSuit).length) return null;

          return {
            kind: "establishSideSuitForDiscard",
            confidence: "uncertain",
            suit,
            discardSuit,
            leadSeat: leadSide.seat,
            sourceSeat: sourceSide.seat,
            discardSeat: leadSide.seat,
            leadRank: "Q",
            leadCard: leadContext.card,
            missingStopper: "K",
            futureWinnerRanks,
            discardCapacity,
            discardCount,
            entrySuit: suit,
            entryRank: "A",
            entryType: "sameSuitAce",
            finesseRank: "Q",
            timing: "beforeDrawTrumps",
            score: 126 + discardCount * 20 + futureWinnerRanks.length * 8 + sourceSide.suitCards.length
          };
        }).filter(Boolean);

        return candidates.sort((a, b) => b.score - a.score)[0] || null;
      }



  function sideSuitDiscardDevelopmentCandidate({
      suit,
      discardSuit,
      trump,
      declarerHand,
      dummyHand,
      declarer,
      dummy,
      currentTrick = [],
      playedCards = [],
      loserCount = 0
    }) {
        const playedSuitCards = cardsInSuit(playedCards, suit);
        const declarerSuitCards = cardsInSuit(declarerHand, suit);
        const dummySuitCards = cardsInSuit(dummyHand, suit);
        const combinedCards = [...declarerSuitCards, ...dummySuitCards];
        if (hasRank(combinedCards, "A") || hasRank(playedSuitCards, "A")) return null;

        const sides = [
          { seat: declarer, hand: declarerHand, suitCards: declarerSuitCards },
          { seat: dummy, hand: dummyHand, suitCards: dummySuitCards }
        ];

        const candidates = sides.map((sourceSide) => {
          if (!hasRank(sourceSide.suitCards, "K") || !hasRank(sourceSide.suitCards, "Q")) return null;
          const leadSide = sides.find((side) => side.seat !== sourceSide.seat);
          const leadContext = sideSuitDiscardLeadContext({ suit, leadSide, currentTrick });
          if (!leadContext) return null;
          if (sourceSide.suitCards.length <= leadContext.remainingLeadSuitLength) return null;

          const futureWinnerRanks = ["K", "Q"].filter((rank) => hasRank(sourceSide.suitCards, rank));
          const discardCapacity = Math.max(0, futureWinnerRanks.length - leadContext.remainingLeadSuitLength);
          const discardCount = Math.min(discardCapacity, loserCount);
          if (discardCount < 1 || !cardsInSuit(leadSide.hand, discardSuit).length) return null;

          const entry = sideSuitDiscardEntryCandidate({
            targetSide: sourceSide,
            leadSide,
            playedCards,
            excludedSuit: suit,
            trump,
            discardSuit
          });
          if (!entry) return null;

          return {
            kind: "establishSideSuitForDiscard",
            confidence: "basic",
            suit,
            discardSuit,
            leadSeat: leadSide.seat,
            sourceSeat: sourceSide.seat,
            discardSeat: leadSide.seat,
            leadRank: leadContext.rank,
            leadCard: leadContext.card,
            missingStopper: "A",
            futureWinnerRanks,
            discardCapacity,
            discardCount,
            entrySuit: entry.suit,
            entryRank: entry.entryRank,
            entryType: "visibleWinner",
            timing: "beforeDrawTrumps",
            score: 102 + discardCount * 20 + futureWinnerRanks.length * 8 + sourceSide.suitCards.length * 2 + (entry.suit === discardSuit ? 6 : 0)
          };
        }).filter(Boolean);

        return candidates.sort((a, b) => b.score - a.score)[0] || null;
      }



  function sideSuitDiscardLeadContext({ suit, leadSide, currentTrick = [] }) {
        const leadSuitCards = cardsInSuit(leadSide.hand, suit);
        if (currentTrick.length) {
          const lead = currentTrick[0];
          if (lead?.seat !== leadSide.seat || lead.card?.suit !== suit || lead.card.rank !== "J") return null;
          return {
            card: lead.card,
            rank: "J",
            remainingLeadSuitLength: leadSuitCards.length,
            inProgress: true
          };
        }

        const leadCard = leadSuitCards.find((card) => card.rank === "J");
        if (!leadCard) return null;
        return {
          card: leadCard,
          rank: "J",
          remainingLeadSuitLength: Math.max(0, leadSuitCards.length - 1),
          inProgress: false
        };
      }



  function sideSuitHonorLeadContext({ suit, leadSide, leadRank, currentTrick = [] }) {
        const leadSuitCards = cardsInSuit(leadSide.hand, suit);
        if (currentTrick.length) {
          const lead = currentTrick[0];
          if (lead?.seat !== leadSide.seat || lead.card?.suit !== suit || lead.card.rank !== leadRank) return null;
          return {
            card: lead.card,
            rank: leadRank,
            remainingLeadSuitLength: leadSuitCards.length,
            inProgress: true
          };
        }

        const leadCard = leadSuitCards.find((card) => card.rank === leadRank);
        if (!leadCard) return null;
        return {
          card: leadCard,
          rank: leadRank,
          remainingLeadSuitLength: Math.max(0, leadSuitCards.length - 1),
          inProgress: false
        };
      }



  function sideSuitDiscardEntryCandidate({ targetSide, leadSide, playedCards = [], excludedSuit, trump, discardSuit }) {
        return suits
          .filter((suit) => suit !== excludedSuit && suit !== trump)
          .map((suit) => {
            const targetSuitCards = cardsInSuit(targetSide.hand, suit);
            const leadSuitCards = cardsInSuit(leadSide.hand, suit);
            if (!targetSuitCards.length || !leadSuitCards.length) return null;
            if (suit === discardSuit && leadSuitCards.length < 2) return null;

            const winnerRanks = visibleTopWinnerRanks(
              [...targetSuitCards, ...leadSuitCards],
              cardsInSuit(playedCards, suit)
            );
            const targetWinnerRanks = winnerRanks.filter((rank) => hasRank(targetSuitCards, rank));
            if (!targetWinnerRanks.length) return null;

            return {
              suit,
              entryRank: targetWinnerRanks[0],
              winnerCount: targetWinnerRanks.length,
              score: (suit === discardSuit ? 30 : 10) + targetWinnerRanks.length * 8 + targetSuitCards.length
            };
          })
          .filter(Boolean)
          .sort((a, b) => b.score - a.score)[0] || null;
      }



  function suitUrgentDiscardPriorities({
      declarerHand,
      dummyHand,
      trump,
      declarer,
      dummy,
      currentTrick = [],
      trickHistory = [],
      losers,
      cashPriorities = []
    }) {
        const attackedSuit = urgentAttackedSuit({ currentTrick, trickHistory, declarer, dummy, trump });
        if (!attackedSuit || !losers?.bySuit?.[attackedSuit]) return [];

        const sides = {
          [declarer]: declarerHand,
          [dummy]: dummyHand
        };
        return cashPriorities
          .filter((priority) => priority.suit && priority.suit !== trump && priority.suit !== attackedSuit)
          .map((priority) => {
            const declarerSuitLength = cardsInSuit(declarerHand, priority.suit).length;
            const dummySuitLength = cardsInSuit(dummyHand, priority.suit).length;
            const discardSeat = declarerSuitLength <= dummySuitLength ? declarer : dummy;
            const discardCapacity = Math.max(0, (priority.cashRanks || []).length - Math.min(declarerSuitLength, dummySuitLength));
            if (discardCapacity < 1 || !cardsInSuit(sides[discardSeat], attackedSuit).length) return null;

            const firstRank = priority.cashRanks?.[0];
            const firstSeat = firstRank
              ? seatForSuitRank(firstRank, cardsInSuit(declarerHand, priority.suit), cardsInSuit(dummyHand, priority.suit), declarer, dummy)
              : priority.firstSeat;
            if (!firstSeat) return null;

            return {
              ...priority,
              kind: "discardLoserOnWinner",
              confidence: priority.confidence || "basic",
              attackedSuit,
              discardSeat,
              discardCapacity,
              firstSeat,
              timing: "urgentBeforeTrumps",
              score: 95 + discardCapacity * 8 + (priority.cashRanks || []).length * 3
            };
          })
          .filter(Boolean)
          .sort((a, b) => b.score - a.score);
      }



  function urgentAttackedSuit({ currentTrick = [], trickHistory = [], declarer, dummy, trump }) {
        const declarerTeam = teamOf(declarer);
        const currentLead = currentTrick[0];
        if (currentLead && currentLead.card.suit !== trump && teamOf(currentLead.seat) !== declarerTeam) {
          return currentLead.card.suit;
        }

        const recentOpponentLead = [...trickHistory].reverse().find((trick) => {
          const lead = trick.cards?.[0];
          return lead && lead.card.suit !== trump && teamOf(lead.seat) !== declarerTeam;
        });
        return recentOpponentLead?.cards?.[0]?.card?.suit || null;
      }



  function suitSideWinnerDetails({ declarerHand, dummyHand, trump, declarer, dummy, playedCards = [] }) {
        return suits
          .filter((suit) => suit !== trump)
          .map((suit) => {
            const declarerSuitCards = cardsInSuit(declarerHand, suit);
            const dummySuitCards = cardsInSuit(dummyHand, suit);
            const winnerRanks = visibleTopWinnerRanks([...declarerSuitCards, ...dummySuitCards], cardsInSuit(playedCards, suit));
            if (!winnerRanks.length) return null;

            const blockage = blockedSuitInfo({
              declarerHand,
              dummyHand,
              declarerSuitCards,
              dummySuitCards,
              declarer,
              dummy,
              suit,
              winnerRanks
            });
            const blocked = Boolean(blockage);
            const cashableRanks = blocked ? blockage.cashFirstRanks : winnerRanks;
            const winnerCards = winnerRanks
              .map((rank) => suitWinnerCardDetail(rank, declarerSuitCards, dummySuitCards, declarer, dummy))
              .filter(Boolean);
            const cashableCards = cashableRanks
              .map((rank) => winnerCards.find((winner) => winner.rank === rank))
              .filter(Boolean);

            return {
              suit,
              winnerRanks,
              cashableRanks,
              winnerCards,
              cashableCards,
              blocked,
              blockedSeat: blockage?.blockedSeat || null,
              longSeat: blockage?.longSeat || longerSuitSeat(declarerSuitCards, dummySuitCards, declarer, dummy),
              cashFirstRanks: blocked ? blockage.cashFirstRanks : winnerRanks,
              strandedRanks: blocked ? blockage.strandedRanks : [],
              entryCard: blockage?.entryCard || null,
              entrySuit: blockage?.entryCard?.suit || null,
              entryRank: blockage?.entryCard?.rank || null,
              entryType: blockage?.entryCard ? "outsideAce" : null,
              entryTiming: blockage ? (blockage.entryCard ? "outsideEntry" : "blockedNoEntry") : "notBlocked",
              cardsBySeat: {
                [declarer]: declarerSuitCards,
                [dummy]: dummySuitCards
              }
            };
          })
          .filter(Boolean);
      }



  function suitWinnerCardDetail(rank, declarerSuitCards, dummySuitCards, declarer, dummy) {
        const declarerCard = declarerSuitCards.find((card) => card.rank === rank);
        if (declarerCard) {
          return {
            rank,
            seat: declarer,
            card: declarerCard,
            cardId: declarerCard.id
          };
        }
        const dummyCard = dummySuitCards.find((card) => card.rank === rank);
        if (dummyCard) {
          return {
            rank,
            seat: dummy,
            card: dummyCard,
            cardId: dummyCard.id
          };
        }
        return null;
      }



  function longerSuitSeat(declarerSuitCards, dummySuitCards, declarer, dummy) {
        if (declarerSuitCards.length === dummySuitCards.length) return null;
        return declarerSuitCards.length > dummySuitCards.length ? declarer : dummy;
      }



  function suitCashPriorities(declarerHand, dummyHand, trump, declarer, dummy, playedCards = []) {
        return suits
          .filter((suit) => suit !== trump)
          .map((suit) => {
            const declarerSuitCards = cardsInSuit(declarerHand, suit);
            const dummySuitCards = cardsInSuit(dummyHand, suit);
            const winnerRanks = visibleTopWinnerRanks([...declarerSuitCards, ...dummySuitCards], cardsInSuit(playedCards, suit));
            if (!winnerRanks.length) return null;
            const blockage = blockedSuitInfo({
              declarerHand,
              dummyHand,
              declarerSuitCards,
              dummySuitCards,
              declarer,
              dummy,
              suit,
              winnerRanks
            });
            const hasBlockage = Boolean(blockage);
            const unblockFirst = Boolean(blockage?.entryCard);
            const cashRanks = hasBlockage && !unblockFirst ? blockage.cashFirstRanks : unblockFirst ? blockage.cashFirstRanks : winnerRanks;
            return {
              kind: "cashWinners",
              confidence: hasBlockage && !unblockFirst ? "uncertain" : "basic",
              suit,
              winnerCount: winnerRanks.length,
              cashableWinners: cashRanks.length,
              cashRanks,
              blocked: hasBlockage,
              firstSeat: hasBlockage ? blockage.blockedSeat : null,
              targetSeat: hasBlockage ? blockage.longSeat : null,
              entrySuit: blockage?.entryCard?.suit || null,
              entryRank: blockage?.entryCard?.rank || null,
              strandedRanks: hasBlockage ? blockage.strandedRanks : [],
              timing: unblockFirst ? "unblockBeforeEntry" : hasBlockage ? "blockedNoEntry" : "afterTrumps",
              score: (unblockFirst ? 70 : hasBlockage ? 2 : 6) + cashRanks.length * 3
            };
          })
          .filter(Boolean)
          .sort((a, b) => b.score - a.score);
      }



  return {
    suitWorkSuitBeforeTrumpEntryPriorities,
    nonTrumpEntryCandidate,
    realDiscardSuitsForSeat,
    suitDevelopDiscardPriorities,
    sideSuitFinesseDiscardCandidate,
    sideSuitDiscardDevelopmentCandidate,
    sideSuitDiscardLeadContext,
    sideSuitHonorLeadContext,
    sideSuitDiscardEntryCandidate,
    suitUrgentDiscardPriorities,
    urgentAttackedSuit,
    suitSideWinnerDetails,
    suitWinnerCardDetail,
    longerSuitSeat,
    suitCashPriorities
  };
});

(function initBridgeRulesPlayPlanSuitContractRuffs(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const deps = isCommonJs
    ? { core: require("../../core.js"), common: require("../common.js"), sideSuits: require("./side-suits.js") }
    : { core: root.BridgeRulesParts?.core, common: root.BridgeRulesPlayPlanParts?.common, sideSuits: root.BridgeRulesPlayPlanParts?.suitContractSideSuits };
  const api = factory(deps.core, deps.common, deps.sideSuits);
  if (isCommonJs) module.exports = api;
  root.BridgeRulesPlayPlanParts = root.BridgeRulesPlayPlanParts || {};
  root.BridgeRulesPlayPlanParts.suitContractRuffs = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesPlayPlanSuitContractRuffs(core, common, sideSuits) {
  "use strict";

  if (!core) throw new Error("BridgeRules play-plan suit-contract suitContractRuffs missing core dependency");
  if (!common) throw new Error("BridgeRules play-plan suit-contract suitContractRuffs missing common dependency");

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

  const { suitSideWinnerDetails } = sideSuits || {};

  function shortSuitRuffPriorities(baseHand, supportHand, trump, baseSeat, supportSeat, detailsBySuit) {
        const supportTrumps = cardsInSuit(supportHand, trump);
        const baseTrumps = cardsInSuit(baseHand, trump);
        if (supportTrumps.length < 1 || supportTrumps.length >= baseTrumps.length) return [];
        return suits
          .filter((suit) => suit !== trump)
          .map((suit) => {
            const shortLength = cardsInSuit(supportHand, suit).length;
            const baseLength = cardsInSuit(baseHand, suit).length;
            const losers = detailsBySuit[suit]?.rawLosers || 0;
            const preparationNeeded = shortLength;
            return {
              kind: "ruffShortSuit",
              confidence: "basic",
              suit,
              baseSeat,
              supportSeat,
              longSeat: baseSeat,
              shortSeat: supportSeat,
              shortLength,
              baseLength,
              declarerLength: baseLength,
              preparationNeeded,
              extraTrickValue: true,
              timing: preparationNeeded ? "prepareBeforeRuff" : "ruffNow",
              shortTrumpLength: supportTrumps.length,
              longTrumpLength: baseTrumps.length,
              preserveTrumpCount: 1,
              losers,
              ruffReduction: detailsBySuit[suit]?.ruffReduction || 0,
              score: losers * 20 + (preparationNeeded ? 30 : 45) - shortLength * 4 + Math.max(0, baseLength - shortLength) * 3
            };
          })
          .filter((priority) => {
            if (priority.losers <= 0 || priority.shortLength > 2 || priority.baseLength <= priority.shortLength) return false;
            return priority.shortTrumpLength > priority.preparationNeeded;
          })
          .sort((a, b) => b.score - a.score);
      }



  function longSuitRuffDevelopmentPriorities(declarerHand, dummyHand, trump, declarer, dummy, playedCards = []) {
        const sides = [
          { seat: declarer, hand: declarerHand },
          { seat: dummy, hand: dummyHand }
        ];
        return suits
          .filter((suit) => suit !== trump)
          .flatMap((suit) => {
            const playedSuitCards = cardsInSuit(playedCards, suit);
            return sides.map((longSide) => {
              const shortSide = sides.find((side) => side.seat !== longSide.seat);
              const longSuitCards = cardsInSuit(longSide.hand, suit);
              const shortSuitCards = cardsInSuit(shortSide.hand, suit);
              const shortTrumps = cardsInSuit(shortSide.hand, trump);
              const longTrumps = cardsInSuit(longSide.hand, trump);
              if (longSuitCards.length < 5 || shortSuitCards.length > 1 || shortTrumps.length < 2) return null;
              if (shortTrumps.length >= longTrumps.length) return null;
              if (!longSuitCards.some((card) => hcpValue[card.rank] || card.rank === "T")) return null;

              const opponentsRemaining = Math.max(0, 13 - longSuitCards.length - shortSuitCards.length - playedSuitCards.length);
              const estimatedOpponentsLongest = Math.ceil(opponentsRemaining / 2);
              const estimatedRuffsNeeded = Math.max(1, estimatedOpponentsLongest - shortSuitCards.length);
              if (estimatedRuffsNeeded > shortTrumps.length) return null;

              const entries = longSuitRuffEntryCandidates({
                shortHand: shortSide.hand,
                longHand: longSide.hand,
                playedCards,
                trump,
                ruffSuit: suit
              });
              const entry = entries[0] || null;
              if (!entry) return null;
              const entryCount = entries.length;
              const availableRuffs = shortTrumps.length;
              const maxUsefulRuffs = Math.min(estimatedRuffsNeeded, availableRuffs, entryCount + 1);
              if (maxUsefulRuffs < estimatedRuffsNeeded) return null;
              if (availableRuffs - estimatedRuffsNeeded < 1) return null;

              return {
                kind: "establishLongSuitByRuffing",
                confidence: "basic",
                suit,
                longSeat: longSide.seat,
                shortSeat: shortSide.seat,
                longLength: longSuitCards.length,
                shortLength: shortSuitCards.length,
                shortTrumpLength: shortTrumps.length,
                estimatedRuffsNeeded,
                entryCount,
                availableRuffs,
                maxUsefulRuffs,
                entrySuit: entry.suit,
                entryRank: entry.entryRank,
                timing: "beforeDrawTrumps",
                score: 55 + longSuitCards.length * 5 + shortTrumps.length * 4 - estimatedRuffsNeeded * 3
              };
            });
          })
          .filter(Boolean)
          .sort((a, b) => b.score - a.score);
      }



  function suitCrossRuffPriorities({ declarerHand, dummyHand, trump, declarer, dummy, playedCards = [] }) {
        if (!trump) return [];
        const declarerTrumps = cardsInSuit(declarerHand, trump);
        const dummyTrumps = cardsInSuit(dummyHand, trump);
        const trumpLength = declarerTrumps.length + dummyTrumps.length;
        if (trumpLength < 8 || declarerTrumps.length < 3 || dummyTrumps.length < 3) return [];

        const trumpWinners = visibleTopWinnerRanks([...declarerTrumps, ...dummyTrumps], cardsInSuit(playedCards, trump));
        const hasHighTrumpControl = ["A", "K", "Q"].every((rank) => trumpWinners.includes(rank));
        if (!hasHighTrumpControl) return [];

        const sides = [
          { seat: declarer, hand: declarerHand, trumps: declarerTrumps },
          { seat: dummy, hand: dummyHand, trumps: dummyTrumps }
        ];
        const shortSuits = suits
          .filter((suit) => suit !== trump)
          .map((suit) => {
            const first = sides[0];
            const second = sides[1];
            const firstCards = cardsInSuit(first.hand, suit);
            const secondCards = cardsInSuit(second.hand, suit);
            const firstShort = firstCards.length <= 1 && secondCards.length >= 3;
            const secondShort = secondCards.length <= 1 && firstCards.length >= 3;
            if (!firstShort && !secondShort) return null;
            const shortSide = firstShort ? first : second;
            const longSide = firstShort ? second : first;
            const shortCards = firstShort ? firstCards : secondCards;
            const longCards = firstShort ? secondCards : firstCards;
            const longWinnerRanks = visibleTopWinnerRanks([...longCards, ...shortCards], cardsInSuit(playedCards, suit))
              .filter((rank) => hasRank(longCards, rank));
            if (!longWinnerRanks.length) return null;
            const remainingShortCards = shortCards.filter((card) => !cardsInSuit(playedCards, suit).some((played) => played.id === card.id));
            return {
              suit,
              longSeat: longSide.seat,
              shortSeat: shortSide.seat,
              longLength: longCards.length,
              shortLength: shortCards.length,
              remainingShortLength: remainingShortCards.length,
              shortTrumpLength: shortSide.trumps.length,
              longWinnerRanks,
              ruffCount: Math.min(shortSide.trumps.length, Math.max(1, longCards.length - shortCards.length))
            };
          })
          .filter(Boolean);

        const crossPairs = [];
        for (const first of shortSuits) {
          for (const second of shortSuits) {
            if (first.suit === second.suit) continue;
            if (first.shortSeat === second.shortSeat) continue;
            crossPairs.push([first, second]);
          }
        }
        const pair = crossPairs
          .sort((a, b) => crossRuffPairScore(b, trumpLength, trumpWinners) - crossRuffPairScore(a, trumpLength, trumpWinners))[0];
        if (!pair) return [];

        const cashFirst = pair
          .flatMap((item) => item.longWinnerRanks.map((rank) => ({
            suit: item.suit,
            rank,
            seat: item.longSeat,
            beforeRuffSeat: item.shortSeat
          })))
          .filter((item) => {
            const alreadyPlayed = cardsInSuit(playedCards, item.suit).some((card) => card.rank === item.rank);
            return !alreadyPlayed && ["A", "K"].includes(item.rank);
          });

        return [{
          kind: "crossRuff",
          confidence: "basic",
          suit: pair[0].suit,
          trump,
          trumpLength,
          trumpWinnerRanks: trumpWinners,
          crossSuits: pair,
          cashFirst,
          timing: "beforeDrawTrumps",
          score: 135 + trumpWinners.length * 8 + pair.reduce((total, item) => total + item.ruffCount * 12 + item.longLength, 0)
        }];
      }



  function suitLateCrossRuffPriorities({ declarerHand, dummyHand, trump, declarer, dummy, playedCards = [], currentTrick = [] }) {
        if (!trump || !declarer || !dummy) return [];

        const declarerTrumps = cardsInSuit(declarerHand, trump);
        const dummyTrumps = cardsInSuit(dummyHand, trump);
        if (!declarerTrumps.length || !dummyTrumps.length) return [];

        const playedTrumpCount = cardsInSuit(playedCards, trump).length;
        const defendersRemainingTrumps = 13 - playedTrumpCount - declarerTrumps.length - dummyTrumps.length;
        if (defendersRemainingTrumps !== 0) return [];

        const sides = [
          { seat: declarer, hand: declarerHand, trumps: declarerTrumps },
          { seat: dummy, hand: dummyHand, trumps: dummyTrumps }
        ];
        const leadSuit = currentTrick[0]?.card?.suit || null;
        const lines = suits
          .filter((suit) => suit !== trump)
          .flatMap((suit) => sides.map((longSide) => {
            const shortSide = sides.find((side) => side.seat !== longSide.seat);
            const longCards = cardsInSuit(longSide.hand, suit);
            const shortCards = cardsInSuit(shortSide.hand, suit);
            const activeLeadCards = currentTrick
              .filter((play) => play.seat === longSide.seat && play.card?.suit === suit)
              .map((play) => play.card);
            if (shortCards.length || !shortSide.trumps.length) return null;
            if (!longCards.length && !activeLeadCards.length) return null;

            const leadCardIds = uniqueCardIds([...activeLeadCards, ...longCards]);
            const isCurrentSuit = Boolean(
              leadSuit === suit &&
              activeLeadCards.length &&
              !currentTrick.some((play) => play.seat === shortSide.seat)
            );
            return {
              suit,
              longSeat: longSide.seat,
              shortSeat: shortSide.seat,
              shortTrumpLength: shortSide.trumps.length,
              leadCardIds,
              isCurrentSuit,
              score: (isCurrentSuit ? 40 : 0) + shortSide.trumps.length * 8 + leadCardIds.length * 3
            };
          }))
          .filter(Boolean)
          .sort(compareLateCrossRuffLines);

        const hasDeclarerToDummy = lines.some((line) => line.longSeat === declarer && line.shortSeat === dummy);
        const hasDummyToDeclarer = lines.some((line) => line.longSeat === dummy && line.shortSeat === declarer);
        if (!hasDeclarerToDummy || !hasDummyToDeclarer) return [];

        const currentLine = lines.find((line) => line.isCurrentSuit) || null;
        const nextLine = currentLine
          ? lines.find((line) => line.longSeat === currentLine.shortSeat && line.shortSeat === currentLine.longSeat)
            || lines.find((line) => line.longSeat === currentLine.shortSeat)
            || null
          : lines[0] || null;
        const crossSuits = orderedUniqueLines([currentLine, nextLine, ...lines]);
        const cashFirst = lateCrossRuffCashFirst({
          winnerDetails: suitSideWinnerDetails({ declarerHand, dummyHand, trump, declarer, dummy, playedCards }),
          crossSuits
        });

        return [{
          kind: "lateCrossRuff",
          confidence: "basic",
          trump,
          defendersRemainingTrumps,
          crossSuits,
          cashFirst,
          currentSuit: currentLine?.suit || null,
          nextSuit: nextLine?.suit || null,
          timing: "lateEndgame",
          score: 170 + crossSuits.reduce((total, line) => total + line.score, 0) + cashFirst.length * 6
        }];
      }



  function lateCrossRuffCashFirst({ winnerDetails = [], crossSuits = [] }) {
        return winnerDetails
          .filter((detail) => {
            return detail.cashableCards.length && (!detail.blocked || detail.entryCard);
          })
          .flatMap((detail) => {
            const crossLine = crossSuits.find((line) => line.suit === detail.suit) || null;
            if (!crossLine) {
              return detail.cashableCards.map((winner) => ({
                suit: detail.suit,
                rank: winner.rank,
                seat: winner.seat,
                cardId: winner.cardId,
                reason: "sideWinner"
              }));
            }

            const leadCards = detail.cardsBySeat[crossLine.longSeat] || [];
            const surplusCount = Math.max(0, leadCards.length - 1);
            if (!surplusCount) return [];

            return detail.cashableCards
              .filter((winner) => winner.seat === crossLine.longSeat)
              .slice(0, surplusCount)
              .map((winner) => ({
                suit: detail.suit,
                rank: winner.rank,
                seat: winner.seat,
                cardId: winner.cardId,
                reason: "surplusCrossRuffWinner"
              }));
          });
      }



  function uniqueCardIds(cards) {
        return [...new Set(cards.filter(Boolean).map((card) => card.id))];
      }



  function compareLateCrossRuffLines(a, b) {
        const scoreDiff = b.score - a.score;
        if (scoreDiff) return scoreDiff;
        const suitDiff = suits.indexOf(a.suit) - suits.indexOf(b.suit);
        if (suitDiff) return suitDiff;
        return seats.indexOf(a.longSeat) - seats.indexOf(b.longSeat);
      }



  function orderedUniqueLines(lines) {
        const seen = new Set();
        return lines.filter((line) => {
          if (!line) return false;
          const key = line.suit + ":" + line.longSeat + ":" + line.shortSeat;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      }



  function crossRuffPairScore(pair, trumpLength, trumpWinners) {
        return trumpLength * 4 + trumpWinners.length * 8 + pair.reduce((total, item) => {
          return total + item.ruffCount * 12 + item.longLength * 2 + item.longWinnerRanks.length * 4 - item.shortLength * 3;
        }, 0);
      }




  function longSuitRuffEntryCandidates({ shortHand, longHand, playedCards, trump, ruffSuit }) {
        return suits
          .filter((suit) => suit !== trump && suit !== ruffSuit)
          .map((suit) => longSuitRuffEntryCandidate({ suit, shortHand, longHand, playedCards }))
          .filter(Boolean)
          .sort((a, b) => b.score - a.score);
      }



  function longSuitRuffEntryCandidate({ suit, shortHand, longHand, playedCards }) {
        const leadCards = cardsInSuit(shortHand, suit);
        const longSuitCards = cardsInSuit(longHand, suit);
        if (!leadCards.length || !longSuitCards.length) return null;

        const winnerRanks = visibleTopWinnerRanks([...leadCards, ...longSuitCards], cardsInSuit(playedCards, suit));
        const longWinnerRanks = winnerRanks.filter((rank) => hasRank(longSuitCards, rank));
        if (!longWinnerRanks.length) return null;

        const entryRank = longWinnerRanks[0];
        const lowerLeadCards = leadCards.filter((card) => rankOrder.indexOf(card.rank) < rankOrder.indexOf(entryRank));
        const card = lowestCard(lowerLeadCards);
        if (!card) return null;

        return {
          card,
          suit,
          entryRank,
          score: longWinnerRanks.length * 20 + winnerRanks.length * 8 + leadCards.length + longSuitCards.length
        };
      }



  return {
    shortSuitRuffPriorities,
    longSuitRuffDevelopmentPriorities,
    suitCrossRuffPriorities,
    suitLateCrossRuffPriorities,
    lateCrossRuffCashFirst,
    uniqueCardIds,
    compareLateCrossRuffLines,
    orderedUniqueLines,
    crossRuffPairScore,
    longSuitRuffEntryCandidates,
    longSuitRuffEntryCandidate
  };
});

(function initBridgeRulesCardPlayLeads(root, factory) {
  const isCommonJs = typeof module === "object" && module.exports;
  const deps = isCommonJs
    ? {
        core: require("../core.js"),
        playPlan: require("../play-plan.js")
      }
    : root.BridgeRulesParts || {};
  const api = factory(deps.core, deps.playPlan);
  if (isCommonJs) module.exports = api;
  root.BridgeRulesParts = root.BridgeRulesParts || {};
  root.BridgeRulesParts.cardPlayLeads = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRulesCardPlayLeads(core, playPlan) {
  "use strict";

  const {
    suits,
    rankOrder,
    descendingRanks,
    leadHonorRanks,
    hcpValue,
    compareLowCards,
    lowestCard,
    highestCard,
    longestSuitForLead,
    isLeadHonorRank,
    isLowLeadCard,
    teamOf,
    partnerOf
  } = core;
  const { cardsInSuit } = playPlan;

  function cardPlayResult(card, ruleName, confidence, reason, extra = {}) {
    return {
      card,
      ruleId: ruleName,
      confidence,
      reason,
      ...extra
    };
  }

  function cardFromRank(cards, rank) {
        return cards.find((card) => card.rank === rank) || null;
      }

  function isPictureRank(rank) {
        return Boolean(hcpValue[rank]);
      }

  function consecutiveRanksFrom(cards, startRank) {
        const ranks = new Set(cards.map((card) => card.rank));
        const startIndex = descendingRanks.indexOf(startRank);
        if (startIndex < 0 || !ranks.has(startRank)) return [];

        const run = [];
        for (let i = startIndex; i < descendingRanks.length; i++) {
          if (!ranks.has(descendingRanks[i])) break;
          run.push(descendingRanks[i]);
        }
        return run;
      }

  function touchingLeadSequence(cards, minimumLength = 2) {
        for (let i = 0; i < descendingRanks.length; i++) {
          const topRank = descendingRanks[i];
          if (!isPictureRank(topRank)) continue;

          const run = consecutiveRanksFrom(cards, topRank);
          if (run.length >= minimumLength) {
            return {
              type: "sequence",
              ranks: run,
              topRank,
              card: cardFromRank(cards, topRank),
              score: 300 - i
            };
          }
        }
        return null;
      }

  function touchingHonorSequence(cards, minimumLength = 2) {
        const ranks = new Set(cards.map((card) => card.rank));
        for (let i = 0; i < leadHonorRanks.length; i++) {
          const topRank = leadHonorRanks[i];
          if (!ranks.has(topRank)) continue;

          const run = [];
          for (let j = i; j < leadHonorRanks.length; j++) {
            if (!ranks.has(leadHonorRanks[j])) break;
            run.push(leadHonorRanks[j]);
          }
          if (run.length >= minimumLength) {
            return {
              ranks: run,
              topRank,
              card: cardFromRank(cards, topRank)
            };
          }
        }
        return null;
      }

  function aceKingLeadPattern(cards) {
        const ranks = new Set(cards.map((card) => card.rank));
        if (!ranks.has("A") || !ranks.has("K")) return null;
        return {
          type: "aceKing",
          ranks: ["A", "K"],
          topRank: "A",
          card: cardFromRank(cards, "A"),
          score: 280
        };
      }

  function brokenLeadSequence(cards) {
        const ranks = new Set(cards.map((card) => card.rank));
        const candidates = [];

        for (let i = 0; i < descendingRanks.length; i++) {
          const topRank = descendingRanks[i];
          if (!isPictureRank(topRank) || !ranks.has(topRank)) continue;

          const nextRank = descendingRanks[i + 1];
          const gapRank = descendingRanks[i + 2];
          const fourthRank = descendingRanks[i + 3];
          if (nextRank && fourthRank && ranks.has(nextRank) && !ranks.has(gapRank) && ranks.has(fourthRank)) {
            candidates.push({
              type: "brokenSequence",
              ranks: [topRank, nextRank, fourthRank],
              topRank,
              missingRank: gapRank,
              score: 200 - i
            });
          }
        }

        const best = candidates.sort((a, b) => {
          const topDiff = rankOrder.indexOf(b.topRank) - rankOrder.indexOf(a.topRank);
          if (topDiff) return topDiff;
          return b.score - a.score;
        })[0];
        if (!best) return null;

        return {
          ...best,
          card: cardFromRank(cards, best.topRank)
        };
      }

  function internalLeadSequence(cards) {
        const ranks = new Set(cards.map((card) => card.rank));
        const candidates = [];

        for (const higherRank of descendingRanks.filter(isPictureRank)) {
          if (!ranks.has(higherRank)) continue;

          const higherIndex = descendingRanks.indexOf(higherRank);
          for (let i = higherIndex + 2; i < descendingRanks.length; i++) {
            const topRank = descendingRanks[i];
            if (!isLeadHonorRank(topRank) || !ranks.has(topRank)) continue;

            const run = consecutiveRanksFrom(cards, topRank);
            if (run.length >= 2) {
              candidates.push({
                type: "internalSequence",
                ranks: run,
                topRank,
                higherRank,
                card: cardFromRank(cards, topRank),
                score: 150 - i
              });
            }
          }
        }

        return candidates.sort((a, b) => {
          const topDiff = descendingRanks.indexOf(a.topRank) - descendingRanks.indexOf(b.topRank);
          if (topDiff) return topDiff;
          const lengthDiff = b.ranks.length - a.ranks.length;
          if (lengthDiff) return lengthDiff;
          return descendingRanks.indexOf(a.higherRank) - descendingRanks.indexOf(b.higherRank);
        })[0] || null;
      }

  function notrumpLeadPattern(cards) {
        return touchingLeadSequence(cards, 3) || brokenLeadSequence(cards) || internalLeadSequence(cards);
      }

  function highCardRanks(cards) {
        return descendingRanks.filter((rank) => hcpValue[rank] && cards.some((card) => card.rank === rank));
      }

  function notrumpOutsideEntries(hand, suit) {
        return suits
          .filter((candidateSuit) => candidateSuit !== suit)
          .reduce((entries, candidateSuit) => {
            const cards = cardsInSuit(hand, candidateSuit);
            const ranks = new Set(cards.map((card) => card.rank));
            let suitEntries = 0;
            if (ranks.has("A")) suitEntries += 1;
            if (ranks.has("K") && (ranks.has("Q") || cards.length >= 4)) suitEntries += 1;
            return entries + suitEntries;
          }, 0);
      }

  function notrumpSuitTextureScore(cards) {
        if (!cards.length) return 0;
        const pattern = notrumpLeadPattern(cards);
        const honors = highCardRanks(cards);
        const tenNineBonus = ["T", "9"].reduce((sum, rank) => (
          cards.some((card) => card.rank === rank) ? sum + 2 : sum
        ), 0);
        const honorScore = honors.reduce((sum, rank) => sum + (hcpValue[rank] || 0) * 4, 0);
        return (pattern ? pattern.score : 0) + honorScore + tenNineBonus;
      }

  function notrumpSuitTieBreakScore(suit) {
        return suit === "S" ? 4 : suit === "H" ? 3 : suit === "D" ? 2 : suit === "C" ? 1 : 0;
      }

  function hasUnsupportedAce(cards) {
        const ranks = new Set(cards.map((card) => card.rank));
        return cards.length > 1 && ranks.has("A") && !ranks.has("K");
      }

  function isPoorPartnerSuitLead(cards) {
        return cards.length === 1;
      }

  function isNotrumpSlamContract(contract) {
        return contract?.strain === "NT" && contract.level >= 6;
      }

  function leadAgreement(card, ruleId, confidence, reason, extra = {}) {
        return { card, ruleId, confidence, reason, extra };
      }

  function openingLeadAgreementForSuit(cards, contractType) {
        const aceKing = aceKingLeadPattern(cards);
        if (aceKing?.card) {
          return leadAgreement(
            aceKing.card,
            contractType === "notrump" ? "notrumpAceKingLead" : "suitContractSequenceLead",
            "basic",
            "Lead the ace from ace-king.",
            { sequence: "AK", action: "aceKing" }
          );
        }

        if (contractType === "suit") {
          const singleton = cards.length === 1 ? cards[0] : null;
          if (singleton) {
            return leadAgreement(
              singleton,
              "suitContractSingletonLead",
              "basic",
              "Lead a singleton side suit against a suit contract.",
              { action: "singleton" }
            );
          }

          if (hasUnsupportedAce(cards)) {
            return leadAgreement(
              cardFromRank(cards, "A"),
              "suitContractUnsupportedAceLead",
              "uncertain",
              "Do not lead low from an unsupported ace against a suit contract; lead the ace itself if this suit must be led.",
              {
                action: "unsupportedAce",
                honorSafety: "fallbackUnsupportedAceLead",
                unsupportedHonor: "A"
              }
            );
          }
        }

        const sequence = contractType === "notrump"
          ? notrumpLeadPattern(cards)
          : touchingLeadSequence(cards, 2);
        if (sequence?.card) {
          const ruleId = contractType === "notrump"
            ? sequence.type === "brokenSequence"
              ? "notrumpBrokenSequenceLead"
              : sequence.type === "internalSequence"
                ? "notrumpInternalSequenceLead"
                : "notrumpSequenceLead"
            : "suitContractSequenceLead";
          return leadAgreement(
            sequence.card,
            ruleId,
            "basic",
            "Lead the highest card from the lead sequence.",
            {
              sequence: sequence.ranks.join(""),
              missingRank: sequence.missingRank || null,
              higherRank: sequence.higherRank || null,
              action: sequence.type
            }
          );
        }

        if (contractType === "suit") {
          const internal = internalLeadSequence(cards);
          if (internal?.card) {
            return leadAgreement(
              internal.card,
              "suitContractInternalSequenceLead",
              "basic",
              "Lead the highest card from an internal sequence.",
              {
                sequence: internal.ranks.join(""),
                higherRank: internal.higherRank,
                action: "internalSequence"
              }
            );
          }
        }

        if (cards.length === 2) {
          return leadAgreement(
            highestCard(cards),
            contractType === "notrump" ? "notrumpDoubletonLead" : "suitContractDoubletonLead",
            "basic",
            "Lead the highest card from a doubleton.",
            { action: "doubleton" }
          );
        }

        const honors = highCardRanks(cards);
        if (honors.length) {
          const smallCard = lowestCard(cards.filter(isLowLeadCard));
          if (smallCard) {
            return leadAgreement(
              smallCard,
              contractType === "notrump" ? "notrumpLowPromisesHonor" : "suitContractLowPromisesHonor",
              "basic",
              "Lead low from a suit with at least one picture card and no sequence.",
              {
                honorRanks: honors,
                action: "lowPromisesHonor"
              }
            );
          }
        }

        return leadAgreement(
          highestCard(cards),
          contractType === "notrump" ? "notrumpTopOfNothingLead" : "suitContractTopOfNothingLead",
          "basic",
          "Lead the highest card from a suit without picture cards.",
          { action: "topOfNothing" }
        );
      }

  function ruleIdSuffix(result) {
        return result?.ruleId ? result.ruleId.split(".").slice(1).join(".") : "";
      }

  function artificialSuitBidForLead(call, result) {
        const suffix = ruleIdSuffix(result);
        const strain = call?.bid?.strain;
        if (!suffix) return false;

        if (
          suffix === "opening.strongTwoClubs" ||
          suffix === "response.stayman" ||
          suffix === "response.strongTwoClubsWaiting" ||
          suffix === "competitive.notrumpOvercallStayman" ||
          suffix === "continuation.responderFourthSuitForcing"
        ) {
          return true;
        }

        if (suffix === "continuation.staymanAnswer" && strain === "D") return true;
        return false;
      }

  function shownSuitForLead(call) {
        const bid = call?.bid;
        if (!bid || !suits.includes(bid.strain)) return null;

        const result = call.bidResult || null;
        if (result?.transferSuit && suits.includes(result.transferSuit)) return result.transferSuit;
        if (artificialSuitBidForLead(call, result)) return null;

        return bid.strain;
      }

  function bidSuitsForLead(auction = []) {
        return [...new Set(
          auction
            .map(shownSuitForLead)
            .filter(Boolean)
        )];
      }

  function shownSuitCallsForLead(auction = []) {
        return auction
          .map((call) => ({ seat: call.seat, suit: shownSuitForLead(call) }))
          .filter((call) => call.suit);
      }

  function uniqueSuits(items) {
        return [...new Set(items.filter(Boolean))];
      }

  function longestAvailableSuitForLead(hand, candidateSuits) {
        const suitCounts = suits.reduce((counts, suit) => {
          counts[suit] = hand.filter((card) => card.suit === suit).length;
          return counts;
        }, {});
        return candidateSuits.reduce((best, suit) => {
          if (!best) return suit;
          return suitCounts[suit] > suitCounts[best] ? suit : best;
        }, null);
      }

  function notrumpSuitLeadScore(cards) {
        if (!cards.length) return -1;
        return cards.length * 20 + notrumpSuitTextureScore(cards);
      }

  function notrumpLeadCandidates(hand, candidateSuits = suits, context = {}) {
        const {
          bidSuits = [],
          unbidSuits = [],
          partnerSuits = [],
          dummySecondSuits = []
        } = context;
        return candidateSuits
          .map((suit) => {
            const cards = cardsInSuit(hand, suit);
            const entryCount = notrumpOutsideEntries(hand, suit);
            const textureScore = notrumpSuitTextureScore(cards);
            return {
              suit,
              cards,
              length: cards.length,
              score: notrumpSuitLeadScore(cards),
              textureScore,
              entryCount,
              hasEntry: entryCount > 0,
              isBidSuit: bidSuits.includes(suit),
              isUnbidSuit: unbidSuits.includes(suit),
              isPartnerSuit: partnerSuits.includes(suit),
              isDummySecondSuit: dummySecondSuits.includes(suit),
              tieBreakScore: notrumpSuitTieBreakScore(suit),
              pattern: notrumpLeadPattern(cards),
              honors: highCardRanks(cards)
            };
          })
          .filter((candidate) => candidate.cards.length);
      }

  function compareNotrumpLeadCandidates(a, b) {
        const scoreDiff = b.score - a.score;
        if (scoreDiff) return scoreDiff;
        const lengthDiff = b.length - a.length;
        if (lengthDiff) return lengthDiff;
        const tieBreakDiff = b.tieBreakScore - a.tieBreakScore;
        if (tieBreakDiff) return tieBreakDiff;
        return suits.indexOf(a.suit) - suits.indexOf(b.suit);
      }

  function bestNotrumpLeadCandidate(hand, candidateSuits, context = {}) {
        return notrumpLeadCandidates(hand, candidateSuits, context)
          .sort(compareNotrumpLeadCandidates)[0] || null;
      }

  function hasClearNotrumpDevelopmentValue(candidate) {
        return Boolean(
          candidate &&
          candidate.length >= 4 &&
          (candidate.pattern || candidate.honors.length || candidate.textureScore >= 8)
        );
      }

  function bestNotrumpLeadSuitByQuality(hand, candidateSuits) {
        return bestNotrumpLeadCandidate(hand, candidateSuits)?.suit || null;
      }

  function weakUnbidNotrumpLeadOptions(hand, unbidSuits) {
        const playable = unbidSuits
          .map((suit) => ({ suit, cards: cardsInSuit(hand, suit) }))
          .filter((candidate) => candidate.cards.length);
        if (!playable.length) return true;
        return playable.every((candidate) => (
          candidate.cards.length <= 3 &&
          !highCardRanks(candidate.cards).length &&
          !notrumpLeadPattern(candidate.cards)
        ));
      }

  function dummySecondSuitsForLead(shownSuitCalls, declarer) {
        if (!declarer) return [];
        const dummy = partnerOf(declarer);
        const dummySuits = uniqueSuits(
          shownSuitCalls
            .filter((call) => call.seat === dummy)
            .map((call) => call.suit)
        );
        return dummySuits.slice(1);
      }

  function notrumpLeadSuitForAuction(hand, auction = [], seat = null, declarer = null, contract = null) {
        const shownSuitCalls = shownSuitCallsForLead(auction);
        const bidSuits = uniqueSuits(shownSuitCalls.map((call) => call.suit));
        const unbidSuits = suits.filter((suit) => !bidSuits.includes(suit));
        const partnerSuits = seat
          ? uniqueSuits(shownSuitCalls.filter((call) => call.seat === partnerOf(seat)).map((call) => call.suit))
          : [];
        const dummySecondSuits = dummySecondSuitsForLead(shownSuitCalls, declarer);
        const context = { bidSuits, unbidSuits, partnerSuits, dummySecondSuits };
        const playablePartnerSuits = partnerSuits.filter((suit) => cardsInSuit(hand, suit).length);
        if (playablePartnerSuits.length) {
          const partnerCandidate = bestNotrumpLeadCandidate(hand, playablePartnerSuits, context);
          const alternativeSuits = (unbidSuits.length ? unbidSuits : suits)
            .filter((suit) => !playablePartnerSuits.includes(suit));
          const alternativeCandidate = bestNotrumpLeadCandidate(hand, alternativeSuits, context);
          if (
            partnerCandidate &&
            isPoorPartnerSuitLead(partnerCandidate.cards) &&
            hasClearNotrumpDevelopmentValue(alternativeCandidate)
          ) {
            return {
              suit: alternativeCandidate.suit,
              bidSuits,
              unbidSuits,
              partnerSuits,
              dummySecondSuits,
              leadSelection: "partnerSuitAvoidSingleton",
              avoidedPartnerSingleton: partnerCandidate.suit,
              hasEntry: alternativeCandidate.hasEntry,
              entryCount: alternativeCandidate.entryCount
            };
          }
          return {
            suit: partnerCandidate?.suit || longestAvailableSuitForLead(hand, playablePartnerSuits),
            bidSuits,
            unbidSuits,
            partnerSuits,
            dummySecondSuits,
            hasEntry: partnerCandidate?.hasEntry || false,
            entryCount: partnerCandidate?.entryCount || 0,
            leadSelection: "partnerSuit"
          };
        }

        const playableDummySecondSuits = dummySecondSuits.filter((suit) => cardsInSuit(hand, suit).length);
        if (playableDummySecondSuits.length && weakUnbidNotrumpLeadOptions(hand, unbidSuits)) {
          const dummyCandidate = bestNotrumpLeadCandidate(hand, playableDummySecondSuits, context);
          return {
            suit: dummyCandidate?.suit || longestAvailableSuitForLead(hand, playableDummySecondSuits),
            bidSuits,
            unbidSuits,
            partnerSuits,
            dummySecondSuits,
            hasEntry: dummyCandidate?.hasEntry || false,
            entryCount: dummyCandidate?.entryCount || 0,
            leadSelection: "throughDummySecondSuit"
          };
        }

        const candidateSuits = unbidSuits.length ? unbidSuits : suits;
        const candidates = notrumpLeadCandidates(hand, candidateSuits, context);
        const longestCandidate = longestAvailableSuitForLead(hand, candidateSuits);
        const bestQualityCandidate = bestNotrumpLeadCandidate(hand, candidateSuits, context);
        const longestLeadCandidate = bestNotrumpLeadCandidate(hand, [longestCandidate].filter(Boolean), context);
        const slamCandidate = isNotrumpSlamContract(contract)
          ? notrumpLeadCandidates(hand, candidateSuits, context)
            .filter((candidate) => candidate.pattern || candidate.honors.length)
            .sort((a, b) => {
              const textureDiff = b.textureScore - a.textureScore;
              if (textureDiff) return textureDiff;
              return compareNotrumpLeadCandidates(a, b);
            })[0] || null
          : null;
        const nextLongestLength = candidates
          .filter((candidate) => candidate.suit !== longestLeadCandidate?.suit)
          .reduce((max, candidate) => Math.max(max, candidate.length), 0);
        const weakLongNoEntry = longestLeadCandidate &&
          longestLeadCandidate.length >= 4 &&
          longestLeadCandidate.length >= nextLongestLength + 2 &&
          !longestLeadCandidate.pattern &&
          !longestLeadCandidate.honors.length &&
          !longestLeadCandidate.hasEntry;
        const shortNoEntryCandidate = weakLongNoEntry
          ? notrumpLeadCandidates(hand, candidateSuits, context)
            .filter((candidate) => candidate.suit !== longestLeadCandidate.suit && candidate.length >= 2 && candidate.length <= 3)
            .sort((a, b) => {
              const tieBreakDiff = b.tieBreakScore - a.tieBreakScore;
              if (tieBreakDiff) return tieBreakDiff;
              return compareNotrumpLeadCandidates(a, b);
            })[0] || null
          : null;
        const selectedCandidate = slamCandidate || shortNoEntryCandidate || bestQualityCandidate;
        const choseQuality = selectedCandidate && longestCandidate && selectedCandidate.suit !== longestCandidate;
        const tiedWithLowerSuit = selectedCandidate && candidates.some((candidate) => (
          candidate.suit !== selectedCandidate.suit &&
          candidate.score === selectedCandidate.score &&
          candidate.length === selectedCandidate.length &&
          candidate.tieBreakScore < selectedCandidate.tieBreakScore
        ));
        const leadSelection = slamCandidate
          ? "slamActiveLead"
          : shortNoEntryCandidate
            ? "shortSuitNoEntry"
            : tiedWithLowerSuit
              ? "majorTieBreak"
              : bidSuits.length && unbidSuits.length
                ? (choseQuality ? "qualityUnbidSuit" : "longestUnbidSuit")
                : (choseQuality ? "qualitySuit" : "longestSuit");
        return {
          suit: selectedCandidate?.suit || longestCandidate || longestSuitForLead(hand),
          bidSuits,
          unbidSuits,
          partnerSuits,
          dummySecondSuits,
          hasEntry: selectedCandidate?.hasEntry || false,
          entryCount: selectedCandidate?.entryCount || 0,
          tieBreak: leadSelection === "majorTieBreak" ? "majorSuit" : null,
          slamLead: leadSelection === "slamActiveLead",
          leadSelection
        };
      }

  function chooseNotrumpLeadCardPlay(hand, legal, auction = [], seat = null, declarer = null, contract = null) {
        const leadSuit = notrumpLeadSuitForAuction(hand, auction, seat, declarer, contract);
        const longestSuit = leadSuit.suit;
        const longestSuitCards = legal.filter((card) => card.suit === longestSuit);
        if (!longestSuitCards.length) return null;

        const agreement = openingLeadAgreementForSuit(longestSuitCards, "notrump");
        if (!agreement?.card) return null;
        return cardPlayResult(
          agreement.card,
          agreement.ruleId,
          agreement.confidence,
          agreement.reason,
          {
            suit: longestSuit,
            suitLength: longestSuitCards.length,
            bidSuits: leadSuit.bidSuits,
            unbidSuits: leadSuit.unbidSuits,
            partnerSuits: leadSuit.partnerSuits,
            dummySecondSuits: leadSuit.dummySecondSuits,
            leadSelection: leadSuit.leadSelection,
            hasEntry: leadSuit.hasEntry,
            entryCount: leadSuit.entryCount,
            avoidedPartnerSingleton: leadSuit.avoidedPartnerSingleton,
            tieBreak: leadSuit.tieBreak,
            slamLead: leadSuit.slamLead,
            ...agreement.extra
          }
        );
      }

  function sideSuitGroups(legal, trump) {
        return suits
          .filter((suit) => suit !== trump)
          .map((suit) => ({ suit, cards: cardsInSuit(legal, suit) }))
          .filter((group) => group.cards.length);
      }

  function suitGroupOrder(a, b) {
        const lengthDiff = b.cards.length - a.cards.length;
        if (lengthDiff) return lengthDiff;
        return suits.indexOf(a.suit) - suits.indexOf(b.suit);
      }

  function fourthBestCard(cards) {
        return [...cards].sort((a, b) => rankOrder.indexOf(b.rank) - rankOrder.indexOf(a.rank))[3] || null;
      }

  function unsupportedAceUnderleadRisk(cards) {
        return hasUnsupportedAce(cards) ? { honor: "A", support: "K" } : null;
      }

  function safeSuitContractLengthLeadGroups(groups) {
        return groups
          .map((group) => ({ ...group, agreement: openingLeadAgreementForSuit(group.cards, "suit") }))
          .filter((group) => group.agreement?.card && !unsupportedAceUnderleadRisk(group.cards));
      }

  function unsafeSuitContractLengthLeadGroups(groups) {
        return groups
          .map((group) => ({
            ...group,
            agreement: openingLeadAgreementForSuit(group.cards, "suit"),
            risk: unsupportedAceUnderleadRisk(group.cards)
          }))
          .filter((group) => group.agreement?.card && group.risk);
      }

  function chooseSuitContractLeadCardPlay(legal, trump) {
        const sideSuits = sideSuitGroups(legal, trump);
        if (!sideSuits.length) return null;

        const sequence = sideSuits
          .map((group) => ({ ...group, agreement: openingLeadAgreementForSuit(group.cards, "suit") }))
          .filter((group) => group.agreement?.ruleId === "suitContractSequenceLead")
          .sort((a, b) => {
            const rankDiff = rankOrder.indexOf(b.agreement.extra.sequence?.[0]) - rankOrder.indexOf(a.agreement.extra.sequence?.[0]);
            if (rankDiff) return rankDiff;
            const sequenceDiff = b.agreement.extra.sequence.length - a.agreement.extra.sequence.length;
            if (sequenceDiff) return sequenceDiff;
            return suits.indexOf(a.suit) - suits.indexOf(b.suit);
          })[0];
        if (sequence) {
          return cardPlayResult(
            sequence.agreement.card,
            sequence.agreement.ruleId,
            sequence.agreement.confidence,
            sequence.agreement.reason,
            {
              suit: sequence.suit,
              suitLength: sequence.cards.length,
              ...sequence.agreement.extra
            }
          );
        }

        const singleton = sideSuits.find((group) => group.cards.length === 1);
        if (singleton) {
          const agreement = openingLeadAgreementForSuit(singleton.cards, "suit");
          return cardPlayResult(
            agreement.card,
            agreement.ruleId,
            agreement.confidence,
            agreement.reason,
            {
              suit: singleton.suit,
              suitLength: singleton.cards.length,
              ...agreement.extra
            }
          );
        }

        const doubleton = sideSuits.find((group) => group.cards.length === 2);
        if (doubleton) {
          const agreement = openingLeadAgreementForSuit(doubleton.cards, "suit");
          return cardPlayResult(
            agreement.card,
            agreement.ruleId,
            agreement.confidence,
            agreement.reason,
            {
              suit: doubleton.suit,
              suitLength: doubleton.cards.length,
              ...agreement.extra
            }
          );
        }

        const lengthGroups = sideSuits.filter((group) => group.cards.length >= 4).sort(suitGroupOrder);
        const safeLongSuit = safeSuitContractLengthLeadGroups(lengthGroups)[0];
        if (safeLongSuit) {
          return cardPlayResult(
            safeLongSuit.agreement.card,
            safeLongSuit.agreement.ruleId,
            safeLongSuit.agreement.confidence,
            safeLongSuit.agreement.reason,
            {
              suit: safeLongSuit.suit,
              suitLength: safeLongSuit.cards.length,
              honorSafety: "safeLength",
              ...safeLongSuit.agreement.extra
            }
          );
        }

        const threeSmall = sideSuits.find((group) => group.cards.length === 3 && group.cards.every(isLowLeadCard));
        if (threeSmall) {
          const avoided = unsafeSuitContractLengthLeadGroups(lengthGroups)[0];
          const agreement = openingLeadAgreementForSuit(threeSmall.cards, "suit");
          return cardPlayResult(
            agreement.card,
            agreement.ruleId,
            agreement.confidence,
            agreement.reason,
            {
              suit: threeSmall.suit,
              suitLength: threeSmall.cards.length,
              avoidedSuit: avoided?.suit || null,
              avoidedHonor: avoided?.risk?.honor || null,
              honorSafety: avoided ? "avoidedUnsupportedAceUnderlead" : "safeSmallCards",
              ...agreement.extra
            }
          );
        }

        const unsafeLongSuit = unsafeSuitContractLengthLeadGroups(lengthGroups)[0];
        if (unsafeLongSuit) {
          return cardPlayResult(
            unsafeLongSuit.agreement.card,
            unsafeLongSuit.agreement.ruleId,
            unsafeLongSuit.agreement.confidence,
            unsafeLongSuit.agreement.reason,
            {
              suit: unsafeLongSuit.suit,
              suitLength: unsafeLongSuit.cards.length,
              ...unsafeLongSuit.agreement.extra
            }
          );
        }

        return null;
      }

  function canUseDefensiveLeadAgreement(seat, declarer) {
        return !seat || !declarer || teamOf(seat) !== teamOf(declarer);
      }

  function isDefensivePlaySeat(seat, declarer) {
        return Boolean(seat && declarer && teamOf(seat) !== teamOf(declarer));
      }

  function chooseLeadCardPlay(hand, legal, { contract = null, seat = null, declarer = null, isOpeningLead = true, auction = [] } = {}) {
      if (isOpeningLead && contract?.strain === "NT" && canUseDefensiveLeadAgreement(seat, declarer)) {
        const notrumpLead = chooseNotrumpLeadCardPlay(hand, legal, auction, seat, declarer, contract);
        if (notrumpLead) return notrumpLead;
      }
      if (isOpeningLead && contract?.strain && contract.strain !== "NT" && canUseDefensiveLeadAgreement(seat, declarer)) {
        const suitContractLead = chooseSuitContractLeadCardPlay(legal, contract.strain);
        if (suitContractLead) return suitContractLead;
      }

      const longestSuit = longestSuitForLead(hand);
      const longestSuitCards = legal.filter((card) => card.suit === longestSuit);
      if (longestSuitCards.length) {
        return cardPlayResult(
          highestCard(longestSuitCards),
          "longestSuitLead",
          "uncertain",
          "Lead the highest card from the longest available suit.",
          { suit: longestSuit, suitLength: longestSuitCards.length }
        );
      }

      return cardPlayResult(
        lowestCard(legal),
        "lowestLead",
        "basic",
        "Lead the lowest legal card.",
        {}
      );
    }

  function openingLeadPlay(trickHistory = []) {
        return trickHistory[0]?.cards?.[0] || null;
      }

  return {
    cardFromRank,
    isPictureRank,
    consecutiveRanksFrom,
    touchingLeadSequence,
    touchingHonorSequence,
    aceKingLeadPattern,
    brokenLeadSequence,
    internalLeadSequence,
    notrumpLeadPattern,
    highCardRanks,
    notrumpOutsideEntries,
    notrumpSuitTextureScore,
    notrumpSuitTieBreakScore,
    hasUnsupportedAce,
    isPoorPartnerSuitLead,
    isNotrumpSlamContract,
    leadAgreement,
    openingLeadAgreementForSuit,
    ruleIdSuffix,
    artificialSuitBidForLead,
    shownSuitForLead,
    bidSuitsForLead,
    shownSuitCallsForLead,
    uniqueSuits,
    longestAvailableSuitForLead,
    notrumpLeadCandidates,
    notrumpSuitLeadScore,
    bestNotrumpLeadSuitByQuality,
    weakUnbidNotrumpLeadOptions,
    dummySecondSuitsForLead,
    notrumpLeadSuitForAuction,
    chooseNotrumpLeadCardPlay,
    sideSuitGroups,
    suitGroupOrder,
    fourthBestCard,
    unsupportedAceUnderleadRisk,
    safeSuitContractLengthLeadGroups,
    unsafeSuitContractLengthLeadGroups,
    chooseSuitContractLeadCardPlay,
    canUseDefensiveLeadAgreement,
    isDefensivePlaySeat,
    chooseLeadCardPlay,
    openingLeadPlay
  };
});

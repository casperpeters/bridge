(function initBridgeRules(root, factory) {
  const rules = factory();
  if (typeof module === "object" && module.exports) module.exports = rules;
  root.BridgeRules = rules;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridgeRules() {
  "use strict";

  const seats = ["North", "East", "South", "West"];
  const suits = ["C", "D", "H", "S"];
  const handSuitOrder = ["S", "H", "C", "D"];
  const bidStrains = ["C", "D", "H", "S", "NT"];
  const rankOrder = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"];
  const descendingRanks = [...rankOrder].reverse();
  const leadHonorRanks = ["A", "K", "Q", "J", "T"];
  const hcpValue = { A: 4, K: 3, Q: 2, J: 1 };
  const vulnerabilityCycle = [
    "none", "NS", "EW", "both",
    "NS", "EW", "both", "none",
    "EW", "both", "none", "NS",
    "both", "none", "NS", "EW"
  ];

  function positiveIndex(number, length) {
    return ((number % length) + length) % length;
  }

  function vulnerabilityForDeal(dealNumber) {
    return vulnerabilityCycle[positiveIndex(dealNumber - 1, vulnerabilityCycle.length)];
  }

  function dealerIndexForDeal(dealNumber) {
    return positiveIndex(dealNumber - 1, seats.length);
  }

  function teamOf(seat) {
    return seat === "North" || seat === "South" ? "NS" : "EW";
  }

  function isTeamVulnerable(team, vulnerability) {
    return vulnerability === "both" || vulnerability === team;
  }

  function compareCards(a, b) {
    const suitDiff = handSuitOrder.indexOf(a.suit) - handSuitOrder.indexOf(b.suit);
    if (suitDiff) return suitDiff;
    return rankOrder.indexOf(b.rank) - rankOrder.indexOf(a.rank);
  }

  function createDeck() {
    const deck = [];
    for (const suit of suits) {
      for (const rank of rankOrder) {
        deck.push({ suit, rank, id: `${rank}${suit}` });
      }
    }
    return deck;
  }

  function hashSeed(seed) {
    const text = String(seed);
    let hash = 2166136261;
    for (let i = 0; i < text.length; i++) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function randomFromSeed(seed) {
    let value = hashSeed(seed) || 1;
    return function seededRandom() {
      value += 0x6D2B79F5;
      let next = value;
      next = Math.imul(next ^ (next >>> 15), next | 1);
      next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
      return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
    };
  }

  function dealHands(random = Math.random) {
    const deck = createDeck();
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    const hands = { North: [], East: [], South: [], West: [] };
    deck.forEach((card, index) => hands[seats[index % seats.length]].push(card));
    for (const seat of seats) hands[seat].sort(compareCards);
    return hands;
  }

  function isPass(callOrBid) {
    return callOrBid === "Pass" || callOrBid?.bid === "Pass";
  }

  function isDouble(callOrBid) {
    return callOrBid === "Double" || callOrBid?.bid === "Double";
  }

  function isRedouble(callOrBid) {
    return callOrBid === "Redouble" || callOrBid?.bid === "Redouble";
  }

  function isContractBid(bid) {
    return Boolean(bid && typeof bid === "object" && Number.isInteger(bid.level) && bid.strain);
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
    const contract = { ...contractCall.bid };
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

  function contractTrickPoints(contract) {
    if (contract.strain === "C" || contract.strain === "D") return contract.level * 20;
    if (contract.strain === "H" || contract.strain === "S") return contract.level * 30;
    return 40 + (contract.level - 1) * 30;
  }

  function overtrickPoints(contract, overtricks, vulnerable, multiplier) {
    if (!overtricks) return 0;
    if (multiplier === 1) {
      if (contract.strain === "C" || contract.strain === "D") return overtricks * 20;
      return overtricks * 30;
    }
    return overtricks * (vulnerable ? 100 : 50) * multiplier;
  }

  function downScore(undertricks, vulnerable, multiplier) {
    if (!undertricks) return 0;
    if (multiplier === 1) return undertricks * (vulnerable ? 100 : 50);
    let penalty = 0;
    for (let i = 1; i <= undertricks; i++) {
      if (vulnerable) {
        penalty += i === 1 ? 200 : 300;
      } else {
        penalty += i === 1 ? 100 : i <= 3 ? 200 : 300;
      }
    }
    return penalty * (multiplier === 4 ? 2 : 1);
  }

  function calculatePassOutScore() {
    return {
      declarerTeam: null,
      score: 0,
      scoreText: "NS 0 / EW 0",
      vulnerable: false,
      passOut: true,
      passedOut: true,
      needed: 0,
      tricksMade: 0,
      contractMade: true,
      multiplier: 1,
      contractPoints: 0,
      contractScore: 0,
      overtricks: 0,
      undertricks: 0,
      overtrickScore: 0,
      undertrickPenalty: 0,
      gameBonus: 0,
      partscoreBonus: 0,
      slamBonus: 0,
      insultBonus: 0,
      bonusScore: 0
    };
  }

  function calculateBridgeScore({ contract, declarer, tricksMade, vulnerability }) {
    if (!contract) return calculatePassOutScore();

    const declarerTeam = teamOf(declarer);
    const vulnerable = isTeamVulnerable(declarerTeam, vulnerability);
    const needed = contract.level + 6;
    const made = tricksMade >= needed;
    const multiplier = contract.redoubled ? 4 : contract.doubled ? 2 : 1;
    const undertricks = Math.max(0, needed - tricksMade);
    const overtricks = Math.max(0, tricksMade - needed);

    if (!made) {
      const penalty = downScore(undertricks, vulnerable, multiplier);
      return {
        declarerTeam,
        score: -penalty,
        scoreText: `${declarerTeam} -${penalty}`,
        vulnerable,
        needed,
        tricksMade,
        contractMade: false,
        multiplier,
        contractPoints: contractTrickPoints(contract),
        contractScore: 0,
        overtricks,
        undertricks,
        overtrickScore: 0,
        undertrickPenalty: penalty,
        gameBonus: 0,
        partscoreBonus: 0,
        slamBonus: 0,
        insultBonus: 0,
        bonusScore: 0
      };
    }

    const contractPoints = contractTrickPoints(contract);
    const base = contractPoints * multiplier;
    const gameBonus = base >= 100 ? (vulnerable ? 500 : 300) : 0;
    const partscoreBonus = base >= 100 ? 0 : 50;
    const overtrickScore = overtrickPoints(contract, overtricks, vulnerable, multiplier);
    const slamBonus = contract.level === 6 ? (vulnerable ? 750 : 500) : contract.level === 7 ? (vulnerable ? 1500 : 1000) : 0;
    const insultBonus = contract.redoubled ? 100 : contract.doubled ? 50 : 0;
    const bonusScore = gameBonus + partscoreBonus + slamBonus + insultBonus;
    const score = base + bonusScore + overtrickScore;

    return {
      declarerTeam,
      score,
      scoreText: `${declarerTeam} +${score}`,
      vulnerable,
      needed,
      tricksMade,
      contractMade: true,
      multiplier,
      contractPoints,
      contractScore: base,
      overtricks,
      undertricks,
      overtrickScore,
      undertrickPenalty: 0,
      gameBonus,
      partscoreBonus,
      slamBonus,
      insultBonus,
      bonusScore
    };
  }

  function legalCards(hand, currentTrick) {
    if (!currentTrick.length) return hand;
    const leadSuit = currentTrick[0].card.suit;
    const followSuit = hand.filter((card) => card.suit === leadSuit);
    return followSuit.length ? followSuit : hand;
  }

  function compareLowCards(a, b) {
    const rankDiff = rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank);
    if (rankDiff) return rankDiff;
    return suits.indexOf(a.suit) - suits.indexOf(b.suit);
  }

  function lowestCard(cards) {
    return [...cards].sort(compareLowCards)[0] || null;
  }

  function highestCard(cards) {
    return [...cards].sort((a, b) => -compareLowCards(a, b))[0] || null;
  }

  function countSuits(hand) {
    return suits.reduce((counts, suit) => {
      counts[suit] = hand.filter((card) => card.suit === suit).length;
      return counts;
    }, {});
  }

  function longestSuitForLead(hand) {
    const suitCounts = countSuits(hand);
    return suits.reduce((best, suit) => suitCounts[suit] > suitCounts[best] ? suit : best, "C");
  }

  function isLeadHonorRank(rank) {
    return leadHonorRanks.includes(rank);
  }

  function isLowLeadCard(card) {
    return Boolean(card && !isLeadHonorRank(card.rank));
  }

  function partnerOf(seat) {
    return seat === "North" ? "South" : seat === "South" ? "North" : seat === "East" ? "West" : "East";
  }

  function hcp(hand) {
    return hand.reduce((sum, card) => sum + (hcpValue[card.rank] || 0), 0);
  }

  function distributionPointsFromCounts(counts) {
    return Object.values(counts).reduce((sum, count) => sum + (count === 0 ? 3 : count === 1 ? 2 : count === 2 ? 1 : 0), 0);
  }

  function isBalancedCounts(counts) {
    const pattern = Object.values(counts).sort((a, b) => b - a).join("-");
    return pattern === "4-3-3-3" || pattern === "4-4-3-2" || pattern === "5-3-3-2";
  }

  function handShape(hand) {
    const counts = countSuits(hand);
    const highCardPoints = hcp(hand);
    return {
      counts,
      hcp: highCardPoints,
      points: highCardPoints + distributionPointsFromCounts(counts),
      balanced: isBalancedCounts(counts)
    };
  }

  function bid(level, strain) {
    return { level, strain };
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
    if (!target || isPass(target)) return "Pass";
    if (isDouble(target)) return canDoubleFromAuction(auction, seat) ? "Double" : "Pass";
    if (isRedouble(target)) return canRedoubleFromAuction(auction, seat) ? "Redouble" : "Pass";
    if (!isContractBid(target)) return "Pass";
    if (target.level < 1 || target.level > 7) return "Pass";
    return isBidHigher(target, lastBid) ? target : "Pass";
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

  function chooseFiveCardHighBid(options = {}) {
    const auction = options.auction || [];
    const seat = options.seat;
    const target = chooseFiveCardHighBidTarget(options);
    return legalizeFiveCardHighBidTarget(target, highestBid(auction), seat, auction);
  }

  function chooseFiveCardHighBidTarget({ hand = [], auction = [], seat } = {}) {
    if (!seat) return "Pass";
    if (isUncontestedAuctionForSeat(auction, seat)) return chooseUncontestedFiveCardHighBid(hand, auction, seat);
    return chooseCompetitiveFiveCardHighBid(hand, auction, seat);
  }

  function chooseUncontestedFiveCardHighBid(hand, auction, seat) {
    const partnershipCalls = partnershipContractCalls(auction, seat);
    if (!partnershipCalls.length) return chooseFiveCardHighOpening(hand);

    const lastPartnerCall = lastPartnerContractCall(auction, seat);
    if (!lastPartnerCall) return "Pass";

    const openingCall = partnershipCalls[0];
    if (partnershipCalls.length === 1) return chooseFiveCardHighResponse(hand, openingCall.bid);
    if (partnershipCalls.length === 2 && openingCall.seat === seat) {
      return chooseFiveCardHighOpenerRebid(hand, openingCall.bid, lastPartnerCall.bid);
    }
    if (partnershipCalls.length === 3 && openingCall.seat === partnerOf(seat)) {
      return chooseFiveCardHighResponderRebid(hand, openingCall.bid, partnershipCalls[1].bid, lastPartnerCall.bid);
    }
    if (partnershipCalls.length >= 4 && openingCall.seat === seat) {
      return chooseFiveCardHighOpenerThirdBid(hand, partnershipCalls);
    }

    return chooseFiveCardHighNaturalContinuation(hand, lastPartnerCall.bid, highestBid(auction));
  }

  function chooseFiveCardHighOpening(hand) {
    const shape = handShape(hand);

    if (shape.balanced) {
      if (shape.hcp >= 23) return bid(2, "C");
      if (shape.hcp >= 20 && shape.hcp <= 22) return bid(2, "NT");
      if (shape.hcp >= 15 && shape.hcp <= 17) return bid(1, "NT");
    }

    if (shape.hcp >= 20 || shape.points >= 20) return bid(2, "C");

    const weakTwo = chooseFiveCardHighWeakTwo(shape, hand);
    if (weakTwo) return weakTwo;

    const preempt = chooseFiveCardHighPreempt(shape, hand);
    if (preempt) return preempt;

    if (shape.hcp < 12 || shape.hcp > 19) return "Pass";

    const major = chooseFiveCardHighOpeningMajor(shape);
    if (major) return bid(1, major);
    return bid(1, chooseFiveCardHighOpeningMinor(shape));
  }

  function chooseFiveCardHighOpeningMajor(shape) {
    const counts = shape.counts;
    const longestMajor = Math.max(counts.H, counts.S);
    const longestMinor = Math.max(counts.C, counts.D);
    if (longestMajor < 5 || longestMinor > longestMajor) return null;
    if (counts.S >= 5 && counts.S >= counts.H) return "S";
    if (counts.H >= 5) return "H";
    return null;
  }

  function chooseFiveCardHighOpeningMinor(shape) {
    const counts = shape.counts;
    if (counts.C >= 5 && counts.D >= 5) return "D";
    if (counts.D > counts.C && counts.D >= 4) return "D";
    if (counts.C > counts.D && counts.C >= 4) return "C";
    if (counts.C === 4 && counts.D === 4) return "C";
    if (counts.D >= 4) return "D";
    return "C";
  }

  function chooseFiveCardHighWeakTwo(shape, hand) {
    if (shape.hcp < 6 || shape.hcp > 10) return null;
    const suit = chooseSuitByLengthThenRank(["S", "H", "D"], shape, 6, true, (candidate) => shape.counts[candidate] === 6 && suitQuality(hand, candidate) >= 2);
    return suit ? bid(2, suit) : null;
  }

  function chooseFiveCardHighPreempt(shape, hand) {
    if (shape.hcp < 6 || shape.hcp > 10) return null;
    const suit = chooseSuitByLengthThenRank(["S", "H", "D", "C"], shape, 7, true, (candidate) => shape.counts[candidate] >= 7 && suitQuality(hand, candidate) >= 2);
    if (!suit) return null;
    return bid(shape.counts[suit] >= 8 ? 4 : 3, suit);
  }

  function chooseFiveCardHighResponse(hand, partnerBid) {
    const shape = handShape(hand);
    if (bidEquals(partnerBid, 1, "NT")) return respondToOneNotrumpFiveCardHigh(shape);
    if (bidEquals(partnerBid, 2, "NT")) return respondToTwoNotrumpFiveCardHigh(shape);
    if (bidEquals(partnerBid, 2, "C")) return respondToStrongTwoClubsFiveCardHigh(shape, hand);
    if (isWeakTwoOpeningFiveCardHigh(partnerBid)) return respondToWeakTwoFiveCardHigh(shape, hand, partnerBid);
    if (partnerBid.level >= 3 && partnerBid.strain !== "NT") return respondToPreemptFiveCardHigh(shape, partnerBid);
    if (bidEquals(partnerBid, 1, "C")) return respondToOneClubFiveCardHigh(shape);
    if (bidEquals(partnerBid, 1, "D")) return respondToOneDiamondFiveCardHigh(shape);
    if (bidEquals(partnerBid, 1, "H")) return respondToOneMajorFiveCardHigh(shape, "H");
    if (bidEquals(partnerBid, 1, "S")) return respondToOneMajorFiveCardHigh(shape, "S");
    return "Pass";
  }

  function respondToOneNotrumpFiveCardHigh(shape) {
    const transferMajor = chooseMajorByLength(shape, 5);
    if (transferMajor === "H") return bid(2, "D");
    if (transferMajor === "S") return bid(2, "H");
    if (hasFourCardMajor(shape) && shape.hcp >= 8) return bid(2, "C");
    if (shape.hcp >= 10) return bid(3, "NT");
    if (shape.hcp >= 8) return bid(2, "NT");
    return "Pass";
  }

  function respondToTwoNotrumpFiveCardHigh(shape) {
    const transferMajor = chooseMajorByLength(shape, 5);
    if (transferMajor === "H") return bid(3, "D");
    if (transferMajor === "S") return bid(3, "H");
    if (hasFourCardMajor(shape) && shape.hcp >= 1) return bid(3, "C");
    if (shape.hcp >= 4) return bid(3, "NT");
    return "Pass";
  }

  function respondToStrongTwoClubsFiveCardHigh(shape, hand) {
    if (shape.hcp <= 7) return bid(2, "D");
    const suit = chooseSuitByLengthThenRank(["S", "H", "D", "C"], shape, 5, true, (candidate) => suitQuality(hand, candidate) >= 2);
    if (suit === "H" || suit === "S") return bid(2, suit);
    if (suit === "C" || suit === "D") return bid(3, suit);
    return bid(2, "NT");
  }

  function respondToWeakTwoFiveCardHigh(shape, hand, partnerBid) {
    const support = shape.counts[partnerBid.strain];
    if (shape.hcp >= 15) {
      if (support >= 3) return bid(gameLevel(partnerBid.strain), partnerBid.strain);
      if (shape.balanced) return bid(2, "NT");
    }
    const newSuit = chooseSuitByLengthThenRank(suits.filter((suit) => suit !== partnerBid.strain), shape, 5, true, (candidate) => suitQuality(hand, candidate) >= 2);
    if (newSuit && shape.hcp >= 10) return bid(cheapestLevelForStrain(newSuit, partnerBid), newSuit);
    if (support >= 3 && shape.hcp >= 10) return bid(partnerBid.level + 1, partnerBid.strain);
    return "Pass";
  }

  function respondToPreemptFiveCardHigh(shape, partnerBid) {
    if (shape.counts[partnerBid.strain] >= 3 && shape.hcp >= 12) return bid(gameLevel(partnerBid.strain), partnerBid.strain);
    if (shape.balanced && shape.hcp >= 16) return bid(3, "NT");
    return "Pass";
  }

  function respondToOneClubFiveCardHigh(shape) {
    if (shape.hcp < 6) return "Pass";
    const newSuit = chooseResponseSuit(["D", "H", "S"], shape, 4);
    if (newSuit) return bid(1, newSuit);
    if (shape.counts.C >= 5) {
      if (shape.hcp <= 9) return bid(2, "C");
      if (shape.hcp <= 11) return bid(3, "C");
      return shape.balanced ? bid(3, "NT") : bid(5, "C");
    }
    if (shape.hcp <= 9) return bid(1, "NT");
    if (shape.hcp <= 11) return bid(2, "NT");
    return bid(3, "NT");
  }

  function respondToOneDiamondFiveCardHigh(shape) {
    if (shape.hcp < 6) return "Pass";
    const major = chooseResponseSuit(["H", "S"], shape, 4);
    if (major) return bid(1, major);
    const clubs = shape.counts.C >= 5 && shape.hcp >= 10 ? "C" : null;
    if (clubs) return bid(2, "C");
    if (shape.counts.D >= 4) {
      if (shape.hcp <= 9) return bid(2, "D");
      if (shape.hcp <= 11) return bid(3, "D");
      return shape.balanced ? bid(3, "NT") : bid(5, "D");
    }
    if (shape.hcp <= 9) return bid(1, "NT");
    if (shape.hcp <= 11) return bid(2, "NT");
    return bid(3, "NT");
  }

  function respondToOneMajorFiveCardHigh(shape, openingMajor) {
    if (shape.hcp < 6) return "Pass";
    if (openingMajor === "H" && shape.counts.S >= 4) return bid(1, "S");

    const support = shape.counts[openingMajor] >= 3;
    if (support) {
      if (shape.hcp >= 12) return bid(4, openingMajor);
      if (shape.hcp >= 10) return bid(3, openingMajor);
      return bid(2, openingMajor);
    }

    const sideSuits = suits.filter((suit) => suit !== openingMajor);
    const twoLevelSuit = chooseSuitByLengthThenRank(sideSuits, shape, 5, true);
    if (twoLevelSuit && shape.hcp >= 10) return bid(cheapestLevelForStrain(twoLevelSuit, bid(1, openingMajor)), twoLevelSuit);

    if (shape.hcp <= 9) return bid(1, "NT");
    if (shape.hcp <= 11) return bid(2, "NT");
    return bid(3, "NT");
  }

  function chooseFiveCardHighOpenerRebid(hand, openingBid, responseBid) {
    const shape = handShape(hand);
    if (bidEquals(openingBid, 1, "NT")) return rebidAfterOneNotrumpResponseFiveCardHigh(shape, responseBid);
    if (bidEquals(openingBid, 2, "NT")) return rebidAfterTwoNotrumpResponseFiveCardHigh(shape, responseBid);
    if (bidEquals(openingBid, 2, "C")) return rebidAfterStrongTwoClubsFiveCardHigh(shape, hand);
    if (isOneSuitOpeningFiveCardHigh(openingBid)) return rebidAfterOneSuitOpeningFiveCardHigh(shape, openingBid, responseBid);
    return "Pass";
  }

  function rebidAfterOneNotrumpResponseFiveCardHigh(shape, responseBid) {
    if (bidEquals(responseBid, 2, "C")) {
      if (shape.counts.H >= 4) return bid(2, "H");
      if (shape.counts.S >= 4) return bid(2, "S");
      return bid(2, "D");
    }
    if (bidEquals(responseBid, 2, "D")) return bid(2, "H");
    if (bidEquals(responseBid, 2, "H")) return bid(2, "S");
    if (bidEquals(responseBid, 2, "NT")) return shape.hcp >= 16 ? bid(3, "NT") : "Pass";
    return "Pass";
  }

  function rebidAfterTwoNotrumpResponseFiveCardHigh(shape, responseBid) {
    if (bidEquals(responseBid, 3, "C")) {
      if (shape.counts.H >= 4) return bid(3, "H");
      if (shape.counts.S >= 4) return bid(3, "S");
      return bid(3, "D");
    }
    if (bidEquals(responseBid, 3, "D")) return bid(3, "H");
    if (bidEquals(responseBid, 3, "H")) return bid(3, "S");
    return "Pass";
  }

  function rebidAfterStrongTwoClubsFiveCardHigh(shape, hand) {
    if (shape.balanced) {
      if (shape.hcp >= 25) return bid(3, "NT");
      if (shape.hcp >= 23) return bid(2, "NT");
    }
    const suit = chooseSuitByLengthThenRank(["S", "H", "D", "C"], shape, 5, true) || bestSuitByLength(shape);
    return bid(suit === "C" || suit === "D" ? 3 : 2, suit);
  }

  function rebidAfterOneSuitOpeningFiveCardHigh(shape, openingBid, responseBid) {
    if (responseBid.strain === openingBid.strain) return openerRebidAfterRaiseFiveCardHigh(shape, openingBid, responseBid);
    if (responseBid.strain === "NT") return openerRebidAfterNotrumpFiveCardHigh(shape, openingBid, responseBid);
    return openerRebidAfterNewSuitFiveCardHigh(shape, openingBid, responseBid);
  }

  function openerRebidAfterRaiseFiveCardHigh(shape, openingBid, responseBid) {
    if (responseBid.level >= gameLevel(openingBid.strain)) return "Pass";
    if (responseBid.level === 3) return shape.hcp >= 14 ? bid(gameLevel(openingBid.strain), openingBid.strain) : "Pass";
    if (responseBid.level === 2) {
      if (shape.hcp >= 16) return bid(gameLevel(openingBid.strain), openingBid.strain);
      if (shape.hcp >= 15) return bid(3, openingBid.strain);
    }
    return "Pass";
  }

  function openerRebidAfterNotrumpFiveCardHigh(shape, openingBid) {
    if (shape.counts[openingBid.strain] >= 6) return bid(openingBid.level + 1, openingBid.strain);
    if (shape.balanced && shape.hcp >= 18) return bid(2, "NT");
    if (shape.balanced && shape.hcp >= 15) return bid(1, "NT");
    const secondSuit = chooseOpenerSecondSuit(shape, openingBid.strain);
    if (secondSuit) return bid(cheapestLevelForStrain(secondSuit, openingBid), secondSuit);
    return "Pass";
  }

  function openerRebidAfterNewSuitFiveCardHigh(shape, openingBid, responseBid) {
    const supportNeeded = responseBid.level === 1 ? 4 : 3;
    if (responseBid.strain !== "NT" && shape.counts[responseBid.strain] >= supportNeeded) {
      if (shape.hcp >= 18) return bid(gameLevel(responseBid.strain), responseBid.strain);
      if (shape.hcp >= 16) return bid(3, responseBid.strain);
      return bid(2, responseBid.strain);
    }
    if (shape.balanced && shape.hcp >= 18) return bid(2, "NT");
    if (shape.balanced && shape.hcp >= 12) return bid(1, "NT");
    if (shape.counts[openingBid.strain] >= 6) return bid(openingBid.level + 1, openingBid.strain);
    const secondSuit = chooseOpenerSecondSuit(shape, openingBid.strain, responseBid.strain);
    if (secondSuit) return bid(cheapestLevelForStrain(secondSuit, responseBid), secondSuit);
    return "Pass";
  }

  function chooseFiveCardHighResponderRebid(hand, openingBid, responseBid, openerRebid) {
    const shape = handShape(hand);
    if (bidEquals(openingBid, 1, "NT")) return rebidResponderAfterOneNotrumpFiveCardHigh(shape, responseBid, openerRebid);
    if (bidEquals(openingBid, 2, "NT")) return rebidResponderAfterTwoNotrumpFiveCardHigh(shape, responseBid, openerRebid);
    if (isOneSuitOpeningFiveCardHigh(openingBid)) return chooseFiveCardHighNaturalContinuation(hand, openerRebid, openerRebid);
    return "Pass";
  }

  function rebidResponderAfterOneNotrumpFiveCardHigh(shape, responseBid, openerRebid) {
    if (bidEquals(responseBid, 2, "C")) {
      const foundFit = (openerRebid.strain === "H" || openerRebid.strain === "S") && shape.counts[openerRebid.strain] >= 4;
      if (foundFit) {
        if (shape.hcp >= 10) return bid(4, openerRebid.strain);
        if (shape.hcp >= 8) return bid(3, openerRebid.strain);
      }
      if (shape.hcp >= 10) return bid(3, "NT");
      if (shape.hcp >= 8) return bid(2, "NT");
      return "Pass";
    }

    const transferSuit = bidEquals(responseBid, 2, "D") ? "H" : bidEquals(responseBid, 2, "H") ? "S" : null;
    if (transferSuit) {
      if (shape.counts[transferSuit] >= 6) {
        if (shape.hcp >= 10) return bid(4, transferSuit);
        if (shape.hcp >= 8) return bid(3, transferSuit);
        return "Pass";
      }
      if (shape.hcp >= 10) return bid(3, "NT");
      if (shape.hcp >= 8) {
        if (transferSuit === "H" && shape.counts.S >= 4) return bid(2, "S");
        if (transferSuit === "S" && shape.counts.H >= 4) return bid(3, "H");
        return bid(2, "NT");
      }
      return "Pass";
    }
    return "Pass";
  }

  function rebidResponderAfterTwoNotrumpFiveCardHigh(shape, responseBid, openerRebid) {
    if (bidEquals(responseBid, 3, "C")) {
      if ((openerRebid.strain === "H" || openerRebid.strain === "S") && shape.counts[openerRebid.strain] >= 4) return bid(4, openerRebid.strain);
      return bid(3, "NT");
    }
    const transferSuit = bidEquals(responseBid, 3, "D") ? "H" : bidEquals(responseBid, 3, "H") ? "S" : null;
    if (transferSuit && shape.counts[transferSuit] >= 6) return bid(4, transferSuit);
    if (transferSuit && shape.hcp >= 4) return bid(3, "NT");
    return "Pass";
  }

  function chooseFiveCardHighOpenerThirdBid(hand, partnershipCalls) {
    const shape = handShape(hand);
    const openingBid = partnershipCalls[0].bid;
    const responseBid = partnershipCalls[1].bid;
    const responderRebid = partnershipCalls[3]?.bid;
    if (!responderRebid || !bidEquals(openingBid, 1, "NT")) return "Pass";

    if (bidEquals(responseBid, 2, "C")) {
      if (bidEquals(responderRebid, 2, "NT")) return shape.hcp >= 16 ? bid(3, "NT") : "Pass";
      if ((responderRebid.strain === "H" || responderRebid.strain === "S") && responderRebid.level === 3) {
        return shape.hcp >= 16 ? bid(4, responderRebid.strain) : "Pass";
      }
    }

    const transferSuit = bidEquals(responseBid, 2, "D") ? "H" : bidEquals(responseBid, 2, "H") ? "S" : null;
    if (!transferSuit) return "Pass";
    const hasThreeCardSupport = shape.counts[transferSuit] >= 3;
    if (bidEquals(responderRebid, 2, "NT")) {
      if (shape.hcp <= 15) return hasThreeCardSupport ? bid(3, transferSuit) : "Pass";
      return hasThreeCardSupport ? bid(4, transferSuit) : bid(3, "NT");
    }
    if (bidEquals(responderRebid, 3, "NT") && hasThreeCardSupport) return bid(4, transferSuit);
    if (bidEquals(responderRebid, 3, transferSuit)) return shape.hcp >= 16 ? bid(4, transferSuit) : "Pass";
    return "Pass";
  }

  function chooseCompetitiveFiveCardHighBid(hand, auction, seat) {
    const shape = handShape(hand);
    const partnershipCalls = partnershipContractCalls(auction, seat);
    const lastBid = highestBid(auction);

    if (canRedoubleFromAuction(auction, seat)) {
      const partnerBid = partnershipCalls[0]?.bid || null;
      const fit = partnerBid && partnerBid.strain !== "NT" && shape.counts[partnerBid.strain] >= supportLengthForOpening(partnerBid.strain);
      if (!fit && shape.hcp >= 10) return "Redouble";
    }

    if (!partnershipCalls.length) return chooseOvercallFiveCardHigh(hand, auction, seat);

    const lastPartnerCall = lastPartnerContractCall(auction, seat);
    const lastCall = auction[auction.length - 1] || null;
    if (lastPartnerCall && partnershipCalls.length === 1) {
      if (isDouble(lastCall)) return respondAfterPartnerOpenedAndOpponentDoubledFiveCardHigh(shape, lastPartnerCall.bid);
      if (lastBid && highestBidCall(auction)?.seat !== seat && teamOf(highestBidCall(auction).seat) !== teamOf(seat)) {
        return respondAfterOvercallFiveCardHigh(shape, hand, lastPartnerCall.bid, lastBid, auction, seat);
      }
    }

    if (canDoubleFromAuction(auction, seat) && shouldMakeInformationDoubleFiveCardHigh(shape, lastBid)) return "Double";
    return "Pass";
  }

  function chooseOvercallFiveCardHigh(hand, auction, seat) {
    const shape = handShape(hand);
    const lastBid = highestBid(auction);
    if (!lastBid || !isContractBid(lastBid)) return "Pass";

    if (shape.balanced && shape.hcp >= 15 && shape.hcp <= 17 && lastBid.strain !== "NT" && hasStopper(hand, lastBid.strain)) {
      return bid(cheapestLevelForStrain("NT", lastBid), "NT");
    }

    const jumpSuit = chooseSuitByLengthThenRank(suits.filter((suit) => suit !== lastBid.strain), shape, 6, true, (candidate) => suitQuality(hand, candidate) >= 2);
    if (jumpSuit && shape.hcp >= 6 && shape.hcp <= 10) {
      const baseLevel = cheapestLevelForStrain(jumpSuit, lastBid);
      return bid(Math.min(baseLevel + 1, 4), jumpSuit);
    }

    const overcallSuit = chooseSuitByLengthThenRank(suits.filter((suit) => suit !== lastBid.strain), shape, 5, true, (candidate) => suitQuality(hand, candidate) >= 2);
    if (overcallSuit && shape.hcp >= 8 && shape.hcp <= 16) {
      return bid(cheapestLevelForStrain(overcallSuit, lastBid), overcallSuit);
    }

    if (canDoubleFromAuction(auction, seat) && shouldMakeInformationDoubleFiveCardHigh(shape, lastBid)) return "Double";
    return "Pass";
  }

  function respondAfterPartnerOpenedAndOpponentDoubledFiveCardHigh(shape, partnerBid) {
    const support = partnerBid.strain !== "NT" && shape.counts[partnerBid.strain] >= supportLengthForOpening(partnerBid.strain);
    if (support && shape.hcp >= 10) return bid(2, "NT");
    if (support && shape.hcp >= 6) return bid(Math.min(partnerBid.level + 1, gameLevel(partnerBid.strain)), partnerBid.strain);
    if (shape.hcp >= 10) return "Redouble";
    const newSuit = chooseSuitByLengthThenRank(suits.filter((suit) => suit !== partnerBid.strain), shape, 5, true);
    if (newSuit && shape.hcp >= 6) return bid(cheapestLevelForStrain(newSuit, partnerBid), newSuit);
    return "Pass";
  }

  function respondAfterOvercallFiveCardHigh(shape, hand, partnerBid, opponentBid, auction, seat) {
    const support = partnerBid.strain !== "NT" && shape.counts[partnerBid.strain] >= supportLengthForOpening(partnerBid.strain);
    if (support) {
      if (shape.hcp >= 12) return bid(gameLevel(partnerBid.strain), partnerBid.strain);
      if (shape.hcp >= 10) return bid(3, partnerBid.strain);
      if (shape.hcp >= 6) return bid(2, partnerBid.strain);
    }
    if (canDoubleFromAuction(auction, seat) && shouldMakeNegativeDoubleFiveCardHigh(shape, partnerBid, opponentBid)) {
      return "Double";
    }
    if (shouldMakeNegativeDoubleFiveCardHigh(shape, partnerBid, opponentBid)) return "Double";

    const newSuit = chooseSuitByLengthThenRank(suits.filter((suit) => suit !== partnerBid.strain && suit !== opponentBid.strain), shape, 5, true);
    if (newSuit) {
      const level = cheapestLevelForStrain(newSuit, opponentBid);
      if (level === 1 && shape.hcp >= 6) return bid(level, newSuit);
      if (level === 2 && shape.hcp >= 10) return bid(level, newSuit);
    }

    if (opponentBid.strain !== "NT" && hasStopper(hand, opponentBid.strain)) {
      const ntLevel = cheapestLevelForStrain("NT", opponentBid);
      if (shape.hcp >= 12 && shape.balanced) return bid(3, "NT");
      if (shape.hcp >= 10 && shape.balanced && ntLevel <= 2) return bid(ntLevel, "NT");
      if (shape.hcp >= 6 && shape.balanced && ntLevel === 1) return bid(1, "NT");
    }
    return "Pass";
  }

  function shouldMakeInformationDoubleFiveCardHigh(shape, opponentBid) {
    if (!opponentBid || opponentBid.strain === "NT" || opponentBid.level > 2) return false;
    if (shape.hcp < 13 || shape.counts[opponentBid.strain] > 2) return false;
    const tolerance = suits
      .filter((suit) => suit !== opponentBid.strain)
      .filter((suit) => shape.counts[suit] >= (suit === "H" || suit === "S" ? 4 : 3))
      .length;
    return tolerance >= 2;
  }

  function shouldMakeNegativeDoubleFiveCardHigh(shape, partnerBid, opponentBid) {
    if (!partnerBid || !opponentBid || opponentBid.strain === "NT" || opponentBid.level > 2 || shape.hcp < 6) return false;
    return ["H", "S"].some((suit) => suit !== partnerBid.strain && suit !== opponentBid.strain && shape.counts[suit] >= 4);
  }

  function chooseFiveCardHighNaturalContinuation(hand, partnerBid, lastBid) {
    const shape = handShape(hand);
    if (partnerBid?.strain && partnerBid.strain !== "NT" && shape.counts[partnerBid.strain] >= supportLengthForOpening(partnerBid.strain)) {
      if (shape.hcp >= 12) return bid(gameLevel(partnerBid.strain), partnerBid.strain);
      if (shape.hcp >= 10) return bid(3, partnerBid.strain);
      if (shape.hcp >= 6) return bid(2, partnerBid.strain);
    }
    if (shape.balanced && shape.hcp >= 12) return nextAvailableBid(bid(3, "NT"), lastBid);
    const suit = chooseSuitByLengthThenRank(suits.filter((candidate) => candidate !== partnerBid?.strain), shape, 5, true);
    if (suit && shape.hcp >= 10) return nextAvailableBid(bid(cheapestLevelForStrain(suit, lastBid), suit), lastBid);
    return "Pass";
  }

  function chooseResponseSuit(candidates, shape, minimumLength) {
    return chooseSuitByLengthThenRank(candidates, shape, minimumLength, false);
  }

  function chooseSuitByLengthThenRank(candidates, shape, minimumLength, preferHighEqualLength, predicate = () => true) {
    return candidates
      .filter((suit) => shape.counts[suit] >= minimumLength && predicate(suit))
      .sort((a, b) => {
        const lengthDiff = shape.counts[b] - shape.counts[a];
        if (lengthDiff) return lengthDiff;
        const useHighTie = preferHighEqualLength || shape.counts[a] >= 5;
        return useHighTie ? bidStrains.indexOf(b) - bidStrains.indexOf(a) : bidStrains.indexOf(a) - bidStrains.indexOf(b);
      })[0] || null;
  }

  function chooseMajorByLength(shape, minimumLength) {
    if (shape.counts.S >= minimumLength && shape.counts.S >= shape.counts.H) return "S";
    if (shape.counts.H >= minimumLength) return "H";
    return null;
  }

  function hasFourCardMajor(shape) {
    return shape.counts.H >= 4 || shape.counts.S >= 4;
  }

  function isOneSuitOpeningFiveCardHigh(candidate) {
    return candidate?.level === 1 && candidate.strain !== "NT";
  }

  function isWeakTwoOpeningFiveCardHigh(candidate) {
    return candidate?.level === 2 && ["D", "H", "S"].includes(candidate.strain);
  }

  function supportLengthForOpening(strain) {
    if (strain === "H" || strain === "S") return 3;
    if (strain === "D") return 4;
    return 5;
  }

  function chooseOpenerSecondSuit(shape, openedStrain, responderStrain = null) {
    const candidates = suits.filter((suit) => suit !== openedStrain && suit !== responderStrain && shape.counts[suit] >= 4);
    return chooseSuitByLengthThenRank(candidates, shape, 4, false);
  }

  function bestSuitByLength(shape) {
    return chooseSuitByLengthThenRank(["S", "H", "D", "C"], shape, 1, true);
  }

  function suitQuality(hand, suit) {
    return hand.filter((card) => card.suit === suit && hcpValue[card.rank]).length;
  }

  function hasStopper(hand, suit) {
    const cards = hand.filter((card) => card.suit === suit);
    const ranks = new Set(cards.map((card) => card.rank));
    return ranks.has("A") || (ranks.has("K") && cards.length >= 2) || (ranks.has("Q") && cards.length >= 3) || (ranks.has("J") && cards.length >= 4);
  }

  function createPlayPlan({
    declarerHand = [],
    dummyHand = [],
    contract = null,
    declarer = null,
    dummy = null,
    trickHistory = []
  } = {}) {
    if (!contract || !declarer || !dummy || !declarerHand.length || !dummyHand.length) return null;
    if (contract.strain === "NT") {
      return createNotrumpPlayPlan({ declarerHand, dummyHand, contract, declarer, dummy, trickHistory });
    }
    return createSuitPlayPlan({ declarerHand, dummyHand, contract, declarer, dummy });
  }

  function createNotrumpPlayPlan({ declarerHand, dummyHand, contract, declarer, dummy, trickHistory }) {
    const playedCards = playedCardsFrom(trickHistory, []);
    const neededTricks = contract.level + 6;
    const sureWinners = countSureWinners(declarerHand, dummyHand, playedCards, declarer, dummy);
    const developmentPriorities = notrumpDevelopmentPriorities({ declarerHand, dummyHand, declarer, dummy, playedCards });
    const finessePriorities = notrumpFinessePriorities({ declarerHand, dummyHand, declarer, dummy, playedCards });
    const cashPriorities = notrumpCashPriorities(sureWinners, neededTricks);
    const priorities = [
      ...cashPriorities,
      ...developmentPriorities,
      ...finessePriorities
    ].sort((a, b) => b.score - a.score);
    const selectedPriorities = uniquePlanPriorities(priorities).slice(0, 3);
    const warnings = notrumpPlanWarnings(selectedPriorities, { declarerHand, dummyHand, declarer, dummy, sureWinners });

    if (!selectedPriorities.length && sureWinners.total >= neededTricks) {
      selectedPriorities.push({
        kind: "cashSureWinners",
        confidence: "basic",
        score: 1
      });
    }

    return {
      type: "notrump",
      confidence: selectedPriorities.some((priority) => priority.confidence === "uncertain") || warnings.length ? "uncertain" : "basic",
      neededTricks,
      sureWinners,
      losers: null,
      needToDevelop: Math.max(0, neededTricks - sureWinners.total),
      priorities: selectedPriorities,
      warnings,
      declarer,
      dummy
    };
  }

  function countSureWinners(declarerHand, dummyHand, playedCards, declarer, dummy) {
    const bySuit = {};
    const detailsBySuit = {};
    for (const suit of suits) {
      const detail = notrumpSuitWinnerDetail({
        declarerHand,
        dummyHand,
        playedCards,
        declarer,
        dummy,
        suit
      });
      detailsBySuit[suit] = detail;
      bySuit[suit] = detail.cashableWinners;
    }
    return {
      total: Object.values(bySuit).reduce((total, count) => total + count, 0),
      bySuit,
      detailsBySuit
    };
  }

  function notrumpSuitWinnerDetail({ declarerHand, dummyHand, playedCards, declarer, dummy, suit }) {
    const declarerSuitCards = cardsInSuit(declarerHand, suit);
    const dummySuitCards = cardsInSuit(dummyHand, suit);
    const playedSuitCards = cardsInSuit(playedCards, suit);
    const combinedCards = [...declarerSuitCards, ...dummySuitCards];
    const winnerRanks = visibleTopWinnerRanks(combinedCards, playedSuitCards);
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
    const cashableRanks = blockage && !blockage.entryCard ? blockage.cashFirstRanks : winnerRanks;

    return {
      suit,
      winners: winnerRanks.length,
      cashableWinners: cashableRanks.length,
      winnerRanks,
      cashableRanks,
      blocked: Boolean(blockage),
      blockedSeat: blockage?.blockedSeat || null,
      longSeat: blockage?.longSeat || null,
      cashFirstRanks: blockage?.cashFirstRanks || [],
      strandedRanks: blockage?.strandedRanks || [],
      entryCard: blockage?.entryCard || null,
      entryTiming: blockage ? (blockage.entryCard ? "unblockBeforeEntry" : "blockedNoEntry") : "free"
    };
  }

  function visibleTopWinnerRanks(combinedCards, playedSuitCards = []) {
    const visibleRanks = new Set(combinedCards.map((card) => card.rank));
    const playedRanks = new Set(playedSuitCards.map((card) => card.rank));
    const winners = [];
    for (const rank of [...rankOrder].reverse()) {
      if (visibleRanks.has(rank)) {
        winners.push(rank);
      } else if (!playedRanks.has(rank)) {
        break;
      }
    }
    return winners;
  }

  function seatForSuitRank(rank, declarerSuitCards, dummySuitCards, declarer, dummy) {
    if (declarerSuitCards.some((card) => card.rank === rank)) return declarer;
    if (dummySuitCards.some((card) => card.rank === rank)) return dummy;
    return null;
  }

  function blockedSuitInfo({
    declarerHand,
    dummyHand,
    declarerSuitCards,
    dummySuitCards,
    declarer,
    dummy,
    suit,
    winnerRanks
  }) {
    if (winnerRanks.length < 2 || !declarer || !dummy) return null;
    const sides = [
      { seat: declarer, hand: declarerHand, suitCards: declarerSuitCards },
      { seat: dummy, hand: dummyHand, suitCards: dummySuitCards }
    ].sort((a, b) => b.suitCards.length - a.suitCards.length);
    const longSide = sides[0];
    const shortSide = sides[1];
    if (longSide.suitCards.length < 3 || !shortSide.suitCards.length) return null;

    const cashFirstRanks = [];
    for (const rank of winnerRanks) {
      if (seatForSuitRank(rank, declarerSuitCards, dummySuitCards, declarer, dummy) !== shortSide.seat) break;
      cashFirstRanks.push(rank);
    }
    if (!cashFirstRanks.length || cashFirstRanks.length < shortSide.suitCards.length) return null;

    const strandedRanks = winnerRanks
      .slice(cashFirstRanks.length)
      .filter((rank) => seatForSuitRank(rank, declarerSuitCards, dummySuitCards, declarer, dummy) === longSide.seat);
    if (!strandedRanks.length) return null;

    return {
      blockedSeat: shortSide.seat,
      longSeat: longSide.seat,
      cashFirstRanks,
      strandedRanks,
      entryCard: clearOutsideEntryCard(longSide.hand, suit)
    };
  }

  function clearOutsideEntryCard(hand, excludedSuit) {
    return [...hand]
      .filter((card) => card.suit !== excludedSuit && card.rank === "A")
      .sort(compareCards)[0] || null;
  }

  function entryPlanForHand(hand, excludedSuit) {
    const entryCard = clearOutsideEntryCard(hand, excludedSuit);
    if (!entryCard) {
      return {
        entryType: "none",
        entrySuit: null,
        entryRank: null,
        entryTiming: "noClearEntry",
        entryCount: 0
      };
    }
    return {
      entryType: "outsideAce",
      entrySuit: entryCard.suit,
      entryRank: entryCard.rank,
      entryTiming: "outsideEntry",
      entryCount: clearOutsideEntries(hand, excludedSuit)
    };
  }

  function notrumpCashPriorities(sureWinners, neededTricks) {
    const enoughToCash = sureWinners.total >= neededTricks;
    return suits
      .map((suit) => sureWinners.detailsBySuit[suit])
      .filter((detail) => detail?.cashableWinners > 0)
      .filter((detail) => enoughToCash || (detail.blocked && detail.entryCard))
      .map((detail) => {
        const unblockFirst = detail.blocked && detail.entryCard;
        return {
          kind: "cashWinners",
          confidence: unblockFirst || enoughToCash ? "basic" : "uncertain",
          suit: detail.suit,
          winnerCount: detail.winners,
          cashableWinners: detail.cashableWinners,
          cashRanks: unblockFirst ? detail.cashFirstRanks : detail.cashableRanks,
          blocked: detail.blocked,
          firstSeat: unblockFirst ? detail.blockedSeat : null,
          targetSeat: unblockFirst ? detail.longSeat : null,
          entrySuit: detail.entryCard?.suit || null,
          entryRank: detail.entryCard?.rank || null,
          timing: unblockFirst ? "unblockBeforeEntry" : "cashNow",
          score: (unblockFirst ? 120 : 20) + detail.cashableWinners * 4
        };
      });
  }

  function notrumpDevelopmentPriorities({ declarerHand, dummyHand, declarer, dummy, playedCards }) {
    const candidates = [];
    for (const suit of suits) {
      const declarerSuitCards = cardsInSuit(declarerHand, suit);
      const dummySuitCards = cardsInSuit(dummyHand, suit);
      const playedSuitCards = cardsInSuit(playedCards, suit);
      const combinedCards = [...declarerSuitCards, ...dummySuitCards];
      if (combinedCards.length < 6) continue;

      [
        { seat: declarer, cards: declarerSuitCards, hand: declarerHand },
        { seat: dummy, cards: dummySuitCards, hand: dummyHand }
      ].forEach((source) => {
        if (source.cards.length < 4) return;
        const run = topTouchingHonorRun(source.cards);
        if (!run) return;
        const missingHigher = missingHigherRanks(run, combinedCards, playedSuitCards);
        if (missingHigher.length !== 1) return;
        const entryPlan = entryPlanForHand(source.hand, suit);
        candidates.push({
          kind: "developLongSuit",
          confidence: "uncertain",
          suit,
          suitLength: combinedCards.length,
          sourceSeat: source.seat,
          sourceLength: source.cards.length,
          sequence: run.ranks.join(""),
          missingStopper: missingHigher[0],
          entryType: entryPlan.entryType,
          entrySuit: entryPlan.entrySuit,
          entryRank: entryPlan.entryRank,
          entryTiming: entryPlan.entryTiming,
          entryCount: entryPlan.entryCount,
          score: combinedCards.length * 4 + source.cards.length * 3 + run.ranks.length * 8 + (entryPlan.entryCount ? 8 : -8)
        });
      });
    }
    return candidates;
  }

  function notrumpFinessePriorities({ declarerHand, dummyHand, declarer, dummy, playedCards }) {
    const candidates = [];
    for (const suit of suits) {
      const declarerSuitCards = cardsInSuit(declarerHand, suit);
      const dummySuitCards = cardsInSuit(dummyHand, suit);
      const playedSuitCards = cardsInSuit(playedCards, suit);
      [
        {
          currentSuitCards: declarerSuitCards,
          partnerSuitCards: dummySuitCards,
          partnerHand: dummyHand,
          targetSeat: dummy
        },
        {
          currentSuitCards: dummySuitCards,
          partnerSuitCards: declarerSuitCards,
          partnerHand: declarerHand,
          targetSeat: declarer
        }
      ].forEach((direction) => {
        const candidate = finesseCandidate({
          suit,
          partnerHand: direction.partnerHand,
          currentSuitCards: direction.currentSuitCards,
          partnerSuitCards: direction.partnerSuitCards,
          playedSuitCards,
          partnerSeat: direction.targetSeat
        });
        if (!candidate) return;
        candidates.push({
          kind: candidate.ruleId === "doubleFinesseTowardHonor" ? "doubleFinesse" : "finesse",
          confidence: "uncertain",
          suit,
          targetSeat: candidate.targetSeat,
          finesseRank: candidate.finesseRank,
          missingHonor: candidate.missingHonor,
          missingHonors: candidate.missingHonors,
          score: candidate.score - 20
        });
      });
    }
    return candidates;
  }

  function uniquePlanPriorities(priorities) {
    const seen = new Set();
    return priorities.filter((priority) => {
      const key = `${priority.kind}:${priority.suit || ""}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function notrumpPlanWarnings(priorities, { declarerHand, dummyHand, declarer, dummy, sureWinners }) {
    const warnings = [];
    priorities
      .filter((priority) => priority.kind === "developLongSuit")
      .forEach((priority) => {
        if (priority.entryTiming !== "noClearEntry") return;
        warnings.push({
          kind: "entryRisk",
          suit: priority.suit,
          sourceSeat: priority.sourceSeat === declarer ? declarer : dummy
        });
      });
    for (const suit of suits) {
      const detail = sureWinners?.detailsBySuit?.[suit];
      if (!detail?.blocked || detail.entryCard) continue;
      warnings.push({
        kind: "blockedSuit",
        suit,
        blockedSeat: detail.blockedSeat,
        longSeat: detail.longSeat,
        cashFirstRanks: detail.cashFirstRanks,
        strandedRanks: detail.strandedRanks
      });
    }
    return warnings;
  }

  function clearOutsideEntries(hand, excludedSuit) {
    return hand.filter((card) => card.suit !== excludedSuit && card.rank === "A").length;
  }

  function createSuitPlayPlan({ declarerHand, dummyHand, contract, declarer, dummy }) {
    const neededTricks = contract.level + 6;
    const trump = contract.strain;
    const losers = countSuitContractLosers(declarerHand, dummyHand, trump, neededTricks);
    const priorities = [];
    const ruffPriorities = shortSuitRuffPriorities(declarerHand, dummyHand, trump, dummy, losers.detailsBySuit);
    const cashPriorities = suitCashPriorities(declarerHand, dummyHand, trump, declarer, dummy);
    const trumpPriority = drawTrumpPriority(declarerHand, dummyHand, trump, trumpDelayPlan(ruffPriorities, cashPriorities));

    if (trumpPriority?.timing === "early") {
      if (trumpPriority) priorities.push(trumpPriority);
      priorities.push(...cashPriorities.slice(0, 2));
    } else {
      priorities.push(...ruffPriorities.slice(0, 2));
      priorities.push(...cashPriorities.filter((priority) => priority.timing === "unblockBeforeEntry").slice(0, 1));
      if (trumpPriority) priorities.push(trumpPriority);
      priorities.push(...cashPriorities.filter((priority) => priority.timing !== "unblockBeforeEntry").slice(0, 1));
    }
    if (!priorities.length) {
      priorities.push({
        kind: "cashSureWinners",
        confidence: "basic",
        score: 1
      });
    }

    const warnings = [];
    if (losers.total > losers.allowed) {
      warnings.push({
        kind: "tooManyLosers",
        losers: losers.total,
        allowed: losers.allowed
      });
    }
    cashPriorities
      .filter((priority) => priority.timing === "blockedNoEntry")
      .forEach((priority) => {
        warnings.push({
          kind: "blockedSuit",
          suit: priority.suit,
          blockedSeat: priority.firstSeat,
          longSeat: priority.targetSeat,
          cashFirstRanks: priority.cashRanks,
          strandedRanks: priority.strandedRanks
        });
      });

    return {
      type: "suit",
      confidence: warnings.length ? "uncertain" : "basic",
      neededTricks,
      sureWinners: null,
      losers,
      needToDevelop: 0,
      priorities: priorities.slice(0, 3),
      warnings,
      declarer,
      dummy
    };
  }

  function countSuitContractLosers(declarerHand, dummyHand, trump, neededTricks) {
    const bySuit = {};
    const rawBySuit = {};
    const detailsBySuit = {};
    const dummyTrumpLength = cardsInSuit(dummyHand, trump).length;
    for (const suit of suits) {
      const detail = suitLoserEstimate(
        cardsInSuit(declarerHand, suit),
        cardsInSuit(dummyHand, suit),
        {
          isTrump: suit === trump,
          dummyTrumpLength
        }
      );
      detailsBySuit[suit] = detail;
      bySuit[suit] = detail.losers;
      rawBySuit[suit] = detail.rawLosers;
    }
    return {
      total: Object.values(bySuit).reduce((total, count) => total + count, 0),
      bySuit,
      rawBySuit,
      detailsBySuit,
      allowed: 13 - neededTricks
    };
  }

  function suitLoserEstimate(declarerSuitCards, dummySuitCards, { isTrump, dummyTrumpLength }) {
    if (!declarerSuitCards.length) {
      return {
        losers: 0,
        rawLosers: 0,
        topLosers: [],
        missingTopHonors: [],
        coverCards: [],
        ruffReduction: 0,
        trumpLengthCredit: 0,
        declarerLength: 0,
        dummyLength: dummySuitCards.length,
        combinedLength: dummySuitCards.length
      };
    }
    const checks = ["A", "K", "Q"].slice(0, Math.min(3, declarerSuitCards.length));
    const declarerRanks = new Set(declarerSuitCards.map((card) => card.rank));
    const dummyRanks = new Set(dummySuitCards.map((card) => card.rank));
    const visibleRanks = new Set([...declarerRanks, ...dummyRanks]);
    const missingTopHonors = checks.filter((rank) => !visibleRanks.has(rank));
    const coverCards = checks.filter((rank) => !declarerRanks.has(rank) && dummyRanks.has(rank));
    const rawLosers = missingTopHonors.length;
    const combinedLength = declarerSuitCards.length + dummySuitCards.length;
    const trumpLengthCredit = isTrump && combinedLength >= 9 && rawLosers > 0 ? 1 : 0;
    const ruffReduction = !isTrump && dummySuitCards.length <= 1 && dummyTrumpLength >= 2
      ? Math.min(rawLosers, Math.max(0, declarerSuitCards.length - dummySuitCards.length), 1)
      : 0;
    return {
      losers: Math.max(0, rawLosers - trumpLengthCredit - ruffReduction),
      rawLosers,
      topLosers: missingTopHonors,
      missingTopHonors,
      coverCards,
      ruffReduction,
      trumpLengthCredit,
      declarerLength: declarerSuitCards.length,
      dummyLength: dummySuitCards.length,
      combinedLength
    };
  }

  function shortSuitRuffPriorities(declarerHand, dummyHand, trump, dummy, detailsBySuit) {
    const dummyTrumps = cardsInSuit(dummyHand, trump);
    if (dummyTrumps.length < 2) return [];
    return suits
      .filter((suit) => suit !== trump)
      .map((suit) => ({
        kind: "ruffShortSuit",
        confidence: "basic",
        suit,
        shortSeat: dummy,
        shortLength: cardsInSuit(dummyHand, suit).length,
        declarerLength: cardsInSuit(declarerHand, suit).length,
        losers: detailsBySuit[suit]?.rawLosers || 0,
        ruffReduction: detailsBySuit[suit]?.ruffReduction || 0,
        score: (detailsBySuit[suit]?.rawLosers || 0) * 20 - cardsInSuit(dummyHand, suit).length * 3
      }))
      .filter((priority) => priority.shortLength <= 1 && priority.declarerLength >= 2 && priority.losers > 0)
      .sort((a, b) => b.score - a.score);
  }

  function suitCashPriorities(declarerHand, dummyHand, trump, declarer, dummy) {
    return suits
      .filter((suit) => suit !== trump)
      .map((suit) => {
        const declarerSuitCards = cardsInSuit(declarerHand, suit);
        const dummySuitCards = cardsInSuit(dummyHand, suit);
        const winnerRanks = visibleTopWinnerRanks([...declarerSuitCards, ...dummySuitCards], []);
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

  function trumpDelayPlan(ruffPriorities, cashPriorities) {
    if (ruffPriorities.length) {
      return {
        timing: "afterRuff",
        reason: "shortSuitRuff",
        suit: ruffPriorities[0].suit
      };
    }
    const unblock = cashPriorities.find((priority) => priority.timing === "unblockBeforeEntry");
    if (unblock) {
      return {
        timing: "afterUnblock",
        reason: "blockedSideSuit",
        suit: unblock.suit
      };
    }
    return {
      timing: "early",
      reason: "stableTrumpControl"
    };
  }

  function drawTrumpPriority(declarerHand, dummyHand, trump, delayPlan) {
    const trumpLength = cardsInSuit(declarerHand, trump).length + cardsInSuit(dummyHand, trump).length;
    if (trumpLength < 7) return null;
    const combinedRanks = new Set([...cardsInSuit(declarerHand, trump), ...cardsInSuit(dummyHand, trump)].map((card) => card.rank));
    const missingHonors = ["A", "K", "Q"].filter((rank) => !combinedRanks.has(rank));
    return {
      kind: "drawTrumps",
      confidence: missingHonors.length >= 2 ? "uncertain" : "basic",
      suit: trump,
      trumpLength,
      missingHonors,
      timing: delayPlan?.timing || "early",
      delayReason: delayPlan?.reason || "stableTrumpControl",
      delaySuit: delayPlan?.suit || null,
      score: (delayPlan?.timing === "early" ? 30 : 12) + trumpLength - missingHonors.length * 3
    };
  }

  const developmentRanks = ["A", "K", "Q", "J", "T"];
  const finessePatterns = [
    {
      missingHonors: ["K"],
      finesseRank: "Q",
      guardRanks: ["A"],
      ruleId: "finesseTowardHonor",
      action: "leadTowardFinesse",
      reason: "Lead low toward a protected honor to try a notrump finesse.",
      score: 90
    },
    {
      missingHonors: ["Q"],
      finesseRank: "J",
      guardRanks: ["A", "K"],
      ruleId: "finesseTowardHonor",
      action: "leadTowardFinesse",
      reason: "Lead low toward a protected honor to try a notrump finesse.",
      score: 80
    },
    {
      missingHonors: ["A", "Q"],
      finesseRank: "J",
      guardRanks: ["K"],
      minLeadCards: 2,
      ruleId: "doubleFinesseTowardHonor",
      action: "leadTowardDoubleFinesse",
      reason: "Lead low toward the jack to try the first round of a notrump double finesse.",
      score: 70
    },
    {
      missingHonors: ["K", "Q"],
      finesseRank: "T",
      guardRanks: ["A", "J"],
      minLeadCards: 2,
      ruleId: "doubleFinesseTowardHonor",
      action: "leadTowardDoubleFinesse",
      reason: "Lead low toward the ten to try the first round of a notrump double finesse.",
      score: 68
    },
    {
      missingHonors: ["A", "J"],
      finesseRank: "T",
      guardRanks: ["K", "Q"],
      minLeadCards: 2,
      ruleId: "doubleFinesseTowardHonor",
      action: "leadTowardDoubleFinesse",
      reason: "Lead low toward the ten to try the first round of a notrump double finesse.",
      score: 66
    },
    {
      missingHonors: ["A", "K"],
      finesseRank: "T",
      guardRanks: ["Q", "J"],
      minLeadCards: 2,
      ruleId: "doubleFinesseTowardHonor",
      action: "leadTowardDoubleFinesse",
      reason: "Lead low toward the ten to try the first round of a notrump double finesse.",
      score: 64
    }
  ];

  function cardsInSuit(cards, suit) {
    return (cards || []).filter((card) => card.suit === suit);
  }

  function hasRank(cards, rank) {
    return cards.some((card) => card.rank === rank);
  }

  function lowestSmallCardBelow(cards, rank) {
    const rankIndex = rankOrder.indexOf(rank);
    return lowestCard(cards.filter((card) => !hcpValue[card.rank] && rankOrder.indexOf(card.rank) < rankIndex));
  }

  function sideAceEntry(cards, excludedSuit) {
    return cards.find((card) => card.suit !== excludedSuit && card.rank === "A") || null;
  }

  function sameSuitFinesseEntry(pattern, currentSuitCards, partnerSuitCards, leadCard) {
    const remainingLeadCards = currentSuitCards.filter((card) => card.id !== leadCard.id);
    if (!remainingLeadCards.length) return null;
    const entryCard = pattern.guardRanks
      .map((rank) => partnerSuitCards.find((card) => card.rank === rank))
      .find(Boolean);
    if (!entryCard) return null;
    return {
      entryType: "sameSuit",
      entrySuit: entryCard.suit,
      entryRank: entryCard.rank
    };
  }

  function targetHandEntryPlan({ pattern, currentSuitCards, partnerHand, partnerSuitCards, leadCard, suit }) {
    const outsideAce = sideAceEntry(partnerHand, suit);
    if (outsideAce) {
      return {
        entryType: "sideAce",
        entrySuit: outsideAce.suit,
        entryRank: outsideAce.rank
      };
    }
    return sameSuitFinesseEntry(pattern, currentSuitCards, partnerSuitCards, leadCard);
  }

  function playedCardsFrom(trickHistory = [], currentTrick = []) {
    return [
      ...trickHistory.flatMap((trick) => trick.cards || []).map((play) => play.card),
      ...currentTrick.map((play) => play.card)
    ].filter(Boolean);
  }

  function topTouchingHonorRun(cards) {
    const ranks = new Set(cards.map((card) => card.rank));
    for (let i = 0; i < developmentRanks.length - 1; i++) {
      if (!ranks.has(developmentRanks[i])) continue;
      const run = [];
      for (let j = i; j < developmentRanks.length; j++) {
        if (!ranks.has(developmentRanks[j])) break;
        run.push(developmentRanks[j]);
      }
      if (run.length >= 2) return { ranks: run, topIndex: i };
    }
    return null;
  }

  function missingHigherRanks(run, combinedCards, playedSuitCards) {
    const combinedRanks = new Set(combinedCards.map((card) => card.rank));
    const playedRanks = new Set(playedSuitCards.map((card) => card.rank));
    return developmentRanks
      .slice(0, run.topIndex)
      .filter((rank) => !combinedRanks.has(rank) && !playedRanks.has(rank));
  }

  function longSuitDevelopmentCandidate({
    suit,
    source,
    sourceCards,
    currentSuitCards,
    partnerSuitCards,
    playedSuitCards,
    seat,
    partnerSeat
  }) {
    if (sourceCards.length < 4) return null;
    const combinedCards = [...currentSuitCards, ...partnerSuitCards];
    if (combinedCards.length < 6) return null;

    const run = topTouchingHonorRun(sourceCards);
    if (!run) return null;

    const missingHigher = missingHigherRanks(run, combinedCards, playedSuitCards);
    if (missingHigher.length !== 1) return null;

    const sourceIsCurrentHand = source === "current";
    const card = sourceIsCurrentHand
      ? sourceCards.find((item) => item.rank === run.ranks[0])
      : lowestCard(currentSuitCards);
    if (!card) return null;

    return {
      card,
      suit,
      suitLength: combinedCards.length,
      sourceSeat: sourceIsCurrentHand ? seat : partnerSeat,
      sourceLength: sourceCards.length,
      sequence: run.ranks.join(""),
      missingStopper: missingHigher[0],
      action: sourceIsCurrentHand ? "forceMissingHighCard" : "leadTowardLongSuit",
      score: combinedCards.length * 4 + sourceCards.length * 3 + run.ranks.length * 8 + (sourceIsCurrentHand ? 3 : 0)
    };
  }

  function finesseCandidate({
    suit,
    partnerHand,
    currentSuitCards,
    partnerSuitCards,
    playedSuitCards,
    partnerSeat
  }) {
    if (!currentSuitCards.length || partnerSuitCards.length < 2) return null;

    const combinedCards = [...currentSuitCards, ...partnerSuitCards];
    for (const pattern of finessePatterns) {
      const missingHonors = pattern.missingHonors || [];
      if (pattern.minLeadCards && currentSuitCards.length < pattern.minLeadCards) continue;
      const leadCard = lowestSmallCardBelow(currentSuitCards, pattern.finesseRank);
      if (!leadCard) continue;
      if (!hasRank(partnerSuitCards, pattern.finesseRank)) continue;
      if (missingHonors.some((rank) => hasRank(combinedCards, rank) || hasRank(playedSuitCards, rank))) continue;
      if (!pattern.guardRanks.every((rank) => hasRank(partnerSuitCards, rank))) continue;
      const entryPlan = targetHandEntryPlan({
        pattern,
        currentSuitCards,
        partnerHand,
        partnerSuitCards,
        leadCard,
        suit
      });
      if (!entryPlan) continue;

      return {
        card: leadCard,
        suit,
        ruleId: pattern.ruleId,
        targetSeat: partnerSeat,
        targetLength: partnerSuitCards.length,
        finesseRank: pattern.finesseRank,
        missingHonor: missingHonors[0],
        missingHonors,
        guardRanks: pattern.guardRanks,
        entryType: entryPlan.entryType,
        entrySuit: entryPlan.entrySuit,
        entryRank: entryPlan.entryRank,
        action: pattern.action,
        reason: pattern.reason,
        score: pattern.score + partnerSuitCards.length + combinedCards.length + (entryPlan.entryType === "sideAce" ? 4 : 0)
      };
    }
    return null;
  }

  function chooseDeclarerFinessePlay({
    hand,
    partnerHand,
    currentTrick,
    trickHistory,
    seat,
    declarer,
    dummy,
    contract
  }) {
    if (currentTrick.length || contract?.strain !== "NT") return null;
    if (!partnerHand?.length || !declarer || !dummy) return null;
    if (seat !== declarer && seat !== dummy) return null;

    const partnerSeat = partnerOf(seat);
    const playedCards = playedCardsFrom(trickHistory, currentTrick);
    const candidates = [];

    for (const suit of suits) {
      const currentSuitCards = cardsInSuit(hand, suit);
      const partnerSuitCards = cardsInSuit(partnerHand, suit);
      const playedSuitCards = cardsInSuit(playedCards, suit);
      const candidate = finesseCandidate({
        suit,
        partnerHand,
        currentSuitCards,
        partnerSuitCards,
        playedSuitCards,
        partnerSeat
      });
      if (candidate) candidates.push(candidate);
    }

    const best = candidates.sort((a, b) => b.score - a.score)[0];
    if (!best) return null;

    return cardPlayResult(
      best.card,
      best.ruleId,
      "uncertain",
      best.reason,
      {
        suit: best.suit,
        targetSeat: best.targetSeat,
        targetLength: best.targetLength,
        finesseRank: best.finesseRank,
        missingHonor: best.missingHonor,
        missingHonors: best.missingHonors,
        guardRanks: best.guardRanks,
        entryType: best.entryType,
        entrySuit: best.entrySuit,
        entryRank: best.entryRank,
        action: best.action
      }
    );
  }

  function chooseDeclarerDevelopmentPlay({
    hand,
    partnerHand,
    currentTrick,
    trickHistory,
    seat,
    declarer,
    dummy,
    contract
  }) {
    if (currentTrick.length || contract?.strain !== "NT") return null;
    if (!partnerHand?.length || !declarer || !dummy) return null;
    if (seat !== declarer && seat !== dummy) return null;

    const partnerSeat = partnerOf(seat);
    const playedCards = playedCardsFrom(trickHistory, currentTrick);
    const candidates = [];

    for (const suit of suits) {
      const currentSuitCards = cardsInSuit(hand, suit);
      if (!currentSuitCards.length) continue;

      const partnerSuitCards = cardsInSuit(partnerHand, suit);
      const playedSuitCards = cardsInSuit(playedCards, suit);
      const currentCandidate = longSuitDevelopmentCandidate({
        suit,
        source: "current",
        sourceCards: currentSuitCards,
        currentSuitCards,
        partnerSuitCards,
        playedSuitCards,
        seat,
        partnerSeat
      });
      const partnerCandidate = longSuitDevelopmentCandidate({
        suit,
        source: "partner",
        sourceCards: partnerSuitCards,
        currentSuitCards,
        partnerSuitCards,
        playedSuitCards,
        seat,
        partnerSeat
      });

      if (currentCandidate) candidates.push(currentCandidate);
      if (partnerCandidate) candidates.push(partnerCandidate);
    }

    const best = candidates.sort((a, b) => b.score - a.score)[0];
    if (!best) return null;

    return cardPlayResult(
      best.card,
      "developLongSuit",
      "uncertain",
      "Develop a long notrump suit by forcing out a missing high card.",
      {
        suit: best.suit,
        suitLength: best.suitLength,
        sourceSeat: best.sourceSeat,
        sourceLength: best.sourceLength,
        sequence: best.sequence,
        missingStopper: best.missingStopper,
        action: best.action
      }
    );
  }

  function chooseCardFromPlayPlan({
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
    legal
  }) {
    if (currentTrick.length || !playPlan?.priorities?.length) return null;
    if (!partnerHand?.length || !declarer || !dummy) return null;
    if (seat !== declarer && seat !== dummy) return null;

    for (const priority of playPlan.priorities) {
      const result = chooseCardForPlanPriority({
        priority,
        hand,
        partnerHand,
        trickHistory,
        seat,
        contract,
        trump,
        legal
      });
      if (result) return result;
    }

    return null;
  }

  function chooseCardForPlanPriority({
    priority,
    hand,
    partnerHand,
    trickHistory,
    seat,
    contract,
    trump,
    legal
  }) {
    if (priority.kind === "developLongSuit") {
      return choosePlanDevelopmentPlay({ priority, hand, partnerHand, seat, legal });
    }
    if (priority.kind === "finesse" || priority.kind === "doubleFinesse") {
      return choosePlanFinessePlay({ priority, hand, partnerHand, trickHistory, seat, legal });
    }
    if (priority.kind === "ruffShortSuit") {
      return choosePlanRuffPlay({ priority, hand, partnerHand, trickHistory, seat, trump, legal });
    }
    if (priority.kind === "drawTrumps") {
      return choosePlanDrawTrumpsPlay({ priority, contract, legal });
    }
    if (priority.kind === "cashWinners" || priority.kind === "cashSureWinners") {
      return choosePlanCashWinnerPlay({ priority, hand, seat, legal });
    }
    return null;
  }

  function legalPlanCard(card, legal) {
    if (!card) return null;
    return legal.find((item) => item.id === card.id) || null;
  }

  function choosePlanDevelopmentPlay({ priority, hand, partnerHand, seat, legal }) {
    const suitCards = cardsInSuit(hand, priority.suit);
    if (!suitCards.length) return null;

    const sourceIsCurrentHand = priority.sourceSeat === seat;
    const card = sourceIsCurrentHand
      ? legalPlanCard(suitCards.find((item) => priority.sequence?.startsWith(item.rank)) || highestCard(suitCards), legal)
      : legalPlanCard(lowestCard(suitCards), legal);
    if (!card) return null;

    return cardPlayResult(
      card,
      "playPlan.developLongSuit",
      priority.confidence || "uncertain",
      "Follow the visible play plan by developing the long notrump suit.",
      {
        planPriority: priority,
        suit: priority.suit,
        suitLength: priority.suitLength,
        sourceSeat: priority.sourceSeat,
        sourceLength: priority.sourceLength,
        sequence: priority.sequence,
        missingStopper: priority.missingStopper,
        action: sourceIsCurrentHand ? "forceMissingHighCard" : "leadTowardLongSuit",
        targetSeat: sourceIsCurrentHand ? seat : partnerOf(seat),
        targetLength: sourceIsCurrentHand ? suitCards.length : cardsInSuit(partnerHand, priority.suit).length
      }
    );
  }

  function choosePlanFinessePlay({ priority, hand, partnerHand, trickHistory, seat, legal }) {
    const partnerSeat = partnerOf(seat);
    if (priority.targetSeat && priority.targetSeat !== partnerSeat) return null;

    const currentSuitCards = cardsInSuit(hand, priority.suit);
    const partnerSuitCards = cardsInSuit(partnerHand, priority.suit);
    const candidate = finesseCandidate({
      suit: priority.suit,
      partnerHand,
      currentSuitCards,
      partnerSuitCards,
      playedSuitCards: cardsInSuit(playedCardsFrom(trickHistory, []), priority.suit),
      partnerSeat
    });
    if (!candidate) return null;

    const expectedKind = candidate.ruleId === "doubleFinesseTowardHonor" ? "doubleFinesse" : "finesse";
    if (expectedKind !== priority.kind) return null;
    const card = legalPlanCard(candidate.card, legal);
    if (!card) return null;

    return cardPlayResult(
      card,
      `playPlan.${candidate.ruleId}`,
      priority.confidence || "uncertain",
      candidate.reason,
      {
        planPriority: priority,
        suit: candidate.suit,
        targetSeat: candidate.targetSeat,
        targetLength: candidate.targetLength,
        finesseRank: candidate.finesseRank,
        missingHonor: candidate.missingHonor,
        missingHonors: candidate.missingHonors,
        guardRanks: candidate.guardRanks,
        entryType: candidate.entryType,
        entrySuit: candidate.entrySuit,
        entryRank: candidate.entryRank,
        action: candidate.action
      }
    );
  }

  function choosePlanRuffPlay({ priority, hand, partnerHand, trickHistory, seat, trump, legal }) {
    if (!trump) return null;
    if (priority.shortSeat === seat) {
      return choosePlanRuffEntryPlay({ priority, hand, partnerHand, trickHistory, seat, trump, legal });
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
    if (!candidate) return null;

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

  function choosePlanDrawTrumpsPlay({ priority, contract, legal }) {
    const trump = contract?.strain === "NT" ? null : contract?.strain;
    if (!trump || priority.suit !== trump) return null;
    const card = legalPlanCard(highestCard(cardsInSuit(legal, trump)), legal);
    if (!card) return null;

    return cardPlayResult(
      card,
      "playPlan.drawTrumps",
      priority.confidence || "basic",
      "Follow the visible play plan by drawing trumps.",
      {
        planPriority: priority,
        suit: trump,
        trumpLength: priority.trumpLength,
        missingHonors: priority.missingHonors,
        timing: priority.timing,
        action: "drawTrumps"
      }
    );
  }

  function choosePlanCashWinnerPlay({ priority, hand, seat, legal }) {
    if (priority.firstSeat && priority.firstSeat !== seat) return null;
    const suitedLegal = priority.suit ? cardsInSuit(legal, priority.suit) : legal;
    const card = priority.cashRanks?.length
      ? priority.cashRanks.map((rank) => suitedLegal.find((item) => item.rank === rank)).find(Boolean)
      : highestCard(suitedLegal);
    if (!card) return null;

    return cardPlayResult(
      card,
      priority.kind === "cashWinners" ? "playPlan.cashWinners" : "playPlan.cashSureWinners",
      priority.confidence || "basic",
      "Follow the visible play plan by cashing a sure winner.",
      {
        planPriority: priority,
        suit: priority.suit || card.suit,
        cashRanks: priority.cashRanks,
        timing: priority.timing,
        action: priority.timing === "unblockBeforeEntry" ? "unblockSuit" : "cashSureWinner"
      }
    );
  }

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

  function notrumpLeadPattern(cards) {
    const ranks = new Set(cards.map((card) => card.rank));
    const candidates = [];

    for (let i = 0; i < descendingRanks.length; i++) {
      const topRank = descendingRanks[i];
      if (!isLeadHonorRank(topRank) || !ranks.has(topRank)) continue;

      const run = [];
      for (let j = i; j < descendingRanks.length; j++) {
        if (!ranks.has(descendingRanks[j])) break;
        run.push(descendingRanks[j]);
      }
      if (run.length >= 3) {
        candidates.push({ type: "sequence", ranks: run, topRank, score: 300 - i });
      }

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
      if (gapRank && fourthRank && !ranks.has(nextRank) && ranks.has(gapRank) && ranks.has(fourthRank)) {
        candidates.push({
          type: "brokenSequence",
          ranks: [topRank, gapRank, fourthRank],
          topRank,
          missingRank: nextRank,
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

  function highCardRanks(cards) {
    return descendingRanks.filter((rank) => hcpValue[rank] && cards.some((card) => card.rank === rank));
  }

  function chooseNotrumpLeadCardPlay(hand, legal) {
    const longestSuit = longestSuitForLead(hand);
    const longestSuitCards = legal.filter((card) => card.suit === longestSuit);
    if (!longestSuitCards.length) return null;

    const pattern = notrumpLeadPattern(longestSuitCards);
    if (pattern?.card) {
      return cardPlayResult(
        pattern.card,
        pattern.type === "brokenSequence" ? "notrumpBrokenSequenceLead" : "notrumpSequenceLead",
        "basic",
        "Lead the highest card from a notrump sequence or broken sequence.",
        {
          suit: longestSuit,
          suitLength: longestSuitCards.length,
          sequence: pattern.ranks.join(""),
          missingRank: pattern.missingRank || null,
          action: pattern.type
        }
      );
    }

    const honors = highCardRanks(longestSuitCards);
    if (honors.length) {
      const smallCard = lowestCard(longestSuitCards.filter(isLowLeadCard));
      if (smallCard) {
        return cardPlayResult(
          smallCard,
          "notrumpLowPromisesHonor",
          "basic",
          "Lead low from the longest notrump suit to promise at least one high card.",
          {
            suit: longestSuit,
            suitLength: longestSuitCards.length,
            honorRanks: honors,
            action: "lowPromisesHonor"
          }
        );
      }
    }

    return null;
  }

  function canUseDefensiveLeadAgreement(seat, declarer) {
    return !seat || !declarer || teamOf(seat) !== teamOf(declarer);
  }

  function chooseLeadCardPlay(hand, legal, { contract = null, seat = null, declarer = null } = {}) {
    if (contract?.strain === "NT" && canUseDefensiveLeadAgreement(seat, declarer)) {
      const notrumpLead = chooseNotrumpLeadCardPlay(hand, legal);
      if (notrumpLead) return notrumpLead;
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

  function isLowPromisesHonorLead(play) {
    if (!play?.card) return false;
    if (play.ruleId) return play.ruleId === "notrumpLowPromisesHonor";
    return isLowLeadCard(play.card);
  }

  function chooseThirdHandHighOverLowLead({ legal, currentTrick, seat, declarer, contract, trump, winning }) {
    if (contract?.strain !== "NT" || trump || !seat || currentTrick.length !== 2) return null;
    if (!canUseDefensiveLeadAgreement(seat, declarer)) return null;
    const leadPlay = currentTrick[0];
    if (leadPlay.seat !== partnerOf(seat) || !isLowPromisesHonorLead(leadPlay)) return null;

    const leadSuit = leadPlay.card.suit;
    const suitedLegal = cardsInSuit(legal, leadSuit);
    if (!suitedLegal.length) return null;

    return cardPlayResult(
      highestCard(suitedLegal),
      "thirdHandHighOverLowLead",
      "basic",
      "Partner led low to promise a high card in notrump, so third hand plays high.",
      {
        leadSuit,
        leadCard: leadPlay.card,
        winningSeat: winning?.seat || null,
        action: "thirdHandHigh"
      }
    );
  }

  function chooseCardPlay({
    hand = [],
    partnerHand = null,
    currentTrick = [],
    trickHistory = [],
    seat,
    declarer = null,
    dummy = null,
    contract = null,
    trump = null,
    playPlan = null
  } = {}) {
    const legal = legalCards(hand, currentTrick);
    if (!legal.length) return null;

    if (!currentTrick.length) {
      const planned = chooseCardFromPlayPlan({
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
        legal
      });
      if (planned) return planned;
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
      if (finesse) return finesse;
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
      if (development) return development;
      return chooseLeadCardPlay(hand, legal, { contract, seat, declarer });
    }

    const leadSuit = currentTrick[0].card.suit;
    const winning = currentWinningPlay(currentTrick, trump);
    const partnerWinning = Boolean(winning && seat && teamOf(winning.seat) === teamOf(seat));

    const thirdHandHigh = chooseThirdHandHighOverLowLead({
      legal,
      currentTrick,
      seat,
      declarer,
      contract,
      trump,
      winning
    });
    if (thirdHandHigh) return thirdHandHigh;

    if (partnerWinning) {
      const harmlessCards = legal.filter((card) => !beats(card, winning.card, leadSuit, trump));
      return cardPlayResult(
        lowestCard(harmlessCards.length ? harmlessCards : legal),
        "partnerWinningLow",
        "basic",
        "Partner is currently winning the trick, so play the lowest harmless legal card.",
        { winningSeat: winning.seat }
      );
    }

    const canBeat = legal
      .filter((card) => beats(card, winning.card, leadSuit, trump))
      .sort(compareLowCards);

    if (canBeat.length) {
      return cardPlayResult(
        canBeat[0],
        "cheapestWinner",
        "basic",
        "Play the cheapest card that is currently winning the trick.",
        { winningSeat: winning.seat }
      );
    }

    if (hand.some((card) => card.suit === leadSuit)) {
      return cardPlayResult(
        lowestCard(legal),
        "lowestFollow",
        "basic",
        "Follow suit with the lowest legal card because this hand cannot win the trick.",
        { leadSuit, winningSeat: winning.seat }
      );
    }

    return cardPlayResult(
      lowestCard(legal),
      "lowestDiscard",
      "basic",
      "Discard the lowest legal card because this hand cannot follow suit or win the trick.",
      { leadSuit, winningSeat: winning.seat }
    );
  }

  function beats(card, best, leadSuit, trump) {
    if (trump && card.suit === trump && best.suit !== trump) return true;
    if (trump && best.suit === trump && card.suit !== trump) return false;
    if (card.suit !== best.suit) return false;
    if (card.suit !== leadSuit && (!trump || card.suit !== trump)) return false;
    return rankOrder.indexOf(card.rank) > rankOrder.indexOf(best.rank);
  }

  function currentWinningPlay(currentTrick, trump) {
    if (!currentTrick.length) return null;
    const leadSuit = currentTrick[0].card.suit;
    return currentTrick.reduce((best, play) => beats(play.card, best.card, leadSuit, trump) ? play : best);
  }

  return {
    seats,
    suits,
    handSuitOrder,
    bidStrains,
    rankOrder,
    vulnerabilityForDeal,
    dealerIndexForDeal,
    teamOf,
    partnerOf,
    isTeamVulnerable,
    compareCards,
    createDeck,
    randomFromSeed,
    dealHands,
    countSuits,
    hcp,
    handShape,
    isPass,
    isDouble,
    isRedouble,
    isContractBid,
    isContractCall,
    finalContract,
    highestBidCall,
    highestBid,
    isBidHigher,
    chooseFiveCardHighBid,
    chooseFiveCardHighBidTarget,
    chooseFiveCardHighOpening,
    chooseFiveCardHighResponse,
    chooseFiveCardHighOpenerRebid,
    chooseFiveCardHighResponderRebid,
    canDoubleFromAuction,
    canRedoubleFromAuction,
    auctionComplete,
    findDeclarer,
    contractTrickPoints,
    overtrickPoints,
    downScore,
    calculatePassOutScore,
    calculateBridgeScore,
    legalCards,
    createPlayPlan,
    chooseCardPlay,
    beats,
    currentWinningPlay
  };
});

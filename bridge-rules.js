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

  function calculatePassOutScore(scoringMode) {
    return {
      declarerTeam: null,
      score: 0,
      scoreText: "NS 0 / EW 0",
      vulnerable: false,
      mode: scoringMode,
      passOut: true,
      passedOut: true
    };
  }

  function calculateBridgeScore({ contract, declarer, tricksMade, vulnerability, scoringMode }) {
    if (!contract) return calculatePassOutScore(scoringMode);

    const declarerTeam = teamOf(declarer);
    const vulnerable = scoringMode === "casual" ? false : isTeamVulnerable(declarerTeam, vulnerability);
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
        mode: scoringMode
      };
    }

    const base = contractTrickPoints(contract) * multiplier;
    const gameBonus = base >= 100 ? (vulnerable ? 500 : 300) : 50;
    const overtrickScore = overtrickPoints(contract, overtricks, vulnerable, multiplier);
    const slamBonus = contract.level === 6 ? (vulnerable ? 750 : 500) : contract.level === 7 ? (vulnerable ? 1500 : 1000) : 0;
    const insultBonus = contract.redoubled ? 100 : contract.doubled ? 50 : 0;
    const score = base + gameBonus + overtrickScore + slamBonus + insultBonus;

    return {
      declarerTeam,
      score,
      scoreText: `${declarerTeam} +${score}`,
      vulnerable,
      mode: scoringMode
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

  function cardPlayResult(card, ruleName, confidence, reason, extra = {}) {
    return {
      card,
      ruleId: ruleName,
      confidence,
      reason,
      ...extra
    };
  }

  function chooseLeadCardPlay(hand, legal) {
    const suitCounts = countSuits(hand);
    const longestSuit = suits.reduce((best, suit) => suitCounts[suit] > suitCounts[best] ? suit : best, "C");
    const longestSuitCards = legal.filter((card) => card.suit === longestSuit);
    if (longestSuitCards.length) {
      return cardPlayResult(
        highestCard(longestSuitCards),
        "longestSuitLead",
        "uncertain",
        "Lead the highest card from the longest available suit.",
        { suit: longestSuit, suitLength: suitCounts[longestSuit] }
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

  function chooseCardPlay({
    hand = [],
    partnerHand = null,
    currentTrick = [],
    trickHistory = [],
    seat,
    declarer = null,
    dummy = null,
    contract = null,
    trump = null
  } = {}) {
    const legal = legalCards(hand, currentTrick);
    if (!legal.length) return null;

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
      return chooseLeadCardPlay(hand, legal);
    }

    const leadSuit = currentTrick[0].card.suit;
    const winning = currentWinningPlay(currentTrick, trump);
    const partnerWinning = Boolean(winning && seat && teamOf(winning.seat) === teamOf(seat));

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
    chooseCardPlay,
    beats,
    currentWinningPlay
  };
});

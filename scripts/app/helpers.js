(function registerBridgeAppHelpers(root) {
  "use strict";

  const modules = root.BridgeAppModules = root.BridgeAppModules || {};

  modules.registerHelpers = function registerHelpers(runtime) {
    const { constants, helpers, rules, state, text } = runtime;
    const { rankLabel, seats, suitSymbols } = constants;

    function dealHands(seed = state.dealSeed) {
      return rules.dealHands(rules.randomFromSeed(seed));
    }

    function cloneHands(hands) {
      return Object.fromEntries(seats.map((seat) => [seat, hands[seat].map((card) => ({ ...card }))]));
    }

    function vulnerabilityForDeal(dealNumber) {
      return rules.vulnerabilityForDeal(dealNumber);
    }

    function dealerIndexForDeal(dealNumber) {
      return rules.dealerIndexForDeal(dealNumber);
    }

    function vulnerabilityName(vulnerability = state.vulnerability) {
      return {
        none: t("vulnerabilityNone"),
        NS: t("vulnerabilityNS"),
        EW: t("vulnerabilityEW"),
        both: t("vulnerabilityBoth")
      }[vulnerability];
    }

    function isTeamVulnerable(team, vulnerability = state.vulnerability) {
      return rules.isTeamVulnerable(team, vulnerability);
    }

    function isSeatVulnerable(seat, vulnerability = state.vulnerability) {
      return isTeamVulnerable(rules.teamOf(seat), vulnerability);
    }

    function compareCards(a, b) {
      return rules.compareCards(a, b);
    }

    function calculateBridgeScore({ contract, declarer, tricksMade, vulnerability }) {
      return rules.calculateBridgeScore({ contract, declarer, tricksMade, vulnerability });
    }

    function contractTrickPoints(contract) {
      return rules.contractTrickPoints(contract);
    }

    function overtrickPoints(contract, overtricks, vulnerable, multiplier) {
      return rules.overtrickPoints(contract, overtricks, vulnerable, multiplier);
    }

    function downScore(undertricks, vulnerable, multiplier) {
      return rules.downScore(undertricks, vulnerable, multiplier);
    }

    function legalCards(seat) {
      return rules.legalCards(state.hands[seat], state.currentTrick);
    }

    function isLegalCard(seat, card) {
      return legalCards(seat).some((legal) => legal.id === card.id);
    }

    function currentWinningPlay() {
      const trump = state.contract.strain === "NT" ? null : state.contract.strain;
      return rules.currentWinningPlay(state.currentTrick, trump);
    }

    function beats(card, best, leadSuit, trump) {
      return rules.beats(card, best, leadSuit, trump);
    }

    function highestBidCall() {
      return rules.highestBidCall(state.auction);
    }

    function highestBid() {
      return rules.highestBid(state.auction);
    }

    function isBidHigher(bid, current) {
      return rules.isBidHigher(bid, current);
    }

    function isPass(bid) {
      return rules.isPass(bid);
    }

    function isDouble(bid) {
      return rules.isDouble(bid);
    }

    function isRedouble(bid) {
      return rules.isRedouble(bid);
    }

    function isContractBid(bid) {
      return rules.isContractBid(bid);
    }

    function normalizeBid(bid) {
      return rules.normalizeBid(bid);
    }

    function formatBid(bid) {
      const base = `${bid.level}${suitSymbols[bid.strain]}`;
      if (bid.redoubled) return `${base} xx`;
      if (bid.doubled) return `${base} x`;
      return base;
    }

    function formatCall(call) {
      if (isPass(call)) return t("pass");
      if (isDouble(call)) return t("double");
      if (isRedouble(call)) return t("redouble");
      return formatBid(call);
    }

    function cardText(card) {
      return `${rankLabel[card.rank] || card.rank}${suitSymbols[card.suit]}`;
    }

    function seatAt(index) {
      return seats[index % 4];
    }

    function teamOf(seat) {
      return rules.teamOf(seat);
    }

    function partnerOf(seat) {
      return seat === "North" ? "South" : seat === "South" ? "North" : seat === "East" ? "West" : "East";
    }

    function leftOf(seat) {
      return seats[(seats.indexOf(seat) + 1) % 4];
    }

    function localizeArgs(args) {
      const localized = { ...args };
      ["seat", "leader", "declarer", "dummy"].forEach((key) => {
        if (localized[key]) localized[key] = seatName(localized[key]);
      });
      if (localized.resultKey) {
        localized.result = t(localized.resultKey, localized.resultArgs || {});
      }
      return localized;
    }

    function t(key, args = {}) {
      const template = text[key] || key;
      return Object.entries(args).reduce((message, [name, value]) => message.replaceAll(`{${name}}`, value), template);
    }

    function seatName(seat) {
      return text.seats[seat] || seat;
    }

    function suitName(suit) {
      return text.suits[suit] || suit;
    }

    Object.assign(helpers, {
      beats,
      calculateBridgeScore,
      cardText,
      cloneHands,
      compareCards,
      contractTrickPoints,
      currentWinningPlay,
      dealerIndexForDeal,
      dealHands,
      downScore,
      formatBid,
      formatCall,
      highestBid,
      highestBidCall,
      isBidHigher,
      isContractBid,
      isDouble,
      isLegalCard,
      isPass,
      isRedouble,
      isSeatVulnerable,
      isTeamVulnerable,
      leftOf,
      legalCards,
      localizeArgs,
      normalizeBid,
      overtrickPoints,
      partnerOf,
      sameCall: rules.sameCall,
      seatAt,
      seatName,
      suitName,
      t,
      teamOf,
      vulnerabilityForDeal,
      vulnerabilityName
    });
  };
})(typeof globalThis !== "undefined" ? globalThis : this);

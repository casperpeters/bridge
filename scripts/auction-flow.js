function continueAuction() {
  if (state.phase !== "bidding") return;
  const seat = seatAt(state.turnIndex);
  renderAll();
  if (auctionComplete()) {
    finishAuction();
    return;
  }
  if (seat === "South") {
    setStatus("yourCall");
    return;
  }
  window.setTimeout(() => {
    makeBid(seat, chooseBid(seat));
  }, 560);
}

function makeBid(seat, bid) {
  if (state.phase !== "bidding" || seat !== seatAt(state.turnIndex)) return;
  if (isContractBid(bid) && !isBidHigher(bid, highestBid())) return;
  if (bid === "Double" && !canDouble(seat)) return;
  if (bid === "Redouble" && !canRedouble(seat)) return;
  state.auction.push({
    seat,
    bid,
    stop: seat === "South" && state.pendingStop,
    alert: seat === "South" && state.pendingAlert
  });
  state.pendingStop = false;
  state.pendingAlert = false;
  state.turnIndex = (state.turnIndex + 1) % 4;
  renderAll();
  continueAuction();
}

function chooseBid(seat) {
  return bridgeRules.chooseFiveCardHighBid({
    hand: state.hands[seat],
    auction: state.auction,
    seat,
    vulnerability: state.vulnerability
  });
}

function chooseRecommendedBid(seat) {
  return chooseBid(seat);
}

function canDouble(seat) {
  const contractCall = highestBidCall();
  if (!contractCall || teamOf(contractCall.seat) === teamOf(seat)) return false;
  const contract = highestBid();
  return Boolean(contract && !contract.doubled && !contract.redoubled);
}

function canRedouble(seat) {
  const contractCall = highestBidCall();
  if (!contractCall || teamOf(contractCall.seat) !== teamOf(seat)) return false;
  const contract = highestBid();
  return Boolean(contract?.doubled && !contract.redoubled);
}

function bidEquals(bid, level, strain) {
  return isContractBid(bid) && bid.level === level && bid.strain === strain;
}

function auctionComplete() {
  return bridgeRules.auctionComplete(state.auction);
}

function finishAuction() {
  const bid = highestBid();
  if (!bid) {
    finishPassedOutHand();
    return;
  }
  state.contract = bid;
  state.declarer = findDeclarer(bid);
  state.dummy = partnerOf(state.declarer);
  state.leader = leftOf(state.declarer);
  state.turnIndex = seats.indexOf(state.leader);
  state.phase = "playing";
  renderAll();
  setStatus("lead", { leader: state.leader, declarer: state.declarer, dummy: state.dummy });
  continuePlay();
}

function finishPassedOutHand() {
  state.phase = "complete";
  state.contract = null;
  state.declarer = null;
  state.dummy = null;
  state.leader = null;
  state.finalScore = calculateBridgeScore({
    contract: null
  });
  state.finalScore.scoreText = `${t("northSouth")} 0 ${separatorDot} ${t("eastWest")} 0`;
  state.finalScore.made = 0;
  state.finalScore.defenders = 0;
  setStatus("fourPasses");
  renderAll();
}

function autoCompleteAuction() {
  let callCount = 0;
  while (state.phase === "bidding" && !auctionComplete() && callCount < 80) {
    const seat = seatAt(state.turnIndex);
    state.auction.push({
      seat,
      bid: legalAutoBid(seat),
      stop: false,
      alert: false
    });
    state.turnIndex = (state.turnIndex + 1) % 4;
    callCount += 1;
  }
  if (state.phase !== "bidding" || !auctionComplete()) return;

  const bid = highestBid();
  if (!bid) {
    finishPassedOutHand();
    return;
  }
  state.contract = bid;
  state.declarer = findDeclarer(bid);
  state.dummy = partnerOf(state.declarer);
  state.leader = leftOf(state.declarer);
  state.turnIndex = seats.indexOf(state.leader);
  state.phase = "playing";
  setStatus("lead", { leader: state.leader, declarer: state.declarer, dummy: state.dummy });
}

function legalAutoBid(seat) {
  const bid = chooseBid(seat);
  if (!bid) return "Pass";
  if (isContractBid(bid)) return isBidHigher(bid, highestBid()) ? bid : "Pass";
  if (bid === "Double") return canDouble(seat) ? bid : "Pass";
  if (bid === "Redouble") return canRedouble(seat) ? bid : "Pass";
  return "Pass";
}

function findDeclarer(contract) {
  return bridgeRules.findDeclarer(state.auction, contract);
}

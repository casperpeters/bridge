function prepareContractFromAuction(bid) {
  state.contract = bid;
  state.declarer = findDeclarer(bid);
  state.dummy = partnerOf(state.declarer);
  state.leader = leftOf(state.declarer);
  state.turnIndex = seats.indexOf(state.leader);
  state.currentTrick = [];
  state.awaitingTrickAdvance = false;
  state.trickAdvanceArmed = false;
  state.pendingTrickWinner = null;
}

function enterContractReveal() {
  const patch = BridgeStateTransitions.enterContractRevealTransition(state);
  if (!patch) return false;
  Object.assign(state, patch);
  setStatus("contractReady", { contract: formatBid(state.contract), declarer: state.declarer });
  renderAll();
  focusContractReveal();
  return true;
}

function focusContractReveal() {
  if (els.contractReveal?.hidden) return;
  window.setTimeout(() => els.contractReveal?.focus({ preventScroll: true }), 0);
}

function startPlayFromContractReveal() {
  const patch = BridgeStateTransitions.startPlayFromContractRevealTransition(state);
  if (!patch) return false;
  Object.assign(state, patch);
  setStatus("lead", { leader: state.leader, declarer: state.declarer, dummy: state.dummy });
  renderAll();
  continuePlay();
  return true;
}

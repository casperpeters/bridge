(function registerBridgeContractRevealFlow(root) {
  "use strict";

  const modules = root.BridgeAppModules = root.BridgeAppModules || {};

  modules.registerContractRevealFlow = function registerContractRevealFlow(runtime) {
    const { actions, constants, els, helpers, render, state, transitions } = runtime;
    const { seats } = constants;
    const findDeclarer = (...args) => actions.findDeclarer(...args);

function prepareContractFromAuction(bid) {
  const declarer = findDeclarer(bid);
  Object.assign(state, transitions.finishAuctionTransition(state, {
    contract: bid,
    declarer,
    dummy: helpers.partnerOf(declarer),
    leader: helpers.leftOf(declarer),
    seats
  }));
}

function enterContractReveal() {
  const patch = transitions.enterContractRevealTransition(state);
  if (!patch) return false;
  Object.assign(state, patch);
  actions.setStatus("contractReady", { contract: helpers.formatBid(state.contract), declarer: state.declarer });
  render.renderAll();
  focusContractReveal();
  return true;
}

function focusContractReveal() {
  if (els.contractReveal?.hidden) return;
  window.setTimeout(() => els.contractReveal?.focus({ preventScroll: true }), 0);
}

function startPlayFromContractReveal() {
  const patch = transitions.startPlayFromContractRevealTransition(state);
  if (!patch) return false;
  Object.assign(state, patch);
  actions.setStatus("lead", { leader: state.leader, declarer: state.declarer, dummy: state.dummy });
  render.renderAll();
  actions.continuePlay();
  return true;
}

    Object.assign(actions, {
      enterContractReveal,
      focusContractReveal,
      prepareContractFromAuction,
      startPlayFromContractReveal
    });
  };
})(typeof globalThis !== "undefined" ? globalThis : this);

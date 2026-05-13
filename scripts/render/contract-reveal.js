(function registerBridgeContractRevealRenderer(root) {
  "use strict";

  const modules = root.BridgeAppModules = root.BridgeAppModules || {};

  modules.registerContractRevealRenderer = function registerContractRevealRenderer(runtime) {
    const { constants, els, helpers, render, state } = runtime;
    const { suitSymbols } = constants;

function renderContractReveal() {
  const active = state.phase === "contract-reveal" && Boolean(state.contract && state.declarer && state.dummy && state.leader);
  els.tableArea?.classList.toggle("has-contract-reveal", active);
  if (!els.contractReveal) return;
  els.contractReveal.hidden = !active;
  els.contractReveal.setAttribute("aria-hidden", String(!active));
  if (!active) return;

  const strainClass = `strain-${String(state.contract.strain || "").toLowerCase()}`;
  els.contractRevealBid.className = `contract-reveal-bid ${strainClass}`;
  els.contractRevealBid.innerHTML = "";
  render.appendBidContent(els.contractRevealBid, state.contract, "contract-reveal-strain");
  els.contractRevealBid.setAttribute("aria-label", helpers.formatBid(state.contract));

  els.contractRevealMeta.hidden = true;
  els.contractRevealMeta.textContent = "";
  els.contractRevealLead.hidden = true;
  els.contractRevealLead.textContent = "";
  els.contractReveal.dataset.strainSymbol = suitSymbols[state.contract.strain] || state.contract.strain;
  els.contractReveal.setAttribute("aria-label", `${helpers.formatBid(state.contract)} door ${helpers.seatName(state.declarer)}. Klik of druk op Enter om te spelen.`);
}

    Object.assign(render, { renderContractReveal });
  };
})(typeof globalThis !== "undefined" ? globalThis : this);

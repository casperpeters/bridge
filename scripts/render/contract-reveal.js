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
  appendBidContent(els.contractRevealBid, state.contract, "contract-reveal-strain");
  els.contractRevealBid.setAttribute("aria-label", formatBid(state.contract));

  const declarerTeam = teamOf(state.declarer);
  const roleText = declarerTeam === "NS"
    ? `${seatName(state.declarer)} speelt. ${seatName(state.dummy)} wordt dummy.`
    : `${seatName(state.declarer)} speelt. Jij verdedigt als Zuid.`;
  els.contractRevealMeta.textContent = roleText;
  els.contractRevealLead.textContent = `${seatName(state.leader)} komt uit ${separatorDot} nodig: ${state.contract.level + 6} slagen`;
  els.contractReveal.dataset.strainSymbol = suitSymbols[state.contract.strain] || state.contract.strain;
  els.contractReveal.setAttribute("aria-label", `${formatBid(state.contract)} door ${seatName(state.declarer)}. Klik of druk op Enter om te spelen.`);
}

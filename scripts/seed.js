function loadSeedFromInput() {
  const seed = normalizeSeed(els.seedInput.value);
  if (!seed) {
    state.seedMessage = t("seedRequired");
    renderSeedControls();
    return;
  }
  state.seedMessage = t("seedLoaded");
  if (globalThis.PracticeHands?.findPracticeHand(seed)) {
    startPracticeHand(seed, { preserveBoard: true });
    return;
  }
  startHand({ seed, preserveBoard: true });
}

async function copyCurrentSeed() {
  if (!state.dealSeed) return;
  try {
    await copyText(state.dealSeed);
    state.seedMessage = t("seedCopied");
  } catch {
    state.seedMessage = t("seedCopyFailed");
  }
  renderSeedControls();
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.inset = "0 auto auto 0";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    if (!document.execCommand("copy")) throw new Error("Copy command failed");
  } finally {
    textarea.remove();
  }
}

function normalizeSeed(seed) {
  return String(seed || "").trim().slice(0, 80);
}

function createDealSeed() {
  if (globalThis.crypto?.getRandomValues) {
    const values = new Uint32Array(2);
    globalThis.crypto.getRandomValues(values);
    return `${values[0].toString(36)}${values[1].toString(36)}`;
  }
  return `${Date.now().toString(36)}${Math.floor(Math.random() * 0xFFFFFFFF).toString(36)}`;
}

function renderSeedControls() {
  if (document.activeElement !== els.seedInput) els.seedInput.value = state.dealSeed || "";
  els.copySeed.disabled = !state.dealSeed;
  els.seedDescription.textContent = state.seedMessage || t("seedHelp");
}

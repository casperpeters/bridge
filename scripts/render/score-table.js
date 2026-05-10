(function registerBridgeScoreTable(root) {
  "use strict";

  const modules = root.BridgeAppModules = root.BridgeAppModules || {};
  const scoreTableSuitSymbols = { C: "\u2663", D: "\u2666", H: "\u2665", S: "\u2660" };

  modules.registerScoreTable = function registerScoreTable(runtime) {
    const { render, rules } = runtime;

function renderScoreTable() {
  if (!rules.getScoreTableData) return;
  const data = rules.getScoreTableData();
  renderContractScoreTable(data.contractRows);
  renderOvertrickScoreTable(data.overtrickRows);
  renderUndertrickScoreTable(data.undertrickRows);
}

function renderContractScoreTable(rows) {
  const body = document.querySelector("#contract-score-rows");
  if (!body) return;
  body.innerHTML = "";
  rows.forEach((row) => {
    const tr = document.createElement("tr");
    const label = document.createElement("th");
    label.scope = "row";
    appendContractGroupLabels(label, row.level);
    tr.appendChild(label);
    tr.appendChild(contractScoreCell(row.groups, "notVulnerable"));
    tr.appendChild(contractScoreCell(row.groups, "vulnerable"));
    body.appendChild(tr);
  });
}

function appendContractGroupLabels(cell, level) {
  const groups = [
    ["C", "D"],
    ["H", "S"],
    ["NT"]
  ];
  groups.forEach((strains, index) => {
    strains.forEach((strain, strainIndex) => {
      if (strainIndex > 0) cell.append(" / ");
      cell.appendChild(contractLabel(level, strain));
    });
    if (index < groups.length - 1) cell.appendChild(document.createElement("br"));
  });
}

function contractLabel(level, strain) {
  const fragment = document.createDocumentFragment();
  fragment.append(String(level));
  if (strain === "NT") {
    fragment.append("SA");
    return fragment;
  }
  const suit = document.createElement("span");
  suit.className = strain === "D" || strain === "H" ? "red-suit" : "black-suit";
  suit.textContent = scoreTableSuitSymbols[strain];
  fragment.appendChild(suit);
  return fragment;
}

function contractScoreCell(groups, vulnerabilityKey) {
  const cell = document.createElement("td");
  groups.forEach((group) => {
    const score = group[vulnerabilityKey];
    const item = document.createElement("span");
    item.append(`${score.contractScore} + ${score.bonusScore} = `);
    const total = document.createElement("strong");
    total.textContent = score.total;
    item.appendChild(total);
    cell.appendChild(item);
  });
  return cell;
}

function renderOvertrickScoreTable(rows) {
  const body = document.querySelector("#overtrick-score-rows");
  if (!body) return;
  body.innerHTML = "";
  rows.forEach((row) => {
    const tr = document.createElement("tr");
    const label = document.createElement("th");
    label.scope = "row";
    appendStrainLabels(label, row.strains);
    tr.append(
      label,
      scoreValueCell("Ongedoubleerd", row.undoubled),
      scoreValueCell("Gedoubleerd", row.doubled),
      scoreValueCell("Geredoubleerd", row.redoubled)
    );
    body.appendChild(tr);
  });
}

function renderUndertrickScoreTable(rows) {
  const body = document.querySelector("#undertrick-score-rows");
  if (!body) return;
  body.innerHTML = "";
  rows.forEach((row) => {
    const tr = document.createElement("tr");
    const label = document.createElement("th");
    label.scope = "row";
    label.textContent = row.vulnerable ? "Kwetsbaar" : "Niet kwetsbaar";
    tr.append(
      label,
      scoreValueCell("Ongedoubleerd", row.undoubled),
      scoreValueCell("Gedoubleerd", row.doubled),
      scoreValueCell("Geredoubleerd", row.redoubled)
    );
    body.appendChild(tr);
  });
}

function appendStrainLabels(cell, strains) {
  strains.forEach((strain, index) => {
    if (index > 0) cell.append(" / ");
    if (strain === "NT") {
      cell.append("SA");
      return;
    }
    const suit = document.createElement("span");
    suit.className = strain === "D" || strain === "H" ? "red-suit" : "black-suit";
    suit.textContent = scoreTableSuitSymbols[strain];
    cell.appendChild(suit);
  });
}

function scoreValueCell(label, value) {
  const cell = document.createElement("td");
  cell.dataset.label = label;
  cell.textContent = value;
  return cell;
}

    Object.assign(render, { renderScoreTable });
  };
})(typeof globalThis !== "undefined" ? globalThis : this);

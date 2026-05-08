require("../scripts/feedback-config.js");

const endpoint = String(globalThis.BridgeFeedbackConfig?.endpoint || "").trim();

if (!endpoint) {
  throw new Error("No feedback endpoint configured in scripts/feedback-config.js");
}

async function main() {
  const now = new Date().toISOString();
  const payload = {
    action: "triageSmoke",
    skipEmail: true,
    source: "bridge-app-triage-canary",
    type: "canary",
    typeLabel: "Canary",
    repeatCode: "canary",
    phaseLabel: "Test",
    dealNumber: "canary",
    pageUrl: "node://tests/check-feedback-triage-endpoint.js",
    userAgent: `node ${process.version}`,
    report: "## Triage smoke-test",
    message: `Automatische triage endpoint test ${now}`,
    triageStatus: "Onderzocht",
    category: "smoke-test",
    reproduced: "N.v.t.",
    cause: `Triage smoke-test oorzaak ${now}`,
    fixProposal: `Triage smoke-test fixvoorstel ${now}`,
    fixImplemented: "N.v.t. - triage smoke-test"
  };

  const result = await fetchJson(endpoint, {
    method: "POST",
    body: JSON.stringify(payload)
  });

  if (!result.ok) {
    throw new Error(`Feedback triage endpoint rejected smoke payload: ${JSON.stringify(result)}`);
  }

  assertEqual(result.triage?.cause, payload.cause, "cause");
  assertEqual(result.triage?.fixProposal, payload.fixProposal, "fixProposal");
  assertEqual(result.triage?.fixImplemented, payload.fixImplemented, "fixImplemented");
  assertEqual(result.triage?.triageStatus, payload.triageStatus, "triageStatus");
  assertEqual(result.triage?.category, payload.category, "category");
  assertEqual(result.triage?.reproduced, payload.reproduced, "reproduced");

  const cleanup = await cleanupCanaries();
  if (!cleanup.ok) {
    throw new Error(`Feedback triage endpoint could not clean canary rows: ${JSON.stringify(cleanup)}`);
  }

  console.log(`Feedback triage endpoint OK: row ${result.updatedRow}`);
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Expected JSON from ${url}, got: ${text.slice(0, 300)}`);
  }
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`Expected ${label} to be ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

async function cleanupCanaries() {
  return fetchJson(endpoint, {
    method: "POST",
    body: JSON.stringify({ action: "cleanupCanaries" })
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

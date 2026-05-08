require("../scripts/feedback-config.js");

const endpoint = String(globalThis.BridgeFeedbackConfig?.endpoint || "").trim();

if (!endpoint) {
  throw new Error("No feedback endpoint configured in scripts/feedback-config.js");
}

async function main() {
  const now = new Date().toISOString();
  const payload = {
    source: "bridge-app-canary",
    type: "canary",
    typeLabel: "Canary",
    skipEmail: true,
    message: `Automatische feedback endpoint test ${now}`,
    report: [
      "## Feedback canary",
      "",
      "Type: Canary",
      "Bericht:",
      `Automatische feedback endpoint test ${now}`,
      "",
      "Herhaalcode: canary"
    ].join("\n"),
    repeatCode: "canary",
    phase: "test",
    phaseLabel: "Test",
    dealNumber: "canary",
    vulnerability: "",
    vulnerabilityLabel: "",
    contract: "",
    declarer: "South",
    turnSeat: "North",
    dummyVisible: "Ja",
    lessonId: "les-canary",
    practiceHandId: "canary",
    startMode: "direct-play",
    pageUrl: "node://tests/check-feedback-endpoint.js",
    userAgent: `node ${process.version}`,
    language: "nl",
    createdAt: now
  };

  const health = await fetchJson(endpoint, { method: "GET" });
  if (!health.ok) {
    throw new Error(`Feedback endpoint health check failed: ${JSON.stringify(health)}`);
  }

  const result = await fetchJson(endpoint, {
    method: "POST",
    body: JSON.stringify(payload)
  });

  if (!result.ok) {
    throw new Error(`Feedback endpoint rejected canary payload: ${JSON.stringify(result)}`);
  }

  const cleanup = await cleanupCanaries();
  if (!cleanup.ok) {
    throw new Error(`Feedback endpoint could not clean canary rows: ${JSON.stringify(cleanup)}`);
  }

  console.log(`Feedback endpoint OK: ${health.spreadsheetUrl || endpoint}`);
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

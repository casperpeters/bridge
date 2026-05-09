var SHEET_NAME = "feedback";
var NOTIFY_EMAIL = "casper.peters@gmail.com";
// Optional: paste a Google Sheet ID here to force a specific spreadsheet.
// Leave empty when this script is bound to the feedback spreadsheet.
var SPREADSHEET_ID = "";
var FEEDBACK_HEADERS = [
  "Ontvangen",
  "Status",
  "Rapport",
  "Oorzaak",
  "Fixvoorstel",
  "Fix geimplementeerd"
];

function doPost(e) {
  try {
    var payload = parsePayload_(e);
    if (payload.action === "triageSmoke") {
      return jsonResponse_(triageSmoke_(payload));
    }

    if (payload.action === "cleanupCanaries") {
      return jsonResponse_(cleanupCanaries_());
    }

    if (payload.action === "triage") {
      return jsonResponse_(updateTriage_(payload));
    }

    if (payload.action) {
      throw new Error("Unknown action: " + payload.action);
    }

    var sheet = feedbackSheet_();

    sheet.appendRow([
      new Date(),
      "Nieuw",
      payload.report || "",
      "",
      "",
      ""
    ]);

    if (NOTIFY_EMAIL && !payload.skipEmail) {
      MailApp.sendEmail({
        to: NOTIFY_EMAIL,
        subject: "Bridgetafel feedback: " + (payload.typeLabel || payload.type || "feedback"),
        body: feedbackMailBody_(payload)
      });
    }

    return jsonResponse_({ ok: true, appendedRow: sheet.getLastRow() });
  } catch (error) {
    return jsonResponse_({ ok: false, error: String(error) });
  }
}

function doGet() {
  try {
    var sheet = feedbackSheet_();
    var spreadsheet = sheet.getParent();
    return jsonResponse_({
      ok: true,
      service: "bridge-app-feedback",
      spreadsheetUrl: spreadsheet.getUrl()
    });
  } catch (error) {
    return jsonResponse_({ ok: false, error: String(error) });
  }
}

function parsePayload_(e) {
  var body = e && e.postData && e.postData.contents ? e.postData.contents : "{}";
  return JSON.parse(body);
}

function feedbackSheet_() {
  var spreadsheet = feedbackSpreadsheet_();
  var sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (sheet) {
    ensureFeedbackHeaders_(sheet);
    return sheet;
  }

  sheet = spreadsheet.insertSheet(SHEET_NAME);
  sheet.appendRow(FEEDBACK_HEADERS);
  return sheet;
}

function ensureFeedbackHeaders_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(FEEDBACK_HEADERS);
    return;
  }

  var lastColumn = Math.max(sheet.getLastColumn(), 1);
  var existing = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];

  for (var sourceColumn = 1; sourceColumn <= existing.length; sourceColumn += 1) {
    var sourceHeader = existing[sourceColumn - 1];
    var targetIndex = FEEDBACK_HEADERS.indexOf(sourceHeader);
    var targetColumn = targetIndex + 1;
    if (targetColumn && targetColumn !== sourceColumn) {
      migrateColumnValues_(sheet, sourceColumn, targetColumn, existing[targetColumn - 1]);
      clearColumnValues_(sheet, sourceColumn);
    }
  }

  sheet.getRange(1, 1, 1, FEEDBACK_HEADERS.length).setValues([FEEDBACK_HEADERS]);

  var currentLastColumn = sheet.getLastColumn();
  if (currentLastColumn > FEEDBACK_HEADERS.length) {
    sheet.deleteColumns(FEEDBACK_HEADERS.length + 1, currentLastColumn - FEEDBACK_HEADERS.length);
  }
}

function migrateColumnValues_(sheet, sourceColumn, targetColumn, currentTargetHeader) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  var sourceRange = sheet.getRange(2, sourceColumn, lastRow - 1, 1);
  var targetRange = sheet.getRange(2, targetColumn, lastRow - 1, 1);
  var sourceValues = sourceRange.getValues();
  var targetValues = targetRange.getValues();
  var changed = false;

  for (var row = 0; row < sourceValues.length; row += 1) {
    if (sourceValues[row][0] && (currentTargetHeader !== FEEDBACK_HEADERS[targetColumn - 1] || !targetValues[row][0])) {
      targetValues[row][0] = sourceValues[row][0];
      changed = true;
    }
  }

  if (changed) targetRange.setValues(targetValues);
}

function clearColumnValues_(sheet, column) {
  sheet.getRange(1, column, sheet.getMaxRows(), 1).clearContent();
}

function updateTriage_(payload) {
  var sheet = feedbackSheet_();
  var rowNumber = Number(payload.rowNumber);
  if (!rowNumber || rowNumber < 2 || rowNumber > sheet.getLastRow()) {
    throw new Error("Invalid triage rowNumber: " + payload.rowNumber);
  }

  var headers = headerMap_(sheet);
  setTriageCell_(sheet, rowNumber, headers, "Oorzaak", payload.cause);
  setTriageCell_(sheet, rowNumber, headers, "Fixvoorstel", payload.fixProposal);
  setTriageCell_(sheet, rowNumber, headers, "Fix geimplementeerd", payload.fixImplemented);
  return {
    ok: true,
    updatedRow: rowNumber,
    triage: triageValues_(sheet, rowNumber, headers)
  };
}

function triageSmoke_(payload) {
  var sheet = feedbackSheet_();
  sheet.appendRow([
    new Date(),
    "Nieuw",
    "## Triage smoke-test",
    "",
    "",
    ""
  ]);

  return updateTriage_({
    rowNumber: sheet.getLastRow(),
    cause: payload.cause || "Triage smoke-test: oorzaakkolom werkt.",
    fixProposal: payload.fixProposal || "Triage smoke-test: fixvoorstelkolom werkt.",
    fixImplemented: payload.fixImplemented || "N.v.t. - triage smoke-test"
  });
}

function cleanupCanaries_() {
  var sheet = feedbackSheet_();
  var headers = headerMap_(sheet);
  var reportColumn = headers["Rapport"];
  var deletedRows = 0;

  for (var rowNumber = sheet.getLastRow(); rowNumber >= 2; rowNumber -= 1) {
    var report = reportColumn ? String(sheet.getRange(rowNumber, reportColumn).getValue()) : "";
    if (report.indexOf("canary") !== -1 || report.indexOf("Triage smoke-test") !== -1 || report.indexOf("Feedback canary") !== -1) {
      sheet.deleteRow(rowNumber);
      deletedRows += 1;
    }
  }

  return { ok: true, deletedRows: deletedRows };
}

function headerMap_(sheet) {
  var values = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var map = {};
  for (var i = 0; i < values.length; i += 1) {
    map[values[i]] = i + 1;
  }
  return map;
}

function setTriageCell_(sheet, rowNumber, headers, columnName, value) {
  var column = headers[columnName];
  if (!column) throw new Error("Missing triage column: " + columnName);
  sheet.getRange(rowNumber, column).setValue(value || "");
}

function triageValues_(sheet, rowNumber, headers) {
  return {
    cause: sheet.getRange(rowNumber, headers["Oorzaak"]).getValue(),
    fixProposal: sheet.getRange(rowNumber, headers["Fixvoorstel"]).getValue(),
    fixImplemented: sheet.getRange(rowNumber, headers["Fix geimplementeerd"]).getValue()
  };
}

function feedbackSpreadsheet_() {
  if (SPREADSHEET_ID) return SpreadsheetApp.openById(SPREADSHEET_ID);

  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (spreadsheet) return spreadsheet;

  return SpreadsheetApp.create("Bridgetafel feedback");
}

function feedbackMailBody_(payload) {
  return payload.message || "";
}

function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

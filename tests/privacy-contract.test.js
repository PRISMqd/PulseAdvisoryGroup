"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const privacy = fs.readFileSync(path.join(root, "privacy.html"), "utf8");
const service = fs.readFileSync(path.join(root, "service.html"), "utf8");

function mustDisclose(pattern, label) {
  assert.match(privacy, pattern, `privacy notice must disclose ${label}`);
}

test("privacy notice matches the current report and test-checkout data flow", () => {
  mustDisclose(/Workforce Exposure Report test flow/i, "the report-tool boundary");
  mustDisclose(/sessionStorage/, "browser session storage");
  mustDisclose(/browser-local/i, "browser-local persistence");
  mustDisclose(/shared or untrusted browser session/i, "shared-browser risk");
  mustDisclose(/Stripe/, "the external checkout processor");
  mustDisclose(/Checkout creation sends no report-form contents/i, "checkout payload minimization");
  mustDisclose(/same-origin PULSE report API/i, "same-origin report generation");
  mustDisclose(/entitlement and replay-control state separate from report contents/i, "server-side state separation");
  mustDisclose(/Do not enter patient data/i, "sensitive-data prohibition");
  mustDisclose(/September 19, 2026/, "the current effective date");

  assert.match(service, /sessionStorage\.setItem\("pulseReportInputs",JSON\.stringify\(values\(\)\)\)/,
    "implementation still persists report inputs in the disclosed browser session store");
  assert.match(service, /fetch\("api\/create-checkout-session",\{method:"POST",credentials:"same-origin",headers:\{"Content-Type":"application\/json"\},body:"\{\}"\}\)/,
    "checkout creation must continue to omit report-form contents");
  assert.match(service, /fetch\("api\/generate-report",\{method:"POST",credentials:"same-origin"/,
    "paid report generation must remain same-origin");
  assert.doesNotMatch(service, /localStorage\./,
    "report inputs must not silently move from session storage to persistent local storage");
});

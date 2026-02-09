/**
 * Mimic user test: login, upload CSV, create campaign, process exactly 10 companies.
 * Connects to the backend WebSocket to show real-time activity (form found, fields filled,
 * navigation, errors) for each company as it is processed – no need to wait for the end.
 *
 * Usage:
 *   node scripts/mimic-user-process-10.js
 *   (always uses live site https://www.trevnoctilla.com unless USE_LOCAL=1)
 *
 * For local frontend:
 *   USE_LOCAL=1 node scripts/mimic-user-process-10.js
 *
 * Requires: Playwright + ws (npm install playwright ws). Backend must be up for live stream.
 */

const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");
const https = require("https");
const http = require("http");

const USE_LOCAL =
  process.env.USE_LOCAL === "1" || process.env.USE_LOCAL === "true";
const BASE_URL = USE_LOCAL
  ? process.env.BASE_URL || "http://localhost:3000"
  : "https://www.trevnoctilla.com";
const LOGIN_EMAIL = "tshepomtshali89@gmail.com";
const LOGIN_PASSWORD = "Kopenikus0218!";
const PROCESS_LIMIT = 2000;
const CSV_PATH = path.join(__dirname, "fixtures", "full-aura.csv");
const WAIT_FOR_PROCESSING_MS = Number.MAX_SAFE_INTEGER; // no time limit — poll until all companies reach terminal status
const POLL_INTERVAL_MS = 8000;

const TERMINAL_STATUSES = [
  "completed",
  "success",
  "contact_info_found",
  "failed",
  "no_contact_found",
  "captcha",
];
const STUCK_THRESHOLD_SEC = 90; // warn if no new completion for this long while someone still processing
// Backend enforces 90s per-company; no single company can run that long. This is only for "backend died / DB row stuck".
const STUCK_AS_DONE_THRESHOLD_SEC = 2 * 60; // 2 min with 1 stuck "processing" = assume backend died; give up (user would never spend 2 min on one site)

const BACKEND_SSE_BASE = BASE_URL; // Now proxied through next.config.js for reliability

/** Write stream for real-time log file (set at start of run()). */
let logStream = null;
/** Path to current run's log file (for reference). */
let logFilePath = null;

function log(msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${msg}`;
  console.log(line);
  if (logStream) {
    logStream.write(line + "\n");
  }
}

/** Write a line to both console and log file (for report section). */
function out(s) {
  const str = String(s);
  console.log(str);
  if (logStream) {
    logStream.write(str + (str.endsWith("\n") ? "" : "\n"));
  }
}

function formatSec(s) {
  if (s < 60) return Math.round(s) + "s";
  const m = Math.floor(s / 60);
  const sec = Math.round(s % 60);
  return sec > 0 ? `${m}m ${sec}s` : `${m}m`;
}

function connectLiveStream(campaignId, stateObj) {
  const sseUrl = BACKEND_SSE_BASE + "/sse/campaign/" + campaignId;
  log("Connecting to backend live stream (SSE): " + sseUrl);
  
  const url = new URL(sseUrl);
  const client = url.protocol === "https:" ? https : http;
  
  const options = {
    headers: {
      'Accept': 'text/event-stream',
    }
  };

  const req = client.get(sseUrl, options, (res) => {
    log("[Stream] Connected – receiving SSE updates.");
    
    let buffer = "";
    res.on("data", (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split("\n");
      // Keep the last (potentially partial) line in the buffer
      buffer = lines.pop(); 
      
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const dataStr = line.slice(6).trim();
            if (!dataStr) continue;
            const msg = JSON.parse(dataStr);
            handleSSEMessage(msg, stateObj);
          } catch (e) {
            // Quietly ignore parse errors for keepalives or heartbeats
          }
        }
      }
    });

    res.on("end", () => {
      log("[Stream] Disconnected (end).");
      if (stateObj) stateObj.disconnected = true;
    });
  });

  req.on("error", (err) => {
    log("[Stream] Error: " + err.message);
    if (stateObj) stateObj.disconnected = true;
  });

  return () => req.abort();
}

function handleSSEMessage(msg, stateObj) {
  const d = msg.data || {};
  if (msg.type === "campaign_start") {
    log("[Stream] Campaign started – total companies: " + (d.total_companies || "?"));
    return;
  }
  if (msg.type === "company_processing") {
    log("[Stream] Now processing: " + (d.company_name || "?") + " | " + (d.company_id || ""));
    return;
  }
  if (msg.type === "activity") {
    const company = (d.company_name || "").trim();
    const level = (d.level || "info").toLowerCase();
    const action = (d.action || "").trim();
    const message = (d.message || d.user_message || "").trim();
    const prefix = company ? "[" + company + "] " : "";
    const line = prefix + "[" + level + "] " + (action ? action + ": " : "") + message;
    log("[Stream] " + line);
    return;
  }
  if (msg.type === "company_completed") {
    log("[Stream] Completed: company_id=" + d.company_id + " status=" + (d.status || "?") + " progress=" + (d.progress || "?") + "%");
    return;
  }
  if (msg.type === "campaign_complete") {
    log("[Stream] Campaign complete.");
    return;
  }
  if (msg.type === "error") {
    log("[Stream] Error: " + (d.message || JSON.stringify(d)));
  }
}

async function run() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error("CSV fixture not found:", CSV_PATH);
    process.exit(1);
  }

  // Create log file for this run (real-time logs for reference)
  const logDir = path.join(__dirname, "..", "mimic-test-logs");
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
  const logFileName =
    "mimic-run-" +
    new Date().toISOString().replace(/:/g, "-").replace(/\..+/, "") +
    ".log";
  logFilePath = path.join(logDir, logFileName);
  logStream = fs.createWriteStream(logFilePath, { flags: "a" });
  logStream.write(
    "Mimic test run started at " + new Date().toISOString() + "\n"
  );
  log("Log file (this run): " + logFilePath);

  log(
    "Target: " +
      BASE_URL +
      (BASE_URL.includes("localhost") ? " (local)" : " (live)")
  );

  let browser;
  let campaignId = null;

  try {
    browser = await chromium.launch({ headless: !!process.env.CI });
    const context = await browser.newContext({ baseURL: BASE_URL });
    const page = await context.newPage();

    // --- 0. First thing ever: go to site and dismiss cookie modal ---
    log("Loading site and dismissing cookie modal...");
    
    // Retry logic for initial navigation to handle cold starts (common on Railway)
    let navigationSuccess = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        log(`Navigation attempt ${attempt} to /auth/login (90s timeout)...`);
        await page.goto("/auth/login", { timeout: 90000, waitUntil: "load" });
        navigationSuccess = true;
        break;
      } catch (e) {
        log(`Navigation attempt ${attempt} failed: ${e.message}`);
        if (attempt === 3) throw e;
        await page.waitForTimeout(5000 * attempt); // Increasing delay between retries
      }
    }

    await page.waitForTimeout(2000);
    const acceptAll = page.locator('button:has-text("Accept All")');
    const rejectAll = page.locator('button:has-text("Reject All")');
    try {
      await acceptAll.first().click({ timeout: 5000 });
      log("Cookie modal dismissed (Accept All)");
    } catch {
      try {
        await rejectAll.first().click({ timeout: 2000 });
        log("Cookie modal dismissed (Reject All)");
      } catch {
        log("No cookie modal found or already dismissed");
      }
    }
    await page.waitForTimeout(1000);

    // --- 1. Login ---
    log("Filling login... (Target: " + page.url() + ")");
    // If not on login page, try to navigate again one last time
    if (!page.url().includes("/auth/login")) {
       log("Not on login page. Forcing navigation...");
       await page.goto("/auth/login", { timeout: 60000 });
    }
    
    await page.waitForSelector('input[name="email"]', { timeout: 20000 });
    await page.fill('input[name="email"]', LOGIN_EMAIL);
    await page.fill('input[name="password"]', LOGIN_PASSWORD);
    
    log("Clicking login button...");
    await page.waitForSelector('button[type="submit"]', { timeout: 5000 });
    await page.click('button[type="submit"]', { force: true });
    
    log("Waiting for navigation away from login...");
    await page
      .waitForURL((url) => !url.href.includes("/auth/login"), { timeout: 30000 })
      .catch(() => {
        log("Timed out waiting for URL change. Current URL: " + page.url());
      });
      
    await page.waitForTimeout(2000);
    if (page.url().includes("/auth/login")) {
      const errText = await page
        .locator(".text-red-200, .text-red-400, [class*='error'], [role='alert']")
        .first()
        .textContent()
        .catch(() => "");
      throw new Error("Login failed: " + (errText?.trim() || "still on login page at " + page.url()));
    }
    log("Login OK (Navigated to: " + page.url() + ")");

    // --- 1b. Wait for dashboard to refresh (script does not refresh; dashboard refreshes itself) ---
    log("Waiting 10s for dashboard to refresh...");
    await page.waitForTimeout(10000);
    log("Dashboard wait done.");

    // --- 1d. Log usage (daily limit, tier) so we can see if enterprise is unlimited ---
    try {
      const token = await page.evaluate(() =>
        localStorage.getItem("auth_token")
      );
      const userDataRaw = await page.evaluate(() =>
        localStorage.getItem("user_data")
      );
      let userData = null;
      try {
        userData = userDataRaw ? JSON.parse(userDataRaw) : null;
      } catch (_) {}
      log(
        "Auth: token=" +
          (token ? "present" : "MISSING") +
          " user_data=" +
          (userData
            ? userData.email + " tier=" + (userData.subscription_tier || "?")
            : "MISSING")
      );
      if (token) {
        const usageRes = await page.request.get("/api/campaigns/usage", {
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
        });
        if (usageRes.ok()) {
          const usage = await usageRes.json();
          log(
            "Usage: daily_limit=" +
              usage.daily_limit +
              " daily_used=" +
              usage.daily_used +
              " unlimited=" +
              !!usage.unlimited +
              " daily_remaining=" +
              (usage.daily_remaining ?? "N/A")
          );
          if (
            !usage.unlimited &&
            (usage.daily_remaining === 0 ||
              (usage.daily_remaining != null &&
                usage.daily_remaining < PROCESS_LIMIT))
          )
            log(
              "WARN: Low or zero daily_remaining – enterprise should have unlimited."
            );
        } else {
          log(
            "Usage API failed: " +
              usageRes.status() +
              " " +
              (await usageRes.text()).slice(0, 200)
          );
        }
      }
    } catch (e) {
      log("Could not fetch usage: " + e.message);
    }

    // --- 1c. If we got sent back to login, enter details again and login again ---
    if (page.url().includes("/auth/login")) {
      log("Redirected back to login; entering details and logging in again...");
      await page.fill('input[name="email"]', LOGIN_EMAIL);
      await page.fill('input[name="password"]', LOGIN_PASSWORD);
      await page.click('button[type="submit"]');
      await page
        .waitForURL(/^(?!.*\/auth\/login).*$/, { timeout: 20000 })
        .catch(() => {});
      await page.waitForTimeout(2000);
      if (page.url().includes("/auth/login")) {
        const errText = await page
          .locator(".text-red-200, .text-red-400")
          .first()
          .textContent()
          .catch(() => "");
        throw new Error(
          "Re-login failed: " + (errText || "still on login page")
        );
      }
      log("Re-login OK");
      log("Waiting 10s for dashboard to refresh...");
      await page.waitForTimeout(10000);
    }

    // --- 2. Upload CSV ---
    log("Navigating to campaign upload...");
    if (page.url().includes("/auth/login")) {
      log("On login page before upload; logging in again...");
      await page.fill('input[name="email"]', LOGIN_EMAIL);
      await page.fill('input[name="password"]', LOGIN_PASSWORD);
      await page.click('button[type="submit"]');
      await page
        .waitForURL(/^(?!.*\/auth\/login).*$/, { timeout: 20000 })
        .catch(() => {});
      if (page.url().includes("/auth/login"))
        throw new Error("Re-login before upload failed");
      log("Re-login OK");
      log("Waiting 10s for dashboard to refresh...");
      await page.waitForTimeout(10000);
    }
    await page.goto("/campaigns/upload");
    await page.waitForTimeout(1000);
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(CSV_PATH);
    await page.waitForSelector("text=Upload Complete", { timeout: 15000 });
    log("Upload OK");
    await page.click('button:has-text("Create Message Template")');
    await page.waitForURL(/\/campaigns\/create/, { timeout: 10000 });
    log("Navigate to create OK");

    // --- 3. Create campaign (fill form and submit) ---
    await page.waitForSelector("#campaignName", { timeout: 5000 });
    await page.fill("#campaignName", "Mimic Test " + Date.now());
    await page.fill('input[placeholder*="First Name"]', "Test");
    await page.fill('input[placeholder*="Last Name"]', "User");
    await page.fill('input[placeholder*="Your Company"]', "Test Co");
    await page.fill('input[placeholder*="Your Email"]', "test@example.com");
    await page.fill('input[placeholder*="Your Phone"]', "+27123456789");
    await page.selectOption("select", { label: "South Africa" });
    await page.fill('input[placeholder*="Address"]', "123 Test St");
    await page.fill('input[placeholder*="Subject"]', "Partnership");
    await page.fill("#message", "Hello, this is a test.");
    await page.waitForTimeout(1000);
    const submitBtn = page.locator(
      'button[type="submit"]:has-text("Create Campaign")'
    );
    await submitBtn.waitFor({ state: "visible", timeout: 5000 });
    await page
      .waitForFunction(
        () => {
          const b = document.querySelector('button[type="submit"]');
          return b && !b.disabled;
        },
        { timeout: 5000 }
      )
      .catch(() => {});
    await submitBtn.click();
    try {
      await page.waitForURL(url => url.pathname.startsWith('/campaigns/') && !url.pathname.endsWith('/create'), { timeout: 30000 });
    } catch (e) {
      const url = page.url();
      const bodyText = await page
        .locator("body")
        .innerText()
        .catch(() => "");
      const errEl = page.locator('.bg-red-500\\/10, [class*="text-red"]');
      const errText = await errEl
        .first()
        .textContent()
        .catch(() => "");
      log("Create campaign FAILED or timed out. URL: " + url);
      if (errText) log("Page error message: " + errText.trim());
      log("Page snippet (first 500 chars): " + bodyText.slice(0, 500));
      if (bodyText.includes("Daily limit") || bodyText.includes("daily limit"))
        log("ERROR: Daily limit reached – enterprise should not have limits.");
      throw new Error(
        "Create campaign did not redirect to campaign page: " +
          (errText ? errText.trim() : url)
      );
    }
    const match = page.url().match(/\/campaigns\/((?!create)[a-zA-Z0-9_-]+)/);
    campaignId = match ? match[1] : null;
    if (!campaignId)
      throw new Error("Could not get campaign ID from URL: " + page.url());
    log("Campaign created: " + campaignId);

    // --- 4. Start processing (connect to backend live stream first so we see every step) ---
    await page.waitForTimeout(2000);
    const streamState = { disconnected: false };
    const closeStream = connectLiveStream(campaignId, streamState);
    // Wait for companies to load before opening Rapid All — otherwise frontend sends company_ids: [] and backend never starts
    const rapidAllBtn = page.locator('button:has-text("Rapid All")').first();
    await rapidAllBtn.waitFor({ state: "visible", timeout: 10000 });
    await page
      .waitForFunction(
        () => {
          const buttons = Array.from(document.querySelectorAll("button"));
          return buttons.some((btn) =>
            /Rapid All\s*\(\s*\d+/.test(btn.textContent || "")
          );
        },
        { timeout: 60000 }
      )
      .catch(() => null);
    const hasCount = await page
      .locator('button:has-text("Rapid All")')
      .first()
      .evaluate((el) => /Rapid All\s*\(\s*\d+/.test(el?.textContent || ""));
    if (!hasCount) {
      log(
        "WARNING: Companies list may not have loaded yet (Rapid All button has no count). Proceeding anyway."
      );
    } else {
      log("Companies loaded (Rapid All shows pending count). Opening modal.");
    }
    await rapidAllBtn.click();
    await page.waitForSelector("text=Set Processing Limit", { timeout: 5000 });
    await page.fill('input[type="number"]', String(PROCESS_LIMIT));

    const skipSubmit = process.argv.includes("--skip-submit") || process.argv.includes("--no-submit");
    if (skipSubmit) {
      log("--skip-submit: set flag and clicking Start (fill forms but do not submit).");
      await page.evaluate(() => localStorage.setItem("trevnoctilla_skip_submit", "1"));
    }
    await page.click('button:has-text("Start (' + PROCESS_LIMIT + ')")');
    await page.waitForTimeout(2000);
    const bodyAfterStart = await page
      .locator("body")
      .innerText()
      .catch(() => "");
    if (
      bodyAfterStart.includes("Daily limit reached") ||
      bodyAfterStart.includes("daily limit")
    ) {
      log(
        "ERROR: Daily limit reached after Start – enterprise should have unlimited. Backend should have logged tier/daily_used."
      );
      log("Page snippet: " + bodyAfterStart.slice(0, 400));
    }
    log("Started processing " + PROCESS_LIMIT + " companies...");

    // --- 5. Wait for processing to finish (poll API) ---
    const startWait = Date.now();
    let allDone = false;
    let stoppedBecausePageClosed = false;
    let lastCompanies = [];
    let lastTerminalCount = 0;
    let lastProgressAt = startWait;
    let pollCount = 0;
    let pageClosed = false; // after page close we keep polling via fetch (processing continues on server)
    let authToken = null;
    const loggedFailedIds = new Set();
    const POLL_REQUEST_TIMEOUT_MS = 120000; // 2 min per request — do not crash on slow API
    while (Date.now() - startWait < WAIT_FOR_PROCESSING_MS) {
      // Use setTimeout so we don't throw if page/context/browser is closed during sleep
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
      if (streamState.disconnected && !streamState.disconnectLogged) {
        log("Stream disconnected; continuing to poll for progress.");
        streamState.disconnectLogged = true;
      }
      pollCount++;
      let companies = [];
      if (pageClosed) {
        // Poll via fetch so we keep running after user closed the tab (processing continues on server)
        if (!authToken) {
          log("Page closed before any successful poll; cannot continue (need auth). Stopping.");
          stoppedBecausePageClosed = true;
          break;
        }
        try {
          const controller = new AbortController();
          const t = setTimeout(() => controller.abort(), POLL_REQUEST_TIMEOUT_MS);
          const res = await fetch(BASE_URL + "/api/campaigns/" + campaignId + "/companies", {
            headers: { Authorization: "Bearer " + authToken },
            signal: controller.signal,
          });
          clearTimeout(t);
          if (!res.ok) {
            log("Companies API error: " + res.status + " (poll #" + pollCount + ")");
            continue;
          }
          const data = await res.json();
          companies = data.companies || [];
        } catch (fetchErr) {
          const msg = (fetchErr && fetchErr.message) || String(fetchErr);
          log("Poll #" + pollCount + " failed (background): " + msg);
          continue;
        }
      } else {
        try {
          const token = await page.evaluate(() =>
            localStorage.getItem("auth_token")
          );
          authToken = token;
          const headers = { "Content-Type": "application/json" };
          if (token) headers["Authorization"] = "Bearer " + token;
          const res = await page.request.get(
            "/api/campaigns/" + campaignId + "/companies",
            { headers, timeout: POLL_REQUEST_TIMEOUT_MS }
          );
          if (!res.ok()) {
            log(
              "Companies API error: " +
                res.status() +
                " (poll #" +
                pollCount +
                ")"
            );
            continue;
          }
          const data = await res.json();
          companies = data.companies || [];
        } catch (pollErr) {
          const msg = (pollErr && pollErr.message) || String(pollErr);
          if (/Target page|context or browser has been closed|Execution context was destroyed/i.test(msg)) {
            log("Page/context closed; continuing to poll in background (processing continues on server).");
            pageClosed = true;
            if (!authToken) {
              log("No auth token saved; cannot continue polling. Stopping.");
              stoppedBecausePageClosed = true;
              break;
            }
            continue;
          }
          log(
            "Poll #" +
              pollCount +
              " failed (will retry): " +
              msg
          );
          continue;
        }
      }
      lastCompanies = companies;
      const processing = companies.filter((c) => c.status === "processing");
      const terminal = companies.filter((c) =>
        TERMINAL_STATUSES.includes(c.status)
      );
      const now = Date.now();
      const elapsedSec = (now - startWait) / 1000;
      const sinceLastProgressSec = (now - lastProgressAt) / 1000;

      // When nothing is moving, log what the API actually returned (so we can see empty vs all-pending)
      if (
        terminal.length === 0 &&
        processing.length === 0 &&
        companies.length >= 0
      ) {
        const byStatus = {};
        companies.forEach((c) => {
          const s = c.status || "undefined";
          byStatus[s] = (byStatus[s] || 0) + 1;
        });
        if (pollCount === 1 || pollCount % 6 === 0)
          log(
            "  [API] companies returned: " +
              companies.length +
              " | by status: " +
              JSON.stringify(byStatus)
          );
      }

      if (terminal.length > lastTerminalCount) {
        lastProgressAt = now;
        log(
          "Progress: " +
            terminal.length +
            " terminal (one just finished; " +
            formatSec(sinceLastProgressSec) +
            " since previous) | elapsed " +
            formatSec(elapsedSec)
        );
        lastTerminalCount = terminal.length;
      }

      log(
        "Status: " +
          terminal.length +
          " terminal, " +
          processing.length +
          " processing | elapsed " +
          formatSec(elapsedSec) +
          " | since last completion: " +
          formatSec(sinceLastProgressSec)
      );
      if (processing.length > 0) {
        const current = processing[0];
        log(
          "  Current: " +
            (current.company_name || "Unknown") +
            " | " +
            (current.website_url || "—")
        );
      }
      if (
        sinceLastProgressSec >= STUCK_THRESHOLD_SEC &&
        processing.length > 0
      ) {
        log(
          "  STUCK? No progress for " +
            formatSec(sinceLastProgressSec) +
            " (still " +
            terminal.length +
            " terminal, " +
            processing.length +
            " processing)"
        );
      }
      // One company stuck "processing" for 5+ min = backend died or DB never updated (backend has 90s per-company timeout)
      if (
        sinceLastProgressSec >= STUCK_AS_DONE_THRESHOLD_SEC &&
        processing.length === 1 &&
        terminal.length >= PROCESS_LIMIT - 1
      ) {
        log(
          "  STUCK " + (STUCK_AS_DONE_THRESHOLD_SEC / 60) + " min on one company (" +
            (processing[0].company_name || "?") +
            "). Backend likely died. Treating run as done. Reset the stuck company from the campaign UI if needed."
        );
        allDone = true;
        break;
      }
      const failed = companies.filter((c) => c.status === "failed");
      failed.forEach((f) => {
        const id = f.id;
        if (id && !loggedFailedIds.has(id)) {
          loggedFailedIds.add(id);
          const err = (f.error_message || "").trim() || "—";
          log(
            "  Failed (new): " +
              (f.company_name || f.id) +
              " | " +
              (f.website_url || "—") +
              " | " +
              err
          );
        }
      });

      if (terminal.length >= PROCESS_LIMIT) {
        allDone = true;
        break;
      }
    }

    if (!allDone) {
      if (stoppedBecausePageClosed) {
        log(
          "Stopped: page/context/browser was closed (e.g. backend closed or WebSocket dropped). Last poll had " +
            lastTerminalCount +
            " terminal."
        );
      } else {
        const elapsedMin = (Date.now() - startWait) / 60000;
        log(
          "TIMEOUT: Processing did not complete within " +
            elapsedMin.toFixed(1) +
            " min (got " +
            lastTerminalCount +
            " terminal, " +
            lastCompanies.filter((c) => c.status === "processing").length +
            " still processing)"
        );
      }
    }
    closeStream();

    // --- 6. Report ---
    const companies = lastCompanies;
    const byStatus = {};
    companies.forEach((c) => {
      byStatus[c.status] = (byStatus[c.status] || 0) + 1;
    });
    const terminalCount = companies.filter((c) =>
      TERMINAL_STATUSES.includes(c.status)
    ).length;
    const allTenTerminal = terminalCount >= PROCESS_LIMIT;
    const allTenProcessed =
      companies.length >= PROCESS_LIMIT &&
      companies.filter((c) => c.status !== "pending").length >= PROCESS_LIMIT;

    const totalElapsedSec = (Date.now() - startWait) / 1000;
    out("\n========== RESULT (summary) ==========");
    out("Campaign ID: " + campaignId);
    out("Total time: " + formatSec(totalElapsedSec));
    out("Status counts: " + JSON.stringify(byStatus, null, 2));
    out("All " + PROCESS_LIMIT + " in terminal status: " + (allTenTerminal ? "YES" : "NO"));

    // --- MAIN REFERENCE: Form fields and how the system handled each form ---
    out("\n========== FORM FIELDS & HOW EACH SITE WAS HANDLED ==========");
    out(
      "Use this section to see each website's form fields and how the system filled (or did not fill) them."
    );
    out("");

    companies.slice(0, PROCESS_LIMIT).forEach((c, i) => {
      const fs = c.form_structure || {};
      const detected = Array.isArray(fs.fields_detected)
        ? fs.fields_detected
        : [];
      const filled = Array.isArray(fs.fields_filled) ? fs.fields_filled : [];
      const hasFormData = detected.length > 0 || filled.length > 0;

      out("----------------------------------------");
      out("Company " + (i + 1) + ": " + (c.company_name || "Unknown"));
      out("Website: " + (c.website_url || "—"));
      out("Status: " + (c.status || "—"));
      out(
        "Outcome: " +
          (c.status === "completed"
            ? "Form submitted"
            : c.status === "no_contact_found"
            ? "No form found"
            : c.status === "contact_info_found"
            ? "Contact info only (no form)"
            : c.status === "failed"
            ? "Failed: " + ((c.error_message || "").trim() || "—")
            : (c.error_message || "").trim() || c.status || "—")
      );

      if (hasFormData) {
        out("");
        out("  FIELDS DETECTED (on page):");
        if (detected.length > 0) {
          detected.forEach((f) => {
            const parts = [f.name, f.label, f.type].filter(Boolean);
            out(
              "    - " + (parts.length ? parts.join(" | ") : JSON.stringify(f))
            );
          });
        } else {
          out("    (from filled list only; detected list not stored)");
        }
        out("");
        out("  FIELDS FILLED (how the system handled them):");
        if (filled.length > 0) {
          filled.forEach((f) => {
            const role = f.role || "—";
            const nameLabel =
              [f.name, f.label].filter(Boolean).join(" / ") || "—";
            const value = f.value != null ? String(f.value) : "—";
            out(
              "    - " + role + " → " + nameLabel + ' → value: "' + value + '"'
            );
          });
        } else {
          out("    (none)");
        }
        const isFilled = (d) =>
          filled.some((f) => {
            const fn = (f.name || "").toLowerCase().trim();
            const fl = (f.label || "").toLowerCase().trim();
            const dn = (d.name || "").toLowerCase().trim();
            const dl = (d.label || "").toLowerCase().trim();
            return (
              (fn && (fn === dn || fn === dl)) ||
              (fl && (fl === dn || fl === dl))
            );
          });
        const notFilled = detected.filter((d) => !isFilled(d));
        if (notFilled.length > 0) {
          out("");
          out("  FIELDS NOT FILLED (missing or skipped):");
          notFilled.forEach((f) => {
            const desc = [f.name, f.label, f.type].filter(Boolean).join(" / ");
            out("    - " + (desc || JSON.stringify(f)));
          });
        }
      } else {
        out("");
        out("  Form: no form data (no form found, or not stored).");
        if (c.status === "failed" && (c.error_message || "").trim()) {
          out("  Error: " + (c.error_message || "").trim());
        }
      }
      out("");
    });

    out("========================================");
    const failedList = companies.filter((c) => c.status === "failed");
    const noContact = companies.filter((c) => c.status === "no_contact_found");
    if (failedList.length > 0 || noContact.length > 0) {
      out("\n--- What went wrong ---");
      failedList.forEach((c) => {
        out(
          "  FAILED: " +
            (c.company_name || c.id) +
            " | " +
            (c.website_url || "—")
        );
        out("    " + ((c.error_message || "").trim() || "No error message"));
      });
      if (noContact.length > 0 && noContact.length <= 5) {
        noContact.forEach((c) => {
          out(
            "  NO_CONTACT: " +
              (c.company_name || c.id) +
              " | " +
              (c.website_url || "—")
          );
        });
      } else if (noContact.length > 5) {
        out("  NO_CONTACT: " + noContact.length + " companies (no form found)");
      }
      out("");
    }

    if (allTenTerminal && allTenProcessed) {
      out(
        "PASS: All " + PROCESS_LIMIT + " companies processed successfully and have correct terminal statuses."
      );
    } else {
      out("FAIL: Not all " + PROCESS_LIMIT + " companies processed or statuses incorrect.");
    }
    out("Log file saved: " + logFilePath);
    out("============================\n");

    const exitCode = allTenTerminal && allTenProcessed ? 0 : 1;
    if (browser) {
      await browser.close().catch(() => {});
    }
    if (logStream) {
      logStream.end();
      logStream = null;
    }
    process.exit(exitCode);
  } catch (err) {
    log("Error: " + err.message);
    console.error(err);
    if (browser) {
      await browser.close().catch(() => {});
    }
    if (logStream) {
      logStream.end();
      logStream = null;
    }
    process.exit(1);
  }
}

run();

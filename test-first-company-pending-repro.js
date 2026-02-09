#!/usr/bin/env node
/**
 * Test script: Reproduce why the first company stays on "Pending" when user clicks Start.
 *
 * - Runs against the frontend (starts dev server if BASE_URL is localhost).
 * - Always closes the website cookie modal first, on every page load.
 * - Navigates to a campaign detail page, clicks Start (Rapid All), then checks
 *   whether the first company row's status changes from Pending to Processing
 *   or stays stuck on Pending.
 *
 * Usage:
 *   node test-first-company-pending-repro.js
 *
 * Env:
 *   BASE_URL       - Frontend URL (default: http://localhost:3000)
 *   CAMPAIGN_ID    - Optional. If set, go directly to /campaigns/CAMPAIGN_ID; else create campaign via upload flow.
 */

const { chromium } = require("playwright");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const http = require("http");
const https = require("https");

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const CAMPAIGN_ID_ENV = process.env.CAMPAIGN_ID;
const MAIN_LEADS_CSV = path.join(__dirname, "main-leads.csv");

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
};
function log(msg, color = "reset") {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

/** Always close the cookie modal first. Call after every page load / navigation. */
async function closeCookieModal(page) {
  const selectors = [
    'button:has-text("Accept All")',
    'button:has-text("Accept")',
    'button:has-text("Got it")',
    'button:has-text("I agree")',
    'button:has-text("Allow")',
    '[data-testid="cookie-accept"]',
    '[aria-label="Accept cookies"]',
    ".cookie-accept",
  ];
  for (const sel of selectors) {
    try {
      const btn = page.locator(sel).first();
      if (await btn.isVisible({ timeout: 1500 })) {
        await btn.click();
        log("  [Cookie modal closed]", "yellow");
        await page.waitForTimeout(300);
        return;
      }
    } catch (_) {}
  }
}

/** Wait until BASE_URL returns 2xx (frontend ready). */
function waitForFrontend(url, maxWaitMs = 120000) {
  const u = new URL(url);
  const client = u.protocol === "https:" ? https : http;
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const req = client.request(
        url,
        { method: "GET", timeout: 5000 },
        (res) => {
          if (res.statusCode >= 200 && res.statusCode < 400) return resolve();
          if (Date.now() - start > maxWaitMs)
            return reject(new Error("Frontend did not become ready"));
          setTimeout(check, 2000);
        }
      );
      req.on("error", () => {
        if (Date.now() - start > maxWaitMs)
          return reject(new Error("Frontend did not become ready"));
        setTimeout(check, 2000);
      });
      req.end();
    };
    check();
  });
}

/** Get the status text of the first company row in the table. */
async function getFirstCompanyStatus(page) {
  // Status column: span with "capitalize" inside the first data row (row that has a link / company cell).
  const statusCell = page
    .locator("div.group.relative.grid span.text-xs.capitalize")
    .first();
  try {
    await statusCell.waitFor({ state: "visible", timeout: 5000 });
    return (await statusCell.innerText()).trim();
  } catch (_) {
    return null;
  }
}

async function runTest() {
  let browser;
  let page;
  let devProcess;

  try {
    log(
      "\n=== Test: First company stays on Pending when user clicks Start ===",
      "bright"
    );
    log(`BASE_URL: ${BASE_URL}`, "cyan");

    // Optionally start frontend when targeting localhost
    if (
      BASE_URL.startsWith("http://localhost") ||
      BASE_URL.startsWith("http://127.0.0.1")
    ) {
      log("Starting frontend (npm run dev)...", "cyan");
      devProcess = spawn("npm", ["run", "dev"], {
        cwd: __dirname,
        stdio: "pipe",
        shell: true,
      });
      devProcess.stderr?.on("data", (d) => process.stderr.write(d));
      log("Waiting for frontend (up to 2 min)...", "yellow");
      await waitForFrontend(BASE_URL, 120000);
      log("Frontend ready.", "green");
      await new Promise((r) => setTimeout(r, 2000));
    }

    browser = await chromium.launch({
      headless: false,
      slowMo: 100,
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    page = await context.newPage();

    let campaignId = CAMPAIGN_ID_ENV;

    if (!campaignId) {
      // Full flow: homepage -> campaigns -> upload -> create -> campaign detail
      log("\n[1] Homepage...", "cyan");
      await page.goto(BASE_URL, {
        waitUntil: "domcontentloaded",
        timeout: 45000,
      });
      await closeCookieModal(page);
      await page.waitForTimeout(500);

      log("[2] Campaigns -> Upload...", "cyan");
      await page
        .locator(
          'header nav a:has-text("Campaigns"), header a:has-text("Campaigns")'
        )
        .first()
        .click();
      await page
        .waitForURL("**/campaigns**", { timeout: 15000 })
        .catch(() => {});
      await closeCookieModal(page);
      await page.waitForTimeout(500);

      await page
        .locator(
          'button:has-text("Create Campaign"), button:has-text("Start Your First Campaign")'
        )
        .first()
        .click();
      await page.waitForURL("**/campaigns/upload", { timeout: 30000 });
      await closeCookieModal(page);
      await page.waitForTimeout(500);

      const csvPath = fs.existsSync(MAIN_LEADS_CSV)
        ? MAIN_LEADS_CSV
        : path.join(__dirname, "mimic_fallback.csv");
      if (!fs.existsSync(csvPath)) {
        fs.writeFileSync(
          csvPath,
          "website_url,company_name\nhttps://example.com,Example Co"
        );
      }
      await page.locator('input[id="file-upload"]').setInputFiles(csvPath);
      await page
        .waitForSelector("text=Upload Complete", { timeout: 30000 })
        .catch(() => {});
      await closeCookieModal(page);
      await page.waitForTimeout(500);

      log("[3] Create message template...", "cyan");
      const createBtn = page
        .locator('button:has-text("Create Message Template")')
        .first();
      await createBtn.waitFor({ state: "visible", timeout: 10000 });
      if (await createBtn.isDisabled().catch(() => false)) {
        const guestBtn = page
          .locator(
            'button:has-text("Continue as Guest"), button:has-text("Use First 5")'
          )
          .first();
        if (await guestBtn.isVisible().catch(() => false))
          await guestBtn.click();
        await page.waitForTimeout(1500);
      }
      await createBtn.click();
      await page.waitForURL("**/campaigns/create", { timeout: 30000 });
      await closeCookieModal(page);
      await page.waitForTimeout(500);

      await page.fill(
        'input[id="campaignName"]',
        `Pending repro ${Date.now()}`
      );
      await page.fill('input[placeholder*="First Name"]', "Test");
      await page.fill('input[placeholder*="Last Name"]', "User");
      await page.fill('input[placeholder*="Company Name"]', "Test Co");
      await page.fill('input[placeholder*="Your Email"]', "test@example.com");
      await page.fill('input[placeholder*="Phone"]', "+44 555 000 0000");
      await page.selectOption("select", "United Kingdom");
      await page.fill('input[placeholder*="Address"]', "123 Test St");
      await page.fill('input[placeholder*="Subject"]', "Test Subject");
      await page.fill('textarea[id="message"]', "Test message.");
      await page.waitForTimeout(300);

      const responsePromise = page.waitForResponse(
        (r) =>
          r.url().includes("/api/campaigns") && r.request().method() === "POST",
        { timeout: 120000 }
      );
      await page.click('button[type="submit"]');
      const res = await responsePromise;
      const data = await res.json().catch(() => ({}));
      campaignId = data.campaign?.id ? String(data.campaign.id) : null;
      if (!campaignId) {
        await page
          .waitForURL(/\/campaigns\/\d+/, { timeout: 15000 })
          .catch(() => {});
        campaignId = page.url().match(/\/campaigns\/(\d+)/)?.[1] || null;
      }
      if (!campaignId) {
        log("Failed to get campaign ID.", "red");
        await browser.close();
        if (devProcess) devProcess.kill();
        process.exit(1);
      }
      log(`  Campaign ID: ${campaignId}`, "green");
    } else {
      log(`\n[1] Going to campaign ${campaignId}...`, "cyan");
      await page.goto(
        `${BASE_URL.replace(/\/$/, "")}/campaigns/${campaignId}`,
        {
          waitUntil: "domcontentloaded",
          timeout: 45000,
        }
      );
      await closeCookieModal(page);
      await page.waitForTimeout(1500);
    }

    // Ensure we're on campaign detail and table is loaded
    await page
      .waitForSelector(
        'button:has-text("Rapid All"), button:has-text("Processing…")',
        { timeout: 15000 }
      )
      .catch(() => {});
    await closeCookieModal(page);
    await page.waitForTimeout(1000);

    const statusBefore = await getFirstCompanyStatus(page);
    log(`\n[2] First company status BEFORE Start: "${statusBefore}"`, "cyan");

    log("[3] Clicking Rapid All...", "cyan");
    const rapidAllBtn = page
      .locator("button")
      .filter({ hasText: /Rapid All/i })
      .first();
    await rapidAllBtn.waitFor({ state: "visible", timeout: 10000 });
    await rapidAllBtn.scrollIntoViewIfNeeded();
    await rapidAllBtn.click();
    await page.waitForTimeout(1500);
    await closeCookieModal(page);

    const startModalBtn = page
      .locator('button:has-text("Start ("), button:has-text("Start")')
      .first();
    if (await startModalBtn.isVisible({ timeout: 5000 })) {
      log("  Clicking Start in modal.", "yellow");
      await startModalBtn.click();
    }
    await page.waitForTimeout(500);

    // Poll first company status: expect it to become "Processing" quickly; if it stays "Pending", bug reproduced
    const delays = [
      { wait: 500, label: "0.5s after Start" },
      { wait: 500, label: "1s after Start" },
      { wait: 1000, label: "2s after Start" },
      { wait: 2000, label: "4s after Start" },
    ];
    let statusAfter = null;
    for (const { wait, label } of delays) {
      await page.waitForTimeout(wait);
      statusAfter = await getFirstCompanyStatus(page);
      log(
        `  ${label}: first company status = "${statusAfter}"`,
        statusAfter && statusAfter.toLowerCase() === "processing"
          ? "green"
          : statusAfter && statusAfter.toLowerCase() === "pending"
          ? "red"
          : "cyan"
      );
    }
    log(
      `\n[4] First company status AFTER Start (4s): "${statusAfter}"`,
      "bright"
    );

    log("\n========== REPRO VERDICT ==========", "bright");
    const stayedPending = (statusAfter || "").toLowerCase() === "pending";
    if (stayedPending) {
      log(
        "BUG REPRODUCED: First company stayed on Pending after clicking Start.",
        "red"
      );
      log(
        "Expected: status should change to Processing (or Completed) shortly after Start.",
        "yellow"
      );
    } else {
      log(
        "First company status changed (no longer Pending). Bug not reproduced in this run.",
        "green"
      );
    }
    log("====================================\n", "bright");

    log("Keeping browser open 8s...", "yellow");
    await page.waitForTimeout(8000);
  } catch (e) {
    log(`Error: ${e.message}`, "red");
    console.error(e);
  } finally {
    if (browser) await browser.close();
    if (devProcess) devProcess.kill();
  }
}

runTest();

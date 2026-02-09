#!/usr/bin/env node
/**
 * Mimic flow with BROWSER VISIBLE to confirm company status changes.
 * Does not modify test-user-mimic-2020.js.
 * Targets PRODUCTION live site by default.
 *
 * Flow: homepage -> campaigns -> upload CSV -> create campaign -> campaign detail
 * -> click Rapid All -> click Start in modal -> poll company statuses in table.
 * Verdict: whether any row moved from Pending to Processing/Completed or stayed stuck.
 *
 * Usage: node test-mimic-headed-status-check.js
 */

const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Always production; ignore BASE_URL so localhost is never used
const BASE_URL = "https://www.trevnoctilla.com";
const MAIN_LEADS_CSV = path.join(__dirname, "main-leads.csv");

async function runTest() {
  let browser;
  let page;
  let csvToUpload = MAIN_LEADS_CSV;

  try {
    log(
      "\n=== Mimic Test (HEADED) – Confirm Company Status Changes ===",
      "bright"
    );
    log(
      `Target: ${BASE_URL} (production live) | Browser will open visibly.`,
      "yellow"
    );
    log("Starting browser (headless: false)...", "cyan");

    browser = await chromium.launch({
      headless: false,
      slowMo: 150,
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });

    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      ignoreHTTPSErrors: true,
    });
    page = await context.newPage();

    // --- Step 1: Homepage ---
    log("\n[1] Homepage...", "cyan");
    await page.goto(BASE_URL, {
      waitUntil: "domcontentloaded",
      timeout: 45000,
    });
    try {
      const cookieBtn = page
        .locator('button:has-text("Accept"), button:has-text("Got it")')
        .first();
      if (await cookieBtn.isVisible({ timeout: 5000 })) await cookieBtn.click();
    } catch (_) {}
    await page.waitForTimeout(500);

    // --- Step 2: Campaigns ---
    log("[2] Campaigns...", "cyan");
    await page
      .locator(
        'header nav a:has-text("Campaigns"), header a:has-text("Campaigns")'
      )
      .first()
      .click();
    try {
      await page.waitForURL("**/campaigns**", {
        timeout: 15000,
        waitUntil: "domcontentloaded",
      });
    } catch (_) {
      await page.goto(`${BASE_URL}/campaigns`, {
        waitUntil: "domcontentloaded",
        timeout: 20000,
      });
    }
    await page.waitForTimeout(1500);

    // --- Step 3: Create campaign -> Upload ---
    log("[3] Upload page...", "cyan");
    await page
      .locator(
        'button:has-text("Create Campaign"), button:has-text("Start Your First Campaign")'
      )
      .first()
      .click();
    await page.waitForURL("**/campaigns/upload", { timeout: 30000 });
    await page.waitForTimeout(500);

    if (!fs.existsSync(MAIN_LEADS_CSV)) {
      const fallback = path.join(__dirname, "mimic_fallback.csv");
      fs.writeFileSync(
        fallback,
        "website_url,company_name\nhttps://www.2020innovation.com,2020 Innovation"
      );
      csvToUpload = fallback;
    }
    await page.locator('input[id="file-upload"]').setInputFiles(csvToUpload);
    await page
      .waitForSelector("text=Upload Complete", { timeout: 30000 })
      .catch(() => {});
    await page.waitForTimeout(500);

    // --- Step 4: Create Message Template -> Create form ---
    log("[4] Create form...", "cyan");
    const createTemplateBtn = page
      .locator('button:has-text("Create Message Template")')
      .first();
    await createTemplateBtn.waitFor({ state: "visible", timeout: 10000 });
    const disabled = await createTemplateBtn.isDisabled().catch(() => false);
    if (disabled) {
      const guestBtn = page
        .locator(
          'button:has-text("Continue as Guest"), button:has-text("Use First 5")'
        )
        .first();
      if (await guestBtn.isVisible().catch(() => false)) await guestBtn.click();
      await page.waitForTimeout(1500);
    }
    await createTemplateBtn.click();
    await page.waitForURL("**/campaigns/create", { timeout: 30000 });
    await page.fill(
      'input[id="campaignName"]',
      `Status check ${new Date().toLocaleTimeString()}`
    );
    await page.fill('input[placeholder="First Name"]', "User");
    await page.fill('input[placeholder="Last Name"]', "Test");
    await page.fill('input[placeholder="Your Company Name"]', "Test Co");
    await page.fill('input[placeholder="Your Email"]', "test@trevnoctilla.com");
    await page.selectOption("select", "United Kingdom");
    await page.fill('textarea[id="message"]', "Test message.");

    // --- Step 5: Submit campaign ---
    log("[5] Submitting campaign...", "cyan");
    const responsePromise = page.waitForResponse(
      (res) =>
        res.url().includes("/api/campaigns") &&
        res.request().method() === "POST",
      { timeout: 120000 }
    );
    await page.click('button[type="submit"]');
    let campaignId = null;
    const urlChanged = await Promise.race([
      page
        .waitForURL(/\/campaigns\/\d+/, {
          timeout: 120000,
          waitUntil: "domcontentloaded",
        })
        .then(() => "url"),
      responsePromise.then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (res.ok() && data.campaign && data.campaign.id) {
          campaignId = String(data.campaign.id);
          return "api";
        }
        return "fail";
      }),
    ]);
    if (urlChanged === "url")
      campaignId = page.url().match(/\/campaigns\/(\d+)/)?.[1] || null;
    if (urlChanged === "api" && campaignId) {
      await page.goto(`${BASE_URL}/campaigns/${campaignId}`, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });
    }
    if (!campaignId) {
      log("Could not get campaign ID after submit.", "red");
      await page.waitForTimeout(5000);
      await browser.close();
      process.exit(1);
    }
    log(`  Campaign ID: ${campaignId}`, "green");
    await page.waitForTimeout(3000);

    // --- Step 6: Rapid All + Start modal ---
    log("[6] Clicking Rapid All then Start in modal...", "cyan");
    const rapidAllBtn = page
      .locator("button")
      .filter({ hasText: /Rapid All/i })
      .first();
    await rapidAllBtn.waitFor({ state: "visible", timeout: 20000 });
    await rapidAllBtn.scrollIntoViewIfNeeded();
    await rapidAllBtn.click();
    await page.waitForTimeout(2000);
    const startBtn = page
      .locator('button:has-text("Start ("), button:has-text("Start")')
      .first();
    if (await startBtn.isVisible({ timeout: 8000 })) {
      log("  Clicking Start in modal.", "green");
      await startBtn.click();
    } else {
      log("  No Start modal found (may already be started).", "yellow");
    }
    await page.waitForTimeout(2000);

    // --- Step 7: Poll status and verdict ---
    log(
      "\n[7] Polling company statuses in table (every 3s, 90s total)...",
      "bright"
    );
    const statusSelector = "span.text-xs.capitalize";
    const pollSeconds = 90;
    const intervalMs = 3000;
    const maxChecks = Math.floor((pollSeconds * 1000) / intervalMs);
    let sawNonPending = false;
    const initialStatuses = [];

    for (let i = 0; i < maxChecks; i++) {
      await page.waitForTimeout(intervalMs);
      let statusTexts = [];
      try {
        statusTexts = await page.locator(statusSelector).allInnerTexts();
      } catch (_) {}

      const trimmed = statusTexts.map((s) => s.trim()).filter(Boolean);
      if (i === 0) initialStatuses.push(...trimmed);
      const pendingCount = trimmed.filter(
        (s) => s.toLowerCase() === "pending"
      ).length;
      const processingCount = trimmed.filter(
        (s) => s.toLowerCase() === "processing"
      ).length;
      const completedCount = trimmed.filter(
        (s) =>
          s.toLowerCase() === "completed" ||
          s.toLowerCase() === "contact info found" ||
          s.toLowerCase().includes("failed")
      ).length;
      if (processingCount > 0 || completedCount > 0) sawNonPending = true;

      const firstFive = trimmed.slice(0, 5).join(", ") || "—";
      log(
        `  Check ${i + 1}/${maxChecks} (${
          (i + 1) * 3
        }s): first 5 = [${firstFive}] | Pending: ${pendingCount}, Processing: ${processingCount}, Other: ${completedCount}`,
        "cyan"
      );
    }

    // Verdict
    log("\n========== VERDICT ==========", "bright");
    if (sawNonPending) {
      log(
        "Statuses CHANGED: at least one company moved from Pending to Processing or Completed.",
        "green"
      );
    } else {
      log(
        "Statuses STUCK ON PENDING: no company showed Processing or Completed within the poll window.",
        "red"
      );
    }
    log("=============================\n", "bright");

    log("Keeping browser open 5s so you can confirm...", "yellow");
    await page.waitForTimeout(5000);
  } catch (e) {
    log(`Error: ${e.message}`, "red");
    console.error(e);
  } finally {
    if (browser) await browser.close();
  }
}

runTest();

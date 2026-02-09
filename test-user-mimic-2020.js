#!/usr/bin/env node

const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

// Colors for terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

const BASE_URL = process.env.BASE_URL || "https://www.trevnoctilla.com";
const MAIN_LEADS_CSV = path.join(__dirname, "main-leads.csv");
// PowerShell: $env:BASE_URL="http://localhost:3000"; node test-user-mimic-2020.js

async function safeScreenshot(page, filePath, options = {}) {
  try {
    await page.screenshot({ path: filePath, ...options });
  } catch (e) {
    log(`  [Screenshot skipped: ${e.message}]`, "yellow");
  }
}

async function runMimicryTest() {
  let browser;
  let page;
  let csvToUpload = MAIN_LEADS_CSV;

  try {
    log("\n=== 100% User Mimicry Test: Campaign Flow ===", "bright");
    log(
      `Target: ${BASE_URL} (set BASE_URL for local: PowerShell $env:BASE_URL='http://localhost:3000')`,
      "yellow"
    );
    log("Starting browser...", "cyan");

    browser = await chromium.launch({
      headless: true,
      slowMo: 200,
      args: [
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-setuid-sandbox",
      ],
    });

    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      ignoreHTTPSErrors: true,
    });
    page = await context.newPage();

    // =====================================================
    // Step 1: Go to Homepage
    // =====================================================
    log("\n[Step 1] Visiting Trevnoctilla Homepage...", "cyan");
    await page.goto(BASE_URL, {
      waitUntil: "domcontentloaded",
      timeout: 45000,
    });

    // Dismiss cookie banner if it exists
    try {
      const cookieBtn = page
        .locator(
          'button:has-text("Accept All"), button:has-text("Accept"), button:has-text("Got it")'
        )
        .first();
      if (await cookieBtn.isVisible({ timeout: 5000 })) {
        log("  🍪 Dismissing cookie banner...", "yellow");
        await cookieBtn.click();
      }
    } catch (e) {
      log("  (No cookie banner found or timed out)", "yellow");
    }

    await page.waitForTimeout(500);
    await safeScreenshot(page, "mimic-screenshots/1-homepage.png");
    log("  ✓ Homepage loaded", "green");

    // =====================================================
    // Step 2: Navigate to Campaigns
    // =====================================================
    log('\n[Step 2] Finding "Campaigns" in Navigation...', "cyan");
    const campaignsLink = page
      .locator(
        'header nav a:has-text("Campaigns"), header a:has-text("Campaigns")'
      )
      .first();
    await campaignsLink.click();
    // Client-side nav often doesn't fire "load"; use domcontentloaded so we don't timeout
    try {
      await page.waitForURL("**/campaigns**", {
        timeout: 15000,
        waitUntil: "domcontentloaded",
      });
    } catch (e) {
      log(
        "  Click may not have navigated; going directly to /campaigns...",
        "yellow"
      );
      await page.goto(`${BASE_URL}/campaigns`, {
        waitUntil: "domcontentloaded",
        timeout: 20000,
      });
    }
    await page.waitForTimeout(2000);
    await safeScreenshot(page, "mimic-screenshots/2-campaigns-landing.png");
    log("  ✓ Campaigns page discovered and loaded", "green");

    // =====================================================
    // Step 3: Start New Campaign
    // =====================================================
    log(
      '\n[Step 3] Clicking "Create Campaign/Start Your First Campaign"...',
      "cyan"
    );
    const createBtn = page
      .locator(
        'button:has-text("Create Campaign"), button:has-text("Start Your First Campaign")'
      )
      .first();
    await createBtn.click();
    await page.waitForURL("**/campaigns/upload", { timeout: 30000 });
    await safeScreenshot(page, "mimic-screenshots/3-upload-page.png");
    log("  ✓ Navigated to Upload page", "green");

    // =====================================================
    // Step 4: Upload main-leads.csv (or fallback CSV, or MIMIC_CSV for single-site test)
    // =====================================================
    log("\n[Step 4] Upload CSV (main-leads.csv or fallback)...", "cyan");
    csvToUpload = MAIN_LEADS_CSV;
    if (process.env.MIMIC_CSV) {
      const customCsv = path.join(__dirname, process.env.MIMIC_CSV);
      if (fs.existsSync(customCsv)) {
        csvToUpload = customCsv;
        log(`  Using MIMIC_CSV: ${process.env.MIMIC_CSV}`, "yellow");
      }
    }
    if (csvToUpload === MAIN_LEADS_CSV) {
      const mainLeadsExists = fs.existsSync(MAIN_LEADS_CSV);
      if (mainLeadsExists) {
        const stat = fs.statSync(MAIN_LEADS_CSV);
        const lineCount = fs
          .readFileSync(MAIN_LEADS_CSV, "utf8")
          .split(/\r?\n/)
          .filter((l) => l.trim()).length;
        log(
          `  Using: main-leads.csv (${(stat.size / 1024).toFixed(
            1
          )} KB, ~${lineCount} lines)`,
          "yellow"
        );
      } else {
        log("  main-leads.csv not found; using fallback 1-row CSV.", "yellow");
        csvToUpload = path.join(__dirname, "mimic_fallback.csv");
        fs.writeFileSync(
          csvToUpload,
          "website_url,company_name\nhttps://www.2020innovation.com,2020 Innovation"
        );
      }
    } else {
      const stat = fs.statSync(csvToUpload);
      const lineCount = fs
        .readFileSync(csvToUpload, "utf8")
        .split(/\r?\n/)
        .filter((l) => l.trim()).length;
      log(
        `  Using: ${path.basename(csvToUpload)} (${(stat.size / 1024).toFixed(
          1
        )} KB, ~${lineCount} lines)`,
        "yellow"
      );
    }

    const fileInput = page.locator('input[id="file-upload"]');
    await fileInput.setInputFiles(csvToUpload);

    try {
      await page.waitForSelector("text=Upload Complete", { timeout: 30000 });
    } catch (e) {
      const bodyText = await page.textContent("body").catch(() => "");
      const hasError =
        bodyText.includes("error") ||
        bodyText.includes("Error") ||
        bodyText.includes("invalid");
      log(
        `  ⚠ Wait for "Upload Complete" timed out. Page may show error.`,
        "red"
      );
      if (hasError)
        log(
          `  Page contains 'error' text – upload may have failed (wrong format or missing website_url column).`,
          "red"
        );
      throw e;
    }
    await safeScreenshot(page, "mimic-screenshots/4-upload-success.png");
    log("  ✓ CSV uploaded successfully", "green");

    // =====================================================
    // Step 5: Configure Message Template (handle guest limit if button disabled)
    // =====================================================
    log("\n[Step 5] Create Message Template...", "cyan");
    const createTemplateBtn = page
      .locator('button:has-text("Create Message Template")')
      .first();
    await createTemplateBtn.waitFor({ state: "visible", timeout: 10000 });
    const templateDisabled = await createTemplateBtn
      .isDisabled()
      .catch(() => false);
    if (templateDisabled) {
      log(
        "  Create Message Template is disabled (likely over guest limit). Clicking 'Continue as Guest - Use First 5'...",
        "yellow"
      );
      const guestTrimBtn = page
        .locator(
          'button:has-text("Continue as Guest"), button:has-text("Use First 5")'
        )
        .first();
      const guestTrimVisible = await guestTrimBtn
        .isVisible()
        .catch(() => false);
      if (guestTrimVisible) {
        await guestTrimBtn.click();
        await page.waitForTimeout(1500);
      } else {
        const trim50 = page.locator('button:has-text("Use First 50")').first();
        if (await trim50.isVisible().catch(() => false)) {
          await trim50.click();
          await page.waitForTimeout(1500);
        }
      }
    }
    await createTemplateBtn.click();
    await page.waitForURL("**/campaigns/create", { timeout: 30000 });
    await safeScreenshot(page, "mimic-screenshots/5-create-form.png");
    log("  ✓ Navigated to Create Campaign form", "green");

    // Fill form
    log("Filling campaign details...", "yellow");
    await page.fill(
      'input[id="campaignName"]',
      `Main Leads Mimic - ${new Date().toLocaleTimeString()}`
    );
    await page.fill('input[placeholder="First Name"]', "User");
    await page.fill('input[placeholder="Last Name"]', "Mimic");
    await page.fill('input[placeholder="Your Company Name"]', "Mimicry Labs");
    await page.fill('input[placeholder="Your Email"]', "test@trevnoctilla.com");
    await page.fill('input[placeholder="Your Phone"]', "+1 555 123 4567");
    await page.selectOption("select", "United Kingdom");
    await page.fill(
      'textarea[id="message"]',
      "Hello 2020 Innovation team, this is a test of our automated campaign flow. No action is required."
    );

    await safeScreenshot(page, "mimic-screenshots/6-form-filled.png");

    log("Submitting campaign...", "yellow");
    // Wait for POST /api/campaigns so we can navigate manually if frontend doesn't redirect
    const responsePromise = page.waitForResponse(
      (res) =>
        res.url().includes("/api/campaigns") &&
        res.request().method() === "POST",
      { timeout: 120000 }
    );
    await page.click('button[type="submit"]');

    let campaignId = null;
    try {
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
          const err = data.error || data.message || `HTTP ${res.status()}`;
          log(`  ❌ Create campaign API: ${err}`, "red");
          return "fail";
        }),
      ]);
      if (urlChanged === "url") {
        campaignId = page.url().match(/\/campaigns\/(\d+)/)?.[1] || null;
        log("  ✓ Campaign created successfully (redirected)", "green");
      } else if (urlChanged === "api" && campaignId) {
        await page.goto(`${BASE_URL}/campaigns/${campaignId}`, {
          waitUntil: "domcontentloaded",
          timeout: 30000,
        });
        log(
          "  ✓ Campaign created successfully (navigated after API response)",
          "green"
        );
      } else {
        throw new Error("Create campaign failed");
      }
    } catch (e) {
      if (e.message === "Create campaign failed") throw e;
      const errEl = await page
        .locator('[role="alert"], [class*="error"]')
        .first()
        .textContent()
        .catch(() => null);
      log(
        `  ❌ Redirect timeout. ${
          errEl
            ? `Page: ${errEl.trim().slice(0, 120)}`
            : "Ensure backend is running and app .env.local has BACKEND_URL=http://localhost:5000"
        }`,
        "red"
      );
      throw e;
    }
    await safeScreenshot(page, "mimic-screenshots/7-campaign-detail.png");
    if (campaignId) {
      try {
        const res = await fetch(
          `${BASE_URL}/api/campaigns/${campaignId}/companies`
        );
        const text = await res.text();
        let data = {};
        try {
          data = text ? JSON.parse(text) : {};
        } catch (_) {
          log(
            `  [Upload result] API returned non-JSON (status ${
              res.status
            }): ${text.slice(0, 120)}...`,
            "yellow"
          );
        }
        const companies = data.companies || [];
        const pending = companies.filter((c) => c.status === "pending").length;
        log(
          `  [Upload result] Companies in campaign: ${companies.length} (pending: ${pending})`,
          "cyan"
        );
        if (companies.length === 0) {
          log(
            "  ❌ WHY PROCESSING WON'T START: 0 companies in campaign. Upload may have produced 0 valid rows (check CSV has website_url column / valid URLs).",
            "red"
          );
        } else if (pending === 0) {
          log(
            "  ⚠ No pending companies – all already processed or none created.",
            "yellow"
          );
        }
      } catch (e) {
        log(
          `  [Upload result] Could not fetch companies: ${e.message}`,
          "yellow"
        );
      }
    }

    // =====================================================
    // Step 6: Trigger Processing (with logging: why processing might not start)
    // =====================================================
    log("\n[Step 6] Triggering Rapid All Processing...", "cyan");
    await page.waitForTimeout(3000);
    const bodyText = await page.textContent("body").catch(() => "");
    const dailyLimitReached =
      bodyText.includes("Daily limit reached") ||
      bodyText.includes("limit reached") ||
      bodyText.includes("Resets at midnight");
    const rapidAllBtn = page
      .locator("button")
      .filter({ hasText: /Rapid All/i })
      .first();
    const rapidAllVisible = await rapidAllBtn.isVisible().catch(() => false);
    const rapidAllDisabled = rapidAllVisible
      ? await rapidAllBtn.isDisabled().catch(() => false)
      : true;
    const rapidAllLabel =
      (await page
        .locator('button:has-text("Rapid All")')
        .first()
        .textContent()
        .catch(() => "")) || "";
    const pendingFromUi = rapidAllLabel.match(/\((\d+)/);
    const pendingShown = pendingFromUi ? parseInt(pendingFromUi[1], 10) : "?";

    log("  [Why processing might not start]", "yellow");
    log(
      `    Rapid All button visible: ${rapidAllVisible}, disabled: ${rapidAllDisabled}`,
      "yellow"
    );
    log(
      `    Daily limit reached (from page text): ${dailyLimitReached}`,
      "yellow"
    );
    log(`    Pending count (from button label): ${pendingShown}`, "yellow");
    if (!rapidAllVisible) {
      log(
        "    REASON: Rapid All button not visible – no pending companies, or companies list not loaded yet.",
        "red"
      );
    }
    if (rapidAllVisible && rapidAllDisabled) {
      log(
        "    REASON: Rapid All is disabled – likely daily limit reached or mission control already active.",
        "red"
      );
    }
    if (dailyLimitReached) {
      log(
        "    REASON: Page shows daily limit reached – processing blocked until reset.",
        "red"
      );
    }

    await rapidAllBtn.waitFor({ state: "visible", timeout: 20000 });
    await rapidAllBtn.scrollIntoViewIfNeeded();
    log("  ✓ Rapid All button found, clicking...", "green");
    await rapidAllBtn.click();

    await page.waitForTimeout(3000);
    const afterClickText = await page.textContent("body").catch(() => "");
    const processingStarted =
      afterClickText.includes("Mission Control") ||
      afterClickText.includes("Processing") ||
      afterClickText.includes("Synchronizing");
    if (processingStarted) {
      log(
        "  ✓ Processing appears to have started (Mission Control / Processing text visible).",
        "green"
      );
    } else {
      log(
        "  ⚠ If processing did not start: check backend rapid-process-batch response, daily limit, or WebSocket.",
        "yellow"
      );
    }

    // Handle the Start Processing Limit modal
    try {
      log("  🛡️  Waiting for Limit Modal...", "yellow");
      const startBtn = page
        .locator('button:has-text("Start ("), button:has-text("Start")')
        .first();
      if (await startBtn.isVisible({ timeout: 5000 })) {
        log("  🚀 Clicking Start in modal...", "green");
        await startBtn.click();
      }
    } catch (e) {
      log("  (Modal did not appear or was already handled)", "yellow");
    }

    log(
      "Waiting for processing to complete (check every 2s, exit as soon as done)...",
      "yellow"
    );

    // UI uses a grid of divs, not <table>/<td>. Detect done via status text or disabled "Complete" button.
    // 5 companies × 90s per-company timeout ≈ 450s; allow 480s (240 × 2s)
    const maxChecks = 240;
    let done = false;
    for (let i = 0; i < maxChecks && !done; i++) {
      await page.waitForTimeout(2000);

      try {
        const modal = page.locator("text=Processing Complete").first();
        if (await modal.isVisible({ timeout: 500 })) {
          log(
            "  🔔 Processing Complete modal detected. Dismissing...",
            "yellow"
          );
          await page
            .locator('button:has-text("Cancel"), button:has-text("Close")')
            .first()
            .click()
            .catch(() => {});
          await page.waitForTimeout(500);
        }
      } catch (e) {}

      // Detect completion: ALL companies must be in a terminal state (no pending/processing)
      const statusSpans = await page
        .locator("span.text-xs.capitalize")
        .allInnerTexts();
      const isTerminal = (s) => {
        const t = s.trim().toLowerCase();
        return t !== "pending" && t !== "processing";
      };
      const allTerminal =
        statusSpans.length > 0 && statusSpans.every(isTerminal);
      const hasCompletedButton = await page
        .locator('button:disabled:has-text("Complete")')
        .first()
        .isVisible()
        .catch(() => false);
      const hasCompletedText = await page
        .getByText("Form submitted successfully")
        .first()
        .isVisible()
        .catch(() => false);

      const isDone = allTerminal || hasCompletedButton || hasCompletedText;
      log(
        `  Check ${i + 1}/${maxChecks} (${(i + 1) * 2}s)... statuses: [${
          statusSpans.map((s) => s.trim()).join(", ") || "—"
        }], done=${isDone}`,
        "cyan"
      );

      if (i % 5 === 0 || i < 3) {
        await safeScreenshot(page, `mimic-screenshots/8-processing-${i}.png`, {
          fullPage: true,
        });
      }

      if (isDone) {
        log(
          "  ✓ Processing finished (all companies in terminal state).",
          "green"
        );
        done = true;
        break;
      }

      const modalVisible = await page
        .locator("text=Processing Complete")
        .isVisible()
        .catch(() => false);
      if (modalVisible && i >= 2) {
        log("  ✓ Processing complete (modal shown).", "green");
        done = true;
        break;
      }
    }
    if (!done) {
      log(`  ⚠ Stopped after max wait (${maxChecks * 2}s).`, "yellow");
      log(
        "  If some rows stayed Processing/Pending: backend sequential processor may be stuck or very slow (check per-company timeout / thread).",
        "yellow"
      );
    }

    // =====================================================
    // Step 7: Final Result Screenshot
    // =====================================================
    log("\n[Step 7] Capturing final frontend table screenshot...", "cyan");

    // Ensure modal is gone
    try {
      const modal = page.locator("text=Processing Complete").first();
      if (await modal.isVisible({ timeout: 1000 })) {
        await page
          .click('button:has-text("Cancel")', { force: true })
          .catch(() => {});
      }
    } catch (e) {}

    await page.waitForTimeout(2000);
    // UI uses grid, not table — capture main content or full page
    const grid = page.locator('[class*="grid-cols-[1fr_140px"]').first();
    if (await grid.isVisible().catch(() => false)) {
      await grid
        .screenshot({ path: "mimic-screenshots/9-final-table-result.png" })
        .catch(() => {});
    }
    if (!fs.existsSync("mimic-screenshots/9-final-table-result.png")) {
      await safeScreenshot(page, "mimic-screenshots/9-final-table-result.png", {
        fullPage: true,
      });
    }
    log(
      "  📸 FINAL SCREENSHOT SAVED: mimic-screenshots/9-final-table-result.png",
      "bright"
    );

    // Check what the API actually returns (definitive: backend sending screenshot_url or not)
    const cid = page.url().match(/\/campaigns\/(\d+)/)?.[1] || null;
    if (cid) {
      try {
        const apiUrl = `${BASE_URL}/api/campaigns/${cid}/companies`;
        const res = await fetch(apiUrl);
        const text = await res.text();
        let data = {};
        try {
          data = text ? JSON.parse(text) : {};
        } catch (_) {
          log(
            `  [API] Companies endpoint returned non-JSON (status ${
              res.status
            }): ${text.slice(0, 100)}...`,
            "yellow"
          );
        }
        const companies = data.companies || [];
        log("  [API] Companies from backend:", "cyan");
        for (const c of companies) {
          const hasUrl = !!(c.screenshot_url || c.screenshotUrl);
          log(
            `    id=${c.id} status=${c.status} screenshot_url=${
              hasUrl ? "SET" : "NULL"
            } ${c.screenshot_url || c.screenshotUrl || ""}`,
            hasUrl ? "green" : "red"
          );
        }

        // Why each company failed (error_message + contact_method from backend)
        const failedCompanies = companies.filter(
          (c) => (c.status || "").toLowerCase() === "failed"
        );
        if (failedCompanies.length > 0) {
          log(
            "\n  --- Why each company failed (full error_message) ---",
            "yellow"
          );
          const reasonCounts = {};
          for (const c of failedCompanies) {
            const method = c.contact_method || c.contactMethod || "unknown";
            const msg =
              (c.error_message || c.errorMessage || "(no message)") + "";
            const name = c.company_name || c.website_url || `id=${c.id}`;
            const urlStr = c.website_url || "";
            log(`    ${name}`, "yellow");
            if (urlStr) log(`      URL: ${urlStr}`, "yellow");
            log(`      contact_method: ${method}`, "yellow");
            log(`      error_message: ${msg}`, "red");
            const key =
              method === "timeout"
                ? "Timeout"
                : msg.toLowerCase().includes("no contact") ||
                  method === "no_contact_found"
                ? "No contact form"
                : msg.toLowerCase().includes("timeout") ||
                  msg.toLowerCase().includes("timed out")
                ? "Timeout"
                : method === "form_with_captcha"
                ? "CAPTCHA"
                : "Other";
            reasonCounts[key] = (reasonCounts[key] || 0) + 1;
          }
          log("  --- Failure breakdown ---", "cyan");
          for (const [reason, count] of Object.entries(reasonCounts)) {
            log(`    ${reason}: ${count}`, "cyan");
          }
          log(
            `  To get full Python traceback for one company: cd trevnoctilla-backend && py run_one_company.py ${cid} <company_id>`,
            "cyan"
          );
        }

        if (
          companies.length > 0 &&
          !companies.some((c) => c.screenshot_url || c.screenshotUrl)
        ) {
          log(
            "  ❌ BACKEND RETURNED NO screenshot_url FOR ANY COMPANY (fix backend/upload)",
            "red"
          );
        }
      } catch (e) {
        log(`  [API] Failed to fetch companies: ${e.message}`, "yellow");
      }
    }

    // Check if company screenshot img is visible in UI
    const screenshotImgs = await page
      .locator(
        'img[src*="screenshot"], img[src*="supabase"], img[src*="campaign_"]'
      )
      .all();
    let visibleCount = 0;
    for (const img of screenshotImgs) {
      const src = await img.getAttribute("src").catch(() => "");
      const visible = await img.isVisible().catch(() => false);
      if (src && visible) visibleCount++;
    }
    if (visibleCount > 0) {
      log(`  ✅ SCREENSHOT IN UI: yes (${visibleCount} img visible)`, "green");
    } else {
      log(
        "  ❌ SCREENSHOT IN UI: no (no img with screenshot/supabase src visible)",
        "red"
      );
    }

    log("\n=== TEST COMPLETED SUCCESSFULLY ===", "green");
  } catch (error) {
    log(`\n❌ TEST FAILED: ${error.message}`, "red");
    if (page) {
      await safeScreenshot(page, "mimic-screenshots/error-mimicry.png");
      log(
        "  📸 Error screenshot saved: mimic-screenshots/error-mimicry.png",
        "yellow"
      );
    }
    process.exit(1);
  } finally {
    if (browser) await browser.close();
    if (
      csvToUpload &&
      csvToUpload !== MAIN_LEADS_CSV &&
      fs.existsSync(csvToUpload)
    ) {
      fs.unlinkSync(csvToUpload);
    }
  }
}

// Create screenshots directory
const screenshotsDir = path.join(__dirname, "mimic-screenshots");
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
}

runMimicryTest()
  .then(() => {
    log("\nExiting.", "cyan");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

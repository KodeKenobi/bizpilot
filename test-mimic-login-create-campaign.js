#!/usr/bin/env node
/**
 * Mimic script: LOGIN on the app, then run campaign flow (upload → create).
 * Verifies that logged-in (enterprise) user does NOT see "Daily limit reached"
 * when submitting the create campaign form.
 *
 * Usage: node test-mimic-login-create-campaign.js
 * Env: BASE_URL (default https://www.trevnoctilla.com), LOGIN_EMAIL, LOGIN_PASSWORD
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

const BASE_URL = process.env.BASE_URL || "https://www.trevnoctilla.com";
const LOGIN_EMAIL = process.env.LOGIN_EMAIL || "tshepomtshali89@gmail.com";
const LOGIN_PASSWORD = process.env.LOGIN_PASSWORD || "Kopenikus0218!";
const CSV_FILE_PATH = path.join(__dirname, "mimic_login_2020.csv");

async function run() {
  let browser;
  let page;

  try {
    log("\n=== Mimic: Login then Create Campaign ===", "bright");
    log(`Target: ${BASE_URL}`, "yellow");
    log(`Login: ${LOGIN_EMAIL}`, "yellow");
    log("Starting browser...", "cyan");

    browser = await chromium.launch({
      headless: true,
      slowMo: 150,
    });
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    page = await context.newPage();

    // --- Step 1: Homepage + cookies ---
    log("\n[Step 1] Homepage + dismiss cookies...", "cyan");
    await page.goto(BASE_URL, {
      waitUntil: "domcontentloaded",
      timeout: 45000,
    });
    try {
      const cookieBtn = page
        .locator(
          'button:has-text("Accept All"), button:has-text("Accept"), button:has-text("Got it")'
        )
        .first();
      if (await cookieBtn.isVisible({ timeout: 5000 })) {
        await cookieBtn.click();
        log("  Dismissed cookie banner", "yellow");
      }
    } catch (e) {}

    // --- Step 2: Login ---
    log("\n[Step 2] Going to Login...", "cyan");
    await page.goto(`${BASE_URL}/auth/login`, {
      waitUntil: "networkidle",
      timeout: 30000,
    });
    await page.waitForSelector('input[name="email"], input#email', {
      timeout: 10000,
    });
    await page.fill('input[name="email"], input#email', LOGIN_EMAIL);
    await page.fill('input[name="password"], input#password', LOGIN_PASSWORD);
    log("  Submitting login...", "yellow");
    await page.click('button[type="submit"]');
    // Login does signIn then setTimeout(1500) then router.push – wait for success or error message
    const successOrError = await Promise.race([
      page
        .waitForSelector("text=Login successful!", { timeout: 14000 })
        .then(() => "success"),
      page
        .waitForSelector("text=Invalid email or password", { timeout: 14000 })
        .then(() => "error"),
    ]).catch(() => "timeout");
    if (successOrError === "error") {
      log("  Invalid email or password.", "red");
      throw new Error("Login failed: Invalid email or password");
    }
    if (successOrError === "timeout") {
      log("  No success/error message in 14s.", "yellow");
    }
    await page.waitForTimeout(2500);
    // Wait for redirect (dashboard, enterprise, or admin)
    try {
      await page.waitForURL(/\/(dashboard|enterprise|admin)(\/|$|\?)/, {
        timeout: 12000,
      });
    } catch (e) {
      const urlAfterLogin = page.url();
      if (urlAfterLogin.includes("/auth/login")) {
        log(`  Still on login page. URL: ${urlAfterLogin}`, "red");
        throw new Error(
          "Login failed: redirect did not happen (check credentials or auth config)"
        );
      }
    }
    log("  Login OK", "green");

    // --- Step 3: Campaigns → Create Campaign → Upload (navigate by click to keep session) ---
    log("\n[Step 3] Campaigns → Create Campaign → Upload...", "cyan");
    const campaignsLink = page
      .locator('header nav a[href*="campaigns"], header a[href*="campaigns"]')
      .first();
    await campaignsLink.waitFor({ state: "visible", timeout: 8000 });
    await campaignsLink.click();
    await page.waitForURL("**/campaigns**", { timeout: 15000 });
    await page.waitForTimeout(1500);
    const createBtn = page
      .locator(
        'button:has-text("Create Campaign"), button:has-text("Start Your First Campaign")'
      )
      .first();
    await createBtn.click();
    await page.waitForURL("**/campaigns/upload**", { timeout: 15000 });
    const csvContent =
      "website_url,company_name\nhttps://www.2020innovation.com,2020 Innovation";
    fs.writeFileSync(CSV_FILE_PATH, csvContent);
    const fileInput = page.locator('input[id="file-upload"]');
    await fileInput.setInputFiles(CSV_FILE_PATH);
    await page.waitForSelector("text=Upload Complete", { timeout: 30000 });
    log("  Upload OK", "green");

    // --- Step 4: Create Message Template → fill form → submit ---
    log("\n[Step 4] Create Message Template → fill form → submit...", "cyan");
    await page.click('button:has-text("Create Message Template")');
    await page.waitForURL("**/campaigns/create**", { timeout: 15000 });
    await page.waitForTimeout(2000);
    // Check for daily limit blocking BEFORE submit (usage bar or disabled button)
    const bodyBefore = await page.textContent("body").catch(() => "");
    const dailyLimitVisible =
      bodyBefore.includes("Daily limit reached") ||
      bodyBefore.includes("limit reached") ||
      bodyBefore.includes("Resets at midnight");
    const submitBtn = page.locator('form button[type="submit"]').first();
    const submitDisabled = await submitBtn.isDisabled().catch(() => false);
    if (dailyLimitVisible || submitDisabled) {
      await page.screenshot({
        path: "mimic-screenshots/login-mimic-daily-limit-blocking.png",
      });
      log(
        "  Daily limit is shown or submit is disabled on create page.",
        "red"
      );
      log(
        "  Screenshot: mimic-screenshots/login-mimic-daily-limit-blocking.png",
        "yellow"
      );
      throw new Error(
        "Daily limit blocking create – frontend shows limit or disabled submit (fix: send auth token for usage + create POST so backend sees enterprise user)."
      );
    }
    await page.fill(
      'input[id="campaignName"]',
      `Login Mimic Test ${Date.now()}`
    );
    await page.fill('input[placeholder="First Name"]', "User");
    await page.fill('input[placeholder="Last Name"]', "Mimic");
    await page.fill('input[placeholder="Your Company Name"]', "Mimicry Labs");
    await page.fill('input[placeholder="Your Email"]', LOGIN_EMAIL);
    await page.fill('input[placeholder="Your Phone"]', "+1 555 123 4567");
    await page.selectOption("select", "United Kingdom");
    await page.fill(
      'textarea[id="message"]',
      "Hello, this is a test from the login mimic script."
    );
    log("  Clicking Create Campaign (submit)...", "yellow");
    await page.click('button[type="submit"]');

    // --- Step 5: Wait for real redirect to campaign detail; fail if we stay on create or see daily limit ---
    try {
      await page.waitForURL(/\/campaigns\/\d+(\/|$|\?)/, { timeout: 12000 });
    } catch (e) {
      const nowUrl = page.url();
      const bodyAfter = await page.textContent("body").catch(() => "");
      await page.screenshot({
        path: "mimic-screenshots/login-mimic-after-submit.png",
      });
      if (
        bodyAfter.includes("Daily limit reached") ||
        bodyAfter.includes("limit reached")
      ) {
        log(
          "  Daily limit reached appeared after submit (backend returned 403 or frontend blocked).",
          "red"
        );
        throw new Error(
          "Daily limit reached – no redirect; create was blocked or failed."
        );
      }
      if (nowUrl.includes("/campaigns/create")) {
        log(
          "  Still on /campaigns/create after submit – no campaign created.",
          "red"
        );
        throw new Error(
          "Create did not redirect to campaign detail (submit may be disabled or POST failed)."
        );
      }
      log(`  Unexpected URL after submit: ${nowUrl}`, "red");
      throw new Error(
        "Create flow did not complete: no redirect to campaign detail."
      );
    }
    const finalUrl = page.url();
    const campaignIdMatch = finalUrl.match(/\/campaigns\/(\d+)/);
    const campaignId = campaignIdMatch ? campaignIdMatch[1] : null;
    log(
      `  Campaign created successfully (redirected to /campaigns/${
        campaignId || "?"
      }).`,
      "green"
    );

    log("\n=== Mimic (login + create) completed ===", "green");
  } catch (error) {
    log(`\nTest failed: ${error.message}`, "red");
    if (page) {
      await page
        .screenshot({ path: "mimic-screenshots/login-mimic-error.png" })
        .catch(() => {});
      log("  Screenshot: mimic-screenshots/login-mimic-error.png", "yellow");
    }
    process.exit(1);
  } finally {
    if (browser) await browser.close();
    if (fs.existsSync(CSV_FILE_PATH)) fs.unlinkSync(CSV_FILE_PATH);
  }
}

const screenshotsDir = path.join(__dirname, "mimic-screenshots");
if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir);

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

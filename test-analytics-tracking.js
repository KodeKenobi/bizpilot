const puppeteer = require("puppeteer");

async function testAnalyticsTracking() {
  console.log("============================================================");
  console.log("TESTING ANALYTICS TRACKING");
  console.log("============================================================\n");

  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // Track network requests
  const analyticsRequests = [];
  const pageViewRequests = [];
  const eventRequests = [];
  const sessionRequests = [];

  page.on("request", (request) => {
    const url = request.url();
    if (url.includes("/api/analytics/pageview")) {
      pageViewRequests.push({
        url,
        method: request.method(),
        headers: request.headers(),
      });
    } else if (url.includes("/api/analytics/events")) {
      eventRequests.push({
        url,
        method: request.method(),
        headers: request.headers(),
      });
    } else if (url.includes("/api/analytics/session")) {
      sessionRequests.push({
        url,
        method: request.method(),
        headers: request.headers(),
      });
    }
  });

  // Track responses
  page.on("response", async (response) => {
    const url = response.url();
    if (url.includes("/api/analytics/")) {
      const status = response.status();
      const contentType = response.headers()["content-type"];
      let body = null;
      try {
        body = await response.text();
      } catch (e) {}

      analyticsRequests.push({
        url,
        status,
        contentType,
        body: body ? body.substring(0, 200) : null,
      });
    }
  });

  try {
    // Step 1: Visit the website
    console.log("[STEP 1] Visiting website...");
    await page.goto("https://www.trevnoctilla.com", {
      waitUntil: "networkidle2",
      timeout: 30000,
    });
    console.log("✅ Website loaded\n");

    // Step 2: Check if WebsiteTracker is loaded
    console.log("[STEP 2] Checking if WebsiteTracker is loaded...");
    const trackerLoaded = await page.evaluate(() => {
      return (
        typeof window !== "undefined" &&
        (window.internalAnalytics !== undefined ||
          document.querySelector("[data-analytics]") !== null)
      );
    });

    if (trackerLoaded) {
      console.log("✅ WebsiteTracker is loaded");
    } else {
      console.log("❌ WebsiteTracker is NOT loaded");
    }

    // Check if internalAnalytics exists
    const hasInternalAnalytics = await page.evaluate(() => {
      return (
        typeof window !== "undefined" && window.internalAnalytics !== undefined
      );
    });

    if (hasInternalAnalytics) {
      console.log("✅ internalAnalytics object exists");
      const sessionInfo = await page.evaluate(() => {
        if (
          window.internalAnalytics &&
          window.internalAnalytics.getSessionInfo
        ) {
          return window.internalAnalytics.getSessionInfo();
        }
        return null;
      });
      if (sessionInfo) {
        console.log(`   Session ID: ${sessionInfo.sessionId}`);
        console.log(`   Page Views: ${sessionInfo.pageViews}`);
        console.log(`   Events: ${sessionInfo.events}`);
      }
    } else {
      console.log("❌ internalAnalytics object does NOT exist");
    }
    console.log();

    // Step 3: Wait for initial analytics calls
    console.log("[STEP 3] Waiting for initial analytics calls...");
    await page.waitForTimeout(2000);

    console.log(`   Page View Requests: ${pageViewRequests.length}`);
    console.log(`   Event Requests: ${eventRequests.length}`);
    console.log(`   Session Requests: ${sessionRequests.length}`);
    console.log();

    // Step 4: Simulate user interactions
    console.log("[STEP 4] Simulating user interactions...");

    // Click on a link or button
    try {
      const clickableElement = await page.$("a, button");
      if (clickableElement) {
        await clickableElement.click();
        console.log("✅ Clicked on an element");
        await page.waitForTimeout(1000);
      }
    } catch (e) {
      console.log("⚠️  Could not click element");
    }

    // Scroll the page
    await page.evaluate(() => {
      window.scrollTo(0, 500);
    });
    console.log("✅ Scrolled page");
    await page.waitForTimeout(1000);

    // Step 5: Check analytics API responses
    console.log("\n[STEP 5] Checking analytics API responses...");
    console.log(`   Total Analytics Requests: ${analyticsRequests.length}`);

    if (analyticsRequests.length > 0) {
      console.log("\n   Analytics API Calls:");
      analyticsRequests.forEach((req, index) => {
        console.log(`   ${index + 1}. ${req.url}`);
        console.log(`      Status: ${req.status}`);
        if (req.status === 200) {
          console.log(`      ✅ Success`);
        } else {
          console.log(`      ❌ Failed`);
          if (req.body) {
            console.log(`      Response: ${req.body}`);
          }
        }
      });
    } else {
      console.log("   ❌ No analytics API calls detected");
    }

    // Step 6: Check specific request types
    console.log("\n[STEP 6] Detailed Request Breakdown:");
    console.log(`   Page View Requests: ${pageViewRequests.length}`);
    if (pageViewRequests.length > 0) {
      console.log("   ✅ Page views are being tracked");
    } else {
      console.log("   ❌ Page views are NOT being tracked");
    }

    console.log(`   Event Requests: ${eventRequests.length}`);
    if (eventRequests.length > 0) {
      console.log("   ✅ Events are being tracked");
    } else {
      console.log("   ❌ Events are NOT being tracked");
    }

    console.log(`   Session Requests: ${sessionRequests.length}`);
    if (sessionRequests.length > 0) {
      console.log("   ✅ Sessions are being tracked");
    } else {
      console.log("   ❌ Sessions are NOT being tracked");
    }

    // Step 7: Check for JavaScript errors
    console.log("\n[STEP 7] Checking for JavaScript errors...");
    const jsErrors = [];
    page.on("pageerror", (error) => {
      jsErrors.push(error.message);
    });

    await page.waitForTimeout(1000);

    if (jsErrors.length > 0) {
      console.log(`   ❌ Found ${jsErrors.length} JavaScript errors:`);
      jsErrors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    } else {
      console.log("   ✅ No JavaScript errors detected");
    }

    // Step 8: Final summary
    console.log(
      "\n============================================================"
    );
    console.log("TEST SUMMARY");
    console.log("============================================================");

    const allGood =
      trackerLoaded &&
      hasInternalAnalytics &&
      analyticsRequests.length > 0 &&
      pageViewRequests.length > 0 &&
      jsErrors.length === 0;

    if (allGood) {
      console.log("✅ Analytics tracking is WORKING");
      console.log("\n   - WebsiteTracker is loaded");
      console.log("   - internalAnalytics object exists");
      console.log("   - Analytics API calls are being made");
      console.log("   - Page views are being tracked");
      console.log("   - No JavaScript errors");
    } else {
      console.log("❌ Analytics tracking has ISSUES");
      if (!trackerLoaded) {
        console.log("   - WebsiteTracker is not loaded");
      }
      if (!hasInternalAnalytics) {
        console.log("   - internalAnalytics object does not exist");
      }
      if (analyticsRequests.length === 0) {
        console.log("   - No analytics API calls detected");
      }
      if (pageViewRequests.length === 0) {
        console.log("   - Page views are not being tracked");
      }
      if (jsErrors.length > 0) {
        console.log(`   - ${jsErrors.length} JavaScript errors found`);
      }
    }

    // Take a screenshot
    await page.screenshot({
      path: "analytics-test-screenshot.png",
      fullPage: true,
    });
    console.log("\n✅ Screenshot saved: analytics-test-screenshot.png");
  } catch (error) {
    console.error("\n❌ Error during test:", error.message);
  } finally {
    await browser.close();
  }
}

testAnalyticsTracking().catch(console.error);

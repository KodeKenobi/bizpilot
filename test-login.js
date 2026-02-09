const puppeteer = require("puppeteer");
const https = require("https");

const BACKEND_URL =
  process.env.BACKEND_URL || "https://web-production-737b.up.railway.app";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// Test backend login endpoint directly
async function testBackendLogin(email, password) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ email, password });

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": data.length,
      },
    };

    const req = https.request(`${BACKEND_URL}/auth/login`, options, (res) => {
      let responseData = "";

      res.on("data", (chunk) => {
        responseData += chunk;
      });

      res.on("end", () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            success: res.statusCode === 200,
            data: parsed,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            success: false,
            error: "Failed to parse response",
            raw: responseData.substring(0, 500),
          });
        }
      });
    });

    req.on("error", (error) => {
      reject({ error: error.message });
    });

    req.write(data);
    req.end();
  });
}

// Test frontend login with Puppeteer
async function testFrontendLogin(email, password) {
  console.log("\n🌐 Testing Frontend Login with Puppeteer...");
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    // Set viewport
    await page.setViewport({ width: 1280, height: 720 });

    // Navigate to login page
    console.log(`📄 Navigating to ${FRONTEND_URL}/auth/login`);
    await page.goto(`${FRONTEND_URL}/auth/login`, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // Wait for form to load
    await page.waitForSelector('input[name="email"]', { timeout: 10000 });
    console.log("✅ Login form loaded");

    // Fill in credentials
    console.log(`📝 Filling in email: ${email}`);
    await page.type('input[name="email"]', email, { delay: 50 });

    console.log("📝 Filling in password...");
    await page.type('input[name="password"]', password, { delay: 50 });

    // Take screenshot before submit
    await page.screenshot({ path: "login-before-submit.png" });
    console.log("📸 Screenshot saved: login-before-submit.png");

    // Submit form
    console.log("🚀 Submitting login form...");
    await page.click('button[type="submit"]');

    // Wait for response (either success or error)
    await page.waitForTimeout(3000);

    // Check for error message
    const errorElement = await page.$(
      '.text-red-200, .text-red-300, [class*="error"]'
    );
    if (errorElement) {
      const errorText = await page.evaluate(
        (el) => el.textContent,
        errorElement
      );
      console.log(`❌ Login error detected: ${errorText}`);
    }

    // Check for success message
    const successElement = await page.$(
      '.text-green-200, .text-green-300, [class*="success"]'
    );
    if (successElement) {
      const successText = await page.evaluate(
        (el) => el.textContent,
        successElement
      );
      console.log(`✅ Login success detected: ${successText}`);
    }

    // Check current URL
    const currentUrl = page.url();
    console.log(`📍 Current URL: ${currentUrl}`);

    // Take screenshot after submit
    await page.screenshot({ path: "login-after-submit.png" });
    console.log("📸 Screenshot saved: login-after-submit.png");

    // Wait a bit more to see if redirect happens
    await page.waitForTimeout(2000);
    const finalUrl = page.url();

    if (finalUrl !== currentUrl) {
      console.log(`🔄 Redirected to: ${finalUrl}`);
    }

    // Check localStorage for auth token
    const authToken = await page.evaluate(() => {
      return localStorage.getItem("auth_token");
    });

    if (authToken) {
      console.log("✅ Auth token found in localStorage");
    } else {
      console.log("⚠️ No auth token in localStorage");
    }

    return {
      success: finalUrl.includes("/dashboard") || finalUrl.includes("/admin"),
      finalUrl,
      hasToken: !!authToken,
    };
  } catch (error) {
    console.error("❌ Puppeteer error:", error.message);
    return { success: false, error: error.message };
  } finally {
    await browser.close();
  }
}

// Main test function
async function runTests() {
  console.log("🧪 Starting Login Tests\n");
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log(`Frontend URL: ${FRONTEND_URL}\n`);

  // Get test credentials from command line or use defaults
  const email = process.argv[2] || "test@example.com";
  const password = process.argv[3] || "Test1234!";

  console.log(`Testing with email: ${email}`);
  console.log(`Password: ${"*".repeat(password.length)}\n`);

  // Test 1: Backend login endpoint
  console.log("🔌 Testing Backend Login Endpoint...");
  try {
    const backendResult = await testBackendLogin(email, password);
    console.log(`Status: ${backendResult.status}`);
    if (backendResult.success) {
      console.log("✅ Backend login successful!");
      console.log(`User: ${backendResult.data?.user?.email || "N/A"}`);
      console.log(`Role: ${backendResult.data?.user?.role || "N/A"}`);
      console.log(`Has access_token: ${!!backendResult.data?.access_token}`);
    } else {
      console.log("❌ Backend login failed");
      console.log(
        `Error: ${
          backendResult.data?.error || backendResult.error || "Unknown error"
        }`
      );
      if (backendResult.raw) {
        console.log(`Raw response: ${backendResult.raw}`);
      }
    }
  } catch (error) {
    console.error("❌ Backend test error:", error);
  }

  // Test 2: Frontend login (only if frontend is running)
  if (FRONTEND_URL.includes("localhost")) {
    console.log("\n⚠️ Skipping frontend test (localhost not accessible)");
    console.log("To test frontend, run: npm run dev");
  } else {
    try {
      const frontendResult = await testFrontendLogin(email, password);
      if (frontendResult.success) {
        console.log("\n✅ Frontend login successful!");
      } else {
        console.log("\n❌ Frontend login failed");
        if (frontendResult.error) {
          console.log(`Error: ${frontendResult.error}`);
        }
      }
    } catch (error) {
      console.error("\n❌ Frontend test error:", error);
    }
  }

  console.log("\n✨ Tests completed!");
}

// Run tests
runTests().catch(console.error);

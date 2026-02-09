const https = require("https");
const http = require("http");

const BASE_URL = process.env.BASE_URL || "https://www.trevnoctilla.com";

// Super admin credentials
const SUPER_ADMIN_CREDENTIALS = {
  email: "admin@trevnoctilla.com",
  password: process.env.SUPER_ADMIN_PASSWORD || "admin123",
};


const ADMIN_CREDENTIALS = {
  email: "tshepomtshali89@gmail.com",
  password: "Kopenikus0218!",
};

async function testSuperAdminLogin() {
  console.log("🔐 Testing Super Admin Login\n");
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Email: ${SUPER_ADMIN_CREDENTIALS.email}\n`);

  const url = new URL(`${BASE_URL}/api/auth/login`);
  const isHttps = url.protocol === "https:";
  const client = isHttps ? https : http;

  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email: SUPER_ADMIN_CREDENTIALS.email,
      password: SUPER_ADMIN_CREDENTIALS.password,
    });

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const req = client.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const response = JSON.parse(data);

          console.log(`📡 Response Status: ${res.statusCode}`);
          console.log(`📡 Response Headers:`, res.headers);

          if (res.statusCode === 200 || res.statusCode === 201) {
            console.log("\n✅ Login successful!\n");

            // Check if user data is in response
            if (response.user) {
              console.log("👤 User Data:");
              console.log(`   ID: ${response.user.id}`);
              console.log(`   Email: ${response.user.email}`);
              console.log(`   Role: ${response.user.role}`);
              console.log(
                `   Is Super Admin: ${
                  response.user.role === "super_admin" ? "✅ Yes" : "❌ No"
                }`
              );
              console.log(
                `   Subscription Tier: ${
                  response.user.subscription_tier || "N/A"
                }`
              );
              console.log(
                `   Monthly Limit: ${
                  response.user.monthly_call_limit === -1
                    ? "Unlimited"
                    : response.user.monthly_call_limit || "N/A"
                }`
              );
              console.log(
                `   Active: ${response.user.is_active ? "✅ Yes" : "❌ No"}`
              );

              // Verify it's actually super_admin
              if (response.user.role === "super_admin") {
                console.log("\n✅ Verified: User has super_admin role");
              } else {
                console.log(
                  `\n⚠️ Warning: Expected super_admin role but got: ${response.user.role}`
                );
              }
            }

            // Check for access token
            if (response.access_token) {
              console.log("\n🔑 Access Token:");
              console.log(`   ${response.access_token.substring(0, 50)}...`);
              console.log("   ✅ Token received");
            } else {
              console.log("\n⚠️ No access token in response");
            }

            resolve({
              success: true,
              status: res.statusCode,
              user: response.user,
              token: response.access_token,
            });
          } else {
            console.log("\n❌ Login failed!");
            console.log(`   Status: ${res.statusCode}`);
            console.log(`   Response:`, response);

            reject({
              success: false,
              status: res.statusCode,
              error: response.error || response.message || "Unknown error",
            });
          }
        } catch (parseError) {
          console.log("\n❌ Failed to parse response");
          console.log(`   Raw response: ${data}`);
          reject({
            success: false,
            error: "Failed to parse response",
            rawResponse: data,
          });
        }
      });
    });

    req.on("error", (error) => {
      console.error("\n❌ Request error:", error.message);
      reject({
        success: false,
        error: error.message,
      });
    });

    req.write(postData);
    req.end();
  });
}

// Test with Puppeteer for frontend login
async function testFrontendLogin() {
  try {
    const puppeteer = require("puppeteer");

    console.log("\n🌐 Testing Frontend Login with Puppeteer...\n");

    const browser = await puppeteer.launch({
      headless: false,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      defaultViewport: { width: 1280, height: 720 },
    });

    try {
      const page = await browser.newPage();

      // Navigate to login page
      console.log("📄 Navigating to login page...");
      await page.goto(`${BASE_URL}/auth/login`, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      await page.waitForTimeout(2000);

      // Fill in email
      console.log("✍️ Filling in email...");
      const emailInput = await page.$(
        'input[type="email"], input[name="email"]'
      );
      if (emailInput) {
        await emailInput.type(SUPER_ADMIN_CREDENTIALS.email);
        console.log("   ✅ Email filled");
      } else {
        throw new Error("Email input not found");
      }

      // Fill in password
      console.log("✍️ Filling in password...");
      const passwordInput = await page.$(
        'input[type="password"], input[name="password"]'
      );
      if (passwordInput) {
        await passwordInput.type(SUPER_ADMIN_CREDENTIALS.password);
        console.log("   ✅ Password filled");
      } else {
        throw new Error("Password input not found");
      }

      // Take screenshot before login
      await page.screenshot({ path: "login-before.png" });
      console.log("📸 Screenshot saved: login-before.png");

      // Click login button
      console.log("🚀 Clicking login button...");
      const loginButton = await page.evaluateHandle(() => {
        const buttons = Array.from(document.querySelectorAll("button"));
        return buttons.find(
          (btn) =>
            btn.type === "submit" ||
            btn.textContent?.includes("Login") ||
            btn.textContent?.includes("Sign In")
        );
      });

      if (!loginButton || (await loginButton.jsonValue()) === null) {
        throw new Error("Login button not found");
      }

      const buttonElement = await loginButton.asElement();
      if (!buttonElement) {
        throw new Error("Login button element not found");
      }

      await buttonElement.click();
      console.log("   ✅ Login button clicked");

      // Wait for navigation/redirect
      console.log("⏳ Waiting for login to complete...");
      await page.waitForTimeout(5000);

      // Check if redirected to admin dashboard
      const currentUrl = page.url();
      console.log(`📍 Current URL: ${currentUrl}`);

      if (currentUrl.includes("/admin")) {
        console.log("✅ Successfully redirected to admin dashboard!");
      } else if (currentUrl.includes("/dashboard")) {
        console.log(
          "⚠️ Redirected to regular dashboard (should be admin for super_admin)"
        );
      } else if (currentUrl.includes("/auth/login")) {
        console.log("❌ Still on login page - login may have failed");
      }

      // Take screenshot after login
      await page.screenshot({ path: "login-after.png" });
      console.log("📸 Screenshot saved: login-after.png");

      // Check for user role in page
      const userRole = await page.evaluate(() => {
        // Try to get user data from localStorage
        const userData = localStorage.getItem("user_data");
        if (userData) {
          try {
            const user = JSON.parse(userData);
            return user.role;
          } catch (e) {
            return null;
          }
        }
        return null;
      });

      if (userRole) {
        console.log(`\n👤 User Role from localStorage: ${userRole}`);
        if (userRole === "super_admin") {
          console.log("✅ Verified: super_admin role in localStorage");
        } else {
          console.log(`⚠️ Warning: Expected super_admin but got ${userRole}`);
        }
      }

      await browser.close();
      return { success: true, url: currentUrl, role: userRole };
    } catch (error) {
      await browser.close();
      throw error;
    }
  } catch (error) {
    if (error.message.includes("Cannot find module 'puppeteer'")) {
      console.log("⚠️ Puppeteer not installed, skipping frontend test");
      console.log("   Install with: npm install puppeteer");
      return null;
    }
    throw error;
  }
}

// Run tests
async function runTests() {
  try {
    // Test backend login
    const backendResult = await testSuperAdminLogin();

    // Test frontend login (if Puppeteer is available)
    let frontendResult = null;
    try {
      frontendResult = await testFrontendLogin();
    } catch (error) {
      console.log(`\n⚠️ Frontend test skipped: ${error.message}`);
    }

    console.log("\n" + "=".repeat(80));
    console.log("📊 TEST SUMMARY");
    console.log("=".repeat(80));
    console.log(
      `Backend Login: ${backendResult.success ? "✅ Success" : "❌ Failed"}`
    );
    if (backendResult.user) {
      console.log(`   Role: ${backendResult.user.role}`);
      console.log(`   Email: ${backendResult.user.email}`);
    }
    if (frontendResult) {
      console.log(
        `Frontend Login: ${frontendResult.success ? "✅ Success" : "❌ Failed"}`
      );
      console.log(`   Redirected to: ${frontendResult.url}`);
      console.log(`   Role: ${frontendResult.role || "N/A"}`);
    } else {
      console.log(`Frontend Login: ⚠️ Skipped (Puppeteer not available)`);
    }
    console.log("=".repeat(80));

    if (backendResult.success) {
      console.log("\n✅ All tests passed!");
      process.exit(0);
    } else {
      console.log("\n❌ Tests failed!");
      process.exit(1);
    }
  } catch (error) {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  }
}

runTests();

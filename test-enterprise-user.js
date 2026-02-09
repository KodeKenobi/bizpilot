const https = require("https");
const http = require("http");

const BASE_URL = process.env.BASE_URL || "https://www.trevnoctilla.com";

// Enterprise user credentials to test
const TEST_CREDENTIALS = {
  email: "tshepomtshali89@gmail.com",
  password: "Kopenikus0218!",
};

async function testEnterpriseUserLogin() {
  console.log("🔐 Testing Enterprise User Login\n");
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Email: ${TEST_CREDENTIALS.email}\n`);

  const url = new URL(`${BASE_URL}/api/auth/login`);
  const isHttps = url.protocol === "https:";
  const client = isHttps ? https : http;

  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email: TEST_CREDENTIALS.email,
      password: TEST_CREDENTIALS.password,
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

          if (res.statusCode === 200 || res.statusCode === 201) {
            console.log("\n✅ Login successful!\n");

            if (response.user) {
              const user = response.user;
              
              console.log("=" .repeat(80));
              console.log("👤 USER ACCOUNT DETAILS");
              console.log("=".repeat(80));
              console.log(`ID: ${user.id}`);
              console.log(`Email: ${user.email}`);
              console.log(`Name: ${user.name || "N/A"}`);
              console.log(`\n🔐 ROLE INFORMATION:`);
              console.log(`   Role: ${user.role}`);
              console.log(`   Is Admin: ${user.role === "admin" || user.role === "super_admin" ? "✅ YES" : "❌ NO"}`);
              console.log(`   Is Super Admin: ${user.role === "super_admin" ? "✅ YES" : "❌ NO"}`);
              
              console.log(`\n💎 SUBSCRIPTION INFORMATION:`);
              console.log(`   Subscription Tier: ${user.subscription_tier || "N/A"}`);
              console.log(`   Monthly Call Limit: ${user.monthly_call_limit === -1 ? "Unlimited (-1)" : user.monthly_call_limit || "N/A"}`);
              
              // Determine if enterprise based on our app logic
              const subscriptionTier = user.subscription_tier?.toLowerCase() || "free";
              const isEnterprise =
                subscriptionTier === "enterprise" ||
                user.monthly_call_limit === -1 ||
                (user.monthly_call_limit && user.monthly_call_limit >= 100000);
              
              console.log(`   Is Enterprise: ${isEnterprise ? "✅ YES" : "❌ NO"}`);
              
              console.log(`\n📊 ACCOUNT STATUS:`);
              console.log(`   Active: ${user.is_active ? "✅ Yes" : "❌ No"}`);
              console.log(`   Verified: ${user.is_verified ? "✅ Yes" : "❌ No"}`);
              
              console.log("\n" + "=".repeat(80));
              console.log("🎯 DASHBOARD ACCESS ANALYSIS");
              console.log("=".repeat(80));
              
              // Determine which dashboard they should see
              // CORRECTED ROLE STRUCTURE:
              // user role = Regular User → /dashboard
              // admin role = Enterprise User → /enterprise
              // super_admin role = Super Admin → /admin
              let expectedDashboard = "";
              let reasoning = [];
              
              if (user.role === "super_admin") {
                expectedDashboard = "/admin (Super Admin Dashboard)";
                reasoning.push("✓ User has 'super_admin' role");
                reasoning.push("✓ Super admins see the admin dashboard with full system access");
                reasoning.push("✓ Can switch between Website/User Dashboard/Enterprise");
              } else if (user.role === "admin") {
                expectedDashboard = "/enterprise (Enterprise Dashboard)";
                reasoning.push("✓ User has 'admin' role (Enterprise User)");
                reasoning.push("✓ In the corrected system: admin role = Enterprise access");
                reasoning.push("✓ Enterprise users see the enterprise dashboard");
                reasoning.push("✓ Can manage team members and have higher limits");
              } else {
                expectedDashboard = "/dashboard (Regular User Dashboard)";
                reasoning.push("✓ User has 'user' role");
                reasoning.push("✓ Regular users see the standard user dashboard");
                reasoning.push("✓ Can upgrade to premium or enterprise");
              }
              
              console.log(`\nExpected Dashboard: ${expectedDashboard}\n`);
              console.log("Reasoning:");
              reasoning.forEach(line => console.log(`  ${line}`));
              
              console.log("\n" + "=".repeat(80));
              console.log("🎯 CORRECTED ROLE STRUCTURE");
              console.log("=".repeat(80));
              
              console.log("\n✅ NEW UNDERSTANDING:");
              console.log(`   Your account has the '${user.role}' role in the database.`);
              console.log(`   The role determines dashboard access (subscription tier is secondary).`);
              console.log(`   \n   Corrected Role Structure:`);
              console.log(`   1. 'user' role → User Dashboard (/dashboard)`);
              console.log(`   2. 'admin' role → Enterprise Dashboard (/enterprise)`);
              console.log(`   3. 'super_admin' role → Admin Dashboard (/admin)`);
              console.log(`\n   📍 YOUR EXPECTED DASHBOARD: ${expectedDashboard}`);
              console.log(`   The system will now redirect you to the correct dashboard!`)
              
              console.log("\n" + "=".repeat(80));
              console.log("📋 DASHBOARD FEATURE COMPARISON");
              console.log("=".repeat(80));
              console.log("\n🔴 ADMIN DASHBOARD (super_admin role only):");
              console.log("   ✓ All Tabs (Free Tier, Analytics, Testing, etc.)");
              console.log("   ✓ User Management");
              console.log("   ✓ System Settings");
              console.log("   ✓ Campaign Activity");
              console.log("   ✓ Full System Access");
              console.log("   ✓ Can view and manage ALL users");
              
              console.log("\n🟣 ENTERPRISE DASHBOARD (admin role):");
              console.log("   ✓ Overview Tab");
              console.log("   ✓ Campaigns Tab");
              console.log("   ✓ Team Management (Add/Remove Team Members)");
              console.log("   ✓ API Reference");
              console.log("   ✓ API Keys Settings");
              console.log("   ✗ NO Free Tier Keys Tab");
              console.log("   ✗ NO Analytics Tab");
              console.log("   ✗ NO Testing Tab");
              console.log("   ✗ NO Subscription Tier Display");
              console.log("   ✗ NO Role Display");
              console.log("   ✗ NO User Management (only team members)");
              
              console.log("\n🔵 USER DASHBOARD (user role):");
              console.log("   ✓ Overview");
              console.log("   ✓ Campaigns");
              console.log("   ✓ API Keys");
              console.log("   ✓ Usage Stats");
              console.log("   ✓ Subscription Management");
              console.log("   ✗ NO Team Management");
              console.log("   ✗ NO System Settings");
              
              console.log("\n" + "=".repeat(80));

              resolve({
                success: true,
                status: res.statusCode,
                user: user,
                token: response.access_token,
                isEnterprise: isEnterprise,
                expectedDashboard: expectedDashboard,
              });
            }
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

// Run test
async function runTest() {
  try {
    const result = await testEnterpriseUserLogin();
    
    console.log("\n✅ Test completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  }
}

runTest();

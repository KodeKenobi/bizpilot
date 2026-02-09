const https = require("https");

const BACKEND_URL = "https://web-production-737b.up.railway.app";

async function testBackendEndpoint(endpoint, method = "GET", body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BACKEND_URL}${endpoint}`);

    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (body) {
      const bodyString = JSON.stringify(body);
      options.headers["Content-Length"] = Buffer.byteLength(bodyString);
    }

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function testAnalytics() {
  console.log("============================================================");
  console.log("TESTING BACKEND ANALYTICS ENDPOINTS");
  console.log("============================================================\n");

  // Test 1: Health check
  console.log("[TEST 1] Testing backend health...");
  try {
    const healthResponse = await testBackendEndpoint("/health");
    console.log(`   Status: ${healthResponse.status}`);
    if (healthResponse.status === 200) {
      console.log("   ✅ Backend is reachable");
    } else {
      console.log("   ❌ Backend health check failed");
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  console.log();

  // Test 2: Analytics pageview endpoint
  console.log("[TEST 2] Testing /api/analytics/pageview endpoint...");
  try {
    const pageViewData = {
      session_id: "test_session_123",
      page_url: "https://www.trevnoctilla.com/test",
      page_title: "Test Page",
      timestamp: new Date().toISOString(),
      user_agent: "Mozilla/5.0 (Test)",
      device_type: "desktop",
      browser: "chrome",
      os: "windows",
    };

    const response = await testBackendEndpoint(
      "/api/analytics/pageview",
      "POST",
      pageViewData
    );
    console.log(`   Status: ${response.status}`);
    if (response.status === 200) {
      console.log("   ✅ Pageview endpoint is working");
      console.log(`   Response: ${response.body.substring(0, 100)}`);
    } else {
      console.log("   ❌ Pageview endpoint failed");
      console.log(`   Response: ${response.body.substring(0, 200)}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  console.log();

  // Test 3: Analytics events endpoint
  console.log("[TEST 3] Testing /api/analytics/events endpoint...");
  try {
    const eventsData = {
      events: [
        {
          event_type: "custom",
          event_name: "test_event",
          properties: { test: true },
          session_id: "test_session_123",
          page_url: "https://www.trevnoctilla.com/test",
          page_title: "Test Page",
          timestamp: new Date().toISOString(),
          user_agent: "Mozilla/5.0 (Test)",
          device_type: "desktop",
          browser: "chrome",
          os: "windows",
        },
      ],
    };

    const response = await testBackendEndpoint(
      "/api/analytics/events",
      "POST",
      eventsData
    );
    console.log(`   Status: ${response.status}`);
    if (response.status === 200) {
      console.log("   ✅ Events endpoint is working");
      console.log(`   Response: ${response.body.substring(0, 100)}`);
    } else {
      console.log("   ❌ Events endpoint failed");
      console.log(`   Response: ${response.body.substring(0, 200)}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  console.log();

  // Test 4: Analytics session endpoint
  console.log("[TEST 4] Testing /api/analytics/session endpoint...");
  try {
    const sessionData = {
      id: "test_session_123",
      start_time: new Date().toISOString(),
      last_activity: new Date().toISOString(),
      page_views: 1,
      events: 1,
      device_type: "desktop",
      browser: "chrome",
      os: "windows",
      user_agent: "Mozilla/5.0 (Test)",
      is_active: true,
    };

    const response = await testBackendEndpoint(
      "/api/analytics/session",
      "POST",
      sessionData
    );
    console.log(`   Status: ${response.status}`);
    if (response.status === 200) {
      console.log("   ✅ Session endpoint is working");
      console.log(`   Response: ${response.body.substring(0, 100)}`);
    } else {
      console.log("   ❌ Session endpoint failed");
      console.log(`   Response: ${response.body.substring(0, 200)}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  console.log();

  console.log("============================================================");
  console.log("TEST SUMMARY");
  console.log("============================================================");
}

testAnalytics().catch(console.error);

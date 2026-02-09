/**
 * Test script: login as tshepomtshali89@gmail.com and inspect why daily limit appears.
 * Usage: node test-daily-limit-login.js
 * No code changes - read-only investigation.
 *
 * Set BACKEND_URL if backend is not at default (e.g. export BACKEND_URL=https://your-backend.railway.app)
 */

const BACKEND_URL =
  process.env.BACKEND_URL || "https://web-production-737b.up.railway.app";

const EMAIL = "tshepomtshali89@gmail.com";
const PASSWORD = "Kopenikus0218!";

async function main() {
  console.log("=== Daily limit login test ===\n");
  console.log("Backend URL:", BACKEND_URL);
  console.log("Email:", EMAIL);
  console.log("");

  let accessToken = null;
  let loginUser = null;

  // 1) Login
  console.log("1) POST /auth/login ...");
  try {
    const loginRes = await fetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });
    const loginData = await loginRes.json();

    if (!loginRes.ok) {
      console.log("   Login FAILED:", loginRes.status, loginData);
      console.log(
        "\n   Reason: backend returned error (check email/password or backend logs)."
      );
      process.exit(1);
    }

    accessToken = loginData.access_token;
    loginUser = loginData.user || loginData;
    console.log("   OK. access_token present:", !!accessToken);
    console.log("   User id:", loginUser?.id);
    console.log("   User email:", loginUser?.email);
    console.log(
      "   subscription_tier (from login response):",
      JSON.stringify(loginUser?.subscription_tier)
    );
    console.log("");
  } catch (e) {
    console.log("   Error:", e.message);
    process.exit(1);
  }

  if (!accessToken) {
    console.log("   No access_token in response. Cannot call usage API.");
    process.exit(1);
  }

  // 2) Profile (what tier does backend think this user has?)
  console.log("2) GET /auth/profile (Bearer token) ...");
  try {
    const profileRes = await fetch(`${BACKEND_URL}/auth/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const profileData = await profileRes.json();

    if (!profileRes.ok) {
      console.log("   Profile FAILED:", profileRes.status, profileData);
    } else {
      console.log("   OK.");
      console.log(
        "   subscription_tier (from profile):",
        JSON.stringify(profileData.subscription_tier)
      );
      console.log(
        "   Raw tier value (for case check):",
        JSON.stringify(profileData.subscription_tier),
        "| length:",
        profileData.subscription_tier?.length
      );
    }
    console.log("");
  } catch (e) {
    console.log("   Error:", e.message);
  }

  // 3) Usage (what daily limit does backend return?)
  console.log("3) GET /api/campaigns/usage (Bearer token) ...");
  try {
    const usageRes = await fetch(`${BACKEND_URL}/api/campaigns/usage`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const usageData = await usageRes.json();

    if (!usageRes.ok) {
      console.log("   Usage request FAILED:", usageRes.status, usageData);
    } else {
      console.log("   OK.");
      console.log("   Response:", JSON.stringify(usageData, null, 2));
      console.log("");
      console.log("   daily_limit:", usageData.daily_limit);
      console.log("   daily_used:", usageData.daily_used);
      console.log("   daily_remaining:", usageData.daily_remaining);
      console.log("   unlimited:", usageData.unlimited);
    }
    console.log("");
  } catch (e) {
    console.log("   Error:", e.message);
  }

  // 4) Why daily limit?
  console.log("=== Why 'daily limit'? ===\n");
  const tierFromLogin = loginUser?.subscription_tier;
  const tierStr =
    typeof tierFromLogin === "string"
      ? tierFromLogin
      : "(not a string or missing)";
  const tierLower =
    typeof tierFromLogin === "string" ? tierFromLogin.toLowerCase() : "";

  console.log("Backend limits by tier (expected):");
  console.log("  enterprise -> unlimited (daily_limit -1 / unlimited)");
  console.log("  client     -> unlimited");
  console.log("  premium    -> 100/day");
  console.log("  free       -> 50/day");
  console.log("  guest      -> 5/day");
  console.log("");
  console.log(
    "Your user.subscription_tier from login:",
    JSON.stringify(tierFromLogin)
  );
  console.log("Lowercase version:", JSON.stringify(tierLower));
  if (tierLower === "enterprise" || tierLower === "client") {
    console.log(
      "=> Tier is enterprise/client so backend should return unlimited."
    );
    console.log(
      "   If you still see a limit, the usage endpoint may be using a different tier (e.g. wrong key or case)."
    );
  } else if (tierStr && tierStr !== tierLower) {
    console.log(
      "=> Tier has different casing. Backend limit maps use lowercase keys ('enterprise')."
    );
    console.log(
      "   If the code did not normalize tier to lowercase, lookup would fail and default to guest (5/day)."
    );
  } else if (!tierStr) {
    console.log(
      "=> subscription_tier is missing or null; backend defaults to 'free' or 'guest'."
    );
  }
  console.log("");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

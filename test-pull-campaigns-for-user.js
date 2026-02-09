/**
 * Login as user and pull campaigns from backend (GET /api/campaigns with Bearer token).
 * Usage: node test-pull-campaigns-for-user.js
 * Env: BACKEND_URL, LOGIN_EMAIL, LOGIN_PASSWORD
 */

const BACKEND_URL =
  process.env.BACKEND_URL || "https://web-production-737b.up.railway.app";
const EMAIL = process.env.LOGIN_EMAIL || "tshepomtshali89@gmail.com";
const PASSWORD = process.env.LOGIN_PASSWORD || "Kopenikus0218!";

async function main() {
  console.log("=== Pull campaigns for user ===\n");
  console.log("Backend URL:", BACKEND_URL);
  console.log("Email:", EMAIL);
  console.log("");

  let accessToken = null;

  const loginRes = await fetch(`${BACKEND_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const loginData = await loginRes.json();

  if (!loginRes.ok) {
    console.log("Login FAILED:", loginRes.status, loginData);
    process.exit(1);
  }

  accessToken = loginData.access_token;
  const user = loginData.user || loginData;
  console.log(
    "Logged in. User id:",
    user?.id,
    "| tier:",
    user?.subscription_tier
  );
  console.log("");

  console.log("GET /api/campaigns (Authorization: Bearer <token>)...");
  const campaignsRes = await fetch(`${BACKEND_URL}/api/campaigns`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const campaignsData = await campaignsRes.json().catch(() => ({}));

  if (!campaignsRes.ok) {
    console.log(
      "Campaigns request FAILED:",
      campaignsRes.status,
      campaignsData
    );
    process.exit(1);
  }

  const campaigns = campaignsData.campaigns || [];
  const pagination = campaignsData.pagination || {};

  console.log("OK.");
  console.log("Total campaigns returned:", campaigns.length);
  console.log("Pagination:", JSON.stringify(pagination, null, 2));
  console.log("");
  console.log("Campaigns:");
  if (campaigns.length === 0) {
    console.log("  (none)");
  } else {
    campaigns.forEach((c, i) => {
      console.log(
        `  ${i + 1}. id=${c.id} name="${c.name || ""}" status=${
          c.status
        } total_companies=${c.total_companies} user_id=${
          c.user_id
        } created_at=${c.created_at || ""}`
      );
    });
  }
  console.log("");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

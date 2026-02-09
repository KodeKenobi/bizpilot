/**
 * Login as tshepomtshali89@gmail.com and create a campaign (authenticated user).
 * Usage: node test-create-campaign-as-user.js [path-to-csv]
 * If path-to-csv is omitted, uses 3 hardcoded companies.
 * Example: node test-create-campaign-as-user.js main-leads.csv
 */

const fs = require("fs");
const path = require("path");

const BACKEND_URL =
  process.env.BACKEND_URL || "https://web-production-737b.up.railway.app";

const EMAIL = "tshepomtshali89@gmail.com";
const PASSWORD = "Kopenikus0218!";

const DEFAULT_COMPANIES = [
  {
    company_name: "3 Line Electrical Wholesale Ltd.",
    website_url: "https://3lineelectrical.co.uk",
  },
  { company_name: "4D modelshop Ltd", website_url: "https://modelshop.co.uk" },
  {
    company_name: "80S CASUAL CLASSICS LTD",
    website_url: "https://80scasualclassics.co.uk",
  },
];

function parseCsvRows(filePath, maxRows = 5) {
  const text = fs.readFileSync(filePath, "utf8");
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  const companies = [];
  for (let i = 0; i < Math.min(maxRows, lines.length); i++) {
    const line = lines[i];
    const parts = line.split(",");
    const name = (parts[0] || "").trim().replace(/^"|"$/g, "");
    let url = (parts[1] || "").trim().replace(/^"|"$/g, "");
    if (!url.startsWith("http")) url = "https://" + url;
    if (name && url) companies.push({ company_name: name, website_url: url });
  }
  return companies;
}

function getCompanies(csvPath) {
  if (csvPath && fs.existsSync(csvPath)) {
    const companies = parseCsvRows(csvPath, 5);
    if (companies.length) return companies;
  }
  return DEFAULT_COMPANIES;
}

async function main() {
  const csvPath = process.argv[2] || null;
  const companies = getCompanies(csvPath);

  console.log("=== Create campaign as user ===\n");
  console.log("Backend URL:", BACKEND_URL);
  console.log("Email:", EMAIL);
  console.log("Companies to add:", companies.length);
  console.log("");

  let accessToken = null;

  // 1) Login
  console.log("1) POST /auth/login ...");
  const loginRes = await fetch(`${BACKEND_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const loginData = await loginRes.json();

  if (!loginRes.ok) {
    console.log("   Login FAILED:", loginRes.status, loginData);
    process.exit(1);
  }

  accessToken = loginData.access_token;
  const user = loginData.user || loginData;
  console.log("   OK. User id:", user?.id, "| tier:", user?.subscription_tier);
  console.log("");

  if (!accessToken) {
    console.log("   No access_token.");
    process.exit(1);
  }

  // 2) Create campaign (no session_id – authenticated user)
  const campaignName =
    "Test campaign " +
    new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-");
  const messageTemplate = JSON.stringify({
    sender_name: "Test User",
    sender_first_name: "Test",
    sender_last_name: "User",
    sender_email: EMAIL,
    sender_phone: "+1 555-0000",
    sender_company: "Test Co",
    sender_country: "United Kingdom",
    sender_address: "",
    subject: "Partnership inquiry",
    message: "Hello, this is a test message from the create-campaign script.",
  });

  console.log("2) POST /api/campaigns (create campaign) ...");
  console.log("   Name:", campaignName);

  const createRes = await fetch(`${BACKEND_URL}/api/campaigns`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      name: campaignName,
      message_template: messageTemplate,
      companies,
      email: EMAIL,
      // no session_id – backend will use JWT user_id
    }),
  });

  const createData = await createRes.json().catch(() => ({}));

  if (!createRes.ok) {
    console.log("   Create FAILED:", createRes.status, createData);
    process.exit(1);
  }

  console.log("   OK.");
  console.log("   Campaign id:", createData.campaign?.id);
  console.log("   Campaign name:", createData.campaign?.name);
  console.log("   Status:", createData.campaign?.status);
  console.log("   Total companies:", createData.campaign?.total_companies);
  console.log("");
  console.log("Done. Campaign created for user", user?.email);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

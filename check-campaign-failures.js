#!/usr/bin/env node
/**
 * Fetch companies for a campaign and print why each failed (error_message, contact_method).
 * Usage: node check-campaign-failures.js <campaign_id>
 * Example: node check-campaign-failures.js 5
 * Env: BASE_URL (default https://www.trevnoctilla.com)
 */

const BASE_URL = process.env.BASE_URL || "https://www.trevnoctilla.com";
const campaignId = process.argv[2];

if (!campaignId) {
  console.error("Usage: node check-campaign-failures.js <campaign_id>");
  process.exit(1);
}

async function run() {
  const url = `${BASE_URL}/api/campaigns/${campaignId}/companies`;
  const res = await fetch(url);
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    console.error("API returned non-JSON:", text.slice(0, 200));
    process.exit(1);
  }

  const companies = data.companies || [];
  if (companies.length === 0) {
    console.log(
      "No companies in campaign or API error:",
      data.error || "unknown"
    );
    process.exit(0);
  }

  const failed = companies.filter(
    (c) => (c.status || "").toLowerCase() === "failed"
  );
  const completed = companies.filter(
    (c) => (c.status || "").toLowerCase() === "completed"
  );
  const other = companies.filter(
    (c) => !["failed", "completed"].includes((c.status || "").toLowerCase())
  );

  console.log("\n--- Campaign", campaignId, "---");
  console.log(
    "Total:",
    companies.length,
    "| Failed:",
    failed.length,
    "| Completed:",
    completed.length,
    "| Other:",
    other.length
  );

  if (failed.length === 0) {
    console.log("\nNo failed companies.");
    process.exit(0);
  }

  console.log("\n--- Why each company failed ---\n");
  const reasonCounts = {};

  for (const c of failed) {
    const method = c.contact_method || c.contactMethod || "unknown";
    const msg = c.error_message || c.errorMessage || "(no message)";
    const name = c.company_name || c.website_url || `id=${c.id}`;
    const urlStr = c.website_url || "";

    let category = "Other";
    if (method === "timeout" || /timeout|timed out/i.test(msg))
      category = "Timeout";
    else if (
      method === "no_contact_found" ||
      /no contact|no discovery/i.test(msg)
    )
      category = "No contact form";
    else if (method === "form_with_captcha" || /captcha/i.test(msg))
      category = "CAPTCHA";
    else if (method === "error" || /error|exception/i.test(msg))
      category = "Error/exception";

    reasonCounts[category] = (reasonCounts[category] || 0) + 1;

    console.log(`${name}`);
    console.log(`  URL: ${urlStr}`);
    console.log(`  contact_method: ${method}`);
    console.log(
      `  error_message: ${(msg + "").slice(0, 120)}${
        msg.length > 120 ? "..." : ""
      }`
    );
    console.log("");
  }

  console.log("--- Failure breakdown ---");
  for (const [reason, count] of Object.entries(reasonCounts).sort(
    (a, b) => b[1] - a[1]
  )) {
    console.log(`  ${reason}: ${count}`);
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

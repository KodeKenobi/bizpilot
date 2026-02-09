/**
 * Read main-leads.csv, go to each website, find the contact form, extract its fields.
 * Output: form-fields-report.json
 *
 * Usage: node extract-contact-form-fields.js [--limit N]
 */

const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const CSV_PATH = path.join(__dirname, "main-leads.csv");
const OUTPUT_PATH = path.join(__dirname, "form-fields-report.json");

function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const data = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const columns = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];
    if (columns.length < 2) continue;
    const company = columns[0].replace(/^"|"$/g, "").trim();
    let url = columns[1].replace(/^"|"$/g, "").trim();
    if (!url) continue;
    if (!url.startsWith("http")) url = "https://" + url;
    data.push({ company, url });
  }
  return data;
}

async function dismissCookies(page) {
  const selectors = [
    'button:has-text("Accept")',
    'button:has-text("Agree")',
    '[aria-label*="Accept"]',
    ".cookie-banner button",
  ];
  for (const s of selectors) {
    try {
      const btn = page.locator(s).first();
      if (await btn.isVisible({ timeout: 800 })) {
        await btn.click();
        await page.waitForTimeout(400);
        return;
      }
    } catch (e) {}
  }
}

async function findContactPage(page, baseUrl) {
  const contactSelectors =
    'a:has-text("Contact"), a:has-text("Get in touch"), a:has-text("Contact us"), a[href*="contact" i]';
  try {
    const footer = page.locator(
      "footer, [role='contentinfo'], .footer, #footer, .site-footer, .page-footer"
    );
    if ((await footer.count()) > 0) {
      const link = footer.locator(contactSelectors).first();
      if (
        (await link.count()) > 0 &&
        (await link.isVisible({ timeout: 1000 }))
      ) {
        const href = await link.getAttribute("href");
        if (href && !href.startsWith("mailto:") && !href.startsWith("tel:"))
          return new URL(href, baseUrl).href;
      }
    }
    const link = page.locator(contactSelectors).first();
    if ((await link.count()) > 0 && (await link.isVisible({ timeout: 1000 }))) {
      const href = await link.getAttribute("href");
      if (href && !href.startsWith("mailto:") && !href.startsWith("tel:"))
        return new URL(href, baseUrl).href;
    }
  } catch (e) {}
  return null;
}

async function findContactForm(page) {
  const tryForms = (loc) => loc.locator("form:visible");
  const forms = tryForms(page);
  let n = await forms.count();
  for (let i = 0; i < n; i++) {
    const f = forms.nth(i);
    const hasEmail =
      (await f.locator('input[type="email"], input[name*="email" i]').count()) >
      0;
    const hasTextarea = (await f.locator("textarea").count()) > 0;
    if (hasEmail || hasTextarea) return f;
  }
  if (n > 0) return forms.first();
  for (const frame of page.frames()) {
    if (frame === page.mainFrame()) continue;
    try {
      const frameForms = tryForms(frame);
      const fn = await frameForms.count();
      for (let i = 0; i < fn; i++) {
        const f = frameForms.nth(i);
        const hasEmail =
          (await f
            .locator('input[type="email"], input[name*="email" i]')
            .count()) > 0;
        if (hasEmail || (await f.locator("textarea").count()) > 0) return f;
      }
      if (fn > 0) return frameForms.first();
    } catch (e) {}
  }
  return null;
}

async function extractFormFields(form) {
  const fields = [];
  const inputs = form.locator("input:visible, textarea:visible");
  const count = await inputs.count();
  for (let i = 0; i < count; i++) {
    const el = inputs.nth(i);
    const type = (await el.getAttribute("type")) || "text";
    if (["hidden", "submit", "button", "image"].includes(type)) continue;
    const name = await el.getAttribute("name");
    const id = await el.getAttribute("id");
    const placeholder = await el.getAttribute("placeholder");
    const tag = await el.evaluate((el) => el.tagName.toLowerCase());
    let label = "";
    try {
      label = await el.evaluate((el) => {
        const id = el.id;
        if (id) {
          const l = document.querySelector('label[for="' + id + '"]');
          if (l) return (l.textContent || "").trim();
        }
        const prev = el.previousElementSibling;
        if (prev && (prev.tagName === "LABEL" || prev.textContent))
          return (prev.textContent || "").trim();
        const aria = el.getAttribute("aria-label");
        return aria ? aria.trim() : "";
      });
    } catch (e) {}
    fields.push({ tag, type, name, id, placeholder, label });
  }
  const selects = form.locator("select:visible");
  const selCount = await selects.count();
  for (let i = 0; i < selCount; i++) {
    const el = selects.nth(i);
    const name = await el.getAttribute("name");
    const id = await el.getAttribute("id");
    let label = "";
    try {
      label = await el.evaluate((el) => {
        const id = el.id;
        if (id) {
          const l = document.querySelector('label[for="' + id + '"]');
          if (l) return (l.textContent || "").trim();
        }
        const prev = el.previousElementSibling;
        if (prev) return (prev.textContent || "").trim();
        return el.getAttribute("aria-label") || "";
      });
    } catch (e) {}
    const options = await el.locator("option").evaluateAll((opts) =>
      opts.map((o) => ({
        value: o.getAttribute("value"),
        text: (o.textContent || "").trim(),
      }))
    );
    fields.push({ tag: "select", type: "select", name, id, label, options });
  }
  return fields;
}

async function main() {
  const limitIdx = process.argv.indexOf("--limit");
  const limit =
    limitIdx !== -1 && process.argv[limitIdx + 1]
      ? parseInt(process.argv[limitIdx + 1], 10)
      : null;

  if (!fs.existsSync(CSV_PATH)) {
    console.error("main-leads.csv not found in script directory");
    process.exit(1);
  }

  const rows = parseCSV(CSV_PATH);
  const toProcess = limit ? rows.slice(0, limit) : rows;
  console.log(
    `Processing ${toProcess.length} sites from main-leads.csv${
      limit ? ` (limit ${limit})` : ""
    }\n`
  );

  const report = [];
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });

  for (let i = 0; i < toProcess.length; i++) {
    const { company, url } = toProcess[i];
    const entry = { company, url, contactFormFields: null, error: null };
    const page = await context.newPage();
    page.setDefaultTimeout(20000);
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
      await page.waitForTimeout(1500);
      await dismissCookies(page);
      await page.waitForTimeout(500);

      let contactUrl = await findContactPage(page, url);
      if (contactUrl && contactUrl !== page.url()) {
        await page.goto(contactUrl, {
          waitUntil: "domcontentloaded",
          timeout: 15000,
        });
        await page.waitForTimeout(1000);
      } else {
        for (const p of ["/contact", "/contact-us", "/get-in-touch"]) {
          try {
            const testUrl = new URL(p, url).href;
            const resp = await page.goto(testUrl, {
              waitUntil: "domcontentloaded",
              timeout: 8000,
            });
            if (resp && resp.status() < 400) {
              await page.waitForTimeout(1000);
              break;
            }
          } catch (e) {}
        }
      }

      const form = await findContactForm(page);
      if (form) {
        entry.contactFormFields = await extractFormFields(form);
        console.log(
          `[${i + 1}/${toProcess.length}] ${company} — ${
            entry.contactFormFields.length
          } fields`
        );
      } else {
        entry.error = "No contact form found";
        console.log(`[${i + 1}/${toProcess.length}] ${company} — no form`);
      }
    } catch (e) {
      entry.error = e.message || String(e);
      console.log(`[${i + 1}/${toProcess.length}] ${company} — ${entry.error}`);
    }
    await page.close();
    report.push(entry);
  }

  await browser.close();
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(report, null, 2), "utf-8");
  console.log(`\nWrote ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

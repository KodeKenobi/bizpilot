/**
 * Test: open https://7core.co.uk HOMEPAGE only (do not navigate to Contact).
 * Find all forms on the homepage, list fields, and distinguish e.g. contact vs newsletter.
 * Run: node test-7core-form-fields.js
 */

const { chromium } = require("playwright");

const TARGET_URL = "https://7core.co.uk";
const SLOW_MO_MS = 80;

async function getLabelForElement(page, el) {
  try {
    const id = await el.getAttribute("id");
    if (id) {
      const labelEl = await page.locator(`label[for="${id}"]`).first();
      if ((await labelEl.count()) > 0)
        return (await labelEl.textContent()) || "";
    }
    const parent = await el.locator("xpath=..").first();
    if ((await parent.count()) > 0) {
      const tag = await parent.evaluate((n) => n.tagName);
      if (tag === "LABEL") return (await parent.textContent()) || "";
    }
    const prev = await el.locator("xpath=preceding-sibling::*[1]").first();
    if ((await prev.count()) > 0) return (await prev.textContent()) || "";
  } catch (e) {}
  return "";
}

async function run() {
  const browser = await chromium.launch({
    headless: true,
    slowMo: SLOW_MO_MS,
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
  });

  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  page.setDefaultNavigationTimeout(20000);

  const fieldsFound = [];
  const fieldsFilled = [];

  try {
    console.log("\n[1] Navigating to", TARGET_URL, "\n");
    await page.goto(TARGET_URL, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);

    // Dismiss cookie banner if present
    try {
      const accept = page
        .locator(
          'button:has-text("Accept"), button:has-text("Agree"), [aria-label*="Accept" i]'
        )
        .first();
      if (await accept.isVisible({ timeout: 1500 })) {
        await accept.click();
        await page.waitForTimeout(500);
      }
    } catch (e) {}

    // Stay on HOMEPAGE — do not click Contact (that page has newsletter form)
    // Scroll down so any below-fold contact form is in DOM
    await page.evaluate(() =>
      window.scrollTo(0, document.body.scrollHeight / 2)
    );
    await page.waitForTimeout(800);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(800);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    // Find forms on homepage only
    const forms = await page.locator("form").all();
    console.log("[2] Forms on page:", forms.length, "\n");

    for (let formIndex = 0; formIndex < forms.length; formIndex++) {
      const form = forms[formIndex];
      const formId = await form.getAttribute("id").catch(() => "");
      const formName = await form.getAttribute("name").catch(() => "");
      const formInfo = formId || formName || `form ${formIndex + 1}`;
      const formFieldsForThis = [];
      console.log("--- Form:", formInfo, "(homepage) ---");

      let oneBranchCheckboxChecked = false;

      // Inputs
      const inputs = await form
        .locator(
          "input:not([type='hidden']):not([type='submit']):not([type='image'])"
        )
        .all();
      for (const el of inputs) {
        try {
          if (!(await el.isVisible())) continue;
          const tag = "input";
          const type = (await el.getAttribute("type")) || "text";
          const name = (await el.getAttribute("name")) || "";
          const id = (await el.getAttribute("id")) || "";
          const placeholder = (await el.getAttribute("placeholder")) || "";
          const label = await getLabelForElement(page, el);
          const required = (await el.getAttribute("required")) != null;
          const info = {
            tag,
            type,
            name,
            id,
            label: label.trim(),
            placeholder,
            required,
          };
          fieldsFound.push(info);
          formFieldsForThis.push(info);
          console.log("  [FOUND] input", JSON.stringify(info));

          let filled = false;
          const role = (name || id || label).toLowerCase();
          if (type === "email") {
            await el.fill("test@example.com");
            filled = true;
          } else if (
            type === "tel" ||
            type === "phone" ||
            role.includes("phone")
          ) {
            await el.fill("07700900123");
            filled = true;
          } else if (
            role.includes("first") ||
            (role.includes("name") &&
              !role.includes("last") &&
              !role.includes("company"))
          ) {
            await el.fill("Test");
            filled = true;
          } else if (role.includes("last")) {
            await el.fill("User");
            filled = true;
          } else if (role.includes("company")) {
            await el.fill("Test Ltd");
            filled = true;
          } else if (type === "text") {
            await el.fill("Test value");
            filled = true;
          } else if (type === "checkbox") {
            const isBranch =
              role.includes("branch") ||
              role.includes("location") ||
              (name && name.toLowerCase().includes("branch"));
            if (isBranch && !oneBranchCheckboxChecked) {
              await el.check();
              filled = true;
              oneBranchCheckboxChecked = true;
              console.log(
                "  [FILLED] branch checkbox (one selected):",
                label || name || id
              );
            }
          }
          if (filled) {
            fieldsFilled.push(info);
            if (type !== "checkbox" || !role.includes("branch")) {
              console.log("  [FILLED] input", name || id || "(no name)");
            }
          }
        } catch (e) {
          console.log("  [SKIP input]", e.message);
        }
      }

      // Textareas
      const textareas = await form.locator("textarea").all();
      for (const el of textareas) {
        try {
          if (!(await el.isVisible())) continue;
          const name = (await el.getAttribute("name")) || "";
          const id = (await el.getAttribute("id")) || "";
          const placeholder = (await el.getAttribute("placeholder")) || "";
          const label = await getLabelForElement(page, el);
          const info = {
            tag: "textarea",
            name,
            id,
            label: label.trim(),
            placeholder,
          };
          fieldsFound.push(info);
          formFieldsForThis.push(info);
          console.log("  [FOUND] textarea", JSON.stringify(info));
          await el.fill("This is a test message from the 7core form test.");
          fieldsFilled.push(info);
          console.log("  [FILLED] textarea", name || id || "(no name)");
        } catch (e) {
          console.log("  [SKIP textarea]", e.message);
        }
      }

      // Selects (Wix often uses custom dropdowns: native select may be hidden; visible is div. Try both.)
      const selects = await form.locator("select").all();
      for (const el of selects) {
        try {
          const name = (await el.getAttribute("name")) || "";
          const id = (await el.getAttribute("id")) || "";
          const label = await getLabelForElement(page, el);
          const options = await el.locator("option").all();
          const optionTexts = [];
          for (const opt of options) {
            const v = await opt.getAttribute("value");
            const t = await opt.textContent();
            optionTexts.push({ value: v || "", text: (t || "").trim() });
          }
          const info = {
            tag: "select",
            name,
            id,
            label: label.trim(),
            options: optionTexts,
          };
          fieldsFound.push(info);
          formFieldsForThis.push(info);
          console.log("  [FOUND] select", JSON.stringify(info));

          // First real option (skip "Choose a branch" etc.)
          let pickIndex = 0;
          let pickValue = optionTexts[0]?.value;
          let pickText = optionTexts[0]?.text || "";
          if (options.length > 1) {
            const firstText = (optionTexts[0]?.text || "").toLowerCase();
            if (/choose|select|please|--/.test(firstText)) {
              pickIndex = 1;
              pickValue = optionTexts[1]?.value;
              pickText = optionTexts[1]?.text || "";
            }
          }

          let selectFilled = false;
          const isVisible = await el.isVisible().catch(() => false);

          // 1) Native select: set value and dispatch events (so Wix JS sees it)
          try {
            if (pickValue) {
              await el.selectOption({ value: pickValue });
              await el.evaluate((node) => {
                node.dispatchEvent(new Event("change", { bubbles: true }));
                node.dispatchEvent(new Event("input", { bubbles: true }));
              });
              selectFilled = true;
              console.log(
                "  [FILLED] select (native value)",
                name || id,
                "->",
                pickValue
              );
            } else {
              await el.selectOption({ index: pickIndex });
              await el.evaluate((node) => {
                node.dispatchEvent(new Event("change", { bubbles: true }));
                node.dispatchEvent(new Event("input", { bubbles: true }));
              });
              selectFilled = true;
              console.log(
                "  [FILLED] select (index)",
                name || id,
                "-> index",
                pickIndex
              );
            }
          } catch (e) {
            console.log("  [selectOption failed]", e.message);
          }

          // 2) Wix custom dropdown: if native select is hidden, click the visible trigger then click option by text
          if (!selectFilled || !isVisible) {
            try {
              const branchLabel = (label || "").toLowerCase().includes("branch")
                ? "Branch"
                : null;
              const dropdownTrigger = branchLabel
                ? page
                    .getByLabel(branchLabel, { exact: false })
                    .or(
                      page
                        .locator(
                          "[data-id*='branch' i], [id*='branch' i], [aria-haspopup='listbox']"
                        )
                        .first()
                    )
                : null;
              const trigger = dropdownTrigger || el;
              await trigger.scrollIntoViewIfNeeded();
              await trigger.click();
              await page.waitForTimeout(300);
              const optionLocator = page
                .getByRole("option", { name: pickText })
                .or(page.getByText(pickText, { exact: true }));
              if ((await optionLocator.count()) > 0) {
                await optionLocator.first().click();
                selectFilled = true;
                console.log(
                  "  [FILLED] select (custom dropdown click)",
                  name || id,
                  "->",
                  pickText
                );
              }
            } catch (e2) {
              console.log("  [custom dropdown fallback failed]", e2.message);
            }
          }

          if (selectFilled) fieldsFilled.push(info);
        } catch (e) {
          console.log("  [SKIP select]", e.message);
        }
      }

      // Infer form type from field labels (homepage: search vs newsletter vs contact)
      const labels = formFieldsForThis
        .map((f) => (f.label || "").toLowerCase())
        .join(" ");
      const hasMessage =
        /message|enquiry|enquiry message|your message|comments/.test(labels);
      const hasSearch = formFieldsForThis.some(
        (f) =>
          f.name === "q" ||
          (f.placeholder || "").toLowerCase().includes("search")
      );
      const hasFirstLastOnly =
        /first name|last name/.test(labels) &&
        !hasMessage &&
        formFieldsForThis.length <= 4;
      let formType = "unknown";
      if (hasSearch) formType = "SEARCH";
      else if (hasFirstLastOnly && !hasMessage)
        formType = "NEWSLETTER (First/Last name, no message)";
      else if (hasMessage) formType = "CONTACT (has message/enquiry field)";
      console.log("  [FORM TYPE]", formType);
      console.log("");
    }

    console.log("\n========== SUMMARY ==========\n");
    console.log("Fields found:", fieldsFound.length);
    fieldsFound.forEach((f, i) =>
      console.log(
        `  ${i + 1}. ${f.tag} name="${f.name || ""}" id="${
          f.id || ""
        }" label="${(f.label || "").slice(0, 40)}"`
      )
    );
    console.log("\nFields filled:", fieldsFilled.length);
    fieldsFilled.forEach((f, i) =>
      console.log(
        `  ${i + 1}. ${f.tag} name="${f.name || ""}" id="${f.id || ""}"`
      )
    );
    console.log("\n==============================\n");
  } finally {
    await browser.close();
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

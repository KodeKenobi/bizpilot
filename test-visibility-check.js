const fetch = require("node-fetch");

console.log("=== TESTING: Why contact links fail visibility check ===\n");

fetch("https://www.trevnoctilla.com")
  .then((r) => r.text())
  .then((html) => {
    console.log("Checking contact links in HTML....\n");

    // Find contact link contexts
    const linkRegex = /(<[^>]{0,200}href=["']\/contact["'][^>]{0,200}>)/gi;
    const matches = html.match(linkRegex);

    if (matches) {
      console.log(`Found ${matches.length} contact links:\n`);

      matches.forEach((match, i) => {
        console.log(`--- Link ${i + 1} ---`);
        console.log(match);

        // Check for visibility issues
        if (match.includes("opacity:0") || match.includes("opacity: 0")) {
          console.log("❌ ISSUE: Has opacity:0 (invisible)");
        }
        if (match.includes("display:none") || match.includes("display: none")) {
          console.log("❌ ISSUE: Has display:none (hidden)");
        }
        if (
          match.includes("visibility:hidden") ||
          match.includes("visibility: hidden")
        ) {
          console.log("❌ ISSUE: Has visibility:hidden");
        }
        if (match.includes("translateX") || match.includes("translateY")) {
          console.log("⚠️  WARNING: Has transform (animation)");
        }

        console.log("");
      });

      console.log("\n=== CONCLUSION ===");
      console.log(
        "If links have opacity:0 or display:none, is_visible() returns FALSE"
      );
      console.log(
        "Async scraper ALSO checks is_visible() - so why does it work?"
      );
      console.log("\nPossible reasons:");
      console.log("1. Async waits longer for animations to complete");
      console.log("2. Different Playwright API behavior");
      console.log("3. Sync version has different timing");
    } else {
      console.log("No contact links found");
    }
  });

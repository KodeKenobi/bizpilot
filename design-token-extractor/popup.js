// Tab switching
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    const tabName = tab.dataset.tab;

    // Update active tab
    document
      .querySelectorAll(".tab")
      .forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    // Update active content
    document.querySelectorAll(".tab-content").forEach((content) => {
      content.classList.remove("active");
    });
    document.getElementById(tabName).classList.add("active");
  });
});

// Extract button
document.getElementById("extractBtn").addEventListener("click", async () => {
  const btn = document.getElementById("extractBtn");
  const loading = document.getElementById("loading");
  const results = document.getElementById("results");
  const empty = document.getElementById("empty");

  btn.disabled = true;
  loading.style.display = "block";
  results.style.display = "none";
  empty.style.display = "none";

  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    // Check if we're on a valid page
    if (
      !tab.url ||
      tab.url.startsWith("chrome://") ||
      tab.url.startsWith("chrome-extension://") ||
      tab.url.startsWith("edge://") ||
      tab.url.startsWith("about:")
    ) {
      throw new Error(
        "Cannot extract tokens from this page. Please navigate to a regular website (like github.com)."
      );
    }

    // Inject content script
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
    });

    // Wait a moment for script to load
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Try to send message to content script
    let response;
    try {
      response = await chrome.tabs.sendMessage(tab.id, {
        action: "extractTokens",
      });
    } catch (messageError) {
      // If message fails, the content script might not have the listener ready
      // Try executing the extraction function directly
      console.log("Message failed, trying direct execution...");
      const extractionResults = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          // This function will be executed in the page context
          // We need to access the extractDesignTokens function from content script
          // Since content scripts run in isolated world, we'll extract directly here
          return (function () {
            const tokens = {
              colors: { background: [], text: [], border: [], unique: [] },
              spacing: { all: [], unique: [] },
              typography: {
                fontFamilies: [],
                fontSizes: [],
                fontWeights: [],
                combinations: [],
              },
            };
            const colorSet = new Set();
            const spacingSet = new Set();
            const fontFamilySet = new Set();
            const fontSizeSet = new Set();
            const fontWeightSet = new Set();

            document.querySelectorAll("*").forEach((element) => {
              try {
                const styles = window.getComputedStyle(element);

                // Colors
                [
                  styles.backgroundColor,
                  styles.color,
                  styles.borderColor,
                ].forEach((color, idx) => {
                  if (
                    color &&
                    color !== "rgba(0, 0, 0, 0)" &&
                    color !== "transparent"
                  ) {
                    const rgb = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
                    if (rgb) {
                      const hex =
                        "#" +
                        [rgb[1], rgb[2], rgb[3]]
                          .map((x) => {
                            const h = parseInt(x).toString(16);
                            return h.length === 1 ? "0" + h : h;
                          })
                          .join("");
                      if (!colorSet.has(hex)) {
                        colorSet.add(hex);
                        if (idx === 0)
                          tokens.colors.background.push({ value: hex });
                        else if (idx === 1)
                          tokens.colors.text.push({ value: hex });
                        else tokens.colors.border.push({ value: hex });
                      }
                    }
                  }
                });

                // Spacing with context
                const tagName = element.tagName?.toLowerCase() || "unknown";
                const elementText =
                  element.textContent?.trim().substring(0, 50) || "";
                const spacingTypes = [
                  { value: styles.margin, type: "margin" },
                  { value: styles.padding, type: "padding" },
                  { value: styles.gap, type: "gap" },
                ];

                spacingTypes.forEach(({ value, type }) => {
                  if (value && value !== "0px" && value !== "normal") {
                    value
                      .split(" ")
                      .filter((v) => v && v !== "auto")
                      .forEach((val) => {
                        if (val && !spacingSet.has(val)) {
                          spacingSet.add(val);
                          tokens.spacing.all.push({
                            value: val,
                            type: type,
                            element: tagName,
                            context: elementText || tagName,
                          });
                        }
                      });
                  }
                });

                // Typography with context
                if (
                  styles.fontFamily &&
                  styles.fontSize &&
                  styles.fontSize !== "0px"
                ) {
                  const fontName = styles.fontFamily
                    .split(",")[0]
                    .trim()
                    .replace(/['"]/g, "");
                  const textSample = elementText || tagName;

                  if (!tokens.typography.combinations) {
                    tokens.typography.combinations = [];
                  }

                  const existingCombo = tokens.typography.combinations.find(
                    (c) =>
                      c.font === fontName &&
                      c.size === styles.fontSize &&
                      c.weight === (styles.fontWeight || "normal")
                  );

                  if (!existingCombo) {
                    tokens.typography.combinations.push({
                      font: fontName,
                      size: styles.fontSize,
                      weight: styles.fontWeight || "normal",
                      lineHeight: styles.lineHeight,
                      examples: [textSample || tagName],
                      element: tagName,
                    });
                  } else if (
                    textSample &&
                    !existingCombo.examples.includes(textSample)
                  ) {
                    existingCombo.examples.push(textSample);
                  }

                  if (!fontFamilySet.has(styles.fontFamily)) {
                    fontFamilySet.add(styles.fontFamily);
                    tokens.typography.fontFamilies.push(fontName);
                  }

                  if (!fontSizeSet.has(styles.fontSize)) {
                    fontSizeSet.add(styles.fontSize);
                    tokens.typography.fontSizes.push(styles.fontSize);
                  }

                  if (
                    styles.fontWeight &&
                    styles.fontWeight !== "normal" &&
                    styles.fontWeight !== "400" &&
                    !fontWeightSet.has(styles.fontWeight)
                  ) {
                    fontWeightSet.add(styles.fontWeight);
                    tokens.typography.fontWeights.push(styles.fontWeight);
                  }
                }
              } catch (e) {
                // Skip elements that can't be styled
              }
            });

            tokens.colors.unique = Array.from(colorSet).map((hex) => ({
              value: hex,
            }));

            // Process spacing.all to create unique list
            if (
              tokens.spacing.all.length > 0 &&
              typeof tokens.spacing.all[0] === "object"
            ) {
              const uniqueValues = [
                ...new Set(tokens.spacing.all.map((s) => s.value)),
              ];
              tokens.spacing.unique = uniqueValues.sort(
                (a, b) => parseFloat(a) - parseFloat(b)
              );
            } else {
              tokens.spacing.unique = Array.from(spacingSet).sort(
                (a, b) => parseFloat(a) - parseFloat(b)
              );
            }

            tokens.typography.fontFamilies = [
              ...new Set(tokens.typography.fontFamilies),
            ];
            tokens.typography.fontSizes = [
              ...new Set(tokens.typography.fontSizes),
            ].sort((a, b) => parseFloat(a) - parseFloat(b));
            tokens.typography.fontWeights = [
              ...new Set(tokens.typography.fontWeights),
            ].sort((a, b) => parseInt(a) - parseInt(b));

            return tokens;
          })();
        },
      });

      if (
        extractionResults &&
        extractionResults[0] &&
        extractionResults[0].result
      ) {
        response = { tokens: extractionResults[0].result };
      } else {
        throw new Error("Failed to extract tokens");
      }
    }

    if (response && response.tokens) {
      displayTokens(response.tokens);
      loading.style.display = "none";
      results.style.display = "block";
    } else if (response && response.error) {
      throw new Error(response.error);
    } else {
      throw new Error("No tokens extracted");
    }
  } catch (error) {
    console.error("Error:", error);
    loading.style.display = "none";
    empty.style.display = "block";
    const errorMessage =
      error.message ||
      "Error extracting tokens. Make sure you're on a valid webpage.";
    empty.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p>${errorMessage}</p>
    `;
  } finally {
    btn.disabled = false;
  }
});

function displayTokens(tokens) {
  // Update stats
  document.getElementById("colorCount").textContent =
    tokens.colors.unique.length;
  document.getElementById("spacingCount").textContent =
    tokens.spacing.unique.length;
  document.getElementById("typographyCount").textContent =
    tokens.typography.fontFamilies.length + tokens.typography.fontSizes.length;

  // Display colors
  displayColors(tokens.colors);

  // Display spacing
  displaySpacing(tokens.spacing);

  // Display typography
  displayTypography(tokens.typography);

  // Store tokens for export
  window.extractedTokens = tokens;
}

function displayColors(colors) {
  const bgColorsEl = document.getElementById("bgColors");
  const textColorsEl = document.getElementById("textColors");
  const borderColorsEl = document.getElementById("borderColors");

  bgColorsEl.innerHTML = "";
  textColorsEl.innerHTML = "";
  borderColorsEl.innerHTML = "";

  colors.background.forEach((color) => {
    bgColorsEl.appendChild(createColorItem(color));
  });

  colors.text.forEach((color) => {
    textColorsEl.appendChild(createColorItem(color));
  });

  colors.border.forEach((color) => {
    borderColorsEl.appendChild(createColorItem(color));
  });
}

function createColorItem(color) {
  const item = document.createElement("div");
  item.className = "token-item";
  item.innerHTML = `
    <div class="color-preview" style="background-color: ${color.value}"></div>
    <div class="token-label">Value</div>
    <div class="token-value">${color.value}</div>
  `;
  item.addEventListener("click", () => {
    navigator.clipboard.writeText(color.value);
    item.style.borderColor = "#667eea";
    setTimeout(() => {
      item.style.borderColor = "#333";
    }, 500);
  });
  return item;
}

function displaySpacing(spacing) {
  const spacingEl = document.getElementById("spacingValues");
  spacingEl.innerHTML = "";

  // Group spacing by value
  const spacingMap = new Map();

  // Process spacing.all if it has context, otherwise use unique
  const spacingItems =
    spacing.all && spacing.all.length > 0 && typeof spacing.all[0] === "object"
      ? spacing.all
      : spacing.unique.map((v) => ({ value: v }));

  spacingItems.forEach((item) => {
    const value = typeof item === "string" ? item : item.value;
    if (!spacingMap.has(value)) {
      spacingMap.set(value, {
        value: value,
        types: new Set(),
        contexts: [],
      });
    }
    const entry = spacingMap.get(value);
    if (item.type) entry.types.add(item.type);
    if (item.context && !entry.contexts.includes(item.context)) {
      entry.contexts.push(item.context);
    }
    if (item.contexts) {
      item.contexts.forEach((ctx) => {
        if (!entry.contexts.includes(ctx)) entry.contexts.push(ctx);
      });
    }
  });

  // Sort by value
  const sortedSpacing = Array.from(spacingMap.values()).sort((a, b) => {
    return parseFloat(a.value) - parseFloat(b.value);
  });

  sortedSpacing.forEach((item) => {
    const itemEl = document.createElement("div");
    itemEl.className = "spacing-item";
    const types = Array.from(item.types).join(", ") || "spacing";
    const context =
      item.contexts.length > 0
        ? item.contexts.slice(0, 2).join(", ") +
          (item.contexts.length > 2 ? "..." : "")
        : "";

    itemEl.innerHTML = `
      <div style="flex: 1;">
        <div class="token-label">${types.toUpperCase()}</div>
        <div class="token-value">${item.value}</div>
        ${
          context
            ? `<div style="font-size: 10px; color: #999; margin-top: 4px; font-style: italic;">${context}</div>`
            : ""
        }
      </div>
      <div class="spacing-visual" style="width: ${Math.min(
        parseInt(item.value) || 0,
        200
      )}px"></div>
    `;
    itemEl.addEventListener("click", () => {
      navigator.clipboard.writeText(item.value);
      itemEl.style.borderColor = "#667eea";
      setTimeout(() => {
        itemEl.style.borderColor = "#333";
      }, 500);
    });
    spacingEl.appendChild(itemEl);
  });
}

function displayTypography(typography) {
  // Show combinations first if available
  if (typography.combinations && typography.combinations.length > 0) {
    const familiesEl = document.getElementById("fontFamilies");
    familiesEl.innerHTML = "";

    typography.combinations.forEach((combo) => {
      const item = document.createElement("div");
      item.className = "typography-item";
      const examples = combo.examples.slice(0, 3).join(" • ");
      item.innerHTML = `
        <div class="token-label">Font Family • Size • Weight</div>
        <div class="token-value">${combo.font} • ${combo.size} • ${
        combo.weight
      }</div>
        <div class="typography-preview" style="font-family: ${
          combo.font
        }; font-size: ${combo.size}; font-weight: ${combo.weight}">
          ${combo.examples[0] || "Sample text"}
        </div>
        <div style="font-size: 10px; color: #999; margin-top: 6px;">
          Used in: ${examples}${combo.examples.length > 3 ? "..." : ""}
        </div>
      `;
      familiesEl.appendChild(item);
    });
  } else {
    // Fallback to individual lists
    const familiesEl = document.getElementById("fontFamilies");
    familiesEl.innerHTML = "";
    typography.fontFamilies.forEach((font) => {
      const item = document.createElement("div");
      item.className = "typography-item";
      item.innerHTML = `
        <div class="token-label">Font Family</div>
        <div class="token-value">${font}</div>
        <div class="typography-preview" style="font-family: ${font}">The quick brown fox jumps over the lazy dog</div>
      `;
      familiesEl.appendChild(item);
    });
  }

  // Font Sizes
  const sizesEl = document.getElementById("fontSizes");
  sizesEl.innerHTML = "";
  typography.fontSizes.forEach((size) => {
    const item = document.createElement("div");
    item.className = "typography-item";
    item.innerHTML = `
      <div class="token-label">Font Size</div>
      <div class="token-value">${size}</div>
      <div class="typography-preview" style="font-size: ${size}">Sample text at ${size}</div>
    `;
    sizesEl.appendChild(item);
  });

  // Font Weights
  const weightsEl = document.getElementById("fontWeights");
  weightsEl.innerHTML = "";
  typography.fontWeights.forEach((weight) => {
    const item = document.createElement("div");
    item.className = "typography-item";
    item.innerHTML = `
      <div class="token-label">Font Weight</div>
      <div class="token-value">${weight}</div>
      <div class="typography-preview" style="font-weight: ${weight}">Sample text at weight ${weight}</div>
    `;
    weightsEl.appendChild(item);
  });
}

// Export functions
document.getElementById("exportJson").addEventListener("click", () => {
  if (!window.extractedTokens) return;
  const json = JSON.stringify(window.extractedTokens, null, 2);
  downloadFile(json, "design-tokens.json", "application/json");
});

document.getElementById("exportCSS").addEventListener("click", () => {
  if (!window.extractedTokens) return;
  const css = generateCSSVariables(window.extractedTokens);
  downloadFile(css, "design-tokens.css", "text/css");
});

document.getElementById("exportTS").addEventListener("click", () => {
  if (!window.extractedTokens) return;
  const ts = generateTypeScript(window.extractedTokens);
  downloadFile(ts, "design-tokens.ts", "text/typescript");
});

document.getElementById("exportTailwind").addEventListener("click", () => {
  if (!window.extractedTokens) return;
  const tailwind = generateTailwindConfig(window.extractedTokens);
  downloadFile(tailwind, "tailwind.config.js", "text/javascript");
});

function generateCSSVariables(tokens) {
  let css = ":root {\n";

  // Colors
  css += "  /* Colors */\n";
  tokens.colors.unique.forEach((color, index) => {
    css += `  --color-${index + 1}: ${color.value};\n`;
  });

  // Spacing
  css += "\n  /* Spacing */\n";
  tokens.spacing.unique.forEach((spacing, index) => {
    css += `  --spacing-${index + 1}: ${spacing};\n`;
  });

  // Typography
  css += "\n  /* Typography */\n";
  tokens.typography.fontFamilies.forEach((font, index) => {
    css += `  --font-family-${index + 1}: ${font};\n`;
  });

  tokens.typography.fontSizes.forEach((size, index) => {
    css += `  --font-size-${index + 1}: ${size};\n`;
  });

  css += "}\n";
  return css;
}

function generateTypeScript(tokens) {
  let ts = "export const designTokens = {\n";

  ts += "  colors: {\n";
  tokens.colors.unique.forEach((color, index) => {
    ts += `    color${index + 1}: '${color.value}',\n`;
  });
  ts += "  },\n";

  ts += "  spacing: {\n";
  tokens.spacing.unique.forEach((spacing, index) => {
    ts += `    spacing${index + 1}: '${spacing}',\n`;
  });
  ts += "  },\n";

  ts += "  typography: {\n";
  ts += "    fontFamilies: [\n";
  tokens.typography.fontFamilies.forEach((font) => {
    ts += `      '${font}',\n`;
  });
  ts += "    ],\n";
  ts += "    fontSizes: [\n";
  tokens.typography.fontSizes.forEach((size) => {
    ts += `      '${size}',\n`;
  });
  ts += "    ],\n";
  ts += "  },\n";

  ts += "} as const;\n";
  return ts;
}

function generateTailwindConfig(tokens) {
  let config = `/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {\n`;

  // Add colors
  tokens.colors.unique.forEach((color, index) => {
    const colorName = `color${index + 1}`;
    config += `        '${colorName}': '${color.value}',\n`;
  });

  config += `      },\n      spacing: {\n`;

  // Add spacing
  tokens.spacing.unique.forEach((spacing, index) => {
    const spacingName = `spacing${index + 1}`;
    config += `        '${spacingName}': '${spacing}',\n`;
  });

  config += `      },\n      fontFamily: {\n`;

  // Add font families
  tokens.typography.fontFamilies.forEach((font, index) => {
    const fontName = `font${index + 1}`;
    config += `        '${fontName}': [${font
      .split(",")
      .map((f) => `'${f.trim().replace(/['"]/g, "")}'`)
      .join(", ")}],\n`;
  });

  config += `      },\n      fontSize: {\n`;

  // Add font sizes
  tokens.typography.fontSizes.forEach((size, index) => {
    const sizeName = `size${index + 1}`;
    config += `        '${sizeName}': '${size}',\n`;
  });

  config += `      },\n      fontWeight: {\n`;

  // Add font weights
  tokens.typography.fontWeights.forEach((weight, index) => {
    const weightName = `weight${index + 1}`;
    config += `        '${weightName}': '${weight}',\n`;
  });

  config += `      },\n    },\n  },\n  plugins: [],\n};\n`;

  return config;
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

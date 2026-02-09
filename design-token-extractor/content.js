// Design Token Extractor Content Script

function extractDesignTokens() {
  const tokens = {
    colors: {
      background: [],
      text: [],
      border: [],
      unique: [],
    },
    spacing: {
      all: [],
      unique: [],
    },
    typography: {
      fontFamilies: [],
      fontSizes: [],
      fontWeights: [],
      lineHeights: [],
      combinations: [],
    },
  };

  // Get all elements
  const allElements = document.querySelectorAll("*");
  const colorSet = new Set();
  const spacingSet = new Set();
  const fontFamilySet = new Set();
  const fontSizeSet = new Set();
  const fontWeightSet = new Set();

  allElements.forEach((element) => {
    const styles = window.getComputedStyle(element);

    // Extract colors
    const bgColor = styles.backgroundColor;
    const textColor = styles.color;
    const borderColor = styles.borderColor;

    if (
      bgColor &&
      bgColor !== "rgba(0, 0, 0, 0)" &&
      bgColor !== "transparent"
    ) {
      const rgb = parseColor(bgColor);
      if (rgb) {
        const hex = rgbToHex(rgb);
        if (!colorSet.has(hex)) {
          colorSet.add(hex);
          tokens.colors.background.push({ value: hex, rgb: rgb });
        }
      }
    }

    if (textColor && textColor !== "rgba(0, 0, 0, 0)") {
      const rgb = parseColor(textColor);
      if (rgb) {
        const hex = rgbToHex(rgb);
        if (!colorSet.has(hex)) {
          colorSet.add(hex);
          tokens.colors.text.push({ value: hex, rgb: rgb });
        }
      }
    }

    if (
      borderColor &&
      borderColor !== "rgba(0, 0, 0, 0)" &&
      borderColor !== "transparent"
    ) {
      const rgb = parseColor(borderColor);
      if (rgb) {
        const hex = rgbToHex(rgb);
        if (!colorSet.has(hex)) {
          colorSet.add(hex);
          tokens.colors.border.push({ value: hex, rgb: rgb });
        }
      }
    }

    // Extract spacing with context
    const margin = styles.margin;
    const padding = styles.padding;
    const gap = styles.gap;
    const tagName = element.tagName?.toLowerCase() || "unknown";
    const elementText = element.textContent?.trim().substring(0, 50) || "";

    const spacingTypes = [
      { value: margin, type: "margin" },
      { value: padding, type: "padding" },
      { value: gap, type: "gap" },
    ];

    spacingTypes.forEach(({ value, type }) => {
      if (value && value !== "0px" && value !== "normal") {
        const values = value.split(" ").filter((v) => v && v !== "auto");
        values.forEach((val) => {
          if (val && !spacingSet.has(val)) {
            spacingSet.add(val);
            tokens.spacing.all.push({
              value: val,
              type: type,
              element: tagName,
              context: elementText || tagName,
            });
          } else if (val) {
            // Add context to existing spacing value
            const existing = tokens.spacing.all.find((s) => s.value === val);
            if (existing && !existing.contexts) {
              existing.contexts = [existing.context];
              existing.context = undefined;
            }
            if (existing && existing.contexts) {
              if (!existing.contexts.includes(elementText || tagName)) {
                existing.contexts.push(elementText || tagName);
              }
            }
          }
        });
      }
    });

    // Extract typography with context
    const fontFamily = styles.fontFamily;
    const fontSize = styles.fontSize;
    const fontWeight = styles.fontWeight;
    const lineHeight = styles.lineHeight;

    if (fontFamily && fontSize && fontSize !== "0px") {
      const fontName = fontFamily.split(",")[0].trim().replace(/['"]/g, "");
      const textSample = elementText || tagName;

      // Store typography combinations with context
      const typoKey = `${fontName}-${fontSize}-${fontWeight || "normal"}`;
      if (!tokens.typography.combinations) {
        tokens.typography.combinations = [];
      }

      const existingCombo = tokens.typography.combinations.find(
        (c) =>
          c.font === fontName &&
          c.size === fontSize &&
          c.weight === (fontWeight || "normal")
      );

      if (!existingCombo) {
        tokens.typography.combinations.push({
          font: fontName,
          size: fontSize,
          weight: fontWeight || "normal",
          lineHeight: lineHeight,
          examples: [textSample || tagName],
          element: tagName,
        });
      } else if (textSample && !existingCombo.examples.includes(textSample)) {
        existingCombo.examples.push(textSample);
      }

      if (!fontFamilySet.has(fontFamily)) {
        fontFamilySet.add(fontFamily);
        tokens.typography.fontFamilies.push(fontName);
      }

      if (!fontSizeSet.has(fontSize)) {
        fontSizeSet.add(fontSize);
        tokens.typography.fontSizes.push(fontSize);
      }

      if (
        fontWeight &&
        fontWeight !== "normal" &&
        fontWeight !== "400" &&
        !fontWeightSet.has(fontWeight)
      ) {
        fontWeightSet.add(fontWeight);
        tokens.typography.fontWeights.push(fontWeight);
      }
    }
  });

  // Get unique colors
  tokens.colors.unique = Array.from(colorSet).map((hex) => ({
    value: hex,
    rgb: hexToRgb(hex),
  }));

  // Get unique spacing values (sorted)
  tokens.spacing.unique = Array.from(spacingSet).sort((a, b) => {
    const numA = parseFloat(a) || 0;
    const numB = parseFloat(b) || 0;
    return numA - numB;
  });

  // Remove duplicates and sort typography
  tokens.typography.fontFamilies = [...new Set(tokens.typography.fontFamilies)];
  tokens.typography.fontSizes = [...new Set(tokens.typography.fontSizes)].sort(
    (a, b) => {
      return parseFloat(a) - parseFloat(b);
    }
  );
  tokens.typography.fontWeights = [
    ...new Set(tokens.typography.fontWeights),
  ].sort((a, b) => {
    return parseInt(a) - parseInt(b);
  });

  return tokens;
}

function parseColor(color) {
  if (!color || color === "transparent" || color === "rgba(0, 0, 0, 0)") {
    return null;
  }

  // Handle rgb/rgba
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3]),
    };
  }

  // Handle hex
  const hexMatch = color.match(/#([0-9a-f]{3}|[0-9a-f]{6})/i);
  if (hexMatch) {
    return hexToRgb(hexMatch[0]);
  }

  // Handle named colors
  const namedColors = {
    black: { r: 0, g: 0, b: 0 },
    white: { r: 255, g: 255, b: 255 },
    red: { r: 255, g: 0, b: 0 },
    green: { r: 0, g: 128, b: 0 },
    blue: { r: 0, g: 0, b: 255 },
  };
  if (namedColors[color.toLowerCase()]) {
    return namedColors[color.toLowerCase()];
  }

  return null;
}

function rgbToHex(rgb) {
  return (
    "#" +
    [rgb.r, rgb.g, rgb.b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractTokens") {
    try {
      const tokens = extractDesignTokens();
      sendResponse({ tokens });
    } catch (error) {
      console.error("Error extracting tokens:", error);
      sendResponse({ error: error.message });
    }
    return true; // Keep channel open for async response
  }
});

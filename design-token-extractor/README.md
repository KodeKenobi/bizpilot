# Design Token Extractor Chrome Extension

Extract design system tokens (colors, spacing, typography) from any website and export them in multiple formats.

## Features

- **Color Extraction**: Automatically extracts background, text, and border colors from any webpage
- **Spacing Analysis**: Identifies all margin, padding, and gap values used on the page
- **Typography Detection**: Captures font families, sizes, weights, and line heights
- **Multiple Export Formats**: Export tokens as JSON, CSS variables, or TypeScript constants
- **Visual Preview**: See colors and typography in action before exporting
- **One-Click Copy**: Click any token to copy it to clipboard

## Installation

### Development Mode

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `design-token-extractor` folder
5. The extension icon will appear in your toolbar

## Usage

1. Navigate to any website you want to analyze
2. Click the Design Token Extractor icon in your toolbar
3. Click "Extract Design Tokens"
4. Browse the extracted tokens in the popup
5. Export in your preferred format (JSON, CSS, or TypeScript)

## Export Formats

### JSON

```json
{
  "colors": {
    "unique": [{ "value": "#667eea", "rgb": { "r": 102, "g": 126, "b": 234 } }]
  },
  "spacing": {
    "unique": ["8px", "16px", "24px"]
  },
  "typography": {
    "fontFamilies": ["Inter", "Arial"],
    "fontSizes": ["12px", "16px", "24px"]
  }
}
```

### CSS Variables

```css
:root {
  --color-1: #667eea;
  --spacing-1: 8px;
  --font-family-1: Inter;
}
```

### TypeScript

```typescript
export const designTokens = {
  colors: {
    color1: "#667eea",
  },
  spacing: {
    spacing1: "8px",
  },
  typography: {
    fontFamilies: ["Inter"],
    fontSizes: ["16px"],
  },
} as const;
```

## How It Works

The extension uses a content script to:

1. Scan all elements on the page
2. Extract computed styles for colors, spacing, and typography
3. Deduplicate and organize the tokens
4. Present them in an easy-to-use interface

## Use Cases

- **Design System Analysis**: Understand the design tokens used by popular websites
- **Competitive Research**: Extract color palettes and spacing systems from competitors
- **Migration Projects**: Capture design tokens before migrating to a new system
- **Learning**: Study how professional design systems are structured
- **Inspiration**: Get color and typography ideas for your own projects

## Privacy

- All processing happens locally in your browser
- No data is sent to external servers
- No tracking or analytics
- Works entirely offline after installation

## Future Enhancements

- [ ] Export to Figma tokens format
- [ ] Export to Tailwind config
- [ ] Export to Style Dictionary
- [ ] Visual spacing overlay on page
- [ ] Color palette generator
- [ ] Typography scale detection
- [ ] Shadow and border radius extraction
- [ ] Animation timing extraction

## License

MIT

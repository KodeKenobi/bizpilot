// Live Editor Mode - Similar to WordPress page builders
// This script creates an interactive editor overlay on the page

let editorEnabled = false;
let selectedElement = null;
let editorPanel = null;
let hoveredElement = null;

function initEditor() {
  if (editorEnabled) return;
  editorEnabled = true;

  // Create editor panel (sidebar)
  createEditorPanel();

  // Add event listeners
  document.addEventListener("mouseover", handleMouseOver, true);
  document.addEventListener("mouseout", handleMouseOut, true);
  document.addEventListener("click", handleClick, true);
  document.addEventListener("keydown", handleKeyDown);

  // Add editor styles
  injectEditorStyles();
}

function createEditorPanel() {
  // Remove existing panel if any
  const existing = document.getElementById("dte-editor-panel");
  if (existing) existing.remove();

  editorPanel = document.createElement("div");
  editorPanel.id = "dte-editor-panel";
  editorPanel.innerHTML = `
    <div class="dte-panel-header">
      <h3>Live Editor</h3>
      <button id="dte-close-panel" class="dte-close-btn">×</button>
    </div>
    <div class="dte-panel-content">
      <div class="dte-section">
        <div class="dte-label">Selected Element</div>
        <div id="dte-element-info" class="dte-element-info">Click an element to select it</div>
      </div>

      <div class="dte-section">
        <div class="dte-label">Typography</div>
        <div class="dte-control-group">
          <label>Font Family</label>
          <input type="text" id="dte-font-family" class="dte-input" />
        </div>
        <div class="dte-control-group">
          <label>Font Size</label>
          <input type="text" id="dte-font-size" class="dte-input" />
        </div>
        <div class="dte-control-group">
          <label>Font Weight</label>
          <input type="text" id="dte-font-weight" class="dte-input" />
        </div>
        <div class="dte-control-group">
          <label>Line Height</label>
          <input type="text" id="dte-line-height" class="dte-input" />
        </div>
        <div class="dte-control-group">
          <label>Text Color</label>
          <div style="display: flex; gap: 8px; align-items: center;">
            <input type="color" id="dte-text-color" class="dte-color-input" />
            <input type="text" id="dte-text-color-hex" class="dte-input" style="flex: 1;" />
          </div>
        </div>
      </div>

      <div class="dte-section">
        <div class="dte-label">Colors & Background</div>
        <div class="dte-control-group">
          <label>Background Color</label>
          <div style="display: flex; gap: 8px; align-items: center;">
            <input type="color" id="dte-bg-color" class="dte-color-input" />
            <input type="text" id="dte-bg-color-hex" class="dte-input" style="flex: 1;" />
          </div>
        </div>
        <div class="dte-control-group">
          <label>Border Color</label>
          <div style="display: flex; gap: 8px; align-items: center;">
            <input type="color" id="dte-border-color" class="dte-color-input" />
            <input type="text" id="dte-border-color-hex" class="dte-input" style="flex: 1;" />
          </div>
        </div>
      </div>

      <div class="dte-section">
        <div class="dte-label">Spacing</div>
        <div class="dte-control-group">
          <label>Padding</label>
          <input type="text" id="dte-padding" class="dte-input" placeholder="e.g., 16px or 10px 20px" />
        </div>
        <div class="dte-control-group">
          <label>Margin</label>
          <input type="text" id="dte-margin" class="dte-input" placeholder="e.g., 16px or 10px 20px" />
        </div>
      </div>

      <div class="dte-section">
        <div class="dte-label">Actions</div>
        <button id="dte-reset-btn" class="dte-btn dte-btn-secondary">Reset Changes</button>
        <button id="dte-copy-styles-btn" class="dte-btn dte-btn-secondary">Copy CSS</button>
      </div>
    </div>
  `;

  document.body.appendChild(editorPanel);

  // Panel controls
  document.getElementById("dte-close-panel").addEventListener("click", () => {
    editorPanel.style.display = "none";
  });

  // Input handlers
  setupInputHandlers();
}

function setupInputHandlers() {
  // Typography
  document.getElementById("dte-font-family").addEventListener("change", (e) => {
    if (selectedElement) {
      selectedElement.style.fontFamily = e.target.value;
      updateElementInfo();
    }
  });

  document.getElementById("dte-font-size").addEventListener("change", (e) => {
    if (selectedElement) {
      selectedElement.style.fontSize = e.target.value;
      updateElementInfo();
    }
  });

  document.getElementById("dte-font-weight").addEventListener("change", (e) => {
    if (selectedElement) {
      selectedElement.style.fontWeight = e.target.value;
      updateElementInfo();
    }
  });

  document.getElementById("dte-line-height").addEventListener("change", (e) => {
    if (selectedElement) {
      selectedElement.style.lineHeight = e.target.value;
      updateElementInfo();
    }
  });

  // Colors
  document.getElementById("dte-text-color").addEventListener("input", (e) => {
    if (selectedElement) {
      selectedElement.style.color = e.target.value;
      document.getElementById("dte-text-color-hex").value = e.target.value;
      updateElementInfo();
    }
  });

  document
    .getElementById("dte-text-color-hex")
    .addEventListener("change", (e) => {
      if (selectedElement) {
        selectedElement.style.color = e.target.value;
        document.getElementById("dte-text-color").value = e.target.value;
        updateElementInfo();
      }
    });

  document.getElementById("dte-bg-color").addEventListener("input", (e) => {
    if (selectedElement) {
      selectedElement.style.backgroundColor = e.target.value;
      document.getElementById("dte-bg-color-hex").value = e.target.value;
      updateElementInfo();
    }
  });

  document
    .getElementById("dte-bg-color-hex")
    .addEventListener("change", (e) => {
      if (selectedElement) {
        selectedElement.style.backgroundColor = e.target.value;
        document.getElementById("dte-bg-color").value = e.target.value;
        updateElementInfo();
      }
    });

  document.getElementById("dte-border-color").addEventListener("input", (e) => {
    if (selectedElement) {
      selectedElement.style.borderColor = e.target.value;
      document.getElementById("dte-border-color-hex").value = e.target.value;
      updateElementInfo();
    }
  });

  document
    .getElementById("dte-border-color-hex")
    .addEventListener("change", (e) => {
      if (selectedElement) {
        selectedElement.style.borderColor = e.target.value;
        document.getElementById("dte-border-color").value = e.target.value;
        updateElementInfo();
      }
    });

  // Spacing
  document.getElementById("dte-padding").addEventListener("change", (e) => {
    if (selectedElement) {
      selectedElement.style.padding = e.target.value;
      updateElementInfo();
    }
  });

  document.getElementById("dte-margin").addEventListener("change", (e) => {
    if (selectedElement) {
      selectedElement.style.margin = e.target.value;
      updateElementInfo();
    }
  });

  // Actions
  document.getElementById("dte-reset-btn").addEventListener("click", () => {
    if (selectedElement) {
      selectedElement.style.cssText = "";
      loadElementStyles(selectedElement);
    }
  });

  document
    .getElementById("dte-copy-styles-btn")
    .addEventListener("click", () => {
      if (selectedElement) {
        const styles = window.getComputedStyle(selectedElement);
        const css = `
/* ${selectedElement.tagName.toLowerCase()}${
          selectedElement.className
            ? "." + selectedElement.className.split(" ").join(".")
            : ""
        } */
font-family: ${styles.fontFamily};
font-size: ${styles.fontSize};
font-weight: ${styles.fontWeight};
color: ${styles.color};
background-color: ${styles.backgroundColor};
padding: ${styles.padding};
margin: ${styles.margin};
      `.trim();
        navigator.clipboard.writeText(css);
        alert("CSS copied to clipboard!");
      }
    });
}

function handleMouseOver(e) {
  if (
    !editorEnabled ||
    e.target === editorPanel ||
    editorPanel?.contains(e.target)
  )
    return;

  e.stopPropagation();
  hoveredElement = e.target;

  // Highlight element
  e.target.style.outline = "2px solid #667eea";
  e.target.style.outlineOffset = "2px";
  e.target.style.cursor = "pointer";
}

function handleMouseOut(e) {
  if (
    !editorEnabled ||
    e.target === editorPanel ||
    editorPanel?.contains(e.target)
  )
    return;

  // Remove highlight if not selected
  if (e.target !== selectedElement) {
    e.target.style.outline = "";
    e.target.style.outlineOffset = "";
    e.target.style.cursor = "";
  }
}

function handleClick(e) {
  if (
    !editorEnabled ||
    e.target === editorPanel ||
    editorPanel?.contains(e.target)
  )
    return;

  e.preventDefault();
  e.stopPropagation();

  // Remove previous selection
  if (selectedElement && selectedElement !== e.target) {
    selectedElement.style.outline = "";
    selectedElement.style.boxShadow = "";
  }

  // Select new element
  selectedElement = e.target;
  selectedElement.style.outline = "3px solid #10b981";
  selectedElement.style.outlineOffset = "2px";
  selectedElement.style.boxShadow = "0 0 0 4px rgba(16, 185, 129, 0.2)";

  // Load element styles into panel
  loadElementStyles(selectedElement);

  // Show panel if hidden
  if (editorPanel) {
    editorPanel.style.display = "block";
  }
}

function loadElementStyles(element) {
  const styles = window.getComputedStyle(element);

  // Update element info
  const tagName = element.tagName.toLowerCase();
  const className = element.className
    ? `.${element.className.split(" ").join(".")}`
    : "";
  const id = element.id ? `#${element.id}` : "";
  document.getElementById(
    "dte-element-info"
  ).textContent = `${tagName}${id}${className}`;

  // Typography
  document.getElementById("dte-font-family").value = styles.fontFamily
    .split(",")[0]
    .replace(/['"]/g, "");
  document.getElementById("dte-font-size").value = styles.fontSize;
  document.getElementById("dte-font-weight").value = styles.fontWeight;
  document.getElementById("dte-line-height").value = styles.lineHeight;

  // Colors
  const textColor = rgbToHex(styles.color);
  document.getElementById("dte-text-color").value = textColor;
  document.getElementById("dte-text-color-hex").value = textColor;

  const bgColor = rgbToHex(styles.backgroundColor);
  document.getElementById("dte-bg-color").value = bgColor;
  document.getElementById("dte-bg-color-hex").value = bgColor;

  const borderColor = rgbToHex(styles.borderColor);
  document.getElementById("dte-border-color").value = borderColor;
  document.getElementById("dte-border-color-hex").value = borderColor;

  // Spacing
  document.getElementById("dte-padding").value = styles.padding;
  document.getElementById("dte-margin").value = styles.margin;
}

function updateElementInfo() {
  if (selectedElement) {
    const tagName = selectedElement.tagName.toLowerCase();
    const className = selectedElement.className
      ? `.${selectedElement.className.split(" ").join(".")}`
      : "";
    const id = selectedElement.id ? `#${selectedElement.id}` : "";
    document.getElementById(
      "dte-element-info"
    ).textContent = `${tagName}${id}${className} (edited)`;
  }
}

function handleKeyDown(e) {
  if (!editorEnabled) return;

  // ESC to deselect
  if (e.key === "Escape" && selectedElement) {
    selectedElement.style.outline = "";
    selectedElement.style.boxShadow = "";
    selectedElement = null;
    document.getElementById("dte-element-info").textContent =
      "Click an element to select it";
  }
}

function rgbToHex(rgb) {
  if (!rgb || rgb === "transparent" || rgb === "rgba(0, 0, 0, 0)")
    return "#000000";
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    return (
      "#" +
      [match[1], match[2], match[3]]
        .map((x) => {
          const hex = parseInt(x).toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
    );
  }
  return rgb.startsWith("#") ? rgb : "#000000";
}

function disableEditor() {
  editorEnabled = false;

  // Remove highlights
  document.querySelectorAll("*").forEach((el) => {
    el.style.outline = "";
    el.style.outlineOffset = "";
    el.style.boxShadow = "";
    el.style.cursor = "";
  });

  // Remove panel
  if (editorPanel) {
    editorPanel.remove();
    editorPanel = null;
  }

  // Remove event listeners
  document.removeEventListener("mouseover", handleMouseOver, true);
  document.removeEventListener("mouseout", handleMouseOut, true);
  document.removeEventListener("click", handleClick, true);
  document.removeEventListener("keydown", handleKeyDown);

  selectedElement = null;
  hoveredElement = null;
}

function injectEditorStyles() {
  if (document.getElementById("dte-editor-styles")) return;

  const style = document.createElement("style");
  style.id = "dte-editor-styles";
  style.textContent = `
    #dte-editor-panel {
      position: fixed;
      top: 0;
      right: 0;
      width: 350px;
      height: 100vh;
      background: #1a1a1a;
      border-left: 1px solid #333;
      z-index: 999999;
      overflow-y: auto;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      box-shadow: -4px 0 20px rgba(0, 0, 0, 0.5);
    }

     .dte-panel-header {
       background: #1a1a1a;
       border-bottom: 1px solid #333;
       padding: 16px;
       display: flex;
       justify-content: space-between;
       align-items: center;
       color: white;
       position: sticky;
       top: 0;
       z-index: 10;
     }

    .dte-panel-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    .dte-close-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 18px;
      line-height: 1;
    }

    .dte-close-btn:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .dte-panel-content {
      padding: 16px;
    }

    .dte-section {
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #333;
    }

    .dte-section:last-child {
      border-bottom: none;
    }

    .dte-label {
      font-size: 12px;
      font-weight: 600;
      color: #667eea;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
    }

    .dte-control-group {
      margin-bottom: 12px;
    }

    .dte-control-group label {
      display: block;
      font-size: 12px;
      color: #999;
      margin-bottom: 6px;
    }

    .dte-input {
      width: 100%;
      padding: 8px;
      background: #2a2a2a;
      border: 1px solid #444;
      border-radius: 4px;
      color: #e0e0e0;
      font-size: 13px;
      font-family: monospace;
    }

    .dte-input:focus {
      outline: none;
      border-color: #667eea;
    }

    .dte-color-input {
      width: 40px;
      height: 40px;
      border: 1px solid #444;
      border-radius: 4px;
      cursor: pointer;
      background: none;
    }

    .dte-element-info {
      padding: 8px;
      background: #2a2a2a;
      border: 1px solid #444;
      border-radius: 4px;
      font-size: 12px;
      font-family: monospace;
      color: #e0e0e0;
      word-break: break-all;
    }

    .dte-btn {
      width: 100%;
      padding: 10px;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      margin-bottom: 8px;
      transition: all 0.2s;
    }

    .dte-btn-secondary {
      background: #2a2a2a;
      color: #e0e0e0;
      border: 1px solid #444;
    }

    .dte-btn-secondary:hover {
      background: #333;
      border-color: #667eea;
    }
  `;
  document.head.appendChild(style);
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "enableEditor") {
    initEditor();
    sendResponse({ success: true });
  } else if (request.action === "disableEditor") {
    disableEditor();
    sendResponse({ success: true });
  }
  return true;
});

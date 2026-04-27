"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import internalAnalytics from "../../lib/internalAnalytics";

export default function WebsiteTracker() {
  const pathname = usePathname();
  const startTimeRef = useRef<number>(Date.now());
  const lastActivityRef = useRef<number>(Date.now());

  // Helper function to get active PDF tool name
  const getActivePdfTool = (): string | null => {
    if (pathname !== "/tools/pdf-tools") return null;

    // Try to find the active tool button
    const activeButton = document.querySelector(
      'button.bg-cyan-500, button[class*="bg-cyan-500"]'
    ) as HTMLElement;

    if (activeButton) {
      const toolText = activeButton.textContent?.trim();
      if (toolText) {
        // Map button text to tool names
        const toolMap: Record<string, string> = {
          "Extract Text from PDF": "Extract Text",
          "Extract Images from PDF": "Extract Images",
          "Convert PDF to HTML": "PDF to HTML",
          "Convert HTML to PDF": "HTML to PDF",
          "Edit PDF Content": "Edit PDF",
          "Edit, Fill and Sign": "Edit Fill Sign",
          "Add Digital Signature to PDF": "Add Signature",
          "Add Image to PDF": "Add Watermark",
          "Split PDF into Individual Pages": "Split PDF",
          "Merge Multiple PDFs into One": "Merge PDFs",
        };
        return toolMap[toolText] || toolText;
      }
    }

    // Fallback: check for tool-specific elements in the DOM
    const toolIndicators = [
      { selector: '[data-tool="extract-text"]', name: "Extract Text" },
      { selector: '[data-tool="extract-images"]', name: "Extract Images" },
      { selector: '[data-tool="pdf-to-html"]', name: "PDF to HTML" },
      { selector: '[data-tool="html-to-pdf"]', name: "HTML to PDF" },
      { selector: '[data-tool="edit-pdf"]', name: "Edit PDF" },
      { selector: '[data-tool="edit-fill-sign"]', name: "Edit Fill Sign" },
      { selector: '[data-tool="add-signature"]', name: "Add Signature" },
      { selector: '[data-tool="add-watermark"]', name: "Add Watermark" },
      { selector: '[data-tool="split-pdf"]', name: "Split PDF" },
      { selector: '[data-tool="merge-pdfs"]', name: "Merge PDFs" },
    ];

    for (const indicator of toolIndicators) {
      if (document.querySelector(indicator.selector)) {
        return indicator.name;
      }
    }

    return null;
  };

  useEffect(() => {
    // Get active PDF tool if on PDF tools page
    const activeTool = getActivePdfTool();
    const pageTitle = activeTool
      ? `PDF Tools - ${activeTool}`
      : undefined;

    // Track page view when pathname changes
    internalAnalytics.trackPageView(undefined, pageTitle);

    // Reset timers for new page
    startTimeRef.current = Date.now();
    lastActivityRef.current = Date.now();

    // Track page load time
    const loadTime = performance.now();
    internalAnalytics.track("page_load", {
      load_time: loadTime,
      page: pathname,
      timestamp: Date.now(),
    });

    // Track Core Web Vitals
    if ("web-vital" in window) {
      // Largest Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        internalAnalytics.track("web_vital", {
          metric: "LCP",
          value: lastEntry.startTime,
          page: pathname,
        });
      }).observe({ entryTypes: ["largest-contentful-paint"] });

      // First Input Delay
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const fidEntry = entry as PerformanceEventTiming;
          internalAnalytics.track("web_vital", {
            metric: "FID",
            value: fidEntry.processingStart - fidEntry.startTime,
            page: pathname,
          });
        });
      }).observe({ entryTypes: ["first-input"] });

      // Cumulative Layout Shift
      let clsValue = 0;
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const clsEntry = entry as PerformanceEntry & {
            hadRecentInput?: boolean;
            value?: number;
          };
          if (!clsEntry.hadRecentInput) {
            clsValue += clsEntry.value || 0;
          }
        });
        internalAnalytics.track("web_vital", {
          metric: "CLS",
          value: clsValue,
          page: pathname,
        });
      }).observe({ entryTypes: ["layout-shift"] });
    }

    // Track when user leaves page
    const trackPageLeave = () => {
      const sessionDuration = Date.now() - startTimeRef.current;
      internalAnalytics.track("page_leave", {
        session_duration: sessionDuration,
        page: pathname,
        timestamp: Date.now(),
      });
    };

    window.addEventListener("beforeunload", trackPageLeave);

    // Track PDF tool changes on PDF tools page
    let toolChangeObserver: MutationObserver | null = null;
    if (pathname === "/tools/pdf-tools") {
      // Watch for tool button clicks to track tool changes
      const trackToolChange = (event: Event) => {
        const target = event.target as HTMLElement;
        const button = target.closest('button');
        if (button && button.textContent) {
          const toolText = button.textContent.trim();
          const toolMap: Record<string, string> = {
            "Extract Text from PDF": "Extract Text",
            "Extract Images from PDF": "Extract Images",
            "Convert PDF to HTML": "PDF to HTML",
            "Convert HTML to PDF": "HTML to PDF",
            "Edit PDF Content": "Edit PDF",
            "Edit, Fill and Sign": "Edit Fill Sign",
            "Add Digital Signature to PDF": "Add Signature",
            "Add Image to PDF": "Add Watermark",
            "Split PDF into Individual Pages": "Split PDF",
            "Merge Multiple PDFs into One": "Merge PDFs",
          };
          const toolName = toolMap[toolText] || toolText;

          // Update document title
          if (typeof document !== "undefined") {
            document.title = `PDF Tools - ${toolName} | Trevnoctilla`;
          }

          // Track tool change
          internalAnalytics.track("pdf_tool_change", {
            tool_name: toolName,
            page: pathname,
            timestamp: Date.now(),
          });

          // Track page view with updated title
          setTimeout(() => {
            internalAnalytics.trackPageView(undefined, `PDF Tools - ${toolName}`);
          }, 100);
        }
      };

      // Listen for clicks on tool buttons
      document.addEventListener("click", (e) => {
        const target = e.target as HTMLElement;
        const button = target.closest('button');
        if (button && (
          button.classList.contains('bg-cyan-500') ||
          button.textContent?.includes('PDF') ||
          button.textContent?.includes('Extract') ||
          button.textContent?.includes('Merge') ||
          button.textContent?.includes('Split') ||
          button.textContent?.includes('Edit') ||
          button.textContent?.includes('Sign') ||
          button.textContent?.includes('Watermark') ||
          button.textContent?.includes('HTML')
        )) {
          // Small delay to ensure state has updated
          setTimeout(() => trackToolChange(e), 50);
        }
      }, true);

      // Also observe DOM changes to catch tool switches
      toolChangeObserver = new MutationObserver(() => {
        const activeTool = getActivePdfTool();
        if (activeTool && typeof document !== "undefined") {
          const expectedTitle = `PDF Tools - ${activeTool}`;
          if (!document.title.includes(activeTool)) {
            document.title = `${expectedTitle} | Trevnoctilla`;
            internalAnalytics.trackPageView(undefined, expectedTitle);
          }
        }
      });

      toolChangeObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class'],
      });
    }

    // Cleanup
    return () => {
      window.removeEventListener("beforeunload", trackPageLeave);
      if (toolChangeObserver) {
        toolChangeObserver.disconnect();
      }
    };
  }, [pathname]);

  return null; // This component doesn't render anything
}

"use client";

/**
 * Wraps a download action with monetization modal
 * Shows monetization modal first, then executes download callback after user views ad or pays
 */
export async function withMonetization<T = void>(
  downloadCallback: () => T | Promise<T>,
  options?: {
    fileName?: string;
    fileType?: string;
  }
): Promise<T | null> {
  // Import dynamically to avoid SSR issues
  const { useMonetization } = await import("@/contexts/MonetizationProvider");

  // We need to get the modal instance from the context
  // Since we can't use hooks outside components, we'll use the window message system
  return new Promise((resolve) => {
    // Trigger monetization modal via window message
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "MONETIZATION_COMPLETE") {
        window.removeEventListener("message", handleMessage);
        // Execute download after monetization
        Promise.resolve(downloadCallback())
          .then(resolve)
          .catch(() => resolve(null));
      } else if (event.data.type === "MONETIZATION_CANCELLED") {
        window.removeEventListener("message", handleMessage);
        resolve(null);
      }
    };

    window.addEventListener("message", handleMessage);

    // Trigger monetization modal
    window.postMessage(
      {
        type: "OPEN_MONETIZATION_MODAL",
        fileName: options?.fileName || "file",
        fileType: options?.fileType || "document",
        downloadUrl: "#",
      },
      "*"
    );

    // Fallback: if modal provider listens on window, also trigger it
    // The MonetizationProvider listens for this message
  });
}

/**
 * Simple helper to show monetization modal and execute callback
 * Use this in components where you have access to useMonetization hook
 */
export async function requireMonetization(
  showModal: (config?: any) => Promise<boolean>,
  downloadCallback: () => void,
  fileName?: string,
  fileType?: string
): Promise<void> {
  const completed = await showModal({
    title: "Download File",
    message: `Choose how you'd like to download ${fileName || "this file"}`,
    fileName,
    fileType,
  });

  if (completed) {
    downloadCallback();
  }
}

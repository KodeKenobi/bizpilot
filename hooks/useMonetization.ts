import { useState } from "react";

interface MonetizationState {
  isModalOpen: boolean;
  fileName: string;
  fileType: string;
  downloadUrl: string;
}

export const useMonetization = () => {
  const [monetizationState, setMonetizationState] = useState<MonetizationState>(
    {
      isModalOpen: false,
      fileName: "",
      fileType: "",
      downloadUrl: "",
    }
  );
  const [hasDownloaded, setHasDownloaded] = useState(false);

  const openMonetizationModal = (
    fileName: string,
    fileType: string,
    downloadUrl: string
  ) => {
    console.log("🚀 openMonetizationModal called");
    console.log("🚀 Parameters:", { fileName, fileType, downloadUrl });
    console.log("🚀 Resetting hasDownloaded to false");
    setHasDownloaded(false); // Reset download flag
    setMonetizationState({
      isModalOpen: true,
      fileName,
      fileType,
      downloadUrl,
    });
    console.log("🚀 Modal state updated");
  };

  const closeMonetizationModal = () => {
    console.log("❌ closeMonetizationModal called");
    console.log("❌ Current hasDownloaded:", hasDownloaded);
    setMonetizationState({
      isModalOpen: false,
      fileName: "",
      fileType: "",
      downloadUrl: "",
    });
    console.log("❌ Modal closed");
  };

  const handleAdComplete = async () => {
    console.log("🎬 useMonetization handleAdComplete called");
    console.log("🎬 hasDownloaded:", hasDownloaded);
    console.log("🎬 monetizationState:", monetizationState);
    console.log(
      "🎬 monetizationState.downloadUrl:",
      monetizationState.downloadUrl
    );
    console.log("🎬 monetizationState.fileName:", monetizationState.fileName);

    if (!hasDownloaded) {
      console.log("🎬 Setting hasDownloaded to true and triggering download");
      setHasDownloaded(true);

      // Check if downloadUrl exists
      if (!monetizationState.downloadUrl) {
        console.error("🎬 ERROR: downloadUrl is empty or undefined!");
        return;
      }

      // Trigger download after ad completion
      try {
        console.log("🎬 Attempting to download file...");
        console.log("🎬 Download URL:", monetizationState.downloadUrl);
        console.log("🎬 File name:", monetizationState.fileName);

        // First try to fetch the file to ensure it's accessible
        console.log(
          "🎬 Attempting to fetch file from URL:",
          monetizationState.downloadUrl
        );
        const response = await fetch(monetizationState.downloadUrl);
        console.log("🎬 Fetch response status:", response.status);
        console.log("🎬 Fetch response ok:", response.ok);
        if (!response.ok) {
          console.error("🎬 Fetch failed with status:", response.status);
          console.error("🎬 Response text:", await response.text());
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Convert to blob and create download
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = monetizationState.fileName;
        link.style.display = "none";

        console.log("🎬 Download link created:", {
          href: link.href,
          download: link.download,
        });

        // Add link to DOM and trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up blob URL
        setTimeout(() => {
          window.URL.revokeObjectURL(blobUrl);
        }, 1000);

        console.log("🎬 Download triggered successfully");
      } catch (error) {
        console.error("🎬 Error downloading file:", error);
        // Fallback: try direct link
        try {
          console.log("🎬 Trying fallback download method...");
          window.open(monetizationState.downloadUrl, "_blank");
        } catch (fallbackError) {
          console.error("🎬 Fallback download also failed:", fallbackError);
        }
      }
    } else {
      console.log("🎬 Download already triggered, skipping");
    }
  };

  const handlePaymentComplete = async () => {
    console.log("💳 handlePaymentComplete called");
    console.log("💳 hasDownloaded:", hasDownloaded);
    console.log("💳 monetizationState:", monetizationState);

    if (!hasDownloaded) {
      console.log("💳 Setting hasDownloaded to true and triggering download");
      setHasDownloaded(true);

      // Check if downloadUrl exists
      if (!monetizationState.downloadUrl) {
        console.error("💳 ERROR: downloadUrl is empty or undefined!");
        return;
      }

      // Trigger download after payment completion
      try {
        console.log("💳 Attempting to download file...");
        console.log("💳 Download URL:", monetizationState.downloadUrl);
        console.log("💳 File name:", monetizationState.fileName);

        // First try to fetch the file to ensure it's accessible
        console.log(
          "🎬 Attempting to fetch file from URL:",
          monetizationState.downloadUrl
        );
        const response = await fetch(monetizationState.downloadUrl);
        console.log("🎬 Fetch response status:", response.status);
        console.log("🎬 Fetch response ok:", response.ok);
        if (!response.ok) {
          console.error("🎬 Fetch failed with status:", response.status);
          console.error("🎬 Response text:", await response.text());
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Convert to blob and create download
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = monetizationState.fileName;
        link.style.display = "none";

        console.log("💳 Download link created:", {
          href: link.href,
          download: link.download,
        });

        // Add link to DOM and trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up blob URL
        setTimeout(() => {
          window.URL.revokeObjectURL(blobUrl);
        }, 1000);

        console.log("💳 Download triggered successfully");
      } catch (error) {
        console.error("💳 Error downloading file:", error);
        // Fallback: try direct link
        try {
          console.log("💳 Trying fallback download method...");
          window.open(monetizationState.downloadUrl, "_blank");
        } catch (fallbackError) {
          console.error("💳 Fallback download also failed:", fallbackError);
        }
      }
    } else {
      console.log("💳 Download already triggered, skipping");
    }
  };

  return {
    monetizationState,
    openMonetizationModal,
    closeMonetizationModal,
    handleAdComplete,
    handlePaymentComplete,
  };
};

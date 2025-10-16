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

  const handleAdComplete = () => {
    console.log("🎬 useMonetization handleAdComplete called");
    console.log("🎬 hasDownloaded:", hasDownloaded);
    console.log("🎬 monetizationState:", monetizationState);
    console.log("🎬 monetizationState.downloadUrl:", monetizationState.downloadUrl);
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
        const link = document.createElement("a");
        link.href = monetizationState.downloadUrl;
        link.download = monetizationState.fileName;
        console.log("🎬 Download link created:", {
          href: link.href,
          download: link.download,
        });
        
        // Add link to DOM temporarily
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log("🎬 Download link clicked successfully");
      } catch (error) {
        console.error("🎬 Error creating or clicking download link:", error);
      }
    } else {
      console.log("🎬 Download already triggered, skipping");
    }
  };

  const handlePaymentComplete = () => {
    console.log("💳 handlePaymentComplete called");
    console.log("💳 hasDownloaded:", hasDownloaded);
    console.log("💳 monetizationState:", monetizationState);

    if (!hasDownloaded) {
      console.log("💳 Setting hasDownloaded to true and triggering download");
      setHasDownloaded(true);
      // Trigger download after payment completion
      const link = document.createElement("a");
      link.href = monetizationState.downloadUrl;
      link.download = monetizationState.fileName;
      console.log("💳 Download link created:", {
        href: link.href,
        download: link.download,
      });
      link.click();
      console.log("💳 Download link clicked");
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

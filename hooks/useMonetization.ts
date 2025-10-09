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
    console.log("🎬 handleAdComplete called");
    console.log("🎬 hasDownloaded:", hasDownloaded);
    console.log("🎬 monetizationState:", monetizationState);

    if (!hasDownloaded) {
      console.log("🎬 Setting hasDownloaded to true and triggering download");
      setHasDownloaded(true);
      // Trigger download after ad completion
      const link = document.createElement("a");
      link.href = monetizationState.downloadUrl;
      link.download = monetizationState.fileName;
      console.log("🎬 Download link created:", {
        href: link.href,
        download: link.download,
      });
      link.click();
      console.log("🎬 Download link clicked");
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

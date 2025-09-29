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

  const openMonetizationModal = (
    fileName: string,
    fileType: string,
    downloadUrl: string
  ) => {
    setMonetizationState({
      isModalOpen: true,
      fileName,
      fileType,
      downloadUrl,
    });
  };

  const closeMonetizationModal = () => {
    setMonetizationState({
      isModalOpen: false,
      fileName: "",
      fileType: "",
      downloadUrl: "",
    });
  };

  const handleAdComplete = () => {
    // Trigger download after ad completion
    const link = document.createElement("a");
    link.href = monetizationState.downloadUrl;
    link.download = monetizationState.fileName;
    link.click();
  };

  const handlePaymentComplete = () => {
    // Trigger download after payment completion
    const link = document.createElement("a");
    link.href = monetizationState.downloadUrl;
    link.download = monetizationState.fileName;
    link.click();
  };

  return {
    monetizationState,
    openMonetizationModal,
    closeMonetizationModal,
    handleAdComplete,
    handlePaymentComplete,
  };
};

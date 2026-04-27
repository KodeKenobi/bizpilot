"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useMonetizationModal } from "@/hooks/useMonetizationModal";
import MonetizationModal from "@/components/ui/MonetizationModal";

interface MonetizationContextType {
  showModal: (config?: {
    title?: string;
    message?: string;
    fileName?: string;
    fileType?: string;
    downloadUrl?: string;
  }) => Promise<boolean>;
  hideModal: () => void;
}

const MonetizationContext = createContext<MonetizationContextType | undefined>(
  undefined
);

export const useMonetization = () => {
  const context = useContext(MonetizationContext);
  if (!context) {
    throw new Error(
      "useMonetization must be used within a MonetizationProvider"
    );
  }
  return context;
};

export const MonetizationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const monetizationModal = useMonetizationModal();

  // Listen for OPEN_MONETIZATION_MODAL messages from iframes
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "OPEN_MONETIZATION_MODAL") {
        monetizationModal.showModal({
          title: "Continue with Ad or Payment",
          message: `Choose how you'd like to access ${
            event.data.fileName || "this content"
          }`,
          fileName: event.data.fileName,
          fileType: event.data.fileType,
          downloadUrl: event.data.downloadUrl,
        });
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [monetizationModal]);

  return (
    <MonetizationContext.Provider
      value={{
        showModal: monetizationModal.showModal,
        hideModal: monetizationModal.hideModal,
      }}
    >
      {children}
      <MonetizationModal
        isOpen={monetizationModal.isOpen}
        onClose={monetizationModal.hideModal}
        onComplete={monetizationModal.handleComplete}
        title={monetizationModal.config.title}
        message={monetizationModal.config.message}
        downloadUrl={monetizationModal.config.downloadUrl}
        fileName={monetizationModal.config.fileName}
      />
    </MonetizationContext.Provider>
  );
};

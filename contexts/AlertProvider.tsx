"use client";

import React, { createContext, useContext } from "react";
import { useAlertModal } from "@/hooks/useAlertModal";
import AlertModal from "@/components/ui/AlertModal";

interface AlertContextType {
  showAlert: (config: any) => void;
  hideAlert: () => void;
  showSuccess: (title: string, message: string, buttons?: any) => void;
  showError: (title: string, message: string, buttons?: any) => void;
  showWarning: (title: string, message: string, buttons?: any) => void;
  showInfo: (title: string, message: string, buttons?: any) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const alertModal = useAlertModal();

  return (
    <AlertContext.Provider value={alertModal}>
      {children}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={alertModal.hideAlert}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        primaryButton={alertModal.primaryButton}
        secondaryButton={alertModal.secondaryButton}
        showCloseButton={alertModal.showCloseButton}
      />
    </AlertContext.Provider>
  );
};

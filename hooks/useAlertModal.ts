import { useState, useCallback } from "react";

interface AlertModalState {
  isOpen: boolean;
  title: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  primaryButton?: {
    text: string;
    onClick: () => void;
    variant?: "primary" | "secondary" | "danger";
  };
  secondaryButton?: {
    text: string;
    onClick: () => void;
    variant?: "primary" | "secondary" | "danger";
  };
  showCloseButton?: boolean;
}

const initialState: AlertModalState = {
  isOpen: false,
  title: "",
  message: "",
  type: "info",
  showCloseButton: true,
};

export const useAlertModal = () => {
  const [state, setState] = useState<AlertModalState>(initialState);

  const showAlert = useCallback((config: Partial<AlertModalState>) => {
    setState({
      ...initialState,
      ...config,
      isOpen: true,
    });
  }, []);

  const hideAlert = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const showSuccess = useCallback(
    (
      title: string,
      message: string,
      buttons?: {
        primary?: {
          text: string;
          onClick: () => void;
          variant?: "primary" | "secondary" | "danger";
        };
        secondary?: {
          text: string;
          onClick: () => void;
          variant?: "primary" | "secondary" | "danger";
        };
      }
    ) => {
      showAlert({
        title,
        message,
        type: "success",
        primaryButton: buttons?.primary,
        secondaryButton: buttons?.secondary,
      });
    },
    [showAlert]
  );

  const showError = useCallback(
    (
      title: string,
      message: string,
      buttons?: {
        primary?: {
          text: string;
          onClick: () => void;
          variant?: "primary" | "secondary" | "danger";
        };
        secondary?: {
          text: string;
          onClick: () => void;
          variant?: "primary" | "secondary" | "danger";
        };
      }
    ) => {
      showAlert({
        title,
        message,
        type: "error",
        primaryButton: buttons?.primary,
        secondaryButton: buttons?.secondary,
      });
    },
    [showAlert]
  );

  const showWarning = useCallback(
    (
      title: string,
      message: string,
      buttons?: {
        primary?: {
          text: string;
          onClick: () => void;
          variant?: "primary" | "secondary" | "danger";
        };
        secondary?: {
          text: string;
          onClick: () => void;
          variant?: "primary" | "secondary" | "danger";
        };
      }
    ) => {
      showAlert({
        title,
        message,
        type: "warning",
        primaryButton: buttons?.primary,
        secondaryButton: buttons?.secondary,
      });
    },
    [showAlert]
  );

  const showInfo = useCallback(
    (
      title: string,
      message: string,
      buttons?: {
        primary?: {
          text: string;
          onClick: () => void;
          variant?: "primary" | "secondary" | "danger";
        };
        secondary?: {
          text: string;
          onClick: () => void;
          variant?: "primary" | "secondary" | "danger";
        };
      }
    ) => {
      showAlert({
        title,
        message,
        type: "info",
        primaryButton: buttons?.primary,
        secondaryButton: buttons?.secondary,
      });
    },
    [showAlert]
  );

  return {
    ...state,
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};

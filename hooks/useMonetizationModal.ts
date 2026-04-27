"use client";

import { useState, useCallback } from "react";

interface MonetizationModalConfig {
  title?: string;
  message?: string;
  fileName?: string;
  fileType?: string;
  downloadUrl?: string;
}

interface UseMonetizationModalReturn {
  isOpen: boolean;
  showModal: (config?: MonetizationModalConfig) => Promise<boolean>;
  hideModal: () => void;
  handleComplete: () => void;
  config: MonetizationModalConfig;
}

export const useMonetizationModal = (): UseMonetizationModalReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<MonetizationModalConfig>({});
  const [resolvePromise, setResolvePromise] = useState<
    ((value: boolean) => void) | null
  >(null);

  const showModal = useCallback(
    (modalConfig?: MonetizationModalConfig): Promise<boolean> => {
      return new Promise((resolve) => {
        setConfig(modalConfig || {});
        setIsOpen(true);
        setResolvePromise(() => resolve);
      });
    },
    []
  );

  const hideModal = useCallback(() => {
    setIsOpen(false);
    if (resolvePromise) {
      resolvePromise(false); // User closed without completing
      setResolvePromise(null);
    }
  }, [resolvePromise]);

  const handleComplete = useCallback(() => {
    setIsOpen(false);
    if (resolvePromise) {
      resolvePromise(true); // User completed (viewed ad or paid)
      setResolvePromise(null);
    }
  }, [resolvePromise]);

  return {
    isOpen,
    showModal,
    hideModal,
    handleComplete,
    config,
  };
};

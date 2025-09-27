"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type Page =
  | "home"
  | "tools"
  | "video-converter"
  | "audio-converter"
  | "image-converter"
  | "pdf-tools"
  | "pdf-editor"
  | "qr-generator";

interface NavigationContextType {
  currentPage: Page;
  navigateTo: (page: Page) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState<Page>("home");

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
  };

  return (
    <NavigationContext.Provider value={{ currentPage, navigateTo }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
}

"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

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
  const router = useRouter();
  const pathname = usePathname();

  // Determine current page based on pathname
  const getCurrentPage = (): Page => {
    if (pathname === "/") return "home";
    if (pathname === "/tools") return "tools";
    if (pathname === "/tools/video-converter") return "video-converter";
    if (pathname === "/tools/audio-converter") return "audio-converter";
    if (pathname === "/tools/image-converter") return "image-converter";
    if (pathname === "/tools/pdf-tools") return "pdf-tools";
    if (pathname === "/tools/qr-generator") return "qr-generator";
    return "home";
  };

  const navigateTo = (page: Page) => {
    switch (page) {
      case "home":
        router.push("/");
        break;
      case "tools":
        router.push("/tools");
        break;
      case "video-converter":
        router.push("/tools/video-converter");
        break;
      case "audio-converter":
        router.push("/tools/audio-converter");
        break;
      case "image-converter":
        router.push("/tools/image-converter");
        break;
      case "pdf-tools":
        router.push("/tools/pdf-tools");
        break;
      case "qr-generator":
        router.push("/tools/qr-generator");
        break;
      default:
        router.push("/");
    }
  };

  return (
    <NavigationContext.Provider value={{ currentPage: getCurrentPage(), navigateTo }}>
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

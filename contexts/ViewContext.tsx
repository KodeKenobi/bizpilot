"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "./UserContext";
import { usePathname } from "next/navigation";

type ViewMode = "website" | "client" | "admin";

interface ViewContextType {
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;
  isSuperAdmin: boolean;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

export function ViewProvider({ children }: { children: React.ReactNode }) {
  const { isSuperAdmin } = useUser();
  const pathname = usePathname();
  const [currentView, setCurrentView] = useState<ViewMode>("website");

  // Automatically detect current view based on pathname
  useEffect(() => {
    if (pathname.startsWith("/admin")) {
      setCurrentView("admin");
    } else if (pathname.startsWith("/dashboard")) {
      setCurrentView("client");
    } else {
      setCurrentView("website");
    }
  }, [pathname]);

  return (
    <ViewContext.Provider
      value={{
        currentView,
        setCurrentView,
        isSuperAdmin,
      }}
    >
      {children}
    </ViewContext.Provider>
  );
}

export function useView() {
  const context = useContext(ViewContext);
  if (context === undefined) {
    throw new Error("useView must be used within a ViewProvider");
  }
  return context;
}

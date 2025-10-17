"use client";

import React, { useState, useEffect } from "react";
import { NavigationProvider } from "@/contexts/NavigationContext";
import UniversalHeader from "@/components/layout/UniversalHeader";
import { useNavigation } from "@/contexts/NavigationContext";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { currentPage } = useNavigation();
  const [isEditorMode, setIsEditorMode] = useState(false);
  const [isAuthPage, setIsAuthPage] = useState(false);

  // Check for editor mode and auth pages
  useEffect(() => {
    const checkModes = () => {
      // Check if we're in PDF tools and editor is active
      const isInPdfTools = currentPage === "pdf-tools";
      const hasEditorUrl =
        typeof window !== "undefined" &&
        (window.location.search.includes("editor=true") ||
          !!document.querySelector('[data-editor-active="true"]'));

      setIsEditorMode(isInPdfTools && hasEditorUrl);

      // Check if we're on auth pages
      const isOnAuthPage =
        typeof window !== "undefined" &&
        window.location.pathname.startsWith("/auth/");
      setIsAuthPage(isOnAuthPage);
    };

    checkModes();

    // Listen for changes in the editor state
    const observer = new MutationObserver(checkModes);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-editor-active"],
    });

    return () => observer.disconnect();
  }, [currentPage]);

  return (
    <>
      {!isEditorMode && !isAuthPage && <UniversalHeader />}
      {children}
    </>
  );
}

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NavigationProvider>
      <LayoutContent>{children}</LayoutContent>
    </NavigationProvider>
  );
}

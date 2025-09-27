"use client";

import { NavigationProvider } from "@/contexts/NavigationContext";
import UniversalHeader from "@/components/layout/UniversalHeader";

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NavigationProvider>
      <UniversalHeader />
      {children}
    </NavigationProvider>
  );
}

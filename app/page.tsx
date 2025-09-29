"use client";

import { useNavigation } from "@/contexts/NavigationContext";
import LandingPage from "@/components/pages/LandingPage";
import ToolsPage from "@/components/pages/ToolsPage";
import PDFTools from "@/components/pages/tools/pdf-tools/PDFTools";
import PDFEditor from "@/components/pages/PDFEditor";

export default function Home() {
  const { currentPage } = useNavigation();

  switch (currentPage) {
    case "home":
      return <LandingPage />;
    case "tools":
      return <ToolsPage />;
    case "pdf-tools":
      return <PDFTools />;
    case "pdf-editor":
      return <PDFEditor />;
    default:
      return <LandingPage />;
  }
}

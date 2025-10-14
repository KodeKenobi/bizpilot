"use client";

import { useNavigation } from "@/contexts/NavigationContext";
import LandingPage from "@/components/pages/LandingPage";
import ToolsPage from "@/components/pages/ToolsPage";
import PDFTools from "@/components/pages/tools/pdf-tools/PDFTools";
import PDFEditor from "@/components/pages/PDFEditor";
import VideoConverterPage from "@/components/pages/VideoConverterPage";
import AudioConverterPage from "@/components/pages/AudioConverterPage";
import ImageConverterPage from "@/components/pages/ImageConverterPage";
import QRGeneratorPage from "@/components/pages/QRGeneratorPage";

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
    case "video-converter":
      return <VideoConverterPage />;
    case "audio-converter":
      return <AudioConverterPage />;
    case "image-converter":
      return <ImageConverterPage />;
    case "qr-generator":
      return <QRGeneratorPage />;
    default:
      return <LandingPage />;
  }
}

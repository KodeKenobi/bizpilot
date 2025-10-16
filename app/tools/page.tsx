import ToolsPage from "@/components/pages/ToolsPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Online Tools - Video, Audio, Image, PDF Converters | Trevnoctilla",
  description: "Free online tools for video conversion, audio conversion, image conversion, PDF processing, and QR code generation. High-quality, fast, and secure file conversion tools.",
  keywords: "online tools, video converter, audio converter, image converter, pdf tools, qr generator, file converter, free tools, online converter",
  openGraph: {
    title: "Free Online Tools - Video, Audio, Image, PDF Converters",
    description: "Free online tools for video conversion, audio conversion, image conversion, PDF processing, and QR code generation.",
    type: "website",
  },
};

export default function ToolsRoute() {
  return <ToolsPage />;
}

import LandingPage from "@/components/pages/LandingPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trevnoctilla - Free Online File Conversion Tools",
  description: "Convert videos, audio, images, and PDFs with our free online tools. High-quality file conversion with compression, quality control, and advanced features.",
  keywords: "file converter, video converter, audio converter, image converter, pdf tools, qr generator, online converter, free tools, file conversion",
  openGraph: {
    title: "Trevnoctilla - Free Online File Conversion Tools",
    description: "Convert videos, audio, images, and PDFs with our free online tools. High-quality file conversion with compression, quality control, and advanced features.",
    type: "website",
  },
};

export default function Home() {
  return <LandingPage />;
}

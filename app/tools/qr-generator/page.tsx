import QRGeneratorPage from "@/components/pages/QRGeneratorPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "QR Code Generator - Create QR Codes for URLs, Text, WiFi | Trevnoctilla",
  description: "Generate QR codes for URLs, text, WiFi, contact info, and more. Free online QR code generator with customizable design and high-quality output.",
  keywords: "qr code generator, qr code creator, qr code maker, qr code for url, qr code for wifi, qr code for text, online qr generator",
  openGraph: {
    title: "QR Code Generator - Create QR Codes for URLs, Text, WiFi",
    description: "Generate QR codes for URLs, text, WiFi, contact info, and more. Free online QR code generator.",
    type: "website",
  },
};

export default function QRGeneratorRoute() {
  return <QRGeneratorPage />;
}

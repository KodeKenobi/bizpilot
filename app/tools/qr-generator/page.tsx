import { Metadata } from "next";
import { Suspense } from "react";
import dynamic from "next/dynamic";

// Dynamic import with loading state - reduces initial bundle by ~40KB
const QRGeneratorPage = dynamic(
  () => import("@/components/pages/QRGeneratorPage"),
  {
    loading: () => <QRGeneratorLoading />,
  }
);

function QRGeneratorLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Loading QR Generator...</p>
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: "Free Online QR Code Generator | Mobile Friendly | Trevnoctilla",
  description:
    "Free online QR code generator - no download, no signup, no credit card. Mobile-friendly. Create QR codes for URLs, text, WiFi instantly in your browser.",
  keywords:
    "free QR generator mobile, mobile friendly online QR generator, online QR generator no download, free QR code maker mobile, mobile QR generator online free, no signup QR generator mobile, online instant QR generator, free online QR generator mobile, mobile friendly instant QR generator",
  alternates: {
    canonical: "https://www.trevnoctilla.com/tools/qr-generator",
  },
  openGraph: {
    title:
      "Free Online QR Code Generator | Mobile Friendly | Create QR Codes Instantly",
    description:
      "Free online QR code generator - no download, no signup, no credit card. Mobile-friendly. Create QR codes for URLs, text, WiFi instantly in your browser.",
    type: "website",
    url: "https://www.trevnoctilla.com/tools/qr-generator",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Free Online QR Code Generator | Mobile Friendly",
  description:
    "Free online QR code generator - no download, no signup, no credit card. Mobile-friendly. Create QR codes for URLs, text, WiFi instantly in your browser.",
  url: "https://www.trevnoctilla.com/tools/qr-generator",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript. Requires HTML5.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  },
  featureList: [
    "Generate QR codes instantly in browser",
    "No download or installation required",
    "No signup or account needed",
    "Works on mobile, tablet, and desktop",
    "Instant generation in cloud",
    "Support for URLs, text, WiFi, and more",
    "Perfect for students and developers",
  ],
  screenshot: "https://www.trevnoctilla.com/logo.png",
  author: {
    "@type": "Organization",
    name: "Trevnoctilla",
    url: "https://www.trevnoctilla.com",
  },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.trevnoctilla.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Tools",
        item: "https://www.trevnoctilla.com/tools",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "QR Generator",
        item: "https://www.trevnoctilla.com/tools/qr-generator",
      },
    ],
  },
};

export default function QRGeneratorRoute() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Suspense fallback={<QRGeneratorLoading />}>
        <QRGeneratorPage />
      </Suspense>
    </>
  );
}

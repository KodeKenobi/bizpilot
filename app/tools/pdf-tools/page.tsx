import { Metadata } from "next";
import { Suspense } from "react";
import dynamic from "next/dynamic";

// Dynamic import with loading state - reduces initial bundle by ~100KB
const PDFTools = dynamic(
  () => import("@/components/pages/tools/pdf-tools/PDFTools"),
  {
    loading: () => <PDFToolsLoading />,
  }
);

function PDFToolsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Loading PDF Tools...</p>
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title:
    "Free Online PDF Tools | Mobile Friendly | Extract, Merge, Split PDFs | Trevnoctilla",
  description:
    "Free online PDF tools - no download, no signup, no credit card. Mobile-friendly. Extract text/images, merge, split, sign, watermark, and compress PDFs instantly in your browser.",
  keywords:
    "free pdf editor mobile, mobile friendly pdf editor, online PDF tools no download, free PDF tools mobile, mobile friendly online PDF tools, no signup PDF tools mobile, online instant PDF processing, free online PDF editor mobile, mobile PDF editor online free, free PDF merge mobile",
  alternates: {
    canonical: "https://www.trevnoctilla.com/tools/pdf-tools",
  },
  openGraph: {
    title:
      "Free Online PDF Tools | Mobile Friendly | Extract, Merge, Split PDFs",
    description:
      "Free online PDF tools - no download, no signup, no credit card. Mobile-friendly. Extract text/images, merge, split, sign, watermark, and compress PDFs instantly in your browser.",
    type: "website",
    url: "https://www.trevnoctilla.com/tools/pdf-tools",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Free Online PDF Tools | Mobile Friendly",
  description:
    "Free online PDF tools - no download, no signup, no credit card. Mobile-friendly. Extract, merge, split, sign, compress PDFs instantly in your browser.",
  url: "https://www.trevnoctilla.com/tools/pdf-tools",
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
    "Process PDFs instantly in browser",
    "No download or installation required",
    "No signup or account needed",
    "Works on mobile, tablet, and desktop",
    "Instant processing in cloud",
    "Merge, split, extract, sign, compress",
    "Perfect for students and developers",
  ],
  screenshot: "https://www.trevnoctilla.com/logo.png",
  softwareVersion: "1.0",
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
        name: "PDF Tools",
        item: "https://www.trevnoctilla.com/tools/pdf-tools",
      },
    ],
  },
};

export default function PDFToolsRoute() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Suspense fallback={<PDFToolsLoading />}>
        <PDFTools />
      </Suspense>
    </>
  );
}

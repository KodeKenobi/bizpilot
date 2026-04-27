import { Metadata } from "next";
import { Suspense } from "react";
import dynamic from "next/dynamic";

// Dynamic import with loading state - reduces initial bundle by ~50KB
const ImageConverterPage = dynamic(
  () => import("@/components/pages/ImageConverterPage"),
  {
    loading: () => <ImageConverterLoading />,
  }
);

function ImageConverterLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Loading Image Converter...</p>
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: "Free Online Image Converter | Mobile Friendly | Trevnoctilla",
  description:
    "Free online image converter - no download, no signup, no credit card. Mobile-friendly. Convert JPG, PNG, WebP, GIF instantly in your browser.",
  keywords:
    "free image converter mobile, mobile friendly online image converter, online image converter no download, free JPG converter mobile, mobile image converter online free, no signup image converter mobile, online instant image converter, free online image converter mobile, mobile friendly instant image converter",
  alternates: {
    canonical: "https://www.trevnoctilla.com/tools/image-converter",
  },
  openGraph: {
    title:
      "Free Online Image Converter | Mobile Friendly | Convert JPG, PNG, WEBP",
    description:
      "Free online image converter - no download, no signup, no credit card. Mobile-friendly. Convert JPG, PNG, WebP, GIF instantly in your browser.",
    type: "website",
    url: "https://www.trevnoctilla.com/tools/image-converter",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Free Online Image Converter | Mobile Friendly",
  description:
    "Free online image converter - no download, no signup, no credit card. Mobile-friendly. Convert JPG, PNG, WebP, GIF instantly in your browser.",
  url: "https://www.trevnoctilla.com/tools/image-converter",
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript. Requires HTML5.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  },
  featureList: [
    "Convert images instantly in browser",
    "No download or installation required",
    "No signup or account needed",
    "Works on mobile, tablet, and desktop",
    "Instant processing in cloud",
    "Support for all major image formats",
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
        name: "Image Converter",
        item: "https://www.trevnoctilla.com/tools/image-converter",
      },
    ],
  },
};

export default function ImageConverterRoute() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Suspense fallback={<ImageConverterLoading />}>
        <ImageConverterPage />
      </Suspense>
    </>
  );
}

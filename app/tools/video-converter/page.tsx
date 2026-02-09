import { Metadata } from "next";
import { Suspense } from "react";
import dynamic from "next/dynamic";

// Dynamic import with loading state - reduces initial bundle by ~80KB
const VideoConverterPage = dynamic(
  () => import("@/components/pages/VideoConverterPage"),
  {
    loading: () => <VideoConverterLoading />,
  }
);

function VideoConverterLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Loading Video Converter...</p>
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: "Free Online Video Converter | Mobile Friendly | Trevnoctilla",
  description:
    "Free online video converter - no download, no signup, no credit card. Mobile-friendly. Convert MP4, AVI, MOV, WebM instantly in your browser.",
  keywords:
    "free video converter mobile, mobile friendly online video converter, online video converter no download, free MP4 converter mobile, mobile video converter online free, no signup video converter mobile, online instant video converter, free online video converter mobile, mobile friendly instant converter",
  alternates: {
    canonical: "https://www.trevnoctilla.com/tools/video-converter",
  },
  openGraph: {
    title:
      "Free Online Video Converter | Mobile Friendly | Convert MP4, AVI, MOV",
    description:
      "Free online video converter - no download, no signup, no credit card. Mobile-friendly. Convert MP4, AVI, MOV, WebM instantly in your browser.",
    type: "website",
    url: "https://www.trevnoctilla.com/tools/video-converter",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Free Online Video Converter | Mobile Friendly",
  description:
    "Free online video converter - no download, no signup, no credit card. Mobile-friendly. Convert MP4, AVI, MOV, WebM instantly in your browser.",
  url: "https://www.trevnoctilla.com/tools/video-converter",
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
    "Convert videos instantly in browser",
    "No download or installation required",
    "No signup or account needed",
    "Works on mobile, tablet, and desktop",
    "Instant processing in cloud",
    "Support for all major video formats",
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
        name: "Video Converter",
        item: "https://www.trevnoctilla.com/tools/video-converter",
      },
    ],
  },
};

export default function VideoConverterRoute() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Suspense fallback={<VideoConverterLoading />}>
        <VideoConverterPage />
      </Suspense>
    </>
  );
}

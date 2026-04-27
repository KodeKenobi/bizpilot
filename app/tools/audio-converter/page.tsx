import { Metadata } from "next";
import { Suspense } from "react";
import dynamic from "next/dynamic";

// Dynamic import with loading state - reduces initial bundle by ~60KB
const AudioConverterPage = dynamic(
  () => import("@/components/pages/AudioConverterPage"),
  {
    loading: () => <AudioConverterLoading />,
  }
);

function AudioConverterLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Loading Audio Converter...</p>
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: "Free Online Audio Converter | Mobile Friendly | Trevnoctilla",
  description:
    "Free online audio converter - no download, no signup, no credit card. Mobile-friendly. Convert MP3, WAV, AAC, FLAC instantly in your browser.",
  keywords:
    "free audio converter mobile, mobile friendly online audio converter, online audio converter no download, free MP3 converter mobile, mobile audio converter online free, no signup audio converter mobile, online instant audio converter, free online audio converter mobile, mobile friendly instant audio converter",
  alternates: {
    canonical: "https://www.trevnoctilla.com/tools/audio-converter",
  },
  openGraph: {
    title:
      "Free Online Audio Converter | Mobile Friendly | Convert MP3, WAV, AAC",
    description:
      "Free online audio converter - no download, no signup, no credit card. Mobile-friendly. Convert MP3, WAV, FLAC, AAC instantly in your browser.",
    type: "website",
    url: "https://www.trevnoctilla.com/tools/audio-converter",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Free Online Audio Converter | Mobile Friendly",
  description:
    "Free online audio converter - no download, no signup, no credit card. Mobile-friendly. Convert MP3, WAV, AAC, FLAC instantly in your browser.",
  url: "https://www.trevnoctilla.com/tools/audio-converter",
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
    "Convert audio instantly in browser",
    "No download or installation required",
    "No signup or account needed",
    "Works on mobile, tablet, and desktop",
    "Instant processing in cloud",
    "Support for all major audio formats",
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
        name: "Audio Converter",
        item: "https://www.trevnoctilla.com/tools/audio-converter",
      },
    ],
  },
};

export default function AudioConverterRoute() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Suspense fallback={<AudioConverterLoading />}>
        <AudioConverterPage />
      </Suspense>
    </>
  );
}

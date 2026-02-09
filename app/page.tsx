import LandingPage from "@/components/pages/LandingPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trevnoctilla - Free Online PDF Editor | Mobile Friendly Tools",
  description:
    "Free online PDF editor and file converter - no download, no signup, no credit card. Mobile-friendly. Convert videos, audio, images instantly in your browser.",
  keywords:
    "free pdf editor, free online pdf editor, edit pdf online for free, edit pdf, edit pdf for free, edit pdf for free on mobile, mobile pdf editor, online mobile pdf editor, pdf editor free, online pdf editor, pdf editor online, mobile friendly pdf editor, free pdf editor mobile, mobile pdf editor free, edit pdf on mobile, edit pdf on phone, online pdf editor no download, no download pdf editor, online file converter no signup, free video converter mobile, mobile friendly file converter, online audio converter free, free image converter mobile, no credit card required",
  alternates: {
    canonical: "https://www.trevnoctilla.com",
  },
  openGraph: {
    title: "Trevnoctilla - Free Online PDF Editor | Mobile Friendly Tools",
    description:
      "Free online PDF editor and file converter - no download, no signup, no credit card. Mobile-friendly. Convert videos, audio, images instantly in your browser.",
    type: "website",
    url: "https://www.trevnoctilla.com",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://www.trevnoctilla.com/#website",
      url: "https://www.trevnoctilla.com",
      name: "Trevnoctilla",
      description:
        "Free online PDF editor and file converter - no download, no signup, no credit card. Mobile-friendly. Convert videos, audio, images instantly in your browser.",
      publisher: { "@id": "https://www.trevnoctilla.com/#organization" },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate:
            "https://www.trevnoctilla.com/tools?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://www.trevnoctilla.com/#organization",
      name: "Trevnoctilla",
      url: "https://www.trevnoctilla.com",
      logo: {
        "@type": "ImageObject",
        url: "https://www.trevnoctilla.com/logo.png",
        width: 512,
        height: 512,
      },
      sameAs: [],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "info@trevnoctilla.com",
        url: "https://www.trevnoctilla.com/contact",
      },
    },
    {
      "@type": "WebApplication",
      "@id": "https://www.trevnoctilla.com/#webapp",
      name: "Trevnoctilla File Converter",
      url: "https://www.trevnoctilla.com",
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript. Requires HTML5.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: [
        "PDF Merge",
        "PDF Split",
        "PDF Compress",
        "PDF to Word",
        "PDF Signing",
        "Video Conversion",
        "Audio Conversion",
        "Image Conversion",
        "QR Code Generation",
      ],
      screenshot: "https://www.trevnoctilla.com/logo.png",
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <LandingPage />
    </>
  );
}

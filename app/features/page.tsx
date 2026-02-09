import { Metadata } from "next";
import FeaturesClient from "./FeaturesClient";

export const metadata: Metadata = {
  title:
    "Features - Browser-Based File Converter | No Download Required | Trevnoctilla",
  description:
    "Explore all browser-based features: Edit PDFs instantly, merge & split PDFs, add signatures, convert videos, audio & images. No download, no signup required. Perfect for students, developers, and mobile users.",
  keywords: [
    "browser PDF editor features",
    "no download PDF tools",
    "instant file converter features",
    "browser document tools",
    "web PDF merge instant",
    "browser PDF split no signup",
    "instant PDF signature web",
    "browser video converter features",
    "web audio converter instant",
    "browser image converter features",
    "instant file converter web",
    "browser document processing",
    "no download PDF compress",
    "browser PDF watermark",
    "instant OCR text extraction",
    "browser QR generator",
  ].join(", "),
  alternates: {
    canonical: "https://www.trevnoctilla.com/features",
  },
  openGraph: {
    title: "Features - Browser-Based File Converter | No Download Required",
    description:
      "Browser-based file toolkit: Edit PDFs instantly, merge, split, sign, convert videos, audio & images. No download, no signup required.",
    type: "website",
    url: "https://www.trevnoctilla.com/features",
  },
  twitter: {
    card: "summary_large_image",
    title: "Features - Browser-Based File Converter | No Download Required",
    description:
      "Browser-based file toolkit: Edit PDFs instantly, merge, split, sign, convert videos, audio & images. No download, no signup required.",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://www.trevnoctilla.com/features",
      name: "Features - Browser-Based File Converter | No Download Required",
      description:
        "Complete feature list for Trevnoctilla's browser-based PDF editor and file conversion tools. No download, no signup required.",
      url: "https://www.trevnoctilla.com/features",
      isPartOf: { "@id": "https://www.trevnoctilla.com/#website" },
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
            name: "Features",
            item: "https://www.trevnoctilla.com/features",
          },
        ],
      },
    },
    {
      "@type": "ItemList",
      name: "Trevnoctilla Features",
      description: "Complete list of features available in Trevnoctilla",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          item: {
            "@type": "Thing",
            name: "PDF Editor",
            description:
              "Edit PDF files instantly in your browser - no download, no signup. Add text, images, annotations",
          },
        },
        {
          "@type": "ListItem",
          position: 2,
          item: {
            "@type": "Thing",
            name: "PDF Merge & Split",
            description:
              "Combine or split PDFs instantly in your browser. No download required",
          },
        },
        {
          "@type": "ListItem",
          position: 3,
          item: {
            "@type": "Thing",
            name: "Digital Signatures",
            description:
              "Add digital signatures instantly in your browser. No signup required",
          },
        },
        {
          "@type": "ListItem",
          position: 4,
          item: {
            "@type": "Thing",
            name: "Video Converter",
            description:
              "Convert videos instantly in your browser. No software installation needed",
          },
        },
        {
          "@type": "ListItem",
          position: 5,
          item: {
            "@type": "Thing",
            name: "Audio Converter",
            description:
              "Convert audio files instantly in your browser. No download required",
          },
        },
        {
          "@type": "ListItem",
          position: 6,
          item: {
            "@type": "Thing",
            name: "Image Converter",
            description:
              "Convert images instantly in your browser. No software needed",
          },
        },
      ],
    },
  ],
};

export default function FeaturesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <FeaturesClient />
    </>
  );
}

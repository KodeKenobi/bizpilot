import ToolsPage from "@/components/pages/ToolsPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Only Free Browser File Converter Tools | Mobile Friendly | Trevnoctilla",
  description:
    "Only free browser file converter tools - no download, no signup, no credit card. Mobile-friendly. Convert videos, audio, images, PDFs, and generate QR codes instantly in your browser.",
  keywords:
    "only free file converter mobile, mobile friendly browser converter, browser file converter no download, only free video converter mobile, mobile friendly audio converter, browser image converter free, only free pdf tools mobile, mobile friendly browser tools, no signup file converter mobile, browser instant converter free, only free web converter, mobile converter browser free",
  alternates: {
    canonical: "https://www.trevnoctilla.com/tools",
  },
  openGraph: {
    title: "Free Online File Converter Tools | Mobile Friendly",
    description:
      "Free online file converter tools - no download, no signup, no credit card. Mobile-friendly. Convert videos, audio, images, PDFs, and generate QR codes instantly in your browser.",
    type: "website",
    url: "https://www.trevnoctilla.com/tools",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": "https://www.trevnoctilla.com/tools",
  name: "Free Online File Converter Tools | Mobile Friendly",
  description:
    "Free online file converter tools - no download, no signup, no credit card. Mobile-friendly. Convert videos, audio, images, PDFs, and generate QR codes instantly in your browser.",
  url: "https://www.trevnoctilla.com/tools",
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
        name: "Tools",
        item: "https://www.trevnoctilla.com/tools",
      },
    ],
  },
  mainEntity: {
    "@type": "ItemList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        item: {
          "@type": "SoftwareApplication",
          name: "Free Online Video Converter | Mobile Friendly",
          url: "https://www.trevnoctilla.com/tools/video-converter",
          applicationCategory: "MultimediaApplication",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        },
      },
      {
        "@type": "ListItem",
        position: 2,
        item: {
          "@type": "SoftwareApplication",
          name: "Free Online Audio Converter | Mobile Friendly",
          url: "https://www.trevnoctilla.com/tools/audio-converter",
          applicationCategory: "MultimediaApplication",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        },
      },
      {
        "@type": "ListItem",
        position: 3,
        item: {
          "@type": "SoftwareApplication",
          name: "Free Online Image Converter | Mobile Friendly",
          url: "https://www.trevnoctilla.com/tools/image-converter",
          applicationCategory: "MultimediaApplication",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        },
      },
      {
        "@type": "ListItem",
        position: 4,
        item: {
          "@type": "SoftwareApplication",
          name: "Free Online PDF Tools | Mobile Friendly",
          url: "https://www.trevnoctilla.com/tools/pdf-tools",
          applicationCategory: "UtilitiesApplication",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        },
      },
      {
        "@type": "ListItem",
        position: 5,
        item: {
          "@type": "SoftwareApplication",
          name: "Free Online QR Code Generator | Mobile Friendly",
          url: "https://www.trevnoctilla.com/tools/qr-generator",
          applicationCategory: "UtilitiesApplication",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        },
      },
    ],
  },
};

export default function ToolsRoute() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ToolsPage />
    </>
  );
}

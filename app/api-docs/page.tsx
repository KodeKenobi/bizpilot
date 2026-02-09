import { Metadata } from "next";
import ApiDocsClient from "./ApiDocsClient";

export const metadata: Metadata = {
  title: "API Documentation - File Processing APIs | Trevnoctilla",
  description:
    "Comprehensive API documentation for Trevnoctilla's file processing APIs. Convert PDFs, videos, images, and audio with our powerful REST APIs.",
  keywords:
    "API documentation, file processing API, PDF API, video converter API, image API, REST API, developer API",
  alternates: {
    canonical: "https://www.trevnoctilla.com/api-docs",
  },
  openGraph: {
    title: "API Documentation - File Processing APIs | Trevnoctilla",
    description:
      "Comprehensive API documentation for Trevnoctilla's file processing APIs. Convert PDFs, videos, images, and audio with our powerful REST APIs.",
    type: "website",
    url: "https://www.trevnoctilla.com/api-docs",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "Trevnoctilla API Documentation - File Processing APIs",
  description:
    "Comprehensive API documentation for Trevnoctilla's file processing APIs. Convert PDFs, videos, images, and audio.",
  url: "https://www.trevnoctilla.com/api-docs",
  author: {
    "@type": "Organization",
    name: "Trevnoctilla",
    url: "https://www.trevnoctilla.com",
  },
  publisher: {
    "@type": "Organization",
    name: "Trevnoctilla",
    logo: {
      "@type": "ImageObject",
      url: "https://www.trevnoctilla.com/logo.png",
    },
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://www.trevnoctilla.com/api-docs",
  },
  about: {
    "@type": "WebAPI",
    name: "Trevnoctilla File Processing API",
    description:
      "REST API for file processing including PDF, video, audio, and image conversion.",
    documentation: "https://www.trevnoctilla.com/api-docs",
    provider: {
      "@type": "Organization",
      name: "Trevnoctilla",
    },
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
        name: "API Documentation",
        item: "https://www.trevnoctilla.com/api-docs",
      },
    ],
  },
};

export default function ApiDocsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ApiDocsClient />
    </>
  );
}

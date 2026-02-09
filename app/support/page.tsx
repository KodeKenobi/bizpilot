import { Metadata } from "next";
import SupportClient from "./SupportClient";

export const metadata: Metadata = {
  title: "Help Center & FAQ - Support | Trevnoctilla",
  description:
    "Find answers to common questions about Trevnoctilla's file conversion tools, account management, billing, and more. Get help with PDF tools, video converter, audio converter, and image converter.",
  keywords:
    "help center, FAQ, support, trevnoctilla help, pdf tools help, video converter help, audio converter help, customer support",
  alternates: {
    canonical: "https://www.trevnoctilla.com/support",
  },
  openGraph: {
    title: "Help Center & FAQ - Support | Trevnoctilla",
    description:
      "Find answers to common questions about Trevnoctilla's file conversion tools, account management, billing, and more.",
    type: "website",
    url: "https://www.trevnoctilla.com/support",
  },
};

// FAQPage structured data for rich results in Google
const structuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    // Account & Billing
    {
      "@type": "Question",
      name: "How do I create an account?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Click on 'Sign Up' or 'Register' in the top navigation. Enter your email address, create a password, and verify your email. Your account will be ready to use immediately after verification.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use Trevnoctilla without an account?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! Our core file conversion tools are completely free to use without registration. However, creating an account unlocks additional features like conversion history, higher file limits, and API access.",
      },
    },
    {
      "@type": "Question",
      name: "What payment methods do you accept?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We accept payments through PayFast, which supports credit cards, debit cards, instant EFT, and other popular South African payment methods. International cards are also supported.",
      },
    },
    {
      "@type": "Question",
      name: "Do you offer refunds?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We offer a 7-day money-back guarantee for new subscriptions. If you're not satisfied, contact our support team within 7 days of your purchase for a full refund.",
      },
    },
    // PDF Tools
    {
      "@type": "Question",
      name: "What PDF operations are supported?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We support: PDF to Word conversion, Word to PDF, merge multiple PDFs, split PDFs, extract text, extract images, compress PDFs, add digital signatures, add watermarks, convert PDFs to images, and HTML to PDF conversion.",
      },
    },
    {
      "@type": "Question",
      name: "What is the maximum PDF file size?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Free users can upload PDFs up to 10MB. Premium users enjoy file sizes up to 50MB, and Enterprise users have unlimited file size support.",
      },
    },
    {
      "@type": "Question",
      name: "Are my PDF files kept private?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Absolutely. All uploaded files are processed in isolated environments and automatically deleted within 1 hour of processing. We never share or access your file contents.",
      },
    },
    // Video Converter
    {
      "@type": "Question",
      name: "What video formats are supported?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We support all major formats: MP4, AVI, MOV, MKV, WEBM, FLV, WMV, 3GP, and more. Convert between any combination of these formats with full control over quality settings.",
      },
    },
    {
      "@type": "Question",
      name: "Can I reduce video file size without losing quality?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! Our compression settings allow you to balance file size and quality. Modern codecs like H.265/HEVC can reduce size by 50% with minimal quality loss.",
      },
    },
    // Audio Converter
    {
      "@type": "Question",
      name: "What audio formats are supported?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We support MP3, WAV, AAC, FLAC, OGG, WMA, M4A, AIFF, and more. Convert between any formats while preserving audio quality.",
      },
    },
    // Image Converter
    {
      "@type": "Question",
      name: "What image formats are supported?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We support JPG/JPEG, PNG, WebP, GIF, BMP, TIFF, HEIC, SVG, and ICO. Convert between any formats with quality control and resizing options.",
      },
    },
    {
      "@type": "Question",
      name: "How do I convert HEIC to JPG?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Simply upload your HEIC file (common on iPhones) and select JPG as output format. The conversion preserves image quality while ensuring compatibility with all devices.",
      },
    },
    // QR Generator
    {
      "@type": "Question",
      name: "What types of QR codes can I create?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Create QR codes for URLs, plain text, email addresses, phone numbers, SMS messages, WiFi credentials, vCards (contact info), and geographic locations.",
      },
    },
    // Security
    {
      "@type": "Question",
      name: "Are my files secure?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Absolutely. All file transfers use TLS 1.3 encryption. Files are processed in isolated environments and automatically deleted within 1 hour. We never access or share your file contents.",
      },
    },
    {
      "@type": "Question",
      name: "Is Trevnoctilla GDPR compliant?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! We're fully GDPR compliant. We collect minimal data, provide data export/deletion upon request, and never sell or share personal information with third parties.",
      },
    },
  ],
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
        name: "Support",
        item: "https://www.trevnoctilla.com/support",
      },
    ],
  },
};

export default function SupportPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <SupportClient />
    </>
  );
}

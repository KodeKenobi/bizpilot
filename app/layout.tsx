import type { Metadata } from "next";
import "./globals.css";
import LayoutClient from "@/components/layout/LayoutClient";
import { UserProvider } from "@/contexts/UserContext";
import { ViewProvider } from "@/contexts/ViewContext";
import { AlertProvider } from "@/contexts/AlertProvider";
import { MonetizationProvider } from "@/contexts/MonetizationProvider";
import AuthProvider from "@/components/providers/AuthProvider";
import Script from "next/script";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.trevnoctilla.com"),
  title: "Trevnoctilla - Free Online PDF Editor | Mobile Friendly Tools",
  description:
    "Free online PDF editor and file converter - no download, no signup, no credit card. Mobile-friendly. Convert videos, audio, images instantly in your browser.",
  keywords: [
    // ============================
    // HIGH-VOLUME PRIMARY KEYWORDS
    // ============================
    "free online tools",
    "free pdf tools",
    "free pdf editor",
    "free online pdf editor",
    "edit pdf online for free",
    "online pdf editor",
    "pdf editor online",
    "pdf editor free",
    "edit pdf",
    "edit pdf for free",
    "convert files online",
    "free file converter",
    "file converter online free",
    "convert pdf to word",
    "convert word to pdf",
    "convert pdf to jpg",
    "convert jpg to pdf",
    "compress files online",
    "compress pdf online",
    "merge pdf online",
    "split pdf online",
    "free image converter",
    "free image compressor",
    "resize image online",
    "online audio converter",
    "free audio converter",
    "online video converter",
    "free video converter",
    "convert video online",
    "free document converter",
    "word editor online",
    "pdf to png",
    "png to pdf",
    "ppt to pdf converter",
    "excel to pdf converter",
    "pdf to excel converter",
    "online form filler",
    "edit documents online",
    "fill pdf forms online",

    // ============================
    // MOBILE-FIRST KEYWORDS
    // ============================
    "edit pdf on mobile",
    "edit pdf for free on mobile",
    "mobile pdf editor",
    "mobile pdf editor free",
    "online mobile pdf editor",
    "edit pdf on phone",
    "mobile friendly pdf editor",
    "free pdf editor mobile",
    "mobile friendly file converter",
    "free video converter mobile",
    "free image converter mobile",
    "free document converter mobile",
    "mobile friendly instant converter",

    // ============================
    // NO DOWNLOAD / NO SIGNUP
    // ============================
    "online tools no signup",
    "online pdf editor no download",
    "no download pdf editor",
    "no download pdf editor mobile",
    "online file converter no signup",
    "no signup file converter",
    "no signup file converter mobile",
    "online tools no account",
    "online tools no app needed",

    // ============================
    // ADDITIONAL TOOL ACTION KEYWORDS
    // ============================
    "compress documents online",
    "reduce pdf size",
    "resize pdf",
    "rotate pdf online",
    "unlock pdf online",
    "protect pdf online",
    "watermark pdf online",
    "annotate pdf online",
    "sign pdf online",
    "combine images to pdf",
    "free ocr online",
    "extract text from pdf",
    "pdf repair online",
    "fix corrupted pdf",
    "free online converters",
    "instant file converter",

    // ============================
    // AI TOOL KEYWORDS
    // ============================
    "ai pdf tools",
    "ai document converter",
    "ai file converter",
    "ai text extractor",
    "ai summarizer online",
    "ai transcription tool",
    "ai file cleanup tool",

    // ============================
    // BRAND
    // ============================
    "Trevnoctilla",
    "Trevnoctilla tools",
    "Trevnoctilla pdf editor",
    "Trevnoctilla file converter",

    // ============================
    // REGIONAL (GLOBAL SOUTH)
    // ============================
    "free pdf editor in india",
    "free pdf editor in pakistan",
    "free pdf editor in bangladesh",
    "free pdf editor in nigeria",
    "free pdf editor in kenya",
    "free pdf editor in south africa",

    // ============================
    // MZANSI-FOCUSED KEYWORDS
    // ============================

    // General SA intent
    "free pdf editor south africa",
    "edit pdf online south africa",
    "best pdf editor south africa",
    "free pdf editor mzansi",
    "edit pdf free mzansi",
    "edit pdf free sa",
    "free pdf tools south africa",
    "how to edit pdf on phone in south africa",

    // Mobile (SA style)
    "edit pdf on android south africa",
    "edit pdf on iphone south africa",
    "free pdf editor for android mzansi",
    "pdf editor mobile south africa",
    "mobile pdf editor south africa free",
    "fix pdf on phone south africa",

    // No download / no signup (SA)
    "pdf editor no download south africa",
    "edit pdf without app south africa",
    "pdf editor no signup south africa",
    "online tools no app sa",
    "file converter no download south africa",

    // Converters (SA)
    "convert pdf to word south africa",
    "word to pdf converter south africa",
    "cv pdf converter south africa",
    "compress pdf south africa",
    "resize pdf south africa",
    "image to pdf south africa",
    "pdf to jpg south africa",
    "free file converter south africa",

    // Student + Youth Searches
    "pdf converter for students sa",
    "pdf tools for school south africa",
    "edit school pdfs south africa",
    "edit pdf for nsfas documents",
    "compress pdf for nsfas",
    "resize pdf for nsfas upload",
    "nsfas document converter",
    "nsfas pdf compressor",

    // Government / Job Applications
    "sassa pdf editor",
    "sassa document converter",
    "compress documents for sassa",
    "z83 form pdf editor",
    "z83 editable form",
    "edit z83 form online",
    "edit z83 form online free",
    "z83 editable form south africa",
    "edit cv pdf south africa",
    "compress documents for online application south africa",
    "convert files for job applications south africa",

    // Brand + SA region
    "trevnoctilla south africa",
    "trevnoctilla pdf editor sa",
    "trevnoctilla tools mzansi",

    // ============================
    // LONG-TAIL SEARCH BEHAVIOUR
    // ============================
    "how to convert word to pdf free",
    "how to merge pdf files online free",
    "how to compress pdf for email",
    "how to edit scanned pdf",
    "how to sign pdf online",
    "best free pdf tools 2025",
    "fastest pdf compressor online",
    "online tools for school",
    "tools for job applications",
    "free tools for students",
    "online converters for mobile",
    "edit documents without installing apps",
  ],
  authors: [{ name: "Trevnoctilla" }],
  creator: "Trevnoctilla",
  publisher: "Trevnoctilla",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    monetag: "6a1c8e9c1dd41add268aac02d05eeaca",
    "google-site-verification": "v3OpUgQr5DG7MSb3pzlkM_MpddSuZHJVyCGicmfCbFg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.trevnoctilla.com",
    siteName: "Trevnoctilla",
    title: "Trevnoctilla - Browser-Based File Converter | No Download Required",
    description:
      "Free browser-based PDF editor and file converter — no download, no signup. Convert videos, audio, images instantly in your web browser. Perfect for students, developers, and mobile users.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Trevnoctilla - Edit PDF for Free",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trevnoctilla - Browser-Based File Converter | No Download Required",
    description:
      "Free browser-based PDF editor and file converter — no download, no signup. Convert videos, audio, images instantly in your web browser. Perfect for students, developers, and mobile users.",
    images: ["/logo.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48" },
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/favicon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Critical Resource Hints - Limited to 4 most important for performance */}
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap"
          rel="stylesheet"
        />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />

        {/* Google AdSense - in head to avoid data-nscript warning */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3267907607581065"
          crossOrigin="anonymous"
        />

        {/* Favicon links */}
        <link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="icon" href="/favicon.png" sizes="32x32" type="image/png" />
        <link
          rel="icon"
          href="/icons/icon-192.png"
          sizes="192x192"
          type="image/png"
        />
        <link
          rel="icon"
          href="/icons/icon-512.png"
          sizes="512x512"
          type="image/png"
        />
        <link rel="apple-touch-icon" href="/favicon.png" sizes="180x180" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0ea5e9" />

        {/* Structured Data - Critical for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Trevnoctilla",
              description:
                "Free online PDF editor and file converter - no download, no signup, no credit card. Mobile-friendly. Convert videos, audio, images instantly in your browser.",
              url: "https://www.trevnoctilla.com",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web Browser",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              featureList: [
                "Browser PDF Editor",
                "Instant PDF Signing",
                "Browser OCR Text Extraction",
                "Instant File Conversion",
                "Browser PDF API",
                "Browser Video Converter",
                "Browser Audio Converter",
                "Browser Image Converter",
                "Cloud PDF Processing",
                "Browser Document Converter",
              ],
              author: {
                "@type": "Organization",
                name: "Trevnoctilla",
              },
            }),
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          <UserProvider>
            <ViewProvider>
              <AlertProvider>
                <MonetizationProvider>
                  <LayoutClient>{children}</LayoutClient>
                </MonetizationProvider>
              </AlertProvider>
            </ViewProvider>
          </UserProvider>
        </AuthProvider>

        {/* === NON-BLOCKING SCRIPTS - Loaded after page is interactive === */}

        {/* Ezoic initialization - lazyOnload for non-blocking */}
        <Script id="ezoic-init" strategy="lazyOnload">
          {`
            window.ezstandalone = window.ezstandalone || {};
            ezstandalone.cmd = ezstandalone.cmd || [];
            window._ezaq = window._ezaq || [];
          `}
        </Script>

        {/* Ezoic Scripts - lazyOnload */}
        <Script
          src="https://cmp.gatekeeperconsent.com/min.js"
          strategy="lazyOnload"
          data-cfasync="false"
        />
        <Script
          src="https://the.gatekeeperconsent.com/cmp.min.js"
          strategy="lazyOnload"
          data-cfasync="false"
        />
        <Script src="//www.ezojs.com/ezoic/sa.min.js" strategy="lazyOnload" />

        {/* Google Analytics - afterInteractive for better tracking accuracy */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}');
          `}
        </Script>
      </body>
    </html>
  );
}

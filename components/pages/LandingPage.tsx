"use client";

import Link from "next/link";

import { ArrowRight, Play, FileText, QrCode, Image, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigation } from "@/contexts/NavigationContext";
import { CircuitPulse } from "@/components/ui/CircuitPulse";
import { FileConversionCard } from "@/components/ui/file-conversion-card";
import { StarGrid } from "@/components/ui/StarGrid";
import { cn } from "@/lib/utils";
import { Globe } from "@/components/Globe";

export default function LandingPage() {
  const { navigateTo } = useNavigation();

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [cardOrder, setCardOrder] = useState([
    { text: "Convert videos to high-quality MP3 audio", icon: Play },
    { text: "Create animated GIFs from video content", icon: ArrowRight },
    { text: "Merge multiple PDF files seamlessly", icon: FileText },
    { text: "Generate custom QR codes instantly", icon: QrCode },
    { text: "Convert images between formats", icon: Image },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCardOrder((prev) => {
        const [first, ...rest] = prev;
        return [...rest, first];
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="min-h-screen relative overflow-hidden page-content bg-background">
        {/* Background Image Layer - Hidden on mobile */}
        {/* <div
          className="absolute inset-0 opacity-30 hidden md:block"
          style={{
            background: 'url("/platform-hero-bg.png") no-repeat center top',
            backgroundSize: "contain",
            backgroundPosition: "center -50px",
          }}
        ></div> */}
        {/* Background elements removed - no gradients */}

        {/* Hero Section */}
        <main className="relative z-20 px-6 lg:px-12 pt-12 sm:pt-16 lg:pt-24 pb-32">
          <div className="max-w-6xl mx-auto text-center">
            {/* Hero Text Container - CSS animations for faster initial paint */}
            <div className="relative mb-12">
              {/* Main Headline */}
              <h1 className="text-4xl lg:text-6xl font-bold mb-8 leading-tight mt-4 sm:mt-8 lg:mt-14">
                The only file conversion that works where you work
              </h1>

              {/* Subtitle */}
              <p className="text-xl text-foreground/70 mb-12 max-w-3xl mx-auto leading-relaxed">
                Transform your media files with our intelligent conversion system. From video to audio, PDF merging to QR generation, manage everything in one place.
              </p>
            </div>

            {/* Stacked Cards */}
            <div className="max-w-2xl mx-auto px-4 sm:px-0">
              <div className="relative h-80 flex flex-col items-center">
                {cardOrder.map((card, index) => {
                  const IconComponent = card.icon;
                  return (
                    <div
                      key={card.text}
                      className="absolute bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-foreground transition-all duration-300 hover:bg-white/20 hover:border-white/40"
                      style={{
                        opacity: 1,
                        width: `${Math.max(85, 100 - index * 10)}%`,
                        height: `${90 - index * 9}px`,
                        top: `${index * 8}%`,
                        zIndex: 5 - index,
                        padding: `${16 - index * 2}px 20px`,
                      }}
                    >
                      <div className="flex items-center justify-center h-full text-center px-2">
                        <IconComponent className="text-foreground/70 w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0" />
                        <span className="text-xs sm:text-sm opacity-90 leading-tight break-words">{card.text}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="mt-[-120px] flex flex-row items-center justify-center space-x-2 sm:space-x-6 relative z-50">
              {/* Primary Button */}
              <Link
                href="/tools"
                className="bg-white/10 backdrop-blur-xl text-foreground hover:text-gray-900 font-bold px-3 sm:px-6 py-2.5 sm:py-3.5 rounded-lg 
               transition-all duration-200 flex items-center 
               space-x-1 sm:space-x-2 group text-xs sm:text-sm
               hover:bg-neutral-200 hover:scale-[1.03] active:scale-95 relative z-50"
                title="Free PDF Editor Tools"
              >
                <span>Start Converting</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1 text-[#ec4899]" />
              </Link>

              {/* Secondary Button */}
              <Link
                href="/api-docs"
                className="bg-white text-gray-900 font-bold px-3 sm:px-6 py-2.5 sm:py-3.5 rounded-lg 
               border border-black/20 hover:border-black/40 
               transition-all duration-200 text-xs sm:text-sm
               hover:bg-neutral-200 hover:scale-[1.03] active:scale-95 relative z-50"
                title="PDF Processing API Documentation"
              >
                API Docs
              </Link>
            </div>
          </div>
        </main>

        {/* Circuit Pulse Animation */}
        <section className="relative z-10 py-16 sm:py-24 flex items-center justify-center">
          <CircuitPulse />
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="relative z-10 px-6 lg:px-12 py-20 bg-background"
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4">Everything you need to convert files</h2>
              <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
                Edit PDFs, merge documents, convert videos to MP3, transform images, generate QR codes, and more. All processing happens instantly in your browser with no software installation required.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 pt-8">
              {[
                {
                  name: "Video Converter",
                  description:
                    "Convert videos to MP3 audio and generate animated GIFs with precise control over quality, compression, and output formats for optimal results.",
                  category: "Video Processing",
                  icon: Play,
                  inputFormats: ["MP4", "AVI", "MOV", "MKV", "WEBM", "FLV"],
                  outputFormats: ["MP3", "GIF", "MP4", "AVI", "MOV"],
                  features: ["All Formats", "Compression", "Quality Control", "GIF Generation"],
                  processingSpeed: "Fast" as const,
                  quality: "High" as const,
                  maxFileSize: "2GB",
                  popularity: 5,
                  usageCount: 125000,
                  activityData: [0.5, 0.6, 0.4, 0.7, 0.8, 0.9, 1.0, 0.95, 0.8, 0.85, 0.9, 0.92],
                  isFree: true,
                  isMobileOptimized: true,
                  href: "/tools/video-converter",
                },
                {
                  name: "PDF Tools",
                  description:
                    "Merge, split, sign, and prepare PDFs for real-world use cases including sharing, printing, archiving, and professional document workflows.",
                  category: "Document Management",
                  icon: FileText,
                  inputFormats: ["PDF", "DOC", "DOCX", "TXT", "HTML"],
                  outputFormats: ["PDF", "DOC", "TXT", "HTML"],
                  features: ["Merge & Split", "Digital Sign", "Watermark", "Extract Text"],
                  processingSpeed: "Instant" as const,
                  quality: "Lossless" as const,
                  maxFileSize: "100MB",
                  popularity: 5,
                  usageCount: 250000,
                  activityData: [0.6, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1.0, 0.98, 0.92, 0.94, 0.96],
                  isFree: true,
                  isMobileOptimized: true,
                  href: "/tools/pdf-tools",
                },
                {
                  name: "Image Converter",
                  description:
                    "Convert images across all popular formats while preserving sharpness, color accuracy, metadata, and image quality throughout the process.",
                  category: "Image Conversion",
                  icon: Image,
                  inputFormats: ["JPG", "PNG", "WEBP", "GIF", "BMP", "TIFF"],
                  outputFormats: ["JPG", "PNG", "WEBP", "GIF", "SVG"],
                  features: ["All Formats", "Resize", "Compress", "Preserve Quality"],
                  processingSpeed: "Instant" as const,
                  quality: "High" as const,
                  maxFileSize: "50MB",
                  popularity: 5,
                  usageCount: 180000,
                  activityData: [0.4, 0.5, 0.6, 0.65, 0.7, 0.8, 0.85, 0.9, 0.87, 0.82, 0.88, 0.85],
                  isFree: true,
                  isMobileOptimized: true,
                  href: "/tools/image-converter",
                },
              ].map((tool, index) => (
                <Link key={tool.name} href={tool.href}>
                  <div>
                    <FileConversionCard
                      theme="modern-dark"
                      tool={tool}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        {/* <section className="relative z-10 px-6 lg:px-12 py-20"></section> */}

        {/* Powerful Tools CTA Section */}
        <section className="py-24 relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-background"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-6">Powerful Tools for Every Need</h2>
              <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                From PDF editing to video conversion, our comprehensive toolkit handles all your file processing needs with professional-grade quality. Edit PDFs online for free, merge PDF files, and convert videos - all in your browser.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {[
                {
                  title: "PDF Powerhouse",
                  description:
                    "Edit, split, merge, and convert PDFs with real-time processing.",
                  features: [
                    "Free PDF Editor",
                    "Split & Merge",
                    "Add Watermarks",
                    "Digital Signatures",
                  ],
                  href: "/tools/pdf-tools",
                },
                {
                  title: "Media Converter",
                  description:
                    "Convert videos, audio, and images between formats with precise quality control.",
                  features: [
                    "All Video Formats",
                    "Audio Conversion",
                    "Image Processing",
                    "Quality Control",
                  ],
                  href: "/tools/video-converter",
                },
                {
                  title: "Smart Tools",
                  description:
                    "Generate QR codes, extract text with OCR, and automate workflows.",
                  features: [
                    "QR Generator",
                    "OCR Text Extraction",
                    "Batch Processing",
                    "API Integration",
                  ],
                  href: "/tools/qr-generator",
                },
              ].map((tool, index) => {
                const items = Array(40).fill(0);
                return (
                  <Link key={tool.title} href={tool.href}>
                    <article
                      className="
                        group h-full
                        relative
                        rounded-2xl
                        border border-gray-700/50
                        bg-background
                        overflow-hidden
                        transition-all duration-300
                        hover:border-gray-600/70
                        hover:shadow-lg hover:shadow-cyan-500/10
                        hover:-translate-y-1
                      "
                    >
                      {/* Radial gradient background */}
                      <div className="absolute inset-0 bg-[radial-gradient(40%_128px_at_50%_0%,rgba(255,255,255,0.03),transparent)]"></div>

                      {/* StarGrid */}
                      <div className="px-6 pt-6 relative z-10">
                        <StarGrid active={20} duration={100} featureDuration={1500} className="grid w-full grid-cols-10 gap-4">
                          {items.map((item, itemIndex) => (
                            <StarGrid.Item key={itemIndex} className="relative flex aspect-square w-full items-center justify-center">
                              {({ isActive, isFeatured }) => (
                                <>
                                  <svg
                                    className={cn(
                                      isFeatured ? "scale-1" : "scale-0 opacity-0",
                                      "absolute h-6 w-6 stroke-cyan-400/50 stroke-[1] transition-all duration-1000",
                                    )}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="10.5" />
                                  </svg>

                                  <div
                                    style={{ "--duration": `${(itemIndex % 3) * 1.5}s` } as React.CSSProperties}
                                    className={cn(
                                      {
                                        "scale-50 bg-white/10": !isActive && !isFeatured,
                                        "h-1 w-1": isActive || isFeatured,
                                        "bg-white/30": isActive && !isFeatured,
                                        "bg-cyan-400": isFeatured,
                                      },
                                      "relative h-1 w-1 rounded-full transition-all duration-500 [animation-duration:var(--duration)]",
                                    )}></div>
                                </>
                              )}
                            </StarGrid.Item>
                          ))}
                        </StarGrid>
                      </div>

                      {/* Content */}
                      <div className="mt-6 px-8 pb-8 relative z-10">
                        <div className="text-lg text-foreground font-medium">{tool.title}</div>

                        <p className="mt-2 text-sm font-light leading-relaxed text-foreground/75">
                          {tool.description}
                        </p>

                        <ul className="mt-6 space-y-2.5">
                          {tool.features.map((feature) => (
                            <li
                              key={feature}
                              className="flex items-center gap-2.5 text-sm text-foreground/75"
                            >
                              <span className="mt-[2px] block h-1.5 w-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="mt-6 text-sm text-cyan-400 group-hover:text-cyan-300 transition-colors flex items-center gap-2">
                          <span>Open tool</span>
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Developer APIs CTA Section */}
        <section className="relative overflow-hidden bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-6">Developer APIs for Powerful Computing</h2>
              <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                Integrate our advanced file processing capabilities into your applications with our comprehensive API suite. Built for developers, by developers.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-16">
              {[
                {
                  title: "PDF Processing APIs",
                  description:
                    "Programmatic PDF manipulation including OCR, text extraction, form handling, and document analysis.",
                  features: [
                    "PDF to Text with OCR",
                    "Form Field Detection and Filling",
                    "Document Structure Analysis",
                    "Batch PDF Processing",
                    "Advanced Text Extraction",
                    "Metadata Extraction",
                  ],
                  action: {
                    label: "View API documentation",
                    href: "/api-docs",
                  },
                  motion: { x: -20 },
                },
                {
                  title: "Media Conversion APIs",
                  description:
                    "High-performance media processing with support for modern formats and configurable compression.",
                  features: [
                    "Video Format Conversion",
                    "Audio Processing and Compression",
                    "Image Optimization and Resizing",
                    "Real-time Processing",
                    "Custom Quality Settings",
                    "Batch Media Processing",
                  ],
                  action: {
                    label: "Request API access",
                    href: "/auth/register",
                  },
                  motion: { x: 20 },
                },
              ].map((api, index) => (
                <article
                  key={api.title}
                  className="
                    group relative
                    flex h-96 w-full
                    flex-col overflow-hidden
                    rounded-2xl border border-white/5
                  "
                >
                  {/* Radial gradient background */}
                  <div className="absolute inset-0 bg-[radial-gradient(40%_128px_at_50%_0%,rgba(255,255,255,0.05),transparent)]"></div>

                  {/* Globe */}
                  <div>
                    <Globe
                      dark
                      baseColor="#777A80"
                      glowColor="#50505A"
                      markerColor="#22d3ee"
                      opacity={0.85}
                      brightness={1}
                      offsetX={320}
                      offsetY={64}
                      scale={1.125}
                    />
                  </div>

                  {/* Content */}
                  <div className="pointer-events-none mt-auto px-6 pb-6 relative z-10">
                    <div className="relative transition duration-300 group-hover:-translate-y-9">
                      <div className="text-lg text-foreground transition-all duration-300 group-hover:text-base">
                        {api.title}
                      </div>

                      <p className="mt-2 text-sm font-light leading-relaxed text-foreground/75">
                        {api.description}
                      </p>

                      <ul className="mt-4 space-y-1.5 text-sm text-foreground/75">
                        {api.features.map((feature) => (
                          <li
                            key={feature}
                            className="flex items-center gap-2"
                          >
                            <span className="mt-[2px] block h-1 w-1 rounded-full bg-white/40 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="absolute -left-2 bottom-0 translate-y-11 opacity-0 transition duration-300 group-hover:opacity-100">
                        <Link
                          href={api.action.href}
                          className="pointer-events-auto inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-foreground transition hover:bg-white/5"
                        >
                          <span>{api.action.label}</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
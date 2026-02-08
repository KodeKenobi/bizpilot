"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Play,
  FileText,
  QrCode,
  Image,
  Zap,
  Layout,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import DecryptedText from "@/components/DecryptedText";
import { StarGrid } from "@/components/ui/StarGrid";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ToolsPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const toolsGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero staggered animation (matching Campaigns page style)
      gsap.from(".hero-title", {
        opacity: 0,
        y: 100,
        duration: 1.2,
        ease: "power4.out",
      });

      gsap.from(".hero-subtitle", {
        opacity: 0,
        y: 50,
        duration: 1,
        delay: 0.3,
        ease: "power3.out",
      });

      gsap.from(".hero-stats", {
        opacity: 0,
        y: 30,
        duration: 0.8,
        delay: 0.6,
        ease: "power3.out",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const tools = [
    {
      name: "Campaigns Automation",
      description: "Automate business outreach at scale with AI-powered form filling that saves you hours of work.",
      features: [
        "Auto Form Fill",
        "Real-time Tracking",
        "Visual Proof",
        "Batch Upload",
      ],
      href: "/campaigns",
    },
    {
      name: "PDF Powerhouse",
      description: "Edit, split, merge, and convert PDFs with real-time processing.",
      features: [
        "Free PDF Editor",
        "Split & Merge",
        "Add Watermarks",
        "Digital Signatures",
      ],
      href: "/tools/pdf-tools",
    },
    {
      name: "Media Converter",
      description: "Convert videos, audio, and images between formats with precise quality control.",
      features: [
        "All Video Formats",
        "Audio Conversion",
        "Image Processing",
        "Quality Control",
      ],
      href: "/tools/video-converter",
    },
    {
      name: "Smart Tools",
      description: "Generate QR codes, extract text with OCR, and automate workflows.",
      features: [
        "QR Generator",
        "OCR Text Extraction",
        "Batch Processing",
        "API Integration",
      ],
      href: "/tools/qr-generator",
    },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-background page-content overflow-x-hidden">
      {/* Hero Section (Matching Campaigns Style but all white font) */}
      <section className="min-h-[60vh] flex items-center justify-center relative overflow-hidden px-6 bg-background">
        <div className="text-center max-w-4xl relative z-20">
          <h1 className="hero-title text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
            Professional Tools <br />
            For Every File
          </h1>
          <p className="hero-subtitle text-lg md:text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            <DecryptedText
              text="Transform, convert, and optimize your files with our suite of professional-grade tools. All completely free and secure."
              animateOn="view"
              revealDirection="center"
              speed={30}
              maxIterations={15}
              className="text-gray-300"
              encryptedClassName="text-gray-500"
            />
          </p>
          
        </div>
      </section>

      {/* Tools Grid Section (Landing Page Style) */}
      <section className="pb-32 relative z-10 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div ref={toolsGridRef} className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {tools.map((tool, index) => {
              const starItems = Array(20).fill(0);
              return (
                <Link key={tool.name} href={tool.href} className="block h-full">
                  <motion.article
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -3 }}
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
                    "
                  >
                    {/* Radial gradient background */}
                    <div className="absolute inset-0 bg-[radial-gradient(40%_128px_at_50%_0%,rgba(255,255,255,0.03),transparent)]"></div>

                    {/* StarGrid */}
                    <div className="px-6 pt-4 relative z-10">
                      <StarGrid active={8} duration={100} featureDuration={1500} className="grid w-full grid-cols-10 gap-2 opacity-60">
                        {starItems.map((_, itemIndex) => (
                          <StarGrid.Item key={itemIndex} className="relative flex aspect-square w-full items-center justify-center">
                            {({ isActive, isFeatured }) => (
                              <>
                                <svg
                                  className={cn(
                                    isFeatured ? "scale-1" : "scale-0 opacity-0",
                                    "absolute h-4 w-4 stroke-cyan-400/50 stroke-[1] transition-all duration-1000",
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
                                      "h-0.5 w-0.5": true,
                                      "bg-white/30": isActive && !isFeatured,
                                      "bg-cyan-400": isFeatured,
                                    },
                                    "relative rounded-full transition-all duration-500 [animation-duration:var(--duration)]",
                                  )}></div>
                              </>
                            )}
                          </StarGrid.Item>
                        ))}
                      </StarGrid>
                    </div>

                    {/* Content */}
                    <div className="mt-2 px-8 pb-6 relative z-10">
                      <div className="text-xl text-white font-semibold mb-2">{tool.name}</div>

                      <p className="text-sm font-light leading-relaxed text-gray-400 mb-4 line-clamp-2">
                        {tool.description}
                      </p>

                      <ul className="grid grid-cols-2 gap-y-2 gap-x-4 mb-6">
                        {tool.features.map((feature) => (
                          <li
                            key={feature}
                            className="flex items-center gap-2 text-xs text-gray-300"
                          >
                            <span className="h-1 w-1 rounded-full bg-cyan-400 flex-shrink-0" />
                            <span className="truncate">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-auto text-sm text-cyan-400 group-hover:text-cyan-300 transition-colors flex items-center gap-2">
                        <span>Open tool</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </motion.article>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Simplified Footer section to match landing page vibe */}
      <section className="py-24 border-t border-gray-800/30 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Why Choose Trevnoctilla?
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Enterprise-grade performance meeting minimalist browser-first design.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                title: "Processing Power",
                description: "Optimized multi-threaded processing ensures your files are handled in seconds, not minutes.",
              },
              {
                title: "Edge Privacy",
                description: "Your data stays yours. Files are processed ephemerally and wiped immediately after conversion.",
              },
              {
                title: "Cross-Platform",
                description: "Built for the modern web. Works perfectly on desktop, tablet, and mobile browsers.",
              },
            ].map((feature, index) => (
              <div key={feature.title} className="text-center md:text-left">
                <div className="w-12 h-1 bg-blue-500 mb-6 mx-auto md:mx-0" />
                <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

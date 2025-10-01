"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Play,
  Zap,
  FileText,
  QrCode,
  Image,
  Sparkles,
  Clock,
  Shield,
  Zap as Lightning,
} from "lucide-react";
import { useNavigation } from "@/contexts/NavigationContext";

export default function ToolsPage() {
  const { navigateTo } = useNavigation();

  const tools = [
    {
      title: "Video Converter",
      description:
        "Convert videos between all formats with compression and quality control. MP4, AVI, MOV, MKV, WEBM, and more.",
      page: "video-converter" as const,
      icon: Play,
      gradient: "from-red-500 to-pink-500",
      features: ["All Formats", "Compression", "Quality Control"],
    },
    {
      title: "Audio Converter",
      description:
        "Convert audio between all formats with bitrate and quality control. MP3, WAV, AAC, FLAC, OGG, and more.",
      page: "audio-converter" as const,
      icon: Zap,
      gradient: "from-green-500 to-cyan-500",
      features: ["All Formats", "Bitrate Control", "High Quality"],
    },
    {
      title: "Image Converter",
      description:
        "Convert images between all formats with resize and quality control. JPG, PNG, WEBP, GIF, and more.",
      page: "image-converter" as const,
      icon: Image,
      gradient: "from-blue-500 to-purple-500",
      features: ["All Formats", "Resize", "Quality Control"],
    },
    {
      title: "PDF Tools",
      description:
        "Comprehensive PDF processing: extract text/images, merge, split, sign, watermark, and compress PDFs.",
      page: "pdf-tools" as const,
      icon: FileText,
      gradient: "from-yellow-500 to-orange-500",
      features: [
        "Text Extraction",
        "Image Extraction",
        "Merge & Split",
        "Digital Signatures",
        "Watermarks",
        "Compression",
      ],
    },
    {
      title: "QR Generator",
      description:
        "Generate custom QR codes for any text, URL, or contact information.",
      page: "qr-generator" as const,
      icon: QrCode,
      gradient: "from-purple-500 to-pink-500",
      features: ["Custom Design", "High Resolution", "Multiple Formats"],
    },
    {
      title: "Image Converter",
      description:
        "Convert images between different formats with our powerful conversion engine.",
      page: "image-converter" as const,
      icon: Image,
      gradient: "from-orange-500 to-red-500",
      features: ["Batch Convert", "Quality Preserve", "Format Support"],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 page-content">
      {/* Tools Grid */}
      <section className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tools.map((tool, index) => (
              <motion.button
                key={index}
                onClick={() => navigateTo(tool.page)}
                className="card card-hover p-8 group animate-fade-in-up text-left w-full"
                style={{ animationDelay: `${index * 0.1}s` }}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center mb-6">
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-r ${tool.gradient} flex items-center justify-center mr-4 group-hover:scale-110 transition-transform`}
                  >
                    <tool.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {tool.title}
                  </h3>
                </div>

                <p className="text-gray-300 mb-6 leading-relaxed">
                  {tool.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {tool.features.map((feature) => (
                    <span
                      key={feature}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-gray-800 text-cyan-400 border border-cyan-500/30"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                <div className="flex items-center text-cyan-400 group-hover:text-cyan-300">
                  <span className="font-medium">Try it now</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="card p-12 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Choose any tool above and start converting your files in seconds
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                onClick={() => navigateTo("video-converter")}
                className="btn btn-primary text-lg px-8 py-4 hover-lift group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Start with Video Converter
              </motion.button>
              <motion.button
                onClick={() => navigateTo("pdf-tools")}
                className="btn btn-outline text-lg px-8 py-4 hover-lift group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FileText className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Try PDF Tools
              </motion.button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

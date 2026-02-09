import React from "react";
import { FileConversionCard } from "./file-conversion-card";
import {
  FileText,
  Play,
  Zap,
  Image,
  QrCode,
} from "lucide-react";

export function FileConversionCardDemo() {
  const conversionTools = [
    {
      name: "Video Converter",
      description:
        "Convert videos between all formats with compression and quality control. MP4, AVI, MOV, MKV, WEBM, and more.",
      category: "Video Processing",
      icon: Play,
      inputFormats: ["MP4", "AVI", "MOV", "MKV", "WEBM", "FLV", "WMV"],
      outputFormats: ["MP4", "AVI", "MOV", "MKV", "WEBM", "GIF", "MP3"],
      features: ["All Formats", "Compression", "Quality Control", "Batch Processing"],
      processingSpeed: "Fast" as const,
      quality: "High" as const,
      maxFileSize: "2GB",
      popularity: 5,
      usageCount: 125000,
      isFree: true,
      isMobileOptimized: true,
    },
    {
      name: "Audio Converter",
      description:
        "Convert audio between all formats with bitrate and quality control. MP3, WAV, AAC, FLAC, OGG, and more.",
      category: "Audio Processing",
      icon: Zap,
      inputFormats: ["MP3", "WAV", "AAC", "FLAC", "OGG", "M4A", "WMA"],
      outputFormats: ["MP3", "WAV", "AAC", "FLAC", "OGG", "M4A"],
      features: ["All Formats", "Bitrate Control", "High Quality", "Noise Reduction"],
      processingSpeed: "Instant" as const,
      quality: "Lossless" as const,
      maxFileSize: "500MB",
      popularity: 4,
      usageCount: 89000,
      isFree: true,
      isMobileOptimized: true,
    },
    {
      name: "Image Converter",
      description:
        "Convert images between all formats with resize and quality control. JPG, PNG, WEBP, GIF, and more.",
      category: "Image Processing",
      icon: Image,
      inputFormats: ["JPG", "PNG", "WEBP", "GIF", "BMP", "TIFF", "SVG"],
      outputFormats: ["JPG", "PNG", "WEBP", "GIF", "BMP", "TIFF", "PDF"],
      features: ["All Formats", "Resize", "Quality Control", "Batch Processing"],
      processingSpeed: "Instant" as const,
      quality: "High" as const,
      maxFileSize: "50MB",
      popularity: 5,
      usageCount: 245000,
      isFree: true,
      isMobileOptimized: true,
    },
    {
      name: "PDF Tools",
      description:
        "Comprehensive PDF processing: extract text/images, merge, split, edit, sign, watermark, and compress PDFs.",
      category: "Document Processing",
      icon: FileText,
      inputFormats: ["PDF", "DOCX", "JPG", "PNG"],
      outputFormats: ["PDF", "TXT", "JPG", "PNG", "DOCX"],
      features: [
        "Text Extraction",
        "Image Extraction",
        "Merge & Split",
        "Digital Signatures",
        "Watermarks",
        "Compression",
      ],
      processingSpeed: "Standard" as const,
      quality: "High" as const,
      maxFileSize: "100MB",
      popularity: 4,
      usageCount: 156000,
      isFree: true,
      isMobileOptimized: true,
    },
    {
      name: "QR Generator",
      description:
        "Generate custom QR codes for any text, URL, or contact information with advanced styling options.",
      category: "Utility Tools",
      icon: QrCode,
      inputFormats: ["Text", "URL", "Contact", "WiFi", "Email"],
      outputFormats: ["PNG", "SVG", "JPG", "PDF"],
      features: ["Custom Design", "High Resolution", "Multiple Formats", "Error Correction"],
      processingSpeed: "Instant" as const,
      quality: "Lossless" as const,
      maxFileSize: "N/A",
      popularity: 4,
      usageCount: 78000,
      isFree: true,
      isMobileOptimized: true,
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          File Conversion Tools
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Professional-grade file conversion tools with modern design.
          Convert videos, audio, images, documents, and generate QR codes instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {conversionTools.map((tool, index) => (
          <FileConversionCard
            key={tool.name}
            theme="modern-dark"
            tool={tool}
            onClick={() => console.log(`Clicked ${tool.name}`)}
            className="h-full"
          />
        ))}
      </div>

      {/* Alternative light theme example */}
      <div className="mt-12">
        <h3 className="text-xl font-semibold text-white mb-6 text-center">
          Light Theme Example
        </h3>
        <div className="max-w-md mx-auto">
          <FileConversionCard
            theme="modern-light"
            tool={conversionTools[0]}
            onClick={() => console.log("Light theme clicked")}
          />
        </div>
      </div>
    </div>
  );
}
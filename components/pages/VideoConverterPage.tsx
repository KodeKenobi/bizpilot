"use client";

import React, { useState } from "react";
import Link from "next/link";
import { VideoConverterTool } from "@/components/pages/tools/pdf-tools/video-converter/VideoConverterTool";

export default function VideoConverterPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
    data?: any;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 page-content">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Video Converter
          </h1>
          <p className="text-gray-400 text-lg">
            Convert videos between all formats with compression and quality
            control
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <VideoConverterTool
            uploadedFile={uploadedFile}
            setUploadedFile={setUploadedFile}
            result={result}
            setResult={setResult}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
            handleFileUpload={handleFileUpload}
          />
        </div>

        {/* Related Tools Section */}
        <div className="mt-16 pt-8 border-t border-gray-700/50">
          <h3 className="text-xl font-semibold text-white mb-4 text-center">
            Related Tools
          </h3>
          <p className="text-gray-400 text-sm text-center mb-4">
            Need to extract audio from video? Try our{" "}
            <Link
              href="/tools/audio-converter"
              className="text-white hover:text-cyan-300 underline"
            >
              free audio converter
            </Link>
            . Or convert images with our{" "}
            <Link
              href="/tools/image-converter"
              className="text-white hover:text-cyan-300 underline"
            >
              image converter
            </Link>
            .
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/tools/audio-converter"
              className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-lg transition-all text-sm"
            >
              Audio Converter
            </Link>
            <Link
              href="/tools/image-converter"
              className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-lg transition-all text-sm"
            >
              Image Converter
            </Link>
            <Link
              href="/tools/pdf-tools"
              className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-lg transition-all text-sm"
            >
              PDF Tools
            </Link>
            <Link
              href="/features"
              className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-lg transition-all text-sm"
            >
              View All Features
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
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
      </div>
    </div>
  );
}

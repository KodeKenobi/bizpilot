"use client";

import React, { useState } from "react";
import { ImageConverterTool } from "@/components/pages/tools/pdf-tools/image-converter/ImageConverterTool";

export default function ImageConverterPage() {
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
            Image Converter
          </h1>
          <p className="text-gray-400 text-lg">
            Convert images between all formats with resize and quality control
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <ImageConverterTool
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

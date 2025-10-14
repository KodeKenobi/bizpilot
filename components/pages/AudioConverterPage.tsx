"use client";

import React, { useState } from "react";
import { AudioConverterTool } from "./tools/pdf-tools/audio-converter/AudioConverterTool";

export default function AudioConverterPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Audio Converter
          </h1>
          <p className="text-gray-300 text-lg">
            Convert audio files between different formats with professional quality control
          </p>
        </div>

        <AudioConverterTool
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
  );
}

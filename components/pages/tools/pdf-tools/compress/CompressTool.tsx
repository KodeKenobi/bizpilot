"use client";

import React, { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { useMonetization } from "@/hooks/useMonetization";
import MonetizationModal from "@/components/ui/MonetizationModal";

interface CompressToolProps {
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  result: any;
  setResult: (result: any) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  handleFileUpload: (file: File) => void;
}

export const CompressTool: React.FC<CompressToolProps> = ({
  uploadedFile,
  setUploadedFile,
  result,
  setResult,
  isProcessing,
  setIsProcessing,
  handleFileUpload,
}) => {
  const [compressionLevel, setCompressionLevel] = useState<
    "low" | "medium" | "high"
  >("medium");
  const {
    monetizationState,
    openMonetizationModal,
    closeMonetizationModal,
    handleAdComplete,
    handlePaymentComplete,
  } = useMonetization();

  const handleCompress = async () => {
    if (!uploadedFile) {
      setResult({
        type: "error",
        message: "Please upload a PDF file to compress",
      });
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("pdf", uploadedFile);
      formData.append("compression_level", compressionLevel);

      const response = await fetch("http://localhost:5000/compress_pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to compress PDF");
      }

      const data = await response.json();
      setResult({
        type: "success",
        message: "PDF compressed successfully!",
        data: data,
      });
    } catch (error) {
      console.error("Error compressing PDF:", error);
      setResult({
        type: "error",
        message: "Error compressing PDF. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!uploadedFile) {
    return (
      <div className="w-full max-w-4xl mx-auto min-h-96 bg-gray-800/40 rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-white text-xl font-semibold mb-2">
              Compress PDF File Size
            </h3>
            <p className="text-gray-400 text-sm">
              Upload a PDF file to reduce its file size
            </p>
          </div>
          <FileUpload
            onChange={(files) => handleFileUpload(files[0])}
            multiple={false}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center space-x-4">
            <h3 className="text-white font-semibold text-lg">Compress PDF</h3>
            <span className="text-gray-400 text-sm">{uploadedFile?.name}</span>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-gray-300 text-lg font-medium mb-4">
                Compression Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Compression Level
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="low"
                        checked={compressionLevel === "low"}
                        onChange={(e) =>
                          setCompressionLevel(
                            e.target.value as "low" | "medium" | "high"
                          )
                        }
                        className="mr-3"
                      />
                      <div>
                        <span className="text-gray-300">Low Compression</span>
                        <p className="text-gray-400 text-xs">
                          Minimal size reduction, best quality
                        </p>
                      </div>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="medium"
                        checked={compressionLevel === "medium"}
                        onChange={(e) =>
                          setCompressionLevel(
                            e.target.value as "low" | "medium" | "high"
                          )
                        }
                        className="mr-3"
                      />
                      <div>
                        <span className="text-gray-300">
                          Medium Compression
                        </span>
                        <p className="text-gray-400 text-xs">
                          Balanced size reduction and quality
                        </p>
                      </div>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="high"
                        checked={compressionLevel === "high"}
                        onChange={(e) =>
                          setCompressionLevel(
                            e.target.value as "low" | "medium" | "high"
                          )
                        }
                        className="mr-3"
                      />
                      <div>
                        <span className="text-gray-300">High Compression</span>
                        <p className="text-gray-400 text-xs">
                          Maximum size reduction
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleCompress}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isProcessing ? "Compressing PDF..." : "Compress PDF"}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {result && result.type === "success" && (
        <div className="mt-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h3 className="text-white font-semibold text-lg">
              Compression Successful!
            </h3>
            <button
              onClick={() =>
                openMonetizationModal(
                  `${uploadedFile?.name.replace(".pdf", "")}_compressed.pdf`,
                  "PDF",
                  result.data.compressed_pdf_url
                )
              }
              className="flex items-center text-cyan-400 hover:text-cyan-300 group"
            >
              <span className="font-medium">Try it now</span>
              <svg
                className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                <p className="text-gray-400 text-sm">Original Size</p>
                <p className="text-white font-semibold">
                  {(result.data.original_size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                <p className="text-gray-400 text-sm">Compressed Size</p>
                <p className="text-white font-semibold">
                  {(result.data.compressed_size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                <p className="text-gray-400 text-sm">Size Reduction</p>
                <p className="text-green-400 font-semibold">
                  {result.data.compression_ratio}%
                </p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                Your PDF has been compressed with {compressionLevel} compression
                level
              </p>
            </div>
          </div>
        </div>
      )}

      <MonetizationModal
        isOpen={monetizationState.isModalOpen}
        onClose={closeMonetizationModal}
        onAdComplete={handleAdComplete}
        onPaymentComplete={handlePaymentComplete}
        fileName={monetizationState.fileName}
        fileType={monetizationState.fileType}
      />
    </>
  );
};

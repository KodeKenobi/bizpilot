"use client";

import React, { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { useMonetization } from "@/hooks/useMonetization";
import MonetizationModal from "@/components/ui/MonetizationModal";

interface SplitPdfToolProps {
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  result: any;
  setResult: (result: any) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  handleFileUpload: (file: File) => void;
}

export const SplitPdfTool: React.FC<SplitPdfToolProps> = ({
  uploadedFile,
  setUploadedFile,
  result,
  setResult,
  isProcessing,
  setIsProcessing,
  handleFileUpload,
}) => {
  const {
    monetizationState,
    openMonetizationModal,
    closeMonetizationModal,
    handleAdComplete,
    handlePaymentComplete,
  } = useMonetization();

  const handleSplit = async () => {
    if (!uploadedFile) {
      setResult({
        type: "error",
        message: "Please upload a PDF file to split",
      });
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("pdf", uploadedFile);
      formData.append("operation", "split");

      const response = await fetch("http://localhost:5000/process_pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to split PDF");
      }

      const data = await response.json();
      setResult({
        type: "success",
        message: "PDF split successfully!",
        data: data,
      });
    } catch (error) {
      console.error("Error splitting PDF:", error);
      setResult({
        type: "error",
        message: "Error splitting PDF. Please try again.",
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
              Split PDF into Individual Pages
            </h3>
            <p className="text-gray-400 text-sm">
              Upload a PDF file to split into individual pages
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
            <h3 className="text-white font-semibold text-lg">
              Split PDF into Pages
            </h3>
            <span className="text-gray-400 text-sm">{uploadedFile?.name}</span>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-gray-300 text-lg font-medium mb-2">
                Split {uploadedFile.name} into Individual Pages
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                This will split your PDF into separate files for each page
              </p>
            </div>

            <button
              onClick={handleSplit}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isProcessing ? "Splitting PDF..." : "Split PDF"}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {result && result.type === "success" && (
        <div className="mt-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h3 className="text-white font-semibold text-lg">
              PDF Split Successfully!
            </h3>
          </div>

          <div className="p-6">
            <div className="mb-4">
              <p className="text-gray-400 text-sm mb-4">
                Split into {result.data.total_pages} pages
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {result.data.pages?.map((page: any, index: number) => (
                  <div key={index} className="bg-gray-900/50 rounded-lg p-3">
                    <div className="text-center">
                      <p className="text-gray-300 text-sm mb-2">
                        Page {index + 1}
                      </p>
                      <button
                        onClick={() =>
                          openMonetizationModal(
                            `${uploadedFile?.name.replace(".pdf", "")}_page_${
                              index + 1
                            }.pdf`,
                            "PDF",
                            page.download_url
                          )
                        }
                        className="text-cyan-400 hover:text-cyan-300 text-sm"
                      >
                        Try it now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
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

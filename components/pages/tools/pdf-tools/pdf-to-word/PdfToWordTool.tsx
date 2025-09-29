"use client";

import React, { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { useMonetization } from "@/hooks/useMonetization";
import MonetizationModal from "@/components/ui/MonetizationModal";

interface PdfToWordToolProps {
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  result: any;
  setResult: (result: any) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  handleFileUpload: (file: File) => void;
}

export const PdfToWordTool: React.FC<PdfToWordToolProps> = ({
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

  const handleConversion = async () => {
    if (!uploadedFile) {
      setResult({
        type: "error",
        message: "Please upload a PDF file to convert",
      });
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);

      const response = await fetch(
        "http://localhost:5000/convert_pdf_to_word",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to convert PDF to Word");
      }

      const data = await response.json();
      setResult({
        type: "success",
        message: "PDF converted to Word successfully!",
        data: data,
      });
    } catch (error) {
      console.error("Error converting PDF to Word:", error);
      setResult({
        type: "error",
        message: "Error converting PDF to Word. Please try again.",
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
              Convert PDF to Word Document
            </h3>
            <p className="text-gray-400 text-sm">
              Upload a PDF file to convert it to Word format
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
              Convert PDF to Word Document
            </h3>
            <span className="text-gray-400 text-sm">{uploadedFile?.name}</span>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-gray-300 text-lg font-medium mb-2">
                Convert {uploadedFile.name} to Word Document
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                This will convert your PDF to Word format (.docx)
              </p>
            </div>

            <button
              onClick={handleConversion}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isProcessing ? "Converting..." : "Convert to Word Document"}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {result && result.type === "success" && (
        <div className="mt-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h3 className="text-white font-semibold text-lg">
              Conversion Successful!
            </h3>
            <button
              onClick={() =>
                openMonetizationModal(
                  `${uploadedFile?.name.replace(".pdf", "")}_converted.docx`,
                  "DOCX",
                  result.data.download_url || result.data.converted_file_url
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
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-4">
                Your PDF has been converted to Word format
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

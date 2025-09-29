"use client";

import React, { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { useMonetization } from "@/hooks/useMonetization";
import MonetizationModal from "@/components/ui/MonetizationModal";

interface MergePdfsToolProps {
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  uploadedFiles: File[];
  setUploadedFiles: (files: File[]) => void;
  result: any;
  setResult: (result: any) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  handleFileUpload: (file: File) => void;
}

export const MergePdfsTool: React.FC<MergePdfsToolProps> = ({
  uploadedFile,
  setUploadedFile,
  uploadedFiles,
  setUploadedFiles,
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

  const handleFileChange = (files: File[]) => {
    setUploadedFiles(files);
  };

  const handleMerge = async () => {
    if (uploadedFiles.length < 2) {
      setResult({
        type: "error",
        message: "Please upload at least 2 PDF files to merge",
      });
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      const formData = new FormData();
      uploadedFiles.forEach((file, index) => {
        formData.append(`pdf_${index}`, file);
      });
      formData.append("operation", "merge");

      const response = await fetch("http://localhost:5000/process_pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to merge PDFs");
      }

      const data = await response.json();
      setResult({
        type: "success",
        message: "PDFs merged successfully!",
        data: data,
      });
    } catch (error) {
      console.error("Error merging PDFs:", error);
      setResult({
        type: "error",
        message: "Error merging PDFs. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (uploadedFiles.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto min-h-96 bg-gray-800/40 rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-white text-xl font-semibold mb-2">
              Merge Multiple PDFs into One
            </h3>
            <p className="text-gray-400 text-sm">
              Upload multiple PDF files to merge into one document
            </p>
          </div>
          <FileUpload onChange={handleFileChange} multiple={true} />
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
              Merge PDFs ({uploadedFiles.length} files)
            </h3>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-gray-300 text-lg font-medium mb-2">
                Merge {uploadedFiles.length} PDF files into one document
              </h3>
              <div className="space-y-2 mb-4">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-800/50 rounded p-2"
                  >
                    <span className="text-gray-300 text-sm">{file.name}</span>
                    <button
                      onClick={() =>
                        setUploadedFiles(
                          uploadedFiles.filter((_, i) => i !== index)
                        )
                      }
                      className="text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setUploadedFiles([])}
                className="text-gray-400 hover:text-gray-300 text-sm"
              >
                Clear All
              </button>
            </div>

            <button
              onClick={handleMerge}
              disabled={isProcessing || uploadedFiles.length < 2}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isProcessing ? "Merging PDFs..." : "Merge PDFs"}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {result && result.type === "success" && (
        <div className="mt-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h3 className="text-white font-semibold text-lg">
              PDFs Merged Successfully!
            </h3>
            <button
              onClick={() =>
                openMonetizationModal(
                  "merged_document.pdf",
                  "PDF",
                  result.data.merged_pdf_url
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
                Merged {uploadedFiles.length} PDFs successfully
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

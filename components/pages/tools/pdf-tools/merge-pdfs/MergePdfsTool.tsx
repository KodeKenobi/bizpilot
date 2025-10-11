"use client";

import React, { useState, useRef, useCallback } from "react";
import { useMonetization } from "@/hooks/useMonetization";
import { useAlertModal } from "@/hooks/useAlertModal";
import MonetizationModal from "@/components/ui/MonetizationModal";

// Simple button component
const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}> = ({ children, onClick, disabled, className = "" }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-lg font-medium transition-colors ${className}`}
  >
    {children}
  </button>
);

interface PdfFile {
  id: string;
  file: File;
  name: string;
  size: number;
  thumbnailUrl?: string;
}

interface MergePdfsToolProps {
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  uploadedFiles: File[];
  setUploadedFiles: (files: File[]) => void;
  result: { type: "success" | "error"; message: string; data?: any } | null;
  setResult: (
    result: { type: "success" | "error"; message: string; data?: any } | null
  ) => void;
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
  const alertModal = useAlertModal();

  // Core state for merge functionality
  const [pdfFiles, setPdfFiles] = useState<PdfFile[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [mergeProgress, setMergeProgress] = useState(0);
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Refs
  const isProcessingRef = useRef<boolean>(false);

  // Handle file upload
  const handleFileUploadMultiple = useCallback((files: FileList) => {
    console.log("DEBUG: handleFileUploadMultiple called with files:", files);
    const newPdfFiles: PdfFile[] = Array.from(files).map((file) => {
      console.log("DEBUG: Processing file:", file.name, file.size, file.type);
      return {
        id: Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        size: file.size,
      };
    });

    console.log("DEBUG: Created newPdfFiles:", newPdfFiles);
    setPdfFiles((prev) => {
      const updated = [...prev, ...newPdfFiles];
      console.log("DEBUG: Updated pdfFiles:", updated);
      return updated;
    });
  }, []);

  // Handle file removal
  const handleRemoveFile = useCallback((fileId: string) => {
    setPdfFiles((prev) => prev.filter((file) => file.id !== fileId));
  }, []);

  // Handle file reordering
  const handleMoveFile = useCallback(
    (fileId: string, direction: "up" | "down") => {
      setPdfFiles((prev) => {
        const currentIndex = prev.findIndex((file) => file.id === fileId);
        if (currentIndex === -1) return prev;

        const newIndex =
          direction === "up" ? currentIndex - 1 : currentIndex + 1;
        if (newIndex < 0 || newIndex >= prev.length) return prev;

        const newFiles = [...prev];
        [newFiles[currentIndex], newFiles[newIndex]] = [
          newFiles[newIndex],
          newFiles[currentIndex],
        ];
        return newFiles;
      });
    },
    []
  );

  // Handle merge PDFs
  const handleMergePdfs = useCallback(async () => {
    console.log("DEBUG: handleMergePdfs called with pdfFiles:", pdfFiles);

    if (pdfFiles.length < 2) {
      alertModal.showError(
        "Error",
        "Please upload at least 2 PDF files to merge"
      );
      return;
    }

    // Validate that all files are PDFs
    const invalidFiles = pdfFiles.filter(
      (file) => !file.name.toLowerCase().endsWith(".pdf")
    );
    if (invalidFiles.length > 0) {
      alertModal.showError(
        "Error",
        `Please ensure all files are PDFs. Invalid files: ${invalidFiles
          .map((f) => f.name)
          .join(", ")}`
      );
      return;
    }

    setIsMerging(true);
    setMergeProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setMergeProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload files and merge
      const formData = new FormData();
      console.log("DEBUG: Preparing to upload files:", pdfFiles);
      pdfFiles.forEach((pdfFile, index) => {
        console.log(`DEBUG: Adding file ${index}:`, pdfFile.name, pdfFile.file);
        formData.append("files", pdfFile.file);
      });

      console.log("DEBUG: FormData entries:");
      const entries = Array.from(formData.entries());
      entries.forEach(([key, value]) => {
        console.log(key, value);
      });

      const response = await fetch("http://localhost:5000/merge_pdfs", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setMergeProgress(100);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("DEBUG: Merge failed with status:", response.status);
        console.error("DEBUG: Error response:", errorText);
        throw new Error(
          `Failed to merge PDFs: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      console.log("Merge result:", result);

      setMergedPdfUrl(`http://localhost:5000${result.download_url}`);
      setShowDownloadOptions(true);

      alertModal.showSuccess(
        "Success",
        `Successfully merged ${pdfFiles.length} PDF files!`
      );
    } catch (error) {
      console.error("Merge error:", error);
      alertModal.showError("Error", "Failed to merge PDFs");
    } finally {
      setIsMerging(false);
    }
  }, [pdfFiles, alertModal]);

  // Handle download merged PDF (with monetization)
  const handleDownloadMerged = useCallback(() => {
    if (mergedPdfUrl) {
      openMonetizationModal("merged_document.pdf", "pdf", mergedPdfUrl);
    }
  }, [mergedPdfUrl, openMonetizationModal]);

  // Handle view merged PDF
  const handleViewMerged = useCallback(() => {
    if (mergedPdfUrl) {
      setPreviewImage(mergedPdfUrl);
    }
  }, [mergedPdfUrl]);

  // Handle monetization completion
  const handleAdCompleteMerged = useCallback(() => {
    if (mergedPdfUrl) {
      const link = document.createElement("a");
      link.href = mergedPdfUrl;
      link.download = "merged_document.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    closeMonetizationModal();
  }, [mergedPdfUrl, closeMonetizationModal]);

  const handlePaymentCompleteMerged = useCallback(() => {
    if (mergedPdfUrl) {
      const link = document.createElement("a");
      link.href = mergedPdfUrl;
      link.download = "merged_document.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    closeMonetizationModal();
  }, [mergedPdfUrl, closeMonetizationModal]);

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // File upload interface
  if (pdfFiles.length === 0) {
    return (
      <div className="w-full max-w-6xl mx-auto min-h-96 bg-gray-800/40 rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              Merge Multiple PDFs
            </h2>
            <p className="text-gray-400">
              Upload multiple PDF files to merge into one document
            </p>
          </div>

          <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="mb-4">
              <label
                htmlFor="file-upload"
                className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Choose PDF Files
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".pdf"
                multiple
                onChange={(e) => {
                  if (e.target.files) {
                    handleFileUploadMultiple(e.target.files);
                  }
                }}
                className="hidden"
              />
            </div>
            <p className="text-gray-400 text-sm">
              Select multiple PDF files to merge together
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Processing state
  if (isMerging) {
    return (
      <div className="w-full max-w-6xl mx-auto min-h-96 bg-gray-800/40 rounded-lg overflow-hidden">
        <div className="p-6 flex items-center justify-center h-full">
          <div className="w-full max-w-lg">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Merging PDFs
              </h2>
              <p className="text-gray-400">
                Combining {pdfFiles.length} PDF files into one document
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-300">
                  Progress
                </span>
                <span className="text-sm font-semibold text-white">
                  {Math.round(mergeProgress)}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${mergeProgress}%` }}
                />
              </div>
            </div>

            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // File management interface
  return (
    <div className="w-full max-w-6xl mx-auto min-h-96 bg-gray-800/40 rounded-lg overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Merge PDFs ({pdfFiles.length} files)
            </h2>
            <p className="text-gray-400">
              Arrange your PDF files in the order you want them merged
            </p>
          </div>
          <div className="flex space-x-3">
            <label
              htmlFor="add-more-files"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors"
            >
              Add More Files
            </label>
            <input
              id="add-more-files"
              type="file"
              accept=".pdf"
              multiple
              onChange={(e) => {
                if (e.target.files) {
                  handleFileUploadMultiple(e.target.files);
                }
              }}
              className="hidden"
            />
            <Button
              onClick={handleMergePdfs}
              disabled={pdfFiles.length < 2}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Merge PDFs
            </Button>
          </div>
        </div>

        {/* File List */}
        <div className="space-y-3 mb-6">
          {pdfFiles.map((pdfFile, index) => (
            <div
              key={pdfFile.id}
              className="bg-gray-700/50 rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {index + 1}
                </div>
                <div>
                  <div className="text-white font-medium">{pdfFile.name}</div>
                  <div className="text-gray-400 text-sm">
                    {formatFileSize(pdfFile.size)}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => handleMoveFile(pdfFile.id, "up")}
                  disabled={index === 0}
                  className="bg-gray-600 hover:bg-gray-700 text-white text-sm disabled:opacity-50"
                >
                  ↑
                </Button>
                <Button
                  onClick={() => handleMoveFile(pdfFile.id, "down")}
                  disabled={index === pdfFiles.length - 1}
                  className="bg-gray-600 hover:bg-gray-700 text-white text-sm disabled:opacity-50"
                >
                  ↓
                </Button>
                <Button
                  onClick={() => handleRemoveFile(pdfFile.id)}
                  className="bg-red-600 hover:bg-red-700 text-white text-sm"
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Download Options */}
        {showDownloadOptions && mergedPdfUrl && (
          <div className="mt-8 p-6 bg-gray-700/50 rounded-lg">
            <h3 className="text-xl font-bold text-white mb-4">
              Merge Complete!
            </h3>
            <p className="text-gray-400 mb-6">
              Your PDFs have been successfully merged. You can now view or
              download the merged document.
            </p>
            <div className="flex space-x-4">
              <Button
                onClick={handleViewMerged}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                View Merged PDF
              </Button>
              <Button
                onClick={handleDownloadMerged}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Download Merged PDF
              </Button>
            </div>
          </div>
        )}

        <MonetizationModal
          isOpen={monetizationState.isModalOpen}
          onClose={closeMonetizationModal}
          onAdComplete={handleAdCompleteMerged}
          onPaymentComplete={handlePaymentCompleteMerged}
          fileName={monetizationState.fileName}
          fileType={monetizationState.fileType}
        />

        {/* Full-screen Preview Modal */}
        {previewImage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] w-full mx-4">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">Preview Merged PDF</h3>
                <button
                  onClick={() => setPreviewImage(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="p-4">
                <div className="w-full h-[70vh] border border-gray-300 rounded-lg overflow-hidden">
                  <iframe
                    src={previewImage}
                    className="w-full h-full border-0"
                    title="PDF Preview"
                    style={{
                      marginTop: "-40px",
                      height: "calc(100% + 40px)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

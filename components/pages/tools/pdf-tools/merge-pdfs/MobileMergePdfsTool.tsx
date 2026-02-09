"use client";

import React, { useState, useRef, useCallback } from "react";
import { useAlertModal } from "@/hooks/useAlertModal";
import { PDFProcessingModal } from "@/components/ui/PDFProcessingModal";
import { useMonetization } from "@/contexts/MonetizationProvider";
import { getApiUrl } from "@/lib/config";
import {
  X,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  FileText,
  Eye,
  Download,
} from "lucide-react";

interface PdfFile {
  id: string;
  file: File;
  name: string;
  size: number;
  thumbnailUrl?: string;
}

interface MobileMergePdfsToolProps {
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

export const MobileMergePdfsTool: React.FC<MobileMergePdfsToolProps> = ({
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
  const { showModal: showMonetizationModal } = useMonetization();
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
    const newPdfFiles: PdfFile[] = Array.from(files).map((file) => {
      return {
        id: Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        size: file.size,
      };
    });

    setPdfFiles((prev) => [...prev, ...newPdfFiles]);
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
      pdfFiles.forEach((pdfFile) => {
        formData.append("files", pdfFile.file);
      });

      const response = await fetch(`${getApiUrl("")}/merge_pdfs`, {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setMergeProgress(100);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to merge PDFs: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();

      // Construct full URL using the backend base URL
      const fullDownloadUrl = result.download_url.startsWith("http")
        ? result.download_url
        : `${getApiUrl("")}${result.download_url}`;
      setMergedPdfUrl(fullDownloadUrl);
      setShowDownloadOptions(true);

      alertModal.showSuccess(
        "Success",
        `Successfully merged ${pdfFiles.length} PDF files!`
      );
    } catch (error) {
      
      alertModal.showError("Error", "Failed to merge PDFs");
    } finally {
      setIsMerging(false);
      setMergeProgress(0);
    }
  }, [pdfFiles, alertModal]);

  // Handle download merged PDF (with monetization)
  const handleDownloadMerged = useCallback(async () => {
    if (mergedPdfUrl) {
      const completed = await showMonetizationModal({
        title: "Download Merged PDF",
        message: "Choose how you'd like to download your merged PDF",
        fileName: "merged_document.pdf",
        fileType: "PDF",
        downloadUrl: mergedPdfUrl,
      });

      if (completed) {
        const link = document.createElement("a");
        link.href = mergedPdfUrl;
        link.download = "merged_document.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  }, [mergedPdfUrl, showMonetizationModal]);

  // Handle view merged PDF
  const handleViewMerged = useCallback(() => {
    if (mergedPdfUrl) {
      setPreviewImage(mergedPdfUrl);
    }
  }, [mergedPdfUrl]);

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
        <div className="p-4 sm:p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
              Merge Multiple PDFs
            </h2>
            <p className="text-sm sm:text-base text-gray-400">
              Upload multiple PDF files to merge into one document
            </p>
          </div>

          <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 sm:p-8 text-center">
            <div className="mb-4">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
            </div>
            <div className="mb-4">
              <label
                htmlFor="mobile-merge-file-upload"
                className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors inline-block"
              >
                Choose PDF Files
              </label>
              <input
                id="mobile-merge-file-upload"
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

  // Processing state - show modal
  if (isMerging) {
    return (
      <>
        <PDFProcessingModal
          isOpen={true}
          progress={mergeProgress}
          fileName={`Merging ${pdfFiles.length} PDFs`}
        />
        {/* Keep the file upload UI visible but dimmed */}
        <div className="w-full max-w-6xl mx-auto min-h-96 bg-gray-800/40 rounded-lg overflow-hidden opacity-30 pointer-events-none">
          <div className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                Merge Multiple PDFs
              </h2>
              <p className="text-gray-400">
                Upload multiple PDF files to merge into one document
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // File management interface - Mobile optimized
  return (
    <div className="w-full max-w-6xl mx-auto min-h-96 bg-gray-800/40 rounded-lg overflow-hidden">
      <div className="p-4 sm:p-6">
        {/* Mobile-optimized header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                Merge PDFs ({pdfFiles.length} files)
              </h2>
              <p className="text-xs sm:text-sm text-gray-400">
                Arrange your PDF files in the order you want them merged
              </p>
            </div>
          </div>

          {/* Action buttons - Mobile optimized */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <label
              htmlFor="mobile-add-more-files"
              className="flex-1 sm:flex-none bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg cursor-pointer transition-colors text-center sm:text-left flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add More Files</span>
            </label>
            <input
              id="mobile-add-more-files"
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
            <button
              onClick={handleMergePdfs}
              disabled={pdfFiles.length < 2}
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Merge PDFs
            </button>
          </div>
        </div>

        {/* File List - Mobile optimized cards */}
        <div className="space-y-3 mb-4 sm:mb-6">
          {pdfFiles.map((pdfFile, index) => (
            <div
              key={pdfFile.id}
              className="bg-gray-700/50 rounded-lg p-3 sm:p-4 border border-gray-600/50"
            >
              {/* File info row */}
              <div className="flex items-start gap-3 mb-3">
                <div className="bg-red-600 text-white px-3 py-1.5 rounded-full text-sm font-semibold flex-shrink-0 min-w-[2.5rem] text-center">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium text-sm sm:text-base break-words mb-1">
                    {pdfFile.name}
                  </div>
                  <div className="text-gray-400 text-xs sm:text-sm">
                    {formatFileSize(pdfFile.size)}
                  </div>
                </div>
              </div>

              {/* Action buttons - Mobile optimized */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleMoveFile(pdfFile.id, "up")}
                  disabled={index === 0}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-sm py-2 px-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1"
                >
                  <ArrowUp className="w-4 h-4" />
                  <span className="hidden sm:inline">Up</span>
                </button>
                <button
                  onClick={() => handleMoveFile(pdfFile.id, "down")}
                  disabled={index === pdfFiles.length - 1}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-sm py-2 px-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1"
                >
                  <ArrowDown className="w-4 h-4" />
                  <span className="hidden sm:inline">Down</span>
                </button>
                <button
                  onClick={() => handleRemoveFile(pdfFile.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Download Options - Mobile optimized */}
        {showDownloadOptions && mergedPdfUrl && (
          <div className="mt-4 sm:mt-8 p-4 sm:p-6 bg-gray-700/50 rounded-lg">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-4">
              Merge Complete! 🎉
            </h3>
            <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6">
              Your PDFs have been successfully merged. You can now view or
              download the merged document.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={handleViewMerged}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                <span>View Merged PDF</span>
              </button>
              <button
                onClick={handleDownloadMerged}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>
          </div>
        )}

        {/* Full-screen Preview Modal - Mobile optimized */}
        {previewImage && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[9999] p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-full max-h-full w-full h-full sm:max-w-4xl sm:max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-3 sm:p-4 border-b">
                <h3 className="text-base sm:text-lg font-semibold">
                  Preview Merged PDF
                </h3>
                <button
                  onClick={() => setPreviewImage(null)}
                  className="text-gray-500 hover:text-gray-700 p-1"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
              <div className="flex-1 p-2 sm:p-4 overflow-hidden">
                <div className="w-full h-full border border-gray-300 rounded-lg overflow-hidden">
                  <iframe
                    src={previewImage}
                    className="w-full h-full border-0"
                    title="PDF Preview"
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

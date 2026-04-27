"use client";

import React, { useState, useRef, useCallback } from "react";
import { useAlertModal } from "@/hooks/useAlertModal";
import { PDFProcessingModal } from "@/components/ui/PDFProcessingModal";
import { useMonetization } from "@/contexts/MonetizationProvider";
import { getApiUrl } from "@/lib/config";
import { X, Download, Eye } from "lucide-react";

interface MobileSplitPdfToolProps {
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  result: { type: "success" | "error"; message: string; data?: any } | null;
  setResult: (
    result: { type: "success" | "error"; message: string; data?: any } | null
  ) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  handleFileUpload: (file: File) => void;
}

interface PageInfo {
  pageNumber: number;
  thumbnailUrl: string;
  isSelected: boolean;
}

export const MobileSplitPdfTool: React.FC<MobileSplitPdfToolProps> = ({
  uploadedFile,
  setUploadedFile,
  result,
  setResult,
  isProcessing,
  setIsProcessing,
  handleFileUpload,
}) => {
  const { showModal: showMonetizationModal } = useMonetization();
  const alertModal = useAlertModal();

  // Core state
  const [totalPages, setTotalPages] = useState<number>(0);
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isSplitting, setIsSplitting] = useState<boolean>(false);
  const [splitProgress, setSplitProgress] = useState<number>(0);
  const [downloadUrls, setDownloadUrls] = useState<string[]>([]);
  const [viewUrls, setViewUrls] = useState<string[]>([]);
  const [showDownloadOptions, setShowDownloadOptions] =
    useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Refs
  const isProcessingRef = useRef<boolean>(false);

  // Process document function
  const handleProcessDocument = useCallback(async () => {
    if (!uploadedFile || isProcessingRef.current) return;

    isProcessingRef.current = true;
    setIsProcessing(true);
    setUploadProgress(0);

    // Smooth progress simulation
    const simulateProgress = () => {
      return new Promise<void>((resolve) => {
        let progress = 0;
        const updateInterval = 100;
        const totalDuration = 5000; // 5 seconds
        const totalSteps = totalDuration / updateInterval;
        const progressIncrement = 100 / totalSteps;

        const interval = setInterval(() => {
          progress += progressIncrement;
          const clampedProgress = Math.min(progress, 100);
          setUploadProgress(clampedProgress);

          if (clampedProgress >= 100) {
            clearInterval(interval);
            resolve();
          }
        }, updateInterval);
      });
    };

    try {
      await simulateProgress();
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Upload PDF file
      const formData = new FormData();
      formData.append("pdf", uploadedFile);

      const uploadResponse = await fetch(`${getApiUrl("")}/api/upload`, {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload PDF");
      }

      const uploadData = await uploadResponse.json();
      const filename = uploadData.filename || uploadedFile.name;

      // Get PDF info including page count
      const pdfInfoResponse = await fetch(
        `${getApiUrl("")}/api/pdf_info/${encodeURIComponent(filename)}`
      );
      if (pdfInfoResponse.ok) {
        const pdfInfo = await pdfInfoResponse.json();
        setTotalPages(pdfInfo.page_count);

        // Generate page thumbnails
        const pageList: PageInfo[] = Array.from(
          { length: pdfInfo.page_count },
          (_, index) => ({
            pageNumber: index + 1,
            thumbnailUrl: `${getApiUrl(
              ""
            )}/api/pdf_thumbnail/${encodeURIComponent(filename)}/${index + 1}`,
            isSelected: true, // Select all pages by default
          })
        );
        setPages(pageList);
      } else {
        throw new Error("Failed to get PDF info");
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      
      alertModal.showError("Error", "Failed to process PDF");
    } finally {
      isProcessingRef.current = false;
      setIsProcessing(false);
    }
  }, [uploadedFile, setIsProcessing, alertModal]);

  // Auto-process document when file is uploaded
  React.useEffect(() => {
    if (uploadedFile && totalPages === 0 && !isProcessingRef.current) {
      handleProcessDocument();
    }
  }, [uploadedFile, totalPages, handleProcessDocument]);

  // Handle page selection toggle
  const handlePageToggle = (pageNumber: number) => {
    setPages((prevPages) =>
      prevPages.map((page) =>
        page.pageNumber === pageNumber
          ? { ...page, isSelected: !page.isSelected }
          : page
      )
    );
  };

  // Handle select all pages
  const handleSelectAll = () => {
    setPages((prevPages) =>
      prevPages.map((page) => ({ ...page, isSelected: true }))
    );
  };

  // Handle deselect all pages
  const handleDeselectAll = () => {
    setPages((prevPages) =>
      prevPages.map((page) => ({ ...page, isSelected: false }))
    );
  };

  // Handle split PDF
  const handleSplitPdf = async () => {
    const selectedPages = pages.filter((page) => page.isSelected);

    if (selectedPages.length === 0) {
      alertModal.showError("Error", "Please select at least one page to split");
      return;
    }

    setIsSplitting(true);
    setSplitProgress(0);

    try {
      const filename = uploadedFile?.name;
      if (!filename) throw new Error("No filename available");

      // Simulate progress
      const progressInterval = setInterval(() => {
        setSplitProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Call split API
      const response = await fetch(`${getApiUrl("")}/split_pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: filename,
          pages: selectedPages.map((page) => page.pageNumber),
        }),
      });

      clearInterval(progressInterval);
      setSplitProgress(100);

      if (!response.ok) {
        throw new Error("Failed to split PDF");
      }

      const result = await response.json();
      const fullDownloadUrls = result.downloadUrls.map((url: string) =>
        url.startsWith("http") ? url : `${getApiUrl("")}${url}`
      );
      const fullViewUrls = (result.viewUrls || []).map((url: string) =>
        url.startsWith("http") ? url : `${getApiUrl("")}${url}`
      );
      setDownloadUrls(fullDownloadUrls);
      setViewUrls(fullViewUrls);
      setShowDownloadOptions(true);

      alertModal.showSuccess(
        "Success",
        `PDF split into ${selectedPages.length} pages successfully!`
      );
    } catch (error) {
      
      alertModal.showError("Error", "Failed to split PDF");
    } finally {
      setIsSplitting(false);
      setSplitProgress(0);
    }
  };

  // Handle download individual page
  const handleDownloadPage = (pageNumber: number) => {
    const downloadUrl = downloadUrls[pageNumber - 1];
    if (downloadUrl) {
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `page_${pageNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Handle download all as ZIP
  const handleDownloadAll = async () => {
    const selectedPages = pages.filter((page) => page.isSelected);
    const fileName = uploadedFile?.name?.replace(".pdf", "") || "split_pages";
    const fullFileName = `${fileName}_split_${selectedPages.length}_pages.zip`;

    if (downloadUrls.length > 0) {
      const downloadUrl = downloadUrls[0]; // Get download URL BEFORE showing modal

      const completed = await showMonetizationModal({
        title: "Download ZIP",
        message: `Choose how you'd like to download ${selectedPages.length} pages as ZIP`,
        fileName: fullFileName,
        fileType: "ZIP",
        downloadUrl, // Pass download URL so it's stored for PayFast payments
      });

      if (completed) {
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = fullFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  // Handle individual page download
  const handleDownloadPageWithMonetization = async (pageNumber: number) => {
    const fileName = uploadedFile?.name?.replace(".pdf", "") || "page";
    const fullFileName = `${fileName}_page_${pageNumber}.pdf`;

    if (downloadUrls[pageNumber - 1]) {
      const downloadUrl = downloadUrls[pageNumber - 1]; // Get download URL BEFORE showing modal

      const completed = await showMonetizationModal({
        title: "Download Page",
        message: `Choose how you'd like to download page ${pageNumber}`,
        fileName: fullFileName,
        fileType: "PDF",
        downloadUrl, // Pass download URL so it's stored for PayFast payments
      });

      if (completed) {
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = fullFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  // Get PDF view URL for preview
  const getPdfViewUrl = (pageNumber: number) => {
    if (viewUrls.length > 0 && viewUrls[pageNumber - 1]) {
      return viewUrls[pageNumber - 1];
    }
    const fileName = uploadedFile?.name?.replace(".pdf", "") || "";
    return `${getApiUrl("")}/view_split/${fileName}_page_${pageNumber}.pdf`;
  };

  // File upload state
  if (!uploadedFile) {
    return (
      <div className="w-full max-w-4xl mx-auto min-h-96 bg-gray-800/40 rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              Split PDF into Individual Pages
            </h2>
            <p className="text-gray-400">
              Upload a PDF file to split into separate pages
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
                htmlFor="mobile-split-file-upload"
                className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Choose PDF File
              </label>
              <input
                id="mobile-split-file-upload"
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload(file);
                  }
                }}
                className="hidden"
              />
            </div>
            <p className="text-gray-400 text-sm">
              Drag and drop your PDF here, or click to browse
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Processing state - show modal instead of inline progress
  if (isProcessing) {
    return (
      <>
        <PDFProcessingModal
          isOpen={true}
          progress={uploadProgress}
          fileName={uploadedFile?.name}
        />
        {/* Keep the file upload UI visible but dimmed */}
        <div className="w-full max-w-4xl mx-auto min-h-96 bg-gray-800/40 rounded-lg overflow-hidden opacity-30 pointer-events-none">
          <div className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                Split PDF into Individual Pages
              </h2>
              <p className="text-gray-400">
                Upload a PDF file to split into separate pages
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Page selection interface
  if (totalPages > 0) {
    const selectedCount = pages.filter((page) => page.isSelected).length;

    return (
      <div className="w-full max-w-6xl mx-auto min-h-96 bg-gray-800/40 rounded-lg overflow-hidden">
        <div className="p-4 sm:p-6">
          {/* Mobile-optimized header */}
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                  Select Pages to Split
                </h2>
                <p className="text-sm sm:text-base text-gray-400">
                  Choose which pages you want to extract
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
                <div className="text-xs sm:text-sm text-gray-300 text-center sm:text-left">
                  {selectedCount} of {totalPages} selected
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSelectAll}
                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-xs sm:text-sm rounded-lg transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    onClick={handleDeselectAll}
                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-xs sm:text-sm rounded-lg transition-colors"
                  >
                    Deselect All
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Page Grid - Mobile optimized */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {pages.map((page) => (
              <div
                key={page.pageNumber}
                className={`relative cursor-pointer rounded-lg border-2 transition-all ${
                  page.isSelected
                    ? "border-blue-500 bg-blue-900/30"
                    : "border-gray-600 hover:border-gray-500"
                }`}
                onClick={() => handlePageToggle(page.pageNumber)}
              >
                <div className="aspect-[3/4] bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                  <img
                    src={page.thumbnailUrl}
                    alt={`Page ${page.pageNumber}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute top-1 sm:top-2 left-1 sm:left-2">
                  <div
                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center ${
                      page.isSelected ? "bg-blue-500" : "bg-gray-600"
                    }`}
                  >
                    {page.isSelected && (
                      <svg
                        className="w-3 h-3 sm:w-4 sm:h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="absolute bottom-1 sm:bottom-2 left-1/2 transform -translate-x-1/2">
                  <div className="bg-purple-600 text-white text-xs px-2 py-0.5 sm:py-1 rounded-full">
                    Page {page.pageNumber}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Split Button - Mobile optimized */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <button
              onClick={handleSplitPdf}
              disabled={selectedCount === 0 || isSplitting}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 text-base sm:text-lg rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSplitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Splitting PDF... {splitProgress}%</span>
                </div>
              ) : (
                `Split ${selectedCount} Page${selectedCount !== 1 ? "s" : ""}`
              )}
            </button>
          </div>

          {/* Download Options - Mobile optimized */}
          {showDownloadOptions && downloadUrls.length > 0 && (
            <div className="mt-4 sm:mt-8 p-4 sm:p-6 bg-gray-700/50 rounded-lg">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4">
                Download Split Pages
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {pages
                  .filter((page) => page.isSelected)
                  .map((page) => (
                    <div key={page.pageNumber} className="text-center">
                      <div className="aspect-[3/4] bg-gray-600 rounded-lg mb-2 flex items-center justify-center relative group">
                        <img
                          src={page.thumbnailUrl}
                          alt={`Page ${page.pageNumber}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        {/* View overlay on hover/touch */}
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-lg">
                          <button
                            onClick={() =>
                              setPreviewImage(getPdfViewUrl(page.pageNumber))
                            }
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-lg"
                          >
                            View
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <button
                          onClick={() =>
                            setPreviewImage(getPdfViewUrl(page.pageNumber))
                          }
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() =>
                            handleDownloadPageWithMonetization(page.pageNumber)
                          }
                          className="w-full bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                        >
                          <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
              <div className="mt-4 sm:mt-6 text-center">
                <button
                  onClick={handleDownloadAll}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 text-base sm:text-lg font-semibold rounded-lg transition-colors"
                >
                  Download All as ZIP
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Full-screen Preview Modal - Mobile optimized */}
        {previewImage && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[9999] p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-full max-h-full w-full h-full sm:max-w-4xl sm:max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-3 sm:p-4 border-b">
                <h3 className="text-base sm:text-lg font-semibold">
                  Preview PDF
                </h3>
                <button
                  onClick={() => setPreviewImage(null)}
                  className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl p-1"
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
    );
  }

  // Results
  if (result) {
    return (
      <div className="w-full max-w-4xl mx-auto min-h-96 bg-gray-800/40 rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              {result.type === "success" ? "Success!" : "Error"}
            </h2>
            <p className="text-gray-400 mb-6">{result.message}</p>
            <button
              onClick={() => {
                setResult(null);
                setUploadedFile(null);
                setTotalPages(0);
                setPages([]);
                setShowDownloadOptions(false);
                setDownloadUrls([]);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Process Another PDF
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

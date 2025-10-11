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

interface SplitPdfToolProps {
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
  const alertModal = useAlertModal();

  // Core state
  const [totalPages, setTotalPages] = useState<number>(0);
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [currentUploadStep, setCurrentUploadStep] = useState<number>(0);
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
    setCurrentUploadStep(0);

    // Smooth progress simulation with realistic timing
    const simulateProgress = () => {
      return new Promise<void>((resolve) => {
        let progress = 0;
        let step = 0;
        let interval: NodeJS.Timeout | null = null;
        const totalDuration = 5000; // 5 seconds for split PDF
        const updateInterval = 100;
        const totalSteps = totalDuration / updateInterval;
        const progressIncrement = 100 / totalSteps;

        const updateProgress = () => {
          let increment = progressIncrement;

          if (
            (progress >= 20 && progress < 25) ||
            (progress >= 55 && progress < 60)
          ) {
            increment = progressIncrement * 0.3;
          }

          progress += increment;

          if (progress >= 25 && step === 0) {
            step = 1;
            setCurrentUploadStep(1);
          } else if (progress >= 60 && step === 1) {
            step = 2;
            setCurrentUploadStep(2);
          }

          const clampedProgress = Math.min(progress, 100);
          setUploadProgress(clampedProgress);

          if (clampedProgress >= 100) {
            if (interval) {
              clearInterval(interval);
            }
            resolve();
          }
        };

        setTimeout(() => {
          interval = setInterval(updateProgress, updateInterval);
        }, 500);
      });
    };

    try {
      await simulateProgress();
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Upload PDF file
      const formData = new FormData();
      formData.append("pdf", uploadedFile);

      const uploadResponse = await fetch("http://localhost:5000/", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload PDF");
      }

      const filename = uploadedFile.name;

      // Get PDF info including page count
      const pdfInfoResponse = await fetch(
        `http://localhost:5000/api/pdf_info/${filename}`
      );
      if (pdfInfoResponse.ok) {
        const pdfInfo = await pdfInfoResponse.json();
        console.log("📄 PDF info:", pdfInfo);
        setTotalPages(pdfInfo.page_count);

        // Generate page thumbnails
        const pageList: PageInfo[] = Array.from(
          { length: pdfInfo.page_count },
          (_, index) => ({
            pageNumber: index + 1,
            thumbnailUrl: `http://localhost:5000/api/pdf_thumbnail/${filename}/${
              index + 1
            }`,
            isSelected: true, // Select all pages by default
          })
        );
        setPages(pageList);
      } else {
        throw new Error("Failed to get PDF info");
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error("PDF processing error:", error);
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

  // Reset processing ref when component unmounts or file changes
  React.useEffect(() => {
    return () => {
      isProcessingRef.current = false;
    };
  }, [uploadedFile]);

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
      const response = await fetch("http://localhost:5000/api/split_pdf", {
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
      setDownloadUrls(result.downloadUrls);
      setViewUrls(result.viewUrls || []);
      setShowDownloadOptions(true);

      alertModal.showSuccess(
        "Success",
        `PDF split into ${selectedPages.length} pages successfully!`
      );
    } catch (error) {
      console.error("Split PDF error:", error);
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
  const handleDownloadAll = () => {
    // This would trigger the monetization modal for the ZIP download
    const selectedPages = pages.filter((page) => page.isSelected);
    const fileName = uploadedFile?.name?.replace(".pdf", "") || "split_pages";

    openMonetizationModal(
      `${fileName}_split_${selectedPages.length}_pages`,
      "zip",
      downloadUrls[0] // Use first URL as placeholder
    );
  };

  // Handle individual page download with monetization
  const handleDownloadPageWithMonetization = (pageNumber: number) => {
    const fileName = uploadedFile?.name?.replace(".pdf", "") || "page";
    const selectedPages = pages.filter((page) => page.isSelected);

    openMonetizationModal(
      `${fileName}_page_${pageNumber}`,
      "pdf",
      downloadUrls[pageNumber - 1] || ""
    );
  };

  // Get PDF view URL for preview
  const getPdfViewUrl = (pageNumber: number) => {
    // Use the viewUrls array that's populated after splitting
    if (viewUrls.length > 0 && viewUrls[pageNumber - 1]) {
      return `http://localhost:5000${viewUrls[pageNumber - 1]}`;
    }
    // Fallback to constructing URL if viewUrls not available
    const fileName = uploadedFile?.name?.replace(".pdf", "") || "";
    return `http://localhost:5000/view_split/${fileName}_page_${pageNumber}.pdf`;
  };

  // File upload state
  if (!uploadedFile) {
    return (
      <>
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
                  htmlFor="file-upload"
                  className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Choose PDF File
                </label>
                <input
                  id="file-upload"
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
      </>
    );
  }

  // Processing state
  if (isProcessing) {
    const steps = [
      {
        id: 0,
        title: "Uploading PDF",
        description: "Analyzing document structure...",
        completed: uploadProgress >= 25,
      },
      {
        id: 1,
        title: "Extracting Pages",
        description: "Processing individual pages...",
        completed: uploadProgress >= 60,
      },
      {
        id: 2,
        title: "Preparing Interface",
        description: "Setting up page selection...",
        completed: uploadProgress >= 100,
      },
    ];

    return (
      <div className="w-full max-w-4xl mx-auto min-h-96 bg-gray-800/40 rounded-lg overflow-hidden">
        <div className="p-6 flex items-center justify-center h-full">
          <div className="w-full max-w-lg">
            {/* Progress Steps */}
            <div className="relative">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className="flex items-start space-x-4 relative"
                >
                  {/* Checkmark Circle */}
                  <div className="flex-shrink-0 relative z-10">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                        step.completed
                          ? "bg-green-500 text-white"
                          : "bg-gray-600 text-gray-400"
                      }`}
                    >
                      {step.completed ? (
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <span className="text-sm font-semibold">
                          {index + 1}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 min-w-0 pb-6">
                    <h3
                      className={`text-lg font-semibold transition-colors duration-300 ${
                        step.completed ? "text-green-400" : "text-white"
                      }`}
                    >
                      {step.title}
                    </h3>
                    <p
                      className={`text-sm transition-colors duration-300 ${
                        step.completed ? "text-green-300" : "text-gray-400"
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-300">
                  Progress
                </span>
                <span className="text-sm font-semibold text-white">
                  {Math.round(uploadProgress)}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Page selection interface
  if (totalPages > 0) {
    const selectedCount = pages.filter((page) => page.isSelected).length;

    return (
      <div className="w-full max-w-6xl mx-auto min-h-96 bg-gray-800/40 rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Select Pages to Split
              </h2>
              <p className="text-gray-400">
                Choose which pages you want to extract from your PDF
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-300">
                {selectedCount} of {totalPages} pages selected
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={handleSelectAll}
                  className="bg-gray-600 hover:bg-gray-700 text-white text-sm"
                >
                  Select All
                </Button>
                <Button
                  onClick={handleDeselectAll}
                  className="bg-gray-600 hover:bg-gray-700 text-white text-sm"
                >
                  Deselect All
                </Button>
              </div>
            </div>
          </div>

          {/* Page Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
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
                <div className="absolute top-2 left-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      page.isSelected ? "bg-blue-500" : "bg-gray-600"
                    }`}
                  >
                    {page.isSelected && (
                      <svg
                        className="w-4 h-4 text-white"
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
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
                  <div className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                    Page {page.pageNumber}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Split Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleSplitPdf}
              disabled={selectedCount === 0 || isSplitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSplitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Splitting PDF... {splitProgress}%</span>
                </div>
              ) : (
                `Split ${selectedCount} Page${selectedCount !== 1 ? "s" : ""}`
              )}
            </Button>
          </div>

          {/* Download Options */}
          {showDownloadOptions && downloadUrls.length > 0 && (
            <div className="mt-8 p-6 bg-gray-700/50 rounded-lg">
              <h3 className="text-xl font-bold text-white mb-4">
                Download Split Pages
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                        {/* View overlay on hover */}
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-lg">
                          <Button
                            onClick={() =>
                              setPreviewImage(getPdfViewUrl(page.pageNumber))
                            }
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1"
                          >
                            View
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Button
                          onClick={() =>
                            setPreviewImage(getPdfViewUrl(page.pageNumber))
                          }
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs w-full"
                        >
                          View Page {page.pageNumber}
                        </Button>
                        <Button
                          onClick={() =>
                            handleDownloadPageWithMonetization(page.pageNumber)
                          }
                          className="bg-green-600 hover:bg-green-700 text-white text-xs w-full"
                        >
                          Download Page {page.pageNumber}
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
              <div className="mt-6 text-center">
                <Button
                  onClick={handleDownloadAll}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold rounded-lg"
                >
                  Download All as ZIP
                </Button>
              </div>
            </div>
          )}
        </div>

        <MonetizationModal
          isOpen={monetizationState.isModalOpen}
          onClose={closeMonetizationModal}
          onAdComplete={handleAdComplete}
          onPaymentComplete={handlePaymentComplete}
          fileName={monetizationState.fileName}
          fileType={monetizationState.fileType}
        />

        {/* Full-screen Preview Modal */}
        {previewImage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] w-full mx-4">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">Preview PDF</h3>
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
            <Button
              onClick={() => {
                setResult(null);
                setUploadedFile(null);
                setTotalPages(0);
                setPages([]);
                setShowDownloadOptions(false);
                setDownloadUrls([]);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Process Another PDF
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

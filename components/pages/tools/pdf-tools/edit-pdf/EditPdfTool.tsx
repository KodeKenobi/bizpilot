"use client";

import React, { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { useMonetization } from "@/hooks/useMonetization";
import MonetizationModal from "@/components/ui/MonetizationModal";
import { PDFEditorLayout } from "@/components/ui/PDFEditorLayout";
import { UploadProgressModal } from "@/components/ui/UploadProgressModal";

// Simple button component to avoid import issues
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

interface EditPdfToolProps {
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  result: { type: "success" | "error"; message: string; data?: any } | null;
  setResult: (
    result: { type: "success" | "error"; message: string; data?: any } | null
  ) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  handleFileUpload: (file: File) => void;
  showEditor: boolean;
  setShowEditor: (show: boolean) => void;
  editorUrl: string;
  setEditorUrl: (url: string) => void;
}

export const EditPdfTool: React.FC<EditPdfToolProps> = ({
  uploadedFile,
  setUploadedFile,
  result,
  setResult,
  isProcessing,
  setIsProcessing,
  handleFileUpload,
  showEditor,
  setShowEditor,
  editorUrl,
  setEditorUrl,
}) => {
  const {
    monetizationState,
    openMonetizationModal,
    closeMonetizationModal,
    handleAdComplete,
    handlePaymentComplete,
  } = useMonetization();

  // Editor state
  const [activeTool, setActiveTool] = useState<string>("select");
  const [zoomLevel, setZoomLevel] = useState<number>(125);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [currentUploadStep, setCurrentUploadStep] = useState<number>(0);

  // Handle zoom controls
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 25, 50));
  };

  const handleZoomReset = () => {
    setZoomLevel(125);
  };

  // Handle tool selection
  const handleToolSelect = (toolId: string) => {
    setActiveTool(toolId);
  };

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Generate page thumbnails
  const generatePageThumbnails = () => {
    return Array.from({ length: totalPages }, (_, index) => ({
      pageNumber: index + 1,
      isActive: currentPage === index + 1,
      onClick: () => handlePageChange(index + 1),
    }));
  };

  // Simulate upload progress
  const simulateUploadProgress = () => {
    setShowUploadModal(true);
    setUploadProgress(0);
    setCurrentUploadStep(0);

    const simulateProgress = () => {
      return new Promise<void>((resolve) => {
        let progress = 0;
        let step = 0;

        const interval = setInterval(() => {
          progress += Math.random() * 15 + 5; // Random increment between 5-20

          // Update step based on progress
          if (progress >= 30 && step === 0) {
            step = 1;
            setCurrentUploadStep(1);
          } else if (progress >= 70 && step === 1) {
            step = 2;
            setCurrentUploadStep(2);
          }

          setUploadProgress(Math.min(progress, 100));

          if (progress >= 100) {
            clearInterval(interval);
            resolve();
          }
        }, 200);
      });
    };

    simulateProgress().then(() => {
      // Mock editor URL for demonstration
      setEditorUrl(
        "data:text/html,<h1>PDF Editor Mock</h1><p>This is a mock PDF editor for demonstration purposes.</p>"
      );
      setTotalPages(1);
      setShowEditor(true);

      setTimeout(() => {
        setShowUploadModal(false);
      }, 1000);
    });
  };

  // Handle file upload
  const handleFileUploadWithProgress = (file: File) => {
    handleFileUpload(file);
    simulateUploadProgress();
  };

  if (showEditor) {
    return (
      <div data-editor-active="true">
        <PDFEditorLayout
          title="PDFLeader"
          fileName={uploadedFile?.name}
          onDone={() => {
            setShowEditor(false);
            setEditorUrl("");
            setUploadedFile(null);
            setResult(null);
          }}
          onSearch={() => {
            // Implement search functionality
            console.log("Search clicked");
          }}
          zoomLevel={zoomLevel}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onZoomReset={handleZoomReset}
          activeTool={activeTool}
          onToolSelect={handleToolSelect}
          pages={generatePageThumbnails()}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onUploadNew={() => {
            setShowEditor(false);
            setEditorUrl("");
            setUploadedFile(null);
            setResult(null);
          }}
          onSave={() => {
            // Implement save functionality
            console.log("Save clicked");
          }}
          isProcessing={isProcessing}
        >
          <div className="h-full w-full bg-white">
            <iframe
              src={editorUrl}
              className="w-full h-full border-0"
              title="PDF Editor"
              sandbox="allow-same-origin allow-scripts allow-forms allow-downloads allow-modals allow-popups"
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: "top left",
              }}
            />
          </div>
        </PDFEditorLayout>

        <MonetizationModal
          isOpen={monetizationState.isModalOpen}
          onClose={closeMonetizationModal}
          onAdComplete={handleAdComplete}
          onPaymentComplete={handlePaymentComplete}
          fileName={monetizationState.fileName}
          fileType={monetizationState.fileType}
        />

        <UploadProgressModal
          isOpen={showUploadModal}
          progress={uploadProgress}
          currentStep={currentUploadStep}
          onComplete={() => setShowUploadModal(false)}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto min-h-96 bg-gray-800/40 rounded-lg overflow-hidden">
      <div className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Edit PDF</h2>
          <p className="text-gray-400">
            Upload a PDF to start editing text, images, and more
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
                  handleFileUploadWithProgress(file);
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

      <MonetizationModal
        isOpen={monetizationState.isModalOpen}
        onClose={closeMonetizationModal}
        onAdComplete={handleAdComplete}
        onPaymentComplete={handlePaymentComplete}
        fileName={monetizationState.fileName}
        fileType={monetizationState.fileType}
      />
    </div>
  );
};

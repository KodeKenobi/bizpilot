"use client";

import React, { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { useMonetization } from "@/hooks/useMonetization";
import MonetizationModal from "@/components/ui/MonetizationModal";

interface EditPdfToolProps {
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  result: any;
  setResult: (result: any) => void;
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

  // Listen for messages from iframe
  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "OPEN_MONETIZATION_MODAL") {
        const { fileName, fileType } = event.data;
        openMonetizationModal(fileName, fileType, "#");
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [openMonetizationModal]);

  // Handle monetization completion - trigger PDF generation
  const handleMonetizationComplete = React.useCallback(() => {
    const iframe = document.querySelector("iframe");
    if (iframe?.contentWindow) {
      // Send message to iframe to generate and download PDF automatically
      iframe.contentWindow.postMessage(
        {
          type: "GENERATE_AND_DOWNLOAD_PDF",
        },
        "*"
      );
    }
    // Schedule modal close after current render cycle
    setTimeout(() => {
      closeMonetizationModal();
    }, 0);
  }, [closeMonetizationModal]);

  if (!uploadedFile) {
    return (
      <div className="w-full max-w-4xl mx-auto min-h-96 bg-gray-800/40 rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-white text-xl font-semibold mb-2">
              Edit PDF Content
            </h3>
            <p className="text-gray-400 text-sm">
              Upload a PDF file to edit its content
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

  if (showEditor) {
    return (
      <>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center space-x-4">
              <h3 className="text-white font-semibold text-lg">PDF Editor</h3>
              <span className="text-gray-400 text-sm">
                {uploadedFile?.name}
              </span>
            </div>
            <button
              onClick={() => {
                setShowEditor(false);
                setEditorUrl("");
                setUploadedFile(null);
                setResult(null);
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Upload New PDF
            </button>
          </div>
          <div className="bg-white" style={{ height: "110vh" }}>
            <iframe
              src={editorUrl}
              className="w-full h-full border-0"
              title="PDF Editor"
              sandbox="allow-same-origin allow-scripts allow-forms allow-downloads allow-modals allow-popups"
            />
          </div>
        </div>

        <MonetizationModal
          isOpen={monetizationState.isModalOpen}
          onClose={closeMonetizationModal}
          onAdComplete={handleMonetizationComplete}
          onPaymentComplete={handleMonetizationComplete}
          fileName={monetizationState.fileName}
          fileType={monetizationState.fileType}
        />
      </>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto min-h-96 bg-gray-800/40 rounded-lg overflow-hidden">
      <div className="p-6">
        <div className="text-center mb-6">
          <h3 className="text-white text-xl font-semibold mb-2">
            Edit PDF Content
          </h3>
          <p className="text-gray-400 text-sm">
            Upload a PDF file to edit its content
          </p>
        </div>
        <FileUpload
          onChange={(files) => handleFileUpload(files[0])}
          multiple={false}
        />
      </div>
    </div>
  );
};

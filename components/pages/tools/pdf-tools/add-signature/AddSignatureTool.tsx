"use client";

import React, { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { SignatureCanvas } from "@/components/ui/signature-canvas";
import { useMonetization } from "@/hooks/useMonetization";
import MonetizationModal from "@/components/ui/MonetizationModal";
import { useAlertModal } from "@/hooks/useAlertModal";
import AlertModal from "@/components/ui/AlertModal";
import { useDraggableCanvas } from "@/hooks/useDraggableCanvas";

interface AddSignatureToolProps {
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  result: any;
  setResult: (result: any) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  handleFileUpload: (file: File) => void;
}

export const AddSignatureTool: React.FC<AddSignatureToolProps> = ({
  uploadedFile,
  setUploadedFile,
  result,
  setResult,
  isProcessing,
  setIsProcessing,
  handleFileUpload,
}) => {
  const [signatureData, setSignatureData] = useState<string>("");
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [signaturePlaced, setSignaturePlaced] = useState<boolean>(false);
  const [signatureOverlay, setSignatureOverlay] = useState<any>({
    visible: false,
    x: 200,
    y: 200,
  });
  const [showSignedPdfViewer, setShowSignedPdfViewer] = useState(false);
  const [signedPdfUrl, setSignedPdfUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const alertModal = useAlertModal();
  const {
    monetizationState,
    openMonetizationModal,
    closeMonetizationModal,
    handleAdComplete,
    handlePaymentComplete,
  } = useMonetization();

  // Use draggable canvas hook
  const { canvasHeight, handleCanvasResizeStart } = useDraggableCanvas({
    initialHeight: 600,
    minHeight: 400,
    maxHeight: 1000,
  });

  const addSignature = async () => {
    if (!uploadedFile || !signatureData) {
      setResult({
        type: "error",
        message: "Please upload a PDF and create a signature",
      });
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("pdf", uploadedFile);
      formData.append("signature_data", signatureData);
      formData.append("page_number", pageNumber.toString());
      formData.append("x_position", signatureOverlay.x.toString());
      formData.append("y_position", signatureOverlay.y.toString());

      const response = await fetch("http://localhost:5000/add_signature", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to add signature");
      }

      const data = await response.json();
      setResult({
        type: "success",
        message: "Signature added successfully!",
        data: data,
      });
      setSignedPdfUrl(data.signed_pdf_url);
    } catch (error) {
      console.error("Error adding signature:", error);
      setResult({
        type: "error",
        message: "Error adding signature. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - signatureOverlay.x,
      y: e.clientY - signatureOverlay.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    setSignatureOverlay({
      ...signatureOverlay,
      x: Math.max(0, Math.min(400, newX)),
      y: Math.max(0, Math.min(300, newY)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setSignaturePlaced(true);
  };

  if (!uploadedFile) {
    return (
      <div className="w-full max-w-4xl mx-auto min-h-96 bg-gray-800/40 rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-white text-xl font-semibold mb-2">
              Add Digital Signature to PDF
            </h3>
            <p className="text-gray-400 text-sm">
              Upload a PDF file to add your digital signature
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
      <div
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden relative"
        style={{ height: `${canvasHeight}px` }}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center space-x-4">
            <h3 className="text-white font-semibold text-lg">
              Add Digital Signature
            </h3>
            <span className="text-gray-400 text-sm">{uploadedFile?.name}</span>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Signature Creation */}
            <div className="space-y-6">
              <div>
                <h3 className="text-gray-300 text-lg font-medium mb-4">
                  Create Your Signature
                </h3>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <SignatureCanvas
                    onSignatureChange={setSignatureData}
                    width={400}
                    height={200}
                  />
                </div>
                {signatureData && (
                  <div className="mt-4">
                    <p className="text-green-400 text-sm mb-2">
                      ✅ Signature created!
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(signatureData);
                          alertModal.showSuccess(
                            "Signature Copied",
                            "Signature copied to clipboard!"
                          );
                        }}
                        className="px-3 py-1 bg-cyan-500 text-white rounded text-sm hover:bg-cyan-600 transition-colors"
                      >
                        Copy Signature
                      </button>
                      <button
                        onClick={() => {
                          if (signatureData) {
                            setSignatureOverlay({
                              visible: true,
                              x: 200,
                              y: 200,
                            });
                            setSignaturePlaced(false);
                          }
                        }}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                      >
                        Place on Page {pageNumber}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Page Selection */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Select Page
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                    disabled={pageNumber <= 1}
                    className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ←
                  </button>
                  <span className="px-4 py-1 bg-gray-800 text-white rounded">
                    Page {pageNumber} of {totalPages || 1}
                  </span>
                  <button
                    onClick={() =>
                      setPageNumber(Math.min(totalPages || 1, pageNumber + 1))
                    }
                    disabled={pageNumber >= (totalPages || 1)}
                    className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    →
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <div>
                <button
                  onClick={addSignature}
                  disabled={!signatureData || !signaturePlaced || isProcessing}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isProcessing
                    ? "Adding Signature..."
                    : "Add Signature to PDF"}
                </button>
              </div>
            </div>

            {/* PDF Preview */}
            <div className="space-y-4">
              <h3 className="text-gray-300 text-lg font-medium">PDF Preview</h3>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className="relative bg-white rounded border-2 border-dashed border-gray-300 h-64 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <p className="text-sm">PDF Preview</p>
                    <p className="text-xs mt-1">Page {pageNumber}</p>
                  </div>

                  {/* Signature Overlay */}
                  {signatureOverlay.visible && signatureData && (
                    <div
                      className={`absolute border-2 bg-blue-50/20 select-none z-50 transition-none ${
                        isDragging ? "cursor-grabbing" : "cursor-grab"
                      }`}
                      style={{
                        left: signatureOverlay.x,
                        top: signatureOverlay.y,
                        width: 100,
                        height: 50,
                      }}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                    >
                      <img
                        src={signatureData}
                        alt="Signature Preview"
                        className="w-full h-full object-contain pointer-events-none"
                      />
                    </div>
                  )}
                </div>
                <p className="text-gray-400 text-xs mt-2 text-center">
                  Drag the signature to position it on the page
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Canvas Resize Handle */}
        <div
          className="absolute bottom-0 left-0 right-0 h-2 bg-gray-600/30 hover:bg-gray-500/50 cursor-ns-resize flex items-center justify-center group"
          onMouseDown={handleCanvasResizeStart}
        >
          <div className="w-8 h-1 bg-gray-400 group-hover:bg-gray-300 rounded-full"></div>
        </div>
      </div>

      {/* Results */}
      {result && result.type === "success" && (
        <div className="mt-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h3 className="text-white font-semibold text-lg">
              Signature Added Successfully!
            </h3>
            <button
              onClick={() => setShowSignedPdfViewer(true)}
              className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-white py-2 px-4 rounded-lg hover:from-cyan-500/30 hover:to-blue-500/30 transition-all duration-200 text-sm font-medium group"
            >
              <span className="font-medium">View</span>
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
        </div>
      )}

      {/* Signed PDF Viewer */}
      {showSignedPdfViewer && signedPdfUrl && (
        <div className="mt-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h3 className="text-white font-semibold text-lg">Signed PDF</h3>
            <button
              onClick={() => setShowSignedPdfViewer(false)}
              className="text-gray-400 hover:text-white"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="p-6">
            <div className="bg-white rounded-lg overflow-hidden">
              <iframe
                src={signedPdfUrl}
                className="w-full h-96"
                title="Signed PDF"
              />
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={() =>
                  openMonetizationModal(
                    `${uploadedFile?.name.replace(".pdf", "")}_signed.pdf`,
                    "PDF",
                    signedPdfUrl
                  )
                }
                className="flex items-center text-cyan-400 hover:text-cyan-300 group mx-auto"
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
          </div>
        </div>
      )}

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={alertModal.hideAlert}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        primaryButton={alertModal.primaryButton}
        secondaryButton={alertModal.secondaryButton}
      />

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

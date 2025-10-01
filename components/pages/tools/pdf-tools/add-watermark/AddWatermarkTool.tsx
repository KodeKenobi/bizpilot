"use client";

import React, { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { useMonetization } from "@/hooks/useMonetization";
import MonetizationModal from "@/components/ui/MonetizationModal";
import { useDraggableCanvas } from "@/hooks/useDraggableCanvas";

interface AddWatermarkToolProps {
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  result: any;
  setResult: (result: any) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  handleFileUpload: (file: File) => void;
}

export const AddWatermarkTool: React.FC<AddWatermarkToolProps> = ({
  uploadedFile,
  setUploadedFile,
  result,
  setResult,
  isProcessing,
  setIsProcessing,
  handleFileUpload,
}) => {
  const [watermarkText, setWatermarkText] = useState<string>("");
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [watermarkImageData, setWatermarkImageData] = useState<string>("");
  const [watermarkType, setWatermarkType] = useState<"text" | "image">("text");
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [watermarkPosition, setWatermarkPosition] = useState({
    x: 200,
    y: 200,
  });
  const [showWatermarkedPdfViewer, setShowWatermarkedPdfViewer] =
    useState(false);
  const [watermarkedPdfUrl, setWatermarkedPdfUrl] = useState<string | null>(
    null
  );

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setWatermarkImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setWatermarkImageData(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addWatermark = async () => {
    if (!uploadedFile) {
      setResult({
        type: "error",
        message: "Please upload a PDF file",
      });
      return;
    }

    if (watermarkType === "text" && !watermarkText) {
      setResult({
        type: "error",
        message: "Please enter watermark text",
      });
      return;
    }

    if (watermarkType === "image" && !watermarkImage) {
      setResult({
        type: "error",
        message: "Please upload a watermark image",
      });
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("pdf", uploadedFile);
      formData.append("page_number", pageNumber.toString());
      formData.append("x_position", watermarkPosition.x.toString());
      formData.append("y_position", watermarkPosition.y.toString());

      if (watermarkType === "text") {
        formData.append("watermark_text", watermarkText);
      } else {
        formData.append("watermark_image", watermarkImage!);
      }

      const response = await fetch("http://localhost:5000/add_watermark", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to add watermark");
      }

      const data = await response.json();
      setResult({
        type: "success",
        message: "Watermark added successfully!",
        data: data,
      });
      setWatermarkedPdfUrl(data.watermarked_pdf_url);
    } catch (error) {
      console.error("Error adding watermark:", error);
      setResult({
        type: "error",
        message: "Error adding watermark. Please try again.",
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
              Add Watermark to PDF
            </h3>
            <p className="text-gray-400 text-sm">
              Upload a PDF file to add a watermark
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
            <h3 className="text-white font-semibold text-lg">Add Watermark</h3>
            <span className="text-gray-400 text-sm">{uploadedFile?.name}</span>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Watermark Configuration */}
            <div className="space-y-6">
              <div>
                <h3 className="text-gray-300 text-lg font-medium mb-4">
                  Watermark Type
                </h3>
                <div className="flex gap-4 mb-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="text"
                      checked={watermarkType === "text"}
                      onChange={(e) =>
                        setWatermarkType(e.target.value as "text" | "image")
                      }
                      className="mr-2"
                    />
                    Text Watermark
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="image"
                      checked={watermarkType === "image"}
                      onChange={(e) =>
                        setWatermarkType(e.target.value as "text" | "image")
                      }
                      className="mr-2"
                    />
                    Image Watermark
                  </label>
                </div>

                {watermarkType === "text" ? (
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Watermark Text
                    </label>
                    <input
                      type="text"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      placeholder="Enter watermark text"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Watermark Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                    {watermarkImageData && (
                      <div className="mt-2">
                        <img
                          src={watermarkImageData}
                          alt="Watermark preview"
                          className="max-w-32 max-h-16 object-contain bg-white rounded"
                        />
                      </div>
                    )}
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

              {/* Position */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Position
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      X Position
                    </label>
                    <input
                      type="number"
                      value={watermarkPosition.x}
                      onChange={(e) =>
                        setWatermarkPosition({
                          ...watermarkPosition,
                          x: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Y Position
                    </label>
                    <input
                      type="number"
                      value={watermarkPosition.y}
                      onChange={(e) =>
                        setWatermarkPosition({
                          ...watermarkPosition,
                          y: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div>
                <button
                  onClick={addWatermark}
                  disabled={
                    isProcessing ||
                    (watermarkType === "text" && !watermarkText) ||
                    (watermarkType === "image" && !watermarkImage)
                  }
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isProcessing
                    ? "Adding Watermark..."
                    : "Add Watermark to PDF"}
                </button>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-4">
              <h3 className="text-gray-300 text-lg font-medium">Preview</h3>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className="relative bg-white rounded border-2 border-dashed border-gray-300 h-64 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <p className="text-sm">PDF Preview</p>
                    <p className="text-xs mt-1">Page {pageNumber}</p>
                  </div>

                  {/* Watermark Preview */}
                  {(watermarkText || watermarkImageData) && (
                    <div
                      className="absolute text-gray-400 opacity-50"
                      style={{
                        left: watermarkPosition.x,
                        top: watermarkPosition.y,
                      }}
                    >
                      {watermarkType === "text" ? (
                        <span className="text-lg font-bold">
                          {watermarkText}
                        </span>
                      ) : (
                        <img
                          src={watermarkImageData}
                          alt="Watermark preview"
                          className="max-w-16 max-h-16 object-contain"
                        />
                      )}
                    </div>
                  )}
                </div>
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
              Watermark Added Successfully!
            </h3>
            <button
              onClick={() => setShowWatermarkedPdfViewer(true)}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 text-sm flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              View PDF
            </button>
          </div>
        </div>
      )}

      {/* Watermarked PDF Viewer */}
      {showWatermarkedPdfViewer && watermarkedPdfUrl && (
        <div className="mt-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h3 className="text-white font-semibold text-lg">
              Watermarked PDF
            </h3>
            <button
              onClick={() => setShowWatermarkedPdfViewer(false)}
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
                src={watermarkedPdfUrl}
                className="w-full h-96"
                title="Watermarked PDF"
              />
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={() =>
                  openMonetizationModal(
                    `${uploadedFile?.name.replace(".pdf", "")}_watermarked.pdf`,
                    "PDF",
                    watermarkedPdfUrl
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

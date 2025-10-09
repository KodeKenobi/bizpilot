"use client";

import React, { useState } from "react";
import { PDFFileUpload } from "@/components/ui/PDFFileUpload";
import { useMonetization } from "@/hooks/useMonetization";
import MonetizationModal from "@/components/ui/MonetizationModal";
import { motion, AnimatePresence } from "framer-motion";

interface ExtractImagesToolProps {
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  result: any;
  setResult: (result: any) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  handleFileUpload: (file: File) => void;
}

export const ExtractImagesTool: React.FC<ExtractImagesToolProps> = ({
  uploadedFile,
  setUploadedFile,
  result,
  setResult,
  isProcessing,
  setIsProcessing,
  handleFileUpload,
}) => {
  const [selectedImage, setSelectedImage] = useState<any>(null);

  const [showImageModal, setShowImageModal] = useState(false);
  const {
    monetizationState,
    openMonetizationModal,
    closeMonetizationModal,
    handleAdComplete,
    handlePaymentComplete,
  } = useMonetization();

  const disableContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  const openImageModal = (img: any, index: number) => {
    setSelectedImage({ ...img, index });
    setShowImageModal(true);
  };

  const downloadSingleImage = (img: any, index: number) => {
    openMonetizationModal(
      `${uploadedFile?.name.replace(".pdf", "")}_page${img.page}_image${
        img.image_index
      }.png`,
      "PNG",
      `data:image/png;base64,${img.data}`
    );
  };

  const downloadAllImages = () => {
    if (!result?.data?.images || !uploadedFile) return;

    openMonetizationModal(
      `${uploadedFile.name.replace(".pdf", "")}_all_images.zip`,
      "ZIP",
      `/download_images/${uploadedFile.name}`
    );
  };

  if (!uploadedFile) {
    return (
      <PDFFileUpload
        title="Extract Images from PDF"
        description="Upload a PDF file to extract all images"
        onFileSelect={handleFileUpload}
        accept=".pdf"
      />
    );
  }

  return (
    <>
      {result && result.type === "success" && result.data && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center space-x-4">
              <h3 className="text-white font-semibold text-lg">
                Extracted Images
              </h3>
            </div>
          </div>

          <div className="p-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-400 text-sm">
                  Found {result.data.total_images || 0} images
                </p>
                <button
                  onClick={downloadAllImages}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 px-4 rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200 text-sm flex items-center gap-2"
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
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download All Images
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                {result.data.images?.map((img: any, index: number) => (
                  <div
                    key={index}
                    className="bg-gray-900/50 rounded-lg p-3 hover:bg-gray-900/70 transition-colors"
                  >
                    <div className="relative group/image">
                      <img
                        src={`data:image/png;base64,${img.data}`}
                        alt={`Image ${img.image_index} from page ${img.page}`}
                        className="w-full h-32 object-contain bg-white rounded cursor-pointer select-none"
                        onClick={() => openImageModal(img, index)}
                        onContextMenu={disableContextMenu}
                        style={{ userSelect: "none" }}
                        draggable={false}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover/image:bg-opacity-30 transition-all rounded flex items-center justify-center">
                        <button
                          onClick={() => openImageModal(img, index)}
                          className="opacity-0 group-hover/image:opacity-100 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 flex items-center gap-1"
                        >
                          <svg
                            className="w-3 h-3"
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
                          View
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 space-y-2">
                      <div className="space-y-1">
                        <p className="text-gray-400 text-xs">
                          Page {img.page}, Image {img.image_index}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {img.width} × {img.height}px
                        </p>
                      </div>
                      <button
                        onClick={() => downloadSingleImage(img, index)}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-1.5 px-3 rounded-lg text-xs font-medium hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 flex items-center justify-center gap-1"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowImageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-xl p-6 max-w-4xl max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-lg">
                  Image from Page {selectedImage.page}
                </h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      downloadSingleImage(selectedImage, selectedImage.index)
                    }
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
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Download Image
                  </button>
                  <button
                    onClick={() => setShowImageModal(false)}
                    className="text-gray-400 hover:text-white transition-colors"
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
              </div>

              <div className="bg-white rounded-lg p-4 flex justify-center">
                <img
                  src={`data:image/png;base64,${selectedImage.data}`}
                  alt={`Image ${selectedImage.image_index} from page ${selectedImage.page}`}
                  className="max-w-full max-h-[70vh] object-contain select-none"
                  onContextMenu={disableContextMenu}
                  style={{ userSelect: "none" }}
                  draggable={false}
                />
              </div>

              <div className="mt-4 text-center text-gray-400 text-sm">
                <p>
                  Dimensions: {selectedImage.width} × {selectedImage.height}px
                </p>
                <p>
                  Page {selectedImage.page}, Image {selectedImage.image_index}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

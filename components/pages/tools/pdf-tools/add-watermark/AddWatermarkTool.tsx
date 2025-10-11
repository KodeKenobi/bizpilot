"use client";

import React, { useState, useRef, useCallback } from "react";
import { useMonetization } from "@/hooks/useMonetization";
import { useAlertModal } from "@/hooks/useAlertModal";
import { PDFEditorLayout } from "@/components/ui/PDFEditorLayout";
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

interface AddWatermarkToolProps {
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

export const AddWatermarkTool: React.FC<AddWatermarkToolProps> = ({
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
  const [activeTool, setActiveTool] = useState<string>("image");
  const [editorUrl, setEditorUrl] = useState<string>("");
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [currentUploadStep, setCurrentUploadStep] = useState<number>(0);

  // Image upload state
  const [showImageModal, setShowImageModal] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // View and download flow state
  const [showViewModal, setShowViewModal] = useState(false);
  const [showViewButton, setShowViewButton] = useState(false);
  const [showDownloadButton, setShowDownloadButton] = useState(false);
  const [hasViewedPdf, setHasViewedPdf] = useState(false);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
        const totalDuration = 8000; // 8 seconds total for better UX
        const updateInterval = 100; // Update every 100ms for smoother feel
        const totalSteps = totalDuration / updateInterval;
        const progressIncrement = 100 / totalSteps;

        const updateProgress = () => {
          // Smooth, predictable progress increments with occasional pauses
          let increment = progressIncrement;

          // Add slight pauses at key milestones for realism
          if (
            (progress >= 20 && progress < 25) ||
            (progress >= 55 && progress < 60)
          ) {
            increment = progressIncrement * 0.3; // Slower progress at transitions
          }

          progress += increment;

          // Smooth step transitions based on progress
          if (progress >= 25 && step === 0) {
            step = 1;
            setCurrentUploadStep(1);
          } else if (progress >= 60 && step === 1) {
            step = 2;
            setCurrentUploadStep(2);
          }

          // Ensure progress doesn't exceed 100
          const clampedProgress = Math.min(progress, 100);
          setUploadProgress(clampedProgress);

          if (clampedProgress >= 100) {
            if (interval) {
              clearInterval(interval);
            }
            resolve();
          }
        };

        // Start with a delay for smoothness
        setTimeout(() => {
          interval = setInterval(updateProgress, updateInterval);
        }, 800);
      });
    };

    try {
      // Simulate realistic processing time
      await simulateProgress();

      // Brief pause before showing completion
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Save PDF file first, then convert using template
      const formData = new FormData();
      formData.append("pdf", uploadedFile);

      const uploadResponse = await fetch("/", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload PDF");
      }

      // Use the uploaded file name directly for the convert endpoint
      const filename = uploadedFile.name;

      // Get PDF info including page count
      const pdfInfoResponse = await fetch(`/api/pdf_info/${filename}`);
      if (pdfInfoResponse.ok) {
        const pdfInfo = await pdfInfoResponse.json();
        console.log("📄 PDF info:", pdfInfo);
        setTotalPages(pdfInfo.page_count);
      } else {
        console.warn("Failed to get PDF info, defaulting to 1 page");
        setTotalPages(1);
      }

      // Set the converted HTML URL using the original template approach
      setEditorUrl(`/convert/${filename}`);

      // Brief pause before showing completion
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("PDF conversion error:", error);
      alertModal.showError("Error", "Failed to process PDF");
    } finally {
      isProcessingRef.current = false;
      setIsProcessing(false);
    }
  }, [uploadedFile, setIsProcessing, alertModal]);

  // Auto-process document when file is uploaded
  React.useEffect(() => {
    if (uploadedFile && !editorUrl && !isProcessingRef.current) {
      handleProcessDocument();
    }
  }, [uploadedFile, editorUrl]);

  // Reset processing ref when component unmounts or file changes
  React.useEffect(() => {
    return () => {
      isProcessingRef.current = false;
    };
  }, [uploadedFile]);

  // Clean up when component unmounts or editorUrl changes
  React.useEffect(() => {
    return () => {
      // No cleanup needed for HTML URLs
    };
  }, [editorUrl]);

  // Reset processing ref when editorUrl changes (processing complete)
  React.useEffect(() => {
    if (editorUrl) {
      isProcessingRef.current = false;
    }
  }, [editorUrl]);

  // Handle zoom controls
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 25, 50));
  };

  const handleZoomReset = () => {
    setZoomLevel(100);
  };

  // Handle image file selection
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image upload and insertion
  const handleImageUpload = () => {
    if (selectedImage) {
      // Send image to iframe for insertion
      const iframe = document.querySelector(
        'iframe[title="PDF Editor"]'
      ) as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(
          {
            type: "INSERT_IMAGE",
            imageData: imagePreview,
            fileName: selectedImage.name,
          },
          "*"
        );
      }
      setShowImageModal(false);
      setSelectedImage(null);
      setImagePreview(null);
    }
  };

  // Handle tool selection
  const handleToolSelect = (toolId: string) => {
    console.log("🔧 Tool selected:", toolId);
    console.log("🔧 Previous active tool:", activeTool);

    // Handle undo/redo buttons
    if (toolId === "undo") {
      // Send message to iframe to perform undo
      const iframe = document.querySelector(
        'iframe[title="PDF Editor"]'
      ) as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ type: "UNDO" }, "*");
      }
      return;
    }

    if (toolId === "redo") {
      // Send message to iframe to perform redo
      const iframe = document.querySelector(
        'iframe[title="PDF Editor"]'
      ) as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ type: "REDO" }, "*");
      }
      return;
    }

    // Handle image tool - show image upload modal
    if (toolId === "image") {
      setShowImageModal(true);
      return;
    }

    setActiveTool(toolId);

    // Send message to iframe to set edit mode
    const iframe = document.querySelector(
      'iframe[title="PDF Editor"]'
    ) as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      console.log("📤 Sending SET_EDIT_MODE message to iframe:", toolId);
      iframe.contentWindow.postMessage(
        {
          type: "SET_EDIT_MODE",
          mode: toolId,
        },
        "*"
      );

      // If watermark tool is selected, send additional message to control modal behavior
      if (toolId === "watermark") {
        iframe.contentWindow.postMessage(
          {
            type: "CONFIGURE_WATERMARK_MODAL",
            showOnce: true,
          },
          "*"
        );
      }
      console.log("📤 Message sent successfully");
    } else {
      console.log("❌ Iframe not found or no contentWindow");
    }
  };

  // Listen for messages from iframe
  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log("📨 Message received from iframe:", event.data);

      if (event.data.type === "SAVE_COMPLETE") {
        console.log("✅ PDF saved successfully:", event.data.filename);
        alertModal.showSuccess("Success", "PDF saved successfully!");
      } else if (event.data.type === "PDF_GENERATED") {
        console.log("✅ PDF generation completed");
      } else if (event.data.type === "TEXT_ADDED") {
        console.log("📝 Text added:", event.data);
      } else if (event.data.type === "EDIT_MODE_SET") {
        console.log("🎯 Edit mode set in iframe:", event.data.mode);
        setActiveTool(event.data.mode);
      } else if (event.data.type === "WATERMARK_ADDED") {
        console.log("💧 Watermark added:", event.data);
      } else if (event.data.type === "PDF_GENERATED_FOR_PREVIEW") {
        console.log("📄 PDF generated for preview:", event.data.pdfUrl);

        // Convert blob URL to data URL for iframe compatibility
        console.log("📄 Converting blob to data URL for iframe...");
        fetch(event.data.pdfUrl)
          .then((response) => response.blob())
          .then((blob) => {
            const reader = new FileReader();
            reader.onload = () => {
              console.log("✅ Data URL ready for iframe");
              setGeneratedPdfUrl(reader.result as string);
            };
            reader.readAsDataURL(blob);
          })
          .catch((error) => {
            console.error("❌ Error converting blob:", error);
            setGeneratedPdfUrl(event.data.pdfUrl);
          });

        setShowViewButton(true); // Show View button
        setShowDownloadButton(true); // Show Download button
        setIsSaving(false); // Clear loading state
      } else {
        console.log("❓ Unknown message type:", event.data.type);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [alertModal]);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    console.log("📄 Changing to page:", pageNumber);
    setCurrentPage(pageNumber);

    // Send message to iframe to change page
    const iframe = document.querySelector(
      'iframe[title="PDF Editor"]'
    ) as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      console.log("📤 Sending CHANGE_PAGE message to iframe:", pageNumber);
      iframe.contentWindow.postMessage(
        {
          type: "CHANGE_PAGE",
          pageNumber: pageNumber,
        },
        "*"
      );
    } else {
      console.log("❌ Iframe not found for page change");
    }
  };

  // Generate page thumbnails
  const generatePageThumbnails = () => {
    if (!uploadedFile) return [];

    return Array.from({ length: totalPages }, (_, index) => ({
      pageNumber: index + 1,
      isActive: currentPage === index + 1,
      thumbnailUrl: `/api/pdf_thumbnail/${uploadedFile.name}/${index + 1}`,
      onClick: () => handlePageChange(index + 1),
    }));
  };

  // Handle save changes - show view button first
  const handleSaveChanges = () => {
    console.log("Save clicked - generating PDF for preview");
    setIsSaving(true);

    // Send message to iframe to generate PDF (without download)
    const iframe = document.querySelector(
      'iframe[title="PDF Editor"]'
    ) as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(
        {
          type: "GENERATE_PDF_FOR_PREVIEW",
        },
        "*"
      );
    }
  };

  // Handle view PDF
  const handleViewPdf = () => {
    console.log("🔍 Setting showViewModal to true");
    setShowViewModal(true);
    setHasViewedPdf(true);
  };

  // Handle close view modal
  const handleCloseViewModal = () => {
    setShowViewModal(false);
    // Keep both buttons visible after closing modal
  };

  // Handle download PDF (with monetization)
  const handleDownloadPdf = () => {
    console.log("📥 handleDownloadPdf called");
    console.log("📥 generatedPdfUrl:", generatedPdfUrl);
    console.log("📥 uploadedFile?.name:", uploadedFile?.name);

    if (generatedPdfUrl) {
      console.log("📥 Opening monetization modal");
      // Trigger monetization modal
      openMonetizationModal(
        uploadedFile?.name || "document",
        "pdf",
        generatedPdfUrl
      );
    } else {
      console.log("📥 No generatedPdfUrl, cannot download");
    }
  };

  // File upload state
  if (!uploadedFile) {
    return (
      <>
        <div className="w-full max-w-4xl mx-auto min-h-96 bg-gray-800/40 rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                Add Watermark to PDF
              </h2>
              <p className="text-gray-400">
                Upload a PDF file to add a watermark
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
  if (isProcessing && !editorUrl) {
    const steps = [
      {
        id: 0,
        title: "Uploading PDF",
        description: "Analyzing document and extracting elements...",
        completed: uploadProgress >= 25,
      },
      {
        id: 1,
        title: "Analyzing Structure",
        description: "Processing document layout with encryption...",
        completed: uploadProgress >= 60,
      },
      {
        id: 2,
        title: "Preparing Editor",
        description: "Setting up secure interface...",
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

  // Editor interface
  if (editorUrl) {
    return (
      <div data-editor-active="true">
        <div style={{ display: showViewModal ? "none" : "block" }}>
          <PDFEditorLayout
            title="Trevnoctilla"
            fileName={uploadedFile?.name}
            onBack={() => {
              setUploadedFile(null);
              setEditorUrl("");
              setActiveTool("select");
              setResult(null);
            }}
            onDone={() => {
              setUploadedFile(null);
              setEditorUrl("");
              setActiveTool("select");
              setResult(null);
            }}
            onSearch={() => {
              console.log("Search clicked");
            }}
            zoomLevel={zoomLevel}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onZoomReset={handleZoomReset}
            activeTool={activeTool}
            onToolSelect={handleToolSelect}
            hideDrawingTools={true}
            tools={[
              { id: "undo", name: "Undo", icon: "↶" },
              { id: "redo", name: "Redo", icon: "↷" },
              { id: "image", name: "Image", icon: "🖼" },
            ]}
            pages={generatePageThumbnails()}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onUploadNew={() => {
              setUploadedFile(null);
              setEditorUrl("");
              setResult(null);
            }}
            onSave={handleSaveChanges}
            isProcessing={isSaving}
            showViewButton={showViewButton}
            showDownloadButton={showDownloadButton}
            hasViewedPdf={hasViewedPdf}
            isInPreviewMode={false}
            onViewPdf={handleViewPdf}
            onDownloadPdf={handleDownloadPdf}
          >
            <div className="h-full w-full bg-gray-900 relative overflow-hidden">
              <div
                className="w-full h-full"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <iframe
                  src={editorUrl}
                  className="border-0"
                  title="PDF Editor"
                  style={{
                    width: "100vw",
                    height: "100vh",
                    transform: `scale(${Math.min(zoomLevel / 100, 0.8)})`,
                    transformOrigin: "center center",
                  }}
                />
              </div>
            </div>
          </PDFEditorLayout>
        </div>

        {/* PDF View Modal */}
        {showViewModal && generatedPdfUrl && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] w-full mx-4">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">Preview PDF</h3>
                <button
                  onClick={handleCloseViewModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="p-4">
                <div className="w-full h-[70vh] border border-gray-300 rounded-lg overflow-hidden">
                  <iframe
                    src={`${generatedPdfUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
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

        <MonetizationModal
          isOpen={monetizationState.isModalOpen}
          onClose={closeMonetizationModal}
          onAdComplete={handleAdComplete}
          onPaymentComplete={handlePaymentComplete}
          fileName={monetizationState.fileName}
          fileType={monetizationState.fileType}
        />

        {/* Image Upload Modal */}
        {showImageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">Upload Image</h3>
                <button
                  onClick={() => {
                    setShowImageModal(false);
                    setSelectedImage(null);
                    setImagePreview(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="p-4">
                {!selectedImage ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <div className="mb-4">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div className="mb-4">
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        Choose Image
                      </label>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </div>
                    <p className="text-gray-500 text-sm">
                      Select an image to add as watermark
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center">
                      {imagePreview && (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-w-full max-h-48 mx-auto rounded-lg"
                        />
                      )}
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setSelectedImage(null);
                          setImagePreview(null);
                        }}
                        className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Choose Different Image
                      </button>
                      <button
                        onClick={handleImageUpload}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Insert Image
                      </button>
                    </div>
                  </div>
                )}
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

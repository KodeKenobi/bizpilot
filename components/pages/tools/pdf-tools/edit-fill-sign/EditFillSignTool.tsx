"use client";

import React, { useState, useRef, useCallback } from "react";
import { useMonetization } from "@/hooks/useMonetization";
import { useAlertModal } from "@/hooks/useAlertModal";
import { SignatureCanvas } from "@/components/ui/signature-canvas";
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

// Types
interface TextElement {
  id: string;
  x: number;
  y: number;
  text: string;
  fontSize: number;
  color: string;
}

interface SignatureElement {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  signatureData: string;
}

interface ImageElement {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  src: string;
}

interface EditFillSignToolProps {
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

export const EditFillSignTool: React.FC<EditFillSignToolProps> = ({
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
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [signatureElements, setSignatureElements] = useState<
    SignatureElement[]
  >([]);
  const [imageElements, setImageElements] = useState<ImageElement[]>([]);
  const [activeTool, setActiveTool] = useState<string>("select");
  const [editorUrl, setEditorUrl] = useState<string>("");
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(125);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [currentUploadStep, setCurrentUploadStep] = useState<number>(0);

  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
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

      setEditorUrl(
        "data:text/html,<h1>PDF Editor Mock</h1><p>This is a mock PDF editor for demonstration purposes.</p>"
      );
      setTotalPages(1);

      // Brief pause before showing completion
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
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

  // Handle save changes
  const handleSaveChanges = () => {
    console.log("Save clicked");
  };

  // File upload state
  if (!uploadedFile) {
    return (
      <>
        <div className="w-full max-w-4xl mx-auto min-h-96 bg-gray-800/40 rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                Edit, Fill & Sign PDF
              </h2>
              <p className="text-gray-400">
                Upload a PDF to start editing, filling forms, and adding
                signatures
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

                  {/* Progress Line (except for last step) */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-4 top-8 w-0.5 h-12 bg-gray-600">
                      <div
                        className={`w-full transition-all duration-500 ${
                          step.completed ? "bg-green-500" : "bg-gray-600"
                        }`}
                        style={{ height: step.completed ? "100%" : "0%" }}
                      />
                    </div>
                  )}
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
        <PDFEditorLayout
          title="Trevnoctilla"
          fileName={uploadedFile?.name}
          onBack={() => {
            setUploadedFile(null);
            setEditorUrl("");
            setTextElements([]);
            setSignatureElements([]);
            setImageElements([]);
            setActiveTool("select");
            setResult(null);
          }}
          onDone={() => {
            setUploadedFile(null);
            setEditorUrl("");
            setTextElements([]);
            setSignatureElements([]);
            setImageElements([]);
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
          pages={generatePageThumbnails()}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onUploadNew={() => {
            setUploadedFile(null);
            setEditorUrl("");
            setResult(null);
          }}
          onSave={handleSaveChanges}
          isProcessing={isProcessing}
        >
          <div className="h-full w-full bg-white relative">
            <iframe
              src={editorUrl}
              className="w-full h-full border-0"
              title="PDF Editor"
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: "top left",
              }}
            />

            {/* Overlay Canvas for annotations */}
            <div
              ref={canvasRef}
              className="absolute inset-0 pointer-events-none"
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: "top left",
              }}
            >
              {/* Text elements */}
              {textElements.map((element) => (
                <div
                  key={element.id}
                  className="absolute pointer-events-auto"
                  style={{
                    left: element.x,
                    top: element.y,
                    fontSize: element.fontSize,
                    color: element.color,
                  }}
                >
                  {element.text}
                </div>
              ))}

              {/* Signature elements */}
              {signatureElements.map((element) => (
                <div
                  key={element.id}
                  className="absolute pointer-events-auto"
                  style={{
                    left: element.x,
                    top: element.y,
                    width: element.width,
                    height: element.height,
                  }}
                >
                  <img
                    src={element.signatureData}
                    alt="Signature"
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}

              {/* Image elements */}
              {imageElements.map((element) => (
                <div
                  key={element.id}
                  className="absolute pointer-events-auto"
                  style={{
                    left: element.x,
                    top: element.y,
                    width: element.width,
                    height: element.height,
                  }}
                >
                  <img
                    src={element.src}
                    alt="Image"
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
            </div>

            {/* Tool-specific overlays */}
            {activeTool === "signature" && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg">
                  <h3 className="font-semibold mb-2">Add Signature</h3>
                  <SignatureCanvas
                    onSignatureChange={(signatureData: string) => {
                      console.log("Signature saved:", signatureData);
                    }}
                  />
                </div>
              </div>
            )}

            {activeTool === "image" && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg">
                  <h3 className="font-semibold mb-2">Add Image</h3>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const src = event.target?.result as string;
                          const newImage: ImageElement = {
                            id: Date.now().toString(),
                            x: 100,
                            y: 100,
                            width: 200,
                            height: 150,
                            src,
                          };
                          setImageElements((prev) => [...prev, newImage]);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="mb-2"
                  />
                  <p className="text-sm text-gray-600">
                    Click on the PDF to place the image
                  </p>
                </div>
              </div>
            )}
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

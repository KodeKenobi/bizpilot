"use client";

import React, { useState, useRef, useCallback } from "react";
import { useAlertModal } from "@/hooks/useAlertModal";
import AlertModal from "@/components/ui/AlertModal";
import { SignatureCanvas } from "@/components/ui/signature-canvas";
import { PDFEditorLayout } from "@/components/ui/PDFEditorLayout";
import { PDFProcessingModal } from "@/components/ui/PDFProcessingModal";
import { useMonetization } from "@/contexts/MonetizationProvider";
import { getApiUrl } from "@/lib/config";

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

interface AddSignatureToolProps {
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

export const AddSignatureTool: React.FC<AddSignatureToolProps> = ({
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
  const [signatureData, setSignatureData] = useState<string>("");
  const [activeTool, setActiveTool] = useState<string>("sign");
  const [editorUrl, setEditorUrl] = useState<string>("");
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [currentUploadStep, setCurrentUploadStep] = useState<number>(0);
  const [uploadedFilename, setUploadedFilename] = useState<string>("");

  // View and download flow state
  const [showViewModal, setShowViewModal] = useState(false);
  const [showViewButton, setShowViewButton] = useState(false);
  const [showDownloadButton, setShowDownloadButton] = useState(false);
  const [hasViewedPdf, setHasViewedPdf] = useState(false);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    id: string;
    message: string;
  } | null>(null);

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

      const uploadResponse = await fetch(`${getApiUrl("")}/api/upload`, {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        
        throw new Error("Failed to upload PDF");
      }

      // Get the unique filename from the upload response
      const uploadData = await uploadResponse.json();
      const filename = uploadData.filename || uploadedFile.name;
      setUploadedFilename(filename);
      

      // Get PDF info including page count
      
      const pdfInfoResponse = await fetch(
        `${getApiUrl("")}/api/pdf_info/${encodeURIComponent(filename)}`
      );
      if (pdfInfoResponse.ok) {
        const pdfInfo = await pdfInfoResponse.json();
        
        setTotalPages(pdfInfo.page_count);
      } else {
        
        setTotalPages(1);
      }

      // Set the converted HTML URL using the backend API URL
      setEditorUrl(`${getApiUrl("")}/convert/${encodeURIComponent(filename)}`);

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

  // Handle tool selection
  const handleToolSelect = (toolId: string) => {
    
    

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

    setActiveTool(toolId);

    // Send message to iframe to set edit mode
    const iframe = document.querySelector(
      'iframe[title="PDF Editor"]'
    ) as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      
      iframe.contentWindow.postMessage(
        {
          type: "SET_EDIT_MODE",
          mode: toolId,
        },
        "*"
      );

      // If signature tool is selected, send additional message to control modal behavior
      if (toolId === "sign") {
        iframe.contentWindow.postMessage(
          {
            type: "CONFIGURE_SIGNATURE_MODAL",
            showOnce: true,
          },
          "*"
        );
      }
      
    } else {
      
    }
  };

  // Listen for messages from iframe
  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      

      if (event.data.type === "SAVE_COMPLETE") {
        
        alertModal.showSuccess("Success", "PDF saved successfully!");
      } else if (event.data.type === "PDF_GENERATED") {
        
      } else if (event.data.type === "TEXT_ADDED") {
        
      } else if (event.data.type === "EDIT_MODE_SET") {
        
        setActiveTool(event.data.mode);
      } else if (event.data.type === "SIGNATURE_ADDED") {
        
      } else if (event.data.type === "PDF_GENERATED_FOR_PREVIEW") {
        

        // Convert blob URL to data URL for iframe compatibility
        
        fetch(event.data.pdfUrl)
          .then((response) => response.blob())
          .then((blob) => {
            const reader = new FileReader();
            reader.onload = () => {
              
              setGeneratedPdfUrl(reader.result as string);
            };
            reader.readAsDataURL(blob);
          })
          .catch((error) => {
            
            setGeneratedPdfUrl(event.data.pdfUrl);
          });

        setShowViewButton(true); // Show View button
        setShowDownloadButton(true); // Show Download button
        setIsSaving(false); // Clear loading state
      } else if (event.data.type === "SHOW_CONFIRMATION") {
        
        setConfirmationModal({
          isOpen: true,
          id: event.data.id,
          message: event.data.message,
        });
      } else {
        
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [alertModal]);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    
    setCurrentPage(pageNumber);

    // Send message to iframe to change page
    const iframe = document.querySelector(
      'iframe[title="PDF Editor"]'
    ) as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      
      iframe.contentWindow.postMessage(
        {
          type: "CHANGE_PAGE",
          pageNumber: pageNumber,
        },
        "*"
      );
    } else {
      
    }
  };

  // Generate page thumbnails
  const generatePageThumbnails = () => {
    if (!uploadedFile) return [];

    return Array.from({ length: totalPages }, (_, index) => ({
      pageNumber: index + 1,
      isActive: currentPage === index + 1,
      thumbnailUrl: `${getApiUrl("")}/api/pdf_thumbnail/${encodeURIComponent(
        uploadedFilename || uploadedFile.name
      )}/${index + 1}`,
      onClick: () => handlePageChange(index + 1),
    }));
  };

  // Handle save changes - show view button first
  const handleSaveChanges = () => {
    
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
    
    setShowViewModal(true);
    setHasViewedPdf(true);
  };

  // Handle close view modal
  const handleCloseViewModal = () => {
    setShowViewModal(false);
    // Keep both buttons visible after closing modal
  };

  // Handle download PDF (with monetization)
  const handleDownloadPdf = async () => {
    
    
    

    if (generatedPdfUrl) {
      const completed = await showMonetizationModal({
        title: "Download PDF",
        message: `Choose how you'd like to download ${
          uploadedFile?.name || "this PDF"
        }`,
        fileName: uploadedFile?.name || "document.pdf",
        fileType: "PDF",
        downloadUrl: generatedPdfUrl,
      });

      if (completed) {
        window.open(generatedPdfUrl, "_blank");
      }
    } else {
      
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
                Add Digital Signature to PDF
              </h2>
              <p className="text-gray-400">
                Upload a PDF file to add your digital signature
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

  // Processing state - show modal instead of inline progress
  if (isProcessing && !editorUrl) {
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
                Add Digital Signature to PDF
              </h2>
              <p className="text-gray-400">
                Upload a PDF file to add your digital signature
              </p>
            </div>
          </div>
        </div>
      </>
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
              setActiveTool("sign");
              setResult(null);
            }}
            onDone={() => {
              setUploadedFile(null);
              setEditorUrl("");
              setActiveTool("sign");
              setResult(null);
            }}
            onSearch={() => {
              
            }}
            zoomLevel={zoomLevel}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onZoomReset={handleZoomReset}
            activeTool={activeTool}
            onToolSelect={handleToolSelect}
            tools={[{ id: "sign", name: "Sign", icon: "✍" }]}
            hideDrawingTools={true}
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
            <div className="h-full w-full bg-gray-900 relative overflow-auto">
              <div
                style={{
                  width: `${Math.min(100 * (100 / zoomLevel), 100)}%`,
                  height: `${Math.min(100 * (100 / zoomLevel), 100)}%`,
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
                    width: "100%",
                    height: "100%",
                    transform: `scale(${zoomLevel / 100})`,
                    transformOrigin: "center center",
                  }}
                />
              </div>
            </div>
          </PDFEditorLayout>
        </div>

        {/* PDF View Modal - Mobile Responsive */}
        {showViewModal && generatedPdfUrl && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-1 sm:p-4">
            <div className="bg-white rounded-lg shadow-xl w-full h-full max-w-full max-h-full flex flex-col">
              <div className="flex items-center justify-between p-2 sm:p-4 border-b">
                <h3 className="text-lg sm:text-xl font-semibold">
                  Preview PDF
                </h3>
                <button
                  onClick={handleCloseViewModal}
                  className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="flex-1 p-1 sm:p-4 overflow-hidden">
                <div className="w-full h-full border border-gray-300 rounded-lg overflow-hidden">
                  <iframe
                    src={`${generatedPdfUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                    className="w-full h-full border-0"
                    title="PDF Preview"
                    style={{
                      pointerEvents: "auto",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {confirmationModal && (
          <AlertModal
            isOpen={confirmationModal.isOpen}
            onClose={() => {
              // Send cancel response
              const iframe = document.querySelector(
                'iframe[title="PDF Editor"]'
              ) as HTMLIFrameElement;
              if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage(
                  {
                    type: "CONFIRMATION_RESPONSE",
                    id: confirmationModal.id,
                    confirmed: false,
                  },
                  "*"
                );
              }
              setConfirmationModal(null);
            }}
            title="Confirm Action"
            message={confirmationModal.message}
            type="warning"
            primaryButton={{
              text: "Cancel",
              onClick: () => {
                // Send cancel response
                const iframe = document.querySelector(
                  'iframe[title="PDF Editor"]'
                ) as HTMLIFrameElement;
                if (iframe && iframe.contentWindow) {
                  iframe.contentWindow.postMessage(
                    {
                      type: "CONFIRMATION_RESPONSE",
                      id: confirmationModal.id,
                      confirmed: false,
                    },
                    "*"
                  );
                }
                setConfirmationModal(null);
              },
              variant: "secondary",
            }}
            secondaryButton={{
              text: "Confirm",
              onClick: () => {
                // Send confirm response
                const iframe = document.querySelector(
                  'iframe[title="PDF Editor"]'
                ) as HTMLIFrameElement;
                if (iframe && iframe.contentWindow) {
                  iframe.contentWindow.postMessage(
                    {
                      type: "CONFIRMATION_RESPONSE",
                      id: confirmationModal.id,
                      confirmed: true,
                    },
                    "*"
                  );
                }
                setConfirmationModal(null);
              },
              variant: "danger",
            }}
            showCloseButton={false}
          />
        )}

        {/* Monetization removed - using Google AdSense only */}
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

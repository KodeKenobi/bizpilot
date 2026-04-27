"use client";

import React, { useState, useRef, useCallback } from "react";
import { useAlertModal } from "@/hooks/useAlertModal";
import AlertModal from "@/components/ui/AlertModal";
import { MobilePDFEditorLayout } from "@/components/ui/MobilePDFEditorLayout";
import { PDFProcessingModal } from "@/components/ui/PDFProcessingModal";
import { useMonetization } from "@/contexts/MonetizationProvider";
import { getApiUrl } from "@/lib/config";

interface MobileEditPdfToolProps {
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

export const MobileEditPdfTool: React.FC<MobileEditPdfToolProps> = ({
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
  const [activeTool, setActiveTool] = useState<string>("edit-text");
  const [editorUrl, setEditorUrl] = useState<string>("");
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadedFilename, setUploadedFilename] = useState<string>("");

  // Zoom state
  const [zoomLevel, setZoomLevel] = useState<number>(1.0); // 1.0 = 100%

  // View and download flow state
  const [showViewModal, setShowViewModal] = useState(false);
  const [showViewButton, setShowViewButton] = useState(false); // Show after save
  const [showDownloadButton, setShowDownloadButton] = useState(false); // Show after view
  const [hasViewedPdf, setHasViewedPdf] = useState(false);

  // Confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    id: string;
    message: string;
  } | null>(null);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Refs
  const isProcessingRef = useRef<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

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
        const totalDuration = 8000;
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
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Upload PDF
      
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
      setUploadedFilename(filename);
      

      // Get PDF info
      const pdfInfoResponse = await fetch(
        `${getApiUrl("")}/api/pdf_info/${encodeURIComponent(filename)}`
      );
      if (pdfInfoResponse.ok) {
        const pdfInfo = await pdfInfoResponse.json();
        setTotalPages(pdfInfo.page_count);
      } else {
        setTotalPages(1);
      }

      // Set editor URL - try without mobile parameter first, backend may not support it
      const cacheBuster = Date.now();
      // Note: Backend convert endpoint may not support mobile parameter
      // Mobile-specific URL with mobile parameter
      setEditorUrl(
        `${getApiUrl("")}/convert/${encodeURIComponent(
          filename
        )}?v=${cacheBuster}&mobile=true`
      );

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
  }, [uploadedFile, editorUrl, handleProcessDocument]);

  // Handle tool selection
  const handleToolSelect = (toolId: string) => {
    setActiveTool(toolId);

    const iframe = iframeRef.current;
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(
        {
          type: "SET_EDIT_MODE",
          mode: toolId,
        },
        "*"
      );
    }
  };

  // Listen for messages from iframe
  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "SAVE_COMPLETE") {
        alertModal.showSuccess("Success", "PDF saved successfully!");
      } else if (event.data.type === "PDF_GENERATED_FOR_PREVIEW") {
        setGeneratedPdfUrl(event.data.pdfUrl);
        setShowViewButton(true); // Show Preview button after save
        setShowDownloadButton(false); // Don't show Download until user views
        setIsSaving(false);
      } else if (event.data.type === "EDIT_MODE_SET") {
        setActiveTool(event.data.mode);
      } else if (event.data.type === "SHOW_CONFIRMATION") {
        
        setConfirmationModal({
          isOpen: true,
          id: event.data.id,
          message: event.data.message,
        });
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [alertModal]);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);

    // Send message to iframe to change page
    const iframe = iframeRef.current;
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(
        {
          type: "CHANGE_PAGE",
          pageNumber: pageNumber,
        },
        "*"
      );
    }
  };

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => {
      const newZoom = Math.min(prev + 0.25, 3.0); // Max 300%
      const iframe = iframeRef.current;
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage(
          {
            type: "MOBILE_ZOOM",
            zoom: newZoom,
          },
          "*"
        );
      }
      return newZoom;
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => {
      const newZoom = Math.max(prev - 0.25, 0.25); // Min 25%
      const iframe = iframeRef.current;
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage(
          {
            type: "MOBILE_ZOOM",
            zoom: newZoom,
          },
          "*"
        );
      }
      return newZoom;
    });
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoomLevel(1.0);
    const iframe = iframeRef.current;
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(
        {
          type: "MOBILE_ZOOM",
          zoom: 1.0,
        },
        "*"
      );
    }
  }, []);

  // Send initial zoom and edit mode when iframe loads
  React.useEffect(() => {
    if (editorUrl && iframeRef.current?.contentWindow) {
      const initializeEditor = () => {
        if (iframeRef.current?.contentWindow) {
          // Send initial zoom
          iframeRef.current.contentWindow.postMessage(
            {
              type: "MOBILE_ZOOM",
              zoom: zoomLevel,
            },
            "*"
          );

          // Send initial edit mode (edit-text)
          iframeRef.current.contentWindow.postMessage(
            {
              type: "SET_EDIT_MODE",
              mode: "edit-text",
            },
            "*"
          );
        }
      };
      const timeoutId = setTimeout(initializeEditor, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [editorUrl, zoomLevel]);

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

  // Handle save changes
  const handleSaveChanges = () => {
    setIsSaving(true);

    const iframe = iframeRef.current;
    if (iframe?.contentWindow) {
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
    setShowDownloadButton(true); // Show Download button after user views
  };

  // Handle close view modal
  const handleCloseViewModal = () => {
    setShowViewModal(false);
  };

  // Handle download PDF
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
    }
  };

  // File upload state
  if (!uploadedFile) {
    return (
      <div className="w-full max-w-4xl mx-auto min-h-96 bg-gray-800/40 rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              Edit PDF Content
            </h2>
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
                htmlFor="mobile-file-upload"
                className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Choose PDF File
              </label>
              <input
                id="mobile-file-upload"
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
                Edit PDF Content
              </h2>
              <p className="text-gray-400">
                Upload a PDF file to start editing
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
          <MobilePDFEditorLayout
            title="Trevnoctilla"
            fileName={uploadedFile?.name}
            instructionText="💡 Click on any text in the document to edit it"
            onBack={() => {
              setUploadedFile(null);
              setEditorUrl("");
              setActiveTool("edit-text");
              setResult(null);
            }}
            activeTool={activeTool}
            onToolSelect={handleToolSelect}
            tools={[{ id: "edit-text", name: "Edit Text", icon: "✏" }]}
            pages={generatePageThumbnails()}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            zoomLevel={zoomLevel}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onZoomReset={handleZoomReset}
            onSave={handleSaveChanges}
            isProcessing={isSaving}
            showViewButton={showViewButton}
            showDownloadButton={showDownloadButton}
            hasViewedPdf={hasViewedPdf}
            onViewPdf={handleViewPdf}
            onDownloadPdf={handleDownloadPdf}
          >
            {/* PDF Editor - Mobile Optimized */}
            <div
              className="w-full h-full"
              style={{
                display: "block",
                overflow: "hidden",
                width: "100%",
                height: "100%",
                margin: 0,
                padding: 0,
                position: "relative",
              }}
            >
              <iframe
                ref={iframeRef}
                src={editorUrl}
                className="border-0"
                title="PDF Editor"
                style={{
                  display: "block",
                  width: "100%",
                  height: "100%",
                  margin: 0,
                  padding: 0,
                  border: "none",
                  position: "absolute",
                  top: 0,
                  left: 0,
                }}
                onLoad={() => {
                  // Document loaded - initialize edit mode
                  if (iframeRef.current?.contentWindow) {
                    // Send initial edit mode
                    setTimeout(() => {
                      if (iframeRef.current?.contentWindow) {
                        iframeRef.current.contentWindow.postMessage(
                          {
                            type: "SET_EDIT_MODE",
                            mode: "edit-text",
                          },
                          "*"
                        );
                        
                      }
                    }, 1000);
                  }
                }}
                onError={async () => {
                  
                  // Try to fetch error details
                  if (editorUrl) {
                    try {
                      const response = await fetch(editorUrl);
                      let errorData;
                      try {
                        errorData = await response.json();
                      } catch {
                        const errorText = await response.text();
                        errorData = { error: errorText };
                      }
                      
                      alertModal.showError(
                        "Error Loading PDF",
                        errorData.error ||
                          `Failed to load PDF: ${response.status}`
                      );
                    } catch (err) {
                      
                      alertModal.showError(
                        "Error",
                        "Failed to load PDF document. Please check backend console for details."
                      );
                    }
                  }
                }}
              />
            </div>
          </MobilePDFEditorLayout>
        </div>

        {/* PDF View Modal - Mobile Responsive */}
        {showViewModal && generatedPdfUrl && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-1">
            <div className="bg-white rounded-lg shadow-xl w-full h-full max-w-full max-h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">PDF Preview</h3>
                <button
                  onClick={handleCloseViewModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="flex-1 p-4 overflow-hidden">
                <div className="w-full h-full border border-gray-300 rounded-lg overflow-hidden">
                  <iframe
                    src={
                      generatedPdfUrl.startsWith("data:")
                        ? generatedPdfUrl
                        : generatedPdfUrl.startsWith("blob:")
                        ? generatedPdfUrl
                        : `${generatedPdfUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`
                    }
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
              const iframe = iframeRef.current;
              if (iframe?.contentWindow) {
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
                const iframe = iframeRef.current;
                if (iframe?.contentWindow) {
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
                const iframe = iframeRef.current;
                if (iframe?.contentWindow) {
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
      </div>
    );
  }

  return null;
};

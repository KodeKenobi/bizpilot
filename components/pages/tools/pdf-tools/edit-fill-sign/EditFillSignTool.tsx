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
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [currentUploadStep, setCurrentUploadStep] = useState<number>(0);
  const [isResizing, setIsResizing] = useState(false);
  const [resizingElement, setResizingElement] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  // Undo/Redo state
  const [undoStack, setUndoStack] = useState<
    Array<{
      textElements: TextElement[];
      signatureElements: SignatureElement[];
      imageElements: ImageElement[];
    }>
  >([]);
  const [redoStack, setRedoStack] = useState<
    Array<{
      textElements: TextElement[];
      signatureElements: SignatureElement[];
      imageElements: ImageElement[];
    }>
  >([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

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

  // Handle tool selection
  const handleToolSelect = (toolId: string) => {
    console.log("🔧 Tool selected:", toolId);
    console.log("🔧 Previous active tool:", activeTool);
    console.log("🔧 Tool type check - is sign tool:", toolId === "sign");

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
      console.log("📤 Sending SET_EDIT_MODE message to iframe:", toolId);
      console.log("📤 Iframe found:", iframe);
      console.log("📤 Iframe contentWindow:", iframe.contentWindow);
      console.log("📤 Iframe src:", iframe.src);
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
      console.log("📤 Message sent successfully");
    } else {
      console.log("❌ Iframe not found or no contentWindow");
      console.log("❌ Iframe element:", iframe);
      console.log("❌ Available iframes:", document.querySelectorAll("iframe"));
    }
  };

  // Listen for messages from iframe
  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log("📨 Message received from iframe:", event.data);

      if (event.data.type === "SAVE_COMPLETE") {
        console.log("✅ PDF saved successfully:", event.data.filename);
        // Handle save completion - could show success message or redirect
        alertModal.showSuccess("Success", "PDF saved successfully!");
      } else if (event.data.type === "PDF_GENERATED") {
        console.log("✅ PDF generation completed");
        // Handle PDF generation completion
      } else if (event.data.type === "TEXT_ADDED") {
        console.log("📝 Text added:", event.data);
        console.log("📝 Text content:", event.data.text);
        console.log("📝 Text position:", event.data.x, event.data.y);
        console.log("📝 Text formatting:", {
          fontFamily: event.data.fontFamily,
          fontSize: event.data.fontSize,
          color: event.data.color,
          fontWeight: event.data.fontWeight,
          fontStyle: event.data.fontStyle,
        });
      } else if (event.data.type === "EDIT_MODE_SET") {
        console.log("🎯 Edit mode set in iframe:", event.data.mode);
        console.log("🎯 Previous React active tool:", activeTool);
        // Update the active tool in React to match iframe state
        setActiveTool(event.data.mode);
        console.log("🎯 React active tool updated to:", event.data.mode);
      } else if (event.data.type === "SIGNATURE_ADDED") {
        console.log("✍️ Signature added:", event.data);
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

  // Handle save changes
  const handleSaveChanges = () => {
    console.log("Save clicked - triggering PDF generation");

    // Send message to iframe to generate and download PDF
    const iframe = document.querySelector(
      'iframe[title="PDF Editor"]'
    ) as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(
        {
          type: "GENERATE_AND_DOWNLOAD_PDF",
        },
        "*"
      );
    }
  };

  // Handle canvas click for adding elements
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log("🖱️ Canvas clicked, activeTool:", activeTool);

    if (activeTool === "text") {
      console.log("📝 Adding text element...");
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left) / (zoomLevel / 100);
        const y = (e.clientY - rect.top) / (zoomLevel / 100);

        console.log("📍 Click position:", { x, y, zoomLevel });

        const newText: TextElement = {
          id: Date.now().toString(),
          x,
          y,
          text: "New Text",
          fontSize: 16,
          color: "#000000",
        };
        console.log("➕ Adding text element:", newText);
        setTextElements((prev) => [...prev, newText]);
      } else {
        console.log("❌ Canvas ref not found");
      }
    } else if (activeTool === "image") {
      console.log("🖼️ Image tool active, but handling is in overlay");
    } else {
      console.log("ℹ️ Other tool active:", activeTool);
    }
  };

  // Handle dragging elements
  const handleElementDrag = (
    elementId: string,
    type: "text" | "signature" | "image"
  ) => {
    return (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const startX = e.clientX;
      const startY = e.clientY;

      // Get initial position of the element
      let initialX = 0;
      let initialY = 0;

      if (type === "text") {
        const element = textElements.find((el) => el.id === elementId);
        if (element) {
          initialX = element.x;
          initialY = element.y;
        }
      } else if (type === "signature") {
        const element = signatureElements.find((el) => el.id === elementId);
        if (element) {
          initialX = element.x;
          initialY = element.y;
        }
      } else if (type === "image") {
        const element = imageElements.find((el) => el.id === elementId);
        if (element) {
          initialX = element.x;
          initialY = element.y;
        }
      }

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = (moveEvent.clientX - startX) / (zoomLevel / 100);
        const deltaY = (moveEvent.clientY - startY) / (zoomLevel / 100);

        const newX = initialX + deltaX;
        const newY = initialY + deltaY;

        if (type === "text") {
          setTextElements((prev) =>
            prev.map((el) =>
              el.id === elementId ? { ...el, x: newX, y: newY } : el
            )
          );
        } else if (type === "signature") {
          setSignatureElements((prev) =>
            prev.map((el) =>
              el.id === elementId ? { ...el, x: newX, y: newY } : el
            )
          );
        } else if (type === "image") {
          setImageElements((prev) =>
            prev.map((el) =>
              el.id === elementId ? { ...el, x: newX, y: newY } : el
            )
          );
        }
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };
  };

  // Handle resizing signature elements
  const handleSignatureResize = (elementId: string) => {
    return (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const element = signatureElements.find((el) => el.id === elementId);
      if (!element) return;

      setIsResizing(true);
      setResizingElement(elementId);
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: element.width,
        height: element.height,
      });

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!isResizing || resizingElement !== elementId) return;

        const deltaX = (moveEvent.clientX - resizeStart.x) / (zoomLevel / 100);
        const deltaY = (moveEvent.clientY - resizeStart.y) / (zoomLevel / 100);

        const newWidth = Math.max(
          50,
          Math.min(300, resizeStart.width + deltaX)
        );
        const newHeight = Math.max(
          25,
          Math.min(150, resizeStart.height + deltaY)
        );

        setSignatureElements((prev) =>
          prev.map((el) =>
            el.id === elementId
              ? { ...el, width: newWidth, height: newHeight }
              : el
          )
        );
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        setResizingElement(null);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };
  };

  // Undo/Redo helper functions
  const saveStateToUndoStack = () => {
    const currentState = {
      textElements: [...textElements],
      signatureElements: [...signatureElements],
      imageElements: [...imageElements],
    };

    setUndoStack((prev) => [...prev, currentState]);
    setRedoStack([]); // Clear redo stack when new action is performed
    setCanUndo(true);
    setCanRedo(false);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;

    const currentState = {
      textElements: [...textElements],
      signatureElements: [...signatureElements],
      imageElements: [...imageElements],
    };

    const previousState = undoStack[undoStack.length - 1];

    // Move current state to redo stack
    setRedoStack((prev) => [...prev, currentState]);

    // Restore previous state
    setTextElements(previousState.textElements);
    setSignatureElements(previousState.signatureElements);
    setImageElements(previousState.imageElements);

    // Remove the state we just used from undo stack
    setUndoStack((prev) => prev.slice(0, -1));

    // Update button states
    setCanUndo(undoStack.length > 1);
    setCanRedo(true);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;

    const currentState = {
      textElements: [...textElements],
      signatureElements: [...signatureElements],
      imageElements: [...imageElements],
    };

    const nextState = redoStack[redoStack.length - 1];

    // Move current state to undo stack
    setUndoStack((prev) => [...prev, currentState]);

    // Restore next state
    setTextElements(nextState.textElements);
    setSignatureElements(nextState.signatureElements);
    setImageElements(nextState.imageElements);

    // Remove the state we just used from redo stack
    setRedoStack((prev) => prev.slice(0, -1));

    // Update button states
    setCanUndo(true);
    setCanRedo(redoStack.length > 1);
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
          <div className="h-full w-full bg-white relative overflow-auto">
            <div
              className="relative"
              style={{
                width: `${100 / (zoomLevel / 100)}%`,
                height: `${100 / (zoomLevel / 100)}%`,
                minWidth: "100%",
                minHeight: "100%",
              }}
            >
              <iframe
                src={editorUrl}
                className="w-full h-full border-0"
                title="PDF Editor"
                style={{
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: "top left",
                }}
              />
            </div>
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

"use client";

import React, { useState, useRef } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { SignatureCanvas } from "@/components/ui/signature-canvas";
import { useMonetization } from "@/hooks/useMonetization";
import MonetizationModal from "@/components/ui/MonetizationModal";
import { useAlertModal } from "@/hooks/useAlertModal";
import AlertModal from "@/components/ui/AlertModal";
import { useDraggableCanvas } from "@/hooks/useDraggableCanvas";

interface EditFillSignToolProps {
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  result: any;
  setResult: (result: any) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  handleFileUpload: (file: File) => void;
}

interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  page: number;
  fontSize: number;
  color: string;
  width: number;
  height: number;
}

interface SignatureElement {
  id: string;
  data: string;
  x: number;
  y: number;
  page: number;
  width: number;
  height: number;
}

interface ImageElement {
  id: string;
  data: string;
  x: number;
  y: number;
  page: number;
  width: number;
  height: number;
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
  const [signatureData, setSignatureData] = useState<string>("");
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [signatureElements, setSignatureElements] = useState<
    SignatureElement[]
  >([]);
  const [imageElements, setImageElements] = useState<ImageElement[]>([]);
  const [editingSignatureId, setEditingSignatureId] = useState<string | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTool, setActiveTool] = useState<
    "text" | "signature" | "image" | null
  >(null);
  const [newText, setNewText] = useState("");
  const [fontSize, setFontSize] = useState(12);
  const [textColor, setTextColor] = useState("#000000");
  const [imageData, setImageData] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragType, setDragType] = useState<
    "text" | "signature" | "image" | null
  >(null);
  const [dragIndex, setDragIndex] = useState(-1);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [editorUrl, setEditorUrl] = useState("");

  const canvasRef = useRef<HTMLDivElement>(null);

  const { canvasHeight, handleCanvasResizeStart } = useDraggableCanvas({
    initialHeight: 700,
    minHeight: 400,
    maxHeight: 1200,
  });

  // Auto-process document when file is uploaded
  React.useEffect(() => {
    if (uploadedFile && !editorUrl) {
      handleProcessDocument();
    }
  }, [uploadedFile]);

  // Add global mouse event listeners for dragging
  React.useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging || isResizing) {
        handleMouseMove(e as any);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging || isResizing) {
        handleMouseUp();
      }
    };

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isDragging, isResizing]);

  const handleProcessDocument = async () => {
    if (!uploadedFile) {
      alertModal.showError("No File", "Please upload a PDF file first");
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      setTotalPages(1);
      setEditorUrl(`http://localhost:5000/convert/${uploadedFile.name}`);

      setResult({
        type: "success",
        message: "PDF loaded for editing",
        data: {
          editor_url: `http://localhost:5000/convert/${uploadedFile.name}`,
        },
      });
    } catch (error) {
      console.error("Error processing document:", error);
      alertModal.showError("Error", "Failed to process document");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!canvasRef.current || !activeTool) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === "text" && newText.trim()) {
      const newElement: TextElement = {
        id: `text-${Date.now()}`,
        text: newText,
        x,
        y,
        page: currentPage,
        fontSize,
        color: textColor,
        width: 200,
        height: 50,
      };
      setTextElements([...textElements, newElement]);
      setNewText("");
      setActiveTool(null);
    } else if (activeTool === "signature" && signatureData) {
      const newElement: SignatureElement = {
        id: `sig-${Date.now()}`,
        data: signatureData,
        x,
        y,
        page: currentPage,
        width: 200,
        height: 100,
      };
      setSignatureElements([...signatureElements, newElement]);
      setActiveTool(null);
      setEditingSignatureId(newElement.id);
    } else if (activeTool === "image" && imageData) {
      const newElement: ImageElement = {
        id: `img-${Date.now()}`,
        data: imageData,
        x,
        y,
        page: currentPage,
        width: 200,
        height: 150,
      };
      setImageElements([...imageElements, newElement]);
      setActiveTool(null);
    }
  };

  const handleMouseDown = (
    e: React.MouseEvent,
    type: "text" | "signature" | "image",
    index: number,
    isResizeHandle = false
  ) => {
    e.stopPropagation();
    if (isResizeHandle) {
      setIsResizing(true);
      setDragType(type);
      setDragIndex(index);
      const element =
        type === "text"
          ? textElements[index]
          : type === "signature"
          ? signatureElements[index]
          : imageElements[index];
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: element.width,
        height: element.height,
      });
    } else {
      setIsDragging(true);
      setDragType(type);
      setDragIndex(index);
      setDragStart({ x: e.clientX, y: e.clientY });

      // Set as selected element
      if (type === "signature") {
        setEditingSignatureId(signatureElements[index].id);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;

    if (isDragging) {
      const rect = canvasRef.current.getBoundingClientRect();
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      if (dragType === "text") {
        const updatedElements = [...textElements];
        updatedElements[dragIndex] = {
          ...updatedElements[dragIndex],
          x: updatedElements[dragIndex].x + deltaX,
          y: updatedElements[dragIndex].y + deltaY,
        };
        setTextElements(updatedElements);
      } else if (dragType === "signature") {
        const updatedElements = [...signatureElements];
        updatedElements[dragIndex] = {
          ...updatedElements[dragIndex],
          x: updatedElements[dragIndex].x + deltaX,
          y: updatedElements[dragIndex].y + deltaY,
        };
        setSignatureElements(updatedElements);
      } else if (dragType === "image") {
        const updatedElements = [...imageElements];
        updatedElements[dragIndex] = {
          ...updatedElements[dragIndex],
          x: updatedElements[dragIndex].x + deltaX,
          y: updatedElements[dragIndex].y + deltaY,
        };
        setImageElements(updatedElements);
      }

      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (isResizing) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      const newWidth = Math.max(50, resizeStart.width + deltaX);
      const newHeight = Math.max(30, resizeStart.height + deltaY);

      if (dragType === "text") {
        const updatedElements = [...textElements];
        updatedElements[dragIndex] = {
          ...updatedElements[dragIndex],
          width: newWidth,
          height: newHeight,
        };
        setTextElements(updatedElements);
      } else if (dragType === "signature") {
        const updatedElements = [...signatureElements];
        updatedElements[dragIndex] = {
          ...updatedElements[dragIndex],
          width: newWidth,
          height: newHeight,
        };
        setSignatureElements(updatedElements);
      } else if (dragType === "image") {
        const updatedElements = [...imageElements];
        updatedElements[dragIndex] = {
          ...updatedElements[dragIndex],
          width: newWidth,
          height: newHeight,
        };
        setImageElements(updatedElements);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setDragType(null);
    setDragIndex(-1);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImageData(result);
        setActiveTool("image");
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteElement = (type: "text" | "signature" | "image", id: string) => {
    if (type === "text") {
      setTextElements(textElements.filter((el) => el.id !== id));
    } else if (type === "signature") {
      setSignatureElements(signatureElements.filter((el) => el.id !== id));
      if (editingSignatureId === id) {
        setEditingSignatureId(null);
      }
    } else if (type === "image") {
      setImageElements(imageElements.filter((el) => el.id !== id));
    }
  };

  const clearSignature = () => {
    setSignatureData("");
    const canvas = document.querySelector("canvas");
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  if (!uploadedFile) {
    return (
      <div className="w-full max-w-4xl mx-auto min-h-96 bg-gray-800/40 rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-white text-xl font-semibold mb-2">
              Edit, Fill and Sign PDF
            </h3>
            <p className="text-gray-400 text-sm">
              Upload a PDF to edit text, fill forms, and add signatures
              seamlessly
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
        className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl overflow-hidden flex flex-col relative"
        style={{ height: `${canvasHeight}px` }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center space-x-4">
            <h3 className="text-white font-semibold text-lg">
              Edit, Fill and Sign PDF
            </h3>
            <span className="text-gray-400 text-sm">{uploadedFile?.name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className="p-2 text-gray-400 hover:text-white disabled:opacity-50"
            >
              ←
            </button>
            <span className="text-sm text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage >= totalPages}
              className="p-2 text-gray-400 hover:text-white disabled:opacity-50"
            >
              →
            </button>
          </div>
        </div>

        {/* Seamless Toolbar */}
        <div className="bg-gray-800/40 backdrop-blur-sm border-b border-gray-600/30">
          <div className="flex items-center justify-between px-6 py-3">
            {/* Tool Selection */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setActiveTool(activeTool === "text" ? null : "text");
                  setNewText("");
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTool === "text"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40"
                    : "text-gray-400 hover:text-gray-300 hover:bg-gray-700/30"
                }`}
              >
                Add Text
              </button>

              <button
                onClick={() => {
                  setActiveTool(
                    activeTool === "signature" ? null : "signature"
                  );
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTool === "signature"
                    ? "bg-blue-500/20 text-blue-300 border border-blue-400/40"
                    : "text-gray-400 hover:text-gray-300 hover:bg-gray-700/30"
                }`}
              >
                Add Signature
              </button>

              <button
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.onchange = handleImageUpload;
                  input.click();
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTool === "image"
                    ? "bg-green-500/20 text-green-300 border border-green-400/40"
                    : "text-gray-400 hover:text-gray-300 hover:bg-gray-700/30"
                }`}
              >
                Add Image
              </button>
            </div>

            {/* Active Tool Controls */}
            {activeTool === "text" && (
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  placeholder="Enter text..."
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm placeholder-gray-400 focus:border-cyan-400 focus:outline-none w-48"
                />
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 text-sm">Size:</span>
                  <input
                    type="number"
                    value={fontSize}
                    onChange={(e) =>
                      setFontSize(parseInt(e.target.value) || 12)
                    }
                    className="w-16 px-2 py-1 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm text-center focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-8 h-8 bg-gray-700/50 border border-gray-600/50 rounded-lg cursor-pointer hover:border-cyan-400 transition-colors"
                />
              </div>
            )}

            {activeTool === "signature" && (
              <div className="flex items-center space-x-4">
                <div className="bg-white rounded-lg p-2 border border-gray-300">
                  <SignatureCanvas
                    onSignatureChange={setSignatureData}
                    width={200}
                    height={60}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={clearSignature}
                    disabled={!signatureData}
                    className="px-3 py-1 bg-red-600/50 hover:bg-red-500/50 text-gray-200 rounded text-xs font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            {activeTool === "image" && imageData && (
              <div className="flex items-center space-x-4">
                <img
                  src={imageData}
                  alt="Preview"
                  className="w-16 h-12 object-cover rounded-lg border border-gray-300"
                />
                <span className="text-gray-300 text-sm">
                  Click to place image
                </span>
              </div>
            )}

            {/* Status */}
            <div className="text-gray-400 text-sm">
              {activeTool
                ? `Click on PDF to place ${activeTool}`
                : "Select a tool to start"}
            </div>
          </div>
        </div>

        {/* PDF Preview */}
        <div className="flex-1 p-6">
          <div className="h-full bg-white rounded-lg shadow-2xl border border-gray-200 relative overflow-hidden">
            {editorUrl ? (
              <>
                <iframe
                  src={editorUrl}
                  className="w-full h-full border-0"
                  title="PDF Editor"
                />
                {/* Overlay for interactive elements */}
                <div
                  ref={canvasRef}
                  className={`absolute inset-0 pointer-events-none ${
                    activeTool ? "cursor-crosshair" : ""
                  }`}
                  onClick={activeTool ? handleCanvasClick : undefined}
                  style={{ pointerEvents: activeTool ? "auto" : "none" }}
                >
                  {/* Text Elements */}
                  {textElements
                    .filter((el) => el.page === currentPage)
                    .map((element, index) => (
                      <div
                        key={element.id}
                        className="absolute cursor-move select-none group pointer-events-auto"
                        style={{
                          left: element.x,
                          top: element.y,
                          width: element.width,
                          height: element.height,
                        }}
                        onMouseDown={(e) => handleMouseDown(e, "text", index)}
                      >
                        <div
                          className="px-2 py-1 w-full h-full flex items-center justify-between"
                          style={{
                            fontSize: element.fontSize,
                            color: element.color,
                          }}
                        >
                          <span className="flex-1">{element.text}</span>
                          <button
                            onClick={() => deleteElement("text", element.id)}
                            className="ml-2 text-red-600 hover:text-red-800 text-lg font-bold"
                          >
                            ×
                          </button>
                        </div>
                        {/* Resize Handle */}
                        <div
                          className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
                          onMouseDown={(e) =>
                            handleMouseDown(e, "text", index, true)
                          }
                        />
                      </div>
                    ))}

                  {/* Signature Elements */}
                  {signatureElements
                    .filter((el) => el.page === currentPage)
                    .map((element, index) => (
                      <div
                        key={element.id}
                        className="absolute cursor-move group pointer-events-auto"
                        style={{
                          left: element.x,
                          top: element.y,
                          width: element.width,
                          height: element.height,
                        }}
                        onMouseDown={(e) =>
                          handleMouseDown(e, "signature", index)
                        }
                      >
                        <img
                          src={element.data}
                          alt="Signature"
                          className="w-full h-full object-contain border border-gray-300 rounded"
                        />
                        {editingSignatureId === element.id && (
                          <button
                            onClick={() =>
                              deleteElement("signature", element.id)
                            }
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full text-xs hover:bg-red-700"
                          >
                            ×
                          </button>
                        )}
                        {/* Resize Handle */}
                        <div
                          className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
                          onMouseDown={(e) =>
                            handleMouseDown(e, "signature", index, true)
                          }
                        />
                      </div>
                    ))}

                  {/* Image Elements */}
                  {imageElements
                    .filter((el) => el.page === currentPage)
                    .map((element, index) => (
                      <div
                        key={element.id}
                        className="absolute cursor-move group pointer-events-auto"
                        style={{
                          left: element.x,
                          top: element.y,
                          width: element.width,
                          height: element.height,
                        }}
                        onMouseDown={(e) => handleMouseDown(e, "image", index)}
                      >
                        <img
                          src={element.data}
                          alt="Image"
                          className="w-full h-full object-cover border border-gray-300 rounded"
                        />
                        <button
                          onClick={() => deleteElement("image", element.id)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full text-xs hover:bg-red-700"
                        >
                          ×
                        </button>
                        {/* Resize Handle */}
                        <div
                          className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
                          onMouseDown={(e) =>
                            handleMouseDown(e, "image", index, true)
                          }
                        />
                      </div>
                    ))}
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-4xl mb-2">📄</div>
                  <div>PDF Preview</div>
                  <div className="text-sm">Page {currentPage}</div>
                </div>
              </div>
            )}
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
              Document Processed Successfully!
            </h3>
            <button
              onClick={() =>
                openMonetizationModal(
                  `${uploadedFile?.name.replace(".pdf", "")}_processed.pdf`,
                  "PDF",
                  result.data.editor_url
                )
              }
              className="flex items-center text-cyan-400 hover:text-cyan-300 group"
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
          <div className="p-6">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-4">
                Your PDF has been processed and is ready for download
              </p>
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

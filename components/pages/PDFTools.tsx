"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Image,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import { SignatureCanvas } from "@/components/ui/signature-canvas";
import { useNavigation } from "@/contexts/NavigationContext";
import AlertModal from "../ui/AlertModal";
import { useAlertModal } from "../../hooks/useAlertModal";
import Button from "../ui/Button";

const tabs = [
  { id: "extract-text", label: "Extract Text", icon: FileText },
  { id: "extract-images", label: "Extract Images", icon: Image },
  { id: "edit-pdf", label: "Edit PDF", icon: FileText },
  { id: "merge-pdfs", label: "Merge PDFs", icon: FileText },
  { id: "split-pdf", label: "Split PDF", icon: FileText },
  { id: "add-signature", label: "Add Signature", icon: FileText },
  { id: "add-watermark", label: "Add Watermark", icon: FileText },
  { id: "compress", label: "Compress", icon: FileText },
];

export default function PDFTools() {
  const { navigateTo } = useNavigation();
  const alertModal = useAlertModal();

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [activeTab, setActiveTab] = useState("extract-text");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
    data?: any;
  } | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [backendStatus, setBackendStatus] = useState<
    "checking" | "online" | "offline"
  >("checking");
  const [showEditor, setShowEditor] = useState(false);
  const [editorUrl, setEditorUrl] = useState<string>("");
  const [previewFormat, setPreviewFormat] = useState<string>("txt");
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [showSplitPdfViewer, setShowSplitPdfViewer] = useState(false);
  const [currentSplitPdfUrl, setCurrentSplitPdfUrl] = useState<string | null>(
    null
  );
  const [showSignedPdfViewer, setShowSignedPdfViewer] = useState(false);
  const [signedPdfUrl, setSignedPdfUrl] = useState<string | null>(null);
  const [signatureData, setSignatureData] = useState<string>("");
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [signaturePosition, setSignaturePosition] = useState({
    x: 100,
    y: 100,
  });
  const [signatureSize, setSignatureSize] = useState({
    width: 200,
    height: 100,
  });
  const [signaturePlaced, setSignaturePlaced] = useState(false);
  const [signatureOverlay, setSignatureOverlay] = useState<{
    visible: boolean;
    x: number;
    y: number;
    width: number;
    height: number;
  }>({
    visible: false,
    x: 0,
    y: 0,
    width: 120,
    height: 60,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({
    x: 0,
    y: 0,
    startX: 0,
    startY: 0,
  });
  const [resizeStart, setResizeStart] = useState({
    x: 0,
    y: 0,
    startWidth: 0,
    startHeight: 0,
  });
  const [pdfPreviewImage, setPdfPreviewImage] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Check backend status
  useEffect(() => {
    fetch("http://localhost:5000/")
      .then(() => setBackendStatus("online"))
      .catch(() => setBackendStatus("offline"));
  }, []);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Global mouse/touch event handlers for smooth dragging and resizing
  useEffect(() => {
    let animationFrameId: number | null = null;

    const getClientPos = (e: MouseEvent | TouchEvent) => {
      if ("touches" in e) {
        return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
      }
      return { clientX: e.clientX, clientY: e.clientY };
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();

      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      animationFrameId = requestAnimationFrame(() => {
        const { clientX, clientY } = getClientPos(e);

        if (isDragging) {
          const deltaX = (clientX - dragStart.x) / zoomLevel;
          const deltaY = (clientY - dragStart.y) / zoomLevel;
          const maxX = (isMobile ? 400 : 600) - signatureOverlay.width;
          const maxY = (isMobile ? 300 : 500) - signatureOverlay.height;

          const newX = Math.max(0, Math.min(dragStart.startX + deltaX, maxX));
          const newY = Math.max(0, Math.min(dragStart.startY + deltaY, maxY));

          setSignatureOverlay((prev) => ({
            ...prev,
            x: newX,
            y: newY,
          }));
        }

        if (isResizing) {
          const deltaX = (clientX - resizeStart.x) / zoomLevel;
          const deltaY = (clientY - resizeStart.y) / zoomLevel;
          const maxWidth = isMobile ? 200 : 300;
          const maxHeight = isMobile ? 100 : 150;

          const newWidth = Math.max(
            60,
            Math.min(resizeStart.startWidth + deltaX, maxWidth)
          );
          const newHeight = Math.max(
            30,
            Math.min(resizeStart.startHeight + deltaY, maxHeight)
          );

          setSignatureOverlay((prev) => ({
            ...prev,
            width: newWidth,
            height: newHeight,
          }));
        }
      });
    };

    const handleEnd = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMove);
      document.addEventListener("mouseup", handleEnd);
      document.addEventListener("touchmove", handleMove, { passive: false });
      document.addEventListener("touchend", handleEnd);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("touchend", handleEnd);
    };
  }, [
    isDragging,
    isResizing,
    dragStart,
    resizeStart,
    signatureOverlay.width,
    signatureOverlay.height,
    zoomLevel,
    isMobile,
  ]);

  // Reset everything when switching tabs
  useEffect(() => {
    setShowEditor(false);
    setEditorUrl("");
    // Don't reset uploadedFile for add-signature tab to preserve uploaded PDF
    if (activeTab !== "add-signature") {
      setUploadedFile(null);
    }
    setUploadedFiles([]);
    setResult(null);
    setShowNotification(false);
    setShowPdfViewer(false); // Reset PDF viewer state
    setShowSplitPdfViewer(false); // Reset split PDF viewer state
    setCurrentSplitPdfUrl(null); // Reset current split PDF URL
    setShowSignedPdfViewer(false); // Reset signed PDF viewer state
    setSignedPdfUrl(null); // Reset signed PDF URL
    setSignatureData(""); // Reset signature data
    setPageNumber(1); // Reset page number
    setTotalPages(0); // Reset total pages
    setSignaturePosition({ x: 100, y: 100 }); // Reset signature position
    setSignatureSize({ width: 200, height: 100 }); // Reset signature size
    setPdfPreviewImage(null); // Reset PDF preview image
  }, [activeTab]);

  const handleFileUpload = async (files: File[]) => {
    if (files.length > 0) {
      // Handle merge PDFs differently
      if (activeTab === "merge-pdfs") {
        setUploadedFiles(files);
        setResult(null);
        await mergePDFs(files);
        return;
      }

      // Handle split PDF differently
      if (activeTab === "split-pdf") {
        const file = files[0];
        setUploadedFile(file);
        setResult(null);
        await splitPDF(file);
        return;
      }

      // Handle add signature differently
      if (activeTab === "add-signature") {
        const file = files[0];
        setUploadedFile(file);
        setResult(null);
        // Get PDF page count for signature positioning
        await getPdfPageCount(file);
        return;
      }

      const file = files[0];
      setUploadedFile(file);
      setResult(null);

      setIsProcessing(true);
      try {
        const formData = new FormData();
        formData.append("pdf", file);

        const response = await fetch("http://localhost:5000/", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const filename = file.name;

          // Handle different tabs
          if (activeTab === "edit-pdf") {
            setEditorUrl(`http://localhost:5000/convert/${filename}`);
            setShowEditor(true);
            setResult({
              type: "success",
              message: "PDF uploaded successfully",
            });
          } else {
            setShowEditor(false);
            // Process based on active tab
            await processTabFeature(filename);
          }

          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 3000);
        } else {
          setResult({ type: "error", message: "Failed to upload PDF" });
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 3000);
        }
      } catch (error) {
        setResult({ type: "error", message: "Error processing PDF" });
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const mergePDFs = async (files: File[]) => {
    if (files.length < 2) {
      setResult({
        type: "error",
        message: "At least 2 PDF files are required for merging",
      });
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      return;
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("pdfs", file);
      });

      const response = await fetch("http://localhost:5000/merge_pdfs", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.status === "success") {
        setResult({
          type: "success",
          message: data.message,
          data: data,
        });
      } else {
        setResult({ type: "error", message: data.message });
      }

      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } catch (error) {
      setResult({ type: "error", message: "Error merging PDFs" });
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  const splitPDF = async (file: File) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("pdf", file);

      const response = await fetch("http://localhost:5000/split_pdf", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.status === "success") {
        setResult({
          type: "success",
          message: data.message,
          data: data,
        });
      } else {
        setResult({ type: "error", message: data.message });
      }

      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } catch (error) {
      setResult({ type: "error", message: "Error splitting PDF" });
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  const getPdfPageCount = async (file: File) => {
    try {
      console.log("Getting PDF page count for file:", file.name);
      const formData = new FormData();
      formData.append("pdf", file);

      const response = await fetch("http://localhost:5000/get_page_count", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Page count response:", data);
        setTotalPages(data.page_count || 1);
        setPageNumber(1);
        // Store the actual filename from backend for PDF viewing
        if (data.filename) {
          console.log("Updating filename to:", data.filename);
          setUploadedFile((prev) => {
            if (prev && prev instanceof File) {
              // Create a new File object with the updated name
              return new File([prev], data.filename, { type: prev.type });
            }
            return prev;
          });
        }
      } else {
        console.error("Failed to get page count, status:", response.status);
        // Fallback to default if backend doesn't support this endpoint
        setTotalPages(1);
        setPageNumber(1);
      }
    } catch (error) {
      console.error("Error getting PDF page count:", error);
      setTotalPages(1);
      setPageNumber(1);
    }
  };

  const getPdfPreview = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("pdf", file);

      const response = await fetch("http://localhost:5000/pdf_preview", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log("PDF preview data received:", data);
        console.log("Preview image length:", data.preview_image?.length);
        console.log(
          "Preview image starts with:",
          data.preview_image?.substring(0, 50)
        );
        setPdfPreviewImage(data.preview_image);
      } else {
        console.error("Error getting PDF preview:", response.status);
      }
    } catch (error) {
      console.error("Error getting PDF preview:", error);
    }
  };

  const addSignature = async () => {
    if (!uploadedFile || !signatureData) {
      setResult({
        type: "error",
        message: "Please upload a PDF and create a signature",
      });
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      return;
    }

    setIsProcessing(true);
    try {
      console.log("DEBUG: Preparing signature data...");
      console.log(
        "DEBUG: signatureData length:",
        signatureData ? signatureData.length : 0
      );
      console.log("DEBUG: signatureOverlay:", signatureOverlay);
      console.log("DEBUG: pageNumber:", pageNumber);
      console.log("DEBUG: uploadedFile:", uploadedFile?.name);
      console.log("DEBUG: uploadedFile type:", typeof uploadedFile);
      console.log(
        "DEBUG: uploadedFile instanceof File:",
        uploadedFile instanceof File
      );
      console.log(
        "DEBUG: uploadedFile constructor:",
        uploadedFile?.constructor?.name
      );

      const formData = new FormData();
      // Ensure uploadedFile is a proper File object
      if (uploadedFile instanceof File) {
        formData.append("pdf", uploadedFile, uploadedFile.name);
      } else {
        console.error(
          "DEBUG: uploadedFile is not a File object:",
          uploadedFile
        );
        throw new Error("Invalid file object");
      }
      formData.append("signature_data", signatureData);
      formData.append("page_number", pageNumber.toString());
      formData.append("x_position", signatureOverlay.x.toString());
      formData.append("y_position", signatureOverlay.y.toString());
      formData.append("width", signatureOverlay.width.toString());
      formData.append("height", signatureOverlay.height.toString());

      console.log("DEBUG: FormData entries:");
      Array.from(formData.entries()).forEach(([key, value]) => {
        console.log(`  ${key}:`, value);
      });

      console.log("DEBUG: FormData prepared, sending request...");

      const response = await fetch("http://localhost:5000/add_signature", {
        method: "POST",
        body: formData,
      });

      console.log("DEBUG: Response status:", response.status);

      const data = await response.json();
      console.log("DEBUG: Response data:", data);

      if (data.status === "success") {
        setResult({
          type: "success",
          message: data.message,
          data: data,
        });
        // Set the signed PDF URL for inline viewing
        setSignedPdfUrl(`http://localhost:5000${data.download_url}`);
      } else {
        console.error("DEBUG: Signature addition failed:", data);
        setResult({
          type: "error",
          message: data.message || "Failed to add signature",
        });
      }

      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } catch (error) {
      console.error("DEBUG: Signature addition error:", error);
      setResult({
        type: "error",
        message: `Error adding signature: ${
          error instanceof Error ? error.message : String(error)
        }`,
      });
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  const processTabFeature = async (filename: string) => {
    try {
      let response;
      let endpoint = "";

      switch (activeTab) {
        case "extract-text":
          endpoint = `/extract_text/${filename}`;
          break;
        case "extract-images":
          endpoint = `/extract_images/${filename}`;
          break;
        case "merge-pdfs":
          // Handle multiple file upload for merging
          return;
        default:
          setResult({ type: "success", message: "PDF uploaded successfully" });
          return;
      }

      response = await fetch(`http://localhost:5000${endpoint}`);
      const data = await response.json();

      if (data.status === "success") {
        setResult({
          type: "success",
          message: "Processing completed successfully",
          data: data,
        });
      } else {
        setResult({ type: "error", message: data.message });
      }
    } catch (error) {
      setResult({ type: "error", message: "Error processing PDF feature" });
    }
  };

  const getPreviewContent = () => {
    if (!result?.data?.text || !uploadedFile) return "";

    switch (previewFormat) {
      case "txt":
        return result.data.text;
      case "md":
        return `# Extracted Text from ${uploadedFile.name}\n\n${result.data.text}`;
      case "json":
        return JSON.stringify(
          {
            filename: uploadedFile.name,
            page_count: result.data.page_count,
            extracted_text: result.data.text,
            extracted_at: new Date().toISOString(),
          },
          null,
          2
        );
      case "csv":
        const lines = result.data.text.split("\n");
        const csvLines = lines.map(
          (line: string, index: number) =>
            `"${index + 1}","${line.replace(/"/g, '""')}"`
        );
        return "Line_Number,Content\n" + csvLines.join("\n");
      default:
        return result.data.text;
    }
  };

  const downloadText = (format: string, mimeType: string) => {
    if (!result?.data?.text || !uploadedFile) return;

    let content = result.data.text;
    let filename = `${uploadedFile.name.replace(".pdf", "")}_extracted_text`;

    switch (format) {
      case "txt":
        // Keep as plain text
        filename += ".txt";
        break;
      case "md":
        // Convert to Markdown format
        content = `# Extracted Text from ${uploadedFile.name}\n\n${result.data.text}`;
        filename += ".md";
        break;
      case "json":
        // Convert to JSON format
        content = JSON.stringify(
          {
            filename: uploadedFile.name,
            page_count: result.data.page_count,
            extracted_text: result.data.text,
            extracted_at: new Date().toISOString(),
          },
          null,
          2
        );
        filename += ".json";
        break;
      case "csv":
        // Convert to CSV format (split by lines)
        const lines = result.data.text.split("\n");
        const csvLines = lines.map(
          (line: string, index: number) =>
            `"${index + 1}","${line.replace(/"/g, '""')}"`
        );
        content = "Line_Number,Content\n" + csvLines.join("\n");
        filename += ".csv";
        break;
      default:
        return;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openImageModal = (img: any, index: number) => {
    setSelectedImage({ ...img, index });
    setShowImageModal(true);
  };

  const downloadSingleImage = (img: any, index: number) => {
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${img.data}`;
    link.download = `${uploadedFile?.name.replace(".pdf", "")}_page${
      img.page
    }_image${img.image_index}.png`;
    link.click();
  };

  const downloadAllImages = () => {
    if (!result?.data?.images || !uploadedFile) return;

    // Create a simple download for all images (in a real app, you'd create a ZIP)
    result.data.images?.forEach((img: any, index: number) => {
      setTimeout(() => {
        const link = document.createElement("a");
        link.href = `data:image/png;base64,${img.data}`;
        link.download = `${uploadedFile.name.replace(".pdf", "")}_page${
          img.page
        }_image${img.image_index}.png`;
        link.click();
      }, index * 100); // Small delay between downloads
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-24">
      {/* Google Drive-like Minimal Notifications */}
      <AnimatePresence>
        {showNotification && result && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed top-4 right-4 z-50"
          >
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm border ${
                result.type === "success"
                  ? "bg-white/90 border-green-200 text-green-800"
                  : "bg-white/90 border-red-200 text-red-800"
              }`}
            >
              {result.type === "success" ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <span className="text-sm font-medium">{result.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Processing Animation */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-white/20"
            >
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="w-6 h-6 text-blue-600" />
                </motion.div>
                <div>
                  <p className="font-medium text-gray-900">Processing PDF...</p>
                  <p className="text-sm text-gray-600">Please wait</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
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
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => setShowImageModal(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 flex justify-center">
                <img
                  src={`data:image/png;base64,${selectedImage.data}`}
                  alt={`Image ${selectedImage.image_index} from page ${selectedImage.page}`}
                  className="max-w-full max-h-[70vh] object-contain"
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

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Minimal Slidable Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="relative">
            {/* Main Tab Container */}
            <div className="relative bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-full p-2 overflow-hidden">
              {/* Active Tab Background */}
              <motion.div
                layoutId="activeTabBg"
                className="absolute top-2 bottom-2 bg-white/10 backdrop-blur-md rounded-full"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />

              {/* Tab Buttons */}
              <div className="relative flex overflow-x-auto scrollbar-hide gap-1 justify-center">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-300 rounded-full ${
                        isActive
                          ? "text-gray-900 bg-white"
                          : "text-gray-400 hover:text-gray-200 hover:bg-white/20"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          {showEditor && activeTab === "edit-pdf" ? (
            // PDF Editor Interface (only for Edit PDF tab)
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center space-x-4">
                  <h3 className="text-white font-semibold text-lg">
                    PDF Editor
                  </h3>
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
              <div className="bg-white h-[700px]">
                <iframe
                  src={editorUrl}
                  className="w-full h-full border-0"
                  title="PDF Editor"
                  sandbox="allow-same-origin allow-scripts allow-forms allow-downloads allow-modals allow-popups"
                />
              </div>
            </div>
          ) : activeTab === "add-signature" && uploadedFile ? (
            // Add Signature Interface
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center space-x-4">
                  <h3 className="text-white font-semibold text-lg">
                    Add Signature
                  </h3>
                  <span className="text-gray-400 text-sm">
                    {uploadedFile?.name}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setUploadedFile(null);
                    setSignatureData("");
                    setResult(null);
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Upload New PDF
                </button>
              </div>

              <div className="p-6">
                {/* Action Buttons - AT THE VERY TOP OF THE PAGE */}
                {result && result.data && (
                  <div className="flex items-center gap-3 mb-6">
                    <Button
                      onClick={() =>
                        setShowSignedPdfViewer(!showSignedPdfViewer)
                      }
                      variant="primary"
                      size="md"
                    >
                      {showSignedPdfViewer ? "Hide PDF" : "View Signed PDF"}
                    </Button>
                    <Button
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = `http://localhost:5000${result.data.download_url}?download=true`;
                        link.download = result.data.signed_filename;
                        link.click();
                      }}
                      variant="success"
                      size="md"
                    >
                      Download Signed PDF
                    </Button>
                  </div>
                )}

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">
                        PDF uploaded successfully
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        File: {uploadedFile.name}
                      </p>
                    </div>
                  </div>

                  {/* Only show signature creation sections if not viewing signed PDF */}
                  {!showSignedPdfViewer && (
                    <>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Signature Canvas */}
                        <div className="bg-gray-900/50 rounded-lg p-6">
                          <h3 className="text-gray-300 text-lg font-medium mb-4">
                            Create Your Signature
                          </h3>
                          <SignatureCanvas
                            onSignatureChange={setSignatureData}
                            width={400}
                            height={200}
                          />
                        </div>

                        {/* Page Selection & Controls */}
                        <div className="bg-gray-900/50 rounded-lg p-6">
                          <h3 className="text-gray-300 text-lg font-medium mb-4">
                            Signature Settings
                          </h3>

                          <div className="space-y-4">
                            <div>
                              <label className="block text-gray-400 text-sm mb-2">
                                Page Number
                              </label>
                              <input
                                type="number"
                                min="1"
                                max={totalPages || 1}
                                value={isNaN(pageNumber) ? 1 : pageNumber}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value);
                                  if (!isNaN(value) && value > 0) {
                                    setPageNumber(value);
                                  }
                                }}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                              />
                              <p className="text-gray-500 text-xs mt-1">
                                Total pages: {totalPages || 1}
                              </p>
                            </div>

                            <div className="pt-4">
                              <Button
                                onClick={addSignature}
                                disabled={
                                  !signatureData ||
                                  !signaturePlaced ||
                                  isProcessing
                                }
                                loading={isProcessing}
                                variant="primary"
                                size="lg"
                                className="w-full"
                              >
                                {signaturePlaced
                                  ? "Finalize Signature"
                                  : "Place Signature First"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Signature Preview */}
                      {signatureData && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-gray-700 text-sm font-medium">
                              Signature Preview
                            </h4>

                            {/* Action Buttons - ON THE RIGHT */}
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => {
                                  // Show signature overlay for positioning
                                  setSignatureOverlay({
                                    visible: true,
                                    x: 200, // Center position
                                    y: 150,
                                    width: 120,
                                    height: 60,
                                  });
                                  setSignaturePlaced(true);
                                  console.log(
                                    "Signature overlay shown for positioning"
                                  );

                                  // Show success modal
                                  alertModal.showSuccess(
                                    "Signature Placed",
                                    `Your signature has been placed on Page ${pageNumber}. You can now drag it to position it exactly where you want, and use the resize handle to scale it. When you're satisfied with the position, click "Finalize Signature" to save it to the PDF.`,
                                    {
                                      primary: {
                                        text: "Got it!",
                                        onClick: () => alertModal.hideAlert(),
                                        variant: "primary",
                                      },
                                    }
                                  );
                                }}
                                variant="primary"
                                size="sm"
                              >
                                Insert Signature
                              </Button>

                              <Button
                                onClick={() => {
                                  // Remove signature overlay
                                  setSignatureOverlay({
                                    visible: false,
                                    x: 0,
                                    y: 0,
                                    width: 120,
                                    height: 60,
                                  });
                                  setSignaturePlaced(false);
                                  console.log("Signature overlay removed");

                                  // Show info modal
                                  alertModal.showInfo(
                                    "Signature Removed",
                                    "The signature has been removed from the preview. You can place a new signature if needed.",
                                    {
                                      primary: {
                                        text: "OK",
                                        onClick: () => alertModal.hideAlert(),
                                        variant: "primary",
                                      },
                                    }
                                  );
                                }}
                                variant="danger"
                                size="sm"
                              >
                                Remove Signature
                              </Button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="border border-gray-300 rounded p-2 bg-white">
                                <img
                                  src={signatureData}
                                  alt="Signature Preview"
                                  className="max-w-32 max-h-16 object-contain"
                                />
                              </div>
                              <div className="text-sm text-gray-600">
                                <p>
                                  Signature will be added to{" "}
                                  <strong>Page {pageNumber}</strong>
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {signaturePlaced
                                    ? "✅ Signature ready! Click 'Finalize Signature' to save it to the PDF."
                                    : "Click 'Insert Signature' to prepare it for the selected page"}
                                </p>
                              </div>
                            </div>

                            {/* Zoom Controls */}
                            <div
                              className={`flex items-center gap-2 ${
                                isMobile ? "flex-wrap" : ""
                              }`}
                            >
                              <span className="text-sm text-gray-600">
                                Zoom:
                              </span>
                              <div className="flex items-center gap-1">
                                <Button
                                  onClick={() =>
                                    setZoomLevel(
                                      Math.max(0.5, zoomLevel - 0.25)
                                    )
                                  }
                                  variant="outline"
                                  size="sm"
                                  disabled={zoomLevel <= 0.5}
                                  className="px-2 py-1 min-w-[32px]"
                                >
                                  -
                                </Button>
                                <span className="text-sm text-gray-700 min-w-[3rem] text-center">
                                  {Math.round(zoomLevel * 100)}%
                                </span>
                                <Button
                                  onClick={() =>
                                    setZoomLevel(Math.min(2, zoomLevel + 0.25))
                                  }
                                  variant="outline"
                                  size="sm"
                                  disabled={zoomLevel >= 2}
                                  className="px-2 py-1 min-w-[32px]"
                                >
                                  +
                                </Button>
                              </div>
                              <Button
                                onClick={() => setZoomLevel(1)}
                                variant="secondary"
                                size="sm"
                                className="px-2 py-1"
                              >
                                Reset
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Multi-Page PDF Preview */}
                      {signatureData && (
                        <div className="bg-gray-900/50 rounded-lg p-6">
                          <h3 className="text-gray-300 text-lg font-medium mb-4">
                            Select Page & Position Your Signature
                          </h3>

                          <div className="space-y-4">
                            {/* Page Selection Info */}
                            <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
                              <div className="flex items-center gap-2 text-blue-300">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-sm font-medium">
                                  Selected Page: {pageNumber}
                                </span>
                              </div>
                              <p className="text-blue-200 text-xs mt-1">
                                Click on any page header in the preview below to
                                select it for signature placement
                              </p>
                            </div>

                            {/* Full PDF Preview */}
                            <div className="bg-white rounded-lg overflow-hidden">
                              <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
                                <h4 className="text-gray-700 text-sm font-medium">
                                  PDF Preview - All Pages
                                </h4>
                              </div>

                              <div className="relative">
                                {/* Zoomed PDF Container */}
                                <div
                                  className="relative"
                                  style={{
                                    height: isMobile ? "300px" : "600px",
                                    overflow: "auto",
                                    transform: `scale(${zoomLevel})`,
                                    transformOrigin: "top left",
                                    width: `${100 / zoomLevel}%`,
                                  }}
                                >
                                  {uploadedFile && (
                                    <iframe
                                      src={`http://localhost:5000/convert_signature/${encodeURIComponent(
                                        uploadedFile.name
                                      )}`}
                                      className="w-full h-full border-0"
                                      title="Multi-Page PDF Viewer"
                                      style={{
                                        pointerEvents: "auto",
                                        backgroundColor: "white",
                                      }}
                                      sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-top-navigation"
                                      onLoad={() => {
                                        console.log(
                                          "Multi-page PDF iframe loaded successfully"
                                        );

                                        // Listen for page selection messages from iframe
                                        window.addEventListener(
                                          "message",
                                          (event) => {
                                            if (
                                              event.data.type === "pageSelected"
                                            ) {
                                              const page = parseInt(
                                                event.data.page
                                              );
                                              if (!isNaN(page) && page > 0) {
                                                setPageNumber(page);
                                                console.log(
                                                  "Page selected:",
                                                  page
                                                );
                                              }
                                            }
                                          }
                                        );
                                      }}
                                      onError={(e) =>
                                        console.error(
                                          "Multi-page PDF iframe failed to load:",
                                          e
                                        )
                                      }
                                    />
                                  )}
                                </div>

                                {/* Signature Overlay - Outside zoomed container */}
                                {signatureOverlay.visible && signatureData && (
                                  <div
                                    className={`absolute border-2 bg-blue-50/20 select-none z-50 transition-none ${
                                      isDragging
                                        ? "border-blue-400 cursor-grabbing shadow-lg"
                                        : isResizing
                                        ? "border-blue-400 shadow-lg"
                                        : "border-blue-500 cursor-move"
                                    }`}
                                    style={{
                                      left: `${
                                        signatureOverlay.x * zoomLevel
                                      }px`,
                                      top: `${
                                        signatureOverlay.y * zoomLevel
                                      }px`,
                                      width: `${
                                        signatureOverlay.width * zoomLevel
                                      }px`,
                                      height: `${
                                        signatureOverlay.height * zoomLevel
                                      }px`,
                                      willChange: "transform",
                                      transform: "translateZ(0)",
                                      backfaceVisibility: "hidden",
                                      WebkitBackfaceVisibility: "hidden",
                                    }}
                                    onMouseDown={(e) => {
                                      if (e.target === e.currentTarget) {
                                        e.preventDefault();
                                        setIsDragging(true);
                                        setDragStart({
                                          x: e.clientX,
                                          y: e.clientY,
                                          startX: signatureOverlay.x,
                                          startY: signatureOverlay.y,
                                        });
                                      }
                                    }}
                                    onTouchStart={(e) => {
                                      if (e.target === e.currentTarget) {
                                        e.preventDefault();
                                        const touch = e.touches[0];
                                        setIsDragging(true);
                                        setDragStart({
                                          x: touch.clientX,
                                          y: touch.clientY,
                                          startX: signatureOverlay.x,
                                          startY: signatureOverlay.y,
                                        });
                                      }
                                    }}
                                  >
                                    <img
                                      src={signatureData}
                                      alt="Signature Preview"
                                      className="w-full h-full object-contain pointer-events-none"
                                    />

                                    {/* Resize handles */}
                                    <div
                                      className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 cursor-se-resize"
                                      onMouseDown={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setIsResizing(true);
                                        setResizeStart({
                                          x: e.clientX,
                                          y: e.clientY,
                                          startWidth: signatureOverlay.width,
                                          startHeight: signatureOverlay.height,
                                        });
                                      }}
                                      onTouchStart={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        const touch = e.touches[0];
                                        setIsResizing(true);
                                        setResizeStart({
                                          x: touch.clientX,
                                          y: touch.clientY,
                                          startWidth: signatureOverlay.width,
                                          startHeight: signatureOverlay.height,
                                        });
                                      }}
                                    />
                                  </div>
                                )}

                                {/* Fallback message if iframe content is not visible */}
                                <div className="absolute top-4 left-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-2 rounded text-sm">
                                  <p className="font-medium">
                                    PDF Preview Loading...
                                  </p>
                                  <p className="text-xs">
                                    If you don't see the PDF pages, try
                                    refreshing the page.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Results */}
                  {result && (
                    <div className="bg-gray-900/50 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p
                            className={`text-sm ${
                              result.type === "success"
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {result.message}
                          </p>
                          {result.data && (
                            <p className="text-gray-500 text-xs mt-1">
                              File: {result.data.signed_filename}
                            </p>
                          )}
                        </div>
                      </div>

                      {result.data && (
                        <div className="space-y-4">
                          {/* Inline PDF Viewer */}
                          {showSignedPdfViewer && signedPdfUrl && (
                            <div className="bg-white rounded-lg overflow-hidden">
                              <div className="flex items-center justify-between p-3 bg-gray-100">
                                <span className="text-sm font-medium text-gray-700">
                                  Signed PDF Preview
                                </span>
                                <button
                                  onClick={() => setShowSignedPdfViewer(false)}
                                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition-colors"
                                >
                                  Close
                                </button>
                              </div>
                              <iframe
                                src={signedPdfUrl}
                                className="w-full h-96"
                                title="Signed PDF Viewer"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : result && result.data ? (
            // Results Section (after successful extraction/conversion)
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center space-x-4">
                  <h3 className="text-white font-semibold text-lg">
                    {activeTab === "extract-text" && "Extracted Text"}
                    {activeTab === "extract-images" && "Extracted Images"}
                    {activeTab === "merge-pdfs" && "Merged PDF"}
                  </h3>
                  <span className="text-gray-400 text-sm">
                    {uploadedFile?.name}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setUploadedFile(null);
                    setResult(null);
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Upload New PDF
                </button>
              </div>

              <div className="p-6">
                {activeTab === "extract-text" && (
                  <div>
                    <div className="bg-gray-900/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <pre className="text-gray-300 text-sm whitespace-pre-wrap">
                        {result.data.text}
                      </pre>
                    </div>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">
                          {result.data.page_count} pages processed
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-500 text-sm">
                            Download as:
                          </span>
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                const [format, mimeType] =
                                  e.target.value.split(",");
                                downloadText(format, mimeType);
                                e.target.value = ""; // Reset selection
                              }
                            }}
                            className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                          >
                            <option value="">Choose format...</option>
                            <option value="txt,text/plain">Text (.txt)</option>
                            <option value="md,text/markdown">
                              Markdown (.md)
                            </option>
                            <option value="json,application/json">
                              JSON (.json)
                            </option>
                            <option value="csv,text/csv">CSV (.csv)</option>
                          </select>
                        </div>
                      </div>

                      {/* Format Preview */}
                      <div className="bg-gray-900/50 rounded-lg p-4">
                        <div className="flex gap-2 mb-3">
                          <button
                            onClick={() => setPreviewFormat("txt")}
                            className={`px-3 py-1 rounded text-xs transition-colors ${
                              previewFormat === "txt"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            }`}
                          >
                            TXT
                          </button>
                          <button
                            onClick={() => setPreviewFormat("md")}
                            className={`px-3 py-1 rounded text-xs transition-colors ${
                              previewFormat === "md"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            }`}
                          >
                            MD
                          </button>
                          <button
                            onClick={() => setPreviewFormat("json")}
                            className={`px-3 py-1 rounded text-xs transition-colors ${
                              previewFormat === "json"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            }`}
                          >
                            JSON
                          </button>
                          <button
                            onClick={() => setPreviewFormat("csv")}
                            className={`px-3 py-1 rounded text-xs transition-colors ${
                              previewFormat === "csv"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            }`}
                          >
                            CSV
                          </button>
                        </div>
                        <div className="bg-gray-800 rounded p-3 max-h-48 overflow-y-auto">
                          <pre className="text-gray-300 text-xs whitespace-pre-wrap">
                            {getPreviewContent()}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "extract-images" && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-gray-400 text-sm">
                        Found {result.data.total_images || 0} images
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500 text-sm">Download:</span>
                        <Button
                          onClick={() => downloadAllImages()}
                          variant="primary"
                          size="sm"
                        >
                          All as ZIP
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                      {result.data.images?.map((img: any, index: number) => (
                        <div
                          key={index}
                          className="bg-gray-900/50 rounded-lg p-3 group hover:bg-gray-900/70 transition-colors"
                        >
                          <div className="relative">
                            <img
                              src={`data:image/png;base64,${img.data}`}
                              alt={`Image ${img.image_index} from page ${img.page}`}
                              className="w-full h-32 object-contain bg-white rounded cursor-pointer"
                              onClick={() => openImageModal(img, index)}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded flex items-center justify-center">
                              <button
                                onClick={() => downloadSingleImage(img, index)}
                                className="opacity-0 group-hover:opacity-100 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs transition-all"
                              >
                                Download
                              </button>
                            </div>
                          </div>
                          <div className="mt-2 space-y-1">
                            <p className="text-gray-400 text-xs">
                              Page {img.page}, Image {img.image_index}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {img.width} × {img.height}px
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "split-pdf" && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-gray-400 text-sm">
                          PDF split successfully
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          Original: {uploadedFile?.name} • Split into{" "}
                          {result.data.total_pages} pages
                        </p>
                        <p className="text-green-400 text-xs mt-1">
                          ✅ All pages preserved • ✅ Individual files created •
                          ✅ Ready for download
                        </p>
                      </div>
                    </div>

                    {/* Action Section - Download All */}
                    <div className="flex items-center gap-3 mb-4">
                      <button
                        onClick={() => {
                          result.data.split_files.forEach((file: any) => {
                            const link = document.createElement("a");
                            link.href = `http://localhost:5000${file.download_url}?download=true`;
                            link.download = file.filename;
                            link.click();
                          });
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors text-sm font-medium"
                      >
                        Download All Pages
                      </button>
                    </div>

                    {/* Split PDF Viewer - Conditional */}
                    {showSplitPdfViewer && currentSplitPdfUrl && (
                      <div className="bg-white rounded-lg overflow-hidden mb-4">
                        <div className="flex items-center justify-between p-3 bg-gray-100">
                          <span className="text-sm font-medium text-gray-700">
                            Split PDF Viewer
                          </span>
                          <button
                            onClick={() => setShowSplitPdfViewer(false)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition-colors"
                          >
                            Close
                          </button>
                        </div>
                        <iframe
                          src={currentSplitPdfUrl}
                          className="w-full h-96"
                          title="Split PDF Viewer"
                        />
                      </div>
                    )}

                    {/* Split Files List */}
                    <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
                      <h4 className="text-gray-300 text-sm font-medium mb-3">
                        Split files ({result.data.total_pages} pages):
                      </h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {result.data.split_files.map(
                          (file: any, index: number) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-gray-800/50 rounded px-3 py-2"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-gray-300 text-sm">
                                  {file.filename}
                                </span>
                                <span className="text-gray-500 text-xs">
                                  Page {file.page_number}
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setCurrentSplitPdfUrl(
                                      `http://localhost:5000${file.download_url}`
                                    );
                                    setShowSplitPdfViewer(true);
                                  }}
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition-colors"
                                >
                                  View
                                </button>
                                <button
                                  onClick={() => {
                                    const link = document.createElement("a");
                                    link.href = `http://localhost:5000${file.download_url}?download=true`;
                                    link.download = file.filename;
                                    link.click();
                                  }}
                                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition-colors"
                                >
                                  Download
                                </button>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "merge-pdfs" && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-gray-400 text-sm">
                          PDFs merged successfully
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          File: {result.data.merged_filename} •{" "}
                          {result.data.file_count} files merged
                        </p>
                        <p className="text-green-400 text-xs mt-1">
                          ✅ All pages preserved • ✅ Original quality
                          maintained • ✅ Ready for download
                        </p>
                      </div>
                    </div>

                    {/* Action Section - Moved to top */}
                    <div className="flex items-center gap-3 mb-4">
                      <Button
                        onClick={() => setShowPdfViewer(!showPdfViewer)}
                        variant="primary"
                        size="md"
                      >
                        {showPdfViewer ? "Hide PDF" : "View PDF"}
                      </Button>
                      <Button
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = `http://localhost:5000${result.data.download_url}?download=true`;
                          link.download = result.data.merged_filename;
                          link.click();
                        }}
                        variant="success"
                        size="md"
                      >
                        Download PDF
                      </Button>
                    </div>

                    {/* File List */}
                    <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
                      <h4 className="text-gray-300 text-sm font-medium mb-3">
                        Files merged:
                      </h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {uploadedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-gray-800/50 rounded px-3 py-2"
                          >
                            <span className="text-gray-300 text-sm">
                              {file.name}
                            </span>
                            <span className="text-gray-500 text-xs">
                              File {index + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* PDF Viewer - Conditional */}
                    {showPdfViewer && (
                      <div className="bg-white rounded-lg overflow-hidden">
                        <iframe
                          src={`http://localhost:5000${result.data.download_url}`}
                          className="w-full h-96"
                          title="Merged PDF Viewer"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Upload Interface (initial state)
            <div className="w-full max-w-4xl mx-auto min-h-96 bg-gray-800/40 rounded-lg overflow-hidden">
              <div className="dark">
                <FileUpload
                  onChange={handleFileUpload}
                  multiple={activeTab === "merge-pdfs"}
                />
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={alertModal.hideAlert}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        primaryButton={alertModal.primaryButton}
        secondaryButton={alertModal.secondaryButton}
        showCloseButton={alertModal.showCloseButton}
      />
    </div>
  );
}

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
import { useNavigation } from "@/contexts/NavigationContext";

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
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Check backend status
  useEffect(() => {
    fetch("http://localhost:5000/")
      .then(() => setBackendStatus("online"))
      .catch(() => setBackendStatus("offline"));
  }, []);

  // Reset everything when switching tabs
  useEffect(() => {
    setShowEditor(false);
    setEditorUrl("");
    setUploadedFile(null);
    setUploadedFiles([]);
    setResult(null);
    setShowNotification(false);
    setShowPdfViewer(false); // Reset PDF viewer state
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
              <div className="relative flex overflow-x-auto scrollbar-hide gap-1">
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
                        <button
                          onClick={() => downloadAllImages()}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                        >
                          All as ZIP
                        </button>
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
                      <button
                        onClick={() => setShowPdfViewer(!showPdfViewer)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors text-sm font-medium"
                      >
                        {showPdfViewer ? "Hide PDF" : "View PDF"}
                      </button>
                      <button
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = `http://localhost:5000${result.data.download_url}?download=true`;
                          link.download = result.data.merged_filename;
                          link.click();
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors text-sm font-medium"
                      >
                        Download PDF
                      </button>
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
    </div>
  );
}

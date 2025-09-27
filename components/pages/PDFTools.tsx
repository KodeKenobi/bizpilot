"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Image,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useNavigation } from "@/contexts/NavigationContext";

const tabs = [
  { id: "extract-text", label: "Extract Text", icon: FileText },
  { id: "extract-images", label: "Extract Images", icon: Image },
  { id: "convert-word", label: "Convert to Word", icon: FileText },
  { id: "edit-pdf", label: "Edit PDF", icon: FileText },
  { id: "merge-pdfs", label: "Merge PDFs", icon: FileText },
  { id: "split-pdf", label: "Split PDF", icon: FileText },
  { id: "add-signature", label: "Add Signature", icon: FileText },
  { id: "add-watermark", label: "Add Watermark", icon: FileText },
  { id: "compress", label: "Compress", icon: FileText },
];

export default function PDFTools() {
  const { navigateTo } = useNavigation();
  const [activeTab, setActiveTab] = useState("extract-text");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
    data?: any;
  } | null>(null);
  const [backendStatus, setBackendStatus] = useState<
    "checking" | "online" | "offline"
  >("checking");
  const [showEditor, setShowEditor] = useState(false);
  const [editorUrl, setEditorUrl] = useState<string>("");

  // Check backend status
  useEffect(() => {
    fetch("http://localhost:5000/")
      .then(() => setBackendStatus("online"))
      .catch(() => setBackendStatus("offline"));
  }, []);

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setUploadedFile(acceptedFiles[0]);
      setResult(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: false,
  });

  const handleProcess = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    try {
      if (activeTab === "edit-pdf") {
        // For Edit PDF, redirect to the Flask app
        const formData = new FormData();
        formData.append("pdf", uploadedFile);

        const response = await fetch("http://localhost:5000/", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          // Set the editor URL to the original working Flask page
          const filename = uploadedFile.name;
          setEditorUrl(`http://localhost:5000/convert/${filename}`);
          setShowEditor(true);
          setResult(null); // Clear any previous results
        } else {
          setResult({ type: "error", message: "Failed to upload PDF" });
        }
      } else {
        // For other tabs, process normally
        const formData = new FormData();
        formData.append("pdf", uploadedFile);

        const response = await fetch("http://localhost:5000/", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const result = await response.text();
          setResult({
            type: "success",
            message: "PDF processed successfully",
            data: result,
          });
        } else {
          setResult({ type: "error", message: "Failed to process PDF" });
        }
      }
    } catch (error) {
      setResult({ type: "error", message: "Error processing PDF" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-24">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">PDF Tools</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Comprehensive PDF processing tools with advanced editing
            capabilities
          </p>
        </motion.div>

        {/* Backend Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">Backend Status</span>
              <div className="flex items-center space-x-2">
                {backendStatus === "checking" && (
                  <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
                )}
                {backendStatus === "online" && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-green-500 text-sm">Online</span>
                  </div>
                )}
                {backendStatus === "offline" && (
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-red-500 text-sm">Offline</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-4">Tools</h3>
              <div className="space-y-2">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        activeTab === tab.id
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          : "text-gray-400 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="text-sm">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-3"
          >
            {!showEditor && activeTab !== "edit-pdf" ? (
              // Upload Interface
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8">
                {/* File Upload */}
                <div className="mb-8">
                  <h3 className="text-white font-semibold mb-4">
                    Upload PDF File
                  </h3>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                      isDragActive
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-gray-600 hover:border-purple-500 hover:bg-purple-500/5"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    {isDragActive ? (
                      <p className="text-purple-300">
                        Drop the PDF file here...
                      </p>
                    ) : (
                      <div>
                        <p className="text-gray-300 mb-2">
                          Drag & drop a PDF file here, or click to select
                        </p>
                        <p className="text-gray-500 text-sm">
                          Supports PDF files only
                        </p>
                      </div>
                    )}
                  </div>

                  {uploadedFile && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
                    >
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-green-300">
                          {uploadedFile.name} (
                          {Math.round(uploadedFile.size / 1024)} KB)
                        </span>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Process Button */}
                <motion.button
                  onClick={handleProcess}
                  disabled={!uploadedFile || isProcessing}
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 ${
                    uploadedFile && !isProcessing
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                      : "bg-gray-600 text-gray-400 cursor-not-allowed"
                  }`}
                  whileHover={
                    uploadedFile && !isProcessing ? { scale: 1.02 } : {}
                  }
                  whileTap={
                    uploadedFile && !isProcessing ? { scale: 0.98 } : {}
                  }
                >
                  {isProcessing
                    ? "Processing..."
                    : activeTab === "edit-pdf"
                    ? "Open PDF Editor"
                    : "Process PDF"}
                </motion.button>

                {/* Results - Only show for non-edit-pdf tabs */}
                {result && activeTab !== "edit-pdf" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-8 p-6 rounded-xl border ${
                      result.type === "success"
                        ? "bg-green-500/10 border-green-500/30"
                        : "bg-red-500/10 border-red-500/30"
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-4">
                      {result.type === "success" ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span
                        className={`font-semibold ${
                          result.type === "success"
                            ? "text-green-300"
                            : "text-red-300"
                        }`}
                      >
                        {result.message}
                      </span>
                    </div>

                    {result.type === "success" && (
                      <div className="space-y-4">
                        <p className="text-gray-300">
                          Your PDF has been processed successfully! You can now
                          view and edit it.
                        </p>
                        <div className="flex space-x-4">
                          <button
                            onClick={() => navigateTo("pdf-editor")}
                            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg transition-colors"
                          >
                            Open Editor
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            ) : showEditor ? (
              // PDF Editor Interface
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
                    sandbox="allow-same-origin allow-scripts allow-forms allow-downloads"
                  />
                </div>
              </div>
            ) : (
              // Edit PDF tab - show upload interface
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8">
                {/* File Upload */}
                <div className="mb-8">
                  <h3 className="text-white font-semibold mb-4">
                    Upload PDF File
                  </h3>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                      isDragActive
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-gray-600 hover:border-purple-500 hover:bg-purple-500/5"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    {isDragActive ? (
                      <p className="text-purple-300">
                        Drop the PDF file here...
                      </p>
                    ) : (
                      <div>
                        <p className="text-gray-300 mb-2">
                          Drag & drop a PDF file here, or click to select
                        </p>
                        <p className="text-gray-500 text-sm">
                          Supports PDF files only
                        </p>
                      </div>
                    )}
                  </div>

                  {uploadedFile && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
                    >
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-green-300">
                          {uploadedFile.name} (
                          {Math.round(uploadedFile.size / 1024)} KB)
                        </span>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Process Button */}
                <motion.button
                  onClick={handleProcess}
                  disabled={!uploadedFile || isProcessing}
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 ${
                    uploadedFile && !isProcessing
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                      : "bg-gray-600 text-gray-400 cursor-not-allowed"
                  }`}
                  whileHover={
                    uploadedFile && !isProcessing ? { scale: 1.02 } : {}
                  }
                  whileTap={
                    uploadedFile && !isProcessing ? { scale: 0.98 } : {}
                  }
                >
                  {isProcessing
                    ? "Processing..."
                    : "Open PDF Editor"}
                </motion.button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

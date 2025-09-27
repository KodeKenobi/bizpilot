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

  // Check backend status
  useEffect(() => {
    fetch("http://localhost:5000/")
      .then(() => setBackendStatus("online"))
      .catch(() => setBackendStatus("offline"));
  }, []);

  const handleFileUpload = async (files: File[]) => {
    if (files.length > 0) {
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
          setEditorUrl(`http://localhost:5000/convert/${filename}`);
          setShowEditor(true);
          setResult({ type: "success", message: "PDF uploaded successfully" });
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
            <div className="relative bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-full p-1 overflow-hidden">
              {/* Active Tab Background */}
              <motion.div
                layoutId="activeTabBg"
                className="absolute top-1 bottom-1 bg-white/10 backdrop-blur-md rounded-full"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />

              {/* Tab Buttons */}
              <div className="relative flex overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative px-6 py-3 text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                        isActive
                          ? "text-white"
                          : "text-gray-400 hover:text-gray-200"
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
          {!showEditor ? (
            // Upload Interface
            <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-gray-800/40 border-gray-700 rounded-lg overflow-hidden">
              <div className="dark">
                <FileUpload onChange={handleFileUpload} />
              </div>

              {uploadedFile && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-white/5 border border-white/10 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300 text-sm">
                      {uploadedFile.name} (
                      {Math.round(uploadedFile.size / 1024)} KB)
                    </span>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
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
                  sandbox="allow-same-origin allow-scripts allow-forms allow-downloads allow-modals allow-popups"
                />
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Loader2 } from "lucide-react";
import { useNavigation } from "@/contexts/NavigationContext";
import { useMonetization } from "@/hooks/useMonetization";
import MonetizationModal from "@/components/ui/MonetizationModal";

// Import individual tool components
import { ExtractTextTool } from "./extract-text/ExtractTextTool";
import { ExtractImagesTool } from "./extract-images/ExtractImagesTool";
import { EditPdfTool } from "./edit-pdf/EditPdfTool";
import { EditFillSignTool } from "./edit-fill-sign/EditFillSignTool";
import { AddSignatureTool } from "./add-signature/AddSignatureTool";
import { AddWatermarkTool } from "./add-watermark/AddWatermarkTool";
import { SplitPdfTool } from "./split-pdf/SplitPdfTool";
import { MergePdfsTool } from "./merge-pdfs/MergePdfsTool";

const toolCategories = [
  {
    title: "Extract & Read",
    tools: [
      { id: "extract-text", label: "Extract Text from PDF" },
      { id: "extract-images", label: "Extract Images from PDF" },
    ],
  },
  {
    title: "Edit & Modify",
    tools: [
      { id: "edit-pdf", label: "Edit PDF Content" },
      { id: "edit-fill-sign", label: "Edit, Fill and Sign" },
      { id: "add-signature", label: "Add Digital Signature to PDF" },
      { id: "add-watermark", label: "Add Watermark to PDF" },
    ],
  },
  {
    title: "Split & Merge",
    tools: [
      { id: "split-pdf", label: "Split PDF into Individual Pages" },
      { id: "merge-pdfs", label: "Merge Multiple PDFs into One" },
    ],
  },
];

// Flatten for backward compatibility
const tabs = toolCategories.flatMap((category) =>
  category.tools.map((tool) => ({ ...tool, icon: FileText }))
);

export default function PDFTools() {
  const { navigateTo } = useNavigation();
  const {
    monetizationState,
    openMonetizationModal,
    closeMonetizationModal,
    handleAdComplete,
    handlePaymentComplete,
  } = useMonetization();

  const [activeTab, setActiveTab] = useState("extract-text");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showToolsGrid, setShowToolsGrid] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
    data?: any;
  } | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  // Reset state when tab changes
  useEffect(() => {
    if (activeTab !== "add-signature") {
      setUploadedFile(null);
    }
    setUploadedFiles([]);
    setResult(null);
  }, [activeTab]);

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setResult(null);

    // Handle different tabs
    if (activeTab === "merge-pdfs") {
      setUploadedFiles([file]);
    } else {
      // For other tools, process the file
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
    // This function is now only used for tools that don't have their own processing
    // Most tools now handle their own processing with the advanced editor pattern
    setIsProcessing(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      let endpoint = "";
      switch (activeTab) {
        case "extract-text":
          endpoint = `/extract_text`;
          break;
        case "extract-images":
          endpoint = `/extract_images`;
          break;
        case "merge-pdfs":
          endpoint = `/merge_pdfs`;
          break;
        default:
          // For other tools, they handle their own processing
          setIsProcessing(false);
          return;
      }

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process file");
      }

      const data = await response.json();
      setResult({
        type: "success",
        message: "File processed successfully!",
        data: data,
      });
    } catch (error) {
      console.error("Error processing file:", error);
      setResult({
        type: "error",
        message: "Error processing file. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const renderTool = () => {
    const commonProps = {
      uploadedFile,
      setUploadedFile,
      result,
      setResult,
      isProcessing,
      setIsProcessing,
      handleFileUpload,
    };

    switch (activeTab) {
      case "extract-text":
        return <ExtractTextTool {...commonProps} />;
      case "extract-images":
        return <ExtractImagesTool {...commonProps} />;
      case "edit-pdf":
        return <EditPdfTool {...commonProps} />;
      case "edit-fill-sign":
        return <EditFillSignTool {...commonProps} />;
      case "add-signature":
        return <AddSignatureTool {...commonProps} />;
      case "add-watermark":
        return <AddWatermarkTool {...commonProps} />;
      case "split-pdf":
        return <SplitPdfTool {...commonProps} />;
      case "merge-pdfs":
        return (
          <MergePdfsTool
            {...commonProps}
            uploadedFiles={uploadedFiles}
            setUploadedFiles={setUploadedFiles}
          />
        );
      default:
        return <div>Tool not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 page-content">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">PDF Tools</h1>
          <p className="text-gray-400 text-lg">
            Powerful PDF processing tools at your fingertips
          </p>
        </div>

        {/* Compact Tool Selection */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-1 justify-center">
            {tabs.map((tool) => (
              <motion.button
                key={tool.id}
                onClick={() => setActiveTab(tool.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  activeTab === tool.id
                    ? "bg-cyan-500 text-white shadow-md"
                    : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {tool.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          {renderTool()}
        </motion.div>
      </div>

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

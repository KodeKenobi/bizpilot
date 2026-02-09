"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Loader2 } from "lucide-react";
import { useNavigation } from "@/contexts/NavigationContext";
// Monetization removed - using Google AdSense only
import { getApiUrl } from "@/lib/config";
import internalAnalytics from "@/lib/internalAnalytics";

// Import individual tool components
import { ExtractTextTool } from "./extract-text/ExtractTextTool";
import { ExtractImagesTool } from "./extract-images/ExtractImagesTool";
import { EditPdfTool } from "./edit-pdf/EditPdfTool";
import { MobileEditPdfTool } from "./edit-pdf/MobileEditPdfTool";
import { EditFillSignTool } from "./edit-fill-sign/EditFillSignTool";
import { MobileEditFillSignTool } from "./edit-fill-sign/MobileEditFillSignTool";
import { AddSignatureTool } from "./add-signature/AddSignatureTool";
import { MobileAddSignatureTool } from "./add-signature/MobileAddSignatureTool";
import { AddWatermarkTool } from "./add-watermark/AddWatermarkTool";
import { MobileAddImageTool } from "./add-image/MobileAddImageTool";
import { SplitPdfTool } from "./split-pdf/SplitPdfTool";
import { MobileSplitPdfTool } from "./split-pdf/MobileSplitPdfTool";
import { MergePdfsTool } from "./merge-pdfs/MergePdfsTool";
import { MobileMergePdfsTool } from "./merge-pdfs/MobileMergePdfsTool";
import { PdfToHtmlTool } from "./pdf-to-html/PdfToHtmlTool";
import { MobilePdfToHtmlTool } from "./pdf-to-html/MobilePdfToHtmlTool";
import { HtmlToPdfTool } from "./html-to-pdf/HtmlToPdfTool";
import { MobileHtmlToPdfTool } from "./html-to-pdf/MobileHtmlToPdfTool";
import { PDFProcessingModal } from "@/components/ui/PDFProcessingModal";

const toolCategories = [
  {
    title: "Extract & Read",
    tools: [
      { id: "extract-text", label: "Extract Text from PDF" },
      { id: "extract-images", label: "Extract Images from PDF" },
      { id: "pdf-to-html", label: "Convert PDF to HTML" },
      { id: "html-to-pdf", label: "Convert HTML to PDF" },
    ],
  },
  {
    title: "Edit & Modify",
    tools: [
      { id: "edit-pdf", label: "Edit PDF Content" },
      { id: "edit-fill-sign", label: "Edit, Fill and Sign" },
      { id: "add-signature", label: "Add Digital Signature to PDF" },
      { id: "add-watermark", label: "Add Image to PDF" },
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
  // Monetization removed - using Google AdSense only

  const [activeTab, setActiveTab] = useState("extract-text");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showToolsGrid, setShowToolsGrid] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
    data?: any;
  } | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Map tool IDs to display names
  const toolNameMap: Record<string, string> = {
    "extract-text": "Extract Text",
    "extract-images": "Extract Images",
    "pdf-to-html": "PDF to HTML",
    "html-to-pdf": "HTML to PDF",
    "edit-pdf": "Edit PDF",
    "edit-fill-sign": "Edit Fill Sign",
    "add-signature": "Add Signature",
    "add-watermark": "Add Watermark",
    "split-pdf": "Split PDF",
    "merge-pdfs": "Merge PDFs",
  };

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const mobile =
        window.innerWidth <= 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Track initial tool on page load
  useEffect(() => {
    const toolName = toolNameMap[activeTab] || activeTab;
    if (typeof document !== "undefined") {
      document.title = `PDF Tools - ${toolName} | Trevnoctilla`;
    }
    
    // Track initial tool view
    internalAnalytics.track("pdf_tool_view", {
      tool_id: activeTab,
      tool_name: toolName,
      page: typeof window !== "undefined" ? window.location.pathname : "/tools/pdf-tools",
      timestamp: Date.now(),
    });
  }, []); // Only run on mount

  // Reset state when tab changes and track tool change
  useEffect(() => {
    if (activeTab !== "add-signature") {
      setUploadedFile(null);
    }
    setUploadedFiles([]);
    setResult(null);
    
    // Track tool change and update page title
    const toolName = toolNameMap[activeTab] || activeTab;
    if (typeof document !== "undefined") {
      document.title = `PDF Tools - ${toolName} | Trevnoctilla`;
    }
    
    // Track tool change event
    internalAnalytics.track("pdf_tool_change", {
      tool_id: activeTab,
      tool_name: toolName,
      page: typeof window !== "undefined" ? window.location.pathname : "/tools/pdf-tools",
      timestamp: Date.now(),
    });
    
    // Track page view with updated title
    internalAnalytics.trackPageView(undefined, `PDF Tools - ${toolName}`);
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
    setUploadProgress(0);

    // Progress simulation for extract-text (large files can take time)
    const simulateProgress = () => {
      return new Promise<void>((resolve) => {
        let progress = 0;
        const totalDuration = file.size > 5 * 1024 * 1024 ? 10000 : 6000; // 10s for large files, 6s for small
        const updateInterval = 100;
        const totalSteps = totalDuration / updateInterval;
        const progressIncrement = 85 / totalSteps; // Go to 85%, then wait for response

        const updateProgress = () => {
          if (progress < 85) {
            progress += progressIncrement;
            setUploadProgress(Math.min(progress, 85));
            setTimeout(updateProgress, updateInterval);
          } else {
            resolve();
          }
        };

        updateProgress();
      });
    };

    // Start progress simulation
    const progressPromise = simulateProgress();

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

      // Wait for progress to reach 85% or fetch to complete
      const [_, response] = await Promise.all([
        progressPromise,
        fetch(`${getApiUrl("")}${endpoint}`, {
          method: "POST",
          body: formData,
        }),
      ]);

      // Complete progress to 100%
      setUploadProgress(100);

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
      setResult({
        type: "error",
        message: "Error processing file. Please try again.",
      });
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
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
      uploadProgress,
    };

    switch (activeTab) {
      case "extract-text":
        return <ExtractTextTool {...commonProps} />;
      case "extract-images":
        return <ExtractImagesTool {...commonProps} />;
      case "pdf-to-html":
        return isMobile ? (
          <MobilePdfToHtmlTool {...commonProps} />
        ) : (
          <PdfToHtmlTool {...commonProps} />
        );
      case "html-to-pdf":
        return isMobile ? (
          <MobileHtmlToPdfTool {...commonProps} />
        ) : (
          <HtmlToPdfTool {...commonProps} />
        );
      case "edit-pdf":
        return isMobile ? (
          <MobileEditPdfTool {...commonProps} />
        ) : (
          <EditPdfTool {...commonProps} />
        );
      case "edit-fill-sign":
        return isMobile ? (
          <MobileEditFillSignTool {...commonProps} />
        ) : (
          <EditFillSignTool {...commonProps} />
        );
      case "add-signature":
        return isMobile ? (
          <MobileAddSignatureTool {...commonProps} />
        ) : (
          <AddSignatureTool {...commonProps} />
        );
      case "add-watermark":
        return isMobile ? (
          <MobileAddImageTool {...commonProps} />
        ) : (
          <AddWatermarkTool {...commonProps} />
        );
      case "split-pdf":
        return isMobile ? (
          <MobileSplitPdfTool {...commonProps} />
        ) : (
          <SplitPdfTool {...commonProps} />
        );
      case "merge-pdfs":
        return isMobile ? (
          <MobileMergePdfsTool
            {...commonProps}
            uploadedFiles={uploadedFiles}
            setUploadedFiles={setUploadedFiles}
          />
        ) : (
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
      {/* Progress Modal for ALL tools */}
      <PDFProcessingModal
        isOpen={isProcessing}
        progress={uploadProgress}
        fileName={uploadedFile?.name}
      />
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

        {/* Related Tools Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16 pt-8 border-t border-gray-700/50"
        >
          <h3 className="text-xl font-semibold text-white mb-4 text-center">
            Related Tools
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/tools/image-converter"
              className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-lg transition-all text-sm"
            >
              Image Converter
            </a>
            <a
              href="/tools/video-converter"
              className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-lg transition-all text-sm"
            >
              Video Converter
            </a>
            <a
              href="/tools/audio-converter"
              className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-lg transition-all text-sm"
            >
              Audio Converter
            </a>
            <a
              href="/tools/qr-generator"
              className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-lg transition-all text-sm"
            >
              QR Code Generator
            </a>
            <a
              href="/features"
              className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-lg transition-all text-sm"
            >
              View All Features
            </a>
          </div>
        </motion.div>
      </div>

      {/* Monetization removed - using Google AdSense only */}
    </div>
  );
}

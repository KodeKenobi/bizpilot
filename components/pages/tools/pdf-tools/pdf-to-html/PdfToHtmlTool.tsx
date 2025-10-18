"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMonetization } from "@/hooks/useMonetization";
import MonetizationModal from "@/components/ui/MonetizationModal";
import { getApiUrl } from "@/lib/config";
import { motion } from "framer-motion";
import { FileText, Upload, Download, Settings, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface PdfToHtmlToolProps {
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

export const PdfToHtmlTool: React.FC<PdfToHtmlToolProps> = ({
  uploadedFile,
  setUploadedFile,
  result,
  setResult,
  isProcessing,
  setIsProcessing,
  handleFileUpload,
}) => {
  const [file, setFile] = useState<File | null>(uploadedFile);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [warning, setWarning] = useState("");
  const [originalFileSize, setOriginalFileSize] = useState<number | null>(null);
  const [convertedFileSize, setConvertedFileSize] = useState<number | null>(null);
  const [conversionResult, setConversionResult] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [hasViewed, setHasViewed] = useState(false);
  
  // Conversion options
  const [includeImages, setIncludeImages] = useState(true);
  const [preserveLayout, setPreserveLayout] = useState(true);
  const [includeCSS, setIncludeCSS] = useState(true);
  const [imageFormat, setImageFormat] = useState<"embedded" | "linked">("embedded");
  const [cssLevel, setCssLevel] = useState<"basic" | "advanced">("basic");

  const {
    monetizationState,
    openMonetizationModal,
    closeMonetizationModal,
    handleAdComplete,
    handlePaymentComplete,
  } = useMonetization();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const pdfFile = acceptedFiles[0];
      if (pdfFile && pdfFile.type === "application/pdf") {
        setFile(pdfFile);
        setUploadedFile(pdfFile);
        handleFileUpload(pdfFile);
        setOriginalFileSize(pdfFile.size);
        setConvertedFileSize(null);
        setConversionResult(null);
        setProgress(0);
        setWarning("");
      } else {
        setWarning("Please upload a valid PDF file.");
      }
    },
    [setUploadedFile, handleFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: false,
  });

  const convertPdfToHtml = async () => {
    if (!file) return;

    setIsProcessing(true);
    setLoading(true);
    setProgress(0);
    setConversionResult(null);
    setWarning("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("includeImages", includeImages.toString());
      formData.append("preserveLayout", preserveLayout.toString());
      formData.append("includeCSS", includeCSS.toString());
      formData.append("imageFormat", imageFormat);
      formData.append("cssLevel", cssLevel);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 200);

      const response = await fetch(`${getApiUrl("")}/convert-pdf-to-html`, {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        throw new Error("Failed to convert PDF to HTML");
      }

      const result = await response.json();
      
      // Construct full URL using the backend base URL
      const fullDownloadUrl = result.downloadUrl.startsWith('http') 
        ? result.downloadUrl 
        : `${getApiUrl('')}${result.downloadUrl}`;
      
      setConversionResult(fullDownloadUrl);
      setConvertedFileSize(result.convertedSize);
      setResult({
        type: "success",
        message: "PDF converted to HTML successfully!",
        data: result,
      });
    } catch (error) {
      console.error("Error converting PDF to HTML:", error);
      setResult({
        type: "error",
        message: "Error converting PDF to HTML. Please try again.",
      });
    } finally {
      setLoading(false);
      setIsProcessing(false);
    }
  };

  const handleView = () => {
    if (conversionResult) {
      const viewUrl = getApiUrl(conversionResult);
      window.open(viewUrl, '_blank');
      setHasViewed(true);
    }
  };

  const handleDownload = () => {
    if (conversionResult) {
      openMonetizationModal(
        file?.name?.replace('.pdf', '.html') || 'converted.html',
        'html',
        conversionResult
      );
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "0 B";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const compressionRatio = originalFileSize && convertedFileSize 
    ? ((originalFileSize - convertedFileSize) / originalFileSize * 100).toFixed(1)
    : null;

  return (
    <div className="space-y-6">
      {/* File Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">PDF to HTML Converter</h2>
          <p className="text-gray-400">
            Convert your PDF documents to HTML format for web viewing and editing
          </p>
        </div>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
            isDragActive
              ? "border-cyan-400 bg-cyan-400/10"
              : "border-gray-600 hover:border-cyan-400 hover:bg-cyan-400/5"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          {isDragActive ? (
            <p className="text-cyan-400 font-medium">Drop the PDF file here...</p>
          ) : (
            <div>
              <p className="text-gray-300 mb-2">
                Drag & drop a PDF file here, or click to select
              </p>
              <p className="text-sm text-gray-500">Supports PDF files up to 50MB</p>
            </div>
          )}
        </div>

        {file && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 p-4 bg-gray-700/30 rounded-lg border border-gray-600/50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-red-400" />
                <div>
                  <p className="text-white font-medium break-words">{file.name}</p>
                  <p className="text-sm text-gray-400">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  setUploadedFile(null);
                  setOriginalFileSize(null);
                  setConvertedFileSize(null);
                  setConversionResult(null);
                  setProgress(0);
                }}
                className="text-red-400 hover:text-red-300 text-xs sm:text-sm px-2 py-1 rounded"
              >
                Remove
              </button>
            </div>
          </motion.div>
        )}

        {warning && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center space-x-2"
          >
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            <p className="text-yellow-400 text-sm">{warning}</p>
          </motion.div>
        )}
      </motion.div>

      {/* Conversion Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Conversion Options
          </h3>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-cyan-400 hover:text-cyan-300 text-sm font-medium"
          >
            {showAdvanced ? "Hide Advanced" : "Show Advanced"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={includeImages}
                onChange={(e) => setIncludeImages(e.target.checked)}
                className="w-4 h-4 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
              />
              <span className="text-gray-300">Include Images</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={preserveLayout}
                onChange={(e) => setPreserveLayout(e.target.checked)}
                className="w-4 h-4 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
              />
              <span className="text-gray-300">Preserve Layout</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={includeCSS}
                onChange={(e) => setIncludeCSS(e.target.checked)}
                className="w-4 h-4 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
              />
              <span className="text-gray-300">Include CSS Styling</span>
            </label>
          </div>

          {showAdvanced && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Image Format
                </label>
                <select
                  value={imageFormat}
                  onChange={(e) => setImageFormat(e.target.value as "embedded" | "linked")}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="embedded">Embedded (Base64)</option>
                  <option value="linked">Linked Files</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  CSS Level
                </label>
                <select
                  value={cssLevel}
                  onChange={(e) => setCssLevel(e.target.value as "basic" | "advanced")}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="basic">Basic Styling</option>
                  <option value="advanced">Advanced Styling</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Convert Button */}
      {file && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <button
            onClick={convertPdfToHtml}
            disabled={loading || isProcessing}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center mx-auto"
          >
            {loading || isProcessing ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Converting PDF to HTML...
              </>
            ) : (
              <>
                <FileText className="h-5 w-5 mr-2" />
                Convert to HTML
              </>
            )}
          </button>
        </motion.div>
      )}

      {/* Progress Bar */}
      {loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
        >
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Converting PDF to HTML...</span>
              <span className="text-cyan-400">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-6 border ${
            result.type === "success"
              ? "bg-green-500/10 border-green-500/20"
              : "bg-red-500/10 border-red-500/20"
          }`}
        >
          <div className="flex items-center space-x-3 mb-4">
            {result.type === "success" ? (
              <CheckCircle className="h-6 w-6 text-green-400" />
            ) : (
              <AlertCircle className="h-6 w-6 text-red-400" />
            )}
            <h3 className={`text-lg font-semibold ${
              result.type === "success" ? "text-green-400" : "text-red-400"
            }`}>
              {result.type === "success" ? "Conversion Successful!" : "Conversion Failed"}
            </h3>
          </div>

          <p className={`mb-4 ${
            result.type === "success" ? "text-green-300" : "text-red-300"
          }`}>
            {result.message}
          </p>

          {result.type === "success" && result.data && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-800/30 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-gray-400">Original Size</p>
                  <p className="text-white font-semibold">
                    {formatFileSize(originalFileSize)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">HTML Size</p>
                  <p className="text-white font-semibold">
                    {formatFileSize(convertedFileSize)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">Size Reduction</p>
                  <p className="text-cyan-400 font-semibold">
                    {compressionRatio ? `${compressionRatio}%` : "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                {!hasViewed ? (
                  <button
                    onClick={handleView}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center"
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    View HTML
                  </button>
                ) : (
                  <button
                    onClick={handleDownload}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Download HTML File
                  </button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}

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
};

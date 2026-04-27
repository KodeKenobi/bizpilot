"use client";

import React, { useState, useEffect } from "react";
import { PDFFileUpload } from "@/components/ui/PDFFileUpload";
import { useMonetization } from "@/contexts/MonetizationProvider";
import { getApiUrl } from "@/lib/config";
import {
  Download,
  FileText,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface HtmlToPdfToolProps {
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  result: any;
  setResult: (result: any) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  handleFileUpload: (file: File) => void;
}

export const HtmlToPdfTool: React.FC<HtmlToPdfToolProps> = ({
  uploadedFile,
  setUploadedFile,
  result,
  setResult,
  isProcessing,
  setIsProcessing,
  handleFileUpload,
}) => {
  const { showModal: showMonetizationModal } = useMonetization();
  const [convertedFilename, setConvertedFilename] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (uploadedFile && !result && !isProcessing) {
      convertHtmlToPdf(uploadedFile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadedFile]);

  const convertHtmlToPdf = async (file: File) => {
    setIsProcessing(true);
    setResult(null);
    setConvertedFilename(null);

    try {
      const formData = new FormData();
      formData.append("html", file);

      const response = await fetch(getApiUrl("/convert_html_to_pdf"), {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Failed to convert HTML" }));

        throw new Error(
          errorData.error ||
            errorData.message ||
            "Failed to convert HTML to PDF"
        );
      }

      const data = await response.json();

      if (data.status === "success") {
        setConvertedFilename(data.converted_filename);
        setResult({
          type: "success",
          message: data.message || "HTML converted to PDF successfully",
          data: data,
        });
      } else {
        throw new Error(data.error || data.message || "Conversion failed");
      }
    } catch (error: any) {
      setResult({
        type: "error",
        message:
          error.message || "Error converting HTML to PDF. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadPdf = async () => {
    if (!convertedFilename) return;

    // Create download URL BEFORE showing modal so it can be stored for PayFast payments
    const downloadUrl = `${getApiUrl("/download_edited")}/${convertedFilename}`;

    const completed = await showMonetizationModal({
      title: "Download PDF",
      message: `Choose how you'd like to download ${convertedFilename}`,
      fileName: convertedFilename,
      fileType: "PDF",
      downloadUrl, // Pass download URL so it's stored for PayFast payments
    });

    if (completed) {
      // Use proper download method instead of window.open
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = convertedFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!uploadedFile) {
    return (
      <PDFFileUpload
        title="Convert HTML to PDF"
        description="Upload an HTML file to convert it to PDF format"
        onFileSelect={handleFileUpload}
        accept=".html,.htm"
        buttonText="Choose HTML File"
        dragText="Drag and drop your HTML file here, or click to browse"
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* File Info */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-white" />
            <div>
              <h3 className="text-white font-medium text-sm sm:text-base">
                {uploadedFile.name}
              </h3>
              <p className="text-gray-400 text-xs sm:text-sm">
                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setUploadedFile(null);
              setResult(null);
              setConvertedFilename(null);
            }}
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            Change File
          </button>
        </div>

        {/* Processing State */}
        {isProcessing && (
          <div className="flex flex-col items-center justify-center py-8 sm:py-12">
            <Loader2 className="w-8 h-8 sm:w-12 sm:h-12 text-white animate-spin mb-4" />
            <p className="text-gray-300 text-sm sm:text-base">
              Converting HTML to PDF...
            </p>
            <p className="text-gray-500 text-xs sm:text-sm mt-2">
              This may take a few moments
            </p>
          </div>
        )}

        {/* Success State */}
        {result && result.type === "success" && !isProcessing && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-green-400 font-medium text-sm sm:text-base">
                  Conversion Successful!
                </p>
                <p className="text-gray-400 text-xs sm:text-sm mt-1">
                  Your HTML has been converted to PDF format
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={downloadPdf}
                className="flex-1 flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-3 px-6 rounded-lg transition-colors text-sm sm:text-base"
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                Download PDF File
              </button>
            </div>

            <div className="mt-4 p-4 bg-gray-900/50 rounded-lg">
              <p className="text-gray-400 text-xs sm:text-sm mb-2">
                Converted File:
              </p>
              <p className="text-white text-sm sm:text-base font-mono break-all">
                {convertedFilename}
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {result && result.type === "error" && !isProcessing && (
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-400 font-medium text-sm sm:text-base">
                Conversion Failed
              </p>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">
                {result.message}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

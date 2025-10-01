"use client";

import React, { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { useMonetization } from "@/hooks/useMonetization";
import MonetizationModal from "@/components/ui/MonetizationModal";

interface ExtractTextToolProps {
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  result: any;
  setResult: (result: any) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  handleFileUpload: (file: File) => void;
}

export const ExtractTextTool: React.FC<ExtractTextToolProps> = ({
  uploadedFile,
  setUploadedFile,
  result,
  setResult,
  isProcessing,
  setIsProcessing,
  handleFileUpload,
}) => {
  const [previewFormat, setPreviewFormat] = useState<string>("txt");
  const {
    monetizationState,
    openMonetizationModal,
    closeMonetizationModal,
    handleAdComplete,
    handlePaymentComplete,
  } = useMonetization();

  const getPreviewContent = () => {
    if (!result?.data?.text || !uploadedFile) return "";

    switch (previewFormat) {
      case "txt":
        return result.data.text;
      case "md":
        return `# ${uploadedFile.name}\n\n${result.data.text}`;
      case "json":
        return JSON.stringify(
          {
            fileName: uploadedFile.name,
            page_count: result.data.page_count,
            text: result.data.text,
            extracted_at: new Date().toISOString(),
          },
          null,
          2
        );
      case "csv":
        return `Page,Content\n1,"${result.data.text.replace(/"/g, '""')}"`;
      default:
        return result.data.text;
    }
  };

  const downloadText = (format: string, mimeType: string) => {
    if (!result?.data?.text || !uploadedFile) return;

    let content = result.data.text;
    let fileName = `${uploadedFile.name.replace(".pdf", "")}_extracted_text`;

    switch (format) {
      case "txt":
        content = result.data.text;
        fileName += ".txt";
        break;
      case "md":
        content = `# ${uploadedFile.name}\n\n${result.data.text}`;
        fileName += ".md";
        break;
      case "json":
        content = JSON.stringify(
          {
            fileName: uploadedFile.name,
            page_count: result.data.page_count,
            text: result.data.text,
            extracted_at: new Date().toISOString(),
          },
          null,
          2
        );
        fileName += ".json";
        break;
      case "csv":
        content = `Page,Content\n1,"${result.data.text.replace(/"/g, '""')}"`;
        fileName += ".csv";
        break;
    }

    openMonetizationModal(fileName, format.toUpperCase(), "");
  };

  if (!uploadedFile) {
    return (
      <div className="w-full max-w-4xl mx-auto min-h-96 bg-gray-800/40 rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-white text-xl font-semibold mb-2">
              Extract Text from PDF
            </h3>
            <p className="text-gray-400 text-sm">
              Upload a PDF file to extract text content
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
      {result && result.type === "success" && result.data && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
          {/* Download Format Selector - At the Top */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">
                {result.data.page_count} pages processed
              </span>
              <div className="flex items-center gap-3">
                <span className="text-gray-500 text-sm">Download as:</span>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      const [format, mimeType] = e.target.value.split(",");
                      downloadText(format, mimeType);
                      e.target.value = ""; // Reset selection
                    }
                  }}
                  className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="">Choose format...</option>
                  <option value="txt,text/plain">Text (.txt)</option>
                  <option value="md,text/markdown">Markdown (.md)</option>
                  <option value="json,application/json">JSON (.json)</option>
                  <option value="csv,text/csv">CSV (.csv)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div>
              {/* Extracted Text - Non-copyable */}
              <div className="bg-gray-900/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre
                  className="text-gray-300 text-sm whitespace-pre-wrap select-none"
                  style={{
                    userSelect: "none",
                    WebkitUserSelect: "none",
                    MozUserSelect: "none",
                    msUserSelect: "none",
                  }}
                >
                  {result.data.text}
                </pre>
              </div>

              {/* Format Preview - Non-copyable */}
              <div className="mt-4 bg-gray-900/50 rounded-lg p-4">
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
                  <pre
                    className="text-gray-300 text-xs whitespace-pre-wrap select-none"
                    style={{
                      userSelect: "none",
                      WebkitUserSelect: "none",
                      MozUserSelect: "none",
                      msUserSelect: "none",
                    }}
                  >
                    {getPreviewContent()}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

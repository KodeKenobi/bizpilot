"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMonetization } from "@/contexts/MonetizationProvider";
import { getApiUrl } from "@/lib/config";

interface ImageConverterToolProps {
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

export const ImageConverterTool: React.FC<ImageConverterToolProps> = ({
  uploadedFile,
  setUploadedFile,
  result,
  setResult,
  isProcessing,
  setIsProcessing,
  handleFileUpload,
}) => {
  const { showModal: showMonetizationModal } = useMonetization();
  const [file, setFile] = useState<File | null>(uploadedFile);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [warning, setWarning] = useState("");
  const [originalFileSize, setOriginalFileSize] = useState<number | null>(null);
  const [convertedFileSize, setConvertedFileSize] = useState<number | null>(
    null
  );
  const [conversionResult, setConversionResult] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<
    "jpg" | "png" | "webp" | "bmp" | "tiff" | "gif" | "pdf"
  >("jpg");
  const [quality, setQuality] = useState(85);
  const [resize, setResize] = useState(false);
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);

  // Monetization removed - using Google AdSense only

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const imageFile = acceptedFiles[0];
        setFile(imageFile);
        setUploadedFile(imageFile);
        handleFileUpload(imageFile);
        setOriginalFileSize(imageFile.size);
        setConvertedFileSize(null);
        setConversionResult(null);
        setProgress(0);
        setWarning("");
      }
    },
    [setUploadedFile, handleFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff", ".gif"],
    },
    multiple: false,
  });

  const convert = async () => {
    if (!file) return;

    setIsProcessing(true);
    setLoading(true);
    setProgress(0);
    setConversionResult(null);
    setWarning("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("outputFormat", outputFormat);
      formData.append("quality", quality.toString());
      formData.append("resize", resize.toString());
      formData.append("width", width.toString());
      formData.append("height", height.toString());
      formData.append("maintainAspectRatio", maintainAspectRatio.toString());
      formData.append("compression", "medium");

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 200);

      const response = await fetch(getApiUrl("/convert-image"), {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (response.ok) {
        const result = await response.json();

        // Check if conversion was successful
        if (result.success && result.downloadUrl) {
          // Construct full URL using the backend base URL
          const fullDownloadUrl = result.downloadUrl.startsWith("http")
            ? result.downloadUrl
            : `${getApiUrl("")}${result.downloadUrl}`;
          setConversionResult(fullDownloadUrl);
          setConvertedFileSize(result.convertedSize);
          setResult({
            type: "success",
            message: result.message || "Image converted successfully!",
            data: result,
          });
        } else {
          setResult({
            type: "error",
            message:
              result.error ||
              result.message ||
              "Conversion failed - no download URL provided",
          });
        }
      } else {
        const error = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        setResult({
          type: "error",
          message: error.error || error.message || "Conversion failed",
        });
      }
    } catch (error) {
      setResult({
        type: "error",
        message: "Network error occurred",
      });
    } finally {
      setIsProcessing(false);
      setLoading(false);
    }
  };

  // Direct download - monetization removed
  const handleDirectDownload = () => {
    if (conversionResult) {
      try {
        window.open(conversionResult, "_blank");
      } catch (error) {
        window.open(conversionResult, "_blank");
      }
    }
  };

  const downloadResult = async () => {
    if (conversionResult) {
      // Verify the download URL is accessible before showing monetization modal
      try {
        const response = await fetch(conversionResult, { method: "HEAD" });
        if (!response.ok) {
          setResult({
            type: "error",
            message: `File not found. The converted file may have been removed. Please try converting again.`,
          });
          return;
        }
      } catch (error) {
        // Continue anyway - might be a CORS issue with HEAD request
      }

      const completed = await showMonetizationModal({
        title: outputFormat === "pdf" ? "Download PDF" : "Download Image",
        message: `Choose how you'd like to download ${
          file?.name || outputFormat === "pdf" ? "this image" : "this image"
        }`,
        fileName: file?.name || `converted.${outputFormat}`,
        fileType: outputFormat === "pdf" ? "PDF" : "image",
        downloadUrl: conversionResult,
      });

      if (completed) {
        // Try to download the file using download link
        try {
          const link = document.createElement("a");
          link.href = conversionResult;
          const downloadName = file?.name
            ? file.name.replace(/\.[^/.]+$/, "") + `.${outputFormat}`
            : `converted.${outputFormat}`;
          link.download = downloadName;
          link.style.display = "none";
          document.body.appendChild(link);
          link.click();

          // Clean up after a delay
          setTimeout(() => {
            document.body.removeChild(link);
          }, 100);
        } catch (error) {
          // Fallback: open in new tab if download fails
          window.open(conversionResult, "_blank");
        }
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // If no file is selected, show the PDF-style upload UI
  if (!file && !isProcessing) {
    return (
      <div className="w-full max-w-4xl mx-auto min-h-96 bg-gray-800/40 rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="text-center mb-6"></div>

          <div
            {...getRootProps()}
            className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-gray-500 transition-colors"
          >
            <input {...getInputProps()} />
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="mb-4">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  open();
                }}
                className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors inline-block"
              >
                Choose File
              </button>
            </div>
            <p className="text-gray-400 text-sm">
              {isDragActive
                ? "Drop the image file here"
                : "Drag and drop your image here, or click to browse"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto min-h-96 bg-gray-800/40 rounded-lg overflow-hidden">
      <div className="p-6">
        <div className="text-center mb-6"></div>

        {file && (
          <div className="mb-4 p-3 bg-gray-700 rounded-lg border border-gray-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-200 break-words">
                Selected file:{" "}
                <span className="font-medium text-white break-words">
                  {file.name}
                </span>
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-1">
                <p className="text-xs text-gray-400">
                  Original size:{" "}
                  <span className="text-blue-300 font-medium">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </p>
                {convertedFileSize && (
                  <p className="text-xs text-gray-400">
                    Converted size:{" "}
                    <span className="text-green-300 font-medium">
                      {(convertedFileSize / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </p>
                )}
                {originalFileSize && convertedFileSize && (
                  <p className="text-xs text-gray-400">
                    {convertedFileSize < originalFileSize ? (
                      <>
                        Compression:{" "}
                        <span className="text-purple-300 font-medium">
                          {(
                            ((originalFileSize - convertedFileSize) /
                              originalFileSize) *
                            100
                          ).toFixed(1)}
                          % reduction
                        </span>
                      </>
                    ) : (
                      <>
                        Size change:{" "}
                        <span className="text-orange-300 font-medium">
                          {(
                            ((convertedFileSize - originalFileSize) /
                              originalFileSize) *
                            100
                          ).toFixed(1)}
                          % increase
                        </span>
                      </>
                    )}
                  </p>
                )}
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
        )}

        {warning && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
            {warning}
          </div>
        )}

        {/* Format and Quality Controls */}
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
              Output Format
            </label>
            <select
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value as any)}
              className="w-full p-2 sm:p-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="jpg">JPEG (.jpg)</option>
              <option value="png">PNG (.png)</option>
              <option value="webp">WebP (.webp)</option>
              <option value="bmp">BMP (.bmp)</option>
              <option value="tiff">TIFF (.tiff)</option>
              <option value="gif">GIF (.gif)</option>
              <option value="pdf">PDF (.pdf)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
              Quality: {quality}%
            </label>
            <input
              type="range"
              min="10"
              max="100"
              value={quality}
              onChange={(e) => setQuality(parseInt(e.target.value))}
              disabled={outputFormat === "pdf"}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {outputFormat === "pdf" && (
              <p className="text-xs text-gray-400 mt-1">
                Quality setting not applicable for PDF
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="resize"
              checked={resize}
              onChange={(e) => setResize(e.target.checked)}
              disabled={outputFormat === "pdf"}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <label
              htmlFor="resize"
              className="text-xs sm:text-sm text-gray-300"
            >
              Resize image
            </label>
            {outputFormat === "pdf" && (
              <span className="text-xs text-gray-400">
                (Not available for PDF)
              </span>
            )}
          </div>
        </div>

        {resize && (
          <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                Width (px)
              </label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value))}
                className="w-full p-2 sm:p-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                Height (px)
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value))}
                className="w-full p-2 sm:p-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="maintainAspectRatio"
                checked={maintainAspectRatio}
                onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="maintainAspectRatio"
                className="text-xs sm:text-sm text-gray-300"
              >
                Maintain aspect ratio
              </label>
            </div>
          </div>
        )}

        {/* Convert Button */}
        <div className="mb-4">
          <button
            onClick={convert}
            disabled={isProcessing || !file}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm sm:text-base"
          >
            {isProcessing ? "Converting..." : "Convert Image"}
          </button>
        </div>

        {/* Progress Bar */}
        {isProcessing && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-gray-300">
                Converting...
              </span>
              <span className="text-xs sm:text-sm text-gray-400">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div
            className={`p-4 rounded-lg border ${
              result.type === "success"
                ? "bg-green-900/20 border-green-500/50 text-green-300"
                : "bg-red-900/20 border-red-500/50 text-red-300"
            }`}
          >
            <p className="text-sm">{result.message}</p>
            {result.type === "success" && conversionResult && (
              <button
                onClick={downloadResult}
                className="mt-3 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
              >
                Download Converted Image
              </button>
            )}
          </div>
        )}

        {/* Monetization removed - using Google AdSense only */}
      </div>
    </div>
  );
};

export default ImageConverterTool;

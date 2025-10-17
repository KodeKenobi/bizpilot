"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMonetization } from "@/hooks/useMonetization";
import MonetizationModal from "@/components/ui/MonetizationModal";
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
    "jpg" | "png" | "webp" | "bmp" | "tiff" | "gif"
  >("jpg");
  const [quality, setQuality] = useState(85);
  const [resize, setResize] = useState(false);
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);

  const {
    monetizationState,
    openMonetizationModal,
    closeMonetizationModal,
    handleAdComplete,
    handlePaymentComplete,
  } = useMonetization();

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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
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
        setConversionResult(result.downloadUrl);
        setConvertedFileSize(result.convertedSize);
        setResult({
          type: "success",
          message: "Image converted successfully!",
          data: result,
        });
      } else {
        const error = await response.json();
        setResult({
          type: "error",
          message: error.message || "Conversion failed",
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

  const handleAdCompleteWithDownload = () => {
    handleAdComplete();
    if (conversionResult) {
      try {
        window.open(conversionResult, "_blank");
      } catch (error) {
        window.open(conversionResult, "_blank");
      }
    }
  };

  const handlePaymentCompleteWithDownload = () => {
    handlePaymentComplete();
    if (conversionResult) {
      try {
        window.open(conversionResult, "_blank");
      } catch (error) {
        window.open(conversionResult, "_blank");
      }
    }
  };

  const downloadResult = () => {
    if (conversionResult) {
      openMonetizationModal(
        file?.name || "converted-image",
        "image",
        conversionResult
      );
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-gray-800 shadow-soft max-w-4xl mx-auto">
      <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white">
        Universal Image Converter
      </h3>
      <p className="text-xs sm:text-sm text-gray-300 mb-4">
        Convert images between all formats with resize and quality control.
      </p>

      <div
        {...getRootProps()}
        className={`dropzone ${
          isDragActive ? "dropzone-active" : ""
        } mb-4 p-4 sm:p-8`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-gray-300 text-sm sm:text-base">
            Drop the image file here ...
          </p>
        ) : (
          <p className="text-gray-300 text-sm sm:text-base">
            Drag 'n' drop any image file here, or click to select file
          </p>
        )}
      </div>

      {file && (
        <div className="mb-4 p-3 bg-gray-700 rounded-lg border border-gray-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm text-gray-200 truncate">
              Selected file:{" "}
              <span className="font-medium text-white">{file.name}</span>
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
                  Compression:{" "}
                  <span className="text-purple-300 font-medium">
                    {(
                      ((originalFileSize - convertedFileSize) /
                        originalFileSize) *
                      100
                    ).toFixed(1)}
                    % reduction
                  </span>
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
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="resize"
            checked={resize}
            onChange={(e) => setResize(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="resize" className="text-xs sm:text-sm text-gray-300">
            Resize image
          </label>
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

      {/* Monetization Modal */}
      <MonetizationModal
        isOpen={monetizationState.isModalOpen}
        onClose={closeMonetizationModal}
        onAdComplete={handleAdCompleteWithDownload}
        onPaymentComplete={handlePaymentCompleteWithDownload}
        fileName={monetizationState.fileName}
        fileType={monetizationState.fileType}
      />
    </div>
  );
};

export default ImageConverterTool;

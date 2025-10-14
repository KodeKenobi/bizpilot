"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMonetization } from "@/hooks/useMonetization";
import MonetizationModal from "@/components/ui/MonetizationModal";

interface VideoConverterToolProps {
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

export const VideoConverterTool: React.FC<VideoConverterToolProps> = ({
  uploadedFile,
  setUploadedFile,
  result,
  setResult,
  isProcessing,
  setIsProcessing,
  handleFileUpload,
}) => {
  const {
    monetizationState,
    openMonetizationModal,
    closeMonetizationModal,
    handleAdComplete,
    handlePaymentComplete,
  } = useMonetization();

  const handleAdCompleteWithDownload = () => {
    handleAdComplete();
    handleDownloadAfterMonetization();
  };

  const handlePaymentCompleteWithDownload = () => {
    handlePaymentComplete();
    handleDownloadAfterMonetization();
  };

  const [file, setFile] = useState<File | null>(uploadedFile);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [warning, setWarning] = useState("");
  const [conversionResult, setConversionResult] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState("mp4");
  const [quality, setQuality] = useState(80);
  const [compression, setCompression] = useState("medium");
  const [originalFileSize, setOriginalFileSize] = useState<number | null>(null);
  const [convertedFileSize, setConvertedFileSize] = useState<number | null>(
    null
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const videoFile = acceptedFiles[0];
      if (!videoFile) return;

      // Check file size (500MB limit)
      const maxSize = 500 * 1024 * 1024;
      if (videoFile.size > maxSize) {
        setWarning(
          `File is too large (${(videoFile.size / 1024 / 1024).toFixed(
            2
          )} MB). Max size is ${maxSize / 1024 / 1024} MB.`
        );
        return;
      }

      // Check if it's a video file
      if (!videoFile.type.startsWith("video/")) {
        setWarning(
          "Please select a video file (MP4, AVI, MOV, MKV, WEBM, FLV, WMV, etc.)"
        );
        return;
      }

      setFile(videoFile);
      setUploadedFile(videoFile);
      setOriginalFileSize(videoFile.size);
      setConvertedFileSize(null);
      setWarning("");
      setConversionResult(null);
    },
    [setUploadedFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [
        ".mp4",
        ".avi",
        ".mov",
        ".mkv",
        ".webm",
        ".flv",
        ".wmv",
        ".m4v",
        ".3gp",
        ".ogv",
      ],
    },
    multiple: false,
  });

  const convert = async () => {
    if (!file) {
      setWarning("Please select a video file first.");
      return;
    }

    setLoading(true);
    setProgress(0);
    setWarning("");
    setConversionResult(null);

    // Simple progress animation that goes to 90% and waits
    let currentProgress = 0;
    let isBackendComplete = false;

    const progressStep = () => {
      if (isBackendComplete) {
        // Backend is done, smoothly finish to 100%
        if (currentProgress < 100) {
          currentProgress += 2; // Faster finish
          const roundedProgress = Math.round(currentProgress);
          setProgress(roundedProgress);
          console.log(
            `📊 [PROGRESS] Backend complete - finishing: ${roundedProgress}%`
          );
          setTimeout(progressStep, 30); // Faster interval
        }
      } else {
        // Backend still working, slowly progress to 90%
        if (currentProgress < 90) {
          currentProgress += 0.8; // Faster increment
          const roundedProgress = Math.round(currentProgress);
          setProgress(roundedProgress);
          console.log(`📊 [PROGRESS] Processing: ${roundedProgress}%`);
          setTimeout(progressStep, 80); // Faster interval
        } else {
          // Stay at 90% until backend completes
          setProgress(90);
          console.log(`📊 [PROGRESS] Waiting at 90% for backend completion...`);
          setTimeout(progressStep, 200); // Much faster polling
        }
      }
    };
    progressStep();

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("outputFormat", outputFormat);
      formData.append("quality", quality.toString());
      formData.append("compression", compression);

      const response = await fetch("http://localhost:5000/convert-video", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === "success") {
        // Backend is complete, trigger smooth finish
        console.log(
          `✅ [BACKEND] Conversion completed successfully at progress: ${Math.round(
            currentProgress
          )}%`
        );
        isBackendComplete = true;

        // Wait for progress to reach 100% before showing success screen
        const checkProgress = () => {
          if (currentProgress >= 100) {
            // Show success screen
            console.log(
              `🎉 [SUCCESS] Progress reached 100%, showing success screen`
            );
            if (result.original_size) {
              setOriginalFileSize(result.original_size);
            }
            if (result.converted_size) {
              setConvertedFileSize(result.converted_size);
            }
            const downloadUrl = `http://localhost:5000${result.download_url}`;
            setConversionResult(downloadUrl);

            setTimeout(() => {
              console.log(
                `🏁 [COMPLETE] Loading state set to false, conversion complete`
              );
              setLoading(false);
            }, 500);
          } else {
            setTimeout(checkProgress, 100);
          }
        };
        checkProgress();
      } else {
        throw new Error(result.message || "Conversion failed");
      }
    } catch (error: any) {
      setWarning(`Conversion failed: ${error?.message || "Unknown error"}`);
      setLoading(false);
    }
  };

  const downloadResult = async () => {
    if (conversionResult) {
      // Show monetization modal before download
      openMonetizationModal(
        file?.name || "video-file",
        "video",
        conversionResult
      );
    }
  };

  const handleDownloadAfterMonetization = async () => {
    if (conversionResult) {
      try {
        const response = await fetch(conversionResult);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        const downloadName = `${
          file?.name.split(".")[0] || "converted"
        }_converted.${outputFormat}`;
        a.download = downloadName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
      } catch (error) {
        window.open(conversionResult, "_blank");
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-gray-800 shadow-soft max-w-4xl mx-auto">
      <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white">
        Universal Video Converter
      </h3>
      <p className="text-xs sm:text-sm text-gray-300 mb-4">
        Convert videos between all formats with compression and quality control.
        Extract audio to MP3.
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
            Drop the video file here ...
          </p>
        ) : (
          <p className="text-gray-300 text-sm sm:text-base">
            Drag 'n' drop any video file here, or click to select file
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
            onChange={(e) => setOutputFormat(e.target.value)}
            className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-700 text-white"
          >
            <option value="mp4">MP4 (H.264)</option>
            <option value="webm">WebM (VP9)</option>
            <option value="avi">AVI</option>
            <option value="mov">MOV (QuickTime)</option>
            <option value="mkv">MKV (Matroska)</option>
            <option value="flv">FLV (Flash)</option>
            <option value="wmv">WMV (Windows Media)</option>
            <option value="m4v">M4V (iTunes)</option>
            <option value="3gp">3GP (Mobile)</option>
            <option value="ogv">OGV (Ogg)</option>
            <option value="mp3">MP3 (Audio Only)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
            Quality Level
          </label>
          <select
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-700 text-white"
          >
            <option value={95}>Ultra High (95%)</option>
            <option value={85}>High (85%)</option>
            <option value={75}>Medium (75%)</option>
            <option value={60}>Low (60%)</option>
            <option value={40}>Very Low (40%)</option>
          </select>
        </div>
        <div className="sm:col-span-2 lg:col-span-1">
          <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
            Compression
          </label>
          <select
            value={compression}
            onChange={(e) => setCompression(e.target.value)}
            className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-700 text-white"
          >
            <option value="none">No Compression</option>
            <option value="light">Light Compression</option>
            <option value="medium">Medium Compression</option>
            <option value="heavy">Heavy Compression</option>
            <option value="web">Web Optimized</option>
          </select>
        </div>
      </div>

      <button
        onClick={convert}
        disabled={!file || loading}
        className="btn btn-primary w-full mb-4 text-sm sm:text-base py-3 sm:py-4"
      >
        {loading
          ? `${
              outputFormat === "mp3" ? "Extracting audio to" : "Converting to"
            } ${outputFormat.toUpperCase()}... ${progress}%`
          : `${
              outputFormat === "mp3" ? "Extract Audio to" : "Convert to"
            } ${outputFormat.toUpperCase()}`}
      </button>

      {loading && (
        <div className="mb-4">
          <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2">
            <div
              className={`bg-purple-500 h-2.5 rounded-full transition-all duration-300 ease-in-out ${
                progress >= 90 && !conversionResult ? "animate-pulse" : ""
              }`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-center">
                <p className="text-xs text-gray-300 mb-1">
                  {progress >= 90 && !conversionResult
                    ? "Finalizing conversion..."
                    : outputFormat === "mp3"
                    ? "Extracting audio..."
                    : "Processing video..."}
                </p>
            <p className="text-xs text-gray-400">{progress}% complete</p>
          </div>
        </div>
      )}

      {conversionResult && (
        <div className="mb-4 p-3 sm:p-4 bg-green-900/20 border border-green-500/50 rounded-lg">
          <p className="text-green-300 text-xs sm:text-sm mb-2">
            ✅{" "}
            {outputFormat === "mp3"
              ? "Audio extraction completed successfully!"
              : "Conversion completed successfully!"}
          </p>

          {/* File Size Comparison */}
          {originalFileSize && convertedFileSize && (
            <div className="mb-3 p-3 bg-gray-800/50 rounded-lg border border-gray-600">
              <h4 className="text-white text-xs sm:text-sm font-medium mb-2">
                File Size Comparison
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <p className="text-gray-400">Original</p>
                  <p className="text-blue-300 font-medium">
                    {(originalFileSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400">Converted</p>
                  <p className="text-green-300 font-medium">
                    {(convertedFileSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400">Savings</p>
                  <p className="text-purple-300 font-medium">
                    {(
                      (originalFileSize - convertedFileSize) /
                      1024 /
                      1024
                    ).toFixed(2)}{" "}
                    MB
                    <br />
                    <span className="text-xs">
                      (
                      {(
                        ((originalFileSize - convertedFileSize) /
                          originalFileSize) *
                        100
                      ).toFixed(1)}
                      % reduction)
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <button
              onClick={downloadResult}
              className="btn btn-primary text-sm sm:text-base px-8 py-3"
            >
              {outputFormat === "mp3"
                ? "Download Audio File"
                : "Download Converted Video"}
            </button>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-400 text-center mt-4 space-y-1">
        <p>
          Safe encrypted video conversion and audio extraction with our advanced
          algorithmic security
        </p>
        <p>
          Max file size: 500MB | All major formats supported | MP3 audio
          extraction
        </p>
        <p className="hidden sm:block">
          High-performance conversion with quality control, compression options,
          and audio extraction
        </p>
        <p className="sm:hidden">
          High-performance conversion with quality control and audio extraction
        </p>
      </div>

      <MonetizationModal
        isOpen={monetizationState.isModalOpen}
        onClose={closeMonetizationModal}
        onAdComplete={handleAdCompleteWithDownload}
        onPaymentComplete={handlePaymentCompleteWithDownload}
        fileName={file?.name || "video-file"}
        fileType="video"
      />
    </div>
  );
};

"use client";

import React, { useState, useCallback, useEffect } from "react";
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
  };

  const handlePaymentCompleteWithDownload = () => {
    handlePaymentComplete();
  };

  const [file, setFile] = useState<File | null>(uploadedFile);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [warning, setWarning] = useState("");
  const [currentConversionId, setCurrentConversionId] = useState<string | null>(
    null
  );
  const [conversionResult, setConversionResult] = useState<string | null>(null);

  // Handle page refresh/unload - cancel any running conversion
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (currentConversionId && loading) {
        // Cancel the conversion when user refreshes or leaves the page
        cancelConversion();
        event.preventDefault();
        event.returnValue =
          "A video conversion is in progress. Are you sure you want to leave?";
        return "A video conversion is in progress. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [currentConversionId, loading]);
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
      console.log(
        `📊 [SIZE] File selected - Original size: ${videoFile.size} bytes (${(
          videoFile.size /
          1024 /
          1024
        ).toFixed(2)} MB)`
      );
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

  const cancelConversion = async () => {
    if (!currentConversionId) {
      console.log("No active conversion to cancel");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/cancel_conversion/${encodeURIComponent(
          currentConversionId
        )}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (result.status === "success") {
        console.log("Conversion cancelled successfully");
        setLoading(false);
        setProgress(0);
        setCurrentConversionId(null);
        setWarning("Conversion cancelled by user");
      } else {
        console.log("Failed to cancel conversion:", result.message);
      }
    } catch (error) {
      console.error("Error cancelling conversion:", error);
    }
  };

  const convert = async () => {
    if (!file) {
      setWarning("Please select a video file first.");
      return;
    }

    setLoading(true);
    setProgress(0);
    setWarning("");
    setConversionResult(null);
    setCurrentConversionId(null);

    // Use ONLY backend progress - no fake frontend animation
    let progressInterval: NodeJS.Timeout | undefined;
    let uniqueFilename = "";

    // Poll backend for real progress
    const pollProgress = async () => {
      try {
        // Only poll if we have a unique filename from the backend
        if (!uniqueFilename) {
          console.log(`🔍 [DEBUG] No unique filename yet, skipping poll`);
          return false;
        }

        const response = await fetch(
          `http://localhost:5000/conversion_progress/${encodeURIComponent(
            uniqueFilename
          )}`
        );
        const progressData = await response.json();

        console.log(`🔍 [DEBUG] Backend response:`, progressData);
        console.log(
          `🔍 [DEBUG] Polling URL: http://localhost:5000/conversion_progress/${encodeURIComponent(
            uniqueFilename
          )}`
        );
        console.log(`🔍 [DEBUG] Unique filename: ${uniqueFilename}`);

        if (progressData.status === "completed") {
          if (progressInterval) clearInterval(progressInterval);
          setProgress(100);
          console.log(`✅ [BACKEND] Conversion completed at 100%`);

          // Set the conversion result for download
          const downloadUrl = `http://localhost:5000/download_converted_video/${
            progressData.converted_filename ||
            uniqueFilename.replace(/\.[^/.]+$/, "_converted.mp4")
          }`;
          setConversionResult(downloadUrl);

          // Set converted file size if available
          if (progressData.converted_size) {
            setConvertedFileSize(progressData.converted_size);
            console.log(
              `📊 [SIZE] Converted file size: ${
                progressData.converted_size
              } bytes (${(progressData.converted_size / 1024 / 1024).toFixed(
                2
              )} MB)`
            );
          }

          // Stop loading
          setTimeout(() => {
            console.log(
              `🏁 [COMPLETE] Loading state set to false, conversion complete`
            );
            // Log final size comparison
            if (originalFileSize && progressData.converted_size) {
              const compressionRatio =
                ((originalFileSize - progressData.converted_size) /
                  originalFileSize) *
                100;
              console.log(
                `📊 [FINAL] Size comparison - Original: ${(
                  originalFileSize /
                  1024 /
                  1024
                ).toFixed(2)} MB, Converted: ${(
                  progressData.converted_size /
                  1024 /
                  1024
                ).toFixed(2)} MB, Compression: ${compressionRatio.toFixed(1)}%`
              );
            }
            setLoading(false);
            setCurrentConversionId(null);
          }, 500);

          return true;
        } else if (progressData.progress !== undefined) {
          setProgress(progressData.progress);
          console.log(
            `📊 [REAL] Backend progress: ${progressData.progress}% - ${
              progressData.message || "No message"
            }`
          );

          // Update converted file size if available in progress data
          if (progressData.converted_size) {
            setConvertedFileSize(progressData.converted_size);
            console.log(
              `📊 [SIZE] Progress converted size: ${
                progressData.converted_size
              } bytes (${(progressData.converted_size / 1024 / 1024).toFixed(
                2
              )} MB)`
            );
          }
        } else {
          console.log(`⚠️ [DEBUG] No progress data received:`, progressData);
        }
      } catch (error) {
        console.log(`📊 [POLL] Error polling progress: ${error}`);
      }
      return false;
    };

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
        // Store unique filename and start polling
        uniqueFilename = result.unique_filename || file.name;
        setCurrentConversionId(uniqueFilename);
        console.log(`🔍 [DEBUG] Got unique filename: ${uniqueFilename}`);

        // Start polling every 1 second after getting unique filename
        progressInterval = setInterval(pollProgress, 1000);

        console.log(`✅ [BACKEND] Conversion started, polling for progress`);

        if (result.original_size) {
          setOriginalFileSize(result.original_size);
          console.log(
            `📊 [SIZE] Original file size: ${result.original_size} bytes (${(
              result.original_size /
              1024 /
              1024
            ).toFixed(2)} MB)`
          );
        }
        if (result.converted_size) {
          setConvertedFileSize(result.converted_size);
          console.log(
            `📊 [SIZE] Converted file size: ${result.converted_size} bytes (${(
              result.converted_size /
              1024 /
              1024
            ).toFixed(2)} MB)`
          );
        } else {
          console.log(
            `📊 [SIZE] Converted file size will be available when conversion completes`
          );
        }

        // Don't set conversion result yet - wait for actual completion via polling
        console.log(
          `🔄 [INFO] Conversion started, waiting for completion via polling`
        );
      } else {
        throw new Error(result.message || "Conversion failed");
      }
    } catch (error: any) {
      // Clear progress interval on error
      if (progressInterval) clearInterval(progressInterval);
      setWarning(`Conversion failed: ${error?.message || "Unknown error"}`);
      setLoading(false);
      setCurrentConversionId(null);
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

      <div className="flex gap-2 mb-4">
        <button
          onClick={convert}
          disabled={!file || loading}
          className="btn btn-primary flex-1 text-sm sm:text-base py-3 sm:py-4"
        >
          {loading
            ? `${
                outputFormat === "mp3" ? "Extracting audio to" : "Converting to"
              } ${outputFormat.toUpperCase()}... ${progress}%`
            : `${
                outputFormat === "mp3" ? "Extract Audio to" : "Convert to"
              } ${outputFormat.toUpperCase()}`}
        </button>

        {loading && currentConversionId && (
          <button
            onClick={cancelConversion}
            className="btn btn-secondary text-sm sm:text-base py-3 sm:py-4 px-4"
          >
            Cancel
          </button>
        )}
      </div>

      {loading && (
        <div className="mb-4">
          <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2">
            <div
              className="bg-purple-500 h-2.5 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-300 mb-1">
              {outputFormat === "mp3"
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
        downloadUrl={monetizationState.downloadUrl}
      />
    </div>
  );
};

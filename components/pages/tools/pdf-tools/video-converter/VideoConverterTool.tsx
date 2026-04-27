"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useMonetization } from "@/contexts/MonetizationProvider";
import { getApiUrl, getDirectBackendUrl } from "@/lib/config";

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
  // Monetization removed - direct download

  const { showModal: showMonetizationModal } = useMonetization();
  const [file, setFile] = useState<File | null>(uploadedFile);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [warning, setWarning] = useState("");
  const [currentConversionId, setCurrentConversionId] = useState<string | null>(
    null
  );
  const [conversionResult, setConversionResult] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initializationStep, setInitializationStep] = useState(0);
  const [isBackendProcessing, setIsBackendProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentInitializationMessages, setCurrentInitializationMessages] =
    useState<any[]>([]);
  const [currentBackendMessages, setCurrentBackendMessages] = useState<any[]>(
    []
  );
  const [currentXhr, setCurrentXhr] = useState<XMLHttpRequest | null>(null);
  const [currentProgressInterval, setCurrentProgressInterval] =
    useState<NodeJS.Timeout | null>(null);

  // Messages for backend processing after upload
  const getInitializationMessages = (fileSizeMB: number) => {
    return [
      {
        text: "Receiving file on server...",
        subtext: "Backend is downloading your video",
      },
      {
        text: "Validating file integrity...",
        subtext: "Checking file completeness and format",
      },
      {
        text: "Saving file to disk...",
        subtext: "Storing your video securely",
      },
      {
        text: "Analyzing video properties...",
        subtext: "Reading resolution, codec, and duration",
      },
      {
        text: "Calculating optimal settings...",
        subtext: "Determining best compression parameters",
      },
      {
        text: "Preparing FFmpeg command...",
        subtext: "Setting up video processing pipeline",
      },
      {
        text: "Allocating server resources...",
        subtext: "Reserving processing capacity",
      },
      {
        text: "Starting video conversion...",
        subtext: "FFmpeg is initializing",
      },
    ];
  };

  // User-focused processing messages - no technical details
  const getBackendProcessingMessages = (fileSizeMB: number) => {
    return [
      {
        text: "Processing your video...",
        subtext: "Analyzing your file",
      },
      {
        text: "Preparing conversion...",
        subtext: "Setting up video processing",
      },
      {
        text: "Optimizing settings...",
        subtext: "Configuring quality parameters",
      },
      {
        text: "Reading video data...",
        subtext: "Processing file information",
      },
      {
        text: "Almost ready to start...",
        subtext: "Finalizing setup",
      },
    ];
  };

  // Cycle through initialization messages (no repetition)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isInitializing && currentInitializationMessages.length > 0) {
      interval = setInterval(() => {
        setInitializationStep((prev) => {
          const next = prev + 1;
          // Stop cycling when we reach the end, don't repeat
          return next >= currentInitializationMessages.length ? prev : next;
        });
      }, 3000); // Change message every 3 seconds (covers 30+ second delay)
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isInitializing, currentInitializationMessages.length]);

  // Cycle through backend processing messages (no repetition)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isBackendProcessing && currentBackendMessages.length > 0) {
      interval = setInterval(() => {
        setInitializationStep((prev) => {
          const next = prev + 1;
          // Stop cycling when we reach the end, don't repeat
          return next >= currentBackendMessages.length ? prev : next;
        });
      }, 4000); // Change message every 4 seconds for backend processing
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isBackendProcessing, currentBackendMessages.length]);

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

  // Cancel conversion when output parameters change during conversion
  useEffect(() => {
    // If a conversion is running and output parameters change, cancel it
    if (loading && currentConversionId) {
      cancelConversion();
    }
  }, [outputFormat, quality, compression]); // Watch for parameter changes

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

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
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
    // Clear progress interval if it exists
    if (currentProgressInterval) {
      clearInterval(currentProgressInterval);
      setCurrentProgressInterval(null);
    }

    // Abort XHR request if it's still in progress (during upload)
    if (currentXhr) {
      currentXhr.abort();
      setCurrentXhr(null);
      setLoading(false);
      setIsInitializing(false);
      setIsBackendProcessing(false);
      setIsUploading(false);
      setInitializationStep(0);
      setProgress(0);
      setCurrentConversionId(null);
      setWarning("Conversion cancelled by user");
      return;
    }

    // If we have a conversion ID, try to cancel on the backend
    if (!currentConversionId) {
      // No conversion ID means we're still uploading or haven't started
      // Just reset the state
      setLoading(false);
      setIsInitializing(false);
      setIsBackendProcessing(false);
      setIsUploading(false);
      setInitializationStep(0);
      setProgress(0);
      setCurrentConversionId(null);
      setWarning("Conversion cancelled by user");
      return;
    }

    try {
      const response = await fetch(
        `${getDirectBackendUrl("/cancel_conversion")}/${encodeURIComponent(
          currentConversionId
        )}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (
        result.status === "success" ||
        result.status === "already_completed"
      ) {
        setLoading(false);
        setIsInitializing(false);
        setIsBackendProcessing(false);
        setIsUploading(false);
        setInitializationStep(0);
        setProgress(0);
        setCurrentConversionId(null);
        setWarning("Conversion cancelled by user");
      } else {
        // Even if backend cancel fails, reset the UI
        setLoading(false);
        setIsInitializing(false);
        setIsBackendProcessing(false);
        setIsUploading(false);
        setInitializationStep(0);
        setProgress(0);
        setCurrentConversionId(null);
        setWarning("Conversion cancelled by user");
      }
    } catch (error) {
      // Even if request fails, reset the UI
      setLoading(false);
      setIsInitializing(false);
      setIsBackendProcessing(false);
      setIsUploading(false);
      setInitializationStep(0);
      setProgress(0);
      setCurrentConversionId(null);
      setWarning("Conversion cancelled by user");
    }
  };

  const convert = async () => {
    if (!file) {
      setWarning("Please select a video file first.");
      return;
    }

    // COMPREHENSIVE LOGGING - CONVERSION START
    const conversionStartTime = Date.now();
    const timestamp = new Date().toISOString();
    const fileSizeMB = file.size / 1024 / 1024;

    // Set file-size aware messages
    setCurrentInitializationMessages(getInitializationMessages(fileSizeMB));
    setCurrentBackendMessages(getBackendProcessingMessages(fileSizeMB));

    setLoading(true);
    setIsInitializing(false);
    setIsBackendProcessing(false);
    setIsUploading(false);
    setUploadProgress(0);
    setInitializationStep(0);
    setProgress(0);
    setWarning("");
    setConversionResult(null);
    setCurrentConversionId(null);

    // Use ONLY backend progress - no fake frontend animation
    let progressInterval: NodeJS.Timeout | undefined;
    let uniqueFilename = "";
    let xhrInstance: XMLHttpRequest | null = null;

    // Poll backend for real progress
    const pollProgress = async () => {
      try {
        // Only poll if we have a unique filename from the backend
        if (!uniqueFilename) {
          return false;
        }

        const response = await fetch(
          `${getDirectBackendUrl("/conversion_progress")}/${encodeURIComponent(
            uniqueFilename
          )}`
        );
        const progressData = await response.json();

        if (progressData.status === "completed") {
          if (progressInterval) {
            clearInterval(progressInterval);
            setCurrentProgressInterval(null);
          }
          setProgress(100);

          // COMPREHENSIVE LOGGING - CONVERSION COMPLETE
          const conversionCompleteTime = Date.now();
          const totalConversionTime =
            conversionCompleteTime - conversionStartTime; // Set the conversion result for download
          const downloadUrl = `${getDirectBackendUrl(
            "/download_converted_video"
          )}/${
            progressData.converted_filename ||
            uniqueFilename.replace(/\.[^/.]+$/, "_converted.mp4")
          }`;

          setConversionResult(downloadUrl);

          // Set converted file size if available
          if (progressData.converted_size) {
            setConvertedFileSize(progressData.converted_size);
          }

          // Stop loading
          setTimeout(() => {
            // Log final size comparison
            if (originalFileSize && progressData.converted_size) {
              const compressionRatio =
                ((originalFileSize - progressData.converted_size) /
                  originalFileSize) *
                100;
            }
            setLoading(false);
            setCurrentConversionId(null);
          }, 500);

          return true;
        } else if (progressData.progress !== undefined) {
          setProgress(progressData.progress);
          // Clear initializing state when we get real progress (> 1%)
          if (progressData.progress > 1) {
            const progressStartTime = Date.now();
            const timeToProgressStart = progressStartTime - conversionStartTime;

            // COMPREHENSIVE LOGGING - PROGRESS BAR STARTS

            setIsInitializing(false);
            setIsBackendProcessing(false);
          }

          // Update converted file size if available in progress data
          if (progressData.converted_size) {
            setConvertedFileSize(progressData.converted_size);
          }
        } else {
        }
      } catch (error) {}
      return false;
    };

    try {
      // COMPREHENSIVE LOGGING - BACKEND REQUEST
      const backendRequestTime = Date.now();
      const timeToBackend = backendRequestTime - conversionStartTime;

      // Switch to backend processing messages
      setIsInitializing(false);
      setIsBackendProcessing(true);
      setInitializationStep(0);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("outputFormat", outputFormat);
      formData.append("quality", quality.toString());
      formData.append("compression", compression);

      // Start upload progress tracking
      setIsUploading(true);
      setUploadProgress(0);

      // Use XMLHttpRequest for upload progress tracking
      const response = await new Promise<{
        ok: boolean;
        status: number;
        json: () => Promise<any>;
      }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhrInstance = xhr;
        setCurrentXhr(xhr);

        // Set timeout to 10 minutes for large video uploads
        xhr.timeout = 600000; // 10 minutes in milliseconds

        // Track upload progress
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            setUploadProgress(Math.round(percentComplete));
          }
        });

        xhr.addEventListener("load", () => {
          setCurrentXhr(null);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve({
              ok: true,
              status: xhr.status,
              json: () => Promise.resolve(JSON.parse(xhr.responseText)),
            });
          } else {
            reject(new Error(`Server error: ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => {
          setCurrentXhr(null);
          reject(new Error("Network error"));
        });

        xhr.addEventListener("timeout", () => {
          setCurrentXhr(null);
          reject(new Error("Upload timeout - file is too large or network is too slow"));
        });

        xhr.addEventListener("abort", () => {
          setCurrentXhr(null);
          reject(new Error("Request cancelled"));
        });

        xhr.open("POST", getDirectBackendUrl("/convert-video"));
        xhr.send(formData);
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      const backendResponseTime = Date.now();
      const timeToBackendResponse = backendResponseTime - conversionStartTime;

      // COMPREHENSIVE LOGGING - BACKEND RESPONSE

      if (result.status === "success") {
        // Upload complete, switch to processing mode
        setIsUploading(false);
        setIsBackendProcessing(true);
        setInitializationStep(0);

        // Store unique filename and start polling
        uniqueFilename = result.unique_filename || file.name;
        setCurrentConversionId(uniqueFilename);

        // Start polling every 1 second after getting unique filename
        progressInterval = setInterval(pollProgress, 1000);
        setCurrentProgressInterval(progressInterval);

        if (result.original_size) {
          setOriginalFileSize(result.original_size);
        }
        if (result.converted_size) {
          setConvertedFileSize(result.converted_size);
        }

        // Don't set conversion result yet - wait for actual completion via polling
      } else {
        throw new Error(result.message || "Conversion failed");
      }
    } catch (error: any) {
      // Clear progress interval on error
      if (progressInterval) {
        clearInterval(progressInterval);
        setCurrentProgressInterval(null);
      }
      setCurrentXhr(null);
      // Don't show error if it was cancelled
      if (error?.message !== "Request cancelled") {
        setWarning(`Conversion failed: ${error?.message || "Unknown error"}`);
      }
      setLoading(false);
      setIsInitializing(false);
      setIsBackendProcessing(false);
      setIsUploading(false);
      setInitializationStep(0);
      setCurrentConversionId(null);
    }
  };

  const downloadResult = async () => {
    if (conversionResult) {
      const completed = await showMonetizationModal({
        title: "Download Video",
        message: `Choose how you'd like to download ${
          file?.name || "this video"
        }`,
        fileName: file?.name || "converted-video",
        fileType: "video",
        downloadUrl: conversionResult,
      });

      if (completed) {
        const link = document.createElement("a");
        link.href = conversionResult;
        link.download = file?.name || "converted-video";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } else {
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
                ? "Drop the video file here"
                : "Drag and drop your video here, or click to browse"}
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
                setIsInitializing(false);
                setIsBackendProcessing(false);
                setInitializationStep(0);
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
                  outputFormat === "mp3"
                    ? "Extracting audio to"
                    : "Converting to"
                } ${outputFormat.toUpperCase()}... ${progress}%`
              : `${
                  outputFormat === "mp3" ? "Extract Audio to" : "Convert to"
                } ${outputFormat.toUpperCase()}`}
          </button>

          {loading && (
            <button
              onClick={cancelConversion}
              className="btn btn-secondary text-sm sm:text-base py-3 sm:py-4 px-4"
            >
              Cancel
            </button>
          )}
        </div>

        {loading && isUploading && (
          <div className="mb-4">
            <div className="text-center">
              <p className="text-xs text-gray-300 mb-1">
                <span className="text-green-300 animate-pulse">
                  Uploading video... {uploadProgress}%
                </span>
              </p>
              <p className="text-xs text-gray-400">
                Transferring {file ? (file.size / 1024 / 1024).toFixed(1) : "0"}
                MB over secure connection
              </p>
            </div>
          </div>
        )}

        {loading && !isUploading && (
          <div className="mb-4">
            <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2">
              <div
                className="bg-purple-500 h-2.5 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-300 mb-1">
                {isInitializing ? (
                  <span className="text-yellow-300 animate-pulse">
                    {currentInitializationMessages[initializationStep]?.text ||
                      "Securing your file..."}
                  </span>
                ) : isBackendProcessing ? (
                  <span className="text-blue-300 animate-pulse">
                    {currentBackendMessages[initializationStep]?.text ||
                      "Processing your request..."}
                  </span>
                ) : outputFormat === "mp3" ? (
                  "Extracting audio..."
                ) : (
                  "Processing video..."
                )}
              </p>
              <p className="text-xs text-gray-400">
                {isInitializing
                  ? currentInitializationMessages[initializationStep]
                      ?.subtext || "Initializing secure processing..."
                  : isBackendProcessing
                  ? currentBackendMessages[initializationStep]?.subtext ||
                    "Backend is analyzing your file"
                  : `${progress}% complete`}
              </p>
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
            Safe encrypted video conversion and audio extraction with our
            advanced algorithmic security
          </p>
          <p>
            Max file size: 500MB | All major formats supported | MP3 audio
            extraction
          </p>
          <p className="hidden sm:block">
            High-performance conversion with quality control, compression
            options, and audio extraction
          </p>
          <p className="sm:hidden">
            High-performance conversion with quality control and audio
            extraction
          </p>
        </div>

        {/* Monetization removed - using Google AdSense only */}
      </div>
    </div>
  );
};

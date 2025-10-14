"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMonetization } from "@/hooks/useMonetization";
import MonetizationModal from "@/components/ui/MonetizationModal";

interface AudioConverterToolProps {
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  result: {
    type: "success" | "error";
    message: string;
    data?: any;
  } | null;
  setResult: (
    result: {
      type: "success" | "error";
      message: string;
      data?: any;
    } | null
  ) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  handleFileUpload: (file: File) => void;
}

export const AudioConverterTool: React.FC<AudioConverterToolProps> = ({
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

  const [file, setFile] = useState<File | null>(uploadedFile);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [warning, setWarning] = useState("");
  const [conversionResult, setConversionResult] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState("mp3");
  const [bitrate, setBitrate] = useState(192);
  const [sampleRate, setSampleRate] = useState(44100);
  const [channels, setChannels] = useState("stereo");
  const [quality, setQuality] = useState(80);
  const [originalFileSize, setOriginalFileSize] = useState<number | null>(null);
  const [convertedFileSize, setConvertedFileSize] = useState<number | null>(
    null
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const audioFile = acceptedFiles[0];
      if (!audioFile) return;

      // Check file size (500MB limit)
      const maxSize = 500 * 1024 * 1024;
      if (audioFile.size > maxSize) {
        setWarning(
          `File is too large (${(audioFile.size / 1024 / 1024).toFixed(
            2
          )} MB). Max size is ${maxSize / 1024 / 1024} MB.`
        );
        return;
      }

      // Check if it's an audio file
      if (!audioFile.type.startsWith("audio/")) {
        setWarning(
          "Please select an audio file (MP3, WAV, FLAC, AAC, OGG, M4A, WMA, etc.)"
        );
        return;
      }

      setFile(audioFile);
      setUploadedFile(audioFile);
      setOriginalFileSize(audioFile.size);
      setConvertedFileSize(null);
      setWarning("");
      setConversionResult(null);
    },
    [setUploadedFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "audio/*": [
        ".mp3",
        ".wav",
        ".flac",
        ".aac",
        ".ogg",
        ".m4a",
        ".wma",
        ".aiff",
        ".au",
      ],
    },
    multiple: false,
  });

  const removeFile = () => {
    setFile(null);
    setUploadedFile(null);
    setOriginalFileSize(null);
    setConvertedFileSize(null);
    setConversionResult(null);
    setWarning("");
    setProgress(0);
  };

  const downloadResult = () => {
    if (conversionResult) {
      window.open(conversionResult, "_blank");
    }
  };

  const convert = async () => {
    if (!file) return;

    setLoading(true);
    setProgress(0);
    setWarning("");
    setConversionResult(null);

    // Simple progress animation that goes to 85% and waits
    let currentProgress = 0;
    let isBackendComplete = false;

    const progressStep = () => {
      if (isBackendComplete) {
        // Backend is done, smoothly finish to 100%
        if (currentProgress < 100) {
          currentProgress += 1;
          const roundedProgress = Math.round(currentProgress);
          setProgress(roundedProgress);
          console.log(
            `📊 [PROGRESS] Backend complete - finishing: ${roundedProgress}%`
          );
          setTimeout(progressStep, 50);
        }
      } else {
        // Backend still working, slowly progress to 85%
        if (currentProgress < 85) {
          currentProgress += 0.5;
          const roundedProgress = Math.round(currentProgress);
          setProgress(roundedProgress);
          console.log(`📊 [PROGRESS] Processing: ${roundedProgress}%`);
          setTimeout(progressStep, 100);
        } else {
          // Stay at 85% until backend completes
          setProgress(85);
          console.log(`📊 [PROGRESS] Waiting at 85% for backend completion...`);
          setTimeout(progressStep, 500);
        }
      }
    };
    progressStep();

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("outputFormat", outputFormat);
      formData.append("bitrate", bitrate.toString());
      formData.append("sampleRate", sampleRate.toString());
      formData.append("channels", channels);
      formData.append("quality", quality.toString());

      const response = await fetch("http://localhost:5000/convert-audio", {
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

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-gray-800 shadow-soft max-w-4xl mx-auto">
      <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white">
        Universal Audio Converter
      </h3>
      <p className="text-xs sm:text-sm text-gray-300 mb-4">
        Convert audio between all formats with quality control and advanced
        processing. Optimize file size and audio quality.
      </p>

      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? "dropzone-active" : ""} ${
          file ? "dropzone-has-file" : ""
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-center">
          {file ? (
            <div className="space-y-3">
              <div className="text-green-400 text-4xl">🎵</div>
              <div>
                <p className="text-sm font-medium text-white mb-1">
                  {file.name}
                </p>
                <p className="text-xs text-gray-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
                className="text-red-400 hover:text-red-300 text-xs"
              >
                Remove file
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-gray-400 text-4xl">🎵</div>
              <div>
                <p className="text-sm font-medium text-white mb-1">
                  {isDragActive
                    ? "Drop the audio file here"
                    : "Drag & drop an audio file here"}
                </p>
                <p className="text-xs text-gray-400">
                  or click to select a file
                </p>
              </div>
              <p className="text-xs text-gray-500">
                MP3, WAV, FLAC, AAC, OGG, M4A, WMA, AIFF, AU
              </p>
            </div>
          )}
        </div>
      </div>

      {warning && (
        <div className="mt-4 p-3 bg-red-900/20 border border-red-500/50 rounded-lg">
          <p className="text-red-300 text-xs sm:text-sm">{warning}</p>
        </div>
      )}

      <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
            Output Format
          </label>
          <select
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value)}
            className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-700 text-white"
          >
            <option value="mp3">MP3 (Most Compatible)</option>
            <option value="wav">WAV (Uncompressed)</option>
            <option value="flac">FLAC (Lossless)</option>
            <option value="aac">AAC (High Quality)</option>
            <option value="ogg">OGG Vorbis</option>
            <option value="m4a">M4A (iTunes)</option>
            <option value="wma">WMA (Windows)</option>
            <option value="aiff">AIFF (Mac)</option>
            <option value="opus">Opus (Modern)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
            Bitrate (kbps)
          </label>
          <select
            value={bitrate}
            onChange={(e) => setBitrate(Number(e.target.value))}
            className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-700 text-white"
          >
            <option value={64}>64 kbps (Low)</option>
            <option value={128}>128 kbps (Standard)</option>
            <option value={192}>192 kbps (High)</option>
            <option value={256}>256 kbps (Very High)</option>
            <option value={320}>320 kbps (Maximum)</option>
            <option value={0}>Variable (Auto)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
            Sample Rate (Hz)
          </label>
          <select
            value={sampleRate}
            onChange={(e) => setSampleRate(Number(e.target.value))}
            className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-700 text-white"
          >
            <option value={22050}>22050 Hz (Low)</option>
            <option value={44100}>44100 Hz (CD Quality)</option>
            <option value={48000}>48000 Hz (Professional)</option>
            <option value={88200}>88200 Hz (High-Res)</option>
            <option value={96000}>96000 Hz (Studio)</option>
            <option value={192000}>192000 Hz (Ultra High-Res)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
            Channels
          </label>
          <select
            value={channels}
            onChange={(e) => setChannels(e.target.value)}
            className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-700 text-white"
          >
            <option value="mono">Mono (1 channel)</option>
            <option value="stereo">Stereo (2 channels)</option>
            <option value="surround">Surround (5.1)</option>
            <option value="original">Original (Keep as-is)</option>
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
            <option value={50}>50% (Low Quality)</option>
            <option value={70}>70% (Medium Quality)</option>
            <option value={80}>80% (High Quality)</option>
            <option value={90}>90% (Very High Quality)</option>
            <option value={100}>100% (Maximum Quality)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
            Processing
          </label>
          <select
            className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-700 text-white"
            disabled
          >
            <option value="normal">Normal Processing</option>
            <option value="fast">Fast Processing</option>
            <option value="high">High Quality</option>
          </select>
        </div>
      </div>

      <button
        onClick={convert}
        disabled={!file || loading}
        className="btn btn-primary w-full mb-4 text-sm sm:text-base py-3 sm:py-4"
      >
        {loading
          ? `Converting to ${outputFormat.toUpperCase()}... ${progress}%`
          : `Convert to ${outputFormat.toUpperCase()}`}
      </button>

      {loading && (
        <div className="mb-4">
          <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2">
            <div
              className={`bg-purple-500 h-2.5 rounded-full transition-all duration-300 ease-in-out ${
                progress >= 85 && !conversionResult ? "animate-pulse" : ""
              }`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-300 mb-1">
              {progress >= 85 && !conversionResult
                ? "Finalizing conversion..."
                : "Processing audio..."}
            </p>
            <p className="text-xs text-gray-400">{progress}% complete</p>
          </div>
        </div>
      )}

      {conversionResult && (
        <div className="mb-4 p-3 sm:p-4 bg-green-900/20 border border-green-500/50 rounded-lg">
          <p className="text-green-300 text-xs sm:text-sm mb-2">
            ✅ Audio conversion completed successfully!
          </p>

          {/* File Size Comparison */}
          {originalFileSize && convertedFileSize && (
            <div className="mb-3 p-3 bg-gray-800/50 rounded-lg border border-gray-600">
              <h4 className="text-white text-xs sm:text-sm font-medium mb-2">
                File Size Comparison
              </h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
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
                <div className="text-center">
                  <p className="text-gray-400">Quality</p>
                  <p className="text-yellow-300 font-medium">
                    {outputFormat.toUpperCase()}
                    <br />
                    <span className="text-xs">
                      {bitrate}kbps • {sampleRate}Hz • {channels}
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
              Download Converted Audio
            </button>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-400 text-center mt-4 space-y-1">
        <p>
          Professional audio conversion with advanced quality control and format
          optimization
        </p>
        <p>
          Max file size: 500MB | All major audio formats supported |
          High-quality processing
        </p>
        <p className="hidden sm:block">
          Convert between MP3, WAV, FLAC, AAC, OGG, M4A, WMA, AIFF, and more
          with customizable bitrate, sample rate, and channel options
        </p>
        <p className="sm:hidden">
          Convert between all major audio formats with quality control
        </p>
      </div>

      <MonetizationModal
        isOpen={monetizationState.isModalOpen}
        onClose={closeMonetizationModal}
        onAdComplete={handleAdComplete}
        onPaymentComplete={handlePaymentComplete}
        fileName={file?.name || "audio-file"}
        fileType="audio"
      />
    </div>
  );
};

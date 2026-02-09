"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText } from "lucide-react";

interface PDFProcessingModalProps {
  isOpen: boolean;
  progress: number;
  fileName?: string;
}

export const PDFProcessingModal: React.FC<PDFProcessingModalProps> = ({
  isOpen,
  progress,
  fileName,
}) => {
  const [statusText, setStatusText] = useState("Uploading PDF...");

  useEffect(() => {
    if (progress < 25) {
      setStatusText("Uploading PDF...");
    } else if (progress < 50) {
      setStatusText("Analyzing document structure...");
    } else if (progress < 75) {
      setStatusText("Processing content...");
    } else if (progress < 95) {
      setStatusText("Preparing editor...");
    } else if (progress < 100) {
      setStatusText("Almost done...");
    } else {
      setStatusText("Complete!");
    }
  }, [progress]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[10000] p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.4,
            }}
            className="bg-gradient-to-br from-background via-background/95 to-background dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-3xl shadow-2xl border border-border dark:border-gray-700/50 p-6 sm:p-8 max-w-md w-full mx-auto"
          >
            {/* Header with file name */}
            {fileName && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-6 text-center"
              >
                <div className="flex items-center justify-center gap-2 text-muted-foreground dark:text-gray-400 text-sm mb-2">
                  <FileText className="w-4 h-4" />
                  <span className="truncate max-w-[280px]">{fileName}</span>
                </div>
              </motion.div>
            )}

            {/* Status Text */}
            <motion.div
              key={statusText}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-center mb-6"
            >
              <h3 className="text-xl sm:text-2xl font-light text-foreground dark:text-white mb-2">
                {statusText}
              </h3>
              <p className="text-sm sm:text-base font-light text-muted-foreground dark:text-gray-400">
                {progress >= 100
                  ? "Your document is ready!"
                  : "Please wait while we process your document"}
              </p>
            </motion.div>

            {/* Progress Bar */}
            <div className="w-full">
              <div className="flex justify-between text-xs sm:text-sm text-muted-foreground dark:text-gray-400 mb-2">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-2 sm:h-3 overflow-hidden backdrop-blur-sm">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 shadow-lg"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Animated dots */}
            {progress < 100 && (
              <div className="flex justify-center gap-1.5 mt-6">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-blue-400 rounded-full"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

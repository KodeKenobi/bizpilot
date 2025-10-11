"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, CreditCard, Download, Star, CheckCircle } from "lucide-react";

interface MonetizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdComplete: () => void;
  onPaymentComplete: () => void;
  fileName: string;
  fileType: string;
}

const AdComponent = ({ onComplete }: { onComplete: () => void }) => {
  const [adProgress, setAdProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    console.log(
      "🎬 useEffect triggered - isPlaying:",
      isPlaying,
      "hasCompleted:",
      hasCompletedRef.current
    );
    if (isPlaying && !hasCompletedRef.current) {
      console.log("🎬 Starting interval");
      const interval = setInterval(() => {
        setAdProgress((prev) => {
          if (prev >= 100) {
            if (hasCompletedRef.current) {
              console.log("🎬 Already completed, skipping");
              return 100;
            }
            console.log(
              "🎬 Progress reached 100%, clearing interval and setting completed flag"
            );
            clearInterval(interval);
            hasCompletedRef.current = true;
            // Use setTimeout to defer onComplete after render cycle
            setTimeout(() => {
              console.log("🎬 Ad progress 100% - calling onComplete");
              onComplete();
            }, 0);
            return 100;
          }
          return prev + 2;
        });
      }, 100);
      return () => {
        console.log("🎬 Cleaning up interval");
        clearInterval(interval);
      };
    }
  }, [isPlaying, onComplete]);

  const startAd = () => {
    console.log("🎬 startAd called");
    hasCompletedRef.current = false;
    setAdProgress(0);
    setIsPlaying(true);
  };

  return (
    <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-xl p-6 border border-blue-500/30">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Play className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Watch a Quick Ad
        </h3>
        <p className="text-gray-400 text-sm">
          Support Trevnoctilla by watching a 5-second ad
        </p>
      </div>

      {!isPlaying ? (
        <motion.button
          onClick={startAd}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
        >
          <Play className="w-5 h-5 inline mr-2" />
          Start Ad
        </motion.button>
      ) : (
        <div className="space-y-4">
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-white font-medium mb-2">
              Trevnoctilla Premium
            </div>
            <div className="text-gray-400 text-sm mb-3">
              Professional PDF tools for businesses
            </div>
            <div className="text-blue-400 text-sm">
              Visit trevnoctilla.com for more features
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Ad Progress</span>
              <span>{adProgress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${adProgress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PaymentComponent = ({ onComplete }: { onComplete: () => void }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsProcessing(false);
    onComplete();
  };

  return (
    <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-xl p-6 border border-green-500/30">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Quick Payment</h3>
        <p className="text-gray-400 text-sm">
          Support Trevnoctilla with a small contribution
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white mb-1">$1.00</div>
          <div className="text-gray-400 text-sm">One-time payment</div>
        </div>

        <div className="space-y-2 text-sm text-gray-300">
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
            Instant download access
          </div>
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
            No ads, no waiting
          </div>
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
            Support future development
          </div>
        </div>

        <motion.button
          onClick={handlePayment}
          disabled={isProcessing}
          whileHover={{ scale: isProcessing ? 1 : 1.05 }}
          whileTap={{ scale: isProcessing ? 1 : 0.95 }}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-6 rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Pay $1.00
            </div>
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default function MonetizationModal({
  isOpen,
  onClose,
  onAdComplete,
  onPaymentComplete,
  fileName,
  fileType,
}: MonetizationModalProps) {
  const [selectedOption, setSelectedOption] = useState<"ad" | "payment" | null>(
    null
  );

  const handleAdComplete = () => {
    console.log("🎬 MonetizationModal handleAdComplete called");
    onAdComplete();
    onClose();
  };

  const handlePaymentComplete = () => {
    console.log("💳 MonetizationModal handlePaymentComplete called");
    onPaymentComplete();
    onClose();
  };

  const handleDownload = () => {
    // This will be called after user completes either ad or payment
    const link = document.createElement("a");
    link.href = `http://localhost:5000/download_converted/${fileName}`;
    link.download = fileName;
    link.click();
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedOption(null);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-md w-full relative"
          >
            <button
              onClick={onClose}
              className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>

            {!selectedOption ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Download className="w-8 h-8 text-white" />
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">
                  If you like the conversion, download
                </h2>
                <p className="text-gray-400 mb-6">
                  Support Trevnoctilla to continue providing free tools
                </p>

                <div className="text-sm text-gray-500 mb-6">
                  <div className="font-medium text-white">{fileName}</div>
                  <div className="text-gray-400">
                    {fileType.toUpperCase()} file
                  </div>
                </div>

                <div className="space-y-3">
                  <motion.button
                    onClick={() => setSelectedOption("ad")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-white py-3 px-6 rounded-lg hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-200"
                  >
                    <div className="flex items-center justify-center">
                      <Play className="w-5 h-5 mr-2" />
                      Watch Ad (Free)
                    </div>
                  </motion.button>

                  <motion.button
                    onClick={() => setSelectedOption("payment")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-white py-3 px-6 rounded-lg hover:from-green-500/30 hover:to-emerald-500/30 transition-all duration-200"
                  >
                    <div className="flex items-center justify-center">
                      <CreditCard className="w-5 h-5 mr-2" />
                      Pay $1.00 (Instant)
                    </div>
                  </motion.button>
                </div>
              </div>
            ) : (
              <div>
                {selectedOption === "ad" && (
                  <AdComponent onComplete={handleAdComplete} />
                )}
                {selectedOption === "payment" && (
                  <PaymentComponent onComplete={handlePaymentComplete} />
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

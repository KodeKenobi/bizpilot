"use client";

import React from "react";
import { X, Play, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import internalAnalytics from "@/lib/internalAnalytics";

interface TestAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  title?: string;
  message?: string;
  autoTrigger?: boolean;
  headless?: boolean;
}

const TestAdModal: React.FC<TestAdModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  title = "Manual Ad Interaction Test",
  message = "Simulate a manual ad interaction to verify tracking",
  autoTrigger = false,
  headless = false,
}) => {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const triggerTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleViewAd = React.useCallback(async () => {
    setIsProcessing(true);
    
    // TRACKING: Use EXACT production parameters from MonetizationModal
    const monetagUrl = "https://otieu.com/4/10115019";
    
    internalAnalytics.track("ad_click", {
      ad_provider: "monetag", // Force exact production name
      ad_url: monetagUrl,
      file_name: "test-trigger.pdf",
      download_url: "blob:test-trigger-blob-data", // Provide dummy blob pattern
      page: "/admin/automations",
      manual_trigger: true
    });

    // CRITICAL: Flush immediately so the analytics register even without page redirect
    await internalAnalytics.flush();

    // Open real ad window to ensure browser-level interaction is registered
    try {
      window.open(monetagUrl, "_blank", "noopener,noreferrer");
    } catch (e) {
      console.warn("Popup blocked during test trigger");
    }

    // Simulate completion
    setTimeout(() => {
      setIsProcessing(false);
      onComplete();
      onClose();
    }, 1500);
  }, [onComplete, onClose]);

  // Handle automation if autoTrigger is enabled
  React.useEffect(() => {
    if (isOpen && autoTrigger && !isProcessing) {
      triggerTimeoutRef.current = setTimeout(() => {
        handleViewAd();
      }, 800);
    }
    return () => {
      if (triggerTimeoutRef.current) clearTimeout(triggerTimeoutRef.current);
    };
  }, [isOpen, autoTrigger, handleViewAd, isProcessing]);

  if (headless) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100000]"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[100001] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-[#0F0F0F] border border-gray-800 shadow-2xl transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#0A0A0A]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <ShieldCheck className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Internal Testing Utility
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="text-center mb-8">
                  <p className="text-gray-300">
                    {message}
                  </p>
                  <div className="mt-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl text-left">
                    <p className="text-xs text-blue-300/70 font-mono mb-2">DEBUG INFO:</p>
                    <ul className="text-xs text-blue-300/50 font-mono space-y-1">
                      <li>• Event: ad_click</li>
                      <li>• Provider: monetag_test</li>
                      <li>• Bypass: Success Page Redirect</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleViewAd}
                    disabled={isProcessing}
                    className="w-full group relative p-6 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl border border-white/10 hover:border-white/20 transition-all hover:shadow-2xl hover:shadow-purple-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-center gap-4">
                      {isProcessing ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <div className="bg-white/20 p-2 rounded-lg">
                          <Play className="w-6 h-6 text-white fill-white" />
                        </div>
                      )}
                      <div className="text-left">
                        <h4 className="text-lg font-bold text-white">
                          {isProcessing ? "Triggering Click..." : "View Ad"}
                        </h4>
                        <p className="text-xs text-white/70">
                          Simulate interaction & fire analytics
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={onClose}
                    className="w-full py-3 px-4 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all border border-transparent hover:border-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-[#0A0A0A] border-t border-gray-800 text-center">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                  Antigravity Testing Module v1.0
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TestAdModal;

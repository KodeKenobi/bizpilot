"use client";

import { X, AlertCircle, RefreshCw } from "lucide-react";

interface RetryFailedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
  failedCount: number;
}

export default function RetryFailedModal({
  isOpen,
  onClose,
  onRetry,
  failedCount,
}: RetryFailedModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-700 rounded-xl shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Processing Complete</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Warning Box */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-200 mb-1">
                {failedCount} {failedCount === 1 ? 'company failed' : 'companies failed'}
              </p>
              <p className="text-xs text-amber-200/80">
                Some companies could not be processed. Would you like to retry the failed ones?
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onRetry();
                onClose();
              }}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Failed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

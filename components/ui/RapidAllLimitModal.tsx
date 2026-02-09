"use client";

import { useState } from "react";
import { X, AlertCircle } from "lucide-react";

interface RapidAllLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (limit: number) => void;
  maxAvailable: number;
  maxSubscriptionTier: number; // Based on user's subscription tier
  subscriptionTier: string;
  isProcessing?: boolean;
}

export default function RapidAllLimitModal({
  isOpen,
  onClose,
  onStart,
  maxAvailable,
  maxSubscriptionTier,
  subscriptionTier,
  isProcessing = false,
}: RapidAllLimitModalProps) {
  const [customLimit, setCustomLimit] = useState<string>(
    Math.min(maxAvailable, maxSubscriptionTier).toString()
  );

  if (!isOpen) return null;

  const limitValue = Math.min(parseInt(customLimit) || 0, maxSubscriptionTier);
  const isValidLimit = limitValue > 0 && limitValue <= maxSubscriptionTier;

  const getTierLabel = () => {
    if (subscriptionTier === "enterprise" || subscriptionTier === "client") {
      return "Enterprise (Unlimited)";
    }
    if (subscriptionTier === "premium") {
      return "Premium (100 max)";
    }
    return "Free (50 max)";
  };

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
          <h2 className="text-xl font-bold text-white">Set Processing Limit</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-sm text-gray-300">
              <span className="font-semibold text-white">{maxAvailable}</span> pending companies available
            </p>
            <p className="text-sm text-gray-300 mt-1">
              Your plan: <span className="font-semibold text-white">{getTierLabel()}</span>
            </p>
          </div>

          {/* Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              How many companies to process?
            </label>
            <input
              type="number"
              min="1"
              max={maxSubscriptionTier}
              value={customLimit}
              onChange={(e) => setCustomLimit(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="Enter number"
              disabled={isProcessing}
            />
            <p className="text-xs text-gray-400 mt-1">
              Enter a number between 1 and {maxSubscriptionTier}
            </p>
          </div>

          {/* Warning for limited plans */}
          {maxAvailable > maxSubscriptionTier && subscriptionTier !== "enterprise" && subscriptionTier !== "client" && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-200">
                You have {maxAvailable - maxSubscriptionTier} companies beyond your {subscriptionTier === "premium" ? "Premium" : "Free"} plan limit. Upgrade to process all.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => onStart(limitValue)}
              disabled={!isValidLimit || isProcessing}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? "Processing..." : `Start (${limitValue})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

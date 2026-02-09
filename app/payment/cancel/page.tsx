"use client";

import { XCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function PaymentCancelContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [returnPath, setReturnPath] = useState<string | null>(null);
  const [itnDebug, setItnDebug] = useState<any>(null);

  useEffect(() => {
    // Log ALL parameters from PayFast cancel_url callback

    const allParams: Record<string, string | null> = {};
    searchParams.forEach((value, key) => {
      allParams[key] = value;
    });

    const mPaymentId = searchParams.get("m_payment_id");
    const pfPaymentId = searchParams.get("pf_payment_id");
    const paymentStatus = searchParams.get("payment_status");
    const signature = searchParams.get("signature");

    // Get the stored return path from before payment was initiated
    if (typeof window !== "undefined") {
      const storedPath = localStorage.getItem("payment_return_path");
      if (storedPath) {
        setReturnPath(storedPath);
        // Clear it so it doesn't persist for future payments
        localStorage.removeItem("payment_return_path");
      }
    }

    // Fetch ITN debug info to see what happened
    const fetchDebugInfo = async () => {
      try {
        const debugResponse = await fetch(
          "https://www.trevnoctilla.com/api/payments/debug"
        );
        const debugData = await debugResponse.json();
        if (debugData.lastITN) {
          setItnDebug(debugData.lastITN);
        }
      } catch (error) {}
    };
    fetchDebugInfo();
  }, [searchParams]);

  const handleGoBack = () => {
    if (returnPath) {
      // Redirect to where the user was before payment
      router.push(returnPath);
    } else {
      // Fallback: go back in browser history (not to dashboard)
      router.back();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] p-4">
      <div className="max-w-md w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-8 text-center">
        <div className="mb-6">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-yellow-500 rounded-full blur-lg opacity-30"></div>
            <XCircle className="w-16 h-16 text-yellow-500 relative" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Payment Cancelled
        </h1>
        <p className="text-gray-400 mb-6">
          You cancelled the payment process. No charges were made.
        </p>
        {itnDebug && itnDebug.errors && itnDebug.errors.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg text-left">
            <p className="text-yellow-400 font-semibold mb-2">
              ⚠️ ITN Verification Issues (before cancellation):
            </p>
            <ul className="text-sm text-yellow-300 space-y-1">
              {itnDebug.errors.map((error: string, idx: number) => (
                <li key={idx}>• {error}</li>
              ))}
            </ul>
            <p className="text-xs text-gray-400 mt-2">
              Check Railway logs for details (Request ID: {itnDebug.requestId})
            </p>
          </div>
        )}
        <div className="space-y-3">
          <button
            onClick={handleGoBack}
            className="block w-full px-6 py-3 bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] hover:from-[#7c3aed] hover:to-[#2563eb] text-white rounded-lg font-medium transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a]">
          <div className="text-center">
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      }
    >
      <PaymentCancelContent />
    </Suspense>
  );
}

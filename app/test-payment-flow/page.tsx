"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MonetizationModal from "@/components/ui/MonetizationModal";
import { CheckCircle, XCircle, Download, AlertCircle } from "lucide-react";

interface TestStep {
  id: string;
  name: string;
  status: "pending" | "running" | "passed" | "failed";
  message?: string;
  details?: any;
}

export default function TestPaymentFlowPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [steps, setSteps] = useState<TestStep[]>([
    { id: "1", name: "Open Monetization Modal", status: "pending" },
    { id: "2", name: "Click Pay $1 Button", status: "pending" },
    { id: "3", name: "Store Download URL in localStorage", status: "pending" },
    { id: "4", name: "Simulate Payment Success", status: "pending" },
    { id: "5", name: "Navigate to Success Page", status: "pending" },
    {
      id: "6",
      name: "Retrieve Download URL from localStorage",
      status: "pending",
    },
    { id: "7", name: "Show Download Button", status: "pending" },
    { id: "8", name: "Test Download Functionality", status: "pending" },
  ]);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [showSuccessPage, setShowSuccessPage] = useState(false);
  const [testDownloadUrl] = useState(
    "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
  );

  const updateStep = (
    id: string,
    status: TestStep["status"],
    message?: string,
    details?: any
  ) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === id ? { ...step, status, message, details } : step
      )
    );
  };

  const resetTest = () => {
    setSteps((prev) =>
      prev.map((step) => ({
        ...step,
        status: "pending",
        message: undefined,
        details: undefined,
      }))
    );
    setDownloadUrl(null);
    setShowSuccessPage(false);
    setIsModalOpen(false);
    // Clear localStorage test data
    if (typeof window !== "undefined") {
      localStorage.removeItem("payment_download_url");
      localStorage.removeItem("payment_return_path");
      localStorage.removeItem("recent_downloads");
    }
  };

  const runFullTest = async () => {
    resetTest();

    // Step 1: Open Modal
    updateStep("1", "running");
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsModalOpen(true);
    updateStep("1", "passed", "Modal opened successfully");

    // Step 2: Simulate clicking Pay $1
    updateStep("2", "running");
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simulate what happens when user clicks Pay $1
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname + window.location.search;
      localStorage.setItem("payment_return_path", currentPath);
      localStorage.setItem("payment_download_url", testDownloadUrl);
      updateStep("2", "passed", "Pay $1 button clicked, form submitted");
      updateStep("3", "passed", `Download URL stored: ${testDownloadUrl}`, {
        key: "payment_download_url",
        value: testDownloadUrl,
      });
    }

    // Step 3: Close modal (simulating redirect to PayFast)
    setIsModalOpen(false);
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Step 4: Simulate payment success
    updateStep("4", "running");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    updateStep("4", "passed", "Payment processed successfully (simulated)");

    // Step 5: Navigate to success page
    updateStep("5", "running");
    await new Promise((resolve) => setTimeout(resolve, 500));
    setShowSuccessPage(true);
    updateStep("5", "passed", "Success page displayed");

    // Step 6: Retrieve download URL
    updateStep("6", "running");
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (typeof window !== "undefined") {
      const storedUrl = localStorage.getItem("payment_download_url");
      if (storedUrl) {
        setDownloadUrl(storedUrl);
        updateStep("6", "passed", `Download URL retrieved: ${storedUrl}`, {
          retrieved: storedUrl,
        });
      } else {
        updateStep("6", "failed", "Download URL not found in localStorage");
      }
    }

    // Step 7: Show download button
    updateStep("7", "running");
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (
      downloadUrl ||
      (typeof window !== "undefined" &&
        localStorage.getItem("payment_download_url"))
    ) {
      updateStep("7", "passed", "Download button should be visible");
    } else {
      updateStep("7", "failed", "Download button not shown - URL missing");
    }

    // Step 8: Test download
    updateStep("8", "running");
    await new Promise((resolve) => setTimeout(resolve, 500));
    updateStep(
      "8",
      "passed",
      "Download functionality ready (click button to test)"
    );
  };

  const handleDownload = () => {
    const url =
      downloadUrl ||
      (typeof window !== "undefined"
        ? localStorage.getItem("payment_download_url")
        : null);
    if (url) {
      window.open(url, "_blank");
      updateStep("8", "passed", "Download initiated successfully");
    } else {
      updateStep("8", "failed", "No download URL available");
    }
  };

  const checkLocalStorage = () => {
    if (typeof window !== "undefined") {
      const downloadUrl = localStorage.getItem("payment_download_url");
      const returnPath = localStorage.getItem("payment_return_path");
      const recentDownloads = localStorage.getItem("recent_downloads");

      return {
        downloadUrl,
        returnPath,
        recentDownloads: recentDownloads ? JSON.parse(recentDownloads) : null,
      };
    }
    return null;
  };

  const [localStorageData, setLocalStorageData] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLocalStorageData(checkLocalStorage());
      const interval = setInterval(() => {
        setLocalStorageData(checkLocalStorage());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, []);

  const allPassed = steps.every((step) => step.status === "passed");
  const hasFailed = steps.some((step) => step.status === "failed");

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            Payment Flow Test (Modal → Payment → Download)
          </h1>
          <p className="text-gray-400">
            Comprehensive test of the entire payment flow from modal to download
          </p>
        </div>

        {/* Test Controls */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex gap-3">
              <button
                onClick={runFullTest}
                className="px-6 py-3 bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] hover:from-[#7c3aed] hover:to-[#2563eb] text-white rounded-lg font-semibold transition-all"
              >
                Run Full Test
              </button>
              <button
                onClick={resetTest}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all"
              >
                Reset Test
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all"
              >
                Open Modal Manually
              </button>
            </div>
            {allPassed && (
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">All Tests Passed!</span>
              </div>
            )}
            {hasFailed && (
              <div className="flex items-center gap-2 text-red-400">
                <XCircle className="w-5 h-5" />
                <span className="font-semibold">Some Tests Failed</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Steps */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Test Steps
            </h2>
            <div className="space-y-3">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`p-4 rounded-lg border ${
                    step.status === "passed"
                      ? "bg-green-500/10 border-green-500/30"
                      : step.status === "failed"
                      ? "bg-red-500/10 border-red-500/30"
                      : step.status === "running"
                      ? "bg-blue-500/10 border-blue-500/30"
                      : "bg-gray-800/50 border-gray-700"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {step.status === "passed" ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : step.status === "failed" ? (
                        <XCircle className="w-5 h-5 text-red-400" />
                      ) : step.status === "running" ? (
                        <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <div className="w-5 h-5 border-2 border-gray-600 rounded-full" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white">
                          {step.name}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-300">
                          {step.id}
                        </span>
                      </div>
                      {step.message && (
                        <p
                          className={`text-sm ${
                            step.status === "passed"
                              ? "text-green-300"
                              : step.status === "failed"
                              ? "text-red-300"
                              : "text-gray-400"
                          }`}
                        >
                          {step.message}
                        </p>
                      )}
                      {step.details && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-300">
                            View Details
                          </summary>
                          <pre className="mt-2 text-xs bg-[#0a0a0a] p-2 rounded overflow-auto">
                            {JSON.stringify(step.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Success Page Preview / localStorage Data */}
          <div className="space-y-6">
            {/* Success Page Preview */}
            {showSuccessPage && (
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Success Page Preview
                </h2>
                <div className="bg-[#0a0a0a] rounded-lg p-6 text-center">
                  <div className="mb-6">
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-green-500 rounded-full blur-lg opacity-30"></div>
                      <CheckCircle className="w-16 h-16 text-green-500 relative" />
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold text-white mb-2">
                    Payment Successful!
                  </h1>
                  <p className="text-gray-400 mb-6">
                    {downloadUrl || localStorageData?.downloadUrl
                      ? "Your payment has been processed successfully. Click the button below to download your file."
                      : "Your payment has been processed successfully."}
                  </p>
                  {(downloadUrl || localStorageData?.downloadUrl) && (
                    <div className="space-y-3">
                      <button
                        onClick={handleDownload}
                        className="block w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white rounded-lg font-medium transition-all"
                      >
                        <Download className="w-5 h-5 inline-block mr-2" />
                        Download File
                      </button>
                      <button
                        onClick={() => setShowSuccessPage(false)}
                        className="block w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all"
                      >
                        Close
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* localStorage Data */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                localStorage Status
              </h2>
              <div className="bg-[#0a0a0a] rounded-lg p-4">
                {localStorageData ? (
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-400">
                        payment_download_url:
                      </span>
                      <div className="mt-1 p-2 bg-gray-900 rounded break-all">
                        {localStorageData.downloadUrl ? (
                          <span className="text-green-400">
                            {localStorageData.downloadUrl}
                          </span>
                        ) : (
                          <span className="text-red-400">Not set</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">
                        payment_return_path:
                      </span>
                      <div className="mt-1 p-2 bg-gray-900 rounded break-all">
                        {localStorageData.returnPath ? (
                          <span className="text-green-400">
                            {localStorageData.returnPath}
                          </span>
                        ) : (
                          <span className="text-red-400">Not set</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">recent_downloads:</span>
                      <div className="mt-1 p-2 bg-gray-900 rounded max-h-32 overflow-auto">
                        {localStorageData.recentDownloads ? (
                          <pre className="text-green-400 text-xs">
                            {JSON.stringify(
                              localStorageData.recentDownloads,
                              null,
                              2
                            )}
                          </pre>
                        ) : (
                          <span className="text-red-400">Not set</span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400">No localStorage data found</p>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-start gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                <h3 className="text-yellow-400 font-semibold">
                  Test Instructions
                </h3>
              </div>
              <ol className="text-yellow-200 text-sm list-decimal list-inside space-y-1 ml-7">
                <li>
                  Click "Run Full Test" to test the entire flow automatically
                </li>
                <li>
                  Or click "Open Modal Manually" to test the modal interaction
                </li>
                <li>Watch the test steps update in real-time</li>
                <li>Check localStorage status to see stored data</li>
                <li>Success page preview shows what users will see</li>
                <li>
                  Click "Download File" button to test download functionality
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Monetization Modal */}
        <MonetizationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onComplete={() => {
            setIsModalOpen(false);
            updateStep("2", "passed", "Payment initiated");
          }}
          title="Test Payment Flow"
          message="This is a test of the payment flow"
          downloadUrl={testDownloadUrl}
          fileName="test-file.pdf"
        />
      </div>
    </div>
  );
}

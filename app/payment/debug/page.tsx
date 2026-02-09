"use client";

import { useEffect, useState } from "react";

interface ITNLog {
  timestamp: string;
  status: "success" | "failed" | "error";
  message: string;
  data?: any;
}

export default function PaymentDebugPage() {
  const [logs, setLogs] = useState<ITNLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Test the notify endpoint and fetch last ITN attempt
    const loadDebugInfo = async () => {
      try {
        // Test notify endpoint
        const testResponse = await fetch(
          "https://www.trevnoctilla.com/payment/notify?test=true"
        );
        const testText = await testResponse.text();

        // Get last ITN attempt
        const debugResponse = await fetch(
          "https://www.trevnoctilla.com/api/payments/debug"
        );
        const debugData = await debugResponse.json();

        const newLogs: ITNLog[] = [
          {
            timestamp: new Date().toISOString(),
            status: testResponse.ok ? "success" : "error",
            message: `Notify endpoint test: ${testText}`,
            data: { status: testResponse.status, text: testText },
          },
        ];

        if (debugData.lastITN) {
          newLogs.push({
            timestamp: debugData.lastITN.timestamp,
            status: debugData.lastITN.status,
            message:
              debugData.lastITN.errors.length > 0
                ? debugData.lastITN.errors.join(" | ")
                : "ITN processed successfully",
            data: {
              requestId: debugData.lastITN.requestId,
              paymentStatus: debugData.lastITN.data?.payment_status,
              merchantId: debugData.lastITN.data?.merchant_id,
              errors: debugData.lastITN.errors,
            },
          });
        }

        setLogs(newLogs);
      } catch (error) {
        setLogs([
          {
            timestamp: new Date().toISOString(),
            status: "error",
            message: `Failed to load debug info: ${error}`,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadDebugInfo();

    // Refresh every 5 seconds
    const interval = setInterval(loadDebugInfo, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">
          PayFast Payment Debug
        </h1>

        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Notify Endpoint Status
          </h2>
          {isLoading ? (
            <p className="text-gray-400">Testing endpoint...</p>
          ) : (
            <div className="space-y-2">
              {logs.map((log, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded ${
                    log.status === "success"
                      ? "bg-green-900/20 border border-green-500/30"
                      : log.status === "failed"
                      ? "bg-yellow-900/20 border border-yellow-500/30"
                      : "bg-red-900/20 border border-red-500/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`font-medium ${
                        log.status === "success"
                          ? "text-green-400"
                          : log.status === "failed"
                          ? "text-yellow-400"
                          : "text-red-400"
                      }`}
                    >
                      {log.status.toUpperCase()}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-300">{log.message}</p>
                  {log.data && (
                    <pre className="mt-2 text-xs bg-[#0a0a0a] p-3 rounded overflow-x-auto text-gray-400">
                      {JSON.stringify(log.data, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Configuration Check
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Notify URL:</span>
              <span className="text-white">
                https://www.trevnoctilla.com/payment/notify
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Return URL:</span>
              <span className="text-white">
                https://www.trevnoctilla.com/payment/success
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Cancel URL:</span>
              <span className="text-white">
                https://www.trevnoctilla.com/payment/cancel
              </span>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            How to Debug
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li>
              Open browser console (F12) before clicking "Pay" in the
              monetization modal
            </li>
            <li>
              Look for logs starting with "🔗 notify_url:" - should show{" "}
              <code className="bg-[#0a0a0a] px-2 py-1 rounded text-green-400">
                https://www.trevnoctilla.com/payment/notify
              </code>
            </li>
            <li>
              After completing payment on PayFast, check Railway dashboard logs
              for entries starting with{" "}
              <code className="bg-[#0a0a0a] px-2 py-1 rounded text-yellow-400">
                [ITN-...]
              </code>
            </li>
            <li>
              Look for errors like{" "}
              <code className="bg-[#0a0a0a] px-2 py-1 rounded text-red-400">
                ❌ SIGNATURE VERIFICATION FAILED
              </code>{" "}
              or{" "}
              <code className="bg-[#0a0a0a] px-2 py-1 rounded text-red-400">
                ❌ MERCHANT CREDENTIALS MISMATCH
              </code>
            </li>
            <li>
              Verify Railway environment variables match your PayFast sandbox
              credentials
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}

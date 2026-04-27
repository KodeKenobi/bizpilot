"use client";

import { useEffect, useState } from "react";

export default function TestNotifyPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testNotify = async () => {
      try {
        // Test if endpoint is accessible
        const response = await fetch(
          "https://www.trevnoctilla.com/payment/notify?test=true"
        );
        const text = await response.text();

        // Get last ITN attempt
        const debugResponse = await fetch(
          "https://www.trevnoctilla.com/api/payments/debug"
        );
        const debugData = await debugResponse.json();

        setResult({
          endpointAccessible: response.ok,
          endpointResponse: text,
          lastITN: debugData.lastITN,
        });
      } catch (error) {
        setResult({
          error: String(error),
        });
      } finally {
        setLoading(false);
      }
    };

    testNotify();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-8 flex items-center justify-center">
        <p className="text-gray-400">Testing...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">
          PayFast Notify Endpoint Test
        </h1>

        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Endpoint Status
          </h2>
          {result?.endpointAccessible ? (
            <div className="p-4 bg-green-900/20 border border-green-500/30 rounded">
              <p className="text-green-400 font-semibold">✅ Endpoint Accessible</p>
              <p className="text-gray-300 text-sm mt-2">
                Response: {result.endpointResponse}
              </p>
            </div>
          ) : (
            <div className="p-4 bg-red-900/20 border border-red-500/30 rounded">
              <p className="text-red-400 font-semibold">❌ Endpoint Not Accessible</p>
              {result?.error && (
                <p className="text-gray-300 text-sm mt-2">Error: {result.error}</p>
              )}
            </div>
          )}
        </div>

        {result?.lastITN && (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Last ITN Attempt
            </h2>
            <div
              className={`p-4 rounded ${
                result.lastITN.status === "success"
                  ? "bg-green-900/20 border border-green-500/30"
                  : "bg-red-900/20 border border-red-500/30"
              }`}
            >
              <p className="font-semibold mb-2">
                Status:{" "}
                <span
                  className={
                    result.lastITN.status === "success"
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {result.lastITN.status.toUpperCase()}
                </span>
              </p>
              <p className="text-gray-400 text-sm mb-2">
                Time: {new Date(result.lastITN.timestamp).toLocaleString()}
              </p>
              <p className="text-gray-400 text-sm mb-2">
                Request ID: {result.lastITN.requestId}
              </p>
              {result.lastITN.errors && result.lastITN.errors.length > 0 && (
                <div className="mt-4">
                  <p className="text-red-400 font-semibold mb-2">Errors:</p>
                  <ul className="text-sm text-red-300 space-y-1">
                    {result.lastITN.errors.map((error: string, idx: number) => (
                      <li key={idx}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.lastITN.data && (
                <div className="mt-4">
                  <p className="text-gray-400 font-semibold mb-2">Data:</p>
                  <pre className="text-xs bg-[#0a0a0a] p-3 rounded overflow-x-auto text-gray-400">
                    {JSON.stringify(result.lastITN.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Next Steps
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li>
              If endpoint is NOT accessible, check Railway deployment status
            </li>
            <li>
              If endpoint IS accessible but last ITN shows errors, check Railway
              environment variables match your PayFast sandbox credentials
            </li>
            <li>
              Try completing a payment on PayFast, then refresh this page to see
              the ITN attempt
            </li>
            <li>
              Check Railway logs for entries starting with{" "}
              <code className="bg-[#0a0a0a] px-2 py-1 rounded text-yellow-400">
                [ITN-...]
              </code>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}


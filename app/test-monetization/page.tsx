"use client";

import { useState } from "react";
import { useMonetization } from "@/contexts/MonetizationProvider";
import MonetizationModal from "@/components/ui/MonetizationModal";

export default function TestMonetizationPage() {
  const { showModal } = useMonetization();
  const [logs, setLogs] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
    
  };

  const testMonetizationModal = async () => {
    addLog("🚀 Opening MonetizationModal...");
    setIsModalOpen(true);

    try {
      const completed = await showModal({
        title: "Test Payment",
        message: "Testing PayFast payment flow",
      });

      if (completed) {
        addLog("✅ User completed monetization (viewed ad or paid)");
      } else {
        addLog("❌ User cancelled monetization");
      }
    } catch (error) {
      addLog(`❌ Error: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">
          MonetizationModal Test
        </h1>

        <div className="mb-6">
          <button
            onClick={testMonetizationModal}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
          >
            Open MonetizationModal
          </button>
        </div>

        <div className="bg-[#1a1a1a] rounded-lg p-4 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Logs</h2>
          <div className="bg-[#0a0a0a] rounded p-4 h-96 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <p className="text-gray-500">
                No logs yet. Click button to test.
              </p>
            ) : (
              logs.map((log, i) => (
                <div
                  key={i}
                  className={`mb-1 ${
                    log.includes("❌") || log.includes("ERROR")
                      ? "text-red-400"
                      : log.includes("✅")
                      ? "text-green-400"
                      : "text-gray-300"
                  }`}
                >
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
          <h3 className="text-yellow-400 font-semibold mb-2">Instructions</h3>
          <ol className="text-yellow-200 text-sm list-decimal list-inside space-y-1">
            <li>Click "Open MonetizationModal" button</li>
            <li>Click "Pay $1" button in the modal</li>
            <li>Check browser console for detailed logs</li>
            <li>Check Network tab to see PayFast request</li>
            <li>Check logs above for payment flow status</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

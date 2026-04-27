"use client";

import { useState, useEffect } from "react";
import { API_CONFIG } from "@/lib/config";
import PayFastDollarForm from "@/components/ui/PayFastDollarForm";

const STORAGE_KEY = "payfast_test_logs";
const PAYMENT_DATA_KEY = "payfast_payment_data";
const ERROR_KEY = "payfast_error";

export default function TestPayFastPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Load logs from localStorage on mount (client-side only)
  useEffect(() => {
    setIsMounted(true);

    const savedLogs = localStorage.getItem(STORAGE_KEY);
    const savedPaymentData = localStorage.getItem(PAYMENT_DATA_KEY);
    const savedError = localStorage.getItem(ERROR_KEY);

    if (savedLogs) {
      try {
        setLogs(JSON.parse(savedLogs));
      } catch (e) {
        
      }
    }

    if (savedPaymentData) {
      try {
        setPaymentData(JSON.parse(savedPaymentData));
      } catch (e) {
        
      }
    }

    if (savedError) {
      setError(savedError);
    }
  }, []);

  // Save logs to localStorage whenever they change
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    }
  }, [logs, isMounted]);

  // Save payment data to localStorage
  useEffect(() => {
    if (isMounted) {
      if (paymentData) {
        localStorage.setItem(PAYMENT_DATA_KEY, JSON.stringify(paymentData));
      } else {
        localStorage.removeItem(PAYMENT_DATA_KEY);
      }
    }
  }, [paymentData, isMounted]);

  // Save error to localStorage
  useEffect(() => {
    if (isMounted) {
      if (error) {
        localStorage.setItem(ERROR_KEY, error);
      } else {
        localStorage.removeItem(ERROR_KEY);
      }
    }
  }, [error, isMounted]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    setLogs((prev) => {
      const newLogs = [...prev, logEntry];
      // Limit to last 1000 logs to prevent localStorage overflow
      return newLogs.slice(-1000);
    });
    
  };

  const clearLogs = () => {
    setLogs([]);
    setPaymentData(null);
    setError(null);
    if (isMounted) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(PAYMENT_DATA_KEY);
      localStorage.removeItem(ERROR_KEY);
    }
  };

  const testPayment = async () => {
    setLogs([]);
    setPaymentData(null);
    setError(null);

    try {
      addLog("🚀 Starting PayFast payment test...");
      addLog("📡 Calling /api/payments/payfast/initiate...");

      const response = await fetch("/api/payments/payfast/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: "1.00",
          item_name: "Test Payment",
          item_description: "Automated test",
          // email_address removed - PayFast will collect it to avoid 400 error
        }),
      });

      addLog(`📥 Response status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json();
        addLog(`❌ API Error: ${JSON.stringify(errorData)}`);
        setError(JSON.stringify(errorData, null, 2));
        return;
      }

      const data = await response.json();
      addLog("✅ Payment data received from API");
      addLog(`🔗 Payment URL: ${data.payment_url}`);
      addLog(`🆔 Payment ID: ${data.payment_id}`);

      // Check URL
      if (!data.payment_url.includes("sandbox")) {
        const err = `❌ ERROR: API returned PRODUCTION URL: ${data.payment_url}`;
        addLog(err);
        setError(err);
        return;
      }

      addLog("✅ URL is SANDBOX - Good!");
      setPaymentData(data);

      // Show payment data
      addLog("\n📋 Payment Data:");
      Object.keys(data.payment_data).forEach((key) => {
        if (key === "signature") {
          addLog(
            `  ${key}: ${data.payment_data[key]} (${data.payment_data[key].length} chars)`
          );
        } else {
          addLog(`  ${key}: ${data.payment_data[key]}`);
        }
      });

      // Test form submission with fetch first to see the actual response
      addLog("\n🧪 Testing PayFast submission...");
      addLog(`📍 Target URL: ${data.payment_url}`);

      // Show what we're sending
      addLog("\n📦 Data being sent to PayFast:");
      Object.keys(data.payment_data).forEach((key) => {
        const value = data.payment_data[key];
        addLog(`  ${key}: "${value}" (length: ${value.length})`);
      });

      // First, try to submit via fetch to see the actual response
      addLog("\n🔍 Step 1: Testing with fetch to see PayFast response...");

      const formData = new URLSearchParams();
      Object.keys(data.payment_data).forEach((key) => {
        formData.append(key, String(data.payment_data[key]));
      });

      addLog(
        `📋 URL-encoded form data: ${formData.toString().substring(0, 200)}...`
      );

      try {
        addLog("📤 Sending POST request to PayFast...");
        addLog(`📋 Request URL: ${data.payment_url}`);
        addLog(`📋 Content-Type: application/x-www-form-urlencoded`);
        addLog(`📋 Body length: ${formData.toString().length} bytes`);

        const payfastResponse = await fetch(data.payment_url, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
          redirect: "manual", // Don't follow redirects
        });

        addLog(
          `📥 PayFast Response Status: ${payfastResponse.status} ${payfastResponse.statusText}`
        );
        addLog(`📥 Response Headers:`);
        payfastResponse.headers.forEach((value, key) => {
          addLog(`   ${key}: ${value}`);
        });

        if (payfastResponse.status === 302 || payfastResponse.status === 200) {
          const location = payfastResponse.headers.get("location");
          addLog(
            `✅ PayFast accepted! Redirect to: ${location || "payment page"}`
          );
          addLog("\n🚀 Now submitting via form (browser method)...");

          // Create form for browser submission
          const form = document.createElement("form");
          form.method = "POST";
          form.action = data.payment_url;
          form.enctype = "application/x-www-form-urlencoded";
          form.acceptCharset = "UTF-8";
          form.style.display = "none";

          Object.keys(data.payment_data).forEach((key) => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = key;
            input.value = String(data.payment_data[key]);
            form.appendChild(input);
          });

          document.body.appendChild(form);

          setTimeout(() => {
            form.submit();
          }, 1000);
        } else {
          const responseText = await payfastResponse.text();
          addLog(`❌ PayFast returned error: ${payfastResponse.status}`);
          addLog(`📄 Response body length: ${responseText.length} bytes`);

          // Try multiple patterns to extract error message
          const errorPatterns = [
            /<h[1-6][^>]*>([^<]+)<\/h[1-6]>/i,
            /<title>([^<]+)<\/title>/i,
            /Error[:\s]+([^<\n]+)/i,
            /<p[^>]*class="[^"]*error[^"]*"[^>]*>([^<]+)<\/p>/i,
            /<div[^>]*class="[^"]*error[^"]*"[^>]*>([^<]+)<\/div>/i,
            /<span[^>]*class="[^"]*error[^"]*"[^>]*>([^<]+)<\/span>/i,
            /Unfortunately[^<]+/i,
            /could not process[^<]+/i,
            /Generated signature does not match[^<]+/i,
            /Merchant is unable to receive[^<]+/i,
          ];

          let errorMessage = null;
          for (const pattern of errorPatterns) {
            const match = responseText.match(pattern);
            if (match && match[1]) {
              errorMessage = match[1].trim();
              break;
            }
          }

          if (errorMessage) {
            addLog(`❌ PayFast Error Message: ${errorMessage}`);
            setError(
              `PayFast Error (${payfastResponse.status}): ${errorMessage}`
            );
          } else {
            addLog(
              `❌ Could not extract error message. Showing response HTML:`
            );
            // Show first 1000 chars of response
            const preview = responseText.substring(0, 1000);
            addLog(`📄 Response preview (first 1000 chars):`);
            addLog(preview);
            // Try to find any text content
            const textContent = responseText
              .replace(/<[^>]+>/g, " ")
              .replace(/\s+/g, " ")
              .trim();
            if (textContent) {
              addLog(`📄 Text content: ${textContent.substring(0, 200)}...`);
            }
            setError(
              `PayFast returned ${payfastResponse.status}. Check logs for details.`
            );
          }
        }
      } catch (fetchErr: any) {
        addLog(`❌ Fetch test failed with error:`);
        addLog(`   Error type: ${fetchErr?.name || "Unknown"}`);
        addLog(`   Error message: ${fetchErr?.message || String(fetchErr)}`);
        addLog(
          `   Error stack: ${fetchErr?.stack?.substring(0, 200) || "No stack"}`
        );

        // Check if it's a CORS error
        if (
          fetchErr?.message?.includes("CORS") ||
          fetchErr?.message?.includes("fetch") ||
          fetchErr?.message?.includes("Failed to fetch")
        ) {
          addLog(
            `⚠️ This is likely a CORS error - PayFast doesn't allow direct fetch requests`
          );
          addLog(
            `✅ This is normal - PayFast requires browser form submission`
          );
          addLog(`🔄 Proceeding with browser form submission...`);
        } else {
          addLog("🔄 Trying browser form submission instead...");
        }

        // Fallback to form submission
        const form = document.createElement("form");
        form.method = "POST";
        form.action = data.payment_url;
        form.enctype = "application/x-www-form-urlencoded";
        form.acceptCharset = "UTF-8";
        form.style.display = "none";

        Object.keys(data.payment_data).forEach((key) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = String(data.payment_data[key]);
          form.appendChild(input);
        });

        document.body.appendChild(form);
        setTimeout(() => {
          form.submit();
        }, 1000);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      addLog(`❌ Error: ${errorMsg}`);
      setError(errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">
          PayFast Payment Test Page
        </h1>

        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 mb-6">
          <button
            onClick={testPayment}
            className="px-6 py-3 bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] hover:from-[#7c3aed] hover:to-[#2563eb] text-white rounded-lg font-medium transition-all"
          >
            🧪 Test PayFast Payment
          </button>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 mb-6">
          <h2 className="text-white font-bold mb-4">
            Dynamic PayFast Form Test
          </h2>
          <PayFastDollarForm
            amount="1.00"
            item_name="Test Payment"
            item_description="Testing dynamic PayFast form"
          />
          <button
            onClick={() => {
              const form = document.querySelector(
                'form[action*="payfast"]'
              ) as HTMLFormElement;
              if (form) form.submit();
            }}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#16a34a] hover:to-[#15803d] text-white rounded-lg font-medium transition-all cursor-pointer"
          >
            Submit to PayFast
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
            <h2 className="text-red-400 font-bold mb-2">Error</h2>
            <pre className="text-red-300 text-sm whitespace-pre-wrap">
              {error}
            </pre>
          </div>
        )}

        {paymentData && (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 mb-6">
            <h2 className="text-white font-bold mb-4">Payment Data</h2>
            <pre className="text-gray-300 text-sm overflow-auto">
              {JSON.stringify(paymentData, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white font-bold">Test Logs</h2>
            <button
              onClick={clearLogs}
              className="px-4 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-gray-300 rounded-lg text-sm"
            >
              Clear Logs
            </button>
          </div>
          <div className="bg-[#0a0a0a] rounded p-4 h-96 overflow-y-auto font-mono text-sm">
            {!isMounted ? (
              <p className="text-gray-500">Loading...</p>
            ) : logs.length === 0 ? (
              <p className="text-gray-500">
                No logs yet. Click test button to start.
              </p>
            ) : (
              <>
                <div className="mb-2 text-xs text-gray-500 sticky top-0 bg-[#0a0a0a] pb-2">
                  {logs.length} log entries (persisted in localStorage -
                  survives page refresh)
                </div>
                {logs.map((log, i) => (
                  <div
                    key={i}
                    className={`mb-1 ${
                      log.includes("❌") || log.includes("ERROR")
                        ? "text-red-400"
                        : log.includes("✅") || log.includes("Good")
                        ? "text-green-400"
                        : log.includes("⚠️") || log.includes("WARNING")
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                  >
                    {log}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

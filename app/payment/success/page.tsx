"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import internalAnalytics from "@/lib/internalAnalytics";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshSessionSilently } = useUser();
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<
    "success" | "pending" | "failed"
  >("pending");
  const [itnDebug, setItnDebug] = useState<any>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [returnPath, setReturnPath] = useState<string | null>(null);
  const [isSubscription, setIsSubscription] = useState(false);
  const [isDownloadPayment, setIsDownloadPayment] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Helper function to get download URL from anywhere
  const getDownloadUrl = (): string | null => {
    if (downloadUrl) return downloadUrl;
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("payment_download_url");
      if (stored && stored.trim()) {
        // Check if it's a data URL or HTTP URL
        if (
          stored.trim().startsWith("data:") ||
          stored.trim().startsWith("http")
        ) {
          return stored.trim();
        }
      }
      // Check recent downloads
      const recent = JSON.parse(
        localStorage.getItem("recent_downloads") || "[]"
      );
      if (recent.length > 0) {
        const mostRecent = recent[0];
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        if (mostRecent.timestamp > oneDayAgo && mostRecent.url) {
          return mostRecent.url;
        }
      }
    }
    return null;
  };

  // Helper function to get filename from anywhere
  const getFileName = (): string | null => {
    if (fileName) return fileName;
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("payment_file_name");
      if (stored && stored.trim()) {
        return stored.trim();
      }
      // Check recent downloads
      const recent = JSON.parse(
        localStorage.getItem("recent_downloads") || "[]"
      );
      if (recent.length > 0) {
        const mostRecent = recent[0];
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        if (mostRecent.timestamp > oneDayAgo && mostRecent.itemName) {
          return mostRecent.itemName;
        }
      }
    }
    return null;
  };

  // Check localStorage for download URL IMMEDIATELY on page load
  // This is critical because PayFast may not return parameters in the URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check if download URL was stored before payment
      const storedDownloadUrl = localStorage.getItem("payment_download_url");
      if (storedDownloadUrl && storedDownloadUrl.trim()) {
        setDownloadUrl(storedDownloadUrl);
        setIsDownloadPayment(true);
        setPaymentStatus("success");
        // Don't clear it - keep it for later access
      }

      // Check if fileName was stored before payment
      const storedFileName = localStorage.getItem("payment_file_name");
      if (storedFileName && storedFileName.trim()) {
        setFileName(storedFileName);
      }

      // Check for return path
      const storedReturnPath = localStorage.getItem("payment_return_path");
      if (storedReturnPath) {
        setReturnPath(storedReturnPath);
      }

      // Check for recent downloads (in case user closed modal before downloading)
      // This will be updated when payment data is loaded, but check here as fallback
      if (!storedDownloadUrl || !storedDownloadUrl.trim()) {
        const recentDownloads = JSON.parse(
          localStorage.getItem("recent_downloads") || "[]"
        );
        if (recentDownloads.length > 0) {
          // Show most recent download if available
          const mostRecent = recentDownloads[0];
          // Only show if it's recent (within last 24 hours)
          const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
          if (mostRecent.timestamp > oneDayAgo && mostRecent.url) {
            setDownloadUrl(mostRecent.url);
            setIsDownloadPayment(true);
            setPaymentStatus("success");
          }
        }
      }
    }
  }, []);

  // Handle PayFast subscription upgrade (matching test script logic)
  const handleSubscriptionUpgrade = async (
    paymentStatus: string | null,
    planId: string | null,
    userId: string | null,
    planName: string | null,
    mPaymentId: string | null,
    pfPaymentId: string | null,
    amount: string | null
  ) => {
    // Check if we've already processed this upgrade (prevent duplicate calls)
    const upgradeKey = `upgrade_${mPaymentId || pfPaymentId || Date.now()}`;
    if (sessionStorage.getItem(upgradeKey)) {
      return;
    }

    try {
      // Get user info from session
      const sessionResponse = await fetch("/api/auth/session");
      const session = await sessionResponse.json();
      const sessionUserId = session?.user?.id || null;
      const sessionEmail = session?.user?.email || null;

      if (!sessionUserId && !sessionEmail) {
        return;
      }

      // Use user ID from URL params, session, or fallback
      const upgradeUserId = userId || sessionUserId || null;
      const upgradeEmail = sessionEmail || null;
      const upgradePlanId = planId || "production"; // Default to production
      const upgradePlanName =
        planName || "Production Plan - Monthly Subscription";
      const upgradeAmount = amount ? parseFloat(amount) : 29.0; // Default to R29

      // Call backend upgrade endpoint directly (matching test script logic)
      // Use relative URL to hide Railway backend URL
      const backendUrl =
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1")
          ? "http://localhost:5000"
          : "";

      const upgradeResponse = await fetch(
        `${backendUrl}/api/payment/upgrade-subscription`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: upgradeUserId ? parseInt(upgradeUserId) : undefined,
            user_email: upgradeEmail,
            plan_id: upgradePlanId,
            plan_name: upgradePlanName,
            amount: upgradeAmount,
            payment_id: mPaymentId || pfPaymentId || `payment-${Date.now()}`,
          }),
        }
      );

      if (upgradeResponse.ok) {
        const upgradeData = await upgradeResponse.json();

        // Mark as processed
        sessionStorage.setItem(upgradeKey, "true");

        // Silently refresh session to get updated subscription tier
        const refreshSuccess = await refreshSessionSilently();
        if (refreshSuccess) {
        } else {
        }

        // Redirect to dashboard to show updated tier
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        const errorData = await upgradeResponse.json().catch(() => ({}));
        // Don't show error to user - webhook may still process it
      }
    } catch (error) {
      // Don't show error to user - webhook may still process it
    }
  };

  useEffect(() => {
    // Verify payment status from PayFast callback
    const verifyPayment = async () => {
      // Log ALL parameters from PayFast return_url callback
      const allParams: Record<string, string | null> = {};
      searchParams.forEach((value, key) => {
        allParams[key] = value;
      });

      const mPaymentId = searchParams.get("m_payment_id");
      const pfPaymentId = searchParams.get("pf_payment_id");
      const paymentStatus = searchParams.get("payment_status");
      const signature = searchParams.get("signature");
      const amount = searchParams.get("amount");
      const itemName = searchParams.get("item_name");
      const subscriptionType = searchParams.get("subscription_type");

      // Get download URL from custom_str1 (stored by MonetizationModal)
      const urlFromParams = searchParams.get("custom_str1");
      const pathFromParams = searchParams.get("custom_str2");

      // Determine if this is a $1 download payment or subscription
      // $1 payments: amount ~= 1.00, no subscription_type, downloadUrl in custom_str1
      // Subscriptions: has subscription_type, or item_name contains "Subscription"
      const paymentIsSubscription =
        !!subscriptionType ||
        (itemName?.toLowerCase().includes("subscription") ?? false);

      // Check for download URL from params OR localStorage
      const storedDownloadUrl =
        typeof window !== "undefined"
          ? localStorage.getItem("payment_download_url")
          : null;
      const hasDownloadUrl =
        urlFromParams?.startsWith("http") ||
        storedDownloadUrl?.startsWith("http");

      // If there's a download URL, it's ALWAYS a download payment (unless it's a subscription)
      // Also check if amount is around $1 (download payment)
      const amountNum = amount ? parseFloat(amount) : null;
      const isOneDollarPayment = amountNum
        ? amountNum >= 0.99 && amountNum <= 1.01
        : false;

      const paymentIsDownload =
        !paymentIsSubscription && (!!hasDownloadUrl || isOneDollarPayment);

      setIsSubscription(!!paymentIsSubscription);
      setIsDownloadPayment(!!paymentIsDownload);

      // Store in state for use in UI
      // Use download URL from params if available, otherwise use localStorage
      const finalDownloadUrl = urlFromParams?.startsWith("http")
        ? urlFromParams
        : storedDownloadUrl?.startsWith("http")
        ? storedDownloadUrl
        : null;

      if (finalDownloadUrl) {
        setDownloadUrl(finalDownloadUrl);
        // Store download URL with payment ID for later access
        if (mPaymentId && typeof window !== "undefined") {
          const downloadData = {
            url: finalDownloadUrl,
            paymentId: mPaymentId,
            timestamp: Date.now(),
            itemName: itemName || "File Download",
          };
          localStorage.setItem(
            `download_${mPaymentId}`,
            JSON.stringify(downloadData)
          );
          // Also store in a list of recent downloads
          const recentDownloads = JSON.parse(
            localStorage.getItem("recent_downloads") || "[]"
          );
          recentDownloads.unshift(downloadData);
          // Keep only last 10 downloads
          const limitedDownloads = recentDownloads.slice(0, 10);
          localStorage.setItem(
            "recent_downloads",
            JSON.stringify(limitedDownloads)
          );
        }
      }
      if (pathFromParams) setReturnPath(pathFromParams);

      // Fetch ITN debug info to see what happened
      try {
        const debugResponse = await fetch(
          "https://www.trevnoctilla.com/api/payments/debug"
        );
        const debugData = await debugResponse.json();
        if (debugData.lastITN) {
          setItnDebug(debugData.lastITN);
        }
      } catch (error) {}

      // For $0.00 payments (wallet-funded), PayFast might not send ITN
      // but will include payment status in return_url
      if (paymentStatus === "COMPLETE") {
        setPaymentStatus("success");
        // Don't auto-download - let user click the button for better UX and to avoid popup blockers

        // TODO: Update payment status in database
        // TODO: Grant user premium access
        // TODO: Send confirmation email
      } else if (paymentStatus === "PENDING") {
        setPaymentStatus("pending");
      } else if (paymentStatus) {
        setPaymentStatus("failed");
      } else {
        // No payment_status in URL - PayFast sometimes doesn't return params
        // If user reached success page, payment likely succeeded
        // Check if we have download URL in localStorage to confirm it's a $1 payment
        if (typeof window !== "undefined") {
          const storedDownloadUrl = localStorage.getItem(
            "payment_download_url"
          );
          if (storedDownloadUrl && storedDownloadUrl.trim()) {
            // User paid $1 and we have download URL - mark as success
            setPaymentStatus("success");
            if (!downloadUrl) {
              setDownloadUrl(storedDownloadUrl);
              setIsDownloadPayment(true);
            }
          } else {
            // Check recent downloads as fallback
            const recentDownloads = JSON.parse(
              localStorage.getItem("recent_downloads") || "[]"
            );
            if (recentDownloads.length > 0) {
              const mostRecent = recentDownloads[0];
              const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
              if (mostRecent.timestamp > oneDayAgo && mostRecent.url) {
                setPaymentStatus("success");
                if (!downloadUrl) {
                  setDownloadUrl(mostRecent.url);
                  setIsDownloadPayment(true);
                }
              } else {
                setPaymentStatus("success"); // Default to success if redirected here
              }
            } else {
              setPaymentStatus("success"); // Default to success if redirected here
            }
          }
        } else {
          setPaymentStatus("success"); // Default to success if redirected here
        }
      }

      // ALWAYS check localStorage again after processing (in case it wasn't set initially)
      // This ensures we find the download URL even if PayFast doesn't return it
      if (typeof window !== "undefined" && !downloadUrl) {
        const storedDownloadUrl = localStorage.getItem("payment_download_url");
        if (storedDownloadUrl && storedDownloadUrl.trim()) {
          setDownloadUrl(storedDownloadUrl);
          setIsDownloadPayment(true);
        } else {
          // Check recent downloads one more time
          const recentDownloads = JSON.parse(
            localStorage.getItem("recent_downloads") || "[]"
          );
          if (recentDownloads.length > 0) {
            const mostRecent = recentDownloads[0];
            const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
            if (mostRecent.timestamp > oneDayAgo && mostRecent.url) {
              setDownloadUrl(mostRecent.url);
              setIsDownloadPayment(true);
            }
          }
        }
      }

      setIsVerifying(false);

      // Handle subscription upgrade for subscriptions that return to success page
      // (Most subscriptions return to dashboard, but this is a fallback)
      if (
        paymentIsSubscription &&
        (paymentStatus === "COMPLETE" || paymentStatus === "PENDING")
      ) {
        // Extract plan ID and user ID from URL params
        // Note: For subscriptions, custom_str1 should be plan ID, custom_str2 should be user ID
        // But for download payments, custom_str1 is download URL, custom_str2 is file path
        // So we need to check if it's a subscription first (already done above)
        const planIdFromParams = searchParams.get("custom_str1");
        const userIdFromParams = searchParams.get("custom_str2");

        handleSubscriptionUpgrade(
          paymentStatus,
          planIdFromParams, // Plan ID from custom_str1
          userIdFromParams, // User ID from custom_str2
          itemName,
          mPaymentId,
          pfPaymentId,
          amount
        );
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  // Track payment when status becomes success
  useEffect(() => {
    if (paymentStatus === "success" && typeof window !== "undefined") {
      const amount = searchParams.get("amount");
      const itemName = searchParams.get("item_name");
      const subscriptionType = searchParams.get("subscription_type");
      const mPaymentId = searchParams.get("m_payment_id");

      // Track payment success (only once)
      if (
        !localStorage.getItem(`payment_tracked_${mPaymentId || Date.now()}`)
      ) {
        internalAnalytics.track("payment_success", {
          payment_id: mPaymentId || null,
          amount: amount || null,
          item_name: itemName || null,
          is_subscription: !!subscriptionType,
          payment_type: subscriptionType ? "subscription" : "one_time",
          page: "/payment/success",
        });

        // Mark as tracked to avoid duplicate tracking
        if (mPaymentId) {
          localStorage.setItem(`payment_tracked_${mPaymentId}`, "true");
        }
      }
    }
  }, [paymentStatus, searchParams]);

  // Handle download - triggers file save dialog with correct filename
  const handleDownload = () => {
    const url = getDownloadUrl();
    const file = getFileName();

    if (url) {
      // Create anchor element to trigger download
      const link = document.createElement("a");
      link.href = url;
      // Use stored filename if available, otherwise let browser determine
      link.download = file || "";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // For data URLs, the download attribute should work
      // For HTTP URLs, also open in new tab as fallback
      if (url.startsWith("http")) {
        window.open(url, "_blank");
      }
    }
  };

  // Handle close - return to where user was (not PayFast)
  const handleClose = () => {
    if (returnPath) {
      router.push(returnPath);
    } else {
      // Fallback to home if no return path
      router.push("/");
    }
  };

  // Handle sending file and invoice via email
  const handleSendEmail = async () => {
    if (!emailAddress || !emailAddress.includes("@")) {
      alert("Please enter a valid email address");
      return;
    }

    setIsSendingEmail(true);
    try {
      const downloadUrl = getDownloadUrl();
      const fileName = getFileName();
      const amount = searchParams.get("amount") || "1.00";
      const mPaymentId = searchParams.get("m_payment_id");
      const itemName =
        searchParams.get("item_name") || fileName || "File Download";

      // Get payment date
      const paymentDate = new Date();

      const response = await fetch("/api/payment/send-file-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailAddress,
          downloadUrl: downloadUrl,
          fileName: fileName,
          amount: parseFloat(amount),
          paymentId: mPaymentId,
          itemName: itemName,
          paymentDate: paymentDate.toISOString(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setEmailSent(true);
        setTimeout(() => {
          setShowEmailModal(false);
          setEmailAddress("");
          setEmailSent(false);
        }, 1500);
      } else {
        alert(data.error || "Failed to send email. Please try again.");
      }
    } catch (error) {
      alert("An error occurred while sending the email. Please try again.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#8b5cf6] animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground dark:text-gray-400">
            Verifying payment...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Backdrop - blocks all interaction with website */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]" />

      {/* Modal Content - centered overlay */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
        <div className="max-w-md w-full bg-card dark:bg-[#1a1a1a] border border-border dark:border-[#2a2a2a] rounded-lg p-8 text-center shadow-2xl pointer-events-auto">
          {paymentStatus === "success" ? (
            <>
              <div className="mb-6">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-green-500 rounded-full blur-lg opacity-30"></div>
                  <CheckCircle className="w-16 h-16 text-green-500 relative" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-foreground dark:text-white mb-2">
                Payment Successful!
              </h1>
              <p className="text-muted-foreground dark:text-gray-400 mb-6">
                {(() => {
                  const url = getDownloadUrl();
                  if (url && !isSubscription) {
                    return "Your payment has been processed successfully. Click the button below to download your file.";
                  }
                  if (isSubscription) {
                    return "Your subscription has been activated successfully. You now have premium access.";
                  }
                  return "Your payment has been processed successfully.";
                })()}
              </p>
              <div className="space-y-3">
                {(() => {
                  const url = getDownloadUrl();
                  // ALWAYS show download button if URL exists and it's not a subscription
                  if (url && !isSubscription) {
                    return (
                      <>
                        <button
                          onClick={handleDownload}
                          className="block w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white rounded-lg font-medium transition-all shadow-lg"
                        >
                          Download File
                        </button>
                        <button
                          onClick={handleClose}
                          className="block w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all"
                        >
                          Close
                        </button>
                        <p className="text-sm text-muted-foreground dark:text-gray-400 mt-4">
                          <button
                            onClick={() => setShowEmailModal(true)}
                            className="text-[#8b5cf6] hover:text-[#7c3aed] underline transition-colors"
                          >
                            Click here to send your file and invoice to your
                            email address
                          </button>
                        </p>
                      </>
                    );
                  }
                  // For subscriptions or other payments, show standard button
                  // Auto-redirect subscriptions to dashboard after 2 seconds
                  if (isSubscription) {
                    setTimeout(() => {
                      router.push("/dashboard");
                    }, 2000);
                  }

                  return (
                    <button
                      onClick={() => {
                        if (isSubscription) {
                          router.push("/dashboard");
                        } else {
                          handleClose();
                        }
                      }}
                      className="block w-full px-6 py-3 bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] hover:from-[#7c3aed] hover:to-[#2563eb] text-white rounded-lg font-medium transition-all"
                    >
                      {isSubscription ? "Go to Dashboard" : "Close"}
                    </button>
                  );
                })()}
              </div>
            </>
          ) : paymentStatus === "pending" ? (
            <>
              <div className="mb-6">
                <Loader2 className="w-16 h-16 text-yellow-500 animate-spin mx-auto" />
              </div>
              <h1 className="text-2xl font-bold text-foreground dark:text-white mb-2">
                Payment Pending
              </h1>
              <p className="text-muted-foreground dark:text-gray-400 mb-6">
                Your payment is being processed. This may take a few minutes for
                EFT payments.
              </p>
              <button
                onClick={handleClose}
                className="block w-full px-6 py-3 bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] hover:from-[#7c3aed] hover:to-[#2563eb] text-white rounded-lg font-medium transition-all"
              >
                Close
              </button>
            </>
          ) : (
            <>
              <div className="mb-6">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-red-500 rounded-full blur-lg opacity-30"></div>
                  <div className="w-16 h-16 text-red-500 relative text-4xl">
                    ✕
                  </div>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-foreground dark:text-white mb-2">
                Payment Failed
              </h1>
              <p className="text-muted-foreground dark:text-gray-400 mb-6">
                Your payment could not be processed. Please try again.
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleClose}
                  className="block w-full px-6 py-3 bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] hover:from-[#7c3aed] hover:to-[#2563eb] text-white rounded-lg font-medium transition-all"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[102]" />

          {/* Modal */}
          <div className="fixed inset-0 z-[103] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-card dark:bg-[#1a1a1a] border border-border dark:border-[#2a2a2a] rounded-lg p-6 shadow-2xl">
              {emailSent ? (
                <div className="text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-foreground dark:text-white mb-2">
                    Email Sent!
                  </h2>
                  <p className="text-muted-foreground dark:text-gray-400">
                    Your file and invoice have been sent to {emailAddress}
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-foreground dark:text-white mb-4">
                    Send File & Invoice to Email
                  </h2>
                  <p className="text-sm text-muted-foreground dark:text-gray-400 mb-6">
                    Enter your email address to receive your file and invoice.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="email-input"
                        className="block text-sm font-medium text-foreground dark:text-gray-300 mb-2"
                      >
                        Email Address
                      </label>
                      <input
                        id="email-input"
                        type="email"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full px-4 py-2 bg-background dark:bg-[#0a0a0a] border border-border dark:border-[#2a2a2a] rounded-lg text-foreground dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
                        disabled={isSendingEmail}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !isSendingEmail) {
                            handleSendEmail();
                          }
                        }}
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleSendEmail}
                        disabled={isSendingEmail || !emailAddress}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] hover:from-[#7c3aed] hover:to-[#2563eb] text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSendingEmail ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" />
                            Sending...
                          </>
                        ) : (
                          "Send Email"
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setShowEmailModal(false);
                          setEmailAddress("");
                        }}
                        disabled={isSendingEmail}
                        className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <>
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]" />
          <div className="fixed inset-0 z-[101] flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-[#8b5cf6] animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground dark:text-gray-400">
                Loading...
              </p>
            </div>
          </div>
        </>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}

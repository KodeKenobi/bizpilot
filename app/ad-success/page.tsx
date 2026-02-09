"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";

export default function AdSuccessPage() {
  const router = useRouter();
  const [adOpened, setAdOpened] = useState(false);
  const [hasReturned, setHasReturned] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  // Open ad in new tab when page loads
  useEffect(() => {
    const monetagUrl = "https://otieu.com/4/10115019";
    const adTab = window.open(monetagUrl, "_blank", "noopener,noreferrer");
    if (adTab) {
      setAdOpened(true);
    }

    // Get download info from localStorage
    if (typeof window !== "undefined") {
      const storedUrl = localStorage.getItem("ad_download_url");
      const storedFileName = localStorage.getItem("ad_file_name");
      if (storedUrl) {
        setDownloadUrl(storedUrl);
      }
      if (storedFileName) {
        setFileName(storedFileName);
      }
    }
  }, []);

  // Detect when user returns from ad tab
  useEffect(() => {
    if (!adOpened) return;

    const handleVisibility = () => {
      if (document.visibilityState === "visible" && !hasReturned) {
        setHasReturned(true);
      }
    };

    const handleFocus = () => {
      if (!hasReturned) {
        setHasReturned(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleFocus);
    };
  }, [adOpened, hasReturned]);

  // Handle download
  const handleDownload = () => {
    if (downloadUrl) {
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName || "";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (downloadUrl.startsWith("http")) {
        window.open(downloadUrl, "_blank");
      }
    }
  };

  // Handle close
  const handleClose = () => {
    // Clean up localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("ad_download_url");
      localStorage.removeItem("ad_file_name");
    }
    router.push("/");
  };

  if (!hasReturned) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#8b5cf6] animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground dark:text-gray-400">
            Please view the ad and return to this page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]" />

      {/* Modal Content */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
        <div className="max-w-md w-full bg-card dark:bg-[#1a1a1a] border border-border dark:border-[#2a2a2a] rounded-lg p-8 text-center shadow-2xl pointer-events-auto">
          <div className="mb-6">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-green-500 rounded-full blur-lg opacity-30"></div>
              <CheckCircle className="w-16 h-16 text-green-500 relative" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground dark:text-white mb-2">
            Ad Viewed Successfully!
          </h1>
          <p className="text-muted-foreground dark:text-gray-400 mb-6">
            {downloadUrl
              ? "Thank you for viewing the ad. Click the button below to download your file."
              : "Thank you for viewing the ad."}
          </p>
          <div className="space-y-3">
            {downloadUrl && (
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
              </>
            )}
            {!downloadUrl && (
              <button
                onClick={handleClose}
                className="block w-full px-6 py-3 bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] hover:from-[#7c3aed] hover:to-[#2563eb] text-white rounded-lg font-medium transition-all"
              >
                Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

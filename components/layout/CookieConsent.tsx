"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Settings, Check } from "lucide-react";
import Link from "next/link";
import internalAnalytics from "../../lib/internalAnalytics";

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true, // Always true, can't be disabled
    analytics: false,
    functional: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      // Show consent immediately
      setShowConsent(true);
    } else {
      // Load saved preferences
      const savedPreferences = localStorage.getItem("cookiePreferences");
      if (savedPreferences) {
        setCookiePreferences(JSON.parse(savedPreferences));
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      functional: true,
      marketing: true,
    };
    setCookiePreferences(allAccepted);
    localStorage.setItem("cookieConsent", "accepted");
    localStorage.setItem("cookiePreferences", JSON.stringify(allAccepted));

    // Initialize internal analytics
    internalAnalytics.track("cookie_consent", {
      action: "accept_all",
      preferences: allAccepted,
    });

    setShowConsent(false);
  };

  const handleRejectAll = () => {
    const onlyEssential = {
      essential: true,
      analytics: false,
      functional: false,
      marketing: false,
    };
    setCookiePreferences(onlyEssential);
    localStorage.setItem("cookieConsent", "rejected");
    localStorage.setItem("cookiePreferences", JSON.stringify(onlyEssential));
    setShowConsent(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem("cookieConsent", "customized");
    localStorage.setItem(
      "cookiePreferences",
      JSON.stringify(cookiePreferences)
    );
    setShowConsent(false);
    setShowSettings(false);
  };

  const togglePreference = (key: keyof typeof cookiePreferences) => {
    if (key === "essential") return; // Can't disable essential cookies
    setCookiePreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!showConsent) return null;

  return (
    <AnimatePresence>
      {/* Backdrop overlay when consent is required */}
      {showConsent && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] pointer-events-none"
        />
      )}

      <motion.div
        key="consent-banner"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-0 left-0 right-0 z-[70] p-4"
      >
        <div className="max-w-4xl mx-auto">
          <div className="bg-card/95 dark:bg-gray-900/95 backdrop-blur-xl border border-border dark:border-gray-700/50 rounded-2xl p-6 shadow-2xl">
            {!showSettings ? (
              // Main consent banner
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                <div className="flex items-center space-x-3 flex-1">
                  <img
                    src="/logo.png"
                    alt="Trevnoctilla Logo"
                    className="w-12 h-12 object-contain flex-shrink-0"
                    onError={(e) => {
                      // Fallback to a simple text logo
                      e.currentTarget.style.display = "none";
                      const fallback = document.createElement("div");
                      fallback.className =
                        "w-12 h-12 bg-black rounded-lg flex items-center justify-center border border-white";
                      fallback.innerHTML =
                        '<span class="text-white font-bold text-sm">T</span>';
                      e.currentTarget.parentNode?.insertBefore(
                        fallback,
                        e.currentTarget
                      );
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground dark:text-white mb-1">
                      We use cookies to enhance your experience
                    </h3>
                    <p className="text-foreground/90 dark:text-gray-300 text-sm leading-relaxed">
                      We use essential cookies to make our site work, and
                      optional cookies to analyze usage and improve your
                      experience. You can choose which cookies to accept.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                  <button
                    onClick={() => setShowSettings(true)}
                    className="flex items-center justify-center space-x-2 px-4 py-2 border border-border dark:border-gray-600 hover:border-cyan-400 text-foreground/90 dark:text-gray-300 hover:text-foreground dark:hover:text-white rounded-lg transition-all duration-200 text-sm"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Customize</span>
                  </button>

                  <button
                    onClick={handleRejectAll}
                    className="px-6 py-2 border border-border dark:border-gray-600 hover:border-red-400 text-foreground/90 dark:text-gray-300 hover:text-red-400 rounded-lg transition-all duration-200 text-sm font-medium"
                  >
                    Reject All
                  </button>

                  <button
                    onClick={handleAcceptAll}
                    className="px-6 py-2 bg-black hover:bg-gray-800 text-white rounded-lg transition-all duration-200 text-sm font-medium border border-white"
                  >
                    Accept All
                  </button>
                </div>
              </div>
            ) : (
              // Settings panel
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-foreground dark:text-white">
                    Cookie Preferences
                  </h3>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-muted-foreground dark:text-gray-400 hover:text-foreground dark:hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  {/* Essential Cookies */}
                  <div className="flex items-center justify-between p-4 bg-accent/50 dark:bg-gray-800/50 rounded-lg border border-border dark:border-gray-700/50">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Settings className="w-5 h-5 text-green-400" />
                        <h4 className="font-semibold text-foreground dark:text-white">
                          Essential Cookies
                        </h4>
                        <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold">
                          Required
                        </span>
                      </div>
                      <p className="text-muted-foreground dark:text-gray-400 text-sm">
                        These cookies are necessary for the website to function
                        and cannot be switched off.
                      </p>
                    </div>
                    <div className="ml-4">
                      <div className="w-12 h-6 bg-green-500 rounded-full flex items-center justify-end px-1">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="flex items-center justify-between p-4 bg-accent/50 dark:bg-gray-800/50 rounded-lg border border-border dark:border-gray-700/50">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Settings className="w-5 h-5 text-blue-400" />
                        <h4 className="font-semibold text-foreground dark:text-white">
                          Analytics Cookies
                        </h4>
                      </div>
                      <p className="text-muted-foreground dark:text-gray-400 text-sm">
                        Help us understand how visitors interact with our
                        website by collecting information anonymously.
                      </p>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => togglePreference("analytics")}
                        className={`w-12 h-6 rounded-full flex items-center transition-all duration-200 ${
                          cookiePreferences.analytics
                            ? "bg-cyan-500 justify-end"
                            : "bg-gray-600 justify-start"
                        }`}
                      >
                        <div className="w-5 h-5 bg-white rounded-full shadow-md"></div>
                      </button>
                    </div>
                  </div>

                  {/* Functional Cookies */}
                  <div className="flex items-center justify-between p-4 bg-accent/50 dark:bg-gray-800/50 rounded-lg border border-border dark:border-gray-700/50">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Settings className="w-5 h-5 text-white" />
                        <h4 className="font-semibold text-foreground dark:text-white">
                          Functional Cookies
                        </h4>
                      </div>
                      <p className="text-muted-foreground dark:text-gray-400 text-sm">
                        Enable enhanced functionality and personalization, such
                        as remembering your preferences.
                      </p>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => togglePreference("functional")}
                        className={`w-12 h-6 rounded-full flex items-center transition-all duration-200 ${
                          cookiePreferences.functional
                            ? "bg-cyan-500 justify-end"
                            : "bg-gray-600 justify-start"
                        }`}
                      >
                        <div className="w-5 h-5 bg-white rounded-full shadow-md"></div>
                      </button>
                    </div>
                  </div>

                  {/* Marketing Cookies */}
                  <div className="flex items-center justify-between p-4 bg-accent/50 dark:bg-gray-800/50 rounded-lg border border-border dark:border-gray-700/50">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Settings className="w-5 h-5 text-orange-400" />
                        <h4 className="font-semibold text-foreground dark:text-white">
                          Marketing Cookies
                        </h4>
                      </div>
                      <p className="text-muted-foreground dark:text-gray-400 text-sm">
                        Used to track visitors across websites to display
                        relevant and engaging advertisements.
                      </p>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => togglePreference("marketing")}
                        className={`w-12 h-6 rounded-full flex items-center transition-all duration-200 ${
                          cookiePreferences.marketing
                            ? "bg-cyan-500 justify-end"
                            : "bg-gray-600 justify-start"
                        }`}
                      >
                        <div className="w-5 h-5 bg-white rounded-full shadow-md"></div>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
                  <Link
                    href="/cookies"
                    className="text-white hover:text-cyan-300 text-sm underline"
                  >
                    Learn more about our cookie policy
                  </Link>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowSettings(false)}
                      className="px-6 py-2 border border-border dark:border-gray-600 hover:border-gray-500 text-foreground/90 dark:text-gray-300 hover:text-foreground dark:hover:text-white rounded-lg transition-all duration-200 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSavePreferences}
                      className="px-6 py-2 bg-black hover:bg-gray-800 text-white rounded-lg transition-all duration-200 text-sm font-medium border border-white"
                    >
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

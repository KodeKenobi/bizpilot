"use client";

import React, { useState } from "react";
import { useNavigation } from "@/contexts/NavigationContext";

export default function UniversalHeader() {
  const { currentPage, navigateTo } = useNavigation();
  const [selectedMenuItem, setSelectedMenuItem] = useState("Home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Update selected menu item based on current page
  React.useEffect(() => {
    switch (currentPage) {
      case "home":
        setSelectedMenuItem("Home");
        break;
      case "tools":
        setSelectedMenuItem("Tools");
        break;
      case "video-converter":
        setSelectedMenuItem("Video Converter");
        break;
      case "audio-converter":
        setSelectedMenuItem("Audio Converter");
        break;
      case "image-converter":
        setSelectedMenuItem("Image Converter");
        break;
      case "pdf-tools":
        setSelectedMenuItem("PDF Tools");
        break;
      case "pdf-editor":
        setSelectedMenuItem("PDF Editor");
        break;
      case "qr-generator":
        setSelectedMenuItem("QR Generator");
        break;
      default:
        setSelectedMenuItem("Home");
    }
  }, [currentPage]);

  const handleNavClick = (item: string) => {
    console.log("Nav item clicked:", item);
    setSelectedMenuItem(item);
    setIsMobileMenuOpen(false); // Close mobile menu after selection

    if (item === "Home") navigateTo("home");
    else if (item === "Tools") navigateTo("tools");
    else if (item === "Video Converter") navigateTo("video-converter");
    else if (item === "Audio Converter") navigateTo("audio-converter");
    else if (item === "Image Converter") navigateTo("image-converter");
    else if (item === "PDF Tools") navigateTo("pdf-tools");
    else if (item === "QR Generator") navigateTo("qr-generator");
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-2 sm:px-6 py-3 lg:px-12 bg-gray-900/95 backdrop-blur-md border-b border-gray-700/30">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              console.log("Home clicked");
              navigateTo("home");
            }}
            className="flex items-center space-x-2 text-lg sm:text-xl font-bold text-white hover:text-purple-400 transition-colors"
          >
            <img 
              src="/logo.png" 
              alt="Trevnoctilla Logo" 
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
              onLoad={() => console.log("Logo loaded successfully")}
              onError={(e) => {
                console.error("Logo failed to load:", e);
                // Show fallback text if logo fails
                e.currentTarget.style.display = 'none';
              }}
            />
            <span>Trevnoctilla</span>
          </button>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center bg-white/10 backdrop-blur-lg border border-white/20 rounded-full px-2 py-2 shadow-lg">
          {[
            "Home",
            "Tools",
            "Video Converter",
            "Audio Converter",
            "Image Converter",
            "PDF Tools",
            "QR Generator",
          ].map((item) => (
            <div key={item}>
              <button
                onClick={() => handleNavClick(item)}
                className={`${
                  selectedMenuItem === item
                    ? "bg-white/20 text-white backdrop-blur-sm"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                } px-4 py-2 rounded-full transition-all duration-200 text-sm`}
              >
                {item}
              </button>
            </div>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center space-x-4">
          <div>
            <button
              onClick={() => navigateTo("tools")}
              className="text-gray-300 hover:text-white transition-colors text-sm"
            >
              All Tools
            </button>
          </div>
          <div className="hover:scale-105 transition-transform">
            <button
              onClick={() => navigateTo("tools")}
              className="bg-gradient-to-r from-purple-500/80 to-pink-500/80 backdrop-blur-sm text-white px-4 py-2 rounded-xl hover:from-purple-600/90 hover:to-pink-600/90 transition-all duration-200 border border-white/20 shadow-lg text-sm"
            >
              Get Started
            </button>
          </div>
        </div>

        {/* Mobile Hamburger Menu */}
        <div className="lg:hidden flex items-center space-x-2">
          <button
            onClick={() => navigateTo("tools")}
            className="bg-gradient-to-r from-purple-500/80 to-pink-500/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs"
          >
            Get Started
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-md border-b border-gray-700/30 lg:hidden">
          <nav className="flex flex-col p-4 space-y-2">
            {[
              "Home",
              "Tools",
              "Video Converter",
              "Audio Converter",
              "Image Converter",
              "PDF Tools",
              "QR Generator",
            ].map((item) => (
              <button
                key={item}
                onClick={() => handleNavClick(item)}
                className={`${
                  selectedMenuItem === item
                    ? "bg-white/20 text-white"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                } px-4 py-3 rounded-lg transition-all duration-200 text-left`}
              >
                {item}
              </button>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}

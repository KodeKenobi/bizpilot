"use client";

import React, { useState } from "react";
import { useNavigation } from "@/contexts/NavigationContext";
import { useUser } from "@/contexts/UserContext";
import { useView } from "@/contexts/ViewContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Monitor,
  User,
  Shield,
  UserCircle,
  LogOut,
  ChevronDown,
} from "lucide-react";

export default function UniversalHeader() {
  const { currentPage, navigateTo } = useNavigation();
  const { user, loading, logout, isAdmin, isSuperAdmin } = useUser();
  const {
    currentView,
    setCurrentView,
    isSuperAdmin: viewIsSuperAdmin,
  } = useView();
  const router = useRouter();
  const [selectedMenuItem, setSelectedMenuItem] = useState("Home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isProfileDropdownOpen) {
        const target = event.target as Element;
        if (!target.closest("[data-profile-dropdown]")) {
          setIsProfileDropdownOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileDropdownOpen]);

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

  const handleViewSwitch = (view: "website" | "client" | "admin") => {
    setCurrentView(view);
    if (view === "website") {
      // Navigate to website home
      window.location.href = "/";
    } else if (view === "client") {
      // Navigate to client dashboard
      window.location.href = "/dashboard";
    } else if (view === "admin") {
      // Navigate to admin dashboard
      window.location.href = "/admin";
    }
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
                // Fallback to a simple text logo
                e.currentTarget.style.display = "none";
                const fallback = document.createElement("div");
                fallback.className =
                  "w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center";
                fallback.innerHTML =
                  '<span class="text-white font-bold text-sm sm:text-base">T</span>';
                e.currentTarget.parentNode?.insertBefore(
                  fallback,
                  e.currentTarget
                );
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
            <div key={item} className="mx-1">
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
          {/* Switch View Tab for Super Admin */}
          {isSuperAdmin && user && (
            <div className="flex items-center space-x-1 bg-gray-800/50 rounded-lg p-1">
              <button
                onClick={() => handleViewSwitch("website")}
                className={`p-2 rounded-md transition-all ${
                  currentView === "website"
                    ? "bg-purple-600 text-white"
                    : "text-gray-300 hover:text-white hover:bg-gray-700"
                }`}
                title="Website View"
              >
                <Monitor className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleViewSwitch("client")}
                className={`p-2 rounded-md transition-all ${
                  currentView === "client"
                    ? "bg-purple-600 text-white"
                    : "text-gray-300 hover:text-white hover:bg-gray-700"
                }`}
                title="Client Dashboard"
              >
                <User className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleViewSwitch("admin")}
                className={`p-2 rounded-md transition-all ${
                  currentView === "admin"
                    ? "bg-purple-600 text-white"
                    : "text-gray-300 hover:text-white hover:bg-gray-700"
                }`}
                title="Admin Dashboard"
              >
                <Shield className="h-4 w-4" />
              </button>
            </div>
          )}
          {loading ? (
            <div className="w-20 h-8 bg-gray-700 rounded-lg animate-pulse"></div>
          ) : user ? (
            <div className="flex items-center space-x-3">
              {isAdmin && (
                <Link
                  href={isSuperAdmin ? "/admin" : "/dashboard"}
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  {isSuperAdmin ? "Admin Panel" : "Dashboard"}
                </Link>
              )}
              <div className="flex items-center space-x-2">
                <div className="relative" data-profile-dropdown>
                  <button
                    onClick={() =>
                      setIsProfileDropdownOpen(!isProfileDropdownOpen)
                    }
                    className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors cursor-pointer p-2 rounded-lg border border-purple-500/30 hover:border-purple-400/50"
                    title="Profile"
                  >
                    <UserCircle className="h-5 w-5" />
                    <ChevronDown className="h-3 w-3" />
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-gray-800/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-xl z-50">
                      <div className="p-4 border-b border-gray-700">
                        <div className="flex items-center space-x-3">
                          <UserCircle className="h-8 w-8 text-purple-400" />
                          <div>
                            <p className="text-sm font-medium text-white">
                              {user.email}
                            </p>
                            <p className="text-xs text-gray-400 capitalize">
                              {user.role}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={logout}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="hover:scale-105 transition-transform">
              <Link
                href="/auth/login"
                className="bg-gradient-to-r from-purple-500/80 to-pink-500/80 backdrop-blur-sm text-white px-4 py-2 rounded-xl hover:from-purple-600/90 hover:to-pink-600/90 transition-all duration-200 border border-white/20 shadow-lg text-sm"
              >
                Login
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Menu */}
        <div className="lg:hidden flex items-center space-x-2">
          {/* Mobile Switch View for Super Admin */}
          {isSuperAdmin && user && (
            <div className="flex items-center space-x-1 bg-gray-800/50 rounded-lg p-1 mr-2">
              <button
                onClick={() => handleViewSwitch("website")}
                className={`p-2 rounded transition-all ${
                  currentView === "website"
                    ? "bg-purple-600 text-white"
                    : "text-gray-300 hover:text-white hover:bg-gray-700"
                }`}
                title="Website View"
              >
                <Monitor className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleViewSwitch("client")}
                className={`p-2 rounded transition-all ${
                  currentView === "client"
                    ? "bg-purple-600 text-white"
                    : "text-gray-300 hover:text-white hover:bg-gray-700"
                }`}
                title="Client Dashboard"
              >
                <User className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleViewSwitch("admin")}
                className={`p-2 rounded transition-all ${
                  currentView === "admin"
                    ? "bg-purple-600 text-white"
                    : "text-gray-300 hover:text-white hover:bg-gray-700"
                }`}
                title="Admin Dashboard"
              >
                <Shield className="h-4 w-4" />
              </button>
            </div>
          )}

          {loading ? (
            <div className="w-16 h-6 bg-gray-700 rounded-lg animate-pulse"></div>
          ) : user ? (
            <div className="flex items-center space-x-2">
              <div className="relative" data-profile-dropdown>
                <button
                  onClick={() =>
                    setIsProfileDropdownOpen(!isProfileDropdownOpen)
                  }
                  className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors cursor-pointer p-1.5 rounded-lg border border-purple-500/30 hover:border-purple-400/50"
                  title="Profile"
                >
                  <UserCircle className="h-4 w-4" />
                  <ChevronDown className="h-3 w-3" />
                </button>

                {/* Mobile Profile Dropdown */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-gray-800/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-xl z-50">
                    <div className="p-3 border-b border-gray-700">
                      <div className="flex items-center space-x-2">
                        <UserCircle className="h-6 w-6 text-purple-400" />
                        <div>
                          <p className="text-xs font-medium text-white">
                            {user.email}
                          </p>
                          <p className="text-xs text-gray-400 capitalize">
                            {user.role}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={logout}
                        className="w-full flex items-center space-x-2 px-2 py-1.5 text-xs text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                      >
                        <LogOut className="h-3 w-3" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="bg-gradient-to-r from-purple-500/80 to-pink-500/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs"
            >
              Login
            </Link>
          )}
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

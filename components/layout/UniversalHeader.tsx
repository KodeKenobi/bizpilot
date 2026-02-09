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
  
  // Check if user is enterprise (admin role)
  const isEnterprise = user?.role === "admin";

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
    const pathname = typeof window !== "undefined" ? window.location.pathname : "";

    // Check for campaigns pages first
    if (pathname.startsWith('/campaigns')) {
      setSelectedMenuItem("Campaigns");
      return;
    }

    // Existing logic for other pages
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
    setSelectedMenuItem(item);
    setIsMobileMenuOpen(false); // Close mobile menu after selection

    if (item === "Home") navigateTo("home");
    else if (item === "Tools") navigateTo("tools");
    else if (item === "Video Converter") navigateTo("video-converter");
    else if (item === "Audio Converter") navigateTo("audio-converter");
    else if (item === "Image Converter") navigateTo("image-converter");
    else if (item === "PDF Tools") navigateTo("pdf-tools");
    else if (item === "QR Generator") navigateTo("qr-generator");
    else if (item === "API") router.push("/api-docs");
  };

  const handleViewSwitch = (view: "website" | "client" | "admin" | "enterprise") => {
    setCurrentView(view as any);
    if (view === "website") {
      // Navigate to website home
      window.location.href = "/";
    } else if (view === "client") {
      // Navigate to client dashboard
      window.location.href = "/dashboard";
    } else if (view === "admin") {
      // Navigate to admin dashboard
      window.location.href = "/admin";
    } else if (view === "enterprise") {
      // Navigate to enterprise dashboard
      window.location.href = "/enterprise";
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-between px-2 sm:px-6 py-3 lg:px-12 bg-background/95 backdrop-blur-md border-b border-border dark:border-gray-700/30 w-full max-w-full">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="flex items-center space-x-2 text-lg sm:text-xl font-bold text-white hover:text-gray-300 transition-colors"
          >
            <img
              src="/logo.png"
              alt="Trevnoctilla Logo"
              width={40}
              height={40}
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
              onError={(e) => {
                // Fallback to a simple text logo
                e.currentTarget.style.display = "none";
                const fallback = document.createElement("div");
                fallback.className =
                  "w-8 h-8 sm:w-10 sm:h-10 bg-black rounded-lg flex items-center justify-center";
                fallback.innerHTML =
                  '<span class="text-white font-bold text-sm sm:text-base">T</span>';
                e.currentTarget.parentNode?.insertBefore(
                  fallback,
                  e.currentTarget
                );
              }}
            />
            <span className="text-white">Trevnoctilla</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center bg-white/10 backdrop-blur-lg border border-white/20 rounded-full px-2 py-2 shadow-lg">
          {[
            { label: "Home", href: "/", anchor: "Free Online PDF Editor" },
            { label: "Tools", href: "/tools", anchor: "Free PDF Editor Tools" },
            {
              label: "Video Converter",
              href: "/tools/video-converter",
              anchor: "Convert Video to MP3",
            },
            {
              label: "Audio Converter",
              href: "/tools/audio-converter",
              anchor: "Free Audio Converter",
            },
            {
              label: "Image Converter",
              href: "/tools/image-converter",
              anchor: "Image Format Converter",
            },
            {
              label: "PDF Tools",
              href: "/tools/pdf-tools",
              anchor: "Edit PDF Online for Free",
            },
            {
              label: "QR Generator",
              href: "/tools/qr-generator",
              anchor: "Free QR Code Generator",
            },
            { label: "Campaigns", href: "/campaigns", anchor: "Contact Form Automation" },
            { label: "API", href: "/api-docs", anchor: "PDF Processing API" },
          ].map((item) => (
            <div key={item.label} className="mx-1">
              <Link
                href={item.href}
                className={`${
                  selectedMenuItem === item.label
                    ? "bg-white/20 text-white backdrop-blur-sm"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                } px-4 py-2 rounded-full transition-all duration-200 text-sm`}
                title={item.anchor}
              >
                {item.label}
              </Link>
            </div>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center space-x-4">
          {/* Theme Toggle */}
          {/* Switch View Tab for Super Admin and Enterprise */}
          {(isSuperAdmin || isEnterprise) && user && (
            <div className="flex items-center space-x-1 bg-gray-800/50 rounded-lg p-1">
              <button
                onClick={() => handleViewSwitch("website")}
                className={`p-2 rounded-md transition-all ${
                  currentView === "website"
                    ? "bg-black text-white"
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
                    ? "bg-black text-white"
                    : "text-gray-300 hover:text-white hover:bg-gray-700"
                }`}
                title={isEnterprise ? "Full Dashboard" : "Client Dashboard"}
              >
                <User className="h-4 w-4" />
              </button>
              {isSuperAdmin ? (
                <button
                  onClick={() => handleViewSwitch("admin")}
                  className={`p-2 rounded-md transition-all ${
                    currentView === "admin"
                      ? "bg-black text-white"
                      : "text-gray-300 hover:text-white hover:bg-gray-700"
                  }`}
                  title="Admin Dashboard"
                >
                  <Shield className="h-4 w-4" />
                </button>
              ) : isEnterprise ? (
                <button
                  onClick={() => handleViewSwitch("enterprise")}
                  className={`p-2 rounded-md transition-all ${
                    currentView === "enterprise"
                      ? "bg-black text-white"
                      : "text-gray-300 hover:text-white hover:bg-gray-700"
                  }`}
                  title="Enterprise Dashboard"
                >
                  <Shield className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          )}
          {loading ? (
            <div className="w-20 h-8 bg-gray-700 rounded-lg animate-pulse"></div>
          ) : user ? (
            <div className="flex items-center space-x-3">
              {/* {currentView !== "client" && (
                <Link
                  href="/dashboard"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Client Dashboard
                </Link>
              )}
              {isAdmin && isSuperAdmin && currentView !== "admin" && (
                <Link
                  href="/admin"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Admin Panel
                </Link>
              )} */}
              <div className="flex items-center space-x-2">
                <div className="relative z-[99999]" data-profile-dropdown>
                  <button
                    onClick={() =>
                      setIsProfileDropdownOpen(!isProfileDropdownOpen)
                    }
                    className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors cursor-pointer p-2 rounded-lg border border-gray-600 hover:border-gray-500"
                    title="Profile"
                  >
                    <UserCircle className="h-5 w-5" />
                    <ChevronDown className="h-3 w-3" />
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-gray-800/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-xl z-[99999]">
                      <div className="p-4 border-b border-gray-700">
                        <div className="flex items-center space-x-3">
                          <UserCircle className="h-8 w-8 text-white" />
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
                        {/* Show dashboard links for super admin and enterprise */}
                        {isSuperAdmin && (
                          <>
                            {/* Switch to Client Dashboard */}
                            <Link
                              href="/dashboard"
                              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors mb-2"
                            >
                              <User className="h-4 w-4" />
                              <span>Client Dashboard</span>
                            </Link>

                            {/* Switch to Admin Dashboard */}
                            <Link
                              href="/admin"
                              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors mb-2"
                            >
                              <Shield className="h-4 w-4" />
                              <span>Admin Dashboard</span>
                            </Link>
                          </>
                        )}

                        {isEnterprise && !isSuperAdmin && (
                          <>
                            {/* Switch to Full Dashboard */}
                            <Link
                              href="/dashboard"
                              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors mb-2"
                            >
                              <User className="h-4 w-4" />
                              <span>Full Dashboard</span>
                            </Link>

                            {/* Switch to Enterprise Dashboard */}
                            <Link
                              href="/enterprise"
                              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors mb-2"
                            >
                              <Shield className="h-4 w-4" />
                              <span>Enterprise Dashboard</span>
                            </Link>
                          </>
                        )}

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
                className="bg-black text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition-all duration-200 border border-white/20 shadow-lg text-sm"
              >
                Login
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Menu */}
        <div className="lg:hidden flex items-center space-x-2">
          {/* Mobile Switch View for Super Admin and Enterprise */}
          {(isSuperAdmin || isEnterprise) && user && (
            <div className="flex items-center space-x-1 bg-gray-800/50 rounded-lg p-1 mr-2">
              <button
                onClick={() => handleViewSwitch("website")}
                className={`p-2 rounded transition-all ${
                  currentView === "website"
                    ? "bg-black text-white"
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
                    ? "bg-black text-white"
                    : "text-gray-300 hover:text-white hover:bg-gray-700"
                }`}
                title={isEnterprise ? "Full Dashboard" : "Client Dashboard"}
              >
                <User className="h-4 w-4" />
              </button>
              {isSuperAdmin ? (
                <button
                  onClick={() => handleViewSwitch("admin")}
                  className={`p-2 rounded transition-all ${
                    currentView === "admin"
                      ? "bg-black text-white"
                      : "text-gray-300 hover:text-white hover:bg-gray-700"
                  }`}
                  title="Admin Dashboard"
                >
                  <Shield className="h-4 w-4" />
                </button>
              ) : isEnterprise ? (
                <button
                  onClick={() => handleViewSwitch("enterprise")}
                  className={`p-2 rounded transition-all ${
                    currentView === "enterprise"
                      ? "bg-black text-white"
                      : "text-gray-300 hover:text-white hover:bg-gray-700"
                  }`}
                  title="Enterprise Dashboard"
                >
                  <Shield className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          )}

          {loading ? (
            <div className="w-16 h-6 bg-gray-700 rounded-lg animate-pulse"></div>
          ) : user ? (
            <div className="flex items-center space-x-2">
              <div className="relative z-[99999]" data-profile-dropdown>
                <button
                  onClick={() =>
                    setIsProfileDropdownOpen(!isProfileDropdownOpen)
                  }
                  className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors cursor-pointer p-1.5 rounded-lg border border-gray-600 hover:border-gray-500"
                  title="Profile"
                >
                  <UserCircle className="h-4 w-4" />
                  <ChevronDown className="h-3 w-3" />
                </button>

                {/* Mobile Profile Dropdown */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-gray-800/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-xl z-[99999]">
                    <div className="p-3 border-b border-gray-700">
                      <div className="flex items-center space-x-2">
                        <UserCircle className="h-6 w-6 text-white" />
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
                      {/* Only show dashboard links for super admin */}
                      {isSuperAdmin && (
                        <>
                          {/* Switch to Client Dashboard */}
                          <Link
                            href="/dashboard"
                            className="w-full flex items-center space-x-2 px-2 py-1.5 text-xs text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors mb-1"
                          >
                            <User className="h-3 w-3" />
                            <span>Client Dashboard</span>
                          </Link>

                          {/* Switch to Admin Dashboard */}
                          <Link
                            href="/admin"
                            className="w-full flex items-center space-x-2 px-2 py-1.5 text-xs text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors mb-1"
                          >
                            <Shield className="h-3 w-3" />
                            <span>Admin Dashboard</span>
                          </Link>
                        </>
                      )}

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
              className="bg-black text-white px-3 py-1.5 rounded-lg text-xs hover:bg-gray-800"
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
        <div className="fixed top-16 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-gray-700/30 lg:hidden">
          <nav className="flex flex-col p-4 space-y-2">
            {[
              { label: "Home", href: "/", anchor: "Free Online PDF Editor" },
              {
                label: "Tools",
                href: "/tools",
                anchor: "Free PDF Editor Tools",
              },
              {
                label: "Video Converter",
                href: "/tools/video-converter",
                anchor: "Convert Video to MP3",
              },
              {
                label: "Audio Converter",
                href: "/tools/audio-converter",
                anchor: "Free Audio Converter",
              },
              {
                label: "Image Converter",
                href: "/tools/image-converter",
                anchor: "Image Format Converter",
              },
              {
                label: "PDF Tools",
                href: "/tools/pdf-tools",
                anchor: "Edit PDF Online for Free",
              },
              {
                label: "QR Generator",
                href: "/tools/qr-generator",
                anchor: "Free QR Code Generator",
              },
              { label: "Campaigns", href: "/campaigns", anchor: "Contact Form Automation" },
              { label: "API", href: "/api-docs", anchor: "PDF Processing API" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`${
                  selectedMenuItem === item.label
                    ? "bg-white/20 text-white"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                } px-4 py-3 rounded-lg transition-all duration-200 text-left`}
                title={item.anchor}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}

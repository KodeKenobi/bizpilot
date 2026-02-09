"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import {
  Shield,
  Play,
  Square,
  RotateCcw,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function AutomationsPage() {
  const { user, loading: userLoading } = useUser();
  const [adServiceStatus, setAdServiceStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant: "danger" | "warning" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    variant: "info",
  });
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (user) {
      loadAdServiceStatus();
    }
  }, [user]);

  const showNotification = (type: "success" | "error" | "info", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const startAdService = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/ad-service/start", {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to start ad service");
      }

      const data = await response.json();
      showNotification("success", data.message);
      await loadAdServiceStatus();
    } catch (err: any) {
      showNotification("error", err.message);
      console.error("Error starting ad service:", err);
    } finally {
      setLoading(false);
    }
  };

  const stopAdService = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/ad-service/stop", {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to stop ad service");
      }

      const data = await response.json();
      showNotification("success", data.message);
      await loadAdServiceStatus();
    } catch (err: any) {
      showNotification("error", err.message);
      console.error("Error stopping ad service:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetAdStats = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/ad-service/reset", {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to reset ad stats");
      }

      const data = await response.json();
      showNotification("success", data.message);
      await loadAdServiceStatus();
    } catch (err: any) {
      showNotification("error", err.message);
      console.error("Error resetting ad stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadAdServiceStatus = async () => {
    try {
      const response = await fetch("/api/admin/ad-service/status");
      if (response.ok) {
        const data = await response.json();
        setAdServiceStatus(data.status);
      }
    } catch (err: any) {
      console.error("Error loading ad service status:", err);
    }
  };

  const handleStartClick = () => {
    setConfirmDialog({
      isOpen: true,
      title: "Start Ad Service",
      message:
        "Are you sure you want to start the automated ad view service? This will begin simulating ad views throughout the day.",
      onConfirm: startAdService,
      variant: "info",
    });
  };

  const handleStopClick = () => {
    setConfirmDialog({
      isOpen: true,
      title: "Stop Ad Service",
      message:
        "Are you sure you want to stop the ad service? This will halt all automated ad view simulations.",
      onConfirm: stopAdService,
      variant: "warning",
    });
  };

  const handleResetClick = () => {
    setConfirmDialog({
      isOpen: true,
      title: "Reset Statistics",
      message:
        "Are you sure you want to reset all ad view statistics? This action cannot be undone.",
      onConfirm: resetAdStats,
      variant: "danger",
    });
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center p-8 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg shadow-lg">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-4">
            You do not have permission to access this page.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Login as Admin
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 page-content">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Ad Automations
              </h1>
              <p className="text-gray-300 text-lg">
                Manage automated ad view service and monitor performance
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={loadAdServiceStatus}
                className="flex items-center space-x-2 px-3 py-1.5 bg-gray-700/50 border border-gray-600 rounded-full text-gray-300 hover:bg-gray-700 hover:text-white transition-all text-sm"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Notification */}
          {notification && (
            <div
              className={`p-4 rounded-lg border ${
                notification.type === "success"
                  ? "bg-green-900/20 border-green-500/30 text-green-300"
                  : notification.type === "error"
                  ? "bg-red-900/20 border-red-500/30 text-red-300"
                  : "bg-blue-900/20 border-blue-500/30 text-blue-300"
              }`}
            >
              <div className="flex items-center gap-2">
                {notification.type === "success" ? (
                  <CheckCircle className="w-5 h-5" />
                ) : notification.type === "error" ? (
                  <AlertCircle className="w-5 h-5" />
                ) : (
                  <Activity className="w-5 h-5" />
                )}
                <span>{notification.message}</span>
              </div>
            </div>
          )}

          {/* Status Overview */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-lg rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <Activity className="h-8 w-8 text-green-400" />
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    adServiceStatus?.is_running
                      ? "bg-green-500/20 text-green-300 border border-green-500/30"
                      : "bg-red-500/20 text-red-300 border border-red-500/30"
                  }`}
                >
                  {adServiceStatus?.is_running ? "Running" : "Stopped"}
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-2">Service Status</p>
              <p className="text-2xl font-bold text-white">
                {adServiceStatus?.is_running ? "Active" : "Inactive"}
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-lg rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <Zap className="h-8 w-8 text-blue-400" />
              </div>
              <p className="text-sm text-gray-400 mb-2">Total Views</p>
              <p className="text-2xl font-bold text-white">
                {adServiceStatus?.total_views || 0}
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-lg rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="h-8 w-8 text-purple-400" />
              </div>
              <p className="text-sm text-gray-400 mb-2">Today's Views</p>
              <p className="text-2xl font-bold text-white">
                {adServiceStatus?.today_views || 0} /{" "}
                {adServiceStatus?.target_daily_views || 12}
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-lg rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <Clock className="h-8 w-8 text-yellow-400" />
              </div>
              <p className="text-sm text-gray-400 mb-2">Last View</p>
              <p className="text-sm font-medium text-white">
                {adServiceStatus?.last_view_time
                  ? new Date(adServiceStatus.last_view_time).toLocaleString()
                  : "Never"}
              </p>
            </div>
          </div>

          {/* Service Controls */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-lg rounded-xl">
            <div className="px-6 py-6">
              <h3 className="text-xl font-semibold text-white mb-6">
                Service Controls
              </h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleStartClick}
                  disabled={loading || adServiceStatus?.is_running}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600/20 border border-green-500/30 rounded-full hover:bg-green-600/30 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="h-4 w-4 text-green-400 group-hover:text-green-300" />
                  <span className="text-white font-medium text-sm">Start Service</span>
                </button>

                <button
                  onClick={handleStopClick}
                  disabled={loading || !adServiceStatus?.is_running}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600/20 border border-red-500/30 rounded-full hover:bg-red-600/30 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Square className="h-4 w-4 text-red-400 group-hover:text-red-300" />
                  <span className="text-white font-medium text-sm">Stop Service</span>
                </button>

                <button
                  onClick={handleResetClick}
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 bg-yellow-600/20 border border-yellow-500/30 rounded-full hover:bg-yellow-600/30 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RotateCcw className="h-4 w-4 text-yellow-400 group-hover:text-yellow-300" />
                  <span className="text-white font-medium text-sm">Reset Statistics</span>
                </button>
              </div>
            </div>
          </div>

          {/* Service Information */}
          <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <BarChart3 className="h-8 w-8 text-purple-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">
                  Automated Ad Views
                </h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  This service automatically simulates ad views throughout the day (12
                  times total) to boost ad revenue. Views are spread randomly to avoid
                  detection. Progress emails are sent every 10 views.
                </p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          {adServiceStatus?.recent_history?.length > 0 && (
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-lg rounded-xl">
              <div className="px-6 py-6">
                <h3 className="text-xl font-semibold text-white mb-6">
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {adServiceStatus.recent_history.slice(0, 10).map((record: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600"
                    >
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-sm text-white">{record.context}</span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(record.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() =>
          setConfirmDialog({ ...confirmDialog, isOpen: false })
        }
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
      />
    </div>
  );
}

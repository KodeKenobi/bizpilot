"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import {
  Shield,
  Play,
  Database,
  HardDrive,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  Download,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function BackupsPage() {
  const { user, loading: userLoading } = useUser();
  const [backupStatus, setBackupStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (user) {
      loadBackupStatus();
    }
  }, [user]);

  const showNotification = (type: "success" | "error" | "info", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const runManualBackup = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/backup/run", {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to start backup");
      }

      const data = await response.json();
      showNotification("success", data.message);
      await loadBackupStatus();
    } catch (err: any) {
      showNotification("error", err.message);
      console.error("Error starting backup:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadBackupStatus = async () => {
    try {
      const response = await fetch("/api/admin/backup/status");
      if (response.ok) {
        const data = await response.json();
        setBackupStatus(data);
      }
    } catch (err: any) {
      console.error("Error loading backup status:", err);
    }
  };

  const handleBackupClick = () => {
    setConfirmDialog({
      isOpen: true,
      title: "Run Manual Backup",
      message:
        "Are you sure you want to run a manual database backup? This will create a new backup file.",
      onConfirm: runManualBackup,
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
                Database Backups
              </h1>
              <p className="text-gray-300 text-lg">
                Manage database backups and restore points
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={loadBackupStatus}
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-lg rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <Database className="h-8 w-8 text-blue-400" />
              </div>
              <p className="text-sm text-gray-400 mb-2">Total Backups</p>
              <p className="text-2xl font-bold text-white">
                {backupStatus?.total_backups || 0}
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-lg rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <HardDrive className="h-8 w-8 text-purple-400" />
              </div>
              <p className="text-sm text-gray-400 mb-2">Backup Directory</p>
              <p className="text-sm font-medium text-white truncate">
                {backupStatus?.backup_directory || "N/A"}
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-lg rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <Clock className="h-8 w-8 text-green-400" />
              </div>
              <p className="text-sm text-gray-400 mb-2">Last Backup</p>
              <p className="text-sm font-medium text-white">
                {backupStatus?.backup_files?.[0]
                  ? new Date(
                      backupStatus.backup_files[0].created * 1000
                    ).toLocaleString()
                  : "Never"}
              </p>
            </div>
          </div>

          {/* Backup Control */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-lg rounded-xl">
            <div className="px-6 py-6">
              <h3 className="text-xl font-semibold text-white mb-6">
                Backup Operations
              </h3>
              <div className="flex justify-start">
                <button
                  onClick={handleBackupClick}
                  disabled={loading}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600/20 border border-blue-500/30 rounded-full hover:bg-blue-600/30 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="h-4 w-4 text-blue-400 group-hover:text-blue-300" />
                  <span className="text-white font-medium text-sm">
                    {loading ? "Running Backup..." : "Run Manual Backup"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Backup Information */}
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <Database className="h-8 w-8 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">
                  Automated Backups
                </h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Database backups are automatically created daily to ensure data
                  integrity and provide restore points. Manual backups can be triggered
                  at any time for additional safety.
                </p>
              </div>
            </div>
          </div>

          {/* Recent Backups */}
          {backupStatus?.backup_files?.length > 0 && (
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-lg rounded-xl">
              <div className="px-6 py-6">
                <h3 className="text-xl font-semibold text-white mb-6">
                  Recent Backups
                </h3>
                <div className="space-y-3">
                  {backupStatus.backup_files
                    .slice(0, 10)
                    .map((file: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600 hover:bg-gray-700/50 transition-all"
                      >
                        <div className="flex items-center space-x-4">
                          <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-white">
                              {file.name}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(file.created * 1000).toLocaleString()}
                              </span>
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <HardDrive className="w-3 h-3" />
                                {file.size_mb} MB
                              </span>
                            </div>
                          </div>
                        </div>
                        <button className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg transition-all">
                          <Download className="h-5 w-5" />
                        </button>
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
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant="info"
      />
    </div>
  );
}

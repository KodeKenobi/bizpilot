"use client";

import React, { useState } from "react";
import {
  FileText,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ActivityItem {
  id: string;
  timestamp: string;
  tool: string;
  operation: string;
  status: "success" | "error" | "processing";
  fileSize: number; // in bytes
  duration: number; // in seconds
  endpoint: string;
  responseTime: number; // in ms
}

interface ActivityTableProps {
  activities: ActivityItem[];
  onDownload?: (activityId: string) => void;
}

export function ActivityTable({ activities, onDownload }: ActivityTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(1)}s`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-[#22c55e]" />;
      case "error":
        return <XCircle className="w-4 h-4 text-[#ef4444]" />;
      case "processing":
        return <Clock className="w-4 h-4 text-[#f59e0b] animate-pulse" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-[#22c55e]";
      case "error":
        return "text-[#ef4444]";
      case "processing":
        return "text-[#f59e0b]";
      default:
        return "text-gray-400";
    }
  };

  const getToolColor = (tool: string) => {
    const colors = {
      "Video Converter": "from-[#ef4444] to-[#dc2626]",
      "PDF Tools": "from-[#8b5cf6] to-[#7c3aed]",
      "Audio Converter": "from-[#22c55e] to-[#16a34a]",
      "Image Converter": "from-[#3b82f6] to-[#2563eb]",
      "QR Generator": "from-[#f59e0b] to-[#d97706]",
    };
    return colors[tool as keyof typeof colors] || "from-[#6b7280] to-[#4b5563]";
  };

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
      <div className="px-6 py-4 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-3 h-3 bg-gradient-to-r from-[#22c55e] to-[#16a34a] rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-3 h-3 bg-gradient-to-r from-[#22c55e] to-[#16a34a] rounded-full blur-sm opacity-50"></div>
          </div>
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
        </div>
      </div>

      <div className="divide-y divide-[#2a2a2a]">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="px-4 py-3 hover:bg-[#0a0a0a] cursor-pointer"
            onClick={() =>
              setExpandedRow(expandedRow === activity.id ? null : activity.id)
            }
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div
                    className={`w-8 h-8 bg-gradient-to-r ${getToolColor(
                      activity.tool
                    )} rounded-full flex items-center justify-center`}
                  >
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                  <div
                    className={`absolute inset-0 w-8 h-8 bg-gradient-to-r ${getToolColor(
                      activity.tool
                    )} rounded-full blur-sm opacity-30`}
                  ></div>
                </div>
                <div>
                  <div className="text-sm font-medium text-white">
                    {activity.tool}
                  </div>
                  <div className="text-xs text-gray-400">
                    {activity.operation}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-white font-medium">
                    {formatFileSize(activity.fileSize)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <button className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-[#2a2a2a] transition-colors">
                  {expandedRow === activity.id ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Expanded Details - Enhanced */}
            {expandedRow === activity.id && (
              <div className="mt-4 pt-4 border-t border-[#2a2a2a]">
                <div className="grid grid-cols-2 gap-6 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-[#3b82f6] to-[#2563eb] rounded-full"></div>
                    <span className="text-gray-500">Endpoint:</span>
                    <span className="text-white font-medium font-mono">
                      {activity.endpoint}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-[#f59e0b] to-[#d97706] rounded-full"></div>
                    <span className="text-gray-500">Response:</span>
                    <span className="text-white font-medium">
                      {activity.responseTime}ms
                    </span>
                  </div>
                </div>
                {activity.status === "success" && onDownload && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownload(activity.id);
                    }}
                    className="mt-4 text-[#8b5cf6] hover:text-[#7c3aed] text-sm flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#8b5cf6]/10 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {activities.length === 0 && (
        <div className="px-6 py-12 text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-[#6b7280] to-[#4b5563] rounded-full blur-lg opacity-30"></div>
            <div className="relative w-16 h-16 bg-gradient-to-r from-[#6b7280] to-[#4b5563] rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8 text-white" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            No Recent Activity
          </h3>
          <p className="text-sm text-gray-400">
            Your API activity will appear here
          </p>
        </div>
      )}
    </div>
  );
}

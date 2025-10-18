"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Video,
  Music,
  Image,
  QrCode,
  FileText,
  Play,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { TOOL_CATEGORIES } from "@/lib/apiEndpoints";
import { ApiTester } from "./ApiTester";

interface ToolCardProps {
  toolId: string;
  stats: {
    callsToday: number;
    successRate: number;
    avgResponseTime: number;
  };
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onTestApi: (toolId: string) => void;
}

const iconMap = {
  Video,
  Music,
  Image,
  QrCode,
  FileText,
};

export function ToolCard({
  toolId,
  stats,
  isExpanded = false,
  onToggleExpand,
  onTestApi,
}: ToolCardProps) {
  const tool = TOOL_CATEGORIES.find((t) => t.id === toolId);

  if (!tool) return null;

  const IconComponent = iconMap[tool.icon as keyof typeof iconMap];

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 hover:bg-[#0f0f0f] hover:border-[#3a3a3a] transition-all duration-200 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: tool.color + "20" }}
            >
              <IconComponent
                className="w-6 h-6"
                style={{ color: tool.color }}
              />
            </div>
            <div
              className="absolute inset-0 w-12 h-12 rounded-full blur-sm opacity-30"
              style={{ backgroundColor: tool.color }}
            ></div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white">{tool.name}</h3>
            <p className="text-sm text-gray-400">{tool.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-8 text-sm">
            <div className="text-center">
              <div className="relative w-10 h-10 mx-auto mb-2">
                <svg
                  className="w-10 h-10 transform -rotate-90"
                  viewBox="0 0 36 36"
                >
                  <path
                    className="text-gray-700"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#8b5cf6]"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={`${Math.min(
                      (stats.callsToday / 1000) * 100,
                      100
                    )}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {stats.callsToday}
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-500">Calls</div>
            </div>
            <div className="text-center">
              <div className="relative w-10 h-10 mx-auto mb-2">
                <svg
                  className="w-10 h-10 transform -rotate-90"
                  viewBox="0 0 36 36"
                >
                  <path
                    className="text-gray-700"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#22c55e]"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={`${Math.min(stats.successRate, 100)}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {Math.round(stats.successRate)}%
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-500">Success</div>
            </div>
            <div className="text-center">
              <div className="relative w-10 h-10 mx-auto mb-2">
                <svg
                  className="w-10 h-10 transform -rotate-90"
                  viewBox="0 0 36 36"
                >
                  <path
                    className="text-gray-700"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#f59e0b]"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={`${Math.min(
                      (stats.avgResponseTime / 5) * 100,
                      100
                    )}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {stats.avgResponseTime.toFixed(1)}s
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-500">Avg Time</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onTestApi(toolId)}
              className="border-2 border-dashed border-[#8b5cf6] hover:border-[#7c3aed] hover:bg-[#8b5cf6]/10 text-white p-3 rounded-full transition-all duration-200 flex items-center justify-center group"
              title="Test API"
            >
              <div className="relative">
                <div className="w-6 h-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <div className="w-0 h-0 border-l-[8px] border-l-white border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-1"></div>
                </div>
                <div className="absolute inset-0 w-6 h-6 bg-white/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </div>
            </button>
            <button
              onClick={onToggleExpand}
              className="text-gray-400 hover:text-white transition-colors p-3 rounded-xl bg-[#2a2a2a] hover:bg-[#3a3a3a] duration-200"
              title={isExpanded ? "Collapse API Tester" : "Expand API Tester"}
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-6 pt-6 border-t border-[#2a2a2a]"
        >
          <ApiTester toolId={toolId} />
        </motion.div>
      )}
    </div>
  );
}

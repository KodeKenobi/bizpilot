"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
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

export function ToolCard({
  toolId,
  stats,
  isExpanded = false,
  onToggleExpand,
  onTestApi,
}: ToolCardProps) {
  const tool = TOOL_CATEGORIES.find((t) => t.id === toolId);

  if (!tool) return null;

  return (
    <>
      <tr
        className={`group border-b border-[#2a2a2a] hover:bg-[#0f0f0f] cursor-pointer transition-all duration-200 ${
          isExpanded ? "bg-[#0f0f0f]" : ""
        }`}
        onClick={onToggleExpand}
      >
        <td className="px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div
                className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                  isExpanded
                    ? "bg-[#8b5cf6] shadow-[0_0_8px_rgba(139,92,246,0.5)]"
                    : "bg-gray-600 group-hover:bg-gray-500"
                }`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white mb-1">
                {tool.name}
              </div>
              <div className="text-xs text-gray-400 leading-relaxed">
                {tool.description}
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-5">
          <div className="text-sm font-medium text-white tabular-nums">
            {stats.callsToday.toLocaleString()}
          </div>
        </td>
        <td className="px-6 py-5">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium text-white tabular-nums">
              {Math.round(stats.successRate)}%
            </div>
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                stats.successRate >= 95
                  ? "bg-green-500"
                  : stats.successRate >= 80
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
            />
          </div>
        </td>
        <td className="px-6 py-5">
          <div className="text-sm font-medium text-gray-300 tabular-nums">
            {stats.avgResponseTime.toFixed(1)}s
          </div>
        </td>
        <td className="px-6 py-5">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTestApi(toolId);
              }}
              className="text-xs font-medium px-4 py-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-md transition-all duration-200 hover:shadow-lg hover:shadow-[#8b5cf6]/20 active:scale-95"
            >
              Test
            </button>
            <div className="w-8 h-8 flex items-center justify-center">
              <ChevronRight
                className={`w-4 h-4 text-gray-400 group-hover:text-gray-300 transition-all duration-200 ${
                  isExpanded ? "rotate-90" : ""
                }`}
              />
            </div>
          </div>
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={5} className="p-0">
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-[#0f0f0f] border-t border-[#2a2a2a]"
            >
              <div className="p-6">
                <ApiTester toolId={toolId} />
              </div>
            </motion.div>
          </td>
        </tr>
      )}
    </>
  );
}

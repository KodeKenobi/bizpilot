"use client";

import React from "react";
import { Activity, CheckCircle, Database, Key, Clock } from "lucide-react";

interface StatsBarProps {
  stats: {
    callsToday: number;
    successRate: number;
    dataProcessed: number; // in GB
    activeKeys: number;
    avgResponseTime: number; // in seconds
  };
}

export function StatsBar({ stats }: StatsBarProps) {
  const statItems = [
    {
      icon: Activity,
      label: "API Calls Today",
      value: stats.callsToday.toLocaleString(),
      color: "text-white",
    },
    {
      icon: CheckCircle,
      label: "Success Rate",
      value: `${stats.successRate}%`,
      color: "text-[#22c55e]",
    },
    {
      icon: Database,
      label: "Data Processed",
      value: `${stats.dataProcessed} GB`,
      color: "text-white",
    },
    {
      icon: Key,
      label: "Active Keys",
      value: stats.activeKeys.toString(),
      color: "text-white",
    },
    {
      icon: Clock,
      label: "Avg Response",
      value: `${stats.avgResponseTime}s`,
      color: "text-white",
    },
  ];

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <div key={index} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#0a0a0a] rounded-lg flex items-center justify-center">
                <IconComponent className="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <div className={`text-lg font-bold ${item.color}`}>
                  {item.value}
                </div>
                <div className="text-xs text-gray-400">{item.label}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

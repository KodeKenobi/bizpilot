"use client";

import React from "react";

interface CircularChartProps {
  value: number;
  maxValue: number;
  label: string;
  color: string;
  size?: "sm" | "md" | "lg";
  showPercentage?: boolean;
  className?: string;
}

export function CircularChart({
  value,
  maxValue,
  label,
  color,
  size = "md",
  showPercentage = true,
  className = "",
}: CircularChartProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const circumference = 2 * Math.PI * 40; // radius = 40
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-20 h-20",
    lg: "w-24 h-24",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className={`flex flex-col items-center space-y-3 ${className}`}>
      <div className={`relative ${sizeClasses[size]} group`}>
        {/* Glow effect */}
        <div
          className="absolute inset-0 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"
          style={{ backgroundColor: color }}
        ></div>

        <svg
          className="transform -rotate-90 w-full h-full drop-shadow-lg"
          viewBox="0 0 100 100"
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            className="text-gray-800"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`transition-all duration-1000 ease-out drop-shadow-sm`}
            style={{ color: color }}
          />
          {/* Inner glow */}
          <circle
            cx="50"
            cy="50"
            r="35"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
            className="opacity-20"
            style={{ color: color }}
          />
        </svg>

        {/* Center text with glow */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={`font-bold text-white drop-shadow-sm ${textSizeClasses[size]}`}
          >
            {showPercentage ? `${Math.round(percentage)}%` : value}
          </span>
        </div>
      </div>

      <div className="text-center space-y-1">
        <div
          className={`font-bold text-white ${textSizeClasses[size]} drop-shadow-sm`}
        >
          {value}
        </div>
        <div className="text-xs text-gray-400 truncate max-w-20 font-medium">
          {label}
        </div>
      </div>
    </div>
  );
}

interface CircularStatsProps {
  stats: {
    callsToday: number;
    successRate: number;
    dataProcessed: number;
    avgResponseTime: number;
    activeKeys: number;
  };
  className?: string;
}

export function CircularStats({ stats, className = "" }: CircularStatsProps) {
  const maxValues = {
    callsToday: 1000,
    successRate: 100,
    dataProcessed: 100,
    avgResponseTime: 5000,
    activeKeys: 10,
  };

  return (
    <div className={`relative ${className}`}>
      {/* Background with subtle pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a]/50 to-[#0a0a0a]/50 rounded-2xl border border-[#2a2a2a]/50 backdrop-blur-sm"></div>

      <div className="relative grid grid-cols-2 md:grid-cols-5 gap-8 p-8">
        <CircularChart
          value={stats.callsToday}
          maxValue={maxValues.callsToday}
          label="Calls Today"
          color="#22c55e"
          size="md"
          showPercentage={false}
        />
        <CircularChart
          value={stats.successRate}
          maxValue={maxValues.successRate}
          label="Success Rate"
          color="#3b82f6"
          size="md"
          showPercentage={true}
        />
        <CircularChart
          value={stats.dataProcessed}
          maxValue={maxValues.dataProcessed}
          label="Data (GB)"
          color="#8b5cf6"
          size="md"
          showPercentage={false}
        />
        <CircularChart
          value={stats.avgResponseTime}
          maxValue={maxValues.avgResponseTime}
          label="Response (ms)"
          color="#f59e0b"
          size="md"
          showPercentage={false}
        />
        <CircularChart
          value={stats.activeKeys}
          maxValue={maxValues.activeKeys}
          label="Active Keys"
          color="#ef4444"
          size="md"
          showPercentage={false}
        />
      </div>
    </div>
  );
}

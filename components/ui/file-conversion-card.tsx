"use client";

import React from "react";

import {
  FileText,
  Play,
  Zap,
  Image,
  QrCode,
  Upload,
  Download,
  Clock,
  Star,
  ExternalLink,
  CheckCircle,
} from "lucide-react";

interface FileConversionCardProps {
  theme?: "modern-dark" | "modern-light" | "classic";
  tool: {
    name: string;
    description: string;
    category: string;
    icon: React.ComponentType<{ className?: string }>;
    inputFormats: string[];
    outputFormats: string[];
    features: string[];
    processingSpeed: "Instant" | "Fast" | "Standard";
    quality: "Lossless" | "High" | "Standard";
    maxFileSize: string;
    popularity: number; // 1-5 stars
    usageCount: number;
    activityData?: number[]; // Activity graph data (0-1 scale)
    isFree: boolean;
    isMobileOptimized: boolean;
  };
  onClick?: () => void;
  className?: string;
}

const FileConversionCard: React.FC<FileConversionCardProps> = ({
  theme = "modern-dark",
  tool,
  onClick,
  className = "",
}) => {
  const getThemeStyles = () => {
    switch (theme) {
      case "modern-dark":
        return {
          card: "bg-background border-gray-700/50",
          text: "text-white",
          textSecondary: "text-gray-400",
          textMuted: "text-gray-500",
          border: "border-gray-700/50",
          hover: "hover:border-gray-600/70",
          accent: "text-cyan-400",
          badge: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
          successBadge: "bg-green-500/20 text-green-400 border-green-500/30",
        };
      case "modern-light":
        return {
          card: "bg-gradient-to-br from-white via-gray-50 to-gray-100 border-gray-200",
          text: "text-gray-900",
          textSecondary: "text-gray-600",
          textMuted: "text-gray-500",
          border: "border-gray-200",
          hover: "hover:border-gray-300",
          accent: "text-blue-600",
          badge: "bg-blue-500/20 text-blue-600 border-blue-500/30",
          successBadge: "bg-green-500/20 text-green-600 border-green-500/30",
        };
      case "classic":
        return {
          card: "bg-white border-gray-200 shadow-lg",
          text: "text-gray-900",
          textSecondary: "text-gray-600",
          textMuted: "text-gray-500",
          border: "border-gray-200",
          hover: "hover:border-gray-300",
          accent: "text-blue-600",
          badge: "bg-blue-500/20 text-blue-600 border-blue-500/30",
          successBadge: "bg-green-500/20 text-green-600 border-green-500/30",
        };
      default:
        return {
          card: "bg-background border-gray-700/50",
          text: "text-white",
          textSecondary: "text-gray-400",
          textMuted: "text-gray-500",
          border: "border-gray-700/50",
          hover: "hover:border-gray-600/70",
          accent: "text-cyan-400",
          badge: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
          successBadge: "bg-green-500/20 text-green-400 border-green-500/30",
        };
    }
  };

  const styles = getThemeStyles();
  const IconComponent = tool.icon;

  const formatUsageCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const getSpeedColor = (speed: string) => {
    switch (speed) {
      case "Instant":
        return "text-green-400";
      case "Fast":
        return "text-yellow-400";
      case "Standard":
        return "text-orange-400";
      default:
        return styles.textSecondary;
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "Lossless":
        return "text-green-400";
      case "High":
        return "text-blue-400";
      case "Standard":
        return "text-orange-400";
      default:
        return styles.textSecondary;
    }
  };

  return (
    <div
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl p-6 ${styles.card}
        border backdrop-blur-sm ${styles.hover} transition-all duration-300
        group cursor-pointer h-full min-h-[550px] flex flex-col ${className}
        hover:-translate-y-1
      `}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-current to-transparent rounded-full transform translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-current to-transparent rounded-full transform -translate-x-12 translate-y-12"></div>
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`font-semibold text-lg truncate ${styles.text}`}>
                {tool.name}
              </h3>
            </div>
            <p className={`text-sm ${styles.textSecondary} truncate`}>
              {tool.category}
            </p>
          </div>
          <ExternalLink className={`w-5 h-5 ${styles.textMuted} group-hover:${styles.accent} transition-colors flex-shrink-0`} />
        </div>

        {/* Description */}
        <p className={`text-sm leading-relaxed mb-4 line-clamp-4 min-h-[5.5rem] ${styles.textSecondary}`}>
          {tool.description}
        </p>

        {/* Activity Graph - Smooth Line Chart */}
        {tool.activityData && tool.activityData.length > 0 && (
          <div className="mb-4">
            <div className="relative h-20 w-full bg-gradient-to-b from-cyan-500/5 to-transparent rounded-lg overflow-hidden">
              <svg 
                className="w-full h-full" 
                viewBox="0 0 300 80" 
                preserveAspectRatio="none"
                style={{ shapeRendering: 'geometricPrecision' }}
              >
                <defs>
                  <linearGradient id={`area-gradient-${tool.name.replace(/\s/g, '-')}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: theme === "modern-dark" ? "#22d3ee" : "#3b82f6", stopOpacity: 0.3 }} />
                    <stop offset="100%" style={{ stopColor: theme === "modern-dark" ? "#22d3ee" : "#3b82f6", stopOpacity: 0 }} />
                  </linearGradient>
                </defs>
                
                {/* Create smooth curve path */}
                {(() => {
                  const data = tool.activityData!;
                  const width = 300;
                  const height = 80;
                  const padding = 10;
                  
                  // Calculate points with proper scaling
                  const points = data.map((value, index) => ({
                    x: (index / (data.length - 1)) * width,
                    y: height - padding - (value * (height - padding * 2))
                  }));
                  
                  // Create smooth path using Catmull-Rom spline
                  const createSmoothPath = (points: Array<{x: number, y: number}>) => {
                    if (points.length < 2) return '';
                    
                    let path = `M ${points[0].x},${points[0].y}`;
                    
                    for (let i = 0; i < points.length - 1; i++) {
                      const p0 = points[Math.max(i - 1, 0)];
                      const p1 = points[i];
                      const p2 = points[i + 1];
                      const p3 = points[Math.min(i + 2, points.length - 1)];
                      
                      // Calculate control points for smooth curve
                      const cp1x = p1.x + (p2.x - p0.x) / 6;
                      const cp1y = p1.y + (p2.y - p0.y) / 6;
                      const cp2x = p2.x - (p3.x - p1.x) / 6;
                      const cp2y = p2.y - (p3.y - p1.y) / 6;
                      
                      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
                    }
                    
                    return path;
                  };
                  
                  const linePath = createSmoothPath(points);
                  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;
                  
                  return (
                    <>
                      {/* Filled area under curve */}
                      <path
                        d={areaPath}
                        fill={`url(#area-gradient-${tool.name.replace(/\s/g, '-')})`}
                        className="transition-opacity duration-300"
                      />
                      {/* Line stroke */}
                      <path
                        d={linePath}
                        fill="none"
                        stroke={theme === "modern-dark" ? "#22d3ee" : "#3b82f6"}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-all duration-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                        style={{ vectorEffect: 'non-scaling-stroke' }}
                      />
                      {/* Dots at data points */}
                      {points.map((point, idx) => (
                        <circle
                          key={idx}
                          cx={point.x}
                          cy={point.y}
                          r="2.5"
                          fill={theme === "modern-dark" ? "#22d3ee" : "#3b82f6"}
                          className="transition-all duration-300 opacity-0 group-hover:opacity-100"
                        />
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>
            <p className={`text-xs mt-2 ${styles.textMuted}`}>
              Usage activity (last 12 months)
            </p>
          </div>
        )}

        {/* File Size & Usage */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className={`text-sm ${styles.textSecondary}`}>Max: {tool.maxFileSize}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className={`text-sm ${styles.textMuted}`}>
              {formatUsageCount(tool.usageCount)} uses
            </span>
          </div>
        </div>

        {/* Features */}
        <div className="mb-4">
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < tool.popularity
                    ? "text-yellow-400 fill-yellow-400"
                    : styles.textMuted
                }`}
              />
            ))}
            <span className={`text-xs ml-2 ${styles.textMuted}`}>
              {tool.popularity}/5 rating
            </span>
          </div>
        </div>

        {/* Format Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {tool.inputFormats.slice(0, 3).map((format) => (
            <span
              key={`input-${format}`}
              className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                theme === "modern-dark"
                  ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                  : "bg-blue-50 border-blue-200 text-blue-700"
              }`}
            >
              {format}
            </span>
          ))}
          {tool.inputFormats.length > 3 && (
            <span className={`text-xs ${styles.textMuted} px-2 py-1`}>
              +{tool.inputFormats.length - 3}
            </span>
          )}
        </div>

        {/* Features List */}
        <div className="flex flex-wrap gap-2">
          {tool.features.slice(0, 3).map((feature) => (
            <span
              key={feature}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                theme === "modern-dark"
                  ? "bg-gray-800/50 border-gray-600/50 text-gray-300 hover:bg-gray-700/50"
                  : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {feature}
            </span>
          ))}
          {tool.features.length > 3 && (
            <span className={`text-xs ${styles.textMuted} px-2 py-1`}>
              +{tool.features.length - 3} more
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export { FileConversionCard };
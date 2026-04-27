"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, GitFork, Eye, AlertCircle, Clock, ExternalLink } from "lucide-react";

interface GitHubRepoCardProps {
  theme?: "modern-dark" | "modern-light" | "classic";
  repo: {
    name: string;
    description: string;
    owner: string;
    ownerAvatar: string;
    stars: number;
    forks: number;
    watchers: number;
    issues: number;
    language: string;
    updatedAt: string;
    topics: string[];
    activityData: number[];
    isPrivate: boolean;
  };
  className?: string;
}

const GitHubRepoCard: React.FC<GitHubRepoCardProps> = ({
  theme = "modern-dark",
  repo,
  className = "",
}) => {
  const getThemeStyles = () => {
    switch (theme) {
      case "modern-dark":
        return {
          card: "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700/50",
          text: "text-white",
          textSecondary: "text-gray-400",
          textMuted: "text-gray-500",
          border: "border-gray-700/50",
          hover: "hover:border-gray-600/70",
          accent: "text-cyan-400",
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
        };
      default:
        return {
          card: "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700/50",
          text: "text-white",
          textSecondary: "text-gray-400",
          textMuted: "text-gray-500",
          border: "border-gray-700/50",
          hover: "hover:border-gray-600/70",
          accent: "text-cyan-400",
        };
    }
  };

  const styles = getThemeStyles();
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day ago";
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className={`
        relative overflow-hidden rounded-2xl p-6 ${styles.card}
        border backdrop-blur-sm ${styles.hover} transition-all duration-300
        group cursor-pointer ${className}
      `}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-current to-transparent rounded-full transform translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-current to-transparent rounded-full transform -translate-x-12 translate-y-12"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <img
              src={repo.ownerAvatar}
              alt={repo.owner}
              className="w-10 h-10 rounded-full border-2 border-current/20 flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`font-semibold text-lg truncate ${styles.text}`}>
                  {repo.name}
                </h3>
                {repo.isPrivate && (
                  <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded-full border border-red-500/30">
                    Private
                  </span>
                )}
              </div>
              <p className={`text-sm ${styles.textSecondary} truncate`}>
                {repo.owner}
              </p>
            </div>
          </div>
          <ExternalLink className={`w-5 h-5 ${styles.textMuted} group-hover:${styles.accent} transition-colors flex-shrink-0`} />
        </div>

        {/* Description */}
        <p className={`text-sm leading-relaxed mb-4 line-clamp-2 ${styles.textSecondary}`}>
          {repo.description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1">
            <Star className={`w-4 h-4 ${styles.textMuted}`} />
            <span className={`text-sm font-medium ${styles.text}`}>
              {formatNumber(repo.stars)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <GitFork className={`w-4 h-4 ${styles.textMuted}`} />
            <span className={`text-sm font-medium ${styles.text}`}>
              {formatNumber(repo.forks)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className={`w-4 h-4 ${styles.textMuted}`} />
            <span className={`text-sm font-medium ${styles.text}`}>
              {formatNumber(repo.watchers)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <AlertCircle className={`w-4 h-4 ${styles.textMuted}`} />
            <span className={`text-sm font-medium ${styles.text}`}>
              {formatNumber(repo.issues)}
            </span>
          </div>
        </div>

        {/* Language & Updated */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-purple-500"></div>
            <span className={`text-sm ${styles.textSecondary}`}>{repo.language}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className={`w-4 h-4 ${styles.textMuted}`} />
            <span className={`text-sm ${styles.textMuted}`}>
              {formatDate(repo.updatedAt)}
            </span>
          </div>
        </div>

        {/* Activity Graph */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${styles.textSecondary}`}>
              Activity (12 months)
            </span>
            <span className={`text-xs ${styles.textMuted}`}>
              {repo.activityData.reduce((a, b) => a + b, 0)} commits
            </span>
          </div>
          <div className="flex gap-1 h-8">
            {repo.activityData.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: activity }}
                transition={{ duration: 0.5, delay: index * 0.02 }}
                className={`flex-1 rounded-sm ${
                  activity > 0.7
                    ? "bg-gradient-to-t from-green-400 to-green-300"
                    : activity > 0.4
                    ? "bg-gradient-to-t from-yellow-400 to-yellow-300"
                    : activity > 0.1
                    ? "bg-gradient-to-t from-orange-400 to-orange-300"
                    : "bg-gradient-to-t from-gray-600 to-gray-500"
                }`}
                style={{
                  transformOrigin: "bottom",
                  opacity: activity > 0 ? 0.8 : 0.3,
                }}
              />
            ))}
          </div>
        </div>

        {/* Topics */}
        <div className="flex flex-wrap gap-2">
          {repo.topics.slice(0, 4).map((topic) => (
            <span
              key={topic}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                theme === "modern-dark"
                  ? "bg-gray-800/50 border-gray-600/50 text-gray-300 hover:bg-gray-700/50"
                  : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {topic}
            </span>
          ))}
          {repo.topics.length > 4 && (
            <span className={`text-xs ${styles.textMuted} px-2 py-1`}>
              +{repo.topics.length - 4} more
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export { GitHubRepoCard };
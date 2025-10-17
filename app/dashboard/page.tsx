"use client";

import React, { useState, useEffect } from "react";
import {
  Key,
  Activity,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock,
  Download,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";

interface DashboardStats {
  totalCalls: number;
  recentCalls: number;
  successCalls: number;
  errorCalls: number;
  successRate: number;
  activeKeys: number;
}

interface RecentActivity {
  id: string;
  endpoint: string;
  status: "success" | "error" | "pending";
  timestamp: string;
  processingTime?: number;
}

interface ApiKey {
  id: number;
  name: string;
  key: string;
  is_active: boolean;
  created_at: string;
  last_used: string;
  rate_limit: number;
}

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();
  const [stats, setStats] = useState<DashboardStats>({
    totalCalls: 0,
    recentCalls: 0,
    successCalls: 0,
    errorCalls: 0,
    successRate: 0,
    activeKeys: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);

  // Authentication guard - only redirect if we're sure user is not logged in
  useEffect(() => {
    if (!userLoading && !user) {
      // Check if there's a token in localStorage before redirecting
      const token = localStorage.getItem("auth_token");
      if (!token) {
        // Only redirect if there's no token at all
        window.location.href = "/auth/login";
        return;
      }
      // If there's a token but user is not loaded yet, wait a bit more
      // This gives time for the user context to load when switching views
      const timeout = setTimeout(() => {
        if (!user) {
          window.location.href = "/auth/login";
        }
      }, 2000); // Wait 2 seconds before redirecting

      return () => clearTimeout(timeout);
    }
  }, [user, userLoading]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      if (!user) {
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("auth_token");
      if (!token) {
        setLoading(false);
        return;
      }

      // Fetch real data from API
      const [statsResponse, activityResponse, keysResponse] = await Promise.all(
        [
          fetch("http://localhost:5000/api/client/stats", {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }),
          fetch("http://localhost:5000/api/client/activity", {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }),
          fetch("http://localhost:5000/api/client/api-keys", {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }),
        ]
      );

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        setRecentActivity(activityData);
      }

      if (keysResponse.ok) {
        const keysData = await keysResponse.json();
        setApiKeys(keysData);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
    }
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    change,
    changeType = "neutral",
    href,
  }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<any>;
    change?: string;
    changeType?: "positive" | "negative" | "neutral";
    href?: string;
  }) => {
    const content = (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 overflow-hidden shadow-lg rounded-lg hover:bg-gray-800/70 transition-all duration-300">
        <div className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Icon className="h-6 w-6 text-purple-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-300 truncate">
                  {title}
                </dt>
                <dd className="text-2xl font-bold text-white">{value}</dd>
              </dl>
            </div>
          </div>
          {change && (
            <div className="mt-2">
              <div
                className={`text-sm ${
                  changeType === "positive"
                    ? "text-green-400"
                    : changeType === "negative"
                    ? "text-red-400"
                    : "text-gray-400"
                }`}
              >
                {change}
              </div>
            </div>
          )}
        </div>
      </div>
    );

    if (href) {
      return (
        <Link href={href} className="block hover:opacity-90 transition-opacity">
          {content}
        </Link>
      );
    }

    return content;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-400";
      case "error":
        return "text-red-400";
      case "pending":
        return "text-yellow-400";
      default:
        return "text-gray-400";
    }
  };

  // Show loading while checking authentication
  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center p-8 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-4">
            You must be logged in to access this page.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">
                My API Dashboard
              </h1>
              <p className="mt-2 text-gray-300">
                Monitor your API usage and manage your keys
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">API Status</p>
                <div className="flex items-center space-x-2 text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total API Calls"
              value={stats.totalCalls.toLocaleString()}
              icon={Activity}
              change="+23% from last month"
              changeType="positive"
              href="/dashboard/usage"
            />
            <StatCard
              title="Success Rate"
              value={`${stats.successRate}%`}
              icon={CheckCircle}
              change="+2.1% from last month"
              changeType="positive"
            />
            <StatCard
              title="Active API Keys"
              value={stats.activeKeys}
              icon={Key}
              href="/dashboard/api-keys"
            />
            <StatCard
              title="Recent Calls (24h)"
              value={stats.recentCalls}
              icon={TrendingUp}
              change="+12% from yesterday"
              changeType="positive"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Recent Activity */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-lg rounded-lg">
              <div className="px-6 py-6">
                <h3 className="text-xl font-semibold text-white mb-6">
                  Recent Activity
                </h3>
                <div className="flow-root">
                  <ul className="-mb-8">
                    {recentActivity.map((activity, activityIdx) => (
                      <li key={activity.id}>
                        <div className="relative pb-8">
                          {activityIdx !== recentActivity.length - 1 ? (
                            <span
                              className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-600"
                              aria-hidden="true"
                            />
                          ) : null}
                          <div className="relative flex space-x-4">
                            <div>
                              <span className="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-gray-800 bg-gray-700">
                                {getStatusIcon(activity.status)}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p
                                  className={`text-sm font-medium ${getStatusColor(
                                    activity.status
                                  )}`}
                                >
                                  {activity.endpoint}
                                </p>
                                <p className="text-sm text-gray-400">
                                  {activity.processingTime &&
                                    `Processed in ${activity.processingTime}s`}
                                </p>
                              </div>
                              <div className="text-right text-sm whitespace-nowrap text-gray-400">
                                {activity.timestamp}
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* API Keys */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-lg rounded-lg">
              <div className="px-6 py-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">API Keys</h3>
                  <Link
                    href="/dashboard/api-keys"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Key
                  </Link>
                </div>
                <div className="space-y-4">
                  {apiKeys.slice(0, 3).map((key) => (
                    <div
                      key={key.id}
                      className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600 hover:bg-gray-700/70 transition-all duration-200"
                    >
                      <div>
                        <p className="text-sm font-medium text-white">
                          {key.name}
                        </p>
                        <p className="text-xs text-gray-400 font-mono">
                          {key.key.substring(0, 20)}...
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            key.is_active
                              ? "bg-green-900/30 text-green-400 border border-green-500/30"
                              : "bg-red-900/30 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {key.is_active ? "Active" : "Inactive"}
                        </span>
                        <span className="text-xs text-gray-400">
                          {key.rate_limit}/hour
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {apiKeys.length > 3 && (
                  <div className="mt-4">
                    <Link
                      href="/dashboard/api-keys"
                      className="text-sm text-purple-600 hover:text-purple-500"
                    >
                      View all {apiKeys.length} keys →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Usage Analytics */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-lg rounded-lg">
            <div className="px-6 py-6">
              <h3 className="text-xl font-semibold text-white mb-6">
                Usage Analytics
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400 mb-2">
                    1,234
                  </div>
                  <div className="text-sm text-gray-400">Calls Today</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400 mb-2">
                    98.7%
                  </div>
                  <div className="text-sm text-gray-400">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-2">
                    2.3s
                  </div>
                  <div className="text-sm text-gray-400">Avg Response</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400 mb-2">
                    45GB
                  </div>
                  <div className="text-sm text-gray-400">Data Processed</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Start */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-lg rounded-lg">
            <div className="px-6 py-6">
              <h3 className="text-xl font-semibold text-white mb-6">
                Quick Start
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="border border-gray-600 rounded-lg p-6 bg-gray-700/30 hover:bg-gray-700/50 transition-all duration-200">
                  <h4 className="text-lg font-medium text-white mb-3">
                    1. Get API Key
                  </h4>
                  <p className="text-sm text-gray-300 mb-4">
                    Create your first API key to start making requests
                  </p>
                  <Link
                    href="/dashboard/api-keys"
                    className="text-sm text-purple-400 hover:text-purple-300 font-medium"
                  >
                    Create API Key →
                  </Link>
                </div>

                <div className="border border-gray-600 rounded-lg p-6 bg-gray-700/30 hover:bg-gray-700/50 transition-all duration-200">
                  <h4 className="text-lg font-medium text-white mb-3">
                    2. Make Request
                  </h4>
                  <p className="text-sm text-gray-300 mb-4">
                    Use your API key to convert files programmatically
                  </p>
                  <Link
                    href="/api/docs"
                    className="text-sm text-purple-400 hover:text-purple-300 font-medium"
                  >
                    View Documentation →
                  </Link>
                </div>

                <div className="border border-gray-600 rounded-lg p-6 bg-gray-700/30 hover:bg-gray-700/50 transition-all duration-200">
                  <h4 className="text-lg font-medium text-white mb-3">
                    3. Monitor Usage
                  </h4>
                  <p className="text-sm text-gray-300 mb-4">
                    Track your API usage and performance metrics
                  </p>
                  <Link
                    href="/dashboard/usage"
                    className="text-sm text-purple-400 hover:text-purple-300 font-medium"
                  >
                    View Analytics →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

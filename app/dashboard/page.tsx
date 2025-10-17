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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Mock data - in real implementation, fetch from API
      setStats({
        totalCalls: 1234,
        recentCalls: 56,
        successCalls: 1156,
        errorCalls: 78,
        successRate: 93.7,
        activeKeys: 2,
      });

      setRecentActivity([
        {
          id: "1",
          endpoint: "/api/v1/convert/video",
          status: "success",
          timestamp: "2 minutes ago",
          processingTime: 12.5,
        },
        {
          id: "2",
          endpoint: "/api/v1/convert/audio",
          status: "success",
          timestamp: "5 minutes ago",
          processingTime: 3.2,
        },
        {
          id: "3",
          endpoint: "/api/v1/pdf/extract-text",
          status: "error",
          timestamp: "8 minutes ago",
        },
        {
          id: "4",
          endpoint: "/api/v1/convert/image",
          status: "pending",
          timestamp: "12 minutes ago",
        },
      ]);

      setApiKeys([
        {
          id: 1,
          name: "Production Key",
          key: "ak_live_1234567890abcdef...",
          is_active: true,
          created_at: "2024-01-15T10:30:00Z",
          last_used: "2024-01-20T14:22:00Z",
          rate_limit: 1000,
        },
        {
          id: 2,
          name: "Development Key",
          key: "ak_test_abcdef1234567890...",
          is_active: true,
          created_at: "2024-01-10T09:15:00Z",
          last_used: "2024-01-19T16:45:00Z",
          rate_limit: 100,
        },
      ]);

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
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Icon className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {title}
                </dt>
                <dd className="text-lg font-medium text-gray-900">{value}</dd>
              </dl>
            </div>
          </div>
          {change && (
            <div className="mt-1">
              <div
                className={`text-sm ${
                  changeType === "positive"
                    ? "text-green-600"
                    : changeType === "negative"
                    ? "text-red-600"
                    : "text-gray-500"
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
        return "text-green-600";
      case "error":
        return "text-red-600";
      case "pending":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">API Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Monitor your API usage and manage your keys
        </p>
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
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="flow-root">
              <ul className="-mb-8">
                {recentActivity.map((activity, activityIdx) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {activityIdx !== recentActivity.length - 1 ? (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white bg-gray-100">
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
                            <p className="text-sm text-gray-500">
                              {activity.processingTime &&
                                `Processed in ${activity.processingTime}s`}
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
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
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                API Keys
              </h3>
              <Link
                href="/dashboard/api-keys"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <Plus className="h-4 w-4 mr-1" />
                New Key
              </Link>
            </div>
            <div className="space-y-3">
              {apiKeys.slice(0, 3).map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {key.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {key.key.substring(0, 20)}...
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        key.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {key.is_active ? "Active" : "Inactive"}
                    </span>
                    <span className="text-xs text-gray-500">
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

      {/* Quick Start */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Start
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                1. Get API Key
              </h4>
              <p className="text-sm text-gray-500 mb-3">
                Create your first API key to start making requests
              </p>
              <Link
                href="/dashboard/api-keys"
                className="text-sm text-purple-600 hover:text-purple-500"
              >
                Create API Key →
              </Link>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                2. Make Request
              </h4>
              <p className="text-sm text-gray-500 mb-3">
                Use your API key to convert files programmatically
              </p>
              <Link
                href="/api/docs"
                className="text-sm text-purple-600 hover:text-purple-500"
              >
                View Documentation →
              </Link>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                3. Monitor Usage
              </h4>
              <p className="text-sm text-gray-500 mb-3">
                Track your API usage and performance metrics
              </p>
              <Link
                href="/dashboard/usage"
                className="text-sm text-purple-600 hover:text-purple-500"
              >
                View Analytics →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

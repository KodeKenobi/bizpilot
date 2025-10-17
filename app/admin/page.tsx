"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Key,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalApiCalls: number;
  successCalls: number;
  errorCalls: number;
  successRate: number;
  recentCalls: number;
}

interface RecentActivity {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  status: "success" | "error" | "pending";
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalApiCalls: 0,
    successCalls: 0,
    errorCalls: 0,
    successRate: 0,
    recentCalls: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // In a real implementation, you would fetch from your API
      // For now, we'll use mock data
      setStats({
        totalUsers: 1247,
        activeUsers: 892,
        totalApiCalls: 45678,
        successCalls: 43210,
        errorCalls: 2468,
        successRate: 94.6,
        recentCalls: 1234,
      });

      setRecentActivity([
        {
          id: "1",
          user: "john@example.com",
          action: "Video conversion completed",
          timestamp: "2 minutes ago",
          status: "success",
        },
        {
          id: "2",
          user: "jane@example.com",
          action: "API key created",
          timestamp: "5 minutes ago",
          status: "success",
        },
        {
          id: "3",
          user: "bob@example.com",
          action: "Audio conversion failed",
          timestamp: "8 minutes ago",
          status: "error",
        },
        {
          id: "4",
          user: "alice@example.com",
          action: "PDF processing started",
          timestamp: "12 minutes ago",
          status: "pending",
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
  }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<any>;
    change?: string;
    changeType?: "positive" | "negative" | "neutral";
  }) => (
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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your API platform performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
          change="+12% from last month"
          changeType="positive"
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers.toLocaleString()}
          icon={Activity}
          change="+8% from last month"
          changeType="positive"
        />
        <StatCard
          title="API Calls"
          value={stats.totalApiCalls.toLocaleString()}
          icon={TrendingUp}
          change="+23% from last month"
          changeType="positive"
        />
        <StatCard
          title="Success Rate"
          value={`${stats.successRate}%`}
          icon={CheckCircle}
          change="+2.1% from last month"
          changeType="positive"
        />
      </div>

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
                        <span
                          className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                            activity.status === "success"
                              ? "bg-green-500"
                              : activity.status === "error"
                              ? "bg-red-500"
                              : "bg-yellow-500"
                          }`}
                        >
                          {activity.status === "success" ? (
                            <CheckCircle className="h-5 w-5 text-white" />
                          ) : activity.status === "error" ? (
                            <AlertCircle className="h-5 w-5 text-white" />
                          ) : (
                            <Clock className="h-5 w-5 text-white" />
                          )}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            <span className="font-medium text-gray-900">
                              {activity.user}
                            </span>{" "}
                            {activity.action}
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

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-purple-500 rounded-lg border border-gray-300 hover:border-gray-400">
              <div>
                <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-700 ring-4 ring-white">
                  <Users className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Manage Users
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  View and manage user accounts
                </p>
              </div>
            </button>

            <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-purple-500 rounded-lg border border-gray-300 hover:border-gray-400">
              <div>
                <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-700 ring-4 ring-white">
                  <Key className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  API Keys
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Manage API keys and access
                </p>
              </div>
            </button>

            <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-purple-500 rounded-lg border border-gray-300 hover:border-gray-400">
              <div>
                <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-700 ring-4 ring-white">
                  <Activity className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Analytics
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  View detailed usage analytics
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

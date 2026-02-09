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
  Server,
  Database,
  Shield,
  BarChart3,
  Settings,
  Eye,
  Ban,
  UserCheck,
  Zap,
  Send,
} from "lucide-react";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";
import { getApiUrl, getAuthHeaders } from "../../lib/config";

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalApiCalls: number;
  monthlyCalls?: number;
  successRate: number;
  systemUptime: string;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  usersByTier?: Record<string, number>;
}

interface UserActivity {
  id: string;
  email: string;
  action: string;
  timestamp: string;
  status: "success" | "error" | "warning";
  ipAddress: string;
}

interface SystemAlert {
  id: string;
  type: "error" | "warning" | "info";
  message: string;
  timestamp: string;
  resolved: boolean;
}

export default function AdminDashboard() {
  const { user, loading: userLoading } = useUser();
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalApiCalls: 0,
    monthlyCalls: 0,
    successRate: 0,
    systemUptime: "0d 0h 0m",
    memoryUsage: 0,
    cpuUsage: 0,
    diskUsage: 0,
    usersByTier: {},
  });
  const [usersUsage, setUsersUsage] = useState<any[]>([]);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
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

    // Only allow super_admin role to access admin dashboard
    // Role structure: user = regular user, admin = enterprise, super_admin = super admin
    if (user && !userLoading) {
      console.log("Admin page - Access check:", {
        email: user.email,
        role: user.role,
        currentPath: window.location.pathname,
      });

      // Redirect based on role
      if (user.role === "admin") {
        // Regular admin (enterprise users) should go to enterprise dashboard
        console.log("Redirecting admin (enterprise) to /enterprise");
        window.location.href = "/enterprise";
        return;
      } else if (user.role === "user") {
        // Regular users should go to regular dashboard
        console.log("Redirecting user to /dashboard");
        window.location.href = "/dashboard";
        return;
      }
      // super_admin can access this page
      console.log("Access granted to admin dashboard (super_admin)");
    }
  }, [user, userLoading]);

  useEffect(() => {
    if (user) {
      fetchAdminData();
    }
  }, [user]);

  const fetchAdminData = async () => {
    try {
      if (!user || user.role !== "super_admin") {
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("auth_token");
      if (!token) {
        setLoading(false);
        return;
      }

      // Fetch real data from admin API with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      try {
        const [statsResponse, activityResponse, alertsResponse, usageResponse] =
          await Promise.all([
            fetch(getApiUrl("/api/admin/stats"), {
              headers: getAuthHeaders(token),
              signal: controller.signal,
            }),
            fetch(getApiUrl("/api/admin/activity"), {
              headers: getAuthHeaders(token),
              signal: controller.signal,
            }),
            fetch(getApiUrl("/api/admin/alerts"), {
              headers: getAuthHeaders(token),
              signal: controller.signal,
            }),
            fetch(getApiUrl("/api/admin/usage/stats"), {
              headers: getAuthHeaders(token),
              signal: controller.signal,
            }),
          ]);

        clearTimeout(timeoutId);

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }

        if (usageResponse.ok) {
          const usageData = await usageResponse.json();
          if (usageData.summary) {
            setStats((prev) => ({
              ...prev,
              monthlyCalls: usageData.summary.monthly_calls || 0,
              usersByTier: usageData.summary.users_by_tier || {},
            }));
          }
          if (usageData.users_usage) {
            setUsersUsage(usageData.users_usage);
          }
        }

        if (activityResponse.ok) {
          const activityData = await activityResponse.json();
          setUserActivity(activityData);
        }

        if (alertsResponse.ok) {
          const alertsData = await alertsResponse.json();
          setSystemAlerts(alertsData);
        }
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === "AbortError") {
        } else {
        }
        // Continue anyway - show dashboard with empty/default data
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    change,
    changeType = "neutral",
    color = "purple",
    href,
  }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<any>;
    change?: string;
    changeType?: "positive" | "negative" | "neutral";
    color?: "purple" | "blue" | "green" | "red" | "yellow";
    href?: string;
  }) => {
    const colorClasses = {
      purple: "from-purple-500 to-pink-500",
      blue: "from-blue-500 to-cyan-500",
      green: "from-green-500 to-emerald-500",
      red: "from-red-500 to-pink-500",
      yellow: "from-yellow-500 to-orange-500",
    };

    const content = (
      <div className="bg-card/50 dark:bg-gray-800/50 backdrop-blur-sm border border-border dark:border-gray-700 overflow-hidden shadow-lg rounded-xl hover:bg-card/70 dark:hover:bg-gray-800/70 transition-all duration-300 group">
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-center text-center md:text-left md:justify-between">
            <div className="flex-1 mb-4 md:mb-0">
              <p className="text-sm font-medium text-muted-foreground dark:text-gray-300 mb-2">
                {title}
              </p>
              <p className="text-3xl font-bold text-foreground dark:text-white">
                {value}
              </p>
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
            <div
              className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses[color]} opacity-80 group-hover:opacity-100 transition-opacity mx-auto md:mx-0`}
            >
              <Icon className="h-6 w-6 text-foreground dark:text-white" />
            </div>
          </div>
        </div>
      </div>
    );

    if (href) {
      return (
        <Link
          href={href}
          className="block hover:scale-105 transition-transform"
        >
          {content}
        </Link>
      );
    }

    return content;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-400" />;
      case "info":
        return <CheckCircle className="h-5 w-5 text-blue-400" />;
      default:
        return <Activity className="h-5 w-5 text-gray-400" />;
    }
  };

  // Show loading while checking authentication (with timeout to prevent infinite loading)
  useEffect(() => {
    // Safety timeout: if loading takes more than 10 seconds, stop loading
    if (loading) {
      const timeout = setTimeout(() => {
        setLoading(false);
      }, 10000);
      return () => clearTimeout(timeout);
    }
  }, [loading]);

  // Show loading while checking authentication
  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-foreground dark:text-gray-300">
            Loading admin dashboard...
          </p>
          <p className="text-sm text-muted-foreground dark:text-gray-500 mt-2">
            If this takes too long, try refreshing the page
          </p>
        </div>
      </div>
    );
  }

  // Show access denied if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center p-8 bg-card/50 dark:bg-gray-800/50 backdrop-blur-sm border border-border dark:border-gray-700 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-foreground dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-muted-foreground dark:text-gray-400 mb-4">
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

  // Show access denied if not super_admin
  if (user.role !== "super_admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center p-8 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg shadow-lg">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-4">
            You do not have the necessary permissions to view this page.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Login as Admin
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 page-content">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Admin Dashboard
              </h1>
              <p className="text-gray-300 text-lg">
                System overview and management
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-white">System Online</span>
              </div>
            </div>
          </div>

          {/* System Stats Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Users"
              value={stats.totalUsers.toLocaleString()}
              icon={Users}
              change="+12% this month"
              changeType="positive"
              color="blue"
              href="/admin/users"
            />
            <StatCard
              title="Active Users"
              value={stats.activeUsers.toLocaleString()}
              icon={UserCheck}
              change="+8% this week"
              changeType="positive"
              color="green"
            />
            <StatCard
              title="API Calls (24h)"
              value={stats.totalApiCalls.toLocaleString()}
              icon={Zap}
              change="+23% from yesterday"
              changeType="positive"
              color="purple"
            />
            <StatCard
              title="Monthly API Calls"
              value={stats.monthlyCalls?.toLocaleString() || "0"}
              icon={Activity}
              change="Current month"
              changeType="neutral"
              color="blue"
            />
          </div>


          {/* System Health */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <StatCard
              title="System Uptime"
              value={stats.systemUptime}
              icon={Server}
              color="blue"
            />
            <StatCard
              title="Memory Usage"
              value={`${stats.memoryUsage}%`}
              icon={Database}
              change={stats.memoryUsage > 80 ? "High usage" : "Normal"}
              changeType={stats.memoryUsage > 80 ? "negative" : "neutral"}
              color={stats.memoryUsage > 80 ? "red" : "yellow"}
            />
            <StatCard
              title="CPU Usage"
              value={`${stats.cpuUsage}%`}
              icon={Activity}
              change={stats.cpuUsage > 70 ? "High load" : "Normal"}
              changeType={stats.cpuUsage > 70 ? "negative" : "neutral"}
              color={stats.cpuUsage > 70 ? "red" : "green"}
            />
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* User Activity */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-lg rounded-xl">
              <div className="px-6 py-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">
                    Recent User Activity
                  </h3>
                  <Link
                    href="/admin/users"
                    className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                  >
                    View All →
                  </Link>
                </div>
                <div className="space-y-4">
                  {userActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600 hover:bg-gray-700/50 transition-all duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {getStatusIcon(activity.status)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {activity.email}
                          </p>
                          <p className="text-xs text-gray-400">
                            {activity.action} • {activity.ipAddress}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">
                          {activity.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* System Alerts */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-lg rounded-xl">
              <div className="px-6 py-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">
                    System Alerts
                  </h3>
                  <Link
                    href="/admin/settings"
                    className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                  >
                    Manage →
                  </Link>
                </div>
                <div className="space-y-4">
                  {systemAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`flex items-start space-x-3 p-4 rounded-lg border ${
                        alert.resolved
                          ? "bg-gray-700/20 border-gray-600"
                          : alert.type === "error"
                          ? "bg-red-900/20 border-red-500/30"
                          : alert.type === "warning"
                          ? "bg-yellow-900/20 border-yellow-500/30"
                          : "bg-blue-900/20 border-blue-500/30"
                      }`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">
                          {alert.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {alert.timestamp}
                          {alert.resolved && (
                            <span className="ml-2 text-green-400">
                              • Resolved
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Tiers Overview */}
          {stats.usersByTier && Object.keys(stats.usersByTier).length > 0 && (
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-lg rounded-xl">
              <div className="px-6 py-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">
                    Users by Subscription Tier
                  </h3>
                  <Link
                    href="/admin/users"
                    className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                  >
                    View All Users →
                  </Link>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {Object.entries(stats.usersByTier).map(([tier, count]) => (
                    <Link
                      key={tier}
                      href={`/admin/users?tier=${tier}`}
                      className="p-4 bg-gray-700/30 rounded-lg border border-gray-600 hover:bg-gray-700/50 transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-300 capitalize">
                          {tier === "free"
                            ? "Free Tier"
                            : tier === "premium"
                            ? "Premium"
                            : tier === "enterprise"
                            ? "Enterprise"
                            : tier === "client"
                            ? "Clients"
                            : tier}
                        </span>
                        <span className="text-2xl font-bold text-white">
                          {count as number}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Users Monthly Usage */}
          {usersUsage.length > 0 && (
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-lg rounded-xl">
              <div className="px-6 py-6">
                <h3 className="text-xl font-semibold text-white mb-6">
                  Users Monthly API Usage
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Tier
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Used
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Limit
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Remaining
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {usersUsage.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-700/30">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                            {user.email}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              {user.subscription_tier}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                            {user.monthly_used}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                            {user.monthly_limit === -1
                              ? "Unlimited"
                              : user.monthly_limit}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                            {user.monthly_limit === -1
                              ? "∞"
                              : user.monthly_remaining}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {user.has_exceeded ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30">
                                Exceeded
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
                                OK
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-lg rounded-xl">
            <div className="px-6 py-6">
              <h3 className="text-xl font-semibold text-white mb-6">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Link href="/admin/users" className="flex items-center space-x-3 p-4 bg-gray-700/30 rounded-lg border border-gray-600 hover:bg-gray-700/50 transition-all duration-200 group">
                  <Users className="h-6 w-6 text-purple-400 group-hover:text-purple-300" />
                  <span className="text-white font-medium">Manage Users</span>
                </Link>
                <Link href="/admin/api-keys" className="flex items-center space-x-3 p-4 bg-gray-700/30 rounded-lg border border-gray-600 hover:bg-gray-700/50 transition-all duration-200 group">
                  <Key className="h-6 w-6 text-blue-400 group-hover:text-blue-300" />
                  <span className="text-white font-medium">API Keys</span>
                </Link>
                <Link href="/admin/analytics" className="flex items-center space-x-3 p-4 bg-gray-700/30 rounded-lg border border-gray-600 hover:bg-gray-700/50 transition-all duration-200 group">
                  <BarChart3 className="h-6 w-6 text-green-400 group-hover:text-green-300" />
                  <span className="text-white font-medium">Analytics</span>
                </Link>
                <Link href="/admin/settings" className="flex items-center space-x-3 p-4 bg-gray-700/30 rounded-lg border border-gray-600 hover:bg-gray-700/50 transition-all duration-200 group">
                  <Settings className="h-6 w-6 text-yellow-400 group-hover:text-yellow-300" />
                  <span className="text-white font-medium">Settings</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
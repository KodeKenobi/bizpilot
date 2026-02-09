"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  XCircle,
  CreditCard,
  Users,
  Filter,
  Check,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { getApiUrl, getAuthHeaders } from "@/lib/config";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success" | "payment" | "subscription";
  category: "system" | "payment" | "subscription" | "user" | "api";
  is_read: boolean;
  read_at: string | null;
  read_by: number | null;
  read_by_email: string | null;
  metadata: any;
  created_at: string;
}

interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  by_type: Record<string, number>;
  by_category: Record<string, number>;
}

export default function NotificationsPage() {
  const { user, loading: userLoading } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [readFilter, setReadFilter] = useState<string>("");

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchStats();
    }
  }, [user, categoryFilter, typeFilter, readFilter]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const params = new URLSearchParams();
      if (categoryFilter) params.append("category", categoryFilter);
      if (typeFilter) params.append("type", typeFilter);
      if (readFilter) params.append("is_read", readFilter);

      const response = await fetch(
        `${getApiUrl("/api/admin/notifications")}?${params.toString()}`,
        {
          headers: getAuthHeaders(token),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
      setLoading(false);
    } catch (error) {
      
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const response = await fetch(
        getApiUrl("/api/admin/notifications/stats"),
        {
          headers: getAuthHeaders(token),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const response = await fetch(
        getApiUrl(`/api/admin/notifications/${notificationId}/read`),
        {
          method: "POST",
          headers: getAuthHeaders(token),
        }
      );

      if (response.ok) {
        setNotifications(
          notifications.map((n) =>
            n.id === notificationId ? { ...n, is_read: true } : n
          )
        );
        fetchStats();
      }
    } catch (error) {
      
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const response = await fetch(
        getApiUrl("/api/admin/notifications/read-all"),
        {
          method: "POST",
          headers: getAuthHeaders(token),
        }
      );

      if (response.ok) {
        setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
        fetchStats();
      }
    } catch (error) {
      
    }
  };

  const deleteNotification = async (notificationId: number) => {
    if (!confirm("Are you sure you want to delete this notification?")) {
      return;
    }

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const response = await fetch(
        getApiUrl(`/api/admin/notifications/${notificationId}`),
        {
          method: "DELETE",
          headers: getAuthHeaders(token),
        }
      );

      if (response.ok) {
        setNotifications(notifications.filter((n) => n.id !== notificationId));
        fetchStats();
      }
    } catch (error) {
      
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-400" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-400" />;
      case "payment":
      case "subscription":
        return <CreditCard className="h-5 w-5 text-blue-400" />;
      default:
        return <Info className="h-5 w-5 text-blue-400" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-900/20 border-green-500/30";
      case "error":
        return "bg-red-900/20 border-red-500/30";
      case "warning":
        return "bg-yellow-900/20 border-yellow-500/30";
      case "payment":
      case "subscription":
        return "bg-blue-900/20 border-blue-500/30";
      default:
        return "bg-gray-700/20 border-gray-600";
    }
  };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center p-8 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400">Admin access required</p>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 page-content">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Notifications
              </h1>
              <p className="text-gray-300 text-lg">
                Manage project-wide notifications
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="inline-flex items-center px-4 py-2 border border-green-500/50 text-green-300 bg-green-500/10 hover:bg-green-500/20 rounded-md text-sm font-medium"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Mark All Read
                </button>
              )}
              <button
                onClick={() => {
                  fetchNotifications();
                  fetchStats();
                }}
                className="inline-flex items-center px-4 py-2 border border-purple-500/50 text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 rounded-md text-sm font-medium"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total</p>
                    <p className="text-2xl font-bold text-white">
                      {stats.total}
                    </p>
                  </div>
                  <Bell className="h-8 w-8 text-gray-400" />
                </div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Unread</p>
                    <p className="text-2xl font-bold text-yellow-400">
                      {stats.unread}
                    </p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-yellow-400" />
                </div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Read</p>
                    <p className="text-2xl font-bold text-green-400">
                      {stats.read}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">By Category</p>
                    <p className="text-sm text-gray-300">
                      {Object.keys(stats.by_category).length} categories
                    </p>
                  </div>
                  <Filter className="h-8 w-8 text-gray-400" />
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-300">Filters:</span>
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm"
              >
                <option value="">All Categories</option>
                <option value="system">System</option>
                <option value="payment">Payment</option>
                <option value="subscription">Subscription</option>
                <option value="user">User</option>
                <option value="api">API</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm"
              >
                <option value="">All Types</option>
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="payment">Payment</option>
                <option value="subscription">Subscription</option>
              </select>
              <select
                value={readFilter}
                onChange={(e) => setReadFilter(e.target.value)}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm"
              >
                <option value="">All</option>
                <option value="false">Unread</option>
                <option value="true">Read</option>
              </select>
            </div>
          </div>

          {/* Notifications List */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Notifications ({notifications.length})
              </h3>
              <div className="space-y-4">
                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">No notifications found</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border ${
                        notification.is_read
                          ? "bg-gray-700/20 border-gray-600"
                          : getNotificationColor(notification.type)
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="text-sm font-semibold text-white">
                                {notification.title}
                              </h4>
                              {!notification.is_read && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                                  New
                                </span>
                              )}
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                                {notification.category}
                              </span>
                            </div>
                            <p className="text-sm text-gray-300 mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-400">
                              <span>
                                {new Date(
                                  notification.created_at
                                ).toLocaleString()}
                              </span>
                              {notification.is_read &&
                                notification.read_by_email && (
                                  <span>
                                    Read by {notification.read_by_email}
                                  </span>
                                )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.is_read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-2 text-green-400 hover:bg-green-500/10 rounded-md transition-colors"
                              title="Mark as read"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

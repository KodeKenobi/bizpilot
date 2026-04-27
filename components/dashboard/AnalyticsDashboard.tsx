"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Users,
  Eye,
  MousePointer,
  Clock,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  TrendingUp,
  Activity,
  FileText,
  Download,
  Search,
  AlertTriangle,
  Zap,
  Timer,
  Percent,
  AlertCircle,
  MapPin,
  X,
  Calendar,
  Link as LinkIcon,
  CreditCard,
  DollarSign,
} from "lucide-react";

interface AnalyticsData {
  totalUsers: number;
  totalSessions: number;
  totalPageViews: number;
  totalEvents: number;
  averageSessionDuration: number;
  topPages: Array<{ page: string; views: number }>;
  topEvents: Array<{ event: string; count: number }>;
  deviceBreakdown: Array<{ device: string; count: number }>;
  browserBreakdown: Array<{ browser: string; count: number }>;
  osBreakdown: Array<{ os: string; count: number }>;
  countryBreakdown: Array<{ country: string; count: number }>;
  cityBreakdown: Array<{ city: string; country: string; count: number }>;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    event_name?: string;
    properties?: Record<string, any>;
    page_url?: string;
    page_title?: string;
    timestamp: number;
  }>;
  errorRate: number;
  conversionRate: number;
  adClicks?: number;
  payments?: number;
  totalRevenue?: number;
  subscriptionPayments?: number;
  oneTimePayments?: number;
}

interface DetailedEvent {
  id: string;
  event_name: string;
  event_type: string;
  page_url: string;
  page_path: string;
  page_title: string;
  properties: Record<string, any>;
  device_type: string;
  browser: string;
  os: string;
  timestamp: string;
  timestamp_ms: number;
  user_id: number | null;
  session_id: string;
}

interface EventsListData {
  events: DetailedEvent[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  event_types: Array<{ name: string; count: number }>;
}

// Helper function to format duration
const formatDuration = (seconds: number | null | undefined): string => {
  if (seconds === null || seconds === undefined || isNaN(seconds)) {
    return 'N/A';
  }
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  if (minutes < 60) {
    return remainingSeconds > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0
    ? `${hours}h ${remainingMinutes}m`
    : `${hours}h`;
};

// Helper function to format numbers with proper labels
const formatNumber = (num: number): string => {
  if (num === 0) return "0";
  if (num < 1000) return num.toString();
  if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
  return `${(num / 1000000).toFixed(1)}M`;
};

// Helper function to format page URLs
const formatPageUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname || "/";
  } catch {
    return url.length > 50 ? url.substring(0, 50) + "..." : url;
  }
};

// Helper function to get relative time ago
const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks !== 1 ? 's' : ''} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
  }
  
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`;
};

interface DetailedMetrics {
  filter_type: string;
  filter_value: string;
  total_sessions: number;
  total_page_views: number;
  total_events: number;
  sessions: Array<{
    session_id: string;
    start_time: string;
    last_activity: string;
    duration: number;
    page_views: number;
    events: number;
    country: string;
    city: string;
    device_type: string;
    browser: string;
    os: string;
    ip_address: string;
    pages_visited: Array<{
      url: string;
      title: string;
      timestamp: string;
      duration: number | null;
    }>;
    events_list: Array<{
      event_name: string;
      event_type: string;
      page_url: string;
      page_title: string;
      timestamp: string;
      properties: Record<string, any>;
    }>;
  }>;
  location_breakdown: Record<string, number>;
  pages_breakdown: Record<string, number>;
  events_breakdown: Record<string, number>;
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("24h");
  const [activeTab, setActiveTab] = useState("overview");

  // Detailed events state
  const [eventsData, setEventsData] = useState<EventsListData | null>(null);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsPage, setEventsPage] = useState(1);
  const [eventTypeFilter, setEventTypeFilter] = useState("");

  // Activity stream state
  const [activityStreamPage, setActivityStreamPage] = useState(1);
  const [activityStreamFilter, setActivityStreamFilter] = useState("");
  const activityStreamPerPage = 20;

  // Detailed metrics modal state
  const [detailedMetrics, setDetailedMetrics] =
    useState<DetailedMetrics | null>(null);
  const [detailedLoading, setDetailedLoading] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  useEffect(() => {
    if (activeTab === "events") {
      fetchDetailedEvents();
    }
  }, [activeTab, timeRange, eventsPage, eventTypeFilter]);

  const fetchDetailedMetrics = async (type: string, value: string) => {
    try {
      setDetailedLoading(true);
      setShowDetailsModal(true);

      const response = await fetch(
        `/api/analytics/details?type=${type}&value=${encodeURIComponent(
          value
        )}&range=${timeRange}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch detailed metrics");
      }

      const metricsData = await response.json();
      setDetailedMetrics(metricsData);
    } catch (error) {
      console.error("Error fetching detailed metrics:", error);
      alert("Failed to load detailed metrics. Please try again.");
    } finally {
      setDetailedLoading(false);
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/analytics/dashboard?range=${timeRange}`
      );

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(`Failed to fetch analytics: ${response.statusText}`);
      }

      const analyticsData = await response.json();

      // Validate data structure
      if (analyticsData && typeof analyticsData === "object") {
        setData(analyticsData);
      } else {
        throw new Error("Invalid analytics data format");
      }
    } catch (error) {
      // Set empty data structure instead of mock data
      setData({
        totalUsers: 0,
        totalSessions: 0,
        totalPageViews: 0,
        totalEvents: 0,
        averageSessionDuration: 0,
        topPages: [],
        topEvents: [],
        deviceBreakdown: [],
        browserBreakdown: [],
        osBreakdown: [],
        countryBreakdown: [],
        cityBreakdown: [],
        recentActivity: [],
        errorRate: 0,
        conversionRate: 0,
        adClicks: 0,
        payments: 0,
        totalRevenue: 0,
        subscriptionPayments: 0,
        oneTimePayments: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDetailedEvents = async () => {
    try {
      setEventsLoading(true);
      const params = new URLSearchParams({
        range: timeRange,
        page: eventsPage.toString(),
        per_page: "50",
      });
      if (eventTypeFilter) {
        params.append("event_type", eventTypeFilter);
      }

      const response = await fetch(
        `/api/analytics/events-list?${params.toString()}`
      );

      if (response.ok) {
        const data = await response.json();
        setEventsData(data);
      }
    } catch (error) {
      console.error("Error fetching detailed events:", error);
    } finally {
      setEventsLoading(false);
    }
  };

  const formatEventTime = (timestamp: string | number): string => {
    const date = new Date(
      typeof timestamp === "number" ? timestamp : timestamp
    );
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "users", label: "Users", icon: Users },
    { id: "pages", label: "Pages", icon: FileText },
    { id: "events", label: "Events", icon: Activity },
    { id: "devices", label: "Devices", icon: Monitor },
    { id: "regions", label: "Regions", icon: MapPin },
    { id: "realtime", label: "Real-time", icon: Eye },
  ];

  const timeRangeLabels: Record<string, string> = {
    "1h": "Last Hour",
    "24h": "Last 24 Hours",
    "7d": "Last 7 Days",
    "30d": "Last 30 Days",
    "90d": "Last 90 Days",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">
          No Data Available
        </h3>
        <p className="text-gray-400">
          Analytics data will appear here once users start interacting with your
          site.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-gray-400 mt-1">
            Monitor your website performance and user behavior
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-purple-500 text-purple-400"
                    : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-1">
                    Total Users
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {data.totalUsers.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Unique visitors in{" "}
                    {timeRangeLabels[timeRange].toLowerCase()}
                  </p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-1">
                    Sessions
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {data.totalSessions.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    User sessions started
                  </p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <Activity className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-1">
                    Page Views
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {data.totalPageViews.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Total pages viewed
                  </p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Eye className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-1">
                    Events
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {data.totalEvents.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    User interactions tracked
                  </p>
                </div>
                <div className="p-3 bg-orange-500/20 rounded-lg">
                  <MousePointer className="w-6 h-6 text-orange-400" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Monetization Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-1">
                    Ad Clicks
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {(data.adClicks || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Total ad clicks</p>
                </div>
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <MousePointer className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-1">
                    Payments
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {(data.payments || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Successful payments
                  </p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <CreditCard className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-1">
                    Total Revenue
                  </p>
                  <p className="text-3xl font-bold text-white">
                    $
                    {(data.totalRevenue || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Revenue from payments
                  </p>
                </div>
                <div className="p-3 bg-emerald-500/20 rounded-lg">
                  <DollarSign className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-1">
                    Payment Breakdown
                  </p>
                  <p className="text-lg font-bold text-white">
                    {data.subscriptionPayments || 0} Subscriptions
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {data.oneTimePayments || 0} One-time
                  </p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 shadow-lg">
              <div className="flex items-center space-x-2 mb-4">
                <Zap className="w-5 h-5 text-yellow-400" />
                <h3 className="text-lg font-semibold text-white">
                  Performance Metrics
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Timer className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-300">
                      Average Session Duration
                    </span>
                  </div>
                  <span className="font-semibold text-white">
                    {formatDuration(data.averageSessionDuration)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-gray-300">
                      Conversion Rate
                    </span>
                  </div>
                  <span className="font-semibold text-green-400">
                    {data.conversionRate.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-gray-300">Error Rate</span>
                  </div>
                  <span className="font-semibold text-red-400">
                    {data.errorRate.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 shadow-lg">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Top Pages</h3>
              </div>
              <div className="space-y-3">
                {data.topPages.length > 0 ? (
                  data.topPages.slice(0, 5).map((page, index) => (
                    <div
                      key={page.page}
                      className="flex justify-between items-center p-2 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors cursor-pointer"
                      onClick={() => fetchDetailedMetrics("page", page.page)}
                    >
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <span className="text-xs text-gray-500 w-6">
                          #{index + 1}
                        </span>
                        <span
                          className="text-sm text-gray-300 truncate"
                          title={page.page}
                        >
                          {formatPageUrl(page.page)}
                        </span>
                      </div>
                      <span className="font-semibold text-white ml-2">
                        {page.views.toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No page views yet
                  </p>
                )}
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 shadow-lg">
              <div className="flex items-center space-x-2 mb-4">
                <Activity className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Top Events</h3>
              </div>
              <div className="space-y-3">
                {data.topEvents.length > 0 ? (
                  data.topEvents.slice(0, 5).map((event, index) => (
                    <div
                      key={event.event}
                      className="flex justify-between items-center p-2 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors cursor-pointer"
                      onClick={() => fetchDetailedMetrics("event", event.event)}
                    >
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <span className="text-xs text-gray-500 w-6">
                          #{index + 1}
                        </span>
                        <span
                          className="text-sm text-gray-300 truncate"
                          title={event.event}
                        >
                          {event.event}
                        </span>
                      </div>
                      <span className="font-semibold text-white ml-2">
                        {event.count.toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No events tracked yet
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="space-y-6">
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 shadow-lg">
            <div className="flex items-center space-x-2 mb-6">
              <Users className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">
                User Analytics
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-700/30 p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-2">Total Unique Users</p>
                <p className="text-2xl font-bold text-white">
                  {data.totalUsers.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Users who visited in{" "}
                  {timeRangeLabels[timeRange].toLowerCase()}
                </p>
              </div>
              <div className="bg-gray-700/30 p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-2">Total Sessions</p>
                <p className="text-2xl font-bold text-white">
                  {data.totalSessions.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Average{" "}
                  {data.totalUsers > 0
                    ? (data.totalSessions / data.totalUsers).toFixed(1)
                    : 0}{" "}
                  sessions per user
                </p>
              </div>
              <div className="bg-gray-700/30 p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-2">
                  Average Session Duration
                </p>
                <p className="text-2xl font-bold text-white">
                  {formatDuration(data.averageSessionDuration)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  How long users stay on average
                </p>
              </div>
              <div className="bg-gray-700/30 p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-2">Pages per Session</p>
                <p className="text-2xl font-bold text-white">
                  {data.totalSessions > 0
                    ? (data.totalPageViews / data.totalSessions).toFixed(1)
                    : 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Average pages viewed per session
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pages Tab */}
      {activeTab === "pages" && (
        <div className="space-y-6">
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 shadow-lg">
            <div className="flex items-center space-x-2 mb-6">
              <FileText className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">
                Page Performance
              </h3>
            </div>
            {data.topPages.length > 0 ? (
              <div className="space-y-3">
                {data.topPages.map((page, index) => {
                  const percentage =
                    data.totalPageViews > 0
                      ? ((page.views / data.totalPageViews) * 100).toFixed(1)
                      : 0;
                  return (
                    <div
                      key={page.page}
                      className="p-4 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors cursor-pointer"
                      onClick={() => fetchDetailedMetrics("page", page.page)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <span className="text-sm font-semibold text-gray-400 w-8">
                            #{index + 1}
                          </span>
                          <span
                            className="text-sm text-gray-300 truncate"
                            title={page.page}
                          >
                            {formatPageUrl(page.page)}
                          </span>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-sm font-semibold text-white">
                            {page.views.toLocaleString()} views
                          </p>
                          <p className="text-xs text-gray-500">
                            {percentage}% of total
                          </p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No page views tracked yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Events Tab */}
      {activeTab === "events" && (
        <div className="space-y-6">
          {/* Event Type Filter and Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <select
                value={eventTypeFilter}
                onChange={(e) => {
                  setEventTypeFilter(e.target.value);
                  setEventsPage(1);
                }}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Event Types</option>
                {eventsData?.event_types.map((type) => (
                  <option key={type.name} value={type.name}>
                    {type.name} ({type.count.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
            <div className="text-sm text-gray-400">
              {eventsData ? (
                <>
                  Showing {eventsData.events.length} of{" "}
                  {eventsData.total.toLocaleString()} events
                </>
              ) : (
                "Loading events..."
              )}
            </div>
          </div>

          {/* Detailed Events Log */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 shadow-lg overflow-hidden">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Event Log</h3>
                <span className="text-xs text-gray-500">
                  ({timeRangeLabels[timeRange]})
                </span>
              </div>
            </div>

            {eventsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              </div>
            ) : eventsData && eventsData.events.length > 0 ? (
              <>
                <div className="divide-y divide-gray-700/50 max-h-[600px] overflow-y-auto">
                  {eventsData.events.map((event) => (
                    <div
                      key={event.id}
                      className="p-4 hover:bg-gray-700/30 transition-colors cursor-pointer"
                      onClick={() =>
                        fetchDetailedMetrics("event", event.event_name)
                      }
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs font-medium rounded">
                              {event.event_name}
                            </span>
                            {event.device_type && (
                              <span className="text-xs text-gray-500">
                                {event.device_type === "mobile"
                                  ? "📱"
                                  : event.device_type === "tablet"
                                  ? "📟"
                                  : "💻"}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-white font-mono">
                              {event.page_path || "/"}
                            </span>
                            {event.page_title && (
                              <span className="text-gray-500 truncate">
                                • {event.page_title}
                              </span>
                            )}
                          </div>
                          {event.properties &&
                            Object.keys(event.properties).length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {Object.entries(event.properties)
                                  .slice(0, 4)
                                  .map(([key, value]) => (
                                    <span
                                      key={key}
                                      className="text-xs bg-gray-700/50 px-2 py-1 rounded text-gray-400"
                                    >
                                      {key}:{" "}
                                      {typeof value === "string"
                                        ? value.substring(0, 30)
                                        : JSON.stringify(value).substring(
                                            0,
                                            30
                                          )}
                                    </span>
                                  ))}
                              </div>
                            )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm text-gray-300">
                            {formatEventTime(event.timestamp)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {eventsData.total_pages > 1 && (
                  <div className="p-4 border-t border-gray-700 flex items-center justify-between">
                    <button
                      onClick={() => setEventsPage(Math.max(1, eventsPage - 1))}
                      disabled={eventsPage === 1}
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-400">
                      Page {eventsPage} of {eventsData.total_pages}
                    </span>
                    <button
                      onClick={() =>
                        setEventsPage(
                          Math.min(eventsData.total_pages, eventsPage + 1)
                        )
                      }
                      disabled={eventsPage === eventsData.total_pages}
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">
                  No events tracked in this time range
                </p>
              </div>
            )}
          </div>

          {/* Event Summary Stats */}
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 shadow-lg">
            <div className="flex items-center space-x-2 mb-4">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">
                Top Events Summary
              </h3>
            </div>
            {data.topEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.topEvents.slice(0, 6).map((event, index) => {
                  const percentage =
                    data.totalEvents > 0
                      ? ((event.count / data.totalEvents) * 100).toFixed(1)
                      : 0;
                  return (
                    <div
                      key={event.event}
                      className="p-3 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors cursor-pointer"
                      onClick={() => fetchDetailedMetrics("event", event.event)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="text-sm text-gray-300 truncate flex-1"
                          title={event.event}
                        >
                          {event.event}
                        </span>
                        <span className="font-semibold text-white ml-2">
                          {event.count.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No events tracked yet
              </p>
            )}
          </div>
        </div>
      )}

      {/* Devices Tab */}
      {activeTab === "devices" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 shadow-lg">
            <div className="flex items-center space-x-2 mb-4">
              <Monitor className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Device Types</h3>
            </div>
            <div className="space-y-3">
              {data.deviceBreakdown.length > 0 ? (
                data.deviceBreakdown.map((device) => {
                  const total = data.deviceBreakdown.reduce(
                    (sum, d) => sum + d.count,
                    0
                  );
                  const percentage =
                    total > 0 ? ((device.count / total) * 100).toFixed(1) : 0;
                  return (
                    <div
                      key={device.device}
                      className="p-3 rounded-lg bg-gray-700/30 cursor-pointer hover:bg-gray-700/50 transition-colors"
                      onClick={() =>
                        fetchDetailedMetrics("device", device.device)
                      }
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {device.device === "desktop" && (
                            <Monitor className="w-4 h-4 text-blue-400" />
                          )}
                          {device.device === "mobile" && (
                            <Smartphone className="w-4 h-4 text-green-400" />
                          )}
                          {device.device === "tablet" && (
                            <Tablet className="w-4 h-4 text-purple-400" />
                          )}
                          <span className="text-sm text-gray-300 capitalize">
                            {device.device || "Unknown"}
                          </span>
                        </div>
                        <span className="font-semibold text-white">
                          {device.count.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            device.device === "desktop"
                              ? "bg-blue-500"
                              : device.device === "mobile"
                              ? "bg-green-500"
                              : "bg-purple-500"
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {percentage}% of traffic
                      </p>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No device data available
                </p>
              )}
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 shadow-lg">
            <div className="flex items-center space-x-2 mb-4">
              <Globe className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold text-white">Browsers</h3>
            </div>
            <div className="space-y-3">
              {data.browserBreakdown.length > 0 ? (
                data.browserBreakdown.map((browser) => {
                  const total = data.browserBreakdown.reduce(
                    (sum, b) => sum + b.count,
                    0
                  );
                  const percentage =
                    total > 0 ? ((browser.count / total) * 100).toFixed(1) : 0;
                  return (
                    <div
                      key={browser.browser}
                      className="p-3 rounded-lg bg-gray-700/30 cursor-pointer hover:bg-gray-700/50 transition-colors"
                      onClick={() =>
                        fetchDetailedMetrics("browser", browser.browser)
                      }
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-300 capitalize">
                          {browser.browser || "Unknown"}
                        </span>
                        <span className="font-semibold text-white">
                          {browser.count.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div
                          className="bg-green-500 h-1.5 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {percentage}% of traffic
                      </p>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No browser data available
                </p>
              )}
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 shadow-lg">
            <div className="flex items-center space-x-2 mb-4">
              <Monitor className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">
                Operating Systems
              </h3>
            </div>
            <div className="space-y-3">
              {data.osBreakdown.length > 0 ? (
                data.osBreakdown.map((os) => {
                  const total = data.osBreakdown.reduce(
                    (sum, o) => sum + o.count,
                    0
                  );
                  const percentage =
                    total > 0 ? ((os.count / total) * 100).toFixed(1) : 0;
                  return (
                    <div
                      key={os.os}
                      className="p-3 rounded-lg bg-gray-700/30 cursor-pointer hover:bg-gray-700/50 transition-colors"
                      onClick={() => fetchDetailedMetrics("os", os.os)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-300 capitalize">
                          {os.os || "Unknown"}
                        </span>
                        <span className="font-semibold text-white">
                          {os.count.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div
                          className="bg-purple-500 h-1.5 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {percentage}% of traffic
                      </p>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No OS data available
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Regions Tab */}
      {activeTab === "regions" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 shadow-lg">
              <div className="flex items-center space-x-2 mb-6">
                <Globe className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">
                  Top Countries
                </h3>
              </div>
              <div className="space-y-3">
                {data.countryBreakdown && data.countryBreakdown.length > 0 ? (
                  data.countryBreakdown.map((country, index) => {
                    const total = data.countryBreakdown.reduce(
                      (sum, c) => sum + c.count,
                      0
                    );
                    const percentage =
                      total > 0
                        ? ((country.count / total) * 100).toFixed(1)
                        : 0;
                    return (
                      <div
                        key={country.country}
                        className="p-3 rounded-lg bg-gray-700/30 cursor-pointer hover:bg-gray-700/50 transition-colors"
                        onClick={() =>
                          fetchDetailedMetrics("country", country.country)
                        }
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 w-6">
                              #{index + 1}
                            </span>
                            <span className="text-sm text-gray-300 capitalize">
                              {country.country || "Unknown"}
                            </span>
                          </div>
                          <span className="font-semibold text-white">
                            {country.count.toLocaleString()} sessions
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1.5">
                          <div
                            className="bg-blue-500 h-1.5 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {percentage}% of total sessions
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <Globe className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">
                      No country data available yet
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Location data will appear once users start visiting your
                      site
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 shadow-lg">
              <div className="flex items-center space-x-2 mb-6">
                <MapPin className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Top Cities</h3>
              </div>
              <div className="space-y-3">
                {data.cityBreakdown && data.cityBreakdown.length > 0 ? (
                  data.cityBreakdown.map((city, index) => {
                    const total = data.cityBreakdown.reduce(
                      (sum, c) => sum + c.count,
                      0
                    );
                    const percentage =
                      total > 0 ? ((city.count / total) * 100).toFixed(1) : 0;
                    return (
                      <div
                        key={`${city.city}-${city.country}`}
                        className="p-3 rounded-lg bg-gray-700/30 cursor-pointer hover:bg-gray-700/50 transition-colors"
                        onClick={() =>
                          fetchDetailedMetrics(
                            "city",
                            `${city.city}, ${city.country}`
                          )
                        }
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            <span className="text-xs text-gray-500 w-6">
                              #{index + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <span className="text-sm text-gray-300 capitalize block truncate">
                                {city.city || "Unknown"}
                              </span>
                              <span className="text-xs text-gray-500">
                                {city.country || "Unknown"}
                              </span>
                            </div>
                          </div>
                          <span className="font-semibold text-white ml-2">
                            {city.count.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1.5">
                          <div
                            className="bg-purple-500 h-1.5 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {percentage}% of total sessions
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <MapPin className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No city data available yet</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Location data will appear once users start visiting your
                      site
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 shadow-lg">
            <div className="flex items-center space-x-2 mb-4">
              <Globe className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold text-white">
                Geographic Summary
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-700/30 p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Countries Tracked</p>
                <p className="text-2xl font-bold text-white">
                  {data.countryBreakdown?.length || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Unique countries with visitors
                </p>
              </div>
              <div className="bg-gray-700/30 p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Cities Tracked</p>
                <p className="text-2xl font-bold text-white">
                  {data.cityBreakdown?.length || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Unique cities with visitors
                </p>
              </div>
              <div className="bg-gray-700/30 p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Total Sessions</p>
                <p className="text-2xl font-bold text-white">
                  {data.totalSessions.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Sessions with location data
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Tab */}
      {activeTab === "realtime" && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-400">
                  Active in {timeRangeLabels[timeRange]}
                </span>
              </div>
              <p className="text-2xl font-bold text-white">
                {data.recentActivity.length}
              </p>
              <p className="text-xs text-gray-500">Recent events</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-400">Page Views</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {data.totalPageViews.toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-400">Events</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {data.totalEvents.toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-white" />
                <span className="text-sm text-gray-400">Sessions</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {data.totalSessions.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Activity Stream */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 shadow-lg overflow-hidden">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-white" />
                <h3 className="text-lg font-semibold text-white">
                  Live Activity Stream
                </h3>
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                  {timeRangeLabels[timeRange]}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {/* Filter dropdown */}
                <select
                  value={activityStreamFilter}
                  onChange={(e) => {
                    setActivityStreamFilter(e.target.value);
                    setActivityStreamPage(1);
                  }}
                  className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">All Events</option>
                  <option value="api_call">API Calls</option>
                  <option value="api_error">API Errors</option>
                  <option value="pageview">Page Views</option>
                  <option value="page_load">Page Loads</option>
                  <option value="click">Clicks</option>
                  <option value="navigation_click">Navigation</option>
                  <option value="user_interaction">User Interactions</option>
                  <option value="session_update">Session Updates</option>
                  <option value="ad_click">Ad Clicks</option>
                  <option value="payment_success">Payments</option>
                </select>
                <button
                  onClick={() => fetchAnalyticsData()}
                  className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  <Clock className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-700/50 max-h-[500px] overflow-y-auto">
              {(() => {
                // Filter activities
                const filteredActivities = activityStreamFilter
                  ? data.recentActivity.filter(
                      (activity) =>
                        activity.event_name
                          ?.toLowerCase()
                          .includes(activityStreamFilter.toLowerCase()) ||
                        activity.event_name === activityStreamFilter
                    )
                  : data.recentActivity;

                // Paginate activities
                const totalPages = Math.ceil(
                  filteredActivities.length / activityStreamPerPage
                );
                const startIndex = (activityStreamPage - 1) * activityStreamPerPage;
                const endIndex = startIndex + activityStreamPerPage;
                const paginatedActivities = filteredActivities.slice(
                  startIndex,
                  endIndex
                );

                return filteredActivities.length > 0 ? (
                  <>
                    {paginatedActivities.map((activity) => {
                      const date = new Date(activity.timestamp);
                      const timeAgo = Math.floor(
                        (Date.now() - date.getTime()) / 1000
                      );
                      let timeLabel = "";
                      if (timeAgo < 60) {
                        timeLabel = `${timeAgo}s ago`;
                      } else if (timeAgo < 3600) {
                        timeLabel = `${Math.floor(timeAgo / 60)}m ago`;
                      } else if (timeAgo < 86400) {
                        timeLabel = `${Math.floor(timeAgo / 3600)}h ago`;
                      } else {
                        timeLabel = `${Math.floor(timeAgo / 86400)}d ago`;
                      }

                      const getEventIcon = () => {
                        const eventName = activity.event_name || "";
                        if (eventName.includes("api_call")) return "🌐";
                        if (eventName.includes("api_error")) return "❌";
                        if (
                          eventName.includes("page_load") ||
                          eventName.includes("pageview")
                        )
                          return "📄";
                        if (
                          eventName.includes("navigation") ||
                          eventName.includes("click")
                        )
                          return "🔗";
                        if (eventName.includes("user_interaction")) return "👆";
                        return "📊";
                      };

                      const getEventColor = () => {
                        const eventName = activity.event_name || "";
                        if (eventName.includes("error")) return "border-l-red-500";
                        if (eventName.includes("api_call"))
                          return "border-l-blue-500";
                        if (
                          eventName.includes("page_load") ||
                          eventName.includes("pageview")
                        )
                          return "border-l-green-500";
                        if (eventName.includes("navigation"))
                          return "border-l-purple-500";
                        return "border-l-gray-500";
                      };

                      // Extract page path from URL
                      let pagePath = "/";
                      if (activity.page_url) {
                        try {
                          const url = new URL(activity.page_url);
                          pagePath = url.pathname;
                        } catch {
                          pagePath = activity.page_url.substring(0, 50);
                        }
                      }

                      return (
                        <div
                          key={activity.id}
                          className={`flex items-start gap-3 p-4 border-l-4 ${getEventColor()} hover:bg-gray-700/30 transition-colors`}
                        >
                          <div className="flex-shrink-0 mt-0.5 text-lg">
                            {getEventIcon()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-white">
                                {activity.event_name || "Event"}
                              </span>
                              <span className="text-xs text-white font-mono">
                                {pagePath}
                              </span>
                            </div>
                            <p className="text-sm text-gray-400 truncate">
                              {activity.description}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm text-gray-300">{timeLabel}</p>
                            <p className="text-xs text-gray-500">
                              {date.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="p-4 border-t border-gray-700 flex items-center justify-between">
                        <div className="text-sm text-gray-400">
                          Showing {startIndex + 1}-
                          {Math.min(endIndex, filteredActivities.length)} of{" "}
                          {filteredActivities.length} events
                          {activityStreamFilter && (
                            <span className="ml-2">
                              (filtered by: {activityStreamFilter})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              setActivityStreamPage((p) => Math.max(1, p - 1))
                            }
                            disabled={activityStreamPage === 1}
                            className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                          >
                            Previous
                          </button>
                          <span className="text-sm text-gray-400">
                            Page {activityStreamPage} of {totalPages}
                          </span>
                          <button
                            onClick={() =>
                              setActivityStreamPage((p) =>
                                Math.min(totalPages, p + 1)
                              )
                            }
                            disabled={activityStreamPage === totalPages}
                            className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Eye className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">
                      {activityStreamFilter
                        ? `No ${activityStreamFilter} events in ${timeRangeLabels[timeRange].toLowerCase()}`
                        : `No activity in ${timeRangeLabels[timeRange].toLowerCase()}`}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {activityStreamFilter
                        ? "Try selecting a different event type"
                        : "Events will appear here as users interact with your site"}
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Detailed Metrics Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {detailedMetrics?.filter_value || "Loading..."} Details
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  {detailedMetrics?.filter_type === "device" && "Device Type"}
                  {detailedMetrics?.filter_type === "browser" && "Browser"}
                  {detailedMetrics?.filter_type === "os" && "Operating System"}
                  {detailedMetrics?.filter_type === "country" && "Country"}
                  {detailedMetrics?.filter_type === "city" && "City"}
                  {detailedMetrics?.filter_type === "page" && "Page"}
                  {detailedMetrics?.filter_type === "event" && "Event"}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setDetailedMetrics(null);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {detailedLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                </div>
              ) : detailedMetrics ? (
                <div className="space-y-6">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-700/30 p-4 rounded-lg">
                      <div className="text-sm text-gray-400">
                        Total Sessions
                      </div>
                      <div className="text-2xl font-bold text-white mt-1">
                        {detailedMetrics.total_sessions.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-gray-700/30 p-4 rounded-lg">
                      <div className="text-sm text-gray-400">
                        Total Page Views
                      </div>
                      <div className="text-2xl font-bold text-white mt-1">
                        {detailedMetrics.total_page_views.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-gray-700/30 p-4 rounded-lg">
                      <div className="text-sm text-gray-400">Total Events</div>
                      <div className="text-2xl font-bold text-white mt-1">
                        {detailedMetrics.total_events.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Location Breakdown */}
                  {Object.keys(detailedMetrics.location_breakdown).length >
                    0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-white" />
                        Locations
                      </h3>
                      <div className="space-y-2">
                        {Object.entries(detailedMetrics.location_breakdown)
                          .sort((a, b) => b[1] - a[1])
                          .map(([location, count]) => (
                            <div
                              key={location}
                              className="flex items-center justify-between p-3 rounded-lg bg-gray-700/30"
                            >
                              <span className="text-gray-300">{location}</span>
                              <span className="font-semibold text-white">
                                {count}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Pages Visited Breakdown */}
                  {Object.keys(detailedMetrics.pages_breakdown).length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <LinkIcon className="w-5 h-5 text-white" />
                        Pages Visited
                      </h3>
                      <div className="space-y-2">
                        {Object.entries(detailedMetrics.pages_breakdown)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 10)
                          .map(([page, count]) => (
                            <div
                              key={page}
                              className="flex items-center justify-between p-3 rounded-lg bg-gray-700/30"
                            >
                              <span className="text-gray-300 text-sm truncate flex-1 mr-4">
                                {page}
                              </span>
                              <span className="font-semibold text-white">
                                {count}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Events Breakdown */}
                  {Object.keys(detailedMetrics.events_breakdown).length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-white" />
                        Events
                      </h3>
                      <div className="space-y-2">
                        {Object.entries(detailedMetrics.events_breakdown)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 10)
                          .map(([event, count]) => (
                            <div
                              key={event}
                              className="flex items-center justify-between p-3 rounded-lg bg-gray-700/30"
                            >
                              <span className="text-gray-300">{event}</span>
                              <span className="font-semibold text-white">
                                {count}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Sessions List */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-white" />
                      Recent Sessions ({detailedMetrics.sessions.length})
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {detailedMetrics.sessions.slice(0, 20).map((session) => (
                        <div
                          key={session.session_id}
                          className="p-4 rounded-lg bg-gray-700/30 border border-gray-600/50"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-400">
                                  {new Date(
                                    session.start_time
                                  ).toLocaleString()}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                <div>
                                  <span className="text-gray-400">
                                    Duration:
                                  </span>
                                  <span className="text-white ml-2">
                                    {formatDuration(session.duration)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Pages:</span>
                                  <span className="text-white ml-2">
                                    {session.page_views}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Events:</span>
                                  <span className="text-white ml-2">
                                    {session.events}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-400">
                                    Location:
                                  </span>
                                  <span className="text-white ml-2">
                                    {session.city}, {session.country}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          {session.pages_visited.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-600/50">
                              <div className="text-xs text-gray-400 mb-2">
                                Pages Visited:
                              </div>
                              <div className="space-y-2">
                                {session.pages_visited
                                  .slice(0, 5)
                                  .map((page, idx) => {
                                    const pageTimestamp = page.timestamp 
                                      ? new Date(page.timestamp) 
                                      : null;
                                    const timeAgo = pageTimestamp 
                                      ? getTimeAgo(pageTimestamp) 
                                      : 'Unknown time';
                                    const pageDuration = page.duration 
                                      ? formatDuration(page.duration) 
                                      : 'N/A';
                                    
                                    return (
                                      <div
                                        key={idx}
                                        className="text-xs bg-gray-800/50 rounded p-2 border border-gray-700/50"
                                      >
                                        <div className="flex items-start gap-2 mb-1">
                                          <LinkIcon className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <span className="text-gray-300 font-medium truncate">
                                                {formatPageUrl(page.url)}
                                              </span>
                                              {page.title && (
                                                <span className="text-gray-500 truncate">
                                                  - {page.title}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-700/30">
                                          <div className="flex items-center gap-1.5">
                                            <Clock className="w-3 h-3 text-gray-500" />
                                            <span className="text-gray-400">Visited:</span>
                                            <span className="text-gray-300" title={pageTimestamp ? pageTimestamp.toLocaleString() : ''}>
                                              {timeAgo}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-1.5">
                                            <Timer className="w-3 h-3 text-gray-500" />
                                            <span className="text-gray-400">Duration:</span>
                                            <span className="text-gray-300">
                                              {pageDuration}
                                            </span>
                                          </div>
                                        </div>
                                        {pageTimestamp && (
                                          <div className="text-[10px] text-gray-500 mt-1">
                                            {pageTimestamp.toLocaleString()}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                {session.pages_visited.length > 5 && (
                                  <div className="text-xs text-gray-500 text-center pt-1">
                                    +{session.pages_visited.length - 5} more pages
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  No detailed metrics available
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

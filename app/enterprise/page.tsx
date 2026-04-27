"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Users,
  Key,
  Activity,
  TrendingUp,
  Server,
  Database,
  BarChart3,
  Settings,
  Zap,
  Shield,
  CheckCircle,
  AlertCircle,
  Send,
  ChevronRight,
  Home,
  LayoutDashboard,
  FileText,
  Book,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
  Menu,
  X,
  Globe,
  Crown,
  CreditCard,
  Code,
  Terminal,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";
import { getApiUrl, getAuthHeaders } from "../../lib/config";
import { CircularStats } from "@/components/dashboard/CircularChart";
import { ActivityTable } from "@/components/dashboard/ActivityTable";
import { ToolCard } from "@/components/dashboard/ToolCard";
import { BillingSection } from "@/components/dashboard/BillingSection";
import { ResetHistoryTable } from "@/components/dashboard/ResetHistoryTable";
import { TOOL_CATEGORIES } from "../../lib/apiEndpoints";

interface EnterpriseStats {
  monthlyCalls: number;
  monthlyLimit: number;
  successRate: number;
  activeKeys: number;
  totalApiCalls: number;
  dataProcessed: number;
  avgResponseTime: number;
}

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: SidebarItem[];
}

const enterpriseSidebarItems: SidebarItem[] = [
  {
    id: "overview",
    label: "Overview",
    icon: <LayoutDashboard className="w-5 h-5" />,
    path: "/enterprise?tab=overview",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: <Activity className="w-5 h-5" />,
    path: "/enterprise?tab=analytics",
  },
  {
    id: "campaigns",
    label: "Campaigns",
    icon: <Send className="w-5 h-5" />,
    path: "/enterprise?tab=campaigns",
  },
  {
    id: "testing",
    label: "API Testing",
    icon: <FileText className="w-5 h-5" />,
    path: "/enterprise?tab=testing",
  },
  {
    id: "team",
    label: "Team",
    icon: <Users className="w-5 h-5" />,
    path: "/enterprise/team",
  },
  {
    id: "api-reference",
    label: "API Reference",
    icon: <Book className="w-5 h-5" />,
    children: [
      {
        id: "introduction",
        label: "Introduction",
        icon: <Zap className="w-4 h-4" />,
        path: "/enterprise?tab=api-reference&section=introduction",
      },
      {
        id: "authentication",
        label: "Authentication",
        icon: <Shield className="w-4 h-4" />,
        path: "/enterprise?tab=api-reference&section=authentication",
      },
      {
        id: "base-url",
        label: "Base URL",
        icon: <Globe className="w-4 h-4" />,
        path: "/enterprise?tab=api-reference&section=base-url",
      },
      {
        id: "errors",
        label: "Errors",
        icon: <AlertCircle className="w-4 h-4" />,
        path: "/enterprise?tab=api-reference&section=errors",
      },
      {
        id: "endpoints",
        label: "API Endpoints",
        icon: <Code className="w-4 h-4" />,
        path: "/enterprise?tab=api-reference&section=endpoints",
      },
      {
        id: "integration",
        label: "Integration Guides",
        icon: <Terminal className="w-4 h-4" />,
        path: "/enterprise?tab=api-reference&section=integration",
      },
    ],
  },
  {
    id: "history",
    label: "History",
    icon: <Clock className="w-5 h-5" />,
    path: "/enterprise?tab=history",
  },
  {
    id: "settings",
    label: "Settings",
    icon: <Settings className="w-5 h-5" />,
    children: [
      {
        id: "api-keys",
        label: "API Keys",
        icon: <Key className="w-4 h-4" />,
        path: "/enterprise?tab=settings&section=keys",
      },
      {
        id: "billing",
        label: "Billing",
        icon: <CreditCard className="w-4 h-4" />,
        path: "/enterprise?tab=settings&section=billing",
      },
    ],
  },
];

function EnterpriseDashboardContent() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [stats, setStats] = useState<EnterpriseStats>({
    monthlyCalls: 0,
    monthlyLimit: -1, // Unlimited for enterprise
    successRate: 0,
    activeKeys: 0,
    totalApiCalls: 0,
    dataProcessed: 0,
    avgResponseTime: 0,
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "overview"
  );
  const [settingsSection, setSettingsSection] = useState(
    searchParams.get("section") || "keys"
  );
  const [apiReferenceSection, setApiReferenceSection] = useState(
    searchParams.get("section") || "introduction"
  );
  const [expandedItems, setExpandedItems] = useState<string[]>([
    "settings",
    "api-reference",
  ]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toolStats, setToolStats] = useState<any[]>([]);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  // Redirect: allow super_admin (role) or enterprise-tier (subscription); else /dashboard
  useEffect(() => {
    if (!userLoading) {
      // If no user at all, redirect to login
      if (!user) {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          router.push("/auth/login");
          return;
        }
        // If there's a token but no user yet, wait a bit more
        return;
      }

      // DEBUG: Log enterprise access check
      console.log("Enterprise page - Access check:", {
        email: user.email,
        role: user.role,
        currentPath: window.location.pathname,
      });

      // Access: super_admin by role; everyone else by subscription tier (enterprise only; client ≠ enterprise)
      const tier = (user.subscription_tier || "").toLowerCase();
      const isEnterpriseTier = tier === "enterprise";
      const canAccessEnterprise =
        user.role === "super_admin" || isEnterpriseTier;

      if (!canAccessEnterprise) {
        console.log("Redirecting non-enterprise to /dashboard");
        router.push("/dashboard");
        return;
      }

      console.log("Access granted to enterprise dashboard");
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    if (user) {
      fetchEnterpriseData();
    }
  }, [user]);

  // Initialize toolStats from TOOL_CATEGORIES
  useEffect(() => {
    const initialToolStats = TOOL_CATEGORIES.map((category) => ({
      toolId: category.id,
      stats: {
        callsToday: 0,
        successRate: 0,
        avgResponseTime: 0,
        dataProcessed: 0,
      },
    }));
    setToolStats(initialToolStats);
  }, []);

  // Update active tab and sections when URL changes
  useEffect(() => {
    const tab = searchParams.get("tab");
    const section = searchParams.get("section");
    if (tab && activeTab !== tab) {
      setActiveTab(tab);
    }
    if (section) {
      if (activeTab === "settings") {
        setSettingsSection(section);
      }
      if (activeTab === "api-reference") {
        setApiReferenceSection(section);
      }
    }
  }, [searchParams, activeTab]);

  const fetchEnterpriseData = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setLoading(false);
        return;
      }

      // Fetch usage stats
      const usageResponse = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL ||
          "https://web-production-737b.up.railway.app"
        }/api/client/usage?days=30`,
        {
          headers: getAuthHeaders(token),
        }
      );

      // Fetch API keys
      const keysResponse = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL ||
          "https://web-production-737b.up.railway.app"
        }/api/client/keys`,
        {
          headers: getAuthHeaders(token),
        }
      );

      if (usageResponse.ok) {
        const usageData = await usageResponse.json();
        if (usageData.summary) {
          setStats({
            monthlyCalls: usageData.summary.recent_calls || 0,
            monthlyLimit: usageData.monthly?.limit || -1,
            successRate: usageData.summary.success_rate || 0,
            activeKeys: apiKeys.length,
            totalApiCalls: usageData.summary.total_calls || 0,
            dataProcessed:
              usageData.recent_logs?.reduce(
                (sum: number, log: any) => sum + (log.file_size || 0),
                0
              ) || 0,
            avgResponseTime:
              usageData.recent_logs?.length > 0
                ? usageData.recent_logs.reduce(
                    (sum: number, log: any) =>
                      sum + (log.processing_time || 0) * 1000,
                    0
                  ) / usageData.recent_logs.length
                : 0,
          });
        }

        if (usageData.recent_logs) {
          setActivities(
            usageData.recent_logs.map((log: any) => ({
              id: log.id?.toString() || `${log.timestamp}-${Math.random()}`,
              timestamp: log.timestamp,
              endpoint: log.endpoint,
              status:
                log.status_code >= 200 && log.status_code < 300
                  ? "success"
                  : "error",
              fileSize: log.file_size || 0,
              responseTime: log.processing_time
                ? Math.round(log.processing_time * 1000)
                : 0,
            }))
          );
        }
      }

      if (keysResponse.ok) {
        const keysData = await keysResponse.json();
        setApiKeys(keysData);
        setStats((prev) => ({ ...prev, activeKeys: keysData.length }));
      }

      setLoading(false);
    } catch (error) {
      
      setLoading(false);
    }
  };

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleItemClick = (item: SidebarItem) => {
    if (item.path) {
      router.push(item.path);
      setActiveTab(item.id);
      setMobileOpen(false);
    } else if (item.children) {
      toggleExpanded(item.id);
    }
  };

  const handleChildClick = (child: SidebarItem, parentId: string) => {
    if (child.path) {
      router.push(child.path);
      setActiveTab(parentId);
      setMobileOpen(false);
    }
  };

  const isActive = (item: SidebarItem) => {
    if (item.id === activeTab) return true;
    if (item.children) {
      return item.children.some((child) => {
        const urlSection = typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("section")
          : null;
        return child.id === activeTab || child.id === urlSection;
      });
    }
    return false;
  };

  const renderSidebarItem = (item: SidebarItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const active = isActive(item);

    return (
      <div key={item.id}>
        <button
          onClick={() => handleItemClick(item)}
          className={`
            w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200
            ${
              active
                ? "bg-[#2a2a2a] text-white"
                : "text-gray-400 hover:text-white hover:bg-[#2a2a2a]/50"
            }
            ${level > 0 ? "pl-8" : ""}
          `}
        >
          <div className="flex items-center gap-3">
            <span className={active ? "text-[#8b5cf6]" : ""}>{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
          </div>
          {hasChildren && (
            <span className="text-gray-500">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRightIcon className="w-4 h-4" />
              )}
            </span>
          )}
        </button>
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map((child) => (
              <button
                key={child.id}
                onClick={() => handleChildClick(child, item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${
                    (() => {
                      const urlSection =
                        typeof window !== "undefined"
                          ? new URLSearchParams(window.location.search).get(
                              "section"
                            )
                          : null;
                      return child.id === urlSection || child.id === activeTab;
                    })()
                      ? "bg-[#2a2a2a] text-white"
                      : "text-gray-400 hover:text-white hover:bg-[#2a2a2a]/50"
                  }
                  pl-8
                `}
              >
                <span
                  className={
                    (() => {
                      const urlSection =
                        typeof window !== "undefined"
                          ? new URLSearchParams(window.location.search).get(
                              "section"
                            )
                          : null;
                      return child.id === urlSection || child.id === activeTab;
                    })()
                      ? "text-[#8b5cf6]"
                      : ""
                  }
                >
                  {child.icon}
                </span>
                <span className="text-sm font-medium">{child.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const sidebarContent = (
    <div className="h-full flex flex-col bg-[#1a1a1a] border-r border-[#2a2a2a]">
      {/* Enterprise Quick Switch */}
      <div className="p-4">
        <div className="mb-4 px-3 py-2 bg-purple-500/10 rounded-md border border-purple-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-4 w-4 text-purple-400" />
            <p className="text-xs font-semibold text-purple-400">
              Quick Switch
            </p>
          </div>
          <div className="space-y-1">
            <Link
              href="/"
              className="flex items-center px-2 py-1.5 text-xs text-gray-300 hover:bg-gray-600 rounded transition-colors"
            >
              <Globe className="h-3 w-3 mr-2" />
              Website
            </Link>
            <Link
              href="/dashboard?bypass=true"
              className="flex items-center px-2 py-1.5 text-xs text-gray-300 hover:bg-gray-600 rounded transition-colors"
            >
              <LayoutDashboard className="h-3 w-3 mr-2" />
              Full Dashboard
            </Link>
            <div className="flex items-center px-2 py-1.5 text-xs text-white bg-gray-800 rounded">
              <Shield className="h-3 w-3 mr-2" />
              Enterprise
            </div>
            {user?.role === "super_admin" && (
              <Link
                href="/admin"
                className="flex items-center px-2 py-1.5 text-xs text-gray-300 hover:bg-gray-600 rounded transition-colors"
              >
                <Crown className="h-3 w-3 mr-2" />
                Admin
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {enterpriseSidebarItems.map((item) => renderSidebarItem(item))}
      </nav>

      {/* User Profile */}
      {user && (
        <div className="p-4 border-t border-[#2a2a2a]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center border border-white">
                <span className="text-white font-semibold text-sm">
                  {user.email?.[0]?.toUpperCase() || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.email || "User"}
                </p>
              <p className="text-xs text-gray-400 truncate">
                {user.email || ""}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

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
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 overflow-hidden shadow-lg rounded-xl hover:bg-gray-800/70 transition-all duration-300 group">
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-center text-center md:text-left md:justify-between">
            <div className="flex-1 mb-4 md:mb-0">
              <p className="text-sm font-medium text-gray-300 mb-2">{title}</p>
              <p className="text-3xl font-bold text-white">{value}</p>
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
              <Icon className="h-6 w-6 text-white" />
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

  // Show loading state while checking authentication
  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading enterprise dashboard...</p>
        </div>
      </div>
    );
  }

  // Only show access denied if we're sure user is not logged in
  // (after loading is complete and there's no user and no token)
  if (!user) {
    const hasToken = typeof window !== "undefined" && localStorage.getItem("auth_token");
    
    // If there's a token, keep loading (user context might still be loading)
    if (hasToken) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
            <p className="text-gray-300">Authenticating...</p>
          </div>
        </div>
      );
    }

    // No token and no user - show access denied
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center p-8 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg shadow-lg">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-4">
            You must be logged in to access this page.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden page-content flex">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#8b5cf6]/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#3b82f6]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`
          lg:hidden fixed left-0 top-0 h-full w-64 z-50 transform transition-transform duration-300
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {sidebarContent}
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] text-white"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Enterprise Quick Switch */}
      {!mobileOpen && (
        <div className="lg:hidden fixed top-4 right-4 z-50 flex items-center gap-1 bg-[#1a1a1a]/90 rounded-lg px-2 py-1 border border-[#2a2a2a] backdrop-blur-sm">
          <Link
            href="/"
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors"
            title="Website"
          >
            <Globe className="h-4 w-4" />
          </Link>
          <Link
            href="/dashboard?bypass=true"
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors"
            title="Full Dashboard"
          >
            <LayoutDashboard className="h-4 w-4" />
          </Link>
          <div
            className="p-1.5 text-white bg-purple-600 rounded"
            title="Enterprise Dashboard"
          >
            <Shield className="h-4 w-4" />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <div className="relative border-b border-border/50 backdrop-blur-sm bg-background/80 dark:bg-[#0a0a0a]/80 z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Enterprise Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#8b5cf6] rounded-full animate-pulse"></span>
                  {user?.email || "User"} • Enterprise Plan
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-green-500/20 rounded-xl border border-border backdrop-blur-sm">
                  <div className="w-3 h-3 bg-[#ffffff] rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-white">
                    Online
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <>
                {/* Quick Overview Cards */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                  {/* Campaigns Card */}
                  <Link
                    href="/campaigns"
                    className="block hover:scale-105 transition-transform"
                  >
                    <div className="relative overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/50 transition-all shadow-lg h-full">
                      {/* Background Image */}
                      <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop')] bg-cover bg-center"></div>
                      {/* Content */}
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <Send className="w-8 h-8 text-purple-400" />
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">Campaigns</h3>
                        <p className="text-sm text-gray-300 mb-4">
                          Automate outreach and contact form submissions
                        </p>
                        <div className="text-2xl font-bold text-purple-300">
                          Unlimited
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Team Management Card */}
                  <Link
                    href="/enterprise/team"
                    className="block hover:scale-105 transition-transform"
                  >
                    <div className="relative overflow-hidden bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6 hover:border-blue-500/50 transition-all shadow-lg h-full">
                      {/* Background Image */}
                      <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop')] bg-cover bg-center"></div>
                      {/* Content */}
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <Users className="w-8 h-8 text-blue-400" />
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">Team</h3>
                        <p className="text-sm text-gray-300 mb-4">
                          Invite and manage your team members
                        </p>
                        <div className="text-sm font-medium text-blue-300">
                          Add unlimited members
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* API Access Card */}
                  <Link
                    href="/enterprise?tab=settings&section=keys"
                    className="block hover:scale-105 transition-transform"
                  >
                    <div className="relative overflow-hidden bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-500/30 rounded-xl p-6 hover:border-green-500/50 transition-all shadow-lg h-full">
                      {/* Background Image */}
                      <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1633265486064-086b219458ec?w=800&auto=format&fit=crop')] bg-cover bg-center"></div>
                      {/* Content */}
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <Key className="w-8 h-8 text-green-400" />
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">API Keys</h3>
                        <p className="text-sm text-gray-300 mb-4">
                          Manage your API keys and access tokens
                        </p>
                        <div className="text-sm font-medium text-green-300">
                          {stats.activeKeys} {stats.activeKeys === 1 ? 'key' : 'keys'} active
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>

                {/* Enterprise Features */}
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-lg rounded-xl">
                  <div className="px-6 py-6">
                    <h3 className="text-xl font-semibold text-white mb-6">
                      Your Enterprise Benefits
                    </h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                        <CheckCircle className="h-6 w-6 text-green-400 mb-2" />
                        <h4 className="text-white font-medium mb-1">
                          Unlimited API Calls
                        </h4>
                        <p className="text-sm text-gray-400">
                          No monthly limits on API usage
                        </p>
                      </div>
                      <div className="p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                        <CheckCircle className="h-6 w-6 text-green-400 mb-2" />
                        <h4 className="text-white font-medium mb-1">
                          Unlimited Campaigns
                        </h4>
                        <p className="text-sm text-gray-400">
                          Run unlimited outreach campaigns
                        </p>
                      </div>
                      <div className="p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                        <CheckCircle className="h-6 w-6 text-green-400 mb-2" />
                        <h4 className="text-white font-medium mb-1">
                          Team Collaboration
                        </h4>
                        <p className="text-sm text-gray-400">
                          Add unlimited team members
                        </p>
                      </div>
                      <div className="p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                        <CheckCircle className="h-6 w-6 text-green-400 mb-2" />
                        <h4 className="text-white font-medium mb-1">
                          Priority Support
                        </h4>
                        <p className="text-sm text-gray-400">
                          Dedicated support channel
                        </p>
                      </div>
                      <div className="p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                        <CheckCircle className="h-6 w-6 text-green-400 mb-2" />
                        <h4 className="text-white font-medium mb-1">
                          All API Endpoints
                        </h4>
                        <p className="text-sm text-gray-400">
                          Access to all available endpoints
                        </p>
                      </div>
                      <div className="p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                        <CheckCircle className="h-6 w-6 text-green-400 mb-2" />
                        <h4 className="text-white font-medium mb-1">
                          99.9% SLA Guarantee
                        </h4>
                        <p className="text-sm text-gray-400">
                          Uptime guarantee for your business
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Campaigns Tab */}
            {activeTab === "campaigns" && (
              <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Campaigns</h2>
                    <p className="text-gray-400 mt-2">
                      Automate contact form submissions across multiple
                      companies
                    </p>
                  </div>
                  <button
                    onClick={() => router.push("/campaigns/upload")}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all rounded-xl shadow-lg hover:shadow-xl"
                  >
                    <Send className="w-5 h-5" />
                    New Campaign
                  </button>
                </div>

                {/* Campaigns List - Import from existing component */}
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-lg rounded-xl p-6">
                  <p className="text-gray-400">Campaign management interface would go here</p>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === "analytics" && (
              <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="relative">
                    <div className="w-6 h-6 bg-white rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 w-6 h-6 bg-white rounded-full blur-sm opacity-50"></div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Analytics Dashboard
                    </h2>
                    <p className="text-gray-400 mt-2">
                      Detailed insights into your API usage, performance metrics, and trends.
                    </p>
                  </div>
                </div>

                {/* Circular Stats */}
                <div className="mb-8">
                  <CircularStats stats={{
                    callsToday: stats.monthlyCalls,
                    successRate: stats.successRate,
                    dataProcessed: stats.dataProcessed,
                    avgResponseTime: stats.avgResponseTime,
                    activeKeys: stats.activeKeys,
                  }} />
                </div>

                {/* Trend Indicators */}
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="relative">
                      <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
                      <div className="absolute inset-0 w-4 h-4 bg-white rounded-full blur-sm opacity-50"></div>
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      Performance Trends
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <div className="text-xs text-green-400 font-medium">
                        +12% from yesterday
                      </div>
                      <div className="text-xs text-gray-500">API Calls</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-green-400 font-medium">
                        +2% from last week
                      </div>
                      <div className="text-xs text-gray-500">Success Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-blue-400 font-medium">
                        +8% from last month
                      </div>
                      <div className="text-xs text-gray-500">Data Processed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-yellow-400 font-medium">
                        -15ms from last week
                      </div>
                      <div className="text-xs text-gray-500">Response Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-red-400 font-medium">
                        +1 new key
                      </div>
                      <div className="text-xs text-gray-500">Active Keys</div>
                    </div>
                  </div>
                </div>

                {/* Activity Table */}
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
                  <div className="px-6 py-4 border-b border-[#2a2a2a]">
                    <h3 className="text-lg font-semibold text-white">
                      Recent Activity
                    </h3>
                  </div>
                  <ActivityTable
                    activities={activities}
                    onDownload={(id) => console.log('Download', id)}
                  />
                </div>
              </div>
            )}

            {/* API Testing Tab */}
            {activeTab === "testing" && (
              <div className="space-y-8">
                {/* Header */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white">
                    API Testing Hub
                  </h2>
                  <p className="text-gray-400 mt-2">
                    Test all available API endpoints with real-time responses and debugging tools.
                  </p>
                </div>

                {/* Circular Stats */}
                <div className="mb-8">
                  <CircularStats
                    stats={{
                      callsToday: toolStats.reduce((sum, tool) => sum + tool.stats.callsToday, 0),
                      successRate:
                        toolStats.length > 0
                          ? Math.round(toolStats.reduce((sum, tool) => sum + tool.stats.successRate, 0) / toolStats.length)
                          : 0,
                      dataProcessed: 0,
                      avgResponseTime:
                        toolStats.length > 0
                          ? Math.round(toolStats.reduce((sum, tool) => sum + tool.stats.avgResponseTime, 0) / toolStats.length)
                          : 0,
                      activeKeys: stats.activeKeys,
                    }}
                  />
                </div>

                {/* Tools Section */}
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#2a2a2a]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h3 className="text-sm font-medium text-white">API Tools</h3>
                        <span className="text-xs text-gray-500">
                          {TOOL_CATEGORIES.length} available
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 text-left">
                            <div className="text-xs font-medium text-gray-500">Tool</div>
                          </th>
                          <th className="px-6 py-3 text-left">
                            <div className="text-xs font-medium text-gray-500">Calls</div>
                          </th>
                          <th className="px-6 py-3 text-left">
                            <div className="text-xs font-medium text-gray-500">Success</div>
                          </th>
                          <th className="px-6 py-3 text-left">
                            <div className="text-xs font-medium text-gray-500">Avg Time</div>
                          </th>
                          <th className="px-6 py-3 text-right">
                            <div className="text-xs font-medium text-gray-500">Actions</div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2a2a2a]">
                        {toolStats.map(({ toolId, stats }) => (
                          <ToolCard
                            key={toolId}
                            toolId={toolId}
                            stats={stats}
                            isExpanded={selectedTool === toolId}
                            onToggleExpand={() => setSelectedTool(selectedTool === toolId ? null : toolId)}
                            onTestApi={() => setSelectedTool(toolId)}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* History Tab */}
            {activeTab === "history" && (
              <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="relative">
                    <div className="w-6 h-6 bg-white rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 w-6 h-6 bg-white rounded-full blur-sm opacity-50"></div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Reset History
                    </h2>
                    <p className="text-gray-400 mt-2">
                      View when your API calls were reset by administrators
                    </p>
                  </div>
                </div>

                {/* Reset History Table */}
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
                  <div className="px-6 py-4 border-b border-[#2a2a2a]">
                    <h3 className="text-lg font-semibold text-white">
                      API Call Resets
                    </h3>
                  </div>
                  <ResetHistoryTable userId={user?.id} />
                </div>
              </div>
            )}

            {/* API Reference Tab */}
            {activeTab === "api-reference" && (
              <div className="space-y-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white">
                    API Reference
                  </h2>
                  <p className="text-gray-400 mt-2">
                    Complete documentation for the Trevnoctilla API. Build
                    powerful file conversion and processing features into your
                    applications.
                  </p>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-lg rounded-xl p-6">
                  <p className="text-gray-400">API Reference content would go here</p>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="space-y-8">
                {settingsSection === "keys" ? (
                  <>
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                      <div className="relative">
                        <div className="w-6 h-6 bg-white rounded-full animate-pulse"></div>
                        <div className="absolute inset-0 w-6 h-6 bg-white rounded-full blur-sm opacity-50"></div>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">
                          API Keys
                        </h2>
                        <p className="text-gray-400 mt-2">
                          Manage your API authentication keys
                        </p>
                      </div>
                    </div>

                    {/* API Keys Management */}
                    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
                      <p className="text-gray-400">API Keys management interface would go here</p>
                    </div>
                  </>
                ) : (
                  <BillingSection user={user} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EnterpriseDashboard() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading enterprise dashboard...</p>
          </div>
        </div>
      }
    >
      <EnterpriseDashboardContent />
    </Suspense>
  );
}

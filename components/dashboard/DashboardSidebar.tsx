"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  LayoutDashboard,
  Settings,
  CreditCard,
  Key,
  Activity,
  FileText,
  Book,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Zap,
  Globe,
  AlertCircle,
  Code,
  Terminal,
  Shield,
  Send,
  Crown,
} from "lucide-react";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: SidebarItem[];
}

interface DashboardSidebarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  user?: {
    email?: string;
    name?: string;
    role?: string;
    subscription_tier?: string;
    monthly_call_limit?: number;
  };
}

const sidebarItems: SidebarItem[] = [
  {
    id: "overview",
    label: "Overview",
    icon: <LayoutDashboard className="w-5 h-5" />,
    path: "/dashboard?tab=overview",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: <Activity className="w-5 h-5" />,
    path: "/dashboard?tab=analytics",
  },
  {
    id: "campaigns",
    label: "Campaigns",
    icon: <Send className="w-5 h-5" />,
    path: "/dashboard?tab=campaigns",
  },
  {
    id: "testing",
    label: "API Testing",
    icon: <FileText className="w-5 h-5" />,
    path: "/dashboard?tab=testing",
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
        path: "/dashboard?tab=api-reference&section=introduction",
      },
      {
        id: "authentication",
        label: "Authentication",
        icon: <Shield className="w-4 h-4" />,
        path: "/dashboard?tab=api-reference&section=authentication",
      },
      {
        id: "base-url",
        label: "Base URL",
        icon: <Globe className="w-4 h-4" />,
        path: "/dashboard?tab=api-reference&section=base-url",
      },
      {
        id: "errors",
        label: "Errors",
        icon: <AlertCircle className="w-4 h-4" />,
        path: "/dashboard?tab=api-reference&section=errors",
      },
      {
        id: "endpoints",
        label: "API Endpoints",
        icon: <Code className="w-4 h-4" />,
        path: "/dashboard?tab=api-reference&section=endpoints",
      },
      {
        id: "integration",
        label: "Integration Guides",
        icon: <Terminal className="w-4 h-4" />,
        path: "/dashboard?tab=api-reference&section=integration",
      },
    ],
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
        path: "/dashboard?tab=settings&section=keys",
      },
      {
        id: "billing",
        label: "Billing",
        icon: <CreditCard className="w-4 h-4" />,
        path: "/dashboard?tab=settings&section=billing",
      },
    ],
  },
];

export function DashboardSidebar({
  activeTab,
  onTabChange,
  user,
}: DashboardSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([
    "settings",
    "api-reference",
  ]);
  const [mobileOpen, setMobileOpen] = useState(false);

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
      onTabChange(item.id);
      setMobileOpen(false);
    } else if (item.children) {
      toggleExpanded(item.id);
    }
  };

  const handleChildClick = (child: SidebarItem, parentId: string) => {
    if (child.path) {
      router.push(child.path);
      onTabChange(parentId);
      setMobileOpen(false);
    }
  };

  const isActive = (item: SidebarItem) => {
    if (item.id === activeTab) return true;
    if (item.children) {
      return item.children.some((child) => {
        const urlSection = pathname.includes("section=")
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
                <ChevronRight className="w-4 h-4" />
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

  // Quick Switch: show for super_admin (role) or enterprise-tier only (client ≠ enterprise)
  const tier = (user?.subscription_tier || "").toLowerCase();
  const isEnterpriseTier = tier === "enterprise";
  const isEnterprise = user ? user.role === "super_admin" || isEnterpriseTier : false;

  const sidebarContent = (
    <div className="h-full flex flex-col bg-[#1a1a1a] border-r border-[#2a2a2a]">
      {/* Enterprise Quick Switch */}
      {isEnterprise && (
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
              <div className="flex items-center px-2 py-1.5 text-xs text-white bg-gray-800 rounded">
                <LayoutDashboard className="h-3 w-3 mr-2" />
                Full Dashboard
              </div>
              <Link
                href="/enterprise"
                className="flex items-center px-2 py-1.5 text-xs text-gray-300 hover:bg-gray-600 rounded transition-colors"
              >
                <Shield className="h-3 w-3 mr-2" />
                Enterprise
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {sidebarItems.map((item) => renderSidebarItem(item))}
      </nav>

      {/* User Profile */}
      {user && (
        <div className="p-4 border-t border-[#2a2a2a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center border border-white">
              <span className="text-white font-semibold text-sm">
                {user.name?.[0] || user.email?.[0] || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.name || "User"}
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

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] text-white"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - Mobile */}
      <div
        className={`
          lg:hidden fixed left-0 top-0 h-full w-64 z-50 transform transition-transform duration-300
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {sidebarContent}
      </div>

      {/* Sidebar - Desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-shrink-0">
        {sidebarContent}
      </div>
    </>
  );
}

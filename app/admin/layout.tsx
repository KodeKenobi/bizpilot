"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Users,
  Key,
  BarChart3,
  Settings,
  Home,
  LogOut,
  Menu,
  X,
  Shield,
  Server,
  Send,
  Database,
  Activity,
  Bell,
  Gift,
  TestTube,
  Globe,
  LayoutDashboard,
  Crown,
  Zap,
  Brain,
} from "lucide-react";
import { useState } from "react";
import { useUser } from "@/contexts/UserContext";

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/campaigns", label: "Campaigns", icon: Send },
  { href: "/admin/api-keys", label: "API Keys", icon: Key },
  { href: "/admin/free-tier-keys", label: "Free Tier Keys", icon: Gift },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/automations", label: "Automations", icon: Zap },
  { href: "/admin/brain", label: "Brain", icon: Brain },
  { href: "/admin/backups", label: "Backups", icon: Database },
  { href: "/admin/testing", label: "Testing", icon: TestTube },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isSuperAdmin = user?.role === "super_admin";

  // Only allow super_admin role to access admin pages
  // Role structure: user = regular user, admin = enterprise, super_admin = super admin
  React.useEffect(() => {
    if (user) {
      console.log("Admin layout - Access check:", {
        email: user.email,
        role: user.role,
        currentPath: pathname,
      });

      // Only super_admin can access admin. Everyone else: redirect by subscription tier (enterprise only).
      if (user.role !== "super_admin") {
        const tier = (user.subscription_tier || "").toLowerCase();
        const isEnterpriseTier = tier === "enterprise";
        if (isEnterpriseTier) {
          console.log("Redirecting non–super_admin (enterprise tier) to /enterprise");
          router.push("/enterprise");
        } else {
          console.log("Redirecting non–super_admin to /dashboard");
          router.push("/dashboard");
        }
      }
    }
  }, [user, router, pathname]);

  return (
    <div className="min-h-screen bg-black">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${
          sidebarOpen ? "block" : "hidden"
        }`}
      >
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="relative flex w-64 h-full bg-gray-800">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center justify-between flex-shrink-0 px-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-white" />
                <h1 className="text-xl font-bold text-white">Admin Panel</h1>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {/* Super Admin Navigation Switcher */}
              {isSuperAdmin && (
                <div className="mb-4 px-3 py-2 bg-gray-700/50 rounded-md border border-gray-600">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="h-4 w-4 text-yellow-400" />
                    <p className="text-xs font-semibold text-yellow-400">
                      Quick Switch
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Link
                      href="/"
                      className="flex items-center px-2 py-1.5 text-xs text-gray-300 hover:bg-gray-600 rounded transition-colors"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Globe className="h-3 w-3 mr-2" />
                      Website
                    </Link>
                    <Link
                      href="/dashboard?bypass=true"
                      className="flex items-center px-2 py-1.5 text-xs text-gray-300 hover:bg-gray-600 rounded transition-colors"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <LayoutDashboard className="h-3 w-3 mr-2" />
                      Client Dashboard
                    </Link>
                    <div className="flex items-center px-2 py-1.5 text-xs text-white bg-gray-800 rounded">
                      <Shield className="h-3 w-3 mr-2" />
                      Admin Dashboard
                    </div>
                  </div>
                </div>
              )}
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? "bg-black text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="flex-shrink-0 border-t border-gray-700 p-4">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-black flex items-center justify-center border border-white">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {isSuperAdmin ? "Super Admin" : "Admin"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {isSuperAdmin ? "System Administrator" : "Administrator"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:pt-20">
        <div className="flex-1 flex flex-col min-h-0 bg-gray-800/50 backdrop-blur-sm border-r border-gray-700">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-white" />
                <h1 className="text-xl font-bold text-white">Admin Panel</h1>
              </div>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {/* Super Admin Navigation Switcher */}
              {isSuperAdmin && (
                <div className="mb-4 px-3 py-2 bg-gray-700/50 rounded-md border border-gray-600">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="h-4 w-4 text-yellow-400" />
                    <p className="text-xs font-semibold text-yellow-400">
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
                      Client Dashboard
                    </Link>
                    <div className="flex items-center px-2 py-1.5 text-xs text-white bg-gray-800 rounded">
                      <Shield className="h-3 w-3 mr-2" />
                      Admin Dashboard
                    </div>
                  </div>
                </div>
              )}
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? "bg-black text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 border-t border-gray-700 p-4">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {isSuperAdmin ? "Super Admin" : "Admin"}
                </p>
                <p className="text-xs text-gray-400">
                  {isSuperAdmin ? "System Administrator" : "Administrator"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-gray-800 border-b border-gray-700 lg:hidden">
          <button
            type="button"
            className="px-4 border-r border-gray-700 text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 flex justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex-1 flex items-center">
              <Shield className="h-6 w-6 text-purple-400 mr-2" />
              <h1 className="text-lg font-semibold text-white">Admin Panel</h1>
            </div>
            <div className="ml-4 flex items-center md:ml-6 gap-2">
              {/* Super Admin Quick Switch */}
              {isSuperAdmin && (
                <div className="hidden sm:flex items-center gap-1 bg-gray-700/50 rounded-lg px-2 py-1 border border-gray-600">
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
                    title="Client Dashboard"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                  </Link>
                  <div
                    className="p-1.5 text-white bg-gray-800 rounded"
                    title="Admin Dashboard"
                  >
                    <Shield className="h-4 w-4" />
                  </div>
                </div>
              )}
              <button className="bg-gray-700 p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white">
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

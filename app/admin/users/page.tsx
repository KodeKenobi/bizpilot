"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  MoreVertical,
  Eye,
  Key,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  Activity,
  Shield,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import Link from "next/link";

interface User {
  id: number;
  email: string;
  role: string;
  is_active: boolean;
  subscription_tier?: string;
  monthly_call_limit?: number;
  monthly_used?: number;
  monthly_remaining?: number;
  created_at: string;
  last_login: string;
  api_keys_count: number;
}

interface UserStats {
  total_calls: number;
  recent_calls: number;
  success_calls: number;
  error_calls: number;
  success_rate: number;
  popular_endpoints: Array<{ endpoint: string; count: number }>;
}

interface MonthlyUsage {
  used: number;
  limit: number;
  remaining: number;
  percentage: number;
}

export default function UsersPage() {
  const { user, loading: userLoading, authToken: contextToken } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [tierFilter, setTierFilter] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    per_page: 10,
    page: 1,
  });

  // Dropdown states
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isTierDropdownOpen, setIsTierDropdownOpen] = useState(false);

  // Get tier from URL params if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tier = params.get("tier");
    if (tier) {
      setTierFilter([tier]);
    }
  }, []);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [monthlyUsage, setMonthlyUsage] = useState<MonthlyUsage | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [globalStats, setGlobalStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    usersByTier: {} as Record<string, number>,
  });

  // Authentication guard - only redirect if we're sure user is not logged in
  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.relative')) {
        setIsRoleDropdownOpen(false);
        setIsTierDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!userLoading && !user) {
      // Check if there's a token in context before redirecting
      if (!contextToken) {
        window.location.href = "/auth/login";
        return;
      }
    }
  }, [user, userLoading, contextToken]);

  useEffect(() => {
    let ignore = false;

    if (user && contextToken) {
      fetchUsers(contextToken, ignore);
      fetchGlobalStats(contextToken);
    } else if (user && !contextToken) {
      // Fallback: If we have a user but no token yet, show just the current user while waiting
      setUsers([
        {
          id: user.id || 1,
          email: user.email || "unknown@example.com",
          role: user.role || "user",
          is_active: user.is_active !== false,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
          api_keys_count: 0,
        },
      ]);
      setLoading(false);
    }

    return () => {
      ignore = true;
    };
  }, [user, contextToken, searchTerm, roleFilter, statusFilter, tierFilter, currentPage, perPage]);

  const fetchUsers = async (token: string, ignoreCall: boolean = false) => {
    try {
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      params.append("per_page", perPage.toString());
      if (searchTerm) params.append("search", searchTerm);
      if (roleFilter.length > 0) {
        roleFilter.forEach((role) => params.append("role", role));
      }
      if (statusFilter)
        params.append(
          "is_active",
          statusFilter === "active" ? "true" : "false"
        );
      if (tierFilter.length > 0) {
        tierFilter.forEach((tier) => params.append("subscription_tier", tier));
      }

      // Try admin API
      try {
        // Use relative URL to hit our Next.js API route
        const response = await fetch(
          `/api/admin/users?${params.toString()}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();

          if (ignoreCall) return;

          // Transform the data to match our interface
          const transformedUsers = data.users.map((user: any) => ({
            id: user.id,
            email: user.email,
            role: user.role,
            is_active: user.is_active,
            subscription_tier: user.subscription_tier || "free",
            monthly_call_limit: user.monthly_call_limit || 5,
            monthly_used: user.monthly_used || 0,
            monthly_remaining:
              user.monthly_remaining !== undefined
                ? user.monthly_remaining
                : (user.monthly_call_limit || 5) - (user.monthly_used || 0),
            created_at: user.created_at,
            last_login: user.last_login || user.created_at,
            api_keys_count: user.api_keys?.length || 0,
          }));

          setUsers(transformedUsers);
          if (data.pagination) {
            setPagination(data.pagination);
          }
          setLoading(false);
          return;
        }
      } catch (adminError) {
        console.error("Admin API fetch error:", adminError);
      }

      if (ignoreCall) return;

      // Only fall back to current user if API fetch truly failed
      if (user) {
        setUsers([
          {
            id: user.id || 1,
            email: user.email || "unknown@example.com",
            role: user.role || "user",
            is_active: user.is_active !== false,
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString(),
            api_keys_count: 0,
          },
        ]);
      }
      setLoading(false);
    } catch (error) {
      if (ignoreCall) return;
      setLoading(false);
    }
  };

  const fetchUserStats = async (userId: number) => {
    try {
      // Get the session token from NextAuth
      const session = await fetch("/api/auth/session").then((res) =>
        res.json()
      );

      if (!session?.user) {
        throw new Error("No active session found");
      }

      // Try to get user stats from admin API
      // Use relative URL to hit our Next.js API route
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${contextToken || session.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const userData = await response.json();

        // Transform the stats data to match our interface
        if (userData.stats) {
          setUserStats({
            total_calls: userData.stats.total_calls || 0,
            recent_calls: userData.stats.recent_calls || 0,
            success_calls: userData.stats.success_calls || 0,
            error_calls: userData.stats.error_calls || 0,
            success_rate: userData.stats.success_rate || 0,
            popular_endpoints: userData.stats.popular_endpoints || [],
          });
        } else {
          // If no stats available, show empty stats
          setUserStats({
            total_calls: 0,
            recent_calls: 0,
            success_calls: 0,
            error_calls: 0,
            success_rate: 0,
            popular_endpoints: [],
          });
        }

        // Set monthly usage
        if (userData.monthly_usage) {
          setMonthlyUsage(userData.monthly_usage);
        }
      } else {
        // If admin API fails, try to get basic user info
        // Use relative URL to hide Railway backend URL
        const backendUrl =
          typeof window !== "undefined" &&
          (window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1")
            ? "http://localhost:5000"
            : "";

        const profileResponse = await fetch(`${backendUrl}/auth/profile`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${contextToken || session.accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          // Show basic stats from profile data
          setUserStats({
            total_calls: 0,
            recent_calls: 0,
            success_calls: 0,
            error_calls: 0,
            success_rate: 0,
            popular_endpoints: [],
          });
        } else {
          throw new Error(`Failed to fetch user stats: ${response.status}`);
        }
      }
    } catch (error) {
      // Show empty stats on error
      setUserStats({
        total_calls: 0,
        recent_calls: 0,
        success_calls: 0,
        error_calls: 0,
        success_rate: 0,
        popular_endpoints: [],
      });
    }
  };

  const fetchGlobalStats = async (token: string) => {
    try {
      const response = await fetch("/api/admin/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setGlobalStats({
          totalUsers: data.totalUsers || 0,
          activeUsers: data.activeUsers || 0,
          usersByTier: data.usersByTier || {},
        });
      }
    } catch (error) {
      console.error("Error fetching global stats:", error);
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowUserDetails(true);
    fetchUserStats(user.id);
  };

  const handleToggleUserStatus = async (
    userId: number,
    currentStatus: boolean
  ) => {
    const action = currentStatus ? "deactivate" : "activate";
    const user = users.find((u) => u.id === userId);

    if (
      !confirm(
        `Are you sure you want to ${action} ${user?.email || "this user"}?`
      )
    ) {
      return;
    }

    try {
      if (!contextToken) {
        alert("Not authenticated: No access token found");
        return;
      }

      // Use relative URL to hit our Next.js API route
      const response = await fetch(
        `/api/admin/users/${userId}/toggle-status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${contextToken}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        alert(
          `Failed to ${action} user: ${error.error || response.statusText}`
        );
        return;
      }

      const data = await response.json();

      // Update user in list
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, is_active: !currentStatus } : user
        )
      );

      alert(`User ${action}d successfully`);
    } catch (error) {
      alert(
        `Failed to ${action} user: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleResetCalls = async (userId: number, userEmail: string) => {
    if (
      !confirm(
        `Are you sure you want to reset API calls for ${userEmail}? This will set their usage back to 0.`
      )
    ) {
      return;
    }

    try {
      if (!contextToken) {
        alert("No authentication token found in session");
        return;
      }

      // Use relative URL to hit our Next.js API route
      const response = await fetch(
        `/api/admin/users/${userId}/reset-calls`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${contextToken}`,
          },
          body: JSON.stringify({
            reason: "Reset by admin",
          }),
        }
      );

      if (response.ok) {
        alert(`API calls reset successfully for ${userEmail}`);
        // Refresh user data
        fetchUsers(contextToken);
        if (selectedUser?.id === userId) {
          fetchUserStats(userId);
        }
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || "Failed to reset calls"}`);
      }
    } catch (error) {
      alert("Failed to reset API calls");
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.email
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesRole =
      roleFilter.length === 0 || roleFilter.includes(user.role);
    const matchesStatus =
      !statusFilter ||
      (statusFilter === "active" && user.is_active) ||
      (statusFilter === "inactive" && !user.is_active);
    const matchesTier =
      tierFilter.length === 0 ||
      tierFilter.includes(user.subscription_tier || "free");

    return matchesSearch && matchesRole && matchesStatus && matchesTier;
  });

  const handleRoleToggle = (role: string) => {
    setRoleFilter((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleTierToggle = (tier: string) => {
    setTierFilter((prev) =>
      prev.includes(tier) ? prev.filter((t) => t !== tier) : [...prev, tier]
    );
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    const datePart = d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "Africa/Johannesburg",
    });
    const timePart = d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Africa/Johannesburg",
    });
    return `${datePart}, ${timePart} SAST`;
  };

  // Show loading while checking authentication
  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading users...</p>
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

  // Show access denied if not admin
  if (user.role !== "admin" && user.role !== "super_admin") {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-4xl font-bold text-white mb-2">Users</h1>
              <p className="text-gray-300 text-lg">
                Manage user accounts and their API access
              </p>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800/40 backdrop-blur-md border border-gray-700/50 p-6 rounded-2xl shadow-xl hover:shadow-purple-500/5 transition-all duration-300">
              <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Total Users</p>
              <h2 className="text-5xl font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                {globalStats.totalUsers.toLocaleString()}
              </h2>
            </div>

            <div className="bg-gray-800/40 backdrop-blur-md border border-gray-700/50 p-6 rounded-2xl shadow-xl hover:shadow-green-500/5 transition-all duration-300">
              <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Active Users</p>
              <h2 className="text-5xl font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-green-400">
                {globalStats.activeUsers.toLocaleString()}
              </h2>
            </div>

            <div className="bg-gray-800/40 backdrop-blur-md border border-gray-700/50 p-6 rounded-2xl shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
              <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Pro Users</p>
              <h2 className="text-5xl font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-400">
                {(globalStats.usersByTier.premium || 0) + (globalStats.usersByTier.enterprise || 0)}
              </h2>
            </div>

            <div className="bg-gray-800/40 backdrop-blur-md border border-gray-700/50 p-6 rounded-2xl shadow-xl hover:shadow-orange-500/5 transition-all duration-300">
              <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Free Users</p>
              <h2 className="text-5xl font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-orange-400">
                {globalStats.usersByTier.free || 0}
              </h2>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-lg rounded-xl p-6 relative z-20">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Search */}
              <div>
                <label
                  htmlFor="search"
                  className="block text-sm font-medium text-gray-300"
                >
                  Search
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="search"
                    id="search"
                    className="focus:ring-purple-500 focus:border-purple-500 block w-full pl-10 py-2 text-base bg-gray-700 border-gray-600 text-white rounded-md sm:text-sm"
                    placeholder="Search by email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Role Filter */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Role (Multi-select)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsRoleDropdownOpen(!isRoleDropdownOpen);
                    setIsTierDropdownOpen(false);
                  }}
                  className="flex items-center justify-between w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  <span className="truncate">
                    {roleFilter.length === 0
                      ? "All Roles"
                      : `${roleFilter.length} selected`}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isRoleDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isRoleDropdownOpen && (
                  <div className="absolute z-50 mt-2 w-full bg-black border-2 border-purple-500 rounded-lg shadow-2xl p-4 space-y-3 animate-in fade-in zoom-in duration-200">
                    {["user", "admin", "super_admin"].map((role) => (
                      <label
                        key={role}
                        className="flex items-center gap-4 cursor-pointer group p-2 hover:bg-gray-800 rounded-md transition-colors"
                      >
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            checked={roleFilter.includes(role)}
                            onChange={() => handleRoleToggle(role)}
                            className="peer h-6 w-6 cursor-pointer appearance-none rounded border-2 border-gray-400 bg-gray-900 checked:bg-purple-600 checked:border-purple-400 transition-all"
                          />
                          <Check className="absolute h-4 w-4 text-white opacity-0 peer-checked:opacity-100 left-1 pointer-events-none transition-opacity stroke-[3px]" />
                        </div>
                        <span className="text-base font-extrabold text-white group-hover:text-purple-300">
                          {role === "super_admin" ? "Super Admin" : role.toUpperCase()}
                        </span>
                      </label>
                    ))}
                    {roleFilter.length > 0 && (
                      <div className="pt-2 border-t border-gray-800 flex justify-end">
                        <button
                          onClick={() => setRoleFilter([])}
                          className="text-xs font-black text-purple-400 hover:text-purple-300 uppercase tracking-widest"
                        >
                          Clear all
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Subscription Tier Filter */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Subscription Tier (Multi-select)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsTierDropdownOpen(!isTierDropdownOpen);
                    setIsRoleDropdownOpen(false);
                  }}
                  className="flex items-center justify-between w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  <span className="truncate">
                    {tierFilter.length === 0
                      ? "All Tiers"
                      : `${tierFilter.length} selected`}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isTierDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isTierDropdownOpen && (
                  <div className="absolute z-50 mt-2 w-full bg-black border-2 border-purple-500 rounded-lg shadow-2xl p-4 space-y-3 animate-in fade-in zoom-in duration-200">
                    {["free", "premium", "enterprise", "client"].map((tier) => (
                      <label
                        key={tier}
                        className="flex items-center gap-4 cursor-pointer group p-2 hover:bg-gray-800 rounded-md transition-colors"
                      >
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            checked={tierFilter.includes(tier)}
                            onChange={() => handleTierToggle(tier)}
                            className="peer h-6 w-6 cursor-pointer appearance-none rounded border-2 border-gray-400 bg-gray-900 checked:bg-purple-600 checked:border-purple-400 transition-all"
                          />
                          <Check className="absolute h-4 w-4 text-white opacity-0 peer-checked:opacity-100 left-1 pointer-events-none transition-opacity stroke-[3px]" />
                        </div>
                        <span className="text-base font-extrabold text-white group-hover:text-purple-300 uppercase">
                          {tier}
                        </span>
                      </label>
                    ))}
                    {tierFilter.length > 0 && (
                      <div className="pt-2 border-t border-gray-800 flex justify-end">
                        <button
                          onClick={() => setTierFilter([])}
                          className="text-xs font-black text-purple-400 hover:text-purple-300 uppercase tracking-widest"
                        >
                          Clear all
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-300"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Per Page Selector */}
              <div>
                <label
                  htmlFor="per-page"
                  className="block text-sm font-medium text-gray-300"
                >
                  Users Per Page
                </label>
                <select
                  id="per-page"
                  name="per-page"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(parseInt(e.target.value));
                    setCurrentPage(1); // Reset to first page
                  }}
                >
                  <option value="10">10 per page</option>
                  <option value="20">20 per page</option>
                  <option value="50">50 per page</option>
                  <option value="100">100 per page</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-lg rounded-xl overflow-hidden relative z-10">
            <ul className="divide-y divide-gray-700">
              {filteredUsers.map((user) => (
                <li key={user.id}>
                  <div className="px-4 py-4 flex items-center justify-between hover:bg-gray-700/30 transition-colors">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {user.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-white">
                            {user.email}
                          </p>
                          <span
                            className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.role === "admin" ||
                              user.role === "super_admin"
                                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                : "bg-gray-500/20 text-gray-300 border border-gray-500/30"
                            }`}
                          >
                            {user.role}
                          </span>
                          <span
                            className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.is_active
                                ? "bg-green-500/20 text-green-300 border border-green-500/30"
                                : "bg-red-500/20 text-red-300 border border-red-500/30"
                            }`}
                          >
                            {user.is_active ? "Active" : "Inactive"}
                          </span>
                          {user.subscription_tier && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-blue-500/20 text-blue-300 border border-blue-500/30">
                              {user.subscription_tier}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-400">
                          <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4" />
                          Joined {formatDate(user.created_at)}
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-400">
                          <Key className="flex-shrink-0 mr-1.5 h-4 w-4" />
                          {user.api_keys_count} API key
                          {user.api_keys_count !== 1 ? "s" : ""}
                          {user.monthly_call_limit !== undefined && (
                            <span className="ml-2">
                              •{" "}
                              {user.monthly_call_limit === -1
                                ? "Unlimited"
                                : `${user.monthly_used || 0}/${
                                    user.monthly_call_limit
                                  }`}{" "}
                              calls used
                              {user.monthly_call_limit !== -1 && (
                                <span className="ml-1">
                                  (
                                  {user.monthly_remaining !== undefined
                                    ? user.monthly_remaining
                                    : user.monthly_call_limit -
                                      (user.monthly_used || 0)}{" "}
                                  remaining)
                                </span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-wrap">
                      <button
                        onClick={() => handleViewUser(user)}
                        className="inline-flex items-center px-3 py-2 border border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                      {user.monthly_call_limit !== undefined && (
                        <button
                          onClick={() => handleResetCalls(user.id, user.email)}
                          className="inline-flex items-center px-3 py-2 border border-yellow-500/50 shadow-sm text-sm leading-4 font-medium rounded-md text-yellow-300 bg-yellow-500/10 hover:bg-yellow-500/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                          title="Reset API calls to 0"
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Reset Calls
                        </button>
                      )}
                      <button
                        onClick={() =>
                          handleToggleUserStatus(user.id, user.is_active)
                        }
                        className={`inline-flex items-center px-3 py-2 border shadow-sm text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                          user.is_active
                            ? "border-red-500/50 text-red-300 bg-red-500/10 hover:bg-red-500/20"
                            : "border-green-500/50 text-green-300 bg-green-500/10 hover:bg-green-500/20"
                        }`}
                      >
                        {user.is_active ? (
                          <>
                            <UserX className="h-4 w-4 mr-1" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-4 w-4 mr-1" />
                            Activate
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Pagination Footer */}
            {pagination.pages > 1 && (
              <div className="bg-gray-800/80 px-4 py-3 flex items-center justify-between border-t border-gray-700 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(pagination.pages, currentPage + 1))
                    }
                    disabled={currentPage === pagination.pages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-400">
                      Showing <span className="font-medium text-white">{((currentPage - 1) * perPage) + 1}</span> to{" "}
                      <span className="font-medium text-white">
                        {Math.min(currentPage * perPage, pagination.total)}
                      </span>{" "}
                      of <span className="font-medium text-white">{pagination.total}</span> results
                    </p>
                  </div>
                  <div>
                    <nav
                      className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-600 bg-gray-700 text-sm font-medium text-gray-400 hover:bg-gray-600 disabled:opacity-50 transition-colors"
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                      </button>
                      
                      {[...Array(pagination.pages)].map((_, i) => {
                        const pageNum = i + 1;
                        if (
                          pageNum === 1 ||
                          pageNum === pagination.pages ||
                          (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
                                currentPage === pageNum
                                  ? "z-10 bg-purple-600 border-purple-500 text-white"
                                  : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        } else if (
                          (pageNum === currentPage - 2 && currentPage > 3) ||
                          (pageNum === currentPage + 2 && currentPage < pagination.pages - 2)
                        ) {
                          return (
                            <span
                              key={pageNum}
                              className="relative inline-flex items-center px-4 py-2 border border-gray-600 bg-gray-700 text-sm font-medium text-gray-400"
                            >
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}

                      <button
                        onClick={() =>
                          setCurrentPage(Math.min(pagination.pages, currentPage + 1))
                        }
                        disabled={currentPage === pagination.pages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-600 bg-gray-700 text-sm font-medium text-gray-400 hover:bg-gray-600 disabled:opacity-50 transition-colors"
                      >
                        <span className="sr-only">Next</span>
                        <ChevronRight className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Details Modal */}
          {showUserDetails && selectedUser && (
            <div className="fixed inset-0 z-[99999] overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen pt-20 px-4 pb-20 text-center sm:block sm:p-0">
                <div
                  className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm transition-opacity"
                  onClick={() => setShowUserDetails(false)}
                />

                <div className="inline-block align-bottom bg-gray-800/95 backdrop-blur-sm border border-gray-700 rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                  <div className="px-6 pt-6 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                        <h3 className="text-xl leading-6 font-semibold text-white mb-6">
                          User Details: {selectedUser.email}
                        </h3>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                          {/* User Info */}
                          <div>
                            <h4 className="text-lg font-semibold text-white mb-4">
                              User Information
                            </h4>
                            <dl className="space-y-3">
                              <div>
                                <dt className="text-sm font-medium text-gray-400">
                                  Email
                                </dt>
                                <dd className="text-sm text-white">
                                  {selectedUser.email}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-sm font-medium text-gray-400">
                                  Role
                                </dt>
                                <dd className="text-sm text-white capitalize">
                                  {selectedUser.role}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-sm font-medium text-gray-400">
                                  Status
                                </dt>
                                <dd className="text-sm">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      selectedUser.is_active
                                        ? "bg-green-500/20 text-green-300 border border-green-500/30"
                                        : "bg-red-500/20 text-red-300 border border-red-500/30"
                                    }`}
                                  >
                                    {selectedUser.is_active
                                      ? "Active"
                                      : "Inactive"}
                                  </span>
                                </dd>
                              </div>
                              <div>
                                <dt className="text-sm font-medium text-gray-400">
                                  Created
                                </dt>
                                <dd className="text-sm text-white">
                                  {formatDate(selectedUser.created_at)}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-sm font-medium text-gray-400">
                                  Last Login
                                </dt>
                                <dd className="text-sm text-white">
                                  {formatDate(selectedUser.last_login)}
                                </dd>
                              </div>
                            </dl>
                          </div>

                          {/* Usage Stats */}
                          <div>
                            <h4 className="text-lg font-semibold text-white mb-4">
                              Usage Statistics
                            </h4>
                            {userStats ? (
                              <dl className="space-y-3">
                                {monthlyUsage && (
                                  <>
                                    <div>
                                      <dt className="text-sm font-medium text-gray-400">
                                        Monthly API Calls
                                      </dt>
                                      <dd className="text-sm text-white">
                                        {monthlyUsage.used} /{" "}
                                        {monthlyUsage.limit === -1
                                          ? "Unlimited"
                                          : monthlyUsage.limit}
                                      </dd>
                                      <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                                        <div
                                          className={`h-2 rounded-full ${
                                            monthlyUsage.percentage >= 100
                                              ? "bg-red-500"
                                              : monthlyUsage.percentage >= 80
                                              ? "bg-yellow-500"
                                              : "bg-green-500"
                                          }`}
                                          style={{
                                            width: `${Math.min(
                                              monthlyUsage.percentage,
                                              100
                                            )}%`,
                                          }}
                                        />
                                      </div>
                                      <dd className="text-xs text-gray-400 mt-1">
                                        {monthlyUsage.remaining} remaining
                                      </dd>
                                    </div>
                                    <div className="border-t border-gray-600 pt-3 mt-3" />
                                  </>
                                )}
                                <div>
                                  <dt className="text-sm font-medium text-gray-400">
                                    Total API Calls
                                  </dt>
                                  <dd className="text-sm text-white">
                                    {userStats.total_calls.toLocaleString()}
                                  </dd>
                                </div>
                                <div>
                                  <dt className="text-sm font-medium text-gray-400">
                                    Recent Calls (24h)
                                  </dt>
                                  <dd className="text-sm text-white">
                                    {userStats.recent_calls}
                                  </dd>
                                </div>
                                <div>
                                  <dt className="text-sm font-medium text-gray-400">
                                    Success Rate
                                  </dt>
                                  <dd className="text-sm text-white">
                                    {userStats.success_rate.toFixed(1)}%
                                  </dd>
                                </div>
                                <div>
                                  <dt className="text-sm font-medium text-gray-400">
                                    Popular Endpoints
                                  </dt>
                                  <dd className="text-sm text-white">
                                    <ul className="list-disc list-inside">
                                      {userStats.popular_endpoints.map(
                                        (ep, idx) => (
                                          <li key={idx}>
                                            {ep.endpoint} ({ep.count} calls)
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </dd>
                                </div>
                              </dl>
                            ) : (
                              <div className="text-sm text-gray-400">
                                Loading stats...
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-700/50 px-6 py-4 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-600">
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-gray-700 text-base font-medium text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                      onClick={() => setShowUserDetails(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

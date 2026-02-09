"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Key,
  Shield,
  Calendar,
  Activity,
  Copy,
  CheckCircle,
  XCircle,
  RefreshCw,
  User,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { getApiUrl, getAuthHeaders } from "@/lib/config";
import Link from "next/link";

interface ApiKey {
  id: number;
  name: string;
  key?: string;
  user_id: number;
  user_email?: string;
  is_active: boolean;
  rate_limit: number;
  is_free_tier: boolean;
  created_at: string;
  last_used: string | null;
  usage_count?: number;
}

export default function AdminApiKeysPage() {
  const { user, loading: userLoading } = useUser();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [copiedKeyId, setCopiedKeyId] = useState<number | null>(null);

  // Authentication guard
  useEffect(() => {
    if (!userLoading && !user) {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        window.location.href = "/auth/login";
        return;
      }
      const timeout = setTimeout(() => {
        if (!user) {
          window.location.href = "/auth/login";
        }
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [user, userLoading]);

  useEffect(() => {
    if (user && (user.role === "admin" || user.role === "super_admin")) {
      fetchKeys();
    }
  }, [user, searchTerm, statusFilter]);

  const fetchKeys = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setLoading(false);
        return;
      }

      // Fetch all users first, then get their API keys
      const usersResponse = await fetch(
        `${getApiUrl("/api/admin/users")}?per_page=1000`,
        {
          headers: getAuthHeaders(token),
        }
      );

      if (!usersResponse.ok) {
        setLoading(false);
        return;
      }

      const usersData = await usersResponse.json();
      const users = usersData.users || [];

      // Fetch API keys for each user
      const allKeys: ApiKey[] = [];
      for (const userData of users) {
        try {
          const keysResponse = await fetch(
            `${getApiUrl(`/api/admin/users/${userData.id}`)}`,
            {
              headers: getAuthHeaders(token),
            }
          );

          if (keysResponse.ok) {
            const userDetails = await keysResponse.json();
            const userApiKeys = userDetails.api_keys || [];
            for (const key of userApiKeys) {
              allKeys.push({
                ...key,
                user_email: userData.email,
              });
            }
          }
        } catch (error) {
          console.error(`Error fetching keys for user ${userData.id}:`, error);
        }
      }

      // Apply filters
      let filteredKeys = allKeys;
      if (searchTerm) {
        filteredKeys = filteredKeys.filter(
          (key) =>
            key.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            key.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            key.key?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      if (statusFilter) {
        filteredKeys = filteredKeys.filter(
          (key) =>
            (statusFilter === "active" && key.is_active) ||
            (statusFilter === "inactive" && !key.is_active)
        );
      }

      setKeys(filteredKeys);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching API keys:", error);
      setLoading(false);
    }
  };

  const handleRevokeKey = async (keyId: number) => {
    if (!confirm("Are you sure you want to revoke this API key?")) return;

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const response = await fetch(getApiUrl(`/api/admin/api-keys/${keyId}`), {
        method: "DELETE",
        headers: getAuthHeaders(token),
      });

      if (response.ok) {
        fetchKeys();
      }
    } catch (error) {
      console.error("Error revoking key:", error);
    }
  };

  const copyToClipboard = (text: string, keyId: number) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(keyId);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <div className="text-center p-8 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg shadow-lg">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-4">
            You do not have the necessary permissions to view this page.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center px-4 py-2 border border-white text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800"
          >
            Login as Admin
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="sm:flex-auto">
              <h1 className="text-4xl font-bold text-white mb-2">API Keys</h1>
              <p className="text-gray-300 text-lg">
                Manage all API keys across the system
              </p>
            </div>
            <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
              <button
                onClick={fetchKeys}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="h-5 w-5" />
                Refresh
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or key..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <p className="text-sm text-gray-400">Total Keys</p>
              <p className="text-2xl font-bold text-white">{keys.length}</p>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <p className="text-sm text-gray-400">Active Keys</p>
              <p className="text-2xl font-bold text-green-400">
                {keys.filter((k) => k.is_active).length}
              </p>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <p className="text-sm text-gray-400">Inactive Keys</p>
              <p className="text-2xl font-bold text-red-400">
                {keys.filter((k) => !k.is_active).length}
              </p>
            </div>
          </div>

          {/* Keys Table */}
          {loading ? (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 text-center">
              <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading API keys...</p>
            </div>
          ) : keys.length === 0 ? (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 text-center">
              <Key className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No API keys found</p>
            </div>
          ) : (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Key
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Rate Limit
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {keys.map((key) => (
                      <tr key={key.id} className="hover:bg-gray-700/50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-white">
                          {key.name}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                          {key.user_email || `User ${key.user_id}`}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-gray-900 px-2 py-1 rounded">
                              {key.key
                                ? `${key.key.substring(0, 20)}...`
                                : "N/A"}
                            </code>
                            {key.key && (
                              <button
                                onClick={() =>
                                  copyToClipboard(key.key!, key.id)
                                }
                                className="p-1 hover:bg-gray-600 rounded"
                              >
                                {copiedKeyId === key.id ? (
                                  <CheckCircle className="h-4 w-4 text-green-400" />
                                ) : (
                                  <Copy className="h-4 w-4 text-gray-400" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {key.is_active ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-300 border border-green-500/50">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-900/30 text-red-300 border border-red-500/50">
                              <XCircle className="h-3 w-3 mr-1" />
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                          {key.rate_limit}/min
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                          {key.is_free_tier ? (
                            <span className="px-2 py-1 bg-gray-800 text-white rounded text-xs">
                              Free Tier
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                              Regular
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                          {new Date(key.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleRevokeKey(key.id)}
                            className="text-red-400 hover:text-red-300"
                            title="Revoke Key"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

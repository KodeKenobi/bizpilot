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
  TrendingUp,
  Users,
  Globe,
  FileText,
  RefreshCw,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { getApiUrl, getAuthHeaders } from "@/lib/config";

interface FreeTierKey {
  id: number;
  name: string;
  key?: string; // Only shown when creating
  is_active: boolean;
  rate_limit: number;
  is_free_tier: boolean;
  free_tier_type: string | null;
  granted_by: number | null;
  granted_by_email?: string;
  granted_at: string | null;
  notes: string | null;
  created_at: string;
  last_used: string | null;
  expires_at: string | null;
  usage?: {
    total: number;
    last_30_days: number;
    by_endpoint?: Array<{ endpoint: string; count: number }>;
  };
}

interface FreeTierStats {
  total_keys: number;
  active_keys: number;
  inactive_keys: number;
  total_usage: number;
  usage_last_30_days: number;
  usage_by_type: Record<string, number>;
}

export default function FreeTierKeysPage() {
  const { user, loading: userLoading } = useUser();
  const [keys, setKeys] = useState<FreeTierKey[]>([]);
  const [stats, setStats] = useState<FreeTierStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedKey, setSelectedKey] = useState<FreeTierKey | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [copiedKeyId, setCopiedKeyId] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    free_tier_type: "educational",
    rate_limit: 10000,
    notes: "",
    expires_at: "",
  });

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
      fetchStats();
    }
  }, [user]);

  const fetchKeys = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (typeFilter) params.append("free_tier_type", typeFilter);
      if (statusFilter) params.append("is_active", statusFilter);

      const response = await fetch(
        `${getApiUrl("/api/admin/free-tier-keys")}?${params.toString()}`,
        {
          headers: getAuthHeaders(token),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setKeys(data.keys || []);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching free tier keys:", error);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const response = await fetch(
        getApiUrl("/api/admin/free-tier-keys/stats"),
        {
          headers: getAuthHeaders(token),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchKeyDetails = async (keyId: number) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const response = await fetch(
        getApiUrl(`/api/admin/free-tier-keys/${keyId}`),
        {
          headers: getAuthHeaders(token),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSelectedKey(data);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error("Error fetching key details:", error);
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const payload: any = {
        name: formData.name,
        free_tier_type: formData.free_tier_type,
        rate_limit: formData.rate_limit,
        notes: formData.notes,
      };

      if (formData.expires_at) {
        payload.expires_at = new Date(formData.expires_at).toISOString();
      }

      const response = await fetch(getApiUrl("/api/admin/free-tier-keys"), {
        method: "POST",
        headers: {
          ...getAuthHeaders(token),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        alert(
          `Free tier key created! Key: ${data.key.key}\n\nCopy this key now - it won't be shown again!`
        );
        setShowCreateModal(false);
        setFormData({
          name: "",
          free_tier_type: "educational",
          rate_limit: 10000,
          notes: "",
          expires_at: "",
        });
        fetchKeys();
        fetchStats();
      } else {
        const error = await response.json();
        alert(`Failed to create key: ${error.error || "Unknown error"}`);
      }
    } catch (error) {
      alert(
        `Error creating key: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleUpdateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKey) return;

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const payload: any = {
        name: formData.name,
        free_tier_type: formData.free_tier_type,
        rate_limit: formData.rate_limit,
        notes: formData.notes,
        is_active: true,
      };

      if (formData.expires_at) {
        payload.expires_at = new Date(formData.expires_at).toISOString();
      } else {
        payload.expires_at = null;
      }

      const response = await fetch(
        getApiUrl(`/api/admin/free-tier-keys/${selectedKey.id}`),
        {
          method: "PUT",
          headers: {
            ...getAuthHeaders(token),
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        alert("Free tier key updated successfully!");
        setShowEditModal(false);
        fetchKeys();
        fetchStats();
      } else {
        const error = await response.json();
        alert(`Failed to update key: ${error.error || "Unknown error"}`);
      }
    } catch (error) {
      alert(
        `Error updating key: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleRevokeKey = async (keyId: number) => {
    if (
      !confirm(
        "Are you sure you want to revoke this free tier key? It will no longer work."
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const response = await fetch(
        getApiUrl(`/api/admin/free-tier-keys/${keyId}`),
        {
          method: "DELETE",
          headers: getAuthHeaders(token),
        }
      );

      if (response.ok) {
        alert("Free tier key revoked successfully!");
        fetchKeys();
        fetchStats();
      } else {
        const error = await response.json();
        alert(`Failed to revoke key: ${error.error || "Unknown error"}`);
      }
    } catch (error) {
      alert(
        `Error revoking key: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const copyToClipboard = (text: string, keyId: number) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(keyId);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const openEditModal = (key: FreeTierKey) => {
    setSelectedKey(key);
    setFormData({
      name: key.name,
      free_tier_type: key.free_tier_type || "educational",
      rate_limit: key.rate_limit,
      notes: key.notes || "",
      expires_at: key.expires_at
        ? new Date(key.expires_at).toISOString().slice(0, 16)
        : "",
    });
    setShowEditModal(true);
  };

  const filteredKeys = keys.filter((key) => {
    const matchesSearch =
      key.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      key.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || key.free_tier_type === typeFilter;
    const matchesStatus =
      !statusFilter ||
      (statusFilter === "active" && key.is_active) ||
      (statusFilter === "inactive" && !key.is_active);
    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                  <Key className="h-8 w-8 text-white" />
                  Free Tier API Keys
                </h1>
                <p className="text-gray-400">
                  Manage free tier API keys for educational institutions and
                  partners
                </p>
              </div>
              <button
                onClick={() => {
                  setFormData({
                    name: "",
                    free_tier_type: "educational",
                    rate_limit: 10000,
                    notes: "",
                    expires_at: "",
                  });
                  setShowCreateModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg transition-colors border border-white"
              >
                <Plus className="h-5 w-5" />
                Create Free Tier Key
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Keys</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {stats.total_keys}
                    </p>
                  </div>
                  <Key className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Active Keys</p>
                    <p className="text-2xl font-bold text-green-400 mt-1">
                      {stats.active_keys}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Usage</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {stats.total_usage.toLocaleString()}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-400" />
                </div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Last 30 Days</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {stats.usage_last_30_days.toLocaleString()}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-yellow-400" />
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 mb-6 border border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search keys..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-white focus:outline-none"
                />
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-white focus:outline-none"
              >
                <option value="">All Types</option>
                <option value="educational">Educational</option>
                <option value="nonprofit">Nonprofit</option>
                <option value="partner">Partner</option>
                <option value="other">Other</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-white focus:outline-none"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <button
                onClick={() => {
                  fetchKeys();
                  fetchStats();
                }}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="h-5 w-5" />
                Refresh
              </button>
            </div>
          </div>

          {/* Keys Table */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Rate Limit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Usage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredKeys.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-8 text-center text-gray-400"
                      >
                        No free tier keys found
                      </td>
                    </tr>
                  ) : (
                    filteredKeys.map((key) => (
                      <tr
                        key={key.id}
                        className="hover:bg-gray-700/30 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">
                            {key.name}
                          </div>
                          {key.notes && (
                            <div className="text-xs text-gray-400 mt-1 truncate max-w-xs">
                              {key.notes}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-300">
                            {key.free_tier_type || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {key.is_active ? (
                            <span className="flex items-center gap-1 text-green-400">
                              <CheckCircle className="h-4 w-4" />
                              Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-400">
                              <XCircle className="h-4 w-4" />
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {key.rate_limit.toLocaleString()}/hr
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">
                            {key.usage?.total.toLocaleString() || 0} total
                          </div>
                          <div className="text-xs text-gray-400">
                            {key.usage?.last_30_days.toLocaleString() || 0}{" "}
                            (30d)
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {new Date(key.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => fetchKeyDetails(key.id)}
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                              title="View Details"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => openEditModal(key)}
                              className="text-yellow-400 hover:text-yellow-300 transition-colors"
                              title="Edit"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleRevokeKey(key.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                              title="Revoke"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Create Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-4">
                    Create Free Tier API Key
                  </h2>
                  <form onSubmit={handleCreateKey} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Organization Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-white focus:outline-none"
                        placeholder="e.g., MIT Computer Science Department"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Free Tier Type *
                      </label>
                      <select
                        required
                        value={formData.free_tier_type}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            free_tier_type: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-white focus:outline-none"
                      >
                        <option value="educational">Educational</option>
                        <option value="nonprofit">Nonprofit</option>
                        <option value="partner">Partner</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Rate Limit (requests/hour) *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.rate_limit}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            rate_limit: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-white focus:outline-none"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Recommended: 10000 for free tier keys
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Expiration Date (Optional)
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.expires_at}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            expires_at: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                        rows={3}
                        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-white focus:outline-none"
                        placeholder="Additional notes about this key..."
                      />
                    </div>
                    <div className="flex gap-4 pt-4">
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg transition-colors border border-white"
                      >
                        Create Key
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCreateModal(false)}
                        className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Details Modal */}
          {showDetailsModal && selectedKey && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white">
                      Key Details
                    </h2>
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <XCircle className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-400">Name</p>
                        <p className="text-white font-medium">
                          {selectedKey.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Type</p>
                        <p className="text-white font-medium">
                          {selectedKey.free_tier_type || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Status</p>
                        <p
                          className={`font-medium ${
                            selectedKey.is_active
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {selectedKey.is_active ? "Active" : "Inactive"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Rate Limit</p>
                        <p className="text-white font-medium">
                          {selectedKey.rate_limit.toLocaleString()}/hr
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Created</p>
                        <p className="text-white font-medium">
                          {new Date(selectedKey.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Last Used</p>
                        <p className="text-white font-medium">
                          {selectedKey.last_used
                            ? new Date(selectedKey.last_used).toLocaleString()
                            : "Never"}
                        </p>
                      </div>
                      {selectedKey.granted_by_email && (
                        <div>
                          <p className="text-sm text-gray-400">Granted By</p>
                          <p className="text-white font-medium">
                            {selectedKey.granted_by_email}
                          </p>
                        </div>
                      )}
                      {selectedKey.expires_at && (
                        <div>
                          <p className="text-sm text-gray-400">Expires</p>
                          <p className="text-white font-medium">
                            {new Date(selectedKey.expires_at).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                    {selectedKey.notes && (
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Notes</p>
                        <p className="text-white">{selectedKey.notes}</p>
                      </div>
                    )}
                    {selectedKey.usage && (
                      <div className="border-t border-gray-700 pt-4">
                        <h3 className="text-lg font-semibold text-white mb-3">
                          Usage Statistics
                        </h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-400">Total Usage</p>
                            <p className="text-2xl font-bold text-white">
                              {selectedKey.usage.total.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">
                              Last 30 Days
                            </p>
                            <p className="text-2xl font-bold text-white">
                              {selectedKey.usage.last_30_days.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {selectedKey.usage.by_endpoint &&
                          selectedKey.usage.by_endpoint.length > 0 && (
                            <div>
                              <p className="text-sm text-gray-400 mb-2">
                                Top Endpoints
                              </p>
                              <div className="space-y-2">
                                {selectedKey.usage.by_endpoint.map(
                                  (ep, idx) => (
                                    <div
                                      key={idx}
                                      className="flex justify-between text-sm"
                                    >
                                      <span className="text-gray-300">
                                        {ep.endpoint}
                                      </span>
                                      <span className="text-white font-medium">
                                        {ep.count.toLocaleString()}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Modal */}
          {showEditModal && selectedKey && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-4">
                    Edit Free Tier API Key
                  </h2>
                  <form onSubmit={handleUpdateKey} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Organization Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Free Tier Type *
                      </label>
                      <select
                        required
                        value={formData.free_tier_type}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            free_tier_type: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-white focus:outline-none"
                      >
                        <option value="educational">Educational</option>
                        <option value="nonprofit">Nonprofit</option>
                        <option value="partner">Partner</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Rate Limit (requests/hour) *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.rate_limit}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            rate_limit: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Expiration Date (Optional)
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.expires_at}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            expires_at: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                        rows={3}
                        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-white focus:outline-none"
                      />
                    </div>
                    <div className="flex gap-4 pt-4">
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                      >
                        Update Key
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowEditModal(false)}
                        className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

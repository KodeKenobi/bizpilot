"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Send,
  TrendingUp,
  Activity,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Pause,
  Play,
  Ban,
  Eye,
  Loader,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";

interface CampaignStats {
  total: number;
  active: number;
  completed: number;
  failed: number;
  draft: number;
  createdToday: number;
  processedToday: number;
  successRate: number;
  totalProcessed: number;
  totalSuccess: number;
  byTier: Record<string, number>;
  topUsers: Array<{
    email: string;
    tier: string;
    campaign_count: number;
  }>;
}

interface Campaign {
  id: number;
  name: string;
  status: string;
  total_companies: number;
  processed_count: number;
  success_count: number;
  failed_count: number;
  progress_percentage: number;
  created_at: string;
  user_email?: string;
  user_tier?: string;
}

export default function AdminCampaignsPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Redirect if not admin
  useEffect(() => {
    if (!userLoading && (!user || (user.role !== "admin" && user.role !== "super_admin"))) {
      router.push("/admin");
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    if (user && (user.role === "admin" || user.role === "super_admin")) {
      fetchStats();
      fetchCampaigns();
    }
  }, [user, page, filterStatus]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const response = await fetch("/api/campaigns/admin/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching campaign stats:", error);
    }
  };

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        per_page: "20",
        ...(filterStatus && { status: filterStatus }),
      });

      const response = await fetch(`/api/campaigns/admin/all?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns || []);
        setTotalPages(data.pagination?.pages || 1);
        setError(null);
      } else {
        throw new Error("Failed to fetch campaigns");
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCampaignAction = async (campaignId: number, action: "pause" | "resume" | "cancel") => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const response = await fetch(`/api/campaigns/admin/${campaignId}/${action}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Refresh campaigns
        fetchCampaigns();
        fetchStats();
      }
    } catch (error) {
      console.error(`Error ${action}ing campaign:`, error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: "bg-green-500/20 text-green-400 border-green-500/30",
      processing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      failed: "bg-red-500/20 text-red-400 border-red-500/30",
      paused: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      draft: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    };

    return (
      <span className={`text-xs px-2 py-1 rounded border ${styles[status as keyof typeof styles] || styles.draft}`}>
        {status}
      </span>
    );
  };

  const getTierBadge = (tier?: string) => {
    if (!tier) return <span className="text-xs px-2 py-1 rounded bg-gray-500/20 text-gray-400">Guest</span>;
    
    const styles = {
      free: "bg-gray-500/20 text-gray-400",
      testing: "bg-gray-500/20 text-gray-400",
      premium: "bg-blue-500/20 text-blue-400",
      enterprise: "bg-purple-500/20 text-purple-400",
      client: "bg-purple-500/20 text-purple-400",
    };

    return (
      <span className={`text-xs px-2 py-1 rounded ${styles[tier as keyof typeof styles] || styles.free}`}>
        {tier}
      </span>
    );
  };

  if (userLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <Loader className="w-12 h-12 text-purple-400 animate-spin" />
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
                Campaign Management
              </h1>
              <p className="text-gray-300 text-lg">
                Monitor and manage all user campaigns
              </p>
            </div>
            <Link
              href="/admin"
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              ← Back to Admin
            </Link>
          </div>

          {/* Stats Grid */}
          {stats && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Total Campaigns</p>
                    <p className="text-3xl font-bold text-white">{stats.total}</p>
                  </div>
                  <Send className="w-10 h-10 text-blue-400" />
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Active Now</p>
                    <p className="text-3xl font-bold text-white">{stats.active}</p>
                  </div>
                  <Activity className="w-10 h-10 text-green-400" />
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Success Rate</p>
                    <p className="text-3xl font-bold text-white">{stats.successRate}%</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-purple-400" />
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Processed Today</p>
                    <p className="text-3xl font-bold text-white">{stats.processedToday}</p>
                  </div>
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </div>
              </div>
            </div>
          )}

          {/* Campaigns by Tier */}
          {stats && (
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Campaigns by User Tier</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Object.entries(stats.byTier).map(([tier, count]) => (
                  <div key={tier} className="text-center p-4 bg-gray-700/30 rounded-lg">
                    <p className="text-2xl font-bold text-white">{count}</p>
                    <p className="text-sm text-gray-400 capitalize">{tier}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Users */}
          {stats && stats.topUsers.length > 0 && (
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Top Campaign Users</h3>
              <div className="space-y-2">
                {stats.topUsers.map((user) => (
                  <div
                    key={user.email}
                    className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-white font-medium">{user.email}</p>
                      {getTierBadge(user.tier)}
                    </div>
                    <p className="text-lg font-bold text-white">{user.campaign_count} campaigns</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex items-center gap-4">
            <label className="text-white">Filter by status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              <option value="">All</option>
              <option value="draft">Draft</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="paused">Paused</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Campaigns Table */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Campaign</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">User</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Progress</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Created</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <Loader className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex items-center justify-center gap-2 text-red-400">
                          <AlertCircle className="w-6 h-6" />
                          <p>{error}</p>
                        </div>
                      </td>
                    </tr>
                  ) : campaigns.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                        No campaigns found
                      </td>
                    </tr>
                  ) : (
                    campaigns.map((campaign) => (
                      <tr key={campaign.id} className="hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-300">#{campaign.id}</td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-white">{campaign.name}</p>
                            <p className="text-xs text-gray-500">{campaign.total_companies} companies</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm text-white">{campaign.user_email || "Guest"}</p>
                            {getTierBadge(campaign.user_tier)}
                          </div>
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(campaign.status)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-700 rounded-full h-2 w-24">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${campaign.progress_percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-400">{Math.round(campaign.progress_percentage)}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {new Date(campaign.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => router.push(`/campaigns/${campaign.id}`)}
                              className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                              title="View"
                            >
                              <Eye className="w-4 h-4 text-blue-400" />
                            </button>
                            {campaign.status === "processing" && (
                              <button
                                onClick={() => handleCampaignAction(campaign.id, "pause")}
                                className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                                title="Pause"
                              >
                                <Pause className="w-4 h-4 text-orange-400" />
                              </button>
                            )}
                            {campaign.status === "paused" && (
                              <button
                                onClick={() => handleCampaignAction(campaign.id, "resume")}
                                className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                                title="Resume"
                              >
                                <Play className="w-4 h-4 text-green-400" />
                              </button>
                            )}
                            {(campaign.status === "processing" || campaign.status === "paused") && (
                              <button
                                onClick={() => handleCampaignAction(campaign.id, "cancel")}
                                className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                                title="Cancel"
                              >
                                <Ban className="w-4 h-4 text-red-400" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-gray-400">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

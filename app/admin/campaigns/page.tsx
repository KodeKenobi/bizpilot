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
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useUser } from "@/contexts/UserContext";
import { AdminCampaignCard } from "@/components/dashboard/AdminCampaignCard";
import { AdminCampaignMonitor } from "@/components/dashboard/AdminCampaignMonitor";
import {
  X,
  ExternalLink,
  Download,
  Search,
  Activity as ActivityIcon,
  Shield,
  ShieldAlert,
  Image as ImageIcon,
  LayoutGrid,
  List as ListIcon,
} from "lucide-react";

interface CampaignCardProps {
  campaign: Campaign;
  onClose: () => void;
  onViewDetails: (campaign: Campaign) => void;
}

const CampaignCardModal = ({ campaign, onClose, onViewDetails }: CampaignCardProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between bg-gray-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Send className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{campaign.name}</h3>
              <p className="text-xs text-gray-400">Campaign Preview</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content - Replicating Campaign Card Styles */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Status and Progress */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-700">
              <p className="text-xs text-gray-400 mb-1">Status</p>
              <div className="flex items-center gap-2">
                {campaign.status === "processing" ? (
                  <Loader className="w-4 h-4 text-blue-400 animate-spin" />
                ) : campaign.status === "completed" ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : campaign.status === "paused" ? (
                  <Pause className="w-4 h-4 text-orange-400" />
                ) : (
                  <Clock className="w-4 h-4 text-gray-400" />
                )}
                <span className="font-semibold text-white capitalize">{campaign.status}</span>
              </div>
            </div>
            <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-700">
              <p className="text-xs text-gray-400 mb-1">Progress</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${campaign.progress_percentage}%` }}
                  />
                </div>
                <span className="font-bold text-white text-sm">{Math.round(campaign.progress_percentage)}%</span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4">
            <div className="p-3 bg-gray-700/30 rounded-lg text-center">
              <p className="text-[10px] text-gray-400 uppercase">Total</p>
              <p className="text-lg font-bold text-white">{campaign.total_companies}</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg text-center border border-green-500/20">
              <p className="text-[10px] text-green-400 uppercase">Success</p>
              <p className="text-lg font-bold text-green-400">{campaign.success_count}</p>
            </div>
            <div className="p-3 bg-red-500/10 rounded-lg text-center border border-red-500/20">
              <p className="text-[10px] text-red-400 uppercase">Failed</p>
              <p className="text-lg font-bold text-red-400">{campaign.failed_count}</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg text-center border border-blue-500/20">
              <p className="text-[10px] text-blue-400 uppercase">Done</p>
              <p className="text-lg font-bold text-blue-400">{campaign.processed_count}</p>
            </div>
          </div>

          {/* User Details */}
          <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Created By</p>
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-lg font-medium text-white">{campaign.user_email || "Guest User"}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-gray-400">Tier:</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-500/20 text-purple-300 uppercase font-bold border border-purple-500/30">
                {campaign.user_tier || "free"}
              </span>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <Clock className="w-4 h-4" />
              <span>Created: {new Date(campaign.created_at).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400 justify-end">
              <ActivityIcon className="w-4 h-4" />
              <span>ID: #{campaign.id}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-900/50 border-t border-gray-700 flex gap-3">
          <button
            onClick={() => onViewDetails(campaign)}
            className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-500/20 active:scale-[0.98]"
          >
            <ActivityIcon className="w-5 h-5" />
            Control & Monitor
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

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
  const [perPage, setPerPage] = useState(25);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [viewType, setViewType] = useState<"table" | "cards">("cards");
  const [monitoringCampaign, setMonitoringCampaign] = useState<Campaign | null>(null);

  // Delete Dialog State
  const [deleteCampaignId, setDeleteCampaignId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
  }, [user, page, perPage, filterStatus]);

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
        per_page: perPage.toString(),
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

  const handleDeleteClick = (campaignId: number) => {
    setDeleteCampaignId(campaignId);
    setIsDeleteDialogOpen(true);
  };

  const handleExecuteDelete = async () => {
    if (!deleteCampaignId) return;

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const response = await fetch(`/api/campaigns/admin/${deleteCampaignId}/delete`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success("Campaign deleted permanently");
        fetchCampaigns();
        fetchStats();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to delete campaign");
      }
    } catch (error) {
      console.error("Error deleting campaign:", error);
      toast.error("Error deleting campaign");
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteCampaignId(null);
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
          <div className="flex items-center justify-between gap-4 bg-gray-800/50 p-4 rounded-xl border border-gray-700">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-400">Filter Status:</label>
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setPage(1);
                  }}
                  className="px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm"
                >
                  <option value="">All Campaigns</option>
                  <option value="draft">Draft</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="paused">Paused</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-400">Show:</label>
                <select
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(parseInt(e.target.value));
                    setPage(1);
                  }}
                  className="px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm"
                >
                  <option value="10">10 per page</option>
                  <option value="20">20 per page</option>
                  <option value="30">30 per page</option>
                  <option value="50">50 per page</option>
                  <option value="100">100 per page</option>
                </select>
              </div>

              <div className="flex bg-gray-900/50 border border-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewType("cards")}
                  className={`p-1.5 rounded-md transition-all ${
                    viewType === "cards" ? "bg-purple-500 text-white" : "text-gray-500 hover:text-gray-300"
                  }`}
                  title="Card View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewType("table")}
                  className={`p-1.5 rounded-md transition-all ${
                    viewType === "table" ? "bg-purple-500 text-white" : "text-gray-500 hover:text-gray-300"
                  }`}
                  title="Table View"
                >
                  <ListIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="text-sm text-gray-400">
              Showing {campaigns.length} campaigns
            </div>
          </div>

          {/* Campaigns Content */}
          {loading ? (
             <div className="py-20 flex flex-col items-center justify-center gap-4">
              <Loader className="w-8 h-8 text-purple-400 animate-spin" />
              <p className="text-gray-400 animate-pulse">Fetching campaign intelligence...</p>
            </div>
          ) : viewType === "table" ? (
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
                        <td className="px-6 py-4 text-xs text-gray-400">
                          {(() => {
                            const d = new Date(campaign.created_at);
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
                          })()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                                onClick={() => setSelectedCampaign(campaign)}
                                className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors group"
                                title="Preview Campaign Card"
                              >
                                <Eye className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
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
                            <button
                                onClick={() => handleDeleteClick(campaign.id)}
                                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors group/delete"
                                title="Delete Permanently"
                              >
                                <Trash2 className="w-4 h-4 text-gray-500 group-hover/delete:text-red-400" />
                            </button>
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <AdminCampaignCard 
                  key={campaign.id} 
                  campaign={campaign} 
                  onMonitor={(c) => setMonitoringCampaign(c)} 
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Campaign Detail Modal (Preview) */}
      {selectedCampaign && (
        <CampaignCardModal
          campaign={selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
          onViewDetails={(c) => {
            setSelectedCampaign(null);
            setMonitoringCampaign(c);
          }}
        />
      )}

      {/* Full Monitoring Modal */}
      {monitoringCampaign && (
        <AdminCampaignMonitor
          campaign={monitoringCampaign}
          onClose={() => setMonitoringCampaign(null)}
        />
      )}

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleExecuteDelete}
        title="Delete Campaign Permanently"
        message="Are you sure you want to delete this campaign? This action cannot be undone and will remove all associated data."
        confirmText="Delete Campaign"
        variant="danger"
      />
    </div>
  );
}

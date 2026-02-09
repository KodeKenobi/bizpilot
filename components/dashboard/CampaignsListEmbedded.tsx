"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Loader,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Activity,
} from "lucide-react";

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
}

export function CampaignsListEmbedded() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");

      if (!token) {
        setError("Please sign in to view your campaigns");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/campaigns/my-campaigns", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch campaigns");
      }

      const data = await response.json();
      setCampaigns(data.campaigns || []);
      setError(null);
    } catch (error: any) {
      console.error("Error fetching campaigns:", error);
      setError(error.message || "Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "processing":
        return <Activity className="w-4 h-4 text-blue-400 animate-pulse" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: "bg-green-500/20 text-green-400 border-green-500/30",
      processing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      failed: "bg-red-500/20 text-red-400 border-red-500/30",
      draft: "bg-gray-500/20 text-gray-400 border-gray-500/30",
      queued: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      paused: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    };

    return (
      <span
        className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border ${
          styles[status as keyof typeof styles] || styles.draft
        }`}
      >
        {getStatusIcon(status)}
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1a1a1a] border border-red-500/30 rounded-xl p-6">
        <div className="flex items-center gap-3 text-red-400">
          <AlertCircle className="w-6 h-6" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-12 text-center">
        <h3 className="text-xl font-semibold text-white mb-2">
          No campaigns yet
        </h3>
        <p className="text-gray-400 mb-6">
          Create your first campaign to start automating outreach
        </p>
        <button
          onClick={() => router.push("/campaigns/upload")}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Campaign
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
      <table className="w-full">
        <thead className="bg-[#0a0a0a]">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Campaign
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Progress
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#2a2a2a]">
          {campaigns.map((campaign) => (
            <tr
              key={campaign.id}
              className="hover:bg-[#0a0a0a]/50 transition-colors"
            >
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-white">
                  {campaign.name}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {campaign.total_companies} companies
                </div>
              </td>
              <td className="px-6 py-4">{getStatusBadge(campaign.status)}</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="text-sm text-white mb-1">
                      {campaign.processed_count}/{campaign.total_companies}
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          campaign.status === "completed"
                            ? "bg-green-500"
                            : campaign.status === "failed"
                            ? "bg-red-500"
                            : "bg-blue-500"
                        }`}
                        style={{ width: `${campaign.progress_percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 w-12 text-right">
                    {Math.round(campaign.progress_percentage)}%
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-400">
                {new Date(campaign.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </td>
              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => router.push(`/campaigns/${campaign.id}`)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white text-sm rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

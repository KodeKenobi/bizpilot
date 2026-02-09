"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  CheckCircle,
  AlertCircle,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";
import { getApiUrl, getAuthHeaders } from "../../../lib/config";

interface TeamMember {
  id: number;
  email: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

export default function EnterpriseTeamPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [enterpriseCheckDone, setEnterpriseCheckDone] = useState(false);

  // Redirect if not enterprise tier
  useEffect(() => {
    if (enterpriseCheckDone) return; // Skip if already checked

    if (!userLoading && user) {
      const checkEnterpriseStatus = async () => {
        try {
          const token = localStorage.getItem("auth_token");
          if (!token) {
            router.push("/auth/login");
            return;
          }

          const usageResponse = await fetch(
            `${
              process.env.NEXT_PUBLIC_API_BASE_URL ||
              "https://web-production-737b.up.railway.app"
            }/api/client/usage`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (usageResponse.ok) {
            const usageData = await usageResponse.json();
            const isEnterprise =
              usageData.subscription_tier?.toLowerCase() === "enterprise" ||
              usageData.monthly?.limit === -1 ||
              (usageData.monthly?.limit && usageData.monthly.limit >= 100000);

            if (!isEnterprise) {
              router.push("/dashboard");
              return;
            }
          }
          setEnterpriseCheckDone(true);
        } catch (error) {
          console.error("Error checking enterprise status:", error);
          setEnterpriseCheckDone(true);
        }
      };

      checkEnterpriseStatus();
    }
  }, [user, userLoading, enterpriseCheckDone, router]);

  useEffect(() => {
    if (user) {
      fetchTeamMembers();
    }
  }, [user]);

  const fetchTeamMembers = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch("/api/enterprise/team", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data.teamMembers || []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || "Failed to fetch team members");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching team members:", error);
      setError("Failed to fetch team members");
      setLoading(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setInviting(true);

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setError("Authentication required");
        setInviting(false);
        return;
      }

      const response = await fetch("/api/enterprise/team", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: newMemberEmail,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(data.message || `Invitation sent to ${newMemberEmail}`);
        setNewMemberEmail("");
        // Refresh team members list
        await fetchTeamMembers();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || "Failed to invite team member");
      }
    } catch (error) {
      console.error("Error inviting team member:", error);
      setError("Failed to invite team member. Please try again.");
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!confirm("Are you sure you want to remove this team member?")) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setError("Authentication required");
        return;
      }

      const response = await fetch(`/api/enterprise/team/${memberId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(data.message || "Team member removed successfully");
        await fetchTeamMembers();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || "Failed to remove team member");
      }
    } catch (error) {
      console.error("Error removing team member:", error);
      setError("Failed to remove team member. Please try again.");
    }
  };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading team management...</p>
        </div>
      </div>
    );
  }

  if (!user) {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 page-content">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/enterprise"
                className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
              <h1 className="text-4xl font-bold text-white mb-2">
                Team Management
              </h1>
              <p className="text-gray-300 text-lg">
                Manage your enterprise team members and their access
              </p>
            </div>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-green-300 text-sm">{success}</p>
            </div>
          )}

          {/* Invite New Member */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-lg rounded-xl">
            <div className="px-6 py-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <UserPlus className="w-6 h-6 text-purple-400" />
                Invite Team Member
              </h3>
              <form onSubmit={handleInviteMember} className="flex gap-4">
                <div className="flex-1">
                  <input
                    type="email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    placeholder="Enter email address"
                    required
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  disabled={inviting}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {inviting ? "Sending..." : "Send Invite"}
                </button>
              </form>
            </div>
          </div>

          {/* Team Members List */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-lg rounded-xl">
            <div className="px-6 py-6">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-400" />
                Team Members
                {teamMembers.length > 0 && (
                  <span className="ml-2 px-2 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-full">
                    {teamMembers.length}
                  </span>
                )}
              </h3>

              {teamMembers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg mb-2">No team members yet</p>
                  <p className="text-gray-500 text-sm">
                    Invite your first team member using the form above
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Last Login
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {teamMembers.map((member) => (
                        <tr key={member.id} className="hover:bg-gray-700/30">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-white">
                                {member.email}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {member.is_active ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-500/20 text-gray-300 border border-gray-500/30">
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">
                            {new Date(member.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">
                            {member.last_login
                              ? new Date(member.last_login).toLocaleDateString()
                              : "Never"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                              title="Remove member"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Team Features */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-lg rounded-xl">
            <div className="px-6 py-6">
              <h3 className="text-xl font-semibold text-white mb-6">
                Enterprise Team Features
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                  <CheckCircle className="h-6 w-6 text-green-400 mb-2" />
                  <h4 className="text-white font-medium mb-1">
                    Unlimited Team Members
                  </h4>
                  <p className="text-sm text-gray-400">
                    Add as many team members as you need
                  </p>
                </div>
                <div className="p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                  <CheckCircle className="h-6 w-6 text-green-400 mb-2" />
                  <h4 className="text-white font-medium mb-1">
                    Shared API Access
                  </h4>
                  <p className="text-sm text-gray-400">
                    All team members share enterprise API limits
                  </p>
                </div>
                <div className="p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                  <CheckCircle className="h-6 w-6 text-green-400 mb-2" />
                  <h4 className="text-white font-medium mb-1">
                    Team Activity Monitoring
                  </h4>
                  <p className="text-sm text-gray-400">
                    Track team usage and activity
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

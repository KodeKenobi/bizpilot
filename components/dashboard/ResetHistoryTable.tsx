"use client";

import React, { useState, useEffect } from "react";
import { Clock, RotateCcw, User } from "lucide-react";

interface ResetHistoryItem {
  id: number;
  reset_by: number;
  reset_by_email: string | null;
  calls_before: number;
  calls_after: number;
  reset_reason: string | null;
  reset_at: string;
}

interface ResetHistoryTableProps {
  userId?: number;
}

export function ResetHistoryTable({ userId }: ResetHistoryTableProps) {
  const [history, setHistory] = useState<ResetHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchResetHistory();
    }
  }, [userId]);

  const fetchResetHistory = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setLoading(false);
        return;
      }

      // Use relative URL to hide Railway backend URL
      const backendUrl =
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1")
          ? "http://localhost:5000"
          : "";

      const response = await fetch(`${backendUrl}/api/client/reset-history`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHistory(data.reset_history || []);
      }
    } catch (error) {
          } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-4"></div>
        <p className="text-gray-400">Loading reset history...</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="p-8 text-center">
        <RotateCcw className="h-12 w-12 text-gray-500 mx-auto mb-4" />
        <p className="text-gray-400">No reset history found</p>
        <p className="text-sm text-gray-500 mt-2">
          Your API calls have never been reset by an administrator
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-[#2a2a2a]">
        <thead className="bg-[#1a1a1a]">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Reset Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Reset By
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Calls Before
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Calls After
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Reason
            </th>
          </tr>
        </thead>
        <tbody className="bg-[#1a1a1a] divide-y divide-[#2a2a2a]">
          {history.map((item) => (
            <tr key={item.id} className="hover:bg-[#2a2a2a] transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center text-sm text-gray-300">
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  {formatDate(item.reset_at)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center text-sm text-gray-300">
                  <User className="h-4 w-4 mr-2 text-gray-500" />
                  {item.reset_by_email || "Admin"}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm font-medium text-yellow-400">
                  {item.calls_before}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm font-medium text-green-400">
                  {item.calls_after}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-gray-400">
                  {item.reset_reason || "No reason provided"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Shield,
  Zap,
  Play,
  Square,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  ArrowRight,
  TrendingUp,
  Image as ImageIcon,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import Link from "next/link";

interface ServiceStatus {
  is_running: boolean;
  stats: {
    total_views?: number;
    views_today?: number;
    target_views_per_day?: number;
    last_view?: string;
    
    total_tests?: number;
    failures?: number;
    last_run?: string;
    next_run?: string;
    history?: Array<{
        timestamp: string;
        success: boolean;
        error?: string;
    }>;
  };
}

export default function AutomationsPage() {
  const { user, loading: userLoading } = useUser();
  const [adService, setAdService] = useState<ServiceStatus | null>(null);
  const [imageTestService, setImageTestService] = useState<ServiceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchStatuses();
    }
  }, [user]);

  const fetchStatuses = async () => {
    try {
      setIsUpdating(true);
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Try to fetch ad service status
      try {
        const adResponse = await fetch("/api/admin/ad-service/status", { headers });
        if (adResponse.ok) {
          const data = await adResponse.json();
          setAdService(data);
        }
      } catch (e) {
        console.error("Failed to fetch ad service status:", e);
      }

      // Fetch image test service status
      try {
        const imageResponse = await fetch("/api/admin/image-test/status", { headers });
        if (imageResponse.ok) {
          const data = await imageResponse.json();
          setImageTestService(data);
        }
      } catch (e) {
        console.error("Failed to fetch image test service status:", e);
      }

      setLoading(false);
      setIsUpdating(false);
    } catch (error) {
      console.error("Error fetching statuses:", error);
      setLoading(false);
      setIsUpdating(false);
    }
  };

  const handleAction = async (service: 'ad' | 'image', action: 'start' | 'stop' | 'test-now' | 'reset-stats') => {
    try {
      setIsUpdating(true);
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const endpoint = service === 'ad' ? '/api/admin/ad-service' : '/api/admin/image-test';
      const response = await fetch(`${endpoint}/${action}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        await fetchStatuses();
      }
    } catch (error) {
      console.error(`Error performing ${action} on ${service} service:`, error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <Link href="/auth/login" className="text-purple-400 hover:text-purple-300">Return to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
              <Zap className="h-8 w-8 text-yellow-400 mr-3" />
              Automated Services
            </h1>
            <p className="text-gray-400">Manage background automation and monitoring services</p>
          </div>
          <button
            onClick={fetchStatuses}
            disabled={isUpdating}
            className="inline-flex items-center px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
            Refresh Status
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ad Optimization Service */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden shadow-xl">
            <div className="px-6 py-5 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <TrendingUp className="h-5 w-5 text-green-400 mr-2" />
                Ad Optimization Service
              </h2>
              <div className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${adService?.is_running ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                <Activity className={`h-3 w-3 mr-1.5 ${adService?.is_running ? 'animate-pulse' : ''}`} />
                {adService?.is_running ? 'Running' : 'Stopped'}
              </div>
            </div>
            
            <div className="p-6">
              {!adService ? (
                <div className="py-12 text-center text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Ad Optimization service not found or inactive</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Total Views</p>
                      <p className="text-2xl font-bold text-white">{adService.stats.total_views}</p>
                    </div>
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Today's Progress</p>
                      <p className="text-2xl font-bold text-white">
                        {adService.stats.views_today} / {adService.stats.target_views_per_day}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-gray-400">Last View:</span>
                      <span className="ml-2 text-gray-200">
                        {adService.stats.last_view ? new Date(adService.stats.last_view).toLocaleString() : 'Never'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {adService.is_running ? (
                      <button
                        onClick={() => handleAction('ad', 'stop')}
                        disabled={isUpdating}
                        className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        <Square className="h-4 w-4 mr-2" /> Stop Service
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAction('ad', 'start')}
                        disabled={isUpdating}
                        className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        <Play className="h-4 w-4 mr-2" /> Start Service
                      </button>
                    )}
                    <button
                      onClick={() => handleAction('ad', 'test-now')}
                      disabled={isUpdating}
                      className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    >
                      <Zap className="h-4 w-4 mr-2" /> Simulate View Now
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Image Converter Test Service */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden shadow-xl">
            <div className="px-6 py-5 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <ImageIcon className="h-5 w-5 text-blue-400 mr-2" />
                Image Converter Test Service
              </h2>
              <div className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${imageTestService?.is_running ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                <Activity className={`h-3 w-3 mr-1.5 ${imageTestService?.is_running ? 'animate-pulse' : ''}`} />
                {imageTestService?.is_running ? 'Running' : 'Stopped'}
              </div>
            </div>
            
            <div className="p-6">
              {!imageTestService ? (
                <div className="py-12 text-center text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Image Test service not found or inactive</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Total Tests</p>
                      <p className="text-2xl font-bold text-white">{imageTestService.stats.total_tests}</p>
                    </div>
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Failures</p>
                      <p className={`text-2xl font-bold ${imageTestService.stats.failures! > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {imageTestService.stats.failures}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-gray-400">Last Run:</span>
                      <span className="ml-2 text-gray-200">
                        {imageTestService.stats.last_run ? new Date(imageTestService.stats.last_run).toLocaleString() : 'Never'}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-gray-400">Next Scheduled:</span>
                      <span className="ml-2 text-gray-200">
                        {imageTestService.stats.next_run ? new Date(imageTestService.stats.next_run).toLocaleString() : 'TBD'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 mb-8">
                    {imageTestService.is_running ? (
                      <button
                        onClick={() => handleAction('image', 'stop')}
                        disabled={isUpdating}
                        className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        <Square className="h-4 w-4 mr-2" /> Stop Service
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAction('image', 'start')}
                        disabled={isUpdating}
                        className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        <Play className="h-4 w-4 mr-2" /> Start Service
                      </button>
                    )}
                    <button
                      onClick={() => handleAction('image', 'test-now')}
                      disabled={isUpdating}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" /> Test Now
                    </button>
                    <button
                      onClick={() => handleAction('image', 'reset-stats')}
                      disabled={isUpdating}
                      className="inline-flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" /> Reset Stats
                    </button>
                  </div>

                  {/* History List */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-300 mb-3 border-b border-gray-700 pb-1">Recent Activity</h3>
                    <div className="space-y-2">
                        {imageTestService.stats.history && imageTestService.stats.history.length > 0 ? (
                            imageTestService.stats.history.map((run, i) => (
                                <div key={i} className="flex items-center justify-between text-xs p-2 bg-gray-900/30 rounded border border-gray-700">
                                    <span className="text-gray-400">{new Date(run.timestamp).toLocaleString()}</span>
                                    {run.success ? (
                                        <span className="text-green-400 flex items-center"><CheckCircle className="h-3 w-3 mr-1" /> Success</span>
                                    ) : (
                                        <span className="text-red-400 flex items-center" title={run.error}><AlertCircle className="h-3 w-3 mr-1" /> Error</span>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-gray-500 italic">No activity recorded yet</p>
                        )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link 
            href="/admin"
            className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors"
          >
            Back to Dashboard
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}

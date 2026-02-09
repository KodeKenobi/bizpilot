"use client";

import React, { useState, useEffect } from "react";
import { Brain, RefreshCw, List, Activity, TrendingUp } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { getApiUrl, getAuthHeaders } from "@/lib/config";

interface BrainStats {
  total_patterns: number;
  patterns_by_type: Record<string, number>;
  total_events: number;
  error?: string;
}

interface BrainEvent {
  id: number;
  event_type: string;
  pattern_value: string | null;
  outcome: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

interface BrainPattern {
  id: number;
  pattern_type: string;
  pattern_value: string;
  success_count: number;
  use_count: number;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function AdminBrainPage() {
  const { user, loading: userLoading } = useUser();
  const [stats, setStats] = useState<BrainStats | null>(null);
  const [events, setEvents] = useState<BrainEvent[]>([]);
  const [patterns, setPatterns] = useState<BrainPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("");
  const [patternTypeFilter, setPatternTypeFilter] = useState<string>("");

  useEffect(() => {
    if (!userLoading && !user) {
      window.location.href = "/auth/login";
      return;
    }
    if (user && user.role !== "super_admin") {
      if (user.role === "admin") window.location.href = "/enterprise";
      else window.location.href = "/dashboard";
      return;
    }
  }, [user, userLoading]);

  const fetchBrain = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;
    setLoading(true);
    try {
      const [statsRes, eventsRes, patternsRes] = await Promise.all([
        fetch(getApiUrl("/api/admin/brain/stats"), {
          headers: getAuthHeaders(token),
        }),
        fetch(
          getApiUrl(
            `/api/admin/brain/events?limit=80${
              eventTypeFilter
                ? `&event_type=${encodeURIComponent(eventTypeFilter)}`
                : ""
            }`
          ),
          { headers: getAuthHeaders(token) }
        ),
        fetch(
          getApiUrl(
            `/api/admin/brain/patterns?limit=150${
              patternTypeFilter
                ? `&pattern_type=${encodeURIComponent(patternTypeFilter)}`
                : ""
            }`
          ),
          { headers: getAuthHeaders(token) }
        ),
      ]);
      if (statsRes.ok) {
        const d = await statsRes.json();
        setStats(d);
      }
      if (eventsRes.ok) {
        const d = await eventsRes.json();
        setEvents(d.events || []);
      }
      if (patternsRes.ok) {
        const d = await patternsRes.json();
        setPatterns(d.patterns || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "super_admin") {
      fetchBrain();
    }
  }, [user, eventTypeFilter, patternTypeFilter]);

  if (userLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
            <Brain className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Learning Brain</h1>
            <p className="text-sm text-gray-400">
              Pattern-only intelligence (no domains). Automatically learns from
              every visit.
            </p>
          </div>
        </div>
        <button
          onClick={fetchBrain}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {stats?.error && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-sm">
          {stats.error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <TrendingUp className="w-4 h-4" />
            Total patterns
          </div>
          <div className="text-2xl font-bold text-white">
            {stats?.total_patterns ?? 0}
          </div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <Activity className="w-4 h-4" />
            Total events
          </div>
          <div className="text-2xl font-bold text-white">
            {stats?.total_events ?? 0}
          </div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            By type
          </div>
          <div className="text-sm text-gray-300 space-y-1">
            {stats?.patterns_by_type &&
            Object.keys(stats.patterns_by_type).length > 0
              ? Object.entries(stats.patterns_by_type).map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-gray-400">{k}</span>
                    <span>{v}</span>
                  </div>
                ))
              : "—"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between flex-wrap gap-2">
            <span className="font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Recent events
            </span>
            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="bg-gray-700 border border-gray-600 text-white text-xs rounded px-2 py-1"
            >
              <option value="">All types</option>
              <option value="contact_page">contact_page</option>
              <option value="cookie_modal">cookie_modal</option>
              <option value="outcome">outcome</option>
            </select>
          </div>
          <div className="max-h-[400px] overflow-y-auto p-4 space-y-2">
            {events.length === 0 && !loading && (
              <p className="text-gray-500 text-sm">
                No events yet. Run campaigns to feed the brain.
              </p>
            )}
            {events.map((ev) => (
              <div
                key={ev.id}
                className="text-xs bg-gray-900/50 rounded-lg p-3 border border-gray-700/50"
              >
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-medium text-purple-400">
                    {ev.event_type}
                  </span>
                  <span className="text-emerald-400">{ev.outcome}</span>
                  {ev.pattern_value && (
                    <span
                      className="text-gray-500 truncate max-w-[200px]"
                      title={ev.pattern_value}
                    >
                      {ev.pattern_value}
                    </span>
                  )}
                </div>
                <div className="text-gray-500">
                  {new Date(ev.created_at).toLocaleString()}
                  {Object.keys(ev.metadata || {}).length > 0 && (
                    <span className="ml-2"> {JSON.stringify(ev.metadata)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between flex-wrap gap-2">
            <span className="font-semibold text-white flex items-center gap-2">
              <List className="w-4 h-4" />
              Learned patterns
            </span>
            <select
              value={patternTypeFilter}
              onChange={(e) => setPatternTypeFilter(e.target.value)}
              className="bg-gray-700 border border-gray-600 text-white text-xs rounded px-2 py-1"
            >
              <option value="">All types</option>
              <option value="contact_keyword">contact_keyword</option>
              <option value="cookie_selector">cookie_selector</option>
            </select>
          </div>
          <div className="max-h-[400px] overflow-y-auto p-4 space-y-2">
            {patterns.length === 0 && !loading && (
              <p className="text-gray-500 text-sm">
                No patterns yet. Learning runs automatically.
              </p>
            )}
            {patterns.map((p) => (
              <div
                key={p.id}
                className="text-xs bg-gray-900/50 rounded-lg p-3 border border-gray-700/50 flex flex-wrap items-center justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <span className="text-purple-400 font-medium">
                    {p.pattern_type}
                  </span>
                  <span
                    className="text-gray-400 ml-2 truncate block"
                    title={p.pattern_value}
                  >
                    {p.pattern_value}
                  </span>
                </div>
                <div className="flex gap-3 text-gray-500 shrink-0">
                  <span title="Successes">✓ {p.success_count}</span>
                  <span title="Uses">↻ {p.use_count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { 
  X, Activity, Loader, CheckCircle, XCircle, Clock, 
  ExternalLink, Search, RefreshCw, Trash2, Download,
  Play, Pause, ShieldAlert, Image as ImageIcon, ArrowLeft
} from "lucide-react";

interface AdminCampaignMonitorProps {
  campaign: any;
  onClose: () => void;
}

interface Company {
  id: number;
  company_name: string;
  website_url: string;
  status: string;
  error_message: string | null;
  screenshot_url?: string;
  fields_filled?: number;
  detection_method?: string;
}

interface ActivityLog {
  action: string;
  message: string;
  level: "info" | "success" | "warning" | "error";
  timestamp: string;
}

export const AdminCampaignMonitor = ({ campaign: initialCampaign, onClose }: AdminCampaignMonitorProps) => {
  const [campaign, setCampaign] = useState(initialCampaign);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isRapidAllRunning, setIsRapidAllRunning] = useState(false);
  const [processingCompanyId, setProcessingCompanyId] = useState<number | null>(null);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const [isStopping, setIsStopping] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastEventId, setLastEventId] = useState("0");
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const activityLogsRef = useRef<ActivityLog[]>([]);
  const processingCompanyIdRef = useRef<number | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      const [campRes, compRes] = await Promise.all([
        fetch(`/api/campaigns/${initialCampaign.id}`).catch(() => null),
        fetch(`/api/campaigns/${initialCampaign.id}/companies`).catch(() => null)
      ]);

      if (campRes?.ok) {
        const data = await campRes.json();
        setCampaign(data.campaign);
      }
      
      if (compRes?.ok) {
        const data = await compRes.json();
        setCompanies(data.companies || []);
      }
    } catch (err) {
      console.error("Error fetching monitor data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const connectToStream = () => {
    if (eventSourceRef.current) eventSourceRef.current.close();

    const backendUrl = "web-production-737b.up.railway.app";
    const sseUrl = `https://${backendUrl}/sse/campaign/${initialCampaign.id}?last_id=${lastEventId}`;
    
    const es = new EventSource(sseUrl);
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (event.lastEventId) setLastEventId(event.lastEventId);

        if (message.type === "campaign_start") {
          setIsRapidAllRunning(true);
        } else if (message.type === "company_processing") {
          const { company_id } = message.data;
          setProcessingCompanyId(company_id);
          processingCompanyIdRef.current = company_id;
          setCompanies(prev => prev.map(c => c.id === company_id ? { ...c, status: "processing" } : c));
        } else if (message.type === "activity") {
          const log = message.data;
          setActivityLogs(prev => [...prev, log].slice(-50));
        } else if (message.type === "company_completed") {
          const { company_id, status, screenshot_url } = message.data;
          setProcessingCompanyId(null);
          processingCompanyIdRef.current = null;
          setCompanies(prev => prev.map(c => c.id === company_id ? { ...c, status, screenshot_url } : c));
        } else if (message.type === "campaign_complete") {
          setIsRapidAllRunning(false);
          fetchInitialData(true);
        } else if (message.type === "campaign_stopped") {
          setIsRapidAllRunning(false);
          setIsStopping(false);
          fetchInitialData(true);
        }
      } catch (e) {
        console.error("SSE parse error:", e);
      }
    };

    es.onerror = () => {
      console.log("SSE Reconnecting...");
    };
  };

  const handleAction = async (action: string) => {
    try {
      if (action === "stop") setIsStopping(true);
      
      const endpoint = action === "rapid" 
        ? `/api/campaigns/${initialCampaign.id}/rapid-process-batch`
        : `/api/campaigns/${initialCampaign.id}/${action}`;

      const body = action === "rapid" 
        ? JSON.stringify({ company_ids: companies.filter(c => c.status === "pending").slice(0, 50).map(c => c.id) })
        : undefined;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body
      });

      if (res.ok && action === "rapid") {
        setIsRapidAllRunning(true);
        fetchInitialData(true);
      }
    } catch (err) {
      console.error(`Action ${action} failed:`, err);
    } finally {
      if (action === "stop") setIsStopping(false);
    }
  };

  const stats = useMemo(() => {
    const total = companies.length;
    const processed = companies.filter(c => ["completed", "success", "failed", "no_contact_found", "captcha"].includes(c.status)).length;
    const success = companies.filter(c => ["completed", "success"].includes(c.status)).length;
    const progress = total > 0 ? Math.round((processed / total) * 100) : 0;
    return { total, processed, success, progress };
  }, [companies]);

  const filteredCompanies = companies.filter(c => filterStatus === "all" ? true : c.status === filterStatus);

  if (loading) return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md">
      <div className="text-center">
        <Loader className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-400 font-medium">Initializing Secure Monitor...</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-[#0A0A0A] overflow-hidden animate-in fade-in duration-300">
      {/* Top Navigation */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900/50">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              {campaign.name}
              <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20`}>
                {campaign.status}
              </span>
            </h2>
            <p className="text-xs text-gray-500 flex items-center gap-2">
              User: <span className="text-gray-300">{campaign.user_email}</span> • 
              Tier: <span className="text-purple-400 uppercase">{campaign.user_tier}</span>
            </p>
          </div>
          <span className="text-[10px] bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full font-bold border border-blue-500/20">
            STATIC VIEW
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => fetchInitialData()} 
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-md border border-gray-700 transition-all"
            title="Reload latest campaign data"
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
            {companies.some(c => c.status === "pending") && (
              <button 
                onClick={() => handleAction("rapid")}
                disabled={isRapidAllRunning}
                className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-all disabled:opacity-50"
              >
                <Play className="w-3 h-3" /> Start Processing
              </button>
            )}
            {isRapidAllRunning && (
              <button 
                onClick={() => handleAction("stop")}
                className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-md transition-all"
              >
                <XCircle className="w-3 h-3" /> Stop
              </button>
            )}
          </div>

          <button 
            onClick={onClose} 
            className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold bg-gray-800 hover:bg-gray-700 text-white rounded-md border border-gray-700 transition-all"
          >
            <X className="w-4 h-4 text-gray-400" />
            Close Monitor
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Feed Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Progress Overview */}
          <div className="grid grid-cols-4 gap-6">
            {[
              { label: "Total Companies", value: stats.total, color: "text-white" },
              { label: "Successfully Sent", value: stats.success, color: "text-green-400" },
              { label: "Processed", value: stats.processed, color: "text-blue-400" },
              { label: "Completion", value: `${stats.progress}%`, color: "text-purple-400" },
            ].map((s, i) => (
              <div key={i} className="bg-gray-900/50 border border-gray-800 p-4 rounded-xl">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <div className="mt-2 h-1 bg-gray-800 rounded-full">
                  <div className={`h-full bg-current ${s.color.replace('text-', 'bg-')}`} style={{ width: s.label === "Completion" ? s.value : '100%' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Company Table */}
          <div className="bg-gray-900/30 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Real-time Company Feed
                <span className="text-gray-500 text-xs">({filteredCompanies.length} items)</span>
              </h3>
              <select 
                value={filterStatus} 
                onChange={e => setFilterStatus(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-xs rounded-lg px-3 py-1.5 text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All States</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-[10px] text-gray-500 uppercase bg-gray-900/20">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Company</th>
                    <th className="px-6 py-3 font-semibold text-center">Status</th>
                    <th className="px-6 py-3 font-semibold">Message</th>
                    <th className="px-6 py-3 font-semibold text-right">Preview</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredCompanies.map(c => (
                    <tr key={c.id} className="hover:bg-gray-800/20 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-200">{c.company_name}</div>
                        <div className="text-[10px] text-gray-500 truncate max-w-[200px]">{c.website_url}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`mx-auto flex items-center justify-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase w-fit border ${
                          c.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                          c.status === 'processing' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          c.status === 'failed' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                          'bg-gray-800 text-gray-400 border-gray-700'
                        }`}>
                          {c.status === 'processing' && <Loader className="w-2.5 h-2.5 animate-spin" />}
                          {c.status}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className={`text-[11px] line-clamp-2 ${c.error_message ? 'text-rose-400' : 'text-gray-400'}`}>
                          {c.error_message || "Awaiting processing trigger..."}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {c.screenshot_url ? (
                          <button onClick={() => setSelectedScreenshot(c.screenshot_url || null)}>
                            <img src={c.screenshot_url} className="w-10 h-8 object-cover rounded border border-gray-700 group-hover:border-blue-500 transition-colors" />
                          </button>
                        ) : (
                          <div className="w-10 h-8 bg-gray-800 rounded border border-gray-700 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredCompanies.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-20 text-center text-gray-500 text-sm italic">
                        No companies found matching the current criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* Screenshot Modal Container */}
      {selectedScreenshot && (
        <div 
          className="fixed inset-0 z-[70] flex items-center justify-center p-8 bg-black/95 animate-in fade-in duration-200 cursor-zoom-out"
          onClick={() => setSelectedScreenshot(null)}
        >
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setSelectedScreenshot(null);
            }} 
            className="absolute top-6 right-6 p-3 bg-gray-800 rounded-full text-white hover:bg-gray-700 z-[80]"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
            <img 
              src={selectedScreenshot} 
              className="max-w-full max-h-full object-contain rounded shadow-2xl border border-gray-800 cursor-default" 
            />
          </div>
        </div>
      )}
    </div>
  );
};

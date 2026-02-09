"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import {
  ArrowLeft,
  Loader,
  CheckCircle,
  XCircle,
  Shield,
  Clock,
  Eye,
  RefreshCw,
  Image as ImageIcon,
  X,
  Activity,
  Trash2,
  Download,
  Search,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ExportOptionsModal from "@/components/ui/ExportOptionsModal";
import RapidAllLimitModal from "@/components/ui/RapidAllLimitModal";
import RetryFailedModal from "@/components/ui/RetryFailedModal";
import { getAuthHeaders } from "@/lib/config";

interface Campaign {
  id: number;
  public_id: string;
  name: string;
  status: string;
  total_companies: number;
  processed_count: number;
  success_count: number;
  failed_count: number;
  captcha_count: number;
  progress_percentage: number;
  created_at: string;
}

interface ActivityLog {
  company_id?: number;
  company_name?: string;
  action: string;
  message: string;
  user_message?: string;
  level: "info" | "success" | "warning" | "error";
  timestamp: string;
}

interface Company {
  id: number;
  company_name: string;
  website_url: string;
  contact_email: string;
  phone: string;
  status: string;
  contact_page_found: boolean;
  error_message: string | null;
  screenshot_url?: string;
  // Advanced detection fields
  contact_method?: string;
  detection_method?: string;
  fields_filled?: number;
  contact_info?: {
    emails?: string[];
    phones?: string[];
    social_links?: string[];
  };
}

export default function CampaignDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useUser();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(
    null
  );
  const [refreshing, setRefreshing] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [processingCompanyId, setProcessingCompanyId] = useState<number | null>(
    null
  );
  const [autoStarted, setAutoStarted] = useState(false);
  const [rapidProgress, setRapidProgress] = useState(0);
  const [rapidStatus, setRapidStatus] = useState<string>("");
  const [rapidCurrentCompany, setRapidCurrentCompany] = useState<string>("");
  const [activeEventSource, setActiveEventSource] = useState<EventSource | null>(
    null
  );
  const [isRapidAllRunning, setIsRapidAllRunning] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(100);
  const [rapidAllModalOpen, setRapidAllModalOpen] = useState(false);
  const [retryFailedModalOpen, setRetryFailedModalOpen] = useState(false);
  const [customProcessingLimit, setCustomProcessingLimit] = useState<
    number | null
  >(null);
  const [rapidAllProgress, setRapidAllProgress] = useState(0); // Track: X companies processed
  const [rapidAllTotal, setRapidAllTotal] = useState(0); // Track: out of Y total
  const [processingCount, setProcessingCount] = useState(0); // How many are currently processing
  const [avgProcessingTime, setAvgProcessingTime] = useState(0); // Average time per company
  const [filterMethod, setFilterMethod] = useState<string>("all");
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isStopping, setIsStopping] = useState(false);
  const [resettingStuck, setResettingStuck] = useState(false);
  const [dailyUsage, setDailyUsage] = useState<{
    daily_limit: number;
    daily_used: number;
    daily_remaining: number | null;
    unlimited: boolean;
  } | null>(null);
  const activityLogsRef = useRef<ActivityLog[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Use refs to avoid stale closures in processNextPending
  const rapidAllProgressRef = useRef(0);
  const customProcessingLimitRef = useRef<number | null>(null);
  const isRapidAllRunningRef = useRef(false);
  const processingTimesRef = useRef<number[]>([]); // Track processing times for ETA
  const processingCompanyIdRef = useRef<number | null>(null);
  const campaignStatusRef = useRef<string | undefined>(undefined);
  const autoResetStuckDoneRef = useRef(false);

  // Keep refs in sync with state (so polling interval can read latest without re-running effect)
  useEffect(() => {
    rapidAllProgressRef.current = rapidAllProgress;
  }, [rapidAllProgress]);

  useEffect(() => {
    processingCompanyIdRef.current = processingCompanyId;
  }, [processingCompanyId]);

  useEffect(() => {
    campaignStatusRef.current = campaign?.status;
  }, [campaign?.status]);

  useEffect(() => {
    customProcessingLimitRef.current = customProcessingLimit;
  }, [customProcessingLimit]);

  useEffect(() => {
    isRapidAllRunningRef.current = isRapidAllRunning;
  }, [isRapidAllRunning]);

  // Removed manual sync effect: using global 'stats' object for UI consistency

  const campaignId = params?.id as string;

  // Single source of company updates: main poll only (no separate rapid refresh that overwrites optimistic "processing")

  // Get user's campaign company limit
  const getCampaignLimit = (): number => {
    if (!user) return 5; // Guest
    if (
      user.subscription_tier === "free" ||
      user.subscription_tier === "testing"
    )
      return 50;
    if (user.subscription_tier === "premium") return 100; // Production
    if (
      user.subscription_tier === "enterprise" ||
      user.subscription_tier === "client"
    )
      return Infinity;
    return 5; // Default to guest limit
  };

  const campaignLimit = getCampaignLimit();

  const fetchUsage = useCallback(async () => {
    try {
      let url = "/api/campaigns/usage";
      const headers: HeadersInit = { "Content-Type": "application/json" };
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("auth_token")
          : null;
      if (token) {
        Object.assign(headers, getAuthHeaders(token));
      } else {
        const sessionId =
          typeof window !== "undefined"
            ? localStorage.getItem("guest_session_id")
            : null;
        if (sessionId) url += `?session_id=${encodeURIComponent(sessionId)}`;
      }
      const res = await fetch(url, { credentials: "include", headers });
      if (res.ok) {
        const data = await res.json();
        setDailyUsage({
          daily_limit: data.daily_limit ?? 5,
          daily_used: data.daily_used ?? 0,
          daily_remaining: data.daily_remaining ?? null,
          unlimited: data.unlimited ?? false,
        });
      }
    } catch {
      // Non-blocking
    }
  }, [user]);

  // Initial load + polling only. Do NOT depend on processingCompanyId/isRapidAllRunning so that
  // clicking Start does NOT re-run this effect and trigger fetchCampaignDetails() — the first company
  // stays "processing" from the optimistic update until the next poll (every 6s) or WebSocket.
  useEffect(() => {
    if (!campaignId) return;
    console.log("[Campaign Detail] Initial load, campaignId:", campaignId);
    fetchCampaignDetails();
    fetchUsage();
    const interval = setInterval(() => {
      const status = campaignStatusRef.current;
      const running = isRapidAllRunningRef.current;
      const currentId = processingCompanyIdRef.current;
      if (
        status &&
        status !== "completed" &&
        status !== "failed" &&
        status !== "cancelled" &&
        (running || currentId != null)
      ) {
        fetchCampaignDetails(true);
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [campaignId]);

  // When polling sees campaign finished, stop Rapid All state (covers case when WebSocket never sent campaign_complete)
  useEffect(() => {
    if (
      isRapidAllRunning &&
      campaign?.status &&
      ["completed", "failed", "cancelled"].includes(campaign.status)
    ) {
      setIsRapidAllRunning(false);
      setRapidStatus(
        campaign.status === "completed" ? "Campaign Complete!" : "Stopped"
      );
    }
  }, [campaign?.status, isRapidAllRunning]);

  // PERMANENT FIX: Auto-reset stuck companies when (a) campaign is done but API still shows "processing", or (b) campaign/companies show "processing" but we're not running (thread died). Run once per mount.
  useEffect(() => {
    if (!campaignId || autoResetStuckDoneRef.current) return;
    const terminal = ["completed", "failed", "cancelled"];
    const campaignDone =
      campaign?.status && terminal.includes(campaign.status);
    const campaignStuckButNotRunning =
      campaign?.status === "processing" &&
      !isRapidAllRunning &&
      processingCompanyId === null;
    const hasStuck = companies.some((c) => c.status === "processing");
    const notRunning =
      !isRapidAllRunning && processingCompanyId === null;
    const shouldAutoReset =
      (campaignDone || campaignStuckButNotRunning) &&
      hasStuck &&
      notRunning &&
      companies.length > 0;
    if (shouldAutoReset) {
      autoResetStuckDoneRef.current = true;
      fetch(`/api/campaigns/${campaignId}/reset-stuck`, { method: "POST" })
        .then((r) => {
          if (r.ok) {
            console.log("[Campaign] Auto-reset stuck companies");
            return fetchCampaignDetails(true);
          }
        })
        .catch((err) =>
          console.error("[Campaign] Auto reset-stuck failed:", err)
        );
    }
  }, [
    campaignId,
    campaign?.status,
    companies,
    isRapidAllRunning,
    processingCompanyId,
  ]);

  const fetchCampaignDetails = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
        setRefreshing(true);
      }

      const [campaignRes, companiesRes] = await Promise.all([
        fetch(`/api/campaigns/${campaignId}`),
        fetch(`/api/campaigns/${campaignId}/companies`),
      ]);

      if (campaignRes.ok) {
        const campaignData = await campaignRes.json();
        setCampaign(campaignData.campaign);
      } else {
        console.error(
          "[Campaign Detail] Failed to fetch campaign:",
          campaignRes.status
        );
      }

      if (companiesRes.ok) {
        const companiesData = await companiesRes.json();
        // Preserve optimistic "processing" only when API still has company as processing/pending.
        // Never overwrite terminal statuses (no_contact_found, completed, failed, etc.) with "processing".
        const terminalStatuses = [
          "completed",
          "success",
          "contact_info_found",
          "failed",
          "no_contact_found",
          "captcha",
        ];
        setCompanies((prev) => {
          const fromApi = (companiesData.companies || []) as Company[];
          const wasProcessing = new Set(
            prev.filter((c) => c.status === "processing").map((c) => c.id)
          );
          const currentProcessingId = processingCompanyIdRef.current;
          return fromApi.map((c: Company) => {
            const apiTerminal = terminalStatuses.includes(c.status);
            if (apiTerminal) return c; // Always trust API for finished companies
            if (wasProcessing.has(c.id) || c.id === currentProcessingId)
              return { ...c, status: "processing" as const };
            return c;
          });
        });
      } else {
        console.error(
          "[Campaign Detail] Failed to fetch companies:",
          companiesRes.status
        );
      }
    } catch (error) {
      console.error(
        "[Campaign Detail] Failed to fetch campaign details:",
        error
      );
    } finally {
      if (!silent) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  const handleDeleteCampaign = async () => {
    if (!campaignId) return;

    setDeleteError(null);
    try {
      setDeleting(true);
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: "DELETE",
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete campaign");
      }

      setDeleteDialogOpen(false);
      router.push("/campaigns");
      router.refresh();
    } catch (error: any) {
      console.error("Failed to delete campaign:", error);
      setDeleteError(error.message || "Failed to delete campaign");
      setDeleteDialogOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const [lastEventId, setLastEventId] = useState<string>("0");

  const connectToCampaignStream = (id: string) => {
    if (activeEventSource) {
      activeEventSource.close();
    }

    const protocol = window.location.protocol === "https:" ? "https:" : "http:";
    const backendUrl = "web-production-737b.up.railway.app";
    // Passing last_id=0 initially fetches all history, ensuring UI is restored on refresh
    const sseUrl = `${protocol}//${backendUrl}/sse/campaign/${id}?last_id=${lastEventId}`;

    console.log("[Stream] Connecting to Campaign SSE (Last ID: " + lastEventId + "):", sseUrl);
    const eventSource = new EventSource(sseUrl);
    setActiveEventSource(eventSource);

    eventSource.onopen = () => {
      setRapidStatus("Processing…");
    };

    eventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        // Update lastEventId for resumption
        if (event.lastEventId) {
          setLastEventId(event.lastEventId);
        }

        // Skip connection messages
        if (message.type === "connected") {
          return;
        }
        
        console.log("[Stream] Message received:", message.type);

        if (message.type === "campaign_start") {
          setIsRapidAllRunning(true);
          setRapidAllTotal(message.data.total_companies || 0);
          setRapidAllProgress(0);
          // Only clear logs if we are NOT in a catch-up/reconnection phase
          // (i.e., if this is a fresh start of a run)
          // Simple heuristic: if we already have logs, don't clear them
          if (activityLogsRef.current.length === 0) {
            setActivityLogs([]);
            activityLogsRef.current = [];
          }
        }
        if (message.type === "company_processing") {
          const { company_id, company_name } = message.data;
          if (company_id) {
            setProcessingCompanyId(company_id);
            if (company_name) setRapidCurrentCompany(company_name);
            setCompanies((prev) =>
              prev.map((c) =>
                c.id === company_id ? { ...c, status: "processing" } : c
              )
            );
          }
        }
        if (message.type === "activity") {
          const log: ActivityLog = message.data;
          setActivityLogs((prev) => {
            // Avoid duplicate logs if they come through catch-up
            // (Standard EventSource shouldn't, but safety first)
            const isDuplicate = prev.some(l => l.timestamp === log.timestamp && l.message === log.message);
            if (isDuplicate) return prev;

            const newLogs = [...prev, log].slice(-100); // Increased to 100 for better history
            activityLogsRef.current = newLogs;
            return newLogs;
          });
          setRapidStatus("Processing...");
        }

        if (message.type === "company_completed") {
          const { company_id, status, screenshot_url, progress } = message.data;
          processingCompanyIdRef.current = null;
          setProcessingCompanyId(null);
          setCompanies((prev) =>
            prev.map((c) =>
              c.id === company_id ? { ...c, status, screenshot_url } : c
            )
          );
          setRapidAllProgress((prev) => prev + 1);
          setRapidProgress(progress);
        }

        if (message.type === "campaign_complete") {
          setIsRapidAllRunning(false);
          setRapidStatus("Campaign Complete!");
          fetchCampaignDetails(true);
        }

        if (message.type === "campaign_stopped") {
          processingCompanyIdRef.current = null;
          setIsRapidAllRunning(false);
          setIsStopping(false);
          setRapidStatus("Stopped");
          fetchCampaignDetails(true);
        }

        if (message.type === "error") {
          console.error("[Stream] Error:", message.data);
          setRapidStatus(`Error: ${message.data.message}`);
        }
      } catch (e) {
        console.error("[Stream] Failed to parse message:", e);
      }
    };

    eventSource.onerror = (err) => {
      console.error("[Stream] SSE error:", err);
      // EventSource will auto-reconnect using Last-Event-ID automatically
    };

    return eventSource;
  };

  const handleRapidProcess = async (companyId: number) => {
    // Update single process to use new sequential logic but only for this company
    try {
      setProcessingCompanyId(companyId);
      setRapidCurrentCompany(
        companies.find((c) => c.id === companyId)?.company_name || "Company"
      );

      // Connect to stream first
      connectToCampaignStream(campaignId);

      // Call batch endpoint with just this ID
      const response = await fetch(
        `/api/campaigns/${campaignId}/rapid-process-batch`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ company_ids: [companyId] }),
        }
      );

      if (!response.ok) throw new Error("Failed to start processing");
    } catch (error: any) {
      console.error("Failed to start rapid processing:", error);
      alert(`Error: ${error.message}`);
      setProcessingCompanyId(null);
    }
  };

  const emergencyStopAll = () => {
    console.log("[EMERGENCY STOP] Forcefully stopping all processing");

    // Close active EventSource
    if (activeEventSource) {
      try {
        activeEventSource.close();
      } catch (e) {
        console.error("Error closing EventSource:", e);
      }
      setActiveEventSource(null);
    }

    // Reset all processing states
    setProcessingCompanyId(null);
    setRapidProgress(0);
    setRapidStatus("");
    setRapidCurrentCompany("");
    setAutoStarted(false);
    setIsRapidAllRunning(false); // Stop Rapid All

    // Clear localStorage auto-start flag
    localStorage.removeItem(`campaign_${campaignId}_autostarted`);

    // Refresh data
    fetchCampaignDetails();
  };

  // Convert technical errors to user-friendly messages
  const getUserFriendlyError = (errorMessage: string): string => {
    if (!errorMessage || typeof errorMessage !== "string") {
      return "Processing failed. Please try again.";
    }

    // Log raw error for debugging
    if (errorMessage && !errorMessage.includes("success")) {
      console.log(`[Campaign Error] Raw message: "${errorMessage}"`);
    }

    const msg = errorMessage.toLowerCase().trim();

    // Empty or very short messages
    if (msg.length < 3) {
      return "Processing failed. Please try again.";
    }

    // Successful processing outcomes (no form / no contact) — show clear result, not "failed"
    if (
      msg.includes("no contact form") ||
      msg.includes("no contact found") ||
      msg.includes("no contact or email") ||
      msg.includes("no form found")
    ) {
      return "No contact form found on this site.";
    }
    if (
      msg.includes("no contact") &&
      msg.includes("email") &&
      msg.includes("found")
    ) {
      return "No contact form found; contact emails were found on the page.";
    }

    if (msg.includes("attributeerror") || msg.includes("has no attribute")) {
      return "System error: Data missing or invalid format.";
    }

    // Backend internal error (e.g. NoneType subscript) — suggest retry
    if (
      msg.includes("subscriptable") ||
      (msg.includes("nonetype") && msg.includes("object"))
    ) {
      return "Internal processing error. You can retry this company.";
    }

    if (
      msg.includes("connectionerror") ||
      msg.includes("max retries exceeded")
    ) {
      return "Network error: Could not reach the destination site.";
    }

    if (
      msg.includes("playwright") ||
      msg.includes("browser") ||
      msg.includes("chromium")
    ) {
      return "Processing system busy. Please try again in 5 seconds.";
    }

    if (msg.includes("blocked") || msg.includes("block")) {
      return "Access blocked. This website is preventing automated access.";
    }

    if (msg.includes("cookie") || msg.includes("session")) {
      return "Session error. Please try again.";
    }

    if (
      msg.includes("javascript") ||
      msg.includes("js error") ||
      msg.includes("script error")
    ) {
      return "Website script error. The site may not be fully loaded.";
    }

    if (msg.includes("database") || msg.includes("db") || msg.includes("sql")) {
      return "Data storage error. Please try again or contact support.";
    }

    if (
      msg.includes("typeerror") ||
      msg.includes("valueerror") ||
      msg.includes("keyerror")
    ) {
      return "Processing data error. Please try again.";
    }

    // Only show "Missing data" for short/null-like messages, not for Python "NoneType" (handled above)
    if (
      (msg.includes("undefined") || msg.includes("null")) &&
      !msg.includes("nonetype")
    ) {
      return "Missing data error. Please try again.";
    }

    if (
      msg.includes("json") ||
      msg.includes("parse") ||
      msg.includes("serialize")
    ) {
      return "Data format error. Please try again.";
    }

    if (
      msg.includes("file") &&
      (msg.includes("not found") ||
        msg.includes("cannot") ||
        msg.includes("error"))
    ) {
      return "File error. Please try again.";
    }

    // Default fallback - make it more friendly
    return "Processing failed. Please try again or contact support if the problem continues.";
  };

  const dailyLimitReached =
    dailyUsage !== null &&
    !dailyUsage.unlimited &&
    (dailyUsage.daily_remaining ?? 0) <= 0;

  const startRapidAll = () => {
    const pendingCompanies = companies.filter((c) => c.status === "pending");

    if (pendingCompanies.length === 0) {
      alert("No pending companies to process!");
      return;
    }
    if (dailyLimitReached) {
      alert("Daily limit reached. Resets at midnight UTC.");
      return;
    }

    // Guests get automatic limit, no modal
    if (!user) {
      const cap =
        dailyUsage?.daily_remaining != null
          ? Math.min(5, dailyUsage.daily_remaining)
          : 5;
      handleStartRapidAllWithLimit(cap);
      return;
    }

    // Show modal to let authenticated users set custom limit
    setRapidAllModalOpen(true);
  };

  const handleStartRapidAllWithLimit = async (limit: number) => {
    try {
      setRapidAllModalOpen(false);
      setActivityLogs([]);
      activityLogsRef.current = [];

      const pendingIds = companies
        .filter((c) => c.status === "pending")
        .slice(0, limit)
        .map((c) => c.id);

      // Show first company as "Processing" immediately when user clicks Start
      const firstId = pendingIds.length > 0 ? pendingIds[0] : null;
      if (firstId != null) {
        processingCompanyIdRef.current = firstId; // sync ref before any async so in-flight fetch merge preserves "processing"
        setCompanies((prev) =>
          prev.map((c) =>
            c.id === firstId ? { ...c, status: "processing" as const } : c
          )
        );
        setProcessingCompanyId(firstId);
        const firstName =
          companies.find((c) => c.id === firstId)?.company_name || "Company";
        setRapidCurrentCompany(firstName);
      }

      connectToCampaignStream(campaignId);

      const response = await fetch(
        `/api/campaigns/${campaignId}/rapid-process-batch`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ company_ids: pendingIds }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg =
          errorData.message || errorData.error || "Failed to start campaign";
        throw new Error(msg);
      }

      const data = await response.json();
      console.log("[Rapid All] Started:", data);

      const count = pendingIds.length;
      setIsRapidAllRunning(true);
      setRapidAllTotal(count);
      setRapidAllProgress(0);
      setRapidStatus("Processing...");
      // Rely on optimistic "processing" for first company; main poll (every 6s) will sync real status
    } catch (error: any) {
      console.error("Failed to start rapid all:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleStopCampaign = async () => {
    if (isStopping) return;

    try {
      setIsStopping(true);
      setRapidStatus("Stopping...");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);
      const response = await fetch(`/api/campaigns/${campaignId}/stop`, {
        method: "POST",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to stop campaign");
      }

      console.log(
        "[Stop] Stopping requested — current company may finish, then campaign stops."
      );
      fetchCampaignDetails(true);
    } catch (error: any) {
      console.error("Failed to stop campaign:", error);
      alert(
        error?.name === "AbortError"
          ? "Request timed out. Stop was sent; campaign will stop after the current company finishes."
          : `Error: ${error.message}`
      );
      setIsStopping(false);
    }
  };

  const handleResetStuck = async () => {
    if (resettingStuck) return;
    try {
      setResettingStuck(true);
      const response = await fetch(`/api/campaigns/${campaignId}/reset-stuck`, {
        method: "POST",
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to reset stuck companies");
      }
      const data = await response.json();
      const count = data.reset_count ?? data.n;
      if (count !== undefined && count > 0) {
        console.log(`[Reset Stuck] Cleared ${count} stuck company/companies to pending`);
      }
      fetchCampaignDetails(true);
    } catch (error: any) {
      console.error("Reset stuck failed:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setResettingStuck(false);
    }
  };

  const handleRetryFailed = async () => {
    const failedCompanies = companies.filter((c) => c.status === "failed");

    if (failedCompanies.length === 0) {
      alert("No failed companies to retry");
      return;
    }

    try {
      setRetryFailedModalOpen(false);
      setActivityLogs([]);
      activityLogsRef.current = [];

      // Connect to stream
      connectToCampaignStream(campaignId);

      // Trigger sequential processing for failed IDs
      const failedIds = failedCompanies.map((c) => c.id);

      const response = await fetch(
        `/api/campaigns/${campaignId}/rapid-process-batch`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ company_ids: failedIds }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg =
          errorData.message || errorData.error || "Failed to start retry";
        throw new Error(msg);
      }

      console.log("[Retry] Started batch processing for failed companies");
    } catch (error: any) {
      console.error("Failed to retry failed companies:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleExport = async (options: any) => {
    try {
      setIsExporting(true);

      // Build export URL with options
      const params = new URLSearchParams({
        completedColor: options.completedColor,
        failedColor: options.failedColor,
        includeComments: options.includeComments.toString(),
        commentStyle: options.commentStyle,
      });

      const exportUrl = `/api/campaigns/${campaignId}/export?${params}`;

      // Create a temporary link to trigger download
      const link = document.createElement("a");
      link.href = exportUrl;
      link.download = `${campaign?.name || "campaign"}_results.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportModalOpen(false);
    } catch (error: any) {
      console.error("Failed to export campaign:", error);
      alert(`Failed to export campaign: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // DISABLED: No auto-start. User must manually click "Rapid" for each company.
  // This prevents infinite loops and unwanted processing.

  // Display name: use company_name unless it looks like a country (wrong CSV column)
  const getCompanyDisplayName = (c: Company): string => {
    const name = (c.company_name || "").trim();
    const countryLike = [
      "england",
      "united kingdom",
      "uk",
      "scotland",
      "wales",
      "usa",
      "united states",
      "us",
      "south africa",
      "australia",
      "canada",
      "ireland",
      "germany",
      "france",
      "netherlands",
      "spain",
      "italy",
    ];
    if (name && !countryLike.includes(name.toLowerCase())) return name;
    const url = (c.website_url || "").trim();
    if (!url) return "Company";
    try {
      const u = new URL(url.startsWith("http") ? url : `https://${url}`);
      const host = (u.hostname || "").replace(/^www\./, "");
      return host || "Company";
    } catch {
      return url || "Company";
    }
  };

  const filteredCompanies = companies.filter((company) => {
    const statusMatch =
      filterStatus === "all" ? true : company.status === filterStatus;
    const methodMatch =
      filterMethod === "all" ? true : company.detection_method === filterMethod;
    return statusMatch && methodMatch;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCompanies = filteredCompanies.slice(startIndex, endIndex);

  // Calculate real-time statistics from companies array
  // PROCESSED = finished only (exclude "processing" so the count adds up: processed = success + failed + no_contact + captcha)
  const stats = useMemo(() => {
    const total = campaign?.total_companies || companies.length;
    const terminalStatuses = [
      "completed",
      "success",
      "contact_info_found",
      "failed",
      "no_contact_found",
      "captcha",
    ];
    const processed = companies.filter((c) =>
      terminalStatuses.includes(c.status)
    ).length;
    const success = companies.filter(
      (c) =>
        c.status === "completed" ||
        c.status === "success" ||
        c.status === "contact_info_found"
    ).length;
    const contactInfoFound = companies.filter(
      (c) => c.status === "contact_info_found"
    ).length;
    const failed = companies.filter((c) => c.status === "failed").length;
    const captcha = companies.filter((c) => c.status === "captcha").length;
    const progress =
      total > 0 ? Math.round((processed / total) * 100) : 0;

    return {
      total,
      processed,
      success,
      contactInfoFound,
      failed,
      captcha,
      progress,
    };
  }, [companies, campaign]);

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterMethod]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-emerald-400";
      case "contact_info_found":
        return "text-cyan-400";
      case "no_contact_found":
        return "text-slate-400";
      case "processing":
        return "text-blue-400";
      case "failed":
        return "text-rose-400";
      case "captcha":
        return "text-amber-400";
      case "success":
        return "text-emerald-400";
      default:
        return "text-white";
    }
  };

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case "completed":
      case "success":
        return "bg-emerald-400";
      case "contact_info_found":
        return "bg-cyan-400";
      case "no_contact_found":
        return "bg-slate-500";
      case "processing":
        return "bg-blue-400";
      case "failed":
        return "bg-rose-400";
      case "captcha":
        return "bg-amber-400";
      default:
        return "bg-gray-400"; // pending, queued, etc.
    }
  };

  const getStatusIcon = (status: string) => {
    const iconClass = "w-3.5 h-3.5";
    switch (status) {
      case "completed":
      case "success":
        return <CheckCircle className={iconClass} />;
      case "contact_info_found":
        return <Eye className={iconClass} />;
      case "no_contact_found":
        return <Search className={iconClass} />;
      case "processing":
        return <Loader className={`${iconClass} animate-spin`} />;
      case "failed":
        return <XCircle className={iconClass} />;
      case "captcha":
        return (
          <ShieldAlert
            className={iconClass}
            aria-label="Form has CAPTCHA — flagged"
          />
        );
      default:
        return <Clock className={iconClass} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black pt-24">
        <Loader className="w-4 h-4 animate-spin text-white" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black pt-24">
        <p className="text-white text-sm">Campaign not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-8">
      <div className="max-w-[1400px] mx-auto">
        {deleteError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-200 rounded-lg flex items-start justify-between gap-3">
            <p className="text-sm font-medium flex-1">
              Could not delete campaign. {deleteError}
            </p>
            <button
              type="button"
              onClick={() => setDeleteError(null)}
              className="text-red-300 hover:text-white p-1 rounded transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-gray-900">
          <button
            onClick={() => router.push("/campaigns")}
            className="group flex items-center gap-2 text-white hover:text-white text-xs mb-4 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Back to campaigns
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Activity className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h1 className="text-sm font-medium text-white tracking-tight mb-0.5">
                  {campaign.name}
                </h1>
                <p
                  className={`text-[11px] font-mono capitalize ${getStatusColor(
                    campaign.status
                  )}`}
                >
                  {campaign.status}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {dailyUsage && (
                <span className="text-[11px] text-gray-400 mr-1">
                  Today:{" "}
                  <span className="text-white font-medium">
                    {dailyUsage.daily_used}
                  </span>
                  {dailyUsage.unlimited ? "" : ` / ${dailyUsage.daily_limit}`}{" "}
                  companies
                  {dailyLimitReached && (
                    <span className="text-amber-400 ml-1">(limit reached)</span>
                  )}
                  {!dailyUsage.unlimited && dailyUsage.daily_limit === 5 && (
                    <span
                      className="text-gray-500 ml-1"
                      title="Guest tier: 5 companies per campaign and 5 per day. Sign up free for 50."
                    >
                      — Guest limit
                    </span>
                  )}
                </span>
              )}
              <button
                onClick={() => fetchCampaignDetails()}
                disabled={refreshing}
                className="p-2 hover:bg-gray-900 text-white hover:text-white transition-all duration-200 disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
                />
              </button>
              {companies.filter((c) => c.status === "pending").length > 0 && (
                <button
                  onClick={startRapidAll}
                  disabled={
                    isRapidAllRunning ||
                    processingCompanyId !== null ||
                    dailyLimitReached
                  }
                  className="group flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Activity className="w-3.5 h-3.5" />
                  {isRapidAllRunning || processingCompanyId !== null
                    ? "Processing…"
                    : `Rapid All (${Math.min(
                        companies.filter((c) => c.status === "pending").length,
                        campaignLimit === Infinity
                          ? companies.filter((c) => c.status === "pending")
                              .length
                          : campaignLimit
                      )}${
                        campaignLimit !== Infinity ? `/${campaignLimit}` : ""
                      })`}
                </button>
              )}
              {(isRapidAllRunning || processingCompanyId !== null) && (
                <button
                  onClick={handleStopCampaign}
                  disabled={isStopping}
                  className="group flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isStopping ? "Stopping..." : "Stop campaign"}
                </button>
              )}
              {companies.filter((c) => c.status === "processing").length > 0 &&
                !isRapidAllRunning &&
                processingCompanyId === null && (
                  <button
                    onClick={handleResetStuck}
                    disabled={resettingStuck}
                    className="group flex items-center gap-2 px-4 py-2 bg-slate-500/20 hover:bg-slate-500/30 text-slate-300 text-xs font-medium transition-colors rounded-lg border border-slate-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    {resettingStuck
                      ? "Resetting..."
                      : `Reset stuck (${companies.filter((c) => c.status === "processing").length})`}
                  </button>
                )}
              {companies.filter((c) => c.status === "failed").length > 0 && (
                <button
                  onClick={() => setRetryFailedModalOpen(true)}
                  disabled={isRapidAllRunning || processingCompanyId !== null}
                  className="group flex items-center gap-2 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-xs font-medium transition-colors rounded-lg border border-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retry failed (
                  {companies.filter((c) => c.status === "failed").length})
                </button>
              )}
              <button
                onClick={() => setExportModalOpen(true)}
                className="group flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-medium transition-colors rounded-lg"
              >
                <Download className="w-3.5 h-3.5" />
                Export Results
              </button>
              <button
                onClick={() => setDeleteDialogOpen(true)}
                disabled={deleting}
                className="group flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-400 text-xs font-medium hover:bg-rose-500/20 transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed border border-rose-500/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {deleting ? "Deleting..." : "Delete Campaign"}
              </button>
            </div>
          </div>
        </div>

        {/* Processing in progress */}
        {(isRapidAllRunning || processingCompanyId !== null) && (
          <div className="mb-8">
            <div className="border border-white/10 rounded-lg p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  <span className="text-sm text-white">
                    Processing...
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-white/70">
                    {stats.processed} / {stats.total}
                  </span>
                  <button
                    onClick={handleStopCampaign}
                    disabled={isStopping}
                    className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white text-xs font-medium rounded border border-rose-500/30 disabled:opacity-50"
                  >
                    {isStopping ? "Stopping..." : "Stop"}
                  </button>
                </div>
              </div>
              <div className="mt-3 w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${stats.progress}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Stats - Calculate from companies array for real-time updates */}
        <div className="grid grid-cols-6 gap-4 mb-8">
          {[
            {
              label: "Total",
              value: stats.total,
              color: "text-white",
              bg: "https://images.unsplash.com/photo-1557683316-973673baf926?w=400&h=200&fit=crop",
            },
            {
              label: "Processed",
              value: stats.processed,
              color: "text-white",
              bg: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=200&fit=crop",
            },
            {
              label: "Success",
              value: stats.success,
              color: "text-emerald-400",
              bg: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400&h=200&fit=crop",
            },
            {
              label: "Contact Info",
              value: stats.contactInfoFound,
              color: "text-blue-400",
              bg: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=200&fit=crop",
            },
            {
              label: "Failed",
              value: stats.failed,
              color: "text-rose-400",
              bg: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=200&fit=crop",
            },
            {
              label: "CAPTCHA",
              value: stats.captcha,
              color: "text-amber-400",
              bg: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=400&h=200&fit=crop",
            },
            {
              label: "Progress",
              value: `${stats.progress}%`,
              color: "text-white",
              bg: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=200&fit=crop",
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="relative border border-white/30 p-4 hover:border-white/50 transition-colors overflow-hidden group"
            >
              <div
                className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity"
                style={{ backgroundImage: `url(${stat.bg})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="relative z-10">
                <div className="text-[10px] text-white mb-2 uppercase tracking-wider">
                  {stat.label}
                </div>
                <div className={`text-2xl font-mono ${stat.color}`}>
                  {stat.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Companies */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs text-white font-medium">
              Companies ({filteredCompanies.length})
            </h2>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 bg-black border border-gray-900 text-xs text-white
                       hover:border-gray-800 focus:border-white focus:outline-none transition-colors"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="success">Success</option>
              <option value="contact_info_found">Contact Info Found</option>
              <option value="failed">Failed</option>
              <option value="captcha">CAPTCHA</option>
            </select>
            <select
              value={filterMethod || "all"}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="px-3 py-1.5 bg-black border border-gray-900 text-xs text-white
                       hover:border-gray-800 focus:border-white focus:outline-none transition-colors ml-2"
            >
              <option value="all">All Methods</option>
              <option value="form_submitted">Form Submitted</option>
              <option value="contact_page_only">Contact Page Only</option>
              <option value="form_with_captcha">CAPTCHA Detected</option>
              <option value="no_contact_found">No Contact Found</option>
            </select>
          </div>

          {/* Table Container */}
          <div className="border border-white/20 rounded-lg overflow-hidden">
            {/* Column Headers */}
            <div className="grid grid-cols-[1fr_140px_200px_80px_200px] gap-4 px-4 py-3 bg-white/5 border-b border-white/10">
              <div className="text-[10px] text-white uppercase tracking-wider">
                Company
              </div>
              <div className="text-[10px] text-white uppercase tracking-wider">
                Status
              </div>
              <div className="text-[10px] text-white uppercase tracking-wider">
                Details
              </div>
              <div className="text-[10px] text-white uppercase tracking-wider text-center">
                Screenshot
              </div>
              <div className="text-[10px] text-white uppercase tracking-wider text-center">
                Actions
              </div>
            </div>

            {/* Table Rows - Paginated */}
            <div>
              {paginatedCompanies.map((company, idx) => (
                <div
                  key={company.id}
                  onMouseEnter={() => setHoveredRow(company.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  className={`
                  group relative grid grid-cols-[1fr_140px_200px_80px_200px] gap-4 items-center
                  px-4 py-4 transition-all duration-150
                  ${idx % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent"}
                  ${hoveredRow === company.id ? "bg-white/[0.05]" : ""}
                  ${idx === 0 ? "" : "border-t border-white/5"}
                `}
                >
                  {/* Company */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="min-w-0">
                      <div className="text-sm text-white truncate group-hover:text-white transition-colors">
                        {getCompanyDisplayName(company)}
                      </div>
                      <div className="text-[11px] font-mono truncate mt-0.5 flex items-center gap-1">
                        {company.website_url ? (
                          <>
                            <a
                              href={
                                company.website_url.startsWith("http")
                                  ? company.website_url
                                  : `https://${company.website_url}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 underline truncate inline-flex items-center gap-1"
                              title="Open in new tab"
                            >
                              {company.website_url}
                              <ExternalLink
                                className="w-3 h-3 shrink-0 opacity-80"
                                aria-hidden
                              />
                            </a>
                          </>
                        ) : (
                          <span className="text-white/60">—</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div
                    className={`flex items-center gap-2 ${getStatusColor(
                      company.status
                    )} ${company.status === "captcha" ? "font-semibold" : ""}`}
                  >
                    {getStatusIcon(company.status)}
                    <span className="text-xs capitalize">
                      {company.status === "no_contact_found"
                        ? "No contact found"
                        : company.status === "captcha"
                        ? "CAPTCHA (flagged)"
                        : company.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="text-xs text-white/80">
                    {company.status === "completed" ||
                    company.status === "success" ? (
                      <div className="space-y-0.5">
                        <div className="text-emerald-400">
                          ✓ Form submitted successfully
                        </div>
                        {company.fields_filled && (
                          <div className="text-emerald-300 text-[10px]">
                            {company.fields_filled} fields filled
                          </div>
                        )}
                        {company.detection_method && (
                          <div className="text-white/50 text-[9px]">
                            Method: {company.detection_method.replace("_", " ")}
                          </div>
                        )}
                      </div>
                    ) : company.status === "contact_info_found" ? (
                      <div className="space-y-0.5">
                        <div className="text-cyan-400">
                          ✓ Contact info extracted
                        </div>
                        <div className="text-white/60 text-[10px]">
                          Found alternative contact methods
                        </div>
                        {company.contact_info && (
                          <div className="text-cyan-300 text-[9px]">
                            {company.contact_info.emails?.length || 0} emails,{" "}
                            {company.contact_info.phones?.length || 0} phones
                          </div>
                        )}
                      </div>
                    ) : company.status === "captcha" ? (
                      <div className="space-y-0.5">
                        <div className="text-amber-400">
                          🤖 CAPTCHA detected
                        </div>
                        <div className="text-white/60 text-[10px]">
                          Manual intervention required
                        </div>
                        {company.detection_method && (
                          <div className="text-amber-300 text-[9px]">
                            Method: {company.detection_method.replace("_", " ")}
                          </div>
                        )}
                      </div>
                    ) : company.status === "no_contact_found" ? (
                      <div className="space-y-0.5">
                        <div className="text-slate-400">
                          No contact form found
                        </div>
                        <div className="text-white/50 text-[10px]">
                          {company.error_message ||
                            "This site had no contact form or submitable form."}
                        </div>
                      </div>
                    ) : company.error_message ? (
                      <div className="space-y-0.5">
                        <span className="text-rose-400 text-xs leading-relaxed">
                          {getUserFriendlyError(company.error_message)}
                        </span>
                        {company.detection_method &&
                          company.detection_method !== "unknown" && (
                            <div className="text-rose-300 text-[9px]">
                              Method:{" "}
                              {company.detection_method.replace("_", " ")}
                            </div>
                          )}
                      </div>
                    ) : company.status === "processing" ? (
                      <span className="text-blue-400">In progress...</span>
                    ) : company.contact_page_found ? (
                      <span className="text-white/60">
                        Contact form detected
                      </span>
                    ) : (
                      <span className="text-white/40">—</span>
                    )}
                  </div>

                  {/* Proof */}
                  <div className="flex justify-center">
                    {company.screenshot_url ? (
                      <button
                        onClick={() =>
                          setSelectedScreenshot(company.screenshot_url || null)
                        }
                        className="relative group/img"
                      >
                        <img
                          key={company.screenshot_url}
                          src={company.screenshot_url}
                          alt="Proof"
                          className="w-12 h-12 object-cover border border-gray-800 group-hover/img:border-white transition-colors"
                          crossOrigin={
                            company.screenshot_url.startsWith("http")
                              ? "anonymous"
                              : undefined
                          }
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                          <ImageIcon className="w-4 h-4 text-white" />
                        </div>
                      </button>
                    ) : (
                      <div className="w-12 h-12 border border-gray-900 flex items-center justify-center">
                        <span className="text-white text-xs">—</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3">
                    {company.status === "completed" ||
                    company.status === "contact_info_found" ? (
                      <>
                        <button
                          disabled
                          className="flex items-center gap-1.5 px-4 py-1.5 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 cursor-default"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          {company.status === "contact_info_found"
                            ? "Email sent"
                            : "Complete"}
                        </button>
                        <div
                          className={`w-2 h-2 rounded-full ${getStatusDotColor(
                            company.status
                          )}`}
                        />
                      </>
                    ) : company.status === "processing" ? (
                      <>
                        <div
                          className={`w-2 h-2 rounded-full ${getStatusDotColor(
                            company.status
                          )}`}
                        />
                      </>
                    ) : company.status === "failed" ? (
                      <>
                        <button
                          onClick={() => handleRapidProcess(company.id)}
                          disabled={
                            processingCompanyId !== null || isRapidAllRunning
                          }
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-black bg-white hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-600"
                        >
                          {processingCompanyId === company.id ? (
                            <Loader className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <RefreshCw className="w-3.5 h-3.5" />
                          )}
                          Retry
                        </button>
                        <div
                          className={`w-2 h-2 rounded-full ${getStatusDotColor(
                            company.status
                          )}`}
                        />
                      </>
                    ) : (
                      <>
                        <div
                          className={`w-2 h-2 rounded-full ${getStatusDotColor(
                            company.status
                          )}`}
                        />
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 px-4">
              <div className="text-xs text-gray-400">
                Page {currentPage} of {totalPages} • Showing {startIndex + 1}-
                {Math.min(endIndex, filteredCompanies.length)} of{" "}
                {filteredCompanies.length}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded text-xs transition-colors ${
                          currentPage === page
                            ? "bg-blue-500 text-white"
                            : "bg-white/10 hover:bg-white/20 text-white"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Screenshot Modal */}
      {selectedScreenshot && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-8 backdrop-blur-sm"
          onClick={() => setSelectedScreenshot(null)}
        >
          <div
            className="relative max-w-6xl max-h-[90vh] overflow-auto border border-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedScreenshot(null)}
              className="absolute top-4 right-4 p-2 bg-black/80 hover:bg-black text-white border border-gray-800 hover:border-white transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={selectedScreenshot}
              alt="Form submission proof"
              className="w-full h-auto"
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeleteError(null);
        }}
        onConfirm={handleDeleteCampaign}
        title="Delete Campaign Permanently"
        message={`Are you sure you want to delete "${campaign?.name}"? This will permanently delete the campaign and all ${campaign?.total_companies} companies. This action cannot be undone.`}
        variant="danger"
      />

      {/* Export Options Modal */}
      <ExportOptionsModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onExport={handleExport}
        campaignName={campaign?.name || "Campaign"}
        isExporting={isExporting}
      />

      {/* Rapid All Limit Modal */}
      <RetryFailedModal
        isOpen={retryFailedModalOpen}
        onClose={() => setRetryFailedModalOpen(false)}
        onRetry={handleRetryFailed}
        failedCount={stats.failed}
      />

      <RapidAllLimitModal
        isOpen={rapidAllModalOpen}
        onClose={() => setRapidAllModalOpen(false)}
        onStart={handleStartRapidAllWithLimit}
        maxAvailable={companies.filter((c) => c.status === "pending").length}
        maxSubscriptionTier={
          campaignLimit === Infinity ? 999999 : campaignLimit
        }
        subscriptionTier={user?.subscription_tier || "free"}
        isProcessing={isRapidAllRunning}
      />
    </div>
  );
}

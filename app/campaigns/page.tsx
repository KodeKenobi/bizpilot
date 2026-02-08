"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader, AlertCircle } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useUser } from "@/contexts/UserContext";
import { getAuthHeaders } from "@/lib/config";
import { motion, useInView } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

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
  started_at?: string;
  completed_at?: string;
}

function LandingPageContent({ router }: { router: any }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const section1Ref = useRef<HTMLDivElement>(null);
  const section2Ref = useRef<HTMLDivElement>(null);
  const section3Ref = useRef<HTMLDivElement>(null);
  const section4Ref = useRef<HTMLDivElement>(null);
  const useCasesRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero staggered animation
      gsap.from(".hero-title", {
        opacity: 0,
        y: 100,
        duration: 1.2,
        ease: "power4.out",
      });

      gsap.from(".hero-subtitle", {
        opacity: 0,
        y: 50,
        duration: 1,
        delay: 0.3,
        ease: "power3.out",
      });

      // Advanced scroll-triggered sections with parallax
      const sections = [
        {
          ref: section1Ref,
          imgClass: "section1-img",
          textClass: "section1-text",
        },
        {
          ref: section2Ref,
          imgClass: "section2-img",
          textClass: "section2-text",
        },
        {
          ref: section3Ref,
          imgClass: "section3-img",
          textClass: "section3-text",
        },
        {
          ref: section4Ref,
          imgClass: "section4-img",
          textClass: "section4-text",
        },
      ];

      sections.forEach(({ ref, imgClass, textClass }, index) => {
        if (ref.current) {
          const img = ref.current.querySelector(`.${imgClass}`);
          const text = ref.current.querySelector(`.${textClass}`);
          const overlay = ref.current.querySelector(".dark-overlay");

          // Main section animation with enhanced scrub
          gsap.fromTo(
            ref.current,
            { opacity: 0.1, y: 120, scale: 0.95 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 1.5,
              ease: "power4.out",
              scrollTrigger: {
                trigger: ref.current,
                start: "top 85%",
                end: "bottom 15%",
                toggleActions: "play reverse play reverse",
                scrub: 1.5,
              },
            }
          );

          // Dark overlay animation - more dramatic
          if (overlay) {
            gsap.to(overlay, {
              opacity: 0,
              duration: 1.2,
              ease: "power2.out",
              scrollTrigger: {
                trigger: ref.current,
                start: "top 75%",
                end: "bottom 25%",
                toggleActions: "play reverse play reverse",
              },
            });
          }

          // Image parallax effect - contained within bounds
          if (img) {
            gsap.fromTo(
              img,
              { scale: 1.15, y: 30, rotateY: 8 },
              {
                scale: 1,
                y: 0,
                rotateY: 0,
                duration: 2,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: ref.current,
                  start: "top 85%",
                  end: "bottom 15%",
                  scrub: 2.5,
                },
              }
            );
          }

          // Text slide animation - subtle and contained
          if (text) {
            gsap.fromTo(
              text,
              { opacity: 0, x: index % 2 === 0 ? -40 : 40, scale: 0.95 },
              {
                opacity: 1,
                x: 0,
                scale: 1,
                duration: 1.2,
                ease: "power4.out",
                scrollTrigger: {
                  trigger: ref.current,
                  start: "top 75%",
                },
              }
            );
          }
        }
      });

      // Use Cases section animation
      if (useCasesRef.current) {
        gsap.from(".use-case-title", {
          opacity: 0,
          y: 50,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: useCasesRef.current,
            start: "top 80%",
          },
        });

        gsap.from(".use-case-card", {
          opacity: 0,
          y: 60,
          stagger: 0.2,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: useCasesRef.current,
            start: "top 75%",
          },
        });
      }

      // Final CTA animation
      if (ctaRef.current) {
        gsap.from(".cta-heading", {
          opacity: 0,
          scale: 0.9,
          duration: 1,
          ease: "back.out(1.2)",
          scrollTrigger: {
            trigger: ctaRef.current,
            start: "top 80%",
          },
        });

        gsap.from(".cta-description", {
          opacity: 0,
          y: 30,
          duration: 0.8,
          delay: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ctaRef.current,
            start: "top 80%",
          },
        });

        gsap.from(".cta-button", {
          opacity: 0,
          scale: 0.8,
          duration: 0.6,
          delay: 0.4,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: ctaRef.current,
            start: "top 80%",
          },
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef}>
      {/* Hero Section */}
      <div className="min-h-[80vh] flex items-center justify-center mb-32">
        <div className="text-center max-w-4xl">
          <h1 className="hero-title text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Automate Business Outreach at Scale
          </h1>
          <p className="hero-subtitle text-2xl text-gray-300 mb-12 leading-relaxed">
            Send personalized messages to hundreds of companies automatically.
            AI-powered form filling that saves you hours of manual work.
          </p>
          <button
            onClick={() => router.push("/campaigns/upload")}
            className="px-6 py-2 bg-blue-600 text-white text-lg font-medium hover:bg-blue-700 transition-all rounded-full border border-blue-500/30"
          >
            Start Your First Campaign
          </button>
        </div>
      </div>

      {/* Section 1: Upload & Scale */}
      <div
        ref={section1Ref}
        className="grid md:grid-cols-2 gap-20 items-center mb-32 relative"
      >
        <div className="dark-overlay absolute inset-0 bg-black/70 pointer-events-none rounded-lg" />
        <div className="order-2 md:order-1 relative z-10 overflow-hidden rounded-lg">
          <img
            src="https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Modern office workspace"
            className="section1-img rounded-lg w-full h-[400px] object-cover"
          />
        </div>
        <div className="section1-text order-1 md:order-2 relative z-20 px-4">
          <h2 className="text-4xl font-bold text-white mb-6">
            Upload Once, Reach Hundreds
          </h2>
          <p className="text-xl text-gray-300 mb-6 leading-relaxed">
            Simply upload a CSV or Excel spreadsheet with company names and
            websites. No complex setup, no technical knowledge required.
          </p>
          <p className="text-xl text-gray-300 leading-relaxed">
            The system processes 5 to 500+ companies depending on your plan.
            What would take days of manual work happens in minutes.
          </p>
        </div>
      </div>

      {/* Section 2: AI Automation */}
      <div
        ref={section2Ref}
        className="grid md:grid-cols-2 gap-20 items-center mb-32 relative"
      >
        <div className="dark-overlay absolute inset-0 bg-black/70 pointer-events-none rounded-lg" />
        <div className="section2-text relative z-20 px-4">
          <h2 className="text-4xl font-bold text-white mb-6">
            AI Finds and Fills Every Form
          </h2>
          <p className="text-xl text-gray-300 mb-6 leading-relaxed">
            Our intelligent bot navigates to each company's website, locates
            their contact form, and fills it out automatically.
          </p>
          <p className="text-xl text-gray-300 leading-relaxed">
            It adapts to different layouts, handles various field types, and
            submits everything without human intervention.
          </p>
        </div>
        <div className="relative z-10 overflow-hidden rounded-lg">
          <img
            src="https://images.unsplash.com/photo-1495592822108-9e6261896da8?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="AI automation"
            className="section2-img rounded-lg w-full h-[400px] object-cover"
          />
        </div>
      </div>

      {/* Section 3: Screenshot Proof */}
      <div
        ref={section3Ref}
        className="grid md:grid-cols-2 gap-20 items-center mb-32 relative"
      >
        <div className="dark-overlay absolute inset-0 bg-black/70 pointer-events-none rounded-lg" />
        <div className="order-2 md:order-1 relative z-10 overflow-hidden rounded-lg">
          <img
            src="https://images.unsplash.com/photo-1664854953181-b12e6dda8b7c?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Data visualization"
            className="section3-img rounded-lg w-full h-[400px] object-cover"
          />
        </div>
        <div className="section3-text order-1 md:order-2 relative z-20 px-4">
          <h2 className="text-4xl font-bold text-white mb-6">
            Visual Proof of Every Submission
          </h2>
          <p className="text-xl text-gray-300 mb-6 leading-relaxed">
            Every form submission is captured with a screenshot. You see exactly
            what was sent, when it was sent, and to whom.
          </p>
          <p className="text-xl text-gray-300 leading-relaxed">
            Complete transparency and accountability. No guessing if your
            message reached its destination.
          </p>
        </div>
      </div>

      {/* Section 4: Real-time Tracking */}
      <div
        ref={section4Ref}
        className="grid md:grid-cols-2 gap-20 items-center mb-32 relative"
      >
        <div className="dark-overlay absolute inset-0 bg-black/70 pointer-events-none rounded-lg" />
        <div className="section4-text relative z-20 px-4">
          <h2 className="text-4xl font-bold text-white mb-6">
            Track Everything in Real-Time
          </h2>
          <p className="text-xl text-gray-300 mb-6 leading-relaxed">
            Monitor your campaign as it runs. See success rates, failed
            attempts, and detailed status updates for each company.
          </p>
          <p className="text-xl text-gray-300 leading-relaxed">
            Pause, resume, or adjust campaigns on the fly. Full control at every
            step.
          </p>
        </div>
        <div className="relative z-10 overflow-hidden rounded-lg">
          <img
            src="https://images.unsplash.com/photo-1647356191320-d7a1f80ca777?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Real-time dashboard"
            className="section4-img rounded-lg w-full h-[400px] object-cover"
          />
        </div>
      </div>

      {/* Who It's For */}
      <div ref={useCasesRef} className="mb-32">
        <h2 className="use-case-title text-5xl font-bold text-white mb-16 text-center">
          Built For Growth Teams
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="use-case-card relative overflow-hidden bg-[#1a1a1a] border border-gray-800 rounded-lg p-8 group">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-20 transition-opacity duration-500"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&q=80')",
              }}
            />
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-white mb-4">
                Sales Teams
              </h3>
              <p className="text-lg text-gray-300">
                Reach hundreds of prospects daily. Let automation handle the
                grunt work while you focus on closing deals.
              </p>
            </div>
          </div>
          <div className="use-case-card relative overflow-hidden bg-[#1a1a1a] border border-gray-800 rounded-lg p-8 group">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-20 transition-opacity duration-500"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80')",
              }}
            />
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-white mb-4">Agencies</h3>
              <p className="text-lg text-gray-300">
                Scale client outreach without hiring more people. Process volume
                that would normally require a full team.
              </p>
            </div>
          </div>
          <div className="use-case-card relative overflow-hidden bg-[#1a1a1a] border border-gray-800 rounded-lg p-8 group">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-20 transition-opacity duration-500"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&q=80')",
              }}
            />
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-white mb-4">Founders</h3>
              <p className="text-lg text-gray-300">
                Bootstrap your way to traction. Compete with companies 10x your
                size in market reach and volume.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div ref={ctaRef} className="text-center py-20 border-t border-gray-800">
        <h2 className="cta-heading text-5xl font-bold text-white mb-8">
          Ready to 10x Your Outreach?
        </h2>
        <p className="cta-description text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
          Stop wasting hours on manual form filling. Start your first campaign
          and see results today.
        </p>
        <button
          onClick={() => router.push("/campaigns/upload")}
          className="cta-button px-4 py-1.5 bg-blue-600 text-white text-sm font-normal hover:bg-blue-700 transition-all rounded-full"
        >
          Create Campaign Now
        </button>
        <p className="text-gray-400 mt-6">
          5 minute setup • No credit card required
        </p>
      </div>
    </div>
  );
}

export default function CampaignsPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<number | null>(null);
  const [dailyUsage, setDailyUsage] = useState<{
    daily_limit: number;
    daily_used: number;
    daily_remaining: number | null;
    unlimited: boolean;
  } | null>(null);

  useEffect(() => {
    if (!userLoading) {
      fetchCampaigns();
      fetchUsage();
    }
  }, [userLoading]);

  const fetchUsage = async () => {
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
  };

  const fetchCampaigns = async () => {
    try {
      setLoading(true);

      // For guests: use session_id from localStorage if present; otherwise let server recover from cookie + Supabase
      const sessionId =
        typeof window !== "undefined"
          ? localStorage.getItem("guest_session_id")
          : null;
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("auth_token")
          : null;
      const url = token
        ? "/api/campaigns"
        : sessionId
        ? `/api/campaigns?session_id=${encodeURIComponent(sessionId)}`
        : "/api/campaigns";

      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) Object.assign(headers, getAuthHeaders(token));

      const response = await fetch(url, { credentials: "include", headers });
      if (!response.ok) {
        throw new Error("Failed to fetch campaigns");
      }
      const data = await response.json();
      setCampaigns(data.campaigns || []);
      setError(null);
      // Sync localStorage when server recovered session from cookie (so future requests use it)
      if (data.recovered_session_id && typeof window !== "undefined") {
        localStorage.setItem("guest_session_id", data.recovered_session_id);
      }
    } catch (err: any) {
      console.error("Failed to fetch campaigns:", err);
      setError(err.message || "Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (campaignId: number) => {
    setCampaignToDelete(campaignId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!campaignToDelete) return;

    try {
      const response = await fetch(`/api/campaigns/${campaignToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete campaign");
      }

      fetchCampaigns();
      setCampaignToDelete(null);
    } catch (err: any) {
      console.error("Failed to delete campaign:", err);
      setError(err.message || "Failed to delete campaign");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-emerald-400";
      case "processing":
        return "text-blue-400";
      case "queued":
        return "text-purple-400";
      case "failed":
        return "text-rose-400";
      case "paused":
        return "text-amber-400";
      default:
        return "text-white";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pt-24">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-6 h-6 animate-spin text-blue-400" />
          <span className="text-sm text-gray-300 font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  // Calculate stats for dashboard
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(
    (c) => c.status === "processing"
  ).length;
  const completedCampaigns = campaigns.filter(
    (c) => c.status === "completed"
  ).length;
  const totalCompanies = campaigns.reduce(
    (sum, c) => sum + c.total_companies,
    0
  );
  const totalProcessed = campaigns.reduce(
    (sum, c) => sum + c.processed_count,
    0
  );
  const totalSuccess = campaigns.reduce((sum, c) => sum + c.success_count, 0);

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Campaigns</h1>
              <p className="text-sm text-gray-400">
                Automated outreach campaigns
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              {dailyUsage && (
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    Today:{" "}
                    <span className="text-white font-medium">
                      {dailyUsage.daily_used}
                    </span>
                    {dailyUsage.unlimited ? "" : ` / ${dailyUsage.daily_limit}`}{" "}
                    companies
                  </span>
                  {!dailyUsage.unlimited && (
                    <div className="flex-1 min-w-[80px] max-w-[120px] h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            100,
                            (dailyUsage.daily_used / dailyUsage.daily_limit) *
                              100
                          )}%`,
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={() => router.push("/campaigns/upload")}
                disabled={
                  dailyUsage !== null &&
                  !dailyUsage.unlimited &&
                  (dailyUsage.daily_remaining ?? 0) <= 0
                }
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors rounded border border-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                Create Campaign
              </button>
            </div>
          </div>
          {dailyUsage &&
            !dailyUsage.unlimited &&
            (dailyUsage.daily_remaining ?? 0) <= 0 && (
              <p className="mt-2 text-xs text-amber-400">
                Daily limit reached. Resets at midnight UTC.
              </p>
            )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-200 rounded">
            <p className="font-medium mb-1">Error loading campaigns</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {campaigns.length === 0 ? (
          <LandingPageContent router={router} />
        ) : (
          <div className="space-y-6">
            {/* Campaigns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {campaigns.map((campaign, index) => {
                const isActive = campaign.status === "processing";
                const isCompleted = campaign.status === "completed";
                const isFailed = campaign.status === "failed";
                const isPaused = campaign.status === "paused";
                const bgImage = `/campaigns/campaign-${(index % 4) + 1}.jpg`;

                return (
                  <div
                    key={campaign.id}
                    className="border border-gray-800 rounded-xl hover:border-gray-700 transition-all duration-200 group cursor-pointer overflow-hidden"
                    style={{
                      backgroundImage: `linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(26, 26, 26, 0.9) 100%), url('${bgImage}')`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                    onClick={() => router.push(`/campaigns/${campaign.public_id}`)}
                  >
                    {/* Content */}
                    <div className="h-full flex flex-col">
                      {/* Header */}
                      <div className="p-6 pb-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-1 line-clamp-2 group-hover:text-blue-300 transition-colors">
                              {campaign.name}
                            </h3>
                            <p className="text-sm text-gray-400">
                              Created{" "}
                              {new Date(
                                campaign.created_at
                              ).toLocaleDateString()}
                            </p>
                          </div>

                          {/* Status Badge */}
                          <div
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              isActive
                                ? "bg-green-500/10 text-green-300 border border-green-500/20"
                                : isCompleted
                                ? "bg-blue-500/10 text-blue-300 border border-blue-500/20"
                                : isPaused
                                ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                                : isFailed
                                ? "bg-red-500/10 text-red-300 border border-red-500/20"
                                : "bg-gray-500/10 text-gray-300 border border-gray-500/20"
                            }`}
                          >
                            <span className="capitalize">
                              {campaign.status}
                            </span>
                          </div>
                        </div>

                        {/* Progress Section */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Progress</span>
                            <span className="text-white font-medium">
                              {campaign.progress_percentage}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-500 ${
                                isActive
                                  ? "bg-green-500"
                                  : isCompleted
                                  ? "bg-blue-500"
                                  : isFailed
                                  ? "bg-red-500"
                                  : "bg-gray-500"
                              }`}
                              style={{
                                width: `${campaign.progress_percentage}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="px-6 pb-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                            <div className="text-xl font-bold text-white mb-1">
                              {campaign.total_companies}
                            </div>
                            <div className="text-xs text-gray-400">
                              Total Companies
                            </div>
                          </div>
                          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                            <div className="text-xl font-bold text-blue-300 mb-1">
                              {campaign.processed_count}
                            </div>
                            <div className="text-xs text-gray-400">
                              Processed
                            </div>
                          </div>
                          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                            <div className="text-xl font-bold text-green-300 mb-1">
                              {campaign.success_count}
                            </div>
                            <div className="text-xs text-gray-400">
                              Successful
                            </div>
                          </div>
                          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                            <div className="text-xl font-bold text-red-300 mb-1">
                              {campaign.failed_count}
                            </div>
                            <div className="text-xs text-gray-400">Failed</div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-800">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/campaigns/${campaign.id}`);
                            }}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-500 transition-colors border border-blue-500/20"
                          >
                            View
                          </button>

                          {isActive && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Add pause action here
                              }}
                              className="px-3 py-2 bg-amber-600 text-white text-sm font-medium rounded hover:bg-amber-500 transition-colors border border-amber-500/20"
                              title="Pause campaign"
                            >
                              Pause
                            </button>
                          )}

                          {isPaused && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Add resume action here
                              }}
                              className="px-3 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-500 transition-colors border border-green-500/20"
                              title="Resume campaign"
                            >
                              Resume
                            </button>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(campaign.id);
                            }}
                            className="px-3 py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-500 transition-colors border border-red-500/20"
                            title="Delete campaign"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="Delete Campaign"
        message="Are you sure? This will delete all associated data and cannot be undone."
        onConfirm={handleDeleteConfirm}
        variant="danger"
      />
    </div>
  );
}

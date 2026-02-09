"use client";

import React, { useState, useEffect } from "react";
import { Check, Download } from "lucide-react";
import { convertUSDToZAR } from "@/lib/currency";

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  isActive?: boolean;
  isSubscription?: boolean;
}

interface BillingHistory {
  id: string;
  invoice: string;
  amount: number;
  date: string;
  status: "Paid" | "Pending" | "Failed";
  payment_id?: string;
  tier?: string;
  notification_id?: number;
  metadata?: any;
}

interface BillingSectionProps {
  user?: {
    id?: number;
    email?: string;
    subscription_tier?: string;
  };
}

const plans: Plan[] = [
  {
    id: "testing",
    name: "Testing",
    price: 0,
    description: "Perfect for development and testing",
    features: [
      "50 companies per campaign",
      "5 API calls/month",
      "PDF text extraction",
      "Basic image conversion",
      "QR code generation",
      "Admin dashboard access",
      "Community support",
    ],
    isActive: true,
    isSubscription: false,
  },
  {
    id: "production",
    name: "Production",
    price: 9,
    description: "For production applications",
    features: [
      "5,000 API calls/month",
      "100 companies per campaign",
      "PDF operations (merge, split, extract)",
      "Video/audio conversion",
      "Image processing",
      "QR code generation",
      "Admin dashboard access",
      "Priority support",
    ],
    isSubscription: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 19,
    description: "For large-scale applications",
    features: [
      "Unlimited API calls",
      "Unlimited campaign companies",
      "All file processing capabilities",
      "Enterprise client dashboard",
      "Dedicated support",
      "Custom SLAs",
      "White-label options",
    ],
    isSubscription: true,
  },
];

export function BillingSection({ user }: BillingSectionProps) {
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(
    null
  );

  useEffect(() => {
    fetchBillingHistory();
  }, [user]);

  const fetchBillingHistory = async () => {
    if (!user?.id && !user?.email) {
      setLoading(false);
      return;
    }

    try {
      // Use relative URL - Next.js rewrites proxy to backend (Railway URL hidden)
      const authToken = localStorage.getItem("auth_token");
      if (!authToken) {
        setLoading(false);
        return;
      }

      const params = new URLSearchParams();
      if (user.id) params.append("user_id", user.id.toString());
      if (user.email) params.append("user_email", user.email);

      const response = await fetch(
        `/api/payment/billing-history?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.billing_history) {
          // Transform backend data to frontend format
          const transformed = data.billing_history.map((item: any) => ({
            id: item.id,
            invoice: item.invoice,
            amount: item.amount,
            date: new Date(item.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
            status: item.status as "Paid" | "Pending" | "Failed",
            payment_id: item.payment_id,
            tier: item.tier,
            notification_id: item.notification_id,
            metadata: item.metadata,
            rawDate: item.date, // Keep ISO date for invoice download
          }));
          setBillingHistory(transformed);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = async (item: BillingHistory) => {
    if (!user?.email || !item.payment_id) {
      return;
    }

    setDownloadingInvoice(item.id);

    try {
      // Use relative URL - Next.js rewrites proxy to backend (Railway URL hidden)
      const authToken = localStorage.getItem("auth_token");
      if (!authToken) {
        return;
      }

      const response = await fetch(`/api/payment/download-invoice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          payment_id: item.payment_id,
          user_email: user.email,
          amount: item.amount,
          tier: item.tier || "free",
          payment_date: (item as any).rawDate || new Date().toISOString(),
          item_description: item.invoice,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.pdf_base64) {
          // Convert base64 to blob and download
          const byteCharacters = atob(data.pdf_base64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: "application/pdf" });

          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = data.filename || `invoice_${item.id}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert("Failed to download invoice. Please try again.");
      }
    } catch (error) {
      alert("Error downloading invoice. Please try again.");
    } finally {
      setDownloadingInvoice(null);
    }
  };

  // Determine user's current tier and plan states
  const getUserTier = (): string => {
    const tier = user?.subscription_tier?.toLowerCase() || "free";
    // Map various tier names to plan IDs
    if (tier === "free" || tier === "testing") return "testing";
    if (tier === "production" || tier === "premium") return "production";
    if (tier === "enterprise") return "enterprise";
    return "testing"; // Default to testing
  };

  const currentTier = getUserTier();

  // Determine plan states based on current tier
  const getPlanState = (planId: string) => {
    const tierOrder = { testing: 1, production: 2, enterprise: 3 };
    const currentTierOrder =
      tierOrder[currentTier as keyof typeof tierOrder] || 1;
    const planTierOrder = tierOrder[planId as keyof typeof tierOrder] || 1;

    const isActive = planId === currentTier;
    const isLowerTier = planTierOrder < currentTierOrder;
    const isHigherTier = planTierOrder > currentTierOrder;

    return {
      isActive,
      isLowerTier,
      isHigherTier,
      shouldGreyOut: isLowerTier,
      shouldShowCheck: isLowerTier, // Show checkmark on lower tiers when on higher tier
    };
  };

  const handleSubscribe = async (plan: Plan) => {
    // Convert USD to ZAR for PayFast payment
    if (plan.isSubscription && plan.price > 0) {
      try {
        const zarAmount = await convertUSDToZAR(plan.price);

        const subscriptionData = {
          planId: plan.id,
          planName: plan.name,
          usdAmount: plan.price,
          zarAmount: zarAmount,
          description: plan.description,
        };

        // Store plan info and ZAR amount for payment processing
        sessionStorage.setItem(
          "pending_subscription",
          JSON.stringify(subscriptionData)
        );

        // Redirect to payment page with converted amount
        const paymentUrl = `/payment?plan=${plan.id}&amount=${zarAmount}`;
        window.location.href = paymentUrl;
      } catch (error) {
        console.error("Error converting currency:", {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
        // Fallback: redirect without conversion (payment page should handle it)
        const fallbackUrl = `/payment?plan=${plan.id}&usdAmount=${plan.price}`;
        window.location.href = fallbackUrl;
      }
    } else {
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground dark:text-white mb-2">
          Plans and billing
        </h2>
        <p className="text-muted-foreground dark:text-gray-400">
          Manage your plan and billing details.
        </p>
      </div>

      {/* Subscription Plans */}
      <div>
        <h3 className="text-lg font-semibold text-foreground dark:text-white mb-4">
          Subscription Plans
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const planState = getPlanState(plan.id);
            const isGreyedOut = planState.shouldGreyOut;
            const isActive = planState.isActive;
            const showCheck = isActive || planState.shouldShowCheck;

            return (
              <div
                key={plan.id}
                className={`
                  relative bg-card dark:bg-[#1a1a1a] border border-border dark:border-[#2a2a2a] rounded-lg p-6 flex flex-col transition-all
                  ${
                    isActive
                      ? "border-[#8b5cf6] shadow-lg shadow-[#8b5cf6]/20"
                      : isGreyedOut
                      ? "opacity-60 grayscale cursor-not-allowed"
                      : "hover:border-[#3a3a3a]"
                  }
                `}
              >
                {showCheck && (
                  <div
                    className={`absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center ${
                      isActive
                        ? "bg-[#8b5cf6]"
                        : isGreyedOut
                        ? "bg-gray-500"
                        : "bg-[#8b5cf6]"
                    }`}
                  >
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className="mb-4">
                  <h4
                    className={`text-lg font-semibold mb-1 ${
                      isGreyedOut
                        ? "text-foreground/60 dark:text-gray-500"
                        : "text-foreground dark:text-white"
                    }`}
                  >
                    {plan.name}
                  </h4>
                  <div className="flex items-baseline gap-2">
                    {plan.price === 0 ? (
                      <span
                        className={`text-2xl font-bold ${
                          isGreyedOut
                            ? "text-foreground/60 dark:text-gray-500"
                            : "text-foreground dark:text-white"
                        }`}
                      >
                        Free
                      </span>
                    ) : (
                      <>
                        <span
                          className={`text-2xl font-bold ${
                            isGreyedOut
                              ? "text-foreground/60 dark:text-gray-500"
                              : "text-foreground dark:text-white"
                          }`}
                        >
                          ${plan.price}
                        </span>
                        <span
                          className={`text-sm ${
                            isGreyedOut
                              ? "text-foreground/50 dark:text-gray-600"
                              : "text-muted-foreground dark:text-gray-400"
                          }`}
                        >
                          /month
                        </span>
                      </>
                    )}
                  </div>
                  <p
                    className={`text-sm mt-2 ${
                      isGreyedOut
                        ? "text-foreground/50 dark:text-gray-600"
                        : "text-muted-foreground dark:text-gray-400"
                    }`}
                  >
                    {plan.description}
                  </p>
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check
                        className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                          isGreyedOut ? "text-gray-500" : "text-[#8b5cf6]"
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          isGreyedOut
                            ? "text-foreground/60 dark:text-gray-500"
                            : "text-foreground/90 dark:text-gray-300"
                        }`}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                {!isActive && plan.price > 0 && !isGreyedOut && (
                  <button
                    onClick={() => handleSubscribe(plan)}
                    className="w-full px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg font-medium transition-all mt-auto border border-white"
                  >
                    Subscribe
                  </button>
                )}
                {isGreyedOut && (
                  <div className="w-full px-4 py-2 bg-gray-500/20 text-gray-400 rounded-lg font-medium text-center mt-auto cursor-not-allowed">
                    Included in{" "}
                    {currentTier === "production" ? "Production" : "Enterprise"}{" "}
                    Plan
                  </div>
                )}
                {isActive && (
                  <div className="w-full px-4 py-2 bg-[#8b5cf6]/20 text-[#8b5cf6] rounded-lg font-medium text-center mt-auto">
                    Current Plan
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Billing History */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground dark:text-white">
            Billing history
          </h3>
          {billingHistory.length > 0 && (
            <button className="flex items-center gap-2 px-4 py-2 bg-card dark:bg-[#1a1a1a] border border-border dark:border-[#2a2a2a] hover:border-[#3a3a3a] text-foreground dark:text-white rounded-lg text-sm font-medium transition-colors">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </button>
          )}
        </div>
        <div className="bg-card dark:bg-[#1a1a1a] border border-border dark:border-[#2a2a2a] rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground dark:text-gray-400">
              Loading...
            </div>
          ) : billingHistory.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground dark:text-gray-400">
              No billing history available
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#0a0a0a] border-b border-[#2a2a2a]">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          className="rounded border-[#2a2a2a] bg-[#0a0a0a]"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">
                        Invoice
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a2a2a]">
                    {billingHistory.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-[#0a0a0a]/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            className="rounded border-[#2a2a2a] bg-[#0a0a0a]"
                          />
                        </td>
                        <td className="px-6 py-4 text-sm text-white">
                          {item.invoice}
                        </td>
                        <td className="px-6 py-4 text-sm text-white">
                          USD ${item.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {item.date}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`
                                inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${
                                  item.status === "Paid"
                                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                    : item.status === "Pending"
                                    ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                                }
                              `}
                            >
                              {item.status === "Paid" && (
                                <Check className="w-3 h-3 mr-1" />
                              )}
                              {item.status}
                            </span>
                            {item.payment_id && (
                              <button
                                onClick={() => downloadInvoice(item)}
                                disabled={downloadingInvoice === item.id}
                                className="text-xs text-[#8b5cf6] hover:text-[#7c3aed] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                title="Download Invoice"
                              >
                                <Download className="w-3 h-3" />
                                {downloadingInvoice === item.id ? "..." : ""}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile List */}
              <div className="md:hidden divide-y divide-[#2a2a2a]">
                {billingHistory.map((item) => (
                  <div key={item.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          className="mt-1 rounded border-[#2a2a2a] bg-[#0a0a0a]"
                        />
                        <div>
                          <p className="text-sm font-medium text-white">
                            {item.invoice}
                          </p>
                          <p className="text-sm text-white mt-1">
                            USD ${item.amount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`
                              inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${
                                item.status === "Paid"
                                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                  : item.status === "Pending"
                                  ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                  : "bg-red-500/20 text-red-400 border border-red-500/30"
                              }
                            `}
                        >
                          {item.status === "Paid" && (
                            <Check className="w-3 h-3 mr-1" />
                          )}
                          {item.status}
                        </span>
                        {item.payment_id && (
                          <button
                            onClick={() => downloadInvoice(item)}
                            disabled={downloadingInvoice === item.id}
                            className="text-xs text-[#8b5cf6] hover:text-[#7c3aed] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            title="Download Invoice"
                          >
                            <Download className="w-3 h-3" />
                            {downloadingInvoice === item.id ? "..." : ""}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

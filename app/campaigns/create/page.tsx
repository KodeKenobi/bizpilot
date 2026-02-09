"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { getAuthHeaders } from "@/lib/config";

export default function CreateCampaignPage() {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [campaignName, setCampaignName] = useState("");
  const [uploadedData, setUploadedData] = useState<any>(null);
  const [dailyUsage, setDailyUsage] = useState<{
    daily_limit: number;
    daily_used: number;
    daily_remaining: number | null;
    unlimited: boolean;
  } | null>(null);

  // Form field values
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [senderCompany, setSenderCompany] = useState("");
  const [senderCountry, setSenderCountry] = useState("South Africa");
  const [senderAddress, setSenderAddress] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [emailFoundWhenNoForm, setEmailFoundWhenNoForm] = useState(false);
  const [ccEmail, setCcEmail] = useState("");

  const countries = [
    "United Kingdom",
    "South Africa",
    "United States",
    "Australia",
    "Canada",
    "New Zealand",
    "Ireland",
    "Germany",
    "France",
    "Netherlands",
    "Spain",
    "Italy",
    "Israel",
    "India",
    "Singapore",
    "United Arab Emirates",
    "Saudi Arabia",
    "Brazil",
    "Mexico",
    "China",
    "Japan",
    "South Korea",
  ].sort();

  useEffect(() => {
    const data = localStorage.getItem("uploadedCampaignData");
    if (!data) {
      router.push("/campaigns/upload");
      return;
    }
    setUploadedData(JSON.parse(data));
  }, [router]);

  useEffect(() => {
    if (!uploadedData) return;
    let url = "/api/campaigns/usage";
    const headers: HeadersInit = { "Content-Type": "application/json" };
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (token) {
      Object.assign(headers, getAuthHeaders(token));
    } else {
      const sessionId =
        typeof window !== "undefined"
          ? localStorage.getItem("guest_session_id")
          : null;
      if (sessionId) url += `?session_id=${encodeURIComponent(sessionId)}`;
    }
    fetch(url, { credentials: "include", headers })
      .then((res) => res.ok && res.json())
      .then((data) => {
        if (data)
          setDailyUsage({
            daily_limit: data.daily_limit ?? 5,
            daily_used: data.daily_used ?? 0,
            daily_remaining: data.daily_remaining ?? null,
            unlimited: data.unlimited ?? false,
          });
      })
      .catch(() => {});
  }, [uploadedData, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!campaignName.trim()) {
      setError("Campaign name is required");
      return;
    }
    if (!firstName.trim()) {
      setError("First name is required");
      return;
    }
    if (!lastName.trim()) {
      setError("Last name is required");
      return;
    }
    if (!senderCompany.trim()) {
      setError("Your company name is required");
      return;
    }
    if (!senderEmail.trim()) {
      setError("Your email is required");
      return;
    }
    if (!senderPhone.trim()) {
      setError("Your phone is required");
      return;
    }
    if (!senderCountry.trim()) {
      setError("Country is required");
      return;
    }
    if (!senderAddress.trim()) {
      setError("Your address is required");
      return;
    }
    if (!subject.trim()) {
      setError("Email subject is required");
      return;
    }
    if (!message.trim()) {
      setError("Message is required");
      return;
    }

    try {
      setLoading(true);

      const formData = {
        sender_name: `${firstName} ${lastName}`.trim(),
        sender_first_name: firstName.trim(),
        sender_last_name: lastName.trim(),
        sender_email: senderEmail.trim(),
        sender_phone: senderPhone.trim(),
        sender_company: senderCompany.trim(),
        sender_country: senderCountry.trim(),
        sender_address: senderAddress.trim(),
        subject: subject.trim(),
        message: message.trim(),
        email_found_when_no_form: emailFoundWhenNoForm,
        cc_email: ccEmail.trim() || undefined,
      };

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("auth_token")
          : null;
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) Object.assign(headers, getAuthHeaders(token));

      // For guests: session_id required. For logged-in users: backend uses JWT, do not send session_id.
      let sessionId = null;
      if (!token) {
        sessionId = localStorage.getItem("guest_session_id");
        if (!sessionId) {
          sessionId = `guest_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`;
          localStorage.setItem("guest_session_id", sessionId);
        }
      }

      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: campaignName,
          message_template: JSON.stringify(formData),
          companies: uploadedData.rows,
          email: senderEmail || undefined,
          ...(sessionId ? { session_id: sessionId } : {}),
        }),
      });

      if (!response.ok) {
        let errorMsg = "Failed to create campaign";
        try {
          const data = await response.json();
          errorMsg = data.message || data.error || errorMsg;
        } catch (e) {
          errorMsg = `Failed to create campaign (${response.status})`;
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      localStorage.removeItem("uploadedCampaignData");
      router.push(`/campaigns/${data.campaign.public_id}`);
    } catch (err: any) {
      console.error("Failed to create campaign:", err);
      setError(err.message || "Failed to create campaign");
    } finally {
      setLoading(false);
    }
  };

  if (!uploadedData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-3"></div>
          <p className="text-sm text-white/60">Loading campaign data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-8">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push("/campaigns/upload")}
          className="text-white/60 hover:text-white text-sm mb-4 transition-colors"
        >
          ← Back
        </button>

        {/* Sign-In/Sign-Up Banner for Guests */}
        {!user && (
          <div className="mb-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Unlock Full Campaign Power
                </h3>
                <p className="text-sm text-gray-300">
                  You're currently limited to 5 companies as a guest.
                  <strong className="text-white">
                    {" "}
                    Sign up free to get 50 companies per campaign
                  </strong>{" "}
                  - that's 10x more reach!
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push("/auth/register")}
                  className="px-5 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors rounded-full whitespace-nowrap"
                >
                  Sign Up Free
                </button>
                <button
                  onClick={() => router.push("/auth/login")}
                  className="px-5 py-2 bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors rounded-full whitespace-nowrap"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-white mb-2">
            Create Campaign
          </h1>
          <p className="text-sm text-white/60 mb-6">
            {uploadedData.validRows} companies ready • Fill in your details and
            message
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Campaign Name */}
          <div>
            <label
              htmlFor="campaignName"
              className="block text-sm text-white mb-2"
            >
              Campaign Name
            </label>
            <input
              id="campaignName"
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 text-white 
                         focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all rounded-lg
                         placeholder:text-gray-500"
              placeholder="Q1 2026 Outreach"
              required
            />
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-sm text-white mb-3">Your Information</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 text-sm text-white 
                             focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all rounded-lg
                             placeholder:text-gray-500"
                  placeholder="First Name *"
                  required
                />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 text-sm text-white 
                             focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all rounded-lg
                             placeholder:text-gray-500"
                  placeholder="Last Name *"
                  required
                />
              </div>

              <input
                type="text"
                value={senderCompany}
                onChange={(e) => setSenderCompany(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 text-sm text-white 
                           focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all rounded-lg
                           placeholder:text-gray-500"
                placeholder="Your Company Name *"
                required
              />

              <input
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 text-sm text-white 
                           focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all rounded-lg
                           placeholder:text-gray-500"
                placeholder="Your Email *"
                required
              />

              <input
                type="tel"
                value={senderPhone}
                onChange={(e) => setSenderPhone(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 text-sm text-white 
                           focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all rounded-lg
                           placeholder:text-gray-500"
                placeholder="Your Phone *"
                required
              />

              <select
                value={senderCountry}
                onChange={(e) => setSenderCountry(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 text-sm text-white 
                           focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all rounded-lg"
                required
              >
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={senderAddress}
                onChange={(e) => setSenderAddress(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 text-sm text-white 
                           focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all rounded-lg
                           placeholder:text-gray-500"
                placeholder="Your Address *"
                required
              />

              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 text-sm text-white 
                           focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all rounded-lg
                           placeholder:text-gray-500"
                placeholder="Email Subject *"
                required
              />
            </div>
          </div>

          {/* Email when no form + CC */}
          <div className="border border-gray-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm text-white mb-3">Email options</h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={emailFoundWhenNoForm}
                onChange={(e) => setEmailFoundWhenNoForm(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 bg-gray-900 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
              />
              <span className="text-sm text-white">
                Email found contact when no contact form is found
              </span>
            </label>
            <p className="text-xs text-white/60">
              When enabled, if we find an email address but no submitable form, we will send your message to that email. When off, we only record the contact and do not send.
            </p>
            <div>
              <label htmlFor="ccEmail" className="block text-sm text-white mb-2">
                CC email (optional)
              </label>
              <input
                id="ccEmail"
                type="email"
                value={ccEmail}
                onChange={(e) => setCcEmail(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 text-sm text-white 
                           focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all rounded-lg
                           placeholder:text-gray-500"
                placeholder="e.g. you@company.com"
              />
              <p className="text-xs text-white/60 mt-1">
                When we send to a found contact (form or email), this address will receive a copy.
              </p>
            </div>
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm text-white mb-2">
              Your Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white leading-relaxed
                         focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all resize-none rounded-lg
                         placeholder:text-gray-500"
              placeholder="Write your message here..."
              required
            />
          </div>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
            <div className="text-xs text-gray-400">
              {dailyUsage && (
                <>
                  Today:{" "}
                  <span className="text-white font-medium">
                    {dailyUsage.daily_used}
                  </span>
                  {dailyUsage.unlimited ? "" : ` / ${dailyUsage.daily_limit}`}{" "}
                  companies
                  {!dailyUsage.unlimited &&
                    (dailyUsage.daily_remaining ?? 0) <= 0 && (
                      <span className="text-amber-400 ml-1">
                        — Daily limit reached. Resets at midnight UTC.
                      </span>
                    )}
                </>
              )}
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => router.push("/campaigns/upload")}
                className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={
                  loading ||
                  (dailyUsage !== null &&
                    !dailyUsage.unlimited &&
                    (dailyUsage.daily_remaining ?? 0) <= 0)
                }
                className="px-6 py-2 bg-blue-600 text-white text-sm font-medium
                           hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-full"
              >
                {loading ? "Creating..." : "Create Campaign"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

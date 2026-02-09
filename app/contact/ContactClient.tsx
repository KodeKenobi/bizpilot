"use client";

import { useState } from "react";
import Link from "next/link";

interface ContactFormData {
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
}

const categories = [
  { value: "support", label: "Technical Support" },
  { value: "billing", label: "Billing & Subscriptions" },
  { value: "feedback", label: "Feedback & Suggestions" },
  { value: "bug", label: "Bug Report" },
  { value: "partnership", label: "Partnership Inquiry" },
  { value: "other", label: "Other" },
];

const SITE_NAME = "Trevnoctilla";
const SITE_URL = "https://www.trevnoctilla.com";
const CONTACT_SOURCE = `${SITE_NAME} contact form (${SITE_URL}/contact)`;

export default function ContactClient() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    category: "support",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setErrorMessage("");

    try {
      const categoryLabel =
        categories.find((c) => c.value === formData.category)?.label ||
        formData.category;

      const response = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: "info@trevnoctilla.com",
          subject: `[${categoryLabel}] ${formData.subject}`,
          html: `
            <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; color: #111;">
              <h2 style="font-size: 1.25rem; font-weight: 600; margin: 0 0 1rem;">New contact form submission</h2>
              <p style="margin: 0 0 0.5rem;"><strong>From:</strong> ${
                formData.name
              }</p>
              <p style="margin: 0 0 0.5rem;"><strong>Email:</strong> <a href="mailto:${
                formData.email
              }">${formData.email}</a></p>
              <p style="margin: 0 0 0.5rem;"><strong>Category:</strong> ${categoryLabel}</p>
              <p style="margin: 0 0 1rem;"><strong>Subject:</strong> ${
                formData.subject
              }</p>
              <p style="margin: 0 0 0.25rem;"><strong>Message:</strong></p>
              <div style="background: #f5f5f5; padding: 12px; border-radius: 4px; white-space: pre-wrap; margin-bottom: 1rem;">${formData.message.replace(
                /\n/g,
                "<br>"
              )}</div>
              <p style="margin: 0; font-size: 0.8125rem; color: #666;">Sent from: ${CONTACT_SOURCE}</p>
            </div>
          `,
          text: `New contact form submission

From: ${formData.name}
Email: ${formData.email}
Category: ${categoryLabel}
Subject: ${formData.subject}

Message:
${formData.message}

---
Sent from: ${CONTACT_SOURCE}
          `,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitStatus("success");
        setFormData({
          name: "",
          email: "",
          category: "support",
          subject: "",
          message: "",
        });
      } else {
        throw new Error(result.error || "Failed to send message");
      }
    } catch (error: unknown) {
      setSubmitStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <header className="mb-10">
          <h1 className="text-2xl font-semibold text-black tracking-tight">
            Contact
          </h1>
          <p className="mt-2 text-[15px] text-neutral-600">
            Send a message and we’ll respond as soon as we can.
          </p>
        </header>

        <div className="border border-neutral-200 rounded-lg bg-white p-6 sm:p-8">
          {submitStatus === "success" && (
            <div className="mb-6 py-3 px-4 bg-neutral-100 border border-neutral-200 rounded text-sm text-neutral-700">
              Message sent. We’ll get back to you within 24–48 hours.
            </div>
          )}

          {submitStatus === "error" && (
            <div className="mb-6 py-3 px-4 bg-neutral-100 border border-neutral-300 rounded text-sm text-neutral-800">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-neutral-800 mb-1.5"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="w-full px-3 py-2.5 border border-neutral-300 rounded text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-neutral-800 mb-1.5"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2.5 border border-neutral-300 rounded text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-neutral-800 mb-1.5"
              >
                Category
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-neutral-300 rounded text-neutral-900 bg-white focus:outline-none focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-neutral-800 mb-1.5"
              >
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                placeholder="Brief subject"
                className="w-full px-3 py-2.5 border border-neutral-300 rounded text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400"
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-neutral-800 mb-1.5"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                value={formData.message}
                onChange={handleChange}
                placeholder="Your message..."
                className="w-full px-3 py-2.5 border border-neutral-300 rounded text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400 resize-none"
              />
            </div>

            <div className="pt-1 flex flex-col sm:flex-row sm:items-center gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded hover:bg-neutral-800 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting ? "Sending…" : "Send message"}
              </button>
              <p className="text-sm text-neutral-500">
                Or email{" "}
                <a
                  href="mailto:info@trevnoctilla.com"
                  className="text-neutral-700 underline hover:no-underline"
                >
                  info@trevnoctilla.com
                </a>{" "}
                directly.
              </p>
            </div>
          </form>
        </div>

        <div className="mt-8 text-sm text-neutral-500">
          <p>We usually respond within 24–48 hours.</p>
          <Link
            href="/support"
            className="text-neutral-700 underline hover:no-underline mt-1 inline-block"
          >
            Support & FAQs
          </Link>
        </div>
      </div>
    </div>
  );
}

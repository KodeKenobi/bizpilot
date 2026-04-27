"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ChevronDown,
  HelpCircle,
  CreditCard,
  FileText,
  Video,
  Music,
  Image,
  QrCode,
  Code,
  Shield,
  Zap,
  Mail,
  MessageCircle,
  Search,
} from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  title: string;
  icon: React.ElementType;
  gradient: string;
  faqs: FAQItem[];
}

const faqCategories: FAQCategory[] = [
  {
    id: "account",
    title: "Account & Billing",
    icon: CreditCard,
    gradient: "from-emerald-500 to-teal-500",
    faqs: [
      {
        question: "How do I create an account?",
        answer:
          "Click on 'Sign Up' or 'Register' in the top navigation. Enter your email address, create a password, and verify your email. Your account will be ready to use immediately after verification.",
      },
      {
        question: "Can I use Trevnoctilla without an account?",
        answer:
          "Yes! Our core file conversion tools are completely free to use without registration. However, creating an account unlocks additional features like conversion history, higher file limits, and API access.",
      },
      {
        question: "How do I reset my password?",
        answer:
          "Click on 'Login', then select 'Forgot Password'. Enter your email address and we'll send you a password reset link. The link expires after 24 hours for security.",
      },
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept payments through PayFast, which supports credit cards, debit cards, instant EFT, and other popular South African payment methods. International cards are also supported.",
      },
      {
        question: "How do I upgrade my subscription?",
        answer:
          "Log into your dashboard, navigate to the 'Subscription' section, and select your desired plan. You'll be guided through the secure payment process. Upgrades take effect immediately.",
      },
      {
        question: "Can I cancel my subscription anytime?",
        answer:
          "Yes, you can cancel your subscription at any time from your dashboard settings. You'll retain access to premium features until the end of your current billing period.",
      },
      {
        question: "How do I get a receipt or invoice?",
        answer:
          "All receipts and invoices are automatically sent to your registered email after each payment. You can also access your billing history from your dashboard.",
      },
      {
        question: "Do you offer refunds?",
        answer:
          "We offer a 7-day money-back guarantee for new subscriptions. If you're not satisfied, contact our support team within 7 days of your purchase for a full refund.",
      },
    ],
  },
  {
    id: "pdf",
    title: "PDF Tools",
    icon: FileText,
    gradient: "from-amber-500 to-orange-500",
    faqs: [
      {
        question: "What PDF operations are supported?",
        answer:
          "We support: PDF to Word conversion, Word to PDF, merge multiple PDFs, split PDFs, extract text, extract images, compress PDFs, add digital signatures, add watermarks, convert PDFs to images, and HTML to PDF conversion.",
      },
      {
        question: "What is the maximum PDF file size?",
        answer:
          "Free users can upload PDFs up to 10MB. Premium users enjoy file sizes up to 50MB, and Enterprise users have unlimited file size support.",
      },
      {
        question: "How accurate is the PDF to Word conversion?",
        answer:
          "Our conversion preserves formatting, fonts, tables, and images with high accuracy. Complex layouts may require minor adjustments. For best results, ensure your PDF has selectable text rather than scanned images.",
      },
      {
        question: "Can I merge PDFs with different page sizes?",
        answer:
          "Yes! Our merge tool automatically handles PDFs with different page sizes and orientations. The resulting merged document maintains each page's original dimensions.",
      },
      {
        question: "How does text extraction work?",
        answer:
          "Our text extraction tool pulls all text content from your PDF, including text from multiple columns and tables. For scanned documents, consider using OCR-enabled tools for best results.",
      },
      {
        question: "Are my PDF files kept private?",
        answer:
          "Absolutely. All uploaded files are processed in isolated environments and automatically deleted within 1 hour of processing. We never share or access your file contents.",
      },
      {
        question: "Can I add a digital signature to my PDF?",
        answer:
          "Yes! Upload your PDF, draw or upload your signature, position it on any page, and download the signed document. Signatures are embedded directly into the PDF.",
      },
      {
        question: "How does PDF compression work?",
        answer:
          "Our compression reduces file size by optimizing images, removing unnecessary metadata, and applying efficient encoding. You can typically achieve 50-80% size reduction without visible quality loss.",
      },
    ],
  },
  {
    id: "video",
    title: "Video Converter",
    icon: Video,
    gradient: "from-red-500 to-pink-500",
    faqs: [
      {
        question: "What video formats are supported?",
        answer:
          "We support all major formats: MP4, AVI, MOV, MKV, WEBM, FLV, WMV, 3GP, and more. Convert between any combination of these formats with full control over quality settings.",
      },
      {
        question: "What is the maximum video file size?",
        answer:
          "Free users can convert videos up to 100MB. Premium users enjoy 500MB limits, and Enterprise users have unlimited file size support for batch processing.",
      },
      {
        question: "How long does video conversion take?",
        answer:
          "Conversion time depends on file size, format, and selected quality. Most conversions complete within 1-5 minutes. Larger files or higher quality settings may take longer.",
      },
      {
        question: "Can I reduce video file size without losing quality?",
        answer:
          "Yes! Our compression settings allow you to balance file size and quality. Modern codecs like H.265/HEVC can reduce size by 50% with minimal quality loss.",
      },
      {
        question: "What quality options are available?",
        answer:
          "You can choose from preset quality levels (Low, Medium, High, Maximum) or customize bitrate, resolution, and codec settings for precise control.",
      },
      {
        question: "Can I convert videos for specific devices?",
        answer:
          "Yes! We offer optimized presets for smartphones, tablets, smart TVs, and web streaming. Select your target device for automatically optimized settings.",
      },
    ],
  },
  {
    id: "audio",
    title: "Audio Converter",
    icon: Music,
    gradient: "from-green-500 to-emerald-500",
    faqs: [
      {
        question: "What audio formats are supported?",
        answer:
          "We support MP3, WAV, AAC, FLAC, OGG, WMA, M4A, AIFF, and more. Convert between any formats while preserving audio quality.",
      },
      {
        question: "Can I adjust audio quality and bitrate?",
        answer:
          "Yes! Choose from preset quality levels or specify exact bitrate (32kbps to 320kbps for MP3) and sample rate for complete control over output quality.",
      },
      {
        question: "What's the difference between lossy and lossless?",
        answer:
          "Lossy formats (MP3, AAC) compress audio with slight quality loss for smaller files. Lossless formats (FLAC, WAV) preserve original quality with larger file sizes. Choose based on your needs.",
      },
      {
        question: "Can I extract audio from video files?",
        answer:
          "Yes! Upload any video file and extract its audio track in your preferred format. Perfect for creating MP3s from music videos or podcasts from video recordings.",
      },
      {
        question: "What's the maximum audio file size?",
        answer:
          "Free users can convert audio files up to 50MB. Premium and Enterprise users enjoy higher limits for large audio files and batch processing.",
      },
    ],
  },
  {
    id: "image",
    title: "Image Converter",
    icon: Image,
    gradient: "from-blue-500 to-cyan-500",
    faqs: [
      {
        question: "What image formats are supported?",
        answer:
          "We support JPG/JPEG, PNG, WebP, GIF, BMP, TIFF, HEIC, SVG, and ICO. Convert between any formats with quality control and resizing options.",
      },
      {
        question: "Can I resize images during conversion?",
        answer:
          "Yes! Specify custom dimensions, scale by percentage, or choose preset sizes. Maintain aspect ratio to prevent distortion, or crop to exact dimensions.",
      },
      {
        question: "How do I convert HEIC to JPG?",
        answer:
          "Simply upload your HEIC file (common on iPhones) and select JPG as output format. The conversion preserves image quality while ensuring compatibility with all devices.",
      },
      {
        question: "What quality settings are available?",
        answer:
          "Adjust quality from 1-100% for lossy formats. Higher values preserve more detail with larger file sizes. 80-90% typically provides the best balance.",
      },
      {
        question: "Can I convert multiple images at once?",
        answer:
          "Premium users can batch convert multiple images simultaneously. Upload all your images, select output settings, and download the converted files as a ZIP archive.",
      },
    ],
  },
  {
    id: "qr",
    title: "QR Generator",
    icon: QrCode,
    gradient: "from-purple-500 to-pink-500",
    faqs: [
      {
        question: "What types of QR codes can I create?",
        answer:
          "Create QR codes for URLs, plain text, email addresses, phone numbers, SMS messages, WiFi credentials, vCards (contact info), and geographic locations.",
      },
      {
        question: "Can I customize QR code colors and style?",
        answer:
          "Yes! Customize foreground and background colors, add logos or images to the center, choose from different patterns, and select corner styles for unique designs.",
      },
      {
        question: "What download formats are available?",
        answer:
          "Download QR codes as PNG (best for digital use), SVG (scalable vector), or PDF (print-ready). All formats support high resolution for professional use.",
      },
      {
        question: "How large can the QR code content be?",
        answer:
          "QR codes can hold up to 3KB of data (approximately 7,000 numeric characters or 4,000 alphanumeric characters). For longer content, consider using shortened URLs.",
      },
      {
        question: "Will my QR code work forever?",
        answer:
          "Yes! QR codes contain the data directly and don't require our servers to function. Once generated, your QR code will work indefinitely as long as the linked content exists.",
      },
    ],
  },
  {
    id: "api",
    title: "API & Integration",
    icon: Code,
    gradient: "from-indigo-500 to-purple-500",
    faqs: [
      {
        question: "How do I get API access?",
        answer:
          "Sign up for an account and navigate to the API section in your dashboard. Generate an API key to start integrating our services into your applications.",
      },
      {
        question: "What are the API rate limits?",
        answer:
          "Free tier: 100 calls/month. Premium: 10,000 calls/month. Enterprise: Unlimited calls with dedicated support. Upgrade anytime from your dashboard.",
      },
      {
        question: "Is there API documentation available?",
        answer:
          "Yes! Visit our comprehensive API documentation at /api-docs for detailed guides, code examples in multiple languages, and interactive API testing tools.",
      },
      {
        question: "What programming languages are supported?",
        answer:
          "Our REST API works with any language that supports HTTP requests. We provide code examples for JavaScript, Python, PHP, Ruby, and cURL commands.",
      },
      {
        question: "Can I use the API for commercial projects?",
        answer:
          "Yes! All paid plans include commercial use rights. Free tier is limited to personal and development use. Check our terms for specific licensing details.",
      },
    ],
  },
  {
    id: "security",
    title: "Security & Privacy",
    icon: Shield,
    gradient: "from-slate-500 to-zinc-600",
    faqs: [
      {
        question: "Are my files secure?",
        answer:
          "Absolutely. All file transfers use TLS 1.3 encryption. Files are processed in isolated environments and automatically deleted within 1 hour. We never access or share your file contents.",
      },
      {
        question: "Where are files processed?",
        answer:
          "Files are processed on secure cloud servers. Processing is isolated per user, and files never touch disk storage longer than necessary for conversion.",
      },
      {
        question: "Do you store my files?",
        answer:
          "Files are temporarily stored only during processing (typically seconds to minutes) and automatically purged within 1 hour. No permanent storage or backups are created.",
      },
      {
        question: "Is Trevnoctilla GDPR compliant?",
        answer:
          "Yes! We're fully GDPR compliant. We collect minimal data, provide data export/deletion upon request, and never sell or share personal information with third parties.",
      },
      {
        question: "Can I request my data to be deleted?",
        answer:
          "Yes, you can request complete account and data deletion anytime. Contact support or use the 'Delete Account' option in settings. Deletion is permanent and immediate.",
      },
    ],
  },
];

export default function SupportClient() {
  const [activeCategory, setActiveCategory] = useState<string>("account");
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleFAQ = (categoryId: string, index: number) => {
    const key = `${categoryId}-${index}`;
    setExpandedFAQ(expandedFAQ === key ? null : key);
  };

  const currentCategory = faqCategories.find((c) => c.id === activeCategory);

  // Filter FAQs based on search
  const filteredCategories = searchQuery
    ? faqCategories
        .map((category) => ({
          ...category,
          faqs: category.faqs.filter(
            (faq) =>
              faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
              faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter((category) => category.faqs.length > 0)
    : [];

  return (
    <div className="min-h-screen bg-gray-900 page-content">
      {/* Hero Section */}
      <section className="pt-24 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5"></div>
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <HelpCircle className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              How can we help you?
            </h1>

            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Find answers to common questions about Trevnoctilla&apos;s file
              conversion tools, account management, and more.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-800/80 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search Results */}
      {searchQuery && (
        <section className="pb-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {filteredCategories.length > 0 ? (
              <div className="space-y-6">
                <p className="text-gray-400 text-sm">
                  Found{" "}
                  {filteredCategories.reduce(
                    (acc, c) => acc + c.faqs.length,
                    0
                  )}{" "}
                  results for &quot;{searchQuery}&quot;
                </p>
                {filteredCategories.map((category) => (
                  <div key={category.id} className="space-y-3">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <category.icon className="w-5 h-5 text-white" />
                      {category.title}
                    </h3>
                    {category.faqs.map((faq, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden"
                      >
                        <button
                          onClick={() =>
                            toggleFAQ(`search-${category.id}`, index)
                          }
                          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-800/80 transition-colors"
                        >
                          <span className="text-white font-medium pr-4">
                            {faq.question}
                          </span>
                          <ChevronDown
                            className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                              expandedFAQ === `search-${category.id}-${index}`
                                ? "rotate-180"
                                : ""
                            }`}
                          />
                        </button>
                        <AnimatePresence>
                          {expandedFAQ === `search-${category.id}-${index}` && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <p className="px-6 pb-4 text-gray-300 leading-relaxed">
                                {faq.answer}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">
                  No results found for &quot;{searchQuery}&quot;. Try different
                  keywords or{" "}
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-white hover:underline"
                  >
                    browse all categories
                  </button>
                  .
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* FAQ Categories & Content */}
      {!searchQuery && (
        <section className="pb-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Category Sidebar - Mobile Horizontal Scroll */}
              <div className="lg:col-span-1">
                <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0 sticky top-24">
                  {faqCategories.map((category) => {
                    const Icon = category.icon;
                    const isActive = activeCategory === category.id;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap flex-shrink-0 lg:w-full ${
                          isActive
                            ? "bg-gradient-to-r " +
                              category.gradient +
                              " text-white shadow-lg"
                            : "bg-gray-800/50 text-gray-300 hover:bg-gray-800 border border-gray-700"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{category.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* FAQ Content */}
              <div className="lg:col-span-3">
                <AnimatePresence mode="wait">
                  {currentCategory && (
                    <motion.div
                      key={currentCategory.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center gap-4 mb-8">
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-r ${currentCategory.gradient} flex items-center justify-center`}
                        >
                          <currentCategory.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white">
                            {currentCategory.title}
                          </h2>
                          <p className="text-gray-400">
                            {currentCategory.faqs.length} frequently asked
                            questions
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {currentCategory.faqs.map((faq, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden hover:border-gray-600 transition-colors"
                          >
                            <button
                              onClick={() =>
                                toggleFAQ(currentCategory.id, index)
                              }
                              className="w-full px-6 py-5 flex items-center justify-between text-left"
                            >
                              <span className="text-white font-medium text-lg pr-4">
                                {faq.question}
                              </span>
                              <ChevronDown
                                className={`w-5 h-5 text-white flex-shrink-0 transition-transform duration-200 ${
                                  expandedFAQ ===
                                  `${currentCategory.id}-${index}`
                                    ? "rotate-180"
                                    : ""
                                }`}
                              />
                            </button>
                            <AnimatePresence>
                              {expandedFAQ ===
                                `${currentCategory.id}-${index}` && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <p className="px-6 pb-5 text-gray-300 leading-relaxed border-t border-gray-700/50 pt-4">
                                    {faq.answer}
                                  </p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Still Need Help CTA */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700 rounded-2xl p-8 md:p-12 text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">
              Still have questions?
            </h2>
            <p className="text-gray-300 mb-8 max-w-xl mx-auto">
              Can&apos;t find what you&apos;re looking for? Our support team is
              here to help. Reach out and we&apos;ll get back to you as soon as
              possible.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/25"
              >
                <Mail className="w-5 h-5" />
                Contact Support
              </Link>
              <a
                href="mailto:info@trevnoctilla.com"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl border border-gray-700 transition-all duration-300"
              >
                <Mail className="w-5 h-5" />
                info@trevnoctilla.com
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

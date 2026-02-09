"use client";

import { motion } from "framer-motion";
import {
  Code,
  Terminal,
  Key,
  Shield,
  Zap,
  FileText,
  Play,
  Image,
  ArrowRight,
  Copy,
  Check,
  ExternalLink,
  Lock,
  Users,
  Clock,
  Database,
  QrCode,
} from "lucide-react";
import React, { useState, useRef } from "react";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import PayFastForm from "@/components/ui/PayFastForm";
import { convertUSDToZAR } from "@/lib/currency";

export default function ApiDocsClient() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("pdf");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [zarAmount, setZarAmount] = useState<string | null>(null);
  const [isProcessingSubscription, setIsProcessingSubscription] =
    useState(false);
  const subscriptionFormRef = useRef<HTMLFormElement>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleGetStarted = () => {
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/auth/register");
    }
  };

  // Get base URL for API examples (use frontend domain, Next.js rewrites proxy to backend)
  // Use environment variable or default to production domain
  const apiBaseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_BASE_URL || "https://trevnoctilla.com";

  const codeExamples = {
    pdf: {
      title: "PDF Text Extraction",
      description: "Extract text from PDF documents with OCR support",
      endpoint: "POST /api/v1/convert/pdf-extract-text",
      code: `curl -X POST "${apiBaseUrl}/api/v1/convert/pdf-extract-text" \\
  -H "X-API-Key: your-api-key-here" \\
  -F "file=@document.pdf"`,
      response: `{
  "job_id": "9818f6e9-0816-4413-9b5f-ce0cbb18e051",
  "status": "completed",
  "message": "Text extracted successfully",
  "text": "Extracted text content from PDF...",
  "text_length": 1523,
  "processing_time": 1.058
}`,
    },
    video: {
      title: "Video Conversion",
      description: "Convert videos between MP4, WebM, AVI, MOV formats",
      endpoint: "POST /api/v1/convert/video",
      code: `curl -X POST "${apiBaseUrl}/api/v1/convert/video" \\
  -H "X-API-Key: your-api-key-here" \\
  -F "file=@video.mp4" \\
  -F "output_format=webm"`,
      response: `{
  "job_id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "completed",
  "message": "Video converted successfully",
  "file_base64": "iVBORw0KGgoAAAANSUhEUgAA...",
  "format": "webm",
  "file_size": 5242880,
  "mime_type": "video/webm",
  "processing_time": 12.5
}`,
    },
    image: {
      title: "Image Conversion",
      description: "Convert images between JPG, PNG, WebP, BMP formats",
      endpoint: "POST /api/v1/convert/image",
      code: `curl -X POST "${apiBaseUrl}/api/v1/convert/image" \\
  -H "X-API-Key: your-api-key-here" \\
  -F "file=@image.jpg" \\
  -F "output_format=png"`,
      response: `{
  "job_id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "completed",
  "message": "Image converted successfully",
  "image_base64": "iVBORw0KGgoAAAANSUhEUgAA...",
  "format": "png",
  "file_size": 245760,
  "mime_type": "image/png",
  "processing_time": 0.5
}`,
    },
    pdf_merge: {
      title: "PDF Merge",
      description: "Merge multiple PDF files into a single document",
      endpoint: "POST /api/v1/convert/pdf-merge",
      code: `curl -X POST "${apiBaseUrl}/api/v1/convert/pdf-merge" \\
  -H "X-API-Key: your-api-key-here" \\
  -F "files=@file1.pdf" \\
  -F "files=@file2.pdf" \\
  -F "files=@file3.pdf"`,
      response: `{
  "job_id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "completed",
  "message": "PDFs merged successfully",
  "pdf_base64": "JVBERi0xLjQKJeLjz9MKMyAwIG9iago8PC...",
  "file_size": 524288,
  "mime_type": "application/pdf",
  "processing_time": 2.3
}`,
    },
    pdf_split: {
      title: "PDF Split",
      description: "Split PDF into individual pages or custom ranges",
      endpoint: "POST /api/v1/convert/pdf-split",
      code: `curl -X POST "${apiBaseUrl}/api/v1/convert/pdf-split" \\
  -H "X-API-Key: your-api-key-here" \\
  -F "file=@document.pdf" \\
  -F "split_type=by_range" \\
  -F "page_range=1,3,5-10"`,
      response: `{
  "job_id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "completed",
  "message": "PDF split successfully",
  "pdf_base64": "JVBERi0xLjQKJeLjz9MKMyAwIG9iago8PC...",
  "file_size": 157286,
  "mime_type": "application/pdf",
  "processing_time": 1.2
}`,
    },
    qr_generate: {
      title: "QR Code Generation",
      description: "Generate QR codes with custom styling and data",
      endpoint: "POST /api/v1/convert/qr-generate",
      code: `curl -X POST "${apiBaseUrl}/api/v1/convert/qr-generate" \\
  -H "X-API-Key: your-api-key-here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "https://trevnoctilla.com",
    "size": "medium",
    "format": "png"
  }'`,
      response: `{
  "job_id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "completed",
  "message": "QR code generated successfully",
  "image_base64": "iVBORw0KGgoAAAANSUhEUgAA...",
  "format": "png",
  "mime_type": "image/png",
  "processing_time": 0.15
}`,
    },
    pdf_to_html: {
      title: "PDF to HTML Conversion",
      description:
        "Convert PDF documents to HTML while preserving exact layout",
      endpoint: "POST /convert_pdf_to_html",
      code: `curl -X POST "${apiBaseUrl}/convert_pdf_to_html" \\
  -F "pdf=@document.pdf" \\
  -F "method=pymupdf"`,
      response: `{
  "status": "success",
  "message": "PDF converted to HTML successfully using PyMuPDF",
  "converted_filename": "document_converted.html",
  "original_format": "PDF",
  "converted_format": "HTML",
  "method_used": "PyMuPDF",
  "original_size": 245760,
  "html_size": 512000,
  "download_url": "/download_converted/document_converted.html",
  "preview_url": "/preview_html/document_converted.html"
}`,
    },
    html_to_pdf: {
      title: "HTML to PDF Conversion",
      description: "Convert HTML files to PDF with 100% layout accuracy",
      endpoint: "POST /convert_html_to_pdf",
      code: `curl -X POST "${apiBaseUrl}/convert_html_to_pdf" \\
  -F "html=@document.html"`,
      response: `{
  "status": "success",
  "message": "HTML converted to PDF successfully",
  "converted_filename": "document_converted.pdf",
  "original_format": "HTML",
  "converted_format": "PDF",
  "original_size": 512000,
  "pdf_size": 245760,
  "download_url": "/download_edited/document_converted.pdf"
}`,
    },
  };

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Process files in seconds with our optimized infrastructure",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Enterprise Security",
      description: "End-to-end encryption, SOC 2 compliance, and data privacy",
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: "99.9% Uptime",
      description: "Reliable infrastructure with global CDN and redundancy",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Developer First",
      description: "Comprehensive docs, SDKs, and dedicated support",
    },
  ];

  const pricing = [
    {
      name: "Testing",
      price: "Free",
      usdAmount: 0,
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
      cta: "Start Testing",
      popular: false,
      isSubscription: false,
    },
    {
      name: "Production",
      price: "$9/month",
      usdAmount: 9,
      description: "For production applications",
      features: [
        "5,000 API calls/month",
        "PDF operations (merge, split, extract)",
        "Video/audio conversion",
        "Image processing",
        "QR code generation",
        "Admin dashboard access",
        "Priority support",
      ],
      cta: "Subscribe Now",
      popular: true,
      isSubscription: true,
    },
    {
      name: "Enterprise",
      price: "$19/month",
      usdAmount: 19,
      description: "For large-scale applications",
      features: [
        "Unlimited API calls",
        "All file processing capabilities",
        "Enterprise client dashboard",
        "Dedicated support",
        "Custom SLAs",
        "White-label options",
      ],
      cta: "Subscribe Now",
      popular: false,
      isSubscription: true,
    },
  ];

  const handleSubscribe = (plan: (typeof pricing)[0]) => {
    if (!user) {
      sessionStorage.setItem(
        "pending_subscription",
        JSON.stringify({
          planName: plan.name,
          isSubscription: plan.isSubscription,
          usdAmount: plan.usdAmount,
        })
      );
      router.push("/auth/register");
      return;
    }

    if (plan.isSubscription) {
      router.push("/dashboard?tab=settings");
      return;
    }

    if (plan.name === "Testing") {
      router.push("/dashboard");
      return;
    }
  };

  // Note: Subscriptions no longer require authentication - removed login redirect logic

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 page-content">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground dark:text-white mb-6">
            Powerful APIs for{" "}
            <span className="text-white">File Processing</span>
          </h1>
          <p className="text-xl text-foreground/90 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8">
            Integrate advanced file processing capabilities into your
            applications. Convert videos, process PDFs, optimize images, and
            more with our comprehensive API suite.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.button
              onClick={handleGetStarted}
              className="border-2 border-border dark:border-gray-600 hover:border-cyan-400 text-white font-bold px-8 py-3 rounded-xl transition-all duration-300 w-full sm:w-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {user ? "Go to Dashboard" : "Get Started Free"}
            </motion.button>
            <motion.button
              onClick={() =>
                document
                  .getElementById("code-examples")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="border-2 border-border dark:border-gray-600 hover:border-cyan-400 text-foreground/90 dark:text-gray-300 hover:text-foreground dark:hover:text-white font-bold px-8 py-3 rounded-xl transition-all duration-300 w-full sm:w-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View Examples
            </motion.button>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 text-center md:text-left"
            >
              {/* <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto md:mx-0 mb-4">
                {feature.icon}
              </div> */}
              <h3 className="text-xl font-bold text-foreground dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground dark:text-gray-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* API Reference */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-foreground dark:text-white text-center mb-12">
            Complete API Reference
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* PDF APIs */}
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 text-center md:text-left">
              <div className="flex items-center mb-4 justify-center md:justify-start">
                <FileText className="w-8 h-8 text-red-500 mr-3" />
                <h3 className="text-xl font-bold text-foreground dark:text-white">
                  PDF Processing
                </h3>
              </div>
              <div className="space-y-3">
                <div className="text-sm">
                  <code className="text-white">POST /extract_text</code>
                  <p className="text-muted-foreground dark:text-gray-400 mt-1">
                    Extract text from PDFs
                  </p>
                </div>
                <div className="text-sm">
                  <code className="text-white">POST /merge_pdfs</code>
                  <p className="text-muted-foreground dark:text-gray-400 mt-1">
                    Merge multiple PDFs
                  </p>
                </div>
                <div className="text-sm">
                  <code className="text-white">POST /split_pdf</code>
                  <p className="text-muted-foreground dark:text-gray-400 mt-1">
                    Split PDF into pages
                  </p>
                </div>
                <div className="text-sm">
                  <code className="text-white">POST /extract_images</code>
                  <p className="text-muted-foreground dark:text-gray-400 mt-1">
                    Extract images from PDFs
                  </p>
                </div>
                <div className="text-sm">
                  <code className="text-white">POST /convert_pdf_to_html</code>
                  <p className="text-muted-foreground dark:text-gray-400 mt-1">
                    Convert PDF to HTML with layout preservation
                  </p>
                </div>
                <div className="text-sm">
                  <code className="text-white">POST /convert_html_to_pdf</code>
                  <p className="text-muted-foreground dark:text-gray-400 mt-1">
                    Convert HTML to PDF with 100% accuracy
                  </p>
                </div>
              </div>
            </div>

            {/* Video/Audio APIs */}
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 text-center md:text-left">
              <div className="flex items-center mb-4 justify-center md:justify-start">
                <Play className="w-8 h-8 text-green-500 mr-3" />
                <h3 className="text-xl font-bold text-white">
                  Media Conversion
                </h3>
              </div>
              <div className="space-y-3">
                <div className="text-sm">
                  <code className="text-white">POST /convert-video</code>
                  <p className="text-muted-foreground dark:text-gray-400 mt-1">
                    Convert video formats
                  </p>
                </div>
                <div className="text-sm">
                  <code className="text-white">POST /convert-audio</code>
                  <p className="text-muted-foreground dark:text-gray-400 mt-1">
                    Convert audio formats
                  </p>
                </div>
                <div className="text-sm">
                  <code className="text-white">POST /convert-image</code>
                  <p className="text-muted-foreground dark:text-gray-400 mt-1">
                    Convert image formats
                  </p>
                </div>
                {/* <div className="text-sm">
                  <code className="text-white">
                    GET /conversion_progress/{"{filename}"}
                  </code>
                  <p className="text-muted-foreground dark:text-gray-400 mt-1">
                    Check conversion status
                  </p>
                </div>
                <div className="text-sm">
                  <code className="text-white">
                    POST /cancel_conversion/{"{filename}"}
                  </code>
                  <p className="text-muted-foreground dark:text-gray-400 mt-1">
                    Cancel ongoing conversion
                  </p>
                </div> */}
              </div>
            </div>

            {/* Utility APIs */}
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 text-center md:text-left">
              <div className="flex items-center mb-4 justify-center md:justify-start">
                <QrCode className="w-8 h-8 text-purple-500 mr-3" />
                <h3 className="text-xl font-bold text-white">Utilities</h3>
              </div>
              <div className="space-y-3">
                <div className="text-sm">
                  <code className="text-white">POST /generate-qr</code>
                  <p className="text-muted-foreground dark:text-gray-400 mt-1">
                    Generate QR codes
                  </p>
                </div>
                <div className="text-sm">
                  <code className="text-white">GET /health</code>
                  <p className="text-muted-foreground dark:text-gray-400 mt-1">
                    API health check
                  </p>
                </div>
                {/* <div className="text-sm">
                  <code className="text-white">POST /cleanup-file</code>
                  <p className="text-muted-foreground dark:text-gray-400 mt-1">
                    Clean up temporary files
                  </p>
                </div>
                <div className="text-sm">
                  <code className="text-white">POST /cleanup-session</code>
                  <p className="text-muted-foreground dark:text-gray-400 mt-1">
                    Clean up session files
                  </p>
                </div> */}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Pricing */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-foreground dark:text-white text-center mb-12">
            Simple, Transparent Pricing
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {pricing.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border rounded-2xl p-8 flex flex-col ${
                  plan.popular
                    ? "border-cyan-500/50 ring-2 ring-cyan-500/20"
                    : "border-gray-700/50"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {plan.name}
                  </h3>
                  <div className="text-4xl font-bold text-white mb-2">
                    {plan.price}
                  </div>
                  <p className="text-gray-400">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li
                      key={`${plan.name}-feature-${idx}`}
                      className="flex items-center text-gray-300"
                    >
                      <Check className="w-5 h-5 text-white mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <motion.button
                  onClick={() => handleSubscribe(plan)}
                  disabled={
                    isProcessingSubscription && selectedPlan === plan.name
                  }
                  className={`w-full py-3 px-6 rounded-xl font-bold transition-all duration-300 mt-auto ${
                    plan.popular
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white"
                      : "border-2 border-border dark:border-gray-600 hover:border-cyan-400 text-foreground/90 dark:text-gray-300 hover:text-foreground dark:hover:text-white"
                  } ${
                    isProcessingSubscription && selectedPlan === plan.name
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  whileHover={
                    isProcessingSubscription && selectedPlan === plan.name
                      ? {}
                      : { scale: 1.02 }
                  }
                  whileTap={
                    isProcessingSubscription && selectedPlan === plan.name
                      ? {}
                      : { scale: 0.98 }
                  }
                >
                  {isProcessingSubscription && selectedPlan === plan.name
                    ? "Processing..."
                    : plan.cta}
                </motion.button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Code Examples */}
        <motion.div
          id="code-examples"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-foreground dark:text-white text-center mb-12">
            Quick Start Examples
          </h2>

          {/* API Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-1 overflow-x-auto">
              {Object.keys(codeExamples).map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${
                    activeTab === key
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {codeExamples[key as keyof typeof codeExamples].title}
                </button>
              ))}
            </div>
          </div>

          {/* Code Example */}
          <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {codeExamples[activeTab as keyof typeof codeExamples].title}
                </h3>
                <p className="text-gray-400">
                  {
                    codeExamples[activeTab as keyof typeof codeExamples]
                      .description
                  }
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Endpoint:</span>
                <code className="bg-gray-800 px-3 py-1 rounded text-white text-sm">
                  {
                    codeExamples[activeTab as keyof typeof codeExamples]
                      .endpoint
                  }
                </code>
              </div>
            </div>

            <div className="space-y-6">
              {/* Request */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-white">Request</h4>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        codeExamples[activeTab as keyof typeof codeExamples]
                          .code,
                        `request-${activeTab}`
                      )
                    }
                    className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                  >
                    {copiedCode === `request-${activeTab}` ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    <span className="text-sm">Copy</span>
                  </button>
                </div>
                <pre className="bg-gray-800 rounded-lg p-4 overflow-x-auto">
                  <code className="text-gray-300 text-sm">
                    {codeExamples[activeTab as keyof typeof codeExamples].code}
                  </code>
                </pre>
              </div>

              {/* Response */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-white">Response</h4>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        codeExamples[activeTab as keyof typeof codeExamples]
                          .response,
                        `response-${activeTab}`
                      )
                    }
                    className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                  >
                    {copiedCode === `response-${activeTab}` ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    <span className="text-sm">Copy</span>
                  </button>
                </div>
                <pre className="bg-gray-800 rounded-lg p-4 overflow-x-auto">
                  <code className="text-gray-300 text-sm">
                    {
                      codeExamples[activeTab as keyof typeof codeExamples]
                        .response
                    }
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Detailed Endpoints Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-foreground dark:text-white text-center mb-12">
            All Available Endpoints
          </h2>

          <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="pb-4 text-white font-semibold">Method</th>
                  <th className="pb-4 text-white font-semibold">Endpoint</th>
                  <th className="pb-4 text-white font-semibold">Description</th>
                  <th className="pb-4 text-white font-semibold">Parameters</th>
                </tr>
              </thead>
              <tbody className="space-y-4">
                <tr className="border-b border-gray-800">
                  <td className="py-4">
                    <span className="bg-green-600 text-white px-2 py-1 rounded text-sm">
                      POST
                    </span>
                  </td>
                  <td className="py-4">
                    <code className="text-white">/extract_text</code>
                  </td>
                  <td className="py-4 text-gray-300">
                    Extract text from PDF documents
                  </td>
                  <td className="py-4 text-gray-400">file (PDF)</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-4">
                    <span className="bg-green-600 text-white px-2 py-1 rounded text-sm">
                      POST
                    </span>
                  </td>
                  <td className="py-4">
                    <code className="text-white">/merge_pdfs</code>
                  </td>
                  <td className="py-4 text-gray-300">
                    Merge multiple PDF files
                  </td>
                  <td className="py-4 text-gray-400">files (PDF array)</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-4">
                    <span className="bg-green-600 text-white px-2 py-1 rounded text-sm">
                      POST
                    </span>
                  </td>
                  <td className="py-4">
                    <code className="text-white">/split_pdf</code>
                  </td>
                  <td className="py-4 text-gray-300">
                    Split PDF into pages or ranges
                  </td>
                  <td className="py-4 text-gray-400">
                    file, split_type, pages
                  </td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-4">
                    <span className="bg-green-600 text-white px-2 py-1 rounded text-sm">
                      POST
                    </span>
                  </td>
                  <td className="py-4">
                    <code className="text-white">/extract_images</code>
                  </td>
                  <td className="py-4 text-gray-300">
                    Extract images from PDFs
                  </td>
                  <td className="py-4 text-gray-400">file (PDF)</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-4">
                    <span className="bg-green-600 text-white px-2 py-1 rounded text-sm">
                      POST
                    </span>
                  </td>
                  <td className="py-4">
                    <code className="text-white">/convert_pdf_to_html</code>
                  </td>
                  <td className="py-4 text-gray-300">
                    Convert PDF to HTML with exact layout preservation
                  </td>
                  <td className="py-4 text-gray-400">
                    pdf (file), method (optional: pymupdf/pdf2htmlex)
                  </td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-4">
                    <span className="bg-green-600 text-white px-2 py-1 rounded text-sm">
                      POST
                    </span>
                  </td>
                  <td className="py-4">
                    <code className="text-white">/convert_html_to_pdf</code>
                  </td>
                  <td className="py-4 text-gray-300">
                    Convert HTML to PDF with 100% layout accuracy
                  </td>
                  <td className="py-4 text-gray-400">
                    html or file (HTML file)
                  </td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-4">
                    <span className="bg-green-600 text-white px-2 py-1 rounded text-sm">
                      POST
                    </span>
                  </td>
                  <td className="py-4">
                    <code className="text-white">/convert-video</code>
                  </td>
                  <td className="py-4 text-gray-300">
                    Convert video formats (MP4, WebM, AVI, MOV)
                  </td>
                  <td className="py-4 text-gray-400">file, output_format</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-4">
                    <span className="bg-green-600 text-white px-2 py-1 rounded text-sm">
                      POST
                    </span>
                  </td>
                  <td className="py-4">
                    <code className="text-white">/convert-audio</code>
                  </td>
                  <td className="py-4 text-gray-300">
                    Convert audio formats (MP3, WAV, AAC, OGG)
                  </td>
                  <td className="py-4 text-gray-400">file, output_format</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-4">
                    <span className="bg-green-600 text-white px-2 py-1 rounded text-sm">
                      POST
                    </span>
                  </td>
                  <td className="py-4">
                    <code className="text-white">/convert-image</code>
                  </td>
                  <td className="py-4 text-gray-300">
                    Convert image formats (JPG, PNG, WebP, BMP)
                  </td>
                  <td className="py-4 text-gray-400">file, output_format</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-4">
                    <span className="bg-green-600 text-white px-2 py-1 rounded text-sm">
                      POST
                    </span>
                  </td>
                  <td className="py-4">
                    <code className="text-white">/generate-qr</code>
                  </td>
                  <td className="py-4 text-gray-300">
                    Generate QR codes with custom styling
                  </td>
                  <td className="py-4 text-gray-400">
                    data, size, color, background_color
                  </td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-4">
                    <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm">
                      GET
                    </span>
                  </td>
                  <td className="py-4">
                    <code className="text-white">
                      /conversion_progress/{"{filename}"}
                    </code>
                  </td>
                  <td className="py-4 text-gray-300">
                    Check conversion progress status
                  </td>
                  <td className="py-4 text-gray-400">filename (path param)</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-4">
                    <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm">
                      GET
                    </span>
                  </td>
                  <td className="py-4">
                    <code className="text-white">/health</code>
                  </td>
                  <td className="py-4 text-gray-300">
                    API health check and status
                  </td>
                  <td className="py-4 text-gray-400">None</td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Subscription Forms - Hidden, auto-submit when triggered */}
        {selectedPlan &&
          zarAmount &&
          pricing
            .filter((p) => p.name === selectedPlan && p.isSubscription)
            .map((plan) => (
              <PayFastForm
                key={plan.name}
                formRef={subscriptionFormRef}
                amount={zarAmount}
                item_name={`${plan.name} Subscription - ${plan.price}`}
                item_description={plan.description}
                subscription_type="1"
                frequency="3"
                cycles="0"
                subscription_notify_email={true}
                subscription_notify_webhook={true}
                subscription_notify_buyer={true}
                autoSubmit={true}
                className="hidden"
              />
            ))}

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-12"
        >
          <h2 className="text-3xl font-bold text-foreground dark:text-white mb-4">
            Ready to Build Something Amazing?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of developers who trust our APIs for their file
            processing needs. Start with free testing, scale to production.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold px-8 py-3 rounded-xl transition-all duration-300 w-full sm:w-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {user ? "Go to Dashboard" : "Get Started Free"}
            </motion.button>
            <motion.button
              onClick={() =>
                window.open("mailto:api@trevnoctilla.com", "_blank")
              }
              className="border-2 border-border dark:border-gray-600 hover:border-cyan-400 text-foreground/90 dark:text-gray-300 hover:text-foreground dark:hover:text-white font-bold px-8 py-3 rounded-xl transition-all duration-300 w-full sm:w-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Contact Sales
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// API Configuration
// Helper function to determine the base URL dynamically
// Returns relative URLs to hide backend Railway URL from frontend
export function getBaseUrl(): string {
  // Client-side: use relative URLs to hide backend URL (ignore NEXT_PUBLIC_API_BASE_URL)
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      // Localhost: use direct backend URL for development
      return "http://localhost:5000";
    }
    // Production: use relative URLs (Next.js rewrites will proxy to Railway)
    // This hides the Railway URL from frontend
    return "";
  }

  // Server-side: can use absolute URL since it's not exposed to browser
  // Check if NEXT_PUBLIC_API_BASE_URL is set for server-side use
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    if (process.env.NEXT_PUBLIC_API_BASE_URL.startsWith("http")) {
      return process.env.NEXT_PUBLIC_API_BASE_URL;
    }
  }

  // Server-side: check NODE_ENV
  const isProduction = process.env.NODE_ENV === "production";
  // Server-side can use absolute URL since it's not exposed to browser
  const baseUrl = isProduction
    ? "https://web-production-737b.up.railway.app"
    : "http://localhost:5000";

  return baseUrl;
}

export const API_CONFIG = {
  // Use getter to resolve URL dynamically
  get BASE_URL() {
    return getBaseUrl();
  },

  // PayFast Configuration
  PAYFAST: {
    MERCHANT_ID: process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_ID || "",
    MERCHANT_KEY: process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_KEY || "",
    PASSPHRASE: process.env.NEXT_PUBLIC_PAYFAST_PASSPHRASE || "",
    // Automatically use sandbox for local, production for deployed
    // Priority: 1. Check if we're on production domain (client-side: window.location, server-side: env var)
    //           2. Explicit NEXT_PUBLIC_PAYFAST_URL env var
    //           3. Auto-detect: production if NODE_ENV=production, else sandbox
    get PAYFAST_URL() {
      const isProduction =
        (typeof window !== "undefined" &&
          /trevnoctilla\.com|www\./.test(window.location.hostname)) ||
        (process.env.NEXT_PUBLIC_BASE_URL &&
          /trevnoctilla\.com|www\./.test(process.env.NEXT_PUBLIC_BASE_URL)) ||
        process.env.NODE_ENV === "production";

      if (isProduction) {
        // ignore env override in prod
        return "https://www.payfast.co.za/eng/process";
      }
      if (process.env.NEXT_PUBLIC_PAYFAST_URL) {
        return process.env.NEXT_PUBLIC_PAYFAST_URL;
      }
      return "https://sandbox.payfast.co.za/eng/process";
    },
    RETURN_URL:
      process.env.NEXT_PUBLIC_PAYFAST_RETURN_URL ||
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/payment/success`,
    CANCEL_URL:
      process.env.NEXT_PUBLIC_PAYFAST_CANCEL_URL ||
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/payment/cancel`,
    NOTIFY_URL:
      process.env.NEXT_PUBLIC_PAYFAST_NOTIFY_URL ||
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/payment/notify`,
  },

  // API endpoints
  ENDPOINTS: {
    // Auth endpoints
    AUTH: {
      LOGIN: "/auth/login",
      REGISTER: "/auth/register",
      PROFILE: "/auth/profile",
      RESET_PASSWORD: "/auth/reset-password",
      CHANGE_PASSWORD: "/auth/change-password",
    },
    // File conversion endpoints
    CONVERSION: {
      PDF_TO_IMAGES: "/convert/pdf-to-images",
      IMAGES_TO_PDF: "/convert/images-to-pdf",
      PDF_MERGE: "/convert/pdf-merge",
      PDF_SPLIT: "/convert/pdf-split",
      PDF_SIGN: "/convert/pdf-sign",
      PDF_EDIT: "/convert/pdf-edit",
      PDF_WATERMARK: "/convert/pdf-watermark",
      PDF_EXTRACT_TEXT: "/convert/pdf-extract-text",
      PDF_EXTRACT_IMAGES: "/convert/pdf-extract-images",
      PDF_TO_HTML: "/convert_pdf_to_html",
      HTML_TO_PDF: "/convert_html_to_pdf",
      VIDEO_CONVERT: "/convert/video",
      AUDIO_CONVERT: "/convert/audio",
      IMAGE_CONVERT: "/convert/image",
      QR_GENERATE: "/convert/qr-generate",
    },
    // Admin endpoints
    ADMIN: {
      USERS: "/admin/users",
      ANALYTICS: "/admin/analytics",
      SETTINGS: "/admin/settings",
    },
  },
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = API_CONFIG.BASE_URL;
  // If baseUrl is empty (relative), just return the endpoint
  if (!baseUrl) {
    return endpoint;
  }
  // Ensure endpoint starts with / if baseUrl is provided
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

// Direct backend URL helper for large file uploads (bypasses Next.js middleware limits)
export const getDirectBackendUrl = (endpoint: string): string => {
  // Check if we're on production domain or if NODE_ENV is production
  const isProduction =
    (typeof window !== "undefined" &&
      (window.location.hostname === "www.trevnoctilla.com" ||
        window.location.hostname === "trevnoctilla.com")) ||
    process.env.NODE_ENV === "production";

  const backendUrl = isProduction
    ? "https://web-production-737b.up.railway.app"
    : "http://localhost:5000";
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${backendUrl}${cleanEndpoint}`;
};

// Helper function to get auth headers
export const getAuthHeaders = (token?: string): HeadersInit => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

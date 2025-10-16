// Backend configuration
export const BACKEND_URL =
  process.env.NODE_ENV === "production"
    ? "https://web-production-737b.up.railway.app"
    : "http://localhost:5000";

// API endpoints
export const API_ENDPOINTS = {
  GENERATE_QR: `${BACKEND_URL}/generate-qr`,
  CONVERT_IMAGE: `${BACKEND_URL}/convert-image`,
  CONVERT_VIDEO: `${BACKEND_URL}/convert-video`,
  CONVERT_AUDIO: `${BACKEND_URL}/convert-audio`,
  CONVERSION_PROGRESS: `${BACKEND_URL}/conversion_progress`,
  PDF_TOOLS: `${BACKEND_URL}`,
  DOWNLOAD_CONVERTED: `${BACKEND_URL}/download_converted`,
  DOWNLOAD_EDITED: `${BACKEND_URL}/download_edited`,
} as const;

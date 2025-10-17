// API Configuration
export const API_CONFIG = {
  // Use production URL in production, localhost in development
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://justpdf-backend-production.up.railway.app' 
    : 'http://localhost:5000',
  
  // API endpoints
  ENDPOINTS: {
    // Auth endpoints
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      PROFILE: '/auth/profile',
      RESET_PASSWORD: '/auth/reset-password',
      CHANGE_PASSWORD: '/auth/change-password',
    },
    
    // Client API endpoints
    CLIENT: {
      STATS: '/api/client/stats',
      ACTIVITY: '/api/client/activity',
      API_KEYS: '/api/client/api-keys',
      JOBS: '/api/client/jobs',
    },
    
    // Admin API endpoints
    ADMIN: {
      USERS: '/api/admin/users',
      STATS: '/api/admin/stats',
      SYSTEM_HEALTH: '/api/admin/system-health',
      API_KEYS: '/api/admin/api-keys',
    },
    
    // File conversion endpoints
    CONVERSION: {
      VIDEO: '/api/v1/convert/video',
      AUDIO: '/api/v1/convert/audio',
      IMAGE: '/api/v1/convert/image',
      PDF: '/api/v1/convert/pdf',
      QR: '/api/v1/generate/qr',
    },
    
    // Legacy endpoints (for existing tools)
    LEGACY: {
      UPLOAD_VIDEO: '/upload_video',
      UPLOAD_AUDIO: '/upload_audio',
      UPLOAD_IMAGE: '/upload_image',
      UPLOAD_PDF: '/upload_pdf',
      PROGRESS: '/progress',
      CANCEL: '/cancel_conversion',
    }
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get auth headers
export const getAuthHeaders = (token: string) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
});
export interface ApiEndpoint {
  id: string;
  name: string;
  method: string;
  path: string;
  description: string;
  parameters: ApiParameter[];
}

export interface ApiParameter {
  name: string;
  type: "text" | "number" | "file" | "select" | "boolean";
  required: boolean;
  description?: string;
  options?: string[];
}

export interface ToolCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  tools: string[];
}

export const TOOL_CATEGORIES: ToolCategory[] = [
  {
    id: "pdf-tools",
    name: "PDF Tools",
    description: "Merge, split, convert and extract from PDF files",
    icon: "📄",
    color: "from-red-500 to-pink-500",
    tools: [
      "merge-pdfs",
      "split-pdf",
      "pdf-to-html",
      "html-to-pdf",
      "extract-text",
      "extract-images",
    ],
  },
  {
    id: "video-converter",
    name: "Video Converter",
    description: "Convert videos to different formats",
    icon: "🎥",
    color: "from-blue-500 to-cyan-500",
    tools: ["convert-video"],
  },
  {
    id: "audio-converter",
    name: "Audio Converter",
    description: "Convert audio files to different formats",
    icon: "🎵",
    color: "from-green-500 to-emerald-500",
    tools: ["convert-audio"],
  },
  {
    id: "image-converter",
    name: "Image Converter",
    description: "Convert images to different formats",
    icon: "🖼️",
    color: "from-purple-500 to-indigo-500",
    tools: ["convert-image"],
  },
  {
    id: "qr-generator",
    name: "QR Generator",
    description: "Generate QR codes from text or URLs",
    icon: "📱",
    color: "from-teal-500 to-cyan-500",
    tools: ["generate-qr"],
  },
];

export const API_ENDPOINTS: Record<string, ApiEndpoint[]> = {
  "pdf-tools": [
    {
      id: "merge-pdfs",
      name: "Merge PDFs",
      method: "POST",
      path: "/api/v1/convert/pdf-merge",
      description: "Merge multiple PDF files into one",
      parameters: [
        {
          name: "files",
          type: "file",
          required: true,
          description: "PDF files to merge (select multiple)",
        },
        {
          name: "output_filename",
          type: "text",
          required: false,
          description: "Name for the merged PDF file",
        },
      ],
    },
    {
      id: "split-pdf",
      name: "Split PDF",
      method: "POST",
      path: "/api/v1/convert/pdf-split",
      description: "Split PDF into multiple pages",
      parameters: [
        {
          name: "file",
          type: "file",
          required: true,
          description: "PDF file to split",
        },
        {
          name: "split_type",
          type: "select",
          required: true,
          description: "How to split the PDF",
          options: ["by_pages", "by_range", "every_page"],
        },
        {
          name: "page_range",
          type: "text",
          required: false,
          description: "Page range (e.g., '1-5,10-15')",
        },
      ],
    },
    {
      id: "extract-text",
      name: "Extract Text from PDF",
      method: "POST",
      path: "/api/v1/convert/pdf-extract-text",
      description: "Extract text content from PDF files",
      parameters: [
        {
          name: "file",
          type: "file",
          required: true,
          description: "PDF file to extract text from",
        },
        {
          name: "output_format",
          type: "select",
          required: false,
          description: "Output format for extracted text",
          options: ["txt", "md", "json", "csv"],
        },
      ],
    },
    {
      id: "extract-images",
      name: "Extract Images from PDF",
      method: "POST",
      path: "/api/v1/convert/pdf-extract-images",
      description: "Extract all images from PDF files",
      parameters: [
        {
          name: "file",
          type: "file",
          required: true,
          description: "PDF file to extract images from",
        },
        {
          name: "output_format",
          type: "select",
          required: false,
          description: "Output image format",
          options: ["png", "jpg", "jpeg"],
        },
        {
          name: "quality",
          type: "number",
          required: false,
          description: "Image quality (1-100)",
        },
      ],
    },
    {
      id: "pdf-to-html",
      name: "Convert PDF to HTML",
      method: "POST",
      path: "/api/v1/convert/pdf-to-html",
      description: "Convert PDF to HTML with layout preservation",
      parameters: [
        {
          name: "file",
          type: "file",
          required: true,
          description: "PDF file to convert",
        },
        {
          name: "include_images",
          type: "boolean",
          required: false,
          description: "Include images in HTML output",
        },
      ],
    },
    {
      id: "html-to-pdf",
      name: "Convert HTML to PDF",
      method: "POST",
      path: "/api/v1/convert/html-to-pdf",
      description: "Convert HTML to PDF with 100% accuracy",
      parameters: [
        {
          name: "html_content",
          type: "text",
          required: true,
          description: "HTML content or URL to convert",
        },
        {
          name: "page_size",
          type: "select",
          required: false,
          description: "Page size",
          options: ["A4", "Letter", "Legal", "A3"],
        },
        {
          name: "orientation",
          type: "select",
          required: false,
          description: "Page orientation",
          options: ["portrait", "landscape"],
        },
      ],
    },
  ],
  "video-converter": [
    {
      id: "convert-video",
      name: "Convert Video",
      method: "POST",
      path: "/api/v1/convert/video",
      description: "Convert video files to different formats",
      parameters: [
        {
          name: "file",
          type: "file",
          required: true,
          description: "Video file to convert",
        },
        {
          name: "output_format",
          type: "select",
          required: true,
          description: "Target video format",
          options: ["mp4", "avi", "mov", "wmv", "flv", "webm"],
        },
        {
          name: "quality",
          type: "select",
          required: false,
          description: "Video quality",
          options: ["low", "medium", "high", "ultra"],
        },
      ],
    },
  ],
  "audio-converter": [
    {
      id: "convert-audio",
      name: "Convert Audio",
      method: "POST",
      path: "/api/v1/convert/audio",
      description: "Convert audio files to different formats",
      parameters: [
        {
          name: "file",
          type: "file",
          required: true,
          description: "Audio file to convert",
        },
        {
          name: "output_format",
          type: "select",
          required: true,
          description: "Target audio format",
          options: ["mp3", "wav", "flac", "aac", "ogg", "m4a"],
        },
        {
          name: "bitrate",
          type: "select",
          required: false,
          description: "Audio bitrate",
          options: ["128", "192", "256", "320"],
        },
      ],
    },
  ],
  "image-converter": [
    {
      id: "convert-image",
      name: "Convert Image",
      method: "POST",
      path: "/api/v1/convert/image",
      description: "Convert image files to different formats",
      parameters: [
        {
          name: "file",
          type: "file",
          required: true,
          description: "Image file to convert",
        },
        {
          name: "output_format",
          type: "select",
          required: true,
          description: "Target image format",
          options: ["jpg", "png", "webp", "bmp", "tiff", "gif"],
        },
        {
          name: "quality",
          type: "number",
          required: false,
          description: "Image quality percentage (1-100)",
        },
      ],
    },
  ],
  "qr-generator": [
    {
      id: "generate-qr",
      name: "Generate QR Code",
      method: "POST",
      path: "/api/v1/convert/qr-generate",
      description: "Generate QR code from text or URL",
      parameters: [
        {
          name: "text",
          type: "text",
          required: true,
          description: "Text or URL to encode in QR code",
        },
        {
          name: "size",
          type: "select",
          required: false,
          description: "QR code size",
          options: ["small", "medium", "large"],
        },
        {
          name: "format",
          type: "select",
          required: false,
          description: "Output format",
          options: ["png", "jpg", "svg"],
        },
      ],
    },
  ],
};

// Endpoint access by subscription tier
// Tiers match database: 'free', 'premium', 'enterprise', 'client'
export const ENDPOINT_ACCESS: Record<string, string[]> = {
  free: ["extract-text", "convert-image", "generate-qr"],
  premium: [
    "merge-pdfs",
    "split-pdf",
    "extract-text",
    "extract-images",
    "convert-video",
    "convert-audio",
    "convert-image",
    "generate-qr",
  ],
  enterprise: [
    "merge-pdfs",
    "split-pdf",
    "extract-text",
    "extract-images",
    "pdf-to-html",
    "html-to-pdf",
    "convert-video",
    "convert-audio",
    "convert-image",
    "generate-qr",
  ],
  client: [
    "merge-pdfs",
    "split-pdf",
    "extract-text",
    "extract-images",
    "pdf-to-html",
    "html-to-pdf",
    "convert-video",
    "convert-audio",
    "convert-image",
    "generate-qr",
  ],
};

// Helper function to check if user has access to an endpoint
export function hasEndpointAccess(
  endpointId: string,
  subscriptionTier: string | null
): boolean {
  if (!subscriptionTier) {
    // Default to free tier if no tier specified
    return ENDPOINT_ACCESS.free.includes(endpointId);
  }

  const tier = subscriptionTier.toLowerCase();
  return ENDPOINT_ACCESS[tier]?.includes(endpointId) || false;
}

export interface ApiEndpoint {
  id: string;
  name: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  parameters: {
    name: string;
    type: "file" | "text" | "number" | "select" | "boolean";
    required: boolean;
    options?: string[];
    min?: number;
    max?: number;
    description?: string;
  }[];
  responseType: "file" | "json" | "image";
  limits?: {
    maxFileSize: string;
    supportedFormats: string[];
    maxPages?: number;
  };
}

export const API_ENDPOINTS: Record<string, ApiEndpoint[]> = {
  video: [
    {
      id: "convert-video",
      name: "Convert Video",
      method: "POST",
      path: "/convert-video",
      description:
        "Convert video files to different formats with quality and compression options",
      parameters: [
        {
          name: "file",
          type: "file",
          required: true,
          description: "Video file to convert",
        },
        {
          name: "outputFormat",
          type: "select",
          required: true,
          options: ["mp4", "avi", "mov", "mkv"],
          description: "Output video format",
        },
        {
          name: "quality",
          type: "number",
          required: false,
          min: 1,
          max: 100,
          description: "Video quality (1-100)",
        },
        {
          name: "compression",
          type: "select",
          required: false,
          options: ["ultrafast", "fast", "medium", "slow", "veryslow"],
          description: "Compression speed",
        },
      ],
      responseType: "file",
    },
  ],
  audio: [
    {
      id: "convert-audio",
      name: "Convert Audio",
      method: "POST",
      path: "/convert-audio",
      description:
        "Convert audio files to different formats with bitrate and quality options",
      parameters: [
        {
          name: "file",
          type: "file",
          required: true,
          description: "Audio file to convert",
        },
        {
          name: "outputFormat",
          type: "select",
          required: true,
          options: ["mp3", "wav", "ogg", "aac", "flac", "opus", "m4a", "wma"],
          description: "Output audio format",
        },
        {
          name: "bitrate",
          type: "select",
          required: false,
          options: ["64k", "128k", "192k", "256k", "320k"],
          description: "Audio bitrate",
        },
        {
          name: "sampleRate",
          type: "select",
          required: false,
          options: ["22050", "44100", "48000", "96000"],
          description: "Sample rate",
        },
        {
          name: "channels",
          type: "select",
          required: false,
          options: ["mono", "stereo", "surround"],
          description: "Audio channels",
        },
        {
          name: "quality",
          type: "number",
          required: false,
          min: 1,
          max: 100,
          description: "Audio quality (1-100)",
        },
      ],
      responseType: "file",
    },
  ],
  image: [
    {
      id: "convert-image",
      name: "Convert Image",
      method: "POST",
      path: "/convert-image",
      description:
        "Convert image files to different formats with resize and compression options",
      parameters: [
        {
          name: "file",
          type: "file",
          required: true,
          description: "Image file to convert",
        },
        {
          name: "outputFormat",
          type: "select",
          required: true,
          options: ["jpg", "png", "webp", "bmp", "tiff", "gif"],
          description: "Output image format",
        },
        {
          name: "quality",
          type: "number",
          required: false,
          min: 1,
          max: 100,
          description: "Image quality (1-100)",
        },
        {
          name: "resize",
          type: "boolean",
          required: false,
          description: "Enable resizing",
        },
        {
          name: "width",
          type: "number",
          required: false,
          min: 1,
          max: 4000,
          description: "Target width (if resize enabled)",
        },
        {
          name: "height",
          type: "number",
          required: false,
          min: 1,
          max: 4000,
          description: "Target height (if resize enabled)",
        },
        {
          name: "maintainAspectRatio",
          type: "boolean",
          required: false,
          description: "Maintain aspect ratio when resizing",
        },
        {
          name: "compression",
          type: "select",
          required: false,
          options: ["low", "medium", "high"],
          description: "Compression level",
        },
      ],
      responseType: "file",
    },
  ],
  qr: [
    {
      id: "generate-qr",
      name: "Generate QR Code",
      method: "POST",
      path: "/generate-qr",
      description: "Generate QR codes for various data types",
      parameters: [
        {
          name: "type",
          type: "select",
          required: true,
          options: [
            "text",
            "url",
            "wifi",
            "email",
            "sms",
            "phone",
            "vcard",
            "location",
            "calendar",
          ],
          description: "QR code type",
        },
        {
          name: "data",
          type: "text",
          required: true,
          description: "Data to encode in QR code",
        },
        {
          name: "size",
          type: "number",
          required: false,
          min: 100,
          max: 1000,
          description: "QR code size in pixels",
        },
      ],
      responseType: "image",
    },
  ],
  pdf: [
    {
      id: "extract-text",
      name: "Extract Text from PDF",
      method: "POST",
      path: "/extract_text",
      description: "Extract text content from PDF files",
      parameters: [
        {
          name: "file",
          type: "file",
          required: true,
          description: "PDF file to extract text from",
        },
      ],
      responseType: "json",
    },
    {
      id: "extract-images",
      name: "Extract Images from PDF",
      method: "POST",
      path: "/extract_images",
      description: "Extract images from PDF files",
      parameters: [
        {
          name: "file",
          type: "file",
          required: true,
          description: "PDF file to extract images from",
        },
      ],
      responseType: "file",
    },
    {
      id: "merge-pdfs",
      name: "Merge PDFs",
      method: "POST",
      path: "/merge_pdfs",
      description: "Merge multiple PDF files into one",
      parameters: [
        {
          name: "files",
          type: "file",
          required: true,
          description: "Multiple PDF files to merge",
        },
      ],
      responseType: "file",
    },
    {
      id: "split-pdf",
      name: "Split PDF",
      method: "POST",
      path: "/api/split_pdf",
      description: "Split PDF into individual pages",
      parameters: [
        {
          name: "file",
          type: "file",
          required: true,
          description: "PDF file to split",
        },
        {
          name: "pages",
          type: "text",
          required: false,
          description: 'Page range (e.g., "1-3,5,7-9")',
        },
      ],
      responseType: "file",
    },
    {
      id: "add-signature",
      name: "Add Signature to PDF",
      method: "POST",
      path: "/add_signature",
      description: "Add digital signature to PDF",
      parameters: [
        {
          name: "file",
          type: "file",
          required: true,
          description: "PDF file to sign",
        },
        {
          name: "signature",
          type: "file",
          required: true,
          description: "Signature image file",
        },
        {
          name: "page",
          type: "number",
          required: false,
          min: 1,
          description: "Page number to add signature to",
        },
        {
          name: "x",
          type: "number",
          required: false,
          description: "X position for signature",
        },
        {
          name: "y",
          type: "number",
          required: false,
          description: "Y position for signature",
        },
      ],
      responseType: "file",
    },
    {
      id: "add-watermark",
      name: "Add Watermark to PDF",
      method: "POST",
      path: "/add_watermark",
      description: "Add watermark to PDF",
      parameters: [
        {
          name: "file",
          type: "file",
          required: true,
          description: "PDF file to watermark",
        },
        {
          name: "watermark",
          type: "file",
          required: true,
          description: "Watermark image file",
        },
        {
          name: "opacity",
          type: "number",
          required: false,
          min: 0.1,
          max: 1.0,
          description: "Watermark opacity (0.1-1.0)",
        },
      ],
      responseType: "file",
    },
  ],
};

export const TOOL_CATEGORIES = [
  {
    id: "video",
    name: "Video Converter",
    icon: "Video",
    color: "#ef4444",
    description: "Convert videos between formats with quality control",
  },
  {
    id: "audio",
    name: "Audio Converter",
    icon: "Music",
    color: "#8b5cf6",
    description: "Convert audio files with bitrate and quality options",
  },
  {
    id: "image",
    name: "Image Converter",
    icon: "Image",
    color: "#06b6d4",
    description: "Convert and resize images with compression control",
  },
  {
    id: "qr",
    name: "QR Generator",
    icon: "QrCode",
    color: "#10b981",
    description: "Generate QR codes for various data types",
  },
  {
    id: "pdf",
    name: "PDF Tools",
    icon: "FileText",
    color: "#f59e0b",
    description: "Extract, merge, split, and modify PDF files",
  },
];

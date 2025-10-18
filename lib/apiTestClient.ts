import { API_CONFIG } from "./config";

export interface ApiTestResult {
  success: boolean;
  status: number;
  responseTime: number;
  data?: any;
  error?: string;
  headers?: Record<string, string>;
}

export interface ApiTestRequest {
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  headers: Record<string, string>;
  body?: FormData | string;
}

export class ApiTestClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  async testEndpoint(request: ApiTestRequest): Promise<ApiTestResult> {
    const startTime = Date.now();

    try {
      const response = await fetch(`${this.baseUrl}${request.endpoint}`, {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });

      const responseTime = Date.now() - startTime;

      // Handle different response types
      let data: any;
      const contentType = response.headers.get("content-type");

      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else if (contentType?.includes("image/")) {
        // For image responses (like QR codes), convert to base64
        const blob = await response.blob();
        data = await this.blobToBase64(blob);
      } else if (
        contentType?.includes("application/octet-stream") ||
        contentType?.includes("application/pdf") ||
        contentType?.includes("video/") ||
        contentType?.includes("audio/")
      ) {
        // For file downloads, create download link
        const blob = await response.blob();
        data = {
          downloadUrl: URL.createObjectURL(blob),
          filename: this.extractFilename(
            response.headers.get("content-disposition")
          ),
          size: blob.size,
          type: contentType,
        };
      } else {
        data = await response.text();
      }

      return {
        success: response.ok,
        status: response.status,
        responseTime,
        data,
        headers: Object.fromEntries(response.headers.entries()),
      };
    } catch (error) {
      return {
        success: false,
        status: 0,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private extractFilename(contentDisposition: string | null): string {
    if (!contentDisposition) return "download";

    const match = contentDisposition.match(
      /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
    );
    return match ? match[1].replace(/['"]/g, "") : "download";
  }

  generateCurlCommand(request: ApiTestRequest): string {
    let curl = `curl -X ${request.method} "${this.baseUrl}${request.endpoint}"`;

    // Add headers
    Object.entries(request.headers).forEach(([key, value]) => {
      curl += ` \\\n  -H "${key}: ${value}"`;
    });

    // Add body if present
    if (request.body) {
      if (request.body instanceof FormData) {
        curl += ` \\\n  -F "file=@filename"`;
      } else {
        curl += ` \\\n  -d '${request.body}'`;
      }
    }

    return curl;
  }

  downloadFile(url: string, filename: string): void {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  copyToClipboard(text: string): Promise<void> {
    return navigator.clipboard.writeText(text);
  }
}

export const apiTestClient = new ApiTestClient();

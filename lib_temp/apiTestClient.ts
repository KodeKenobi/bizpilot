import { getApiUrl } from "@/lib/config";

export interface ApiTestResult {
  success: boolean;
  status: number;
  data?: any;
  error?: string;
  duration: number;
  headers: Record<string, string>;
}

export interface TestEndpointParams {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
  files?: Record<string, File>;
}

export class ApiTestClient {
  async testEndpoint(params: TestEndpointParams): Promise<ApiTestResult> {
    const { url, method, headers, body, files } = params;
    const startTime = Date.now();

    try {
      let requestBody: FormData | string | undefined;

      // If body is already FormData, use it directly
      if (body instanceof FormData) {
        requestBody = body;
      } else if (files && Object.keys(files).length > 0) {
        // Handle file uploads with FormData
        requestBody = new FormData();

        // Add files to FormData
        Object.entries(files).forEach(([key, file]) => {
          if (file && requestBody instanceof FormData) {
            (requestBody as FormData).append(key, file);
          }
        });

        // Add other body parameters
        if (
          body &&
          requestBody instanceof FormData &&
          typeof body === "object"
        ) {
          Object.entries(body).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
              (requestBody as FormData).append(key, String(value));
            }
          });
        }
      } else if (body) {
        // Handle JSON body
        requestBody = JSON.stringify(body);
        headers["Content-Type"] = "application/json";
      }

      // Use getApiUrl to construct the full URL
      const fullUrl = getApiUrl(url);
      console.log("🔗 API Test: Calling", fullUrl);

      // When using FormData, don't set Content-Type - browser will set it with boundary
      const fetchHeaders = { ...headers };
      if (requestBody instanceof FormData) {
        delete fetchHeaders["Content-Type"];
      }

      const response = await fetch(fullUrl, {
        method,
        headers: fetchHeaders,
        body: requestBody,
      });

      const duration = Date.now() - startTime;
      const responseHeaders: Record<string, string> = {};

      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      let responseData;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      return {
        success: response.ok,
        status: response.status,
        data: responseData,
        duration,
        headers: responseHeaders,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        success: false,
        status: 0,
        error: error instanceof Error ? error.message : "Unknown error",
        duration,
        headers: {},
      };
    }
  }

  downloadFile(url: string, filename: string): void {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  generateCurlCommand(params: TestEndpointParams): string {
    const { url, method, headers, body, files } = params;

    let curlCommand = `curl -X ${method.toUpperCase()} "${url}"`;

    // Add headers
    Object.entries(headers).forEach(([key, value]) => {
      curlCommand += ` \\\n  -H "${key}: ${value}"`;
    });

    // Add body
    if (body && Object.keys(body).length > 0) {
      if (files && Object.keys(files).length > 0) {
        // Handle multipart form data
        Object.entries(body).forEach(([key, value]) => {
          curlCommand += ` \\\n  -F "${key}=${value}"`;
        });
        Object.entries(files).forEach(([key, file]) => {
          if (file) {
            curlCommand += ` \\\n  -F "${key}=@${file.name}"`;
          }
        });
      } else {
        // Handle JSON body
        curlCommand += ` \\\n  -d '${JSON.stringify(body)}'`;
      }
    }

    return curlCommand;
  }

  async copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
  }
}

export const apiTestClient = new ApiTestClient();

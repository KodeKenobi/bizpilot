"use client";

import React, { useState } from "react";
import {
  Code,
  Copy,
  Play,
  CheckCircle,
  AlertCircle,
  Key,
  Globe,
  FileText,
  Download,
  Settings,
} from "lucide-react";

interface CodeExample {
  language: string;
  label: string;
  code: string;
}

interface Endpoint {
  method: string;
  path: string;
  description: string;
  parameters: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  responses: Array<{
    status: number;
    description: string;
    example: any;
  }>;
  examples: CodeExample[];
}

export default function ApiDocsPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);
  const [selectedExample, setSelectedExample] = useState<string>("curl");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const endpoints: Endpoint[] = [
    {
      method: "POST",
      path: "/api/v1/convert/video",
      description:
        "Convert video files to different formats with compression and quality control",
      parameters: [
        {
          name: "file",
          type: "file",
          required: true,
          description: "Video file to convert",
        },
        {
          name: "format",
          type: "string",
          required: false,
          description: "Output format (mp4, avi, mov, mkv, webm)",
        },
        {
          name: "quality",
          type: "integer",
          required: false,
          description: "Quality level (40-95, higher = better quality)",
        },
        {
          name: "compression",
          type: "string",
          required: false,
          description:
            "Compression preset (ultrafast, fast, medium, slow, veryslow)",
        },
        {
          name: "async",
          type: "boolean",
          required: false,
          description: "Process asynchronously for large files",
        },
      ],
      responses: [
        {
          status: 200,
          description: "Conversion completed successfully",
          example: {
            job_id: "123e4567-e89b-12d3-a456-426614174000",
            status: "completed",
            download_url:
              "/api/v1/jobs/123e4567-e89b-12d3-a456-426614174000/download",
            processing_time: 12.5,
          },
        },
        {
          status: 202,
          description: "Conversion started asynchronously",
          example: {
            job_id: "123e4567-e89b-12d3-a456-426614174000",
            status: "processing",
            message: "Video conversion started",
            check_status_url:
              "/api/v1/jobs/123e4567-e89b-12d3-a456-426614174000/status",
          },
        },
        {
          status: 400,
          description: "Bad request",
          example: {
            error: "No file provided",
          },
        },
        {
          status: 401,
          description: "Unauthorized",
          example: {
            error: "API key required",
          },
        },
        {
          status: 429,
          description: "Rate limit exceeded",
          example: {
            error: "Rate limit exceeded",
            limit: 1000,
            reset_time: "2024-01-20T15:00:00Z",
          },
        },
      ],
      examples: [
        {
          language: "curl",
          label: "cURL",
          code: `curl -X POST "https://api.trevnoctilla.com/api/v1/convert/video" \\
  -H "X-API-Key: your-api-key-here" \\
  -F "file=@video.mp4" \\
  -F "format=mp4" \\
  -F "quality=85" \\
  -F "compression=medium"`,
        },
        {
          language: "javascript",
          label: "JavaScript",
          code: `const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('format', 'mp4');
formData.append('quality', '85');
formData.append('compression', 'medium');

const response = await fetch('https://api.trevnoctilla.com/api/v1/convert/video', {
  method: 'POST',
  headers: {
    'X-API-Key': 'your-api-key-here'
  },
  body: formData
});

const result = await response.json();
console.log(result);`,
        },
        {
          language: "python",
          label: "Python",
          code: `import requests

url = "https://api.trevnoctilla.com/api/v1/convert/video"
headers = {"X-API-Key": "your-api-key-here"}

files = {"file": open("video.mp4", "rb")}
data = {
    "format": "mp4",
    "quality": "85",
    "compression": "medium"
}

response = requests.post(url, headers=headers, files=files, data=data)
result = response.json()
print(result)`,
        },
      ],
    },
    {
      method: "POST",
      path: "/api/v1/convert/audio",
      description:
        "Convert audio files to different formats with bitrate control",
      parameters: [
        {
          name: "file",
          type: "file",
          required: true,
          description: "Audio file to convert",
        },
        {
          name: "format",
          type: "string",
          required: false,
          description: "Output format (mp3, wav, aac, flac, ogg)",
        },
        {
          name: "bitrate",
          type: "string",
          required: false,
          description: "Audio bitrate (128k, 192k, 256k, 320k)",
        },
      ],
      responses: [
        {
          status: 200,
          description: "Conversion completed successfully",
          example: {
            job_id: "123e4567-e89b-12d3-a456-426614174000",
            status: "completed",
            download_url:
              "/api/v1/jobs/123e4567-e89b-12d3-a456-426614174000/download",
            processing_time: 3.2,
          },
        },
      ],
      examples: [
        {
          language: "curl",
          label: "cURL",
          code: `curl -X POST "https://api.trevnoctilla.com/api/v1/convert/audio" \\
  -H "X-API-Key: your-api-key-here" \\
  -F "file=@audio.wav" \\
  -F "format=mp3" \\
  -F "bitrate=192k"`,
        },
      ],
    },
    {
      method: "GET",
      path: "/api/v1/jobs/{job_id}/status",
      description: "Get the status of an asynchronous job",
      parameters: [
        {
          name: "job_id",
          type: "string",
          required: true,
          description: "Job ID returned from async operations",
        },
      ],
      responses: [
        {
          status: 200,
          description: "Job status retrieved successfully",
          example: {
            job_id: "123e4567-e89b-12d3-a456-426614174000",
            status: "completed",
            endpoint: "/api/v1/convert/video",
            created_at: "2024-01-20T14:30:00Z",
            started_at: "2024-01-20T14:30:05Z",
            completed_at: "2024-01-20T14:30:17Z",
            processing_time: 12.5,
            download_url:
              "/api/v1/jobs/123e4567-e89b-12d3-a456-426614174000/download",
          },
        },
      ],
      examples: [
        {
          language: "curl",
          label: "cURL",
          code: `curl -X GET "https://api.trevnoctilla.com/api/v1/jobs/123e4567-e89b-12d3-a456-426614174000/status" \\
  -H "X-API-Key: your-api-key-here"`,
        },
      ],
    },
  ];

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error("Error copying code:", error);
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-green-100 text-green-800";
      case "POST":
        return "bg-blue-100 text-blue-800";
      case "PUT":
        return "bg-yellow-100 text-yellow-800";
      case "DELETE":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const selectedEndpointData = endpoints.find(
    (ep) => `${ep.method} ${ep.path}` === selectedEndpoint
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            API Documentation
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive API reference for Trevnoctilla's file conversion
            services. Convert videos, audio, images, and process PDFs with our
            powerful API.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Quick Start
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Key className="h-4 w-4 mr-2" />
                    Get your API key
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Code className="h-4 w-4 mr-2" />
                    Make your first request
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Download className="h-4 w-4 mr-2" />
                    Download converted file
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Endpoints
                </h3>
                <nav className="space-y-2">
                  {endpoints.map((endpoint) => (
                    <button
                      key={`${endpoint.method} ${endpoint.path}`}
                      onClick={() =>
                        setSelectedEndpoint(
                          `${endpoint.method} ${endpoint.path}`
                        )
                      }
                      className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        selectedEndpoint ===
                        `${endpoint.method} ${endpoint.path}`
                          ? "bg-purple-100 text-purple-900"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium mr-2 ${getMethodColor(
                            endpoint.method
                          )}`}
                        >
                          {endpoint.method}
                        </span>
                        <span className="truncate">{endpoint.path}</span>
                      </div>
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedEndpointData ? (
              <div className="bg-white rounded-lg shadow">
                {/* Endpoint Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mr-4 ${getMethodColor(
                        selectedEndpointData.method
                      )}`}
                    >
                      {selectedEndpointData.method}
                    </span>
                    <code className="text-lg font-mono text-gray-900">
                      {selectedEndpointData.path}
                    </code>
                  </div>
                  <p className="mt-2 text-gray-600">
                    {selectedEndpointData.description}
                  </p>
                </div>

                {/* Parameters */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Parameters
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Required
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedEndpointData.parameters.map((param, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {param.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                                {param.type}
                              </code>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {param.required ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  Required
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  Optional
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {param.description}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Responses */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Responses
                  </h3>
                  <div className="space-y-4">
                    {selectedEndpointData.responses.map((response, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center mb-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-3 ${
                              response.status >= 200 && response.status < 300
                                ? "bg-green-100 text-green-800"
                                : response.status >= 400
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {response.status}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {response.description}
                          </span>
                        </div>
                        <pre className="bg-gray-100 rounded p-3 text-sm overflow-x-auto">
                          <code>
                            {JSON.stringify(response.example, null, 2)}
                          </code>
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Code Examples */}
                <div className="px-6 py-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Code Examples
                  </h3>

                  {/* Language Tabs */}
                  <div className="flex space-x-1 mb-4">
                    {selectedEndpointData.examples.map((example) => (
                      <button
                        key={example.language}
                        onClick={() => setSelectedExample(example.language)}
                        className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          selectedExample === example.language
                            ? "bg-purple-100 text-purple-900"
                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {example.label}
                      </button>
                    ))}
                  </div>

                  {/* Code Block */}
                  {selectedEndpointData.examples.map(
                    (example) =>
                      selectedExample === example.language && (
                        <div key={example.language} className="relative">
                          <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
                            <code>{example.code}</code>
                          </pre>
                          <button
                            onClick={() => handleCopyCode(example.code)}
                            className="absolute top-2 right-2 p-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 transition-colors"
                          >
                            {copiedCode === example.code ? (
                              <CheckCircle className="h-4 w-4 text-green-400" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      )
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select an Endpoint
                </h3>
                <p className="text-gray-500">
                  Choose an endpoint from the sidebar to view its documentation
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Authentication Section */}
        <div className="mt-12 bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Authentication
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                API Key Authentication
              </h3>
              <p className="text-gray-600 mb-4">
                All API requests require authentication using an API key.
                Include your API key in the request header:
              </p>
              <pre className="bg-gray-100 rounded p-3 text-sm">
                <code>X-API-Key: your-api-key-here</code>
              </pre>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Rate Limiting
              </h3>
              <p className="text-gray-600 mb-4">
                API requests are rate limited per API key. Default limits are:
              </p>
              <ul className="text-gray-600 space-y-1">
                <li>• 1,000 requests per hour (default)</li>
                <li>• Higher limits available for paid plans</li>
                <li>• Rate limit headers included in responses</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="mt-12 bg-purple-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Help?</h2>
          <p className="text-gray-600 mb-6">
            If you have questions or need assistance with the API, we're here to
            help. Contact us at info@trevnoctilla.com
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
              <Globe className="h-4 w-4 mr-2" />
              View Dashboard
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
              <Settings className="h-4 w-4 mr-2" />
              Manage API Keys
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

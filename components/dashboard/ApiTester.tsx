"use client";

import React, { useState, useRef } from "react";
import {
  Send,
  Download,
  Copy,
  FileUp,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { useAlert } from "@/contexts/AlertProvider";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import { apiTestClient, ApiTestResult } from "@/lib/apiTestClient";

interface ApiTesterProps {
  toolId: string;
}

export function ApiTester({ toolId }: ApiTesterProps) {
  const { showSuccess, showError, hideAlert } = useAlert();
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>("");
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [headers, setHeaders] = useState<Record<string, string>>({
    Authorization: "Bearer your-api-key-here",
  });
  const [showKeyGenerator, setShowKeyGenerator] = useState(false);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ApiTestResult | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const endpoints = API_ENDPOINTS[toolId] || [];
  const currentEndpoint = endpoints.find((ep) => ep.id === selectedEndpoint);

  const handleParameterChange = (paramName: string, value: any) => {
    setParameters((prev) => ({
      ...prev,
      [paramName]: value,
    }));
  };

  const handleFileChange = (paramName: string, file: File | null) => {
    setFiles((prev) => ({
      ...prev,
      [paramName]: file,
    }));
  };

  const handleHeaderChange = (key: string, value: string) => {
    setHeaders((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const addHeader = () => {
    const newKey = `header-${Date.now()}`;
    setHeaders((prev) => ({
      ...prev,
      [newKey]: "",
    }));
  };

  const removeHeader = (key: string) => {
    setHeaders((prev) => {
      const newHeaders = { ...prev };
      delete newHeaders[key];
      return newHeaders;
    });
  };

  const generateTestKey = () => {
    setIsGeneratingKey(true);

    setTimeout(() => {
      const mockKey = `test_${Math.random().toString(36).substring(2, 10)}`;

      setHeaders((prev) => ({
        ...prev,
        Authorization: `Bearer ${mockKey}`,
      }));
      setShowKeyGenerator(false);

      showSuccess(
        "Test Key Generated",
        `A test API key has been generated and set in the Authorization header. You can now test the API endpoints.`,
        {
          primary: {
            text: "OK",
            onClick: hideAlert,
          },
        }
      );

      setIsGeneratingKey(false);
    }, 1000);
  };

  const executeRequest = async () => {
    if (!currentEndpoint) return;

    setIsLoading(true);
    setResult(null);

    try {
      const formData = new FormData();

      // Add files
      Object.entries(files).forEach(([paramName, file]) => {
        if (file) {
          formData.append(paramName, file);
        }
      });

      // Add other parameters
      Object.entries(parameters).forEach(([paramName, value]) => {
        if (value !== undefined && value !== "") {
          formData.append(paramName, value.toString());
        }
      });

      const result = await apiTestClient.testEndpoint({
        endpoint: currentEndpoint.path,
        method: currentEndpoint.method,
        headers,
        body: formData,
      });

      setResult(result);
    } catch (error) {
      setResult({
        success: false,
        status: 0,
        responseTime: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadResult = () => {
    if (result?.data?.downloadUrl) {
      apiTestClient.downloadFile(result.data.downloadUrl, result.data.filename);
    }
  };

  const copyCurl = () => {
    if (currentEndpoint) {
      const curlCommand = apiTestClient.generateCurlCommand({
        endpoint: currentEndpoint.path,
        method: currentEndpoint.method,
        headers,
        body: undefined,
      });
      apiTestClient.copyToClipboard(curlCommand);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Circle */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          <div className="w-4 h-4 bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] rounded-full animate-pulse"></div>
          <div className="absolute inset-0 w-4 h-4 bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] rounded-full blur-sm opacity-50"></div>
        </div>
        <h3 className="text-lg font-semibold text-white">API Testing Interface</h3>
      </div>

      {/* Endpoint Selection */}
      <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-gradient-to-r from-[#3b82f6] to-[#2563eb] rounded-full"></div>
          <label className="text-sm font-medium text-white">
            Select API Endpoint
          </label>
        </div>
        <select
          value={selectedEndpoint}
          onChange={(e) => setSelectedEndpoint(e.target.value)}
          className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white focus:border-[#8b5cf6] focus:outline-none transition-colors"
        >
          <option value="">Choose an endpoint...</option>
          {endpoints.map((endpoint) => (
            <option key={endpoint.id} value={endpoint.id}>
              {endpoint.method} - {endpoint.name}
            </option>
          ))}
        </select>
      </div>

      {currentEndpoint && (
        <div className="space-y-6">
          {/* Request Builder - Full Width */}
          <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-gradient-to-r from-[#22c55e] to-[#16a34a] rounded-full"></div>
              <h4 className="text-lg font-semibold text-white">Request Builder</h4>
            </div>

            {/* Parameters */}
            <div className="space-y-3">
              {currentEndpoint.parameters.map((param) => (
                <div key={param.name}>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {param.name}
                    {param.required && (
                      <span className="text-red-400 ml-1">*</span>
                    )}
                  </label>

                  {param.type === "file" ? (
                    <div>
                      <input
                        ref={(el) => {
                          fileInputRefs.current[param.name] = el;
                        }}
                        type="file"
                        onChange={(e) =>
                          handleFileChange(
                            param.name,
                            e.target.files?.[0] || null
                          )
                        }
                        className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-[#8b5cf6] file:text-white hover:file:bg-[#7c3aed] transition-colors"
                      />
                      {files[param.name] && (
                        <p className="text-xs text-gray-400 mt-1">
                          Selected: {files[param.name]?.name}
                        </p>
                      )}
                    </div>
                  ) : param.type === "select" ? (
                    <select
                      value={parameters[param.name] || ""}
                      onChange={(e) =>
                        handleParameterChange(param.name, e.target.value)
                      }
                      className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white focus:border-[#8b5cf6] focus:outline-none"
                    >
                      <option value="">Select {param.name}...</option>
                      {param.options?.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : param.type === "boolean" ? (
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={parameters[param.name] || false}
                        onChange={(e) =>
                          handleParameterChange(param.name, e.target.checked)
                        }
                        className="w-4 h-4 text-[#8b5cf6] bg-[#0a0a0a] border-[#2a2a2a] rounded focus:ring-[#8b5cf6] focus:ring-2"
                      />
                      <span className="text-sm text-gray-300">
                        {param.description || `Enable ${param.name}`}
                      </span>
                    </label>
                  ) : (
                    <input
                      type={param.type === "number" ? "number" : "text"}
                      value={parameters[param.name] || ""}
                      onChange={(e) =>
                        handleParameterChange(
                          param.name,
                          param.type === "number"
                            ? parseFloat(e.target.value) || 0
                            : e.target.value
                        )
                      }
                      placeholder={param.description || `Enter ${param.name}`}
                      className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white focus:border-[#8b5cf6] focus:outline-none"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Headers */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-[#f59e0b] to-[#d97706] rounded-full"></div>
                  <label className="text-sm font-medium text-gray-300">
                    Headers
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowKeyGenerator(!showKeyGenerator)}
                    className="px-3 py-1 bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#16a34a] hover:to-[#15803d] text-white text-xs font-medium rounded-lg transition-all duration-200 flex items-center gap-1 shadow-md hover:shadow-lg"
                  >
                    🔑 Generate Test Key
                  </button>
                  <button
                    onClick={addHeader}
                    className="text-xs text-[#8b5cf6] hover:text-[#7c3aed]"
                  >
                    + Add Header
                  </button>
                </div>
              </div>

              {/* Test Key Generator */}
              {showKeyGenerator && (
                <div className="bg-gradient-to-r from-[#0a0a0a] to-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-[#22c55e] to-[#16a34a] rounded-full animate-pulse"></div>
                      <h4 className="text-sm font-medium text-white">
                        Generate Test Bearer Key
                      </h4>
                    </div>
                    <button
                      onClick={() => setShowKeyGenerator(false)}
                      className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#2a2a2a] transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-xs text-gray-400">
                    Generate a test API key with full permissions for testing
                    this tool. After generation, the key will be automatically
                    set in the Authorization header.
                  </p>
                  <button
                    onClick={generateTestKey}
                    disabled={isGeneratingKey}
                    className="w-full bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#16a34a] hover:to-[#15803d] disabled:from-gray-600 disabled:to-gray-600 text-white px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:shadow-none"
                  >
                    {isGeneratingKey ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Generating...
                      </>
                    ) : (
                      <>🔑 Generate Test Key</>
                    )}
                  </button>
                </div>
              )}

              {Object.entries(headers).map(([key, value]) => (
                <div key={key} className="grid grid-cols-12 gap-2">
                  <input
                    type="text"
                    value={key}
                    onChange={(e) => {
                      const newHeaders = { ...headers };
                      delete newHeaders[key];
                      newHeaders[e.target.value] = value;
                      setHeaders(newHeaders);
                    }}
                    placeholder="Header name"
                    className="col-span-5 bg-[#0a0a0a] border border-[#2a2a2a] rounded px-3 py-2 text-white text-sm focus:border-[#8b5cf6] focus:outline-none"
                  />
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleHeaderChange(key, e.target.value)}
                    placeholder="Header value"
                    className="col-span-6 bg-[#0a0a0a] border border-[#2a2a2a] rounded px-3 py-2 text-white text-sm focus:border-[#8b5cf6] focus:outline-none"
                  />
                  <button
                    onClick={() => removeHeader(key)}
                    className="col-span-1 text-gray-400 hover:text-red-400 p-2 rounded hover:bg-[#2a2a2a] transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Send Button */}
            <button
              onClick={executeRequest}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] hover:from-[#7c3aed] hover:to-[#2563eb] disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:shadow-none"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Request
                </>
              )}
            </button>
          </div>

          {/* Response Viewer - Full Width Below */}
          <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-gradient-to-r from-[#ef4444] to-[#dc2626] rounded-full"></div>
              <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                {result?.success ? (
                  <CheckCircle className="w-4 h-4 text-[#22c55e]" />
                ) : result ? (
                  <XCircle className="w-4 h-4 text-[#ef4444]" />
                ) : (
                  <Clock className="w-4 h-4 text-gray-400" />
                )}
                Response
                {result && (
                  <span className="text-sm font-normal text-gray-400">
                    ({result.status} - {result.responseTime}ms)
                  </span>
                )}
              </h4>
            </div>

            {result ? (
              <div className="space-y-4">
                {/* Response Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        result.success
                          ? "bg-green-900/20 text-green-400 border border-green-800"
                          : "bg-red-900/20 text-red-400 border border-red-800"
                      }`}
                    >
                      {result.success ? "Success" : "Error"}
                    </span>
                    {result.data?.downloadUrl && (
                      <button
                        onClick={downloadResult}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                        title="Download file"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={copyCurl}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                      title="Copy cURL command"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Response Data */}
                <div className="bg-[#0a0a0a] rounded-lg p-4 max-h-96 overflow-auto">
                  {result.data?.downloadUrl ? (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-300">
                        File ready for download:
                      </p>
                      <p className="text-sm text-white font-mono">
                        {result.data.filename}
                      </p>
                      <p className="text-xs text-gray-400">
                        Size: {(result.data.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                      {result.error || JSON.stringify(result.data, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-400">
                  Send a request to see the response
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
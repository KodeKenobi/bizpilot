"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAlert } from "@/contexts/AlertProvider";
import { useUser } from "@/contexts/UserContext";
import { API_ENDPOINTS, hasEndpointAccess } from "../../lib/apiEndpoints";
import { apiTestClient, ApiTestResult } from "../../lib/apiTestClient";
import { getApiUrl } from "@/lib/config";
import { useSession } from "next-auth/react";
import { Lock } from "lucide-react";

interface ApiTesterProps {
  toolId: string;
}

export function ApiTester({ toolId }: ApiTesterProps) {
  const { showSuccess, showError, hideAlert } = useAlert();
  const { user } = useUser();
  const { data: session } = useSession();
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>("");
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [apiKey, setApiKey] = useState<string>("");
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ApiTestResult | null>(null);
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const endpoints = API_ENDPOINTS[toolId] || [];

  // Get subscription tier from user context (fetched from profile endpoint)
  const subscriptionTier = user?.subscription_tier?.toLowerCase() || "free";

  const ensureApiKey = async () => {
    if (apiKey) {
      localStorage.setItem("api_test_key", apiKey);
      return true;
    }

    const hasSession = session?.user;
    const authToken = localStorage.getItem("auth_token");
    let backendToken: string | null = authToken;

    if (hasSession && !backendToken && session?.user?.email) {
      try {
        const tokenResponse = await fetch(
          getApiUrl("/auth/get-token-from-session"),
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: session.user.email,
              // Password no longer required - NextAuth session is trusted
              role:
                (session.user as any)?.role === "super_admin"
                  ? "super_admin"
                  : "user",
            }),
          }
        );

        if (tokenResponse.ok) {
          const backendData = await tokenResponse.json();
          const token = backendData.access_token;
          if (token && typeof token === "string") {
            backendToken = token;
            localStorage.setItem("auth_token", token);
          }
        }
      } catch (error) {}
    }

    if (!backendToken) {
      showError("Authentication Required", "Please log in to test APIs", {
        primary: { text: "OK", onClick: hideAlert },
      });
      return false;
    }

    setIsGeneratingKey(true);
    try {
      const response = await fetch(getApiUrl("/api/client/keys"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${backendToken}`,
        },
        body: JSON.stringify({
          name: `Test Key ${new Date().toLocaleString()}`,
          rate_limit: 1000,
        }),
      });

      if (response.ok) {
        const newKey = await response.json();
        setApiKey(newKey.key);
        localStorage.setItem("api_test_key", newKey.key);
        showSuccess("API Key Generated", "Your test key is ready", {
          primary: { text: "OK", onClick: hideAlert },
        });
        return true;
      } else {
        const error = await response.json();
        showError("Failed to Generate Key", error.error || "Unknown error", {
          primary: { text: "OK", onClick: hideAlert },
        });
        return false;
      }
    } catch (error) {
      showError("Error", "Failed to generate API key", {
        primary: { text: "OK", onClick: hideAlert },
      });
      return false;
    } finally {
      setIsGeneratingKey(false);
    }
  };

  const executeRequest = async (endpoint: (typeof endpoints)[0]) => {
    const hasKey = await ensureApiKey();
    if (!hasKey) return;

    const missingFields: string[] = [];
    endpoint.parameters.forEach((param) => {
      if (param.required) {
        if (param.type === "file") {
          if (!files[`${endpoint.id}_${param.name}`]) {
            missingFields.push(param.name);
          }
        } else {
          const value = parameters[`${endpoint.id}_${param.name}`];
          if (value === undefined || value === null || value === "") {
            missingFields.push(param.name);
          }
        }
      }
    });

    if (missingFields.length > 0) {
      showError(
        "Missing Required Fields",
        `Please fill in: ${missingFields.join(", ")}`,
        { primary: { text: "OK", onClick: hideAlert } }
      );
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      Object.entries(files).forEach(([name, file]) => {
        if (name.startsWith(`${endpoint.id}_`) && file) {
          const paramName = name.replace(`${endpoint.id}_`, "");
          formData.append(paramName, file);
        }
      });
      Object.entries(parameters).forEach(([name, value]) => {
        if (name.startsWith(`${endpoint.id}_`)) {
          const paramName = name.replace(`${endpoint.id}_`, "");
          if (value !== undefined && value !== "") {
            formData.append(paramName, value.toString());
          }
        }
      });

      const result = await apiTestClient.testEndpoint({
        url: endpoint.path,
        method: endpoint.method,
        headers: { Authorization: `Bearer ${apiKey}` },
        body: formData,
      });

      setResult(result);
      setSelectedEndpoint(endpoint.id);
    } catch (error) {
      const errorResult: ApiTestResult = {
        success: false,
        status: 0,
        duration: 0,
        headers: {},
        error: error instanceof Error ? error.message : "Unknown error",
      };
      setResult(errorResult);
      setSelectedEndpoint(endpoint.id);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadResult = () => {
    if (result?.data?.downloadUrl) {
      apiTestClient.downloadFile(result.data.downloadUrl, result.data.filename);
    }
  };

  const clearTest = () => {
    setResult(null);
    setSelectedEndpoint("");
    setParameters({});
    setFiles({});
    // Clear all file inputs
    Object.values(fileInputRefs.current).forEach((ref) => {
      if (ref) {
        ref.value = "";
      }
    });
    showSuccess("Cleared", "Test results and inputs cleared", {
      primary: { text: "OK", onClick: hideAlert },
    });
  };

  const downloadTextOutput = (format: string, endpointId?: string) => {
    if (!result?.data?.text) return;

    const endpointIdToUse = endpointId || selectedEndpoint;
    const outputFormat =
      parameters[`${endpointIdToUse}_output_format`] || "txt";
    let content = "";
    let mimeType = "";
    let filename = "";

    // Get the uploaded file name if available
    const uploadedFileName =
      files[`${endpointIdToUse}_file`]?.name || "document";
    const baseFileName =
      uploadedFileName.replace(".pdf", "") || "extracted_text";

    switch (format || outputFormat) {
      case "txt":
        content = result.data.text;
        mimeType = "text/plain";
        filename = `${baseFileName}_extracted_text.txt`;
        break;
      case "md":
        content = `# ${uploadedFileName}\n\n${result.data.text}`;
        mimeType = "text/markdown";
        filename = `${baseFileName}_extracted_text.md`;
        break;
      case "json":
        content = JSON.stringify(
          {
            fileName: uploadedFileName,
            page_count: result.data.page_count,
            text: result.data.text,
            extracted_at: new Date().toISOString(),
          },
          null,
          2
        );
        mimeType = "application/json";
        filename = `${baseFileName}_extracted_text.json`;
        break;
      case "csv":
        content = `Page,Content\n1,"${result.data.text.replace(/"/g, '""')}"`;
        mimeType = "text/csv";
        filename = `${baseFileName}_extracted_text.csv`;
        break;
      default:
        content = result.data.text;
        mimeType = "text/plain";
        filename = `${baseFileName}_extracted_text.txt`;
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showSuccess("Downloaded", `Text downloaded as ${filename}`, {
      primary: { text: "OK", onClick: hideAlert },
    });
  };

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case "GET":
        return "bg-green-600";
      case "POST":
        return "bg-blue-600";
      case "PUT":
        return "bg-yellow-600";
      case "DELETE":
        return "bg-red-600";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <div className="w-full">
      {/* API Key Bar */}
      <div className="mb-4 p-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Authorize</span>
          {apiKey ? (
            <div className="flex items-center gap-2">
              <code className="text-xs text-gray-300 font-mono">
                {apiKey.slice(0, 16)}...
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(apiKey);
                  showSuccess("Copied", "API key copied", {
                    primary: { text: "OK", onClick: hideAlert },
                  });
                }}
                className="text-xs text-gray-500 hover:text-gray-300"
              >
                Copy
              </button>
            </div>
          ) : (
            <button
              onClick={ensureApiKey}
              disabled={isGeneratingKey}
              className="text-xs text-white bg-[#2a2a2a] hover:bg-[#3a3a3a] px-3 py-1 rounded border border-[#3a3a3a] transition-colors disabled:opacity-50"
            >
              {isGeneratingKey ? "Generating..." : "Authorize"}
            </button>
          )}
        </div>
      </div>

      {/* Endpoints List - Swagger Style */}
      <div className="space-y-1">
        {endpoints.map((endpoint) => {
          const isExpanded = expandedEndpoint === endpoint.id;
          const endpointResult =
            selectedEndpoint === endpoint.id ? result : null;

          const hasAccess = hasEndpointAccess(endpoint.id, subscriptionTier);
          const isDisabled = !hasAccess;

          return (
            <div
              key={endpoint.id}
              className={`border border-[#2a2a2a] rounded bg-[#0a0a0a] ${
                isDisabled ? "opacity-50" : ""
              }`}
            >
              {/* Endpoint Header */}
              <div
                className={`flex items-center gap-3 p-4 transition-colors ${
                  isDisabled
                    ? "cursor-not-allowed"
                    : "cursor-pointer hover:bg-[#1a1a1a]"
                }`}
                onClick={() =>
                  !isDisabled &&
                  setExpandedEndpoint(isExpanded ? null : endpoint.id)
                }
              >
                <span
                  className={`px-2 py-0.5 text-xs font-semibold text-white rounded ${getMethodColor(
                    endpoint.method
                  )}`}
                >
                  {endpoint.method}
                </span>
                <code
                  className={`text-sm font-mono flex-1 ${
                    isDisabled ? "text-gray-600" : "text-gray-300"
                  }`}
                >
                  {endpoint.path}
                </code>
                <span
                  className={`text-xs ${
                    isDisabled ? "text-gray-600" : "text-gray-500"
                  }`}
                >
                  {endpoint.name}
                </span>
                {isDisabled && (
                  <span className="text-xs text-yellow-500 font-medium px-2 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded">
                    🔒 Premium Required
                  </span>
                )}
                {!isDisabled && (
                  <button className="text-xs text-gray-500 hover:text-gray-300">
                    {isExpanded ? "−" : "+"}
                  </button>
                )}
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-[#2a2a2a] p-4 space-y-4">
                  <div className="text-xs text-gray-500 mb-4">
                    {endpoint.description}
                  </div>

                  {/* Parameters Table */}
                  {endpoint.parameters.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-white mb-3">
                        Parameters
                      </div>
                      <div className="space-y-3">
                        {endpoint.parameters.map((param) => (
                          <div
                            key={param.name}
                            className="grid grid-cols-12 gap-4 items-start"
                          >
                            <div className="col-span-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-white">
                                  {param.name}
                                </span>
                                {param.required && (
                                  <span className="text-[10px] text-red-400">
                                    required
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">
                                {param.type}
                              </div>
                            </div>
                            <div className="col-span-9">
                              {param.description && (
                                <div className="text-xs text-gray-500 mb-2">
                                  {param.description}
                                </div>
                              )}
                              {param.type === "file" ? (
                                <div className="space-y-2">
                                  <input
                                    ref={(el) => {
                                      fileInputRefs.current[
                                        `${endpoint.id}_${param.name}`
                                      ] = el;
                                    }}
                                    type="file"
                                    onChange={(e) =>
                                      setFiles((prev) => ({
                                        ...prev,
                                        [`${endpoint.id}_${param.name}`]:
                                          e.target.files?.[0] || null,
                                      }))
                                    }
                                    className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded px-3 py-1.5 text-xs text-gray-300 file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-xs file:bg-[#1a1a1a] file:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isDisabled}
                                  />
                                  {files[`${endpoint.id}_${param.name}`] && (
                                    <div className="text-xs text-green-400 flex items-center gap-2">
                                      <span>✓</span>
                                      <span>
                                        {files[`${endpoint.id}_${param.name}`]
                                          ?.name || "File selected"}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ) : param.type === "select" ? (
                                <select
                                  value={
                                    parameters[
                                      `${endpoint.id}_${param.name}`
                                    ] || ""
                                  }
                                  onChange={(e) =>
                                    setParameters((prev) => ({
                                      ...prev,
                                      [`${endpoint.id}_${param.name}`]:
                                        e.target.value,
                                    }))
                                  }
                                  className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded px-3 py-1.5 text-xs text-white focus:border-[#3a3a3a] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                  disabled={isDisabled}
                                >
                                  <option value="">-- Select --</option>
                                  {param.options?.map((option) => (
                                    <option key={option} value={option}>
                                      {option}
                                    </option>
                                  ))}
                                </select>
                              ) : param.type === "boolean" ? (
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={
                                      parameters[
                                        `${endpoint.id}_${param.name}`
                                      ] || false
                                    }
                                    onChange={(e) =>
                                      setParameters((prev) => ({
                                        ...prev,
                                        [`${endpoint.id}_${param.name}`]:
                                          e.target.checked,
                                      }))
                                    }
                                    className="w-3.5 h-3.5 text-[#8b5cf6] bg-[#0a0a0a] border-[#2a2a2a] rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isDisabled}
                                  />
                                  <span className="text-xs text-gray-400">
                                    {param.description || param.name}
                                  </span>
                                </label>
                              ) : (
                                <div className="relative">
                                  <input
                                    type={
                                      param.type === "number"
                                        ? "number"
                                        : "text"
                                    }
                                    value={
                                      parameters[
                                        `${endpoint.id}_${param.name}`
                                      ] || ""
                                    }
                                    onChange={(e) =>
                                      setParameters((prev) => ({
                                        ...prev,
                                        [`${endpoint.id}_${param.name}`]:
                                          param.type === "number"
                                            ? parseFloat(e.target.value) || 0
                                            : e.target.value,
                                      }))
                                    }
                                    placeholder={
                                      param.description || param.name
                                    }
                                    className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:border-[#3a3a3a] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isDisabled}
                                  />
                                  {param.type === "number" &&
                                    param.name === "quality" &&
                                    parameters[
                                      `${endpoint.id}_${param.name}`
                                    ] && (
                                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none">
                                        %
                                      </span>
                                    )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Execute Button */}
                  <div className="flex items-center justify-end pt-2 border-t border-[#2a2a2a]">
                    {isDisabled ? (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Lock className="w-3 h-3" />
                        <span>Upgrade to access this endpoint</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => executeRequest(endpoint)}
                        disabled={isLoading || !apiKey}
                        className="px-4 py-1.5 text-xs font-medium text-white bg-[#1a1a1a] border border-[#2a2a2a] rounded hover:bg-[#2a2a2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? "Executing..." : "Execute"}
                      </button>
                    )}
                  </div>

                  {/* Response */}
                  {endpointResult && (
                    <div className="pt-4 border-t border-[#2a2a2a]">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-xs font-semibold text-white">
                          Responses
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-xs font-mono font-semibold ${
                              endpointResult.status >= 200 &&
                              endpointResult.status < 300
                                ? "text-green-400"
                                : endpointResult.status >= 400
                                ? "text-red-400"
                                : "text-yellow-400"
                            }`}
                          >
                            {endpointResult.status}
                          </span>
                          <span className="text-xs text-gray-600">
                            {endpointResult.duration}ms
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(
                                JSON.stringify(
                                  endpointResult.data || endpointResult.error,
                                  null,
                                  2
                                )
                              );
                              showSuccess("Copied", "Response copied", {
                                primary: { text: "OK", onClick: hideAlert },
                              });
                            }}
                            className="text-xs text-gray-500 hover:text-gray-300"
                          >
                            Copy
                          </button>
                          <button
                            onClick={clearTest}
                            className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                          >
                            Clear
                          </button>
                        </div>
                      </div>

                      {/* Handle file downloads - check all possible field names */}
                      {endpointResult.data?.downloadUrl ||
                      endpointResult.data?.download_url ||
                      endpointResult.data?.converted_filename ? (
                        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xs text-white font-mono mb-1">
                                {endpointResult.data.filename ||
                                  endpointResult.data.converted_filename ||
                                  "Download file"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {endpointResult.data.size ||
                                endpointResult.data.converted_size
                                  ? (
                                      (endpointResult.data.size ||
                                        endpointResult.data.converted_size ||
                                        0) /
                                      1024 /
                                      1024
                                    ).toFixed(2) + " MB"
                                  : "Ready to download"}
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                const downloadUrl =
                                  endpointResult.data.downloadUrl ||
                                  endpointResult.data.download_url ||
                                  (endpointResult.data.converted_filename
                                    ? `${getApiUrl(
                                        ""
                                      )}/download_converted_video/${
                                        endpointResult.data.converted_filename
                                      }`
                                    : null) ||
                                  (endpointResult.data.converted_filename
                                    ? `${getApiUrl("")}/download_edited/${
                                        endpointResult.data.converted_filename
                                      }`
                                    : null);
                                if (downloadUrl) {
                                  window.open(downloadUrl, "_blank");
                                }
                              }}
                              className="px-3 py-1 text-xs font-medium text-white bg-[#2a2a2a] hover:bg-[#3a3a3a] border border-[#3a3a3a] rounded transition-colors"
                            >
                              Download
                            </button>
                          </div>
                        </div>
                      ) : endpointResult.data?.qr_code ? (
                        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded p-3 space-y-3">
                          <div className="flex items-center justify-center">
                            <img
                              src={endpointResult.data.qr_code}
                              alt="QR Code"
                              className="max-w-full h-auto"
                            />
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                window.open(
                                  endpointResult.data.qr_code,
                                  "_blank"
                                );
                              }}
                              className="px-3 py-1 text-xs font-medium text-white bg-[#2a2a2a] hover:bg-[#3a3a3a] border border-[#3a3a3a] rounded transition-colors"
                            >
                              Download QR Code
                            </button>
                          </div>
                        </div>
                      ) : endpointResult.data?.images ? (
                        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded p-3 space-y-3">
                          <div className="text-xs text-gray-400 mb-2">
                            Found{" "}
                            {endpointResult.data.total_images ||
                              endpointResult.data.images.length}{" "}
                            images
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                            {endpointResult.data.images.map(
                              (img: any, index: number) => (
                                <div
                                  key={index}
                                  className="bg-[#0a0a0a] rounded p-2"
                                >
                                  <img
                                    src={`data:image/png;base64,${img.data}`}
                                    alt={`Image ${
                                      img.image_index || index
                                    } from page ${img.page || "unknown"}`}
                                    className="w-full h-24 object-contain bg-white rounded"
                                    width={96}
                                    height={96}
                                    loading="lazy"
                                  />
                                  <div className="text-xs text-gray-500 mt-1">
                                    Page {img.page || "?"}, Image{" "}
                                    {img.image_index || index + 1}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                          {endpointResult.data.download_url && (
                            <div className="flex items-center justify-center pt-2 border-t border-[#2a2a2a]">
                              <button
                                onClick={() => {
                                  const downloadUrl =
                                    endpointResult.data.download_url.startsWith(
                                      "http"
                                    )
                                      ? endpointResult.data.download_url
                                      : `${getApiUrl("")}${
                                          endpointResult.data.download_url
                                        }`;
                                  window.open(downloadUrl, "_blank");
                                }}
                                className="px-3 py-1 text-xs font-medium text-white bg-[#2a2a2a] hover:bg-[#3a3a3a] border border-[#3a3a3a] rounded transition-colors"
                              >
                                Download All Images (ZIP)
                              </button>
                            </div>
                          )}
                        </div>
                      ) : endpointResult.data?.downloadUrls ? (
                        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded p-3 space-y-2">
                          <div className="text-xs text-gray-400 mb-2">
                            {endpointResult.data.downloadUrls.length} PDF files
                            ready
                          </div>
                          <div className="space-y-1 max-h-48 overflow-y-auto">
                            {endpointResult.data.downloadUrls.map(
                              (url: string, index: number) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between bg-[#0a0a0a] rounded p-2"
                                >
                                  <span className="text-xs text-gray-300">
                                    Page {index + 1}.pdf
                                  </span>
                                  <button
                                    onClick={() => {
                                      const fullUrl = url.startsWith("http")
                                        ? url
                                        : `${getApiUrl("")}${url}`;
                                      window.open(fullUrl, "_blank");
                                    }}
                                    className="px-2 py-0.5 text-xs font-medium text-white bg-[#2a2a2a] hover:bg-[#3a3a3a] border border-[#3a3a3a] rounded transition-colors"
                                  >
                                    Download
                                  </button>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      ) : endpointResult.data?.text ? (
                        <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded p-3 space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-4 text-gray-400">
                              {endpointResult.data.text_length && (
                                <span>
                                  Length:{" "}
                                  {endpointResult.data.text_length.toLocaleString()}{" "}
                                  chars
                                </span>
                              )}
                              {endpointResult.data.processing_time && (
                                <span>
                                  Time:{" "}
                                  {endpointResult.data.processing_time.toFixed(
                                    2
                                  )}
                                  s
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <select
                                onChange={(e) => {
                                  if (e.target.value) {
                                    downloadTextOutput(
                                      e.target.value,
                                      endpoint.id
                                    );
                                    e.target.value = "";
                                  }
                                }}
                                className="text-xs bg-[#1a1a1a] border border-[#2a2a2a] rounded px-2 py-1 text-gray-300 focus:outline-none focus:border-[#3a3a3a]"
                              >
                                <option value="">Download as...</option>
                                <option value="txt">Text (.txt)</option>
                                <option value="md">Markdown (.md)</option>
                                <option value="json">JSON (.json)</option>
                                <option value="csv">CSV (.csv)</option>
                              </select>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    endpointResult.data.text
                                  );
                                  showSuccess(
                                    "Copied",
                                    "Text copied to clipboard",
                                    {
                                      primary: {
                                        text: "OK",
                                        onClick: hideAlert,
                                      },
                                    }
                                  );
                                }}
                                className="text-xs text-gray-500 hover:text-gray-300 px-2 py-1"
                              >
                                Copy
                              </button>
                            </div>
                          </div>
                          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded p-3 max-h-64 overflow-y-auto">
                            <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">
                              {endpointResult.data.text}
                            </pre>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded p-3">
                          <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap overflow-x-auto max-h-64">
                            {endpointResult.error ||
                              JSON.stringify(endpointResult.data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {endpoints.length === 0 && (
        <div className="text-center py-12 text-xs text-gray-600">
          No endpoints available
        </div>
      )}
    </div>
  );
}

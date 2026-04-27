"use client";

import React, { useState } from "react";
import { CheckCircle, Copy } from "lucide-react";
import { API_ENDPOINTS, TOOL_CATEGORIES } from "@/lib/apiEndpoints";
import { getApiUrl } from "@/lib/config";

interface ApiReferenceContentProps {
  section?: string;
}

export function ApiReferenceContent({
  section = "introduction",
}: ApiReferenceContentProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<
    "curl" | "javascript" | "python" | "php"
  >("curl");
  const [expandedSection, setExpandedSection] = useState<string | null>(
    "introduction"
  );

  // Get base URL for API examples
  // For client-side: use frontend domain (Next.js rewrites proxy to backend)
  // For display: show frontend domain instead of empty relative URL
  const getDisplayBaseUrl = () => {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return process.env.NEXT_PUBLIC_BASE_URL || "https://trevnoctilla.com";
  };

  const baseUrl = getApiUrl("");
  const displayBaseUrl = getDisplayBaseUrl();

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getCodeExample = (endpoint: any, language: string): string => {
    const hasFile = endpoint.parameters.some((p: any) => p.type === "file");
    const fileParam = endpoint.parameters.find((p: any) => p.type === "file");
    const otherParams = endpoint.parameters.filter(
      (p: any) => p.type !== "file"
    );

    switch (language) {
      case "curl":
        // For curl examples, use full URL with frontend domain
        const curlBaseUrl = displayBaseUrl;
        if (hasFile) {
          let curlCmd = `curl -X ${endpoint.method} "${curlBaseUrl}${endpoint.path}" \\\n  -H "X-API-Key: your-api-key-here"`;
          if (otherParams.length > 0) {
            otherParams.forEach((param: any) => {
              if (param.type === "text" || param.type === "number") {
                curlCmd += ` \\\n  -F "${param.name}=${
                  param.type === "number" ? "100" : "value"
                }"`;
              } else if (param.type === "select") {
                curlCmd += ` \\\n  -F "${param.name}=${
                  param.options?.[0] || "option"
                }"`;
              } else if (param.type === "boolean") {
                curlCmd += ` \\\n  -F "${param.name}=true"`;
              }
            });
          }
          curlCmd += ` \\\n  -F "${fileParam.name}=@file.${
            fileParam.name === "files"
              ? "pdf"
              : fileParam.name === "file"
              ? "pdf"
              : "mp4"
          }"`;
          return curlCmd;
        } else {
          let curlCmd = `curl -X ${endpoint.method} "${curlBaseUrl}${endpoint.path}" \\\n  -H "X-API-Key: your-api-key-here" \\\n  -H "Content-Type: application/json" \\\n  -d '{`;
          const data: any = {};
          endpoint.parameters.forEach((param: any) => {
            if (param.type === "text") {
              data[param.name] = "value";
            } else if (param.type === "number") {
              data[param.name] = 100;
            } else if (param.type === "select") {
              data[param.name] = param.options?.[0] || "option";
            } else if (param.type === "boolean") {
              data[param.name] = true;
            }
          });
          curlCmd += JSON.stringify(data, null, 2).replace(/\n/g, "\n  ");
          curlCmd += `\n}'`;
          return curlCmd;
        }

      case "javascript":
        if (hasFile) {
          let jsCode = `const formData = new FormData();\n`;
          if (fileParam) {
            jsCode += `formData.append("${fileParam.name}", fileInput.files[0]);\n`;
          }
          otherParams.forEach((param: any) => {
            if (param.type === "text" || param.type === "number") {
              jsCode += `formData.append("${param.name}", "${
                param.type === "number" ? "100" : "value"
              }");\n`;
            } else if (param.type === "select") {
              jsCode += `formData.append("${param.name}", "${
                param.options?.[0] || "option"
              }");\n`;
            } else if (param.type === "boolean") {
              jsCode += `formData.append("${param.name}", "true");\n`;
            }
          });
          jsCode += `\nconst response = await fetch("${baseUrl}${endpoint.path}", {\n`;
          jsCode += `  method: "${endpoint.method}",\n`;
          jsCode += `  headers: {\n`;
          jsCode += `    "X-API-Key": "your-api-key-here"\n`;
          jsCode += `  },\n`;
          jsCode += `  body: formData\n`;
          jsCode += `});\n\nconst data = await response.json();`;
          return jsCode;
        } else {
          let jsCode = `const response = await fetch("${baseUrl}${endpoint.path}", {\n`;
          jsCode += `  method: "${endpoint.method}",\n`;
          jsCode += `  headers: {\n`;
          jsCode += `    "X-API-Key": "your-api-key-here",\n`;
          jsCode += `    "Content-Type": "application/json"\n`;
          jsCode += `  },\n`;
          jsCode += `  body: JSON.stringify({\n`;
          endpoint.parameters.forEach((param: any, index: number) => {
            const comma = index < endpoint.parameters.length - 1 ? "," : "";
            if (param.type === "text") {
              jsCode += `    ${param.name}: "value"${comma}\n`;
            } else if (param.type === "number") {
              jsCode += `    ${param.name}: 100${comma}\n`;
            } else if (param.type === "select") {
              jsCode += `    ${param.name}: "${
                param.options?.[0] || "option"
              }"${comma}\n`;
            } else if (param.type === "boolean") {
              jsCode += `    ${param.name}: true${comma}\n`;
            }
          });
          jsCode += `  })\n`;
          jsCode += `});\n\nconst data = await response.json();`;
          return jsCode;
        }

      case "python":
        if (hasFile) {
          let pyCode = `import requests\n\n`;
          pyCode += `url = "${baseUrl}${endpoint.path}"\n`;
          pyCode += `headers = {"X-API-Key": "your-api-key-here"}\n`;
          pyCode += `files = {`;
          if (fileParam) {
            pyCode += `"${fileParam.name}": ("file.${
              fileParam.name === "files"
                ? "pdf"
                : fileParam.name === "file"
                ? "pdf"
                : "mp4"
            }", open("file.${
              fileParam.name === "files"
                ? "pdf"
                : fileParam.name === "file"
                ? "pdf"
                : "mp4"
            }", "rb"))`;
          }
          pyCode += `}\n`;
          pyCode += `data = {`;
          const dataParams: string[] = [];
          otherParams.forEach((param: any) => {
            if (param.type === "text") {
              dataParams.push(`"${param.name}": "value"`);
            } else if (param.type === "number") {
              dataParams.push(`"${param.name}": 100`);
            } else if (param.type === "select") {
              dataParams.push(
                `"${param.name}": "${param.options?.[0] || "option"}"`
              );
            } else if (param.type === "boolean") {
              dataParams.push(`"${param.name}": True`);
            }
          });
          pyCode += dataParams.join(", ");
          pyCode += `}\n\n`;
          pyCode += `response = requests.${endpoint.method.toLowerCase()}(url, headers=headers, files=files, data=data)\n`;
          pyCode += `data = response.json()`;
          return pyCode;
        } else {
          let pyCode = `import requests\n\n`;
          pyCode += `url = "${baseUrl}${endpoint.path}"\n`;
          pyCode += `headers = {\n`;
          pyCode += `    "X-API-Key": "your-api-key-here",\n`;
          pyCode += `    "Content-Type": "application/json"\n`;
          pyCode += `}\n`;
          pyCode += `data = {`;
          const dataParams: string[] = [];
          endpoint.parameters.forEach((param: any) => {
            if (param.type === "text") {
              dataParams.push(`"${param.name}": "value"`);
            } else if (param.type === "number") {
              dataParams.push(`"${param.name}": 100`);
            } else if (param.type === "select") {
              dataParams.push(
                `"${param.name}": "${param.options?.[0] || "option"}"`
              );
            } else if (param.type === "boolean") {
              dataParams.push(`"${param.name}": True`);
            }
          });
          pyCode += dataParams.join(", ");
          pyCode += `}\n\n`;
          pyCode += `response = requests.${endpoint.method.toLowerCase()}(url, headers=headers, json=data)\n`;
          pyCode += `data = response.json()`;
          return pyCode;
        }

      case "php":
        if (hasFile) {
          let phpCode = `<?php\n\n`;
          phpCode += `$url = "${baseUrl}${endpoint.path}";\n`;
          phpCode += `$headers = ["X-API-Key: your-api-key-here"];\n`;
          phpCode += `$files = [\n`;
          if (fileParam) {
            phpCode += `    "${fileParam.name}" => new CURLFile("file.${
              fileParam.name === "files"
                ? "pdf"
                : fileParam.name === "file"
                ? "pdf"
                : "mp4"
            }")\n`;
          }
          phpCode += `];\n`;
          phpCode += `$data = [`;
          const dataParams: string[] = [];
          otherParams.forEach((param: any) => {
            if (param.type === "text") {
              dataParams.push(`"${param.name}" => "value"`);
            } else if (param.type === "number") {
              dataParams.push(`"${param.name}" => 100`);
            } else if (param.type === "select") {
              dataParams.push(
                `"${param.name}" => "${param.options?.[0] || "option"}"`
              );
            } else if (param.type === "boolean") {
              dataParams.push(`"${param.name}" => true`);
            }
          });
          phpCode += dataParams.join(", ");
          phpCode += `];\n\n`;
          phpCode += `$ch = curl_init($url);\n`;
          phpCode += `curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);\n`;
          phpCode += `curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);\n`;
          phpCode += `curl_setopt($ch, CURLOPT_POST, true);\n`;
          phpCode += `curl_setopt($ch, CURLOPT_POSTFIELDS, array_merge($files, $data));\n`;
          phpCode += `$response = curl_exec($ch);\n`;
          phpCode += `curl_close($ch);\n`;
          phpCode += `$data = json_decode($response, true);`;
          return phpCode;
        } else {
          let phpCode = `<?php\n\n`;
          phpCode += `$url = "${baseUrl}${endpoint.path}";\n`;
          phpCode += `$headers = [\n`;
          phpCode += `    "X-API-Key: your-api-key-here",\n`;
          phpCode += `    "Content-Type: application/json"\n`;
          phpCode += `];\n`;
          phpCode += `$data = [`;
          const dataParams: string[] = [];
          endpoint.parameters.forEach((param: any) => {
            if (param.type === "text") {
              dataParams.push(`"${param.name}" => "value"`);
            } else if (param.type === "number") {
              dataParams.push(`"${param.name}" => 100`);
            } else if (param.type === "select") {
              dataParams.push(
                `"${param.name}" => "${param.options?.[0] || "option"}"`
              );
            } else if (param.type === "boolean") {
              dataParams.push(`"${param.name}" => true`);
            }
          });
          phpCode += dataParams.join(", ");
          phpCode += `];\n\n`;
          phpCode += `$ch = curl_init($url);\n`;
          phpCode += `curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);\n`;
          phpCode += `curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);\n`;
          phpCode += `curl_setopt($ch, CURLOPT_POST, true);\n`;
          phpCode += `curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));\n`;
          phpCode += `$response = curl_exec($ch);\n`;
          phpCode += `curl_close($ch);\n`;
          phpCode += `$data = json_decode($response, true);`;
          return phpCode;
        }

      default:
        return "";
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const renderSection = () => {
    switch (section) {
      case "introduction":
        return (
          <section id="introduction" className="mb-12">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-8">
              <h2 className="text-2xl font-semibold mb-4 text-white">
                Introduction
              </h2>
              <p className="text-gray-300 mb-4 leading-relaxed">
                The Trevnoctilla API is organized around REST. Our API has
                predictable resource-oriented URLs, accepts form-encoded request
                bodies, returns JSON-encoded responses, and uses standard HTTP
                response codes, authentication, and verbs.
              </p>
              <p className="text-gray-300 mb-4 leading-relaxed">
                You can use the Trevnoctilla API in test mode, which doesn't
                affect your production usage limits. The API key you use to
                authenticate the request determines whether the request is in
                test mode or production mode.
              </p>
            </div>
          </section>
        );

      case "base-url":
        return (
          <section id="base-url" className="mb-12">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-8">
              <h2 className="text-2xl font-semibold mb-4 text-white">
                Base URL
              </h2>
              <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded p-4 font-mono text-sm text-white">
                {displayBaseUrl}
              </div>
              <p className="text-gray-300 mt-4 text-sm">
                All API requests should be made to this base URL. All endpoints
                are relative to this URL. Next.js automatically proxies requests
                to the backend (Railway URL is hidden from users).
              </p>
            </div>
          </section>
        );

      case "authentication":
        return (
          <section id="authentication" className="mb-12">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-8">
              <h2 className="text-2xl font-semibold mb-4 text-white">
                Authentication
              </h2>
              <p className="text-gray-300 mb-4 leading-relaxed">
                The Trevnoctilla API uses API keys to authenticate requests. You
                can view and manage your API keys in the Dashboard.
              </p>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Your API keys carry many privileges, so be sure to keep them
                secure! Do not share your secret API keys in publicly accessible
                areas such as GitHub, client-side code, and so forth.
              </p>
              <p className="text-gray-300 mb-6 leading-relaxed">
                All API requests must be made over HTTPS. Calls made over plain
                HTTP will fail. API requests without authentication will also
                fail.
              </p>

              <h3 className="text-xl font-semibold mb-3 text-white">
                Authenticated Request
              </h3>
              <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded p-4 relative">
                <button
                  onClick={() =>
                    copyToClipboard(
                      `curl "${displayBaseUrl}/api/v1/convert/pdf-extract-text" \\\n  -H "X-API-Key: your-api-key-here" \\\n  -F "file=@document.pdf"`,
                      "auth-example"
                    )
                  }
                  className="absolute top-2 right-2 text-gray-500 hover:text-white transition-colors"
                >
                  {copiedCode === "auth-example" ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
                <pre className="text-sm text-gray-300 font-mono overflow-x-auto">
                  {`curl "${displayBaseUrl}/api/v1/convert/pdf-extract-text" \\
  -H "X-API-Key: your-api-key-here" \\
  -F "file=@document.pdf"`}
                </pre>
              </div>
              <p className="text-gray-400 mt-4 text-sm">
                Include your API key in the{" "}
                <code className="bg-[#0a0a0a] px-2 py-1 rounded text-xs">
                  X-API-Key
                </code>{" "}
                header with every request.
              </p>
            </div>
          </section>
        );

      case "errors":
        return (
          <section id="errors" className="mb-12">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-8">
              <h2 className="text-2xl font-semibold mb-4 text-white">Errors</h2>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Trevnoctilla uses conventional HTTP response codes to indicate
                the success or failure of an API request. In general:
              </p>
              <ul className="list-disc list-inside text-gray-300 mb-6 space-y-2">
                <li>
                  Codes in the{" "}
                  <code className="bg-[#0a0a0a] px-2 py-1 rounded text-xs">
                    2xx
                  </code>{" "}
                  range indicate success.
                </li>
                <li>
                  Codes in the{" "}
                  <code className="bg-[#0a0a0a] px-2 py-1 rounded text-xs">
                    4xx
                  </code>{" "}
                  range indicate an error that failed given the information
                  provided (e.g., a required parameter was omitted,
                  authentication failed, etc.).
                </li>
                <li>
                  Codes in the{" "}
                  <code className="bg-[#0a0a0a] px-2 py-1 rounded text-xs">
                    5xx
                  </code>{" "}
                  range indicate an error with our servers (these are rare).
                </li>
              </ul>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-[#2a2a2a]">
                      <th className="text-left py-3 px-4 text-sm font-semibold">
                        Status Code
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">
                        Meaning
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        code: 200,
                        meaning: "OK",
                        desc: "Everything worked as expected.",
                      },
                      {
                        code: 400,
                        meaning: "Bad Request",
                        desc: "The request was unacceptable, often due to missing a required parameter.",
                      },
                      {
                        code: 401,
                        meaning: "Unauthorized",
                        desc: "No valid API key provided.",
                      },
                      {
                        code: 403,
                        meaning: "Forbidden",
                        desc: "The API key doesn't have permissions to perform the request.",
                      },
                      {
                        code: 404,
                        meaning: "Not Found",
                        desc: "The requested resource doesn't exist.",
                      },
                      {
                        code: 429,
                        meaning: "Too Many Requests",
                        desc: "Too many requests hit the API too quickly. We recommend implementing rate limiting.",
                      },
                      {
                        code: "500, 502, 503, 504",
                        meaning: "Server Errors",
                        desc: "Something went wrong on our end. (These are rare.)",
                      },
                    ].map((error) => (
                      <tr
                        key={error.code}
                        className="border-b border-[#2a2a2a] hover:bg-[#0a0a0a] transition-colors"
                      >
                        <td className="py-3 px-4">
                          <code className="text-white">{error.code}</code>
                        </td>
                        <td className="py-3 px-4 text-gray-300">
                          {error.meaning}
                        </td>
                        <td className="py-3 px-4 text-gray-400">
                          {error.desc}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 bg-[#0a0a0a] border border-[#2a2a2a] rounded p-4">
                <h4 className="font-semibold mb-2 text-white">
                  Error Response Format
                </h4>
                <pre className="text-sm text-gray-300 font-mono overflow-x-auto">
                  {JSON.stringify(
                    {
                      error: "Invalid API key",
                      message:
                        "The provided API key is not valid or has been revoked.",
                      code: "invalid_api_key",
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>
          </section>
        );

      case "endpoints":
        return (
          <section id="endpoints" className="mb-12">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-8">
              <h2 className="text-2xl font-semibold mb-6 text-white">
                API Endpoints
              </h2>

              {/* Language Selector */}
              <div className="mb-6 flex gap-2 border-b border-[#2a2a2a]">
                {(["curl", "javascript", "python", "php"] as const).map(
                  (lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLanguage(lang)}
                      className={`px-4 py-2 text-sm font-medium transition-colors ${
                        selectedLanguage === lang
                          ? "text-white border-b-2 border-cyan-400"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {lang === "curl"
                        ? "cURL"
                        : lang === "javascript"
                        ? "JavaScript"
                        : lang === "python"
                        ? "Python"
                        : "PHP"}
                    </button>
                  )
                )}
              </div>

              {/* Endpoints by Category */}
              {TOOL_CATEGORIES.map((category) => {
                const endpoints = API_ENDPOINTS[category.id] || [];
                if (endpoints.length === 0) return null;

                return (
                  <div key={category.id} className="mb-8">
                    <h3 className="text-xl font-semibold mb-4 text-white">
                      {category.name}
                    </h3>
                    <p className="text-gray-400 mb-4 text-sm">
                      {category.description}
                    </p>

                    {endpoints.map((endpoint) => (
                      <div
                        key={endpoint.id}
                        className="mb-6 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-6"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span
                                className={`px-2 py-1 rounded text-xs font-semibold ${
                                  endpoint.method === "POST"
                                    ? "bg-blue-600 text-white"
                                    : endpoint.method === "GET"
                                    ? "bg-green-600 text-white"
                                    : endpoint.method === "PUT"
                                    ? "bg-yellow-600 text-white"
                                    : "bg-red-600 text-white"
                                }`}
                              >
                                {endpoint.method}
                              </span>
                              <code className="text-white text-sm">
                                {endpoint.path}
                              </code>
                            </div>
                            <h4 className="text-lg font-semibold text-white mb-2">
                              {endpoint.name}
                            </h4>
                            <p className="text-gray-400 text-sm">
                              {endpoint.description}
                            </p>
                          </div>
                        </div>

                        {/* Parameters */}
                        {endpoint.parameters.length > 0 && (
                          <div className="mb-4">
                            <h5 className="text-sm font-semibold text-white mb-3">
                              Parameters
                            </h5>
                            <div className="overflow-x-auto">
                              <table className="w-full border-collapse text-sm">
                                <thead>
                                  <tr className="border-b border-[#2a2a2a]">
                                    <th className="text-left py-2 px-3 font-semibold text-gray-400">
                                      Name
                                    </th>
                                    <th className="text-left py-2 px-3 font-semibold text-gray-400">
                                      Type
                                    </th>
                                    <th className="text-left py-2 px-3 font-semibold text-gray-400">
                                      Required
                                    </th>
                                    <th className="text-left py-2 px-3 font-semibold text-gray-400">
                                      Description
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {endpoint.parameters.map((param) => (
                                    <tr
                                      key={param.name}
                                      className="border-b border-[#2a2a2a] hover:bg-[#1a1a1a] transition-colors"
                                    >
                                      <td className="py-2 px-3">
                                        <code className="text-white">
                                          {param.name}
                                        </code>
                                        {param.required && (
                                          <span className="text-red-400 ml-2 text-xs">
                                            *
                                          </span>
                                        )}
                                      </td>
                                      <td className="py-2 px-3 text-gray-400">
                                        {param.type}
                                      </td>
                                      <td className="py-2 px-3 text-gray-400">
                                        {param.required ? "Yes" : "No"}
                                      </td>
                                      <td className="py-2 px-3 text-gray-400">
                                        {param.description || "—"}
                                        {param.options && (
                                          <div className="mt-1 text-xs text-gray-500">
                                            Options: {param.options.join(", ")}
                                          </div>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Code Example */}
                        <div className="mb-4">
                          <h5 className="text-sm font-semibold text-white mb-2">
                            Example Request
                          </h5>
                          <div className="bg-[#000000] border border-[#2a2a2a] rounded p-4 relative">
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  getCodeExample(endpoint, selectedLanguage),
                                  `${endpoint.id}-${selectedLanguage}`
                                )
                              }
                              className="absolute top-2 right-2 text-gray-500 hover:text-white transition-colors"
                            >
                              {copiedCode ===
                              `${endpoint.id}-${selectedLanguage}` ? (
                                <CheckCircle className="w-5 h-5 text-green-400" />
                              ) : (
                                <Copy className="w-5 h-5" />
                              )}
                            </button>
                            <pre className="text-xs text-gray-300 font-mono overflow-x-auto">
                              {getCodeExample(endpoint, selectedLanguage)}
                            </pre>
                          </div>
                        </div>

                        {/* Example Response */}
                        <div>
                          <h5 className="text-sm font-semibold text-white mb-2">
                            Example Response
                          </h5>
                          <div className="bg-[#000000] border border-[#2a2a2a] rounded p-4">
                            <pre className="text-xs text-gray-300 font-mono overflow-x-auto">
                              {JSON.stringify(
                                {
                                  job_id:
                                    "123e4567-e89b-12d3-a456-426614174000",
                                  status: "completed",
                                  message: "Operation completed successfully",
                                  ...(endpoint.id === "extract-text" && {
                                    text: "Extracted text content...",
                                    text_length: 1523,
                                    processing_time: 1.058,
                                  }),
                                  ...(endpoint.id.includes("convert") && {
                                    download_url:
                                      "/download_converted/file.pdf",
                                    filename: "converted_file.pdf",
                                    file_size: 5242880,
                                  }),
                                },
                                null,
                                2
                              )}
                            </pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </section>
        );

      case "integration":
        return (
          <section id="integration" className="mb-12">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-8">
              <h2 className="text-2xl font-semibold mb-6 text-white">
                Integration Guides
              </h2>

              <div className="space-y-6">
                {/* Web Forms */}
                <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-3 text-white">
                    Adding to Web Forms
                  </h3>
                  <p className="text-gray-400 mb-4 text-sm">
                    Upload and process files directly from HTML forms using
                    JavaScript.
                  </p>
                  <div className="bg-[#000000] border border-[#2a2a2a] rounded p-4">
                    <pre className="text-xs text-gray-300 font-mono overflow-x-auto">
                      {`<form id="uploadForm">
  <input type="file" id="fileInput" accept=".pdf" />
  <button type="submit">Extract Text</button>
</form>

<script>
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData();
  formData.append('file', document.getElementById('fileInput').files[0]);
  
  const response = await fetch('${baseUrl}/api/v1/convert/pdf-extract-text', {
    method: 'POST',
    headers: {
      'X-API-Key': 'your-api-key-here'
    },
    body: formData
  });
  
  const data = await response.json();
  });
</script>`}
                    </pre>
                  </div>
                </div>

                {/* Node.js */}
                <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-3 text-white">
                    Node.js Integration
                  </h3>
                  <p className="text-gray-400 mb-4 text-sm">
                    Use the Trevnoctilla API in your Node.js applications with
                    the native fetch API or axios.
                  </p>
                  <div className="bg-[#000000] border border-[#2a2a2a] rounded p-4">
                    <pre className="text-xs text-gray-300 font-mono overflow-x-auto">
                      {`const FormData = require('form-data');
const fs = require('fs');
const fetch = require('node-fetch');

async function extractTextFromPDF(filePath) {
  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));
  
  const response = await fetch('${baseUrl}/api/v1/convert/pdf-extract-text', {
    method: 'POST',
    headers: {
      'X-API-Key': 'your-api-key-here',
      ...formData.getHeaders()
    },
    body: formData
  });
  
  const data = await response.json();
  return data;
}`}
                    </pre>
                  </div>
                </div>

                {/* Python */}
                <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-3 text-white">
                    Python Integration
                  </h3>
                  <p className="text-gray-400 mb-4 text-sm">
                    Integrate Trevnoctilla API into your Python applications
                    using the requests library.
                  </p>
                  <div className="bg-[#000000] border border-[#2a2a2a] rounded p-4">
                    <pre className="text-xs text-gray-300 font-mono overflow-x-auto">
                      {`import requests

def extract_text_from_pdf(file_path):
    url = "${baseUrl}/api/v1/convert/pdf-extract-text"
    headers = {"X-API-Key": "your-api-key-here"}
    
    with open(file_path, 'rb') as f:
        files = {'file': f}
        response = requests.post(url, headers=headers, files=files)
    
    return response.json()`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );

      default:
        return (
          <section id="introduction" className="mb-12">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-8">
              <h2 className="text-2xl font-semibold mb-4 text-white">
                Introduction
              </h2>
              <p className="text-gray-300 mb-4 leading-relaxed">
                The Trevnoctilla API is organized around REST. Our API has
                predictable resource-oriented URLs, accepts form-encoded request
                bodies, returns JSON-encoded responses, and uses standard HTTP
                response codes, authentication, and verbs.
              </p>
              <p className="text-gray-300 mb-4 leading-relaxed">
                You can use the Trevnoctilla API in test mode, which doesn't
                affect your production usage limits. The API key you use to
                authenticate the request determines whether the request is in
                test mode or production mode.
              </p>
            </div>
          </section>
        );
    }
  };

  return <div className="space-y-8">{renderSection()}</div>;
}

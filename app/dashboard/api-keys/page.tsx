"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  Key,
  Calendar,
  Activity,
  AlertCircle,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import Link from "next/link";

interface ApiKey {
  id: number;
  name: string;
  key: string;
  is_active: boolean;
  created_at: string;
  last_used: string;
  rate_limit: number;
}

export default function ApiKeysPage() {
  const { user, loading: userLoading } = useUser();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newKey, setNewKey] = useState<ApiKey | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<number>>(new Set());
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);

  // Authentication guard - only redirect if we're sure user is not logged in
  useEffect(() => {
    if (!userLoading && !user) {
      // Check if there's a token in localStorage before redirecting
      const token = localStorage.getItem("auth_token");
      if (!token) {
        // Only redirect if there's no token at all
        window.location.href = "/auth/login";
        return;
      }
      // If there's a token but user is not loaded yet, wait a bit more
      // This gives time for the user context to load when switching views
      const timeout = setTimeout(() => {
        if (!user) {
          window.location.href = "/auth/login";
        }
      }, 2000); // Wait 2 seconds before redirecting

      return () => clearTimeout(timeout);
    }
  }, [user, userLoading]);

  useEffect(() => {
    if (user) {
      fetchApiKeys();
    }
  }, [user]);

  const fetchApiKeys = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setLoading(false);
        return;
      }

      // Use relative URL to hide Railway backend URL
      const backendUrl =
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1")
          ? "http://localhost:5000"
          : "";

      const response = await fetch(`${backendUrl}/api/client/keys`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Transform backend format to match frontend interface
        const transformedKeys = data.map((key: any) => ({
          id: key.id,
          name: key.name,
          key: key.key || key.key_value || "",
          is_active: key.is_active,
          created_at: key.created_at,
          last_used: key.last_used || "",
          rate_limit: key.rate_limit || 1000,
        }));
        setApiKeys(transformedKeys);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleCreateKey = async (name: string, rateLimit: number) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        alert("Please log in to create API keys");
        return;
      }

      // Use relative URL to hide Railway backend URL
      const backendUrl =
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1")
          ? "http://localhost:5000"
          : "";

      const response = await fetch(`${backendUrl}/api/client/keys`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name || `API Key ${new Date().toLocaleString()}`,
          rate_limit: rateLimit || 1000,
        }),
      });

      if (response.ok) {
        const newKeyData = await response.json();
        const newKey: ApiKey = {
          id: newKeyData.id,
          name: newKeyData.name,
          key: newKeyData.key || newKeyData.key_value || "",
          is_active: newKeyData.is_active,
          created_at: newKeyData.created_at,
          last_used: newKeyData.last_used || "",
          rate_limit: newKeyData.rate_limit || rateLimit,
        };

        setApiKeys([newKey, ...apiKeys]);
        setNewKey(newKey);
        setShowCreateModal(false);
        setShowKeyModal(true);
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.error || "Failed to create API key");
      }
    } catch (error) {
      alert("An error occurred while creating the API key");
    }
  };

  const handleToggleKeyVisibility = (keyId: number) => {
    setVisibleKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  };

  const handleCopyKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      // You could add a toast notification here
    } catch (error) {}
  };

  const handleDeleteKey = async (keyId: number) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this API key? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        alert("Please log in to delete API keys");
        return;
      }

      // Use relative URL to hide Railway backend URL
      const backendUrl =
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1")
          ? "http://localhost:5000"
          : "";

      const response = await fetch(`${backendUrl}/api/client/keys/${keyId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setApiKeys(apiKeys.filter((key) => key.id !== keyId));
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.error || "Failed to delete API key");
      }
    } catch (error) {
      alert("An error occurred while deleting the API key");
    }
  };

  const handleToggleKeyStatus = async (keyId: number) => {
    try {
      setApiKeys(
        apiKeys.map((key) =>
          key.id === keyId ? { ...key, is_active: !key.is_active } : key
        )
      );
    } catch (error) {}
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const maskKey = (key: string) => {
    return key.substring(0, 8) + "•".repeat(24) + key.substring(key.length - 8);
  };

  // Show loading while checking authentication
  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading API keys...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center p-8 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-4">
            You must be logged in to access this page.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">API Keys</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your API keys for accessing the conversion services
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 sm:w-auto"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New API Key
          </button>
        </div>
      </div>

      {/* API Keys List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {apiKeys.map((key) => (
            <li key={key.id}>
              <div className="px-4 py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <Key className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-gray-900">
                        {key.name}
                      </p>
                      <span
                        className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          key.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {key.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                        {visibleKeys.has(key.id) ? key.key : maskKey(key.key)}
                      </code>
                    </div>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4" />
                      Created {formatDate(key.created_at)}
                      {key.last_used && (
                        <>
                          <span className="mx-2">•</span>
                          <Activity className="flex-shrink-0 mr-1.5 h-4 w-4" />
                          Last used {formatDate(key.last_used)}
                        </>
                      )}
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      Rate limit: {key.rate_limit} requests/hour
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleKeyVisibility(key.id)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    {visibleKeys.has(key.id) ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleCopyKey(key.key)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleToggleKeyStatus(key.id)}
                    className={`inline-flex items-center px-3 py-2 border shadow-sm text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                      key.is_active
                        ? "border-red-300 text-red-700 bg-white hover:bg-red-50"
                        : "border-green-300 text-green-700 bg-white hover:bg-green-50"
                    }`}
                  >
                    {key.is_active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => handleDeleteKey(key.id)}
                    className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Create Key Modal */}
      {showCreateModal && (
        <CreateKeyModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateKey}
        />
      )}

      {/* Show New Key Modal */}
      {showKeyModal && newKey && (
        <ShowKeyModal
          apiKey={newKey}
          onClose={() => {
            setShowKeyModal(false);
            setNewKey(null);
          }}
        />
      )}
    </div>
  );
}

function CreateKeyModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (name: string, rateLimit: number) => void;
}) {
  const [name, setName] = useState("");
  const [rateLimit, setRateLimit] = useState(1000);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim(), rateLimit);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 sm:mx-0 sm:h-10 sm:w-10">
                  <Key className="h-6 w-6 text-purple-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Create New API Key
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label
                        htmlFor="key-name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Key Name
                      </label>
                      <input
                        type="text"
                        name="key-name"
                        id="key-name"
                        className="mt-1 focus:ring-purple-500 focus:border-purple-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        placeholder="e.g., Production Key"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="rate-limit"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Rate Limit (requests per hour)
                      </label>
                      <select
                        name="rate-limit"
                        id="rate-limit"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
                        value={rateLimit}
                        onChange={(e) => setRateLimit(Number(e.target.value))}
                      >
                        <option value={100}>100 requests/hour</option>
                        <option value={500}>500 requests/hour</option>
                        <option value={1000}>1,000 requests/hour</option>
                        <option value={5000}>5,000 requests/hour</option>
                        <option value={10000}>10,000 requests/hour</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Create Key
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function ShowKeyModal({
  apiKey,
  onClose,
}: {
  apiKey: ApiKey;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {}
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                <Key className="h-6 w-6 text-green-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  API Key Created Successfully
                </h3>
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-4">
                    Your new API key has been created. Please copy it now as you
                    won't be able to see it again.
                  </p>
                  <div className="bg-gray-100 p-3 rounded-md">
                    <code className="text-sm font-mono break-all">
                      {apiKey.key}
                    </code>
                  </div>
                  <div className="mt-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                      <div className="flex">
                        <AlertCircle className="h-5 w-5 text-yellow-400" />
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800">
                            Important Security Notice
                          </h3>
                          <div className="mt-2 text-sm text-yellow-700">
                            <p>
                              Store this API key securely. Never share it
                              publicly or commit it to version control.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={handleCopy}
            >
              {copied ? "Copied!" : "Copy Key"}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import {
  Key,
  Plus,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed?: string;
  isActive: boolean;
  permissions: string[];
}

interface ApiKeysSectionProps {
  apiKeys: ApiKey[];
  onCreateKey: (name: string) => void;
  onDeleteKey: (keyId: string) => void;
  onCopyKey: (key: string) => void;
}

export function ApiKeysSection({
  apiKeys,
  onCreateKey,
  onDeleteKey,
  onCopyKey,
}: ApiKeysSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCreateKey = () => {
    if (newKeyName.trim()) {
      onCreateKey(newKeyName.trim());
      setNewKeyName("");
      setShowCreateForm(false);
    }
  };

  const handleCopyKey = (key: string) => {
    onCopyKey(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleKeyVisibility = (keyId: string) => {
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

  const maskKey = (key: string) => {
    if (key.length <= 8) return "••••••••";
    return key.substring(0, 4) + "••••••••" + key.substring(key.length - 4);
  };

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#2a2a2a]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-3 h-3 bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] rounded-full blur-sm opacity-50"></div>
              </div>
              <h3 className="text-lg font-semibold text-white">API Keys</h3>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-[#8b5cf6]/20 to-[#3b82f6]/20 text-[#8b5cf6] font-medium border border-[#8b5cf6]/30">
              {apiKeys.length}
            </span>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-white text-sm font-medium transition-colors"
          >
            {isExpanded ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-6 space-y-4">
          {/* Create New Key Section */}
          <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-4">
            <h4 className="text-sm font-medium text-white mb-3">
              Create New API Key
            </h4>
            {showCreateForm ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Enter a descriptive name for your API key"
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white text-sm focus:border-[#8b5cf6] focus:outline-none transition-colors"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleCreateKey}
                    className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Create Key
                  </button>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="border border-[#2a2a2a] hover:border-[#4a4a4a] text-gray-300 hover:text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full border border-dashed border-[#2a2a2a] hover:border-[#8b5cf6] rounded-lg p-4 text-center text-sm text-gray-400 hover:text-white transition-colors group"
              >
                <Plus className="w-5 h-5 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                Create New API Key
              </button>
            )}
          </div>

          {/* API Keys List */}
          {apiKeys.length > 0 ? (
            <div className="space-y-3">
              {apiKeys.map((apiKey) => (
                <div
                  key={apiKey.id}
                  className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-4 hover:border-[#3a3a3a] transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {apiKey.isActive ? (
                          <div className="w-4 h-4 bg-gradient-to-r from-[#22c55e] to-[#16a34a] rounded-full animate-pulse flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        ) : (
                          <div className="w-4 h-4 bg-gradient-to-r from-[#ef4444] to-[#dc2626] rounded-full animate-pulse flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                        <div className="absolute inset-0 w-4 h-4 bg-gradient-to-r from-[#22c55e] to-[#16a34a] rounded-full blur-sm opacity-30"></div>
                      </div>
                      <div>
                        <h4 className="text-white font-medium">
                          {apiKey.name}
                        </h4>
                        <p className="text-xs text-gray-400">
                          Created {apiKey.created}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleKeyVisibility(apiKey.id)}
                        className="text-gray-400 hover:text-[#3b82f6] p-2 rounded-lg hover:bg-[#3b82f6]/10 transition-colors group"
                        title={
                          visibleKeys.has(apiKey.id) ? "Hide key" : "Show key"
                        }
                      >
                        <div className="relative">
                          {visibleKeys.has(apiKey.id) ? (
                            <EyeOff className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          ) : (
                            <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          )}
                        </div>
                      </button>
                      <button
                        onClick={() => handleCopyKey(apiKey.key)}
                        className="text-gray-400 hover:text-[#22c55e] p-2 rounded-lg hover:bg-[#22c55e]/10 transition-colors group"
                        title="Copy key"
                      >
                        <div className="relative">
                          {copiedKey === apiKey.key ? (
                            <div className="w-4 h-4 bg-gradient-to-r from-[#22c55e] to-[#16a34a] rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          ) : (
                            <Copy className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          )}
                        </div>
                      </button>
                      <button
                        onClick={() => onDeleteKey(apiKey.id)}
                        className="text-gray-400 hover:text-[#ef4444] p-2 rounded-lg hover:bg-[#ef4444]/10 transition-colors group"
                        title="Delete key"
                      >
                        <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                  </div>

                  {/* Key Value */}
                  <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 font-mono text-sm text-gray-300 break-all">
                    {visibleKeys.has(apiKey.id)
                      ? apiKey.key
                      : maskKey(apiKey.key)}
                  </div>

                  {/* Key Details */}
                  <div className="mt-3 flex items-center gap-6 text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          apiKey.isActive
                            ? "bg-gradient-to-r from-[#22c55e] to-[#16a34a] animate-pulse"
                            : "bg-gradient-to-r from-[#ef4444] to-[#dc2626] animate-pulse"
                        }`}
                      ></div>
                      <span className="text-gray-500">
                        Status:{" "}
                        <span
                          className={
                            apiKey.isActive
                              ? "text-green-400 font-medium"
                              : "text-red-400 font-medium"
                          }
                        >
                          {apiKey.isActive ? "Active" : "Inactive"}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] rounded-full"></div>
                      <span className="text-gray-500">
                        Permissions:{" "}
                        <span className="text-[#8b5cf6] font-medium">
                          {apiKey.permissions.join(", ")}
                        </span>
                      </span>
                    </div>
                    {apiKey.lastUsed && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gradient-to-r from-[#f59e0b] to-[#d97706] rounded-full"></div>
                        <span className="text-gray-500">
                          Last used:{" "}
                          <span className="text-[#f59e0b] font-medium">
                            {apiKey.lastUsed}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] rounded-full blur-lg opacity-30"></div>
                <div className="relative w-20 h-20 bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] rounded-full flex items-center justify-center">
                  <Key className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                No API Keys Yet
              </h3>
              <p className="text-sm text-gray-400 mb-6">
                Create your first API key to start using our services
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-8 py-3 bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] hover:from-[#7c3aed] hover:to-[#2563eb] text-white text-sm font-medium rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[#8b5cf6]/25"
              >
                Create Your First Key
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

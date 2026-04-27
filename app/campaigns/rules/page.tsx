"use client";

import { useState } from "react";
import { Plus, Save, Trash2, Globe, Cookie, MousePointer, FileText } from "lucide-react";

/**
 * Campaign Rules Management Page
 * Allows admins to configure scraping behavior for different websites
 */

export default function CampaignRulesPage() {
  const [rules, setRules] = useState([
    {
      id: 1,
      domain: "example.com",
      type: "cookie",
      selector: "#accept-cookies",
      action: "click",
      priority: 1,
    },
  ]);

  return (
    <div className="min-h-screen bg-gray-950 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Campaign Scraping Rules
          </h1>
          <p className="text-gray-400">
            Configure how the scraper handles different websites, cookie modals, and form patterns
          </p>
        </div>

        {/* Rule Types Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <Cookie className="h-6 w-6 text-yellow-400 mb-2" />
            <h3 className="text-white font-semibold mb-1">Cookie Handlers</h3>
            <p className="text-gray-400 text-sm">Handle consent modals</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <Globe className="h-6 w-6 text-blue-400 mb-2" />
            <h3 className="text-white font-semibold mb-1">Contact Pages</h3>
            <p className="text-gray-400 text-sm">Find contact page URLs</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <FileText className="h-6 w-6 text-green-400 mb-2" />
            <h3 className="text-white font-semibold mb-1">Form Fields</h3>
            <p className="text-gray-400 text-sm">Detect input fields</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <MousePointer className="h-6 w-6 text-purple-400 mb-2" />
            <h3 className="text-white font-semibold mb-1">Submit Buttons</h3>
            <p className="text-gray-400 text-sm">Find submit actions</p>
          </div>
        </div>

        {/* Global Patterns */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Global Patterns</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-2">Supported Languages</h3>
              <div className="flex flex-wrap gap-2">
                {['English', 'Spanish', 'French', 'German', 'Portuguese', 'Italian', 'Dutch'].map((lang) => (
                  <span key={lang} className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-2">CAPTCHA Detection</h3>
              <div className="flex flex-wrap gap-2">
                {['reCAPTCHA', 'hCaptcha', 'Cloudflare'].map((captcha) => (
                  <span key={captcha} className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs">
                    {captcha}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Custom Rules */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Custom Rules</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              <Plus className="h-4 w-4" />
              Add Rule
            </button>
          </div>

          {/* Rules Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Domain</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Type</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Selector</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Action</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Priority</th>
                  <th className="text-right py-3 px-4 text-gray-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => (
                  <tr key={rule.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                    <td className="py-3 px-4 text-white">{rule.domain}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-yellow-900/30 text-yellow-300 rounded text-xs">
                        {rule.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-300 font-mono text-sm">{rule.selector}</td>
                    <td className="py-3 px-4 text-gray-300">{rule.action}</td>
                    <td className="py-3 px-4 text-gray-300">{rule.priority}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-gray-600 rounded transition">
                          <Save className="h-4 w-4 text-gray-400" />
                        </button>
                        <button className="p-2 hover:bg-red-900/30 rounded transition">
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Test Rule */}
        <div className="mt-6 bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Test Rule</h3>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Enter website URL to test..."
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
            <button className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600">
              Test Rules
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

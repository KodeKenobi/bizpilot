"use client";

import { useState } from "react";
import { Download, X, Palette, FileText, Eye } from "lucide-react";

interface ExportOptions {
  completedColor: string;
  failedColor: string;
  includeComments: boolean;
  commentStyle: 'success' | 'detailed' | 'minimal';
}

interface ExportOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => void;
  campaignName: string;
  isExporting?: boolean;
}

const colorOptions = [
  { name: 'Yellow (Default)', value: '#FEF3C7', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  { name: 'Light Green', value: '#DCFCE7', bg: 'bg-green-100', text: 'text-green-800' },
  { name: 'Light Blue', value: '#DBEAFE', bg: 'bg-blue-100', text: 'text-blue-800' },
  { name: 'Light Purple', value: '#F3E8FF', bg: 'bg-purple-100', text: 'text-purple-800' },
];

const failedColorOptions = [
  { name: 'Red (Default)', value: '#FECACA', bg: 'bg-red-100', text: 'text-red-800' },
  { name: 'Orange', value: '#FED7AA', bg: 'bg-orange-100', text: 'text-orange-800' },
  { name: 'Pink', value: '#FCE7F3', bg: 'bg-pink-100', text: 'text-pink-800' },
  { name: 'Gray', value: '#F3F4F6', bg: 'bg-gray-100', text: 'text-gray-800' },
];

export default function ExportOptionsModal({
  isOpen,
  onClose,
  onExport,
  campaignName,
  isExporting = false
}: ExportOptionsModalProps) {
  const [options, setOptions] = useState<ExportOptions>({
    completedColor: '#FEF3C7',
    failedColor: '#FECACA',
    includeComments: true,
    commentStyle: 'success',
  });

  const handleExport = () => {
    onExport(options);
  };

  const resetToDefaults = () => {
    setOptions({
      completedColor: '#FEF3C7',
      failedColor: '#FECACA',
      includeComments: true,
      commentStyle: 'success',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-8">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-white/10 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
              <Download className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Export Results</h2>
              <p className="text-sm text-gray-400 mt-0.5">{campaignName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
          >
            <X className="w-5 h-5 text-gray-400 group-hover:text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Color Options */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Palette className="w-5 h-5 text-cyan-400" />
              <h3 className="font-semibold text-white text-lg">Row Colors</h3>
            </div>

            {/* Completed Color */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Completed Sites
              </label>
              <div className="grid grid-cols-2 gap-3">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setOptions(prev => ({ ...prev, completedColor: color.value }))}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      options.completedColor === color.value
                        ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/20'
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <div className={`inline-block w-5 h-5 rounded-md ${color.bg} mr-3 shadow-sm`} />
                    <span className="text-sm font-medium text-white">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Failed Color */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Failed/Broken Sites
              </label>
              <div className="grid grid-cols-2 gap-3">
                {failedColorOptions.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setOptions(prev => ({ ...prev, failedColor: color.value }))}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      options.failedColor === color.value
                        ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/20'
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <div className={`inline-block w-5 h-5 rounded-md ${color.bg} mr-3 shadow-sm`} />
                    <span className="text-sm font-medium text-white">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Comments Options */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-5 h-5 text-cyan-400" />
              <h3 className="font-semibold text-white text-lg">Comments Column</h3>
            </div>

            {/* Include Comments Toggle */}
            <div className="mb-6">
              <label className="flex items-center p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-pointer group">
                <input
                  type="checkbox"
                  checked={options.includeComments}
                  onChange={(e) => setOptions(prev => ({ ...prev, includeComments: e.target.checked }))}
                  className="rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0 w-5 h-5"
                />
                <span className="ml-3 text-sm font-medium text-white group-hover:text-cyan-400 transition-colors">Include comments column</span>
              </label>
            </div>

            {/* Comment Style */}
            {options.includeComments && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Comment Style
                </label>
                <div className="space-y-3">
                  {[
                    { value: 'success', label: 'Success Focused', desc: 'Simple ✓/✗ indicators with key details' },
                    { value: 'detailed', label: 'Detailed', desc: 'Full explanations and error details' },
                    { value: 'minimal', label: 'Minimal', desc: 'Just status icons and brief text' },
                  ].map((style) => (
                    <button
                      key={style.value}
                      onClick={() => setOptions(prev => ({ ...prev, commentStyle: style.value as any }))}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        options.commentStyle === style.value
                          ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/20'
                          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <div className="font-semibold text-sm text-white">{style.label}</div>
                      <div className="text-xs text-gray-400 mt-1">{style.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Preview */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-5 h-5 text-cyan-400" />
              <h3 className="font-semibold text-white text-lg">Preview</h3>
            </div>
            <div className="border border-white/10 rounded-xl p-5 bg-white/5 backdrop-blur-sm">
              <div className="text-sm text-gray-400 mb-3 font-medium">Sample export columns:</div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  <span className="text-gray-300 font-mono">Company Name | Website URL | Contact Email | Status</span>
                  {options.includeComments && <span className="text-cyan-400 font-mono">| Comments</span>}
                </div>
                <div className="text-xs text-gray-500 mt-3 pl-5">
                  💡 Completed rows will be highlighted in your chosen color
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-8 border-t border-white/10 bg-black/20">
          <button
            onClick={resetToDefaults}
            className="px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            Reset to Defaults
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white text-sm font-bold rounded-lg transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export Excel
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
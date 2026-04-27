"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  Save,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Type,
  Plus,
  PenTool,
  Edit,
} from "lucide-react";

interface ToolbarTool {
  id: string;
  name: string;
  icon?: string;
  iconComponent?: React.ReactNode;
}

interface PageThumbnail {
  pageNumber: number;
  isActive: boolean;
  thumbnailUrl?: string;
  onClick: () => void;
}

interface MobilePDFEditorLayoutProps {
  // Header props
  title?: string;
  fileName?: string;
  onDone?: () => void;
  onBack?: () => void;
  instructionText?: string;

  // Toolbar props
  tools?: ToolbarTool[];
  activeTool?: string;
  onToolSelect?: (toolId: string) => void;

  // Page navigation
  pages?: PageThumbnail[];
  currentPage?: number;
  onPageChange?: (pageNumber: number) => void;

  // Zoom controls
  zoomLevel?: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomReset?: () => void;

  // Main content
  children: React.ReactNode;

  // Additional actions
  onSave?: () => void;
  isProcessing?: boolean;

  // View and download flow
  showViewButton?: boolean;
  showDownloadButton?: boolean;
  onViewPdf?: () => void;
  onDownloadPdf?: () => void;
  hasViewedPdf?: boolean;
}

export const MobilePDFEditorLayout: React.FC<MobilePDFEditorLayoutProps> = ({
  title = "Trevnoctilla",
  fileName,
  onBack,
  instructionText,
  tools = [],
  activeTool,
  onToolSelect,
  pages = [],
  currentPage = 1,
  onPageChange,
  zoomLevel = 1.0,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  children,
  onSave,
  isProcessing = false,
  showViewButton = false,
  showDownloadButton = false,
  onViewPdf,
  onDownloadPdf,
}) => {
  const [showPageMenu, setShowPageMenu] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);

  return (
    <div className="fixed inset-0 bg-gray-100 flex flex-col z-[9999]">
      {/* Top Header - Clean Design */}
      <div className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {/* Back Button */}
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
              aria-label="Back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Title */}
          <span className="font-semibold text-gray-900 text-base truncate">
            {title}
          </span>

          {/* File name */}
          {fileName && (
            <span className="text-xs text-gray-500 truncate hidden sm:block">
              {fileName}
            </span>
          )}
        </div>

        {/* Page Navigation - Hidden in header, shown in bottom bar */}
      </div>

      {/* Instruction Text */}
      {instructionText && (
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
          <p className="text-xs text-gray-600 text-center">{instructionText}</p>
        </div>
      )}

      {/* Main Content Area */}
      <div
        className="flex-1 bg-gray-100 overflow-hidden relative"
        style={{ margin: 0, padding: 0 }}
      >
        {children}
      </div>

      {/* Top Toolbar - Tool Selection (like screenshot) */}
      {tools.length > 0 && onToolSelect && (
        <div className="bg-white border-b border-gray-200 px-4 py-2 shadow-sm">
          <div className="flex items-center justify-center space-x-2 overflow-x-auto scrollbar-hide">
            {tools.map((tool) => {
              const isActive = activeTool === tool.id;
              const getIcon = () => {
                if (tool.iconComponent) return tool.iconComponent;
                if (tool.icon) {
                  if (tool.icon === "T" || tool.id === "edit-text")
                    return <Edit className="w-4 h-4" />;
                  if (tool.icon === "+" || tool.id === "text")
                    return <Plus className="w-4 h-4" />;
                  if (tool.icon === "S" || tool.id === "sign")
                    return <PenTool className="w-4 h-4" />;
                  return <span className="text-sm">{tool.icon}</span>;
                }
                return null;
              };

              return (
                <button
                  key={tool.id}
                  onClick={() => onToolSelect(tool.id)}
                  className={`px-4 py-2 rounded transition-colors flex items-center space-x-2 whitespace-nowrap ${
                    isActive
                      ? "bg-red-50 text-red-600 border border-red-200"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                  aria-label={tool.name}
                >
                  <span className="flex-shrink-0">{getIcon()}</span>
                  <span className="text-sm font-medium">{tool.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Control Bar - Screenshot Style */}
      <AnimatePresence>
        {showToolbar && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="bg-gray-200 border-t border-gray-300 shadow-lg"
            style={{ zIndex: 10000 }}
          >
            <div className="flex items-center justify-between px-4 py-3">
              {/* Left: Page Navigation */}
              {pages.length > 0 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 text-gray-700 hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed rounded transition-colors"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-700 font-medium px-2">
                    {currentPage} / {pages.length}
                  </span>
                  <button
                    onClick={() =>
                      onPageChange?.(Math.min(pages.length, currentPage + 1))
                    }
                    disabled={currentPage === pages.length}
                    className="p-1.5 text-gray-700 hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed rounded transition-colors"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Center: Zoom Controls */}
              {(onZoomIn || onZoomOut || onZoomReset) && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={onZoomOut}
                    disabled={zoomLevel <= 0.25}
                    className="p-1.5 text-gray-700 hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed rounded transition-colors"
                    aria-label="Zoom out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-700 font-medium px-2 min-w-[50px] text-center">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={onZoomIn}
                    disabled={zoomLevel >= 3.0}
                    className="p-1.5 text-gray-700 hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed rounded transition-colors"
                    aria-label="Zoom in"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Right: Action Buttons (Save, Preview, Download) */}
              <div className="flex items-center space-x-2">
                {onSave && (
                  <button
                    onClick={onSave}
                    disabled={isProcessing}
                    className="px-3 py-1.5 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium rounded border border-gray-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                )}
                {showViewButton && onViewPdf && (
                  <button
                    onClick={onViewPdf}
                    className="px-3 py-1.5 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium rounded border border-gray-300 transition-colors"
                  >
                    Preview
                  </button>
                )}
                {showDownloadButton && onDownloadPdf && (
                  <button
                    onClick={onDownloadPdf}
                    className="px-3 py-1.5 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium rounded border border-gray-300 transition-colors flex items-center space-x-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Selection Menu - Mobile */}
      <AnimatePresence>
        {showPageMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-[10000]"
              onClick={() => setShowPageMenu(false)}
            />
            <motion.div
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[10001] bg-white border-t border-gray-300 rounded-t-2xl p-4 max-h-[60vh] shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-900 font-semibold text-lg">
                  Select Page
                </h3>
                <button
                  onClick={() => setShowPageMenu(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3 overflow-y-auto max-h-[50vh]">
                {pages.map((page) => (
                  <button
                    key={page.pageNumber}
                    onClick={() => {
                      page.onClick();
                      setShowPageMenu(false);
                    }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      page.isActive
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 bg-gray-50 hover:border-gray-400"
                    }`}
                  >
                    {page.thumbnailUrl ? (
                      <img
                        src={page.thumbnailUrl}
                        alt={`Page ${page.pageNumber}`}
                        className="w-full h-auto rounded mb-2"
                      />
                    ) : (
                      <div className="w-full aspect-[3/4] bg-gray-200 rounded mb-2 flex items-center justify-center">
                        <FileText className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="text-center text-gray-700 text-sm font-medium">
                      Page {page.pageNumber}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

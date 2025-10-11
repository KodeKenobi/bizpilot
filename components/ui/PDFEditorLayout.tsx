"use client";

import React, { useState, useRef, useCallback } from "react";
// Simple button component to avoid import issues
const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}> = ({ children, onClick, disabled, className = "" }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-lg font-medium transition-colors ${className}`}
  >
    {children}
  </button>
);

interface ToolbarTool {
  id: string;
  name: string;
  icon: string;
  active?: boolean;
  onClick?: () => void;
}

interface PageThumbnail {
  pageNumber: number;
  isActive: boolean;
  thumbnailUrl?: string;
  onClick: () => void;
}

interface PDFEditorLayoutProps {
  // Header props
  title?: string;
  fileName?: string;
  onDone?: () => void;
  onBack?: () => void;
  onSearch?: () => void;

  // Zoom controls
  zoomLevel?: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomReset?: () => void;

  // Toolbar props
  tools?: ToolbarTool[];
  activeTool?: string;
  onToolSelect?: (toolId: string) => void;
  hideDrawingTools?: boolean;

  // Page navigation
  pages?: PageThumbnail[];
  currentPage?: number;
  onPageChange?: (pageNumber: number) => void;
  onManagePages?: () => void;

  // Main content
  children: React.ReactNode;

  // Additional actions
  onUploadNew?: () => void;
  onSave?: () => void;
  isProcessing?: boolean;

  // View and download flow
  showViewButton?: boolean;
  showDownloadButton?: boolean;
  onViewPdf?: () => void;
  onDownloadPdf?: () => void;

  // State management
  hasViewedPdf?: boolean;
  isInPreviewMode?: boolean;
}

export const PDFEditorLayout: React.FC<PDFEditorLayoutProps> = ({
  title = "Trevnoctilla",
  fileName,
  onDone,
  onBack,
  onSearch,
  zoomLevel = 100,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  tools = [],
  activeTool,
  onToolSelect,
  hideDrawingTools = false,
  pages = [],
  currentPage = 1,
  onPageChange,
  onManagePages,
  children,
  onUploadNew,
  onSave,
  isProcessing = false,
  showViewButton = false,
  showDownloadButton = false,
  onViewPdf,
  onDownloadPdf,
  hasViewedPdf = false,
  isInPreviewMode = false,
}) => {
  const [showPageThumbnails, setShowPageThumbnails] = useState(true);

  const defaultTools: ToolbarTool[] = [
    { id: "undo", name: "Undo", icon: "↶" },
    { id: "redo", name: "Redo", icon: "↷" },
    { id: "select", name: "Select", icon: "↖" },
    { id: "text", name: "Add Text", icon: "T" },
    { id: "edit-text", name: "Edit Text", icon: "✏" },
    { id: "sign", name: "Sign", icon: "✍" },
    { id: "pencil", name: "Pencil", icon: "✏" },
    { id: "highlight", name: "Highlight", icon: "🖍" },
    { id: "eraser", name: "Eraser", icon: "🧹" },
    { id: "annotate", name: "Annotate", icon: "💬" },
    { id: "image", name: "Image", icon: "🖼" },
    { id: "ellipse", name: "Ellipse", icon: "⭕" },
  ];

  // Filter out drawing tools if hideDrawingTools is true
  const filteredDefaultTools = hideDrawingTools
    ? defaultTools.filter(
        (tool) =>
          ![
            "pencil",
            "highlight",
            "eraser",
            "annotate",
            "image",
            "ellipse",
          ].includes(tool.id)
      )
    : defaultTools;

  const allTools = tools.length > 0 ? tools : filteredDefaultTools;

  // Get tool icon component
  const getToolIcon = (toolId: string) => {
    const iconProps = { className: "w-4 h-4" };
    const tool = allTools.find((t) => t.id === toolId);

    switch (toolId) {
      case "undo":
        return (
          <svg
            {...iconProps}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
            />
          </svg>
        );
      case "redo":
        return (
          <svg
            {...iconProps}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6"
            />
          </svg>
        );
      case "select":
        return (
          <svg
            {...iconProps}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
            />
          </svg>
        );
      case "text":
        return (
          <svg
            {...iconProps}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h7"
            />
          </svg>
        );
      case "edit-text":
        return (
          <svg
            {...iconProps}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        );
      case "sign":
        return (
          <svg
            {...iconProps}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        );
      case "pencil":
        return (
          <svg
            {...iconProps}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        );
      case "highlight":
        return (
          <svg
            {...iconProps}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
            />
          </svg>
        );
      case "eraser":
        return (
          <svg
            {...iconProps}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        );
      case "annotate":
        return (
          <svg
            {...iconProps}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        );
      case "image":
        return (
          <svg
            {...iconProps}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        );
      case "ellipse":
        return (
          <svg
            {...iconProps}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
            />
          </svg>
        );
      default:
        return <span className="text-lg">{tool?.icon || "?"}</span>;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col">
      {/* Top Header - Mobile Responsive */}
      <div className="bg-gray-800 border-b border-gray-700 px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Back Button */}
          {onBack && (
            <button
              onClick={onBack}
              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded hover:bg-gray-700"
              title="Back"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          {/* Logo */}
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white text-lg sm:text-2xl">
              {title}
            </span>
          </div>

          {/* File name - Hidden on mobile */}
          {fileName && (
            <span className="hidden sm:block text-sm text-gray-300 truncate max-w-xs">
              {fileName}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Zoom Controls - Hidden on mobile */}
          <div className="hidden sm:flex items-center space-x-2">
            <button
              onClick={onZoomOut}
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-700"
              title="Zoom Out"
            >
              <svg
                className="w-4 h-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 12H4"
                />
              </svg>
            </button>
            <button
              onClick={onZoomReset}
              className="px-3 py-1 text-sm font-medium text-gray-300 hover:bg-gray-700 rounded"
            >
              {zoomLevel}%
            </button>
            <button
              onClick={onZoomIn}
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-700"
              title="Zoom In"
            >
              <svg
                className="w-4 h-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>

          {/* Mobile Zoom Display */}
          <div className="sm:hidden">
            <span className="text-sm text-gray-300">{zoomLevel}%</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Page Thumbnails - Hidden on mobile */}
        {showPageThumbnails && (
          <div className="hidden lg:flex w-64 bg-gray-800 border-r border-gray-700 flex-col">
            {/* Manage Pages Button */}
            <div className="p-3 border-b border-gray-700">
              <button
                onClick={onManagePages}
                className="w-full flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 rounded-lg"
              >
                <span>📄</span>
                <span>Manage Pages</span>
              </button>
            </div>

            {/* Page Thumbnails */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {pages.map((page) => (
                <div
                  key={page.pageNumber}
                  className={`relative cursor-pointer rounded-lg border-2 transition-all ${
                    page.isActive
                      ? "border-blue-500 bg-blue-900/30"
                      : "border-gray-600 hover:border-gray-500"
                  }`}
                  onClick={() => onPageChange?.(page.pageNumber)}
                >
                  <div className="aspect-[3/4] bg-gray-700 rounded-lg flex items-center justify-center">
                    {page.thumbnailUrl ? (
                      <img
                        src={page.thumbnailUrl}
                        alt={`Page ${page.pageNumber}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-gray-400 text-sm">
                        Page {page.pageNumber}
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
                    <div className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                      {page.pageNumber}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Toolbar - Hide if only one tool and it's not sign, image, or watermark */}
          {(allTools.length > 1 ||
            (allTools.length === 1 &&
              (allTools[0]?.id === "sign" ||
                allTools[0]?.id === "image" ||
                allTools[0]?.id === "watermark"))) && (
            <div className="bg-gray-800 border-b border-gray-700 px-2 sm:px-4 py-2 flex-shrink-0">
              <div className="flex items-center justify-center space-x-1 overflow-x-auto">
                {allTools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => {
                      onToolSelect?.(tool.id);
                      tool.onClick?.();
                    }}
                    className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                      activeTool === tool.id
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-700"
                    } ${
                      tool.id === "undo" || tool.id === "redo"
                        ? "hidden sm:flex"
                        : ""
                    }`}
                    title={tool.name}
                  >
                    {getToolIcon(tool.id)}
                    <span className="inline">{tool.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Document Area - Full height */}
          <div className="flex-1 bg-gray-900 overflow-hidden">{children}</div>
        </div>
      </div>

      {/* Bottom Actions Bar - Mobile Responsive */}
      {(onUploadNew || onSave || showViewButton || showDownloadButton) && (
        <div className="bg-gray-800 border-t border-gray-700 px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-2 sm:space-x-3">
              {onUploadNew && (
                <Button
                  onClick={onUploadNew}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-3 sm:px-4 py-2 rounded-lg text-sm"
                >
                  <span className="hidden sm:inline">Upload New PDF</span>
                  <span className="sm:hidden">New PDF</span>
                </Button>
              )}
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
              {/* Always show Save Changes button */}
              {onSave && (
                <Button
                  onClick={onSave}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-lg disabled:opacity-50 text-sm flex-1 sm:flex-none"
                >
                  {isProcessing ? "Saving..." : "Save"}
                </Button>
              )}

              {/* Show View button after save or if explicitly shown */}
              {(showViewButton || hasViewedPdf) && onViewPdf && (
                <Button
                  onClick={onViewPdf}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg text-sm flex-1 sm:flex-none"
                >
                  View
                </Button>
              )}

              {/* Show Download button only in editor mode after user has viewed PDF */}
              {hasViewedPdf && !isInPreviewMode && onDownloadPdf && (
                <Button
                  onClick={onDownloadPdf}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-4 py-2 rounded-lg text-sm flex-1 sm:flex-none"
                >
                  Download
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

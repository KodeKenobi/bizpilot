"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  MousePointer,
  Type,
  Square,
  Circle,
  Pen,
  ChevronLeft,
  ChevronRight,
  Download,
  Save,
  X,
  Check,
} from "lucide-react";
import { useNavigation } from "@/contexts/NavigationContext";
import { useMonetization } from "../../hooks/useMonetization";
import MonetizationModal from "../ui/MonetizationModal";

const tools = [
  { id: "select", label: "Select", icon: MousePointer },
  { id: "text", label: "Text", icon: Type },
  { id: "rectangle", label: "Rectangle", icon: Square },
  { id: "circle", label: "Circle", icon: Circle },
  { id: "operator", label: "Operator Mode", icon: Pen },
];

export default function PDFEditor() {
  const { navigateTo } = useNavigation();
  const {
    monetizationState,
    openMonetizationModal,
    closeMonetizationModal,
    handleAdComplete,
    handlePaymentComplete,
  } = useMonetization();
  const [selectedTool, setSelectedTool] = useState("select");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(3);
  const [showOperatorPanel, setShowOperatorPanel] = useState(false);
  const [operatorData, setOperatorData] = useState({
    removeText: "",
    addText: "",
    addTextX: "",
    addTextY: "",
    removeImage: "",
  });
  const [showResults, setShowResults] = useState(false);
  const [resultType, setResultType] = useState<"success" | "error" | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId);
    if (toolId === "operator") {
      setShowOperatorPanel(true);
    } else {
      setShowOperatorPanel(false);
    }
  };

  const handleOperatorAction = (action: string) => {
    console.log(`${action} action triggered:`, operatorData);
    // Here you would typically send the data to your backend
    setShowResults(true);
    setResultType("success");
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("Image uploaded:", file.name);
      setShowResults(true);
      setResultType("success");
    }
  };

  const closeResults = () => {
    setShowResults(false);
    setResultType(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 page-content">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">PDF Editor</h1>
            <p className="text-gray-400">
              Advanced PDF editing with operator-level controls
            </p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => navigateTo("pdf-tools")}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Back to Tools
            </button>
            <button className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2">
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-6 gap-6">
          {/* Left Toolbar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-4">Tools</h3>
              <div className="space-y-2">
                {tools.map((tool) => {
                  const IconComponent = tool.icon;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => handleToolSelect(tool.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        selectedTool === tool.id
                          ? tool.id === "operator"
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          : "text-gray-400 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="text-sm">{tool.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Operator Panel */}
            {showOperatorPanel && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4"
              >
                <h4 className="text-white font-semibold mb-4">
                  Operator Controls
                </h4>

                {/* Remove Text */}
                <div className="mb-4">
                  <label className="block text-gray-300 text-sm mb-2">
                    Remove Text
                  </label>
                  <input
                    type="text"
                    value={operatorData.removeText}
                    onChange={(e) =>
                      setOperatorData({
                        ...operatorData,
                        removeText: e.target.value,
                      })
                    }
                    placeholder="Enter text to remove"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={() => handleOperatorAction("remove-text")}
                    className="w-full mt-2 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                  >
                    Remove Text
                  </button>
                </div>

                {/* Add Text */}
                <div className="mb-4">
                  <label className="block text-gray-300 text-sm mb-2">
                    Add Text
                  </label>
                  <input
                    type="text"
                    value={operatorData.addText}
                    onChange={(e) =>
                      setOperatorData({
                        ...operatorData,
                        addText: e.target.value,
                      })
                    }
                    placeholder="Enter text to add"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 mb-2"
                  />
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input
                      type="number"
                      value={operatorData.addTextX}
                      onChange={(e) =>
                        setOperatorData({
                          ...operatorData,
                          addTextX: e.target.value,
                        })
                      }
                      placeholder="X"
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                    />
                    <input
                      type="number"
                      value={operatorData.addTextY}
                      onChange={(e) =>
                        setOperatorData({
                          ...operatorData,
                          addTextY: e.target.value,
                        })
                      }
                      placeholder="Y"
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <button
                    onClick={() => handleOperatorAction("add-text")}
                    className="w-full bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                  >
                    Add Text
                  </button>
                </div>

                {/* Remove Image */}
                <div className="mb-4">
                  <label className="block text-gray-300 text-sm mb-2">
                    Remove Image
                  </label>
                  <input
                    type="text"
                    value={operatorData.removeImage}
                    onChange={(e) =>
                      setOperatorData({
                        ...operatorData,
                        removeImage: e.target.value,
                      })
                    }
                    placeholder="Image name"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 mb-2"
                  />
                  <button
                    onClick={() => handleOperatorAction("remove-image")}
                    className="w-full bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                  >
                    Remove Image
                  </button>
                </div>

                {/* Add Image */}
                <div>
                  <label className="block text-gray-300 text-sm mb-2">
                    Add Image
                  </label>
                  <button
                    onClick={handleImageUpload}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                  >
                    Choose Image
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Note: Backend integration required
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Main Canvas Area */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-5"
          >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8">
              {/* Page Navigation */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-white font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      openMonetizationModal(
                        "edited_document.pdf",
                        "PDF",
                        "http://localhost:5000/download_edited/edited_document.pdf"
                      );
                    }}
                    className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-white px-4 py-2 rounded-lg hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-200 flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>If you like the conversion, download</span>
                  </button>
                </div>
              </div>

              {/* PDF Canvas */}
              <div className="bg-white rounded-lg shadow-lg p-8 min-h-[600px] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-40 bg-blue-100 border-2 border-dashed border-blue-300 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <span className="text-blue-600 font-medium text-sm">
                      PDF Page {currentPage}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Use Operator Mode (purple pen) to edit this PDF content
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Results Modal */}
        {showResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={closeResults}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl p-8 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    resultType === "success" ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  {resultType === "success" ? (
                    <Check className="w-8 h-8 text-green-600" />
                  ) : (
                    <X className="w-8 h-8 text-red-600" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {resultType === "success" ? "Success!" : "Error!"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {resultType === "success"
                    ? "Your PDF has been processed successfully!"
                    : "There was an error processing your request."}
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={closeResults}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                  {resultType === "success" && (
                    <button
                      onClick={() => {
                        openMonetizationModal(
                          "edited_document.pdf",
                          "PDF",
                          "http://localhost:5000/download_edited/edited_document.pdf"
                        );
                      }}
                      className="flex-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-white px-4 py-2 rounded-lg hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-200"
                    >
                      If you like the conversion, download
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Monetization Modal */}
        <MonetizationModal
          isOpen={monetizationState.isModalOpen}
          onClose={closeMonetizationModal}
          onAdComplete={handleAdComplete}
          onPaymentComplete={handlePaymentComplete}
          fileName={monetizationState.fileName}
          fileType={monetizationState.fileType}
        />
      </div>
    </div>
  );
}

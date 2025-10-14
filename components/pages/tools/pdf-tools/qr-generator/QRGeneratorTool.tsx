"use client";

import React, { useState, useCallback } from "react";
import { useMonetization } from "@/hooks/useMonetization";
import MonetizationModal from "@/components/ui/MonetizationModal";

interface QRGeneratorToolProps {
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  result: { type: "success" | "error"; message: string; data?: any } | null;
  setResult: (
    result: { type: "success" | "error"; message: string; data?: any } | null
  ) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  handleFileUpload: (file: File) => void;
}

type QRType =
  | "url"
  | "text"
  | "wifi"
  | "email"
  | "sms"
  | "phone"
  | "vcard"
  | "location"
  | "calendar";

interface QRData {
  type: QRType;
  content: string;
  size?: number;
  errorCorrection?: "L" | "M" | "Q" | "H";
  margin?: number;
  // WiFi specific
  ssid?: string;
  password?: string;
  security?: "WPA" | "WEP" | "nopass";
  hidden?: boolean;
  // Email specific
  subject?: string;
  body?: string;
  // SMS specific
  phoneNumber?: string;
  message?: string;
  // Phone specific
  phone?: string;
  // vCard specific
  name?: string;
  organization?: string;
  vcardTitle?: string;
  vcardPhone?: string;
  email?: string;
  website?: string;
  address?: string;
  // Location specific
  latitude?: number;
  longitude?: number;
  // Calendar specific
  calendarTitle?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
}

export const QRGeneratorTool: React.FC<QRGeneratorToolProps> = ({
  uploadedFile,
  setUploadedFile,
  result,
  setResult,
  isProcessing,
  setIsProcessing,
  handleFileUpload,
}) => {
  const [qrType, setQrType] = useState<QRType>("url");
  const [qrData, setQrData] = useState<QRData>({
    type: "url",
    content: "",
    size: 256,
    errorCorrection: "M",
    margin: 4,
  });
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    monetizationState,
    openMonetizationModal,
    closeMonetizationModal,
    handleAdComplete,
    handlePaymentComplete,
  } = useMonetization();

  const handleAdCompleteWithDownload = () => {
    handleAdComplete();
    if (generatedQR) {
      try {
        window.open(generatedQR, "_blank");
      } catch (error) {
        window.open(generatedQR, "_blank");
      }
    }
  };

  const handlePaymentCompleteWithDownload = () => {
    handlePaymentComplete();
    if (generatedQR) {
      try {
        window.open(generatedQR, "_blank");
      } catch (error) {
        window.open(generatedQR, "_blank");
      }
    }
  };

  const downloadResult = () => {
    if (generatedQR) {
      openMonetizationModal(`qr-code-${qrType}`, "image", generatedQR);
    }
  };

  const generateQR = async () => {
    // Validate based on QR type
    let validationError = "";

    switch (qrData.type) {
      case "text":
      case "url":
        if (!qrData.content.trim()) {
          validationError = "Please enter content for the QR code";
        }
        break;
      case "wifi":
        if (!qrData.ssid?.trim()) {
          validationError = "Please enter WiFi network name (SSID)";
        }
        break;
      case "email":
        if (!qrData.content.trim()) {
          validationError = "Please enter email address";
        }
        break;
      case "sms":
        if (!qrData.phoneNumber?.trim()) {
          validationError = "Please enter phone number";
        }
        break;
      case "phone":
        if (!qrData.phone?.trim()) {
          validationError = "Please enter phone number";
        }
        break;
      case "vcard":
        if (!qrData.name?.trim()) {
          validationError = "Please enter name for vCard";
        }
        break;
      case "location":
        if (!qrData.latitude || !qrData.longitude) {
          validationError = "Please enter latitude and longitude";
        }
        break;
      case "calendar":
        if (!qrData.calendarTitle?.trim()) {
          validationError = "Please enter event title";
        }
        break;
    }

    if (validationError) {
      setResult({
        type: "error",
        message: validationError,
      });
      return;
    }

    setIsProcessing(true);
    setLoading(true);
    setGeneratedQR(null);
    setResult(null);

    try {
      // Format data according to backend expectations - only send relevant fields
      let requestData: any = {
        type: qrData.type,
        data: {},
      };

      // Send only the relevant fields based on QR type
      switch (qrData.type) {
        case "text":
          requestData.data.text = qrData.content;
          break;
        case "url":
          requestData.data.url = qrData.content;
          break;
        case "wifi":
          requestData.data.ssid = qrData.ssid || "";
          requestData.data.password = qrData.password || "";
          requestData.data.encryption = qrData.security || "WPA";
          requestData.data.hidden = qrData.hidden || false;
          break;
        case "email":
          requestData.data.email = qrData.content; // This should be the email address
          requestData.data.subject = qrData.subject || "";
          requestData.data.body = qrData.body || "";
          break;
        case "sms":
          requestData.data.phoneNumber = qrData.phoneNumber || "";
          requestData.data.message = qrData.message || "";
          break;
        case "phone":
          requestData.data.phone = qrData.phone || "";
          break;
        case "vcard":
          requestData.data.name = qrData.name || "";
          requestData.data.organization = qrData.organization || "";
          requestData.data.vcardTitle = qrData.vcardTitle || "";
          requestData.data.vcardPhone = qrData.vcardPhone || "";
          requestData.data.email = qrData.email || "";
          requestData.data.website = qrData.website || "";
          requestData.data.address = qrData.address || "";
          break;
        case "location":
          requestData.data.latitude = qrData.latitude || 0;
          requestData.data.longitude = qrData.longitude || 0;
          break;
        case "calendar":
          requestData.data.calendarTitle = qrData.calendarTitle || "";
          requestData.data.description = qrData.description || "";
          requestData.data.startDate = qrData.startDate || "";
          requestData.data.endDate = qrData.endDate || "";
          requestData.data.location = qrData.location || "";
          break;
        default:
          requestData.data.text = qrData.content;
      }

      const response = await fetch("http://localhost:5000/generate-qr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const result = await response.json();
        setGeneratedQR(result.qr_code);
        setResult({
          type: "success",
          message: "QR code generated successfully!",
          data: result,
        });
      } else {
        const error = await response.json();
        setResult({
          type: "error",
          message: error.message || "Failed to generate QR code",
        });
      }
    } catch (error) {
      setResult({
        type: "error",
        message: "Network error occurred",
      });
    } finally {
      setIsProcessing(false);
      setLoading(false);
    }
  };

  const updateQRData = (field: keyof QRData, value: any) => {
    setQrData((prev) => ({ ...prev, [field]: value }));
  };

  const renderQRTypeForm = () => {
    switch (qrType) {
      case "url":
        return (
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
              Website URL
            </label>
            <input
              type="url"
              value={qrData.content}
              onChange={(e) => updateQRData("content", e.target.value)}
              placeholder="https://example.com"
              className="w-full p-2 sm:p-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );

      case "text":
        return (
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
              Text Content
            </label>
            <textarea
              value={qrData.content}
              onChange={(e) => updateQRData("content", e.target.value)}
              placeholder="Enter any text..."
              rows={3}
              className="w-full p-2 sm:p-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );

      case "wifi":
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                Network Name (SSID)
              </label>
              <input
                type="text"
                value={qrData.ssid || ""}
                onChange={(e) => updateQRData("ssid", e.target.value)}
                placeholder="MyWiFiNetwork"
                className="w-full p-2 sm:p-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                Password
              </label>
              <input
                type="password"
                value={qrData.password || ""}
                onChange={(e) => updateQRData("password", e.target.value)}
                placeholder="WiFi password"
                className="w-full p-2 sm:p-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                  Security Type
                </label>
                <select
                  value={qrData.security || "WPA"}
                  onChange={(e) => updateQRData("security", e.target.value)}
                  className="w-full p-2 sm:p-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="WPA">WPA/WPA2</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">No Password</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hidden"
                  checked={qrData.hidden || false}
                  onChange={(e) => updateQRData("hidden", e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="hidden"
                  className="ml-2 text-xs sm:text-sm text-gray-300"
                >
                  Hidden Network
                </label>
              </div>
            </div>
          </div>
        );

      case "email":
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={qrData.content}
                onChange={(e) => updateQRData("content", e.target.value)}
                placeholder="example@email.com"
                className="w-full p-2 sm:p-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                Subject (Optional)
              </label>
              <input
                type="text"
                value={qrData.subject || ""}
                onChange={(e) => updateQRData("subject", e.target.value)}
                placeholder="Email subject"
                className="w-full p-2 sm:p-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                Message (Optional)
              </label>
              <textarea
                value={qrData.body || ""}
                onChange={(e) => updateQRData("body", e.target.value)}
                placeholder="Email message"
                rows={2}
                className="w-full p-2 sm:p-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      case "sms":
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={qrData.phoneNumber || ""}
                onChange={(e) => updateQRData("phoneNumber", e.target.value)}
                placeholder="+1234567890"
                className="w-full p-2 sm:p-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                Message
              </label>
              <textarea
                value={qrData.message || ""}
                onChange={(e) => updateQRData("message", e.target.value)}
                placeholder="SMS message"
                rows={2}
                className="w-full p-2 sm:p-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      case "phone":
        return (
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={qrData.content}
              onChange={(e) => updateQRData("content", e.target.value)}
              placeholder="+1234567890"
              className="w-full p-2 sm:p-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );

      case "vcard":
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={qrData.name || ""}
                  onChange={(e) => updateQRData("name", e.target.value)}
                  placeholder="John Doe"
                  className="w-full p-2 sm:p-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                  Organization
                </label>
                <input
                  type="text"
                  value={qrData.organization || ""}
                  onChange={(e) => updateQRData("organization", e.target.value)}
                  placeholder="Company Inc."
                  className="w-full p-2 sm:p-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={qrData.vcardPhone || ""}
                  onChange={(e) => updateQRData("vcardPhone", e.target.value)}
                  placeholder="+1234567890"
                  className="w-full p-2 sm:p-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={qrData.email || ""}
                  onChange={(e) => updateQRData("email", e.target.value)}
                  placeholder="john@example.com"
                  className="w-full p-2 sm:p-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                Website
              </label>
              <input
                type="url"
                value={qrData.website || ""}
                onChange={(e) => updateQRData("website", e.target.value)}
                placeholder="https://example.com"
                className="w-full p-2 sm:p-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      case "location":
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={qrData.latitude || ""}
                  onChange={(e) =>
                    updateQRData("latitude", parseFloat(e.target.value))
                  }
                  placeholder="40.7128"
                  className="w-full p-2 sm:p-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={qrData.longitude || ""}
                  onChange={(e) =>
                    updateQRData("longitude", parseFloat(e.target.value))
                  }
                  placeholder="-74.0060"
                  className="w-full p-2 sm:p-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );

      case "calendar":
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                Event Title
              </label>
              <input
                type="text"
                value={qrData.calendarTitle || ""}
                onChange={(e) => updateQRData("calendarTitle", e.target.value)}
                placeholder="Meeting with John"
                className="w-full p-2 sm:p-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                  Start Date
                </label>
                <input
                  type="datetime-local"
                  value={qrData.startDate || ""}
                  onChange={(e) => updateQRData("startDate", e.target.value)}
                  className="w-full p-2 sm:p-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                  End Date
                </label>
                <input
                  type="datetime-local"
                  value={qrData.endDate || ""}
                  onChange={(e) => updateQRData("endDate", e.target.value)}
                  className="w-full p-2 sm:p-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                Description
              </label>
              <textarea
                value={qrData.description || ""}
                onChange={(e) => updateQRData("description", e.target.value)}
                placeholder="Event description"
                rows={2}
                className="w-full p-2 sm:p-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-gray-800 shadow-soft max-w-4xl mx-auto">
      <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white">
        Universal QR Generator
      </h3>
      <p className="text-xs sm:text-sm text-gray-300 mb-4">
        Generate QR codes for URLs, WiFi passwords, contact info, and more.
      </p>

      {/* QR Type Selection */}
      <div className="mb-4">
        <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
          QR Code Type
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {[
            { type: "url", name: "URL", icon: "🌐" },
            { type: "text", name: "Text", icon: "📝" },
            { type: "wifi", name: "WiFi", icon: "📶" },
            { type: "email", name: "Email", icon: "📧" },
            { type: "sms", name: "SMS", icon: "💬" },
            { type: "phone", name: "Phone", icon: "📞" },
            { type: "vcard", name: "Contact", icon: "👤" },
            { type: "location", name: "Location", icon: "📍" },
            { type: "calendar", name: "Calendar", icon: "📅" },
          ].map(({ type, name, icon }) => (
            <button
              key={type}
              onClick={() => {
                setQrType(type as QRType);
                setQrData((prev) => ({ ...prev, type: type as QRType }));
              }}
              className={`p-3 rounded-lg border-2 transition-all duration-200 text-xs sm:text-sm ${
                qrType === type
                  ? "border-blue-500 bg-blue-500/20 text-blue-300"
                  : "border-gray-600 hover:border-gray-500 bg-gray-700/50 text-gray-300 hover:text-white"
              }`}
            >
              <div className="text-lg mb-1">{icon}</div>
              <div>{name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* QR Type Form */}
      <div className="mb-4">{renderQRTypeForm()}</div>

      {/* QR Settings */}
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
            Size: {qrData.size}px
          </label>
          <input
            type="range"
            min="128"
            max="1024"
            step="32"
            value={qrData.size || 256}
            onChange={(e) => updateQRData("size", parseInt(e.target.value))}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
            Error Correction
          </label>
          <select
            value={qrData.errorCorrection || "M"}
            onChange={(e) => updateQRData("errorCorrection", e.target.value)}
            className="w-full p-2 sm:p-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="L">Low (7%)</option>
            <option value="M">Medium (15%)</option>
            <option value="Q">Quartile (25%)</option>
            <option value="H">High (30%)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
            Margin: {qrData.margin}px
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={qrData.margin || 4}
            onChange={(e) => updateQRData("margin", parseInt(e.target.value))}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
      </div>

      {/* Generate Button */}
      <div className="mb-4">
        <button
          onClick={generateQR}
          disabled={isProcessing}
          className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm sm:text-base"
        >
          {isProcessing ? "Generating..." : "Generate QR Code"}
        </button>
      </div>

      {/* Generated QR Code */}
      {generatedQR && (
        <div className="mb-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
          <div className="text-center">
            <img
              src={generatedQR}
              alt="Generated QR Code"
              className="mx-auto mb-4 rounded-lg"
              style={{ maxWidth: "100%", height: "auto" }}
            />
            <button
              onClick={downloadResult}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
            >
              Download QR Code
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div
          className={`p-4 rounded-lg border ${
            result.type === "success"
              ? "bg-green-900/20 border-green-500/50 text-green-300"
              : "bg-red-900/20 border-red-500/50 text-red-300"
          }`}
        >
          <p className="text-sm">{result.message}</p>
        </div>
      )}

      {/* Monetization Modal */}
      <MonetizationModal
        isOpen={monetizationState.isModalOpen}
        onClose={closeMonetizationModal}
        onAdComplete={handleAdCompleteWithDownload}
        onPaymentComplete={handlePaymentCompleteWithDownload}
        fileName={monetizationState.fileName}
        fileType={monetizationState.fileType}
      />
    </div>
  );
};

export default QRGeneratorTool;

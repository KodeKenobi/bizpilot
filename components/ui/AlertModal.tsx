import React from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: "success" | "error" | "warning" | "info";
  primaryButton?: {
    text: string;
    onClick: () => void;
    variant?: "primary" | "secondary" | "danger";
  };
  secondaryButton?: {
    text: string;
    onClick: () => void;
    variant?: "primary" | "secondary" | "danger";
  };
  showCloseButton?: boolean;
}

const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = "info",
  primaryButton,
  secondaryButton,
  showCloseButton = true,
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case "error":
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      case "info":
      default:
        return <Info className="w-6 h-6 text-blue-500" />;
    }
  };

  const getIconBgColor = () => {
    switch (type) {
      case "success":
        return "bg-green-100";
      case "error":
        return "bg-red-100";
      case "warning":
        return "bg-yellow-100";
      case "info":
      default:
        return "bg-blue-100";
    }
  };

  const getButtonStyles = (variant: string = "primary") => {
    const baseStyles =
      "px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

    switch (variant) {
      case "primary":
        return `${baseStyles} bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500`;
      case "secondary":
        return `${baseStyles} bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500`;
      case "danger":
        return `${baseStyles} bg-red-600 hover:bg-red-700 text-white focus:ring-red-500`;
      default:
        return `${baseStyles} bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-gray-800 shadow-xl transition-all">
          {/* Header */}
          <div className="flex items-start justify-between p-6">
            <div className="flex items-center space-x-3">
              <div
                className={`flex-shrink-0 rounded-full p-2 ${getIconBgColor()}`}
              >
                {getIcon()}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
              </div>
            </div>

            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Body */}
          <div className="px-6 pb-4">
            <p className="text-gray-300 text-sm leading-relaxed">{message}</p>
          </div>

          {/* Footer */}
          {(primaryButton || secondaryButton) && (
            <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-gray-700/50">
              {secondaryButton && (
                <button
                  onClick={secondaryButton.onClick}
                  className={getButtonStyles(secondaryButton.variant)}
                >
                  {secondaryButton.text}
                </button>
              )}
              {primaryButton && (
                <button
                  onClick={primaryButton.onClick}
                  className={getButtonStyles(primaryButton.variant)}
                >
                  {primaryButton.text}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertModal;

import React from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "danger" | "success" | "outline";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  className = "",
  icon,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return "bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700";
      case "secondary":
        return "bg-gray-600 hover:bg-gray-700 text-white border-gray-600 hover:border-gray-700";
      case "danger":
        return "bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700";
      case "success":
        return "bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700";
      case "outline":
        return "bg-transparent hover:bg-gray-100 text-gray-700 border-gray-300 hover:border-gray-400";
      default:
        return "bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700";
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return "px-3 py-1.5 text-sm";
      case "md":
        return "px-4 py-2 text-sm";
      case "lg":
        return "px-6 py-3 text-base";
      default:
        return "px-4 py-2 text-sm";
    }
  };

  const getDisabledStyles = () => {
    if (disabled || loading) {
      return "opacity-50 cursor-not-allowed";
    }
    return "";
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2
        font-medium rounded-lg border
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-2
        active:scale-95
        ${getVariantStyles()}
        ${getSizeStyles()}
        ${getDisabledStyles()}
        ${className}
      `}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {!loading && icon && <span className="flex-shrink-0">{icon}</span>}
      <span className={loading ? "opacity-0" : ""}>{children}</span>
    </button>
  );
};

export default Button;

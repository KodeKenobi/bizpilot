"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  AlertCircle,
  CheckCircle,
  Loader,
  Shield,
  Settings,
  BarChart3,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { getApiUrl } from "@/lib/config";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useUser();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isSuperAdminEmail = formData.email === "kodekenobi@gmail.com";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);

    return {
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers,
      errors: [
        !minLength && "At least 8 characters",
        !hasUpperCase && "One uppercase letter",
        !hasLowerCase && "One lowercase letter",
        !hasNumbers && "One number",
      ].filter(Boolean),
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      setError(
        `Password requirements not met: ${passwordValidation.errors.join(", ")}`
      );
      setLoading(false);
      return;
    }

    try {
      // Call the authentication API
      const response = await fetch(getApiUrl("/auth/register"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Account created successfully! Auto-logging in...");
        // Auto-login after successful registration
        const loginSuccess = await login(formData.email, formData.password);
        if (loginSuccess) {
          setTimeout(() => {
            // Redirect based on user role
            if (isSuperAdminEmail) {
              router.push("/admin");
            } else {
              router.push("/dashboard");
            }
          }, 1500);
        } else {
          router.push("/auth/login");
        }
      } else {
        setError(data.error || "Registration failed. Please try again.");
      }
    } catch (error) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const passwordValidation = validatePassword(formData.password);

  return (
    <div className="flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-16 w-16 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Trevnoctilla Logo"
              width={64}
              height={64}
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Or{" "}
            <Link
              href="/auth/login"
              className="font-medium text-purple-400 hover:text-purple-300"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-900/20 border border-red-500/30 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-300">Error</h3>
                  <div className="mt-2 text-sm text-red-200">{error}</div>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-900/20 border border-green-500/30 p-4">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-300">
                    Success
                  </h3>
                  <div className="mt-2 text-sm text-green-200">{success}</div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300"
              >
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-md relative block w-full pl-10 pr-3 py-2 border border-gray-600 bg-gray-800/50 placeholder-gray-400 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300"
              >
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded-md relative block w-full pl-10 pr-10 py-2 border border-gray-600 bg-gray-800/50 placeholder-gray-400 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-300 focus:outline-none focus:text-gray-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              {formData.password && (
                <div className="mt-2">
                  <p className="text-xs text-gray-400 mb-2">
                    Password requirements:
                  </p>
                  <ul className="text-xs space-y-1">
                    <li
                      className={`flex items-center ${
                        formData.password.length >= 8
                          ? "text-green-400"
                          : "text-gray-500"
                      }`}
                    >
                      <CheckCircle
                        className={`h-3 w-3 mr-1 ${
                          formData.password.length >= 8
                            ? "text-green-400"
                            : "text-gray-500"
                        }`}
                      />
                      At least 8 characters
                    </li>
                    <li
                      className={`flex items-center ${
                        /[A-Z]/.test(formData.password)
                          ? "text-green-400"
                          : "text-gray-500"
                      }`}
                    >
                      <CheckCircle
                        className={`h-3 w-3 mr-1 ${
                          /[A-Z]/.test(formData.password)
                            ? "text-green-400"
                            : "text-gray-500"
                        }`}
                      />
                      One uppercase letter
                    </li>
                    <li
                      className={`flex items-center ${
                        /[a-z]/.test(formData.password)
                          ? "text-green-400"
                          : "text-gray-500"
                      }`}
                    >
                      <CheckCircle
                        className={`h-3 w-3 mr-1 ${
                          /[a-z]/.test(formData.password)
                            ? "text-green-400"
                            : "text-gray-500"
                        }`}
                      />
                      One lowercase letter
                    </li>
                    <li
                      className={`flex items-center ${
                        /\d/.test(formData.password)
                          ? "text-green-400"
                          : "text-gray-500"
                      }`}
                    >
                      <CheckCircle
                        className={`h-3 w-3 mr-1 ${
                          /\d/.test(formData.password)
                            ? "text-green-400"
                            : "text-gray-500"
                        }`}
                      />
                      One number
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-300"
              >
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded-md relative block w-full pl-10 pr-10 py-2 border border-gray-600 bg-gray-800/50 placeholder-gray-400 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-300 focus:outline-none focus:text-gray-300"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password Match Indicator */}
              {formData.confirmPassword && (
                <div className="mt-1">
                  {formData.password === formData.confirmPassword ? (
                    <p className="text-xs text-green-400 flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Passwords match
                    </p>
                  ) : (
                    <p className="text-xs text-red-400 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Passwords do not match
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="agree-terms"
              name="agree-terms"
              type="checkbox"
              required
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 bg-gray-800 rounded"
            />
            <label
              htmlFor="agree-terms"
              className="ml-2 block text-sm text-gray-300"
            >
              I agree to the{" "}
              <Link
                href="/terms"
                className="text-purple-400 hover:text-purple-300"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-purple-400 hover:text-purple-300"
              >
                Privacy Policy
              </Link>
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={
                loading ||
                !passwordValidation.isValid ||
                formData.password !== formData.confirmPassword
              }
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                "Create account"
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-medium text-purple-400 hover:text-purple-300"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </form>

        {/* Admin Cards for Super Admin */}
        {isSuperAdminEmail && (
          <div className="mt-8">
            <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="h-6 w-6 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">
                  Super Admin Access
                </h3>
              </div>
              <p className="text-sm text-gray-300 mb-4">
                You have super admin privileges. After registration, you'll have
                access to:
              </p>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
                  <Settings className="h-5 w-5 text-blue-400" />
                  <span className="text-sm text-gray-300">
                    System Administration
                  </span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-green-400" />
                  <span className="text-sm text-gray-300">
                    Advanced Analytics
                  </span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
                  <Shield className="h-5 w-5 text-purple-400" />
                  <span className="text-sm text-gray-300">User Management</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

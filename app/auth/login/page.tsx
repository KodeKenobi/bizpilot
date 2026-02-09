"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { signIn, getSession } from "next-auth/react";
import { getApiUrl } from "@/lib/config";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle,
  Loader,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password. Please try again.");
      } else if (result?.ok) {
        setSuccess("Login successful!");

        // Also get a backend JWT token from NextAuth session
        try {
          const tokenResponse = await fetch(
            getApiUrl("/auth/get-token-from-session"),
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: formData.email,
                // Password optional - NextAuth session is trusted
                // Sending it for backward compatibility but not required
                password: formData.password,
                // Don't send role - let backend use the role from database
                // role: undefined,  // Backend will use existing role from DB
                subscription_tier: "free", // Will be updated by backend from database
              }),
            }
          );

          if (tokenResponse.ok) {
            const backendData = await tokenResponse.json();
            // Store backend JWT token for API calls
            localStorage.setItem("auth_token", backendData.access_token);
            localStorage.setItem("user_data", JSON.stringify(backendData.user));
          }
        } catch (backendError) {
          // Don't block login if backend auth fails - NextAuth session is enough for UI
        }

        // Get the session to check user role
        const session = await getSession();

        // Fetch user profile to check subscription tier
        const token = localStorage.getItem("auth_token");
        let userProfile = null;
        
        if (token) {
          try {
            const profileResponse = await fetch("/api/auth/profile", {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            });
            
            if (profileResponse.ok) {
              userProfile = await profileResponse.json();
            }
          } catch (e) {
            console.error("Failed to fetch user profile:", e);
          }
        }

        setTimeout(() => {
          // Check for pending subscription
          const pendingSubscription = sessionStorage.getItem(
            "pending_subscription"
          );
          if (pendingSubscription) {
            try {
              const subData = JSON.parse(pendingSubscription);
              sessionStorage.removeItem("pending_subscription");

              // Redirect based on user role and subscription
              if ((session?.user as any)?.role === "super_admin") {
                router.push("/admin");
              } else if (subData.isSubscription) {
                router.push("/dashboard?tab=settings");
              } else {
                router.push("/dashboard");
              }
            } catch (e) {
              // If parsing fails, just redirect normally
              if ((session?.user as any)?.role === "super_admin") {
                router.push("/admin");
              } else {
                router.push("/dashboard");
              }
            }
          } else {
            // Check subscription tier and redirect accordingly
            const subscriptionTier = userProfile?.subscription_tier?.toLowerCase() || "free";
            const isEnterprise =
              subscriptionTier === "enterprise" ||
              userProfile?.monthly_call_limit === -1 ||
              (userProfile?.monthly_call_limit && userProfile.monthly_call_limit >= 100000);

            // Redirect based on user role and subscription tier
            if ((session?.user as any)?.role === "super_admin") {
              router.push("/admin");
            } else if ((session?.user as any)?.role === "admin") {
              router.push("/admin");
            } else if (isEnterprise) {
              router.push("/enterprise");
            } else {
              router.push("/dashboard");
            }
          }
        }, 1500);
      }
    } catch (error) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

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
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground dark:text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground dark:text-gray-400">
            Or{" "}
            <Link
              href="/auth/register"
              className="font-medium text-purple-400 hover:text-purple-300"
            >
              create a new account
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
                className="block text-sm font-medium text-foreground/90 dark:text-gray-300"
              >
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-muted-foreground dark:text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-md relative block w-full pl-10 pr-3 py-2 border border-border dark:border-gray-600 bg-card/50 dark:bg-gray-800/50 placeholder-muted-foreground dark:placeholder-gray-400 text-foreground dark:text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground/90 dark:text-gray-300"
              >
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground dark:text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-md relative block w-full pl-10 pr-10 py-2 border border-border dark:border-gray-600 bg-card/50 dark:bg-gray-800/50 placeholder-muted-foreground dark:placeholder-gray-400 text-foreground dark:text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    className="text-muted-foreground dark:text-gray-400 hover:text-foreground/90 dark:hover:text-gray-300 focus:outline-none focus:text-foreground/90 dark:focus:text-gray-300"
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
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 bg-gray-800 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-foreground/90 dark:text-gray-300"
              >
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link
                href="/auth/reset-password"
                className="font-medium text-purple-400 hover:text-purple-300"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                "Sign in"
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground dark:text-gray-400">
              Don't have an account?{" "}
              <Link
                href="/auth/register"
                className="font-medium text-purple-400 hover:text-purple-300"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

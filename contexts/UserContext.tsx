"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { getApiUrl, getAuthHeaders } from "@/lib/config";

interface User {
  id: number;
  email: string;
  role: "user" | "admin" | "super_admin";
  is_active: boolean;
  created_at: string;
  last_login?: string;
  subscription_tier?: string;
  monthly_call_limit?: number;
  monthly_used?: number;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuthStatus: () => Promise<void>;
  refreshSessionSilently: () => Promise<boolean>;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const isSuperAdmin = user?.role === "super_admin";

  useEffect(() => {
    // Check if user is logged in on mount
    checkAuthStatus();
  }, [session]);

  const checkAuthStatus = async () => {
    const startTime = Date.now();

    // Use cached data immediately to avoid showing loading state
    const cachedUserData = localStorage.getItem("user_data");
    if (cachedUserData && !user) {
      try {
        const userData = JSON.parse(cachedUserData);

        setUser(userData);
        setLoading(false);
      } catch (e) {}
    }

    try {
      // Check for token first - don't make API calls if no token exists
      const token = localStorage.getItem("auth_token");

      if (token) {
        try {
          const fetchStartTime = Date.now();
          const response = await fetch("/api/auth/profile", {
            headers: getAuthHeaders(token),
            signal: AbortSignal.timeout(30000), // 30 second timeout (increased to handle slow backend responses)
          });
          const fetchTime = Date.now() - fetchStartTime;

          if (response.ok) {
            const userData = await response.json();
            const totalTime = Date.now() - startTime;

            // Store fresh user data
            localStorage.setItem("user_data", JSON.stringify(userData));
            setUser(userData);
            setLoading(false);
            return;
          } else if (response.status === 401) {
            // Unauthorized - token is invalid, clear it
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user_data");
            setUser(null);
            setLoading(false);
            return;
          } else if (response.status === 404) {
            // User was deleted - log them out
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user_data");
            const { signOut } = await import("next-auth/react");
            await signOut({ redirect: true, callbackUrl: "/auth/login" });
            setUser(null);
            setLoading(false);
            return;
          } else {
            const totalTime = Date.now() - startTime;
            // Try to use cached user data as fallback
            const cachedUserData = localStorage.getItem("user_data");
            if (cachedUserData) {
              try {
                const userData = JSON.parse(cachedUserData);

                setUser(userData);
                setLoading(false);
                return;
              } catch (e) {}
            }
          }
        } catch (profileError: any) {
          const totalTime = Date.now() - startTime;

          if (
            profileError.name === "TimeoutError" ||
            profileError.name === "AbortError"
          ) {
            // Use cached data if API times out
            const cachedUserData = localStorage.getItem("user_data");
            if (cachedUserData) {
              try {
                const userData = JSON.parse(cachedUserData);

                setUser(userData);
                setLoading(false);
                return;
              } catch (e) {}
            }
          }
        }
      }

      // Fallback: If we have a NextAuth session, use it
      if (session?.user) {
        const totalTime = Date.now() - startTime;

        const userFromSession: User = {
          id: parseInt(session.user.id),
          email: session.user.email || "",
          role: (session.user as any).role,
          is_active: (session.user as any).is_active,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
          subscription_tier: (session.user as any).subscription_tier || "free",
        };
        setUser(userFromSession);

        // If no backend token exists, get one from NextAuth session
        const existingToken = localStorage.getItem("auth_token");
        if (!existingToken && session.user.email) {
          try {
            // Use endpoint to get backend token from NextAuth session
            // NOTE: This will return 404 if user was deleted (prevents resurrection)
            const tokenResponse = await fetch(
              getApiUrl("/auth/get-token-from-session"),
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  email: session.user.email,
                  // Password no longer required - NextAuth session is trusted
                  // Don't send role - let backend use the role from database
                  // role: undefined,  // Backend will use existing role from DB
                  subscription_tier:
                    (session.user as any)?.subscription_tier || "free",
                }),
              }
            );

            // If user not found (404), user was deleted - log them out
            if (tokenResponse.status === 404) {
              // Clear all auth data
              localStorage.removeItem("auth_token");
              localStorage.removeItem("user_data");
              // Sign out from NextAuth
              const { signOut } = await import("next-auth/react");
              await signOut({ redirect: true, callbackUrl: "/auth/login" });
              setUser(null);
              setLoading(false);
              return;
            }

            if (tokenResponse.ok) {
              const backendData = await tokenResponse.json();
              localStorage.setItem("auth_token", backendData.access_token);
              localStorage.setItem(
                "user_data",
                JSON.stringify(backendData.user)
              );

              // Update user with backend data (includes subscription_tier)
              setUser(backendData.user);
            }
          } catch (backendError) {
            // Don't block - NextAuth session is enough for UI
          }
        }

        setLoading(false);
        return;
      }

      // Fallback to localStorage token check (token already defined above)
      const totalTime = Date.now() - startTime;

      if (!token) {
        setLoading(false);
        return;
      }

      // Try to get user data from localStorage first (from login response)
      const storedUser = localStorage.getItem("user_data");
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);

          setUser(userData);
          setLoading(false);
          return;
        } catch (error) {}
      }

      // Fallback: Try to decode the JWT token to get user info
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));

        // Create a user object from the token
        const userFromToken: User = {
          id: parseInt(payload.sub),
          email: "kodekenobi@gmail.com", // This should come from the token in a real implementation
          role: "super_admin" as const, // This should come from the token in a real implementation
          is_active: true,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
        };

        setUser(userFromToken);
        setLoading(false);
        return;
      } catch (jwtError) {}

      const response = await fetch(getApiUrl("/auth/profile"), {
        headers: getAuthHeaders(token),
      });

      if (response.ok) {
        const userData = await response.json();

        setUser(userData);
      } else {
        localStorage.removeItem("auth_token");
      }
    } catch (error) {
      const totalTime = Date.now() - startTime;

      // Don't remove token on network errors, just log

      // Ensure loading is set to false even on error
      setLoading(false);
    } finally {
      const totalTime = Date.now() - startTime;

      // Double-check loading is false
      if (loading) {
        setLoading(false);
      }

      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();

        localStorage.setItem("auth_token", data.access_token);
        localStorage.setItem("user_data", JSON.stringify(data.user));
        setUser(data.user);

        return true;
      } else {
        const errorData = await response.json();

        return false;
      }
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    localStorage.removeItem("api_test_key");
    setUser(null);
    signOut({ callbackUrl: "/" });
  };

  /**
   * Silently refresh the user session by clearing tokens and fetching fresh user data
   * This is used after payment success to ensure the session reflects the new subscription tier
   * Returns true if successful, false otherwise
   */
  const refreshSessionSilently = async (): Promise<boolean> => {
    try {
      // Get current user email before clearing tokens
      const currentUser = user;
      const currentEmail = currentUser?.email;
      const currentToken = localStorage.getItem("auth_token");

      if (!currentEmail && !currentToken) {
        return false;
      }

      // Get email from session if not available from user state
      let emailToUse = currentEmail;
      if (!emailToUse) {
        try {
          const sessionResponse = await fetch("/api/auth/session");
          const session = await sessionResponse.json();
          emailToUse = session?.user?.email;
        } catch (error) {
          return false;
        }
      }

      if (!emailToUse) {
        return false;
      }

      // Clear current tokens and user data (silently, no redirect)
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
      setUser(null);

      // Sign out from NextAuth silently (without redirect)
      try {
        await signOut({ redirect: false });
      } catch (signOutError) {
        // Sign out error (non-critical)
      }

      // Wait a moment for cleanup
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Now fetch fresh user data using checkAuthStatus
      // This will use NextAuth session if available, or try to get a new token
      await checkAuthStatus();

      // Verify we got fresh user data
      const freshUser = user;
      if (freshUser && freshUser.email === emailToUse) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        loading: loading || status === "loading",
        login,
        logout,
        checkAuthStatus,
        refreshSessionSilently,
        isAdmin,
        isSuperAdmin,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

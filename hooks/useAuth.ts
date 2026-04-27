"use client";

import { useSession } from "next-auth/react";
import { useUser } from "@/contexts/UserContext";

export function useAuth() {
  const { data: session, status } = useSession();
  const { user, loading: userLoading, logout: userLogout } = useUser();

  // Use NextAuth session if available, fallback to UserContext
  const isAuthenticated = !!session || !!user;
  const isLoading = status === "loading" || userLoading;

  const logout = () => {
    userLogout();
    // NextAuth logout will be handled by the session provider
  };

  return {
    user: session?.user || user,
    isAuthenticated,
    isLoading,
    logout,
    session,
  };
}

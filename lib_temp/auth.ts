import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Auth options configuration
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error("[NextAuth] Missing credentials");
          return null;
        }

        try {
          const apiBaseUrl = (() => {
            if (process.env.NEXT_PUBLIC_API_BASE_URL) {
              return process.env.NEXT_PUBLIC_API_BASE_URL;
            }
            const isProduction = process.env.NODE_ENV === "production";
            return isProduction
              ? "https://web-production-737b.up.railway.app"
              : "http://localhost:5000";
          })();

          console.log(`[NextAuth] Attempting login for: ${credentials.email}`);
          console.log(`[NextAuth] API Base URL: ${apiBaseUrl}`);

          const response = await fetch(`${apiBaseUrl}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const responseText = await response.text();
          console.log(`[NextAuth] Response status: ${response.status}`);
          console.log(
            `[NextAuth] Response body: ${responseText.substring(0, 200)}`
          );

          if (!response.ok) {
            console.error(
              `[NextAuth] Backend auth failed: ${response.status} - ${responseText}`
            );
            return null;
          }

          let data;
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.error(`[NextAuth] Failed to parse response: ${parseError}`);
            return null;
          }

          if (data.user) {
            console.log(
              `[NextAuth] Authentication successful for: ${data.user.email}`
            );
            
            // Warn if access_token is missing but don't block login
            if (!data.access_token) {
              console.warn(
                `[NextAuth] Warning: access_token missing for ${data.user.email}`
              );
            }
            
            return {
              id: data.user.id?.toString() || data.user.email,
              email: data.user.email,
              name: data.user.email,
              role: data.user.role || "user",
              is_active: data.user.is_active !== false,
              subscription_tier: data.user.subscription_tier || "free",
              accessToken: data.access_token || null, // Store backend JWT token (may be null)
            };
          }

          console.error(`[NextAuth] Invalid response structure:`, data);
          return null;
        } catch (error) {
          console.error("[NextAuth] Error during authentication:", error);
          if (error instanceof Error) {
            console.error("[NextAuth] Error message:", error.message);
            console.error("[NextAuth] Error stack:", error.stack);
          }
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      // If user object is provided (initial login), use it
      if (user) {
        console.log(`[NextAuth JWT] Setting user data for: ${user.email}`);
        token.id = user.id;
        token.role = user.role;
        token.is_active = user.is_active;
        token.subscription_tier = (user as any).subscription_tier || "free";
        token.accessToken = (user as any).accessToken || null; // Store backend JWT token (may be null)
      }
      
      // If session is being updated (trigger === "update"), fetch fresh user data from backend
      // Note: This runs server-side, so we can't access localStorage
      // The frontend should handle token refresh separately if needed
      if (trigger === "update" && token.email) {
        try {
          const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 
            (process.env.NODE_ENV === "production" 
              ? "https://web-production-737b.up.railway.app"
              : "http://localhost:5000");
          
          // For server-side refresh, we'd need the token passed in the update call
          // For now, just return the existing token
          console.log(`[NextAuth JWT] Session update requested for: ${token.email}`);
        } catch (error) {
          console.error("[NextAuth JWT] Error refreshing user data:", error);
          // Continue with existing token data if refresh fails
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "user" | "admin" | "super_admin";
        session.user.is_active = token.is_active as boolean;
        (session.user as any).subscription_tier =
          (token.subscription_tier as string) || "free";
        (session as any).accessToken = (token.accessToken as string) || null; // Store backend JWT token in session (may be null)
        console.log(
          `NextAuth Session: Session created for: ${
            session.user.email
          } (tier: ${(session.user as any).subscription_tier})`
        );
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development",
  debug: process.env.NODE_ENV === "development",
};

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Set NEXTAUTH_URL if not already set (required for NextAuth)
if (!process.env.NEXTAUTH_URL) {
  const port = process.env.PORT || "3000";
  process.env.NEXTAUTH_URL = `http://localhost:${port}`;
}

// Set NEXTAUTH_SECRET if not already set (required for NextAuth)
// This must be set before NextAuth is initialized
// In production, this MUST be set as an environment variable in Railway
if (!process.env.NEXTAUTH_SECRET) {
  // Check if we're in production runtime (Railway sets NODE_ENV=production at runtime)
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "NEXTAUTH_SECRET is required in production. Set it as an environment variable in Railway."
    );
  }
  // Development fallback only
  process.env.NEXTAUTH_SECRET = "development-secret-key-change-in-production";
}

// Initialize NextAuth handler
let handler: ReturnType<typeof NextAuth>;

try {
  handler = NextAuth(authOptions);
} catch (error) {
  throw error;
}

export { handler as GET, handler as POST };

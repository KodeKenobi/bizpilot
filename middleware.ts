import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Create response
    const response = NextResponse.next();

    // Security Headers
    // Content Security Policy - Allow Ezoic scripts but restrict others
    const csp = [
      "default-src 'self' https:",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cmp.gatekeeperconsent.com https://the.gatekeeperconsent.com https://www.ezojs.com https://pagead2.googlesyndication.com https://www.googletagmanager.com https://www.google.com https://www.gstatic.com https://cdn.id5-sync.com https://g.ezoic.net https://googleads.g.doubleclick.net https://api.rlcdn.com https://ep2.adtrafficquality.google https://ep1.adtrafficquality.google https://lbs.eu-1-id5-sync.com https://lb.eu-1-id5-sync.com https://id5-sync.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' blob: https://*.railway.app wss://*.railway.app https://*.trevnoctilla.com wss://*.trevnoctilla.com https://www.payfast.co.za https://sandbox.payfast.co.za https://www.googletagmanager.com https://www.google-analytics.com https://fonts.googleapis.com https://fonts.gstatic.com https://g.ezoic.net https://cdn.id5-sync.com https://api.rlcdn.com https://privacy.gatekeeperconsent.com https://googleads.g.doubleclick.net https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google https://lbs.eu-1-id5-sync.com https://lb.eu-1-id5-sync.com https://id5-sync.com https://api.rlcdn.com",
      "frame-src 'self' blob: https://www.payfast.co.za https://sandbox.payfast.co.za https://www.google.com https://googleads.g.doubleclick.net https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google",
      "object-src 'none'",
      "base-uri 'self'",
      // "form-action 'self' https://www.payfast.co.za https://sandbox.payfast.co.za",
      "frame-ancestors 'self'",
      "upgrade-insecure-requests",
    ].join("; ");

    response.headers.set("Content-Security-Policy", csp);

    // Strict Transport Security
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );

    // Cross-Origin-Opener-Policy
    response.headers.set(
      "Cross-Origin-Opener-Policy",
      "same-origin-allow-popups"
    );

    // Cross-Origin-Embedder-Policy
    response.headers.set("Cross-Origin-Embedder-Policy", "unsafe-none");

    // X-Frame-Options (backup for older browsers)
    response.headers.set("X-Frame-Options", "SAMEORIGIN");

    // X-Content-Type-Options
    response.headers.set("X-Content-Type-Options", "nosniff");

    // Referrer-Policy
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

    // Permissions-Policy
    response.headers.set(
      "Permissions-Policy",
      "geolocation=(), microphone=(), camera=(), payment=(self)"
    );

    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public routes
        const publicRoutes = [
          "/",
          "/auth/login",
          "/auth/register",
          "/auth/reset-password",
          "/privacy",
          "/terms",
          "/cookies",
          "/tools",
          "/api-docs",
          "/api/campaigns",
          "/campaigns",
        ];
        const isPublicRoute = publicRoutes.some((route) =>
          req.nextUrl.pathname.startsWith(route)
        );

        if (isPublicRoute) {
          return true;
        }

        // Require authentication for protected routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/enterprise/:path*",
    "/api/protected/:path*",
    // Apply security headers to all routes
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

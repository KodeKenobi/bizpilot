/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost", "web-production-737b.up.railway.app"],
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'https://web-production-737b.up.railway.app';
    
    return [
      {
        source: "/convert/:path*",
        destination: `${backendUrl}/convert/:path*`,
      },
      {
        source: "/editor/:path*",
        destination: `${backendUrl}/editor/:path*`,
      },
      {
        source: "/api/pdf_info/:path*",
        destination: `${backendUrl}/api/pdf_info/:path*`,
      },
      {
        source: "/api/pdf_thumbnail/:path*",
        destination: `${backendUrl}/api/pdf_thumbnail/:path*`,
      },
      {
        source: "/view_html/:path*",
        destination: `${backendUrl}/view_html/:path*`,
      },
      {
        source: "/download_converted/:path*",
        destination: `${backendUrl}/download_converted/:path*`,
      },
      {
        source: "/save_html/:path*",
        destination: `${backendUrl}/save_html/:path*`,
      },
      {
        source: "/cleanup_session/:path*",
        destination: `${backendUrl}/cleanup_session/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;

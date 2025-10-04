/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost"],
  },
  async rewrites() {
    return [
      {
        source: "/convert/:path*",
        destination: "http://localhost:5000/convert/:path*",
      },
      {
        source: "/editor/:path*",
        destination: "http://localhost:5000/editor/:path*",
      },
      {
        source: "/api/pdf_info/:path*",
        destination: "http://localhost:5000/api/pdf_info/:path*",
      },
      {
        source: "/api/pdf_thumbnail/:path*",
        destination: "http://localhost:5000/api/pdf_thumbnail/:path*",
      },
      {
        source: "/view_html/:path*",
        destination: "http://localhost:5000/view_html/:path*",
      },
      {
        source: "/download_converted/:path*",
        destination: "http://localhost:5000/download_converted/:path*",
      },
      {
        source: "/save_html/:path*",
        destination: "http://localhost:5000/save_html/:path*",
      },
      {
        source: "/cleanup_session/:path*",
        destination: "http://localhost:5000/cleanup_session/:path*",
      },
    ];
  },
};

module.exports = nextConfig;

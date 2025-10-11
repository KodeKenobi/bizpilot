/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost"],
  },
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  
  // Environment-based configuration
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    return [
      {
        source: "/convert/:path*",
        destination: `${apiUrl}/convert/:path*`,
      },
      {
        source: "/editor/:path*",
        destination: `${apiUrl}/editor/:path*`,
      },
      {
        source: "/api/pdf_info/:path*",
        destination: `${apiUrl}/api/pdf_info/:path*`,
      },
      {
        source: "/api/pdf_thumbnail/:path*",
        destination: `${apiUrl}/api/pdf_thumbnail/:path*`,
      },
      {
        source: "/view_html/:path*",
        destination: `${apiUrl}/view_html/:path*`,
      },
      {
        source: "/download_converted/:path*",
        destination: `${apiUrl}/download_converted/:path*`,
      },
      {
        source: "/save_html/:path*",
        destination: `${apiUrl}/save_html/:path*`,
      },
      {
        source: "/cleanup_session/:path*",
        destination: `${apiUrl}/cleanup_session/:path*`,
      },
      {
        source: "/split_pdf",
        destination: `${apiUrl}/split_pdf`,
      },
      {
        source: "/merge_pdfs",
        destination: `${apiUrl}/merge_pdfs`,
      },
      {
        source: "/view_split/:path*",
        destination: `${apiUrl}/view_split/:path*`,
      },
      {
        source: "/download_split/:path*",
        destination: `${apiUrl}/download_split/:path*`,
      },
      {
        source: "/extract_text",
        destination: `${apiUrl}/extract_text`,
      },
      {
        source: "/extract_images",
        destination: `${apiUrl}/extract_images`,
      },
      {
        source: "/download_image/:path*",
        destination: `${apiUrl}/download_image/:path*`,
      },
      {
        source: "/generate_pdf",
        destination: `${apiUrl}/generate_pdf`,
      },
      {
        source: "/upload",
        destination: `${apiUrl}/upload`,
      },
    ];
  },
};

module.exports = nextConfig;

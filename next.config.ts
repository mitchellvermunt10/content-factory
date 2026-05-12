import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["ffmpeg-static", "@ffprobe-installer/ffprobe"],
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  async redirects() {
    return [
      {
        // De oude product-pagina is vervangen door de homepage zelf —
        // 301 consolidatie voor SEO + bookmarks.
        source: "/next-level-site",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

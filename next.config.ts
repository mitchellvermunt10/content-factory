import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // ffmpeg-static en ffprobe leveren een binary-pad op via __dirname.
  // Als Turbopack ze bundelt wordt dat pad gemangled tot \\ROOT\\... en
  // faalt spawn() met ENOENT. serverExternalPackages laat ze als gewone
  // Node-imports staan zodat het echte binary-pad bewaard blijft.
  serverExternalPackages: ["ffmpeg-static", "@ffprobe-installer/ffprobe"],
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

export default nextConfig;

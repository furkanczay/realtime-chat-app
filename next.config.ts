import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Socket.io ile uyumlu olmak için standalone output
  output: "standalone",
  // TypeScript derlemesi için
  typescript: {
    // Geliştirme sırasında tip hatalarını görmezden gel
    ignoreBuildErrors: false,
  },
  // Experimental özellikler
  experimental: {
    // Server actions
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
};

export default nextConfig;

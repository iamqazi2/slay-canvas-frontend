import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

module.exports = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://34.67.47.217:8000/api/:path*", // backend
      },
    ];
  },
};

export default nextConfig;

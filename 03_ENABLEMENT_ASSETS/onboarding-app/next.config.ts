import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fija la raíz del workspace a este proyecto (hay otros lockfiles en el sistema).
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;

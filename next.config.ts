import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@google/genai"],
  compiler: {
    styledComponents: true,
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@google/genai"],
  compiler: {
    styledComponents: true,
  },
  outputFileTracingIncludes: {
    "/preview/[agentId]": ["./src/agents/definitions/**/*.json"],
  },
};

export default nextConfig;

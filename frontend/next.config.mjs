/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  env: {
    AGENT_SERVICE_URL: process.env.AGENT_SERVICE_URL ?? "http://localhost:8080",
    AWS_REGION: process.env.AWS_REGION ?? "us-east-1",
  },
};

export default nextConfig;

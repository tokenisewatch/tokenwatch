import type { NextConfig } from "next";

const sepoliaRpcUrl =
  process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ??
  process.env.SEPOLIA_RPC_URL ??
  "https://ethereum-sepolia-rpc.publicnode.com";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SEPOLIA_RPC_URL: sepoliaRpcUrl,
  },
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;

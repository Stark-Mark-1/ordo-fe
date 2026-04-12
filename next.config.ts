import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // @ts-expect-error: allowedDevOrigins may not be in NextConfig types yet
  allowedDevOrigins: ['192.168.29.172'],
};

export default nextConfig;

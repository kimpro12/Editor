import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // React-Konva/Konva can resolve the optional `canvas` dependency for Node bundles,
    // which can fail builds with: "Module not found: Can't resolve 'canvas'".
    // Our editor is loaded client-only (`ssr: false`), so we can externalize it.
    if (isServer) {
      const prev = config.externals;
      if (Array.isArray(prev)) {
        config.externals = [...prev, { canvas: "commonjs canvas" }];
      } else if (prev) {
        config.externals = [prev as any, { canvas: "commonjs canvas" }];
      } else {
        config.externals = [{ canvas: "commonjs canvas" }];
      }
    }
    return config;
  },
};

export default nextConfig;

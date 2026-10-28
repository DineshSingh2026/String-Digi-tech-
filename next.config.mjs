import createMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  // Two root layouts (Classic + Clean) need a global 404 for unmatched URLs: app/global-not-found.tsx
  experimental: { globalNotFound: true },
  turbopack: {
    rules: {
      "*.glsl": { loaders: ["raw-loader"], as: "*.js" },
    },
  },
  webpack: (config) => {
    config.module.rules.push({ test: /\.glsl$/, type: "asset/source" });
    return config;
  },
};

export default createMDX({})(nextConfig);

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  webpack: (config) => {
    config.module = {
      ...config.module,
      exprContextCritical: false, // suppress warning caused within package 'prettier'
    };
    return config;
  },
};

export default nextConfig;

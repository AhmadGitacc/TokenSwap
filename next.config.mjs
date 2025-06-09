/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["raw.githubusercontent.com", "https://isthiscoinascam.com", "https://www.cryptologos.cc",],
  },
  // Disable SWC minifier to fix RainbowKit build issues
  swcMinify: false,

  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
};

export default nextConfig;

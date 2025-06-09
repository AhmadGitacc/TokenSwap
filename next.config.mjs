/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["raw.githubusercontent.com", "https://isthiscoinascam.com", "https://www.cryptologos.cc",],
  },
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');

    // Handle worker files
    config.module.rules.push({
      test: /\.worker\.js$/,
      use: { loader: 'worker-loader' },
    });

    return config;
  },
  transpilePackages: ['@rainbow-me/rainbowkit'],
};

export default nextConfig;

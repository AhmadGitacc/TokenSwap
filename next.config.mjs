/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["raw.githubusercontent.com", "https://isthiscoinascam.com", "https://www.cryptologos.cc",],
  },
  webpack(config) {
    config.module.rules.push({
      test: /HeartbeatWorker\.js$/,
      use: {
        loader: 'worker-loader',
        options: {
          inline: true,
          publicPath: '/_next/static/workers/',
        },
      },
    });
    return config;
  },
};

export default nextConfig;

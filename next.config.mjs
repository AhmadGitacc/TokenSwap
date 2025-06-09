/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["raw.githubusercontent.com", "https://isthiscoinascam.com", "https://www.cryptologos.cc",],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.minimizer = config.optimization.minimizer.map(minimizer => {
        if (minimizer.constructor.name === 'TerserPlugin') {
          minimizer.options.exclude = /HeartbeatWorker\.js$/;
        }
        return minimizer;
      });
    }
  }
};

export default nextConfig;

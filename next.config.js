/** Minimal Next.js config to host the existing SPA client-side */
const webpack = require('webpack');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  webpack: (config, { isServer }) => {
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      assert: require.resolve('assert'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      os: require.resolve('os-browserify/browser'),
      url: require.resolve('url'),
      buffer: require.resolve('buffer'),
      process: false,
    };

    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'process/browser': require.resolve('process/browser.js'),
      '@react-native-async-storage/async-storage': false,
      'openapi-fetch$': require.resolve('openapi-fetch/dist/index.js'),
    };

    config.plugins = config.plugins || [];
    config.plugins.push(
      new webpack.ProvidePlugin({
        process: 'process/browser.js',
        Buffer: ['buffer', 'Buffer'],
      })
    );

    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        module: /ox[\\/]?.*virtualMasterPool/,
        message: /Critical dependency: the request of a dependency is an expression/,
      },
      {
        module: /node_modules/,
        message: /Failed to parse source map/,
      },
    ];

    return config;
  },
};

module.exports = nextConfig;

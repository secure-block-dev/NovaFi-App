const webpack = require('webpack');

module.exports = function override(config) {
  config.resolve.fallback = {
    ...config.resolve.fallback,
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
    ...config.resolve.alias,
    'process/browser': require.resolve('process/browser.js'),
    // @metamask/sdk (a RainbowKit dependency) imports React Native storage
    // that doesn't exist on web; without this the build emits a module-not-found warning
    '@react-native-async-storage/async-storage': false,
    // Forces the ESM build of openapi-fetch: the CJS one breaks esbuild's interop
    // inside @metamask/sdk-analytics ("import_openapi_fetch.default is not a function")
    'openapi-fetch$': require.resolve('openapi-fetch/dist/index.js'),
  };

  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      process: 'process/browser.js',
      Buffer: ['buffer', 'Buffer'],
    }),
  ];

  // ox (a viem dependency) does `await import('node:worker_threads')` with a
  // variable specifier, guarded by an isNode check that's always false in the
  // browser bundle — dead code there, but webpack can't prove that statically
  // and emits "Critical dependency: the request of a dependency is an
  // expression". Harmless, but CI=true (GitHub Actions, Vercel, Netlify...)
  // treats every build warning as a hard error and fails the build over this.
  config.ignoreWarnings = [
    ...(config.ignoreWarnings || []),
    {
      module: /ox[\\/].*virtualMasterPool/,
      message: /Critical dependency: the request of a dependency is an expression/,
    },
    // Several transitive deps (superstruct, @reown/appkit-*, etc.) publish only
    // their compiled dist/ without the .ts sources their sourcemaps reference,
    // so source-map-loader can never resolve them. Harmless noise for any
    // package under node_modules, not specific to any one of them.
    {
      module: /node_modules/,
      message: /Failed to parse source map/,
    },
  ];

  return config;
};

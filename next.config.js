/** Minimal Next.js config to host the existing SPA client-side */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Allow loading images from external sources if needed
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
};

module.exports = nextConfig;

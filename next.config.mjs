/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable font optimization temporarily for Windows
  optimizeFonts: false,
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'logo.clearbit.com',
      },
    ],
  },
  
  // Webpack config for Windows compatibility
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  
  // Experimental features
  experimental: {
    // Helps with Windows path resolution
    serverComponentsExternalPackages: [],
  },
}

export default nextConfig
import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // Compiler optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Experimental features for performance
  experimental: {
    // Optimize package imports for tree-shaking
    optimizePackageImports: ['lucide-react', 'date-fns', 'recharts'],
  },

  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@meit/shared': path.resolve(__dirname, '../../packages/shared'),
      '@meit/supabase': path.resolve(__dirname, '../../packages/supabase'),
      '@meit/business-logic': path.resolve(__dirname, '../../packages/business-logic'),
      '@meit/ui-components': path.resolve(__dirname, '../../packages/ui-components'),
    };

    // Prevent duplicate React instances
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'react': path.resolve('./node_modules/react'),
        'react-dom': path.resolve('./node_modules/react-dom'),
        'zod': path.resolve('./node_modules/zod'),
      };
    }

    return config;
  },
};

export default nextConfig;

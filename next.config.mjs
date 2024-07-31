// next.config.mjs

const nextConfig = {
    webpack(config, options) {
      config.module.rules.push({
        test: /\.svg$/,
        issuer: { and: [/\.(js|ts)x?$/] }, // Process only JavaScript and TypeScript files
        use: ['@svgr/webpack'] // Use '@svgr/webpack' to transform SVGs into React components
      });
  
      return config;
    },
    images: {
      domains: ['firebasestorage.googleapis.com'],
    },
  };
  
  export default nextConfig;
  
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Enable React Strict Mode (recommended)
  swcMinify: true, // Enable SWC minification for performance
  experimental: {
    appDir: true, // Ensure support for the app router if you're using it
  },
};

export default nextConfig;

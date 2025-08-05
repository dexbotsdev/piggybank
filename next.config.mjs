/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cdn.simpleicons.org', 'localhost', 'piggybank.vercel.app'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // Route all /api requests to the NestJS backend during development
        destination: process.env.NODE_ENV === 'development' 
          ? 'http://localhost:4000/api/:path*'
          : 'http://localhost:4000/api/:path*', // Update this with your production backend URL later
      },
    ];
  },
};

module.exports = nextConfig;

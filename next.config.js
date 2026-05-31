/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'oodrhdemavsenriojhar.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Bypasses the flat-config ESLint compilation error during Vercel builds
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
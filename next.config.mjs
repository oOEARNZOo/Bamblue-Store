/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🚀 Performance Optimization
  reactStrictMode: true,
  
  // 📦 Compiler Options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // ⚡ Experimental Features for Better Performance
  experimental: {
    optimizeCss: true,
  },

  // 🖼️ Image Optimization Config
  images: {
    // รองรับ External Images จาก Supabase และ CDN อื่นๆ
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.in',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
    // รองรับ formats ที่ทันสมัย
    formats: ['image/avif', 'image/webp'],
    // ขนาดรูปที่ใช้บ่อย
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Minimize memory usage
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // 📦 Headers for Caching
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:all*(js|css)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

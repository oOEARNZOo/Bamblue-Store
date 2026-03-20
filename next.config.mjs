/** @type {import('next').NextConfig} */
const nextConfig = {
  // � Performance Optimization
  reactStrictMode: true,
  swcMinify: true,
  
  // 📦 Compiler Options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // �🖼️ Image Optimization Config
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
};

export default nextConfig;

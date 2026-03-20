export default function manifest() {
  return {
    name: 'Bamblue Store',
    short_name: 'Bamblue',
    description: 'YOUTH ELEVATED. SIMPLY STYLISH. ร้านเสื้อผ้าแฟชั่นเกาหลีสไตล์วัยรุ่น',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#dc6fd6',
    icons: [
      {
        src: '/Picture/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/Picture/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}

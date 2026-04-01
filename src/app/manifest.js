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
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}

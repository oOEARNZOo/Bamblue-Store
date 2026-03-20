export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/checkout/', '/profile/', '/orders/'],
      },
    ],
    sitemap: 'https://bamblue.store/sitemap.xml',
  };
}

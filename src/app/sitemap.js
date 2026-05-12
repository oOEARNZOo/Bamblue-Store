import { supabase } from '@/frontend/services/supabaseClient';

export default async function sitemap() {
  const baseUrl = 'https://bamblue.store';

  // ดึงสินค้าทั้งหมดจาก Supabase
  const { data: products } = await supabase
    .from('products1')
    .select('id, updated_at')
    .order('id', { ascending: true });

  // สร้าง sitemap สำหรับสินค้า
  const productUrls = products?.map((product) => ({
    url: `${baseUrl}/product/${product.id}`,
    lastModified: product.updated_at || new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: 0.8,
  })) || [];

  // หน้าหลักๆ ของเว็บ
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/reviews`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/promotions`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  return [...staticPages, ...productUrls];
}

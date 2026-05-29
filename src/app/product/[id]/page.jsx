import { createClient } from '@supabase/supabase-js';
import ProductDetailClient from './ProductDetailClient';

const PRODUCT_METADATA_COLUMNS = 'id, nameEN, nameTH, price, original_price, image, category, discount_percent';

const getProductForMetadata = async (productId) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || !productId) return null;

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const { data } = await supabase
    .from('products1')
    .select(PRODUCT_METADATA_COLUMNS)
    .eq('id', productId)
    .maybeSingle();

  return data || null;
};

export async function generateMetadata({ params }) {
  const product = await getProductForMetadata(params?.id);

  if (!product) {
    return {
      title: 'สินค้า | Bamblue Store',
      description: 'ดูรายละเอียดสินค้าแฟชั่นจาก Bamblue Store',
    };
  }

  const price = Number(product.price || 0).toLocaleString('th-TH');
  const title = `${product.nameEN || product.nameTH} | Bamblue Store`;
  const description = `${product.nameTH || product.category || 'สินค้าแฟชั่น'} ราคา ฿${price} จาก Bamblue Store`;
  const productUrl = `/product/${product.id}`;
  const imageUrl = product.image || '/Picture/og-image.png';

  return {
    title,
    description,
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: productUrl,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 1600,
          alt: product.nameEN || product.nameTH || 'Bamblue Store product',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default function ProductPage() {
  return <ProductDetailClient />;
}

import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/backend/supabase/server';

const ALLOWED_PAYMENT_METHODS = new Set(['qr', 'cod', 'credit']);

function getBearerToken(request) {
  const authHeader = request.headers.get('authorization') || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return null;
  }

  return token;
}

function normalizeCheckoutPayload(body) {
  const items = Array.isArray(body?.items) ? body.items : [];
  const customer = body?.customer || {};
  const paymentMethod = String(body?.paymentMethod || '').trim();

  return {
    items: items.map((item) => ({
      product_id: Number(item.productId ?? item.id),
      size: String(item.size || 'M').trim().toUpperCase(),
      quantity: Number(item.quantity),
    })),
    customer: {
      email: String(customer.email || '').trim().toLowerCase(),
      first_name: String(customer.firstName || customer.first_name || '').trim(),
      last_name: String(customer.lastName || customer.last_name || '').trim(),
      phone: String(customer.phone || '').trim(),
      shipping_address: String(customer.address || customer.shipping_address || '').trim(),
      shipping_province: String(customer.province || customer.shipping_province || '').trim(),
      shipping_zipcode: String(customer.zipcode || customer.shipping_zipcode || '').trim(),
    },
    paymentMethod,
  };
}

function validatePayload(payload) {
  if (!payload.items.length) return 'Cart is empty.';
  if (!ALLOWED_PAYMENT_METHODS.has(payload.paymentMethod)) return 'Invalid payment method.';

  for (const item of payload.items) {
    if (!Number.isInteger(item.product_id) || item.product_id <= 0) return 'Invalid product.';
    if (!Number.isInteger(item.quantity) || item.quantity <= 0 || item.quantity > 99) return 'Invalid quantity.';
    if (!['S', 'M', 'L', 'XL'].includes(item.size)) return 'Invalid size.';
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.customer.email)) return 'Invalid email.';
  if (payload.customer.first_name.length < 2) return 'First name is required.';
  if (!payload.customer.last_name) return 'Last name is required.';
  if (payload.customer.shipping_address.length < 10) return 'Shipping address is too short.';
  if (!payload.customer.shipping_province) return 'Shipping province is required.';
  if (!/^\d{5}$/.test(payload.customer.shipping_zipcode)) return 'Invalid zipcode.';
  if (!/^0\d{9}$/.test(payload.customer.phone)) return 'Invalid phone number.';

  return null;
}

export async function POST(request) {
  try {
    const accessToken = getBearerToken(request);

    if (!accessToken) {
      return NextResponse.json({ error: 'Please sign in before checkout.' }, { status: 401 });
    }

    const supabase = createSupabaseServerClient(accessToken);
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid or expired session.' }, { status: 401 });
    }

    const payload = normalizeCheckoutPayload(await request.json());
    const validationError = validatePayload(payload);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const { data, error } = await supabase.rpc('create_checkout_order', {
      p_items: payload.items,
      p_customer: payload.customer,
      p_payment_method: payload.paymentMethod,
    });

    if (error) {
      const status = error.message?.includes('stock') || error.message?.includes('Invalid')
        ? 400
        : 500;

      return NextResponse.json({ error: error.message }, { status });
    }

    return NextResponse.json({ order: data });
  } catch (error) {
    console.error('Checkout API error:', error);
    return NextResponse.json({ error: 'Unable to create order.' }, { status: 500 });
  }
}

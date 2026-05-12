import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/backend/supabase/server';

function getBearerToken(request) {
  const authHeader = request.headers.get('authorization') || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return null;
  }

  return token;
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function POST(request) {
  try {
    const accessToken = getBearerToken(request);

    if (!accessToken) {
      return NextResponse.json({ error: 'Please sign in before confirming payment.' }, { status: 401 });
    }

    const supabase = createSupabaseServerClient(accessToken);
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid or expired session.' }, { status: 401 });
    }

    const body = await request.json();
    const orderId = String(body?.orderId || '').trim();

    if (!isUuid(orderId)) {
      return NextResponse.json({ error: 'Invalid order.' }, { status: 400 });
    }

    const paymentData = body?.paymentData && typeof body.paymentData === 'object'
      ? body.paymentData
      : null;
    const mockMode = Boolean(paymentData?.mockMode ?? body?.mockMode);

    const { data, error } = await supabase.rpc('confirm_order_payment', {
      p_order_id: orderId,
      p_payment_details: paymentData,
      p_mock_mode: mockMode,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ order: data });
  } catch (error) {
    console.error('Confirm payment API error:', error);
    return NextResponse.json({ error: 'Unable to confirm payment.' }, { status: 500 });
  }
}

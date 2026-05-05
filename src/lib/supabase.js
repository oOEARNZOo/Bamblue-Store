import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const hasSupabaseEnv = Boolean(supabaseUrl && supabaseKey);

if (!hasSupabaseEnv) {
  const missingKeys = [
    !supabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL' : null,
    !supabaseKey ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY' : null,
  ].filter(Boolean);

  console.error(
    `[Supabase] Missing environment variable(s): ${missingKeys.join(', ')}. ` +
    'Add them in Vercel Project Settings > Environment Variables and redeploy.'
  );
}

export const isSupabaseConfigured = hasSupabaseEnv;
export const supabaseConfigError = hasSupabaseEnv
  ? null
  : 'Supabase environment variables are missing. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel, then redeploy.';

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'missing-supabase-anon-key',
  {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  }
);

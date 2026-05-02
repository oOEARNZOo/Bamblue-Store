import { supabase } from './supabase';

const ADMIN_EMAILS = new Set([
  'admin@bamblue.com',
  'earn.hcg32@gmail.com'
]);

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

export function isAllowedAdminEmail(email) {
  return ADMIN_EMAILS.has(normalizeEmail(email));
}

export async function checkIsAdmin(user) {
  if (!user) return false;

  try {
    if (isAllowedAdminEmail(user.email)) {
      return true;
    }

    if (user.app_metadata?.role === 'admin' || user.user_metadata?.role === 'admin') {
      return true;
    }

    const { data: adminRecord, error } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!error && adminRecord) {
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

let adminCache = new Map();

export async function checkIsAdminCached(user) {
  if (!user) {
    adminCache.clear();
    return false;
  }

  if (adminCache.has(user.id)) {
    const { isAdmin, timestamp } = adminCache.get(user.id);
    if (Date.now() - timestamp < 5 * 60 * 1000) {
      return isAdmin;
    }
  }

  const isAdmin = await checkIsAdmin(user);
  adminCache.set(user.id, { isAdmin, timestamp: Date.now() });

  return isAdmin;
}

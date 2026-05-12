import { supabase } from '@/frontend/services/supabaseClient';

export async function checkIsAdmin(user) {
  if (!user) return false;

  try {
    const appRole = user.app_metadata?.role;
    const appRoles = Array.isArray(user.app_metadata?.roles) ? user.app_metadata.roles : [];

    if (appRole === 'admin' || appRoles.includes('admin')) {
      return true;
    }

    const { data: adminRecord, error } = await supabase
      .from('admin_users')
      .select('id, is_admin, role')
      .eq('user_id', user.id)
      .eq('is_admin', true)
      .maybeSingle();

    if (error) {
      console.error('Error checking admin record:', error);
      return false;
    }

    if (adminRecord) {
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

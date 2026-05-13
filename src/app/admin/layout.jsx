"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/frontend/services/supabaseClient';
import { checkIsAdminCached } from '@/frontend/auth/adminCheck';
import AdminSidebar from '@/frontend/components/AdminSidebar';
import { Home } from 'lucide-react';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const isAdminUser = await checkIsAdminCached(user);

      if (!isAdminUser) {
        router.push('/');
        return;
      }

      setUser(user);
      setIsAdmin(true);
    } catch (error) {
      console.error('Admin check error:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/logout');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/logout');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen overflow-x-hidden bg-gray-50">
        <div className="hidden w-[224px] shrink-0 bg-white border-r lg:block">
          <div className="p-4 animate-pulse">
            <div className="h-10 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-2">
              {[1,2,3,4,5].map(i => <div key={i} className="h-10 bg-gray-200 rounded"></div>)}
            </div>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="p-6">
            <div className="h-10 bg-gray-200 rounded w-full mb-4 animate-pulse"></div>
            <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fbf8fb]">
      <AdminSidebar 
        user={user} 
        onLogout={handleLogout}
      />
      <div className="min-h-screen w-full min-w-0 max-w-full lg:pl-[224px]">
        <div className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => router.push('/admin')}
            className="flex items-center gap-2 text-left"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-pink-200 bg-white text-sm font-black text-[#dc6fd6] shadow-sm">
              B
            </span>
            <span>
              <span className="block text-sm font-black text-slate-950">Bamblue Store</span>
              <span className="block text-xs font-medium text-slate-400">Admin Panel</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="flex items-center gap-2 rounded-xl bg-pink-50 px-3 py-2 text-sm font-bold text-[#dc6fd6] transition-colors hover:bg-pink-100"
          >
            <Home size={17} strokeWidth={1.9} />
            <span>หน้าร้าน</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

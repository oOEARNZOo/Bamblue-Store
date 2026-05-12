"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/frontend/services/supabaseClient';
import { checkIsAdminCached } from '@/frontend/auth/adminCheck';
import AdminSidebar from '@/frontend/components/AdminSidebar';

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
      <div className="flex min-h-screen bg-gray-50">
        <div className="w-64 bg-white border-r">
          <div className="p-6 animate-pulse">
            <div className="h-10 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-2">
              {[1,2,3,4,5].map(i => <div key={i} className="h-10 bg-gray-200 rounded"></div>)}
            </div>
          </div>
        </div>
        <div className="flex-1">
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
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar 
        user={user} 
        onLogout={handleLogout}
      />
      <div className="flex-1 ml-64">
        {children}
      </div>
    </div>
  );
}

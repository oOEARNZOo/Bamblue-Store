"use client";
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Star,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function AdminSidebar({ user, onLogout }) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Package, label: 'Products', path: '/admin/products' },
    { icon: ShoppingBag, label: 'Orders', path: '/admin/orders' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: Star, label: 'Reviews', path: '/admin/reviews' },
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return pathname === '/admin';
    }
    return pathname?.startsWith(path);
  };

  return (
    <aside className={`${collapsed ? 'w-20' : 'w-64'} bg-white border-r border-gray-200 min-h-screen flex flex-col transition-all duration-300 fixed left-0 top-0 z-40`}>
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#dc6fd6] to-[#c05ca8] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <div>
              <h2 className="font-bold text-gray-900">BAMBLUE</h2>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-10 h-10 bg-gradient-to-br from-[#dc6fd6] to-[#c05ca8] rounded-lg flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-lg">B</span>
          </div>
        )}
      </div>

      {/* Menu Items */}
      <nav className="flex-1 py-6 px-3">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  active
                    ? 'bg-gradient-to-r from-[#dc6fd6] to-[#c05ca8] text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.label : ''}
              >
                <Icon size={20} />
                {!collapsed && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </div>
      </nav>

      {/* User Section */}
      <div className="border-t border-gray-200 p-4">
        {!collapsed ? (
          <div className="mb-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.user_metadata?.first_name?.[0] || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.user_metadata?.first_name || 'Admin'}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center p-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        )}
        
        {/* Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full mt-2 flex items-center justify-center p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
    </aside>
  );
}

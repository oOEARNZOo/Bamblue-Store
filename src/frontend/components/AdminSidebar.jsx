"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  LayoutDashboard,
  LogOut,
  Package,
  ShoppingBag,
  Star,
  Users,
} from "lucide-react";

const MENU_ITEMS = [
  { icon: LayoutDashboard, label: "ภาพรวม", path: "/admin" },
  { icon: ShoppingBag, label: "คำสั่งซื้อ", path: "/admin/orders" },
  { icon: Package, label: "สินค้า", path: "/admin/products" },
  { icon: Star, label: "รีวิวสินค้า", path: "/admin/reviews" },
  { icon: Users, label: "ลูกค้า", path: "/admin/users" },
];

export default function AdminSidebar({ user, onLogout }) {
  const router = useRouter();
  const pathname = usePathname();
  const displayName =
    user?.user_metadata?.first_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Admin";

  const isActive = (path) => {
    if (path === "/admin") return pathname === "/admin";
    return pathname?.startsWith(path);
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden h-screen w-[224px] flex-col overflow-hidden border-r border-slate-100 bg-white/95 px-2.5 py-4 shadow-[8px_0_30px_rgba(15,23,42,0.035)] backdrop-blur lg:flex">
      <button
        type="button"
        onClick={() => router.push("/admin")}
        className="mb-5 flex shrink-0 items-center gap-2.5 rounded-xl px-2 py-2 text-left"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-pink-200 bg-white text-[#dc6fd6] shadow-sm">
          <span className="text-lg font-black">B</span>
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-slate-950">Bamblue Store</p>
          <p className="text-xs font-medium text-slate-400">Admin Panel</p>
        </div>
      </button>

      <button
        type="button"
        onClick={() => router.push("/")}
        className="mb-4 flex w-full shrink-0 items-center gap-2.5 rounded-xl border border-pink-100 bg-pink-50/70 px-3 py-2.5 text-left text-sm font-bold text-[#dc6fd6] transition-colors hover:border-pink-200 hover:bg-pink-100"
      >
        <Home size={18} strokeWidth={1.8} />
        <span className="truncate">กลับหน้าร้าน</span>
      </button>

      <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto pr-1">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.path}
              type="button"
              onClick={() => router.push(item.path)}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition-colors ${
                active
                  ? "bg-pink-50 text-[#dc6fd6]"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
              }`}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-3 shrink-0 border-t border-slate-100 pt-3">
        <div className="rounded-xl border border-slate-100 bg-white p-2.5 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-200 to-fuchsia-300 text-xs font-black text-white">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-slate-900">{displayName}</p>
              <p className="truncate text-xs font-medium text-[#dc6fd6]">ผู้ดูแลระบบ</p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 px-3 py-2.5 text-sm font-black text-slate-700 transition-colors hover:bg-rose-50 hover:text-rose-600"
        >
          <LogOut size={18} />
          ออกจากระบบ
        </button>
      </div>
    </aside>
  );
}

'use client';

import { useAuth } from '@/lib/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import {
  SquaresFourIcon,
  UsersIcon,
  StorefrontIcon,
  PackageIcon,
  GearIcon,
  ShieldCheckIcon,
  SignOutIcon,
  ListIcon,
  XIcon,
} from '@phosphor-icons/react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: SquaresFourIcon },
  { href: '/admin/mitra-verification', label: 'Verifikasi Mitra', icon: ShieldCheckIcon },
  { href: '/admin/users', label: 'Pengguna', icon: UsersIcon },
  { href: '/admin/products', label: 'Produk', icon: PackageIcon },
  { href: '/admin/settings', label: 'Pengaturan', icon: GearIcon },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#e4dcca]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#11676a]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e4dcca] flex">
      {/* Menu button: open sidebar, visible only when closed on mobile */}
      {!sidebarOpen && (
        <button
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow"
          onClick={() => setSidebarOpen(true)}
          aria-label="Buka sidebar"
        >
          <ListIcon size={20} />
        </button>
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#11676a] text-white transform transition-transform duration-200 lg:translate-x-0 lg:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">LastBite Admin</h1>
            <button
              className="lg:hidden p-1 -mr-1 rounded hover:bg-white/10 transition-colors"
              onClick={() => setSidebarOpen(false)}
              aria-label="Tutup sidebar"
            >
              <XIcon size={20} />
            </button>
          </div>
          <p className="text-sm text-white/70 mt-1">{user?.name}</p>
        </div>
        <nav className="px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'bg-white/20 font-medium'
                    : 'hover:bg-white/10'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button
            onClick={() => { logout(); router.push('/login'); }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white/80 hover:text-white transition-colors"
          >
            <SignOutIcon size={18} />
            Keluar
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}

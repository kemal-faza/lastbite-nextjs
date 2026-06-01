'use client';

import { Home, Search, ShoppingBag, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { id: 'home', path: '/', label: 'Beranda', icon: Home },
  { id: 'search', path: '/search', label: 'Cari', icon: Search },
  { id: 'cart', path: '/cart', label: 'Keranjang', icon: ShoppingBag },
  { id: 'profile', path: '/profile', label: 'Profil', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 px-2 py-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 pb-[env(safe-area-inset-bottom,0px)]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.path === '/' ? pathname === '/' : pathname.startsWith(item.path);

          return (
            <Link
              key={item.id}
              href={item.path}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-1 ${
                isActive ? 'text-[var(--primary)]' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'fill-[var(--primary)]/20' : ''}`} />
              <span className="text-[10px] font-medium truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

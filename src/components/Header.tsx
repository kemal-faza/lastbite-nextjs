'use client';

import { MapPinIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { NotificationBell } from '@/components/NotificationBell';
import { NotificationCenter } from '@/components/NotificationCenter';

export function Header() {
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <>
      <header className="bg-[var(--primary)] text-white px-4 py-4 shadow-md sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-0">
              <span className="text-2xl font-bold tracking-tight text-white">LAST</span>
              <span className="text-2xl font-bold tracking-tight text-[var(--secondary)]">BITE</span>
            </div>
            <div className="flex items-center gap-1 text-white/70 text-sm mt-1">
              <MapPinIcon className="w-3 h-3" />
              <span>Semarang, Indonesia</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell onClick={() => setNotifOpen(true)} />
            <div className="bg-white/20 px-4 py-1.5 rounded-2xl border border-white/10">
              <p className="text-xs">Hemat hingga</p>
              <p className="font-bold">70%</p>
            </div>
          </div>
        </div>
      </header>
      <NotificationCenter open={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  );
}

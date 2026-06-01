import type { ReactNode } from 'react';
import { BottomNav } from '@/components/BottomNav';

export default function MainRouteLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="size-full flex flex-col bg-[var(--background)] overflow-hidden relative max-w-md mx-auto min-h-[100dvh] shadow-xl">
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}

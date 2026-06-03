'use client';

import { ThemeProvider } from 'next-themes';
import { CartProvider } from '@/lib/context/CartContext';
import { WishlistProvider } from '@/lib/context/WishlistContext';
import { OrderProvider } from '@/lib/context/OrderContext';
import { AuthProvider } from '@/lib/context/AuthContext';
import { GoogleMapsProvider } from '@/components/GoogleMapsProvider';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" disableTransitionOnChange>
        <CartProvider>
          <WishlistProvider>
            <OrderProvider>
              <GoogleMapsProvider>
                {children}
              </GoogleMapsProvider>
            </OrderProvider>
          </WishlistProvider>
        </CartProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

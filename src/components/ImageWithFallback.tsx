'use client';

import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { getImageUrl } from '@/lib/api/products';

interface ImageWithFallbackProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  containerClassName?: string;
}

export function ImageWithFallback({ src, alt, className = '', containerClassName = '' }: ImageWithFallbackProps) {
  const displaySrc = getImageUrl(src ?? null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (!displaySrc || hasError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${containerClassName || className}`}>
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-gray-400" />
          </div>
          <span className="text-xs text-gray-400 text-center px-2 line-clamp-2">{alt}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${containerClassName || className}`}>
      {isLoading && (
        <div className={`absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse ${className}`}>
          <div className="w-8 h-8 bg-gray-200 rounded-full" />
        </div>
      )}
      <img
        src={displaySrc ?? undefined}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={() => setIsLoading(false)}
        onError={() => { setIsLoading(false); setHasError(true); }}
        loading="lazy"
      />
    </div>
  );
}

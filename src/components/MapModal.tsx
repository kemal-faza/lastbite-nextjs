'use client';

import { MapPinIcon, NavigationArrowIcon } from '@phosphor-icons/react';
import { Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';
import { useEffect, useState } from 'react';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeName: string;
  address?: string;
  storeLat?: number | null;
  storeLng?: number | null;
}

function UserLocationMarker() {
  const map = useMap();
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserPos(coords);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 300000 }
    );
  }, [map]);

  if (!userPos) return null;
  return (
    <AdvancedMarker position={userPos}>
      <div className="relative">
        <div className="w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-lg" />
        <div className="absolute inset-0 w-5 h-5 bg-blue-500 rounded-full animate-ping opacity-30" />
      </div>
    </AdvancedMarker>
  );
}

function getDirectionsUrl(lat: number, lng: number, label: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_name=${encodeURIComponent(label)}`;
}

const DEFAULT_CENTER = { lat: -6.2088, lng: 106.8456 };

export function MapModal({
  isOpen,
  onClose,
  storeName,
  address,
  storeLat,
  storeLng,
}: MapModalProps) {
  const hasCoordinates = storeLat != null && storeLng != null;
  const center = hasCoordinates
    ? { lat: storeLat as number, lng: storeLng as number }
    : DEFAULT_CENTER;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="bottom"
        className="h-[85vh] rounded-t-xl max-w-md mx-auto"
      >
        <SheetHeader>
          <SheetTitle>Lokasi {storeName}</SheetTitle>
        </SheetHeader>

        <div className="p-4">
          <div className="w-full h-64 rounded-2xl overflow-hidden mb-4 border border-gray-200">
            {hasCoordinates ? (
              <Map
                defaultCenter={center}
                defaultZoom={15}
                mapId="DEMO_MAP_ID"
                gestureHandling="greedy"
                disableDefaultUI
                className="w-full h-full"
              >
                <AdvancedMarker position={center}>
                  <div className="relative">
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[var(--primary)] text-white px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap shadow-lg">
                      {storeName}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[var(--primary)]" />
                    </div>
                    <Pin background="#11676a" glyphColor="#ffffff" borderColor="#0d5254" />
                  </div>
                </AdvancedMarker>
                <UserLocationMarker />
              </Map>
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <MapPinIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Lokasi belum diatur oleh Mitra</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-gray-100 p-2.5 rounded-xl">
                <MapPinIcon className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {address || storeName}
                </p>
              </div>
            </div>

            {hasCoordinates && (
              <a
                href={getDirectionsUrl(storeLat!, storeLng!, storeName)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[var(--primary)] text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[var(--primary)]/20 active:scale-[0.98] transition-all no-underline"
              >
                <NavigationArrowIcon className="w-5 h-5" />
                Buka Petunjuk Arah
              </a>
            )}
          </div>
        </div>
        <div className="h-8" />
      </SheetContent>
    </Sheet>
  );
}

import { X, MapPin, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeName: string;
  address?: string;
}

export function MapModal({ isOpen, onClose, storeName, address = "Semarang, Jawa Tengah" }: MapModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-[32px] z-[70] overflow-hidden shadow-2xl"
          >
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Lokasi {storeName}</h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-4">
              {/* Mock Map Image */}
              <div className="w-full h-64 bg-gray-100 rounded-2xl relative overflow-hidden mb-4 border border-gray-100">
                <img 
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=600&fit=crop" 
                  alt="Map Placeholder"
                  className="w-full h-full object-cover opacity-50 grayscale"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[var(--primary)] text-white px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap shadow-lg">
                      {storeName}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[var(--primary)]" />
                    </div>
                    <div className="w-4 h-4 bg-[var(--primary)] rounded-full ring-4 ring-white shadow-lg animate-pulse" />
                  </div>
                </div>
                
                {/* User Location */}
                <div className="absolute bottom-10 right-10">
                   <div className="w-4 h-4 bg-blue-500 rounded-full ring-4 ring-white shadow-lg" />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-gray-100 p-2.5 rounded-xl">
                    <MapPin className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{address}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Sekitar 120m dari lokasimu saat ini</p>
                  </div>
                </div>
                
                <button className="w-full bg-[var(--primary)] text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[var(--primary)]/20 active:scale-[0.98] transition-all">
                  <Navigation className="w-5 h-5" />
                  Buka Petunjuk Arah
                </button>
              </div>
            </div>
            <div className="h-8" /> {/* Safe area spacer */}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

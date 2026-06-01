import { X, SlidersHorizontal, MapPin, Wallet, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

export interface FilterValues {
  maxDistance: number;
  maxPrice: number;
  maxExpiry: string;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterValues;
  onApplyFilters: (filters: FilterValues) => void;
}

export function FilterModal({ isOpen, onClose, filters, onApplyFilters }: FilterModalProps) {
  const [priceRange, setPriceRange] = useState([0, filters.maxPrice]);
  const [distance, setDistance] = useState(filters.maxDistance); // km
  const [expiry, setExpiry] = useState(filters.maxExpiry);

  const handleApply = () => {
    onApplyFilters({
      maxDistance: distance,
      maxPrice: priceRange[1],
      maxExpiry: expiry,
    });
    onClose();
  };

  const handleReset = () => {
    setDistance(10);
    setPriceRange([0, 100000]);
    setExpiry('Hari Ini');
    onApplyFilters({
      maxDistance: 10,
      maxPrice: 100000,
      maxExpiry: 'Hari Ini',
    });
  };

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
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[var(--primary)]" />
                <h3 className="font-bold text-gray-900">Filter Pencarian</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-8">
              {/* Distance Filter */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    Jarak Maksimal
                  </h4>
                  <span className="text-[var(--primary)] font-bold">
                    {distance === 10 ? 'Semua Jarak' : `${distance} km`}
                  </span>
                </div>
                <input 
                  type="range" 
                  min="0.5" 
                  max="10" 
                  step="0.5"
                  value={distance}
                  onChange={(e) => setDistance(parseFloat(e.target.value))}
                  className="w-full accent-[var(--primary)] h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                  <span>500m</span>
                  <span>5km</span>
                  <span>Semua</span>
                </div>
              </div>
              
              {/* Price Filter */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-gray-900 flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-gray-400" />
                    Harga Maksimal
                  </h4>
                  <span className="text-[var(--primary)] font-bold">
                    {priceRange[1] === 100000 ? 'Semua Harga' : `Rp ${priceRange[1].toLocaleString('id-ID')}`}
                  </span>
                </div>
                <input 
                  type="range" 
                  min="5000" 
                  max="100000" 
                  step="5000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                  className="w-full accent-[var(--primary)] h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                  <span>Rp 5rb</span>
                  <span>Rp 50rb</span>
                  <span>Semua</span>
                </div>
              </div>
              
              {/* Expiry Filter */}
              <div className="space-y-3">
                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                  <Timer className="w-4 h-4 text-gray-400" />
                  Waktu Kedaluwarsa
                </h4>
                <div className="flex flex-wrap gap-2">
                  {['< 1 Jam', '< 3 Jam', '< 6 Jam', 'Hari Ini'].map((tag) => {
                    const isSelected = expiry === tag;
                    return (
                      <button 
                        key={tag}
                        onClick={() => setExpiry(tag)}
                        className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
                          isSelected
                            ? 'bg-[var(--primary)] border-[var(--primary)] text-white shadow-sm'
                            : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-[var(--primary)]/30 hover:text-[var(--primary)]'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border-t border-gray-100">
               <div className="flex gap-3">
                 <button 
                  onClick={handleReset}
                  className="flex-1 py-3.5 text-sm font-bold text-gray-500 hover:text-gray-700"
                 >
                   Reset
                 </button>
                 <button 
                  onClick={handleApply}
                  className="flex-[2] bg-[var(--primary)] text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-[var(--primary)]/20 active:scale-[0.98] transition-all"
                 >
                   Terapkan Filter
                 </button>
               </div>
            </div>
            <div className="h-8 bg-gray-50" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

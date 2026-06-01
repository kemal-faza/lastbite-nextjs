import { ArrowUpDown, DollarSign, MapPin, Clock, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { FilterModal } from './FilterModal';
import type { FilterValues } from './FilterModal';

export type SortOption = 'default' | 'price-asc' | 'price-desc' | 'distance-asc' | 'remaining-asc';

interface FilterBarProps {
  activeSort: SortOption;
  onSortChange: (option: SortOption) => void;
  filters: FilterValues;
  onFiltersChange: (filters: FilterValues) => void;
}

const sortOptions: { value: SortOption; label: string; icon: typeof DollarSign }[] = [
  { value: 'price-asc', label: 'Termurah', icon: DollarSign },
  { value: 'price-desc', label: 'Termahal', icon: DollarSign },
  { value: 'distance-asc', label: 'Terdekat', icon: MapPin },
  { value: 'remaining-asc', label: 'Segera Habis', icon: Clock },
];

export function FilterBar({ activeSort, onSortChange, filters, onFiltersChange }: FilterBarProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-xs font-medium text-gray-500">Urutkan</span>
        </div>
        <button 
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1 bg-[var(--primary)]/5 text-[var(--primary)] rounded-lg text-xs font-bold border border-[var(--primary)]/10 hover:bg-[var(--primary)]/10 transition-colors"
        >
          <SlidersHorizontal className="w-3 h-3" />
          Filter
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => onSortChange('default')}
          className={
            'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex-shrink-0 ' +
            (activeSort === 'default'
              ? 'bg-[var(--primary)] border-[var(--primary)] text-white'
              : 'bg-white border-gray-200 text-gray-600 hover:border-[var(--primary)]/30')
          }
        >
          Default
        </button>
        {sortOptions.map((option) => {
          const Icon = option.icon;
          const isActive = activeSort === option.value;
          return (
            <button
              key={option.value}
              onClick={() => onSortChange(option.value)}
              className={
                'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1 flex-shrink-0 ' +
                (isActive
                  ? 'bg-[var(--primary)] border-[var(--primary)] text-white'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-[var(--primary)]/30')
              }
            >
              <Icon className={'w-3 h-3 ' + (isActive ? 'text-white' : 'text-gray-400')} />
              {option.label}
            </button>
          );
        })}
      </div>
      
      <FilterModal 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)} 
        filters={filters}
        onApplyFilters={onFiltersChange}
      />
    </div>
  );
}

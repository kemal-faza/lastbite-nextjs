import { Package, Soup, Croissant, Coffee } from 'lucide-react';


const categories = [
  { id: 'all', label: 'Semua', icon: Package },
  { id: 'meals', label: 'Makanan', icon: Soup },
  { id: 'bakery', label: 'Roti', icon: Croissant },
  { id: 'drinks', label: 'Minuman', icon: Coffee },
];

interface CategoryFilterProps {
  selected: string;
  onSelect: (category: string) => void;
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => {
        const isSelected = selected === category.id;

        return (
          <button
            key={category.id}
            onClick={() => onSelect(category.id)}
            className={`px-4 py-3 rounded-xl border-2 transition-all flex-shrink-0 flex flex-col items-center gap-1 ${
              isSelected
                ? 'bg-[var(--primary)] border-[var(--primary)] text-white'
                : 'bg-white border-gray-200 text-gray-700 hover:border-[var(--primary)]/30'
            }`}
          >
            <category.icon className="w-4 h-4" />
            <span className="text-xs whitespace-nowrap font-medium">{category.label}</span>
          </button>
        );
      })}
    </div>
  );
}

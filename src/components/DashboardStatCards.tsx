import type { MitraStats } from '@/lib/api/mitra';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PackageIcon, ShoppingBagIcon, CubeIcon, StorefrontIcon } from '@phosphor-icons/react';

interface StatCardConfig {
  key: keyof MitraStats;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  bg: string;
  href?: string;
}

interface Props {
  stats: MitraStats;
  onCardClick?: (key: keyof MitraStats) => void;
}

const statCards: StatCardConfig[] = [
  {
    key: 'totalStock',
    label: 'Stok Produk',
    icon: PackageIcon,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    key: 'totalSold',
    label: 'Terjual',
    icon: ShoppingBagIcon,
    color: 'text-[#dda63a]',
    bg: 'bg-amber-50',
  },
  {
    key: 'remaining',
    label: 'Sisa Stok',
    icon: CubeIcon,
    color: 'text-[var(--destructive)]',
    bg: 'bg-red-50',
  },
  {
    key: 'productCount',
    label: 'Jumlah Produk',
    icon: StorefrontIcon,
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
];

export default function DashboardStatCards({ stats, onCardClick }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {statCards.map((card) => {
        const value = stats[card.key];
        return (
          <button
            key={card.key}
            type="button"
            onClick={() => onCardClick?.(card.key)}
            className="text-left block w-full cursor-pointer hover:opacity-80 transition-opacity"
            disabled={!onCardClick}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {card.label}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bg}`}>
                  <card.icon size={16} className={card.color} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{value}</div>
              </CardContent>
            </Card>
          </button>
        );
      })}
    </div>
  );
}

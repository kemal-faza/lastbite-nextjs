import type { MitraStats } from '@/lib/api/mitra';

interface Props {
  stats: MitraStats;
}

export default function DashboardStatCards({ stats }: Props) {
  const cards = [
    { label: 'Stok Produk', value: stats.totalStock, color: 'text-[var(--primary)]' },
    { label: 'Terjual', value: stats.totalSold, color: 'text-[var(--secondary)]' },
    { label: 'Sisa', value: stats.remaining, color: 'text-[var(--destructive)]' },
  ];

  return (
    <div className="flex gap-3">
      {cards.map((card) => (
        <div key={card.label} className="flex-1 bg-white rounded-2xl shadow-sm px-4 py-5 text-center">
          <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
          <p className="text-xs text-gray-500 mt-1">{card.label}</p>
        </div>
      ))}
    </div>
  );
}

import type { MitraStats } from '@/lib/api/mitra';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium">
              {card.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

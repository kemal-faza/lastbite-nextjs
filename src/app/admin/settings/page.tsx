'use client';

import { useEffect, useState } from 'react';
import { getPlatformConfig, updatePlatformConfig, type PlatformConfig } from '@/lib/api/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { FloppyDiskIcon } from '@phosphor-icons/react';

export default function SettingsPage() {
  const [config, setConfig] = useState<PlatformConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getPlatformConfig()
      .then(setConfig)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const updated = await updatePlatformConfig(config);
      setConfig(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Memuat pengaturan...</div>;
  }

  if (!config) {
    return <div className="text-center py-8 text-red-500">Gagal memuat pengaturan</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Pengaturan Platform</h2>

      <div className="space-y-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Komisi & Biaya</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Rate Komisi (%)</Label>
              <Input
                type="number"
                value={config.commissionRate}
                onChange={(e) => setConfig({ ...config, commissionRate: Number(e.target.value) })}
                min={0}
                max={100}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pengambilan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Maksimal Jam Pickup</Label>
              <Input
                type="number"
                value={config.maxPickupHours}
                onChange={(e) => setConfig({ ...config, maxPickupHours: Number(e.target.value) })}
                min={1}
                max={24}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kategori Produk</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              value={config.categories.join(', ')}
              onChange={(e) =>
                setConfig({
                  ...config,
                  categories: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                })
              }
              placeholder="meals, bakery, drinks, snacks"
            />
            <p className="text-xs text-gray-500 mt-1">Pisahkan dengan koma</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature Flags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(config.featureFlags).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <Label className="cursor-pointer">{key}</Label>
                <Switch
                  checked={value}
                  onCheckedChange={(checked) =>
                    setConfig({
                      ...config,
                      featureFlags: { ...config.featureFlags, [key]: checked },
                    })
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kontak & Legal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Telepon Support</Label>
              <Input
                value={config.supportPhone}
                onChange={(e) => setConfig({ ...config, supportPhone: e.target.value })}
              />
            </div>
            <div>
              <Label>URL Syarat & Ketentuan</Label>
              <Input
                value={config.termsUrl}
                onChange={(e) => setConfig({ ...config, termsUrl: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={saving} className="bg-[#11676a] hover:bg-[#0d5456]">
          <FloppyDiskIcon size={16} className="mr-2" />
          {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </Button>
      </div>
    </div>
  );
}

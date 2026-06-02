'use client';

import { useEffect, useState } from 'react';
import { getMitraVerifications, verifyMitra, type MitraVerificationItem } from '@/lib/api/admin';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Menunggu',
  VERIFIED: 'Terverifikasi',
  REJECTED: 'Ditolak',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  VERIFIED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
};

export default function MitraVerificationPage() {
  const [profiles, setProfiles] = useState<MitraVerificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'PENDING' | 'VERIFIED' | 'REJECTED'>('PENDING');

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getMitraVerifications({ status: filter, limit: 50 });
      setProfiles(data.profiles);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  const handleVerify = async (profileId: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      await verifyMitra(profileId, status);
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Verifikasi Mitra</h2>

      <div className="flex gap-2 mb-4">
        {(['PENDING', 'VERIFIED', 'REJECTED'] as const).map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(status)}
          >
            {STATUS_LABELS[status]}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Memuat data...</div>
      ) : profiles.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8 text-gray-500">
            Tidak ada mitra dengan status {STATUS_LABELS[filter]}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {profiles.map((profile) => (
            <Card key={profile.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{profile.storeName}</CardTitle>
                    <p className="text-sm text-gray-500">{profile.user.email}</p>
                  </div>
                  <Badge className={STATUS_COLORS[profile.verificationStatus]}>
                    {STATUS_LABELS[profile.verificationStatus]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Pemilik: </span>
                    <span>{profile.user.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Telepon: </span>
                    <span>{profile.user.phone || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Alamat: </span>
                    <span>{profile.storeAddress || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Deskripsi: </span>
                    <span className="line-clamp-2">{profile.storeDescription || '-'}</span>
                  </div>
                </div>

                {profile.verificationStatus === 'PENDING' && (
                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleVerify(profile.id, 'VERIFIED')}
                    >
                      <CheckCircle size={16} className="mr-1" />
                      Setujui
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleVerify(profile.id, 'REJECTED')}
                    >
                      <XCircle size={16} className="mr-1" />
                      Tolak
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

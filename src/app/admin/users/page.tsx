'use client';

import { useEffect, useState, useCallback } from 'react';
import { getUsers, type AdminUser } from '@/lib/api/admin';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Search } from 'lucide-react';

const ROLE_LABELS: Record<string, string> = {
  FOOD_SAVER: 'Food Saver',
  MITRA: 'Mitra',
  ADMIN: 'Admin',
};

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUsers({
        role: roleFilter || undefined,
        search: search || undefined,
        limit: 50,
      });
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Manajemen Pengguna</h2>

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Cari email atau nama..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm"
        >
          <option value="">Semua Role</option>
          <option value="FOOD_SAVER">Food Saver</option>
          <option value="MITRA">Mitra</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Memuat data...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Terdaftar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{ROLE_LABELS[user.role] || user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    {user.isVerified ? (
                      <Badge className="bg-green-100 text-green-800">Verified</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800">Unverified</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm">
                    {new Date(user.createdAt).toLocaleDateString('id-ID')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import {
  UserIcon,
  GearIcon,
  ClockIcon,
  HeartIcon,
  MedalIcon,
  CaretRightIcon,
  SignOutIcon,
  ShieldIcon,
  QuestionIcon,
  StorefrontIcon,
  PencilIcon,
  CheckIcon,
  XIcon,
} from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const MENU_ITEMS = [
  { icon: ClockIcon, label: 'Riwayat Pesanan', path: '/orders' },
  { icon: HeartIcon, label: 'Menu Favorit', path: '/wishlist' },
  { icon: StorefrontIcon, label: 'Dashboard Mitra', path: '/seller' },
  { icon: ShieldIcon, label: 'Keamanan Akun', path: '#' },
  { icon: GearIcon, label: 'Pengaturan', path: '#' },
  { icon: QuestionIcon, label: 'Pusat Bantuan', path: '#' },
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, logout, updateProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState('');

  const handleStartEdit = () => {
    if (!user) return;
    setEditName(user.name);
    setEditPhone(user.phone || '');
    setIsEditing(true);
    setEditError('');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditError('');
  };

  const handleSave = async () => {
    if (!editName.trim()) {
      setEditError('Nama tidak boleh kosong');
      return;
    }

    setIsSaving(true);
    setEditError('');

    const result = await updateProfile({
      name: editName.trim(),
      phone: editPhone.trim() || undefined,
    });

    if (result.success) {
      setIsEditing(false);
    } else {
      setEditError(result.error || 'Gagal menyimpan');
    }

    setIsSaving(false);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6">
        <UserIcon className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Belum Masuk</h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Masuk untuk melihat profil, riwayat pesanan, dan mengelola akun Anda
        </p>
        <button
          onClick={() => router.push('/login')}
          className="px-6 py-3 bg-[var(--primary)] text-white font-medium rounded-xl hover:bg-[#0d5558] transition-colors"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          Masuk
        </button>
        <button
          onClick={() => router.push('/register')}
          className="mt-3 text-sm text-[var(--primary)] font-medium"
        >
          Belum punya akun? Daftar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-[var(--background)] pb-20 h-full">
      {/* Profile Header */}
      <div className="bg-white px-4 pt-8 pb-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center border-4 border-white shadow-sm overflow-hidden">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=11676a&color=fff&size=200`}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
              <MedalIcon className="w-3 h-3 text-white" />
            </div>
          </div>
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-2">
                <div>
                  <Label htmlFor="editName" className="text-xs">Nama</Label>
                  <Input
                    id="editName"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="editPhone" className="text-xs">Telepon</Label>
                  <Input
                    id="editPhone"
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="08123456789"
                    className="h-9 text-sm"
                  />
                </div>
                {editError && (
                  <p className="text-xs text-[var(--destructive)]">{editError}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[var(--primary)] text-white text-xs font-medium rounded-lg hover:bg-[#0d5558] disabled:opacity-50"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    <CheckIcon className="w-3.5 h-3.5" />
                    {isSaving ? 'Menyimpan...' : 'Simpan'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-200"
                  >
                    <XIcon className="w-3.5 h-3.5" />
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
                  <button
                    onClick={handleStartEdit}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <PencilIcon className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-2">{user.email}</p>
                {user.phone && (
                  <p className="text-xs text-gray-400 mb-2">{user.phone}</p>
                )}
                <div className="inline-flex items-center gap-1.5 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span className="text-xs font-medium text-green-700">
                    Food Saver
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Impact Stats */}
      <div className="px-4 mt-4 mb-2">
        <h2 className="text-sm font-semibold text-gray-700 mb-3 px-1">
          Dampak Kamu Sejauh Ini
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center mb-2">
              <span className="text-green-600 font-bold text-lg">Rp</span>
            </div>
            <span className="text-xl font-bold text-gray-900 leading-none mb-1">
              0
            </span>
            <span className="text-xs text-gray-500">Uang Dihemat</span>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center mb-2">
              <span className="text-green-600 font-bold text-lg">0</span>
            </div>
            <span className="text-xl font-bold text-gray-900 leading-none mb-1">
              0
            </span>
            <span className="text-xs text-gray-500">Makanan Diselamatkan</span>
          </div>
        </div>
      </div>

      {/* Menu List */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100 overflow-hidden">
          {MENU_ITEMS.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={() => item.path !== '#' && router.push(item.path)}
                className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors"
              >
                <Icon className="w-5 h-5 text-gray-500" />
                <span className="flex-1 text-sm font-medium text-gray-700 text-left">
                  {item.label}
                </span>
                <CaretRightIcon className="w-4 h-4 text-gray-300" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Logout */}
      <div className="px-4 mt-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl border border-red-100 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors"
        >
          <SignOutIcon className="w-4 h-4" />
          Keluar
        </button>
      </div>
    </div>
  );
}

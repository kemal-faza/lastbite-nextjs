'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import MitraRegistrationForm from '@/components/MitraRegistrationForm';

export default function MitraRegisterPage() {
  const router = useRouter();

  return (
    <div className="size-full flex flex-col bg-[var(--background)] overflow-hidden relative max-w-md mx-auto min-h-[100dvh] shadow-xl">
      <header className="bg-[var(--primary)] text-white px-4 py-4 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1 -ml-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">Daftar Mitra</h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-8">
        <MitraRegistrationForm />
      </div>
    </div>
  );
}

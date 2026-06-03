'use client';

import { useState } from 'react';
import { DownloadIcon, SpinnerIcon } from '@phosphor-icons/react';
import { getExportCsvUrl } from '@/lib/api/analytics';

interface Props {
  from: string;
  to: string;
  disabled?: boolean;
}

export default function CsvExportButton({ from, to, disabled }: Props) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const url = getExportCsvUrl(from, to);
      const response = await fetch(url);
      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `lastbite-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('CSV export failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={disabled || loading}
      className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {loading ? (
        <SpinnerIcon className="w-4 h-4 animate-spin" />
      ) : (
        <DownloadIcon className="w-4 h-4" />
      )}
      Ekspor CSV
    </button>
  );
}

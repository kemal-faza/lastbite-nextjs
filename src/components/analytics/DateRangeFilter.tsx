'use client';

import { useState } from 'react';
import { CalendarDotsIcon } from '@phosphor-icons/react';
import { format, subDays, startOfWeek, startOfMonth, endOfMonth } from 'date-fns';

interface DateRange {
  from: Date;
  to: Date;
}

interface Props {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const presets: { label: string; getRange: () => DateRange }[] = [
  { label: '7H Terakhir', getRange: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
  { label: '30H Terakhir', getRange: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
  { label: 'Minggu Ini', getRange: () => ({ from: startOfWeek(new Date(), { weekStartsOn: 1 }), to: new Date() }) },
  { label: 'Bulan Ini', getRange: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
];

export default function DateRangeFilter({ value, onChange }: Props) {
  const [showPresets, setShowPresets] = useState(false);

  return (
    <div className="relative flex items-center gap-2">
      <button
        type="button"
        onClick={() => setShowPresets(!showPresets)}
        className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <CalendarDotsIcon className="w-4 h-4 text-[var(--primary)]" />
        <span>
          {format(value.from, 'dd/MM')} - {format(value.to, 'dd/MM/yy')}
        </span>
      </button>

      {showPresets && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 z-50 p-2 min-w-[200px]">
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                onChange(preset.getRange());
                setShowPresets(false);
              }}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

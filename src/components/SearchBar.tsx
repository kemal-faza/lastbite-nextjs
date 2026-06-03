"use client";

import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  results?: Array<{ id: string | number; name: string; [key: string]: any }>;
  onSelect?: (result: any) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  results,
  onSelect,
  placeholder,
}: SearchBarProps) {
  return (
    <Command className="rounded-lg border" shouldFilter={false}>
      <CommandInput
        placeholder={placeholder ?? "Cari makanan surplus..."}
        value={value}
        onValueChange={onChange}
      />
      {results && (
        <CommandList>
          <CommandEmpty>Tidak ada hasil</CommandEmpty>
          {results.length > 0 && (
            <CommandGroup heading="Hasil Pencarian">
              {results.map((result) => (
                <CommandItem key={result.id} onSelect={() => onSelect?.(result)}>
                  {result.name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      )}
    </Command>
  );
}

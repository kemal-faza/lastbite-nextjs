"use client"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { PackageIcon, CookingPotIcon, BreadIcon, CoffeeIcon } from "@phosphor-icons/react"

const categories = [
  { value: "all", label: "Semua", icon: PackageIcon },
  { value: "meals", label: "Makanan", icon: CookingPotIcon },
  { value: "bakery", label: "Roti", icon: BreadIcon },
  { value: "drinks", label: "Minuman", icon: CoffeeIcon },
] as const

interface CategoryFilterProps {
  value: string
  onChange: (value: string) => void
}

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(val) => {
        if (val) onChange(val)
      }}
      className="flex-wrap"
    >
      {categories.map(({ value: v, label, icon: Icon }) => (
        <ToggleGroupItem key={v} value={v} className="gap-2" size="sm">
          {Icon && <Icon size={16} />}
          {label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

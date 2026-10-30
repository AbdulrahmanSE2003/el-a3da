"use client"

import { SearchIcon, XIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CategoryCount, ContentSetId } from "../lib/types"
import { getCategoryLabel } from "../lib/question-categories"

interface QuestionsFiltersProps {
  search: string
  setSearch: (value: string) => void
  category: string
  setId: ContentSetId
  categories: CategoryCount[]
  onCategoryChange: (value: string) => void
}

export function QuestionsFilters({
  search,
  setSearch,
  category,
  setId,
  categories,
  onCategoryChange,
}: QuestionsFiltersProps) {
  return (
    <div className="grid gap-3 lg:grid-cols-[3fr_1fr]">
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute inset-s-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />

        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="ابحث بالسؤال أو المعرف أو الفئة..."
          aria-label="بحث في الأسئلة"
          className="ps-9 pe-9"
        />

        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            aria-label="مسح البحث"
            className="absolute inset-e-2.5 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink"
          >
            <XIcon className="size-4" />
          </button>
        )}
      </div>

      <Select value={category} onValueChange={onCategoryChange}>
        <SelectTrigger aria-label="تصفية بالفئة" className="w-full">
          <SelectValue />
        </SelectTrigger>

        <SelectContent position="popper">
          <SelectItem value="all">كل الفئات</SelectItem>

          {categories.map((item) => (
            <SelectItem key={item.category} value={item.category}>
              {getCategoryLabel(setId, item.category)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

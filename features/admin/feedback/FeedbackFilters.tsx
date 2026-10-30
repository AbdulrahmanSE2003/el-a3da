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
import {
  FEEDBACK_STATUS_LABELS,
  FEEDBACK_STATUSES,
  FEEDBACK_TYPE_LABELS,
  FEEDBACK_TYPES,
  type FeedbackStatus,
  type FeedbackType,
} from "@/features/feedback/lib/feedback"
import type { FeedbackCounts } from "../feedback/lib/types"

interface FeedbackFiltersProps {
  search: string
  setSearch: (value: string) => void
  status: FeedbackStatus | "all"
  type: FeedbackType | "all"
  counts: FeedbackCounts
  onStatusChange: (value: FeedbackStatus | "all") => void
  onTypeChange: (value: FeedbackType | "all") => void
}

export function FeedbackFilters({
  search,
  setSearch,
  status,
  type,
  counts,
  onStatusChange,
  onTypeChange,
}: FeedbackFiltersProps) {
  return (
    <div className="grid gap-3 lg:grid-cols-[3fr_1fr_1fr]">
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute inset-s-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />

        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="ابحث في الرسالة أو التواصل أو معرف السؤال..."
          aria-label="بحث في رسائل اللاعبين"
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

      <Select
        value={status}
        onValueChange={(value) =>
          onStatusChange(value as FeedbackStatus | "all")
        }
      >
        <SelectTrigger aria-label="تصفية بالحالة" className="w-full">
          <SelectValue />
        </SelectTrigger>

        <SelectContent position="popper">
          <SelectItem value="all">كل الحالات ({counts.total})</SelectItem>
          {FEEDBACK_STATUSES.map((item) => (
            <SelectItem key={item} value={item}>
              {FEEDBACK_STATUS_LABELS[item]} ({counts[item]})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={type}
        onValueChange={(value) => onTypeChange(value as FeedbackType | "all")}
      >
        <SelectTrigger aria-label="تصفية بالنوع" className="w-full">
          <SelectValue />
        </SelectTrigger>

        <SelectContent position="popper">
          <SelectItem value="all">كل الأنواع</SelectItem>
          {FEEDBACK_TYPES.map((item) => (
            <SelectItem key={item} value={item}>
              {FEEDBACK_TYPE_LABELS[item]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

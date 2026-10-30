import { cn } from "@/lib/utils"
import { Tag } from "./table"
import { getCategoryLabel } from "../lib/question-categories"
import {
  getCategoryBadgeStyle,
  getCategoryDotStyle,
} from "../questions/lib/category-style"

interface CategoryBadgeProps {
  category: string
  setId?: string
  className?: string
}

/**
 * بادج موحّد لأي فئة في الداشبورد: نفس اللون في الجدول، التفاصيل، وأي مكان
 * تاني بيعرض category. اللون نفسه جاي من category-style.ts.
 */
export function CategoryBadge({
  category,
  setId,
  className,
}: CategoryBadgeProps) {
  const normalized = category.trim()
  if (!normalized) return null

  return (
    <Tag
      className={cn("gap-1.5", getCategoryBadgeStyle(normalized), className)}
    >
      <span
        className={cn(
          "size-1.5 shrink-0 rounded-full",
          getCategoryDotStyle(normalized)
        )}
        aria-hidden
      />
      {setId ? getCategoryLabel(setId, normalized) : normalized}
    </Tag>
  )
}

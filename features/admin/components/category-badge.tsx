import { cn } from "@/lib/utils"
import { Tag } from "./table"
import {
  getCategoryBadgeStyle,
  getCategoryDotStyle,
} from "../questions/lib/category-style"

interface CategoryBadgeProps {
  category: string
  className?: string
}

/**
 * بادج موحّد لأي فئة في الداشبورد: نفس اللون في الجدول، التفاصيل، وأي مكان
 * تاني بيعرض category. اللون نفسه جاي من category-style.ts.
 */
export function CategoryBadge({ category, className }: CategoryBadgeProps) {
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
      {normalized}
    </Tag>
  )
}

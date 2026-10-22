import Link from "next/link"
import { ArrowUpLeft, type LucideIcon } from "lucide-react"

export interface ActivityCardItem {
  number: string
  href: string
  icon: LucideIcon
  stamp: string
  title: string
  description: string
  className?: string
  variant?: "default" | "dark"
}

export interface ActivityCardProps {
  item: ActivityCardItem
  className?: string
  showWatermark?: boolean
}

export function ActivityCard({
  item,
  className = "",
  showWatermark = true,
}: ActivityCardProps) {
  const Icon = item.icon
  const activeClassName = className || item.className || ""

  // Added missing isDark variable derivation
  const isDark = item.variant === "dark"

  return (
    <Link
      href={item.href}
      className={`group card-brutal  ${
        isDark
          ? "border-paper-warm/30 bg-zinc-800 text-paper shadow-[3px_3px_0_var(--color-paper-warm)] hover:shadow-[5px_5px_0_var(--color-paper-warm)]"
          : ""
      } ${activeClassName}`}
    >
      {showWatermark && (
        <span className={`watermark-num ${isDark ? "text-paper/5" : ""}`}>
          {item.number}
        </span>
      )}

      <div className="relative flex items-start justify-between">
        <div
          className={`icon-box ${
            isDark ? "border-paper/20 bg-ink-soft text-paper" : ""
          }`}
        >
          <Icon className="size-4" strokeWidth={1.8} />
        </div>
        <span className={`stamp-text ${isDark ? "text-copper" : ""}`}>
          {item.number}
        </span>
      </div>

      <div className="relative">
        <span className={`stamp-text ${isDark ? "text-copper" : ""}`}>
          {item.stamp}
        </span>
        <h3 className="mt-1.5 text-xl leading-none font-black tracking-tight">
          {item.title}
        </h3>

        <div className="mt-3 flex items-center justify-between">
          <p
            className={`text-[11px] font-semibold ${
              isDark ? "text-paper/70" : "text-ink-soft/65"
            }`}
          >
            {item.description}
          </p>
          <ArrowUpLeft className="arrow-hover" />
        </div>
      </div>
    </Link>
  )
}

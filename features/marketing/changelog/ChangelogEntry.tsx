import { labelColor } from "@/lib/constants"
import { getArabicLabel } from "@/lib/utils"

type ChangelogUpdate = {
  version: string
  date: string
  label: keyof typeof labelColor
  title: string
  description: string
}

type ChangelogEntryProps = {
  update: ChangelogUpdate
}

export default function ChangelogEntry({ update }: ChangelogEntryProps) {
  return (
    <article className="relative grid grid-cols-[80px_1fr] gap-6 sm:grid-cols-[100px_1fr] sm:gap-8">
      {/* Date & Version Column */}
      <div className="relative pt-1 text-right">
        <span className="inline-block rounded-md bg-copper/10 px-2 py-0.5 font-mono text-xs font-bold text-copper">
          v{update.version}
        </span>
        <p className="mt-1.5 font-mono text-[11px] font-medium text-ink-soft">
          {update.date}
        </p>
      </div>

      {/* Content Column */}
      <div className="group pb-10">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider transition-colors ${labelColor[update.label]}`}
          >
            {getArabicLabel(update.label)}
          </span>
        </div>

        <h2 className="mt-3 text-lg font-black tracking-tight text-ink transition-colors group-hover:text-copper sm:text-xl">
          {update.title}
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-ink-soft sm:text-base">
          {update.description}
        </p>
      </div>
    </article>
  )
}

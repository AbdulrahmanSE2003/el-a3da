// components/ui/ChangelogModal.tsx
import { AppDialog } from "@/components/ui/AppDialog"
import { updates } from "@/lib/constants"
import { getArabicLabel } from "@/lib/utils"
import { Sparkles } from "lucide-react"

const labelStyles: Record<string, string> = {
  feat: "text-copper border-copper/30 bg-copper/5",
  fix: "text-danger-brand border-danger-brand/30 bg-danger-brand/5",
  chore: "text-ink-soft border-ink/20 bg-ink/5",
}

const trigger = (
  <button className="group flex size-10 items-center justify-center rounded-xl border-2 border-ink bg-paper shadow-[2px_2px_0_var(--color-ink)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
    <Sparkles
      className="size-5 text-ink transition-transform group-hover:scale-110 group-hover:text-copper"
      strokeWidth={2}
    />
  </button>
)

export function ChangelogModal() {
  return (
    <AppDialog
      trigger={trigger}
      title={
        <>
          <Sparkles className="size-6 text-copper" />
          التحديثات
        </>
      }
      subtitle="كل جديد بيحصل في القعدة"
    >
      {updates.map((update, i) => (
        <section key={update.version} className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-base font-semibold text-ink">
              {update.title}
            </h3>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest ${labelStyles[update.label]}`}
              >
                {getArabicLabel(update.label)}
              </span>
              <span className="font-mono text-[10px] font-bold text-ink-soft">
                v{update.version}
              </span>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-ink-soft">
            {update.description}
          </p>
          {i < updates.length - 1 && <div className="border-b border-ink/10" />}
        </section>
      ))}
    </AppDialog>
  )
}

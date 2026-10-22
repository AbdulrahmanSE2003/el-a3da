import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface IdlePhaseProps {
  onChooseSheikh: () => void
}

export function IdlePhase({ onChooseSheikh }: IdlePhaseProps) {
  return (
    <section className="mt-5">
      <h1 className="text-4xl font-black tracking-tight text-copper">
        شيخ الحارة
      </h1>

      <p className="mt-3 max-w-sm text-sm leading-relaxed font-semibold text-ink-soft/70">
        مين الليلة هيبقى ضيف شيخ الحارة؟
      </p>

      <div className="mt-5 rounded-md border-2 border-ink bg-paper-warm p-6 shadow-[5px_5px_0_var(--color-ink)]">
        <div className="flex aspect-square items-center justify-center border border-ink/15">
          <span className="font-mono text-[10rem] font-bold text-ink/20">
            ?
          </span>
        </div>

        <p className="mt-5 text-center text-sm font-bold text-ink-soft/60">
          الشخص لسه مجهول
        </p>
      </div>

      <Button
        variant={"secondary"}
        onClick={onChooseSheikh}
        className="mt-6 flex w-full items-center justify-center"
      >
        <span>اختار ضيف شيخ الحارة</span>
        <ArrowRight className="size-5" />
      </Button>
    </section>
  )
}

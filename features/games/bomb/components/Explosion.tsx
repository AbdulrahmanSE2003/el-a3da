"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, RotateCcw } from "lucide-react"

interface ExplosionProps {
  onRestart?: () => void
}

const Explosion = ({ onRestart }: ExplosionProps) => {
  return (
    <section className="flex w-full flex-col items-center justify-center gap-6 py-6 text-center">
      {/* Explosion Emoji Visual */}
      <div className="relative flex size-32 items-center justify-center rounded-full border-2 border-red-500/30 bg-red-500/10 shadow-[4px_4px_0_var(--color-ink)]">
        <span className="text-6xl" role="img" aria-label="انفجار">
          💣
        </span>
      </div>

      {/* Result Card */}
      <div className="flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-ink/15 bg-paper p-6 shadow-[4px_4px_0_var(--color-ink)]">
        <span className="font-mono text-[10px] font-black tracking-[0.25em] text-red-500">
          BOOM!
        </span>

        <h2 className="text-3xl font-black text-ink sm:text-4xl">
          القنبلة انفجرت! 💣
        </h2>

        <p className="max-w-xs text-sm leading-relaxed font-semibold text-ink-soft">
          اللي الموبايل في إيده دلوقتي هو الخسران!
        </p>
      </div>

      {/* Action Button */}
      {onRestart && (
        <Button
          type="button"
          onClick={onRestart}
          className="flex w-full items-center justify-center gap-2"
        >
          <RotateCcw className="size-4" />
          العب جولة جديدة
        </Button>
      )}

      <Button
        variant={"outline"}
        className="flex w-full items-center justify-center gap-2"
      >
        <ArrowRight className={`size-4`} />
        شوف لعبة تانية
      </Button>
    </section>
  )
}

export default Explosion

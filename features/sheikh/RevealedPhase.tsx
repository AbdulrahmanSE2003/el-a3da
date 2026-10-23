import { ArrowRight } from "lucide-react"
import { Player } from "@/store/party-store"
import { Button } from "@/components/ui/button"

interface RevealedPhaseProps {
  sheikh: Player
  onStartQuestions: () => void
}

export function RevealedPhase({
  sheikh,
  onStartQuestions,
}: RevealedPhaseProps) {
  return (
    <section className="mt-5">
      <p className="text-sm font-bold text-ink-soft/60">
        النهارده الحكم على...
      </p>

      <div className="mt-6 rounded-md border-2 border-ink bg-paper-warm p-6 shadow-[5px_5px_0_var(--color-ink)]">
        <div className="flex aspect-square items-center justify-center rounded-md border-2 border-copper bg-paper">
          <div className="text-center">
            <p className="mb-2 text-xs font-bold text-copper">شيخ الحارة</p>

            <h1 className="px-4 text-4xl font-black break-words">
              {sheikh.name}
            </h1>
          </div>
        </div>

        <p className="mt-5 text-center text-[10px] font-bold tracking-widest text-ink-soft/50">
          اجهز عشان الشيخ هيعرفك على نفسك او يعرّف شلِّتك عليك.
        </p>
      </div>

      <Button
        variant={"secondary"}
        onClick={onStartQuestions}
        className="mt-6 flex w-full items-center justify-center"
      >
        <span>يلا نسأله</span>
        <ArrowRight className="size-5" />
      </Button>
    </section>
  )
}

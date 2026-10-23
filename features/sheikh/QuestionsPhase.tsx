import { ArrowRight, RotateCcw } from "lucide-react"
import { Player } from "@/store/party-store"
import { Button } from "@/components/ui/button"

interface QuestionsPhaseProps {
  sheikh: Player
  currentQuestion: { text: string }
  onNextQuestion: () => void
  onReset: () => void
}

export function QuestionsPhase({
  sheikh,
  currentQuestion,
  onNextQuestion,
  onReset,
}: QuestionsPhaseProps) {
  return (
    <section className="mt-5 flex flex-1 flex-col justify-between gap-4">
      {/* Top Content: Header & Card */}
      <div className="flex flex-col gap-3">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-bold text-ink-soft/50">شيخ الحارة</p>
            <h1 className="mt-1 text-3xl font-black">{sheikh.name}</h1>
          </div>
        </div>

        <div className="mt-4 rounded-md border-2 border-ink bg-paper-warm p-6 shadow-[5px_5px_0_var(--color-ink)]">
          <div className="flex items-center justify-between border-b border-ink/10 pb-4">
            <span className="text-sm font-bold text-copper">سؤال</span>
          </div>

          <p className="mt-8 text-xl leading-relaxed font-black">
            {currentQuestion.text}
          </p>
        </div>
      </div>

      {/* Bottom Actions Fixed at Bottom */}
      <div className="mt-auto flex flex-col gap-3 pt-6">
        <Button
          variant="default"
          onClick={onNextQuestion}
          className="flex w-full items-center justify-center"
        >
          <ArrowRight className="size-5" />
          <span>سؤال تاني</span>
        </Button>

        <Button
          variant="outline"
          onClick={onReset}
          className="hover:text-danger mx-auto flex w-full items-center justify-center gap-2 text-sm font-bold text-ink-soft/50 transition-colors"
        >
          <RotateCcw className="size-5" />
          ابدأ من جديد
        </Button>
      </div>
    </section>
  )
}

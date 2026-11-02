import { CheckCircle2, HelpCircle } from "lucide-react"
import HostTip from "./HostTip"
import type { ContentQuestion } from "@/lib/content/types"

const QuestionHeader = ({
  currentQuestion,
}: {
  currentQuestion: ContentQuestion | null
}) => {
  if (!currentQuestion) {
    return (
      <div className="flex items-center gap-3 rounded-sm border-2 border-dashed border-ink/30 bg-paper/50 p-4 text-ink-soft">
        <HelpCircle className="size-5 shrink-0" strokeWidth={2} />
        <p className="text-sm font-bold">
          لسه مفيش سؤال — الهوست يختار سؤال من اللستة
        </p>
      </div>
    )
  }

  return (
    <div className={`flex flex-col gap-5`}>
      <div className="flex flex-col items-start gap-4 rounded-sm border-2 border-ink bg-paper p-4 shadow-[4px_4px_0px_0px_var(--color-ink)]">
        <div className="flex flex-col items-start gap-3">
          <div className={`flex w-full items-center justify-between`}>
            <span className={`text-xs font-bold text-muted-foreground`}>
              {currentQuestion.category}
            </span>
            <span className={`font-mono text-xs text-muted-foreground/15`}>
              {currentQuestion.id}
            </span>
          </div>
          <h3 className="text-xl leading-relaxed font-black tracking-wider text-ink">
            {currentQuestion.text}
          </h3>
        </div>

        {currentQuestion.correct_answer && (
          <div className="flex w-full items-center gap-3 border-t-2 border-dashed border-ink/15 pt-3">
            <CheckCircle2
              className="size-5 shrink-0 text-copper"
              strokeWidth={2}
            />
            <span className="text-sm font-bold text-ink-soft">
              الإجابة الصحيحة:
            </span>
            <span className="rounded-sm border-2 border-ink bg-copper/10 px-2 py-0.5 text-base font-black text-copper">
              {currentQuestion.correct_answer}
            </span>
          </div>
        )}
      </div>

      <HostTip category={currentQuestion.category} />
    </div>
  )
}

export default QuestionHeader

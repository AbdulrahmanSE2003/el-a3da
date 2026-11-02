import { Info } from "lucide-react"
import { HOST_TIPS } from "./constatns"

interface HostTipProps {
  category?: string
}

const DEFAULT_TIP =
  "اقرأ السؤال بوضوح وبحماس، وادي كل لاعب فرصته ولو الدنيا عطلت ادي Hint عن الإجابة."

export default function HostTip({ category }: HostTipProps) {
  const tip =
    category && HOST_TIPS[category] ? HOST_TIPS[category] : DEFAULT_TIP
  console.log(tip)

  return (
    <aside
      role="note"
      aria-label="نصيحة للهوست"
      className="flex flex-col gap-1.5 rounded-lg border-2 border-amber-500/50 bg-amber-500/10 p-3 text-amber-700 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300"
    >
      <div className="flex items-center gap-2 font-medium">
        <Info className="size-4 shrink-0" />
        <span className="text-xs">نصيحة للهوست</span>
      </div>

      <p className="text-xs leading-relaxed text-amber-800/90 dark:text-amber-200/90">
        {tip}
      </p>
    </aside>
  )
}

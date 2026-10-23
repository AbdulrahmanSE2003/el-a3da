import { Bomb, Play, Skull, Lightbulb } from "lucide-react"

export function BombGameGuide() {
  const steps = [
    {
      title: "اختار التصنيف",
      description:
        "اختاروا نوع الأسئلة اللي يناسب القعدة، أو سيبوا الاختيار عشوائي.",
    },
    {
      title: "اقرأ السؤال",
      description: "سؤال بيظهر للشلة، وكل واحد يحاول يجاوب بسرعة.",
    },
    {
      title: "مرر القنبلة",
      description: "بعد إجابتك، مرر الموبايل لحد تاني قبل ما الوقت يخلص.",
    },
    {
      title: "خلي بالك من الوقت",
      description: "مدة القنبلة عشوائية، ومحدش عارف هتنفجر إمتى!",
    },
  ]

  const tips = [
    "متتأخرش في الإجابة، الوقت بيجري!",
    "مرر الموبايل بسرعة وخلي الكل في حالة ترقب.",
    "جهزوا عقوبة للخسران قبل ما تبدأوا!",
  ]

  return (
    <>
      {/* الفكرة */}
      <section className="flex flex-col gap-3">
        <h3 className="flex items-center gap-2 text-base font-black text-copper">
          <Bomb className="size-5 shrink-0" strokeWidth={2} />
          الفكرة
        </h3>
        <p className="text-sm leading-relaxed font-semibold text-ink-soft">
          القنبلة لعبة سرعة بديهة وتركيز، بتختاروا تصنيف أسئلة وتبدأوا تجاوبوا
          بسرعة قبل ما القنبلة تنفجر. الموبايل بيلف بين أفراد الشلة، وكل واحد
          بيحاول يلحق يجاوب ويمرر القنبلة للي بعده قبل ما الوقت يخلص.
        </p>
      </section>

      {/* إزاي تلعب؟ */}
      <section className="flex flex-col gap-3">
        <h3 className="flex items-center gap-2 text-base font-black text-copper">
          <Play className="size-5 shrink-0" strokeWidth={2} />
          إزاي تلعب؟
        </h3>
        <div className="flex flex-col gap-2">
          {steps.map((step) => (
            <div
              key={step.title}
              className="rounded-md border-2 border-ink/15 bg-paper p-4 shadow-[2px_2px_0_var(--color-ink)]"
            >
              <h4 className="font-black text-ink">{step.title}</h4>
              <p className="mt-1 text-xs leading-relaxed font-semibold text-ink-soft">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* مين يخسر؟ */}
      <section className="flex flex-col gap-3">
        <h3 className="flex items-center gap-2 text-base font-black text-copper">
          <Skull className="size-5 shrink-0" strokeWidth={2} />
          مين يخسر؟
        </h3>
        <div className="rounded-md border-2 border-ink/15 bg-paper p-4 shadow-[2px_2px_0_var(--color-ink)]">
          <p className="text-sm leading-relaxed font-semibold text-ink-soft">
            اللاعب اللي تكون القنبلة معاه لحظة الانفجار هو الخسران، والشلة
            تختارله العقوبة!
          </p>
        </div>
      </section>

      {/* نصيحة */}
      <section className="flex flex-col gap-3 rounded-md border-2 border-copper bg-copper/8 p-4 shadow-[2px_2px_0_var(--color-copper)]">
        <h3 className="flex items-center gap-2 text-base font-black text-copper">
          <Lightbulb className="size-5 shrink-0" strokeWidth={2} />
          نصيحة
        </h3>
        <ul className="flex flex-col gap-2">
          {tips.map((tip) => (
            <li
              key={tip}
              className="flex items-start gap-3 text-xs font-bold text-ink"
            >
              <span className="mt-1 size-1.5 shrink-0 bg-copper" />
              {tip}
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

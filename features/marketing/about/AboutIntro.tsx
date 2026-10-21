import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function AboutIntro() {
  return (
    <>
      <p className="font-mono text-[10px] font-bold tracking-[0.25em] text-copper">
        ABOUT
      </p>

      <h1 className="mt-4 text-5xl leading-tight font-black">عن القعدة</h1>

      <div className="mt-8 space-y-5 text-lg leading-9 text-ink-soft">
        <p>
          القعدة فكرة بسيطة — لمّ أصحابك من غير تخطيط، من غير ما حد يسأل
          <span className="font-bold text-ink"> &quot;هنعمل إيه؟&quot;</span>
        </p>

        <p>مفيش أكاونتات. مفيش بيانات. مجرد شلة وقعدة.</p>
      </div>

      <Link
        href="/platform"
        className="mt-10 inline-flex items-center gap-2 rounded-full bg-ink px-7 py-4 text-sm font-bold text-paper transition-transform hover:-translate-y-1"
      >
        ابدأ قعدة
        <ArrowLeft className="size-4" />
      </Link>
    </>
  )
}

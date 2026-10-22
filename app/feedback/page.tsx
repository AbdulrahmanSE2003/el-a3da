import type { Metadata } from "next"
import GridPattern from "@/components/atmosphere/GridPattern"
import BackgroundAtmosphere from "@/components/atmosphere/BackgroundAtmosphere"
import Header from "@/components/layout/Header"
import HomeBottomNav from "@/components/layout/HomeBottomNav"
import { FeedbackForm } from "@/features/feedback/components/feedback-form"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "الملاحظات — القعدة",
  description:
    "قولنا رأيك أو بلّغنا عن مشكلة في تطبيق القعدة. تقدر ترفع صور شاشة مع الرسالة.",
}

export default function FeedbackPage() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-paper px-5 py-6 pb-24 text-ink">
      <GridPattern />
      <BackgroundAtmosphere />

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col">
        <Header stamp="FEEDBACK" />

        <div className="mt-8 mb-6">
          <p className="text-xs font-bold tracking-[0.25em] text-copper">
            رأيك يفرق
          </p>

          <h1 className="mt-1 text-4xl font-black tracking-tight text-ink">
            قولنا إيه اللي في دماغك
          </h1>

          <p className="mt-2 text-xs leading-6 font-semibold text-ink-soft/70">
            مشكلة، اقتراح، أو ملاحظة على سؤال؟ اكتبها هنا، ولو عندك صورة للشاشة
            ارفعها معاها عشان نساعدك أسرع.
          </p>
        </div>

        <Suspense fallback={<div className={``}>ss</div>}>
          <FeedbackForm />
        </Suspense>

        <HomeBottomNav />
      </div>
    </main>
  )
}

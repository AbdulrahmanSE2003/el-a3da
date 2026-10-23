"use client"

import { ArrowLeft, Coffee, Dice5, MessageCircle, Sparkles } from "lucide-react"
import Link from "next/link"
import Navbar from "./Navbar"
import Hero from "@/features/marketing/home/Hero"

const LandingPage = () => {
  return (
    <main className="min-h-screen bg-paper text-ink">
      {/* NAV */}
      <Navbar />

      {/* HERO */}
      <Hero />

      {/* INTRO */}
      <section className="border-t border-ink/10">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-2 lg:px-10 lg:py-32">
          <div>
            <p className="font-mono text-[10px] font-bold tracking-[0.25em] text-copper">
              THE IDEA
            </p>

            <h2 className="mt-4 text-4xl leading-tight font-black sm:text-5xl">
              القعدة مش تطبيق ألعاب بس.
            </h2>
          </div>

          <div className="flex flex-col justify-end">
            <p className="text-lg leading-9 text-ink-soft">
              هي المكان اللي تلم فيه صحابك وتبدأ القعدة من غير ما حد يقول:
              <br />
              <span className="font-bold text-ink">
                &quot;نعمل إيه بقى؟&quot;
              </span>
            </p>

            <div className="mt-8 flex items-center gap-3 text-sm font-bold">
              <span className="h-px w-12 bg-copper" />
              ألعاب · كلام · تحديات · ضحك
            </div>
          </div>
        </div>
      </section>

      {/* SIMPLE FEATURES */}
      <section className="bg-ink text-paper">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
          <div className="max-w-xl">
            <p className="font-mono text-[10px] font-bold tracking-[0.25em] text-copper">
              ON THE TABLE
            </p>

            <h2 className="mt-4 text-4xl leading-relaxed font-black sm:text-5xl">
              كل اللي محتاجه عشان القعدة تبدأ.
            </h2>
          </div>

          <div className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-paper/10 bg-paper/10 md:grid-cols-3">
            {[
              {
                icon: Dice5,
                title: "ألعاب",
                text: "ألعاب جماعية تخلي كل واحد يدخل في القعدة.",
              },
              {
                icon: MessageCircle,
                title: "مواضيع",
                text: "أسئلة ومواضيع تفتح كلام بدل الصمت المعتاد.",
              },
              {
                icon: Sparkles,
                title: "تحديات",
                text: "حاجات سريعة تكسر الملل وتولع المنافسة.",
              },
            ].map((item) => {
              const Icon = item.icon

              return (
                <div
                  key={item.title}
                  className="bg-ink p-8 transition-colors hover:bg-paper/5"
                >
                  <Icon className="size-7 text-copper" />

                  <h3 className="mt-12 text-2xl font-black">{item.title}</h3>

                  <p className="mt-3 text-sm leading-7 text-paper/55">
                    {item.text}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-7xl px-6 py-28 text-center lg:px-10">
        <p className="text-sm font-bold tracking-[0.25em] text-copper">
          READY!
        </p>

        <h2 className="mt-5 text-5xl font-black sm:text-7xl">طب نقعد؟</h2>

        <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-ink-soft">
          لمّ صحابك وسيب الباقي على القعدة.
        </p>

        <Link
          href="/download"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-8 py-4 text-sm font-bold text-paper transition-transform hover:-translate-y-1"
        >
          ابدأ قعدة
          <ArrowLeft className="size-4" />
        </Link>
      </section>

      <footer className="border-t border-ink/10 px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-xs font-bold text-ink-soft sm:flex-row">
          <span>القعدة · كل قعدة وليها حكاية</span>

          <div className="flex gap-5">
            <Link href="/about">عن القعدة</Link>
            <Link href="/download">التحميل</Link>
            <Link href="/changelog">التحديثات</Link>
            <Link href="/feedback">الملاحظات</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}

export default LandingPage

import { ArrowLeft, Coffee, Dice5, MessageCircle, Sparkles } from "lucide-react"
import Link from "next/link"

const Hero = () => {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-96px)] max-w-7xl items-center gap-16 px-6 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:py-16">
      {/* Copy */}
      <div dir="rtl" className="max-w-2xl">
        <div className="bg-paper-soft mb-7 inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-xs font-bold">
          <span className="h-2 w-2 rounded-full bg-copper" />
          كل قعدة وليها حكاية
        </div>

        <h1 className="text-6xl leading-[1.05] font-black tracking-tight sm:text-7xl lg:text-8xl">
          القعدة
          <br />
          <span className="text-copper">بتبدأ هنا.</span>
        </h1>

        <p className="mt-7 max-w-xl text-lg leading-9 text-ink-soft sm:text-xl">
          أبلكيشن الشلة على القهوة.
          <br />
          ألعاب، تحديات، مواضيع، وكرسي الاعتراف.
          <br />
          من غير حسابات ومن غير تعقيد.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Link
            href="/download"
            className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-4 text-sm font-bold text-paper transition-transform hover:-translate-y-1"
          >
            ابدأ القعدة
            <ArrowLeft className="size-4" />
          </Link>

          <Link
            href="/about"
            className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-7 py-4 text-sm font-bold transition-colors hover:bg-ink/5"
          >
            اعرف القعدة
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold text-ink-soft">
          <span>مش محتاج تسجيل</span>
          <span>•</span>
          <span>مش محتاج حساب</span>
          <span>•</span>
          <span>جمّع صحابك والعب</span>
        </div>
      </div>

      {/* Visual */}
      <div className="relative mx-auto aspect-square w-full max-w-[520px]">
        <div className="bg-paper-soft absolute inset-0 rotate-3 rounded-[2rem] border border-ink/10" />

        <div className="absolute inset-4 -rotate-3 overflow-hidden rounded-[2rem] border border-ink/10 bg-ink p-7 text-paper shadow-2xl">
          <div className="flex items-center justify-between border-b border-paper/15 pb-5">
            <span className="font-mono text-[10px] font-bold tracking-[0.3em] text-copper">
              QA3DA
            </span>

            <Coffee className="size-5 text-paper/60" />
          </div>

          <div className="flex h-full flex-col justify-center pb-12 text-center">
            <p className="text-xs font-bold tracking-[0.2em] text-paper/40">
              الليلة بدأت
            </p>

            <h2 className="mt-4 text-5xl leading-tight font-black">
              يلا
              <br />
              <span className="text-copper">نقعد.</span>
            </h2>

            <div className="mx-auto mt-10 grid w-full max-w-xs grid-cols-3 gap-3">
              <div className="flex aspect-square items-center justify-center rounded-2xl border border-paper/10 bg-paper/5">
                <Dice5 className="size-7 text-paper/70" />
              </div>

              <div className="flex aspect-square items-center justify-center rounded-2xl border border-paper/10 bg-paper/5">
                <MessageCircle className="size-7 text-paper/70" />
              </div>

              <div className="flex aspect-square items-center justify-center rounded-2xl border border-paper/10 bg-paper/5">
                <Sparkles className="size-7 text-paper/70" />
              </div>
            </div>
          </div>

          <div className="absolute right-7 bottom-6 left-7 flex items-center justify-between text-[10px] font-bold text-paper/40">
            <span>كل قعدة وليها حكاية</span>
            <span>01</span>
          </div>
        </div>

        <div className="absolute -bottom-5 -left-3 rotate-[-6deg] rounded-xl border border-ink/10 bg-copper px-5 py-3 text-sm font-black text-ink shadow-lg">
          جمّع صحابك ☕
        </div>
      </div>
    </section>
  )
}

export default Hero

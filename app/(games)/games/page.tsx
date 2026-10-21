import GridPattern from "@/components/atmosphere/GridPattern"
import BackgroundAtmosphere from "@/components/atmosphere/BackgroundAtmosphere"
import Header from "@/components/layout/Header"
import Games from "@/features/games/components/Games"
import HomeBottomNav from "@/components/layout/HomeBottomNav"

export default function GamesPage() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-paper px-5 py-6 pb-24 text-ink">
      <GridPattern />
      <BackgroundAtmosphere />

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col">
        <Header stamp="GAMES" />

        <div className="mt-8 mb-6">
          <p className="text-xs font-bold tracking-[0.25em] text-copper">
            اختاروا اللعبة
          </p>

          <h1 className="mt-1 text-4xl font-black tracking-tight text-ink">
            ألعاب القعدة
          </h1>

          <p className="mt-2 text-xs leading-6 font-semibold text-ink-soft/70">
            كل لعبة ليها طابعها وقواعدها. اختاروا اللي يناسب مود القعدة الليلة.
          </p>
        </div>

        <Games />

        <HomeBottomNav />
      </div>
    </main>
  )
}

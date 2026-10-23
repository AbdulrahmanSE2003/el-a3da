import BackgroundAtmosphere from "@/components/atmosphere/BackgroundAtmosphere"
import GridPattern from "@/components/atmosphere/GridPattern"
import Header from "@/components/layout/Header"
import BombGame from "@/features/games/bomb/components/Bombgame"

const page = () => {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-paper px-5 py-6 text-ink">
      <GridPattern />
      <BackgroundAtmosphere />

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col gap-3">
        <Header stamp="BOMB" href="/games" linkText="الألعاب" />

        <BombGame />
      </div>
    </main>
  )
}

export default page

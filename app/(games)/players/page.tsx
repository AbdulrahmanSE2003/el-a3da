import BackgroundAtmosphere from "@/components/atmosphere/BackgroundAtmosphere"
import GridPattern from "@/components/atmosphere/GridPattern"
import Header from "@/components/layout/Header"
import HomeBottomNav from "@/components/layout/HomeBottomNav"
import { Skeleton } from "@/components/ui/skeleton"
import PlayersIntro from "@/features/players/PlayersIntro"
import PlayersPageClient from "@/features/players/PlayersPageClient"
import { Suspense } from "react"

export default function PlayersPage() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-paper px-5 py-6 pb-24 text-ink">
      <GridPattern />
      <BackgroundAtmosphere />

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col">
        <Header stamp="PLAYERS" />
        <PlayersIntro />
        <Suspense
          fallback={
            <div className={`flex flex-col gap-4`}>
              {[...Array(3)].map((_, index) => (
                <Skeleton key={index} />
              ))}
            </div>
          }
        >
          <PlayersPageClient />
        </Suspense>
      </div>

      <HomeBottomNav />
    </main>
  )
}

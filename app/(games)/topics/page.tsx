import BackgroundAtmosphere from "@/components/atmosphere/BackgroundAtmosphere"
import GridPattern from "@/components/atmosphere/GridPattern"
import Header from "@/components/layout/Header"
import TopicsArea from "@/features/topics/TopicsArea"

export default function TopicsPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-between overflow-hidden bg-paper p-6 py-4 text-ink md:p-10">
      {/* Background paper texture pattern */}
      <GridPattern />
      <BackgroundAtmosphere />
      {/* Navigation & Header */}
      <Header stamp="TOPICS" />
      {/* Topics */}
      <TopicsArea />
    </main>
  )
}

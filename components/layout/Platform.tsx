import GridPattern from "@/components/atmosphere/GridPattern"
import Hero from "@/features/home/components/Hero"
import { ActivityCard } from "@/components/layout/ActivityCard"
import HomeBottomNav from "@/components/layout/HomeBottomNav"
import { activities } from "@/lib/constants"
import { ChangelogModal } from "@/features/home/components/ChangeLogModal"
import { DownloadModal } from "../ui/DownloadModal"
import BackgroundAtmosphere from "../atmosphere/BackgroundAtmosphere"

const Platform = () => {
  return (
    <main className="relative overflow-hidden bg-paper px-5 pb-24 text-ink">
      <GridPattern />
      <BackgroundAtmosphere />

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col">
        <div className="flex items-center justify-between">
          <Hero />
          <div className={`flex items-center gap-3`}>
            <DownloadModal />
            <ChangelogModal />
            {/* NOTE Commented now untill we finish update platform provide better guide */}
            {/* <GenericGuide
              title="القعدة"
              subtitle="كل حاجة محتاج تعرفها قبل ما تبدأ — في دقيقتين"
            >
              <PlatformGuide />
            </GenericGuide> */}
          </div>
        </div>

        <section className="mt-10 mb-5">
          <h2 className="text-2xl font-black tracking-tight">
            النهاردة هنعمل إيه؟
          </h2>
          <p className="mt-1 text-sm font-medium text-ink-soft/70">
            اختار حاجة تفتح الكلام... أو تولّع القعدة.
          </p>
        </section>

        <ActivityCard item={activities[0]} />

        <section className="mt-4 grid grid-cols-2 gap-3">
          {activities.slice(1).map((item) => (
            <ActivityCard
              item={item}
              key={item.number}
              className={item?.className ?? ""}
            />
          ))}
        </section>

        <HomeBottomNav />
      </div>
    </main>
  )
}

export default Platform

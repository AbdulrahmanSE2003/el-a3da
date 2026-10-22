"use client"

import { useState } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { updates } from "@/lib/constants"
import ChangelogEntry from "@/features/marketing/changelog/ChangelogEntry"

const INITIAL_VISIBLE_COUNT = 3
const LOAD_MORE_STEP = 3

export default function ChangelogPage() {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT)

  const visibleUpdates = updates.slice(0, visibleCount)
  const hasMore = visibleCount < updates.length

  const handleShowMore = () => {
    setVisibleCount((prev) => Math.min(prev + LOAD_MORE_STEP, updates.length))
  }

  return (
    <main dir="rtl" className="min-h-screen bg-paper text-ink">
      <Navbar />

      <section className="mx-auto max-w-2xl px-6 py-16 sm:py-24 lg:px-10">
        <header className="border-b border-ink/10 pb-10">
          <p className="font-mono text-xs font-bold tracking-[0.2em] text-copper uppercase">
            CHANGELOG
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight text-ink sm:text-5xl">
            التحديثات
          </h1>

          <p className="mt-3 text-base text-ink-soft">
            كل جديد بيحصل في القعدة.
          </p>
        </header>

        {/* Changelog Timeline List */}
        <div className="mt-12">
          {visibleUpdates.map((update, ) => (
            <ChangelogEntry key={update.version} update={update} />
          ))}
        </div>

        {/* Show More Trigger */}
        {hasMore && (
          <div className="mt-8 flex justify-center pt-4">
            <button
              onClick={handleShowMore}
              className="group relative inline-flex items-center gap-2 rounded-xl border border-ink/10 bg-paper px-6 py-3 font-mono text-xs font-bold text-ink transition-all hover:border-copper/40 hover:bg-copper/5 active:scale-95"
            >
              <span>عرض المزيد من التحديثات</span>
              <span className="text-ink-soft group-hover:text-copper">
                ({updates.length - visibleCount})
              </span>
            </button>
          </div>
        )}
      </section>

      <Footer />
    </main>
  )
}

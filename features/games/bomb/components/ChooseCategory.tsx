"use client"

import GenericGuide from "@/components/ui/GenericGuide"
import { Separator } from "@/components/ui/separator"
import type { BombCategoryKey } from "@/games/bomb/types"
import { BombGameGuide } from "./BombGameGuide"
import { CategoryGridSkeleton } from "./CategoryGridSkeleton"
import CategoryGrid from "./CategoryGrid"
import { Skeleton } from "@/components/ui/skeleton"

interface ChooseCategoryProps {
  onSelectCategory: (category: BombCategoryKey) => void
  selectedCategory?: BombCategoryKey
  ready: boolean
}

const ChooseCategory = ({
  onSelectCategory,
  selectedCategory,
  ready,
}: ChooseCategoryProps) => {
  const isRandomSelected = selectedCategory === "RANDOM"

  const randomCategory = {
    name: "عشوائي",
    emoji: "🎲",
  }

  return (
    <section className="flex w-full flex-col gap-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] font-bold tracking-[0.25em] text-copper">
            BOMB GAME
          </p>

          <GenericGuide
            title="القنبلة"
            subtitle="جاوب بسرعة ومرر الموبايل قبل ما القنبلة تنفجر فيك!"
          >
            <BombGameGuide />
          </GenericGuide>
        </div>

        <h1 className="mt-2 text-4xl font-black text-ink">القنبلة</h1>

        <p className="mt-2 text-sm leading-7 text-ink-soft">
          اختار التصنيف، جاوب بسرعة وسلّم الموبايل قبل ما الوقت يخلص!
        </p>
      </div>

      <Separator />

      {/* Categories Selection */}
      <div className="flex flex-col gap-4">
        <h3 className="text-base font-bold text-ink">عايزين تتسألوا في إيه؟</h3>

        {/* Random Category */}
        {!ready ? (
          <div className="flex items-center justify-between gap-3 rounded-xl border-2 border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-lg" />

              <div className="flex flex-col gap-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-3 w-48 max-w-full" />
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onSelectCategory("RANDOM")}
            aria-pressed={isRandomSelected}
            disabled={!ready}
            className={`group relative flex w-full items-center justify-between gap-3 rounded-xl border-2 p-4 text-right transition-all duration-150 active:scale-[0.99] disabled:cursor-wait disabled:opacity-60 ${
              isRandomSelected
                ? "border-primary bg-primary/10 shadow-md shadow-primary"
                : "border-primary/60 bg-primary/10 shadow-md hover:border-primary hover:shadow-primary"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl transition-transform group-hover:scale-110">
                {randomCategory.emoji}
              </span>

              <div className="flex flex-col">
                <span className="text-base font-black text-primary">
                  {randomCategory.name}
                </span>

                <span className="text-xs font-semibold text-ink-soft">
                  أسئلة ميكس وعشوائية من كل التصنيفات
                </span>
              </div>
            </div>
          </button>
        )}

        {/* Regular Categories */}
        {!ready ? (
          <CategoryGridSkeleton />
        ) : (
          <CategoryGrid
            selectedCategory={selectedCategory}
            ready={ready}
            onSelectCategory={onSelectCategory}
          />
        )}
      </div>
    </section>
  )
}

export default ChooseCategory

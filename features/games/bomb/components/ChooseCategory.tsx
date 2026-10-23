"use client"

import GenericGuide from "@/components/ui/GenericGuide"
import { Separator } from "@/components/ui/separator"
import { bombCategories, bombCategoryKeys } from "@/games/bomb/constants"
import type { BombCategoryKey } from "@/games/bomb/types"
import { BombGameGuide } from "./BombGameGuide"

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

        {!ready && (
          <p className="mt-1 text-[11px] font-bold text-copper" role="status">
            جاري تحميل أحدث محتوى...
          </p>
        )}
      </div>

      <Separator />

      {/* Categories Selection */}
      <div className="flex flex-col gap-4">
        <h3 className="text-base font-bold text-ink">عايزين تتسألوا في إيه؟</h3>

        {/* Random Category */}
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

        {/* Regular Categories */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {bombCategoryKeys.map((key) => {
            const categoryData = bombCategories[key]
            const isSelected = selectedCategory === key

            return (
              <button
                key={key}
                type="button"
                onClick={() => onSelectCategory(key)}
                aria-pressed={isSelected}
                disabled={!ready}
                className={`group flex flex-col items-center justify-center gap-2 rounded-md border-2 p-4 text-center transition-all duration-150 last:col-span-2 active:scale-95 disabled:cursor-wait disabled:opacity-60 ${
                  isSelected
                    ? "border-copper bg-copper/10 shadow-[3px_3px_0_var(--color-copper)]"
                    : "border-ink/15 bg-paper shadow-[3px_3px_0_var(--color-ink)] hover:border-copper/60 hover:shadow-[4px_4px_0_var(--color-copper)]"
                }`}
              >
                <span className="text-3xl transition-transform group-hover:scale-110">
                  {categoryData.emoji}
                </span>

                <span
                  className={`text-sm font-bold ${
                    isSelected
                      ? "text-copper"
                      : "text-ink group-hover:text-copper"
                  }`}
                >
                  {categoryData.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default ChooseCategory

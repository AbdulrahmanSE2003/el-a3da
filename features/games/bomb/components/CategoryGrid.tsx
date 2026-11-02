import { bombCategories, bombCategoryKeys } from "@/games/bomb/constants"
import { BombCategoryKey } from "@/games/bomb/types"

type CategoryGridProps = {
  onSelectCategory: (category: BombCategoryKey) => void
  selectedCategory?: BombCategoryKey
  ready: boolean
}

const CategoryGrid = ({ selectedCategory, ready, onSelectCategory }: CategoryGridProps) => {
  return (
    <div className="grid grid-cols-2 gap-3">
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
                isSelected ? "text-copper" : "text-ink group-hover:text-copper"
              }`}
            >
              {categoryData.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default CategoryGrid
